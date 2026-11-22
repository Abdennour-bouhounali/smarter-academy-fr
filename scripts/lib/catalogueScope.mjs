// The SCOPE of the French catalogue, as a pure function so its test can feed it a neutral fixture
// (scripts/check-dormant-isolation.test.mjs). The script check-dormant-isolation.mjs runs it on the real catalogue and
// the real disk.
//
// This tree was imported from the Algerian platform (plan docs/FRANCE_REBUILD_PLAN.md §4bis): its grades, levels and
// lesson folders were deleted. The check fails if one of them comes back through a merge, a cherry-pick or a copied
// data file — nothing else would notice, since an unknown grade is simply never shown.

/** The Algerian grade ids and levels this product must never carry again. */
export const ALGERIAN_GRADE_IDS = Object.freeze(['1am', '2am', '3am', '4am', 'terminale_dz']);
export const ALGERIAN_LEVEL_IDS = Object.freeze(['moyen', 'thanawi']);

/** Paths (from the repository root) that existed in the Algerian tree and must stay deleted. */
export const ALGERIAN_PATHS = Object.freeze([
  'apps/web/src/lessons/moyen',
  'apps/web/src/lessons/thanawi',
  'packages/core/curriculum/dz',
]);

const ALGERIAN_LESSON_PATH = /^\/courses\/(moyen|thanawi)\//;

/**
 * @param {object} input
 * @param {Array} input.courseLevels     the ACTIVE catalogue (coursesData.courseLevels)
 * @param {Array} input.allCourseLevels  the whole catalogue (coursesData.allCourseLevels)
 * @param {string[]} input.activeGradeIds ACTIVE_GRADE_IDS
 * @param {(relPath: string) => boolean} input.exists does a repository path exist on disk?
 * @returns {string[]} the problems (empty = in scope)
 */
export function catalogueScopeProblems({ courseLevels, allCourseLevels, activeGradeIds, exists }) {
  const problems = [];

  // 1. The active catalogue carries active grades only.
  for (const level of courseLevels) {
    for (const grade of level.grades) {
      if (!activeGradeIds.includes(grade.id)) {
        problems.push(`The active catalogue (courseLevels) holds the inactive grade "${grade.id}" (level "${level.id}") — filterActiveCourseLevels() did not filter it.`);
      }
    }
  }

  // An active id that no grade has is a typo that silently activates nothing.
  const gradeIds = new Set(allCourseLevels.flatMap((l) => l.grades.map((g) => g.id)));
  for (const id of activeGradeIds) {
    if (!gradeIds.has(id)) problems.push(`ACTIVE_GRADE_IDS holds "${id}", which no grade of the catalogue (allCourseLevels) has — probably a typo (it activates nothing).`);
  }

  // 2. No Algerian level, grade or lesson in the catalogue.
  for (const id of ALGERIAN_GRADE_IDS) {
    if (activeGradeIds.includes(id)) problems.push(`ACTIVE_GRADE_IDS holds the Algerian grade "${id}".`);
  }
  for (const level of allCourseLevels) {
    if (ALGERIAN_LEVEL_IDS.includes(level.id)) problems.push(`The catalogue holds the Algerian level "${level.id}".`);
    for (const grade of level.grades) {
      if (ALGERIAN_GRADE_IDS.includes(grade.id)) problems.push(`The catalogue holds the Algerian grade "${grade.id}" (level "${level.id}").`);
      for (const chapter of grade.chapters ?? []) {
        for (const lesson of chapter.lessons ?? []) {
          if (ALGERIAN_LESSON_PATH.test(lesson.path ?? '')) problems.push(`The catalogue holds the Algerian lesson "${lesson.id}" (${lesson.path}).`);
          // No tier in the catalogue: free / premium is an admin decision stored in the database (lessons.tier).
          if (Object.prototype.hasOwnProperty.call(lesson, 'tier')) {
            problems.push(`The lesson "${lesson.id}" carries a \`tier\` in the catalogue — the tier belongs to the database (lessons.tier, decided by the administrator), never to the catalogue.`);
          }
        }
      }
    }
  }

  // 3. The Algerian folders stay deleted.
  for (const path of ALGERIAN_PATHS) {
    if (exists(path)) problems.push(`${path}/ exists again — the Algerian tree was deleted (plan §4bis); a lesson or data file under it is never mounted.`);
  }

  return problems;
}
