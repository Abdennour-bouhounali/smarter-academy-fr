# Prompt — convert unit 5 « جمل معادلتين من الدرجة الأولى بمجهولين » (4AM) to the mission prototype (written 2026-11-11)

> Paste everything below the line into a NEW Claude Code session at the repository root, or give it to a build agent. It is the unit-4
> prompt (`UNIT4_MUADALAT_MUTARAJIHAT_MISSION_PROMPT.md`) with unit 5's facts and a new §12 « What unit 4 taught » (commits `89f93846` →
> `8834c15b`). Sections §2, §3 and §6–§9 of the unit-9 prompt (`UNIT9_KHASSIYAT_TALIS_MISSION_PROMPT.md`), §10 of the unit-3 prompt and
> §11 of the unit-4 prompt apply here UNCHANGED and are not repeated: read them there, then read §12 below as carefully — every item in it
> is a bug that was shipped once and caught in review, or a way of working that unit 4 proved.

---

You are converting **unit 5 « جمل معادلتين من الدرجة الأولى بمجهولين » (4AM, ميدان أنساب الأعداد والحساب)** to the validated mission
prototype. It is the LAST unit of its ميدان: once it is done, units 1–5 are all on the one-screen unit page. Treat it as one project,
lesson by lesson, with a commit after each lesson. Units 1, 2, 9, 3 and 4 are the reference: every rule and pattern applied there is
BINDING here (owner, 2026-11-08). Do not wait for the owner's validation between lessons.

## 0. Read first — do not skip

1. `CLAUDE.md` in full.
2. `docs/reports/UNIT9_KHASSIYAT_TALIS_MISSION_PROMPT.md` §0–§9, `docs/reports/UNIT3_HISAB_HARFI_MISSION_PROMPT.md` §10 and
   `docs/reports/UNIT4_MUADALAT_MUTARAJIHAT_MISSION_PROMPT.md` §11.
3. `docs/reports/MISSION_ROLLOUT_PROGRESS.md` — above all « Unit 4 « معادلات ومتراجحات » — the table » (how the unit was run in parallel),
   the four « Unit 4, lesson n » sections and « Unit 4 — what the integration verified »: their traps and review findings.
4. `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` §4septies (with « NO BACK-AND-FORTH ») and the « Rollout recipe »;
   `docs/architecture/MANIPULATION_CONTRACT.md` « First » to « Twenty-second example », §8quater; `MANIPULATION_DNA.md` §17;
   `ARABIC_RTL_CONTRACT.md`; `EXERCISE_CONTRACT.md` § « قوالب الإجابة » and « Typed steps of a guided problem ».
