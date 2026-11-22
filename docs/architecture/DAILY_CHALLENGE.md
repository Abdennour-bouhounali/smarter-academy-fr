# « التحدّي اليومي » — the Daily Math Challenge

> **Authoritative** for the daily challenge: what it is, how its questions are
> chosen, how it is timed and scored, the streak, the cumulative score and
> the class ranking, what each role may see, its API, configuration and
> tests. Implemented 2026-09-25. The code is the source of truth:
> `apps/api/app/Domain/DailyChallenge/`, `apps/web/src/features/dailyChallenge/`.

## 1. What it is — and what it is not

A short daily retrieval exercise (3–10 questions, default 5) on Learning
Points the student **has already worked on**, with a game layer on top.

```text
RETRIEVAL PRACTICE      questions from the existing practice bank, chosen from the mastery state
+ LEARNING EVIDENCE     every answer enters ProgressEngine like any practice answer
+ DAILY HABIT           a streak across challenge days
+ OPTIONAL COMPETITION  a class ranking the teacher switches on
```

Two systems stay separate, in code and in the database:

| | Mastery (educational evidence) | Challenge score (game metric) |
|---|---|---|
| Tables | `learning_evidence`, `student_learning_point_progress` | `daily_challenge_*` |
| Written by | `ProgressEngine::recordEvidence` only | `DailyChallengeService` only |
| Moves with | correctness, difficulty, repetition (engine V2) | correctness, speed, continuity |

No challenge point ever touches mastery; no mastery value is read as a score.
The daily challenge awards no XP, and there is no server-side XP; the only XP in the product is a client-only counter (`localStorage` `smarter_global_xp`, per device — see `PROGRESS_MODEL.md`). The challenge score is its own metric.

It is **not** a second exercise engine (questions are references into
`content/practice`, rendered by `features/practice/QuestionRenderer`), **not**
a second mastery system, **not** a second class system (it reads
`classrooms` / `classroom_memberships` through the existing gates).

## 2. Scope — who gets which challenge

`DailyChallengeService::context()`:

| Student | Scope | Questions |
|---|---|---|
| In a قسم (primary = most recently joined active class) whose teacher left the challenge **enabled** | `classroom` | **the same for the whole class** (fair competition, per-question analysis) |
| Independent — or whose class has the challenge **disabled** | `student` | personal |

One `daily_challenges` row per (scope, date), unique: refreshing, a second
tab or a retry can never regenerate an easier challenge. The date is the
**Algiers** date (`challenge.timezone`), not UTC.

Only `role = student` plays (`learner` middleware): a teacher or admin gets
403, like every other evidence route.

## 3. Question selection — `ChallengeQuestionSelector`

Reads the canonical state, the derived freshness, the evidence and the item
registry; writes nothing. Per Learning Point of the scope's lessons (for a
class: the class's **effective** lessons, optionally narrowed by the teacher's
lesson / LP scope; for a student: the visible lessons of their grade):

| Rank | Reason (`daily_challenge_questions.reason`) | Condition (class: over the assessed members, "≥ ⅓") |
|---|---|---|
| 0 | `retrieval` | mastered **and** last evidence older than `mastery.freshness.fresh_days` (freshness aging/stale) |
| 1 | `recent_mistake` | a failure in the last `selection.recent_mistakes_days` (state or challenge) on a weak point |
| 1 | `recently_learned` | first evidence less than `selection.recently_learned_days` ago — **one slot is reserved** for such a point |
| 1 | `reinforce` | status `reinforce` |
| 2 | `reinforce` | more reinforce+gap than mastered |
| 3 | `review` | mastered and fresh |
| +2 | (spacing) | answered correctly in a challenge in the last `selection.recently_retrieved_days` |
| 9 | `warmup` | never worked — used **only** when nothing has been learned yet |

