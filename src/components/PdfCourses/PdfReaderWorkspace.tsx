import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, BookOpen, Bookmark, BookmarkCheck, FileText, ChevronLeft, 
  ChevronRight, ZoomIn, ZoomOut, RotateCcw, Download, Share2, Maximize2, 
  Minimize2, CheckCircle2, Clock, Moon, Sun, Coffee, Edit3, Trash2, 
  Plus, ExternalLink, Cloud, Sparkles, AlertCircle, Eye, Settings, HelpCircle, Save
} from 'lucide-react';
import { PdfCourse, PdfChapter, UserPdfProgress, PdfBookmark, PdfAnnotation } from '../../types';
import { pdfCourseService } from '../../services/pdfCourseService';
import { useAuth } from '../../lib/AuthContext';
import { cn } from '../../lib/utils';

interface PdfReaderWorkspaceProps {
  course: PdfCourse;
  initialPage?: number;
  initialChapterId?: string;
  onBack: () => void;
  onUpdateCourse?: (updated: PdfCourse) => void;
}

type ReadingTheme = 'light' | 'sepia' | 'dark';

export const PdfReaderWorkspace: React.FC<PdfReaderWorkspaceProps> = ({
  course,
  initialPage = 1,
  initialChapterId,
  onBack,
  onUpdateCourse
}) => {
  const { user } = useAuth();

  // State
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(course.totalPages || 100);
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 80, 100, 125, 150
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('sepia');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'toc' | 'bookmarks' | 'notes' | 'settings'>('toc');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Progress, Bookmarks & Notes
  const [progress, setProgress] = useState<UserPdfProgress | null>(null);
  const [bookmarks, setBookmarks] = useState<PdfBookmark[]>([]);
  const [notes, setNotes] = useState<PdfAnnotation[]>([]);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);
  const [showSyncToast, setShowSyncToast] = useState<boolean>(false);

  // New Note Form
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [newNoteColor, setNewNoteColor] = useState<'yellow' | 'green' | 'blue' | 'purple'>('yellow');
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);

  // Custom PDF URL editor
  const [customPdfUrl, setCustomPdfUrl] = useState<string>(course.pdfUrl || '');
  const [isSavingUrl, setIsSavingUrl] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'reader' | 'embed'>(course.pdfUrl ? 'embed' : 'reader');

  // Find active chapter based on current page
  const allChapters = course.modules.flatMap(m => m.chapters);
  const currentChapter = allChapters.find(c => 
    currentPage >= c.pageStart && (c.pageEnd ? currentPage <= c.pageEnd : true)
  ) || allChapters[0];

  const workspaceRef = useRef<HTMLDivElement>(null);

  // Initialize data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const allProgress = await pdfCourseService.getAllUserProgress(user?.uid);
        const userProg = allProgress[course.id];
        if (userProg) {
          setProgress(userProg);
          if (initialPage === 1 && userProg.currentPage > 1) {
            setCurrentPage(userProg.currentPage);
          }
        }

        const bms = await pdfCourseService.getBookmarks(course.id, user?.uid);
        setBookmarks(bms);

        const loadedNotes = await pdfCourseService.getNotes(course.id, user?.uid);
        setNotes(loadedNotes);
      } catch (e) {
        console.error('Erro ao carregar dados do leitor:', e);
      }
    };
    loadUserData();
  }, [course.id, user]);

  // Sync reading progress to cloud debounced
  useEffect(() => {
    setIsCloudSynced(false);
    const timer = setTimeout(async () => {
      try {
        const updated = await pdfCourseService.saveUserProgress(
          course.id,
          {
            currentPage,
            totalPages,
            activeChapterId: currentChapter?.id,
            completedChapters: progress?.completedChapters || []
          },
          user?.uid
        );
        setProgress(updated);
        setIsCloudSynced(true);
      } catch (err) {
        setIsCloudSynced(true);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentPage, totalPages, course.id, user]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevPage();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleBookmark();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, bookmarks]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const jumpToPage = (page: number) => {
    const valid = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(valid);
  };

  const isCurrentPageBookmarked = bookmarks.some(b => b.page === currentPage);

  const handleToggleBookmark = async () => {
    const { added, bookmarks: updated } = await pdfCourseService.toggleBookmark(
      course.id,
      currentPage,
      currentChapter?.title,
      user?.uid
    );
    setBookmarks(updated);
    setShowSyncToast(true);
    setTimeout(() => setShowSyncToast(false), 2000);
  };

  const handleSaveNote = async () => {
    if (!newNoteText.trim()) return;

    const saved = await pdfCourseService.saveNote(
      course.id,
      {
        page: currentPage,
        chapterId: currentChapter?.id,
        title: newNoteTitle.trim() || `Nota na pág. ${currentPage}`,
        content: newNoteText.trim(),
        color: newNoteColor
      },
      user?.uid
    );

    setNotes(prev => [saved, ...prev.filter(n => n.id !== saved.id)]);
    setNewNoteText('');
    setNewNoteTitle('');
    setIsAddingNote(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    await pdfCourseService.deleteNote(course.id, noteId, user?.uid);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const handleSaveCustomPdfUrl = async () => {
    setIsSavingUrl(true);
    try {
      const updatedCourse: PdfCourse = {
        ...course,
        pdfUrl: customPdfUrl.trim()
      };
      await pdfCourseService.saveCourse(updatedCourse);
      if (onUpdateCourse) onUpdateCourse(updatedCourse);
      if (customPdfUrl.trim()) setViewMode('embed');
      alert('Link do PDF atualizado na nuvem com sucesso!');
    } catch (e) {
      alert('Erro ao atualizar link.');
    } finally {
      setIsSavingUrl(false);
    }
  };

  const toggleChapterComplete = async (chapterId: string) => {
    const currentCompleted = progress?.completedChapters || [];
    const isCompleted = currentCompleted.includes(chapterId);
    const newCompleted = isCompleted 
      ? currentCompleted.filter(id => id !== chapterId)
      : [...currentCompleted, chapterId];

    const updated = await pdfCourseService.saveUserProgress(
      course.id,
      { completedChapters: newCompleted },
      user?.uid
    );
    setProgress(updated);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      workspaceRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Theme Styling
  const themeStyles = {
    light: {
      bg: 'bg-white',
      canvas: 'bg-slate-50',
      text: 'text-slate-900',
      card: 'bg-white border-slate-200 text-slate-900',
      accent: 'text-blue-600',
      highlight: 'bg-amber-100 border-amber-300 text-amber-900',
      border: 'border-slate-200'
    },
    sepia: {
      bg: 'bg-[#fbf7ee]',
      canvas: 'bg-[#f4ebd9]',
      text: 'text-[#3d3326]',
      card: 'bg-[#fcf9f2] border-[#e8dac0] text-[#3d3326]',
      accent: 'text-[#9c5b24]',
      highlight: 'bg-[#f0e2c8] border-[#dfcaa3] text-[#4d381c]',
      border: 'border-[#ebdcc2]'
    },
    dark: {
      bg: 'bg-[#090d16]',
      canvas: 'bg-[#030712]',
      text: 'text-slate-100',
      card: 'bg-[#0f172a] border-slate-800 text-slate-100',
      accent: 'text-cyan-400',
      highlight: 'bg-cyan-950/50 border-cyan-700/50 text-cyan-200',
      border: 'border-slate-800'
    }
  }[readingTheme];

  const progressPercentage = Math.min(100, Math.round((currentPage / totalPages) * 100));

  return (
    <div 
      ref={workspaceRef} 
      className={cn(
        "relative w-full h-full flex flex-col overflow-hidden select-none transition-colors duration-300 font-sans",
        themeStyles.canvas
      )}
    >
      {/* 1. TOP BAR */}
      <header className={cn(
        "h-16 px-4 md:px-6 flex items-center justify-between border-b z-30 transition-colors duration-300 shadow-sm",
        themeStyles.bg,
        themeStyles.border
      )}>
        {/* Left: Back & Course Details */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className={cn(
              "p-2 rounded-xl border flex items-center gap-1.5 font-bold text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer",
              themeStyles.card
            )}
            title="Voltar para a Biblioteca de Cursos"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Biblioteca</span>
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700/50 mx-1 hidden sm:block" />

          <div className="min-w-0">
            <h1 className={cn("text-sm md:text-base font-bold truncate max-w-[200px] sm:max-w-xs md:max-w-md", themeStyles.text)}>
              {course.title}
            </h1>
            <p className="text-[11px] opacity-70 truncate flex items-center gap-2">
              <span className="font-semibold text-purple-500 dark:text-purple-400">{course.discipline}</span>
              <span>•</span>
              <span className="truncate">{currentChapter?.title || `Página ${currentPage}`}</span>
            </p>
          </div>
        </div>

        {/* Center: Cloud Sync Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Cloud size={14} className={isCloudSynced ? "text-emerald-500" : "text-amber-500 animate-pulse"} />
          <span>{isCloudSynced ? "Sincronizado na Nuvem" : "Salvando leitura..."}</span>
        </div>

        {/* Right: Controls & Reading Preferences */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Mode Switcher if PDF URL exists */}
          {course.pdfUrl && (
            <div className="hidden sm:flex items-center p-0.5 rounded-lg border text-xs" style={{ borderColor: 'inherit' }}>
              <button
                onClick={() => setViewMode('embed')}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer",
                  viewMode === 'embed' ? "bg-purple-600 text-white" : "opacity-70 hover:opacity-100"
                )}
              >
                PDF Original
              </button>
              <button
                onClick={() => setViewMode('reader')}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer",
                  viewMode === 'reader' ? "bg-purple-600 text-white" : "opacity-70 hover:opacity-100"
                )}
              >
                Modo Leitura
              </button>
            </div>
          )}

          {/* Theme Switcher */}
          <div className="flex items-center border rounded-xl p-1 gap-1" style={{ borderColor: 'inherit' }}>
            <button
              onClick={() => setReadingTheme('light')}
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer",
                readingTheme === 'light' ? "bg-white text-blue-600 shadow-sm" : "opacity-60 hover:opacity-100"
              )}
              title="Modo Dia (Claro)"
            >
              <Sun size={15} />
            </button>
            <button
              onClick={() => setReadingTheme('sepia')}
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer",
                readingTheme === 'sepia' ? "bg-[#e8dac0] text-[#4d381c] shadow-sm" : "opacity-60 hover:opacity-100"
              )}
              title="Modo Sépia (Conforto Visual)"
            >
              <Coffee size={15} />
            </button>
            <button
              onClick={() => setReadingTheme('dark')}
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer",
                readingTheme === 'dark' ? "bg-slate-800 text-cyan-400 shadow-sm" : "opacity-60 hover:opacity-100"
              )}
              title="Modo Noturno (Dark AMOLED)"
            >
              <Moon size={15} />
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            className={cn(
              "p-2 rounded-xl border flex items-center gap-1 transition-all cursor-pointer",
              isCurrentPageBookmarked 
                ? "bg-amber-500 text-white border-amber-600 shadow-sm" 
                : `${themeStyles.card} hover:scale-105`
            )}
            title={isCurrentPageBookmarked ? "Página Marcada! Clique para desmarcar" : "Marcar esta página"}
          >
            {isCurrentPageBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "p-2 rounded-xl border transition-all cursor-pointer",
              isSidebarOpen ? "bg-purple-600 text-white border-purple-700" : themeStyles.card
            )}
            title="Sumário e Anotações"
          >
            <FileText size={16} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className={cn("hidden md:flex p-2 rounded-xl border transition-all cursor-pointer", themeStyles.card)}
            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* 2. WORKSPACE BODY: SIDEBAR + READER */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR (Drawer: Toc, Bookmarks, Notes, PDF Settings) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className={cn(
                "h-full border-r flex flex-col z-20 overflow-hidden shadow-lg shrink-0",
                themeStyles.bg,
                themeStyles.border
              )}
            >
              {/* Sidebar Tabs */}
              <div className="flex items-center border-b px-3 pt-3 gap-1" style={{ borderColor: 'inherit' }}>
                <button
                  onClick={() => setActiveSidebarTab('toc')}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-t-lg transition-colors text-center border-b-2",
                    activeSidebarTab === 'toc'
                      ? "border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/40 dark:bg-purple-950/20"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  Sumário
                </button>
                <button
                  onClick={() => setActiveSidebarTab('bookmarks')}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-t-lg transition-colors text-center border-b-2 flex items-center justify-center gap-1",
                    activeSidebarTab === 'bookmarks'
                      ? "border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/40 dark:bg-purple-950/20"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  Marcas
                  {bookmarks.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">
                      {bookmarks.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveSidebarTab('notes')}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-t-lg transition-colors text-center border-b-2 flex items-center justify-center gap-1",
                    activeSidebarTab === 'notes'
                      ? "border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/40 dark:bg-purple-950/20"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  Notas
                  {notes.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-black">
                      {notes.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveSidebarTab('settings')}
                  className={cn(
                    "p-2 text-xs rounded-t-lg transition-colors border-b-2",
                    activeSidebarTab === 'settings'
                      ? "border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/40 dark:bg-purple-950/20"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                  title="Configurar Link do PDF na Nuvem"
                >
                  <Settings size={15} />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* TAB 1: SUMÁRIO / ÍNDICE */}
                {activeSidebarTab === 'toc' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-60">Módulos & Capítulos</span>
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                        {progressPercentage}% lido
                      </span>
                    </div>

                    <div className="space-y-3">
                      {course.modules.map((module, mIdx) => (
                        <div key={module.id} className="space-y-1.5">
                          <div className="text-[11px] font-black uppercase tracking-wider opacity-50 px-1">
                            {module.title}
                          </div>
                          
                          <div className="space-y-1">
                            {module.chapters.map((chapter) => {
                              const isActive = currentChapter?.id === chapter.id;
                              const isCompleted = progress?.completedChapters?.includes(chapter.id);

                              return (
                                <div
                                  key={chapter.id}
                                  className={cn(
                                    "group flex items-start gap-2 p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer border",
                                    isActive
                                      ? "bg-purple-600/10 border-purple-500/30 text-purple-700 dark:text-purple-300 font-bold shadow-xs"
                                      : "border-transparent hover:bg-black/5 dark:hover:bg-white/5 opacity-85 hover:opacity-100"
                                  )}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleChapterComplete(chapter.id);
                                    }}
                                    className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors"
                                    title={isCompleted ? "Marcar como não lido" : "Marcar capítulo como lido"}
                                  >
                                    <CheckCircle2 
                                      size={15} 
                                      className={cn(
                                        isCompleted ? "text-emerald-500 fill-emerald-500/20" : "opacity-40"
                                      )} 
                                    />
                                  </button>

                                  <div 
                                    className="flex-1 min-w-0"
                                    onClick={() => jumpToPage(chapter.pageStart)}
                                  >
                                    <p className={cn("leading-tight", isCompleted && "line-through opacity-70")}>
                                      {chapter.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-[10px] opacity-60">
                                      <span>Pág. {chapter.pageStart}{chapter.pageEnd ? `-${chapter.pageEnd}` : ''}</span>
                                      {chapter.durationMinutes && (
                                        <>
                                          <span>•</span>
                                          <span className="flex items-center gap-0.5">
                                            <Clock size={10} /> {chapter.durationMinutes} min
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: MARCADORES (BOOKMARKS) */}
                {activeSidebarTab === 'bookmarks' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-60">Páginas Salvas</span>
                      <button
                        onClick={handleToggleBookmark}
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} /> Marcar Atual (Pág {currentPage})
                      </button>
                    </div>

                    {bookmarks.length === 0 ? (
                      <div className="text-center py-10 opacity-50 space-y-2">
                        <Bookmark size={32} className="mx-auto text-amber-500/50" />
                        <p className="text-xs">Nenhum marcador criado ainda.</p>
                        <p className="text-[11px]">Pressione 'M' ou clique no ícone de marcador para salvar a página atual.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {bookmarks.map((bm) => (
                          <div
                            key={bm.id}
                            onClick={() => jumpToPage(bm.page)}
                            className={cn(
                              "p-3 rounded-xl border flex items-center justify-between group hover:scale-[1.01] transition-all cursor-pointer",
                              bm.page === currentPage 
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold"
                                : themeStyles.card
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Bookmark size={15} className="text-amber-500 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold">Página {bm.page}</p>
                                <p className="text-[10px] opacity-70 truncate max-w-[180px]">
                                  {bm.chapterTitle || 'Sem título'}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                pdfCourseService.toggleBookmark(course.id, bm.page, undefined, user?.uid).then(res => setBookmarks(res.bookmarks));
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-500/10 rounded transition-all"
                              title="Remover marcador"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: MINHAS ANOTAÇÕES (CADERNO NA NUVEM) */}
                {activeSidebarTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-60">Notas na Nuvem</span>
                      {!isAddingNote && (
                        <button
                          onClick={() => setIsAddingNote(true)}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Plus size={13} /> Nova Nota
                        </button>
                      )}
                    </div>

                    {/* Add note form */}
                    {isAddingNote && (
                      <div className={cn("p-3 rounded-xl border space-y-2.5", themeStyles.card)}>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                            Anotação na Pág. {currentPage}
                          </span>
                          <button
                            onClick={() => setIsAddingNote(false)}
                            className="text-xs opacity-50 hover:opacity-100"
                          >
                            Cancelar
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="Título da anotação (opcional)..."
                          value={newNoteTitle}
                          onChange={(e) => setNewNoteTitle(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:border-purple-500"
                        />

                        <textarea
                          placeholder="Digite seu resumo, mnemônico ou dúvida aqui..."
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          rows={3}
                          className="w-full text-xs p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:border-purple-500 resize-none"
                        />

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            {(['yellow', 'green', 'blue', 'purple'] as const).map(color => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setNewNoteColor(color)}
                                className={cn(
                                  "w-5 h-5 rounded-full transition-transform",
                                  color === 'yellow' && "bg-amber-400",
                                  color === 'green' && "bg-emerald-400",
                                  color === 'blue' && "bg-blue-400",
                                  color === 'purple' && "bg-purple-400",
                                  newNoteColor === color ? "scale-125 ring-2 ring-purple-600" : "opacity-60"
                                )}
                              />
                            ))}
                          </div>

                          <button
                            onClick={handleSaveNote}
                            disabled={!newNoteText.trim()}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs disabled:opacity-50 hover:bg-purple-700 transition-colors"
                          >
                            Salvar Nota
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Notes List */}
                    {notes.length === 0 && !isAddingNote ? (
                      <div className="text-center py-10 opacity-50 space-y-2">
                        <Edit3 size={32} className="mx-auto text-purple-500/50" />
                        <p className="text-xs">Nenhuma anotação neste curso ainda.</p>
                        <p className="text-[11px]">Adicione resumos e anotações pessoais sincronizadas na nuvem.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {notes.map((note) => (
                          <div
                            key={note.id}
                            className={cn(
                              "p-3 rounded-xl border space-y-1.5 group transition-all",
                              note.color === 'yellow' && "bg-amber-500/5 border-amber-500/30",
                              note.color === 'green' && "bg-emerald-500/5 border-emerald-500/30",
                              note.color === 'blue' && "bg-blue-500/5 border-blue-500/30",
                              note.color === 'purple' && "bg-purple-500/5 border-purple-500/30",
                              !note.color && themeStyles.card
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span 
                                onClick={() => jumpToPage(note.page)}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10 hover:underline cursor-pointer"
                              >
                                Pág. {note.page}
                              </span>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-500/10 p-1 rounded transition-all"
                                title="Excluir nota"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            {note.title && (
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {note.title}
                              </h4>
                            )}

                            <p className="text-xs leading-relaxed opacity-85 whitespace-pre-wrap">
                              {note.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: CONFIGURAÇÃO DE LINK DO PDF */}
                {activeSidebarTab === 'settings' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <Sparkles size={14} /> Link do Arquivo PDF na Nuvem
                      </p>
                      <p className="opacity-80 text-[11px] leading-relaxed">
                        Cole aqui o link direto do arquivo PDF armazenado no Firebase Storage, Google Drive, AWS S3 ou seu CDN.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold opacity-75">URL do Arquivo PDF:</label>
                      <input
                        type="url"
                        placeholder="https://firebasestorage.googleapis.com/... ou link direto .pdf"
                        value={customPdfUrl}
                        onChange={(e) => setCustomPdfUrl(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border bg-black/5 dark:bg-white/5 outline-none focus:ring-2 ring-purple-500 font-mono"
                        style={{ borderColor: 'inherit' }}
                      />
                    </div>

                    <button
                      onClick={handleSaveCustomPdfUrl}
                      disabled={isSavingUrl}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <Save size={14} />
                      {isSavingUrl ? "Salvando na Nuvem..." : "Atualizar Link na Nuvem"}
                    </button>

                    {customPdfUrl && (
                      <div className="pt-2 border-t text-[11px] opacity-70 space-y-1">
                        <p className="font-semibold">Dica para Google Drive:</p>
                        <p>Substitua <code className="bg-black/10 px-1 py-0.5 rounded">/view</code> por <code className="bg-black/10 px-1 py-0.5 rounded">/preview</code> no final da URL de compartilhamento público.</p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* 3. CENTRAL READER DISPLAY */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
            
            {/* A. EMBEDDED PDF IFRAME / VIEWER (when custom link is active) */}
            {viewMode === 'embed' && course.pdfUrl ? (
              <div className="w-full h-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border overflow-hidden flex flex-col min-h-[780px]" style={{ borderColor: 'inherit' }}>
                <div className="p-3 bg-black/5 dark:bg-white/5 border-b flex items-center justify-between text-xs font-bold" style={{ borderColor: 'inherit' }}>
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-purple-500" />
                    <span className="text-slate-900 dark:text-white">Documento Oficial: {course.pdfUrl.replace('/', '') || 'curso.pdf'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono border border-emerald-500/20">
                      {course.totalPages} páginas
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={course.pdfUrl}
                      download={course.pdfUrl.replace('/', '')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-slate-700 dark:text-slate-200 transition-colors"
                      title="Baixar arquivo PDF original"
                    >
                      <Download size={13} />
                      <span>Baixar PDF</span>
                    </a>
                    <a
                      href={course.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-sm"
                    >
                      <span>Abrir em nova aba</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
                <object
                  data={`${course.pdfUrl}#toolbar=1&navpanes=1`}
                  type="application/pdf"
                  className="w-full flex-1 border-none min-h-[720px] bg-slate-100 dark:bg-slate-800"
                >
                  <iframe
                    src={`${course.pdfUrl}#toolbar=1`}
                    title={course.title}
                    className="w-full h-full border-none min-h-[720px]"
                  />
                </object>
              </div>
            ) : (
              /* B. EDITORIAL DIGITAL TEXT READER VIEW */
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className={cn(
                  "w-full max-w-3xl rounded-3xl p-8 md:p-14 shadow-2xl border transition-all duration-300 min-h-[750px] flex flex-col justify-between",
                  themeStyles.card
                )}
              >
                {/* Header inside page */}
                <div className="border-b pb-6 mb-8 flex items-start justify-between gap-4" style={{ borderColor: 'inherit' }}>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
                      {course.targetExam || course.discipline} • AULA TEÓRICA ESQUEMATIZADA
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black mt-1 tracking-tight leading-tight">
                      {currentChapter?.title || `Capítulo: Página ${currentPage}`}
                    </h2>
                    <p className="text-xs opacity-60 mt-1">
                      Material oficial • {course.author.name} • {course.author.title}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      Página {currentPage} de {totalPages}
                    </span>
                  </div>
                </div>

                {/* Main page content / schemes */}
                <div className="space-y-6 flex-1 text-sm md:text-base leading-relaxed">
                  
                  {/* Summary Callout Box */}
                  {currentChapter?.summary && (
                    <div className={cn("p-5 rounded-2xl border space-y-1.5", themeStyles.highlight)}>
                      <h4 className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={14} /> Ponto Chave da Doutrina & Jurisprudência
                      </h4>
                      <p className="text-xs md:text-sm leading-relaxed opacity-95">
                        {currentChapter.summary}
                      </p>
                    </div>
                  )}

                  {/* Main content snippet */}
                  <div className="prose dark:prose-invert max-w-none space-y-4 font-serif text-[15px] md:text-[17px] leading-8">
                    {currentChapter?.contentSnippet ? (
                      <div className="whitespace-pre-wrap">
                        {currentChapter.contentSnippet}
                      </div>
                    ) : (
                      <div className="space-y-4 font-sans text-sm md:text-base not-prose">
                        <p className="leading-relaxed">
                          Este capítulo aborda os conceitos fundamentais exigidos pelas principais bancas examinadoras.
                          A fixação deste conteúdo é primordial para a resolução assertiva das questões de prova.
                        </p>
                        <div className="p-4 rounded-xl border border-dashed text-xs opacity-75 space-y-2" style={{ borderColor: 'inherit' }}>
                          <p className="font-bold text-sm text-purple-500">
                            💡 Espaço Reservado para o PDF Completo
                          </p>
                          <p>
                            Você pode vincular o arquivo PDF integral na aba lateral de <strong>Configurações do PDF</strong> para visualização completa integrada.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* High-Yield Checklist Box */}
                  <div className="mt-8 p-6 rounded-2xl border bg-black/[0.02] dark:bg-white/[0.02] space-y-3" style={{ borderColor: 'inherit' }}>
                    <h4 className="text-xs font-black uppercase tracking-wider opacity-60 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-purple-500" /> Diretrizes para Memorização Rápida
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs opacity-85">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>Revise os artigos e súmulas correlatas</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>Crie flashcards dos prazos e mnemônicos</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>Resolva a bateria de questões sobre este tema</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>Destaque as pegadinhas frequentes de prova</span>
                      </li>
                    </ul>
                  </div>

                </div>

                {/* Page Footer inside canvas */}
                <div className="border-t pt-6 mt-12 flex items-center justify-between text-xs opacity-50" style={{ borderColor: 'inherit' }}>
                  <span>{course.title}</span>
                  <span>APSES Concursos • Material Didático Digital</span>
                </div>
              </motion.div>
            )}

          </div>

          {/* 4. BOTTOM STICKY PROGRESS & NAVIGATION BAR */}
          <footer className={cn(
            "h-16 px-4 md:px-8 border-t flex items-center justify-between z-20 transition-colors shadow-md",
            themeStyles.bg,
            themeStyles.border
          )}>
            {/* Left: Previous Page */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                className={cn(
                  "px-3 md:px-4 py-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer disabled:opacity-30",
                  themeStyles.card
                )}
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Página Anterior</span>
              </button>
            </div>

            {/* Center: Page Slider & Quick Jump */}
            <div className="flex items-center gap-3 max-w-md w-full mx-4">
              <input
                type="range"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => jumpToPage(Number(e.target.value))}
                className="w-full accent-purple-600 h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
              />

              <div className="flex items-center gap-1 shrink-0 text-xs font-bold">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => jumpToPage(Number(e.target.value))}
                  className="w-12 text-center py-1 rounded-lg border bg-transparent font-mono text-xs font-bold"
                  style={{ borderColor: 'inherit' }}
                />
                <span className="opacity-60">/ {totalPages}</span>
              </div>
            </div>

            {/* Right: Next Page & Zoom */}
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <div className="hidden lg:flex items-center border rounded-xl p-0.5 gap-0.5" style={{ borderColor: 'inherit' }}>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(80, prev - 10))}
                  className="p-1.5 opacity-70 hover:opacity-100 cursor-pointer"
                  title="Diminuir Zoom"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-[10px] font-mono font-bold px-1">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
                  className="p-1.5 opacity-70 hover:opacity-100 cursor-pointer"
                  title="Aumentar Zoom"
                >
                  <ZoomIn size={14} />
                </button>
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className="px-3 md:px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                <span className="hidden sm:inline">Próxima Página</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* Floating Save Toast */}
      <AnimatePresence>
        {showSyncToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-white/10 flex items-center gap-2"
          >
            <BookmarkCheck size={16} className="text-amber-400" />
            <span>Marcador salvo na nuvem!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
