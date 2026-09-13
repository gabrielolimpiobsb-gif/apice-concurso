import { Question } from "../../types";
import { apicePackQuestions } from "../../services/packQuestionsAdapter";
import { portugueseQuestions } from "./portuguese";
import { penalQuestions } from "./penal";
import { afoQuestions } from "./afo";
import { otherQuestions } from "./others";
import { simuladoPRF } from "./simulado_prf_index";
import { simuladoIBGE } from "./simulado_ibge_index";
import { simuladoGranCursosPt1 } from "./simulado_grancursos_pt1";
import { simuladoGranCursosPt2 } from "./simulado_grancursos_pt2";
import { simuladoGranCursosPt3 } from "./simulado_grancursos_pt3";
import { bancoDeQuestoes } from "./banco_de_questoes";
import { bancoDeQuestoes2 } from "./banco_de_questoes2";
import { bancoDeQuestoes3 } from "./banco_de_questoes3";
import { bancoAC1 } from "./banco_ac_1";
import { bancoAC2 } from "./banco_ac_2";
import { bancoAC3 } from "./banco_ac_3";
import { bancoAC4 } from "./banco_ac_4";
import { bancoAC5 } from "./banco_ac_5";
import { bancoAC6 } from "./banco_ac_6";

export const allMockQuestions: Question[] = [
  ...apicePackQuestions,
  ...portugueseQuestions,
  ...penalQuestions,
  ...afoQuestions,
  ...otherQuestions,
  ...simuladoPRF,
  ...simuladoIBGE,
  ...simuladoGranCursosPt1,
  ...simuladoGranCursosPt2,
  ...simuladoGranCursosPt3,
  ...bancoDeQuestoes,
  ...bancoDeQuestoes2,
  ...bancoDeQuestoes3,
  ...bancoAC1,
  ...bancoAC2,
  ...bancoAC3,
  ...bancoAC4,
  ...bancoAC5,
  ...bancoAC6,
];
