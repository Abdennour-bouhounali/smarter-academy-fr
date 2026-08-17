# Architecture Foundation Report

Execution of Phase 3 (Architecture Foundation) on top of the completed cleanup phase. Full audit detail in `ARCHITECTURE_FOUNDATION_AUDIT.md`; contract detail in `docs/architecture/`. This report summarizes decisions and what changed.

## 1. Current Architecture

One React/Vite SPA, entirely client-side for the learning loop (catalogue → lesson → module → exercise → progress, all `localStorage`-backed, zero network calls in that path), plus a small, separate Laravel API (admin auth + contact form) with no relationship to lesson content or progress today. Full trace in `ARCHITECTURE_FOUNDATION_AUDIT.md` §1. Overview diagram and layer-by-layer breakdown in `docs/architecture/ARCHITECTURE.md`.

## 2. Problems Found

- Three independent lesson/module id surfaces (folder name, `smaMetadata[...].id`, `LESSON_CONFIG.id`) kept in sync by convention only — pre-existing, documented, not fixed (would require validation tooling beyond this phase's scope).
- No `Attempt` concept exists anywhere — `useAdaptiveExercise`'s `attempts`/`hintLevel` counters are computed but never read or persisted. Real gap for the future mastery/analytics system; documented, not built now.
- `isMastered`/`getModuleMastery` naming implies a real mastery signal that doesn't exist — it's a completion-threshold proxy. Named precisely in `PROGRESS_MODEL.md` so it isn't mistaken for something that just needs tuning later.
- No API service layer existed — four `fetch` calls duplicated auth/error-handling logic inline across `AuthContext.jsx`, `Login.jsx`, `AdminDashboard.jsx`, `ContactSection.jsx`. **Fixed this phase** — see §12.
- 13+ lesson modules duplicate a numeric-answer-validation pattern inline instead of using a shared function (found in the cleanup phase, still true). **One representative site migrated this phase** to prove the extraction is safe — see §7.

## 3. Domain Model

Full table in `docs/architecture/ARCHITECTURE.md` §1. Summary: Course/Grade, Chapter, Lesson, and Module all have real, working representations today. Activity, Exercise-as-a-record, Attempt, Answer-as-a-record, Skill/Competency-as-a-graph, and real Mastery do not — they exist only as either UI-transient state or free-text metadata. No tables were created for any of them (per explicit instruction) — the domain model document exists so building them later attaches cleanly to what's already there instead of requiring a redesign.

## 4. Lesson Contract

Documented in `docs/architecture/LESSON_CONTRACT.md`, derived from the real `LESSON_CONFIG` shape already used by all 17 implemented lessons (7 required fields + `modules[]`, cross-checked against 7 different lesson files). No new fields invented. One known gap named explicitly (three id surfaces + `totalModules` consistency, convention-enforced only) rather than silently fixed — fixing it means build-time validation tooling, which is a reasonable next step but a distinct piece of work from defining the contract.

## 5. Module Contract

Documented in the same file. A module is one component wrapped in `<ModuleLayout>`; the contract constrains its metadata shape (`id`, `number`, `slug`, `path`, `title`, `desc`, `color`, `style`, `estimatedMin`, `difficulty`, `actionText`) and its two behavioral obligations (call `markModuleCompleted` when its own definition of "done" is met; honor the Exercise Contract for any gradeable content) without forcing every module type (`featured`/`boss`/`assessment`) to look the same internally. No `Activity` layer was introduced between Module and Exercise — the phase brief explicitly reserves that for later, and inventing it now with zero real consumers would be exactly the premature abstraction the brief warns against.

## 6. Exercise Contract

Documented in `docs/architecture/EXERCISE_CONTRACT.md`. Canonicalizes `{isCorrect, fields?, feedback?}` — the shape `useAdaptiveExercise` already expects and that the cleanup phase's bug fixes made every real consumer honor correctly. This wasn't invented for this phase; it's a formalization of what was already the strongest existing pattern (per `ARCHITECTURE_FOUNDATION_AUDIT.md` §6's comparison of the three competing exercise-validation patterns found in the codebase).

