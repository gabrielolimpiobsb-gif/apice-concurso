import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Layers, CheckCircle2, Save, FileText, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { storageService } from '../services/storageService';
import { QuestionTextFormatter } from './QuestionTextFormatter';
import { geminiService } from '../services/geminiService';
import { Loader2, Sparkles } from 'lucide-react';
import { Question } from '../types';

interface CreateFlashcardFromQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlashcardCreated?: () => void;
  initialSubject: string;
  initialTopic: string;
  questionId: string;
  questionText: string;
  question: Question;
  initialFront?: string;
  initialBack?: string;
}

export function CreateFlashcardFromQuestionModal({
  isOpen,
  onClose,
  onFlashcardCreated,
  initialSubject,
  initialTopic,
  questionId,
  questionText,
  question,
  initialFront = '',
  initialBack = ''
}: CreateFlashcardFromQuestionModalProps) {

  const [subject, setSubject] = useState(initialSubject || '');
  const [topic, setTopic] = useState(initialTopic || '');
  
  const [front, setFront] = useState(initialFront);
  const [back, setBack] = useState(initialBack);
  
  const [isQuestionTextExpanded, setIsQuestionTextExpanded] = useState(false);
  
  React.useEffect(() => {
    if (isOpen) {
      setFront(initialFront);
      setBack(initialBack);
      setSubject(initialSubject || '');
      setTopic(initialTopic || '');
      setIsQuestionTextExpanded(false);
      setIsSaved(false);
      setIsSaving(false);
    }
  }, [isOpen, initialFront, initialBack, initialSubject, initialTopic]);
  
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  
  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const generated = await geminiService.generateFlashcard(question);
      if (generated) {
         setFront(generated.frente);
         setBack(generated.verso);
      }
    } catch (e: any) {
      alert("Erro ao gerar flashcard: " + e.message);
    }
    setIsGenerating(false);
  };

  const handleSave = async () => {
   try {
     if (!(front || '').trim() || !(back || '').trim()) {
        alert("Preencha a Frente e o Verso do flashcard.");
        return;
     }
     
     if (isSaving || isSaved) return;
     setIsSaving(true);
     
     const flashcardData = {
        id: `man-fc-${Date.now()}`,
        front: (front || '').trim(),
        back: (back || '').trim(),
        subject: subject || 'Geral',
        topic: topic || 'Geral',
        source: 'manual',
        sourceQuestionId: questionId,
        createdAt: Date.now()
     };
     
     storageService.saveFlashcard(flashcardData);
     
     import('../services/firebaseStorageService').then(({ firebaseStorageService }) => {
       firebaseStorageService.saveFlashcard(flashcardData).catch(e => console.warn(e));
     });
     setIsSaved(true);
     setIsSaving(false);
     if (onFlashcardCreated) onFlashcardCreated();
     onClose();
     setTimeout(() => { setIsSaved(false); setFront(''); setBack(''); }, 300);
   } catch (e: any) { console.warn('Erro inesperado: ' + e.message); setIsSaving(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#0a2346] border border-purple-500/20 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
      >
         <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Layers size={200} />
         </div>

         <div className="flex items-center justify-between p-6 md:p-8 border-b border-black/5 dark:border-white/5 relative z-10 shrink-0">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-2xl flex items-center justify-center text-purple-500 shadow-inner border border-purple-500/10">
                 <Layers size={24} />
               </div>
               <div>
                 <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white tracking-tight">Criar Flashcard</h2>
                 <p className="text-xs text-purple-500/80 font-bold uppercase tracking-widest mt-1">A partir da Questão</p>
               </div>
            </div>
            
            <div className="flex items-center gap-2">
               <button
                 onClick={handleGenerateAI}
                 disabled={isGenerating}
                 className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-white px-3 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
               >
                 {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                 <span className="hidden sm:inline">Gerar Automático</span>
               </button>
               <button 
                 onClick={onClose}
                 className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black dark:text-black/40 dark:text-white/40 hover:text-black dark:text-white hover:bg-black/10 dark:bg-white/10 transition-colors"
               >
                 <X size={20} />
               </button>
            </div>

         </div>

         <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-visible relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-black dark:text-black/60 dark:text-white/60 pl-2">Disciplina</label>
                 <input 
                   value={subject}
                   onChange={(e) => setSubject(e.target.value)}
                   className="w-full bg-[#f9fafc] dark:bg-[#01142e] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-3.5 text-sm text-black dark:text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 transition-all font-medium"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-black dark:text-black/60 dark:text-white/60 pl-2">Assunto</label>
                 <input 
                   value={topic}
                   onChange={(e) => setTopic(e.target.value)}
                   className="w-full bg-[#f9fafc] dark:bg-[#01142e] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-3.5 text-sm text-black dark:text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 transition-all font-medium"
                 />
              </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center gap-2 text-xs font-bold text-white pl-2 border border-purple-500/20 bg-purple-500/10 p-3 rounded-xl">
                  <Info size={16} className="shrink-0" /> 
                  <span><strong>Dica:</strong> O texto da questão pode ser visualizado abaixo. Copie a parte que deseja memorizar e cole na <strong className="text-amber-400">Frente</strong> do flashcard. O <strong>Verso</strong> já foi preenchido com a resposta correta!</span>
               </div>
               
               <button 
                 onClick={() => setIsQuestionTextExpanded(!isQuestionTextExpanded)}
                 className="flex items-center justify-between w-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 transition-colors border border-black/5 dark:border-white/5 rounded-2xl p-4 text-sm text-black dark:text-black/70 dark:text-white/70 font-medium"
               >
                 <span className="flex items-center gap-2 text-xs font-bold text-black dark:text-black/80 dark:text-white/80">
                    <FileText size={16} className="text-black dark:text-white" /> Enunciado da Questão
                 </span>
                 {isQuestionTextExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
               </button>
               
               {isQuestionTextExpanded && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   className="w-full bg-black/5 dark:bg-white/5 border border-purple-500/20 rounded-2xl p-4 text-sm max-h-[160px] overflow-y-auto scrollbar-visible text-black dark:text-black/70 dark:text-white/70 italic leading-relaxed font-medium select-text"
                 >
                    <QuestionTextFormatter text={questionText} className="text-black dark:text-black/80 dark:text-white/80" />
                 </motion.div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-black/5 dark:border-white/5">
                 <div className="space-y-2">
                   <div className="w-full relative rounded-[30px] overflow-hidden shadow-2xl p-6 flex flex-col justify-center min-h-[220px]"
                        style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)", boxShadow: "0 20px 40px -10px rgba(29, 78, 216, 0.4), inset 0 2px 10px rgba(255,255,255,0.2)" }}>
                     <div className="absolute top-4 left-4 bg-black/10 dark:bg-white/10 text-black dark:text-white text-[10px] uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-lg border border-black/20 dark:border-white/20 shadow-sm backdrop-blur-md">
                       Frente
                     </div>
                     <textarea 
                       value={front}
                       onChange={e => setFront(e.target.value)}
                       className="w-full bg-transparent border-none text-black dark:text-white/90 text-xl font-bold leading-tight drop-shadow-md text-center focus:outline-none transition-all resize-none mt-8 placeholder-white/40 h-[100px]"
                       placeholder="Digite ou cole aqui..."
                     />
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                   <div className="w-full relative rounded-[30px] overflow-hidden shadow-2xl p-6 flex flex-col justify-center min-h-[220px]"
                        style={{ background: "linear-gradient(135deg, #0e7490 0%, #155e75 100%)", boxShadow: "0 20px 40px -10px rgba(14, 116, 144, 0.4), inset 0 2px 10px rgba(255,255,255,0.2)" }}>
                     <div className="absolute top-4 left-4 bg-black/10 dark:bg-white/10 text-black dark:text-white text-[10px] uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-lg border border-black/20 dark:border-white/20 shadow-sm backdrop-blur-md">
                       Verso
                     </div>
                     <textarea 
                       value={back}
                       onChange={e => setBack(e.target.value)}
                       className="w-full bg-transparent border-none text-black dark:text-white/90 text-lg font-bold leading-tight drop-shadow-md text-center focus:outline-none transition-all resize-none mt-8 placeholder-white/40 h-[100px]"
                       placeholder="Adicione a resposta..."
                     />
                   </div>
                 </div>
            </div>
         </div>

         <div className="p-6 md:p-8 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#0a2346] relative z-10 shrink-0">
             <button 
                onClick={handleSave}
                disabled={isSaved || isSaving}
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-center transition-all flex items-center justify-center gap-2 text-sm md:text-base",
                  isSaved 
                   ? "bg-emerald-500/20 text-black dark:text-white border border-emerald-500/30"
                   : isSaving
                   ? "bg-purple-500/50 text-white cursor-not-allowed"
                   : "bg-purple-500 hover:brightness-110 text-white shadow-[0_0_20px_rgba(84,172,191,0.2)]"
                )}
             >
               {isSaved ? <CheckCircle2 size={24} /> : <Save size={24} />}
               {isSaved ? 'Salvo no Baralho' : isSaving ? 'Salvando...' : 'Salvar no Baralho'}
             </button>
         </div>
      </motion.div>
    </div>
  );
}
