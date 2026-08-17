/**
 * Determines the first module number that has not been completed.
 * 
 * @param {Set<number>} uniqueModules - Set of completed module numbers.
 * @param {number} totalModules - Total number of modules in the lesson.
 * @returns {number} The module number to resume at.
 */
export function getNextIncompleteModule(uniqueModules, totalModules = 7) {
  let resumeModule = 1;
  for (let m = 1; m <= totalModules; m++) {
    if (!uniqueModules.has(m)) {
      resumeModule = m;
      break;
    }
  }
  return resumeModule;
}
