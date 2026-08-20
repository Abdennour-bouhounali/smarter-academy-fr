/**
 * Post-evaluation guidance: instead of "You failed, restart the lesson", the
 * results screen maps each weak Learning Point to the learning module(s) that
 * teach it and recommends exactly those.
 *
 *   Final Evaluation → Learning Point analysis → "Revoir Module 2, Module 4"
 *
 * Modules declare what they teach via `teachesLearningPointIds` in
 * lesson.config.js (validator-enforced: ids belong to the lesson, every
 * Learning Point is taught by at least one learning module, evaluation
 * modules teach nothing). Pure function — mastery data comes from the
 * learning-profile endpoint, passed in by the caller.
 *
 * @param {Array<{number: number, teachesLearningPointIds?: string[], stage?: string}>} modules
 *        the lesson's LESSON_CONFIG.modules
 * @param {string[]} weakLearningPointIds
 *        Learning Point ids the evaluation flagged as weak/not demonstrated
 * @returns {Array<{module: object, learningPointIds: string[]}>}
 *          recommended modules in lesson order, each with the weak Learning
 *          Points it addresses (a module appears at most once)
 */
export function recommendModulesForLearningPoints(modules, weakLearningPointIds) {
  if (!modules?.length || !weakLearningPointIds?.length) return [];

  const weak = new Set(weakLearningPointIds);

  return modules
    .map((module) => ({
      module,
      learningPointIds: (module.teachesLearningPointIds ?? []).filter((lpId) => weak.has(lpId)),
    }))
    .filter(({ learningPointIds }) => learningPointIds.length > 0);
}
