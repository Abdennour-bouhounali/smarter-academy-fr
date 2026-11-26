# Proven screens — what a new lesson does not walk again

Read with `SKILL.md` §6. The ONE size is 1366×768 (owner, 2026-11-19). A line is added when a screen passed at
1366×768 AND was looked at with the eyes, ON THIS PLATFORM; it gives the commit, the lesson that proved it, and the
LIMITS it was proved for. A lesson whose data stays inside the limits checks that data by a unit test and does not walk
the screen; a lesson that exceeds a limit walks it. A line is REMOVED when the screen's code changes after its commit
(`git log <commit>..HEAD -- <files>`) or a lesson breaks it. **An empty table means: walk everything.**

## The French table (first lines: 2026-11-23)

| Screen | Files | Proved by, at commit | Proved for (limits) | Data test that stands in for the walk |
|---|---|---|---|---|
| The forge's frame — tiles, a refutation, an attack, the seal, a last step, a tablet | `kit/RuleForge.jsx`, `kit/Tablet.jsx`, `divisorIsles/forgeParts.jsx` | `decomposer-en-facteurs-premiers`, `bcca5dbb` | 2 or 3 columns of tiles, a tile up to « je la repose tant qu’elle tient »; a last step of four lines in ONE column (`use.column`), one with two raised exponent boxes and a yes/no, one of a program sentence and four boxes; a tablet of a rule, two sentences, two equalities and a note | the lesson's `forges.test.js`, `limits.test.js` |
| `ladder · factor` | `divisorIsles/InquiryFactor.jsx` | same | a rack of 8 planks, a gap up to 495, 5 notebook lines shown | `inquiryFactor.render.test.jsx` |
| `pairs` | `divisorIsles/Inquiry.jsx` | same | up to 16 planks tried (a gap of 221): the table shrinks, the strip breaks in two | `inquiryLayout.test.js` |
| `sheet` | `divisorIsles/InquirySheet.jsx` | same | up to 19 lines in two blocks (4 641) | `inquirySheet.render.test.jsx` |
| The last bridge announced by a label, its store, its 3D sign | `divisorIsles/DivisorIsles.jsx › Boss`, `Game.js` | same | a label of three powers (« 2³ × 3² × 7 »), two planks, the nudge of the story in the store (three lines) | `boss.render.test.jsx`; the sign: the walk measures it |
| The board's `ladder` station | `features/classSession/LadderStation.jsx` | same | a ladder of 9 rungs (720), a sheet of 15 lines in three columns (2 387), an `after` of about 260 characters | `ladderStation.render.test.jsx` |
| The lab's « L’échelle des facteurs » | `lessonlab/tools/FactorLadder.jsx` | same | 13 planks (8 192) | `factor.render.test.jsx` |
| The brevet sitting with a `factorization` step | `kit/ExamSitting.jsx`, `features/practice/inputs/FactorizationInput.jsx` | same | the field without placeholder, its pad under it in two rows; a program listing of 7 lines | `examSittingField.render.test.jsx`, `problemTable.render.test.jsx` |
| The pyramids world in France: the HUD, the register (`inset-inline-end`), the recall card, the rope, the order card, the felucca's legs on the rail, the top view, the mission card and the box at noon (lines under the figure) | `gameworld/nilePyramids/*` (uncommitted at the walk: `NilePyramids.jsx`, `nilePyramids.css`, `strings.fr.js`) | `thales-configuration-papillon`, walk of 2026-11-24 on `ef840900` + the walk-fix batch | three docks (river, summit, plateau); a mission of 3 lines, a box of 4 lines with ratio choices of 4 options | the lesson's `story.test.js` (≤ 4 lines a card) |
| Experiments `halfturn` and `plan` (a butterfly plan with `VMB-VM`) | `nilePyramids/InquiryHalfturn.jsx`, `InquiryPlan.jsx` | same | 3 rounds each; the river drawn LOW (AF drawn 60 for SA 72) under its laid course | `inquiries.test.js` |
| A forge's last step WITH its figure (`use.column`, choices inside fractions) | `kit/RuleForge.jsx`, `nilePyramids/forgeParts.jsx › UseFigure` | same | 4 lines, the widest a chain of three fractions with 2 / 5 / 5 options (≈ 580 px) beside a 340 px figure | `forges.test.js` |
| The trainer with a figure beside an exam question; the knowledge map of 11 cards | `kit/Trainer.jsx`, `kit/trainerFigure.js`, `kit/KnowledgePage.jsx` | same | figures 341 px tall with one-line hints; map rows 9 · 26 · 43 · 65 · 86 | `trainer.test.js`, `journey.test.js` |
| The board's `ask` station with a figure; the warm-up's two tools `4e.m2.r09` + `4e.m4.r04`; the rope instrument tagged | `features/classSession/*`, `launchkit/*`, `lessonlab/registry.js` | same | an `after` of ≈ 200 characters and one fraction row | `board.test.js`, `launchkit.test.js`, `lab.test.js` |
| The segment `walkway` and the inquiry kind `crews` (modes `story`, `days`); the final mission `story.mission` (day box, 3 posters a run) and its plaque variant (2 plaques a run, the walk back to E); the `ppcm` claim | `divisorIsles/walkway*.js`, `crews*.js`, `Mission.jsx`, `plaque.js`, `InquiryCrews.jsx`, `forgeCrews.jsx` | `multiples-et-diviseurs-communs` and `fraction-irreductible`, **uncommitted, 2026-11-26** | two crews on a walkway, 31 days of 34 px around the typed day, thousands grouped (« 2 121 »), a day up to 4-digit; `measure` options `typed: false` / `long: true`; the plaque 3/34 × 85/87 | `walkway.test.js`, `walkwayGame.test.js`, `mission.render.test.jsx`, `plaque.test.js`, `forgeCrews.render.test.jsx`, `inquiryCrews.render.test.jsx` |
| The hub map with labels wrapped at 17rem (`kit/mapNudge.js`); a guided retry on the last wave (`kit/ladder.js › waveBack`); the end card « 0 chute » | `kit/mapNudge.js`, `kit/ladder.js`, the kit's end card | the two lessons above, **uncommitted, 2026-11-26** | hub walks 335 and 337 (and the references trouver-le-pgcd 336, thales 278: 0 FAIL); the far islands of lesson 3 still overlap by < 12 px (debt) | `ladder.test.js` |
| The board's five-team station and `ask` with `figureAfter`; `LadderStation` with `step.words` | `features/classSession/*` | `multiples-et-diviseurs-communs` and `fraction-irreductible`, **uncommitted, 2026-11-26** | board walks 329 and 295, 0 FAIL, at 1366×768; « avant » does not fit the 110 px team column (debt) | `lessonScripts.test.js`, `ladderStation.render.test.jsx` |

