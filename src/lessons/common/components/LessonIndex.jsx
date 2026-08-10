import React from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';

/**
 * Static color map — replaces dynamic `bg-${color}-100` patterns.
 * Tailwind cannot purge dynamically interpolated class names at build time.
 * All variants here are kept as full strings so Tailwind can detect them.
 */
const COLOR_MAP = {
  emerald: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    hoverBorder: 'hover:border-emerald-400',
    hoverText: 'group-hover:text-emerald-600',
  },
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    hoverBorder: 'hover:border-indigo-400',
    hoverText: 'group-hover:text-indigo-600',
  },
  violet: {
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    hoverBorder: 'hover:border-violet-400',
    hoverText: 'group-hover:text-violet-600',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    hoverBorder: 'hover:border-blue-400',
    hoverText: 'group-hover:text-blue-600',
  },
  sky: {
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    hoverBorder: 'hover:border-sky-400',
    hoverText: 'group-hover:text-sky-600',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    hoverBorder: 'hover:border-purple-400',
    hoverText: 'group-hover:text-purple-600',
  },
  cyan: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    hoverBorder: 'hover:border-cyan-400',
    hoverText: 'group-hover:text-cyan-600',
  },
  rose: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    hoverBorder: 'hover:border-rose-400',
    hoverText: 'group-hover:text-rose-600',
  },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    hoverBorder: 'hover:border-amber-400',
    hoverText: 'group-hover:text-amber-600',
  },
  slate: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    hoverBorder: 'hover:border-slate-400',
    hoverText: 'group-hover:text-slate-600',
  },
};

function getColor(color, variant) {
  return COLOR_MAP[color]?.[variant] ?? COLOR_MAP.slate[variant];
}

/**
 * LessonIndex — composant générique de page d'accueil d'une leçon.
 *
 * Reçoit une config (LESSON_CONFIG) et affiche :
 *  - le hero de la leçon avec progression
 *  - la liste des modules avec leur état (fait / à faire)
 *
 * Ce composant est réutilisable pour TOUTES les leçons de Smarter Academy.
 * Il suffit de lui passer le bon LESSON_CONFIG et le LESSON_BASE_PATH.
 */
