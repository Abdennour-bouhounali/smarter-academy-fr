import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Home, CheckCircle, Lock, ListChecks } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '../hooks/useProgress';
import { isModuleUnlocked, lockedReason } from '@smarter-academy/core';
import ReportButton from '../../../features/reports/ReportButton';
import { scrollToStep } from '../utils/scrollToStep';
import { LessonChromeContext, useLessonChromeLayout } from '../hooks/useLessonChrome';

/**
 * ModuleLayout — shared layout wrapper for every lesson module.
 *
 * Props:
 *   coursePath    — base URL of the lesson (e.g. /courses/college/3e/fonctions-...)
 *   courseTitle   — lesson title for breadcrumb
 *   levelLabel    — human-readable level label, e.g. "Collège" (optional, default "Cours")
 *   gradeLabel    — human-readable grade label, e.g. "3ème" (optional)
 *   moduleNumber  — current module index (1-based, or 0 for a prerequisite
 *     diagnostic module)
 *   totalModules  — total number of modules in this lesson
 *   lastModuleNumber — number of the lesson's LAST module (drives the
 *     "Terminer" button). Defaults to totalModules, which is only correct
 *     when modules are numbered 1..N — a lesson with a module 0 must pass
 *     it explicitly (modules.length ≠ last number there). Set it once in
 *     MODULE_CTX so every module inherits it.
 *   moduleTitle   — title of this module
 *   moduleSubtitle — subtitle / objective sentence
 *   estimatedTime — e.g. "8 min"
 *   xp            — current XP to display
 *   prevLink      — URL of previous module (or null)
 *   nextLink      — URL of next module (or null for last module)
 *   onNextClick   — callback fired when the next button is clicked (mark complete)
 *   lessonId      — ID of the lesson to track progress automatically
 *   sequentialUnlock — when true, this module (and its route) is only
 *     accessible once the previous module is mastered (>= 80%). Opt-in per
 *     lesson via MODULE_CTX, so lessons that don't set it keep the previous
 *     always-open behavior. See @smarter-academy/core.
 *   incompleteSteps — optional array of {num, title} for the module's own
 *     steps not yet done (e.g. [{num: 2, title: 'Des chiffres vers les mots'}]).
 *     When the "Module suivant"/"Terminer" button is disabled, these are
 *     listed next to it and clicking one scrolls straight to that
 *     StepCard (matched by id `step-{num}`) instead of leaving the student
 *     staring at a disabled button with no idea what's missing.
 *   children      — module content
 */
