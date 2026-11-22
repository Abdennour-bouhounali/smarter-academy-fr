# « Ma boussole » — the year compass (start check, report, year and week plan)

> **Status (2026-11-22).** Covers the year compass: calendar and progressions as data, scope, engine, server, screens.
> Imported from the Algerian platform (DZ dev 7f4cef1c) on 2026-11-22. True here: the ENGINE (`schoolCalendar.js`,
> `packages/core/compass/`, `Domain/Compass`, the page `/espace/boussole`), on `curriculum/fr/calendar/`, open for 3e
> only on the server (`config/compass.php`). The screens are French and left to right since 2026-11-22 (namespace
> `compass`, `student.json › compassHome`). The feature is **OFF** in the web (`config/features.js › compass`):
> `/espace/boussole` is behind `FeatureOutlet` and the home never asks `GET /compass` (it opens in its `off` state). Not
> true here: there is no French calendar (the 2026/2027 file has `start`/`end` null and no week — Stage 2D writes it), no
> progression, no question (the index is empty), so the compass never opens. Still Arabic in the code: the two wording
> detectors of `scripts/generate-compass-index.mjs` (`DEPENDS`, `NEEDS_VISUAL`, marked `TODO(stage 1C)`). No walk has
> checked these screens in French.

**Status (DZ, 2026-11-09):** P0 and P1 implemented (the DZ screens were never reviewed in a browser). P2–P4 are **Planned**.
**Authoritative for:** what « Ma boussole » is, its owner decisions, the school calendar and progressions as data, the
scope rules (what a check covers on a given date), the two student cases (on my own / with a class), the bands, the
plan rules, privacy, and the UI rules of its screens.
**Owner plan (approved 2026-11-09):** https://claude.ai/artifact/DnEmP2dozWw5g1vMhBBBXd ·
**UI/UX canvas (13 screens):** https://claude.ai/artifact/5AELdtz41Rs7QEfenw1d6p (both private to the owner).

## 1. The problem and the answer

A student, above all a new one, does not know what to do or when. « Ma boussole » answers with three objects:

1. **the start check (« Bilan de départ »)** — an adaptive, resumable check, very easy → harder, in rounds of 10–12 questions (≈ 6 min).
   Its scope comes from the date and the class's real position (§4), going at most **2 steps back** in the learning
   net, and only after a miss.
2. **« Ma carte des savoir-faire »** — the report: counts per band per savoir-faire, ONE priority, every line linked to where to revise.
3. **the plan (« Mon plan de la semaine »)** — a year map on the real school calendar and a rolling week of 3–5 short tasks. Each mini-check
   (4-question mini-check) updates the bands, and the plan follows.

## 2. Owner decisions (2026-11-09)

| # | Decision |
|---|---|
| 1 | Names (French today): « Ma boussole » (feature), « Bilan de départ » (check), « Ma carte des savoir-faire » (report), « Mon plan de la semaine » (plan), « Vérifier » (mini-check). |
| 2 | Bands have positive names: **« Solide » / « À consolider » / « On commence par là »** (home: « Notre point de départ »), plus « Pas encore vérifié » (never « faible »). |
| 3 | **Sound is ON by default in all of Ma boussole** (check, mini-checks, plan celebrations); the sound switch (« Son activé » / « Son coupé ») stays. Labs are unchanged (off by default). |
| 4 | The school progressions (§3) are the platform default for every student; a teacher's class pointer overrides them. |
| 5 | A check or mini-check result is **never** Mastery V2 evidence (`learning_evidence`) in v1 — like the lesson warm-up (« Je me prépare »). |
| 6 | The teacher sees **counts** for their class only; the parent link shows "plan tasks done", never bands. |
| 7 | A full retake every 7 days; a mini-check any time. |
| 8 | An earlier-year root with no published lesson opens a short review card first; its lesson may move up the generation queue later. |
| 9 | A teacher pointer older than **21 days** stops counting: the student falls back to their own tap. |
| 10 | At most **2 teacher tasks** per week, inside the 3–5 cap (they take a slot, never add one). |
| 11 | The teacher sees class counts only, even though the class consent allows per-student reading of lessons. |
| — | Lesson order per grade is stable from year to year (a small change never affects the student); the **calendar is renewed every year** (§3.4). |

Defaults taken while three UX questions are open (2026-11-09): masculine/neutral address as elsewhere on the platform,
the platform's usual icon style, laptop and tablet first (phones later).

## 3. The school calendar and the progressions (implemented, P0)

### 3.1 Files

