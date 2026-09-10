import { Question } from "./types";
import { allMockQuestions } from "./data/questions";
import { normalizeBoard, normalizeDiscipline } from "./utils/normalizers";

export const MOCK_QUESTIONS: Question[] = allMockQuestions.map(q => ({
    ...q,
    board: normalizeBoard(q.board),
    discipline: normalizeDiscipline(q.discipline)
}));
