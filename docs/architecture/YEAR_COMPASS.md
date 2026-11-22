# « بوصلتي » — the year compass (start check, report, year and week plan)

**Status:** P0 implemented 2026-11-09: the school calendar, the four 2026/2027 progressions, `schoolCalendar.js`
and `check:year-calendar`. P1 implemented 2026-11-09 (4AM only): the question bank, the pure engine, the server
(`Domain/Compass`, 6 routes), the page `/espace/bawsala` and the home card — §9. The screens were built from the approved
canvas but **not yet reviewed in a browser**. P2–P4 are **Planned**.
**Authoritative for:** what « بوصلتي » is, its owner decisions, the school calendar and progressions as data, the
scope rules (what a check covers on a given date), the two student cases (on my own / with a class), the bands, the
plan rules, privacy, and the UI rules of its screens.
**Owner plan (approved 2026-11-09):** https://claude.ai/artifact/DnEmP2dozWw5g1vMhBBBXd ·
**UI/UX canvas (13 screens):** https://claude.ai/artifact/5AELdtz41Rs7QEfenw1d6p (both private to the owner).

## 1. The problem and the answer

A student, above all a new one, does not know what to do or when. « بوصلتي » answers with three objects:

1. **« جولة الانطلاق »** — an adaptive, resumable check, very easy → harder, in rounds of 10–12 questions (≈ 6 min).
   Its scope comes from the date and the class's real position (§4), going at most **2 steps back** in the learning
   net, and only after a miss.
2. **« خريطة نقاطي »** — the report: counts per band per الكفاءة, ONE priority, every line linked to where to revise.
3. **« خطّتي »** — a year map on the real school calendar and a rolling week of 3–5 short tasks. Each « تحقّق »
   (4-question mini-check) updates the bands, and the plan follows.

## 2. Owner decisions (2026-11-09)

| # | Decision |
|---|---|
| 1 | Names: « بوصلتي » (feature), « جولة الانطلاق » (check), « خريطة نقاطي » (report), « خطّتي » (plan), « تحقّق » (mini-check). |
| 2 | Bands have positive names: **« ثابتة » / « تحتاج تثبيتًا » / « نبدأ منها »**, plus « لم نفحصها بعد » (never « ضعيف »). |
| 3 | **Sound is ON by default in all of بوصلتي** (check, mini-checks, plan celebrations); the « الصوت » switch stays. Labs are unchanged (off by default). |
| 4 | The school progressions (§3) are the platform default for every student; a teacher's class pointer overrides them. |
| 5 | A check or « تحقّق » result is **never** Mastery V2 evidence (`learning_evidence`) in v1 — like « أستعدّ ». |
| 6 | The teacher sees **counts** for their class only; the parent link shows "plan tasks done", never bands. |
| 7 | A full retake every 7 days; « تحقّق » any time. |
| 8 | An earlier-year root with no published lesson opens a short review card first; its lesson may move up the generation queue later. |
| 9 | A teacher pointer older than **21 days** stops counting: the student falls back to their own tap. |
| 10 | At most **2 teacher tasks** per week, inside the 3–5 cap (they take a slot, never add one). |
| 11 | The teacher sees class counts only, even though the class consent allows per-student reading of lessons. |
| — | Lesson order per grade is stable from year to year (a small change never affects the student); the **calendar is renewed every year** (§3.4). |

Defaults taken while three UX questions are open (2026-11-09): masculine/neutral address as elsewhere on the platform,
the platform's usual icon style, laptop and tablet first (phones later).

## 3. The school calendar and the progressions (implemented, P0)

### 3.1 Files

`packages/core/curriculum/dz/calendar/`:

