# Mobile Readiness

Where this codebase stands toward a future React Native client, what was done this phase to get closer, and what's genuinely still web-only. No mobile app exists yet — this documents the *foundation*, not a build plan for one.

```
                    Laravel API
                   /           \
                  /             \
           React Web        React Native (future)
               │                  │
               └──── shared ─────┘
                  @smarter-academy/core
             (validation, calculations, curriculum,
              exercise state, progress %, auth roles)
```

## 1. Current readiness

Before this phase: `packages/core` existed (from the prior Repository Organization phase) but held only the previously-obvious pure utilities — math comparison, number formatting, lesson access, the curriculum catalogue, two validators. The actual *lesson and exercise* logic — the thing a student spends 95% of their time interacting with — was still entirely embedded inside 141 `Module*.jsx` React components, undifferentiated from rendering.

After this phase: the single highest-traffic piece of exercise logic (the adaptive-exercise state machine — hints, attempts, correctness, solution-reveal) is now a pure, framework-free module that every one of its ~20+ consuming lessons benefits from automatically. A representative example was extracted and verified for each category the investigation was asked to cover: geometry, algebra, a new validator, and API error handling. Browser-only storage is now behind one small interface instead of scattered across 4+ files.

**What this does NOT mean:** the app is not "mobile-ready" in the sense of being close to running on React Native. The UI layer (all 141 modules, every shared component, all routing) is 100% React DOM/JSX and would need to be rebuilt for RN regardless — that was never in scope, and the brief is explicit that this phase prepares the *logic* layer only.

## 2. Investigation method

Four parallel read-only surveys covered every `Module*.jsx` file across five representative lesson families (Pythagoras + square roots, 6e fractions/decimals/integers, 3e functions/equations/powers) plus the shared hooks/components toolkit used by all of them. For each pattern found, the question was: is this pure (no React state, no DOM, no `localStorage`, no `import.meta`), and is it duplicated or clearly generalizable? Findings below are grouped by the five categories the brief asked about.

## 3. Lesson/exercise logic analyzed — the five-question breakdown

| Pattern found | (1) UI logic? | (2) Browser-specific? | (3) Domain logic? | (4) RN-shareable? | (5) Stays web-specific |
|---|---|---|---|---|---|
| Exercise submit/hint/solution state machine (`useAdaptiveExercise`) | Wrapping only | No | **Yes** | **Yes — extracted** | The `useState`/`useCallback` wiring |
| Pythagorean hypotenuse/leg formulas | No | No | **Yes** | **Yes — extracted** | — |
| Affine function evaluation (`f(x)=ax+b`) | No | No | **Yes** | **Yes — extracted** | — |
| Scientific-notation validation | No | No | **Yes** | **Yes — extracted** | Feedback *text* stayed in the component (content, not logic) |
| `ApiError`/`classifyStatus` | No | No | **Yes** | **Yes — extracted** | — |
| `OrderingGame`'s "first order break" comparator, `InfoSorter`'s completeness/correctness checks, `AnswerBuilder`'s field checks, `NumberLine`'s snap-to-step math | No | Partially (`NumberLine` also reads DOM coordinates) | Yes | Identified, not extracted this phase | The DOM-coordinate half of `NumberLine`; the JSX feedback templating in `OrderingGame` |
| `numberUtils.js`/`fractionUtils.js`/`decimalUtils.js` (6e domain helpers, already pure, already re-export `@smarter-academy/core`) | No | No | Yes | Yes, but not moved | Deliberately left in `apps/web` this phase — see §9 |
| 6 duplicated ad hoc numeric-tolerance validators in `quatre-operations` (never call `validateNumericAnswer`) | No | No | Yes, but literal duplication of existing core code | N/A — fix by wiring to existing core, not new extraction | — |
| `Math.random()`-based exercise generation | — | — | — | — | **None found anywhere.** Every exercise in every surveyed file uses static, hand-authored data — nothing to extract |
| SVG coordinate transforms (`toSVG` in the functions family, square-vertex math in Pythagoras) | Feeds rendering directly | Tied to each component's own viewBox/scale choices | Pure math underneath | Weak candidate | Stays — extracting it without also owning the rendering choice buys little |
| Score counters (`setScore(s => s+1)`), XP-tier thresholds | Yes (drives UI state) | No | Thin (config, not logic) | Low priority | Stays |

## 4. What was extracted this phase

All in `packages/core`, each with its own test file, each behavior-verified against the live app (see §10):

