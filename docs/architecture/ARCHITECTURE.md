# Smarter Academy — Architecture

> **Status (2026-11-22).** The map of the whole system. Imported from the Algerian platform (DZ `dev` `7f4cef1c`) on
> 2026-11-22 and cut down to what is true in this tree. True here: the monorepo, the data flow, the API domains, the
> identity and grade model. Not true here yet: the interface is still Arabic and right to left, person names must be in
> Arabic letters, e-mails are Arabic (plan §4, steps 1C–1E). The catalogue is EMPTY: no lesson exists.

The repository is an npm-workspaces monorepo: `apps/web` (React 18 + Vite, JSX, no TypeScript), `apps/api` (Laravel +
Sanctum, MySQL in production, in-memory SQLite in tests) and `packages/core` (pure logic, imported as
`@smarter-academy/core`). See the root `README.md` for the layout and `../README.md` for the documentation map.

## 1. Domain model

| Concept | Where |
|---|---|
| **Grade** | `6e`, `5e`, `4e`, `3e` under the level `college`, built from the trio `packages/core/curriculum/fr/{programme,units,lessons}_<grade>_2026_2027.json` by `coursesData.js` (`allCourseLevels`, `getAllGrades`); active ids in `curriculum/activeGrades.js`. Every grade has `curriculumStatus: 'lessons_planned'` and `chapters: []` today |
| **Domain (thème)** | the five thèmes of the cycle 4 programme, in each `programme_<grade>` file (`verified: false`); hidden by the catalogue while it has no lesson |
| **Unit, lesson, learning point** | the same data model as the Algerian platform (`LEARNING_NET.md`); none exists yet. Learning-point ids are opaque and append-only (plan §2) |
| **A lesson's code** | `apps/web/src/lessons/college/<grade>/<theme>/<unit>/<lesson>/`, a v2 lesson (`LESSON_V2.md`): `lesson.pack.js`, `routes.jsx` → `buildLessonRoutes` of `lessons/common/lessonRoutes.jsx`, `index.jsx` → `lessons/common/components/LessonIndex.jsx`. The loaders `lessons/lessonLoaders.js` glob those four grade folders |
| **Evidence and mastery** | server-side, per learning point (`LEARNING_ARCHITECTURE.md`, `PROGRESS_MODEL.md`) |
| **Exercises** | the practice engine and the exam sheet (`EXERCISE_CONTRACT.md`); `content/practice/` holds no bank yet |
| **Diagnostic** | a self-contained 6e diagnostic, still mounted (`/espace/diagnostic`, `Domain/Diagnostic`, `DIAGNOSTIC_6E.md`) |

## 2. Frontend

`apps/web/src/`: `App.jsx` (route table; lessons through ONE lazy boundary, `lessons/lessonRouteBoundary.jsx`),
`pages/` (route-level pages of the shell: marketing, student, teacher, parent, school, admin), `features/` (one folder
per space or engine: `classSession`, `practice`, `mathlab`, `thinkingLab`, `compass`, `madar`, `dailyChallenge`,
`family`, `school`, `books`, `tours`, …), `components/` (shared UI; `components/auth/ProtectedRoute.jsx` is the role
guard), `context/AuthContext.jsx` (the session; the user is cached per token in `context/sessionUserCache.js`),
`services/` (the fetch client), `i18n/` (Arabic only today), `lessons/common/` (the lesson engine: `gameworld/`,
`launchkit/`, `lessonlab/`, `classroom/`, shared figures). What loads when: [`BUNDLE_BOUNDARIES.md`](./BUNDLE_BOUNDARIES.md).

With no lesson, the student's home, courses and progress pages show `components/student/NoLessonYet.jsx`.

## 3. Backend

`apps/api/app/Domain/` holds one folder per domain: Access, Admin, Billing (Stripe, kept and not yet attached to a
page — plan step 1F), Books (on today, to be switched off in 1F), Classroom, ClassSession, Compass, Content,
Curriculum, DailyChallenge, Diagnostic, Family, GameWorld, Identity, Madar, MathLab, Plans, Practice, Progress, Push,
Registration, School, Settings, ThinkingLab. Each space has its own contract in this folder (`../README.md`).

## 4. Data flow

```
Student interaction (React state)
        │
        ▼
Validation (pure function — @smarter-academy/core)
        │
        ▼
Progress: localStorage cache + debounced sync queue      Evidence: exam-format first tries, sent to the API,
(PROGRESS_MODEL.md)                                      the verdict re-computed by the SERVER (LESSON_V2.md §1bis)
```

