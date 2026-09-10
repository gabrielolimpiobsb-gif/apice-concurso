import React, { useState } from "react";
import { ScheduleConfig, StudySubject } from "../../types";
import { DEFAULT_SUBJECTS, PALETTE } from "./subjects";
import { Plus, Trash2, Settings, ArrowRight, ArrowLeft, MousePointerClick, RefreshCcw } from "lucide-react";
import { cn } from "../../lib/utils";

interface StudyPlanCreationProps {
  onComplete: (config: ScheduleConfig) => void;
}

const WEEK_DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export const StudyPlanCreation: React.FC<StudyPlanCreationProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'automatic' | 'manual'>('automatic');
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);
  
  // Step 1: Subjects
  const [selectedSubjects, setSelectedSubjects] = useState<StudySubject[]>([]);
  const [newSubName, setNewSubName] = useState("");
  const [editingSub, setEditingSub] = useState<StudySubject | null>(null);
  const [selectedSubjectToPlace, setSelectedSubjectToPlace] = useState<StudySubject | null>(null);

  // Step 2: Days
  const [daysOfWeek, setDaysOfWeek] = useState<ScheduleConfig['daysOfWeek']>({
    0: { active: false, hours: 2 },
    1: { active: true, hours: 2 },
    2: { active: true, hours: 2 },
    3: { active: true, hours: 2 },
    4: { active: true, hours: 2 },
    5: { active: true, hours: 2 },
    6: { active: false, hours: 2 },
  });

  // Step 3: Manual Distribution
  const [distribution, setDistribution] = useState<Record<number, StudySubject[]>>({
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  });

  const toggleSubject = (sub: StudySubject) => {
    if (selectedSubjects.find(s => s.id === sub.id)) {
      setSelectedSubjects(selectedSubjects.filter(s => s.id !== sub.id));
      // Remove from distribution if present
      const newDist = { ...distribution };
      Object.keys(newDist).forEach(d => {
        newDist[Number(d)] = newDist[Number(d)].filter(s => s.id !== sub.id);
      });
      setDistribution(newDist);
    setDragOverDay(null);
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleAddCustom = () => {
    if (!newSubName.trim()) return;
    const sub: StudySubject = {
      id: `custom-${Date.now()}`,
      name: newSubName.trim(),
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)]
    };
    setSelectedSubjects([...selectedSubjects, sub]);
    setNewSubName("");
  };

  const generateAutomaticDistribution = () => {
    const newDist: Record<number, StudySubject[]> = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    };
    
    const activeDays = Object.keys(daysOfWeek).map(Number).filter(d => daysOfWeek[d].active);
    if (activeDays.length === 0 || selectedSubjects.length === 0) return newDist;

    // Simple round robin based on hours
    let subjectIdx = 0;
    activeDays.forEach(day => {
      const hours = daysOfWeek[day].hours;
      const subjectsPerDay = Math.max(1, Math.min(hours, 4)); // 1 to 4 subjects depending on hours
      for (let i = 0; i < subjectsPerDay; i++) {
        newDist[day].push(selectedSubjects[subjectIdx % selectedSubjects.length]);
        subjectIdx++;
      }
    });

    return newDist;
  };

  const finish = () => {
    let finalDistribution = distribution;
    if (mode === 'automatic') {
      finalDistribution = generateAutomaticDistribution();
    }
    
    onComplete({
      mode,
      subjects: selectedSubjects,
      daysOfWeek,
      distribution: finalDistribution,
      startDate: Date.now()
    });
  };

  const handleDragStart = (e: React.DragEvent, sub: StudySubject, fromDay?: number, fromIdx?: number) => {
    e.dataTransfer.setData("subject", JSON.stringify(sub));
    if (fromDay !== undefined) {
      e.dataTransfer.setData("fromDay", String(fromDay));
      if (fromIdx !== undefined) e.dataTransfer.setData("fromIdx", String(fromIdx));
    }
  };

  const handleDrop = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    const subjectData = e.dataTransfer.getData("subject");
    if (!subjectData) return;
    const sub = JSON.parse(subjectData) as StudySubject;
    const fromDay = e.dataTransfer.getData("fromDay");
    const fromIdx = e.dataTransfer.getData("fromIdx");

    const newDist = { ...distribution };
    
    if (fromDay) {
      const fd = Number(fromDay);
      if (fd !== day) {
        if (fromIdx !== undefined && fromIdx !== "") {
          const idx = Number(fromIdx);
          newDist[fd] = newDist[fd].filter((_, i) => i !== idx);
        } else {
          // Fallback if fromIdx wasn't set, though it should be now
          const idx = newDist[fd].findIndex(s => s.id === sub.id);
          if (idx !== -1) newDist[fd] = newDist[fd].filter((_, i) => i !== idx);
        }
        newDist[day] = [...newDist[day], sub];
      }
    } else {
      newDist[day] = [...newDist[day], sub];
    }
    
    setDistribution(newDist);
  };

  const removeSubjectFromDay = (day: number, idx: number) => {
    const newDist = { ...distribution };
    newDist[day].splice(idx, 1);
    setDistribution(newDist);
  };

  return (
    <div className="w-full h-full flex flex-col items-center overflow-y-auto px-4 pb-12 relative animate-in fade-in duration-500">
      <div className="w-full max-w-4xl mx-auto flex flex-col mt-4">
        
        {/* Progress header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all", step >= s ? "bg-purple-500 text-white shadow-lg" : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40")}>
                {s}
              </div>
              {s < 3 && <div className={cn("w-8 h-1 rounded-full", step > s ? "bg-purple-500" : "bg-black/5 dark:bg-white/5")} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-6 w-full animate-in slide-in-from-right-4 fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-black text-black dark:text-white">Quais matérias você vai estudar?</h2>
              <p className="text-black/50 dark:text-white/50 text-sm mt-2">Selecione as disciplinas ou adicione novas.</p>
            </div>

            <div className="bg-white dark:bg-[#0a2346] p-6 rounded-[32px] shadow-xl border border-black/5 dark:border-white/5">
              <div className="flex flex-wrap gap-2 mb-8">
                {DEFAULT_SUBJECTS.map(sub => {
                  const isSelected = selectedSubjects.find(s => s.id === sub.id);
                  return (
                    <button
                      key={sub.id}
                      onClick={() => toggleSubject(sub)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                        isSelected 
                          ? "shadow-md scale-105" 
                          : "bg-transparent text-black/60 dark:text-white/60 border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
                      )}
                      style={isSelected ? { backgroundColor: sub.color, color: '#fff', borderColor: sub.color } : {}}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>

              {/* Custom subjects added */}
              {selectedSubjects.filter(s => s.id.startsWith('custom-')).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-black/40 dark:text-white/40 uppercase tracking-widest mb-3">Adicionadas por você</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSubjects.filter(s => s.id.startsWith('custom-')).map(sub => (
                      <div key={sub.id} className="group relative">
                        <div
                          className="px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                          style={{ backgroundColor: sub.color, color: '#fff' }}
                          onClick={() => setEditingSub(sub)}
                        >
                          {sub.name}
                        </div>
                        <button 
                          onClick={() => toggleSubject(sub)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <input 
                  type="text"
                  value={newSubName}
                  onChange={e => setNewSubName(e.target.value)}
                  placeholder="Nome da matéria..."
                  className="flex-1 bg-black/5 dark:bg-white/5 border border-transparent focus:border-purple-500 outline-none px-4 py-3 rounded-xl text-sm text-black dark:text-white font-medium"
                />
                <button onClick={handleAddCustom} className="w-12 h-12 flex items-center justify-center bg-purple-500 text-white rounded-xl hover:bg-purple-500/90">
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)} 
              disabled={selectedSubjects.length === 0}
              className="mt-4 w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.02]"
            >
              Continuar <ArrowRight size={20} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6 w-full animate-in slide-in-from-right-4 fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-black text-black dark:text-white">Dias e Horários</h2>
              <p className="text-black/50 dark:text-white/50 text-sm mt-2">Quais dias da semana você estuda?</p>
            </div>

            <div className="bg-white dark:bg-[#0a2346] p-6 rounded-[32px] shadow-xl border border-black/5 dark:border-white/5 grid gap-4">
              {Object.keys(daysOfWeek).map(dayIdx => {
                const day = Number(dayIdx);
                const config = daysOfWeek[day];
                return (
                  <div key={day} className="flex items-center justify-between p-4 bg-[#f9fafc] dark:bg-[#01142e] rounded-2xl border border-black/5 dark:border-white/5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.active}
                        onChange={e => setDaysOfWeek({...daysOfWeek, [day]: {...config, active: e.target.checked}})}
                        className="w-5 h-5 rounded-md accent-purple-500"
                      />
                      <span className={cn("font-bold", config.active ? "text-black dark:text-white" : "text-black/40 dark:text-white/40")}>
                        {WEEK_DAYS[day]}
                      </span>
                    </label>
                    {config.active && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-black/40 dark:text-white/40 font-bold uppercase">Horas:</span>
                        <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-lg p-1">
                          <button onClick={() => setDaysOfWeek({...daysOfWeek, [day]: {...config, hours: Math.max(1, config.hours - 1)}})} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white dark:hover:bg-black font-bold">-</button>
                          <span className="w-8 text-center font-bold text-purple-500">{config.hours}</span>
                          <button onClick={() => setDaysOfWeek({...daysOfWeek, [day]: {...config, hours: Math.min(12, config.hours + 1)}})} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white dark:hover:bg-black font-bold">+</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setStep(1)} 
                className="w-16 py-4 bg-black/5 dark:bg-white/5 text-black dark:text-white font-bold rounded-2xl flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10"
              >
                <ArrowLeft size={20} />
              </button>
              <button 
                onClick={() => setStep(3)} 
                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                Continuar <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6 w-full animate-in slide-in-from-right-4 fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-black text-black dark:text-white">Formato do Cronograma</h2>
              <p className="text-black/50 dark:text-white/50 text-sm mt-2">Escolha como as matérias serão distribuídas</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode('automatic')}
                className={cn(
                  "p-6 rounded-[24px] border-2 transition-all flex flex-col items-center text-center gap-4",
                  mode === 'automatic' 
                    ? "bg-purple-500/10 border-purple-500 text-purple-500" 
                    : "bg-white dark:bg-[#0a2346] border-black/5 dark:border-white/5 text-black/60 dark:text-white/60 hover:border-black/10 dark:hover:border-white/10"
                )}
              >
                <RefreshCcw size={32} />
                <div>
                  <h3 className="font-bold mb-1">Automático</h3>
                  <p className="text-xs opacity-70">Distribui as matérias de forma inteligente nos dias ativos.</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setMode('manual');
                  setSelectedSubjectToPlace(null);
                }}
                className={cn(
                  "p-6 rounded-[24px] border-2 transition-all flex flex-col items-center text-center gap-4",
                  mode === 'manual' 
                    ? "bg-purple-500/10 border-purple-500 text-purple-500" 
                    : "bg-white dark:bg-[#0a2346] border-black/5 dark:border-white/5 text-black/60 dark:text-white/60 hover:border-black/10 dark:hover:border-white/10"
                )}
              >
                <MousePointerClick size={32} />
                <div>
                  <h3 className="font-bold mb-1">Manual</h3>
                  <p className="text-xs opacity-70">Arraste as matérias para cada dia da semana como preferir.</p>
                </div>
              </button>
            </div>

            {mode === 'manual' && (
              <div className="bg-white dark:bg-[#0a2346] p-6 rounded-[32px] shadow-xl border border-black/5 dark:border-white/5 flex flex-col gap-6">
                <div className="text-xs text-center text-black/50 dark:text-white/50 mb-2">Selecione uma matéria e clique no dia para adicionar</div>
                <div className="flex gap-2 pb-4 overflow-x-auto no-scrollbar border-b border-black/5 dark:border-white/5">
                  {selectedSubjects.map(sub => (
                    <div
                      key={sub.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, sub)}
                      onClick={() => setSelectedSubjectToPlace(sub.id === selectedSubjectToPlace?.id ? null : sub)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold shadow-sm cursor-grab active:cursor-grabbing shrink-0 transition-all",
                        selectedSubjectToPlace?.id === sub.id ? "scale-110 ring-4 ring-purple-500/50 shadow-lg" : "hover:scale-105"
                      )}
                      style={{ backgroundColor: sub.color, color: '#fff' }}
                    >
                      {sub.name}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                  {Object.keys(daysOfWeek).map(dayIdx => {
                    const day = Number(dayIdx);
                    if (!daysOfWeek[day].active) return null;
                    return (
                      <div 
                        key={day}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => handleDrop(e, day)}
                        onClick={() => {
                          if (selectedSubjectToPlace) {
                            const newDist = { ...distribution };
                            newDist[day] = [...newDist[day], selectedSubjectToPlace];
                            setDistribution(newDist);
                          }
                        }}
                        className={cn(
                          "bg-[#f9fafc] dark:bg-[#01142e] rounded-2xl p-4 min-h-[150px] border-2 border-dashed flex flex-col gap-2 transition-colors cursor-pointer",
                          selectedSubjectToPlace ? "border-purple-500/50 bg-purple-500/5 hover:bg-purple-500/10" : "border-black/10 dark:border-white/10"
                        )}
                      >
                        <h4 className="font-bold text-sm text-black/40 dark:text-white/40 uppercase tracking-widest text-center pointer-events-none">{WEEK_DAYS[day]}</h4>
                        {distribution[day].length === 0 ? (
                          <div className="flex-1 flex items-center justify-center text-xs text-black/20 dark:text-white/20 font-medium text-center">
                            Toque aqui para adicionar
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 mt-2">
                            {distribution[day].map((sub, idx) => (
                              <div 
                                key={`${sub.id}-${idx}`}
                                draggable
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  handleDragStart(e, sub, day, idx);
                                }}
                                className="px-3 py-2 rounded-lg text-xs font-bold text-white relative group cursor-grab active:cursor-grabbing shadow-sm z-10"
                                style={{ backgroundColor: sub.color }}
                              >
                                {sub.name}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); removeSubjectFromDay(day, idx); }}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 size={8} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={() => setStep(2)} 
                className="w-16 py-4 bg-black/5 dark:bg-white/5 text-black dark:text-white font-bold rounded-2xl flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10"
              >
                <ArrowLeft size={20} />
              </button>
              <button 
                onClick={finish} 
                className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
              >
                Criar Cronograma
              </button>
            </div>
          </div>
        )}

      </div>
      
      {/* Color Picker Modal */}
      {editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#0a2346] p-6 rounded-[32px] w-full max-w-sm shadow-2xl border border-black/5 dark:border-white/5 animate-in zoom-in-95 fade-in duration-200">
            <h3 className="text-xl font-bold text-black dark:text-white mb-4">Cor da matéria</h3>
            <div className="flex flex-wrap gap-3 mb-6">
              {PALETTE.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    const newSubs = selectedSubjects.map(s => s.id === editingSub.id ? {...s, color} : s);
                    setSelectedSubjects(newSubs);
                    setEditingSub(null);
                  }}
                  className="w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition-transform"
                  style={{ backgroundColor: color, borderColor: editingSub.color === color ? '#fff' : 'transparent', boxShadow: editingSub.color === color ? `0 0 0 2px ${color}` : 'none' }}
                />
              ))}
            </div>
            <button 
              onClick={() => setEditingSub(null)}
              className="w-full py-3 bg-black/5 dark:bg-white/5 text-black dark:text-white font-bold rounded-xl"
            >
              Concluído
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
