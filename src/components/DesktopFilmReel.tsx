import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import confetti from "canvas-confetti";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  BarChart2,
  Calendar,
  Trophy,
  Layers,
  Check,
  TrendingUp,
  Clock3,
  Crown,
  RotateCcw,
  MousePointer2,
  Pencil,
  MonitorPlay,
  Play,
  Brain,
  GraduationCap,
  Newspaper,
  MapPin,
  CheckCircle2
} from "lucide-react";
import { cn } from "../lib/utils";

// Helper for floating elements
function FloatingElement({
  children,
  delay = 0,
  yOffset = 20,
  xOffset = 0,
  rotation = 0,
  duration = 4,
  className,
}: any) {
  return (
    <motion.div
      className={cn("absolute", className)}
      initial={{ y: 0, x: 0 }}
      animate={{
        y: [0, yOffset, 0],
        x: [0, xOffset * 0.1, 0],
      }}
      transition={{
        duration: duration + Math.random() * 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

export const frames = [
  {
    id: "filter",
    title: "Personalização Extrema",
    subtitle: "Sistema de Filtros",
    description:
      "Isole matérias, bancas, dificuldades ou questões inéditas. Otimize cada minuto do seu estudo.",
    buttonText: "Personalizar Estudos",
    buttonIcon: <Filter size={18} />,
    themeColor: "#a855f7", // Vibrant Purple
    glowColor: "rgba(168,85,247,0.4)",
    Visual: () => (
      <div className="relative w-full h-[320px] lg:h-[400px] xl:scale-[1.3] 2xl:scale-[1.4] origin-center flex items-center justify-center perspective-[1000px]">
        {/* Fundo Decorativo */}
        <div className="absolute inset-0 bg-purple-500/15 rounded-[3rem] blur-2xl transform-gpu" />

        {/* Card Central */}
        <motion.div
          whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5 }}
          style={{ transformStyle: "preserve-3d" }}
          className="absolute z-20 w-[280px] h-[240px] bg-[#0c192c]/90 backdrop-blur-3xl transform-gpu border border-purple-500/30 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between"
        >
          <div>
            <div className="p-2.5 bg-purple-500/20 w-fit rounded-xl mb-4 border border-purple-500/40">
              <Filter className="text-purple-400" size={20} />
            </div>
            <div className="space-y-3">
              <div className="h-2 w-3/4 bg-white/15 rounded-full" />
              <div className="h-2 w-1/2 bg-white/10 rounded-full" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 relative">
              <span className="text-[10px] bg-purple-500/25 text-purple-200 px-2.5 py-1 rounded-lg font-bold border border-purple-500/40 shadow-sm">
                Apenas FGV
              </span>
              <motion.span
                animate={{
                  backgroundColor: [
                    "rgba(255,255,255,0.08)",
                    "rgba(255,255,255,0.08)",
                    "rgba(168,85,247,0.25)",
                    "rgba(168,85,247,0.25)",
                    "rgba(255,255,255,0.08)",
                  ],
                  color: [
                    "rgba(255,255,255,0.7)",
                    "rgba(255,255,255,0.7)",
                    "#ffffff",
                    "#ffffff",
                    "rgba(255,255,255,0.7)",
                  ],
                  borderColor: [
                    "rgba(255,255,255,0.15)",
                    "rgba(255,255,255,0.15)",
                    "rgba(168,85,247,0.5)",
                    "rgba(168,85,247,0.5)",
                    "rgba(255,255,255,0.15)",
                  ],
                  scale: [1, 1, 0.9, 1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  times: [0, 0.35, 0.4, 0.45, 1],
                }}
                className="text-[10px] bg-white/8 text-white/70 px-2.5 py-1 rounded-lg font-bold border border-white/15 relative overflow-hidden"
              >
                Inéditas
                <motion.div
                  className="absolute inset-0 bg-white/30"
                  initial={{ opacity: 1, scale: 0 }}
                  animate={{ opacity: [0, 0.5, 0], scale: [0, 1.5, 2] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    times: [0, 0.35, 0.45],
                  }}
                />
              </motion.span>
            </div>
          </div>
          <div className="pt-3 border-t border-white/10 relative">
            <motion.div
              animate={{ scale: [1, 1, 0.95, 1, 1] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                times: [0, 0.7, 0.75, 0.85, 1],
              }}
              className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex justify-center shadow-lg shadow-purple-500/25 relative overflow-hidden"
            >
              <span className="text-[10px] font-black text-white uppercase tracking-widest relative z-10">
                Aplicar
              </span>
              <motion.div
                className="absolute inset-0 bg-white/40 z-0"
                initial={{ opacity: 1 }}
                animate={{ opacity: [0, 0, 0.5, 0, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  times: [0, 0.7, 0.75, 0.85, 1],
                }}
              />
            </motion.div>
          </div>

          {/* Animated Cursor */}
          <motion.div
            className="absolute top-0 left-0 z-50 text-white drop-shadow-lg pointer-events-none origin-top-left"
            initial={{ x: 200, y: 240 }}
            animate={{
              x: [240, 140, 140, 140, 140, 140, 140, 240],
              y: [260, 105, 105, 105, 185, 185, 185, 260],
              scale: [1, 1, 0.8, 1, 1, 0.8, 1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              times: [0, 0.3, 0.35, 0.45, 0.7, 0.75, 0.85, 1],
              ease: "easeInOut",
            }}
          >
            <MousePointer2
              size={24}
              fill="#ffffff"
              className="stroke-[#0a1828] drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] -rotate-12"
            />
          </motion.div>
        </motion.div>
      </div>
    ),
  },
  {
    id: "analytics",
    title: "Métricas que Importam",
    subtitle: "Dashboard Profissional",
    description:
      "Transformamos seus dados em visualizações poderosas. Acompanhe taxa de acertos e tempo gasto em tempo real.",
    buttonText: "Ver Desempenho",
    buttonIcon: <BarChart2 size={18} />,
    themeColor: "#06b6d4", // Electric Cyan
    glowColor: "rgba(6,182,212,0.4)",
    Visual: () => (
      <div className="relative w-full h-[320px] lg:h-[400px] xl:scale-[1.3] 2xl:scale-[1.4] origin-center flex items-center justify-center perspective-[1000px]">
        <div className="absolute inset-0 bg-cyan-500/15 rounded-[3rem] blur-2xl transform-gpu" />

        {/* Main Dashboard Card */}
        <motion.div
          whileHover={{ scale: 1.05, rotateY: -5, rotateX: 5 }}
          className="absolute z-20 w-[280px] h-[240px] bg-[#0c192c]/90 backdrop-blur-3xl transform-gpu border border-cyan-500/30 rounded-[2rem] p-6 shadow-2xl flex flex-col justify-between"
        >
          <div className="flex justify-between items-center">
            <div className="p-2.5 bg-cyan-500/20 w-fit rounded-xl border border-cyan-500/40">
              <TrendingUp className="text-cyan-400" size={18} />
            </div>
            <span className="text-2xl font-black text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              78%
            </span>
          </div>

          <div className="relative h-24 mt-4 overflow-hidden w-full bg-cyan-950/30 rounded-xl border border-cyan-500/20 p-2">
            <svg
              className="w-full h-full text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
              viewBox="0 0 200 100"
              preserveAspectRatio="none"
            >
              {/* Grid Lines Pattern */}
              <pattern
                id="grid-pattern-2"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  className="stroke-cyan-500/10"
                  strokeWidth="1"
                />
              </pattern>
              <rect
                x="0"
                y="0"
                width="200"
                height="100"
                fill="url(#grid-pattern-2)"
              />

              {/* The Rising Line */}
              <motion.path
                d="M 5,90 L 15,75 L 30,85 L 50,55 L 65,70 L 85,35 L 100,50 L 125,20 L 140,40 L 165,15 L 175,25 L 195,10"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 3,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />

              {/* Arrow Head */}
              <motion.path
                d="M 183,12 L 195,10 L 193,22"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 1 }}
                animate={{ opacity: [0, 0, 1, 1, 0] }}
                transition={{
                  duration: 4,
                  times: [0, 0.73, 0.75, 0.98, 1],
                  repeat: Infinity,
                }}
              />
            </svg>
          </div>
          <div className="text-[10px] font-bold text-cyan-200/60 text-center mt-2 uppercase tracking-widest">
            Acertos da Semana
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    id: "study-plan",
    title: "Organização Cirúrgica",
    subtitle: "Cronograma Inteligente",
    description:
      "Pare de perder tempo. Crie rotinas, defina metas diárias e deixe a plataforma guiar seu dia a dia.",
    buttonText: "Abrir Cronograma",
    buttonIcon: <Calendar size={18} />,
    themeColor: "#ec4899", // Vivid Pink/Rose
    glowColor: "rgba(236,72,153,0.4)",
    Visual: () => {
      return (
        <div className="relative w-full h-[320px] lg:h-[400px] xl:scale-[1.3] 2xl:scale-[1.4] origin-center flex items-center justify-center perspective-[1000px]">
          <div className="absolute inset-0 bg-pink-500/15 rounded-[3rem] blur-2xl transform-gpu pointer-events-none" />

          {/* Calendar Master Card */}
          <motion.div
            whileHover={{ rotateY: -10, rotateX: 5, scale: 1.05 }}
            className="absolute z-20 w-[280px] h-[240px] bg-[#0c192c]/90 backdrop-blur-3xl transform-gpu border border-pink-500/30 rounded-[2rem] p-5 shadow-2xl flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center border border-pink-500/40 shrink-0">
                <Calendar className="text-pink-400" size={18} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white leading-tight">
                  Revisão Geral
                </h4>
                <div className="text-[9px] text-pink-300 uppercase font-bold tracking-widest mt-0.5">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).replace('.', '')}, 14:00
                </div>
              </div>
            </div>

            <div className="space-y-2 flex-1 overflow-hidden relative">
              {[
                { id: 1, t: "Direito Constitucional", ok: true },
                { id: 2, t: "Língua Portuguesa", ok: true },
                { id: 3, t: "Simulado 50 Questões", ok: false },
              ].map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2.5 bg-white/5 rounded-xl border border-transparent hover:border-pink-500/20 transition-colors"
                >
                  <motion.div
                    {...(!task.ok && {
                      animate: {
                        backgroundColor: [
                          "#01142e",
                          "#01142e",
                          "#ec4899",
                          "#ec4899",
                          "#01142e",
                        ],
                        borderColor: [
                          "rgba(255,255,255,0.2)",
                          "rgba(255,255,255,0.2)",
                          "#f472b6",
                          "#f472b6",
                          "rgba(255,255,255,0.2)",
                        ],
                      },
                      transition: {
                        duration: 4,
                        repeat: Infinity,
                        times: [0, 0.4, 0.45, 0.85, 1],
                      },
                    })}
                    className={cn(
                      "w-4 h-4 rounded shadow-inner flex items-center justify-center border shrink-0",
                      task.ok
                        ? "bg-pink-500 border-pink-400 text-white"
                        : "bg-[#01142e] border-white/20 relative",
                    )}
                  >
                    {task.ok ? (
                      <Check size={10} strokeWidth={4} />
                    ) : (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center text-white"
                        animate={{
                          opacity: [0, 0, 1, 1, 0],
                          scale: [0.5, 0.5, 1, 1, 0.5],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          times: [0, 0.4, 0.45, 0.85, 1],
                        }}
                      >
                        <Check size={10} strokeWidth={4} />
                      </motion.div>
                    )}
                  </motion.div>
                  <motion.span
                    {...(!task.ok && {
                      animate: {
                        color: [
                          "rgba(255,255,255,0.9)",
                          "rgba(255,255,255,0.9)",
                          "rgba(255,255,255,0.4)",
                          "rgba(255,255,255,0.4)",
                          "rgba(255,255,255,0.9)",
                        ],
                      },
                      transition: {
                        duration: 4,
                        repeat: Infinity,
                        times: [0, 0.4, 0.45, 0.85, 1],
                      },
                    })}
                    className={cn(
                      "text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis relative px-1",
                      task.ok ? "text-white/40" : "text-white/90",
                    )}
                  >
                    {task.t}
                    {task.ok && (
                      <div className="absolute left-0 top-1/2 h-[1px] bg-white/40 w-full" />
                    )}
                    {!task.ok && (
                      <motion.div
                        className="absolute left-0 top-1/2 h-[1px] bg-white/40 origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: [0, 0, 1, 1, 0] }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          times: [0, 0.4, 0.45, 0.85, 1],
                        }}
                        style={{ width: "100%" }}
                      />
                    )}
                  </motion.span>
                </div>
              ))}
            </div>

            {/* Animated Cursor */}
            <motion.div
              className="absolute top-0 left-0 z-50 text-white drop-shadow-lg pointer-events-none origin-top-left"
              initial={{ x: 240, y: 260 }}
              animate={{
                x: [240, 24, 24, 24, 240],
                y: [260, 130, 130, 130, 260],
                scale: [1, 1, 0.8, 1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                times: [0, 0.35, 0.4, 0.45, 1],
                ease: "easeInOut",
              }}
            >
              <MousePointer2
                size={24}
                fill="#ffffff"
                className="stroke-[#0a1828] drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] -rotate-12"
              />
            </motion.div>
          </motion.div>
        </div>
      );
    },
  },
  {
    id: "ranking",
    title: "Conquiste as Patentes",
    subtitle: "Novo Sistema de Ranking",
    description:
      "Transforme o estudo em um jogo. Alcance novas patentes, de Iniciante a Mestre, e conquiste o topo do pódio global.",
    buttonText: "Ver Ranking Global",
    buttonIcon: <Trophy size={18} />,
    themeColor: "#f59e0b", // Warm Amber Gold
    glowColor: "rgba(245,158,11,0.4)",
    Visual: () => {
      const [order, setOrder] = useState([1, 2, 3, 0]);

      useEffect(() => {
        let step = 0;
        const interval = setInterval(() => {
          step = (step + 1) % 6;
          switch (step) {
            case 0:
              setOrder([1, 2, 3, 0]);
              break;
            case 1:
              setOrder([1, 2, 0, 3]);
              break;
            case 2:
              setOrder([1, 0, 2, 3]);
              break;
            case 3:
              setOrder([0, 1, 2, 3]);
              break;
            case 4:
              setOrder([0, 1, 2, 3]);
              break;
            case 5:
              setOrder([0, 1, 2, 3]);
              break;
          }
        }, 1200);
        return () => clearInterval(interval);
      }, []);

      const usersDict = [
        {
          id: "voce",
          name: "Você",
          color: "text-amber-400",
          bg: "bg-amber-500/15 border-amber-500/40",
          isYou: true,
        },
        {
          id: "carlos",
          name: "Carlos M.",
          color: "text-zinc-300",
          bg: "bg-white/5 border-transparent",
          pt: "Diamante I",
        },
        {
          id: "ana",
          name: "Ana S.",
          color: "text-orange-400",
          bg: "bg-white/5 border-transparent",
          pt: "Ouro II",
        },
        {
          id: "beatriz",
          name: "Beatriz L.",
          color: "text-white/60",
          bg: "bg-white/5 border-transparent",
          pt: "Prata V",
        },
      ];

      return (
        <div className="relative w-full h-[320px] lg:h-[400px] xl:scale-[1.3] 2xl:scale-[1.4] origin-center flex items-center justify-center perspective-[1000px]">
          <div className="absolute inset-0 bg-amber-500/15 rounded-[3rem] blur-2xl transform-gpu" />

          {/* Ranking Table Card */}
          <motion.div
            whileHover={{ rotateY: 5, rotateX: 5, scale: 1.05 }}
            className="absolute z-20 w-[280px] h-[240px] bg-[#0c192c]/90 backdrop-blur-3xl transform-gpu border border-amber-500/30 rounded-[2rem] p-5 shadow-2xl flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/40 shrink-0">
                <Crown className="text-amber-400" size={18} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white leading-tight">
                  Sua Patente
                </h4>
                <div className="text-[9px] text-amber-300 uppercase font-bold tracking-widest mt-0.5">
                  Suba de Nível
                </div>
              </div>
            </div>

            <div className="space-y-2 flex-1 relative flex flex-col">
              {order.map((userIdx, currentRank) => {
                const u = usersDict[userIdx];
                let dynamicPts = u.pt;
                if (u.isYou) {
                  if (currentRank === 0) dynamicPts = "Mestre";
                  else if (currentRank === 1) dynamicPts = "Diamante III";
                  else if (currentRank === 2) dynamicPts = "Ouro I";
                  else dynamicPts = "Ouro II";
                }
                return (
                  <motion.div
                    layout
                    key={u.id}
                    initial={{ opacity: 1, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      layout: { type: "spring", stiffness: 300, damping: 30 },
                    }}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-xl border transition-colors relative overflow-hidden",
                      currentRank === 0 && u.isYou ? "bg-amber-500/20 border-amber-400/50" : u.bg,
                    )}
                  >
                    {u.isYou && currentRank === 0 && (
                      <motion.div
                        className="absolute inset-0 bg-amber-400/20"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: [0, 1, 0, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          times: [0, 0.2, 0.5, 1],
                        }}
                      />
                    )}
                    <div
                      className={cn(
                        "w-5 h-5 flex items-center justify-center font-black text-xs z-10",
                        u.isYou && currentRank === 0
                          ? "text-amber-400"
                          : "text-white/60",
                      )}
                    >
                      {currentRank + 1}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 z-10">
                      <span className="text-[9px] font-bold text-white shadow-sm">
                        {u.name.charAt(0)}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-bold flex-1 z-10",
                        u.isYou && currentRank === 0 ? "text-amber-300 font-extrabold" : (u.isYou ? "text-amber-400" : "text-white/90"),
                      )}
                    >
                      {u.name}
                    </span>
                    <span className={cn(
                      "text-[10px] font-black z-10 flex items-center",
                      u.isYou && currentRank === 0 ? "text-amber-300" : "text-white/70"
                    )}>
                      {dynamicPts}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      );
    },
  },
  {
    id: "flashcards",
    title: "Revisão Blindada",
    subtitle: "Flashcards Inteligentes",
    description:
      "Use nossos flashcards de repetição espaçada para fixar conceitos permanentemente antes da prova.",
    buttonText: "Acessar Flashcards",
    buttonIcon: <Layers size={18} />,
    themeColor: "#10b981", // Bright Emerald
    glowColor: "rgba(16,185,129,0.4)",
    Visual: () => (
      <div className="relative w-full h-[320px] lg:h-[400px] xl:scale-[1.3] 2xl:scale-[1.4] origin-center flex items-center justify-center perspective-[1200px]">
        <div className="absolute inset-0 bg-emerald-500/15 rounded-[3rem] blur-2xl transform-gpu" />

        {/* Stacked Cards Simulation */}
        <div className="relative w-[280px] h-[240px]">
          {/* Back card */}
          <motion.div
            animate={{ rotateZ: -8, y: -10, opacity: 0.5, scale: 0.9 }}
            className="absolute inset-x-0 bottom-0 top-4 bg-[#0c192c]/70 backdrop-blur transform-gpu border border-white/5 rounded-3xl shadow-xl"
          />
          {/* Mid card */}
          <motion.div
            animate={{ rotateZ: 5, y: -5, opacity: 0.8, scale: 0.95 }}
            className="absolute inset-x-0 bottom-0 top-2 bg-[#0c192c]/85 backdrop-blur-md transform-gpu border border-white/10 rounded-3xl shadow-2xl"
          />
          {/* Front interactive card */}
          <motion.div
            animate={{
              rotateY: [0, 0, 180, 180, 360, 360],
              zIndex: [10, 10, 20, 20, 10, 10],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              times: [0, 0.5, 0.6, 0.85, 0.95, 1],
              ease: "easeInOut",
            }}
            style={{ transformStyle: "preserve-3d" }}
            className="absolute inset-0 z-10"
          >
            {/* Front Face */}
            <div
              className="absolute inset-0 bg-[#0c192c]/95 backdrop-blur-3xl transform-gpu border border-emerald-500/40 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] p-6 flex flex-col justify-between items-center text-center"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <RotateCcw
                size={20}
                className="absolute top-6 right-6 text-emerald-400/50"
              />

              <div className="flex-1 flex items-center justify-center w-full px-2 relative">
                <motion.div
                  animate={{ opacity: [0, 0, 0.3, 0.7, 1, 1, 1, 1] }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    times: [0, 0.1, 0.15, 0.2, 0.25, 0.3, 0.9, 1],
                  }}
                  className="text-lg font-bold text-white/90 drop-shadow"
                >
                  Quais são os Princípios da Administração Pública? (LIMPE)
                </motion.div>

                {/* Scribble Pencil */}
                <motion.div
                  className="absolute text-emerald-400 drop-shadow-[0_2px_10px_rgba(52,211,153,0.5)] z-20 pointer-events-none origin-bottom-left"
                  animate={{
                    x: [-40, -80, 60, -70, 50, -40, 30, 30],
                    y: [-20, -40, -35, 0, 5, 30, 35, 35],
                    rotate: [0, -15, 10, -5, 15, 0, 20, 20],
                    opacity: [0, 1, 1, 1, 1, 1, 0, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    times: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 1],
                    ease: "easeInOut",
                  }}
                >
                  <Pencil size={28} className="fill-emerald-500/20" />
                </motion.div>
              </div>

              <div className="h-1.5 w-16 bg-emerald-400/70 rounded-full mt-4 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            </div>

            {/* Back Face */}
            <div
              className="absolute inset-0 bg-emerald-950/95 backdrop-blur-3xl transform-gpu border border-emerald-400/60 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] p-6 flex flex-col justify-between items-center text-center"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <RotateCcw
                size={20}
                className="absolute top-6 right-6 text-emerald-300"
              />
              <div className="flex-1 flex items-center justify-center w-full px-2">
                <p className="text-lg font-black text-emerald-100 drop-shadow-lg leading-snug">
                  Legalidade, Impessoalidade, Moralidade, Publicidade e
                  Eficiência
                </p>
              </div>
              <div className="h-1.5 w-16 bg-emerald-400 rounded-full mt-4 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
            </div>
          </motion.div>
        </div>
      </div>
    ),
  },
];

