import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { frames } from './DesktopFilmReel';

export function MobileFilmReel({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % frames.length);
    }, 10000);
    
    // Scroll active tab into view horizontally without moving the whole page vertically
    if (scrollContainerRef.current) {
      const el = document.getElementById(`mobile-tab-${currentIndex}`);
      if (el) {
        const container = scrollContainerRef.current;
        const scrollLeft = el.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (el.clientWidth / 2);
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
    
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % frames.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? frames.length - 1 : prev - 1));
  };

  const currentFrame = frames[currentIndex];

  return (
    <div className="relative w-full flex flex-col items-center pb-12 overflow-hidden pt-2">
      
      {/* Background Particles (Subtle) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/20 rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <div className="w-full flex-col relative z-20 px-4">
        
        {/* Navigation & Progress Header */}
        <div className="flex flex-col items-center justify-center mb-8 gap-4 w-full">
          <div ref={scrollContainerRef} className="flex gap-2 w-full max-w-[90vw] overflow-x-auto no-scrollbar justify-start sm:justify-center items-center bg-black/5 dark:bg-white/10 backdrop-blur-md transform-gpu p-2 rounded-full border border-black/10 dark:border-white/20 shadow-md shadow-black/5 snap-x">
            {frames.map((frame, idx) => (
              <button
                key={idx}
                id={`mobile-tab-${idx}`}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "relative px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all overflow-hidden whitespace-nowrap snap-center shrink-0",
                  idx === currentIndex
                    ? "text-black dark:text-white font-black"
                    : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
                )}
              >
                <span className="relative z-10">{frame.subtitle}</span>
                {idx === currentIndex && (
                  <motion.div
                    layoutId="activeTabMobile"
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: `${frame.themeColor}30`,
                      border: `1px solid ${frame.themeColor}50`,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Film Reel Container */}
        <div className="relative w-full h-[580px] overflow-visible perspective-[1200px]">
          <AnimatePresence mode="wait" custom={currentIndex}>
            <motion.div
              key={currentIndex}
              custom={currentIndex}
              initial={{ opacity: 1, x: 100, rotateY: -10, scale: 0.95, filter: 'blur(5px)' }}
              animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -100, rotateY: 10, scale: 0.95, filter: 'blur(5px)' }}
              transition={{ type: "spring", stiffness: 250, damping: 25, mass: 1 }}
              style={{ willChange: "transform, opacity, filter" }}
              className="absolute inset-0 w-full h-full bg-[#0a1828] border border-white/10 rounded-[2rem] p-5 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset }) => {
                const swipe = offset.x;
                if (swipe < -40) {
                  handleNext();
                } else if (swipe > 40) {
                  handlePrev();
                }
              }}
            >
              {/* Dynamic Glow Background */}
              <motion.div 
                className="absolute inset-0 opacity-20 pointer-events-none rounded-[2rem] overflow-hidden"
                initial={{ background: `radial-gradient(circle at 50% 0%, transparent, transparent)` }}
                animate={{ background: `radial-gradient(circle at 50% 0%, ${currentFrame.glowColor}, transparent 70%)` }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Fixed Arrows */}
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
                className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/50 text-white/70 hover:text-white backdrop-blur-md transform-gpu border border-white/10 active:scale-95 transition-all"
              >
                 <ChevronLeft size={24} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }} 
                className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/50 text-white/70 hover:text-white backdrop-blur-md transform-gpu border border-white/10 active:scale-95 transition-all"
              >
                 <ChevronRight size={24} />
              </button>

              {/* Text Side (Top) */}
              <div className="relative z-10 w-full text-center mt-2 mb-4 flex flex-col items-center px-4">
                 <motion.h3 
                   initial={{ opacity: 1, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                   className="text-[10px] font-black uppercase tracking-[0.2em] mb-2"
                   style={{ color: currentFrame.themeColor }}
                 >
                   {currentFrame.title}
                 </motion.h3>
                 <motion.h2 
                   initial={{ opacity: 1, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                   className="text-2xl font-medium text-white/90 tracking-tight leading-[1.1] mb-2"
                 >
                   {currentFrame.subtitle}.
                 </motion.h2>
                 <motion.p 
                   initial={{ opacity: 1, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                   className="text-white/60 text-xs font-medium leading-relaxed"
                 >
                   {currentFrame.description}
                 </motion.p>
              </div>

              {/* Visual Side (Middle) */}
              <div className="flex-1 w-full relative z-10 flex items-center justify-center transform scale-[0.85] sm:scale-95 -my-8 overflow-visible">
                 <currentFrame.Visual />
              </div>

              {/* Button Side (Bottom) */}
              <div className="relative z-10 w-full mt-4">
                 <motion.button 
                   initial={{ opacity: 1, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                   onClick={() => onNavigate(currentFrame.id)}
                   className="w-full py-3.5 rounded-2xl font-black tracking-widest uppercase text-xs active:scale-95 transition-all flex items-center justify-center gap-2 text-white border border-white/20 relative overflow-hidden"
                   style={{
                     backgroundColor: currentFrame.themeColor,
                     boxShadow: `0 10px 20px ${currentFrame.glowColor}`
                   }}
                 >
                    <span className="relative z-10">{currentFrame.buttonText}</span> 
                 </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
