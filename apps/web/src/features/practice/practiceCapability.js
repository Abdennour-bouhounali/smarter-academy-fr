import ACTIVE_LESSONS from '../../../../../content/practice/active.json';

/**
 * Quelles leçons ont la pratique activée.
 *
 * La liste vient de content/practice/active.json — le MÊME fichier que lit
 * PracticeCapability côté Laravel et que vérifie scripts/validate-exercises.mjs.
 * Trois copies d'une même liste dériveraient ; il n'y en a qu'une.
 *
 * Le serveur applique la règle de son côté, indépendamment : cette constante
 * ne décide que de ce que l'interface PROPOSE. Même partage de rôles que
 * DIAGNOSTIC_AVAILABLE_GRADES dans diagnosticService.js.
 */
export const PRACTICE_ACTIVE_LESSONS = Object.freeze(ACTIVE_LESSONS);

export function isPracticeActive(lessonId) {
  return PRACTICE_ACTIVE_LESSONS.includes(lessonId);
}

/** Le chemin du Hub d'une leçon. */
export const practiceHubPath = (lessonId) => `/espace/pratique/${lessonId}`;
