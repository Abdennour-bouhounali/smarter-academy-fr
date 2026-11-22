# Progress Model

> **Two progressions, two vocabularies (Mastery V2, 2026-09-24).**
> **Completion** answers « did the student go through the material? » —
> modules done, lessons done, percentages. **Mastery** answers « what does the
> student actually know about each Learning Point? » — the evidence-driven
> state in `student_learning_point_progress`, owned by
> [`LEARNING_ARCHITECTURE.md`](./LEARNING_ARCHITECTURE.md) § « Mastery model
> (V2) ». They are two tables, two APIs, and — since 2026-09-24 — two sets of
> words: completion never says إتقان / متحكَّم (« أنهيت مسار الدرس ✓ »), and the
> four mastery states have ONE label set (`student:mastery.*`).
>
> Still true from the 2026-09-20 corrections: the lesson-completion
> denominator is `modules.length` (registry); module `0` counts like any other
> module (`isValidModuleNumber`); `completion_mode` is recorded once and the
> client still never sends `'mastery'` (every completion is `'path'`) — the
> claim « this student masters the lesson » is made by the Learning Point
> states, not by this column. XP is still client-only.

The cleanup phase unified *how* completion percentage is calculated (one pure function, `calculateCompletionPercentage`, replacing four divergent formulas). This document defines *what* completion means at each level, and draws the line between completion and mastery that the codebase currently blurs.

## The two progressions (and their two tables)

The pedagogical vision distinguishes **lesson progression** (where the student
is within a lesson's journey) from **knowledge progression** (what they have
demonstrated per Learning Point). These are two separate server-side tables,
never merged:

| | Lesson progression | Knowledge progression |
|---|---|---|
| Table | `student_lesson_progress` | `student_learning_point_progress` |
| Granularity | lesson (status, current module, completed modules) | learning point (confidence 0–1, mastered/reinforce/gap) |
| Written by | `PUT /api/v1/lessons/{code}/progress` (`LessonProgressService`) | `POST /api/v1/lessons/{code}/evidence` (`ProgressEngine`) |
| Read by | `GET /api/v1/students/me/lesson-progress` | `GET /api/v1/students/me/learning-profile` |
| Fed from | `useProgress` → `progressQueue.js` (debounced snapshots) | `useEvidenceSubmission` (evaluation questions only) |

**Completion is not mastery** — a student can complete every module without
mastering a Learning Point, and vice versa.

### Cross-device merge semantics (`LessonProgressService::upsert`)

- `completed_modules` → **union**: merging never removes a completion, which
  makes offline-queue replays and multi-device races safe.
- `current_module` + `last_activity_at` → **latest wins**: only a snapshot
  whose `lastActivityAt` is at or after the stored one may move the position.
- `status` → **monotonic**: `in_progress → completed` only; `completed_at` is
  set once and never cleared.
- `completion_mode` → recorded once with `completed_at`: `'path'` (the
  student followed the journey to the final evaluation — the default) or
  `'mastery'` (the always-open final evaluation demonstrated mastery
  directly, the "Je pense déjà maîtriser" path). Later snapshots cannot
  rewrite it. The client never sends `'mastery'` today (every completion is
  `'path'`), and the column is not a mastery claim: whether a student KNOWS
  the lesson's points is `student_learning_point_progress`, judged by the
  server since Mastery V2.

### localStorage is a cache, not the source of truth

`smarter_lesson_{id}` remains the synchronous read path and the offline
cache. For authenticated students, every module write schedules a debounced
push (`progressQueue.js`, last-snapshot-wins per lesson) and the server's
merged answer is folded back into storage. On login and app start,
`useLessonProgressSync` (mounted once in `App.jsx`) hydrates storage from
`GET /students/me/lesson-progress` — **asynchronously**: a lesson page opened
before it lands reads the local cache first, and `useProgress` re-reads
storage when `LESSON_PROGRESS_SYNCED_EVENT` fires (2026-09-29; before, a
direct link on a fresh device showed 0 % and locked modules until a remount).
The same hook then flushes the parked progress snapshots AND the parked
final-test evidence (`flushEvidenceQueue`), and again on every `online` event.
Anonymous visitors stay purely local: a snapshot parked while anonymous lives
under the `u_anon_` storage prefix and is not carried over at login.

