# Learning Architecture

The curriculum + learning-evidence + mastery system introduced by the
Grade → Chapter → Lesson → LearningPoint migration (Slice 1). Companion docs:
`AI_LESSON_CONTRACT.md` (the question-metadata convention),
`docs/reports/DIAGNOSTIC_INTEGRATION.md` (how the existing diagnostic fits in),
`docs/reports/LEARNING_POINT_COVERAGE.md` (per-lesson assessment coverage).

## The hierarchy

```
GRADE  (6e, 5e, …, terminale_specialite)
  └── CHAPTER   (official-program domain, e.g. nombres_calculs)
        └── LESSON   (e.g. resolution-problemes)
              └── LEARNING POINT   (e.g. 6e_resolution-problemes-1_P3)
```

- **Source of truth**: `packages/core/curriculum/coursesData.js` (which merges
  the official ministry JSON with `smaMetadata`). MySQL is the **runtime
  index** of that source, never a second definition of it.
- **Learning points** are derived from each lesson's authored `pointsToLearn`
  array inside `buildChaptersForGrade()`: entry *i* becomes
  `{gradeId}_{lessonId}_P{i+1}`. The IDs are stable, deterministic, and
  human-readable.
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
  writes `docs/reports/CURRICULUM_SYNC_REPORT.md`. `--strict` exits non-zero
  on drift (CI mode).

## Practice ≠ assessment

Every lesson question conceptually belongs to one of **discovery** (learning —
mistakes expected, never touches mastery), **practice** (training — never
touches mastery), or **assessment** (evidence — the only kind that updates
mastery). The mechanism is question-level metadata (see
`AI_LESSON_CONTRACT.md`); enforcement is layered:

1. Frontend `useEvidenceSubmission` only submits when
   `assessment.enabled === true` **and** `assessment.type === 'assessment'`.
2. The server rejects any `assessmentType` other than `'assessment'` (422).

## Evidence flow

```
question answered (assessment-tagged, correctness already computed by the
lesson's own validator — see EXERCISE_CONTRACT.md)
  └─> useEvidenceSubmission.submitEvidence(question, isCorrect, answer)
        └─> POST /api/v1/lessons/{lessonCode}/evidence
              body: {questionCode, attemptId (client UUID), isCorrect,
                     learningPointCodes[], answer?}
              ├─ on failure: parked in the offline queue
              │  (localStorage 'smarter_evidence_queue'), flushed on the
              │  browser's online event / next mount — the lesson NEVER blocks
              └─ server (ProgressEngine):
                   1. resolves learningPointCodes globally (unique codes)
                   2. requires them to belong to ONE lesson whose code matches
                      the URL — cross-lesson / unknown / retired codes → 422
                   3. student = Sanctum token's user, never a body field
                   4. idempotent by attempt_id (a replay is a no-op)
                   5. writes learning_evidence + pivot rows, updates
                      student_learning_point_progress via the mastery model
```

### Trust boundary (deliberate asymmetry from the diagnostic)

Diagnostic questions live in PHP and are graded server-side
(`AnswerChecker`). Lesson questions live in JSX **by design** (no `questions`
table), so the server cannot recompute lesson correctness — `isCorrect` is
client-reported, coming from the already-trusted exercise-validator contract.
What the server owns for lesson evidence is **relationship validation** and
the mastery bookkeeping.

## Mastery model

`App\Domain\Progress\Support\MasteryModel` — a deliberate **parallel** of
`App\Domain\Diagnostic\Support\MasteryModel`, not shared code (the Diagnostic
module stays self-contained in both directions). Same numbers, one meaning
app-wide:

| Constant | Value |
|---|---|
| `STARTING_CONFIDENCE` | 0.5 |
| `MASTERED_THRESHOLD` | 0.70 (status `mastered`) |
| `GAP_THRESHOLD` | 0.40 (below → `gap`; between → `reinforce`) |
| `LEARNING_RATE` | 0.22, difficulty-weighted delta |
| `DEFAULT_DIFFICULTY` | 2 — lesson questions carry no difficulty rating yet; every evidence event weighs as a mid-difficulty data point (documented simplification) |

