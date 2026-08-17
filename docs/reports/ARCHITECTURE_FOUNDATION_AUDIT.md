# Architecture Foundation Audit

Read-only trace of the actual current implementation, frontend and backend, as of `HEAD 338b544` + the cleanup-phase changes on top. This is the input to `ARCHITECTURE_FOUNDATION_REPORT.md`'s contracts — nothing here is aspirational; every claim is grounded in a specific file.

## 1. The real end-to-end flow, traced

```
Student enters platform
  → src/App.jsx renders <Home/> at "/" (MainLayout wraps Navbar/Footer)
→ courses
  → src/pages/Courses.jsx at "/courses" — reads `courseLevels` from src/data/coursesData.js
→ chapter (grade → domain/chapter)
  → Courses.jsx's level/grade/chapter tabs — state synced to both URL search params AND
    localStorage (`smarter_selected_level/grade/chapter`), see coursesData.js §2 below
→ lesson
  → Clicking a lesson card = <Link to={lesson.path}> → one of ~170 static routes in App.jsx
  → Each lesson's `path` comes from coursesData.js's `smaMetadata[...].path`, which must
    exactly match a hardcoded route string in App.jsx — two independent sources of truth,
    kept in sync only by convention (see §2)
  → The lesson landing route renders <LessonIndex config={LESSON_CONFIG} basePath={...}/>
    (src/lessons/common/components/LessonIndex.jsx), reading progress via useProgress(lessonId)
→ module
  → Clicking a module card = <Link to={module.path}> → another distinct static App.jsx route
  → Renders that module's own component (e.g. Module06Comparer.jsx), which imports
    MODULE_CTX/getNavLinks from its lesson's moduleContext.js and wraps its content in
    <ModuleLayout> (src/lessons/common/components/ModuleLayout.jsx)
  → ModuleLayout calls useProgress(lessonId).markModuleVisited(moduleNumber) on mount,
    computes lock/unlock status via lessonAccess.js, renders breadcrumb + progress bar
→ activity / exercise
  → No separate "activity" concept exists in code today — a module's body IS its sequence
    of steps/interactions, hand-authored JSX per module (see §5). Exercises are individual
    interaction widgets within that JSX: QuizQuestion, ChoiceGrid, MathInput+useAdaptiveExercise,
    OrderingGame, InfoSorter, AnswerBuilder, GroupBuilder, or fully bespoke per-module code
→ answer
  → Student input lands in component-local useState (a MathInput value, a selected index, a
    slider position) — never persisted until the module explicitly calls a validate/submit function
→ validation
  → Whichever of: compareMathExpressions() (mathComparison.js), parseDec/decEquals
    (numberFormat.js), a bespoke inline parseFloat+comparison, or a QuizQuestion's
    choice.correct flag — see §6, no single mechanism
→ feedback
  → AdaptiveFeedback.jsx (hook-driven modules) or a module's own inline conditional JSX
    (non-hook modules) — see §6
→ progress
  → On success, the module calls useProgress(lessonId).markModuleCompleted(moduleId) and/or
    .awardXP({...}) — both write directly to localStorage, synchronously, no network call
  → Percentage displays (lesson card, lesson index, chapter aggregate) all now read through
    the single calculateCompletionPercentage() function introduced in the cleanup phase
```

**What's conspicuously absent from this trace, confirmed by grep across the whole `src/` tree:** no step above ever calls `fetch`/`axios` to a backend endpoint. The entire student-facing learning loop — catalogue, lesson, module, exercise, answer, feedback, progress — is 100% client-side, backed only by `localStorage`. The Laravel backend (§3) is never touched by any of it.

## 2. Frontend inventory

