import React, { useState, useEffect } from 'react';
import { CircularProgress } from './components/CircularProgress';
import { SubjectChart } from './components/SubjectChart';
import { QuestionsScreen } from './components/QuestionsScreen';
import { FilterScreen } from './components/FilterScreen';
import { HomeDashboard } from './components/HomeDashboard';
import { ProfileScreen } from './components/ProfileScreen';
import { StudyPlanScreen } from './components/StudyPlanScreen';
import { FlashcardsScreen } from './components/FlashcardsScreen';
import { RankingScreen } from './components/RankingScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { AdminPanel } from "./components/admin/AdminPanel";
import { BlogScreen } from "./components/BlogScreen";
import { SalesScreen } from "./components/SalesScreen";
import { storageService } from './services/storageService';
import { firebaseStorageService } from './services/firebaseStorageService';
import { useAuth } from './lib/AuthContext';
import { useSubscription } from './lib/useSubscription';
import { Login } from './components/Login';
import { Question, Performance, DisciplineStats, SavedFilter, StudySession } from './types';
import { MOCK_QUESTIONS } from './mockData';
import { BrainCircuit, BarChart2, XCircle, Trophy, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from './services/geminiService';
import { cn } from './lib/utils';
import { getRank, RankConfig } from './lib/ranks';
import { PremiumSuccessModal } from './components/PremiumSuccessModal';
import { Logo } from './components/Logo';

import confetti from 'canvas-confetti';

export type NavTab = 'home' | 'questions' | 'filter' | 'profile' | 'study-plan' | 'flashcards' | 'ranking' | 'analytics' | 'admin' | 'blog' | 'sales-anual' | 'sales-mensal';


export const tabToUrlMap: Record<NavTab, string> = {
  'home': '/',
  'questions': '/questoes',
  'filter': '/filtro',
  'profile': '/perfil',
  'study-plan': '/cronograma',
  'flashcards': '/flashcards',
  'ranking': '/ranking',
  'analytics': '/desempenho',
  'admin': '/admin',
  'blog': '/blog',
  'sales-anual': '/plano-anual',
  'sales-mensal': '/plano-mensal'
};

export const urlToTabMap: Record<string, NavTab> = Object.entries(tabToUrlMap).reduce((acc, [tab, url]) => {
  acc[url] = tab as NavTab;
  return acc;
}, {} as Record<string, NavTab>);

function getTabInfoFromUrl(): { tab: NavTab, params?: any } {
  const path = window.location.pathname;
  if (path.startsWith('/blog-')) {
     const postId = path.replace('/blog-', '');
     return { tab: 'blog', params: { postId } };
  }
  if (path.startsWith('/flashcards-')) {
     const slug = path.replace('/flashcards-', '');
     let packId = `pack_${slug}`;
     if (slug === 'prf') packId = 'pack_prf_agente';
     return { tab: 'flashcards', params: { viewingPack: packId } };
  }
  return { tab: urlToTabMap[path] || 'home' };
}

function getTabFromUrl(): NavTab {
  return getTabInfoFromUrl().tab;
}

export default function App() {
  const { loading, user } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#f9fafc] dark:bg-[#01142e] flex flex-col items-center justify-center p-4">
        <motion.div 
          animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Logo imgClassName="h-24 sm:h-32" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden">
      <ErrorBoundary>
        <MainApp />
      </ErrorBoundary>
    </div>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-black dark:text-white bg-red-900 mx-auto mt-20 max-w-lg rounded-xl shadow-2xl z-[9999] relative">
          <h2 className="text-xl font-bold mb-4 w-full">Um erro ocorreu no app:</h2>
          <pre className="text-sm bg-black/50 p-4 rounded overflow-auto whitespace-pre-wrap">{this.state.error?.message}</pre>
          <pre className="text-xs text-black dark:text-black/50 dark:text-white/50 bg-black/50 p-4 mt-4 rounded overflow-auto whitespace-pre-wrap">{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}


function MainApp() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useSubscription();
  const initialRoute = getTabInfoFromUrl();
  const [activeTab, setActiveTab] = useState<NavTab>(initialRoute.tab);
  const [navHistory, setNavHistory] = useState<{tab: NavTab, params?: any}[]>([initialRoute]);
  // We'll store initial post id into a global var or derived state, but actually we can just use navHistory[0].params
  // to pass it to BlogScreen, or we can add a specific state.
  const [direction, setDirection] = useState(1);
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [targetCourseId, setTargetCourseId] = useState<string | null>(null);
  const [targetLessonId, setTargetLessonId] = useState<string | null>(null);
  const [targetBlogId, setTargetBlogId] = useState<string | null>(initialRoute.tab === 'blog' && initialRoute.params?.postId ? initialRoute.params.postId : null);
  const [sessionFilterConfig, setSessionFilterConfig] = useState<Partial<SavedFilter> | undefined>(undefined);
  const [targetFilterTab, setTargetFilterTab] = useState<'simples' | 'avancado' | 'scheduled' | 'saved' | 'cursos' | undefined>(undefined);
  const [performance, setPerformance] = useState<Performance[]>([]);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = useState<string | null>(null);
  const [rankUpNotification, setRankUpNotification] = useState<RankConfig | null>(null);
  const [showPremiumSuccessModal, setShowPremiumSuccessModal] = useState(false);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    if (user && performance.length > 0) {
       const SEASON_START = new Date("2026-06-22T00:00:00Z").getTime();
       const seasonPerformance = performance.filter(p => new Date(p.answeredAt || 0).getTime() >= SEASON_START);
       const correctCount = seasonPerformance.filter(p => p.isCorrect).length;
       const { currentRank } = getRank(correctCount);
       
       const lastRankRequiredStr = localStorage.getItem(`global_lastRank_${user.uid}`);
       const lastRankRequired = lastRankRequiredStr ? parseInt(lastRankRequiredStr, 10) : -1;

       // Important: we only show notification if it's an actual rank UP (required is greater)
       if (lastRankRequired !== -1 && currentRank.required > lastRankRequired) {
          setRankUpNotification(currentRank);
          
          const duration = 10 * 1000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 };

          const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

          const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
              return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
              ...defaults, particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
              colors: ['#a855f7', '#ffffff', '#FFD700', '#fbbf24', '#60a5fa']
            });
            confetti({
              ...defaults, particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
              colors: ['#a855f7', '#ffffff', '#FFD700', '#fbbf24', '#60a5fa']
            });
          }, 250);
       }

       if (currentRank.required !== lastRankRequired) {
          localStorage.setItem(`global_lastRank_${user.uid}`, currentRank.required.toString());
       }
    }
  }, [user, performance]);

  useEffect(() => {
    // Initial state for history
    if (!window.history.state || !window.history.state.isAppNav) {
        window.history.replaceState({ isAppNav: true, initial: true, tab: getTabFromUrl() }, '', tabToUrlMap[getTabFromUrl()]);
    }

    const handlePopState = (e: PopStateEvent) => {
        handleTabChange('back', { fromPopState: true, targetTab: getTabFromUrl() });
    };
    window.addEventListener('popstate', handlePopState);

    const handleNavigationEvent = (e: any) => {
       if (e.detail) {
         handleTabChange(e.detail as NavTab);
       }
    };
    window.addEventListener('NAVIGATE_TO', handleNavigationEvent);
    
    // Handle Invite Links
    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get('invite') || params.get('ref');
    if (inviteCode) {
      sessionStorage.setItem('inviteCode', inviteCode);
      setInviteInfo(inviteCode);
      // Clean up URL without reload
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('NAVIGATE_TO', handleNavigationEvent);
    };
  }, []);

  const handleTabChange = (newTab: NavTab | 'back', params?: any) => {
    if (newTab !== 'back' && !user && ['questions', 'analytics', 'study_plan', 'flashcards', 'ranking', 'admin'].includes(newTab)) {
      console.warn("Crie uma conta ou faça login para acessar esta funcionalidade.");
      newTab = 'profile';
    }

    if (newTab === 'back') {
      setNavHistory(prev => {
        const newHistory = prev.length > 1 ? prev.slice(0, -1) : [{ tab: 'home' as NavTab }];
        const prevRoute = newHistory[newHistory.length - 1];
        const target = (params?.fromPopState && params?.targetTab) ? params.targetTab : (prevRoute.tab || 'home');
        setActiveTab(target);
        setDirection(-1);
        
        if (prevRoute.params && prevRoute.params.courseId) {
          setTargetCourseId(prevRoute.params.courseId);
        } else {
          setTargetCourseId(null);
        }
        if (prevRoute.params && prevRoute.params.lessonId) {
          setTargetLessonId(prevRoute.params.lessonId);
        } else {
          setTargetLessonId(null);
        }
        if (prevRoute.params && prevRoute.params.filter) {
          setSessionFilterConfig(prevRoute.params.filter);
        } else {
          setSessionFilterConfig(undefined);
        }
        if (prevRoute.tab === 'blog' && prevRoute.params?.postId) {
          setTargetBlogId(prevRoute.params.postId);
        } else {
          setTargetBlogId(null);
        }

        const url = tabToUrlMap[target] || '/';
        if (!params?.fromPopState) {
          window.history.replaceState({ isAppNav: true, tab: target }, '', url);
        }

        return newHistory;
      });
      return;
    }

    if (newTab === activeTab && !params) {
      if (activeTab === 'blog' && targetBlogId !== null) {
          setTargetBlogId(null);
          window.history.pushState({ isAppNav: true, tab: newTab }, '', tabToUrlMap['blog']);
      }
      return;
    }
    
    // forward navigation
    if (!params?.fromPopState) {
      let url = tabToUrlMap[newTab as NavTab] || '';
      if (newTab === 'blog' && params?.postId) {
         url = '/blog-' + params.postId;
      }
      if (newTab === 'flashcards' && params?.viewingPack) {
         let slug = params.viewingPack.replace('pack_', '');
         if (params.viewingPack === 'pack_prf_agente') slug = 'prf';
         url = '/flashcards-' + slug;
      }
      window.history.pushState({ isAppNav: true, tab: newTab }, '', url);
    }
    setNavHistory(prev => [...prev, {tab: newTab as NavTab, params}]);

    if (params && params.filterTab) {
        setTargetFilterTab(params.filterTab);
    } else {
        setTargetFilterTab(undefined);
    }
    if (newTab === 'blog' && params?.postId) {
        setTargetBlogId(params.postId);
    } else {
        setTargetBlogId(null);
    }
    if (params && params.courseId) {
        setTargetCourseId(params.courseId);
    } else {
        setTargetCourseId(null);
    }
    if (params && params.lessonId) {
        setTargetLessonId(params.lessonId);
    } else {
        setTargetLessonId(null);
    }
    setDirection(1); // Default simple direction
    setActiveTab(newTab as NavTab);
  };

  useEffect(() => {
    let unsubscribe = () => {};

    const initializeData = async () => {
      try {
        if (user) {
          await firebaseStorageService.ensureUserExists();
          
          // Check for Stripe success
          const urlParams = new URLSearchParams(window.location.search);
          
          if (urlParams.get('flashcard_success') === 'true') {
            const packId = urlParams.get('packId');
            if (packId) {
              const uid = user.uid;
              const packsKey = `apses_owned_packs_${uid}`;
              const saved = localStorage.getItem(packsKey);
              let packs = [];
              if (saved) {
                try { packs = JSON.parse(saved); } catch(e) {}
              }
              if (!packs.includes(packId)) {
                packs.push(packId);
                localStorage.setItem(packsKey, JSON.stringify(packs));
                // Vincula permanentemente a conta na nuvem
                firebaseStorageService.saveOwnedPacks(packs).catch(console.error);
                alert("Pacote de Flashcards desbloqueado com sucesso!");
              }
            }
            window.history.replaceState({}, document.title, "/");
          }

          if (urlParams.get('success') === 'true') {
            try {
              const { doc, setDoc } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              await setDoc(doc(db, "users", user.uid), { 
                planStatus: 'premium',
                subscription: 'active'
              }, { merge: true });
              setShowPremiumSuccessModal(true);
              // Clean URL
              window.history.replaceState({}, document.title, "/");
            } catch (e) {
              console.error("Error activating premium from URL", e);
            }
          }

          
          // Sync tasks and cycle from account
          const [cloudTasks, cloudCycle, cloudSettings] = await Promise.all([
            firebaseStorageService.syncTasks(),
            firebaseStorageService.syncCycleConfig(),
            firebaseStorageService.getUserSettings()
          ]);
          
          if (cloudTasks.length > 0) {
            storageService.setTasks(cloudTasks);
          }
          if (cloudCycle) {
            storageService.setCycleConfig(cloudCycle);
          }
          if (cloudSettings?.scheduleMode) {
            storageService.setScheduleMode(cloudSettings.scheduleMode);
          }
        }
      } catch (error) {
        console.warn("Initialization error:", error);
      }
      
      // Load questions directly from memory to prevent QuotaExceededError on localStorage
      setQuestions(MOCK_QUESTIONS);

      if (user) {
        setIsLoadingPerformance(true);
        try {
          const guestPerfsStr = localStorage.getItem('apses_performance');
          if (guestPerfsStr) {
            const guestPerfs = JSON.parse(guestPerfsStr);
            if (Array.isArray(guestPerfs) && guestPerfs.length > 0) {
              for (const p of guestPerfs) {
                await firebaseStorageService.savePerformance(p);
              }
              localStorage.setItem('apses_performance', '[]');
            }
          }
        } catch (e) {
          console.error("Error migrating guest performances:", e);
        }

        try {
           const initialPerfs = await firebaseStorageService.getPerformancesOnce();
           setPerformance(initialPerfs);
        } catch (e) {
           console.error(e);
        } finally {
           setIsLoadingPerformance(false);
        }

        unsubscribe = firebaseStorageService.listenPerformances((cloudPerformance) => {
          setPerformance(cloudPerformance);
        });
      } else {
        setPerformance(storageService.getPerformance());
        setIsLoadingPerformance(false);
      }
    };

    initializeData();

    return () => unsubscribe();
  }, [user]);

  const resetCharts = () => {
    if (confirm("Deseja realmente zerar todos os seus gráficos e estatísticas localmente?")) {
      storageService.resetQuestionsAndPerformance();
      setQuestions(MOCK_QUESTIONS);
      setPerformance([]);
      setAiDiagnosis(null);
    }
  };

  const updatePerformance = async (perf: Performance) => {
    setPerformance(prev => [...prev, perf]);
    storageService.savePerformance(perf);
    await firebaseStorageService.savePerformance(perf);
  };

  const handleDiagnose = async () => {
    setLoadingAI(true);
    try {
      const stats = calculateStats();
      const diagnosis = await geminiService.diagnosePerformance(stats);
      setAiDiagnosis(diagnosis);
    } catch (error) {
      console.error(error);
      setAiDiagnosis("Não foi possível gerar o diagnóstico no momento.");
    } finally {
      setLoadingAI(false);
    }
  };

  const calculateStats = (): DisciplineStats[] => {
    const statsMap = new Map<string, DisciplineStats>();
    
    questions.forEach(q => {
      if (!q) return;
      if (!statsMap.has(q.discipline)) {
        statsMap.set(q.discipline, {
          discipline: q.discipline,
          total: 0,
          correct: 0,
          incorrect: 0
        });
      }
    });

    performance.forEach(p => {
      const stat = statsMap.get(p.discipline || '');
      if (stat) {
        stat.total++;
        if (p.isCorrect) stat.correct++;
        else stat.incorrect++;
      }
    });

    return Array.from(statsMap.values()).filter(s => s.total > 0);
  };

  const handleResumeSession = async (session: StudySession) => {
    setLoadingAI(true);
    try {
      // Questions in session are stored as IDs, need to fetch/filter them from current questions pool
      // or if they are from a specific set, we might need to handle it.
      // For now, let's assume they exist in our questions list.
      const sessionQuestionIdsSet = new Set(session.questionIds);
      const sessionQuestions = questions.filter(q => sessionQuestionIdsSet.has(q.id));
      if (sessionQuestions.length === 0) {
        alert("As questões desta sessão não estão mais disponíveis.");
        return;
      }
      setSessionQuestions(sessionQuestions);
      setActiveSession(session);
      setSessionFilterConfig(session.filterConfig);
      handleTabChange('questions');
    } catch (error) {
      console.error("Error resuming session:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  const renderContent = () => {
    if (isLoadingPerformance && activeTab !== 'filter') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center h-full text-black dark:text-white bg-[#f9fafc] dark:bg-[#01142e]">
           <Loader2 size={32} className="animate-spin text-purple-500 mb-4" />
           <p className="text-black/60 dark:text-white/60 font-bold">Carregando dados...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeDashboard 
            questions={questions}
            performance={performance}
            onNavigate={(tab, params) => {
              setActiveSession(null);
              setSessionFilterConfig(undefined);
              handleTabChange(tab, params);
            }}
            aiDiagnosis={aiDiagnosis}
            onStartReview={(reviewQuestions) => {
               setActiveSession(null);
               setSessionFilterConfig({ name: 'Revisão de Erros' });
               setSessionQuestions(reviewQuestions);
               handleTabChange('questions');
            }}
            onResumeSession={handleResumeSession}
          />
        );
      case 'filter': {
        return (
          <FilterScreen 
            questions={questions}
            initialTab={targetFilterTab || 'simples'}
            key={targetFilterTab || 'simples'}
            performance={performance}
            isLoadingData={isLoadingPerformance}
            onNavigate={handleTabChange}
            onStartTraining={(filtered, config) => {
              setActiveSession(null);
              setSessionFilterConfig(config);
              setSessionQuestions(filtered);
              handleTabChange('questions');
            }}
            onBack={() => handleTabChange('back')}
          />
        );
      }
      case 'questions':
        if (!sessionQuestions || sessionQuestions.length === 0) {
          // If the user refreshed the page on /questions, they have no active session questions
          // Redirect them back to home
          Promise.resolve().then(() => handleTabChange('home'));
          return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-[#f9fafc] dark:bg-[#01142e]">
              <div className="text-center">
                <Loader2 size={32} className="animate-spin text-purple-500 mx-auto mb-4" />
                <p className="text-black dark:text-white">Redirecionando...</p>
              </div>
            </div>
          );
        }
        return (
          <QuestionsScreen 
            questions={sessionQuestions}
            allPerformance={performance}
            onPerformanceUpdated={updatePerformance}
            onNavigate={(tab, params) => {
              setActiveSession(null);
              setSessionFilterConfig(undefined);
              handleTabChange(tab, params);
            }}
            onExit={() => {
              setActiveSession(null);
              setSessionFilterConfig(undefined);
              handleTabChange('back');
            }}
            initialSession={activeSession}
            filterConfig={sessionFilterConfig}
          />
        );
      case 'analytics':
        return (
          <AnalyticsScreen questions={questions}
            performance={performance}
            onReset={resetCharts}
            calculateStats={calculateStats}
            onBack={() => handleTabChange('back')}
          />
        );
      case 'study-plan':
        return (
          <StudyPlanScreen 
            onBack={() => handleTabChange('back')} 
            onNavigate={handleTabChange}
            performance={performance}
            questions={questions}
            onStartReview={(reviewQuestions) => {
               setActiveSession(null);
               setSessionFilterConfig({ name: 'Revisão de Erros' });
               setSessionQuestions(reviewQuestions);
               handleTabChange('questions');
            }}
          />
        );
      case 'flashcards':
        return (
          <FlashcardsScreen 
            onNavigate={handleTabChange} 
            initialViewingPack={navHistory[navHistory.length - 1]?.params?.viewingPack} 
          />
        );
      case 'ranking':
        return (
          <RankingScreen onNavigate={handleTabChange} allPerformance={performance} />
        );
      case 'profile':
        return (
          <ProfileScreen performance={performance} onNavigate={handleTabChange} />
        );
      case 'blog':
        return <BlogScreen onNavigate={handleTabChange} initialPostId={targetBlogId} />;

      case 'sales-anual':
      case 'sales-mensal':
        return (
          <SalesScreen 
            planType={activeTab === 'sales-anual' ? 'anual' : 'mensal'} 
            onNavigate={handleTabChange} 
          />
        );
      case 'admin':
        if (profileLoading) {
           return <div className="flex-1 flex items-center justify-center h-full text-black dark:text-white">Carregando permissões...</div>;
        }
        if (!['master', 'admin', 'suporte', 'editor'].includes(profile?.role || '')) {
           return (
             <div className="flex-1 flex flex-col items-center justify-center h-full text-black dark:text-white">
                <XCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
                <p className="text-black/60 dark:text-white/60 mb-6">Você não tem permissão para acessar o painel administrativo.</p>
                <button onClick={() => handleTabChange('home')} className="bg-purple-500 text-white px-6 py-2 rounded-xl font-bold">Voltar ao Início</button>
             </div>
           );
        }
        return (
          <AdminPanel onBack={() => handleTabChange('back')} />
        );
    }
  };

  return (
    <div translate="no" className="h-[100dvh] bg-[#f9fafc] dark:bg-[#01142e] overflow-hidden bg-fixed flex flex-col notranslate">
      {/* Global Rank Up Notification (Full Screen Modal) */}
      <AnimatePresence>
        {rankUpNotification && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-[#0a2346] border border-black/10 dark:border-white/10 rounded-3xl p-8 max-w-sm w-full relative overflow-hidden flex flex-col items-center text-center shadow-2xl"
            >
              <div className={cn("absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-40", rankUpNotification.bgGlow)}></div>
              
              <motion.div
                 initial={{ scale: 0, rotate: -45 }}
                 animate={{ scale: 1, rotate: 0 }}
                 transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                 className="relative z-10 mb-6"
              >
                  <div className={cn("absolute inset-0 blur-[30px] opacity-60", rankUpNotification.bgGlow)}></div>
                  <rankUpNotification.Icon size={120} className={cn("relative z-10 drop-shadow-[0_0_20px_currentColor]", rankUpNotification.color)} strokeWidth={1} />
              </motion.div>

              <div className="relative z-10 w-full">
                <h3 className="text-purple-500 font-black uppercase tracking-widest text-sm mb-2">Parabéns!</h3>
                <h2 className="text-3xl font-black text-black dark:text-white italic uppercase mb-2 leading-tight">
                  Você subiu para <br/>
                  <span className={rankUpNotification.color}>{rankUpNotification.tier} {rankUpNotification.division}</span>
                </h2>
                <p className="text-black dark:text-black/60 dark:text-white/60 mb-8 font-medium">Continue resolvendo questões para alcançar o próximo nível!</p>

                <button 
                  onClick={() => setRankUpNotification(null)}
                  className={cn("w-full py-4 rounded-xl font-bold text-white transition-transform active:scale-95 shadow-lg", rankUpNotification.bgColor)}
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showPremiumSuccessModal && (
        <PremiumSuccessModal onClose={() => setShowPremiumSuccessModal(false)} />
      )}
      <main className="relative z-20 flex-1 flex flex-col overflow-hidden">
          <div className={cn("w-full h-full flex flex-col overflow-hidden relative")}>
            {renderContent()}
          </div>
      </main>
    </div>
  );
}
