# Smarter Academy — Learning Point Mastery V2 Execution Plan

> **Status: IMPLEMENTED (2026-09-24) — historical plan, not a contract.** The
> implemented contract is [`LEARNING_ARCHITECTURE.md`](../architecture/LEARNING_ARCHITECTURE.md)
> § « Mastery model (V2) ». Deviations from this plan, each forced by the
> code or the data:
>
> 1. **Failure weights per demonstration kind** (`demonstration_failure`): the
>    plan said failures always count in full; replaying the demo dataset showed
>    that practising a KNOWN item at 90 % accuracy then drifted confidence
>    down. A slip on an already-solved item now weighs ×0.5.
> 2. **Difficulty scale.** V2 normalises by 5 levels (`dw = d/5`), so the final
>    test's default difficulty is 3 (the plan's example numbers used V1's /4).
> 3. **Registry pivot.** `assessment_item_learning_point` was added so « items
>    per learning point » is an indexed COUNT, not a JSON scan.
> 4. **`client_legacy`.** Evidence written before the registry is labelled
>    `client_legacy` and keeps its weight (devaluing it would rewrite history);
>    only genuinely client-judged NEW evidence (`client`) is discounted.
> 5. **Soft gates / recommendations** are served by `RecommendationService`
>    (`GET /students/me/lessons/{code}/recommendations`).
> 6. The UI « إختبار أولي » is the final module's title (product decision of
>    2026-09-24), replacing « إتقان ».
>
> The original text follows, unchanged, as the record of the design.
>
> ---
>
> **Original status: plan, not a contract (2026-09-24).** Nothing in this document is
> implemented. It is the implementation-ready design that follows
> [`LEARNING_POINT_MASTERY_AUDIT_2026-09-24.md`](./LEARNING_POINT_MASTERY_AUDIT_2026-09-24.md).
> Every phase that lands must update the authoritative contracts
> (`PROGRESS_MODEL.md`, `LEARNING_ARCHITECTURE.md`, `EXERCISE_CONTRACT.md`,
> `AI_LESSON_CONTRACT.md`, `TEACHER_CLASSROOM_ARCHITECTURE.md`) in the same
> task — the repository's Documentation Synchronization Rule. Until then, the
> code and those documents remain the source of truth, and this plan says
> `Planned` about everything it describes.
>
> Paths are relative to the repository root. Line numbers are those of the
> working tree on 2026-09-24.

---

## 1. Executive Summary

The platform already has an evidence-based mastery model: one immutable-ish
log (`learning_evidence`), one canonical state row per student × Learning
Point (`student_learning_point_progress`), one update rule
(`MasteryModel::updateConfidence`), and one writer (`ProgressEngine`). V2 does
**not** replace that shape. It hardens each layer so the system can answer
"what does this student actually know about LP A?" honestly when a lesson has
15 exercises, 200 or 500:

1. **Evidence becomes fully immutable and self-describing.** Each row gains a
   canonical outcome, a stable **item key** (which exact question), an optional
   **template key** (which exercise family), a server-resolved difficulty, an
   attempt number and a **demonstration kind** (`first`,
   `retry_after_failure`, `repeat_after_success`, `variant`). Nothing about the
   mastery decision is stored only as `confidence = 0.73`.
2. **The engine becomes versioned and replayable.** `MasteryEngine` is a
   pure, configured, versioned service. The V1 arithmetic is kept as
   `EngineV1` for validation and rollback; `EngineV2` adds the repetition
   semantics and a minimum-evidence rule. `MasteryRecalculator` grows into an
   artisan command with dry-run diff reports and chunked, queued replays.
3. **Mastery stops being farmable.** A correct answer's evidential weight
   depends on whether the student has already succeeded on that exact item
   (near zero), on a variant of the same template (reduced), or on a new item
   (full). `mastered` additionally requires a configurable minimum of
   **distinct** successful items, bounded by what the bank actually contains.
4. **The backend becomes authoritative.** Practice answers are re-evaluated
   server-side by a PHP port of `packages/core/practice/answerEvaluator.js`,
   locked to the JS evaluator by shared fixtures. Final-test questions are
   indexed into the content registry (as `lesson_modules` and
   `practice_exercises` already are) so the server resolves correctness, LPs
   and difficulty from content, never from the request.
5. **One outcome taxonomy** (`correct`, `equivalent_correct`,
   `partially_correct`, `incorrect`, `syntax_error`, `abandoned`) with one
   semantic table used by mastery, success rates, dossier, class view, admin
   analytics and practice summaries. The current `partially_correct`
   inconsistency (a failure in production, a success in the unit test) is
   resolved explicitly.
6. **Teachers get class × LP.** Two new read-only endpoints aggregate the
   canonical state table per class and per LP. No second mastery store.
7. **Completion and mastery are separated in words, colours and APIs**, and
   the mastery vocabulary is unified across the three Arabic label sets.

The exercise bank scales because the engine never looks at the bank. It reads
one event and one state row per write, and one state row per LP per read.
Only the (separate) exercise selector scans exercises, through indexed
registry tables. §40 demonstrates 15, 200 and 500 exercises per lesson on the
same code path.

---

## 2. Current Architecture Baseline

Full detail is in the audit. What V2 builds on:

| Layer | Today | File |
|---|---|---|
| LP definition | `pointsToLearn[i]` → `{grade}_{lesson}_P{i+1}`; MySQL `learning_points` (code unique, `retired_at`) | `packages/core/curriculum/coursesData.js:3115-3122`, `apps/api/database/migrations/2026_08_18_090003_*` |
| Evidence log | `learning_evidence` (+ pivot `learning_evidence_learning_point.role`) — `question_code`, `attempt_id` unique, `is_correct`, `assessment_type`, `outcome`, `level`, `hints_used`, `misconception_id`, `source_id`, `answer` | `apps/api/app/Models/LearningEvidence.php` |
| Canonical state | `student_learning_point_progress` (`status`, `confidence` DECIMAL(4,3), `attempts`, `correct_count`, `last_evidence_at`), UNIQUE(user, lp) | `apps/api/app/Models/StudentLearningPointProgress.php` |
| Engine | `MasteryModel::updateConfidence` — ±0.22·(0.3+0.7·dw), multiplicative modifiers (partial 0.5, secondary 0.5, practice 0.9, hints 0.7/0.5/0.4), clamp [0,1], bands 0.70 / 0.40 | `apps/api/app/Domain/Progress/Support/MasteryModel.php:84-135` |
| Writer | `ProgressEngine::recordEvidence` → `updateProgress` (incremental) | `apps/api/app/Domain/Progress/ProgressEngine.php:68,226` |
| Replay | `MasteryRecalculator::replay/matchesStored` — used by one test only | `apps/api/app/Domain/Progress/MasteryRecalculator.php` |
| Final-test source | `BossFinal.submitBoss()` → `useEvidenceSubmission` → `POST /lessons/{code}/evidence` with client `isCorrect` and client `learningPointCodes` | `apps/web/src/lessons/common/kit/BossFinal.jsx:315-343`, `hooks/useEvidenceSubmission.js:51-72` |
| Practice source | `PracticeAnswerController::store` → `PracticeEvidenceRecorder::record` (LPs from content, `outcome` from client) → `ProgressEngine` | `apps/api/app/Domain/Practice/PracticeEvidenceRecorder.php` |
| Client evaluator | `practice.evaluateAnswer` — pure JS, 7 answer types, exact rational arithmetic | `packages/core/practice/answerEvaluator.js` |
| Content registry (DB index of content) | `lesson_modules`, `practice_exercises` (exercise granularity, `publication_status`, `tier`), `lesson_resources`, imported by `ContentRegistryImporter` | `apps/api/app/Domain/Curriculum/ContentRegistryImporter.php` |
| Student reads | `GET /students/me/learning-profile` (all state rows of the user), `GET /lessons/{code}/practice/overview` | `LearningProfileController.php`, `PracticeSessionController.php:30-91` |
| Teacher reads | `ClassroomProgressService::classSummary/studentRows` (no LP data), `studentDetail` → `StudentDossier::profile` (unordered LP rows) | `apps/api/app/Domain/Classroom/ClassroomProgressService.php`, `apps/api/app/Domain/Progress/StudentDossier.php` |
| Admin reads | `AnalyticsService::learningPoints` (platform-wide mastered/exposed) | `apps/api/app/Domain/Admin/AnalyticsService.php:262-307` |
| Content validators | `scripts/validate-lessons.mjs` (assessment metadata, LP coverage), `scripts/validate-exercises.mjs` (schema, exactly one `primary`, `index.generated.json`) | — |

### Documentation vs implementation (must not be reconciled silently)

```text
DOCUMENTATION: LEARNING_ARCHITECTURE.md § "Practice ≠ assessment" — practice
               "never touches mastery".
CURRENT IMPLEMENTATION: ProgressEngine::ALLOWED_ASSESSMENT_TYPES accepts
               'practice_exercise'; PracticeEvidenceRecorder writes evidence
               weighted ×0.9. Only module-level 'practice' questions are inert.
PLAN IMPLICATION: V2 keeps both sources; the doc must distinguish "practice
               questions inside modules" (inert) from "the practice engine"
               (evidence). Phase 0 rewrites the section.
```

```text
DOCUMENTATION: MasteryModelTest::test_a_partial_answer_counts_for_less_than_a_full_one
               asserts a partial answer RAISES confidence (isCorrect=true).
CURRENT IMPLEMENTATION: PracticeEvidenceRecorder::SUCCESS_OUTCOMES excludes
               'partially_correct', so it reaches the model with isCorrect=false:
               a failure at half weight (0.5 → 0.436).
PLAN IMPLICATION: §12 defines partially_correct as weak POSITIVE evidence;
               the recorder is changed, not the test. Existing rows are
               replayed under the new rule (§31).
```

