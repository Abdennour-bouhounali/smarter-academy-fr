# Prompt — convert unit 4 « معادلات ومتراجحات من الدرجة الأولى بمجهول واحد » (4AM) to the mission prototype (written 2026-11-11)

> Paste everything below the line into a NEW Claude Code session at the repository root, or give it to a build agent. It is the unit-3
> prompt (`UNIT3_HISAB_HARFI_MISSION_PROMPT.md`) with unit 4's facts and a new §11 « What unit 3 taught » (commits `e0045aad` →
> `0980cb62`). Sections §2, §3 and §6–§9 of the unit-9 prompt (`UNIT9_KHASSIYAT_TALIS_MISSION_PROMPT.md`) and §10 of the unit-3 prompt
> apply here UNCHANGED and are not repeated: read them there, then read §11 below as carefully — every item in it is a bug that was
> shipped once and caught in review, or an owner rule taken since.

---

You are converting **unit 4 « معادلات ومتراجحات من الدرجة الأولى بمجهول واحد » (4AM, ميدان أنساب الأعداد والحساب)** to the validated
mission prototype. Treat it as one project, lesson by lesson, with a commit after each lesson. Units 1, 2, 9 and 3 are the reference:
every rule and pattern applied there is BINDING here (owner, 2026-11-08). Do not wait for the owner's validation between lessons.

## 0. Read first — do not skip

1. `CLAUDE.md` in full.
2. `docs/reports/UNIT9_KHASSIYAT_TALIS_MISSION_PROMPT.md` §0–§9 (the recipe, the per-lab treatment, councils, verification, docs and
   commits, what unit 2 taught) and `docs/reports/UNIT3_HISAB_HARFI_MISSION_PROMPT.md` §10 (what unit 9 taught).
3. `docs/reports/MISSION_ROLLOUT_PROGRESS.md` — above all the unit-3 sections (« Unit 3, lesson 1/2/3 ») and « Cross-lesson fix — a
   figure and its question on ONE screen »: their traps and review findings.
4. `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` §4septies (with « NO BACK-AND-FORTH ») and the « Rollout recipe »;
   `docs/architecture/MANIPULATION_CONTRACT.md` « First » to « Eighteenth example », §8quater; `MANIPULATION_DNA.md` §17;
   `ARABIC_RTL_CONTRACT.md`; `EXERCISE_CONTRACT.md` § « قوالب الإجابة » and « Typed steps of a guided problem ».
5. The unit-3 conversions read as CODE (`git show`): `e0045aad` `nashr-tabsit` (a lab's FIRST coach, player only; `shownValues` and the
   role scan; the collision-free ruler), `bc156126` `tahlil-ibara` (a trial = a NEW move; `LabCheckpoint` build `wrap`), `b92e26f6`
   `mutatabiqat-shahira` (a second lesson on a lab already treated, the first lesson's tests untouched), and the no-back-and-forth
   commits `2981dd69`, `0980cb62`.
6. The algebra: `packages/core/arithmetic/` (the unit's equation / inequality helpers, `polynomials.js`; imported by path, never from the
   core barrel); the unit's extraction `docs/sources/4am/unit4/`.

## 1. The unit

| # | Lesson id | Lab today | Climax (`lessonProblem.module`) |
|---|---|---|---|
| 1 | `muadala-ula` « حل معادلة من الدرجة الأولى بمجهول واحد » | `equation-balance` (`equations/EquationBalance.jsx`; modules 1 and 2) | module 5 « ميزان غرفة الملابس: أكياس في الكفّتين » |
| 2 | `jidaa-maadum` « معادلات جداء معدوم » | `vanishing-pitch` (`equations/VanishingPitch.jsx`, `logic/vanishingPitch.js`; modules 1, 2 and 3) | module 5 « ملعب التدريب: ضلعان يتغيّران معًا » |
| 3 | `mutarajiha-ula` « المتراجحات من الدرجة الأولى بمجهول واحد وتمثيل حلولها بيانيًا » | `solution-ray` (`equations/SolutionRay.jsx`; modules 1 and 2) | module 6 « رصيد رياض » |
| 4 | `tarrid-mushkila` « ترييض مشكلة » | `growth-race` (`equations/GrowthRace.jsx`, `logic/growthRace.js`; modules 1 and 2) | module 4 « عائلة مراد » |
| S | `wadiya-idmajiya-muadalat` (synthesis) | `growth-race` (module 7) | LAST, and only once the owner has answered the synthesis-recipe question (§5) |

Folder: `apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/muadalat-mutarajihat/`. Order: catalogue order.

**State on 2026-11-11 (check it again):** none of the four labs has the player treatment (no `useInMissionPlayer`, `onVerdict`,
`chains`, `coachOf`, rounds) — EACH lesson treats its own lab, in shared code, page / teacher mode unchanged. `equation-balance` and
`solution-ray` have no logic file with a unit test of their own (render tests only): add `logic/<lab>.test.js` with the player logic.
`growth-race` is also the synthesis's lab: lesson 4's treatment must leave the synthesis page untouched (its render test still green).
The four lessons already have `prerequisiteLessonCodes` (`muadala-ula` → `nashr-tabsit`; the others chain inside the unit): compare them
with the net's `requires` (`LEARNING_NET.md`) and add the 3AM lesson that teaches the skill when the net names one (`muadala-ula`'s
programme item is `3am.m5.r06`), then export, import and check the local DB.

