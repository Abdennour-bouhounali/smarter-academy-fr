# « فضاء الألعاب » — the game space (« مدار »)

> **Authoritative** for the student game « مدار » (Madar, "orbit"): the play loop, hearts and the refuel station (« محطة التزوّد »), how a score is bounded by the server, the ships, the weekly class leaderboard, the teacher's settings, tab and board display, the API, data model, frontend files and tests.
> Implemented 2026-10-22. The code is the source of truth: `apps/api/app/Domain/Madar/` and `apps/web/src/features/madar/`.

## 1. What it is, and what it is not

Madar is a **game space** of four games in two families (since 2026-10-23):
- **« ألعاب ترفيهية »** (fun): the one-tap orbit runner « قفزة المدار », the tower defense « دفاع الكوكب » (§14) and the multi-level platformer « المستكشف » (§15). They are joined to learning by one rule: **hearts are earned by answering the student's own skills (الكفاءات) correctly.**
- **« ألعاب رياضيات »** (maths): « قنّاص القيم » (§16), « الدخيل » (§16ter) and « الحساب الذهني » (§16quater), where the maths IS the gameplay. A maths game is **free**: it costs no heart and has no revive. It adapts to the student over 50 levels.

The teacher can close any game for the whole class or for **one student** (§16bis).

```text
PLAY            a run costs ❤️; a revive after a crash costs ❤️
   │ out of hearts
   ▼
REFUEL STATION  one question from the student's skills, served without its answer key;
   │            correct → +❤️ (and an ordinary learning evidence)
   ▼
PLAY AGAIN      beat your record, climb this week's class ranking, unlock ships
```

The game owner made these decisions on 2026-10-22:
- The game does **not** have to be 100 % educational. Gameplay trains reflexes, attention and timing. The maths lives in the refuel station.
- Since 2026-10-23 the space also has maths games, where the maths is inside the mechanic. They are free (§16).
- **Finishing a lesson unlocks nothing in the game.** Ships unlock by flying far (personal record) or by correct refuel answers. Nothing is bought.
- The game is played on **phones and laptops**. It is the second exception to the tablet/laptop-only rule, after `/books`.

Two systems stay separate, as in `DAILY_CHALLENGE.md`:

| | Mastery (educational evidence) | Game (Madar) |
|---|---|---|
| Written by | `ProgressEngine::recordEvidence` only | `MadarService` only |
| Fed by | each refuel answer (practice weight, `source_id = madar:{uuid}`) | runs, hearts, ships, scores |
| Tables | `learning_evidence`, `student_learning_point_progress` | `madar_*` |

No heart or score ever touches mastery, and no mastery value is read as a score.

Madar is **not** a second exercise engine. Questions are references into `content/practice`, selected by the daily challenge's `ChallengeQuestionSelector`, presented by its `ChallengeQuestionPresenter`, evaluated by `AnswerEvaluator` and rendered by `features/practice/QuestionRenderer`.

## 2. The game: « مدار »

- **World.** The ship circles a planet on one of two lanes, inner and outer. There is **one gesture**: switch lanes. On a phone it is a tap anywhere; on a laptop it is a click, `Space`, `↑`, `↓`, `W` or `S`.
- **Speed.** Angular speed grows with game time, `ω = min(ωmax, ω0 + a·t)`, so one lap takes about 5 s at the start and about 1.75 s at the cap.
- **Obstacles** are generated from the **server's seed** (`engine/rng.js`, mulberry32):
  - single rocks;
  - zig-zags across both lanes;
  - asteroid belts (a long arc on one lane);
  - doubles;
  - from level 3, **comets** that hop to the other lane with a blinking red warning.
- **Pickups:**
  - **Stars** add points × a multiplier, which rises every 5 stars in a row up to ×4. A missed star resets the multiplier.
  - A rare **shield** absorbs one hit.
- **Near miss** (« مرور خاطف »): +10 points for leaving an obstacle's lane less than 0.28 s before reaching it.
- **Sectors.** Every five laps the planet changes: عطارد → الزهرة → الأرض → المرّيخ → المشتري → زحل → أورانوس → نبتون → الفضاء العميق. A banner announces it and the background hue shifts.
- **Camera.** The ship stays at the **bottom** of the orbit, within thumb reach, and the world turns. What is coming arrives from the left and moves down to the ship, in the Arabic reading direction.

### Code layers

The engine is **pure**: `engine/world.js` has no DOM and no clock. `step(world, dt)` advances it in fixed 1/120 s steps and returns events.

- `GameCanvas.jsx` runs the loop with `requestAnimationFrame`.
- `engine/render.js` draws it on a 2D canvas, all drawn in code:
  - starfield parallax, nebula, a planet per sector, lanes, rocks, belts, comets, stars, shields;
  - the ship and its trail;
  - particles, shake and flash.
- `engine/audio.js` synthesizes the sounds with WebAudio. There are no audio files, and the mute choice is stored per device in `localStorage`.
- `buzz()` vibrates phones.

Rendering rules:
- **No `shadowBlur`.** Glows are pre-rendered sprites drawn additively.
- The canvas sets `ctx.direction = 'ltr'`, because the page is RTL and "+3" would otherwise draw as "3+".
- Reduced motion (`useReducedMotion`) removes shake and flash and thins the particles.
- A hidden tab pauses the run, so a student never dies while away.

## 3. Hearts, runs, revives

| Rule | Default | Where |
|---|---|---|
| Max hearts | 5 | `config/madar.php › hearts.max` |
| Daily free hearts: on the first visit of the day (Algiers), hearts rise **to** this number, never above it and never accumulated | 3 (teacher: 0–5) | `hearts.daily_free`, `madar_class_settings.daily_free_hearts` |
| A run costs | 1 ❤️ | `MadarService::startRun` |
| A revive after a crash costs | 1 ❤️, at most 2 per run | `runs.max_revives` |
| Runs per day: the screen-time limit; a refused start costs nothing | 30 (teacher: 5–100) | `runs.daily_cap`, `daily_run_cap` |
| An open run older than this is abandoned (its heart was already spent) | 30 min | `runs.max_minutes` |
| Starting a new run abandons the open one | | |

Crash screen choices:
- « أكمل الرحلة » if the student has a heart;
- « حلّ تمرينًا وأكمل الرحلة » if they have none, which opens the refuel station in `revive` context — a correct answer, then « واصل الرحلة »;
- « أنهِ الرحلة ».

The game state goes **lobby → countdown → playing ⇄ paused → crashed → results**. The refuel station is reachable from the lobby, the results screen and the crash screen. The coach is shown once per device (`localStorage madar.coached`): a pulsing ring and one sentence, placed above the orbit on phones and beside it on laptops, and gone after the first lane switch.

## 4. The score is bounded by the server

The game runs in the browser and the server does not replay it. It does own the run's **start and finish** times, and the engine constants tell it the best score a perfect run could reach in that time (`MadarScoring`):

```text
distance(T) = ω0·T + a·T²/2                     until ω reaches ωmax
            = distance(Tc) + ωmax·(T − Tc)       afterwards
max per rad = points_per_rad + star_points·max_multiplier / star_min_gap_rad + near_miss_points / obstacle_min_gap_rad
bound(T)    = ⌈distance(T) × max per rad × 1.25⌉ + 200
```

A score above the bound is **clamped to it and the run is flagged** (`madar_runs.flagged`, `claimed_score` kept, `madar.score_clamped` logged). The teacher sees flagged runs per student.

The server's real duration is always at least the game time (pauses, revives, latency), so a real score is never clamped.

