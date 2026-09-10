import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'motion/react';
import { ChevronLeft, Check, Shield, Crown, Zap, ArrowRight, Star } from 'lucide-react';
import { NavTab } from '../App';

interface SalesScreenProps {
  planType: 'anual' | 'mensal';
  onNavigate: (tab: NavTab) => void;
}

export const SalesScreen: React.FC<SalesScreenProps> = ({ planType, onNavigate }) => {
  const isAnnual = planType === 'anual';
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsProcessing(true);
      const auth = (await import('../lib/firebase')).auth;
      const user = auth.currentUser;
      
      // Link de Pagamento Fixo (Hostinger)
      let stripeLink = isAnnual 
        ? "https://buy.stripe.com/5kQ14o4vJdw668Y7CPb7y02" 
        : "https://buy.stripe.com/7sYeVe7HV4ZAcxmcX9b7y01";
      
      // Pre-preenche o email do cliente automaticamente se ele estiver logado
      if (user && user.email) {
        stripeLink += "?prefilled_email=" + encodeURIComponent(user.email);
      }
      
      window.location.href = stripeLink;
    } catch (error) {
      console.error(error);
      alert("Erro ao redirecionar para o provedor de pagamentos.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#f9fafc] dark:bg-[#01142e] text-black dark:text-white pb-20">
      <header className="sticky top-0 z-50 bg-[#f9fafc]/90 dark:bg-[#01142e]/90 backdrop-blur-md border-b border-black/5 dark:border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('home')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold tracking-tight">
            Plano {isAnnual ? 'Anual' : 'Mensal'}
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {isAnnual ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 text-purple-500 text-sm font-black uppercase tracking-widest rounded-full mb-6 border border-purple-500/20">
              <Star size={16} /> Mais Escolhido
            </div>
          ) : (
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 text-black/60 dark:text-white/60 text-sm font-black uppercase tracking-widest rounded-full mb-6 border border-black/10 dark:border-white/10">
              <Zap size={16} /> Mais Flexível
            </div>
          )}
          
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
            Desbloqueie todo o seu <br className="hidden md:block" />
            <span className="text-purple-500">potencial de aprovação</span>
          </h2>
          <p className="text-lg text-black/60 dark:text-white/60 max-w-2xl mx-auto">
            Ao assinar o Plano {isAnnual ? 'Anual' : 'Mensal'}, você garante acesso total e irrestrito a todas as ferramentas que os aprovados usam para chegar ao topo.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#0a1828] rounded-3xl p-8 border border-black/5 dark:border-white/10 shadow-xl"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              O que você recebe:
            </h3>
            <ul className="flex flex-col gap-5">
              <Feature text="Acesso ilimitado ao Banco de Questões" />
              <Feature text="Flashcards com Repetição Espaçada" />
              <Feature text="Simulados Avançados e Ranqueados" />
              <Feature text="Filtros Especiais por Banca e Dificuldade" />
              <Feature text="Análise de Desempenho com IA" />
              {isAnnual && (
                <Feature text="Economia equivalente a 2 meses grátis" highlight />
              )}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-3xl p-8 border-2 shadow-2xl ${isAnnual ? 'bg-gradient-to-b from-[#0b3052] to-[#01142e] border-purple-500' : 'bg-white dark:bg-[#0a1828] border-black/10 dark:border-white/10'}`}
          >
            <div className="text-center mb-8">
              <h3 className={`text-2xl font-bold mb-2 ${isAnnual ? 'text-white' : 'text-black dark:text-white'}`}>
                Resumo do Pedido
              </h3>
              <div className="flex items-baseline justify-center gap-2 mt-6">
                <span className={`text-2xl font-bold ${isAnnual ? 'text-white/50' : 'text-black/50 dark:text-white/50'}`}>R$</span>
                <span className={`text-6xl font-black tracking-tight ${isAnnual ? 'text-white' : 'text-black dark:text-white'}`}>
                  {isAnnual ? '188,88' : '17,99'}
                </span>
                <span className={`text-sm font-medium ${isAnnual ? 'text-white/50' : 'text-black/50 dark:text-white/50'}`}>
                  {isAnnual ? '/ ano' : '/ mês'}
                </span>
              </div>
            </div>

            <div className="w-full relative rounded-xl overflow-hidden mb-6">
              <button 
                onClick={handleSubscribe}
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                  isAnnual 
                    ? 'bg-purple-500 text-[#01142e] hover:bg-purple-500/90' 
                    : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
                }`}
              >
                {isProcessing ? "Processando..." : (isAnnual ? "Assinar Plano Anual" : "Assinar Plano Mensal")}
              </button>
            </div>

            <div className={`mt-6 flex items-center justify-center gap-2 text-[10px] font-bold ${isAnnual ? 'text-white/40' : 'text-black/40 dark:text-white/40'}`}>
              <Shield size={14} className={isAnnual ? 'text-purple-500' : ''} />
              Pagamento 100% Seguro Processado pela Stripe
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const Feature: React.FC<{ text: string, highlight?: boolean }> = ({ text, highlight }) => (
  <li className="flex items-center gap-4">
    <div className={`p-1.5 rounded-full shrink-0 ${highlight ? 'bg-amber-400/20 text-amber-500' : 'bg-purple-500/20 text-purple-500'}`}>
      <Check size={16} strokeWidth={3} />
    </div>
    <span className={`text-base font-medium ${highlight ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-black/80 dark:text-white/80'}`}>{text}</span>
  </li>
);
