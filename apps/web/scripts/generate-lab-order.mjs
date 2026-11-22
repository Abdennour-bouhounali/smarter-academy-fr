// Generates `src/lessons/common/lessonlab/lessonOrder.generated.json`: the codes of every lesson of the cycle, grade by grade,
// in catalogue order. « مختبري » uses it to show a student the instruments of the lessons BEFORE his own, never after.
// Run after adding or re-ordering a lesson:  npm run generate:lab-order   (the test `order.test.js` fails when it is stale)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../..', import.meta.url));
export const GRADES = ['1am', '2am', '3am', '4am'];
export function buildOrder() {
  const out = { $generated: 'apps/web/scripts/generate-lab-order.mjs — do not edit' };
  for (const g of GRADES) {
    const { lessons } = JSON.parse(readFileSync(`${root}/packages/core/curriculum/dz/lessons_${g}_2026_2027.json`, 'utf8'));
    out[g] = [...lessons].sort((x, y) => x.order - y.order).map((l) => l.code);
  }
  return out;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = `${root}/apps/web/src/lessons/common/lessonlab/lessonOrder.generated.json`;
  writeFileSync(file, `${JSON.stringify(buildOrder())}\n`);
  console.log('written', file);
}
