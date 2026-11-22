# Prompt — convert unit 3 « الحساب الحرفي » (4AM) to the mission prototype (written 2026-11-11)

> Paste everything below the line into a NEW Claude Code session at the repository root, or give it to a build agent. It is the unit-9
> prompt (`UNIT9_KHASSIYAT_TALIS_MISSION_PROMPT.md`) with unit 3's facts and a new §10 « What unit 9 taught » (commits `50e5f844` →
> `4f59b34a`). Sections §2, §3 and §6–§9 of the unit-9 prompt apply here UNCHANGED and are not repeated: read them there, then read §10
> below as carefully — every item in it is a bug that was shipped once and caught in review.

---

You are converting **unit 3 « الحساب الحرفي » (4AM, ميدان أنساب الأعداد والحساب)** to the validated mission prototype. Treat it as one
project, lesson by lesson, with a commit after each lesson. Units 1, 2 and 9 are the reference: every rule and pattern applied there is
BINDING here (owner, 2026-11-08). Do not wait for the owner's validation between lessons.

## 0. Read first — do not skip

1. `CLAUDE.md` in full.
2. `docs/reports/UNIT9_KHASSIYAT_TALIS_MISSION_PROMPT.md` §0–§9 (the recipe, the per-lab treatment, councils, verification, docs and
   commits, what unit 2 taught).
3. `docs/reports/MISSION_ROLLOUT_PROGRESS.md` — above all the unit-9 sections (« Unit 9, lesson 1/2/3 », « Unit 9, synthesis », « The
   synthesis recipe »): their traps and review findings.
4. `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` §4septies and the « Rollout recipe »; `docs/architecture/MANIPULATION_CONTRACT.md` « First »
   to « Sixteenth example », §8quater; `MANIPULATION_DNA.md` §17; `ARABIC_RTL_CONTRACT.md`.
5. The unit-9 conversions read as CODE (`git show`): `50e5f844` `aksiya-talis` (shared scene kit, sr-only verdict region, `LabCheckpoint`
   accept/preset/render), `76a4545b` `inshaat-talis` (a refusal explained in words, a cap on moves), `9f7fb170` `talis-hisab-atwal` (a
   NEW player-only lab beside an untouched page lab, figures beside an exercise with `data-paging-keep`, `content/*_ROUNDS` read by the
   rollout status), `0476bca1` (the synthesis: `easierProps`, `releases`, `missesOf`, typed steps in their shape).
6. The algebra: `packages/core/arithmetic/polynomials.js` and `expansion.js` (imported by path, never from the core barrel); the unit's
   extraction `docs/sources/4am/unit3/`.

## 1. The unit

| # | Lesson id | Lab today (module 1) | Climax (`lessonProblem.module`) |
|---|---|---|---|
| 1 | `nashr-tabsit` « نشر وتبسيط عبارة جبرية » | `pitch-expansion` (`algebra/PitchExpansion.jsx`, `logic/pitchExpansion.js`) | module 4 « ملعب وممرّ المتفرّجين » |
| 2 | `mutatabiqat-shahira` « المتطابقات الشهيرة » | `pitch-expansion` (the same lab, square fields) | module 5 « ملعب الحيّ: مدرّجات على ضلعين » |
| 3 | `tahlil-ibara` « تحليل عبارة جبرية » | `turf-factoring` (`algebra/TurfFactoring.jsx`, `logic/turfFactoring.js`) | module 5 « الملعب الجواري: كم صفًّا من العشب؟ » |
| S | `wadiya-idmajiya-harfi` (synthesis) | `pitch-expansion` | LAST, and only once the owner has answered the synthesis-recipe question (§5) |

Folder: `apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/hisab-harfi/`. Order: catalogue order (lessons 15 → 17).

**State on 2026-11-11 (check it again):** neither lab has the player treatment (no `useInMissionPlayer`, `onVerdict`, `chains`,
`coachOf`, rounds). `pitch-expansion` is shared by lessons 1 and 2: lesson 1 gives it its player treatment (in shared code, with
per-round props); lesson 2 adds what square fields need (the identities) without breaking lesson 1 — its rounds test must still pass.
The logic files have no unit test of their own today (`pitchExpansion.render.test.jsx`, `turfFactoring.render.test.jsx` only): add
`logic/<lab>.test.js` with the player logic. `nashr-tabsit` has `prerequisiteLessonCodes: []` in
`packages/core/curriculum/dz/lessons_4am_2026_2027.json`: « راجع قبل أن تنطلق » would be empty — set it from the net's `requires`
links (`LEARNING_NET.md`; the 3AM lessons on expansion / the distributive property if the net names them), export, import, check the DB.

## 2–3. The per-lesson recipe and the per-lab treatment

Unit-9 prompt §2 and §3, unchanged, with these algebra specifics instead of its « Geometry specifics »:
- **Exact algebra only:** polynomials through `polynomials.js` (`samePolynomial`, `reduce`, `evaluate`), never a float compared with `===`;
  areas are integers for the x on screen.
- **The BUILD question** writes the expansion with tiles: `slots`/`tiles` with ONE decoy, the classic error of the lesson (lesson 1:
  forgetting a cross term, a sign error on −k(a − b); lesson 2: (a + b)² = a² + b², the missing 2ab, (a − b)² with + b²… pick ONE per
  build; lesson 3: the common factor half taken out, 6x² + 4x = 2x(3x + 4) vs 2x(3x + 2)).
