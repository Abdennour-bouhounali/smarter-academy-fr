/**
 * Determines the first module number that has not been completed.
 *
 * @param {Set<number>} uniqueModules - Set of completed module numbers.
 * @param {number} totalModules - Total number of modules in the lesson.
 *        Required: callers supply the real count (apps/web reads it from the
 *        lesson registry) — this package never fabricates a default.
 * @returns {number} The module number to resume at.
 */
export function getNextIncompleteModule(uniqueModules, totalModules) {
  let resumeModule = 1;
  for (let m = 1; m <= totalModules; m++) {
    if (!uniqueModules.has(m)) {
      resumeModule = m;
      break;
    }
  }
  return resumeModule;
}
