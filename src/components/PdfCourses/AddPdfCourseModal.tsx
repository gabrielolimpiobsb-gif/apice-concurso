import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Plus, Sparkles, Check, Cloud, Upload } from 'lucide-react';
import { PdfCourse } from '../../types';
import { pdfCourseService } from '../../services/pdfCourseService';

interface AddPdfCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseAdded: (newCourse: PdfCourse) => void;
}

const GRADIENT_OPTIONS = [
  { label: 'Ouro & Âmbar (PRF / Trânsito)', value: 'from-amber-600 via-yellow-600 to-amber-900', accent: '#f59e0b' },
  { label: 'Azul Real & Índigo (Constitucional / PF)', value: 'from-blue-700 via-indigo-700 to-slate-900', accent: '#3b82f6' },
  { label: 'Vermelho Nobre (Penal / Perícia)', value: 'from-red-800 via-rose-900 to-stone-950', accent: '#ef4444' },
  { label: 'Esmeralda & Teal (Português)', value: 'from-emerald-700 via-teal-800 to-slate-900', accent: '#10b981' },
  { label: 'Púrpura & Violeta (RLM / Lógica)', value: 'from-violet-700 via-purple-800 to-slate-900', accent: '#8b5cf6' },
  { label: 'Ciano & Oceano (Administrativo / Tribunais)', value: 'from-cyan-700 via-teal-800 to-slate-950', accent: '#06b6d4' },
  { label: 'Grafite & Cobre (Tributário / Fiscal)', value: 'from-amber-700 via-orange-800 to-stone-900', accent: '#d97706' },
];

