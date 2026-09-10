import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  rating: number;
  message: string;
  benefit: string;
  image: string;
  initials: string;
  gradient: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Thiago Silva',
    role: 'Concurseiro PF (Polícia Federal)',
    rating: 5,
    message: 'O cronograma de estudos encaixou perfeitamente na minha rotina corrida de trabalho. Parecia impossível conciliar os plantões com os estudos, mas a divisão automática de ciclos tirou todo o peso do planejamento das minhas costas. Agora só sento e estudo.',
    benefit: 'O cronograma de estudos otimizou minha rotina.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop&q=80',
    initials: 'TS',
    gradient: 'from-purple-500 to-[#266877]'
  },
  {
    id: 2,
    name: 'Amanda Rodrigues',
    role: 'Aprovada no TJ-SP',
    rating: 5,
    message: 'Antes eu começava a estudar super animada e desistia em duas semanas. Com o sistema de metas e o ranking saudável da plataforma, passei a estudar todos os dias sem falta. Finalmente consegui manter a constância e ver minha evolução.',
    benefit: 'Passei a estudar todos os dias.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80',
    initials: 'AR',
    gradient: 'from-purple-500 to-indigo-600'
  },
  {
    id: 3,
    name: 'Bruno Oliveira',
    role: 'Focado na PRF',
    rating: 5,
    message: 'Os flashcards integrados mudaram completamente o meu jogo de revisão. O algoritmo de repetição espaçada é fantástico e facilitou demais memorizar aqueles detalhes chatos e prazos de legislação de trânsito que eu sempre errava.',
    benefit: 'Os flashcards facilitaram a revisão.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&fit=crop&q=80',
    initials: 'BO',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 4,
    name: 'Camila Santos',
    role: 'Concurseira Delegada de Polícia',
    rating: 5,
    message: 'As estatísticas detalhadas de cada questão me ajudaram muito a identificar meus erros de forma cirúrgica. Parei de perder tempo revisando tópicos que eu já dominava e foquei nas minhas reais fraquezas. Minha pontuação subiu muito rápido.',
    benefit: 'As questões ajudaram a identificar meus erros.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&fit=crop&q=80',
    initials: 'CS',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 5,
    name: 'Felipe Costa',
    role: 'Candidato Receita Federal',
    rating: 5,
    message: 'Economizei muito tempo organizando meus estudos por aqui. O que antes eu levava horas tentando estruturar em planilhas complexas e confusas, agora a plataforma resolve em segundos com um clique. É prático e muito inteligente.',
    benefit: 'Economizei tempo organizando meus estudos.',
    image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&fit=crop&q=80',
    initials: 'FC',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 6,
    name: 'Juliana Mendes',
    role: 'Concurseira INSS',
    rating: 5,
    message: 'Eu era a rainha da procrastinação, sempre deixando para amanhã. O cronômetro de ciclos e o acompanhamento visual me deram a disciplina que faltava. Agora sinto orgulho ao ver meu progresso diário e preencher o cronograma.',
    benefit: 'Parei de procrastinar.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&fit=crop&q=80',
    initials: 'JM',
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    id: 7,
    name: 'Rodrigo Souza',
    role: 'Estudante para Tribunais',
    rating: 5,
    message: 'A plataforma deixou meus estudos infinitamente mais organizados. Saber exatamente o que estudar a cada dia, sem ter que ficar decidindo a matéria na hora ou organizando pastas, me deu um alívio mental enorme para focar no que importa.',
    benefit: 'A plataforma deixou meus estudos organizados.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&fit=crop&q=80',
    initials: 'RS',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 8,
    name: 'Larissa Nogueira',
    role: 'Aprovada de Primeira na OAB',
    rating: 5,
    message: 'Evoluí muito em poucas semanas! Minha taxa de acertos em simulados de Direito Constitucional subiu de 55% para quase 85% depois que passei a seguir o ciclo de revisões inteligente sugerido pela plataforma. É simplesmente indispensável.',
    benefit: 'Evoluí muito em poucas semanas.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&fit=crop&q=80',
    initials: 'LN',
    gradient: 'from-teal-400 to-emerald-500'
  }
];

