import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, BarChart2, ChevronDown, Lock, Play, CheckCircle2, ArrowRight } from 'lucide-react';
import { courseLevels } from '../data/coursesData';

export default function CoursesPage() {
  // Manage expanded state for grade sections (by default all open)
  const [expandedGrades, setExpandedGrades] = useState(() => {
    const initial = {};
    courseLevels.forEach(level => {
      level.grades.forEach(grade => {
        initial[grade.id] = true;
      });
    });
    return initial;
  });

  const toggleGrade = (gradeId) => {
    setExpandedGrades(prev => ({
      ...prev,
      [gradeId]: !prev[gradeId]
    }));
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-50/50 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative py-16 md:py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/60 via-slate-50 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono-jetbrains font-semibold uppercase tracking-wider mb-4 shadow-2xs">
              <Sparkles size={14} className="text-blue-600 animate-pulse" />
              Catalogue Interactif Smarter
            </div>

            <h1 className="font-space font-bold text-4xl sm:text-5xl md:text-6xl text-slate-900 leading-tight">
              Cours de Mathématiques
            </h1>

            <p className="font-inter text-slate-600 text-lg sm:text-xl font-medium max-w-2xl mx-auto mt-2">
              Choisissez votre niveau puis découvrez tous les chapitres disponibles.
            </p>

            <p className="font-inter text-slate-500 text-xs sm:text-sm max-w-xl mx-auto mt-3 leading-relaxed">
              Des leçons indépendantes, interactives et très visuelles, spécialement conçues selon le programme officiel de l'Éducation Nationale pour maximiser la compréhension et la rétention.
            </p>
          </motion.div>
        </div>
      </section>

      {/* LEVEL NAVIGATION CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {courseLevels.map((level, idx) => (
            <motion.button
              key={level.id}
              onClick={() => scrollToSection(level.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className={`p-5 sm:p-6 rounded-2xl border text-left transition-all duration-300 bg-white hover:shadow-lg flex flex-col justify-between group ${level.lightBg}`}
            >
              <div>
                <div className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 transition-transform w-fit">
                  {level.icon}
                </div>
                <h3 className="font-space font-bold text-lg sm:text-xl text-slate-900 flex items-center justify-between">
                  {level.title}
                  <ArrowRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${level.accentColor}`} />
                </h3>
                <p className="font-inter text-xs text-slate-500 mt-1 leading-snug">
                  {level.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono-jetbrains font-semibold text-slate-600">
                <span>{level.grades.flatMap(g => g.lessons).length} chapitres</span>
                <span className={level.accentColor}>Explorer ➔</span>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* MAIN CONTENT SECTIONS BY LEVEL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {courseLevels.map((level) => (
          <section key={level.id} id={level.id} className="scroll-mt-24 space-y-6">
            
            {/* Level Section Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{level.icon}</span>
                <div>
                  <h2 className="font-space font-bold text-2xl sm:text-3xl text-slate-900 flex items-center gap-3">
                    {level.title}
                    <span className={`text-xs font-mono-jetbrains px-3 py-1 rounded-full font-semibold ${level.badgeBg}`}>
                      {level.grades.map(g => g.name).join(' • ')}
                    </span>
                  </h2>
                  <p className="font-inter text-xs sm:text-sm text-slate-500 mt-0.5">
                    {level.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Grades & Lessons List */}
            <div className="space-y-8">
              {level.grades.map((grade) => {
                const isExpanded = expandedGrades[grade.id] ?? true;

                return (
                  <div key={grade.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    
                    {/* Grade Section Accordion Header */}
                    <button
                      onClick={() => toggleGrade(grade.id)}
                      className="w-full px-6 py-4 bg-slate-50/80 hover:bg-slate-100/80 transition-colors flex items-center justify-between text-left focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-space font-bold text-xs flex items-center justify-center">
                          {grade.name.slice(0, 2)}
                        </span>
                        <h3 className="font-space font-bold text-lg text-slate-900">
                          {grade.name}
                        </h3>
                        <span className="text-xs font-mono-jetbrains text-slate-500 bg-slate-200/60 px-2.5 py-0.5 rounded-full font-medium">
                          {grade.lessons.length} cours
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-xs font-inter hidden sm:inline">
                          {isExpanded ? 'Masquer' : 'Afficher'}
                        </span>
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </button>

                    {/* Lessons Grid */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {grade.lessons.map((lesson) => {
                              const isAvailable = lesson.status === 'available';

                              return isAvailable ? (
                                <Link
                                  key={lesson.id}
                                  to={lesson.path}
                                  className="group relative bg-white rounded-xl border border-blue-200 p-5 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between overflow-hidden"
                                >
                                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
                                  
                                  <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                      <span className="text-2xl p-2 rounded-xl bg-blue-50 border border-blue-100 group-hover:scale-105 transition-transform">
                                        {lesson.icon}
                                      </span>
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono-jetbrains text-[10px] font-bold">
                                        <CheckCircle2 size={12} className="text-emerald-600" />
                                        Disponible
                                      </span>
                                    </div>

                                    <h4 className="font-space font-bold text-slate-900 text-base mb-1.5 group-hover:text-blue-600 transition-colors">
                                      {lesson.title}
                                    </h4>

                                    <p className="font-inter text-slate-600 text-xs leading-relaxed line-clamp-2 mb-4">
                                      {lesson.description}
                                    </p>
                                  </div>

                                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono-jetbrains text-slate-500">
                                    <div className="flex items-center gap-3">
                                      <span className="flex items-center gap-1"><Clock size={12} /> {lesson.duration}</span>
                                      <span className="flex items-center gap-1"><BarChart2 size={12} /> {lesson.difficulty}</span>
                                    </div>
                                    <span className="font-semibold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                      Démarrer <Play size={10} className="fill-current" />
                                    </span>
                                  </div>
                                </Link>
                              ) : (
                                <div
                                  key={lesson.id}
                                  className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-5 flex flex-col justify-between opacity-85 hover:opacity-100 transition-opacity"
                                >
                                  <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                      <span className="text-2xl p-2 rounded-xl bg-slate-100 border border-slate-200/60 grayscale opacity-80">
                                        {lesson.icon}
                                      </span>
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200/80 border border-slate-300/50 text-slate-600 font-mono-jetbrains text-[10px] font-semibold">
                                        <Lock size={10} className="text-slate-500" />
                                        Bientôt disponible
                                      </span>
                                    </div>

                                    <h4 className="font-space font-bold text-slate-800 text-base mb-1.5">
                                      {lesson.title}
                                    </h4>

                                    <p className="font-inter text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
                                      {lesson.description}
                                    </p>
                                  </div>

                                  <div className="pt-3 border-t border-slate-200/50 flex items-center justify-between text-[11px] font-mono-jetbrains text-slate-400">
                                    <div className="flex items-center gap-3">
                                      <span className="flex items-center gap-1"><Clock size={12} /> {lesson.duration}</span>
                                      <span className="flex items-center gap-1"><BarChart2 size={12} /> {lesson.difficulty}</span>
                                    </div>
                                    <span className="text-slate-400 font-medium">En cours de préparation</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                );
              })}
            </div>

          </section>
        ))}
      </div>

    </div>
  );
}
