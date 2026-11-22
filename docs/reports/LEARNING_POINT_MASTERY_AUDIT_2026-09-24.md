# Learning Point Progress & Mastery: Current Architecture Audit

> **Point-in-time report (2026-09-24). Historical, not a contract.** This was a
> read-only audit: no code or documentation was changed. Every claim was
> checked against the working tree on that date, and line references point to
> it. The authoritative contracts are still
> [`PROGRESS_MODEL.md`](../architecture/PROGRESS_MODEL.md) and
> [`LEARNING_ARCHITECTURE.md`](../architecture/LEARNING_ARCHITECTURE.md).

## 1. Executive Summary

**There is a real Learning Point (LP) mastery model.** It is not a points system: there is no "+10 / −10" rule anywhere.

- **Storage:** one row per (student, LP) in `student_learning_point_progress`. It holds a `confidence` value between 0 and 1, a `status` (`unassessed | gap | reinforce | mastered`), `attempts`, `correct_count` and `last_evidence_at`.
- **Update rule:** every time evidence arrives, the backend changes the value in place. It adds or subtracts a step whose size depends on difficulty (`MasteryModel::updateConfidence`), then clamps the result to [0, 1]. The status is then read from the new value: 0.70 or more is `mastered`, below 0.40 is `gap`, anything between is `reinforce`.
- **Source of truth:** the backend is authoritative for the *number*. Every piece of raw evidence is also kept in `learning_evidence`, and the value can be rebuilt by replaying it (`MasteryRecalculator`).

**Only two mechanisms feed it:**
- **The lesson final test (`BossFinal`).** Every final-test question in the 9 live 4AM lessons declares its LP(s). But the browser decides whether the answer is correct *and* which LP codes to send; the server only checks that those codes belong to the lesson.
- **The practice engine.** Here the server reads the LPs from versioned content (`content/practice/**`), not from the request. Correctness is still decided by the browser.

Nothing else touches LP mastery:
- discovery, practice and manipulation questions inside modules;
- the textbook exercises (`content/exercises.js`, which declare a `learningPointId` that nothing reads);
- the prerequisite diagnostic;
- XP.

**Completion and mastery are two separate systems.** Most "progress" numbers the student sees are *completion*, read from localStorage: lesson %, unit %, "🏆 تمّ إتقان الدرس", module status `'mastered'`, the Knowledge Map. LP mastery shows up as coloured dots and chips on several screens.

**The teacher barely sees LP mastery.**
- The class view contains **no LP data at all**. It shows lessons completed ÷ lessons in scope, plus a practice success rate.
- The per-student page lists up to 20 LPs as plain text with `correct/attempts`, in no particular order.
- **No teacher endpoint answers "how are my students doing on LP A?".** Only the admin has a per-LP aggregate, and it covers the whole platform, not one class.

## 2. Documentation Audit

| Document | What it says | Checked against the code |
|---|---|---|
| [`docs/README.md`](../README.md) | Map of the docs: PROGRESS_MODEL owns completion vs mastery; LEARNING_ARCHITECTURE owns evidence and mastery | — |
| [`PROGRESS_MODEL.md`](../architecture/PROGRESS_MODEL.md) | Two progressions in two tables, never merged. The 2026-09-20 note at the top corrects the body ("No independent mastery signal" is false) | The note is accurate. The body's "Completion vs Mastery" table is still stale |
| [`LEARNING_ARCHITECTURE.md`](../architecture/LEARNING_ARCHITECTURE.md) | Evidence flow, trust boundary, mastery constants, practice ≠ assessment, mastery gates, recommendations | Mostly accurate. Three stale points: (a) "practice never touches mastery" — the practice *engine* does (it is a different thing from practice *questions*); (b) the results screen "recommends modules via `recommendModulesForLearningPoints`" — nothing in production calls it; (c) mastery gates "block on a demonstrated gap" — never evaluated (see §17) |
| [`EXERCISE_CONTRACT.md`](../architecture/EXERCISE_CONTRACT.md) | Validation boundary and practice engine | Consistent: correctness is computed by the client |
| [`AI_LESSON_CONTRACT.md`](../architecture/AI_LESSON_CONTRACT.md) | `assessment: {enabled, type, learningPointIds}` on questions | Implemented, and enforced by `validate:lessons` |
| [`KNOWLEDGE_MAP.md`](../architecture/KNOWLEDGE_MAP.md) | The cumulative map (بطاقتي) | Driven by completed modules, not by mastery |
| [`TEACHER_CLASSROOM_ARCHITECTURE.md`](../architecture/TEACHER_CLASSROOM_ARCHITECTURE.md) §4 | The teacher view is a query over the student's tables; no copy is stored | True. The view just contains almost no LP data |

