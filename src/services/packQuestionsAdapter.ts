import { Question, QuestionType, Difficulty, Alternative } from '../types';
import { AVAILABLE_PACKS } from '../data/flashcardPacks';

interface FlashcardPackItem {
  id: string;
  title: string;
  description?: string;
  flashcards: Array<{
    front: string;
    back: string;
    subject: string;
  }>;
}

/**
 * Normaliza e categoriza a disciplina a partir do subject do flashcard
 */
export function mapSubjectToDisciplineAndTopic(subject: string, front: string, back: string): { discipline: string; topic: string } {
  const s = (subject || '').trim().toUpperCase();
  const f = (front || '').toUpperCase();
  const b = (back || '').toUpperCase();

  // 1. Legislação de Trânsito / CTB / CONTRAN
  if (s.includes('CTB') || s.includes('TRÂNSITO') || s.includes('TRANSITO') || s.includes('CONTRAN')) {
    const discipline = 'Legislação de Trânsito';
    let topic = 'Código de Trânsito Brasileiro (CTB)';
    if (s.includes('CRIME') || f.includes('CRIME') || b.includes('CRIME')) {
      topic = 'Crimes de Trânsito (CTB)';
    } else if (s.includes('CONTRAN') || f.includes('CONTRAN') || b.includes('CONTRAN')) {
      topic = 'Resoluções do CONTRAN';
    } else if (s.includes('INFRAÇ') || f.includes('INFRAÇ') || f.includes('MULTA') || f.includes('PONTOS')) {
      topic = 'Infrações e Penalidades de Trânsito';
    } else if (f.includes('HABILITA') || f.includes('CNH') || f.includes('EXAME')) {
      topic = 'Habilitação de Condutores';
    } else if (f.includes('SNT') || f.includes('SISTEMA NACIONAL')) {
      topic = 'Sistema Nacional de Trânsito (SNT)';
    }
    return { discipline, topic };
  }

  // 2. Direito Constitucional
  if (s.includes('CONSTITUCIONAL') || s === 'D. CONSTITUCIONAL') {
    const discipline = 'Direito Constitucional';
    let topic = 'Direitos e Garantias Fundamentais';
    if (f.includes('SEGURANÇA PÚBLICA') || f.includes('ART. 144') || b.includes('ART. 144')) {
      topic = 'Segurança Pública (Art. 144 da CF)';
    } else if (f.includes('ORGANIZAÇÃO') || f.includes('ESTADO') || f.includes('COMPETÊNCIA')) {
      topic = 'Organização Político-Administrativa do Estado';
    } else if (f.includes('PODER JUDICIÁRIO') || f.includes('TRIBUNA')) {
      topic = 'Poder Judiciário e Funções Essenciais';
    } else if (f.includes('EXTRADIÇÃO') || f.includes('NACIONALIDADE')) {
      topic = 'Nacionalidade e Cidadania';
    }
    return { discipline, topic };
  }

  // 3. Direito Administrativo
  if (s.includes('ADMINISTRATIVO') || s === 'D. ADMINISTRATIVO' || s.includes('8.112') || s.includes('IMPROBIDADE') || s.includes('ÉTICA') || s.includes('ETICA')) {
    const discipline = 'Direito Administrativo';
    let topic = 'Atos Administrativos';
    if (s.includes('8.112') || f.includes('8.112') || b.includes('8.112')) {
      topic = 'Regime Jurídico Único (Lei 8.112/90)';
    } else if (s.includes('IMPROBIDADE') || f.includes('8.429') || b.includes('8.429')) {
      topic = 'Improbidade Administrativa (Lei 8.429/92)';
    } else if (s.includes('ÉTICA') || s.includes('ETICA') || f.includes('1.171') || b.includes('1.171')) {
      topic = 'Ética no Serviço Público (Decreto 1.171/94)';
    } else if (f.includes('PODERES') || f.includes('PODER DE POLÍCIA')) {
      topic = 'Poderes Administrativos';
    } else if (f.includes('LICITAÇÃO') || f.includes('14.133') || f.includes('8.666')) {
      topic = 'Licitações e Contratos Administrativos';
    } else if (f.includes('RESPONSABILIDADE CIVIL') || f.includes('ART. 37, § 6')) {
      topic = 'Responsabilidade Civil do Estado';
    }
    return { discipline, topic };
  }

  // 4. Direito Processual Penal
  if (s.includes('PROCESSUAL PENAL') || s.includes('PROCESSO PENAL') || s === 'DPPM' || s === 'D. PROCESSUAL PENAL') {
    const discipline = 'Direito Processual Penal';
    let topic = 'Inquérito Policial e Ação Penal';
    if (f.includes('PRISÃO') || f.includes('FLAGRANTE') || b.includes('FLAGRANTE')) {
      topic = 'Prisão em Flagrante e Medidas Cautelares';
    } else if (f.includes('PROVA') || f.includes('PERÍCIA') || b.includes('PROVA')) {
      topic = 'Provas no Processo Penal';
    } else if (f.includes('JURISDIÇÃO') || f.includes('COMPETÊNCIA')) {
      topic = 'Jurisdição e Competência Criminal';
    }
    return { discipline, topic };
  }

  // 5. Direito Penal
  if (s.includes('PENAL') || s === 'DPM' || s === 'D. PENAL') {
    const discipline = 'Direito Penal';
    let topic = 'Teoria Geral do Crime';
    if (f.includes('CRIME CONTRA A PESSOA') || f.includes('HOMICÍDIO') || f.includes('LESÃO')) {
      topic = 'Crimes Contra a Pessoa';
    } else if (f.includes('PATRIMÔNIO') || f.includes('FURTO') || f.includes('ROUBO')) {
      topic = 'Crimes Contra o Patrimônio';
    } else if (f.includes('ADMINISTRAÇÃO PÚBLICA') || f.includes('PECULATO') || f.includes('CORRUPÇÃO')) {
      topic = 'Crimes Contra a Administração Pública';
    } else if (f.includes('INSIGNIFICÂNCIA') || f.includes('TIPICIDADE') || f.includes('ANTIJURIDICIDADE') || f.includes('CULPABILIDADE')) {
      topic = 'Tipicidade, Ilicitude e Culpabilidade';
    }
    return { discipline, topic };
  }

  // 6. Criminologia
  if (s.includes('CRIMINOLOGIA')) {
    return { discipline: 'Criminologia', topic: 'Teorias e Escolas Criminológicas' };
  }

  // 7. Língua Portuguesa
  if (s.includes('PORTUGUÊS') || s.includes('PORTUGUES') || s.includes('LÍNGUA PORTUGUESA') || s.includes('LINGUA PORTUGUESA') || s.includes('REDAÇÃO')) {
    const discipline = 'Português';
    let topic = 'Sintaxe e Pontuação';
    if (f.includes('CRASE') || b.includes('CRASE')) {
      topic = 'Emprego do Sinal Indicativo de Crase';
    } else if (f.includes('CONCORDÂNCIA') || b.includes('CONCORDÂNCIA')) {
      topic = 'Concordância Verbal e Nominal';
    } else if (f.includes('REGÊNCIA') || b.includes('REGÊNCIA')) {
      topic = 'Regência Verbal e Nominal';
    } else if (f.includes('VÍRGULA') || b.includes('VÍRGULA')) {
      topic = 'Emprego da Vírgula e Pontuação';
    } else if (f.includes('PRONOME') || b.includes('PRONOME')) {
      topic = 'Colocação Pronominal e Morfossintaxe';
    }
    return { discipline, topic };
  }

  // 8. Informática
  if (s.includes('INFORMÁTICA') || s.includes('INFORMATICA')) {
    const discipline = 'Informática';
    let topic = 'Segurança da Informação e Malwares';
    if (f.includes('REDE') || f.includes('IP') || f.includes('TCP') || f.includes('DNS') || b.includes('DNS')) {
      topic = 'Redes de Computadores e Protocolos de Internet';
    } else if (f.includes('CLOUD') || f.includes('NUVEM') || b.includes('NUVEM')) {
      topic = 'Computação em Nuvem (Cloud Computing)';
    } else if (f.includes('LINUX') || f.includes('WINDOWS') || b.includes('LINUX')) {
      topic = 'Sistemas Operacionais (Windows e Linux)';
    } else if (f.includes('EXCEL') || f.includes('CALC') || b.includes('PLANILHA')) {
      topic = 'Planilhas Eletrônicas e Pacote Office';
    }
    return { discipline, topic };
  }

  // 9. Raciocínio Lógico, Matemática e Estatística
  if (s.includes('RLM') || s.includes('RACIOCÍNIO') || s.includes('RACIOCINIO') || s.includes('MATEMÁTICA') || s.includes('MATEMATICA') || s.includes('ESTATÍSTICA') || s.includes('ESTATISTICA')) {
    const discipline = 'Raciocínio Lógico';
    let topic = 'Lógica Proposicional e Conectivos';
    if (s.includes('ESTATÍSTICA') || s.includes('ESTATISTICA')) {
      topic = 'Estatística Descritiva e Probabilidade';
    } else if (s.includes('MATEMÁTICA') || s.includes('MATEMATICA')) {
      topic = 'Matemática Financeira e Conjuntos';
    } else if (f.includes('TABELA VERDADE') || f.includes('EQUIVALÊNCIA') || f.includes('NEGAÇÃO')) {
      topic = 'Equivalências Lógicas e Negações';
    }
    return { discipline, topic };
  }

  // 10. Seguridade Social / Direito Previdenciário
  if (s.includes('SEGURIDADE') || s.includes('PREVIDENCIÁRIO') || s.includes('PREVIDENCIARIO')) {
    const discipline = 'Direito Previdenciário';
    let topic = 'Regime Geral da Previdência Social (RGPS)';
    if (s.includes('ASSISTÊNCIA') || f.includes('LOAS') || f.includes('BPC')) {
      topic = 'Assistência Social e Benefício de Prestação Continuada';
    } else if (f.includes('CUSTEIO') || f.includes('CONTRIBUIÇÃO')) {
      topic = 'Financiamento da Seguridade Social e Custeio';
    }
    return { discipline, topic };
  }

  // 11. Contabilidade
  if (s.includes('CONTABILIDADE')) {
    return { discipline: 'Contabilidade Geral', topic: 'Balanço Patrimonial e Pronunciamentos Contábeis' };
  }

  // 12. Direitos Humanos
  if (s.includes('HUMANOS')) {
    return { discipline: 'Direitos Humanos', topic: 'Tratados Internacionais e Declaração Universal' };
  }

  // 13. Física
  if (s.includes('FÍSICA') || s.includes('FISICA')) {
    return { discipline: 'Física', topic: 'Cinemática, Dinâmica e Acidentes de Trânsito' };
  }

  // 14. Legislação Especial
  if (s.includes('LEGISLAÇÃO ESPECIAL') || s.includes('LEG. ESPECIAL') || s.includes('DROGAS') || s.includes('DESARMAMENTO') || s.includes('ABUSO') || s.includes('ECA') || s.includes('MARIA DA PENHA') || s.includes('HEDIONDOS')) {
    const discipline = 'Legislação Especial';
    let topic = subject.replace(/Legislação Especial\s*[-–]?\s*/i, '').replace(/Leg\.\s*Especial\s*\(?/i, '').replace(/\)/g, '').trim();
    if (!topic || topic.length < 3) topic = 'Legislação Penal Extravagante';
    return { discipline, topic };
  }

  // 15. Legislação Específica e DF
  if (s.includes('PMDF') || s.includes('LODF') || s.includes('RIDE') || s.includes('ESTADUAL SP')) {
    return { discipline: 'Conhecimentos Específicos', topic: subject };
  }

  return { discipline: 'Conhecimentos Específicos', topic: subject || 'Conhecimentos Gerais' };
}