**Mirror contract:** `config/madar.php › physics` mirrors `engine/constants.js › PHYSICS`, and `engine/bound.js` mirrors `MadarScoring`. The generator guarantees the two gaps the bound relies on: obstacles are at least `obstacleMinGapRad` apart and stars at least `starMinGapRad` apart (`world.test.js` checks both). If you change a constant that raises the possible score, change it on both sides.

Stars sent by the client are capped by `score / star_points`. A second `finish` returns the first result unchanged (`duplicate: true`).

## 5. The refuel station (« محطة التزوّد »)

**Selection order** (since 2026-10-22):
1. skills already worked, without the items served in the last few days;
2. once those are exhausted, the student's other skills come **after** them (selector option `warmup`), still without repeating an item;
3. only if everything was served recently is an item repeated.

The order was changed because a new student's pool shrank to one or two skills and the station served the same questions again.


`POST /madar/refuel` returns the question already served and not yet answered, if it was served in the last 30 min (`refuel.open_minutes`). A reload does not change it.

Otherwise it serves a new question:
- **Scope.** `ChallengeQuestionSelector::select('student', …)` in the student's own scope: their grade's visible lessons, minus lessons their class hides. If the teacher picked lessons (`madar_class_settings.lesson_codes`), only those (`snapshot.lessonCodes`, honoured in the student scope since 2026-10-22).
- **Ranking.** The selector's usual order: skills to reinforce and recent mistakes first, then retrieval, with never-seen items preferred. Only items that count for mastery are served.
- **Variety.** Items served in the last 3 days (`refuel.cooldown_days`) are excluded through the selector's `exclude` option. If that empties the pool, the exclusion is dropped rather than blocking the game. The selector's `seed` option varies tie-breaks across the day, and the top three skills take turns.

Hearts:
- A **correct** answer (`Outcome::isSuccess`) gives `hearts.per_correct` (1), capped at max hearts.
- A partial or wrong answer gives none. The student sees the correct answer and one sentence of explanation, then gets another question.
- The station is closed when hearts are full (`hearts_full`).

The question is served **without its answer key** (`ChallengeQuestionPresenter::public`, which now also accepts a `MadarRefuel`). The same answer re-sent returns the recorded verdict; a different answer gets 409 `already_answered`.

Every judged answer becomes **ordinary learning evidence**: practice weight, `attemptId = evidence_attempt_id`, `sourceId = madar:{uuid}`.

On screen the question sits on a **white card** in the middle of the dark game. Maths reads best black on white.

**Why this question** (owner, 2026-10-23). At the bottom of the card, one line says why the selector chose the question: `refuel.reason`, which is `madar_refuels.reason` (`ChallengeQuestionSelector::REASON_*`). The sentence is always true to the reason:

| `reason` | Line shown |
|---|---|
| `reinforce`, `recent_mistake` | « اخترنا لك هذا التمرين لأنه يتناول كفاءة تحتاج إلى تدعيم » |
| `retrieval` | « … لتتذكّر كفاءة أتقنتها قبل مدّة » |
| `recently_learned` | « … لأنه يتناول كفاءة تعلّمتها مؤخرًا » |
| `review`, `warmup` | « … لتراجع كفاءة من برنامجك » |

A review question is never called « تحتاج إلى تدعيم ». The strings are in `madar.json › refuel.reason.*`.

## 5bis. Integrity — did the student do it themselves? (2026-10-22)

**This cannot be proven.** A second phone escapes every web page, and camera proctoring of 11–13-year-olds was ruled out.

The owner's decision is to make outside help (an AI) **costly**, to **protect mastery**, and to **signal** suspicious patterns to the teacher, who keeps the last word.

### Option 1 — A timer per question, scaled by difficulty

The time limit is resolved in this order (`MadarConfig::timeLimitFor`):
1. the teacher's limit for **this question** in this class (`madar_item_time_limits`);
2. the class's limit for its difficulty (`madar_class_settings.time_limits`);
3. the default for its difficulty (`refuel.time_limits`: 1 → 45 s, 2 → 60, 3 → 90, 4 → 120, 5 → 150; range 15–600 s).

The limit is **frozen at serving** (`madar_refuels.time_limit_s`), so a setting changed later does not move it.

The server owns the clock. The client gets `timeLimitS`, `servedAt` and `serverNow` and corrects the phone's clock (`serverElapsed`). At zero, `RefuelTimer` sends whatever the student has written.

An answer later than the limit plus `grace_seconds` (3 s of latency) gets **no heart** (`flag: timeout`). An open question past its limit is closed as `timeout` when the student asks for another, so leaving to look up the answer and coming back gains nothing.

### Option 2 — Leaving the page gives no heart

`useLeaveDetector` watches `visibilitychange` and `blur`. On return, an absence of at least 1.5 s (`leave_min_ms`) is reported with `POST /madar/refuel/{uuid}/left`. Shorter absences, such as a notification or the phone keyboard, don't count.

As a fallback, the answer itself carries `left: true` if the `/left` call was lost. The question stays to be solved (to learn), but it earns **no heart** (`flag: left`).

Pasting or dropping into the answer field is **blocked** (`onPasteCapture`).

The rule is stated **before** answering (`refuel.rules`), never discovered afterwards. A banner appears as soon as the student comes back.

### Option 4 — Mastery is protected

Only an answer with **no flag** becomes learning evidence (`evidence_recorded`). Answers that are timed out, left or « fast » never enter mastery.

« fast » means correct, difficulty ≥ 3, and answered in less than `max(5 s, 12 % of the limit)` (`refuel.fast`). It still earns the heart, but not the evidence. The flag is shown to the teacher only, never to the student.

### Option 3 — « تستحق نظرة » — signals, never accusations

`ClassMadarService::results` → `students[].alerts`:

| Alert | When (this week) |
|---|---|
| `gap` | refuel accuracy − **practice** accuracy on the same skills (evidence outside `madar:`, last 60 days) ≥ 0.4, with ≥ 6 refuel answers and ≥ 4 practice answers |
| `timeouts` / `leaves` / `fast` | ≥ 3 such answers |
| `score` | a run score clamped to the bound (§4) |

In the class tab these appear as amber chips with a tooltip, and a banner « n تلاميذ يستحقّون نظرة » says "signals, not accusations: check with the student in class".

### Option 5 — The teacher gives or takes hearts

`POST /teacher/classrooms/{id}/madar/hearts {studentId, delta (±1…5), reason: effort | cheating | other, note?}`. It applies to **active members only**, capped at max hearts and floored at 0.

The journal (`madar_heart_adjustments`) keeps both what was asked and what was applied:
- **effort:** shown in class or off the platform;
- **cheating:** confirmed;
- **other.**

The student sees it **once**, with the reason and the teacher's note, as a notice in the lobby (`state.adjustments`). It is marked read when served, and the page keeps it until the student dismisses it.

The tab shows the last 20 changes and whether the student has seen each one.

**What was not built:** camera or screen recording, and copy-paste detection outside the answer field. Both were rejected as invasive or useless against a second device.

## 6. Ships

The rules live in `MadarShips::CATALOGUE`. The look lives in `engine/ships.js`: hull path, cockpit and colours, drawn on the canvas in flight and as SVG in `ShipIcon.jsx`.

| id | Name | Unlocks at |
|---|---|---|
| `sahm` | سهم | always |
| `saqr` | صقر | record 800 |
| `mudhannab` | مذنّب | 5 correct refuel answers |
| `nayzak` | نيزك | record 2,500 |
| `falak` | فلك | 20 correct refuel answers |
| `majarra` | مجرّة | record 6,000 (rainbow trail) |