- **`exercise/adaptiveExerciseState.js`** — `applyValidationResult`, `requestNextHint`, `revealSolution`, `getCurrentGuidance`, `hasMoreHints`, `canViewSolution`. `useAdaptiveExercise.js` (used by the large majority of interactive modules, directly or via `useSimpleExercise`) is now ~35 lines of `useState`/`useCallback` wiring around these pure functions — the actual state-transition *rules* have zero React dependency.
- **`geometry.js`** — `computeHypotenuse(a,b)`, `computePythagoreanLeg(hyp,known)`. Migrated into `Module02CalculHypotenuse.jsx` and `Module03CalculCote.jsx`, replacing duplicated inline `Math.sqrt(...)`.
- **`algebra.js`** — `evaluateAffineFunction(a,b,x)`. Migrated into `Module03TableauValeurs.jsx`'s `TARGET_FN`.
- **`validation/validateScientificNotation.js`** — classifies a coefficient/exponent answer as correct or names *why* it's wrong (`coef_too_large`, `exp_wrong`, etc.) without owning the feedback text, which stays exercise-specific content in the component. Migrated into `Module04EcritureScientifique.jsx`.
- **`api/errors.js`** — `ApiError`, `classifyStatus`, moved out of `apiClient.js` (which still owns the `fetch` call itself, since that needs `import.meta.env` — see §6).
- **`progress/getNextIncompleteModule.js`, `progress/getNextLesson.js`** — already 100% pure (confirmed zero `localStorage`/imports); moved verbatim, zero behavior risk.

