# Smarter Academy — Architecture

This document is the map. Detail on lessons/modules, exercises, and progress/mastery lives in the sibling documents in this folder. Everything here is grounded in `docs/reports/ARCHITECTURE_FOUNDATION_AUDIT.md` — nothing is proposed that isn't either already true or a minimal, justified extension of what's already true.

The repository is an npm-workspaces monorepo: `apps/web` (this section's focus), `apps/api` (§3), and `packages/core` (§7 — no longer hypothetical as of the Repository Organization phase; it's a real, built package). See the root `README.md` for the full layout.

## 1. Domain model

Not every concept below has a backend representation yet — that's the point of this table.

| Concept | Exists today as | Where |
|---|---|---|
| **Student** | Identity + current grade, as of the Student Grade phase (identity alone since Phase 4). `User` with `role='student'` and a `grade` column (one of `packages/core`'s `courseLevels[].grades[].id` values), self-registered via `POST /auth/register`, changeable via `PATCH /auth/grade`. No progress/attempt/mastery data is linked to it yet — see the rows below. | `apps/api/app/Models/User.php`, `apps/api/app/Http/Controllers/AuthController.php` |
| **Course** (= grade, in current usage) | `courseLevels[].grades[]` | `packages/core/curriculum/coursesData.js` |
| **Grade** | Same as Course above — the codebase doesn't distinguish "course" from "grade"; a grade (6e, 5e, 4e, 3e) *is* the course-level grouping. | `coursesData.js` |
| **Chapter** (= domain) | `grades[].chapters[]`, sourced from the official curriculum JSON's `domains[]` | `coursesData.js` + `smarter_academy_programmes_maths_2026.json` |
| **Lesson** | `chapters[].lessons[]` (catalogue entry) **and**, separately, each lesson's own `LESSON_CONFIG` (richer, authoritative for modules) | `coursesData.js` (catalogue) + `<lesson>/lesson.config.js` (detail) |
| **Module** | `LESSON_CONFIG.modules[]` entries, each backed by one React component | `<lesson>/lesson.config.js`, `<lesson>/modules/Module*.jsx` |
| **Activity** | Not modeled as a distinct layer — a module's internal steps/interactions are undifferentiated JSX. See `LESSON_CONTRACT.md` §Module for the decision on whether to introduce this now (we don't). | — |
| **Exercise** | An interaction widget within a module (`useAdaptiveExercise`-backed, `QuizQuestion`, or bespoke) | See `EXERCISE_CONTRACT.md` |
| **Attempt** | Not modeled. `useAdaptiveExercise` tracks an in-memory `attempts` counter that's never read or persisted. | See `EXERCISE_CONTRACT.md` §Attempt |
| **Answer** | Component-local `useState`, never persisted independent of the pass/fail outcome | — |
| **Feedback** | A rendered message (`AdaptiveFeedback`/`FeedbackBox`/inline JSX), never persisted | — |
| **Skill / Competency** | `LESSON_CONFIG.skills[]` (free-text strings) and the official curriculum JSON's `prerequisites`/`teaching_scope` fields — descriptive metadata, not a queryable graph | `lesson.config.js`, curriculum JSON |
| **Progress** | `localStorage['smarter_lesson_{id}']` (`completedModules[]`, `completedExercises[]`) | `useProgress.js` |
| **Mastery** | A binary proxy (`getModuleMastery` → 100 or 0) conflated in naming with "completion" — see `PROGRESS_MODEL.md` §Completion vs. Mastery | `lessonAccess.js` |

**What this table means today (updated in Phase 4):** Student *identity* now exists (self-registration, login, session). Attempt, Answer-as-a-record, real Skill/Competency, and real Mastery still have no backend home, and nothing yet links a Student to any of them — no progress/attempt data is stored server-side or tied to a user ID. Building that link is explicitly future work (deliberately out of scope for Phase 4: no student dashboard, no progress system, no mastery engine). What Phase 3 and Phase 4 together did is define contracts and identity precisely enough that building that link later is additive, not another rewrite.

## 2. Frontend architecture

`apps/web/src/`:

