# Lesson v2 — master audit and rollout plan

Written 2026-11-16 for the session that starts the work. Status: **plan, nothing in it is built yet** except what §1
describes. The work order is generated: `docs/curriculum/V2_ROLLOUT_ORDER.md` (`node scripts/v2-rollout-order.mjs`).

**The owner's instruction (2026-11-16).** The pilot lesson `qasim-adad-tabii` is now the best version of a lesson. Every
other lesson gets the same treatment, one by one: the 4AM lessons of الفصل الأول, then the lessons that are their support
or core, then الفصل الثاني, and so on; then 3AM the same way. A lesson that exists is rebuilt completely, without being
limited by the docs or by what is already built. A lesson that does not exist is generated from scratch. The code must be
clean and readable for a programmer, and all dead code removed.

« The AM lessons » = **4AM** (confirmed by the owner, 2026-11-16).

---

## 1. What « lesson v2 » is (the pilot, as built)

A lesson is v2 when it has everything below. Each line names where the pilot keeps it.

**Student**

| # | Part | In the pilot |
|---|---|---|
| S1 | Launch « عُدّة الانطلاق »: 2–4 tools from the learning net, one capsule gate | `lessons/common/launchkit/` (`families.js`: 2 families) |
| S2 | The lesson as a game world; each rule forged and defended, never told | `gameworld/divisorIsles/` (`Game.js`, `RuleForge.jsx`) — today only ONE of the four tablets is forged |
| S3 | « خريطة المعارف » full page: mind map, memo sheets, « تدرّب » | `KnowledgePage.jsx` + the lesson's `knowledge.jsx` |
| S4 | Practice hub: « فضاء اللعب » (16 levels) then « فضاء الامتحان » (5 generated exam levels) | `Spaces.jsx`, `practice.js`, `trainer.js` |
| S5 | Exam cases played in real-world worlds, each carrying a value; « حيلة » shortcuts | `cases.js`, `Worlds.js`, `Depot.js`, `tips.js` |
| S6 | Paper mode, exam coach, white exam « الامتحان الأبيض », « تقدّمي » | `Paper.jsx`, `features/practice/exam/`, `ExamSitting.jsx`, `journey.js` |
| S7 | Evidence: exam-format first tries count, verdict re-computed by the server | `evidence.js`, `POST /lessons/{code}/game-evidence` |
| S8 | « مختبري »: the lesson's instruments with quests | `lessonlab/registry.js › TOOLS` |
| S9 | The classic mission player behind `?view=classic` and for « إختبار أولي » | `lessons/common/mission/` |

**Teacher**

| # | Part | In the pilot |
|---|---|---|
| T1 | Lesson page = common header + the card « للأستاذ » | `TeacherLessonPanel.jsx`, `LessonToolsBar.jsx`, `boardLessons.js › BOARD_LESSONS` |
| T2 | « حصّة القسم »: seating, start/end test, rules revision, the lesson on the board | `ClassSessionPage.jsx`, `lessonScripts.js › SCRIPTS`, `content/class-tests/` |
| T3 | Written memo, drawn opening situations, two printed pages | `lessonMemos.js › BOARD_MEMOS`, `MemoFigures.jsx` |
| T4 | Exercise bank (key, board, printed sheet), knowledge card, tracking, lesson file | `TeacherExerciseBank.jsx`, `knowledgeCards.js`, `ClassTracking.jsx`, `LessonFilePage.jsx` |

T4's tracking, lesson file and bank need nothing per lesson. Everything else in both tables is per-lesson work today.

---

## 2. Audit of the code base (measured 2026-11-16)

### 2.1 Size

- `apps/web/src`: 5,562 JS/JSX files, 1,007 of them tests; about 616,000 lines without tests.
- Lessons: 140 exist (4AM 74, 3AM 28, 2AM 23, 1AM 15); 130 catalogue entries are still `coming_soon`.
- 32 lessons (all 4AM) are in mission mode; **one** lesson has a game world and the teacher board.

### 2.2 The pilot cannot be copied as it stands — the main finding

| Fact | Number |
|---|---|
| Game world code written for this ONE lesson (`gameworld/divisorIsles/`) | about 6,500 lines with its tests |
| Reusable game engine beside it (`gameworld/engine/`) | 628 lines |
| Largest files | `Game.js` 1,388 lines, `DivisorIsles.jsx` 882 lines |
| Shared files that name the pilot's id in their own code | 8 (`ModuleLayout`, `StudentFocus`, `LessonIndex`, `KnowledgeProvider`, `PeerSheet`, `graphModel`, `ProgressiveKnowledgeMap`, `missionModel`) |
| Central lists a lesson must be added to | 9 (`BOARD_LESSONS`, `SCRIPTS`, `BOARD_MEMOS`, `KNOWLEDGE_LOADERS`, lab `TOOLS`, launch `families`, `exam-coach.json`, `exam-style.json`, `content/class-tests/`) |

At the pilot's cost, 173 more lessons would add over a million lines. The trainer, the exam sitting, the paper mode, the
practice ladder, the knowledge page and the rule forge are generic ideas written inside one lesson's folder. **Phase 0
exists to turn them into a kit, so a lesson becomes data plus one world mechanic.**

### 2.3 Readability

There is no linter and no formatter in the repository (no ESLint, no Prettier config). The code written during the
pilot is the densest in the tree:

| Area | Lines | Lines over 160 characters | Over 300 |
|---|---|---|---|
| `features/classSession/` | 2,229 | 17 % | 92 |
| `pages/teacher/ClassSessionPage.jsx` | 180 | 27 % | 13 |
| `lessons/common/launchkit/` | 849 | 14 % | 15 |
| `lessons/common/lessonlab/` | 911 | 12 % | 20 |
| `lessons/common/gameworld/` | 6,354 | 9 % | 41 |
| `lessons/common/mission/` (for comparison) | 3,901 | 3 % | 2 |
| `lessons/common/classroom/` (for comparison) | 2,233 | 1 % | 1 |

Whole components sit on one line. This does not meet « readable for a programmer » and must be fixed before it is copied
173 times.

### 2.4 Dead code

A reachability scan from `src/main.jsx` (static imports, literal dynamic imports, `import.meta.glob`) finds **57 files,
about 4,300 lines, that nothing reaches**. They are candidates: each must be checked against tests and scripts before
deletion.

- Never imported: `lessons/common/utils/geometry3d.js` (538), `geometry2d.js` (495), `components/AdaptiveFeedback.jsx`,
  `components/FeedbackBox.jsx`, `hooks/useLabState.js`, ten files of `manipulations/primitives/` (`ContextScenes`,
  `BookRectangle`, `FactorPairRow`, `RectangleArray`, `StepTimeline`, `Group`, and four two-line stubs).
- Billing pages without a route: `pages/Abonnement.jsx`, `Tarifs.jsx`, `AbonnementRetour.jsx`,
  `components/pricing/PricingCard.jsx`, `services/billingService.js`. **Owner decision**: delete, or keep for online
  payment later.
- Others: `components/services/ProcessSection.jsx`, `components/auth/GradeSwitcher.jsx`,
  `components/diagnostic/DiagnosticInviteBanner.jsx`, `components/admin/AdminPage.jsx`, six small files in
  `features/madar/`.
- 27 files inside 4AM lessons, mostly unused `*Vignette.jsx` scenes. They go when their lesson is rebuilt.

The scan sees files, not unused exports inside a live file, and it did not cover `apps/api` or `packages/core`. Both are
part of Phase 0, step 2.

The larger dead code is not files but **systems the pilot replaced that still serve the other 139 lessons**: the old
Classroom Mode (`lessons/common/classroom/`, 2,233 lines), the derived memo, the old lesson-home sections, « أستعدّ », the
مبتدئ / متقدم lab modes. They cannot be deleted today. §5 gives the rule that removes each one the day its last user is
converted.

### 2.5 State of the repository

- Everything after commit `008e9410` is uncommitted (about 54 changed or new files: the whole teacher side). Nothing
  should start before this is committed — the owner's go-ahead is needed.
- Root `CLAUDE.md` is 51 KB and reads as a history log. A new session loads all of it; the binding rules are hard to find.
- The docs still call the game world, the launch kit, « مختبري » and the class session « NOT validated ».
- Repository root holds stray files: `undefined-teacher-hub.png`, `undefined-teacher-player.png`, `shots/`,
  `Remaining-Work-Exercices`, four old report `.md` files.
- 3AM links of the learning net are not weighted core / support yet (`WEIGHTED_GRADES = ['4am']`).
- Known stale walks: `e2e/teacher-memo.mjs` (three checks), `e2e/teacher-learning.mjs` (student sign-in).
- Not run for this audit: the full web test suite, `check:lessons`, the API test suite.

---

## 3. The owner's decisions

**All decided on 2026-11-17** (D1 and D2 on 2026-11-16). Nothing here is open any more.

| # | Question | Decision |
|---|---|---|
| D1 | « AM lessons » = 4AM? | **DECIDED (owner, 2026-11-16): yes** |
| D2 | One game world per lesson, or one world per UNIT with one island (mechanic) per lesson? | **DECIDED (owner, 2026-11-16): one world per unit; a lesson that needs its own world gets its own.** The reason for a separate world is written in the lesson's pack |
| D3 | When a lesson is converted, is its mission player (`?view=classic`) kept? | **DECIDED: no.** « Rebuild everything as we did with the first lesson; never depend on the existing code or the docs. » A v2 lesson depends on nothing of the mission player: the kit itself carries « إختبار أولي ». The pilot's `?view=classic` goes when the kit does |
| D4 | Billing pages (§2.4): delete or keep? | **DECIDED: delete.** Done on 2026-11-17 (five files) |
| D5 | Do prerequisite lessons of 1AM–3AM get the full v2, teacher side included? | **DECIDED: yes, exactly as lesson 1** — rebuilt from scratch. Existing maths is reused when it is useful, « because it is useful, not because it is there » |
| D6 | Is the pilot's v2 now BINDING (docs say « not validated »)? | **DECIDED: yes.** The contracts are marked at Phase 0 step 9 |
| D7 | Three of the pilot's four rules are still told, not forged. Finish the pilot first? | **DECIDED: yes**, in Phase 0 |
| D8 | Do v2 lessons open on phones? | **DECIDED: student side yes, teacher side no.** A first pass is on the pilot (`GAME_WORLD.md` § « On a phone »); the owner tests it on a real phone, then it becomes a requirement of the kit |

---

## 4. Phase 0 — foundation (before any second lesson)

Done when a second lesson can be built without touching shared code. Order matters.

