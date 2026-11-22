# Documentation map — Smarter Academy (France), rebuild on the DZ core

> **The code is the source of truth.** A document that contradicts the code is wrong, and correcting it is part of
> the task that found it (root `CLAUDE.md`, « Documentation »). Planned behaviour is marked `Planned`.

This repository is the French platform (collège 6e–3e, French, left to right, Stripe) being rebuilt from the Algerian
one. On 2026-11-22 the tree is the lesson ENGINE and the SHELL around an EMPTY French catalogue: **no lesson exists**,
the interface is French and reads left to right (since 2026-11-22), and no real user exists.

## Start here

1. [`FRANCE_REBUILD_PLAN.md`](./FRANCE_REBUILD_PLAN.md) — the programme, the decisions, what each step leaves behind,
   the owner's open questions (§7) and the progress log (§9).
2. The root [`CLAUDE.md`](../CLAUDE.md) — the rules that bind every task.
3. The contract of the area you touch (table below), then the code.

## Status words

- **current** — written for this repository.
- **imported, corrected** — imported from the Algerian platform (DZ `dev` at `7f4cef1c`) on 2026-11-22 and corrected
  the same day against this tree. Its status block (top of the file) says what is true here and what is not.
- **not yet French** — describes code that still does an Algerian thing (the Algerian school model, the Algerian cycles of
  the math lab, an Algerian commercial model); its status block says which. The interface itself is French everywhere.
- **history** — a dated record; it explains why, it is not a contract.

## Areas

