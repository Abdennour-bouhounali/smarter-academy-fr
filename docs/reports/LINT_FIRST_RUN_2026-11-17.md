# First lint run — what it found that a person must look at (2026-11-17)

The first run of the linter and of the unused-code check (`docs/architecture/CODE_HEALTH.md`) removed dead code
mechanically. In 23 places the dead variable looked like **something forgotten** — a check never called, a value
computed and never shown. The dead name was removed so the lint passes; **the behaviour was not changed and nothing
in the two « to look at » tables is fixed.** Line numbers are those before the clean-up. Most files belong to lessons
that the v2 rollout rebuilds: read this list when a lesson's turn comes, then delete its lines here.

## Fixed in this run (they changed what a student sees)

- **LaTeX written with one backslash in an ordinary string**: `'\;'`, `'\,'`, `'\ '`, `'\le'`, `'\mathrm'` — JavaScript
  drops the backslash, so the student saw « ; », « , », « le » or « mathrm » inside a formula. About 40 places (the labs
  `SolutionRay`, `WaxCells`, `ScaleBlocks`; the knowledge cards of `silsila-bi-aqwas` and `nashr-jabri-3am`; modules of
  `tasawi-muqaranat-kasrayn` and `jidaa-adadayn-nisbiyayn`; `ikhtibar-musawat-mutabayina/content/textbook.js`;
  `manipulationTypes.js`; the Math Lab's `PathSection`). **Not looked at on screen after the fix.**
- **`packages/core/practice/rational.js`** and five answer oracles removed « ; » from an answer where they meant to
  remove the LaTeX space `\;`. They now remove both.
- **Duplicated keys** — the second silently replaced the first: `VISUAL_THEMES` (`stadium`, `souk`, `river` each
  described two different scenes; the later one is kept, the earlier line is now a comment), `StatusBadge`,
  two `content/problems.js`.
- **`Game.js`**: a branch of `refreshObjective` that could never run, and its sentence.
- **`e2e/lesson-kit/helpers.mjs`**: a default value that named a constant that does not exist.

## To look at — lessons and labs

| Where | What |
|---|---|
| `manipulations/operations/NumberLinePegs.jsx:359` | `row`, the row of a stack's first card, was computed for each stack badge and never used to place it |
| `manipulations/operations/JumpTape.jsx:411` | `flagX` (where a flag stands in a « plant » task) was never called; the flag is drawn at its value |
| `manipulations/operations/seedRake/SeedScene.jsx:103` | the colour of a zone was computed for its plants; `<Plant>` gets fixed colours |
| `manipulations/operations/DifferenceMeter.jsx:578` | `regionTex(r, form)` never used `form`: the region is always written `x < c` |
| `manipulations/vectors/RouteCompare.jsx:651` | `chainOf(lab, i)` ignores the route index: every route gets the same chain |
| `manipulations/rotation/InscribedAngle.jsx:419` | the exact angles of the diameter step were computed and never shown |
| `manipulations/geometry/ShadowMeet.jsx:163` | the last chain of the mode was computed and never used |
| `4am/…/mutarajiha-ula/modules/Module01RasailYunus.jsx:181` | step 2 is done when `q2a && q1b && q1c`; the states `q2b`, `q2c` existed and were read nowhere |
| `4am/…/wadiya-idmajiya-khattiya/modules/Module07AlWadiya.jsx:60` | the lab's « big » trials were stored and never read; the « small » ones feed the evidence |
| `3am/…/jidaa-adadayn-nisbiyayn/modules/Module03Tariqa.jsx:44`, `3am/…/jidaa-ida-nisbiya/modules/Module02Maarif.jsx:30`, `4am/…/awwaliyan-fima-baynahuma/modules/Module01….jsx:28` | a state written and never read |
| `services/contentAvailabilityService.js › fetchLessonExercises` | written so that « a hidden exercise no longer appears in the list » (the list served by the registry instead of the embedded index) — **no screen ever called it**; its only test read the file's text. Deleted with that test: the exercise list still comes from the embedded index |
| `services/authService.js › fetchLegalVersions` | the legal documents' versions read from the server « for display » — called by no screen; deleted with the test that read its text |
| Math Lab `TransformationsTool`, `TrigonometryTool`, `VectorsTool` | `useCompactCharts()` was called and its result ignored; the call is gone, so these tools no longer redraw when the width crosses 767 px (below the supported 768 px) |

## To look at — tests and oracles that check less than they say

| Where | What |
|---|---|
| `manipulations/equations/growthRace.render.test.jsx:86` | the helper `finished(left, right, goal)` ignored `goal`: the « greater » cases build the same lab as « equal » |
| `3am/…/qismat-nisbiyayn/content/content.test.js:49` | the helper « every wrong option is false » was never called |
| `3am/…/mutabayinat-amaliyat/content/content.test.js:184` | a loop builds a value for each option and asserts nothing |
| `features/home/home.test.js:35` | the fixture `mastery(lessonId, states)` was never called: no home test exercises mastery states |
| `e2e/lesson-kit/1am-adad-ashri-mustaqim-mudarraj.mjs:166` | the step « plant the flag at the wrong place, then the right one » was written and never walked |
| `e2e/lesson-kit/3am-ibarat-harfiya-3-nashr.mjs:182` | refused signs were counted and the count never checked |
| `e2e/mathlab-trigonometry.mjs:526` | the row's text is read for « not by colour alone » but only `aria-current` is checked |
| `scripts/practice-oracle/muqarana-kasrayn.mjs:385` | the check « an option's misconception label matches the relation read » was defined and never called |
| `scripts/practice-oracle/tawzi-darb-jam-tarh.mjs:486` | an environment `{ x }` was built before `checkIsland` and never passed to it |
| `scripts/practice-oracle/wadiya-idmajiya-mafhum-muadala.mjs:140` | four helpers that rebuild the SWAP / ROLE / UNDOFIRST readings were used by nothing |
| `scripts/practice-oracle/ibara-harfiya-intaj.mjs:496` | `prior` (« previous keys of a sheet ») was declared, never filled, never read |
