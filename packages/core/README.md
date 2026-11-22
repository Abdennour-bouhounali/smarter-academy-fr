# @smarter-academy/core

Platform-agnostic logic shared by the web app (`apps/web`), the scripts and — through generated files — the API.
Plain JavaScript with **zero** React, DOM or bundler-specific APIs (no `localStorage`, no `window`/`document`, no
`import.meta`): it runs the same under Vite and plain Node. Its tests (`npm run test --workspace=packages/core`) run in
Node, which is what enforces this.

Another agent is removing unused exports while the rebuild goes on (plan §4, step 1B): the folders below are what is
there on 2026-11-22; read `index.js` for the exact public surface.

| Where | What |
|---|---|
| `curriculum/` | `coursesData.js` — the catalogue (`courseLevels`, `allCourseLevels`, `buildCourseLevels` for test fixtures, `getAllGrades()`), built from the JSON of `curriculum/fr/`: programme, lessons and units per grade `6e`–`3e`, the learning net `fr/net/`, the school calendar `fr/calendar/`. **An EMPTY skeleton since 2026-11-22** (four grades, five thèmes, no lesson — `docs/FRANCE_REBUILD_PLAN.md` §4bis). `activeGrades.js` (`ACTIVE_GRADE_IDS`), `lessonStages.js`, the exporters read by the API (`exportCurriculum.mjs`, `exportContentRegistry.mjs`) |
| `practice/` | the practice answer evaluator (exact rationals, intervals, canonical affine forms) — `docs/architecture/EXERCISE_CONTRACT.md` |
| `thinkingLab/` | the `expression` answer check and per-student numbers of the thinking lab — `docs/architecture/THINKING_LAB.md` |
| `compass/` | the year-compass engine — `docs/architecture/YEAR_COMPASS.md` |
| `progress/` | completion %, next lesson / next module, module-number validation, `moduleLayoutMigrations.js` (its table is `{}` here) — `docs/architecture/PROGRESS_MODEL.md` |
| `validation/` | choice, numeric and scientific-notation validators (`{isCorrect}` contract) |
| `numberFormat.js`, `mathComparison.js`, `random.js`, `geometry.js`, `algebra.js`, `arithmetic/`, `errorClassifiers.js`, `exercise/` | number formatting and parsing, algebraic equivalence, seeded randomness, small maths helpers |
| `auth.js`, `api/errors.js` | the role predicate behind route guards; `ApiError` and status classification (the `fetch` call stays in `apps/web`) |

## What does *not* belong here

Anything that needs `localStorage` (progress persistence stays in `apps/web/src/lessons/common/hooks/useProgress.js`
and `utils/progress/`), anything that renders UI, and anything that reads `import.meta.env`.

## Usage

```js
import { courseLevels, hasRequiredRole } from '@smarter-academy/core';
import { createLearningNet } from '@smarter-academy/core/curriculum/fr/net/learningNet.js';
```

Resolved through npm workspaces — no path aliases, no build step.
