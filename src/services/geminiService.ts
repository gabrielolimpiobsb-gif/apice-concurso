import { Question, Performance, DisciplineStats } from "../types";
import { dbService } from "./dbService";
import { auth } from "../lib/firebase";

const callGeminiProxy = async (endpoint: string, body: any) => {
  try {
    // We now allow guest requests to the proxy (optional auth)
    const user = auth.currentUser;
    let idToken = null;
    
    if (user) {
      idToken = await user.getIdToken().catch(() => null);
    }
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { "Authorization": `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Serviço de IA Indisponível (404). Se você exportou o app para uma plataforma estática (Netlify/Vercel), certifique-se de configurar o backend (server.ts) como Functions.");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro na comunicação com o servidor (${response.status})`);
    }

    return response.json();
  } catch (err: any) {
    console.error("Fetch Error:", err);
    if (err.message.includes("Failed to fetch") || err.message.includes("Load failed")) {
      throw new Error("Erro de Conexão: Não foi possível alcançar o servidor de IA. Verifique se o backend está rodando.");
    }
    throw err;
  }
};

const handleAIError = (error: any) => {
  console.warn("AI Error handled:", error);
  const errMsg = String(error?.message || "");
  if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("exceeded your current quota") || error?.status === 429 || errMsg.includes("429") || errMsg.includes("esgotaram a cota")) {
    return "Atingimos temporariamente o limite de requisições da IA. Exibindo conteúdo técnico oficial.";
  }
  if (errMsg.includes("GEMINI_API_KEY is not defined")) {
    return "A chave da API Gemini não foi configurada no servidor. Exibindo conteúdo técnico oficial.";
  }
  return `Modo offline ativo: ${error.message || "Serviço temporariamente indisponível"}`;
};

