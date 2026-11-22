# Learning Architecture

> **Status (2026-11-22).** Covers the curriculum sync, the evidence sources and flow, the assessment-item registry and
> Mastery V2. Imported from the Algerian platform (DZ dev 7f4cef1c) on 2026-11-22. True here: the whole server side
> (`Domain/Progress`, `Domain/Curriculum`, the commands), on the French grades `6e`–`3e`. Not true here: the catalogue is
> EMPTY, so no learning point, no assessment item and no evidence exist yet; the module lessons whose final test
> (`BossFinal`) and stages this document cites were deleted — a v2 lesson's evidence is its game-world first tries
> (`LESSON_V2.md` §1bis) and the practice engine.

The curriculum + learning-evidence + mastery system. Companion docs: `AI_LESSON_CONTRACT.md` (the question-metadata
convention), `docs/reports/DIAGNOSTIC_INTEGRATION.md` (how the diagnostic fits in), `LEARNING_NET.md` (the programme
items above the learning points).

## The hierarchy

```
GRADE  (6e, 5e, 4e, 3e; level `college`)
  └── CHAPTER   (a thème of the programme, e.g. nombres_calculs)
        └── UNIT    (`units`, `lessons.unit_id`)
              └── LESSON   (none yet)
                    └── LEARNING POINT   (<grade>_<lesson>_P<n>, e.g. 3e_<lesson>_P1)
```

- **Source of truth**: `packages/core/curriculum/coursesData.js`, which builds
  the catalogue (`allCourseLevels`, `courseLevels`) from
  `curriculum/fr/programme_<grade>_2026_2027.json`, `units_<grade>_…` and
  `lessons_<grade>_…`. MySQL is the **runtime index** of that source, never a
  second definition of it. The catalogue builder hides a thème with no lesson,
  so every grade exports `chapters: []` today.
- **Learning points** are derived from each lesson's authored `pointsToLearn`
  array inside `buildLesson()` (`coursesData.js`): entry *i* becomes
  `{gradeId}_{lessonId}_P{i+1}`. The plan asks for opaque ids with a lock file
  before the first lesson (plan §2) — not yet implemented.
- **`pointsToLearn` is append-only once imported.** Reordering or removing an
  entry silently changes which competency an existing `P{n}` code names, while
  evidence rows keep referencing the code. `php artisan
  smarter:validate-curriculum` flags title drift on imported codes; treat any
  such flag as a review gate, not noise.
- **Lesson codes are globally unique** since the 45-minute split (authored
  ids are curated; auto-generated stubs carry a grade suffix, e.g.
  `triangles-5e`) — a `coursesData.test.js` invariant guards this, because
  the evidence and lesson-progress endpoints look lessons up by bare code
  while MySQL only enforces per-chapter uniqueness. Learning-point codes are
  globally unique as well (grade-prefixed by construction).

## Curriculum sync

```
coursesData.js ──(node exportCurriculum.mjs)──> .generated/curriculum-export.json
                                                        │
                     php artisan smarter:import-curriculum   (idempotent upserts)
                                                        │
                                                        ▼
                            MySQL: grades / chapters / lessons / learning_points
```

- `php artisan smarter:import-curriculum {--dry-run} {--from-json=}` — shells
  to the Node export script (paths in `config/curriculum.php`, env-overridable);
  `--from-json` for Node-less environments. Learning points that disappear
  from the source are **retired (`retired_at`), never deleted** — evidence may
  reference them.
- `php artisan smarter:validate-curriculum {--strict}` — read-only comparison,
  writes `docs/reports/CURRICULUM_SYNC_REPORT.md` (the DZ copy of that file was
  deleted on 2026-11-22; a run writes a new one). `--strict` exits non-zero on
  drift (CI mode).

### Where lesson existence is authoritative

**The file catalogue decides which lessons exist.** MySQL is the runtime index
of that source, never a second definition of it. A lesson's identity is its
`code`, and the same string is the lesson id everywhere:

```
packages/core/curriculum/fr/lessons_<grade>_2026_2027.json   code
  → coursesData.js                                        lesson.id
  → lessons/college/<grade>/<theme>/<unit>/<lesson>/       the lesson's folder (lesson.config.js, lesson.pack.js)
  → apps/web/src/lessons/registry.js                      registry key
  → MySQL lessons.code                                    the DB row
  → localStorage `smarter_lesson_{id}`, API `{lessonCode}` in every route
```

