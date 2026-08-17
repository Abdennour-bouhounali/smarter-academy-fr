# Student Grade & Personalized Learning Context — Report

Placed in `docs/reports/`, per this repo's convention for point-in-time phase reports (see `docs/architecture/ARCHITECTURE.md` §10 for the living contract this report complements).

## What was built

A student's grade is now real profile data, not a client-side preference. One nullable `grade` column on `users` (the single source of truth for "this student's current grade"), set at registration and changeable anytime via a new `PATCH /auth/grade` endpoint. The set of *valid* grades has exactly one source too — `packages/core`'s `getAllGrades()`, a small pure function flattening the catalogue's own `courseLevels[].grades[]` (no new grade list invented; `6e`/`5e`/`4e`/`3e`/`seconde`/`premiere_specialite`/`terminale_specialite`/`terminale_complementaires` were already the catalogue's own grade IDs). Both `Register.jsx`'s grade picker and the new navbar `GradeSwitcher` ("Ma classe : 6e ▾") read from that one function.

The grade becomes the *default*, not a restriction: `Courses.jsx`'s existing level/grade resolution gained exactly one new priority tier — a logged-in student's `user.grade` — inserted between explicit URL params (unchanged: deep links and the existing grade-browsing buttons still work exactly as before, and never touch the profile) and the pre-existing anonymous-visitor `localStorage` fallback (unchanged for logged-out visitors). A new homepage banner and the navbar switcher both read the same `user.grade` via `AuthContext` — one value, read in three places, never duplicated.

## Implementation strategy chosen

Reuse the existing `users` table and Sanctum session (no new profile table, no new auth flow) — grade is exactly one more attribute on the identity that already exists, following the same pattern the Authentication Foundation phase established. Reuse the existing catalogue data as the grade vocabulary (no parallel enum). Reuse the existing URL-param-based catalogue-filtering mechanism in `Courses.jsx` for "browse other grades" (already satisfied "no hard restriction" before this phase even started) rather than building a separate browsing mechanism — only the *default* needed a new, higher-priority source.

## Changes implemented

**Backend:** migration adding `users.grade` (nullable string); `User::$fillable` includes it; `AuthController::register()` now requires and stores `grade`; new `AuthController::updateGrade()` behind `PATCH /auth/grade` (`auth:sanctum`, scoped to `$request->user()`); `formatUser()` includes `grade` everywhere a user is serialized (register/login/me/grade-update responses).

**`packages/core`:** `curriculum/coursesData.js` gained `getAllGrades()` (+ test file, 4 tests) — the grade-vocabulary source of truth.

**`apps/web`:** `authService.js` (`register()` now sends `grade`, new `updateGrade()`); `AuthContext.jsx` (new `updateGrade()` method, merges the response into `user` state); `Register.jsx` (a required grade `<select>`, grouped by level, built from `getAllGrades()`); new `components/auth/GradeSwitcher.jsx` (renders only for `role==='student'`, wired into `Navbar.jsx`); new `components/student/StudentHomeBanner.jsx` (renders only for students, shown on `Home.jsx` after the existing Hero — shows the student's grade and either a "continue learning" link via the existing `getResumeLesson` or a link into their grade's catalogue); `Courses.jsx` (the new profile-grade priority tier, described above).

## Bug found and fixed along the way

`Courses.jsx`'s existing "sync effective values back to the URL" `useEffect` fired on the component's *first* render — before `AuthContext`'s async `GET /auth/me` had resolved, i.e. before `user.grade` was known. On that first render `profileGrade` was still `null`, so the effect computed a fallback default and wrote it into the URL immediately; once the URL held an explicit `grade` param, it permanently outranked the (by-then-loaded) real profile grade, since URL params are the highest-priority source by design. Fixed by gating that effect on `AuthContext`'s `loading` flag — it now waits for auth resolution before writing anything to the URL. Caught by live browser verification, not by unit tests (this is exactly the kind of async-timing bug unit tests miss and an end-to-end pass catches).

## Testing performed

**Backend** — `AuthenticationFlowTest.php` extended: registration requires and returns `grade`; role-injection protection still holds with `grade` present; a student can change their grade (`PATCH /auth/grade`, 200, persisted); the endpoint requires authentication (401 without a token) and a grade value (422 on an empty body); changing one student's grade doesn't touch another's. 23/23 backend tests pass (20 auth + 3 pre-existing), Pint clean.

**`packages/core`** — 4 new tests for `getAllGrades()` (correct count across levels, includes current collège grades with correct labels, includes lycée forward-compatibly, no duplicate ids). 107/107 passing (up from 103).

**Live end-to-end** (Puppeteer + system Chrome against real dev servers, throwaway SQLite DB, cleaned up after):

| Check | Result |
|---|---|
| Register page's grade `<select>` has real options (6e, and lycée grades for forward-compat) | PASS |
| Registering with grade=6e redirects home | PASS |
| Homepage shows the student's grade via `StudentHomeBanner` | PASS |
| Navbar `GradeSwitcher` reflects the registered grade | PASS |
| `/courses` with no params defaults to the student's grade (6e) and correct level (college) | PASS |
| Switching grade via the navbar switcher updates the switcher immediately | PASS |
| `GET /auth/me` reflects the new grade server-side after switching | PASS |
| **6e progress (seeded in `localStorage`) survives a switch to 5e byte-for-byte** | PASS |
| `/courses` with no params now defaults to the new grade (5e) | PASS |
| 5e (no content built yet) renders an empty catalogue gracefully, no crash | PASS |
| Explicitly browsing 3e via URL works regardless of current grade=5e | PASS |
| Browsing another grade via URL does **not** change the profile grade | PASS |
| Zero uncaught JS exceptions across the whole run | PASS |
| A logged-out visitor sees no `GradeSwitcher`/banner, and the catalogue default is byte-for-byte the same as before this phase | PASS |

All 16 checks pass (after the one fix above). Full workspace `npm test` and `npm run build` both pass; `apps/web`'s bundle size is unchanged.

## Why grade-switching can't lose data

Verified, not assumed: every lesson ID across every populated grade (6e, 4e, 3e) is already globally unique (e.g. 3e's `racines-carrees` vs. 4e's `racines-carrees-4e` — someone was already careful about this). Progress is keyed exclusively by lesson ID (`localStorage['smarter_lesson_{lessonId}']`) — grade never appears in a storage key. Changing `user.grade` only changes which grade's catalogue view is shown by default; it writes to no key that any progress data lives under. The live verification above confirms this empirically, not just by code inspection.

## What was deliberately not built

Grade-scoped mastery or recommendations, parent/family accounts, an admin UI for managing student grades, and a rewritten "continue learning" algorithm — `getResumeLesson` still searches recency across *all* grades unchanged, which is a deliberate choice: it already satisfies "no hard restriction between grades," and narrowing it to only the current grade would introduce the exact kind of restriction this phase's brief explicitly rules out. Lycée grades are selectable (forward-compatible, as asked) even though no lycée lesson content exists yet — the catalogue already handles that gracefully (empty-state, no crash), confirmed live.
