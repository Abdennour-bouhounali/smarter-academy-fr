# Contributing

Conventions actually followed in this codebase. The rules that bind every task (git, the other platform, pedagogy,
screens, who does what) are in the root [`CLAUDE.md`](./CLAUDE.md); the rebuild's programme is
[`docs/FRANCE_REBUILD_PLAN.md`](./docs/FRANCE_REBUILD_PLAN.md).

## Lessons

There is no lesson yet. A lesson will live at `apps/web/src/lessons/college/<grade>/<theme>/<unit>/<lesson>/` and is
a v2 lesson: content declared in its `lesson.pack.js`, played on a world of `lessons/common/gameworld/`. Contracts:
[`docs/architecture/LESSON_V2.md`](./docs/architecture/LESSON_V2.md) and
[`GAME_WORLD.md`](./docs/architecture/GAME_WORLD.md). What a lesson teaches comes from the learning net
([`LEARNING_NET.md`](./docs/architecture/LEARNING_NET.md)), which is defined from the official texts in
`docs/curriculum/officiel/` and from nothing else.

- Lesson ids, learning-point ids and URLs are load-bearing (progress is keyed on them); a learning-point id is
  append-only — never reorder a lesson's points.
- A wrong answer never blocks progression (`npm run check:non-blocking`).
- Language, register, typography and formats: [`docs/architecture/FRENCH_LANGUAGE_CONTRACT.md`](./docs/architecture/FRENCH_LANGUAGE_CONTRACT.md).
  The interface is French and left to right; `apps/web/src/test/noArabic.test.js` refuses any Arabic character in the web.

## Shared code

- **Platform-agnostic** logic (number formats, answer evaluation, the curriculum catalogue, progress rules) lives in
  `packages/core` and is imported as `@smarter-academy/core`, never by relative path. It stays free of React, DOM,
  `localStorage` and `import.meta` — see [`packages/core/README.md`](./packages/core/README.md).
- **Web-specific** shared logic (anything that touches `localStorage` or React state) stays in `apps/web`
  (`src/lessons/common/hooks/`, `src/lessons/common/utils/`, `src/features/`).
- Prefer pure functions for anything mathematical or evaluative, and put them in `packages/core` unless they need a
  browser API: `input → output`, the caller owns the side effects.

## Naming

- Descriptive names over generic ones (`studentProgress`, not `data`) when the generic name would be unclear.
- Boolean-returning functions read as a question (`isModuleCompleted`, `canAccessLesson`).
- Components: PascalCase. Hooks: `useX` — and a function that is not a hook is never named `use…` (ESLint).

## Testing

- `npm test` from the root runs `packages/core`, then `apps/web`, then `scripts`. Tests live next to the file they
  cover. One heavy run at a time on a small machine; an agent runs only the tests of what it touched, with
  `--maxWorkers=2`.
- API: `cd apps/api && php8.4 artisan test` (in-memory SQLite, `phpunit.xml`). Formatting: `vendor/bin/pint`.
- A test is deleted only when the thing it tested is deleted; never weaken an assertion.
- Lint, unused code, dead files and formatting: [`docs/architecture/CODE_HEALTH.md`](./docs/architecture/CODE_HEALTH.md).

## Documentation

Every task corrects the documentation it makes false, in the same task. [`docs/README.md`](./docs/README.md) maps
which document owns which contract.
