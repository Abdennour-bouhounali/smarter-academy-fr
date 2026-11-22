// SCOPE guard of the French catalogue: fails if an Algerian grade, level, lesson or folder comes back into this
// product (this tree was imported from the Algerian platform and its content deleted — plan
// docs/FRANCE_REBUILD_PLAN.md §4bis). Also refuses a `tier` in the catalogue and an active grade that does not exist.
// The rules are scripts/lib/catalogueScope.mjs (tested on a fixture by check-dormant-isolation.test.mjs).
//
// Distinct from check-routes.mjs (what the lesson route boundary mounts) and from the registry's own filter
// (apps/web/src/lessons/registry.test.js — `import.meta.glob` is a Vite API this Node script cannot run).
//
//   node scripts/check-dormant-isolation.mjs
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { courseLevels, allCourseLevels } from '../packages/core/curriculum/coursesData.js';
import { ACTIVE_GRADE_IDS } from '../packages/core/curriculum/activeGrades.js';
import { catalogueScopeProblems } from './lib/catalogueScope.mjs';

const ROOT = new URL('../', import.meta.url).pathname;

const problems = catalogueScopeProblems({
  courseLevels,
  allCourseLevels,
  activeGradeIds: ACTIVE_GRADE_IDS,
  exists: (path) => existsSync(join(ROOT, path)),
});

if (problems.length) {
  console.error(`\n${problems.length} catalogue scope problem(s):\n`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  console.error('\nThe French product exposes the French collège catalogue only (6e, 5e, 4e, 3e).\n');
  process.exit(1);
}

const grades = allCourseLevels.flatMap((l) => l.grades.map((g) => g.id));
console.log(`✅ Catalogue scope: ${grades.length} grade(s) (${grades.join(', ')}), ${ACTIVE_GRADE_IDS.length} active (${ACTIVE_GRADE_IDS.join(', ') || 'none'}).`);
console.log('✅ No Algerian grade, level or lesson in the catalogue, and no Algerian lesson or curriculum folder on disk.');
console.log('✅ No tier in the catalogue: free / premium is decided in the database by the administrator (lessons.tier).');
