import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, Pause, Play, Flag, Check, HelpCircle, ArrowLeft, ArrowRight, 
  CheckCircle2, AlertTriangle, X, Grid, ChevronLeft, ChevronRight, Eye
} from 'lucide-react';
import { Question, Simulado, SimuladoAnswer } from '../../types';
import { QuestionTextFormatter } from '../QuestionTextFormatter';
import { simuladoService } from '../../services/simuladoService';
import { cn } from '../../lib/utils';

interface SimuladoRunnerProps {
  simulado: Simulado;
  allQuestions: Question[];
  onFinish: (completedSimulado: Simulado) => void;
  onExit: () => void;
}

export function SimuladoRunner({ simulado: initialSimulado, allQuestions, onFinish, onExit }: SimuladoRunnerProps) {
  const [simulado, setSimulado] = useState<Simulado>(initialSimulado);
  const [currentIndex, setCurrentIndex] = useState(initialSimulado.currentIndex || 0);
  const [isPaused, setIsPaused] = useState(initialSimulado.status === 'paused');
  const [showQuestionGrid, setShowQuestionGrid] = useState(false);
  const [onlyFlaggedFilter, setOnlyFlaggedFilter] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [timeExpiredAlert, setTimeExpiredAlert] = useState(false);

  // Time tracking
  const [remainingSeconds, setRemainingSeconds] = useState(initialSimulado.remainingSeconds ?? (initialSimulado.timeLimitSeconds || 0));
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(initialSimulado.timeSpentSeconds || 0);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Questions lookup
  const questionsMap = useRef(new Map(allQuestions.map(q => [q.id, q]))).current;
  const currentQuestionId = simulado.questionIds[currentIndex];
  const currentQuestion = questionsMap.get(currentQuestionId);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  // Record time spent on current question before switching or pausing
  const recordCurrentQuestionTime = () => {
    const now = Date.now();
    const elapsedOnThisQuestion = Math.round((now - questionStartTimeRef.current) / 1000);
    questionStartTimeRef.current = now;

    if (currentQuestionId && elapsedOnThisQuestion > 0) {
      const existingAnswer = simulado.answers[currentQuestionId] || { timeSpentSeconds: 0 };
      const updatedAnswer: SimuladoAnswer = {
        ...existingAnswer,
        timeSpentSeconds: (existingAnswer.timeSpentSeconds || 0) + elapsedOnThisQuestion
      };
      
      const updatedSimulado: Simulado = {
        ...simulado,
        currentIndex,
        timeSpentSeconds,
        remainingSeconds,
        answers: {
          ...simulado.answers,
          [currentQuestionId]: updatedAnswer
        }
      };
      setSimulado(updatedSimulado);
      simuladoService.saveSimulado(updatedSimulado);
    }
  };

  // Timer effect
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeSpentSeconds(prev => {
        const nextSpent = prev + 1;
        return nextSpent;
      });

      if (simulado.timeLimitSeconds > 0) {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimeExpiredAlert(true);
            handleAutoFinish();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, simulado.timeLimitSeconds]);

  // Periodic auto-save every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        const updated: Simulado = {
          ...simulado,
          currentIndex,
          timeSpentSeconds,
          remainingSeconds,
          status: 'in_progress'
        };
        simuladoService.saveSimulado(updated);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [simulado, currentIndex, timeSpentSeconds, remainingSeconds, isPaused]);

  // Handle selecting an alternative
  const handleSelectAlternative = (altId: string) => {
    if (!currentQuestion) return;

    const now = Date.now();
    const elapsedOnThisQuestion = Math.round((now - questionStartTimeRef.current) / 1000);
    questionStartTimeRef.current = now;

    const correctAlt = currentQuestion.alternatives.find(a => a.isCorrect);
    const isCorrect = correctAlt ? correctAlt.id === altId : false;

    const existingAnswer = simulado.answers[currentQuestionId] || { timeSpentSeconds: 0 };
    const updatedAnswer: SimuladoAnswer = {
      selectedAlternativeId: altId,
      isCorrect,
      timeSpentSeconds: (existingAnswer.timeSpentSeconds || 0) + elapsedOnThisQuestion,
      answeredAt: now
    };

    const updated: Simulado = {
      ...simulado,
      currentIndex,
      timeSpentSeconds,
      remainingSeconds,
      answers: {
        ...simulado.answers,
        [currentQuestionId]: updatedAnswer
      }
    };

    setSimulado(updated);
    simuladoService.saveSimulado(updated);
  };

  // Toggle review flag
  const handleToggleFlag = () => {
    if (!currentQuestionId) return;
    const isFlagged = simulado.markedForReview.includes(currentQuestionId);
    const updatedMarked = isFlagged 
      ? simulado.markedForReview.filter(id => id !== currentQuestionId)
      : [...simulado.markedForReview, currentQuestionId];

    const updated: Simulado = {
      ...simulado,
      markedForReview: updatedMarked
    };
    setSimulado(updated);
    simuladoService.saveSimulado(updated);
  };

  // Navigation
  const handleNavigate = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= simulado.questionIds.length) return;
    recordCurrentQuestionTime();
    setCurrentIndex(newIndex);
    questionStartTimeRef.current = Date.now();
  };

  // Pause & Resume
  const handlePause = () => {
    recordCurrentQuestionTime();
    setIsPaused(true);
    const updated: Simulado = {
      ...simulado,
      currentIndex,
      status: 'paused',
      timeSpentSeconds,
      remainingSeconds
    };
    setSimulado(updated);
    simuladoService.saveSimulado(updated);
  };

  const handleResume = () => {
    setIsPaused(false);
    questionStartTimeRef.current = Date.now();
    const updated: Simulado = {
      ...simulado,
      status: 'in_progress'
    };
    setSimulado(updated);
    simuladoService.saveSimulado(updated);
  };

  // Finalization
  const handleFinalizeConfirmed = () => {
    recordCurrentQuestionTime();
    const resultStats = simuladoService.calculateResult({
      ...simulado,
      timeSpentSeconds
    }, allQuestions);

    const completed: Simulado = {
      ...simulado,
      status: 'completed',
      finishedAt: Date.now(),
      timeSpentSeconds,
      remainingSeconds,
      result: resultStats
    };

    simuladoService.saveSimulado(completed);
    simuladoService.syncSimuladoToOverallPerformance(completed, allQuestions);
    onFinish(completed);
  };

  const handleAutoFinish = () => {
    const resultStats = simuladoService.calculateResult({
      ...simulado,
      timeSpentSeconds
    }, allQuestions);

    const completed: Simulado = {
      ...simulado,
      status: 'completed',
      finishedAt: Date.now(),
      timeSpentSeconds,
      remainingSeconds: 0,
      result: resultStats
    };

    simuladoService.saveSimulado(completed);
    simuladoService.syncSimuladoToOverallPerformance(completed, allQuestions);
    onFinish(completed);
  };

  // Stats for confirmation
  const totalQuestions = simulado.questionIds.length;
  const answeredCount = Object.values(simulado.answers).filter(a => a?.selectedAlternativeId).length;
  const unansweredCount = totalQuestions - answeredCount;
  const flaggedCount = simulado.markedForReview.length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const currentAnswer = simulado.answers[currentQuestionId];
  const isCurrentFlagged = simulado.markedForReview.includes(currentQuestionId);

  return (
    <div className="min-h-[100dvh] bg-[#f9fafc] dark:bg-[#01142e] flex flex-col select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0a2346]/95 backdrop-blur-md border-b border-purple-500/10 px-4 py-3 sm:px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Simulado Title & Question Count */}
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-black dark:text-white truncate">
              {simulado.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60 font-medium">
              <span>Questão {currentIndex + 1} de {totalQuestions}</span>
              <span>•</span>
              <span>{progressPercent}% concluído</span>
            </div>
          </div>

          {/* Right: Timer & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Stopwatch / Countdown */}
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono font-bold text-xs sm:text-sm transition-colors",
              simulado.timeLimitSeconds > 0 && remainingSeconds <= 300
                ? "bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400 animate-pulse"
                : "bg-black/5 dark:bg-white/5 border-purple-500/20 text-black dark:text-white"
            )}>
              <Clock size={15} className={simulado.timeLimitSeconds > 0 && remainingSeconds <= 300 ? "text-red-500" : "text-purple-500"} />
              <span>
                {simulado.timeLimitSeconds > 0 
                  ? formatTime(remainingSeconds)
                  : formatTime(timeSpentSeconds)
                }
              </span>
            </div>

            {/* Pause Button */}
            <button
              onClick={handlePause}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white font-bold text-xs border border-black/10 dark:border-white/10 transition-colors"
              title="Pausar simulado"
            >
              <Pause size={14} />
              <span className="hidden sm:inline">Pausar</span>
            </button>

            {/* Question Grid Button */}
            <button
              onClick={() => setShowQuestionGrid(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white font-bold text-xs border border-black/10 dark:border-white/10 transition-colors"
              title="Abrir grade de questões"
            >
              <Grid size={14} />
              <span className="hidden sm:inline">Grade</span>
            </button>

            {/* Finish Button */}
            <button
              onClick={() => setShowFinishConfirm(true)}
              className="px-3.5 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs shadow-sm transition-all"
            >
              Finalizar
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/10 dark:bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
          <div 
            className="bg-purple-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Exam Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 pb-28 flex flex-col">
        {currentQuestion ? (
          <div className="bg-white dark:bg-[#0a2346] rounded-2xl border border-purple-500/20 p-5 sm:p-8 shadow-sm flex flex-col">
            {/* Question Tags & Flag Button */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-purple-500/10 mb-6">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                {currentQuestion.discipline && (
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    {currentQuestion.discipline}
                  </span>
                )}
                {currentQuestion.topic && (
                  <span className="px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 border border-black/10 dark:border-white/10">
                    {currentQuestion.topic}
                  </span>
                )}
                {currentQuestion.board && (
                  <span className="px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 border border-black/10 dark:border-white/10">
                    {currentQuestion.board}
                  </span>
                )}
                {currentQuestion.year && (
                  <span className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 font-mono">
                    {currentQuestion.year}
                  </span>
                )}
                {currentQuestion.cargo && (
                  <span className="px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60">
                    {currentQuestion.cargo}
                  </span>
                )}
              </div>

              {/* Flag Toggle Button */}
              <button
                onClick={handleToggleFlag}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                  isCurrentFlagged
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400"
                    : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                )}
              >
                <Flag size={14} className={isCurrentFlagged ? "fill-amber-500 text-amber-500" : ""} />
                <span>{isCurrentFlagged ? "Marcada para revisão" : "Marcar para revisão"}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="text-black dark:text-white text-base leading-relaxed mb-8">
              <QuestionTextFormatter text={currentQuestion.text} />
            </div>

            {/* Alternatives */}
            <div className="space-y-3">
              {currentQuestion.alternatives.map((alt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = currentAnswer?.selectedAlternativeId === alt.id;

                return (
                  <button
                    key={alt.id}
                    onClick={() => handleSelectAlternative(alt.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer group",
                      isSelected
                        ? "bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/30 text-black dark:text-white font-medium"
                        : "bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10 hover:border-purple-500/30 text-black/80 dark:text-white/80"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors mt-0.5",
                      isSelected
                        ? "bg-purple-500 text-white shadow-sm"
                        : "bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60 group-hover:bg-purple-500/20 group-hover:text-purple-500"
                    )}>
                      {letter}
                    </div>
                    <div className="flex-1 text-sm leading-normal">
                      {alt.text}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center p-12 text-black/60 dark:text-white/60">
            Questão não encontrada no banco.
          </div>
        )}
      </main>

      {/* Sticky Bottom Navigation Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0a2346]/95 backdrop-blur-md border-t border-purple-500/10 px-4 py-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Previous Button */}
          <button
            onClick={() => handleNavigate(currentIndex - 1)}
            disabled={currentIndex === 0}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border",
              currentIndex === 0
                ? "opacity-40 cursor-not-allowed bg-black/5 dark:bg-white/5 border-transparent text-black/40 dark:text-white/40"
                : "bg-white dark:bg-[#01142e] border-purple-500/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            <ArrowLeft size={16} />
            <span>Anterior</span>
          </button>

          {/* Center Indicator */}
          <span className="text-xs font-bold text-black/60 dark:text-white/60">
            {currentIndex + 1} de {totalQuestions}
          </span>

          {/* Next Button */}
          <button
            onClick={() => handleNavigate(currentIndex + 1)}
            disabled={currentIndex === totalQuestions - 1}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border",
              currentIndex === totalQuestions - 1
                ? "opacity-40 cursor-not-allowed bg-black/5 dark:bg-white/5 border-transparent text-black/40 dark:text-white/40"
                : "bg-white dark:bg-[#01142e] border-purple-500/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            <span>Próxima</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </footer>

      {/* Question Grid Drawer / Modal */}
      {showQuestionGrid && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white dark:bg-[#0a2346] w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-purple-500/10">
              <div>
                <h2 className="text-base font-bold text-black dark:text-white">Grade de Questões</h2>
                <p className="text-xs text-black/60 dark:text-white/60">
                  {answeredCount} de {totalQuestions} respondidas
                </p>
              </div>
              <button
                onClick={() => setShowQuestionGrid(false)}
                className="p-2 rounded-lg text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between px-5 py-3 bg-black/[0.02] dark:bg-white/[0.02] border-b border-purple-500/10 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <Check size={14} />
                <span>Respondida</span>
              </div>
              <div className="flex items-center gap-1.5 text-black/50 dark:text-white/50">
                <HelpCircle size={14} />
                <span>Pendente</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Flag size={14} />
                <span>Revisão</span>
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="px-5 py-3 border-b border-purple-500/10">
              <button
                onClick={() => setOnlyFlaggedFilter(prev => !prev)}
                className={cn(
                  "w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all",
                  onlyFlaggedFilter
                    ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400"
                    : "bg-black/5 dark:bg-white/5 border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                )}
              >
                <Flag size={14} />
                <span>Mostrar apenas marcadas para revisão ({flaggedCount})</span>
              </button>
            </div>

            {/* Grid Items */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-5 gap-2.5 content-start">
              {simulado.questionIds.map((qId, idx) => {
                const ans = simulado.answers[qId];
                const isAnswered = !!ans?.selectedAlternativeId;
                const isFlagged = simulado.markedForReview.includes(qId);
                const isCurrent = idx === currentIndex;

                if (onlyFlaggedFilter && !isFlagged) {
                  return null;
                }

                return (
                  <button
                    key={qId}
                    onClick={() => {
                      handleNavigate(idx);
                      setShowQuestionGrid(false);
                    }}
                    className={cn(
                      "h-11 rounded-xl font-bold text-xs flex flex-col items-center justify-center relative transition-all border",
                      isCurrent
                        ? "ring-2 ring-purple-500 border-purple-500 shadow-md font-extrabold"
                        : "border-purple-500/10",
                      isAnswered
                        ? "bg-purple-500 text-white"
                        : "bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10"
                    )}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-white text-[9px] shadow-sm">
                        <Flag size={8} className="fill-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-purple-500/10">
              <button
                onClick={() => {
                  setShowQuestionGrid(false);
                  setShowFinishConfirm(true);
                }}
                className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm shadow-sm transition-all"
              >
                Finalizar Simulado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Screen Overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a2346] max-w-md w-full rounded-2xl border border-purple-500/20 p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
              <Pause size={28} />
            </div>

            <h2 className="text-xl font-bold text-black dark:text-white mb-1">
              Simulado Pausado
            </h2>
            <p className="text-xs text-black/60 dark:text-white/60 mb-6">
              Seu progresso foi salvo automaticamente. O cronômetro está interrompido.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 text-left">
              <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-purple-500/10">
                <span className="text-[10px] uppercase font-bold text-black/40 dark:text-white/40 block">Respondidas</span>
                <span className="text-base font-bold text-black dark:text-white">{answeredCount} de {totalQuestions}</span>
              </div>
              <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-purple-500/10">
                <span className="text-[10px] uppercase font-bold text-black/40 dark:text-white/40 block">Tempo Restante</span>
                <span className="text-base font-bold text-purple-500 font-mono">
                  {simulado.timeLimitSeconds > 0 ? formatTime(remainingSeconds) : formatTime(timeSpentSeconds)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResume}
                className="w-full py-3.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Play size={16} />
                <span>Continuar simulado</span>
              </button>

              <button
                onClick={onExit}
                className="w-full py-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white font-bold text-xs border border-black/10 dark:border-white/10 transition-colors"
              >
                Salvar e sair para a lista de simulados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a2346] max-w-md w-full rounded-2xl border border-purple-500/20 p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4 border border-purple-500/20">
              <AlertTriangle size={24} />
            </div>

            <h2 className="text-lg font-bold text-black dark:text-white mb-1">
              Deseja finalizar o simulado?
            </h2>
            <p className="text-xs text-black/60 dark:text-white/60 mb-5">
              Revise seu status antes de concluir a prova:
            </p>

            <div className="space-y-2 mb-6 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-purple-500/10 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-black/70 dark:text-white/70">Questões não respondidas:</span>
                <span className={cn("font-bold font-mono", unansweredCount > 0 ? "text-amber-500" : "text-green-500")}>
                  {unansweredCount}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-black/70 dark:text-white/70">Marcadas para revisão:</span>
                <span className={cn("font-bold font-mono", flaggedCount > 0 ? "text-amber-500" : "text-black dark:text-white")}>
                  {flaggedCount}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-black/70 dark:text-white/70">Tempo restante:</span>
                <span className="font-bold font-mono text-purple-500">
                  {simulado.timeLimitSeconds > 0 ? formatTime(remainingSeconds) : formatTime(timeSpentSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white font-bold text-xs border border-black/10 dark:border-white/10 transition-colors"
              >
                Continuar simulado
              </button>

              <button
                onClick={handleFinalizeConfirmed}
                className="flex-1 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs shadow-sm transition-all"
              >
                Finalizar simulado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
