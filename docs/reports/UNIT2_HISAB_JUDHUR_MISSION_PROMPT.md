# Prompt — convert unit 2 « الحساب على الجذور » to the mission prototype (written 2026-11-09)

> Paste everything below the line into a NEW Claude Code session at the repository root. It is self-contained: it names every rule,
> file and check that unit 1 « الأعداد الطبيعيّة والأعداد النّاطقة » established, so the session needs no memory of earlier work.

---

You are converting **unit 2 « الحساب على الجذور » (4AM)** to the validated mission prototype. Treat it as one project, lesson by
lesson, with a commit after each lesson. Unit 1 is the reference: every rule and pattern applied there is BINDING here (owner,
2026-11-08: « every change on the pilot is binding for other and new lessons »).

## 0. Read first — do not skip

1. `CLAUDE.md` in full: owner rules, screens, book independence, respect of Islam, the KidFigure, no raster images.
2. `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md`:
   - §4septies, the mission player;
   - the « Rollout recipe »;
   - the `MissionHome` and `UnitMissionView` rows;
   - §6ter, the lab prototype.
3. `docs/reports/MISSION_ROLLOUT_PROGRESS.md` in full. It logs lessons 1–8 of unit 1, every trap met and every cross-lesson fix, so
   read it fully and do not repeat a trap it records.
4. `docs/architecture/MANIPULATION_CONTRACT.md`:
   - « First » to « Seventh example », i.e. the player props of each lab already converted;
   - §8quater, the coach;
   - « Screen pixels vs layer pixels ».
5. `docs/architecture/MANIPULATION_DNA.md` §17 (the quality bar) and `docs/architecture/ARABIC_RTL_CONTRACT.md`. The latter covers:
   - non-breaking « x / y » counters;
   - formulas never wrapping;
   - « الكفاءة ».
6. The two reference conversions, read as code, not only as docs. Use `git show` on these commits:
   - `feat(lessons): ikhtizal-kasr — mission prototype`;
   - `feat(lessons): awwaliyan-fima-baynahuma — mission prototype` (its lab `coprime-explorer` is the latest v2 treatment, with a
     coach added).

## 1. The unit

| # | Lesson id | Lab type(s) today | Notes |
|---|---|---|---|
| 1 | `jidhr-tarbii` « الجذر التربيعي لعدد موجب » | `square-root-side` | |
| 2 | `natiqa-ghayr-natiqa` « الأعداد الناطقة والأعداد غير الناطقة » | `square-root-side` | same lab: content only once lesson 1 has given it the v2 treatment |
| 3 | `muadalat-x-murabba` « حل المعادلة من الشكل x² = a » | `square-fold` | |
| 4 | `amaliyat-judhur` « العمليات على الجذور التربيعية (الجداء والقسمة) » | `square-tiling` | |
| 5 | `tawzif-khawass-judhur` « توظيف خواص الجذور التربيعية » | `square-tiling` | same lab: content only once lesson 4 has given it the treatment |
| S | `wadiya-idmajiya-judhur` (synthesis « أدمج تعلّماتي ») | none | see §5: no synthesis recipe exists yet |

Folder: `apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/hisab-judhur/`. Order: catalogue order
(`packages/core/curriculum/dz/lessons_4am_2026_2027.json`).

## 2. Per lesson: the full recipe (each item is required)

**Config (`lesson.config.js`):**
- `studentView: 'mission'`;
- a `mission` block:
  - a NEW drawn scene registered in `lessons/common/mission/MissionScene.jsx` (SVG in code; people only through `KidFigure`, girls
    always in hijab; never a raster image);
  - `title`;
  - `opening.text`, the « مسألة الدرس » posed as a question the student cannot solve yet, with its numbers;
  - `opening.cta`, « لا أعرف بعد… هيا نجمع الأدوات »;
  - `tools`: the knowledge ids of `knowledge.jsx`, labels without Latin letters at the start, because RTL reorders them;
  - `climaxModule`: the lesson problem module;
  - `checkpoints`: one per module before the climax, formative, and NEVER using the climax numbers or its answer;
- `knowledgeMapOpen: true`.