**Principles the code does respect:**
1. Completion ≠ mastery, kept in two tables.
2. Only evidence of the "assessment" kind moves mastery.
3. The student is identified from the token, never from the request body.
4. Evidence is idempotent per `attemptId`.
5. The diagnostic baseline is never overwritten (separate tables, separate keys).
6. LP codes are append-only (`{grade}_{lesson}_P{n}`).
7. Only a student can write progress (`learner` middleware).
8. There is no teacher-side copy of progress data.

## 3. Implementation Audit: the pipeline

```text
LP definition   packages/core/curriculum/dz/lessons_4am_2026_2027.json  pointsToLearn[i]
                → coursesData.js:3115-3122  id = `${grade}_${lesson}_P${i+1}`
                → artisan smarter:import-curriculum → learning_points (code unique, retired_at)
Lesson/Module   lesson.config.js modules[].teachesLearningPointIds  (reference only)
Question
  final test    ModuleNN Itqan.jsx  { id:'E1', correct:0, assessment:{enabled, type:'assessment', learningPointIds:[…]} }
  practice      content/practice/4am/<lesson>/level-N/*.json  questions[].learningPoints [{code, role}]
Answer + check  BossFinal.jsx:322  isCorrect = picked === correct            (browser)
                PracticeSession.jsx → outcome (6 values)                      (browser)
Transport       useEvidenceSubmission.js:58-64 → POST /lessons/{code}/evidence
                POST /practice/sessions/{id}/answers → PracticeEvidenceRecorder
Storage         learning_evidence (+ pivot learning_evidence_learning_point with role)
                question_attempts (practice) · lesson_final_test_attempts (snapshot, overwritten)
LP evaluation   ProgressEngine::updateProgress (ProgressEngine.php:226) → MasteryModel::updateConfidence
Aggregation     none above LP level for mastery (see §16)
Student UI      GET /students/me/learning-profile · GET /lessons/{code}/practice/overview
Teacher UI      GET /teacher/classrooms/{id}/progress · …/students/{sid}/progress
```

Key files:

| Role | File |
|---|---|
| Mastery formula | [`apps/api/app/Domain/Progress/Support/MasteryModel.php`](../../apps/api/app/Domain/Progress/Support/MasteryModel.php) |
| Evidence write + LP update | [`apps/api/app/Domain/Progress/ProgressEngine.php`](../../apps/api/app/Domain/Progress/ProgressEngine.php) |
| Replay / rebuild | [`apps/api/app/Domain/Progress/MasteryRecalculator.php`](../../apps/api/app/Domain/Progress/MasteryRecalculator.php) |
| Final-test evidence endpoint | [`apps/api/app/Http/Controllers/LearningEvidenceController.php`](../../apps/api/app/Http/Controllers/LearningEvidenceController.php) |
| Final-test snapshot endpoint | [`apps/api/app/Http/Controllers/LessonFinalTestAttemptController.php`](../../apps/api/app/Http/Controllers/LessonFinalTestAttemptController.php) |
| Practice → evidence | [`apps/api/app/Domain/Practice/PracticeEvidenceRecorder.php`](../../apps/api/app/Domain/Practice/PracticeEvidenceRecorder.php) |
| Student profile read | [`apps/api/app/Http/Controllers/LearningProfileController.php`](../../apps/api/app/Http/Controllers/LearningProfileController.php) |
| Teacher class / student read | [`apps/api/app/Domain/Classroom/ClassroomProgressService.php`](../../apps/api/app/Domain/Classroom/ClassroomProgressService.php), [`apps/api/app/Domain/Progress/StudentDossier.php`](../../apps/api/app/Domain/Progress/StudentDossier.php) |
| Final test (client) | [`apps/web/src/lessons/common/kit/BossFinal.jsx`](../../apps/web/src/lessons/common/kit/BossFinal.jsx) |
| Evidence submission (client) | [`apps/web/src/lessons/common/hooks/useEvidenceSubmission.js`](../../apps/web/src/lessons/common/hooks/useEvidenceSubmission.js), [`apps/web/src/lessons/common/evidenceQueue.js`](../../apps/web/src/lessons/common/evidenceQueue.js) |

