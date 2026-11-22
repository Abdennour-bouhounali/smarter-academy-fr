# Algeria Migration Audit

Audit of `smarter-academy-fr` as the technical starting point for `smarter-academy-dz`. Produced by static/documentation/code investigation only — no application code was written, no French files were modified, no curriculum content was generated. Source repository audited: `~/websites/smarter-academy/smarter-academy-fr` (branch `main`, tracking `origin/main`, with local uncommitted changes to the admin bulk-actions feature at audit time — untouched by this work).

---

## 1. Executive Summary

`smarter-academy-fr` is a mature, actively developed Laravel 13 + React 18/Vite monorepo (npm workspaces: `apps/web`, `apps/api`, `packages/core`) serving a French collège/lycée math curriculum (6e through Première Spécialité — **not** Terminale). The codebase is **safe to clone today**: it builds as a coherent product, has real automated tests and CI-style validation scripts (`npm run check:lessons`), and its documentation, while uneven in currency, is largely traceable to real code.

The single most important finding of this audit is that the platform already has a **server-authoritative, well-designed entitlement/access-control layer** (`app/Domain/Access/`: `Entitlement` model, `EntitlementService`, `ContentAccess`, `AccessTier`) that is *undocumented in the architecture docs* but is exactly the foundation Algeria's activation-code system needs. It separates "does this student have commercial access" (entitlements) from "is this content allowed to be served" (publication status) from "is the account open" (account status) — three independent, composable gates, all enforced server-side, none trusting `localStorage`. Building an activation-code system is an additive change (new `entitlements.type`, a redemption endpoint, an admin screen) rather than new infrastructure.

The second most important finding is that **Terminale has zero implementation** in French — no lesson folders, no knowledge contracts, no practice content — only placeholder grade IDs in the curriculum catalogue. The closest fully-built lycée content is Première Spécialité (19 lessons, mature) and Seconde (31 lessons, mature but with a documented history of silently-broken features). **4AM has no French grade equivalent at all** — the closest by approximate difficulty is Troisième (3e, 23 lesson folders, 23 knowledge-contract audits, mature), but per the master spec this must not be assumed curriculum-equivalent, only technically informative.

Third: **RTL/Arabic readiness is effectively zero today** — no `dir` attribute anywhere, no i18n framework, 469 hardcoded physical-direction Tailwind utility occurrences across 222 files, and French hardcoded as the only UI language. This is a real, substantial foundation phase, not a config flag.

Fourth: **dormant-content isolation has no existing mechanism** but has excellent raw material to build one from — grade is already a first-class DB relation (`grades` table, `chapters.grade_id`), a server-side "closed inventory" pattern already exists (`ContentAccess::closedInventory()`), and the lesson auto-discovery point (`apps/web/src/lessons/registry.js`, `import.meta.glob`) is a single, identifiable choke point to filter.

Stripe/payment code is substantial but cleanly isolated in `app/Domain/Billing/` (backend) and a handful of named pages (frontend) — removal is mechanical, not surgical, because the entitlement layer already never reads the `payments` table for access decisions.

## 2. French Architecture Summary

- **Monorepo** (npm workspaces): `apps/web` (React 18 + Vite 5 + Tailwind 3 SPA), `apps/api` (Laravel 13 + Sanctum), `packages/core` (`@smarter-academy/core` — platform-agnostic curriculum/validation/progress logic, deliberately free of `localStorage`/DOM/React so it could back a future React Native client).
- **Curriculum source of truth**: `packages/core/curriculum/coursesData.js` — merges an official-program JSON (`smarter_academy_programmes_maths_2026.json`) with editorial metadata (`smaMetadata`) into `courseLevels` (`college`: 6e/5e/4e/3e; `lycee`: seconde/premiere_specialite/terminale_specialite/terminale_complementaires — the last two are catalogue placeholders with no lesson content).
- **Sync pipeline**: `coursesData.js` → `exportCurriculum.mjs` → `.generated/curriculum-export.json` → `php artisan smarter:import-curriculum` (idempotent) → MySQL (`grades`, `chapters`, `lessons`, `learning_points`).
- **Lesson composition**: one folder per lesson at `apps/web/src/lessons/<college|lycee>/<grade>/<domain>/<lesson-slug>/` with `lesson.config.js`, `moduleContext.js`, `index.jsx`, `routes.jsx`, `modules/Module<NN><Descriptor>.jsx`. Shared engine at `apps/web/src/lessons/common/kit/` (`ContentModule`, `BossFinal`, `PrerequisiteDiagnostic`, question types). 141+ module files, zero naming-convention exceptions (per `CONTRIBUTING.md`).
- **Backend domain layout** (`apps/api/app/Domain/`): `Curriculum`, `Progress`, `Diagnostic` (separate from lesson mastery), `Practice` (exercise engine), `Access` (entitlements — see §12), `Billing` (Stripe), `Admin`, `Identity` (auth/OAuth).
- **Database**: 49 migrations, MySQL. Core content tables: `grades`, `chapters`, `lessons`, `learning_points`, `lesson_modules`, `practice_exercises`. Progress/evidence: `learning_evidence`, `student_learning_point_progress`, `student_lesson_progress`, `lesson_final_test_attempts`. Commerce: `subscriptions`, `payments`, `provider_events`, `entitlements`. Admin: `admin_activity_logs`, `student_reports`, `report_notes`.
- **Content outside the app tree**: `content/practice/` (repo root) — exercise JSON content, versioned separately from lesson code, read by both Vite and Laravel.
- **Testing/validation**: `npm run check:lessons` gate (lesson/exercise schema validation, knowledge-dependency audit, KaTeX check, route check, "3e leak" check, non-blocking-progression check) — a real CI-quality gate, not aspirational.

## 3. Documentation Sources Used

Level 1 = architectural contract. Level 2 = implementation/audit report. Level 3 = generated/data artifact. Level 4 = experiment/historical/superseded.

