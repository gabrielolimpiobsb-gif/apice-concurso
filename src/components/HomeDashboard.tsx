import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Play, TrendingUp, Target, Clock, Filter, ArrowRight, ChevronRight, 
  Layers, RotateCcw, Bookmark, Trash2, Trophy, Crown, ArrowUp, 
  ArrowDown, Flame, Menu, X, FileText, BarChart2, Calendar, Sparkles,
  Award, BookOpen, Clock3, Compass, CheckCircle2, ChevronLeft, Zap, HelpCircle,
  Settings, User, Check, ClipboardCheck, MonitorPlay, GraduationCap, History, Bell, Newspaper, Loader2, ShoppingBag,
  DollarSign
} from 'lucide-react';
import { Question, Performance, StudySession } from '../types';
import { useAuth } from '../lib/AuthContext';
import { useSubscription } from '../lib/useSubscription';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { storageService } from '../services/storageService';
import { firebaseStorageService } from '../services/firebaseStorageService';
import { Logo } from './Logo';
import { DesktopFilmReel } from './DesktopFilmReel';
import { MobileFilmReel } from './MobileFilmReel';
import { UserTestimonials } from './UserTestimonials';
import { PricingSection } from './PricingSection';
import { PromoBar } from './PromoBar';
import { ThemeToggle } from './ThemeToggle';
import { NewsGrid } from './NewsGrid';
import { Footer } from './Footer';
import { useSEO } from '../lib/useSEO';

