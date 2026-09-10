import { Question, Difficulty, QuestionType } from '../../types';

export const simulado_prf_pt6: Question[] = [
  {
    id: "AC10081",
    text: "O condutor, saindo de uma garagem; deverá:",
    discipline: "Legislação de Trânsito",
    topic: "Normas de Circulação",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "INAZ",
    year: 2016, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "Buzinar sem parar e usar farol alto.", isCorrect: false },
      { id: "b", text: "Parar antes da calçada e seguir após certificar-se de que não há pedestres.", isCorrect: true },
      { id: "c", text: "Piscar os faróis, buzinar e atravessar a calçada.", isCorrect: false },
      { id: "d", text: "Parar e buzinar para apressar o pedestre.", isCorrect: false },
      { id: "e", text: "Sair rápido para não atrapalhar a passagem dos pedestres.", isCorrect: false }
    ]
  },
  {
    id: "AC10082",
    text: "Se um policial rodoviário federal autuar, por infração de trânsito, um condutor de veículo em circulação no Brasil, mas licenciado no exterior, o infrator deverá pagar a multa no país de origem do licenciamento do automóvel, na forma estabelecida pelo CONTRAN.",
    discipline: "Legislação de Trânsito",
    topic: "Penalidades",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2019, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.TRUE_FALSE, alternatives: [ { id: "c", text: "Certo", isCorrect: false },
      { id: "e", text: "Errado", isCorrect: true }
    ]
  },
  {
    id: "AC10083",
    text: "Se um policial rodoviário federal, com o objetivo de obter confissão de uma pessoa que tenha sido flagrada cometendo infração, praticar intencionalmente algum ato para causar sofrimento mental a essa pessoa, essa conduta poderá ser caracterizada como tortura.",
    discipline: "Direito Penal",
    topic: "Crimes de Tortura",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2020, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.TRUE_FALSE, alternatives: [ { id: "c", text: "Certo", isCorrect: true },
      { id: "e", text: "Errado", isCorrect: false }
    ]
  },
  {
    id: "AC10084",
    text: "No que diz respeito à busca e apreensão, assinale a alternativa incorreta.",
    discipline: "Direito Processual Penal",
    topic: "Busca e Apreensão",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "IBFC",
    year: 2022, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "Em casa habitada, a busca será feita de modo que não moleste os moradores mais do que o indispensável para o êxito da diligência.", isCorrect: false },
      { id: "b", text: "As buscas domiciliares serão executadas de dia ou de noite, independentemente do consentimento do morador...", isCorrect: true },
      { id: "c", text: "Não será permitida a apreensão de documento em poder do defensor do acusado, salvo quando constituir elemento do corpo de delito.", isCorrect: false },
      { id: "d", text: "Não sendo encontrada a pessoa ou coisa procurada, os motivos da diligência serão comunicados a quem tiver sofrido a busca, se o requerer.", isCorrect: false },
      { id: "e", text: "O mandado de busca deverá mencionar o motivo e os fins da diligência.", isCorrect: false }
    ]
  },
  {
    id: "AC10085",
    text: "A tabela indica o número de ocorrências diárias, durante uma semana, numa delegacia. (Domingo 12, Seg 28, Ter 18, Qua 12, Qui 18, Sex 18, Sab 20). De acordo com os dados da tabela acima, é",
    discipline: "Estatística",
    topic: "Média, Mediana e Moda",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "IBFC",
    year: 2022, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "a moda de ocorrências é igual a 12.", isCorrect: false },
      { id: "b", text: "a média de ocorrências é igual a 20.", isCorrect: false },
      { id: "c", text: "a moda de ocorrências é diferente da Média de ocorrências.", isCorrect: false },
      { id: "d", text: "a mediana de ocorrências é igual a 12.", isCorrect: false },
      { id: "e", text: "a diferença entre a mediana de ocorrências e a média de ocorrências é igual a zero.", isCorrect: true }
    ]
  },
  {
    id: "AC10086",
    text: "O espaço percorrido por um móvel, em velocidade constante, é dado pela equação s = 6 + 3t, onde s é o espaço percorrido em centímetros e t o tempo em segundos. Para um tempo de 2 minutos qual seria o espaço percorrido pelo móvel?",
    discipline: "Física",
    topic: "Cinemática",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "COMVEST",
    year: 2003, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "2,6 metros", isCorrect: false },
      { id: "b", text: "12 metros", isCorrect: false },
      { id: "c", text: "9 metros", isCorrect: false },
      { id: "d", text: "4 metros", isCorrect: false },
      { id: "e", text: "3,66 metros", isCorrect: true }
    ]
  },
  {
    id: "AC10087",
    text: "As receitas oriundas das multas aplicadas pela PRF serão repassadas ao DNIT, órgão executivo rodoviário com circunscrição sobre as rodovias federais.",
    discipline: "Legislação de Trânsito",
    topic: "Sistema Nacional de Trânsito",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2019, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.TRUE_FALSE, alternatives: [ { id: "c", text: "Certo", isCorrect: false },
      { id: "e", text: "Errado", isCorrect: true }
    ]
  },
  {
    id: "AC10088",
    text: "Um corpo vai de um ponto A até B, percorrendo meio arco de circunferência. A distância total percorrida na trajetória é de 6,28 m, o tempo gasto no percurso é de 2,0 s. O módulo da velocidade média do corpo é:",
    discipline: "Física",
    topic: "Cinemática",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "ACADEPOL",
    year: 2003, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "1,0 m/s;", isCorrect: false },
      { id: "b", text: "2,0 m/s;", isCorrect: true },
      { id: "c", text: "3,0 m/s;", isCorrect: false },
      { id: "d", text: "3,1 m/s;", isCorrect: false },
      { id: "e", text: "3,5 m/s;", isCorrect: false }
    ]
  },
  {
    id: "AC10089",
    text: "A moralidade, no serviço público, está relacionada à obediência incondicional do servidor aos superiores hierárquicos.",
    discipline: "Ética",
    topic: "Princípios",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2008, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.TRUE_FALSE, alternatives: [ { id: "c", text: "Certo", isCorrect: false },
      { id: "e", text: "Errado", isCorrect: true }
    ]
  },
  {
    id: "AC10090",
    text: "Promover programas de construção de moradias e a melhoria das condições habitacionais e de saneamento básico é de competência",
    discipline: "Direito Constitucional",
    topic: "Repartição de Competências",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "VUNESP",
    year: 2015, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "da União, devendo os Estados e Municípios atuarem para fins de suplementação.", isCorrect: false },
      { id: "b", text: "dos Estados e do Distrito Federal, devendo os Municípios atuarem.", isCorrect: false },
      { id: "c", text: "exclusiva dos Estados e do Distrito Federal.", isCorrect: false },
      { id: "d", text: "comum da União, dos Estados, do Distrito Federal e dos Municípios.", isCorrect: true },
      { id: "e", text: "exclusiva da União.", isCorrect: false }
    ]
  },
  {
    id: "AC10091",
    text: "De acordo com o conceito analítico de crime, é um dos elementos do fato típico:",
    discipline: "Direito Penal",
    topic: "Teoria do Crime",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "FUNCAB",
    year: 2014, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "imputabilidade.", isCorrect: false },
      { id: "b", text: "conduta.", isCorrect: true },
      { id: "c", text: "exigibilidade de conduta diversa.", isCorrect: false },
      { id: "d", text: "exercício regular de um direito.", isCorrect: false },
      { id: "e", text: "potencial consciência da ilicitude.", isCorrect: false }
    ]
  },
  {
    id: "AC10092",
    text: "Considerando o que dispõe a Declaração Universal dos Direitos Humanos (1948), assinale a alternativa correta.",
    discipline: "Direitos Humanos",
    topic: "DUDH",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "UFU",
    year: 2025, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "A instrução fundamental e média é obrigatória e gratuita, de responsabilidade da família e do Estado.", isCorrect: false },
      { id: "b", text: "Os pais têm prioridade de direito na escolha do gênero de instrução que será ministrada a seus filhos.", isCorrect: true },
      { id: "c", text: "A instrução no grau elementar deve ser compulsória, laica, gratuita e mantida pelo poder público.", isCorrect: false },
      { id: "d", text: "A instrução técnico-profissional se destina a aqueles que possuem determinadas habilidades específicas.", isCorrect: false }
    ]
  },
  {
    id: "AC10093",
    text: "No que concerne à busca e apreensão, assinale a opção correta, levando em consideração as disposições do Código de Processo Penal e a jurisprudência do STJ.",
    discipline: "Direito Processual Penal",
    topic: "Busca e Apreensão",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2022, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "A realização de busca e apreensão pessoal ou domiciliar exige prévia expedição de mandado.", isCorrect: false },
      { id: "b", text: "É ilegítima a apreensão de documentos sigilosos no cumprimento do mandado se dele não constar autorização específica.", isCorrect: false },
      { id: "c", text: "A busca e apreensão pessoal em mulheres deve ser realizada por pessoa do sexo feminino, salvo risco de retardamento ou prejuízo.", isCorrect: true },
      { id: "d", text: "Há nulidade na busca e apreensão realizada sem autorização judicial em imóvel sem qualquer sinal de habitação, ainda que haja fundadas suspeitas de crime permanente.", isCorrect: false },
      { id: "e", text: "É vedado o cumprimento de mandado de busca e apreensão domiciliar no período da noite, mesmo com o consentimento do morador.", isCorrect: false }
    ]
  },
  {
    id: "AC10094",
    text: "Joaquim ingeriu bebida alcoólica antes de dirigir e entregou a condução do seu automóvel a sua noiva, Maria. O veículo foi parado em uma blitz da Polícia Militar, quando se constatou que o direito de Maria dirigir havia sido suspenso.\nI A conduta de Joaquim caracteriza crime de trânsito.\nII A caracterização da conduta de Joaquim como crime previsto no CTB depende da ocorrência de lesão ou de perigo de dano concreto.\nIII É cabível a aplicação da pena de multa à conduta de Joaquim.",
    discipline: "Legislação de Trânsito",
    topic: "Crimes de Trânsito",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2023, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "Apenas o item II está certo.", isCorrect: false },
      { id: "b", text: "Apenas o item III está certo.", isCorrect: true },
      { id: "c", text: "Apenas os itens I e II estão certos.", isCorrect: false },
      { id: "d", text: "Apenas os itens I e III estão certos.", isCorrect: false },
      { id: "e", text: "Todos os itens estão certos.", isCorrect: false }
    ]
  },
  {
    id: "AC10095",
    text: "Considerando os valores e direitos consagrados pela Declaração Universal dos Direitos Humanos, é correto afirmar que todo ser humano:",
    discipline: "Direitos Humanos",
    topic: "DUDH",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "Instituto Acesso",
    year: 2024, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "Será sujeito à interferência na sua vida privada...", isCorrect: false },
      { id: "b", text: "Será obrigado a fazer parte de uma associação e será arbitrariamente privado de sua nacionalidade.", isCorrect: false },
      { id: "c", text: "Tem direito à liberdade de opinião e expressão; esse direito inclui a liberdade de ter opiniões e transmitir informações.", isCorrect: true },
      { id: "d", text: "Tem direito à instrução... a fim de promover a intolerância.", isCorrect: false },
      { id: "e", text: "Estará sujeito apenas às limitações determinadas pela lei... exclusivamente com o fim de impedir o devido reconhecimento...", isCorrect: false }
    ]
  },
  {
    id: "AC10096",
    text: "Acerca do padrão ofício, julgue os itens a seguir, de acordo com o Manual de Redação da Presidência da República.\nI O cabeçalho é utilizado apenas na primeira página do documento.\nII Nos casos em que não seja usado para encaminhamento de documentos, o expediente deve conter introdução, desenvolvimento e conclusão.\nIII Os dados do órgão emissor podem ser informados no rodapé do documento.",
    discipline: "Redação Oficial",
    topic: "Manual da Presidência da República",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2024, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "Apenas o item I está certo.", isCorrect: false },
      { id: "b", text: "Apenas o item II está certo.", isCorrect: false },
      { id: "c", text: "Apenas os itens I e III estão certos.", isCorrect: false },
      { id: "d", text: "Apenas os itens II e III estão certos.", isCorrect: false },
      { id: "e", text: "Todos os itens estão certos.", isCorrect: true }
    ]
  }
];