The lobby shows the **next goal**: the locked ship closest to its threshold, with a progress bar. Newly unlocked ships come back in the `unlocked` field of `finish` and `answer`, and the results screen celebrates them. `PATCH /madar/ship` refuses a locked ship.

## 7. Weekly class leaderboard

Season = **one week, Sunday to Saturday (Algiers)**: `madar_runs.week_start`. Everyone starts from zero each Sunday.
- Players' class = their **primary class** (`StudyContextService`).
- Ranking = each **active** member's best finished score of the week (`MadarLeaderboard`). Ties go to who reached the score first, then to the lower id. One query.
- Students see the top 10 (first name + initial, ship, score), their own row and the participant count, **only if** the teacher left « ترتيب الأسبوع ظاهر للتلاميذ » on.
- An independent student sees an invitation to join a class instead.
- `finish` returns `rank.before / rank.after`. The screen shows « تقدّمت إلى المرتبة n » only when the rank really improved, and never a "you dropped" message.

## 8. Teacher surfaces

Class tab **« لعبة مدار »** (`features/teacher/madar/MadarTab.jsx`, lazy, own `<Suspense>`):
- a week picker;
- tiles: players / members, runs, refuel answers, accuracy;
- a per-student table: rank, week best, runs, refuel correct / answered, all-time record, ship, flagged runs;
- settings:
  - game open for the class;
  - leaderboard visible to students;
  - daily free hearts, which can be set to 0 so that every heart is earned;
  - daily run cap;
  - refuel lessons.

Closing the game answers `disabled_by_teacher` to the class's students: lobby, runs and refuel are all closed.

Board display at `/enseignant/classes/:id/madar/affichage`:
- outside the teacher shell, full screen;
- a podium for the top 3 and ranks 4–10, readable from five metres;
- participation « n من m »;
- refreshes every 15 s; `Escape` returns to the tab.

## 9. API

```text
# student (auth + verified + learner)
GET    /madar                          state: available/reason, hearts, max, daily free, runs today/cap, max revives, best, week best,
                                       refuel tallies, ship + ships (rules, progress), scope, competition (top 10 + me | null)
POST   /madar/runs                     → run {id, seed, revives}, hearts, runsToday          (no_hearts, daily_cap, disabled*)
POST   /madar/runs/{uuid}/revive       → revives, hearts                                     (revive_limit, no_hearts, run_closed)
POST   /madar/runs/{uuid}/finish       {score, stars} → run {score, stars, durationMs, flagged}, best, newBest, weekBest,
                                       rank {before, after} | null, unlocked[], hearts       (idempotent: duplicate)
PATCH  /madar/ship                     {ship}                                                (ship_locked)
POST   /madar/refuel                   → refuel {id, content (no key), learningPoint, lesson}, hearts   (hearts_full, nothing_to_refuel)
POST   /madar/refuel/{uuid}/answer     {answer|null, left?} → result {outcome, isCorrect, heartsAwarded, flag (timeout|left|null), responseMs,
                                       timeLimitS, reveal}, hearts, refuel tallies, unlocked[]
POST   /madar/refuel/{uuid}/left       {awayMs} → {left}                     (absence < 1.5 s ignored)

# teacher (can:teacher + ClassroomPolicy, `manage` to write)
GET|PATCH /teacher/classrooms/{id}/madar/settings   {enabled, competitionEnabled, dailyFreeHearts, dailyRunCap, lessonCodes, timeLimits {"1".."5": s}}
GET    /teacher/classrooms/{id}/madar/items          questions served to the class (30 days): statement, skill, difficulty, stats, effective limit
PUT    /teacher/classrooms/{id}/madar/time-limits    {itemKey, seconds|null}   one question's limit (null = back to its difficulty)
POST   /teacher/classrooms/{id}/madar/hearts         {studentId, delta, reason, note?}
GET    /teacher/classrooms/{id}/madar/results?week=YYYY-MM-DD
GET    /teacher/classrooms/{id}/madar/display?week=
```

Refusals carry a closed `reason` (`MadarException`): 404 `not_found`; 409 `run_closed`, `already_answered`; 422 for the rest. The client renders Arabic from `madar.json › reasons.*`.

## 10. Data model

- `madar_profiles`: one row per student. Hearts, `hearts_refilled_on`, best score and when, run, star and refuel tallies, ship.
- `madar_runs`: uuid, user, class, `run_date`, `week_start`, seed, status `in_progress | finished | abandoned`, server `started_at` / `finished_at` (ms), duration, claimed score, kept score, stars, revives, flagged.
- `madar_refuels`: uuid, user, class, lesson, skill (learning point), exercise / question / item key, template, difficulty, answer type, selector reason, served / answered (ms), answer, outcome, `is_correct`, hearts awarded, `evidence_attempt_id`.
- `madar_class_settings`: one row per class, now also `time_limits`. No row means the defaults.
- `madar_refuels` integrity columns (migration `2026_10_22_000002`): `time_limit_s` (frozen), `response_ms`, `left_at`, `left_count`, `flag`, `evidence_recorded`.
- `madar_item_time_limits`: (class, `item_key`) → seconds.
- `madar_heart_adjustments`: class, student, teacher, delta, applied, reason, note, `seen_at`. A journal.

`madar_refuels` references lessons and skills (learning points) and holds student answers. `smarter:scope-curriculum` therefore declares it both as a dependent table and as **student data**, so a curriculum cleanup refuses to run while one exists.

## 11. Screens and responsiveness

The page `/espace/madar` is full screen and **outside `StudentLayout`**: no sidebar, no tab bar.
- **Phone, portrait (390×844):** title, then the visible orbit, then one column (launch panel, leaderboard, hangar). Buttons are at least 52–68 px. Sheets stick to the bottom on phones and are centred from `sm`. The refuel buttons are sticky at the bottom.
- **Laptop (1366×768):** the launch column on the start side, the leaderboard and hangar on the end side, the orbit in the middle.
- **Orbit radius:** `min(0.36·w, 0.34·h)`, so both lanes and the ship fit at both sizes.
- **Colours:** dark space for the game world, a deliberate exception to the light challenge pages; the question card is white. Every number is in `dir="ltr"` and every name in `<bdi>`. The « −1 ❤️ » cost is the `CostBadge` component, with fixed left-to-right order.

## 12. Frontend files

```text
services/madarService.js, services/teacher/madarService.js
features/madar/engine/   constants.js (PHYSICS mirror, lanes, sectors) · rng.js · world.js (pure sim) · bound.js (server bound mirror)
                         render.js (canvas) · fx.js (particles, floaters, shake) · audio.js (WebAudio + buzz) · ships.js
features/madar/madarModel.js                 pure UI helpers (score format, crash options, rank movement, next ship, play blocker)
features/madar/components/                   GameCanvas, Hud, Lobby, Leaderboard, ShipBay, ShipIcon, HeartsRow, CostBadge, Panel,
                                             Sheet, CrashSheet, PauseSheet, Results, RefuelStation, Countdown (+ Coach)
pages/student/madar/MadarPage.jsx            the state machine (lazy route /espace/madar)
features/teacher/madar/MadarTab.jsx          class tab (reuses Toggle from dailyChallenge/ClassChallengeSettings)
pages/teacher/MadarDisplayPage.jsx           board display (own <Suspense>)
i18n/locales/ar/madar.json                   ON-DEMAND namespace (BUNDLE_BOUNDARIES.md); nav labels in `nav`, tab label in `teacher`
```

Entry cost: two nav strings, one tab label and one error key. Everything else is in lazy chunks (`MadarPage` ≈ 70 KB raw).

## 13. Tests that own this document

