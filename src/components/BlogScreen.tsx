import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, MapPin, Calendar, Bell, ExternalLink, Search, FileText, CheckCircle2, Share2, Flame, ArrowRight, Brain, Target, LibraryBig, CalendarDays } from 'lucide-react';
import { NavTab } from '../App';
import { BlogArticleSection } from './BlogArticleSection';
import ReactMarkdown from 'react-markdown';
import { blogPosts, STATES, BrazilState, BlogPost } from '../data/blogData';
import { Logo } from './Logo';
import { useSEO } from '../lib/useSEO';

interface BlogScreenProps {
  onNavigate: (tab: NavTab | "back", params?: any) => void;
  initialPostId?: string | null;
}

export const BlogScreen: React.FC<BlogScreenProps> = ({ onNavigate, initialPostId }) => {
  const [selectedState, setSelectedState] = useState<BrazilState | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPost, setExpandedPost] = useState<string | null>(initialPostId || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShare = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const url = window.location.origin + '/blog-' + id;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };


  useEffect(() => {
    if (initialPostId) {
      setExpandedPost(initialPostId);
      
      // Try to scroll to post after a small delay to ensure rendering
      setTimeout(() => {
         const el = document.getElementById('post-' + initialPostId);
         if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
         }
      }, 100);
    } else {
      setExpandedPost(null);
    }
  }, [initialPostId]);


  const filteredPosts = blogPosts.filter(post => {
    const matchesState = selectedState === 'Todos' || 
      (Array.isArray(post.state) ? post.state.includes(selectedState as BrazilState) : post.state === selectedState);
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.seoTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesSearch;
  });

  const containerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [expandedPost]);

  const toggleExpand = (id: string) => {
    const isExpanding = expandedPost !== id;
    setExpandedPost(isExpanding ? id : null);
    if (isExpanding) {
       // We use window.history.pushState inside App, so we just call onNavigate
       onNavigate('blog', { postId: id });
    } else {
       window.location.href = '/blog';
    }
  };

    const expandedPostData = expandedPost ? blogPosts.find(p => p.id === expandedPost) : null;

  if (expandedPostData) {
    const post = expandedPostData;
    const isPrf = post.id === 'prf';
    const isPf = post.id === 'pf-agente';
    const isBb = post.id === 'banco-do-brasil';

    return (
      <div ref={containerRef} className="h-[100dvh] overflow-y-auto no-scrollbar bg-[#f9fafc] dark:bg-[#01142e] text-black dark:text-white font-sans flex flex-col relative pb-32">
        <header className="sticky top-0 z-50 bg-[#f9fafc]/80 dark:bg-[#01142e]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setExpandedPost(null);
                onNavigate('back');
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#0a1828] shadow-sm border border-black/5 dark:border-white/10 hover:scale-105 transition-transform"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="text-sm font-bold tracking-widest uppercase text-black/50 dark:text-white/50 hidden sm:inline-block">
              Voltar ao Blog
            </span>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
            <Logo imgClassName="h-6 sm:h-8" />
          </div>

          <button
            onClick={(e) => handleShare(e, post.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#0a1828] shadow-sm border border-black/5 dark:border-white/10 hover:scale-105 transition-transform text-black/70 dark:text-white/70 text-sm font-bold"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">{copiedId === post.id ? 'Link Copiado!' : 'Compartilhar'}</span>
          </button>
        </header>

        {/* Hero Section Redesign */}
        <div className="w-full relative overflow-hidden bg-white dark:bg-[#0a1828] border-b border-black/5 dark:border-white/5">
           {/* Background Accents */}
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>
           {isPrf && <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>}
           {isPf && <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-zinc-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>}

           <div className="w-full px-6 md:px-12 xl:px-24 2xl:px-32 pt-16 pb-20 relative z-10 text-center flex flex-col items-center">
             <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-500 rounded-full text-sm font-bold tracking-wider uppercase border border-purple-500/20">
                  <MapPin size={16} />
                  {Array.isArray(post.state) ? post.state.join(', ') : post.state}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-sm font-bold uppercase tracking-wider">
                  <CheckCircle2 size={16} />
                  {post.status}
                </span>
             </div>
             
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-black dark:text-white leading-[1.1] tracking-tight mb-8">
               {post.title}
             </h1>

             {post.importantInfo && (
                <p className="text-xl md:text-2xl text-black/60 dark:text-white/60 font-medium max-w-4xl mx-auto leading-relaxed">
                  {post.importantInfo}
                </p>
             )}
           </div>
        </div>

        
        <article className="w-full px-6 md:px-12 py-12 md:py-20">
          <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            {/* MAIN COLUMN */}
            <div className="flex-1 w-full min-w-0 flex flex-col gap-10">

              {/* MAIN CONTENT */}
              {isPrf && (
                <img src="/prf-banner.png" alt="Concurso PRF 2024" className="w-full rounded-[2rem] shadow-xl border border-black/5 dark:border-white/5 object-cover" />
              )}
              {isPf && (
                <img src="/pf-banner.png" alt="Concurso PF 2026" className="w-full rounded-[2rem] shadow-xl border border-black/5 dark:border-white/5 object-cover bg-black" />
              )}
              {isBb && (
                <div className="w-full">
                  <img 
                    src={post.imageUrl || "https://images.unsplash.com/photo-1556740714-a8395b3bf30f?auto=format&fit=crop&q=80&w=1200"} 
                    alt="Concurso Banco do Brasil 2026/2027" 
                    className="w-full max-h-[460px] rounded-[2rem] shadow-xl border border-black/5 dark:border-white/5 object-cover" 
                  />
                </div>
              )}
              {!isPrf && !isPf && !isBb && post.imageUrl && post.id !== 'metodo-de-estudo' && (
                <img src={post.imageUrl} alt={post.title} className="w-full max-h-[460px] rounded-[2rem] shadow-xl border border-black/5 dark:border-white/5 object-cover" />
              )}

              {post.id === 'metodo-de-estudo' ? (
                <div className="-mt-16">
                  <BlogArticleSection onNavigate={onNavigate} />
                </div>
              ) : post.content && (
                <div className="w-full text-xl text-black/85 dark:text-white/85 leading-[1.8] space-y-8 font-medium">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-4xl md:text-6xl font-black text-black dark:text-white mt-12 mb-10 leading-tight tracking-tight drop-shadow-sm" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white mt-16 mb-8 flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-6" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-2xl font-bold mt-12 mb-6 text-purple-500" {...props} />,
                      p: ({node, ...props}) => <p className="mb-6" {...props} />,
                      img: ({node, ...props}) => (
                        <div className="my-8 rounded-2xl overflow-hidden shadow-lg border border-black/5 dark:border-white/5">
                          <img className="w-full max-h-[440px] object-cover" {...props} />
                          {props.alt && <span className="block text-center text-xs text-black/50 dark:text-white/50 py-2.5 bg-black/5 dark:bg-white/5 font-medium">{props.alt}</span>}
                        </div>
                      ),
                      ul: ({node, ...props}) => <ul className="space-y-4 my-8 p-8 bg-black/5 dark:bg-white/5 rounded-3xl" {...props} />,
                      li: ({node, ...props}) => (
                        <li className="flex items-start gap-4">
                          <div className="mt-2.5 shrink-0 w-2 h-2 rounded-full bg-purple-500" />
                          <div className="flex-1">{props.children}</div>
                        </li>
                      ),
                      strong: ({node, ...props}) => <strong className="font-bold text-black dark:text-white bg-purple-500/10 px-1 py-0.5 rounded-sm" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="p-8 md:p-10 text-2xl font-semibold border-l-4 border-purple-500 bg-white dark:bg-[#0a1828] rounded-r-3xl italic shadow-xl shadow-black/5 dark:shadow-none my-12" {...props} />,
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>
              )}






            </div>

            {/* SIDEBAR */}
            <aside className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pb-4 sidebar-scroll flex flex-col gap-8">
              {/* Updates Timeline Widget (Moved to Sidebar) */}
              {post.updates && post.updates.length > 0 && (
                <div className="bg-white dark:bg-[#0a1828] rounded-[2rem] p-6 border border-black/5 dark:border-white/5 shadow-xl">
                  <h3 className="text-lg font-black text-black dark:text-white mb-5 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
                    <Bell size={18} className="text-purple-500" />
                    Linha do Tempo
                  </h3>
                  <div className="flex flex-col gap-5 relative before:absolute before:inset-y-2 before:left-[7px] before:w-[2px] before:bg-black/5 dark:before:bg-white/5">
                    {post.updates.map((update, i) => (
                      <div key={i} className="flex gap-3 relative z-10">
                        <div className="w-[16px] h-[16px] rounded-full bg-purple-500 border-4 border-white dark:border-[#0a1828] shrink-0 mt-0.5 shadow-sm" />
                        <div>
                          <span className="text-[10px] font-black tracking-widest uppercase text-purple-500 block mb-0.5">{update.date}</span>
                          <p className="text-xs text-black/80 dark:text-white/80 font-medium leading-relaxed">{update.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-white dark:bg-[#0a1828] rounded-[2rem] p-6 md:p-8 border border-black/5 dark:border-white/5 shadow-xl">
                <h3 className="text-xl font-black text-black dark:text-white mb-4 border-b border-black/5 dark:border-white/5 pb-3">
                  Resumo do Concurso
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-4 rounded-xl">
                    <span className="text-black/50 dark:text-white/50 font-bold text-sm">Status</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-500/10 px-3 py-1 rounded-full">{post.status}</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-4 rounded-xl">
                    <span className="text-black/50 dark:text-white/50 font-bold text-sm">Abrangência</span>
                    <span className="text-black/80 dark:text-white/80 font-bold text-sm text-right max-w-[180px] truncate">{Array.isArray(post.state) ? post.state.join(', ') : post.state}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </article>

      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-[100dvh] overflow-y-auto no-scrollbar bg-[#f9fafc] dark:bg-[#01142e] text-black dark:text-white font-sans flex flex-col pb-20">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#f9fafc]/90 dark:bg-[#01142e]/90 backdrop-blur-md border-b border-black/5 dark:border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#0a1828] shadow-sm border border-black/5 dark:border-white/10 hover:scale-105 transition-transform"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-sm font-bold tracking-widest uppercase text-black/50 dark:text-white/50 hidden sm:inline-block border-r border-black/10 dark:border-white/10 pr-3 mr-1">
            Voltar
          </span>
          <h1 className="text-xl font-bold tracking-tight">Blog e Concursos</h1>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none hidden sm:block">
          <Logo imgClassName="h-6 sm:h-8" />
        </div>
      </header>

      <div className="flex-1 w-full px-4 sm:px-8 py-6 flex flex-col gap-6">
        
        {/* FILTERS */}
        <div className="flex flex-col gap-4 w-full px-6 md:px-12 xl:px-24 2xl:px-32 mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por cargo, órgão ou palavra-chave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-[#0a1828] border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => setSelectedState('Todos')}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                selectedState === 'Todos' 
                  ? 'bg-purple-500 border-purple-500 text-white shadow-md' 
                  : 'bg-white dark:bg-[#0a1828] border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              Todos
            </button>
            {STATES.map(state => (
              <button
                key={state}
                onClick={() => setSelectedState(state)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  selectedState === state 
                    ? 'bg-purple-500 border-purple-500 text-white shadow-md' 
                    : 'bg-white dark:bg-[#0a1828] border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>


        {/* POSTS LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-6 md:px-12 xl:px-24 2xl:px-32 mx-auto">
          
            {filteredPosts.length > 0 ? (
              filteredPosts.flatMap((post, index) => {
                const items = [];
                if (index > 0 && index % 2 === 0) {
                  items.push(
                    <div key={'ad-' + post.id}>
                    </div>
                  );
                }
                items.push(
                  <div id={'post-' + post.id} key={post.id}
                    onClick={() => toggleExpand(post.id)}
                    className="bg-white dark:bg-[#0a1828] cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-black/10 dark:border-white/10 hover:border-purple-500/50 flex flex-col group relative"
                  >
                    <div className="h-40 relative overflow-hidden bg-gradient-to-br from-[#1d4ed8] to-[#1e3a8a]">
                      {post.imageUrl ? (
                        <img src={post.imageUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70 mix-blend-normal brightness-105" />
                      ) : (
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div className="bg-black/40 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5">
                          <FileText size={14} className="text-purple-500" />
                          Guia Completo
                        </div>
                        <div className="bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md">
                          Ler Artigo <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>

                    {/* Resumo do Post */}
                    <div className="p-6 flex flex-col flex-1 gap-3">
                      <h2 className="text-xl font-bold text-black dark:text-white leading-tight group-hover:text-purple-500 transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-sm text-black/60 dark:text-white/60 line-clamp-2 leading-relaxed">
                        {post.seoTitle}
                      </p>
                      <div className="flex flex-wrap gap-2 items-center mt-2 pt-4 border-t border-black/5 dark:border-white/10">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 text-purple-500 rounded-md text-xs font-bold tracking-wide uppercase">
                          <MapPin size={12} />
                          {Array.isArray(post.state) ? post.state.join(', ') : post.state}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60 rounded-md text-xs font-semibold">
                          <CheckCircle2 size={12} />
                          {post.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
                return items;
              })
            ) : (
              <div 
                className="py-12 flex flex-col items-center justify-center text-center px-6 border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl"
              >
                <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <FileText className="text-black/40 dark:text-white/40" size={32} />
                </div>
                <h3 className="text-lg font-bold text-black dark:text-white mb-2">Nenhum concurso no momento</h3>
                <p className="text-sm text-black/60 dark:text-white/60 max-w-sm">
                  Ainda não há publicações sobre concursos para este filtro. Quando houver editais e novidades, eles aparecerão aqui.
                </p>
              </div>
            )}
          
        </div>
        
      </div>
    </div>
  );
};