import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Search, Filter, Bookmark, Heart, Star, CheckCircle2, 
  Clock, ArrowRight, Sparkles, Plus, ExternalLink, Download, 
  ChevronRight, Cloud, Layers, Check, ShieldCheck, Flame, BookMarked,
  SlidersHorizontal, Library, RefreshCw, FileText
} from 'lucide-react';
import { PdfCourse, UserPdfProgress } from '../types';
import { pdfCourseService } from '../services/pdfCourseService';
import { PdfReaderWorkspace } from './PdfCourses/PdfReaderWorkspace';
import { AddPdfCourseModal } from './PdfCourses/AddPdfCourseModal';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';

interface PdfCoursesScreenProps {
  onNavigate?: (tab: any, params?: any) => void;
  initialCourseId?: string;
}

export const PdfCoursesScreen: React.FC<PdfCoursesScreenProps> = ({
  onNavigate,
  initialCourseId
}) => {
  const { user } = useAuth();

  // Data states
  const [courses, setCourses] = useState<PdfCourse[]>([]);
  const [userProgressMap, setUserProgressMap] = useState<Record<string, UserPdfProgress>>({});
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCareer, setSelectedCareer] = useState<string>('Todas');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'reading' | 'completed' | 'favorites'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'progress' | 'pages' | 'rating'>('featured');

  // Reader workspace state
  const [activeReadingCourse, setActiveReadingCourse] = useState<PdfCourse | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Load initial catalog & progress
  const loadData = async () => {
    setIsLoading(true);
    try {
      const allCourses = await pdfCourseService.getAllCourses();
      setCourses(allCourses);

      if (user?.uid) {
        const progresses = await pdfCourseService.getAllUserProgress(user.uid);
        setUserProgressMap(progresses);

        const favs = await pdfCourseService.getFavorites(user.uid);
        setFavoriteIds(favs);
      }

      // If initialCourseId was provided in routing, open it directly
      if (initialCourseId) {
        const found = allCourses.find(c => c.id === initialCourseId);
        if (found) setActiveReadingCourse(found);
      }
    } catch (e) {
      console.error('Erro ao carregar catálogo de cursos em PDF:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.uid, initialCourseId]);

  // Handle Favorite toggle
  const handleToggleFavorite = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    const isNowFav = await pdfCourseService.toggleFavorite(courseId, user?.uid);
    setFavoriteIds(prev => isNowFav ? [...prev, courseId] : prev.filter(id => id !== courseId));
  };

  // Find most recently read course for "Continuar Lendo" hero banner
  const mostRecentProgressCourse = useMemo(() => {
    const activeProgressList = Object.values(userProgressMap)
      .filter(p => p.currentPage > 1 && p.status !== 'completed')
      .sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0));

    if (activeProgressList.length === 0) return null;
    const topProg = activeProgressList[0];
    const course = courses.find(c => c.id === topProg.courseId);
    return course ? { course, progress: topProg } : null;
  }, [courses, userProgressMap]);

  // Extract unique disciplines for dropdown
  const uniqueDisciplines = useMemo(() => {
    const list = Array.from(new Set(courses.map(c => c.discipline))).filter(Boolean);
    return ['Todas', ...list.sort()];
  }, [courses]);

  // Filtered and sorted courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Career filter
      if (selectedCareer !== 'Todas' && course.career !== selectedCareer) {
        return false;
      }

      // Discipline filter
      if (selectedDiscipline !== 'Todas' && course.discipline !== selectedDiscipline) {
        return false;
      }

      // Status filter
      const prog = userProgressMap[course.id];
      if (selectedStatus === 'reading') {
        if (!prog || prog.currentPage <= 1 || prog.status === 'completed') return false;
      } else if (selectedStatus === 'completed') {
        if (!prog || prog.status !== 'completed') return false;
      } else if (selectedStatus === 'favorites') {
        if (!favoriteIds.includes(course.id)) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = course.title.toLowerCase().includes(q);
        const inSubtitle = (course.subtitle || '').toLowerCase().includes(q);
        const inDiscipline = course.discipline.toLowerCase().includes(q);
        const inAuthor = course.author.name.toLowerCase().includes(q);
        const inExam = (course.targetExam || '').toLowerCase().includes(q);
        const inTags = (course.tags || []).some(t => t.toLowerCase().includes(q));

        if (!inTitle && !inSubtitle && !inDiscipline && !inAuthor && !inExam && !inTags) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'progress') {
        const progA = userProgressMap[a.id]?.currentPage || 0;
        const progB = userProgressMap[b.id]?.currentPage || 0;
        return progB - progA;
      }
      if (sortBy === 'pages') {
        return b.totalPages - a.totalPages;
      }
      if (sortBy === 'rating') {
        return (b.rating || 5) - (a.rating || 5);
      }
      // Featured / Default
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });
  }, [courses, selectedCareer, selectedDiscipline, selectedStatus, searchQuery, sortBy, userProgressMap, favoriteIds]);

  // Aggregate stats
  const totalLibraryPages = useMemo(() => courses.reduce((acc, c) => acc + (c.totalPages || 0), 0), [courses]);
  const userTotalPagesRead = useMemo(() => {
    return Object.values(userProgressMap).reduce((acc, p) => acc + Math.max(0, (p.currentPage || 1) - 1), 0);
  }, [userProgressMap]);
  const activeReadingCount = useMemo(() => {
    return Object.values(userProgressMap).filter(p => p.currentPage > 1 && p.status !== 'completed').length;
  }, [userProgressMap]);

  // If reading workspace is active, display the reader
  if (activeReadingCourse) {
    return (
      <PdfReaderWorkspace
        course={activeReadingCourse}
        onBack={() => {
          setActiveReadingCourse(null);
          // Reload user progress upon exiting reader
          if (user?.uid) {
            pdfCourseService.getAllUserProgress(user.uid).then(setUserProgressMap);
          }
        }}
        onUpdateCourse={(updated) => {
          setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
          setActiveReadingCourse(updated);
        }}
      />
    );
  }

  return (
    <div className="w-full min-h-screen pb-24 bg-[#f8fafc] dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* 1. EDITORIAL HEADER & TITLE */}
      <header className="relative pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/10 dark:bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold tracking-wide">
              <Cloud size={13} className="text-purple-600 dark:text-purple-400" />
              <span>BIBLIOTECA DIGITAL EM NUVEM</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Cursos em PDF & Livros Digitais
            </h1>
            
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Material teórico esquematizado, legislação comentada e doutrina de alta incidência com sincronização contínua de leitura e anotações na nuvem.
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-purple-600/25 cursor-pointer"
            >
              <Plus size={18} />
              <span>Adicionar Novo PDF</span>
            </button>
          </div>
        </div>

        {/* 2. STATS OVERVIEW BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-8">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Acervo Total</span>
              <BookOpen size={16} className="text-purple-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {courses.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">livros</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Páginas no Acervo</span>
              <Layers size={16} className="text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {totalLibraryPages.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium">págs</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Em Andamento</span>
              <Flame size={16} className="text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {activeReadingCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">cursos</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Páginas Lidas</span>
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {userTotalPagesRead.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium">lidas</span>
            </div>
          </div>
        </div>

        {/* 3. RESUME READING HERO BANNER (if user has an active book) */}
        {mostRecentProgressCourse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 text-white shadow-xl border border-purple-500/20 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div className="space-y-2 relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-[11px] font-black uppercase tracking-wider">
                <BookMarked size={12} /> Continuar Leitura de Onde Parou
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                {mostRecentProgressCourse.course.title}
              </h3>
              <p className="text-xs sm:text-sm text-purple-200/80">
                Você estava na <strong className="text-white">Página {mostRecentProgressCourse.progress.currentPage}</strong> de {mostRecentProgressCourse.course.totalPages} ({Math.round((mostRecentProgressCourse.progress.currentPage / mostRecentProgressCourse.course.totalPages) * 100)}% concluído).
              </p>
              
              {/* Progress bar */}
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mt-3 max-w-md">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((mostRecentProgressCourse.progress.currentPage / mostRecentProgressCourse.course.totalPages) * 100))}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setActiveReadingCourse(mostRecentProgressCourse.course)}
              className="relative z-10 px-6 py-3.5 rounded-2xl bg-white text-purple-950 hover:bg-purple-50 active:scale-95 transition-all font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Abrir Livro</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </header>

      {/* 4. CONTROLS, SEARCH & FILTER BAR */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4">
        
        {/* Career Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'Todas', label: 'Todas as Carreiras' },
            { id: 'Policial', label: 'Carreiras Policiais' },
            { id: 'Fiscal', label: 'Fiscal & Controle' },
            { id: 'Administrativo', label: 'Administrativo & Tribunais' },
            { id: 'Geral', label: 'Matérias Gerais' },
          ].map(career => (
            <button
              key={career.id}
              onClick={() => setSelectedCareer(career.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer border",
                selectedCareer === career.id
                  ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              {career.label}
            </button>
          ))}
        </div>

        {/* Filter Toolbar: Search, Discipline, Status, Sort */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full lg:max-w-md">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título, matéria, professor ou palavra-chave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 ring-purple-500 transition-all"
            />
          </div>

          {/* Right Toolbar Group */}
          <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto justify-end">
            
            {/* Discipline Dropdown */}
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              {uniqueDisciplines.map(d => (
                <option key={d} value={d}>{d === 'Todas' ? 'Todas as Matérias' : d}</option>
              ))}
            </select>

            {/* Status Filter Buttons */}
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-2xl p-0.5 bg-slate-50 dark:bg-slate-950">
              <button
                onClick={() => setSelectedStatus('all')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  selectedStatus === 'all' 
                    ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedStatus('reading')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  selectedStatus === 'reading' 
                    ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Em Leitura
              </button>
              <button
                onClick={() => setSelectedStatus('favorites')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                  selectedStatus === 'favorites' 
                    ? "bg-white dark:bg-slate-800 text-rose-500 shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Heart size={12} className={selectedStatus === 'favorites' ? "fill-rose-500" : ""} />
                <span>Favoritos</span>
              </button>
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="featured">Mais Relevantes</option>
              <option value="progress">Meu Progresso</option>
              <option value="pages">Mais Páginas</option>
              <option value="rating">Melhor Avaliados</option>
            </select>
          </div>
        </div>
      </section>

      {/* 5. COURSES CATALOG GRID */}
      <main className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-8">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <BookOpen size={48} className="mx-auto text-purple-500/50" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Nenhum curso em PDF encontrado
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tente redefinir os filtros de busca ou adicione um novo PDF para a sua biblioteca.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCareer('Todas');
                setSelectedDiscipline('Todas');
                setSelectedStatus('all');
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs cursor-pointer hover:bg-purple-700 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => {
              const isFav = favoriteIds.includes(course.id);
              const prog = userProgressMap[course.id];
              const currentPage = prog?.currentPage || 1;
              const percent = Math.min(100, Math.round((currentPage / course.totalPages) * 100));
              const isFinished = prog?.status === 'completed' || percent >= 100;

              return (
                <motion.div
                  key={course.id}
                  whileHover={{ y: -4 }}
                  onClick={() => setActiveReadingCourse(course)}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group cursor-pointer"
                >
                  {/* Luxury Hardcover Book Header Design */}
                  <div className={`relative h-44 p-5 bg-gradient-to-br ${course.coverGradient} text-white flex flex-col justify-between overflow-hidden shadow-inner`}>
                    
                    {/* Spine highlight accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-white/20 border-r border-black/10 backdrop-blur-xs" />

                    {/* Top row: Career badge & Favorite heart */}
                    <div className="relative z-10 flex items-center justify-between pl-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white border border-white/20">
                          {course.targetExam || course.career}
                        </span>
                        {course.pdfUrl && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/80 backdrop-blur-md text-[9px] font-black uppercase tracking-wider text-white border border-emerald-400/30 flex items-center gap-1 shadow-xs">
                            <FileText size={10} />
                            {course.pdfUrl.includes('ddtest') ? 'ddtest.pdf' : 'PDF Original'}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleToggleFavorite(e, course.id)}
                        className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition-all cursor-pointer"
                        title={isFav ? "Remover dos favoritos" : "Salvar nos favoritos"}
                      >
                        <Heart size={14} className={isFav ? "fill-rose-500 text-rose-500" : "text-white"} />
                      </button>
                    </div>

                    {/* Course Title inside book cover */}
                    <div className="relative z-10 pl-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/80 block">
                        {course.discipline}
                      </span>
                      <h3 className="text-base font-black leading-tight tracking-tight line-clamp-2 mt-0.5 drop-shadow-sm">
                        {course.title}
                      </h3>
                    </div>

                    {/* Subtle book textures */}
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    
                    {/* Author & Specs */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={course.author.avatarUrl}
                          alt={course.author.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {course.author.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {course.author.title}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {/* Progress or Key Points */}
                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      
                      {/* Reading Progress Bar if started */}
                      {currentPage > 1 ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                              <BookOpen size={12} />
                              {isFinished ? "Concluído" : `Página ${currentPage} de ${course.totalPages}`}
                            </span>
                            <span className="text-slate-500">{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-purple-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                          <span>{course.totalPages} páginas</span>
                          <span>•</span>
                          <span>{course.totalModules} módulos</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star size={12} className="fill-amber-500" />
                            {course.rating || 5.0}
                          </span>
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={() => setActiveReadingCourse(course)}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:bg-purple-600 group-hover:text-white"
                      >
                        <span>{currentPage > 1 ? "Continuar Leitura" : "Iniciar Leitura"}</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add PDF Course Modal */}
      <AddPdfCourseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCourseAdded={(newCourse) => {
          setCourses(prev => [newCourse, ...prev]);
        }}
      />

    </div>
  );
};