**The import never deletes.** A lesson removed from the catalogue leaves its
row behind on purpose: evidence, progress and final-test attempts reference it,
and the students who opened it keep a readable history. Retirement is therefore
`publication_status = 'archived'` (`smarter:curriculum-sql --retire-lesson=…`),
not a delete. **This is the only acceptable behaviour in production.**

### Reconciling a LOCAL database with the catalogue

A row left behind still counts for `smarter:registry-health --gate`, which
checks every lesson of an active grade whatever its publication status. On a
development database, where that history belongs to test accounts, the gate
therefore fails until the row is gone. That is what the prune command is for:

```bash
node packages/core/curriculum/exportCurriculum.mjs          # refresh the export
php artisan smarter:prune-retired-learning-points --dry-run # what is safe to drop

# a catalogue-absent lesson that still carries history — DEV ONLY
php artisan smarter:prune-retired-learning-points --with-history --dry-run
php artisan smarter:prune-retired-learning-points --with-history --force
```

`--with-history` refuses to run outside `APP_ENV=local`, requires `--force` in
addition to the flag, and itemises what each lesson would take with it before
deleting. Every dependent table cascades from `lessons.id` (learning points,
evidence, progress, mastery, attempts, modules, exercises), so the delete
leaves no orphan rows; `notebook_notes` and `student_reports` are
`ON DELETE SET NULL` and keep the student's own writing.

**Never run `--with-history` against production**, and never reach for
`TRUNCATE`: the reconciliation is targeted, by lesson code, or it is wrong.

## Evidence sources — practice ≠ assessment (Mastery V2, 2026-09-24)

Three kinds of question, and only two sources of evidence:

| Question | Where | Produces evidence? | `assessment_type` |
|---|---|---|---|
| Module questions (`discovery`, `practice`, trigger, manipulation) — module lessons, deleted here | inside a lesson's modules | **never** — mistakes there are information, not evidence | — |
| Final test (`BossFinal`, `evaluation` stage) — module lessons, deleted here; the server door (`POST /lessons/{code}/evidence`) remains | the lesson's evaluation module | yes | `assessment` |
| Practice engine exercises | `content/practice/**` (empty today), the practice hub | yes, at practice weight | `practice_exercise` |
| Game world of a v2 lesson | generated arithmetic, no stored key | yes, on strict terms: written format, first try, no help — the server RE-COMPUTES the verdict from the numbers (`POST /lessons/{code}/game-evidence`, `GameEvidenceController`, `Domain/GameWorld/ClaimVerifier`), difficulty 2–3; never enough alone for « mastered » (`GAME_WORLD.md` §4) | `practice_exercise` |

**Daily challenge answers** (« التحدّي اليومي », 2026-09-25) are practice
engine questions served by the server: they enter through the same door as
`practice_exercise` evidence on the registry item — same weight, same
repetition rules, no new source type and no new engine version — with the
provenance `source_id = "daily_challenge:{attempt uuid}"` (the column was
widened to 64 characters for it). The challenge's points, streak and ranking
never touch this state. Contract: `DAILY_CHALLENGE.md` §5.

"Practice" in the first row means **module practice questions**; the practice
**engine** is a genuine evidence source. Both evidence sources feed the same
canonical state — there is no second mastery table
(`PracticeEvidenceConvergenceTest::test_there_is_no_second_mastery_table`).

Exercises written inside a lesson stay **instructional** (decision D9): their
`learningPointId` is documentation. An exercise that should count goes into the
practice bank as a JSON exercise — it then satisfies the evidence contract by
construction.

## Evidence flow

```
FINAL TEST (BossFinal)                         PRACTICE ENGINE (PracticeSession)
POST /lessons/{code}/evidence                  POST /practice/sessions/{id}/answers
  {questionCode, attemptId, answer:{picked}}     {attemptUuid, answer, outcome? (prediction only)}
        │                                               │
        │  LearningEvidenceController                   │  PracticeEvidenceRecorder
        │  item = assessment_items[final_test:…:E1]     │  AnswerEvaluator (PHP) judges the raw answer
        │  outcome = picked === answer_key.correct      │  question_attempts.outcome / evaluated_by
        │  (unanswered → abandoned)                     │  client_outcome kept when it disagreed
        └──────────────────┬────────────────────────────┘
                           ▼
              ProgressEngine::recordEvidence  — the ONLY door
                1. idempotent by attempt_id
                2. item from the registry → learning points + roles, difficulty, template
                3. EvidenceClassifier → attempt_number, demonstration_kind
                4. INSERT learning_evidence (append-only) + pivot (role)
                5. per learning point: MasteryEngine::apply(state, event, context)
                   → UPDATE student_learning_point_progress (engine_version)
```

