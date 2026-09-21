import { PdfCourse } from '../types';

export const MOCK_PDF_COURSES: PdfCourse[] = [
  {
    id: 'pdf_direito_administrativo_ddtest',
    title: 'Direito Administrativo: Fundamentos e Aplicações',
    subtitle: 'Uma jornada pelo conjunto de normas, princípios e institutos que regulam a atuação da Administração Pública brasileira',
    discipline: 'Direito Administrativo',
    career: 'Administrativo',
    targetExam: 'Concursos Públicos Federais & Estaduais (PF, PRF, Tribunais, Fiscais)',
    author: {
      name: 'Prof. Dr. André Bastos',
      title: 'Especialista em Direito Público & Analista Judiciário',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    coverGradient: 'from-emerald-700 via-teal-800 to-slate-950',
    coverAccentColor: '#059669',
    totalPages: 10,
    totalModules: 4,
    fileSizeMb: 1.84,
    pdfUrl: '/ddtest.pdf',
    downloadUrl: '/ddtest.pdf',
    description: 'Curso esquematizado e completo em PDF fundamentado na obra "Direito Administrativo: Fundamentos e Aplicações". Estruturado em 10 páginas sintéticas e de alto rendimento cobrindo fontes, princípios expressos (LIMPE), atos e poderes administrativos, controle da administração, serviços públicos, responsabilidade civil objetiva (art. 37, §6º), processo administrativo (Lei nº 9.784/99) e os novos desafios contemporâneos como Governo Digital, LGPD, IA e sustentabilidade ESG.',
    highlights: [
      'Documento original ddtest.pdf integrado com alternância instantânea entre Leitura Digital e PDF Original',
      'Princípios constitucionais do art. 37 caput (LIMPE) e princípios implícitos da Administração',
      'Requisitos de validade dos atos (COFIF) e atributos essenciais (PATI)',
      'Evolução histórica da responsabilidade civil do Estado: do Absolutismo ao Risco Administrativo',
      'Processo Administrativo Federal (Lei 9.784/99) e espécies de recursos'
    ],
    tags: ['Direito Administrativo', 'LIMPE', 'Atos Administrativos', 'Serviços Públicos', 'Responsabilidade Civil', 'Processo Administrativo', 'ddtest.pdf'],
    edition: '1ª Edição Especial Digital (ddtest.pdf)',
    publishedYear: 2024,
    rating: 5.0,
    ratingCount: 184,
    isPremium: false,
    isFeatured: true,
    modules: [
      {
        id: 'mod_adm_1',
        title: 'Módulo 1: Conceito, Fontes & Princípios Fundamentais (Págs 1 a 3)',
        order: 1,
        chapters: [
          {
            id: 'adm_cap_1',
            title: 'Capítulo 1: O que é Direito Administrativo? Conceito, Fontes e Regime Jurídico',
            pageStart: 1,
            pageEnd: 2,
            durationMinutes: 20,
            summary: 'Definições doutrinárias (Hely Lopes Meirelles e Celso Antônio Bandeira de Mello), fontes primárias e secundárias do direito administrativo e dispersão legislativa.',
            contentSnippet: `O QUE É DIREITO ADMINISTRATIVO?

O Direito Administrativo é o ramo do direito público que regula a organização, os meios e as formas de atuação da Administração Pública, bem como as relações jurídicas entre o Estado e os particulares.

Diferentemente de outros ramos do direito, não é codificado em um único diploma legal — sua normatização é dispersa, encontrando-se na Constituição Federal, em leis infraconstitucionais, decretos, regulamentos e na jurisprudência dos tribunais.

DEFINIÇÕES DOUTRINÁRIAS CONSAGRADAS:
• Segundo Hely Lopes Meirelles: é "o conjunto harmônico de princípios jurídicos que regem os órgãos, os agentes e as atividades públicas tendentes a realizar, de forma direta e imediata, os fins do Estado".
• Celso Antônio Bandeira de Mello o define como: "o ramo do direito que estuda a Administração Pública e a relação jurídica entre ela e os administrados".

FONTES DO DIREITO ADMINISTRATIVO:
1. Constituição Federal de 1988: Fonte primária e suprema, estabelece os princípios fundamentais da Administração Pública nos arts. 37 a 41.
2. Leis Infraconstitucionais: Lei nº 8.112/1990 (regime dos servidores), Leis nº 8.666/1993 e 14.133/2021 (licitações e contratos), Lei nº 9.784/1999 (processo administrativo federal).
3. Jurisprudência e Doutrina: As decisões reiteradas dos tribunais superiores (STF e STJ) e as lições doutrinárias que complementam e interpretam as normas administrativas.`
          },
          {
            id: 'adm_cap_2',
            title: 'Capítulo 2: Princípios do Direito Administrativo — LIMPE e Princípios Implícitos',
            pageStart: 3,
            pageEnd: 3,
            durationMinutes: 25,
            summary: 'O art. 37, caput, da CF/88 consagra os cinco princípios expressos: Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência, além dos princípios implícitos.',
            contentSnippet: `PRINCÍPIOS DO DIREITO ADMINISTRATIVO (LIMPE)

O art. 37, caput, da Constituição Federal de 1988 consagrou os cinco princípios expressos que regem toda a atuação da Administração Pública. Conhecidos pelo acrônimo LIMPE, funcionam como parâmetros de validade e legitimidade dos atos administrativos:

1. LEGALIDADE:
A Administração só pode agir quando houver expressa previsão legal. Diferentemente do particular, que pode fazer tudo o que a lei não proíbe (art. 5º, II, CF), o administrador público só pode fazer estritamente o que a lei autoriza ou determina. É o princípio basilar do Estado de Direito.

2. IMPESSOALIDADE:
Os atos devem ser praticados em nome do interesse público, sem favorecimentos, perseguições ou privilégios pessoais. Veda a utilização de nomes, símbolos ou imagens que caracterizem promoção pessoal de autoridades em publicidade oficial (art. 37, § 1º, CF) e exige tratamento isonômico a todos os administrados.

3. MORALIDADE:
Exige que o administrador atue com ética, boa-fé, lealdade, honestidade e probidade. Não basta que o ato seja formalmente legal — deve ser também moralmente legítimo. A improbidade administrativa acarreta suspensão dos direitos políticos e perda da função pública (Lei nº 8.429/1992).

4. PUBLICIDADE:
Determina a divulgação oficial dos atos administrativos para que produzam efeitos externos e para que os interessados possam deles tomar ciência, fiscalizar e impugnar. A publicidade é condição de eficácia do ato e instrumento indispensável ao controle social.

5. EFICIÊNCIA:
Incluído pela Emenda Constitucional nº 19/1998, exige que a atuação administrativa produza resultados com qualidade, presteza, economicidade e rendimento funcional. Envolve tanto a boa prestação dos serviços públicos quanto a otimização dos recursos públicos disponíveis.

PRINCÍPIOS IMPLÍCITOS RECONHECIDOS PELA DOUTRINA:
Razoabilidade, Proporcionalidade, Motivação, Autotutela (Súmulas 346 e 473 do STF), Continuidade do Serviço Público e Segurança Jurídica.`
          }
        ]
      },
      {
        id: 'mod_adm_2',
        title: 'Módulo 2: Atos & Poderes da Administração Pública (Págs 4 a 5)',
        order: 2,
        chapters: [
          {
            id: 'adm_cap_3',
            title: 'Capítulo 3: Atos Administrativos — Requisitos de Validade (COFIF) e Atributos',
            pageStart: 4,
            pageEnd: 4,
            durationMinutes: 30,
            summary: 'Conceito de ato administrativo, os 5 requisitos de validade (Competência, Finalidade, Forma, Motivo, Objeto) e os atributos (Presunção de Legitimidade, Imperatividade, Autoexecutoriedade e Tipicidade).',
            contentSnippet: `ATOS ADMINISTRATIVOS

Atos administrativos são manifestações unilaterais de vontade da Administração Pública — ou de quem lhe faça as vezes — que, no exercício da função administrativa, produzem efeitos jurídicos imediatos, com o objetivo de atender ao interesse público.

REQUISITOS DE VALIDADE DO ATO ADMINISTRATIVO (Mnemônico COFIF):
1. Competência: O agente público deve possuir atribuição legal para a prática do ato. É requisito vinculado e, como regra geral, convalidável se não houver competência exclusiva.
2. Finalidade: O ato deve buscar o interesse público primário prescrito em lei. O desvio de finalidade vicia o ato de nulidade absoluta e insanável.
3. Forma: O ato deve revestir a roupagem prescrita em lei (decreto, portaria, resolução, edital). A forma escrita é a regra geral no direito público.
4. Motivo: É a situação fática e jurídica que autoriza ou determina a prática do ato. Deve ser verdadeiro, legítimo e congruente (Teoria dos Motivos Determinantes).
5. Objeto (ou Conteúdo): É a alteração prática que o ato opera no mundo jurídico (aquilo que ele concede, proíbe, atesta ou dispõe). Deve ser lícito, possível, determinado ou determinável.

ATRIBUTOS DO ATO ADMINISTRATIVO (PATI):
• Presunção de Legitimidade e Veracidade: O ato presume-se em conformidade com a lei até prova em contrário (juris tantum).
• Autoexecutoriedade: A Administração pode executar diretamente o ato sem intervenção prévia do Poder Judiciário.
• Tipicidade: O ato deve corresponder a figuras jurídicas predefinidas pelo ordenamento legal.
• Imperatividade: Permite impor obrigações unilaterais a terceiros independentemente de sua prévia anuência.`
          },
          {
            id: 'adm_cap_4',
            title: 'Capítulo 4: Poderes da Administração Pública — Vinculado, Discricionário e Poder de Polícia',
            pageStart: 5,
            pageEnd: 5,
            durationMinutes: 30,
            summary: 'Poderes como deveres-poderes estatais: Poder Vinculado, Discricionário, Hierárquico, Disciplinar e Poder de Polícia com seus limites constitucionais.',
            contentSnippet: `PODERES DA ADMINISTRAÇÃO PÚBLICA

Os poderes administrativos são prerrogativas e instrumentos jurídicos de que dispõe a Administração Pública para o cumprimento efetivo de suas finalidades. Não se confundem com os Três Poderes do Estado (Executivo, Legislativo e Judiciário), mas são prerrogativas funcionais inerentes à atividade administrativa. Constituem deveres-poderes irrenunciáveis.

ESPÉCIES DE PODERES ADMINISTRATIVOS:

1. Poder Vinculado:
A lei estabelece todos os elementos e requisitos do ato, sem margem de liberdade ou valoração ao agente. Diante dos pressupostos legais, a Administração é obrigada a praticar o ato exatamente como fixado em lei. Exemplo: concessão de aposentadoria a servidor que cumpriu todos os requisitos.

2. Poder Discricionário:
A lei confere ao administrador certa margem de apreciação para escolher entre opções juridicamente válidas, avaliando a conveniência e oportunidade (mérito administrativo). Não se confunde com arbitrariedade: deve sempre respeitar a razoabilidade, a proporcionalidade e a finalidade pública.

3. Poder Hierárquico:
Permite a distribuição escalonada e estruturada de competências dentro da Administração direta e indireta, estabelecendo relações de subordinação. Abrange as atribuições de dar ordens, fiscalizar, delegar, avocar e rever atos de órgãos ou agentes subordinados.

4. Poder Disciplinar:
Permite à Administração apurar faltas funcionais e aplicar penalidades aos seus servidores, bem como a particulares sujeitos à disciplina interna do Estado (como concessionários e contratados). Exige a estrita observância do contraditório e da ampla defesa.

5. Poder de Polícia:
Faculdade estatal de condicionar e restringir o uso de bens, o exercício de direitos individuais e atividades privadas em favor do bem-estar social e da segurança coletiva. Pode manifestar-se por via preventiva (alvarás, licenças, regulamentações) ou repressiva (multas, apreensões, interdições de estabelecimentos). Submete-se ao princípio da proporcionalidade.`
          }
        ]
      },
      {
        id: 'mod_adm_3',
        title: 'Módulo 3: Controle, Serviços Públicos & Responsabilidade Civil (Págs 6 a 8)',
        order: 3,
        chapters: [
          {
            id: 'adm_cap_5',
            title: 'Capítulo 5: Controle da Administração Pública — Autotutela, TCU e Controle Judicial',
            pageStart: 6,
            pageEnd: 6,
            durationMinutes: 25,
            summary: 'Mecanismos de fiscalização e legalidade: Autotutela interna (Súmulas 346 e 473 STF), controle legislativo com auxílio do TCU e controle judicial de legalidade.',
            contentSnippet: `CONTROLE DA ADMINISTRAÇÃO PÚBLICA

O controle da Administração Pública é o complexo de mecanismos jurídicos e institucionais destinados a fiscalizar a legalidade, a legitimidade, a economicidade e a eficiência dos atos estatais. Em um Estado Democrático de Direito, todo poder é limitado e sujeito a prestação de contas.

1. CONTROLE INTERNO & AUTOTUTELA ADMINISTRATIVA:
A própria Administração Pública tem o dever de exercer controle sobre os seus atos:
• Anulação de atos ilegais (com efeito retroativo - ex tunc).
• Revogação de atos legais por motivo de conveniência e oportunidade (efeito prospectivo - ex nunc).
Consagrado pelas Súmulas 346 e 473 do STF: "A administração pode anular seus próprios atos, quando eivados de vícios que os tornam ilegais, porque deles não se originam direitos; ou revogá-los, por motivo de conveniência ou oportunidade, respeitados os direitos adquiridos, e ressalvada, em todos os casos, a apreciação judicial".

2. CONTROLE EXTERNO LEGISLATIVO & TRIBUNAL DE CONTAS (TCU):
O Congresso Nacional, auxiliado pelo Tribunal de Contas da União (art. 70 e 71 da CF/88), exerce a fiscalização contábil, financeira, orçamentária, operacional e patrimonial da União e dos entes da administração direta e indireta.

3. CONTROLE JUDICIAL:
O Poder Judiciário tem a competência para apreciar e anular atos administrativos manifestamente ilegais ou abusivos, sendo-lhe vedado imiscuir-se no mérito administrativo (conveniência e oportunidade legítimas). Principais remédios constitucionais: Mandado de Segurança, Ação Popular e Ação Civil Pública.`
          },
          {
            id: 'adm_cap_6',
            title: 'Capítulo 6: Serviços Públicos — Classificação, Formas de Prestação e Concessões',
            pageStart: 7,
            pageEnd: 7,
            durationMinutes: 25,
            summary: 'Classificação doutrinária dos serviços públicos, regime jurídico, formas de prestação direta ou indireta, Concessões (Lei 8.987/95) e Parcerias Público-Privadas.',
            contentSnippet: `SERVIÇOS PÚBLICOS

Serviço público é toda atividade material ou intelectual prestada pelo Estado, diretamente ou sob o regime de delegação a particulares, destinada a satisfazer necessidades coletivas essenciais, sob regime jurídico predominantemente público (art. 175 da CF/88).

CLASSIFICAÇÃO DOS SERVIÇOS PÚBLICOS:
• Serviços Propriamente Ditos: Prestados diretamente pelo Estado, indivisíveis (uti universi) e financiados por impostos gerais. Ex.: segurança pública, diplomacia, defesa nacional.
• Serviços de Utilidade Pública: Divisíveis (uti singuli), remunerados mediante tarifas ou preços públicos, podendo ser delegados a concessionárias e permissionárias. Ex.: energia elétrica, telecomunicações, transporte coletivo, saneamento.
• Serviços Sociais: Atividades de relevância pública que o Estado fomenta e também são exercidas por entidades privadas sem fins lucrativos (como entidades paraestatais do Sistema S).

FORMAS DE PRESTAÇÃO:
1. Prestação Direta: Executada pelos órgãos da Administração Direta ou por entidades da Administração Indireta (autarquias, fundações públicas).
2. Concessão: Contrato administrativo formal, precedido obrigatoriamente de licitação na modalidade concorrência ou diálogo competitivo, por prazo determinado (Lei nº 8.987/1995).
3. Permissão: Delegação a título precário, unilateralmente revogável pelo poder concedente.
4. Parcerias Público-Privadas (PPP): Concessões patrocinadas ou administrativas reguladas pela Lei nº 11.079/2004 para empreendimentos de grande porte.`
          },
          {
            id: 'adm_cap_7',
            title: 'Capítulo 7: Responsabilidade Civil do Estado — Teoria do Risco Administrativo e Excludentes',
            pageStart: 8,
            pageEnd: 8,
            durationMinutes: 30,
            summary: 'Art. 37, §6º da CF/88, responsabilidade objetiva baseada no risco administrativo, elementos (conduta, dano e nexo causal) e hipóteses excludentes da responsabilidade.',
            contentSnippet: `RESPONSABILIDADE CIVIL DO ESTADO

A responsabilidade civil do Estado consiste no dever jurídico de reparar danos materiais ou morais causados a particulares por atos de seus agentes públicos no exercício de suas funções ou a pretexto de exercê-las.

EVOLUÇÃO HISTÓRICA DAS TEORIAS:
1. Teoria da Irresponsabilidade Estatal: Vigorou nos regimes absolutistas ("O Rei não erra" / "The King can do no wrong").
2. Teoria da Culpa Civil: Exigia do particular a comprovação de dolo ou culpa do servidor público específico.
3. Teoria da Culpa Administrativa (Faute du Service): Falta do serviço (serviço não funcionou, funcionou mal ou funcionou tardiamente).
4. Teoria do Risco Administrativo (Adotada pelo Brasil): Responsabilidade objetiva do Estado. Não se exige prova de culpa ou dolo do agente.

REGRA CONSTITUCIONAL DO ART. 37, § 6º, DA CF/88:
"As pessoas jurídicas de direito público e as de direito privado prestadoras de serviços públicos responderão pelos danos que seus agentes, nessa qualidade, causarem a terceiros, assegurado o direito de regresso contra o responsável nos casos de dolo ou culpa."

ELEMENTOS DA RESPONSABILIDADE OBJETIVA:
1. Conduta oficial (ação do agente público).
2. Dano indenizável (material, estético ou moral).
3. Nexo de causalidade entre a conduta e o dano sofrido.

EXCLUDENTES E ATENUANTES DO NEXO CAUSAL:
• Culpa exclusiva da vítima: afasta totalmente a responsabilidade do Estado.
• Caso fortuito ou força maior: rompe o nexo causal, salvo se demonstrada omissão estatal culposa.
• Culpa concorrente: atenua o montante da indenização a ser paga pelo Estado.`
          }
        ]
      },
      {
        id: 'mod_adm_4',
        title: 'Módulo 4: Processo Administrativo & Desafios Contemporâneos (Págs 9 a 10)',
        order: 4,
        chapters: [
          {
            id: 'adm_cap_8',
            title: 'Capítulo 8: Processo Administrativo Federal — Lei nº 9.784/1999 e Recursos',
            pageStart: 9,
            pageEnd: 9,
            durationMinutes: 25,
            summary: 'Regulamentação do processo administrativo no âmbito da Administração Pública Federal (Lei nº 9.784/99), fases procedimentais, motivação e recursos hierárquicos.',
            contentSnippet: `PROCESSO ADMINISTRATIVO FEDERAL (LEI Nº 9.784/1999)

O processo administrativo é a sequência ordenada de atos e procedimentos por meio da qual a Administração Pública forma sua vontade e materializa decisões vinculantes, garantindo aos interessados o exercício do contraditório e da ampla defesa.

FASES DO PROCESSO ADMINISTRATIVO:
1. Instauração: Início formal do procedimento, de ofício ou mediante requerimento do administrado.
2. Instrução: Fase probatória com juntada de documentos, perícias, oitiva de testemunhas e elaboração de pareceres técnicos.
3. Defesa: Oportunidade indispensável de manifestação e impugnação pelo administrado interessado.
4. Relatório e Decisão: Ato motivado conclusivo da autoridade administrativa competente.

PRINCÍPIOS ESPECÍFICOS DA LEI Nº 9.784/1999:
• Oficialidade: A Administração pode impulsionar o processo de ofício.
• Informalismo moderado: Rito simplificado, sem formalismos desnecessários.
• Gratuidade: Como regra, os processos administrativos não ensejam cobrança de custas.
• Verdade Material: Busca-se a realidade concreta dos fatos, e não apenas a verdade formal dos autos.

SISTEMA RECURSAL ADMINISTRATIVO:
• Pedido de Reconsideração: Dirigido à própria autoridade prolatora da decisão.
• Recurso Hierárquico Próprio: Dirigido à autoridade superior na linha hierárquica (independe de caução, consoante Súmula Vinculante 21 do STF).`
          },
          {
            id: 'adm_cap_9',
            title: 'Capítulo 9: Desafios Contemporâneos — Governo Digital, LGPD, IA e Sustentabilidade ESG',
            pageStart: 10,
            pageEnd: 10,
            durationMinutes: 25,
            summary: 'Tendências e modernização: Estratégia de Governo Digital (EGD), aplicação da LGPD (Lei 13.709/18) na gestão pública, automação com IA e licitações sustentáveis.',
            contentSnippet: `DESAFIOS ATUAIS E TENDÊNCIAS DO DIREITO ADMINISTRATIVO

O Direito Administrativo brasileiro vivencia uma profunda e acelerada revolução tecnológica e institucional, orientada pela modernização da gestão e pelo fortalecimento da cidadania digital.

TENDÊNCIAS CENTRAIS DA ADMINISTRAÇÃO CONTEMPORÂNEA:

1. Governo Digital e Cidadania Eletrônica:
A digitalização dos serviços públicos (Estratégia de Governo Digital e Lei nº 14.129/2021) desburocratiza processos, substitui o papel e viabiliza plataformas unificadas de autoatendimento ao cidadão.

2. Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018):
O tratamento de dados pessoais no setor público impõe a estrita observância das finalidades públicas legítimas, transparência ativa e robustas medidas de segurança cibernética para proteção da privacidade do cidadão.

3. Inteligência Artificial e Automação de Decisões:
O emprego de modelos preditivos, automação de rotinas e algoritmos em atos vinculados exige governança algorítmica, auditoria e explicabilidade para assegurar que não ocorram vieses discriminatórios nem violações ao devido processo legal.

4. Governança, Compliance e Sustentabilidade ESG:
A nova Lei de Licitações e Contratos Administrativos (Lei nº 14.133/2021) inseriu expressamente o desenvolvimento nacional sustentável e critérios ESG (ambientais, sociais e de governança) como balizas obrigatórias nas contratações públicas e compras governamentais.

CONCLUSÃO:
Dominar os fundamentos do Direito Administrativo — princípios, atos, poderes, controle, responsabilidade civil e processo — é essencial para compreender a máquina pública brasileira e conquistar as melhores aprovações em concursos de alto rendimento.`
          }
        ]
      }
    ]
  },
  {
    id: 'pdf_ctb_prf',
    title: 'Legislação de Trânsito Esquematizada & Comentada',
    subtitle: 'Código de Trânsito Brasileiro (Lei 9.503/97) e Resoluções CONTRAN Essenciais',
    discipline: 'Legislação de Trânsito',
    career: 'Policial',
    targetExam: 'PRF - Policial Rodoviário Federal',
    author: {
      name: 'Prof. Marcos Andrade',
      title: 'Especialista em Trânsito & Ex-Instrutor PRF',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    coverGradient: 'from-amber-600 via-yellow-600 to-amber-900',
    coverAccentColor: '#f59e0b',
    totalPages: 184,
    totalModules: 6,
    fileSizeMb: 14.8,
    pdfUrl: 'https://cdn.filestackcontent.com/wAtY3UFR4y2m6C1X64oE', // Sample fast-loading viewer / sample cloud link
    downloadUrl: '',
    description: 'Material completo e atualizado abordando todos os artigos de alta incidência do CTB para o concurso de Agente da PRF. Inclui quadros comparativos de infrações, penalidades, medidas administrativas e normas gerais de circulação com mapas conceituais.',
    highlights: [
      'Atualizado com as Leis 14.071/20 e 14.599/23',
      'Tabela mnemônica de Crimes de Trânsito x Infrações Gravíssimas',
      'Mais de 120 esquemas visuais com foco na banca Cebraspe',
      'Artigos comentados linha a linha com jurisprudência do STJ'
    ],
    tags: ['PRF', 'CTB', 'Legislação Especial', 'Direito de Trânsito', 'Polícia Rodoviária'],
    edition: '5ª Edição Revisada & Ampliada',
    publishedYear: 2024,
    rating: 4.95,
    ratingCount: 342,
    isPremium: false,
    isFeatured: true,
    modules: [
      {
        id: 'mod_ctb_1',
        title: 'Módulo 1: Sistema Nacional de Trânsito (SNT) & Normas Gerais',
        order: 1,
        chapters: [
          {
            id: 'ctb_cap_1',
            title: 'Capítulo 1: Composição e Competências dos Órgãos do SNT',
            pageStart: 1,
            pageEnd: 28,
            durationMinutes: 45,
            summary: 'Órgãos normativos (CONTRAN, CETRAN, CONTRANDIFE) e órgãos executivos rodoviários e de trânsito. Competências exclusivas e concorrentes.',
            contentSnippet: `O Sistema Nacional de Trânsito (SNT) é o conjunto de órgãos e entidades da União, dos Estados, do Distrito Federal e dos Municípios que tem por finalidade o exercício das atividades de planejamento, administração, normatização, pesquisa, registro e licenciamento de veículos, formação, habilitação e reciclagem de condutores, educação, engenharia, operação do sistema viário, policiamento, fiscalização, julgamento de infrações e de recursos e aplicação de penalidades.

DIRETRIZ IMPORTANTE PARA A PRF:
A PRF integra os órgãos executivos rodoviários da União (Art. 20 c/c Art. 144, § 2º, CF/88), tendo circunscrição sobre todas as rodovias e estradas federais.
A competência para fiscalizar cumprimento de normas de trânsito, recolhimento de CNH e retenção de veículos é originária.`
          },
          {
            id: 'ctb_cap_2',
            title: 'Capítulo 2: Normas Gerais de Circulação e Conduta (Arts. 26 a 67)',
            pageStart: 29,
            pageEnd: 62,
            durationMinutes: 60,
            summary: 'Regras de preferência, ultrapassagem, velocidade, uso de luzes e conduta preventiva na condução.',
            contentSnippet: `Regras Fundamentais de Preferência (Art. 29, III):
1. Veículo que transita por rodovia tem preferência sobre quem entra ou cruza;
2. Veículo que circula por rotatória tem preferência;
3. Nos demais casos, terá preferência o que vier pela direita do condutor.

Atenção especial ao trânsito de veículos de emergência (socorro de incêndio, polícia, ambulância): gozam de livre circulação, estacionamento e parada quando em serviço de urgência, de policiamento ostensivo ou de preservação da ordem pública, desde que identificados por dispositivos regulamentares de alarme sonoro e iluminação vermelha intermitente.`
          }
        ]
      },
      {
        id: 'mod_ctb_2',
        title: 'Módulo 2: Infrações, Penalidades & Medidas Administrativas',
        order: 2,
        chapters: [
          {
            id: 'ctb_cap_3',
            title: 'Capítulo 3: Penalidades vs. Medidas Administrativas (Regra de Ouro)',
            pageStart: 63,
            pageEnd: 98,
            durationMinutes: 50,
            summary: 'Diferenças cruciais: Medidas administrativas começam com a letra R ou T (Retenção, Remoção, Recolhimento, Transbordo, Teste de Alcoolemia).',
            contentSnippet: `Macete Cebraspe para gabaritar:
- Medida Administrativa é providência MOMENTÂNEA tomada no ato da fiscalização pelo Agente de Trânsito ou Policial. Quase todas começam com "R" ou "T":
  • Retenção do veículo (até sanar a irregularidade)
  • Remoção do veículo (ao depósito)
  • Recolhimento do documento de habilitação (CNH/PPD)
  • Realização de teste de alcoolemia ou perícia
  • Transbordo do excesso de carga

- Penalidade depende de PROCESSO ADMINISTRATIVO com ampla defesa e é aplicada exclusivamente pela AUTORIDADE DE TRÂNSITO (dirigente do órgão), NUNCA pelo agente na pista.`
          },
          {
            id: 'ctb_cap_4',
            title: 'Capítulo 4: Crimes de Trânsito (Arts. 291 a 312-B)',
            pageStart: 99,
            pageEnd: 140,
            durationMinutes: 70,
            summary: 'Homicídio culposo, lesão corporal, embriaguez ao volante (Art. 306), racha (Art. 308) e fuga do local.',
            contentSnippet: `Art. 306 do CTB: Conduzir veículo automotor com capacidade psicomotora alterada em razão da influência de álcool ou de outra substância psicoativa que determine dependência:
Penas: Detenção de seis meses a três anos, multa e suspensão ou proibição de se obter a permissão ou a habilitação.
Constatação: Concentração igual ou superior a 6 decigramas de álcool por litro de sangue ou igual ou superior a 0,3 miligrama de álcool por litro de ar alveolar.`
          }
        ]
      }
    ]
  },
  {
    id: 'pdf_const_pro',
    title: 'Direito Constitucional Direto ao Ponto: Teoria & STF',
    subtitle: 'Do Artigo 1º ao 144 da CF/88 com Jurisprudência e Questões Comentadas',
    discipline: 'Direito Constitucional',
    career: 'Geral',
    targetExam: 'Polícia Federal, PRF, Tribunais & Fiscais',
    author: {
      name: 'Profª. Mariana Alencar',
      title: 'Procuradora do Estado & Mestre em Direito Público',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
    },
    coverGradient: 'from-blue-700 via-indigo-700 to-slate-900',
    coverAccentColor: '#3b82f6',
    totalPages: 210,
    totalModules: 8,
    fileSizeMb: 18.2,
    pdfUrl: '',
    description: 'Manual de Direito Constitucional focado no aprendizado acelerado. Articula a literalidade da Constituição de 1988 aos julgados mais recentes do STF e STJ, com destaque permanente para direitos fundamentais, remédios constitucionais e segurança pública.',
    highlights: [
      'Artigo 5º dissecado inciso a inciso com jurisprudência do STF',
      'Artigo 144 (Segurança Pública) com todas as atribuições comparadas',
      'Quadros sinópticos de Ações Constitucionais (HC, MS, MI, HD, AP)',
      'Técnicas de controle de constitucionalidade explicadas de modo visual'
    ],
    tags: ['Constitucional', 'STF', 'Artigo 5º', 'Segurança Pública', 'Cebraspe', 'FCC'],
    edition: '4ª Edição Atualizada',
    publishedYear: 2024,
    rating: 4.98,
    ratingCount: 520,
    isPremium: false,
    isFeatured: true,
    modules: [
      {
        id: 'mod_const_1',
        title: 'Módulo 1: Princípios Fundamentais & Direitos Individuais (Arts. 1º a 5º)',
        order: 1,
        chapters: [
          {
            id: 'const_cap_1',
            title: 'Capítulo 1: Fundamentos, Poderes e Objetivos Fundamentais',
            pageStart: 1,
            pageEnd: 24,
            durationMinutes: 40,
            summary: 'SO-CI-DI-VA-PLU (Fundamentos do Art. 1º) e CON-GA-ERRA-PRO (Objetivos Fundamentais do Art. 3º).',
            contentSnippet: `Art. 1º - Fundamentos da República Federativa do Brasil (SO-CI-DI-VA-PLU):
I - Soberania;
II - Cidadania;
III - Dignidade da pessoa humana;
IV - Valores sociais do trabalho e da livre iniciativa;
V - Pluralismo político.

Art. 3º - Objetivos Fundamentais (Verbos no infinitivo - CON-GA-ERRA-PRO):
I - Construir uma sociedade livre, justa e solidária;
II - Garantir o desenvolvimento nacional;
III - Erradicar a pobreza e a marginalização e reduzir as desigualdades;
IV - Promover o bem de todos, sem preconceitos de origem, raça, sexo, cor, idade e quaisquer outras formas de discriminação.`
          },
          {
            id: 'const_cap_2',
            title: 'Capítulo 2: Inviolabilidade de Domicílio & Sigilos (Art. 5º, XI e XII)',
            pageStart: 25,
            pageEnd: 58,
            durationMinutes: 55,
            summary: 'A casa como asilo inviolável, exceções do flagrante delito, socorro e ordem judicial durante o dia.',
            contentSnippet: `Art. 5º, XI - A casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo:
1. Em caso de flagrante delito (a qualquer hora do dia ou da noite);
2. Em caso de desastre (a qualquer hora do dia ou da noite);
3. Para prestar socorro (a qualquer hora do dia ou da noite);
4. Durante o dia, por determinação judicial.

Tema 280 STF: A entrada forçada em domicílio sem mandado judicial só é lícita, mesmo em período noturno, quando amparada em fundadas razões, devidamente justificadas a posteriori, que indiquem que dentro da casa ocorre situação de flagrante delito, sob pena de responsabilidade disciplinar, civil e penal do agente e de nulidade dos atos praticados.`
          }
        ]
      },
      {
        id: 'mod_const_2',
        title: 'Módulo 2: Segurança Pública no Texto Constitucional (Art. 144)',
        order: 2,
        chapters: [
          {
            id: 'const_cap_3',
            title: 'Capítulo 3: Órgãos de Segurança Pública e Competências',
            pageStart: 59,
            pageEnd: 92,
            durationMinutes: 50,
            summary: 'Polícia Federal, PRF, PFF, Polícias Civis, PMs, Corpos de Bombeiros e Polícias Penais.',
            contentSnippet: `Art. 144 - A segurança pública, dever do Estado, direito e responsabilidade de todos, é exercida para a preservação da ordem pública e da incolumidade das pessoas e do patrimônio:
I - Polícia Federal;
II - Polícia Rodoviária Federal;
III - Polícia Ferroviária Federal;
IV - Polícias Civis;
V - Polícias Militares e Corpos de Bombeiros Militares;
VI - Polícias Penais federal, estaduais e distrital (EC 104/19).

Rol Taxativo: O STF pacificou que o rol do Art. 144 é taxativo. Guardas Municipais (previstas no § 8º) possuem atribuição de proteção de bens, serviços e instalações municipais e integram o SUSP (Sistema Único de Segurança Pública).`
          }
        ]
      }
    ]
  },
  {
    id: 'pdf_penal_pf_prf',
    title: 'Direito Penal Estratégico: Teoria do Crime & Crimes contra a Vida',
    subtitle: 'Aplicação da Lei Penal, Tipicidade, Excludentes e Crimes em Espécie',
    discipline: 'Direito Penal',
    career: 'Policial',
    targetExam: 'PF, PRF, PCDF & Polícias Civis',
    author: {
      name: 'Dr. Roberto Siqueira',
      title: 'Delegado de Polícia Civil & Doutor em Ciências Criminais',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    },
    coverGradient: 'from-red-800 via-rose-900 to-stone-950',
    coverAccentColor: '#ef4444',
    totalPages: 165,
    totalModules: 5,
    fileSizeMb: 12.5,
    pdfUrl: '',
    description: 'Curso sintético focado na teoria tripartite do crime (fato típico, ilícito e culpável), com análise detalhada das causas de justificação e crimes contra a pessoa e patrimônio com base em casos reais de bancas policiais.',
    highlights: [
      'Conceito Analítico de Crime esquematizado',
      'Diferença cirúrgica entre Dolo Eventual e Culpa Consciente',
      'Excludentes de Ilicitude (Legítima Defesa, Estado de Necessidade, etc.)',
      'Crimes contra a Administração Pública cometidos por funcionário'
    ],
    tags: ['Direito Penal', 'Polícia Federal', 'PRF', 'Teoria do Crime', 'Crimes Contra a Vida'],
    edition: '3ª Edição',
    publishedYear: 2024,
    rating: 4.92,
    ratingCount: 288,
    isPremium: true,
    isFeatured: false,
    modules: [
      {
        id: 'mod_penal_1',
        title: 'Módulo 1: Teoria Geral do Fato Típico & Ilicitude',
        order: 1,
        chapters: [
          {
            id: 'penal_cap_1',
            title: 'Capítulo 1: Tipicidade, Conduta, Resultado e Nexo de Causalidade',
            pageStart: 1,
            pageEnd: 32,
            durationMinutes: 45,
            summary: 'Conceito de conduta, ação, omissão própria e imprópria (garantidor), concausas relativamente e absolutamente independentes.',
            contentSnippet: `Conceito Analítico de Crime (Teoria Tripartite - Adotada no Brasil):
Crime = Fato Típico + Ilícito (Antijurídico) + Culpável.

Elementos do Fato Típico:
1. Conduta humana (dolosa ou culposa, comissiva ou omissiva);
2. Resultado naturalístico (nos crimes materiais);
3. Nexo de causalidade (elo ligando conduta ao resultado);
4. Tipicidade (formal e material).

Princípio da Insignificância (Bagatela): Afasta a tipicidade MATERIAL da conduta quando preenchidos os 4 vetores do STF: M-A-R-I (Mínima ofensividade, Ausência de periculosidade, Reduzidíssimo grau de reprovabilidade, Inexpressividade da lesão jurídica).`
          },
          {
            id: 'penal_cap_2',
            title: 'Capítulo 2: Excludentes de Ilicitude (Art. 23 do CP)',
            pageStart: 33,
            pageEnd: 65,
            durationMinutes: 50,
            summary: 'Estado de Necessidade, Legítima Defesa, Estrito Cumprimento do Dever Legal e Exercício Regular de Direito.',
            contentSnippet: `Art. 23 - Não há crime quando o agente pratica o fato:
I - em estado de necessidade;
II - em legítima defesa;
III - em estrito cumprimento de dever legal ou no exercício regular de direito.

Diferença entre Estado de Necessidade e Legítima Defesa:
• Na Legítima Defesa há agressão INJUSTA humana atual ou iminente. Conflito entre bem legítimo vs. agressor injusto.
• No Estado de Necessidade há perigo ATUAL (não provocado pela vontade do agente), envolvendo colisão entre dois bens jurídicos legítimos.`
          }
        ]
      }
    ]
  },
  {
    id: 'pdf_portugues_fgv_cebraspe',
    title: 'Língua Portuguesa para Concursos: Sintaxe, Crase & Pontuação',
    subtitle: 'Gramática Aplicada a Textos com Foco nos Estilos Cebraspe e FGV',
    discipline: 'Língua Portuguesa',
    career: 'Geral',
    targetExam: 'Todas as Carreiras Públicas',
    author: {
      name: 'Profª. Helena Duarte',
      title: 'Doutora em Linguística pela UnB & Autora de Gramáticas',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
    },
    coverGradient: 'from-emerald-700 via-teal-800 to-slate-900',
    coverAccentColor: '#10b981',
    totalPages: 140,
    totalModules: 5,
    fileSizeMb: 9.8,
    pdfUrl: '',
    description: 'Guia definitivo para gabaritar Português em provas de alto nível. Desvenda os segredos de reescritura textual, paralelismo sintático, colocação pronominal, regência e o emprego irrefutável do acento grave indicativo de crase.',
    highlights: [
      'As 10 regras de ouro da Crase (casos proibidos, obrigatórios e facultativos)',
      'Pontuação estilística e uso da vírgula proibida',
      'Concordância verbal com a partícula "SE" (Apassivadora vs. Indeterminação)',
      'Interpretação e inferência lógica de textos segundo a banca FGV'
    ],
    tags: ['Português', 'Gramática', 'Crase', 'Sintaxe', 'FGV', 'Cebraspe'],
    edition: '2ª Edição',
    publishedYear: 2024,
    rating: 4.96,
    ratingCount: 410,
    isPremium: false,
    isFeatured: true,
    modules: [
      {
        id: 'mod_port_1',
        title: 'Módulo 1: Crase Definitiva & Regência Verbal',
        order: 1,
        chapters: [
          {
            id: 'port_cap_1',
            title: 'Capítulo 1: O Acento Grave Sem Erro: Métodos de Teste Prático',
            pageStart: 1,
            pageEnd: 26,
            durationMinutes: 35,
            summary: 'Troca da palavra feminina por masculina ("ao"), crase antes de pronomes e locuções prepositivas femininas.',
            contentSnippet: `O que é a Crase?
Crase é a fusão de duas vogais idênticas (preposição "a" + artigo definido feminino "a" ou pronomes "aquele", "aquela", "aquilo").

Método da Substituição Rápida:
Substitua a palavra feminina seguinte por uma equivalente masculina.
Se virar "AO", tem crase!
Ex: "Vou à praia" -> "Vou ao parque" (Tem crase!)
Ex: "Amo a vida" -> "Amo o esporte" (Não tem crase!)

Casos Proibidos:
1. Antes de palavras masculinas;
2. Antes de verbos no infinitivo;
3. Antes de pronomes em geral (com exceção de senhora, senhorita, dona);
4. Em expressões com palavras repetidas (cara a cara, gota a gota).`
          }
        ]
      }
    ]
  },
  {
    id: 'pdf_rlm_simplificado',
    title: 'Raciocínio Lógico & Matemática Simplificada',
    subtitle: 'Tabelas-Verdade, Diagramas Lógicos, Análise Combinatória e Probabilidade',
    discipline: 'Raciocínio Lógico',
    career: 'Geral',
    targetExam: 'Polícia Federal, PRF, Bancos & Fiscais',
    author: {
      name: 'Prof. Carlos Mendes',
      title: 'Engenheiro & Professor Titular de Lógica Matemática',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
    },
    coverGradient: 'from-violet-700 via-purple-800 to-slate-900',
    coverAccentColor: '#8b5cf6',
    totalPages: 128,
    totalModules: 4,
    fileSizeMb: 8.4,
    pdfUrl: '',
    description: 'Transforme o raciocínio lógico no seu maior diferencial competitivo. O método passo a passo ensina a construir tabelas-verdade em segundos, aplicar negações de proposições compostas e resolver problemas de conjuntos numéricos sem complicação.',
    highlights: [
      'Negações lógicas clássicas: "Se... então" (Método MANÉ - Mantém a primeira e Nega a segunda)',
      'Equivalências lógicas fundamentais (Contrapositiva e Teorema de De Morgan)',
      'Princípio Fundamental da Contagem vs. Combinação e Arranjo',
      'Mais de 90 questões resolvidas das bancas Cebraspe, FCC e FGV'
    ],
    tags: ['RLM', 'Lógica Proposicional', 'Tabela Verdade', 'Combinatória', 'Probabilidade'],
    edition: '3ª Edição',
    publishedYear: 2024,
    rating: 4.89,
    ratingCount: 195,
    isPremium: false,
    isFeatured: false,
    modules: [
      {
        id: 'mod_rlm_1',
        title: 'Módulo 1: Lógica Proposicional & Tabela-Verdade',
        order: 1,
        chapters: [
          {
            id: 'rlm_cap_1',
            title: 'Capítulo 1: Proposições, Conectivos e Valorações',
            pageStart: 1,
            pageEnd: 30,
            durationMinutes: 40,
            summary: 'Conjunção (E), Disjunção (OU), Condicional (SE... ENTÃO), Bicondicional (SE E SOMENTE SE) e Disjunção Exclusiva (OU... OU).',
            contentSnippet: `Conectivos Lógicos Fundamentais:
1. Conjunção (p ∧ q) "E": Verdadeira apenas se AMBAS forem verdadeiras.
2. Disjunção (p ∨ q) "OU": Falsa apenas se AMBAS forem falsas.
3. Condicional (p → q) "SE... ENTÃO": Falsa apenas no caso "Vera Fischer" (V antecedente e F consequente).
4. Bicondicional (p ↔ q) "SE E SOMENTE SE": Verdadeira quando os valores lógicos forem IGUAIS.

Negação do Condicional (Método MANÉ):
~ (p → q) ≡ p ∧ ~q
(MA-ntém a primeira 'p' E NE-ga a segunda '~q').`
          }
        ]
      }
    ]
  },
  {
    id: 'pdf_admin_licitacoes',
    title: 'Direito Administrativo na Veia: Atos, Poderes & Nova Lei de Licitações',
    subtitle: 'Comentários à Lei 14.133/21, Agentes Públicos e Responsabilidade Civil do Estado',
    discipline: 'Direito Administrativo',
    career: 'Administrativo',
    targetExam: 'Tribunais (TRT, TJ), Controle (TCU) & Administrativo',
    author: {
      name: 'Profª. Carolina Vasconcelos',
      title: 'Auditora Federal de Controle Externo (TCU)',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80'
    },
    coverGradient: 'from-cyan-700 via-teal-800 to-slate-950',
    coverAccentColor: '#06b6d4',
    totalPages: 195,
    totalModules: 7,
    fileSizeMb: 16.0,
    pdfUrl: '',
    description: 'Tudo o que você precisa dominar sobre a Nova Lei de Licitações e Contratos Administrativos (Lei 14.133/21), além dos temas clássicos: Atos Administrativos (requisitos e atributos), Poder de Polícia e Responsabilidade Objetiva do Estado.',
    highlights: [
      'Quadro esquematizado das novas modalidades licitatórias (com foco no Diálogo Competitivo)',
      'Critérios de julgamento e fases do processo licitatório invertido',
      'Atos administrativos: Competência, Finalidade, Forma, Motivo e Objeto',
      'Responsabilidade Civil do Estado: Teoria do Risco Administrativo'
    ],
    tags: ['Direito Administrativo', 'Lei 14.133', 'Licitações', 'Atos Administrativos', 'Tribunais'],
    edition: '2ª Edição 2024',
    publishedYear: 2024,
    rating: 4.97,
    ratingCount: 312,
    isPremium: true,
    isFeatured: false,
    modules: [
      {
        id: 'mod_admin_1',
        title: 'Módulo 1: Atos Administrativos & Poderes da Administração',
        order: 1,
        chapters: [
          {
            id: 'admin_cap_1',
            title: 'Capítulo 1: Requisitos de Validade do Ato (CO-FI-FO-MO-OB)',
            pageStart: 1,
            pageEnd: 35,
            durationMinutes: 45,
            summary: 'Competência, Finalidade, Forma, Motivo e Objeto. Atos vinculados vs. discricionários.',
            contentSnippet: `Requisitos do Ato Administrativo (CO-FI-FO-MO-OB):
1. Competência (Sempre vinculado)
2. Finalidade (Sempre vinculado - interesse público)
3. Forma (Sempre vinculado - solenidade legal)
4. Motivo (Situação fática e jurídica que autoriza ou determina o ato)
5. Objeto (O conteúdo ou efeito jurídico imediato do ato)

Nos atos discricionários, o mérito administrativo reside no MOTIVO e no OBJETO (oportunidade e conveniência).`
          }
        ]
      }
    ]
  },
  {
    id: 'pdf_informatica_pf',
    title: 'Informática Avançada & Segurança da Informação',
    subtitle: 'Redes de Computadores, Cloud Computing, Linux, SQL e Cibersegurança',
    discipline: 'Informática',
    career: 'Policial',
    targetExam: 'Polícia Federal (Agente e Escrivão) & PCDF',
    author: {
      name: 'Prof. Thiago Bitencourt',
      title: 'Perito Criminal Federal & Especialista em Forense Computacional',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80'
    },
    coverGradient: 'from-slate-800 via-cyan-900 to-blue-950',
    coverAccentColor: '#0ea5e9',
    totalPages: 152,
    totalModules: 5,
    fileSizeMb: 11.2,
    pdfUrl: '',
    description: 'Curso construído para os 36 pontos decisivos de Informática na prova da Polícia Federal. Aborda arquitetura TCP/IP, modelos OSI, conceitos de Nuvem (IaaS, PaaS, SaaS), comandos essenciais Linux, Modelagem Relacional e noções de Python/R.',
    highlights: [
      'Modelo OSI x TCP/IP em infográficos de fácil retenção',
      'Protocolos de aplicação e transporte (HTTP, HTTPS, DNS, DHCP, TCP, UDP)',
      'Malwares explicados: Ransomware, Spyware, Rootkit, Worms e Phishing',
      'Comandos Linux de maior cobrança pela banca Cebraspe'
    ],
    tags: ['Informática', 'Polícia Federal', 'Redes', 'Segurança', 'Linux', 'Cloud'],
    edition: '4ª Edição',
    publishedYear: 2024,
    rating: 4.94,
    ratingCount: 380,
    isPremium: true,
    isFeatured: true,
    modules: [
      {
        id: 'mod_info_1',
        title: 'Módulo 1: Redes de Computadores & Protocolos de Internet',
        order: 1,
        chapters: [
          {
            id: 'info_cap_1',
            title: 'Capítulo 1: Modelo OSI vs. Modelo TCP/IP',
            pageStart: 1,
            pageEnd: 38,
            durationMinutes: 50,
            summary: 'Camadas de Aplicação, Transporte, Rede e Enlace. TCP (orientado à conexão) vs UDP (não orientado, rápido).',
            contentSnippet: `Modelo TCP/IP:
- Camada de Aplicação: HTTP, HTTPS, FTP, SSH, DNS, DHCP, SMTP, POP3, IMAP.
- Camada de Transporte:
  • TCP: Orientado à conexão, confiável, realiza three-way handshake (SYN, SYN-ACK, ACK), controle de fluxo e retransmissão.
  • UDP: Não orientado à conexão, sem garantia de entrega, sem confirmação, ideal para streaming de áudio/vídeo e DNS.
- Camada de Rede (Internet): IP (IPv4 e IPv6), ICMP, ARP.
- Camada de Acesso à Rede: Ethernet, Wi-Fi.`
          }
        ]
      }
    ]
  },
  {
    id: 'pdf_tributario_receita',
    title: 'Direito Tributário Descomplicado',
    subtitle: 'Sistema Tributário Nacional, Princípios, Imunidades, CTN e Jurisprudência',
    discipline: 'Direito Tributário',
    career: 'Fiscal',
    targetExam: 'Receita Federal (Auditor & Analista) & SEFAZ',
    author: {
      name: 'Prof. Leonardo Prado',
      title: 'Auditor-Fiscal da Receita Federal & Mestre em Tributação',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
    },
    coverGradient: 'from-amber-700 via-orange-800 to-stone-900',
    coverAccentColor: '#d97706',
    totalPages: 220,
    totalModules: 7,
    fileSizeMb: 17.5,
    pdfUrl: '',
    description: 'Manual de Direito Tributário com linguagem límpida e focada em concursos da área fiscal e de controle. Detalha o conceito de tributo e suas 5 espécies, limitações ao poder de tributar, hipótese de incidência, lançamento e extinção do crédito tributário.',
    highlights: [
      'Teoria Pentapartida dos Tributos (Impostos, Taxas, Contribuições de Melhoria, Empréstimos Compulsórios e Contribuições Especiais)',
      'Princípios da Anterioridade Anual e Nonagesimal com todas as exceções',
      'Imunidade Tributária de Livros, Jornais, Periódicos e Livros Eletrônicos (Súmula Vinculante 57)',
      'Extinção, Exclusão e Suspensão da Exigibilidade do Crédito Tributário esquematizadas'
    ],
    tags: ['Direito Tributário', 'Receita Federal', 'SEFAZ', 'Auditor Fiscal', 'CTN'],
    edition: '5ª Edição 2024',
    publishedYear: 2024,
    rating: 4.93,
    ratingCount: 225,
    isPremium: true,
    isFeatured: false,
    modules: [
      {
        id: 'mod_trib_1',
        title: 'Módulo 1: Conceito de Tributo & Espécies Tributárias',
        order: 1,
        chapters: [
          {
            id: 'trib_cap_1',
            title: 'Capítulo 1: Artigo 3º do CTN e a Teoria Pentapartida',
            pageStart: 1,
            pageEnd: 34,
            durationMinutes: 45,
            summary: 'Tributo como prestação pecuniária compulsória instituída em lei, que não constitua sanção de ato ilícito.',
            contentSnippet: `Art. 3º do CTN:
"Tributo é toda prestação pecuniária compulsória, em moeda ou cujo valor nela se possa exprimir, que não constitua sanção de ato ilícito, instituída em lei e cobrada mediante atividade administrativa plenamente vinculada."

Espécies Tributárias (Teoria Pentapartida acolhida pelo STF):
1. Impostos (não vinculados a contraprestação estatal específica);
2. Taxas (vinculadas ao exercício do poder de polícia ou prestação de serviço público específico e divisível);
3. Contribuições de Melhoria (decorrentes de obras públicas com valorização imobiliária);
4. Empréstimos Compulsórios (competência exclusiva da União por Lei Complementar em guerra, calamidade ou investimento urgente);
5. Contribuições Especiais (sociais, corporativas e CIDE).`
          }
        ]
      }
    ]
  }
];