## 2–3. The per-lesson recipe and the per-lab treatment

Unit-9 prompt §2 and §3, unchanged, with these equation specifics instead of its « Geometry specifics »:
- **Exact arithmetic only:** solutions are rationals (never a float compared with `===`); a solution set is data (`[]`, one value, two
  values, a ray with its bound and its `strict` flag), compared as data.
- **The BUILD question** writes the lesson's object with tiles and ONE decoy, the classic error of the lesson — lesson 1: the same
  operation on ONE side only, or a term crossing the « = » without changing its sign; lesson 2: « a product is zero when BOTH factors
  are zero » / a lost solution / dividing by the factor that holds x; lesson 3: the inequality's direction kept when dividing by a
  negative, an open bound drawn closed; lesson 4: the unknown not named, an equation that translates the wrong sentence, a solution
  kept although the situation refuses it. Pick ONE per build.
- **The rule is the discovery:** it is asked only after two DIFFERENT cases (two equations, two signs of the divisor, two situations).
- **Signs and letters in Arabic text:** every term is in `MathText` / `$…$`; a minus never starts an Arabic line outside a formula; « x »
  is never a bare Latin letter in an Arabic sentence; an inequality reads left-to-right inside ONE `$…$` island (« < » and « > » mirror
  the meaning when the line is reordered — test what the DOM shows); a graduated line is drawn left-to-right (`dir="ltr"`) with its
  controls in the same order.
- **Respect of Islam and of the family:** the age contexts keep a father and his children; money contexts never mention interest; a
  balance is a kitchen / sports-store scale, never a symbol of anything else.
- **Scenes:** the unit's four contexts differ (a changing-room balance, a training pitch, a phone credit, a family's ages). Reuse
  `pitchSceneKit.jsx` for the pitch; build one thin scene per lesson; share a kit only where two scenes really share drawn objects;
  people only through `KidFigure`.

## 4. Unit-level work (after the four lessons)

Unit-9 prompt §4 with unit 4: add unit 4 to `apps/web/src/pages/unit/unitMissions.js` (keys for a 4-lesson unit — read what
`unitMissions.test.js` expects and adapt the test, not the rule; the challenge rewritten in the platform's words, no climax number; an
honest history note — al-Khwārizmī and « الجبر والمقابلة » — with no religious symbol), `unitMissions.test.js` green,
`node apps/web/e2e/unit-mission-view.mjs` green at every size, screenshots looked at. Separate commit
`feat(unit): unit 4 « المعادلات والمتراجحات » on the one-screen unit page`. The unit page entry does NOT wait for the synthesis.

## 5. The synthesis