`packages/core/curriculum/fr/calendar/`:

| File | Content |
|---|---|
| `school_2026_2027.json` | ONE calendar shared by the four grades: `start`, `end`, teaching `weeks` (`id` `w01`…, `from`, `to`, `term`), and `events` (`evaluation`, `break`, `holiday`, `devoir`, `exam`, `bem_sprint`). An event with `grades` concerns only those grades. **Today: `start`/`end` null, no week, no event.** The event kinds are the imported ones (`bem_sprint` is the Algerian exam run-up; the home legend labels it « Préparation du brevet »); the French ones (trimestres, zones, brevet blanc) come with Stage 2D — not yet applied in the code. |
| `progression_<g>_2026_2027.json` | One per grade (`6e`…`3e`): `weeks[]` aligned with the calendar weeks, each `{ week, school?, lessons }` (`lessons` = catalogue lesson codes in teaching order); `unscheduled[]` = catalogue lessons not scheduled, each with a `reason`; `placedByPlatform[]`. **Today all empty.** |
| `schoolCalendar.js` | Pure functions, imported **by path** (never from the core barrel). `GRADES` = `['6e','5e','4e','3e']`. |
| `schoolCalendar.test.js` | Unit tests. |

### 3.2 The functions (`schoolCalendar.js`)

| Function | Returns |
|---|---|
| `schoolYearOf(date)` | `'2026/2027'` — the year switches on 15 August. |
| `getSchoolYear(year)` / `SCHOOL_YEARS` | `{ calendar, progressions[grade] }` or `null`. |
| `defaultPointer(calendar, progression, date)` | The last lesson of the last **completed** teaching week (`null` before `w01`). The current week's lessons are "coming", not "seen". |
| `taughtLessons(progression, pointer)` | Every lesson up to the pointer, inclusive, in order (`[]` for an unknown pointer — never "everything"). |
| `upcomingLessons(progression, pointer, weeks = 3)` | The lessons of the next `weeks` class weeks after the pointer (scope rule B). |
| `nextMilestone(calendar, grade, date)` | The next `devoir` / `exam` / `bem_sprint` not yet over, with `daysLeft`. |
| `dayStatus(calendar, grade, date)` | `teaching` (with the week), `break`, `exam`, `evaluation`, `bem_sprint`, `weekend`, `before`, `after`. |
| `eventsFor(calendar, grade)`, `lessonOrder(progression)`, `addDays`, `daysBetween` | Helpers. |
| `validateSchoolYear({ calendar, progressions, catalogues })` | `{ errors, warnings }` — see §3.3. |
| `yearlyRenewal(availableYears, today)` | The yearly rule — see §3.4. |

Dates are ISO strings `YYYY-MM-DD`, compared as strings; no time zone is involved.

### 3.3 `check:year-calendar` (in `check:lessons`)

`node scripts/check-year-calendar.mjs [--today YYYY-MM-DD]` fails when:

- a date, week or event is malformed, weeks overlap or leave the year, or a grade does not have exactly one exam per term;
- a progression does not have the calendar's weeks in the same order;
- a placed lesson is not in that grade's catalogue, or is placed twice;
- a catalogue lesson is neither placed nor declared `unscheduled` with a reason;
- a `placedByPlatform` lesson is not placed.

A year NOT YET WRITTEN (no dates, no week, no event) is not validated but announced as such; the only such year allowed
is the French 2026/2027, until Stage 2D (`check-year-calendar.mjs`). `validateSchoolYear` itself refuses it.

### 3.4 The yearly renewal (owner rule)

- **Every summer** (before 15 August) a new `school_<yyyy>_<yyyy+1>.json` is written with that year's official dates, and
  each progression is copied to the new year and re-checked (the order rarely changes).
- Register the year in `SCHOOL_YEARS`.
- `check:year-calendar` **fails** when the current school year (by the date) has no calendar, and **warns** from 1 June when
  the next one is missing.

## 4. What a check covers (scope) — implemented P1 (`packages/core/compass/scope.js`)

On a date, for a grade, with a pointer (§5), `buildScope({ progression, pointer })` returns `targets` = rule B then rule A:

- **Rule A — taught so far:** the programme items of the non-synthesis lessons up to the pointer (`taughtLessons`), the
  **10 most recent** (`recentTaught`); older ones are left to the plan's mini-checks.
- **Rule B — coming next:** for the lessons of the next 3 class weeks (`upcomingLessons`), their **prerequisites** in the
  net (`prereqsOf`: `requires`, then `extends`, then `consolidates`), **at most 4**, never the coming lessons' own items.
