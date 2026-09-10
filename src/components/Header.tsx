import React from 'react';
import { User, Bell, Settings } from 'lucide-react';
import { Logo } from './Logo';

export const Header: React.FC<{ userName: string; subtitle: string }> = ({ userName, subtitle }) => {
  return (
    <header className="bg-brand-blue text-black dark:text-white p-6 pb-20 rounded-b-[40px] shadow-lg relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="hidden sm:block border-l border-black/10 dark:border-white/10 pl-3 h-8 self-center" />
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold font-display tracking-tight leading-tight">
              Análise & Diagnóstico
            </h1>
            <p className="text-xs text-black dark:text-black/70 dark:text-white/70 font-medium">{userName} - {subtitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-black/10 dark:bg-white/10 rounded-full hover:bg-black/20 dark:bg-white/20 transition-colors">
            <Bell size={18} />
          </button>
          <button className="p-2 bg-black/10 dark:bg-white/10 rounded-full hover:bg-black/20 dark:bg-white/20 transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