## 7. Answer Validation Model

Boundary documented: `Input → Normalize (numberFormat.js) → Validate (pure fn → Exercise Result) → useAdaptiveExercise orchestration (not pure) → Feedback rendering (not pure) → useProgress persistence (not pure)`.

**Extracted this phase**, `src/lessons/common/utils/validation/`:
- `validateNumericAnswer(studentInput, expectedValue, options?)` — formalizes the parse+tolerance+algebraic-equivalence pattern already duplicated across 13+ modules, built entirely from already-proven utilities (`parseDec`, `compareMathExpressions`). Pure, deterministic, framework-independent.
- `validateChoiceAnswer(selectedValue, correctValue)` — formalizes the equality check `QuizQuestion`/`ChoiceGrid` already do inline, available for new choice-based exercises. **Not** wired into the existing `QuizQuestion`/`ChoiceGrid` components — their "correct" state is coupled to selection-index UI state, and restructuring that is a UI-integration change beyond a validation-boundary extraction.

**Migrated as the representative example:** `Module02CalculHypotenuse.jsx`'s `validateAnswer` now calls `validateNumericAnswer` instead of duplicating the logic inline (4 lines → 1). Verified byte-for-byte behavior-preserving: rebuilt, re-ran the full test suite, and re-ran a live browser interaction (wrong answer → correct feedback shown; correct answer → "Excellent" accepted) — identical outcome to the cleanup-phase verification of the same module. **The other 12+ sites are deliberately not migrated** — each needs the same per-site malformed-input check the cleanup phase already deferred for the same reason (`parseDec` is stricter than the ad hoc `parseFloat` some sites use); mass-migrating now would be the "rewrite because it looks cleaner" the phase brief prohibits.

## 8. Progress Model

Full detail in `docs/architecture/PROGRESS_MODEL.md`. Module completion is binary; lesson completion is `calculateCompletionPercentage` (unique, normalized module count ÷ `totalModules`, edge-cased against `NaN`/`Infinity`); chapter completion is the unweighted mean of its lessons' percentages; course/grade-level completion doesn't exist anywhere in the UI today and wasn't added (nothing currently asks for it). No weighting scheme exists — every module and every lesson counts equally, which is a real, already-baked-in modeling decision, documented rather than changed.

## 9. Completion vs. Mastery

The single most important documented distinction from this phase. Today's codebase does **not** actually separate them: `getModuleMastery()` returns exactly what completion returns (100 or 0), and `lessonAccess.js`'s own header comment already says so. `PROGRESS_MODEL.md` names this precisely and states the architectural rule going forward: `Progress` stays a pure function of "what was clicked through"; `Mastery` must become its own function of attempt history once `Attempt` records exist, and the two must never be collapsed into one number again the way `isMastered` currently is. No mastery algorithm was built — this phase only draws the line so the future mastery engine doesn't inherit the current conflation.

## 10. Attempt Model