- **Rule C — 2 steps, adaptive** (engine, §4.2). **Never step 3.**

`itemInfo(id)` gives what the report shows: the item's `text`, its grade and its home lesson (`homeLessonOf`).

### 4.1 The question bank — `content/compass/index.generated.json`

Generated by `scripts/generate-compass-index.mjs` (`npm run generate:compass-index`; `check:compass-index` in `check:lessons`
fails when it is stale). From the practice bank, a question enters when:

- its exercise is level 1 (→ check level 1) or level 2 (→ check level 2);
- its `answerType` is `choice` or `rational` (graded by `AnswerEvaluator`);
- it is the first question of its exercise, or a sub-question that does not point back to an earlier answer
  (`DEPENDS` — a pattern of ARABIC words such as « deduce », « the previous », « the question »; no French pattern yet);
- its lesson declares **exactly one** programme item; lessons with several items are left out (`gaps.multiItemLessons`)
  because a question cannot be attributed to one item;
- it carries its DATA: a question is refused (`gaps.missingData`) when its text points to a figure, diagram or table the
  exercise does not carry, or names a letter that no formula, text or table defines. The figure/table detector (`NEEDS_VISUAL`) reads
  ARABIC words only (« opposite », « the figure », « the diagram », « the table »); a French bank needs its own patterns
  (`TODO(stage 1C)` in the script).

The file holds references `lesson/exercise/question` only — no answer — and is read by the **server only**. Today it is
empty (no bank, no item: coverage 0 for every grade). An item without questions stays « not checked yet » and never
blocks the check.

### 4.2 The engine — `packages/core/compass/engine.js` (pure, replayable)

Per savoir-faire, levels 1 (very easy) and 2 (harder):

| Answers | Band |
|---|---|
| L1 ✓ → L2 ✓ | « Solide » (`solid`) |
| L1 ✓ → L2 ✗ | « À consolider » (`consolidate`) |
| L1 ✗ → L1' ✗ | « On commence par là » (`start`) — never decided on one answer |
| L1 ✗ → L1' ✓ → L2 (✓ or ✗) | « À consolider » |

« Pas sûr » counts as not succeeded (never shown as a fault). A finished item that is not « Solide » opens its prerequisites
(`prereqsPerItem` = 2) one step deeper, at most step 2; a shared prerequisite is measured once. The next question is the
**lowest level first** (very easy → harder across all items), then the deepest step, then class order. Rounds of 12
(`roundEnded` → continue or stop), at most 36 questions. `priorities()` puts the **deepest gap** first (« On commence par là » at the
highest step), then « À consolider »; two more under « Et aussi », the rest folded.

`replay({ targets, prereqsOf, answers, hasQuestion })` is deterministic: the server stores only answers; resuming a session is
replaying them. The band machine is ported to PHP (`ItemBand.php`) and both are held by ONE fixture,
`packages/core/compass/fixtures/bands.json`.

## 5. The two student cases

`GET /student/study-context` already returns `mode: independent | classroom` (`TEACHER_CLASSROOM_ARCHITECTURE.md` §7). ONE engine
serves both; only its inputs change, through one server resolver `resolveCompassContext(user)` →
`{ pointer, pointerSource: teacher | student | default, events, hiddenLessonCodes, assignment, teacherTasks }`.

| Input | On my own (`independent`) | With a class (`classroom`, consent given) | Fallback |
|---|---|---|---|
| Pointer | the student's tap « Où en est ta classe ? », one-tap weekly confirm; « Je ne suis pas les cours d’une classe » follows the platform lessons they finish | the teacher's current lesson of the class *(Planned, P3)* | `defaultPointer` by date |
| Dates | the shared calendar + the student's own test date *(Planned)* | the teacher's class dates | the shared calendar |
| Linkable lessons | what `ContentAccess` opens for the student | the same, plus the teacher's / school's coverage, minus lessons hidden by the teacher | a review card |
| Extra tasks | none | ≤ 2 tasks from the teacher per week *(Planned)* | none |
| Who reads results | student; parent (tasks done) | + the teacher (class counts) | student |

A class student whose consent is pending, or whose teacher pointer is older than 21 days, is served as `independent`.
Joining keeps the student's own results; leaving returns the plan to case 1 and removes teacher tasks. *(Planned: the
teacher layer is P3; until then a class student uses the student tap.)*

## 6. UI rules (from the approved canvas)

