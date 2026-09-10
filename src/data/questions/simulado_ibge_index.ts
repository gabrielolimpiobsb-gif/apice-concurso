import { Question } from '../../types';
import { simulado_ibge_pt1 } from './simulado_ibge_pt1';
import { simulado_ibge_pt2 } from './simulado_ibge_pt2';

export const simuladoIBGE: Question[] = [
  ...simulado_ibge_pt1,
  ...simulado_ibge_pt2,
];