/**
 * Limpa e formata a pergunta (frente do flashcard) para texto de concurso
 */
function cleanPrompt(front: string): string {
  let clean = (front || '').trim();
  clean = clean.replace(/^(qual|quais|o que é|o que diz|como funciona|quem é|em que consiste|qual a)\s+/i, (match) => {
    return match.charAt(0).toUpperCase() + match.slice(1);
  });
  return clean;
}

function formatCleanAnswer(text: string): string {
  const t = (text || '').trim();
  if (t.length <= 220) return t;
  // Divide apenas em ponto final que não seja de abreviação legal comum
  const safe = t.replace(/(art\.|n[ºo]\.|inc\.|par\.|al[íi]nea|lei|ex\.|cf\/88\.)/gi, (m) => m.replace('.', '@@@'));
  const parts = safe.split(/\.\s+/);
  const first = parts[0].replace(/@@@/g, '.').trim();
  return first.endsWith('.') ? first : first + '.';
}

/**
 * Converte um flashcard em uma questão Certo / Errado autêntica (estilo Cebraspe / PRF)
 */
function createTrueFalseQuestion(
  front: string,
  back: string,
  discipline: string,
  topic: string,
  cardIndex: number
): { text: string; alternatives: Alternative[]; explanation: string } {
  const cleanF = front.trim().replace(/\?+$/, '').trim();
  const cleanB = back.trim();

  const isNegatedAnswer = /^não[!.]?|^falso[!.]?|^incorreto[!.]?/i.test(cleanB);
  const isAffirmativeAnswer = /^sim[!.]?|^correto[!.]?|^verdadeiro[!.]?/i.test(cleanB);

  let statement = '';
  let isCerto = true;

  if (isNegatedAnswer) {
    // A resposta original diz "Não". A assertiva afirmando que ocorre ou que é crime/permitido será ERRADA.
    statement = cleanF;
    if (/^é permitid[ao]/i.test(statement)) {
      statement = statement.replace(/^é permitid[ao]/i, 'É permitida');
    } else if (/^o usuário/i.test(statement)) {
      statement = `${statement}, nos termos da legislação de regência`;
    }
    statement = `${statement}.`;
    isCerto = false;
  } else if (isAffirmativeAnswer) {
    const detail = cleanB.replace(/^sim[!.]?\s*/i, '').trim();
    statement = `${cleanF}, uma vez que ${detail.charAt(0).toLowerCase() + detail.slice(1)}`;
    if (!statement.endsWith('.')) statement += '.';
    isCerto = true;
  } else {
    // Para as demais, balanceia determinísticamente 50% CERTO e 50% ERRADO
    const shouldBeErrado = cardIndex % 2 === 1;
    const coreAns = formatCleanAnswer(cleanB);

    const questionMatch = cleanF.match(/^(qual é|qual a|quais são|quem é|o que é|o que diz|em que consiste)\s+(.*)/i);

    if (questionMatch) {
      const subjectTopic = questionMatch[2].trim();
      const capitalizedTopic = subjectTopic.charAt(0).toUpperCase() + subjectTopic.slice(1);

      if (!shouldBeErrado) {
        statement = `${capitalizedTopic} compreende: ${coreAns}`;
        isCerto = true;
      } else {
        let distractorAns = coreAns;
        if (distractorAns.includes('CONTRAN')) distractorAns = distractorAns.replace(/CONTRAN/g, 'CETRAN');
        else if (distractorAns.includes('10 anos')) distractorAns = distractorAns.replace(/10 anos/g, '15 anos');
        else if (distractorAns.includes('5 anos')) distractorAns = distractorAns.replace(/5 anos/g, '2 anos');
        else if (distractorAns.includes('3 anos')) distractorAns = distractorAns.replace(/3 anos/g, '1 ano');
        else if (distractorAns.includes('ex tunc')) distractorAns = distractorAns.replace(/ex tunc/g, 'ex nunc (não retroativos)');
        else if (distractorAns.includes('obrigatório')) distractorAns = distractorAns.replace(/obrigatório/gi, 'facultativo');
        else if (distractorAns.includes('Gravíssima (7 pontos)')) distractorAns = distractorAns.replace('Gravíssima (7 pontos)', 'Gravíssima (10 pontos)');
        else if (distractorAns.includes('NUNCA')) distractorAns = distractorAns.replace(/NUNCA/g, 'sempre mediante autorização bilateral');
        else if (distractorAns.includes('União')) distractorAns = distractorAns.replace(/União/g, 'dos Municípios exclusivamente');
        else {
          distractorAns = `competência privativa e exclusiva dos municípios, inexistindo normatização federal aplicável`;
        }
        statement = `${capitalizedTopic} compreende: ${distractorAns}`;
        isCerto = false;
      }
    } else {
      if (!shouldBeErrado) {
        statement = `${cleanF}: ${coreAns}`;
        isCerto = true;
      } else {
        let altered = coreAns;
        if (altered.includes('obrigatório')) altered = altered.replace(/obrigatório/gi, 'mera faculdade discricionária');
        else if (altered.includes('independe')) altered = altered.replace(/independe/gi, 'depende de prévia autorização judicial');
        else if (altered.includes('vedado')) altered = altered.replace(/vedado/gi, 'expressamente autorizado');
        else altered = `circunstância revogada pela jurisprudência pacífica dos tribunais superiores.`;
        statement = `${cleanF}: ${altered}`;
        isCerto = false;
      }
    }

    if (!statement.endsWith('.')) statement += '.';
  }

  // Preâmbulo clássico de concurso
  const preambles = [
    `No que se refere a ${discipline} (${topic}), julgue o item a seguir:`,
    `Acerca dos preceitos de ${discipline}, julgue o item subseqüente com base na disciplina de ${topic}:`,
    `Considerando as disposições normativas e jurisprudenciais relativas a ${topic}, julgue o item:`,
    `A respeito de ${discipline}, especialmente no tocante a ${topic}, julgue o item a seguir:`
  ];
  const preamble = preambles[cardIndex % preambles.length];

  const fullText = `${preamble}\n\n${statement}`;

  const alternatives: Alternative[] = [
    {
      id: 'alt-c',
      text: 'Certo',
      isCorrect: isCerto
    },
    {
      id: 'alt-e',
      text: 'Errado',
      isCorrect: !isCerto
    }
  ];

  const gabaritoText = isCerto ? 'CERTO' : 'ERRADO';
  const explanation = `**Gabarito Oficial: ${gabaritoText}**\n\n**Fundamentação e Justificativa Ápice Concursos:**\n${cleanB}`;

  return { text: fullText, alternatives, explanation };
}

