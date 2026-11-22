// « فضاء الامتحان » and « تقدّمي » of lesson `qisma-iqlidiya-hasr` (2AM « القسمة الإقليدية وحصر حاصل القسمة »), as a 2AM STUDENT, from the lesson's EXERCISE BANK AS IT
// IS ON DISK (kit/bankSitting.js, owner 2026-11-18) — lib/sittingWalk.mjs: (1) one level-5 sitting answered right, from
// « تقدّمي » before to « تقدّمي » after (readiness computed from the copy); (2) four copies — blank, wrong (« أرشدني » never
// gives the answer, « اشرح لي » shows the bank's correction, the notebook, the retry), quit half-way, right; (3) EVERY
// sheet of EVERY level opened through the ladder (DEV hook `localStorage['di.dev.sheet']`) and checked against the disk.
// The answer key is always the disk's. About 4–5 min at one size (the 50-sheet loop ~3 min).
// Run (dev server up): [E2E_SIZE=1366x768] [E2E_PARTS=five,copies,sheets] node apps/web/e2e/gameworld-hasr-sitting.mjs [outDir]
import { sittingWalk } from './lib/sittingWalk.mjs';
import { ID, GRADE, URL, KEYS, HASR_FOREIGN, HASR_FOREIGN_NUMBERS } from './lib/hasr.mjs';

await sittingWalk({ name: 'gameworld-hasr-sitting', grade: GRADE, id: ID, url: URL, keys: KEYS, uid: 9731, foreign: HASR_FOREIGN, foreignNumbers: HASR_FOREIGN_NUMBERS });
