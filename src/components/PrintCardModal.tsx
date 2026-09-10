import React, { useRef, useState } from 'react';
import { Share2, Download, X, Crown, Target, TrendingUp, Brain } from 'lucide-react';
import html2canvas from 'html2canvas';

interface PrintCardModalProps {
  onClose: () => void;
  user: any;
  stats: {
    totalQuestions: number;
    accuracy: number;
    streak: number;
    avgTime: number;
  };
}

export const PrintCardModal: React.FC<PrintCardModalProps> = ({ onClose, user, stats }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#01142e',
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `meus-status-${user?.displayName?.replace(/\s+/g, '-').toLowerCase() || 'concurseiro'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      console.warn("Houve um erro ao gerar a imagem.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm flex flex-col gap-4">
        
        {/* The Card to be Printed */}
        <div 
          ref={cardRef} 
          className="bg-gradient-to-br from-white dark:from-[#0a2346] to-[#f9fafc] dark:to-[#01142e] rounded-[2rem] border-2 border-purple-500/30 p-6 shadow-[0_0_50px_rgba(84,172,191,0.2)] relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-8">
             <div className="w-16 h-16 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center overflow-hidden">
               {user?.photoURL ? (
                 <img crossOrigin="anonymous" src={user.photoURL} alt="User" className="w-full h-full object-cover" />
               ) : (
                 <Brain className="text-purple-500 w-8 h-8" />
               )}
             </div>
             <div>
                <h2 className="text-xl font-black text-black dark:text-white">{user?.displayName || "Concurseiro"}</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <Target size={12} className="text-purple-500" />
                  <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Usuário Focado</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl p-4 text-center">
              <span className="text-purple-500 text-2xl font-black">{stats.totalQuestions}</span>
              <span className="block text-[9px] text-black dark:text-black/50 dark:text-white/50 font-bold uppercase tracking-widest mt-1">Questões</span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
              <span className="text-emerald-500 text-2xl font-black">{stats.accuracy.toFixed(1)}%</span>
              <span className="block text-[9px] text-emerald-500/70 font-bold uppercase tracking-widest mt-1">Precisão</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
              <span className="text-amber-500 text-2xl font-black">{stats.streak}🔥</span>
              <span className="block text-[9px] text-amber-500/70 font-bold uppercase tracking-widest mt-1">Sequência</span>
            </div>
            <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl p-4 text-center">
              <span className="text-black dark:text-white text-2xl font-black">{Math.round(stats.avgTime)}s</span>
              <span className="block text-[9px] text-black dark:text-black/50 dark:text-white/50 font-bold uppercase tracking-widest mt-1">Tempo Médio</span>
            </div>
          </div>

          <div className="text-center border-t border-black/10 dark:border-white/10 pt-4 mt-2">
             <span className="text-[10px] text-black dark:text-black/30 dark:text-white/30 font-black tracking-[0.2em] uppercase">Ápice Concurso</span>
          </div>
        </div>

        {/* Action Buttons (Not printed) */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full bg-purple-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(84,172,191,0.3)] active:scale-95 transition-all"
          >
            {isGenerating ? "Gerando..." : "Baixar Imagem"} <Download size={18} />
          </button>
          <button 
            onClick={onClose}
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-black/10 dark:bg-white/10 transition-all"
          >
            Cancelar <X size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};
