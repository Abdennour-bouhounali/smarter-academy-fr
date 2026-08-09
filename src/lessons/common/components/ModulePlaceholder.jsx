import React from 'react';
import ModuleLayout from './ModuleLayout';
import { useProgress } from '../hooks/useProgress';

/**
 * ModulePlaceholder — utilisé pour les modules en cours de développement.
 *
 * @param {number}  number       - Numéro du module
 * @param {string}  title        - Titre affiché
 * @param {string}  lessonId     - ID de la leçon (ex: 'MOD-3E-FONC-V2')
 * @param {string}  moduleId     - ID du module (ex: 'L03')
 * @param {number}  totalModules - Nombre total de modules dans la leçon
 * @param {string}  coursePath   - Path de retour (ex: '/courses/college/3e/...')
 * @param {string}  courseTitle  - Titre court du cours
 * @param {string}  prevLink     - URL du module précédent
 * @param {string}  nextLink     - URL du module suivant
 */
export function ModulePlaceholder({
  number,
  title,
  lessonId,
  moduleId,
  totalModules,
  coursePath,
  courseTitle,
  prevLink,
  nextLink,
}) {
  const { xp, markModuleCompleted } = useProgress(lessonId);

  return (
    <ModuleLayout
      coursePath={coursePath}
      courseTitle={courseTitle}
      moduleNumber={number}
      totalModules={totalModules}
      moduleTitle={title}
      moduleSubtitle="Ce module est en cours de développement — revenez bientôt ! 🚧"
      estimatedTime="-- min"
      xp={xp}
      prevLink={prevLink}
      nextLink={nextLink}
      onNextClick={() => markModuleCompleted(moduleId)}
    >
      <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm font-mono text-sm space-y-4">
        <div className="text-4xl">🚧</div>
        <p className="font-bold text-slate-700">Module {String(number).padStart(2, '0')} — {title}</p>
        <p className="text-xs text-slate-400">Contenu en cours de développement</p>
      </div>
    </ModuleLayout>
  );
}
