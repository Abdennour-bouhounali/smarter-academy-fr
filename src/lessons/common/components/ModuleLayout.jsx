import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Home, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProgress } from '../hooks/useProgress';

/**
 * ModuleLayout — shared layout wrapper for every lesson module.
 *
 * Props:
 *   coursePath    — base URL of the lesson (e.g. /courses/college/3e/fonctions-...)
 *   courseTitle   — lesson title for breadcrumb
 *   levelLabel    — human-readable level label, e.g. "Collège" (optional, default "Cours")
 *   gradeLabel    — human-readable grade label, e.g. "3ème" (optional)
 *   moduleNumber  — current module index (1-based)
 *   totalModules  — total number of modules in this lesson
 *   moduleTitle   — title of this module
 *   moduleSubtitle — subtitle / objective sentence
 *   estimatedTime — e.g. "8 min"
 *   xp            — current XP to display
 *   prevLink      — URL of previous module (or null)
 *   nextLink      — URL of next module (or null for last module)
 *   onNextClick   — callback fired when the next button is clicked (mark complete)
 *   lessonId      — ID of the lesson to track progress automatically
 *   children      — module content
 */
export default function ModuleLayout({
  coursePath,
  courseTitle,
  levelLabel = 'Cours',
  gradeLabel,
  moduleNumber,
  totalModules,
  moduleTitle,
  moduleSubtitle,
  estimatedTime,
  xp,
  children,
  prevLink,
  nextLink,
  onNextClick,
  lessonId,
  chapter,
  chapterTitle,
}) {
  const navigate = useNavigate();

  const progressPct = Math.round((moduleNumber / totalModules) * 100);

  const handleNextClick = (e) => {
    e.preventDefault();
    if (onNextClick) onNextClick();
    if (nextLink) navigate(nextLink);
  };

  const breadcrumbLevel = gradeLabel ? `${levelLabel} (${gradeLabel})` : levelLabel;

  const { markModuleVisited } = useProgress(lessonId || 'unknown');
  
  useEffect(() => {
    if (lessonId && moduleNumber) {
      markModuleVisited(moduleNumber);
    }
  }, [lessonId, moduleNumber, markModuleVisited]);

  return (
    <div className="min-h-screen flex flex-col justify-between pt-16 bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">

        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <nav
            className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500"
            aria-label="Fil d'Ariane"
          >
            <Link to="/" className="hover:text-blue-600 flex items-center gap-1">
              <Home size={12} aria-hidden="true" /> Accueil
            </Link>
            <span aria-hidden="true">/</span>
            <Link to={`/courses?level=college&grade=3e`} className="hover:text-blue-600">{breadcrumbLevel}</Link>
            {chapter && chapterTitle && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={`/courses?level=college&grade=3e&chapter=${chapter}`} className="hover:text-blue-600">{chapterTitle}</Link>
              </>
            )}
            <span aria-hidden="true">/</span>
            <Link to={coursePath} className="hover:text-blue-600">{courseTitle}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-900 font-semibold" aria-current="page">
              {String(moduleNumber).padStart(2, '0')}. {moduleTitle}
            </span>
          </nav>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-blue-600 font-bold">
                Module {moduleNumber} / {totalModules}
              </span>
              <div
                className="w-16 sm:w-24 h-2 bg-slate-200 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progression : ${progressPct}%`}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-mono text-xs font-bold shrink-0 shadow-sm">
              <span id="xpCount">{xp || 0}</span>
              <span aria-label="points d'expérience">XP</span>
            </div>
          </div>
        </div>

        {/* Module Header */}
        <header className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold">
            <span aria-hidden="true">⏱️</span>
            {estimatedTime || '5 min'} · Module {moduleNumber}
          </div>
          <h1 className="text-3xl font-space font-extrabold text-slate-900">{moduleTitle}</h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            {moduleSubtitle}
          </p>
        </header>

        {/* Module Content */}
        <div className="space-y-8">
          {children}
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center pt-8 pb-4">
          {prevLink ? (
            <Link
              to={prevLink}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-mono text-xs font-bold transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none"
            >
              <ArrowLeft size={16} aria-hidden="true" /> Précédent
            </Link>
          ) : <div />}

          {moduleNumber === totalModules ? (
            <Link
              to={coursePath}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-mono text-xs font-bold shadow-md transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 focus:outline-none ${
                !nextLink && typeof nextLink !== 'undefined' && moduleNumber !== totalModules 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              // We could disable the link if not completed, but typically for the last module 
              // `isCompleted` might not be passed down to ModuleLayout directly. 
              // We'll leave the link active, or if we want to check completion, we can use `isCompleted` if it were passed.
              // For now, Terminer is always visible on the last module as requested.
            >
              Terminer <CheckCircle size={16} aria-hidden="true" />
            </Link>
          ) : nextLink ? (
            <button
              type="button"
              onClick={handleNextClick}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-mono text-xs font-bold shadow-md transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none"
            >
              Module suivant <ArrowRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-200 text-slate-400 font-mono text-xs font-bold shadow-sm cursor-not-allowed"
            >
              Module suivant <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
        </div>

      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 mt-12">
        <p>© {new Date().getFullYear()} Abdennour BOUHOUNALI — Professeur de Mathématiques</p>
      </footer>
    </div>
  );
}

