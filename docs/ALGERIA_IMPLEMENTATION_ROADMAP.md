# Algeria Implementation Roadmap

Companion to `ALGERIA_MIGRATION_AUDIT.md`. This roadmap is grounded in that audit's concrete findings — file paths, table names, and component names referenced below are real, verified locations in `smarter-academy-fr` as of this audit (branch `main`, commit `03199c4`, plus uncommitted admin bulk-action changes noted in the audit's risk #7). No Algeria code, content, or country abstraction has been written; this document plans it.

**Ordering rationale**: the default 14-phase structure from the brief is followed without deviation. The audit's Critical Risks #1 (dormant-content leak) and #2 (curriculum fabrication under pressure) both stem from doing curriculum work before isolation/foundation work is solid — so Phases 1-6 (clone, infra, isolation, RTL, auth, entitlement) are treated as hard prerequisites to any lesson content work (Phases 7+), exactly as the master spec's own Phase 3/Phase 4 split requires.

---

## Phase 1 — Clone and Stabilize

**Status: COMPLETE** (executed 2026-09-14). Independent git repo initialized at `smarter-academy-dz` (branch `main`, commit `ec46a0e`, no remote attached), cloned from `smarter-academy-fr` commit `03199c4` **including** the working tree's uncommitted admin bulk-action changes (`ContentService.php`, `AdminContentController.php`, `routes/api.php`, `BulkActionBar.jsx`, `useBulkSelection.js`, etc.) — per explicit product decision, the audit's suggestion to wait for a clean commit was overridden; Algeria intentionally starts with this in-flight feature included.