| Document | Level | Classification | Currency |
|---|---|---|---|
| `docs/architecture/ARCHITECTURE.md` | 1 | Architectural contract | Current |
| `docs/architecture/CLAUDE.md` | 1 (product vision only) | **Aspirational constitution, not fact** | Contradicts actual stack (prescribes NestJS/Prisma/PostgreSQL; real backend is Laravel/MySQL) — treat as pedagogy/product philosophy only |
| `docs/architecture/LEARNING_ARCHITECTURE.md` | 1 | Architectural contract | Current |
| `docs/architecture/LESSON_CONTRACT.md` | 1 | Architectural contract | Current, load-bearing |
| `docs/architecture/AI_LESSON_CONTRACT.md` | 1 | Architectural contract | Current, but contains one stale line ("no lesson built on disk") from a pre-rebuild state |
| `docs/architecture/EXERCISE_CONTRACT.md` | 1 | Architectural contract | Current, implemented |
| `docs/architecture/EXERCISE_ENGINE_ARCHITECTURE.md` | 1 | Target design spec | Largely implemented since; some paths (`packages/exercise-engine/`) are illustrative, not real |
| `docs/architecture/EXERCISE_ENGINE_INTEGRATION_AUDIT.md` | 2 | Historical audit | Superseded by REFERENCE_IMPLEMENTATION; its own pilot recommendation (3e) was overridden in practice (2nde shipped instead) |
| `docs/architecture/EXERCISE_ENGINE_REFERENCE_IMPLEMENTATION.md` | 2 | Implementation report | Current, ground truth for Practice Engine |
| `docs/architecture/INTERACTION_PEDAGOGY.md` | 1 | Architectural contract | Current, actively referenced by lesson authors |
| `docs/architecture/KNOWLEDGE_DEPENDENCY.md` | 1 | Architectural contract | Current |
| `docs/architecture/KNOWLEDGE_MAP.md` | 1 | Architectural contract | Current |
| `docs/architecture/KNOWLEDGE_MAP_MIGRATION_2NDE.md` | 2 | Migration report | Current; documents real silently-broken features later caught by manual audit |
| `docs/architecture/KNOWLEDGE_MAP_REFONTE_6E.md` | 2 | Migration report | Current |
| `docs/architecture/LEARNING_ARCHITECTURE.md` | 1 | Architectural contract | Current |
| `docs/architecture/LESSON_DESIGN_PLAYBOOK.md` | 1 | Architectural contract | Current (not deep-read; sampled) |
| `docs/architecture/LESSON_INTEGRATION_GUIDE.md` | 1 | Architectural contract | Current (not deep-read; sampled) |
| `docs/architecture/PROGRESS_MODEL.md` | 1 | Architectural contract | Current |
| `docs/architecture/CURRICULUM_MATRIX_5E_4E.md` | 3 | Generated reference | Current, regenerable |
| `docs/architecture/DIAGNOSTIC_6E.md` | 1 | Architectural contract | Current, narrow scope (6e-only diagnostic, separate from lesson mastery) |
| `docs/architecture/ADMIN_PANEL_ARCHITECTURE.md` | 1 | Architectural contract | Current — body is original spec, Annexe (§A1-A6, Sep 13) is authoritative where they conflict |
| `docs/reports/ARCHITECTURE_FOUNDATION_AUDIT.md` / `_REPORT.md` | 4 | Historical audit | Superseded (describes a 2-table backend; now 17+ tables) |
| `docs/reports/AUTHENTICATION_FOUNDATION_REPORT.md` | 4 | Historical implementation report | Superseded — describes password-only auth; Google OAuth/email verification/legal consent postdate it with **no corresponding report** |
| `docs/reports/BILLING_LIFECYCLE_PHASE7_REPORT.md` | 2 | Implementation report | Current |
| `docs/reports/CHECKOUT_PHASE6_REPORT.md` | 2 | Implementation report | Current |
| `docs/reports/CODEBASE_CLEANUP_REPORT.md` | 4 | Historical report | Superseded |
| `docs/reports/CURRICULUM_SYNC_REPORT.md` | 3 | Generated artifact | Current, live (8 grades, 36 chapters, 133 lessons, 1067 LPs) |
| `docs/reports/CURRICULUM_5E_4E_REPORT.md` | 2 | Implementation report | Current |
| `docs/reports/KNOWLEDGE_DEPENDENCY_AUDIT.md` | 3 | Generated artifact ("do not edit by hand") | Current |
| `docs/reports/LEARNING_POINT_COVERAGE.md` | 4 | Historical report | **Stale/contradicted** — claims 1 lesson covered, 294 "not yet implemented"; contradicted by later docs showing 74+ lessons built |
| `docs/reports/LESSON_RESET_AUDIT.md` | 4 | Historical migration report | Explains a deliberate full content wipe/rebuild; context for other docs' low numbers |
| `docs/reports/MIGRATION_AUDIT.md` | 2 | Migration report | Current facts, numbers superseded by CURRICULUM_SYNC_REPORT |
| `docs/reports/MOBILE_READINESS_REPORT.md` | 2 | Implementation report | Current |
| `docs/reports/OGE_INTEGRATION_ARCHITECTURE.md` | 2 | Case-study report | Current, narrow scope |
| `docs/reports/PAYMENT_PROVIDER_PHASE5_REPORT.md` | 2 | Implementation report | Current |
| `docs/reports/STRIPE_PHASE65_ROUND_TRIP_REPORT.md` | 2 | Implementation report | Current |
| `docs/reports/STUDENT_GRADE_CONTEXT_REPORT.md` | 2 | Implementation report | Mostly current; one stale observation ("5e not built") |
| `docs/reports/FRICTIONLESS_REGISTRATION_REPORT.md` | 2 | Implementation report | Current |
| `docs/reports/DIAGNOSTIC_6E_REPORT.md`, `DIAGNOSTIC_COVERAGE.md`, `DIAGNOSTIC_INTEGRATION.md` | 2 | Implementation reports | Current, narrow scope |
| `docs/audits/2DE_LEARNING_POINT_AUDIT.md` | 2 | Active audit | Current — 303 LPs, 292 covered |
| `docs/audits/PAYMENT_PROVIDER_INTEGRATION_AUDIT.md` | 4 | Pre-implementation decision record | Explicitly superseded by PHASE5 report; kept as rationale record |
| `docs/reports/knowledge-contracts/3e_*.json` (23 files) | 3 | Generated pedagogical-lexicon audit | Current |
| `docs/data-verification/verified_scopes_lycee.json` | 3 | Curriculum-scope reference data | Current — official in/out-of-scope lists for Terminale topics, not lesson content |
| `docs/data-verification/verified_scopes_cycle4*.json` | 3 | Curriculum-scope reference data | Current |
| `docs/lessons/3E_*.md` (9 files) | 1 | Lesson specifications | Current |
| `docs/lessons/1ERE_DERIVATION_NOMBRE_DERIVE_SPEC.md`, `1ERE_SPECIALITE_RAPPORT_MISSION.md` | 1/2 | Lesson spec / mission report | Current — confirms 19/19 Première Spécialité lessons shipped |
| `docs/experiments/JSXGRAPH_PILOT.md` | 4 | Experiment | Concluded, rejected ("NE PAS ADOPTER") — JSXGraph fully removed from codebase |
| `docs/deployment/HOSTINGER_AUTH_ENV_CHECKLIST.md`, `HOSTINGER_AUTH_MIGRATION.sql`, `HOSTINGER_FILE_MANAGER_DEPLOYMENT.md` | 2 | Deployment procedure | Current, France-specific infra — informative for env-var inventory only |
| Root `LESSON_IMPLEMENTATION_REPORT.md`, `REPOSITORY_ORGANIZATION_REPORT.md`, `INTERACTION_PEDAGOGY.md` (root stub) | 4 | Historical/pointer | Root `INTERACTION_PEDAGOGY.md` is a 1-page pointer to the real doc under `docs/architecture/`; `REPOSITORY_ORGANIZATION_REPORT.md` documents the monorepo restructuring (useful for understanding *why* the layout is what it is) |

**Not documented anywhere** (see §20): the `app/Domain/Access/` entitlement system, `apps/web/src/lessons/registry.js` auto-discovery, `AdminHealthController`/`RegistryHealthService`, Google OAuth + email verification + legal consent (code exists, no report).

## 4. Documentation Reliability/Status Assessment

- **High reliability**: architecture contracts under `docs/architecture/` for lesson/exercise/knowledge-map structure — consistently cross-verified against real code and generated/gated by scripts (`npm run check:lessons`).
- **Mixed reliability**: `docs/reports/` — several early reports (Aug 16-18) are meaningfully stale/superseded by later work but were not deleted or marked as such; a reader must cross-check dates and numbers against `CURRICULUM_SYNC_REPORT.md` (auto-generated, always current) rather than trust any single report's counts.
- **Do not trust as architecture fact**: `docs/architecture/CLAUDE.md` on backend technology choice — it is product/pedagogical philosophy, contradicted everywhere else in the codebase and docs.
- **Silent-failure risk documented, not hidden**: `KNOWLEDGE_MAP_MIGRATION_2NDE.md` is a rare, valuable example of a doc admitting that automated gates (`validate:lessons`, `audit:knowledge:gate`) passed trivially while real features were dead code (provider never mounted in 9/15 lessons) — a caution against over-trusting "green checks" anywhere in this codebase, including for the Algeria QA phases.
- **No architecture doc exists** for the entitlement/access system, despite it being one of the most polished, well-commented parts of the codebase (extensive French-language doc-comments in the source itself serve as its de facto documentation).

## 5. Actual Implementation Verification Notes

Spot-checks performed directly (beyond what the four research passes covered):

- Verified `packages/core/curriculum/coursesData.js` (3099 lines) directly: `courseLevels` contains exactly `6e, 5e, 4e, 3e` (collège) and `seconde, premiere_specialite, terminale_specialite, terminale_complementaires` (lycée) — confirms **no Terminale content exists**, only catalogue placeholder IDs.
- Verified `apps/api/database/migrations/` directly (49 files): confirmed `entitlements` table (2026-09-15), `lessons.tier` defaulting to `free` (2026-09-15, with an extensive doc-comment explaining the safety rationale for defaulting open, not closed), `practice_exercises.tier` (nullable, inherits from lesson unless explicitly set), `lessons.publication_status` (2026-09-13, independent of the older `lessons.status` field which mirrors `coursesData.js` and is "informational only, not enforced").
- Read `apps/api/app/Models/Entitlement.php`, `apps/api/app/Domain/Access/{AccessTier,ContentAccess,EntitlementService}.php` in full: confirmed server-authoritative, well-tested-looking design (see §12 for detail). This directly corroborates and extends what the background research agents independently found.
- Verified `apps/web/src/App.jsx` (484 lines) directly: routing is explicit per-lesson import (`import fractionsRoutes from './lessons/college/6e/.../routes'`), not glob-based at the route-mount level — confirms dormant-grade isolation cannot be a single route-prefix block; the real single point of leverage is `apps/web/src/lessons/registry.js`'s `import.meta.glob('./**/lesson.config.js')`.
- Verified `apps/web/public/sitemap.xml` (43 lines) and `robots.txt` directly: fully static, marketing-pages-only, zero per-lesson/per-grade URLs — confirms the SEO/sitemap dormant-content risk is much smaller than it could have been.
- Verified `apps/web/index.html`: `<html lang="fr">`, no `dir` attribute — confirms zero existing RTL scaffolding at the document root.
- Verified `apps/web/tailwind.config.js`: no RTL plugin, no logical-property setup, only typography/color/animation extensions.
- Verified `CONTRIBUTING.md`: confirms "lesson/module IDs, URLs, and module ordering are load-bearing (progress is keyed on them in `localStorage`)" — this is a client-side *cache/UX convenience* concern (resume position, completion %), not the authoritative mastery/access record, which lives server-side in `student_learning_point_progress`/`entitlements`. Important nuance for §16 and the roadmap: renaming or restructuring lesson IDs during the Algeria build would invalidate any carried-over localStorage state, but not server-side truth.
- Verified the SQL dump at repo root (`smart-academy-db (2).sql`, 624KB): contains schema and reference/content data (grades, chapters, lessons, learning_points, lesson_modules, practice_exercises) but **no user data rows** (users/entitlements/subscriptions/payments tables have no INSERT rows in the dump) — safe as a structural reference, not a live-secrets artifact.