interface HomeDashboardProps {
  questions: Question[];
  performance: Performance[];
  onNavigate: (tab: any, params?: any) => void;
  aiDiagnosis: string | null;
  onStartReview?: (questions: Question[]) => void;
  onResumeSession: (session: StudySession) => void;
  isAffiliate?: boolean;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ 
  questions, 
  performance, 
  onNavigate,
  onResumeSession,
  onStartReview,
  isAffiliate
}) => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();

  // States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [lastFilter, setLastFilter] = useState<any>(null);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [mySeries, setMySeries] = useState<string>('');
  
  const [scheduledIds, setScheduledIds] = useState<string[]>([]);
  const [activeSessions, setActiveSessions] = useState<StudySession[]>([]);
  const [favoriteCourses, setFavoriteCourses] = useState<string[]>([]);
  const [isNavigatingToFilter, setIsNavigatingToFilter] = useState(false);

  useEffect(() => {
    setIsNavigatingToFilter(false);
  }, []);
  
  const CONCURSOS = [
    { id: 'prf', title: 'PRF' },
    { id: 'pf', title: 'PF' },
    { id: 'pcdf', title: 'PCDF' },
    { id: 'cbmdf', title: 'CBMDF' },
    { id: 'pmdf', title: 'PMDF' },
    { id: 'receita', title: 'Receita Federal' },
    { id: 'inss', title: 'INSS' },
    { id: 'bb', title: 'Banco do Brasil' },
    { id: 'caixa', title: 'Caixa Econômica' },
    { id: 'tjdft', title: 'TJDFT' },
    { id: 'trt', title: 'TRT' },
    { id: 'tse', title: 'TSE Unificado' },
  ];

  const scheduledErrorsCount = scheduledIds.length;

  useEffect(() => {
    // Load local storage items for dynamic previews
    const loadedTasks = storageService.getTasks();
    const loadedFilter = storageService.getLastFilter();
    const loadedFavorites = storageService.getFavoriteCourses();
    
    setTasks(loadedTasks || []);
    setLastFilter(loadedFilter || null);

    if (auth.currentUser) {
      firebaseStorageService.syncFlashcards().then(cards => setFlashcards(cards || []));
    } else {
      const loadedFlashcards = storageService.getFlashcards();
      setFlashcards(loadedFlashcards || []);
    }

    setFavoriteCourses(loadedFavorites || []);
    
    const questionIdSet = new Set((questions || []).map(q => q.id));

    // Scheduled Errors
    try {
      const stored = localStorage.getItem('concurso_pro_wrong_scheduled');
      if (stored) {
         const parsed = JSON.parse(stored) as any[];
         const now = Date.now();
         const dueItems = parsed.filter((item: any) => item.scheduledFor && item.scheduledFor <= now);
         const dueIds = dueItems.map((i: any) => i.id);
         
         // ensure they actually exist in the questions database
         const validIds = dueIds.filter(id => questionIdSet.has(id));
         setScheduledIds(validIds);
      }
    } catch(e) {}
    
    // Fetch Active Study Sessions
    firebaseStorageService.getStudySessions('active').then(sessions => {
       if (sessions && sessions.length > 0) {
          // sort by most recent 
          const sorted = sessions.sort((a, b) => {
             const dateA = a.updatedAt || a.createdAt || 0;
             const dateB = b.updatedAt || b.createdAt || 0;
             return dateB - dateA;
          });
          const validSessions = sorted.filter(session => session.questionIds.some(id => questionIdSet.has(id)));
          setActiveSessions(validSessions);
       }
    }).catch(err => console.error(err));
    
    // Fetch Favorites from Firebase
    if (user) {
       firebaseStorageService.getFavoriteCourses().then(favs => {
          if (favs && favs.length > 0) {
             setFavoriteCourses(favs);
             storageService.setFavoriteCourses(favs);
          }
       }).catch(err => console.error(err));
    }
    
  }, [questions, user]);

  useEffect(() => {
    let unsubscribe: any;
    if (user) {
      const initRanking = async () => {
        const series = await firebaseStorageService.syncUserSeries(user.uid, user.displayName || user.email || '', user.photoURL || '');
        setMySeries(series);
        
        unsubscribe = firebaseStorageService.listenSeriesRanking(series, (rankings) => {
          setLeaderboard(rankings);
        });
      };
      initRanking();
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  const [quote] = useState(() => {
    const quotes = [
      "No final, o esforço compensa.",
      "A consistência de hoje é a posse amanhã.",
      "Cada questão é um passo a mais.",
      "Você está mais perto do que imagina.",
      "Seu futuro agradecerá por hoje."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  });

  const userFirstName = user?.displayName ? user.displayName.split(' ')[0] : 'Concurseiro';
  const userInitial = userFirstName.charAt(0).toUpperCase();

  // Performance stats
  let currentStreak = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  
  let continueStreak = true;
  const sortedPerformance = [...performance].sort((a, b) => new Date(b.answeredAt || '').getTime() - new Date(a.answeredAt || '').getTime());
  
  sortedPerformance.forEach((p) => {
    if (p.isCorrect) {
      correctCount++;
      if (continueStreak) currentStreak++;
    } else {
      incorrectCount++;
      continueStreak = false;
    }
  });
  
  const totalAnswers = correctCount + incorrectCount;
  const accuracyPercent = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;
  
  // Dashboard Pie Chart data
  const pieStrokeDasharray = `${accuracyPercent}, 100`;

  // XP / Ranking Mock Data calculation
  // Total XP = Correct * 10 
  const userXP = correctCount * 10;
  const totalQuestionsDb = questions.length;
  
  const getStreakDays = () => {
    if (!performance || performance.length === 0) return 0;
    const uniqueDates = Array.from(new Set(performance.map(p => {
      const d = new Date(p.answeredAt);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }))).sort((a, b) => b.localeCompare(a));
    
    if (uniqueDates.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) return 0;
    
    let expectedDate = new Date(`${uniqueDates[0]}T12:00:00`);
    for (const dateStr of uniqueDates) {
      const expectedStr = `${expectedDate.getFullYear()}-${String(expectedDate.getMonth() + 1).padStart(2, '0')}-${String(expectedDate.getDate()).padStart(2, '0')}`;
      if (dateStr === expectedStr) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };
  const streakDays = getStreakDays();

  const flashcardStats = storageService.getFlashcardStats();
  const flashcardAccRate = flashcardStats.total > 0 ? Math.round((flashcardStats.correct / flashcardStats.total) * 100) : 0;

  const todayStrDate = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  const todayFormatted = (() => {
    const d = new Date();
    const dayName = d.toLocaleDateString('pt-BR', { weekday: 'long' });
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const dateFormatted = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${capitalizedDay}, ${dateFormatted}`;
  })();

  const todayTasks = tasks.filter(t => t.date === todayStrDate && t.subject);
  const todaySubjects = Array.from(new Set(todayTasks.map(t => t.subject)));

  // Flashcards preview
  const previewFlashcard = flashcards.length > 0 ? flashcards[flashcards.length - 1] : null;

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#f9fafc] dark:bg-[#01142e] select-none text-white font-sans">
      
      {/* 2. MAIN HOME CONTENT WITH 3D SCROLL */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar scroll-smooth">
        {/* --- CABEÇALHO DESKTOP --- */}
        <div className="hidden md:flex flex-col fixed top-0 inset-x-0 z-50 pointer-events-auto bg-[#01142e] shadow-md">
          <header className="flex items-center justify-between px-8 py-6 w-full border-none rounded-none shadow-none">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="w-14 h-14 flex items-center justify-center text-white/70 hover:text-white cursor-pointer hover:bg-white/5 rounded-full transition-colors"
              >
                <Menu size={26} strokeWidth={2.5} />
              </button>
              <Logo imgClassName="h-12" />
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button 
                onClick={() => setIsNotificationsOpen(true)}
                className="relative w-12 h-12 bg-[#0a1828] text-white/70 hover:text-white rounded-full flex items-center justify-center transition-colors"
                title={scheduledErrorsCount > 0 ? `${scheduledErrorsCount} notificações` : "Nenhuma notificação"}
              >
                <Bell size={22} className={scheduledErrorsCount > 0 ? "text-white" : ""} />
                {scheduledErrorsCount > 0 && (
                  <span className="absolute top-2 right-2 flex w-3 h-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full w-3 h-3 bg-rose-500 border-2 border-[#0a1828]"></span>
                  </span>
                )}
              </button>
              <button 
                onClick={() => onNavigate('profile')}
                className="w-12 h-12 bg-gradient-to-br from-[#1a2f4a] to-[#0a1828] text-white rounded-full flex items-center justify-center overflow-hidden hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-[0_0_20px_rgba(84,172,191,0.2)]"
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-black text-sm">{userInitial}</span>
                )}
              </button>
            </div>
          </header>
        </div>

        {/* --- CABEÇALHO MOBILE --- */}
        <div className="md:hidden fixed top-0 inset-x-0 z-50 flex flex-col pointer-events-auto transition-all shadow-md bg-[#01142e] w-full">
          <header className="flex items-center justify-between px-5 pt-6 pb-4 w-full border-none rounded-none shadow-none">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="w-12 h-12 flex items-center justify-center text-white/90 hover:text-white cursor-pointer hover:bg-white/10 rounded-full transition-colors -ml-2"
              >
                <Menu size={28} strokeWidth={2.5} />
              </button>
              <Logo imgClassName="h-14 sm:h-16" />
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <button 
                onClick={() => setIsNotificationsOpen(true)}
                className="relative w-10 h-10 sm:w-12 sm:h-12 bg-[#0a1828] text-white/70 hover:text-white rounded-full flex items-center justify-center transition-colors"
                title={scheduledErrorsCount > 0 ? `${scheduledErrorsCount} notificações` : "Nenhuma notificação"}
              >
                <Bell size={20} className={scheduledErrorsCount > 0 ? "text-white" : ""} />
                {scheduledErrorsCount > 0 && (
                  <span className="absolute top-2 right-2 flex w-2.5 h-2.5 sm:w-3 sm:h-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full w-2.5 h-2.5 sm:w-3 sm:h-3 bg-rose-500 border-2 border-[#0a1828]"></span>
                  </span>
                )}
              </button>
              <button 
                onClick={() => onNavigate('profile')}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#1a2f4a] to-[#0a1828] text-white rounded-full flex items-center justify-center overflow-hidden hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-[0_0_20px_rgba(84,172,191,0.2)]"
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-black text-sm">{userInitial}</span>
                )}
              </button>
            </div>
          </header>
        </div>

        {/* Wrapper for scrollable elements with smooth entrance */}
        <div id="dashboard-content" className="relative z-10 flex flex-col w-full pb-0 pt-[100px] md:pt-[105px] bg-gradient-to-b from-[#f9fafc] dark:from-[#01142e] to-[#f0f4f8] dark:to-[#0f3460]">

          {/* DYNAMIC GREETING MAIN */}
          <div className="w-full px-6 mb-6 relative z-20 max-w-7xl mx-auto flex flex-col gap-6">
             <div>
               <h1 className="text-3xl font-bold text-black dark:text-white/90 tracking-tight leading-tight">
                  Olá, <span>{userFirstName}</span>!
               </h1>
               <p className="text-black/60 dark:text-white/60 text-sm mt-1">
                  Pronto para continuar os estudos?
               </p>
             </div>

          </div>

          

          {/* 3. BOTÃO FILTRAR QUESTÕES HORIZONTAL */}
          <div className="w-full px-6 mb-4 mt-4 md:mt-8 relative z-20 max-w-7xl mx-auto">
             <button
                onClick={() => {
                  setIsNavigatingToFilter(true);
                  setTimeout(() => {
                    onNavigate('filter');
                  }, 150);
                }}
                disabled={isNavigatingToFilter}
                className="w-full bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 hover:from-blue-600 hover:via-blue-500 hover:to-cyan-500 text-white px-8 py-5 rounded-2xl font-black tracking-widest uppercase text-sm md:text-base hover:scale-[1.01] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(37,99,235,0.35)] flex items-center justify-between border border-white/20 disabled:opacity-80 cursor-pointer"
             >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    {isNavigatingToFilter ? (
                      <Loader2 size={24} className="animate-spin text-white" />
                    ) : (
                      <Filter size={24} />
                    )}
                  </div>
                  <span>{isNavigatingToFilter ? "Carregando Banco de Questões..." : "Filtrar Questões"}</span>
                </div>
                {isNavigatingToFilter ? (
                  <div className="flex items-center gap-2 text-xs opacity-90 lowercase font-medium tracking-normal">
                    <span>Aguarde</span>
                    <Loader2 size={18} className="animate-spin" />
                  </div>
                ) : (
                  <ArrowRight size={24} className="opacity-80" />
                )}
             </button>
          </div>
          {/* TAXAS E OVERVIEW (MOVIDOS PARA BAIXO DO BOTÃO) */}
          <div className="w-full px-6 mb-8 relative z-20 max-w-7xl mx-auto flex flex-col gap-6">
            {/* MINI OVERVIEW PANEL - ULTRA MINIMALIST */}
            <div className="flex flex-row items-center justify-between md:justify-start md:gap-12 px-2 pb-4 border-b border-black/5 dark:border-white/5">
              
              {/* Questões Feitas */}
              <div className="flex flex-col gap-1 flex-1 md:flex-none">
                <div className="flex items-center gap-1.5 text-black/40 dark:text-white/40">
                  <CheckCircle2 size={12} strokeWidth={2.5} className="text-purple-500 opacity-80" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Questões</span>
                </div>
                <span className="text-xl md:text-2xl font-bold text-black/90 dark:text-white/90 tracking-tight leading-none">
                  {new Set(performance.map(p => p.questionId)).size}
                </span>
              </div>
              
              {/* Sequência de Dias */}
              <div className="flex flex-col gap-1 border-l border-black/5 dark:border-white/5 pl-4 md:pl-12 flex-1 md:flex-none">
                <div className="flex items-center gap-1.5 text-black/40 dark:text-white/40">
                  <Flame size={12} strokeWidth={2.5} className="text-orange-500 opacity-80" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Sequência</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl md:text-2xl font-bold text-black/90 dark:text-white/90 tracking-tight leading-none">
                    {streakDays}
                  </span>
                  <span className="text-[10px] font-bold text-black/30 dark:text-white/30 uppercase tracking-widest">dias</span>
                </div>
              </div>
              
              {/* Matérias do Dia */}
              <div className="hidden sm:flex flex-col gap-1 border-l border-black/5 dark:border-white/5 pl-4 md:pl-12">
                <div className="flex items-center gap-1.5 text-black/40 dark:text-white/40">
                  <Calendar size={12} strokeWidth={2.5} className="text-purple-500 opacity-80" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Matérias Hoje</span>
                </div>
                <span className="text-sm font-semibold text-black/70 dark:text-white/70 tracking-tight leading-tight max-w-[200px] truncate">
                  {todaySubjects.length > 0 ? todaySubjects.join(', ') : "Livre"}
                </span>
              </div>

            </div>
            {/* Mobile Only: Matérias */}
            <div className="sm:hidden flex items-center gap-2 px-2 mt-[-10px] text-xs">
              <span className="text-black/40 dark:text-white/40 font-bold uppercase tracking-widest text-[9px]">Matérias:</span>
              <span className="text-black/70 dark:text-white/70 font-semibold truncate flex-1">
                {todaySubjects.length > 0 ? todaySubjects.join(', ') : "Nenhuma hoje"}
              </span>
            </div>
          </div>

          {/* DESKTOP LAYOUT (Landing page style) */}
          <div className="hidden md:block w-full mt-2 relative z-20 mb-16">
            <DesktopFilmReel onNavigate={onNavigate} />
          </div>

          {/* MOBILE LAYOUT (Film Reel mobile view) */}
          <div className="md:hidden w-full relative z-20 mt-2 mb-12">
            <MobileFilmReel onNavigate={onNavigate} />
          </div>


          <NewsGrid onNavigate={onNavigate} />

          {/* Pricing Section (Informativo de Preços) */}
          <PricingSection onNavigate={onNavigate} />

          {/* Depoimentos de Usuários */}
          <UserTestimonials />

          {/* Legal Footer */}
          <Footer onNavigate={onNavigate} />

        </div>
      </div>

      {/* --- MENU OVERLAY (MANTER ORIGINAL) --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <React.Fragment>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsMenuOpen(false)}
               className="fixed inset-0 bg-[#f9fafc] dark:bg-[#01142e]/80 backdrop-blur-md z-40"
            />
            <motion.div 
               initial={{ x: '-100%' }}
               animate={{ x: 0 }}
               exit={{ x: '-100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#f9fafc] dark:bg-[#01142e] shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col border-r border-white/5"
            >
               <div className="p-6 flex items-center justify-between border-b border-white/5">
                 <Logo imgClassName="h-16" />
                 <button onClick={() => setIsMenuOpen(false)} className="text-black dark:text-black/50 dark:text-white/50 hover:text-white p-2">
                   <X size={24} />
                 </button>
               </div>
               <nav className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
                  <button onClick={() => { setIsMenuOpen(false); onNavigate('study-plan'); }} className="flex items-center gap-4 text-black dark:text-black/80 dark:text-white/80 hover:text-white hover:bg-white/5 w-full text-left p-4 rounded-xl transition-colors font-bold cursor-pointer">
                    <Calendar className="w-5 h-5 text-white" /> Cronograma
                  </button>
                 <button onClick={() => { setIsMenuOpen(false); onNavigate('blog'); }} className="flex items-center gap-4 text-black dark:text-black/80 dark:text-white/80 hover:text-white hover:bg-white/5 w-full text-left p-4 rounded-xl transition-colors font-bold cursor-pointer">
                   <Newspaper size={20} className="text-white" /> Blog e Notícias
                 </button>
                  <button onClick={() => { setIsMenuOpen(false); onNavigate('flashcards'); }} className="flex items-center gap-4 text-black dark:text-black/80 dark:text-white/80 hover:text-white hover:bg-white/5 w-full text-left p-4 rounded-xl transition-colors font-bold cursor-pointer">
                    <Layers size={20} className="text-white" /> Flashcards
                  </button>
                 <button onClick={() => { setIsMenuOpen(false); onNavigate('packs-store'); }} className="flex items-center gap-4 text-black dark:text-black/80 dark:text-white/80 hover:text-white hover:bg-white/5 w-full text-left p-4 rounded-xl transition-colors font-bold cursor-pointer">
                   <ShoppingBag size={20} className="text-white" /> Pacotes Prontos
                 </button>
                 <button onClick={() => { setIsMenuOpen(false); onNavigate('ranking'); }} className="flex items-center gap-4 text-black dark:text-black/80 dark:text-white/80 hover:text-white hover:bg-white/5 w-full text-left p-4 rounded-xl transition-colors font-bold cursor-pointer">
                   <Trophy size={20} className="text-white" /> Ranking
                 </button>
                 <button onClick={() => { setIsMenuOpen(false); onNavigate('filter'); }} className="flex items-center gap-4 text-black dark:text-black/80 dark:text-white/80 hover:text-white hover:bg-white/5 w-full text-left p-4 rounded-xl transition-colors font-bold cursor-pointer">
                   <Filter size={20} className="text-white" /> Filtro de Questões
                 </button>
                 <button onClick={() => { setIsMenuOpen(false); onNavigate('analytics'); }} className="flex items-center gap-4 text-black dark:text-black/80 dark:text-white/80 hover:text-white hover:bg-white/5 w-full text-left p-4 rounded-xl transition-colors font-bold cursor-pointer">
                   <BarChart2 size={20} className="text-white" /> Desempenho
                 </button>
                 <button onClick={() => { setIsMenuOpen(false); onNavigate('filter', { filterTab: 'avancado' }); }} className="flex items-center gap-4 text-black dark:text-black/80 dark:text-white/80 hover:text-white hover:bg-white/5 w-full text-left p-4 rounded-xl transition-colors font-bold cursor-pointer">
                   <FileText size={20} className="text-white" /> Cursos e Simulados
                 </button>
                 {isAffiliate && (
                   <button 
                     onClick={() => { setIsMenuOpen(false); onNavigate('affiliate-portal'); }} 
                     className="flex items-center gap-4 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 w-full text-left p-4 rounded-xl transition-colors font-bold cursor-pointer border border-emerald-500/25 shadow-sm mt-2"
                   >
                     <DollarSign size={20} className="text-emerald-400 shrink-0" /> Área do Afiliado
                   </button>
                 )}
               </nav>
            </motion.div>
          </React.Fragment>
        )}
        {isNotificationsOpen && (
          <React.Fragment>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-auto"
               onClick={() => setIsNotificationsOpen(false)}
            />
            <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: "spring", bounce: 0, duration: 0.4 }}
               className="fixed top-0 right-0 bottom-0 w-[90%] max-w-md bg-white dark:bg-[#0a2346] border-l border-purple-500/20 z-50 flex flex-col pointer-events-auto shadow-2xl"
            >
               <div className="p-6 border-b border-purple-500/10 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <Bell size={20} className="text-purple-500" /> Notificações
                    </h2>
                    <p className="text-xs text-purple-500/60 mt-1 uppercase tracking-widest font-bold">
                       Seus avisos de estudo
                    </p>
                  </div>
                  <button 
                     onClick={() => setIsNotificationsOpen(false)}
                     className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black dark:text-black/50 dark:text-white/50 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                  >
                     <X size={20} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {scheduledErrorsCount > 0 ? (
                     <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none">
                         <Layers size={120} />
                       </div>
                       <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/10 flex items-center justify-center text-purple-500 mb-4 shadow-inner relative z-10">
                          <RotateCcw size={22} />
                       </div>
                       <h3 className="text-white font-bold mb-1 text-lg relative z-10">Revisão Espaçada Pendente</h3>
                       <p className="text-sm text-black dark:text-black/60 dark:text-white/60 mb-6 leading-relaxed relative z-10">
                         Você tem <strong className="text-white">{scheduledErrorsCount} {scheduledErrorsCount === 1 ? 'questão' : 'questões'}</strong> aguardando revisão.
                       </p>
                       <button
                         onClick={() => {
                           setIsNotificationsOpen(false);
                           if (onStartReview) {
                             const reviewQs = (questions || []).filter(q => scheduledIds.includes(q.id));
                             if (reviewQs.length > 0) {
                               onStartReview(reviewQs);
                             }
                           }
                         }}
                         className="w-full py-4 bg-purple-500 hover:brightness-110 text-white font-black rounded-xl transition-all cursor-pointer relative z-10"
                       >
                         Iniciar Revisão Agora
                       </button>
                     </div>
                  ) : (
                     <div className="py-16 flex flex-col items-center justify-center text-center opacity-70">
                        <div className="w-20 h-20 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black dark:text-black/20 dark:text-white/20 mb-6">
                          <Bell size={32} />
                        </div>
                        <h4 className="text-white font-bold text-lg">Nenhuma notificação</h4>
                        <p className="text-black dark:text-black/40 dark:text-white/40 text-sm mt-2 max-w-[240px]">Você está em dia com seus estudos. Continue avançando!</p>
                     </div>
                  )}
               </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>

    </div>
  );
};

// ----------------------------------------------------
// Reusable Structural Components
// ----------------------------------------------------

function Section({ 
  title, 
  subtitle, 
  description, 
  buttonText, 
  buttonIcon, 
  onClick, 
  visual, 
  reverse, 
  themeColor,
  containerRef
}: any) {
  
  return (
    <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 min-h-[40vh] lg:min-h-[70vh] flex flex-col justify-center items-center relative py-8 lg:py-12">
      <div className={cn(
        "flex flex-col gap-8 lg:gap-24 items-center w-full", 
        reverse ? "lg:flex-row-reverse" : "lg:flex-row"
      )}>
        
        {/* Content Side */}
        <motion.div 
          initial={{ opacity: 1, x: reverse ? 50 : -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 flex flex-col justify-center max-w-xl z-20 w-full"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-[2px]" style={{ backgroundColor: themeColor }} />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]" style={{ color: themeColor }}>
              {subtitle}
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
            {title}
          </h2>
          
          <p className="text-purple-500/60 text-base md:text-lg font-medium leading-relaxed mb-10">
            {description}
          </p>
          
          <button 
            onClick={onClick}
            className="group w-full sm:w-auto relative inline-flex h-14 md:h-16 items-center justify-center overflow-hidden rounded-full bg-[#f9fafc] dark:bg-[#01142e] px-8 font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
          >
            <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ backgroundColor: themeColor }} />
            <div className="flex items-center gap-3 z-10">
              {buttonIcon}
              <span className="text-sm md:text-base">{buttonText}</span>
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
            </div>
            
            {/* Glow effect outline */}
            <div className="absolute inset-px rounded-full" style={{ boxShadow: `inset 0 0 20px ${themeColor}20` }} />
          </button>
        </motion.div>

        {/* Visual Side */}
        <motion.div 
          initial={{ opacity: 1, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex-1 w-full flex justify-center items-center z-10"
        >
          {visual}
        </motion.div>

      </div>
    </div>
  );
}

// ----------------------------------------------------
// UI Helper: Floating Elements for Parallax
// ----------------------------------------------------
function FloatingElement({ children, delay = 0, yOffset = 20, xOffset = 0, className }: any) {
  return (
    <motion.div 
      className={cn("absolute", className)}
      initial={{ y: 0, x: 0 }}
      animate={{ 
        y: [0, yOffset, 0],
        x: [0, xOffset * 0.1, 0] // subtle x sway
      }}
      transition={{ 
        duration: 4 + Math.random() * 2, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay 
      }}
    >
      {children}
    </motion.div>
  );
}