| Test | Locks |
|---|---|
| `apps/api/tests/Feature/MadarFlowTest.php` | daily hearts (once, up-to, never cumulative); a run costs a heart; a new run abandons the open one; daily cap; plausible score kept + record + ship unlock; impossible score clamped + flagged; idempotent finish; revive cost + limit; refuel served without key and stable; correct answer → +❤️ + evidence `madar:{uuid}`; wrong → nothing + correction; replay / 409; hearts full; no recently served item; ships locked / unlocked; another student's run 404; teacher 403; global switch |
| `apps/api/tests/Feature/MadarClassTest.php` | week leaderboard (first name + initial, no last name, no email); real rank movement; new week from zero; a student who left disappears; teacher closes the game; competition off hides the ranking; daily hearts and cap; refuel lesson scope; teacher week view; display without last names; owner-only |
| `apps/api/tests/Unit/Madar/MadarScoringTest.php` | distance curve and cap; monotonic bound; settle keeps / clamps; a perfect minute is within the bound |
| `features/madar/engine/world.test.js` | seed determinism; speed curve; lane switch; crash; revive clears the road; **minimum gaps the bound relies on**; **long autopilot runs never exceed the perfect-play bound**; multiplier; sectors |
| `apps/api/tests/Feature/MadarIntegrityTest.php` | the limit follows the difficulty and is frozen; past the limit = no heart, no evidence; network grace; an open question past its limit is closed and replaced; leaving forfeits heart + evidence (a short absence is ignored, survives reload, client fallback); fast = heart without evidence; a normal answer earns and proves; teacher limits per difficulty and per question (range, unknown item, reset); teacher gives / takes hearts (cap, floor, reasons, range, non-member, seen once, history); another teacher 403; repeated leaves → alert; game ≫ practice → `gap` |
| `apps/api/tests/Feature/MadarDefenseTest.php` | the week's map is the same for the class and changes each week; a Defense game costs a heart; first ship + laser always open; record + turret unlock; impossible wave/score clamped; separate weekly leaderboard per game (student, teacher tab, display); the teacher closes one game; emergency shield = revive |
| `apps/api/tests/Unit/Madar/DefenseScoringTest.php` | fixed schedule, wave reached bounded by time, settle keeps / clamps, the cap counts completed waves and bosses |
| `features/madar/defense/sim.test.js` | waves at their fixed instants; the map comes from the seed; an undefended planet falls and the shield revives it; build / upgrade / sell; locked turret refused; a defended planet holds and scores; **never above the server cap or a later wave**; beam resistance |
| `features/madar/madarModel.test.js` | the pure UI helpers, including the timer, absence and adjustment helpers |
| `apps/api/tests/Feature/MadarSniperTest.php` | the value sniper (§16) and closing a game for one student (§16bis) |
| `features/madar/sniper/cards.test.js` | exact values; **each displayed card re-read by an independent evaluator** (11,520 cards); 8 distinct cards, 3–4 equal, never the target as written; levels in order then mixed; seed determinism |
| `features/madar/sniper/sim.test.js` | fixed round instants; hit, trap, landed equal card; no revive; multiplier and perfect round; **a perfect player stays within the server bound and the reachable round**; attract mode; seed determinism |

## 14. « دفاع الكوكب » — Planet Defense (2026-10-22)

The second game in the « مدار » arcade, a tower defense that trains **planning and strategy**. In the lobby a picker switches between « قفزة المدار » (the orbit runner, game id `orbit`) and « دفاع الكوكب » (`defense`), with `?game=defense` in the URL.

**Shared with the orbit game:** hearts (a game costs one; an **emergency shield** = a revive), the refuel station, the integrity rules (§5bis), the daily run cap (all games combined), and the teacher's controls. **Per game:** runs, record, weekly ranking, and unlocks.

### How it plays

- **The board.** Ships come from the edge and spiral toward the planet. The student taps one of **14 slots**, on two rings, to build a turret, then taps it again to upgrade (levels 1–3) or sell it (60 % refund).
- **Slow motion.** The menu sits at the bottom of the screen, and time runs at 30 % while it is open.
- **Laptop shortcuts:** `1–5` build, `U` upgrade, `S` sell, `Esc` close.
- **Turrets:**
  - laser (continuous beam, **locks on** to a target until it dies or leaves range);
  - frost (slows everything in range);
  - pulse (damages everything in range at once);
  - rail (long range, hits the toughest);
  - tesla (lightning that chains).
- **Enemies:**
  - scout;
  - swarm;
  - tank;
  - shield: beam weapons do only half damage, so the student needs a pulse or a rail;
  - a **boss** every 5 waves.
- **Waves follow a FIXED schedule.** Wave 1 starts at 4 s; wave k+1 starts after wave k's spawn window (10 + k s, at most 22) plus 5 s. Nobody can speed it up.
- **Telegraphed entries.** Red chevrons show **where** the next wave will come from during the 5-second gap, so placement is a real decision.
- **Score** = points for enemies destroyed (scout 5, swarm 2, tank 15, shield 10, boss 150) + 100 × k when wave k is **completed**. Destroyed enemies also give **crystals**, the currency for turrets (150 at the start, plus a bonus per wave). The game ends when the planet's health (20) reaches 0.
- **Emergency shield:** health back to 10, nearby enemies destroyed with no points, 2 s of grace. Costs one heart, at most 2 per game.
- **The weekly map.** The server seed is `crc32("defense|c{class}|{week}")`, so **the whole class plays the same map all week** and the ranking compares like with like. An independent student gets their own map per week.

### Score cap (`DefenseScoring`)

Because the schedule is fixed, the real duration T caps the wave reached:

```text
wave reached ≤ max { k : start(k) ≤ T }
score        ≤ Σ completed waves (start(k+1) ≤ T) of 100·k
             + Σ started waves of n_k·15 (+150 for a boss)
```

This is multiplied by 1.1, plus 100. Anything above is clamped and flagged. `config/madar.php › defense` mirrors `features/madar/defense/constants.js › SCHEDULE`, and `defense/bound.js` mirrors `DefenseScoring`. `sim.test.js` plays long bot games and checks they never exceed the cap.

### Turrets unlock by playing, never by finishing a lesson

`MadarTurrets::CATALOGUE`:

| Turret | Unlocks at |
|---|---|
| laser | always |
| frost | wave 4 reached |
| pulse | 3 correct refuel answers |
| rail | wave 8 reached |
| tesla | 12 correct refuel answers |

New unlocks arrive in `unlockedTurrets`, returned by `finish` and by refuel `answer`.

A rule of `null` means "always open". It is checked with `array_key_exists`, not `??`, because `null ?? false` is `false`. That bug briefly reported the first ship and the laser as locked; it is locked by a test now.

### API, data, teacher

- **API:**
  - `POST /madar/runs {game}`;
  - `POST …/finish {score, stars (= kills), wave}`;
  - `GET /madar` adds `games[{id, enabled}]` and `defense{best, bestWave, runsCount, weekBest, turrets, competition}`;
  - a closed game answers `game_disabled`.
- **Data:**
  - `madar_runs.game` and `madar_runs.wave`;
  - `madar_profiles.defense_best`, `defense_best_at`, `defense_best_wave`, `defense_runs`;
  - `madar_class_settings.disabled_games` (migration `2026_10_22_000003`).
- **Teacher:**
  - the class tab has a game picker (`?game=`), and in Defense mode a « أبعد موجة » (furthest wave) column;
  - a setting « الألعاب المفتوحة » closes one game without closing the other;
  - the board display takes `?game=` and shows each player's wave.

### Frontend

