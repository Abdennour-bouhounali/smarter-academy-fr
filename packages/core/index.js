// @smarter-academy/core — platform-agnostic logic shared by every client
// (today: the web app; eventually: a React Native app too). Zero React,
// zero DOM, zero bundler-specific APIs (no `import.meta`, no `localStorage`).
// See README.md in this package for the boundary this enforces.

export * from './mathComparison.js';
export * from './numberFormat.js';
export * from './geometry.js';
export * from './algebra.js';
export * from './lessonAccess.js';
export * from './errorClassifiers.js';
export * from './auth.js';
export * from './validation/validateChoiceAnswer.js';
export * from './validation/validateNumericAnswer.js';
export * from './validation/validateScientificNotation.js';
export * from './progress/calculateCompletionPercentage.js';
export * from './progress/getNextIncompleteModule.js';
export * from './progress/getNextLesson.js';
export * from './exercise/adaptiveExerciseState.js';
export * from './api/errors.js';
export * from './curriculum/coursesData.js';
export * from './curriculum/lessonStages.js';
export * from './curriculum/moduleRecommendations.js';
