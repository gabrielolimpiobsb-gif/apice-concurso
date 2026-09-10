import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Timer, Lock } from 'lucide-react';

interface PremiumPreviewProps {
  onClick: () => void;
}

export const PremiumPreview: React.FC<PremiumPreviewProps> = ({ onClick }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    return 1 * 3600 + 52 * 60 + 11; // 01:52:11
  });
  const [showPrice, setShowPrice] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const toggleTimer = setInterval(() => {
      setShowPrice(prev => !prev);
    }, 3000);
    return () => clearInterval(toggleTimer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full relative bg-[#121212] border border-[#2A2A2A] rounded-xl p-3 shadow-md group text-left cursor-pointer overflow-hidden flex items-center justify-between gap-3"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center gap-3 z-10 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 border border-black/10 dark:border-white/10">
          <Crown size={16} className="text-[#FFD700]" />
        </div>
        
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-black dark:text-white font-bold text-[11px] sm:text-xs truncate">Desbloqueie o seu ápice</span>
            <div className="relative h-5 sm:h-6 w-32 flex items-center justify-start overflow-hidden">
              <AnimatePresence mode="wait">
                {showPrice ? (
                  <motion.div 
                    key="price"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1 bg-green-500/10 px-1.5 py-[1px] rounded text-green-400"
                  >
                    <span className="text-[9px] font-bold tracking-wider text-black dark:text-white">R$ 15,49</span>
                    <span className="text-[8px] font-bold tracking-wider">/mês</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="timer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1 bg-[#FFD700]/10 px-1.5 py-[1px] rounded text-[#FFD700]"
                  >
                    <Timer size={10} className="animate-pulse" />
                    <span className="text-[9px] font-mono font-bold tracking-wider">{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <p className="text-black dark:text-black/50 dark:text-white/50 text-[9px] sm:text-[10px] font-medium tracking-wide truncate mt-0.5">
            Acesso ilimitado • Rankings • Flashcards
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 z-10 shrink-0">
        <button className="bg-white text-black font-bold text-[9px] sm:text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider hover:bg-gray-200 transition-colors shadow-sm shrink-0">
          Premium
        </button>
      </div>
    </motion.div>
  );
};


