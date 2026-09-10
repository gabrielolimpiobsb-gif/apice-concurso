import { Question, QuestionType, Difficulty } from '../../types';

export const simuladoGranCursosPt2: Question[] = [
  {
    id: "Q3824613",
    text: "Uma instituição governamental precisa garantir a integridade, autenticidade e confidencialidade de documentos digitais que circulam entre seus departamentos. Para isso, foi decidido o uso de um sistema baseado em criptografia assimétrica e assinatura digital, utilizando algoritmos como RSA e SHA-256.\n\nDurante a implementação, um dos desafios foi garantir que os documentos não sejam alterados sem detecção e que a identidade do remetente possa ser verificada de forma inequívoca. Além disso, a equipe de segurança precisou escolher entre os principais algoritmos de chave pública para equilibrar desempenho e nível de proteção.\n\nDado esse contexto, assinale a alternativa que apresenta corretamente o funcionamento da assinatura digital e sua relação com criptografia assimétrica.",
    discipline: "Tecnologia da Informação",
    topic: "Assinatura Digital",
    board: "IDECAN",
    year: 2025,
    orgao: "UFSB - BA",
    cargo: "Analista",
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.MULTIPLE_CHOICE,
    alternatives: [
      { id: "a", text: "O principal objetivo da assinatura digital é garantir a confidencialidade, pois ela impede que terceiros leiam o conteúdo do documento sem a chave privada correta.", isCorrect: false },
      { id: "b", text: "A assinatura digital garante a confidencialidade dos documentos, pois utiliza apenas criptografia assimétrica para cifrar o conteúdo, garantindo que somente o destinatário possa acessá-lo.", isCorrect: false },
      { id: "c", text: "No processo de assinatura digital, o remetente gera um hash do documento e cifra esse hash com sua chave privada. O destinatário, ao receber o documento, usa a chave pública do remetente para decifrar o hash e compará-lo com um novo hash gerado localmente, verificando assim a autenticidade e a integridade do documento.", isCorrect: true },
      { id: "d", text: "Assinaturas digitais utilizam apenas criptografia simétrica, pois os algoritmos assimétricos são ineficientes para esse tipo de operação.", isCorrect: false },
      { id: "e", text: "No modelo de assinatura digital, a chave privada é compartilhada entre os usuários para garantir que apenas destinatários autorizados possam validar a assinatura.", isCorrect: false }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q4253237",
    text: "Atualmente, a maioria das redes de computadores cabeadas padrão Ethernet têm sido implementadas empregando um tipo de cabo de par trançado não blindado e um padrão de conector, usando uma topologia física na qual os computadores são ligados a um dispositivo central, encarregado do gerenciamento das informações.\n\nÉ a topologia mais comum, que emprega um concentrador como elemento central, que se encarrega de retransmitir todos os dados para todas as estações, mas com a vantagem de tornar mais fácil a localização dos problemas, considerando que se um dos cabos ligado a uma das portas do concentrador ou uma das placas de rede estiver com problemas, apenas o nó ligado ao componente defeituoso ficará fora da rede.\n\nA referência para o cabo, a denominação para a topologia descrita, a sigla e a figura que identificam o conector são, respectivamente:",
    discipline: "Tecnologia da Informação",
    topic: "Cabo UTP (Unshielded Twisted Pair)",
    board: "IDCAP",
    year: 2025,
    orgao: "Pre Sal Petroleo S A",
    cargo: "Analista de Tecnologia da Informação",
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.MULTIPLE_CHOICE,
    alternatives: [
      { id: "a", text: "UTP, anel, PS2 e conector", isCorrect: false },
      { id: "b", text: "STP, malha, RJ45 e conector", isCorrect: false },
      { id: "c", text: "UTP, estrela, RJ45 e conector", isCorrect: true },
      { id: "d", text: "STP, hierárquica, PS2 e conector", isCorrect: false }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q3926397",
    text: "A arquitetura de software trata da forma como os componentes de software são construídos e organizados no sistema. Considerando essa informação, julgue os itens seguintes.\n\nA arquitetura de microsserviços organiza o sistema como um conjunto de serviços independentes, com responsabilidades bem definidas.",
    discipline: "Tecnologia da Informação",
    topic: "Arquitetura de Microsserviços",
    board: "Instituto Quadrix",
    year: 2025,
    orgao: "CREMESE - SE",
    cargo: "Analista de Sistemas",
    difficulty: Difficulty.EASY,
    type: QuestionType.TRUE_FALSE,
    alternatives: [
      { id: "c", text: "Certo", isCorrect: true },
      { id: "e", text: "Errado", isCorrect: false }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q3624472",
    text: "O conjunto de técnicas e conceitos que permite aos programadores desenvolverem programas de formas estruturadas, decompondo problemas complexos em etapas mais simples, é conhecido como:",
    discipline: "Tecnologia da Informação",
    topic: "Lógica de programação",
    board: "MS Concursos",
    year: 2024,
    orgao: "SAAE Sao Carlos - SP",
    cargo: "Analista de Sistemas",
    difficulty: Difficulty.EASY,
    type: QuestionType.MULTIPLE_CHOICE,
    alternatives: [
      { id: "a", text: "Compilador.", isCorrect: false },
      { id: "b", text: "Lógica de Programação.", isCorrect: true },
      { id: "c", text: "Sistema Operacional.", isCorrect: false },
      { id: "d", text: "Banco de Dados.", isCorrect: false }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q2088968",
    text: "Para que a gestão de riscos seja realizada com sucesso, é necessário seguir a norma ISO 31000 – Gestão de riscos – Princípios e Diretrizes. Entre as fases descritas no documento, destaca-se aquela na qual é decidido se o risco será reduzido, evitado ou compartilhado com terceiros. Essa fase é denominada",
    discipline: "Tecnologia da Informação",
    topic: "Gestão de Riscos",
    board: "CESPE/CEBRASPE",
    year: 2021,
    orgao: "TJ RJ",
    cargo: "Analista Judiciário",
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.MULTIPLE_CHOICE,
    alternatives: [
      { id: "a", text: "estabelecimento do contexto.", isCorrect: false },
      { id: "b", text: "identificação de riscos.", isCorrect: false },
      { id: "c", text: "tratamento de riscos.", isCorrect: true },
      { id: "d", text: "análise de riscos.", isCorrect: false },
      { id: "e", text: "avaliação de riscos.", isCorrect: false }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q1741865",
    text: "As Diretrizes de Acessibilidade para o Conteúdo da Web (WCAG – Web Content Accessibility Guidelines) recomendam que",
    discipline: "Tecnologia da Informação",
    topic: "W3C, WCAG e WAI",
    board: "CESPE/CEBRASPE",
    year: 2021,
    orgao: "APEX Brasil",
    cargo: "Analista",
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.MULTIPLE_CHOICE,
    alternatives: [
      { id: "a", text: "as informações e os componentes da interface do usuário sejam, preferencialmente, não textuais, tais como áudio e vídeo.", isCorrect: false },
      { id: "b", text: "as alterações de contexto sejam iniciadas de forma automática pelos componentes da página web.", isCorrect: false },
      { id: "c", text: "os componentes de interface de usuário permitam que toda funcionalidade fique disponível a partir de um teclado.", isCorrect: true },
      { id: "d", text: "o CAPTCHA seja utilizado para confirmar que o conteúdo é acessado por uma pessoa, e não por um computador.", isCorrect: false }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q1583959",
    text: "Um analista de sistemas do MJSP implementou o seguinte código em MATLAB:\n\ns=0;\nz=[1,3,5,6]\nfor v=z s=s+v;\nend\n\nO resultado desse código implementado é apresentado corretamente em qual das seguintes alternativas?",
    discipline: "Tecnologia da Informação",
    topic: "Algoritmos e estrutura de dados",
    board: "Instituto AOCP",
    year: 2020,
    orgao: "Ministério da Justiça e Segurança Pública MJ",
    cargo: "Analista de Governança de Dados",
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.MULTIPLE_CHOICE,
    alternatives: [
      { id: "a", text: "0", isCorrect: false },
      { id: "b", text: "1", isCorrect: false },
      { id: "c", text: "8", isCorrect: false },
      { id: "d", text: "14", isCorrect: false },
      { id: "e", text: "15", isCorrect: true }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q813983",
    text: "Julgue os seguintes itens, relativos à segurança de aplicativos web. Limitar o tempo de vida dos cookies de uma sessão e implementar mecanismos de desafio-resposta, como o captcha, são contramedidas para ataques de CSRF (cross-site request forgery).",
    discipline: "Tecnologia da Informação",
    topic: "Controle de Acesso",
    board: "CESPE/CEBRASPE",
    year: 2016,
    orgao: "TCE PA",
    cargo: "Auditor de Controle Externo",
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.TRUE_FALSE,
    alternatives: [
      { id: "c", text: "Certo", isCorrect: true },
      { id: "e", text: "Errado", isCorrect: false }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q1929619",
    text: "No sistema operacional Linux, os aplicativos são instalados no diretório padrão",
    discipline: "Tecnologia da Informação",
    topic: "Linux",
    board: "VUNESP",
    year: 2009,
    orgao: "CESP - SP",
    cargo: "Auditor",
    difficulty: Difficulty.EASY,
    type: QuestionType.MULTIPLE_CHOICE,
    alternatives: [
      { id: "a", text: "/etc.", isCorrect: false },
      { id: "b", text: "/home.", isCorrect: false },
      { id: "c", text: "/lib.", isCorrect: false },
      { id: "d", text: "/sbin.", isCorrect: false },
      { id: "e", text: "/usr.", isCorrect: true }
    ],
    createdAt: Date.now()
  },
  {
    id: "Q900833",
    text: "O formalismo de redes de petri, embora não seja suportado diretamente por meio da linguagem UML, possui semântica mais aderente aos diagramas do tipo E (Máquina de Estados) que aos diagramas do tipo D (Comunicação).\n\nA figura acima apresenta alguns tipos de diagramas que podem ser construídos com a notação UML, na qual se destacam diagramas nomeados de A a F. Considerando essa figura, julgue os itens seguintes, acerca da notação UML e sua aplicação à análise de sistemas.",
    discipline: "Tecnologia da Informação",
    topic: "Linguagens de Programação",
    board: "CESPE/CEBRASPE",
    year: 2008,
    orgao: "INPE - BR",
    cargo: "Tecnologista",
    difficulty: Difficulty.HARD,
    type: QuestionType.TRUE_FALSE,
    alternatives: [
      { id: "c", text: "Certo", isCorrect: true },
      { id: "e", text: "Errado", isCorrect: false }
    ],
    createdAt: Date.now()
  }
];