export default function LessonIndex({ config, basePath }) {
  const { completedModules, isModuleCompleted } = useProgress(config.id);

  const totalModules = config.modules.length;
  const completedCount = completedModules.length;
  const pct = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
  const isMastered = pct >= Math.round(config.masteryThreshold * 100);

  return (
    <div className="min-h-screen flex flex-col justify-between pt-16 bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <Link to="/" className="hover:text-blue-600">Accueil</Link>
          <span>/</span>
          <Link to={`/courses?level=${config.level}&grade=${config.grade}`} className="hover:text-blue-600">Collège ({config.grade})</Link>
          <span>/</span>
          <Link to={`/courses?level=${config.level}&grade=${config.grade}&chapter=${config.chapter}`} className="hover:text-blue-600">{config.chapterTitle || config.chapter}</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{config.title}</span>
        </nav>

        {/* HERO CARD */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-semibold">
                {config.emoji} {config.chapter} • {totalModules} modules • ~{config.estimatedDurationMin} min
              </div>

              <h1 className="text-3xl sm:text-4xl font-space font-extrabold text-slate-900 leading-tight">
                {config.title}
              </h1>

              {config.skills && (
                <ul className="text-slate-500 text-sm space-y-1 max-w-xl">
                  {config.skills.slice(0, 3).map((skill, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">▸</span>
                      <span>{skill}</span>
                    </li>
                  ))}
                  {config.skills.length > 3 && (
                    <li className="text-xs text-slate-400 pl-4">
                      + {config.skills.length - 3} autres compétences
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* PROGRESS WIDGET */}
            <div className="w-full md:w-56 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-center shrink-0">
              <div className="text-xs font-mono text-slate-500 font-bold uppercase">Votre Progression</div>

              <div className={`text-3xl font-space font-extrabold ${isMastered ? 'text-emerald-600' : 'text-blue-600'}`}>
                {pct}%
              </div>

              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${isMastered
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <span className="text-xs font-mono font-bold text-slate-500">
                {completedCount}/{totalModules} modules
              </span>

              {isMastered && (
                <div className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 rounded-lg py-1">
                  🏆 Leçon maîtrisée !
                </div>
              )}
            </div>
          </div>
        </section>

        {/* MODULES ROADMAP */}
        <section className="space-y-4">
          <h2 className="text-xl font-space font-bold text-slate-900">🗺️ Parcours des Modules</h2>

          <div className="space-y-3">
            {config.modules.map((module) => {
              const isDone = isModuleCompleted(module.id) || isModuleCompleted(module.number?.toString());
              const modulePath = `${basePath}/${module.slug}`;

              if (module.style === 'featured') {
                return (
                  <Link
                    key={module.id}
                    to={modulePath}
                    className={`group block bg-white p-5 rounded-2xl border transition-all relative overflow-hidden
                      ${isDone
                        ? 'border-emerald-300 bg-emerald-50/30'
                        : `border-slate-200 ${getColor(module.color, 'hoverBorder')} hover:shadow-md`
                      }`}
                  >
                    {isDone && (
                      <div className="absolute top-0 right-0 p-2 text-emerald-600 text-[10px] font-bold bg-emerald-100 rounded-bl-xl font-mono">
                        TERMINÉ ✓
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl ${getColor(module.color, 'bg')} ${getColor(module.color, 'text')} font-mono font-bold text-sm flex items-center justify-center shrink-0`}>
                          {String(module.number).padStart(2, '0')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-space font-bold text-slate-900 ${getColor(module.color, 'hoverText')} transition-colors`}>
                              {module.title}
                            </h3>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                              ~{module.estimatedMin} min
                            </span>
                            {'★'.repeat(module.difficulty).padEnd(5, '☆').split('').map((s, i) => (
                              <span key={i} className={s === '★' ? 'text-amber-400 text-xs' : 'text-slate-200 text-xs'}>{s}</span>
                            ))}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{module.desc}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-mono text-xs font-semibold hidden sm:inline-block shrink-0">
                        {isDone ? 'Revoir ➔' : module.actionText}
                      </span>
                    </div>
                  </Link>
                );
              }

              if (module.style === 'boss') {
                return (
                  <Link
                    key={module.id}
                    to={modulePath}
                    className={`block p-5 bg-slate-900 border rounded-2xl hover:shadow-lg transition-all group relative overflow-hidden
                      ${isDone ? 'border-emerald-500' : 'border-slate-800 hover:border-amber-400'}`}
                  >
                    <div className={`absolute top-0 left-0 w-1 h-full ${isDone ? 'bg-emerald-500' : 'bg-slate-700 group-hover:bg-amber-400'} transition-colors`} />
                    <div className="pl-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs font-mono ${isDone ? 'text-emerald-400' : 'text-amber-400'} font-bold`}>
                            MISSION ({String(module.number).padStart(2, '0')})
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                            ~{module.estimatedMin} min
                          </span>
                        </div>
                        <h3 className="font-bold text-white group-hover:text-amber-300 transition-colors">{module.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{module.desc}</p>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${isDone ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 bg-slate-800'}`}>
                        {isDone ? 'TERMINÉ ✓' : 'À FAIRE'}
                      </span>
                    </div>
                  </Link>
                );
              }

              if (module.style === 'assessment') {
                return (
                  <Link
                    key={module.id}
                    to={modulePath}
                    className={`block p-5 rounded-2xl border-2 transition-all group relative overflow-hidden
                      ${isDone
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-dashed border-slate-300 bg-white hover:border-slate-500 hover:shadow-md'}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                          {isDone ? '🏆' : '📝'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-space font-bold text-slate-900 group-hover:text-slate-700">
                              {module.title}
                            </h3>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                              ~{module.estimatedMin} min
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{module.desc}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full font-mono text-xs font-bold shrink-0 hidden sm:inline-block
                        ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {isDone ? 'Résultats ➔' : module.actionText}
                      </span>
                    </div>
                  </Link>
                );
              }

              return null;
            })}
          </div>
        </section>

      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 mt-12">
        <p>© {new Date().getFullYear()} Abdennour BOUHOUNALI — Professeur de Mathématiques</p>
      </footer>
    </div>
  );
}
