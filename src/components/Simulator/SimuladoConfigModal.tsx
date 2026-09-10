import React, { useState, useMemo } from 'react';
import { 
  X, Clock, Settings2, Sliders, Check, AlertCircle, Save, 
  HelpCircle, ChevronDown, ChevronUp, Search, Layers, Play
} from 'lucide-react';
import { Question, SimuladoConfig, QuestionType, Performance } from '../../types';
import { cn } from '../../lib/utils';
import { simuladoService } from '../../services/simuladoService';

interface SimuladoConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (config: SimuladoConfig) => void;
  allQuestions: Question[];
  userPerformance?: Performance[];
  initialConfig?: Partial<SimuladoConfig>;
}

export function SimuladoConfigModal({
  isOpen,
  onClose,
  onStart,
  allQuestions,
  userPerformance = [],
  initialConfig
}: SimuladoConfigModalProps) {
  // Form State
  const [name, setName] = useState(initialConfig?.name || `Simulado #${new Date().toLocaleDateString('pt-BR')}`);
  const [totalQuestions, setTotalQuestions] = useState<number>(initialConfig?.totalQuestions || 30);
  const [timerMinutes, setTimerMinutes] = useState<number>(initialConfig?.timerMinutes ?? 60);
  const [isRealExamMode, setIsRealExamMode] = useState<boolean>(initialConfig?.isRealExamMode ?? true);
  const [shuffle, setShuffle] = useState<boolean>(initialConfig?.shuffle ?? true);
  const [statusQuestoes, setStatusQuestoes] = useState<SimuladoConfig['statusQuestoes']>(initialConfig?.statusQuestoes || 'todas');
  const [distributionMode, setDistributionMode] = useState<SimuladoConfig['distributionMode']>(initialConfig?.distributionMode || 'proportional');
  const [qtyPerDiscipline, setQtyPerDiscipline] = useState<Record<string, number>>(initialConfig?.qtyPerDiscipline || {});

  // Filters State
  const [selectedBancas, setSelectedBancas] = useState<string[]>(initialConfig?.bancas || []);
  const [selectedDisciplinas, setSelectedDisciplinas] = useState<string[]>(initialConfig?.disciplinas || []);
  const [selectedAssuntos, setSelectedAssuntos] = useState<string[]>(initialConfig?.assuntos || []);
  const [selectedAnos, setSelectedAnos] = useState<number[]>(initialConfig?.anos || []);
  const [selectedDificuldades, setSelectedDificuldades] = useState<string[]>(initialConfig?.dificuldades || []);
  const [selectedTipos, setSelectedTipos] = useState<QuestionType[]>(initialConfig?.tiposQuestao || []);
  const [cargoFilter, setCargoFilter] = useState<string>(initialConfig?.cargo || '');

  // UI state
  const [disciplineSearch, setDisciplineSearch] = useState('');
  const [bancaSearch, setBancaSearch] = useState('');
  const [templateSavedMsg, setTemplateSavedMsg] = useState(false);

  // Available unique lists from allQuestions
  const availableBancas = useMemo(() => {
    const set = new Set<string>();
    allQuestions.forEach(q => q.board && set.add(q.board.trim()));
    return Array.from(set).sort();
  }, [allQuestions]);

  const availableDisciplinas = useMemo(() => {
    const set = new Set<string>();
    allQuestions.forEach(q => q.discipline && set.add(q.discipline.trim()));
    return Array.from(set).sort();
  }, [allQuestions]);

  const availableAssuntos = useMemo(() => {
    const set = new Set<string>();
    allQuestions.forEach(q => {
      if (selectedDisciplinas.length === 0 || (q.discipline && selectedDisciplinas.includes(q.discipline))) {
        if (q.topic) set.add(q.topic.trim());
      }
    });
    return Array.from(set).sort();
  }, [allQuestions, selectedDisciplinas]);

  const availableAnos = useMemo(() => {
    const set = new Set<number>();
    allQuestions.forEach(q => q.year && set.add(q.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [allQuestions]);

  // Current real-time available questions count matching selected filters
  const currentConfig: SimuladoConfig = useMemo(() => ({
    name: name.trim() || 'Simulado Personalizado',
    mode: 'custom',
    totalQuestions,
    timerMinutes,
    isRealExamMode,
    shuffle,
    bancas: selectedBancas,
    disciplinas: selectedDisciplinas,
    assuntos: selectedAssuntos,
    anos: selectedAnos,
    dificuldades: selectedDificuldades,
    tiposQuestao: selectedTipos,
    statusQuestoes,
    selectionMode: 'random',
    distributionMode,
    qtyPerDiscipline,
    cargo: cargoFilter.trim() || undefined
  }), [
    name, totalQuestions, timerMinutes, isRealExamMode, shuffle,
    selectedBancas, selectedDisciplinas, selectedAssuntos, selectedAnos,
    selectedDificuldades, selectedTipos, statusQuestoes, distributionMode,
    qtyPerDiscipline, cargoFilter
  ]);

  const previewCheck = useMemo(() => {
    return simuladoService.generateSimuladoQuestions(currentConfig, allQuestions, userPerformance);
  }, [currentConfig, allQuestions, userPerformance]);

  if (!isOpen) return null;

  const handleSaveAsTemplate = () => {
    simuladoService.saveTemplate(name, currentConfig);
    setTemplateSavedMsg(true);
    setTimeout(() => setTemplateSavedMsg(false), 2500);
  };

  const handleStartSimulado = () => {
    if (previewCheck.countAvailable === 0) {
      alert('Não há questões disponíveis com os filtros selecionados. Reduza ou altere os filtros para prosseguir.');
      return;
    }
    onStart(currentConfig);
  };

  const toggleItem = <T,>(item: T, list: T[], setter: (v: T[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter(x => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-[#0a2346] max-w-3xl w-full rounded-2xl border border-purple-500/20 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-purple-500/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
              <Settings2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-black dark:text-white">Criar Novo Simulado</h2>
              <p className="text-xs text-black/60 dark:text-white/60">Configure parâmetros e filtros profissionais para sua prova</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          {/* Section: Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-black dark:text-white mb-1">
                Nome do Simulado
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Simulado Geral - Polícia Federal 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-purple-500/20 bg-black/[0.02] dark:bg-white/[0.02] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
              />
            </div>

            {/* Mode selection: Real Exam vs Training */}
            <div>
              <label className="block font-bold text-black dark:text-white mb-1.5">
                Modo de Prova
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsRealExamMode(true)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    isRealExamMode
                      ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30"
                      : "border-purple-500/10 bg-black/[0.02] dark:bg-white/[0.02] hover:border-purple-500/30"
                  )}
                >
                  <span className="block font-bold text-black dark:text-white">Modo Prova Real</span>
                  <span className="block text-[11px] text-black/60 dark:text-white/60 mt-0.5">
                    Cronômetro rigoroso, gabarito e comentários ocultos durante a prova.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsRealExamMode(false)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    !isRealExamMode
                      ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30"
                      : "border-purple-500/10 bg-black/[0.02] dark:bg-white/[0.02] hover:border-purple-500/30"
                  )}
                >
                  <span className="block font-bold text-black dark:text-white">Modo Treinamento</span>
                  <span className="block text-[11px] text-black/60 dark:text-white/60 mt-0.5">
                    Ritmo de estudo flexível com foco no aprendizado contínuo.
                  </span>
                </button>
              </div>
            </div>

            {/* Number of Questions & Timer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-black dark:text-white mb-1">
                  Quantidade de Questões ({totalQuestions})
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[10, 20, 30, 50, 60, 80, 100].map(qNum => (
                    <button
                      key={qNum}
                      type="button"
                      onClick={() => setTotalQuestions(qNum)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg border font-mono font-bold transition-all",
                        totalQuestions === qNum
                          ? "bg-purple-500 text-white border-purple-500"
                          : "bg-black/5 dark:bg-white/5 border-transparent text-black/70 dark:text-white/70"
                      )}
                    >
                      {qNum}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={totalQuestions}
                  onChange={e => setTotalQuestions(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-black dark:text-white mb-1">
                  Tempo Limite ({timerMinutes === 0 ? 'Sem limite' : `${timerMinutes} min`})
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[0, 30, 45, 60, 90, 120, 180].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTimerMinutes(m)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg border font-mono font-bold transition-all",
                        timerMinutes === m
                          ? "bg-purple-500 text-white border-purple-500"
                          : "bg-black/5 dark:bg-white/5 border-transparent text-black/70 dark:text-white/70"
                      )}
                    >
                      {m === 0 ? 'Livre' : `${m}m`}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-black/50 dark:text-white/50">
                  {timerMinutes > 0 ? `Aproximadamente ${(timerMinutes * 60 / totalQuestions / 60).toFixed(1)} min por questão.` : 'Você controlará seu tempo sem encerramento automático.'}
                </p>
              </div>
            </div>

            {/* Scope of questions: all, unanswered, errors, favorites */}
            <div>
              <label className="block font-bold text-black dark:text-white mb-1.5">
                Filtro de Histórico do Usuário
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'todas', label: 'Todas as questões' },
                  { id: 'nao_respondidas', label: 'Não resolvidas' },
                  { id: 'erros', label: 'Apenas erros anteriores' },
                  { id: 'favoritas', label: 'Apenas favoritas' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStatusQuestoes(opt.id as any)}
                    className={cn(
                      "p-2 rounded-xl border text-center font-bold transition-all",
                      statusQuestoes === opt.id
                        ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400"
                        : "bg-black/[0.02] dark:bg-white/[0.02] border-purple-500/10 text-black/70 dark:text-white/70"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-purple-500/10 pt-4 space-y-4">
            <h3 className="font-bold text-black dark:text-white text-sm">
              Filtros do Banco de Questões
            </h3>

            {/* Disciplinas Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-black dark:text-white">
                  Disciplinas ({selectedDisciplinas.length > 0 ? selectedDisciplinas.length : 'Todas'})
                </label>
                {selectedDisciplinas.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDisciplinas([])}
                    className="text-[11px] text-purple-500 hover:underline"
                  >
                    Limpar disciplinas
                  </button>
                )}
              </div>

              <div className="relative mb-2">
                <Search size={14} className="absolute left-3 top-2.5 text-black/40 dark:text-white/40" />
                <input
                  type="text"
                  placeholder="Pesquisar disciplina..."
                  value={disciplineSearch}
                  onChange={e => setDisciplineSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-purple-500/10 bg-black/[0.02] dark:bg-white/[0.02] text-black dark:text-white text-xs"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 border border-purple-500/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01]">
                {availableDisciplinas
                  .filter(d => !disciplineSearch || d.toLowerCase().includes(disciplineSearch.toLowerCase()))
                  .map(disc => {
                    const isSelected = selectedDisciplinas.includes(disc);
                    return (
                      <button
                        key={disc}
                        type="button"
                        onClick={() => toggleItem(disc, selectedDisciplinas, setSelectedDisciplinas)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg border text-left transition-all",
                          isSelected
                            ? "bg-purple-500 text-white border-purple-500 font-bold"
                            : "bg-black/5 dark:bg-white/5 border-transparent text-black/70 dark:text-white/70 hover:border-purple-500/30"
                        )}
                      >
                        {disc}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Bancas Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-black dark:text-white">
                  Banca Examinadora ({selectedBancas.length > 0 ? selectedBancas.length : 'Todas'})
                </label>
                {selectedBancas.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedBancas([])}
                    className="text-[11px] text-purple-500 hover:underline"
                  >
                    Limpar bancas
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 border border-purple-500/10 rounded-xl">
                {availableBancas.map(banca => {
                  const isSelected = selectedBancas.includes(banca);
                  return (
                    <button
                      key={banca}
                      type="button"
                      onClick={() => toggleItem(banca, selectedBancas, setSelectedBancas)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg border text-left transition-all",
                        isSelected
                          ? "bg-purple-500 text-white border-purple-500 font-bold"
                          : "bg-black/5 dark:bg-white/5 border-transparent text-black/70 dark:text-white/70"
                      )}
                    >
                      {banca}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dificuldade & Tipo de Questão */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-black dark:text-white mb-1.5">
                  Dificuldade
                </label>
                <div className="flex gap-2">
                  {['Fácil', 'Média', 'Difícil'].map(dif => {
                    const isSelected = selectedDificuldades.includes(dif);
                    return (
                      <button
                        key={dif}
                        type="button"
                        onClick={() => toggleItem(dif, selectedDificuldades, setSelectedDificuldades)}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg border text-center font-bold transition-all",
                          isSelected
                            ? "bg-purple-500 text-white border-purple-500"
                            : "bg-black/5 dark:bg-white/5 border-transparent text-black/70 dark:text-white/70"
                        )}
                      >
                        {dif}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-black dark:text-white mb-1.5">
                  Tipo de Questão
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'multiple_choice', label: 'Múltipla Escolha' },
                    { id: 'true_false', label: 'Certo / Errado' }
                  ].map(t => {
                    const isSelected = selectedTipos.includes(t.id as any);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleItem(t.id as any, selectedTipos, setSelectedTipos)}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg border text-center font-bold transition-all",
                          isSelected
                            ? "bg-purple-500 text-white border-purple-500"
                            : "bg-black/5 dark:bg-white/5 border-transparent text-black/70 dark:text-white/70"
                        )}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Real-time verification banner */}
          <div className={cn(
            "p-4 rounded-xl border flex items-center justify-between gap-3",
            previewCheck.countAvailable > 0
              ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300"
              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
          )}>
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <div>
                <span className="font-bold block">
                  {previewCheck.countAvailable > 0
                    ? `${previewCheck.countAvailable} questões disponíveis no banco para esta combinação.`
                    : 'Nenhuma questão compatível encontrada.'}
                </span>
                <span className="text-[11px] opacity-80 block">
                  {previewCheck.countAvailable < totalQuestions && previewCheck.countAvailable > 0
                    ? `O simulado será gerado com as ${previewCheck.countAvailable} questões existentes (sem questões inventadas).`
                    : previewCheck.countAvailable === 0
                      ? 'Reduza ou desmarque filtros para encontrar questões.'
                      : `Serão sorteadas ${totalQuestions} questões reais.`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-purple-500/10 bg-black/[0.01] dark:bg-white/[0.01] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSaveAsTemplate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white font-bold text-xs border border-purple-500/10 transition-colors"
          >
            <Save size={14} />
            <span>{templateSavedMsg ? "Modelo salvo!" : "Salvar como modelo"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white font-bold text-xs border border-black/10 dark:border-white/10 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleStartSimulado}
              disabled={previewCheck.countAvailable === 0}
              className={cn(
                "flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all text-white",
                previewCheck.countAvailable > 0
                  ? "bg-purple-500 hover:bg-purple-600"
                  : "bg-gray-400 cursor-not-allowed opacity-50"
              )}
            >
              <Play size={14} />
              <span>Iniciar Simulado</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