## 4. Learning Point Data Model

```text
grades ─< chapters ─< units ─< lessons ─< learning_points (code UNIQUE, order, retired_at, diagnostic_skill_id)
                                   │              │
users ─┬─< learning_evidence >─────┘              │   (question_code, attempt_id UNIQUE, is_correct,
       │        │                                 │    outcome, assessment_type, level, hints_used,
       │        └─< learning_evidence_learning_point >─┘   misconception_id, source_id, answer JSON)
       │                     (role primary|secondary)
       ├─< student_learning_point_progress >── learning_points   UNIQUE(user, lp)
       │        (status, confidence DECIMAL(4,3) default 0.5, attempts, correct_count, last_evidence_at)
       ├─< student_lesson_progress >── lessons   UNIQUE(user, lesson)
       │        (status in_progress|completed, completed_modules JSON, current_module, completion_mode)
       ├─< lesson_final_test_attempts >── lessons  UNIQUE(user, lesson)  (score, total, answers JSON)
       ├─< practice_sessions ─< exercise_attempts ─< question_attempts (outcome, hints_used, attempt_number)
       └─< classroom_memberships >── classrooms ─< classroom_lessons (hidden flag)
```

- **There is no `questions` table.** Final-test questions live in JSX. Practice questions live in JSON on disk.
- **Relationships:** a student produces evidence rows; each evidence row is linked to one or more LPs through the pivot table; and there is exactly one progress row per (student, LP). **One single table holds mastery.** `PracticeEvidenceConvergenceTest::test_there_is_no_second_mastery_table` guarantees this.

## 5. Question → Learning Point

| | Final test (`BossFinal`) | Practice engine |
|---|---|---|
| Every question linked to an LP? | **YES.** 44/44 across the 9 4AM final tests (validator passes) | **YES.** 109/109 4AM questions |
| Several LPs per question? | YES. 2 questions carry 2 LPs, both counted as `primary` | YES. 4 questions have a `secondary` LP (weighted ×0.5) |
| Where the link is declared | `assessment.learningPointIds` in the module's JSX | `learningPoints[{code, role}]` in the JSON |
| Static or dynamic? | Static | Static |
| Enforced at build time | `validate-lessons.mjs`: needs ≥1 LP, the LP must belong to the lesson, every LP must be covered by an assessed question, and enabled questions are only allowed in `evaluation` modules. **Gap:** a final-test question with *no* `assessment` block is not flagged; it silently produces no evidence | `validate-exercises.mjs:267-278` and the schema: ≥1 LP, exactly one `primary` |
| Enforced by the backend | Only the *relationship*: codes must exist, must not be retired, and must all belong to one lesson matching the URL (`ProgressEngine.php:187`). The server **cannot** check that question E1 really measures P1 | **YES.** The LPs are read from the content (`PracticeEvidenceRecorder.php:76`), never from the request |
| Question with no LP | The client sends nothing (hook gate at L54). The server would answer 422 | The recorder throws a DomainException and the request fails with 422 |
| LP code does not exist | 422. The first failed POST is queued; when the queue is flushed, **a 422 is thrown away**, so the evidence is lost without anyone being told | 422, and the transaction is rolled back |
| Can the client choose or override the LP? | **YES.** Any LP code of the same lesson can be sent for any `questionCode` | **NO** |
| Can the client choose correctness? | **YES** (`isCorrect`) | **YES** (`outcome`) |
| Other client-controlled fields | `assessmentType` accepts `'practice_exercise'` from the client (`LearningEvidenceController.php:46`), which applies the ×0.9 weight | — |

**Other scored interactions.** None of these write LP evidence:
- Module questions (discovery, practice, trigger, manipulation). `submitEvidence` has exactly one caller, `BossFinal.jsx:323`, and the server rejects `discovery` / `practice` types with 422.
- The textbook exercises in `content/exercises.js`. Their `learningPointId` and `difficulty` are only displayed.
- The prerequisite diagnostic (`PrerequisiteDiagnostic.jsx`), which runs only in the browser.
- The grade diagnostic, which uses separate tables (`diagnostic_*`) and never writes LP progress.
- Math Lab practice panels.