**« أستعدّ » (`content/prep.js` + test):**
- 10 platform statements, very easy → harder, the first three true, two كفاءات alternating;
- each statement has a `check` recomputed by the test;
- each كفاءة has `lesson:` (the lesson to revise);
- no climax numbers;
- the old statements stay in `textbook.js` as source.

**Labs in rounds (`content/<theme>.js` + test), played through `LabRounds` behind `PlayerSwitch`:**
- r1: small numbers, by hand, with the questions (`chains`);
- r2: the activity's numbers, with predictions;
- ⭐ an optional challenge;
- a free round with `choices`;
- `easier` rounds that are really smaller;
- goals that can only be met by DOING (see the `roundsModel.js` conditions; add a condition there if needed, with its test);
- the module steps wait for their round (`needsRound`).

**« ورقة زميل » (`content/peerSheet.js` + test):** on the lesson's main misconception. The classmate is invented, with a name never
used in the climax; the numbers are computed; ONE error line; three fixes, each with a `why`.

**Modules:**
- 0 uses the ladder;
- 1–2 use `PlayerSwitch` + `LabRounds`;
- the peer sheet becomes the last step of module 2 (or of the module without a lab);
- the teacher page and Classroom Mode stay unchanged.

**Run `npm run generate:lesson-index` from the repo root.**

## 3. Per lab family: the v2 treatment (the first lesson using the lab does it, in shared code)

For `square-root-side`, then `square-fold`, then `square-tiling`. Model them on `CoprimeExplorer.jsx` and `CommonDivisors.jsx`
(read their « LECTEUR DE MISSION » header comments).

**Props:**
- `onVerdict({ groups, exact })`: what the round's goals read;
- `levels={false}`;
- `handDone`: opens « جرّب كل الإمكانيات » only after the round played by hand;
- `chains`;
- `predict`: a `PredictTray` before the action, at most 2 per round, never during a question;
- `choices`.

**`CHAINS_PLAYER`:**
1. count/observe with one tap (`fill`, chips from `chipsAround`);
2. BUILD the equality (`build`, `slots`, `tiles` with one decoy, `ops` when it is not `= × +`). The question NAMES the object, and the
   scene shows what the question talks about while it is open;
3. the rule.

**The trials journal (« 📋 جدول تجاربك ») sits in the lab's column (`sidePanel`).**

**Player behaviour:**
- controls frozen during a prediction or a question;
- `guided` always in the player;
- no celebration when the stepper is hidden;
- `hideRepresentation`;
- `onIntroChange`.

**`LabCoach` in EVERY lab:**
- a `coachOf` in the lab's logic file;
- it never points at the answer;
- if a target needs a `data-*` anchor, add it;
- remember the zoom: divide `getBoundingClientRect` by `rect.width / el.offsetWidth`, otherwise the ring and the stretch go wrong under
  the player's zoom.

**Strings and tests:**
- strings go in `i18n/locales/ar/lesson.manipulation.json` (keep its 2-space formatting; never re-indent the file);
- a `<lab>Player.test.jsx` asserts each question tells the SAME truth as the lab logic and that no raw key or `{{` reaches the screen.

## 4. Unit-level work (after the five lessons)

