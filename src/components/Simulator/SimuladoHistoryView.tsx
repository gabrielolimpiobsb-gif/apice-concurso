import React, { useState, useMemo } from 'react';
import { 
  Clock, Play, Eye, RotateCcw, Trash2, CheckCircle2, Pause, 
  Search, ArrowUpDown, Filter, AlertCircle, FileText
} from 'lucide-react';
import { Simulado } from '../../types';
import { cn } from '../../lib/utils';
import { simuladoService } from '../../services/simuladoService';

interface SimuladoHistoryViewProps {
  simulados: Simulado[];
  onResume: (simulado: Simulado) => void;
  onViewResult: (simulado: Simulado) => void;
  onReview: (simulado: Simulado) => void;
  onRedo: (simulado: Simulado) => void;
  onDeleted: () => void;
}

export function SimuladoHistoryView({
  simulados,
  onResume,
  onViewResult,
  onReview,
  onRedo,
  onDeleted
}: SimuladoHistoryViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress_or_paused'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'best' | 'worst' | 'most_questions' | 'duration'>('recent');

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este simulado do histórico?')) {
      await simuladoService.deleteSimulado(id);
      onDeleted();
    }
  };

  const filteredAndSorted = useMemo(() => {
    let list = [...simulados];

    // Status filter
    if (statusFilter === 'completed') {
      list = list.filter(s => s.status === 'completed');
    } else if (statusFilter === 'in_progress_or_paused') {
      list = list.filter(s => s.status === 'in_progress' || s.status === 'paused');
    }

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => 
        s.title.toLowerCase().includes(q) ||
        (s.config?.bancas && s.config.bancas.some(b => b.toLowerCase().includes(q))) ||
        (s.config?.cargo && s.config.cargo.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'recent') {
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
      if (sortBy === 'best') {
        const scoreA = a.result?.scorePercentage ?? -1;
        const scoreB = b.result?.scorePercentage ?? -1;
        return scoreB - scoreA;
      }
      if (sortBy === 'worst') {
        const scoreA = a.result?.scorePercentage ?? 999;
        const scoreB = b.result?.scorePercentage ?? 999;
        return scoreA - scoreB;
      }
      if (sortBy === 'most_questions') {
        return (b.questionIds?.length || 0) - (a.questionIds?.length || 0);
      }
      if (sortBy === 'duration') {
        return (b.timeSpentSeconds || 0) - (a.timeSpentSeconds || 0);
      }
      return 0;
    });

    return list;
  }, [simulados, statusFilter, search, sortBy]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0a2346] p-4 rounded-2xl border border-purple-500/20 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 text-black/40 dark:text-white/40" />
          <input
            type="text"
            placeholder="Pesquisar por título, banca ou concurso..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-purple-500/10 bg-black/[0.02] dark:bg-white/[0.02] text-black dark:text-white text-xs"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'completed', label: 'Finalizados' },
            { id: 'in_progress_or_paused', label: 'Em Andamento / Pausados' },
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id as any)}
              className={cn(
                "px-3 py-1.5 rounded-lg border font-bold transition-all shrink-0",
                statusFilter === st.id
                  ? "bg-purple-500 text-white border-purple-500"
                  : "bg-black/5 dark:bg-white/5 border-transparent text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
              )}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 shrink-0">
          <ArrowUpDown size={14} className="text-black/40 dark:text-white/40" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-purple-500/10 bg-black/[0.02] dark:bg-white/[0.02] text-black dark:text-white font-bold"
          >
            <option value="recent">Mais recentes</option>
            <option value="best">Melhor desempenho</option>
            <option value="worst">Pior desempenho</option>
            <option value="most_questions">Mais questões</option>
            <option value="duration">Maior duração</option>
          </select>
        </div>
      </div>

      {/* List */}
      {filteredAndSorted.length === 0 ? (
        <div className="bg-white dark:bg-[#0a2346] rounded-2xl border border-purple-500/20 p-12 text-center shadow-sm">
          <FileText size={36} className="mx-auto text-black/30 dark:text-white/30 mb-3" />
          <h3 className="font-bold text-black dark:text-white text-sm mb-1">
            Nenhum simulado encontrado
          </h3>
          <p className="text-black/60 dark:text-white/60 max-w-sm mx-auto">
            {search || statusFilter !== 'all'
              ? 'Tente ajustar os termos de pesquisa ou os filtros acima.'
              : 'Você ainda não realizou nenhum simulado. Escolha um dos cursos ou treinos rápidos para começar sua preparação.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSorted.map(sim => {
            const isCompleted = sim.status === 'completed';
            const isPausedOrInProgress = sim.status === 'paused' || sim.status === 'in_progress';
            const answeredCount = Object.values(sim.answers || {}).filter(a => a?.selectedAlternativeId).length;
            const totalCount = sim.questionIds.length;

            return (
              <div
                key={sim.id}
                className="bg-white dark:bg-[#0a2346] rounded-2xl border border-purple-500/20 p-4 sm:p-5 shadow-sm hover:border-purple-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Badge */}
                    {isCompleted ? (
                      <span className="px-2.5 py-0.5 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>Finalizado</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center gap-1">
                        <Pause size={12} />
                        <span>{sim.status === 'paused' ? 'Pausado' : 'Em andamento'}</span>
                      </span>
                    )}

                    <span className="text-[11px] text-black/50 dark:text-white/50">
                      {new Date(sim.createdAt).toLocaleDateString('pt-BR')} às {new Date(sim.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {sim.config?.mode === 'mistakes' && (
                      <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 font-bold text-[10px]">
                        Caderno de Erros
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-black dark:text-white text-sm truncate">
                    {sim.title}
                  </h3>

                  {/* Metrics Row */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-black/70 dark:text-white/70">
                    <span>
                      <strong>{totalCount}</strong> questões
                    </span>
                    <span>•</span>
                    {isCompleted && sim.result ? (
                      <>
                        <span className="font-bold text-purple-500 font-mono">
                          {sim.result.scorePercentage}% ({sim.result.correctCount} acertos)
                        </span>
                        <span>•</span>
                        <span className="font-mono text-black/60 dark:text-white/60">
                          {formatTime(sim.result.totalTimeSpentSeconds)}
                        </span>
                      </>
                    ) : (
                      <span className="text-black/60 dark:text-white/60">
                        {answeredCount} de {totalCount} respondidas ({Math.round((answeredCount / totalCount) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isPausedOrInProgress && (
                    <button
                      onClick={() => onResume(sim)}
                      className="px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Play size={14} />
                      <span>Continuar</span>
                    </button>
                  )}

                  {isCompleted && (
                    <>
                      <button
                        onClick={() => onViewResult(sim)}
                        className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-xs border border-purple-500/20 transition-all flex items-center gap-1.5"
                      >
                        <Eye size={14} />
                        <span>Resultado</span>
                      </button>

                      <button
                        onClick={() => onReview(sim)}
                        className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white font-bold text-xs border border-purple-500/10 transition-all"
                      >
                        Revisar
                      </button>

                      <button
                        onClick={() => onRedo(sim)}
                        className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white border border-purple-500/10 transition-all"
                        title="Refazer simulado"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </>
                  )}

                  <button
                    onClick={e => handleDelete(sim.id, e)}
                    className="p-2 rounded-xl text-black/40 dark:text-white/40 hover:text-red-500 hover:bg-red-500/10 border border-transparent transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