No remediation, challenge or adaptive question type exists.

**Conclusion on the key assumption:** *"every question is connected to an LP and answering it evaluates the student on that LP"* is **true only for final-test and practice-engine questions**. It is not true for the questions inside modules, and not for the textbook exercises inside lessons.

## 6. Scoring Policy (actual)

The whole policy lives in `MasteryModel::updateConfidence` (`MasteryModel.php:84`), applied separately to each LP of an evidence event:

```text
dw     = clamp(difficulty, 1, 4) / 4
delta  = correct ? +0.22·(0.3 + 0.7·dw) : −0.22·(0.3 + 0.7·(1 − dw))
mod    = 1
       × 0.5  if outcome == partially_correct
       × 0.5  if role == secondary
       × 0.9  if source == practice_exercise
       × {1:0.7, 2:0.5, ≥3:0.4}[hints]  only if correct
new    = round(clamp(old + delta·mod, 0, 1), 3)
status = ≥0.70 mastered · <0.40 gap · else reinforce          (unassessed = no row)
```

What one event does to a fresh LP (confidence 0.5):

| Source | Correct | Wrong |
|---|---|---|
| Final test (difficulty is always 2) | **+0.143** | **−0.143** |
| Practice, level 1 (difficulty 1) | +0.094 | −0.163 |
| Practice, levels 2–3 (difficulty 2) | +0.129 | −0.129 |
| Practice, level 4 (difficulty 3) | +0.163 | −0.094 |
| Practice, level 5 (difficulty 4) | +0.198 | −0.059 |

| Aspect | Actual behaviour |
|---|---|
| Starting value | 0.5 (there is no row until the first evidence arrives) |
| Minimum / maximum | 0 / 1, clamped |
| Partial credit | **Wired inconsistently.** `partially_correct` is not a success outcome (`PracticeEvidenceRecorder.php:36,82`), so in production it is a *failure at half weight*: 0.5 → 0.436. The unit test `test_a_partial_answer_counts_for_less_than_a_full_one` calls the model with `isCorrect=true` and asserts that the value *goes up*. That test does not match what the recorder actually does |
| Skipped question, final test | Counted as wrong (`picked: null`) |
| Timeout, final test | When the timer runs out, the test is submitted as it stands; unanswered questions count as wrong |
| `syntax_error` / `abandoned` (practice) | Stored as evidence, but they do not change confidence or `attempts` |
| Hints | Practice only. They shrink the gain from a correct answer and never make a wrong answer cost more |
| Retries / repeats | Every event counts in full (§11) |
| Difficulty weighting | Practice only: the exercise *level* (1–5) is mapped to difficulty 1–4. Final test: always 2 (§12) |
| Question weight | None |
| Final test vs practice | Final test ×1.0, practice ×0.9 |
| Diagnostic / remediation weight | Not applicable: neither feeds LP mastery |
| Decay over time | **None** |
| Recovery | Symmetric steps only. After a wrong answer, one correct final-test answer brings the value back exactly where it was |
| Penalty for repetition or anti-gaming | **None.** The only protection is idempotency per `attemptId` against replays of the *same* submission |

## 7. Is there a true "level"?

| Term | What produces it | Meaning |
|---|---|---|
| LP `status` / `confidence` | `ProgressEngine::updateProgress` → `student_learning_point_progress` | **Real per-LP mastery estimate** |
| Lesson "progress %" | `calculateCompletionPercentage(completedModules, modules.length)`, read from localStorage `smarter_lesson_{id}` | Completion |
| Module status `'mastered'`, `getModuleMastery` | `isModuleCompleted ? 100 : 0` (`packages/core/lessonAccess.js:34-36`) | Completion. The name is misleading |
| «🏆 تمّ إتقان الدرس» | `LessonIndex.jsx`, when every module is done | Completion |
| Lesson `completed` | Status sent by the client; the server only guarantees it never goes back (`LessonProgressService` L63-70) | Completion |
| Final-test «نتيجة التحدي» and «ملف الإتقان» | `BossFinal.jsx:115-128, 184-235`: correct count, and misses per config `skill` *within the current attempt only* | Score of one attempt. It **looks like** mastery (🟢🟡🔴) but is not LP mastery and can disagree with it |
| «نسبة النجاح» (teacher/admin) | `question_attempts` with outcome `'correct'` ÷ `COUNT(*)` | Practice accuracy (§17) |
| XP | localStorage only, 20 per correct final-test question on first success | Activity, no link to LPs |

