import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Question, Performance, ScheduleConfig } from "../types";
import { scheduleService } from "../services/scheduleService";
import { StudyPlanCreation } from "./StudyPlan/StudyPlanCreation";
import { StudyPlanFinal } from "./StudyPlan/StudyPlanFinal";

interface StudyPlanScreenProps {
  onBack: () => void;
  onNavigate?: (tab: string) => void;
  performance?: Performance[];
  questions?: any[];
  onStartReview?: (questions: any[]) => void;
}

export const StudyPlanScreen: React.FC<StudyPlanScreenProps> = ({ onBack, performance }) => {
  const [config, setConfig] = useState<ScheduleConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConfig = async () => {
    setLoading(true);
    const saved = await scheduleService.getConfig();
    setConfig(saved);
    setLoading(false);
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleCreate = async (newConfig: ScheduleConfig) => {
    await scheduleService.saveConfig(newConfig);
    setConfig(newConfig);
  };

  const handleRedo = async () => {
    await scheduleService.clearConfig();
    setConfig(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#f9fafc] dark:bg-[#01142e] md:p-6 relative">
      <div className="flex items-center px-4 md:px-0 pt-4 md:pt-0 mb-4 md:mb-6 z-30">
        <button
          onClick={onBack}
          type="button"
          aria-label="Voltar para a tela inicial"
          className="p-2.5 md:p-3 bg-white dark:bg-[#0a2346] rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all text-black dark:text-white shadow-sm border border-black/5 dark:border-white/5 cursor-pointer touch-manipulation flex items-center justify-center"
        >
          <ArrowLeft size={22} className="shrink-0" />
        </button>
      </div>

      <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 h-full">
            <Loader2 className="animate-spin text-purple-500 mb-4" size={40} />
          </div>
        ) : config ? (
          <StudyPlanFinal config={config} onRedo={handleRedo} performance={performance} />
        ) : (
          <StudyPlanCreation onComplete={handleCreate} />
        )}
      </div>
    </div>
  );
};
