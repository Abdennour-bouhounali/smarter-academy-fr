# Smarter Academy — Architecture

> **Scope correction (2026-09-20).** The §1 domain table and §2 frontend tree
> below describe the **French-era** application and understate the backend. What
> is true today:
>
> - The lesson tree is `lessons/moyen/4am/…` only. The French tree
>   (`lessons/college/`, `lessons/lycee/`) and the French reference
>   catalogue were deleted on 2026-09-25.
> - What loads when (entry vs lazy chunks, lesson runtime, Math Lab overlay,
>   notebook window, on-demand i18n): [`BUNDLE_BOUNDARIES.md`](./BUNDLE_BOUNDARIES.md).
> - The backend is **not** "auth + contact form only" (§3). It carries
>   curriculum (grades, chapters, units, lessons, learning points), lesson
>   progress, learning evidence and mastery, the practice engine (sessions,
>   attempts, hints), the notebook, reports, activation codes and entitlement,
>   plus an admin surface.
> - `ProtectedRoute` guards three areas — `/admin`, `/espace` (student) and
>   `/enseignant` (teacher).
> - The student space also carries the **Math Lab** (`features/mathlab/`,
>   `/espace/atelier`, table `math_lab_documents`): a standalone workspace of
>   instruments outside the lesson engine — السبّورة for everyone, then مخبر
  المتوسط and مخبر الثانوي (`?lab=`), one registry with per-lab capabilities.
  See `MATH_LAB.md` §2.1.
> - The `admin` Gate guards the whole `/api/v1/admin/*` group, alongside the
>   `account.active` middleware (`email.verified` is NOT applied there: admin
>   accounts are created by `make:admin`, without an e-mail step); it is no
>   longer there just for `GET /contact`.
> - Roles are `student`, `teacher`, `admin`, plus a teacher FLAG,
>   **ambassador** (`users.is_ambassador`, 2026-10-05): admin and ambassadors
>   are content *reviewers* (see `ADMIN_PANEL_ARCHITECTURE.md` Annexe A8).
>   Since 2026-10-07 the admin sees every publication state, an ambassador
>   only `published` + `hidden` (§8 of the same file).
> - Progress is **not** purely client-side: `localStorage` is a cache, and
>   authenticated students sync through a debounced queue. See
>   `PROGRESS_MODEL.md`.
> - **Mastery is not a binary proxy** (the §1 « Mastery » row is stale): since
>   Mastery V2 (2026-09-24) every Learning Point has an evidence-driven,
>   server-judged, versioned and replayable state
>   (`student_learning_point_progress`), fed by the final test and the
>   practice engine. `getModuleMastery` is module COMPLETION (unlocking only).
>   See `LEARNING_ARCHITECTURE.md` § « Mastery model (V2) ».
>
> The §5 data-flow shape, the §6 boundary table and the §7 `packages/core`
> rationale remain correct. Start from [`../README.md`](../README.md) for the
> documentation map.

This document is the map. Detail on lessons/modules, exercises, and progress/mastery lives in the sibling documents in this folder. Everything here is grounded in `docs/reports/ARCHITECTURE_FOUNDATION_AUDIT.md` — nothing is proposed that isn't either already true or a minimal, justified extension of what's already true.

The repository is an npm-workspaces monorepo: `apps/web` (this section's focus), `apps/api` (§3), and `packages/core` (§7 — no longer hypothetical as of the Repository Organization phase; it's a real, built package). See the root `README.md` for the full layout.

## 1. Domain model

Not every concept below has a backend representation yet — that's the point of this table.

