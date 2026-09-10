import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, RotateCcw, Clock, Target, Award, BookOpen, 
  GraduationCap, CheckCircle2, History, Settings2, Trash2, 
  Camera, ChevronRight, AlertCircle, FileText, Check, Layers
} from 'lucide-react';
import { Question, Performance, Simulado, SimuladoConfig, SavedSimuladoTemplate } from '../types';
import { cn } from '../lib/utils';
import { simuladoService } from '../services/simuladoService';
import { SimuladoRunner } from './Simulator/SimuladoRunner';
import { SimuladoResultView } from './Simulator/SimuladoResultView';
import { SimuladoReviewView } from './Simulator/SimuladoReviewView';
import { SimuladoConfigModal } from './Simulator/SimuladoConfigModal';
import { SimuladoHistoryView } from './Simulator/SimuladoHistoryView';

interface CourseItem {
  id: string;
  name: string;
  fullName: string;
  banca: string;
  ano: string;
  defaultCargo: string;
  nivel: string;
  defaultAvatar: string;
  disciplines: string[];
}

interface SimulatorProps {
  onStart?: (questions: Question[]) => void;
  questions: Question[];
  performance: Performance[];
  initialCourseId?: string | null;
}

export function SimulatorScreen({ onStart, questions, performance }: SimulatorProps) {
  // Navigation & Sub-views
  const [activeSubTab, setActiveSubTab] = useState<'cursos' | 'historico' | 'modelos'>('cursos');
  const [activeSimulado, setActiveSimulado] = useState<Simulado | null>(null);
  const [viewingResultSimulado, setViewingResultSimulado] = useState<Simulado | null>(null);
  const [reviewingSimulado, setReviewingSimulado] = useState<Simulado | null>(null);

  // Modals
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configModalInitial, setConfigModalInitial] = useState<Partial<SimuladoConfig> | undefined>(undefined);

  // Data
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [templates, setTemplates] = useState<SavedSimuladoTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default Preparatory Courses
  const defaultCourses: CourseItem[] = useMemo(() => [
    {
      id: "IBGE",
      name: "IBGE",
      fullName: "Instituto Brasileiro de Geografia e Estatística",
      banca: "IBFC",
      ano: "2026",
      defaultCargo: "Agente de Pesquisas e Mapeamento",
      nivel: "Nível Médio",
      defaultAvatar: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=150&auto=format&fit=crop&q=80",
      disciplines: ["Língua Portuguesa", "Matemática", "Raciocínio Lógico", "Ética no Serviço Público", "Geografia", "Noções de Informática"]
    },
    {
      id: "PRF",
      name: "Polícia Rodoviária Federal",
      fullName: "Departamento de Polícia Rodoviária Federal",
      banca: "Cebraspe",
      ano: "2026",
      defaultCargo: "Policial Rodoviário Federal",
      nivel: "Nível Superior",
      defaultAvatar: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=150&auto=format&fit=crop&q=80",
      disciplines: ["Língua Portuguesa", "Raciocínio Lógico", "Informática", "Física", "Legislação de Trânsito", "Direito Constitucional", "Direito Administrativo", "Direito Penal", "Direito Processual Penal"]
    },
    {
      id: "PF",
      name: "Polícia Federal",
      fullName: "Departamento de Polícia Federal",
      banca: "Cebraspe",
      ano: "2026",
      defaultCargo: "Agente e Escrivão de Polícia Federal",
      nivel: "Nível Superior",
      defaultAvatar: "https://images.unsplash.com/photo-1453733197781-704fa5988299?w=150&auto=format&fit=crop&q=80",
      disciplines: ["Língua Portuguesa", "Informática", "Raciocínio Lógico", "Contabilidade Geral", "Direito Constitucional", "Direito Administrativo", "Direito Penal", "Direito Processual Penal"]
    },
    {
      id: "Sedes-DF",
      name: "Sedes-DF",
      fullName: "Secretaria de Estado de Desenvolvimento Social do DF",
      banca: "IBFC",
      ano: "2026",
      defaultCargo: "Técnico e Especialista em Assistência Social",
      nivel: "Nível Médio e Superior",
      defaultAvatar: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&auto=format&fit=crop&q=80",
      disciplines: ["Língua Portuguesa", "Lei Orgânica do Distrito Federal", "Direito Constitucional", "Direito Administrativo", "Assistência Social", "Conhecimentos do DF"]
    },
    {
      id: "Caixa",
      name: "Caixa Econômica Federal",
      fullName: "Caixa Econômica Federal - Concurso Nacional",
      banca: "Cesgranrio",
      ano: "2026",
      defaultCargo: "Técnico Bancário Novo",
      nivel: "Nível Médio",
      defaultAvatar: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80",
      disciplines: ["Língua Portuguesa", "Língua Inglesa", "Matemática Financeira", "Conhecimentos Bancários", "Conhecimentos de Informática", "Atendimento ao Cliente"]
    },
    {
      id: "INSS",
      name: "INSS",
      fullName: "Instituto Nacional do Seguro Social",
      banca: "Cebraspe",
      ano: "2026",
      defaultCargo: "Técnico do Seguro Social",
      nivel: "Nível Médio",
      defaultAvatar: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=150&auto=format&fit=crop&q=80",
      disciplines: ["Direito Previdenciário", "Língua Portuguesa", "Ética no Serviço Público", "Direito Constitucional", "Direito Administrativo", "Raciocínio Lógico", "Noções de Informática"]
    }
  ], []);

  // Load Simulados and Templates
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [loadedSimulados, loadedTemplates] = await Promise.all([
        simuladoService.getSimulados(),
        simuladoService.getTemplates()
      ]);
      setSimulados(loadedSimulados);
      setTemplates(loadedTemplates);
    } catch (e) {
      console.error('Erro ao carregar simulados:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Check questions count for a course
  const getCourseQuestionsCount = (course: CourseItem) => {
    return questions.filter(q => {
      if (!q) return false;
      const discMatch = course.disciplines.some(d => q.discipline?.toLowerCase().includes(d.toLowerCase()));
      const cargoMatch = q.cargo?.toLowerCase().includes(course.defaultCargo.toLowerCase());
      const boardMatch = q.board?.toLowerCase().includes(course.banca.toLowerCase());
      return discMatch || cargoMatch || boardMatch;
    }).length;
  };

  // Launch a course-specific simulado with 1 click
  const handleStartCourseSimulado = (course: CourseItem) => {
    const config: SimuladoConfig = {
      name: `Simulado Oficial - ${course.name}`,
      mode: 'course',
      courseId: course.id,
      cargo: course.defaultCargo,
      totalQuestions: 30,
      timerMinutes: 60,
      isRealExamMode: true,
      shuffle: true,
      bancas: [course.banca],
      disciplinas: course.disciplines,
      assuntos: [],
      anos: [],
      dificuldades: [],
      tiposQuestao: [],
      statusQuestoes: 'todas',
      selectionMode: 'random',
      distributionMode: 'proportional'
    };

    const res = simuladoService.generateSimuladoQuestions(config, questions, performance);
    if (res.questions.length === 0) {
      // If strict filter yields 0, try broader filter matching course disciplines
      const fallbackQuestions = questions.filter(q => 
        course.disciplines.some(d => q.discipline?.toLowerCase().includes(d.toLowerCase()))
      ).slice(0, 30);

      if (fallbackQuestions.length === 0) {
        alert('Não há questões suficientes cadastradas no momento para este curso.');
        return;
      }

      startSimuladoWithQuestions(config, fallbackQuestions);
      return;
    }

    startSimuladoWithQuestions(config, res.questions);
  };

  // Customize course simulado
  const handleCustomizeCourse = (course: CourseItem) => {
    setConfigModalInitial({
      name: `Simulado Personalizado - ${course.name}`,
      bancas: [course.banca],
      disciplinas: course.disciplines,
      cargo: course.defaultCargo,
      totalQuestions: 30,
      timerMinutes: 60,
      isRealExamMode: true
    });
    setIsConfigModalOpen(true);
  };

  // Start with custom config
  const handleStartWithConfig = (config: SimuladoConfig) => {
    const res = simuladoService.generateSimuladoQuestions(config, questions, performance);
    if (res.questions.length === 0) {
      alert('Nenhuma questão encontrada com os filtros selecionados.');
      return;
    }
    setIsConfigModalOpen(false);
    startSimuladoWithQuestions(config, res.questions);
  };

  // Create Simulado object and start Runner
  const startSimuladoWithQuestions = (config: SimuladoConfig, selectedQuestions: Question[]) => {
    const newSimulado: Simulado = {
      id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: 'user',
      title: config.name,
      config,
      questionIds: selectedQuestions.map(q => q.id),
      status: 'in_progress',
      createdAt: Date.now(),
      startedAt: Date.now(),
      timeLimitSeconds: config.timerMinutes * 60,
      remainingSeconds: config.timerMinutes * 60,
      timeSpentSeconds: 0,
      currentIndex: 0,
      markedForReview: [],
      answers: {}
    };

    simuladoService.saveSimulado(newSimulado);
    setActiveSimulado(newSimulado);
    setViewingResultSimulado(null);
    setReviewingSimulado(null);
  };

  // Resume paused or in-progress simulado
  const handleResumeSimulado = (sim: Simulado) => {
    setActiveSimulado(sim);
    setViewingResultSimulado(null);
    setReviewingSimulado(null);
  };

  // Redo same questions
  const handleRedoSame = (sim: Simulado) => {
    const newSim: Simulado = {
      ...sim,
      id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      status: 'in_progress',
      createdAt: Date.now(),
      startedAt: Date.now(),
      finishedAt: undefined,
      currentIndex: 0,
      markedForReview: [],
      answers: {},
      result: undefined,
      timeSpentSeconds: 0,
      remainingSeconds: sim.timeLimitSeconds
    };
    simuladoService.saveSimulado(newSim);
    setActiveSimulado(newSim);
    setViewingResultSimulado(null);
    setReviewingSimulado(null);
  };

  // Redo new questions with same filters
  const handleRedoNew = (sim: Simulado) => {
    handleStartWithConfig(sim.config);
  };

  // Create Simulado from mistakes
  const handleCreateFromMistakes = (sourceSim?: Simulado) => {
    let wrongIds: string[] = [];

    if (sourceSim) {
      wrongIds = sourceSim.questionIds.filter(id => {
        const a = sourceSim.answers[id];
        return a && a.selectedAlternativeId && !a.isCorrect;
      });
    }

    if (wrongIds.length === 0) {
      // Pull from general user performance
      wrongIds = performance.filter(p => !p.isCorrect).map(p => p.questionId);
    }

    if (wrongIds.length === 0) {
      alert('Você não possui erros registrados para gerar um simulado de erros.');
      return;
    }

    const wrongQuestions = questions.filter(q => wrongIds.includes(q.id));
    if (wrongQuestions.length === 0) {
      alert('Nenhuma questão correspondente aos erros foi encontrada no banco atual.');
      return;
    }

    const config: SimuladoConfig = {
      name: `Simulado Caderno de Erros - ${new Date().toLocaleDateString('pt-BR')}`,
      mode: 'mistakes',
      totalQuestions: Math.min(wrongQuestions.length, 30),
      timerMinutes: Math.min(wrongQuestions.length * 2, 60),
      isRealExamMode: false,
      shuffle: true,
      bancas: [],
      disciplinas: [],
      assuntos: [],
      anos: [],
      dificuldades: [],
      tiposQuestao: [],
      statusQuestoes: 'erros',
      selectionMode: 'random',
      distributionMode: 'proportional'
    };

    startSimuladoWithQuestions(config, wrongQuestions.slice(0, 30));
  };

  // Quick 30-question test
  const handleQuickTest = () => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random()).slice(0, 30);
    const config: SimuladoConfig = {
      name: `Simulado Rápido (30 Questões) - ${new Date().toLocaleDateString('pt-BR')}`,
      mode: 'custom',
      totalQuestions: 30,
      timerMinutes: 45,
      isRealExamMode: true,
      shuffle: true,
      bancas: [],
      disciplinas: [],
      assuntos: [],
      anos: [],
      dificuldades: [],
      tiposQuestao: [],
      statusQuestoes: 'todas',
      selectionMode: 'random',
      distributionMode: 'proportional'
    };
    startSimuladoWithQuestions(config, shuffled);
  };

  // Check if there is an active/paused simulado
  const activeOrPaused = useMemo(() => {
    return simulados.find(s => s.status === 'in_progress' || s.status === 'paused');
  }, [simulados]);

  // Real non-invented metrics from finished simulados
  const realMetrics = useMemo(() => {
    const completed = simulados.filter(s => s.status === 'completed' && s.result);
    const count = completed.length;
    if (count === 0) {
      return {
        totalSimulados: 0,
        mediaAcertos: null,
        melhorDesempenho: null,
        tempoMedioPorQuestao: null
      };
    }

    const sumPercentages = completed.reduce((acc, s) => acc + (s.result?.scorePercentage || 0), 0);
    const maxPercentage = Math.max(...completed.map(s => s.result?.scorePercentage || 0));

    const totalSeconds = completed.reduce((acc, s) => acc + (s.result?.totalTimeSpentSeconds || 0), 0);
    const totalAnswered = completed.reduce((acc, s) => acc + (s.result?.answeredCount || 0), 0);
    const avgSeconds = totalAnswered > 0 ? Math.round(totalSeconds / totalAnswered) : null;

    return {
      totalSimulados: count,
      mediaAcertos: Math.round(sumPercentages / count),
      melhorDesempenho: maxPercentage,
      tempoMedioPorQuestao: avgSeconds
    };
  }, [simulados]);

  // FORMAT TIME
  const formatSeconds = (totalSeconds: number | null) => {
    if (totalSeconds === null || totalSeconds === 0) return '-';
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  // 1. ACTIVE SIMULADO RUNNER VIEW
  if (activeSimulado) {
    return (
      <SimuladoRunner
        simulado={activeSimulado}
        allQuestions={questions}
        onFinish={(completed) => {
          setActiveSimulado(null);
          setViewingResultSimulado(completed);
          loadData();
        }}
        onExit={() => {
          setActiveSimulado(null);
          loadData();
        }}
      />
    );
  }

  // 2. VIEW RESULT VIEW
  if (viewingResultSimulado) {
    return (
      <SimuladoResultView
        simulado={viewingResultSimulado}
        allQuestions={questions}
        onReview={() => {
          setReviewingSimulado(viewingResultSimulado);
          setViewingResultSimulado(null);
        }}
        onRedoSame={() => handleRedoSame(viewingResultSimulado)}
        onRedoNew={() => handleRedoNew(viewingResultSimulado)}
        onCreateFromMistakes={() => handleCreateFromMistakes(viewingResultSimulado)}
        onExit={() => {
          setViewingResultSimulado(null);
          loadData();
        }}
      />
    );
  }

  // 3. REVIEW VIEW
  if (reviewingSimulado) {
    return (
      <SimuladoReviewView
        simulado={reviewingSimulado}
        allQuestions={questions}
        onBackToResult={() => {
          setViewingResultSimulado(reviewingSimulado);
          setReviewingSimulado(null);
        }}
      />
    );
  }

  // 4. MAIN INTEGRATED CURSOS E SIMULADOS DASHBOARD
  return (
    <div className="w-full h-full flex flex-col items-center justify-start sm:py-4 sm:px-4 pb-24">
      <div className="w-full max-w-5xl bg-white dark:bg-[#0a2346] sm:rounded-3xl border border-purple-500/20 shadow-sm overflow-hidden relative flex flex-col min-h-[70vh] transition-colors">
        
        {/* Purple Top Accent Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-purple-500 rounded-b-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />

        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 sm:px-8 pt-7 pb-5 border-b border-purple-500/10 gap-4 relative z-10">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white tracking-tight">
                Cursos e Simulados
              </h1>
              <p className="text-[11px] text-black/50 dark:text-white/50 mt-0.5 font-bold tracking-wider uppercase">
                Treinamento Oficial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <div className="flex bg-slate-100 dark:bg-[#01142e] border border-purple-500/10 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setActiveSubTab('cursos')}
                className={cn(
                  "px-4 py-2 rounded-lg font-bold text-xs transition-all",
                  activeSubTab === 'cursos'
                    ? "bg-white dark:bg-[#0a2346] text-purple-600 dark:text-purple-400 shadow-sm border border-purple-500/20"
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                )}
              >
                Cursos
              </button>
              <button
                onClick={() => setActiveSubTab('historico')}
                className={cn(
                  "px-4 py-2 rounded-lg font-bold text-xs transition-all",
                  activeSubTab === 'historico'
                    ? "bg-white dark:bg-[#0a2346] text-purple-600 dark:text-purple-400 shadow-sm border border-purple-500/20"
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                )}
              >
                Histórico
              </button>
              <button
                onClick={() => setActiveSubTab('modelos')}
                className={cn(
                  "px-4 py-2 rounded-lg font-bold text-xs transition-all",
                  activeSubTab === 'modelos'
                    ? "bg-white dark:bg-[#0a2346] text-purple-600 dark:text-purple-400 shadow-sm border border-purple-500/20"
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                )}
              >
                Modelos
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-5 sm:p-7 overflow-y-auto bg-slate-50/50 dark:bg-[#01142e]/30">
          
          {/* Active / Paused Alert Banner */}
          {activeOrPaused && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-500 block tracking-wider mb-0.5">
                    Em Andamento
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-black dark:text-white">
                    {activeOrPaused.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => handleResumeSimulado(activeOrPaused)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <Play size={14} className="fill-current" />
                <span>Continuar Prova</span>
              </button>
            </div>
          )}

          {/* TAB CONTENT: CURSOS PREPARATÓRIOS */}
          {activeSubTab === 'cursos' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Quick Launch Section */}
              <div>
                <h2 className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest mb-3 px-1">
                  Treinos Rápidos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleQuickTest}
                    className="p-4 rounded-2xl bg-white dark:bg-[#0a2346] border border-purple-500/15 hover:border-purple-500/40 hover:bg-purple-500/[0.02] transition-all flex items-center gap-3.5 text-left group shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-sm">
                      <Play size={16} className="ml-0.5 fill-current" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-black dark:text-white group-hover:text-purple-500 transition-colors">
                        Simulado Geral (30Q)
                      </h3>
                      <p className="text-[11px] text-black/50 dark:text-white/50 mt-0.5">
                        Conhecimentos gerais em 45 minutos.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleCreateFromMistakes()}
                    className="p-4 rounded-2xl bg-white dark:bg-[#0a2346] border border-purple-500/15 hover:border-rose-500/40 hover:bg-rose-500/[0.02] transition-all flex items-center gap-3.5 text-left group shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
                      <RotateCcw size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-black dark:text-white group-hover:text-rose-500 transition-colors">
                        Caderno de Erros
                      </h3>
                      <p className="text-[11px] text-black/50 dark:text-white/50 mt-0.5">
                        Revise questões que você errou anteriormente.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Courses Grid */}
              <div>
                <h2 className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest mb-3 px-1">
                  Simulados Oficiais por Concurso
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {defaultCourses.map((curso) => {
                    const questionsCount = getCourseQuestionsCount(curso);
                    return (
                      <div
                        key={curso.id}
                        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0a2346] border border-purple-500/15 hover:border-purple-500/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md cursor-pointer relative overflow-hidden"
                        onClick={() => handleStartCourseSimulado(curso)}
                      >
                        <div className="relative z-10">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3 className="font-bold text-base text-black dark:text-white group-hover:text-purple-500 transition-colors">
                              {curso.name}
                            </h3>
                            <span className="text-[10px] font-bold tracking-wider uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md shrink-0">
                              {curso.banca}
                            </span>
                          </div>
                          <p className="text-xs text-black/55 dark:text-white/55 line-clamp-1 mb-3">
                            {curso.fullName}
                          </p>
                        </div>
                        
                        <div className="relative z-10 flex items-center justify-between pt-3 border-t border-purple-500/10">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                            {questionsCount} questões
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCustomizeCourse(curso);
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-[#01142e] border border-purple-500/10 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:border-purple-500/30 transition-colors cursor-pointer"
                              title="Personalizar"
                            >
                              <Settings2 size={14} />
                            </button>
                            <div className="w-8 h-8 rounded-lg bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                              <Play size={12} className="ml-0.5 fill-current" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: HISTÓRICO DE SIMULADOS */}
          {activeSubTab === 'historico' && (
            <div className="animate-in fade-in duration-300">
              {/* Metrics Section */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="bg-white dark:bg-[#0a2346] rounded-2xl p-4 border border-purple-500/15 shadow-sm">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-black/50 dark:text-white/50 mb-1 block">
                    Concluídas
                  </span>
                  <span className="text-2xl font-bold text-black dark:text-white">
                    {realMetrics.totalSimulados}
                  </span>
                </div>

                <div className="bg-white dark:bg-[#0a2346] rounded-2xl p-4 border border-purple-500/15 shadow-sm">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-black/50 dark:text-white/50 mb-1 block">
                    Média de Acertos
                  </span>
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono">
                    {realMetrics.mediaAcertos !== null ? `${realMetrics.mediaAcertos}%` : "-"}
                  </span>
                </div>

                <div className="bg-white dark:bg-[#0a2346] rounded-2xl p-4 border border-purple-500/15 shadow-sm">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-black/50 dark:text-white/50 mb-1 block">
                    Melhor Nota
                  </span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {realMetrics.melhorDesempenho !== null ? `${realMetrics.melhorDesempenho}%` : "-"}
                  </span>
                </div>

                <div className="bg-white dark:bg-[#0a2346] rounded-2xl p-4 border border-purple-500/15 shadow-sm">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-black/50 dark:text-white/50 mb-1 block">
                    Tempo Médio/Q
                  </span>
                  <span className="text-2xl font-bold text-black dark:text-white font-mono">
                    {formatSeconds(realMetrics.tempoMedioPorQuestao)}
                  </span>
                </div>
              </div>

              <h2 className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest mb-3 px-1">
                Histórico de Tentativas
              </h2>
              <SimuladoHistoryView
                simulados={simulados}
                onResume={handleResumeSimulado}
                onViewResult={(sim) => setViewingResultSimulado(sim)}
                onReview={(sim) => setReviewingSimulado(sim)}
                onRedo={handleRedoSame}
                onDeleted={loadData}
              />
            </div>
          )}

          {/* TAB CONTENT: MODELOS SALVOS */}
          {activeSubTab === 'modelos' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest mb-3 px-1">
                Modelos Personalizados
              </h2>
              {templates.length === 0 ? (
                <div className="bg-white dark:bg-[#0a2346] rounded-2xl p-10 text-center flex flex-col items-center justify-center border border-purple-500/15 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
                    <Settings2 size={22} />
                  </div>
                  <h3 className="font-bold text-black dark:text-white text-base mb-1">
                    Nenhum modelo salvo
                  </h3>
                  <p className="text-xs text-black/50 dark:text-white/50 max-w-sm mb-5 leading-relaxed">
                    Configure os filtros da prova e salve como modelo para criar simulados rapidamente depois.
                  </p>
                  <button
                    onClick={() => setIsConfigModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    Criar Simulado
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {templates.map(tpl => (
                    <div
                      key={tpl.id}
                      className="bg-white dark:bg-[#0a2346] border border-purple-500/15 hover:border-purple-500/35 rounded-2xl p-5 transition-all flex flex-col justify-between gap-4 group shadow-sm hover:shadow-md"
                    >
                      <div>
                        <h3 className="font-bold text-black dark:text-white text-base truncate mb-1">
                          {tpl.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-xs font-medium text-black/50 dark:text-white/50">
                          <span>{tpl.config.totalQuestions} questões</span>
                          <span>•</span>
                          <span>{tpl.config.timerMinutes > 0 ? `${tpl.config.timerMinutes} min` : 'Sem limite'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-purple-500/10">
                        <button
                          onClick={async () => {
                            await simuladoService.deleteTemplate(tpl.id);
                            loadData();
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-black/40 dark:text-white/40 hover:bg-rose-500/10 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Excluir modelo"
                        >
                          <Trash2 size={15} />
                        </button>
                        
                        <button
                          onClick={() => handleStartWithConfig(tpl.config)}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <Play size={12} className="fill-current" /> Iniciar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Creation / Configuration Modal */}
      {isConfigModalOpen && (
        <SimuladoConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          onStart={handleStartWithConfig}
          allQuestions={questions}
          userPerformance={performance}
          initialConfig={configModalInitial}
        />
      )}
    </div>
  );
}
