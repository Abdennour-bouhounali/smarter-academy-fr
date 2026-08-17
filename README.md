# Smarter Academy

A math learning platform for the French Collège curriculum (6e–3e), built as a React SPA with interactive, manipulation-first lessons.

## Repository structure

An npm-workspaces monorepo, organized so a future React Native app is additive, not a rewrite:

```
apps/
  web/      React 18 + Vite 5 + Tailwind 3 SPA — the current client
  api/      Laravel 13 + Sanctum — auth + contact-form API
packages/
  core/     Platform-agnostic logic: answer validation, math/number formatting,
            lesson-access rules, progress-% calculation, the auth role predicate,
            and the curriculum catalogue. Zero React/DOM/bundler coupling — a
            future mobile client imports this package unchanged.
docs/
  architecture/   living contracts (Lesson, Exercise, Progress/Mastery, ARCHITECTURE.md)
  reports/         point-in-time audit/report snapshots from past work phases
  data-verification/  supporting evidence for the curriculum data in packages/core
```

`apps/web/src/lessons/` holds the actual lesson UI (one folder per lesson: `index.jsx`, `lesson.config.js`, `moduleContext.js`, `modules/Module*.jsx`) — see `CONTRIBUTING.md`. Anything in there that's web-platform-coupled (renders JSX, reads `localStorage`) stays in `apps/web`; anything that's pure input→output logic lives in `packages/core` instead.

## Setup

```bash
npm install                          # installs the whole workspace (web + core)
cp apps/api/.env.example apps/api/.env   # then configure DB credentials
cd apps/api && composer install && php artisan key:generate && php artisan migrate
```

## Development

```bash
npm run dev        # frontend only, http://localhost:5173
npm run dev:all     # frontend + Laravel API together
```

## Other scripts

```bash
npm run build       # production build to apps/web/dist/
npm run preview      # preview a production build locally
npm test             # runs packages/core's tests, then apps/web's
```

Backend tests: `cd apps/api && php artisan test`. Backend formatting: `cd apps/api && vendor/bin/pint`.

## More context

- [`docs/architecture/`](./docs/architecture/) — the living domain contracts (start with `ARCHITECTURE.md`)
- [`docs/reports/`](./docs/reports/) — historical audit/report snapshots from past work phases
- [`packages/core/README.md`](./packages/core/README.md) — what belongs in the shared logic package, and why
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — naming and code conventions
- [`.agents/AGENTS.md`](./.agents/AGENTS.md) — the mandatory pedagogical loop every lesson module must follow
- [`apps/web/src/lessons/common/components/README.md`](./apps/web/src/lessons/common/components/README.md) — `MathText`/`MathInput` usage
