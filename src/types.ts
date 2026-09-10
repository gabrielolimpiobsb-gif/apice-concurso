export interface Task {
  id: string | number;
  title: string;
  completed: boolean;
  date: string;
  time?: string;
  type?: "theory" | "questions" | "review" | "manual";
  subject?: string;
  smartReview?: boolean;
  isCycle?: boolean;
  cycleHours?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  settings?: any;
  createdAt: any;
  lastLogin: any;
  referredBy?: string;
  planStatus: "free" | "premium";
  role?: "master" | "admin" | "suporte" | "editor" | "user";
  dailyQuestionsCount?: number;
  lastQuestionResetDate?: string;
  aiFlashcardsUsedCount?: number;
  firstScheduleGeneratedAt?: any;
}

export enum QuestionType {
  MULTIPLE_CHOICE = "multiple_choice",
  TRUE_FALSE = "true_false",
}

export enum Difficulty {
  EASY = "Fácil",
  MEDIUM = "Médio",
  HARD = "Difícil",
}

export interface Alternative {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  discipline: string; // Disciplina em vez de subject
  topic: string; // Assunto
  board: string; // Banca
  year: number; // Ano
  orgao?: string; // Orgao
  cargo?: string; // Cargo
  difficulty: Difficulty;
  type: QuestionType;
  alternatives: Alternative[];
  explanation?: string;
  createdAt: number;
}

export interface Performance {
  id?: string;
  userId?: string;
  questionId: string;
  isCorrect: boolean;
  answeredAt: string | number;
  selectedAlternativeId?: string;
  selectedAlternative?: string; // legancy
  timeSpent?: number;
  topic?: string;
  discipline?: string;
}

export interface DisciplineStats {
  discipline: string;
  total: number;
  correct: number;
  incorrect: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  topic?: string;
  source: "manual" | "ai" | "community" | "pack";
  sourceQuestionId?: string;
  createdAt: number;
}

export interface SavedFilter {
  id: string;
  name: string;
  bancaSelecionada: string[];
  disciplinaSelecionada: string[];
  assuntoSelecionado: string[];
  anoSelecionado: number[];
  dificuldadeSelecionada?: string[];
  statusRespondida?: "todas" | "nao_respondidas" | "resolvidas" | "corretas" | "incorretas";
  tipoSelecionado: QuestionType[];
  isFavorite: boolean;
  usageCount: number;
  lastUsed?: string | number;
  createdAt: string | number;
  banca?: string[];
  disciplina?: string[];
  assunto?: string[];
}

export interface EventDeadline {
  id: string;
  title: string;
  date: string; // ISO string format
  type: "registration_start" | "registration_end" | "exam_date" | "other";
  description?: string;
  createdAt: number;
}

export interface StudySession {
  id: string;
  userId: string;
  name: string;
  filterConfig: Partial<SavedFilter>;
  questionIds: string[];
  sessionAnswers: Record<
    string,
    { selectedAlternative: string; isCorrect: boolean }
  >;
  currentIndex: number;
  timeSpent: number;
  progress: number;
  status: "active" | "completed";
  updatedAt: any;
  createdAt: any;
}

export interface ConcursoMateria {
  nome: string;
  filtro: Partial<SavedFilter>;
}

export interface Concurso {
  id: string;
  nome: string;
  logotipoUrl?: string;
  orgao: string;
  banca?: string;
  area?: string;
  dataProva?: string;
  status: "Aberto" | "Previsto" | "Em Andamento" | "Encerrado";
  materias: ConcursoMateria[];
  totalQuestoes?: number;
}

export interface FlashcardPack {
  id: string;
  title: string;
  description: string;
  price: number;
  coverColor: string;
  imageUrl?: string;
  cardsCount: number;
  flashcards: any[];
}

// --- New Schedule System ---
export interface StudySubject {
  id: string;
  name: string;
  color: string;
}

export interface DayConfig {
  active: boolean;
  hours: number;
}

export interface ScheduleConfig {
  mode: 'automatic' | 'manual';
  subjects: StudySubject[];
  daysOfWeek: Record<number, DayConfig>; // 0 to 6 (0 = Sunday)
  distribution: Record<number, StudySubject[]>; // 0 to 6
  startDate: number;
}

export interface StudyEvent {
  id: string; // "recurring-YYYY-MM-DD-subjectId" or "custom-xyz"
  title: string;
  subjectId?: string;
  color?: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  type: 'subject' | 'event' | 'review';
}

// --- Simulado System Types ---
export interface SimuladoConfig {
  name: string;
  mode: 'custom' | 'auto' | 'mistakes' | 'weak_spots' | 'course';
  courseId?: string;
  cargo?: string;
  totalQuestions: number;
  timerMinutes: number; // 0 = sem limite
  isRealExamMode?: boolean; // gabarito e comentários ocultos durante
  shuffle?: boolean;
  bancas: string[];
  disciplinas: string[];
  assuntos: string[];
  anos: number[];
  dificuldades: string[];
  tiposQuestao: QuestionType[];
  statusQuestoes: 'todas' | 'nao_respondidas' | 'erros' | 'favoritas';
  selectionMode: 'random' | 'manual';
  distributionMode: 'proportional' | 'custom_per_discipline';
  qtyPerDiscipline?: Record<string, number>;
}

export interface SimuladoAnswer {
  selectedAlternativeId?: string;
  isCorrect?: boolean;
  timeSpentSeconds: number;
  answeredAt?: number;
}

export interface SimuladoResultStats {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  scorePercentage: number;
  netScore: number;
  totalTimeSpentSeconds: number;
  averageTimePerQuestionSeconds: number;
  averageTimeCorrectSeconds: number;
  averageTimeIncorrectSeconds: number;
  slowestQuestionId?: string;
  slowestQuestionTimeSeconds?: number;
  fastestDiscipline?: string;
  slowestDiscipline?: string;
  disciplineStats: Record<string, {
    discipline: string;
    total: number;
    correct: number;
    incorrect: number;
    percentage: number;
    timeSpentSeconds: number;
  }>;
  topicStats: Record<string, {
    topic: string;
    discipline: string;
    total: number;
    correct: number;
    incorrect: number;
    percentage: number;
  }>;
  boardStats: Record<string, {
    board: string;
    total: number;
    correct: number;
    incorrect: number;
    percentage: number;
  }>;
  strongTopics: Array<{ topic: string; discipline: string; percentage: number }>;
  weakTopics: Array<{ topic: string; discipline: string; percentage: number }>;
  recommendations: string[];
}

export interface Simulado {
  id: string;
  userId: string;
  title: string;
  config: SimuladoConfig;
  questionIds: string[];
  status: 'not_started' | 'in_progress' | 'paused' | 'completed';
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
  timeLimitSeconds: number;
  remainingSeconds: number;
  timeSpentSeconds: number;
  currentIndex: number;
  markedForReview: string[]; // question IDs
  answers: Record<string, SimuladoAnswer>;
  result?: SimuladoResultStats;
}

export interface SavedSimuladoTemplate {
  id: string;
  name: string;
  createdAt: number;
  config: SimuladoConfig;
}
