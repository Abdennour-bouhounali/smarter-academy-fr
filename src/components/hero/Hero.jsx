import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDown, BookOpen, Calculator, PenTool, BrainCircuit } from 'lucide-react';
import MafsGraph from './MafsGraph';

const floatingIcons = [
  { Icon: Calculator, color: 'text-blue-500', bg: 'bg-blue-50', position: 'top-[15%] left-[10%]', delay: 0 },
  { Icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50', position: 'top-[20%] right-[12%]', delay: 0.2 },
  { Icon: BrainCircuit, color: 'text-indigo-500', bg: 'bg-indigo-50', position: 'bottom-[30%] left-[15%]', delay: 0.4 },
  { Icon: PenTool, color: 'text-emerald-500', bg: 'bg-emerald-50', position: 'bottom-[25%] right-[15%]', delay: 0.6 },
];

export default function Hero() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [isGraphLoaded, setIsGraphLoaded] = useState(false);

  const scrollToNext = () => {
    window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative z-10 min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
    >
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Math Icons */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className={`absolute hidden md:flex w-16 h-16 rounded-2xl ${item.bg} border border-white/50 shadow-xl items-center justify-center ${item.position} backdrop-blur-sm z-0`}
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: item.delay }}
        >
          <item.Icon className={`w-8 h-8 ${item.color}`} />
        </motion.div>
      ))}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="flex flex-col gap-12 items-center text-center">

          {/* ── Top Section: Text & CTAs ─────────────────────────── */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-8 shadow-sm"
            >
              <span className="text-lg">🚀</span>
              100% Gratuit et en accès libre
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-space font-bold text-4xl sm:text-5xl lg:text-7xl text-slate-900 mb-6 leading-tight tracking-tight"
            >
              Smarter <span className="gradient-text mt-2">Academy</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-inter text-slate-600 text-lg sm:text-xl font-medium max-w-xl leading-relaxed mb-10"
            >
              Apprenez, pratiquez et maîtrisez les mathématiques gratuitement. Une plateforme éducative interactive pour les élèves du Collège au Lycée.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link
                to="/courses"
                className="px-8 py-4 rounded-xl text-base font-semibold text-white transition-all duration-300 hover:-translate-y-1 flex items-center gap-2 shadow-lg hover:shadow-blue-500/30"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
              >
                <BookOpen size={20} />
                Commencer à apprendre
              </Link>
            </motion.div>
          </div>

          {/* ── Touch Math Widget ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-[700px] mx-auto relative group"
          >
            {/* Glow ring */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-sky-400 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

            <div className="relative bg-white border border-slate-200 rounded-[2rem] shadow-xl overflow-hidden hover:border-emerald-300 transition-colors duration-500">

              {/* Badge */}
              <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-bl-2xl font-mono tracking-wider z-10">
                NOUVEAU
              </div>

              {/* Loader Banner */}
              {!isGraphLoaded && (
                <div className="bg-emerald-50/80 border-b border-emerald-100/50 px-5 sm:px-7 py-3 flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-semibold text-emerald-700 animate-pulse">Chargement du simulateur...</span>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 sm:pt-7 pb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl flex-shrink-0">🎮</div>
                <div className="min-w-0 text-left">
                  <h3 className="font-space font-bold text-xl sm:text-2xl text-slate-900 leading-none">Touch Math</h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-inter mt-1 leading-snug">
                    Modifiez{' '}
                    <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">a</span>
                    {' '}et{' '}
                    <span className="font-mono bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold">b</span>
                    {' '}et observez la droite en direct
                  </p>
                </div>
              </div>

              {/* Equation display */}
              <div className="mx-5 sm:mx-7 mb-4 bg-slate-900 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-center gap-2 sm:gap-3 shadow-inner flex-wrap">
                <span className="font-mono text-slate-300 text-base sm:text-xl font-medium">f(x) =</span>
                {/* coefficient·x — no flex gap between them */}
                <span className="inline-flex items-baseline">
                  <span
                    className="font-mono font-black text-xl sm:text-3xl text-blue-400 tabular-nums"
                    style={{ transition: 'all 0.25s ease' }}
                  >
                    {a === 1 ? '1' : a === -1 ? '−1' : a}
                  </span>
                  <span className="font-mono text-slate-100 text-xl sm:text-3xl font-bold">x</span>
                </span>
                <span className="font-mono text-slate-400 text-lg sm:text-2xl font-medium">{b >= 0 ? '+' : '−'}</span>
                <span
                  className="font-mono font-black text-xl sm:text-3xl text-amber-400 tabular-nums"
                  style={{ transition: 'all 0.25s ease' }}
                >
                  {Math.abs(b)}
                </span>
              </div>

              {/* ── GeoGebra Graph ──────────────────────────────────── */}
              <div
                className="mx-5 sm:mx-7 mb-4 rounded-2xl border border-slate-200 overflow-hidden relative"
                style={{ height: '260px' }}
              >
                {/* Fallback empty background while loading */}
                {!isGraphLoaded && (
                  <div className="absolute inset-0 bg-slate-50 z-0"></div>
                )}
                <MafsGraph a={a} b={b} onLoad={() => setIsGraphLoaded(true)} />
              </div>

              {/* Controls */}
              <div className="grid grid-cols-2 gap-3 mx-5 sm:mx-7 mb-5">

                {/* Pente a */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2">
                  <div className="text-center leading-tight">
                    <span className="block text-[11px] sm:text-xs font-bold text-blue-700 uppercase tracking-widest">Pente</span>
                    <span className="font-mono text-blue-400 text-[10px]">coefficient a</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => setA(Math.max(-5, a - 1))}
                      aria-label="Diminuer a"
                      className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-white border border-blue-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 font-mono text-blue-700 text-xl font-bold transition-all duration-150 shadow-sm active:scale-95 select-none"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-mono font-black text-blue-700 text-2xl tabular-nums select-none">{a}</span>
                    <button
                      onClick={() => setA(Math.min(5, a + 1))}
                      aria-label="Augmenter a"
                      className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-white border border-blue-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 font-mono text-blue-700 text-xl font-bold transition-all duration-150 shadow-sm active:scale-95 select-none"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] text-blue-300 font-mono select-none">de −5 à +5</span>
                </div>

                {/* Ordonnée b */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2">
                  <div className="text-center leading-tight">
                    <span className="block text-[11px] sm:text-xs font-bold text-amber-700 uppercase tracking-widest">Ordonnée</span>
                    <span className="font-mono text-amber-400 text-[10px]">constante b</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => setB(Math.max(-5, b - 1))}
                      aria-label="Diminuer b"
                      className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-white border border-amber-200 hover:bg-amber-500 hover:text-white hover:border-amber-500 font-mono text-amber-700 text-xl font-bold transition-all duration-150 shadow-sm active:scale-95 select-none"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-mono font-black text-amber-700 text-2xl tabular-nums select-none">{b}</span>
                    <button
                      onClick={() => setB(Math.min(5, b + 1))}
                      aria-label="Augmenter b"
                      className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-white border border-amber-200 hover:bg-amber-500 hover:text-white hover:border-amber-500 font-mono text-amber-700 text-xl font-bold transition-all duration-150 shadow-sm active:scale-95 select-none"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] text-amber-300 font-mono select-none">de −5 à +5</span>
                </div>
              </div>

              {/* CTA */}
              <div className="px-5 sm:px-7 pb-5 sm:pb-7">
                <a
                  href="/modules/college/3e/fonctions-lineaires-affines/lessons/01-simulateur-graphique/index.html"
                  className="flex items-center justify-center gap-2 w-full py-3.5 sm:py-4 rounded-xl text-white font-mono text-sm sm:text-base font-bold transition-all duration-300 hover:-translate-y-0.5 shadow-md hover:shadow-emerald-500/30"
                  style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)' }}
                >
                  <span>🚀</span>
                  Lancer le simulateur complet ➔
                </a>
              </div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll down hint */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <span className="text-xs font-mono-jetbrains">découvrir la plateforme</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={16} />
        </motion.div>
      </motion.button>
    </section>
  );
}