## 6. Complete Subsystem Inventory

**Frontend** (`apps/web/src`): `components/` (56 files — nav, admin UI, student UI, pricing), `pages/` (50 files — public marketing, student area, admin area), `hooks/` (9), `services/` (23 — API clients per domain), `features/` (23), `lessons/` (2708 files — the lesson content tree + shared kit), `context/` (3 — `AuthContext`, `WorkspaceLayoutContext`, one more), `utils/` (3), `data/` (3 — nav links, portfolio-leftover content, marketing copy).

**Backend** (`apps/api/app`): `Domain/{Access,Admin,Billing,Curriculum,Diagnostic,Identity,Practice,Progress}`, `Http/Controllers` (30 controllers, 10 under `Admin/`), `Models` (27 Eloquent models), `Notifications`, `Providers`.

**Database**: 49 migrations spanning users/auth, curriculum (grades/chapters/lessons/learning_points), progress/evidence, diagnostics, practice/exercises, billing (subscriptions/payments/provider_events), entitlements, admin (activity logs/reports).

**Content architecture**: `packages/core/curriculum/coursesData.js` (bundled catalogue, single source of truth for grade/lesson metadata) + `content/practice/` (repo-root, versioned exercise JSON, read by both frontend build and backend at runtime via relative path resolution).

**Infrastructure**: Hostinger shared-hosting deployment target (per `docs/deployment/`), MySQL, Laravel Sanctum bearer-token auth (not cookie/SPA-session mode), Stripe for payments, Google OAuth for social login.

## 7. Reuse/Adapt/Remove Matrix

| System | French implementation | Documentation | Algeria action | Reason | Risk |
|---|---|---|---|---|---|
| Monorepo structure (`apps/`, `packages/core`) | npm workspaces | `REPOSITORY_ORGANIZATION_REPORT.md` (Level 4, historical but accurate) | COPY AS-IS | Sound structure, no country coupling | Low |
| `packages/core` pure logic (validation, progress %, math comparison) | Platform-agnostic by design | `CONTRIBUTING.md` | COPY AS-IS | Explicitly built with zero `localStorage`/DOM coupling | Low |
| Lesson engine (`ContentModule`, `BossFinal`, module stage sequence, kit components) | `apps/web/src/lessons/common/kit/` | `LESSON_CONTRACT.md`, `LESSON_DESIGN_PLAYBOOK.md` | COPY AS-IS (engine), REBUILD (content) | Proven, tested engine; content must follow official Algerian curriculum, not be reused | Medium (content discipline risk, not engine risk) |
| Knowledge Map system | `apps/web/src/lessons/common/knowledge/` | `KNOWLEDGE_MAP.md` | COPY AS-IS | Generic, grade-agnostic implementation | Low |
| Exercise/Practice Engine | `packages/core/practice/`, `content/practice/` | `EXERCISE_ENGINE_REFERENCE_IMPLEMENTATION.md` | COPY AS-IS (engine), REBUILD (content) | Engine is generic; only 1 of 132 French lessons has practice content today — Algeria starts from a similarly-early state, not a mature backlog | Medium — correction is client-side (`expectedAnswer` ships to browser), a known limitation to inherit knowingly |
| Curriculum registry (`coursesData.js` pattern) | `packages/core/curriculum/coursesData.js` | `ARCHITECTURE.md`, `LEARNING_ARCHITECTURE.md` | COPY + ADAPT | Pattern is sound; content must be replaced with 4AM/Terminale-DZ, dormant grades kept but filtered | High if filtering is skipped — see §15 |
| Entitlement/Access system (`Entitlement`, `EntitlementService`, `ContentAccess`, `AccessTier`) | `apps/api/app/Domain/Access/` | **UNDOCUMENTED** | COPY + ADAPT | Server-authoritative, exactly the architecture activation codes need; add `entitlements.type = 'activation_code'` | Low — well-isolated, additive change |
| Stripe/Billing (`app/Domain/Billing/`, `Tarifs.jsx`, `Abonnement*.jsx`) | Full Stripe checkout/subscription/webhook stack | `PAYMENT_PROVIDER_PHASE5_REPORT.md` et al. | REMOVE (from active product) | Spec explicitly forbids Stripe in active Algeria product | Low to remove; Medium if removal is incomplete and leaves dead UI reachable |
| `Subscription`/`Payment`/`ProviderEvent` DB tables | MySQL tables | Migrations | REMOVE or DORMANT | Not needed for cash/activation-code model; `Entitlement` table is what matters | Low |
| Authentication (email/password, Sanctum tokens) | `AuthController`, `config/sanctum.php` | `AUTHENTICATION_FOUNDATION_REPORT.md` (stale/partial) | COPY + ADAPT | Reuse mechanism, new independent secrets/DB | Medium — must confirm zero shared credentials before go-live |
| Google OAuth | `GoogleAuthController`, `app/Domain/Identity/` | **UNDOCUMENTED** (code postdates the auth report) | COPY + ADAPT | Reuse mechanism, new independent OAuth client/callback URL | Medium — misconfigured callback URL is a common go-live bug |
| Admin panel shell + RBAC | `Admin/*Controller`, `pages/admin/*` | `ADMIN_PANEL_ARCHITECTURE.md` (current, Annexe authoritative) | COPY AS-IS (shell), ADAPT (content-specific screens) | Solid RBAC/activity-log pattern; billing-specific admin screens need replacing | Medium |
| Admin activity log (`admin_activity_logs`) | Table + `ActivityLogger` | Annexe of ADMIN_PANEL_ARCHITECTURE.md | COPY AS-IS | Generic audit trail, exactly what activation-code auditability requires | Low |
| RTL/Arabic UI foundation | **Does not exist** | N/A | REBUILD | Zero `dir`, zero i18n, 469 hardcoded LTR utility occurrences | High — largest non-curriculum engineering effort |
| i18n/locale framework | **Does not exist** | N/A | REBUILD (net-new) | No `react-intl`/`i18n` package present; French is hardcoded inline | High |
| KaTeX math rendering (`MathText.jsx`) | Single chokepoint, 364 importers | Sampled via `EXERCISE_ENGINE_REFERENCE_IMPLEMENTATION.md` | COPY + ADAPT | High-leverage single fix point for LTR-in-RTL math isolation | Medium — needs hands-on visual testing, not just a code change |
| MathLive integration | Present as dependency, zero importers (dead code) | `EXERCISE_ENGINE_REFERENCE_IMPLEMENTATION.md` confirms dead | DORMANT / REMOVE-IF-UNUSED | Not live; revive only if Algeria needs richer math input, with RTL caret testing | Low (currently unused) |
| JSXGraph | Fully removed already | `JSXGRAPH_PILOT.md` (rejected) | N/A (not present) | Already rolled back in French; no migration action needed | None |
| `CoordPlane.jsx` (hand-rolled SVG graphing) | 907 lines, 118+ lesson usages | Not separately documented | COPY + ADAPT | Reusable engine; axis/label direction needs RTL-aware testing per instance | Medium |
| Lesson auto-discovery (`registry.js`, `import.meta.glob`) | `apps/web/src/lessons/registry.js` | **UNDOCUMENTED** | COPY + ADAPT | Single choke point to filter by active-grade allowlist | High if not filtered — direct dormant-content leak vector |
| Route mounting (`App.jsx`) | Explicit per-lesson imports | N/A | ADAPT | Must only import/mount 4AM + Terminale-DZ lesson routes | Medium — manual, not automatic; error-prone by omission |
| Sitemap/robots.txt | Static, marketing-only | N/A | COPY + ADAPT | Already narrow; just needs Algeria domain/URLs and Arabic metadata | Low |
| Diagnostic subsystem (6e-only, M0 diagnostic) | `app/Domain/Diagnostic/`, `DiagnosticSession` etc. | `DIAGNOSTIC_6E.md` | DORMANT initially | Not required for 4AM/Terminale-DZ launch scope per spec; keep engine, no Algerian content | Low |
| 6e/5e/4e/2nde/1ère lesson content (French) | ~113 lesson folders | Various | DORMANT | Must stay physically present, disconnected from all discovery surfaces | High if isolation is incomplete (see §15) |
| 3e lesson content (French) | 23 lesson folders + 23 knowledge-contract audits | `docs/lessons/3E_*.md`, `knowledge-contracts/3e_*.json` | DORMANT (content), UNKNOWN-VERIFY (technical-pattern reuse for 4AM) | Do not assume 3e≈4AM curriculum equivalence; only the *engineering pattern* (module structure, misconception catalogue methodology) may inform 4AM lesson authoring | Medium — temptation to over-borrow content is the real risk, not technical incompatibility |
| Première Spécialité content (French) | 19 lesson folders, mature | `1ERE_SPECIALITE_RAPPORT_MISSION.md` | DORMANT | Not in initial Algeria scope (only 4AM + Terminale-DZ) | Low |
| Terminale content (French) | **None exists** | N/A | REBUILD (net-new, blocked on official curriculum) | No French implementation to reuse for content; engine is reusable | High — cannot start until official Algerian Terminale curriculum is supplied |
| `content/practice/` deployment path resolution | `base_path('../../content/practice')` | `EXERCISE_ENGINE_REFERENCE_IMPLEMENTATION.md` §10 | COPY + ADAPT | Works today but fragile if API/content deployed separately; `smarter:practice-doctor` exists to catch drift | Medium |
| Env var names/config shape | `.env.example` (~55 vars) | `HOSTINGER_AUTH_ENV_CHECKLIST.md` | COPY + ADAPT | Reuse variable names/shapes; every value must be independently generated for Algeria | Critical if any French secret is reused |
| SQL dump at repo root (`smart-academy-db (2).sql`) | Schema + content reference, no user data | N/A | DO NOT COPY INTO ALGERIA REPO AS-IS | Contains French-specific reference/content rows; Algeria needs its own seed data | Low (dump itself has no secrets, but is French-content-specific) |

