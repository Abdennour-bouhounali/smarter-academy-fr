import { useEffect } from 'react';
import { loadLessonManipulationStrings } from '../../i18n/lessonManipulationStrings';
import { isLessonBuilt, lessonPackFlags, loadLessonLoaders } from '../registry';
import { preloadWorldCode } from '../worldPreload';

/**
 * Le chargeur UNIQUE du runtime de leçon (common/lessonRuntime.jsx).
 *
 * Un seul `import()` pour la fabrique de routes et pour les préchargements :
 * le navigateur mémoïse le module, donc précharger puis naviguer ne
 * télécharge rien deux fois.
 *
 * Pourquoi précharger : le runtime est un lot paresseux (≈ 13 Ko gzip). Une
 * leçon ouverte par URL directe coûte donc un aller-retour de plus (entrée →
 * runtime → page du module). Les pages qui LISTENT des leçons — la page
 * d'unité, l'accueil de l'élève, « دروسي » — le demandent au premier moment
 * d'inactivité : le clic sur une leçon ne l'attend plus. « / » ne le demande
 * jamais. Voir docs/architecture/BUNDLE_BOUNDARIES.md.
 *
 * Les textes des manipulations (`lesson:manipulation.*`, ≈ 440 Ko gzip mesurés le
 * 2026-11-21) ne voyagent avec ce préchargement que si une leçon visée a encore
 * des pages de module (`lessonsNeedLabStrings`) : une leçon v2 — un monde de jeu —
 * ne les lit jamais, et ils disputaient la bande passante à son monde.
 */
/**
 * Le runtime SEUL, sans attendre les textes des manipulations (2026-10-17).
 *
 * La coquille et le cadre de page (common/unit/buildLessonRoutes.jsx) n'en lisent
 * aucun ; seules les pages de MODULE (et leurs labs) en ont besoin — elles les
 * attendent elles-mêmes (`withLessonStrings`). Le SOMMAIRE d'une leçon ne paie
 * donc plus ≈ 137 Ko gzip de textes de 133 labs avant de s'afficher (mesuré :
 * 7,5 s à froid sur tablette 1,6 Mbit/s avant ce changement).
 */
export const loadLessonRuntimeCore = () => import('./lessonRuntime');

/** Un chargeur de page de module qui n'aboutit qu'avec `lesson:manipulation.*` lisible. */
export const withLessonStrings = (loader) => () =>
  Promise.all([loader(), loadLessonManipulationStrings()]).then(([module]) => module);

/**
 * Précharge les textes des labs APRÈS l'affichage du sommaire (appelé par
 * LessonIndex), pour que le clic sur un module ne les attende plus. Un délai,
 * puis un moment libre : lancés plus tôt, ces 137 Ko disputaient la bande
 * passante aux lots du sommaire lui-même (mesuré le 2026-10-17).
 */
export function prefetchLessonStringsWhenIdle(delayMs = 2000) {
  if (typeof window === 'undefined') return;
  const run = () => { loadLessonManipulationStrings().catch(() => {}); };
  window.setTimeout(() => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 3000 });
    else run();
  }, delayMs);
}

let requested = false;
let stringsRequested = false;

function whenIdle(run, timeout) {
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout });
  else setTimeout(run, 200);
}

function prefetchLessonRuntimeWhenIdle(strings) {
  if (typeof window === 'undefined') return;
  if (!requested) {
    requested = true;
    whenIdle(() => Promise.all([loadLessonRuntimeCore(), loadLessonLoaders()]).catch(() => { requested = false; }), 4000);
  }
  if (strings && !stringsRequested) {
    stringsRequested = true;
    whenIdle(() => loadLessonManipulationStrings().catch(() => { stringsRequested = false; }), 4000);
  }
}

/**
 * Do these lessons still need the labs' strings? Only a lesson that still has MODULE pages reads them: a v2 lesson
 * (its pack names a world) has none. The file weighs ≈ 440 KB gzip (measured 2026-11-21): a unit whose lessons are all
 * v2 never asks for it.
 * @param {string[]} lessonIds
 */
const lessonsNeedLabStrings = (lessonIds) => lessonIds.some((id) => isLessonBuilt(id) && !lessonPackFlags(id).world);

/**
 * Pour une page qui liste des leçons : précharge le runtime après son premier rendu.
 * `lessonIds` (the lessons the page leads to, when it knows them): the labs' strings travel only if one of them still
 * needs them. Without it (the student's home, « دروسي »), they travel as before.
 */
export function usePrefetchLessonRuntime(lessonIds = null) {
  const strings = lessonIds ? lessonsNeedLabStrings(lessonIds) : true;
  useEffect(() => { prefetchLessonRuntimeWhenIdle(strings); }, [strings]);
}

/**
 * The CODE of the game worlds of these lessons (three.js and the world: ≈ 400 KB gzip, one chunk set per unit), asked
 * for once the page that lists them is shown and at rest — the student's click on a lesson no longer waits for it.
 * `enabled`: only for whoever plays the world (a student), never for a teacher reading the unit.
 */
export function usePrefetchWorlds(lessonIds, enabled) {
  const key = lessonIds.join('|');
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;
    const id = window.setTimeout(() => whenIdle(() => key.split('|').forEach(preloadWorldCode), 3000), 1500);
    return () => window.clearTimeout(id);
  }, [key, enabled]);
}
