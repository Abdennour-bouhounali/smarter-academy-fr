# Mobile-Ready Architecture Foundation — Report

Placed in `docs/reports/`, following this repo's existing convention (established in the Repository Organization phase) for point-in-time phase reports, distinct from the living contract in `docs/architecture/MOBILE_READINESS.md`, which this report complements — read that one for the full architectural detail; this one is the punch list of what happened and what was verified.

## 1. Current readiness

Before this phase: a `packages/core` package existed with the previously-obvious pure utilities (math comparison, number formatting, curriculum data, two validators), but the actual *lesson and exercise* logic was still 100% embedded in 141 React components. After this phase: the highest-traffic exercise logic (the adaptive-exercise state machine used by the large majority of interactive modules) is now framework-free and independently tested, alongside representative extractions covering geometry, algebra, a new validator, and API error classification. Browser storage went from 4 scattered direct-`localStorage` call sites to one swappable interface. No React Native code was written — this is groundwork only, per the brief.

## 2. Problems found

- **No shared logic layer for exercise orchestration.** `useAdaptiveExercise` (the hook behind hints, attempts, correctness, solution-reveal — used across nearly every interactive module) mixed pure state-transition rules with React `useState`/`useCallback` plumbing inseparably.
- **Duplicated geometry/algebra formulas.** `Math.sqrt(a*a+b*b)` and its inverse appeared independently in 2–3 Pythagoras modules; `f(x)=ax+b` was redefined inline per module in the linear-functions family.
- **A validation pattern duplicated across files with no shared home.** The scientific-notation coefficient/exponent check was hand-written near-identically in two `puissances-3e` modules. Separately (found but not fixed this phase — see §12 of the architecture doc): six sites in `quatre-operations` reimplement the *already-extracted* `validateNumericAnswer` inline instead of calling it.
- **`ApiError`/`classifyStatus` lived inside the Vite-specific `apiClient.js`,** coupling genuinely portable error-classification logic to a file that also depends on `import.meta.env`.
- **Storage was not isolated.** `localStorage` was called directly from 4 files (progress hook, a progress utility, the auth context, and the courses page) — no single seam a future RN storage backend could swap in at.
- **No `Math.random()`/generation logic anywhere** in the ~8 surveyed lesson families — worth noting as a *negative* finding: there was no hidden randomization logic to extract.

## 3. Changes implemented

Full detail in `docs/architecture/MOBILE_READINESS.md` §4 and §7. Summary: 6 new modules in `packages/core` (`exercise/adaptiveExerciseState.js`, `geometry.js`, `algebra.js`, `validation/validateScientificNotation.js`, `api/errors.js`, plus 2 already-pure progress utilities relocated verbatim), each with a dedicated test file; `useAdaptiveExercise.js` refactored to a thin wrapper around the new reducer; one representative call site migrated per new extraction (`Module02CalculHypotenuse.jsx`, `Module03CalculCote.jsx`, `Module03TableauValeurs.jsx`, `Module04EcritureScientifique.jsx`, `apiClient.js`); a new `apps/web/src/utils/storage.js` interface, wired into `useProgress.js`, `getLessonProgress.js`, `AuthContext.jsx`, and `Courses.jsx`.

## 4. Lesson/exercise logic analyzed

Four parallel read-only surveys covered every `Module*.jsx` file in: Pythagoras + square roots (3e/4e), 6e fractions/decimals/integers/four-operations, 3e linear functions/equations/powers, and the shared hooks/components toolkit. Full classification table (pure UI vs. browser-specific vs. domain logic vs. RN-shareable vs. stays-web) is in the architecture doc §3. Headline finding: zero randomization logic anywhere; the richest reusable logic was the exercise-orchestration state machine, not domain math (which was mostly small and scattered).

## 5. Logic extracted for future reuse

See architecture doc §4 for the full list with file paths. In one line: exercise state transitions, Pythagorean geometry, affine-function evaluation, scientific-notation validation, API error classification, and two already-pure progress-navigation helpers.

## 6. Logic deliberately left Web-specific

`useProgress`/`getLessonProgress`/`getResumeLesson` (localStorage-coupled), all React hooks' wiring, `apiRequest()` (needs `import.meta.env`), all 141 lesson components and shared JSX components, all routing, and SVG/coordinate-transform math (pure underneath but tied to per-component rendering choices). Rationale for each in architecture doc §5.