1. **Commit** the current work (owner's go-ahead), then tidy the repository root.
2. **Tooling**: add ESLint and Prettier with one config (line length 120, no unused imports or variables), add a tool
   that finds unused files AND unused exports (`knip`, or the reachability scan kept as `scripts/check-unreached.mjs`),
   run it on `apps/web`, `packages/core` and the PHP side (unused classes and routes), wire all into CI. Format the
   pilot's areas of §2.3 first, in a commit that changes nothing else.
3. **Delete the dead files** of §2.4 after checking each against tests and scripts.
4. **Extract the lesson kit** from `gameworld/divisorIsles/` into `lessons/common/gameworld/kit/`: shell and title
   screen, spaces hub, trainer, exam sitting, paper mode, knowledge page, rule forge, evidence, journey, tips. Each takes
   the lesson's data; none names a lesson. `Game.js` is split into the kit's world runtime and the lesson's mechanic.
   A world mechanic implements one small interface: build the scene, read the student's gesture, give the visible
   verdict.
5. **One lesson pack**: a lesson declares everything in its own folder (`lesson.pack.js`: world, forge rules, practice
   families, exam cases, class test, board script, memo, knowledge cards, lab tools, launch families). The nine central
   lists of §2.2 become one generated index, like `lessonIndex.generated.json`.
6. **Remove the pilot's id from the 8 shared files**: each becomes a flag or a field of the pack.
7. **Finish the pilot** (D7): forge the three rules that are still told.
8. **Status script** `apps/web/scripts/lesson-v2-status.mjs --lesson <id>`: one line per part of §1, ✅ or what is
   missing. A lesson is not done until it prints ✅ everywhere (same idea as `lab-rollout-status.mjs`).
9. **Contract and docs**: write `docs/architecture/LESSON_V2.md` (the definition of done of §6, the pack, the kit, the
   mechanic interface); cut root `CLAUDE.md` to a short map of binding rules that links to it; mark D6 everywhere.
10. **Prove the recipe** on lesson 2, `qawasim-adad-tabii`, built only from the kit and the pack. Time it. Report the
    time and the line count to the owner: that number sizes the whole rollout.

Phase 0 is finished when: the pilot and lesson 2 both print ✅, no shared file names a lesson, lint and the unreached
check pass in CI, and the pilot's walks (`e2e/class-session.mjs` 102 checks, `e2e/class-lesson.mjs` 59) still pass.

---

## 4bis. What else must change before the mass rollout (audit of 2026-11-16, second pass)

Asked by the owner: « what are all the other things that need to be updated, in addition to what we discussed ».
Checked in the code unless marked otherwise. Linked plans: the phone (`GAME_WORLD.md` § « On a phone »), the navigation
and its look (`NAVIGATION_REBUILD_PLAN.md`).

**A. Blockers — a second lesson cannot be right without them**

| # | What | Evidence |
|---|---|---|
| A1 | **The server's verdict is written for the pilot.** `Domain/GameWorld/ClaimVerifier.php` re-computes the pilot's own cases (قاسم / مضاعف). Each lesson needs its verifier, so the kit needs ONE way to declare it on both sides, with one shared fixture | `ClaimVerifier.php` lines 14–53 |
| A2 | **The student's journey in the world stays in the browser** (`scopedStorage` in the game and the launch kit); only exam evidence reaches the server. Now that phones open, a student who starts on a phone finds nothing on the laptop | `DivisorIsles.jsx:14`, `launchkit/store.js`; a server sync was looked for and not found |
| A3 | **The generation contract and its checks describe the OLD lesson.** `LESSON_DEVELOPMENT_GUIDE.md` §14 is « frozen » on the module lesson; no script of `check:lessons`, `lab-rollout-status` or `check:textbook` knows a game world, a pack or a board | no validator mentions `gameWorld` or `BOARD_LESSONS` |
| A4 | **Progress, mastery and the reports read MODULES.** « بوصلتي », the parent's « التقدّم بالتفصيل », the school's reports, the teacher's tracking and the year map of the navigation must read a v2 lesson (stages, keys, exam levels) the same way | to design with A2; not traced page by page |
| A5 | **What happens to a student's progress when his lesson is rebuilt?** 32 lessons are in use in mission mode. A rule is needed (keep the الكفاءات, restart the journey?) and its migration | `packages/core/progress/moduleLayoutMigrations.js` exists for the old layouts |
| A6 | **No walk runs in CI** (0 of 59 `e2e/*.mjs`), and each walk is hand-written for one lesson. 174 lessons need ONE walk driven by the lesson's pack, run in CI on a laptop and a phone size | `ci.yml`: unit tests, build, budget, API tests only |

**B. Before the tenth lesson — they multiply with every lesson**

| # | What | Evidence |
|---|---|---|
| B1 | **Weight on a phone network.** three.js is 555 KB and the pilot's world 293 KB before compression, per lesson. One shared engine chunk, a loading screen with progress, and a measured budget per lesson | `dist/assets` |
| B2 | **Text lives in the code.** 66 files of the pilot's areas hold Arabic sentences inline, while the platform's rule is the i18n files. Choose one rule for a pack (my advice: the lesson's own strings in its pack, the kit's strings in i18n) | count of files with Arabic literals |
| B3 | **The entry bundle is full**: 242.7 KB of 245. The navigation rebuild and the tokens need room first. **DONE 2026-11-17: 199.2 KB, budget 212** (§4ter-0) | `check:entry-budget` |
| B4 | **The launch kit has 2 question families** and no server side (phase 1 of 4). Every lesson needs a family per core prerequisite: about one new family per lesson | `launchkit/families.js` |
| B5 | **« مختبري » has 8 instruments, all on division.** Each unit needs its own; the labs of the 112 old lessons are the material | `lessonlab/registry.js` |
| B6 | **The class session is at step 2 of 4**: group formats and what the student sees at home are not built. Decide whether they enter the definition of done | `CLASS_SESSION.md` §8bis |
| B7 | **The unit page.** With one world per unit (D2), `UnitMissionView` and `unitMissions.js` describe something else; the unit page and the unit's world must become one thing | `pages/unit/` |
| B8 | **The content checks must read packs**: respect of Islam, independence from the book, « دج », counters, formulas that never wrap | today they read the module files |
| B9 | **The guided tours** (`tour.json`, 475 lines) describe pages that the rebuild and the navigation replace | seen on the teacher's lesson page |

**C. Around the lessons — can run beside the rollout**

| # | What |
|---|---|
| C1 | **The pilot's own leftovers**: three rules still told; island H unverified under touch; « بطاقتي » still shown to students; old « كرّاسي » notes not moved to « ملفّ الدرس »; the memo's minutes are estimates |
| C2 | **The marketing page `/methode`** shows real captures of the OLD lesson (the football lab, « 50 تمرينًا »): re-capture after the pilot is final |
| C3 | **Measurement.** Nothing records how a student moves through a lesson (time per island, where he leaves). Without it, 174 lessons are built on opinion. One timed real student before lesson 5 |
| C4 | **Open rollouts that overlap**: the exam-sheet practice « unit by unit », the answer templates, the « دج » sweep. Fold them into the v2 definition of done or finish them first, never both |
| C5 | **The learning net**: weights for 3AM; the catalogue's false prerequisites that still await the owner |
| C6 | **Production**: two migrations and about 80 changed files are not committed; the content publishing pipeline must carry packs and class tests |

## 4ter-0. State of the « today » items (2026-11-16)

> **ONE SCREEN SIZE since 2026-11-19 (owner, after a council of five advisors and three reviewers): 1366×768, alone.**
> His words: « all the lessons must work for this size only: 1366×768, alone, no other size is needed ». « Done » is
> the walks at 1366×768 and the screenshots looked at; the walks owed below at 1024×768 and 1840×900 (the six older
> lessons, lesson 5's sitting) are NO LONGER OWED. Raised by the council and NOT decided: the real window of such a
> laptop is shorter than 768 px (about 650 with the browser's bars); the 3D world has never been tried on a weak school
> machine; an old 4:3 projector may force the teacher's board to 1024×768; nobody has measured which device families own.

- **C6 — DONE.** The work is committed on `dev` (`402e8087` code, `ab22f63f` plans). Not pushed, not merged: the owner
  tests over Wi-Fi first.
- **C4 — DECIDED** (owner accepted the advice, 2026-11-16): the exam-sheet practice, the answer templates and « دج » are
  part of the v2 definition of done (section 6); their separate rollouts stop.
- **B6 — DECIDED** (same): steps 3–4 of the class session are NOT part of « done »; they are built on the pilot after
  unit 1.
- **B9 — first half DONE**: the old tour of the lesson page is no longer declared on a lesson that has its board. Its
  rewrite waits for the navigation rebuild.
- **Navigation rebuild — COMMITTED** (`099d3f9b`, 2026-11-17, not pushed): the tree was clean before Phase 0 went on.
- **Phase 0 step 2 — linter DONE (2026-11-17)**: ESLint on the whole tree and « nothing unused » (exports, i18n keys,
  string tables; classes, actions and `use` lines of the API), all in CI — contract `docs/architecture/CODE_HEALTH.md`.
  First run: 2,312 unused imports, 389 unused variables, 1,949 unused exports, 211 unused i18n keys, 30 dead sentences
  were found; lint is at 0, and 553 lines wait in a baseline that may only shrink (494 exports that only a test
  imports, 59 i18n keys to look at). The linter also found LaTeX that reached students broken (`'\;'` shown as « ; »):
  fixed. What a person must still look at: `docs/reports/LINT_FIRST_RUN_2026-11-17.md`.
- **B3 — DONE (2026-11-17)**: the entry bundle went from 240.8 to **199.2 KB gzip** and its budget from 245 to **212**.
  The strings of the admin panel and of the teacher space now load with their own space (−30.5 KB), and the shell
  animates with the light half of framer-motion (−11.1 KB). Two tests hold it (`i18n/onDemandNamespaces.test.js`,
  `entryGraph.test.js`). Contract and measures: `docs/architecture/BUNDLE_BOUNDARIES.md` §3, §4 rules 5 and 10, §5.
  The same day the owner had the command palette (Ctrl+K) deleted — no global search either: entry 197.7 KB.
- **Phase 0 step 4 — kit extraction, sub-step 1 of 3 DONE (2026-11-17): the pure logic.** `gameworld/kit/` holds six
  frames that name no lesson (practice ladder, trainer, exam sitting, the road, evidence, random numbers) plus the
  calculation shortcuts and the long-division model; the pilot's content moved to its own folder
  `…/qasim-adad-tabii/world/` and is bound to them. `kit.test.js` drives the kit with a toy lesson and holds the boundary
  (no kit file imports or names a lesson). After it: 17,936 web tests, lint, `check:unused`, `check:unreached`,
  `check:format`, `check:lessons` pass, and the pilot's eight walks pass (533 checks: story 92, practice 30, field 102,
  sitting 45, launch kit 56, « مختبري » 47, class lesson 59, class session 102). **Still to do in step 4:** sub-step 2
  — the React screens take the lesson's data instead of importing the pilot (`KnowledgePage`, `Trainer`, `ExamSitting`,
  `Spaces`, `Paper`, `RuleForge`, the title screen and HUD of `DivisorIsles.jsx`), the two string tables are split into
  kit chrome and lesson sentences, `cases.js` and `ruleForge.js` are split the same way; sub-step 3 — `Game.js` becomes
  the world runtime plus the lesson's mechanic. Files and rules: `docs/architecture/GAME_WORLD.md` §3.
- **Phase 0 step 4 — sub-step 2, the screens (2026-11-17): six of them DONE.** The lesson's data reaches the screens
  through ONE object (`<LessonProvider>` / `useLesson()`; the pilot's pack is `world/index.js`). In the kit now: the two
  spaces and « تقدّمي », the paper mode, the fit box, the exam sitting, « تدرّب » and the knowledge page. The shape of an
  exam answer became data the lesson describes (a `form`, a `sentence`, `tokens`), so the kit draws any lesson's
  answers. The SHELL (title screen, HUD, practice hub, result, end) is NOT split yet: it shares the overlay protocol
  with `Game.js` and is done with sub-step 3. The same day the other screen sizes were measured (owner's request):
  failures at 1024×768, 1840×900 and on a phone, ALL present before the extraction (`GAME_WORLD.md` §6); owner's
  decision: they are repaired on the kit's screens right after this step, before lesson 2.
- **Phase 0 step 4 — sub-step 3, part 1 (2026-11-17): `Game.js` is split.** `kit/WorldRuntime.js` (the scene, the loop,
  the robot, the camera, the sky, the hub, the knowledge and exam state, the save) is a class a WORLD extends through a
  closed list of hooks (`GAME_WORLD.md` §3); the pilot's world keeps the mechanic and no longer imports the lesson: it
  reads `this.lesson`. Still inside the world: the gate dash and the real-world cases. Part 2 is the shell.
- **Phase 0 step 4 — sub-step 3, part 2 (2026-11-17): the shell is split. Step 4 is DONE for what can be done before
  lesson 2.** `kit/LessonWorld.jsx` is the shell every world shares (canvas, top bar, controls, overlay switch) with
  the title screen, the practice hub, the rule tablet, the result and the end; the pilot's `DivisorIsles.jsx` (887
  lines, was 1,911) keeps its own overlays and defines `WORLD`. NOT extracted, on purpose, and recorded in
  `GAME_WORLD.md` §3: the gate dash and the real-world cases (inside the pilot's world), the rule forge (step 7), the
  CSS split (done with the screen-size repair), the world's story as data (the gate on lesson 2 decides).
- **OWNER'S STANDING ORDER (2026-11-17, his words):** « go on, do not stop until i get the lesson 2 ready to use after
  all possible test in all devices ». So: every remaining step of Phase 0 and lesson 2 are done WITHOUT waiting for
  « commit »; each step is committed on `dev` when its checks pass; nothing is pushed; lesson 2 is tested at laptop,
  tablet and phone sizes. The order of what is left is the list just below.
- **WHAT IS LEFT, in order (kept up to date — the first unticked line is the next thing to do):**
  1. [x] Screen-size repair of the pilot on the kit's screens — DONE 2026-11-17 (commits `818a3c5b`, `6052d9cc` and
     the one after). Measured, Chromium emulation: the eight walks pass at 1366×768, 1024×768 and 1840×900 (533 checks
     each) and the six student walks pass on a phone held sideways (`E2E_TOUCH=1 E2E_SIZE=800x370`: 357 checks); web
     tests 17,942; lint, format, dead-file, unused and `check:lessons` pass; entry bundle 197.7 KB. What changed and the
     phone rules of each screen: `GAME_WORLD.md` §6 and « On a phone ». `kit/world.css` is split into eleven sheets BY
     SCREEN (`kit/styles/`, imported in the order of the cascade); the split BY OWNER (kit / the pilot's world) is not
     done — it would reorder rules the later sheets override, and waits for a second world. NOT checked: a real phone,
     a real tablet (the owner tests over Wi-Fi before any merge).
  2. [x] One `lesson.pack.js` per lesson and its generated index — DONE 2026-11-17. The pilot's pack names its phone
     flag, its world and content, its knowledge, the exam coach's sheets, its board script and memo (moved into its
     folder: `board/script.js`, `board/memo.js`); `generate-lesson-index.mjs` writes the flags into the lesson index;
     `registry.js` (`lessonPackFlags`, `lessonsWithPack`, `loadLessonPack`) and `lessons/lessonPack.js` (`loadPackPart`,
     `usePackPart`) are the only readers. GONE: `PHONE_LESSONS`, `BOARD_LESSONS` as typed lists, `SCRIPTS`,
     `BOARD_MEMOS`, `KNOWLEDGE_LOADERS`, the exam coach's table, `content/practice/exam-coach.json`, `GAME_WORLDS`, the
     `gameWorld` / `classSession` keys of the config, the world's import of its one lesson (`LessonGameWorld.jsx` hands
     the content to the world). NOT in the pack, with the reason (`LESSON_V2.md` §1): the lab's `TOOLS`, the launch
     kit's `families.js`, `exam-style.json`, `content/class-tests/`, `unitMissions.js` — so of the nine lists of §2.2,
     five became the pack and four stay where they are.
  3. [x] The pilot's id is out of the shared files — DONE 2026-11-17. After step 2 the eight files of §2.2 named it only
     in comments (reworded); `lessons/lessonPack.test.js` now FAILS when a file of `lessons/common`, `features`,
     `components`, `services`, `utils`, `hooks` or `contexts` names a lesson that has a pack (one exception, with its
     reason: the instrument tags of `lessonlab/registry.js`). Still naming it, by design: `pages/unit/unitMissions.js`
     (the unit's page), `pages/Methode.jsx` (marketing captures), other lessons' prerequisites. STILL COUPLED, for step 4:
     the pilot's content imports the world's `logic.js` / `strings.js`, and `features/classSession/lessonScripts.js`
     imports the world's `ruleForge.js`.
  4. [x] The pilot is finished: its FOUR rules are forged, and the forge is in the kit — DONE 2026-11-17. `kit/forge.js`
     (the frame: a forge is a description — tiles, what a rule says of a case, evidence, predictions, attacks, nudges, a
     last step typed in its own shape) and `kit/RuleForge.jsx` (the screen); the world gives what a case is and how it is
     drawn (`divisorIsles/ruleForge.js`, `forgeParts.jsx`); the lesson gives its forges (`world/forges.js`). The three
     new ones: the plank's table (island E), which number is written first in each of the four sentences (the
     guardians), the two planks that hold over every gap (the stone of island H). In each, sixteen rules can be written
     and exactly one holds; every false rule is refuted in front of the student (`forges.test.js`, 29 tests). The story
     walk crosses the four forges (104 checks, laptop and phone); the forge has a phone layout (no zoom of its own).
     NOT done: the class board still forges only the first rule with the class.
  5. [~] A1–A6 with B1 — what was done on 2026-11-17 and what was NOT:
     - A1 DONE: a claim kind belongs to no lesson. `kit/claims.js` is the browser's copy of `ClaimVerifier.php`; one
       fixture; `claims.test.js` fails when the two lists differ. Adding a kind = the same three edits on both sides
       (`LESSON_V2.md` §1bis). The controller was already lesson-independent.
     - A2 DONE: the journey follows the student between devices (`kit/saveSync.js`, his private answers store, no new
       table; `LESSON_V2.md` §1ter). NOT synced: the launch kit's own store (`launchkit/store.js`).
     - B1 DONE in part: three.js already is ONE shared chunk (135 KB gzip, measured); the world now opens on a
       loading screen with progress and a retry. NOT done: a measured budget per lesson (step 6).
     - A4 — no change needed: a v2 lesson keeps its modules and marks them from the world; every report reads them as
       before (`LESSON_V2.md` §1ter). TRACED reader by reader on 2026-11-18 (`OLD_VERSION_TRACE_2026-11-18.md`): the
       module ids and numbers stay as data, the module PAGES are deleted.
     - A5 — a rule is WRITTEN (taken from the pilot, never decided by the owner): nothing earned is taken, the keys
       his progress proves are his, the story starts at the first island (`LESSON_V2.md` §1ter).
     - A3 — in step 6 (the contract and the status script).
     - A6 NOT done: no walk runs in CI; one walk driven by a lesson's pack is written with lesson 2 (step 8).
  6. [x] `apps/web/scripts/lesson-v2-status.mjs` (`npm run status:lesson-v2`), `docs/architecture/LESSON_V2.md` (the
     pack, the server's side, the journey, the folder, the definition of done, the retirement ledger), D6 marked at the
     top of the four contracts — DONE 2026-11-17. The pilot prints ✅ (15 parts); lesson 2 prints 12 parts missing.
     NOT in the script: a weight budget per lesson; the content checks do not read `world/` and `board/` yet (B8).
  7. [x] The root `CLAUDE.md` is cut from 479 lines (56.7 KB) to 298 (19.5 KB): a map of what binds every task, with
     the documentation rule and the images rules kept word for word — DONE 2026-11-17. The file as it was is kept
     whole: `docs/reports/CLAUDE_MD_BEFORE_CUT_2026-11-17.md`.
  8. [x] THE GATE — lesson 2 `qawasim-adad-tabii`, rebuilt with the kit only — DONE 2026-11-18 (the owner's validation remains; the old modules are DELETED since, step 10; report `LESSON_2_GATE_REPORT.md`). STATE on 2026-11-17, late:
     - **THE STUDENT'S WORLD PLAYS**, measured: `apps/web/e2e/gameworld-qawasim.mjs` (52 checks: the story from the
       title to the last bridge, its four forges each with a false rule refuted and a last step typed wrong then right,
       the workshop, the dash, the stone) passes at 1366×768, 1024×768, 1840×900 and on a phone held sideways
       (800×370, touch); the pilot's story walk still gives 104. `status:lesson-v2` prints 12 of 15 parts.
       Two defects were seen on screenshots and fixed (the five-slot forge overflowed; a case whose truth is not
       « the bridge holds » was labelled « ثبت »): `forgeParts.jsx › fits, tag`, `kit/ruleForge.css` five slots.
     - DONE since: unit tests for `world/practice`, `trainer`, `sitting`, `journey`, `evidence` (44 tests with the
       forges': every wave has one right gate; every trainer question accepts its solution and refuses a wrong
       answer; a full-mark paper earns every point; every claim sent is re-computed true) — commit `f4040bd0`;
       `status:lesson-v2` printed 13 of 15 parts (missing: the launch-kit family, the board) — 14 of 15 since the
       family below (missing: the board).
     - **PHONE PAUSED (owner, 2026-11-18)**: `phone: false` in both packs; not part of « done ». PHONE DEBT of lesson 2, measured 2026-11-18 at 800×370 touch with the three new walks (`gameworld-qawasim-hub/-sitting/-trainer`): text under the 12 px floor on the map (`.di-map__edge` 9.4 px), progress, trainer tabs, sitting (`.xs-quiet`, `.xs-tip`, answer-sheet `small`); the trainer leaves the screen on pairs / show / rule questions; « تحقّق » covered on pairs questions 5–6; the title screen's door labels cut at the bottom edge. The same three walks PASS at 1366×768, 1024×768, 1840×900 (199 / 142 / 421 checks).
- **STATE 2026-11-18 (second session): lesson 2 prints ✅ on `status:lesson-v2` (phone paused).** DONE: (1)–(2) the
       practice hub, « تدرّب », an exam sitting and « تقدّمي » are PLAYED through their screens by three walks
       (`gameworld-qawasim-hub` 199 checks, `-sitting` 142, `-trainer` 421: they pass at 1366×768, 1024×768 and
       1840×900; they found and fixed: the guide card read the PILOT's strings and crashed on lesson 2's keys, the rule
       tablet opened from the hub lost its node, no sound button on « المعارف » and « تقدّمي », progress rows that
       wrapped off the screen, raw `$…$` in a true / false statement, the sheet's « تحقّق » turning white under the
       mouse); (3) THE BOARD: `board/script.js` (11 stations: a situation, four questions each proved by bridges and
       each followed by its rule's name, two copybook pages), `board/memo.js` (four openings, a 45-minute hour, six
       anticipated answers, three exit questions) and `board` in the pack; the board now reads the lesson's own
       `rules` (it read the pilot's strings), the plank row takes up to six choices, a long tablet shrinks inside
       its card, the copybook splits in two pages (`CLASS_SESSION.md` §5ter); `board/board.test.js` computes every
       number; the walk `class-lesson-qawasim.mjs` passes at the three sizes and the pilot's `class-lesson.mjs` still
       passes. Also found: the walks' « formulas read left to right » check matched NO atom of a `\displaystyle`
       formula (so it could never fail) — fixed in `e2e/lib/walk.mjs`. The gate's `phone` line is paused, not failed.
       DONE since, 2026-11-18 (third part of the same day): (5) the screenshots looked at — student and teacher, the
       list is in the report; (6) « published locally » read from the database (lesson `available`, 8 modules and 50
       exercises `published`, for both lessons); (7) the gate's report: `LESSON_2_GATE_REPORT.md` (real time from git,
       lines written, what was copied from the pilot, one load-sensitive flake of the world walk). The pilot's eight
       walks were re-run after the kit was touched and pass. STILL OPEN, for the OWNER: his validation of lesson 2;
       the phone debt below. (The old modules and `?view=classic` were DELETED on his order the same day — step 10.)
       MEASURED after the formula check was repaired: the board walk (12 screens) and the hub, sitting and trainer walks
       (199 / 142 / 421 checks) pass at 1366×768, 1024×768 and 1840×900.
     - **Older state, 2026-11-17 (kept for the history): NOT DONE — lesson 2 is not finished:** (1) the trainer, the sittings and the practice hub of lesson 2 were
       NEVER opened in a browser (unit-tested only); (2) the practice hub, « تدرّب », an exam sitting and
       « تقدّمي » walked for lesson 2; (3) `board/script.js`, `board/memo.js` and `board` in the pack — the teacher
       still gets the OLD lesson page; ~~(4) a launch-kit family for `4am.m1.r01`~~ **DONE 2026-11-17** (the owner
       opened lesson 2 and saw an EMPTY kit, 0 / 0): family « قاسم عدد طبيعي » in `launchkit/families.js` (an equality
       with one box, numbers to sort, SENTENCES to sort — a new kind of card; worked example answering the named
       mistake), walk `e2e/launch-kit-qawasim.mjs` (30 checks, four sizes), and the sort gesture now fits a phone
       above its buttons (it lay under them, on the pilot too); (5) screenshots of every
       screen looked at (only the forges were); (6) the old modules are still there (`?view=classic`, « إختبار أولي »);
       (7) the gate's report: real time, lines written by hand, what was copied from the pilot.
     - **Found by the owner playing lesson 2 (2026-11-17), fixed the same day — and what they say about my checks:**
       (a) raw LaTeX under a prediction of the third forge (`$5 \times 5 = 25$`): the kit printed `T.fact` as plain
       text; (b) the store of the last bridge showed the PILOT's numbers inside lesson 2 (756 in the equation, mould
       32 offered, 1850 in the price) — a dead end: the price could never be right; (c) no way out of the store's
       payment step, and the ✕ of the top bar lay under every dialog. **My earlier line « lesson 2's world plays end
       to end (52 checks) » was FALSE for the store**: that walk stopped at the store's door and never played it.
       Now: `GAME_WORLD.md` §2ter-0 (three rules, each with its check); the walk plays the store through its screen
       to the end screen (69 checks at 1366×768, 1024×768, 1840×900 and on a phone); the four world walks fail on
       any raw formula on screen; a unit test keeps the pilot's numbers out of the world's screen. Also found by the
       whole web suite, which had not been re-run since lesson 2 got `phone: true`: a phone could open the teacher's
       memo address of lesson 2, which has no board yet — `phoneLessons.js` now asks for `board` too.
       **Still true: every screen of lesson 2 must be PLAYED through its screen by a walk before the gate** — the
       practice hub, « تدرّب », a sitting and « تقدّمي » are still unit-tested only.
     - **The two hard keys of lesson 2 were REBUILT the same day, on the owner's word** (« each rule has its own
       nature and way of discovery … he suddenly get told the rule », then « free to rebuild this part even with 100%
       different concept … the student never told the rule, he gets the rule himself »). Both forges were the pilot's
       mirror with other tiles; their help ended on a choice of two written rules. Now each opens on an EXPERIMENT of
       its own (`GAME_WORLD.md` « استكشف »): 🔍 « أين نتوقّف » — planks tried in order on the gap he has just crossed
       (36), a plank and its partner crossing on a strip, then 30 and 60 predicted before trying; ⚡ « قواعد القسمة » —
       a chart of gaps, one plank at a time (5, 2, 9, 3), a LENS he chooses and the values he claims, the next hundred
       as the attack; plank 4 by « the same cells light in every hundred ». What he claims on the chart IS his rule:
       no tile after it. The stone's question (252) is no longer asked before he can answer: it opens the search and
       is the last step of the forge. New: `divisorIsles/inquiry.js`, `Inquiry.jsx`, `inquiry.css`, the lesson's
       `world/inquiries.js`; `RuleForge` phase « استكشف ». Walk: 124 checks, both experiments played through their
       screens. **Not validated by the owner yet — and no student has played it.**
       Then, on « not only this one … all the steps of rule discovery », the first two keys too: 🧱 « جداء عاملين »
       — the WALL (his first bridge lifted plank by plank and taken down by columns, then predicted: a bridge that
       held, one that fell, a square one, one he does not see); 🔑 « عدد طبيعي من الألواح » — the SAW (his hand
       slides the plank's length over the gap 31, the cut piece and the quotient live; then four planks judged from
       the quotient alone). Four keys, four kinds (`InquiryMoves.jsx`); no prediction of the old mirror is asked in
       this lesson any more; no help ends on a choice of two rules. Walk: 154 checks.
       Then four corrections of the owner on the chart, the same day: the chart that fills by itself is HEARD (a
       count, the cells that light, a chime — `engine/audio.js › sweep, spark`); it opens on its QUESTION and its GOAL
       in his words (« ما هي الهوّات التي يمكن تشكيل جسر لها باستخدام لوح طوله 5؟ » — « الهدف: معرفة تلك الهوّات فقط من
       شكلها، دون تقسيم طولها في كلّ مرّة »); his claim is laid as a sentence (the lenses in a column, the link — « يساوي » for
       5 and 2, « يقبل القسمة على » and ONE number for 9, 3 and 4 — then the
       values read downwards); every gap tried writes its division `n = q × b + r` and its cell turns GREEN when
       the rest is 0; the forge, which covers the top bar, shows the sound button and the ✕ in every phase
       (`kit/parts.jsx › SoundToggle, ExitLink`). Walk: 178 checks at the four sizes; lesson 1's walk (same forge
       header) 104 at 1366×768 and on the phone. Then two more: the claim reads right to left (the lenses on the
       right, the numbers on the left), and plank 4 is read with a lens of its own, « العدد المكوّن من الآحاد
       والعشرات » — its former side road (« the same cells light in every hundred », long gaps placed on the chart)
       is REMOVED: with that lens « no lens separates » would be false. Walk: 179 checks at the four sizes.
       **Not validated by the owner yet.**
     - NOT in lesson 2 by choice, to be said in the report: no real-world case world (S5); ten dash levels instead.
     - The walk is assembled from the pilot walk's helpers (copied, not shared): a shared helper module is owed.
