# Contributing

Conventions actually followed in this codebase — documenting what's already consistent, not proposing new rules.

## Lessons

- One folder per lesson under `apps/web/src/lessons/college/<grade>/<domain>/<lesson-slug>/`, with `index.jsx`, `lesson.config.js`, `moduleContext.js`, and a `modules/` folder.
- Module files are named `ModuleNN<Descriptor>.jsx` — two-digit zero-padded number + PascalCase description (e.g. `Module03Comparaison.jsx`). Followed with zero exceptions across all 141 existing modules — keep it that way.
- Every module should honor the 8-step pedagogical loop defined in [`.agents/AGENTS.md`](./.agents/AGENTS.md) (découvre → manipule → comprends → formule la règle → entraîne → détecte l'erreur → réutilise → maîtrise). Not every module needs every step — see AGENTS.md's "Règle Organique."
- What the student manipulates, what they must notice, how feedback is worded, and how scaffolding disappears follow [`docs/architecture/INTERACTION_PEDAGOGY.md`](./docs/architecture/INTERACTION_PEDAGOGY.md) — authoritative on interaction pedagogy; check any new manipulation against its §18 questions and §29 checklist.
- Reach for the shared toolkit in `apps/web/src/lessons/common/components/` (`LessonUI.jsx`'s `StepCard`/`ChoiceGrid`/`ValidateButton`, plus `NumberLine`, `OrderingGame`, `GroupBuilder`, `BarModel`, `CalcChain`, `InfoSorter`, `AnswerBuilder`) before writing a new interaction pattern from scratch.
- Lesson/module IDs, URLs, and module ordering are load-bearing (progress is keyed on them in `localStorage`) — don't change them casually.

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

## Generated / temporary files

There is currently no `generated/`, `tmp/`, or `scripts/` convention in this repo, and none should be added speculatively. If a real recurring need for one shows up, introduce it then, scoped to that need.