Then: one question per point while points remain, then a second pass (Q4 →
LP A); per point the item is the best by (difficulty band, **unseen by the
student** — a never-seen item is a `first`/`variant` demonstration, a seen one
would weigh ×0.1 — template not yet used today, answer type different from
the previous question, stable hash). Difficulty band: teacher's `easy` 1–2,
`medium` 2–4, `hard` 3–5; adaptive (default) 3–5 for retrieval/review and
1–3 for fragile points. Only published, non-retired practice items of
published exercises; a **class** challenge only uses **free** content (every
member must be able to open it); a personal one uses premium content only if
the student is entitled. Every candidate is checked against the shipped
content file, and only questions that **count for mastery**
(`AnswerEvaluator::countsForMastery`) are served: never a self-assessed
« بيّن أن » step (`selfCheck`) nor a `counted: false` step of a BEM sheet —
they would be scored on the student's word (since 2026-10-07; before that the
BEM content of `bahth-pgcd` could reach a challenge). Deterministic: ties broken by `crc32(scope|date|key)`.

## 4. Serving and timing — the server owns the clock

```text
POST /daily-challenge/start                  → the attempt (unique per challenge+student)
POST /daily-challenge/attempts/{uuid}/next   → opens the next unanswered question:
                                               daily_challenge_answers.started_at = now (server)
                                               idempotent: the same open question, same started_at
POST /daily-challenge/attempts/{uuid}/answers {position, answer}
                                             → submitted_at = now (server)
                                               response_time_ms = submitted_at − started_at (≥ 0)
```

- One question open at a time, in order: an answer to a question that was not
  served is refused (`not_opened`); nothing can be peeked.
- The served question has **no answer key**: no `expectedAnswer`, no choice
  `isCorrect`, no misconception signatures, no hints, no feedback
  (`ChallengeQuestionPresenter::public`). The correction (`reveal`: correct
  choice ids or value, one-line explanation = the content's `feedback.correct`)
  arrives with the verdict. This is the "server-served questions" that D5
  lists as planned for practice — implemented here for the challenge only.
- The client sends a position and a raw answer. Any `score`, `isCorrect`,
  `outcome`, `responseTimeMs` it adds is ignored (`DailyChallengeFlowTest`).
- Same answer re-sent → the recorded verdict (200, `duplicate: true`); a
  **different** answer to an answered question → 409 `already_answered`.
  Answer rows are locked (`lockForUpdate`) during the write.
- An attempt lasts `challenge.attempt_window_minutes` (30) from its start.
  After that, answers get 409 `expired`, opened-unanswered questions become
  `abandoned` (0 points, inert evidence) and the attempt is finalized as
  `expired` — on the next request of the student, no scheduler needed.
- A challenge can only be **started** inside the daily window
  (`available_from`–`available_until`, per class overridable); an attempt
  already started stays finishable.
- Timestamps are stored with milliseconds (`$dateFormat = 'Y-m-d H:i:s.v'`).
- The on-screen timer is the server's: `serverElapsed(startedAt, serverNow,
  receivedAt)` (`challengeModel.js`) corrects the phone's clock skew. It is
  calm (mm:ss, no countdown, no red) and freezes on the recorded time.

## 5. Evidence

Each judged answer goes through **the only door**:

```text
DailyChallengeAnswer ─► ProgressEngine::recordEvidence
  assessmentType  practice_exercise          (same weight as practice — no new engine version)
  item            the registry item (practice:{lesson}:{exercise}:{question})
  attemptId       daily_challenge_answers.evidence_attempt_id (idempotency)
  sourceId        "daily_challenge:{attempt uuid}"  ← provenance
  evaluatedBy     server (AnswerEvaluator), difficulty/template from the registry, hints 0