export default function ModuleLayout({
  coursePath,
  courseTitle,
  levelLabel = 'Cours',
  gradeLabel,
  moduleNumber,
  totalModules,
  lastModuleNumber,
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
  isCompleted,
  sequentialUnlock = false,
  stage,
  incompleteSteps,
  // Optional catalogue ids for the breadcrumb links (`/courses?level=…&grade=…`).
  // When absent, the historical derivation from the labels is kept unchanged.
  levelId,
  gradeId: gradeIdProp,
}) {
  const navigate = useNavigate();

  // Le décalage haut réservé par la coquille du module dépend du bandeau
  // réellement rendu au-dessus : la Navbar visiteur est `fixed` sans
  // compensation (le module la réserve), alors que StudentLayout consomme
  // déjà son en-tête mobile via `pt-14 lg:pt-0` (le module ne réserve rien).
  const chrome = useLessonChromeLayout();

  const progressPct = Math.round((moduleNumber / totalModules) * 100);
  const isLastModule = moduleNumber === (lastModuleNumber ?? totalModules);

  const { markModuleVisited, markModuleCompleted, isModuleCompleted } = useProgress(lessonId || 'unknown');

  // `stage` keeps evaluation modules reachable from the start — the final
  // challenge is an alternative path, not just the last module.
  const unlocked = !sequentialUnlock || isModuleUnlocked(isModuleCompleted, moduleNumber, { stage });

  useEffect(() => {
    if (lessonId && moduleNumber && unlocked) {
      markModuleVisited(moduleNumber);
    }
  }, [lessonId, moduleNumber, unlocked, markModuleVisited]);

  useEffect(() => {
    if (lessonId && moduleNumber && isCompleted && unlocked) {
      markModuleCompleted(moduleNumber.toString());
    }
  }, [lessonId, moduleNumber, isCompleted, unlocked, markModuleCompleted]);

  const handleNextClick = (e) => {
    e.preventDefault();
    if (lessonId && moduleNumber) {
      markModuleCompleted(moduleNumber.toString());
    }
    if (onNextClick) onNextClick();
    if (nextLink) navigate(nextLink);
  };

  const breadcrumbLevel = `${levelLabel} ${gradeLabel || ''}`.trim();
  const gradeId = gradeIdProp ?? (gradeLabel ? gradeLabel.replace('ème', 'e') : '3e');
  const levelParam = levelId ?? levelLabel.toLowerCase();

  // Protection de route : un module verrouillé ne s'affiche jamais, même en
  // tapant son URL directement. Aucune navigation, aucune écriture de
  // progression ne se produit pour un module inaccessible.
  if (!unlocked) {
    return (
      <LessonChromeContext.Provider value={chrome}>
      <div className={`min-h-screen flex flex-col justify-between ${chrome.contentOffsetClass} bg-slate-50`}>
        <main className="sa-page py-8 flex-1 flex items-center justify-center">
          <div className="max-w-md w-full bg-white border-2 border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-space font-extrabold text-slate-900">Module verrouillé</h1>
              <p className="text-sm text-slate-500 mt-2">{lockedReason(moduleNumber)}</p>
            </div>
            <Link
              to={coursePath}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none"
            >
              <ArrowLeft size={16} aria-hidden="true" /> Retour au parcours
            </Link>

            {/* Le signalement existe AUSSI ici : « ce module ne devrait pas
                être verrouillé » est précisément le genre de problème qu'on
                veut apprendre. Ce composant a deux sorties — un bouton posé
                dans une seule disparaîtrait sans bruit dans l'autre. */}
            <div className="pt-2">
              <ReportButton
                variant="link"
                context={{
                  lessonCode: lessonId,
                  grade: gradeId,
                  moduleNumber,
                  step: 'module-verrouille',
                }}
              />
            </div>
          </div>
        </main>
        <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 mt-12">
          <p>© {new Date().getFullYear()} Abdennour BOUHOUNALI — Professeur de Mathématiques</p>
        </footer>
      </div>
      </LessonChromeContext.Provider>
    );
  }

  return (
    <LessonChromeContext.Provider value={chrome}>
    <div className={`min-h-screen flex flex-col justify-between ${chrome.contentOffsetClass} bg-slate-50`}>
      <main className="sa-page py-8 flex-1 space-y-8">

        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <nav
            className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500"
            aria-label="Fil d'Ariane"
          >
            <Link to="/courses" className="hover:text-blue-600 flex items-center gap-1">
              <Home size={12} aria-hidden="true" /> Accueil
            </Link>
            <span aria-hidden="true">/</span>
            <Link to={`/courses?level=${levelParam}&grade=${gradeId}`} className="hover:text-blue-600">{breadcrumbLevel}</Link>
            {chapter && chapterTitle && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={`/courses?level=${levelParam}&grade=${gradeId}&chapter=${chapter}`} className="hover:text-blue-600">{chapterTitle}</Link>
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

        {/* « Signaler un problème » — présent sur CHAQUE module, parce qu'il
            est ici, dans le shell partagé, et non recopié dans 1082 modules.
            Le contexte est pris de ce que ModuleLayout a déjà en portée :
            l'élève n'a rien à désigner. */}
        {/* Aligné à GAUCHE, et non à droite : le déclencheur « Ma carte »
            flotte en bas à droite (KnowledgeMap, fixed bottom-20 right-6), et
            un panneau ouvert dans ce coin passait dessous. */}
        <div className="flex justify-start pt-2">
          <ReportButton
            variant="link"
            context={{
              lessonCode: lessonId,
              grade: gradeId,
              moduleNumber,
              step: moduleTitle,
            }}
          />
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center pt-8 pb-4">
          {prevLink ? (
            <Link
              to={prevLink}
              className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-mono text-xs font-bold transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none"
            >
              <ArrowLeft size={16} aria-hidden="true" /> Précédent
            </Link>
          ) : <div />}

          {isLastModule ? (
            isCompleted ? (
              <Link
                to={coursePath}
                onClick={() => {
                  if (lessonId && moduleNumber) {
                    markModuleCompleted(moduleNumber.toString());
                  }
                }}
                className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl font-mono text-xs font-bold shadow-md transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 focus:outline-none bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Terminer <CheckCircle size={16} aria-hidden="true" />
              </Link>
            ) : (
              <IncompleteStepsHint
                label="Terminer"
                icon={<CheckCircle size={16} aria-hidden="true" />}
                incompleteSteps={incompleteSteps}
                onStepClick={scrollToStep}
              />
            )
          ) : nextLink ? (
            <button
              type="button"
              onClick={handleNextClick}
              className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-mono text-xs font-bold shadow-md transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none"
            >
              Module suivant <ArrowRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <IncompleteStepsHint
              label="Module suivant"
              icon={<ArrowRight size={16} aria-hidden="true" />}
              incompleteSteps={incompleteSteps}
              onStepClick={scrollToStep}
            />
          )}
        </div>

      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 mt-12">
        <p>© {new Date().getFullYear()} Abdennour BOUHOUNALI — Professeur de Mathématiques</p>
      </footer>
    </div>
    </LessonChromeContext.Provider>
  );
}

/**
 * Disabled next/finish button + "what's left" popover. A disabled button
 * with no explanation just tells a student "no" — this tells them exactly
 * which step(s) to go back and complete, and jumps straight there on click.
 * Falls back to a plain disabled button (no popover) if the module didn't
 * pass `incompleteSteps` — never breaks a module that hasn't adopted it yet.
 */
function IncompleteStepsHint({ label, icon, incompleteSteps, onStepClick }) {
  const [open, setOpen] = useState(false);
  const steps = incompleteSteps?.filter(Boolean) ?? [];

  if (steps.length === 0) {
    return (
      <button
        type="button"
        disabled
        className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-slate-200 text-slate-400 font-mono text-xs font-bold shadow-sm cursor-not-allowed"
      >
        {label} {icon}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-describedby="incomplete-steps-hint"
        className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-slate-200 text-slate-500 font-mono text-xs font-bold shadow-sm hover:bg-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        {label} {icon}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="incomplete-steps-hint"
            role="status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute bottom-full right-0 mb-2 w-72 max-w-[90vw] rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 shadow-lg text-left z-10"
          >
            <div className="flex items-center gap-2 text-amber-800 font-space font-bold text-sm mb-2">
              <ListChecks className="w-4 h-4 shrink-0" aria-hidden="true" />
              À terminer avant de continuer
            </div>
            <ul className="space-y-1.5">
              {steps.map((step) => (
                <li key={step.num}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onStepClick(step.num);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-white border border-amber-200 text-xs font-semibold text-amber-900 hover:border-amber-400 hover:bg-amber-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    Étape {step.num} — {step.title}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
