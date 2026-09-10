import { Trophy, Shield, Hexagon, Diamond as DiamondIcon, Crown, User, LucideIcon } from 'lucide-react';

export type RankTier = 'Bronze' | 'Prata' | 'Ouro' | 'Diamante' | 'Mestre' | 'Iniciante';

export interface RankConfig {
  tier: RankTier;
  division: string;
  required: number;
  color: string;
  bgColor: string;
  border: string;
  bgGlow: string;
  Icon: LucideIcon;
}

export const RANKS: RankConfig[] = [
  // Sem Rank
  { tier: 'Iniciante', division: '', required: 0, color: 'text-slate-500', bgColor: 'bg-slate-500', border: 'border-slate-500/50', bgGlow: 'bg-slate-500/20', Icon: User },
  // Bronze
  { tier: 'Bronze', division: 'V', required: 3, color: 'text-amber-700', bgColor: 'bg-amber-700', border: 'border-amber-700/50', bgGlow: 'bg-amber-700/20', Icon: Hexagon },
  { tier: 'Bronze', division: 'IV', required: 8, color: 'text-amber-700', bgColor: 'bg-amber-700', border: 'border-amber-700/50', bgGlow: 'bg-amber-700/20', Icon: Hexagon },
  { tier: 'Bronze', division: 'III', required: 15, color: 'text-amber-700', bgColor: 'bg-amber-700', border: 'border-amber-700/50', bgGlow: 'bg-amber-700/20', Icon: Hexagon },
  { tier: 'Bronze', division: 'II', required: 25, color: 'text-amber-700', bgColor: 'bg-amber-700', border: 'border-amber-700/50', bgGlow: 'bg-amber-700/20', Icon: Hexagon },
  { tier: 'Bronze', division: 'I', required: 40, color: 'text-amber-700', bgColor: 'bg-amber-700', border: 'border-amber-700/50', bgGlow: 'bg-amber-700/20', Icon: Hexagon },
  // Prata
  { tier: 'Prata', division: 'V', required: 60, color: 'text-slate-300', bgColor: 'bg-slate-300', border: 'border-slate-300/50', bgGlow: 'bg-slate-300/20', Icon: Shield },
  { tier: 'Prata', division: 'IV', required: 90, color: 'text-slate-300', bgColor: 'bg-slate-300', border: 'border-slate-300/50', bgGlow: 'bg-slate-300/20', Icon: Shield },
  { tier: 'Prata', division: 'III', required: 130, color: 'text-slate-300', bgColor: 'bg-slate-300', border: 'border-slate-300/50', bgGlow: 'bg-slate-300/20', Icon: Shield },
  { tier: 'Prata', division: 'II', required: 180, color: 'text-slate-300', bgColor: 'bg-slate-300', border: 'border-slate-300/50', bgGlow: 'bg-slate-300/20', Icon: Shield },
  { tier: 'Prata', division: 'I', required: 240, color: 'text-slate-300', bgColor: 'bg-slate-300', border: 'border-slate-300/50', bgGlow: 'bg-slate-300/20', Icon: Shield },
  // Ouro
  { tier: 'Ouro', division: 'V', required: 320, color: 'text-yellow-400', bgColor: 'bg-yellow-400', border: 'border-yellow-400/50', bgGlow: 'bg-yellow-400/20', Icon: Trophy },
  { tier: 'Ouro', division: 'IV', required: 420, color: 'text-yellow-400', bgColor: 'bg-yellow-400', border: 'border-yellow-400/50', bgGlow: 'bg-yellow-400/20', Icon: Trophy },
  { tier: 'Ouro', division: 'III', required: 550, color: 'text-yellow-400', bgColor: 'bg-yellow-400', border: 'border-yellow-400/50', bgGlow: 'bg-yellow-400/20', Icon: Trophy },
  { tier: 'Ouro', division: 'II', required: 700, color: 'text-yellow-400', bgColor: 'bg-yellow-400', border: 'border-yellow-400/50', bgGlow: 'bg-yellow-400/20', Icon: Trophy },
  { tier: 'Ouro', division: 'I', required: 900, color: 'text-yellow-400', bgColor: 'bg-yellow-400', border: 'border-yellow-400/50', bgGlow: 'bg-yellow-400/20', Icon: Trophy },
  // Diamante
  { tier: 'Diamante', division: 'V', required: 1150, color: 'text-cyan-400', bgColor: 'bg-cyan-400', border: 'border-cyan-400/50', bgGlow: 'bg-cyan-400/20', Icon: DiamondIcon },
  { tier: 'Diamante', division: 'IV', required: 1450, color: 'text-cyan-400', bgColor: 'bg-cyan-400', border: 'border-cyan-400/50', bgGlow: 'bg-cyan-400/20', Icon: DiamondIcon },
  { tier: 'Diamante', division: 'III', required: 1800, color: 'text-cyan-400', bgColor: 'bg-cyan-400', border: 'border-cyan-400/50', bgGlow: 'bg-cyan-400/20', Icon: DiamondIcon },
  { tier: 'Diamante', division: 'II', required: 2200, color: 'text-cyan-400', bgColor: 'bg-cyan-400', border: 'border-cyan-400/50', bgGlow: 'bg-cyan-400/20', Icon: DiamondIcon },
  { tier: 'Diamante', division: 'I', required: 2700, color: 'text-cyan-400', bgColor: 'bg-cyan-400', border: 'border-cyan-400/50', bgGlow: 'bg-cyan-400/20', Icon: DiamondIcon },
  // Mestre
  { tier: 'Mestre', division: '', required: 3500, color: 'text-fuchsia-500', bgColor: 'bg-fuchsia-500', border: 'border-fuchsia-500/50', bgGlow: 'bg-fuchsia-500/20', Icon: Crown }
];

export const getRank = (correctCount: number) => {
  let currentRank = RANKS[0]; // starts at Iniciante (0)
  let nextRank = RANKS[1];

  for (let i = 0; i < RANKS.length; i++) {
    if (correctCount >= RANKS[i].required) {
      currentRank = RANKS[i];
      nextRank = i < RANKS.length - 1 ? RANKS[i + 1] : RANKS[i];
    } else {
      break;
    }
  }

  return { currentRank, nextRank };
};