- `features/madar/defense/`: `constants.js` (schedule mirror, slots, enemies, turrets), `sim.js` (pure simulation and the attract-mode bot), `bound.js`, `render.js` (canvas).
- `components/DefenseCanvas.jsx`, `DefenseHud.jsx` (score, wave, next-wave timer, crystals, planet health, wave banner), `BuildMenu.jsx`, `TurretIcon.jsx`, `TurretBay.jsx`.
- `MadarPage` runs both games through the same state machine.
- **Balance**, measured with the bot and no emergency shields: it survives 5 to 11 waves, 1.5–3.5 minutes. A student who places turrets toward the entries does better.

## 15. The game space and « المستكشف » (2026-10-22)

### The student space: `/espace/jeux`

`GamesHub` is full screen. It holds what the games **share**:
- the hearts and their daily rule, and today's runs out of the cap;
- the refuel station (`RefuelStation`, `base` context);
- the teacher's heart messages (`AdjustmentNotice`).

The cards are grouped in **two sections**, from `GET /madar › games[].category` (`MadarRun::CATEGORIES`), **maths first** (owner, 2026-10-23):
- « ألعاب رياضيات » (`math`), on top: free, with a « مجانية » badge (`games[].free`), adapted to the student's level (§16);
- « ألعاب ترفيهية » (`fun`), below: each run costs a heart.

Each game is a card with a code-drawn illustration, the skill it trains, a short description, the record (orbit score, defense wave, explorer stars, sniper score) and the week's rank. Clicking a card opens `/espace/jeux/:game` (`orbit | defense | explorer | sniper`). That page is `MadarPage`: the same state machine, with the game taken from the URL, and « فضاء الألعاب » as the back link.

- A game the teacher closed stays visible but **locked**: « أغلق أستاذك هذه اللعبة » for the class, « أغلق أستاذك هذه اللعبة لك » for this student only (`games[].closedBy`: `class | student`).
- `/espace/madar` redirects to the space.
- The student navigation entry is « فضاء الألعاب » (`/espace/jeux`).

### The teacher space: `/enseignant/jeux`

`TeacherGamesPage`, with the « فضاء الألعاب » entry in the teacher navigation (not on the mobile bar). The teacher picks a class (`?classe=`) and gets the full panel (`MadarTab`):
- a picker for **the four games**;
- per student, a « الألعاب » button that opens a dialog to close games for **this student only** (§16bis);
- the week's tiles, with « تستحق نظرة » alerts;
- the heart dialog and its history;
- the refuel questions with their time limits;
- settings: the class's games open or closed (`disabledGames`), daily hearts, run cap, lessons, times per difficulty;
- the board display.

The same panel is the « فضاء الألعاب » tab on each class page.

### « المستكشف » — the platformer

This is **an original game in the platformer genre**. No character, name or graphic is taken from an existing game. The hero is an astronaut, and the level runs **right to left**, the Arabic reading direction: ← moves forward. A run is one level. There are **12 levels in 3 worlds** (the Moon 1–4, Mars 5–8 with lava, the Nebula 9–12).

**In a level:**
- run, and a variable-height jump (with grace time and jump buffering);
- **crystal blocks** to hit from below (+10);
- a **shield block** (protects from one hit);
- free crystals;
- **slimes** and **drones** to stomp (+50), **spiked crawlers** to avoid;
- spikes, lava, pits, springs, platforms you can jump up through;
- a **beacon** checkpoint;
- the **rocket** at the end;
- a timer.

**Score** = crystals + blocks + enemies + shield + (1000 + 100·level) on completion + 5 points per second left.

**Revive** (one heart, up to 2 per level, or a refuel answer when out of hearts): restarts at the last beacon, with 2 s of grace and at least 30 s on the timer.

**Three stars, computed by the server:**
1. reaching the rocket;
2. collecting all crystals (free ones and those in blocks);
3. finishing **with no revive** (the server knows the revives).

The **next level unlocks** when the previous one is completed (`madar_level_progress.completed_at`). A locked level answers `level_locked`. Finishing a lesson unlocks nothing.

**One file shared by both sides:** `apps/api/resources/games/explorer/levels.json` holds the maps, the physics and the scoring.
- It is built by `scripts/games/build-explorer-levels.mjs`, which assembles levels deterministically from pieces whose playability holds by construction: gaps ≤ 3, steps ≤ 2, a high ledge only after a spring.
- `npm run check:explorer-levels` fails if the committed file no longer matches the script.
- The web app imports it (`features/madar/explorer/sim.js`), and the API reads it (`ExplorerLevels`).

**Score cap (`ExplorerLevels`):** the score is capped at the level's **maximum** (everything collected plus the full time bonus, + 50). A "completed" claimed faster than `(rocket x − start x) / runSpeed × 0.8` is **not counted as completed**, and is flagged.

**Playability is proven:** `solver.js` runs a depth-first search over copies of the world with the real physics (run, wait, jumps of several heights, hops). It **completes all 12 levels** in about 0.1 s each, and `sim.test.js` fails if a level becomes impossible or if a winning run exceeds the server's cap.

**Controls:**
- **Keyboard:** ← / A forward, → / D back, Space / ↑ / W jump.
- **Touch** (`TouchControls`, shown when `pointer: coarse`): two arrows and a large jump button, multi-touch.
- On a phone held upright, a tile is `min(available height / 14, width / 11)`, so the level fits above the controls.

**API:**
- `POST /madar/runs {game: 'explorer', level}` → `run.level`;
- `POST …/finish {score, stars (= crystals), completed}` → `level {n, stars, bestStars, newStars, crystals, totalCrystals, completed, nextUnlocked, next}`;
- `GET /madar` → `explorer {levels[{n, world, unlocked, completed, stars, best, crystals}], totalStars, maxStars, best, weekBest, competition}`.

**Data** (migration `2026_10_22_000004`): `madar_runs.completed`; `madar_level_progress` (user, game, level, best score, stars, attempts, `completed_at`).

**Teacher:** in Explorer mode the table shows total stars and levels completed out of 12.

**Frontend:**
- `features/madar/explorer/`: `sim.js` (pure physics), `render.js` (mirrored canvas, 3 world themes, astronaut, enemies, blocks, rocket, parallax), `bot.js` (the bot behind the lobby), `solver.js` (the proof);
- `components/ExplorerCanvas.jsx`, `ExplorerHud.jsx`, `TouchControls.jsx`, `LevelMap.jsx`, `ExplorerResults.jsx`;
- `pages/student/madar/GamesHub.jsx`, `pages/teacher/TeacherGamesPage.jsx`.

**Tests:**
- `apps/api/tests/Feature/MadarExplorerTest.php`: level 1 open; unlock and 3 stars; stars need all crystals and no revive; a failed level unlocks nothing; too fast = not completed; score cap; own ranking and teacher view; the shared file is valid;
- `features/madar/explorer/sim.test.js`: levels load; landing and running; variable jump; death and revive; **all 12 levels can be completed**; winning runs stay within the server cap.

## 16. « قنّاص القيم » — the value sniper, the first maths game (2026-10-23)

**Goal: observation.** The student sees an expression and recognises its value.

**How it plays:**
- **The board.** Asteroids fall from the top, each carrying an expression on a **white plate** (black on white). The TARGET (a value) sits in the HUD on a white card.
- **Hitting.** The student taps only the asteroids **equal** to the target. A cannon on the planet fires at the card.
- **Gestures.** One gesture: tap or click. It is played on phones and laptops (§11).
- **A round** = one target and **8 cards**, 3 or 4 of them equal. The rest are **traps**: the real mistakes of 11–13-year-olds.

**Feedback shows the value; it never states the rule:**

