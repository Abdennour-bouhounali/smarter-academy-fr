# Teacher pedagogical monitoring: audit and implementation plan

**DETECT → UNDERSTAND → INTERVENE → MEASURE**

- **Date:** 2026-09-24
- **Branch audited:** `dev`, including the uncommitted working tree
- **Implementation (2026-09-25):** implemented. The contract now lives in
  `TEACHER_CLASSROOM_ARCHITECTURE.md` §2 (consent, `ClassroomAccess`) and
  §4–§4c, and in `LEARNING_ARCHITECTURE.md` « State history ». Deviations from
  this plan:
  - transitions are recorded on EVERY real state change, not with an ε
    threshold (D-8): exact, and bounded by the evidence pivot;
  - consent for existing members is asked once, **non-blocking** (D-2
    variant): the teacher's reading is not suspended meanwhile;
  - signals and interventions are gated by the existing `progress.class` /
    `progress.student` keys, not by a new or paid key (D-10);
  - the student snapshot is part of the dossier response (no separate
    `/snapshot` route), the attention is `GET …/attention` (signals + recent
    changes), the per-student LP evidence extends `…/explanation`;
  - archived classes: per-student reads stop (D-5), but «قسمي» does not yet
    list them and `restore` does not re-check seats (G5/G6 open);
  - the student can see teacher suggestions but cannot dismiss them yet.
- **Status (original):** **a plan awaiting review, not a contract.** It was produced by analysis only; no application code or migration was changed. What is built from it is documented in the authoritative contracts listed in Appendix A, and those documents win wherever this report disagrees with them.

**Method**
- **Documents read first:** `docs/README.md` (the map), then the authoritative contracts:
  - `TEACHER_CLASSROOM_ARCHITECTURE.md`
  - `LEARNING_ARCHITECTURE.md`
  - `PROGRESS_MODEL.md`
  - `NOTEBOOK.md`
  - `EXERCISE_CONTRACT.md`
  - `LESSON_CONTRACT.md`
  - `KNOWLEDGE_DEPENDENCY.md`
  - `AI_LESSON_CONTRACT.md`
  - `ADMIN_PANEL_ARCHITECTURE.md`
  - `DEMO_DATASET.md`
  - the two Mastery V2 reports (historical)
- **Code traced:** end to end, across `apps/api` (Laravel/MySQL), `apps/web` (React/Vite) and `packages/core`.
- **Verification:** every claim below carries a `file:line` reference. The security findings were re-checked by hand.

**Labels used throughout**
- **[CURRENT]** is how the code behaves today.
- **[U]** is present in the working tree but **not committed**.
- **[PROPOSED]** is a recommendation.
- **[DECISION]** needs the owner's agreement.
- **[UNKNOWN]** could not be determined from the code, and the text says what would settle it.

> ⚠️ **The fact that affects everything else.** Mastery V2 is **uncommitted**. That covers the versioned engine, the server-side judge, the item registry, the minimum-evidence rules, freshness, the explainer, replay, and the class × Learning Point teacher tab with its service, controller, tests, frontend and five `2026_09_28_*` migrations. Committed `HEAD` (`f4bc19e`) still runs **V1** (`git show HEAD:apps/api/app/Domain/Progress/ProgressEngine.php:5,244,256`, which calls `Support\MasteryModel`). In V1 the browser decides correctness and the status is a bare confidence threshold. The authoritative docs (`LEARNING_ARCHITECTURE.md`, `PROGRESS_MODEL.md`) are also modified and uncommitted, and they describe V2. **This plan builds on V2. Landing V2 is the first step of Phase 0.**

---

## Contents

1. Executive summary
2. Current architecture discovered
3. Current teacher/class capabilities
4. Current Learning Point architecture
5. Current Notebook architecture
6. Current progress architecture
7. Data flow
8. Current limitations and gaps
9. Privacy and security findings
10. Performance findings
11. Recommended target UX
12. Recommended backend architecture
13. Recommended database changes
14. Recommended API changes
15. Recommended frontend changes
16. Attention-signal architecture
17. Historical-progress architecture
18. Intervention architecture
19. Phased implementation plan
20. Testing strategy
21. Migration and backfill strategy
22. Risks and mitigations
23. Files likely modified
24. New files likely created
25. Database migrations likely required
26. Acceptance criteria for the complete system
- Recommended implementation order
- Critical architectural decisions
- What I would not build
- Appendix A: documentation map
- Appendix B: documentation drift found during the audit

---

## 1. Executive summary

Smarter Academy already has most of the **DETECT** and **UNDERSTAND** layers, but in pieces. Some are committed and some are not.

**What already exists**
- **A trustworthy mastery signal per student per Learning Point** (Mastery V2 [U]):
  - four states: `unassessed / gap / reinforce / mastered`
  - a `statusReason`
  - evidence counters
  - a derived, non-decaying `freshness`
  - an explanation endpoint the student and the teacher share
- **A class × Learning Point view** [U]:
  - status counts per LP of one lesson
  - a drill-down with students weakest first
  - the per-student explanation
  - one `GROUP BY`, which is cheap
- **A per-student dossier** (`StudentProgressPage`), which separates **completion** from **mastery**.
- **Read-only notebook access** for the teacher (committed 2026-09-24).
- **An append-only evidence log** (`learning_evidence` + LP pivot) with server timestamps, plus a **replay** engine [U].

**What is missing**
1. **Trajectory.** No store of Learning Point state history exists, and replay has no *as-of* parameter. The system cannot answer "where was this student last week?" (§17).
2. **Interpretation.** Nothing turns the facts into signals of the form "who needs a look, and why?" (§16).
3. **Intervention and measurement.** There is no concept of an intervention and no before/after comparison (§18).

**Three privacy gaps must be fixed first. They contradict the stated product rule** (§9, verified by hand):
- **G1: access is not revoked when a student leaves or is removed.** Per-student teacher endpoints accept a membership in **any** status: the dossier, the notebook, a single note, and the LP explanation. The student's leave dialog says «سيتوقّف أستاذك عن رؤية تقدّمك».
- **G2: the student's email reaches the teacher.** It is in the roster, the class progress view and the LP drill-down [U], and it is printed as the subtitle of the student page.
- **G3: invitation links accept silently.** A logged-in student who opens an invitation link joins **with no confirmation click**. Teacher accounts are self-service with no approval step. Joining grants read access to progress, mastery and the notebook, and no consent is recorded.

**The recommended strategy is small.** Build no new analytics platform, no new progress table, no event bus and no alert inbox.

| # | Step | What it changes |
|---|---|---|
| 0 | Land V2 and fix privacy | makes the base trustworthy |
| 1 | Complete the current screens | adds a class overview across all lessons and a student snapshot, using existing services |
| 2 | Add one append-only transitions table, written by `ProgressEngine::advance` | gives trajectory |
| 3 | Derive signals **on read** | facts, then indicators, then a neutral "worth a look" layer, always linked to evidence, never ranked |
| 4 | Add one `classroom_interventions` concept that **freezes its own baseline** when created | MEASURE becomes a comparison between that frozen baseline and the current state, so it does not need the history table |

---

## 2. Current architecture discovered

