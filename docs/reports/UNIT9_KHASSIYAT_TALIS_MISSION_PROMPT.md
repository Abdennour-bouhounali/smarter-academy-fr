# Prompt — convert unit 9 « خاصية طالس » (4AM) to the mission prototype (written 2026-11-10)

> Paste everything below the line into a NEW Claude Code session at the repository root. It is self-contained. It is the unit-2
> prompt (`UNIT2_HISAB_JUDHUR_MISSION_PROMPT.md`) updated with everything unit 2 taught (commits `5a5c05d7` → `fda76ed9`): read §9
> « What unit 2 taught » as carefully as the recipe — every item there is a bug that was shipped once and caught in review.

---

You are converting **unit 9 « خاصية طالس » (4AM, ميدان الهندسة)** to the validated mission prototype. Treat it as one project,
lesson by lesson, with a commit after each lesson. Units 1 and 2 are the reference: every rule and pattern applied there is BINDING
here (owner, 2026-11-08). Do not wait for the owner's validation between lessons: finish all the lessons of the unit, then report.

## 0. Read first — do not skip

1. `CLAUDE.md` in full: owner rules, screens, book independence, respect of Islam, the KidFigure, no raster images.
2. `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md`: §4septies (the mission player), the « Rollout recipe », the `MissionHome` and
   `UnitMissionView` rows, §6ter (the lab prototype), and the geometry sections (GeoFigure data, figures analysed then reproduced or
   redesigned).
3. `docs/reports/MISSION_ROLLOUT_PROGRESS.md` in full — units 1 and 2, every trap, every review finding, every council verdict.
4. `docs/architecture/MANIPULATION_CONTRACT.md`: the « First » to « Twelfth example » (the player props of every converted lab),
   §8quater (the coach), « Screen pixels vs layer pixels ».
5. `docs/architecture/MANIPULATION_DNA.md` §17 and `docs/architecture/ARABIC_RTL_CONTRACT.md`.
6. The reference conversions, read as CODE (`git show`):
   - `8e45cc3c` `muadalat-x-murabba` — the lab treatment closest to a geometric line (`square-fold`): exact-only pins, bounce, a11y;
   - `00aeae29` `amaliyat-judhur` — per-round goals, every question in its goal, retry event, `starCriteria`, shared `LabCheckpoint`
     a11y, the forbidden-values scan (`shownValues`);
   - `972933a1` `tawzif-khawass-judhur` — two predictions per round, `judgedPredictions`, `PredictTray` focus, the scan extended to
     `knowledge.jsx`, `knowledgeGraph.js`, `content/textbook.js`, `content/exercises.js` (`_unit/missionStrings.test.js`);
   - `b78c8fc5` — long formulas in a side column go through `FitLine` (never wrapped, never clipped).
7. The Thales maths: `packages/core/arithmetic/thales.js` (imported by path, never from the core barrel), and the unit's brief and lock
   in `docs/sources/4am/unit9/`.

## 1. The unit

| # | Lesson id | Lab type today (module 1) | Climax (`lessonProblem.module`) |
|---|---|---|---|
| 1 | `talis-hisab-atwal` « خاصية طالس وحساب الأطوال » | `shadow-world` (`geometry/ShadowWorld.jsx`, `logic/shadowWorld.js`) | module 5 « عرض في ساحة الحيّ » |
| 2 | `aksiya-talis` « الخاصية العكسية لخاصية طالس وإثبات التوازي » | `parallel-level` (`geometry/ParallelLevel.jsx`, `logic/parallelLevel.js`) | module 5 « حامل الدهّانين على شكل X » |
| 3 | `inshaat-talis` « إنشاءات هندسية وتطبيقات خاصية طالس » | `segment-divider` (`geometry/SegmentDivider.jsx`, `logic/segmentDivider.js`) | module 4 « لافتة الدربي » |
| S | `wadiya-idmajiya-talis` (synthesis) | `cone-cylinder`, `shadow-world` | converted LAST — see §5 (owner, 2026-11-10) |

Folder: `apps/web/src/lessons/moyen/4am/handasa/khassiyat-talis/`. Order: catalogue order (lessons 45 → 47).

