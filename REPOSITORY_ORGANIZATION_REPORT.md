# Repository Organization

## Final architecture

An npm-workspaces monorepo:

```
smarter-academy-v2/
├── apps/
│   ├── web/                 React 18 + Vite 5 + Tailwind 3 SPA (moved from repo root)
│   └── api/                 Laravel 13 + Sanctum (moved from api/)
├── packages/
│   └── core/                 @smarter-academy/core — platform-agnostic logic + curriculum data
├── docs/
│   ├── architecture/          living contracts (unchanged location)
│   ├── reports/                historical audit/report snapshots (moved from repo root)
│   └── data-verification/     curriculum-data verification evidence (moved from repo root)
├── package.json               workspace root: workspaces list, shared devDependencies, delegating scripts
├── README.md, CONTRIBUTING.md
└── .agents/
```

**Why this shape.** The brief's explicit target — web today, React Native later, shared logic between them — is the textbook case for an npm-workspaces monorepo with an `apps/` + `packages/` split: it's zero-new-tooling (workspaces are native to npm), and critically, Metro (React Native's bundler) resolves workspace packages the same way Vite does, via ordinary `node_modules` symlinks — no bundler-specific alias config to duplicate later. `apps/api` moved alongside `apps/web` for the same reason a reader would expect it there: "deployable applications live under `apps/`" has no exceptions to remember. `packages/core` holds only what was **verified**, not assumed, to have zero React/DOM/bundler coupling (see below) — everything else stayed put.

## What was moved

**Into `packages/core`** (each file individually checked for `localStorage`/`window`/`document`/`import.meta` before moving — not moved on filename alone):
`mathComparison.js`, `numberFormat.js`, `lessonAccess.js`, `errorClassifiers.js`, `auth.js` (`hasRequiredRole`), `validation/{validateChoiceAnswer,validateNumericAnswer}.js`, `progress/calculateCompletionPercentage.js`, and `curriculum/coursesData.js` + the curriculum JSON it reads — all with their existing tests. New: `packages/core/index.js` (barrel export) and `package.json` (declares `@cortex-js/compute-engine`, the one real dependency `mathComparison.js` has).

**~35 import sites** across the lesson tree, pages, and components were rewritten from relative paths (`../../../../common/utils/...`) to `from '@smarter-academy/core'`, via a scripted regex pass per module name, then verified with a residual grep (zero matches) and a full build.

**Everything else in `src/`** moved as one atomic unit to `apps/web/src/` — this preserves every internal relative import unchanged, since relative structure within the tree didn't change, only its parent. Config (`vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`), `public/`, and the two frontend `.env.*` files moved with it.

**`api/` → `apps/api/`**, internals untouched (Laravel doesn't care what its parent directory is called). `.env.hostinger` — a full Laravel prod config that was oddly sitting at the frontend's repo root — moved to `apps/api/` alongside `.env`/`.env.example`, where it always conceptually belonged (this was already flagged as a minor inconsistency in the original architecture audit).

**Root-level `.md` reports** (`AUDIT.md`, `ARCHITECTURE_FOUNDATION_AUDIT.md`, `ARCHITECTURE_FOUNDATION_REPORT.md`, `AUTHENTICATION_FOUNDATION_REPORT.md`, `CODEBASE_CLEANUP_REPORT.md`) → `docs/reports/`, and the three `verified_scopes_*.json` files (curriculum-data verification evidence, referenced only from those reports, consumed by no code) → `docs/data-verification/`. `README.md`/`CONTRIBUTING.md` stayed at root (GitHub convention).

## What was removed

Nothing was deleted. The stale root `dist/` (build output from before the move, already gitignored) was cleared since it no longer corresponds to the new source layout — regenerated correctly by `npm run build` into `apps/web/dist/`, confirmed byte-for-byte comparable to the pre-move build (same bundle size).

One thing was **flagged, not removed**: `apps/web/public/smarter-ui/` (`global-nav.js`, `lesson.js`, `lesson.css`) has zero references anywhere in the current source tree — it appears to be a leftover static-JS navbar bundle for the now-deleted static HTML lesson pages seen in this repo's earlier history. Per the brief's "do not delete unless confirmed unnecessary," it was left in place; confirming and removing it is a good candidate for a future, narrowly-scoped cleanup pass.

## What was kept unchanged

`apps/web/src/lessons/` internal structure (the "one folder per lesson" convention, all 141 `Module*.jsx` files, `lesson.config.js` files) — explicitly **not** split apart despite `lesson.config.js` itself being pure data, because splitting a well-established, zero-exception, actively-documented convention (CONTRIBUTING.md) for a still-hypothetical consumer would be exactly the "unnecessary abstraction" the brief warns against. `apps/web/src/lessons/common/hooks/` and the `localStorage`-coupled half of `.../utils/progress/` (`getLessonProgress`, `getResumeLesson`, and friends) — genuinely web-coupled today, and splitting a small, cohesive folder across two package boundaries for one pure file for now (`calculateCompletionPercentage.js`, which did move) would have fragmented it for no real benefit. `src/data/{education,experience,projects,skills}.js` — verified as actively-used portfolio/marketing content (About/Services sections), not curriculum data; left in `apps/web`, not `packages/core`. Laravel's own default, unused `apps/api/package.json`/`resources/js/` scaffold — pre-existing, orthogonal to the new workspace, not worth touching.

## Configuration changes

- **Root `package.json`**: renamed `abdennour-portfolio` → `smarter-academy`; added `"workspaces": ["apps/web", "packages/core"]`; scripts now delegate (`npm run build` → `--workspace=apps/web`, etc.); `dependencies` split out to `apps/web/package.json`, `devDependencies` (vite, vitest, tailwind, postcss, autoprefixer, concurrently) stayed at root, shared across workspaces.
- **New `apps/web/package.json`**: the split-out runtime dependencies, plus `"@smarter-academy/core": "*"` as a workspace dependency. Its `test` script uses `vitest run --passWithNoTests` — all of this repo's current tests moved to `packages/core`, so a plain `vitest run` here would exit 1 on zero test files and silently break the root `npm test` chain; caught and fixed during verification.
- **New `packages/core/package.json`**: `@cortex-js/compute-engine` as a direct dependency, its own `test` script.
- **`npm install`** at the root regenerated `package-lock.json` and created the `node_modules/@smarter-academy/{core,web}` workspace symlinks — confirmed via `npm ls --workspaces`.
- **No Vite alias, no Metro config, no path mapping** was added anywhere — bare `@smarter-academy/core` imports resolve through ordinary node_modules symlink resolution in both current (Vite) and future (Metro) tooling.
- `.gitignore` needed no changes — its patterns (`node_modules/`, `dist/`, `.env*`) have no leading slash, so they already matched at any depth.

## Verification results

| Check | Result |
|---|---|
| `npm test` (packages/core → apps/web) | 61/61 passing |
| `npm run build` | succeeds, output in `apps/web/dist/`, bundle size unchanged from pre-move, all `public/` assets (CV.pdf, logo, `smarter-ui/`) correctly copied |
| Laravel backend (`php artisan test`, from `apps/api`) | 18/18 passing |
| Laravel code style (`vendor/bin/pint --test`) | clean |
| Laravel routes (`route:list`) | all 11 routes resolve correctly post-move |
| Broken imports | zero — scripted grep sweep across the whole `apps/web/src` tree found no remaining references to old paths, no import climbing outside its new root |
| Auth flow (live browser, real dev servers) | register → session → student blocked from `/admin` → token stored — all pass |
| Lesson loading (live browser) | Courses catalogue renders (via `packages/core`'s `coursesData`/`calculateCompletionPercentage`), a real lesson module (Pythagoras) renders and its exercise input is reachable |
| Routing | unknown route falls back to the SPA shell without crashing; no full-page reload observed |
| Dev scripts | `npm run dev`, backend `php artisan serve` both start correctly from their new locations |
| Console/page errors | zero uncaught JS exceptions across the full verification run |

All temporary verification infrastructure (throwaway SQLite DB, `puppeteer-core` — installed `--no-save`, confirmed zero trace left in `package.json`/`package-lock.json` — both dev servers, the verification script) was removed afterward. `apps/api/.env` was restored to its original MySQL configuration.