| Concept | Exists today as | Where |
|---|---|---|
| **Student** | Identity + current grade, as of the Student Grade phase (identity alone since Phase 4). `User` with `role='student'` and a `grade` column (one of `packages/core`'s `courseLevels[].grades[].id` values), self-registered via `POST /auth/register`, changeable via `PATCH /auth/grade`. No progress/attempt/mastery data is linked to it yet — see the rows below. | `apps/api/app/Models/User.php`, `apps/api/app/Http/Controllers/AuthController.php` |
| **Course** (= grade, in current usage) | `courseLevels[].grades[]` | `packages/core/curriculum/coursesData.js` |
| **Grade** | Same as Course above — the codebase doesn't distinguish "course" from "grade"; a grade *is* the course-level grouping. Since 2026-10-14 the moyen level has **four** grades, 1am–4am, each built from its trio `dz/{programme,units,lessons}_<grade>_2026_2027.json` (`DZ_MOYEN_GRADES`); 1AM–3AM lessons are `coming_soon` (non-clickable « قيد الإعداد » cards, DB `draft`, ignored by Mastery V2 — `LEARNING_NET.md` §3bis); `terminale_dz` is identity only | `coursesData.js` |
| **Chapter** (= domain) | `grades[].chapters[]`, sourced from the official programme JSON's `domains[]` (only domains that carry lessons are shown) | `coursesData.js` + `dz/programme_<grade>_2026_2027.json` |
| **Lesson** | `chapters[].lessons[]` (catalogue entry) **and**, separately, each lesson's own `LESSON_CONFIG` (richer, authoritative for modules) | `coursesData.js` (catalogue) + `<lesson>/lesson.config.js` (detail) |
| **Module** | `LESSON_CONFIG.modules[]` entries, each backed by one React component | `<lesson>/lesson.config.js`, `<lesson>/modules/Module*.jsx` |
| **Activity** | Not modeled as a distinct layer — a module's internal steps/interactions are undifferentiated JSX. See `LESSON_CONTRACT.md` §Module for the decision on whether to introduce this now (we don't). | — |
| **Exercise** | An interaction widget within a module — today the kit question components (`TapQuestion`, `BatchChoiceQuestion`, `NumericQuestion` in `common/kit/questions.jsx`), a registry manipulation, or the practice engine's exercises. (`useAdaptiveExercise`, `useSimpleExercise`, `ExerciseValidator` and `QuizQuestion` were deleted on 2026-09-29 as dead code with no importer.) | See `EXERCISE_CONTRACT.md` |
| **Attempt** | Not modeled *for lesson modules* — in-module answers live in component state, never persisted as attempts (the final test persists its attempt locally via `useFinalTestAttempt` and sends learning evidence). A real, backend-persisted equivalent exists, but scoped to the diagnostic only: `diagnostic_responses`, one row per answered question. | See `EXERCISE_CONTRACT.md` §Attempt (lessons); `DIAGNOSTIC_6E.md` §8 (diagnostic) |
| **Answer** | Component-local `useState`, never persisted independent of the pass/fail outcome — *for lessons*. The diagnostic persists the raw structured answer (`diagnostic_responses.answer`, JSON). | — (lessons); `DIAGNOSTIC_6E.md` §8 (diagnostic) |
| **Feedback** | A rendered message (`AdaptiveFeedback`/`FeedbackBox`/inline JSX), never persisted | — |
| **Skill / Competency** | For lessons: `LESSON_CONFIG.skills[]` (free-text strings) and the curriculum JSON's `prerequisites`/`teaching_scope` — descriptive metadata, not a queryable graph. The diagnostic has a real one: a 13-node, 4-tier dependency graph for 6e, with explicit `prerequisites` between skill ids (not free text) — the first such graph in the codebase. | `lesson.config.js`, curriculum JSON (lessons); `DIAGNOSTIC_6E.md` §2 (diagnostic) |
| **Progress** | `localStorage['smarter_lesson_{id}']` (`completedModules[]`, `completedExercises[]`) — unchanged, lesson progress is still entirely client-side | `useProgress.js` |
| **Mastery** | For lessons: still a binary proxy (`getModuleMastery` → 100 or 0) conflated with "completion" — see `PROGRESS_MODEL.md` §Completion vs. Mastery, unchanged by the diagnostic. The diagnostic has a real, non-binary one: a 0–1 confidence estimate per skill per session, updated per response, mapped to 🟢/🟠/🔴. The two are intentionally separate systems — the diagnostic's mastery estimate isn't wired into `lessonAccess.js`'s module-unlock gating, and doesn't change how lesson progress is computed or displayed. | `lessonAccess.js` (lessons); `DIAGNOSTIC_6E.md` §5 (diagnostic) |

**What this table means today:** Student *identity* now exists (self-registration, login, session), as does a *diagnostic* subsystem with real, backend-persisted Attempt/Answer/Skill-graph/Mastery — but only for the 6e diagnostic, and only as its own self-contained system. It is deliberately not (yet) the general answer to "Attempt"/"Mastery" for the lesson/exercise system as a whole, which still works exactly as `EXERCISE_CONTRACT.md`/`PROGRESS_MODEL.md` describe. Extending real attempt/mastery tracking to ordinary lesson exercises (not just the diagnostic) remains future work — what this phase proves is that the *shape* of that future system (skill-scoped evidence, a confidence estimate, not a binary flag) works end-to-end, in the one place it was actually asked for.

## 2. Frontend architecture

`apps/web/src/`:

