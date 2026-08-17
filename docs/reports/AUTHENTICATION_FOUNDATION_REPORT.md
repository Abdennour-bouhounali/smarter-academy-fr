# Phase 4 — Authentication & Student Identity Foundation

## 1. What was found

The backend had exactly one identity: a hand-provisioned admin (`php artisan make:admin`, from the Phase 1 security fix). There was no way to become a student. Specifically:

- **No registration.** `AuthController` had `login()` and `me()` only.
- **`login()` hard-rejected anyone who wasn't admin** (403 `"Accès refusé."`), so it couldn't be reused for students without a change.
- **No server-side logout.** The frontend "logout" only cleared `localStorage`; the Sanctum token stayed valid indefinitely (`sanctum.expiration` was `null` — never expires) and could be replayed if it ever leaked.
- **No real authorization boundary.** `GET /contact` was gated by bare `auth:sanctum` — *any* authenticated user, not just admins. Harmless while only an admin existed; a live PII leak the moment students could register (any student could read every contact-form lead).
- **`ProtectedRoute.jsx` hardcoded `role === 'admin'`** — not reusable for a future student-only route.
- **No rate limiting** on any auth endpoint (already flagged in the original audit).

## 2. Decision made up front

**Kept bearer-token auth** (`Authorization: Bearer <token>`, stored in `localStorage`) rather than migrating to Sanctum's cookie/SPA mode. The app has no XSS vectors (confirmed in the original security audit), so the main risk bearer tokens carry is contained, and a cookie migration would mean new cross-port CORS/CSRF work with no way to fully verify it live in this environment. Hardened what exists instead: server-side revocation, real role-based authorization, throttling, and a finite token lifetime — no new dependencies, no rewrite.

`User` is reused for students (`role='student'`) — no new table. `role` is never taken from client input on registration; it's hardcoded server-side. The only path to `role='admin'` remains the `make:admin` CLI command.

## 3. What changed