| Layer | Reality (from code; `docs/architecture/CLAUDE.md`'s stack section is wrong) |
|---|---|
| Web | React 18 + Vite, JavaScript, React Context, fetch client; i18n namespaces `student`, `teacher`, `admin` (all Arabic RTL) |
| Pure logic | `packages/core`: curriculum exports, completion %, auth role lists (`CLASSROOM_PRESENTER_ROLES`) |
| API | Laravel (MySQL), Sanctum bearer tokens, hand-built JSON arrays (**no `JsonResource` classes**), `{success, …}` envelope, 422 `{reason}` refusals |
| Domain folders | `app/Domain/{Classroom, Progress, Practice, Admin, Plans, Content, Curriculum}` |
| Authorization | Gates `admin`, `teacher` (`AppServiceProvider.php:117-123`); **one policy**, `ClassroomPolicy` (`teacher_id === user.id`); middleware group `auth:sanctum, account.active, email.verified, can:teacher` (`routes/api.php:339`); `learner` middleware for progress/evidence writes; plan feature keys `progress.class`, `progress.student`, … via `PlanEntitlementResolver` |
| Content | Lessons in JSX (`apps/web/src/lessons/moyen/4am/`), practice bank in `content/practice/**` JSON, exported to `packages/core/curriculum/.generated/*.json`, imported by `smarter:import-curriculum` and `smarter:import-content-registry` |
| Background | `QUEUE_CONNECTION=database`; one job (`ReplayMasteryJob` [U]); one schedule (`smarter:mastery:verify` daily 03:30 [U]); **no events or listeners**; no activity-log package |
| Cache | `CACHE_STORE=database`; only content indexes are cached; **no aggregate is cached** |
| Audit | `admin_activity_logs` (append-only) also records `classroom_member.joined/left/removed` and `classroom_lesson.status_changed` |
| Notifications | Mail only (invitation, activation code, verify email), sent synchronously; **no in-app or database notifications** |
| Timezone | `config/app.php:85` `UTC`; Algeria is UTC+1 |

**Scale today:**
- 4AM has **9 lessons, 32 Learning Points, 40 modules, 85 practice exercises and 219 assessment items** (45 final-test, 174 practice).
- A full 4AM year is estimated at 35–45 lessons and 120–180 Learning Points.
- A realistic teacher has 4–6 classes of 35–45 pupils, which is about 150–270 seats (estimate; no production data in the repo).

---

## 3. Current teacher/class capabilities

### 3.1 Entities and lifecycle [CURRENT]

**`classrooms`**
- Columns: `teacher_id`, `name`, `description`, `grade` (a code string, no foreign key), `academic_year`, `status active|archived|suspended`, `join_code` (unique), `join_code_enabled`, `archived_at`.
- Classes are unlimited; capacity is counted in **student seats**.

**`classroom_memberships`**, a model and not a pivot
- Columns: `status active|left|removed`, `joined_at`, `left_at`, `joined_via join_code|invitation`, `invitation_id`, `removed_by`.
- Unique `(classroom_id, student_id)`, and the row is **reused on rejoin**, so each pair has only one membership row.
- Leaving and removal never delete anything (`ClassroomMembershipService.php:128-171`).

**`classroom_invitations`**
- Token stored as an HMAC, 14-day TTL, `pending|accepted|revoked`.
- **Not bound to the invited email address** (migration comment `2026_09_26_000011…:18-22`).

**`classroom_lessons`**
- Per-class hide/show of lessons. The class's **effective lessons** are the lessons of its grade that are published and not hidden (`ClassroomProgressService::effectiveLessonIds`, `:155-171`).
- That set is the **scope** of every teacher read.

### 3.2 What a teacher can see today

| Screen (route) | API | Content | Status |
|---|---|---|---|
| `/enseignant` TeacherHome | `GET /teacher/dashboard` | usage tiles, classes, seat meter | committed |
| `/enseignant/classes/:id`, tab التلاميذ | `GET …/students` | roster: names, **email**, joinedAt, lastActivityAt, lessons started/completed, progressPercent, successRate | committed (no feature gate) |
| tab التقدّم | `GET …/progress` (`progress.class`) | class summary: lessons in scope, students, active in the last 7 days, average **completion**, average **success rate**, plus the same rows | committed |
| tab نقاط التعلّم | `GET …/learning-points?lesson=`, `GET …/learning-points/{code}`, `GET …/students/{sid}/learning-points/{code}/explanation` | one lesson at a time: per LP a four-segment bar (mastered/reinforce/gap/unassessed) and chips «دليل ناقص», «بحاجة إلى اختبار», «متقن لكن قديم»; drill-down weakest first; explanation modal | **[U]** |
| `/enseignant/classes/:id/eleves/:sid` StudentProgressPage | `GET …/students/{sid}/progress` (`progress.student`) | identity (**with email**), completion tiles, mastery tiles, full LP list weakest first with reason, confidence bar, counters, freshness and «لماذا؟», a 30-event timeline | committed, richer shape [U] |
| `/…/eleves/:sid/cahier` StudentNotebookPage | `GET …/students/{sid}/notebook` | read-only notes (first 50, **no pagination control**) | committed |
| `/enseignant/progression` ProgressOverview | class picker | — | committed |

**The teacher cannot yet do any of the following:**
- see several lessons or the whole unit in one view;
- see any change over time;
- see a signal that says "look here";
- record anything they did;
- assign or recommend anything to students;
- measure an effect.

---

## 4. Current Learning Point architecture

### 4.1 Identity and attachment [CURRENT]

- **Hierarchy:** grade → chapter (المجال) → unit (الوحدة) → lesson (الدرس) → Learning Point (نقاط التعلّم) (`LESSON_CONTRACT.md`, `LEARNING_ARCHITECTURE.md:29`).
- **Code:** `{grade}_{lesson}_P{n}`, globally unique. The numeric `learning_points.id` is used for foreign keys and the code is used in the API. Points are retired with `retired_at` and never deleted.
- **Owner:** each point belongs to **one lesson** (`learning_points.lesson_id`).
- **Item → point mapping:** `assessment_items` + `assessment_item_learning_point(role primary|secondary)` [U], built by `smarter:import-content-registry`.
  - One item can credit up to 4 points, with exactly one primary. Today 6 items in 4AM credit several points.
  - One answer can only credit points of its **own lesson**.
- **Modules** declare `teaches_learning_point_codes` (JSON). It is used for recommendations and does not feed mastery.
- **Prerequisites between points exist in the database:** `learning_point_prerequisites` (27 4AM points, 34 edges, `required_mastery` = 0.700).
  - Only `RecommendationService` reads them, and it prioritises a prerequisite that is a gap.
  - **`required_mastery` is never compared with anything.**
  - `KNOWLEDGE_DEPENDENCY.md`'s `requires` is a different thing: it is static, lives in the frontend, and is used by an audit.

### 4.2 The algorithm as it runs (V2 [U]; V1 differences at the end)

**What "the percentage" is**
- It is `round(confidence × 100)`.
- `confidence` is stored on **`student_learning_point_progress`** (one row per student and point).
- It is **computed on write and stored**, never recomputed on read.
- The browser only displays it (`LearningPointMastery.jsx:81`, `lpBar.js:62-66`).
- A point with no evidence has **no row**; every view synthesises `unassessed` for it.

**Only two inputs move it.** Both go through `ProgressEngine::recordEvidence` (`ProgressEngine.php:80-206`).
1. **Final-test answers**
   - Flow: `BossFinal` → `POST /lessons/{code}/evidence` → `LearningEvidenceController`.
   - The server judges `picked === assessment_items.answer_key` [U].
   - `assessment_type = assessment`.
2. **Practice answers**
   - Flow: `POST /practice/sessions/{id}/answers` → `PracticeEvidenceRecorder`.
   - The server judges with `AnswerEvaluator` [U].
   - `assessment_type = practice_exercise`, weight ×0.9.

**Inputs that do not move it:**
- lesson or module completion;
- module questions (discovery, trigger, prerequisite check);
- manipulations;
- textbook exercises (D9);
- the diagnostic;
- XP;
- the Math Lab;
- the notebook.

**Pipeline for each answer**

```text
idempotent on attempt_id
item_key = "{final_test|practice}:{lesson}:{exercise|final}:{question}"
LPs + roles ← registry item (never the client, except the legacy door while config allows it)
outcome ∈ {correct, equivalent_correct, partially_correct, incorrect, syntax_error, abandoned}
kind    ∈ {first, variant, retry_after_failure, repeat_after_success}  (EvidenceClassifier, per item/template)
INSERT learning_evidence (append-only) + pivot (lp, role)
if outcome inert (syntax_error | abandoned): stop
for each LP: advance() → EngineV2::apply → UPDATE student_learning_point_progress (+ engine_version)
   (if the stored row has another engine_version: full replay of that pair first)
```

**`EngineV2::apply`** (`Engine/EngineV2.php:41-122`; numbers from `config/mastery.php:78-140`, verified)

```text
d  = difficulty ?? 3 ; dw = clamp(d,1,5)/5
base = 0.22 · (0.3 + 0.7 · (positive ? dw : 1−dw))
w  = ×0.4 partial · ×0.5 secondary role · ×0.9 practice · ×0.5 if evaluated_by='client'
     positive: × hint decay {1:0.7, 2:0.5, ≥3:0.4}  × {first 1, variant 0.7, retry 0.6, repeat 0.1}
     negative: × {repeat_after_success 0.5, else 1}
confidence' = clamp(confidence ± base·w, 0, 1)      (starts at 0.5)
status:
  confidence < 0.40                               → gap        (threshold)
  confidence < 0.70                               → reinforce  (threshold)
  distinct_items_success < min(3, available items)→ reinforce  (insufficient_evidence)   D1
  no final-test success and no success at d ≥ 4   → reinforce  (needs_assessment)        D2
  otherwise                                       → mastered
```

### 4.3 Answers to the Phase 3 questions

| Question | Answer [CURRENT, V2 working tree] |
|---|---|
| Stored or computed? | Stored (SLPP), updated synchronously on each evidence |
| Changes after exercises? | Yes: practice-engine answers, ×0.9 |
| Lesson completion affects it? | **No.** Completion lives in a separate table (`student_lesson_progress`) |
| Assessments affect it? | Yes. The final test is the only source that raises `assessment_success_count` (D2) |
| Repeated attempts? | Classified. A repeat success is worth ×0.1; «أعِد المحاولة» on the same attempt is judged but **not recorded** (`PracticeEvidenceRecorder.php:77-90`) |
| Incorrect answers lower it? | Yes, and more on easy items. One wrong final-test answer from 0.5 lands at 0.372, which is already `gap` |
| Forgetting or decay? | **None** (D7). `Freshness` (fresh ≤ 21 days, aging ≤ 60, stale beyond) is derived on read and only labels |
| Historical values retained? | **No.** Only the current row. Evidence is retained, so past values are reconstructable in principle (see §17) |
| Event history? | `learning_evidence` + pivot, append-only (the model throws on update or delete [U]) |
| Meaning of "mastery" | confidence ≥ 0.70 **and** ≥ min(3, bank) distinct items solved **and** at least one final-test success or one success at difficulty ≥ 4 |
| Is 70% today the same as 70% next month? | Confidence is deterministic for (ordered evidence, engine version). The **status** can change without new evidence when the item bank changes size, because `availableItems` comes from the current registry and nothing recomputes it on import |
| Comparable between students? | Only loosely. The same percentage can rest on 1 or on 6 distinct items. Reliability shows in the counters and `statusReason`, not in the number |
| Aggregatable across a class? | **Only as status counts.** `PROGRESS_MODEL.md`: "Aggregation above the Learning Point is a COUNT, never a score". No confidence average exists anywhere, and none should be introduced |
| Prerequisites? | In the database (`learning_point_prerequisites`); read only by recommendations |
| Attached to lessons/modules/exercises? | Lesson (owner); module (`teaches_*`, soft); items (registry) |
| One exercise affects several points? | Yes, with one primary and secondary ×0.5. **But a secondary success still increments `distinct_items_success` and `assessment_success_count`** (undocumented) |

**V1 differences, which is what is committed and deployed:**
- the browser's `isCorrect` is trusted;
- difficulty is `level/4`;
- there is no repetition, minimum-evidence or assessment rule;
- status is a pure threshold (≥ 0.70 mastered, < 0.40 gap).

Under V1 a teacher's "mastered" can come from one lucky answer. **Teacher monitoring must not ship on V1.**

---

## 5. Current Notebook architecture

- **Table `notebook_notes`** (current state, **hard delete**, no soft deletes, no versioning). Columns:
  - `user_id`
  - `lesson_id?` and `learning_point_id?` (foreign keys, set to null on delete)
  - `module_number?` (not a foreign key)
  - `exercise_id?` and `question_id?` (strings)
  - `title`, `content` (sanitized HTML), `content_text`
  - `note_type ∈ {note, erreur, question, rappel, astuce, exemple, resume}`
  - `mistake_type ∈ {calcul, methode, lecture, signe, etourderie, autre}?`
  - `is_pinned`, `completed_at`, `archived_at`
  - review queue: `next_review_at`, `last_reviewed_at`, `review_count`
  - Indexes: `(user_id, lesson_id | learning_point_id | completed_at | archived_at | next_review_at | created_at | note_type)`.
- **Creation is manual only.** The student presses «حفظ». Nothing is created automatically on a wrong answer.
  - After a wrong answer the editor is **pre-filled** with a «خطئي» section: the student's answer, the verdict and the feedback, but **not the expected answer**. The note is typed `erreur`.
  - The pre-fill is editable and deletable.
- **Links:**
  - The lesson is set from the context.
  - The Learning Point is set only when it is unambiguous: the question's primary point, or a module that teaches exactly one point.
  - **There is no link to an attempt or session.**
  - The knowledge-item source is not persisted.
- **Writers:** only the owner (`ownedBy()`). The teacher has **no write path** (a test asserts PATCH returns 405). The teacher has their *own* notebook at `/enseignant/cahier`.
- **Teacher read access** (committed 2026-09-24):
  - endpoint `GET /teacher/classrooms/{id}/students/{sid}/notebook[/{noteId}]`;
  - scoped to the class's effective lessons; notes outside that scope stay private, counters included;
  - returns full content;
  - the frontend page shows the first 50 notes with no pagination.
- **The intent of the notebook,** in `NOTEBOOK.md`:
  - «Le cahier appartient à l'élève. Une seule lecture tierce existe, et elle est bornée.»
  - «le cahier ne touche ni à la maîtrise ni à la progression»
  - «« où en est-il ? » et « qu'a-t-il noté ? » restent deux écrans»
  - `TEACHER_CLASSROOM_ARCHITECTURE.md` §4 adds that the class summary and dossier «carry no note, and never will».

**Can the notebook be an evidence source?** Only in a narrow sense (§16.4):
- Per student and per point, the fact "this student wrote *N* error notes on this point" can be shown **inside the notebook screen or linked from it**. It is never mixed into mastery and never counted across the class, unless the owner explicitly changes the rule.
- Notes are editable and hard-deletable, `note_type` is chosen by the student, and the point link is partial. The notebook is **qualitative** evidence for UNDERSTAND, not a detector.

---

## 6. Current progress architecture

There are **two progressions in two tables**, and one is never derived from the other (`PROGRESS_MODEL.md`).

| | Completion | Mastery |
|---|---|---|
| Table | `student_lesson_progress` (one row per student and lesson) | `student_learning_point_progress` (one row per student and point) |
| Written by | `PUT /lessons/{code}/progress`, from a client localStorage queue; union of `completed_modules`; `completed_at` set once by the server | `ProgressEngine::advance` on each evidence |
| Granularity | lesson; modules only as a JSON array **with no timestamps**; steps **not persisted** | Learning Point |
| Time | `last_activity_at` = **client** time, latest wins; `completed_at` = server | `last_evidence_at`, `last_success_at`, `last_failure_at` from evidence `submitted_at` (server) |
| History | none (overwritten) | none (overwritten); evidence is append-only |

**Other progress data:**
- **`lesson_final_test_attempts`:** one row per student and lesson, **overwritten**, and **deleted on «إعادة»**.
- **Practice:** `practice_sessions → exercise_attempts → question_attempts → hint_events`, datable with server times. Sessions left unfinished stay `open` forever.
- **Activity:** `users.last_activity_at`. It is platform-wide, overwritten, throttled to one write per 5 minutes, and set on login and on progress, evidence and practice writes. There is **no time-on-task** (D10).
- **Gates:** `moduleGate` and `stepUnlock` are client-only. Mastery gates are **soft** (D8).

**The two "success" numbers.** The teacher's class `successRate` comes from `question_attempts` (**practice only**, via `OutcomeStats` [U]). Mastery comes from `learning_evidence`. They are two parallel tracks for the same answers, linked only by `learning_evidence.source_id = practice_sessions.session_id`.

---

## 7. Data flow

### 7.1 Practice answer (the main mastery signal)

```text
PracticeSession.jsx:292 submitAnswer
 → POST /api/v1/practice/sessions/{id}/answers                 routes/api.php:186
 → PracticeAnswerController::store (l.88-143)  StudentActivity::touch → users.last_activity_at
 → PracticeEvidenceRecorder::record (l.47-144)  server judges (AnswerEvaluator [U]); LPs from the content JSON
     TX: UPDATE question_attempts {outcome, submitted_at=server now, evaluated_by, client_outcome}
         ProgressEngine::recordEvidence → INSERT learning_evidence + pivot
                                        → advance() per LP → UPDATE student_learning_point_progress
         practice_sessions counters++
 → teacher: class successRate (question_attempts join, ClassroomProgressService:208-218)
            class × LP counts and drill-down (ClassroomLearningPointService [U], reads SLPP)
            dossier mastery list and explanation (StudentDossier, MasteryExplainer [U], last 20 evidence rows)
```

### 7.2 Final test

```text
BossFinal.jsx:320-352
 (1) per question: POST /lessons/{code}/evidence {questionCode, attemptId, answer:{picked}}
     (offline → smarter_evidence_queue, up to 30 days; submitted_at = FLUSH time, not answer time)
     → LearningEvidenceController → server judge → ProgressEngine::recordEvidence (assessment) → SLPP
 (2) PUT /lessons/{code}/final-test-attempt {score, answers, submittedAt = CLIENT time}
     → updateOrCreate one row per (user, lesson): OVERWRITES; «Redo» DELETES it
 → teacher: mastery moves (the evidence persists); the timeline shows only the surviving attempt row
```

### 7.3 Lesson and module progress

```text
ModuleLayout → useProgress (localStorage smarter_lesson_{id}) → progressQueue (3 s debounce)
 → PUT /lessons/{code}/progress → LessonProgressService::upsert (union, monotonic status)
 → teacher: lessonsStarted/Completed, modulesCompleted (count of the JSON array), progressPercent = completed/effective
   (a DIFFERENT formula from the student's own percentage, which is computed on the client)
```

### 7.4 Notebook, manipulations, Math Lab

- **Notebook:** `POST /practice/notes` → `NotebookService::create`. It produces no evidence and does not touch `last_activity_at`. The teacher reads it read-only.
- **Manipulations:** emit **nothing** (no API call, no localStorage, no evidence).
- **Math Lab:** `math_lab_documents` holds current state only. It is not evidence, and the teacher does not see it.

---

## 8. Current limitations and gaps

**Structural**
1. **Mastery V2 is uncommitted.** The teacher Learning Points tab, the explanation and the richer dossier exist only in the working tree. Docs describe V2 as the contract, but `HEAD` runs V1.
2. **No trajectory.** There is no history of point state, no as-of replay, and no per-module dates. Lesson position is overwritten and stored in client time.
3. **Final-test history is lost.** The attempt row is overwritten or deleted. Its evidence rows survive but carry **no attempt-group id**.
4. **No class attribution.** Evidence has no `classroom_id`, and teacher reads are not bounded by `joined_at`. Everything the student did in the class's effective lessons, even before joining, is counted. **[DECISION D-3]**
5. **One lesson at a time.** The class × point view needs `?lesson=`. The teacher cannot see the unit or the whole scope at a glance.
6. **No signals.** Every judgement is left to the teacher, who must scan the whole roster.
7. **No intervention concept and no teacher → student channel.** `RecommendationService` exists for the student but takes no teacher input.
8. **The two success tracks can diverge.** The class `successRate` counts practice only; mastery counts practice and the final test.
9. **Time buckets are in UTC.** Any "this week" or "today" is wrong by one hour for Algeria.
10. **Registry drift.** A status can become stale when the item bank changes, and nothing recomputes it. The nightly `verify` job only logs.
11. **`required_mastery` on point prerequisites is stored but unused.**

**Documentation drift** is listed in Appendix B.

---

## 9. Privacy and security findings

The rule under audit: *a student who joins a class agrees that the teacher can access their learning information in Smarter Academy, and the teacher never receives the student's email.*

| # | Severity | Finding | Evidence | Verified |
|---|---|---|---|---|
| **G1** | **HIGH** | A student who **left or was removed** remains readable through every per-student endpoint: dossier, notebook list, single note, LP explanation [U]. The roster and aggregates correctly drop them. | `TeacherClassroomStudentController.php:59-68` (comment: «adhésion présente, quel que soit son état»); `TeacherClassroomNotebookController.php:130-141`; `TeacherClassroomLearningPointController.php:57` [U]. Contradicts `student.json:950` «سيتوقّف أستاذك عن رؤية تقدّمك» and `NOTEBOOK.md:47-48`. No test re-reads as the teacher after a leave. | ✅ by hand |
| **G2** | **HIGH** | **The student's email is sent to teachers and displayed.** `User` hides only `password` and `remember_token`. | `ClassroomProgressService.php:91,178,232`; `ClassroomLearningPointService.php:110,125` [U]; `StudentProgressPage.jsx:44` (`subtitle={data.student.email}`), plus the name fallback in `StudentProgressPage.jsx:22`, `MembersTab.jsx:40`, `ProgressTab.jsx:26`, `LearningPointDrilldown.jsx:22`. No test asserts that email is absent. | ✅ by hand |
| **G3** | **HIGH** | **Invitation links accept silently.** For a logged-in student, `/rejoindre/:token` redirects to `/espace/qism?token=`, where a `useEffect` joins immediately with no confirmation. Teacher accounts are self-service (approval states are `Planned`), and the link is not bound to the invited email. So anyone can create a teacher account and gain read access to a student's progress and notebook through one tap. | `JoinInvitation.jsx:36-38`; `Qism.jsx:61-82`; `TEACHER_CLASSROOM_ARCHITECTURE.md:59-60` | ✅ by hand |
| **G4** | MED-HIGH | **No recorded consent, and no notebook disclosure.** The membership has no consent timestamp or version. The student text says only that the teacher «يتابع تقدّمك». Nothing tells the student that their **notebook** is readable (it was private until 2026-09-24). The privacy page does not mention teachers. | membership migration `…000010:27-45`; `student.json:76,941`; `pages/legal/Confidentialite.jsx` | agent-verified |
| G5 | MEDIUM | **Archived classes remain readable** by the teacher, while the student can no longer see or leave them in «قسمي», because the study context drops non-active classes. | `TeacherClassroomController.php:111-122` (no status check); `StudyContextService.php:193`; `Qism.jsx:138-155` | agent |
| G6 | MEDIUM | **Seats can be bypassed by archiving and restoring**: archived classes free their seats, and `restore` does not re-check seats. | `PlanEntitlementResolver.php:76-82`; `ClassroomService.php:122-142` | agent |
| G7 | MEDIUM | **History from before joining is visible**: all notes (including **archived** ones, since `view=archived` is accepted), attempts and tests in the effective lessons. | `ClassroomProgressService.php:155-171`; `NotebookService.php:41,149-188` | agent |
| G8 | LOW-MED | `GET …/students` returns per-student progress statistics **without** the `progress.class` feature gate that `/progress` requires. | `ClassroomProgressService::studentList` `:66-71` | agent |
| G9 | LOW | `lastActivityAt` is **platform-wide** (activity outside the class's scope leaks as a timestamp). | `ClassroomProgressService.php:93,236` | agent |
| G10 | LOW | The public invitation preview returns the **invited email** to whoever holds the token. | `ClassroomInvitationService.php:130` | agent |
| G11 | LOW | Sanctum tokens use `['*']` abilities, so role control rests on gates. Acceptable, but noted. | `AuthController.php:73,126` | agent |
| G12 | LOW | Teacher reads of notebooks are **not audited**. | notebook controller | agent |
| G13 | LOW | The student's grade is not checked against the class grade on join, so the teacher sees the class-grade lessons whatever the student's own grade. | `ClassroomMembershipService::join` | [UNKNOWN] whether intended |

**What is sound:**
- **No cross-teacher IDOR.** Every teacher route resolves the class through `ClassroomPolicy`, and each student id, note id, invitation id and lesson id is checked against *that* class.
- No model is serialized wholesale; everything is hand-built arrays.
- The student only ever sees the teacher's name.
- Admins are refused on teacher routes.

**Rules every new teacher feature must follow** [PROPOSED; the contract to write into `TEACHER_CLASSROOM_ARCHITECTURE.md`]:
1. **One membership gate.** Introduce `ClassroomAccess::activeMember($classroom, $studentId)`: an active membership in a non-archived class, otherwise 404. Every per-student teacher read uses it, including future observations and interventions.
2. **One identity presenter for teachers:** `{id, firstName, lastName}` only. The empty-name fallback is an Arabic placeholder («تلميذ بدون اسم»), **never the email**.
3. **A contract test** walks every `/teacher/*` JSON response of a seeded class and asserts that no key named `email` and no value equal to any student's email appears. This mirrors `teacherContract.test.js`.
4. **Consent is a deliberate act.** An explicit confirm screen with a disclosure text naming *progress, mastery, answers and notebook*, and a `consented_at` + `consent_version` stored on the membership.

---

## 10. Performance findings

Only findings that matter for this feature, ordered by impact.

| # | Where | Issue | Proposal |
|---|---|---|---|
| P1 | `ClassroomProgressService.php:208-218` | Class `successRate` aggregates **all** of the members' `question_attempts ⋈ exercise_attempts ⋈ practice_sessions` on every load, with no time bound (grows to about 100–250k rows per class by year end) | Bound by a window (e.g. the last 30 days, shown as such) **or** read the SLPP counters, which are already aggregated. No new table |
| P2 | `StudentDossier.php:114-151` | `timeline` loads **all** sessions and final tests, then slices to 30 in PHP | `orderBy … limit 30` in SQL per source, then merge |
| P3 | `StudentDossier.php:67-70` | `whereHas('practiceSession')` becomes `EXISTS` over the whole `exercise_attempts` table | Join from `practice_sessions (user_id, lesson_id)`, which is indexed |
| P4 | `TeacherClassroomLearningPointController.php:66` [U] | The explanation endpoint runs the full `learningPointDetail` (every member) just to check scope | `effectiveLessonIds` + a point lookup + the membership gate |
| P5 | `question_attempts` | No `(user_id, submitted_at)` index and no lesson or point column | Needed for time-windowed practice facts; add the index |
| P6 | `learning_evidence` | `(user_id, submitted_at)` index exists only in the uncommitted migration | Ships with V2 |
| P7 | `TeacherDashboardController.php:35-41` | `usage()` and the pending-request query each run twice | Memoise |
| P8 | `StudentNotebookPage.jsx:42` | 50 notes, no pagination; up to about 600 KB per page | Paginate |
| (admin) | `TeacherService.php:75-93`; `AnalyticsService`; `DashboardService` | N+1 of about 12 queries per teacher row; unindexed time scans; full `question_attempts` scan on every dashboard load | Out of scope for this plan; list it as a separate ticket |

**What does *not* need optimisation:**
- The class × point matrix. At 45 students × 180 points that is about 8k SLPP rows through `UNIQUE(user_id, learning_point_id)` and `(learning_point_id, status)`, and one `GROUP BY` handles it trivially.
- **No cache and no materialised tables are justified**, and remember that the cache store is the database itself.
- `MasteryScaleTest` [U] varies only the bank size. Extend it to vary **class size and evidence volume**, so constant query counts are proven rather than assumed.

---

## 11. Recommended target UX

**One principle:** every element answers one of the eight teacher questions (A–H) and links down to its evidence.

- **Nothing ranks students.** Lists are grouped by *state* (gap → reinforce → unassessed → mastered), not by score, and never show a class rank or a leaderboard.
- **All screens reuse the existing visual vocabulary:** `MasteryPill`, `ReasonChip`, `FreshnessMark`, `ConfidenceBar`, `LP_STATUS_BAR` (`TEACHER_CLASSROOM_ARCHITECTURE.md` §8a).

### 11.1 Information architecture (inside the existing `ClassGroupDetail` tabs; no new top-level navigation)

```text
/enseignant/classes/:id
 ├─ التقدّم  (existing tab → becomes « نظرة عامة » content)            answers A, B
 │    • Scope line: N lessons in scope · N students · active last 7 days (existing)
 │    • « تستحقّ نظرة » : 0–N neutral cards (signals §16), each « لماذا؟ » → evidence
 │    • Unit map: lessons × LP status counts (stacked bars), click → LP tab
 │    • Student table (existing rows) — facts only, sortable by NAME or STATE, never by score
 ├─ نقاط التعلّم (existing [U] tab)                                      answers D, E
 │    • add « كل الدروس » option → whole-scope LP list (one GROUP BY)
 │    • LP drill-down (existing) + « ماذا تغيّر؟ » (trajectory, §17) + « تدخّل » button
 ├─ التدخّلات (NEW tab, Phase 6)                                           answers G, H
 │    • open / closed interventions, each with baseline vs now
 ├─ التلاميذ / الدروس / الإعدادات (existing)
/enseignant/classes/:id/eleves/:sid  StudentProgressPage (existing)        answers B, C, E, F
 │    • top: « لمحة » snapshot (§11.2)
 │    • LP list (existing) + per-LP sparkline of status transitions (Phase 4)
 │    • timeline (existing, bounded)
 │    • link « كرّاسه » (existing notebook page; unchanged semantics)
```

### 11.2 Student snapshot («لمحة»)

The snapshot answers "what's going on with this student?" in one view, and every number on it is a fact:

- **Mastery:** points by state (counts), plus how many have `insufficient_evidence` or `needs_assessment`.
- **Recent movement:** transitions in the last 14 days, e.g. «2 نقاط تحسّنت، 1 تراجعت» (Phase 4).
- **Activity:** last learning activity *inside this class's scope* (fixes G9); answers in the last 7 and 30 days.
- **Completion:** lessons completed out of those in scope.
- **Signals** concerning this student (Phase 5), each with «لماذا؟».
- **Open interventions** that include this student (Phase 6).

### 11.3 What the teacher can do (INTERVENE)

From an LP drill-down or a signal card, the teacher can:

1. **«سأتابع» (monitor).** Creates an intervention of kind `monitor` with a frozen baseline.
2. **«سجّلتُ ملاحظة» (teacher observation).** Private text on a student or point, visible to the teacher only (see D-7).
3. **«اقترحتُ مراجعة» (recommend).** Recommends practice on a point, a lesson module, or a prerequisite point, to selected students. Phase 7: shown to those students as a soft recommendation, never a lock (D8).
4. **«قدّمتُ درسًا في القسم».** Records that the class worked on the point in class. This is a kind of `monitor` with a label.

MEASURE then shows, per intervention, the baseline next to the current state, plus the evidence produced since (§18).

---

## 12. Recommended backend architecture

The new code integrates into existing domains. It adds **no** new top-level domain except `Intervention`, which lives under `Domain/Classroom/`.

```text
Domain/Classroom/
  ClassroomAccess.php            NEW  — the single gate: owned class (+ not archived for reads? D-5) + ACTIVE member
  ClassroomProgressService.php   MOD  — no email; bounded success window; scoped lastActivity
  ClassroomLearningPointService.php [U] MOD — no email; whole-scope overview (all effective lessons)
  ClassroomSignals.php           NEW  — derives signals on read from SLPP + transitions + evidence windows
  ClassroomInterventionService.php NEW — create/close/list; freezes baseline; computes outcome on read
  TeacherStudentPresenter.php    NEW  — {id, firstName, lastName}; the ONLY teacher-facing identity shape
Domain/Progress/
  ProgressEngine.php [U]         MOD  — advance() appends one transition row when state changes
  Replay/ReplayService.php [U]   MOD  — optional as-of (evidence submitted_at ≤ T) for backfill
  StudentDossier.php             MOD  — bounded timeline, join instead of whereHas
  Support/TimeWindow.php         NEW  — Africa/Algiers week/day boundaries → UTC ranges
```

**Rules:**
- **Signals and outcomes are computed on read** by pure functions that are unit-tested without a database. They are **never stored**, so there is no alert state to keep consistent and no background job.
- **The only new writes** are:
  1. the transition row, inside the existing evidence transaction;
  2. the intervention rows, written by the teacher.
- **Authorization:** every new route sits in the existing teacher group, goes through `ClassroomAccess`, and is gated by the existing feature keys:
  - `progress.class` for class-level reads;
  - `progress.student` for per-student reads;
  - a new key `interventions` in the plan registry, following the `PlanEntitlementResolver` pattern ([DECISION D-10]: free or paid).

---

## 13. Recommended database changes

**Only three changes.** Everything else is served by existing tables.

| # | Change | Why | Nature |
|---|---|---|---|
| DB-1 | **`classroom_memberships` += `consented_at` (timestamp, nullable), `consent_version` (string, nullable)** | Records the student's explicit agreement (G3, G4) | additive; existing rows stay null, meaning "joined before the disclosure", decided in D-2 |
| DB-2 | **`learning_point_state_transitions`** (append-only): `id, user_id, learning_point_id, learning_evidence_id (FK, nullable for replay rows), status_before, status_after, reason_after, confidence_before, confidence_after (decimal 4,3), engine_version, occurred_at (= evidence submitted_at), origin enum(live, replay, backfill)`; indexes `(user_id, learning_point_id, occurred_at)`, `(learning_point_id, occurred_at)` | Trajectory: last week, last month, before and after (§17). Written **only when status or reason changes, or confidence moves by at least ε** (D-8), which keeps it far smaller than the evidence table | new table |
| DB-3 | **`classroom_interventions`** + **`classroom_intervention_students`** (see §18 for columns) | INTERVENE and MEASURE | new tables |
| DB-4 | **Indexes:** `question_attempts (user_id, submitted_at)`; ship the V2 `learning_evidence (user_id, submitted_at)` | Time-windowed facts | index-only |

**Explicitly not added:**
- no `classroom_id` on evidence (attribution is computed from membership plus scope);
- no snapshot table;
- no teacher-side progress table (forbidden by `PROGRESS_MODEL.md`);
- no alert or signal table;
- no notification table.

**Candidate for later, not needed now:** an `attempt_group_id` on final-test evidence, so that one test sitting can be shown as one event. It is useful for the timeline but not required for signals. [DECISION D-9]

---

## 14. Recommended API changes

All new routes sit under the existing `/teacher` group: whole-number ids, camelCase JSON, the `{success, …}` envelope, and 422 `{reason}` refusals.

```text
# Modified (Phase 0)
GET  /teacher/classrooms/{id}/students                      + progress.class gate; no email
GET  /teacher/classrooms/{id}/progress                      no email; bounded success window
GET  /teacher/classrooms/{id}/students/{sid}/progress       ACTIVE member only; no email; scoped lastActivity
GET  /teacher/classrooms/{id}/students/{sid}/notebook[/…]   ACTIVE member only; archived notes per D-6
GET  /teacher/classrooms/{id}/learning-points/{code}        no email
GET  …/students/{sid}/learning-points/{code}/explanation    ACTIVE member only; cheap scope check
POST /student/classrooms/join {code|token, consent: true}   refuse without consent → 422 consent_required

# New
GET  /teacher/classrooms/{id}/learning-points                (no ?lesson → whole scope, grouped by lesson)   Phase 1
GET  /teacher/classrooms/{id}/students/{sid}/snapshot        Phase 2
GET  /teacher/classrooms/{id}/learning-points/{code}/trajectory?from=&to=   Phase 4 (class counts per week)
GET  /teacher/classrooms/{id}/students/{sid}/learning-points/{code}/trajectory   Phase 4
GET  /teacher/classrooms/{id}/signals                        Phase 5 (computed on read)
GET|POST /teacher/classrooms/{id}/interventions              Phase 6
GET|PATCH /teacher/classrooms/{id}/interventions/{iid}       Phase 6 (close, note); outcome embedded   Phase 7
GET  /student/recommendations  (existing RecommendationController [U])  + teacher-sourced items   Phase 7b
```

**Payload rules:**
- Identity only through `TeacherStudentPresenter`.
- Lists of students are sorted by **state**, then by name.
- Every signal carries `evidence[]` references (a point code, evidence ids or counts, a time window), so the UI can always answer «لماذا؟».

---

## 15. Recommended frontend changes

- **Reuse** `features/teacher/learningPoints/*` [U], `MasteryPill`, `ReasonChip`, `FreshnessMark`, `ConfidenceBar` and `lpBar.js`, the admin UI kit with Arabic label props (`DataTable`, `Modal`, `ConfirmDialog`), and `services/teacher/classGroupService.js`.
- **Remove the email everywhere** on teacher screens. Add an Arabic placeholder for students without a name.
- **Change the student join flow.** `Qism.jsx` stops auto-accepting and shows a **confirmation card** that names the teacher and the class and discloses what the teacher will see: progress, mastery, answers, notebook within the class's lessons. The consent is sent only on the explicit «أوافق وأنضمّ» click. The code-entry path shows the same disclosure.
- **Leave dialog:** keep its promise (it becomes true once G1 is fixed).
- **`ProgressTab`** becomes the overview: signals block, unit map, existing table (sort by name or state only).
- **`LearningPointsTab`:** add a «كل الدروس» option; add a trajectory strip in the drill-down; add a «تدخّل» button.
- **`StudentProgressPage`:** add the snapshot header, per-point transition sparklines and the bounded timeline.
- **New `InterventionsTab`** plus an `InterventionForm` that follows the documented pattern: it lives in `features/teacher/`, takes `onCreated`/`onCancel`, and is mounted in a `Modal`.
- **`StudentNotebookPage`:** add pagination.
- **Contract tests:** extend `pages/teacherContract.test.js` so no teacher page references `.email` of a student; add i18n keys in `teacher.json` with the six Arabic plural forms.
- **Charts:** trajectories are small inline SVG sparklines or step bars, drawn in code. No chart library is needed at this size.

---

## 16. Attention-signal architecture

### 16.1 Three layers, kept separate in code and in the UI

```text
FACTS          (raw, from tables; always displayable as-is)
   ↓ pure functions, config thresholds, unit-tested
INDICATORS     (derived, neutral, measurable: "3 transitions down in 14 days")
   ↓ explicit, versioned rules; never shown without the indicator + facts
INTERPRETATIONS (« تستحقّ نظرة » cards — phrased as invitations to look, not diagnoses)
```

- **The UI always shows the interpretation next to its indicator and a link to the facts.**
- **No signal is ever stored.** Nothing notifies, pushes or emails. Signals exist only while the teacher is looking.

### 16.2 Candidate signals, evaluated against existing data

"Data today?" answers whether the required data exists now. "History?" answers whether historical data is available. Every signal below comes from existing tables plus DB-2 (the transitions table); none needs a new event system.

| Candidate | Data today? | Where | Reliable? | History? | Needs new table? | False-positive risk | Show? | Kind |
|---|---|---|---|---|---|---|---|---|
| Point in `gap` | yes | SLPP.status | yes (V2) | current only | no | low; one early wrong answer from 0.5 can reach `gap` | yes | indicator |
| Low mastery **across the class** on one point | yes | GROUP BY SLPP (existing [U]) | yes | current | no | low; exclude `unassessed` from the denominator | **yes, the main one** | indicator → «X تلاميذ في ثغرة على …» |
| `mastered` but stale | yes | `last_success_at` / freshness | yes (derived) | — | no | medium; stale ≠ forgotten (D7) | yes, informational | indicator |
| **Declining** (mastered/reinforce → gap) | **no** | needs DB-2 | yes once DB-2 exists | DB-2 | **DB-2** | low | yes | indicator |
| Sudden regression (big drop within N days) | no | DB-2 | yes | DB-2 | DB-2 | medium; one bad sitting | informational | indicator |
| Repeated errors on the same point | yes | `learning_evidence` + pivot, outcome=incorrect, windowed | yes | yes (append-only) | no | medium; hard items | yes | fact → indicator |
| Repeated attempts without improvement | yes | `attempt_number`/`demonstration_kind` + SLPP unchanged; better with DB-2 | yes | evidence | no (better with DB-2) | medium | yes | indicator |
| Several **error notes** on the same point | yes (partial LP link) | `notebook_notes(user_id, learning_point_id, note_type)` | **weak**: editable, deletable, self-typed, partial link | no | no | **high** (a reflective student looks "weak") | **only inside the notebook screen, per student**; never a class signal (D-6) | fact |
| Low exercise accuracy | yes | `OutcomeStats` over question_attempts | yes | yes | no | medium; level mix | show as fact | fact |
| Low final-test performance | partly | evidence `assessment_type=assessment` (the attempt row is overwritten) | yes via evidence | yes via evidence | no (attempt_group_id nice-to-have) | low | yes | fact |
| Inactivity | yes, but platform-wide | `users.last_activity_at`; **scoped version**: MAX(evidence.submitted_at, practice) within effective lessons | yes when scoped | only "last" | no | **high**: homework may be on paper; offline queue delays | **informational only**, never an alert | fact |
| High activity but low mastery | yes | answers in window + SLPP | yes | yes | no | medium | yes; useful: "effort without progress" | indicator |
| Stalled progression (no new distinct items solved in N days while active) | yes | SLPP counters + DB-2 | yes | DB-2 | DB-2 | medium | yes | indicator |
| **Prerequisite weakness** (gap on a prerequisite of a weak point) | yes | `learning_point_prerequisites` + SLPP | yes | current | no | low | **yes**: tells the teacher *where* to intervene | indicator |
| Insufficient evidence / needs assessment | yes | `status_reason` | yes | current | no | none | yes, as "unknown, not weak" | fact |
| Class-wide difficulty on one point | yes | the class GROUP BY + evidence failure rate per item | yes | yes | no | low | **yes** | indicator |
| Time on task | **no** (D10) | — | — | — | would need instrumentation | — | **no** | — |

### 16.3 Threshold policy

- **No threshold is set in this plan.** Every indicator reads its parameters from `config/teacher_signals.php` (new), for example `window_days` and `min_students`.
- **Before any threshold is chosen,** validate the values on `DemoStudentSimulator` personas. They already exist and are deterministic: struggling, irregular, inactive, returning. Choose thresholds so that each persona triggers exactly what its story says. **[DECISION D-11]**
- **Signals carry a `ruleVersion`,** like the mastery engine, so a change is traceable.

### 16.4 Guardrails

- **Group, don't rank.** A class-level card says «5 تلاميذ» and opens the list. It never shows "the 5 weakest".
- **A signal never changes what the student sees or can do.**
- **Unknown is not weak.** `unassessed`, `insufficient_evidence` and `needs_assessment` are displayed as "not enough evidence yet", never as difficulty.
- **The notebook stays qualitative.** It never feeds signals at class level, and never feeds mastery (`NOTEBOOK.md`).

---

## 17. Historical-progress architecture

**Current answer:** "What was this student's progress on this point last week?" **cannot be answered** today.
- The SLPP row is overwritten, and there are no snapshots.
- `ReplayService` [U] has no *as-of* parameter.
- Even with one, the status depends on today's item registry, and final-test offline evidence is dated by its flush time.

### 17.1 Options considered

| Option | For | Against | Verdict |
|---|---|---|---|
| A. **Replay on demand** with `submitted_at ≤ T` | no new table | O(evidence) per student and point per request; a class trajectory means members × points replays; status depends on the **current** registry; not what the teacher saw at the time | Use **only for backfill** |
| B. Periodic snapshots (nightly or weekly SLPP copy) | simple reads | a scheduler that Hostinger may not run reliably ([UNKNOWN]: is a cron or queue worker active in production?); coarse; mostly duplicate rows | ✗ |
| C. **State-transition log written in `advance()`** (DB-2) | exact; records what was actually computed then (with `engine_version`); cheap (inside the existing transaction, only on change); answers "last week", "a month ago" and "before or after an intervention" by `occurred_at ≤ T`; enables "declining" and "stalled" | one more insert per changing point per evidence | ✅ **Recommended** |
| D. Generic learning-event table (`lesson_started`, `exercise_attempted`, …) | general | duplicates `learning_evidence`, `question_attempts`, `practice_sessions`, `student_lesson_progress.completed_at` and `admin_activity_logs`, which already exist | ✗ (see "What I would not build") |

### 17.2 How the Phase 7 conceptual event list maps to what exists

| Conceptual event | Existing equivalent |
|---|---|
| lesson_started | `student_lesson_progress.created_at` (first sync; approximate) |
| lesson_completed | `student_lesson_progress.completed_at` (server) |
| module_completed | **missing a timestamp** (JSON array). Accept this; a module-dates column is optional (D-9) |
| exercise_attempted / correct / incorrect | `question_attempts` + `learning_evidence.outcome` |
| assessment_completed | `learning_evidence` with `assessment_type=assessment` (no group id) |
| notebook_note_created | `notebook_notes.created_at` |
| learning_point_updated / mastery_changed | **DB-2** |
| intervention_created / completed | **DB-3** |
| joined / left the class | `admin_activity_logs` `classroom_member.*` + membership `joined_at`/`left_at` |

### 17.3 Reading trajectories

- **State of student S on point P at time T:** the last transition row with `occurred_at ≤ T`. With no row, the point was `unassessed` then.
- **Class trajectory for P:** for each Monday (in Africa/Algiers time) of the window, count members by the state at T. Members × weeks stays small; compute it in PHP from one query over transitions.
- **Engine-version changes:** a replay under a new engine writes `origin=replay` rows at the replay time. The UI marks such a jump as «إعادة حساب» instead of showing it as a real learning change.

### 17.4 Backfill

A one-off `smarter:mastery:transitions-backfill` command replays each (user, point) pair's evidence in order under the **current engine** and emits `origin=backfill` rows. The UI labels backfilled history as reconstructed. This reuses `ReplayService`; its only extension is emitting intermediate states instead of only the final one.

---

## 18. Intervention architecture

### 18.1 Model (DB-3)

```text
classroom_interventions
  id, classroom_id FK, teacher_id FK, learning_point_id FK nullable, lesson_id FK nullable,
  kind enum(monitor, class_session, recommend_practice, recommend_module, review_prerequisite, observation),
  note text nullable (teacher-private),
  status enum(open, closed), opened_at, closed_at nullable, review_after (date, nullable: « راجِع بعد … »),
  baseline JSON  — frozen at creation: per target student {status, reason, confidence, distinctItemsSuccess,
                   lastSuccessAt}, + class counts for the LP; rule/engine versions
  timestamps
classroom_intervention_students
  intervention_id FK, student_id FK, UNIQUE(intervention_id, student_id)
```

- **The baseline is frozen when the intervention is created.** MEASURE is then possible **without** the history table. DB-2 adds the curve *between* the two points.
- **Authorization:** only the owning teacher can see or modify an intervention. Target students must be **active members** when it is created. If a student later leaves, they disappear from the outcome view, following the G1 rule.
- **Writes to `admin_activity_logs`** (`classroom_intervention.created/closed`) reuse the existing audit.

### 18.2 The loop

```text
DETECT     signal card or LP drill-down  («7 تلاميذ في ثغرة على P»)
UNDERSTAND LP drill-down → per-student explanation (existing MasteryExplainer) → notebook (per student) → prerequisite status
INTERVENE  « تدخّل » → choose kind + students (pre-selected from the signal) + optional note + review date
MEASURE    intervention card: baseline vs now per student (status transitions since opened_at from DB-2),
           evidence produced since (count, success rate on P — FACTS), « لا دليل جديد بعد » when nothing happened
```

### 18.3 What each kind needs

| Kind | Works with existing architecture? | Needs |
|---|---|---|
| `monitor`, `class_session`, `observation` | **Yes.** Teacher-side only; measurement reads existing evidence | DB-3 only |
| `recommend_practice` / `recommend_module` / `review_prerequisite` | **Partly.** `RecommendationService` and `GET /student/recommendations` [U] exist for students | A student-visible surface for teacher-sourced recommendations. It is a **soft** recommendation (D8, never a lock), shown as «يقترح عليك أستاذك…». This is the first teacher → student write channel ever, so it needs its own decision (D-12) |
| "Assign exercises" with due dates, grading or completion tracking | **No.** No assignment concept exists | ✗ Not recommended now (see "What I would not build") |

**The outcome is descriptive, never causal.** The UI says «منذ التدخّل: 4 من 7 انتقلوا من ثغرة إلى تدعيم». It never says «التدخّل نجح». Other causes (homework, the textbook, other classes) cannot be excluded.

---

## 19. Complete phased implementation plan

The phases are ordered by **dependency**. Each one can be tested and shipped on its own.

### Phase 0: Foundation, V2 landing and privacy fixes

- **Objective:** make the base trustworthy and the privacy rule true.
- **Backend:**
  - Commit and deploy Mastery V2. This means migrations `2026_09_28_*`, running `smarter:import-content-registry` on each environment, and deciding on `accept_legacy_evidence_payload`.
  - `ClassroomAccess::activeMember`, used by the dossier, notebook and explanation endpoints (G1).
  - `TeacherStudentPresenter`; remove email from `ClassroomProgressService` and `ClassroomLearningPointService` (G2).
  - Consent on join (DB-1) with a 422 `consent_required` refusal (G3, G4).
  - Feature gate on `/students` (G8).
  - Archived-class read policy (G5, D-5).
  - Seat re-check on restore (G6).
  - Archived-notes policy (G7, D-6).
  - Scoped `lastActivityAt` (G9).
  - Remove the email from the invitation preview (G10).
- **Frontend:**
  - Remove email from the four teacher components.
  - Join confirmation card with disclosure in `Qism.jsx`, on both the code path and the token path.
  - Notebook disclosure line in the student notebook and in «قسمي».
- **Database:** DB-1.
- **Tests:**
  - Left or removed student → 404 on every per-student route.
  - Email-absence contract test over all `/teacher/*` responses.
  - Join without consent → 422.
  - Token path requires the click (e2e).
  - Archived-class policy, seat restore, invitation preview.
- **Migration/backfill:** existing memberships have `consented_at = null`. D-2 decides whether to re-ask at next login («تأكيد المشاركة») or to grandfather them.
- **Dependencies:** none.
- **Risks:** V2 deploy on Hostinger (migration run, registry import). If the registry is empty, V2 final-test evidence is **refused with 422** and sits in the student's offline queue. Import the registry **before** switching the client.

### Phase 1: Class overview across the whole scope (DETECT, A and D)

- **Backend:**
  - `ClassroomLearningPointService::scopeOverview`: one `GROUP BY` over all effective lessons.
  - Bounded class success window (P1).
- **Frontend:**
  - «كل الدروس» option in the Learning Points tab.
  - Unit map on the progress tab.
  - Sorting by name or state only.
- **API:** `GET …/learning-points` without `?lesson`.
- **Tests:**
  - Query count stays constant as class size grows (extend `MasteryScaleTest` to 10 and 45 students, and to 1 and 9 lessons).
  - Scope excludes hidden lessons, other grades, and members who left.
- **Dependencies:** Phase 0.
- **Risks:** a payload of lessons × points is fine at up to about 180 points.

### Phase 2: Student snapshot (UNDERSTAND, B, C and E)

- **Backend:**
  - `GET …/students/{sid}/snapshot`, composed from `StudentDossier` plus windowed facts.
  - Fix P2 and P3 (bounded timeline, a join instead of `EXISTS`).
  - Fix P4 (a cheap scope check for the explanation).
  - `TimeWindow` in Africa/Algiers.
- **Frontend:** snapshot header on `StudentProgressPage`; notebook pagination (P8).
- **Database:** DB-4 (index on `question_attempts`).
- **Tests:**
  - Snapshot facts against seeded personas.
  - Time-window boundaries at 00:00 in Algiers.
  - Unit tests for `TimeWindow`.
- **Dependencies:** Phase 0.

### Phase 3: Historical progression (F)

- **Backend:**
  - DB-2 table.
  - `ProgressEngine::advance` appends a transition when the state changes, inside the existing transaction.
  - `ReplayService` emits intermediate states.
  - Backfill command.
  - Trajectory reads, per student and point and per class and point.
- **Frontend:** per-point step-sparkline in the dossier; class trajectory strip in the drill-down; «إعادة حساب» and «مُعاد بناؤه» markers.
- **API:** the two `…/trajectory` routes.
- **Tests:**
  - A transition is written only on a real change.
  - Idempotent evidence writes no second transition.
  - Replay and backfill rows are labelled.
  - The as-of state equals a replay truncated at T, for the demo personas.
  - Write-path overhead is at most one extra insert.
- **Migration/backfill:** run the backfill after deploy, as a batched Artisan command. [UNKNOWN] whether Hostinger allows long-running Artisan; it may need to be chunked by user.
- **Dependencies:** Phase 0 (V2 must be live, otherwise the transitions record V1 semantics).
- **Risks:** `occurred_at` for offline final-test evidence is the flush time. Document it, or add a client `answeredAt` to the evidence payload (D-13).

### Phase 4: Attention signals (DETECT and UNDERSTAND, B and C)

- **Backend:**
  - `ClassroomSignals` (pure functions over preloaded facts) plus `config/teacher_signals.php` with `ruleVersion`.
  - Only the signals marked "yes" in §16.2.
  - Each signal returns `{type, ruleVersion, scope (class|student), learningPoint?, students[], indicator{…}, evidence{…}}`.
- **Frontend:** «تستحقّ نظرة» block on the overview and in the snapshot, with «لماذا؟» → evidence.
- **API:** `GET …/signals`.
- **Tests:**
  - Per-signal unit tests on synthetic fact sets, including negative cases where unknown must not count as weak.
  - Persona-based expectations on the demo dataset.
  - No signal names or ranks an ordinal position.
- **Dependencies:** Phases 1 to 3. Declining, regression and stalled need the transitions table; the others could ship earlier if needed.
- **Risks:** false positives. Mitigate with neutral wording, informational styling, persona calibration and teacher feedback before any threshold tuning.

### Phase 5: Intervention workflow (G)

- **Backend:** DB-3; `ClassroomInterventionService` (create with a frozen baseline, list, close); audit log; feature key `interventions`.
- **Frontend:** «تدخّل» from the drill-down and signal cards; `InterventionForm` in a `Modal`; new `InterventionsTab`.
- **API:** `GET|POST|PATCH …/interventions`.
- **Tests:**
  - Owner-only access (another teacher gets 403 and the intervention stays invisible).
  - Only active members can be targeted.
  - The baseline is frozen and immutable.
  - A student who leaves disappears from the view.
  - No email in the payload.
- **Kinds shipped here:** `monitor`, `class_session`, `observation` (teacher-side only).
- **Dependencies:** Phase 0; the baseline uses current state only, so Phase 3 is not strictly needed.

### Phase 6: Intervention outcome measurement (H)

- **Backend:** outcome computed on read: baseline vs current per student, transitions since `opened_at` (DB-2), evidence since (facts).
- **Frontend:** outcome panel on each intervention; «لا دليل جديد بعد»; a review-date reminder shown **in the app only**.
- **Tests:** outcomes against scripted evidence after an intervention; wording is descriptive, never causal.
- **Dependencies:** Phases 3 and 5.

### Phase 7 (optional, after owner decision D-12): teacher-sourced recommendations to students

- **Backend:** `RecommendationService` merges open interventions of kind `recommend_*` targeting the student into its output (source `teacher`).
- **Frontend:** a soft card «يقترح عليك أستاذك…» on the student side. It never locks and can be dismissed.
- **Tests:** only targeted, active students see it; closing the intervention removes it; no gate is created (D8).
- **Dependencies:** Phase 5.

### Phase 8: Performance and security hardening, then documentation closure

- Scale tests on class size, evidence volume and number of classes.
- Audit teacher notebook reads (G12) as `admin_activity_logs` `teacher.notebook_read`, sampled or daily-deduplicated.
- The admin N+1 fixes (separate ticket).
- Sync the docs listed in Appendix B.

---

## 20. Testing strategy

**Backend feature tests** (`apps/api/tests/Feature`, MySQL, `php artisan test -c phpunit.local.xml`, **one run at a time**, never create databases unasked):
- **Extend** `ClassroomProgressTest`, `ClassroomLearningPointTest` [U], `TeacherClassroomNotebookTest` and `TeacherAuthorizationTest`.
- **New:**
  - `TeacherPrivacyContractTest`: no email anywhere; left, removed and archived handling; consent.
  - `ClassroomScopeOverviewTest`
  - `StudentSnapshotTest`
  - `LearningPointTransitionTest`
  - `ClassroomSignalsTest`
  - `ClassroomInterventionTest`
  - `InterventionOutcomeTest`
- **Use** `Tests\Support\CommercialFixtures::withToken` whenever one test switches between users, because of the Sanctum guard cache.

**Unit tests** (pure, no database):
- `TimeWindow`;
- each signal rule;
- outcome computation;
- the transition-emission rule (change detection, ε).

**Scale tests:** extend `tests/Feature/Scale/MasteryScaleTest` to vary **class size and evidence volume**, and assert query counts stay constant.

**Frontend** (vitest):
- `teacherContract.test.js` (no `.email`, no French defaults);
- signal-card wording and grouping (no rank);
- join-consent state machine;
- sparkline geometry.

**E2E** (`apps/web/e2e`):
- the join flow requires a click (token and code paths);
- a teacher loses access after the student leaves;
- overview → drill-down → intervention → outcome.
- Use the `qa-eleve@smarter.dz` fixture. `/auth/login` is limited to 6 requests per minute, so log in once and reuse `storageState`.

**Calibration:** a scripted run over `DemoStudentSimulator` personas asserting which signals each persona triggers. This becomes the regression net for threshold changes.

---

## 21. Migration and backfill strategy

1. **V2 first.**
   - Apply `2026_09_28_000001…000005`.
   - Run `smarter:import-content-registry`.
   - Run `smarter:evidence:backfill` to fill V2 columns on old evidence.
   - Run `smarter:mastery:replay --dry-run --report`, review the report, then run it for real. Existing SLPP rows also move to engine 2 lazily on their next write.
   - Deploy follows the documented CI flow: backup, then migrate (`docs/deployment`). Hostinger disables `proc_open`, so keep the fallback in mind.
2. **DB-1 consent columns:** additive and nullable. Apply the D-2 policy for existing members.
3. **DB-2 transitions:** create the table, deploy the write path, **then** run the backfill. The command is chunked by user and idempotent; it deletes and re-inserts that user's `origin=backfill` rows, and never touches `live` rows.
4. **DB-3 interventions:** new tables, no backfill.
5. **DB-4 index:** online index creation on `question_attempts`. Check the table size before running it in production.
6. **Rollback:** each phase is additive. Removing a feature leaves tables unused, and no existing column changes meaning.

---

## 22. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Building on uncommitted V2, or shipping teacher views on V1 | Phase 0 lands V2; teacher mastery screens are gated on `engine_version = 2` rows |
| Privacy regression in new endpoints | One gate (`ClassroomAccess`), one presenter, contract tests over every `/teacher/*` route |
| Signals turn into labels ("weak student") or rankings | Facts, indicators and interpretations separated; group not rank; neutral wording; unknown ≠ weak; never shown to students |
| False positives erode trust | Persona calibration, informational styling, `ruleVersion`, no notifications |
| Notebook chilling effect (students stop writing errors) | Notebook stays per-student and qualitative; disclosure is explicit; no class-level notebook counts (D-6) |
| Trajectory distorted by engine changes, offline flush dates or registry drift | `origin` and `engine_version` on transitions; «إعادة حساب» marker; optional `answeredAt` (D-13) |
| Hostinger limits (no reliable worker or cron, no `proc_open`) | Everything computed on read or inside the request transaction; only the backfill is a one-off command |
| Scope creep toward an analytics platform | "What I would not build" list; every screen must name the teacher question it answers |
| Class attribution ambiguity (history before joining) | Explicit D-3 decision and a documented rule |

---

## 23. Files likely to be modified

**API** (`apps/api/`)
- `routes/api.php`
- `app/Domain/Classroom/ClassroomProgressService.php`
- `app/Domain/Classroom/ClassroomLearningPointService.php` [U]
- `app/Domain/Classroom/ClassroomMembershipService.php` (consent)
- `app/Domain/Classroom/ClassroomService.php` (restore seat check, archived policy)
- `app/Domain/Classroom/ClassroomInvitationService.php` (preview without email)
- `app/Domain/Classroom/StudyContextService.php` (archived classes visible to the student, D-5)
- `app/Domain/Progress/ProgressEngine.php` [U] (transitions)
- `app/Domain/Progress/Replay/ReplayService.php` [U] (intermediate states)
- `app/Domain/Progress/StudentDossier.php` (bounded timeline, join)
- `app/Domain/Practice/NotebookService.php` (archived-notes policy for readers)
- `app/Http/Controllers/Teacher/TeacherClassroomStudentController.php`
- `app/Http/Controllers/Teacher/TeacherClassroomNotebookController.php`
- `app/Http/Controllers/Teacher/TeacherClassroomLearningPointController.php` [U]
- `app/Http/Controllers/Teacher/TeacherDashboardController.php` (double `usage()`)
- `app/Http/Controllers/StudentClassroomController.php` (consent)
- `app/Models/ClassroomMembership.php`
- `app/Domain/Plans/*` feature registry (the `interventions` key)
- `database/seeders/PlanSeeder.php`
- `database/seeders/Demo/DemoStudentSimulator.php` (interventions and transitions in the demo)
- Tests: `tests/Feature/{ClassroomProgressTest, ClassroomLearningPointTest, TeacherClassroomNotebookTest, TeacherAuthorizationTest, ClassroomInvitationTest, ClassroomJoinCodeTest}.php`, `tests/Feature/Scale/MasteryScaleTest.php`

**Web** (`apps/web/src/`)
- `pages/student/Qism.jsx`
- `pages/JoinInvitation.jsx`
- `pages/teacher/StudentProgressPage.jsx`
- `pages/teacher/StudentNotebookPage.jsx`
- `features/teacher/members/MembersTab.jsx`
- `features/teacher/progress/ProgressTab.jsx`
- `features/teacher/learningPoints/{LearningPointsTab, LearningPointDrilldown, MasteryExplanationPanel}.jsx` [U]
- `pages/teacher/ClassGroupDetail.jsx` (new tab)
- `services/teacher/classGroupService.js`
- `services/studyContextService.js`
- `i18n` `teacher.json`, `student.json`
- `pages/teacherContract.test.js`
- `pages/legal/Confidentialite.jsx`

Paths of the teacher progress and members tabs are to be confirmed; the audit cited them by component name.

**Docs**
- `docs/architecture/TEACHER_CLASSROOM_ARCHITECTURE.md` (§4, §8, §10, §12, §13)
- `LEARNING_ARCHITECTURE.md` (transitions, replay intermediate states)
- `PROGRESS_MODEL.md` ("Who reads progress": the notebook *is* read, by the teacher; transitions)
- `NOTEBOOK.md` (archived policy, disclosure)
- `DEMO_DATASET.md`
- `docs/README.md` (authoritative table row for interventions and signals)

---

## 24. New files likely to be created

**API**
- `app/Domain/Classroom/ClassroomAccess.php`
- `app/Domain/Classroom/TeacherStudentPresenter.php`
- `app/Domain/Classroom/ClassroomSignals.php` (+ `Signals/*Rule.php`, one per signal, if it grows)
- `app/Domain/Classroom/ClassroomInterventionService.php`
- `app/Domain/Classroom/InterventionOutcome.php`
- `app/Domain/Progress/Support/TimeWindow.php`
- `app/Domain/Progress/TransitionRecorder.php`
- `app/Models/LearningPointStateTransition.php`
- `app/Models/ClassroomIntervention.php`
- `app/Http/Controllers/Teacher/TeacherClassroomSignalController.php`
- `app/Http/Controllers/Teacher/TeacherClassroomInterventionController.php`
- `app/Http/Controllers/Teacher/TeacherClassroomTrajectoryController.php`
- `app/Console/Commands/MasteryTransitionsBackfill.php`
- `config/teacher_signals.php`
- Tests: `TeacherPrivacyContractTest`, `ClassroomScopeOverviewTest`, `StudentSnapshotTest`, `LearningPointTransitionTest`, `ClassroomSignalsTest` (unit + feature), `ClassroomInterventionTest`, `InterventionOutcomeTest`, `Unit/Progress/TimeWindowTest`

**Web**
- `features/teacher/overview/{AttentionCards, UnitMap}.jsx`
- `features/teacher/snapshot/StudentSnapshot.jsx`
- `features/teacher/trajectory/{Sparkline, ClassTrajectory}.jsx`
- `features/teacher/interventions/{InterventionsTab, InterventionForm, InterventionOutcome}.jsx`
- `features/student/classJoin/JoinConsentCard.jsx`
- Tests next to each.

**Docs**
- **None required.** Extend the existing authoritative documents rather than creating new ones. An `INTERVENTIONS` section belongs in `TEACHER_CLASSROOM_ARCHITECTURE.md`.

---

## 25. Database migrations likely required

1. The 5 existing uncommitted V2 migrations `2026_09_28_000001…000005`. **Commit them.** They are dated four days in the future; check the ordering relative to any migration added before they land.
2. `add_consent_to_classroom_memberships_table` (`consented_at`, `consent_version`).
3. `create_learning_point_state_transitions_table`.
4. `create_classroom_interventions_table` + `create_classroom_intervention_students_table`.
5. `add_user_submitted_at_index_to_question_attempts_table`.
6. *(Optional, D-9 or D-13)* `add_attempt_group_id_to_learning_evidence_table` / client `answered_at`.

Production follows the documented deploy (backup, then migrate in CI). Mirror each migration in the replayable SQL file only if that mechanism is still used for Hostinger.

---

## 26. Acceptance criteria for the complete system

**Privacy**
- [ ] No `/teacher/*` response contains a student's email, proved by the contract test.
- [ ] A student who left, was removed, or is in an archived class (per D-5) returns 404 on every per-student teacher endpoint.
- [ ] Joining a class requires an explicit click on a disclosure naming progress, mastery, answers and notebook; `consented_at` and `consent_version` are stored.
- [ ] The student is told, in «قسمي» and in the notebook, what the teacher can read.

**DETECT**
- [ ] A teacher sees, for the whole class scope, how many students are in each state for each Learning Point, in one screen, in ≤ 20 queries whatever the class size.
- [ ] «تستحقّ نظرة» lists only rule-versioned signals, each with its indicator and a link to evidence; none ranks students.

**UNDERSTAND**
- [ ] From any signal, in at most 2 clicks, the teacher reaches the students concerned, each student's explanation (the same one the student sees), and that student's notebook (per student, scoped).
- [ ] The student snapshot shows only facts and their time window, in Algerian local time.

**F (what changed)**
- [ ] For any student and point, the state at any past date since the V2 launch is available. Earlier history is labelled reconstructed.
- [ ] Class trajectory per point by week.

**INTERVENE**
- [ ] A teacher can create an intervention on a point for selected active students, with a note and review date. The baseline is frozen.

**MEASURE**
- [ ] Each intervention shows baseline vs now, transitions since, and evidence since, in descriptive (non-causal) language, including «لا دليل جديد بعد».

**Integrity**
- [ ] Mastery semantics are unchanged: no signal, intervention or notebook data feeds mastery.
- [ ] No student-visible behaviour changes except the join consent and, if D-12 is accepted, soft teacher recommendations.
- [ ] All docs in §23 updated.

---

## RECOMMENDED IMPLEMENTATION ORDER

| # | Phase | Why this position |
|---|---|---|
| 1 | **Phase 0: land Mastery V2 and fix G1–G4** (then G5–G10) | Nothing built on V1 is pedagogically trustworthy. The current teacher surface already breaks the stated privacy rule, and every later phase adds teacher reads, which would multiply the leak |
| 2 | **Phase 1: class overview across the whole scope** | Cheapest, highest-value DETECT gain. It reuses the existing `GROUP BY`, needs no new table, and answers A and D |
| 3 | **Phase 2: student snapshot + dossier performance fixes** | Completes UNDERSTAND for B, C and E with existing data. It is also where the time-window helper is introduced |
| 4 | **Phase 3: state transitions (history)** | The only real missing capability. It must exist **before** signals such as "declining" or "stalled" and before MEASURE curves. The earlier it ships, the more **real** (not reconstructed) history accumulates |
| 5 | **Phase 5: interventions (teacher-side kinds)** | Independent of signals thanks to the frozen baseline. It can run in parallel with Phase 4 |
| 6 | **Phase 4: attention signals** | Needs the facts (Phases 1–2) and history (Phase 3), plus persona calibration. Shipping it last among the core phases avoids premature thresholds |
| 7 | **Phase 6: outcome measurement** | Needs interventions and transitions |
| 8 | **Phase 7: teacher-sourced soft recommendations** (only if D-12 is accepted) | The first teacher → student channel. A product decision, not a technical dependency |
| 9 | **Phase 8: hardening and documentation closure** | Scale tests, notebook-read audit, admin N+1 ticket |

This moves the brief's "historical progression" **before** "attention signals", and interventions before signals. The actual dependencies require it: signals need history, and interventions do not need signals.

---

## CRITICAL ARCHITECTURAL DECISIONS

These must be agreed before implementation begins.

| # | Decision | Recommendation |
|---|---|---|
| **D-1** | **Is Mastery V2 the basis?** Commit, deploy and replay before any teacher monitoring work | **Yes.** V1's "mastered" can come from one client-judged answer |
| **D-2** | **Consent for existing members:** re-ask at next login, or grandfather | Re-ask once («أستاذك يتابع… هل توافق؟»). Refusing means leaving the class. The notebook rule changed after they joined |
| **D-3** | **Class attribution:** does the teacher see all history in the class's lessons, or only since `joined_at`? | All history in scope (a teacher needs the real state), **disclosed** in the consent text. Trajectories and outcomes are naturally windowed |
| **D-4** | **Email:** removed from all teacher surfaces with no exception; the empty-name fallback is a neutral placeholder | Yes. Also consider making first and last name required for students joining a class |
| **D-5** | **Archived class:** can the teacher still read the students' data? | Read-only access to **aggregates** is allowed; per-student reads stop. The student sees archived classes in «قسمي» and can leave them |
| **D-6** | **Notebook in monitoring:** are archived notes private? Is a class-level notebook aggregate ever allowed? | Archived notes are private to the student. **No class-level notebook aggregate.** Per-student notebook stays a separate screen |
| **D-7** | **Teacher observations:** private to the teacher, or visible to the student? | Private to the teacher. Students have a right to know they exist: mention it in the disclosure. Never shown to other teachers or admins except through legal export |
| **D-8** | **Transition granularity:** write on status or reason change only, or also on confidence change ≥ ε? | Status or reason change **plus** a confidence change of at least 0.05, so the curves are meaningful without matching evidence volume |
| **D-9** | Is a **final-test attempt group id** and/or **per-module completion timestamps** worth adding now? | Not now. Revisit if the timeline needs it |
| **D-10** | **Plan gating:** are signals and interventions part of `progress.class` (free plan), or of a paid key (`analytics.advanced` already exists with no consumer)? | Signals under `progress.class` (pedagogy should not be paywalled); interventions and history under `analytics.advanced`. This is a commercial decision |
| **D-11** | **Signal thresholds:** who sets them, and how are they validated? | Config + `ruleVersion`, calibrated on demo personas, reviewed by a teacher before launch |
| **D-12** | **Teacher → student channel:** may a teacher push a recommendation into the student's space? | Yes, as a **soft, dismissible** suggestion reusing `RecommendationService`. Never a lock, never a due date |
| **D-13** | **Evidence time:** add a client `answeredAt` for offline-queued final tests (bounded, validated), or accept flush time? | Accept flush time for now and document it; revisit if trajectories look wrong |
| **D-14** | **Local time:** all teacher-facing day and week buckets use Africa/Algiers | Yes. `TimeWindow` owns it; storage stays UTC |
| **D-15** | **Notebook-read audit trail** (G12): log teacher reads of notebooks? | Yes, deduplicated per teacher, student and day, in `admin_activity_logs` |

---

## WHAT I WOULD NOT BUILD

| Tempting feature | Why not now |
|---|---|
| **A generic learning-event table** (`lesson_started`, `exercise_attempted`, …) | Duplicates `learning_evidence`, `question_attempts`, `practice_sessions`, `student_lesson_progress` and `admin_activity_logs`. The one real gap is the state transition, and DB-2 fills it |
| **Nightly snapshots or materialised aggregates** | Class queries are cheap (one `GROUP BY` over about 8k rows); the cache store is the database; Hostinger scheduling is uncertain |
| **Stored alerts, an alert inbox, email or push notifications** | Signals should exist only while the teacher is looking. Stored alerts need resolution states, deduplication and delivery, and they create pressure and noise |
| **A class average mastery % or a class "score"** | Contradicts `PROGRESS_MODEL.md` ("a COUNT, never a score"); mixes the 0.5 baseline, missing rows and minimum-evidence rules |
| **Student rankings, leaderboards, "top/bottom 5", percentile** | Out of product scope (pedagogy, not competition); the lists are grouped by state |
| **A predictive "at-risk" score or ML model** | Unexplainable to a teacher, no ground truth, and the explainable signals already cover the need |
| **Mastery decay / forgetting curves** | Explicitly rejected (D7). Freshness is the honest version |
| **Time-on-task tracking** | Not collected (D10); unreliable for a paper-and-screen class; privacy cost |
| **Full assignments** (due dates, grading, submission tracking, auto-grading of homework) | A second product. Soft recommendations (Phase 7) cover the pedagogical need |
| **Teacher annotations inside the student's notebook** | The notebook belongs to the student (`NOTEBOOK.md`); teacher observations live in the teacher's space |
| **Notebook-derived class signals** ("5 students wrote error notes on P") | Editable, self-typed, partial point link; high risk of chilling the reflective use |
| **Cross-class or school-level analytics dashboards** | No institution model exists yet (`Model C` is `Planned`); the teacher question is about *their* class |
| **Exportable reports (PDF or Excel)** | `reports.export` is declared but has no consumer. Wait until teachers ask, with privacy review |
| **Class attribution on evidence (`classroom_id` columns)** | Membership × scope already answers it; a column would go wrong the moment a student is in two classes |
| **Teacher-entered offline marks as mastery evidence** | Breaks the trust boundary of the engine (server-judged items only). Could be a future, separate source type, with its own decision |

---

## Appendix A: documentation map (authority for this area)

| Area | Authoritative document | Notes |
|---|---|---|
| Teacher, classes, membership, invitations, visibility, teacher progress views, teacher API, plans and feature keys | `docs/architecture/TEACHER_CLASSROOM_ARCHITECTURE.md` | §4 progress views, §8 and 8a teacher space, §10 API, §12 owning tests, §13 Planned |
| Mastery model (V2), evidence flow, trust boundary, item registry, replay, freshness, D1–D10 | `docs/architecture/LEARNING_ARCHITECTURE.md` | **uncommitted** edits describe V2 |
| Completion vs mastery, progress storage and sync, "who reads progress" | `docs/architecture/PROGRESS_MODEL.md` | stale on the notebook (Appendix B) |
| Notebook, including teacher read access | `docs/architecture/NOTEBOOK.md` | authoritative since 2026-09-24 |
| Exercise validation, practice engine, answer keys | `docs/architecture/EXERCISE_CONTRACT.md` | |
| Hierarchy, lesson, module, Learning Point contract | `docs/architecture/LESSON_CONTRACT.md` | |
| Question metadata and point roles | `docs/architecture/AI_LESSON_CONTRACT.md` | primary/secondary rules |
| `requires` / `priorKnowledge` (static knowledge deps) | `docs/architecture/KNOWLEDGE_DEPENDENCY.md` | not the DB point prerequisites |
| Admin analytics and panel | `docs/architecture/ADMIN_PANEL_ARCHITECTURE.md` | |
| Demo personas and dataset | `docs/architecture/DEMO_DATASET.md` | useful for calibration |
| Product scope and access model | `docs/ALGERIA_PLATFORM_MASTER_SPEC.md` | |
| Historical only | `docs/reports/LEARNING_POINT_MASTERY_AUDIT_2026-09-24.md`, `…_V2_EXECUTION_PLAN_…` | the plan's header lists deviations |

**Terminology to keep:** القسم / `classroom` (backend) / `classGroup` (frontend); نقاط التعلّم / Learning Point; الوحدة (unit); المحور (module); كرّاسي (notebook); وضع القسم (Classroom Mode, a presentation layer and **not** this feature); status names `mastered / reinforce / gap / unassessed`; reasons `insufficient_evidence / needs_assessment`; freshness `fresh / aging / stale`; "evidence" (`learning_evidence`); "effective lessons".

**New terms this plan introduces, and only these:**
- **signal** («تستحقّ نظرة»)
- **intervention** («تدخّل»)
- **state transition**
- **snapshot** («لمحة»)

---

## Appendix B: documentation drift found during the audit

These are to fix in the same task as the related phase, per the Documentation Synchronization Rule.

1. `LEARNING_ARCHITECTURE.md` and `PROGRESS_MODEL.md` describe V2 as live; `HEAD` runs V1. This resolves itself when V2 is committed.
2. `PROGRESS_MODEL.md` "Who reads progress" still says the notebook is never read. `NOTEBOOK.md` (since 2026-09-24) says the teacher reads it.
3. `NOTEBOOK.md:47-48` promises that leaving or removal ends teacher reads. The code does not enforce it (G1); this is a code fix, not a doc fix.
4. `DEMO_DATASET.md` says mastery is replayed "par MasteryModel". It now goes through `ProgressEngine`.
5. Undocumented: `learning_point_prerequisites.required_mastery` is stored but unused.
6. Undocumented: a secondary-role success increments `distinct_items_success` and `assessment_success_count`.
7. Freshness source inconsistency:
   - `Freshness::of` uses `last_evidence_at`;
   - the class `staleMastered` uses `COALESCE(last_success_at, last_evidence_at)`;
   - the V2 plan mentions all three.

   Pick one and document it.
8. The notebook migration docblock says a note «n'est jamais supprimée», but hard delete exists.

---

*Documentation Sync:* this report was added to `docs/reports/` and indexed in `docs/README.md` § « Reference material » as **a plan awaiting review, not a contract**. No architecture document was changed, because no behaviour was implemented. The drift listed in Appendix B should be fixed alongside the phases that touch those areas.
