/**
 * Ce que le LOT D'ENTRÉE sait du catalogue (docs/architecture/BUNDLE_BOUNDARIES.md §3, « Catalogue »).
 *
 * `@smarter-academy/core` (`coursesData.js`) porte le catalogue complet des quatre années — ≈ 95 Ko gzip de JSON,
 * qui grossit à chaque leçon publiée. Le code du premier téléchargement (barre latérale, `StudentLayout`, section
 * « confiance » de l'accueil) n'a besoin que de la liste des classes et d'un nombre : ils sont calculés au build
 * par le catalogue lui-même (plugin `virtual:grade-summary`, vite.config.js) — jamais retapés.
 *
 * RÈGLE : aucun module du lot d'entrée n'importe `courseLevels`, `getLessonById`, `getUnitById`… Une page qui lit
 * le catalogue complet est PARESSEUSE (`lazy()`), ou charge le catalogue par `import()`.
 * `gradeSummary.test.js` garde l'égalité avec `getAllGrades()`.
 */
import SUMMARY from 'virtual:grade-summary';

/** Même forme que `getAllGrades()` de `@smarter-academy/core`. */
export const getAllGradesSummary = () => SUMMARY.grades;

/** Les classes de la page d'accueil : `{ id, name, levelId }`. */
export const HOME_GRADES = SUMMARY.homeGrades;

/** Nombre de leçons publiées (`status: 'available'`) de toutes les classes actives. */
export const AVAILABLE_LESSON_COUNT = SUMMARY.availableLessonCount;
