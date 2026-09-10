import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'motion/react';
import { Check, Star, Zap, Shield, Crown } from 'lucide-react';

import { NavTab } from '../App';

export const PricingSection: React.FC<{ onNavigate?: (tab: NavTab) => void }> = ({ onNavigate }) => {
  const [processingPlan, setProcessingPlan] = useState<'anual' | 'mensal' | null>(null);

  const handleSubscribe = async (isAnnual: boolean) => {
    try {
      setProcessingPlan(isAnnual ? 'anual' : 'mensal');
      const auth = (await import('../lib/firebase')).auth;
      const user = auth.currentUser;
      
      if (!user) {
        alert("Você precisa estar logado para assinar um plano. Vamos te redirecionar para o login.");
        if (onNavigate) {
          onNavigate('profile');
        } else {
          window.dispatchEvent(new CustomEvent('NAVIGATE_TO', { detail: 'profile' }));
        }
        setProcessingPlan(null);
        return;
      }
      
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
      setProcessingPlan(null);
    }
  };

  return (
    <div id="pricing-section" className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white mb-4 tracking-tight">
          Planos de Assinatura para <span className="text-purple-500">Concursos Públicos</span>
        </h2>
        <p className="text-black/60 dark:text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto">
          Tenha acesso completo a todas as ferramentas premium e maximize seus resultados.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
        {/* Plano Mensal Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => handleSubscribe(false)}
          className="relative bg-gradient-to-b from-[#0a1828]/80 to-[#041021]/90 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 rounded-3xl p-8 flex flex-col shadow-xl cursor-pointer group transition-colors"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg border border-white/20">
            Mais Flexível
          </div>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Plano Mensal</h3>
              <p className="text-white/50 text-sm font-medium">Cancele quando quiser</p>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-purple-500/20 transition-colors">
              <Zap className="text-white/80 group-hover:text-purple-400" size={24} />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-white/50 text-2xl font-bold">R$</span>
              <span className="text-white text-5xl font-black tracking-tight">17,99</span>
              <span className="text-white/50 text-sm font-medium">/ mês</span>
            </div>
            <div className="mt-2 inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <span className="text-white/60 text-xs font-bold uppercase tracking-wider">
                Cobrança recorrente mensal
              </span>
            </div>
          </div>

          <ul className="flex flex-col gap-4 flex-1 mb-8">
            <FeatureItem text="Banco de questões atualizadas" />
            <FeatureItem text="Flashcards de repetição espaçada" />
            <FeatureItem text="Cronograma de estudos inteligente" />
            <FeatureItem text="Sistema de agendar erros" />
            <FeatureItem text="Rankings e competições" />
          </ul>

          <button 
            disabled={processingPlan !== null}
            className="w-full py-4 rounded-xl font-bold text-white bg-white/10 group-hover:bg-purple-500/20 transition-colors border border-white/10 group-hover:border-purple-500/50 flex justify-center items-center gap-2"
          >
            <Zap size={18} />
            {processingPlan === 'mensal' ? 'Processando...' : 'Assinar Plano Mensal'}
          </button>
        </motion.div>

        {/* Plano Anual Card - Destaque */}
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => handleSubscribe(true)}
          className="relative bg-gradient-to-b from-[#0b3052] to-[#01142e] backdrop-blur-xl border-2 border-purple-500 rounded-3xl p-8 flex flex-col shadow-[0_20px_50px_rgba(84,172,191,0.2)] cursor-pointer group"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-purple-500 text-[#01142e] text-xs font-black uppercase tracking-widest rounded-full shadow-lg">
            Melhor Custo-Benefício
          </div>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Plano Anual</h3>
              <p className="text-purple-500/80 text-sm font-medium">A escolha mais inteligente</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500/20 transition-colors">
              <Star className="text-amber-400" size={24} />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-white/50 text-2xl font-bold">R$</span>
              <span className="text-white text-5xl font-black tracking-tight">188,88</span>
              <span className="text-white/50 text-sm font-medium">/ ano</span>
            </div>
            <div className="mt-2 inline-block px-3 py-1 bg-amber-400/10 border border-amber-400/20 rounded-full">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                Parcele no cartão de crédito
              </span>
            </div>
          </div>

          <ul className="flex flex-col gap-4 mb-8 flex-1">
            <FeatureItem text="Banco de questões atualizadas" />
            <FeatureItem text="Flashcards de repetição espaçada" />
            <FeatureItem text="Cronograma de estudos inteligente" />
            <FeatureItem text="Sistema de agendar erros" />
            <FeatureItem text="Rankings e competições" />
          </ul>

          <button 
            disabled={processingPlan !== null}
            className="w-full py-4 rounded-xl font-bold text-white bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors border border-purple-500/50 group-hover:border-purple-500 flex justify-center items-center gap-2"
          >
            <Crown size={18} />
            {processingPlan === 'anual' ? 'Processando...' : 'Assinar Plano Anual'}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

const FeatureItem: React.FC<{ text: string }> = ({ text }) => (
  <li className="flex items-center gap-3">
    <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
      <Check size={14} strokeWidth={3} />
    </div>
    <span className="text-white/80 font-medium text-sm">{text}</span>
  </li>
);