## 8. Where the Source of Truth Is

**The canonical source** for "the level of student X on LP Y" is the row in `student_learning_point_progress` for (X, Y). It is computed on the backend, updated incrementally, and not cached anywhere else (no copy in localStorage, no teacher-side table).

- **It can be rebuilt** from `learning_evidence` with `MasteryRecalculator::replay`. That class is only called from one test (`PracticeEvidenceConvergenceTest.php:117`). No command or scheduled job reconciles stored values.
- **Where the numbers can diverge:**

| Pair | Can they disagree? | Why |
|---|---|---|
| Final-test attempt vs LP mastery | YES | The attempt row is overwritten or deleted on Redo. Evidence rows pile up |
| Lesson progress vs LP mastery | YES, by design | Completion is not mastery |
| «ملف الإتقان» vs LP status | YES | One attempt vs everything since the start |
| Student lesson % vs teacher lesson % | YES | The student reads localStorage (%, per module). The teacher reads the server `status` (lessons completed ÷ lessons in scope) |
| Practice summary vs teacher success rate | YES | They count "correct" differently (§17) |
| Student view vs teacher view of LP status | NO | Same rows |

## 9. Exercises vs Final Test

| Mechanism | Linked to LP? | Updates LP? | How? | Weight | Stored? |
|---|---|---|---|---|---|
| Final test (`BossFinal`) | YES | YES | Client `isCorrect` + client LP codes → `/evidence` | 1.0, difficulty 2 | YES (`learning_evidence` + a snapshot that gets overwritten) |
| Practice engine exercises | YES | YES | Client `outcome` + server-side LPs → `ProgressEngine` | 0.9 × difficulty from level × hints × role × partial | YES (`question_attempts` + `learning_evidence`) |
| Textbook exercises in lessons (`content/exercises.js`) | PARTIAL (declared, never read) | NO | — | — | NO |
| Module questions (discovery / practice / manipulation) | NO (the validator forbids LP ids) | NO | — | — | NO |
| Prerequisite diagnostic (per lesson) | NO | NO | — | — | NO (browser only) |
| Grade diagnostic | Advisory `diagnostic_skill_id` only | NO | Separate tables | — | YES (`diagnostic_*`) |
| Remediation / challenge / adaptive | Do not exist | — | — | — | — |

## 10. Worked Example: `qasim-mushtarak-akbar`, LP P1

The lesson has 4 LPs, and final-test question **E1 → `4am_qasim-mushtarak-akbar_P1`** (`Module04Itqan.jsx:20-22`). It also has practice exercises at levels 1–5.

**Correct answer in the final test.**
1. The student clicks submit, which runs `submitBoss()` (`BossFinal.jsx:315`). For each question: `isCorrect = picked === ep.correct`.
2. The browser calls `submitEvidence(ep, true, {picked})`, which sends `POST /api/v1/lessons/qasim-mushtarak-akbar/evidence` with `{questionCode:'E1', attemptId:<new UUID>, isCorrect:true, learningPointCodes:['4am_qasim-mushtarak-akbar_P1'], answer:{picked:0}}`.
3. The server side runs `LearningEvidenceController::store`, then `ProgressEngine::recordEvidence`. It checks the type, resolves P1 and checks it belongs to the lesson, then in one transaction inserts `learning_evidence` + pivot (`role=primary`) and calls `updateProgress`.
4. P1 moves from 0.5 (no row yet) to **0.643**, status `reinforce`, `attempts=1`, `correct_count=1`.
5. After all questions, the browser also sends `PUT /final-test-attempt` with `{score, totalQuestions, answers}`, which overwrites that table's single row.
6. **Where the student sees it:** a 🟡 dot on the lesson index and the unit page; the chips and the LP card on «تقدّمي», with a bar at 64% and no number shown; the practice hub.
7. **Where the teacher sees it:** the `reinforce` label on the student's dossier page, under «نقاط التعلّم», as `1/1`, if the LP falls in the first 20 rows. It does not appear anywhere in the class view.

