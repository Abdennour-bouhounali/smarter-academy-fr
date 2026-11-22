// « عُدّة الانطلاق » of the 1AM lesson « قواعد قابلية القسمة » (`qawaid-qabiliyat-qisma`) — walk of its LAUNCH as a STUDENT
// (simulated session, no API). The learning net gives this lesson ONE tool with a question family: the 1AM « القسمة الإقليدية »
// (1am.m3.r01, home lesson `qisma-iqlidiya-baqi`; unclassified, so CORE — it can close the door). The scenario is the one of
// every one-tool launch, in lib/launchKitTwoTools.mjs › walkLaunchOne: four students (knows; slips on the level-2 sort of three
// equalities — the workshop on the trap, repaired; misses everything — the capsule, the door opens anyway; misses then answers
// the capsule right — repaired, take-off). Every answer is computed by the walk from the screen: the quotient and the
// remainder, the greatest multiple on the line, whether « a = b × q ± r » is THE Euclidean division.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/launch-kit-qawaid.mjs [outDir]
import { walkLaunchOne } from './lib/launchKitTwoTools.mjs';
import { pageOf, GRADE, QAWAID_FOREIGN } from './lib/qawaid.mjs';

await walkLaunchOne({
  id: 'qawaid-qabiliyat-qisma',
  url: pageOf('qawaid-qabiliyat-qisma'),
  grade: GRADE,
  outName: 'launch-kit-qawaid',
  ids: [9921, 9922, 9923, 9924],
  alien: QAWAID_FOREIGN,
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