A lockstep unit test (`tests/Unit/Progress/MasteryModelTest.php`) fails if the
two models' thresholds ever drift apart silently.

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

Every lesson follows the universal cycle, authored as `stage` fields on its
modules (`packages/core/curriculum/lessonStages.js`, contract in
`LESSON_CONTRACT.md`):

```text
prerequisite_check → trigger → discovery → manipulation
        → formalization (À retenir) → practice_lab → evaluation
```

- `prerequisite_check` and `manipulation` are optional — the pedagogy is
  universal, its expression adapts to the mathematics.
- **Results is not a stage**: the "what did I learn" screen is the
  `evaluation` module's completion view, rendered from the learning-profile
  endpoint.
- Only `evaluation`-stage modules contain evidence-generating questions;
  everything earlier is learning, where mistakes are information, not
  evidence.
- **The final evaluation is an alternative path, not just the last module.**
  It is unlocked from the start (`lessonAccess.js` exempts `evaluation`-stage
  modules from sequential unlock): a student may choose "Je pense déjà
  maîtriser" and demonstrate mastery directly. Completion records how it
  happened (`student_lesson_progress.completion_mode`: `path` | `mastery`).
  When the evaluation reveals weak Learning Points, the results screen maps
  them to the modules that teach them (`teachesLearningPointIds` on each
  module + `recommendModulesForLearningPoints` in packages/core) and
  recommends those — never "restart the lesson".
- **Mastery gates** (`requiresLearningPointIds` on a module) express a real
  pedagogical dependency on specific Learning Points — never a score. They
  block only on a *demonstrated* gap in the student's mastery profile, never
  on absent evidence, so a gate can never strand a student on the normal
  path. Used sparingly; the validator requires gated LPs to be taught by an
  earlier module.
- **A built lesson's module sequence is capped at 90 minutes**
  (`MAX_LESSON_MINUTES`, mirrored as `lessons.duration_minutes` in MySQL and
  checked by `smarter:validate-curriculum`) — both the module `estimatedMin`
  sum and the catalogue's `durationMinutes` must stay at or below it. A topic
  whose full scope needs more than one sitting is split into multiple
  `lesson.config.js` files ("Partie 1 / Partie 2") rather than exceeding the
  cap.

## Validation gates

- `npm run validate:lessons` — parses lesson JSX (`@babel/parser`) and checks
  question ids, assessment metadata shape, and learning-point references.
  Coverage (every LP ≥ 1 assessment question) is enforced for **migrated**
  lessons now, and for **all available lessons** under `--strict` — flip
  `--strict` on in CI once all 9 six-ième lessons are migrated.
- `php artisan smarter:validate-curriculum --strict` — curriculum drift gate.
- Backend suites: `CurriculumImportTest`, `LearningEvidenceFlowTest`,
  `StudentLearningProfileTest`, plus the untouched `DiagnosticFlowTest`
  regression suite.

## Deferred (explicit follow-on work)

1. Classify + migrate the remaining 8 six-ième lessons (process:
   `docs/reports/LEARNING_POINT_COVERAGE.md` §Process). One lesson per pass,
   `resolution-problemes` is the template.
2. Flip `validate:lessons --strict` in CI once all 9 are migrated.
3. Student-facing UI for the learning profile (API exists; no UI yet).
4. Difficulty metadata on lesson assessment questions (threads through
   `ProgressEngine` → `MasteryModel::updateConfidence`).
5. Adaptive recommendations from combined baseline + current mastery (the
   data model supports it; no engine yet).
6. Cleanup: `apps/web/public/smarter-ui/lesson.js` is dead pre-React code with
   an incompatible localStorage key (`smarter_completed_lessons`) — unrelated
   to this migration, flagged for deletion.