| Event | Effect |
|---|---|
| equal card hit | + (10 + 2 × (level − 1)) × multiplier (×1 → ×4, one step every 5 hits in a row) |
| trap hit | −1 shield, the streak drops, and the card shows « = » **what it is really worth** (red plate) |
| equal card that lands | −1 shield, it shows « = » the target (green plate) |
| trap that lands | nothing: well seen |
| perfect round (all equal cards hit, no fault) | + 3 × the level's points, and one shield back (3 at most) |

**No revive.** At 0 shields the run ends and the results screen opens directly. The game is free: the student just plays again.

### 50 levels × 3 sub-levels, adapted to the student (2026-10-23, owner)

The maths games cover **the whole cycle moyen**: 50 levels in 11 families, each in three sub-levels أ / ب / ج (bigger numbers, subtler traps). A **position** is a sub-level, from 0 to 149, with `position = (level − 1) × 3 + (sub − 1)`. The catalogue is `features/madar/sniper/levels.js`, mirrored in `config/madar.php › sniper`.

| Family | Levels |
|---|---|
| الأعداد الطبيعية والعمليات | 1 sums · 2 differences · 3 times tables · 4 division |
| أولويات العمليات والأقواس | 5 + and − together · 6 × before + · 7 parentheses · 8 compound priorities |
| القواسم والمضاعفات | 9 prime factorisation · 10 PGCD · 11 PPCM |
| الكسور | 12 equivalent · 13 simplifying · 14 same denominator · 15 different denominators · 16 product · 17 quotient · 18 fraction of a number |
| الأعداد العشرية والنسب المئوية | 19 fraction ↔ decimal · 20 decimal operations · 21 percentage · 22 percentage of a quantity |
| الأعداد النسبية | 23 sum · 24 difference · 25 product and quotient · 26 compound |
| القوى | 27 powers of an integer · 28 same-base rules · 29 powers of 10 · 30 scientific notation · 31 power of a product |
| الجذور التربيعية | 32 perfect squares · 33 simplifying · 34 product and quotient · 35 sums · 36 rationalising the denominator |
| الحساب الحرفي | 37 reducing · 38 simple expansion · 39 double expansion · 40 (a + b)² · 41 (a − b)² · 42 (a − b)(a + b) · 43 factorising |
| المعادلات | 44 x + a = b · 45 ax + b = c · 46 parentheses / unknown on both sides · 47 value of an expression |
| حساب المثلثات | 48 sin and cos of 30°, 45°, 60° · 49 tan · 50 relations (sin² + cos² = 1, tan = sin ÷ cos) |