## 8. 4AM-Relevant Technical Analysis

**Curriculum equivalence**: explicitly NOT assumed. 4AM (السنة الرابعة متوسط) has no French grade ID anywhere in `coursesData.js` or the database `grades` table. The nearest French grade by approximate student age/difficulty is Troisième (3e), but this is a proxy for *engineering infrastructure* assessment only, never for content.

**What 3e demonstrates about reusable infrastructure** (from the dedicated exercise-engine/curriculum research pass):
- 23 lesson folders exist under `apps/web/src/lessons/college/3e/{donnees_probabilites,espace_geometrie,nombres_calculs}/`, each following the standard `lesson.config.js` + `modules/` + `routes.jsx` convention.
- 23 knowledge-contract JSON audits exist (`docs/reports/knowledge-contracts/3e_*.json`) — these document a real, repeatable methodology for tracking prerequisite-before-use ordering, vocabulary introduction points, and question-to-learning-point mapping. This *methodology* (not the content) is a strong candidate to reuse for auditing 4AM lessons once written.
- 9 lesson specs exist under `docs/lessons/3E_*.md` documenting misconception catalogues, bespoke interactive SVG components (e.g., `RationalBar`, `AlgebraRect`), and BossFinal structure (10 QCM items mapped to learning points) — again, pattern not content.
- Documented 3e-specific bug classes worth carrying forward as a checklist for 4AM lesson QA (from `INTERACTION_PEDAGOGY.md` §6ter.7): a `disabled` prop that freezes an entire interactive lab instead of just its controls; a start state that already satisfies the goal (trivializing the exercise); targeted hints overriding general explanations and masking e2e test assertions; fragility from single-line import edits.
- **No 3e practice/exercise content exists** in `content/practice/` — the only shipped practice content in the entire French platform is for 2nde `fonction-affine`. This means Algeria's Practice Engine content build for 4AM starts from zero examples in the closest-difficulty grade, not from an adaptable backlog.

**Conclusion**: the *lesson engine, exercise engine, knowledge-map system, and mastery/progression backend* are grade-agnostic and directly reusable for 4AM. The *3e content itself* (lessons, exercises, knowledge contracts) must not be translated or reused as 4AM content — it may only inform authoring methodology, pending the official Algerian curriculum.

## 9. Terminale Technical Analysis

**NO DIRECT FRENCH IMPLEMENTATION FOUND for Terminale.**

Evidence:
- `apps/web/src/lessons/lycee/` contains only `seconde/` and `premiere_specialite/` — no `terminale_specialite` or `terminale_complementaires` directory exists on disk.
- `coursesData.js` references `terminale_specialite`/`terminale_complementaires` only as catalogue/navigation metadata (grade IDs with a `buildChaptersForGrade()` call) — not backed by any lesson content.
- `docs/data-verification/verified_scopes_lycee.json` defines 9 Terminale curriculum-*scope* entries (e.g., `terminale_specialite_limites`, `_logarithme`, `_primitives_equadiff`, `_geometrie_espace`, `_denombrement`, `_loi_binomiale`, `terminale_complementaires_analyse`, `_stats_probas`) — these are official-syllabus in/out-of-scope lists, useful only as a reminder of what French Terminale *would* have covered, not usable as Algerian content or even as a reliable proxy for the Algerian Terminale-equivalent syllabus.
- Grep across `apps/web/src` for "terminale" (case-insensitive) returns only marketing/admin page references (pricing table row, course listing) and incidental substring matches inside `premiere_specialite` paths — zero real lesson implementations.

**What IS reusable**: everything grade-agnostic — the lesson engine/kit pattern, `moduleContext.js`/`routes.jsx` scaffold conventions, KaTeX rendering (`MathText.jsx`), `CoordPlane.jsx` (907-line SVG graphing engine, already used by 118+ lesson files across multiple grades and directly relevant to Terminale-level analysis/geometry topics), the LP/evidence/mastery backend (fully grade-agnostic by design), the Practice Engine content schema, and the "PATRON PREMIÈRE" replication pattern documented in `1ERE_SPECIALITE_RAPPORT_MISSION.md` (19 lessons, 102 LPs, 82,491 LOC, 338 files) as a size/effort reference for what a comparable from-scratch grade build looks like.

**Conclusion**: Terminale-DZ is a full from-scratch curriculum build on top of a reusable engine — comparable in scope to the Première Spécialité build (19 lessons was a multi-week effort). This cannot begin until the official Algerian Terminale curriculum is supplied (per master spec §4, §23).

## 10. Authentication Audit

**Mechanisms**: email + password (bcrypt), Google OAuth (Socialite, stateless). No SMS/magic-link. Email verification via signed URL (`EmailVerificationController`). Legal consent (CGU/privacy version + timestamp) captured at registration.

**Session model**: Laravel Sanctum bearer tokens (not cookie-based SPA sessions), stored client-side in `localStorage` under the key `token` (`AuthContext.jsx`). Default expiration 30 days (`SANCTUM_TOKEN_EXPIRATION`). Logout revokes only the current token.

**Key files**:
- Backend: `apps/api/app/Http/Controllers/AuthController.php` (register/login/logout/me), `GoogleAuthController.php` (full OAuth redirect/callback/complete flow — never exposes Google tokens to the client), `EmailVerificationController.php`, `app/Domain/Identity/` (`GoogleAccountLinker`, `GoogleIdentity`, `PendingGoogleSignup`, `LegalConsent`, `EmailVerificationLink`).
- Frontend: `apps/web/src/context/AuthContext.jsx`, `apps/web/src/services/authService.js`, `apps/web/src/components/auth/ProtectedRoute.jsx` (generic `allowedRoles` prop), `apps/web/src/pages/{Login,Register,AuthGoogle,VerificationEmail}.jsx`.
- User model: `apps/api/app/Models/User.php` — `role` (free-text, admin/student today), `account_status` (active/suspended/disabled, whitelist semantics — unknown closes access), `grade` (nullable, drives curriculum filtering), `password` nullable (Google-only accounts), `email_verified_at`, `identities()` relation to `user_identities` (Google linkage, no tokens stored).

**Routes** (`apps/api/routes/api.php`, 289 lines): `POST /auth/register`, `POST /auth/login` (throttled 6/min), `POST /auth/logout`, `GET /auth/me`, `GET /auth/email/verify/{id}/{hash}` (signed), `GET /auth/google/redirect`, `GET /auth/google/callback`, `POST /auth/google/complete`.

**Server-side authorization gates**: every admin route requires `auth:sanctum` + `account.active` middleware + `can:admin` Gate — confirmed in `routes/api.php`; frontend `ProtectedRoute` is explicitly documented (in code comments) as supplementary UX only, not the actual security boundary.

**Grade/student context**: `users.grade` drives curriculum content filtering; selected during onboarding (`ChooseGrade.jsx`), editable later.

**Config to make independent for Algeria** (names only, no values reproduced): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (must point to an Algeria-owned OAuth client and callback URL), `SANCTUM_TOKEN_EXPIRATION`, `SANCTUM_STATEFUL_DOMAINS`, `SANCTUM_TOKEN_PREFIX`, `APP_URL`, `FRONTEND_URL`, `LEGAL_TERMS_VERSION`, `LEGAL_PRIVACY_VERSION`, `MAIL_*` (SMTP for verification emails), `ADMIN_EMAIL` (bootstrap admin seed).

**Documentation gap**: Google OAuth, email verification, and legal consent exist fully in code and in `docs/deployment/HOSTINGER_AUTH_ENV_CHECKLIST.md`, but have no phase report under `docs/reports/` — `AUTHENTICATION_FOUNDATION_REPORT.md` predates all three (see §20).

## 11. Payment/Stripe Audit