| Concern | Where it actually lives | Notes |
|---|---|---|
| **Lesson registry (source of truth for the catalogue)** | `smarter_academy_programmes_maths_2026.json` (official curriculum tree) joined with `src/data/coursesData.js`'s `smaMetadata` object (editorial overlay) via `buildChaptersForGrade()` | Produces `courseLevels`, read by `Courses.jsx` and `getResumeLesson`/`getNextLesson`. A lesson only has a working `path` if it also has a matching `smaMetadata` entry. |
| **Lesson configuration** | Each lesson's own `lesson.config.js` exports `LESSON_CONFIG` (`id`, `sequentialUnlock`, `title`, `description`, `level`, `grade`, `chapter`, `chapterTitle`, `totalModules`, `passingScore`, `masteryThreshold`, `emoji`, `estimatedDurationMin`, `skills[]`, `teachingScope{include,exclude}`, `modules[]` — each module: `id`, `number`, `slug`, `path`, `title`, `desc`, `color`, `style`, `estimatedMin`, `difficulty`, `actionText`) | This is the real, detailed per-lesson data model — richer than `coursesData.js`'s catalogue entry, and **not** read by `coursesData.js` at all. A third, independent id surface (`LESSON_CONFIG.id` must match `smaMetadata[...].id`, by convention only). |
| **Module loading / routing** | `src/App.jsx` — one static `import` + one static `<Route>` per module, ~170 total | No dynamic import, no code-splitting, no data-driven registration. Fully documented in `AUDIT.md` Phase 4. |
| **`ModuleLayout`** | `src/lessons/common/components/ModuleLayout.jsx` | Breadcrumb, progress bar, prev/next nav, lock-gate (via `lessonAccess.js`), calls `useProgress().markModuleVisited` on mount. |
| **Progress hooks** | `src/lessons/common/hooks/useProgress.js` (read/write `localStorage`), `src/lessons/common/utils/lessonAccess.js` (pure unlock/mastery-threshold logic), `src/lessons/common/utils/progress/{getLessonProgress,getResumeLesson,getNextLesson,getNextIncompleteModule,calculateCompletionPercentage}.js` | `calculateCompletionPercentage` (new, cleanup phase) is now the single formula every percentage display uses. |
| **Exercise components** | `src/lessons/common/components/{QuizQuestion,ChoiceGrid(in LessonUI.jsx),OrderingGame,InfoSorter,AnswerBuilder,GroupBuilder,NumberLine,BarModel,CalcChain}.jsx` + the `useAdaptiveExercise` hook + `ExerciseValidator`/`AdaptiveFeedback`/`GuidedSolution` | Two generations, no shared contract — see `AUDIT.md` Phase 6/7 and §5/§6 below. |
| **Answer validation** | `mathComparison.js` (`compareMathExpressions`), `numberFormat.js` (`parseDec`/`decEquals`), or ad hoc inline `parseFloat` per module | Inconsistent — see §6. |
| **Feedback** | `AdaptiveFeedback.jsx` (hook-driven), `FeedbackBox.jsx`/`LessonUI.jsx`'s `Feedback` (Generation 1/2 primitives), or bespoke inline JSX | Three independent tone/color systems (per `AUDIT.md` Phase 15, unchanged by the cleanup phase — that was out of scope). |
| **Local persistence** | `localStorage` keys: `smarter_lesson_{lessonId}` (`{completedModules[], completedExercises[], currentModule, lastVisitedAt}`), `smarter_global_xp`, `smarter_last_course`, `smarter_selected_level/grade/chapter`, `token` (auth) | Exhaustive — confirmed via grep, no other keys exist. |
| **API services** | Until this phase: **none** — `fetch` calls inline in `AuthContext.jsx`, `Login.jsx`, `AdminDashboard.jsx`, `ContactSection.jsx` | Extracted into `src/services/` as part of this phase — see the foundation report §12. |

## 3. Backend inventory

Confirmed exhaustively (all 5 migrations, both models, all 3 controllers, all routes read in full):

| Table (migration) | Columns |
|---|---|
| `users` | `id`, `first_name`, `last_name`, `email` (unique), `email_verified_at`, `password`, `role` (string, default `'user'`), `remember_token`, timestamps |
| `password_reset_tokens`, `sessions` | Laravel stock, unmodified |
| `personal_access_tokens` | Sanctum stock |
| `contacts` | `id`, `name`, `email`, `message`, `classe`, `ville`, `objectif`, `phone`, `status` (default `'new'`), timestamps |
| `cache`, `jobs` | Laravel stock, unused in practice (no jobs dispatched anywhere) |

**Models:** `App\Models\User` (fillable: `first_name,last_name,email,password,role`; casts `email_verified_at:datetime`, `password:hashed`), `App\Models\Contact` (fillable: `name,email,message,classe,ville,objectif,phone,status`). No other models exist.

**Routes** (`api/routes/api.php`, all under `Route::prefix('v1')`):

| Method | Path | Controller | Auth |
|---|---|---|---|
| POST | `/auth/login` | `AuthController@login` | public |
| GET | `/auth/me` | `AuthController@me` | `auth:sanctum` |
| POST | `/contact` | `ContactController@store` | public |
| GET | `/contact` | `ContactController@index` | `auth:sanctum` |

