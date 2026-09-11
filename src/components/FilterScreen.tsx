import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Question, QuestionType, SavedFilter } from '../types';
import { Search, Timer, ArrowLeft, Loader2, Sparkles, ChevronRight, Check, Save, Heart, Trash2, Edit3, History, MoreVertical, Star, Filter, CheckCircle2, XCircle, CircleDashed, Lock, AlertCircle, RefreshCw, Camera, Upload, Play, BookOpen, GraduationCap, Layers, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { storageService } from '../services/storageService';
import { firebaseStorageService } from '../services/firebaseStorageService';
import { auth } from '../lib/firebase';

export interface CourseDirectoryItem {
  id: string;
  name: string;
  shortName: string;
  fullName: string;
  defaultCargo: string;
  nivel: string;
  banca: string;
  ano: string;
  defaultAvatar: string;
  summaryTopics: string[];
}

interface FilterScreenProps {
  questions: Question[];
  performance: Performance[];
  onStartTraining: (filtered: Question[], config?: Partial<SavedFilter>) => void;
  onBack: () => void;
  initialTab?: 'simples' | 'avancado' | 'scheduled' | 'saved' | 'cursos';
  onNavigate?: (newTab: any, params?: any) => void;
  isLoadingData?: boolean;
}

import { SimulatorScreen } from './SimulatorScreen';
import { Performance } from '../types';

const ALPHABET_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export const FilterScreen: React.FC<FilterScreenProps> = ({ questions, performance, onStartTraining, onBack, initialTab, isLoadingData = false }) => {
  const [bancaSelecionada, setBancaSelecionada] = useState<string[]>([]);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<string[]>([]);
  const [assuntoSelecionado, setAssuntoSelecionado] = useState<string[]>([]);
  const [anoSelecionado, setAnoSelecionado] = useState<number[]>([]);
  const [dificuldadeSelecionada, setDificuldadeSelecionada] = useState<string[]>([]);
  const [statusRespondida, setStatusRespondida] = useState<'todas' | 'nao_respondidas' | 'resolvidas' | 'corretas' | 'incorretas'>('nao_respondidas');
  const [tipoSelecionado, setTipoSelecionado] = useState<QuestionType[]>([]);
  const [activeTab, setActiveTab] = useState<'simples' | 'avancado' | 'scheduled' | 'saved' | 'cursos'>(
    initialTab === 'cursos' || initialTab === 'avancado' ? 'avancado' : (initialTab || 'simples')
  );
  
  const [cursoSelecionado, setCursoSelecionado] = useState<string | null>(null);
  const [cargoSelecionado, setCargoSelecionado] = useState<string | null>(null);

  const CURSOS_ESTRUTURA: Record<string, Record<string, Record<string, Record<string, string[]>>>> = {
    "IBGE": {
      "Nível médio": {
         "Agente de Pesquisas e Mapeamento": {
            "Língua Portuguesa": [],
            "Matemática e Raciocínio Lógico": [],
            "Ética no Serviço Público": [],
            "Geografia": [],
            "Noções de Informática": []
         }
      }
    },
    "Polícia Rodoviária Federal": {
      "Nível superior": {
         "Agente de Polícia": {
            "Direito Administrativo": [],
            "Direito Constitucional": [],
            "Direito Penal": [],
            "Direito Penal e Legislação de Trânsito": [],
            "Direito Processual Penal": [],
            "Direitos Humanos": [],
            "Estatística": [],
            "Ética": [],
            "Física": [],
            "Geografia": [],
            "Informática": [],
            "Legislação de Trânsito": [],
            "Língua Inglesa": [],
            "Língua Portuguesa": [],
            "Matemática": [],
            "Raciocínio Lógico": [],
            "Redação Oficial": []
         }
      }
    },
    "Sedes-DF": {
      "Nível superior": {
         "Administração": {},
         "Ciências Contábeis": {},
         "Comunicação Social": {},
         "Direito e Legislação": {},
         "Economia": {},
         "Educador Social": {},
         "Estatística": {},
         "Nutrição": {},
         "Pedagogia": {},
         "Psicologia": {},
         "Sociologia": {},
         "Serviço Social": {}
      },
      "Nível médio: Técnico em Desenvolvimento e Assistência Social (TDAS)": {
         "Cuidador Social": {},
         "Agente Social": {
            "LÍNGUA PORTUGUESA": [
              "1. Compreensão e interpretação de textos de gêneros variados.",
              "2. Reconhecimento de tipos e gêneros textuais.",
              "3. Domínio da ortografia oficial.",
              "4. Domínio dos mecanismos de coesão textual",
              "5. Domínio da estrutura morfossintática do período",
              "6. Reescrita de frases e parágrafos do texto"
            ],
            "CONHECIMENTOS DO DISTRITO FEDERAL, POLÍTICA PARA MULHERES, LEGISLAÇÃO E NOÇÕES DE PRIMEIROS SOCORROS": [
              "1. Tópicos atuais e relevantes acerca da realidade do DF",
              "2. Plano Distrital de Política para Mulheres (PDPM)",
              "3. Lei Orgânica do Distrito Federal",
              "4. Lei Complementar nº 840/2011",
              "5. Lei Federal nº 11.340/2006 (Maria da Penha)",
              "6. Lei Distrital nº 7.484/2024",
              "7. Noções básicas de primeiros socorros"
            ],
            "CONHECIMENTOS ESPECÍFICOS": [
              "FUNDAMENTOS, ORGANIZAÇÃO, GESTÃO DO SUAS",
              "PROGRAMAS E BENEFÍCIOS DO DISTRITO FEDERAL",
              "1 Rede Socioassistencial e Trabalho no Território",
              "2 Proteção Social Básica e Trabalho com Famílias",
              "3 Proteção Social Especial (Média e Alta Complexidade)",
              "4 Abordagem Social e População em Situação de Rua",
              "5 Noções de Saúde Mental e Uso de Álcool e Outras Drogas"
            ]
         },
         "Técnico Administrativo": {}
      }
    }
  };
  
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isSavingFilter, setIsSavingFilter] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filterToEdit, setFilterToEdit] = useState<SavedFilter | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [savedFilterSearch, setSavedFilterSearch] = useState('');
  const [savedFilterSort, setSavedFilterSort] = useState<'recent' | 'name' | 'used' | 'favorite'>('recent');
  const [showEmptyResultsModal, setShowEmptyResultsModal] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [courseAvatars, setCourseAvatars] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('concurso_pro_course_avatars');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  const [customCourses, setCustomCourses] = useState<CourseDirectoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('concurso_pro_custom_courses');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    // Load saved filters
    const loadSaved = async () => {
      const localSaved = storageService.getSavedFilters();
      setSavedFilters(localSaved);
      
      if (auth.currentUser) {
        const cloudSaved = await firebaseStorageService.syncSavedFilters();
        if (cloudSaved.length > 0) {
          setSavedFilters(cloudSaved);
          storageService.setSavedFilters(cloudSaved);
        }
      }
    };
    loadSaved();
  }, []);

  // Sync saved filters to local storage whenever they change
  useEffect(() => {
    if (savedFilters.length > 0) {
      storageService.setSavedFilters(savedFilters);
    }
  }, [savedFilters]);
  
  // Navigation state for sub-menus
  const [activeMenu, setActiveMenu] = useState<'none' | 'disciplines' | 'topics' | 'boards' | 'years' | 'difficulty' | 'types' | 'cursos_selector' | 'cargos_selector'>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  useEffect(() => {
    setSelectedLetter(null);
    setSearchQuery('');
  }, [activeMenu]);

  const [expandedDiscipline, setExpandedDiscipline] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const validQuestions = useMemo(() => questions.filter(Boolean), [questions]);

  const defaultCourses: CourseDirectoryItem[] = useMemo(() => [
    {
      id: "IBGE",
      name: "IBGE",
      shortName: "IBGE",
      fullName: "Instituto Brasileiro de Geografia e Estatística",
      defaultCargo: "Agente de Pesquisas e Mapeamento",
      nivel: "Nível Médio",
      banca: "FGV",
      ano: "2026",
      defaultAvatar: "/images/ibge/ibge_logo.svg",
      summaryTopics: ["Língua Portuguesa", "Matemática e Raciocínio Lógico", "Ética no Serviço Público", "Geografia", "Noções de Informática"]
    },
    {
      id: "Polícia Rodoviária Federal",
      name: "Polícia Rodoviária Federal",
      shortName: "PRF",
      fullName: "PRF - Carreira Policial Rodoviária",
      defaultCargo: "Agente de Polícia",
      nivel: "Nível Superior",
      banca: "Cebraspe",
      ano: "2023 - 2026",
      defaultAvatar: "/images/prf_logo.svg",
      summaryTopics: ["Legislação de Trânsito", "Direito Penal & Proc. Penal", "Constitucional & Administrativo", "Informática", "Física"]
    },
    {
      id: "Sedes-DF",
      name: "Sedes-DF",
      shortName: "SEDES",
      fullName: "Secretaria de Desenvolvimento Social do DF",
      defaultCargo: "Agente Social",
      nivel: "Nível Médio e Superior",
      banca: "IBFC",
      ano: "2024",
      defaultAvatar: "/images/sedes_logo.svg",
      summaryTopics: ["Língua Portuguesa", "Conhecimentos do DF", "Assistência Social & SUAS"]
    }
  ], []);

  const allCourses = useMemo(() => {
    return [...defaultCourses, ...customCourses].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [defaultCourses, customCourses]);

  const getCourseQuestionsCount = useCallback((courseId: string) => {
    return validQuestions.filter(q => {
      if (!q) return false;
      if (courseId === "IBGE") {
        return q.orgao === "IBGE" || (q.cargo && q.cargo.includes("Agente de Pesquisas"));
      }
      if (courseId === "Polícia Rodoviária Federal") {
        return q.orgao === "Polícia Rodoviária Federal" || (q.id && q.id.startsWith("AC100") && !q.id.startsWith("AC107"));
      }
      if (courseId === "Sedes-DF") {
        return q.orgao === "Sedes-DF";
      }
      return q.orgao === courseId;
    }).length;
  }, [validQuestions]);

  const handleCoursePhotoUpload = (courseId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setCourseAvatars(prev => {
          const updated = { ...prev, [courseId]: dataUrl };
          try {
            localStorage.setItem('concurso_pro_course_avatars', JSON.stringify(updated));
          } catch (err) {}
          return updated;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetCoursePhoto = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCourseAvatars(prev => {
      const updated = { ...prev };
      delete updated[courseId];
      try {
        localStorage.setItem('concurso_pro_course_avatars', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  const handleAccessCourseQuestions = (course: CourseDirectoryItem) => {
    setCursoSelecionado(course.id);
    setCargoSelecionado(course.defaultCargo);

    // Filter questions directly for this course
    const courseQuestions = validQuestions.filter(q => {
      if (!q) return false;
      if (course.id === "IBGE") {
        return q.orgao === "IBGE" || (q.cargo && q.cargo.includes("Agente de Pesquisas"));
      }
      if (course.id === "Polícia Rodoviária Federal") {
        return q.orgao === "Polícia Rodoviária Federal" || (q.id && q.id.startsWith("AC100") && !q.id.startsWith("AC107"));
      }
      if (course.id === "Sedes-DF") {
        return q.orgao === "Sedes-DF";
      }
      return q.orgao === course.id;
    });

    if (courseQuestions.length > 0) {
      onStartTraining(courseQuestions, {
        name: `Curso: ${course.name}`
      });
    } else {
      alert(`O curso ${course.name} foi selecionado! Personalize as disciplinas ou aguarde novas questões.`);
    }
  };

  const handleSelectCourse = (course: CourseDirectoryItem) => {
    if (cursoSelecionado === course.id) {
      return;
    }
    setCursoSelecionado(course.id);
    setCargoSelecionado(course.defaultCargo);
    setDisciplinaSelecionada([]);
    setAssuntoSelecionado([]);
  };

  const canonicalizeBanca = (banca: string): string => {
    if (!banca) return '';
    const clean = banca.trim();
    const lower = clean.toLowerCase();

    if (lower.includes('apice') || lower.includes('ápice') || lower.includes('inedita') || lower.includes('inédita')) {
      return 'Inéditas Ápice Concurso';
    }
    if (lower.includes('cespe') || lower.includes('cebraspe')) {
      return 'Cebraspe (CESPE)';
    }
    if (lower.includes('quadrix')) {
      return 'Quadrix';
    }
    if (lower.includes('getulio vargas') || lower.includes('getúlio vargas') || lower === 'fgv' || lower.startsWith('fgv')) {
      return 'FGV';
    }
    if (lower.includes('carlos chagas') || lower === 'fcc' || lower.startsWith('fcc')) {
      return 'FCC';
    }
    if (lower.includes('vunesp')) {
      return 'Vunesp';
    }
    if (lower.includes('ibfc')) {
      return 'IBFC';
    }
    if (lower.includes('cesgranrio')) {
      return 'Cesgranrio';
    }
    if (lower.includes('aocp')) {
      return 'Instituto AOCP';
    }
    if (lower.includes('selecon')) {
      return 'Instituto Selecon';
    }
    if (lower.includes('iades')) {
      return 'IADES';
    }
    if (lower.includes('idecan')) {
      return 'IDECAN';
    }
    if (lower.includes('fundatec')) {
      return 'Fundatec';
    }
    if (lower.includes('consulplan')) {
      return 'Consulplan';
    }
    if (lower.includes('ibade')) {
      return 'IBADE';
    }
    return clean.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  const canonicalizeDiscipline = (discipline: string): string => {
    if (!discipline) return '';
    const clean = discipline.trim();
    const lower = clean.toLowerCase();

    if (lower.includes('portugues') || lower.includes('português')) {
      return 'Língua Portuguesa';
    }
    if (lower.includes('constitucional')) {
      return 'Direito Constitucional';
    }
    if (lower.includes('administrativo')) {
      return 'Direito Administrativo';
    }
    if (lower.includes('processual penal')) {
      return 'Direito Processual Penal';
    }
    if (lower.includes('penal') && !lower.includes('processual')) {
      return 'Direito Penal';
    }
    if (lower.includes('direitos humanos')) {
      return 'Direitos Humanos';
    }
    if (lower.includes('seguridade') || lower.includes('previdenciário') || lower.includes('previdenciario')) {
      return 'Direito Previdenciário';
    }
    if (lower.includes('contabilidade')) {
      return 'Contabilidade Geral';
    }
    if (lower.includes('criminologia')) {
      return 'Criminologia';
    }
    if (lower.includes('física') || lower.includes('fisica')) {
      return 'Física';
    }
    if (lower.includes('legislação especial') || lower.includes('leg. especial')) {
      return 'Legislação Especial';
    }
    if (lower.includes('raciocínio') || lower.includes('raciocinio') || lower.includes('matemática') || lower.includes('matematica')) {
      if (lower.includes('racioc') && (lower.includes('matem') || lower.includes('logico') || lower.includes('lógico'))) {
        return 'Raciocínio Lógico e Matemático';
      }
      if (lower.includes('matem')) return 'Matemática';
      return 'Raciocínio Lógico';
    }
    if (lower.includes('informática') || lower.includes('informatica')) {
      return 'Informática';
    }
    if (lower.includes('legislação de trânsito') || lower.includes('transito') || lower.includes('trânsito') || lower.includes('ctb')) {
      return 'Legislação de Trânsito';
    }
    if (lower.includes('ética') || lower.includes('etica')) {
      return 'Ética no Serviço Público';
    }
    if (lower.includes('geografia')) {
      return 'Geografia';
    }
    if (lower.includes('distrito federal') || lower.includes('conhecimentos do df')) {
      return 'Conhecimentos do Distrito Federal';
    }

    return clean.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  const availableBoards = useMemo(() => {
    const canonicalSet = new Set<string>();
    validQuestions.forEach(q => {
      if (q.board) {
        const c = canonicalizeBanca(q.board);
        if (c) canonicalSet.add(c);
      }
    });
    return Array.from(canonicalSet).sort((a, b) => {
      if (a === 'Inéditas Ápice Concurso') return -1;
      if (b === 'Inéditas Ápice Concurso') return 1;
      return a.localeCompare(b, 'pt-BR');
    });
  }, [validQuestions]);
  
  const getCargoData = () => {
     if (cursoSelecionado && cargoSelecionado) {
       const niveis = CURSOS_ESTRUTURA[cursoSelecionado];
       if (niveis) {
         for (const nivel of Object.keys(niveis)) {
           if (niveis[nivel][cargoSelecionado]) return niveis[nivel][cargoSelecionado];
         }
       }
     }
     return null;
  };

  const availableDisciplines = useMemo(() => {
    if (activeTab === 'cursos' && cursoSelecionado && cargoSelecionado) {
       const data = getCargoData();
       if (data && Object.keys(data).length > 0) {
         const canonList = Object.keys(data).map(d => canonicalizeDiscipline(d));
         return Array.from(new Set(canonList)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
       }
       return [];
    }
    const canonicalSet = new Set<string>();
    validQuestions.forEach(q => {
      if (q.discipline) {
        const c = canonicalizeDiscipline(q.discipline);
        if (c) canonicalSet.add(c);
      }
    });
    return Array.from(canonicalSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [validQuestions, activeTab, cursoSelecionado, cargoSelecionado]);

  const availableYears = useMemo(() => Array.from(new Set(validQuestions.map(q => q.year).filter(Boolean))).sort((a,b) => b! - a!) as number[], [validQuestions]);
  
  const availableTopics = useMemo(() => {
    if (activeTab === 'cursos' && cursoSelecionado && cargoSelecionado) {
       const data = getCargoData();
       if (data && Object.keys(data).length > 0) {
          const allTopics: string[] = [];
          Object.values(data).forEach(arr => allTopics.push(...arr));
          return Array.from(new Set(allTopics)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
       }
       return [];
    }
    return Array.from(new Set(validQuestions.map(q => q.topic).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [validQuestions, activeTab, cursoSelecionado, cargoSelecionado]);

  // Precompute indexed maps and lowercased Sets for ultra-fast O(1) lookups
  const { disciplineTopicsMap, topicToDisciplineMap } = useMemo(() => {
    const dMap = new Map<string, string[]>();
    const tMap = new Map<string, string>();
    for (let i = 0; i < validQuestions.length; i++) {
      const q = validQuestions[i];
      const canonDisc = canonicalizeDiscipline(q.discipline || '');
      if (canonDisc && q.topic) {
        if (!tMap.has(q.topic)) {
          tMap.set(q.topic, canonDisc);
        }
        let list = dMap.get(canonDisc);
        if (!list) {
          list = [];
          dMap.set(canonDisc, list);
        }
        if (!list.includes(q.topic)) {
          list.push(q.topic);
        }
      }
    }
    dMap.forEach((list) => {
      list.sort((a, b) => a.localeCompare(b, 'pt-BR'));
    });
    return { disciplineTopicsMap: dMap, topicToDisciplineMap: tMap };
  }, [validQuestions]);

  const selectedBoardsSet = useMemo(() => new Set(bancaSelecionada), [bancaSelecionada]);
  const selectedYearsSet = useMemo(() => new Set(anoSelecionado), [anoSelecionado]);
  const selectedTypesSet = useMemo(() => new Set(tipoSelecionado), [tipoSelecionado]);
  const selectedDifficultiesSet = useMemo(() => new Set(dificuldadeSelecionada), [dificuldadeSelecionada]);
  const selectedDisciplinesSet = useMemo(() => new Set(disciplinaSelecionada), [disciplinaSelecionada]);
  const selectedTopicsSet = useMemo(() => new Set(assuntoSelecionado), [assuntoSelecionado]);

  const availableLetters = useMemo(() => {
    if (activeMenu !== 'disciplines' && activeMenu !== 'boards') return new Set<string>();
    const items = activeMenu === 'disciplines' ? availableDisciplines : availableBoards;
    const letters = new Set<string>();
    items.forEach(item => {
      const first = String(item).trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').charAt(0).toUpperCase();
      if (first >= 'A' && first <= 'Z') {
        letters.add(first);
      }
    });
    return letters;
  }, [activeMenu, availableDisciplines, availableBoards]);

  // Precompute performance status map for O(1) checks during filter passes
  const perfStatusMap = useMemo(() => {
    const map = new Map<string, number>();
    performance.forEach(p => {
      if (!p || !p.questionId) return;
      map.set(p.questionId, p.isCorrect ? 1 : -1);
    });
    return map;
  }, [performance]);

  // Fast O(1) filter checks using Sets with zero string allocation
  const matchesExcept = useCallback((q: Question, categoryToIgnore: string) => {
    if (!q) return false;
    
    if (activeTab === 'cursos') {
       if (cursoSelecionado) {
         const isIBGE = cursoSelecionado === 'IBGE';
         const isPRF = cursoSelecionado === 'Polícia Rodoviária Federal';
         if (isIBGE && q.orgao !== 'IBGE' && !(q.cargo && q.cargo.includes('Agente de Pesquisas'))) return false;
         if (isPRF && q.orgao !== 'Polícia Rodoviária Federal' && !(q.id && q.id.startsWith('AC100') && !q.id.startsWith('AC107'))) return false;
         if (!isIBGE && !isPRF && q.orgao !== cursoSelecionado) return false;
       }
       if (cargoSelecionado && q.cargo && q.cargo !== cargoSelecionado) return false;
    }

    if (categoryToIgnore !== 'boards' && selectedBoardsSet.size > 0) {
      const canonB = canonicalizeBanca(q.board || '');
      if (!canonB || !selectedBoardsSet.has(canonB)) return false;
    }

    const hasDiscFilter = categoryToIgnore !== 'disciplines' && categoryToIgnore !== 'topics' && selectedDisciplinesSet.size > 0;
    const hasTopicFilter = categoryToIgnore !== 'topics' && categoryToIgnore !== 'disciplines' && selectedTopicsSet.size > 0;
    
    if (hasDiscFilter || hasTopicFilter) {
      const canonD = canonicalizeDiscipline(q.discipline || '');
      const topicMatch = hasTopicFilter && q.topic && selectedTopicsSet.has(q.topic);
      const discMatch = hasDiscFilter && canonD && selectedDisciplinesSet.has(canonD);
      
      if (topicMatch) {
         // Matches selected topic
      } else if (discMatch) {
         if (q.topic && hasTopicFilter) return false;
      } else {
         return false;
      }
    }

    if (categoryToIgnore !== 'years' && selectedYearsSet.size > 0 && (!q.year || !selectedYearsSet.has(q.year))) return false;
    if (categoryToIgnore !== 'types' && selectedTypesSet.size > 0 && (!q.type || !selectedTypesSet.has(q.type))) return false;
    if (categoryToIgnore !== 'difficulty' && selectedDifficultiesSet.size > 0 && (!q.difficulty || !selectedDifficultiesSet.has(q.difficulty))) return false;
    
    if (statusRespondida !== 'todas') {
      const perf = perfStatusMap.get(q.id) || 0;
      if (statusRespondida === 'nao_respondidas' && perf !== 0) return false;
      if (statusRespondida === 'resolvidas' && perf === 0) return false;
      if (statusRespondida === 'corretas' && perf !== 1) return false;
      if (statusRespondida === 'incorretas' && perf !== -1) return false;
    }

    if (searchText.trim().length > 0) {
      const query = searchText.trim().toLowerCase();
      const matchesId = q.id && q.id.toLowerCase().includes(query);
      const matchesText = q.text && q.text.toLowerCase().includes(query);
      const matchesTopic = q.topic && q.topic.toLowerCase().includes(query);
      const matchesDisc = q.discipline && q.discipline.toLowerCase().includes(query);
      const matchesOrgao = q.orgao && q.orgao.toLowerCase().includes(query);
      const matchesCargo = q.cargo && q.cargo.toLowerCase().includes(query);
      if (!matchesId && !matchesText && !matchesTopic && !matchesDisc && !matchesOrgao && !matchesCargo) {
        return false;
      }
    }
    
    return true;
  }, [
    activeTab, cursoSelecionado, cargoSelecionado,
    selectedBoardsSet, selectedYearsSet, selectedTypesSet, selectedDifficultiesSet,
    selectedDisciplinesSet, selectedTopicsSet, statusRespondida, perfStatusMap, searchText
  ]);

  // Precomputed submenu options to avoid expensive filter operations on every render
  const currentSubMenuOptions = useMemo(() => {
    if (activeMenu === 'none') return [];

    let items: any[] = [];
    const category = activeMenu;

    if (category === 'cursos_selector') {
      items = Object.keys(CURSOS_ESTRUTURA).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    } else if (category === 'cargos_selector') {
      if (cursoSelecionado && CURSOS_ESTRUTURA[cursoSelecionado]) {
         const niveis = CURSOS_ESTRUTURA[cursoSelecionado];
         Object.keys(niveis).forEach(nivel => items.push(...Object.keys(niveis[nivel])));
         items = Array.from(new Set(items)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
      }
    } else if (category === 'disciplines') {
      items = availableDisciplines;
    } else if (category === 'topics') {
      items = availableTopics;
    } else if (category === 'boards') {
      items = availableBoards;
    } else if (category === 'years') {
      items = availableYears;
    } else if (category === 'difficulty') {
      items = ['Fácil', 'Médio', 'Difícil'];
    } else if (category === 'types') {
      items = [QuestionType.MULTIPLE_CHOICE, QuestionType.TRUE_FALSE];
    }

    let filtered = items;

    if (selectedLetter && (category === 'disciplines' || category === 'boards')) {
      filtered = filtered.filter(item => {
        const first = String(item).trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').charAt(0).toUpperCase();
        return first === selectedLetter.toUpperCase();
      });
    }

    const queryLower = searchQuery.trim().toLowerCase();
    if (queryLower) {
      filtered = filtered.filter(item => {
        const displayLabel = category === 'types' 
          ? (item === QuestionType.MULTIPLE_CHOICE ? 'Múltipla Escolha' : 'Certo/Errado') 
          : String(item);
        return displayLabel.toLowerCase().includes(queryLower);
      });
    }

    if (category === 'cursos_selector' || category === 'cargos_selector' || (activeTab === 'cursos' && (category === 'disciplines' || category === 'topics'))) {
      return filtered.map(item => ({ value: item, count: 1 })).sort((a, b) => String(a.value).localeCompare(String(b.value), 'pt-BR'));
    }

    // Count questions matching everything EXCEPT category
    const counts = new Map<string | number, number>();
    for (let i = 0; i < validQuestions.length; i++) {
      const q = validQuestions[i];
      if (matchesExcept(q, category)) {
        const val = 
          category === 'boards' ? canonicalizeBanca(q.board || '') :
          category === 'disciplines' ? canonicalizeDiscipline(q.discipline || '') :
          category === 'topics' ? q.topic :
          category === 'years' ? q.year :
          category === 'difficulty' ? q.difficulty :
          category === 'types' ? q.type : null;
          
        if (val != null) {
          counts.set(val, (counts.get(val) || 0) + 1);
        }
      }
    }

    return filtered.map(item => ({
      value: item,
      count: counts.get(item) || 0
    })).sort((a, b) => {
      if (category === 'boards') {
        if (String(a.value) === 'Inéditas Ápice Concurso') return -1;
        if (String(b.value) === 'Inéditas Ápice Concurso') return 1;
      }
      if (a.count === 0 && b.count > 0) return 1;
      if (a.count > 0 && b.count === 0) return -1;
      
      if (category === 'years') {
        return Number(b.value) - Number(a.value);
      }
      if (category === 'difficulty') {
        const order = ['Fácil', 'Médio', 'Difícil'];
        return order.indexOf(String(a.value)) - order.indexOf(String(b.value));
      }
      if (category === 'types') {
        return 0;
      }
      return String(a.value).localeCompare(String(b.value), 'pt-BR');
    });
  }, [
    activeMenu, searchQuery, selectedLetter, validQuestions, availableDisciplines, availableTopics,
    availableBoards, availableYears, matchesExcept, activeTab, cursoSelecionado, cargoSelecionado
  ]);

  // Topic counts calculated ONLY for the expanded discipline on-demand for zero UI latency
  const currentExpandedTopicOptions = useMemo(() => {
    if (activeMenu !== 'disciplines' || !expandedDiscipline) return [];

    const cData = (activeTab === 'cursos' && cursoSelecionado && cargoSelecionado) ? getCargoData() : null;
    let dAssuntos: string[] = [];
    if (cData && cData[expandedDiscipline]) {
      dAssuntos = [...cData[expandedDiscipline]].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    } else {
      dAssuntos = [...(disciplineTopicsMap.get(expandedDiscipline) || [])].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    }

    if (activeTab === 'cursos') {
      return dAssuntos.map(a => ({ value: a, count: 1 })).sort((a, b) => String(a.value).localeCompare(String(b.value), 'pt-BR'));
    }

    const topicCountMap = new Map<string, number>();
    for (let i = 0; i < validQuestions.length; i++) {
      const q = validQuestions[i];
      const canonD = canonicalizeDiscipline(q.discipline || '');
      if (canonD === expandedDiscipline && q.topic && matchesExcept(q, 'topics')) {
        topicCountMap.set(q.topic, (topicCountMap.get(q.topic) || 0) + 1);
      }
    }

    return dAssuntos.map(a => ({
      value: a,
      count: topicCountMap.get(a) || 0
    })).sort((a, b) => {
      if (a.count === 0 && b.count > 0) return 1;
      if (a.count > 0 && b.count === 0) return -1;
      return String(a.value).localeCompare(String(b.value), 'pt-BR');
    });
  }, [activeMenu, expandedDiscipline, validQuestions, activeTab, cursoSelecionado, cargoSelecionado, matchesExcept, disciplineTopicsMap]);

  const toggleFilter = (category: string, value: any) => {
    if (category === 'cursos_selector') {
      setCursoSelecionado(prev => prev === value ? null : value);
      setCargoSelecionado(null);
    } else if (category === 'cargos_selector') {
      setCargoSelecionado(prev => prev === value ? null : value);
      setDisciplinaSelecionada([]);
      setAssuntoSelecionado([]);
    } else if (category === 'boards') {
      if (value === 'clear-all-hack') { setBancaSelecionada([]); return; }
      setBancaSelecionada(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    } else if (category === 'disciplines') {
      if (value === 'clear-all-hack') { setDisciplinaSelecionada([]); setAssuntoSelecionado([]); return; }
      const isSelected = disciplinaSelecionada.includes(value);
      setDisciplinaSelecionada(prev => isSelected ? prev.filter(v => v !== value) : [...prev, value]);
      
      const cData = getCargoData();
      let topicsForDiscipline: string[] = [];
      if (activeTab === 'cursos' && cursoSelecionado && cargoSelecionado && cData && cData[value]) {
         topicsForDiscipline = cData[value];
      } else {
         topicsForDiscipline = disciplineTopicsMap.get(value) || [];
      }
      
      setAssuntoSelecionado(prev => {
         if (isSelected) {
            const topicsSet = new Set(topicsForDiscipline);
            return prev.filter(t => !topicsSet.has(t));
         } else {
            const prevSet = new Set(prev);
            const newTopics = topicsForDiscipline.filter(t => !prevSet.has(t));
            return [...prev, ...newTopics];
         }
      });
    } else if (category === 'topics') {
      if (value === 'clear-all-hack') { setAssuntoSelecionado([]); return; }
      const isSelectingTopic = !assuntoSelecionado.includes(value);
      setAssuntoSelecionado(prev => isSelectingTopic ? [...prev, value] : prev.filter(v => v !== value));
      
      if (!isSelectingTopic) {
        const parentDiscipline = topicToDisciplineMap.get(value);
        if (parentDiscipline && disciplinaSelecionada.includes(parentDiscipline)) {
           setDisciplinaSelecionada(prev => prev.filter(v => v !== parentDiscipline));
        }
      }
    } else if (category === 'years') {
      setAnoSelecionado(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    } else if (category === 'difficulty') {
      setDificuldadeSelecionada(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    } else if (category === 'types') {
      setTipoSelecionado(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    }
  };

  const clearFilters = () => {
    setCursoSelecionado(null);
    setCargoSelecionado(null);
    setBancaSelecionada([]);
    setDisciplinaSelecionada([]);
    setAssuntoSelecionado([]);
    setAnoSelecionado([]);
    setTipoSelecionado([]);
    setDificuldadeSelecionada([]);
    setStatusRespondida('nao_respondidas');
  };

  const applyFilters = async () => {
    // Save last used filter
    storageService.setLastFilter({
      banca: bancaSelecionada,
      disciplina: disciplinaSelecionada,
      assunto: assuntoSelecionado,
      ano: anoSelecionado,
      dificuldade: dificuldadeSelecionada,
      status: statusRespondida,
      tipoSelecionado: tipoSelecionado
    });

    if (activeTab === 'scheduled') {
      setIsLoading(true);
      setLoadingStep('Buscando agendamentos...');
      setTimeout(() => {
        let scheduledIds: string[] = [];
        try {
          const stored = localStorage.getItem('concurso_pro_wrong_scheduled');
          if (stored) {
            const parsed = JSON.parse(stored);
            scheduledIds = parsed.map((i: any) => typeof i === 'string' ? i : i.id);
          }
        } catch (e) {}

        const results = questions.filter(q => scheduledIds.includes(q.id));
        if (results.length > 0) {
          onStartTraining(results);
        } else {
          alert("Nenhuma questão agendada encontrada. Finalize um módulo com erros e agende-as primeiro.");
          setIsLoading(false);
        }
      }, 500);
      return;
    }

    setIsLoading(true);
    setLoadingStep('Filtrando questões...');
    setTimeout(() => {
      const results = questions.filter(q => matchesExcept(q, 'none'));
      
      if (results.length > 0) {
        setIsLoading(false);
        onStartTraining(results, {
          bancaSelecionada,
          disciplinaSelecionada,
          assuntoSelecionado,
          anoSelecionado,
          dificuldadeSelecionada,
          statusRespondida,
          tipoSelecionado
        });
      } else {
        setIsLoading(false);
        setShowEmptyResultsModal(true);
      }
    }, 300);
  };

  const handleSaveFilter = async () => {
    if (!newFilterName.trim()) return;
    
    setIsSavingFilter(true);
    const filterId = filterToEdit ? filterToEdit.id : Math.random().toString(36).substr(2, 9);
    
    const newFilter: SavedFilter = {
      id: filterId,
      name: newFilterName.trim(),
      bancaSelecionada,
      disciplinaSelecionada,
      assuntoSelecionado,
      anoSelecionado,
      dificuldadeSelecionada,
      statusRespondida,
      tipoSelecionado,
      isFavorite: filterToEdit ? filterToEdit.isFavorite : false,
      usageCount: filterToEdit ? filterToEdit.usageCount : 0,
      createdAt: filterToEdit ? filterToEdit.createdAt : Date.now(),
      lastUsed: Date.now()
    };

    try {
      if (auth.currentUser) {
        await firebaseStorageService.saveFilter(newFilter);
      }
      
      setSavedFilters(prev => {
        const index = prev.findIndex(f => f.id === filterId);
        if (index >= 0) {
          const newArr = [...prev];
          newArr[index] = newFilter;
          return newArr;
        }
        return [newFilter, ...prev];
      });
      
      setShowSaveModal(false);
      setNewFilterName('');
      setFilterToEdit(null);
    } catch (error) {
      console.error(error);
      console.warn("Erro ao salvar filtro.");
    } finally {
      setIsSavingFilter(false);
    }
  };

  const toggleFavoriteFilter = async (filter: SavedFilter) => {
    const updated = { ...filter, isFavorite: !filter.isFavorite };
    setSavedFilters(prev => prev.map(f => f.id === filter.id ? updated : f));
    if (auth.currentUser) {
      await firebaseStorageService.saveFilter(updated);
    }
  };

  const deleteSavedFilter = async (id: string) => {
    try {
      if (auth.currentUser) {
        await firebaseStorageService.deleteFilter(id);
      }
      setSavedFilters(prev => prev.filter(f => f.id !== id));
      setShowConfirmDelete(null);
    } catch (error) {
      console.error(error);
      console.warn("Erro ao excluir filtro.");
    }
  };

  const loadSavedFilter = (filter: SavedFilter) => {
    setBancaSelecionada(filter.bancaSelecionada);
    setDisciplinaSelecionada(filter.disciplinaSelecionada);
    setAssuntoSelecionado(filter.assuntoSelecionado);
    setAnoSelecionado(filter.anoSelecionado);
    setDificuldadeSelecionada(filter.dificuldadeSelecionada || []);
    setStatusRespondida(filter.statusRespondida || 'todas');
    setTipoSelecionado(filter.tipoSelecionado || []);
    setActiveTab('simples');
    
    // Update usage count
    const updated = { ...filter, usageCount: (filter.usageCount || 0) + 1, lastUsed: Date.now() };
    setSavedFilters(prev => prev.map(f => f.id === filter.id ? updated : f));
    if (auth.currentUser) {
      firebaseStorageService.saveFilter(updated).catch(console.error);
    }
  };

  const sortedSavedFilters = useMemo(() => {
    let list = savedFilters.filter(f => 
      f.name.toLowerCase().includes(savedFilterSearch.toLowerCase())
    );

    list.sort((a, b) => {
      // Favorites always first across all sorts
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      if (savedFilterSort === 'name') return a.name.localeCompare(b.name);
      if (savedFilterSort === 'used') return (b.usageCount || 0) - (a.usageCount || 0);
      if (savedFilterSort === 'recent') return Number(b.lastUsed || 0) - Number(a.lastUsed || 0);
      return 0;
    });

    return list;
  }, [savedFilters, savedFilterSearch, savedFilterSort]);

  const renderSubMenu = () => {
    let title = '';
    let items: any[] = [];
    let selected: any[] = [];
    let category = '';

    if (activeMenu === 'cursos_selector') {
      title = 'Cursos';
      items = Object.keys(CURSOS_ESTRUTURA).sort((a, b) => a.localeCompare(b, 'pt-BR'));
      selected = cursoSelecionado ? [cursoSelecionado] : [];
      category = 'cursos_selector';
    } else if (activeMenu === 'cargos_selector') {
      title = 'Cargos';
      if (cursoSelecionado && CURSOS_ESTRUTURA[cursoSelecionado]) {
         const niveis = CURSOS_ESTRUTURA[cursoSelecionado];
         Object.keys(niveis).forEach(nivel => items.push(...Object.keys(niveis[nivel])));
         items = Array.from(new Set(items)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
      }
      selected = cargoSelecionado ? [cargoSelecionado] : [];
      category = 'cargos_selector';
    } else if (activeMenu === 'disciplines') {
      title = 'Disciplinas e Assuntos';
      items = availableDisciplines;
      selected = disciplinaSelecionada;
      category = 'disciplines';
    } else if (activeMenu === 'topics') {
      title = 'Assuntos (por disciplina)';
      items = availableTopics;
      selected = assuntoSelecionado;
      category = 'topics';
    } else if (activeMenu === 'boards') {
      title = 'Bancas';
      items = availableBoards;
      selected = bancaSelecionada;
      category = 'boards';
    } else if (activeMenu === 'years') {
      title = 'Ano da Prova';
      items = availableYears;
      selected = anoSelecionado;
      category = 'years';
    } else if (activeMenu === 'difficulty') {
      title = 'Dificuldade';
      items = ['Fácil', 'Médio', 'Difícil'];
      selected = dificuldadeSelecionada;
      category = 'difficulty';
    } else if (activeMenu === 'types') {
      title = 'Tipo de Questão';
      items = [QuestionType.MULTIPLE_CHOICE, QuestionType.TRUE_FALSE];
      selected = tipoSelecionado;
      category = 'types';
    }

    let totalSelectedCount = selected.length;
    if (category === 'disciplines') {
      const cData = getCargoData();
      const selectedDiscSet = new Set(disciplinaSelecionada);
      const topicsWithoutParentCount = assuntoSelecionado.reduce((acc, t) => {
        let parent: string | undefined;
        if (activeTab === 'cursos' && cursoSelecionado && cargoSelecionado && cData) {
           for (const [disc, topics] of Object.entries(cData)) {
              if (topics.includes(t)) {
                 parent = disc;
                 break;
              }
           }
        }
        if (!parent) {
           parent = topicToDisciplineMap.get(t);
        }
        return (parent && !selectedDiscSet.has(parent)) ? acc + 1 : acc;
      }, 0);
      totalSelectedCount += topicsWithoutParentCount;
    }

    const filterOptions = currentSubMenuOptions;
    const selectedSet = new Set(selected);
    const selectedTopicsSet = new Set(assuntoSelecionado);

    return (
      <div className="absolute inset-0 bg-[#f9fafc] dark:bg-[#01142e] sm:bg-[#f9fafc] dark:bg-[#01142e]/90 sm:backdrop-blur-md z-50 flex flex-col w-full h-full">
        <div className="max-w-7xl px-4 md:px-8 mx-auto w-full h-full flex flex-col">
          <div className="flex items-center gap-3 p-5 border-b border-purple-500/10 pt-8 sm:pt-5 shrink-0">
              <button 
                onClick={() => {
                  setActiveMenu('none');
                  setSearchQuery('');
                }}
                className="text-black dark:text-white p-2 hover:bg-black/5 dark:bg-white/5 rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-black dark:text-white" />
              </button>
              <h1 className="text-xl font-medium text-black dark:text-white"><span>Selecionar </span><span>{title}</span></h1>
          </div>

          <div className="p-5 border-b border-purple-500/10 shrink-0">
            <div className="bg-white dark:bg-[#0a2346] rounded-xl border border-purple-500/10 flex items-center px-4 py-3 shadow-inner">
              <Search size={18} className="text-purple-500/60 mr-2" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) setSelectedLetter(null);
                }}
                className="bg-transparent flex-1 outline-none text-sm placeholder-white/30 text-black dark:text-white w-full" 
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors ml-2"
                >
                  <XCircle size={16} />
                </button>
              )}
            </div>

            {/* Botoes de letras A a Z - apenas em Disciplinas e Bancas */}
            {(category === 'disciplines' || category === 'boards') && (
              <div className="mt-3 flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLetter(null);
                    setExpandedDiscipline(null);
                  }}
                  className={cn(
                    "px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all border cursor-pointer",
                    selectedLetter === null
                      ? "bg-purple-500 text-white border-purple-500 shadow-sm shadow-purple-500/20"
                      : "bg-white dark:bg-[#0a2346] border-purple-500/20 text-black/70 dark:text-white/70 hover:border-purple-500/50 hover:text-black dark:hover:text-white"
                  )}
                >
                  Todas
                </button>

                {ALPHABET_LETTERS.map((letter) => {
                  const hasItems = availableLetters.has(letter);
                  const isSelected = selectedLetter === letter;

                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={!hasItems}
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedLetter(isSelected ? null : letter);
                        setExpandedDiscipline(null);
                      }}
                      className={cn(
                        "w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-all border",
                        isSelected
                          ? "bg-purple-500 text-white border-purple-500 shadow-sm shadow-purple-500/30 ring-2 ring-purple-500/30 scale-105"
                          : hasItems
                            ? "bg-white dark:bg-[#0a2346] border-purple-500/20 text-black dark:text-white hover:bg-purple-500/10 hover:border-purple-500/40 cursor-pointer"
                            : "bg-black/[0.03] dark:bg-white/[0.03] border-transparent text-black/20 dark:text-white/20 cursor-not-allowed opacity-30"
                      )}
                      title={hasItems ? `Filtrar por ${letter}` : `Nenhum item com a letra ${letter}`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-2 no-scrollbar pb-8 relative">
            {filterOptions.length === 0 ? (
              <div className="text-center text-black dark:text-black/40 dark:text-white/40 mt-10 p-5 bg-white dark:bg-[#0a2346] rounded-xl border border-purple-500/10">
                <p>Nenhum item encontrado{selectedLetter ? ` com a letra "${selectedLetter}"` : ''}.</p>
                {(selectedLetter || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedLetter(null);
                      setSearchQuery('');
                    }}
                    className="mt-3 text-xs text-purple-500 hover:underline font-bold cursor-pointer inline-block"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              category === 'disciplines' ? filterOptions.map(({ value: item, count }) => {
                const isSelected = selectedSet.has(item);
                const isExpanded = expandedDiscipline === item;
                const isDisabled = count === 0;
                
                const topicOptions = isExpanded ? currentExpandedTopicOptions : [];
                
                return (
                  <div key={item} 
                    className={cn(
                      "border rounded-xl overflow-hidden transition-all mb-2", 
                      isSelected ? "border-purple-500" : "border-black/10 dark:border-white/10",
                      isDisabled && "opacity-40 grayscale border-transparent pointer-events-none"
                    )}
                  >
                    <div 
                      className={cn(
                        "flex items-center justify-between p-4", 
                        isSelected ? "bg-purple-500/10" : "bg-white dark:bg-[#0a2346]",
                        !isDisabled && "hover:bg-white dark:bg-[#0a2346]/80 cursor-pointer"
                      )} 
                      onClick={() => !isDisabled && setExpandedDiscipline(isExpanded ? null : item)}
                    >
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (!isDisabled) toggleFilter(category, item); 
                          }} 
                          disabled={isDisabled}
                          className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all", 
                            isSelected ? "bg-purple-500 border-purple-500 text-white" : "border-black/30 dark:border-white/30",
                            isDisabled && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {isSelected && <Check size={14} />}
                        </button>
                        <span className="text-black dark:text-white font-bold text-sm">
                          <span>{item}</span>
                          {activeTab !== 'cursos' && <span className="ml-2 text-xs text-purple-500">({count})</span>}
                        </span>
                      </div>
                      {isDisabled ? (
                        <div className="w-5 h-5 flex items-center justify-center">
                          <Lock size={16} className="text-black dark:text-black/20 dark:text-white/20" />
                        </div>
                      ) : (
                        <ChevronRight className={cn("text-black dark:text-black/40 dark:text-white/40 transition-transform", isExpanded ? "rotate-90" : "rotate-0")} size={20} />
                      )}
                    </div>
                    
                    {isExpanded && !isDisabled && (
                      <div className="p-4 bg-black/20 border-t border-black/5 dark:border-white/5 space-y-6">
                        {topicOptions.length > 0 ? (
                          <div>
                            <h4 className="text-black dark:text-black/80 dark:text-white/80 text-xs font-bold uppercase tracking-wider mb-3">Assuntos Específicos</h4>
                            <div className="flex flex-wrap gap-2">
                              {topicOptions.map(({ value: a, count: tCount }) => {
                                const isDis = tCount === 0;
                                const isTopicChecked = selectedTopicsSet.has(a) || isSelected;
                                return (
                                <button 
                                  key={a} 
                                  onClick={() => !isDis && toggleFilter('topics', a)} 
                                  disabled={isDis}
                                  className={cn("px-3 py-1.5 rounded-lg border text-xs font-bold transition-all", 
                                    isTopicChecked ? "bg-purple-500 text-white border-transparent" : "bg-black/5 dark:bg-white/5 text-black dark:text-black/70 dark:text-white/70 border-black/10 dark:border-white/10 hover:border-black/30 dark:border-white/30",
                                    isDis && "opacity-40 grayscale cursor-not-allowed hover:border-transparent pointer-events-none"
                                  )}
                                >
                                  {a} {activeTab !== 'cursos' && <span className={cn("ml-1 font-normal opacity-70")}>({tCount})</span>}
                                </button>
                              )})}
                            </div>
                          </div>
                        ) : (
                          <div className="text-black dark:text-black/40 dark:text-white/40 text-xs">Nenhum assunto específico.</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }) : filterOptions.map(({ value: item, count }) => {
                const isSelected = selectedSet.has(item);
                const isZeroCount = count === 0;
                
                const isVisuallyDisabled = isZeroCount || (!isSelected && ((category === 'cursos_selector' && cursoSelecionado) || (category === 'cargos_selector' && cargoSelecionado)));

                const displayLabel = category === 'types' 
                  ? (item === QuestionType.MULTIPLE_CHOICE ? 'Múltipla Escolha' : 'Certo/Errado') 
                  : item;
                const isApiceInedita = category === 'boards' && item === 'Inéditas Ápice Concurso';

                return (
                  <button
                    key={item}
                    onClick={() => toggleFilter(category, item)}
                    disabled={isZeroCount}
                    className={cn(
                      "w-full flex items-center justify-between p-4 mb-2 rounded-xl transition-all border",
                      isSelected 
                        ? "bg-purple-500/10 border-purple-500/40" 
                        : "bg-white dark:bg-[#0a2346] border-transparent hover:border-purple-500/10",
                      isVisuallyDisabled && "opacity-40 grayscale border-transparent hover:border-transparent"
                    )}
                  >
                    <span className={cn("text-sm font-medium text-left flex items-center gap-2", isSelected ? "text-black dark:text-white" : "text-black dark:text-white")}>
                      {isApiceInedita ? (
                        <span className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5">
                            {displayLabel}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 tracking-wider">
                            Destaque
                          </span>
                        </span>
                      ) : (
                        <span>{displayLabel}</span>
                      )}
                      {activeTab !== 'cursos' && category !== 'cursos_selector' && category !== 'cargos_selector' && <span className="text-xs text-black dark:text-white font-mono">({count})</span>}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <Check size={12} className="text-black dark:text-white font-bold" />
                      </div>
                    )}
                    {isZeroCount && (
                      <div className="w-5 h-5 flex items-center justify-center">
                        <Lock size={16} className="text-black dark:text-black/20 dark:text-white/20" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Action Button */}
          <div className="bg-[#f9fafc] dark:bg-[#01142e]/90 backdrop-blur-md border-t border-purple-500/10 p-4 z-40 w-full shrink-0">
            <div className="flex flex-row items-center justify-between sm:justify-end gap-3 max-w-7xl px-4 md:px-8 mx-auto w-full">
              <button 
                onClick={() => toggleFilter(category, 'clear-all-hack')} // Optional clear logic
                className="h-12 px-4 sm:px-6 flex items-center justify-center rounded-xl text-black dark:text-black/60 dark:text-white/60 font-bold text-sm transition-colors hover:bg-black/5 dark:bg-white/5 hover:text-black dark:text-white"
              >
                {totalSelectedCount} selecionados
              </button>
              <button 
                onClick={() => {
                  setActiveMenu('none');
                  setSearchQuery('');
                }}
                className="h-12 px-6 sm:px-8 flex items-center justify-center bg-purple-500 text-white rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(84,172,191,0.2)] transition-all gap-2 flex-1 sm:flex-none"
              >
                <span>Aplicar </span>(<span>{totalSelectedCount}</span>)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (validQuestions.length === 0) {
    return (
      <div className="flex flex-col flex-1 min-h-[100dvh] items-center justify-center bg-[#f9fafc] dark:bg-[#01142e] p-6 text-center text-black dark:text-white relative overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent opacity-50" />
          <div className="absolute -top-48 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 flex flex-col items-center max-w-sm">
          <div className="w-16 h-16 bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500 mb-6 animate-pulse border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <Loader2 size={32} className="animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-black dark:text-white mb-2">Carregando Banco de Questões...</h2>
          <p className="text-black/60 dark:text-white/60 text-sm mb-6 leading-relaxed">
            Localizando e indexando todas as questões, disciplinas e bancas do sistema. Aguarde um instante...
          </p>
          <div className="w-56 h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden mb-6">
            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-[#266877] animate-pulse" />
          </div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    );
  }

  if (isLoadingData) {
    return (
      <div className="flex flex-col flex-1 h-full bg-transparent w-full relative overflow-hidden items-center justify-center text-white font-sans selection:bg-purple-500/30">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent opacity-50" />
          <div className="absolute -top-48 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4 animate-in fade-in duration-500">
          <Loader2 size={48} className="animate-spin text-purple-500" />
          <h2 className="text-xl font-bold text-black dark:text-white">Carregando seu progresso...</h2>
          <p className="text-sm text-black/50 dark:text-white/50">Sincronizando estatísticas de desempenho</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-transparent w-full relative overflow-hidden text-white font-sans selection:bg-purple-500/30">
      
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent opacity-50" />
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {activeMenu !== 'none' && renderSubMenu()}

      <div className={cn("w-full flex-1 flex flex-col pt-6 relative z-10 overflow-hidden", activeMenu !== 'none' ? "hidden" : "flex")}>
        <div className="flex-1 overflow-y-auto no-scrollbar w-full pb-32">
          <div className="px-5 max-w-7xl mx-auto flex items-center justify-between mb-6 w-full shrink-0">
          <div className="flex items-center gap-3">
              <button 
                onClick={onBack}
                className="text-black dark:text-white p-2 hover:bg-black/5 dark:bg-white/5 rounded-full transition-colors"
                >
                <ArrowLeft size={20} className="text-black dark:text-white" />
              </button>
              <h1 className="text-xl font-medium text-black dark:text-white">Novo filtro</h1>
          </div>
        </div>

        <div className="px-5 max-w-7xl mx-auto mb-4 flex gap-3 overflow-x-auto no-scrollbar pb-1 w-full shrink-0">
          <button 
            onClick={() => setActiveTab('simples')}
            className={cn(
              "flex-1 min-w-[120px] rounded-lg py-2.5 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all",
              activeTab === 'simples' ? "bg-purple-500 text-white" : "bg-white dark:bg-[#0a2346] border border-purple-500/10 text-black dark:text-black/40 dark:text-white/40"
            )}
          >
              <span>Simples </span><span className={cn("px-1.5 rounded-sm text-xs", activeTab === 'simples' ? "bg-[#f9fafc] dark:bg-[#01142e]/20" : "bg-black/10 dark:bg-white/10")}><span>{(bancaSelecionada.length + disciplinaSelecionada.length + assuntoSelecionado.length + anoSelecionado.length + dificuldadeSelecionada.length + tipoSelecionado.length)}</span></span>
          </button>
          <button 
            onClick={() => setActiveTab('avancado')}
            className={cn(
              "flex-1 min-w-[150px] rounded-lg py-2.5 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all",
              (activeTab === 'avancado' || activeTab === 'cursos') ? "bg-purple-500 text-white shadow-md shadow-purple-500/20" : "bg-white dark:bg-[#0a2346] border border-purple-500/10 text-black dark:text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
            )}
          >
              <GraduationCap size={16} />
              <span>Cursos e Simulados</span>
          </button>
        </div>

        {activeTab !== 'avancado' && activeTab !== 'cursos' && activeTab !== 'saved' && activeTab !== 'scheduled' && (
          <div className="px-5 max-w-7xl mx-auto mb-6 w-full shrink-0">
             <div className="bg-white dark:bg-[#0a2346] rounded-xl border border-purple-500/10 flex items-center px-4 py-3 w-full shadow-inner focus-within:border-purple-500/30 transition-colors">
               <Search size={18} className="text-purple-500/60 mr-3 shrink-0" />
               <input 
                 type="text" 
                 placeholder="Buscar por código (ex: AC10001) ou palavras-chave..." 
                 value={searchText}
                 onChange={(e) => setSearchText(e.target.value)}
                 className="bg-transparent flex-1 outline-none text-sm placeholder-black/30 dark:placeholder-white/30 text-black dark:text-white w-full font-medium"
               />
               {searchText && (
                 <button onClick={() => setSearchText('')} className="ml-2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white">
                   <XCircle size={16} />
                 </button>
               )}
             </div>
          </div>
        )}

        <div className="px-0 sm:px-5 max-w-7xl mx-auto space-y-4 w-full shrink-0 flex-1 flex flex-col overflow-y-auto no-scrollbar">
          {(activeTab === 'avancado' || activeTab === 'cursos') ? (
            <SimulatorScreen questions={questions} performance={performance} onStart={onStartTraining} />
          ) : activeTab === 'saved' ? (
            <div className="px-5 sm:px-0 space-y-6 pb-24">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4">
                <div className="bg-white dark:bg-[#0a2346] rounded-xl border border-purple-500/10 flex items-center px-4 py-2.5 w-full sm:max-w-xs shadow-inner">
                  <Search size={16} className="text-purple-500/60 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Buscar filtros..." 
                    value={savedFilterSearch}
                    onChange={(e) => setSavedFilterSearch(e.target.value)}
                    className="bg-transparent flex-1 outline-none text-sm placeholder-white/30 text-black dark:text-white w-full" 
                  />
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select 
                    value={savedFilterSort}
                    onChange={(e) => setSavedFilterSort(e.target.value as any)}
                    className="bg-white dark:bg-[#0a2346] border border-purple-500/10 text-black dark:text-white text-xs font-bold rounded-lg px-3 py-2.5 outline-none flex-1 sm:flex-none"
                  >
                    <option value="recent">Mais Recentes</option>
                    <option value="name">Nome (A-Z)</option>
                    <option value="used">Mais Usados</option>
                  </select>
                </div>
              </div>

              {sortedSavedFilters.length === 0 ? (
                <div className="text-center py-12 px-6 bg-white dark:bg-[#0a2346]/40 rounded-2xl border border-dashed border-purple-500/20">
                  <Filter className="mx-auto text-purple-500/20 mb-4" size={48} />
                  <p className="text-black dark:text-black/60 dark:text-white/60 font-medium">Nenhum filtro salvo encontrado.</p>
                  <button 
                    onClick={() => setActiveTab('simples')}
                    className="mt-4 text-white text-sm font-bold bg-purple-500/10 px-4 py-2 rounded-lg hover:bg-purple-500/20 transition-all"
                  >
                    Criar novo filtro
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {sortedSavedFilters.map(filter => (
                    <div 
                      key={filter.id}
                      className="group bg-white dark:bg-[#0a2346] border border-purple-500/10 hover:border-purple-500/30 rounded-2xl p-4 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => loadSavedFilter(filter)}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="font-bold text-black dark:text-white text-sm group-hover:text-purple-500 transition-colors">{filter.name}</h3>
                            {filter.isFavorite && <Star size={12} className="fill-purple-500 text-purple-500" />}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {filter.disciplinaSelecionada.length > 0 && (
                              <span className="text-[10px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-1.5 py-0.5 rounded text-black dark:text-black/50 dark:text-white/50 lowercase">
                                {filter.disciplinaSelecionada.length} disciplinas
                              </span>
                            )}
                            {filter.bancaSelecionada.length > 0 && (
                              <span className="text-[10px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-1.5 py-0.5 rounded text-black dark:text-black/50 dark:text-white/50 lowercase">
                                {filter.bancaSelecionada.length} bancas
                              </span>
                            )}
                            {filter.anoSelecionado.length > 0 && (
                              <span className="text-[10px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-1.5 py-0.5 rounded text-black dark:text-black/50 dark:text-white/50">
                                {filter.anoSelecionado.length} anos
                              </span>
                            )}
                            {filter.tipoSelecionado && filter.tipoSelecionado.length > 0 && (
                              <span className="text-[10px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-1.5 py-0.5 rounded text-black dark:text-black/50 dark:text-white/50">
                                {filter.tipoSelecionado.length} tipos
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteFilter(filter);
                            }}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              filter.isFavorite ? "bg-purple-500/10 text-white" : "hover:bg-black/5 dark:bg-white/5 text-black dark:text-black/20 dark:text-white/20"
                            )}
                          >
                            <Star size={16} className={cn(filter.isFavorite && "fill-purple-500")} />
                          </button>
                          
                          <div className="relative group/menu">
                            <button className="p-2 hover:bg-black/5 dark:bg-white/5 rounded-lg text-black dark:text-black/20 dark:text-white/20"><MoreVertical size={16} /></button>
                            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#0a2346] border border-black/10 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden hidden group-hover/menu:block z-50 min-w-[120px]">
                              <button 
                                onClick={() => {
                                  setFilterToEdit(filter);
                                  setNewFilterName(filter.name);
                                  setShowSaveModal(true);
                                }}
                                className="w-full px-4 py-2.5 text-left text-xs font-bold text-black dark:text-white hover:bg-black/5 dark:bg-white/5 flex items-center gap-2"
                              >
                                <Edit3 size={14} /> Renomear
                              </button>
                              <button 
                                onClick={() => setShowConfirmDelete(filter.id)}
                                className="w-full px-4 py-2.5 text-left text-xs font-bold text-black dark:text-white hover:bg-rose-500/10 flex items-center gap-2"
                              >
                                <Trash2 size={14} /> Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between text-[10px] text-black dark:text-black/30 dark:text-white/30 font-medium">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><History size={10} /> {filter.usageCount || 0} usos</span>
                          {filter.lastUsed && (
                             <span>• Lançado em {new Date(filter.lastUsed).toLocaleDateString()}</span>
                          )}
                        </div>
                        <button 
                          onClick={() => loadSavedFilter(filter)}
                          className="text-black dark:text-white font-black uppercase tracking-wider"
                        >
                          Usar filtro &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'scheduled' ? (
            <div className="space-y-6 py-4 text-center pb-24 px-5 sm:px-0">
               <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6">
                <h3 className="text-rose-400 font-bold text-xl mb-3">Revisão de Erros</h3>
                <p className="text-black dark:text-black/70 dark:text-white/70 text-sm mb-6">Você verá apenas as questões erradas que agendou ao finalizar os últimos módulos.</p>
                <p className="text-black dark:text-black/40 dark:text-white/40 text-[10px] uppercase tracking-widest font-black">Clique em INICIAR QUESTÕES para revisar</p>
               </div>
            </div>
          ) : (
            <div className="space-y-3 mt-4 mb-8 px-5 sm:px-0">
              <button 
                onClick={() => setActiveMenu('disciplines')}
                className="w-full flex items-center justify-between bg-white dark:bg-[#0a2346] border border-purple-500/20 hover:border-purple-500/50 transition-colors rounded-xl p-4"
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-black dark:text-white font-bold text-sm">Disciplinas e Assuntos</span>
                  <span className="text-black dark:text-black/40 dark:text-white/40 text-[10px] uppercase tracking-widest font-bold">
                    {(disciplinaSelecionada.length > 0 || assuntoSelecionado.length > 0) ? `${disciplinaSelecionada.length} disc., ${assuntoSelecionado.length} ass.` : 'Todas'}
                  </span>
                </div>
                <ChevronRight size={18} className="text-black dark:text-black/60 dark:text-white/60" />
              </button>

                  <button 
                    onClick={() => setActiveMenu('boards')}
                    className="w-full flex items-center justify-between bg-white dark:bg-[#0a2346] border border-purple-500/20 hover:border-purple-500/50 transition-colors rounded-xl p-4"
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-black dark:text-white font-bold text-sm">Bancas</span>
                      <span className="text-black dark:text-black/40 dark:text-white/40 text-[10px] uppercase tracking-widest font-bold">
                        {bancaSelecionada.length > 0 ? `${bancaSelecionada.length} selecionadas` : 'Todas'}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-black dark:text-black/60 dark:text-white/60" />
                  </button>

                  <button 
                    onClick={() => setActiveMenu('years')}
                    className="w-full flex items-center justify-between bg-white dark:bg-[#0a2346] border border-purple-500/20 hover:border-purple-500/50 transition-colors rounded-xl p-4"
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-black dark:text-white font-bold text-sm">Ano da Prova</span>
                      <span className="text-black dark:text-black/40 dark:text-white/40 text-[10px] uppercase tracking-widest font-bold">
                        {anoSelecionado.length > 0 ? `${anoSelecionado.length} selecionados` : 'Todos'}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-black dark:text-black/60 dark:text-white/60" />
                  </button>

                  <button 
                    onClick={() => setActiveMenu('difficulty')}
                    className="w-full flex items-center justify-between bg-white dark:bg-[#0a2346] border border-purple-500/20 hover:border-purple-500/50 transition-colors rounded-xl p-4"
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-black dark:text-white font-bold text-sm">Dificuldade</span>
                      <span className="text-black dark:text-black/40 dark:text-white/40 text-[10px] uppercase tracking-widest font-bold">
                        {dificuldadeSelecionada.length > 0 ? `${dificuldadeSelecionada.length} selecionadas` : 'Todas'}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-black dark:text-black/60 dark:text-white/60" />
                  </button>

                  <button 
                    onClick={() => setActiveMenu('types')}
                    className="w-full flex items-center justify-between bg-white dark:bg-[#0a2346] border border-purple-500/20 hover:border-purple-500/50 transition-colors rounded-xl p-4"
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-black dark:text-white font-bold text-sm">Tipo de Questão</span>
                      <span className="text-black dark:text-black/40 dark:text-white/40 text-[10px] uppercase tracking-widest font-bold">
                        {tipoSelecionado.length > 0 ? `${tipoSelecionado.length} selecionados` : 'Todos'}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-black dark:text-black/60 dark:text-white/60" />
                  </button>


              <div className="bg-white dark:bg-[#0a2346] border border-purple-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                
                <span className="text-black dark:text-white font-bold text-sm block mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Situação das questões
                </span>
                
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'todas', label: 'Todas as questões', icon: Filter, color: 'text-purple-500' },
                    { id: 'nao_respondidas', label: 'Não resolvidas (Inéditas)', icon: CircleDashed, color: 'text-black dark:text-black/40 dark:text-white/40' },
                    { id: 'resolvidas', label: 'Resolvidas', icon: CheckCircle2, color: 'text-blue-400' },
                    { id: 'corretas', label: 'Já acertei', icon: CheckCircle2, color: 'text-emerald-400' },
                    { id: 'incorretas', label: 'Já errei', icon: XCircle, color: 'text-rose-400' }
                  ].map(opt => (
                    <button 
                      key={opt.id}
                      onClick={() => setStatusRespondida(opt.id as any)}
                      className={cn(
                        "group flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300",
                        statusRespondida === opt.id 
                          ? "bg-purple-500/10 border-purple-500 shadow-[0_0_15px_rgba(84,172,191,0.1)]" 
                          : "bg-[#f9fafc] dark:bg-[#01142e]/40 border-black/5 dark:border-white/5 text-black dark:text-black/50 dark:text-white/50 hover:bg-[#f9fafc] dark:bg-[#01142e]/60 hover:border-black/10 dark:border-white/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <opt.icon size={18} className={cn(
                          "transition-transform group-hover:scale-110",
                          statusRespondida === opt.id ? opt.color : "text-black dark:text-black/20 dark:text-white/20"
                        )} />
                        <span className={cn(
                          "text-xs font-bold transition-colors",
                          statusRespondida === opt.id ? "text-black dark:text-white" : "text-black dark:text-black/40 dark:text-white/40"
                        )}>
                          {opt.label}
                        </span>
                      </div>
                      
                      {statusRespondida === opt.id && (
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center animate-in zoom-in-50 duration-200">
                          <Check size={12} className="text-black dark:text-white stroke-[3px]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {activeTab !== 'avancado' && activeTab !== 'cursos' && activeTab !== 'saved' && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#f9fafc] dark:bg-[#01142e]/98 backdrop-blur-md border-t border-purple-500/20 p-4 z-50 w-full shadow-[0_-10px_30px_rgba(1,20,46,0.9)]">
              <div className="max-w-7xl px-4 md:px-8 mx-auto flex flex-row items-center justify-between gap-3 w-full">
                <button
                  onClick={() => setActiveTab('saved')}
                  className="h-12 w-12 flex items-center justify-center bg-white dark:bg-[#0a2346] border border-purple-500/20 text-white rounded-xl hover:bg-purple-500/10 transition-all shrink-0 group relative"
                  title="Filtros Salvos"
                >
                   <History size={20} className="group-hover:scale-110 transition-transform" />
                   <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#01142e] hidden"></span>
                </button>
                <div className="flex flex-row items-center gap-3">
                  { (bancaSelecionada.length > 0 || disciplinaSelecionada.length > 0 || assuntoSelecionado.length > 0 || anoSelecionado.length > 0 || dificuldadeSelecionada.length > 0 || statusRespondida !== 'todas' || tipoSelecionado.length > 0 || cursoSelecionado !== null || cargoSelecionado !== null) && (
                    <>
                      <button 
                        onClick={clearFilters}
                      className="h-12 px-4 flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-black dark:text-white rounded-xl hover:bg-rose-500/20 transition-all animate-in fade-in slide-in-from-bottom-2 shrink-0"
                      title="Limpar Filtros"
                    >
                      <Trash2 size={18} className="sm:mr-2" />
                      <span className="hidden sm:inline font-bold text-sm">Limpar</span>
                    </button>
                    <button 
                      onClick={() => {
                        setFilterToEdit(null);
                        setNewFilterName('');
                        setShowSaveModal(true);
                      }}
                      className="h-12 px-4 flex items-center justify-center bg-white dark:bg-[#0a2346] border border-purple-500/20 text-white rounded-xl hover:bg-purple-500/10 transition-all animate-in fade-in slide-in-from-bottom-2 shrink-0"
                      title="Salvar Filtro"
                    >
                      <Save size={18} className="sm:mr-2" />
                      <span className="hidden sm:inline font-bold text-sm">Salvar Filtro</span>
                    </button>
                  </>
                )}

                <button 
                  onClick={applyFilters}
                  disabled={isLoading}
                  className="h-12 px-6 flex-1 sm:flex-none flex items-center justify-center bg-purple-500 text-white rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(84,172,191,0.2)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{loadingStep || 'Gerando...'}</span>
                    </>
                  ) : activeTab === 'scheduled' ? 'Iniciar Revisão' : 'Iniciar Questões'}
                </button>
                </div>
              </div>
          </div>
        )}
      </div>
      
      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#f9fafc] dark:bg-[#01142e]/90 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0a2346] border border-purple-500/20 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-black dark:text-white mb-2">{filterToEdit ? 'Renomear Filtro' : 'Salvar Filtro'}</h3>
            <p className="text-black dark:text-black/50 dark:text-white/50 text-sm mb-6">Dê um nome intuitivo para encontrar este filtro facilmente depois.</p>
            
            <input 
              autoFocus
              type="text" 
              placeholder="Ex: Minhas Bancas Favoritas"
              value={newFilterName}
              onChange={(e) => setNewFilterName(e.target.value)}
              className="w-full bg-[#f9fafc] dark:bg-[#01142e] border border-purple-500/20 rounded-xl px-4 py-3 text-black dark:text-white outline-none focus:border-purple-500 transition-colors mb-6"
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-3 text-black dark:text-black/60 dark:text-white/60 font-bold text-sm hover:bg-black/5 dark:bg-white/5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveFilter}
                disabled={isSavingFilter || !newFilterName.trim()}
                className="flex-1 py-3 bg-purple-500 text-white font-bold text-sm rounded-xl hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSavingFilter && <Loader2 size={16} className="animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#f9fafc] dark:bg-[#01142e]/90 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0a2346] border border-rose-500/20 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white mb-2">Excluir Filtro?</h3>
            <p className="text-black dark:text-black/50 dark:text-white/50 text-sm mb-6">Esta ação não poderá ser desfeita. Você tem certeza que deseja remover este filtro?</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmDelete(null)}
                className="flex-1 py-3 text-black dark:text-black/60 dark:text-white/60 font-bold text-sm hover:bg-black/5 dark:bg-white/5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => deleteSavedFilter(showConfirmDelete)}
                className="flex-1 py-3 bg-rose-500 text-black dark:text-white font-bold text-sm rounded-xl hover:brightness-110 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No questions found modal with smart actions */}
      {showEmptyResultsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0a2346] border border-purple-500/20 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mb-4">
              <AlertCircle size={26} />
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white mb-2">Nenhuma questão encontrada</h3>
            <p className="text-black/70 dark:text-white/70 text-sm mb-6 leading-relaxed">
              A combinação de filtros selecionada não possui questões disponíveis ou todas já foram resolvidas com o status selecionado.
            </p>
            
            <div className="flex flex-col gap-2.5">
              <button 
                onClick={() => {
                  setStatusRespondida('todas');
                  setShowEmptyResultsModal(false);
                }}
                className="w-full py-3 px-4 bg-purple-500 text-white font-bold text-sm rounded-xl hover:brightness-110 shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                <span>Incluir Questões Já Resolvidas</span>
              </button>
              
              <button 
                onClick={() => {
                  clearFilters();
                  setShowEmptyResultsModal(false);
                }}
                className="w-full py-3 px-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 border border-black/10 dark:border-white/10"
              >
                <Trash2 size={16} />
                <span>Limpar Todos os Filtros</span>
              </button>

              <button 
                onClick={() => setShowEmptyResultsModal(false)}
                className="w-full py-2.5 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white text-xs font-semibold transition-colors"
              >
                Ajustar Filtros Manualmente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