**A flush never loses a newer snapshot** (2026-09-29). Both queues re-read
storage before writing it back and remove only what the flush actually sent
and settled; a snapshot or an answer parked during the `await` (debounce,
`online`, a concurrent flush) survives. Before, the flush rewrote the queue
from its initial copy and could erase the completion of a lesson's last
module. Locked by `progressQueue.test.js` and `evidenceQueue.test.js`.

**Module completion is written by `ModuleLayout` only, under one rule**:
`isCompleted && unlocked && !presenting` — for the effect, « التالي » and
« إنهاء » alike (`LESSON_CONTRACT.md` « What a module IS »). Leaving a
non-blocking module (« أستعدّ », the final test) with « التالي » does not
complete it.

**Known gap — a closed module rejects the whole snapshot.** The server refuses
(422) a snapshot that ADDS a module the administrator has closed, and the
client drops a 422 for good. If a module is closed between a student's
offline completion and the sync, every later snapshot of that lesson carries
it again and is refused, so the lesson's later progress never reaches the
server (storage keeps it). The refusal is a tested publication contract
(`PublicationAccessMatrixTest`); resolving the conflict is an owner decision,
not yet made.

**XP** (`smarter_global_xp`) is client-side only — per device, no server
table, not migrated from the anonymous prefix at login. It is shown in the
module header and « مساري ». No other feature awards XP (the daily challenge
has its own score).

### Renumérotation des modules — migration unique (2026-10-05)

Les modules terminés sont stockés PAR NUMÉRO. Insérer des modules avant un
module existant (pilote « مسائل » : le test de `qasim-adad-tabii` passe de 4 à
7) change le sens des numéros déjà stockés. La migration est UNIQUE, jamais
appliquée à chaque lecture (après le changement, « 4 » est légitimement la
مسألة 1) :
- client : `@smarter-academy/core › moduleLayoutMigrations` — les données
  portent `layoutVersion` ; absente = ancienne disposition, migrée à la
  lecture (`useProgress`, `progressQueue`, `getLessonProgress`) ; un stockage
  vide naît à la version courante ;
- serveur : une migration de données Laravel
  (`2026_10_05_000003_remap_problem_modules_qasim_adad_tabii`) remappe les
  lignes une fois, pour que l'union client ∪ serveur ne réintroduise jamais
  l'ancien sens. Déploiement à toutes les leçons (2026-10-06) : UNE migration
  par unité, qui porte la table de toutes ses leçons
  (`2026_10_06_000001_remap_problem_modules_unit1_aadad` : 7 leçons, 4 → 7 ou 5 → 8 ; `…000002…unit2_judhur` : 5 leçons, jusqu'à 6 → 9 ; puis `…000003…unit3_harfi`, `…000004…unit4_muadalat`, `…000005…unit5_jumal`, `…000006…unit6_khattiya`, `…000007…unit7_taalufiya`, `…000008…unit8_ihsa`, puis `2026_10_07_000009` à `…000014` pour les unités 9–14 (et, hors déploiement, `2026_10_13_000002_remap_wadiya_modules_synthesis_units_2_14` (les 13 autres synthèses, format de l'unité 1 : `{1→7, 2→0, 3→0, 4→8}`, `wadiya-idmajiya-judhur` `{1→7, 2→0, 3→8}` — « أؤكّد تعلّماتي » et « أتعمّق » supprimés) et `2026_10_13_000001_remap_wadiya_modules_idmajiya_aadad` : la synthèse `wadiya-idmajiya-aadad` : `{1 → 7, 2 → 0, 3 → 8}`, « أؤكّد تعلّماتي » supprimé, six « وضعيات تدريبية » insérées, l'analyse déplacée au module 7) — 60 leçons au total, identiques à la table client).
- Toute leçon renumérotée ajoute une étape aux DEUX tables, dans le même
  changement.
- Au déploiement, l'import du registre crée les nouveaux modules en `draft` :
  les publier (le test renuméroté compris) sinon ils restent fermés aux élèves.

### Module counts come from the lesson registry

`apps/web/src/lessons/registry.js` derives a lesson's module count from its
`LESSON_CONFIG.modules.length`. Nothing may fabricate a module count: a
catalogue lesson without a built config is not resumable and contributes no
completion percentage (the old `totalModules || 7` fallbacks are gone, as is
`LESSON_CONFIG.totalModules` itself).