```text
DOCUMENTATION: LEARNING_ARCHITECTURE.md — the results screen recommends modules
               via recommendModulesForLearningPoints; mastery gates block on a
               demonstrated gap.
CURRENT IMPLEMENTATION: recommendModulesForLearningPoints has no production
               caller; isMasteryGateSatisfied is never passed masteryStatusById
               (LessonIndex.jsx:443-454, utils/moduleGate.js) so it always
               returns true.
PLAN IMPLICATION: §29/§30 wire both as SOFT (non-blocking) mechanisms; the
               docs must say "Planned" until Phase 8 lands.
```

```text
DOCUMENTATION: PROGRESS_MODEL.md body, "Completion vs Mastery" table — "No
               independent mastery signal exists".
CURRENT IMPLEMENTATION: student_learning_point_progress + MasteryModel exist
               and are displayed (the document's own 2026-09-20 header says so).
PLAN IMPLICATION: Phase 0 deletes the stale table; the header note becomes
               the body.
```

```text
DOCUMENTATION: EXERCISE_CONTRACT.md §0 — in the practice engine "a retry re-uses
               the same attempt id … only the first outcome counts".
CURRENT IMPLEMENTATION: True inside one open question (PracticeSession.jsx:371
               keeps attemptUuid). But re-OPENING the question (new session or
               revisiting) creates attempt_number+1 with a new UUID
               (PracticeSessionService.php:128) and full-weight evidence.
PLAN IMPLICATION: §9 defines both cases; the doc must describe both.
```

```text
DOCUMENTATION: AI_LESSON_CONTRACT.md — "Questions stay in JSX. No question
               content in MySQL, ever."
CURRENT IMPLEMENTATION: lesson_modules / practice_exercises / lesson_resources
               already index content metadata (never content) in MySQL.
PLAN IMPLICATION: §6/§21 add an assessment_items index holding LP mapping,
               difficulty and an ANSWER KEY (correct choice id) — metadata
               required to make the server authoritative. The rule is
               reworded: "question CONTENT stays in JSX/JSON; the registry
               indexes its metadata and answer key". This is an explicit
               contract change (Phase 0), not a silent one.
```

---

## 3. Problems Being Solved

From the audit, in order of impact on the two questions the system must answer:

1. **Client authority.** Correctness is client-computed in both sources; the
   final test also lets the client choose LP codes and `assessmentType`.
2. **Farmable mastery.** Every event counts in full; three easy repeats reach
   `mastered`; no minimum evidence; no notion of "same question again".
3. **Partial credit is a failure** in production and a success in the test.
4. **Three definitions of "correct"** and two denominators for success rates
   (`StudentDossier.php:51`, `ClassroomProgressService.php:192`,
   `PracticeSessionController.php:178`, `AnalyticsService.php:151`).
5. **Final test carries no difficulty** and is indistinguishable from
   practice except ×1.0 vs ×0.9; `completion_mode: 'mastery'` is never sent.
6. **Replay exists only in a test**; no engine version; no reconciliation path.
7. **Evidence lost silently** on a 422 during queue flush (`evidenceQueue.js`).
8. **Teacher has no class × LP view**; dossier LP list is unordered, capped at
   20, hides confidence.
9. **Completion dressed as mastery** (🏆 إتقان, module status `'mastered'`,
   `getModuleMastery`, «ملف الإتقان»); three Arabic label sets for one state.
10. **No explanation** of why a student is `mastered`.
11. **Unwired infrastructure**: mastery gate, module recommendations,
    `learning_point_prerequisites.required_mastery`.
12. **Textbook exercises** declare `learningPointId` that nothing reads.

---

## 4. Target Pedagogical Model

```text
raw evidence            what happened: this student, this item, this answer,
(immutable)             this outcome, with this help, at this time
        ↓
mastery estimation      what the evidence means: a confidence, plus counters
(versioned engine)      of INDEPENDENT demonstrations
        ↓
current LP state        one row: status · confidence · evidence counters ·
(canonical)             freshness · engine version
        ↓
views                   student / teacher / admin / recommendations /
                        Knowledge Map all READ the state; none recompute it
```

Principles the engine encodes (each maps to a section below):

- **Evidence over volume.** A new item is a demonstration; the same item again
  is practice. Both are recorded; only the first moves mastery meaningfully.
- **Generalisation is the goal.** Distinct items and distinct templates count
  more than repetitions; `mastered` requires several distinct successes.
- **Assessment confirms, practice builds.** Both feed the same state; the
  final test carries full weight and a difficulty; practice carries the level.
- **Help is not failure.** Hints reduce the value of a success and never
  worsen a failure (kept from V1).
- **Not knowing how to write is not being wrong.** `syntax_error` and
  `abandoned` stay inert (kept from V1).
- **Nothing decays silently.** Confidence does not decay; freshness is a
  separate, derived signal.
- **Everything is explainable** from the evidence rows and the state counters.
- **Completion is a different question**, with different words.

---

## 5. Evidence Model

`learning_evidence` stays the one log. It becomes append-only in code (no
`update()` path; the model refuses `save()` on an existing row except for the
backfill command) and gains the columns the engine needs to classify an event
without re-reading content.

### 5.1 Columns (existing → V2)

| Column | Today | V2 | Immutable |
|---|---|---|---|
| `user_id`, `lesson_id` | ✓ | unchanged | ✓ |
| `attempt_id` (UNIQUE) | ✓ client UUID | unchanged — idempotency key | ✓ |
| `question_code` | `'E1'` (final test) or `'exId:qId'` (practice) | kept for compatibility; **new** `item_key` is canonical | ✓ |
| **`item_key`** | — | `'{source}:{lesson}:{exercise_code}:{question_id}'`, e.g. `final_test:qasim-mushtarak-akbar:final:E1`, `practice:qasim-mushtarak-akbar:ex-…-l2-001:q2`. Backfilled. | ✓ |
| **`template_key`** | — | nullable; the exercise's `templateId` when content declares one, else NULL (engine falls back to `item_key`) | ✓ |
| **`source_kind`** | `assessment_type` ∈ {assessment, practice_exercise} | keep `assessment_type` (values unchanged) — `source_kind` is an alias in code, not a new column | ✓ |
| `is_correct` | client-reported | derived server-side from `outcome`; kept (analytics, legacy) | ✓ |
| `outcome` | nullable | **NOT NULL** for new rows, canonical taxonomy (§12); backfilled as `correct`/`incorrect` from `is_correct` | ✓ |
| `level` | practice level 1..5, NULL for final test | unchanged | ✓ |
| **`difficulty`** | — (derived at write from `level`, always 2 for final test) | 1..5, **resolved server-side from content** (§10); backfilled from `level`, final test → 3 | ✓ |
| `hints_used` | ✓ | unchanged (from `hint_events`, server-owned) | ✓ |
| **`attempt_number`** | — (exists on `question_attempts` only) | per (user, item_key), 1-based, computed at write | ✓ |
| **`demonstration_kind`** | — | `first` · `retry_after_failure` · `repeat_after_success` · `variant` (§9), computed at write from the student's prior evidence on the same `item_key` / `template_key` | ✓ |
| **`evaluated_by`** | — | `server` · `client` · `client_verified` (§35): who decided the outcome | ✓ |
| `misconception_id`, `source_id`, `answer` | ✓ | unchanged; `answer` stays for review, not for scoring | ✓ |
| `submitted_at` | ✓ | unchanged | ✓ |

Pivot `learning_evidence_learning_point(role)` unchanged.

### 5.2 What is deliberately NOT stored on evidence

- The confidence delta or the engine version: they belong to the engine, so a
  replay under a new engine changes them. Storing them would freeze V1 into
  the log.
- Time spent: not collected today; would need a client clock. Open (§41).

### 5.3 Write path (one transaction)

```text
recordEvidence(user, lessonCode, payload)
  1. idempotency: attempt_id exists → return stored, duplicate=true    (unchanged)
  2. resolve the ITEM from the registry (assessment_items, §6) → LPs+roles,
     difficulty, template_key, answer key
  3. evaluate outcome server-side when the item type allows (§35);
     else validate the client outcome against the taxonomy
  4. classify: attempt_number, demonstration_kind
     (1 indexed lookup: latest prior evidence for (user_id, item_key);
      1 for (user_id, template_key) when template_key ≠ NULL)
  5. INSERT learning_evidence + pivot rows
  6. for each LP: MasteryEngine::apply(state, event) → UPDATE state row
```

Steps 4–6 are O(1) indexed operations per event. Nothing reads "all evidence".

---

## 6. Question → LP Contract

One shape, everywhere, at the **question** level:

```json
"learningPoints": [
  { "code": "4am_qasim-mushtarak-akbar_P3", "role": "primary" },
  { "code": "4am_qasim-mushtarak-akbar_P2", "role": "secondary" }
]
```

- exactly one `primary`, 0–3 `secondary` (already enforced by
  `validate-exercises.mjs:267-278` for practice; extended to final tests);
- codes must belong to the item's lesson (already enforced at build and at
  write, `ProgressEngine::resolveLesson`);
- a question with no `learningPoints` produces **no evidence** and is refused
  by the validator wherever evidence is expected.

### 6.1 Sources and how they adopt it

| Source | Today | V2 |
|---|---|---|
| Practice JSON (`content/practice/**`) | already this shape | unchanged; add optional `templateId`, `difficulty`, `cognitiveDemand` (§20) |
| Final-test JSX (`assessment.learningPointIds: [...]`) | flat list, all primary | validator accepts **both** `learningPointIds` (→ all primary) and `learningPoints` (with roles) during Phase 3–5; new lessons use `learningPoints`; add `assessment.difficulty` (1..5, default 3) |
| Textbook exercises (`content/exercises.js`, `learningPointId`) | documentation only | contract adds `evidence: 'none'` (default). §30: they stay instructional; promotion to evidence means moving the item into the practice bank, not wiring `TextbookExercise` to `/evidence` |
| Generated exercises | — | must emit the practice JSON shape (§20) — no special path |

### 6.2 The registry: `assessment_items` (new table, Phase 3)

The server needs, per item and without opening content files at request time:
LPs + roles, difficulty, template, answer key. `ContentRegistryImporter`
already indexes modules and exercises from a Node export; it gains items.