/**
 * Converte um flashcard em uma questão de Múltipla Escolha (A, B, C, D, E)
 */
function createMultipleChoiceQuestion(
  front: string,
  back: string,
  discipline: string,
  topic: string,
  cardIndex: number
): { text: string; alternatives: Alternative[]; explanation: string } {
  const cleanF = front.trim().replace(/\?+$/, '').trim();
  const cleanB = back.trim();

  const preamble = `Considerando os conhecimentos acerca de ${discipline} (${topic}), assinale a opção correta:\n\n${cleanF}?`;

  // Resposta correta com texto limpo e completo
  const correctText = formatCleanAnswer(cleanB);

  // Gerador de distratores de alta qualidade baseados na disciplina
  const distractorsPool = getDistractorsForDiscipline(discipline, cleanB, cardIndex);

  // Seleciona 4 distratores
  const rawDistractors = distractorsPool.slice(0, 4);

  // Posição correta variando entre A (0), B (1), C (2), D (3), E (4)
  const correctPos = cardIndex % 5;

  const altsList: string[] = [];
  let distIndex = 0;
  for (let pos = 0; pos < 5; pos++) {
    if (pos === correctPos) {
      altsList.push(correctText);
    } else {
      altsList.push(rawDistractors[distIndex] || `Nenhuma das demais alternativas apresenta conformidade estrita com as normas de ${topic}.`);
      distIndex++;
    }
  }

  const alternatives: Alternative[] = altsList.map((altText, idx) => ({
    id: `alt-${idx + 1}`,
    text: altText,
    isCorrect: idx === correctPos
  }));

  const correctLetter = String.fromCharCode(65 + correctPos);
  const explanation = `**Gabarito Oficial: Letra ${correctLetter}**\n\n**Comentário do Professor (Ápice Concurso):**\n${cleanB}`;

  return { text: preamble, alternatives, explanation };
}

