export interface VideoLesson {
  id: string;
  courseId: string;
  discipline: string;
  module: string;
  title: string;
  topic?: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  isFree?: boolean;
}

export const PRF_DISCIPLINES = [
  'Língua Portuguesa',
  'Raciocínio Lógico-Matemático',
  'Informática',
  'Física',
  'Ética no Serviço Público',
  'Geopolítica Brasileira',
  'Legislação de Trânsito',
  'Direito Administrativo',
  'Direito Constitucional',
  'Direito Penal',
  'Processo Penal',
  'Legislação Especial',
  'Direitos Humanos e Cidadania'
];

export const PRF_MOCK_LESSONS: VideoLesson[] = [
  // Língua Portuguesa
  { id: 'prf-lp-01', courseId: 'prf', discipline: 'Língua Portuguesa', module: 'Módulo 01 - Interpretação de Textos', title: 'Aula 01 - Compreensão textual', order: 1, isFree: true },
  { id: 'prf-lp-02', courseId: 'prf', discipline: 'Língua Portuguesa', module: 'Módulo 01 - Interpretação de Textos', title: 'Aula 02 - Inferência textual', order: 2, isFree: false },
  { id: 'prf-lp-03', courseId: 'prf', discipline: 'Língua Portuguesa', module: 'Módulo 01 - Interpretação de Textos', title: 'Aula 03 - Tipologias textuais', order: 3, isFree: false },
  { id: 'prf-lp-04', courseId: 'prf', discipline: 'Língua Portuguesa', module: 'Módulo 01 - Interpretação de Textos', title: 'Aula 04 - Gêneros textuais', order: 4, isFree: false },
  { id: 'prf-lp-05', courseId: 'prf', discipline: 'Língua Portuguesa', module: 'Módulo 02 - Gramática', title: 'Aula 05 - Classes de palavras', order: 5, isFree: false },
  { id: 'prf-lp-06', courseId: 'prf', discipline: 'Língua Portuguesa', module: 'Módulo 02 - Gramática', title: 'Aula 06 - Concordância verbal', order: 6, isFree: false },
  { id: 'prf-lp-07', courseId: 'prf', discipline: 'Língua Portuguesa', module: 'Módulo 02 - Gramática', title: 'Aula 07 - Concordância nominal', order: 7, isFree: false },
  { id: 'prf-lp-08', courseId: 'prf', discipline: 'Língua Portuguesa', module: 'Módulo 02 - Gramática', title: 'Aula 08 - Regência verbal', order: 8, isFree: false },
  { id: 'prf-lp-09', courseId: 'prf', discipline: 'Língua Portuguesa', module: 'Módulo 02 - Gramática', title: 'Aula 09 - Regência nominal', order: 9, isFree: false },
  { id: 'prf-lp-10', courseId: 'prf', discipline: 'Língua Portuguesa', module: 'Módulo 02 - Gramática', title: 'Aula 10 - Crase', order: 10, isFree: false },
  { id: 'prf-lp-11', courseId: 'prf', discipline: 'Língua Portuguesa', module: 'Módulo 02 - Gramática', title: 'Aula 11 - Colocação pronominal', order: 11, isFree: false },
  { id: 'prf-lp-12', courseId: 'prf', discipline: 'Língua Portuguesa', module: 'Módulo 03 - Sintaxe', title: 'Aula 12 - Termos da oração', order: 12, isFree: false },
  { id: 'prf-lp-13', courseId: 'prf', discipline: 'Língua Portuguesa', module: 'Módulo 03 - Sintaxe', title: 'Aula 13 - Coordenação', order: 13, isFree: false },
  { id: 'prf-lp-14', courseId: 'prf', discipline: 'Língua Portuguesa', module: 'Módulo 03 - Sintaxe', title: 'Aula 14 - Subordinação', order: 14, isFree: false },
  { id: 'prf-lp-15', courseId: 'prf', discipline: 'Língua Portuguesa', module: 'Módulo 03 - Sintaxe', title: 'Aula 15 - Pontuação', order: 15, isFree: false },

  // Raciocínio Lógico-Matemático
  { id: 'prf-rlm-01', courseId: 'prf', discipline: 'Raciocínio Lógico-Matemático', module: 'Módulo 01', title: 'Aula 01 - Proposições', order: 1, isFree: true },
  { id: 'prf-rlm-02', courseId: 'prf', discipline: 'Raciocínio Lógico-Matemático', module: 'Módulo 01', title: 'Aula 02 - Conectivos', order: 2, isFree: false },
  { id: 'prf-rlm-03', courseId: 'prf', discipline: 'Raciocínio Lógico-Matemático', module: 'Módulo 01', title: 'Aula 03 - Tabelas verdade', order: 3, isFree: false },
  { id: 'prf-rlm-04', courseId: 'prf', discipline: 'Raciocínio Lógico-Matemático', module: 'Módulo 01', title: 'Aula 04 - Equivalências lógicas', order: 4, isFree: false },
  { id: 'prf-rlm-05', courseId: 'prf', discipline: 'Raciocínio Lógico-Matemático', module: 'Módulo 01', title: 'Aula 05 - Negação', order: 5, isFree: false },
  { id: 'prf-rlm-06', courseId: 'prf', discipline: 'Raciocínio Lógico-Matemático', module: 'Módulo 02', title: 'Aula 06 - Razão e proporção', order: 6, isFree: false },
  { id: 'prf-rlm-07', courseId: 'prf', discipline: 'Raciocínio Lógico-Matemático', module: 'Módulo 02', title: 'Aula 07 - Regra de três', order: 7, isFree: false },
  { id: 'prf-rlm-08', courseId: 'prf', discipline: 'Raciocínio Lógico-Matemático', module: 'Módulo 02', title: 'Aula 08 - Porcentagem', order: 8, isFree: false },
  { id: 'prf-rlm-09', courseId: 'prf', discipline: 'Raciocínio Lógico-Matemático', module: 'Módulo 02', title: 'Aula 09 - PA', order: 9, isFree: false },
  { id: 'prf-rlm-10', courseId: 'prf', discipline: 'Raciocínio Lógico-Matemático', module: 'Módulo 02', title: 'Aula 10 - PG', order: 10, isFree: false },

  // Informática
  { id: 'prf-inf-01', courseId: 'prf', discipline: 'Informática', module: 'Módulo 01', title: 'Aula 01 - Conceitos básicos', order: 1, isFree: true },
  { id: 'prf-inf-02', courseId: 'prf', discipline: 'Informática', module: 'Módulo 01', title: 'Aula 02 - Windows', order: 2, isFree: false },
  { id: 'prf-inf-03', courseId: 'prf', discipline: 'Informática', module: 'Módulo 01', title: 'Aula 03 - Internet', order: 3, isFree: false },
  { id: 'prf-inf-04', courseId: 'prf', discipline: 'Informática', module: 'Módulo 01', title: 'Aula 04 - Navegadores', order: 4, isFree: false },
  { id: 'prf-inf-05', courseId: 'prf', discipline: 'Informática', module: 'Módulo 01', title: 'Aula 05 - Correio eletrônico', order: 5, isFree: false },
  { id: 'prf-inf-06', courseId: 'prf', discipline: 'Informática', module: 'Módulo 02', title: 'Aula 06 - Segurança da informação', order: 6, isFree: false },
  { id: 'prf-inf-07', courseId: 'prf', discipline: 'Informática', module: 'Módulo 02', title: 'Aula 07 - Malware', order: 7, isFree: false },
  { id: 'prf-inf-08', courseId: 'prf', discipline: 'Informática', module: 'Módulo 02', title: 'Aula 08 - Phishing', order: 8, isFree: false },
  { id: 'prf-inf-09', courseId: 'prf', discipline: 'Informática', module: 'Módulo 02', title: 'Aula 09 - Computação em nuvem', order: 9, isFree: false },
  { id: 'prf-inf-10', courseId: 'prf', discipline: 'Informática', module: 'Módulo 02', title: 'Aula 10 - Inteligência Artificial', order: 10, isFree: false },

  // Física
  { id: 'prf-fis-01', courseId: 'prf', discipline: 'Física', module: 'Módulo 01', title: 'Aula 01 - Cinemática', order: 1, isFree: true },
  { id: 'prf-fis-02', courseId: 'prf', discipline: 'Física', module: 'Módulo 01', title: 'Aula 02 - Movimento uniforme', order: 2, isFree: false },
  { id: 'prf-fis-03', courseId: 'prf', discipline: 'Física', module: 'Módulo 01', title: 'Aula 03 - Movimento uniformemente variado', order: 3, isFree: false },
  { id: 'prf-fis-04', courseId: 'prf', discipline: 'Física', module: 'Módulo 02', title: 'Aula 04 - Leis de Newton', order: 4, isFree: false },
  { id: 'prf-fis-05', courseId: 'prf', discipline: 'Física', module: 'Módulo 02', title: 'Aula 05 - Trabalho', order: 5, isFree: false },
  { id: 'prf-fis-06', courseId: 'prf', discipline: 'Física', module: 'Módulo 02', title: 'Aula 06 - Potência', order: 6, isFree: false },
  { id: 'prf-fis-07', courseId: 'prf', discipline: 'Física', module: 'Módulo 02', title: 'Aula 07 - Energia', order: 7, isFree: false },

  // Ética no Serviço Público
  { id: 'prf-eti-01', courseId: 'prf', discipline: 'Ética no Serviço Público', module: 'Ética no Serviço Público', title: 'Aula 01 - Conceitos básicos', order: 1, isFree: true },
  { id: 'prf-eti-02', courseId: 'prf', discipline: 'Ética no Serviço Público', module: 'Ética no Serviço Público', title: 'Aula 02 - Decreto 1.171/94', order: 2, isFree: false },
  { id: 'prf-eti-03', courseId: 'prf', discipline: 'Ética no Serviço Público', module: 'Ética no Serviço Público', title: 'Aula 03 - Deveres do servidor', order: 3, isFree: false },
  { id: 'prf-eti-04', courseId: 'prf', discipline: 'Ética no Serviço Público', module: 'Ética no Serviço Público', title: 'Aula 04 - Vedações', order: 4, isFree: false },

  // Geopolítica Brasileira
  { id: 'prf-geo-01', courseId: 'prf', discipline: 'Geopolítica Brasileira', module: 'Geopolítica Brasileira', title: 'Aula 01 - Território brasileiro', order: 1, isFree: true },
  { id: 'prf-geo-02', courseId: 'prf', discipline: 'Geopolítica Brasileira', module: 'Geopolítica Brasileira', title: 'Aula 02 - Regiões brasileiras', order: 2, isFree: false },
  { id: 'prf-geo-03', courseId: 'prf', discipline: 'Geopolítica Brasileira', module: 'Geopolítica Brasileira', title: 'Aula 03 - Urbanização', order: 3, isFree: false },
  { id: 'prf-geo-04', courseId: 'prf', discipline: 'Geopolítica Brasileira', module: 'Geopolítica Brasileira', title: 'Aula 04 - Migrações', order: 4, isFree: false },
  { id: 'prf-geo-05', courseId: 'prf', discipline: 'Geopolítica Brasileira', module: 'Geopolítica Brasileira', title: 'Aula 05 - Transportes', order: 5, isFree: false },
  { id: 'prf-geo-06', courseId: 'prf', discipline: 'Geopolítica Brasileira', module: 'Geopolítica Brasileira', title: 'Aula 06 - Meio ambiente', order: 6, isFree: false },

  // Legislação de Trânsito
  { id: 'prf-leg-01', courseId: 'prf', discipline: 'Legislação de Trânsito', module: 'Módulo 01 - CTB', title: 'Aula 01 - Sistema Nacional de Trânsito', order: 1, isFree: true },
  { id: 'prf-leg-02', courseId: 'prf', discipline: 'Legislação de Trânsito', module: 'Módulo 01 - CTB', title: 'Aula 02 - Normas gerais de circulação', order: 2, isFree: false },
  { id: 'prf-leg-03', courseId: 'prf', discipline: 'Legislação de Trânsito', module: 'Módulo 01 - CTB', title: 'Aula 03 - Sinalização', order: 3, isFree: false },
  { id: 'prf-leg-04', courseId: 'prf', discipline: 'Legislação de Trânsito', module: 'Módulo 01 - CTB', title: 'Aula 04 - Veículos', order: 4, isFree: false },
  { id: 'prf-leg-05', courseId: 'prf', discipline: 'Legislação de Trânsito', module: 'Módulo 02', title: 'Aula 05 - Infrações', order: 5, isFree: false },
  { id: 'prf-leg-06', courseId: 'prf', discipline: 'Legislação de Trânsito', module: 'Módulo 02', title: 'Aula 06 - Penalidades', order: 6, isFree: false },
  { id: 'prf-leg-07', courseId: 'prf', discipline: 'Legislação de Trânsito', module: 'Módulo 02', title: 'Aula 07 - Medidas administrativas', order: 7, isFree: false },
  { id: 'prf-leg-08', courseId: 'prf', discipline: 'Legislação de Trânsito', module: 'Módulo 02', title: 'Aula 08 - Processo administrativo', order: 8, isFree: false },
  { id: 'prf-leg-09', courseId: 'prf', discipline: 'Legislação de Trânsito', module: 'Módulo 03', title: 'Aula 09 - Crimes de trânsito', order: 9, isFree: false },
  { id: 'prf-leg-10', courseId: 'prf', discipline: 'Legislação de Trânsito', module: 'Módulo 03', title: 'Aula 10 - Fiscalização', order: 10, isFree: false },
  { id: 'prf-leg-11', courseId: 'prf', discipline: 'Legislação de Trânsito', module: 'Módulo 03', title: 'Aula 11 - Resoluções do CONTRAN', order: 11, isFree: false },

  // Direito Administrativo
  { id: 'prf-dad-01', courseId: 'prf', discipline: 'Direito Administrativo', module: 'Direito Administrativo', title: 'Aula 01 - Administração Pública', order: 1, isFree: true },
  { id: 'prf-dad-02', courseId: 'prf', discipline: 'Direito Administrativo', module: 'Direito Administrativo', title: 'Aula 02 - Princípios Administrativos', order: 2, isFree: false },
  { id: 'prf-dad-03', courseId: 'prf', discipline: 'Direito Administrativo', module: 'Direito Administrativo', title: 'Aula 03 - Poderes Administrativos', order: 3, isFree: false },
  { id: 'prf-dad-04', courseId: 'prf', discipline: 'Direito Administrativo', module: 'Direito Administrativo', title: 'Aula 04 - Atos Administrativos', order: 4, isFree: false },
  { id: 'prf-dad-05', courseId: 'prf', discipline: 'Direito Administrativo', module: 'Direito Administrativo', title: 'Aula 05 - Responsabilidade Civil do Estado', order: 5, isFree: false },

  // Direito Constitucional
  { id: 'prf-dco-01', courseId: 'prf', discipline: 'Direito Constitucional', module: 'Direito Constitucional', title: 'Aula 01 - Princípios Fundamentais', order: 1, isFree: true },
  { id: 'prf-dco-02', courseId: 'prf', discipline: 'Direito Constitucional', module: 'Direito Constitucional', title: 'Aula 02 - Direitos e Garantias Fundamentais', order: 2, isFree: false },
  { id: 'prf-dco-03', courseId: 'prf', discipline: 'Direito Constitucional', module: 'Direito Constitucional', title: 'Aula 03 - Organização do Estado', order: 3, isFree: false },
  { id: 'prf-dco-04', courseId: 'prf', discipline: 'Direito Constitucional', module: 'Direito Constitucional', title: 'Aula 04 - Administração Pública', order: 4, isFree: false },
  { id: 'prf-dco-05', courseId: 'prf', discipline: 'Direito Constitucional', module: 'Direito Constitucional', title: 'Aula 05 - Segurança Pública', order: 5, isFree: false },

  // Direito Penal
  { id: 'prf-dpe-01', courseId: 'prf', discipline: 'Direito Penal', module: 'Direito Penal', title: 'Aula 01 - Aplicação da Lei Penal', order: 1, isFree: true },
  { id: 'prf-dpe-02', courseId: 'prf', discipline: 'Direito Penal', module: 'Direito Penal', title: 'Aula 02 - Crime', order: 2, isFree: false },
  { id: 'prf-dpe-03', courseId: 'prf', discipline: 'Direito Penal', module: 'Direito Penal', title: 'Aula 03 - Culpabilidade', order: 3, isFree: false },
  { id: 'prf-dpe-04', courseId: 'prf', discipline: 'Direito Penal', module: 'Direito Penal', title: 'Aula 04 - Crimes contra a Administração Pública', order: 4, isFree: false },

  // Processo Penal
  { id: 'prf-prp-01', courseId: 'prf', discipline: 'Processo Penal', module: 'Processo Penal', title: 'Aula 01 - Inquérito Policial', order: 1, isFree: true },
  { id: 'prf-prp-02', courseId: 'prf', discipline: 'Processo Penal', module: 'Processo Penal', title: 'Aula 02 - Ação Penal', order: 2, isFree: false },
  { id: 'prf-prp-03', courseId: 'prf', discipline: 'Processo Penal', module: 'Processo Penal', title: 'Aula 03 - Prisão', order: 3, isFree: false },
  { id: 'prf-prp-04', courseId: 'prf', discipline: 'Processo Penal', module: 'Processo Penal', title: 'Aula 04 - Provas', order: 4, isFree: false },

  // Legislação Especial
  { id: 'prf-lee-01', courseId: 'prf', discipline: 'Legislação Especial', module: 'Legislação Especial', title: 'Aula 01 - Lei de Drogas', order: 1, isFree: true },
  { id: 'prf-lee-02', courseId: 'prf', discipline: 'Legislação Especial', module: 'Legislação Especial', title: 'Aula 02 - Estatuto do Desarmamento', order: 2, isFree: false },
  { id: 'prf-lee-03', courseId: 'prf', discipline: 'Legislação Especial', module: 'Legislação Especial', title: 'Aula 03 - Organização Criminosa', order: 3, isFree: false },
  { id: 'prf-lee-04', courseId: 'prf', discipline: 'Legislação Especial', module: 'Legislação Especial', title: 'Aula 04 - Lavagem de Dinheiro', order: 4, isFree: false },

  // Direitos Humanos e Cidadania
  { id: 'prf-dhc-01', courseId: 'prf', discipline: 'Direitos Humanos e Cidadania', module: 'Direitos Humanos e Cidadania', title: 'Aula 01 - Direitos Humanos', order: 1, isFree: true },
  { id: 'prf-dhc-02', courseId: 'prf', discipline: 'Direitos Humanos e Cidadania', module: 'Direitos Humanos e Cidadania', title: 'Aula 02 - Tratados Internacionais', order: 2, isFree: false },
  { id: 'prf-dhc-03', courseId: 'prf', discipline: 'Direitos Humanos e Cidadania', module: 'Direitos Humanos e Cidadania', title: 'Aula 03 - Direitos Fundamentais', order: 3, isFree: false },
  { id: 'prf-dhc-04', courseId: 'prf', discipline: 'Direitos Humanos e Cidadania', module: 'Direitos Humanos e Cidadania', title: 'Aula 04 - Uso Progressivo da Força', order: 4, isFree: false }
];