Documented in `EXERCISE_CONTRACT.md` §Attempt model: a table of every field a real `Attempt` record should eventually carry (student, exercise/module id, answer, isCorrect, timestamp, attemptNumber, hintsUsed, timeSpent, competency), cross-referenced against what's already computable today vs. what requires a Student entity and backend persistence that don't exist yet. No `attempts` table was created — that's explicitly future work (§23 of the brief: no mastery engine, no analytics yet). What this phase confirms: every field the future Attempt record needs is either already computed transiently (the Exercise Result's `isCorrect`) or trivially exposable (the hook's existing `attempts`/`hintLevel` state) — nothing about today's frontend would need to be redesigned to start persisting them later.

## 11. Frontend/Backend Boundary

Documented in `docs/architecture/ARCHITECTURE.md` §6, as a table (what stays frontend-only vs. what's backend-owned today vs. what moves to backend once it exists). This is a description of the current, already-real boundary — the frontend was never coupled to Laravel internals to begin with (confirmed: zero lesson/progress code anywhere calls the API), so there was no boundary to *build*, only to document so it isn't accidentally blurred later.

## 12. API Service Boundary

**The one place this phase changed real application code beyond the single validation-function migration.** Before: four components (`AuthContext.jsx`, `Login.jsx`, `AdminDashboard.jsx`, `ContactSection.jsx`) each called `fetch` directly, each re-deriving the API base URL and its own ad hoc error-message logic. After: `src/services/apiClient.js` (shared fetch wrapper + a typed `ApiError` with a `type` matching the Error Model in §15) + `src/services/authService.js` (`login`, `fetchCurrentUser`) + `src/services/contactService.js` (`submitContactRequest`, `fetchContactSubmissions`). All four call sites migrated. No empty/speculative service files were created — every exported function wraps a real, currently-used endpoint call, nothing more.

**One deliberate, minor, disclosed behavior change:** the exact wording of the network-unreachable error message differed slightly between `Login.jsx` ("Impossible de joindre le serveur.") and `ContactSection.jsx` ("Impossible de joindre le serveur. Veuillez réessayer plus tard ou utiliser le numéro de téléphone."). Centralizing this in `apiClient.js` unified it to the shorter message everywhere. Same error type, same trigger condition, only the phrasing changed — flagged here rather than silently absorbed into "extraction," since even a wording change is a user-visible behavior change and deserves disclosure.

## 13. Mobile-Readiness Decisions

No React Native, no Expo, no mobile screens — confirmed absent from `package.json` and the dependency tree. The two extractions this phase (`services/`, `validation/`) both land in the "reusable by a future mobile client without modification" category named in `ARCHITECTURE.md` §7 — they have zero React/DOM coupling, same as the pure functions the cleanup phase already extracted (`mathComparison.js`, `numberFormat.js`, `lessonAccess.js`, `calculateCompletionPercentage.js`). The one seam that would need real work for mobile (`useProgress`'s direct `localStorage` calls) was identified in the cleanup-phase audit and remains a named, deferred item — not touched this phase either, consistent with "do not build offline/mobile architecture now."

## 14. State Management Decisions

**Decision: no state library introduced.** Confirmed via the audit (`ARCHITECTURE_FOUNDATION_AUDIT.md` §8) that component-local `useState`, the single-purpose `AuthContext`, and the `useProgress` hook are sufficient for what the app actually does — no prop-drilling pain or state-sync bug was found that traces to the *absence* of Redux/Zustand/MobX. This is a documented decision, not a default — it was actively checked, not assumed.

## 15. Data Ownership

| Data | Source of truth |
|---|---|
| Lesson/module content | The repository (`lesson.config.js` + component code) |
| Catalogue structure | `smarter_academy_programmes_maths_2026.json` × `coursesData.js` overlay |
| Admin identity | Backend (`users` table) |
| Contact-form messages | Backend (`contacts` table) |
| Student progress | Frontend `localStorage` (today) — will move to backend once a Student entity exists |
| Current exercise interaction, temporary answer | Frontend only, always (even after a backend exists) |
| Attempt history | Doesn't exist yet; will be backend-owned once built |

No competing sources of truth were found for anything that currently exists — the gaps are things that don't exist yet, not things duplicated inconsistently (the one real duplication, progress-percentage *formulas*, was already fixed in the cleanup phase).

## 16. Identifier Strategy

Audited in `ARCHITECTURE_FOUNDATION_AUDIT.md` §4. No IDs were changed (explicitly out of scope — existing IDs are load-bearing for real `localStorage` progress data). The one concrete guidance added for *future* IDs (`LESSON_CONTRACT.md`'s Module contract): prefer a bare zero-padded number over the inconsistent `L01-ent`/`L01-4e` prefix styles going forward, without renaming what already exists.

## 17. Testing Strategy

Extended the vitest suite the cleanup phase introduced. New: `validateNumericAnswer.test.js` (7 tests), `validateChoiceAnswer.test.js` (3 tests). Total suite: **57/57 passing** (up from 47). Per the phase brief's priority order (progress calculation, answer validation, exercise result, lesson/module completion) — progress calculation and lesson/module completion were already covered by the cleanup phase's tests; this phase's additions cover answer validation and, by construction (the `{isCorrect}` return shape), exercise result. API services were not unit-tested this phase — they're thin I/O wrappers around `fetch`, lower priority than pure business logic per the brief's own ordering, and were instead verified via live browser interaction (§ below).

## 18. Files Changed

**New documentation:**
`ARCHITECTURE_FOUNDATION_AUDIT.md`, `docs/architecture/{ARCHITECTURE,LESSON_CONTRACT,EXERCISE_CONTRACT,PROGRESS_MODEL}.md`, this report.

**New code:**
`src/services/{apiClient,authService,contactService}.js`, `src/lessons/common/utils/validation/{validateNumericAnswer,validateChoiceAnswer}.js` + their `.test.js` files.

**Modified (migrated to the new service layer):**
`src/context/AuthContext.jsx`, `src/pages/Login.jsx`, `src/pages/AdminDashboard.jsx`, `src/components/contact/ContactSection.jsx`.

**Modified (migrated to the new validation function, representative example):**
`src/lessons/college/3e/espace_geometrie/pythagore-3e/modules/Module02CalculHypotenuse.jsx`.

**Not touched:** `src/App.jsx` (routes/URLs/module IDs unaffected by this phase — its large diff against `HEAD` predates this phase entirely, part of the original pre-existing uncommitted lesson work), the Laravel backend (zero PHP files touched), all other exercise modules, `package.json` dependencies (no new runtime dependency added).

## 19. Tests Added

10 new tests (`validateNumericAnswer.test.js` ×7, `validateChoiceAnswer.test.js` ×3). Suite total 57/57 passing. Full verification results:

```
$ npm run build          → ✓ built in 9.20s (same pre-existing chunk-size warning, unrelated)
$ npm test                → Test Files 6 passed (6) / Tests 57 passed (57)
$ cd api && php artisan test  → 2 passed, 1 failed (the same pre-existing environment gap
                                 documented in CODEBASE_CLEANUP_REPORT.md §12 — reconfirmed
                                 unrelated, no PHP file was touched this phase)
$ cd api && vendor/bin/pint --test → passed
```

**Live browser verification** (headless Chromium, dev server launched/driven/torn down, zero trace left — confirmed via `git status`): Login page's bad-credentials path (error shown, no crash, network-error path exercises the new `ApiError`/`NETWORK_ERROR` classification correctly since no backend is running in this sandbox); Contact form renders with the new service import resolved; `Module02CalculHypotenuse` full interaction (wrong answer → feedback, correct answer → "Excellent") — identical outcome to the cleanup phase's independent verification of the same module.

## 20. Remaining Architecture Debt

### SAFE FUTURE WORK
- Migrate the remaining 12+ inline numeric-validation sites to `validateNumericAnswer`, one lesson family at a time, each with its own malformed-input spot-check (same caution the cleanup phase applied).
- Build-time validation that `LESSON_CONFIG.totalModules === modules.length` and that lesson/module ids are unique across the whole catalogue — would turn the "convention only" id gap into an enforced one.
- Expose `useAdaptiveExercise`'s existing `attempts`/`hintLevel` state to callers (already computed, just unused) — a small step toward the Attempt model without yet persisting anything.
- Add a thin storage-adapter seam in front of `useProgress`'s `localStorage` calls (identified in the cleanup phase, still not done) — cheap now, required before either backend sync or mobile.

### MAJOR ARCHITECTURAL WORK
- Backend data model for Course/Chapter/Lesson/Module/Exercise/Attempt/Progress/Mastery/Competency (§1/§10) — greenfield, no tables exist.
- Student entity + real multi-role authentication/authorization (today: one hardcoded admin role check).
- Real mastery algorithm, once Attempt records exist (§9) — must be built as a genuinely separate computation from completion, not a rename of `getModuleMastery`.
- Backend sync for progress/attempts, and the mobile storage-adapter work that depends on it.
- Student/parent/admin dashboards, analytics event pipeline, recommendation/AI personalization — all explicitly deferred per §23 of the phase brief, unaffected by anything in this phase.