**Deviations found and resolved during execution** (documented per instruction to keep docs current when reality diverges from the plan):
1. **Local PHP CLI (8.5) lacks the `sqlite3` extension.** `.env.example` defaults to `DB_CONNECTION=sqlite`, which fails immediately (`could not find driver`). Resolved by using MySQL locally instead (database `smarter-academy-dz`, created by the user) — also more representative of the real deployment target, since French production uses MySQL, not sqlite. Local dev credentials were intentionally reused from `smarter-academy-fr`'s local `.env` (same developer machine, same local MySQL instance) per explicit instruction — this is a local-development convenience, **not** a production secret, and does not violate master spec §2's independent-production-credentials requirement (that gate applies at Phase 2/production, not local dev).
2. **`phpunit.xml` hardcodes `DB_CONNECTION=sqlite` / `DB_DATABASE=:memory:` for the test environment, but a real migration (`2026_09_14_000001_add_source_and_draft_support_to_student_reports.php`) uses raw MySQL-only syntax (`DB::statement('ALTER TABLE student_reports MODIFY category VARCHAR(255) NULL')`)**, which SQLite cannot parse (`near "MODIFY": syntax error`). This is a **pre-existing French-codebase defect**, inherited as-is by the clone — not introduced by cloning, and not something Phase 1 should silently patch (Phase 1 fixes only clone/transit problems, not French architecture). Worked around locally by overriding `DB_CONNECTION`/`DB_DATABASE`/etc. via process environment variables at test-invocation time (Laravel/PHPUnit's `<env>` tags in `phpunit.xml` are overridden by real process env vars), pointed at a separate `smarter-academy-dz-testing` MySQL database. **Recommendation for a future cleanup phase**: either make `phpunit.xml`'s default testing DB MySQL-based (matching what the app actually requires), or rewrite the offending migration using Laravel's schema builder (`Schema::table(...)->change()`) instead of raw MySQL DDL, so the test suite is truly database-agnostic. Not fixed here per the "don't redesign French architecture during Phase 1" rule — flagged for a deliberate decision instead.

**Baseline validation results** (all green): `npm install` clean; `composer install` clean; 49/49 migrations ran clean on a fresh MySQL DB; `npm run check:lessons` passed in full (132 lessons validated, 0 KaTeX issues, `check:level-leak` reports 0 leaks across 24 6e lessons, non-blocking-progression confirmed); `npm test` — 5175 tests passed (201 `packages/core` + 4931 `apps/web` + 43 script tests), 0 failures; `php artisan test` (against MySQL per finding #2 above) — 635/635 tests passed, 2353 assertions; `npm run build` succeeded (one pre-existing chunk-size warning, cosmetic, not investigated further — out of scope for Phase 1).

**Objective**: produce a working, independent copy of the French codebase with zero Algeria-specific changes yet.

**Prerequisites**: none (starting point).

**Files/subsystems affected**: entire repository.

**Implementation tasks**:
1. Coordinate with the French repo owner to clone from a clean, fully-committed state — do not clone mid-way through the currently uncommitted admin bulk-actions work (audit §22 risk #7: `ContentService.php`, `AdminContentController.php`, `routes/api.php`, several `apps/web/src/{components,pages,services}/admin/*` files, plus new `BulkActionBar.jsx`/`bulkContentActions.jsx`/`useBulkSelection.js`).
2. Copy the full repository (`apps/web`, `apps/api`, `packages/core`, `content/`, `docs/`, `scripts/`, root config) into the new Algeria location, with fresh git history (do not fork/clone with the French remote attached).
3. Run `npm install` at the workspace root, `composer install` in `apps/api`.
4. Provision a fresh local MySQL database, run all 49 migrations clean.
5. Run `npm run check:lessons` (validates lessons/exercises, knowledge-dependency audit, KaTeX check, route check, level-leak check, non-blocking-progression check) — this is the existing French CI gate; it should pass unmodified on a straight clone.
6. Run `npm test` (packages/core tests, apps/web tests, script tests) and the Laravel test suite (`apps/api/tests/`).
7. Confirm the SPA builds (`npm run build`) and the Laravel app boots (`php artisan serve`).
8. Remove the root-level SQL dump (`smart-academy-db (2).sql`) from the Algeria copy — it's French reference/content data, not needed (audit §22 risk #11).
9. Strip any French `.env`/`.env.hostinger` files entirely; do not carry forward as templates with real French values, even redacted.

**Migration risks**: cloning mid-change (Critical Risk #7 in the audit) — mitigate via explicit coordination before clone. Accidentally carrying a French secret forward — mitigate by treating `.env*` files as excluded-by-default in the copy step, not copied-then-scrubbed.

**Validation steps**: all of the above commands (build, test, check:lessons) exit 0 on the fresh Algeria copy, with zero code changes beyond removing `.env*`/the SQL dump.

**Definition of done**: matches audit §24 exactly — repo copied, builds, tests pass, no French secrets present, no uncommitted French changes carried over, zero Algeria-specific code yet.

---

## Phase 2 — Independent Infrastructure

**Status: PARTIALLY COMPLETE — code-level independence done; real external provisioning deliberately deferred** (product decision, 2026-09-14: local development continues on the independent codebase while real hosting/OAuth/SMTP accounts are set up later, since Phases 3-5 (dormant-content isolation, RTL, and most of authentication's code) don't require production infra to exist).

**Done now**:
- Independent local MySQL database `smarter-academy-dz` (separate from French `smart-academy-db`), independent local `APP_KEY` (generated fresh, never derived from or equal to any French key).
- `APP_NAME` set to "Smarter Academy DZ" in both `.env` and `.env.example` (was generic "Laravel").
- Local dev DB credentials intentionally reused from the French local `.env` (same developer machine/MySQL instance) — explicit product decision, not a violation of the production-independence requirement, which applies to Phase 2's *production* provisioning below.

**Deferred — concrete checklist for when real infra provisioning happens** (do not skip before any production deploy or before Phase 5/6 production cutover):
- [ ] Independent hosting/deployment target chosen (does not need to be Hostinger like France).
- [ ] Independent production MySQL database (separate instance/credentials/backup schedule from French production).
- [ ] Independent storage (`FILESYSTEM_DISK` target + credentials, e.g. S3-compatible bucket).
- [ ] Production `APP_KEY` generated fresh on the production environment (never reuse the local dev key above).
- [ ] Independent admin bootstrap account (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) — not the same email as any French admin.
- [ ] Google Cloud OAuth client created fresh for Algeria (`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_REDIRECT_URI` pointing at the Algeria domain) — needed before Phase 5 (Authentication) can be production-validated; local dev of the auth code itself can proceed without it (email/password auth doesn't need OAuth).
- [ ] SMTP provider/credentials for `MAIL_*` (verification emails) — independent from French.
- [ ] Independent analytics tool/config, if any is chosen.
- [ ] Independent backup process for the production DB/storage.
- [ ] `content/practice/` path resolution re-verified on the actual chosen deployment target (French docs flag this as fragile across deployments — `smarter:practice-doctor` artisan command exists specifically to catch it).

**Objective**: every piece of runtime infrastructure (deployment, database, storage, secrets, credentials, analytics, backups) is Algeria-owned, with zero dependency on French infrastructure remaining available.

**Prerequisites**: Phase 1 complete.

**Files/subsystems affected**: `apps/api/.env*`, `apps/api/config/*`, deployment target, DB provisioning, storage config (`FILESYSTEM_DISK`, `AWS_*` vars if using S3-compatible storage).

**Implementation tasks**:
1. Provision an independent server/deployment target (does not need to be Hostinger — the French `docs/deployment/HOSTINGER_*` docs are informative for the *shape* of a working deployment, specifically the env-var checklist, but Algeria can choose its own host).
2. Provision an independent production database (separate instance, separate credentials, separate backup schedule from French).
3. Provision independent storage (whatever `FILESYSTEM_DISK` target is chosen — local, S3-compatible, etc.) — separate bucket/credentials from French.
4. Generate a fresh `APP_KEY` (Laravel encryption key) — never reuse the French one.
5. Set up independent admin accounts (`ADMIN_EMAIL`/seed) — not the same email/credentials as any French admin account.
6. Set up independent analytics (whatever tool is chosen — French analytics config, if any beyond what was audited, must not be shared).
7. Set up independent backup process for the new database/storage.
8. Populate the full `.env` var list from the audited `.env.example` shape (~55 vars) with entirely new values — cross-reference audit §10/§11 env var name lists to ensure nothing is missed, especially `GOOGLE_CLIENT_ID`/`SECRET`/`REDIRECT_URI` (deferred to Phase 5, but the OAuth client itself should be created now as an Algeria-owned Google Cloud project).
9. Verify `content/practice/` path resolution works on the new deployment target — the French docs flag this as a known fragile point (`smarter:practice-doctor` command exists specifically because it breaks silently across deployments); run the equivalent check after first deploy.

**Migration risks**: Critical Risk #3 (reused secrets) — the single highest-severity infra risk. Medium Risk #8 (practice content path resolution) — verify explicitly, don't assume.

**Validation steps**: a deployed Algeria instance serves the (still-French-content) app correctly with zero references to French hostnames/credentials/DB in logs or config; `practice-doctor`-equivalent check passes; a credential-diff review confirms no value overlaps with any French `.env`.

**Definition of done**: matches master spec §2's "Required" list in full — new repo (done Phase 1), separate server, DB, storage, env vars/secrets, auth credentials, payment config placeholder (Phase 6+ builds the real thing), admin accounts, analytics, backups.

---

## Phase 3 — Dormant French Content Isolation

**Status: COMPLETE** (executed 2026-09-14). All 8 inherited French grades (6e, 5e, 4e, 3e, seconde, premiere_specialite, terminale_specialite, terminale_complementaires) are physically present (132 lesson folders on disk, DB import unaffected) but unreachable from every active surface checked. `ACTIVE_GRADE_IDS` (`packages/core/curriculum/activeGrades.js`) is the single allowlist — currently **empty**, since no Algerian grade exists yet (correct: Phase 7 adds the first entries here).

**What changed**:
1. **`packages/core/curriculum/activeGrades.js`** (new) — `ACTIVE_GRADE_IDS` + `filterActiveCourseLevels()`. Single source of truth for both frontend and backend gates.
2. **`coursesData.js`** — the full inherited tree is now `allCourseLevels` (unfiltered); `courseLevels` (the name every existing consumer already imports) is `filterActiveCourseLevels(allCourseLevels)`. This one change starves all 14 student-facing frontend consumers (Explorer, MesCours, Courses, StudentHome, Progression, StudentNavbar, GradeSwitcher, etc.) simultaneously — none needed individual edits.
3. **`registry.js`** — `import.meta.glob` result is filtered by the lesson folder's grade-id path segment against `ACTIVE_GRADE_IDS`, as defense in depth below the catalogue.
4. **`App.jsx`** — all 132 French lesson route imports and mount calls removed (mechanically, matched 1:1). Zero lesson routes currently mounted. Re-add a grade's imports once it's added to `ACTIVE_GRADE_IDS`.
5. **`ContentAccess::assertLessonAvailable()`** (backend) — new `assertGradeActive()` check, composed the same way as the existing publication/tier checks (a lesson code shared across a dormant and an active grade stays open via the active one). This closes the API-level gap the frontend-only filter left: a client calling `/api/v1/lessons/{lessonCode}/*` directly with a known French code would otherwise still get in. Gated by `config('curriculum.enforce_active_grades')` (default true; **false** in `phpunit.xml`'s testing env, since the inherited French Feature-test suite creates ad hoc grade fixtures unrelated to grade-activation — see `DormantGradeIsolationTest.php` for this gate's own dedicated coverage with the flag explicitly re-enabled).
6. **`exportCurriculum.mjs` and `scripts/lib/lessonAst.mjs`** — switched to `allCourseLevels`: the DB import and the `validate:lessons`/`check:routes` structural-integrity tooling must see the full inherited catalogue (dormant ≠ invalid), while `check-routes.mjs`'s App.jsx-mount check now requires a mount **only** for active-grade lessons and fails if a dormant one is ever mounted (the isolation failure mode, not just the original missing-mount one).
7. **New CI gate**: `npm run check:dormant-isolation` (`scripts/check-dormant-isolation.mjs`), wired into `check:lessons`. Verifies the active catalogue contains no dormant grade and that `ACTIVE_GRADE_IDS` has no typo pointing at a nonexistent grade. Kept deliberately separate from `check:level-leak` (`scripts/audit/check-3e-leak.mjs`), which — contrary to what its name suggests and what the migration audit's open questions flagged for verification — is an **unrelated pedagogical vocabulary check** (does 6e content use 3e-level vocabulary?), not a grade-activation check; this resolves that audit open question.
8. **Test fixes**: 3 pre-existing tests (`coursesData.test.js`, `learningPoints.test.js`, `catalogue.test.js`) that asserted catalogue *presence* now correctly run against `allCourseLevels` (data-shape invariants, independent of activation) instead of `courseLevels`. `resumePath.test.js`'s number→slug bridge test now sources its fixture lesson dynamically via a new `getAnyRegisteredLessonId()` test helper instead of a hardcoded dormant `seconde` lesson id, and skips (not fails) while zero grades are active. New: `registry.test.js` (frontend) and `DormantGradeIsolationTest.php` (backend) directly cover the isolation mechanism itself.

**REVISED 2026-09-16 (takeover audit — see `ALGERIA_TAKEOVER_IMPLEMENTATION_REPORT.md`)**: two defects were found in this phase and fixed.
(a) *Duplicate activation authority.* The backend gate read `config('curriculum.active_grades')`, fed by a `CURRICULUM_ACTIVE_GRADES` env var that was empty and never wired to `activeGrades.js` — frontend and API could disagree silently. Activation now travels with the catalogue: `exportCurriculum.mjs` emits `active` per grade → `smarter:import-curriculum` mirrors it into a new `grades.is_active` column → `ContentAccess` reads that column. The duplicate config key was removed; `smarter:registry-health` reports source↔database drift.
(b) *Admin exposed dormant grades*, which master spec §20 forbids. `ContentService` (lessons/modules/exercises) and `AnalyticsService::content` now filter on `grades.is_active` unless `scope=all` is passed explicitly, and the admin grade dropdowns derive from the active catalogue instead of a hard-coded French array. Covered by `DormantGradeIsolationTest`.

**Operational note**: after changing `ACTIVE_GRADE_IDS`, re-run `node packages/core/curriculum/exportCurriculum.mjs && php artisan smarter:import-curriculum`, then `php artisan smarter:registry-health` to confirm no drift. This is not yet a CI gate — recommended before Phase 8.

**Verification performed**: `npm run check:lessons` passes in full including the new gate; `npm test` (5175→5172+4 skipped, net same coverage) and `php artisan test` (640/640, +5 new) pass; production build succeeds and the main JS bundle shrank from 1735 kB to 1367 kB (dormant lesson code is no longer bundled, not just hidden); manually confirmed via the dev server that `App.jsx` as served contains zero lesson-route imports and `registry.js` carries the active-grade filter; curriculum DB import re-run confirms all 8 grades/133 lessons/1067 LPs remain physically present in MySQL.

**Objective**: every French grade (6e, 5e, 4e, 3e, seconde, premiere_specialite, terminale_specialite/complementaires placeholders) becomes physically present but undiscoverable through any active surface, before any Algeria-specific UI or curriculum work begins — so that all subsequent phases are built and tested against an already-isolated baseline.

**Prerequisites**: Phase 1 (clean clone) complete. Does not require Phase 2 (can be done against local dev).

**Files/subsystems affected** (per audit §15, the three concrete leak points):
- `apps/web/src/lessons/registry.js` (glob-based auto-discovery — highest priority)
- `packages/core/curriculum/coursesData.js` (bundled catalogue)
- `apps/web/src/App.jsx` (route mounting, ~100+ manual per-lesson imports)
- `apps/api/app/Domain/Access/ContentAccess.php` (server-side closed-inventory pattern to extend)
- `apps/web/src/pages/admin/content/Lessons.jsx` (existing `GRADES` constant/filter UI pattern to reuse as the allowlist seed)
- `apps/web/public/sitemap.xml`, `robots.txt` (already narrow — verify, don't need rework)

**Implementation tasks**:
1. Define a single server-side "active grades" list — recommend a config value (e.g. `config('curriculum.active_grades')` backed by an env var or a `grades.is_active` boolean column) rather than duplicating the list in multiple frontend files.
2. Filter `coursesData.js`'s exported `courseLevels`/`getAllGrades()` so only active grades are shipped in the bundle at all — this is the highest-leverage single change, since it starves every downstream consumer (nav, admin catalogue default view, any future search/sitemap generation) at the source.
3. Filter `registry.js`'s `import.meta.glob` result (`configByLessonId`) by the same active-grades list, as defense in depth even after step 2.
4. Audit and update `App.jsx`: remove/comment the ~100+ French lesson route imports for inactive grades, keeping the files physically present on disk (do not delete lesson folders).
5. Extend `ContentAccess::closedInventory()` (or add a parallel, consistently-composed check) to treat lessons under inactive grades as closed — following the exact pattern already used for publication-status and tier closures, so the same student-facing "why is this closed" messaging mechanism applies.
6. Update `apps/web/src/pages/admin/content/Lessons.jsx`'s `GRADES` constant to default-filter to active grades (while still allowing an admin to view dormant content explicitly if needed for verification — this is an admin convenience, not a security boundary, per the audit's classification of that file).
7. Verify sitemap/robots stay narrow (no dormant-grade URLs) — low effort given current state, but re-verify after Algeria's own marketing pages are added in Phase 13.
8. Investigate and, if suitable, extend the existing `scripts/audit/check-3e-leak.mjs` (`npm run check:level-leak`) into a general "no inactive-grade content reachable from active surfaces" CI gate (flagged `UNKNOWN — REQUIRES VERIFICATION` in the audit — its current exact logic needs reading before deciding whether to extend or replace it).
9. Manually verify via running app: navigate every discovery surface (nav, course browser, search if any, admin default views) and confirm zero French dormant-grade content is reachable by an anonymous or student user.

**Migration risks**: Critical Risk #1 (dormant-content leak) is exactly what this phase exists to close — treat it as the primary acceptance criterion. Medium Risk #10 (route-mount omission) — a lint/check script (task 8) mitigates silent regressions later.

**Validation steps**: automated CI check (once built) passes; manual click-through of every nav/admin/catalogue surface finds zero French-grade content; `GET` requests to any French lesson-code API endpoint return "not found"/closed rather than content, even for an authenticated student.

**Definition of done**: matches master spec §3's "must NOT appear in" list in full (student navigation, active curriculum, lesson discovery, search, progression, recommendations, active routes, active admin content, public SEO pages, sitemap, active API exposure) — verified against each item individually, not assumed from the registry/catalogue fix alone.

---

## Phase 4 — Arabic / RTL Foundation

**Status: COMPLETE for the shared shell/foundation scope; lesson content deferred** (executed 2026-09-15; audited and corrected 2026-09-16 — see `ALGERIA_TAKEOVER_IMPLEMENTATION_REPORT.md` §5, §6, §10). Scope was calibrated after the initial file audit found the RTL-touching surface much larger than the audit's original estimate (656 files / 3356 occurrences sitewide vs. the audit's 222/469, which was scoped to `components/` only) — the vast majority (573 of 656 files) is dormant French lesson content under `lessons/college/`/`lessons/lycee/`, which per Phase 3 has zero mounted routes today and will be revisited per-lesson when real Algerian content is authored (Phase 8/9), not retrofitted blind. Foundation work covered the genuinely load-bearing ~90 files: `apps/web/src/components/` (24), `apps/web/src/pages/` (22), `apps/web/src/features/` (4), and `apps/web/src/lessons/common/` (the shared lesson-kit/Knowledge Map engine every future lesson inherits, ~19 files touched).

**Architecture chosen**:
- **Locale**: `apps/web/src/locale.js` — `LOCALE = 'ar-DZ'`, `DIRECTION = 'rtl'`, `IS_RTL`. A fixed constant, not a country-switcher (master spec §2 forbids multi-country abstraction) — this repo serves exactly one product.
- **RTL CSS strategy**: Tailwind's native `rtl:`/`ltr:` variants (built into Tailwind 3.3+, generates `[dir="rtl"] &` selectors, no plugin needed) applied surgically per-utility, not a blanket logical-property rewrite. Chosen over `ms-`/`ps-`/`start-`/`end-` logical utilities for lower risk: each flip is an individual, reviewable, revertible decision rather than a mechanical find-replace across the whole utility vocabulary.
- **i18n**: `react-i18next`, initialized in `apps/web/src/i18n/index.js`, three namespaces so far (`common`, `nav`, `auth`) with real Arabic translations in `apps/web/src/i18n/locales/ar/*.json`. Scoped to shared-shell strings only (auth pages, nav, common buttons/errors) per master spec §4/§23 — lesson/curriculum content is explicitly NOT translated in this phase. "Smarter Academy"/"Google" kept in Latin script throughout, per explicit product decision.
- **Typography**: Tajawal (Google Fonts) added alongside the existing Space Grotesk/Inter/JetBrains Mono, applied as the `[dir="rtl"] html`/`body`/headings default in `index.css` (not a per-component override, since ar-DZ is the only locale this repo serves) — `tailwind.config.js` also exposes it as `font-arabic` for explicit use. Body line-height raised to 1.85 under RTL (1.6 default) per master spec §14's "avoid extremely tight Arabic typography."
- **Math LTR isolation**: `MathText.jsx` (the KaTeX chokepoint, 364+ importers) wraps every rendered expression in `<span dir="ltr" style={{direction:'ltr', unicodeBidi:'isolate'}}>` — one change protects every call site. `MathInput.jsx` (MathLive, currently dead code / zero importers per the audit) gets the same `dir="ltr"` + `unicodeBidi: isolate` treatment defensively. `CoordPlane.jsx` (907-line hand-rolled SVG grapher) gets `dir="ltr"`/`direction: ltr` on its `<svg>` root to protect `textAnchor` label positioning from bidi influence — the coordinate system itself was never mirrored (spec §14 explicit requirement).
- **Knowledge Map is mirrored (REVISED 2026-09-16).** The previous pass documented "stays right-docked in both directions" as an accepted exception. On review this was a functional defect, not a trade-off: under RTL the sidebar occupies the right edge, so an unmirrored panel opens *on top of it*. The end-edge is now derived from `IS_RTL` in one place per case — the three geometries (drawer / column / expanded), the slide-in sign, and the resize-handle maths — with logical utilities for borders and radii (`border-s`, `rounded-es-*`). Verified in-browser: under RTL the panel occupies the left edge and `<main>` reserves the gutter on the left and the rail on the right; under LTR, exactly the reverse.

**Objective**: establish Arabic as the primary UI language with correct RTL layout, while keeping mathematical content correctly oriented — as a foundational platform capability, before any Algeria-specific pages/lessons are built on top of it.

**Prerequisites**: Phase 1 complete. Independent of Phases 2-3 but should follow Phase 3 in practice so RTL work isn't done against a UI still showing French dormant-content surfaces.

**Files/subsystems affected**: `apps/web/index.html` (root `lang`/`dir`), `apps/web/tailwind.config.js`, `apps/web/src/index.css`, all `apps/web/src/components/` (469 occurrences of physical-direction Tailwind utilities across 222 files per the audit), `apps/web/src/lessons/common/components/MathText.jsx` (KaTeX chokepoint, 364 importers), `apps/web/src/lessons/common/components/CoordPlane.jsx` (907 lines, 118+ usages), i18n framework (net-new dependency).

**Implementation tasks**:
1. Introduce an i18n framework (net-new — audit confirms none exists today; e.g. `react-i18next` or similar, chosen based on team preference) and extract hardcoded French UI strings into translatable resources, starting with `apps/web/src/data/navigation.js` and shared components, then page by page.
2. Set `<html lang="ar" dir="rtl">` (or dynamic based on locale `ar-DZ`) at the document root.
3. Add an RTL-aware Tailwind setup: either adopt logical-property utilities (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`) sitewide, or a systematic `rtl:`-variant strategy — this is a real migration across ~222 files, not a config flag; budget accordingly.
4. Fix `apps/web/src/index.css`'s hardcoded `padding-left`/`padding-right` sidebar layout (`.sa-workspace-main`) to be direction-aware.
5. Audit and fix the highest-traffic layout components first: `StudentNavbar.jsx`, `AdminSidebar.jsx`, `Navbar.jsx` (per audit §13 — includes fixing the Framer Motion `x: -20` slide-in direction, which currently reads backwards under RTL).
6. Establish Arabic typography: choose appropriate Arabic-supporting font(s) — do not reuse French font choices blindly (master spec §14) — and verify readability at the existing type scale (`apps/web/tailwind.config.js`'s customized `fontSize` scale, which was tuned for French Latin-script reading).
7. Wrap the KaTeX chokepoint (`MathText.jsx`) with explicit `dir="ltr"`/`unicodeBidi: isolate` handling — per the audit, this single component change likely resolves most inline/block math directionality issues across all 364 call sites without touching them individually.
8. Audit `CoordPlane.jsx` and any other SVG-based math visualizations for LTR-axis assumptions; verify (don't assume) that axes/labels render left-to-right-ascending correctly inside an RTL page shell.
9. Test icon mirroring conventions (which icons should flip — e.g. back/forward arrows — vs. stay fixed — e.g. play/pause) and apply consistently; this was flagged `UNKNOWN — REQUIRES VERIFICATION` in the audit and needs a deliberate design pass, not ad hoc per-component decisions.
10. Build a small internal test page/harness exercising: Arabic text alone, Arabic + Latin numerals, Arabic + inline math, fractions, powers, inequalities, equations, graph labels, an interactive diagram, and mobile viewport — per master spec §14's explicit test list.

**Migration risks**: High Risk #5 (RTL retrofit scope underestimated) is the central risk this phase manages — treat as a multi-week foundational effort with component-by-component sign-off, not a bulk find-replace followed by a quick visual check.

**Validation steps**: the test harness (task 10) is reviewed and signed off; a full click-through of the existing (still French-content, now Arabic-shell) app in Arabic/RTL mode shows no obviously broken layout, no mirrored math, no truncated/overlapping Arabic text; mobile viewport (375px) verified per master spec's mobile requirement.

**Definition of done**: matches master spec §24 "Arabic" Definition-of-Done section — complete RTL UI, correct mathematical LTR rendering, mixed Arabic/math rendering validated. (Official Algerian terminology is explicitly deferred to Phase 7+, since it depends on curriculum sources not yet available.)

**Automated validation performed**: `npm run check:lessons` (full gate, incl. `check:dormant-isolation`) passes; `npm test` — 200 `packages/core` + 4929 `apps/web` (4 intentionally skipped, pre-existing/unrelated to this phase) + 43 script tests, all passing; `php artisan test` — 640/640 (backend untouched by this phase, re-run to confirm no regression); production build succeeds.

**Manual/browser QA performed** (Playwright against a production preview build, `http://localhost:4173`, on a port that did not conflict with the developer's own dev server): confirmed `dir="rtl" lang="ar"` served on every page checked (home, login, register, courses, méthode, FAQ, tarifs); screenshotted desktop (1280×900) and mobile (390×844) viewports; opened the mobile nav drawer and confirmed RTL slide-in direction and right-alignment; built a standalone, non-committed probe page rendering `MathText` output (inline equation embedded in an Arabic sentence, a display fraction, an inequality, `f(x)=2x+1`) and confirmed via computed styles that every KaTeX output has `direction: ltr` and `unicode-bidi: isolate`, with a screenshot confirming correct visual left-to-right math rendering embedded correctly within right-to-left Arabic sentence flow.

**KaTeX**: PASS (see probe above) — inline and block math both render correctly LTR-isolated inside RTL Arabic text, verified visually and via computed CSS.

**MathLive**: `UNKNOWN — REQUIRES VERIFICATION`. `MathInput.jsx` (the `<math-field>` wrapper) received the same defensive `dir="ltr"`/`unicodeBidi: isolate` treatment as `MathText.jsx`, but per the audit it has zero real importers today (dead code) — there is no live surface to test actual caret/input/editing behavior against. Must be re-verified once a real exercise wires it in (Phase 8+ or if MathLive is revived earlier).

**Graphs / coordinate planes**: PASS by code review, `UNKNOWN — REQUIRES VERIFICATION` visually. `CoordPlane.jsx` uses only explicit numeric SVG coordinates (no CSS logical properties), and now forces `dir="ltr"`/`direction: ltr` on its `<svg>` root to protect `textAnchor` label anchoring from any bidi influence. Could not be visually verified live: `CoordPlane` is only used inside lesson content, none of which is currently mounted (Phase 3 isolation — zero lesson routes active). Re-verify once any lesson using it is activated.

**Icon mirroring**: applied case-by-case rather than blanket rules, per audit §9's own caution against ad hoc per-component decisions — but each decision here was principle-based and documented inline, not arbitrary: `ArrowRight`/`ArrowLeft` (CTA "forward" direction) swap via `IS_RTL`; `ChevronLeft`/`ChevronRight` (sidebar collapse toggles) swap to point toward the edge the sidebar collapses into, which itself changed under RTL; `PanelLeftOpen`/`PanelLeftClose` (admin sidebar toggle) swap since their meaning is literally "panel is on the left"; `CornerDownLeft` (a fixed ⏎ Enter-key glyph) and any icon representing a fixed keyboard/UI convention were deliberately left unmirrored. Not exhaustively audited across every icon in the codebase — flag `UNKNOWN — REQUIRES VERIFICATION` for icons in files outside this phase's ~90-file scope (i.e., inside dormant lesson content).

**Animations**: `Navbar.jsx`'s mobile-menu item slide-in (`x: -20` → `x: IS_RTL ? 20 : -20`) now enters from the reading-start side in both directions. Other Framer Motion usage audited was vertical (`y`) or opacity/scale-based, not direction-sensitive, and left unchanged.

**Real bug found and fixed during this phase's QA** (not an RTL issue, but discovered via the same browser testing): `Courses.jsx` crashed (`Cannot read properties of undefined (reading 'grades')`) because it assumed `courseLevels` always has at least one grade — true throughout Phase 3's design but never actually true once dormant-grade isolation shipped with zero active grades. Fixed with an explicit "no active curriculum yet" empty state (translated, RTL-correct) rather than reworking the page's whole fallback chain. This will need revisiting anyway once Phase 7 adds the first real Algerian grade.

**Defects found by the 2026-09-16 audit and fixed** (all were invisible to a build-only check):
- `[dir="rtl"] html { font-family: Tajawal }` **could never match** — `<html>` has no ancestor — so Arabic rendered in Inter/Space Grotesk, neither of which has Arabic glyphs. Tajawal is now the Arabic *fallback inside every stack*, which also makes mixed Arabic/Latin lines correct (Latin keeps the identity font, Arabic resolves per glyph).
- `MathText` wrapped `BlockMath` (a `<div>`) inside a `<span>` — invalid DOM, reparented by browsers. Block math is now a `<div>`, inline a `<span>`, via `.sa-math-*` classes.
- 105 physical/`rtl:` utility *pairs* were collapsed to logical utilities (`ps-*`, `start-*`, `border-s`, `text-start`, `rounded-es-*`). Physical values were kept deliberately where the element itself is physical: the password toggle sits at its `dir="ltr"` field's end, and `translate-x` nudges/knobs are mirrored explicitly because transforms do not follow direction.
- Directional icons were hard-coded in 22 files (plus a literal `→` in `LessonCard`), so "forward" pointed backwards in Arabic. They now resolve through `components/common/DirectionalIcons.jsx`; fixed-meaning glyphs (⏎ Enter, play, math arrows) are deliberately excluded.
- Navigation strings lived as French copy in `navigation.js` / `studentNavigation.js`; they now carry `labelKey`s resolved through the `nav` i18n namespace. Admin navigation stays French on purpose (staff surface — Phase 12).

**Known limitations / deferred work**:
- Lesson content itself (573 files under `lessons/college/`/`lessons/lycee/`) was not touched — dormant, unmounted, and will be addressed per-lesson in Phase 8/9 rather than retrofitted now.
- Legal content (`LegalConsentCheckbox.jsx`'s CGU/privacy consent text, and the `LegalPage.jsx`-rendered CGU/Confidentialité/Mentions Légales page bodies) stays in French — translating legally-binding text requires the real Algerian legal documents, out of scope here; only the surrounding structural markup (list/table RTL layout) was fixed.
- Marketing/content copy (Home, Méthode, FAQ, Tarifs, About) stays in French — visible in the QA screenshots as French sentences with visually-reversed punctuation (a correct Unicode bidi consequence of LTR French text inside an RTL-directed paragraph, not a bug — but it will only look right once real Arabic content replaces it). Copy translation is content work, not infrastructure, and Tarifs additionally still shows Stripe-era pricing (Phase 6's job to remove).
- Icon-mirroring is centralised for the live tree; dormant lesson content (573 files) is untouched and handled per-lesson in Phase 8/9.
- MathLive remains dead code (zero importers): its RTL caret/selection behaviour is `UNKNOWN — REQUIRES VERIFICATION` until a real exercise uses it.
- No *real lesson page* has been rendered under RTL, because none is mounted. The lesson engine's RTL behaviour is verified only through a temporary probe of its components — full visual QA belongs to Phase 8.

---

## Phase 5 — Authentication

**Objective**: an independent authentication system (email/password + Google OAuth) with zero shared credentials, sessions, or callback URLs with the French production system.

**Prerequisites**: Phase 2 (independent infra/secrets) complete for production; can be developed against Phase 1's local clone earlier.

**Files/subsystems affected**: `apps/api/app/Http/Controllers/{AuthController,GoogleAuthController,EmailVerificationController}.php`, `apps/api/app/Domain/Identity/*`, `apps/api/config/{sanctum,services}.php`, `apps/web/src/context/AuthContext.jsx`, `apps/web/src/services/authService.js`, `apps/web/src/pages/{Login,Register,AuthGoogle,VerificationEmail}.jsx`.

**Implementation tasks**:
1. Reuse the auth mechanism as-is (email+password via Sanctum bearer tokens, Google OAuth via Socialite) — per audit §10, this is architecturally sound and grade/country-agnostic.
2. Create an Algeria-owned Google Cloud OAuth client (if not already done in Phase 2) with an Algeria callback URL (`GOOGLE_REDIRECT_URI` pointing at the Algeria domain) — never reuse the French OAuth client.
3. Configure independent `SANCTUM_TOKEN_EXPIRATION`/`SANCTUM_STATEFUL_DOMAINS`/`SANCTUM_TOKEN_PREFIX` for the Algeria domain.
4. Configure independent SMTP (`MAIL_*` vars) for verification emails — do not reuse French mail credentials.
5. Set `LEGAL_TERMS_VERSION`/`LEGAL_PRIVACY_VERSION` for Algeria-specific legal documents (drafted separately, out of this audit's scope).
6. Translate/localize the auth-related UI pages (`Login.jsx`, `Register.jsx`, `VerificationEmail.jsx`, `AuthGoogle.jsx`) into Arabic, applying the RTL foundation from Phase 4.
7. Verify grade-selection onboarding (`ChooseGrade.jsx`) only offers Algeria's active grades (4AM, Terminale-DZ) — this depends on Phase 3's isolation work and Phase 7's grade-catalogue update; if Phase 7 hasn't landed yet, temporarily hardcode the two Algeria grade options here rather than exposing the full French grade list.
8. Set an Algeria-specific `ADMIN_EMAIL` bootstrap seed, distinct from any French admin account.

**Migration risks**: Medium risk — misconfigured OAuth callback URL is a common go-live bug (explicitly called out in audit §10); verify in a staging environment before production cutover.

**Validation steps**: register/login/logout/Google-OAuth/email-verification all function end-to-end against Algeria's own infra; a test confirms no request ever reaches a French-owned endpoint or credential; Arabic/RTL rendering of all auth pages verified per Phase 4's harness.

**Definition of done**: matches master spec §19 and the "independent authentication" line of §24 Definition of Done — auth infrastructure reused, but OAuth credentials/secrets/callback URLs/DB records/sessions/production config are all completely separate from France.

---

## Phase 6 — Activation Code / Entitlement System

**Status: COMPLETE** (executed 2026-09-16 — voir
`ALGERIA_PHASE6_IMPLEMENTATION_REPORT.md` pour le détail, les tests et la QA
navigateur).

**Ce qui a été construit** : tables `activation_code_batches` et
`activation_codes` ; `Entitlement::TYPE_ACTIVATION_CODE` ; génération,
saisie, révocation (avec cascade sur le droit) et export ; page élève arabe
`/espace/activation` ; trois écrans d'administration ; Stripe démonté du
produit actif.

**La couche d'accès n'a pas été remplacée.** `ContentAccess` et `AccessTier`
sont inchangés : le code d'activation ajoute un TYPE de droit, ce que la
conception prévoyait (`entitlements.type` est documentée comme additive).
Vérifié par test : un code valide n'ouvre rien d'une classe dormante.

**Décisions prises avec le propriétaire** :
- le code n'est stocké que haché (HMAC-SHA256 depuis APP_KEY) ; les codes en
  clair ne sont montrés qu'une fois, à la génération ;
- un code DÉJÀ activé peut être révoqué, et ferme alors l'accès de l'élève ;
- Stripe : l'interface est démontée, le backend reste dormant sur le disque.

**Deux tâches de la reprise précédente fermées ici** : la dérive d'activation
est devenue une porte d'intégration continue (`npm run check:activation-drift`,
qui surveille aussi le PALIER — dérive commerciale jusque-là non surveillée),
et le moteur de leçon a été rendu et regardé sous RTL via une surface de QA
isolée (`apps/web/src/qa/rtlLessonFixture/`, absente du lot de production).

**Défauts réels trouvés et corrigés en chemin** : `NumberLine` et quatre
autres figures partagées n'étaient pas épinglées LTR (les étiquettes
négatives s'affichaient « 5- ») ; le déclencheur de la carte des
connaissances était inatteignable sous RTL (posé sous la barre latérale) ;
`RegistryHealthService::structural()` levait sur une collection Eloquent ;
`config/cors.php` autorisait en dur le domaine de production FRANÇAIS et
aucun domaine algérien.

**Reste ouvert** : la sélection des trois leçons gratuites (`freeLessons.js`
existe et est vide — aucune leçon algérienne n'existe encore) ; la carte des
connaissances et le corps des pages élève restent en français.

**Objective**: implement server-authoritative premium access via cash-purchased activation codes, extending the existing `Entitlement`/`ContentAccess` architecture rather than rebuilding it.

**Prerequisites**: Phase 5 (auth) complete — activation codes are redeemed by authenticated students. Phase 2 (independent infra) for production secrets/rate-limiting infra if applicable.

**Files/subsystems affected**: `apps/api/app/Models/Entitlement.php` (extend `TYPES` constant), `apps/api/app/Domain/Access/*` (reuse, do not rewrite), new `ActivationCode` model + migration, new redemption controller/service, new admin controller/UI (replacing `apps/web/src/pages/admin/subscriptions/Subscriptions.jsx`), `apps/api/app/Domain/Billing/*` (remove per Phase 2/ongoing cleanup — see task 7 below).

**Implementation tasks**:
1. Add a new `activation_codes` table: `code` (unique), `status` (available/activated/expired/revoked per master spec §17), `created_at`, `activated_at`, `activated_by` (FK to users), `expiration`, `plan`/`access_level`, `notes`, `batch_id` or similar for export/tracking, `created_by` (admin).
2. Extend `Entitlement::TYPES` to include `activation_code` (the column is already a free string designed for additive types per audit §12 — no schema change needed on `entitlements` itself).
3. Build `ActivationCodeRedemptionService`: validates a submitted code (exists, status=available, not expired), and in one transaction: marks the code `activated` (with `activated_at`/`activated_by`), and writes a new `entitlements` row (`type=activation_code`, `source`/`reference` pointing at the code, `expires_at` per the code's configured plan/duration).
4. Build `POST /activation-codes/redeem` endpoint — apply rate-limiting/throttle middleware modeled on the existing `throttle:6,1` pattern used on `/auth/login` (audit §12 flags this as directly reusable), to satisfy master spec §17's "rate-limited... protected against brute force" requirement.
5. Do not modify `EntitlementService`, `ContentAccess`, or `AccessTier` — per the audit, these are already correct for this use case once the new entitlement type exists.
6. Build admin screens: generate codes (batch, with plan/expiration/notes), list/search codes (status, redemption date, redeemed-by), activate/revoke actions (revoke should set the code `revoked` AND revoke the associated `entitlements` row via the existing `EntitlementAdminService::revokeOverride`-equivalent path, or a new parallel method), export (CSV), and surface `admin_activity_logs` entries for every code action (the audit-trail table already exists generically, per audit §12/§18 — no new audit infrastructure needed).
7. Remove Stripe/Billing entirely: `apps/api/app/Domain/Billing/*`, `Http/Controllers/{ProviderWebhookController,BillingCheckoutController,BillingSubscriptionController}.php`, `Http/Controllers/Admin/{AdminProviderEventController,AdminSubscriptionController}.php` (or repurpose `AdminSubscriptionController`'s frontend counterpart into the new activation-code admin UI rather than deleting the screen concept), `Models/{Subscription,Payment,ProviderEvent}.php` and their migrations (or leave the tables unused/dormant if a future online-payment phase wants to revive them — master spec §18 allows future real Algerian payment integration), `config/billing.php`, the `stripe` block in `config/services.php`, `apps/web/src/pages/{Tarifs,Abonnement,AbonnementRetour}.jsx`, `services/billingService.js`, `components/pricing/PricingCard.jsx`.
8. Configure the "first 3 lessons free" rule using the existing `lessons.tier` field (already free/premium per lesson, defaulting to `free`) — mark exactly which lessons are free per master spec's product decision (flagged `UNKNOWN — REQUIRES VERIFICATION` in the audit whether this means literally the first 3 in sequence or 3 curated lessons — resolve this as an explicit product decision before content tagging).
9. Update student-facing UI: `usePremiumStatus.js` hook and lock/badge UI in `LessonCard.jsx` are generic and reusable as-is (per audit §11); build a new "enter activation code" UI flow (likely in `Profil.jsx` or a dedicated page) replacing the old `Abonnement.jsx` checkout flow.

**Migration risks**: High Risk #4 (client-side answer correctness) is unrelated to entitlements directly but is adjacent — ensure activation-code-gated premium content doesn't compound that risk (e.g., don't gate answer-correctness logic behind entitlement checks in a way that implies false security). Low risk otherwise — this phase is additive to well-tested existing infrastructure.

**Validation steps**: full activation-code lifecycle test — generate code, redeem as student, verify premium access granted server-side (not just UI-hidden), verify invalid/expired/already-used/revoked codes are all correctly rejected with clear messaging, verify rate-limiting triggers on repeated failed attempts, verify admin can view full redemption history and revoke access.

**Definition of done**: matches master spec §17/§18/§24 "Access" section in full — 3 free lessons, premium lessons locked, cash activation-code workflow functional, server-authoritative premium access, no active Stripe UI anywhere reachable.

---

## Phase 6F — DZ Catalogue and Database Scope Cleanup

**Status: COMPLETE** (executed 2026-09-16 — see
`ALGERIA_PHASE6F_DATA_SCOPE_IMPLEMENTATION_REPORT.md` for full detail, counts
and tests).

**Objectif** : la phase 3 gardait le curriculum français physiquement en
base, seulement dormant. Avant que la phase 7 ne commence à écrire des
leçons algériennes, le catalogue ET la base ne devaient plus porter le
français comme périmètre actif — plus seulement le cacher.

**Ce qui a changé** : `coursesData.js` distingue désormais `dzCourseLevels`
(le catalogue produit, deux classes : `4am` sous `moyen`, `terminale_dz` sous
`thanawi`) de `referenceCourseLevels` (l'arbre français hérité, réservé à
l'outillage de validation des 132 dossiers de leçons restés sur le disque —
`scripts/check-dormant-isolation.mjs` fait échouer la construction si un
fichier produit importe ce second nom). `ACTIVE_GRADE_IDS` porte les deux
classes DZ. Le programme officiel 4AM (4 domaines, 28 sujets,
`packages/core/curriculum/dz/programme_4am_2026_2027.json`) alimente le
catalogue par une fonction dédiée (`buildDzCourseLevels()`) — aucun intitulé
arabe n'est retapé ailleurs. **Aucune leçon 4AM n'a été créée** : les 28
sujets sont portés par leur chapitre (`chapters.topics`, nouvelle colonne),
et le découpage en leçons reste une décision de la phase 7.

Une nouvelle commande Laravel, `smarter:scope-curriculum`, complète l'import
(qui ne supprime jamais rien) : elle retire de la base tout curriculum hors
du périmètre déclaré par l'export, lit le graphe de clés étrangères depuis
le schéma plutôt que de le supposer, refuse toute perte de données élève
sans double confirmation explicite, et refuse inconditionnellement de
s'exécuter en production. `smarter:registry-health --gate` détecte désormais
une classe hors périmètre comme une catégorie d'échec à part, distincte de
la dérive d'activation.

**Résultat mesuré** : la base de développement locale est passée de 8
classes / 36 chapitres / 133 leçons / 1067 points d'apprentissage (toutes
françaises, toutes dormantes) à exactement 2 classes / 4 chapitres / 0 leçon
/ 0 point / 28 sujets. Comptes/droits/codes d'activation inchangés (aucune
colonne de curriculum ne les relie). Un ré-import après nettoyage laisse la
base à 2 classes — testé comme régression permanente.

**Second identifiant confirmé, pas deviné** : `ALGERIA_PLATFORM_MASTER_SPEC.md`
§3 nomme explicitement Terminale / السنة الثالثة ثانوي comme seconde classe
du périmètre initial ; son identifiant technique (`terminale_dz`/`thanawi`)
a été fixé avec le propriétaire, aucun programme n'existant encore pour elle.

**Défauts réels trouvés et corrigés en chemin** : `Courses.jsx` retombait sur
un identifiant de niveau français (`college`) codé en dur comme repli, ce qui
aurait laissé la page afficher « bientôt disponible » sous un catalogue
purement algérien ; les formes plurielles arabes du compteur de sujets ne
couvraient que 2 des 6 catégories que distingue réellement l'arabe
(`Intl.PluralRules`), affichant la clé brute à l'écran ; la grille de cours
affichait un message « aucun cours ne correspond » sous une classe qui n'a
simplement aucune leçon — trouvés par vérification navigateur, pas par les
tests unitaires seuls.

---

## Phase 7 — Algerian Curriculum Foundation

**Status: COMPLETE** (executed 2026-09-16 — voir
`ALGERIA_PHASE7_CURRICULUM_DECOMPOSITION_REPORT.md`).

**Ce qui a été fait** : le programme 4AM (4 domaines, 28 sujets) a été découpé
en **28 leçons — une par sujet officiel**, portant **185 points
d'apprentissage**. La règle de découpage (« un sujet = une leçon ») et tous les
intitulés arabes — descriptions, prérequis, points d'apprentissage, durées,
difficultés — ont été **fournis par le propriétaire du projet**, pas produits
par l'outil : le programme ne fixe ni répartition horaire, ni progression
annuelle, ni attendus de fin de cycle, donc scinder un sujet aurait voulu dire
inventer une frontière que la source ne donne pas.

Le découpage vit dans `packages/core/curriculum/dz/lessons_4am_2026_2027.json`,
dérivé du programme et jamais concurrent de lui : chaque leçon déclare son
`sourceTopicId`, et `dz/decomposition.test.js` (18 tests) vérifie la
traçabilité dans les deux sens — tout sujet a une leçon, toute leçon a un
sujet, aucun sujet inventé. La chaîne catalogue → export → base est inchangée :
la base porte désormais 2 classes, 4 chapitres, 28 leçons, 185 points.

**Ce qui n'a PAS été fait, délibérément** : aucun contenu de leçon (modules,
exercices, évaluations, figures), aucune route montée, et le choix des trois
leçons gratuites reste ouvert. Les prérequis restent textuels plutôt que
transformés en graphe inter-leçons, une partie d'entre eux relevant des années
1AM–3AM dont le programme n'a pas été fourni.

**Reste ouvert** : la relecture du découpage par une autorité curriculaire
externe, que la section « Validation steps » ci-dessous exige et qui n'a pas
encore eu lieu.

**Objective**: build the Algerian curriculum source-of-truth structure from official sources — this phase cannot begin until official Algerian curriculum documents are supplied.

**Prerequisites**: Phases 1-6F complete (clone stable, infra independent, dormant content isolated, RTL foundation in place, auth and entitlement working, **DZ catalogue/database scope cleaned — Phase 6F**). Phase 7 must not begin against a database that still carries the French curriculum as active scope.

**MISE À JOUR 2026-09-16** : le programme officiel 4AM (4 domaines, 28 sujets)
a été **fourni par le propriétaire du projet** et transcrit dans
`docs/ALGERIA_4AM_CURRICULUM.md` + `packages/core/curriculum/dz/
programme_4am_2026_2027.json`. Le blocage sur la réception du programme est
donc levé pour la 4AM. Ce qui reste à décider avant de commencer : le
découpage en leçons et en points d'apprentissage (décision pédagogique), le
document d'accompagnement, la répartition horaire et les attendus de fin de
cycle n'ayant pas été fournis. **Terminale-DZ reste entièrement bloquée** —
aucun programme n'a été fourni pour cette classe.

**Point technique à traiter en premier** : `scripts/check-routes.mjs` déduit
la classe par l'expression `lessons/(?:college|lycee)/([^/]+)/`. Le niveau
algérien est `moyen` ; l'expression doit l'accueillir AVANT le premier montage
d'une leçon 4AM, sinon la leçon est vue comme sans classe et le contrôle
échoue.

**Files/subsystems affected**: a new Algeria-equivalent of `packages/core/curriculum/coursesData.js` (or an extension of it with new grade codes `4am`/`terminale_dz` or similar — naming to be decided when curriculum sources arrive), `grades`/`chapters` database tables (new rows, not new schema), curriculum sync scripts (`exportCurriculum.mjs` pattern, reusable).

**Implementation tasks**:
1. Read and analyze the official Algerian curriculum and teaching documents for 4AM and Terminale in full before writing any structure.
2. Identify and document: grades, courses, chapters/themes, lessons, learning objectives, learning points, prerequisites, terminology, required methods, expected skills — per master spec §4.
3. Generate the Algeria curriculum source-of-truth structure, following the `coursesData.js` pattern (grade → chapters → lessons → learning points) but populated only from official Algerian sources — never inferred from French content.
4. Add new grade codes to the curriculum registry (e.g. `4am`, `terminale_dz`) — these become the entries in Phase 3's "active grades" allowlist.
5. Use the literal marker `[À VÉRIFIER DANS LE PROGRAMME OFFICIEL]` for any terminology or structural point that isn't confidently established from the official sources — never invent.
6. Document every significant migration/mapping decision made during this analysis (a running decision log, informing the LP-by-LP comparison in Phase 8/9).
7. Run the curriculum sync pipeline (`exportCurriculum.mjs`-equivalent → `smarter:import-curriculum`-equivalent) to populate `grades`/`chapters` tables with the new Algeria structure.

**Migration risks**: Critical Risk #2 (curriculum fabrication under time pressure) is exactly what this phase's gating exists to prevent — do not let schedule pressure motivate starting Phase 8/9 lesson-writing before this phase's structure is solid and sourced.

**Validation steps**: the generated curriculum structure is reviewed against the official source documents by someone with curriculum authority (not just technically validated); every `[À VÉRIFIER...]` marker is tracked and eventually resolved or explicitly accepted as a known gap.

**Definition of done**: matches master spec §4 in full — official curriculum read and analyzed, grades/courses/chapters/lessons/objectives/LPs/prerequisites/terminology/methods/skills identified, Algeria courseData-equivalent generated, every migration decision documented.

---

## Phase 8 — 4AM Curriculum Integration

**Objective**: build the first wave of active 4AM lessons, using the reused lesson engine and, where genuinely applicable, technical (not content) patterns from French Troisième.

**Prerequisites**: Phase 7 complete (curriculum source-of-truth exists and is sourced from official documents, not French content).

**Files/subsystems affected**: new lesson folders under an Algeria-equivalent of `apps/web/src/lessons/college/4am/` (or wherever the Algeria lesson tree convention places it), `apps/web/src/lessons/registry.js` (now including 4AM), `apps/web/src/App.jsx` (new route mounts), `content/practice/4am/` (new practice content).

**Implementation tasks**:
1. For each 4AM lesson identified in Phase 7, compare Algerian learning points against corresponding French learning points **LP-by-LP** (never lesson-title-based) per master spec §5, classifying each as EXISTING/MATCHING, PARTIALLY MATCHING, MISSING FROM FRENCH, DIFFERENT/REQUIRES MODIFICATION, or ALGERIAN-SPECIFIC. French Troisième (23 lesson folders, 23 knowledge-contract audits per audit §8) is the natural comparison set given approximate difficulty proximity, but this comparison is explicitly evidence-gathering, not an assumption of equivalence.
2. For LPs classified as reusable, integrate (not translate) per master spec §6 — preserve pedagogical architecture and strong interactions, adapt terminology/examples/notation/exercises/wording/context to Algerian curriculum and students.
3. For LPs classified MISSING FROM FRENCH or ALGERIAN-SPECIFIC, implement fully as first-class learning points per master spec §7 — content, interaction, examples, guided practice, exercises, LP evaluation, progression/mastery/Knowledge Map integration, dependencies, BossFinal questions, final evaluation, DB records, analytics — no TODOs.
4. Use the existing lesson engine unmodified: `lesson.config.js` + `modules/Module<NN>*.jsx` convention, `ContentModule`/`PrerequisiteDiagnostic`/`BossFinal` from `apps/web/src/lessons/common/kit/`, Knowledge Map from `apps/web/src/lessons/common/knowledge/`.
5. Follow the Concret → Visuel → Numérique → Symbolique → Automatisation pedagogical loop (master spec §9) for every lesson/module.
6. Carry forward the 3e-specific bug-class checklist from the audit (§8) as a QA checklist for 4AM lessons: verify no `disabled` prop over-freezes an interactive lab, no start-state trivially satisfies a goal, hints don't override general explanations in ways that mask real understanding gaps.
7. Register new lesson routes in `App.jsx` and confirm `registry.js` picks them up correctly within the active-grades allowlist from Phase 3.
8. Build practice content (`content/practice/4am/<lesson-slug>/level-N/*.json`) using the Practice Engine schema — note per audit §8 that French has almost no practice content to draw structural inspiration from beyond the single 2nde `fonction-affine` example, so this is largely new authoring against the documented schema (`content/practice/_schema/exercise.schema.json`), not adaptation of an existing backlog.

**Migration risks**: Critical Risk #2 applies directly — every lesson must trace to Phase 7's sourced structure, never to French 3e content by default. High Risk #4 (client-side answer correctness) applies to any new practice content built here — decide explicitly whether to inherit or address before shipping graded 4AM exercises.

**Validation steps**: LP-by-LP comparison log reviewed; every lesson passes an Algeria-equivalent of `npm run check:lessons`; manual pedagogical review against the Concret→Symbolique loop; RTL/Arabic rendering verified per Phase 4's harness for every new lesson.

**Definition of done**: matches master spec §24 Curriculum section's per-grade requirements — every active 4AM lesson mapped to curriculum, every LP mapped and classified, missing LPs implemented as first-class, French-only irrelevant LPs disconnected (not brought into Algeria's active set).

---

## Phase 9 — Terminale Curriculum Integration

**Objective**: build the first wave of active Terminale-DZ lessons — a larger, from-scratch effort given the audit's finding of **no direct French Terminale implementation**.

**Prerequisites**: Phase 7 complete. Can proceed in parallel with Phase 8 if staffing allows, since they're independent grade tracks, but both depend on Phase 7's curriculum sourcing.

**Files/subsystems affected**: new lesson folders (e.g. `apps/web/src/lessons/lycee/terminale_dz/`), same registry/routing/practice-content touchpoints as Phase 8.

**Implementation tasks**:
1. Confirm explicitly (this audit already establishes it, but re-confirm against Phase 7's actual official sources) that no French Terminale lesson content exists to compare against — the LP-by-LP comparison step from master spec §5 will find most/all Terminale-DZ LPs falling into ALGERIAN-SPECIFIC or MISSING FROM FRENCH by necessity, not oversight.
2. Reuse the same generic engine components confirmed reusable for Terminale-level math in the audit (§9): `CoordPlane.jsx` (907 lines, already used for analysis/geometry-style content across grades), KaTeX rendering, the LP/evidence/mastery backend, the lesson-kit pattern.
3. Use the "PATRON PREMIÈRE" pattern documented in the French `1ERE_SPECIALITE_RAPPORT_MISSION.md` (19 lessons, 102 LPs, 82,491 LOC, 338 files) purely as an **effort-sizing reference**, not a content source — Terminale-DZ is comparable in scope to that build, so staff/schedule accordingly.
4. Implement every LP fully per master spec §7 (same requirements as Phase 8) — no exceptions for the larger scope.
5. Build BossFinal evaluations appropriate to Terminale-DZ's official curriculum expectations, not French Terminale's (which doesn't exist in this codebase to copy from anyway).
6. Build practice content from scratch against the documented schema, same as Phase 8 task 8.

**Migration risks**: High Risk #6 (Terminale-DZ effort underestimated) is the primary risk this phase must manage — treat the Première-Spécialité-sized effort estimate as a planning input, not an afterthought.

**Validation steps**: same as Phase 8 (LP comparison log, check:lessons-equivalent, pedagogical review, RTL/Arabic rendering).

**Definition of done**: matches master spec §24 Curriculum section for Terminale — same bar as Phase 8, achieved for the second active grade.

---

## Phase 10 — Exercises / Practice / BossFinal

**Objective**: ensure the exercise/practice/evaluation layer is complete and correctly wired for both active grades, beyond what's built inline during Phases 8-9.

**Prerequisites**: Phases 8 and 9 substantially underway (this phase is largely concurrent verification/completion work, not a separable sequential block).

**Files/subsystems affected**: `packages/core/practice/*`, `content/practice/{4am,terminale_dz}/`, `apps/api/app/Domain/Practice/*`, `apps/web/src/lessons/common/kit/BossFinal.jsx`.

**Implementation tasks**:
1. Verify every active lesson has: progressive-difficulty practice content, MathLive where appropriate (currently dead code in French — decide explicitly whether Algeria revives it, given Arabic-friendly equation entry may be valuable; if revived, budget RTL/caret testing per audit §14), visible-but-not-revealing answer format, 1-3 progressive hints, useful feedback, correct LP association, evaluation written to the same LP-evaluation system used by BossFinal/final evaluation (master spec §12).
3. Verify ordinary in-lesson module questions remain architecturally distinct from the dedicated Practice/BossFinal evaluation system (per master spec §12 and the audit's confirmed separation between `useAdaptiveExerciseState` teaching-only questions and Practice's evidence-producing questions) — do not conflate them.
4. Verify every lesson's BossFinal evaluates its important LPs, reflects Algerian curriculum expectations, avoids testing untaught concepts, and feeds LP evaluation/mastery (master spec §13).
5. Explicitly decide and implement the answer-correctness validation approach (client-side, inherited from French, vs. server-side, net-new) — flagged as High Risk #4 in the audit; this decision should be made once, deliberately, and applied consistently rather than left ambiguous per-lesson.
6. Cross-check the hint system (3-tier: look/direction/strategy per the audited French pattern) is non-blocking, consistent with master spec's "wrong answers should provide useful feedback and should not unnecessarily block progress" principle.

**Migration risks**: High Risk #4 (client-side correctness) is the central risk. Consequence of skipping this phase's verification: a lesson could ship with practice content present but not actually wired into mastery/progression (the exact class of silent failure documented in the French `KNOWLEDGE_MAP_MIGRATION_2NDE.md` — audit §22 risk #9).

**Validation steps**: for every active lesson, manually verify (not just automated-gate-verify) that a completed practice session and a completed BossFinal both produce visible mastery movement in the student's Knowledge Map.

**Definition of done**: matches master spec §24 Technology section's exercise/BossFinal lines — exercise engine functional, BossFinal functional, for every active 4AM/Terminale-DZ lesson.

---

## Phase 11 — Knowledge Map / Mastery / Progression Validation

**Objective**: verify the full progression/mastery/Knowledge Map chain is coherent end-to-end for both active grades, catching the class of silent breakage the French project has documented history of (audit §22 risk #9).

**Prerequisites**: Phases 8-10 substantially complete.

**Files/subsystems affected**: `apps/web/src/lessons/common/knowledge/*`, `apps/api/app/Domain/Progress/*` (`MasteryModel.php`: `STARTING_CONFIDENCE 0.5`, `MASTERED_THRESHOLD 0.70`, `GAP_THRESHOLD 0.40` — reused as-is unless Algeria has a specific reason to retune), `student_learning_point_progress`, `learning_evidence` tables.

**Implementation tasks**:
1. Verify every active lesson's Knowledge Map provider is actually mounted (not just present in code) — the French `KNOWLEDGE_MAP_MIGRATION_2NDE.md` documents 9/15 lessons silently failing this exact check while passing automated gates; replicate that manual audit methodology for Algeria's lessons rather than trusting `check:lessons`-equivalent gates alone.
2. Verify Knowledge Map sections (CONCEPTS, RÈGLES, MÉTHODES, VOCABULAIRE, À MÉMORISER, FORMULES per master spec §10) are connected to real lesson content (examples, graphs, equations, manipulations, methods, exercises) — not decorative/disconnected entries.
3. Verify learning points connect correctly to module completion, exercise evaluation, final evaluation, mastery, progression, Knowledge Map, and student history (master spec §11) — trace at least one full LP end-to-end per lesson as a spot check.
4. Confirm server-side mastery (`student_learning_point_progress`) remains authoritative; confirm client-side `localStorage` usage (per audit §5's `CONTRIBUTING.md` finding — lesson/module IDs and resume-position caching) is UX convenience only, never a substitute for server truth, consistent with master spec §11's explicit prohibition.
5. Verify knowledge-dependency ordering (prerequisite-before-use) for 4AM/Terminale-DZ content, using the same methodology as the French `audit:knowledge`/`audit:knowledge:gate` scripts — adapt these scripts for the new grades rather than writing new tooling from scratch.

**Migration risks**: Medium Risk #9 (silent feature breakage despite green gates) is the direct concern this phase exists to catch.

**Validation steps**: manual audit (not automated-only) of every active lesson's Knowledge Map mounting and connection; knowledge-dependency gate passes for 4AM/Terminale-DZ scope; at least one full student-journey trace (lesson → practice → BossFinal → mastery → Knowledge Map update) verified live per active grade.

**Definition of done**: matches master spec §24 Technology section's Knowledge Map/mastery lines, and Pedagogy section's "coherent progression" line.

---

## Phase 12 — Admin

**Objective**: complete Algeria-specific admin capabilities on top of the reused admin shell.

**Prerequisites**: Phase 6 (activation codes exist to administer), Phases 8-9 (content exists to administer) substantially underway.

**Files/subsystems affected**: `apps/web/src/pages/admin/*` (reused shell + new activation-code screens from Phase 6), `apps/api/app/Http/Controllers/Admin/*`, `apps/api/app/Domain/Admin/*`.

**Implementation tasks**:
1. Confirm the reused admin shell (RBAC via `can:admin` Gate, `account.active` middleware, activity logging) requires no Algeria-specific changes beyond credentials (already handled in Phase 5).
2. Confirm content publication/tier controls (`PATCH .../status`, `PATCH .../tier`) work correctly against 4AM/Terminale-DZ content — same mechanism as French, per audit §18, no new backend concepts needed.
3. Complete activation-code admin screens from Phase 6 if not already finished (generate/view/activate/revoke/expiration/export/history/audit trail per master spec §20).
4. Verify student management, access-status views, and reports work correctly for Algeria's student base (independent from French per Phase 2/5).
5. Explicitly verify dormant French curriculum content is **not** exposed through the Algerian admin by default (master spec §20's explicit prohibition) — the admin `GRADES` filter default from Phase 3 task 6 should already handle this; re-verify here with an actual admin user.
6. Build or adapt analytics/activity-log views for Algeria's own usage patterns.

**Migration risks**: Low — mostly verification of already-built infrastructure. The one live risk is Phase 3's admin-default-filter regressing if the `GRADES` constant isn't kept in sync with the active-grades allowlist.

**Validation steps**: admin user walkthrough of every screen; explicit check that dormant grade content is absent from default admin views.

**Definition of done**: matches master spec §20 in full.

---

## Phase 13 — SEO / Public Surface

**Objective**: Arabic SEO for active Algerian content only, with dormant French content confirmed absent from every public surface.

**Prerequisites**: Phase 8/9 (content exists to have SEO metadata), Phase 4 (Arabic/RTL foundation for rendering meta content correctly).

**Files/subsystems affected**: `apps/web/public/{sitemap.xml,robots.txt}`, any new meta-tag generation (net-new — audit §19 confirms no `react-helmet`/dynamic meta system exists today), public marketing pages.

**Implementation tasks**:
1. Replace the static French sitemap/robots content with Algeria-specific marketing URLs (home, méthode-equivalent, courses, pricing/access-info page, about, FAQ, legal pages) — the existing pattern (43 static URLs, no per-lesson entries) is a reasonable template to follow, not something to make more complex than French's own approach.
2. Decide whether per-lesson/per-grade URLs should ever appear in the sitemap for the two active Algeria grades (French has none today for any grade) — if yes, build this net-new with an explicit filter to only active-grade, published, free-or-marketing-eligible lessons; if no, keep the sitemap marketing-only as French does.
3. Introduce Arabic-language meta tags (title, description, OpenGraph) for active pages — net-new work, no French pattern to adapt beyond the absence of one.
4. Re-verify after this phase that dormant French grade content still does not appear in the sitemap, robots.txt, or any meta-tag-driven discovery surface (search engine indexing).

**Migration risks**: Low — the audit found this surface already narrow in French, reducing isolation risk here specifically. Main risk is scope creep if per-lesson SEO is attempted without the necessary grade-filtering discipline from Phase 3.

**Validation steps**: sitemap/robots content reviewed; meta tags spot-checked on key pages for correct Arabic rendering and content; a search-engine-simulation crawl (or manual review) confirms no dormant-grade URLs are discoverable.

**Definition of done**: matches master spec §21 and §24 Public Surface section in full.

---

## Phase 14 — QA / Security / Production

**Objective**: final end-to-end validation against the master spec's full Phase 5/6 test matrix before production launch.

**Prerequisites**: all prior phases complete.

**Files/subsystems affected**: entire application; this phase is testing/verification, not new construction (beyond fixes found during it).

**Implementation tasks** (directly from master spec §22 Phase 5 and Phase 6, made concrete against this codebase):
1. Lesson QA per active lesson: prerequisites, sequence, explanations, interactions, Arabic terminology, mathematical rendering, exercises, hints, feedback, LP evaluation, Knowledge Map, BossFinal, mastery, progression, mobile layout, RTL/LTR behavior — for every 4AM and Terminale-DZ lesson individually, not sampled.
2. Production QA test matrix: anonymous user, free lesson access, premium locked lesson, activation code entry (successful, invalid, already-used, expired, revoked), student login, student progression, admin access, dormant-content isolation (re-verify Phase 3's work under production conditions), SEO, sitemap, API exposure, mobile, Arabic typography, mathematical rendering.
3. Security review: activation codes protected/rate-limited/auditable (Phase 6), independent production credentials (Phase 2/5), no accidental access to French infrastructure from any code path (explicit grep/config audit for any remaining French hostname/credential reference).
4. Run a full dormant-content isolation penetration-style check: attempt to reach French grade content via direct URL manipulation, API calls, admin default views, search-engine cache — confirm all paths are closed.
5. Load/performance sanity check on the new independent infrastructure (not covered elsewhere in this roadmap).
6. Final review against master spec §24's full Definition of Done checklist, section by section (Product, Curriculum, Pedagogy, Technology, Access, Arabic, Security, Public Surface).

**Migration risks**: this phase is where any risk deferred or partially mitigated in earlier phases must be caught before real students are affected — treat every "Medium" and "High" risk from the audit's §22 as requiring an explicit sign-off here, not just a code-level fix.

**Validation steps**: the master spec §22 Phase 6 test list, executed and signed off item by item; master spec §24 Definition of Done, reviewed and confirmed section by section.

**Definition of done**: matches master spec §24 in its entirety — this phase's completion IS the platform's launch readiness.

---

## Cross-Phase Notes

- **Curriculum work (Phases 7-11) is hard-blocked on official Algerian curriculum sources** (master spec §23). If those sources are delayed, Phases 1-6 and Phase 4 (RTL) can and should still proceed — there is substantial independent, non-curriculum-blocked work to do first, which this ordering already reflects.
- **Every phase that touches student-facing content must re-verify Phase 3's dormant-content isolation** — isolation is not a one-time gate but a property that must survive every subsequent phase's changes (new routes, new admin screens, new SEO surfaces).
- **Every phase that touches UI must be checked against Phase 4's RTL/Arabic foundation** once it exists — building Phase 8+ lesson UI before Phase 4 is solid would mean redoing that UI work under RTL constraints discovered too late.
