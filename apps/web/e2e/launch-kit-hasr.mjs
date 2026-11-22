// « عُدّة الانطلاق » of the 2AM lesson « القسمة الإقليدية وحصر حاصل القسمة » (`qisma-iqlidiya-hasr`) — walk of its LAUNCH as
// a STUDENT (simulated session, no API). The learning net gives this lesson ONE tool with a question family: the 1AM
// « القسمة الإقليدية » (1am.m3.r01, home lesson `qisma-iqlidiya-baqi`; unclassified, so CORE — it can close the door). The
// scenario is the one of every one-tool launch, in lib/launchKitTwoTools.mjs › walkLaunchOne: four students (knows; slips on
// the level-2 sort — the workshop on the trap, repaired; misses everything — the capsule, the door opens anyway; misses then
// answers the capsule right — repaired, take-off). Every answer is computed by the walk from the screen.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/launch-kit-hasr.mjs [outDir]
import { walkLaunchOne } from './lib/launchKitTwoTools.mjs';
import { URL, GRADE, HASR_FOREIGN } from './lib/hasr.mjs';

await walkLaunchOne({
  id: 'qisma-iqlidiya-hasr',
  url: URL,
  grade: GRADE,
  outName: 'launch-kit-hasr',
  ids: [9931, 9932, 9933, 9934],
  alien: HASR_FOREIGN,
  alienLabel: 'another lesson',
  tool: {
    item: '1am.m3.r01',
    name: 'القسمة الإقليدية',
    year: 'من السنة الأولى متوسط',
    home: 'القسمة الإقليدية',
    memo: 3,
    // the very first question of a launch (`families.js › divisionWrite`, first): a divisor 2–5, a quotient 2–5, a remainder
    firstOk: (q) => q.b <= 5 && q.a <= 29 && q.a % q.b > 0,
  },
});