| Area | Authoritative document | Status |
|---|---|---|
| The rebuild: steps, decisions, log | [`FRANCE_REBUILD_PLAN.md`](./FRANCE_REBUILD_PLAN.md) | current |
| French language, register, typography, direction, formats, content and culture rules | [`architecture/FRENCH_LANGUAGE_CONTRACT.md`](./architecture/FRENCH_LANGUAGE_CONTRACT.md) | current — applied (the web is French since 2026-11-22) |
| The whole system (apps, API domains, auth, grades) | [`architecture/ARCHITECTURE.md`](./architecture/ARCHITECTURE.md) | imported, corrected |
| A v2 lesson: its pack, its folder, what the server checks, done | [`architecture/LESSON_V2.md`](./architecture/LESSON_V2.md) | imported, corrected — no lesson yet |
| The game world: kit, worlds (`divisorIsles`, `rootCourts`, `missionIsle`), the rule forge, the exam sitting | [`architecture/GAME_WORLD.md`](./architecture/GAME_WORLD.md) (why `rootCourts` looks as it does: [`reports/ROOTS_WORLD_PLAN.md`](./reports/ROOTS_WORLD_PLAN.md), history) | imported, corrected — French |
| The launch kit of a lesson | [`architecture/LAUNCH_KIT.md`](./architecture/LAUNCH_KIT.md) (plan: [`reports/LAUNCH_KIT_PLAN_2026-11-17.md`](./reports/LAUNCH_KIT_PLAN_2026-11-17.md)) | imported, corrected — its families are empty |
| The lab of a lesson | [`architecture/LESSON_LAB.md`](./architecture/LESSON_LAB.md) | imported, corrected |
| The teacher's class session and board | [`architecture/CLASS_SESSION.md`](./architecture/CLASS_SESSION.md) | imported, corrected — French |
| The projector shell (`lessons/common/classroom/`) | [`architecture/CLASSROOM_MODE.md`](./architecture/CLASSROOM_MODE.md) | imported, corrected — the module-lesson part is deleted |
| Learning-point and assessment rules for a generated lesson | [`architecture/AI_LESSON_CONTRACT.md`](./architecture/AI_LESSON_CONTRACT.md) | imported, corrected |
| What still binds of the module-lesson contract (`lesson.config.js`, stages, non-blocking progression) | [`architecture/LESSON_CONTRACT.md`](./architecture/LESSON_CONTRACT.md) | imported, corrected — the module system is deleted |
| Nothing asked before it is available (`audit:knowledge:gate`) | [`architecture/KNOWLEDGE_DEPENDENCY.md`](./architecture/KNOWLEDGE_DEPENDENCY.md) | imported, corrected — the audit has nothing to read today |
| Interaction pedagogy (principles) | [`architecture/INTERACTION_PEDAGOGY.md`](./architecture/INTERACTION_PEDAGOGY.md) | imported, corrected — its component examples are deleted |
| Exercises, the practice engine, the exam sheet | [`architecture/EXERCISE_CONTRACT.md`](./architecture/EXERCISE_CONTRACT.md); target design [`architecture/EXERCISE_ENGINE_ARCHITECTURE.md`](./architecture/EXERCISE_ENGINE_ARCHITECTURE.md); first build [`architecture/EXERCISE_ENGINE_REFERENCE_IMPLEMENTATION.md`](./architecture/EXERCISE_ENGINE_REFERENCE_IMPLEMENTATION.md) (history) | imported, corrected — the banks are empty; the exam sheet is the BEM's until plan step 2G |
| The learning net (programme items, links, weights, resolver) | [`architecture/LEARNING_NET.md`](./architecture/LEARNING_NET.md) | imported, corrected — the French net is empty |
| Curriculum sync, evidence, mastery (Mastery V2) | [`architecture/LEARNING_ARCHITECTURE.md`](./architecture/LEARNING_ARCHITECTURE.md) (history: [`reports/LEARNING_POINT_MASTERY_AUDIT_2026-09-24.md`](./reports/LEARNING_POINT_MASTERY_AUDIT_2026-09-24.md), [`reports/LEARNING_POINT_MASTERY_V2_EXECUTION_PLAN_2026-09-24.md`](./reports/LEARNING_POINT_MASTERY_V2_EXECUTION_PLAN_2026-09-24.md)) | imported, corrected |
| Completion vs mastery, progress storage | [`architecture/PROGRESS_MODEL.md`](./architecture/PROGRESS_MODEL.md) | imported, corrected |
| The year compass and the school calendar | [`architecture/YEAR_COMPASS.md`](./architecture/YEAR_COMPASS.md) | imported, corrected — the French year is not written (plan 2D) |
| The thinking lab | [`architecture/THINKING_LAB.md`](./architecture/THINKING_LAB.md) (plan: [`reports/THINKING_LAB_PLAN_2026-10-30.md`](./reports/THINKING_LAB_PLAN_2026-10-30.md), history) | imported, corrected — no challenge; OFF (`config/features.js`) |
| The 6e diagnostic | [`architecture/DIAGNOSTIC_6E.md`](./architecture/DIAGNOSTIC_6E.md) (history: [`reports/DIAGNOSTIC_6E_REPORT.md`](./reports/DIAGNOSTIC_6E_REPORT.md), [`reports/DIAGNOSTIC_COVERAGE.md`](./reports/DIAGNOSTIC_COVERAGE.md), [`reports/DIAGNOSTIC_INTEGRATION.md`](./reports/DIAGNOSTIC_INTEGRATION.md)) | imported, corrected — mounted; its recommendations name lessons that do not exist |
| The games space | [`architecture/MADAR_GAME.md`](./architecture/MADAR_GAME.md) | imported, corrected — French |
| The daily challenge | [`architecture/DAILY_CHALLENGE.md`](./architecture/DAILY_CHALLENGE.md) | imported, corrected — French; OFF (`config/features.js`) |
| The Math Lab | [`architecture/MATH_LAB.md`](./architecture/MATH_LAB.md) (open issues: [`reports/PREEXISTING_ISSUES_2026-09-23.md`](./reports/PREEXISTING_ISSUES_2026-09-23.md)) | imported, corrected — French; its two labs follow the Algerian cycles (not yet French) |
| The notebook | [`architecture/NOTEBOOK.md`](./architecture/NOTEBOOK.md) | imported, corrected |
| Page tours | [`architecture/PAGE_TOURS.md`](./architecture/PAGE_TOURS.md) | imported, corrected |
| Teachers, classes, plans, seats, activation | [`architecture/TEACHER_CLASSROOM_ARCHITECTURE.md`](./architecture/TEACHER_CLASSROOM_ARCHITECTURE.md) (history: [`reports/TEACHER_PEDAGOGICAL_MONITORING_PLAN_2026-09-24.md`](./reports/TEACHER_PEDAGOGICAL_MONITORING_PLAN_2026-09-24.md)) | imported, corrected — not yet French (the commercial model is Algerian, plan 1F) |
| Parents (the private link, study time) | [`architecture/PARENT_SPACE.md`](./architecture/PARENT_SPACE.md) | imported, corrected — French |
| The school space | [`architecture/SCHOOL_ADMIN_SPACE.md`](./architecture/SCHOOL_ADMIN_SPACE.md) | imported, corrected — French interface; the school data model is still Algerian (not yet French) |
| The books store | [`architecture/BOOKS_STORE.md`](./architecture/BOOKS_STORE.md) | imported, corrected — OFF (`config/features.js`, server `BOOKS_ENABLED`); its pages keep their Arabic until the French books exist |
| Feature access per tier, quotas | [`architecture/ACCESS_AND_LIMITS.md`](./architecture/ACCESS_AND_LIMITS.md) | imported, corrected |
| The admin panel, lesson tier | [`architecture/ADMIN_PANEL_ARCHITECTURE.md`](./architecture/ADMIN_PANEL_ARCHITECTURE.md) | imported, corrected — French (the books pages excepted, off) |
| The demo dataset (`DemoDataSeeder`) | [`architecture/DEMO_DATASET.md`](./architecture/DEMO_DATASET.md) | imported, corrected — stops today: no published lesson |
| Navigation: four doors, one menu, `nav-*` colours | [`reports/NAVIGATION_REBUILD_PLAN.md`](./reports/NAVIGATION_REBUILD_PLAN.md) §0 | imported, corrected |
| Entry bundle and lazy boundaries | [`architecture/BUNDLE_BOUNDARIES.md`](./architecture/BUNDLE_BOUNDARIES.md) (history: [`reports/BUNDLE_ENTRY_REPORT_2026-10-14.md`](./reports/BUNDLE_ENTRY_REPORT_2026-10-14.md)) | imported, corrected |
| Lint, unused code, dead files, format | [`architecture/CODE_HEALTH.md`](./architecture/CODE_HEALTH.md) | imported, corrected |
| The brand and the logo | [`architecture/BRAND.md`](./architecture/BRAND.md) | imported, corrected — the mark is an open decision (plan §7, 8) |
| Billing (Stripe: provider, checkout, lifecycle) | [`reports/PAYMENT_PROVIDER_PHASE5_REPORT.md`](./reports/PAYMENT_PROVIDER_PHASE5_REPORT.md), [`reports/CHECKOUT_PHASE6_REPORT.md`](./reports/CHECKOUT_PHASE6_REPORT.md), [`reports/STRIPE_PHASE65_ROUND_TRIP_REPORT.md`](./reports/STRIPE_PHASE65_ROUND_TRIP_REPORT.md), [`reports/BILLING_LIFECYCLE_PHASE7_REPORT.md`](./reports/BILLING_LIFECYCLE_PHASE7_REPORT.md); first audit [`audits/PAYMENT_PROVIDER_INTEGRATION_AUDIT.md`](./audits/PAYMENT_PROVIDER_INTEGRATION_AUDIT.md) | history — the code is in `Domain/Billing`, no page calls it until plan 1F; `Planned`: a payment switch in the API (plan §4ter) |
| Authentication, registration, the student's grade | [`reports/AUTHENTICATION_FOUNDATION_REPORT.md`](./reports/AUTHENTICATION_FOUNDATION_REPORT.md), [`reports/FRICTIONLESS_REGISTRATION_REPORT.md`](./reports/FRICTIONLESS_REGISTRATION_REPORT.md), [`reports/STUDENT_GRADE_CONTEXT_REPORT.md`](./reports/STUDENT_GRADE_CONTEXT_REPORT.md); living contract: `ARCHITECTURE.md` | history |
| Deployment | [`deployment/DZ_FIRST_DEPLOYMENT.md`](./deployment/DZ_FIRST_DEPLOYMENT.md) (the Algerian bootstrap and what the workflows do); old French production: [`deployment/HOSTINGER_FILE_MANAGER_DEPLOYMENT.md`](./deployment/HOSTINGER_FILE_MANAGER_DEPLOYMENT.md), [`deployment/HOSTINGER_AUTH_ENV_CHECKLIST.md`](./deployment/HOSTINGER_AUTH_ENV_CHECKLIST.md) | imported, corrected / history — deploys are LOCKED (`FR_REBUILD_CUTOVER_APPROVED`); the French database will be created fresh (plan §6). The `HOSTINGER_*.sql` files are Algerian hand migrations, not for it |
| Philosophy of the first French product | [`architecture/CLAUDE.md`](./architecture/CLAUDE.md) | history — its technical sections are wrong (its banner says which) |
| Working on a lesson (pipeline, briefs, ledger of defects) | the project skill [`.claude/skills/lesson-v2/`](../.claude/skills/lesson-v2/SKILL.md) | still the Algerian skill: adapted before the first French lesson (plan §8) |