**Confirmed, exhaustively: zero backend representation of Course/Chapter/Lesson/Module/Activity/Exercise/Attempt/Answer/Progress/Skill/Competency/Mastery.** The domain model in §4 of the foundation report is being defined against a backend that currently models only "a user who can log in" and "a contact-form message" — everything else is greenfield.

## 4. Identifiers actually in use today

| Entity | ID example | Format | Uniqueness enforced? |
|---|---|---|---|
| Grade | `'6e'`, `'3e'` | short code | Yes (array key in `courseLevels`) |
| Chapter/domain | `'nombres_calculs'` | snake_case, from official JSON | Yes within a grade |
| Lesson | `'nombres-entiers'`, `'racines-carrees-4e'` | kebab-case | **By convention only** — folder name, `smaMetadata[...].id`, and `LESSON_CONFIG.id` must all agree; nothing enforces it (`AUDIT.md` Phase 5) |
| Module | `'L01-ent'`, `'L01-4e'`, or bare `'1'` | inconsistent prefix style per lesson | Reconciled only by a regex (`getLessonProgress.js`) that strips prefixes to a bare number |
| User (backend) | auto-increment `id` | integer | Yes (DB) |
| Student, Exercise, Attempt | **do not exist** | — | — |

## 5. What a "module" actually is today

There is no `Activity` layer. Reading 15+ real modules across this session (6e `nombres-entiers`/`fractions`, 3e `pythagore-3e`/`fonctions-lineaires-affines`/`racines-carrees`, 4e `racines-carrees`), a module is: one React component, wrapped in `<ModuleLayout>`, whose JSX body is a hand-authored sequence of steps mixing static explanation, one or more manipulatives/exercises, and step-gated `useState` flags — with no structural boundary in the code between "this part is content" and "this part is an exercise." The 8-step pedagogical loop in `.agents/AGENTS.md` is followed as an authoring convention (well, in 6e; unevenly in 3e — `AUDIT.md` Phase 6), never as an enforced structure.

## 6. What "exercise validation" actually is today

No single contract. Confirmed patterns, by prevalence:
1. **`useAdaptiveExercise` + a `validate(values) => {isCorrect, fields?, feedback?}` callback** — the closest thing to a real contract; used by the `pythagore-3e` and `racines-carrees` module families (post cleanup-phase fixes, all now correctly returning `{isCorrect}`).
2. **`QuizQuestion`/`ChoiceGrid`** — a `correct: boolean` flag baked into the choice-options array, checked by direct equality.
3. **Bespoke inline** — a module-local function comparing `useState` values directly (`OrderingGame`'s pairwise check, `InfoSorter`'s per-card assignment check, dozens of ad hoc `if (val === expected)` blocks).

`{isCorrect, fields?, feedback?}` (pattern 1) is the strongest existing candidate for a canonical "exercise result" shape — see the foundation report's Exercise Contract, which formalizes it rather than inventing something new.

## 7. Completion vs. mastery — what exists today

`lessonAccess.js`'s own header comment is explicit about this gap already: *"Le système de progression actuel ne connaît la maîtrise d'un module que de façon BINAIRE... cela satisfait le seuil de 80% sans qu'il soit nécessaire d'inventer un pourcentage fictif."* In practice: `getModuleMastery()` returns exactly `100` or `0` (has `markModuleCompleted` ever fired for this module, yes/no) — there is no partial-credit, no retention signal, no distinction between "clicked through" and "demonstrated understanding." `LessonIndex.jsx`'s `isMastered` variable name is the one place this conflation surfaces visibly: it's actually a completion-threshold check, not a mastery assessment. This is a real, named finding (see the foundation report §9), not something this phase resolves — no mastery algorithm is being built now.

## 8. State management — current sufficiency

Confirmed: no global store exists (no Redux/Zustand/Context beyond the single-purpose `AuthContext`). Every piece of state is one of: component-local `useState`, the `useProgress` hook (thin `localStorage` wrapper), or React Router's own `useSearchParams`. For the scope of what this app currently does, this is sufficient — no evidence of prop-drilling pain or state-sync bugs traceable to the *absence* of a store (the real bugs found and fixed in the cleanup phase were duplicate *formulas*, not state-management architecture). No state library is introduced in this phase.
