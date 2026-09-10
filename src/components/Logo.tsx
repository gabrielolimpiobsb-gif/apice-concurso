import React from 'react';

export const Logo: React.FC<{ className?: string, imgClassName?: string }> = ({ className = "", imgClassName = "h-40 sm:h-56" }) => {
  return (
    <div className={`flex items-center justify-center shrink-0 select-none ${className}`}>
      <img 
        src="/logo.png" 
        alt="Ápice Concurso" 
        className={`${imgClassName} w-auto object-contain`} 
      />
    </div>
  );
};