```text
assessment_items
  id
  lesson_id            FK lessons
  item_key             UNIQUE  ('final_test:…:E1' | 'practice:…:ex-…:q2')
  source_kind          'final_test' | 'practice'
  exercise_code        nullable (practice), 'final' for final test
  question_id          'E1' | 'q2'
  template_key         nullable
  difficulty           1..5
  answer_type          'choice' | 'multiChoice' | 'rational' | … (7 practice types + 'choice' for MCQ final test)
  learning_points      JSON [{code, role}]        (validated against learning_points at import)
  answer_key           JSON, server-only          (correct choice id/index, expectedAnswer,
                                                   evaluationPolicy, misconceptionSignatures)
  content_version      hash of the source question (detects drift; a changed
                                                   key creates a new content_version, never rewrites history)
  publication_status   published | draft | retired    (mirrors practice_exercises)
  retired_at
```

Indexes: `UNIQUE(item_key)`, `(lesson_id, source_kind)`, `(template_key)`.

Content stays where it is (JSX, JSON). The registry is an index plus the answer
key, exactly as `practice_exercises` is an index of the JSON files. The
importer reads final-test questions with the same `@babel/parser` pass
`validate-lessons.mjs` already performs (static literals only — the contract
already forbids computed metadata).

---

## 7. Practice Evidence Model

Source: the practice engine (`PracticeAnswerController::store`).

- **Client submits** `{attemptUuid, answer}` (+ `normalizedAnswer`,
  `misconceptionId` as hints for the UI only). It stops submitting `outcome`
  as authoritative (§35 transition).
- **Server** looks up the `QuestionAttempt` (ownership), the item in
  `assessment_items`, evaluates the answer with the PHP evaluator, writes
  `question_attempts.outcome` **and** the evidence row from the same result.
  `question_attempts` remains the session-level record; `learning_evidence` the
  mastery log; they share `attempt_uuid` (unchanged).
- **Difficulty** = the item's `difficulty` (default: the exercise `level`).
- **Hints** = `question_attempts.hints_used`, already server-owned
  (`HintService`).
- **Weight** — practice keeps a source factor `< 1` (V1: 0.9). Reason kept from
  V1: unlimited attempts, hints available, no test conditions.
- **In-session retry** (same `attemptUuid`) stays a duplicate → no new
  evidence (unchanged behaviour, now documented). **Re-opening** the question
  later creates a new attempt and a new evidence row classified by
  `demonstration_kind` (§9), which is what stops farming.
- Practice **can** establish `mastered` on its own **if** the distinct-item
  minimum is met (§14). Whether an assessment success is also required is an
  open decision (§41-D2) with a configuration switch either way.

## 8. Assessment Evidence Model

Source: the lesson final test (`BossFinal`) — and any future assessment module
in an `evaluation`-stage module.

- **Client submits**, per question, `{questionCode, attemptId, answer:{picked}}`
  to `POST /lessons/{code}/evidence` (v2 payload). No `isCorrect`, no LP codes,
  no `assessmentType`. Unanswered questions are submitted with
  `answer: {picked: null}` → `abandoned` (inert), **not** `incorrect` (V1
  counts a timeout as wrong; see §41-D6).
- **Server** resolves the item `final_test:{lesson}:final:{E}` from the
  registry; outcome from `answer_key` (`picked === correct` → `correct`, else
  `incorrect`); LPs and difficulty from the item.
- **Weight**: source factor 1.0 (unchanged) and the item's `difficulty`
  (new — today always 2).
- **Retake**: `DELETE /final-test-attempt` still clears only the snapshot.
  The retake's evidence is classified `retry_after_failure` /
  `repeat_after_success` per item (§9), so retaking to farm does not work,
  while recovering a failed item still counts.
- **Assessment is stronger, not different.** Same state row; the engine marks
  `assessment_success_count` and `max_difficulty_success`, which the status
  rule can require (§14, §41-D2). `completion_mode: 'mastery'` starts being
  sent by the client when the student takes the final test before completing
  the path (BossFinal knows `completedModules`), which finally gives the
  column its documented meaning.

## 9. Repetition / Retry Model

Identity is two-level: the exact item (`item_key`) and its family
(`template_key`, falling back to `item_key` when content declares none).

`demonstration_kind` is computed at write time from the student's prior
evidence (non-inert outcomes only):

| Prior evidence for this student | Kind | Positive weight | Negative weight |
|---|---|---|---|
| none on this `item_key`, none on this `template_key` | `first` | 1.0 | 1.0 |
| none on this `item_key`, a prior on the same `template_key` | `variant` | `w_variant` (default 0.7) | 1.0 |
| prior on this `item_key`, latest was negative | `retry_after_failure` | `w_retry` (default 0.6) | 1.0 |
| prior on this `item_key`, at least one success | `repeat_after_success` | `w_repeat` (default 0.1) | 1.0 |

Reading the table:

- **Failures always count in full.** A student who fails an item they had
  solved before has shown something real. This is also the anti-gaming
  asymmetry: repeating cannot help much, but can hurt.
- **Recovering an item you failed** is real learning, weighted below a fresh
  demonstration because the question is now familiar.
- **Repeating a solved item** is practice: recorded, shown in the notebook and
  the timeline, refreshes `last_success_at`, but barely moves confidence.
- **A variant** (new numbers, same template) is a partial demonstration of
  generalisation. It is the intended path for generated banks (§32).

What the state row counts (all incremented in the same write):

```text
distinct_items_success      first success on a new item_key
distinct_items_attempted    first non-inert attempt on a new item_key
distinct_templates_success  first success on a new template_key
assessment_success_count    successes with source final_test
max_difficulty_success      max(difficulty) over successes
```

"First on a new key" is one indexed EXISTS query on `(user_id, item_key)` /
`(user_id, template_key)` — no scan.

`Q1 correct, Q1 correct, Q1 correct` therefore yields one `first` (+full) and
two `repeat_after_success` (+0.1 each) with `distinct_items_success = 1`;
`Q1..Q4 correct` yields four `first` and `distinct_items_success = 4`. The
second sequence can reach `mastered`; the first cannot (§14).

## 10. Difficulty Model

- **One integer, 1..5, per item, resolved server-side.** For practice it
  defaults to the exercise `level` and may be overridden per question by
  `difficulty` in the JSON (a level-3 exercise can hold a level-2 warm-up
  question). For final tests it is `assessment.difficulty` (default 3).
- **It scales the evidential step, not a score.** V2 keeps V1's shape
  (`0.3 + 0.7·dw`) with `dw = difficulty/5`: a level-5 success moves more than
  a level-1 success; a level-1 failure moves more than a level-5 failure. Ratio
  between extremes stays ≈2, deliberately modest: difficulty is a measurement
  weight, not a bonus.
- **`cognitiveDemand`** (optional enum `recall | apply | transfer | reason`) is
  **content metadata only** in V2: stored on the item, surfaced in the
  explanation ("succeeded on a transfer question"), not used by the arithmetic.
  It becomes usable later without touching evidence.
- **Levels stay configurable** (`config/mastery.php: levels => 5`); nothing in
  the engine enumerates them.

## 11. Hint Model

Kept from V1 and now fully server-owned:

- hints are revealed one at a time by `HintService` and written to
  `hint_events` + `question_attempts.hints_used`; the client cannot claim
  fewer hints than it received;
- a success after hints is scaled by `hint_decay[n]` (V1: 0.7 / 0.5 / 0.4),
  never below `hint_floor` (default 0.4);
- a failure is never made worse by hints;
- `explain()` reports "N independent successes, M with hints" so a teacher
  sees assisted practice for what it is.

Final-test questions have no hints (no change).

## 12. Partial-Correctness Model

Canonical taxonomy, one PHP enum `App\Domain\Progress\Outcome` mirrored by
`packages/core/practice/OUTCOMES` (lockstep test):

| Outcome | Mastery evidence | Counted as | In success rate |
|---|---|---|---|
| `correct` | positive, 1.0 | success | numerator + denominator |
| `equivalent_correct` | positive, 1.0 | success | numerator + denominator |
| `partially_correct` | **positive, `w_partial`** (default 0.4) | partial | denominator only |
| `incorrect` | negative, 1.0 | failure | denominator only |
| `syntax_error` | inert | attempt (engagement) | excluded |
| `abandoned` | inert | attempt (engagement) | excluded |

Decisions:

- **`partially_correct` is weak positive evidence, not a half failure.** The
  cases that produce it today are a strict subset of a set answer and a
  value-equal but non-reduced fraction (`EXERCISE_CONTRACT.md` § Phase 8) —
  both show the student understands the object. It does **not** count in
  `distinct_items_success` (mastery needs full successes) and does not update
  `max_difficulty_success`.
- **One `successRate` formula** everywhere:
  `successes / (successes + partials + failures)`, with `null` when the
  denominator is 0. A shared query object `App\Domain\Progress\Support\OutcomeStats`
  replaces the four inline `CASE WHEN outcome = 'correct'` expressions
  (`StudentDossier.php:51`, `ClassroomProgressService.php:192`,
  `DashboardService.php:146`, `AnalyticsService.php:151`) and the
  `whereIn(['correct','equivalent_correct'])` in `PracticeSessionController.php:178`.
- Inert outcomes are counted separately (`inertAttempts`) so «abandoned 12
  questions» stays visible without polluting accuracy.

## 13. Evidence Diversity Model

Minimal and robust: diversity is the set of counters in §9, plus difficulty.
No composite "diversity score".

| Dimension | Captured by | Used for |
|---|---|---|
| distinct question | `distinct_items_success` | mastery threshold |
| distinct exercise family | `distinct_templates_success` | explanation; optional threshold (config, off by default) |
| difficulty | `max_difficulty_success`, per-event weight | threshold (optional), explanation |
| level | `level` on evidence | explanation, selector |
| assessment vs practice | `assessment_success_count` | threshold (§41-D2), explanation |
| context / representation | `cognitiveDemand`, tags | explanation only in V2 |