Deliberately **not** extracted, with reasons: the six ad hoc tolerance-check validators in `quatre-operations` (real duplication, but the fix is "call the existing `validateNumericAnswer`," not new core code — flagged as a concrete follow-up in §12, not done here to keep this phase's diff to verified, representative examples rather than a lesson-family-wide sweep); the shared-component comparators (`OrderingGame`, `InfoSorter`, `AnswerBuilder`) — the richest of these (`OrderingGame`) was a strong candidate but adding it would have meant a sixth parallel extraction with no new pattern to prove; the domain-family utils files (`numberUtils.js` etc.) — see §9.

## 5. Logic deliberately left web-specific

- **`useProgress`, `getLessonProgress`, `getResumeLesson`** — genuinely `localStorage`-coupled (directly or transitively). Not extracted; instead, isolated behind `storage.js` (§7) so the *coupling point* is one file, not seven.
- **All React hooks** (`useAdaptiveExercise`'s wiring, `useSimpleExercise`, `useProgress`) — hooks are a React API; even though React Native also uses React and could technically run the same hook, the *value* of extraction is in the pure logic underneath, not the hook shell itself. The shell stays with its platform.
- **`apiRequest()` in `apiClient.js`** — depends on `import.meta.env.VITE_API_URL`, a Vite-specific construct with no Metro equivalent. `ApiError`/`classifyStatus` (the genuinely portable part) moved out; the thin `fetch` wrapper stays, and a future RN client would write its own (small — see §6).
- **All 141 `Module*.jsx` files, all shared JSX components, all of `App.jsx`/routing** — this is the actual UI layer. Per the brief: share logic, not UI. Nothing here was made "cross-platform"; it doesn't need to be.
- **SVG/coordinate-transform math** — pure underneath, but tightly bound to each component's own rendering choices (scale, viewBox, flip). Extracting the formula without a shared rendering contract would be premature.

## 6. API boundary

No backend changes were made or needed. The existing API was already client-agnostic:

- **Versioned, JSON-only REST-ish routes** under `/api/v1/` — no server-rendered views, no Blade-templated responses leaking into the contract.
- **Bearer-token auth** (`Authorization: Bearer <token>`), not cookie/session-based — this is *already* the RN-friendly pattern; a native app has no browser cookie jar and no CORS enforcement to work around.
- **CORS config** (`config/cors.php`'s `allowed_origins`) is a browser-only concern — React Native's networking layer doesn't go through CORS at all, so this config is simply irrelevant to a future mobile client, not a blocker.

The one piece of "coupling" identified — `apiClient.js` resolving its base URL via `import.meta.env` — is Vite-specific but trivially isolated: a future RN client needs its own ~20-line equivalent of `apiRequest()` (same `fetch`, a different way to read the base URL, e.g. `react-native-config` or Expo's `extra` config), while reusing `ApiError`/`classifyStatus` unchanged. This is now possible because those two are in `packages/core`.

## 7. Storage strategy

**Before:** `localStorage` called directly from 4 files (`useProgress.js`, `getLessonProgress.js`, `AuthContext.jsx`, `Courses.jsx` — the last two not part of the "progress" system but equally browser-coupled: the auth token and the last-selected course filters).

**After:** one file, `apps/web/src/utils/storage.js`, exporting `{getItem, setItem, removeItem}`. All four call sites now go through it. This separates:
- **Temporary client state** — the currently-in-progress exercise answer, current step, hint level — never persisted, lives in component `useState`, platform-irrelevant.
- **Durable client-local state** — completed modules, XP, the auth token, last-selected filters — currently `localStorage`-backed, now behind one swappable interface.
- **Durable server state** — almost none exists yet (`User`, `Contact` only; no progress/attempt persistence server-side — unchanged from the prior architecture phases, not this one's concern).

**Not done, deliberately:** no `AsyncStorage`/`SecureStore` implementation, no React Native dependency. The interface exists; a second implementation of it is exactly what a real RN port would add — swap one file, touch nothing else.

## 8. Authentication strategy

Reviewed, not redesigned — the bearer-token session model (established in the Authentication Foundation phase) was already the right choice for a future RN client, for the same reason as §6: no cookies, no CORS, works identically over `fetch` on any platform. Concretely, for a future RN client:
- **Authenticate**: `POST /auth/register` or `/auth/login`, same payloads, same response shape (`{token, user}`).
- **Obtain the current user**: `GET /auth/me` with the bearer token — unchanged.
- **Call protected APIs**: `Authorization: Bearer <token>` header — unchanged.
- **Handle expired auth**: the API already returns a clean `401` for an invalid/expired/revoked token (fixed as part of the Authentication Foundation phase) — an RN client reacts to that status exactly like the web client's `ApiError` with `type: 'AUTHENTICATION_ERROR'` (now importable from `packages/core` — see §6).
- **Logout**: `POST /auth/logout`, revokes the calling token server-side — unchanged.

The only platform difference is *where the token is stored* — `localStorage` today, `SecureStore`/Keychain on a real mobile build (tokens are more sensitive than progress data and deserve secure storage, not just AsyncStorage) — which is exactly the seam `storage.js` (§7) now isolates. `hasRequiredRole` (the role-authorization predicate behind `ProtectedRoute`) was already pure and already in `packages/core` from the prior phase; a future RN navigation layer reuses it unchanged.

## 9. Domain-family utils: an intentionally deferred promotion

`numberUtils.js`, `fractionUtils.js`, `decimalUtils.js` (one per 6e number-sense lesson family) are already pure, DOM-free, and already re-export `@smarter-academy/core` primitives while adding lesson-specific helpers (digit decomposition, French number-spelling, etc.) — exactly the pattern `CONTRIBUTING.md` documents. They are strong *future* candidates for promotion into `packages/core`, but promoting them now would mean rewriting ~33 import sites across three lesson families for a package with no second consumer yet. Left as they are, with the pattern itself documented here so a future promotion is a known, low-risk move rather than a rediscovery.

## 10. Testing

Every extraction has a dedicated test file in `packages/core`, run without any React/DOM environment (plain Node via Vitest) — proving the logic is independently testable exactly the way a React Native test suite would need it to be:

| File | Tests |
|---|---|
| `exercise/adaptiveExerciseState.test.js` | 14 — every transition (correct, incorrect, auto-hint-advance, hint request, solution reveal, guidance selection) |
| `geometry.test.js` | 3 |
| `algebra.test.js` | 4 |
| `validation/validateScientificNotation.test.js` | 8 |
| `api/errors.test.js` | 8 |

`packages/core` is now 103 tests across 12 files (up from 61/7). Behavior-preservation beyond unit tests was verified live: a real browser against the real dev server, exercising each migrated call site with the exact before/after inputs (`computeHypotenuse(3,4)` via the actual triangle UI, the scientific-notation validator via its actual input fields, the affine-function table, and the full storage-backed register→session→progress flow). See `MOBILE_READINESS_REPORT.md` §10 for the full run.

## 11. Recommended shared-code strategy going forward

Now that the pattern is proven (pure logic in `packages/core`, thin platform wrapper in `apps/web`), the rule for new lesson/exercise work is simple: **if a function's inputs and output are both primitives/plain-objects and it never touches `window`/`document`/`localStorage`/`import.meta`, it belongs in `packages/core`, not inline in a `Module*.jsx` file** — regardless of whether a second consumer exists yet, as long as it's the kind of calculation a mobile version of the same exercise would also need (which, per this survey, is nearly everything except SVG coordinate math). This is now a concrete, demonstrated pattern (§4) rather than a stated intention.

## 12. What remains before starting React Native

This phase deliberately did not: create an Expo/RN project, write mobile screens/navigation/styling, add RN dependencies, or design a shared-UI-component strategy (per the brief: share logic, not UI). Concretely still open, in rough priority order:

1. **The `quatre-operations` validator duplication** (§4) — six sites reimplementing `validateNumericAnswer` inline instead of calling it. Not a mobile-readiness blocker, but the clearest, most mechanical follow-up identified this phase (exact file:line references are in the underlying survey).
2. **`getLessonProgress`/`getResumeLesson`** are still impure (they call `storage` directly rather than receiving data as an argument) — fine for web, but a future RN port reusing `getResumeLesson`'s selection *algorithm* would need that dependency-injected first.
3. **The shared-component comparators** (`OrderingGame`, `InfoSorter`, `AnswerBuilder`, `NumberLine`'s snap math) — identified, not extracted; worth a follow-up pass using the same representative-extraction method as this phase.
4. **`numberUtils.js`/`fractionUtils.js`/`decimalUtils.js` promotion** (§9) — straightforward once a second consumer exists.
5. **An actual `AsyncStorage`/`SecureStore` implementation of the `storage` interface** — not needed until an RN project exists.
6. **The RN project itself** — everything above is preparation; none of it is React Native code.
