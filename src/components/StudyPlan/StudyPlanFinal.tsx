import React, { useState, useEffect } from "react";
import { ScheduleConfig, StudyEvent } from "../../types";
import { scheduleService } from "../../services/scheduleService";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, addDays, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, RotateCcw, X, Info, ArrowLeft } from "lucide-react";
import { cn } from "../../lib/utils";
import confetti from "canvas-confetti";

interface StudyPlanFinalProps {
  config: ScheduleConfig;
  onRedo: () => void;
  performance?: any[]; // optional, if we need it later
}

const WEEK_DAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

export const StudyPlanFinal: React.FC<StudyPlanFinalProps> = ({ config, onRedo }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('week');
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  
  // Custom event modal
  const [isCustomEventOpen, setIsCustomEventOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");

  const loadEvents = async () => {
    // Load events for the current selected window
    const start = addDays(startOfWeek(startOfMonth(currentDate)), -14);
    const end = addDays(endOfWeek(endOfMonth(currentDate)), 14);
    const loaded = await scheduleService.getEventsForDateRange(start, end);
    setEvents(loaded);
  };

  useEffect(() => {
    loadEvents();
  }, [currentDate, config]);

  const toggleEvent = async (event: StudyEvent) => {
    const nextCompleted = !event.completed;
    
    // Check if toggling this event completes all events of the selected day
    const dayStr = event.date;
    const allDayEvents = events.filter(e => e.date === dayStr);
    
    if (nextCompleted) {
      const willAllBeCompleted = allDayEvents.every(e => e.id === event.id ? true : e.completed);
      if (willAllBeCompleted && allDayEvents.length > 0) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ffffff'],
          zIndex: 9999
        });
      }
    }

    // Optimistic UI update for instant responsiveness
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, completed: nextCompleted } : e));
    
    await scheduleService.toggleEventCompletion(event.id, event);
  };

  const handleAddCustomEvent = async () => {
    if (!customTitle.trim()) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const newEvent: StudyEvent = {
      id: `custom-${Date.now()}`,
      title: customTitle,
      date: dateStr,
      completed: false,
      type: 'event',
      color: '#a855f7' // purple default
    };
    await scheduleService.addCustomEvent(newEvent);
    setCustomTitle("");
    setIsCustomEventOpen(false);
    await loadEvents();
  };

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      const newDate = addDays(selectedDate, -7);
      setSelectedDate(newDate);
      setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      const newDate = addDays(selectedDate, 7);
      setSelectedDate(newDate);
      setCurrentDate(newDate);
    }
  };

  const handleDayClick = (cloneDay: Date) => {
    setSelectedDate(cloneDay);
    if (viewMode === 'month') {
      setViewMode('week');
      setCurrentDate(cloneDay); // Sync the header month
    }
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    
    // Determine grid boundaries based on view mode
    const startDate = viewMode === 'month' 
      ? startOfWeek(monthStart, { weekStartsOn: 0 })
      : startOfWeek(selectedDate, { weekStartsOn: 0 });
      
    const endDate = viewMode === 'month'
      ? endOfWeek(monthEnd, { weekStartsOn: 0 })
      : endOfWeek(selectedDate, { weekStartsOn: 0 });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dateStr = format(cloneDay, "yyyy-MM-dd");
        const dayEvents = events.filter(e => e.date === dateStr);
        const isSelected = isSameDay(cloneDay, selectedDate);
        const isCurrentMonth = isSameMonth(cloneDay, viewMode === 'month' ? monthStart : selectedDate);
        const isToday = isSameDay(cloneDay, new Date());
        
        const allCompleted = dayEvents.length > 0 && dayEvents.every(e => e.completed);
        const hasEvents = dayEvents.length > 0;

        days.push(
          <div
            key={cloneDay.toString()}
            onClick={() => handleDayClick(cloneDay)}
            className="flex flex-col items-center justify-center min-h-[60px] sm:min-h-[70px] group relative cursor-pointer hover:bg-white/5 rounded-2xl"
          >
            {isToday && viewMode === 'month' && !isSelected && (
              <span className="absolute top-0 text-[8px] font-black text-purple-400 tracking-widest uppercase">
                Hoje
              </span>
            )}
            
            <div
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-sm sm:text-base font-bold transition-all relative z-10",
                isSelected 
                  ? "bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] scale-110" 
                  : isToday 
                    ? "border-2 border-dotted border-purple-400 text-purple-400 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    : isCurrentMonth 
                      ? "text-[#e4e4e7] hover:bg-white/5" 
                      : "text-[#52525b] hover:bg-white/5"
              )}
            >
              {format(cloneDay, "d")}
            </div>
            
            {/* Dots indicator for events */}
            {hasEvents && !isSelected && (
              <div className="absolute bottom-1 sm:bottom-2 flex gap-1 z-20">
                {allCompleted ? (
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
                ) : (
                   <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
                )}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
    }

    return (
      <div className={cn("grid grid-cols-7 gap-1 sm:gap-2 px-4 sm:px-8", viewMode === 'month' ? 'pb-8' : 'pb-6')}>
        {days}
      </div>
    );
  };


  const renderWeekPreview = () => {
    if (viewMode !== 'week') return null;

    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
    
    const weekDays = [];
    let current = start;
    while (current <= end) {
      const dateStr = format(current, "yyyy-MM-dd");
      const dayEvents = events.filter(e => e.date === dateStr);
      weekDays.push({ date: current, events: dayEvents });
      current = addDays(current, 1);
    }

    return (
      <div className="flex flex-col lg:grid lg:grid-cols-7 gap-1 sm:gap-2 px-4 sm:px-8 py-4 sm:py-6 border-t border-white/5 bg-black/20 lg:min-h-[300px]">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest px-2 mb-2 lg:hidden">Resumo da Semana</h3>
        {weekDays.map(({ date, events: dayEvents }) => (
          <div key={date.toString()} className="flex flex-col gap-2 mb-4 lg:mb-0 lg:px-1">
            <div className="flex items-center gap-2 px-2 lg:hidden">
              <span className="text-sm font-bold text-purple-400 capitalize">{format(date, "EEEE", { locale: ptBR })}</span>
              <span className="text-xs text-white/40">{format(date, "dd/MM")}</span>
            </div>
            <div className="flex flex-col gap-2">
              {dayEvents.length === 0 ? (
                <div className="text-xs text-white/20 px-2 py-3 text-center lg:text-left hidden lg:block">Livre</div>
              ) : (
                dayEvents.map(event => (
                  <div 
                    key={event.id}
                    onClick={() => toggleEvent(event)}
                    className={cn(
                      "p-3 lg:p-2 rounded-xl border transition-all cursor-pointer flex items-center lg:items-start lg:flex-col gap-3 lg:gap-2",
                      event.completed 
                        ? "bg-emerald-500/10 border-emerald-500/20" 
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className={cn(
                          "w-5 h-5 lg:w-4 lg:h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                          event.completed
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-white/20"
                        )}
                        style={!event.completed && event.color ? { borderColor: event.color } : {}}
                      >
                        {event.completed && <CheckCircle2 size={12} className="lg:w-3 lg:h-3" />}
                      </div>
                      <span className={cn(
                        "font-bold text-sm lg:text-xs",
                        event.completed ? "text-white/50 line-through" : "text-white"
                      )}>
                        {event.title}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  const selectedDayEvents = events.filter(e => e.date === selectedDateStr);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      
      {/* Calendar Container matching the reference design */}
      <div className="w-full max-w-md lg:max-w-6xl bg-[#242526] rounded-[40px] shadow-2xl overflow-hidden relative border border-white/5 animate-in zoom-in-95 fade-in duration-500 transition-all">
        
        {/* Purple Top Accent Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-purple-500 rounded-b-full shadow-[0_0_15px_rgba(168,85,247,0.8)]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-8">
          <button 
            onClick={handlePrev}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/80 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3">
              {viewMode === 'week' && (
                <button 
                  onClick={() => setViewMode('month')} 
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide capitalize">
                {format(viewMode === 'month' ? currentDate : selectedDate, "MMM yyyy", { locale: ptBR }).replace('.', '')}
              </h2>
            </div>
            {viewMode === 'week' && (
              <span className="text-[10px] sm:text-xs text-purple-400 font-bold uppercase tracking-widest mt-1">
                Semana Selecionada
              </span>
            )}
          </div>

          <button 
            onClick={handleNext}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/80 hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 px-4 sm:px-8 mb-4">
          {WEEK_DAYS.map(d => (
            <div key={d} className="text-center text-[10px] sm:text-xs font-bold text-white/30 tracking-widest uppercase">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {renderCalendar()}
        {renderWeekPreview()}

        {viewMode === 'week' && (
          <div className="p-4 sm:p-6 border-t border-white/5 bg-black/20 mt-auto">
            {!isCustomEventOpen ? (
              <button 
                onClick={() => setIsCustomEventOpen(true)}
                className="w-full py-4 rounded-2xl border border-dashed border-white/20 text-white/60 font-bold flex items-center justify-center gap-2 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Plus size={20} /> Adicionar Evento na Semana
              </button>
            ) : (
              <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                <input 
                  autoFocus
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="Nome da matéria ou evento..."
                  className="w-full bg-[#1C1C1E] border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsCustomEventOpen(false)}
                    className="flex-1 py-3 bg-white/5 text-white/60 font-bold rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleAddCustomEvent}
                    className="flex-1 py-3 bg-purple-500 text-white font-bold rounded-xl shadow-[0_5px_15px_rgba(168,85,247,0.4)]"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Utilities */}
      <div className="mt-8 flex gap-4">
        <button 
          onClick={onRedo}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-[#0a2346] text-black/60 dark:text-white/60 font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-black/5 dark:border-white/5"
        >
          <RotateCcw size={18} /> Refazer Cronograma
        </button>
      </div>

          </div>
  );
};