**Backend** — every file in `app/Domain/Billing/` is Stripe/billing-specific: `CheckoutFailedException.php`, `CheckoutService.php`, `CheckoutSession.php`, `PaymentProvider.php` (interface), `PaymentProviderRegistry.php`, `PlanCatalog.php`, `PortalSession.php`, `ProviderEventFormatException.php`, `ProviderPaymentState.php`, `ProviderSubscriptionAdapter.php`, `ProviderSubscriptionState.php`, `SandboxPaymentProvider.php`, `SubscriptionManager.php`, `TranslatedEvent.php`, `WebhookEventRecorder.php`, `WebhookProcessor.php`, and `Billing/Stripe/{StripePaymentProvider.php, StripeEventTranslator.php}` — the latter is the **only** file importing the Stripe SDK (enforced by an architecture-guard test, per the research pass). Also: `Http/Controllers/{ProviderWebhookController,BillingCheckoutController,BillingSubscriptionController}.php`, `Http/Controllers/Admin/{AdminProviderEventController,AdminSubscriptionController}.php`, `Domain/Admin/{SubscriptionService,ProviderEventAdminService}.php`, `Models/{Subscription,Payment,ProviderEvent}.php`.

**Migrations**: `2026_09_13_000007_create_subscriptions_table.php`, `2026_09_13_000008_create_payments_table.php`, `2026_09_17_000001_add_provider_fields_to_subscriptions_table.php`, `2026_09_17_000002_add_provider_fields_to_payments_table.php`, `2026_09_17_000003_create_provider_events_table.php` (safe to drop entirely — Stripe-specific idempotency table).

**Config**: `apps/api/config/billing.php`, the `stripe` block in `apps/api/config/services.php`, Stripe registration in `apps/api/app/Providers/AppServiceProvider.php`.

**Frontend**: `apps/web/src/pages/{Tarifs,Abonnement,AbonnementRetour}.jsx`, `apps/web/src/services/billingService.js`, `apps/web/src/components/pricing/PricingCard.jsx`, `apps/web/src/pages/admin/subscriptions/Subscriptions.jsx`, tests `abonnementContract.test.js`/`subscriptionService.test.js`.

**Env vars** (names only): `STRIPE_SECRET` / `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_WEBHOOK_TOLERANCE`, `STRIPE_PRICE_ANNUAL`, `BILLING_MODE`, `BILLING_PROVIDER`.

**Critically**: `EntitlementService`'s own doc-comment states the `payments` table is *never* read by the access-decision layer — "un paiement existe" and "l'accès est ouvert" are treated as two distinct facts. This means removing Stripe/billing does not require touching the access-control layer at all — it is already decoupled by design.

**What to keep despite being commerce-adjacent**: `Entitlement`/`EntitlementService`/`ContentAccess`/`AccessTier` (Domain/Access — architecturally untouched by billing per the guard test), `usePremiumStatus.js` hook and premium-badge/lock UI in `LessonCard.jsx` (entitlement-consuming, generic, not Stripe-specific), admin activity logging.

## 12. Activation-Code Gap Analysis

This is the single best-positioned subsystem for reuse in the entire audit.

