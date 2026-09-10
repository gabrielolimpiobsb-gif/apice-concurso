import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else setTheme('dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-10 h-10 sm:w-12 sm:h-12 bg-[#0a1828] text-white hover:bg-white/5 rounded-full flex items-center justify-center transition-colors ${className}`}
      title={`Alternar tema (Atual: ${theme === 'light' ? 'Claro' : 'Escuro'})`}
    >
      {theme === 'light' && <Sun size={20} className="text-yellow-500" />}
      {theme === 'dark' && <Moon size={20} className="text-blue-400" />}
    </button>
  );
};
