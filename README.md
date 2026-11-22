# Smarter Academy

**Arabic-first, RTL mathematics platform for the Algerian curriculum**
(التعليم المتوسط, starting with 4AM). The interface, the lessons and the
mathematics vocabulary are Arabic; the documentation and code comments are
English and French.

The live content is the 4AM textbook unit 1 (« الأعداد الطبيعيّة والأعداد
النّاطقة ») — eight lessons plus a synthesis — under
`apps/web/src/lessons/moyen/4am/` — the only lesson content in the repository.
The French-era lessons (`lessons/college/`, `lessons/lycee/`) and the French
reference catalogue were deleted on 2026-09-25.

## Repository structure

An npm-workspaces monorepo, organized so a future React Native app is additive, not a rewrite:

```
apps/
  web/      React 18 + Vite 5 + Tailwind 3 SPA — the client (JavaScript, no TypeScript)
  api/      Laravel + Sanctum + MySQL — auth, curriculum, progress, practice, notebook
packages/
  core/     Platform-agnostic logic: answer validation, math/number formatting,
            lesson-access rules, progress-% calculation, the auth role predicate,
            arithmetic, the practice answer evaluator, and the curriculum
            catalogue. Zero React/DOM/bundler coupling — a future mobile client
            imports this package unchanged.
content/
  practice/ versioned exercise JSON for the practice engine (read by Vite, by
            Laravel and by the validator) — not under apps/web/src
docs/
  README.md        the documentation map — which document is authoritative
  lessons/         LESSON_DEVELOPMENT_GUIDE.md — start here to build a lesson
  architecture/    the living contracts
  sources/         the textbook extraction every lesson cites
  reports/         point-in-time snapshots from past work phases
```

`apps/web/src/lessons/` holds the lesson UI. An Algerian lesson lives at
`lessons/moyen/<grade>/<chapter>/<unit>/<lesson>/` with `lesson.config.js`,
`index.jsx`, `routes.jsx`, `moduleContext.js`, `knowledge.jsx`, `content/` and
`modules/Module<NN><Descriptor>.jsx`; the unit's shared factories live in
`_unit/`. Anything web-coupled (renders JSX, reads `localStorage`) stays in
`apps/web`; pure input→output logic lives in `packages/core`.

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

## Documentation

**[`docs/README.md`](./docs/README.md) is the map** — it says which document is
authoritative for what, and which are historical. The entry points:

- [`docs/lessons/LESSON_DEVELOPMENT_GUIDE.md`](./docs/lessons/LESSON_DEVELOPMENT_GUIDE.md) — **read this before creating or changing a lesson**
- [`docs/architecture/LESSON_CONTRACT.md`](./docs/architecture/LESSON_CONTRACT.md) — the lesson and module contract
- [`docs/architecture/ARABIC_RTL_CONTRACT.md`](./docs/architecture/ARABIC_RTL_CONTRACT.md) — Arabic, RTL, typography, terminology
- [`docs/architecture/MANIPULATION_CONTRACT.md`](./docs/architecture/MANIPULATION_CONTRACT.md) — manipulations as tactile laboratories
- [`docs/architecture/CLASSROOM_MODE.md`](./docs/architecture/CLASSROOM_MODE.md) — وضع القسم, the presentation layer
- [`docs/architecture/INTERACTION_PEDAGOGY.md`](./docs/architecture/INTERACTION_PEDAGOGY.md) — how a concept becomes manipulable
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — naming and code conventions
- [`packages/core/README.md`](./packages/core/README.md) — what belongs in the shared logic package

The root [`CLAUDE.md`](./CLAUDE.md) carries the rules that bind every task in
this repository, including the documentation synchronization rule.
