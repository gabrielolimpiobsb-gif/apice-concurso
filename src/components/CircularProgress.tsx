import React from 'react';

interface CircularProgressProps {
  percentage: number;
  label: string;
  sublabel: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ percentage, label, sublabel }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-32 h-32 transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          className="text-brand-accent transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-slate-800 font-display">{percentage}%</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider leading-tight">{label}</span>
        <span className="text-[10px] text-slate-400 font-medium">{sublabel}</span>
      </div>
    </div>
  );
};
