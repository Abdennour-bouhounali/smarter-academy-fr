// « فضاء الامتحان » and « تقدّمي » of lesson `qasim-mushtarak-akbar` (lesson 4, 4AM « القاسم المشترك الأكبر لعددين طبيعيين »),
// as a 4AM STUDENT, from the lesson's EXERCISE BANK AS IT IS ON DISK (kit/bankSitting.js, owner 2026-11-18) —
// lib/sittingWalk.mjs: (1) one level-5 sitting answered right, from « تقدّمي » before to « تقدّمي » after (readiness computed
// from the copy); (2) four copies — blank, wrong (« أرشدني » never gives the answer, « اشرح لي » shows the bank's correction,
// the notebook, the retry), quit half-way, right; (3) EVERY sheet of EVERY level opened through the ladder (DEV hook
// `localStorage['di.dev.sheet']`) and checked against the disk. The answer key is always the disk's.
// Run (dev server up): [E2E_SIZE=1366x768] [E2E_PARTS=five,copies,sheets] node apps/web/e2e/gameworld-mushtarak-sitting.mjs [outDir]
import { sittingWalk } from './lib/sittingWalk.mjs';
import { ID, URL, KEYS, MUSHTARAK_FOREIGN, MUSHTARAK_NUMBERS } from './lib/mushtarak.mjs';

await sittingWalk({
  name: 'gameworld-mushtarak-sitting',
  grade: '4am',
  id: ID,
  url: URL,
  keys: KEYS,
  uid: 9871,
  foreign: MUSHTARAK_FOREIGN,
  foreignNumbers: MUSHTARAK_NUMBERS,
});
