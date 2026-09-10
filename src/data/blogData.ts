export type BrazilState = 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI' | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO' | 'Nacional';

export interface BlogPost {
  id: string;
  seoTitle: string; 
  title: string; 
  state: BrazilState | BrazilState[];
  status: string; 
  importantInfo: string;
  imageUrl?: string;
  content?: string; 
  updates: { date: string; content: string }[];
  importantDates: { title: string; date: string }[];
  simulationLinks: { label: string; url?: string; internalTab?: string; filterParams?: any; icon?: string; color?: string }[];
  publishedAt: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "banco-do-brasil",
    seoTitle: "Concurso Banco do Brasil 2026/2027: O Guia Completo e Status Atualizado",
    title: "Concurso do Banco do Brasil 2026/2027: Tudo sobre Vagas, Salário e Previsão",
    state: "Nacional",
    status: "Previsto",
    importantInfo: "Déficit de 10.336 cargos. Expectativa de edital em 2027. Remuneração inicial acima de R$ 6.200 para nível médio.",
    imageUrl: "https://images.unsplash.com/photo-1556740714-a8395b3bf30f?auto=format&fit=crop&q=80&w=1200",
    updates: [
      { date: "2026", content: "Banco do Brasil estuda contratação de nova banca para recomposição do quadro." },
      { date: "Jul/2025", content: "Validade do último edital expirada e todos os aprovados convocados." }
    ],
    importantDates: [
      { title: "Estudos Internos", date: "2026" },
      { title: "Previsão de Edital", date: "A partir de 2027" }
    ],
    simulationLinks: [],
    publishedAt: "2026-09-01T12:00:00Z",
    content: `# Concurso do Banco do Brasil 2026 e 2027

## 1. Status Atualizado e Rumores Reais
O cenário para o Banco do Brasil (BB) neste segundo semestre de 2026 é de altíssima expectativa. O último edital foi publicado em 2023 e teve sua validade expirada de forma definitiva em julho de 2025. Todos os aprovados, incluindo o imenso cadastro de reserva, já foram convocados e tomaram posse.

Atualmente, dados oficiais apontam que o Banco do Brasil opera com um déficit alarmante de 10.336 cargos vagos em todo o país. Devido a esse cenário crítico de sobrecarga nas agências, existe uma forte pressão da Confederação Nacional dos Trabalhadores nas Empresas de Crédito e dos sindicatos bancários para a realização urgente de um novo certame.

O próprio BB já reconheceu internamente a necessidade de recomposição do quadro funcional e iniciou os estudos técnicos voltados para a contratação da nova banca organizadora. A expectativa mais concreta, debatida nas mesas de negociação, é que o novo edital seja publicado no decorrer de 2027. Isso torna este o momento perfeito para iniciar a preparação de forma antecipada.

## 2. A Porta de Entrada: Os Cargos Ofertados
Existe um mito comum de que o Banco do Brasil lança editais para vagas diretas de gerência, economia ou advocacia. A verdade é que a porta de entrada quase exclusiva no BB é o cargo de Escriturário, que exige apenas o **Nível Médio completo**.

No ato da inscrição, o candidato escolhe entre duas vertentes de atuação:
* **Agente Comercial:** É o bancário clássico. Trabalha nas agências em contato direto com o público, realizando atendimento presencial, negociação de produtos, oferta de investimentos e suporte ao cliente. As vagas para este perfil são distribuídas por todos os estados do Brasil.
* **Agente de Tecnologia:** É o profissional focado em Tecnologia da Informação. Atua nos bastidores, desenvolvendo softwares, cuidando da segurança da informação e gerenciando banco de dados. Historicamente, as vagas para este perfil são lotadas de forma exclusiva em Brasília, no Distrito Federal, ou em polos tecnológicos estritamente definidos pelo banco.

## 3. Remuneração e Benefícios Reais (Valores de 2026)
A carreira no Banco do Brasil atrai centenas de milhares de candidatos pela excelente proporção entre horas trabalhadas e o pacote financeiro. A jornada inicial de trabalho é de apenas **6 horas diárias (30 horas semanais)**.

Com os reajustes do Acordo Coletivo de Trabalho vigente em 2026, os valores iniciais para um Escriturário recém chegado são:
* **Vencimento Básico:** R$ 4.314,69
* **Auxílio Refeição:** R$ 1.110,12
* **Cesta Alimentação:** R$ 874,78
* **Remuneração Inicial Total Mensal: R$ 6.299,59**

Além desse montante mensal, o funcionário tem direito garantido a:
* **Participação nos Lucros e Resultados (PLR):** Paga geralmente duas vezes ao ano, sendo conhecida como uma das mais generosas do mercado financeiro brasileiro.
* **Previdência Privada (PREVI):** O banco contribui com valores proporcionais aos investimentos do funcionário.
* **Plano de Saúde e Odontológico (CASSI):** Cobertura médica de altíssima qualidade.
* Auxílio creche, auxílio transporte e programas constantes de capacitação interna.

**Plano de Carreira:** Após o período de experiência, o profissional pode participar de seleções internas para ascensão rápida. Um Assistente de Atendimento ganha cerca de R$ 6.697,55. Já cargos de liderança, como Gerente de Atendimento ou Gerente Módulo, que exigem jornada de 8 horas, possuem remuneração superior a R$ 9.200,00, podendo ultrapassar facilmente os R$ 20.000,00 em posições de Gerência Private de alta renda.

## 4. Estrutura da Prova (Padrão Fundação Cesgranrio)
A Fundação Cesgranrio é a banca historicamente responsável pelas provas do Banco do Brasil. A avaliação objetiva possui 70 questões de múltipla escolha, divididas entre Conhecimentos Básicos (25 questões) e Conhecimentos Específicos (45 questões). A banca aplica pesos diferentes para cada disciplina, o que exige muita estratégia nos estudos.

**Perfil Agente Comercial (Foco em Vendas e Atendimento):**
* **Língua Portuguesa:** 10 questões (1,5 ponto por questão)
* **Língua Inglesa:** 5 questões (1,0 ponto por questão)
* **Matemática:** 5 questões (1,5 ponto por questão)
* **Atualidades do Mercado Financeiro:** 5 questões (1,0 ponto por questão)
* **Probabilidade e Estatística:** 5 questões (1,5 ponto por questão)
* **Conhecimentos Bancários:** 10 questões (1,5 ponto por questão)
* **Conhecimentos de Informática:** 15 questões (1,5 ponto por questão)
* **Vendas e Negociação:** 15 questões (1,5 ponto por questão)

**Perfil Agente de Tecnologia (Foco em TI):**
* **Língua Portuguesa:** 10 questões (1,5 ponto por questão)
* **Língua Inglesa:** 5 questões (1,0 ponto por questão)
* **Matemática:** 5 questões (1,5 ponto por questão)
* **Atualidades do Mercado Financeiro:** 5 questões (1,0 ponto por questão)
* **Probabilidade e Estatística:** 5 questões (1,5 ponto por questão)
* **Conhecimentos Bancários:** 5 questões (1,5 ponto por questão)
* **Tecnologia da Informação:** 35 questões (1,5 ponto por questão)

## 5. A Prova de Redação (Fase Discursiva)
Aplicada no mesmo dia e horário da prova objetiva. O candidato precisa elaborar um texto em prosa do tipo dissertativo-argumentativo.
* A redação vale **100 pontos** no total.
* Possui **caráter estritamente eliminatório**. Isso significa que a nota da redação não altera a sua posição na classificação geral, ela apenas aprova ou reprova o candidato.
* O candidato precisa atingir a nota mínima de **70 pontos** para não ser sumariamente eliminado do concurso.

## 6. Critérios Rígidos de Eliminação
Para ter a redação corrigida e continuar disputando uma das vagas, o candidato precisa sobreviver às regras de corte da prova objetiva. Será desclassificado automaticamente quem:
* Obtiver aproveitamento inferior a 50% do total de pontos da prova objetiva.
* Obtiver aproveitamento inferior a 50% na parte de Conhecimentos Básicos.
* Obtiver aproveitamento inferior a 50% na parte de Conhecimentos Específicos.
* Zerar qualquer uma das disciplinas do edital. Acertar zero questões em Língua Inglesa, por exemplo, elimina o candidato na hora, mesmo que ele gabarite todas as outras matérias da prova.`
  },
  {
    id: "metodo-de-estudo",
    seoTitle: "Metodologia de Estudo para Concursos",
    title: "Metodologia de Estudo para Concursos: O Guia Definitivo",
    status: "Destaque",
    state: "Nacional",
    importantInfo: "Por que a maioria reprova e uma minoria conquista vagas com métodos científicos.",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200",
    updates: [],
    importantDates: [],
    simulationLinks: [],
    publishedAt: "2026-08-28T10:00:00Z",
    content: "SPECIAL_COMPONENT" // We will handle this in BlogScreen
  },
  {
    id: "pf-agente",
    seoTitle: "Concurso Polícia Federal: Guia Definitivo e Atualizado",
    title: "Guia Definitivo e Atualizado para o Concurso de Agente da Polícia Federal",
    status: "Previsto",
    state: "Nacional",
    importantInfo: "Salário inicial superior a R$ 14.700 em 2026. Exige nível superior em qualquer área e CNH B.",
    imageUrl: "/pacote_policiafederal.png",
    importantDates: [
      { title: "Previsão de Autorização", date: "Fevereiro/2026" },
      { title: "Previsão de Edital", date: "A partir de 2027" }
    ],
    simulationLinks: [],
    updates: [
      { date: "FEV/2026", content: "Expectativa de novos pedidos de vagas ao Ministério da Gestão e Inovação." },
      { date: "2024", content: "Última etapa de reestruturação salarial aprovada, elevando o subsídio inicial." }
    ],
    publishedAt: "2026-08-27T00:00:00Z",
    content: `# Guia Definitivo e Atualizado: Concurso de Agente da Polícia Federal (APF)

## 1. Status Atual do Concurso e Rumores para os Próximos Anos
Atualmente, o cenário para quem sonha em ser Agente da Polícia Federal é de intensa movimentação. O certame mais recente teve seu edital publicado em maio de 2025, oferecendo 1.000 vagas imediatas. Esse concurso está vigente e na fase de andamento das turmas de formação. Em agosto de 2026, ocorreu a convocação oficial no Diário Oficial da União de 400 aprovados para a matrícula na segunda turma do Curso de Formação Profissional, que é voltada exclusivamente para o cargo de Agente. A primeira turma já havia iniciado sua preparação no começo de 2026.

Apesar desse edital recente estar em fase de encerramento de etapas, as notícias para os próximos anos são extremamente promissoras. A Polícia Federal continua operando com um déficit gigantesco de pessoal. Levantamentos consolidados em agosto de 2026 mostram que existem mais de 2.200 cargos vagos na corporação. O cargo de Agente é disparado o mais afetado por essa defasagem, acumulando 1.421 funções vagas.

O diretor geral da Polícia Federal, Andrei Augusto Passos Rodrigues, já declarou publicamente a necessidade de preencher integralmente todos os cargos vagos e estipulou a meta de dobrar o efetivo total da corporação a médio e longo prazo. Outra novidade que pode mudar o jogo para os concurseiros é um projeto de lei que já passou pelo Senado Federal e aguarda pauta na Câmara dos Deputados. Esse projeto prevê a realização obrigatória e automática de novos concursos da Polícia Federal sempre que as vacâncias atingirem o patamar de 5% do total de cargos. Isso significa que a corporação caminha para ter seleções recorrentes, acabando com os longos hiatos sem provas.

## 2. Remuneração e Benefícios Reais da Carreira
A estrutura salarial da Polícia Federal foi recentemente atualizada com a sanção da Lei 14.875 de 2024, que garantiu reajustes escalonados para os policiais até o final de 2026. O cargo é dividido em quatro níveis de progressão: Terceira Classe, Segunda Classe, Primeira Classe e Classe Especial.

O subsídio inicial para os ingressantes na Terceira Classe já ultrapassa a casa dos **R$ 14.000,00** mensais, e com a implementação total dos reajustes de 2026, esse valor base tornou-se ainda mais atrativo. No topo da carreira, ao alcançar a Classe Especial, a remuneração dos Agentes supera facilmente a marca dos **R$ 20.000,00** mensais.

Somado ao subsídio, os policiais federais contam com diversos benefícios financeiros importantes:
* **Auxílio alimentação**
* **Adicional de Fronteira** para aqueles lotados em áreas fronteiriças, o que acrescenta um valor significativo e limpo por dia efetivamente trabalhado nessas localidades.
* **Auxílio saúde e assistência pré-escolar** para filhos.

## 3. Requisitos Obrigatórios para a Posse
Para vestir a farda e ostentar o distintivo de Agente, o candidato precisa preencher requisitos rigorosos estipulados em edital, que devem ser comprovados no momento da posse:
* Possuir **diploma de conclusão de curso superior em nível de graduação em qualquer área de formação**, fornecido por instituição de ensino reconhecida pelo Ministério da Educação. Cursos superiores de tecnologia (conhecidos como **tecnólogos**) são plenamente aceitos pela corporação.
* Possuir **Carteira Nacional de Habilitação na categoria "B"** ou em categoria superior, que deve estar válida e sem impedimentos legais.
* Ter idade mínima de **18 anos completos na data oficial da posse**. Não existe idade máxima estabelecida em edital, respeitando-se apenas a idade da aposentadoria compulsória.

## 4. Estrutura Detalhada da Prova Objetiva
A banca tradicionalmente escolhida para organizar o concurso é o **Cebraspe**. A prova objetiva é composta por 120 itens no modelo clássico de julgamento entre Certo e Errado. A regra de pontuação é severa: uma marcação em desacordo com o gabarito oficial anula uma marcação correta.

O edital divide a prova de Agente em três blocos estratégicos. É exigida uma pontuação mínima em cada um dos blocos para evitar a eliminação automática do candidato:

**Bloco I (60 questões)**
Este bloco abrange a base jurídica, interpretativa e de raciocínio. As disciplinas cobradas são:
* Língua Portuguesa
* Noções de Direito Administrativo
* Noções de Direito Constitucional
* Noções de Direito Penal e Direito Processual Penal
* Legislação Especial
* Estatística
* Raciocínio Lógico

**Bloco II (36 questões)**
Considerado o grande divisor de águas e o diferencial absoluto do concurso de Agente. Este bloco é focado inteiramente em Informática e Tecnologia da Informação. O nível de cobrança é profundo e exige conhecimentos muito além do básico, englobando:
* Redes de computadores
* Bancos de dados
* Programação em linguagens como Python e R
* Segurança da Informação avançada

**Bloco III (24 questões)**
Focado única e exclusivamente em Contabilidade Geral. Exige do candidato conhecimentos densos sobre balanços patrimoniais, demonstrações de resultados do exercício e escrituração contábil.

Para não ser sumariamente eliminado, o candidato precisa fazer pontuações líquidas mínimas estipuladas no edital para cada bloco individualmente e também na soma total da prova. Contudo, a nota de corte real para figurar entre os aprovados costuma ser substancialmente maior do que os mínimos exigidos para sobrevivência no certame.

## 5. Prova Discursiva e Redação
Aplicada rigorosamente no mesmo dia da prova objetiva, a avaliação discursiva consiste na elaboração de um texto dissertativo-argumentativo com extensão máxima de 30 linhas.

Os temas selecionados pela banca costumam girar em torno de tópicos contemporâneos de Segurança Pública, o papel institucional da Polícia Federal, combate à criminalidade organizada, impactos da tecnologia e crimes cibernéticos, ou questões ligadas aos direitos humanos.

A correção da banca Cebraspe é criteriosa e divide a nota em duas avaliações principais: o **domínio do conteúdo**, que julga a capacidade de argumentação, estruturação lógica e adequação ao tema proposto; e o **domínio da modalidade escrita**, que penaliza cada erro de ortografia, concordância, pontuação, regência e falhas de coesão textual.

## 6. O Teste de Aptidão Física (TAF)
Esta é reconhecidamente a fase que mais reprova candidatos que já haviam garantido a aprovação na prova escrita. O TAF possui caráter puramente eliminatório e exige índices físicos rigorosos.

**Índices para candidatos do sexo Masculino** (mínimos estipulados nos editais recentes para não ocorrer a desclassificação imediata):
* **Barra Fixa:** realizar o movimento completo de tração. O candidato deve executar a quantidade mínima exigida no edital.
* **Impulsão Horizontal:** saltar a distância mínima exigida de 2,05 metros.
* **Natação (50 metros):** concluir todo o percurso estipulado na piscina no tempo máximo cravado de 56 segundos.
* **Corrida de 12 minutos:** percorrer a distância mínima exigida de 2.300 metros antes do apito final.

**Índices para candidatas do sexo Feminino** (índices mínimos adaptados fisiologicamente, mas mantendo o alto nível de exigência):
* **Barra Fixa:** o teste é realizado em isometria, onde a candidata deve manter-se suspensa com o queixo posicionado acima da linha da barra pelo tempo mínimo exigido em edital.
* **Impulsão Horizontal:** saltar a distância mínima exigida de 1,56 metros.
* **Natação (50 metros):** concluir o percurso na piscina no tempo máximo cravado de 64 segundos.
* **Corrida de 12 minutos:** percorrer a distância mínima exigida de 1.800 metros.

> **Regra crucial do TAF:** Atingir apenas a marca mínima em todos os quatro exercícios resulta na eliminação do candidato. O edital prevê uma tabela de pontuação e o candidato precisa atingir uma nota global mínima, somando os resultados obtidos em cada um dos testes físicos.

## 7. Etapas Finais e o Curso de Formação Profissional
Após sobreviver ao TAF, o candidato ingressa nas etapas de investigação minuciosa. A primeira delas é a **avaliação médica**, onde são analisados dezenas de exames laboratoriais, clínicos e um exame toxicológico de larga janela de detecção. Qualquer condição clínica incapacitante listada no edital gera a reprovação do candidato.

Na sequência, ocorre a **avaliação psicológica**, composta por baterias de testes científicos para medir traços essenciais de personalidade, níveis de agressividade, controle emocional, resistência à frustração e raciocínio lógico. O objetivo é assegurar que o indivíduo possui a estabilidade necessária para o porte de arma de fogo e para as pressões rotineiras da profissão policial. A **investigação social e da vida pregressa** analisa detalhadamente o passado do candidato, checando antecedentes criminais, certidões negativas e conduta social.

A grande etapa final de consagração é o **Curso de Formação Profissional**, sediado na Academia Nacional de Polícia, localizada em Brasília. O curso é eliminatório e classificatório, funcionando sob um regime de internato ou semi-internato. Durante a formação, os alunos recebem intenso treinamento prático de tiro, táticas de defesa policial, direção operacional evasiva, além de uma carga pesada de aulas teóricas fundamentais. Durante os meses de duração do curso, o aluno recebe uma bolsa financeira equivalente à metade do subsídio inicial da carreira. A nota final obtida na Academia, somada à nota da primeira fase do concurso, determinará a classificação final absoluta. É essa lista de classificação que ditará a ordem de prioridade para a escolha das lotações iniciais.`
  },
  {
    id: "prf",
    seoTitle: "Guia Definitivo para o Concurso da Polícia Rodoviária Federal (PRF)",
    title: "Guia Definitivo para o Concurso da Polícia Rodoviária Federal (PRF)",
    state: "Nacional",
    status: "Fase de Planejamento",
    importantInfo: "O certame encontra-se em fase de planejamento interno e envio de ofícios ao Governo Federal. Foco total em uma preparação estratégica para o fim do prazo do último edital.",
    imageUrl: "/pacote_prf.png",
    updates: [
      { date: "Maio/2026", content: "A última parcela do reajuste salarial (Lei nº 14.875/2024) entrou em vigor, elevando o subsídio inicial para R$ 12.253,84." },
      { date: "2026", content: "Novo pedido de concurso protocolado no MGI com 533 vagas totais (269 Policiais e 264 Agentes)." },
      { date: "Dez/2026", content: "Vencimento da prorrogação do concurso de 2021." }
    ],
    importantDates: [
      { title: "Validade do último certame", date: "21/12/2026" },
      { title: "Previsão de novo edital", date: "A partir de 2027" }
    ],
    simulationLinks: [
      { label: "ACESSAR PACOTE DE FLASHCARDS PRF", internalTab: "flashcards", filterParams: { viewingPack: "pack_prf_agente" }, icon: "flashcards", color: "purple" },
      { label: "GERAR CRONOGRAMA PERSONALIZADO", internalTab: "study-plan", icon: "calendar", color: "blue" },
      { label: "FAZER SIMULADO PRF COMPLETO", internalTab: "filter", icon: "target", color: "emerald" },
      { label: "RESOLVER QUESTÕES (BANCO CEBRASPE)", internalTab: "questions", icon: "brain", color: "amber" }
    ],
    publishedAt: "2026-08-20T00:00:00Z",
    content: `A preparação para o concurso da **Polícia Rodoviária Federal (PRF)** exige planejamento estratégico e conhecimento profundo de todos os requisitos e etapas do certame. A seguir, apresento um estudo completo e atualizado com as informações mais recentes referentes ao ano de 2026, com base no histórico de editais e nas movimentações mais recentes da corporação.

## 1. Situação Atual e Panorama (2026)

O concurso da PRF encontra-se em fase de planejamento interno e envio de ofícios de solicitação ao Governo Federal.

* **Validade do Último Concurso:** O certame de 2021 teve sua validade prorrogada por decisões judiciais (envolvendo o sistema de cotas) e permanecerá válido até **21 de dezembro de 2026**. Até esta data, a corporação foca na convocação dos excedentes aprovados.
* **Novas Vagas Solicitadas:** Em 2026, a PRF protocolou um novo pedido ao Ministério da Gestão e da Inovação em Serviços Públicos (MGI) solicitando **533 vagas totais**. Deste número, 269 oportunidades são para a carreira de Policial Rodoviário Federal e 264 para o cargo de Agente Administrativo (nível médio).
* **Déficit e Vacâncias:** Dados do Portal de Dados Abertos do governo apontam que a PRF possui atualmente **mais de 320 cargos vagos** de policial, o que justifica a necessidade estrutural de novos servidores.
* **Impacto da PEC da Segurança Pública:** Tramita no cenário político a Proposta de Emenda à Constituição da Segurança Pública, que pode ampliar as atribuições da instituição. Caso aprovada, haverá forte argumento para criação de novas vagas e autorização de um novo e grande edital após o término do atual (a partir de 2027).

> "A antecipação dos estudos é a principal arma dos aprovados. Aguardar a autorização oficial para começar a preparação é o erro mais comum que custa a vaga."

## 2. Remuneração Atualizada e Benefícios

A carreira policial federal passou por uma grande reestruturação salarial, consolidada pela **Lei nº 14.875/2024**, paga de forma escalonada entre 2024 e 2026. Desde o mês de maio de 2026, a última parcela do reajuste entrou oficialmente em vigor.

* **Terceira Classe (Inicial):** R$ 12.253,84
* **Segunda Classe:** R$ 16.761,16
* **Primeira Classe:** R$ 19.617,37
* **Classe Especial (Final):** R$ 23.000,00

Além do subsídio principal, os policiais fazem jus aos seguintes benefícios fixos e indenizatórios:

* **Auxílio-Alimentação:** R$ 1.192,00.
* **Adicional de Fronteira:** R$ 91,00 por dia efetivamente trabalhado para servidores lotados em regiões fronteiriças ou de difícil provimento. Ao final do mês, isso soma cerca de R$ 2.000,00 líquidos.
* **Auxílio-Natalidade:** R$ 718,58.
* **Assistência Pré-Escolar:** R$ 526,64.
* **Saúde Suplementar:** Assistência via vale-transporte e planos de saúde institucionais.

## 3. Requisitos para o Cargo

As exigências para ingressar na corporação como policial rodoviário federal são transparentes e não contam com algumas restrições comuns em corporações militares:

* **Escolaridade:** Diploma devidamente registrado de conclusão de curso de graduação de Nível Superior em **qualquer área de formação**.
* **Habilitação:** Possuir Carteira Nacional de Habilitação (CNH) na categoria "B" ou superior.
* **Idade:** O candidato deve ter a idade mínima de 18 anos completos no momento da matrícula no Curso de Formação Profissional. **Não há limite de idade máxima** previsto em edital, a não ser a idade da aposentadoria compulsória.
* **Altura:** Não é exigida altura mínima de ingresso. Candidatos e candidatas de qualquer estatura podem tomar posse, desde que consigam os índices requisitados no exame físico.

## 4. Banca Organizadora e Formato da Prova

Historicamente, o **Cebraspe (antigo CESPE)** é a banca que organiza os certames da PRF. O modelo clássico implementado para avaliação é o de julgamento de itens ("Certo" ou "Errado"), em que o acerto soma um ponto, o erro subtrai um ponto, e itens deixados em branco zeram.

O último edital foi composto por **120 itens objetivos** e uma prova discursiva (redação) avaliada quanto ao domínio do tema, capacidade argumentativa e uso adequado da gramática.

## 5. Disciplinas e Assuntos Recorrentes

A prova da PRF é dividida em blocos de conhecimento. Com base no edital de 2021, o conteúdo exigido engloba:

### Bloco I: Conhecimentos Básicos e Complementares (55 itens)

* **Língua Portuguesa:** Peso altíssimo. Foco na interpretação, reescritura de frases, sintaxe e regras de concordância.
* **Raciocínio Lógico-Matemático:** Estruturas lógicas, diagramas de Venn, análise combinatória, equivalências lógicas e probabilidade.
* **Informática:** Foco agudo em segurança da informação (malwares, ataques de rede, backups) e redes de computadores.
* **Física:** Uma peculiaridade fortíssima da PRF, focada em cinemática, movimento retilíneo, choques mecânicos e atrito, tudo voltado para perícias em acidentes automobilísticos.
* **Língua Estrangeira (Inglês ou Espanhol):** O conhecimento cobrado orbita majoritariamente a interpretação textual básica/intermediária ligada ao vocabulário policial e fronteiriço.
* **Geopolítica e Ética:** Malha rodoviária do país, desenvolvimento socioeconômico, logística brasileira e comportamento do servidor público.

### Bloco II: Legislação de Trânsito (30 itens)

Este é o coração da prova da PRF, isoladamente a matéria de maior peso em toda a seleção.

* **Código de Trânsito Brasileiro (CTB) e Resoluções do CONTRAN:** Foco absoluto nas infrações, penalidades, crimes de trânsito e condutas em rodovias, como sinalização e normas de transporte.

### Bloco III: Direito (35 itens)

* **Direito Administrativo e Constitucional:** Artigo 144 da Constituição Federal, direitos fundamentais, organização do Estado, agentes públicos e responsabilidade civil do Estado.
* **Direito Penal e Processual Penal:** Crimes contra a pessoa, patrimônio e administração pública; e regras sobre flagrante, inquérito policial e provas.
* **Legislação Penal Especial:** Leis do desarmamento, Crimes Hediondos, Abuso de Autoridade e especialmente a Lei de Drogas (enfoque nas rotas do tráfico interestadual e transnacional).
* **Direitos Humanos:** Aplicação da força e defesa da dignidade humana durante o policiamento e abordagens em rodovias.

## 6. Teste de Aptidão Física (TAF)

O TAF da Polícia Rodoviária Federal possui caráter **exclusivamente eliminatório** e se destaca por ser um dos mais rigorosos das carreiras policiais. Os testes ocorrem em um mesmo dia com intervalo de descanso de apenas cinco minutos entre os exercícios.

Para não ser reprovado, o candidato precisa marcar no mínimo 2 pontos em cada um dos testes e garantir, ao final, pelo menos **15 pontos na soma global** (o equivalente a uma média mínima de 3 pontos por exercício).

Os testes aplicados e os índices mínimos exigidos (para 2,00 pontos) no edital mais recente são:

* **1. Barra Fixa:** Homens (3 repetições completas) | Mulheres (10 segundos em suspensão)
* **2. Shuttle Run (Corrida Ir e Vir):** Homens (Menos que 13,99 seg) | Mulheres (Menos que 15,00 seg)
* **3. Impulsão Horizontal (Salto):** Homens (A partir de 2,01m) | Mulheres (A partir de 1,61m)
* **4. Flexão Abdominal:** Homens (31 reps em 1 min) | Mulheres (25 reps em 1 min)
* **5. Corrida de 12 Minutos:** Homens (A partir de 2.301m) | Mulheres (A partir de 2.001m)

> **Atenção aos Detalhes de Execução do TAF:**
> Na barra fixa, a pegada obrigatória na PRF é estritamente pronada. Para o público feminino, é vedado usar equipamentos, tocar no solo e receber ajuda durante o cronômetro da isometria. O Shuttle Run avalia a explosão e o tempo de reação. Iniciar o treinamento físico antecipadamente é de vital importância!`
  }
];

export const STATES: BrazilState[] = [
  'Nacional', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 
  'RR', 'SC', 'SP', 'SE', 'TO'
];
