// « فضاء الامتحان » and « تقدّمي » of lesson `bahth-pgcd` (lesson 6, 4AM « البحث عن القاسم المشترك الأكبر لعددين طبيعيين »),
// as a 4AM STUDENT, from the lesson's EXERCISE BANK AS IT IS ON DISK (kit/bankSitting.js, owner 2026-11-18) — the shared
// lib/sittingWalk.mjs: one level-5 sitting answered right, four copies (blank, wrong, quit half-way, right), then EVERY
// sheet of EVERY level opened through the ladder and checked against the disk. The answer key is always the disk's.
// The sitting's screens are proven (.claude/skills/lesson-v2/trusted.md); its bank's sheets are data — walked once, here.
// Run (dev server up): [E2E_SIZE=1366x768] [E2E_PARTS=five,copies,sheets] node apps/web/e2e/gameworld-bahth-sitting.mjs [outDir]
import { sittingWalk } from './lib/sittingWalk.mjs';
import { ID, URL, KEYS, BAHTH_FOREIGN, BAHTH_NUMBERS } from './lib/bahth.mjs';

await sittingWalk({
  name: 'gameworld-bahth-sitting',
  grade: '4am',
  id: ID,
  url: URL,
  keys: KEYS,
  uid: 9972,
  foreign: BAHTH_FOREIGN,
  foreignNumbers: BAHTH_NUMBERS,
});
