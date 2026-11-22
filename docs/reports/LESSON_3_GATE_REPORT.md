# The gate: lesson 3 « خواص قواسم عدد طبيعي » (`khawass-qawasim`), rebuilt on the kit

Written 2026-11-18, at the end of the session that built it. Facts come from the walks, git and the database; what was
not measured is said so. Contract: `docs/architecture/LESSON_V2.md` §6; plan: `LESSON_V2_MASTER_PLAN.md` §4ter-0 step 9.

## Verdict

**`npm run status:lesson-v2 -- --lesson khawass-qawasim` prints ✅ on every line but the paused phone line.** Laptop and
tablet only. **No student has played it and the owner has not validated it.** The old modules and `?view=classic` are
still there (the owner's decision, still open). **Update 2026-11-18: DELETED on the owner's order — `OLD_VERSION_TRACE_2026-11-18.md`.**

> **Review of 2026-11-19 — this lesson's « done » (CLAUDE.md, `LESSON_V2.md` §6) is NOT met yet.** About 50 screenshots
> were never looked at with the eyes (row « Screenshots » below), and the exam-sitting numbers below belong to the GENERATED
> sitting, deleted the same day (the sitting now serves the bank as it is, `kit/bankSitting.js`). The sitting walks were
> run on the bank afterwards, but with the walk weaknesses the review found (one random sheet per run, a weakened
> `gameworld-sitting.mjs`); they are being repaired. Lines marked **SUPERSEDED** wait for the re-run: **to be re-measured**.
> The world itself changed on 2026-11-19 (`REVIEW_2026-11-19.md`): the bridge after the third key is now **105** (was 70:
> 280 with the piece 175 laid on it leaves 105; moulds 10, 14, 35 — two fill it), island H is « جزيرة الحجر » (was
> « جزيرة الحروف »: the word « حروف » comes only with the tablet), the letters are k, k′ (n for the multiplier), the four
> forges ask no predictions, the two forges whose experiment writes the rule hold no false tile, and a half-right answer
> of « تدرّب » no longer earns P1 or P3.

## What was measured

| Check | Result |
|---|---|
| Walks, six of them, at 1366×768, 1024×768 and 1840×900 | all pass at the three sizes. 1366×768: the student's world 670 checks, hub 219, « تدرّب » 465, exam sitting 156, board 167, launch kit PASSED. 1024×768: 611 / 199 / 432 / 142 / 167 / PASSED. 1840×900: 670 / 219 / 465 / 156 / 167 / PASSED. **One flake**: the sitting walk failed once at 1840×900 on a 30-second `page.screenshot` timeout (33 checks in), and passed twice in a row afterwards (156 / 156). **SUPERSEDED (2026-11-19):** the sitting counts 156 / 142 / 156 are those of the generated sitting, deleted; the kit, the walks (12 px floor by default) and the world changed since — every walk of this lesson: **to be re-measured** |
| « مختبري » walk (`lesson-lab.mjs`, the new instrument and the four-lesson shelf) | 49 ok, 0 FAIL at 1366×768 (run once; not at the other two sizes) |
| Unit tests | the whole web suite after the last code edit: **1032 files, 18,167 tests pass** (an earlier full run had 4 failures, all fixed: the pack test, two `boardLessons` assertions and a loop of the kit's tests that timed out under load) |
| Repo checks | `check:unused`, `check:unreached`, `check:format`, `check:lessons` (entry bundle 197.8 KB of 212) pass. `npm run lint` has 4 errors, all in `e2e/class-lesson-qawasim.mjs` (lesson 2's walk, untouched: four unused variables) |
| Published locally (§6.6) | lesson `available`; 9 modules `published`; 50 exercises `published`, read from the local database (the old modules and bank were already there; nothing was added to them) |
| Screenshots looked at with the eyes (§6.5) | student: the letters proof screen (before and after the fix), the join foil round, the stack number line, the peel claim, the fourth tablet (before the fix); board: the stack ask, the peel ask, the naming card of the proof, and at 1024 the first naming card and the foil ask (both before their fixes). **NOT looked at one by one:** the other ~50 shots of the world walk, the hub, « تدرّب », the sitting, the launch kit, the other board shots, and every 1024×768 and 1840×900 shot that passed — **so the definition of done is not met** (review, 2026-11-19): they must be looked at after the re-run |

## Time and size (git, not a stopwatch)

Nothing was committed before this report: the whole lesson is one commit. Calendar time of the session: from about 17:14
to about 19:30 on 2026-11-18, planning and first reading included. Hours of actual work were not timed.

Written for this lesson (lines): `world/` 3,850, `board/` 756, `lesson.pack.js` 23, the class test 320 (JSON), the
instrument `Planks.jsx` 174, the six walks 3,075. In the kit: 1,255 lines in four new files (`InquiryCombine.jsx`,
`InquiryProof.jsx`, `inquiry2.test.js`, `inquiryScreens.render.test.jsx`) plus the four kinds' logic and styles (about 430
lines added to `inquiry.js` and `inquiry.css`).

## How it was built

Fable orchestrated; seven agents on `opus` wrote the code (the kit's four inquiry kinds; the world content; the forges and
inquiries; the board; the satellites — launch-kit test, class test, instrument; the walks), each on files nobody else was
touching. The kit's screens are 2D SVG/DOM, so they were not coded by Fable. Fable wired the pack, ran every check and
walk, and fixed what they found.

## What the walks found (real defects, none visible to a unit test)

1. **`judgePeelClaim` overwrote the gap and bridge lengths with booleans** (`{ a, b, d, ...fitsRow() }`, and `fitsRow`
   returns `a` and `b` as booleans), so the peel table never outlined a plank that refutes the claim. 47 kit tests passed.
   Fixed (`gap`, `bridge`), with a test.
2. The proof screen's statement was laid out one token per row (a grid whose items were the pieces of `MathText`), pushing
   the proof slots under the « إلى المرآة » button. Fixed in the kit.
3. A raw `$p + q$` on the fourth tablet (`notes` are plain text) and formulas in plain text inside the proof forge's slot
   labels, scrambled by the right-to-left flow. Reworded.
4. The exam sheet of « تدرّب » printed the prompt as plain text: `$…$` showed raw on four formats. The kit's `Marked` now
   renders a prompt that contains a formula through `MathText` (a prompt without one keeps its underlined numbers).
5. Peel's first attack showed **96**, lesson 2's store number. Replaced.
6. Board: a cue too long for the footer at 1024 px (cut), and tablets whose formula row ran out of the card at 1024 px
   (`jam-wal-farq`, `baqi-qisma`, and the proof's). Cues shortened, rows reduced (so the tablets state fewer equalities:
   the story test's guard went from 8 to 6).
7. The title screen's key hints were 11.5 px: a 12 px floor in the kit (`world.css`).
8. Walk faults, found by running them: a `$` of the lesson counted as raw by the walk's own regex; reading numbers from KaTeX
   annotations (`\displaystyle`); a 30-second wait on an element that does not exist for a right answer; no-break spaces
   lost in a constant. **The 12 px floor, first applied only from 1300 px, now holds at EVERY size** (follow-up the same
   day): the kit's small text (step numbers, the mirror's `rf-says` and log, the sheet's field labels, the board's
   toolbar, the paper's points label) was raised to 12 px, with the zoom of the frame it sits in counted (the rule forge
   is drawn at ×0.8 at 1024×768). Exempt, on purpose: the knowledge map (the kit scales it to its panel). Text that a
   `Fit` frame shrinks dynamically cannot be floored by CSS. **SUPERSEDED (2026-11-19):** the knowledge map is no longer
   exempt and a `Fit` given a `floor` keeps 12 px (`GAME_WORLD.md` « 12 px floor at every size »).

## Copied from lesson 2, on purpose

The structure of every file of `world/` and `board/`, the walks' helpers (`e2e/lib/walk.mjs` grew options: foreign words and
numbers, a width for the font floor), the class test's shape. A shared helper for a whole lesson's walks is still owed.

## Not done, and why

- **The old modules and `?view=classic` are still there** (the owner's decision, open). **Update 2026-11-18: DELETED on the owner's order — `OLD_VERSION_TRACE_2026-11-18.md`.**
- **The proof key (P4) produces no evidence.** A proof written with letters cannot be re-checked from numbers, and the claim
  kinds have none for it (`claims.js`, the server's `ClaimVerifier.php` and their fixture would change).
- ~~**The practice dash uses only the sentence types of `divisorIsles/strings.js`**~~ — **DONE 2026-11-18**: a wave may carry its own sentence and help (`why`); the lesson's ladder asks « عدد يقسم a + b », « a − b », « قاسم مشترك للعددين », « عدد يقسم باقي القسمة ».
- **The last bridge's store still has the student divide 1015** after the « without dividing » choice; the « without
  dividing » idea lives in the stone's question.
- ~~**Euclidean division is not a prerequisite of this lesson in the learning net**~~ — **DONE 2026-11-18**: the link
  `2am.m1.r04 → 4am.m1.r02` (`requires`, weight **core**) was added to `learning_net_moyen.json` (the 2AM item, not the
  1AM one: the 2AM item already extends it and divides by any number), the maps and the weights table regenerated. Lessons 2
  AND 3 (they share `4am.m1.r02`) now have TWO core tools in their launch: `4am.m1.r01` then `2am.m1.r04`, which got its
  question family in `launchkit/families.js` (« القسمة الإقليدية على أيّ عدد », instrument `paper`) — it also serves the
  three PGCD lessons, where it was already core but had no family. **To re-run**: the launch walks of lessons 2 and 3
  (`launch-kit-qawasim.mjs`, `launch-kit-khawass.mjs`) were written for ONE tool (one slot in the bag, scores 2/2, 0/2).
- ~~**The sitting's exercises are generated** (in the bank's shapes, answers computed by code); the 50 exercises of the old
  bank are not read by it.~~ — **RESOLVED 2026-11-18 (code; walks not re-run)**: the sittings of lessons 1–3 (and of the three
  uncommitted 1AM/2AM lessons) now serve the bank AS IT IS through the kit's adapter `kit/bankSitting.js`
  (`world/sitting.js` is one call: `createBankSittings({ lesson })`); marked by the practice evaluator, evidence through the
  practice engine (the server re-computes). The sitting walks of lessons 1–3 were rewritten for it and have NOT been run. **SUPERSEDED (2026-11-19):** they were run afterwards, but the review found them too weak (one random sheet per run, the answer key read from the page) — being repaired; result **to be re-measured**.
  Findings, design, what falls back and the bank defects: `docs/reports/BANK_AS_IS_2026-11-18.md`.
- The `stack` ask on the board draws 600 planks of 3 in one bar: it reads as stripes (seen at 1366×768), not as planks.
- **Phone**: paused. No phone walk. **A real tablet, a real phone and the owner's validation** were never part of this work.
- **The walks are not in CI.**
