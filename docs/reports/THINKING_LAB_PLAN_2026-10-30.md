# « مختبر التفكير » — Implementation plan (2026-10-30)

> **Status: phase 0 (« Foundations ») implemented on 2026-10-30, phase 1 (« Ladder core ») on 2026-11-01; phases 2–7 Planned.** This is the build plan for
> the thinking space.
>
> - The binding contract for what exists is [`architecture/THINKING_LAB.md`](../architecture/THINKING_LAB.md). It was
>   created in phase 0, not phase 1 as first planned, because §18 lists it as a phase-0 deliverable.
> - This plan stays the authority for the phases not yet built.
> - Progress is tracked per phase in §19.
>
> - Design proposal (visual, interactive): https://claude.ai/artifact/6Rah4WZf4GvBvPb94zSX4x
> - Seed content: [`curriculum/THINKING_LAB_CHALLENGE_BANK.md`](../curriculum/THINKING_LAB_CHALLENGE_BANK.md)
> - Method source: the owner's book « بروتوكول SMART لحل المسائل الرياضية »
>   (`~/SMART/SMART Protocole Book/SMART-Protocol-Arabic/The Book`), a starting point and not the only source.

---

## 1. What we build

A student space that trains **problem solving and critical thinking**. The student tries first,
then watches what happens inside a mathematician's head: how they read, sort the data,
translate, aim, notice and connect.

| | Path 1 · « سُلَّم التحدّيات » | Path 2 · « مسار المنهاج » |
|---|---|---|
| Content | hundreds of puzzles **outside the curriculum**, from primary to university | problems tied to each grade's lessons (الكفاءات) |
| What the student sees | a **number** only (« التحدّي 318 »), never a grade | their year and its lessons |
| Unlocking the solution | independent student: **3 honest attempts AND 1 day of thinking**; student in a class: **request → the teacher accepts** | the autonomy tier (أشاهد / أتنبّأ / أقود / أشرح) |
| The solution | a **replay of the thinking** (SMART phases + 👁 observation, dead ends, « اشرح لنفسك ») | the « مسرح العقل » (text · mind board · notebook) |

**One method for both paths:** SMART (Scan, Math translate, Aim, Relate, Test) plus « 👁 الملاحظة »
as a lens that works in every phase. Every replay step, key and prediction is tagged with its phase.

### Non-goals (V1)
- No AI chat tutor and no automatic reading of photos (postponed, §16).
- No random rewards (no loot boxes or wheels: gambling-like, refused).
- No video.
- No phone layout. The space follows the platform rule of tablet and laptop only (≥ 768 px).
  The league page is the only possible later exception.

## 2. Owner decisions (binding, 2026-10-30)

| # | Decision |
|---|---|
| D1 | Two paths: a numbered ladder outside the curriculum + a curriculum path. |
| D2 | The ladder shows numbers only; the band (primary → university) is hidden. |
| D3 | Independent student: solution after **3 attempts + a minimum of 1 day** of thinking. |
| D4 | Student in a class: **asks the teacher**; the teacher accepts → the solution opens. |
| D5 | Every student answers in a **math field with a symbol keyboard**, checked by **equivalence**. |
| D6 | Independent student: no typed solution, no photos. Class student: may also attach **photos of paper** to a request or to « طرق أخرى ». |
| D7 | Photos: **compressed**, a strict **count**, a **max size**, **deleted after 1 year** (reuse of the exam-photo policy). |
| D8 | **Visible leaderboards for independent students.** |
| D9 | **Gamification and sounds inside the solving process.** |
| D10 | The math-lab **whiteboard** may serve for the student's answer and the teacher's correction. |

Proposed by the design and to confirm (§17): the 48 h teacher fallback, the honest-attempt
rule, the example-first mode for the primary band, a pseudonymous weekly league in groups of ~30,
a 40-photo monthly quota, and showing a photo to the class only with the student's consent.

## 3. Architecture overview

Every layer copies an existing pattern of the repo; nothing is a parallel system.

```
content/thinking-lab/                 ← challenges as data (copy of content/practice)
  _schema/challenge.schema.json
  challenges/<NNNN>-<slug>.json
  index.generated.json                ← generated, checked in, read by PHP
packages/core/thinkingLab/            ← pure logic, imported BY PATH (never via the core barrel)
  expression.js                       ← safe parser + evaluator (no eval)
  checkAnswer.js                      ← integer | number | rational | expression | choice
  params.js                           ← per-student numbers (seeded)
  gate.js                             ← unlock state machine (mirror of the PHP one, for UI only)
  observe.js                          ← whiteboard observation-target detection
  rating.js                           ← Elo-style rating update (mirror for tests)
apps/api/app/Domain/ThinkingLab/      ← server truth
  ChallengeRepository.php  ChallengePresenter.php  AnswerChecker.php  ExpressionEvaluator.php
  LadderService.php  GateService.php  RequestService.php  RatingService.php
  LeagueService.php  StreakService.php  MoveCardService.php  ThinkingLabConfig.php
apps/web/src/features/thinkingLab/    ← UI (lazy route boundary)
apps/web/src/pages/student/thinking/  ← pages
apps/web/src/features/teacher/thinkingLab/
```