```

So repetition rules, the minimum-evidence rule and D2 apply unchanged: one
correct challenge answer never masters a point by itself
(`test_one_correct_challenge_answer_never_masters_a_point_by_itself`).
Freshness is not a stored value: a new evidence row refreshes it by
definition. `learning_evidence.source_id` was widened from 36 to 64
characters for the provenance prefix (migration `2026_10_01_000001`). A failed
evidence write (a retired point) is logged (`daily_challenge.evidence_failed`)
and does not break the game.

## 6. Scoring — `DailyChallengeScoringService` (pure)

**Correctness dominates.**

| Function | Rule (defaults) |
|---|---|
| `calculateQuestionScore` | wrong / syntax_error / abandoned = **0** (never negative); partial = `base × partial_ratio` (40), no speed; correct = `base_points` (100) + speed bonus |
| speed bonus | **tiers** on the server-measured time: ≤10 s 30 · ≤20 s 25 · ≤30 s 20 · ≤45 s 15 · ≤60 s 10 · ≤90 s 5 · else 0; capped by `max_speed_bonus`; 0 under `min_plausible_ms` (1.5 s) |
| day-level guarantee | the tiers are scaled by `min(1, (base−1) / ((n−1) × max tier))` for an n-question challenge, so **the whole day's speed bonus can never equal one extra correct answer**: 5/5 slowly always beats 4/5 at any speed (property-tested for 3, 5, 7, 10) |
| `calculateContinuityBonus` | `min(max, per_day + growth × (streak − 1))` = 10, 12, 14 … 30; paid only with ≥ `min_correct` (1) correct answer |
| `calculateChallengeScore` | Σ questions + continuity, capped by `max_daily_score` (none) |
| `calculateMissedDayAdjustment` | `per_day` (15) × missed challenge days of **one** absence, at most `max_days_per_gap` (3) days → at most 45 |
| `calculateCumulativeScore` | `max(0, previous − penalty) + daily` — never below 0 |

Every challenge freezes its configuration in `config_snapshot`: changing the
scale changes future challenges, never a past score.

## 7. Streak and missed days

- Challenge days: `challenge.challenge_weekdays` (ISO, default all but Friday).
  A non-challenge day neither breaks a streak nor costs anything.
- A day counts as played when a finished attempt has **at least one answer**.
- The streak is the **student's** (their habit, across scopes):
  `ChallengeCalendar::streakEndingBefore(date, playedDates) + 1`.
- Missed days = challenge days strictly between the last played day and today.
  The penalty is **shown the same day** (the ranking subtracts it on read,
  `pendingPenalty`) and **settled** on the next participation
  (`daily_challenge_attempts.penalty_applied`). No scheduled job.
- The calendar is read with the **current** `challenge_weekdays`, including
  for past gaps: turning Friday into a challenge day makes past Fridays count
  as missed for streaks and pending penalties. The admin screen warns about
  it; change the days at the start of a week. (Snapshots freeze the scale,
  not the calendar — found by the browser QA, which opens a rest day
  temporarily and restores it.)
- The 14-day strip shows each day as completed ✓ / missed ✕ / today ● /
  rest – / none ○ — a symbol and a spoken label, never colour alone.

## 8. Cumulative score and ranking — `DailyChallengeLeaderboard`

`daily_challenge_standings` holds one row per (scope, student): cumulative
score, challenges completed, total correct / answered, total response time,
penalties, last played date, `score_reached_at` (ms). A class ranking is ONE
query on that table, restricted to **active** members (a student who left
disappears; their rows stay).

**Tie-breaking (fixed, documented, never unstable):**

1. cumulative score (after the pending penalty) ↓
2. total correct answers ↓
3. average response time ↑ (none = last)
4. `score_reached_at` ↑ (who reached it first)
5. user id ↑

`rank_before` / `rank_after` are stored on the attempt at finalization; the
screen shows « ↑ تقدّمت n مراتب » **only** when both exist and the rank
improved — never fabricated, never a « you dropped » message.

Seasons are **not implemented**; the standings key `(scope_type, scope_id)`
is where a season id would be added.

## 9. Who sees what

| | Student (own) | Student (class) | Teacher (own class) | Display mode |
|---|---|---|---|---|
| Own answers, times, review, history | ✓ | — | — | — |
| Own rank | ✓ if competition ON (`show_own_rank_to_students`) | | | |
| Top 3 | | display name + rank + score, **only** if competition ON **and** Top 3 ON | | |
| Class participation « x / y » | | only if `show_results_to_class` | ✓ | ✓ |
| Full ranking | — | — | ✓ if competition ON | top 10, display names |
| Per-student results, per-question and per-LP analysis | — | — | ✓ | per-question % only |
| Emails, mistakes of others, mastery of others | never | never | never (identity = `ClassroomAccess::identity`) | never |

Display name = first name + initial of the last name (« Amine K. »,
`DailyChallengeLeaderboard::displayName`). « منافسة القسم » and « إظهار
الثلاثة الأوائل » are **independent**: competition ON + Top 3 OFF = the teacher
sees the ranking, the students see only their own rank.

## 10. Teacher surfaces

- Class page tab **« التحدّي اليومي »** (`features/teacher/dailyChallenge/`,
  lazy, own `<Suspense>`): the day's tiles (participation, accuracy-only
  average score — speed excluded —, average time, class accuracy, streak
  continuation = share of today's participants whose streak is ≥ 2), a date
  picker over the class's challenge days, **question analysis** (⚠ under 60 %),
  **struggling Learning Points** with the students who failed them and two
  gestures — « افتح الكفاءة » (the existing learning-map tab, `focusCode`)
  and « اقترح تمرينًا موجَّهًا » (the existing `InterventionForm`, prefilled
  `recommend_practice`, `sourceSignal: daily_challenge`) —, the full ranking,
  the per-student table, and the settings panel (switches with ON/OFF text,
  question count, difficulty, lesson scope, window). Settings apply to the
  challenge generated next; today's challenge, once generated, is frozen.
- **Display mode** `/enseignant/classes/:id/defi/affichage` — outside the
  teacher shell, full-screen button, views « النتائج · الترتيب · أداء الأسئلة ·
  المشاركة », keys 1–4, Escape returns to the class, refreshes every 20 s.

## 11. Student surfaces

`/espace/defi` (intro → session → completion, one page, state held by the
server), `/espace/defi/historique`, `/espace/defi/:attemptId` (review,
read-only, never replayable), a home card (`DailyChallengeCard`) and a nav
entry « التحدّي اليومي ». Visual language (owner decision 2026-09-25: **no dark surfaces, full
width**): every page uses the practice player's frame
(`sa-surface-plain sa-page sa-page--flush`: 60 px gutter from 640 px, 20 px on phones, `py-6 sm:py-8`, no max-width); the
« arena » (`ArenaPanel`) is a WHITE card with a soft brand halo
(blue/violet/cyan at low opacity), amber for streaks and the primary CTA
gradient, emerald for correct, indigo for secondary actions and the current
question; no near-black button anywhere. The display mode is light too
(`bg-slate-50`). The question sits on a white card (mathematics reads best
black on white). Motion is intentional and short
(question transition, speed-bonus pop, score count-up ≤ 0.9 s, rank arrow)
and `MotionConfig reducedMotion="user"` + `useReducedMotion` remove it. The
primary button is sticky on phones and tablets **just above** the student
space's mobile tab bar (`bottom: calc(4rem + safe-area)`, static from `lg`,
≥ 56 px). The mobile tab bar shows « التحدّي » (`shortLabelKey`, a new
optional field of `data/studentNavigation.js` entries). Timelines (streak
strip, progress dots) flow right-to-left like the page; every `N / M` is in
`dir="ltr"`, every display name in `<bdi>`. The completion
screen proposes a targeted practice on the day's weakest point (`insights`):
a data hook for the future Next Best Action, not a second recommender.

## 12. Configuration — `DailyChallengeConfig` (the only reader)

```text
config/daily_challenge.php        defaults (repository)
  ↓ overridden by
