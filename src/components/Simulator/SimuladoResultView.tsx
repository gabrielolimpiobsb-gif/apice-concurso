import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, Clock, AlertCircle, Award, BarChart2, 
  RotateCcw, ArrowRight, Bookmark, Layers, Check, ChevronDown, ChevronUp,
  Share2, ArrowLeft, TrendingUp, TrendingDown, Target, HelpCircle
} from 'lucide-react';
import { Simulado, Question } from '../../types';
import { cn } from '../../lib/utils';
import { simuladoService } from '../../services/simuladoService';
import { QuestionTextFormatter } from '../QuestionTextFormatter';
import { CreateFlashcardFromQuestionModal } from '../CreateFlashcardFromQuestionModal';

interface SimuladoResultViewProps {
  simulado: Simulado;
  allQuestions: Question[];
  onReview: () => void;
  onRedoSame: () => void;
  onRedoNew: () => void;
  onCreateFromMistakes: () => void;
  onExit: () => void;
}

export function SimuladoResultView({
  simulado,
  allQuestions,
  onReview,
  onRedoSame,
  onRedoNew,
  onCreateFromMistakes,
  onExit
}: SimuladoResultViewProps) {
  const result = simulado.result;
  const questionsMap = new Map(allQuestions.map(q => [q.id, q]));

  // Selected question for flashcard creation modal
  const [flashcardQuestion, setFlashcardQuestion] = useState<Question | null>(null);
  const [expandedWrongQuestion, setExpandedWrongQuestion] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(simuladoService.getFavoriteQuestionIds());
  const [showRedoModal, setShowRedoModal] = useState(false);

  if (!result) {
    return (
      <div className="p-8 text-center text-black dark:text-white">
        Resultado não encontrado para este simulado.
      </div>
    );
  }

  const formatSeconds = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatDurationFull = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${h}h ${m}m ${s}s`;
    }
    return `${m}m ${s}s`;
  };

  // Wrong questions list
  const wrongQuestionIds = simulado.questionIds.filter(id => {
    const ans = simulado.answers[id];
    return ans && ans.selectedAlternativeId && !ans.isCorrect;
  });

  const toggleFavorite = (questionId: string) => {
    simuladoService.toggleFavoriteQuestion(questionId);
    setFavoriteIds(simuladoService.getFavoriteQuestionIds());
  };

  const disciplinesList = Object.values(result.disciplineStats).sort((a, b) => b.percentage - a.percentage);
  const topicsList = Object.values(result.topicStats).sort((a, b) => b.percentage - a.percentage);
  const boardsList = Object.values(result.boardStats).sort((a, b) => b.percentage - a.percentage);

  // Slowest / fastest discipline
  const sortedByTime = [...disciplinesList].filter(d => d.total > 0).sort((a, b) => b.timeSpentSeconds - a.timeSpentSeconds);
  const slowestDiscipline = sortedByTime.length > 0 ? sortedByTime[0] : null;
  const fastestDiscipline = sortedByTime.length > 1 ? sortedByTime[sortedByTime.length - 1] : null;

  return (
    <div className="min-h-[100dvh] bg-[#f9fafc] dark:bg-[#01142e] text-black dark:text-white pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0a2346]/95 backdrop-blur-md border-b border-purple-500/10 px-4 py-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white transition-colors border border-purple-500/10"
              title="Voltar"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-500 block">Resultado da Prova</span>
              <h1 className="text-base sm:text-lg font-bold text-black dark:text-white truncate max-w-sm sm:max-w-md">
                {simulado.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onReview}
              className="px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Revisar Simulado</span>
            </button>

            <button
              onClick={() => setShowRedoModal(true)}
              className="px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white font-bold text-xs border border-purple-500/20 transition-all flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Refazer</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Top Hero Performance Card */}
        <div className="bg-white dark:bg-[#0a2346] rounded-2xl border border-purple-500/20 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-purple-500/10">
            <div className="text-center sm:text-left">
              <span className="text-xs uppercase tracking-wider font-bold text-black/50 dark:text-white/50 block mb-1">
                Aproveitamento Geral
              </span>
              <div className="flex items-baseline justify-center sm:justify-start gap-3">
                <span className="text-4xl sm:text-5xl font-black text-purple-500">
                  {result.scorePercentage}%
                </span>
                <span className="text-lg sm:text-xl font-bold text-black/60 dark:text-white/60">
                  ({result.correctCount} de {result.totalQuestions} acertos)
                </span>
              </div>
              <p className="text-xs text-black/60 dark:text-white/60 mt-2">
                Tempo total dedicado: <span className="font-semibold text-black dark:text-white">{formatDurationFull(result.totalTimeSpentSeconds)}</span>
              </p>
            </div>

            {/* Visual Performance Bar */}
            <div className="w-full sm:w-64 flex flex-col gap-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-green-600 dark:text-green-400">{result.correctCount} acertos</span>
                <span className="text-red-500">{result.incorrectCount} erros</span>
                {result.unansweredCount > 0 && (
                  <span className="text-black/40 dark:text-white/40">{result.unansweredCount} em branco</span>
                )}
              </div>
              <div className="w-full h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden flex">
                <div 
                  className="bg-green-500 h-full transition-all" 
                  style={{ width: `${(result.correctCount / result.totalQuestions) * 100}%` }} 
                />
                <div 
                  className="bg-red-500 h-full transition-all" 
                  style={{ width: `${(result.incorrectCount / result.totalQuestions) * 100}%` }} 
                />
                <div 
                  className="bg-black/20 dark:bg-white/20 h-full transition-all" 
                  style={{ width: `${(result.unansweredCount / result.totalQuestions) * 100}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
            <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-purple-500/10 rounded-xl p-3.5">
              <span className="text-[10px] uppercase font-bold text-black/40 dark:text-white/40 block mb-1">Acertos</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">{result.correctCount}</span>
            </div>
            <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-purple-500/10 rounded-xl p-3.5">
              <span className="text-[10px] uppercase font-bold text-black/40 dark:text-white/40 block mb-1">Erros</span>
              <span className="text-xl font-bold text-red-500">{result.incorrectCount}</span>
            </div>
            <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-purple-500/10 rounded-xl p-3.5">
              <span className="text-[10px] uppercase font-bold text-black/40 dark:text-white/40 block mb-1">Não Respondidas</span>
              <span className="text-xl font-bold text-black/60 dark:text-white/60">{result.unansweredCount}</span>
            </div>
            <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-purple-500/10 rounded-xl p-3.5">
              <span className="text-[10px] uppercase font-bold text-black/40 dark:text-white/40 block mb-1">Tempo Médio / Qst</span>
              <span className="text-xl font-bold text-purple-500 font-mono">{formatSeconds(result.averageTimePerQuestionSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Diagnóstico Inteligente & Análise de Tempo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Diagnóstico Real */}
          <div className="bg-white dark:bg-[#0a2346] rounded-2xl border border-purple-500/20 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target size={18} className="text-purple-500" />
                <h2 className="text-base font-bold text-black dark:text-white">Diagnóstico do Simulado</h2>
              </div>

              <div className="space-y-3 text-xs">
                {result.strongTopics.length > 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 font-bold text-green-700 dark:text-green-300 mb-1">
                      <TrendingUp size={14} />
                      <span>Principal Ponto Forte</span>
                    </div>
                    <p className="text-black/80 dark:text-white/80">
                      {result.strongTopics[0].topic} ({result.strongTopics[0].discipline}) — <strong className="text-green-600 dark:text-green-400">{result.strongTopics[0].percentage}% de acerto</strong>
                    </p>
                  </div>
                )}

                {result.weakTopics.length > 0 ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 font-bold text-red-700 dark:text-red-300 mb-1">
                      <TrendingDown size={14} />
                      <span>Ponto de Atenção</span>
                    </div>
                    <p className="text-black/80 dark:text-white/80">
                      {result.weakTopics[0].topic} ({result.weakTopics[0].discipline}) — <strong className="text-red-500">{result.weakTopics[0].percentage}% de acerto</strong>
                    </p>
                  </div>
                ) : (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                    <p className="font-bold text-purple-600 dark:text-purple-400">Excelente consistência!</p>
                    <p className="text-black/70 dark:text-white/70 mt-0.5">Nenhum ponto de atenção crítico identificado neste simulado.</p>
                  </div>
                )}

                {result.recommendations.length > 0 && (
                  <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-purple-500/10 rounded-xl p-3">
                    <span className="font-bold text-black/80 dark:text-white/80 block mb-1">Recomendações Práticas</span>
                    <ul className="space-y-1 text-black/70 dark:text-white/70 list-disc list-inside">
                      {result.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Button */}
            {wrongQuestionIds.length > 0 && (
              <button
                onClick={onCreateFromMistakes}
                className="mt-4 w-full py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-xs border border-purple-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Criar simulado com meus erros ({wrongQuestionIds.length})</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* Análise de Tempo */}
          <div className="bg-white dark:bg-[#0a2346] rounded-2xl border border-purple-500/20 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-purple-500" />
              <h2 className="text-base font-bold text-black dark:text-white">Análise de Tempo & Eficiência</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-purple-500/10">
                <span className="text-black/70 dark:text-white/70">Tempo médio nas questões acertadas:</span>
                <span className="font-bold text-green-600 dark:text-green-400 font-mono">
                  {formatSeconds(result.averageTimeCorrectSeconds)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-purple-500/10">
                <span className="text-black/70 dark:text-white/70">Tempo médio nas questões erradas:</span>
                <span className="font-bold text-red-500 font-mono">
                  {formatSeconds(result.averageTimeIncorrectSeconds)}
                </span>
              </div>

              {slowestDiscipline && (
                <div className="flex justify-between items-center p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-purple-500/10">
                  <span className="text-black/70 dark:text-white/70">Matéria em que gastou mais tempo:</span>
                  <span className="font-bold text-black dark:text-white truncate max-w-[160px]">
                    {slowestDiscipline.discipline} ({formatSeconds(slowestDiscipline.timeSpentSeconds)})
                  </span>
                </div>
              )}

              {result.slowestQuestionTimeSeconds ? (
                <div className="flex justify-between items-center p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-purple-500/10">
                  <span className="text-black/70 dark:text-white/70">Questão mais demorada:</span>
                  <span className="font-bold text-purple-500 font-mono">
                    {formatSeconds(result.slowestQuestionTimeSeconds)}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Análise por Matéria */}
        <div className="bg-white dark:bg-[#0a2346] rounded-2xl border border-purple-500/20 p-5 sm:p-6 shadow-sm">
          <h2 className="text-base font-bold text-black dark:text-white mb-4">
            Desempenho por Matéria
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-purple-500/10 text-black/50 dark:text-white/50 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Matéria</th>
                  <th className="py-2.5 px-3 text-center">Acertos</th>
                  <th className="py-2.5 px-3 text-center">Erros</th>
                  <th className="py-2.5 px-3 text-center">Aproveitamento</th>
                  <th className="py-2.5 px-3 text-right">Tempo Gasto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {disciplinesList.map((ds) => (
                  <tr key={ds.discipline} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="py-3 px-3 font-semibold text-black dark:text-white">
                      {ds.discipline}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-green-600 dark:text-green-400 font-bold">
                      {ds.correct}/{ds.total}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-red-500">
                      {ds.incorrect}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md font-bold font-mono text-[11px]",
                        ds.percentage >= 70 
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : ds.percentage >= 50
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-red-500/10 text-red-500"
                      )}>
                        {ds.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-black/60 dark:text-white/60">
                      {formatSeconds(ds.timeSpentSeconds)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Análise por Assunto */}
        {topicsList.length > 0 && (
          <div className="bg-white dark:bg-[#0a2346] rounded-2xl border border-purple-500/20 p-5 sm:p-6 shadow-sm">
            <h2 className="text-base font-bold text-black dark:text-white mb-4">
              Desempenho por Assunto
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topicsList.map(ts => (
                <div key={ts.topic} className="bg-black/[0.02] dark:bg-white/[0.02] border border-purple-500/10 rounded-xl p-3 flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <span className="text-xs font-bold text-black dark:text-white truncate block">
                      {ts.topic}
                    </span>
                    <span className="text-[10px] text-black/50 dark:text-white/50 block">
                      {ts.discipline} • {ts.correct}/{ts.total} questões
                    </span>
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg font-bold font-mono text-xs shrink-0",
                    ts.percentage >= 70
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : ts.percentage >= 50
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-red-500/10 text-red-500"
                  )}>
                    {ts.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Análise por Banca */}
        {boardsList.length > 0 && (
          <div className="bg-white dark:bg-[#0a2346] rounded-2xl border border-purple-500/20 p-5 sm:p-6 shadow-sm">
            <h2 className="text-base font-bold text-black dark:text-white mb-4">
              Desempenho por Banca Examinadora
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {boardsList.map(b => (
                <div key={b.board} className="bg-black/[0.02] dark:bg-white/[0.02] border border-purple-500/10 rounded-xl p-3 text-center">
                  <span className="text-xs font-bold text-black dark:text-white block truncate mb-1">
                    {b.board}
                  </span>
                  <span className="text-lg font-bold text-purple-500 font-mono">
                    {b.percentage}%
                  </span>
                  <span className="text-[10px] text-black/40 dark:text-white/40 block mt-0.5">
                    {b.correct}/{b.total} corretas
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção: Questões Que Você Errou */}
        {wrongQuestionIds.length > 0 && (
          <div className="bg-white dark:bg-[#0a2346] rounded-2xl border border-purple-500/20 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/10 mb-4">
              <div>
                <h2 className="text-base font-bold text-black dark:text-white">
                  Questões que Você Errou ({wrongQuestionIds.length})
                </h2>
                <p className="text-xs text-black/60 dark:text-white/60">
                  Revise o gabarito e comentários para fixar os conteúdos com dificuldade.
                </p>
              </div>

              <button
                onClick={onCreateFromMistakes}
                className="px-3 py-1.5 rounded-lg bg-purple-500 text-white text-xs font-bold shadow-sm hover:bg-purple-600 transition-colors"
              >
                Simulado dos Erros
              </button>
            </div>

            <div className="space-y-4">
              {wrongQuestionIds.map((qId, idx) => {
                const q = questionsMap.get(qId);
                if (!q) return null;
                const ans = simulado.answers[qId];
                const isExpanded = expandedWrongQuestion === qId;
                const isFav = favoriteIds.includes(qId);

                const userAlt = q.alternatives.find(a => a.id === ans?.selectedAlternativeId);
                const correctAlt = q.alternatives.find(a => a.isCorrect);

                return (
                  <div 
                    key={qId}
                    className="border border-red-500/20 bg-red-500/[0.02] rounded-xl p-4 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                          <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500">
                            Erro #{idx + 1}
                          </span>
                          {q.discipline && (
                            <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70">
                              {q.discipline}
                            </span>
                          )}
                          {q.topic && (
                            <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60">
                              {q.topic}
                            </span>
                          )}
                          {q.board && (
                            <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60">
                              {q.board}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleFavorite(qId)}
                          className={cn(
                            "p-1.5 rounded-lg border transition-colors",
                            isFav 
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-500" 
                              : "bg-black/5 dark:bg-white/5 border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
                          )}
                          title="Favoritar questão"
                        >
                          <Bookmark size={14} className={isFav ? "fill-amber-500" : ""} />
                        </button>

                        <button
                          onClick={() => setFlashcardQuestion(q)}
                          className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"
                          title="Criar flashcard"
                        >
                          <Layers size={14} />
                        </button>

                        <button
                          onClick={() => setExpandedWrongQuestion(isExpanded ? null : qId)}
                          className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black/60 dark:text-white/60 transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Question Excerpt or Full */}
                    <div className="mt-3 text-xs leading-relaxed text-black dark:text-white">
                      <QuestionTextFormatter text={isExpanded ? q.text : `${q.text.slice(0, 200)}...`} />
                    </div>

                    {/* Answers Comparison */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                        <span className="text-[10px] font-bold uppercase text-red-500 block mb-0.5">Sua resposta</span>
                        <p className="text-black/80 dark:text-white/80 line-clamp-2">{userAlt?.text || 'Não respondeu'}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
                        <span className="text-[10px] font-bold uppercase text-green-600 dark:text-green-400 block mb-0.5">Gabarito correto</span>
                        <p className="text-black/80 dark:text-white/80 line-clamp-2">{correctAlt?.text}</p>
                      </div>
                    </div>

                    {/* Expanded Explanation */}
                    {isExpanded && q.explanation && (
                      <div className="mt-4 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-purple-500/10 text-xs">
                        <span className="font-bold text-purple-500 block mb-1">Comentário do Professor</span>
                        <div className="text-black/80 dark:text-white/80 leading-relaxed">
                          <QuestionTextFormatter text={q.explanation} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Redo Modal */}
      {showRedoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a2346] max-w-sm w-full rounded-2xl border border-purple-500/20 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-black dark:text-white mb-2">
              Refazer Simulado
            </h3>
            <p className="text-xs text-black/60 dark:text-white/60 mb-5">
              Escolha como deseja praticar novamente este simulado:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowRedoModal(false);
                  onRedoSame();
                }}
                className="w-full p-3 rounded-xl border border-purple-500/20 hover:border-purple-500 bg-black/[0.02] dark:bg-white/[0.02] text-left transition-all"
              >
                <span className="block text-xs font-bold text-black dark:text-white">Repetir mesmas questões</span>
                <span className="block text-[11px] text-black/50 dark:text-white/50 mt-0.5">
                  Refaça exatamente a mesma prova para testar sua retenção.
                </span>
              </button>

              <button
                onClick={() => {
                  setShowRedoModal(false);
                  onRedoNew();
                }}
                className="w-full p-3 rounded-xl border border-purple-500/20 hover:border-purple-500 bg-black/[0.02] dark:bg-white/[0.02] text-left transition-all"
              >
                <span className="block text-xs font-bold text-purple-500">Gerar novo simulado com mesmos filtros</span>
                <span className="block text-[11px] text-black/50 dark:text-white/50 mt-0.5">
                  Mantém os mesmos critérios mas sorteia outras questões do banco.
                </span>
              </button>

              <button
                onClick={() => setShowRedoModal(false)}
                className="w-full py-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-bold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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
