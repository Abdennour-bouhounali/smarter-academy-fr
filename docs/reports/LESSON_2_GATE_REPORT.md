# The gate: lesson 2 « قواسم عدد طبيعي » (`qawasim-adad-tabii`), rebuilt with the kit only

Written 2026-11-18, at the end of the second session on it. Facts come from git, the walks and the database; what is
not measured is said so. Contract: `docs/architecture/LESSON_V2.md` §6; plan: `LESSON_V2_MASTER_PLAN.md` §4ter-0 step 8.

## Verdict

**Lesson 2 prints ✅ on `npm run status:lesson-v2 -- --lesson qawasim-adad-tabii`** (the phone line is PAUSED, owner
2026-11-18, and counts neither way). Laptop and tablet only. **No student has played it and the owner has not validated
it** (his playing of 2026-11-17 found three defects, all fixed; the later rebuild of the two hard keys and the chart
corrections are not validated yet).

## What was measured

| Check | Result |
|---|---|
| Walks at 1366×768, 1024×768, 1840×900 | the practice hub 199 checks; « تدرّب » 421; exam sitting 142; the board 12 screens (each with layout, no raw formula, no word of the pilot, formulas left to right) — all pass at the three sizes, after the formula check was repaired. The student's world walk (179 checks) and the launch-kit walk (28) were re-run on 2026-11-18 at all three sizes and pass. **One flake**: the world walk failed once at 1840×900 on « planks of 8 hold over the same gap: the first bridge turned round » (a timed 3D step) while the machine was at load 14, and passed on the next run (179 / 179) — that step is sensitive to load, so a failure there under heavy load is not by itself a defect |
| The pilot (regression after the kit was touched) | its walks pass at 1366×768 on 2026-11-18: story 104, practice 30, field 102, sitting 45, launch kit 56, lab 47, class session 102, class lesson (board) clean |
| Unit tests | web 18,057 pass (the phone-lesson test was rewritten for the pause); the board: tests that compute every answer and number |
| Repo checks | `check:lessons` (entry bundle 197.8 KB of 212), `check:unused`, `check:unreached`, `check:format`, ESLint on every file changed |
| Published locally (§6.6) | lesson `available`; 8 modules `published`; 50 exercises `published` — read from the local database (the pilot: the same) |
| Screenshots looked at with the eyes (§6.5) | student: title, the wall, a refuted rule, a tablet, the gate dash, the number line of the search, the 100-chart with the claim on 9, the attack on rule 4, the store, the finale; teacher: the board's opening, the question on 252, the naming card, the copybook, the memo's first page. NOT looked at one by one: the other ~40 shots of the world walk |

## Time and size (git, not a stopwatch)

- First v2 commit of the lesson: 2026-11-17 18:09 (`wip … world content, forges, pack`); the board: 2026-11-18 15:56.
  About 22 hours of calendar time, 14 commits on two days. Hours of actual work were not timed.
- Written for this lesson (lines of JS/JSX/JSON): `world/` 3,085 (the pilot's: 2,721), `board/` 505 (the pilot's: 355),
  `knowledge.jsx` 169, `lesson.pack.js` 23, walks 1,431 (their files named `*qawasim*`); plus its launch-kit family and
  class test.
- Shared, not copied: the kit (12,608 lines) and the mechanic (`divisorIsles/`, 7,451 lines). Changed while building
  lesson 2 because the walks proved a defect: the guide card, the hub's rule tablet, the knowledge page, « تقدّمي »,
  the trainer's statement and button, the board's plank row, naming card and copybook.

## Copied from the pilot, on purpose or for lack of a shared helper

- The walks were assembled from the pilot's walks' helpers (copied, not shared); `e2e/lib/walk.mjs` is the start of the
  shared one, and the board walk reuses the pilot's fake-teacher header. A shared helper module is still owed.
- The board's step kinds (`situation`, `ask`, `name`, `trace`) are the pilot's; lesson 2 uses none of its `bridges` and
  `forge` (the remainder mirror).
- The shape of `board/memo.js` and the memo parts are the pilot's; every number is lesson 2's own.

## What the walks taught about the walks

- The check « a formula reads left to right » matched no atom of a `\displaystyle` formula, so it could never fail, in
  `lib/walk.mjs` as in the board walk. Repaired; re-run; no mirrored formula was found.
- An earlier line of the plan said lesson 2's world « plays end to end » while its store was never played: now every screen
  is played through its UI by a walk (hub, trainer, sitting, board included).

## Not done, and why

- **The old modules and `?view=classic` are still there** (§6.3). Decision D3 says the pilot's classic view « goes when
  the kit does », and `LESSON_V2.md` §1ter says a v2 lesson keeps its modules because every report reads them (A4: not traced
  page by page). Deleting them is the owner's call; it was not done for either lesson. **Update 2026-11-18: DELETED on the owner's order — `OLD_VERSION_TRACE_2026-11-18.md`.**
- **Phone**: paused. The debt, measured at 800×370 on 2026-11-18, is in the plan (step 8).
- **No measured weight budget per lesson**; **no walk runs in CI**.
- **The owner's validation**, and a real tablet and a real phone, were never part of this work.