## The daily challenge score is not progress (2026-09-25)

« التحدّي اليومي » keeps its own game metric (`daily_challenge_standings`:
cumulative score, streak): it is neither completion nor mastery and is never
read as either. Its answers DO produce ordinary practice evidence. See
`DAILY_CHALLENGE.md`.

## Completion levels

### Module completion

- **Definition:** binary. A module is complete iff `useProgress(lessonId).markModuleCompleted(moduleId)` has been called for it, ever.
- **Module `0` counts.** The id is written as the module's number stringified, so a lesson opening on « أستعدّ » stores `'0'`. `calculateCompletionPercentage` already normalises it (its regex matches `^(\d+)`), and callers must test module numbers with `isValidModuleNumber`, never for truthiness.
- **Numerator/denominator:** N/A — not a percentage, a boolean (`isModuleCompleted(moduleId)`, `lessonAccess.js`).
- **Who decides when this fires:** the module itself, at whatever point its own author considers it "done" (§Module contract, `LESSON_CONTRACT.md`) — intentionally not standardized across module types.
- **Edge case:** calling `markModuleCompleted` twice for the same id is a no-op (`useProgress.js` checks `.includes()` first) — idempotent by construction.

### Lesson completion

- **Definition:** `calculateCompletionPercentage(completedModuleIds, totalModules)`.
- **Numerator:** count of *unique* completed module numbers, after normalizing mixed-format ids (`"3"`, `"L03"`, `"L03-4e"` all → `3`) via regex and de-duplicating through a `Set`.
- **Denominator:** `modules.length`, served by the lesson registry (`apps/web/src/lessons/registry.js`); `LESSON_CONFIG.totalModules` no longer exists.
- **Edge cases, explicit:** `totalModules` missing/zero → `0` (never `NaN`/`Infinity`); `completedModuleIds` missing/not an array → `0`; more completed than total (shouldn't happen, but a stale/corrupted `localStorage` value could produce it) → capped at `100`.
- **Weighting:** none — every module counts equally. There is no concept of "this module is worth more" anywhere in the current data model.

### Chapter completion

- **Definition:** the mean of each available lesson's completion percentage within that chapter (`Courses.jsx`'s `getChapterProgress`, now itself calling `calculateCompletionPercentage` per lesson instead of the pre-cleanup inaccurate raw-length formula).
- **Numerator/denominator:** `sum(calculateCompletionPercentage(lesson) for lesson in availableLessons) / availableLessons.length`.
- **Edge case:** a chapter with zero available lessons (every lesson still `status: 'coming_soon'` — no longer true of any 4AM chapter: all 74 lessons are `available` since the French grades were deleted on 2026-09-25) → `0`, not `NaN` (`getChapterProgress` early-returns before dividing).
- **Weighting:** every *lesson* counts equally regardless of its module count — a 5-module lesson and an 11-module lesson each contribute one vote to the chapter average. This is a real modeling decision already baked into the existing code, documented here rather than changed (changing it would alter what number a student currently sees).

### Course completion (= grade, per the domain model in `ARCHITECTURE.md` §1)

- **Does not exist as a computed value anywhere today.** `Courses.jsx` computes chapter-level aggregates but never rolls them further up to a single "your 6e progress is X%" number. Not added in this phase (no UI currently asks for it; adding it would be speculative).

## Completion vs. Mastery