```
src/
├── App.jsx                 route table (marketing pages, lazy pages; lessons through ONE lazy boundary, lessons/lessonRouteBoundary.jsx)
├── pages/                  route-level pages (Home, Courses, About, Contact, Login, Register, AdminDashboard, ...)
├── components/             marketing-site UI (not lesson-related)
├── components/auth/ProtectedRoute.jsx  role-gated route guard (allowedRoles prop, defaults to ['admin']); a student/teacher with emailVerified === false is sent to /verification-email (utils/emailVerification.js)
├── components/auth/GradeSwitcher.jsx    "Ma classe : 6e ▾" — changes a student's current grade (see §10)
├── components/student/StudentHomeBanner.jsx  homepage grade context for logged-in students (see §10)
├── context/AuthContext.jsx auth state — student, teacher or admin (+ `isAmbassador` / `canReviewContent`), same session mechanism; user.grade is the current-grade source of truth. Since 2026-10-17 the user is cached per token (`context/sessionUserCache.js`, key `session_user`, a token fingerprint — never the token): a known user renders at once (`loading` false) and `/auth/me` revalidates in the background; only a 401/403 closes a cached session (BUNDLE_BOUNDARIES.md §9)
├── features/tours/         « جولة تعريفية »: first-visit guided tour per page and role, mounted by StudentLayout / TeacherLayout, closure stored by /me/tours (see PAGE_TOURS.md)
├── data/                   portfolio/marketing content only (education.js, experience.js, projects.js, skills.js)
├── services/                apiClient, authService, contactService (see §5)
└── lessons/
    ├── common/
    │   ├── components/     shared lesson UI (ModuleLayout, LessonIndex, exercise widgets)
    │   ├── hooks/           useProgress, useFinalTestAttempt, useEvidenceSubmission, … — localStorage/React-coupled, stay here
    │   └── utils/            progress/getResumeLesson & friends — localStorage-coupled, stay here (see packages/core/README.md for the boundary)
    └── moyen/4am/<chapter>/<unit>/<lesson>/   (the French college/ tree was deleted on 2026-09-25)
        ├── lesson.config.js    canonical per-lesson detail (see LESSON_CONTRACT.md)
        ├── moduleContext.js    one line: buildModuleContext(...) from ../_unit/
        ├── routes.jsx           buildLessonRoutes(...) from ../_unit/
        ├── knowledge.jsx        the lesson's knowledge (Knowledge Map)
        ├── knowledgeGraph.js    progressive map structure + guidance (KNOWLEDGE_MAP.md Part A; every lesson)
        ├── index.jsx            thin wrapper rendering <LessonIndex>
        └── modules/Module*.jsx  one component per module
```

The curriculum catalogue (`coursesData.js`), answer validation, math/number formatting, lesson-access rules, progress-% calculation, and the auth role predicate (`hasRequiredRole`) all moved out of this tree into `packages/core` in the Repository Organization phase — they're imported as `@smarter-academy/core`, not by relative path. See §7.

## 3. Backend architecture