**State on 2026-11-10 (check it again):** none of the three labs has the player treatment (`useInMissionPlayer`, `onVerdict`,
`handDone`, `chains`, rounds) nor a lab-specific guide (`coachOf`); `ShadowWorld` already has a page `predict`. So EACH lesson treats
its own lab — no lesson is « content only ». `talis-hisab-atwal` has `prerequisiteLessonCodes: []` in
`packages/core/curriculum/dz/lessons_4am_2026_2027.json`: « راجع قبل أن تنطلق » would be empty (see §2).

## 2. Per lesson: the full recipe (each item is required)

**Config (`lesson.config.js`):** `studentView: 'mission'`; `knowledgeMapOpen: true`; a `mission` block —
- a NEW drawn scene in `lessons/common/mission/` registered in `MissionScene.jsx` (SVG in code; people only through `KidFigure`, girls
  always in hijab; no number drawn; give it an explicit `data-scene`; a variant prop rather than a new file when a later lesson can
  reuse it);
- `title`; `opening.text` (the « مسألة الدرس » as a question the student cannot solve yet); `opening.cta` « لا أعرف بعد… هيا نجمع
  الأدوات »;
- `tools` = knowledge ids of `knowledge.jsx` (labels never start with a Latin letter);
- `climaxModule` = the `lessonProblem.module` above;
- `checkpoints`: one per module before the climax, formative. They avoid the climax's numbers AND its method AND its fix (see §9.1).
  Their options are shuffled automatically (`checkpointOrder`) — write the right answer anywhere.

**Catalogue:** each lesson's `prerequisiteLessonCodes` must name the learning net's `requires` links (`LEARNING_NET.md`), so that
« راجع قبل أن تنطلق » and the review's « راجع » card are never empty. After changing the catalogue, run
`node packages/core/curriculum/exportCurriculum.mjs && (cd apps/api && php artisan smarter:import-curriculum)` and check the lesson's
prerequisites in the local database (owner rule: what you generate is also in the local DB).

**« أستعدّ » (`content/prep.js` + test):** 10 statements very easy → harder, the first three true, two كفاءات alternating, levels
non-decreasing, each `check` recomputed by the test, each كفاءة with `lesson:`; no climax number; the old items stay in `textbook.js`.

**Labs in rounds (`content/<theme>.js` + test), through `LabRounds` behind `PlayerSwitch`:**
- r1 by hand, small numbers, with the question chain; r2 the activity's numbers with predictions; a required round; ⭐ optional;
  free with `choices`; `easier` rounds really smaller (and a 3-refusal / 2-wrong-answer path into them);
- goals PER ROUND, met only by doing, and EVERY question a round asks is part of its goal (its checkpoint id) — otherwise the win card
  covers the open question (§9.3); the content test PLAYS every round to its goal and asserts ★★★ is reachable within `maxTrials`;
- module steps wait for their round (`needsRound`) and survive a reload (saved answers + stored stars, `useSavedAnswer().ready`).

**« ورقة زميل » (`content/peerSheet.js` + test):** the lesson's main misconception (for Thales: the wrong pairing of ratios, AM/AB vs
AM/MB, the reciprocal used without the same order of points, a non-proportional division…), an invented classmate whose name is not in
the climax, computed numbers, ONE error line, three fixes each with `why`, `fixedLines` for the lines that follow from the error. Its
fixes are shuffled automatically.

**Modules:** 0 uses the ladder; the lab module(s) use `PlayerSwitch` + `LabRounds`; the peer sheet is the last step of module 2 (or of
the module without a lab); the teacher page and Classroom Mode stay unchanged; every student-visible textbook reference goes (page and
exercise numbers, « الكتاب », « تمرين N: », « خطأ مطبعي في نص الكتاب ») — in modules, config, `knowledge.jsx`, `knowledgeGraph.js`,
`content/textbook.js`, `content/exercises.js`.

**Run `npm run generate:lesson-index` from the repo root.**

## 3. Per lab: the v2 treatment + the guide (each lesson does its own lab, in shared code)

Model on `roots/SquareFold.jsx` and `roots/SquareTiling.jsx` (read their « LECTEUR DE MISSION » header comments). All of it gated by
`useInMissionPlayer()`; page/teacher mode unchanged.