export const UserTestimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Autoplay function for mobile/single view carousel
  const startAutoplay = () => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000); // changes slide every 5 seconds
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, []);

  const handlePrev = () => {
    stopAutoplay();
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    startAutoplay();
  };

  const handleNext = () => {
    stopAutoplay();
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    startAutoplay();
  };

  const handleDotClick = (index: number) => {
    stopAutoplay();
    setCurrentIndex(index);
    startAutoplay();
  };

  return (
    <section id="user-testimonials" className="w-full py-16 md:py-24 bg-[#01142e] border-t border-white/5 relative overflow-hidden z-20">
      {/* Glow Effects */}
      <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -top-40 -left-40 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] -bottom-40 -right-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20 mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.15em] text-purple-500">
              Depoimentos Reais
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.15]"
          >
            Histórias de quem evoluiu com nossa plataforma
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-sm md:text-base mt-4 leading-relaxed font-medium"
          >
            Milhares de estudantes utilizam o Ápice Concurso diariamente para organizar seus ciclos de estudos, revisar com estratégia e acelerar a aprovação.
          </motion.p>
        </div>

        {/* DESKTOP LAYOUT: Infinite sliding rows / Premium Grid */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative bg-[#0a1828]/60 backdrop-blur-xl border ${
                  hoveredIndex === idx ? 'border-purple-500/40 shadow-[0_0_30px_rgba(84,172,191,0.15)] scale-[1.02]' : 'border-white/5 shadow-lg'
                } rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between h-full group cursor-default`}
              >
                {/* Decorative Quote Icon */}
                <div className="absolute top-6 right-6 text-white/85 group-hover:text-purple-500/10 transition-colors pointer-events-none">
                  <Quote size={40} className="transform rotate-180" />
                </div>

                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Benefit Tag */}
                  <span className="inline-block px-2.5 py-1 bg-purple-500/10 rounded-lg text-[10px] font-bold text-white mb-4">
                    {item.benefit}
                  </span>

                  {/* Message */}
                  <p className="text-white/70 text-sm leading-relaxed mb-6 italic font-medium">
                    "{item.message}"
                  </p>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-auto">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border border-purple-500/30 shadow-inner shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate leading-tight group-hover:text-purple-500 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-white/70 truncate font-semibold mt-0.5">
                      {item.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* MOBILE LAYOUT: Swipeable / Animated Premium Carousel */}
        <div className="md:hidden relative px-2">
          
          {/* Active Card Slider */}
          <div className="relative overflow-hidden min-h-[340px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full bg-[#0a1828]/60 border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[290px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {/* Stars */}
                    <div className="flex items-center gap-1">
                      {[...Array(TESTIMONIALS[currentIndex].rating)].map((_, i) => (
                        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {/* Quote indicator */}
                    <Quote size={24} className="text-purple-500/20 transform rotate-180" />
                  </div>

                  {/* Benefit badge */}
                  <span className="inline-block px-2.5 py-1 bg-purple-500/10 rounded-lg text-[10px] font-bold text-white mb-3">
                    {TESTIMONIALS[currentIndex].benefit}
                  </span>

                  {/* Message */}
                  <p className="text-white/85 text-sm leading-relaxed italic font-medium">
                    "{TESTIMONIALS[currentIndex].message}"
                  </p>
                </div>

                {/* User Header */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-6">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-purple-500/30 shrink-0">
                    <img 
                      src={TESTIMONIALS[currentIndex].image} 
                      alt={TESTIMONIALS[currentIndex].name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm leading-none">
                      {TESTIMONIALS[currentIndex].name}
                    </h4>
                    <p className="text-[10px] text-white/70 font-semibold mt-1">
                      {TESTIMONIALS[currentIndex].role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handlePrev}
              className="w-10 h-10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 border border-white/5 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Indicator Dots */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? 'w-6 bg-purple-500' : 'w-2 bg-black/20 dark:bg-white/20'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-10 h-10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 border border-white/5 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
              aria-label="Próximo"
            >
              <ChevronRight size={20} />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
