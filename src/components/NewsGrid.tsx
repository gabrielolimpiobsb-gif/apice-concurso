import React, { useRef, useState } from 'react';
import { Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { blogPosts } from '../data/blogData';

interface NewsGridProps {
  onNavigate: (tab: any, params?: any) => void;
}

export const NewsGrid: React.FC<NewsGridProps> = ({ onNavigate }) => {
  // Pegar os primeiros posts. O primeiro será o destaque.
  // Certificar que 'metodo-de-estudo' seja o primeiro.
  const featured = blogPosts.find(p => p.id === 'metodo-de-estudo') || blogPosts[0];
  const others = blogPosts.filter(p => p.id !== featured.id).slice(0, 6);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, offsetWidth } = carouselRef.current;
      const cardWidth = offsetWidth * 0.82;
      const index = Math.round(scrollLeft / (cardWidth + 16));
      setActiveIndex(Math.max(0, Math.min(index, others.length - 1)));
    }
  };

  const scrollToCard = (index: number) => {
    if (carouselRef.current) {
      const cards = carouselRef.current.querySelectorAll<HTMLElement>('.carousel-card-item');
      if (cards[index]) {
        cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        setActiveIndex(index);
      }
    }
  };

  const handlePrev = () => {
    const nextIdx = Math.max(0, activeIndex - 1);
    scrollToCard(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = Math.min(others.length - 1, activeIndex + 1);
    scrollToCard(nextIdx);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 mb-16 relative z-20 mt-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
          <h2 className="text-2xl font-black text-black dark:text-white tracking-tight">Destaques</h2>
        </div>

        {/* Mobile Carousel Controls */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            aria-label="Notícia anterior"
            className="p-2 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white disabled:opacity-30 active:scale-95 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNext}
            disabled={activeIndex === others.length - 1}
            aria-label="Próxima notícia"
            className="p-2 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white disabled:opacity-30 active:scale-95 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* BIG CARD */}
        <div 
          onClick={() => onNavigate('blog', { postId: featured.id })}
          className="w-full relative rounded-2xl overflow-hidden cursor-pointer group h-[300px] lg:h-[400px] shadow-lg border border-black/5 dark:border-white/10"
        >
          <img src={featured.imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200'} alt={featured.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>
          
          <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase shadow">
            {featured.status || 'Destaque'}
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3 line-clamp-3">
              {featured.title}
            </h3>
            <div className="flex items-center gap-2 text-white/70 text-xs font-semibold">
              <Clock size={12} />
              <span>Há 2 horas</span>
            </div>
          </div>
        </div>

        {/* CARDS CONTAINER: CAROUSEL ON MOBILE, GRID ON DESKTOP */}
        <div 
          ref={carouselRef}
          onScroll={handleScroll}
          className="w-full flex md:grid md:grid-cols-2 gap-4 h-auto lg:h-[300px] overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-3 pt-1 -mx-6 px-6 md:mx-0 md:px-0 no-scrollbar scroll-smooth"
        >
          {others.map((post, idx) => (
            <div 
              key={post.id}
              onClick={() => onNavigate('blog', { postId: post.id })}
              className="carousel-card-item w-[82vw] max-w-[340px] md:w-full shrink-0 snap-center md:shrink relative rounded-2xl overflow-hidden cursor-pointer group h-[260px] lg:h-full border border-black/5 dark:border-white/10 shadow-md active:scale-[0.99] transition-all"
            >
              <img src={post.imageUrl || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800'} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10"></div>
              
              <div className="absolute top-3 left-3 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase shadow">
                {post.status || 'News'}
              </div>

              <div className="absolute bottom-5 left-5 right-5">
                <h3 className="text-xl md:text-2xl font-black text-white leading-tight mb-2 line-clamp-3 drop-shadow-md">
                  {post.title}
                </h3>
                <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-semibold">
                  <Clock size={10} />
                  <span>Há {idx + 3} horas</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Pagination Dots */}
        <div className="flex md:hidden items-center justify-center gap-1.5 mt-1">
          {others.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToCard(idx)}
              aria-label={`Ir para notícia ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? 'w-6 bg-purple-500'
                  : 'w-1.5 bg-black/20 dark:bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => onNavigate('blog')}
          className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-md"
        >
          Ver mais notícias
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

