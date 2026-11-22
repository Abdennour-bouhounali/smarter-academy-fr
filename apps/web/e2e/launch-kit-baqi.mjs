// « عُدّة الانطلاق » of the 1AM lesson « القسمة الإقليدية » (`qisma-iqlidiya-baqi`) — walk of its LAUNCH as a STUDENT
// (simulated session, no API). The learning net gives this lesson ONE tool with a question family: « الجمع والطرح والضرب »
// (1am.m1.r01, home lesson « معنى الجمع والطرح »; unclassified, so CORE — it can close the door). The scenario is the one of
// every one-tool launch, in lib/launchKitTwoTools.mjs › walkLaunchOne: four students (knows; slips on the level-2 sort of three
// equalities — the workshop, repaired; misses everything — the capsule, the door opens anyway; misses then answers the capsule
// right — repaired, take-off). Every answer is computed by the walk from the screen: the product, the difference (with its
// borrow), « x × y + z » in the right order, the flag counted back on the line.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/launch-kit-baqi.mjs [outDir]
import { walkLaunchOne } from './lib/launchKitTwoTools.mjs';
import { URL, GRADE, BAQI_FOREIGN } from './lib/baqi.mjs';

await walkLaunchOne({
  id: 'qisma-iqlidiya-baqi',
  url: URL,
  grade: GRADE,
  outName: 'launch-kit-baqi',
  ids: [9911, 9912, 9913, 9914],
  alien: BAQI_FOREIGN,
  alienLabel: 'another lesson',
  tool: {
    item: '1am.m1.r01',
    name: 'الجمع والطرح والضرب',
    year: 'من السنة الأولى متوسط',
    home: 'معنى الجمع والطرح',
    memo: 4,
    // the very first question of a launch (`families.js › calcWrite`, first): a product of the table up to 5 × 5
    firstOk: (q) => q.calc?.op === 'times' && q.calc.x <= 5 && q.calc.y <= 5,
  },
});