Deferred on purpose: contextual diversity as a numeric input. It needs content
metadata that does not exist yet; the counters above already separate "one
easy question ten times" from "ten questions".

## 14. Mastery Calculation Model

`App\Domain\Progress\Engine\MasteryEngineV2` — pure functions over
`(state, event, config)`; no Eloquent. `EngineV1` wraps today's
`MasteryModel` unchanged.

```text
apply(state, event):
    if event.outcome is inert: return state                         # unchanged from V1

    sign      = event.outcome in {correct, equivalent_correct, partially_correct} ? +1 : −1
    dw        = clamp(event.difficulty, 1, L) / L                    # L = config levels (5)
    base      = rate · (0.3 + 0.7 · (sign > 0 ? dw : 1 − dw))        # rate = 0.22 (V1)
    weight    = 1
              · (event.outcome == partially_correct ? w_partial : 1)
              · (event.role == secondary            ? w_secondary : 1)
              · (event.source == practice            ? w_practice : 1)
              · (sign > 0 && event.hints > 0         ? hint_decay[min(hints, 3)] : 1)
              · (sign > 0 ? demonstration_weight[event.demonstration_kind] : 1)
    confidence' = round(clamp(confidence + sign · base · weight, 0, 1), 3)

    counters' = increment per §9 (only when sign > 0 and kind == first/variant
                for the distinct counters; failures update last_failure_at)
    status'   = statusFor(confidence', counters')
```

```text
statusFor(confidence, counters):
    if confidence < gap_threshold (0.40):                      return gap
    if confidence < mastered_threshold (0.70):                 return reinforce
    # confidence is high — is the evidence sufficient?
    need = min(min_distinct_items (3), available_items_for_lp)   # §19.3 — bounded by the bank
    if counters.distinct_items_success < need:                 return reinforce   (reason: insufficient_evidence)
    if require_assessment && counters.assessment_success_count == 0
       && counters.max_difficulty_success < assessment_equivalent_difficulty (4):
                                                               return reinforce   (reason: needs_assessment)
    return mastered
```

Notes:

- The status carries a **`status_reason`** (`threshold`, `insufficient_evidence`,
  `needs_assessment`) so the UI can say «ثبّت بمزيد من التمارين المختلفة»
  rather than a bare `reinforce`.
- `available_items_for_lp` is read from the registry once per write (count of
  published items whose primary LP is this LP); it is what lets the same rule
  work with a 5-item bank and a 500-item bank (§40).
- All numbers live in `config/mastery.php` under a versioned key; the engine
  version pins which key it reads.

Worked comparison (defaults, final-test difficulty 3, practice level 1):

| Sequence | V1 | V2 |
|---|---|---|
| FT E1 correct ×1 | 0.643 reinforce | 0.643 reinforce |
| FT E1 correct, retake E1 correct, retake E1 correct | 0.929 **mastered** | 0.643 → 0.657 → 0.671 reinforce (`repeat_after_success` ×0.1; 1 distinct item) |
| practice L1 q1 ×3 (re-opened) | 0.782 **mastered** | 0.594 → 0.603 → 0.612 reinforce |
| FT E1, E2 correct + practice q1, q2 (L2) correct, all distinct | 1.0 mastered | ≈0.92, 4 distinct items, `mastered` |
| 4 distinct practice L1 successes only, `require_assessment=true` | mastered | ≈0.85 reinforce (`needs_assessment`) until one FT or level-4 success |

## 15. Mastery State Model

`student_learning_point_progress` — still the one canonical row, extended:

| Column | Today | V2 |
|---|---|---|
| `status` | unassessed/gap/reinforce/mastered | unchanged vocabulary |
| **`status_reason`** | — | `threshold` · `insufficient_evidence` · `needs_assessment` |
| `confidence` | ✓ | unchanged |
| `attempts`, `correct_count` | ✓ | unchanged (non-inert events; successes incl. equivalent) |
| **`partial_count`**, **`failure_count`** | — | for `successRate` without touching evidence |
| **`distinct_items_success`**, **`distinct_items_attempted`**, **`distinct_templates_success`** | — | §9 |
| **`assessment_success_count`**, **`max_difficulty_success`** | — | §9 |
| `last_evidence_at` | ✓ | unchanged |
| **`last_success_at`**, **`last_failure_at`** | — | freshness (§17) |
| **`engine_version`** | — | integer; rows written by V1 backfilled to `1` |
| **`recomputed_at`** | — | set by replay |

UNIQUE(user, lp) unchanged. New index `(learning_point_id, status)` for class ×
LP aggregation. Row count is bounded by students × LPs (not by exercises).

## 16. Confidence / Evidence Strength

Decision: **keep one confidence; do not add a second score.** Reliability is
expressed by the counters (§15), which are exact, explainable and needed
anyway for the status rule. A numeric "strength" would be a function of those
counters and would have to be explained back into them.

Trade-off: two students can share `confidence = 0.75` with 1 vs 6 distinct
successes; V2 makes the difference visible through `status_reason` and the
explanation, not through a second gauge. If a UI later needs one bar, it can
render `min(distinct_items_success / need, 1)` — derived, never stored.

## 17. Recency / Freshness

- **Confidence does not decay.** Decay would make the same evidence mean
  different things on different days and would break replay determinism.
- **Freshness is derived at read time** from `last_success_at` /
  `last_failure_at` / `last_evidence_at`:

```text
fresh    last evidence ≤ fresh_days  (default 21)
aging    ≤ stale_days                (default 60)
stale    otherwise, or never
```

- Presented as a secondary marker (an outline, a «منذ 3 أشهر»), never as a
  status change. Recommendations use `mastered + stale` → «تمرين تذكيري»
  (§30). A recent failure on a `mastered` LP is a real event, so it already
  lowers confidence through the engine; nothing else is needed.

## 18. Explainable Mastery

`MasteryEngineV2::explain(state, recentEvidence[])` returns a structure built
from the state counters plus the last N evidence rows (N = 20, one indexed
query on `(user_id, learning_point_id)` through the pivot):

```json
{
  "learningPoint": { "code": "4am_…_P3", "title": "…" },
  "status": "reinforce", "statusReason": "insufficient_evidence",
  "confidence": 0.74,
  "evidence": {
    "distinctItemsSuccess": 2, "needed": 3,
    "assessmentSuccesses": 1, "practiceSuccesses": 3, "partials": 1, "failures": 1,
    "withHints": 2, "maxDifficultySuccess": 3,
    "lastSuccessAt": "…", "lastFailureAt": "…", "freshness": "fresh"
  },
  "recent": [ { "at": "…", "source": "practice", "level": 2, "outcome": "correct",
                "kind": "first", "hints": 1, "itemTitle": "نشاط 4 — 90 زهرة…" } ]
}
```

Exposed to the student for their own LPs and to the teacher for their
students (§23). Nothing in it is stored twice; it is assembled per request.

## 19. Exercise Bank Architecture

### 19.1 Content

Unchanged location and shape: `content/practice/{grade}/{lesson}/level-{N}/{id}.json`,
validated by `validate-exercises.mjs`, indexed by `index.generated.json`,
registered in `practice_exercises` (exercise) and — new — `assessment_items`
(question). `policy.json` keeps per-lesson minimums. Nothing enumerates files
at request time except `ExerciseRepository::find` for one exercise (cached).

### 19.2 Selection — a separate service

`App\Domain\Practice\ExerciseSelector` (new) chooses the next exercise in a
session. It **reads** the state table and the registry; it never writes
mastery and the engine never calls it.

```text
candidates = assessment_items ⋈ practice_exercises
             WHERE lesson = L AND level = N AND published
ranking (all indexed columns):
  1. primary LP with the weakest state for this student (gap > reinforce >
     unassessed > mastered-stale > mastered-fresh)
  2. item never attempted by this student           (NOT EXISTS on (user_id, item_key))
  3. template never succeeded by this student       (NOT EXISTS on (user_id, template_key))
  4. misconception recently recorded → item whose signatures target it
  5. stable random tie-break seeded by session_id   (reproducible)
```

Cost: O(items in one level of one lesson) per selection — 40 or 100 rows,
from an index, once per exercise start. The current fixed order
(`allIdsFor` sequence) remains the fallback when the selector is disabled.

### 19.3 Sampling, not exhaustion

The engine needs `need = min(min_distinct_items, available_items_for_lp)`
distinct successes for `mastered`. With 200 exercises a student may reach
`mastered` on P3 after 3–5 well-chosen items and keep practising on the rest
for freshness and confidence — 195 exercises are never a requirement. With 5
items the same rule asks for what exists. The selector's job is to make those
first items *different* (rule 2–3 above).

## 20. Generated Exercise Contract

Every generated exercise is a normal practice JSON file; the mastery engine
needs no code for it. Schema additions (`exercise.schema.json`):

```json
{
  "id": "ex-4am-qasim-mushtarak-akbar-l3-041",
  "lessonCode": "qasim-mushtarak-akbar", "level": 3,
  "templateId": "tpl-4am-pgcd-bouquets-v1",          // NEW optional; shared by variants
  "variantOf": "ex-4am-qasim-mushtarak-akbar-l3-007", // NEW optional; provenance only
  "generator": { "tool": "…", "version": "…", "seed": "…" }, // NEW optional; provenance only
  "metadata": { "title": "…", "estimatedMinutes": 3, "tags": ["…"], "source": {…} },
  "statement": { "content": "…" },
  "questions": [{
    "id": "q1",
    "statement": "…",
    "learningPoints": [{ "code": "…_P3", "role": "primary" }],
    "difficulty": 3,                                  // NEW optional 1..5, default = level
    "cognitiveDemand": "apply",                       // NEW optional enum
    "answerType": "rational", "answerFormat": "…", "expectedAnswer": "18",
    "evaluationPolicy": {…}, "misconceptionSignatures": [...],
    "hints": [...], "feedback": {...}
  }]
}
```

