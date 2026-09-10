import { Question, Performance } from "../types";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, deleteDoc, collection, writeBatch, Timestamp } from "firebase/firestore";

const getQuestionsKey = () =>
  `concurso_pro_questoes_${auth.currentUser?.uid || "guest"}`;
const getPerformanceKey = () =>
  `concurso_pro_performance_${auth.currentUser?.uid || "guest"}`;

const getTasksKey = () =>
  `concurso_pro_tasks_${auth.currentUser?.uid || "guest"}`;
const getFlashcardsKey = () => `concurso_pro_flashcards_${auth.currentUser?.uid || window.localStorage.getItem('apses_user_uid') || 'guest'}`;

const getCycleConfigKey = () => 
  `concurso_pro_cycle_config_${auth.currentUser?.uid || "guest"}`;

const getScheduleModeKey = () =>
  `concurso_pro_schedule_mode_${auth.currentUser?.uid || "guest"}`;
const getSavedFiltersKey = () =>
  `concurso_pro_saved_filters_${auth.currentUser?.uid || "guest"}`;
const getLastFilterKey = () =>
  `concurso_pro_last_filter_${auth.currentUser?.uid || "guest"}`;

export const storageService = {
  getQuestions: (): Question[] => {
    const data = localStorage.getItem(getQuestionsKey());
    try { return data ? (JSON.parse(data) || []).filter(Boolean) : []; } catch (e) { return []; }
  },

  setQuestions: (questions: Question[]) => {
    // Disabled storing all questions in localStorage to prevent QuotaExceededError
    // localStorage.setItem(getQuestionsKey(), JSON.stringify(questions));
  },

  saveQuestion: (question: Question) => {
    // Disabled storing all questions in localStorage to prevent QuotaExceededError
  },

  getPerformance: (): Performance[] => {
    const data = localStorage.getItem(getPerformanceKey());
    try { return data ? (JSON.parse(data) || []).filter(Boolean) : []; } catch (e) { return []; }
  },

  savePerformance: (perf: Performance) => {
    const performance = storageService.getPerformance();
    performance.push(perf);
    localStorage.setItem(getPerformanceKey(), JSON.stringify(performance));
    
    // Sync to Firestore
    if (auth.currentUser) {
      const perfId = `${perf.questionId}_${perf.answeredAt}`;
      const perfRef = doc(db, 'users', auth.currentUser.uid, 'performances', perfId);
      setDoc(perfRef, {
        ...perf,
        userId: auth.currentUser.uid
      }).catch(console.error);
    }
  },

  getTasks: () => {
    const data = localStorage.getItem(getTasksKey());
    try { try { const parsed = data ? JSON.parse(data) : []; return Array.isArray(parsed) ? parsed : []; } catch (e) { return []; } } catch (e) { console.error('Error parsing flashcards from local storage', e); return []; }
  },

  setTasks: (tasks: any[]) => {
    localStorage.setItem(getTasksKey(), JSON.stringify(tasks));
    
    // Sync to Firestore
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      // For tasks, we might want to sync only the one being updated, but setTasks usually sets the whole array.
      // To avoid complexity, we'll try to batch update if possible or just update individually.
      // But let's assume tasks are small enough to update the ones that changed.
      // For simplicity in this turn, we'll try to save all.
      // Make it truly async to avoid blocking main thread on large array iteration
      setTimeout(() => {
        const chunkSize = 400;
        for (let i = 0; i < tasks.length; i += chunkSize) {
          const chunk = tasks.slice(i, i + chunkSize);
          const batch = writeBatch(db);
          chunk.forEach(task => {
            const taskRef = doc(db, 'users', userId, 'tasks', task.id);
            batch.set(taskRef, {
              ...task,
              updatedAt: Timestamp.now()
            });
          });
          batch.commit().catch(console.error);
        }
      }, 0);
    }
  },

  getCycleConfig: () => {
    const data = localStorage.getItem(getCycleConfigKey());
    return data ? JSON.parse(data) : {
      subjects: [],
      totalHoursPerCycle: 12
    };
  },

  setCycleConfig: (config: any) => {
    localStorage.setItem(getCycleConfigKey(), JSON.stringify(config));
    
    // Sync to Firestore
    if (auth.currentUser) {
      const configRef = doc(db, 'users', auth.currentUser.uid, 'config', 'cycle');
      setDoc(configRef, {
        ...config,
        updatedAt: Timestamp.now()
      }).catch(console.error);
    }
  },

  getScheduleMode: (): 'none' | 'calendar' | 'cycle' => {
    return (localStorage.getItem(getScheduleModeKey()) as 'none' | 'calendar' | 'cycle') || 'none';
  },

  setScheduleMode: (mode: 'none' | 'calendar' | 'cycle') => {
    localStorage.setItem(getScheduleModeKey(), mode);
    
    // Also save in user settings in Firestore
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      setDoc(userRef, {
        settings: {
          scheduleMode: mode
        }
      }, { merge: true }).catch(console.error);
    }
  },

  getFlashcards: (): any[] => {
    const data = localStorage.getItem(getFlashcardsKey());
    try { return data ? JSON.parse(data) : []; } catch (e) { return []; }
  },

  getFlashcardStats: () => {
    const key = `concurso_pro_flashcard_stats_${auth.currentUser?.uid || "guest"}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : { correct: 0, total: 0 };
  },

  saveFlashcardReview: (isCorrect: boolean) => {
    const key = `concurso_pro_flashcard_stats_${auth.currentUser?.uid || "guest"}`;
    const stats = storageService.getFlashcardStats();
    stats.total += 1;
    if (isCorrect) stats.correct += 1;
    localStorage.setItem(key, JSON.stringify(stats));
  },

  saveFlashcard: (flashcard: any) => {
    try {
      const flashcards = storageService.getFlashcards();
      if (Array.isArray(flashcards)) {
        flashcards.push(flashcard);
        localStorage.setItem(getFlashcardsKey(), JSON.stringify(flashcards));
      }
    } catch (e) { console.error('Error saving flashcard', e); }
  },

  updateFlashcard: (updatedFlashcard: any) => {
    try {
      const flashcards = storageService.getFlashcards();
      if (Array.isArray(flashcards)) {
        const index = flashcards.findIndex(f => f.id === updatedFlashcard.id);
        if (index !== -1) {
          flashcards[index] = updatedFlashcard;
          localStorage.setItem(getFlashcardsKey(), JSON.stringify(flashcards));
        }
      }
    } catch (e) { console.error('Error updating flashcard', e); }
  },

  deleteFlashcard: (flashcardId: string) => {
    let flashcards = storageService.getFlashcards();
    flashcards = flashcards.filter(f => f.id !== flashcardId);
    localStorage.setItem(getFlashcardsKey(), JSON.stringify(flashcards));
  },

  getSavedFilters: (): any[] => {
    const data = localStorage.getItem(getSavedFiltersKey());
    try { return data ? JSON.parse(data) : []; } catch (e) { return []; }
  },

  getFavoriteCourses: (): string[] => {
    const uid = window.localStorage.getItem('apses_user_uid') || 'guest';
    const data = localStorage.getItem(`apses_favorite_courses_${uid}`);
    try { return data ? JSON.parse(data) : []; } catch (e) { return []; }
  },

  setFavoriteCourses: (courses: string[]) => {
    const uid = window.localStorage.getItem('apses_user_uid') || 'guest';
    localStorage.setItem(`apses_favorite_courses_${uid}`, JSON.stringify(courses));
  },

  setSavedFilters: (filters: any[]) => {
    localStorage.setItem(getSavedFiltersKey(), JSON.stringify(filters));
  },

  getLastFilter: (): any | null => {
    const data = localStorage.getItem(getLastFilterKey());
    if (!data) return null;
    try {
      const filter = JSON.parse(data);
      if (!filter) return null;
      const isValid = (filter.banca?.length > 0 || filter.disciplina?.length > 0 || filter.assunto?.length > 0 || filter.ano?.length > 0 || filter.dificuldade?.length > 0 || (filter.status && filter.status !== 'todas') || filter.tipoSelecionado?.length > 0);
      return isValid ? filter : null;
    } catch {
      return null;
    }
  },

  setLastFilter: (filter: any) => {
    if (!filter) {
      localStorage.removeItem(getLastFilterKey());
    } else {
      localStorage.setItem(getLastFilterKey(), JSON.stringify(filter));
    }
  },

  resetQuestionsAndPerformance: () => {
    localStorage.removeItem(getQuestionsKey());
    localStorage.removeItem(getPerformanceKey());
    localStorage.removeItem(getTasksKey());
    localStorage.removeItem(getFlashcardsKey());
    localStorage.removeItem(getScheduleModeKey());
    localStorage.removeItem(getCycleConfigKey());
  },
};