- Until the first check is done, the student home shows **ONE card with ONE button** above everything else.
- The check plays in the full-window player: one question per screen, the card never moves, no scrolling.
- Per answer: « Bravo ! » + a short sound, or « On y reviendra » (neutral, never red, never the answer); « Pas sûr » always
  available; « Annuler » for 1 s. The **big** celebration is only for 3 in a row and for a round's end.
- After a round: continue, or stop with everything saved; the dashboard resumes it.
- Report: counts per band, never a % or a mark; ONE priority card, two more under « Et aussi », the rest folded (never deleted).
- Week: 3–5 tasks of ≤ 15 min, suggested days, no overdue badge; at the week's end only the top 3 open tasks carry over (the
  canvas said Sunday, the DZ week's end; the French week runs Monday → Sunday — « De nouvelles missions lundi »). *(Planned, P2.)*
- Return visit: the home shows ONE next step (today's task) and the next milestone countdown.

## 6bis. The student home `/espace` (implemented 2026-11-09, owner-approved mock)

`pages/student/StudentHome.jsx` IS this layout for every student (the previous home — hero `NextStepHero`, `ClassContextBanner`,
`DiagnosticInviteBanner`, `pickHomeNextStep` — was **removed on 2026-11-09**, owner). Below the greeting, the lazy
`features/home/compass/CompassHomeSections.jsx` holds the top of the page; everything else (the stats, the curriculum position,
recent lessons, the spaces, premium, other grades) sits under ONE folded « Plus » — folded, never deleted. The section reads the
SERVER state only (`GET /compass`; a network error renders `off`, never an empty page). **While the compass feature is off (today), the home
never calls `GET /compass` and always renders `off`** (`StudentHome.jsx › isFeatureOn('compass')`):

| State | What shows |
|---|---|
| `off` (check not open for the grade, or the feature off: every grade today) | the chips, « Reprends ta leçon : … » beside the daily challenge card (itself off today), the year strip — the same page without the check. |
| `new` (never checked) | ONE card « Sache d’où tu pars » with « Commencer le tour », and a quiet link « Ou reprends ta leçon : … ». No other card. |
| `active` | « Continue ton tour de départ » (round, answered count, the round's dots), then « Reprends ta leçon » beside the daily challenge. |
| `done` | « Mission du jour » = the first unticked task of the week; « Mon plan de la semaine » (≤ 3 tasks, ticked) beside « La carte de mes savoir-faire » (the server's counts + « Commence ici »); the lesson and the daily challenge; the YEAR strip (« L’année : semaine N sur M », taught / now / coming / « Devoir » / « Évaluations » / « Vacances » / « Préparation du brevet » from the real calendar); when the next full check opens. |

Chips above: the class and its teacher (class students), « Ta classe en est à : … » (the session's pointer), the next milestone countdown.
A task is **ticked automatically** when its lesson was opened AFTER the check (`tickTasks(tasks, visits, finishedAt)`, `visits` =
last visit per lesson from local lesson activity, all grades). Helpers in `features/compass/compassModel.js`: `yearStrip`,
`teachingWeekNumber`, `tickTasks`. The calendar and the net stay out of the home chunk (shared lazy `compassModel` chunk); the
home strings are `student.compassHome`. Test: `CompassHomeSections.render.test.jsx`.

## 7. Privacy

Results are **not** `learning_evidence` (P1: `CompassService` never writes it; `CompassFlowTest` asserts 0 rows). The student sees
everything; only `CompassController` (route group `learner`) reads the `compass_*` tables, and a session is read only by its
owner (404 otherwise). A teacher will see counts for their class only and a parent plan tasks done this week *(Planned, P3)*;
every such read will join the privacy contract tests.

## 8. Phases

| Phase | Content | Status |
|---|---|---|
| P0 | Decisions, calendar + progressions, `schoolCalendar.js`, `check:year-calendar`, this contract | **Done 2026-11-09** |
| P1 | check + report, term-1 scope, both cases (student-tap pointer), server grading, dashboard card, week plan v0 | **Done in DZ 2026-11-09** (browser review pending); here waits for a French calendar, net and bank |
| P2 | Rolling week plan + mini-check loop | Planned |
| P3 | Year view + the teacher layer (the class compass) + parent line | Planned |
| P4 | Every grade, the exam run-up | Planned |

## 9. Implementation (P1, 2026-11-09)

### 9.1 Who does what

- The **client** computes the scope (calendar + net, `scope.js`) and replays the engine on the server's answers to choose the
  next savoir-faire and level.
- The **server** picks a FRESH question (never served to this student before when possible — a retake draws other questions),
  serves it **without its answer key** through the same boundary as the daily challenge
  (`ChallengeQuestionPresenter::publicRef`), grades it with `AnswerEvaluator`, returns only `{ correct, unsure }` (never the
  answer), and at the end **recomputes the bands itself** (`ItemBand`).

### 9.2 API (`learner`, `routes/api.php`)

| Route | Does |
|---|---|
| `GET /compass` | `{ enabled, grade, profile, active, last, nextRetakeAt, availability }` — `availability` = item → levels with questions |
| `PUT /compass/pointer` | `{ mode: lesson \| not_following, lesson? }` — the lesson must exist (422 `compass_unknown_lesson`) |
| `POST /compass/sessions` | `{ targets[], pointerLesson, pointerSource: student \| default, schoolYear }` — 403 `compass_grade_unavailable` outside `config('compass.grades')` (`['3e']`), 409 `compass_retake_too_early` + `nextRetakeAt` within 7 days, idempotent while a session is active |
| `POST /compass/sessions/{uuid}/questions` | `{ itemId, level }` → the public question; while one awaits its answer, the SAME one comes back (no reroll) |
| `POST /compass/sessions/{uuid}/answers` | `{ answerId, answer, unsure }` → `{ correct, unsure }`; an answered question is 409 |
| `POST /compass/sessions/{uuid}/finish` | drops the unanswered question, writes `compass_item_states`, returns `{ bands, finishedAt }` |

Config: `config/compass.php` (`index_path`, `grades`, `retake_days` 7, `max_questions` 40, `max_targets` 24).

### 9.3 Data (`2026_11_09_000001_create_compass_tables`)

`compass_profiles` (the student's tap, one per student) · `compass_sessions` (targets, pointer and its source, status) ·
`compass_answers` (each served question, then its graded answer) · `compass_item_states` (the LAST band of each savoir-faire per student,
what the plan reads). Code: `app/Domain/Compass/{CompassBank,CompassService,ItemBand,CompassError}.php`,
`app/Http/Controllers/CompassController.php`, models `Compass{Profile,Session,Answer,ItemState}`.

### 9.4 Web

| File | Role |
|---|---|
| `pages/student/CompassPage.jsx` | lazy route `/espace/boussole` (`StudentLayout` + `RequireLargeScreen` + `FeatureOutlet feature="compass"`, closed today; from `lg` the full window stops at the sidebar's edge via `--sa-sidebar-w`, owner 2026-11-09): intro → « Où en est ta classe ? » → full-window check (one question per screen, no scroll, « Bravo ! » / « On y reviendra », « Pas sûr », 1 s « Annuler », a celebration at every 3 in a row, sound ON by default with its own switch `smarter_compass_sound`) → round end → « Ma carte des savoir-faire » + week v0 (≤ 3 tasks: revise the priority, one « Et aussi », prepare the class's next lesson) |
| `features/compass/compassModel.js` | pure glue: `yearFor`, `resolvePointer`, `pointerChoices`, `scopeFor`, `sessionView`, `reportOf`, `weekV0`, `milestone`, `todayIso` |
| `features/home/compass/CompassHomeSections.jsx` | the student home when Ma boussole is open for the grade — §6bis (lazy chunk) |
| `services/compassService.js` | the 6 calls; errors carry `code` and `nextRetakeAt` |
| `i18n/locales/fr/compass.json` | on-demand namespace `compass`; the home sections read `student.compassHome` (there is no `student.compassCard` key in the tree) |

Answer widgets are the exercise engine's (`QuestionRenderer`, `ExerciseStatement`, `canSubmit`): no second engine. A typed answer is
entered in its TEMPLATE (`answerTemplates/TemplateInput`, `EXERCISE_CONTRACT.md`, the answer-templates section; a `gap` template draws the
question's formula itself); the question card is `max-w-5xl` so a formula never wraps. In P1 a class
student is served like an independent one (student tap), with a line saying the teacher will set the class position (P3).
« Je ne suis pas les cours d’une classe » uses the date default until P2 follows the lessons finished on the platform.

### 9.5 Tests

`packages/core/curriculum/fr/calendar/schoolCalendar.test.js`, `packages/core/compass/{engine,scope}.test.js` (+ the shared
fixture), `apps/web/src/features/compass/compassModel.test.js`, `apps/api/tests/Unit/Compass/ItemBandTest.php`,
`apps/api/tests/Feature/CompassFlowTest.php` (grade gate, no key in the public question, server grading, bands, no
`learning_evidence`, 7-day retake, ownership, pointer). Checks: `check:year-calendar`, `check:compass-index`.
