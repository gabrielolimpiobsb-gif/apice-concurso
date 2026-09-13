import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { X, Crown, CheckCircle2, Zap, ArrowRight, Star } from 'lucide-react';

interface PremiumPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  feature?: string;
}

export const PremiumPaywall: React.FC<PremiumPaywallProps> = ({ 
  isOpen, 
  onClose, 
  title = "Desbloqueie o Próximo Nível", 
  description = "Assine o Premium para ter acesso ilimitado e ferramentas exclusivas e acelerar sua aprovação.",
  feature
}) => {
  
  const { user } = useAuth();
  const handleSubscribe = () => {
    onClose();
    if (!user) {
      window.dispatchEvent(new CustomEvent('NAVIGATE_TO', { detail: 'profile' }));
      return;
    }
    window.dispatchEvent(new CustomEvent('NAVIGATE_TO', { detail: 'home' }));
    setTimeout(() => {
      document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 250);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white dark:bg-[#0a2346]/40 backdrop-blur-sm">
          <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-[#0a2346] w-full max-w-sm rounded-[32px] sm:rounded-3xl shadow-2xl border border-purple-500/20 overflow-hidden relative"
        >
          {/* Header Image/Pattern */}
          <div className="h-24 bg-gradient-to-br from-purple-500/20 to-[#f9fafc] dark:to-[#01142e] relative flex items-center justify-center overflow-hidden border-b border-purple-500/10">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_100%)] from-purple-500"></div>
            </div>
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="bg-purple-500/10 p-3 rounded-full backdrop-blur-md border border-purple-500/30 shadow-[0_0_20px_rgba(84,172,191,0.2)]"
            >
              <Crown className="w-8 h-8 text-purple-500" />
            </motion.div>
            
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 bg-white dark:bg-[#0a2346]/40 hover:bg-white dark:bg-[#0a2346]/60 rounded-full text-black dark:text-black/60 dark:text-white/60 hover:text-black dark:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-black dark:text-white mb-2">{title}</h2>
              <p className="text-black dark:text-black/60 dark:text-white/60 text-sm">
                {description}
              </p>
              {feature && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-white rounded-full text-xs font-bold tracking-wide">
                  <Star className="w-3 h-3 fill-current" />
                  Recurso Premium: {feature}
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6 bg-[#f9fafc] dark:bg-[#01142e]/50 p-4 rounded-2xl border border-black/5 dark:border-white/5">
              <BenefitItem text="Questões comentadas ilimitadas" />
              <BenefitItem text="Cronograma de estudos infinito" />
              <BenefitItem text="Geração Automatizada de Flashcards" />
            </div>

            <div className="text-center mb-5">
              <p className="text-black dark:text-black/60 dark:text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Apenas</p>
              <div className="flex items-center justify-center gap-1 text-green-500">
                 <span className="text-lg font-bold align-top mt-1">R$</span>
                 <span className="text-4xl font-black tracking-tight">15,49</span>
                 <span className="text-xs text-black dark:text-black/40 dark:text-white/40 ml-1">/mês</span>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleSubscribe}
                className="w-full py-3 bg-purple-500 hover:bg-[#4690A0] text-white rounded-xl font-black text-base shadow-[0_0_20px_rgba(84,172,191,0.3)] flex items-center justify-center gap-2 transition-all active:scale-95 group uppercase tracking-wider"
              >
                {!user ? 'Criar Conta Grátis' : 'Assinar Plano Premium'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <p className="text-center text-[10px] text-black dark:text-black/40 dark:text-white/40 mt-4 font-bold uppercase tracking-widest">
              Cancele a qualquer momento
            </p>
          </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const BenefitItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-3">
    <div className="bg-purple-500/20 p-1 rounded-lg shrink-0">
      <CheckCircle2 className="w-4 h-4 text-purple-500" />
    </div>
    <span className="text-black dark:text-black/80 dark:text-white/80 font-bold text-sm">{text}</span>
  </div>
);