Continuous manipulation never goes through the backend: pointer → local state → render; persist after meaningful
events.

## 5. `packages/core`

Zero React, DOM or bundler coupling (no `localStorage`, no `import.meta`): the curriculum (`curriculum/fr/`, catalogue,
learning net, school calendar), exact arithmetic, number formats, lesson access, progress, the practice evaluator, the
thinking-lab answer check, the role predicate `hasRequiredRole` (`auth.js`). `services/*.js` stays in `apps/web` because
it reads `import.meta.env`. See `packages/core/README.md`.

## 6. Authentication and identity

One `users` table serves every role. `role` (`student`, `teacher`, `admin`, `school_admin`) is set server-side; a
self-registration may ask for `student` or `teacher` (`User::SELF_REGISTERABLE_ROLES`). A teacher FLAG
`users.is_ambassador` makes a content reviewer (`ADMIN_PANEL_ARCHITECTURE.md`).

```
POST  /auth/register    (public, throttled)  → {firstName, lastName, email, password, accountType?}; sends the verification e-mail
GET   /auth/email/verify/{id}/{hash}          → always a redirect to {FRONTEND_URL}/verification-email?statut=…
POST  /auth/email/resend (auth:sanctum)       → 200 {alreadyVerified} or 503 when the mail server refuses
POST  /auth/login       (public, throttled)
GET   /auth/me          (auth:sanctum)
POST  /auth/logout      (auth:sanctum)        → revokes the calling token only
PATCH /auth/grade       (auth:sanctum)        → sets the student's grade
PATCH /auth/profile     (auth:sanctum + email.verified) → first and last name
```

- **Session**: Sanctum bearer tokens in `localStorage`, `Authorization: Bearer`; they expire (`SANCTUM_TOKEN_EXPIRATION`,
  30 days by default). Not the cookie SPA mode.
- **Authorization**: Gates `admin` and `teacher` (`AppServiceProvider`), `ClassroomPolicy`, entitlements through
  `PlanEntitlementResolver` (`TEACHER_CLASSROOM_ARCHITECTURE.md` §1). The front-end guard is
  `<ProtectedRoute allowedRoles>` over `/admin`, `/espace`, `/enseignant`; a student or teacher whose e-mail is not
  verified is sent to `/verification-email`.
- **E-mail verification**: a 24 h signed link carrying `sha1(email)`, its signature checked inside the controller so an
  expired link redirects instead of answering raw JSON; a mail-transport failure never fails a registration
  (`verificationEmailSent: false`). The e-mails use the brand layout `resources/views/emails/layouts/brand.blade.php`.
  They are Arabic and right to left today (`User::preferredLocale()` returns `ar`) — not yet converted (plan 1E).
- **Names**: one rule for every write path, `Domain/Identity/PersonName.php`, mirrored by `apps/web/src/utils/personName.js`
  and checked live in `components/auth/PersonNameFields.jsx`. It still accepts **Arabic letters only** — a Latin name is
  refused; plan 1E replaces it (`FRENCH_LANGUAGE_CONTRACT.md`). An account without a complete name goes through
  `pages/onboarding/CompleteName.jsx` before anything else.
- **Google**: the consent step (`AuthGoogle.jsx`) asks for a password too, so every account can also log in by e-mail.

## 7. A student's grade

A grade is profile data, not a content restriction. Which grades exist: `getAllGrades()` of `coursesData.js`. A given
student's grade: `users.grade` (nullable, validated for shape only). It is not asked at registration: `StudentLayout`
sends a student with no grade to `ChooseGrade.jsx` (`/espace/bienvenue`), which uses the same `PATCH /auth/grade` as the
profile. A student who registers from a class join link takes the class's grade and never sees the picker.

Progress is keyed by lesson id, never by grade, so changing grade loses nothing. `Progression.jsx` and the student home
show the current grade only (`progressionGradeScope.test.js`); the notebook is not grade-scoped.

## 8. The catalogue views

`/courses`, « my courses », « explore » and the teacher's courses page draw through ONE renderer,
`components/student/CatalogueBrowser.jsx` (views in `catalogueView.js`: by unit, by domain or flat; grid or rows; the
choice under the storage key `sa.catalogue.view`). A lesson tile's state is read once by `useLessonTileState.js`. With the
empty catalogue every view shows the « no lesson yet » state.
