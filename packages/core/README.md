# @smarter-academy/core

Platform-agnostic logic shared by every Smarter Academy client — today the web app (`apps/web`), and, when it's built, a future React Native app. Everything here is plain JavaScript with **zero** React, DOM, or bundler-specific APIs (no `localStorage`, no `window`/`document`, no `import.meta`) — it runs identically under Vite, Metro, or plain Node.

## What belongs here

Pure functions and static data: `input → output`, no side effects, no framework coupling. The test in `vitest run` (`npm run test --workspace=packages/core`) is the actual enforcement mechanism — anything that touches a browser API fails immediately in this package's zero-config Node test environment.

| Module | What it does |
|---|---|
| `mathComparison.js` | Algebraic-equivalence checking (`compareMathExpressions`), via `@cortex-js/compute-engine` |
| `numberFormat.js` | French number formatting/parsing (`formatFr`, `parseFr`, decimal comparison) |
| `lessonAccess.js` | Module unlock/mastery rules — operates on completion data passed in, never reads storage itself |
| `errorClassifiers.js` | Detects common student error patterns (sign errors, missing square root, ...) |
| `auth.js` | `hasRequiredRole(user, allowedRoles)` — the authorization predicate behind route guards |
| `geometry.js` | Pythagorean formulas (`computeHypotenuse`, `computePythagoreanLeg`) |
| `algebra.js` | Affine-function evaluation (`evaluateAffineFunction`) |
| `exercise/` | `adaptiveExerciseState.js` — the pure state-transition rules behind the "submit → hint → solution" exercise pattern used across the lesson modules; `apps/web`'s `useAdaptiveExercise` hook is a thin wrapper around it |
| `api/` | `errors.js` — `ApiError`, `classifyStatus`. The `fetch` call itself stays in `apps/web` (needs `import.meta.env`) |
| `validation/` | Canonical exercise validators (`{isCorrect}` result contract — see `docs/architecture/EXERCISE_CONTRACT.md`): `validateChoiceAnswer`, `validateNumericAnswer`, `validateScientificNotation` |
| `progress/` | `calculateCompletionPercentage` (pure completion-% math), `getNextIncompleteModule`, `getNextLesson` (pure curriculum navigation) |
| `curriculum/` | `coursesData.js` — the catalogue (`courseLevels`), the official curriculum JSON it's built from, and `getAllGrades()` (the flattened grade list — the single source of truth for what a student's `grade` profile field can be); `lessonStages.js` — the canonical learning-journey stage vocabulary (`LESSON_STAGES`, `REQUIRED_STAGES`) and the 45-minute lesson cap (`MAX_LESSON_MINUTES`), shared by the lesson validator and the web app |

See `docs/architecture/MOBILE_READINESS.md` for the investigation behind what's here (and, as importantly, what was deliberately left out).

## What does *not* belong here

Anything that needs `localStorage` (progress persistence — see `apps/web/src/lessons/common/hooks/useProgress.js` and the `getLessonProgress`/`getResumeLesson` family, which stay web-side and remain a documented future seam), anything that renders UI (React components/hooks), and anything that talks to `import.meta.env` (the API client). These are genuinely web-platform-coupled today; moving them here without also building the adapter they'd need would just relocate the coupling, not remove it.

## Usage

```js
import { validateNumericAnswer, courseLevels, hasRequiredRole } from '@smarter-academy/core';
```

Resolved via npm workspaces — no path aliases, no build step. A future Expo/React Native app in this same workspace would import it exactly the same way.
