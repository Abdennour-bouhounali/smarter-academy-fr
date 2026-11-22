# The pilot prototype — what changed, and how to roll it out to every lesson

> **Status (2026-11-08): VALIDATED — this file is the rollout plan.** The owner validated the pilot `qasim-adad-tabii` (4AM, unit 1,
> lesson 1) on 2026-11-08 and asked for the other lessons to follow it, one by one; every change made on the prototype is now a
> BINDING rule for all later updates and new lessons. Progress and notes per lesson: `docs/reports/MISSION_ROLLOUT_PROGRESS.md`
> (first conversion: `qawasim-adad-tabii`, the `factor-pairs` lab — it settled open item §9.6 for that lab family).
>
> **Authoritative detail lives in the guide and the contracts** — this file links to them instead of repeating them:
> `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` §4sexies (focus view) and §4septies (mission mode, player, every pilot rule),
> `docs/architecture/MANIPULATION_CONTRACT.md` (rounds, stars, second chance, slim column, mission in big),
> `docs/architecture/KNOWLEDGE_MAP.md` (A.3 finger, A.4 open map, A.12 readable map, Part B removed),
> `docs/architecture/NOTEBOOK.md` (« قاعدتي », saved answers), `docs/architecture/CLASSROOM_MODE.md` (paging rules),
> `docs/reports/MISSION_PLAYER_PLAN_2026-11-04.md` (player stages), `docs/reports/STUDENT_FOCUS_VIEW_2026-11-03.md` (focus numbers).

---

## 0. How to use this file