export function DesktopFilmReel({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % frames.length);
    }, 10000);
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
    <div className="relative w-full max-w-[95%] xl:max-w-[1600px] mx-auto min-h-[85vh] py-10 flex items-center mb-48 perspective-[2000px] px-8">
      {/* Background Particles (Subtle) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem]">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/20 rounded-full"
            style={{
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="w-full flex-col relative z-20">
        {/* Navigation & Progress Header */}
        <div className="flex flex-col items-center justify-center mb-16 px-4 w-full relative">
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full border border-black/10 dark:border-white/20 bg-black/5 dark:bg-white/10 backdrop-blur-md transform-gpu flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all hover:scale-105 active:scale-95 shadow-md shadow-black/5"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex gap-2 bg-black/5 dark:bg-white/10 backdrop-blur-md transform-gpu p-2 rounded-full border border-black/10 dark:border-white/20 shadow-lg shadow-black/5">
              {frames.map((frame, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "relative px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all overflow-hidden whitespace-nowrap",
                    idx === currentIndex
                      ? "text-black dark:text-white font-black"
                      : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
                  )}
                >
                  <span className="relative z-10">{frame.subtitle}</span>
                  {idx === currentIndex && (
                    <motion.div
                      layoutId="activeTabDesktop"
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

            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full border border-black/10 dark:border-white/20 bg-black/5 dark:bg-white/10 backdrop-blur-md transform-gpu flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all hover:scale-105 active:scale-95 shadow-md shadow-black/5"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
        {/* Film Reel Container */}
        <div
          className="relative w-full overflow-visible my-12 xl:my-24"
          style={{ transformStyle: "preserve-3d" }}
        >
          <AnimatePresence mode="wait" custom={currentIndex}>
            <motion.div
              key={currentIndex}
              custom={currentIndex}
              initial={{
                opacity: 0,
                x: 200,
                rotateY: -15,
                scale: 0.9,
                filter: "blur(10px)",
              }}
              animate={{
                opacity: 1,
                x: 0,
                rotateY: 0,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                x: -200,
                rotateY: 15,
                scale: 0.9,
                filter: "blur(10px)",
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                mass: 1,
              }}
              style={{ willChange: "transform, opacity, filter" }}
              className="relative w-full bg-[#0a1828] border border-white/5 rounded-[3rem] p-10 lg:p-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = offset.x;
                if (swipe < -50) {
                  handleNext();
                } else if (swipe > 50) {
                  handlePrev();
                }
              }}
            >
              {/* Dynamic Glow Background */}
              <motion.div
                className="absolute inset-0 opacity-20 pointer-events-none"
                initial={{
                  background: `radial-gradient(circle at 0% 50%, transparent, transparent)`,
                }}
                animate={{
                  background: `radial-gradient(circle at 0% 50%, ${currentFrame.glowColor}, transparent 70%)`,
                }}
                transition={{ duration: 0.5 }}
              />

              {/* Text Side */}
              <div className="flex-1 relative z-10 w-full text-left">
                <motion.h3
                  initial={{ opacity: 1, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs font-black uppercase tracking-[0.3em] mb-4"
                  style={{ color: currentFrame.themeColor }}
                >
                  {currentFrame.title}
                </motion.h3>
                <motion.h2
                  initial={{ opacity: 1, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-medium text-white/90 tracking-tight leading-[1.1] mb-6"
                >
                  {currentFrame.subtitle}.
                </motion.h2>
                <motion.p
                  initial={{ opacity: 1, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/60 text-lg md:text-2xl xl:text-3xl font-medium max-w-lg leading-relaxed mb-10"
                >
                  {currentFrame.description}
                </motion.p>

                <motion.button
                  initial={{ opacity: 1, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => onNavigate(currentFrame.id)}
                  className="px-8 py-4 rounded-full font-black tracking-widest uppercase text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-3 text-white border border-white/20 shadow-2xl relative overflow-hidden group"
                  style={{
                    backgroundColor: currentFrame.themeColor,
                    boxShadow: `0 15px 30px ${currentFrame.glowColor}`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10">
                    {currentFrame.buttonText}
                  </span>
                  <span className="relative z-10">
                    {currentFrame.buttonIcon}
                  </span>
                </motion.button>
              </div>

              {/* Visual Side */}
              <div className="flex-1 w-full relative z-10">
                <currentFrame.Visual />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
