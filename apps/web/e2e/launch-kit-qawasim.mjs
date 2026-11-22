// « عُدّة الانطلاق » of lesson « قواسم عدد طبيعي » (`qawasim-adad-tabii`, lesson 2) — walk of its LAUNCH as a STUDENT
// (simulated session, no API). Since 2026-11-18 its two CORE tools in the learning net are « التعرّف على قاسم لعدد طبيعي »
// (4am.m1.r01, the lesson before) then the 2AM Euclidean division (2am.m1.r04) — the same two as lesson 3's, so the
// scenario is ONE, in lib/launchKitTwoTools.mjs: four students (knows everything; slips; misses everything — one capsule;
// misses only the division — its workshop and its capsule). Nothing may scroll or leave the screen, at any moment; the soft
// checks (no raw formula, no text under 12 px, the ✕ reachable) run on every screen.
// The kit itself (sounds, drag, the toolbox, the return button) is walked on the pilot by launch-kit.mjs.
// Run (dev server up): [E2E_SIZE=1366x768] [E2E_TOUCH=1] node apps/web/e2e/launch-kit-qawasim.mjs [outDir]
import { walkLaunch } from './lib/launchKitTwoTools.mjs';

await walkLaunch({ id: 'qawasim-adad-tabii', outName: 'launch-kit-qawasim', ids: [9601, 9602, 9603, 9604] });