**Unit page:** add the unit to `apps/web/src/pages/unit/unitMissions.js`:
- station icons (the same objects as each lesson's scene) and short labels for every lesson + the synthesis;
- the unit challenge REWRITTEN in the platform's words (`lead`, `full`, `question`, `numbers`, `solvedAfter`) — never the textbook's
  text;
- the 5 keys (`after` = a lesson id);
- the history note.

Then:
- `unitMissions.test.js` must stay green;
- run `node apps/web/e2e/unit-mission-view.mjs` after extending it to this unit's URL — loop over every unit in `UNIT_MISSIONS`.

**Owner standards that apply everywhere:**
- no page scroll, ever, on laptop or tablet;
- the main start/continue button sits on the RIGHT (lesson home, unit page);
- the player's bottom bar keeps RTL: « واصل » LEFT, « السابق » RIGHT;
- a typed answer in its own shape (`templateFor` + `TemplateInput`, `EXERCISE_CONTRACT.md` « قوالب الإجابة »);
- no student-visible line sends the student to the textbook.

## 5. The synthesis lessons — decide with the council first

No conversion recipe exists yet for a synthesis lesson. Unit 1's `wadiya-idmajiya-aadad` is still unconverted.

1. **Council:** run the council (skill `llm-council`) on one question: « How does a synthesis lesson (6 training situations, no lab, the
   unit's integration problem) live in the mission player? » Give it the guide §4septies, the synthesis contract (`UNIT1_REFERENCE_CHANGES_2026-10-13.md`) and one synthesis
   lesson's code.
2. **Owner:** show the verdict to the owner and wait for the decision.
3. **Pilot first:** apply it to unit 1's synthesis first (the pilot rule), then to `wadiya-idmajiya-judhur`.
4. **Unit 1 page:** update unit 1's unit page if it changes.

## 6. Verification — every lesson, before its commit

**Tests:**
- `cd apps/web && npx vitest run src/lessons` must be green. A lone `buildLessonMemo.test` timeout under load passes alone; re-run it
  alone before calling it a failure;
- `npm run check:lessons` (repo root): exit 0, entry bundle ≤ 245 KB;
- `node apps/web/scripts/lab-rollout-status.mjs --lesson <id>` must print ✅.

**Playwright walk with a mocked student session.** Pattern: the `open()` of `apps/web/e2e/unit-mission-view.mjs` — the user needs
`nameComplete: true, firstName, lastName`; seed `u_9001_tours.pending` so the page tour does not cover the screen. Walk:
- every round of every lab, by hand, with its questions, to ★★★;
- predictions, « easier » and the free round;
- the home (first visit + return);
- « أستعدّ » (10 questions + review);
- the peer sheet (fix, then restore after reload);
- the final test;
- the knowledge map;
- modules 1–N unit by unit at 1366×768, 1024×768 and 1920×1080: 0 `[data-fit-overflow]`, 0 page scroll, no console error.

**Look at the screenshots with your eyes.** Check for:
- wrapped buttons or counters;
- clipped formulas;
- bidi-scrambled formulas (isolate Latin runs);
- a coach ring off its target;
- `$` shown raw (a `PredictTray` prompt is plain text — no `$…$` there);
- a value wrapped twice in `$` (it becomes display math).

**Review (ECC + council).** For each lesson, run the ECC review agents on the diff:
- `ecc:react-reviewer` (hooks, effects, render loops);
- `ecc:code-reviewer` (correctness, duplication);
- `ecc:a11y-architect` on any new screen.

Verify each finding against the code before fixing. Fix what is real; write in the report what you rejected and why. Run the council
(`llm-council`) on every genuine design decision: a new lab question chain, a new goal condition, the synthesis recipe, anything the
owner has not decided. Report its verdict before applying it.

**Final check (`ecc:verification-loop` or `ecc:quality-gate`):** full `src/lessons` suite, `check:lessons`, the unit e2e, and the
teacher view still showing the detailed pages.

## 7. Documentation (same commit as the code)

- `docs/reports/MISSION_ROLLOUT_PROGRESS.md`:
  - a section per lesson with « What was written », « What was added to the shared code », « Traps met », « Verification » and « Open
    on this lesson »;
  - the table row;
  - the lab-families table.
- `docs/architecture/MANIPULATION_CONTRACT.md`: an « Nth example » per newly treated lab (its player props, chains and goal).
- `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md`: any new reusable pattern, e.g. a new goal condition or a new question kind.
- `CLAUDE.md`: the converted-lessons sentence.
  - **Careful:** other sessions may have uncommitted work in `CLAUDE.md` and the i18n files. Commit ONLY your hunks: build the index
    from `git show HEAD:<file>` plus your change, using a temporary `GIT_INDEX_FILE`. Never `git add -A`. Never revert or stage
    another session's work.

## 8. Commits

- One commit per lesson: `feat(lessons): <id> — mission prototype`, ending with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- One commit for the unit page entry.
- Do not push.
- At the end, report:
  - per lesson: what changed, what was verified, the review findings (fixed / rejected), the council verdicts;
  - anything that needs the owner's decision.