### Trust boundary

The client never decides anything that counts for mastery:

| Claim | Decided by |
|---|---|
| who the student is | the Sanctum token |
| correctness | the server — `App\Domain\Practice\Support\AnswerEvaluator` (practice, all 7 answer types) and the registry answer key (final test) |
| learning points and roles | the **assessment-item registry** (`assessment_items`), built from content |
| source (`assessment` / `practice_exercise`) | the ROUTE — `/evidence` is the final test; a client-declared `assessmentType` other than `assessment` is refused (422) |
| difficulty, hints, attempt number, demonstration kind | the registry, `hint_events`, and `EvidenceClassifier` |

`evaluated_by` on every evidence row records who judged: `server`,
`client_verified` (legacy payload, re-judged by the server and compared),
`client` (fallback — weighted ×`client_evaluated`), `client_legacy` (rows
written before the registry existed; weight unchanged — devaluing them would
rewrite history).

**Transition window — closed by default since 2026-09-29.** The legacy
final-test payload `{isCorrect, learningPointCodes}` is REFUSED (422) unless
`MASTERY_ACCEPT_LEGACY_EVIDENCE=true` (`config/mastery.php`,
`accept_legacy_evidence_payload`, default now `false`). Accepted, it let a
crafted request declare a correct answer to a question the registry does not
know — the client deciding mastery, against this boundary. The web client has
sent only the answer since Mastery V2; `phpunit.xml` sets the variable to
`true` because inherited fixtures still post the old shape, and
`EvidenceTrustBoundaryTest` covers the refusal. Set it on a production host
only to drain very old queued clients, and log-watch `evidence.legacy_payload`. `mastery.server_evaluation=false` is the practice-engine fallback
to the client's outcome. Both flags exist for rollback, not as normal modes.

**The JS and PHP evaluators are twins.** `packages/core/practice/fixtures/answers.json`
(179 cases, generated by RUNNING the JS evaluator — never edited by hand; the
2026-09-29 cases cover Arabic-Indic/Persian digits, `٫`, `∕`, set braces, « و »
and a trailing dot — `EXERCISE_CONTRACT.md` « Student input normalisation ») is
consumed by `answerEvaluator.fixtures.test.js` and `AnswerEvaluatorFixtureTest.php`.
When they disagree, fix PHP; regenerate the fixture only from JS. Known,
documented limit: PHP decodes `{}` and `[]` to the same empty array, so the
`normalized` string of an EMPTY affine/interval syntax-error answer reads `[]`.

## The assessment-item registry

`assessment_items` (+ pivot `assessment_item_learning_point`) is an **index of
content**, rebuilt by `php artisan smarter:import-content-registry` from
`packages/core/curriculum/exportContentRegistry.mjs` — the same handshake as
`lesson_modules` and `practice_exercises`. Question CONTENT stays in JSX and
JSON; the registry holds only what the server needs to judge without the
client: learning points + roles, difficulty, template, answer type, and the
**answer key**.

- `item_key` = `{final_test|practice}:{lesson}:{exercise|final}:{question}` —
  the same key as `learning_evidence.item_key`.