- **Props:** `onVerdict({ groups, exact, free? })`, `levels={false}`, `handDone`, `chains`, `predict` (+ `predictAlso` if a second
  prediction), `choices`, `onTrial` events (`{tk:'reset'}`, `{tk:'retry'}`).
- **`CHAINS_PLAYER`:** observe with one tap (`fill`, chips) → BUILD the equality (the Thales ratios: `slots`/`tiles` with ONE decoy —
  the classic wrong ratio) → the rule. The question names the object; the figure shows it while the question is open.
- **Journal « 📋 جدول تجاربك »** in `sidePanel`, `aria-labelledby` its heading, header cells with `scope`.
- **Player behaviour:** controls frozen during a prediction or a question; `guided`; no celebration when the stepper is hidden;
  `hideRepresentation`; `onIntroChange`; `allowFreeLab={false}`.
- **`LabCoach`:** a pure `coachOf` in the logic file, `[data-*]` anchors, zoom-safe (divide `getBoundingClientRect` by
  `rect.width / el.offsetWidth`), never points at the answer (a stuck student gets the `easier` round, not a hint).
- **Strings** in `i18n/locales/ar/lesson.manipulation.json` (2-space formatting; never re-indent), and a `<lab>Player.test.jsx`: each
  question tells the SAME truth as the logic, no raw key / `{{` on screen, answer positions vary.
- **Geometry specifics:** lengths and ratios are exact (rationals from `thales.js`, never a float compared with `===`); a dragged point
  snaps to the figure's grid; a figure drawn left-to-right keeps its controls in the same order (`dir="ltr"` on the control group);
  every length or ratio in Arabic text is in `MathText` or `<bdi dir="ltr">`; a refused configuration has a non-colour cue (dash, ✗,
  text).

## 4. Unit-level work (after the three lessons)

**Unit page:** add unit 9 to `apps/web/src/pages/unit/unitMissions.js` — station icons (the scenes' objects) and short labels for the
three lessons + the synthesis (🧩 « أدمج تعلّماتي »), the unit challenge REWRITTEN in the platform's words (`lead`, `full`,
`question`, `numbers`, `solvedAfter`), no answer and no lesson climax number in it, 3 keys (`after` = lesson id; check what
`unitMissions.test.js` expects for a 3-lesson unit and adapt the test, not the rule), the history note (a mathematician of the Islamic
world if there is an honest one; never a religious symbol). `unitMissions.test.js` green;
`node apps/web/e2e/unit-mission-view.mjs` (it already loops over every unit) green at every size; look at unit 9's screenshots. Separate
commit `feat(unit): unit 9 « خاصية طالس » on the one-screen unit page`.

## 5. The synthesis — converted too, LAST (owner rule, 2026-11-10)

> Superseded the same day: this section said « do NOT convert ». The owner then decided: **« the synthesis must be built too, start with this
> unit »**. Unit 9's `wadiya-idmajiya-talis` is therefore the PILOT of the synthesis recipe (not unit 1, as the synthesis council had proposed).

Convert `wadiya-idmajiya-talis` after the three lessons, on the synthesis council's verdict of 2026-11-10; the owner did not answer its seven
questions one by one, so the chairman's recommended answers are the working defaults (listed for the owner in the final report):
the existing engine in the player (no synthesis-specific player, never Classroom Mode); no tool earned (the unit's keys are owned from the first
screen, each training lights the keys it USES — `tools[].usedIn`); no checkpoints; « أستعدّ » = the 10-statement ladder built from the unit's
lessons (old items stay reachable); the map open; M7 « أخطّط » its own station right before the 🏆 on M8 (`climaxModule: 8`); the opening button
« أجرّب » (no « لا أعرف بعد »); one local ★ per training finished without opening « الحل » (never evidence, mastery, reports or « بوصلتي »); a
peer sheet at the end of M7 = a classmate's wrong PLAN, never the solution; the honest duration, in two sittings; every typed step entered in
its own shape (answer templates). The recipe that results is written in `MISSION_ROLLOUT_PROGRESS.md` and the guide for the other units.

