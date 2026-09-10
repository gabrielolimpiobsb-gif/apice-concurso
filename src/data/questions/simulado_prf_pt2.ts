import { Question, Difficulty, QuestionType } from '../../types';
import { TEXTO_CB1A1, TEXTO_CG1A1_II } from './simulado_prf_texts';

export const simulado_prf_pt2: Question[] = [
  {
    id: "AC10017",
    text: TEXTO_CB1A1 + "\n\nAs aspas no trecho ‘supostamente revolucionários’ (segundo parágrafo) denotam a ironia com que a expressão foi empregada no texto.",
    discipline: "Língua Portuguesa",
    topic: "Pontuação e Ironia",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2025, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.TRUE_FALSE, alternatives: [ { id: "c", text: "Certo", isCorrect: true },
      { id: "e", text: "Errado", isCorrect: false }
    ]
  },
  {
    id: "AC10018",
    text: "Do ponto de vista atitudinal, o servidor público, no desempenho das suas atribuições,",
    discipline: "Ética",
    topic: "Código de Ética",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2018, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "deve respeitar a hierarquia, tomando cuidado ao representar contra determinados comprometimentos indevidos da estrutura em que se funda o poder estatal.", isCorrect: false },
      { id: "b", text: "poderá, usando a própria faculdade, exercer as prerrogativas funcionais que lhe sejam atribuídas, desde que sua atuação tenha foco no objetivo no bem comum.", isCorrect: false },
      { id: "c", text: "poderá exercer sua função com finalidade estranha ao interesse público, desde que sua atuação satisfaça interesse legítimo do destinatário da prestação de serviço.", isCorrect: false },
      { id: "d", text: "deve comunicar imediatamente a seus superiores todo e qualquer ato contrário ao interesse público e exigir as providências cabíveis.", isCorrect: true },
      { id: "e", text: "deve escolher sempre, quando estiver diante de duas opções, a melhor e a mais vantajosa para a administração pública.", isCorrect: false }
    ]
  },
  {
    id: "AC10019",
    text: "No âmbito da administração pública, um parecer administrativo e um embargo de uma obra por fiscal estadual são atos administrativos classificados, respectivamente, como atos",
    discipline: "Direito Administrativo",
    topic: "Atos Administrativos",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2022, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "enunciativo e de império.", isCorrect: true },
      { id: "b", text: "declaratório e de gestão.", isCorrect: false },
      { id: "c", text: "constitutivo e de gestão.", isCorrect: false },
      { id: "d", text: "declaratório e de império.", isCorrect: false },
      { id: "e", text: "constitutivo e de gestão.", isCorrect: false }
    ]
  },
  {
    id: "AC10020",
    text: TEXTO_CG1A1_II + "\n\nAcerca do emprego dos sinais de pontuação no texto CG1A1-II, julgue os itens a seguir.\nI No primeiro período, as aspas são usadas para assinalar que o autor se refere a um conceito particular, pessoal, de universo, sociedade e natureza.\nII O acréscimo de uma vírgula logo após “esta” (primeiro período) comprometeria a correção gramatical do texto.\nIII Estaria mantida a correção gramatical do último período caso fosse inserido um travessão imediatamente depois da forma verbal “foi” e outro imediatamente depois de “ser”.\nAssinale a opção correta.",
    discipline: "Língua Portuguesa",
    topic: "Pontuação",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2022, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "Nenhum item está certo", isCorrect: false },
      { id: "b", text: "Apenas os itens I e II estão certos.", isCorrect: false },
      { id: "c", text: "Apenas os itens I e III estão certos.", isCorrect: false },
      { id: "d", text: "Apenas os itens II e III estão certos.", isCorrect: true },
      { id: "e", text: "Todos os itens estão certos.", isCorrect: false }
    ]
  },
  {
    id: "AC10021",
    text: "Uma população de 100.000 indivíduos foi segmentada em faixas etárias conforme mostra a tabela a seguir. Um levantamento estatístico será efetuado por amostragem, sorteando-se aleatoriamente 30, 60 e 10 indivíduos que se encontram, respectivamente, nas faixas etárias I, II, III.\n\nFaixa I (idade ≤ 18 anos): 30.000\nFaixa II (18 anos < idade ≤ 40 anos): 60.000\nFaixa III (idade > 40 anos): 10.000\nTotal: 100.000\n\nNessa situação hipotética, o desenho amostral descrito caracteriza-se como uma amostragem aleatória",
    discipline: "Estatística",
    topic: "Amostragem",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2022, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "simples com reposição.", isCorrect: false },
      { id: "b", text: "estratificada.", isCorrect: true },
      { id: "c", text: "sistemática.", isCorrect: false },
      { id: "d", text: "por conglomerados.", isCorrect: false },
      { id: "e", text: "simples sem reposição.", isCorrect: false }
    ]
  },
  {
    id: "AC10022",
    text: "Em uma investigação, a quantidade de policiais trabalhando é inversamente proporcional ao tempo necessário para a sua conclusão. Se houvesse apenas três policiais desde o início da investigação, o tempo para a sua conclusão seria de 20 dias.\nA inclusão de um policial a mais no início da investigação permitiria que a conclusão do trabalho fosse antecipada em",
    discipline: "Matemática",
    topic: "Regra de Três Simples",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "FGV",
    year: 2025, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "um dia", isCorrect: false },
      { id: "b", text: "dois dias.", isCorrect: false },
      { id: "c", text: "três dias.", isCorrect: false },
      { id: "d", text: "quatro dias.", isCorrect: false },
      { id: "e", text: "cinco dias.", isCorrect: true }
    ]
  },
  {
    id: "AC10023",
    text: "O Brasil é um país de proporções continentais, portanto possui climas, vegetações e relevos distintos, sendo possível encontrar seis biomas diferentes como principais. Assinale a alternativa correta quanto ao bioma que engloba grande parte do território do Estado de Goiás.",
    discipline: "Geografia",
    topic: "Biomas",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "AOCP",
    year: 2022, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "Caatinga.", isCorrect: false },
      { id: "b", text: "Cerrado.", isCorrect: true },
      { id: "c", text: "Pampa.", isCorrect: false },
      { id: "d", text: "Mata Atlântica.", isCorrect: false },
      { id: "e", text: "Pantanal.", isCorrect: false }
    ]
  },
  {
    id: "AC10024",
    text: "Considerando as disposições do art. 5º da Constituição Federal de 1988, NÃO é correto o que se afirma em:",
    discipline: "Direito Constitucional",
    topic: "Direitos e Deveres Individuais",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "FUMARC",
    year: 2022, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "As associações só poderão ser compulsoriamente dissolvidas ou ter suas atividades suspensas por decisão judicial, exigindo-se, no primeiro caso, o trânsito em julgado.", isCorrect: false },
      { id: "b", text: "As entidades associativas, quando expressamente autorizadas, têm legitimidade para representar seus filiados judicial ou extrajudicialmente.", isCorrect: false },
      { id: "c", text: "É inviolável o sigilo da correspondência e das comunicações telegráficas, de dados e das comunicações telefônicas, salvo, no último caso, por ordem judicial, nas hipóteses e na forma que a lei estabelecer para fins de investigação criminal ou instrução processual civil ou penal.", isCorrect: true },
      { id: "d", text: "Todos podem reunir-se pacificamente, sem armas, em locais abertos ao público, independentemente de autorização, desde que não frustrem outra reunião anteriormente convocada para o mesmo local, sendo apenas exigido prévio aviso à autoridade competente.", isCorrect: false }
    ]
  },
  {
    id: "AC10025",
    text: "Assinale a alternativa em que a posição do pronome destacado está em conformidade com a norma-padrão de colocação pronominal.",
    discipline: "Língua Portuguesa",
    topic: "Colocação Pronominal",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "VUNESP",
    year: 2022, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "Atualmente, ainda considera-se um marco histórico o domínio de técnicas de agricultura.", isCorrect: false },
      { id: "b", text: "Se conhecendo a natureza de nossos ancestrais, será possível encontrar algumas respostas.", isCorrect: false },
      { id: "c", text: "Nossa forma de organização resume-se ao que já era visto entre nossos ancestrais coletores.", isCorrect: true },
      { id: "d", text: "A psicologia evolutiva tem dedicado-se a desvendar a origem de aspectos da nossa natureza.", isCorrect: false },
      { id: "e", text: "Jamais soube-se o período de tempo em que os humanos sobreviveram da caça e da coleta.", isCorrect: false }
    ]
  },
  {
    id: "AC10026",
    text: "Um tipo de ameaça à segurança da informação nas organizações é a invasão de seus sistemas por programas conhecidos como “vírus de computador”. Para diminuir a possibilidade desse tipo de ameaça aos sistemas de uma organização, uma medida de segurança indicada é:",
    discipline: "Informática",
    topic: "Segurança da Informação",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "Aroeira",
    year: 2014, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "exigir o uso de senhas individuais para acesso aos sistemas.", isCorrect: false },
      { id: "b", text: "instalar um sistema de firewall que bloqueie acessos indevidos aos sistemas.", isCorrect: true },
      { id: "c", text: "realizar auditorias que permitam saber o que foi modificado nos sistemas.", isCorrect: false },
      { id: "d", text: "restringir o uso dos sistemas à rede intranet.", isCorrect: false }
    ]
  },
  {
    id: "AC10027",
    text: "Com relação às obrigações éticas do servidor público, assinale a alternativa incorreta.",
    discipline: "Ética",
    topic: "Código de Ética",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "SEGPLAN",
    year: 2015, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "Os servidores públicos deverão tratar seus concidadãos com urbanidade, cordialidade e educação.", isCorrect: false },
      { id: "b", text: "Os servidores públicos deverão satisfazer suas obrigações perante os cidadãos de boa-fé.", isCorrect: false },
      { id: "c", text: "Os servidores públicos não podem incidir em conflitos de interesse que afetem o desempenho de sua função.", isCorrect: false },
      { id: "d", text: "Os mandamentos da ética e do direito não se confundem. A única diferença entre eles consiste na coercibilidade. Logo, os servidores públicos vinculam-se às leis, não podendo ser responsabilizados por condutas imorais que não lhes sejam expressamente vedadas.", isCorrect: true },
      { id: "e", text: "Os servidores públicos estão eticamente obrigados a guardar sigilo de informações obtidas por meio da função, não lhes sendo permitido utilizar dessas informações para seu próprio interesse.", isCorrect: false }
    ]
  },
  {
    id: "AC10028",
    text: "De acordo com a Constituição Federal de 1988, a soberania popular será exercida pelo sufrágio universal e pelo voto direto e secreto, com valor igual para todos, e, nos termos da lei, mediante, EXCETO:",
    discipline: "Direito Constitucional",
    topic: "Direitos Políticos",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "FUMARC",
    year: 2022, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "Ação popular.", isCorrect: true },
      { id: "b", text: "Iniciativa popular.", isCorrect: false },
      { id: "c", text: "Plebiscito.", isCorrect: false },
      { id: "d", text: "Referendo.", isCorrect: false }
    ]
  },
  {
    id: "AC10029",
    text: "No navegador Google Chrome 93.x ou superior, versão português, o atalho de teclado CORRETO que corresponde à opção “Adicionar esta guia aos favoritos...” é:",
    discipline: "Informática",
    topic: "Navegadores",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "FUMARC",
    year: 2021, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "Ctrl + D.", isCorrect: true },
      { id: "b", text: "Ctrl + F.", isCorrect: false },
      { id: "c", text: "Ctrl + H.", isCorrect: false },
      { id: "d", text: "Ctrl + J.", isCorrect: false }
    ]
  },
  {
    id: "AC10030",
    text: TEXTO_CB1A1 + "\n\nA locução “vêm ocorrendo” (primeiro parágrafo) apresenta sentido análogo ao da locução têm ocorrido.",
    discipline: "Língua Portuguesa",
    topic: "Semântica",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "CEBRASPE",
    year: 2025, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.TRUE_FALSE, alternatives: [ { id: "c", text: "Certo", isCorrect: true },
      { id: "e", text: "Errado", isCorrect: false }
    ]
  },
  {
    id: "AC10031",
    text: "Assinale a alternativa correta acerca de Estado, Governo e Administração Pública.",
    discipline: "Direito Administrativo",
    topic: "Estado, Governo e Administração",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "AOCP",
    year: 2019, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "Segundo a Constituição Federal, a tripartição de funções é absoluta no âmbito do aparelho do Estado.", isCorrect: false },
      { id: "b", text: "O estudo da administração pública, do ponto de vista subjetivo, abrange a maneira como o Estado participa das atividades econômicas privadas.", isCorrect: false },
      { id: "c", text: "O Estado constitui a nação politicamente organizada, enquanto a administração pública corresponde à atividade que estabelece objetivos do Estado, conduzindo politicamente os negócios públicos.", isCorrect: false },
      { id: "d", text: "Os conceitos de governo e administração não se equiparam; o primeiro refere-se a uma atividade essencialmente política, ao passo que o segundo, a uma atividade eminentemente técnica.", isCorrect: true },
      { id: "e", text: "Tradicionalmente, na Doutrina, os elementos apontados como constitutivos do Estado são: o povo, a uniformidade linguística e o governo.", isCorrect: false }
    ]
  },
  {
    id: "AC10032",
    text: "Assinale a alternativa correta a respeito dos direitos políticos.",
    discipline: "Direito Constitucional",
    topic: "Direitos Políticos",
    orgao: "Polícia Rodoviária Federal", cargo: "Agente de Polícia",
    board: "VUNESP",
    year: 2022, createdAt: Date.now(),
    difficulty: Difficulty.MEDIUM, type: QuestionType.MULTIPLE_CHOICE, alternatives: [
      { id: "a", text: "O alistamento eleitoral e o voto são obrigatórios para os maiores de dezoito anos e facultativos para os analfabetos, os maiores de sessenta anos e os maiores de dezesseis e menores de dezoito anos.", isCorrect: false },
      { id: "b", text: "São condições de elegibilidade, na forma da lei, entre outras, a idade mínima de trinta e cinco anos para Presidente e Vice-Presidente da República, Senador, Governador e Vice-Governador de Estado e do Distrito Federal.", isCorrect: false },
      { id: "c", text: "Para concorrerem a outros cargos, o Presidente da República, os Governadores de Estado e do Distrito Federal, os Prefeitos, os Deputados e Senadores devem renunciar aos respectivos mandatos até seis meses antes do pleito.", isCorrect: false },
      { id: "d", text: "São inelegíveis, no território de jurisdição do titular, o cônjuge e os parentes consanguíneos ou afins, até o terceiro grau ou por adoção, do Presidente da República, de Governador de Estado ou Território, do Distrito Federal, de Prefeito ou de quem os haja substituído dentro dos seis meses anteriores ao pleito, salvo se já titular de mandato eletivo e candidato à reeleição.", isCorrect: false },
      { id: "e", text: "O mandato eletivo poderá ser impugnado ante a Justiça Eleitoral no prazo de quinze dias contados da diplomação, instruída a ação com provas de abuso do poder econômico, corrupção ou fraude, sendo que a ação de impugnação de mandato tramitará em segredo de justiça, respondendo o autor, na forma da lei, se temerária ou de manifesta má-fé.", isCorrect: true }
    ]
  }
];
