// Canonical vocabulary for the Smarter Academy learning journey. Every module
// in a lesson.config.js declares exactly one `stage` from LESSON_STAGES; the
// lesson validator (scripts/validate-lessons.mjs) enforces the rules below.
//
// The pedagogical cycle is universal but adapts to the mathematics being
// taught, so only REQUIRED_STAGES are mandatory for an `available` lesson:
// `prerequisite_check` is skipped when a lesson has no meaningful
// prerequisites, and `manipulation` may fold into `discovery` when the notion
// offers nothing worth manipulating on its own.
//
// `results` is deliberately NOT a stage: the results / learning-profile screen
// is the completion view of the `evaluation` module (rendered from the
// learning-profile endpoint), not an authored module of its own.
//
// Several modules may share a stage (e.g. two practice_lab modules), but
// stages must appear in non-decreasing STAGE_ORDER across a lesson's
// `modules` array — the journey never goes backwards.

export const LESSON_STAGES = Object.freeze([
  'prerequisite_check', // Vérification des prérequis — client-side only, never persisted as evidence
  'trigger',            // Déclencheur mathématique — creates the need for the new idea
  'discovery',          // Découverte guidée — construct the idea progressively
  'manipulation',       // Manipulation — touch the mathematics
  'formalization',      // Formalisation « À retenir » — precise mathematical knowledge
  'practice_lab',       // Laboratoire d'entraînement — mistakes NEVER count as mastery evidence
  'evaluation',         // Défi final / Évaluation — the ONLY source of assessment evidence
]);

export const STAGE_ORDER = Object.freeze(
  Object.fromEntries(LESSON_STAGES.map((stage, index) => [stage, index]))
);

export const REQUIRED_STAGES = Object.freeze([
  'trigger',
  'discovery',
  'formalization',
  'practice_lab',
  'evaluation',
]);

// Hard cap on a lesson's total duration: the sum of a lesson's module
// `estimatedMin` values and the catalogue's `durationMinutes` must both stay
// at or below this. Lessons that need more time are split into parts
// ("Partie 1 / Partie 2") in coursesData.js, each part a full lesson with its
// own Learning Points.
export const MAX_LESSON_MINUTES = 90;