daily_challenge_policies 'global' admin screen « التحدّي اليومي » (/admin/offres/defi-quotidien)
  ↓ refined per class by
daily_challenge_class_settings    the teacher (enabled, competition, top 3, results, count, difficulty, scope, window)
```

Admin-editable keys are a closed list (`DailyChallengeConfig::EDITABLE`),
each validated (bounds, time format, decreasing speed tiers, default count ∈
allowed counts, non-empty window and weekdays); an invalid payload is refused
whole. Updates are journaled (`daily_challenge.config_updated`). The timezone
and the tie-breaking order are not editable. Singleton, per-request memo,
flushed on `RequestHandled`.

## 13. API

```text
# student (auth + verified + learner)
GET    /daily-challenge                                today: availability/reason, challenge meta, streak, cumulative, best, competition view, attempt
POST   /daily-challenge/start                          the attempt + answered + current
GET    /daily-challenge/history?days=7..60             challenge days: score or « missed »
GET    /daily-challenge/attempts/{uuid}                resume state
POST   /daily-challenge/attempts/{uuid}/next           open next question (idempotent)
POST   /daily-challenge/attempts/{uuid}/answers        {position, answer} → verdict + reveal (+ completion on the last)
POST   /daily-challenge/attempts/{uuid}/complete       idempotent → completion (attempt, streak, competition, insights)
GET    /daily-challenge/attempts/{uuid}/review         finished attempts only

