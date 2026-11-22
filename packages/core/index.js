// @smarter-academy/core — platform-agnostic logic shared by every client
// (today: the web app; eventually: a React Native app too). Zero React,
// zero DOM, zero bundler-specific APIs (no `import.meta`, no `localStorage`).
// See README.md in this package for the boundary this enforces.

// `mathComparison.js` n'est VOLONTAIREMENT pas réexporté ici.
//
// Il tire @cortex-js/compute-engine (~2,6 Mo). Ce baril est importé par 299
// fichiers, dont les pages d'accueil, de cours et de tarifs : le réexporter
// plaçait le moteur symbolique dans le lot d'entrée, et donc dans le premier
// rendu de CHAQUE visiteur, y compris anonyme.
//
// Les deux seuls consommateurs réels l'importent par son chemin :
//   import { compareMathExpressions } from '@smarter-academy/core/mathComparison.js';
// ce qui laisse le moteur dans le lot de la page qui s'en sert.
export * from './numberFormat.js';
export * from './geometry.js';
export * from './algebra.js';
export * from './random.js';
export * from './lessonAccess.js';
export * from './errorClassifiers.js';
export * from './auth.js';
export * from './validation/validateChoiceAnswer.js';
// `validateNumericAnswer` n'est pas réexportée ici pour la même raison :
// elle importe `mathComparison.js`, et donc le moteur symbolique. Aucune page
// de l'application ne l'utilise aujourd'hui ; celles qui le feront
// l'importeront par son chemin, ce qui gardera le moteur hors du lot
// d'entrée :
//   import { validateNumericAnswer } from '@smarter-academy/core/validation/validateNumericAnswer.js';
export * from './validation/validateScientificNotation.js';
export * from './progress/calculateCompletionPercentage.js';
export * from './progress/getNextIncompleteModule.js';
export * from './progress/isValidModuleNumber.js';
export * from './progress/moduleLayoutMigrations.js';
export * from './progress/getNextLesson.js';
export * from './exercise/adaptiveExerciseState.js';
export * from './api/errors.js';
export * from './curriculum/coursesData.js';
export * from './curriculum/lessonStages.js';
export * from './curriculum/moduleRecommendations.js';
export * from './curriculum/activeGrades.js';
export * from './curriculum/textbookPages.js';

// ── HORS du baril, importés PAR LEUR CHEMIN (2026-10-14) ─────────────────
//
// Ce baril est importé par du code du LOT D'ENTRÉE (StudentLayout, la
// navigation, les cartes de leçon…). Tout ce qu'il réexporte et que Rollup ne
// peut pas élaguer — un module dont le haut niveau CALCULE des données — part
// chez chaque visiteur, page d'accueil comprise. Les modules ci-dessous n'ont
// AUCUN consommateur hors des leçons, de leurs manipulations ou des pages
// paresseuses de pratique : ils s'importent par leur chemin, et restent dans
// les lots de ces pages (docs/architecture/BUNDLE_BOUNDARIES.md §4, règle 9).
//
//   Les registres des manipulations :
//     import { MANIPULATION_TYPES } from '@smarter-academy/core/curriculum/manipulationTypes.js';
//     import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
//   Les mathématiques exactes de chaque unité (un espace de noms par module) :
//     import * as divisibility from '@smarter-academy/core/arithmetic/divisibility.js';  // unité 1
//     … equalGrouping, squareRoots (2), polynomials (3), linear (4), linearSystem (5),
//     proportional (6), affine (7), statistics (8), thales (9), trigonometry (10),
//     vectors (11–12), rotation (13), space (14) — arithmetic/<nom>.js
//   Le moteur d'exercices (pratique) — un espace de noms : `Rational.parse` et
//   `parseDec` (numberFormat) ne font PAS la même chose :
//     import * as practice from '@smarter-academy/core/practice/index.js';
//
// barrel.test.js garde cette liste.