**The server is authoritative.** The client never receives an answer, a key it has not
unlocked, or the replay before the gate opens. This is the presenter pattern of
`Domain/DailyChallenge/ChallengeQuestionPresenter`.

## 4. Content model

### 4.1 Files and pipeline (copy of `content/practice`)
- One JSON per challenge in `content/thinking-lab/challenges/`, validated by
  `content/thinking-lab/_schema/challenge.schema.json`.
- `scripts/build-thinking-lab-index.mjs` builds `index.generated.json`, the only file PHP reads,
  through `ChallengeRepository`, like `ExerciseRepository` reads the practice index.
- `scripts/validate-thinking-lab.mjs [--strict]` checks:
  - schema;
  - each `answer` can be parsed by `checkAnswer`;
  - each declared `mistakes[].value` is **refused** by `checkAnswer`;
  - **no key, mistake reply or replay step before the gate contains the answer**, as a string or as
    a value (evaluated);
  - `phase` values are in `S M A R T O B`;
  - replays of ≥ 6 steps have one `ask`;
  - numbers are unique;
  - the index is fresh (it fails on a stale index, like `validate:exercises`);
  - a forbidden-words list (gambling, alcohol, pig, interest).
- `scripts/thinking-lab-oracle/<batch>.mjs` exports `ORACLE`, an independent recomputation of every
  answer *for every params combination*. `scripts/thinking-lab-oracle.test.mjs` fails for any
  challenge without an oracle. This copies `scripts/practice-answer-oracle.test.mjs`.
- All of this is chained into `check:lessons` (root `package.json`), next to `validate:exercises`.

### 4.2 Challenge JSON

```jsonc
{
  "id": "four-arcs-area",            // stable slug, never changes
  "number": 318,                     // position in the current edition (§5.3)
  "status": "published",             // draft | published   (nothing generated stays draft)
  "family": "geometry",              // logic | numbers | patterns | algebra | geometry | counting | probability | functions | analysis | invariants | critical
  "band": "secondary",               // primary | middle | secondary | university   (HIDDEN from students)
  "summit": false,                   // true for multiples of 25
  "licence": "TYPE",                 // PD | FOLK | TYPE   (bank §1)
  "source": "inspired by « تحدّي SMART #1 » (owner post)",
  "examTag": null,                   // "bem" | "bac" | null  → « فكرة تتكرّر في الامتحانات »
  "rating": 1600,                    // initial author estimate; then maintained server-side
  "statement": "مربّع طول ضلعه {x} …",        // {placeholders} filled from params
  "figure": { "kind": "svg", "component": "FourArcs", "props": {} },
  "whiteboard": {                    // optional: seed + observation targets (§9)
    "seed": "FourArcs",
    "observe": [{ "id": "equilateral", "kind": "triangle", "through": ["A", "B", "I_top"], "toleranceDeg": 4 }]
  },
  "params": null,                    // or { "vars": { "a": [4, 6, 8, 10] } }
  "answer": { "check": "expression", "value": "x^2*(1+pi/3-sqrt(3))", "vars": ["x"], "samples": 6, "relTol": 1e-6 },
  "parts": null,                     // summits: [{ "prompt": …, "answer": … }, …]
  "mistakes": [
    { "value": "1-pi/4", "scaleWith": "x^2", "reply": "هذه مساحة ركن واحد خارج ربع الدائرة" }
  ],
  "keys": [
    { "phase": "S", "text": "…" },
    { "phase": "O", "text": "…" },
    { "phase": "R", "text": "…" }
  ],
  "example": null,                   // primary band: the worked example shown BEFORE trying
  "replay": [
    { "phase": "S", "think": "…", "layers": [], "math": [] },
    { "phase": "B", "think": "…" },                       // ↩ dead end
    { "phase": "O", "think": "…", "layers": ["tri", "pts"],
      "ask": { "q": "اشرح لنفسك: لماذا 30°؟", "options": ["…", "…", "…"], "correct": 0, "why": "…" } }
  ],
  "keyMoves": ["…", "…", "…"],       // the short replay for students who solved alone (§10.2)
  "move": { "id": "hidden-equilateral", "title": "ابحث عن مثلّث متساوي الأضلاع" },
  "twin": "lens-area",
  "ceiling": { "statement": "…", "answer": { … } }
}
```

### 4.3 Per-student numbers (`params`)
- `params.vars` lists allowed values. The chosen tuple is deterministic:
  `hash(userId, challengeId, edition) mod size` (`packages/core/thinkingLab/params.js`, mirrored in PHP).
- Placeholders `{a}` in the statement, the figure props, the keys and the replay are filled server-side.
- The oracle recomputes the answer for **every** tuple.

## 5. The ladder

### 5.1 Bands and modes (hidden)
| Numbers | Band | Mode |
|---|---|---|
| 1–120 | primary | **example-first**: a worked example (`example`), then the challenge as its twin; no day lock (evidence: younger learners benefit from instruction first — Sinha & Kapur 2021) |
| 121–500 | middle → university | **try first** (§6) |

Every multiple of 25 is a **summit**, a larger challenge in parts.

### 5.2 Progression
- The next number opens after **one honest attempt** on the current one (D-proposal). The student
  is never stuck behind a challenge.
