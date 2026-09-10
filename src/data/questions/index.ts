import { Question } from "../../types";
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

export const allMockQuestions: Question[] = [
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
];
