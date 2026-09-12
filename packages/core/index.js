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
export * from './progress/getNextLesson.js';
export * from './exercise/adaptiveExerciseState.js';
export * from './api/errors.js';
export * from './curriculum/coursesData.js';
export * from './curriculum/lessonStages.js';
export * from './curriculum/moduleRecommendations.js';

// Moteur d'exercices (pratique) — arithmétique exacte et évaluation des
// réponses. Exporté sous un espace de noms : `Rational.parse` et
// `parseDec` (numberFormat) ne font PAS la même chose, et la confusion
// coûterait cher. Voir packages/core/practice/rational.js.
export * as practice from './practice/index.js';
