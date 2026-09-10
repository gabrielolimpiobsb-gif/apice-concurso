import React, { useState, useMemo, useEffect } from 'react';
import { Question, Alternative, Performance, Difficulty, Flashcard, StudySession, SavedFilter } from '../types';
import { CheckCircle2, ArrowLeft, Bookmark, MoreHorizontal, Calendar, Building2, Target, CircleDot, FileText, MessageSquare, Layers, Loader2, ChevronDown, Sparkles, BarChart2, RotateCcw, ChevronRight, XCircle, Search, Scissors, Maximize2, Minimize2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { QuestionTextFormatter } from './QuestionTextFormatter';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { firebaseStorageService, QuestionComment } from '../services/firebaseStorageService';
import { useSubscription } from '../lib/useSubscription';
import { auth } from '../lib/firebase';
import { PremiumPaywall } from './PremiumPaywall';
import confetti from 'canvas-confetti';
import { Trash2, Heart, Flag } from 'lucide-react';
import { CreateFlashcardFromCommentModal } from './CreateFlashcardFromCommentModal';
import { CreateFlashcardFromQuestionModal } from './CreateFlashcardFromQuestionModal';

interface QuestionsScreenProps {
  onNavigate?: (tab: any, params?: any) => void;
  questions: Question[];
  allPerformance: Performance[];
  onPerformanceUpdated: (perf: Performance) => void;
  onExit: () => void;
  initialSession?: StudySession | null;
  filterConfig?: Partial<SavedFilter>;
}

export const QuestionsScreen: React.FC<QuestionsScreenProps> = ({ 
  questions, 
  allPerformance, 
  onPerformanceUpdated,
  onExit,
  onNavigate,
  initialSession,
  filterConfig
}) => {
  const { canAnswerQuestion, canCreateFlashcard, isPremium, dailyQuestionsLeft, flashcardsLeft } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallType, setPaywallType] = useState<{title: string, feature: string} | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, { selectedAlternative: string, isCorrect: boolean }>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [lastSaved, setLastSaved] = useState<number>(Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);
  const [isResolved, setIsResolved] = useState(false);
  const [activeTab, setActiveTab] = useState<'enunciado' | 'comentarios' | 'flashcard'>('enunciado');
  const [showDetails, setShowDetails] = useState(false);
  const [crossedOutAlts, setCrossedOutAlts] = useState<Set<string>>(new Set());
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const triggerWarning = (msg: string) => {
    setWarningMessage(msg);
    setTimeout(() => {
      setWarningMessage(prev => prev === msg ? null : prev);
    }, 4000);
  };

  // Restore session if initialSession exists
  useEffect(() => {
    if (initialSession) {
      setSessionId(initialSession.id);
      
      // Ensure we don't go out of bounds if questions were removed
      const safeIndex = Math.min(initialSession.currentIndex || 0, Math.max(0, questions.length - 1));
      setCurrentQuestionIndex(safeIndex);
      
      setSessionAnswers(initialSession.sessionAnswers || {});
      setTimeSpent(initialSession.timeSpent || 0);
    } else {
      setCurrentQuestionIndex(0);
      setSessionAnswers({});
      setTimeSpent(0);
      setSessionId(null);
    }
  }, [initialSession, questions.length]);

  // Timer for time spent
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-save effect
  useEffect(() => {
    const autoSaveTimer = setInterval(async () => {
      if (questions.length > 0 && Object.keys(sessionAnswers).length > 0) {
        handleSaveSession(true);
      }
    }, 60000); // Auto-save every 60 seconds
    return () => clearInterval(autoSaveTimer);
    // Only reset timer if the set of answered questions fundamentally changes, 
    // or if the underlying questions change. 
    // Avoid timeSpent entirely here.
  }, [questions]);

  const handleSaveSession = async (isAuto = false) => {
    if (questions.length === 0) return;
    
    setIsSaving(true);
    const sessionData: Partial<StudySession> = {
      id: sessionId || undefined,
      name: filterConfig?.name || `Sessão de ${new Date().toLocaleDateString()}`,
      filterConfig: filterConfig || {},
      questionIds: questions.map(q => q.id),
      sessionAnswers: sessionAnswers,
      currentIndex: currentQuestionIndex,
      timeSpent: timeSpent,
      progress: (Object.keys(sessionAnswers).length / questions.length) * 100,
      status: 'active'
    };

    const newId = await firebaseStorageService.saveStudySession(sessionData);
    if (newId) setSessionId(newId);
    setLastSaved(Date.now());
    setTimeout(() => setIsSaving(false), 1000);
  };

  const [showFlashcardFromQuestionModal, setShowFlashcardFromQuestionModal] = useState(false);

  const [communityComments, setCommunityComments] = useState<QuestionComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);

  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [showOptionsPopup, setShowOptionsPopup] = useState(false);
  const [isEditingQuestionNumber, setIsEditingQuestionNumber] = useState(false);
  const [jumpToNumber, setJumpToNumber] = useState("");
  const [showCustomScheduleInput, setShowCustomScheduleInput] = useState(false);
  const [customScheduleDays, setCustomScheduleDays] = useState("");
  const [selectedScheduleDays, setSelectedScheduleDays] = useState<number | null>(null);

  const [activeCommentMenu, setActiveCommentMenu] = useState<string | null>(null);
  const [showFlashcardFromCommentModal, setShowFlashcardFromCommentModal] = useState(false);
  const [selectedCommentText, setSelectedCommentText] = useState("");

  const handleJumpSubmit = () => {
    setIsEditingQuestionNumber(false);
    const num = parseInt(jumpToNumber);
    if (!isNaN(num) && num >= 1 && num <= questions.length) {
      setCurrentQuestionIndex(num - 1);
    }
  };

  const fontSizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const safeIndex = Math.min(currentQuestionIndex, Math.max(0, questions.length - 1));
  const activeQuestion = questions.length > 0 ? questions[safeIndex] : null;

  const questionHistory = useMemo(() => {
    if (!activeQuestion) return [];
    return allPerformance
      .filter(p => p.questionId === activeQuestion.id)
      .sort((a, b) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime());
  }, [activeQuestion, allPerformance]);

  const lastAttempt = questionHistory[0];

  const [activeQuestionFlashcardCount, setActiveQuestionFlashcardCount] = useState(0);
  const [activeCommentFlashcardCount, setActiveCommentFlashcardCount] = useState(0);

  useEffect(() => {
    setCommunityComments([]);
    setCommentText("");
    setCrossedOutAlts(new Set());
    
    if (activeQuestion) {
      firebaseStorageService.getFlashcardsCountForQuestion(activeQuestion.id).then(counts => {
        setActiveQuestionFlashcardCount(counts.questionFlashcards);
        setActiveCommentFlashcardCount(counts.commentFlashcards);
      });
    } else {
      setActiveQuestionFlashcardCount(0);
      setActiveCommentFlashcardCount(0);
    }
  }, [activeQuestion?.id]);

  useEffect(() => {
    if (activeQuestion) {
      const unsubscribe = firebaseStorageService.listenQuestionComments(activeQuestion.id, (comments) => {
        setCommunityComments(comments);
      });
      return () => unsubscribe();
    }
  }, [activeQuestion]);

  const commentInputRef = React.useRef<HTMLTextAreaElement>(null);

  const handlePostComment = async () => {
    if (!activeQuestion || !commentText.trim()) return;
    setIsPostingComment(true);
    await firebaseStorageService.addQuestionComment(activeQuestion.id, commentText);
    setCommentText("");
    setIsPostingComment(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!activeQuestion) return;
    if (confirm("Deseja realmente excluir seu comentário?")) {
      await firebaseStorageService.deleteQuestionComment(activeQuestion.id, commentId);
    }
  };

  const handleToggleLike = async (commentId: string) => {
    if (!activeQuestion) return;
    await firebaseStorageService.toggleQuestionCommentLike(activeQuestion.id, commentId);
  };

  // Deleted functions

  useEffect(() => {
    if (!activeQuestion) return;
    setActiveTab('enunciado');

    const sessionRes = sessionAnswers[activeQuestion.id];
    if (sessionRes) {
      setIsResolved(true);
      setSelectedAlternative(sessionRes.selectedAlternative);
    } else {
      // Questions always start unanswered so the user can answer them again
      setSelectedAlternative(null);
      setIsResolved(false);
    }
  }, [activeQuestion, sessionAnswers]);

  const handleRetryQuestion = () => {
    if (!activeQuestion) return;
    setIsResolved(false);
    setSelectedAlternative(null);
    setSessionAnswers(prev => {
      const next = { ...prev };
      delete next[activeQuestion.id];
      return next;
    });
  };

  const handleSelectAlternative = (alternative: Alternative, idx?: number) => {
    if (!isResolved) {
      setSelectedAlternative(alternative.id || (idx !== undefined ? idx.toString() : ''));
    }
  };

  const handleResolve = async () => {
    if (!activeQuestion || !selectedAlternative || isResolved) return;

    if (!canAnswerQuestion) {
      setPaywallType({ title: "Limite de Questões Diárias Ativado", feature: "Questões Comentadas" });
      setShowPaywall(true);
      return;
    }

    const alt = activeQuestion.alternatives.find((a, idx) => (a.id || idx.toString()) === selectedAlternative);
    if (!alt) return;

    setIsResolved(true);
    
    setSessionAnswers(prev => ({
      ...prev,
      [activeQuestion.id]: {
        selectedAlternative: selectedAlternative,
        isCorrect: alt.isCorrect
      }
    }));

    const perf: Performance = {
      questionId: activeQuestion.id,
      isCorrect: alt.isCorrect,
      answeredAt: new Date().toISOString(),
      selectedAlternativeId: selectedAlternative,
      topic: activeQuestion.topic,
      discipline: activeQuestion.discipline
    };


    onPerformanceUpdated(perf);
    await firebaseStorageService.incrementDailyQuestions();

    if (!alt.isCorrect && isPremium) {
       // Automatically generate flashcard for wrong answers
       geminiService.generateFlashcard(activeQuestion).then(async (generated) => {
           if (generated) {
               const flashcardData = {
                   id: `auto-fc-${Date.now()}`,
                   front: generated.frente,
                   back: generated.verso,
                   subject: activeQuestion.discipline || 'Geral',
                   topic: activeQuestion.topic || 'Geral',
                   source: 'system',
                   sourceQuestionId: activeQuestion.id,
                   createdAt: Date.now()
               };
               storageService.saveFlashcard(flashcardData);
               try {
                   await firebaseStorageService.saveFlashcard(flashcardData);
               } catch (e) {}
           }
       }).catch(console.error);
    }
  };


  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const [exitFlowStep, setExitFlowStep] = useState<'none' | 'review'>('none');

  const handleRequestExit = () => {
    const wrongQuestionsCount = Object.values(sessionAnswers).filter(a => !a.isCorrect).length;
    
    // If there are wrong questions, offer spaced review scheduling; otherwise exit directly
    if (wrongQuestionsCount > 0) {
       setExitFlowStep('review');
    } else {
       onExit();
    }
  };

  const moveToNextExitStep = () => {
    onExit();
  };

  const handleFinishAndSave = async (shouldSave: boolean) => {
    if (shouldSave) {
      await handleSaveSession();
    } else if (sessionId) {
      await firebaseStorageService.deleteStudySession(sessionId);
    }
    
    if (Object.keys(sessionAnswers).length === questions.length) {
      if (sessionId && shouldSave) {
        await firebaseStorageService.saveStudySession({
          id: sessionId,
          status: 'completed'
        });
      }
    }

    onExit();
  };
  
  const handleScheduleReview = (days: number) => {
    const wrongQuestions = Object.entries(sessionAnswers)
      .filter(([_, ans]) => !ans.isCorrect)
      .map(([id]) => id);
    
    if (wrongQuestions.length > 0) {
      let saved: {id: string, scheduledFor: number}[] = [];
      try {
        const stored = localStorage.getItem('concurso_pro_wrong_scheduled');
        if (stored) {
          const parsed = JSON.parse(stored);
          saved = parsed.map((item: any) => {
            if (typeof item === 'string') {
               return { id: item, scheduledFor: Date.now() };
            }
            return item;
          });
        }
      } catch (e) {}

      const scheduledFor = Date.now() + days * 24 * 60 * 60 * 1000;
      
      const newItems = wrongQuestions.map(id => ({ id, scheduledFor }));
      const newSaved = [...saved.filter(s => !wrongQuestions.includes(s.id)), ...newItems];

      localStorage.setItem('concurso_pro_wrong_scheduled', JSON.stringify(newSaved));
    }
    moveToNextExitStep();
  };

  const handleCustomSchedule = () => {
     setShowCustomScheduleInput(true);
  };
  
  const handleConfirmCustomSchedule = () => {
    const days = parseInt(customScheduleDays, 10);
    if (isNaN(days) || days <= 0) {
        console.warn("Número de dias inválido.");
        return;
    }
    handleScheduleReview(days);
  };

  if (!questions || questions.length === 0 || !activeQuestion) {
    console.log("QuestionsScreen fallback triggered!", {
      questionsLength: questions?.length,
      currentQuestionIndex,
      hasActiveQuestion: !!activeQuestion,
      exitFlowStep
    });
    if (exitFlowStep !== 'none') {
        // Fallback to allow end screen even if questions is empty (shouldn't happen but defensive)
    } else {
        return (
          <div className="fixed inset-0 z-[150] bg-[#f9fafc] dark:bg-[#01142e] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-white mb-4">
              <FileText size={32} />
            </div>
            <h2 className="text-xl font-bold text-black dark:text-white mb-2">Nenhuma questão aqui</h2>
            <p className="text-black dark:text-black/60 dark:text-white/60 mb-6 max-w-xs text-sm">
              Você não tem questões para resolver nesta sessão.
            </p>
            <button 
              onClick={onExit}
              className="px-8 py-3 bg-purple-500 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              Voltar para o Início
            </button>
          </div>
        );
    }
  }

  return (
    <div className="fixed inset-0 h-[100dvh] z-[100] flex flex-col bg-[#f9fafc] dark:bg-[#01142e] text-black dark:text-white font-sans overflow-hidden">
      <AnimatePresence>
        {isTextExpanded && activeQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[200] bg-[#f9fafc] dark:bg-[#01142e] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-purple-500/20 bg-white dark:bg-[#0a2346]">
              <h2 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
                <FileText className="text-purple-500" />
                Texto da Questão
              </h2>
              <button 
                onClick={() => setIsTextExpanded(false)}
                className="p-3 hover:bg-black/10 dark:bg-white/10 rounded-xl transition-colors text-black dark:text-black/60 dark:text-white/60 hover:text-black dark:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-visible">
              <div className={cn("max-w-4xl mx-auto space-y-6 text-black dark:text-white/90", fontSizeClasses[fontSize])}>
                <QuestionTextFormatter text={activeQuestion.text} type={activeQuestion.type} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <PremiumPaywall 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
        title={paywallType?.title}
        feature={paywallType?.feature}
      />
      <AnimatePresence mode="wait">
        {exitFlowStep !== 'none' ? (
          <motion.div 
            key="end-screen-root"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 h-[100dvh] z-[120] flex flex-col bg-[#f9fafc] dark:bg-[#01142e] text-black dark:text-white items-center justify-center p-4 overflow-hidden"
          >
            {/* Background decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/5 blur-[120px]" />
 
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-[#0a2346] border border-black/5 dark:border-white/5 rounded-[40px] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col items-center"
            >
              <AnimatePresence mode="wait">
                  {exitFlowStep === 'review' && (
                    <motion.div 
                      key="review-step"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full"
                    >
                      <div className="flex flex-col items-center text-center mb-8">
                         <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-rose-500/10 transform rotate-3">
                            <RotateCcw size={40} className="text-rose-500" />
                         </div>
                         <h2 className="text-2xl font-black text-black dark:text-white mb-2">Revisão Espaçada</h2>
                         <p className="text-black dark:text-black/60 dark:text-white/60 text-sm px-4">
                          Você errou <span className="text-rose-400 font-bold">{Object.values(sessionAnswers).filter(a => !a.isCorrect).length}</span> {Object.values(sessionAnswers).filter(a => !a.isCorrect).length === 1 ? 'questão' : 'questões'}. Escolha quando deseja revisá-la{Object.values(sessionAnswers).filter(a => !a.isCorrect).length === 1 ? '' : 's'}:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
                        {[
                          { days: 1, label: "Amanhã (24h)", icon: <Target size={18}/> },
                          { days: 7, label: "Próxima Semana (7d)", icon: <Calendar size={18}/> },
                          { days: 15, label: "Quinzena (15d)", icon: <Layers size={18}/> },
                          { days: 30, label: "Mensal (30d)", icon: <Bookmark size={18}/> },
                        ].map((option) => (
                          <button 
                            key={option.days}
                            onClick={() => {
                               setSelectedScheduleDays(option.days);
                               setShowCustomScheduleInput(false);
                            }}
                            className={cn(
                              "w-full p-4 border rounded-2xl flex items-center justify-between transition-all group",
                              selectedScheduleDays === option.days && !showCustomScheduleInput
                                ? "bg-rose-500/20 border-rose-500/50"
                                : "bg-[#f9fafc] dark:bg-[#01142e] border-black/5 dark:border-white/5 hover:bg-rose-500/10 hover:border-rose-500/30"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                  selectedScheduleDays === option.days && !showCustomScheduleInput
                                    ? "bg-rose-500/20 text-black dark:text-white"
                                    : "bg-black/5 dark:bg-white/5 text-black dark:text-black/40 dark:text-white/40 group-hover:text-black dark:text-white"
                                )}>
                                {option.icon}
                              </div>
                              <span className={cn("font-bold text-left transition-colors",
                                   selectedScheduleDays === option.days && !showCustomScheduleInput
                                     ? "text-black dark:text-white"
                                     : "text-black dark:text-black/80 dark:text-white/80 group-hover:text-black dark:text-white"
                                 )}>{option.label}</span>
                            </div>
                            {selectedScheduleDays === option.days && !showCustomScheduleInput && (
                              <CheckCircle2 size={18} className="text-black dark:text-white" />
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-3 mt-6">
                        {showCustomScheduleInput ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              min="1"
                              value={customScheduleDays}
                              onChange={(e) => setCustomScheduleDays(e.target.value)}
                              placeholder="Frequência (dias)"
                              className="h-14 p-4 flex-1 bg-[#f9fafc] dark:bg-[#01142e] border border-rose-500/50 rounded-2xl text-black dark:text-white outline-none focus:border-rose-500"
                              autoFocus
                            />
                            <button
                              onClick={() => setShowCustomScheduleInput(false)}
                              className="h-14 px-4 bg-black/5 dark:bg-white/5 text-black dark:text-black/40 dark:text-white/40 font-bold rounded-2xl hover:text-black dark:text-white transition-all shrink-0 border border-black/5 dark:border-white/5"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                               setShowCustomScheduleInput(true);
                               setSelectedScheduleDays(null);
                            }}
                            className="w-full h-14 bg-black/5 dark:bg-white/5 text-black dark:text-black/80 dark:text-white/80 font-bold rounded-2xl hover:bg-black/10 dark:bg-white/10 transition-all flex items-center justify-center gap-3 border border-black/5 dark:border-white/5"
                          >
                            <Calendar size={20} />
                            Data Personalizada
                          </button>
                        )}
                        
                        <button 
                          onClick={() => {
                            if (showCustomScheduleInput) {
                               handleConfirmCustomSchedule();
                            } else if (selectedScheduleDays) {
                               handleScheduleReview(selectedScheduleDays);
                            }
                          }}
                          disabled={!showCustomScheduleInput && !selectedScheduleDays}
                          className="w-full h-14 bg-rose-500 text-black dark:text-white font-black rounded-2xl hover:brightness-110 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 transition-all mt-2"
                        >
                          Confirmar <ChevronRight size={20} />
                        </button>
                        
                        <button 
                          onClick={moveToNextExitStep}
                          className="w-full py-3 text-black dark:text-black/30 dark:text-white/30 hover:text-black dark:text-black/60 dark:text-white/60 font-bold text-xs uppercase tracking-widest transition-colors"
                        >
                          Pular agendamento
                        </button>
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="question-view-root"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col bg-[#f9fafc] dark:bg-[#01142e] text-black dark:text-white"
          >
            {/* HEADER */}
            <div className="pt-3 px-3 pb-1 bg-[#f9fafc] dark:bg-[#01142e] z-10 shrink-0">
              <div className="flex items-start justify-between max-w-7xl w-full px-4 md:px-8 mx-auto">
                <div className="flex items-start gap-3">
                  <button onClick={handleRequestExit} className="p-2 mt-1 rounded-xl bg-white dark:bg-[#0a2346] text-black dark:text-white hover:text-black dark:text-white transition-colors">
                    <ArrowLeft size={18} />
                  </button>
                  <div className="flex flex-col relative gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-black dark:text-white leading-none flex items-center gap-1.5">
                        Questão 
                        <span className="text-purple-500">
                          {String(currentQuestionIndex + 1).padStart(2, '0')}
                        </span>
                        de <span className="text-black dark:text-black/60 dark:text-white/60">{questions.length}</span>
                        <span className="ml-2 px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-500 font-mono text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">
                          {activeQuestion.id}
                        </span>
                      </h3>
                      
                      <div className="relative flex items-center h-full min-h-[32px]">
                        {isEditingQuestionNumber ? (
                          <div className="flex items-center gap-1 bg-white dark:bg-[#0a2346] border border-purple-500 p-1 rounded-lg shadow-lg">
                            <input 
                              type="number"
                              autoFocus
                              value={jumpToNumber}
                              onChange={(e) => setJumpToNumber(e.target.value)}
                              onBlur={handleJumpSubmit}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleJumpSubmit();
                                if (e.key === 'Escape') setIsEditingQuestionNumber(false);
                              }}
                              className="bg-transparent w-10 text-center text-black dark:text-white text-sm font-bold outline-none appearance-none"
                              style={{ WebkitAppearance: 'none', margin: 0, MozAppearance: 'textfield' }}
                            />
                            <button 
                              onMouseDown={(e) => { e.preventDefault(); handleJumpSubmit(); }}
                              className="p-1 bg-purple-500/20 text-white hover:bg-purple-500 hover:text-white rounded transition-colors"
                            >
                              <Search size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setJumpToNumber(String(currentQuestionIndex + 1));
                              setIsEditingQuestionNumber(true);
                            }}
                            title="Ir para a questão..."
                            className="p-1.5 bg-purple-500/10 text-white hover:bg-purple-500/20 hover:text-white rounded-lg transition-colors ml-1"
                          >
                            <Search size={14} />
                          </button>
                        )}
                      </div>

                      {isSaving && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-1 text-[9px] text-purple-500 font-black uppercase tracking-widest"
                        >
                          <Loader2 size={10} className="animate-spin" />
                          <span>Salvando...</span>
                        </motion.div>
                      )}
                    </div>
                    {!isPremium && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-tighter">
                          {dailyQuestionsLeft} {dailyQuestionsLeft === 1 ? 'restante' : 'restantes'} hoje
                        </span>
                      </div>
                    )}
                    
                    <div className="relative mt-1.5">
                      <button 
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-white hover:text-black dark:text-white transition-colors bg-purple-500/10 px-2 py-1 rounded-md"
                      >
                        <span className="truncate max-w-[200px] text-left">{activeQuestion.discipline}</span>
                        <ChevronDown size={14} className={cn("transition-transform", showDetails ? "rotate-180" : "")} />
                      </button>
                      <AnimatePresence>
                        {showDetails && (
                          <motion.div
                            key="details-popup-content"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute left-0 top-full mt-2 w-[280px] sm:w-[320px] z-[150] bg-white dark:bg-[#0a2346] border border-purple-500/20 rounded-xl p-4 shadow-2xl"
                          >
                            <div className="space-y-4 text-xs font-sans">
                              {/* Banca, Year, Orgao, Cargo */}
                              <div className="flex items-start gap-3 text-black dark:text-white">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 mt-1">
                                  <Building2 size={18} className="text-purple-500" />
                                </div>
                                <div className="flex flex-col leading-tight gap-1 w-full">
                                   <div className="flex items-center flex-wrap gap-2">
                                     <span className="font-bold text-sm tracking-tight">{activeQuestion.board}</span>
                                     <span className="text-black dark:text-black/40 dark:text-white/40 flex items-center gap-1 font-medium text-[11px] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
                                       <Calendar size={10} />
                                       {activeQuestion.year}
                                     </span>
                                   </div>
                                   {(activeQuestion.orgao || activeQuestion.cargo) && (
                                     <div className="flex flex-col gap-0.5 mt-1 border-t border-black/5 dark:border-white/5 pt-1.5">
                                       {activeQuestion.orgao && <span className="text-black dark:text-black/70 dark:text-white/70 text-xs font-semibold truncate" title={activeQuestion.orgao}>{activeQuestion.orgao}</span>}
                                       {activeQuestion.cargo && <span className="text-black dark:text-black/50 dark:text-white/50 text-[10px] uppercase tracking-wider truncate pb-0.5" title={activeQuestion.cargo}>{activeQuestion.cargo}</span>}
                                     </div>
                                   )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-purple-500/10">
                                {/* Topic */}
                                <div>
                                  <div className="text-purple-500/60 mb-0.5 text-[10px] uppercase tracking-wider font-bold">Assunto</div>
                                  <div className="font-bold text-black dark:text-white/90 line-clamp-2 leading-snug" title={activeQuestion.topic}>{activeQuestion.topic}</div>
                                </div>
                                
                                {/* Difficulty & Code */}
                                <div className="flex flex-col gap-3">
                                  <div>
                                    <div className="text-purple-500/60 mb-0.5 text-[10px] uppercase tracking-wider font-bold">Dificuldade</div>
                                    <div className="font-bold text-amber-500 capitalize">{activeQuestion.difficulty}</div>
                                  </div>
                                  <div>
                                    <div className="text-purple-500/60 mb-0.5 text-[10px] uppercase tracking-wider font-bold">Código</div>
                                    <div className="font-mono text-black/70 dark:text-white/70 font-bold">{activeQuestion.id}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Status / History */}
                              <div className="pt-3 border-t border-purple-500/10">
                                <div className="text-purple-500/60 mb-2 text-[10px] uppercase tracking-wider font-bold">Seu Histórico</div>
                                {lastAttempt ? (
                                  <div className={cn("flex flex-col gap-1.5 p-3 rounded-lg border", 
                                    lastAttempt.isCorrect ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
                                  )}>
                                    <div className="flex items-center gap-2">
                                      {lastAttempt.isCorrect ? (
                                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                      ) : (
                                        <Target size={16} className="text-rose-500 shrink-0" />
                                      )}
                                      <span className={cn("font-bold text-xs truncate", lastAttempt.isCorrect ? "text-emerald-500" : "text-rose-500")}>
                                        <span>{lastAttempt.isCorrect ? "Acertou" : "Errou"} na última vez</span>
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-black dark:text-black/50 dark:text-white/50 ml-6 flex items-center gap-1.5 font-medium">
                                      <Calendar size={10} />
                                      <span>{new Date(lastAttempt.answeredAt).toLocaleDateString('pt-BR', { 
                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                      })} às {new Date(lastAttempt.answeredAt).toLocaleTimeString('pt-BR', {
                                        hour: '2-digit', minute: '2-digit'
                                      })}</span>
                                    </span>
                                  </div>
                                ) : (
                                  <div className="font-bold text-black dark:text-black/50 dark:text-white/50 bg-black/5 dark:bg-white/5 px-3 py-2.5 rounded-lg border border-black/5 dark:border-white/5 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                                    Questão Inédita
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 mt-1">
                  <button 
                    onClick={() => setFontSize(prev => prev === 'base' ? 'lg' : prev === 'lg' ? 'xl' : prev === 'xl' ? 'sm' : 'base')}
                    className="w-8 h-8 flex items-center justify-center bg-white dark:bg-[#0a2346] rounded-lg text-black dark:text-white hover:bg-[#1a2f4a] transition-colors"
                  >
                    <span className="text-sm font-bold">Aa</span>
                  </button>
                  <div className="relative">
                    <button onClick={() => setShowOptionsPopup(!showOptionsPopup)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-[#0a2346] rounded-lg text-black dark:text-white hover:bg-[#1a2f4a] transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                    <AnimatePresence>
                      {showOptionsPopup && (
                        <motion.div
                          key="options-popup-content"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#0a2346] border border-purple-500/20 rounded-xl py-2 shadow-2xl z-[150]"
                        >
                          <button 
                            onClick={() => { setShowOptionsPopup(false); console.warn("Reporte de erro aberto."); }}
                            className="w-full text-left px-4 py-2 text-sm text-black dark:text-black/80 dark:text-white/80 hover:bg-[#1a2f4a] hover:text-black dark:text-white transition-colors"
                          >
                            Reportar Erro
                          </button>
                          <button 
                            onClick={() => { setShowOptionsPopup(false); console.warn("Enviado para revisão."); }}
                            className="w-full text-left px-4 py-2 text-sm text-black dark:text-black/80 dark:text-white/80 hover:bg-[#1a2f4a] hover:text-black dark:text-white transition-colors"
                          >
                            Sugerir Melhoria
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-[1_1_0] flex flex-col min-h-0 relative bg-[#f9fafc] dark:bg-[#01142e] w-full max-w-5xl mx-auto overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeQuestion.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full text-black dark:text-white flex flex-col h-full absolute inset-0"
                >
                  {/* TABS */}
                <div className="shrink-0 mx-4 md:mx-8 mt-4 flex gap-4 border-b border-black/5 dark:border-white/5 text-sm">
                  <button 
                    onClick={() => setActiveTab('enunciado')}
                    className={cn(
                      "flex items-center gap-1.5 pb-2 px-1 border-b-2 transition-colors",
                      activeTab === 'enunciado' ? "border-purple-500 text-black dark:text-white" : "border-transparent text-black dark:text-black/40 dark:text-white/40 hover:text-black dark:text-white"
                    )}
                  >
                    <FileText size={16} />
                    <span className="font-bold">Enunciado</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('comentarios')}
                    className={cn(
                      "flex items-center gap-1.5 pb-2 px-1 border-b-2 transition-colors",
                      activeTab === 'comentarios' ? "border-purple-500 text-black dark:text-white" : "border-transparent text-black dark:text-black/40 dark:text-white/40 hover:text-black dark:text-white"
                    )}
                  >
                    <MessageSquare size={16} />
                    <span className="font-bold">Comunidade</span>
                  </button>

                  <button 
                    onClick={() => {
                        if (!isResolved && !lastAttempt) {
                            triggerWarning("Você precisa resolver a questão primeiro para criar um flashcard.");
                            return;
                        }
                        if (!isPremium && !canCreateFlashcard) {
                            setPaywallType({ title: "Limite de Flashcards Ativado", feature: "Flashcards" });
                            setShowPaywall(true);
                            return;
                        }
                        setShowFlashcardFromQuestionModal(true);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 pb-2 px-1 border-b-2 transition-colors ml-auto sm:ml-0 border-transparent text-amber-400/70 hover:text-amber-400"
                    )}
                  >
                    <Layers size={16} />
                    <span className="font-medium">Criar Flashcard {!isPremium && `(${Math.max(0, flashcardsLeft)} restantes)`}</span>
                  </button>
                </div>

                <div className="flex-[1_1_0] flex flex-col min-h-0 relative pb-[90px]">
                  {activeTab === 'enunciado' ? (
                    <div className="flex-[1_1_0] overflow-y-auto scrollbar-visible px-4 md:px-8 pt-4 pb-6">
                      
                      {/* ENUNCIADO APP AREA */}
                      <div className={cn(
                        "text-black dark:text-white/90 font-medium bg-white dark:bg-[#0a2346]/30 p-5 md:p-6 rounded-3xl border border-purple-500/10 shadow-inner flex flex-col relative mb-8 max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10", 
                        fontSizeClasses[fontSize]
                      )}>
                        <button
                          onClick={() => setIsTextExpanded(true)}
                          className="absolute top-4 right-4 p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded-xl text-black dark:text-black/40 dark:text-white/40 hover:text-black dark:text-white transition-colors z-10"
                          title="Expandir texto"
                        >
                          <Maximize2 size={18} />
                        </button>
                        <QuestionTextFormatter text={activeQuestion.text} type={activeQuestion.type} />
                      </div>
                      
                      {/* INLINE ALTERNATIVES */}
                      <div className="pb-4">
                        <div className={cn("space-y-4", activeQuestion.type === 'true_false' || activeQuestion.type === ('QuestionType.TRUE_FALSE' as any) || activeQuestion.alternatives.length === 2 ? "grid grid-cols-2 gap-4 space-y-0" : "")}>
                        {activeQuestion.alternatives.map((alt, index) => {
                          const altId = alt.id || index.toString();
                          const isTrueFalse = activeQuestion.type === 'true_false' || activeQuestion.type === ('QuestionType.TRUE_FALSE' as any) || activeQuestion.alternatives.length === 2;
                          const label = isTrueFalse ? (alt.text.toLowerCase().includes('certo') ? 'C' : 'E') : String.fromCharCode(65 + index);
                          const isSelected = selectedAlternative === altId;
                          const isCrossed = crossedOutAlts.has(altId);
                          
                          let bgClass = "bg-white dark:bg-[#0a2346] hover:bg-black/5 dark:hover:bg-[#1a2f4a]";
                          let borderClass = "border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10";
                          let textClass = "text-black dark:text-white/80";
                          let labelBgClass = "bg-black/5 dark:bg-[#1a2f4a] text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white/90";
                          let extraLabel = null;
                          
                          if (isResolved) {
                            if (alt.isCorrect) {
                              bgClass = "bg-green-500/10";
                              borderClass = "border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
                              labelBgClass = "text-green-500 bg-green-500/20";
                              if (!isTrueFalse) extraLabel = <span className="text-green-500 text-xs font-bold md:mr-2 uppercase tracking-wide">Correta</span>;
                            } else if (isSelected) {
                              bgClass = "bg-[#cf1313]/10";
                              borderClass = "border border-[#cf1313]/50";
                              labelBgClass = "text-[#cf1313] bg-[#cf1313]/20";
                              if (!isTrueFalse) extraLabel = <span className="text-[#cf1313] text-xs font-bold md:mr-2 uppercase tracking-wide">Incorreta</span>;
                            } else {
                              bgClass = "bg-white dark:bg-[#0a2346]/30 opacity-60";
                              borderClass = "border border-black/5 dark:border-white/5";
                            }
                          } else if (isSelected) {
                            bgClass = "bg-purple-500/10 dark:bg-purple-500/20";
                            borderClass = "border border-purple-500 shadow-[0_0_15px_rgba(84,172,191,0.1)]";
                            labelBgClass = "bg-purple-500 text-white";
                            textClass = "text-black dark:text-white font-medium";
                          } else if (isCrossed) {
                            bgClass = "bg-white dark:bg-[#0a2346]/30";
                            borderClass = "border border-dashed border-purple-500/20";
                            textClass = "text-black dark:text-black/60 dark:text-white/60 line-through";
                            labelBgClass = "bg-transparent text-black dark:text-black/40 dark:text-white/40";
                          }

                          return (
                            <div key={altId} className="relative group w-full flex items-center gap-1 md:gap-3">
                              {/* Scissors Button Desktop ONLY - Left Outside */}
                              {!isResolved && !isTrueFalse && (
                                 <div className="flex-shrink-0 w-8 md:w-10 items-center justify-center hidden sm:flex">
                                   <button 
                                     onClick={(e) => {
                                        e.stopPropagation();
                                        setCrossedOutAlts(prev => {
                                           const next = new Set(prev);
                                           if (next.has(altId)) next.delete(altId);
                                           else next.add(altId);
                                           return next;
                                        });
                                     }}
                                     className="p-1.5 md:p-2 opacity-50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-lg hover:bg-black/10 dark:bg-white/10 flex items-center justify-center text-black dark:text-black/40 dark:text-white/40 hover:text-black dark:text-white"
                                     title={isCrossed ? "Desriscar alternativa" : "Riscar alternativa (Eliminar)"}
                                   >
                                      <Scissors size={18} className={isCrossed ? "opacity-30" : ""} />
                                   </button>
                                 </div>
                              )}
                              
                              <motion.div
                                drag={!isResolved && !isTrueFalse ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.1}
                                onDragEnd={(e, info) => {
                                  if (Math.abs(info.offset.x) > 50 && !isResolved && !isTrueFalse) {
                                      setCrossedOutAlts(prev => {
                                         const next = new Set(prev);
                                         if (next.has(altId)) next.delete(altId);
                                         else next.add(altId);
                                         return next;
                                      });
                                  }
                                }}
                                className="w-full relative z-10 flex-1"
                                style={!isResolved && !isTrueFalse ? { touchAction: "pan-y" } : {}}
                              >
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => !isResolved && handleSelectAlternative(alt, index)}
                                  onKeyDown={(e) => {
                                    if ((e.key === 'Enter' || e.key === ' ') && !isResolved) {
                                      e.preventDefault();
                                      handleSelectAlternative(alt, index);
                                    }
                                  }}
                                  className={cn(
                                    "w-full text-left p-4 rounded-2xl flex items-start gap-4 transition-all overflow-hidden cursor-pointer",
                                    isTrueFalse && "justify-center items-center py-4",
                                    isResolved && "cursor-default",
                                    bgClass,
                                    borderClass,
                                  )}
                                >
                                  <span className={cn("flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base transition-colors", labelBgClass)}>
                                    {label}
                                  </span>
                                  
                                  <div className="flex-1 min-w-0 pr-2 flex flex-col justify-start pb-1">
                                    <span className={cn("leading-relaxed font-medium transition-all duration-300 break-words whitespace-pre-wrap block", isTrueFalse ? "text-base text-center" : "text-[14px] md:text-[15px]", textClass)}>
                                      {alt.text.replace(/^[A-E]:\s*/, '').replace(/^(Certo|Errado)(?:\s+ou\s+.*)?$/i, '$1')}
                                    </span>
                                  </div>
  
                                  {extraLabel && (
                                    <span key={`extra-${altId}`} className="flex-shrink-0 mt-2">
                                      {extraLabel}
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            </div>
                          );
                        })}
                      </div>

                      <AnimatePresence>
                        {isResolved && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                          >
                            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap px-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                  <Sparkles size={16} className="text-purple-500" />
                                </div>
                                <h3 className="text-lg font-bold text-black dark:text-white">Gabarito e Comentário</h3>
                              </div>
                              <div className="bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                <span className="text-green-500/70 text-[11px] font-black uppercase tracking-wider">Gabarito Oficial</span>
                                <span className="text-green-500 font-bold text-sm">
                                  {(() => {
                                    const correctAlt = activeQuestion.alternatives.find(a => a.isCorrect);
                                    if (!correctAlt) return '';
                                    if (activeQuestion.type === 'true_false' || activeQuestion.type === ('QuestionType.TRUE_FALSE' as any) || activeQuestion.alternatives.length === 2) {
                                      return correctAlt.text.toLowerCase().includes('certo') ? 'Certo' : 'Errado';
                                    }
                                    const idx = activeQuestion.alternatives.findIndex(a => a.isCorrect);
                                    return `Letra ${String.fromCharCode(65 + idx)}`;
                                  })()}
                                </span>
                              </div>
                            </div>
                            
                            <div className={cn("bg-white dark:bg-[#0a2346]/60 p-5 rounded-3xl border border-purple-500/20 shadow-lg text-black dark:text-white/90", fontSizeClasses[fontSize])}>
                               {activeQuestion.explanation ? (
                                 <QuestionTextFormatter text={activeQuestion.explanation} />
                               ) : (
                                 <p className="text-black dark:text-black/40 dark:text-white/40 italic text-sm text-center py-4">Nenhum comentário adicionado pelo professor para esta questão ainda.</p>
                               )}
                            </div>

                            {activeQuestion.alternatives.find((a, i) => (a.id || i.toString()) === selectedAlternative)?.isCorrect === false && (
                              <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
                                    <RotateCcw size={20} />
                                  </div>
                                  <div>
                                    <h4 className="text-rose-400 font-bold text-sm">Atenção ao erro</h4>
                                    <p className="text-rose-400/70 text-xs">Crie um flashcard desta questão para sua revisão espaçada.</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                      if (!isPremium && !canCreateFlashcard) {
                                          setPaywallType({ title: "Limite de Flashcards Ativado", feature: "Flashcards" });
                                          setShowPaywall(true);
                                          return;
                                      }
                                      setShowFlashcardFromQuestionModal(true);
                                  }}
                                  className="w-full sm:w-auto px-4 py-2 bg-rose-500/20 text-black dark:text-white hover:bg-rose-500 hover:text-black dark:text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                                >
                                  <Layers size={16} />
                                  Criar Flashcard {!isPremium && `(${Math.max(0, flashcardsLeft)} restantes)`}
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  ) : activeTab === 'comentarios' ? (
                    <div className="flex-[1_1_0] overflow-y-auto scrollbar-visible px-4 md:px-8 pt-4 pb-6">
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-xl font-medium text-black dark:text-white mb-4">Comentários da Comunidade ({communityComments.length})</h3>
                          <div className="mb-6 bg-white dark:bg-[#0a2346]/40 p-4 rounded-xl border border-purple-500/10">
                            <textarea
                              ref={commentInputRef}
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Adicione um comentário..."
                              className="w-full bg-[#1a2f4a] text-black dark:text-white border border-purple-500/20 rounded-lg p-3 min-h-[80px] focus:outline-none focus:border-purple-500 resize-none"
                            />
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={handlePostComment}
                                disabled={!commentText.trim() || isPostingComment}
                                className="px-4 py-2 bg-purple-500 text-white font-bold rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
                              >
                                {isPostingComment && <Loader2 size={16} className="animate-spin" />}
                                Comentar
                              </button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {communityComments.length === 0 ? (
                              <div className="text-center text-black dark:text-black/40 dark:text-white/40 py-8">
                                Seja o primeiro a comentar nesta questão!
                              </div>
                            ) : (
                              communityComments.map(comment => (
                                <div key={comment.id} className="bg-white dark:bg-[#0a2346]/40 p-4 rounded-xl border border-purple-500/10 flex gap-3 relative">
                                  {comment.userPhotoURL ? (
                                    <img src={comment.userPhotoURL} alt={comment.userDisplayName} className="w-10 h-10 rounded-full shrink-0 object-cover" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                                      <span className="text-purple-500 font-bold text-sm">
                                        {comment.userDisplayName.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                              <div className="flex flex-col flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-bold text-black dark:text-white text-sm">{comment.userDisplayName}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-black dark:text-black/40 dark:text-white/40 text-[10px]">
                                          {comment.createdAt?.toDate ? new Date(comment.createdAt.toDate()).toLocaleDateString('pt-BR') : ''}
                                        </span>
                                        <div className="relative">
                                           <button 
                                             onClick={() => setActiveCommentMenu(activeCommentMenu === comment.id ? null : comment.id)}
                                             className="p-1.5 text-black dark:text-black/40 dark:text-white/40 hover:text-black dark:text-white hover:bg-black/10 dark:bg-white/10 rounded-md transition-all"
                                           >
                                             <MoreHorizontal size={14} />
                                           </button>
                                           
                                           {activeCommentMenu === comment.id && (
                                              <>
                                                <div className="fixed inset-0 z-40" onClick={() => setActiveCommentMenu(null)} />
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#0a2346] border border-purple-500/20 rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                                                    {auth.currentUser?.uid === comment.userId && (
                                                      <button 
                                                       onClick={() => {
                                                          handleDeleteComment(comment.id);
                                                          setActiveCommentMenu(null);
                                                       }}
                                                       className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-black dark:text-white hover:bg-rose-500/10 transition-colors text-left font-medium"
                                                     >
                                                        <Trash2 size={14} /> Excluir
                                                     </button>
                                                   )}
                                                   {auth.currentUser?.uid !== comment.userId && (
                                                     <button className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-black dark:text-black/40 dark:text-white/40 hover:bg-black/5 dark:bg-white/5 hover:text-black dark:text-white transition-colors text-left font-medium mt-1 border-t border-black/5 dark:border-white/5">
                                                        <Flag size={14} /> Denunciar
                                                     </button>
                                                   )}
                                                </div>
                                              </>
                                           )}
                                        </div>
                                      </div>
                                    </div>
                                    <p className="text-black dark:text-black/80 dark:text-white/80 text-sm whitespace-pre-wrap">{comment.text}</p>
                                    
                                    <div className="flex items-center gap-4 mt-3">
                                       <button 
                                          onClick={() => handleToggleLike(comment.id)}
                                          className={cn(
                                            "flex items-center gap-1.5 text-xs font-bold transition-colors",
                                            comment.likes?.includes(auth.currentUser?.uid || '') 
                                              ? "text-black dark:text-white" 
                                              : "text-black dark:text-black/40 dark:text-white/40 hover:text-black dark:text-white"
                                          )}
                                       >
                                          <Heart size={14} className={comment.likes?.includes(auth.currentUser?.uid || '') ? "fill-rose-400" : ""} /> 
                                          <span>{comment.likes?.includes(auth.currentUser?.uid || '') ? 'Descurtir' : 'Curtir'}</span>
                                          {comment.likes && comment.likes.length > 0 && (
                                            <span className="ml-0.5">• {comment.likes.length}</span>
                                          )}
                                       </button>
                                       <button 
                                         onClick={() => {
                                            setCommentText(`@${comment.userDisplayName} `);
                                            commentInputRef.current?.focus();
                                            commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                         }}
                                         className="flex items-center gap-1.5 text-xs font-bold text-black dark:text-black/40 dark:text-white/40 hover:text-black dark:text-white transition-colors"
                                       >
                                          <MessageSquare size={14} /> <span>Responder</span>
                                        </button>
                                        <button 
                                          onClick={() => {
                                             if (!isResolved && !lastAttempt) {
                                                 triggerWarning("Você precisa resolver a questão primeiro para criar um flashcard.");
                                                 return;
                                             }
                                             if (!isPremium && !canCreateFlashcard) {
                                                 setPaywallType({ title: "Limite de Flashcards Ativado", feature: "Flashcards" });
                                                 setShowPaywall(true);
                                                 return;
                                             }
                                             setSelectedCommentText(comment.text);
                                             setShowFlashcardFromCommentModal(true);
                                          }}
                                          className="flex items-center gap-1.5 text-xs font-bold text-black dark:text-black/40 dark:text-white/40 hover:text-amber-400 transition-colors ml-auto sm:ml-4"
                                       >
                                          <Layers size={14} /> 
                                          <span>Criar Flashcard {!isPremium && `(${Math.max(0, flashcardsLeft)} restantes)`}</span>
                                       </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

            {/* BOTTOM BAR - FIXED AND BIGGER */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#f9fafc] dark:bg-[#01142e] border-t border-purple-500/10 p-4 z-40">
              <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 w-full">
                <button 
                  disabled={currentQuestionIndex === 0}
                  onClick={handlePrevQuestion}
                  className="flex items-center justify-center gap-2 h-14 px-5 rounded-2xl bg-white dark:bg-[#0a2346] text-black dark:text-black/60 dark:text-white/60 hover:text-black dark:text-white hover:bg-[#1a2f4a] disabled:opacity-30 disabled:pointer-events-none transition-all font-bold text-sm shrink-0"
                >
                  <ArrowLeft size={20} />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                <div className="flex gap-3 flex-1 justify-end">
                  {!isResolved ? (
                    <>
                      <button 
                        onClick={currentQuestionIndex < questions.length - 1 ? handleNextQuestion : handleRequestExit}
                        className="h-14 px-6 md:px-8 bg-white dark:bg-[#0a2346] text-black dark:text-black/80 dark:text-white/80 rounded-2xl font-bold hover:bg-[#1a2f4a] hover:text-black dark:text-white transition-all text-sm flex items-center justify-center shrink-0"
                      >
                        Pular
                      </button>
                      <button 
                        onClick={handleResolve}
                        disabled={!selectedAlternative}
                        className="h-14 px-6 md:px-8 w-full max-w-[280px] bg-purple-500 text-white rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-2 hover:bg-purple-600 disabled:bg-black/5 dark:disabled:bg-white/5 disabled:text-black/30 dark:disabled:text-white/30 transition-all shadow-[0_4px_20px_rgba(168,85,247,0.3)] disabled:shadow-none"
                      >
                        <span>Confirmar</span>
                        <ChevronRight size={20} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleRetryQuestion}
                        title="Responder esta questão novamente"
                        className="h-14 px-4 md:px-5 bg-white dark:bg-[#0a2346] text-black dark:text-black/80 dark:text-white/80 rounded-2xl font-bold hover:bg-[#1a2f4a] hover:text-purple-400 transition-all text-xs md:text-sm flex items-center justify-center gap-2 shrink-0 border border-purple-500/20"
                      >
                        <RotateCcw size={16} />
                        <span className="hidden sm:inline">Responder novamente</span>
                      </button>
                      <button 
                        onClick={currentQuestionIndex < questions.length - 1 ? handleNextQuestion : handleRequestExit}
                        className="h-14 px-6 md:px-8 w-full max-w-[320px] bg-purple-500 text-white rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-2 hover:bg-purple-600 transition-all shadow-[0_4px_20px_rgba(168,85,247,0.3)]"
                      >
                        {currentQuestionIndex < questions.length - 1 ? <span>Próxima Questão</span> : <span>Finalizar Módulo</span>}
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateFlashcardFromCommentModal 
        isOpen={showFlashcardFromCommentModal}
        onClose={() => setShowFlashcardFromCommentModal(false)}
        onFlashcardCreated={() => {
          setActiveCommentFlashcardCount(prev => prev + 1);
          if (onNavigate) onNavigate('flashcards');
        }}
        initialSubject={activeQuestion?.discipline || ''}
        initialTopic={activeQuestion?.topic || ''}
        questionText={activeQuestion?.text || ''}
        commentText={selectedCommentText}
        questionId={activeQuestion?.id || ''}
      />

      {activeQuestion && (
        <CreateFlashcardFromQuestionModal 
          isOpen={showFlashcardFromQuestionModal}
          onClose={() => setShowFlashcardFromQuestionModal(false)}
          onFlashcardCreated={() => {
            setActiveQuestionFlashcardCount(prev => prev + 1);
            if (onNavigate) onNavigate('flashcards');
          }}
          initialSubject={activeQuestion.discipline}
          initialTopic={activeQuestion.topic}
          questionId={activeQuestion.id}
          questionText={activeQuestion.text}
          question={activeQuestion}
          initialFront={""}
          initialBack={(() => {
            const rawBack = activeQuestion.explanation || activeQuestion.alternatives.find(a => a.isCorrect)?.text || '';
            const cleaned = rawBack.replace(/^[A-Ea-e]\s*[:\-\)\.]\s*/, '');
            return cleaned ? (cleaned.charAt(0).toUpperCase() + cleaned.slice(1)) : '';
          })()}
        />
      )}

      <AnimatePresence>
        {warningMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] bg-white dark:bg-[#0a2346] border-2 border-rose-500/50 text-black dark:text-white px-5 py-4 rounded-2xl shadow-[0_16px_40px_rgba(244,63,94,0.15)] font-bold flex items-center gap-3 max-w-sm w-[90%] sm:w-auto text-center"
          >
            <XCircle size={20} className="text-rose-500 shrink-0" />
            <span className="text-sm font-sans tracking-wide leading-snug">{warningMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

