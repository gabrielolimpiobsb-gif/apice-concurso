import React, { useState } from 'react';
import { 
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, HelpCircle, 
  Bookmark, Layers, ChevronLeft, ChevronRight, Check, X
} from 'lucide-react';
import { Simulado, Question } from '../../types';
import { cn } from '../../lib/utils';
import { QuestionTextFormatter } from '../QuestionTextFormatter';
import { simuladoService } from '../../services/simuladoService';
import { CreateFlashcardFromQuestionModal } from '../CreateFlashcardFromQuestionModal';

interface SimuladoReviewViewProps {
  simulado: Simulado;
  allQuestions: Question[];
  onBackToResult: () => void;
}

export function SimuladoReviewView({
  simulado,
  allQuestions,
  onBackToResult
}: SimuladoReviewViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterMode, setFilterMode] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>(simuladoService.getFavoriteQuestionIds());
  const [flashcardQuestion, setFlashcardQuestion] = useState<Question | null>(null);

  const questionsMap = new Map(allQuestions.map(q => [q.id, q]));

  // Filter questions according to filterMode
  const filteredQuestionIds = simulado.questionIds.filter(qId => {
    const ans = simulado.answers[qId];
    if (filterMode === 'all') return true;
    if (filterMode === 'correct') return ans?.isCorrect === true;
    if (filterMode === 'incorrect') return ans && ans.selectedAlternativeId && !ans.isCorrect;
    if (filterMode === 'unanswered') return !ans || !ans.selectedAlternativeId;
    return true;
  });

  const activeQuestionId = filteredQuestionIds[currentIndex] || simulado.questionIds[0];
  const activeQuestion = questionsMap.get(activeQuestionId);
  const activeAnswer = simulado.answers[activeQuestionId];

  const isCorrect = activeAnswer?.isCorrect === true;
  const isIncorrect = activeAnswer && activeAnswer.selectedAlternativeId && !activeAnswer.isCorrect;
  const isUnanswered = !activeAnswer || !activeAnswer.selectedAlternativeId;

  const toggleFavorite = (qId: string) => {
    simuladoService.toggleFavoriteQuestion(qId);
    setFavoriteIds(simuladoService.getFavoriteQuestionIds());
  };

  const isFav = favoriteIds.includes(activeQuestionId);

  return (
    <div className="min-h-[100dvh] bg-[#f9fafc] dark:bg-[#01142e] text-black dark:text-white pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0a2346]/95 backdrop-blur-md border-b border-purple-500/10 px-4 py-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToResult}
              className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white transition-colors border border-purple-500/10"
              title="Voltar ao resultado"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-500 block">Revisão do Simulado</span>
              <h1 className="text-sm sm:text-base font-bold text-black dark:text-white truncate max-w-xs sm:max-w-sm">
                {simulado.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleFavorite(activeQuestionId)}
              className={cn(
                "p-2 rounded-xl border transition-all",
                isFav
                  ? "bg-amber-500/10 border-amber-500 text-amber-500"
                  : "bg-black/5 dark:bg-white/5 border-purple-500/10 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
              )}
              title="Favoritar questão"
            >
              <Bookmark size={16} className={isFav ? "fill-amber-500" : ""} />
            </button>

            {activeQuestion && (
              <button
                onClick={() => setFlashcardQuestion(activeQuestion)}
                className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white border border-purple-500/10 transition-colors"
                title="Criar Flashcard"
              >
                <Layers size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 text-xs font-bold">
          <button
            onClick={() => { setFilterMode('all'); setCurrentIndex(0); }}
            className={cn(
              "px-3 py-1.5 rounded-lg border transition-all shrink-0",
              filterMode === 'all'
                ? "bg-purple-500 text-white border-purple-500 shadow-sm"
                : "bg-black/5 dark:bg-white/5 border-transparent text-black/60 dark:text-white/60"
            )}
          >
            Todas ({simulado.questionIds.length})
          </button>

          <button
            onClick={() => { setFilterMode('correct'); setCurrentIndex(0); }}
            className={cn(
              "px-3 py-1.5 rounded-lg border transition-all shrink-0 flex items-center gap-1.5",
              filterMode === 'correct'
                ? "bg-green-500 text-white border-green-500 shadow-sm"
                : "bg-black/5 dark:bg-white/5 border-transparent text-green-600 dark:text-green-400"
            )}
          >
            <Check size={13} />
            <span>Acertos ({simulado.result?.correctCount || 0})</span>
          </button>

          <button
            onClick={() => { setFilterMode('incorrect'); setCurrentIndex(0); }}
            className={cn(
              "px-3 py-1.5 rounded-lg border transition-all shrink-0 flex items-center gap-1.5",
              filterMode === 'incorrect'
                ? "bg-red-500 text-white border-red-500 shadow-sm"
                : "bg-black/5 dark:bg-white/5 border-transparent text-red-500"
            )}
          >
            <X size={13} />
            <span>Erros ({simulado.result?.incorrectCount || 0})</span>
          </button>

          <button
            onClick={() => { setFilterMode('unanswered'); setCurrentIndex(0); }}
            className={cn(
              "px-3 py-1.5 rounded-lg border transition-all shrink-0",
              filterMode === 'unanswered'
                ? "bg-black/40 text-white border-black/40 shadow-sm"
                : "bg-black/5 dark:bg-white/5 border-transparent text-black/60 dark:text-white/60"
            )}
          >
            Em branco ({simulado.result?.unansweredCount || 0})
          </button>
        </div>
      </header>

      {/* Main Review Area */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {activeQuestion ? (
          <div className="bg-white dark:bg-[#0a2346] rounded-2xl border border-purple-500/20 p-5 sm:p-8 shadow-sm">
            {/* Header with Result Tag */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-purple-500/10 mb-6">
              <div className="flex flex-wrap items-center gap-2">
                {/* Result Pill */}
                {isCorrect && (
                  <span className="px-3 py-1 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>Você Acertou</span>
                  </span>
                )}
                {isIncorrect && (
                  <span className="px-3 py-1 rounded-lg bg-red-500/10 text-red-500 border border-red-500/30 text-xs font-bold flex items-center gap-1">
                    <XCircle size={14} />
                    <span>Você Errou</span>
                  </span>
                )}
                {isUnanswered && (
                  <span className="px-3 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 border border-black/10 dark:border-white/10 text-xs font-bold flex items-center gap-1">
                    <HelpCircle size={14} />
                    <span>Não Respondida</span>
                  </span>
                )}

                {activeQuestion.discipline && (
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                    {activeQuestion.discipline}
                  </span>
                )}
                {activeQuestion.topic && (
                  <span className="px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 text-xs">
                    {activeQuestion.topic}
                  </span>
                )}
                {activeQuestion.board && (
                  <span className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/5 text-black/50 dark:text-white/50 text-xs">
                    {activeQuestion.board}
                  </span>
                )}
              </div>

              <span className="text-xs font-bold text-black/50 dark:text-white/50">
                Questão {currentIndex + 1} de {filteredQuestionIds.length}
              </span>
            </div>

            {/* Question Text */}
            <div className="text-black dark:text-white text-base leading-relaxed mb-8">
              <QuestionTextFormatter text={activeQuestion.text} />
            </div>

            {/* Alternatives with Clear Differentiation */}
            <div className="space-y-3 mb-8">
              {activeQuestion.alternatives.map((alt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isUserSelected = activeAnswer?.selectedAlternativeId === alt.id;
                const isAlternativeCorrect = alt.isCorrect;

                return (
                  <div
                    key={alt.id}
                    className={cn(
                      "p-4 rounded-xl border transition-all flex items-start gap-3",
                      isAlternativeCorrect
                        ? "bg-green-500/10 border-green-500 ring-1 ring-green-500/30 text-black dark:text-white"
                        : isUserSelected && !isAlternativeCorrect
                          ? "bg-red-500/10 border-red-500 ring-1 ring-red-500/30 text-black dark:text-white"
                          : "bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10 text-black/70 dark:text-white/70"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5",
                      isAlternativeCorrect
                        ? "bg-green-500 text-white"
                        : isUserSelected
                          ? "bg-red-500 text-white"
                          : "bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60"
                    )}>
                      {letter}
                    </div>

                    <div className="flex-1 text-sm leading-normal">
                      <span>{alt.text}</span>
                      {isUserSelected && (
                        <span className="block mt-1 text-[11px] font-bold text-black/60 dark:text-white/60">
                          (Sua resposta)
                        </span>
                      )}
                      {isAlternativeCorrect && (
                        <span className="block mt-1 text-[11px] font-bold text-green-600 dark:text-green-400">
                          (Gabarito oficial)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Professor's Explanation */}
            {activeQuestion.explanation && (
              <div className="p-5 rounded-xl bg-purple-500/[0.04] border border-purple-500/20 text-xs">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block mb-2">
                  Comentário do Professor & Justificativa do Gabarito
                </span>
                <div className="text-black/80 dark:text-white/80 leading-relaxed">
                  <QuestionTextFormatter text={activeQuestion.explanation} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-12 text-black/60 dark:text-white/60">
            Nenhuma questão encontrada para este filtro.
          </div>
        )}
      </main>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0a2346]/95 backdrop-blur-md border-t border-purple-500/10 px-4 py-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
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

          <span className="text-xs font-bold text-black/60 dark:text-white/60">
            {currentIndex + 1} de {filteredQuestionIds.length}
          </span>

          <button
            onClick={() => setCurrentIndex(prev => Math.min(filteredQuestionIds.length - 1, prev + 1))}
            disabled={currentIndex === filteredQuestionIds.length - 1}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border",
              currentIndex === filteredQuestionIds.length - 1
                ? "opacity-40 cursor-not-allowed bg-black/5 dark:bg-white/5 border-transparent text-black/40 dark:text-white/40"
                : "bg-white dark:bg-[#01142e] border-purple-500/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            <span>Próxima</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </footer>

      {/* Flashcard Modal */}
      {flashcardQuestion && (
        <CreateFlashcardFromQuestionModal
          isOpen={true}
          onClose={() => setFlashcardQuestion(null)}
          question={flashcardQuestion}
          questionId={flashcardQuestion.id}
          questionText={flashcardQuestion.text}
          initialSubject={flashcardQuestion.discipline || ''}
          initialTopic={flashcardQuestion.topic || ''}
          initialBack={flashcardQuestion.explanation || ''}
        />
      )}
    </div>
  );
}