```
src/
├── App.jsx                 route table (marketing pages + lesson/module routes, static)
├── pages/                  route-level pages (Home, Courses, About, Contact, Login, Register, AdminDashboard, ...)
├── components/             marketing-site UI (not lesson-related)
├── components/auth/ProtectedRoute.jsx  role-gated route guard (allowedRoles prop, defaults to ['admin'])
├── components/auth/GradeSwitcher.jsx    "Ma classe : 6e ▾" — changes a student's current grade (see §10)
├── components/student/StudentHomeBanner.jsx  homepage grade context for logged-in students (see §10)
├── context/AuthContext.jsx auth state — admin or student, same session mechanism; user.grade is the current-grade source of truth
├── data/                   portfolio/marketing content only (education.js, experience.js, projects.js, skills.js)
├── services/                apiClient, authService, contactService (see §5)
└── lessons/
    ├── common/
    │   ├── components/     shared lesson UI (ModuleLayout, LessonIndex, exercise widgets)
    │   ├── hooks/           useProgress, useAdaptiveExercise, useSimpleExercise — localStorage/React-coupled, stay here
    │   └── utils/            progress/getResumeLesson & friends — localStorage-coupled, stay here (see packages/core/README.md for the boundary)
    └── college/{6e,4e,3e}/<domain>/<lesson>/
        ├── lesson.config.js    canonical per-lesson detail (see LESSON_CONTRACT.md)
        ├── moduleContext.js    derives MODULE_CTX + prev/next nav from lesson.config.js
        ├── index.jsx            thin wrapper rendering <LessonIndex>
        └── modules/Module*.jsx  one component per module
```

The curriculum catalogue (`coursesData.js`), answer validation, math/number formatting, lesson-access rules, progress-% calculation, and the auth role predicate (`hasRequiredRole`) all moved out of this tree into `packages/core` in the Repository Organization phase — they're imported as `@smarter-academy/core`, not by relative path. See §7.

## 3. Backend architecture