**Three ways to read a card** (the level's `mode`):

| Mode | The card is equal when… | HUD prompt |
|---|---|---|
| `value` | its value equals the target | « أصِب ما يساوي » |
| `solution` | it is an equation whose solution is the target | « أصِب المعادلات التي حلّها » |
| `at` | its value at x = a is the target | « أصِب ما قيمته عندما x = a » |

**The traps are the real mistakes** of 11–13-year-olds:
- left-to-right reading and parentheses ignored;
- numerators and denominators added, or a fraction inverted;
- a misplaced decimal comma;
- the sign of a signed number, or of an exponent, forgotten;
- exponents multiplied;
- √(x + y) taken for √x + √y;
- distributivity forgotten, and (a + b)² = a² + b²;
- in an equation, a term moved across without changing its sign;
- (2x)² for 2x².

**Placement by year.** The first game starts at the entry level of the student's year (`sniper.entry`):

| Year | Entry level |
|---|---|
| 1AM | 1 |
| 2AM | 5 |
| 3AM | 12 |
| 4AM | 19 |

The entry is taken from what the earlier years already covered: **never start hard** (owner, 2026-10-23).

Everything before the entry is **open** (the earlier years), and so is everything up to the highest position the student has reached. The student can replay any open level from the lobby's level map (`POST /madar/runs {game: 'sniper', level}`); a closed one answers `level_locked`.

**Never start hard: the warm-up** (owner, 2026-10-23, every maths game).
- Every game opens **two levels below** the student's position, `home` (`WARMUP_DROP` = 6 positions, mirrored by `sniper.warmup_drop`).
- Its **first round costs no shield** (`isWarmingUp`; the HUD shows « 🔥 جولة إحماء — أخطاؤها لا تكلّف دروعًا »).
- Below `home`, a round with at most one fault climbs **a whole level**, never above `home`.
- The student wins first, then the level rises progressively.

**Adaptation (`sniper/adapt.js`), after each round:**

| The round | The position |
|---|---|
| below `home`, at most one fault (the warm-up) | one level up, never above `home` |
| perfect (all equal cards hit, no fault) | one sub-level up |
| 2 faults or more (a trap hit, an equal card landed) | one sub-level down |
| two such bad rounds in a row | a whole level down |
| otherwise | unchanged |

- A rise is announced in the HUD (« أحسنت! ارتقيت إلى المستوى n ب »). A step down is worded as practice, never as failure (« نتمرّن قليلًا… »).
- The results screen shows the change from → to.
- The server keeps the position per student and per game (`madar_math_progress`: position, best position, rounds). The next game resumes there.

**Truth comes from the exact value, not from the template.**
- Each card carries a value: a reduced rational, (n/d)·√r simplified, or a polynomial. It is « equal » only if its key equals the target's.
- A trap that would be equal by accident is dropped, and so are duplicates, commuted sums included.
- `cards.test.js` re-reads **every displayed card** with an independent evaluator: ×, ÷, −, the decimal comma, %, fractions, √, exponents, x, sin / cos / tan in degrees, PGCD, PPCM, linear equations solved, the value at x = a.
- The check runs on all 50 levels × 3 sub-levels × 10 seeds × 4 rounds: 48,000 cards.

Decimals are written with a **comma** (`0,75`), as in the platform's exercises.

### Schedule and server bound

The rounds follow a **fixed schedule** (`sniper/constants.js › SCHEDULE`, mirrored in `config/madar.php › sniper`):
- round k starts at `roundStart(k)`, and its 8 cards appear every `gap(k)` seconds (1.6 s, falling to 0.85);
- a card takes `fall(k)` to reach the ground (7.5 s, falling to 4);
- 2.5 s of breather separate two rounds.

Nobody can speed the schedule up. During the warm-up the position stays at or below the student's `home` = s0; above it, it rises **at most one sub-level per round**. So the duration T and s0, which the server stores in `madar_runs.level_start`, bound everything (`SniperScoring`, mirrored by `sniper/bound.js`):

```text
round reached     ≤ max { k : roundStart(k) ≤ T }
level of round k  ≤ level(s0 + k)
score             ≤ Σ cards spawned by T of points(level) × 4  +  Σ rounds started of 3 × points(level)
end position      ∈ [s0 − 6 (warm-up) − 3 × rounds, s0 + rounds]
```

The score bound is multiplied by 1.1, plus 100. Anything above is clamped and flagged; a position outside its range is clamped too.
- `finish {score, stars = hits, wave = round, position, peak}`. It answers with `level {from, to, change}` and stores `madar_runs.level_end`.
- Hits are capped by score / 10.
- `sim.test.js` checks that a perfect player, starting from 0, 33, 97 or 146, never exceeds `perfectScore(T, s0)`, `maxRound(T)` or `s0 + rounds`.

**The week's targets.** The seed is `crc32("sniper|c{class}|{week}")`, as for Defense. Each round's content depends on (seed, round, level, sub-level): classmates at the same level get the same targets.

### Free, no revive

- `MadarRun::FREE_GAMES`: `startRun` neither checks nor spends a heart.
- `revive` answers `revive_limit`.
- The **daily run cap still counts** this game: it is a screen-time limit.
- The record is read from `madar_runs`, the level from `madar_math_progress`.
- `GET /madar › sniper {best, bestRound, runsCount, weekBest, competition, position, level, sub, bestPosition, bestLevel, entryLevel, unlockedUpTo, levels, subLevels}`.
- The leaderboard and board display show « ج n » (the round).
- The teacher's table shows each student's maths level and the highest reached (`students[].mathLevel`).

### Code

- `features/madar/sniper/`:
  - `levels.js`: the 50 levels, families, entry by year, positions;
  - `cards.js`: exact values, the 50 generators, `makeRound(seed, k, {level, sub})`;
  - `adapt.js`: the step up or down;
  - `constants.js`: the schedule and points mirror;
  - `sim.js`: the pure simulation, `step` / `tap`, the position changing round after round, plus the attract-mode autopilot;
  - `bound.js`;
  - `mathDraw.js`: maths on the canvas — stacked fractions, a drawn radical, exponents, written piece by piece from left to right because the page is RTL;
  - `render.js`: asteroids, plates, the cannon, the ground;
  - tests `cards.test.js` and `sim.test.js`.
- Components:
  - `SniperCanvas.jsx`: `dir="ltr"` canvas, loop, tap, feedback, level change;
  - `SniperHud.jsx`: target card with its prompt, score, 3 shields, multiplier, level n أ/ب/ج, the level-change banner;
  - `MathTokens.jsx`: the same expression in DOM, `dir="ltr"`, `role="math"`;
  - `MathLevelMap.jsx`: the student's position, a bar over 150 sub-levels, the map of the 11 families with open and closed levels.
- The lobby shows « مجانية » instead of the cost. The coach sits under the field so it does not cover the target.
- API: `SniperScoring.php` (positions, entry, bound, settle), `MadarMathProgress`, `MadarRun::GAME_SNIPER / CATEGORIES / FREE_GAMES`, `MadarService::sniperView / mathProgress / levelChange`. Migration `2026_10_23_000003`.

**Future maths games reuse this framework**: the same 50 levels, positions, adaptation and progress table, with `game` as the key.

**Not a source of learning evidence.** Like every game score, a sniper run never touches mastery. Only the refuel station writes evidence.

## 16bis. Closing a game for one student (2026-10-23)

The class-wide switch (`madar_class_settings.disabled_games`) is unchanged. On top of it the teacher can close games for **one active student** of the class.

- **API:** `PUT /teacher/classrooms/{id}/madar/students/{studentId}/games {disabledGames: string[]}`.
  - It replaces the whole list; `[]` reopens everything.
  - Refusals: `student_not_in_class` and `unknown_game` (422); 403 for another teacher's class.
- **Data:** `madar_student_game_blocks` (classroom, student, game, teacher; unique on the three). Migration `2026_10_23_000002`.
- **Effect:**
  - `MadarService::context` reads the blocks of the student's play class;
  - `startRun` refuses with `game_disabled_for_student`, or `game_disabled` when the whole class is closed (the class wins);
  - `GET /madar › games[].closedBy` is `class | student | null`.
- **Teacher:**
  - `results.students[].disabledGames`;
  - the « الألعاب » column: « كلها مفتوحة » or « n لعبة مغلقة »;
  - `StudentGamesDialog`: checkboxes grouped fun / maths, with a game closed for the class shown greyed out as « مغلقة للقسم ».

**Tests:** `MadarSniperTest` covers:
- free start, even at 0 hearts;
- no revive, and the daily cap counts;
- the same week seed for the class, different from Defense's;
- a plausible score kept and the record set;
- an impossible round or score clamped and flagged;
- the separate leaderboard and teacher view;
- a game closed for one student only (other students unaffected, the class closure wins, reopening);
- the refusals: outsider, unknown game, another teacher.

## 16ter. « الدخيل » — the odd one out, the second maths game (2026-10-23)

**Goal: observation one step further.** No target is written. The student must SEE what the cards share.

**How it plays:**
- **The puzzle.** 4 or 5 white cards are all equal except ONE, « الدخيل ». The student taps the odd one out before the time bar runs out: 15 s, then less and less, never under 7 s.
- **The reveal.** After each pick the answer stays on screen for 1.2 s (`reveal_ms`):
  - « كلّها تساوي 3 » (or « حلّها جميعًا … » / « قيمتها جميعًا عندما x = … », depending on the level's mode);
  - the odd card marked « الدخيل = 9 »;
  - a wrongly picked card shows its own value.
- **Shields.** A wrong pick or a timeout costs one of 3 shields. There is no revive; the game is free.
- **Controls.** Tap or click a card; on a laptop, the keys 1–5.
- **The board** is DOM, not a canvas: real text, big tap targets, `MathTokens` for the maths.

**The same 50 levels.**
- Each puzzle is built from the « قنّاص القيم » deck (`odd/puzzle.js` → `makeRound`): the cards equal to the round's target, plus ONE trap, the typical mistake that looks like the others.
- Its truth is therefore the deck's, re-read by `cards.test.js`. `odd/sim.test.js` checks every level × sub-level: exactly one odd card, and all the others share the round's value.
- The student has their **own position in this game** (`madar_math_progress`, `game = 'odd'`), with the same entry by year and the same map.
- Adaptation runs **every 5 puzzles** (`puzzles_per_round`), with the same rules (`sniper/adapt.js`).

**Server bound (`OddScoring`, mirrored by `odd/bound.js`).** A puzzle cannot be solved faster than `min_puzzle_ms` (1 s), because the client shows the answer for 1.2 s:

```text
puzzles          ≤ ⌊T / 1 s⌋ + 1
rounds           ≤ ⌊puzzles / 5⌋
level of puzzle i ≤ level(s0 + ⌊i / 5⌋)
score            ≤ Σ puzzles of points(level) × 4  +  Σ rounds of 3 × points(level)
```

The positions, the entry by year and the points come from `SniperScoring`: the maths games share their 50 levels.
- `finish {score, stars = hits, wave = rounds, position, peak}`.
- Config: `config/madar.php › odd`, mirrored by `odd/constants.js`.

**Code:**
- `features/madar/odd/`: `constants.js`, `puzzle.js`, `sim.js` (`pick` / `step`, reveal, rounds, autopilot), `bound.js`, `sim.test.js`;
- `components/OddBoard.jsx`: board, HUD, timer, reveal, keyboard;
- API: `OddScoring.php`, `MadarRun::GAME_ODD`, `MadarRun::isMath()`, `MadarService::mathView / mathScoring`;
- test `MadarOddTest`.

The generalisation for any maths game: `MadarRun::isMath`, `mathView(game)` in `GET /madar › {sniper, odd}`, and the teacher's `mathLevel` for both games.

## 16quater. « الحساب الذهني » — mental arithmetic, the third maths game (2026-10-23)

**Goal: fast, exact mental arithmetic, all four operations.** The owner's range: from « 2 + 1 » to « 2569 + 176 », from « 2 × 3 » to « 11 × 25 ».

**How it plays:**
- **A problem** sits in a white card inside a **time ring**: 12 s, then less and less, never under 6 s.
- **Answering.** The student types the answer on the on-screen **keypad** (thumb on a phone) or the keyboard (laptop: digits, `-`, `,`, Backspace, Enter).
- **The slots.** Boxes show how many characters the answer has. The answer is **sent by itself** when they are full, so the game is fast.

**What makes it fun, without ever stating a rule:**
- a **rocket** climbs one step per correct answer toward the next planet, with a new planet every 10 correct answers (« وصلت إلى المريخ! »);
- the stars scroll faster as the streak grows; « 🔥 n · ×m »; « سرعة الضوء! » every 5 in a row;
- a **speed bonus** « ⚡ » from the time left;
- a wrong answer shakes the card and shows the right answer for 1.4 s, long enough to read it.

**Shields and adaptation.**
- 3 shields; a wrong answer or a timeout costs one. There is no revive, and the game is free.
- The level adapts every 5 answers (`sniper/adapt.js`), with the same rules as the other maths games.

### Its own 50 levels (`mental/levels.js`)

The game has its own ladder, 3 sub-levels each, in 9 families:

| Family | Levels |
|---|---|
| الجمع والطرح | to 10 and to 20; two-digit numbers, with and without carrying or borrowing; three numbers |
| الضرب | the tables (2–5–10, 3–4, 6–7, 8–9, 11–12); a two-digit number × a digit; two two-digit numbers, then large ones |
| القسمة | the tables backwards; ÷ 10 / 100 / 1000; a two- or three-digit number ÷ a digit; ÷ a two-digit number |
| الأعداد الكبيرة | 3 digits + 2; subtracting from hundreds and thousands; 3 + 3 digits; 4 + 3 digits (2569 + 176); big mixes |
| حيل الحساب | × 10 / 100 / 1000; × 5 / 25 / 50; × 11; × 9 / 99 / 999 |
| العمليات المركّبة | parentheses; × before +; chains (48 ÷ 6 × 7 − 9); level 50 « تحدّي البطل » |
| الأعداد العشرية والكسور والنسب | adding decimals; × 10 and × 0,1; a fraction of a number; a percentage of a number |
| الأعداد النسبية | sum; product and quotient; compound |
| المربعات والقوى والجذور | squares to 15, then to 25, and cubes; perfect square roots; powers of 2 and a × 10ᵏ |

- Level 1 starts at « 2 + 1 ». Level 50 draws from the hardest levels at sub-level ج.
- **Entry by year** (`mental.entry`, mirrored by `MENTAL_ENTRY`): 1AM → 3, 2AM → 7, 3AM → 11, 4AM → 15. Every easier level is open, so « 2 + 1 » can always be replayed.
- **Warm-up.** Like every maths game, it opens two levels lower with a free first round (§16).
- **Answers** are always an integer or a finite decimal, written with the comma (« 1,2 », « −4 »).
- **Tests:** `mental/levels.test.js` re-reads every problem (50 levels × 3 sub-levels × 4 seeds × 25) with an independent evaluator, and checks that answers grow from level 1 to 28.

### Server bound

It is the « الدخيل » bound (`OddScoring`) with `config/madar.php › mental`:
- a problem ≥ 700 ms (`min_puzzle_ms`): the client shows the result 0.7 s, 1.4 s after a fault;
- 5 problems per round;
- plus a speed bonus of at most 1 × the level's points per problem (`speed_factor`).

The positions (0…149) and points come from `SniperScoring`.
- `finish {score, stars = hits, wave = rounds, position, peak}`.
- `mental/bound.js` mirrors it, and `mental/sim.test.js` checks that an instant, perfect player never exceeds it.

### Code

- `features/madar/mental/`:
  - `levels.js`: the catalogue, the generators, `makeProblem(seed, i, {level, sub})`, `MENTAL_ENTRY`;
  - `constants.js`;
  - `sim.js`: `press` / `step`, auto-submit, feedback, rounds, autopilot;
  - `bound.js`;
  - tests `levels.test.js` and `sim.test.js`.
- `components/MentalBoard.jsx`: rocket, stars, time ring, slots, keypad, keyboard, banners.
- `MathLevelMap` takes `catalog="mental"`, so the map shows this game's own 9 families.
- Server:
  - API: `MadarRun::GAME_MENTAL`; `mathScoring()` returns `OddScoring` with `config('madar.mental')`;
  - a game's own `{game}.entry` takes precedence over the shared entry;
  - `GET /madar › mental`.
- Test: `MadarOddTest::test_mental_arithmetic_is_a_third_free_math_game_with_its_own_entry`.

## 17. Not built (Planned)

- More games (the live class race « سباق المجرّة » is next on the list); they would share the hearts and refuel station.
- More maths games, proposed 2026-10-23 and not built:
  - « سهم على المستقيم »: placing √10, 7/3, π on a number line;
  - « الروبوت والمتجهات »: vector commands;
  - « تضاريس الدالة »: shaping y = ax + b.

  They would reuse the free rule, `cards.js`'s exact values and the week seed.
- A teacher-chosen map for « دفاع الكوكب » (today the week's map comes from the seed).
- A student home card.
- An admin screen for `config/madar.php`.
- Server-side replay of runs, which the bound makes unnecessary for now.
- Inter-class or school-wide seasons.
- Push reminders. Notifications pressuring students are deliberately avoided.

## 18. « نافس أستاذك » — the teacher plays with each class (2026-10-23, owner)

The teacher can play every game **inside one of their classes**, and has **one score per class**. Example: 21,542 in class A and 25,684 in class B.

**In the ranking.**
- The teacher's runs count in that class's weekly ranking (`MadarLeaderboard::standings` adds the class's `teacher_id` to its active members).
- Their name shows like a student's (first name + initial), with a **« الأستاذ » badge** (`isTeacher`). It shows even when the teacher is first: that is the challenge.
- They play the **same weekly map / targets** as the class (the class seed), so the comparison is fair.

**How the teacher plays** (`MadarService::asTeacherIn($classroom)`, a copy of the service bound to that class):
- **No hearts.** Every game is free for them (`games[].free = true`; revives cost nothing, within the revive limit). There is **no refuel station**: it draws on a student's own skills.
- **Never learning evidence.** Their runs are never evidence, and mastery is untouched.
- **Any game.** They can play a game closed to the class, and every maths level is open (`unlockedUpTo = 50`). Their maths position is their own, as for a student.
- **Records per class.** « رقمك القياسي » and « هذا الأسبوع » are computed from the runs of THIS class only (`classBest`, `weekBest` with `classroom_id`). They always see the class ranking, even when it is hidden from students.
- **Their own class only.** A run finishes only in the class where it started (404 otherwise). Another teacher's class answers 403.

**API** (`TeacherMadarPlayController`, behind `can:teacher` + `ClassroomPolicy`). It mirrors the student routes:

```text
GET    /teacher/classrooms/{id}/madar/play                    state, + classroom {id, name}
POST   /teacher/classrooms/{id}/madar/play/runs               {game, level?}
POST   /teacher/classrooms/{id}/madar/play/runs/{uuid}/revive
POST   /teacher/classrooms/{id}/madar/play/runs/{uuid}/finish {score, stars, wave?, completed?, position?, peak?}
PATCH  /teacher/classrooms/{id}/madar/play/ship               {ship}
```

**Teacher view.**
- `results.teacher {rank, best, wave}` gives the teacher's place this week. `summary.players` and `summary.runs` count students only.
- The class tab shows « ترتيبك في القسم هذا الأسبوع: n · score » and the button « العب مع قسمك ونافس تلاميذك ».

**Frontend.**
- The SAME pages (`GamesHub`, `MadarPage`) serve `/enseignant/classes/:classId/jeux` and `/enseignant/classes/:classId/jeux/:game`, full screen.
- `features/madar/madarScope.js › useMadarScope()` picks the API (`services/madarService.js › madarApi(classId)`), the hub address and the exit.
- The hub shows the class and the teacher's rule (« تلعب بلا قلوب… »).
- `Leaderboard` and the board display show the « الأستاذ » badge.

**Test:** `MadarTeacherPlayTest`:
- one score per class, and first in the students' ranking with its name and `isTeacher`;
- free play, even of a closed game, with every level open;
- a run cannot be finished in another class, nor played in another teacher's class.