1. Read §1 (the owner's rules) — they decide every doubtful case.
2. Read §2 (old vs new) to know what a student of a NOT-yet-converted lesson sees today, and what they must see after.
3. Read §3 to know, feature by feature, what is SHARED (comes for free once a lesson is switched on) and what must be
   WRITTEN per lesson.
4. Convert a lesson with the checklist of §5, verify with §6, avoid the traps of §7.
5. §9 lists what is still open: settle those with the owner BEFORE the big rollout.

---

## 1. The owner's rules (binding, collected over the pilot)

| # | Rule | Date / source |
|---|---|---|
| R1 | **Pilot first, rule after validation.** Nothing of the prototype goes to another lesson before the owner validates. | 2026-11-07 |
| R2 | **Reduce what shows at once, never delete.** Whatever leaves the student's screen stays reachable (fold, dialog, button, its own screen). | 2026-11-04 |
| R3 | **No scrolling anywhere in the lesson-game.** One unit per screen; tall units are paged; size fitting is the last resort. | 2026-11-04 |
| R4 | **One size for similar elements across the lesson** (zoom depends on the screen, never on a screen's content). | 2026-11-04 |
| R5 | **A settled screen never moves** (new content never shrinks or shifts what is already there). | 2026-11-04 |
| R6 | **Discover before being told**: action (lab) first, then questions on what the student did, then the name. | 2026-10-14, kept |
| R7 | **Gen Alpha reads little**: one sentence, big text, tap rather than type, no « read more » inside the player. | 2026-11-03/04 |
| R8 | **The teacher view and Classroom Mode never change** (`isMissionView` / `freeNavigation`). | 2026-11-03 |
| R9 | **Never build the student game on Classroom Mode** (it unlocks everything and stops writing completion). | 2026-11-04 |
| R10 | **A test that corrects nothing before its result gives a SIGNAL per answer, never the right answer.** | council 2026-11-07 |
| R11 | **Easy first**: diagnostics climb from very easy to harder (« شعور النشوة والذكاء »). | 2026-11-07 |
| R12 | **The gesture is learned once, then it becomes a button** (only round 1 is done by hand). | 2026-11-04 |
| R13 | **Stars reward play (predictions, few trials), never typing speed or first-try answers.** | council 2026-11-07 |
| R14 | **Privacy of minors**: in-lesson answers are private to the student; only « قاعدتي » goes to the notebook (teacher may read). No AI chat, no data to third parties. | councils 2026-11-07/08 |
| R15 | **The knowledge map is totally open** and is only the interactive mind map. | 2026-11-08 |
| R16 | Respect Islam, book independence, KidFigure for people, tablet/laptop only — unchanged (root `CLAUDE.md`). | standing |

---

## 2. Old version vs final prototype (what the student sees)

| Area | Old version (every other lesson today) | Final prototype (`qasim-adad-tabii`) |
|---|---|---|
| **Lesson home** | Long page: skills twice, prerequisites, labs list, full problem, 8 described module cards. | `MissionHome`: opening scene of the mission (« مكتبة 756 كتابًا »), « 🧭 راجع قبل أن تنطلق » (prerequisite lessons, one-click return), ONE « واصل », the mission path, practice entry. Details in a dialog. |
| **Navigation** | Scrolling module pages, header + sidebar. | `MissionPlayer`: full window (portal, z-35), mission bar on top, « السابق · dots · واصل » at the bottom, NO scroll; ✕ back to the mission. |
| **Mission bar** | — | Mission title (opens the statement), 4 tool coins (= the 4 knowledge items, light up when earned), ⭐ total, « n من 8 », « 🧠 بطاقتي », « 📓 كرّاسي », « الخريطة » (mission path). |
| **Mission path** | — | One station per module with the REAL lock; 🏆 on the climax (the مسألة); last station « 📝 التمارين » (practice hub), locked until the final test is done. |
| **Steps** | All steps visible, « not tried yet » lines, to-do paragraphs. | One step per screen; done steps collapse; « واصل » leaves a step only when done. |
| **« أستعدّ »** | Intro card + all questions on one page + « عرض نتيجتي » + full list of corrections. | 5 s notice → 10 questions easy→hard, one per screen, « 🤔 غير متأكّد », 1 s undo, signal ✓ / « سنعود إليه » (never the answer), auto-advance, auto result; one-screen review (score, tappable circles, ONE priority lesson to revise). |
| **Labs** | One lab with a « مبتدئ / متقدم » switch, instructions above, results box below. | ROUNDS with 1–3 ★ (`LabRounds`); game layout (scene across the width, slim side column); mission shown big in the column; three questions per round beside the pitch (predict → observe by tapping → build the equality); trials table inside the lab; « أنشئ الفرق » after round 1; free pitch with bounded choices; the second chance « لا بأس — جرّب أصغر »; the lab door (« العب الجولة 3 ») and the way back (« عُد إلى السؤال »). |
| **« رتّب أفكارك »** | A separate organizer step after the lab. | Removed in the player (`IdeasOrganizer.jsx` deleted); the trials table replaces it. |
| **Knowledge cards / rule** | Bricks with full bodies. | « أتوقّع القاعدة »: the student writes the rule; on reveal it becomes a « قاعدتي » note in كرّاسي (teacher may read). |
| **Answers** | Lost on reload (local state only). | Saved and restored, synced and private (`student_lesson_answers`), chip « ↺ إجابتك السابقة · date ». |
| **Application** | Textbook-style questions. | + « ورقة سلمى » (find and fix an invented classmate's error) at the end of module 2. |
| **« مسألة »** | Long page. | Each sub-step on its own screen, full question in the header, « 📜 نصّ المسألة » dialog on every screen. |
| **Final test « إختبار أولي »** | 3 tabs (التحدي النهائي / نتيجتي / الحوصلة), brief, optional timer (BROKEN), 5 questions on one page, one submit, list of corrections. | 5 s notice → one question per screen (same play as أستعدّ), optional timer chip that WORKS, auto result on one screen (score + circles → corrections) → « نتيجتي حسب الكفاءات » on one screen (skill cards ✓/~/✗, « مراجعة المحور n », badges, server status in a dialog); « السابق » goes back to the result; no tabs, no « الحوصلة ». Same single submit, same evidence. |
| **Knowledge map** | Unlocked module by module; old stratified list + progressive map; drawer; hidden inside the game. | ONLY the interactive mind map + « المعارف مفصّلة »; totally open; opened from the bar FULL WINDOW on the explore view; 👇 finger on the first card; text scaled with the screen (×1.15–×1.5); side card widened into free space. |
| **Sound** | Lab sounds only. | `playSfx` everywhere (off until « الصوت » is on): neutral pop in tests, correct/wrong in questions. |
| **Teacher / Classroom** | — | Unchanged (R8). |

---

## 3. Feature catalogue — shared vs per lesson

Legend — **Shared**: code that needs no lesson work. **Per lesson**: what the converting agent must write. **Pilot gate**: the
condition that keeps a feature pilot-only today.

### 3.1 The switch and the mission data
- **Switch:** `studentView: 'mission'` + `mission: {…}` in `lesson.config.js` (literals; read by `validate-lessons.mjs`).
  `isMissionView(studentView, viewer, classroom)` = mission AND not `freeNavigation` AND not Classroom Mode.
- **Per lesson — `mission`:** `title`, `opening { text, cta }`, `tools: [{ id: <knowledge item id>, icon, label }]`,
  `climaxModule` (the مسألة that IS the mission), `checkpoints: [{ id, afterModule, prompt, options, correct, explain }]`
  (formative, asked on arrival, must NOT solve the climax). Guide §4septies « The data ».
- **Per lesson — `knowledgeMapOpen: true`** (R15). Keep `knowledgeMapMode: 'progressive'` (the gate checks it).
- **Per lesson — `lessonProblem`** (the « مسألة الدرس » the mission points to).

### 3.2 Entry: mission home, revise first, return
- **Shared:** `MissionHome`, `ReviseFirst` (reads `prerequisiteLessonCodes` from the catalogue), `ReturnToLessonButton` +
  `returnToLesson.js` (sessionStorage `smarter_return_to`), details dialog, practice entry.
- **Per lesson:** a drawn SVG scene for the mission (the pilot draws a library — code, never a generated image) and correct
  `prerequisiteLessonCodes`.

### 3.3 The player (no scroll)
- **Shared:** `MissionPlayer`, `FitToArea` (`uniformZoom`, `fixedZoom`, `keepInPlace`, `SETTLE_MS` 700, `shrunkALot` < 70 %,
  `useFitRefit`), `ClassroomPaged` through `PagingContext` (`deepBlocks`, `onePerPage`, `isDecor`, `data-paging-keep`,
  MutationObserver on host + block containers + ancestors, `s.small` relocation), `missionPlayerContext.js`
  (`InMissionPlayerContext`, `MissionUnitNavContext` + `useDeclareUnitNav`, `MissionAdvanceContext` + `useAutoAdvance`,
  `FitRefitContext`, `LabJumpContext`, `MissionAreaContext`).
- **Per lesson:** nothing, IF every module uses the kit (`ContentModule`, `GuidedProblem`, `PrerequisiteDiagnostic`,
  `BossFinal`). A hand-built module must be brought onto the kit first.

### 3.4 Mission bar and path
- **Shared:** `MissionBar` (coins read `learnedItems`, never the open map; « 🧠 بطاقتي » → `openMap({ expanded: true })`;
  « 📓 كرّاسي » for signed-in users; below 1280 px icons only and « n من 8 » folds), `MissionMap` (+ « التمارين » station when
  `isPracticeActive(lessonId)`), `MissionCheckpoint`, station welcome « أنت هنا ».
- **Per lesson:** the tool icons/labels (3.1).

### 3.5 « أستعدّ » v2
- **Shared:** `PrerequisiteDiagnostic` player branch, `TimedNotice` (5 s, `diagnostic.playIntro`), `DiagnosticPlayQuestion`
  (`UNDO_MS` 1000, `SIGNAL_MS` 900, doubt, lock, `q.order` for shuffled options), `DiagnosticReviewCompact`, auto-submit.
- **Per lesson — `content/prep.js › PREP_LADDER`:** 10 questions written by the platform (`addition('prerequisite_diagnostic')`);
  skills ALTERNATE and each climbs; the first three near-certain wins; at least one true and one false; levels never go down;
  `content/prep.test.js` recomputes every arithmetic claim; `skills.<key>.lesson` = the lesson to revise for that skill.

### 3.6 Labs in the player
- **Shared (any shell-based lab):** game layout (`ManipulationShell` ≥ 900 px: scene across the width, slim column), « mission in
  big » in the column (no gate; a first touch flashes the mission), `LabCoach` « ؟ » icon, props `sidePanel`,
  `hideRepresentation`, `onIntroChange`, `gameColumn`; `LabRounds` + `roundsModel` (rounds, stars, unlock, resume, best stars in
  `scopedStorage smarter_stars_<lessonId>`, win card with « عُد إلى السؤال », the second chance).
- **Shared engine for questions v2:** `labCheckpoint.js` kinds `fill` (chips) and `build` (tiles into slots), widgets in
  `LabCheckpoint.jsx`.
- **LAB-SPECIFIC — only `TeamBuilder` has it today:** the prediction tray, the observe/build chains (`CHAINS_PLAYER`), the trials
  table, one row of pitches (`repeat(k)`), bench in groups of 5 below, `resultNode` in the scene, `coachOf({ button })`, bounded
  free-pitch choices. **Every other lab used by a converted lesson needs the same treatment** — the biggest piece of rollout
  work (§5 step 6, §9).
- **Per lesson — rounds:** `content/<lab>.js › M<n>_ROUNDS = [{ id, title, goal, stars: { maxTrials, predict? }, props, easier?,
  optional?, free? }]`; only round 1 by hand (`handDone` after); a challenge round (`optional`); a free round (`free`, bounded
  choices that keep one row of scenes); `easier: practice(total, groups, choices, exact, lead)` on hard rounds (≥ 2 misses offers
  it, never 1). Goals: `{ checkpoint }`, `{ exact }`, `{ allExact }`, `{ inexact }`.
- **Per lesson — module wiring:** `<PlayerSwitch player={<LabRounds …/>} page={<Manipulation …/>} />` in the module `intro`;
  steps that wait for a round declare `needsRound: { id, label }` (door, soft gate and way back are then automatic).

### 3.7 Module content
- **Focus view** (implied by mission): `MoreToggle`, one step per screen, folded evidence lists — shared (§4sexies).
- **« أتوقّع القاعدة » → « قاعدتي »:** shared (`PredictRule`, `ruleNoteOf`). **Pilot gate:** `useRuleToNotebook` = student +
  token + `studentView === 'mission'`.
- **Saved answers:** shared (`answers/*`, kit questions, `GuidedProblem` key `gp:<id>`, `WrittenAnswer`, `PeerSheet` key
  `peer:<id>`). **Pilot gate:** `useSavedAnswersOn` = student + token + `studentView === 'mission'`. The backend serves every
  lesson already.
- **« ورقة زميل »:** shared `kit/PeerSheet.jsx`. **Per lesson:** `content/peerSheet.js` — an invented classmate (`KidFigure`,
  girls in hijab), a 3–5 line worked solution with ONE error on the lesson's main misconception, 3 fixes each with a `why`,
  `fixedLines` for the lines that follow from the error, numbers COMPUTED; placed after the name.
- **« مسألة »:** shared (`GuidedProblem` player rules, `ProblemSheet`).

### 3.8 Final test « إختبار أولي »
- **Shared:** `BossFinal` player branch (`TimedNotice` `boss.playIntro`, `DiagnosticPlayQuestion`, `TimerChip`,
  `BossReviewCompact`, `PlayerProfile`, `UnitBack` → back = result). Grading, evidence and attempt untouched (one `submitBoss`).
- **Per lesson:** nothing beyond the existing `epreuves` / `skills` (`skills.<key>.module` feeds « مراجعة المحور n »).

### 3.9 Knowledge map
- **Shared — ALREADY APPLIED TO EVERY LESSON:** stratified map deleted, always the mind map; `readZoom` and the wider side card in
  full screen; full window inside the player; the 👇 finger on the first card (§9: owner may want it pilot-only).
- **Per lesson:** `knowledgeMapOpen: true` (3.1); `learnedItems` keeps coins and « أتوقّع القاعدة » honest automatically.

### 3.10 Sound
- **Shared:** `playSfx` (`pop`, `correct`, `step`), silent until « الصوت » is on. Tests use NEUTRAL sounds (R10).

### 3.11 Backend (built for every lesson)
- `student_lesson_answers` (migration `2026_11_07_000001`), `StudentLessonAnswersController` (`GET/PUT
  /lessons/{code}/answers`, `learner` group), model hides `answers`, tests `StudentLessonAnswersTest`. Production needs
  `php artisan migrate`.

---

## 4. Councils held during the pilot (decisions to keep)

| Topic | Owner's choice |
|---|---|
| « أستعدّ » feedback | Signal only (✓ / « سنعود إليه »), doubt tap, 1 s undo, one priority revise card; 10 questions easy→hard. |
| Questions during the lab | Column beside the pitch (no shade); predict → observe by tapping → build the equality; trials table in the lab; stars for play. |
| Lab mission card | No dark backdrop, mission big in the column, no gate (first touch flashes it), mission text = the round's real gesture. |
| Lab side column | Slim column: one goal line (tap → big mission), « ؟ » coach icon, big « أنشئ الفرق », small « إعادة »; sound/title/badge hidden in the player. |
| Round 3 space | Bench below the pitches in groups of 5; one row of pitches; result inside the scene. |
| Locked step | Soft gate + door + way back (never walk back through screens). |
| Saving answers | Synced and private + « قاعدتي » to the notebook (teacher may read, 2026-09-24 rule kept). |
| Competitor review | Take: second chance in the lab, « ورقة زميل ». Reject: narrated lecture, AI chat, choice-only game. Later: per-option misconception feedback, read-aloud « 🔊 », strip of collected ideas. |
| Knowledge map in the player | Coins as the entry (card first, full map one tap away) — NOT built; the bar buttons were built instead (§9). |
| Knowledge map UI/UX | Fix math direction, real full screen (done), fit to one screen, one-line side card, remove duplicate hint / counters / « المحور » footer, column mode — only full window and readability were built (§9). |

---

## 5. Converting one lesson — the checklist

Order matters; commit after each lesson (`feat(lessons): <id> — mission prototype`), as the owner asks.

1. **Read** the lesson: config, modules, labs used, knowledge items, final test, practice status.
2. **Kit only:** every module is a kit module (`ContentModule`, `GuidedProblem`, `PrerequisiteDiagnostic`, `BossFinal`); convert a
   hand-built page first.
3. **Config:** `studentView: 'mission'`, `mission {…}` (3.1), `knowledgeMapOpen: true`; check `prerequisiteLessonCodes`,
   `lessonProblem`, `climaxModule`.
4. **Mission scene:** a drawn SVG for the mission (like the library).
5. **« أستعدّ »:** `content/prep.js › PREP_LADDER` (10, easy→hard, alternating skills) + `prep.test.js`; `skills.<key>.lesson`.
6. **Labs**, for each lab of the lesson:
   - write its rounds (round 1 by hand, then `handDone`; a challenge; a bounded free round; `easier` on hard rounds);
   - wire `PlayerSwitch` + `LabRounds`, `needsRound` on the steps the rounds open;
   - if the lab is not `TeamBuilder`, give it the v2 treatment (prediction, tap-to-observe `fill`, `build` the relation, trials
     table, scene sized from `useMissionArea`, layout that keeps ONE screen) — and get the owner's eyes on the first one.
7. **Drop the « رتّب أفكارك » step in the player** (the trials table replaces it); keep the page content for the teacher.
8. **« ورقة زميل »:** one sheet after the name, on the lesson's main misconception.
9. **Checkpoints** between modules (formative, never solving the climax).
10. **Pilot gates:** `useSavedAnswersOn` and `useRuleToNotebook` already follow `studentView === 'mission'` — nothing per lesson.
11. **Run** `npm run generate:lesson-index` if modules changed, then §6.
12. **Docs:** add the lesson to a rollout progress table (create `docs/reports/MISSION_ROLLOUT_PROGRESS.md` with the first
    lesson); update the guide only for a NEW reusable pattern.

---

## 6. Verification (definition of done for a converted lesson)

**Commands** (repo root unless noted):
- `cd apps/web && npx vitest run src/lessons` — all green.
- `npm run check:lessons` — passes (includes the entry budget ≤ 245 KB gzip).
- `node apps/web/scripts/lab-rollout-status.mjs --lesson <id>` — ✅.
- Backend touched: `cd apps/api && php8.4 artisan test --filter=…` (php8.5 lacks `pdo_sqlite`).

**Browser walk** (Playwright with a mocked student session, §8) at **1366×768, 1024×768 and 1920×1080**, screenshots reviewed
WITH THE EYES:
- [ ] home is `MissionHome`; « راجع قبل أن تنطلق » lists the right lessons; the return button works;
- [ ] « أستعدّ »: 5 s notice, Q1 directly, signal per answer, auto-advance, auto result, one-screen review;
- [ ] every module: one unit per screen, nothing scrolls (`data-fit-overflow` absent), same text size across screens;
- [ ] each lab: rounds and stars, mission in the column, the three questions, trials table, door / way back, second chance after
      2 misses (never after 1), practice round returns to the real one;
- [ ] « ورقة زميل »: wrong-line message, 2-try fallback, wrong-fix `why`, corrected sheet, restore after reload;
- [ ] saved answers restore after a reload with the device copy cleared (server path);
- [ ] final test: notice, one question per screen, timer chip counts down, auto result, circles open corrections, profile
      screen, « السابق » returns to the result;
- [ ] knowledge map from the bar: full window, explore view, finger, readable text, every node openable;
- [ ] mission path: real locks, « التمارين » locked then open;
- [ ] **teacher view and Classroom Mode unchanged** (capture both, compare with before).

---

## 7. Traps met during the pilot (do not fall in again)

**Player and layout**
- A component that RENDERS the player (it sits above it: `PrerequisiteDiagnostic`, `BossFinal`, `ContentModule`) cannot use
  `useInMissionPlayer()` — always false at its level. Decide with `isMissionView(...)` + mission config. A child rendered inside
  (`UnitBack`, `AutoAdvance`) can use the player contexts.
- `useDeclareUnitNav(nav)` needs a MEMOIZED `nav` and `canNext: true` (undefined disables « واصل »).
- Decorative children (`aria-hidden`, absolute/fixed layers) made empty first screens → `isDecor`.
- New content shrank a settled screen → settle + `keepInPlace`; a transition at settle animated every screen twice → none.
- Labs stuck small: a tray column wrapped the pitches (→ `sidePanel`), the pitch grid wrapped (→ `repeat(k)`), the screen settled
  while the mission was big (→ `useFitRefit`), the bench beside the pitches crushed them to 31 px (→ bench below, groups of 5).
- Knowledge cards crushed a question to zoom 0.6 → MutationObserver on block containers + ancestors, `s.small` relocation.
- The player keeps a hidden measuring copy of the content: tests click `:visible` elements only.
- A screen designed as one unit needs `data-paging-keep` (the peer sheet was split task / sheet).
- Overlays inside the player use the WINDOW, not the page content box (the hidden sidebar left a strip beside the map).

**Data and state**
- Opening the knowledge map lit every tool coin and skipped every « أتوقّع القاعدة » (both read the map's `items`) → "learned"
  readers use `learnedItems`; `unlockedModules` stays the real progression (mastery overlay reads it).
- The memo card of a module keeps only its module's items when the map is open.
- `useSavedAnswer` used the strict `useKit()` and crashed outside `ContentModule` → read `KitContext` optionally.
- Auto-advance timers cancelled on re-render → keep `advance` in a ref (`useAutoAdvance`).
- The final-test timer never started: `setEnabled(true)` then `start()` in one click read a stale `enabled` → ref in
  `useCountdownTimer` (fixed for every lesson).
- Batch clicks in scripts registered only the last one → click sequentially; a dialog intercepted clicks → seed answered state.
- Content files read by node checkers need `.js` in relative imports (`./teams.js`).

**Backend and tooling**
- PHP tests: `php8.4 artisan test`; Sanctum caches the user across requests → `$this->app['auth']->forgetGuards()`; JSON `{}` vs
  `[]` → compare counts.
- No DOM test environment in `apps/web` (no jsdom, no testing-library): hooks with effects cannot be unit-tested — verify in the
  browser or extract pure logic (`roundsModel`, `peerSheet`, `answersModel`).
- No ESLint/TypeScript config in the repo: to find dead code, run `npx -p typescript tsc` with `allowJs`, `checkJs`,
  `noUnusedLocals` on the touched paths and keep TS6133/6192 only.
- A shell command with complex quoting can be refused by the safety checker → write files with the Write tool.

**Visual**
- In the lesson font an isolated « و » looks like a Latin « g » (« 120 و 6 » reads « 6 g 120 » at a glance) — avoid « و » between
  two numbers in node titles.
- Scores and numeric pairs need `dir="ltr"` (« 2 / 5 » flips otherwise).

---

## 8. Test toolkit

- Playwright Chromium, viewport 1366×768; `addInitScript` seeds `localStorage` (`token`, `u_9001_smarter_lesson_<id>` completed
  modules, `u_9001_smarter_stars_<id>`, `u_9001_smarter_mission_<id>`) and wraps `window.fetch` to answer `/api/*` (`/auth/me` →
  a student) and to store `PUT /lessons/{code}/answers` in `localStorage.__server` (sync path). Scripts are copied to
  `apps/web/.g.mjs`, run with `node`, then deleted.
- Stable selectors: `[data-mission-next]`, `[data-mission-prev]`, `[data-mission-dots]`, `[data-mission-open-map]`,
  `[data-mission-open-knowledge]`, `[data-mission-open-notebook]`, `[data-mission-station]`, `[data-timed-notice]`,
  `[data-play-question]` (`data-play-state`), `[data-review-circle]`, `[data-boss-timer-on]`, `[data-boss-timer]`,
  `[data-boss-score]`, `[data-boss-continue]`, `[data-boss-profile]`, `[data-round]`, `[data-round-win]`, `[data-round-return]`,
  `[data-round-help]`, `[data-round-help-go]`, `[data-round-practice]`, `[data-round-practice-back]`, `[data-lab-door]`,
  `[data-tb-predict-say]`, `[data-lab-checkpoint-chip]`, `[data-lab-checkpoint-tile]`, `[data-lab-checkpoint-check]`,
  `[data-manipulation-autocomplete] button`, `[data-tb-teams]`, `[data-tb-trial]`, `[data-peer-sheet]` (`data-peer-phase`),
  `[data-peer-line]`, `[data-peer-fix]`, `[data-saved-answer]`, `[data-kg-state]`, `[data-kg-start-finger]`,
  `[data-km-read-zoom]`, `[data-fit-overflow]` (must be absent).

---

## 9. Open items — settle with the owner before the big rollout

1. **Validation of the prototype** itself (R1). Nothing below starts before it.
2. **Knowledge-map council fixes not built:** math direction inside Arabic; « عرض الخريطة كاملة » / « إعادة استكشاف » sitting on
   the first nodes; fit the graph to one screen with a minimum size; one-line side card + « المزيد »; duplicate hint;
   contradictory counters (« 4 اكتشافات » vs « 0 من 13 »); cryptic « المحور » footer; column mode in the player.
3. **Coins as the map's entry** (tap an earned coin → its card; locked coin « ؟ »; no cards during a question / « أستعدّ » /
   « اختبر ذاكرتك »; rename « الخريطة » → « المسار ») — not built.
4. **The 👇 finger and the readable-map zoom already reach EVERY lesson** (shared map code) — confirm or restrict to the pilot.
5. **Competitor-review proposals 3–5:** per-option misconception feedback + recording the chosen option; « 🔊 اسمعها »
   read-aloud on the device; a strip of collected ideas.
6. **Other labs need the v2 treatment** (`TeamBuilder` and, since 2026-11-08, `FactorPairs` have prediction / tap-observe / build /
   trials table; recipe in the guide § « Rollout recipe »): one reference conversion per lab family, reviewed by the owner —
   `factor-pairs` done, every other family still to do.
7. **E2E specs** in `apps/web/e2e/` that test the OLD student view of the pilot: page-tours, lesson-kit/lab-coach,
   knowledge-map, teacher-learning, lesson-route-boundary, lesson-kit/predict-rule, lesson-kit/moyen-retrofit-phase1,
   lesson-kit/manipulations, progression, lesson-kit/masail-pilot, lesson-kit/classroom, lesson-kit/test-presentation,
   lesson-kit/practice-progress, lesson-kit/4am-aadad-tabiiya-natiqa — rewrite for the player.
8. **Marketing captures** (`apps/web/scripts/capture-methode.mjs` + `crop-methode.py`, `/methode`) show the old lesson — re-shoot
   and re-read `marketing.json › method.steps.*.story`.
9. **DOM test environment** for `apps/web` (jsdom + testing-library) to unit-test hooks such as `useCountdownTimer` — decide.
10. **Stage 3** of the mission (planned): climax animation (756 books → 21 shelves), bonus levels.
11. **Small dead code outside the pilot scope:** `EuclidAlgorithm` (`finished`), `knowledgeVisuals.ChaslesArrow`,
    `nodeKinds.isGuideKind` — separate cleanup.
12. **Production:** `php artisan migrate` for `student_lesson_answers`; nothing of the pilot is committed yet (on the owner's word).

---

## 10. Files of the prototype

**Lesson** — `apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii/`:
`lesson.config.js` (studentView, mission, knowledgeMapOpen) · `content/prep.js` (+ test) · `content/teams.js` (rounds, practice
rounds) · `content/peerSheet.js` · `content/problems.js` · `content/textbook.js` (sources) · `modules/Module00Astaidd.jsx` …
`Module07Itqan.jsx` · `knowledge.jsx`, `knowledgeGraph.js`.

**Shared** — `apps/web/src/lessons/common/`:
- `mission/`: `MissionPlayer`, `FitToArea`, `MissionHome`, `MissionLayer`, `MissionBar`, `MissionMap`, `MissionDialog`,
  `MissionCheckpoint`, `PlayerSwitch`, `TimedNotice`, `ReviseFirst`, `ReturnToLessonButton`, `returnToLesson.js`,
  `missionModel.js`, `missionPlayerContext.js`, `useMission.js`, `mission.css`.
- `kit/`: `ContentModule`, `PrerequisiteDiagnostic`, `DiagnosticPlayQuestion`, `BossFinal`, `PredictRule` / `predictRule.js`,
  `PeerSheet` / `peerSheet.js`, `questions.jsx`, `KnowledgeBrick`.
- `answers/`: `answersModel.js`, `useSavedAnswer.js`, `SavedAnswerChip.jsx`; `apps/web/src/services/lessonAnswersService.js`.
- `manipulations/`: `ManipulationShell`, `ManipulationControls`, `rounds/LabRounds` + `roundsModel`,
  `primitives/LabCheckpoint` + `labCheckpoint.js`, `primitives/LabCoach`, `divisibility/TeamBuilder` + `divisionChecks.js`,
  `logic/teamBuilder.js`.
- `classroom/ClassroomPaged.jsx`, `components/StudentFocus.jsx`, `hooks/useCountdownTimer.js`.
- `knowledge/`: `KnowledgeProvider` (`mapOpen`, `learnedItems`, `openMap({ expanded })`), `KnowledgeMap` (mind map only,
  `readZoom`, window geometry in the player), `progressive/ProgressiveKnowledgeMap` (wide side card), `progressive/GraphNode`
  (finger), `KnowledgeSnapshot`.

**Backend** — `apps/api/`: `database/migrations/2026_11_07_000001_create_student_lesson_answers_table.php`,
`app/Models/StudentLessonAnswers.php`, `app/Http/Controllers/StudentLessonAnswersController.php`, `routes/api.php` (learner
group), `tests/Feature/StudentLessonAnswersTest.php`.

**i18n** — `apps/web/src/i18n/locales/ar/lesson.json` (`diagnostic.*`, `boss.play*`, `boss.timerOn`, `mission.*`, `peer.*`,
`answers.previous`, `predict.toNotebook`), `lesson.manipulation.json` (`rounds.*`, `teamBuilder.cp.*`, `teamBuilder.trials.*`).