`apps/api/` — Laravel 13 + Sanctum, currently minimal: `User` (auth) + `Contact` (contact form) only. No curriculum/progress/attempt data model exists server-side — see `docs/reports/ARCHITECTURE_FOUNDATION_AUDIT.md` §3. Its own package.json (Laravel's default, unused Vite/Blade scaffold) is unrelated to the root workspace.

## 4. Lesson & exercise systems

See `LESSON_CONTRACT.md` and `EXERCISE_CONTRACT.md`. Summary: lessons and modules already have a real, consistent contract (`LESSON_CONFIG`) — it just isn't formally documented until now. Exercises: the phase that wrote this section formalized `useAdaptiveExercise`'s `{isCorrect, fields?, feedback?}` as canonical — **historical**: that hook, `useSimpleExercise` and `ExerciseValidator` were deleted on 2026-09-29 (dead code, no importer). In-lesson questions are now the kit's data-driven question components (`apps/web/src/lessons/common/kit/questions.jsx`), and evidence flows only from the final test (`BossFinal` → `useEvidenceSubmission`); out-of-lesson exercises are the practice engine's. See `EXERCISE_CONTRACT.md`.

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
| UI state, animations, interaction state | User identity, admin and student (`User`, `role` column) | Durable student progress (lessons) |
| Immediate exercise feedback (lessons) | Contact-form messages | Attempts, mastery (lessons) |
| Current-exercise in-progress answer (lessons) | Sanctum tokens (bearer, `Authorization` header) | Analytics events |
| Local "resume where I left off" (lessons) | Role-based authorization (`Gate::define('admin', ...)`) | Cross-device sync |
| — | Diagnostic sessions, responses, skill assessments (`DIAGNOSTIC_6E.md`) — durable, per-student, server-authoritative | — |

This boundary is not new — it's already how the app behaves. Documenting it here is what makes the eventual backend build additive rather than a redesign of the frontend. The diagnostic is the first *durable student data* to live on the backend at all — everything in the right-hand "will eventually move" column is still true for ordinary lesson progress, unaffected by this.

## 7. Future mobile strategy (not built now)

The pure-logic layer now has a real home: `packages/core` (an npm workspace, imported as `@smarter-academy/core`) — `mathComparison.js`, `numberFormat.js`, `lessonAccess.js`, `calculateCompletionPercentage.js`, `errorClassifiers.js`, `auth.js` (`hasRequiredRole`), `validation/*.js`, and `curriculum/coursesData.js`. Zero React/DOM/bundler coupling (no `localStorage`, no `import.meta`) — a future Expo/React Native app added as a sibling under `apps/` would depend on this same package unchanged, resolved via the same npm-workspaces mechanism Metro already understands natively. This was previously a documented *intention*; the Repository Organization phase made it a real, enforced package boundary rather than a convention someone could accidentally violate.

`services/*.js` (the fetch-based API client) was deliberately **not** moved into `packages/core` — it reads `import.meta.env`, a Vite-specific construct not available under Metro. It stays in `apps/web`; a future mobile app would need its own small API-client shim (same backend, same contract, different env-var mechanism) rather than reusing this file as-is. The other still-open seam — swapping `localStorage` for an adapter in `useProgress`/`getLessonProgress` — remains a documented, deferred item; those files stay in `apps/web/src/lessons/common/` for the same reason. No React Native/Expo dependency was added.

## 8. What this phase deliberately did not touch

Full list with reasons in `ARCHITECTURE_FOUNDATION_REPORT.md` §20. In one line: no dashboards, no mastery algorithm, no backend tables, no state library, no mobile app, no mass migration of the 3e lesson family or the 13-site validation duplication flagged in the cleanup phase.

## 9. Authentication & identity (Phase 4, registration simplified in the Frictionless Registration phase)

One `users` table serves every role — no separate Student or Teacher table. `role` (`'admin'` | `'student'` | `'teacher'`) is set server-side only; client-supplied `role` on registration is always ignored. Since 2026-09-22 registration accepts an optional `accountType` restricted to `User::SELF_REGISTERABLE_ROLES` (`student`, `teacher`), by form and by Google. `role` is a free-text string column, not an enum, so account types stay additive: "Famille" is still a future type — see §11. The teacher account, its classes and the commercial model are specified in [`TEACHER_CLASSROOM_ARCHITECTURE.md`](./TEACHER_CLASSROOM_ARCHITECTURE.md).

```
POST /auth/register  (public, throttled)     → creates a User from {firstName, lastName, email, password, accountType?}; role = accountType if it is student|teacher, else 'student'; sends the verification e-mail; returns {token, user, verificationEmailSent}
GET  /auth/email/verify/{id}/{hash}?expires&signature (public, throttle 12/min) → the link in the e-mail; ALWAYS answers with a redirect to {FRONTEND_URL}/verification-email?statut=succes|deja-verifie|invalide
POST /auth/email/resend (auth:sanctum, throttle 5/10 min) → re-sends to the account's own address; 200 {alreadyVerified} or 503 when the mail server refuses
POST /auth/login      (public, throttled)     → validates credentials, returns {token, user} for admin or student
GET  /auth/me         (auth:sanctum)          → the current user
POST /auth/logout     (auth:sanctum)          → revokes only the calling request's token
PATCH /auth/grade      (auth:sanctum)          → sets/changes the current user's grade (see §10)
PATCH /auth/profile    (auth:sanctum + email.verified, throttle 20/min) → sets/changes the current user's « الاسم و اللقب » {firstName, lastName} — students and teachers
GET  /contact         (auth:sanctum + can:admin) → admin-only; the one real cross-role authorization boundary today
```

- **E-mail verification (`EmailVerificationController`, `Domain/Identity/EmailVerificationLink`, `Notifications/VerifyEmailAddress`).** The link is a temporary signed route (24 h) carrying `sha1(email)`, so a link dies if the address changes. The signature is checked **inside** `verify` (`$request->hasValidSignature()`), not by the `signed` middleware: that middleware answers `403 {"message":"Invalid signature."}`, raw JSON shown in the student's browser for every expired link; now an unsigned, altered or expired link redirects to `?statut=invalide`, whose screen explains and offers a new link. Sending goes through `VerifyEmailAddress::sendTo($user)`, which catches a mail-transport failure, `report()`s it and returns `false`: registration still answers `201` with `verificationEmailSent: false` (Register.jsx then opens `/verification-email?statut=envoi-echoue`, which offers the resend instead of claiming « أرسلنا »), and resend answers `503` (shown as `apiErrors.sendEmail`). Before 2026-10-07 an SMTP failure made registration a `500` *after* the account was created, so the retry hit « email already taken ». The e-mail is Arabic and RTL (`User::preferredLocale()` is `ar` for every notification). Since 2026-10-07 it is rendered by the **brand e-mail layout** `apps/api/resources/views/emails/layouts/brand.blade.php` (view `emails/verify-email` + text version `emails/verify-email-text`): table layout with inline styles, the logo as a PNG served by the frontend at `{FRONTEND_URL}/email/logo.png` (`apps/web/public/email/logo.png` — Gmail shows neither SVG nor WebP), Cairo for text and Amiri for the title via Google Fonts with Tahoma/Arial fallbacks (Gmail ignores web fonts), the logo's navy `#0B2A6F` / indigo `#4F46E5` / cyan `#22D3EE` (since 2026-10-21, `docs/architecture/BRAND.md`; the e-mail logo is generated by `scripts/brand/build-logo.py`) and the student accent `#3B82F6 → #8B5CF6` with a solid fallback for Outlook. A new platform e-mail should `@extends('emails.layouts.brand')` rather than use Laravel's Markdown template; the Markdown path (still used by the activation-code e-mail) keeps `apps/api/lang/ar.json` and the RTL copies `resources/views/vendor/mail/html/{layout.blade.php,themes/default.css}`. The gate itself is `email.verified` (`EnsureEmailIsVerified`) on the learning group; admins are exempt. In the browser (since 2026-10-07) « فضائي » is closed too: `ProtectedRoute` redirects every `/espace/*` and `/enseignant/*` route to `/verification-email` while `needsEmailVerification(user)` (non-admin, `emailVerified === false`), the navbar button becomes « أكّد بريدك » → `/verification-email`, and that screen re-reads `/auth/me` on every visit so a link clicked on another device opens the space without a reload.
- **« الاسم و اللقب » are collected for every self-registered account (since 2026-09-29).** Registration asks first name + family name + email + password — still no grade and no password confirmation. The name is how a teacher recognises a student (teacher surfaces never show an email — `TEACHER_CLASSROOM_ARCHITECTURE.md` « The identity »), and how the dashboards greet the user. One rule for every write path — `App\Domain\Identity\PersonName`: trimmed and whitespace-collapsed, 2–50 characters, **Arabic letters only** (owner decision 2026-09-29): an Arabic-script letter first, then Arabic letters, harakat, tatweel, or a space / hyphen followed by an Arabic letter. Latin letters (« Amine »), digits (including ٠-٩), punctuation, emoji and markup are refused. `nameComplete` is true only when both parts pass this rule, so an account with a Latin name saved before the rule goes through the name step once to rewrite it in Arabic. The browser mirror `apps/web/src/utils/personName.js` gives the error codes (`required`, `tooShort`, `tooLong`, `notArabic`, `invalid`). **Validation is live** in `components/auth/PersonNameFields.jsx`: `liveNameError` flags a Latin letter (`notArabic` — « اكتب بالحروف العربية ») or a stray character while the user types, holds `required`/`tooShort` until the field is left, and shows a check when the field is valid. The server re-checks on submit, and its messages are never displayed (`apiMessage.js`). Inputs carry `lang="ar" dir="rtl"` to steer mobile keyboards to Arabic.
  - **Email form** (`Register.jsx`): both fields are required and sent with the account.
  - **Google sign-up asks for a password too (owner, 2026-10-22).** The consent step of `AuthGoogle.jsx` has a required password field (same rule as the form: 8+ characters, a letter and a digit, checked in the browser and by `POST /auth/google/complete`), so every account can also log in with e-mail + password — on a class tablet without the student's Google session. `GoogleAccountLinker::createFromIdentity(..., $password)` stores it hashed. Google accounts created before that date keep `password = NULL` (`hasPassword: false`; login answers « use Google », and forgotten-password sends nothing); their teacher can give them one through « بطاقات الدخول » (`TEACHER_CLASSROOM_ARCHITECTURE.md` §2).
  - **Google** (`AuthGoogle.jsx`, consent step): the callback passes Google's `given_name`/`family_name` as a *suggestion* (`prenom`/`nom` query params, same exposure as the `email` already there) — **only when it already passes the Arabic rule**, so a Latin Google name leaves the field empty instead of opening the screen on an error; the person confirms or corrects them on the consent screen, and `POST /auth/google/complete` **requires** `firstName`/`lastName` — the stored name is the confirmed one, never Google's as-is (`GoogleIdentity::withName`).
  - **Accounts without a name** (created before 2026-09-29): `UserPresenter` exposes `nameComplete` (both parts non-blank); the frontend's `needsName(user)` gates `StudentLayout` → `/espace/bienvenue/nom` (**before** the grade step) and `TeacherLayout` → `/enseignant/bienvenue`, both rendering `pages/onboarding/CompleteName.jsx`, which returns to the interrupted page (`location.state.from`). Admins are never gated (they edit their name in the admin account page).
  - **Profile**: `components/account/NameEditor.jsx` (student `Profil.jsx`, teacher `TeacherProfile.jsx`) edits the name in place through the same `PATCH /auth/profile`.
  - **Auth page frame** (`components/auth/AuthShell.jsx`): Login and Register share one wide, light split card (`max-w-6xl`). The form sits on the reading side and a brand panel drawn in code on the other (the programme badge « وفق البرنامج الرسمي لوزارة التربية والتعليم في الجزائر » at its top — repeated above the form title below `lg`, where the panel folds away — three feature points plus « والكثير من الميزات الأخرى… », and an SVG triangle/circle/curve figure). The panel folds away below `lg`. It also exports `authInputClass`, `AuthSubmit` and `AuthDivider`, and uses the student accent (`#3B82F6 → #8B5CF6`), or the teacher accent (`#0F766E → #3B82F6`) when « أنا أستاذ » is selected. A new visitor auth screen should compose it rather than restyle inputs.
  - **Display**: `utils/userDisplay.js` — `getDisplayName` (first name, for greetings and the sidebar), `getFullName` (profile), `getInitials` (Arabic initials separated by a thin space so they don't join into a word). The email local part is only a fallback for an admin without a name.
- **Session mechanism:** Sanctum bearer tokens (personal access tokens), stored in the frontend's `localStorage`, sent as `Authorization: Bearer <token>`. Not Sanctum's SPA cookie mode — the frontend has no cookie/CSRF-cookie flow, and this wasn't changed in Phase 4 (see `docs/reports/ARCHITECTURE_FOUNDATION_AUDIT.md`/`docs/reports/AUTHENTICATION_FOUNDATION_REPORT.md` for why bearer tokens were kept rather than migrated).
- **Expiration:** tokens now expire (`SANCTUM_TOKEN_EXPIRATION` env var, default 30 days) — previously `null` (never expired).
- **Authorization boundary:** two Laravel Gates in `AppServiceProvider::boot()` — `admin` (`can:admin`, the whole `/admin` API) and `teacher` (`can:teacher`, the whole `/teacher` API) — plus the first Policy, `ClassroomPolicy`, for ownership of a class. Entitlements (plan limits and features) are a third layer resolved by `PlanEntitlementResolver`. See `TEACHER_CLASSROOM_ARCHITECTURE.md` §1.
- **Frontend route guard:** `<ProtectedRoute allowedRoles={[...]} />` (default `['admin']`, preserving the pre-Phase-4 behavior at the one existing call site, `/admin`). Role-checking logic is the pure, tested `hasRequiredRole()` in `packages/core/auth.js` (imported as `@smarter-academy/core`), not inline JSX.
- **Not built:** per-student data of any kind (see §1) — this section is identity and session only.

## 10. Student grade & personalized learning context

A student's grade is profile data, not a hard content restriction, and — since the Frictionless Registration phase — not collected at registration either. Single source of truth for *which grades exist*: `packages/core/curriculum/coursesData.js`'s `getAllGrades()`, which flattens `courseLevels[].grades[]` (already the catalogue's own source of truth — nothing new was introduced, `grade` values are exactly `courseLevels[].grades[].id`: since 2026-10-14 `1am`/`2am`/`3am`/`4am`/`terminale_dz` — the French ids listed here before were removed on 2026-09-25). Single source of truth for *a given student's current grade*: the `grade` column on `users`, nullable (admins don't have one, and neither does a freshly-registered student until onboarding sets it), server-validated only for shape (`string|max:50`, not an exact enum — the frontend catalogue is what defines valid values, avoiding a duplicated grade list on the backend).

```
POST /auth/register    → grade is not accepted here; a new User's grade is null — EXCEPT when registering from a class join link (below)
PATCH /auth/grade      (auth:sanctum) → the only way for the student to set/change it; scoped to $request->user(), body {grade}
```

**Arriving by a class join link: no grade picker (owner, 2026-10-22).** A student who signs up from their teacher's link
`/rejoindre/classe/{token}` takes the class's grade and never sees `ChooseGrade`: by e-mail, `PendingClassJoin::remember`
writes the class's grade at registration (only when the grade is null), before the address is verified; by Google (or any
order of redirects), `ChooseGrade` sends a student whose browser still holds a consented pending join back to the link page
(`postAuthPath`), which joins — and `ClassroomMembershipService::join()` gives the class's grade. A link page whose class no
longer accepts members clears that pending join, so the picker is offered instead of a redirect loop. The grade stays editable
from the profile.

**Onboarding (`ChooseGrade.jsx`, `/espace/bienvenue`):** (redesigned 2026-10-07) one full-width card per grade, grouped by cycle, each showing a numeral badge (« 4 م », « 3 ث »), the grade name on one line, and what awaits — « متوفّر · N درسًا » from `getAllGrades().lessonCount`, or « قريبًا » when `curriculumStatus` is `not_supplied` / there are no lessons (the grade stays selectable). the grade step between account creation and the student space — preceded by the name step (`/espace/bienvenue/nom`, §9) for an account without « الاسم و اللقب »; `ChooseGrade` itself redirects there if reached without a name. `Register.jsx` navigates here right after a successful registration; `StudentLayout` also redirects here for *any* student it renders with `user.grade === null` (not just right after signup — e.g. a student who closed the tab mid-onboarding lands back here on their next visit), so the guard lives in one place rather than being repeated per page. Picking a grade calls the same `PATCH /auth/grade` used by the profile page and navbar switcher below — onboarding isn't a special-cased write path.

**Default-context resolution** (`Courses.jsx`): explicit URL params (deep links, the existing grade-browsing buttons) still win first — browsing another grade never touches the profile. A logged-in student's `user.grade` is the next priority, ahead of the pre-existing anonymous-visitor `localStorage` fallback (which applies to logged-out visitors and to students with no grade set — the same fallback a student now also sees for the brief window before onboarding, unchanged from before this phase). The homepage (`StudentHomeBanner`, rendered only for `role==='student'`) and the navbar (`GradeSwitcher`) read `user.grade` the same way, so there's exactly one place (`AuthContext`) a component needs to consult.

**Why switching grades can't lose progress:** progress is keyed by lesson ID (`localStorage['smarter_lesson_{lessonId}']`), never by grade, and every lesson ID across all populated grades is already unique (verified: e.g. 3e's `racines-carrees` vs 4e's `racines-carrees-4e`) — changing `user.grade` only changes which grade's catalogue is the *default view*; no key involving grade is ever written or read, so there is nothing for a grade change to delete.

**Dashboard scope vs. content restriction — two different things.** `getResumeLesson` (the "continue learning" pick) still searches recency across *all* grades, unchanged — a deliberate choice, not an oversight: it already satisfies "no hard restriction," and scoping what we *propose* to only the current grade would be a new restriction the brief warns against.

What a dashboard *displays* is a separate question. **`Ma progression` (`Progression.jsx`) shows only `user.grade`**, matching `StudentHome.jsx`, which already passed `{ gradeId }` to `getStudentActivity` — the two screens previously told two different stories about the same journey. The mastery rollup is filtered to the same grade so the "compétences maîtrisées" tile can't count acquis that are invisible on the page, and the heading names the grade ("Ta classe de Seconde") so a student who worked elsewhere doesn't think that work was lost. It isn't: progress is keyed by lesson ID, so switching grades changes only the view — the other grade's lessons reappear on return. A student with `grade === null` still sees everything, rather than an empty frame. Locked by `progressionGradeScope.test.js`. The student's notebook is deliberately *not* grade-scoped: notes are the student's own writing and stay visible across grades.

**Not built:** parent/family accounts, an admin-facing grade-management UI.

## 11. Future account types (not built)

The product direction names three account types: **Élève** (implemented), **Enseignant** (**implemented on 2026-09-22** — `role = teacher`, classes `classrooms` with membership by join link or join code, per-class lesson visibility, class progress, and DB-configurable plans; authoritative document: [`TEACHER_CLASSROOM_ARCHITECTURE.md`](./TEACHER_CLASSROOM_ARCHITECTURE.md)), and **Famille** (future, deliberately not built). Nothing speculative exists for the family type — no `family_id`, no linking table, no parent/child relationship. `role` remains a free-text string rather than a database-level enum (see §9), so adding `'famille'` later is additive. What a family account actually needs (linking several student accounts? reading their progress?) is unknown until that phase is scoped — building the relationship now would be exactly the kind of speculative database architecture this codebase's conventions warn against (see `ARCHITECTURE_FOUNDATION_AUDIT.md`).


## Phase 8 — the textbook unit level (2026-09-18)

The Algerian catalogue has a **unit (الوحدة)** level between chapter (ميدان) and lesson (درس), mirrored in the DB (`units`, `lessons.unit_id`) and the API (`GET /v1/curriculum/grades/{code}`, `GET /v1/lessons/{code}/structure`). A unit groups one textbook unit's lessons in the textbook's order and carries its objectives, opening challenge and a `synthesis` lesson. Pedagogical prerequisites (`lesson_prerequisites`, `learning_point_prerequisites`) and declared resources (`lesson_resources`) are first-class rows; content stays in versioned files. The catalogue surfaces render the same hierarchy and none of them locks anything: the Courses page and the student pages « دروسي » / « استكشاف » (unit cards under a ميدان, shared `components/student/unitGrouping.js`), `UnitPage`, and the lesson index breadcrumb.

**Catalogue views (2026-10-07).** `/courses`, « دروسي », « استكشاف » and `/enseignant/cours` draw their selection through ONE renderer, `components/student/CatalogueBrowser.jsx`, steered by a viewer-chosen view (`components/student/catalogueView.js`, toolbar `CatalogueViewToolbar.jsx`). Two independent axes: **organisation** — `units` « الوحدات » (unit cards → unit page; the default, the behaviour before this date), `chapters` « حسب الميادين » (each ميدان → each unit in textbook order with a link to its page → its lessons then its synthesis, all on the page; lessons outside a unit last, under « مواضيع أخرى في هذا الميدان »), `all` « كل الدروس » (every visible lesson, flat, catalogue order, each tile carrying its unit as an eyebrow) — and **layout** — `grid` (cards) or `rows` (compact lines: `LessonRow.jsx`, `UnitGroup layout="rows"`). The page keeps its own filters (grade, ميدان pills, search); a search is always flat (organisation disabled, layout kept). The choice is a UI preference, not student data: `storage` key `sa.catalogue.view` (unscoped, like the course filters; unreadable → default), shared by the four pages. A lesson tile's state (hidden by teacher / locked / open / soon, tier, progress, publication) is read once by `useLessonTileState.js` for BOTH drawings — never recompute it in a new tile. Guards: `catalogueView.test.js`, the source contracts in `teacherContract.test.js` / `contentAvailability.test.js` / `entitlementAvailability.test.js` / `reviewerAvailability.test.jsx`, and the browser QA `apps/web/e2e/catalogue-views.mjs` (6 views × desktop/phone: no overflow, every lesson once, no console error, choice survives reload). Same day, owner's follow-ups: the unit card has the **shape of a lesson card** (white, slate border, one grid cell, same footer and progress bar; `UnitGroup.jsx`); units and ميادين carry an **icon** like lessons (`units_4am_2026_2027.json › units[].icon` and `› chapterIcons`, exposed as `unit.icon` / `chapter.icon` by `coursesData.js`); the ميدان pills show **icon + name only** (no lesson count / percentage); the ميادين are listed in the owner's **display order** (`› chapterOrder.order`: أنساب الأعداد والحساب, التناسبية والدوال, then الهندسة last — `chapter.order` keeps the programme position); a change of ميدان / view / search **remounts** the list instead of animating exits (`AnimatePresence mode="popLayout"` kept up to 74 leaving tiles in place, leaving a tall empty band under the list). **Breadcrumb links to the catalogue** (unit page, lesson index, module) go through `components/student/catalogueLink.js`: a student goes to « دروسي » `/espace/cours?chapter=<ميدان>` (which reads `?chapter=`), everyone else to `/courses?level=&grade=&chapter=` (`/espace` admits students only). Manipulations are a reusable system (`apps/web/src/lessons/common/manipulations/`) with a closed type registry (`packages/core/curriculum/manipulationTypes.js`). See `docs/ALGERIA_PHASE8_UNIT1_TEXTBOOK_REPORT.md`.
