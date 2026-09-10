import { get, set } from 'idb-keyval';
import { firebaseStorageService } from './firebaseStorageService';
import { auth } from '../lib/firebase';
import { ScheduleConfig, StudyEvent, StudySubject } from '../types';
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';

const CONFIG_KEY = 'apse_schedule_config';
const EVENTS_KEY = 'apse_schedule_events'; // completed recurring events, or custom events

export const scheduleService = {
  async getConfig(): Promise<ScheduleConfig | null> {
    if (auth.currentUser) {
      try {
        const remote = await firebaseStorageService.getUserData(auth.currentUser.uid);
        if (remote && remote.scheduleConfig) return remote.scheduleConfig;
      } catch (e) {}
    }
    const data = await get(CONFIG_KEY);
    return data ? JSON.parse(data) : null;
  },

  async saveConfig(config: ScheduleConfig): Promise<void> {
    await set(CONFIG_KEY, JSON.stringify(config));
    if (auth.currentUser) {
      try {
        await firebaseStorageService.saveUserData(auth.currentUser.uid, { scheduleConfig: config });
      } catch (e) {}
    }
  },

  async clearConfig(): Promise<void> {
    await set(CONFIG_KEY, null);
    await set(EVENTS_KEY, JSON.stringify([]));
    if (auth.currentUser) {
      try {
        await firebaseStorageService.saveUserData(auth.currentUser.uid, { scheduleConfig: null, studyEvents: [] });
      } catch (e) {}
    }
  },

  async getEvents(): Promise<StudyEvent[]> {
    if (auth.currentUser) {
      try {
        const remote = await firebaseStorageService.getUserData(auth.currentUser.uid);
        if (remote && remote.studyEvents) return remote.studyEvents;
      } catch (e) {}
    }
    const data = await get(EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async saveEvents(events: StudyEvent[]): Promise<void> {
    await set(EVENTS_KEY, JSON.stringify(events));
    if (auth.currentUser) {
      try {
        await firebaseStorageService.saveUserData(auth.currentUser.uid, { studyEvents: events });
      } catch (e) {}
    }
  },

  async toggleEventCompletion(eventId: string, defaultEvent: StudyEvent): Promise<StudyEvent[]> {
    const events = await this.getEvents();
    const existingIndex = events.findIndex(e => e.id === eventId);
    
    let newEvents = [...events];
    if (existingIndex >= 0) {
      newEvents[existingIndex].completed = !newEvents[existingIndex].completed;
    } else {
      // It was a generated recurring event, now we save its state
      newEvents.push({ ...defaultEvent, completed: !defaultEvent.completed });
    }
    
    await this.saveEvents(newEvents);
    return newEvents;
  },

  async addCustomEvent(event: StudyEvent): Promise<StudyEvent[]> {
    const events = await this.getEvents();
    events.push(event);
    await this.saveEvents(events);
    return events;
  },
  
  // This function blends the base config distribution into a specific date range,
  // applying any overrides/completions from the DB.
  async getEventsForDateRange(startDate: Date, endDate: Date): Promise<StudyEvent[]> {
    const config = await this.getConfig();
    const customEvents = await this.getEvents();
    
    const result: StudyEvent[] = [];
    
    if (config) {
      // Generate recurring events
      let current = startDate;
      while (current <= endDate) {
        const dayOfWeek = current.getDay(); // 0-6
        const dateStr = format(current, 'yyyy-MM-dd');
        
        if (config.daysOfWeek[dayOfWeek]?.active && config.distribution[dayOfWeek]) {
          const subjectsForDay = config.distribution[dayOfWeek];
          
          subjectsForDay.forEach(sub => {
            const eventId = `recurring-${dateStr}-${sub.id}`;
            const override = customEvents.find(e => e.id === eventId);
            
            if (override) {
              result.push(override);
            } else {
              result.push({
                id: eventId,
                title: sub.name,
                subjectId: sub.id,
                color: sub.color,
                date: dateStr,
                completed: false,
                type: 'subject'
              });
            }
          });
        }
        current = addDays(current, 1);
      }
    }
    
    // Add any pure custom events in the range
    const customOnly = customEvents.filter(e => !e.id.startsWith('recurring-'));
    result.push(...customOnly.filter(e => {
      const eDate = new Date(e.date + 'T12:00:00'); // simple parse
      return eDate >= startDate && eDate <= endDate;
    }));
    
    return result;
  }
};
