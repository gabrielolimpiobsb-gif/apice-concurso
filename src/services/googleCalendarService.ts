import { Task } from "../types";

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
}

export const googleCalendarService = {
  /**
   * Fetch primary calendar events within a date range
   */
  async listEvents(
    token: string,
    timeMin: string, // ISOString
    timeMax: string  // ISOString
  ): Promise<GoogleCalendarEvent[]> {
    try {
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
        timeMin
      )}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao listar eventos do Google Agenda: ${response.statusText}`);
      }

      const data = await response.json();
      return (data.items || []) as GoogleCalendarEvent[];
    } catch (error) {
      console.error("Error listing Google Calendar events:", error);
      throw error;
    }
  },

  /**
   * Create a single event on the Google Calendar
   */
  async createEvent(
    token: string,
    eventData: {
      summary: string;
      description?: string;
      date: string; // YYYY-MM-DD
      time?: string; // HH:MM
      durationMins?: number;
    }
  ): Promise<GoogleCalendarEvent> {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
      let startObj: any = {};
      let endObj: any = {};

      if (eventData.time) {
        // Timed event
        const startDateTime = `${eventData.date}T${eventData.time}:00`;
        const duration = eventData.durationMins || 60;
        
        // Calculate end time
        const [h, m] = eventData.time.split(":").map(Number);
        const startDateObj = new Date(`${eventData.date}T${eventData.time}:00`);
        const endDateObj = new Date(startDateObj.getTime() + duration * 60 * 1000);
        
        const pad = (num: number) => String(num).padStart(2, "0");
        const endYear = endDateObj.getFullYear();
        const endMonth = pad(endDateObj.getMonth() + 1);
        const endDate = pad(endDateObj.getDate());
        const endHours = pad(endDateObj.getHours());
        const endMinutes = pad(endDateObj.getMinutes());
        const endDateTime = `${endYear}-${endMonth}-${endDate}T${endHours}:${endMinutes}:00`;

        startObj = { dateTime: startDateTime, timeZone };
        endObj = { dateTime: endDateTime, timeZone };
      } else {
        // All-day event (end date is exclusive)
        const startDate = new Date(`${eventData.date}T00:00:00`);
        const endDateObj = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        
        const pad = (num: number) => String(num).padStart(2, "0");
        const endYear = endDateObj.getFullYear();
        const endMonth = pad(endDateObj.getMonth() + 1);
        const endDate = pad(endDateObj.getDate());
        const endDateStr = `${endYear}-${endMonth}-${endDate}`;

        startObj = { date: eventData.date };
        endObj = { date: endDateStr };
      }

      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: eventData.summary,
            description: eventData.description || "[Apse Concursos] Meta de Estudos",
            start: startObj,
            end: endObj,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao criar evento: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating Google Calendar event:", error);
      throw error;
    }
  },

  /**
   * Delete a single event
   */
  async deleteEvent(token: string, eventId: string): Promise<void> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok && response.status !== 410 && response.status !== 404) {
        throw new Error(`Erro ao deletar evento: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting Google Calendar event:", error);
      throw error;
    }
  },

  /**
   * Sync a list of cronogram tasks to Google Calendar for a given date range.
   * To prevent duplication, it first deletes existing events that contain "[Apse Concursos]" in their description.
   */
  async syncTasks(
    token: string,
    tasks: Task[],
    timeMin: string, // ISOString
    timeMax: string  // ISOString
  ): Promise<{ added: number; deleted: number }> {
    try {
      // 1. Fetch existing Google Calendar events in this range
      const existingEvents = await this.listEvents(token, timeMin, timeMax);
      
      // 2. Filter existing events that were created by Apse Concursos
      const apseEvents = existingEvents.filter(
        (evt) =>
          evt.description &&
          (evt.description.includes("[Apse Concursos]") || evt.summary.includes("[Apse]"))
      );

      // 3. Delete those existing events to avoid duplication
      let deletedCount = 0;
      for (const evt of apseEvents) {
        await this.deleteEvent(token, evt.id);
        deletedCount++;
      }

      // 4. Extract tasks in this date range
      const minDateStr = timeMin.split("T")[0];
      const maxDateStr = timeMax.split("T")[0];
      const tasksToSync = tasks.filter((t) => t.date >= minDateStr && t.date <= maxDateStr);

      // 5. Create new events for these tasks
      let addedCount = 0;
      for (const task of tasksToSync) {
        const typeLabel =
          task.type === "theory"
            ? "Teoria"
            : task.type === "questions"
            ? "Questões"
            : task.type === "review"
            ? "Revisão"
            : "Estudos";

        const summary = `[Apse] ${typeLabel}: ${task.subject || task.title}`;
        const description = `[Apse Concursos] Meta de Estudos\nMatéria: ${task.subject || "Geral"}\nAtividade: ${task.title}\nStatus: ${task.completed ? "Concluída" : "Pendente"}`;

        await this.createEvent(token, {
          summary,
          description,
          date: task.date,
          time: task.time,
          durationMins: task.cycleHours ? task.cycleHours * 60 : 60,
        });
        addedCount++;
      }

      return { added: addedCount, deleted: deletedCount };
    } catch (error) {
      console.error("Error syncing tasks to Google Calendar:", error);
      throw error;
    }
  },
};
