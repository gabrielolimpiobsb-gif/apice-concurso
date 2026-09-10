import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Crown, X } from 'lucide-react';

interface PremiumSuccessModalProps {
  onClose: () => void;
}

export const PremiumSuccessModal: React.FC<PremiumSuccessModalProps> = ({ onClose }) => {
  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a855f7', '#FFD700', '#FF8C00']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a855f7', '#FFD700', '#FF8C00']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0a192f] border border-yellow-500/30 rounded-2xl p-8 max-w-sm w-full relative text-center overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black dark:text-black/50 dark:text-white/50 hover:text-black dark:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
          <Crown size={40} className="text-[#0a192f]" />
        </div>

        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Parabéns!</h2>
        <p className="text-black dark:text-black/70 dark:text-white/70 mb-8">
          Sua Assinatura Premium foi ativada com sucesso. Você agora tem acesso ilimitado a todas as ferramentas do ÁPICE.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-[#0a192f] font-bold rounded-xl shadow-lg hover:shadow-yellow-500/25 transition-all"
        >
          Começar a explorar
        </button>
      </motion.div>
    </div>
  );
};
