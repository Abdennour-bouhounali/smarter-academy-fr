# Proven screens — what a new lesson does not walk again

Read with `SKILL.md` §6. Since 2026-11-19 the ONE size is 1366×768 (owner). A line is added when a screen passed at 1366×768 AND was looked at with
the eyes; it gives the commit, the lesson that proved it, and the LIMITS it was proved for. A lesson whose data stays
inside the limits checks that data by a unit test and does not walk the screen; a lesson that exceeds a limit walks it.
A line is REMOVED when the screen's code changes after its commit (`git log <commit>..HEAD -- <files>`) or a lesson
breaks it. **An empty table means: walk everything.**

| Screen | Files | Proved by, at commit | Proved for (limits) | Data test that stands in for the walk |
|---|---|---|---|---|
| The exam sitting « الامتحان الأبيض » — reading, sitting, corrected copy, the ladder | `kit/ExamSitting.jsx`, `kit/bankSitting.js`, `kit/Paper.jsx` | lessons 4 and 5 (`qasim-mushtarak-akbar`, `tayin-pgcd`), `919e2307`; every sheet of two banks, 100 sheets | sheets of the bank as they are; NOT proved: a table wider than the sheet (lesson `qawaid`: three sheets scroll sideways), a table drawn under 12 px (lesson 2 `l5-005`) | none yet — a lesson's bank is walked sheet by sheet until a test measures a sheet's widest table and longest line |
| The forge's frame — tiles, the mirror's test, a refutation, attacks, the seal, the last step, a tablet | `kit/RuleForge.jsx`, `kit/Tablet.jsx`, `divisorIsles/forgeParts.jsx` | lessons 4 and 5, `919e2307` + lesson 5's commit | 2 to 4 slots of tiles; a column heading up to « هوّة وهوّة من 0 خانة »; pair cases with gaps up to 90 cells in the mirror; a tablet of a method line, two lists and one note | each lesson's `forges.test.js` (tile and tag lengths); a tablet's size: none yet |
| The board — situation, `ask` stations, naming stations, copybook pages | `features/classSession/LessonBoard.jsx` | lessons 4 and 5 | up to 6 cards on an `ask`; an `after` of three chained equalities; a tablet as above | each lesson's `board.test.js` (cue ≤ 70 characters, tablet math ≤ 2 rows) |

Not yet proven (walk them for every lesson): the story of each lesson (always new); the practice hub and its mind map
(positions are the lesson's); the knowledge map (positions are the lesson's); « تدرّب » (its sheets are generated: a
random draw can exceed a line — lesson 5); the launch kit (cards drawn at random); the workshop and its bench (one
lesson only); a gap of 0 cells (one lesson only); the lab's instruments.

## Added by lesson 6 (`bahth-pgcd`, 2026-11-19 — passed at 1366×768, 1024×768 and 1840×900; the main session looked at eight screens)

| Screen | Proven for | Data test |
|---|---|---|
| The workshop's `ladder` bench, `plain` (`InquiryGcd.jsx › LadderRows`, `inquiry.css`) and mode `both` (`InquiryGcdModes.jsx`) | a notebook of ≤ 5 rows; `both` with 31 rows against 2; numbers up to 1833; rows kept on reopening | the lesson's `limits.test.js` |
| The fold experiment inside a mirror (`ladder/fold`) | 962 and 296, a run of 3 rows | — |
| The forge frame, extended | headings ≤ 35 characters, chips ≤ 54, attack questions ≤ 155, last steps of 4 lines in two columns with 4 boxes a line, a last-step question ≤ 146, mirror pairs up to 1833 cells | `bahth-pgcd/world/limits.test.js` |
| A convoy of THREE bridges, the walk back after a refusal, the restore on reload | planks offered on the first island only | — (walked) |
| Long gaps drawn as strips | 1833 cells; 61 planks laid in 11.7 s | — |
| The practice map | 7 nodes with long names at the positions of `bahth-pgcd/world/practice.js` | — |
| The knowledge map | 15 cards on rows 5/23/41/59/76/93, two-line titles in the middle column | the lesson's `journey.test.js` |
| The board | 14 stations, 5 keys, `single`-answer asks, the copybook as ONE group, naming rows ≤ 32 characters | the lesson's `board.test.js`, `limits.test.js` |

## Added by lesson 7 (`awwaliyan-fima-baynahuma`, 2026-11-20 — passed at 1366×768, the ONE size)

| Screen | Proven for | Data test |
|---|---|---|
| A locked typed workshop beside offered planks, with a bench and a purse, on one island | it opens after two falls; the instruction changes when it opens | `e2e/lib/lessonWalk/story.mjs › unlock` |
| A convoy without a purse | gaps of 645 and 410; 322 planks laid in under 4 s of play | — |
| A non-plain `ladder`/`divide` experiment of TWO rounds inside a mirror | 4 rows then 3 rows | — |
| A last step that ends on yes/no buttons (`use.verdict`) | up to 11 boxes in 4 lines, two columns, plus the two buttons | the lesson's `limits.test.js` |
| The store offering the plank 1 | 179 planks, 9.5 s | — |
| The instrument « مِجهر العددين » (`lessonlab/tools/Duo.jsx`) | its three tabs at 36 and 24 | `lessonlab/duo.render.test.jsx` |
| The launch family `4am.m1.r03` | one tool; write, common-divisor sort, PGCD sort | `launchkit/launchkit.test.js` |
| The bubble « اضغط E » after a refusal | under the purse, the equation and the verdict | — |