`apps/api/` — Laravel 13 + Sanctum, currently minimal: `User` (auth) + `Contact` (contact form) only. No curriculum/progress/attempt data model exists server-side — see `docs/reports/ARCHITECTURE_FOUNDATION_AUDIT.md` §3. Its own package.json (Laravel's default, unused Vite/Blade scaffold) is unrelated to the root workspace.

## 4. Lesson & exercise systems

See `LESSON_CONTRACT.md` and `EXERCISE_CONTRACT.md`. Summary: lessons and modules already have a real, consistent contract (`LESSON_CONFIG`) — it just isn't formally documented until now. Exercises don't have one consistent contract; this phase formalizes the strongest existing pattern (`useAdaptiveExercise`'s `{isCorrect, fields?, feedback?}`) as canonical and migrates one representative call site to prove it, without mass-migrating the rest.

## 5. Data flow & persistence

```
Student interaction (React state)
        │
        ▼
Validation (pure function — @smarter-academy/core: mathComparison.js / numberFormat.js / validation/*.js)
        │
        ▼
Exercise result  { isCorrect, fields?, feedback? }
        │
        ▼
useProgress()  →  localStorage['smarter_lesson_{id}']
        │
        ▼
calculateCompletionPercentage()  →  displayed progress (%)
```

Nothing in this chain talks to the backend today. The backend is a separate, parallel system (auth + contact form) with no data-flow relationship to lesson progress. See §7 for how that changes *later*, not now.

## 6. Domain boundaries (frontend/backend)

| Belongs to frontend (today, and staying there) | Belongs to backend (today) | Will eventually move to backend |
|---|---|---|
| UI state, animations, interaction state | User identity, admin and student (`User`, `role` column) | Durable student progress |
| Immediate exercise feedback | Contact-form messages | Attempts, mastery |
| Current-exercise in-progress answer | Sanctum tokens (bearer, `Authorization` header) | Analytics events |
| Local "resume where I left off" | Role-based authorization (`Gate::define('admin', ...)`) | Cross-device sync |

This boundary is not new — it's already how the app behaves. Documenting it here is what makes the eventual backend build additive rather than a redesign of the frontend.

## 7. Future mobile strategy (not built now)

The pure-logic layer now has a real home: `packages/core` (an npm workspace, imported as `@smarter-academy/core`) — `mathComparison.js`, `numberFormat.js`, `lessonAccess.js`, `calculateCompletionPercentage.js`, `errorClassifiers.js`, `auth.js` (`hasRequiredRole`), `validation/*.js`, and `curriculum/coursesData.js`. Zero React/DOM/bundler coupling (no `localStorage`, no `import.meta`) — a future Expo/React Native app added as a sibling under `apps/` would depend on this same package unchanged, resolved via the same npm-workspaces mechanism Metro already understands natively. This was previously a documented *intention*; the Repository Organization phase made it a real, enforced package boundary rather than a convention someone could accidentally violate.

`services/*.js` (the fetch-based API client) was deliberately **not** moved into `packages/core` — it reads `import.meta.env`, a Vite-specific construct not available under Metro. It stays in `apps/web`; a future mobile app would need its own small API-client shim (same backend, same contract, different env-var mechanism) rather than reusing this file as-is. The other still-open seam — swapping `localStorage` for an adapter in `useProgress`/`getLessonProgress` — remains a documented, deferred item; those files stay in `apps/web/src/lessons/common/` for the same reason. No React Native/Expo dependency was added.

## 8. What this phase deliberately did not touch

Full list with reasons in `ARCHITECTURE_FOUNDATION_REPORT.md` §20. In one line: no dashboards, no mastery algorithm, no backend tables, no state library, no mobile app, no mass migration of the 3e lesson family or the 13-site validation duplication flagged in the cleanup phase.

## 9. Authentication & identity (Phase 4)

One `users` table serves both roles — no separate Student table. `role` (`'admin'` | `'student'`) is set server-side only; client-supplied `role` on registration is always ignored.

```
POST /auth/register  (public, throttled)     → creates a User with role forced to 'student', returns {token, user}
POST /auth/login      (public, throttled)     → validates credentials, returns {token, user} for admin or student
GET  /auth/me         (auth:sanctum)          → the current user
POST /auth/logout     (auth:sanctum)          → revokes only the calling request's token
GET  /contact         (auth:sanctum + can:admin) → admin-only; the one real cross-role authorization boundary today
```

- **Session mechanism:** Sanctum bearer tokens (personal access tokens), stored in the frontend's `localStorage`, sent as `Authorization: Bearer <token>`. Not Sanctum's SPA cookie mode — the frontend has no cookie/CSRF-cookie flow, and this wasn't changed in Phase 4 (see `docs/reports/ARCHITECTURE_FOUNDATION_AUDIT.md`/`docs/reports/AUTHENTICATION_FOUNDATION_REPORT.md` for why bearer tokens were kept rather than migrated).
- **Expiration:** tokens now expire (`SANCTUM_TOKEN_EXPIRATION` env var, default 30 days) — previously `null` (never expired).
- **Authorization boundary:** a single Laravel Gate, `Gate::define('admin', fn (User $user) => $user->role === 'admin')` in `AppServiceProvider::boot()`, applied via the `can:admin` route middleware. This is the only role check on the backend today; it exists because `GET /contact` (contact-form leads) must not be readable by a self-registered student.
- **Frontend route guard:** `<ProtectedRoute allowedRoles={[...]} />` (default `['admin']`, preserving the pre-Phase-4 behavior at the one existing call site, `/admin`). Role-checking logic is the pure, tested `hasRequiredRole()` in `packages/core/auth.js` (imported as `@smarter-academy/core`), not inline JSX.
- **Not built:** per-student data of any kind (see §1) — this section is identity and session only.

## 10. Student grade & personalized learning context

A student's grade is profile data, not a hard content restriction. Single source of truth for *which grades exist*: `packages/core/curriculum/coursesData.js`'s `getAllGrades()`, which flattens `courseLevels[].grades[]` (already the catalogue's own source of truth — nothing new was introduced, `grade` values are exactly `courseLevels[].grades[].id`: `6e`/`5e`/`4e`/`3e`/`seconde`/`premiere_specialite`/`terminale_specialite`/`terminale_complementaires`). Single source of truth for *a given student's current grade*: the `grade` column on `users`, nullable (admins don't have one), server-validated only for shape (`string|max:50`, not an exact enum — the frontend catalogue is what defines valid values, avoiding a duplicated grade list on the backend).

```
POST /auth/register   → grade now required, stored verbatim on the new User
PATCH /auth/grade      (auth:sanctum) → the only way to change it; scoped to $request->user(), body {grade}
```

**Default-context resolution** (`Courses.jsx`): explicit URL params (deep links, the existing grade-browsing buttons) still win first — browsing another grade never touches the profile. A logged-in student's `user.grade` is the next priority, ahead of the pre-existing anonymous-visitor `localStorage` fallback (which now only applies to logged-out visitors or students with no grade set — behavior for them is byte-for-byte unchanged from before this phase). The homepage (`StudentHomeBanner`, rendered only for `role==='student'`) and the navbar (`GradeSwitcher`) read `user.grade` the same way, so there's exactly one place (`AuthContext`) a component needs to consult.

**Why switching grades can't lose progress:** progress is keyed by lesson ID (`localStorage['smarter_lesson_{lessonId}']`), never by grade, and every lesson ID across all populated grades is already unique (verified: e.g. 3e's `racines-carrees` vs 4e's `racines-carrees-4e`) — changing `user.grade` only changes which grade's catalogue is the *default view*; no key involving grade is ever written or read, so there is nothing for a grade change to delete.

**Not built:** grade-scoped mastery/recommendations, parent/family accounts, an admin-facing grade-management UI. `getResumeLesson` (the "continue learning" pick) still searches recency across *all* grades, unchanged — a deliberate choice, not an oversight: it already satisfies "no hard restriction," and scoping it to only the current grade would be a new restriction the brief explicitly warns against.