Seen by the main session's eyes at that commit: 26 screens of the walk (the title, the first island, each experiment
at its heaviest number, each forge's tiles, one refutation, each last step but key 3's, a tablet, the store and the
sign, the knowledge map, two trainer sheets, one sitting sheet, two board stations, the memo, the lab). NOT looked at:
the warm-up's screens, the class test, the practice map, the end of the world. Everything that is not in the table is
walked by the next lesson.

**Where `PROVEN_LIMITS` comes from** (`kit/authoring/test/suites.js`, enforced by each lesson's `limits.test.js ›
describeLimits`): its numbers were measured by the ALGERIAN walks of 2026-11-19 (the PGCD-search lesson, three sizes —
the code's own comment). Lesson 1 kept the defaults and its French walk passed inside them, so for the screens of the
French table above the limits now hold as French proofs; for any other screen they are a ceiling to stay under, NOT a
proof — that screen is still walked. A limit is never raised without a French walk of the screen first.

The lines below were proven on the Algerian platform, in Arabic, right to left: they are kept as LIMITS to aim for
and as the data tests that already exist — never as a proof here.

## History — proven on the Algerian platform (NOT a proof here)

| Screen | Files | Proved by, at commit (DZ) | Proved for (limits) | Data test that stands in for the walk |
|---|---|---|---|---|
| The exam sitting « Brevet blanc » — reading, sitting, corrected copy, the ladder | `kit/ExamSitting.jsx`, `kit/bankSitting.js`, `kit/Paper.jsx` | lessons 4 and 5 (`qasim-mushtarak-akbar`, `tayin-pgcd`), `919e2307`; every sheet of two banks, 100 sheets | sheets of the bank as they are; NOT proved: a table wider than the sheet, a table drawn under 12 px | none yet — a lesson's bank is walked sheet by sheet until a test measures a sheet's widest table and longest line |
| The forge's frame — tiles, the mirror's test, a refutation, attacks, the seal, the last step, a tablet | `kit/RuleForge.jsx`, `kit/Tablet.jsx`, `divisorIsles/forgeParts.jsx` | lessons 4 and 5, `919e2307` + lesson 5's commit | 2 to 4 slots of tiles; a column heading up to « gap and gap of 0 cells » (Arabic length); pair cases with gaps up to 90 cells in the mirror; a tablet of a method line, two lists and one note | each lesson's `forges.test.js` (tile and tag lengths); a tablet's size: none yet |
| The board — situation, `ask` stations, naming stations, copybook pages | `features/classSession/LessonBoard.jsx` | lessons 4 and 5 | up to 6 cards on an `ask`; an `after` of three chained equalities; a tablet as above | each lesson's `board.test.js` (cue ≤ 70 characters, tablet math ≤ 2 rows) |

Not proven even there (walk them for every lesson): the story of each lesson (always new); the practice hub and its
mind map (positions are the lesson's); the knowledge map (positions are the lesson's); « Entraîne-toi » (its sheets are
generated: a random draw can exceed a line — lesson 5); the warm-up (cards drawn at random); the workshop and its bench
(one lesson only); a gap of 0 cells (one lesson only); the lab's instruments.

### Added by lesson 6 (`bahth-pgcd`, 2026-11-19 — passed at 1366×768, 1024×768 and 1840×900; eight screens looked at)

| Screen | Proven for | Data test |
|---|---|---|
| The workshop's `ladder` bench, `plain` (`InquiryGcd.jsx › LadderRows`, `inquiry.css`) and mode `both` (`InquiryGcdModes.jsx`) | a notebook of ≤ 5 rows; `both` with 31 rows against 2; numbers up to 1833; rows kept on reopening | (DZ) the lesson's `limits.test.js` |
| The fold experiment inside a mirror (`ladder/fold`) | 962 and 296, a run of 3 rows | — |
| The forge frame, extended | headings ≤ 35 characters, chips ≤ 54, attack questions ≤ 155, last steps of 4 lines in two columns with 4 boxes a line, a last-step question ≤ 146, mirror pairs up to 1833 cells | (DZ) `bahth-pgcd/world/limits.test.js` |
| A convoy of THREE bridges, the walk back after a refusal, the restore on reload | planks offered on the first island only | — (walked) |
| Long gaps drawn as strips | 1833 cells; 61 planks laid in 11.7 s | — |
| The practice map | 7 nodes with long names at the positions of `bahth-pgcd/world/practice.js` | — |
| The knowledge map | 15 cards on rows 5/23/41/59/76/93, two-line titles in the middle column | (DZ) the lesson's `journey.test.js` |
| The board | 14 stations, 5 keys, `single`-answer asks, the copybook as ONE group, naming rows ≤ 32 characters | (DZ) the lesson's `board.test.js`, `limits.test.js` |

### Added by lesson 7 (`awwaliyan-fima-baynahuma`, 2026-11-20 — passed at 1366×768)

| Screen | Proven for | Data test |
|---|---|---|
| A locked typed workshop beside offered planks, with a bench and a purse, on one island | it opens after two falls; the instruction changes when it opens | `e2e/lib/lessonWalk/story.mjs › unlock` |
| A convoy without a purse | gaps of 645 and 410; 322 planks laid in under 4 s of play | — |
| A non-plain `ladder`/`divide` experiment of TWO rounds inside a mirror | 4 rows then 3 rows | — |
| A last step that ends on yes/no buttons (`use.verdict`) | up to 11 boxes in 4 lines, two columns, plus the two buttons | (DZ) the lesson's `limits.test.js` |
| The store offering the plank 1 | 179 planks, 9.5 s | — |
| The instrument `duo` (`lessonlab/tools/Duo.jsx`) | its three tabs at 36 and 24 | `lessonlab/duo.render.test.jsx` |
| The warm-up family `4am.m1.r03` | one tool; write, common-divisor sort, PGCD sort | (DZ) `launchkit/launchkit.test.js` with the family |
| The bubble « Appuie sur E » after a refusal | under the purse, the equation and the verdict | — |

### Added by lesson 8 (`ikhtizal-kasr`, 2026-11-20 — passed at 1366×768) and « Le palais des dalles » (2026-11-21)

| Screen | Proven for | Data test |
|---|---|---|
| A bridge with a LIT STRETCH on pedestals (`divisorIsles/mark.js`, `Game.js › buildMark`): the posts, the bridge's sign, the equation's second line, « fills but misses the post », a rebuild from behind, a failed rebuild | 78 cells with 66 lit; a sign of three writings | `divisorIsles/mark.test.js`; `e2e/lib/lessonWalk/story.mjs › markedBridge` |
| A marked bridge in a workshop convoy of ONE bridge with a purse; a stretch lit in two strokes | 243 cells; strokes 5 + 8 of 39 | `purse.test.js` |
| A marked store inside a purse convoy: two options that hold, the purse run out, the store reopened with its reason | 273 cells, 91 planks | `story.mjs › markedStore` |
| A fraction typed over a real bar — the trainer's sheets (`{ frac: { n, d } }`), the forge's last step (up to four fractions on a line; a fraction + a PGCD box in two columns), a warm-up card | three-digit terms | `kit/trainerFrac.render.test.jsx`, `kit/ruleForgeFrac.render.test.jsx`, `launchkit/fraction.render.test.jsx` |
| A mirror case named by its `head` (« 66/78 → 33/39 ») | heads ≤ 25 characters; bars of 243 / 189 cells | (DZ) the lesson's `forges.test.js` |
| A board with KaTeX fractions in its text | 11 stations; a nested `\frac{304 \div 16}{368 \div 16}` | (DZ) the lesson's `board.test.js` |
| The instrument `strip` (`lessonlab/tools/Strip.jsx`) | 36 cells; NOT proven for a numerator greater than the denominator | `lessonlab/strip.render.test.jsx` |
| The warm-up with TWO core tools, one of them with fraction cards | `4am.m1.r03` + `1am.m5.r02` | (DZ) `launchkit/launchkit.test.js` |
| The story of the world « Le palais des dalles » (`gameworld/rootCourts/*`): a yard of crates, courts with a typed prediction, a course of gates, the experiment kinds `calc` and `roundtrip`, the final mission | yard 9 / 25; courts up to 196 tiles; 14 gates; a mission of four lines | (DZ) the lesson's `world/*.test.js`; walked by `jidhr-tarbii.walk.mjs` (story 1967 ok) |
| The board's `court` station (`LessonBoard.jsx › CourtStation`) | up to 5 cards; a ten-digit card; a √ card; a naming tablet drawn dense above 320 characters | `features/classSession/lessonScripts.test.js`, `courtStation.render.test.jsx` |
| The instrument `court` (`lessonlab/tools/NumberCourt.jsx`) | areas 1–400; walked on 30 and 144 with a real drag | `lessonlab/court.render.test.jsx` |
| A practice level on the kit's rail (`kit/GateRun*`) in « Le palais des dalles » | 6 gates, three hearts, a gate drawn as a fraction, the result card | (DZ) the lesson's `world/practice.test.js` |
| The warm-up family `3am.m3.r06` (a power with a real superscript) | level 1 write and sort, level 2 sort; NOT seen in a browser: the level-2 write « (2/3)² = ▢/▢ » | (DZ) `launchkit/launchkit.test.js`, `fraction.render.test.jsx` |
| A terrace of SEVERAL courts (`e2e/lib/lessonWalk/worlds/rootCourtsTerraces.mjs`): the yes/no card, courts the world closes, a way out that waits, a court that rides and stays, three mirrors, the clamp, a mission with a fraction box | dials of 0,1 / 0,05 / 0,01 / 0,005; five courts on one terrace (NOT all in view on arrival) | (DZ) the lesson's `story.test.js`; walked by `natiqa-ghayr-natiqa` (story 1731 ok) |
| The count from above, the length on both sides, the key of a court, the gate « ? » (`rootCourts/Game.js`) | counts up to 196 tiles, yard crates of 9 and 25; one reload with the key floating | no unit test plays `Game.js`; walked by `jidhr-tarbii` (story 1994 ok) |
| The experiment `chase` | the court of 2, five fractions up to 99/70, the ×1000 lens | `rootCourts/chase.test.js`, `inquiryChase.render.test.jsx` |
| The board's `court` station with FRACTION rod cards and a gate given as a fraction | up to 5 cards; 529/49 with 23/7 | `features/classSession/courtStation.render.test.jsx` |
| The instrument `piece` (`lessonlab/tools/FractionPlatform.jsx`) | area 2 with fifths and twelfths; 12/3 on 16 | `lessonlab/piece.render.test.jsx` |