/**
 * Gera distratores contextuais de concurso para múltipla escolha
 */
function getDistractorsForDiscipline(discipline: string, correctBack: string, index: number): string[] {
  const d = discipline.toLowerCase();

  if (d.includes('trânsito') || d.includes('ctb')) {
    return [
      'CETRAN (Conselho Estadual de Trânsito), dotado de atribuições exclusivamente recursais no Distrito Federal.',
      'Polícia Rodoviária Federal, exercendo atribuições de normatização e julgamento em instância final.',
      'Departamento Estadual de Trânsito (DETRAN), de competência normativa máxima sobre o Código de Trânsito.',
      'Conselho de Trânsito do Distrito Federal (CONTRANDIFE), com atribuições restritas a vias municipais.',
      'Secretaria Nacional de Trânsito (SENATRAN), que substitui integralmente a competência consultiva dos conselhos.'
    ];
  }

  if (d.includes('constitucional')) {
    return [
      'Trata-se de garantia de aplicação restrita aos brasileiros natos, sendo vedada a extensão aos estrangeiros residentes.',
      'Depende de prévia e expressa autorização do Congresso Nacional para surtir efeitos jurídicos válidos.',
      'Possui eficácia estritamente contida, admitindo revogação sumária por decreto regulamentar do Executivo.',
      'Configura competência delegável entre União, Estados e Municípios mediante simples portaria interministerial.',
      'Submete-se à cláusula de reserva do possível em qualquer hipótese de sua invocação judicial.'
    ];
  }

  if (d.includes('administrativo')) {
    return [
      'Aplica-se unicamente mediante autorização judicial prévia, sendo vedada a autoexecutoriedade da Administração.',
      'Gera efeitos meramente prospectivos (ex nunc), não alcançando situações jurídicas pretéritas constituídas.',
      'É de competência discricionária exclusiva do Poder Legislativo, incabível a revisão no âmbito do Poder Executivo.',
      'Configura hipótese de revogação por conveniência e oportunidade, resguardados os atos ilegais já consolidados.',
      'Admite delegação a pessoas jurídicas de direito privado com fins lucrativos sem qualquer restrição.'
    ];
  }

  if (d.includes('penal') || d.includes('processual')) {
    return [
      'Exige representação da vítima no prazo decadencial improrrogável de trinta dias como condição de procedibilidade.',
      'Constitui crime preterdoloso que admite a modalidade culposa quando ausente a comprovação do dolo direto.',
      'Submete-se ao rito sumário com possibilidade de suspensão condicional do processo mesmo aos reincidentes.',
      'Acarreta a extinção imediata da punibilidade independentemente de homologação perante a autoridade judicial.',
      'Exige prova pericial indispensável, cuja falta não poderá ser suprida pela prova testemunhal ou confissão.'
    ];
  }

  if (d.includes('informática')) {
    return [
      'Configura protocolo de enlace que opera exclusivamente na camada física do modelo de referência OSI.',
      'Exige chave criptográfica assimétrica pública compartilhada sem mecanismo de integridade por hash.',
      'Opera por meio de portas UDP padrão sem estabelecimento prévio de handshake de três vias (three-way handshake).',
      'Impede qualquer ataque de phishing mediante simples desativação de cookies no navegador do cliente.',
      'Armazena credenciais em texto simples em cache volátil sem verificação de certificados SSL/TLS.'
    ];
  }

  if (d.includes('português')) {
    return [
      'A oração classifica-se como subordinada adverbial causal, exigindo vírgula obrigatória em qualquer colocação.',
      'O pronome em destaque exerce a função sintática de adjunto adnominal restritivo com regência nominal reflexiva.',
      'Ocorre caso de crase facultativa em virtude de anteceder termo masculino plural com sentido genérico.',
      'A concordância verbal estabelece-se exclusivamente com o núcleo do adjunto adverbial anteposto.',
      'Apresenta desvio gramatical por incorreção no emprego do conectivo subordinativo integrante.'
    ];
  }

  // Genéricos de concurso
  return [
    'Aplica-se unicamente aos casos expressamente previstos em regulamento interno, sem amparo constitucional.',
    'Depende de homologação prévia pelo Tribunal de Contas da União para alcançar plena eficácia jurídica.',
    'Trata-se de procedimento facultativo, cabendo ao agente público definir a sua conveniência no caso concreto.',
    'Exige contraditório e ampla defesa diferidos, vedada a adoção de medidas cautelares urgentes.',
    'Encontra-se revogado tacitamente por legislação posterior que disciplina inteiramente a matéria correlata.'
  ];
}

