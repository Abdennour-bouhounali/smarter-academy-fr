/**
 * Validates a student's multiple-choice selection.
 *
 * Formalizes the equality check already used inline by QuizQuestion/ChoiceGrid,
 * as a standalone pure function for new exercises that want a validator
 * matching the canonical Exercise Result contract (see
 * docs/architecture/EXERCISE_CONTRACT.md) rather than embedding the check
 * directly in a click handler.
 *
 * Existing QuizQuestion/ChoiceGrid usages are not migrated to call this in
 * this phase — their "correct" state is tightly coupled to selection-index
 * UI state, and restructuring that is a larger change than a validation-only
 * extraction.
 *
 * @param {*} selectedValue - The value the student selected.
 * @param {*} correctValue - The correct value.
 * @returns {{isCorrect: boolean}}
 */
export function validateChoiceAnswer(selectedValue, correctValue) {
  return { isCorrect: selectedValue === correctValue };
}
