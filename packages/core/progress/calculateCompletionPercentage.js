/**
 * Calculates a lesson/chapter completion percentage from a list of completed
 * module identifiers.
 *
 * Module identifiers are stored inconsistently across lessons (e.g. "3", "L03",
 * and "L03-4e" can all mean "module 3"). This function normalizes each id to its
 * numeric module number before counting, so mixed-format duplicates for the same
 * module are never double-counted — this is the one canonical implementation;
 * every progress-percentage display in the app should call this rather than
 * re-deriving its own formula.
 *
 * @param {Array<string|number>} completedModuleIds - Raw completed-module identifiers (may contain duplicates or mixed formats).
 * @param {number} totalModules - Total number of modules in the lesson/chapter being measured.
 * @returns {number} An integer percentage from 0 to 100. Always 0 for invalid/empty input — never NaN or Infinity.
 */
export function calculateCompletionPercentage(completedModuleIds, totalModules) {
  if (!totalModules || totalModules <= 0) return 0;
  if (!Array.isArray(completedModuleIds) || completedModuleIds.length === 0) return 0;

  const uniqueModuleNumbers = new Set();
  completedModuleIds.forEach((id) => {
    const match = String(id).match(/(?:L0?|^)(\d+)/);
    if (match) uniqueModuleNumbers.add(parseInt(match[1], 10));
  });

  return Math.min(Math.round((uniqueModuleNumbers.size / totalModules) * 100), 100);
}