# teacher (can:teacher + ClassroomPolicy, `manage` to write)
GET|PATCH /teacher/classrooms/{id}/daily-challenge/settings
GET    /teacher/classrooms/{id}/daily-challenge/results?date=
GET    /teacher/classrooms/{id}/daily-challenge/display?date=

# admin (can:admin)
GET|PUT /admin/daily-challenge/config                 {values: {"scoring.base_points": 120, …}}
```

Refusals carry a closed `reason` (`ChallengeException`): `disabled`,
`rest_day`, `window_closed`, `nothing_to_review`, `not_found` (404),
`expired` / `already_answered` / `finished` (409), `not_opened`. The client
renders Arabic from the reason (`challenge.json` → `reasons.*`).

## 14. Data model

`daily_challenges` (scope_type, scope_id, challenge_date — unique; config
snapshot; status `generated|empty`) · `daily_challenge_questions` (position,
lesson, exercise, question, item_key, learning_point_id, template, difficulty,
answer type, reason) · `daily_challenge_attempts` (uuid; unique per challenge
+ user; scope copied for aggregation; status `in_progress|completed|expired`;
started/expires/completed; counts; base/speed/streak/total score; penalty
applied; response times; streak before/after; rank before/after) ·
`daily_challenge_answers` (server `started_at` / `submitted_at` in ms,
response time, raw answer, outcome, scores, `evidence_attempt_id`) ·
`daily_challenge_standings` · `daily_challenge_class_settings` ·
`daily_challenge_policies`. Indexes: (scope, date), (user, date),
(scope, cumulative_score), learning_point_id.

`daily_challenge_questions` references lessons and learning points, and its
deletion would cascade to the students' answers: `smarter:scope-curriculum`
(`ScopeCurriculum::DEPENDENT_TABLES` + `STUDENT_DATA_TABLES`) declares it as
student data, so a curriculum cleanup refuses to run while a challenge
question points at a lesson being removed (`CurriculumScopeTest`). Deleting a
user cascades their attempts, answers and standings; a personal
`daily_challenges` row has no foreign key to the user and stays as an inert
index.

Cost: the teacher dashboard and the student screen issue the **same number of
queries** for 4 or 16 members (`test_the_dashboard_and_student_screen_cost_the_same_queries_for_4_or_16_students`).

## 15. Frontend files

```text
services/dailyChallengeService.js, services/teacher/dailyChallengeService.js, services/admin/dailyChallengeAdminService.js
features/dailyChallenge/challengeModel.js (+ test)   pure formatting: clock, server-corrected timer, rank movement, dots, answer text
features/dailyChallenge/components/                 ArenaPanel, ChallengeIntro, ChallengeQuestion, ChallengeTimer, ChallengeProgress,
                                                    AnswerFeedback, ScoreCounter, ChallengeComplete, StreakDisplay, Leaderboard