| | Completion | Mastery |
|---|---|---|
| **Question** | « did the student go through the material? » | « what does the student know about this Learning Point? » |
| **Unit** | module, lesson, chapter | Learning Point (and counts of Learning Points per lesson/unit) |
| **Source** | `student_lesson_progress` (+ `smarter_lesson_{id}` cache) | `student_learning_point_progress`, derived from `learning_evidence` by the mastery engine |
| **Written by** | `PUT /lessons/{code}/progress` | `ProgressEngine` only (final test + practice engine) |
| **Read by** | lesson index %, unit %, « أنهيت مسار الدرس ✓ », Knowledge Map visibility (incl. the progressive map's **locked** nodes) | coloured dots/pills, «للعمل الآن», practice hub, teacher class × LP, recommendations |
| **Code names** | `calculateCompletionPercentage`, `getModuleMastery` (a historical name — it returns module COMPLETION, 100/0, and drives unlocking only) | `status`, `status_reason`, `confidence`, evidence counters |

**A student can complete a lesson without mastering its Learning Points, and
master a Learning Point without completing the lesson** (the final test is
always open) — `RepeatedAttemptsFlowTest::test_completion_and_mastery_are_independent`.

**The progressive Knowledge Map adds neither** (`KNOWLEDGE_MAP.md` A.4): a node
is locked until completion (or a brick) establishes its item — a COMPLETION
read; mastery appears only as the Learning Point dots on its « بطاقتك » strip;
its « available / discovered » states are exploration UI kept in
`sessionStorage`, never progress, never evidence.

**Aggregation above the Learning Point is a COUNT, never a score.** A lesson
or unit shows « 3 / 4 متحكَّم فيها » and the four-status distribution; there is
no « lesson mastery = 87 % ». A numeric lesson mastery would hide which point
is weak — the one thing a teacher needs to know.


## Who reads progress (2026-09-22, updated 2026-09-25)

Three readers, **one set of tables**: the student (their own space), the
administrator (`Admin\StudentService`) and the teacher of a class (قسم)
through `Domain\Classroom\ClassroomProgressService`,
`Domain\Progress\StudentDossier` (shared with the admin),
`Domain\Classroom\ClassroomLearningPointService` (class × Learning Point:
one `GROUP BY` over the canonical state) and `Domain\Classroom\ClassroomInsightService`
(signals, recent changes, the student snapshot — pure functions over facts
loaded once). They read `student_lesson_progress`,
`student_learning_point_progress`, `learning_point_state_transitions` (the
history of that state), `learning_evidence` and the practice attempts, scoped
to the class's grade, to the lessons the class makes *effective* and to its
**active** members. « Last activity » for a teacher is the latest learning
activity inside that scope, not `users.last_activity_at`. Success rates
everywhere come from `Domain\Progress\Support\OutcomeStats`.

**No teacher-side progress table exists and none may be added**, and no
second mastery: a class view, a signal or an intervention outcome is a query
over the student's data, never a copy of it and never a recomputed status.
The only teacher-owned table is `classroom_interventions` (the teacher's
gestures, with a frozen snapshot of the canonical state at that moment).

Leaving or being removed from a class changes a membership row only — every
progress, attempt and mastery row stays — but the teacher can no longer read
that student one by one (`ClassroomAccess`). The notebook is read by the
teacher only through its own read-only surfaces, never counted into progress
(`NOTEBOOK.md`). Contract:
[`TEACHER_CLASSROOM_ARCHITECTURE.md`](./TEACHER_CLASSROOM_ARCHITECTURE.md) §2, §4.

## Who writes progress

Only a **student** does. A teacher (or an admin) opens the same lessons,
modules and **parts** with `freeNavigation` (no sequential lock, at either
level: `utils/moduleGate.js` for modules, `utils/stepUnlock.js` for the steps
inside one and for the « التالي » gesture) and `tracksProgress = false`
(`features/learning/learningViewer.js`): `useProgress`, the progress sync and
the evidence queue are silent for them, and the final-test hook sends nothing
to the server (it keeps a LOCAL copy of the reader's attempt, like a visitor's;
`usePrerequisiteDiagnostic` likewise stores the diagnostic result locally for
anyone — local-only, never synced). Opening a part out
of order therefore records nothing — a teacher reading part 7 never marks
parts 1–6 as done, for themselves or for any student. Server side the
`learner` middleware refuses `PUT /lessons/{code}/progress`,
`POST …/evidence` and `PUT|DELETE …/final-test-attempt` for any non-student
(403 `not_a_learner`), so a teacher can never create a `student_lesson_progress`
or `learning_evidence` row — for themselves or for anyone. Locked by
`TeacherLearningAccessTest`. Since 2026-10-05 the **practice** writes
(sessions, question attempts, hints, exercise and session completion) sit
behind the same `learner` middleware (`PracticeLearnerGuardTest`); the
teacher's practice view (the student's Hub in teacher mode) checks answers in the browser and writes nothing.
See `TEACHER_CLASSROOM_ARCHITECTURE.md` §8b.
