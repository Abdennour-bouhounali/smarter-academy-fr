# Smarter Academy (France)

Mathematics for the French collège (6e, 5e, 4e, 3e), in French, left to right, with Stripe for payment.

**This branch (`rebuild/dz-core`) is a rebuild in progress.** On 2026-11-22 the tree of the Algerian platform
(`smarter-academy-dz`) was imported (commit `049380e`) and is being turned into the French product. Read
[`docs/FRANCE_REBUILD_PLAN.md`](./docs/FRANCE_REBUILD_PLAN.md) first: it is the programme, the decisions and the
progress log. State today:

- the tree is the lesson ENGINE and the SHELL (student, teacher, parent, school and admin spaces) around an EMPTY
  French catalogue: four grades, five thèmes each, **no lesson**;
- the interface still speaks Arabic and reads right to left; names, e-mails, money and the time zone are still
  Algerian — steps 1C–1G of the plan change that;
- no real user exists; the old French site is untouched on `main` (`0ddfb98`).

## Structure

```
apps/
  web/      React 18 + Vite + Tailwind — JavaScript and JSX, no TypeScript
            src/lessons/common/   the lesson engine (gameworld/ kit and worlds, launchkit/, lessonlab/, classroom/)
            src/lessons/college/<grade>/<theme>/<unit>/<lesson>/   where a lesson will live (none yet)
            src/features/, src/pages/   the spaces of the shell
  api/      Laravel + Sanctum + MySQL — auth, curriculum, progress and mastery, practice, billing (Stripe), spaces
packages/
  core/     pure logic: the curriculum (curriculum/fr/), number formats, the practice evaluator, progress rules
content/    exercise banks, class tests, thinking-lab challenges, compass index — empty today
scripts/    validators, generators and checks (`npm run check:lessons` chains them)
docs/       the plan, the contracts, the official French texts — map: docs/README.md
```

## Install and test

```bash
npm ci                                   # the whole workspace (web, core, scripts)
npm test                                 # packages/core, then apps/web, then scripts
cd apps/api && composer install && php8.4 artisan test   # the API, on in-memory SQLite (phpunit.xml)
```

Eight API tests need MySQL and do not pass on SQLite (listed in the root `CLAUDE.md`). Development server:
`npm run dev` (web, http://localhost:5173) or `npm run dev:all` (web + API; the API needs `apps/api/.env` from
`.env.example` and its own database). The other checks (`lint`, `check:unused`, `check:unreached`, `check:format`,
`check:lessons`) are listed in the root `CLAUDE.md`.

**Deployment is locked**: `deploy.yml` and `publish-content.yml` are skipped unless the repository variable
`FR_REBUILD_CUTOVER_APPROVED` is `yes` (plan, status table and §6).

## Documentation

[`docs/README.md`](./docs/README.md) says which document is authoritative for what, and which ones still describe
code not yet converted to French. The rules that bind every task are in the root [`CLAUDE.md`](./CLAUDE.md).
Conventions: [`CONTRIBUTING.md`](./CONTRIBUTING.md); the shared package: [`packages/core/README.md`](./packages/core/README.md).