**Wrong answer:** P1 goes 0.5 → **0.357**, `gap`, `attempts=1`, `correct_count=0`.

**Repeated attempt (Redo, then correct):**
1. `DELETE /final-test-attempt` removes only the snapshot.
2. The retake sends **a completely new set of evidence** (new UUIDs): 0.357 → **0.5** (`reinforce`), `attempts=2`.
3. XP is not awarded again.

## 11. Repeated Attempts

Sequence for LP A in the final test, where each step is ±0.143:

| Event | Confidence | Status |
|---|---|---|
| wrong | 0.357 | gap |
| correct (retry) | 0.500 | reinforce |
| correct | 0.643 | reinforce |
| correct | 0.786 | mastered |
| correct | 0.929 | mastered |
| correct | 1.000 (clamped) | mastered |
| correct | 1.000 | mastered (the gain is lost) |

- **How attempts combine:** every attempt is used, in order. Values **accumulate** and saturate at 1. The system never keeps only the latest or the best attempt, never averages, and never ignores retries.
- **The final test has no separate status.** It feeds the same row as practice.
- **Order matters only through the clamp.** At difficulty 2, `+ then −` and `− then +` both land on 0.5. At 1.0 the surplus is lost, so one wrong answer afterwards gives 0.857, which is still `mastered`.
- **Practice can be farmed.**
  - Opening the same question again creates `attempt_number+1` with a new UUID (`PracticeSessionService.php:128`), and each attempt is new evidence.
  - Three correct answers at level 1 (the easiest) reach `mastered`: 0.5 → 0.782.
  - The code comment "quinze exercices faciles ne valent pas une réussite de niveau 5" is true for *one* event only. Fifteen easy answers far outweigh one hard one.
- **No minimum evidence before `mastered`.** Two correct final-test answers are enough. The diagnostic model has a `hasSufficientEvidence` rule; the lesson model does not.

## 12. Difficulty

- **Final test:** no question has a difficulty field. The module's `difficulty: 3` in `lesson.config.js` is never sent. Every question weighs as difficulty 2, so **an easy correct answer counts the same as a hard one**.
- **Practice:** difficulty is the exercise **level**, not the question, mapped `1→1, 2→2, 3→2, 4→3, 5→4` (`ProgressEngine.php:45`). Here easy correct ≠ hard correct (+0.094 vs +0.198), and the asymmetry also applies to wrong answers: failing an easy question costs more.
- **Textbook exercises:** `difficulty` ('facile'…'maitrise') is only a display label.

## 13. Final-Test Semantics

