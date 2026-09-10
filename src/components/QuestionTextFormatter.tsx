import React from 'react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface QuestionTextFormatterProps {
  text: string;
  className?: string;
  type?: string; 
}

export const QuestionTextFormatter: React.FC<QuestionTextFormatterProps> = ({ text, className, type }) => {
  // Fix hard wraps: replace newlines that don't follow punctuation with spaces.
  const fixHardWraps = (input: string) => {
    // 1. Force a double newline after common instruction headers if they don't already have one
    let cleaned = input.replace(/^(Texto para[^\.]+\.)\s*(?=[A-Z])/gim, '$1\n\n');
    
    // Also separate the "Command" paragraph from the actual statement if they got squished.
    cleaned = cleaned.replace(/([\.\:\!])\s*(Julgue os itens|Assinale a|Com base|A respeito de|Em relação a)/gi, '$1\n\n$2');
    
    // 2. Replace newlines that don't follow punctuation with spaces.
    cleaned = cleaned.replace(/([^\.\:\!\?\>\]\)\}\n])\n(?!\n)/g, '$1 ');
    
    // 3. Replace single newlines that DO follow punctuation with double newlines
    cleaned = cleaned.replace(/([\.\:\!\?\>\]\)\}]|")\n(?!\n)/g, '$1\n\n');
    
    // 4. Clean up duplicate spaces
    cleaned = cleaned.replace(/ {2,}/g, ' ');
    
    return cleaned;
  };

  const processedText = fixHardWraps(text || "");
  const paragraphs = processedText.split(/\n\s*\n/).map(p => p.trim()).filter(p => p !== '');

  const isCommand = (block: string) => {
    const lower = block.toLowerCase();
    
    // Header for texts
    if (lower.startsWith('texto para') && block.length < 150) return true;
    
    const commandPhrases = ['julgue', 'assinale', 'marque', 'avalie', 'analise'];
    const triggerStarts = /^(com base|a respeito|em relação|considerando|no que|quanto a|sobre o|julgue|assinale|avalie|marque|analise)/i;
    
    // If it's a reasonably short block and contains command characteristics
    if (block.length < 350) {
      if (triggerStarts.test(block) && commandPhrases.some(c => lower.includes(c))) {
        return true;
      }
      
      // Strict exact match for some very short commands
      if (lower === 'julgue os itens a seguir.' || lower === 'assinale a alternativa correta.' || lower === 'julgue o item a seguir.') {
        return true;
      }
    }
    
    return false;
  };

  const renderBlock = (block: string, index: number) => {
    const blockIsCommand = isCommand(block);

    // Command / Instruction block
    if (blockIsCommand) {
      const isTextHeader = block.toLowerCase().startsWith('texto para');
      const title = isTextHeader ? 'Instrução' : 'Comando da Questão';
      
      return (
        <div key={index} className="px-5 py-4 bg-purple-500/10 border-l-4 border-purple-500 rounded-r-xl mb-6 shadow-sm">
          <p className="text-purple-500 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            {title}
          </p>
          <div className="text-black dark:text-white/95 text-[15px] md:text-base font-medium leading-relaxed">
            <ReactMarkdown>{block}</ReactMarkdown>
          </div>
        </div>
      );
    }

    // Quotes
    if (block.startsWith('"') || block.startsWith('“')) {
      return (
        <blockquote key={index} className="pl-6 py-4 my-6 italic border-l-[3px] border-amber-400 bg-amber-400/5 text-black dark:text-black/80 dark:text-white/80 rounded-r-lg text-lg leading-relaxed shadow-sm">
          <ReactMarkdown>{block}</ReactMarkdown>
        </blockquote>
      );
    }

    // Articles of Law
    if (block.match(/^(Art\.|Artigo\s+\d+)/i) || block.match(/^§\s*\d+/)) {
      return (
        <div key={index} className="font-serif px-5 py-4 my-6 bg-slate-800/40 border border-slate-700/50 rounded-lg text-slate-200 leading-relaxed shadow-sm">
          <ReactMarkdown>{block}</ReactMarkdown>
        </div>
      );
    }
    
    // Lists (Roman numerals or dashes)
    if (block.match(/^(I\.|II\.|III\.|IV\.|V\.|VI\.|VII\.|VIII\.|IX\.|X\.|-|\u2022)/)) {
      return (
        <div key={index} className="pl-4 my-5 border-l border-black/10 dark:border-white/10 text-black dark:text-white/85 leading-loose">
           <ReactMarkdown>{block}</ReactMarkdown>
        </div>
      );
    }
    
    // Default Paragraphs
    // If it's the very last paragraph and it's a True/False question, highlight it as the Statement to judge
    const isLastBlock = index === paragraphs.length - 1;
    const isTrueFalseComponent = type === 'true_false' || type === 'QuestionType.TRUE_FALSE';
    
    if (isLastBlock && isTrueFalseComponent && !blockIsCommand) {
      return (
        <div key={index} className="mt-8 px-5 py-5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-black dark:text-white font-semibold leading-loose text-base/7 md:text-lg/8 tracking-wide shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/20 dark:bg-white/20"></div>
          <ReactMarkdown>{block}</ReactMarkdown>
        </div>
      );
    }
    
    return (
      <div key={index} className="mb-6 text-black dark:text-white/90 leading-loose text-base/7 md:text-lg/8 tracking-wide">
        <ReactMarkdown>{block}</ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={cn("question-text-formatter break-words whitespace-pre-wrap font-sans", className)}>
      {paragraphs.map(renderBlock)}
    </div>
  );
};