Mockups kept beside the plans they illustrate: `reports/mockups/` (`navigation-look.html`, the `roots-world-*` trials
of `rootCourts`, `oasis-world.html`).

## The curriculum

- **Official French sources**: [`curriculum/officiel/`](./curriculum/officiel/) — its `README.md` says which text
  applies to which grade and year, with the quotes that prove it. Lessons and learning points are defined from these
  texts and from nothing else.
- **The 3e net**: live in `packages/core/curriculum/fr/` since 2026-11-22 (59 lessons, all `coming_soon`; 6e, 5e, 4e
  still empty). [`curriculum/net-3e/`](./curriculum/net-3e/) holds `REVIEW.md` — the sheet the owner validates: the
  units, lessons and learning points with the official page of each, and what the 2028 programme changes — and
  `fr_dz_table.json`, which Algerian lesson teaches the same learning point. State and rules:
  [`architecture/LEARNING_NET.md`](./architecture/LEARNING_NET.md).
- **Generated from the shipped net** (never edit by hand): `curriculum/LEARNING_NET_MAP.md`, `learning-net-map.html`,
  `LEARNING_NET_WEIGHTS.md` (`npm run generate:learning-net`), `GENERATION_QUEUE.md`, `generation-queue.json`
  (`scripts/learning-net-queue.mjs`). Empty while the net is empty.