5. The unit-4 conversions read as CODE (`git show`): `89f93846` (commit 0, the scaffolding that let four builders run in parallel),
   `3c88b84f` `muadala-ula` (a PLAYER VERSION of a lab chosen inside the lab file; module-level player detection), `d61ac23a`
   `jidaa-maadum`, `55414abe` (`BuildAnswer` plain-text tile), `326e8b59` + `cdb35d73` `mutarajiha-ula` (a masked verdict while dragging;
   the integration's no-back-and-forth fixes), `e6483764` `tarrid-mushkila` and `13b92307` (`roundsModel` `tk:'model'` — the model-check
   event, the closest pattern to this unit's « from the story to the system »), `8834c15b` (the unit page entry).
6. The algebra: `packages/core/arithmetic/linearSystem.js` (+ test), `linear.js`, `equation2.js` (imported by path, never from the core
   barrel); the unit's extraction `docs/sources/4am/unit5/extraction.json`.

## 1. The unit

| # | Lesson id | Lab today (module 1) | Climax (`lessonProblem.module`) |
|---|---|---|---|
| 1 | `mafhum-jumla` « مفهوم جملة معادلتين من الدرجة الأولى بمجهولين » | `pair-scoreboard` (`systems/PairScoreboard.jsx`, `logic/pairScoreboard.js`) | module 4 « مصلحة الحالة المدنية: 42 عاملًا وشرطان » |
| 2 | `hall-jabri` « حل جملة معادلتين … جبرياً (طريقتا التعويض والجمع) » | `elimination-cards` (`systems/EliminationCards.jsx`, `logic/eliminationCards.js`) | module 4 « كشك الحي: بطاقتا الأسعار الجديدة » |
| 3 | `mushkilat-jumla` « حل مشكلات بتوظيف جمل معادلتين … » | `story-modeller` (`systems/StoryModeller.jsx`, `logic/storyModeller.js`) | module 4 « متحف الولاية: 180 زائرًا و 33000 دج » |
| S | `wadiya-idmajiya-jumal` (synthesis) | `story-modeller` (module 7) | LAST, and only once the owner has answered the synthesis-recipe question (§5) |

Folder: `apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/jumal-muadalatayn/`. Order: catalogue order (lessons 24 → 26).

**State on 2026-11-11 (check it again):** none of the three labs has the player treatment (no `useInMissionPlayer`, `onVerdict`,
`chains`, `coachOf`, rounds) — EACH lesson treats its own lab, in shared code, page / teacher mode unchanged. All three already have a
`logic/<lab>.test.js` and a render test: keep them untouched and add `logic/<lab>Player.js` + test for the player logic.
`story-modeller` is also the synthesis's lab (module 7, two resources): lesson 3's treatment must leave the synthesis page untouched
(`wadiya-idmajiya-jumal/lab.render.test.jsx` still green). `_unit/` has no `forbiddenShared.js`, no `signatures/` and no
`missionStrings.test.js` yet: commit 0 creates them (§12.1). Catalogue prerequisites today: `mafhum-jumla` → `muadala-ula`;
`hall-jabri` → `mafhum-jumla`, `nashr-tabsit`, `muadala-ula`; `mushkilat-jumla` → `hall-jabri`, `tarrid-mushkila`. Compare them with the
net's `requires` (`LEARNING_NET.md`, items `4am.m5.r01` / `4am.m5.r02`) and add the earlier-year lesson that teaches a skill when the net
names one (substituting a value in an expression with two letters, solving a first-degree equation), then export, import and check the
local DB.

## 2–3. The per-lesson recipe and the per-lab treatment

Unit-9 prompt §2 and §3, unchanged, with these system specifics instead of its « Geometry specifics »:
- **Exact arithmetic only:** solutions are rationals (`hall-jabri` has decimal coefficients, 4,2 — never a float compared with `===`); a
  solution is an ORDERED pair `(x ; y)` compared as data; « no solution » and « infinitely many » are data too, never a missing value.
- **The BUILD question** writes the lesson's object with tiles and ONE decoy, the classic error of the lesson — lesson 1: the pair written
  in the wrong order `(y ; x)`, or a pair that satisfies ONE equation only called « a solution of the system »; lesson 2: a substitution
  without brackets (`3(10 − y)` written `3 × 10 − y`), only ONE side multiplied before adding, a sign lost when subtracting the two
  equations; lesson 3: the unknowns not named (or named « x = الكبار » without a unit), an equation that translates the wrong sentence, a
  solution kept although the story refuses it (a negative or fractional number of people). Pick ONE per build.
- **The discovery comes from the student's own trials:** lesson 1 — one equation alone has MANY pairs (the student finds several), only
  the pair on both boards solves the system; lesson 2 — after two systems, « make one unknown disappear » is the rule, and choosing the
  method is asked only after the student has done both on the same cards; lesson 3 — the story is checked with the student's own pair
  (the « تسجيل مستحيل » case is met, not told).
- **Signs, letters and pairs in Arabic text:** every term is in `MathText` / `$…$`; a system is ONE KaTeX island (`\begin{cases} … \end{cases}`,
  never two lines of Arabic); a pair `(x ; y)` is inside ONE `$…$` island and reads left-to-right (test what the DOM shows — the semicolon
  and the brackets mirror otherwise); « x » and « y » are never bare Latin letters in an Arabic sentence; a minus never starts an Arabic
  line outside a formula; prices in « دج », never « DA ».
- **Respect of Islam and of the family:** money contexts never mention interest or credit; a kiosk sells sweets and drinks only; age
  contexts keep a father and his children; no lottery, no betting on a match.
- **Scenes:** the three contexts differ (an office of workers — or the platform's own replacement of it —, a neighbourhood kiosk's price
  cards, a museum's ticket desk). Build one thin scene per lesson; share a kit only where two scenes really share drawn objects (price
  cards / tickets may); people only through `KidFigure`.

## 4. Unit-level work (after the three lessons)

Unit-9 prompt §4 with unit 5: add unit 5 to `apps/web/src/pages/unit/unitMissions.js` (3 keys; the challenge = the unit's تحدّ — the
class's coins, 37 pieces and 610 دج — REWRITTEN by the platform with new numbers and context, no climax number and no lesson signature in
it, a test that checks it; an honest history note — Abū Kāmil « الحاسب المصري » and his problems with several unknowns, verify the facts
and the dates before writing them; no religious symbol), `unitMissions.test.js` green, `node apps/web/e2e/unit-mission-view.mjs` green at
every size, screenshots looked at. Separate commit `feat(unit): unit 5 « جمل معادلتين » on the one-screen unit page`. The unit page
entry does NOT wait for the synthesis. With it, the five units of « ميدان أنساب الأعداد والحساب » are all on the unit page — check the
ميدان view at every size.

## 5. The synthesis

Owner rule (2026-11-10): every unit's synthesis is converted after its lessons. The recipe is PROVISIONAL until one real student has been
timed on unit 9's pilot (`MISSION_ROLLOUT_PROGRESS.md` « The synthesis recipe »). **If the owner has not said to copy it, stop after the
unit page and report** — do not convert `wadiya-idmajiya-jumal` (units 1–4's syntheses wait for the same answer).

## 6–11. Councils, verification, documentation, what units 2, 9 and 3 taught

Unit-9 prompt §6–§9, unit-3 prompt §10 and unit-4 prompt §11, unchanged. ONE council for the unit's three labs, run from the main session
after the three designs are written. Docs: a unit-5 table and a section per lesson in `MISSION_ROLLOUT_PROGRESS.md`, the lab-families
rows, `MANIPULATION_CONTRACT.md` « Twenty-third » (pair-scoreboard), « Twenty-fourth » (elimination-cards) and « Twenty-fifth example »
(story-modeller), the guide for any new reusable pattern, `LEARNING_NET.md` if prerequisites change, `CLAUDE.md` (the converted-lessons
sentence and the unit-page sentence).

## 12. What unit 4 taught — apply from the start

1. **Run the unit in parallel, on a commit 0.** After the council, the integrator commits `chore(lessons): unit 5 mission scaffolding`:
   the three scene stubs registered in `MissionScene.jsx`, empty `player` / `coach` / `predict` keys per lab in
   `lesson.manipulation.json`, `_unit/forbiddenShared.js`, `_unit/signatures/README.md` and the `_unit/missionStrings.test.js` skeleton
   reading `_unit/signatures/<lesson>.js` (copy unit 4's), plus this prompt. Then ONE builder per lesson, one worktree each, all from
   commit 0; merged in catalogue order on `integrate-unit5`, the conflicts only in the files commit 0 prepared. The council also casts
   the unit's classmates' names (enforced across units by `missionStrings.test.js`; none used by units 1–4).
2. **Module-level player detection:** a module decides « in the player? » with `useModulePlayer(MODULE_CTX)` (or the lesson's
   `moduleContext.js › useStudentPlayer()`), never only inside the lab. A player-only step that does not show is invisible to every test
   — the integration of unit 4 found three LONE screens and one OVER that the builders never saw.
3. **`no-back-and-forth` on EVERY module**, not only the first: seeded progress does not unlock later modules, so walk them with
   `sequentialUnlock` set to false TEMPORARILY (never committed). LONE 0 · OVER 0 at 1366, 1024 and 1920, every screen at zoom ≥ 0.9.
4. **A worked example shares its screen with its figure AND a question on it** (« هل … حلّ لـ … ؟ »): a reminder card is kept whole on one
   screen; three answer figures side by side, never stacked.
5. **A bubble that covers the next control is DROPPED**, not moved by a few pixels: the side-column verdict states the fact.
6. **A drop of several objects is ONE move:** if one step of it is refused, the whole drop is refused; a quantity applied n times is a UI
   loop over the existing gesture, and anything computed per group uses the NEW count.
7. **With the teacher's checkpoints off, the lab must still formalise:** in the player the chains ARE the round's goals.
8. **Fast drags skip ticks:** a slider or a ruler must visit every value between two pointer events (a zero or a solution can pass under
   the finger unseen).
9. **A solution set with « أو » / a pair is ONE `$…$` island;** connectors that are words use the `BuildAnswer` text tile
   (`{ text: 'أو' }`), never a bare letter tile.
10. **At 1024 × 768 a rule question has three options at most;** a fourth that does not fit is dropped, not shrunk.
11. **A wrong BUILD is a question miss** (it can open « جرّب أصغر »), not a counted trial; a translation of a story into equations is a
    MODEL check — use `roundsModel`'s `tk:'model'` event and the goal `{ modelOk: true }` (`13b92307`) rather than inventing another.
12. **Book-independence reaches the TEST:** the final test's textbook items are rewritten on platform numbers (ids, skills and LPs kept);
    every QCM is checked for TWO true options (unit 4 shipped two); resource codes stay with new titles; `levels.js` page presets keep
    the book numbers (the shared `levels.test` requires advanced = textbook) — the page modules pass platform numbers explicitly.
13. **No new saved-answer key for round state:** the cover, the model checks and the round progress are re-derived from the stars log.
14. **i18n hook scope:** a component that reads two namespaces names its second `t` (`tx`), and the test renders the REAL strings.
15. **A browser walk that cannot drag is not a walk:** unit 4's growth-race walk stuck after the first drag. Write the walk's drag helper
    (pointer events on the element's centre, zoom-corrected) before the lesson, and play every required round to ★★★ in the browser —
    the logic test playing rounds is necessary, not enough.
16. **The unit page:** a unit of three lessons hands three keys (one may hand two if a lesson teaches two — read what
    `unitMissions.test.js` says); the challenge test also checks every lesson signature in `_unit/signatures/*.js`.
