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
  console.error("AI Error Detailed:", error);
  const errMsg = String(error?.message || "");
  if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("exceeded your current quota") || error?.status === 429 || errMsg.includes("429")) {
    return "Atingimos o limite de uso da Inteligência Artificial. Por favor, aguarde o reset da cota ou configure uma chave de API própria nas configurações.";
  }
  if (errMsg.includes("GEMINI_API_KEY is not defined")) {
    return "A chave da API Gemini não foi configurada no servidor. Por favor, adicione sua chave nas configurações do projeto.";
  }
  return `Erro ao conectar com a IA: ${error.message || "Erro desconhecido"}`;
};

export const geminiService = {
  async explainQuestion(question: Question): Promise<string> {
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
      return data.text || "Não foi possível gerar a explicação.";
    } catch (error) {
      return handleAIError(error);
    }
  },

  async generateFlashcard(question: Question): Promise<{ frente: string, verso: string } | null> {
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
      return json;
    } catch (error: any) {
      console.error('Error generating flashcard:', error);
      throw new Error(handleAIError(error));
    }
  },

  async generateFlashcardFromComment(commentText: string, questionContext: string, type: 'qa' | 'concept' | 'true_false' | 'fill_gap'): Promise<string> {
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
      return data.text || "{}";
    } catch (error) {
      console.error('Error generating comment flashcard:', error);
      throw new Error(handleAIError(error));
    }
  },

  async diagnosePatterns(questions: Question[], performance: Performance[]): Promise<string> {
    if (questions.length === 0 || performance.length === 0) {
      return "Dados insuficientes para diagnóstico.";
    }

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
      return data.text || "Diagnóstico indisponível.";
    } catch (error) {
      return handleAIError(error);
    }
  },

  async diagnosePerformance(stats: DisciplineStats[]): Promise<string> {
    if (stats.length === 0) {
      return "Você ainda não respondeu nenhuma questão para gerarmos seu diagnóstico.";
    }

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
      return data.text || "Diagnóstico indisponível.";
    } catch (error) {
      return handleAIError(error);
    }
  }
};