- At most **3 open challenges** at a time.
- **« قفزة »** (jump): from the start screen, 3 challenges taken from a higher summit. Solving them
  places the student at that summit.
- A student's state is kept per challenge (`thinking_lab_progress`), not as a single "current
  number", so a reorder never loses progress.

### 5.3 Hidden rating and editions
- Each challenge and each student has a rating (Elo-style). An attempt resolution is a "match"
  (Lichess, AoPS Alcumus).
  - The outcome `s` is 1 for solving alone, 0.75 with 1 key, 0.5 with 2–3 keys, 0.25 for solving
    the twin after the solution, and 0 for learning from the solution only.
  - `K` is 32 for a challenge with fewer than 30 resolutions, 16 after that. The same values apply
    to students.
  - The code is `RatingService` with `packages/core/thinkingLab/rating.js` as its mirror; tests are
    shared through JSON fixtures.
- **Numbers are stable inside an edition** (one school term), because posts and teachers cite
  « التحدّي 318 ».
- Between editions, `php artisan smarter:thinking-lab:reorder --edition=<n>` sorts the published
  challenges by rating and assigns new numbers. Bands are re-derived, and the old → new number map
  is stored (`thinking_lab_editions`). Links use the stable `id`; `/espace/tafkir/n/318` resolves
  through the edition map.
- The initial order is the author's `rating`.

## 6. The gate (unlock state machine)

`GateService` (PHP, authoritative) with `gate.js` (a UI mirror). State per (student, challenge):

```
open ──attempt──▶ trying(attempts=n, firstAttemptAt)
trying ──correct──▶ solved(alone | keys:k)            → replay available (comparison)
trying ──[independent] n≥3 AND now−firstAttemptAt ≥ 24h──▶ unlocked(learned)
trying ──[class] request──▶ requested ──teacher accept──▶ unlocked(learned)
                                 ├──teacher sends key──▶ trying (+1 key)
                                 ├──teacher "in class"──▶ scheduled (replay opens after the lesson date, or on teacher release)
                                 └──no answer 48h──▶ falls back to the independent rule
unlocked(learned) ──twin solved alone──▶ solved(via-twin)
```

### 6.1 The honest attempt (anti-gaming)
An attempt counts only if all of these hold (evidence: hint abuse in 36% of tutor actions,
Aleven & Baker):
- the answer differs from the previous ones (normalised);
- **≥ 120 s** have passed since the previous counted attempt (config);
- from attempt 2, the draft field holds ≥ 1 sentence (« ماذا غيّرت هذه المرّة؟ »);
- the `notyet` reply explains *why* (a declared mistake, an order-of-magnitude check, or a generic
  sanity sentence).

### 6.2 Keys
- Key *k* unlocks after attempt *k* (the teacher may also send one, §8).
- Opening a key lowers the challenge's **stake** (§11.1) and is recorded with its phase. This tells
  the thinking profile which phase the student needed.

### 6.3 Day of thinking
- The day counts from the first counted attempt (Africa/Algiers, server clock).
- While waiting, the UI proposes **light** activities: a free maths game from « فضاء الألعاب », or
  an easier challenge. The incubation effect is larger with low-demand activity (Sio & Ormerod 2009).
- The next morning a database notification goes out (bell): « التحدّي 318 ينتظرك ». It contains no hint.

## 7. Answer checking

### 7.1 Check types
| check | Implementation |
|---|---|
| `integer`, `rational`, `choice` | **delegate** to the existing `AnswerEvaluator` (PHP) / `answerEvaluator.js` |
| `number` | rational parse + absolute/relative tolerance |
| `expression` | **new**: `ExpressionEvaluator.php` + `packages/core/thinkingLab/expression.js` |

### 7.2 The `expression` evaluator
- A **recursive-descent parser written twice with one grammar**:
  - operators `+ − × · * / ^`, implicit products `2x`, `x(…)`;
  - functions `sqrt √ sin cos tan ln exp abs`;
  - constants `pi π e`;
  - decimals with `,` or `.`.
  - No `eval` anywhere.
- **Equivalence**: evaluate the student's and the expected expression at `samples` random points
  per variable (seeded, avoiding the declared `domain` gaps).
  - Accept if every sample agrees within `relTol` (default 1e-6, absolute 1e-9 near 0).
  - Refuse if a value is undefined where the other is defined.
- A **shared fixture file** `content/thinking-lab/_fixtures/expressions.json` holds ≥ 200 cases
  (equivalent and non-equivalent pairs). Both PHPUnit and Vitest run it, so the two
  implementations can never drift (the Rational.php / rational.js precedent).
- **Input**: `ExamMathField` (MathLive, already lazy via `features/practice/exam/math/lazy.jsx`)
  gives ascii-math to the parser. A thinking-lab keyboard row is added to `examKeyboard.js`
  (π √ x² a/b ° ( )) as a named layout.
- The existing client-side `compareMathExpressions` (compute-engine) and the nerdamer facade are
  **not** used for grading. Grading must run on the server.

## 8. Teacher flow (class students)

- **Guard**: every teacher read goes through `ClassroomAccess::activeStudent` (consent, active
  membership). There is no email and no average, as in the existing teacher views.
