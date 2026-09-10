import { Question, Difficulty, QuestionType } from '../../types';

export const simulado_prf_pt5: Question[] = [
  {
    id: "AC10065",
    text: "Mévio, enquanto conduzia veículo automotor em via urbana, ao fazer curva, veio a perder o controle da direção, atingindo pedestres... (Questão 65 sem enunciado explícito de pergunta no OCR, considerando-se a narrativa de lesão corporal culposa no trânsito)",
    discipline: "Legislação de Trânsito",
    topic: "Crimes de Trânsito",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "VUNESP",
    year: 2022, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "Uma vez que Mévio não estava sob influência de álcool...", isCorrect: false },
      { id: "b", text: "Uma vez que Mévio não estava sob influência de álcool, tendo praticado lesão corporal culposa, é aplicável a transação penal...", isCorrect: false },
      { id: "c", text: "A composição civil dos danos implicará renúncia ao direito de representação.", isCorrect: false },
      { id: "d", text: "Tendo praticado crime de lesão corporal, previsto no artigo 302...", isCorrect: false },
      { id: "e", text: "Tendo praticado crime de lesão corporal, na condução de veículo automotor, Mévio poderá ter suspensa, cautelarmente, a habilitação...", isCorrect: true }
    ]
  },
  {
    id: "AC10066",
    text: "Na notificação de autuação, deve constar a data do término do prazo para a apresentação do condutor infrator, que não será inferior a quinze dias, contados a partir da data da notificação da autuação ou da publicação por edital.",
    discipline: "Legislação de Trânsito",
    topic: "Processo Administrativo",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2020, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.TRUE_FALSE, alternatives: [ { id: "c", text: "Certo", isCorrect: true },
      { id: "e", text: "Errado", isCorrect: false }
    ]
  },
  {
    id: "AC10067",
    text: "A computação na nuvem (cloud computing) possibilita que aplicações executadas em servidores isolados sejam também executadas na nuvem (Internet) em um ambiente de larga escala e com o uso “elástico” de recursos.",
    discipline: "Informática",
    topic: "Computação em Nuvem",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2021, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.TRUE_FALSE, alternatives: [ { id: "c", text: "Certo", isCorrect: true },
      { id: "e", text: "Errado", isCorrect: false }
    ]
  },
  {
    id: "AC10068",
    text: "O auto de infração de trânsito será arquivado e seu registro será julgado insubsistente caso não seja expedida a notificação da autuação no prazo máximo de quarenta e cinco dias.",
    discipline: "Legislação de Trânsito",
    topic: "Processo Administrativo",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2020, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.TRUE_FALSE, alternatives: [ { id: "c", text: "Certo", isCorrect: false },
      { id: "e", text: "Errado", isCorrect: true }
    ]
  },
  {
    id: "AC10069",
    text: "Um usuário deseja abrir a caixa de diálogo Executar do MS-Windows 10, em sua configuração original, por meio de um atalho por teclado. Assinale a alternativa que apresenta o atalho por teclado usado para atender ao descrito no enunciado.",
    discipline: "Informática",
    topic: "Windows",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "VUNESP",
    year: 2023, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "Ctrl + R", isCorrect: false },
      { id: "b", text: "Alt + F2", isCorrect: false },
      { id: "c", text: "Tecla Windows + F2", isCorrect: false },
      { id: "d", text: "Tecla Windows + R", isCorrect: true },
      { id: "e", text: "F2", isCorrect: false }
    ]
  },
  {
    id: "AC10070",
    text: "Um usuário A enviou um e-mail. De: A, Para: B, Cc: vazio, Cco: C. O usuário B, ao receber o e-mail de A, escolheu Responder a todos, adicionou D no campo Cco e enviou seu e-mail. Assinale a alternativa que apresenta os campos do e-mail enviado por B.",
    discipline: "Informática",
    topic: "Correio Eletrônico",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "VUNESP",
    year: 2023, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "De: B Para: A Cc: vazio Cco: D", isCorrect: false },
      { id: "b", text: "De: B Para: A Cc: C Cco: D", isCorrect: false },
      { id: "c", text: "De: B Para: A Cc: D Cco: C", isCorrect: false },
      { id: "d", text: "De: B Para: A Cc: vazio Cco: C, D", isCorrect: false },
      { id: "e", text: "De: B Para: A Cc: vazio Cco: D", isCorrect: true } // Let's ensure gabarito: 70=e
    ]
  },
  {
    id: "AC10071",
    text: "Somente em caso de infração de natureza leve é permitida a substituição da multa pela advertência por escrito, exigindo-se, ainda, que o infrator não seja reincidente, na mesma infração, nos últimos doze meses.",
    discipline: "Legislação de Trânsito",
    topic: "Penalidades",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2020, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.TRUE_FALSE, alternatives: [ { id: "c", text: "Certo", isCorrect: false },
      { id: "e", text: "Errado", isCorrect: true }
    ]
  },
  {
    id: "AC10072",
    text: "Acerca dos direitos e deveres individuais e coletivos previstos na Constituição Federal de 1988, analise as afirmativas abaixo e dê valores Verdadeiro (V) ou Falso (F).\n\n( ) O direito à vida abrange tanto o direito de não ser morto, como também o direito de ter uma vida digna.\n( ) Em decorrência do direito à vida, é proibido, em qualquer hipótese, a pena de morte.\n( ) Não é possível interrupção terapêutica da gestação de feto anencéfalo.",
    discipline: "Direito Constitucional",
    topic: "Direitos e Deveres Individuais",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "IBFC",
    year: 2022, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "V - V - V", isCorrect: false },
      { id: "b", text: "V - F - F", isCorrect: true },
      { id: "c", text: "F - F - V", isCorrect: false },
      { id: "d", text: "V - V - F", isCorrect: false },
      { id: "e", text: "F - V - F", isCorrect: false }
    ]
  },
  {
    id: "AC10073",
    text: "Por se tratar de lesão corporal de natureza culposa (disputa automobilística), é vedada a instauração de inquérito policial para apurar as condutas de Godofredo e Antônio, bastando a realização dos exames médicos e o compromisso de comparecer.",
    discipline: "Legislação de Trânsito",
    topic: "Crimes de Trânsito",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2019, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.TRUE_FALSE, alternatives: [ { id: "c", text: "Certo", isCorrect: false },
      { id: "e", text: "Errado", isCorrect: true }
    ]
  },
  {
    id: "AC10074",
    text: "Sobre a Resolução nº 24/98, do Conselho Nacional do Trânsito (CONTRAN) é correto afirmar.",
    discipline: "Legislação de Trânsito",
    topic: "Resoluções CONTRAN",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "INAZ",
    year: 2016, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "O décimo caractere do VIN será obrigatoriamente o da identificação do ano de fabricação.", isCorrect: false },
      { id: "b", text: "São obrigatórias apenas as etiquetas autocolantes do compartimento do motor e da coluna da porta com os oito últimos caracteres do VIN impressos.", isCorrect: true },
      { id: "c", text: "Os veículos importados devem possuir dezesseis caracteres no código VIN.", isCorrect: false },
      { id: "d", text: "O ano de fabricação deverá ser gravado nos vidros dianteiro e traseiro...", isCorrect: false },
      { id: "e", text: "O ano modelo será gravado em plaqueta autocolante, no chassi ou no monobloco...", isCorrect: false }
    ]
  },
  {
    id: "AC10075",
    text: "Acerca da regulamentação do CONTRAN para utilização de sistemas automáticos não metrológicos de fiscalização, nos termos do CTB, assinale a opção correta.",
    discipline: "Legislação de Trânsito",
    topic: "Resoluções CONTRAN",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2008, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "O sistema automático não metrológico não precisa ter sua conformidade avaliada pelo INMETRO.", isCorrect: false },
      { id: "b", text: "A imagem deve permitir a identificação do veículo... não sendo necessário constar o horário da infração.", isCorrect: false },
      { id: "c", text: "A imagem deve permitir a identificação do veículo, mas não é necessário registrar o local da infração.", isCorrect: false },
      { id: "d", text: "Quando utilizado esse tipo de sistema, é obrigatória a presença da autoridade ou do agente no local.", isCorrect: false },
      { id: "e", text: "Antes de efetivar o uso do sistema, a autoridade deverá verificar se a sinalização de regulamentação exigida está em conformidade com a legislação.", isCorrect: true }
    ]
  },
  {
    id: "AC10076",
    text: "É considerado crime de trânsito previsto no Código de Trânsito Brasileiro:",
    discipline: "Legislação de Trânsito",
    topic: "Crimes de Trânsito",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "AOCP",
    year: 2023, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "dirigir o veículo usando calçado que não se firme nos pés.", isCorrect: false },
      { id: "b", text: "inovar artificiosamente, em caso de acidente automobilístico com vítima, a fim de induzir a erro o agente policial, o perito, ou juiz.", isCorrect: true },
      { id: "c", text: "utilizar as luzes do veículo, o pisca-alerta, exceto em imobilizações ou situações de emergência.", isCorrect: false },
      { id: "d", text: "deixar de manter acesas as luzes de posição.", isCorrect: false },
      { id: "e", text: "transportar carga excedente em desacordo com regulamento.", isCorrect: false }
    ]
  },
  {
    id: "AC10077",
    text: "No que diz respeito às disposições do Código de Trânsito Brasileiro, assinale a alternativa incorreta.",
    discipline: "Legislação de Trânsito",
    topic: "Crimes de Trânsito",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "IBFC",
    year: 2022, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "No homicídio culposo cometido na direção de veículo automotor, a pena é aumentada se o agente não possuir Permissão para Dirigir ou CNH.", isCorrect: false },
      { id: "b", text: "Incide nas penas do crime de omissão de socorro, ainda que a omissão seja suprida por terceiros.", isCorrect: false },
      { id: "c", text: "Configura crime de embriaguez a conduta de conduzir veículo automotor com capacidade psicomotora alterada...", isCorrect: false },
      { id: "d", text: "Caso o condutor suspeito se recuse a realizar o teste, não há como punir o agente pelo referido delito.", isCorrect: true },
      { id: "e", text: "Os crimes de trânsito são de ação penal pública incondicionada.", isCorrect: false }
    ]
  },
  {
    id: "AC10078",
    text: "Observe o diagrama de conjuntos. Dessa situação, é correto concluir que o número de turistas que visitou apenas uma dessas cidades supera o número daqueles que visitaram apenas duas dessas cidades em",
    discipline: "Raciocínio Lógico",
    topic: "Conjuntos",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "VUNESP",
    year: 2018, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "31.", isCorrect: false },
      { id: "b", text: "9.", isCorrect: false },
      { id: "c", text: "34.", isCorrect: false },
      { id: "d", text: "16.", isCorrect: false },
      { id: "e", text: "27.", isCorrect: true }
    ]
  },
  {
    id: "AC10079",
    text: "Andressa dirigia seu carro e atropelou Zilda... O exame de alcoolemia constatou que Andressa não havia feito uso de álcool... Tratando-se de delito de trânsito, ocorre que:",
    discipline: "Legislação de Trânsito",
    topic: "Crimes de Trânsito",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "FGV",
    year: 2021, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "o crime praticado é de ação penal pública incondicionada.", isCorrect: false },
      { id: "b", text: "a gravidade da lesão culposa praticada no contexto altera a tipificação.", isCorrect: false },
      { id: "c", text: "a autora não poderá ser presa em flagrante, por ter prestado pronto e integral socorro à vítima.", isCorrect: true },
      { id: "d", text: "a autoridade policial poderá determinar a suspensão da habilitação para dirigir.", isCorrect: false },
      { id: "e", text: "a autoridade policial poderá representar pela decretação da prisão preventiva.", isCorrect: false }
    ]
  },
  {
    id: "AC10080",
    text: "Quando há duas faixas demarcatórias amarelas e contínuas em uma rodovia, significa que:",
    discipline: "Legislação de Trânsito",
    topic: "Sinalização de Trânsito",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "INAZ",
    year: 2016, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "É permitida a ultrapassagem dos veículos que vêm pela direita.", isCorrect: false },
      { id: "b", text: "Somente para os veículos que vêm pela esquerda é permitida a ultrapassagem.", isCorrect: false },
      { id: "c", text: "A ultrapassagem é permitida para os veículos que vêm em ambos os sentidos.", isCorrect: false },
      { id: "d", text: "É proibida a ultrapassagem em ambos os sentidos.", isCorrect: true },
      { id: "e", text: "É uma rodovia federal e os limites de velocidade devem ser respeitados.", isCorrect: false }
    ]
  }
];