export const AddPdfCourseModal: React.FC<AddPdfCourseModalProps> = ({
  isOpen,
  onClose,
  onCourseAdded
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [discipline, setDiscipline] = useState('Direito Constitucional');
  const [career, setCareer] = useState('Policial');
  const [targetExam, setTargetExam] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorTitle, setAuthorTitle] = useState('');
  const [totalPages, setTotalPages] = useState<number>(120);
  const [pdfUrl, setPdfUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_OPTIONS[0]);
  const [highlightsInput, setHighlightsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !discipline.trim()) return;

    setIsSubmitting(true);
    try {
      const courseId = `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const highlights = highlightsInput
        .split('\n')
        .map(h => h.trim())
        .filter(Boolean);

      const newCourse: PdfCourse = {
        id: courseId,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        discipline: discipline.trim(),
        career: career.trim(),
        targetExam: targetExam.trim() || 'Geral',
        author: {
          name: authorName.trim() || 'Equipe Pedagógica APSES',
          title: authorTitle.trim() || 'Especialista em Concursos Públicos',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
        },
        coverGradient: selectedGradient.value,
        coverAccentColor: selectedGradient.accent,
        totalPages: Number(totalPages) || 100,
        totalModules: 4,
        fileSizeMb: 12.0,
        pdfUrl: pdfUrl.trim(),
        description: description.trim() || 'Material teórico em PDF esquematizado para concursos públicos.',
        highlights: highlights.length > 0 ? highlights : [
          'Teoria esquematizada de alta densidade',
          'Jurisprudência e súmulas correlatas aplicadas',
          'Quadros sinópticos e resumos para fixação'
        ],
        tags: [discipline, career, targetExam].filter(Boolean),
        edition: '1ª Edição Nuvem 2024',
        publishedYear: 2024,
        rating: 5.0,
        ratingCount: 1,
        isPremium: false,
        isFeatured: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        modules: [
          {
            id: `mod_${courseId}_1`,
            title: 'Módulo 1: Fundamentos & Teoria Geral',
            order: 1,
            chapters: [
              {
                id: `cap_${courseId}_1`,
                title: 'Capítulo 1: Introdução e Conceitos Doutrinários',
                pageStart: 1,
                pageEnd: Math.round(totalPages / 3),
                durationMinutes: 45,
                summary: 'Visão geral da matéria, conceitos chave e diretrizes das bancas examinadoras.',
                contentSnippet: `Material didático em PDF adicionado à biblioteca digital.
Consulte as orientações e resolução de questões para fixação rápida deste tópico.`
              }
            ]
          }
        ]
      };

      await pdfCourseService.saveCourse(newCourse);
      onCourseAdded(newCourse);
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar curso em PDF:', error);
      alert('Erro ao salvar curso na nuvem. Verifique sua conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Adicionar Curso em PDF
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Cloud size={12} className="text-purple-500" /> Sincronizado na Nuvem (Firebase)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Title & Subtitle */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Título do Livro / Curso *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Direito Penal Esquematizado para a PRF"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 ring-purple-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Subtítulo Descritivo
            </label>
            <input
              type="text"
              placeholder="Ex: Teoria do Crime, Tipicidade e Jurisprudência Comentada"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 ring-purple-500 font-medium"
            />
          </div>

          {/* Row: Discipline, Career, Target Exam */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Disciplina *
              </label>
              <select
                value={discipline}
                onChange={e => setDiscipline(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 ring-purple-500 font-medium"
              >
                <option value="Direito Constitucional">Direito Constitucional</option>
                <option value="Direito Administrativo">Direito Administrativo</option>
                <option value="Direito Penal">Direito Penal</option>
                <option value="Legislação de Trânsito">Legislação de Trânsito</option>
                <option value="Língua Portuguesa">Língua Portuguesa</option>
                <option value="Raciocínio Lógico">Raciocínio Lógico</option>
                <option value="Informática">Informática</option>
                <option value="Direito Tributário">Direito Tributário</option>
                <option value="Direito Processual Penal">Direito Processual Penal</option>
                <option value="Direitos Humanos">Direitos Humanos</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Carreira *
              </label>
              <select
                value={career}
                onChange={e => setCareer(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 ring-purple-500 font-medium"
              >
                <option value="Policial">Policial (PF, PRF, PC, PM)</option>
                <option value="Fiscal">Fiscal & Controle (Receita, SEFAZ)</option>
                <option value="Administrativo">Administrativo & Tribunais</option>
                <option value="Geral">Geral (Todas as Carreiras)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Concurso Alvo
              </label>
              <input
                type="text"
                placeholder="Ex: PRF, PF, INSS..."
                value={targetExam}
                onChange={e => setTargetExam(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 ring-purple-500 font-medium"
              />
            </div>
          </div>

          {/* Row: Author Name, Author Title, Total Pages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Nome do Professor/Autor
              </label>
              <input
                type="text"
                placeholder="Ex: Prof. Carlos Mendes"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 ring-purple-500 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Titulação do Autor
              </label>
              <input
                type="text"
                placeholder="Ex: Delegado / Especialista"
                value={authorTitle}
                onChange={e => setAuthorTitle(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 ring-purple-500 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Total de Páginas
              </label>
              <input
                type="number"
                min={10}
                max={2000}
                value={totalPages}
                onChange={e => setTotalPages(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 ring-purple-500 font-medium"
              />
            </div>
          </div>

          {/* Cloud PDF URL Link */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30">
            <div className="flex items-center justify-between">
              <label className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <Cloud size={14} /> Link do Arquivo PDF na Nuvem (Firebase / Drive / CDN)
              </label>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Opcional</span>
            </div>
            <input
              type="url"
              placeholder="https://firebasestorage.googleapis.com/... ou link direto de PDF"
              value={pdfUrl}
              onChange={e => setPdfUrl(e.target.value)}
              className="w-full p-3 rounded-xl border border-purple-200 dark:border-purple-900 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 ring-purple-500 font-mono text-[11px]"
            />
            <p className="text-[10px] text-purple-700/80 dark:text-purple-300/80">
              Caso deixe em branco agora, o curso usará a visualização digital padrão com os capítulos e você poderá adicionar a URL do PDF a qualquer momento!
            </p>
          </div>

          {/* Cover Color Palette Picker */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Estilo da Capa do Livro Digital
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GRADIENT_OPTIONS.map((g, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedGradient(g)}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    selectedGradient.value === g.value
                      ? 'border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/30 dark:bg-purple-950/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-7 rounded-md bg-gradient-to-br ${g.value} shadow-xs shrink-0`} />
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {g.label.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Sinopse / Descrição
            </label>
            <textarea
              rows={2}
              placeholder="Breve resumo da proposta pedagógica e temas contemplados..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 ring-purple-500 font-medium resize-none"
            />
          </div>

          {/* Highlights */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Destaques do Material (1 por linha)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Atualizado com a jurisprudência 2024&#10;Quadros mnemônicos exclusivos"
              value={highlightsInput}
              onChange={e => setHighlightsInput(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 ring-purple-500 font-medium resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              {isSubmitting ? "Publicando na Nuvem..." : "Publicar Curso na Nuvem"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
