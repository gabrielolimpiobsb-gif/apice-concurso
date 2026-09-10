import { Question, Performance, Simulado, SimuladoConfig, SimuladoResultStats, SavedSimuladoTemplate } from '../types';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, getDocs, collection, deleteDoc, query, orderBy } from 'firebase/firestore';
import { storageService } from './storageService';

const getSimuladosKey = () => `apice_simulados_${auth.currentUser?.uid || 'guest'}`;
const getTemplatesKey = () => `apice_simulado_templates_${auth.currentUser?.uid || 'guest'}`;
const getFavoritesKey = () => `apice_favorite_questions_${auth.currentUser?.uid || 'guest'}`;
const getErrorNotebookKey = () => `apice_error_notebook_${auth.currentUser?.uid || 'guest'}`;

export const simuladoService = {
  // --- Simulado Persistence ---
  getSimulados: async (): Promise<Simulado[]> => {
    // 1. Try local storage first for instant load
    const localData = localStorage.getItem(getSimuladosKey());
    let list: Simulado[] = [];
    if (localData) {
      try {
        list = JSON.parse(localData) || [];
      } catch (e) {
        console.error('Erro ao ler simulados locais', e);
      }
    }

    // 2. If logged in, fetch from Firestore and merge
    if (auth.currentUser) {
      try {
        const q = query(
          collection(db, `users/${auth.currentUser.uid}/simulados`),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const remoteList = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Simulado));
          // Merge remote with local by ID
          const map = new Map<string, Simulado>();
          list.forEach(s => map.set(s.id, s));
          remoteList.forEach(s => map.set(s.id, s));
          list = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          localStorage.setItem(getSimuladosKey(), JSON.stringify(list));
        }
      } catch (error) {
        console.warn('Erro ao carregar simulados do Firestore:', error);
      }
    }

    return list;
  },

  getSimulado: async (id: string): Promise<Simulado | null> => {
    const list = await simuladoService.getSimulados();
    return list.find(s => s.id === id) || null;
  },

  getActiveOrPausedSimulado: async (): Promise<Simulado | null> => {
    const list = await simuladoService.getSimulados();
    return list.find(s => s.status === 'in_progress' || s.status === 'paused') || null;
  },

  saveSimulado: async (simulado: Simulado): Promise<void> => {
    // 1. Save to local storage immediately
    try {
      const list = await simuladoService.getSimulados();
      const index = list.findIndex(s => s.id === simulado.id);
      if (index >= 0) {
        list[index] = simulado;
      } else {
        list.unshift(simulado);
      }
      localStorage.setItem(getSimuladosKey(), JSON.stringify(list));
    } catch (e) {
      console.error('Erro ao salvar simulado no local storage:', e);
    }

    // 2. Sync to Firestore
    if (auth.currentUser) {
      try {
        const docRef = doc(db, `users/${auth.currentUser.uid}/simulados`, simulado.id);
        await setDoc(docRef, {
          ...simulado,
          userId: auth.currentUser.uid,
          updatedAt: Date.now()
        }, { merge: true });
      } catch (error) {
        console.warn('Erro ao salvar simulado no Firestore:', error);
      }
    }
  },

  deleteSimulado: async (id: string): Promise<void> => {
    try {
      const list = await simuladoService.getSimulados();
      const filtered = list.filter(s => s.id !== id);
      localStorage.setItem(getSimuladosKey(), JSON.stringify(filtered));
    } catch (e) {
      console.error('Erro ao remover simulado do local storage:', e);
    }

    if (auth.currentUser) {
      try {
        const docRef = doc(db, `users/${auth.currentUser.uid}/simulados`, id);
        await deleteDoc(docRef);
      } catch (error) {
        console.warn('Erro ao remover simulado do Firestore:', error);
      }
    }
  },

  // --- Simulado Templates ---
  getTemplates: async (): Promise<SavedSimuladoTemplate[]> => {
    const local = localStorage.getItem(getTemplatesKey());
    try {
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  },

  saveTemplate: async (name: string, config: SimuladoConfig): Promise<SavedSimuladoTemplate> => {
    const templates = await simuladoService.getTemplates();
    const newTemplate: SavedSimuladoTemplate = {
      id: `template_${Date.now()}`,
      name,
      createdAt: Date.now(),
      config
    };
    templates.unshift(newTemplate);
    localStorage.setItem(getTemplatesKey(), JSON.stringify(templates));
    return newTemplate;
  },

  deleteTemplate: async (id: string): Promise<void> => {
    const templates = await simuladoService.getTemplates();
    const filtered = templates.filter(t => t.id !== id);
    localStorage.setItem(getTemplatesKey(), JSON.stringify(filtered));
  },

  // --- Favorite Questions ---
  getFavoriteQuestionIds: (): string[] => {
    const local = localStorage.getItem(getFavoritesKey());
    try {
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  },

  toggleFavoriteQuestion: (questionId: string): boolean => {
    const current = simuladoService.getFavoriteQuestionIds();
    const exists = current.includes(questionId);
    let updated: string[];
    if (exists) {
      updated = current.filter(id => id !== questionId);
    } else {
      updated = [...current, questionId];
    }
    localStorage.setItem(getFavoritesKey(), JSON.stringify(updated));

    if (auth.currentUser) {
      const docRef = doc(db, `users/${auth.currentUser.uid}/config/favoriteQuestions`);
      setDoc(docRef, { questionIds: updated }, { merge: true }).catch(console.warn);
    }
    return !exists;
  },

  isQuestionFavorite: (questionId: string): boolean => {
    return simuladoService.getFavoriteQuestionIds().includes(questionId);
  },

  // --- Error Notebook ---
  getErrorNotebookIds: (): string[] => {
    const local = localStorage.getItem(getErrorNotebookKey());
    try {
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  },

  addToErrorNotebook: (questionId: string): void => {
    const current = simuladoService.getErrorNotebookIds();
    if (!current.includes(questionId)) {
      const updated = [...current, questionId];
      localStorage.setItem(getErrorNotebookKey(), JSON.stringify(updated));
    }
  },

  // --- Question Filtering & Selection (100% Real Questions) ---
  generateSimuladoQuestions: (
    config: SimuladoConfig,
    allQuestions: Question[],
    userPerformance: Performance[] = []
  ): { questions: Question[]; countAvailable: number; message?: string } => {
    if (!allQuestions || allQuestions.length === 0) {
      return { questions: [], countAvailable: 0, message: 'Banco de questões vazio.' };
    }

    // 1. Initial Filtering
    let pool = [...allQuestions];

    // Filter by Bancas
    if (config.bancas && config.bancas.length > 0) {
      pool = pool.filter(q => q.board && config.bancas.includes(q.board));
    }

    // Filter by Disciplinas
    if (config.disciplinas && config.disciplinas.length > 0) {
      pool = pool.filter(q => q.discipline && config.disciplinas.includes(q.discipline));
    }

    // Filter by Assuntos
    if (config.assuntos && config.assuntos.length > 0) {
      pool = pool.filter(q => q.topic && config.assuntos.includes(q.topic));
    }

    // Filter by Anos
    if (config.anos && config.anos.length > 0) {
      pool = pool.filter(q => q.year && config.anos.includes(q.year));
    }

    // Filter by Cargo
    if (config.cargo) {
      pool = pool.filter(q => q.cargo && q.cargo.toLowerCase().includes(config.cargo!.toLowerCase()));
    }

    // Filter by Dificuldade
    if (config.dificuldades && config.dificuldades.length > 0) {
      pool = pool.filter(q => q.difficulty && config.dificuldades.includes(q.difficulty));
    }

    // Filter by Tipo de Questão
    if (config.tiposQuestao && config.tiposQuestao.length > 0) {
      pool = pool.filter(q => q.type && config.tiposQuestao.includes(q.type));
    }

    // Filter by User Performance Status
    const answeredIds = new Set(userPerformance.map(p => p.questionId));
    const wrongIds = new Set(userPerformance.filter(p => !p.isCorrect).map(p => p.questionId));
    const favoriteIds = new Set(simuladoService.getFavoriteQuestionIds());

    if (config.statusQuestoes === 'nao_respondidas') {
      pool = pool.filter(q => !answeredIds.has(q.id));
    } else if (config.statusQuestoes === 'erros') {
      pool = pool.filter(q => wrongIds.has(q.id));
    } else if (config.statusQuestoes === 'favoritas') {
      pool = pool.filter(q => favoriteIds.has(q.id));
    }

    // Special Modes
    if (config.mode === 'mistakes') {
      pool = pool.filter(q => wrongIds.has(q.id));
    } else if (config.mode === 'weak_spots') {
      // Find disciplines/topics where user accuracy is below 60%
      const topicStats: Record<string, { total: number; correct: number }> = {};
      userPerformance.forEach(p => {
        const key = p.topic || p.discipline || 'Outros';
        if (!topicStats[key]) topicStats[key] = { total: 0, correct: 0 };
        topicStats[key].total++;
        if (p.isCorrect) topicStats[key].correct++;
      });
      const weakKeys = Object.entries(topicStats)
        .filter(([_, stats]) => stats.total >= 2 && (stats.correct / stats.total) < 0.65)
        .map(([k]) => k);

      if (weakKeys.length > 0) {
        pool = pool.filter(q => weakKeys.includes(q.topic) || weakKeys.includes(q.discipline));
      }
    }

    const countAvailable = pool.length;
    if (countAvailable === 0) {
      return {
        questions: [],
        countAvailable: 0,
        message: 'Nenhuma questão encontrada com os filtros selecionados. Reduza os filtros para prosseguir.'
      };
    }

    // 2. Distribution Selection
    let selected: Question[] = [];

    if (config.distributionMode === 'custom_per_discipline' && config.qtyPerDiscipline && Object.keys(config.qtyPerDiscipline).length > 0) {
      // Select specified count per discipline
      Object.entries(config.qtyPerDiscipline).forEach(([disc, requestedQty]) => {
        const discPool = pool.filter(q => q.discipline === disc);
        const shuffled = [...discPool].sort(() => 0.5 - Math.random());
        selected.push(...shuffled.slice(0, requestedQty));
      });
    } else {
      // Proportional or Random distribution
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      selected = shuffled.slice(0, Math.min(config.totalQuestions, pool.length));
    }

    if (config.shuffle) {
      selected.sort(() => 0.5 - Math.random());
    }

    return {
      questions: selected,
      countAvailable
    };
  },

  // --- Result Calculation (100% Real User Metrics) ---
  calculateResult: (simulado: Simulado, allQuestions: Question[]): SimuladoResultStats => {
    const questionsMap = new Map(allQuestions.map(q => [q.id, q]));
    const totalQuestions = simulado.questionIds.length;

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    let totalCorrectTime = 0;
    let totalIncorrectTime = 0;
    let totalTimeSpent = simulado.timeSpentSeconds || 0;

    let slowestQuestionId: string | undefined;
    let slowestQuestionTime = 0;

    const disciplineStats: SimuladoResultStats['disciplineStats'] = {};
    const topicStats: SimuladoResultStats['topicStats'] = {};
    const boardStats: SimuladoResultStats['boardStats'] = {};

    simulado.questionIds.forEach(qId => {
      const q = questionsMap.get(qId);
      const ans = simulado.answers[qId];

      const disc = q?.discipline || 'Geral';
      const topic = q?.topic || 'Assunto Geral';
      const board = q?.board || 'Outras';

      // Init discipline record
      if (!disciplineStats[disc]) {
        disciplineStats[disc] = { discipline: disc, total: 0, correct: 0, incorrect: 0, percentage: 0, timeSpentSeconds: 0 };
      }
      disciplineStats[disc].total++;

      // Init topic record
      if (!topicStats[topic]) {
        topicStats[topic] = { topic, discipline: disc, total: 0, correct: 0, incorrect: 0, percentage: 0 };
      }
      topicStats[topic].total++;

      // Init board record
      if (!boardStats[board]) {
        boardStats[board] = { board, total: 0, correct: 0, incorrect: 0, percentage: 0 };
      }
      boardStats[board].total++;

      if (!ans || !ans.selectedAlternativeId) {
        unansweredCount++;
      } else {
        const time = ans.timeSpentSeconds || 0;
        if (time > slowestQuestionTime) {
          slowestQuestionTime = time;
          slowestQuestionId = qId;
        }

        disciplineStats[disc].timeSpentSeconds += time;

        if (ans.isCorrect) {
          correctCount++;
          totalCorrectTime += time;
          disciplineStats[disc].correct++;
          topicStats[topic].correct++;
          boardStats[board].correct++;
        } else {
          incorrectCount++;
          totalIncorrectTime += time;
          disciplineStats[disc].incorrect++;
          topicStats[topic].incorrect++;
          boardStats[board].incorrect++;
        }
      }
    });

    // Calculate percentages
    Object.values(disciplineStats).forEach(ds => {
      ds.percentage = ds.total > 0 ? Math.round((ds.correct / ds.total) * 100) : 0;
    });

    Object.values(topicStats).forEach(ts => {
      ts.percentage = ts.total > 0 ? Math.round((ts.correct / ts.total) * 100) : 0;
    });

    Object.values(boardStats).forEach(bs => {
      bs.percentage = bs.total > 0 ? Math.round((bs.correct / bs.total) * 100) : 0;
    });

    const answeredCount = correctCount + incorrectCount;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const averageTimePerQuestionSeconds = answeredCount > 0 ? Math.round(totalTimeSpent / answeredCount) : 0;
    const averageTimeCorrectSeconds = correctCount > 0 ? Math.round(totalCorrectTime / correctCount) : 0;
    const averageTimeIncorrectSeconds = incorrectCount > 0 ? Math.round(totalIncorrectTime / incorrectCount) : 0;

    // Strong and weak topics based on actual accuracy
    const topicList = Object.values(topicStats);
    const strongTopics = topicList
      .filter(t => t.total >= 1 && t.percentage >= 70)
      .sort((a, b) => b.percentage - a.percentage)
      .map(t => ({ topic: t.topic, discipline: t.discipline, percentage: t.percentage }));

    const weakTopics = topicList
      .filter(t => t.total >= 1 && t.percentage < 70)
      .sort((a, b) => a.percentage - b.percentage)
      .map(t => ({ topic: t.topic, discipline: t.discipline, percentage: t.percentage }));

    // Recommendations derived strictly from real test data
    const recommendations: string[] = [];
    if (weakTopics.length > 0) {
      const worst = weakTopics[0];
      recommendations.push(`Atenção prioritária em "${worst.topic}" (${worst.discipline}), onde seu aproveitamento foi de ${worst.percentage}%.`);
      if (weakTopics.length > 1) {
        const secondWorst = weakTopics[1];
        recommendations.push(`Reforçar estudo e resolução de questões de "${secondWorst.topic}" (${secondWorst.percentage}%).`);
      }
    } else if (totalQuestions > 0 && scorePercentage >= 80) {
      recommendations.push('Excelente aproveitamento em todas as disciplinas deste simulado! Mantenha a consistência.');
    }

    if (averageTimeIncorrectSeconds > averageTimeCorrectSeconds && averageTimeIncorrectSeconds > 0) {
      const diff = averageTimeIncorrectSeconds - averageTimeCorrectSeconds;
      recommendations.push(`Você gastou em média ${diff} segundos a mais nas questões erradas. Atenção ao gerenciamento de tempo em dúvidas.`);
    }

    return {
      totalQuestions,
      answeredCount,
      correctCount,
      incorrectCount,
      unansweredCount,
      scorePercentage,
      netScore: Math.max(0, correctCount - (simulado.config.tiposQuestao?.includes('true_false' as any) ? incorrectCount : 0)),
      totalTimeSpentSeconds: totalTimeSpent,
      averageTimePerQuestionSeconds,
      averageTimeCorrectSeconds,
      averageTimeIncorrectSeconds,
      slowestQuestionId,
      slowestQuestionTimeSeconds: slowestQuestionTime,
      disciplineStats,
      topicStats,
      boardStats,
      strongTopics,
      weakTopics,
      recommendations
    };
  },

  // --- Sync Answers to Overall Performance History ---
  syncSimuladoToOverallPerformance: (simulado: Simulado, allQuestions: Question[]) => {
    const questionsMap = new Map(allQuestions.map(q => [q.id, q]));
    const now = Date.now();

    simulado.questionIds.forEach(qId => {
      const ans = simulado.answers[qId];
      if (ans && ans.selectedAlternativeId !== undefined) {
        const q = questionsMap.get(qId);
        if (q) {
          const perf: Performance = {
            questionId: qId,
            isCorrect: !!ans.isCorrect,
            answeredAt: ans.answeredAt || now,
            selectedAlternativeId: ans.selectedAlternativeId,
            timeSpent: ans.timeSpentSeconds || 0,
            discipline: q.discipline,
            topic: q.topic,
          };
          storageService.savePerformance(perf);
          if (!ans.isCorrect) {
            simuladoService.addToErrorNotebook(qId);
          }
        }
      }
    });
  }
};