/**
 * Função mestre: converte todos os flashcards dos pacotes (atuais e futuros)
 * em questões de concurso com as exigências especificadas pelo usuário:
 * - Originais da Ápice Concurso
 * - Banca: "Inéditas Ápice Concurso"
 * - Ano: 2026
 * - Órgão: "Ápice Concurso"
 * - Dificuldade balanceada
 * - Alternativas formatadas (Certo/Errado ou A, B, C, D, E)
 * - Identificador único
 * - Etiqueta isInedita = true
 */
export function generateQuestionsFromPacks(packs: FlashcardPackItem[]): Question[] {
  if (!packs || !Array.isArray(packs)) return [];

  const questions: Question[] = [];
  let globalIndex = 0;

  for (const pack of packs) {
    if (!pack || !Array.isArray(pack.flashcards)) continue;

    pack.flashcards.forEach((card, cardIndex) => {
      globalIndex++;

      const { discipline, topic } = mapSubjectToDisciplineAndTopic(card.subject, card.front, card.back);

      // Alterna entre Certo/Errado e Múltipla Escolha (~60% Certo/Errado, ~40% Múltipla Escolha)
      // Concursos policiais (PRF/PF) têm forte predominância de Certo/Errado estilo Cebraspe
      const isMultipleChoice = cardIndex % 5 === 2 || cardIndex % 5 === 4;
      const questionType = isMultipleChoice ? QuestionType.MULTIPLE_CHOICE : QuestionType.TRUE_FALSE;

      let questionContent: { text: string; alternatives: Alternative[]; explanation: string };

      if (questionType === QuestionType.TRUE_FALSE) {
        questionContent = createTrueFalseQuestion(card.front, card.back, discipline, topic, cardIndex);
      } else {
        questionContent = createMultipleChoiceQuestion(card.front, card.back, discipline, topic, cardIndex);
      }

      // Nível de dificuldade balanceado
      let difficulty = Difficulty.MEDIUM;
      if (globalIndex % 5 === 0) {
        difficulty = Difficulty.HARD;
      } else if (globalIndex % 4 === 0) {
        difficulty = Difficulty.EASY;
      }

      // Código padrão oficial: AC seguido de números sequenciais (ex: AC20001, AC20002...)
      const questionId = `AC${20000 + globalIndex}`;

      const question: Question = {
        id: questionId,
        text: questionContent.text,
        discipline,
        topic,
        board: 'Inéditas Ápice Concurso',
        year: 2026,
        orgao: 'Ápice Concurso',
        cargo: 'Questão Inédita',
        difficulty,
        type: questionType,
        alternatives: questionContent.alternatives,
        explanation: questionContent.explanation,
        createdAt: 1773187200000 + globalIndex * 1000, // 2026 timestamp
        // Propriedades especiais
        isInedita: true,
        isApiceOriginal: true,
        sourcePackId: pack.id
      };

      questions.push(question);
    });
  }

  return questions;
}

/**
 * Instância estática pré-calculada das questões a partir de AVAILABLE_PACKS
 */
export const apicePackQuestions: Question[] = generateQuestionsFromPacks(AVAILABLE_PACKS as any);
