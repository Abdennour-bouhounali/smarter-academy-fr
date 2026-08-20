# Lesson Reset Audit

Controlled reset of all lesson content (2026-08-17), preparing a clean rebuild
from the official Smarter Academy pedagogical specification. **Content was
reset; the platform was not.** Every deleted file is tracked in git history
(recoverable); nothing was committed by this reset itself.

## Scope of the audit

Full repository inspection: `apps/web/src` (lessons, pages, components,
services, context, utils), `apps/web/public`, `packages/core`, `apps/api`
(domain modules, models, migrations, routes, seeders, tests), `docs/`.
External-import analysis confirmed that **only `App.jsx` imports
lesson-specific files** — every other consumer of `apps/web/src/lessons/…`
imports the shared `lessons/common/` layer only.

---

## A. DELETED

| Item | What it was | Why safe |
|---|---|---|
| `apps/web/src/lessons/college/` (12 lesson implementations: 9× 6e, 2× 3e nombres_calculs + 3× 3e others, 1× 4e — 245 tracked files + module JSX, lesson.config.js, moduleContext.js, lesson-local components) | The obsolete lesson implementations — modules, inline questions, quizzes, lesson-local widgets (Base10Blocks, Balance, LiquidContainer, …), lesson-specific progression staging | Tracked in git (restorable); nothing outside `App.jsx` imported any of it |
| `App.jsx` lesson wiring | 158 lesson imports, ~190 lesson `<Route>`s + legacy path redirects + route-base constants | Rewritten keeping the full app shell (public pages, auth, admin, student space, diagnostic) |
| `apps/web/public/smarter-ui/` (`lesson.js`, `lesson.css`, `global-nav.js`) | Dead pre-React static-lesson runtime with an incompatible `smarter_completed_lessons` localStorage key | Zero references anywhere in `src/` or `index.html` |
| `coursesData.js` implementation-only metadata | Per-lesson `status: 'available'`, `path`, `totalModules`, `isNew` — facts about the deleted implementations | Statuses flipped to `coming_soon`; `path`/`totalModules`/`isNew` removed. Curriculum content itself untouched (see B) |

## B. KEPT (platform infrastructure)

- **Curriculum sources — intact by requirement**:
  `packages/core/curriculum/smarter_academy_programmes_maths_2026.json`
  (official program, untouched) and `coursesData.js` (catalog/hierarchy/
  `smaMetadata` descriptions, prerequisites, `pointsToLearn`, derived
  `learningPoints`, `courseLevels`, `getAllGrades`). The Grade → Chapter →
  Lesson → LearningPoint hierarchy is preserved end-to-end, including the
  `chapters` DB entity.
- **`apps/web/src/lessons/common/`** — the reusable pedagogical layer, all of
  it: `ModuleLayout`, `LessonIndex`, `LessonUI` (ChoiceGrid/Feedback/
  ValidateButton/NumberField/MissionBrief), `QuizQuestion`, `MathText`/KaTeX,
  `MathInput`, `NumberLine`, `OrderingGame`, `InfoSorter`, `AnswerBuilder`,
  `GroupBuilder`, `BarModel`, `CalcChain`, `AdaptiveFeedback`,
  `ExerciseValidator`, concept/example/feedback boxes; hooks
  (`useProgress`, `useAdaptiveExercise`, `useSimpleExercise`,
  `useEvidenceSubmission`), `evidenceQueue`, progress utils
  (`getLessonProgress`, `getResumeLesson`, `getStudentActivity`). The
  diagnostic UI also imports from here (`ChoiceGrid`, `NumberLine`,
  `NumberField`) — deleting any of it would have broken the diagnostic.
- **Backend — untouched**: Laravel infra, auth/Sanctum, users, contacts,
  the whole diagnostic module (`app/Domain/Diagnostic` + its 3 tables), the
  curriculum/mastery architecture (`app/Domain/Curriculum`,
  `app/Domain/Progress`, 7 curriculum/evidence tables, importer/validator
  commands, evidence + profile APIs, `DiagnosticSkillLinkSeeder`). **No
  tables dropped, no migrations deleted.** The curriculum tables are the NEW
  architecture, not old-lesson infrastructure; `learning_evidence` and
  `student_learning_point_progress` were verified empty before the reset.
- **Frontend platform**: routing shell, `AuthContext`, API services
  (`apiClient`, `authService`, `diagnosticService`,
  `learningEvidenceService`), pages (public + student space + diagnostic),
  student components (`LessonCard`, `StudentHomeBanner`), design
  system/layout/navigation, `packages/core` (validation, math comparison,
  number formatting, `lessonAccess`, progress calculators, adaptive exercise
  state).
- **Contracts and validation gates**: `docs/architecture/AI_LESSON_CONTRACT.md`
  (the assessment-metadata convention new lessons must follow),
  `EXERCISE_CONTRACT.md`, `npm run validate:lessons`,
  `smarter:import-curriculum` / `smarter:validate-curriculum`.

## C. REVIEW / REFACTOR (kept, flagged — not deleted)

| Item | Coupling | Recommendation |
|---|---|---|
| `SixiemeDiagnosticProvider::LESSON_PATHS` / `STARTING_POINTS` (backend, in the untouched diagnostic) | Recommendations point at lesson paths/modules that no longer exist until the rebuild | Leave as-is (diagnostic must not break; a recommendation to a `coming_soon` lesson degrades gracefully in the UI). Re-verify the pointers as each lesson is rebuilt. |
| `lesson.config.js` conventions (`assessment: {moduleId, totalQuestions, masteryScore}`, module `style`, `masteryThreshold`) | The 3e convention `LessonIndex` understands; the deleted lessons were its only instances | The shape lives on in `LessonIndex.jsx` + docs; the next-phase spec should either adopt or supersede it deliberately. |
| Old localStorage progress (`smarter_lesson_{id}`, `smarter_global_xp`, orphaned `smarter_completed_lessons`) | Client-side records of deleted lessons persist in students' browsers | Harmless (dashboards derive from the catalog: `coming_soon` lessons simply don't surface). Decide during rebuild whether rebuilt lessons reuse or version these keys. |
| `useProgress` module-unlock + XP model | Generic, but its staging assumptions co-evolved with the deleted lessons | Review against the new pedagogical spec before building the first new lesson. |

---

## Database note (per the reset rules)

Lesson-related tables identified: `lessons`, `learning_points`,
`learning_evidence` (+pivot), `student_learning_point_progress` — all part of
the **new** learning architecture, not the obsolete lesson system, so none
were dropped. After the `coursesData.js` status flip, `php artisan
smarter:import-curriculum` re-synced lesson statuses to `coming_soon`
(idempotent update, zero deletions; all 297 learning points remain active,
since `pointsToLearn` — curriculum competencies, not implementation — was
preserved). `CURRICULUM_SYNC_REPORT.md` regenerated: in sync.

## What the next phase inherits

A clean tree where building a lesson means: author modules in a new
`apps/web/src/lessons/...` folder using `lessons/common/`, register routes,
follow `AI_LESSON_CONTRACT.md` for discovery/practice/assessment staging and
learning-point evidence, flip the lesson's `coursesData.js` status to
`available` (+ path), re-run `smarter:import-curriculum`, and pass
`npm run validate:lessons`.