Validator additions: `templateId` pattern; variants of one template must share
primary LP and `answerType`; `difficulty` within 1..levels; unchanged
invariants (exactly one primary, LP ∈ lesson, no answer leak in hints).
Generation must run `npm run validate:exercises` and the registry import; a
generated exercise that passes is mastery-ready by construction.

## 21. Data Model Changes

| Table | Change | Notes |
|---|---|---|
| `learning_evidence` | **modify**: add `item_key` VARCHAR(191) NOT NULL (backfilled), `template_key` nullable, `difficulty` TINYINT nullable→backfilled, `attempt_number` SMALLINT, `demonstration_kind` VARCHAR(24), `evaluated_by` VARCHAR(16); `outcome` NOT NULL after backfill. Indexes: `(user_id, item_key)`, `(user_id, template_key)`, `(user_id, submitted_at)`. | append-only in code |
| `learning_evidence_learning_point` | unchanged; add index `(learning_point_id, learning_evidence_id)` for per-LP replay/explanation | |
| `student_learning_point_progress` | **modify**: columns of §15; index `(learning_point_id, status)` | canonical, mutable |
| `assessment_items` | **new** (§6.2) | registry, rebuilt by import; never deleted (retired) |
| `practice_exercises` | unchanged | items reference it by `exercise_code` |
| `question_attempts` | **modify**: `evaluated_by`; keep `outcome` (now server-written) | |
| `practice_sessions`, `exercise_attempts` | unchanged | |
| `lesson_final_test_attempts` | unchanged (snapshot for the results screen) | not a mastery source |
| `mastery_replays` | **new**: `id, engine_version, scope (all|user|lp), scope_id, status, rows_total, rows_done, diff_summary JSON, started_at, finished_at, requested_by` | audit trail of replays |
| `hint_events` | unchanged | |

Lifecycle: evidence and items are only ever inserted or `retired_at`-marked;
state rows are rewritten by the engine or by replay; `mastery_replays` is an
operational log.

## 22. Backend Architecture

```text
app/Domain/Progress/
  Engine/
    MasteryEngine.php            interface: apply(), statusFor(), explain(), version()
    EngineV1.php                 wraps Support\MasteryModel (unchanged arithmetic)
    EngineV2.php                 §14
    EngineRegistry.php           version → engine; config('mastery.engine_version')
  Outcome.php                    enum + semantics table (§12)
  EvidenceClassifier.php         item_key/template_key/attempt_number/demonstration_kind (§9)
  ProgressEngine.php             orchestrates (unchanged role); calls Classifier + Engine
  MasteryRecalculator.php        → Replay/ReplayService.php (chunked, queued) + ReplayReport
  Support/OutcomeStats.php       the one successRate query builder
  Explain/MasteryExplainer.php   assembles §18 from state + recent evidence
app/Domain/Content/
  AssessmentItemRepository.php   registry reads (memoised per request)
app/Domain/Practice/
  Support/AnswerEvaluator.php    PHP port of packages/core/practice/answerEvaluator.js
  ExerciseSelector.php           §19.2
app/Domain/Classroom/
  ClassroomLearningPointService.php   §26 aggregations
app/Console/Commands/
  MasteryReplay.php              smarter:mastery:replay
  ImportContentRegistry.php      extended: items
config/mastery.php               versioned parameter sets
```

Rules: React never computes mastery (unchanged); no service other than
`ProgressEngine` writes the state table (unchanged, extended to replay);
`DemoStudentSimulator` (`database/seeders/Demo/DemoStudentSimulator.php:403-440`)
stops re-implementing the formula and calls `ProgressEngine`.

## 23. API Changes