**Backend**
- `AuthController`: added `register()` (forces `role='student'`, French validation messages matching `ContactController`'s existing convention) and `logout()` (`currentAccessToken()->delete()` — revokes only the calling token, not other sessions). `login()` no longer rejects non-admins.
- `AppServiceProvider`: `Gate::define('admin', ...)`.
- `routes/api.php`: `POST /auth/register` and `POST /auth/login` throttled (`throttle:6,1`); `GET /contact` now requires `auth:sanctum` **and** `can:admin`.
- `config/sanctum.php`: tokens now expire (`SANCTUM_TOKEN_EXPIRATION` env var, default 30 days) instead of never.
- `bootstrap/app.php`: **bug fix** — see §4.
- `database/factories/UserFactory.php`: **bug fix** — see §4.
- `.env` `APP_URL`: **bug fix** — see §4 (gitignored, not part of any commit).

**Frontend**
- `authService.js`: added `register()`, `logout()`.
- `AuthContext.jsx`: `logout()` is now async — clears local state immediately (instant UI feedback), then best-effort revokes the token server-side.
- `ProtectedRoute.jsx`: generalized to `<ProtectedRoute allowedRoles={[...]} />`, defaulting to `['admin']` — zero behavior change at the one existing call site (`/admin`).
- `src/utils/auth.js` (new): `hasRequiredRole(user, allowedRoles)` — pure, tested, used by `ProtectedRoute`.
- `Register.jsx` (new page) + `/register` route.
- `Login.jsx`: post-login redirect is now role-based (admin → `/admin`, student → `/`); generalized the "Espace Administration" copy, which was no longer accurate once students share the same page; added a link to `/register`.

## 4. Bugs found and fixed along the way

Not originally in scope, but each one directly blocked "test the complete authentication flow" or was a live correctness/security issue this phase's brief explicitly asks to audit:

1. **`APP_URL=https://smarter-academy.fr/api`** in `.env` (should be the bare domain — Laravel's `withRouting(api: ...)` already prefixes `/api`). This silently broke Laravel's HTTP test client for *every* Feature test in the project (it uses `app.url` as the request base), which is why `ExampleTest` has failed in every prior phase — previously misdiagnosed as "database unreachable" because that error surfaced first. Fixed; confirmed by `ExampleTest` passing for the first time this session.
2. **`UserFactory` generated a `name` field** that hasn't existed in the `users` table since the switch to `first_name`/`last_name`. Never caught because nothing called `User::factory()` before. Fixed to match the real schema.
3. **Unauthenticated requests to protected routes returned a raw 500, not 401**, whenever the request didn't send `Accept: application/json` — which is exactly what the frontend's own `fetch()` calls do, and what real browsers do by default. Cause: Laravel's framework default unconditionally redirects guests to a route named `login`, which this pure-JSON API doesn't have, so `route('login')` threw `RouteNotFoundException`. With `APP_DEBUG=true`, this leaked a full stack trace to the client. Fixed in `bootstrap/app.php` via `$middleware->redirectGuestsTo(null)` — this API now always returns a clean JSON 401. Covered by a new regression test using a plain (non-`Json`) request, which is the only way to catch it — `getJson()`/`postJson()` mask it by forcing the `Accept` header.

## 5. Testing

**Backend** — 18 Feature tests (`AuthenticationFlowTest.php`, new), using Laravel's real HTTP-test kernel against a genuinely migrated database (PHP 8.5's CLI here lacks `pdo_sqlite`; ran via `php8.4`, which has it and satisfies the project's own `"php": "^8.3"` constraint):
- register → student role forced even when the client sends `role: admin`; duplicate email → 422; weak password → 422
- login → admin and student both succeed; wrong password → 401
- `/auth/me` → 200 with a valid token, 401 without
- logout → token row is actually deleted from `personal_access_tokens` (asserted at the DB level, not via a second in-process HTTP call — Sanctum's `RequestGuard` caches the resolved user for the guard instance's lifetime, and Laravel's test client reuses one app instance across calls in a method, so a second call would pass even if revocation were broken); logging out one token doesn't affect a second session's token
- cross-role authorization: student → `GET /contact` → 403; admin → 200; no token → 401 (including the plain-request regression test from §4.3)

All 18 pass. Full suite (incl. pre-existing tests) passes; Pint clean project-wide.

**Frontend** — 4 new unit tests for `hasRequiredRole()` (61/61 total passing); production build succeeds.

**End-to-end** (the brief's explicit minimum: register → session → current user → protected resource → logout → invalidation, plus cross-user isolation) — driven two ways, both against a genuinely live stack:

- *Backend, via `curl`* against a real `php artisan serve` process with a throwaway local SQLite DB (this sandbox can't reach the configured MySQL — same limitation as every prior phase): register, duplicate-email rejection, role-injection rejection, `/auth/me`, student blocked from `/contact` (403), no-token blocked (401), admin allowed (200), wrong-password rejection (401), and — critically — logout via one `curl` process followed by re-using the same token in a **separate** `curl` process, which got a real 401. This is the genuine cross-request proof the Feature-test harness quirk (§ "logout" above) couldn't provide.
- *Frontend, via a real browser* (Puppeteer + system Chrome, driving the actual Vite dev server against the actual `php artisan serve`): registration → redirected to `/`; a logged-in student visiting `/admin` never reaches it (denied by `ProtectedRoute`, then bounced past `/login` itself since `Login.jsx` won't show a login form to an already-authenticated user — a better outcome than the test originally assumed); duplicate-email registration shows an inline French error without crashing; admin login → `/admin`; clicking the dashboard's logout button clears the stored token and lands back on `/login`; the just-revoked admin token is independently confirmed rejected (401) by a direct `fetch()` from the page; zero uncaught JS exceptions across the whole run.

All temporary infrastructure (the SQLite file, `puppeteer-core` — installed with `--no-save`, verified afterward to leave zero trace in `package.json`/`package-lock.json` — the two dev servers, the throwaway verification scripts) was removed after use. `.env` was restored to its original MySQL configuration, keeping only the `APP_URL` fix.

## 6. Documentation

`docs/architecture/ARCHITECTURE.md`: domain-model row for **Student** updated from "Not modeled" to "Identity only, as of Phase 4" (explicitly noting no progress/attempt/mastery is linked to it yet); new §9 "Authentication & identity" documenting the route table, session mechanism, the one real authorization boundary, and the frontend route-guard contract; domain-boundary table updated (admin-only → admin-and-student identity). `EXERCISE_CONTRACT.md`'s Attempt-model table updated to reflect that Student identity now exists even though Attempt itself still doesn't reference it.

## 7. What this phase deliberately did not build

Per the brief: student dashboard, progress/mastery system, parent/teacher accounts, AI, gamification, mobile app, subscriptions/payments. A registered student today can log in and that's it — there is nothing behind their session except identity. The one real authorization boundary added (`GET /contact` → admin-only) exists because it was a genuine, immediate PII exposure once self-registration existed, not because this phase built a broader permissions system.

## 8. Known trade-offs, disclosed

- **Token expiration is retroactive.** Sanctum checks `created_at + expiration` against the *current* config value, not a value frozen per-token. Setting `SANCTUM_TOKEN_EXPIRATION=43200` (30 days) means any already-issued admin token older than that will need a fresh login after this deploys — a one-time, expected consequence of closing the "tokens never expire" gap, not a bug.
- **No password-reset flow.** Out of scope for this phase's brief (session/identity foundation, not full account-lifecycle management); a real gap for a production student-facing signup, worth flagging as the next natural piece of this system.
- **`Login.jsx` and `Register.jsx` show Laravel's raw validation summary message on unhandled edge cases** (mirroring the pre-existing `login()` pattern); the common cases (duplicate email, weak password, mismatched confirmation) have French messages, matching `ContactController`'s existing convention. A field-by-field error UI was judged unnecessary complexity for this phase.

## 9. Final safety check

Working-tree diff scoped to: the 4 backend files above, the 1 new backend test file, `config/sanctum.php`, `bootstrap/app.php`, the 7 frontend files above (2 new), and the 2 architecture docs. `.env` (gitignored, never committed) carries only the `APP_URL` correction. No lesson content, no unrelated pre-existing uncommitted work, was touched.