export const geminiService = {
  async explainQuestion(question: Question): Promise<string> {
    const buildFallbackExplanation = () => {
      const correctAlt = question.alternatives.find(a => a.isCorrect);
      const isTrueFalse = question.type === 'true_false' || question.alternatives.length === 2;
      
      let alternativesText = '';
      if (!isTrueFalse) {
        alternativesText = `\n\n#### Análise das Alternativas:\n` + 
          question.alternatives.map((a, i) => {
            const letter = String.fromCharCode(65 + i);
            return `* **${letter}) ${a.text}** — ${a.isCorrect ? '✅ **GABARITO OFICIAL**' : '❌ Incorreta'}`;
          }).join('\n');
      }

      return `### 📚 Gabarito Comentado Oficial

**Disciplina:** ${question.discipline || 'Geral'}  
**Assunto:** ${question.topic || 'Concurso Público'}  
**Banca:** ${question.board || 'Banca Examinadora'} (${question.year || 2026})  

---

#### ✅ Resposta Correta:
**${correctAlt ? correctAlt.text : 'Gabarito Oficial'}**

#### 📖 Fundamentação Técnica:
${question.explanation || 'Item gabaritado rigorosamente de acordo com a legislação, súmulas e jurisprudência pacífica aplicável ao concurso.'}${alternativesText}

---
*💡 Dica Ápice: O gabarito oficial com fundamentação técnica está sempre ativo para acelerar sua preparação.*`;
    };

    const pdfText = await dbService.getCombinedPDFText();
    let pdfContext = "";
    if (pdfText) {
      pdfContext = `\n\nConsidere também os seguintes materiais de referência extraídos de PDFs do usuário:\n${pdfText}\n\n`;
    }

    const prompt = `
      Você é um professor especialista em concursos públicos no Brasil.
      Explique de forma didática e profunda a seguinte questão:
      
      Banca: ${question.board}
      Matéria: ${question.discipline}
      Assunto: ${question.topic}
      Texto da Questão: ${question.text}
      
      Alternativas:
      ${question.alternatives.map((a, i) => `${String.fromCharCode(65 + i)}) ${a.text} ${a.isCorrect ? '(CORRETA)' : ''}`).join('\n')}
      ${pdfContext}
      A explicação deve abordar por que a correta está certa e por que as outras estão erradas, citando legislação ou jurisprudência se aplicável.
      Use Markdown para formatar.
    `;

    try {
      const data = await callGeminiProxy("/api/gemini/generate", {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      return data.text || buildFallbackExplanation();
    } catch (error) {
      console.warn("AI explain fallback activated due to:", error);
      return buildFallbackExplanation();
    }
  },

  async generateFlashcard(question: Question): Promise<{ frente: string, verso: string } | null> {
    const fallbackFlashcard = () => {
      const correctAlt = question.alternatives.find(a => a.isCorrect);
      let frente = "";
      let verso = "";

      const cleanText = (question.text || '').replace(/\s+/g, ' ').trim();
      const isTrueFalse = question.type === 'true_false' || question.alternatives.length === 2;

      if (isTrueFalse) {
        frente = `[${question.discipline || 'Concurso'}] Julgue o item:\n"${cleanText}"`;
        const isCerto = (correctAlt?.text || '').toLowerCase().includes('certo');
        verso = isCerto 
          ? `CORRETO.\n\nFundamentação:\n${question.explanation || 'Item em conformidade com o gabarito oficial e a legislação vigente.'}` 
          : `ERRADO.\n\nFundamentação:\n${question.explanation || 'Item incorreto de acordo com o gabarito oficial e a legislação vigente.'}`;
      } else {
        frente = `[${question.discipline || 'Concurso'} - ${question.topic || 'Geral'}]\n${cleanText}`;
        verso = `Gabarito: ${correctAlt ? correctAlt.text : 'Alternativa correta'}\n\nExplicação:\n${question.explanation || 'Conforme as disposições legais aplicáveis à matéria.'}`;
      }

      return { frente, verso };
    };

    const prompt = `Gere o flashcard para a questão abaixo:
Tipo: ${question.type === 'multiple_choice' ? 'Múltipla Escolha' : 'Certo/Errado'}
Enunciado: ${question.text}
Alternativas: ${question.alternatives.map((a, i) => `${String.fromCharCode(65 + i)}) ${a.text}`).join(', ')}
Gabarito Correto: ${question.alternatives.find(a => a.isCorrect)?.text}

Responda única e exclusivamente com um objeto JSON no formato:
{ "frente": "...", "verso": "..." }`;

    const systemPrompt = `Você é uma API. Não inclua saudações, explicações ou formatação markdown (como \`\`\`json). A sua resposta deve ser única e exclusivamente um objeto JSON válido.
Foco no Fato Objetivo: O flashcard deve focar na regra, conceito, lei ou fórmula central testada na questão. 
Proibido Interpretação de Texto: É estritamente proibido gerar flashcards que dependam da leitura de textos de apoio, contos ou interpretação de cenários narrativos. O flashcard deve ser 100% autossuficiente.
Tratamento de Certo/Errado: Se for CERTO: Transforme o conceito em pergunta na Frente e confirme no Verso. Se for ERRADO: Identifique a pegadinha, formule a pergunta na Frente e traga a correção no Verso.
Tratamento de Múltipla Escolha: Ignore completamente os distratores (erradas). Junte a pergunta do enunciado com a alternativa CORRETA para formular um par direto.`;

    try {
      const data = await callGeminiProxy("/api/gemini/generate", {
        contents: [{ role: "user", parts: [{ text: systemPrompt + '\n\n' + prompt }] }]
      });
      
      let text = data.text || "";
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const json = JSON.parse(text);
      if (json && json.frente && json.verso) {
        return json;
      }
      return fallbackFlashcard();
    } catch (error: any) {
      console.warn('AI unavailable for flashcard, generating automatically from question:', error);
      return fallbackFlashcard();
    }
  },

  async generateFlashcardFromComment(commentText: string, questionContext: string, type: 'qa' | 'concept' | 'true_false' | 'fill_gap'): Promise<string> {
    const fallbackCommentFlashcard = () => {
      const cleanComment = (commentText || '').trim();
      let frente = "";
      let verso = cleanComment;
      if (type === 'concept') {
        frente = `Qual é o conceito ou regra chave abordado no trecho abaixo?`;
      } else if (type === 'true_false') {
        frente = `Julgue a afirmação extraída dos comentários:\n"${cleanComment.slice(0, 180)}..."`;
        verso = `Gabarito / Fundamentação:\n${cleanComment}`;
      } else if (type === 'fill_gap') {
        frente = `Complete o conceito destacado:\n${cleanComment.slice(0, 100)}... (_____)`;
        verso = cleanComment;
      } else {
        frente = `Ponto chave de estudo (${questionContext ? questionContext.slice(0, 80) + '...' : 'Questão'}):`;
      }
      return JSON.stringify({ frente, verso });
    };

    let typeInstructions = "";
    if (type === 'qa') {
      typeInstructions = "Tipo: Pergunta e Resposta. Frente: Uma pergunta baseada no trecho. Verso: A resposta direta e clara.";
    } else if (type === 'concept') {
      typeInstructions = "Tipo: Conceito. Frente: O termo ou conceito principal isolado. Verso: O significado ou a explicação do termo.";
    } else if (type === 'true_false') {
      typeInstructions = "Tipo: Verdadeiro ou Falso. Frente: Uma afirmação com base no trecho. Verso: 'Verdadeiro' ou 'Falso', acompanhado de uma breve justificativa se for Falso.";
    } else if (type === 'fill_gap') {
      typeInstructions = "Tipo: Completar Lacuna. Frente: Uma frase com uma ou mais palavras chave omitidas (substituídas por _____). Verso: A(s) palavra(s) que preenche(m) a lacuna.";
    }

    const prompt = `
Contexto da Questão Original (apenas para entender do que se trata):
${questionContext}

Trecho do Comentário do Usuário (CONTEÚDO PRINCIPAL PARA O FLASHCARD):
"${commentText}"

A partir do trecho do comentário acima, crie um flashcard de alta qualidade seguindo ESTE FORMATO ESPECÍFICO:
${typeInstructions}

Responda ÚNICA E EXCLUSIVAMENTE com um objeto JSON válido no formato:
{
  "frente": "A frente do flashcard...",
  "verso": "O verso do flashcard..."
}
NÃO adicione \`\`\`json no começo, nem texto extra, APENAS O JSON VÁLIDO.
    `;

    try {
      const data = await callGeminiProxy("/api/gemini/generate", {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      if (data.text) {
        let text = data.text.replace(/```json/g, "").replace(/```/g, "").trim();
        JSON.parse(text); // validate
        return text;
      }
      return fallbackCommentFlashcard();
    } catch (error) {
      console.warn('AI unavailable for comment flashcard, using fallback:', error);
      return fallbackCommentFlashcard();
    }
  },

  async diagnosePatterns(questions: Question[], performance: Performance[]): Promise<string> {
    if (questions.length === 0 || performance.length === 0) {
      return "Dados insuficientes para diagnóstico. Resolva algumas questões primeiro.";
    }

    const total = performance.length;
    const correct = performance.filter(p => p.isCorrect).length;
    const accuracy = Math.round((correct / total) * 100);

    const buildFallbackDiagnosis = () => {
      // Group by discipline
      const disciplineMap: Record<string, { total: number; correct: number }> = {};
      performance.forEach(p => {
        const q = questions.find(item => item.id === p.questionId);
        const disc = q?.discipline || p.discipline || 'Geral';
        if (!disciplineMap[disc]) disciplineMap[disc] = { total: 0, correct: 0 };
        disciplineMap[disc].total++;
        if (p.isCorrect) disciplineMap[disc].correct++;
      });

      const disciplines = Object.entries(disciplineMap).map(([name, data]) => ({
        name,
        total: data.total,
        pct: Math.round((data.correct / data.total) * 100)
      })).sort((a, b) => b.pct - a.pct);

      const best = disciplines[0];
      const worst = disciplines[disciplines.length - 1];

      return `### 📊 Diagnóstico Estratégico de Desempenho

**Aproveitamento Global:** ${accuracy}% (${correct} acertos em ${total} resoluções)

---

#### 🌟 Ponto Forte
${best ? `* **${best.name}:** ${best.pct}% de precisão em ${best.total} questões.` : 'Continue resolvendo para mapear seus pontos fortes.'}

#### ⚠️ Matéria de Atenção Imediata
${worst && worst.pct < 70 ? `* **${worst.name}:** ${worst.pct}% de aproveitamento (${worst.total} questões). Recomendamos priorizar a revisão das teorias e resolver baterias focadas.` : 'Seu rendimento está equilibrado em todas as disciplinas estudadas.'}

#### 🎯 Diretrizes de Estudo Ápice:
1. **Revisão Ativa:** Crie flashcards das questões que você errou para retenção no longo prazo.
2. **Foco no Erro:** Refaça as questões erradas a cada 3 dias para eliminar pontos cegos.
3. **Manutenção:** Mantenha baterias curtas diárias de 15 a 20 questões para manter a velocidade de resolução.`;
    };

    const dataSnapshot = performance.map(p => {
      const q = questions.find(q => q.id === p.questionId);
      return {
        discipline: q?.discipline,
        topic: q?.topic,
        board: q?.board,
        isCorrect: p.isCorrect
      };
    });

    const prompt = `
      Analise os padrões de desempenho deste estudante de concursos:
      
      Dados de desempenho:
      ${JSON.stringify(dataSnapshot)}
      
      Identifique:
      1. Quais bancas o usuário tem mais dificuldade.
      2. Quais matérias precisam de mais atenção.
      3. Padrões de "pegadinhas" que o usuário costuma cair (se possível inferir).
      4. Recomendações estratégicas de estudo.
      
      Responda em Português de forma profissional e motivadora. Use Markdown.
    `;

    try {
      const data = await callGeminiProxy("/api/gemini/generate", {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      return data.text || buildFallbackDiagnosis();
    } catch (error) {
      console.warn("AI diagnosePatterns fallback activated:", error);
      return buildFallbackDiagnosis();
    }
  },

  async diagnosePerformance(stats: DisciplineStats[]): Promise<string> {
    if (stats.length === 0) {
      return "Você ainda não respondeu nenhuma questão para gerarmos seu diagnóstico.";
    }

    const buildFallbackStatReport = () => {
      const mapped = stats.map(s => ({
        name: s.discipline,
        total: s.total,
        correct: s.correct,
        incorrect: s.incorrect,
        accuracy: s.total > 0 ? (s.correct / s.total) * 100 : 0
      }));
      const sorted = [...mapped].sort((a, b) => b.accuracy - a.accuracy);
      const best = sorted[0];
      const needsReview = sorted.filter(s => s.accuracy < 65);

      return `### 🎯 Diagnóstico Analítico de Estudos

**Panorama Geral:**
${best ? `Seu principal destaque é **${best.name}** com **${Math.round(best.accuracy)}%** de aproveitamento.` : ''}

#### 🔍 Matérias que requerem Reforço:
${needsReview.length > 0 
  ? needsReview.map(s => `- **${s.name}:** ${Math.round(s.accuracy)}% (${s.incorrect} erros). Focar em questões comentadas e lei seca.`).join('\n')
  : '- Excelente! Todas as suas matérias analisadas estão com aproveitamento acima de 65%.'}

#### 📌 Recomendações de Ação:
* Intercale a teoria com resolução diária de questões inéditas da banca.
* Transforme as questões erradas em flashcards para fixação no ciclo espaçado.`;
    };

    const prompt = `
      Analise o seguinte desempenho de um concurseiro agrupado por matéria. 
      Os dados mostram o total de questões resolvidas, corretas e incorretas por matéria.
      
      Estatísticas:
      ${JSON.stringify(stats)}
      
      Elabore um diagnóstico curto e encorajador com:
      1. Sua avaliação geral do momento do aluno (ex: iniciante, competitivo).
      2. Pontos Fortes (se houver).
      3. Matérias de alerta onde ele precisa focar.
      
      Use formato Markdown com listas curtas. Máximo de 3 a 4 parágrafos pequenos.
    `;

    try {
      const data = await callGeminiProxy("/api/gemini/generate", {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      return data.text || buildFallbackStatReport();
    } catch (error) {
      console.warn("AI diagnosePerformance fallback activated:", error);
      return buildFallbackStatReport();
    }
  }
};
