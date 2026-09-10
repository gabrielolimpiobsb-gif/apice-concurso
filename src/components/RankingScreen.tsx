import { getBrazilTodayStr } from "../lib/dateUtils";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Shield, Hexagon, Diamond as DiamondIcon, Crown, Flame, Target, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { firebaseStorageService } from '../services/firebaseStorageService';
import { NavTab } from '../App';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';
import { Performance } from '../types';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { RankConfig, RANKS, getRank, RankTier } from '../lib/ranks';

interface RankingScreenProps {
  onNavigate: (tab: NavTab) => void;
  allPerformance: Performance[];
}

export const RankingScreen: React.FC<RankingScreenProps> = ({ onNavigate, allPerformance }) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'minha_patente' | 'top_global'>('minha_patente');
  const [userSeasonStats, setUserSeasonStats] = useState<any>(null);
  const [globalRankPos, setGlobalRankPos] = useState<number>(0);

  const SEASON_START = new Date("2026-06-22T00:00:00Z").getTime();
  const seasonPerformance = allPerformance.filter(p => new Date(p.answeredAt || 0).getTime() >= SEASON_START);
  const localSeasonCorrectCount = seasonPerformance.filter(p => p.isCorrect).length;

  // Daily XP gamification
  const todayStr = getBrazilTodayStr();
  const currentDailyMissions = allPerformance.filter(p => p.isCorrect && p.answeredAt && getBrazilTodayStr(p.answeredAt) === todayStr).length;
  const targetDailyMissions = 20;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = firebaseStorageService.listenGlobalRanking(async (rankings) => {
      setLeaderboard(rankings);
      
      const userRankIndex = rankings.findIndex(r => r.uid === user.uid);
      if (userRankIndex !== -1) {
        let stats = rankings[userRankIndex];
        setUserSeasonStats(stats);
        setGlobalRankPos(userRankIndex + 1);
      } else {
        setUserSeasonStats(null);
        setGlobalRankPos(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const dbSeasonCount = userSeasonStats?.seasonCorrectCount || 0;
  const correctCount = Math.max(dbSeasonCount, localSeasonCorrectCount);

  // Auto-heal logic if local count is higher than DB count
  useEffect(() => {
    if (user && localSeasonCorrectCount > dbSeasonCount && !loading) {
      const seasonRef = doc(db, `leaderboards/season13/users/${user.uid}`);
      setDoc(seasonRef, {
        uid: user.uid,
        displayName: user.displayName || user.email || 'Usuário',
        photoURL: user.photoURL || '',
        seasonCorrectCount: localSeasonCorrectCount,
        lastUpdated: serverTimestamp()
      }, { merge: true }).catch(console.error);
    }
  }, [user, localSeasonCorrectCount, dbSeasonCount, loading]);
  const { currentRank, nextRank } = getRank(correctCount);

  // Check for rank up on load
  useEffect(() => {
    if (user && userSeasonStats) {
      const lastRankRequiredStr = localStorage.getItem(`lastSeenRank_${user.uid}`);
      const lastRankRequired = lastRankRequiredStr ? parseInt(lastRankRequiredStr, 10) : -1;
      
      if (currentRank.required !== lastRankRequired) {
         localStorage.setItem(`lastSeenRank_${user.uid}`, currentRank.required.toString());
      }
    }
  }, [user, userSeasonStats, currentRank.required]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Crown size={48} className="text-purple-500 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-black dark:text-white mb-2">Acesse o Ranking</h2>
        <p className="text-black dark:text-black/60 dark:text-white/60 mb-6">Crie uma conta para participar das temporadas ranqueadas.</p>
        <button
          onClick={() => onNavigate('profile')}
          className="bg-purple-500 text-white font-bold px-6 py-2 rounded-xl"
        >
          Fazer Login
        </button>
      </div>
    );
  }

  // Progress calculations
  const progressPercent = currentRank === nextRank 
     ? 100 
     : Math.min(100, Math.max(0, ((correctCount - currentRank.required) / (nextRank.required - currentRank.required)) * 100));
  
  const xpLeft = currentRank === nextRank ? 0 : nextRank.required - correctCount;

  // Calculate percent ahead
  let aheadPercent = 0;
  if (leaderboard.length > 0 && globalRankPos > 0) {
     aheadPercent = Math.round(((leaderboard.length - globalRankPos) / leaderboard.length) * 100);
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-32 bg-[#f9fafc] dark:bg-[#01142e]">
      {/* Header Temporada */}
      <header className="bg-gradient-to-b from-white dark:from-[#0a2346] to-[#f9fafc] dark:to-[#01142e] p-6 pb-8 border-b border-purple-500/10 relative overflow-hidden">
        <div className="max-w-2xl mx-auto w-full relative">
          <div className={cn("absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 opacity-30", currentRank.bgGlow)} />
          <div className="flex items-center justify-between relative z-10 mb-6">
            <button
               onClick={() => onNavigate('home')}
               className="w-10 h-10 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl flex items-center justify-center text-black dark:text-white hover:bg-black/10 dark:bg-white/10 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="text-right">
              <h1 className="text-xl font-black tracking-tight text-black dark:text-white uppercase flex items-center gap-2 justify-end">
                 Nova Temporada <Flame size={18} className="text-orange-500" />
              </h1>
              <p className="text-xs text-black dark:text-black/50 dark:text-white/50 font-bold uppercase tracking-widest flex items-center justify-end gap-1 mt-0.5">
                 ⏳ Restam 60 dias
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xl max-w-sm mx-auto relative z-10">
            <button 
              onClick={() => setActiveTab('minha_patente')}
              className={cn("flex-1 py-2 text-sm font-bold rounded-lg transition-all", activeTab === 'minha_patente' ? "bg-purple-500 text-white" : "text-black dark:text-black/50 dark:text-white/50")}
            >
              Minha Patente
            </button>
            <button 
              onClick={() => setActiveTab('top_global')}
               className={cn("flex-1 py-2 text-sm font-bold rounded-lg transition-all", activeTab === 'top_global' ? "bg-purple-500 text-white" : "text-black dark:text-black/50 dark:text-white/50")}
            >
              Top Global
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'minha_patente' ? (
           <motion.div 
             key="minha_patente"
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             className="max-w-2xl mx-auto w-full px-4 py-6"
           >
              {/* Card Principal da Patente */}
              <div className={cn("relative rounded-[2rem] p-8 border shadow-2xl overflow-hidden mb-6", currentRank.border, currentRank.bgGlow)}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                
                <div className="flex flex-col items-center relative z-10 text-center">
                   <motion.div 
                     initial={{ scale: 0.8, rotate: -10 }}
                     animate={{ scale: 1, rotate: 0 }}
                     transition={{ type: 'spring', bounce: 0.5 }}
                     className="relative mb-4"
                   >
                     <div className={cn("absolute inset-0 blur-[20px] opacity-50", currentRank.bgGlow)} />
                     <currentRank.Icon size={80} className={cn("drop-shadow-[0_0_15px_currentColor]", currentRank.color)} strokeWidth={1.5} />
                   </motion.div>
                   
                   <h2 className="text-3xl font-black text-black dark:text-white italic tracking-tighter uppercase mb-1">
                      {currentRank.tier} <span className={currentRank.color}>{currentRank.division}</span>
                   </h2>
                   
                   <p className="text-sm text-black dark:text-black/60 dark:text-white/60 font-bold mb-8">
                     {correctCount} / {nextRank.required} questões corretas
                   </p>

                   {/* Barra de Progresso */}
                   <div className="w-full max-w-xs relative my-2">
                     <div className="h-4 bg-black/40 rounded-full border border-black/10 dark:border-white/10 overflow-hidden relative">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${progressPercent}%` }}
                           className={cn(
                             "h-full transition-colors duration-500", 
                             currentRank.bgColor
                           )}
                        />
                     </div>
                     <div className="flex justify-between text-xs font-bold mt-2">
                        <span className={cn(
                           "transition-colors duration-500",
                           currentRank.color
                        )}>{parseFloat(progressPercent.toFixed(1))}%</span>
                        {xpLeft > 0 ? <span className="text-black/40 dark:text-white/40">Faltam {xpLeft} qts para {nextRank.tier} {nextRank.division}</span> : <span className="text-purple-500">Patente Máxima!</span>}
                     </div>
                   </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                 <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 text-black dark:text-black/50 dark:text-white/50 mb-1">
                       <Target size={14} /> <span className="text-[10px] uppercase font-bold tracking-widest">Questões Season</span>
                    </div>
                    <span className="text-2xl font-black text-black dark:text-white">{correctCount}</span>
                 </div>
                 <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 text-black dark:text-black/50 dark:text-white/50 mb-1">
                       <Trophy size={14} /> <span className="text-[10px] uppercase font-bold tracking-widest">Posição Global</span>
                    </div>
                    <span className="text-2xl font-black text-black dark:text-white">#{globalRankPos || '-'}</span>
                 </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500/20 to-transparent border border-purple-500/20 p-4 rounded-2xl flex items-center justify-between relative overflow-hidden group">
                 <div className="relative z-10">
                    <h4 className="text-purple-500 font-black uppercase text-xs tracking-widest mb-1 shadow-sm">Status Atual</h4>
                    <p className="text-black dark:text-white text-sm font-medium">Você está à frente de <strong className="text-purple-500">{aheadPercent}%</strong> dos usuários!</p>
                 </div>
                 <Flame size={32} className="text-purple-500 opacity-30 relative z-10" />
              </div>

              {/* Missão Diária (Gamificação) */}
              <div className="mt-6 border-t border-black/5 dark:border-white/5 pt-6">
                <h3 className="text-black dark:text-white font-bold mb-4 flex items-center gap-2">
                  Missão Diária <span className="bg-orange-500/20 text-orange-400 text-[10px] px-2 py-0.5 rounded uppercase tracking-widest">Extra XP</span>
                </h3>
                <div className="bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl p-4 flex gap-4 items-center">
                   <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20 shrink-0">
                      <Target size={20} className="text-orange-500" />
                   </div>
                   <div className="flex-1">
                      <h4 className="text-black dark:text-white text-sm font-bold mb-1">Acerte {targetDailyMissions} questões base</h4>
                      <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden w-full mb-1 shadow-inner">
                         <div className={cn(
                             "h-full transition-all duration-500",
                             (currentDailyMissions/targetDailyMissions)*100 < 33 ? "bg-rose-500" :
                             (currentDailyMissions/targetDailyMissions)*100 < 66 ? "bg-amber-400" :
                             "bg-emerald-400"
                           )} 
                           style={{ width: `${(currentDailyMissions/targetDailyMissions)*100}%` }} 
                         />
                      </div>
                      <span className={cn(
                           "text-xs font-bold transition-colors duration-500",
                           (currentDailyMissions/targetDailyMissions)*100 < 33 ? "text-rose-500" : 
                           (currentDailyMissions/targetDailyMissions)*100 < 66 ? "text-amber-500 dark:text-amber-400" : 
                           "text-emerald-600 dark:text-emerald-400"
                      )}>{currentDailyMissions}/{targetDailyMissions}</span>
                   </div>
                </div>
              </div>
           </motion.div>
        ) : (
           <motion.div 
             key="top_global"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 20 }}
             className="max-w-2xl mx-auto w-full px-4 py-4"
           >
              {loading ? (
                 <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                 </div>
              ) : (
                 <div className="space-y-3">
                   {leaderboard.map((player, index) => {
                      const pos = index + 1;
                      const pRank = getRank(player.seasonCorrectCount || 0);
                      const isCurrentUser = player.uid === user.uid;

                      let rankStyle = "bg-white dark:bg-[#0a2346] " + pRank.currentRank.border;
                      
                      return (
                         <div 
                            key={player.uid}
                            className={cn(
                               "relative flex items-center gap-4 p-4 rounded-2xl border overflow-hidden transition-all shadow-sm", 
                               rankStyle, 
                               isCurrentUser ? "ring-2 ring-purple-500 shadow-md transform-gpu scale-[1.01]" : ""
                            )}
                         >
                            <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 opacity-30 pointer-events-none", pRank.currentRank.bgGlow)} />
                            
                            <div className="w-8 text-center shrink-0 relative z-10">
                               <span className={cn("text-xl font-black font-mono", pos === 1 ? "text-yellow-400 drop-shadow-sm" : pos === 2 ? "text-slate-400" : pos === 3 ? "text-amber-600" : pRank.currentRank.color)}>
                                 {pos}º
                               </span>
                            </div>

                            <div className="relative shrink-0 z-10">
                              <div className={cn("w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border-2 bg-white dark:bg-[#0a2346]", pRank.currentRank.color.replace('text-', 'border-'))}>
                                 {player.photoURL ? (
                                   <img src={player.photoURL} alt={player.displayName} className="w-full h-full object-cover" />
                                 ) : (
                                   <User size={24} className={cn("m-auto", pRank.currentRank.color)} />
                                 )}
                              </div>
                              <div className={cn("absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center bg-white dark:bg-[#0a2346] shadow-md border", pRank.currentRank.border)}>
                                <pRank.currentRank.Icon size={14} className={pRank.currentRank.color} />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0 pl-1 relative z-10">
                               <h4 className="text-black dark:text-white font-bold text-base truncate flex items-center gap-2">
                                  {player.displayName}
                                  {isCurrentUser && <span className="bg-purple-500 text-white text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-black shrink-0 shadow-sm">Você</span>}
                               </h4>
                               <div className="flex items-center gap-1.5 mt-0.5">
                                 <span className={cn("text-xs font-black uppercase tracking-widest", pRank.currentRank.color)}>
                                    {pRank.currentRank.tier} {pRank.currentRank.division}
                                 </span>
                               </div>
                            </div>

                            <div className="shrink-0 text-right relative z-10">
                               <span className={cn("block font-black text-2xl leading-none drop-shadow-sm", pRank.currentRank.color)}>{player.seasonCorrectCount || 0}</span>
                               <span className="text-[10px] text-black/50 dark:text-white/50 uppercase font-bold tracking-widest block mt-1">Acertos</span>
                            </div>
                         </div>
                      )
                   })}
                   
                   {leaderboard.length === 0 && (
                      <div className="text-center py-20 text-black dark:text-black/40 dark:text-white/40">
                         <Crown size={48} className="mx-auto mb-4 opacity-20" />
                         <p className="font-bold">Nenhum jogador na temporada ainda.</p>
                      </div>
                   )}
                 </div>
              )}
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

