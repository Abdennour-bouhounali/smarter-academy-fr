# Progress Model

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
  rewrite it. Mastery-path completion is client-asserted today, consistent
  with the documented client-trust boundary for lesson correctness;
  server-side verification against `student_learning_point_progress` is a
  future hardening step.

### localStorage is a cache, not the source of truth

`smarter_lesson_{id}` remains the synchronous read path and the offline
cache. For authenticated students, every module write schedules a debounced
push (`progressQueue.js`, last-snapshot-wins per lesson) and the server's
merged answer is folded back into storage; on login,
`useLessonProgressSync` hydrates storage from
`GET /students/me/lesson-progress` before any lesson page opens. Anonymous
visitors stay purely local.

**Known follow-up:** XP (`smarter_global_xp`) is still client-side only — it
has no server table yet and is lost across devices.

### Module counts come from the lesson registry

`apps/web/src/lessons/registry.js` derives a lesson's module count from its
`LESSON_CONFIG.modules.length`. Nothing may fabricate a module count: a
catalogue lesson without a built config is not resumable and contributes no
completion percentage (the old `totalModules || 7` fallbacks are gone, as is
`LESSON_CONFIG.totalModules` itself).

## Completion levels

### Module completion

- **Definition:** binary. A module is complete iff `useProgress(lessonId).markModuleCompleted(moduleId)` has been called for it, ever.
- **Numerator/denominator:** N/A — not a percentage, a boolean (`isModuleCompleted(moduleId)`, `lessonAccess.js`).
- **Who decides when this fires:** the module itself, at whatever point its own author considers it "done" (§Module contract, `LESSON_CONTRACT.md`) — intentionally not standardized across module types.
- **Edge case:** calling `markModuleCompleted` twice for the same id is a no-op (`useProgress.js` checks `.includes()` first) — idempotent by construction.

### Lesson completion

- **Definition:** `calculateCompletionPercentage(completedModuleIds, totalModules)`.
- **Numerator:** count of *unique* completed module numbers, after normalizing mixed-format ids (`"3"`, `"L03"`, `"L03-4e"` all → `3`) via regex and de-duplicating through a `Set`.
- **Denominator:** `LESSON_CONFIG.totalModules` (must equal `modules.length` — see the known gap in `LESSON_CONTRACT.md`).
- **Edge cases, explicit:** `totalModules` missing/zero → `0` (never `NaN`/`Infinity`); `completedModuleIds` missing/not an array → `0`; more completed than total (shouldn't happen, but a stale/corrupted `localStorage` value could produce it) → capped at `100`.
- **Weighting:** none — every module counts equally. There is no concept of "this module is worth more" anywhere in the current data model.

### Chapter completion

- **Definition:** the mean of each available lesson's completion percentage within that chapter (`Courses.jsx`'s `getChapterProgress`, now itself calling `calculateCompletionPercentage` per lesson instead of the pre-cleanup inaccurate raw-length formula).
- **Numerator/denominator:** `sum(calculateCompletionPercentage(lesson) for lesson in availableLessons) / availableLessons.length`.
- **Edge case:** a chapter with zero available lessons (e.g. every lesson still `status: 'coming_soon'`, true for all of 5e today) → `0`, not `NaN` (`getChapterProgress` early-returns before dividing).
- **Weighting:** every *lesson* counts equally regardless of its module count — a 5-module lesson and an 11-module lesson each contribute one vote to the chapter average. This is a real modeling decision already baked into the existing code, documented here rather than changed (changing it would alter what number a student currently sees).

### Course completion (= grade, per the domain model in `ARCHITECTURE.md` §1)

- **Does not exist as a computed value anywhere today.** `Courses.jsx` computes chapter-level aggregates but never rolls them further up to a single "your 6e progress is X%" number. Not added in this phase (no UI currently asks for it; adding it would be speculative).

## Completion vs. Mastery

**These are not the same thing, and the current codebase does not fully distinguish them** — this is the most important finding in this document.

| | Completion | Mastery |
|---|---|---|
| **Question answered** | "Did the student go through the material?" | "Did the student demonstrate sufficient understanding?" |
| **Current implementation** | `calculateCompletionPercentage` (real, accurate, exercised by real UI) | `getModuleMastery()` — returns `100` or `0`, exactly mirroring completion. **No independent mastery signal exists.** |
| **Data available to compute it properly** | Yes — module completion flags | No — no attempt history, no per-exercise correctness-over-time, no retention/spaced-review signal is persisted anywhere (see `EXERCISE_CONTRACT.md`'s Attempt Model gap) |

`lessonAccess.js`'s own header comment already states this precisely: today, "mastery" is a placeholder equal to completion, specifically *because* no fractional/retention data exists yet, with `getModuleMastery` named as "the one place to change" once it does. `LessonIndex.jsx`'s `isMastered` variable is the one place this conflation is user-visible — it answers "is this lesson done," not "has this been mastered," despite the name.

**Decision for this phase:** do not build a mastery algorithm (explicitly future work, §23 of the phase brief). What this phase does: name the gap precisely, so nobody building the future mastery engine mistakes the existing `isMastered`/`getModuleMastery` naming for a real mastery signal that just needs tuning — it's a completion proxy that needs to be *replaced*, not extended, once real attempt data exists.

**A student can be 100% complete on a lesson without having mastered its competency.** The architecture must keep these separable when the real mastery model arrives: `Progress` (→ `calculateCompletionPercentage`, module/lesson/chapter) stays a pure function of "what was clicked through," while `Mastery` (→ eventually a function of attempt history, correctness rate, retention over time) becomes its own, separately-computed value once `Attempt` records exist. They should never again be collapsed into one number the way `getModuleMastery` currently does.
