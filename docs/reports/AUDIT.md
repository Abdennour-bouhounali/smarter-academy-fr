# Smarter Academy — Architecture Audit

**Read-only audit · No files modified**

A complete technical audit of the existing repository — French-curriculum math platform, Collège 6e–3e — prepared as the foundation for a human architecture decision. Nothing was built, fixed, or refactored to produce this document.

| | |
|---|---|
| **Repo** | smarter-academy-v2 |
| **HEAD** | `ac27783` |
| **Audited** | 2026-08-16 |
| **Stack** | React 18 + Vite 5 + Tailwind 3 (JS, no TypeScript) · Laravel 13 API |

---

## ⚠ Two findings need attention before anything else in this document

- **An unauthenticated route wipes the production database.** `GET /api/v1/setup-database` runs `migrate:fresh --force` and recreates an admin account, with no auth guard, no environment check, and a plaintext password committed in source. See [Phase 20](#phase-20--security-audit).
- **A real credential hash and PII are committed to git.** `database_export.sql` (tracked since the initial commit) contains a production bcrypt password hash tied to a real email address. See [Phase 20](#phase-20--security-audit).

This audit does not fix these — per the audit's own read-only mandate — but they are called out here because they're time-sensitive in a way the rest of this document is not.

---

## Table of contents

**Discovery** — [01 Repository discovery](#phase-01--repository-discovery) · [02 Architecture map](#phase-02--complete-architecture-map) · [03 Dependencies](#phase-03--dependency-analysis)

**Product surface** — [04 Routing](#phase-04--routing-audit) · [05 Catalogue](#phase-05--course-catalogue-audit) · [06 Lesson architecture](#phase-06--lesson-architecture--the-most-important-finding-in-this-audit) · [07 Exercise architecture](#phase-07--exercise-architecture) · [08 Error & remediation](#phase-08--error--remediation-analysis) · [09 State management](#phase-09--state-management)

**Data & backend** — [10 Data model](#phase-10--data-model) · [11 Backend / API / DB](#phase-11--backend-api--database) · [12 Authentication](#phase-12--authentication)

**Web quality** — [13 Responsive web](#phase-13--responsive-web-audit) · [14 Mobile readiness](#phase-14--future-mobile-readiness) · [15 Design system](#phase-15--design-system-audit) · [16 Accessibility](#phase-16--accessibility) · [17 Performance](#phase-17--performance) · [18 Analytics](#phase-18--analytics-audit) · [19 Testing](#phase-19--testing-audit)

**Security & content** — [20 Security ⚠](#phase-20--security-audit) · [21 Content architecture](#phase-21--content-architecture)

**Synthesis** — [22 Technical debt](#phase-22--technical-debt-inventory) · [23 Preserve vs. refactor](#phase-23--preserve-vs-refactor-vs-rebuild) · [24 Target gap analysis](#phase-24--target-gap-analysis) · [25 Principles](#phase-25--architectural-principles) · [26 Target architecture](#phase-26--target-architecture) · [27 Migration strategy](#phase-27--migration-strategy) · [28 Prioritization](#phase-28--prioritization) · [29 Roadmap](#phase-29--roadmap-to-a-complete-6e-product) · [30 Architect's verdict](#phase-30--final-architects-verdict)

---

## Phase 01 — Repository discovery

Smarter Academy is not a greenfield project and it is not one project — it's three, sharing a repo: a React/Vite frontend (the actual product), a Laravel API (a thin auth+contact skeleton), and a body of curriculum-planning artifacts (JSON/HTML reference data) that inform the frontend but aren't consumed by it at runtime.

| | |
|---|---|
| **Package manager** | npm, single lockfile (`package-lock.json`) at repo root. No workspaces/monorepo tooling. |
| **Language** | Plain JavaScript (.jsx/.js) — **no TypeScript**. No `tsconfig.json` exists; `@types/react` isn't even a dependency. Every "type" in the app is implicit. |
| **Build** | Vite 5.3, minimal config (`vite.config.js`: just the React plugin, no chunking strategy). |
| **Styling** | Tailwind 3.4 + hand-written `src/index.css` utility classes + PostCSS/autoprefixer. No CSS-in-JS. |
| **Backend** | Laravel 13.8 + Sanctum 4 under `api/`, its own composer project, independently deployed (`concurrently` dev script runs Vite + `artisan serve` side by side). |
| **Env files** | `.env.development`/`.env.production` (just `VITE_API_URL`) and `.env.hostinger` (full Laravel prod config) — all three are gitignored and untracked, confirmed via `git check-ignore`. |
| **Root-level clutter** | Alongside the app: `CV.pdf`, a competitive-intelligence investor memo, four curriculum-reference JSON files (~130KB combined), two scraped competitor HTML pages, three one-off Python scripts (`refactor.py`, `renumber.py`, `replace_lesson_navbars.py`) and a debug script (`test_courses.js`) — all artifacts of how the content/routing was authored, not part of the running app. |
| **Notable uncommitted state** | 318 files under `public/modules/` (an older static-HTML-per-lesson system covering partial 5e/4e/3e content) are deleted in the working tree but **still present at HEAD, uncommitted**. This is a mid-flight architectural pivot away from static HTML toward the React `src/lessons` system — real, but not yet finalized in git history. See [Phase 21](#phase-21--content-architecture) for what that old content actually was. |
| **Stale prior analysis** | `PROJECT_ANALYSIS.md` (42KB, root) is a *previous* technical audit — but of an earlier version of this repo, when it was a software-engineer's personal portfolio site, before the pivot to Smarter Academy. Its component inventory (Hero/About/Skills/Projects/Blog) no longer matches the codebase. Safe to ignore; flagged here only so it isn't mistaken for current documentation. |

---

## Phase 02 — Complete architecture map

One React SPA serves three distinct audiences today — marketing pages, a single-admin dashboard, and the lesson engine — with almost no shared plumbing between them besides the router and Tailwind.

| Layer | What's actually there | Coupling |
|---|---|---|
| **Frontend shell**<br>`src/App.jsx`, `components/layout`, `components/navigation` | React Router 7, one 432-line route file, marketing pages + admin + lesson routes all declared in the same tree. | Tight — routing, auth-gating, and lesson wiring all live in one file. |
| **Marketing pages**<br>`src/pages/*`, `components/{hero,about,services,testimonials,contact,faq}` | Home/About/Courses/Resources/FAQ/Contact — framer-motion heavy, GeoGebra hero widget. | Presentation-only, no business logic. Visually disconnected from the lesson UI (Phase 15). |
| **Lesson engine**<br>`src/lessons/common/*` | Shared layout (`ModuleLayout`, `LessonIndex`), manipulatives (`NumberLine`, `OrderingGame`, …), math rendering (`MathText`/`MathInput`), progress hook, access rules. | The strongest layer in the repo — mostly framework-idiomatic React but with real portable logic underneath (Phase 6). |
| **Lesson content**<br>`src/lessons/college/{6e,4e,3e}/**` | 17 lessons, 141 modules, each a bespoke React component tree wired individually into `App.jsx`. | Content is data-ish (constants) inside code — reasonable; the *wiring* to routes is the coupling problem (Phase 4). |
| **Catalogue data**<br>`src/data/coursesData.js` + root curriculum JSON | Merges an official-curriculum JSON tree with a hand-maintained editorial overlay (`smaMetadata`). | Client-side only, rebuilt on every load; not a real content-management layer. |
| **State/persistence** | 100% `localStorage` — progress, XP, auth token, UI selections. No global store (no Redux/Zustand/Context beyond `AuthContext`). | Direct, unabstracted `localStorage` calls inside hooks/components (Phase 9, 14). |
| **Backend API**<br>`api/` (Laravel 13 + Sanctum) | 5 endpoints total: login, contact form (public + admin list), `/auth/me`, and an unguarded DB-reset route. | Entirely decoupled from the curriculum/lesson domain — it doesn't know lessons exist (Phase 11). |
| **Database** | MySQL, 2 real tables (`users`, `contacts`) + Laravel framework tables. `database_export.sql` committed with 1 real user row. | No curriculum/progress schema exists anywhere. |
| **Auth** | Sanctum personal-access tokens, bearer-header, stored in `localStorage`. Single role check (`=== 'admin'`), gates only `/admin`. | Lessons are entirely ungated — no auth boundary around content (Phase 12). |
| **Analytics** | None. No provider, no event, no page-view tracking anywhere (Phase 18). | — |
| **Deployment** | Hostinger-targeted (`.env.hostinger`), Vite static build (`dist/`) + separately deployed Laravel API. No CI config found in the repo. | Two independently deployed artifacts, no shared release pipeline visible in-repo. |

---

## Phase 03 — Dependency analysis

The dependency set is small and deliberate — nothing exotic, no framework sprawl. The two things worth flagging aren't "wrong choices," they're an *unused* dependency and a set of heavy libraries with no loading strategy.

| Package | Used for | Verdict |
|---|---|---|
| `react-router-dom` ^7 | All routing | **KEEP** — right tool; the problem is how routes are declared (Phase 4), not the library. |
| `framer-motion` | Marketing animation + most lesson module transitions | **KEEP** — genuinely used throughout, not decorative-only. |
| `katex` / `react-katex` | All math rendering, via `MathText.jsx` | **KEEP** — consistent, centralized usage. |
| `mathlive` | Free-form algebraic input, via `MathInput.jsx` (Web Component) | **KEEP, FLAG** — irreducibly web-only (custom element); fine for web-first, a real mobile blocker later (Phase 14). |
| `@cortex-js/compute-engine` | Algebraic answer-equivalence checking (`mathComparison.js`) | **KEEP** — the right kind of dependency: pure logic, no DOM coupling. |
| `mafs` | Declared as a graphing library dependency | **DEAD WEIGHT** — used in exactly one place (`Hero.jsx`'s homepage graph). The 3e functions lesson, which actually needs interactive graphing, hand-rolls three separate SVG coordinate transforms instead of using it (Phase 6). Either use it where it's needed or drop it. |
| `lucide-react` / `react-icons` | Icons, both libraries present simultaneously | **MINOR** — redundant icon sets; low-priority consolidation. |
| `clsx` | Conditional classNames | **KEEP**, trivial. |
| `laravel/sanctum` | Token auth for the single admin account | **KEEP** — right choice; needs real role/permission work layered on top before multi-role accounts exist (Phase 12). |
| No test framework of any kind (frontend) | — | **GAP** — no vitest/jest/RTL/Playwright/Cypress anywhere (Phase 19). |
| No analytics SDK | — | **GAP** — nothing installed (Phase 18). |

Nothing here calls for a wholesale dependency swap. The stack is appropriate for the target product; what's missing (testing, analytics, a state/sync layer) needs to be *added*, not substituted for what exists.

---

## Phase 04 — Routing audit

Routing is fully centralized in one file and fully manual. It works today, at 17 lessons. It is the single clearest "will not survive contact with 5e + Lycée" finding in this audit.

**The route tree.** `src/App.jsx` (432 lines) declares **178 `<Route>` elements** from **170 static imports**: 6 marketing pages, one admin route behind `ProtectedRoute`, 7 legacy URL redirects, and — the bulk of the file — one route per lesson landing page *and one route per module*. There is no parameterized `/lesson/:moduleId` route anywhere; module 4 of a lesson is a distinct hardcoded route from module 5, each pointing at a distinct hand-imported component. A catch-all silently renders `Home` for any unmatched URL — there's no 404 page, so broken links fail silently instead of surfacing.

**The wiring pattern.** Adding one 10-module lesson today means: 11 import lines + 11 route elements, added by hand to the bottom of an ever-growing shared file, with a manually disambiguated variable name per module (already showing wear — e.g. a variable typo'd `QatreOp6eM01` for *Quatre* Opérations survives in the file). Two different styles of path construction coexist in the same file — literal strings for 6e/4e lessons, a template-literal `_BASE` constant for 3e — with nothing enforcing consistency.

**What this means for 5e, 4e, and Lycée.** The lesson-*authoring* pattern (a config file + a folder of modules) is genuinely reusable and scales fine. What doesn't scale is wiring lessons into the app: at current module density, adding the full 5e curriculum (already scoped — see Phase 21) and Lycée on top would push this single file into the thousands of lines, hand-merged by every contributor touching a lesson. Combined with zero code-splitting (Phase 17), every module for every grade also ships in the same JS bundle regardless of which lesson a visitor opens — that cost compounds with every new lesson added under the current pattern.

**Other concrete problems:**

1. No route-constants file — lesson paths are duplicated as literal strings across `App.jsx`, `coursesData.js`, and each lesson's own `lesson.config.js`, with nothing keeping them in sync.
2. Lesson `id` uniqueness is convention-only, not enforced — a folder name (`racines-carrees`) is reused across two grades, disambiguated only by manually suffixing the metadata id (`-4e`). A future collision would silently merge two lessons' progress data in `localStorage`.
3. Auth-gating and lesson-"locking" are two unrelated mechanisms that look similar: `ProtectedRoute` is real auth (admin-only); `ModuleLayout`'s sequential unlock is a client-side UX nicety driven by localStorage, trivially bypassable, and protects nothing (see Phase 12).
4. 7 permanent `<Navigate>` redirect routes for old 3e URLs sit in the main table with no expiry mechanism — this list only grows as lessons get restructured.

---

## Phase 05 — Course catalogue audit

The catalogue's *data model* is more thoughtful than its routing — it's honest about what's built, and it's grounded in real curriculum research. It just isn't a real data layer; it's a JS merge computed fresh on every page load.

```
smarter_academy_programmes_maths_2026.json   (official curriculum: Collège 6e→3e + Lycée, domains → official_objects)
              │  joined with
coursesData.js → smaMetadata{}               (hand-maintained editorial overlay: title, status, icon, totalModules, path)
              │  produces, at runtime, in the browser
courseLevels                                  (the catalogue rendered in /courses)
```

Cross-checked every lesson marked `status: 'available'` against what's actually on disk in `src/lessons`: **module counts match exactly, every time** — no available-but-missing lessons, no implemented-but-uncatalogued ones. Anything not in `smaMetadata` defaults honestly to "coming soon," including all of 5e.

| Grade | Official curriculum objects | Implemented lessons | Coverage |
|---|---|---|---|
| 6e | 24 | 9 (85 modules) | 37.5% |
| 5e | 16 | 0 | 0% |
| 4e | 15 | 1 (5 modules) | 6.7% |
| 3e | 24 | 7 (51 modules) | 29% |

**Identifiers** are the weak point: three independent surfaces (`smaMetadata[key].id`, each lesson's own `lesson.config.js` id, and the folder path) are kept in sync by convention only, reconciled in one place by a regex that strips prefixes to extract a bare number (`getLessonProgress.js`) — a fragile normalization layer standing in for an actual identifier scheme. One empty orphan folder exists (`3e/algorithmique/`, scaffolded and abandoned).

**Scaling verdict:** the hierarchy model (Level → Grade → Domain → Lesson → Module, official-curriculum-grounded) is sound and should carry forward. What needs to change before 5e is authored is exactly the routing/wiring layer from Phase 4 — the catalogue data shape itself doesn't need to change.

---

## Phase 06 — Lesson architecture — the most important finding in this audit

This is not one lesson system with uneven content quality. It's **two generations of the same system**, and every 6e lesson uses the newer one while every audited 3e lesson uses the older one. That single fact explains almost the entire quality gap between the grades — it isn't that 3e was authored by someone less careful, it's that it was built before the better toolkit existed and was never migrated forward.

**Generation 1 — textbook primitives (used by audited 3e lessons):** `ConceptCard`, `ExampleBox`, `FeedbackBox`, `KeyTakeaway`, `QuizQuestion`, `GuidedSolution`. Low interactivity — mostly worked examples + multiple choice.

**Generation 2 — manipulation-first toolkit (used by all audited 6e lessons):** `LessonUI.jsx` (`StepCard`, `ChoiceGrid`, `ValidateButton`, `MissionBrief`) + `NumberLine`, `OrderingGame`, `GroupBuilder`, `BarModel`, `CalcChain`, `InfoSorter`, `AnswerBuilder`. Real manipulation, framer-motion throughout, keyboard + pointer accessible.

The shared layout/progress spine — `ModuleLayout`, `LessonIndex`, `useProgress`, `lessonAccess.js`, `MathText`/`MathInput`, `numberFormat.js` — is genuinely well-factored and used by both generations. A code comment in `LessonUI.jsx` documents a real prior bug (a completion flag that stayed true after the student moved away from the target) and its fix — a rare, welcome sign of engineering discipline surviving in the codebase.

**6e, against the 8-step pedagogical loop.** The Boucle Pédagogique defined in `.agents/AGENTS.md` — découvre → manipule → comprends → formule la règle → entraîne → détecte l'erreur → réutilise → maîtrise — is **followed faithfully in every 6e module sampled**, and enforced *editorially*, not mechanically: nothing in code checks for it. `Module06Comparer.jsx` (nombres-entiers) is a clean example of step 6 done right — it presents real wrong student reasoning ("3 900 > 12 000 parce que 900 est plus grand que 12") rather than a generic "incorrect" message. Completion gating is real: every non-boss 6e module computes `allDone` from its interaction state and only then unlocks "next."

**3e, against the same loop.** Applied inconsistently, and in the audited lessons, the code shows concrete regressions — not just a "different style":

| Signal | 6e (2 lessons sampled) | 3e (2 lessons sampled) |
|---|---|---|
| Generation-2 toolkit used | Throughout | Never |
| framer-motion | 10 of 11 files (nombres-entiers) | 0 of 10 files (fonctions-lineaires-affines); one unused import (thalès) |
| Completion actually gated before "next" | Enforced in every module | 1 of 10, 0 of 7 modules |
| Runtime-breaking bugs found | None | 1 confirmed crash, 2 broken component calls rendering blank |
| "Je détecte mon erreur" as a real, substantive step | Present in every sampled module | Present in 1 of 17 sampled modules |

**Concrete defects found (fonctions-lineaires-affines):**
- `Module01NotionFonction.jsx` references `handleAntecedentSubmit`/`antecedentAnswer` in JSX — **never declared anywhere in the file**. Throws `ReferenceError` the moment a student reaches that step.
- Two `<ConceptCard type="rule" title=… content=…>` calls — the real component only reads `label`/`emoji`/`color`/`children`. Both render an empty box, silently dropping the "formule la règle" and "piège à éviter" moments.
- `GraphFonctionAffine.jsx` is a static CSS-rotated div captioned "un graphique interactif permettra bientôt…" — never imported anywhere. `mafs` (the graphing dependency meant for exactly this) is unused repo-wide instead.
- Answer checking is brittle exact-string/float comparison (`userAnswers[q.id] === q.answer` against hardcoded LaTeX strings) — `MathInput`/`compareMathExpressions`, purpose-built for this, are used zero times in the lesson.

**What's worth salvaging from 3e:**
- `thales-3e`'s `InteractiveThales.jsx` — a real pointer-based drag simulator (not mouse-only), the strongest interaction found in either 3e lesson.
- `thales-3e`'s `Module06Mission.jsx` — real `MathInput` + adaptive hints + a genuine irreducible-fraction validator, on par with 6e ambition.
- Everything else in both 3e lessons is a stronger candidate for regeneration on the 6e template than for incremental patching.

This directly supports the product framing already in place: **keep 6e as the reference quality bar; regenerate 3e** — and do it by porting the two salvageable pieces above onto the Generation-2 toolkit, not by patching Generation-1 code in place.

---

## Phase 07 — Exercise architecture

Real, reusable interaction primitives exist for multiple-choice, ordering, grouping, sorting, and structured/composite answers. What's missing is a shared contract tying them together — and one confirmed API drift has already broken two shipped lesson modules.

| Type | Primitive | Hints/retries | Attempt tracking |
|---|---|---|---|
| Multiple choice | `QuizQuestion`, `ChoiceGrid` | None | None |
| Adaptive numeric/algebraic input | `MathInput` + `useAdaptiveExercise` | Hint ladder (`guidanceSteps`) + reveal-solution | `attempts` counter exists but is **never read anywhere** |
| Ordering/ranking | `OrderingGame` | Unlimited retries, no hints | None |
| Sorting/classification | `InfoSorter` | Unlimited retries, no hints | None |
| Composite (value + unit + sentence) | `AnswerBuilder` | Single static hint | None |
| Drag/drop, graph interaction, geometry construction, canvas, generic sliders | **Not abstracted** — each existing instance (e.g. Thalès drag figure) is a one-off, not a reusable type. | | |

**"Adaptive" is a hint ladder, not adaptive difficulty.** `useAdaptiveExercise` reveals progressively more scaffolding as a student gets things wrong — it does not select different content, adjust difficulty, or use the `attempts`/`difficulty` fields it tracks for anything at runtime. `difficulty` exists only as static metadata driving a star rating in the lesson index.

**The misconception-detection layer is dead code.** `errorClassifiers.js` implements two real, targeted misconception rules (`isMissingSquareRoot`, `isSignError` — e.g. detecting a student squared instead of taking a root, with a rule-specific message). They're passed into `useAdaptiveExercise` as a `detectError` config key by two modules — but the hook's own signature never destructures or calls `config.detectError`. The purpose-built explanation never reaches a student; only generic, per-module hardcoded hint strings do.

**Confirmed shipped bug — API drift.** `useAdaptiveExercise` was refactored to a new return shape (`status`/`fieldStatuses`/`specificFeedback`/…). Two live modules — `Module02CalculHypotenuse.jsx` and `Module03CalculCote.jsx` (Pythagoras) — still destructure the *old* shape (`value`, `setValue`, `feedback`, `isSolutionRevealed`), none of which exist on the hook anymore. `setUserAnswer` resolves to `undefined`; typing into the math field throws. A separate lesson family worked around the same drift by forking a local shim hook rather than fixing the call sites — evidence there's no test or type system that would have caught this.

Extending to a genuinely new exercise type (a geometry canvas task, say) today means writing a fully bespoke component and validator from scratch — there is no base contract to extend, and no compile-time guardrail (no TypeScript) against exactly the kind of drift that already broke two modules.

---

## Phase 08 — Error & remediation analysis

What happens today when a student is wrong ranges from genuinely good (mechanism-specific feedback in `OrderingGame`, real misconception rules for square-root/sign errors) to generic ("Ce n'est pas correct.") — and the good parts aren't systematically connected to the rest of the exercise engine (Phase 7). There is no adaptive difficulty and no retry limits anywhere.

Concretely: feedback is *author-written per exercise*, not derived from a detected error type, because the one piece of infrastructure meant to do that (`errorClassifiers.js`) isn't invoked. Where authors invested care (6e's hand-written `guidanceSteps` ladders, `OrderingGame`'s "here's exactly which comparison you got wrong" feedback), the result is genuinely pedagogical. Where they didn't (most 3e modules, `InfoSorter`'s default path), it's a generic right/wrong signal. This is a starting point worth building on, not a system to throw out — the rule-based classifiers already exist, they just need to be wired in and expanded.

---

## Phase 09 — State management

There is no global store. Every kind of state — UI, progress, auth, catalogue selection — lives in `localStorage`, read directly by whichever hook or component needs it, with zero network calls anywhere in the lesson layer.

| What | Where it lives | Mechanism |
|---|---|---|
| Module/exercise completion, XP | `localStorage['smarter_lesson_{id}']`, `['smarter_global_xp']` | `useProgress.js` hook, instantiated fresh per component |
| "Resume where I left off" | Derived live from the same localStorage data | `getResumeLesson.js` walks the flattened catalogue on every read — no caching, no reactivity beyond a window `focus`/`storage` listener in `Courses.jsx` |
| Auth token | `localStorage['token']` | `AuthContext.jsx`, raw `fetch` to `/auth/me` |
| Catalogue UI selection (level/grade/chapter) | `localStorage` + URL search params, mixed in the same effect | `Courses.jsx` |
| In-progress exercise answers, attempt counts | Component-local `useState` only | Lost on refresh/navigation — nothing persists mid-exercise |

Progress-percentage calculation is itself duplicated three ways (`useProgress.js`, `getLessonProgress.js`, and inline parsing directly in `Courses.jsx`) — three implementations of the same derivation that can silently drift. Two genuinely good pieces of pure logic already exist and should anchor any future refactor: `lessonAccess.js` (mastery/unlock rules, injected callback, zero storage coupling) and `mathComparison.js`/`mathValidation.js` (pure functions, zero DOM coupling).

---

## Phase 10 — Data model

Today's "data model" is really two unconnected things: a rich client-side JS shape describing lessons/modules, and a two-table SQL schema describing users and contact-form messages. Neither knows the other exists.

**Entities that exist today:**
- **User** (Laravel) — id, name, email, password hash, single string `role`
- **Contact** (Laravel) — contact-form submissions
- **Lesson** (client JS, `lesson.config.js`) — id, modules[], mastery threshold, sequential-unlock flag
- **Module** (client JS) — id, slug, title, difficulty, estimated time, color/style
- **Progress** (localStorage JSON blob) — completedModules[], completedExercises[], lastVisitedAt
- **CourseLevel/Domain/Chapter** (derived, curriculum JSON + overlay) — not a stored entity, computed each render

**Entities the target vision needs that don't exist anywhere:**
- Competency, prerequisite (raw material exists — the curriculum JSON already carries a `prerequisites` field per official object, unused)
- Mastery (only a binary complete/incomplete proxy exists client-side; `getModuleMastery` is an explicit seam for fractional mastery, unused)
- Attempt, Hint, Remediation-as-data (attempt count is tracked in a hook and never read or stored)
- Assessment, Review (spaced repetition)
- Event (nothing is logged anywhere)
- Experiment
- Student/Parent account, parent-child link

This is the clearest "total gap, not incremental" finding in the whole audit: every entity in the second list needs to be designed and built from nothing. See Phase 11 for why the backend can't absorb this incrementally, and Phase 24 for how this maps to prioritized work.

---

## Phase 11 — Backend, API & database

A backend exists — Laravel 13 + Sanctum, cleanly scaffolded — but it does one job (gate a single admin login and hold contact-form messages) and has no awareness of the education product at all.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/setup-database` | **None** | Wipes + recreates the DB, hardcoded admin credentials — see [Phase 20](#phase-20--security-audit) |
| POST | `/api/v1/auth/login` | public | Email/password → Sanctum token, admin-only |
| POST | `/api/v1/contact` | public | Store a contact-form submission |
| GET | `/api/v1/auth/me` | sanctum | Current user profile |
| GET | `/api/v1/contact` | sanctum | List submissions (admin inbox) |

Five migrations total (users, cache, jobs, personal-access-tokens, contacts) — confirmed exhaustively, nothing curriculum-related exists in the schema. `database_export.sql` (committed) matches this exactly: 12 tables, effectively one real data row (one admin user). No queues in active use, no policies, no form-request classes beyond inline `$request->validate()`.

**Reusable surface for the target build:** the Sanctum scaffolding pattern itself, and the `User` model as a starting point (needs real rework for multi-role + parent-child linking). Everything else — routes, controllers, the unguarded setup route — should be treated as throwaway prototype code. Building the target backend (curriculum, exercise, attempt, mastery, event, real accounts) is a greenfield effort, not an extension.

---

## Phase 12 — Authentication

Authentication exists, is minimal by design (it only needs to gate one admin today), and has exactly the shape you'd expect from that scope — which is also exactly why it can't be stretched to cover students/parents without real work first.

- **Provider:** Laravel Sanctum, plain personal-access-token bearer auth (not SPA cookie mode, despite `statefulApi()` being enabled but unused by the frontend).
- **Token storage:** `localStorage` on the frontend (`AuthContext.jsx`) — readable by any script on the page; see Phase 20 for the severity call.
- **Roles:** A single string column (`role`, default `'user'`), checked by bare equality (`=== 'admin'`) in exactly two places — the login controller and `ProtectedRoute`. No Policies, no Gates, no permission middleware anywhere in `api/app/`.
- **Protected routes:** Only `/admin`. Every lesson route is public — the "locking" a student sees between modules is a pedagogical UX gate (`lessonAccess.js`, localStorage-driven), not an authorization boundary, and is trivially bypassable by design (it isn't meant to be security).
- **Registration:** Does not exist. No `/register` route, no student/parent sign-up flow anywhere.

This is fine for what the app does today. It is not a foundation the target multi-role (student/parent/admin) system can be layered onto without building real authorization (Policies/Gates) and a token-handling story that doesn't put student PII in localStorage.

---

## Phase 13 — Responsive web audit

The consistent use of Pointer Events (not mouse-only handlers) across every drag/tap interaction in the shared lesson toolkit is the standout positive finding here — confirmed by a repo-wide grep returning zero `onMouseDown`/`onMouseMove` matches. The remaining issues are narrow and mostly non-blocking.

| Issue | Where | Severity |
|---|---|---|
| Column-arithmetic widgets need `min-w-[400–480px]`, forcing horizontal scroll on phones <480px wide | `Module03Soustraction.jsx`, `Module02Addition.jsx`, `Module06OperationsPosees.jsx` | MEDIUM |
| GeoGebra applet reads a fixed pixel width at mount, doesn't respond to resize/rotation afterward | `GeoGebraGraph.jsx` (homepage hero only) | MEDIUM |
| Remote iframe-embedded graphing tool — touch support is outside this app's control | `GeoGebraGraph.jsx` (homepage hero only) | MEDIUM |
| `NumberLine` sets a 340px minimum width | `NumberLine.jsx` | LOW — fits inside a 375px viewport |
| No mouse-only interaction pattern anywhere in the shared lesson toolkit | `NumberLine`, `OrderingGame`, `InfoSorter`, `GroupBuilder` | POSITIVE FINDING |

All responsive layout is delegated to Tailwind's `sm:`/`md:`/`lg:` utilities (zero `@media` queries hand-written anywhere) — a consistent, reasonable pattern.

---

## Phase 14 — Future mobile readiness

Not building mobile now — but the audit found the pure logic layer is already, largely by accident of good factoring, close to portable. The risk is concentrated in three specific places, not spread evenly across the codebase.

**Already portable:**
- `mathValidation.js` / `mathComparison.js` — pure, no DOM
- `lessonAccess.js` — pure functions, storage injected via callback
- `numberFormat.js`, `errorClassifiers.js`

**Fixable seam (wired to `localStorage` directly instead of an adapter):**
- `useProgress.js` — the algorithm is portable, the storage calls aren't abstracted
- `AuthContext.jsx` — same pattern for the token
- `Courses.jsx` — mixes URL params + localStorage + business-rule resolution in one function body

**Irreducibly web-only:**
- `MathInput.jsx` — wraps a Web Component (mathlive); needs a real native replacement, not a refactor
- `GeoGebraGraph.jsx` — script-injected iframe; isolated to the marketing homepage, contained risk

**Direction, not action:** introducing a thin storage-adapter interface behind `useProgress`/`AuthContext` now (even while staying web-only) is cheap today and is exactly the seam a future React Native app would need — this is the one "mobile-readiness" change worth making before mobile work starts, because it also happens to be required for backend progress-sync regardless of mobile (Phase 27).

---

## Phase 15 — Design system audit

Three parallel, uncoordinated color systems currently exist, and the marketing site and the lesson UI read as two different products.

| System | Where | Problem |
|---|---|---|
| Tailwind theme extension | `tailwind.config.js` | Only 3 custom colors + fonts defined — thin, but the one legitimate source of truth |
| Hardcoded hex in CSS | `src/index.css` | The same blue/purple/cyan triplet re-declared as raw hex ≥6 times instead of referencing the Tailwind theme |
| Per-component tone maps | `ConceptCard.jsx` (9 tones), `FeedbackBox.jsx` (3 tones), `LessonUI.jsx`'s `Feedback` (a 4th, slightly different palette) | Three independent color-tone dictionaries in the lesson layer alone, none shared |

`components/common/` holds no visual primitives at all — no `Button`, `Card`, or `Input`. Every marketing button is hand-rolled Tailwind, duplicated verbatim between `Navbar.jsx`'s two CTA instances. The lesson layer, by contrast, does have real shared primitives (`LessonUI.jsx`) — they just never touch anything in `components/common/`, and vice versa: two disconnected systems, not one inconsistent one.

**Gamification UI** is a stub: an XP counter and a progress bar exist (with correct ARIA, see Phase 16); no streaks, badges, levels, or dashboard visualization exist anywhere.

---

## Phase 16 — Accessibility

A genuine split: the lesson/exercise layer shows deliberate accessibility engineering; the marketing shell around it doesn't.

**Lesson layer — comparatively strong:**
- `NumberLine`: `role="slider"`, full `aria-value*`, complete keyboard support (arrows/Home/End/PageUp/Down)
- `InfoSorter`: keyboard fallback (Enter/Space) on click-only drop targets
- Consistent `focus-visible:ring-2` and ≥44px touch targets in `LessonUI.jsx`
- Feedback uses `role="status"`/`role="alert"` + icon, never color alone
- Proper breadcrumb (`<nav aria-label>`, `aria-current="page"`) in `ModuleLayout`

**Gaps:**
- No skip-to-content link anywhere in the app
- Marketing nav/hero/footer largely lack `focus-visible` styling
- `GeoGebraGraph.jsx`'s live iframe has no ARIA wrapper or text alternative
- `MathInput`'s `ariaLabel` is optional with no enforced fallback
- `text-slate-400/500`-on-light patterns recur widely enough to be a contrast risk (not measured here, flagged for a real contrast pass)

`html lang="fr"` is correctly set — a small but correct baseline for a French-content platform.

---

## Phase 17 — Performance

The single largest performance finding in the audit: **zero code-splitting exists anywhere**. `vite.config.js` has no chunking strategy, and there is not one `React.lazy` or dynamic `import()` in the entire `src/` tree.

`App.jsx`'s ~190 eager static imports pull in, transitively, every heavy dependency the app owns — `mathlive`, `katex`, `@cortex-js/compute-engine`, all of `framer-motion` — into a bundle graph with no per-route boundary. A visitor to the homepage today downloads the machinery for every lesson in every grade, whether or not they ever open one. This is also the direct performance consequence of the routing pattern in Phase 4 — fixing one substantially fixes the other, since a data-driven route table is the natural place to introduce `React.lazy` per lesson.

Minor, low-effort finding: the app's 4 total `<img>` tags all have `alt` text (good) but none use `loading="lazy"` — a free fix given how few images exist.

---

## Phase 18 — Analytics audit

**No analytics exist. At all.** A repo-wide search for every major provider and for generic event-tracking calls returned nothing (the one near-hit was the French word "plausible," used pedagogically in an estimation lesson, coincidentally matching the Plausible Analytics keyword). No page views, no lesson/exercise events, no error monitoring, no performance monitoring.

Every category in the target list — acquisition, activation, engagement, learning, mastery, errors, misconceptions, retention, parent engagement, technical performance — starts from zero. This isn't a deficiency to patch incrementally; it's a green field that should be designed *alongside* the backend data model (Phase 11/24), not bolted onto lessons after the fact, since attempt-level data doesn't exist yet either.

---

## Phase 19 — Testing audit

Zero automated frontend test coverage of any kind — no vitest/jest/RTL/Playwright/Cypress config, no test-related dependency, no `test` script in `package.json`, no `*.test.jsx` file anywhere. The Laravel backend has PHPUnit wired up, but both test files are the untouched default Laravel skeleton (asserts the homepage returns 200; asserts `true === true`) — zero coverage of the actual `AuthController`/`ContactController` logic.

The highest-risk untested surface, given everything above: `useAdaptiveExercise.js` (already has one confirmed live regression from an unnoticed API change), `mathComparison.js`/`lessonAccess.js` (pure functions — cheapest possible unit-test target, currently untested), and the `/setup-database` route (Phase 20) which a single feature test would have flagged as reachable.

---

## Phase 20 — Security audit

Two findings here are time-sensitive independent of any architecture decision. Everything else is standard "not built yet" gap, not active exposure.

### CRITICAL — Unauthenticated database-wipe route

`GET /api/v1/setup-database` (`api/routes/api.php:8-25`) calls `Artisan::call('migrate:fresh', ['--force' => true])` — dropping and recreating every table — then creates an admin account, with **no middleware, no environment guard, no auth check**. It's a plain `GET`, reachable from a browser address bar, sitting as the second route declared in the file. No rate limiting applies either (Laravel 13's opt-in API throttle is never enabled in `bootstrap/app.php`). If this has ever been reachable on a live deployment, treat it as an active incident: rotate the hardcoded credential and the account it creates, independent of any remediation timeline.

### HIGH — Real credential + PII committed to git

`database_export.sql` (tracked since the initial commit) contains a real production bcrypt password hash paired with a real personal email address and the production database name. Offline-crackable, and confirms real infrastructure detail to anyone with repo access. A plaintext admin password is separately hardcoded in the `/setup-database` route itself (normally-tracked source, not a gitignored env file). Both should be scrubbed from git history, not just removed going forward, and the associated credentials rotated.

### MEDIUM — Token in localStorage

Auth token stored in `localStorage` (XSS-exposed) rather than an httpOnly cookie. Low blast radius today (admin-only), but not a pattern to carry into a system holding student/parent PII.

### MEDIUM — No real authorization layer

No Policies/Gates exist anywhere in the Laravel app — the only access control is "is this any valid token," plus a bare string-equality role check at login. Fine for one admin; not a foundation for multiple roles.

### CLEAN — Frontend XSS surface

No `dangerouslySetInnerHTML`, no `eval`, one harmless `innerHTML = ''` (clearing a container, no user data involved). React's default JSX escaping applies throughout. `.env.hostinger` is correctly gitignored and was never committed. The admin credential does not leak into any frontend bundle code.

---

## Phase 21 — Content architecture

Two generations of content exist: an older, fully static HTML system (195 committed files, now deleted-but-uncommitted) and the current React system. The old system is worth mining for pedagogical reference on 5e specifically — not for its code.

| Grade | Classification | Reasoning |
|---|---|---|
| 6e | **READY** | 9/9 catalogued lessons fully implemented and consistent (85 modules), Generation-2 toolkit throughout, no defects found in sampling. 37.5% of the full official curriculum — more chapters remain to author, but everything built works. |
| 5e | **MISSING** | Zero lesson folders exist. Curriculum is fully scoped already (16 official objects, 5 domains) in the reference JSON files. The old static system's 5e content (90 files, all 7 topics complete with metadata/objectives/thumbnails) is the most content-complete artifact from the old approach and the best candidate for pedagogical reference when authoring new 5e lessons. |
| 4e | **MISSING / EARLY** | 1 of 15 official objects implemented (~7%). One working pilot lesson (`racines-carrees`) using Generation-2 toolkit correctly. Two more topics pre-scaffolded as "coming soon" with no folder yet. |
| 3e | **REGENERATE** | 7 lessons / 51 modules implemented (29% of official curriculum), all on Generation-1 primitives with the defects detailed in Phase 6. The old static system's 3e content is thin (1 topic, no metadata/thumbnails) and already superseded by the current React lesson — nothing to salvage there. Salvage candidates are two specific components inside the current React lessons (Phase 6), not the old static files. |

**Old static system, characterized:** plain HTML + Tailwind Play CDN + inline vanilla JS (`onclick="checkMicroProb1(1)"`), no build step, no component reuse across lessons — each lesson a self-contained ~200-line document. Thematically consistent with the new system (same XP/mission-based capstone framing) but architecturally obsolete. 5e's 90 files are the one genuinely complete set; 4e is inconsistently complete (some lessons missing metadata entirely); 3e is the thinnest of all. This is exactly why the deletion in the working tree makes sense as a decision — but it is still an *uncommitted* decision, and finalizing it (commit the deletion, or explicitly archive the 5e content elsewhere first) is a process item, not an architecture one.

Two reference-data sets confirm the curriculum-scoping work is real and thorough: `smarter_academy_programmes_maths_2026.json` (the live source `coursesData.js` reads from) and three `verified_scopes_*.json` files (cycle 4 + lycée, offline research artifacts, not imported by the app) — plus two saved competitor reference pages in `programmes/`. None of this is code; all of it is planning material that de-risks authoring 5e and Lycée content later.

---

## Phase 22 — Technical debt inventory

| ID | Category | Description | Severity | Affected | Action |
|---|---|---|---|---|---|
| TD-01 | Security | Unauthenticated DB-wipe route | CRITICAL | `api/routes/api.php:8-25` | Remove/guard behind CLI-only + env check; rotate credentials |
| TD-02 | Security | Bcrypt hash + PII committed to git | HIGH | `database_export.sql` | Scrub git history, rotate credential |
| TD-03 | Architecture | Manual route/import wiring, one file, 178 routes | HIGH | `src/App.jsx` | Data-driven route generation before 5e/Lycée |
| TD-04 | Performance | Zero code-splitting; entire catalogue + heavy libs in one bundle | HIGH | `vite.config.js`, `App.jsx` | Lazy-load per lesson route, alongside TD-03 |
| TD-05 | Data | No backend data model for curriculum/exercise/progress/mastery | CRITICAL (for target) | `api/` entirely | Greenfield backend build |
| TD-06 | Lessons | 3e quality regression: broken component calls, one crash, ungated completion | HIGH | `3e/donnees_probabilites/fonctions-lineaires-affines` | Regenerate on 6e/Gen-2 template |
| TD-07 | Exercises | Misconception detector wired but never invoked | MEDIUM | `errorClassifiers.js`, `useAdaptiveExercise.js` | Reconnect or remove |
| TD-08 | Exercises | API drift broke 2 live Pythagoras modules | HIGH | `Module02CalculHypotenuse.jsx`, `Module03CalculCote.jsx` | Fix now; add a smoke test |
| TD-09 | Testing | Zero automated frontend coverage | HIGH | whole `src/` | Start with the pure-logic layer (vitest) |
| TD-10 | Design system | Three uncoordinated color/tone systems | MEDIUM | `tailwind.config.js`, `index.css`, per-component tone maps | Consolidate into one token source |
| TD-11 | UX | Marketing UI and lesson UI are visually disconnected systems | MEDIUM | `components/` vs `lessons/common/` | Shared Button/Card primitives when touched next |
| TD-12 | Data | Progress is 100% client-only, no backend sync | HIGH | `useProgress.js` | Storage adapter + sync once backend exists |
| TD-13 | Analytics | Zero event tracking anywhere | HIGH | whole app | Design alongside backend rebuild |
| TD-14 | Accessibility | No skip-link; inconsistent focus-visible on marketing shell | MEDIUM | `Navbar.jsx`, `Footer.jsx`, `Hero.jsx` | Low-cost fix, any time |
| TD-15 | Maintainability | 318-file uncommitted deletion (old static lesson system) | LOW | `public/modules/` | Human decision: commit the deletion or archive first |
| TD-16 | Maintainability | Stale prior-portfolio audit doc could confuse future contributors | LOW | `PROJECT_ANALYSIS.md` | Archive or remove when convenient |

---

## Phase 23 — Preserve vs. refactor vs. rebuild

### KEEP
- The Generation-2 lesson toolkit (`LessonUI`, `NumberLine`, `OrderingGame`, `GroupBuilder`, `BarModel`, `CalcChain`, `InfoSorter`, `AnswerBuilder`, `ModuleLayout`, `LessonIndex`)
- `MathText`/`MathInput` + `mathComparison.js`, `numberFormat.js`
- All 9 implemented 6e lessons, as-is
- The AGENTS.md pedagogical loop as the product's design contract
- `lessonAccess.js`'s pure-function pattern — the portability template to copy elsewhere
- The curriculum reference data (`smarter_academy_programmes_maths_2026.json` + `verified_scopes_*`) and the "official JSON + editorial overlay" catalogue idea
- Laravel + Sanctum as the backend toolchain choice

### REFACTOR
- Route/lesson wiring — move to data-driven generation + lazy loading; keep the underlying lesson-authoring pattern unchanged
- `useAdaptiveExercise`/`ExerciseValidator`/`errorClassifiers` — fix drift, reconnect, define one shared exercise contract
- Design tokens — consolidate three parallel systems into one
- Auth — keep Sanctum, add real roles/Policies as multi-role accounts get built
- Progress persistence — keep localStorage as an offline-first cache, add a sync adapter rather than replacing it

### REBUILD
- Backend data model — nothing to refactor, curriculum/exercise/attempt/progress/mastery/event domain is greenfield
- 3e lesson content — regenerate on the 6e/Gen-2 template, porting the two salvageable Thalès pieces
- Analytics — nothing exists to preserve
- `/setup-database` — delete and replace with a CLI-only, env-guarded command (`CreateAdmin.php` already shows the safe pattern)

### DO NOT TOUCH YET
- The single 4e pilot lesson — leave as reference until full 4e planning begins
- The old `public/modules` static content — don't restore or purge mid-audit; it's a pending human decision
- `GeoGebraGraph.jsx` — web-only, isolated to the homepage; not worth abstracting before mobile work actually starts
- The XP-counter gamification stub — don't build streaks/badges/leaderboards until a real mastery/backend model exists to hang them on
- AdminDashboard/contact inbox — low-stakes, works, not on the critical path

---

## Phase 24 — Target gap analysis

| Feature | Current | Gap | Priority | Risk |
|---|---|---|---|---|
| Catalogue | Honest, curriculum-grounded, but 6e 37% / 3e 29% / 4e 7% / 5e 0% built | Content authoring + data-driven wiring | P1 | Medium |
| Lessons | 9 strong (6e), 7 uneven (3e), 1 pilot (4e), 0 (5e) | Regenerate 3e, scale 4e, author 5e from scratch | P1/P2 | Medium |
| Exercises | Real primitives, no shared contract, misconception layer disconnected | Formal exercise contract + reconnect detection | P1 | Medium |
| Student accounts | None — one hardcoded admin only | Total | P2 | High if security debt isn't fixed first |
| Parent accounts | None | Total | P3 | Low |
| Diagnostic assessment | None | Total | P2/P3 | Medium |
| Competencies/prerequisites | None built; raw `prerequisites` field already in curriculum JSON | Large, partial raw material | P1/P2 | Medium |
| Mastery | Binary only; fractional seam (`getModuleMastery`) already exists unused | Medium — seam already there | P2 | Low |
| Remediation | Static per-module hints; rule-based detectors exist but disconnected | Medium — reconnect + expand | P1 | Low |
| Spaced review | None | Total | P3 | Low |
| Gamification | XP counter only | Large | P2/P3 | Low |
| Student dashboard | None | Total | P2 | Medium |
| Parent dashboard | None | Total | P3 | Low |
| Admin dashboard | Contact inbox only | Large | P2/P3 | Low |
| Analytics | None | Total (foundation) | P1 | Medium |
| Experimentation | None | Total | P3 | Low |
| AI internal analysis | None (intentionally deferred) | Total, deferred by design | P3 | Low |

---

## Phase 25 — Architectural principles

Each principle below is justified by a specific finding above, not asserted generically.

1. **Separate lesson content/UI (proven good) from lesson wiring (proven bad).** Register lessons from data, not hand-written per-module imports and routes — Phase 4 showed the authoring pattern scales and the wiring pattern doesn't.
2. **One exercise contract.** Every exercise type should share a `{definition, validate, feedback, attempt-tracking}` shape — Phase 7 showed the cost of not having one: an API drift silently broke two shipped modules with nothing to catch it.
3. **Progress and auth state behind a storage adapter, not raw `localStorage` calls.** Phase 9/14 showed the pure logic is already portable; only the storage plumbing needs the seam, and it's needed for backend sync regardless of mobile.
4. **Curriculum as data, catalogue as a generated artifact.** Keep the official-JSON + editorial-overlay idea (Phase 5 confirmed it's honest and well-grounded) but generate routes/imports from it instead of hand-maintaining both in parallel.
5. **Domain/validation logic stays framework-agnostic.** `mathValidation.js`/`lessonAccess.js` already prove this works (Phase 6/9) — don't let it creep into components the way it partially has in `Courses.jsx`/`AuthContext.jsx`.
6. **Destructive operations never live behind an unauthenticated web route.** The safe pattern (a CLI-only, env-guarded Artisan command) already exists in the codebase (`CreateAdmin.php`) right next to the unsafe one (Phase 20) — use the one already proven, don't invent a new safeguard.
7. **One design token source.** Three independently-drifted color systems (Phase 15) is the evidence, not a hypothetical.
8. **Design analytics alongside the backend rebuild, not after.** Attempt-level data doesn't exist yet (Phase 9/18) — this is a rare chance to define events at the same time as the data model instead of retrofitting them onto an existing schema later.

---

## Phase 26 — Target architecture

Realistic for this codebase means: extend the proven lesson-authoring layer, replace the wiring around it, and build the backend that doesn't exist yet — not a rewrite of what already works.

```
Web UI (React) — today's lesson components, marketing pages, dashboards
        │  consumes
        ▼
Domain layer — lesson/exercise contracts, validation, mastery & progress rules
        │  (already exists, partially: mathComparison.js, lessonAccess.js — formalize & complete)
        │  talks to, via a storage/API adapter (the seam from Phase 14)
        ▼
API / data layer — curriculum, exercise, attempt, mastery, event endpoints
        ▼
Backend (Laravel) — real data model + auth/roles     (greenfield, per Phase 11)
        ▼
Database
```

Future — same domain layer, different UI:

```
Web UI ───────────┐
                   ▼
          Domain layer (shared, unchanged)
                   ▲
Mobile UI (RN, later) ───┘
```

The frontend and lesson-content architecture stay largely as they are. What changes: route/lesson registration becomes data-driven with lazy loading; the exercise engine gets one contract instead of many bespoke shapes; progress/auth move behind a storage adapter; a real backend gets built for the entities that don't exist today; analytics gets designed as part of that backend work, not after it.

---

## Phase 27 — Migration strategy

Ordered by actual dependency in this repo — not a generic template. Stages 3 and 4 can run in parallel once Stage 2 lands, since content authoring and backend work don't block each other.

| Stage | Focus | Why this order |
|---|---|---|
| 0 — Security | Fix `/setup-database`, rotate credentials, scrub git history | Time-sensitive, independent of everything else; must happen regardless of any architecture decision |
| 1 — Foundation | Decide the `public/modules` deletion; data-driven route/lesson registration; consolidate design tokens; vitest for the pure-logic layer | Unblocks 5e authoring and keeps 6e/3e/4e working throughout; no user-facing risk |
| 2 — Exercise engine hardening | Fix the `useAdaptiveExercise` drift; reconnect or remove `errorClassifiers`; define one exercise contract | Must land before new content is authored on top of it — otherwise 5e/3e-regen content inherits the same drift risk |
| 3 — Content (parallel with 4) | Regenerate 3e on the 6e template; author 5e fresh (already scoped) | Now safe because Stage 2 fixed the engine underneath; the bulk of near-term content work |
| 4 — Backend foundation (parallel with 3) | Curriculum/exercise/attempt/progress/mastery entities; real student/parent accounts; role-based authorization | Greenfield, doesn't block or get blocked by Stage 3 |
| 5 — Sync layer | Wire `useProgress`/`AuthContext` through the storage adapter to the new backend, keeping localStorage as an offline cache | This is where the Phase 14 seam pays off — needs Stage 4 to exist first |
| 6 — Diagnostic, mastery, remediation | Build on top of now-real attempt/mastery data | Needs Stage 5's real data flowing |
| 7 — Dashboards + analytics | Student/parent/admin dashboards, event pipeline | Needs real data to show; design events alongside Stage 4, ship the UI here |
| 8 — Expansion | Gamification depth, spaced review, experimentation, AI internal analysis, Lycée content, mobile | Depends on everything above existing first |

---

## Phase 28 — Prioritization

### P0 — Before major development
- Rotate credentials + remove/guard `/setup-database`
- Decide the `public/modules` deletion (commit or restore)
- Fix the 2 already-broken Pythagoras modules

### P1 — To keep shipping content safely
- Data-driven route/lesson registration + code-splitting
- Shared exercise contract + reconnect misconception detection
- Consolidate design tokens

### P2 — As backend work begins
- Backend data model + real accounts/roles
- 3e regeneration, 5e authoring
- Student dashboard + progress sync

### P3 — Future / optional
- Parent/admin dashboards, analytics pipeline
- Gamification expansion, spaced review, diagnostic
- AI internal analysis, Lycée content, mobile

---

## Phase 29 — Roadmap to a complete 6e product

6e is already the most complete grade (Phase 21) — the roadmap to a genuinely *complete* 6e product is less about new 6e lessons and more about the platform underneath finally catching up: real accounts, real progress persistence, and the wiring fixes that keep every later grade from repeating today's routing/exercise debt.

| Phase | Goal | Depends on | Validates via |
|---|---|---|---|
| 0. Security | Close the DB-wipe exposure | — | Route returns 404/403 unauthenticated; credentials rotated |
| 1. Wiring | Replace manual route/import registration with a generated table + lazy loading | Phase 0 not required, can run parallel | Bundle-size drop on homepage load; adding a lesson requires no `App.jsx` edit |
| 2. Engine hardening | Fix exercise-hook drift, reconnect misconception detection, define the exercise contract | none | Both Pythagoras modules work again; a vitest suite covers `mathComparison`/`lessonAccess` |
| 3. Backend foundation | Curriculum/exercise/attempt/progress/mastery entities + real accounts | none (parallel to 1–2) | A real student can register, and one lesson's progress round-trips through the API |
| 4. Sync + dashboard | Progress syncs to backend; a real student dashboard replaces the localStorage-only view | Phase 3 | Progress survives a cleared browser / different device |
| 5. 6e completion | Author the remaining 6e domains (62.5% of the curriculum still unbuilt) using the now-hardened engine | Phase 2 | Catalogue coverage for 6e approaches 100% |

3e regeneration and 5e authoring can start as soon as Phase 2 lands — they don't need to wait for "complete 6e," since they depend on the engine being fixed, not on 6e's content count.

---

## Phase 30 — Final architect's verdict

### 1 · Current maturity

| Dimension | Score |
|---|---|
| Architecture | 4 / 10 |
| Frontend | 5 / 10 |
| Lesson system | 6 / 10 |
| Exercise system | 4 / 10 |
| Data model | 2 / 10 |
| Backend | 2 / 10 |
| UX | 6 / 10 |
| Accessibility | 5 / 10 |
| Performance | 3 / 10 |
| Testing | 1 / 10 |
| Analytics | 0 / 10 |
| Scalability | 3 / 10 |
| Future mobile readiness | 5 / 10 |

The pattern in these numbers: everything touching *lesson content and its immediate UI* (lesson system, UX, accessibility, mobile-readiness) sits in the 5–6 range — genuinely decent, built with care. Everything touching *infrastructure around that content* (data model, backend, testing, analytics, performance, scalability) sits at 0–3 — because it largely doesn't exist yet, not because what exists is poorly built. That split is the whole story of this audit.

### 2 · Biggest strengths

1. The Generation-2 lesson toolkit — genuinely manipulation-first, accessible, and well-factored (`NumberLine`, `OrderingGame`, `ModuleLayout`, etc.)
2. 6e content quality — 9 lessons, 85 modules, zero defects found across two full lessons sampled
3. A real, editorially-honest catalogue grounded in official French curriculum data, not invented content
4. Pure, portable domain logic where it exists (`mathComparison.js`, `lessonAccess.js`, `numberFormat.js`)
5. Consistent Pointer Events usage — no mouse-only interaction anywhere in the shared toolkit
6. Deliberate accessibility engineering in the lesson layer (keyboard support, ARIA, focus management)
7. A documented pedagogical contract (AGENTS.md) that's actually followed in the reference lessons
8. Real curriculum-scoping research already done for 5e and Lycée, ready to be authored against
9. Clean frontend XSS posture — no unsafe HTML rendering anywhere
10. An honest catalogue — nothing is advertised as available that isn't actually built

### 3 · Biggest risks

1. Unauthenticated production database-wipe route (Phase 20)
2. Committed credential hash + PII in git history (Phase 20)
3. Zero backend data model — nothing in the target vision is reachable without it
4. Zero automated tests — the exercise-engine drift bug already shipped undetected once
5. App.jsx's manual wiring pattern compounding with every lesson added before it's fixed
6. Zero code-splitting compounding bundle size with every lesson added, same root cause
7. 100% client-only progress data — nothing to build parent/teacher visibility or mastery analytics on
8. The 3e quality gap, if regenerated by patching Generation-1 code instead of porting to Generation-2
9. The misconception-detection layer's disconnection going unnoticed indefinitely without a test catching it
10. Zero analytics — every product decision from here is currently unmeasurable

### 4 · Biggest architectural mistake to avoid

Treating this as a rewrite instead of an extraction. The lesson-authoring pattern and its toolkit are the best-built part of this codebase — the temptation, faced with a messy `App.jsx` and a thin backend, will be to start a parallel "clean" frontend architecture. That would throw away the one thing here that's already proven to work at 6e's quality bar. The actual problem is narrower than it looks: wiring, backend, and testing — not the lesson content layer.

### 5 · Biggest unnecessary rewrite to avoid

Rewriting the 6e lessons, the common toolkit, or the curriculum-JSON-driven catalogue "for consistency" while regenerating 3e. 6e is the quality bar, not a problem to solve alongside it — regenerating 3e should mean porting it onto what 6e already uses, not redesigning both. Likewise, the "official curriculum + editorial overlay" catalogue idea is sound; only its routing wiring needs to change, not its data shape.

### 6 · Three highest-impact actions

1. **Security remediation.** Rotate the exposed credentials and lock down `/setup-database` — near-zero cost, prevents a catastrophic and entirely avoidable loss.
2. **Data-driven lesson registration.** Replace the manual `App.jsx` wiring with generated routes + lazy loading. This single change most determines whether the next six months of 5e/3e-regen/Lycée content work is sustainable or compounds today's debt.
3. **Start the backend data model now, in parallel.** Nothing in the target vision — dashboards, parent view, mastery, spaced review, analytics, the AI-improvement loop — is reachable without it, and it's a multi-month greenfield effort that only gets more expensive to start later.

### 7 · Recommended immediate next step

**Rotate the exposed credentials and remove or lock down the `/setup-database` route today** — before any planning or architecture work begins. It's the only finding in this audit that's actively time-sensitive; everything else can wait for the human review this document is written for.

---

**WAITING FOR HUMAN REVIEW AND APPROVAL.**