| File | Content |
|---|---|
| `school_2026_2027.json` | ONE calendar shared by the four grades: `start`, `end`, 25 teaching `weeks` (`id` `w01`…`w25`, `from`, `to`, `term`), and `events` (`evaluation`, `break`, `holiday`, `devoir` = فرض, `exam`, `bem_sprint`). An event with `grades` concerns only those grades (1AM's term-3 فرض is a week later; the BEM sprint is 4AM only). |
| `progression_<g>_2026_2027.json` | One per grade: `weeks[]` aligned with the calendar weeks, each `{ week, school?, lessons }` — `school` = the titles of the school's sheet (reference, 1AM–3AM), `lessons` = catalogue lesson codes in teaching order. `unscheduled[]` = catalogue lessons the school sheet does not schedule, each with a `reason`. `placedByPlatform[]` = lessons the sheet does not name that the platform placed in their unit's week (4AM: 7, to confirm by the owner). |
| `schoolCalendar.js` | Pure functions, imported **by path** (never from the core barrel). |
| `schoolCalendar.test.js` | Unit tests. |

Sources: the owner's school sheets of 2026-11-09 — 1AM (high-resolution), 3AM and 4AM 2026/2027; 2AM 2025/2026 placed on
the 2026/2027 calendar (the order is the same every year).

### 3.2 The functions (`schoolCalendar.js`)

| Function | Returns |
|---|---|
| `schoolYearOf(date)` | `'2026/2027'` — the year switches on 15 August. |
| `getSchoolYear(year)` / `SCHOOL_YEARS` | `{ calendar, progressions[grade] }` or `null`. |
| `defaultPointer(calendar, progression, date)` | The last lesson of the last **completed** teaching week (`null` before `w01`). The current week's lessons are "coming", not "seen". |
| `taughtLessons(progression, pointer)` | Every lesson up to the pointer, inclusive, in order (`[]` for an unknown pointer — never "everything"). |
| `upcomingLessons(progression, pointer, weeks = 3)` | The lessons of the next `weeks` class weeks after the pointer (scope rule B). |
| `nextMilestone(calendar, grade, date)` | The next فرض / exam / BEM sprint not yet over, with `daysLeft`. |
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

2026/2027 today: 1AM 69/69 placed, 2AM 65/65, 3AM 58/62 (+ the 4 lessons of « البرهان في الرياضيات », unscheduled by the
school sheet), 4AM 74/74.

### 3.4 The yearly renewal (owner rule)

- **Every summer** (before 15 August) a new `school_<yyyy>_<yyyy+1>.json` is written with that year's official dates, and
  each progression is copied to the new year and re-checked (the order rarely changes).
- Register the year in `SCHOOL_YEARS`.
- `check:year-calendar` **fails** when the current school year (by the date) has no calendar, and **warns** from 1 June when
  the next one is missing.

## 4. What a check covers (scope) — implemented P1 (`packages/core/compass/scope.js`)

On a date, for a grade, with a pointer (§5), `buildScope({ progression, pointer })` returns `targets` = rule B then rule A:

- **Rule A — taught so far:** the programme items of the non-synthesis lessons up to the pointer (`taughtLessons`), the
  **10 most recent** (`recentTaught`); older ones are left to « تحقّق » in the plan.
- **Rule B — coming next:** for the lessons of the next 3 class weeks (`upcomingLessons`), their **prerequisites** in the
  net (`prereqsOf`: `requires`, then `extends`, then `consolidates`), **at most 4**, never the coming lessons' own items.
- **Rule C — 2 steps, adaptive** (engine, §4.2). **Never step 3.**

`itemInfo(id)` gives what the report shows: the item's Arabic text, its grade and its home lesson (`homeLessonOf`).

### 4.1 The question bank — `content/compass/index.generated.json`

Generated by `scripts/generate-compass-index.mjs` (`npm run generate:compass-index`; `check:compass-index` in `check:lessons`
fails when it is stale). From the practice bank, a question enters when:

- its exercise is level 1 (→ check level 1) or level 2 (→ check level 2);
- its `answerType` is `choice` or `rational` (graded by `AnswerEvaluator`);
- it is the first question of its exercise, or a sub-question that does not point back to an earlier answer
  (« استنتج », « السابق », « السؤال »…);
- its lesson declares **exactly one** programme item; lessons with several items are left out (`gaps.multiItemLessons`, 25 today)
  because a question cannot be attributed to one الكفاءة.

- it carries its DATA: a question is refused (`gaps.missingData`, 459 on 2026-11-09) when its text points to a figure, diagram or
  table the exercise does not carry, or names a letter ($A$, $C$…) that no formula, text or table defines.

The file holds references `lesson/exercise/question` only — no answer — and is read by the **server only**. Coverage on
2026-11-09 (items with both levels): 4AM 36/52, 3AM 16/58, 2AM 12/54, 1AM 10/60. An item without questions stays
« لم نفحصها بعد » and never blocks the check.

### 4.2 The engine — `packages/core/compass/engine.js` (pure, replayable)

Per الكفاءة, levels 1 (very easy) and 2 (harder):

| Answers | Band |
|---|---|
| L1 ✓ → L2 ✓ | « ثابتة » (`solid`) |
| L1 ✓ → L2 ✗ | « تحتاج تثبيتًا » (`consolidate`) |
| L1 ✗ → L1' ✗ | « نبدأ منها » (`start`) — never decided on one answer |
| L1 ✗ → L1' ✓ → L2 (✓ or ✗) | « تحتاج تثبيتًا » |

« غير متأكّد » counts as not succeeded (never shown as a fault). A finished item that is not « ثابتة » opens its prerequisites
(`prereqsPerItem` = 2) one step deeper, at most step 2; a shared prerequisite is measured once. The next question is the
**lowest level first** (very easy → harder across all items), then the deepest step, then class order. Rounds of 12
(`roundEnded` → « واصل أو توقّف »), at most 36 questions. `priorities()` puts the **deepest gap** first (« نبدأ منها » at the
highest step), then « تحتاج تثبيتًا »; two more under « وأيضًا », the rest folded.

`replay({ targets, prereqsOf, answers, hasQuestion })` is deterministic: the server stores only answers; resuming a session is
replaying them. The band machine is ported to PHP (`ItemBand.php`) and both are held by ONE fixture,
`packages/core/compass/fixtures/bands.json`.

## 5. The two student cases

`GET /student/study-context` already returns `mode: independent | classroom` (`TEACHER_CLASSROOM_ARCHITECTURE.md` §7). ONE engine
serves both; only its inputs change, through one server resolver `resolveCompassContext(user)` →
`{ pointer, pointerSource: teacher | student | default, events, hiddenLessonCodes, assignment, teacherTasks }`.

| Input | On my own (`independent`) | With a class (`classroom`, consent given) | Fallback |
|---|---|---|---|
| Pointer | the student's tap « أين وصل قسمك؟ », one-tap weekly confirm; « لا أتابع قسمًا » follows the platform lessons they finish | the teacher's « الدرس الحالي للقسم » | `defaultPointer` by date |
| Dates | the shared calendar + « عندي فرض يوم … » | the teacher's class dates | the shared calendar |
| Linkable lessons | what `ContentAccess` opens for the student | the same, plus the teacher's / school's coverage, minus lessons hidden by the teacher | a review card |
| Extra tasks | none | ≤ 2 « من أستاذك » tasks per week | none |
| Who reads results | student; parent (tasks done) | + the teacher (class counts) | student |

A class student whose consent is pending, or whose teacher pointer is older than 21 days, is served as `independent`.
Joining keeps the student's own results; leaving returns the plan to case 1 and removes teacher tasks. *(Planned: the
teacher layer is P3; until then a class student uses the student tap.)*

