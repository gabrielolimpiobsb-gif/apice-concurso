import React, { useState, useEffect } from 'react';
import { useSubscription } from '../lib/useSubscription';
import { X, Crown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

interface PromoBarProps {
  onClickPromo: () => void;
}

export const PromoBar: React.FC<PromoBarProps> = ({ onClickPromo }) => {
  const { isPremium, loading } = useSubscription();
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 14, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (loading) return;

    if (isPremium) {
       setIsVisible(false);
       return;
    }

    setIsVisible(true);

    // Initial end date: 14 days from now if not set
    let endTimeStr = localStorage.getItem('apses_promo_end_time');
    let endTime: number;

    if (!endTimeStr) {
      endTime = new Date().getTime() + 14 * 24 * 60 * 60 * 1000;
      localStorage.setItem('apses_promo_end_time', endTime.toString());
    } else {
      endTime = parseInt(endTimeStr, 10);
      if (endTime < new Date().getTime()) {
        endTime = new Date().getTime() + 14 * 24 * 60 * 60 * 1000;
        localStorage.setItem('apses_promo_end_time', endTime.toString());
      }
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPremium]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  if (!isVisible || isPremium) return null;

  const pad = (num: number) => String(num).padStart(2, '0');

  return (
    <div 
      onClick={onClickPromo}
      className={cn(
        "relative w-full overflow-hidden bg-gradient-to-r from-[#051811] via-[#0a2e1f] to-[#051811]",
        "border-b border-emerald-500/20 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.15)]",
        "h-10 sm:h-12 flex items-center shrink-0 z-[60] transition-all"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
      <div className="absolute inset-0 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors pointer-events-none" />

      <div className="flex-1 overflow-hidden relative flex items-center justify-start h-full mask-image-edges w-full max-w-[calc(100%-200px)] sm:max-w-[calc(100%-250px)]">
        <div className="flex whitespace-nowrap animate-marquee items-center pl-4 sm:pl-8 text-[11px] sm:text-[13px] font-medium text-white/90">
          <span className="flex items-center gap-2">
            <Crown size={14} className="text-amber-400" />
            <span>
              <strong className="text-white">Encontre o seu ápice nos concursos.</strong> Assine o Premium por apenas <strong className="text-black bg-[#FFD700] px-1.5 py-0.5 rounded font-black border border-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.5)]">R$ 15,49</strong><span className="text-[#FFD700] font-bold ml-1">/mês</span>. Oferta especial por tempo limitado.
            </span>
          </span>
          <span className="mx-8 opacity-30 text-xs text-emerald-500">•</span>
          <span className="flex items-center gap-2">
            <Crown size={14} className="text-amber-400" />
            <span>
              <strong className="text-white">Encontre o seu ápice nos concursos.</strong> Assine o Premium por apenas <strong className="text-black bg-[#FFD700] px-1.5 py-0.5 rounded font-black border border-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.5)]">R$ 15,49</strong><span className="text-[#FFD700] font-bold ml-1">/mês</span>. Oferta especial por tempo limitado.
            </span>
          </span>
          <span className="mx-8 opacity-30 text-xs text-emerald-500">•</span>
          <span className="flex items-center gap-2 pr-8">
            <Crown size={14} className="text-amber-400" />
            <span>
              <strong className="text-white">Encontre o seu ápice nos concursos.</strong> Assine o Premium por apenas <strong className="text-black bg-[#FFD700] px-1.5 py-0.5 rounded font-black border border-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.5)]">R$ 15,49</strong><span className="text-[#FFD700] font-bold ml-1">/mês</span>. Oferta especial por tempo limitado.
            </span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 pr-3 sm:pr-6 shrink-0 relative z-10 bg-gradient-to-l from-[#051811] via-[#051811] to-transparent pl-4 sm:pl-8 ml-auto">
        
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] font-bold bg-black/40 px-2 py-1 rounded border border-emerald-500/20">
          <span className="text-white">{pad(timeLeft.days)}d</span>
          <span className="text-white/40">:</span>
          <span className="text-white">{pad(timeLeft.hours)}h</span>
          <span className="text-white/40">:</span>
          <span className="text-white">{pad(timeLeft.minutes)}m</span>
          <span className="text-white/40">:</span>
          <span className="text-amber-400">{pad(timeLeft.seconds)}s</span>
        </div>

        <button className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-3 py-1.5 rounded-full whitespace-nowrap shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform">
          Quero ser Premium
        </button>

        <button 
          onClick={handleClose}
          className="ml-1 sm:ml-2 text-white/40 hover:text-white transition-colors p-1.5 rounded-full hover:bg-black/10 dark:bg-white/10 z-20"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