Owner rule (2026-11-10): every unit's synthesis is converted after its lessons. The recipe is PROVISIONAL until one real student has been
timed on unit 9's pilot (`MISSION_ROLLOUT_PROGRESS.md` « The synthesis recipe »). **If the owner has not said to copy it, stop after the
unit page and report** — do not convert `wadiya-idmajiya-muadalat` (unit 3's `wadiya-idmajiya-harfi` waits for the same answer).

## 6–10. Councils, verification, documentation, what units 2 and 9 taught

Unit-9 prompt §6–§9 and unit-3 prompt §10, unchanged. ONE council for the unit's four labs, run from the main session after the four
designs are written. Docs: a unit-4 table and a section per lesson in `MISSION_ROLLOUT_PROGRESS.md`, the lab-families rows,
`MANIPULATION_CONTRACT.md` « Nineteenth » (equation-balance), « Twentieth » (vanishing-pitch), « Twenty-first » (solution-ray) and
« Twenty-second example » (growth-race), the guide for any new reusable pattern, `LEARNING_NET.md` if prerequisites change, `CLAUDE.md`
(the converted-lessons sentence and the unit-page sentence).

## 11. What unit 3 taught, and the owner rules taken since — apply from the start

1. **NO BACK-AND-FORTH (owner, 2026-11-11, BINDING):** what a question asks the student to look at — the figure, the table, the
   statement's numbers, the student's earlier result — is on the question's screen. A figure and the question after it share one screen
   (`ClassroomPaged › pairFigures`, `data-paging-pair`); a multi-part problem repeats its statement on each part's screen; « السؤال
   السابق نفسه » is restated. Run `node apps/web/e2e/no-back-and-forth.mjs` on every lesson (LONE 0, OVER 0) and walk it answering.
2. **The student never sees the old view:** every lab the student reaches in a converted lesson — modules 2 and 3 too — is played in the
   player as rounds; no link leads to the old page.
3. **Typed answers in their own shape** (owner, 2026-11-09): `templateFor()` + `TemplateInput`, « x = [ ] », a real fraction bar,
   printed units; **a formula never breaks across two lines** (widen the card, `FitLine` in a column).
4. **A trial is a NEW move:** the same value, the same split or a neutral move (× 1, + 0) is not a trial and never opens « جرّب أصغر »;
   a snap never flickers under a resting finger (at a tie keep the shown value).
5. **Collisions make a BUILD a guess:** when two different objects on screen would show the same number for some value of the
   variable, skip that value (a sweep in the content test over every reachable value).
6. **The role scan covers EVERYTHING before the climax**, free choices and practice rounds included (a free field leaked a climax
   term in its merges); memo-card bodies, quizzes, `knowledgeGraph.js` and every exercise ROW are scanned (coefficients count).
7. **A TEXT gate on module source** must read U+2212, bare factors and the repo's thousands separator `\,`, and must not flag Tailwind
   classes (`text-slate-900`) or ids (`ex-9`).
8. **A check value must not hide the error:** x = 0 (or the value that cancels a factor) hides whole terms — peer sheets and
   exercises check at a value where every term shows.
9. **The page start can draw the climax's picture:** set every round's start value explicitly.
10. **The book leaves the SHARED text too:** activity numbers, « نشاط n », « مثال الكتاب », « تمرين n », page numbers, « خطأ مطبعي »
    are rewritten for the teacher page as well (list them as SHARED-deliberate rewrites in the report; exercises are rewritten by the
    platform with their checks recomputed). Module titles and descriptions in `lesson.config.js` are student-visible.
11. **Coach bubbles never cover the next control** — move the controls or the bubble, and look at the screenshot.
12. **`BuildAnswer` hides `ops` and `wrap` from screen readers:** the prompt states the fixed side and the signs live IN the tiles.
13. **Saved-answer keys:** list kept / retired / new keys in the lesson's section; never reuse a key with another meaning.
14. **A classmate's name in a peer sheet is used by no other 4AM peer sheet** (`_unit/missionStrings.test.js` checks it across units)
    and is not a name of the lesson's climax.