**What exists today** (`apps/api/app/Domain/Access/`):
- `Entitlement` model (`entitlements` table) — `type` (free-text: `subscription` | `admin_override` today, explicitly designed to be additive), `status` (`active`/`revoked`), `starts_at`/`expires_at` (server-clock-validated), `source`/`reference` (generic, no vendor semantics baked in), `granted_by`/`revoked_by`/`reason` (audit fields). No `free` row is ever created — free access is a *rule* (every active account satisfies it), not a database row, deliberately avoiding a row-per-student explosion.
- `EntitlementService` — the single authority answering "does this user satisfy this tier?" Composes account-active status, then checks for a valid entitlement. Request-scoped caching (not Redis) with explicit `forget()` invalidation after admin writes.
- `ContentAccess` — composes entitlement decision + content publication status into the actual access decision; explicit documented invariant: a valid entitlement never overrides unpublished content, and published content never substitutes for a missing entitlement.
- `AccessTier` — closed two-value vocabulary (`free`/`premium`) with defensive normalization (anything not exactly `'premium'` is treated as free — a deliberate "unknown opens" default for tier, contrasted with "unknown closes" for publication status).
- Admin API: `GET /admin/students/{id}/entitlements`, `POST .../entitlements/override`, `DELETE .../entitlements/override`, `POST .../entitlements/sync` (`AdminEntitlementController`, `EntitlementAdminService` — the latter structurally can only create `admin_override`-type entitlements, never fabricate a `subscription`).
- Student API: `GET /me/access` (read-only summary: `freeAccess`, `subscriptionActive`, `adminOverrideActive`, `premiumAccess`, `expiresAt` — never exposes raw entitlement rows).
- Content-tier fields already exist: `lessons.tier` (free/premium, defaults `free`), `practice_exercises.tier` (nullable, inherits from lesson unless explicitly overridden — with a deliberate one-way-only override semantics fully documented in the migration's own doc-comment).

**Gap vs. Algeria's needs**:
| Algeria requirement | Status |
|---|---|
| First-N-lessons-free, rest premium | Already supported — `lessons.tier` is already a per-lesson free/premium flag; "first 3 free" is a pure content-authoring decision, zero code changes needed |
| Physical cash payment | N/A to software — out of scope for this audit |
| Activation code entity (code, status, expiry, notes) | **Net-new**: an `activation_codes` table (code, batch/value, status enum matching spec §17 — available/activated/expired/revoked, redeemed_by, redeemed_at, expiration, plan/access level, notes) |
| Student enters code, server validates | **Net-new**: a redemption endpoint (e.g. `POST /activation-codes/redeem`) that validates the code and writes an `entitlements` row transactionally (type could be `activation_code`, added to `Entitlement::TYPES` — the column is explicitly a free string designed for additive types) |
| Server-authoritative premium flag | **Already exists** — `EntitlementService`/`ContentAccess` are exactly this, no change needed once the new entitlement type is added |
| Rate limiting / brute-force protection on code entry | **Net-new**: needs explicit throttling middleware on the redemption endpoint (the existing login-throttle pattern, `throttle:6,1` used on `/auth/login`, is a directly reusable pattern) |
| Admin: generate/view/activate/revoke codes, export, audit trail | **Partially exists**: admin entitlement grant/revoke UI pattern exists (`Subscriptions.jsx` is the closest analog to repurpose); code *generation* and *export* are net-new; `admin_activity_logs` table already provides the audit-trail mechanism generically |

**Conclusion**: build an `ActivationCode` model + migration, a redemption service that writes to the existing `Entitlement` model with a new `type`, and an admin screen replacing `Subscriptions.jsx`. Do not rebuild `EntitlementService`/`ContentAccess`/`AccessTier` — they are already correct for this use case.

## 13. RTL/Arabic Audit

| Area | Classification | Evidence |
|---|---|---|
| Document root (`index.html`) | Incompatible | `<html lang="fr">`, no `dir` attribute at all |
| Tailwind config | Incompatible, needs adaptation | No RTL plugin, no logical-property setup; only extends fontSize/fontFamily/colors/animation |
| Global CSS (`apps/web/src/index.css`) | Incompatible | Hardcodes `padding-left`/`padding-right` and a permanently-left sidebar layout (`.sa-workspace-main { padding-left: var(--sa-sidebar-w) }`, never `padding-right`) |
| Component-level Tailwind utilities | Incompatible, systemic | 469 occurrences of `ml-`/`mr-`/`pl-`/`pr-`/`left-`/`right-` across 222 files sitewide; 47 occurrences across 19 files within `components/` alone. Concrete examples: `StudentNavbar.jsx` (`left-0`, `border-r`), `AdminSidebar.jsx` (`fixed … left-0`, `-right-3` toggle), `Navbar.jsx` (`fixed top-0 left-0 right-0`, hardcoded `text-left`, Framer Motion `x: -20` slide direction — would visually read backwards under RTL) |
| i18n/locale framework | **Does not exist** | Zero `i18n`/`react-intl`/`useTranslation` usage or dependency anywhere; all UI strings hardcoded inline in French |
| Sitemap/robots.txt | RTL-safe (no text direction concern) | Static marketing URLs only |
| KaTeX math rendering | Needs adaptation, but high-leverage single fix point | Single chokepoint component `MathText.jsx`, 364 importers — a `dir="ltr"`/`unicodeBidi:isolate` fix at this one file likely resolves most cases |
| MathLive | Dormant (currently dead code, zero importers) | Confirmed unused; would need dedicated RTL/caret testing only if revived |
| JSXGraph | N/A | Already fully removed from the French codebase; no migration action |
| `CoordPlane.jsx` (SVG graphing) | Requires testing | Hand-rolled, 907 lines, 118+ usages; axis-direction assumptions need hands-on visual verification once RTL is enabled, not resolvable by static review |
| Icons | Requires testing | Not deeply audited in this pass — icon mirroring conventions (which icons should flip under RTL — e.g. "back" arrows — vs which should not — e.g. play buttons) need a dedicated design pass; flag as `UNKNOWN — REQUIRES VERIFICATION` |

**Conclusion**: RTL support is not a toggle — it requires (a) introducing an i18n framework from scratch, (b) a systematic Tailwind utility migration (physical → logical properties or `rtl:` variants) across ~222 files, (c) a `dir="rtl"` root switch plus per-component verification, and (d) hands-on browser testing for every math-rendering surface. This is correctly scoped in the roadmap as its own foundational phase before any curriculum work.

**Phase 4 implementation update (2026-09-15)** — see `ALGERIA_IMPLEMENTATION_ROADMAP.md` Phase 4 for full detail. Two corrections to the estimate above: the actual sitewide count was 656 files / 3356 occurrences, not 222/469 (this table's count was scoped to `components/` only) — but 573 of those 656 files are dormant French lesson content with zero mounted routes (Phase 3), so the real load-bearing surface was ~90 files, all addressed. `dir="rtl" lang="ar"` is live at the document root; `react-i18next` is wired in with real Arabic translations for the shared shell (auth, nav, common strings); Tajawal typography is live under `[dir="rtl"]`; KaTeX (`MathText.jsx`) LTR isolation is implemented and verified working via a Playwright probe (screenshot + computed-style check); `CoordPlane.jsx` and `MathInput.jsx` received the same defensive LTR treatment but could not be visually verified live (no mounted lesson content exists yet to exercise them) — remains `UNKNOWN — REQUIRES VERIFICATION` until Phase 8+. Icon mirroring was resolved case-by-case for the icons actually encountered in scope (documented in the roadmap), not as a blanket sitewide policy. One additional, unplanned finding: `Courses.jsx` crashed on an empty `courseLevels` array (a Phase 3 side-effect nobody had exercised yet) — fixed with an explicit empty state.

## 14. Math-LTR Audit

The platform's math rendering funnels through a small number of chokepoints, which is good news for RTL isolation:

- **KaTeX** (`MathText.jsx`, 364 importers) — single highest-leverage fix point. Wrapping this component's output in a `dir="ltr"` / `unicodeBidi: isolate` container should resolve inline/block math directionality without touching call sites, but must be verified visually with mixed Arabic+math strings (e.g., "احسب $x + 5 = 12$" — text direction and inline math direction interacting).
- **MathLive** — currently dead code (zero importers); if revived for Algeria (e.g., for Arabic keyboard-friendly equation entry), the `<math-field>` custom element's internal caret/selection handling needs dedicated bidi testing — known to be a common failure class in math-input widgets under RTL, not something inferable from source alone.
- **`CoordPlane.jsx`** — hand-rolled SVG, not third-party, which means axis/label logic can be explicitly controlled to always render numerically ascending left-to-right (the master spec explicitly permits math to stay LTR-oriented inside an RTL shell — "do NOT blindly mirror mathematical interfaces"). Needs per-diagram-type testing (number lines, coordinate axes, geometric figures with labels) since the SVG label-collision-avoidance logic may have LTR-specific assumptions baked into its layout math.
- **Fractions, powers, inequalities, equations** — explicitly called out in the master spec §14 as needing individual verification; none of this is resolvable by code reading and must be a QA-phase task with real rendered examples (see roadmap Phase 4 and Phase 5 QA steps).

No structural incompatibility was found that would block Arabic+math mixed rendering — the risk is testing and polish, not architecture.

**Phase 4 verification (2026-09-15)**: the exact scenario this section anticipated ("احسب $x + 5 = 12$") was tested via a standalone Playwright probe against the real `MathText.jsx` component (see `ALGERIA_IMPLEMENTATION_ROADMAP.md` Phase 4) — confirmed PASS: the Arabic sentence reads right-to-left, the embedded equation reads correctly left-to-right in the correct position, and computed styles confirm `direction: ltr` + `unicode-bidi: isolate` on every KaTeX output (inline and block, including a fraction and an inequality). `CoordPlane.jsx` received the anticipated `dir="ltr"` protection for its `textAnchor`-based labels but could not be visually verified live — no lesson using it is currently mounted (Phase 3 isolation). MathLive remains dead code; still `UNKNOWN — REQUIRES VERIFICATION` for the reason predicted here.

## 15. Dormant-Content Isolation Plan

**Current state**: no grade-level "active/dormant" concept exists anywhere. Three surfaces would leak dormant French grades if copied unmodified:

1. **`apps/web/src/lessons/registry.js`** — uses `import.meta.glob('./**/lesson.config.js', { eager: true })`, which auto-includes every lesson folder found on disk, with no grade filter. **This is the single highest-priority isolation point.**
2. **`packages/core/curriculum/coursesData.js`** — the bundled catalogue ships the full grade/chapter/lesson list to every client regardless of activation state; no server-side filtering exists today.
3. **`apps/web/src/App.jsx`** — routes are mounted via ~100+ explicit per-lesson imports (not auto-discovered at the route level, but still must be manually restricted to only import 4AM/Terminale-DZ lesson `routes.jsx` files).

**What already exists that can be extended**:
- `grades` is a first-class DB relation (`chapters.grade_id`), not just a frontend string — `apps/api/app/Http/Controllers/Admin/AdminContentController.php` already surfaces `$lesson->chapter?->grade?->code` in admin responses.
- A server-side "closed inventory" pattern already exists: `ContentAccess::closedInventory()` returns `{lessons: [...closed codes], modules: {...}, premium: [...], locked: [...]}`, consumed by the frontend to align what it shows with what the server will actually serve. **This is structurally the right shape to extend with a `dormant`/inactive-grade concept** — either as a new closed-inventory category, or as a pre-filter applied before any of today's tier/publication logic runs.
- `apps/web/src/pages/admin/content/Lessons.jsx` already has a `GRADES` constant and grade-filter UI pattern for the admin lesson list — reusable as the seed for an active-grades allowlist, ideally sourced from a single server-side config rather than duplicated in frontend code.

**Recommended concrete mechanism** (to be implemented in a later phase, not this audit):
1. Introduce a single server-side "active grades" allowlist (e.g., a config value or a `grades.is_active` boolean column) containing only 4AM and Terminale-DZ once those grade codes exist in the Algeria `coursesData.js`.
2. Filter `registry.js`'s glob result by active grade before exposing `configByLessonId`.
3. Filter `coursesData.js`'s exported `courseLevels`/`getAllGrades()` output (or wrap it) so only active grades are shipped to the bundle — the safest approach, since it starves every downstream consumer (nav, search, admin-facing catalogue, sitemap generation) at the source rather than requiring each to filter independently.
4. Extend `ContentAccess::closedInventory()` (or add a parallel check) to treat lessons under inactive grades as closed, consistent with how publication/tier closures already work.
5. `App.jsx` route mounts: only import/mount 4AM and Terminale-DZ lesson routes; leave the French lesson folders physically present but unimported (satisfies "keep files physically present, disconnect from active surfaces").
6. Verify sitemap generation (if automated later) and admin content list default filters exclude dormant grades by default.
7. Add an automated check (in the spirit of the existing `npm run check:lessons` gate, e.g. `check:level-leak` which already exists for a related purpose — auditing what it does and extending it is worth investigating) that fails CI if a dormant-grade lesson becomes reachable from any active surface.

**Do not delete** dormant French content — per master spec §3, it stays physically present unless a later explicit decision is made to remove it.

## 16. Database Analysis

49 migrations. Core groups:
- **Identity**: `users` (+ `add_grade_to_users_table`, `add_account_status_to_users_table`, `add_legal_consent_to_users_table`, `make_password_nullable_on_users_table`), `user_identities` (OAuth linkage), `personal_access_tokens` (Sanctum).
- **Curriculum**: `grades`, `chapters`, `lessons` (+ `add_catalogue_fields_to_lessons_table`, `add_publication_state_to_lessons_table`), `learning_points`, `lesson_modules`.
- **Progress/Evidence**: `learning_evidence` (+ `add_practice_columns_to_learning_evidence_table`), `learning_evidence_learning_point` pivot (+ `add_role_to_...`), `student_learning_point_progress`, `student_lesson_progress` (+ `add_completion_mode_to_...`), `lesson_final_test_attempts`.
- **Diagnostics** (separate subsystem): `diagnostic_sessions`, `diagnostic_responses`, `diagnostic_skill_assessments`.
- **Practice**: `practice_sessions`, `exercise_attempts`, `question_attempts`, `hint_events`, `notebook_notes` (+ `add_completed_at_to_notebook_notes`), `practice_exercises` (+ `add_tier_to_practice_exercises_table`).
- **Commerce**: `subscriptions` (+ provider fields), `payments` (+ provider fields), `provider_events`, `entitlements` (+ `unique_entitlement_reference`, `default_lesson_tier_to_free` — this last one modifies `lessons`, not `entitlements`, but is commerce-motivated).
- **Admin**: `admin_activity_logs`, `student_reports` (+ `add_source_and_draft_support_to_student_reports`), `report_notes`.
- **Misc**: `contacts`, Laravel scaffolding (`cache`, `jobs`).

**For Algeria**: keep the identity, curriculum, progress/evidence, and admin table groups as-is (schema, not data). Drop or leave dormant the diagnostics group initially (spec doesn't require it for launch scope). Drop the commerce group's Stripe-specific tables (`provider_events`, provider fields on `subscriptions`/`payments`) but **keep `entitlements`** and extend its `type` vocabulary. Add net-new: `activation_codes` table.

## 17. API Analysis

`apps/api/routes/api.php` (289 lines) — key groups: `/auth/*` (public + throttled), `/me/access` (entitlement summary), `/admin/*` (RBAC-gated: dashboard, content, students, reports, entitlements, subscriptions, provider-events, activity-log, health), student-facing lesson/progress/practice endpoints, `/webhooks/{provider}` (Stripe — to be removed).

Content-availability endpoint (`ContentAvailabilityController`) already implements the closed-inventory pattern described in §15 — this is the natural extension point for grade-dormancy, not a new mechanism.

No endpoint currently accepts or returns a "country" or "active grades" parameter — confirming there is no accidental multi-tenant coupling to strip out (consistent with the master spec's prohibition on building a shared multi-country architecture).

## 18. Admin Analysis

Real, working RBAC-gated admin panel (`Admin/*Controller` × 10, `Domain/Admin/*Service` × 8+, `pages/admin/*` frontend). Content publication (`publication_status`) and commercial tier (`tier`) are independently controlled per lesson/module/exercise via `PATCH .../status` and `PATCH .../tier` endpoints — this dual-axis control is directly reusable for Algeria's "visibility/free/premium status" requirement (spec §20) with zero new backend concepts, only new admin screens for activation codes.

Reusable as-is: admin shell, RBAC pattern (`can:admin` Gate), activity logging, student management, content publication/tier control, reports.

Needs replacement: `Subscriptions.jsx` and the provider-events admin screens (Stripe-specific) → activation-code management screens (generate, list, activate/revoke, export, audit trail per master spec §17).

Note per audit brief: the French repo currently has uncommitted local changes to an admin bulk-actions feature (`ContentService.php`, `AdminContentController.php`, `routes/api.php`, several `apps/web/src/{components,pages,services}/admin/*` files, plus new untracked files for `BulkActionBar`, `bulkContentActions`, `useBulkSelection`). This was intentionally not analyzed in depth per the read-only constraint — it does not change any conclusion above, since it extends the same stable publication/tier control pattern already documented.

## 19. SEO/Public-Surface Analysis

Sitemap (`apps/web/public/sitemap.xml`) and `robots.txt` are static, hand-maintained, marketing-pages-only (43 URLs: home, méthode, courses, tarifs, about, faq, legal pages) — **zero per-lesson or per-grade URLs exist today**, which substantially de-risks the "dormant content must not appear in sitemap" requirement: there is no auto-generation process to filter, only a manual list to keep narrow for Algeria's own marketing pages. No `react-helmet` or dynamic meta-tag generation was found in this audit's scope — SEO metadata is effectively a from-scratch build for Algeria, needing Arabic-language meta tags per spec §21.

No site search or recommendation engine exists beyond a within-lesson "next module" suggestion (`moduleRecommendations.js`) and a stubbed, unimplemented `RecommendationService` interface — negligible near-term dormant-content leak risk from these surfaces.

## 20. Undocumented Systems Discovered

1. **`apps/api/app/Domain/Access/` (Entitlement/ContentAccess/AccessTier/EntitlementService)** — no architecture doc exists under `docs/architecture/` or `docs/reports/` despite being one of the most consequential subsystems for the Algeria migration. Documented only via extensive in-code French-language doc-comments. **Action**: this audit treats those doc-comments as authoritative given their quality and the corroborating evidence from migrations/tests-adjacent code, but flag to any future French-side maintainer that a dedicated doc would be valuable.
2. **`apps/web/src/lessons/registry.js`** — the `import.meta.glob`-based lesson auto-discovery mechanism, small but structurally critical (the exact file that needs grade-filtering for dormant-content isolation). Not named in any doc reviewed.
3. **Google OAuth + email verification + legal consent** (`GoogleAuthController`, `EmailVerificationController`, `LegalController`, `app/Domain/Identity/*`, `user_identities` table) — fully implemented in code and referenced in deployment docs, but postdates and is not covered by `AUTHENTICATION_FOUNDATION_REPORT.md`.
4. **`AdminHealthController` / `RegistryHealthService`** (`GET /admin/health`, `smarter:registry-health` artisan command) — content/registry consistency diagnostics, only briefly mentioned in the ADMIN_PANEL_ARCHITECTURE.md Annexe.
5. **`smarter:sync-entitlements`** artisan command — manual entitlement reconciliation fallback; directly reusable as a generic "reconcile access" tool regardless of the underlying access-granting mechanism (subscription sync today, could equally reconcile activation-code state later).
6. **`smarter:practice-doctor`** artisan command — diagnoses `content/practice/` path-resolution drift after deployment; relevant to Algeria's independent-deployment requirement (spec §2).

## 21. Dependency Map

### Curriculum → Lesson Engine → Evaluation → Mastery

```
packages/core/curriculum/coursesData.js  (source of truth: courseLevels, grades, chapters, lessons)
        │
        ├──> exportCurriculum.mjs ──> .generated/curriculum-export.json
        │                                       │
        │                          php artisan smarter:import-curriculum
        │                                       │
        │                                       ▼
        │                    MySQL: grades → chapters → lessons → learning_points
        │
        └──> apps/web/src/lessons/registry.js
                    (import.meta.glob '**/lesson.config.js' — NO GRADE FILTER TODAY)
                                       │
                                       ▼
                  Lesson folder: lesson.config.js + modules/Module<NN>*.jsx
                                       │
                         apps/web/src/lessons/common/kit/
                    ContentModule → M0 PrerequisiteDiagnostic → Module 1..N
                                       │
                         (stage: prerequisite_check → trigger → discovery →
                          manipulation → formalization → practice_lab → evaluation)
                                       │
                                       ▼
                              BossFinal (final evaluation)
                                       │
                    ┌──────────────────┴───────────────────┐
                    ▼                                       ▼
        student_lesson_progress                 learning_evidence
        (completion tracking)               (per-learning-point evidence,
                                              from BossFinal AND Practice Engine)
                                                       │
                                                       ▼
                                    student_learning_point_progress (mastery)
                                                       │
                                                       ▼
                              apps/web/src/lessons/common/knowledge/
                                    KnowledgeMap (student-facing rollup)
```

### Authentication → Student → Entitlement → Activation Code (proposed) → Premium Access

```
AuthController / GoogleAuthController
        │
        ▼
   users (account_status, grade, role)
        │
        ├──> account.active middleware (gates ALL protected routes)
        │
        ▼
EntitlementService::decide(user, tier)
        │
        ├── tier=free ──> always allowed for any active account (no DB row)
        │
        └── tier=premium ──> query entitlements WHERE user_id, status=active,
                              starts_at<=now, expires_at>now (or null)
                                       │
                              ┌────────┴─────────┐
                              ▼                   ▼
                    type=subscription      type=admin_override
                    (written ONLY by            (written ONLY by
                     SubscriptionEntitlement     EntitlementAdminService,
                     Synchronizer — Stripe,       admin-initiated)
                     TO BE REMOVED)
                                          ┌────────────────────┐
                                          ▼  [NET-NEW, Phase 6] ▼
                                type=activation_code
                                (written by ActivationCodeRedemptionService
                                 after validating a code from `activation_codes`)
                                       │
                                       ▼
                              ContentAccess::assertLessonAvailable()
                          (composes entitlement decision + publication_status;
                           BOTH must pass — neither substitutes the other)
                                       │
                                       ▼
                              Premium lesson/module/exercise access granted
```

### Lesson → Practice → Exercise → Learning-Point Evaluation → Mastery

```
Lesson (published, tier=free|premium)
   │
   ├── In-lesson module questions (ContentModule, useAdaptiveExerciseState)
   │        → teaching-only, NO learning_evidence written
   │
   ├── BossFinal (final evaluation)
   │        → writes learning_evidence (source=final_test)
   │
   └── Practice Engine (content/practice/<grade>/<lesson-slug>/level-N/*.json)
            │
            PracticeSessionController → PracticeSession → ExerciseAttempt
            → QuestionAttempt (per-question, exact rational-arithmetic comparison,
              6 outcomes: correct/equivalent_correct/partially_correct/
              incorrect/syntax_error/abandoned)
            → HintEvent (3-tier hints, non-blocking)
                            │
                            ▼
                 writes learning_evidence (source=practice_exercise)
                            │
                            ▼
        (both BossFinal and Practice evidence converge here)
                            │
                            ▼
        student_learning_point_progress (MasteryModel: STARTING_CONFIDENCE 0.5,
                                          MASTERED_THRESHOLD 0.70, GAP_THRESHOLD 0.40)
                            │
                            ▼
                      KnowledgeMap (student-facing)
```

**Note on ContentAccess gating in the Practice/Evaluation diagram**: `ContentAccess::isExerciseAvailable()` and `assertModuleAvailable()` are checked before either path above can begin — omitted from the diagram for clarity, already shown in the Entitlement diagram.

## 22. Migration Risks

**Critical**

1. **Dormant-content leak via unfiltered registry/catalogue.** `registry.js`'s `import.meta.glob` and `coursesData.js`'s bundled `courseLevels` ship every grade to the client with no filter today. *Affected*: frontend lesson discovery, curriculum bundle, admin catalogue. *Evidence*: direct code read, §15. *Consequence*: French 6e-1ère content becomes navigable/discoverable in the Algeria product, violating master spec §3 outright. *Action*: implement the grade-allowlist filter (§15) before any student-facing Algeria launch, and add an automated CI check.
2. **Curriculum content fabrication under time pressure.** Given how complete and polished the French lesson engine is, there will be strong temptation to translate/adapt French 3e or Première content directly into 4AM/Terminale-DZ lessons before the official Algerian curriculum arrives. *Evidence*: master spec §4/§23 explicitly forbids this; the audit found the French 3e content unusually mature and "reusable-looking." *Consequence*: shipping pedagogically or factually wrong curriculum content to real students. *Action*: hard process gate — no lesson content authored until official curriculum sources are supplied and analyzed (§4 of the roadmap).
3. **Reused secrets/credentials.** If any French `.env` value (Google OAuth client, DB credentials, mail credentials) is copied instead of regenerated. *Evidence*: master spec §2 explicit requirement; `.env.example` shows ~55 vars needing independent values. *Consequence*: security/compliance breach, accidental cross-product data exposure. *Action*: explicit credential-rotation checklist in Phase 2, verified before first deploy.

**High**

4. **Client-side answer correctness in Practice Engine.** `expectedAnswer` ships to the browser (documented French limitation, not fixed there either). *Affected*: Practice Engine integrity for any premium/graded exercise. *Consequence*: motivated students can inspect network/bundle to see answers; more consequential if 4AM/Terminale-DZ practice becomes graded/certificate-bearing. *Action*: decide explicitly whether to inherit this limitation for Algeria's launch scope or invest in server-side validation — flag as a product decision, not silently inherit.
5. **RTL retrofit scope underestimated.** 469 hardcoded physical-direction utility occurrences, zero i18n framework. *Consequence*: partial/buggy RTL is highly visible and damages trust in an Arabic-first product; treating this as "a CSS pass" instead of a foundational phase risks a half-finished UI shipping. *Action*: dedicated Phase 4 with component-by-component verification, not a global find-replace alone.
6. **Terminale-DZ has no reusable content and unknown effort.** Comparable-scope build (Première Spécialité) took 19 lessons / 82K LOC. *Consequence*: if underestimated, Terminale-DZ launch slips significantly or ships thin. *Action*: scope Terminale-DZ content work using the Première effort as a sizing reference, only after curriculum is supplied.
7. **Admin bulk-actions in-flight changes in the French source repo.** Uncommitted changes to `ContentService.php`/`AdminContentController.php`/routes exist at clone time. *Consequence*: if the Algeria clone is taken mid-change, it may copy an inconsistent half-finished feature. *Action*: clone only from a clean, committed state of the French repo (coordinate with the French maintainer on timing), not from the working tree with uncommitted changes.

**Medium**

8. **`content/practice/` path-resolution fragility across independent deployment.** Backend resolves practice content via a relative `base_path()` path; French docs note a dedicated `practice-doctor` command exists specifically because this breaks silently. *Action*: verify this explicitly in Algeria's independent-deployment setup (Phase 2), don't assume it "just works" on a new host.
9. **Silent feature breakage despite green automated gates.** `KNOWLEDGE_MAP_MIGRATION_2NDE.md` documents 9/15 lessons shipping with a dead (never-mounted) feature despite passing `validate:lessons`/`audit:knowledge:gate`. *Action*: Algeria's own QA phases must include manual/visual verification, not rely on automated gates alone, especially for anything newly built (RTL, activation codes).
10. **Route-mount omission risk.** `App.jsx` requires ~100+ manual per-lesson route imports; forgetting to add a new 4AM/Terminale-DZ lesson's route is a silent bug (lesson exists in registry/catalogue but is unreachable), and conversely forgetting to *remove* a French import could re-expose dormant content. *Action*: consider a lint/check script analogous to existing `check:routes`.

**Low**

11. **SQL dump at French repo root** (`smart-academy-db (2).sql`) is French-specific reference data; if copied into the Algeria repo without review it adds irrelevant content-specific rows (no secrets present, but no value either). *Action*: do not port this file; generate fresh Algeria seed data.
12. **MathLive dead code carried over unnecessarily.** Zero importers today. *Action*: decide explicitly whether to keep, revive, or strip during Phase 1 cleanup rather than carry silently.

## 23. Recommended Implementation Order

Curriculum integration must not begin before clone stability, repository independence, infrastructure independence, dormant-content isolation, auth/entitlement architecture understanding, and RTL/Arabic foundation are in place — per the master spec's own phase ordering (§22) and this audit's risk findings (§22 above reinforces this: Critical Risk #1 and #2 are both about doing things out of order). See the companion roadmap document for the full phase-by-phase plan; in summary:

Clone & Stabilize → Independent Infrastructure → Dormant Content Isolation → Arabic/RTL Foundation → Authentication → Activation Code/Entitlement → Algerian Curriculum Foundation (blocked on official sources) → 4AM Curriculum → Terminale Curriculum → Exercises/Practice/BossFinal → Knowledge Map/Mastery/Progression Validation → Admin → SEO/Public Surface → QA/Security/Production.

## 24. Definition of Phase 1

Phase 1 ("Clone and Stabilize," per master spec §22 and the roadmap) is complete when:
- The full French repository has been copied into a new, independent Algeria repository (new git history or a clean import — no dependency on the French remote).
- The copied project builds and runs locally (`npm install`, `composer install`, migrations run clean on a fresh local DB).
- `npm run check:lessons` (or an equivalent baseline gate) passes on the unmodified clone, confirming nothing broke in transit.
- No French secrets/credentials exist anywhere in the new repository (not even in `.env.example` placeholder form referencing real French infra hostnames).
- The uncommitted admin bulk-actions changes in the French working tree are resolved (either committed upstream first, or explicitly excluded) before the clone is taken, so Algeria starts from a clean, known state.
- No Algeria-specific code, content, or country-abstraction has been introduced yet (this phase is purely mechanical duplication + verification).

## 25. Open Questions / UNKNOWN Items

- **Icon mirroring conventions under RTL** — which icons (back/forward arrows, chevrons) should flip vs stay fixed (e.g. play/pause) was not exhaustively audited. `UNKNOWN — REQUIRES VERIFICATION`.
- **Exact visual behavior of KaTeX/MathLive/CoordPlane under `dir="rtl"` ancestors** — reasoned about structurally but not visually tested (no running instance was launched during this audit). `UNKNOWN — REQUIRES VERIFICATION`.
- **Whether `smarter_academy_programmes_maths_2026.json` (the official French program JSON merged into `coursesData.js`) contains any real Terminale entries or only placeholder/empty structures** — the research pass inferred emptiness from the absence of lesson folders, but the JSON's Terminale entries themselves were not independently line-verified. `UNKNOWN — REQUIRES VERIFICATION`.
- **Full contents of `docs/architecture/LESSON_DESIGN_PLAYBOOK.md` and `LESSON_INTEGRATION_GUIDE.md`** — sampled, not read in full (49KB and 51KB respectively), during the curriculum research pass. Should be fully read before Phase 7+ (Algerian Curriculum Foundation) implementation work begins. `UNKNOWN — REQUIRES VERIFICATION` on any specific claim not already corroborated elsewhere in this audit.
- ~~Whether the `check:level-leak` script... could be generalized into the dormant-grade CI check~~ — **RESOLVED during Phase 3 (roadmap) implementation**: `scripts/audit/check-3e-leak.mjs` is an unrelated **pedagogical vocabulary** check (does 6e lesson content use 3e-level vocabulary/notation?), not a grade-activation/reachability check — its name is misleading but its logic has nothing to do with dormant-content isolation. A separate, purpose-built gate (`npm run check:dormant-isolation`, `scripts/check-dormant-isolation.mjs`) was written instead; `check-routes.mjs` was also extended to fail if a dormant-grade lesson is ever mounted in `App.jsx`. See `ALGERIA_IMPLEMENTATION_ROADMAP.md` Phase 3.
- **Exact current git commit / tag to clone from** — this audit worked against the live working tree (branch `main`, commit `03199c4`, with uncommitted admin bulk-action changes layered on top per §22 Risk #7). The precise clone point should be a deliberate decision made at Phase 1 kickoff, coordinated with whoever owns the French repo, not inferred from this audit.
- **Whether `apps/api/app/Domain/Diagnostic`'s 6e-only M0 diagnostic subsystem is needed for 4AM/Terminale-DZ at all**, given it's explicitly 6e-scoped in French and the master spec doesn't mention a diagnostic requirement. Marked DORMANT in §7 pending an explicit product decision. `UNKNOWN — REQUIRES VERIFICATION`.
- **First-N-free implementation detail**: spec says "3 lessons free" system-wide; French `tier` is per-lesson but has no concept of "first N in sequence" — whether Algeria wants a literal count-based rule (first 3 lessons a student encounters) vs. a curated per-lesson free flag (which 3 specific lessons) is a product decision not resolved by this audit. `UNKNOWN — REQUIRES VERIFICATION`.
