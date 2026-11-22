# The gate: lesson 4 « القاسم المشترك الأكبر لعددين طبيعيين » (`qasim-mushtarak-akbar`), rebuilt on the kit

Written 2026-11-19, at the end of the session that built it. Facts come from the walks, git and the local database; what
was not measured is said so. Contract: `docs/architecture/LESSON_V2.md` §6; design: `BATCH_2_DESIGN.md` §3; plan:
`LESSON_V2_MASTER_PLAN.md` §4ter-0 step 17.

> **REDESIGNED the same day, after this report (owner; `LESSON_V2_MASTER_PLAN.md` §4ter-0 step 19): keys 1 and 2 are now
> discovered ON THE ISLANDS** — one choice of planks (7, 11, 13, 9) for the two gaps 198 and 234, the island between
> holding none; then the planks 2, 7 and 14 for 266 and 322 with a purse of 42 coins that only 14 pays — and the mirror
> opens on the tiles (no experiment screen, no prediction), tests them on the planks he tried, attacks on other pairs
> drawn as two bridges. The kinds `common` and `summit` are no longer played by this lesson. Everything below about
> forges 1 and 2 (the shelves, the summit, their screenshots, the check counts) describes the lesson AS FIRST BUILT;
> the walks' numbers after the redesign are in the plan's step 19.

## Verdict

**`npm run status:lesson-v2 -- --lesson qasim-mushtarak-akbar` prints ✅ on every line but the paused phone line; its six
walks pass at 1366×768, 1024×768 and 1840×900.** Laptop and tablet only. **No student has played it and the owner has
not validated it.** Its old version (8 module pages, the mission player keys, the root knowledge files, the scene
`FlowerShopScene`) is deleted (`OLD_VERSION_TRACE_2026-11-18.md` §11).

It is the first lesson built with the experiments of `BATCH_2_DESIGN.md`: four keys, four kinds — `common` without the
longest (the planks of both gaps), `summit` (the longest, and why the search stops), `deal` (40 roses and 56 lilies into
identical vases), `nest` (the planks of both gaps are the planks of their longest). The last bridge asks for the longest
plank that fills BOTH stretches of the market's walkway (364 and 286 cells; 28 fills the first alone; 26 fills both).

## What was measured