- **The identity is the discovery:** an equality checked for ONE x is not yet an identity — the rule question comes only after two
  different x (the lab's own E. today).
- **Signs and letters in Arabic text:** every term is in `MathText` / `$…$`; a minus never starts an Arabic line outside a formula; « x »
  is never written as a bare Latin letter in an Arabic sentence.
- **Scenes:** the unit's contexts are football pitches and grass (« الملعب »): build ONE shared scene kit for the unit
  (`lessons/common/mission/pitchSceneKit.jsx`, like `thalesSceneKit.jsx`) and one thin scene per lesson; people only through `KidFigure`.

## 4. Unit-level work (after the three lessons)

Unit-9 prompt §4 with unit 3: add unit 3 to `apps/web/src/pages/unit/unitMissions.js` (3 keys, the challenge rewritten in the platform's
words, no climax number), `unitMissions.test.js` green, `node apps/web/e2e/unit-mission-view.mjs` green at every size (it reads each
unit's ميدان from the catalogue), screenshots looked at. Separate commit `feat(unit): unit 3 « الحساب الحرفي » on the one-screen unit
page`. The unit page entry does NOT wait for the synthesis.

## 5. The synthesis

Owner rule (2026-11-10): every unit's synthesis is converted after its lessons. The recipe is PROVISIONAL until one real student has been
timed on unit 9's pilot (`MISSION_ROLLOUT_PROGRESS.md` « The synthesis recipe »); the owner's decision 2 of 2026-11-10 says whether to copy
it before that timing. **If the owner has not answered, stop after the unit page and report** — do not convert `wadiya-idmajiya-harfi`. If
the owner said yes, follow the recipe: role scan first, module 7 as rounds (a `pitch-expansion` player round already exists from lesson 1),
keys owned, no training ★, trainings counted, notebook screen, peer sheet = a wrong PLAN.

## 6–9. Councils, verification, documentation, what unit 2 taught

Unit-9 prompt §6–§9 unchanged. Docs: a unit-3 table and a section per lesson in `MISSION_ROLLOUT_PROGRESS.md`, the lab-families rows,
`MANIPULATION_CONTRACT.md` « Seventeenth » (pitch-expansion) and « Eighteenth example » (turf-factoring), the guide for any new reusable
pattern, `LEARNING_NET.md` for the prerequisites, `CLAUDE.md` (the converted-lessons sentence and the unit-page sentence).

## 10. What unit 9 taught — apply from the start (each was a real bug there)

1. **The verdict's live region is ALWAYS MOUNTED in the stage**: an `sr-only` `role="status"` keyed per trial, never in a side column that
   unmounts when a question opens; the visible verdict box is plain text.
2. **✓ / ✗ never inside a translated string**: render them `aria-hidden` in the component with a hidden word.
3. **A button that validates a trial uses `aria-disabled` + a guard** in its handler, never `disabled` (focus stays on it); after a
   right answer, focus moves to « التالي ».
4. **A re-shown verdict is derived from the trial at the current state**, not from `lab.last`; the same move twice is not a trial and
   re-announces its verdict.
5. **Label-in-name:** a control with visible text keeps that text at the START of its accessible name.
6. **A journal row says the right word for EVERY verdict kind** (a refusal is not « wrong »).
7. **Memoise the coach step on its id**; compute no page-only node (discovery options) in the player.
8. **« أستعدّ »'s `lesson:` target is the lesson that TEACHES the skill** (3AM lessons when the skill is 3AM's); the catalogue
   `prerequisiteLessonCodes` follow the net's `requires`.
9. **Tests assert data, not constants**: read numbers from the prompts and recompute.
10. **Role scan FIRST** (`content/forbidden.js` + `content/mission.test.js`, the lab's pure `shownValues`), before writing rounds; with
    the map open, memo-card BODIES and `knowledgeGraph.js` mistakes are scanned too (write the method in letters there).
11. **Layout:** a figure inside a paged step is ONE `data-paging-keep` block; a figure beside an exercise sits in a `flex` row marked
    `data-paging-keep`; `FitLine` for long formulas in a column (it no longer oscillates); units in a lab `lead` in Arabic (« 25 سم »,
    not « 25 cm ») or inside `$…$`.
12. **`roundsModel`:** `missesOf` counts a question once; an `easier` round may take `props` as a function of the main log and
    `releases: true`; a stuck student is never locked out of the pen steps nor of the 🏆.
13. **Typed module answers in their shape:** `NumericQuestion template={stepTemplate(...)}` with `kind: 'numeric'`; a guided step's
    `shape` / `unit` / `subject` / `factor` (`EXERCISE_CONTRACT.md` « Typed steps of a guided problem »).
14. **Work in long runs survives a cut-off:** keep a running log (`PROGRESS.md` in your scratch folder) of what is finished; a build agent
    can stop on the 5-hour limit or a network error — the next one resumes from the log.
15. **Committing:** a temporary `GIT_INDEX_FILE` (`git read-tree HEAD`, `git add` your paths, partial files as HEAD + your hunks via
    `git hash-object -w` + `git update-index --cacheinfo`), verify THAT tree in a clean worktree (symlink the `node_modules`; the
    catalogue export and the API drift check need `exportCurriculum.mjs` and a `vendor/` — run them in the main tree), then resync the
    real index for your paths only. Never write a file with `open(dst,'w')` before reading it when `src` and `dst` may be the same file.