## Added by lesson 8 (`ikhtizal-kasr`, 2026-11-20 — passed at 1366×768, the ONE size)

| Screen | Proven for | Data test |
|---|---|---|
| A bridge with a LIT STRETCH on pedestals (`divisorIsles/mark.js`, `Game.js › buildMark`): the posts, the sign « لافتة الجسر », the equation's second line, « fills but misses the post », a rebuild from behind, a failed rebuild | 78 cells with 66 lit; a sign of three writings | `divisorIsles/mark.test.js`; `e2e/lib/lessonWalk/story.mjs › markedBridge` |
| A marked bridge in a workshop convoy of ONE bridge with a purse; a stretch lit in two strokes | 243 cells; strokes 5 + 8 of 39 | `purse.test.js` |
| A marked store inside a purse convoy: two options that hold, the purse run out, the store reopened with its reason | 273 cells, 91 planks | `story.mjs › markedStore` |
| A fraction typed over a real bar — the trainer's sheets (`{ frac: { n, d } }`), the forge's last step (up to four fractions on a line; a fraction + a PGCD box in two columns), a launch card | three-digit terms | `kit/trainerFrac.render.test.jsx`, `kit/ruleForgeFrac.render.test.jsx`, `launchkit/fraction.render.test.jsx` |
| A mirror case named by its `head` (« 66/78 → 33/39 ») | heads ≤ 25 characters; bars of 243 / 189 cells | the lesson's `forges.test.js` |
| A board with KaTeX fractions in its text | 11 stations; a nested `\frac{304 \div 16}{368 \div 16}` | the lesson's `board.test.js` |
| The instrument « شريط الكسر » (`lessonlab/tools/Strip.jsx`) | 36 cells; NOT proven for a numerator greater than the denominator (it writes 36/24 over a strip of 24 lit of 36) | `lessonlab/strip.render.test.jsx` |
| The launch kit with TWO core tools, one of them with fraction cards | `4am.m1.r03` + `1am.m5.r02` | `launchkit/launchkit.test.js` |
| The story of the world « قصر الساحات » (`gameworld/rootCourts/*`): a yard of crates, courts with a typed prediction, a course of gates, the experiment kinds `calc` and `roundtrip`, the final mission | yard 9 / 25; courts up to 196 tiles; 14 gates; a mission of four lines | the lesson's `world/*.test.js`; walked by `e2e/lessons/jidhr-tarbii.walk.mjs` (story 1967 ok) on 2026-11-21, not committed yet |
| The board's `court` station (`LessonBoard.jsx › CourtStation`) | up to 5 cards; a ten-digit card; a √ card; a naming tablet drawn dense above 320 characters | `features/classSession/lessonScripts.test.js`, `courtStation.render.test.jsx` |
| The instrument « ساحة العدد » (`lessonlab/tools/NumberCourt.jsx`) | areas 1–400; walked on 30 and 144 with a real drag | `lessonlab/court.render.test.jsx` |
| A practice level on the kit's rail (`kit/GateRun*`) in « قصر الساحات » | 6 gates, three hearts, a gate drawn as a fraction, the result card | the lesson's `world/practice.test.js` |
| The launch family `3am.m3.r06` (a power with a real superscript) | level 1 write and sort, level 2 sort; NOT seen in a browser: the level-2 write « (2/3)² = ▢/▢ » | `launchkit/launchkit.test.js`, `fraction.render.test.jsx` |
| A terrace of SEVERAL courts in « قصر الساحات » (`e2e/lib/lessonWalk/worlds/rootCourtsTerraces.mjs`): the yes/no card, courts the world closes, a way out that waits, a court that rides and stays, three mirrors, the clamp, a mission with a fraction box | dials of 0,1 / 0,05 / 0,01 / 0,005; five courts on one terrace (NOT all in view on arrival) | the lesson's `story.test.js`; walked by `natiqa-ghayr-natiqa` (story 1731 ok) on 2026-11-21 |
| The count from above, the length on both sides, the key of a court, the gate « ؟ » (`rootCourts/Game.js`) | counts up to 196 tiles, yard crates of 9 and 25; one reload with the key floating | no unit test plays `Game.js`; walked by `jidhr-tarbii` (story 1994 ok) |
| The experiment `chase` | the court of 2, five fractions up to 99/70, the ×1000 lens | `rootCourts/chase.test.js`, `inquiryChase.render.test.jsx` |
| The board's `court` station with FRACTION rod cards and a gate given as a fraction | up to 5 cards; 529/49 with 23/7 | `features/classSession/courtStation.render.test.jsx` |
| The instrument « منصّة الكسر » (`lessonlab/tools/FractionPlatform.jsx`) | area 2 with fifths and twelfths; 12/3 on 16 | `lessonlab/piece.render.test.jsx` |