| Check | Result |
|---|---|
| Walks, six of them, at the three sizes, on a frozen copy of the tree (`.claude/skills/lesson-v2/SKILL.md` §4) | **18 of 18 runs pass.** The student's world 874 checks, hub 226, « تدرّب » and the knowledge map 542, the exam sitting 2,023 (every sheet of the bank, 50), the board 184, the launch kit 226–227 (one random card shape differs), the same at each size. The trainer walk failed once at 1366×768 on its own new check (a whole one-line subtitle measured 1 px taller than its box — Arabic glyphs overhang): the CHECK was corrected, then it passed |
| Unit tests of what was touched (the agents' runs, by area) | the lesson's folder, the world and the kit: 364 tests (362 passed; the 2 failures were the board test's list comparisons, corrected, 15 of 15 then); launch kit, lab, class session and the seven boards: 203; the new kinds: 13 (`lists`), 17 (`sort`), 37 (`measure`, `part`); the four new modes with the world's folder and six lessons' `world/`: 568 |
| Repo checks | see `LESSON_V2_MASTER_PLAN.md` §4ter-0 step 17 (run after this report was written) |
| Published locally (§6.6) | lesson `available` / `published`; 8 modules `published`; 50 exercises `published` — read from the local database |
| Screenshots looked at with the eyes (§6.5), main session | **1366×768, first pass (before the fixes)**: story — start, the `common` guess / shelves / found, the summit descent / rest / found, forge 2 refuted / last step / tablet 2, the dash, the deal wrong pick / shared / found, forge 3 refuted / attack / last step / tablet 3, the stone, the nest compare, forge 4 refuted / last step / tablet 4, forge 1 last step / tablet 1, the store (three steps), the end; hub — locked, open, a rule card in a race; trainer — the map, the memo card, two exam questions, a correction; sitting — a level-2 sheet, the level-5 sheet, the corrected copy with its model answer; board — the summit, deal and nest stations, the fourth naming station, the second copybook page; launch kit — the sort, the workshop, the capsule's lab. **After the fixes**: forge 3 attack / refuted / agreed / sealed / last step, the store (two steps), the map, the board's deal station, the launch sort and the capsule's lab at 1366×768; forge 3's attack, the map, the launch sort (the longest card) and the board's deal station at 1024×768; the deal, the summit, the map and forge 3's attack at 1840×900. **NOT looked at by the main session**: tablets 1 and 4 after the fixes, forge 1 and 4's tile screens, most of the 122 sitting screenshots (sheets l1, l3, l4), the trainer's four runs beyond three screens, the board's `twin`, `both`, `other` stations and three naming stations, the hub's guide. The walks' agent reported looking at more (its list is in the session's notes); by the skill's rule that does not count |

## What the review found, and what was done

Found by the walks (fixed by their agent): the summit's line of lengths drew empty and doubled labels; its chips ran
against the reading direction; the deal's table squeezed the vases to 9 px counts; the forge's log hid the row that
refuted a rule (kit — now every row is offered while the mirror tests); the bank's « PGCD(252 ; 180) = 36 » was
scrambled by the bidi algorithm on 108 lines (now drawn as a formula AT DISPLAY, `kit/bankSitting.js › namesAsMath`; the
bank's files are untouched); the walk library expected « 45دج » where the screen rightly shows « 45 دج »; a board cue
was scrambled; mind-map labels overlapped.

Found by the eyes, after every walk passed (fixed by two agents, then re-walked):

1. the forge of the VASES drew a plank bridge in its mirror and wrote « لوح 5 » in its log — a case may now be a
   sharing (`forgeParts.jsx`, `dealParts.jsx`), drawn with the experiment's own vases and flowers;
2. the board's bouquet station said « لوح … يثبت / ينهار » — an `ask` step may carry its own words;
3. the final mission asked a plain division (24 or 26 on 650 cells) — it now needs the longest plank of two stretches;
4. five of the map's twelve cards showed « • » (three card kinds had no icon in the kit: 39 cards across the v2 lessons);
5. a card of the map was cut by its box and three link labels sat under cards; at 1840×900 the page's subtitle was cut
   by an ellipsis;
6. a list wrapped onto its comma (a race's rule card, a launch-kit card); a launch card took three lines at 1024×768;
7. the launch capsule's lab listed « القواسم المشتركة » — key 1's name — before the lesson; the lab opened from the
   launch kit now offers only instruments of earlier lessons;
8. Arabic slips in the last steps (« في الأكياس متماثلة », « 12 مزهريات », « في مزهريتين متماثلة »); the store's
   « تبقى 6 خانة ».

Each is a line of `.claude/skills/lesson-v2/defects.md`, with the check that catches it now.

## Open, for the owner

1. **The bank shown differently from its file, once more**: « PGCD(a ; b) » written in the words of a sheet is drawn as
   a formula on screen (like « DA » → « دج »). The bank's file is not changed. To accept or refuse.
2. **Two defects of the bank** (reported, not touched): sheet `l5-001` labels two different questions « (1 ب) »; four
   answer sheets of levels 4–5 are drawn below ×0.8 at 1024×768.
3. **The icons of three card kinds** are my choice: 🔑 « قاعدة » (`relationship`), 🧭 « طريقة » (`method`), ✨ « حيلة »
   (`tip`) — they show on 39 cards of the v2 lessons.
4. **The end screen** says « أنرتَ المنارة! » while this story ends at the flower market (a lighthouse is drawn there).
5. **The hub's root** is the lesson's title, the same words as key 2's name — on screen before key 2 is forged, as the
   lesson's title is everywhere.
6. **Choices left open by the agents who wrote the new kinds and modes** (none seen in a browser yet): `lists` — the
   world closes a complete list by itself; a missing plank is shown but not added; `sort` — a right drop shows nothing
   but the card landing; `measure` — the plank 1 is refused as out of range; the world's check tries the shortest planks
   first; `part` — one re-cut ends the round, even on a writing that could be re-cut again; `ladder/fold` — he types the
   folded line, he cannot fold by selecting the rows; `ladder/both` — the two ladders have the same length only for
   twin gaps (proved up to 150), so lesson 6's « the same » round must be a pair of twins.
7. **Five final-test items** (E1–E5) of the old version retire at the next deploy; resource titles in the config keep
   old contexts.
8. Known limits: `nest` has no claim-building step (tiles follow the experiment); no claim kind states « the common
   divisors of a and b are L »; seven legacy walks still open this lesson's deleted pages (`lesson-kit/lab-coach.mjs`,
   `manipulations.mjs`, `moyen-retrofit-phase1.mjs`, `4am-aadad-tabiiya-natiqa.mjs`, `knowledge-map.mjs`,
   `notebook-lesson.mjs`, `teacher-memo.mjs`).

## Cost (agents only)

Nine agents, about 2.9 million tokens: the walks 690,000 (73 minutes — the longest block), the forges 377,000, the
student-world fixes 346,000, the board 342,000, the two new kinds 268,000, the pack 245,000, the world's repair 235,000,
the board and launch fixes 230,000, the hub's hidden names 166,000. The world's content had been drafted the day before.
The main session's own tokens were not measured. What this teaches about the next lessons is the owner's request of the
same day: `.claude/skills/lesson-v2/` (the pipeline, the briefs, the ledger of defects, the review).