- **Request**: `POST /thinking-lab/challenges/{id}/request`. It needs ≥ 1 counted attempt, and
  freezes the attempts, the draft, the whiteboard snapshot and the photos.
- **Queue**: `GET /teacher/classrooms/{id}/thinking-lab/requests`, **grouped by challenge**
  (« 7 عالقون في 318 »). A count badge is served like `/teacher/reviews/count`, because teachers
  have no bell.
- **Actions**, each a `POST …/requests/{rid}`:
  - `accept`: unlocks the solution;
  - `key`: unlocks the next key, with an optional comment;
  - `in_class`: scheduled; « اشرحه في القسم » opens the replay in **Classroom Mode**;
  - `annotate`: a red layer on a photo (reuses `annotate()`) or on the whiteboard snapshot (§9).
- **48 h fallback**: `smarter:thinking-lab:expire-requests` (hourly) applies the independent rule
  to unanswered requests (D-proposal).
- **Student notification**: `ThinkingLabRequestAnsweredNotification`, database channel, same as
  `AnswerReviewedNotification`.
- **Teacher settings per class**: hide-names on the board, close the ladder for the class, and a
  class leaderboard on/off (default off; the default is the cooperative class challenge, §12.3).

## 9. Writing: math field, whiteboard, photos

| Means | Who | When |
|---|---|---|
| Math answer field (§7) | everyone | every attempt |
| Whiteboard | everyone, on challenges with `whiteboard` | drawing on the figure; it feeds « لاحظت! » |
| Photo of paper | class students only | attached to a request or to « طرق أخرى » |

### 9.1 Whiteboard
- Launch with the seed via `buildMathLabLaunch({ tool: 'whiteboard', seed, origin: { thinkingLab: id } })`.
  The figure's named points are seed elements, so the existing **snap** layer catches them.
- The board of an attempt is saved as an ordinary `math_lab_documents` row (owner = student,
  `summary.origin`). Within the existing 2 MB cap, it counts in the student's work list
  « أعمالي ».
- **Observation detection**: `observe.js` reads the Excalidraw elements and tests the challenge's
  `observe` targets (segments between named points, triangles, angles) with a tolerance. A hit
  sends `POST …/observe` and the server re-checks it with the same rule
  (`ObservationChecker.php` + shared fixtures).
- **Teacher access**, new and narrow: the request **freezes a JSON snapshot** of the board into
  `thinking_lab_request_boards`. The teacher reads the snapshot, never the live document. Today a
  teacher cannot read a student's math-lab document, and this stays true.
- **Teacher red layer**: a separate JSON of Excalidraw elements (`stroke = red`, locked student
  layer), stored next to the snapshot and shown over it to the student. The geometry replay
  (`tools/whiteboard/geometry/replay.js`) lets the teacher replay the construction.

### 9.2 Photos (D7)
- Extract `encode()` / `orient()` / `deletePath()` from `Domain/Practice/AnswerImageStore.php` into
  a shared `Domain/Media/ImageEncoder.php`. The exam flow keeps its behaviour and its tests.
- A new table `thinking_lab_images` (sibling; the exam table's `question_attempt_id` FK and its
  unique review key stay untouched) with the same columns plus `request_id` / `method_id`.
- Same policy: **5 MB** before compression, re-encoded to JPEG 82, longest side **1600 px**, EXIF/GPS
  removed, private disk, **3 per request or per method**, **12 months** then purge.
  `smarter:answer-images:purge` is extended (or a sibling `smarter:thinking-lab:images:purge`
  is scheduled at 04:20).
- **Monthly quota**: a usage type `thinking_lab_image` in `FeatureRegistry` (40/month, proposed),
  enforced with `FeatureAccessService::consume`.
- **Shown to the class**: only if the teacher picks it **and** the student consents (a flag on the
  method); names are hidden on the board.

## 10. Replays (the heart)

### 10.1 Engine
- `features/thinkingLab/replay/` holds a step player for `replay[]` steps.
  - Phases `S M A R T O B` (B = « ↩ طريق مسدود »).
  - Figure layers are toggled by step, and math lines accumulate in the notebook.
  - An `ask` step blocks « التالي » until answered (« اشرح لنفسك »).
- Reuse the Math Lab step player model (`features/mathlab/shared/stepPlayerModel.js`,
  `useStepReveal`) for the cursor and auto-play. The replay is **interface state, never
  serialised**.
- Figures are SVG components in `features/thinkingLab/figures/`, drawn in code and parametrised.
  No raster images (`CLAUDE.md` images rule).

### 10.2 Adapted to the student (expertise reversal)
- Solved alone: the student sees the 3 `keyMoves` cards first, with « شاهد العرض الكامل ».
- Learned from the solution: the student sees the full replay, step by step.

### 10.3 After the replay
- « ماذا تأخذ معك؟ » shows the thinking **move** card (collected, §11.4).
- The **twin**, then « ارفع السقف » (raise the ceiling: a harder question on the same idea).
- « طرق الآخرين » (other methods) opens only now (Project Euler): the methods students wrote, with
  the share of solvers per method, moderated.

### 10.4 Classroom Mode
- The replay is wrapped in `ClassroomPresentation` (exercise scope), so the teacher projects it
  with pause and pointer.