| Endpoint | Purpose | Input | Output | Auth | Source of truth | Perf |
|---|---|---|---|---|---|---|
| `POST /lessons/{code}/evidence` **v2 payload** | final-test evidence | `{questionCode, attemptId, answer:{picked}, completionMode?}`; legacy `{isCorrect, learningPointCodes}` accepted in Phase 4–5 with `evaluated_by=client_verified` and a disagreement log | `{duplicate, evidenceId, outcome}` | learner | `assessment_items` | O(1) |
| `POST /practice/sessions/{id}/answers` | practice evidence | `{attemptUuid, answer}` (client `outcome` ignored after Phase 4) | `{outcome, misconceptionId, feedbackKey, hintsUsed}` | learner | PHP evaluator + items | O(1) |
| `GET /students/me/learning-profile` | student LP state | **new filters** `?lesson=`, `?unit=`, `?grade=` | adds `statusReason`, counters, `freshness`, `engineVersion` | student | state table | O(#LP in scope) |
| `GET /students/me/learning-points/{code}/explanation` **new** | §18 | — | explanation | student | state + last 20 evidence | 2 indexed queries |
| `GET /lessons/{code}/practice/overview` | hub | unchanged | adds **all** LPs of the lesson (unassessed included), `statusReason`, `freshness` | learner | state ⋈ learning_points | O(#LP) |
| `GET /practice/sessions/{id}/next` **new** | selector | `?level=` | `{exerciseId, reason}` | learner | items + state | O(items in level) |
| `GET /teacher/classrooms/{id}/learning-points` **new** | class × LP | `?lesson=` (required), pagination | per LP: `{code,title, counts:{mastered,reinforce,gap,unassessed}, staleMastered}` | teacher, `progress.class` | state table GROUP BY | 1 query |
| `GET /teacher/classrooms/{id}/learning-points/{code}` **new** | LP × students | pagination | per student: `{status, statusReason, confidence, distinctItemsSuccess, lastEvidenceAt, freshness}` | teacher, `progress.student` | state table | 1 query |
| `GET /teacher/classrooms/{id}/students/{sid}/progress` | dossier | unchanged | `mastery` ordered weakest-first, **not capped**, with counters; `successRate` via `OutcomeStats` | teacher | state + attempts | O(#LP) |
| `GET /teacher/classrooms/{id}/students/{sid}/learning-points/{code}/explanation` **new** | §18 for teacher | — | same as student | teacher + membership | same | same |
| `GET /admin/analytics/learning-points` | admin | unchanged | adds `statusReason` distribution | admin | state | unchanged |
| `POST /admin/mastery/replays` **new** | trigger replay | `{engineVersion, scope, dryRun}` | replay id | admin | evidence | async |
| `GET /admin/mastery/replays/{id}` **new** | replay status/diff | — | `mastery_replays` row | admin | — | O(1) |

Removed/deprecated: client-supplied `isCorrect`, `learningPointCodes`,
`assessmentType` on `/evidence` (Phase 5 removes acceptance); client `outcome`
on practice answers (Phase 4 ignores, Phase 5 rejects unknown values).

## 24. Student UX Changes

| Area | Current | Target | Data | Terminology |
|---|---|---|---|---|
| Lesson index «نقاط التعلّم» | coloured dot; `status` of the fetch ignored (`LessonIndex.jsx:112-120`) | dot + label + `statusReason` tooltip; loading/error/anonymous states distinct; «لم تُقيَّم بعد» only when the profile is loaded | learning-profile `?lesson=` | one mastery label set (§ below) |
| Lesson index «🏆 تمّ إتقان الدرس!», module status `'mastered'` | completion in mastery words | «أنهيت مسار الدرس ✓»; module status `done`; `getModuleMastery` renamed `getModuleCompletion` in `packages/core/lessonAccess.js` | localStorage (unchanged) | completion words only |
| Final test results «ملف الإتقان» | per-attempt misses per config `skill`, 🟢🟡🔴 | «نتيجة هذا التحدي» per LP for **this attempt** (neutral icons), plus a second block «حالتك على نقاط التعلّم» from the profile (mastery colours) | attempt + learning-profile | attempt vs mastery visibly separate |
| «تقدّمي» LP card | status + bar = confidence | + `statusReason` sentence, freshness marker, «لماذا؟» opening the explanation drawer | profile + explanation | — |
| Practice hub «ما أظهرته» | only LPs with a row | all LPs of the lesson; `statusReason`; «اختر لي التمرين التالي» (selector) | overview v2 | — |
| Practice session | client outcome authoritative | client evaluates for instant feedback; server response is the outcome shown; a disagreement shows the server's verdict | answers v2 | — |
| Student home hero | unchanged | freshness-aware («تذكير» for stale mastered) | profile | — |
| Knowledge Map | completion-driven | §27 | — | — |
| Unit page | dots + `{mastered}/{n} ✓` | dots + `{mastered}/{n}` + `statusReason` tooltip | profile `?unit=` | — |

**One label set.** `student:mastery.*` becomes the only vocabulary
(`progression.chips.*` and `unit.mastery.*` become aliases then are removed);
teacher and admin namespaces reference the same four strings. Completion never
uses إتقان / متحكَّم.

## 25. Teacher UX Changes

| Area | Current | Target | Data |
|---|---|---|---|
| Class progress tab | completion % + practice success rate, no LP | + «نقاط التعلّم» tab: per lesson, per LP bar of 4 counts, sortable by gap count, stale-mastered count | `/classrooms/{id}/learning-points` |
| LP drill-down (new) | — | students by status, weakest first; click → explanation drawer | `/learning-points/{code}` |
| Student dossier «نقاط التعلّم» | first 20, unordered, `correct/attempts` text | full list grouped by lesson, weakest first, mastery colours, confidence bar, counters, freshness, explanation | dossier v2 |
| Success rate | `outcome='correct'` ÷ all attempts | `OutcomeStats` — same number as the student's practice summary | shared |
| Members tab | unchanged | + «نقاط تحتاج انتباهًا» count per student (gap) | rows v2 (one extra GROUP BY) |

No teacher-side write. Feature keys `progress.class` / `progress.student` gate
the two new endpoints; `analytics.advanced` (declared, unused) gates the LP
drill-down export later.

## 26. Class × LP Analytics

```sql
-- per LP of one lesson, for the active members of one class
SELECT lp.id, lp.code, lp.title,
       SUM(s.status='mastered')  AS mastered,
       SUM(s.status='reinforce') AS reinforce,
       SUM(s.status='gap')       AS gap,
       COUNT(m.student_id) - COUNT(s.id) AS unassessed,
       SUM(s.status='mastered' AND s.last_success_at < :staleCutoff) AS staleMastered
FROM learning_points lp
JOIN classroom_memberships m ON m.classroom_id = :class AND m.status = 'active'
LEFT JOIN student_learning_point_progress s
       ON s.learning_point_id = lp.id AND s.user_id = m.student_id
WHERE lp.lesson_id = :lesson AND lp.retired_at IS NULL
GROUP BY lp.id
```

Rows = LPs of the lesson (≤ 8); joins bounded by members × LPs (30 × 8).
Scoped to effective lessons (`ClassroomProgressService::effectiveLessonIds`,
unchanged). The drill-down is the same join filtered to one LP, ordered by
`FIELD(status,'gap','reinforce','unassessed','mastered'), confidence`.

## 27. Knowledge Map

The map stays what `KNOWLEDGE_MAP.md` defines: **curriculum structure the
student has unlocked by completing modules**, with items (not LPs) as nodes.
V2 adds an **overlay**, not a second source:

- each module's `teaches_learning_point_codes` (already in `lesson_modules`)
  maps its items to LPs; the map colours the module group by the LP states
  from the profile (`?lesson=`) — mastery colours, completion visibility;
- a `gap` LP whose module is completed shows «راجع» → the module; a locked
  module whose LPs are `mastered` (evidence from the final test taken first)
  shows «مُتقن مسبقًا»;
- prerequisites (`learning_point_prerequisites`) draw a dotted edge to the
  prerequisite lesson when the student's state there is `gap`.

Visibility remains completion-based. No mastery is computed or stored by the
map.

## 28. Diagnostic Integration

Unchanged storage and separation (`diagnostic_*` tables, separate
`MasteryModel`). V2 uses `initialKnowledge` **only** for recommendations and
the explanation: «التشخيص أيضًا نظر في هذه المهارة» when
`learning_points.diagnostic_skill_id` is set. A diagnostic success never
creates a state row and never sets `mastered`. The two `MasteryModel` classes
stay parallel; the lockstep test on thresholds is kept.

## 29. Mastery Gates

Decision: **gates are soft — they recommend, never block.** This follows the
repository's hard non-blocking invariant (`EXERCISE_CONTRACT.md`,
`AI_LESSON_CONTRACT.md`): a demonstrated gap is pedagogical information, not a
lock.

- `requiresLearningPointIds` on a module becomes a **recommendation trigger**:
  when any required LP is `gap`, the module card shows «نوصي بمراجعة … أولًا»
  with a link to the teaching module (`recommendModulesForLearningPoints`,
  finally called). The module stays openable.
- `isMasteryGateSatisfied` in `packages/core/lessonAccess.js` is kept as a
  pure predicate and gets its `masteryStatusById` argument wired; its result
  drives the hint, not `locked`.
- No teacher override is needed because nothing is blocked. If a future
  product decision wants hard gates, the predicate and the data are in place
  (§41-D8).

## 30. Recommendations

`App\Domain\Progress\Recommendation\RecommendationService` (Phase 8) consumes
state rows only:

| State | Recommendation | Target |
|---|---|---|
| `gap` | reteach: module(s) teaching the LP; if a prerequisite LP is also `gap`, that lesson first | `lesson_modules.teaches_learning_point_codes`, `learning_point_prerequisites` |
| `reinforce` / `insufficient_evidence` | targeted practice: selector with `preferLp=` | `ExerciseSelector` |
| `reinforce` / `needs_assessment` | the final test («جاهز للتحدي») | BossFinal |
| `mastered` + stale | short refresh: 1–2 unseen items | selector |
| `mastered` + fresh | progression: next lesson / higher level | catalogue |

`pickWorkNow.js` and `pickHomeNextStep.js` (client) keep their ordering but
read `statusReason` and `freshness` from the profile instead of inferring.

## 31. Migration Strategy

Data today: a few hundred evidence rows, ~230 with `role` (per code comments),
demo seed data, 9 live lessons. Small enough for a synchronous full replay, but
the procedure is written for the general case.

1. **Additive schema (Phase 1).** New columns nullable; new tables. No
   behaviour change. Rollback: drop columns.
2. **Backfill (Phase 1, artisan `smarter:evidence:backfill --dry-run`).**
   - `item_key`: practice rows `question_code = 'ex:q'` →
     `practice:{lesson.code}:{ex}:{q}`; final-test rows →
     `final_test:{lesson.code}:final:{question_code}`.
   - `outcome`: NULL → `correct`/`incorrect` from `is_correct`.
   - `difficulty`: from `level` (1→1, 2→2, 3→3, 4→4, 5→5 — note V2 uses the
     level directly, not V1's 1..4 mapping) ; final test → 3.
   - `attempt_number`, `demonstration_kind`: computed in `submitted_at, id`
     order per (user, item_key) — the same walk the replay performs.
   - `evaluated_by = 'client'` for all existing rows (honest: that is what
     they were).
   - `student_learning_point_progress.engine_version = 1`.
   Idempotent; reports counts; refuses to run on rows already filled unless
   `--force`.
3. **Registry import (Phase 3).** `assessment_items` built from content;
   import fails if an existing evidence `item_key` has no item (it would mean
   content was renamed — resolved by a `retired_at` item with the old key, as
   `learning_points` already do).
4. **Shadow evaluation (Phase 4).** For a release, the server evaluates
   practice answers **and** compares with the client outcome; disagreements
   are logged (`evaluated_by = client_verified`). Target: 0 disagreements on
   the fixture suite before switching.
5. **Dry-run replay (Phase 5).** `smarter:mastery:replay --engine=2 --dry-run
   --report` writes a diff: per LP status distribution V1 stored vs V2
   replayed, and the list of students whose status would change with the
   reason. Reviewed by a human before the switch.
6. **Switch (Phase 5).** `config('mastery.engine_version') = 2`; full replay
   (queued, chunked by user); `engine_version = 2` on every row;
   `mastery_replays` row records the diff. New writes use V2 from that moment.
7. **Validation.** `MasteryRecalculator::matchesStored` generalised to
   `ReplayService::verify(engine)` runs in CI on the demo dataset and as a
   nightly sample in production (100 random (user, lp) pairs).
8. **Rollback.** `engine_version = 1` + replay: the evidence is untouched, V1
   is still in the code, the previous state is reproducible exactly (V1 is
   deterministic; verified by `test_legacy_defaults_reproduce_the_historical_formula`).

Nothing is deleted. `lesson_final_test_attempts` keeps overwriting — it is a
results-screen snapshot, not evidence.

## 32. Replay Strategy

- **Versioned engine**: `mastery.engine_version` in config; `EngineRegistry`
  resolves it; every state row stores which version produced it.
- **Replay unit** = one (user, lp): ordered walk of that pair's evidence
  through `EvidenceClassifier` (recomputes kinds — they depend only on prior
  rows of the same walk) and `engine.apply`. O(evidence of that pair).
- **Scopes**: `--user=`, `--lp=`, `--lesson=`, `--all`. `--all` dispatches one
  queued job per 200 users; a `mastery_replays` row tracks progress. On
  Hostinger (no `proc_open`, per deploy notes) the queue driver is `database`
  and the worker is the scheduled `queue:work --stop-when-empty`; a
  synchronous fallback `--sync` exists for small datasets.
- **Determinism**: same evidence + same version ⇒ same state; asserted by
  `ReplayDeterminismTest` (replay twice, compare).
- **Validation before switch**: dry-run diff report (§31 step 5) plus the
  worked-example fixtures of §14 as assertions.
- **Rollback**: replay with the previous version (§31 step 8).
- **Algorithm change procedure** (documented in `LEARNING_ARCHITECTURE.md`):
  add `EngineV3`, add config key, dry-run, review, switch, replay. Never edit
  a released engine's arithmetic.

## 33. Backward Compatibility

| Concern | Handling |
|---|---|
| Existing students | state rows kept, backfilled, replayed; status vocabulary unchanged so nothing breaks visually before Phase 6 |
| Existing lesson content | `learningPointIds` still accepted by the validator and the importer (→ primary); `assessment.difficulty` optional (default 3) |
| Existing practice sessions | `question_attempts` untouched; open sessions continue; server evaluation applies to new answers only |
| Existing final tests | snapshot table unchanged; BossFinal keeps working with the legacy payload until Phase 5 |
| Existing APIs | additive fields only until Phase 5; deprecated inputs accepted with logging for one release |
| Existing UI | unchanged until Phase 6; new fields ignored by old clients |
| Teacher functionality | existing endpoints unchanged; new ones additive |
| Offline evidence queue | queued legacy payloads are accepted during Phase 4–5; a 422 is no longer dropped silently — it is kept with `lastError` and surfaced as a count in the profile (§37) |

No big-bang: every phase is releasable alone.

## 34. Testing Strategy

**Unit (PHP, no DB)** — `tests/Unit/Progress/Engine/`:
- `OutcomeTest`: taxonomy table, lockstep with `packages/core/practice` via a
  shared JSON fixture `packages/core/practice/fixtures/outcomes.json`.
- `EvidenceClassifierTest`: item/template keys; the four demonstration kinds;
  attempt numbering.
- `EngineV2Test`: every worked row of §14; difficulty monotonicity; hints never
  worsen a failure; partial < full and > 0; secondary < primary; repetition
  cannot reach `mastered` alone; `need` bounded by available items;
  `require_assessment` switch; determinism.
- `EngineV1Test`: existing `MasteryModelTest` moved, unchanged (the historical
  formula is frozen).
- `AnswerEvaluatorTest` (PHP) driven by
  `packages/core/practice/fixtures/answers.json`, the same file
  `answerEvaluator.test.js` consumes — one fixture, two runtimes.
- `MasteryExplainerTest`: explanation fields equal counters.

**Integration (Feature, MySQL, one at a time — repo rule)**:
- `EvidenceFlowV2Test`: question → answer → evidence row (all new columns) →
  state row; final test and practice converge on one row (extends
  `PracticeEvidenceConvergenceTest`).
- `RepeatedAttemptsFlowTest`: Q1×3 vs Q1..Q4.
- `ReplayTest`: replay == stored (V2), dry-run diff shape, rollback to V1
  reproduces backed-up rows.
- `RegistryImportTest`: items from a fixture lesson; drift → new
  `content_version`; missing item for existing evidence → import fails.
- `ClassroomLearningPointTest`: class × LP counts, scoping to effective
  lessons, hidden lesson excluded, non-member 404, feature gate 403.
- `OutcomeStatsTest`: the same `successRate` from dossier, class row, admin
  and practice summary.

**Security** — `EvidenceTrustBoundaryTest`:
- client `isCorrect=true` with a wrong `picked` → server outcome `incorrect`;
- client LP codes ignored; codes from another lesson irrelevant (item decides);
- `assessmentType`, `difficulty`, `hintsUsed`, `weight`, `userId` in the body
  → ignored or 422;
- another student's `attemptUuid` → 422 (existing);
- teacher POST → 403 `not_a_learner` (existing `TeacherLearningAccessTest`).

**Scale** — `tests/Feature/Scale/` (tagged, not in the default suite):
- seed 1 lesson × 5 LPs × 200 exercises × 30 students × 40 answers each →
  assert `/learning-profile?lesson=` ≤ 5 rows read, class × LP one query
  (query log), selector ≤ 1 query over ≤ 200 rows, write path ≤ 6 queries.
- 500 LPs × 1 student: profile with and without `?lesson=`.

**Teacher**: `ClassroomLearningPointTest` above + `ClassroomProgressTest`
extended for `OutcomeStats`.

**Frontend**: `LearningPointMastery.test.js` label unification;
`evidenceQueue.test.js` 422 retention; BossFinal payload v2 test; e2e
(`apps/web/e2e/`) student practice → hub shows `statusReason`; teacher class
LP tab renders counts.

**Validators**: `validate-exercises.test.mjs` templates/variants;
`validate-lessons` accepts `learningPoints` with roles and `difficulty`.

## 35. Security / Trust Boundary

| Claim | V1 | V2 |
|---|---|---|
| Who the student is | token (✓) | unchanged |
| Which item was answered | client `questionCode` / `attemptUuid` | client names the item; server verifies it exists, is published, belongs to the URL's lesson and (practice) to the student's attempt |
| Correctness | client | **server** for `choice`, `multiChoice`, `rational`, `affine`, `interval`, `point`, `integerSet` (PHP evaluator) and final-test MCQ (answer key). `evaluated_by='server'` |
| LP mapping | client (final test) / content (practice) | **registry** for both |
| Assessment type / source | client (final test) | **route + item** (`/evidence` ⇒ final_test; practice route ⇒ practice) |
| Difficulty, hints, weight | partly client | **item + server records**; never in the body |
| Attempt count / kind | — | server-derived |

Where server evaluation is impossible (a future interactive answer type with
no PHP evaluator), the item declares `evaluation: 'client'`, the evidence is
stored `evaluated_by='client'`, and the engine applies `w_client_evaluated`
(default 0.5) — a visible, configurable discount rather than silent trust.
No such item type exists today.

Expected answers currently ship to the browser inside the practice JSON bundle
(`ExerciseRepository` reads the same files). Moving question delivery behind
`GET /practice/sessions/{id}/questions/{…}` without `expectedAnswer` is
proposed as Phase 9 work and listed as an open decision (§41-D5): server-side
evaluation already stops a fabricated outcome; hiding the key stops looking it
up.

## 36. Performance / Scalability

Per-request cost, independent of bank size:

| Operation | Queries | Rows touched | Notes |
|---|---|---|---|
| Record one answer | ~6 | 1 item, ≤2 EXISTS, 1 insert (+pivot), ≤4 state upserts | all on indexed keys |
| Student profile (one lesson) | 1 | ≤ #LP of lesson (≤ 8) | `?lesson=` filter |
| Student profile (whole grade) | 1 | ≤ #LP of grade (≈ 40 today; 500 later) | acceptable; page by unit when > 200 |
| Explanation | 2 | 1 state + 20 evidence | |
| Class × LP (one lesson) | 1 | members × LPs (30 × 8) | GROUP BY |
| LP × students | 1 | members | |
| Selector | 1–2 | items of one level (≤ 100) | indexed `(lesson_id, source_kind)` + `level` |
| Replay one pair | 1 + O(k) | k evidence rows of the pair | async when `--all` |

Indexes added: `learning_evidence(user_id, item_key)`,
`(user_id, template_key)`, `(user_id, submitted_at)`;
`learning_evidence_learning_point(learning_point_id, learning_evidence_id)`;
`student_learning_point_progress(learning_point_id, status)`;
`assessment_items(item_key)` UNIQUE, `(lesson_id, source_kind)`, `(template_key)`.

Caching: none new. The practice content cache (`practice:index`, 1 h) stays;
`AssessmentItemRepository` memoises per request only. Pre-aggregation: none —
the state table **is** the pre-aggregation of evidence; class × LP over
30 × 8 rows needs nothing more. Revisit only if a class view exceeds ~200 ms
at 500 LPs (then a per-(classroom, lp) counter table refreshed on write is the
next step, and it stays a derived cache, not a truth).

Scale estimates (§40 has the exercise-count scenarios):

- **1 lesson, 5 LPs, 200 exercises, 30 students**: state 150 rows; evidence
  perhaps 30 × 60 = 1 800 rows; every request above stays at the row counts in
  the table.
- **100 lessons, 500 LPs, 20 000 exercises, 1 000 students**: state ≤ 500 000
  rows (bounded by students × LPs, most never created); items 20 000 ×
  ~3 questions = 60 000 rows; evidence ~ millions over years — only the
  `(user_id, …)` indexes are ever read; replay is per pair and queued.
- **Millions of evidence events**: partitioning by year on `submitted_at` is
  the eventual step; nothing in V2 prevents it (no cross-partition unique
  other than `attempt_id`, which can move to a hash index).

## 37. Observability

Structured logs (channel `mastery`, no answers, no names):

- `evidence.rejected` — 422 reasons (unknown item, retired, cross-lesson,
  not owner) with `item_key`, `lesson`, `user_id`;
- `evidence.disagreement` — client vs server outcome during shadow mode;
- `evidence.client_evaluated` — items evaluated by the client (should be 0);
- `evidence.suspicious_repetition` — > N attempts on one item in one hour
  (metric only; no penalty beyond §9);
- `registry.drift` — item content hash changed on import;
- `replay.started/finished/failed` with counts and diff summary;
- `state.verify_mismatch` — nightly sample mismatch (should be 0).

Metrics (admin dashboard, `AnalyticsService`): evidence per day by source and
`evaluated_by`; disagreement rate; queue length of the browser evidence queue
is client-side, so the profile response carries `pendingEvidence` from the
client's own count for the student to see «3 إجابات لم تُرسل بعد».

Client: `evidenceQueue` keeps entries on 422 with `lastError` and a retry
counter; entries older than 30 days are dropped with a log; the student sees a
non-blocking notice.

## 38. Implementation Phases

Dependency-derived order (differs from the suggested list: the registry must
exist before server evaluation, and server evaluation before the engine switch
so that replayed V2 kinds rest on server-classified rows wherever possible).

### Phase 0 — Contracts and documentation (no code)
- **Objective**: fix the words before the code. Rewrite `LEARNING_ARCHITECTURE.md`
  (mastery model, evidence flow, sources, versioning, replay procedure),
  `PROGRESS_MODEL.md` (delete stale table; completion vocabulary),
  `EXERCISE_CONTRACT.md` §0 (outcome table, retry semantics),
  `AI_LESSON_CONTRACT.md` (`learningPoints` with roles, `difficulty`,
  registry rule), `TEACHER_CLASSROOM_ARCHITECTURE.md` §4 (class × LP),
  `LESSON_DEVELOPMENT_GUIDE.md` pointers; `config/mastery.php` documented.
- **Files**: docs only. **Tests**: none. **Risk**: none. **Rollback**: git.

### Phase 1 — Evidence foundation
- **Objective**: immutable, self-describing evidence; canonical outcomes.
- **DB**: §21 columns on `learning_evidence`, `question_attempts`,
  `student_learning_point_progress` (nullable); `mastery_replays`.
- **Code**: `Outcome` enum + fixture; `EvidenceClassifier`; `LearningEvidence`
  append-only guard; `ProgressEngine` writes new columns (V1 arithmetic
  unchanged); `PracticeEvidenceRecorder` maps `partially_correct` → positive
  (**behaviour change #1**, documented); `OutcomeStats` replaces the four
  inline formulas; `DemoStudentSimulator` calls `ProgressEngine`.
- **Command**: `smarter:evidence:backfill`.
- **Tests**: `OutcomeTest`, `EvidenceClassifierTest`, `OutcomeStatsTest`,
  backfill idempotency; existing suites green.
- **Dependencies**: none. **Risk**: backfill correctness → dry-run + counts.
  **Rollback**: columns unused by V1; drop them.

### Phase 2 — Versioned engine and replay (dormant)
- **Objective**: `MasteryEngine` interface, `EngineV1` (wrap), `EngineV2`,
  `EngineRegistry`, config v1/v2 parameter sets, `ReplayService`
  (sync + queued), `smarter:mastery:replay --dry-run --report`,
  `MasteryExplainer`.
- **Behaviour**: none — config stays at version 1.
- **Tests**: `EngineV2Test` (all §14 rows), `ReplayTest`, determinism,
  `MasteryExplainerTest`.
- **Dependencies**: Phase 1. **Risk**: low (dormant). **Rollback**: delete.

### Phase 3 — Content registry of items + PHP evaluator
- **Objective**: `assessment_items` imported from final-test JSX and practice
  JSON; `AnswerEvaluator` PHP port with shared fixtures; validators accept
  `learningPoints`+roles and `difficulty`/`templateId`.
- **Files**: `ContentRegistryImporter`, `packages/core/curriculum/exportCurriculum.mjs`
  (or a sibling export for items), `validate-lessons.mjs`,
  `validate-exercises.mjs`, `exercise.schema.json`, `AnswerEvaluator.php`.
- **Tests**: `RegistryImportTest`, `AnswerEvaluatorTest` (fixtures), validator
  tests.
- **Dependencies**: Phase 0 (contract). **Risk**: JSX parse edge cases →
  importer fails loudly, never guesses. **Rollback**: tables unused.

### Phase 4 — Authoritative submission (shadow, then switch)
- **Objective**: practice answers evaluated server-side; `/evidence` v2 payload
  accepted alongside legacy; disagreements logged; `evaluated_by` set;
  BossFinal sends v2 + `completionMode`; PracticeSession displays the server
  outcome; `evidenceQueue` keeps 422s.
- **Tests**: `EvidenceTrustBoundaryTest`, `EvidenceFlowV2Test`, frontend
  payload tests, e2e practice.
- **Dependencies**: Phases 1, 3. **Risk**: evaluator mismatch → shadow period
  with 0-disagreement exit criterion. **Rollback**: feature flag
  `mastery.server_evaluation=false` returns to client outcome (still recorded
  with `evaluated_by=client`).

### Phase 5 — Engine V2 switch + full replay
- **Objective**: dry-run diff reviewed; `engine_version=2`; full replay; legacy
  request fields removed; `status_reason` populated.
- **Tests**: `ReplayTest` rollback path; nightly verify job.
- **Dependencies**: Phases 2, 4. **Risk**: status changes surprise students
  (some `mastered` → `reinforce (insufficient_evidence)`): mitigated by the
  Phase 6 wording landing in the same release train, and by the diff review.
  **Rollback**: version 1 + replay (§31).

### Phase 6 — Student UI
- **Objective**: §24 — unified labels, completion words, `statusReason`,
  freshness, explanation drawer, LessonIndex status handling, BossFinal
  results split, hub with all LPs.
- **Files**: `LearningPointMastery.jsx`, `LessonIndex.jsx`, `UnitPage.jsx`,
  `Progression*`, `PracticeHub.jsx`, `PracticeSummary.jsx`, `BossFinal.jsx`,
  `packages/core/lessonAccess.js` (rename), i18n `student` namespace.
- **Tests**: component tests, e2e lesson-kit, RTL fixture.
- **Dependencies**: Phase 5 (fields). **Rollback**: UI-only.

### Phase 7 — Teacher: class × LP and dossier
- **Objective**: `ClassroomLearningPointService`, two endpoints, LP tab and
  drill-down, dossier v2, `OutcomeStats` everywhere in teacher/admin.
- **Tests**: `ClassroomLearningPointTest`, `ClassroomProgressTest` extended,
  frontend tests, e2e teacher.
- **Dependencies**: Phase 5. **Rollback**: additive.

### Phase 8 — Knowledge Map overlay, recommendations, soft gates
- **Objective**: §27, §29, §30; wire `masteryStatusById` and
  `recommendModulesForLearningPoints`.
- **Dependencies**: Phase 6. **Risk**: none blocking by design.

### Phase 9 — Large-bank readiness
- **Objective**: `ExerciseSelector` + `/next`; template metadata in content;
  generation contract published; optional server-served questions without
  `expectedAnswer` (§41-D5); `available_items_for_lp` from the registry.
- **Tests**: selector unit + scale suite (§34).
- **Dependencies**: Phases 3, 5.

### Phase 10 — Hardening
- **Objective**: observability (§37), scale tests in CI (tagged), nightly
  verify, `PREEXISTING_ISSUES` updates, documentation final pass.
- Runs alongside Phases 6–9; listed separately so nothing is skipped.

## 39. Rollback Strategy

| Phase | Rollback |
|---|---|
| 1 | new columns ignored by V1; drop migration |
| 2 | dormant code; remove |
| 3 | registry unused; drop table; validators keep accepting legacy shapes |
| 4 | `mastery.server_evaluation=false` flag; legacy payload still accepted |
| 5 | `engine_version=1` + replay (evidence untouched; V1 frozen and tested) |
| 6–8 | UI/feature flags per surface (`features.masteryV2Ui`, `features.classLpTab`) |
| 9 | selector flag → fixed order |

The invariant that makes every rollback possible: **no phase deletes or
rewrites evidence**, and the V1 engine stays in the codebase until a V3
replaces V2.

## 40. Future 200+ Exercise Validation

The engine's inputs are one event and one state row. The only quantities that
depend on the bank are `available_items_for_lp` (a COUNT on an indexed
registry table, read once per write) and the selector's candidate set.

| | Scenario A — 5 × 3 (today) | Scenario B — 5 × 40 | Scenario C — 5 × 100 |
|---|---|---|---|
| Items per lesson (≈3 q/exercise) | ≈ 45 | ≈ 600 | ≈ 1 500 |
| Items per LP (4 LPs) | ≈ 11 | ≈ 150 | ≈ 375 |
| `need` for `mastered` | `min(3, 11) = 3` | `min(3, 150) = 3` | `min(3, 375) = 3` |
| Evidence needed by a student to reach `mastered` on one LP | 3–5 distinct successes | same | same |
| Write cost per answer | 6 queries | same | same |
| Profile / class × LP cost | rows = LPs | same | same |
| Selector cost | ≤ 9 rows | ≤ 120 | ≤ 300 (indexed) |
| Farming | impossible past `w_repeat` | same | same |
| Code changes to the engine | — | **none** | **none** |

Where a lesson has fewer items than `min_distinct_items` for some LP
(possible in A: a policy-exempt lesson with one practice question and one
final-test question on P4), `need` shrinks to what exists and the state
carries `statusReason = threshold` plus an explanation note «بنك التمارين
محدود» — the engine states the limitation instead of inventing evidence.

No constant in the engine encodes an exercise count: `levels` is configuration,
`need` is a bound, weights are per event.

## 41. Risks and Open Decisions

### Risks
1. **Status regressions at the switch** — some `mastered` become `reinforce`.
   Mitigation: diff review, same-release wording, `statusReason`.
2. **PHP/JS evaluator drift** — mitigated by the single fixture file and the
   shadow period; residual risk on locale/digit normalisation (Arabic-Indic
   digits) → fixtures must include them.
3. **JSX parsing for the registry** — the metadata contract already requires
   static literals; a lesson breaking that fails import loudly.
4. **Hostinger constraints** (no `proc_open`) — replay uses the database queue
   and a scheduled worker, or `--sync` for small data; the Node export runs in
   CI, not on the host (existing pattern).
5. **Scope creep into recommendations/adaptive selection** — kept as separate
   services behind flags; the engine ships without them.

### Open decisions (each needs a product answer; defaults are configuration)

- **D1 — `min_distinct_items`**: 3 (default proposed; the smallest number that
  separates "one lucky question" from a pattern and is reachable in every
  current lesson via `need` bounding) · 4 (stricter; some LPs in Scenario A
  would be capped by the bank) · 5. Consequence: higher = slower `mastered`,
  more `insufficient_evidence` in the diff.
- **D2 — Is assessment required for `mastered`?** (a) `require_assessment=true`
  with the level-4 equivalence (proposed: mastery means demonstrated under
  test-like conditions *or* on hard transfer items) · (b) practice alone
  suffices (simpler, faster, weaker claim) · (c) two statuses,
  `mastered_practice` / `mastered_assessed` (most honest, more UI).
- **D3 — `partially_correct` weight**: 0.4 positive (proposed) · 0.5 · treat
  as inert for confidence but count in analytics. All options exclude it from
  `distinct_items_success`.
- **D4 — Repetition weights** `w_retry=0.6, w_variant=0.7, w_repeat=0.1`
  (proposed) vs `0.5/0.5/0` (stricter). Consequence for D4-strict: recovering
  a failed item counts half; identical repeats count nothing.
- **D5 — Hide `expectedAnswer` from the client** in Phase 9 (server-served
  questions; instant feedback becomes a round-trip) · keep the bundle and rely
  on server evaluation (proposed for V2; cheaper; a determined student can
  still read the key).
- **D6 — Unanswered final-test questions**: `abandoned` (inert, proposed:
  running out of time is not a wrong answer; the snapshot score still shows
  0/5) · `incorrect` (V1 behaviour; harsher, keeps the score and the mastery
  consistent).
- **D7 — Freshness thresholds** 21/60 days (proposed) · aligned with the school
  term calendar (needs a term table) · none in V2.
- **D8 — Gates**: soft only (proposed) · hard gates with teacher override
  (needs a teacher write on a student setting, contradicting "only a student
  writes progress").
- **D9 — Textbook exercises**: stay instructional (proposed) · promote the
  ones with a reliable evaluator (`integerSet`, `fraction`, `choice`) into the
  practice bank as level-1/2 items (content work, no engine change).
- **D10 — Time on task**: not collected (proposed for V2) · client-reported
  `elapsedMs` stored on evidence as untrusted metadata for explanation only.

---

> **If we implement this architecture, can we later add 40, 100, or 500
> exercises per level without changing the fundamental mastery architecture?**

**Yes.** The mastery engine consumes one event and one state row per Learning
Point; it never enumerates exercises, never stores per-exercise results in the
state, and never recalculates over the bank on a read. The only bank-dependent
inputs are (1) a count of published items per LP, read from an indexed
registry to *bound* the minimum-evidence rule, and (2) the exercise selector's
candidate set, which is a separate service, flag-controlled, and scans one
level of one lesson through indexes. Adding exercises means adding JSON files
that already satisfy the item contract (§6, §20), running the validator and
the registry import. `need` stays `min(3, available)`, `w_repeat` keeps
repetition cheap, `variant` keeps template families honest, and a student
reaches `mastered` on an LP after a handful of *distinct* successes whether the
bank offers 11 items or 375. The engine contains no constant tied to a count
of exercises, levels are configuration, and every parameter change is a
versioned engine plus a replay of immutable evidence — which is exactly the
property today's system lacks and this plan restores.
