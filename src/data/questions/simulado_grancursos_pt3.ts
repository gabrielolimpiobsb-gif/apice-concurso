import { Question, QuestionType, Difficulty } from '../../types';

export const simuladoGranCursosPt3: Question[] = [
  {
    id: "Q283390",
    text: "Com relação a segurança da informação, julgue os itens que se seguem.\n\nA segurança da informação pode ser dividida em segurança física — como, por exemplo, segurança das instalações, ambientes e pessoas — e segurança lógica — como segurança da rede, sistemas de TI e banco de dados.",
    discipline: "Tecnologia da Informação",
    topic: "Segurança da Informação",
    board: "CESPE/CEBRASPE",
    year: 2008,
    orgao: "Ministério da Saúde",
    cargo: "Técnico de Nível Superior",
    difficulty: Difficulty.EASY,
    type: QuestionType.TRUE_FALSE,
    alternatives: [
      { id: "c", text: "Certo", isCorrect: true },
      { id: "e", text: "Errado", isCorrect: false }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q4647178",
    text: "Para a construção de uma edificação, foi necessário fazer um corte em uma encosta e construir um muro de arrimo de concreto armado, que deve ser dimensionado à flexão, de modo a sustentar a encosta. Se o empuxo horizontal do maciço produz um momento fletor característico de 160 kNm, para evitar o tombamento, o muro deve ser dimensionado para um momento fletor de cálculo de",
    discipline: "Engenharia Civil",
    topic: "Cálculo Estrutural",
    board: "VUNESP",
    year: 2025,
    orgao: "Prefeitura de Itatiba - SP",
    cargo: "Engenheiro Civil",
    difficulty: Difficulty.HARD,
    type: QuestionType.MULTIPLE_CHOICE,
    alternatives: [
      { id: "a", text: "192 kNm.", isCorrect: false },
      { id: "b", text: "224 kNm.", isCorrect: false },
      { id: "c", text: "240 kNm.", isCorrect: false },
      { id: "d", text: "320 kNm.", isCorrect: true },
      { id: "e", text: "480 kNm.", isCorrect: false }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q2068372",
    text: "De acordo com a ABNT NBR 6118:2014, na falta de ensaios ou valores fornecidos pelo fabricante, qual valor deve ser adotado para o módulo de elasticidade do aço, usado em armaduras passivas?",
    discipline: "Engenharia Civil",
    topic: "Normas ABNT",
    board: "CONSESP",
    year: 2018,
    orgao: "Prefeitura de Extrema - MG",
    cargo: "Gestor de Obras",
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.MULTIPLE_CHOICE,
    alternatives: [
      { id: "a", text: "210 GPa.", isCorrect: true },
      { id: "b", text: "220 GPa.", isCorrect: false },
      { id: "c", text: "200 GPa.", isCorrect: false },
      { id: "d", text: "150 GPa.", isCorrect: false }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q862401",
    text: "Observe a figura abaixo.\n\nNo apoio representado na figura acima tem-se a estrutura apoiada sobre uma esfera perfeitamente lubrificada. O único movimento que ela será capaz de impedir é a translação na direção vertical OZ, aparecendo com isto uma reação R, agindo sobre a estrutura, conforme indica a figura. O apoio será dito, então, um apoio com 1 (um) movimento impedido ou:",
    discipline: "Engenharia Civil",
    topic: "Resistência dos Materiais",
    board: "Marinha",
    year: 2018,
    orgao: "Ministério da Defesa",
    cargo: "Cabo CAP - Área: Edificações",
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.MULTIPLE_CHOICE,
    alternatives: [
      { id: "a", text: "6 grau de liberdade.", isCorrect: false },
      { id: "b", text: "5 grau de liberdade.", isCorrect: true },
      { id: "c", text: "4 grau de liberdade.", isCorrect: false },
      { id: "d", text: "3 grau de liberdade.", isCorrect: false },
      { id: "e", text: "2 grau de liberdade.", isCorrect: false }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q745655",
    text: "Seja v(t)=9 cos(2π60t + π/3) volts. O fasor A representativo da senoide v(t) é:",
    discipline: "Engenharia Elétrica",
    topic: "Conceitos Básicos",
    board: "FUNRIO",
    year: 2014,
    orgao: "IFBA - BR",
    cargo: "Engenheiro Eletricista",
    difficulty: Difficulty.HARD,
    type: QuestionType.MULTIPLE_CHOICE,
    alternatives: [
      { id: "a", text: "A= 3e^(jπ/3)", isCorrect: false },
      { id: "b", text: "A= 81e^(jπ/3)", isCorrect: false },
      { id: "c", text: "A= 9e^(jπ/3)", isCorrect: true },
      { id: "d", text: "A= 81e^(j2π60t)", isCorrect: false },
      { id: "e", text: "A= 81e^(j60t)", isCorrect: false }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q694116",
    text: "Um capacitor plano, com ar entre as armaduras, está desligado da bateria. Supondo que este capacitor tenha sido totalmente mergulhado na água, avalie as afirmativas a seguir:\n\n1. As cargas nas armaduras não se alteram.\n2. O campo elétrico entre as armaduras diminui.\n3. A capacitância do capacitor aumenta.\n4. A energia no capacitor diminui.\n\nAssinale a alternativa correta.",
    discipline: "Engenharia Elétrica",
    topic: "Eletrônica de Potência",
    board: "FUNPAR",
    year: 2011,
    orgao: "ITAIPU Binacional - BR",
    cargo: "Assistente Técnico I",
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.MULTIPLE_CHOICE,
    alternatives: [
      { id: "a", text: "Somente as afirmativas 2, 3 e 4 são verdadeiras.", isCorrect: false },
      { id: "b", text: "Somente as afirmativas 1 e 2 são verdadeiras.", isCorrect: false },
      { id: "c", text: "Somente as afirmativas 1, 2 e 3 são verdadeiras.", isCorrect: false },
      { id: "d", text: "Somente as afirmativas 3 e 4 são verdadeiras.", isCorrect: false },
      { id: "e", text: "As afirmativas 1, 2, 3 e 4 são verdadeiras.", isCorrect: true }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q2247478",
    text: "Segundo a Lei da Viscosidade de Newton, para um fluido bem ordenado, no qual as partículas movem-se retilineamente, em linhas paralelas, a tensão de cisalhamento em uma interface tangente à direção do escoamento é proporcional à razão de variação da velocidade na direção normal à interface. Acerca das propriedades dos fluidos newtonianos, julgue o item a seguir.\n\nTodos os gases e a maioria dos líquidos simples são fluidos ditos newtonianos.",
    discipline: "Engenharia Mecânica",
    topic: "Mecânica dos Fluidos",
    board: "CESPE/CEBRASPE",
    year: 2022,
    orgao: "Petrobras - BR",
    cargo: "Engenheiro",
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.TRUE_FALSE,
    alternatives: [
      { id: "c", text: "Certo", isCorrect: true },
      { id: "e", text: "Errado", isCorrect: false }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q2632330",
    text: "Em relação a uma variável aleatória Y que segue uma distribuição binomial com parâmetros n e p = 0,4, julgue os itens que se seguem.\n\nA partir de um valor n suficientemente grande, com base no teorema central do limite, é correto afirmar que a variável padronizada (Y - 0,4n) / sqrt(0,24n) segue, aproximadamente, a distribuição normal padrão.",
    discipline: "Estatística",
    topic: "Binomial",
    board: "CESPE/CEBRASPE",
    year: 2022,
    orgao: "MPC SC - SC",
    cargo: "Analista de Contas Públicas",
    difficulty: Difficulty.HARD,
    type: QuestionType.TRUE_FALSE,
    alternatives: [
      { id: "c", text: "Certo", isCorrect: false },
      { id: "e", text: "Errado", isCorrect: true }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q581991",
    text: "A probabilidade de uma empresa com um ano de criação inserir-se no mercado internacional é superior a 0,00001.",
    discipline: "Estatística",
    topic: "Probabilidade",
    board: "CESPE/CEBRASPE",
    year: 2012,
    orgao: "INPI - BR",
    cargo: "Analista",
    difficulty: Difficulty.HARD,
    type: QuestionType.TRUE_FALSE,
    alternatives: [
      { id: "c", text: "Certo", isCorrect: false },
      { id: "e", text: "Errado", isCorrect: true }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q2567442",
    text: "A avaliação do paciente, aliada ao conhecimento teórico, é fundamental para o estabelecimento de objetivos e condutas adequadas ao quadro do paciente. A ausculta pulmonar é uma importante ferramenta na avaliação do sistema respiratório. Sobre esse assunto, relacione as colunas a seguir e assinale a alternativa com a sequência correta.\n\n( ) Roncos.\n( ) Sibilos.\n( ) Estertores crepitantes.\n( ) Estertores subcrepitantes ou bolhosos.\n\n1. São ruídos finos, homogêneos, auscultados apenas na fase inspiratória e que indicam sofrimento alveolar.\n2. São ruídos contínuos, agudos, podendo ser localizados ou generalizados. Revelam aumento da resistência à passagem do ar.\n3. São ruídos mais grossos, que se assemelham ao rompimento de bolhas, auscultados no fim da inspiração e no começo da expiração.\n4. São a representação funcional do aumento da resistência das vias aéreas, especialmente brônquios de grosso calibre, por acúmulo de secreções.",
    discipline: "Fisioterapia",
    topic: "Fisioterapia Respiratória",
    board: "Instituto AOCP",
    year: 2021,
    orgao: "EBSERH - BR",
    cargo: "Residência Multiprofissional",
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.MULTIPLE_CHOICE,
    alternatives: [
      { id: "a", text: "1 – 2 – 3 – 4.", isCorrect: false },
      { id: "b", text: "3 – 1 – 2 – 4.", isCorrect: false },
      { id: "c", text: "2 – 3 – 1 – 4.", isCorrect: false },
      { id: "d", text: "4 – 2 – 1 – 3.", isCorrect: true },
      { id: "e", text: "3 – 2 – 4 – 1.", isCorrect: false }
    ],
    createdAt: Date.now()
  }
];