In the code, the final test is **(A) another evidence source with full weight (×1.0 against practice's ×0.9)**, plus **(C) a completion or score snapshot** (`lesson_final_test_attempts`, overwritten).

- It is **not** treated as a stronger mastery assessment: no separate status, no extra weight, no "certified" flag.
- `completion_mode: 'mastery'` exists in the schema, but the client never sends it, so every completion is `'path'`.
- The docs' "the always-open final evaluation demonstrated mastery directly" is only reflected in unlocking (evaluation modules are always open), not in scoring.

## 14. Student Experience

| Location | What is shown | Source | Real LP mastery? |
|---|---|---|---|
| Lesson index «نقاط التعلّم» | Coloured dot per LP | learning-profile | YES. But loading, error and anonymous all look the same as "unassessed" (the `status` field is ignored) |
| Lesson index «تقدّمك» %, 🏆, module ✓ | Completion | localStorage | NO |
| Unit page | Dot per LP, `{mastered}/{n} ✓` per lesson | learning-profile | YES |
| Unit page lesson %, «دروس مكتملة» | Completion | localStorage | NO |
| «تقدّمي» stats | «كفاءات متحكَّم فيها» mastered/assessed | learning-profile | YES |
| «تقدّمي» «للعمل الآن» | Gap LPs first, then reinforce | learning-profile | YES |
| «تقدّمي» field / unit / lesson rows | Bar = completion, chips = mastery | both | PARTIAL |
| «تقدّمي» LP card | Status + bar width = confidence (no number) | learning-profile | YES |
| Student home hero | «كفاءة تستحق انتباهك», only when there is no lesson to resume | learning-profile | YES |
| Student home %, curriculum preview, recent | Completion | localStorage | NO |
| Practice hub «ما أظهرته» | Status per LP (only LPs that already have a row) | practice/overview | YES |
| Practice summary | Counts and misconceptions, then «معارفك الآن» status | session + overview | PARTIAL |
| Final test «نتيجة التحدي» / «ملف الإتقان» | Score, and misses per skill in this attempt | client | NO (looks like mastery) |
| Knowledge Map «بطاقتي» | Items unlocked per completed module | localStorage | NO |
| Courses / MesCours / Explorer / LessonCard | Completion % | localStorage | NO |

The same four states have **three different Arabic label sets** (`mastery.*`, `progression.chips.*`, `unit.mastery.*`), and teacher and admin use different words again.

## 15. Teacher Experience

| Metric | Status | Code |
|---|---|---|
| Student overall progress | Implemented, as completion: `lessonsCompleted / effectiveLessons` | `ClassroomProgressService.php:216` |
| Lesson progress | Implemented (status per lesson, completed / in progress) | `StudentProgressPage.jsx:56-67` |
| Module progress | Partial (a count of modules only) | `modulesCompleted` |
| LP progress | Partial: one student at a time, plain text, capped at 20, unsorted, confidence not shown | `StudentProgressPage.jsx:73`, `StudentDossier.php:38` |
| Weak LPs | Not implemented as a view (the status label is in the list above) | — |
| Mastered LPs | Not implemented as a view (`masteryCounts` is returned but never shown) | — |
| Recent mistakes / misconceptions | Not implemented | — |
| Attempts | Partial (`correct/attempts` per LP; questions answered) | — |
| Accuracy | Implemented as practice-only «نسبة النجاح» (final test excluded) | §17 |
| Improvement over time | Not implemented (the timeline lists events, not trends) | `StudentDossier::timeline` |
| **Class-level LP view** | **Not implemented** (no endpoint, no UI) | — |

## 16. Aggregation

**Mastery is never aggregated above the LP.** No module, lesson, unit, grade or overall mastery score exists. The only rollups are counts:
- `masteryCounts = count(rows) grouped by status` (dossier, admin);
- `{mastered}/{n}` per lesson (UnitPage);
- `mastered/assessed` (Progression);
- admin per-LP `masteryRate = mastered / students_exposed`.

**Completion rollups that do exist:**

```text
lesson_pct   = |unique completed module numbers| / modules.length ·100   (client, capped 100)
chapter_pct  = mean(lesson_pct over available lessons)                   (client, each lesson weighs 1)
teacher_pct  = completed_lessons / effective_class_lessons ·100          (server, binary per lesson)
class_avg    = mean(teacher_pct over active members)
```

## 17. Hidden or Duplicated Logic

1. **"Correct" is counted three different ways:**
   - `['correct','equivalent_correct']` in `PracticeEvidenceRecorder` and in the practice summary (`PracticeSessionController.php:178`);
   - `outcome = 'correct'` only in `StudentDossier.php:51`, `ClassroomProgressService.php:192`, `DashboardService.php:146` and `AnalyticsService.php:151`;
   - result: an equivalent answer counts as a success for mastery and as a failure in the teacher's success rate.
2. **The success-rate denominator differs:**
   - dossier and class use `COUNT(*)` over `question_attempts`. That includes questions that were opened but never answered (`outcome NULL`) as well as `syntax_error` / `abandoned`;
   - the practice summary counts only `submitted_at IS NOT NULL`;
   - admin analytics counts only rows submitted within the date range.
3. **Two parallel `MasteryModel` classes** (Diagnostic and Progress). Their shared thresholds are locked by a test; their update rules have drifted apart (weights and the sufficient-evidence rule).
4. **The replay logic is duplicated.** `MasteryRecalculator::difficultyFor` and its list of inert outcomes duplicate `ProgressEngine`'s constants instead of sharing them.
5. **Client-side "mastery" look-alikes:** `getModuleMastery`, the `'mastered'` module status, «ملف الإتقان» and «🏆 إتقان».
6. **Teacher vs student completion:** client % per module vs server lessons-completed.
7. **Unwired mastery hooks:** `isMasteryGateSatisfied` (`packages/core/lessonAccess.js:97-105`) is never passed `masteryStatusById`, so it always returns true; `recommendModulesForLearningPoints` (`packages/core/curriculum/moduleRecommendations.js`) has no production caller.

## 18. Architectural Risks (all confirmed in the code)

1. **The frontend decides correctness in every path, and chooses the LPs in the final-test path.** A client can credit any LP of the lesson and send `assessmentType: practice_exercise`.
2. **Partial credit is wired as a failure**, and the unit test checks the opposite of what the recorder does.
3. **No minimum evidence and no confidence measure.** `mastered` after 2 correct final-test answers, or 3 easy practice answers.
4. **Repeating is rewarded without limit.** Re-opened questions and final-test retakes all accumulate. There is no penalty for repetition and no cap on repeats of the same question.
5. **No decay or time dimension.** `last_evidence_at` is stored but never used in the calculation.
6. **The final test carries no difficulty** and is not treated differently from practice (only ×1.0 vs ×0.9).
7. **Evidence is lost silently** when a 422 happens during a queue flush (for example, an LP retired after the answer).
8. **The per-lesson textbook exercises are ignored by mastery** although they declare `learningPointId` and `difficulty`.
9. **Completion and mastery look alike in the UI** (🏆 إتقان, the `'mastered'` module status, «ملف الإتقان» with the same colours).
10. **Teachers get almost no LP information.** No class × LP view, and success rates computed differently from the student side.
11. **The value is incremental; replay only exists in a test.** Any past change to the weights has no reconciliation path in production.
12. **Explaining a level needs a DB query.** No API or UI shows which pieces of evidence produced the current level.
13. **The mastery gate and the module recommendations exist but are not wired.**

## 19. Current-System Formula: Student

> *"What is this student's level on Learning Point A?"*

```text
LP_LEVEL(student, lp):
    row = SELECT * FROM student_learning_point_progress
          WHERE user_id = student AND learning_point_id = lp
    if row is null: return {status: 'unassessed'}             # UI default
    return {status: row.status, confidence: row.confidence,
            attempts: row.attempts, correct: row.correct_count}

# row maintained incrementally by, for each evidence e touching lp (ordered by arrival):
    if e.outcome in {syntax_error, abandoned}: skip
    c   = row ? row.confidence : 0.5
    ok  = (final test) client isCorrect
          (practice)   outcome in {correct, equivalent_correct}
    d   = e.level ? {1:1,2:2,3:2,4:3,5:4}[e.level] : 2
    c   = MasteryModel.updateConfidence(c, ok, d, e.hints_used, e.assessment_type, pivot.role, e.outcome)
    row = {confidence: c, status: statusFor(c), attempts+1, correct_count + ok, last_evidence_at: now}
```

## 20. Current-System Formula: Teacher

> *"What is the level of my students on Learning Point A?"*

**Not implemented as a class-wide question.** No function or endpoint returns it. What exists:

```text
CLASS_VIEW(classroom):                         # GET /teacher/classrooms/{id}/progress
    lessons = grade lessons, published, not hidden
    per student: progress% = completed_lessons(lessons) / |lessons| · 100
                 successRate = count(question_attempts.outcome='correct') / count(question_attempts) · 100
    → contains NO learning-point data

STUDENT_VIEW(classroom, s):                    # GET …/students/{s}/progress
    mastery = student_learning_point_progress rows of s whose lp.lesson ∈ lessons  (unordered)
    UI shows first 20: title, status label, correct_count/attempts
```

Answering "my students on LP A" today would mean opening every student's page and finding A in each list, if A falls within the first 20 rows. The only true per-LP aggregate, `AnalyticsService::learningPoints` (mastered / exposed), is **admin-only and covers the whole platform**, not one class.

## 21. Documentation drift found (not fixed by this audit)

- `PROGRESS_MODEL.md`: the body's "Completion vs Mastery" table (already contradicted by its own 2026-09-20 note).
- `LEARNING_ARCHITECTURE.md`: "practice never touches mastery" (true for module practice questions, false for the practice engine); results-screen module recommendations (not wired); mastery gates (never evaluated); "Deferred" items 3–4 (done).
- Neither document mentions that the partial-credit wiring contradicts `MasteryModelTest`.