## 7. API boundary

No backend changes made or needed — the existing bearer-token, JSON-only, versioned API was already client-agnostic. Full reasoning in architecture doc §6.

## 8. Authentication strategy

Reviewed, not redesigned. The existing bearer-token session model (from the prior Authentication Foundation phase) is already the correct RN pattern. Full walk-through (register/login/current-user/expired-token/logout, each mapped to what an RN client would do) in architecture doc §8.

## 9. Storage strategy

One new interface (`apps/web/src/utils/storage.js`, `{getItem, setItem, removeItem}`), 4 call sites migrated, zero behavior change, zero new dependency, no AsyncStorage/SecureStore implementation (deliberately — not needed until an RN project exists). Full detail in architecture doc §7.

## 10. Testing

**New unit tests** (all React/DOM-free, run under plain Node via Vitest): 14 for the adaptive-exercise state machine, 3 for geometry, 4 for algebra, 8 for the scientific-notation validator, 8 for API errors — 37 new tests. `packages/core` is now 103 tests across 12 files (up from 61/7 before this phase).

**Behavior-preservation verification** — a real browser (Puppeteer + system Chrome) against the actual Vite dev server and a real `php artisan serve` backend (throwaway local SQLite DB, cleaned up after):

| Check | Result |
|---|---|
| `computeHypotenuse(3,4)=5` accepted as correct (Module02CalculHypotenuse, real MathLive input) | PASS |
| `computePythagoreanLeg` wired without crashing (Module03CalculCote) | PASS |
| `evaluateAffineFunction(2,1,x)` renders g(3)=7 (Module03TableauValeurs) | PASS |
| `validateScientificNotation`: coefficient ≥ 10 → correct "too large" feedback | PASS |
| `validateScientificNotation`: (4,5 ; 4) → accepted as correct | PASS |
| Courses page (now storage.js-backed) renders and persists filter selection | PASS |
| Auth token stored via storage.js after registration; register→session redirect | PASS |
| Zero uncaught JS exceptions across the full run | PASS |

Two interaction bugs surfaced and were fixed *in the verification script itself* (not the app): MathLive's `math-field` custom element needs its `.setValue()` API rather than simulated keyboard typing, and React-controlled `<input>`s need the native-setter-plus-event-dispatch pattern rather than direct `.value` assignment. Both are the same class of test-harness quirk documented in this repo's earlier verification passes (Phase 2's cleanup report), not application bugs — confirmed by getting clean passes once the correct interaction pattern was used.

**Backend regression check** (untouched this phase, confirmed still green): `php artisan test` 18/18, Pint clean.

**Full workspace suite**: `npm test` → 103/103 in `packages/core`, clean pass-with-no-tests in `apps/web`. `npm run build` succeeds, bundle size unchanged from before this phase (~5.39 MB, same as pre-extraction).

## 11. Future React Native architecture

```
                    Laravel API
                   /           \
                  /             \
           React Web        React Native (future)
               │                  │
               └──── shared ─────┘
                  @smarter-academy/core
```

No RN/Expo project, dependency, screen, or navigation code was created — confirmed via a repo-wide search (zero matches for "react-native"/"expo" outside this documentation). `packages/core`'s own dependency list is unchanged from the prior phase (`@cortex-js/compute-engine` only) — no new dependencies were added anywhere to accomplish this phase's extractions. Full target architecture and the recommended "does this belong in core" rule going forward: architecture doc §11.

## 12. Remaining work

In priority order (full detail in architecture doc §12): (1) wire the six `quatre-operations` duplicated validators to the already-existing `validateNumericAnswer` — the most mechanical, highest-value follow-up identified; (2) dependency-inject `getLessonProgress` so `getResumeLesson`'s selection algorithm can become pure; (3) a follow-up extraction pass on `OrderingGame`/`InfoSorter`/`AnswerBuilder`'s comparators using the same representative-example method as this phase; (4) promote the three 6e domain-utils files into `packages/core` once a second consumer justifies the ~33-import-site migration; (5) an actual `AsyncStorage`/`SecureStore` storage implementation — not before an RN project exists; (6) the RN project itself, which is intentionally out of scope for everything done here.
