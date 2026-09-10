import { Question, Difficulty, QuestionType } from '../../types';
import { TEXTO_CB1A1, TEXTO_TEXAS, TEXTO_MANEIRA, TEXTO_CG2A1, TEXTO_RACISMO } from './simulado_prf_texts';

export const simulado_prf_pt1: Question[] = [
  {
    id: "AC10001",
    text: "Em um computador com Microsoft Windows 10, em sua configuração padrão, um usuário vê o seguinte conteúdo dentro da pasta C:\\TEMP a partir do Explorador de Arquivos, onde uma configuração foi feita na pasta 2023. Ao abrir a janela de linha de comando e digitar DIR na mesma pasta C:\\TEMP, a pasta 2023, apesar de existir, não é exibida. Isso significa que a pasta 2023 está",
    discipline: "Informática",
    topic: "Windows 10",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "VUNESP",
    year: 2023, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "protegida como somente leitura.", isCorrect: false },
      { id: "b", text: "criptografada.", isCorrect: false },
      { id: "c", text: "compactada.", isCorrect: false },
      { id: "d", text: "na lixeira do Windows.", isCorrect: false },
      { id: "e", text: "oculta.", isCorrect: true }
    ]
  },
  {
    id: "AC10002",
    text: TEXTO_RACISMO + "\n\nLeia a charge a seguir e as assertivas a respeito de sua relação com o texto:\nI. Tanto a charge quanto o texto abordam a questão do racismo no futebol.\nSENDO QUE\nII. A charge ilustra uma situação de reação e combate ao racismo dentro do estádio.\nAssinale a alternativa que apresenta a correta relação entre as assertivas anteriores.",
    discipline: "Língua Portuguesa",
    topic: "Interpretação de Texto",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "FUNDATEC",
    year: 2024, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "As assertivas I e II são verdadeiras, e a II é um complemento correto da I.", isCorrect: true },
      { id: "b", text: "As assertivas I e II são verdadeiras, mas a II não é um complemento correto da I.", isCorrect: false },
      { id: "c", text: "A assertiva I é verdadeira, mas a II é falsa.", isCorrect: false },
      { id: "d", text: "A assertiva I é falsa, mas a II é verdadeira.", isCorrect: false },
      { id: "e", text: "As assertivas I e II são falsas.", isCorrect: false }
    ]
  },
  {
    id: "AC10003",
    text: "Assinale a opção que indica o texto classificado como descritivo.",
    discipline: "Língua Portuguesa",
    topic: "Tipologia Textual",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "FGV",
    year: 2025, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "Seja feliz!", isCorrect: false },
      { id: "b", text: "A riqueza é a felicidade na Terra.", isCorrect: true },
      { id: "c", text: "Trabalhe sempre e muito e ficará rico.", isCorrect: false },
      { id: "d", text: "Nunca deixe para hoje o que pode fazer amanhã.", isCorrect: false },
      { id: "e", text: "Trabalhei muito, economizei bastante, fiquei rico.", isCorrect: false }
    ]
  },
  {
    id: "AC10004",
    text: TEXTO_MANEIRA + "\n\nPara responder a esta questão, observe os trechos destacados nas passagens:\n- Seria complicar tanto a vida dos outros, e a sua própria, que o menino se decidiu a acatar a ordem ingrata.\n- E como havia de ser, se não passasse?\n- Fecharia os olhos, pois esse é o testemunho de sono que as mães procuram no rosto dos filhos.\n\nA relação de sentido estabelecida pelos trechos destacados com os contextos que os precedem é, respectivamente, de:",
    discipline: "Língua Portuguesa",
    topic: "Orações",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "VUNESP",
    year: 2022, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "consequência, condição e explicação.", isCorrect: true },
      { id: "b", text: "explicação, condição e causa.", isCorrect: false },
      { id: "c", text: "consequência, conclusão e causa.", isCorrect: false },
      { id: "d", text: "concessão, conclusão e explicação.", isCorrect: false },
      { id: "e", text: "explicação, contraste e causa.", isCorrect: false }
    ]
  },
  {
    id: "AC10005",
    text: TEXTO_CB1A1 + "\n\nAs diferenças entre os programas de IA e a mente humana mencionadas no quarto parágrafo — ‘esses programas (...) diferem profundamente do modo como os seres humanos raciocinam e utilizam a linguagem’ — são explicitadas nos parágrafos seguintes do texto.",
    discipline: "Língua Portuguesa",
    topic: "Interpretação de Texto",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2025, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.TRUE_FALSE, alternatives: [ { id: "c", text: "Certo", isCorrect: true },
      { id: "e", text: "Errado", isCorrect: false }
    ]
  },
  {
    id: "AC10006",
    text: TEXTO_TEXAS + "\n\nChanges in energy production in Texas are having an impact across the United States.",
    discipline: "Língua Inglesa",
    topic: "Compreensão de Texto",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2021, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.TRUE_FALSE, alternatives: [ { id: "c", text: "Certo", isCorrect: true },
      { id: "e", text: "Errado", isCorrect: false }
    ]
  },
  {
    id: "AC10007",
    text: TEXTO_CB1A1 + "\n\nAo afirmarem que “imensas quantidades de informação (...) não necessariamente são verídicas” (primeiro período do quarto parágrafo), os intelectuais mencionados no texto sugerem que as ferramentas de IA podem se tornar grandes propagadores de fake news em um futuro próximo.",
    discipline: "Língua Portuguesa",
    topic: "Interpretação de Texto",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2025, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.TRUE_FALSE, alternatives: [ { id: "c", text: "Certo", isCorrect: false },
      { id: "e", text: "Errado", isCorrect: true }
    ]
  },
  {
    id: "AC10008",
    text: "Ao digitar a mensagem a seguir na rede social Whatsapp, assinale a alternativa que indica como o texto ficará formatado para o destinatário.\n\n*Atenção*: _não_ haverá prorrogação de data.",
    discipline: "Informática",
    topic: "Internet e Redes Sociais",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "VUNESP",
    year: 2023, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "*Atenção*: _não_ haverá prorrogação de data.", isCorrect: false },
      { id: "b", text: "Atenção: não haverá prorrogação de data.", isCorrect: false },
      { id: "c", text: "Atenção: não haverá prorrogação de data.", isCorrect: false },
      { id: "d", text: "Atenção: não haverá prorrogação de data.", isCorrect: false },
      { id: "e", text: "Atenção: não haverá prorrogação de data. (Negrito e Itálico)", isCorrect: true }
    ]
  },
  {
    id: "AC10009",
    text: TEXTO_TEXAS + "\n\nIn “Natural gas and coal-fired power plants need water to stay online. Yet those water facilities froze in the cold temperatures and others lost access to the electricity they require to operate”, it is possible to substitute “Yet” for Even so without changing the meaning of the sentence.",
    discipline: "Língua Inglesa",
    topic: "Gramática e Vocabulário",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2021, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.TRUE_FALSE, alternatives: [ { id: "c", text: "Certo", isCorrect: true },
      { id: "e", text: "Errado", isCorrect: false }
    ]
  },
  {
    id: "AC10010",
    text: "Procurando reduzir a extensão dos textos, em todas as frases abaixo as orações substantivas sublinhadas foram substituídas por substantivos. Assinale a opção em que isso foi feito de forma adequada.",
    discipline: "Língua Portuguesa",
    topic: "Substituição de Expressões",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "FGV",
    year: 2025, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "Quem não escuta é feliz. / o surdo-mudo.", isCorrect: false },
      { id: "b", text: "Quem vive sozinho não conversa. / o solitário.", isCorrect: true },
      { id: "c", text: "Quem não se casou perde tempo na vida. / o viúvo.", isCorrect: false },
      { id: "d", text: "Quem vive pedindo na rua se vicia. / o desempregado.", isCorrect: false },
      { id: "e", text: "Quem vive de herança pode descansar. / o preguiçoso.", isCorrect: false }
    ]
  },
  {
    id: "AC10011",
    text: "Durante uma blitz de trânsito, o condutor João se recusou a realizar o teste do etilômetro (bafômetro) e se negou a entregar sua carteira nacional de habilitação aos policiais.\n\nNessa situação hipotética, João cometeu",
    discipline: "Legislação de Trânsito",
    topic: "Infrações e Crimes",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2024, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "crime de desacato.", isCorrect: false },
      { id: "b", text: "crime de embriaguez ao volante.", isCorrect: false },
      { id: "c", text: "contravenção penal de perturbação do trabalho alheio.", isCorrect: false },
      { id: "d", text: "infração administrativa classificada como gravíssima.", isCorrect: true },
      { id: "e", text: "crime de dirigir veículo sem habilitação.", isCorrect: false }
    ]
  },
  {
    id: "AC10012",
    text: TEXTO_CG2A1 + "\n\nCada uma das próximas opções contém uma proposta de reescrita para o seguinte trecho do último parágrafo do texto CG2A1-I: “A criação de um direito justo, com efetivo poder transformador da sociedade, entretanto, não é obra apenas do legislador”. Assinale a opção em que a proposta apresentada mantém a correção gramatical e a coerência das ideias do texto.",
    discipline: "Língua Portuguesa",
    topic: "Reescrita de Frases",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2022, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "A criação de um direito justo — com efetivo poder transformador da sociedade —, entretanto, não é obra apenas do legislador", isCorrect: true },
      { id: "b", text: "De outro lado, a criação de um direito justo com efetivo poder transformador da sociedade, não é obra apenas do legislador", isCorrect: false },
      { id: "c", text: "A criação de um direito, justo com efetivo poder transformador da sociedade, entretanto não é obra apenas do legislador", isCorrect: false },
      { id: "d", text: "Nesse meio tempo, a criação de um direito justo (com efetivo poder transformador da sociedade) apenas, não é obra do legislador", isCorrect: false },
      { id: "e", text: "A criação de um direito justo, contudo com efetivo poder transformador da sociedade não é obra apenas, do legislador", isCorrect: false }
    ]
  },
  {
    id: "AC10013",
    text: "Assinale a alternativa correta quanto à concordância, à regência e ao uso (presença ou ausência) do “acento” indicativo de crase.",
    discipline: "Língua Portuguesa",
    topic: "Crase e Regência",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "FAPEC",
    year: 2021, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "O Perito juntou uma petição requisitando todos os documentos que entendeu necessário ao Juiz, que procedeu as devidas intimações.", isCorrect: false },
      { id: "b", text: "O Perito juntou uma petição requisitando todos os documentos que entendeu necessários ao Juiz, que procedeu as devidas intimações.", isCorrect: false },
      { id: "c", text: "Visando à excelência na elaboração de um laudo, é necessário seguir rigorosamente alguns passos e reunir argumentos bastantes para corroborar os fatos narrados e os elementos descritos.", isCorrect: true },
      { id: "d", text: "A computação forense ainda é um ramo pouco conhecido, de modo que existe poucos profissionais habilitado e muito trabalho a fazer. Além disso, existe vários fatores que se implica na coleta ou análise das evidências.", isCorrect: false },
      { id: "e", text: "A Perícia Forense Computacional é definida como ciência multidisciplinar, à qual aplica técnicas investigativas para determinar e analisar evidências; diferentemente dos outros tipos de perícias forense conhecidos, a análise forense computacional implica em resultados direto, e não interpretativo.", isCorrect: false }
    ]
  },
  {
    id: "AC10014",
    text: TEXTO_CB1A1 + "\n\nNo primeiro parágrafo, a correção gramatical do texto seria mantida caso se empregasse ponto no lugar da vírgula logo após “2023”, com a devida alteração da inicial minúscula para maiúscula na palavra “compartilhando”.",
    discipline: "Língua Portuguesa",
    topic: "Pontuação",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2025, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.TRUE_FALSE, alternatives: [ { id: "c", text: "Certo", isCorrect: false },
      { id: "e", text: "Errado", isCorrect: true }
    ]
  },
  {
    id: "AC10015",
    text: TEXTO_CB1A1 + "\n\nA correção e a coerência do texto seriam mantidas caso a forma verbal “compartilhando” (primeiro parágrafo) fosse substituída por a fim de compartilharem.",
    discipline: "Língua Portuguesa",
    topic: "Reescrita",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2025, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.TRUE_FALSE, alternatives: [ { id: "c", text: "Certo", isCorrect: true },
      { id: "e", text: "Errado", isCorrect: false }
    ]
  },
  {
    id: "AC10016",
    text: "NÃO há oração subordinada adjetiva em:",
    discipline: "Língua Portuguesa",
    topic: "Sintaxe",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "FUMARC",
    year: 2021, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "A Unidade de Saúde onde atendo foi assaltada na tarde de ontem.", isCorrect: false },
      { id: "b", text: "Alcançará o sucesso, ainda que todos duvidem de sua capacidade de trabalho.", isCorrect: true },
      { id: "c", text: "As lojas em que procuramos os presentes de Natal tinham preços altíssimos.", isCorrect: false },
      { id: "d", text: "Os alunos, que têm dificuldade em matemática, terão aulas à noite.", isCorrect: false }
    ]
  }
];