- « إخفاء الأسماء » applies to any student photo or board shown.

## 11. Gamification and sound (D9)

Every reward pays for a **thinking act**, never for speed or luck.

### 11.1 Points and the key stake
| Act | Points |
|---|---|
| solved alone | 3 |
| solved with key(s) | 2 |
| learned from the solution, then twin solved alone | 1 |
| « طريق آخر » accepted (teacher, or moderation for independent students) | +2 |
| a day of thinking (≥ 1 counted attempt) | +1 |

The key button states its cost before opening: « افتح · القيمة تصبح 2 ». The server computes the
points (`ThinkingLabScoring`); the client only displays them.

### 11.2 « لاحظت! »
A detected observation target (§9.1) gives a spark sound, a highlight and the « عين الملاحظة » badge
on that challenge.

### 11.3 Streak of thinking days
- `StreakService` reuses `DailyChallenge/ChallengeCalendar` (Algiers dates).
- The streak **does not break** on Friday or Saturday, during school holidays, or on national exam
  days. A calendar of exempt dates sits in config.

### 11.4 Move cards « أدوات الرياضي »
- Each solved challenge grants its `move` card. A card levels up (bronze → silver → gold) when the
  same move is used in other challenges (3, then 6).
- Collection only, and never random.
- Table `thinking_lab_move_cards`.

### 11.5 Summits
Every 25 numbers: a larger challenge, a celebration (`useStepCelebration` /
`MedalCelebration`, reduced-motion aware) and a new map scene.

### 11.6 Sound
- The sounds extend `lessons/common/utils/playEffect.js › playSfx`, synthesized with no audio files.
  New names: `lock` (key), `spark` (observation), `slide` (dead end), `notyet` (two soft falling
  notes, never a buzzer), `stepTick`. `win` reuses `playMedal('gold')`.
- **Off by default**, behind the single « الصوت » switch (`useEffectsPreference`,
  `smarter_effects_enabled`). This is the platform-wide rule for every lab.

## 12. Leaderboards

### 12.1 Weekly league (independent students, D8)
- Weeks run Sunday → Saturday, Algiers time (the same `week_start` as Madar).
- Groups hold ~30 students of close **hidden rating**. Points are the ones of §11.1. Points reset
  each week, the top 5 move up a division and the bottom 5 move down.
- Divisions are named after mathematicians: « الخوارزمي », « ابن الهيثم »…
- **Pseudonyms only.** The student chooses from a list, or types one that is moderated. There is no
  real name, no city and no photo. This is a new mechanism (table `thinking_lab_pseudonyms`); the
  platform today only has the « first name + initial » rule.
- **Opt-out** with one switch.
- Tables `thinking_lab_league_groups`, `thinking_lab_league_members`; the weekly job is
  `smarter:thinking-lab:league:rollover` (Sunday 00:05 Algiers).

### 12.2 Who is "independent"
A student with **no active class membership** (`StudyContextService`). If they join a class, they
leave the league at the next rollover.

### 12.3 Classes
- The default is a **cooperative class challenge**: one challenge per week, and the solution opens
  for everyone when 70% of the class has made a counted attempt.
