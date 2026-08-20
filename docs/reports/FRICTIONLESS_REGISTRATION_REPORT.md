# Frictionless Registration — Report

Placed in `docs/reports/`, per this repo's convention for point-in-time phase reports (see `docs/architecture/ARCHITECTURE.md` §9–§11 for the living contract this report complements).

## Product decision

Registration was asking for first name, last name, email, password, password confirmation, and grade — six fields before an account existed. The product decision: cut that to email + password only (inspired by the simplicity of platforms like SchoolMouv), create the account immediately, and collect everything else — starting with grade — progressively, after the account exists. Grade specifically needed to move from "required at signup" to "chosen right after, editable anytime from the profile."

## What was found

Registration had already gone through two prior phases (Authentication Foundation, then Student Grade & Personalized Learning Context) that *added* fields to the form — first/last name, then a required grade `<select>` — on top of an already-present password-confirmation field. None of that was wrong for what those phases were solving; it just left registration carrying more friction than this product decision now wants.

Two things made this change smaller than it looked at first:
- `first_name`, `last_name`, and `grade` were already nullable columns on `users` (grade nullable specifically so admins — who have no grade — don't break the schema). Dropping them from the registration payload needed zero migrations.
- `PATCH /auth/grade`, a student-facing grade `<select>` on the profile page, and a navbar `GradeSwitcher` already existed from the Student Grade phase — "change your grade after the fact" was already a fully-built, tested feature. The only missing piece was the *first* grade-selection moment, since it used to happen inside the registration form itself.

## Decision made up front

Reuse everything from the Student Grade phase rather than building a parallel path: the same `PATCH /auth/grade` endpoint, the same `getAllGrades()` vocabulary, the same nullable `grade` column. The only new piece is a single onboarding screen between account creation and the student space, and a guard that sends any student with no grade there — not just right after signup, so a student who abandons onboarding mid-flow lands back on it next time rather than being silently stuck.

`role` was left as the free-text string column it already was; no schema change for the future "Famille"/"Enseignant" account types the product direction names, since a free-text column already accepts new values without a migration. No table, column, or relationship was added for either — there's nothing to build yet because what a family or teacher account actually needs isn't scoped.

## What changed

**Backend**
- `AuthController::register()`: validates and accepts only `email` + `password` now (password confirmation and grade requirements removed). `first_name`/`last_name`/`grade` are left unset on the new `User`, defaulting to `null`. `role` is still always forced to `'student'` server-side, unchanged.
- `User` model: added a doc comment on the class noting `role` is intentionally a free-text column so `'famille'`/`'enseignant'` are additive later — no code behavior change.
- `tests/Feature/AuthenticationFlowTest.php`: registration tests updated to the new minimal payload; the old "registration requires a grade" test replaced with tests that registration *ignores* a client-supplied grade/password-confirmation, plus a new end-to-end test that a freshly-registered student (`grade === null`) can set it via `PATCH /auth/grade`.

**Frontend**
- `authService.js`: `register()` now takes just `{ email, password }`.
- `Register.jsx`: form reduced to email + password (no confirmation, no name, no grade). On success, navigates to `/espace/bienvenue` instead of straight into the student space.
- `pages/student/ChooseGrade.jsx` (new): the onboarding screen — grades grouped by level, same data as the profile page's picker. Selecting one calls the existing `updateGrade()` and lands the student in `/espace`.
- `App.jsx`: new `/espace/bienvenue` route, inside the same `<ProtectedRoute allowedRoles={['student']} />` block as the rest of the student space, but outside `<StudentLayout>` (it's a standalone step, not a page inside the workspace shell).
- `StudentLayout.jsx`: redirects to `/espace/bienvenue` whenever it renders for a student with no grade — the one guard every nested route (`/espace`, `/espace/cours`, etc.) inherits, rather than each page checking this itself.
- `utils/userDisplay.js` (new): `getDisplayName()`/`getInitials()` — every account now starts with `first_name`/`last_name` both `null`, so the four places that used to interpolate `user.firstName` directly (`StudentHome`, `StudentNavbar`, `Profil`, `StudentHomeBanner`) now fall back to the email's local part / its first letter instead of rendering blank.
- `StudentHomeBanner.jsx`: the homepage banner's CTA now points a gradeless student at `/espace/bienvenue` (previously `/courses`) and its label reads "Choisir ma classe" instead of "Voir mes cours" in that state — keeping the marketing homepage's entry point consistent with the same onboarding step, for the edge case of a student who navigates to `/` before finishing onboarding.

## What was deliberately not built

First/last name collection anywhere (registration or otherwise) — the product decision explicitly excludes them from registration, and adding them to the profile page as an optional field wasn't asked for, so it wasn't added. Family or teacher account types, any linking between accounts, an admin UI for account-type management, a "skip onboarding" affordance (grade selection is a single tap with no cost, so there was no friction case to design an escape hatch for), and any database schema for future account types. The lesson engine, exercise contracts, and progress model are untouched — this phase only touches the account-creation and grade-selection surface.

## Testing performed

**Backend** — `AuthenticationFlowTest.php`: 22/22 passing (was 18; net +4 after removing the obsolete grade-required test and adding the ignores-client-grade, no-confirmation-needed, and onboarding-sets-grade tests). Full suite: 25/25 passing.

**`packages/core`** — no logic here changed; all 107 tests still pass (registration/grade validation lives entirely in the backend and page components, not in the shared package).

**Frontend build** — `npm run build` succeeds.

**Live end-to-end**, driven two ways against real running servers (same pattern as the Authentication Foundation and Student Grade phases):
- *Backend, via `curl`* against `php artisan serve` on the project's actual configured MySQL database: register with only email+password → `201`, `grade`/`firstName`/`lastName` all `null`; `/auth/me` confirms it; `PATCH /auth/grade` sets it; logging in again reflects the grade; duplicate email → `422`; weak password → `422`; a client-supplied `role: admin` and `grade` on the register payload are both ignored. Test accounts deleted afterward.
- *Frontend, via Puppeteer + system Chrome* against the real Vite dev server and the real API: `/register`'s form has exactly two inputs (email, password) and zero `<select>`s; submitting lands on `/espace/bienvenue`; the onboarding screen renders grades grouped by level (Collège/Lycée); picking one lands on `/espace` with the dashboard rendering; the navbar and profile page show the email-derived fallback name instead of "undefined undefined"; logging out and back in with the same credentials — now that a grade is set — goes straight to `/espace`, skipping onboarding. Zero console errors across the run. Test accounts deleted, temporary `puppeteer-core` install (`--no-save`) confirmed to leave `package.json`/`package-lock.json` untouched, both dev servers stopped afterward.

## Final safety check

Working-tree diff scoped to: `AuthController.php`, `User.php`, `AuthenticationFlowTest.php` on the backend; `authService.js`, `Register.jsx`, the new `ChooseGrade.jsx`, `App.jsx`, `StudentLayout.jsx`, the new `utils/userDisplay.js`, `StudentHome.jsx`, `Profil.jsx`, `StudentNavbar.jsx`, `StudentHomeBanner.jsx` on the frontend; this report plus `ARCHITECTURE.md` §9–§11. No migration, no lesson content, and no other in-progress uncommitted work in the tree was touched.