pages/student/challenge/                            DailyChallengePage, ChallengeHistoryPage, ChallengeReviewPage
features/home/components/DailyChallengeCard.jsx    (strings in `student`)
features/teacher/dailyChallenge/                    DailyChallengeTab, ClassChallengeResults, ClassChallengeSettings
pages/teacher/ChallengeDisplayPage.jsx              (own <Suspense>, outside TeacherLayout)
pages/admin/dailyChallenge/DailyChallengeConfig.jsx (strings in `admin`)
i18n/locales/ar/challenge.json                      ON-DEMAND namespace (BUNDLE_BOUNDARIES.md)
```

## 16. Tests that own this document

| Test | Locks |
|---|---|
| `tests/Unit/DailyChallenge/DailyChallengeScoringTest.php` | zero for wrong, tiers monotonic and capped, 30 s < 10 s but both strong, implausible speed, **one more correct answer beats any speed** (n = 3, 5, 7, 10), partial, streak bonus, bounded penalty, floor at 0, daily cap, calendar/rest days, tie-breaking order |
| `tests/Feature/DailyChallengeFlowTest.php` | stable generation, coverage, retrieval reasons, second tab / refresh (same attempt, same `started_at`), no answer key served, server timing + evidence provenance, client claims ignored, idempotent duplicate / 409 on change, order, expiry, completion (score, streak, standing, no replay, review, history), no mastery from one answer, missed day + penalty + Friday, rest day / window, warm-up, other student's attempt 404, teacher 403 |
| `tests/Feature/DailyChallengeClassTest.php` | same questions for the class, competition × Top 3 matrix, rank movement only when real, disabled class → personal, left student disappears, dashboard analysis without email, display mode without last names or times, deterministic ties, settings validation and scope, owner-only access, admin config validation + snapshot, constant query count |
| `tests/Feature/TeacherPrivacyContractTest.php` | the three teacher routes carry no email |
| `features/dailyChallenge/challengeModel.test.js` | the pure formatting |
| `apps/web/e2e/daily-challenge.mjs` | browser QA on the demo dataset (student A/B/C, mobile/tablet/desktop, reduced motion, teacher tab + display, admin) |

## 16bis. Shared with « مدار » (2026-10-22)

The game's refuel station (`MADAR_GAME.md` §5) reuses this feature's selector and presenter instead of a second engine:
- `ChallengeQuestionSelector::select()` takes an optional `$options`:
  - `seed` is appended to the tie-break seed, so several services in one day differ;
  - `exclude` is a list of `item_key`s to leave out;
  - `warmup` keeps never-worked skills **after** the learned ones instead of dropping them. Madar uses it when the learned pool is exhausted; the daily challenge never sets it.
- In the `student` scope, `snapshot.lessonCodes` now restricts the lessons, as it already did in the classroom scope. The personal daily challenge never sets it, so its behaviour is unchanged.
- `ChallengeQuestionPresenter` accepts a `DailyChallengeQuestion` or a `MadarRefuel`. There is still one boundary between the answer key and the client.
- Since 2026-11-09 it also serves by reference (`publicRef(lesson, exercise, question)`, used by « بوصلتي », `YEAR_COMPASS.md` §9), and the public
  question carries the WHOLE setup: `statement.{content, formulas, table, figure}` and the question's `lead`. Before that fix the
  `formulas` (« A = … ») and `table` were dropped, so « إليك العدد A حيث: » arrived alone and was unanswerable (811 statements have
  formulas, 361 a table). The web side renders them through `ExerciseStatement` (`EXERCISE_CONTRACT.md`).

## 17. Not built (Planned)

Seasons and special events; school-wide / curriculum-wide challenges; a
scheduled nightly settlement (not needed: penalties are applied on read and on
the next participation); pushing the challenge's weak points into the Next
Best Action engine (the `insights` payload is the integration point); the
same server-served questions for the practice engine (D5).