> **Built 2026-11-10 — read the result, not the defaults above, where they differ.** Two more councils changed three defaults: NO training ★
> (a step is one try; the home shows « وضعيات تدريبية: n / 6 » and hides « ⭐ 0 »); module 7 is « وضعية الوحدة » (it computes — not « أخطّط ») and
> module 8 « التحدّي 🏆 » (`mission.stationLabels`); module 7's labs are brought INTO the player as rounds (the student never sees the old view),
> with the `cone-cylinder` player version, a meet-only minaret round, a notebook screen and a peer sheet whose error is a missing justification.
> What was built and the provisional recipe: `MISSION_ROLLOUT_PROGRESS.md` › « Unit 9, synthesis » and « The synthesis recipe ».

## 6. Councils — in THIS session, never inside a sub-agent

Sub-agents cannot spawn agents: a « council » run inside one is one model playing five advisors (that happened for unit 2's lessons 1–2).
So: for each lab, have the design done first (read the lab and the lesson, list the decisions the owner has not taken as ONE council
question with options and trade-offs, then STOP); run the `llm-council` skill from the main session (five advisors in parallel, five
anonymous peer reviews, a chairman — give the chairman a VERIFIED table of the arithmetic); report the verdict; then implement. A
council is due for: each lab's question chain, its goals, its predictions, the rounds and their numbers, the checkpoints, the scene —
and any later design gap (unit 2's lesson 5 needed a second council when the first one's cards rehearsed the climax).

## 7. Verification — every lesson, before its commit

**Tests:** `cd apps/web && npx vitest run src/lessons` green; `npm run check:lessons` (REPO ROOT — the web workspace has no such script)
exit 0, entry ≤ 245 KB; `node apps/web/scripts/lab-rollout-status.mjs --lesson <id>` ✅ (and the previously converted lessons still ✅).

**Playwright walk**, scripts in the scratchpad with `createRequire('<repo>/apps/web/package.json')`, a mocked student (`nameComplete:
true`, `firstName`, `lastName`, seed `u_9001_tours.pending`), at 1366×768, 1024×768 and 1920×1080:
- every round by hand to ★★★; predictions (both orders of moves: the judged move can be the discovery move); retry after a wrong
  answer; « إعادة »; the easier round and back (press « أواصل هنا » when the « جرّب أصغر » card covers « التالي » at 1024); a reload
  mid-module; the free round;
- home (first visit and return), « أستعدّ » (10 + review with a non-empty « راجع »), the peer sheet (fix, then restored after reload),
  the final test, the knowledge map;
- every module unit by unit: 0 `[data-fit-overflow]`, 0 page scroll, 0 console error (the walk's own blocked Google Fonts requests log
  `ERR_FAILED` — not a lesson bug);
- a probe that measures every `.katex` against its column (clipping is invisible to `data-fit-overflow`);
- the teacher view unchanged.

**Look at the screenshots yourself** — wrapped buttons, clipped or mirrored formulas, a coach ring off target, raw `$`, a figure whose
labels collide.

**Review:** for each lesson run `ecc:react-reviewer`, `ecc:code-reviewer` and `ecc:a11y-architect` in parallel on the diff (give each
the exact file list — other sessions' files are modified too). Verify every finding in the code before fixing; fix what is real; list
what you rejected and why. Final check (`ecc:verification-loop` or `ecc:quality-gate`): full suite, `check:lessons`, the unit e2e, the
teacher view.

## 8. Documentation and commits

- `MISSION_ROLLOUT_PROGRESS.md`: a unit-9 table, a section per lesson (What was written / added to shared code / council verdict / review
  / traps / verification / open), the lab-families table; `MANIPULATION_CONTRACT.md`: « Thirteenth », « Fourteenth », « Fifteenth
  example »; `LESSON_DEVELOPMENT_GUIDE.md`: any new reusable pattern (a geometry goal, a ratio-build question…); `LEARNING_NET.md` if
  prerequisites change; `CLAUDE.md`: the converted-lessons sentence and the unit-page sentence.
- One commit per lesson `feat(lessons): <id> — mission prototype`, one for the unit page; each ends with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Do not push.
- Commit ONLY your hunks: other sessions have uncommitted work (in `CLAUDE.md`, i18n files, docs, the « بوصلتي » files, staged home-file
  deletions). Build a temporary `GIT_INDEX_FILE` from `git show HEAD:<file>` + your change for shared files; never `git add -A`; never
  revert or stage another session's work; afterwards resync the real index for your paths only.
- Final report: per lesson what changed, what was verified, the review findings fixed / rejected, the council verdicts; what needs the
  owner's decision.

## 9. What unit 2 taught — apply from the start

1. **Forbidden values by ROLE, scanned mechanically.** List the climax's signature (its numbers, its answer, its distractors, its method,
   the classmate's errors). A number is forbidden in the role it plays in the climax (« every value shown » cannot hold: a ruler or a
   grid shows many numbers). Write a content test that lists EVERYTHING each round's screen can show (a pure `shownValues` in the logic:
   lengths, ratios, chips, decoys, refusal texts, prediction prompts) and asserts it never meets the forbidden set; run it before writing
   rounds; extend `_unit/missionStrings.test.js` (create it for unit 9, modelled on unit 2's) to scan the checkpoints, opening,
   `knowledge.jsx`, `knowledgeGraph.js` (open from the start!), `content/textbook.js`, `content/exercises.js` against each lesson's own
   signature, plus control characters and « الكتاب / تمرين N: / خطأ مطبعي ». Typed free-mode values are the student's own — not scanned,
   but no preset chip offers a climax value. Never reuse another lesson's climax answer as a checkpoint.
2. **Predictions:** at most 2 per round; their right answers DIFFER within the round; the right option's POSITION varies across rounds;
   say what the student must look at (« بلاطة تصلح »-style precision); each judged result is shown AND heard exactly once
   (`judgedPredictions`; hold the round's question ~1,6 s); one `PredictTray` per prediction (`key`), numbered « 1 من 2 », focus moves to
   its question and back to the handle after the last; a prediction is asked once per round (« إعادة » asks again, « أعِد التجربة »
   keeps it).
3. **Rounds and stars:** every question in the round's goal; the round log follows the lab (`{tk:'reset'}`, `{tk:'retry'}` removes what
   the lab undid); `starCriteria` is the one source for the stars AND the win card; the same answer twice is not a trial; a meaningless
   move (k = 1 there) is not a trial; the first refusal can be free when refusing is part of the discovery.
4. **Accessibility baseline** (it was re-found in every lesson): focus rings `ring-indigo-600 ring-offset-2`; white text only on `-700`
   colours; an ALWAYS-mounted `role="status"` keyed on the attempt, with a hidden « صحيح. / خطأ. »; ✓/✗ glyphs `aria-hidden` with a
   hidden word; `aria-pressed` groups labelled; label-in-name for controls with visible text; `aria-disabled` on a frozen handle;
   numbers and negatives in `<bdi dir="ltr">`; decorative SVG `aria-hidden`, labelled when informative; table headers with `scope`.
5. **Text traps:** `{{ns}}` is reserved by i18next (use another name); one formula per Arabic sentence (two reorder); no `$` in a
   `PredictTray` prompt; `\times` in a single-quoted JS string is a TAB — write `\\times`; « أبسط كتابة » contains « كتاب » (the
   no-textbook test will flag it — say « صيغة »); Arabic number agreement (« 2 أرقام » is wrong — rephrase with « عدد … : n »); heredocs
   holding Arabic are refused by the shell — write files with the file tool; a content file imports siblings WITH the extension.
6. **Layout traps:** long formulas in a side column go through `FitLine` (never wrapped, never clipped); a √ sign must not catch a tap
   meant for the answer above (`pointer-events-none` on answer content); long batches use `rowCols="auto"` in the player.
7. **Shared fixes stay shared:** when a review finds a bug in shared code (`LabRounds`, `roundsModel`, `LabCheckpoint`, `PredictTray`,
   `PeerSheet`, `MissionCheckpoint`, `questions.jsx`), fix it once there, add a test, and check the earlier lessons still pass.

**Known open items you do NOT need to fix here** (they are listed for the owner): unit 1's labs do not send `{tk:'reset'}`; disabled
buttons drop keyboard focus in every lab; the « جرّب أصغر » button is white on amber-500 and its card covers « التالي » at 1024; the
free round's tab says « الملعب الحرّ »; another lab's string still uses `{{ns}}`; the unit page's lesson window shows catalogue
objectives with plain-text formulas. If your lesson makes one of them worse, fix it.