## 6. UI rules (from the approved canvas)

- Until the first check is done, the student home shows **ONE card with ONE button** above everything else.
- The check plays in the full-window player: one question per screen, the card never moves, no scrolling.
- Per answer: « أحسنت! » + a short sound, or « سنعود إليه » (neutral, never red, never the answer); « غير متأكّد » always
  available; « تراجع » for 1 s. The **big** celebration is only for 3 in a row and for a round's end.
- After a round: continue, or stop with everything saved; the dashboard resumes it.
- Report: counts per band, never a % or a mark; ONE priority card, two more under « وأيضًا », the rest folded (never deleted).
- Week: 3–5 tasks of ≤ 15 min, suggested days, no overdue badge; on Sunday only the top 3 open tasks carry over.
- Return visit: the home shows ONE next step (today's task) and the next milestone countdown.

## 6bis. The student home `/espace` (implemented 2026-11-09, owner-approved mock)

`pages/student/StudentHome.jsx` IS this layout for every student (the previous home — hero `NextStepHero`, `ClassContextBanner`,
`DiagnosticInviteBanner`, `pickHomeNextStep` — was **removed on 2026-11-09**, owner). Below the greeting, the lazy
`features/home/compass/CompassHomeSections.jsx` holds the top of the page; everything else (the stats, the curriculum position,
recent lessons, the spaces, premium, other grades) sits under ONE folded « المزيد » — folded, never deleted. The section reads the
SERVER state only (`GET /compass`; a network error renders `off`, never an empty page):

| State | What shows |
|---|---|
| `off` (check not open for the grade: 1AM–3AM today) | the chips, « واصل درسك » beside « التحدّي اليومي », the year strip — the same page without the check. |
| `new` (never checked) | ONE card « اعرف من أين تنطلق » with « ابدأ الجولة », and a quiet link « أو واصل درسك: … ». No other card. |
| `active` | « واصل جولة الانطلاق » (round, answered count, the round's dots), then « واصل درسك » beside « التحدّي اليومي ». |
| `done` | « مهمّة اليوم » = the first unticked task of the week; « خطّتي لهذا الأسبوع » (≤ 3 tasks, ticked) beside « خريطة نقاطي » (the server's counts + « ابدأ من هنا »); the lesson and the daily challenge; the YEAR strip (« السنة: الأسبوع N من 25 », taught / now / coming / فرض / exams / holidays / BEM from the real calendar); when the next full check opens. |

Chips above: the class and its teacher (class students), « قسمك عند: … » (the session's pointer), the next milestone countdown.
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
| P1 | 4AM check + report, term-1 scope, both cases (student-tap pointer), server grading, dashboard card, week plan v0 | **Done 2026-11-09** (browser review pending) |
| P2 | Rolling week plan + « تحقّق » loop | Planned |
| P3 | Year view + the teacher layer (« بوصلة القسم ») + parent line | Planned |
| P4 | Full 4AM year, 3AM → 1AM, BEM sprint | Planned |

## 9. Implementation (P1, 2026-11-09)

### 9.1 Who does what

- The **client** computes the scope (calendar + net, `scope.js`) and replays the engine on the server's answers to choose the
  next الكفاءة and level.
- The **server** picks a FRESH question (never served to this student before when possible — a retake draws other questions),
  serves it **without its answer key** through the same boundary as the daily challenge
  (`ChallengeQuestionPresenter::publicRef`), grades it with `AnswerEvaluator`, returns only `{ correct, unsure }` (never the
  answer), and at the end **recomputes the bands itself** (`ItemBand`).

### 9.2 API (`learner`, `routes/api.php`)

| Route | Does |
|---|---|
| `GET /compass` | `{ enabled, grade, profile, active, last, nextRetakeAt, availability }` — `availability` = item → levels with questions |
| `PUT /compass/pointer` | `{ mode: lesson \| not_following, lesson? }` — the lesson must exist (422 `compass_unknown_lesson`) |
| `POST /compass/sessions` | `{ targets[], pointerLesson, pointerSource: student \| default, schoolYear }` — 403 `compass_grade_unavailable` outside `config('compass.grades')` (`['4am']`), 409 `compass_retake_too_early` + `nextRetakeAt` within 7 days, idempotent while a session is active |
| `POST /compass/sessions/{uuid}/questions` | `{ itemId, level }` → the public question; while one awaits its answer, the SAME one comes back (no reroll) |
| `POST /compass/sessions/{uuid}/answers` | `{ answerId, answer, unsure }` → `{ correct, unsure }`; an answered question is 409 |
| `POST /compass/sessions/{uuid}/finish` | drops the unanswered question, writes `compass_item_states`, returns `{ bands, finishedAt }` |

Config: `config/compass.php` (`index_path`, `grades`, `retake_days` 7, `max_questions` 40, `max_targets` 24).

### 9.3 Data (`2026_11_09_000001_create_compass_tables`)

`compass_profiles` (the student's tap, one per student) · `compass_sessions` (targets, pointer and its source, status) ·
`compass_answers` (each served question, then its graded answer) · `compass_item_states` (the LAST band of each الكفاءة per student,
what the plan reads). Code: `app/Domain/Compass/{CompassBank,CompassService,ItemBand,CompassError}.php`,
`app/Http/Controllers/CompassController.php`, models `Compass{Profile,Session,Answer,ItemState}`.

### 9.4 Web

| File | Role |
|---|---|
| `pages/student/CompassPage.jsx` | lazy route `/espace/bawsala` (`StudentLayout` + `RequireLargeScreen`; from `lg` the full window stops at the sidebar's edge via `--sa-sidebar-w`, owner 2026-11-09): intro → « أين وصل قسمك؟ » → full-window check (one question per screen, no scroll, « أحسنت! » / « سنعود إليه », « غير متأكّد », 1 s « تراجع », a celebration at every 3 in a row, sound ON by default with its own switch `smarter_compass_sound`) → round end → « خريطة نقاطي » + week v0 (≤ 3 tasks: revise the priority, one « وأيضًا », prepare the class's next lesson) |
| `features/compass/compassModel.js` | pure glue: `yearFor`, `resolvePointer`, `pointerChoices`, `scopeFor`, `sessionView`, `reportOf`, `weekV0`, `milestone`, `todayIso` |
| `features/home/compass/CompassHomeSections.jsx` | the student home when بوصلتي is open for the grade — §6bis (lazy chunk) |
| `services/compassService.js` | the 6 calls; errors carry `code` and `nextRetakeAt` |
| `i18n/locales/ar/compass.json` | on-demand namespace `compass`; the card reads `student.compassCard` |

Answer widgets are the exercise engine's (`QuestionRenderer`, `ExerciseStatement`, `canSubmit`): no second engine. A typed answer is
entered in its TEMPLATE (`answerTemplates/TemplateInput`, `EXERCISE_CONTRACT.md` § « قوالب الإجابة »; a `gap` template draws the
question's formula itself); the question card is `max-w-5xl` so a formula never wraps. In P1 a class
student is served like an independent one (student tap), with a line saying the teacher will set the class position (P3).
« لا أتابع قسمًا » uses the date default until P2 follows the lessons finished on the platform.

### 9.5 Tests

`packages/core/curriculum/dz/calendar/schoolCalendar.test.js`, `packages/core/compass/{engine,scope}.test.js` (+ the shared
fixture), `apps/web/src/features/compass/compassModel.test.js`, `apps/api/tests/Unit/Compass/ItemBandTest.php`,
`apps/api/tests/Feature/CompassFlowTest.php` (4AM gate, no key in the public question, server grading, bands, no
`learning_evidence`, 7-day retake, ownership, pointer). Checks: `check:year-calendar`, `check:compass-index`.
