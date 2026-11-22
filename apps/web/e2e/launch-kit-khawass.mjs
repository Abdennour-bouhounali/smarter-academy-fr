// « عُدّة الانطلاق » of lesson « خواص قواسم عدد طبيعي » (`khawass-qawasim`, lesson 3) — walk of its LAUNCH as a STUDENT
// (simulated session, no API). Since 2026-11-18 its two CORE tools in the learning net are « التعرّف على قاسم لعدد طبيعي »
// (4am.m1.r01) then the 2AM Euclidean division (2am.m1.r04) — the same two as lesson 2's, so the scenario is ONE, in
// lib/launchKitTwoTools.mjs: four students (knows everything; slips; misses everything — one capsule; misses only the
// division — its workshop and its capsule). At every screenshot, besides the layout rules: no raw formula, no word of
// lesson 2, no text under 12 px, the launch's ✕ reachable (soft checks).
// The kit itself (sounds, drag, the toolbox, the return button) is walked on the pilot by launch-kit.mjs.
// Run (dev server up): [E2E_SIZE=1366x768] [E2E_TOUCH=1] node apps/web/e2e/launch-kit-khawass.mjs [outDir]
import { walkLaunch } from './lib/launchKitTwoTools.mjs';
import { QAWASIM_WORDS } from './lib/walk.mjs';

await walkLaunch({
  id: 'khawass-qawasim',
  outName: 'launch-kit-khawass',
  ids: [9901, 9902, 9903, 9904],
  alien: QAWASIM_WORDS,
  alienLabel: 'lesson 2',
});
