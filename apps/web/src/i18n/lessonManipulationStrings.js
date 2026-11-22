// Les textes des MANIPULATIONS (« المختبر » de chaque leçon) — chargés AVEC la leçon.
//
// Ils restent sous les clés `lesson:manipulation.<type>.…` : aucun appel `t()`
// ne change. Seul leur FICHIER change : `locales/ar/lesson.manipulation.json`
// (le contenu de l'ancien `lesson.json › manipulation`, ≈ 600 Ko, 137 Ko gzip)
// est fusionné dans le namespace `lesson` à la demande, au lieu de partir dans
// le lot d'entrée de chaque visiteur.
//
// Qui l'attend (jamais une clé brute à l'écran) :
//   - la frontière de routes des leçons (lessons/lessonRouteBoundary.jsx) : les
//     routes d'une leçon ne sont montées qu'une fois ces textes arrivés ;
//   - le runtime de leçon (lessons/common/lessonRuntimeLoader.js), par sûreté ;
//   - la surface de QA (App.jsx, RtlLessonFixture) ;
//   - les tests (src/test/setupOnDemandStrings.js).
// Seul du code de leçon lit ces clés (aucune page, aucun outil du مختبر).
// Voir docs/architecture/BUNDLE_BOUNDARIES.md (§3, « lesson.manipulation »).
import i18n from './index.js';
import { LOCALE } from '../locale.js';

let loading = null;

/** Fusionne l'objet `manipulation` dans le namespace `lesson` (mêmes clés qu'avant). */
export function registerLessonManipulationStrings(manipulation) {
  i18n.addResourceBundle(LOCALE, 'lesson', { manipulation }, true, true);
}

export function areLessonManipulationStringsLoaded() {
  return Boolean(i18n.getResource(LOCALE, 'lesson', 'manipulation'));
}

/** @returns {Promise<void>} résolue quand `lesson:manipulation.*` est lisible. */
export function loadLessonManipulationStrings() {
  if (areLessonManipulationStringsLoaded()) return Promise.resolve();
  if (!loading) {
    loading = import('./locales/ar/lesson.manipulation.json')
      .then((m) => registerLessonManipulationStrings(m.default))
      .catch((error) => { loading = null; throw error; });
  }
  return loading;
}
