// « عُدّة الانطلاق » of lesson « تعيين القاسم المشترك الأكبر لعددين طبيعيين » (`tayin-pgcd`, lesson 5) — walk of its
// LAUNCH as a STUDENT (simulated session, no API). Its two CORE tools in the learning net are the divisor list of 4AM
// « تعيين قواسم عدد » (4am.m1.r02, new 2026-11-19) then the 2AM Euclidean division (2am.m1.r04): the scenario is
// lib/launchKitTwoTools.mjs › walkLaunchLists — four students (knows everything; slips on the sort of lists; misses
// everything — one capsule, the lists; misses only the division — its workshop and its capsule). The same two families as
// lesson 4's. At every screenshot, besides the layout rules: no raw formula, no word of lessons 1–4, no text under 12 px, the launch's ✕ reachable.
// The kit itself (sounds, drag, the toolbox, the return button) is walked on the pilot by launch-kit.mjs.
// Run (dev server up): [E2E_SIZE=1366x768] node apps/web/e2e/launch-kit-tayin.mjs [outDir]
import { walkLaunchLists, LISTS, B } from './lib/launchKitTwoTools.mjs';
import { ID, TAYIN_FOREIGN } from './lib/tayin.mjs';
import { FAMILIES, MISTAKES } from '../src/lessons/common/launchkit/families.js';

/**
 * The home lessons of the two tools (lesson 2, the 2AM division): the result names them, by design, under « راجع أوّلًا »
 * — their titles, and the names they contain (« حصر حاصل القسمة » is inside the 2AM title), are not foreign HERE.
 */
const HOMES = ['قواسم عدد طبيعي', 'القسمة الإقليدية وحصر حاصل القسمة'];
/**
 * The launch's OWN text — the cards, rules and mistakes of its two families (launchkit/families.js), shared by every lesson
 * that launches on them: a name of another lesson that this text writes as ordinary words is not foreign on the launch
 * (« باقي القسمة 0 » in the mistake « rest-not-zero » is the remainder of a division, not lesson 3's tablet). The same set
 * difference as lib/lessonWords.mjs, on the launch's text.
 */
const strings = (v, out = []) => {
  if (typeof v === 'string') out.push(v);
  else if (v && typeof v === 'object') for (const x of Object.values(v)) strings(x, out);
  return out;
};
const OWN = [...strings(FAMILIES[LISTS]), ...strings(FAMILIES[B]), ...strings(MISTAKES)].join('\n');

await walkLaunchLists({
  id: ID,
  outName: 'launch-kit-tayin',
  ids: [9981, 9982, 9983, 9984],
  alien: TAYIN_FOREIGN.filter((w) => !HOMES.some((h) => h.includes(w)) && !OWN.includes(w)),
  alienLabel: 'lessons 1–4',
  home: HOMES[0],
});
