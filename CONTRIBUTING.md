# Contributing

Conventions actually followed in this codebase — documenting what's already consistent, not proposing new rules.

## Lessons

**Before creating or changing a lesson, read
[`docs/lessons/LESSON_DEVELOPMENT_GUIDE.md`](./docs/lessons/LESSON_DEVELOPMENT_GUIDE.md).**
It is the entry point and links to every contract. The essentials:

- An Algerian lesson lives at `apps/web/src/lessons/moyen/<grade>/<chapter>/<unit>/<lesson>/` with `lesson.config.js`, `index.jsx`, `routes.jsx`, `moduleContext.js`, `knowledge.jsx`, `content/` and `modules/`. The unit's shared factories are in `_unit/`, and `index.jsx`, `routes.jsx` and `moduleContext.js` are one-liners built on them. The `lessons/college/` and `lessons/lycee/` trees are dormant French content and use an older wiring — don't copy from them.
- Module files are named `ModuleNN<Descriptor>.jsx` — two-digit zero-padded number + PascalCase description. The number is load-bearing: it resolves the route. Three digits silently unmount the module.
- New modules are written on the lesson kit (`lessons/common/kit/`), which applies the platform's policies by construction. Reach for the shared components before inventing an interaction pattern.
- A step completes when the student **answered**, never when they answered correctly. Gating on correctness locks the lesson and is a release blocker (`npm run check:non-blocking`).
- What the student manipulates, what they must notice, how feedback is worded and how scaffolding disappears follow [`docs/architecture/INTERACTION_PEDAGOGY.md`](./docs/architecture/INTERACTION_PEDAGOGY.md); check any new manipulation against its §18 questions and §29 checklist, and against [`docs/architecture/MANIPULATION_CONTRACT.md`](./docs/architecture/MANIPULATION_CONTRACT.md).
- Everything a student reads is Arabic — see [`docs/architecture/ARABIC_RTL_CONTRACT.md`](./docs/architecture/ARABIC_RTL_CONTRACT.md).
- Lesson/module IDs, URLs and module ordering are load-bearing (progress is keyed on them) — don't change them casually.

## Shared utilities

- **Platform-agnostic** logic (math comparison, French number formatting, lesson-access rules, progress-% calculation, answer validation, the curriculum catalogue) lives in `packages/core` — import it as `@smarter-academy/core`, not by relative path. See `packages/core/README.md` for exactly what belongs there and why. This is a real package boundary (npm workspaces): it must stay React/DOM/`localStorage`-free so a future React Native client can depend on it unchanged.
- **Web-specific** shared logic — anything that touches `localStorage` or React state (`useProgress`, `getLessonProgress`/`getResumeLesson`, exercise hooks) — stays in `apps/web/src/lessons/common/utils/` and `.../hooks/`.
- Domain-specific helpers that build on a `packages/core` primitive (unit conversions, French number-spelling, etc.) live in the lesson's own `components/<domain>Utils.js`, and should **re-export** the shared primitives they use rather than reimplementing them — see `apps/web/src/lessons/college/6e/nombres_calculs/nombres-entiers/components/numberUtils.js` for the reference pattern.
- Prefer pure functions for anything mathematical or evaluative (answer validation, scoring, progress %, mastery) — and put them in `packages/core`, not `apps/web`, unless they genuinely need a browser API. `calculateCompletionPercentage.js`, `mathComparison.js`, and `lessonAccess.js` are the templates: `input → output`, no `localStorage`, no React state, no network calls. Callers own the side effects.

## Naming

- Descriptive names over generic ones (`studentProgress`, not `data`) when the generic name would actually be unclear — don't rename already-clear code for style alone.
- Boolean-returning functions read as a question: `isModuleUnlocked`, `isModuleCompleted`, `canAccessLesson`.
- Components: PascalCase. Hooks: `useX`. Everything else: camelCase.

## Testing

- `npm test` (from the repo root) runs `packages/core`'s tests, then `apps/web`'s. Tests live next to the file they cover (`numberFormat.test.js` beside `numberFormat.js`).
- Prioritize pure functions — they're the cheapest to test and the highest-value (answer validation, scoring, progress/mastery calculations). Don't chase a coverage number; test the logic that would actually break a lesson if it regressed. This is also why nearly all current tests live in `packages/core`: that's where the pure logic is.
- Backend: `cd apps/api && php artisan test` (PHPUnit). Formatting: `vendor/bin/pint`.

## Documentation

Every task updates the documentation it affects, in the same task — the rule is
in the root [`CLAUDE.md`](./CLAUDE.md), and [`docs/README.md`](./docs/README.md)
maps which document owns which contract.

## Generated / temporary files

`scripts/` now exists and holds the validation and audit gates (`npm run
check:lessons` chains them). Don't add a `generated/` or `tmp/` convention
speculatively; if a real recurring need shows up, introduce it then, scoped to
that need.