- The importer **validates** every item against the database (codes exist, are
  not retired, belong to the item's lesson, exactly one primary) and refuses
  the invalid ones by name.
- An item is **never deleted**: absent from the export ⇒ `retired_at`. A
  changed answer key / mapping / difficulty ⇒ new `content_version`; history
  is not rewritten.
- A final-test question whose `correct` is computed (not a literal) is
  exported without a key, `evaluation: client` (weighted less). None exists
  in the live lessons; the validator refuses it there.
- The registry's per-learning-point count of published primary items is
  cached (`mastery.available_items_cache_ttl`) and purged by the importer.

## Mastery model (V2)

### The engine is a versioned pure function

```
MasteryEngine::apply(MasteryState $state, EvidenceEvent $event, EngineContext $ctx): MasteryState
```

`App\Domain\Progress\Engine\` — `EngineV1` (the historical arithmetic,
**frozen**, wrapping `Support\MasteryModel`), `EngineV2`, `EngineRegistry`.
Every number lives in `config/mastery.php` under `engines.{version}`; the
engine holds no constant, reads no table, scans no exercise, selects nothing.
`mastery.engine_version` (default **2**) chooses the writer; every state row
stores the `engine_version` that produced it.

### V2 arithmetic

```text
sign   = outcome ∈ {correct, equivalent_correct, partially_correct} ? +1 : −1
dw     = clamp(difficulty, 1, levels) / levels                    (levels = 5)
step   = 0.22 · (0.3 + 0.7 · (sign>0 ? dw : 1 − dw))
weight = partial 0.4 · secondary 0.5 · practice 0.9 · client-judged 0.5
         · (success) hint decay {1:0.7, 2:0.5, ≥3:0.4}, floor 0.4
         · (success) demonstration {first 1, variant 0.7, retry_after_failure 0.6, repeat_after_success 0.1}
         · (failure) demonstration_failure {first 1, variant 1, retry_after_failure 1, repeat_after_success 0.5}
confidence' = round(clamp(confidence + sign·step·weight, 0, 1), 3)
```

`syntax_error` and `abandoned` are **inert**: stored as evidence, no attempt
counted, confidence untouched.

### Repetition — what an answer is worth depends on what came before

`EvidenceClassifier` compares the new answer with the student's previous
non-inert evidence on the same `item_key` and the same `template_key`:

| Before | Kind | Success weight | Failure weight |
|---|---|---|---|
| nothing on the item nor the template | `first` | 1.0 | 1.0 |
| nothing on the item, something on its template | `variant` | 0.7 | 1.0 |
| tried the item, never succeeded | `retry_after_failure` | 0.6 | 1.0 |
| already succeeded the item | `repeat_after_success` | 0.1 | 0.5 |

`Q1 ✓ ×10` is one demonstration and nine rehearsals; `Q1…Q10 ✓` is ten
demonstrations. The failure weight on `repeat_after_success` is ×0.5 — not
full — because with full-weight slips, practising a known item at 90 %
accuracy made confidence DRIFT DOWN (found by the dry-run replay of the demo
dataset, 2026-09-24; a deviation from the plan's "failures always count in
full", recorded there).

### Status — high confidence is necessary, not sufficient

```text
confidence < 0.40                                   → gap        (threshold)
confidence < 0.70                                   → reinforce  (threshold)
distinct_items_success < min(3, available items)    → reinforce  (insufficient_evidence)
require_assessment and no final-test success
   and no success at difficulty ≥ 4                 → reinforce  (needs_assessment)
otherwise                                           → mastered   (threshold)
```

`available items` = published registry items whose PRIMARY point is this one,
supplied by `AssessmentItemRepository` through `EngineContext` — a bound, so a
5-item bank and a 500-item bank use the same rule. Unknown (empty registry) ⇒
no bound.

### The state row

`student_learning_point_progress` stays the ONE canonical row per (student,
learning point): `status`, `status_reason`, `confidence`, `attempts`,
`correct_count`, `partial_count`, `failure_count`,
`distinct_items_success`, `distinct_items_attempted`,
`distinct_templates_success`, `assessment_success_count`,
`max_difficulty_success`, `last_evidence_at`, `last_success_at`,
`last_failure_at`, `engine_version`, `recomputed_at`. No column references an
exercise: the table is bounded by students × learning points.

There is no second score: the reliability of a confidence is read in the
counters (and in `status_reason`).

### Freshness — derived, never stored, never a decay

`App\Domain\Progress\Support\Freshness`: `fresh` ≤ 21 days, `aging` ≤ 60,
`stale` beyond (D7). Confidence never decays — the same evidence always means
the same thing, which is what makes replay deterministic.

### Explanation — derived on request

`MasteryExplainer` assembles « why this status » from the state counters, the
last 20 evidence rows and registry titles. Nothing is stored twice.
`GET /students/me/learning-points/{code}/explanation` (student, own points) and
`GET /teacher/classrooms/{id}/students/{sid}/learning-points/{code}/explanation`.

### Evidence is append-only

`LearningEvidence` refuses any per-row update or delete; the only door is
`LearningEvidence::allowBackfill()`, which can FILL null columns and nothing
else (`smarter:evidence:backfill`). Administrative mass purges (account
deletion, demo reset, curriculum scoping) are query-builder deletes and remain
possible — they remove a student's history, they do not rewrite it.

### Replay — changing the policy without rewriting the past

```bash
php artisan smarter:mastery:replay --all --engine=2 --dry-run --report=replay.json   # read the diff
php artisan smarter:mastery:replay --all --engine=2                                   # switch
php artisan smarter:mastery:replay --lesson=tayin-pgcd --engine=1                     # roll back
php artisan smarter:mastery:verify --sample=100                                       # nightly (03:30)
```

- Unit of replay = one (student, point): its evidence in arrival order,
  re-classified in memory, through the chosen engine. An optional per-step
  callback receives (evidence row, state before, state after) — the history
  rebuild uses it.
- Same evidence + same version ⇒ same state (`MasteryReplayTest`).
- A write that finds a row produced by another version replays that pair in
  the current version first — a row is always the function of the evidence
  and of the version it declares.
- Every run is journaled in `mastery_replays` (never a truth, an audit log).
  `POST /admin/mastery/replays` queues the same command (`ReplayMasteryJob`,
  in-process `Artisan::call` — no `proc_open`, Hostinger-safe).
- **Changing the policy**: add `EngineV3` + `engines.3`, dry-run, review,
  switch `engine_version`, replay. Never edit a released version's numbers.

### State history — `learning_point_state_transitions` (2026-09-25)

`student_learning_point_progress` is the PRESENT; each evidence overwrites it.
The history of that state is kept separately, append-only:

```text
learning_point_state_transitions
  user_id, learning_point_id, learning_evidence_id (nullable)
  status_before (null = no row yet = unassessed), status_after, reason_after
  confidence_before, confidence_after, engine_version
  origin  live | replay | backfill
  occurred_at  = the evidence's submitted_at (not the write time)
```

- **One writer**, `Domain\Progress\TransitionRecorder`, called where the state
  changes: `ProgressEngine::advance` (origin `live`, inside the evidence
  transaction — state and history cannot diverge), `ReplayService::recompute`
  and the lazy replay on a version change (origin `replay`, dated now: a
  recalculation, not something the student learned). One line per REAL change
  (status, reason or confidence moved); inert answers and duplicate attempt
  ids write nothing. The trace is exact, not sampled; its volume is bounded by
  the evidence pivot.
- **State at a date** = the last line whose `occurred_at` precedes it; no line
  = unassessed then. This is what the teacher's trajectories, « declined » /
  « stalled » signals, recent changes and intervention trails read
  (`TEACHER_CLASSROOM_ARCHITECTURE.md` §4) — never a replay on read.
- **Rebuilding** history for evidence older than the table:
  `php artisan smarter:mastery:transitions-backfill --all [--rebuild] | --user=ID`
  replays each pair through THE replay (`ReplayService::replay`'s `$onStep`
  hook, no second algorithm) under the current engine and writes origin
  `backfill` lines dated by the evidence — only for evidence BEFORE the
  pair's first live line, never over recorded history; idempotent. Screens
  mark backfilled and replayed steps as such.
- It is student data: `ScopeCurriculum` treats it like the evidence (it
  blocks the command) and the demo reset deletes it explicitly.

`LearningPointTransitionTest` locks it (one line per change, chaining,
idempotency, rebuild = live, replay origin).

### Outcome taxonomy and success rate — one definition

`App\Domain\Progress\Outcome` mirrors `OUTCOMES` in
`packages/core/practice/answerEvaluator.js`, locked by
`packages/core/practice/fixtures/outcomes.json`:

| Outcome | Mastery | Success rate |
|---|---|---|
| `correct`, `equivalent_correct` | positive | success |
| `partially_correct` | **weak positive** (×0.4), not a distinct success | partial (denominator) |
| `incorrect` | negative | failure (denominator) |
| `syntax_error`, `abandoned` | inert | excluded (reported as `inert`) |

`successRate = successes / (successes + partials + failures)`, `null` without
data — computed by `App\Domain\Progress\Support\OutcomeStats` for the student
dossier, the class view, the admin dashboard/analytics and the practice
summary. No other formula exists.

### Product decisions (D1–D10), as configured on 2026-09-24

| | Decision | Where |
|---|---|---|
| D1 | `min_distinct_items` = 3, bounded by the bank | `engines.2.min_distinct_items` |
| D2 | `mastered` needs a final-test success OR a success at difficulty ≥ 4 | `require_assessment`, `assessment_equivalent_difficulty` |
| D3 | partial = positive ×0.4, never a distinct success | `weights.partial` |
| D4 | repetition weights as above (+ failure weights, deviation) | `demonstration`, `demonstration_failure` |
| D5 | expected answers still ship in the practice JSON bundle; the server judges | — (Planned: server-served questions) |
| D6 | unanswered final-test question = `abandoned` (inert) | `LearningEvidenceController::judge` |
| D7 | freshness 21 / 60 days, derived, no decay | `freshness` |
| D8 | gates are soft: they recommend, never block | `RecommendationService` |
| D9 | textbook exercises stay instructional | this document |
| D10 | time on task not collected | — |


## Initial knowledge vs. current mastery

```
DIAGNOSTIC (once, per grade)          LESSON ASSESSMENTS (ongoing)
  diagnostic_sessions                    learning_evidence
  diagnostic_skill_assessments           student_learning_point_progress
  (keyed by session + skill_id)          (keyed by user + learning_point_id)
        │                                      │
        └────────────┬─────────────────────────┘
                     ▼
       GET /api/v1/students/me/learning-profile
       { initialKnowledge: [...], currentMastery: [...] }
```

The two live in **disjoint tables with disjoint keys** — that separation *is*
the guarantee that lesson practice/assessment never overwrites the diagnostic
baseline (verified by
`StudentLearningProfileTest::test_lesson_evidence_never_touches_the_diagnostic_baseline`).
The profile therefore distinguishes "didn't know this initially" from
"learned it during the course".

`learning_points.diagnostic_skill_id` is a **nullable, advisory** string
cross-reference into the diagnostic's skill vocabulary — populated only for
verified correspondences (`database/seeders/DiagnosticSkillLinkSeeder.php`),
null everywhere else, read by nothing in the diagnostic. Uncertain means
unmapped.

## Lesson completion ≠ mastery

Lesson progression (completion/resume) and knowledge progression (mastery)
are two server-side tables that are never collapsed: `student_lesson_progress`
(union/latest-wins merge, written via `PUT /lessons/{code}/progress`, cached
in `smarter_lesson_{id}` localStorage — see `PROGRESS_MODEL.md`) and
`student_learning_point_progress` (evidence-driven mastery described above).
A student can be 92% "complete" while P4 is `fragile` — the two are never
collapsed.

## The learning journey (stages) and the 90-minute cap

The stage vocabulary (`prerequisite_check → trigger → discovery → manipulation → formalization → practice_lab →
evaluation`) and the 90-minute cap (`MAX_LESSON_MINUTES`) still live in `packages/core/curriculum/lessonStages.js`,
read by the lesson validator; the module lessons that were authored on them are deleted, and a v2 lesson has no
stages (`LESSON_V2.md`). What still holds on the server: `GET /students/me/lessons/{code}/recommendations`
(`Domain\Progress\Recommendation\RecommendationService`) maps a weak point to what teaches it, a weak prerequisite
first, never "restart the lesson"; and **nothing is ever locked by mastery** — the non-blocking invariant wins (D8).

## Validation gates

- `npm run validate:lessons` (in `check:lessons`, `--strict`) — the lesson validator; with no lesson it has nothing to
  check.
- `php artisan smarter:validate-curriculum --strict` — curriculum drift gate.
- Backend suites: `CurriculumImportTest`, `LearningEvidenceFlowTest`,
  `StudentLearningProfileTest`, plus the untouched `DiagnosticFlowTest`
  regression suite.

## Deferred (explicit follow-on work)

1. Server-served practice questions without `expectedAnswer` (D5) — the
   server already judges; hiding the key would stop a student reading it.
2. Contextual/representation diversity as a numeric input — `cognitiveDemand`
   and `templateId` are stored for explanation only.
3. Time on task (D10).
4. Adaptive recommendations across lessons (the per-lesson
   `RecommendationService` exists; a cross-lesson planner does not).