- **D4 — DONE**: the five billing files are deleted.
- **Phase 0 step 2 — formatter DONE**: Prettier (`.prettierrc.json`, 120 columns) with `npm run format:v2`
  and `npm run check:format` (in CI). The pilot's areas are formatted: 109 files; `features/classSession/` went from
  2,229 lines to about 6,300 — its real size. After it: web tests, the seven laptop walks and the phone world walk give
  the same results as before. A new area enters the two scripts when
  its code is written or rebuilt; the rest of the tree is formatted lesson by lesson, never in one sweep.
- **Phase 0 step 3 — dead files DONE**: 49 files deleted (22 shared: the two unused geometry libraries and `useLabState`
  with their tests, eleven unused lab primitives, six unused components; 27 unused files inside 4AM lessons). After it:
  17,959 web tests, the build, `check:lessons`, the route and index checks pass. `npm run check:unreached` (in CI) now
  FAILS on any file the app does not reach; its `KEPT` list names six test helpers (the five billing files were deleted
  on 2026-11-17, decision D4). Unused exports, `apps/api` and `packages/core` are covered since 2026-11-17 by
  `check:unused`.
- **Tests at the commit**: web 18,067 and core 1,577 pass. API: 1,464 of 1,473 pass, 6 fail — `MathLabFileFlowTest` (the
  lock query; it fails the same way without this work's change) and five of `DbBackupCommandTest` (a command this work
  never touched; cause not investigated).
  9. [x] LESSON 3 `khawass-qawasim` (خواص قواسم عدد طبيعي) — DONE 2026-11-18, report `LESSON_3_GATE_REPORT.md` (the
     owner's validation remains; the old modules are DELETED, step 10). It prints ✅ on `status:lesson-v2`; its six walks
     pass at 1366×768, 1024×768 and 1840×900. Its four keys are FORGED on four NEW investigation kinds added to the kit
     (`join`, `stack`, `peel`, `letters`: `GAME_WORLD.md` « استكشف »). Open, for the owner: the proof key gives no evidence; the dash's sentence types; the 10.5–11.5 px text the
     kit still has at 1024×768 (shared with lessons 1–2). Done 2026-11-18: the Euclidean division (`2am.m1.r04`) is a core
     prerequisite of `4am.m1.r02` in the net, so lessons 2 and 3 launch with two tools (its family added); their launch
     walks must be updated and re-run.
  10. [x] THE OLD VERSION OF LESSONS 1–3 IS DELETED — 2026-11-18, on the owner's order (« for each lesson that is updated
     to the gaming version, delete the old version »). Trace of every reader, decisions and follow-ups:
     `OLD_VERSION_TRACE_2026-11-18.md`. Deleted: the 25 module pages (« إختبار أولي » included), the three
     `moduleContext.js`, the 20 `content/` files only the pages read (with their tests), the three mission scenes, the
     mission player keys of the three configs (`studentView`, `mission`, `lessonProblem`), `?view=classic` and the
     kit's link to it, the walk `lesson-kit/masail-pilot.mjs`. The module ids and numbers STAY as data (progress, the
     reports, the DB rows); every module address redirects to the home (`buildLessonRoutes › retiredModules`).
     `status:lesson-v2` now checks that the old version is gone (all three ✅). NOT run: any walk — nine older walks
     still open the deleted pages and must be re-targeted or cut (trace, follow-up 4); the pilot's story walk was
     edited to check the redirect.
  11. [~] THE DIVISION ROAD — 1AM `qisma-iqlidiya-baqi`, 1AM `qawaid-qabiliyat-qisma`, 2AM `qisma-iqlidiya-hasr`, built on
     the world « أرخبيل القواسم » (2026-11-18). In the tree (checked 2026-11-19): each has `lesson.pack.js` (world, knowledge
     from `world/knowledge.js`, coach, board), `world/` (19 files) and `board/`; their old version is deleted
     (`OLD_VERSION_TRACE_2026-11-18.md` §8); a class test each (`content/class-tests/{1am,2am}/`); « مختبري » got `bracket`
     for the 2AM lesson; the launch kit got the family `1am.m1.r01`. `status:lesson-v2` prints ✅ for the three.
     **COMMITTED AND PUSHED to `dev` on 2026-11-19, WITHOUT the walks** (the owner's word, step 15). The independent review of 2026-11-19 (step 14) found defects in
     all three — evidence claimed on wrong answers (hasr), keys 2 and 3 forged on the same experiment (qawaid), P3 told
     not discovered and key 2 already sealed inside key 1 (baqi), the textbook residue of their root files. The fixes are
     WRITTEN (step 14): qawaid's key 3 on `join` (OPEN for the owner: `GAME_WORLD.md`, note under the table of kinds), baqi's
     key 2 on the new kind `cycle`, hasr's key 1 on a blind `estimate` with three-digit planks — NOT yet verified by the walks.
  12. [~] THE BANK SERVED AS IT IS by every v2 sitting (2026-11-18): `gameworld/kit/bankSitting.js › createBankSittings`;
     each of the six lessons' `world/sitting.js` is one call to it (checked 2026-11-19); the exercises are those of
     `content/practice/<grade>/<id>/`, marked by the practice evaluator, evidence re-computed by the server. Report:
     `BANK_AS_IS_2026-11-18.md`. The generated sitting is deleted. The kit change is committed since 2026-11-19 (step 15, without the walks). Review fixes WRITTEN
     (2026-11-19): `cashDj` touches money only and converts « DA » glued to digits, on every shown string; an empty level is
     never sat nor passed; the clock hands in once; a sitting walk can choose its sheet (DEV hook `di.dev.sheet`). Owner,
     the same day: every copy is evidence, whatever happens (the « re-sat » rule written that morning was REMOVED). Still
     open: « تدرّب » generates exam-format questions (`CLAUDE.md`'s rule overstates it — owner's wording to decide).
  13. [ ] BATCH 2 — world content written for six lessons: 4AM `qasim-mushtarak-akbar`, `tayin-pgcd`, `bahth-pgcd`,
     `awwaliyan-fima-baynahuma`, `ikhtizal-kasr`, 1AM `ikhtizal-kitaba-kasriya` (`world/` only, 16–18 files each, all
     untracked; no `board/`, no pack — so `check:unreached` / `check:unused` flag them until their packs exist). **NOT
     FINISHED**: the review of 2026-11-19 found blockers (memo quizzes marking true answers wrong, evidence on wrong
     answers, rules told instead of found, the 1AM lesson forged on Euclid's algorithm, no `pgcd` claim kind) to repair
     BEFORE their boards and packs. They stay OUT of the batch-1b commit. **2026-11-19: the redesign of the five 4AM
     lessons is PROPOSED in `BATCH_2_DESIGN.md`** (every key with the experiment of its own nature; six new kinds and
     four new modes; lesson 4 first, alone, to « done »). **ACCEPTED the same day (« Go, full design »); lesson 4 is
     built (step 17); the other four 4AM folders and the 1AM one are still untracked drafts.**
  14. [~] THE INDEPENDENT REVIEW of 2026-11-19: the session of 2026-11-18 (steps 11–13) had been orchestrated by a weaker
     model; nine reviews (the three division lessons, lesson 3, the kit and its inquiry kinds, the walks' integrity, the
     satellites / deletions / docs, batch 2 in two groups) — record: `REVIEW_2026-11-19.md`. The fixes are WRITTEN by ten
     packages (each reported its own unit tests passing; the walks NOT re-run; committed without them on 2026-11-19, step 15): C the story's end completes the
     lesson (`kit/storyEnd.js`); E six claim kinds (`bracket` … `fraction`, JS + PHP + fixture); W the walks (12 px by
     default, every sheet of the bank, three one-tool launch walks, the lab plays `bracket` and `planks`); B the kit's
     inquiry kinds and the knowledge map's floor; A the sitting (« دج », empty level, one hand-in, `guardEvidence`); S the
     satellites and docs; K one knowledge source (no 🧠 map on a v2 home, the root textbook files deleted); L1 khawass,
     L3 qawaid, L4 hasr — each lesson's evidence, wording and experiments; plus the baqi agent (key 2 on `cycle`, the board's
     questions re-asked so the answer fills the gap). `LESSON_3_GATE_REPORT.md`:
     its sitting numbers are superseded and ~50 screenshots were never looked at — lesson 3's « done » is not met yet.
     Owner decisions raised: what completes a v2 lesson (taken as « the story's end »), the 31 final-test items that retire
     at the next deploy, the bank's « DA » rule, 18 net pairs « prerequisite taught later » (`LEARNING_NET.md` §8quater).
  15. [x] BATCH 1b COMMITTED AND PUSHED to `dev` — 2026-11-19, on the owner's word (« no test just commit and push »),
     WITHOUT the walks and without the six batch-2 folders (step 13, still untracked). Four commits: the shared work (the
     kit, the bank as it is, the claim kinds, the walks' library, the satellites, the docs), then one per division lesson.
     What WAS run that day, on the tree as committed plus the batch-2 folders: the web unit suite — 18,731 of 18,734 pass;
     two fail on a 5 s timeout under the load of the whole suite and pass alone (`lessons/lessonPack.test.js`,
     `lessons/registry.test.js`); the third is in the UNCOMMITTED batch-2 folder (`qasim-mushtarak-akbar/world/story.test.js`:
     its market's 208 is now a plank of `qisma-iqlidiya-hasr`) — and `npm run lint`, `npm run check:format`: both pass.
     **NOT run: `check:unused`, `check:unreached`, `check:lessons`, the core and API tests, and EVERY walk.** So the walks of
     the six v2 lessons at 1366×768, 1024×768 and 1840×900 and their screenshots are still OWED: until they pass, « done »
     (§6) is not met for lesson 3 and the three division lessons, and the review's fixes (step 14) are unverified in a
     browser. `main` was not touched.
  16. [ ] OWED: the walks of the six v2 lessons at the three sizes, their screenshots looked at, what they find fixed.
     **A first measure exists, at 1366×768 only** (a run the session before had left in the background, 2026-11-19
     10:16–10:43, on the tree that was pushed; it ran WHILE the unit suite and lint ran, and its last walks — the
     sittings of lessons 1–3 and the six launch walks — while agents had started editing source, so those are not
     trustworthy): **18 of 37 walks pass, 19 fail.** Pass: the hub of every lesson, the six boards, the story of `hasr`,
     `khawass` and the pilot, the trainers of `baqi` and `hasr`, the pilot's practice, the sitting of `baqi` (2,121
     checks). Fail, to re-run alone and sort into defect / walk fault / load:
     - screen defects: 11.5 px text on the pilot's mistake card (`gameworld-field`), 11.3 px « أدواتي » in « مختبري »
       (`lesson-lab`), a formula broken across two lines on a knowledge card of `qawaid` (its trainer walk), four bank
       sheets of `qawaid` that scroll sideways in the sitting (l1-006, l3-001, l4-001), the ✕ of `baqi`'s first forge
       leaving the world for `/espace/cours`;
     - walk faults or defects, not yet told apart: `gameworld-qawaid` (« URL is not a constructor »),
       `gameworld-qawasim-trainer` (« [c.kind] is not a function »), `gameworld-qawasim` (the third test of the next
       hundred writes no division), `gameworld-khawass-trainer` (a card read is not ticked), the sittings of `hasr`,
       `khawass`, `qawasim` and the pilot (a sentence of the bank missing from the paper, 30 s click timeouts), the six
       launch walks (they stop on reading a card).
     **THE CLEAN MEASURE, 2026-11-19 evening** — the 38 walks of the six older lessons at 1366×768, one at a time, on a
     FROZEN copy of the commit `919e2307` (the new kit: the instruction that stays, the card of the island before,
     turning round): **23 pass, 15 fail** (two more failed for reasons outside the lessons — the copy's server not yet
     up, a 30 s screenshot timeout — and pass when run again). None of the 15 comes from the new kit's three rules.
     Pass: the pilot's world, practice, sync, board and exam sitting (2,159 checks); lesson 2's world, hub, board and
     launch kit; lesson 3's world, hub, sitting (2,026) and board; `baqi`'s hub, sitting (2,121) and board; `qawaid`'s
     hub and board; the five walks of `hasr` but its launch kit. Fail:
     - REAL defects of a screen: four labels at 11.7 px on the pilot's mistake card (`gameworld-field`); « أدواتي » at
       11.3 px in « مختبري » (`lesson-lab`); a table of lesson 2's sheet `l5-005` drawn at 10.5–11 px in the sitting;
       three sheets of `qawaid` that scroll sideways (`l1-006`, `l3-001`); a formula broken across two lines on a
       knowledge card of `qawaid` (`know-card-ahad-memo`); the ✕ of the launch kit's memo not reachable (`baqi`,
       `qawaid`, `hasr`); the ✕ of `baqi`'s first forge leaving the world for `/espace/cours`.
     - faults of a WALK: `gameworld-qawaid` (« URL is not a constructor »), `gameworld-qawasim-trainer`
       (« [c.kind] is not a function »), `launch-kit-baqi` (it cannot read `\displaystyle 43 - 7`),
       `launch-kit-khawass` (it calls the 2AM lesson's title, a prerequisite shown on purpose, a foreign word).
     - not yet explained: `launch-kit` (the pilot: waits for « return to the lesson »), `gameworld-khawass-trainer`
       (a card read is not ticked on the map), `gameworld-baqi-trainer` (the mistake card's correction), two hint
       lines the sitting walk of lesson 2 does not find.
     **FIXED the same evening and re-measured on a frozen copy: 37 of 38 pass at 1366×768** (two of them on a second
     run, after a 30 s timeout of the page or of a screenshot). Of the 15: 6 were real defects of a screen (the mistake
     card's labels, a bank table under 12 px, sheets scrolling sideways, the launch memo's ✕ under its veil, a panel
     drawn one frame with the card before's state, « العودة إلى درس » hidden under the world) and 9 were faults of the
     walks themselves (ledger lines B19–B23, C10–C12 of `.claude/skills/lesson-v2/defects.md`). STILL FAILING, not
     explained: `gameworld-qawasim` (lesson 2's story) — intermittently, the third test of the chart experiment on the
     next hundred is read before its division is written (a different plank each run; it passed in the measure
     before). OPEN in shared code: `utils/bidi.js` isolates only part of an equality with an Arabic operand
     (« العرض × 14 = 56 » reads « العرض × 56 = 14 » on a bank hint). Owed still: the same walks at 1024×768 and
     1840×900.
  17. [x] LESSON 4 `qasim-mushtarak-akbar` — v2, 2026-11-19 (`LESSON_4_GATE_REPORT.md`): the first lesson of
     `BATCH_2_DESIGN.md`. Four keys on four kinds (`common` without the longest, `summit`, `deal`, `nest`); the old
     version deleted; its six walks pass at 1366×768, 1024×768 and 1840×900 (18 of 18 runs, then the six again at
     1366×768 and the story at 1024×768 on the final tree); status ✅ but the paused phone line. In the same work: **the
     world has twenty-two experiment kinds** (`summit`, `deal` played by lesson 4; `lists`, `sort`, `measure`, `part`
     and the modes `common/witness`, `nest/pair`, `ladder/fold`, `ladder/both` written and unit-tested for lessons 5–8,
     NOT yet seen in a browser); a forge case may be a SHARING, drawn as vases; a board `ask` step may carry its own
     words; the lab opened from the launch kit offers only instruments of earlier lessons; three card kinds got their
     icon; the forge's log offers every row while the mirror tests; a « PGCD(a ; b) » of the bank is drawn as a formula
     at display. Repo checks on the final tree: `npm run lint`, `check:format`, `check:lessons` (entry bundle 197.8 KB of
     212) pass; `check:unused` and `check:unreached` report ONLY the five untracked draft folders of step 13 (not
     committed); the web unit suite: 18,883 tests, 4 failures on the first run — two real (a lesson's id in a kit
     comment; two counters that could break in the new kinds), two 5 s timeouts under load — all four corrected, then
     re-run (the result is in the commit's message). NOT run: the core and API test suites.
  18. [x] THE PROJECT SKILL `.claude/skills/lesson-v2/` (owner, 2026-11-19: « a special skill for this project that is
     going to be more and more powerful », and that folder taken out of `.gitignore` « so it could go to github »):
     `SKILL.md` (the pipeline, walking a frozen copy while agents write, the closing step), `briefs.md` (one template
     per agent), `defects.md` (the ledger of every defect met so far, with the check that catches it, and the cost of
     each lesson), `review.md` (the design review and the screenshot review). A lesson is not done until what it
     taught is written back into it. Its first test is lesson 5. Not built yet: the shared walk library that would turn
     a lesson's six walks into data (the walks are the largest cost of a lesson: 690,000 of 2.9 million agent tokens and
     73 minutes for lesson 4) — planned after unit 1's lessons.
  19. [~] OWNER'S REDESIGN of 2026-11-19 (after lesson 4 was built; decisions taken the same day) — **the kit and
     lesson 4 are DONE (below); lessons 5–8 and the re-walk of the six older lessons are not**:
     - **For every game world (the kit)**: the current instruction is BIG and stays on screen until it is done — he may
       fold it and open it again; what matters from the previous island (the gaps crossed, the planks used, what was
       found) is shown on the RIGHT of the game; he can walk BACK — the camera turns with him (today the camera always
       looks along the road ahead, so the down arrow walks him towards the lens).
     - **Lesson 4, keys 1 and 2 are discovered ON THE ISLANDS, and the islands REPLACE the experiment screen of the
       mirror** (the mirror keeps the tiles, the test on what he did on the islands, the attacks, the seal): key 1 — he
       is told the two gaps ahead and that the planks he picks now build BOTH bridges, the next island having none: one
       plank fills neither, one only the first, one both; with the wrong one he walks back and picks again. Key 2 — the
       same with planks that all fill both; every plank costs the same and his purse only pays for the longest: with a
       shorter one the coins run out before the second bridge is finished.
     - **Lessons 5–8 are redesigned the same way** (a situation lived on the islands wherever one exists):
       `BATCH_2_DESIGN.md` §7, ACCEPTED by the owner the same day — the same gesture (a convoy with a purse) may carry
       several keys; seven keys (procedures, proofs) stay in the mirror; six new pieces of the world are to be built
       (the workshop's lists bench, a gap of 0 cells, a three-bridge convoy, the storm that cuts a gap, the sign of a
       fraction, a purse of steps).
     The six lessons already built change with the kit and are re-walked.
     **Built 2026-11-19 (contract: `GAME_WORLD.md` §2ter-1)** — the kit: `kit/Instruction.jsx` (the instruction, its fold
     button; the card « من الجزيرة السابقة »), turning round (`kit/WorldRuntime.js`: each press of « back » turns the
     view AND the robot, « forward » walks him the way he faces — the owner's control), the world's convoys and purse
     (`divisorIsles/Game.js`), a forge that opens on its tiles when its evidence comes from the world
     (`kit/RuleForge.jsx`), a pair of gaps drawn as two bridges in the mirror (`forgeParts.jsx`). Lesson 4: keys 1 and
     2 on the islands (planks 7, 11, 13, 9 for 198 and 234; planks 2, 7, 14 and 42 coins for 266 and 322), their
     forges without experiment or prediction, the walk playing the refusal, the turn, the walk back, the bridge going
     back, the purse running out and a reload on the island with no planks. **Measured**: the six walks of lesson 4 at
     1366×768, 1024×768 and 1840×900 on a frozen copy — 18 of 18 runs pass (the story 984 checks, hub 226, « تدرّب »
     542, the sitting 2,023, the board 184, the launch kit 227); `gameworld-khawass` passes at 1366×768 on the new kit
     (763 checks); `gameworld-baqi` fails at its first forge (the ✕ leaving the world — the failure already listed in
     step 16, not sorted). Known limits: the convoy and the purse are played only by the walks (no unit test of the 3D
     runtime); at 1024×768 a four-line instruction covers part of the island until he folds it or walks on; at
     1840×900 two pedestal numbers print over island A's name label; walking back, the road is his to steer (from an
     altar the straight line back misses the bridge).

  20. [x] **Lesson 6 `bahth-pgcd` — v2 (2026-11-19, 2 h 25 against 4 h 16 for lesson 5).** Five keys: ➖ `farq-yabqi`
     (a convoy of THREE bridges 152, 95, 57), 🪜 `khawarizmiyat-al-tarh` and 🔁 `iqlidis` (a workshop whose bench is the
     procedure's notebook, rows only), 🧮 `baqi-yabqi` (the fold, in its mirror), ⏱️ `aqall-khutuwat` (two notebooks,
     31 rows against 2); the store: lanes of 1176 and 868 cells. Walks on a frozen copy: story 819 checks, hub 238,
     trainer 478–496, board 181, launch kit 227 — pass at 1366×768, 1024×768 and 1840×900; the sitting (1,983 checks,
     every sheet) at 1366×768 only, run before the « تقدّمي » change. Reference lessons after the five shared changes
     (the bench's columns, a case's `head`, « تقدّمي » in 4 columns, the launch title that wraps, the board's rail):
     lesson 5's story, hub, board, launch kit and lesson 2's board pass. Looked at by the main session: eight screens.
     NOT done: the sitting's screenshots; the other older lessons after the shared changes. Seen and left: the hub's
     rule card of key 🪜 reads « 12 = 5 + 7 » where « 7 + 5 = 12 » was written (true either way); the workshop still
     says « قالب ». The repository checks ran on a worktree of the commit (result in the commit after this one if
     anything failed).

  21. [x] **Lesson 7 `awwaliyan-fima-baynahuma` — v2 (2026-11-20, about 1 h 30 of work against 2 h 25 for lesson 6), the
     first lesson built on the three tools made the same night:** the authoring kit `gameworld/kit/authoring/` (number
     helpers, the blocks of a mirror, eight shared test suites, `scripts/lesson-bank-numbers.mjs`), the shared walk
     `apps/web/e2e/lib/lessonWalk/` (a lesson's walks are ONE descriptor, `e2e/lessons/<id>.walk.mjs`: 59, 78 and 110
     lines for lessons 5, 6, 7), and the checks run on a worktree of the commit. Three keys: 🤝 `awwaliyan` (25 and 27:
     only the plank 1; 39 and 52: 13), ✅ `ithbat-awwaliyan` (the divisions end on 1 — its mirror keeps a two-round
     experiment; the last step ends on a yes/no conclusion), ❌ `shahid-wahid` (645 and 410: ONE plank is enough; 85 and
     119: none of the rules' planks, yet 17). The store: lanes of 105 and 74, the plank 1 against 35. New: the
     instrument « مِجهر العددين », the launch family `4am.m1.r03`, the claim option `commonDivisor … notOne` (client and
     server). Walks at 1366×768 (the ONE size): story 973 checks, hub 226, trainer 497, board 131, launch 237, sitting
     2,059 (every sheet), lesson-lab 79 — 0 FAIL. Looked at: 12 screens by the walks' agent, 2 by the main session.
     Kit fixes on the way: the bubble « اضغط E » no longer covers the world's answer; an opened workshop refreshes the
     instruction; long bridges are laid in about 7 s. In the tree and used by no lesson yet: lesson 8's world piece, a
     bridge with a marked stretch (`divisorIsles/mark.js`). NOT done: lessons 1–6 re-walked after the kit changes (one
     reference, lesson 6's story through the library, is owed); the lab still opens its new instrument before the first
     key (`earlierOnly` to wire in `kit/LessonWorld.jsx`); the six gaps the forges' agent found in the authoring kit;
     the findings of the kit on lessons 5 and 6 (bank pairs missed by their own reader, « 1003 خانة », « بقيت 15 خانات »).

  22. [x] **Lesson 8 `ikhtizal-kasr` — v2 (2026-11-20, about 2 h 05), on a NEW world piece: a bridge with a LIT STRETCH**
     (`divisorIsles/mark.js`; the council's verdict of 2026-11-19: fractions stay on the islands). The bridge is the
     fraction « lit cells over the whole »; planks hold only when a joint falls where the light ends; the bridge's sign
     is rewritten in planks. Four keys, all met on the islands: 🪜 `ikhtizal-marahil` (78 with 66 lit, built with 2 then
     6: 66/78 = 33/39 = 11/13), 🔒 `ghayr-qabil` (48 with 35 lit: only the plank 1), 🎯 `ikhtizal-pgcd` (99 with 66,
     243 with 189: a purse that only the longest plank pays), 🧾 `natija-mukhtazala` (39 lit in two strokes, 5 then 8).
     The store: 273 cells with 195 lit, the planks 3 and 39 — both hold; 3 leaves 65/91 and runs out of coins. New
     with it: a fraction typed over a REAL BAR in the trainer, the mirror's last step and the launch kit; the
     instrument « شريط الكسر »; the launch family `1am.m5.r02`; the claim `fraction … op` (the server computes a sum or
     a product of fractions itself); **the exam sitting shows an answer sheet too tall in PAGES** (3 of this bank's 50
     sheets were cut or at the limit) — a change of the shared sitting, re-walked on lesson 4 (2,123 checks, 0 FAIL).
     Walks at 1366×768: story 987 checks, hub 248, trainer 543, board 162, launch 190, lesson-lab passed, sitting
     2,201 — 0 FAIL. Looked at: 13 screens by the walks' agent, 5 by the sitting's agent, 6 by the main session.
     **Unit 1 has no ordinary lesson left on the mission player; only its integration lesson.** OPEN: the instrument
     writes 36/24 over a strip of 24 lit of 36 (a numerator greater than the denominator); after a walk back, the
     chip and the card at the top right still describe the island ahead; a save whose stage is beyond the road throws;
     the board cannot draw a lit stretch or a fraction card; the corrected copy of a sitting is not paged; lessons
     1–7's stories were not re-walked after the world changes of this lesson (one reference is owed).

  25. [x] **4AM unit 2, lesson 2 `natiqa-ghayr-natiqa` is v2 (2026-11-21)** — three keys built on what is NEW for him
     (design: `ROOTS_WORLD_PLAN.md` §12; the skill's §0ter): a terrace of courts he sorts by trying, a pursuit in
     fractions on the court of 2 (experiment kind `chase`), the middle mark that decides the rounded value. The world
     gained, for every lesson that uses it: several courts on a terrace, courts the world closes, the COUNT of a
     platform's tiles from above with each tile's number and a note, the length on both sides, the key of a court, a
     gate that stays « ؟ » until its count has ended (owner's remarks of the day, `play.md`). Walks at 1366×768, 0 FAIL:
     lesson 2 story 1731, hub 250, trainer 566, board 204, launch 226, sitting 2140, lab step 10; lesson 1 re-walked
     after the world's change: story 1994, hub 231, board 245, trainer 541; reference island lesson after the kit's
     trainer change: `ikhtizal-kasr` trainer 543.
     OPEN: `check:lessons` red on THREE shared textbook-coverage lines (« prep », « qcm », « ex-31 »); the old
     manipulation « square-root-side » is mounted by no lesson any more; lesson 1's launch, sitting and lab step were
     not re-walked after the world's change (they do not use what changed).
     STOP asked by the owner on 2026-11-21: « when you finish the lesson 2 stop, i have to do some changes before
     continue ». Lesson 3 `muadalat-x-murabba` has its DESIGN (`ROOTS_WORLD_PLAN.md` §13) and one experiment kind
     (`peel`) written as separate files and mounted in `Inquiry.jsx` as the kind `peel` on 2026-11-22 (so that `check:unreached` passes) — no lesson declares it, no student reaches it; nothing else of it is started.
  24. [x] **4AM UNIT 2 « الحساب على الجذور » — its world « قصر الساحات » and its first lesson `jidhr-tarbii` are v2
     (2026-11-21)**: a NEW world (`gameworld/rootCourts/`, contract `GAME_WORLD.md` §2ter-3, plan and council
     `docs/reports/ROOTS_WORLD_PLAN.md`), the owner's play remarks written as rules in the skill (`play.md`), three
     kit additions every world gets (the gate run `kit/GateRun.js`, the free view `freeLook()`, « قواعدي » with the
     tablet that flies to it). `status:lesson-v2 -- --lesson jidhr-tarbii` prints ✅; walks at 1366×768: story 1967 ok,
     hub 231, trainer 541, board 245, launch 226, sitting 2101 (50 sheets), lab step 10 — 0 FAIL.
     OPEN: `check:lessons` is red on TWO lines of the textbook-coverage check (« prep », « qcm »: shared with lessons 3–5,
     which still cite them; they close when those lessons are rebuilt); the lab is reachable before the keys (as in
     every lesson); the endless game of unit 1 still carries its own copy of the gate run; the island lessons' walks
     were re-run on ONE reference only (`bahth-pgcd` story) after the kit changes.
     NEXT: lessons 2–6 of the unit, in order (`natiqa-ghayr-natiqa` first), designed by `SKILL.md` §0ter.
  23bis. [x] **The integration lesson `wadiya-idmajiya-aadad` is v2 (2026-11-20)** — three missions on « جزيرة
     المهمّات », the exam door, the unit's recap, the endless game « سباق الأعداد »; old version deleted; its board (a
     mission on the board), its memo and its class test built the same day: `status:lesson-v2` prints ✅. State and
     limits: `INTEGRATION_LESSON_PLAN.md` §9, first blocks.
     UNIT 1 OF 4AM HAS NO LESSON LEFT ON AN OLD SYSTEM. Next asked by the owner: the endless game on this home.
  23. [~] **The integration lesson `wadiya-idmajiya-aadad` — step 1 of its plan: mission 1 as a playable PROTOTYPE
     (2026-11-20). STOP: the owner plays it** (`INTEGRATION_LESSON_PLAN.md` §6) — `http://localhost:5173/__qa/mission-1`.
     BEM 2022 (first written here as 2021 — a misreading of the annals' columns), the identical lots, in five stations: the story without its numbers (he sends the robot to count), his
     model of the situation rehearsed by the world on 12 and 8 crates (each missing or misread condition shows in what
     is built), the two goal sentences and their order, a bridge per step (the key of the unit, the divisions, then
     the world packs the 1188 and 528 crates in the lots he computed), the seal with the four habits and the paper as
     printed. Played end to end in a browser at 1366×768: 21 screens, none overflows, no page error; 7 looked at.
     Three defects seen and fixed (the first bridge showed the content of a lot — the next answer; « 3 + 1 » read
     reversed; the title too dark). NOT built: everything else of the plan (see its status line).
     Lesson 8's checks, on a worktree of its commit: lint passes; the web unit suite 19,057 of 19,058 — the sitting's
     new page counter could break onto two lines (fixed); `check:lessons` passes; the two reference walks owed after
     the world changes pass (lesson 6's story 1,063 checks, lesson 7's 973, 0 FAIL).

## 4ter. When each item of 4bis is done

| When | Items | Why then |
|---|---|---|
| **Today, before anything** | C6 commit the work · C4 decide: the exam sheet, the answer templates and « دج » become part of the v2 definition of done, their separate rollouts stop · B6 decide whether steps 3–4 of the class session are part of « done » (advice: no — build them on the pilot after unit 1) | they cost a decision, not work, and everything after depends on them |
| **Phase 0, with the kit** | A1–A6 · B3 free room in the entry bundle (before the navigation) · B1 one shared engine chunk and a loading screen · B2 the rule for texts, applied while the pilot is reformatted · B8 the content checks read packs (same work as A3) · C1 finish the pilot · C3 the recorder of a student's path (same data as A2: once the journey is saved on the server, time per stage comes with it) | each one shapes what a pack is; changing it after ten lessons means redoing ten lessons |
| **With the navigation rebuild** | B9 the guided tours: switch the outdated ones off now, rewrite them at step 4 of the navigation | they describe pages that step replaces |
| **During unit 1 (lessons 2–9)** | B4 one launch family per lesson, in the definition of done · B5 the unit's instruments, at the unit's first lesson · B7 the unit page and the unit's world become one thing, settled before the unit's last lesson · C3 one real student timed after lesson 2 | they are per lesson or per unit by nature; unit 1 is where the recipe is proven |
| **After unit 1** | B1 the measured weight budget per lesson becomes a CI check · B4 the launch kit's server side (its phases 2–4), if the owner wants the teacher to see it · B6 the class session's steps 3–4 on the pilot · C2 re-capture `/methode` on the finished unit | they need a finished unit to be measured or shown |
| **Before the term's prerequisites / before 3AM** | C5 the false prerequisites of the catalogue (they change the ORDER of section 7, so before the first prerequisite lesson) · C5 the weights of 3AM, then regenerate the order | the order is generated from the net |

## 5. Removing the old systems (dead code by design)

Keep a **retirement ledger** in `LESSON_V2.md`: one row per legacy system with the number of lessons still using it,
printed by the status script. The rule: **a legacy system is deleted in the same commit that converts its last user**,
never later.

| Legacy system | Deleted when |
|---|---|
| A lesson's old modules, vignettes, old tests | That lesson is converted (same commit) |
| Old Classroom Mode `lessons/common/classroom/` and « وضع القسم » | Every lesson has its board |
| Derived memo (`LessonMemoPage` rail, `MemoSections`) | Every lesson has a written memo |
| Old lesson-home sections in `LessonIndex.jsx` | Every lesson has the teacher card and a v2 student entry |
| « أستعدّ » modules | Every lesson has its launch kit |
| مبتدئ / متقدم lab modes | No lesson mounts a lab outside rounds |
| Mission player | Decision D3 |

Lessons outside this plan (1AM and 2AM lessons that are nobody's prerequisite) keep the old systems alive. The ledger
shows that plainly; the owner decides later whether they follow.

---

## 6. Definition of done for one lesson

1. Read the unit's sources and the learning net for the lesson; design the world mechanic to
   `MANIPULATION_DNA.md` (the student's hand controls the mathematical variable).
2. Build the pack: every part S1–S9 and T1–T4 of §1. Every rule is forged. The practice is the BEM exam sheet, every
   typed answer has its template, money is « دج » (decision C4: these three rollouts live here now). Content is the platform's own
   (independence from the book), respects Islam, money in « دج », people only as `KidFigure`, nothing scrolls,
   a formula never wraps, counters use the no-break space.
3. Delete what the lesson replaced (§5, first row).
4. `lesson-v2-status.mjs --lesson <id>` prints ✅; unit tests pass; the lesson's walk passes at 1366×768, 1024×768 and
   1840×900; `check:lessons` and `check:entry-budget` pass; lint passes.
5. Screenshots looked at with the eyes, student and teacher.
6. A new lesson is also published: status `available`, export/import, modules and exercises `published` locally.
7. Docs updated in the same task; progress line added to `docs/reports/LESSON_V2_PROGRESS.md`.
8. Commit `feat(lessons): <id> — v2`. Push only when the owner asks.

Who does what (owner, 2026-11-17): Fable orchestrates and codes only the 3D and a task judged complicated; the rest of
the code is written by agents on `opus`. No fixed cap on the number of agents; one heavy check at a time until two at
once have been tried in the terminal (root `CLAUDE.md` « Who does what, and working limits »).

**Who writes what** (recommendation, 2026-11-16; the owner asked whether an orchestrator model with a second model as
coder is safe). Phase 0 and, for every lesson, the design — the world mechanic, the forge, the board script — are done by
the main session itself: they need the whole context and a brief cannot carry it. A second model may write the bounded
parts once `LESSON_V2.md` and the status script exist: practice families, exam cases, class test, memo, tests, formatting.
Its work is accepted only when the main session has read the diff, run the status script and the walk, and looked at the
screenshots; a coder never certifies its own work.

---

## 7. The order

Generated in `docs/curriculum/V2_ROLLOUT_ORDER.md`: **174 lessons — 118 to rebuild, 56 new.**

| Stage | The term's lessons (new) | Their prerequisites (new) |
|---|---|---|
| 4AM الفصل 1 | 29 (0) | 16 (4) |
| 4AM الفصل 2 | 30 (0) | 10 (3) |
| 4AM الفصل 3 | 15 (0) | 14 (14) |
| 3AM الفصل 1 | 18 (6) | 11 (5) |
| 3AM الفصل 2 | 14 (8) | 4 (3) |
| 3AM الفصل 3 | 7 (7) | 2 (2) |
| 3AM, unit « البرهان » (not in the school progression) | 4 (4) | — |

Rules of the order:

- Inside a term, the school calendar's order; a unit's synthesis after its lessons.
- A term's prerequisites come after the term's lessons, core before support; a lesson is listed once, where it first
  appears. Prerequisites are the DIRECT ones of the learning net.
- The pilot is lesson 1 and is done; `qawasim-adad-tabii` is lesson 2 and belongs to Phase 0.
- Before 3AM starts: weight the 3AM links core / support, then regenerate the order.
- After a unit's last lesson: update its unit page (`pages/unit/unitMissions.js`).

---

## 8. Risks

- **Scale.** 173 lessons at the pilot's depth is very large even with the kit. The time measured on lesson 2 decides
  whether D2 (one world per unit) is enough or whether the parts list of §1 must be tiered.
- **Sameness.** A kit pushes every lesson toward one style; `MANIPULATION_DNA.md` forbids that. The kit owns the shell,
  never the mechanic.
- **Two experiences side by side** for months: converted lessons in v2, the rest in mission or classic. The unit page
  and the catalogue must not promise v2 where it is not built.
- **Bundle.** Entry is 199.2 KB of a 212 KB budget (since 2026-11-17; it was 242.5 of 245). Every kit module stays behind the lesson's lazy boundary.
- **No real student has been timed** on the pilot's full path. One timed session before lesson 5 is worth more than any
  review.

---

## 9. The fast pipeline, and the prompt for the next batch

Rewritten 2026-11-18, after the first batch (lessons 1–3 and the Euclidean-division lessons they stand on). The owner's
rules for speed: **a lesson is rebuilt FROM SCRATCH, so the old lesson is never read** — what it must teach comes from
`npm run lesson:brief -- <id>` (the learning net and the catalogue, 0.1 s: the الكفاءات, the learning points whose ids stay,
the core/support prerequisites and whether they are v2, what not to rebuild, where it is used later, the unit around it, and
**a digest of the exercise bank**: how many questions test each learning point (primary/secondary, by level), which answer
shapes and cognitive demands the student must produce, the situations, and typical asks per level — the weight of each key
in the design follows it);
**the exercise bank is used as it is** (`content/practice/<grade>/<id>/`, never regenerated sittings: `BANK_AS_IS_2026-11-18.md`);
**the design is shown ONCE for the batch** and the owner's « go » covers it; agents code, the main session orchestrates.

**The pipeline of a batch** (start each agent the moment its inputs exist, not when the whole wave ends):
1. `lesson:brief` for every lesson of the batch → ONE design page: per lesson, its keys (one experiment of its own nature per
   key — `GAME_WORLD.md` « استكشف »; reuse the kinds of the world — now fifteen —, add a kind only when none fits) → STOP for « go ».
2. Wave 1 (parallel): the kit's new kinds ∥ one agent per lesson for the WORLD content (story, practice, trainer, journey,
   evidence, knowledge; the sitting is the bank).
3. Wave 2 (parallel, each as soon as its inputs exist): forges + inquiries per lesson ∥ board + memo per lesson ∥ ONE
   satellites agent for the batch (class tests, launch families, « مختبري »: shared registries) ∥ walks per lesson.
4. The main session: packs, `generate:lesson-index`, repo checks, then the walks at 1366×768, 1024×768 and 1840×900 —
   ONE heavy run at a time, from one runner script — and the screenshots with the eyes.
5. The old version of each finished lesson: trace of its readers, then delete (`OLD_VERSION_TRACE_*.md`; owner's order).
6. One gate report per batch, one commit per lesson (`feat(lessons): <id> — v2`). Never push.

**Batch 2 — the rest of unit 1** (`aadad-tabiiya-natiqa`), in this order; all on `divisor-isles`:

| # | Lesson | Must teach (from the brief) | Sketch of its keys (to confirm at the design stop) |
|---|---|---|---|
| 4 | `qasim-mushtarak-akbar` | common divisors of two numbers; PGCD(a ; b) and its notation; a sharing in identical bouquets read with common divisors; the common divisors are the divisors of the PGCD | the planks that hold BOTH gaps (a new kind, `common`: two strips); the longest of them; the equal bouquets; the divisors of the PGCD |
| 5 | `tayin-pgcd` | PGCD by listing the divisors; PGCD(a ; a) = a, PGCD(a ; 0) = a…; PGCD(a ; b) = b when b divides a | `common` again on lists; the special cases (a mirror alone); « b divides a » |
| 6 | `bahth-pgcd` | PGCD(a ; b) = PGCD(b ; a − b); the subtraction algorithm; PGCD(a ; b) = PGCD(b ; r); Euclid's algorithm; comparing them | `join` (the difference keeps the common planks); a new `ladder` kind (repeat until nothing is left); `peel` (the remainder); the comparison of the steps |
| 7 | `awwaliyan-fima-baynahuma` | recognise coprime numbers; prove they are coprime by computing the PGCD; prove they are not by a common divisor | PGCD = 1 (`common`); the proof by the algorithm; the counter-example |
| — | `ikhtizal-kitaba-kasriya` (1AM, core for 8) | reduce a fractional writing (`1am.m5.r02`) | by common divisors of the two terms (`common`, 1AM numbers) |
| 8 | `ikhtizal-kasr` | the irreducible form of a fraction; reduce by successive common divisors; reduce with the PGCD; the result of a calculation as an irreducible fraction | planks over two gaps: k and l planks make the fraction k/l; irreducible when coprime — the world's story must fit fractions: a design question |
| 9 | `wadiya-idmajiya-aadad` | the unit's integration situation, as three missions — **its own plan, accepted by the owner on 2026-11-19: `INTEGRATION_LESSON_PLAN.md`** | NOT a lesson of keys and NOT part of this batch: built AFTER lessons 4–8 are v2 (below) |

**The last lesson of every unit** (« أدمج تعلّماتي ») is not built by the pipeline above. It is the unit's three missions on
the BEM's integration situation (`INTEGRATION_LESSON_PLAN.md`: what the 19 BEM papers ask, the stations of a mission, the
engine and its scenes, the order of work). It comes last in its unit: for 4AM unit 1, once lessons 4–8 are v2 and committed,
starting with mission 1 as a playable prototype the owner plays. It is designed and coded by Fable (owner, 2026-11-19).

Kit work this batch needed: `common`, `ladder`, `nest` — written 2026-11-18 (the world now has fifteen kinds). Before the batch:
the bank adapter of `BANK_AS_IS_2026-11-18.md` must be done, so no lesson generates a sitting. **Done in code 2026-11-18**
(`kit/bankSitting.js`; the six v2 sittings switched; their sitting walks not re-run — see that report).

```text
Build batch 2 of the v2 rollout: the lessons of the table above (NOT `wadiya-idmajiya-aadad`: it comes after them, by INTEGRATION_LESSON_PLAN.md). Lessons 1–3 and the 1AM/2AM Euclidean-division lessons are
DONE (print ✅ on `npm run status:lesson-v2`); lesson 3 `khawass-qawasim` is the reference for how a lesson is built on the kit.

DO NOT read the old lessons (they are rebuilt from scratch). READ ONLY: CLAUDE.md; this §9; `npm run lesson:brief -- <ids>`;
GAME_WORLD.md « استكشف » (the fifteen kinds); and, for the agents you brief, LESSON_V2.md, the reference lesson's `lesson.pack.js`,
`world/` and `board/`, and LESSON_3_GATE_REPORT.md (what the walks found).

STEP 0 — `git status`, `git log -5`; work on `dev`; never push, never merge to main.
STEP 1 — the design page for the batch (the table above, confirmed or corrected): for EACH key its own nature of discovery,
the kit kinds to reuse or add, each lesson's story and numbers (own contexts, own numbers, own wording; never the book), its
board. STOP and wait for the owner's « go » — once for the batch.
STEP 2 — the pipeline above. Agents on `opus` write the code; you orchestrate, review, run the checks and the walks.
STEP 3 — per lesson: `npm run status:lesson-v2 -- --lesson <id>` ✅, its walks at the three sizes pass, its screenshots looked
at (say which you did not look at), the old version traced and deleted, the exercise bank served as it is, published locally
(lesson `available`, modules and exercises `published`), `docs/reports/BATCH_2_GATE_REPORT.md` (real time from git, lines
written, what was copied, what failed, what is open for the owner), commit `feat(lessons): <id> — v2`. STOP: the owner validates.

WORKING LIMITS: Fable orchestrates, opus codes (the 3D excepted). Walks draw on the GPU; ONE heavy run at a time; check
`uptime` and `free -m`; never edit source while a walk runs; use ONE runner script for the walks. Every task ends with the
docs updated and a « Documentation Sync » section. Report honestly: what failed, what you did not run or look at.
```