## Deleted on 2026-11-22

This pass deleted 181 files whose subject no longer exists here: the history of the Algerian product (`ALGERIA_*.md`,
the copy of the old `CLAUDE.md`, the 1AM–4AM rollout reports and progress logs, unit mission prompts, gate reports,
batch designs, the review of 2026-11-19, the bank inventory, the knowledge contracts of the Algerian lessons, plans of
Algerian units, the thinking-lab challenge list, the Algerian unit-1 SQL); the documents of deleted systems (the lab
system `MANIPULATION_CONTRACT.md` / `MANIPULATION_DNA.md` and its rollouts, the old knowledge map, the module-lesson
guide `lessons/LESSON_DEVELOPMENT_GUIDE.md` with its « مسائل » and « أتوقّع القاعدة » guides, the lesson integration
guide, the design playbook, the mission player plans, the student focus view, the v2 rollout plan of the Algerian
lessons, the integration-lesson plan); and the reports of the old French product that describe lessons and catalogues
that are gone (the 5e/4e curriculum report, the lycée audits `audits/2de-*` and `audits/judgements/`, the scope data
`data-verification/`, the OGE architecture, the first architecture audits, the lesson reset, the JSXGraph pilot).
Every one of them is in commit `049380e` (the import of the whole Algerian tree): `git show 049380e:docs/<path>`.
The old French site's own documents are on `main`.

## Language of the documentation

Documents and code comments are written in English and French. The product is French
([`architecture/FRENCH_LANGUAGE_CONTRACT.md`](./architecture/FRENCH_LANGUAGE_CONTRACT.md)) and so is its interface.