- A class ranking exists only if the teacher turns it on (Madar precedent: « نافس أستاذك », the
  teacher's own score with the « الأستاذ » badge, never evidence).

## 13. Path 2 · « مسار المنهاج »

- **Content**: `content/thinking-lab/curriculum/<grade>/<lessonCode>/*.json`, the same schema plus
  `programmeItems` (the learning-net ids `<g>am.m<n>.r<nn>`). The net's resolver says when a problem
  may appear: after its lesson, never before.
- **Display**: the « مسرح العقل » (the proposal's three panes: text, mind board, notebook) as a
  component `features/thinkingLab/theatre/`, reusing the replay player. Board nodes and links are
  extra fields of a step: `nodes[]`, `links[]`, `goal`, `reach`.
- **Autonomy tiers** per student and per learning domain: أشاهد (all narrated) → أتنبّأ (`ask`
  pauses) → أقود (the student places nodes and picks the next bridge) → أشرح (the student
  writes their « بطاقة تفكير », read by the teacher).
- **Placement in lessons**: a « فكّر كرياضي » card in each unit's synthesis lesson (« وضعيات
  تدريبية ») links to that unit's theatre problems.
- **No evidence for Mastery V2 in V1.** Path 2 is training, not assessment. This can be revisited
  later.

## 14. Server: API and database

### 14.1 Routes (student: `learner` middleware; teacher: `can:teacher` + `ClassroomPolicy`)
```
GET    /thinking-lab                          ladder home: open challenges, current numbers, streak, league card
GET    /thinking-lab/challenges/{id}          presented challenge (params filled, no answer, unlocked keys only)
POST   /thinking-lab/challenges/{id}/attempts {answer, draft}  → {counted, correct, reply, keysUnlocked, gate}
POST   /thinking-lab/challenges/{id}/keys/{k} open key k        → {key, stake}
POST   /thinking-lab/challenges/{id}/observe  {targetId, elements}
POST   /thinking-lab/challenges/{id}/postpone
GET    /thinking-lab/challenges/{id}/replay   403 until the gate is open
POST   /thinking-lab/challenges/{id}/request  (class students) {imageIds[], boardSnapshot}
POST   /thinking-lab/challenges/{id}/methods  « طريقة أخرى » {text, imageIds[], shareConsent}
POST   /thinking-lab/images                   upload (quota)   DELETE /thinking-lab/images/{uuid}
GET    /thinking-lab/league                   GET/PUT /thinking-lab/pseudonym   PUT /thinking-lab/league/opt-out
GET    /thinking-lab/cards
GET    /teacher/classrooms/{id}/thinking-lab/requests[?challenge=]   /requests/count
POST   /teacher/classrooms/{id}/thinking-lab/requests/{rid}   {action: accept|key|in_class, comment}
POST   /teacher/classrooms/{id}/thinking-lab/requests/{rid}/annotation
GET/PUT /teacher/classrooms/{id}/thinking-lab/settings
GET    /admin/thinking-lab/challenges  (read-only stats: rating, solve rate, reports)
```

### 14.2 Tables (migrations `2026_11_*`)
| Table | Key columns |
|---|---|
| `thinking_lab_editions` | `id, starts_on, number_map JSON` |
| `thinking_lab_challenge_stats` | `challenge_id (slug), rating, resolutions, solve_alone, solve_keys, learned` |
| `thinking_lab_progress` | `user_id, challenge_id, state, attempts_counted, keys_opened, first_attempt_at, solved_at, outcome, params_index, observed JSON, postponed_at` (unique user+challenge) |
| `thinking_lab_attempts` | `progress_id, answer_raw, answer_norm, correct, counted, reason, draft, created_at` |
| `thinking_lab_requests` | `progress_id, classroom_id, status (pending|accepted|key|in_class|expired), teacher_id, comment, decided_at, expires_at` |
| `thinking_lab_request_boards` | `request_id, snapshot JSON, teacher_layer JSON, bytes` |
| `thinking_lab_images` | as `answer_images` + `request_id` / `method_id` |
| `thinking_lab_methods` | `user_id, challenge_id, text, approved, share_consent, shown_in_class_at` |
| `thinking_lab_student_ratings` | `user_id, rating, resolutions` |
| `thinking_lab_streaks` | `user_id, current, best, last_day` |
| `thinking_lab_move_cards` | `user_id, move_id, uses, level` |
| `thinking_lab_pseudonyms` | `user_id, pseudonym, source (list|custom), moderated_at` |
| `thinking_lab_league_groups` / `_members` | `week_start, division, group_no` / `group_id, user_id, points` |
| `thinking_lab_class_settings` | `classroom_id, ladder_closed, class_ranking, hide_names` |

The existing account-deletion path (`Domain/Admin/UserDeletionService`) is extended to delete these
rows and files.

### 14.3 Access (`ACCESS_AND_LIMITS.md`)
- `FeatureRegistry` entries:
  - `thinking_lab_ladder`: open to all students, proposed;
  - `thinking_lab_curriculum`: tier to decide;
  - `thinking_lab_league`;
  - usage type `thinking_lab_image` (monthly).
- `ensure()` / `consume()` at the controller choke points. The client reads them through
  `useFeatureAccess`. The admin `AccessLimits.jsx` gets a section.

### 14.4 Scheduled commands (`routes/console.php`)
- `smarter:thinking-lab:expire-requests`: hourly.
- `smarter:thinking-lab:morning-reminders`: daily at 07:30 Algiers.
- `smarter:thinking-lab:league:rollover`: Sunday 00:05 Algiers.
- `smarter:thinking-lab:images:purge`: daily at 04:20.
- `smarter:thinking-lab:reorder`: manual, per edition.

## 15. Web app

### 15.1 Routes and navigation
- Student pages:
  - `/espace/tafkir`: the ladder home;
  - `/espace/tafkir/:challengeId`: the workspace;
  - `/espace/tafkir/n/:number`: resolves through the edition map;
  - `/espace/tafkir/cartes`;
  - `/espace/tafkir/dawri`: the league;
  - `/espace/tafkir/manhaj/:lessonCode`: path 2.
- Teacher: `/enseignant/classes/:classId/tafkir` (requests, settings), `/enseignant/classes/:classId/tafkir/affichage` (board display, like `ChallengeDisplayPage`).
- All are `lazy()` in `App.jsx` under `/espace` (inside `StudentLayout`). The workspace page is
  full-width.
- The nav entry goes in `data/studentNavigation.js` (lucide `Brain`, `nav.json › thinkingLab`).
- Behind `RequireLargeScreen` (≥ 768 px).

### 15.2 Bundle and i18n (`BUNDLE_BOUNDARIES.md`)
- A new **on-demand namespace** `thinking.json` goes in `ON_DEMAND_NAMESPACES`
  (`apps/web/src/i18n/index.js`), read only under `<Suspense>`.
- MathLive (`exam/math/lazy.jsx`) and the whiteboard (Excalidraw, already lazy) stay behind
  their own boundaries.
- `npm run check:entry-budget` must stay ≤ 245 KB gzip. No entry module imports thinking-lab code.
- `packages/core/thinkingLab/*` is imported **by path**, never from the core barrel.

### 15.3 Screens (from the proposal, §UX)
1. **سُلَّمي** (my ladder): the current challenge with its state in words (« محاولتان من 3 · الحلّ
   يُفتح غدًا 09:40 »), open challenges (≤ 3), the trail of stones, light activities while waiting,
   the league card (independent students).
2. **Workspace**: the figure (draw on it) + the statement, the draft line, the math field +
   keyboard, the condition chips, the keys (each with its stake), the main action « تحقّق »,
   « أرجئه ». A class student also gets « اطلب الحلّ من أستاذك ».
3. **After solving**: stars (حللته / طريق آخر), key moves, the full replay, other methods,
   « ارفع السقف », the twin.
4. **Teacher requests**: grouped queue, photo/board with the red layer, three actions,
   « اشرحه في القسم ».

### 15.4 UI rules
- One primary action per screen.
- Arabic RTL; mathematics as LTR islands (`ARABIC_RTL_CONTRACT.md`).
- No red for a wrong answer: « ليس بعد ».
- Sound off by default; reduced motion respected.
- Terminology: « الكفاءات » in path 2.
- Cultural rules: every string passes the forbidden-words check (§4.1).

## 16. Postponed (explicitly not in V1)
- An AI chat tutor (cost, data of minors, answer leakage, frustration of stuck students).
- Automatic reading of photo handwriting.
- The « الأناقة » (elegance) star: shortest solution, not measurable automatically.
- A phone layout.

## 17. Open decisions (to confirm before or during phase 1)
1. The **48 h fallback** when a teacher does not answer (proposed: yes).
2. Does the teacher also control **ladder** solutions, or only path 2? (proposed: both, for
   class members).
3. Who can use the ladder: students only, or also university students, parents and teachers?
4. **Access tier**: is the ladder free (an acquisition channel tied to the « تحدّي SMART » posts),
   and is path 2 premium?
5. **Edition length** for renumbering: a term (proposed) or a year.
6. Summits: must they be **solved** (not just attempted) to pass? (proposed: attempted, like any
   number).
7. The pseudonym list and the moderation owner.
8. The `thinking_lab_image` monthly quota (proposed 40).
9. The final names: « مختبر التفكير », « سُلَّم التحدّيات », « مسار المنهاج ».

## 18. Phases, deliverables, acceptance

Each phase ends with: tests green, `check:lessons` green, entry budget green, docs updated
(§19), screenshots reviewed at 1366×768 and 768×1024, and **published on `dev`** (owner rule:
nothing generated stays `draft`).

| Phase | Deliverables | Accepted when |
|---|---|---|
| **0 · Foundations** | `packages/core/thinkingLab/{expression,checkAnswer,params}.js` + `ExpressionEvaluator.php`; shared fixtures (≥ 200 cases); schema; index builder; validator; oracle harness; contract `docs/architecture/THINKING_LAB.md` | the PHP and JS evaluators agree on every fixture; #318's answer is accepted in 3 equivalent writings and its 3 declared mistakes are refused |
| **1 · Ladder core** | tables, `ChallengeRepository`, presenter, attempts, honest-attempt rule, keys, the gate for independent students (3 + 24 h), the replay engine, screens 1–3 (without league), sounds, the first **40 challenges** of the bank | a test student goes 1 → 2 → 3 attempts → +24 h (time travelled in tests) → replay; no answer or locked key appears in any API response (a test greps responses) |
| **2 · Class flow** | requests, grouped queue + badge, accept/key/in-class, 48 h job, notifications, ClassroomAccess tests, Classroom Mode replay, teacher settings | the privacy tests pass (a teacher never reads a non-member; no email in payloads) |
| **3 · Writing** | whiteboard launch + seed figures, observation detection (client + server), frozen snapshot + red layer, `ImageEncoder` extraction, `thinking_lab_images`, quota, purge | the exam-photo tests still pass unchanged; « لاحظت! » fires on #318's equilateral triangle and never on a random segment |
| **4 · Motivation** | points & stakes, streak with exempt days, move cards, summits, league (pseudonyms, groups, rollover, opt-out), class cooperative challenge | the rollover is idempotent; a joined class removes the student from the league at the next rollover |
| **5 · Content to 150** | 110 more challenges from the backlog (bank §4) + oracle for each | validator `--strict` and oracle green; each band ≥ 25 challenges |
| **6 · Path 2** | theatre component, curriculum content for one unit per grade (pilot), autonomy tiers 1–2, « فكّر كرياضي » cards | the net resolver hides a problem whose lesson is not reached |
| **7 · Calibration** | `RatingService` live, the admin stats page, the first `reorder` at the end of the term | a dry run prints the old → new map without writing; a real run keeps every student's progress |

## 19. Documentation to create or update (each phase)

**Progress.**

- **Phase 0, done on 2026-10-30:**
  - `THINKING_LAB.md` created;
  - `docs/README.md` map entry;
  - `EXERCISE_CONTRACT.md` pointer;
  - `BUNDLE_BOUNDARIES.md` (the core-by-path rule and the server-only index);
  - challenge bank status (#318 written to the schema).
- **Phase 1, done on 2026-11-01:**
  - `THINKING_LAB.md` rewritten: the ladder, the gate, the API, the presenter, the screens, the figures, the sounds and
    the open decisions in effect;
  - `ACCESS_AND_LIMITS.md` (the `thinking_lab.ladder` key);
  - `MANIPULATION_CONTRACT.md` (the five new `playSfx` names);
  - `BUNDLE_BOUNDARIES.md` (the `thinking` namespace, the lazy routes and figures, the measured entry);
  - the `CLAUDE.md` paragraph, the `docs/README.md` rows, and the challenge bank status (46 published).
- **Teacher preview, 2026-10-31 (owner decision, answers §17 n° 3 for teachers):** a read-only preview at `/enseignant/tafkir`
  (everything open, an answer to test, nothing written). `THINKING_LAB.md` §8bis, the `ACCESS_AND_LIMITS.md` note and the
  `README.md` row were updated.
- **Phase 1 deviations from this plan:**
  - the bank's seed holds **46** entries, not 40, and all 46 were written;
  - every student follows the independent rule until phase 2 (§6 of the contract);
  - « قفزة » (the jump, §5.2) and the morning reminder (§6.3) are left for phase 4;
  - the river (#33) and the balance (#47) are static figures.
- **Still to do in later phases:**
  - `MATH_LAB.md` and `CLASSROOM_MODE.md` (phases 2–3).
- **New**:
  - `docs/architecture/THINKING_LAB.md`, the contract: the content schema, gate, scoring, league,
    privacy and screens. This plan points to it once it exists.
  - `docs/curriculum/THINKING_LAB_CHALLENGE_BANK.md`, kept current as challenges are written.
- **Update**:
  - `docs/README.md`: a map entry.
  - `ACCESS_AND_LIMITS.md`: the features and the quota unit.
  - `MATH_LAB.md`: the whiteboard launched from a challenge, and the teacher snapshot read.
  - `EXERCISE_CONTRACT.md`: a pointer that the `expression` check lives in the thinking lab and is
    not a practice answer type.
  - `CLASSROOM_MODE.md`: the replay scope.
  - `BUNDLE_BOUNDARIES.md`: the `thinking.json` namespace and the lazy route.
  - `MANIPULATION_CONTRACT.md`: the new sound names, if added to `playSfx`.
  - `CLAUDE.md`: one paragraph once phase 1 ships.

## 20. Tests
- **Core (Vitest)**: expression fixtures, params determinism, `gate.js` table tests,
  `observe.js` geometry, rating fixtures.
- **API (PHPUnit)**: the same fixtures for `ExpressionEvaluator`. Gate transitions with time
  travel; honest-attempt refusals; **no answer leakage** (a response scan for the answer value and
  for locked keys); request permissions (`ClassroomAccess`); the 48 h job; league rollover
  idempotence; image policy (size, count, EXIF stripped, purge); quota refusal codes; account
  deletion.
- **Content**: `validate-thinking-lab --strict`, `thinking-lab-oracle.test.mjs`.
- **E2E (Playwright, `apps/web/e2e/`)**:
  - an independent student on #318: wrong ×3, wait, replay, « اشرح لنفسك », move card;
  - a class student: request, then the teacher sends a key, then accepts;
  - screenshots at 1366×768 and 768×1024, reviewed by eye (`MANIPULATION_DNA.md` §17 quality bar).

## 21. Risks
| Risk | Mitigation |
|---|---|
| Answers shared in WhatsApp groups | per-student `params`; points need a counted attempt; the replay is never public |
| Students gaming the attempt rule | honest-attempt rules (§6.1); thresholds in config, tuned on real data |
| A one-day lock discourages | 3 open challenges, light activities, morning reminder, postpone without penalty; measure drop-off per band and adjust |
| Overloaded teachers | grouped requests, « in class », 48 h fallback |
| PHP/JS evaluators drift | one shared fixture file run by both test suites |
| Content quality at scale | schema + validator + independent oracle + leakage checks before publish |
| The league harms weaker students | rating-matched groups of ~30, weekly reset, opt-out, points for thinking not speed |
| Bundle growth | lazy route, on-demand namespace, existing lazy MathLive/Excalidraw; budget check in CI |

## 22. Evidence behind the design (summary)
- **Try first**: Sinha & Kapur 2021 meta-analysis, 53 studies (PS-I favoured, g ≈ 0.36; reversed
  for young children).
- **Incubation**: Sio & Ormerod 2009, 117 studies (d ≈ 0.29; larger after longer preparation and
  with low-demand activity).
- **Worked examples, fading, expertise reversal**: Renkl, Kalyuga.
- **Self-explanation prompts**: Chi 1989; Hilbert, Schworm & Renkl.
- **Making thinking visible**: Collins, Brown & Newman; Schoenfeld modelled problems he could not
  yet solve.
- **Hint abuse**: Aleven & Baker (36% of tutor actions).
- **Product precedents**:
  - AoPS Alcumus (hidden ratings);
  - Lichess puzzles (a rating per puzzle);
  - Project Euler (methods unlocked after solving);
  - Euclidea (stars for alternative solutions);
  - NRICH (low threshold, high ceiling);
  - Desmos (anonymised class display);
  - Exercism (mentor request queue, and its wait problem);
  - Brilliant (the daily challenge);
  - Khanmigo (a Socratic tutor, and the frustration of stuck students).

  Links in the design proposal page.
