# Smarter Academy — Codebase Cleanup Report

Execution of the plan in `AUDIT.md`'s companion cleanup audit. Read-only investigation preceded every change; the 322 pre-existing uncommitted changes (in-progress lesson development) were verified untouched throughout — see §12/§13.

## 1. P0 Bugs Fixed

### 1.1 — `Module01NotionFonction.jsx` — ReferenceError crash at Step 7

- **Problem:** The module threw `ReferenceError` the instant a student reached Step 7 ("l'antécédent").
- **Root cause:** `handleAntecedentSubmit`, `antecedentAnswer`/`setAntecedentAnswer`, and `isAntecedentComplete` were referenced in JSX (form `onSubmit`, input `value`/`onChange`/`disabled`) but never declared anywhere in the file.
- **Fix:** Restored the missing `useState` triplet and submit handler, mirroring the existing `handleTrainingSubmit`/`trainingError` pattern one step earlier in the same file (same file, same author, same idiom — not a new pattern). The correct answer (10 km) was already implied by the pre-authored algebra explanation (`1,5x + 2 = 17` → `x = 10`), so no new pedagogical content was invented. Also fixed the two `<ConceptCard>` calls in the same file that used a nonexistent `type`/`title`/`content` prop shape (real contract: `label`/`emoji`/`color`/`children`) and were silently rendering empty boxes at Step 4 and Step 6.
- **Verification:** Full browser walkthrough via a headless-Chromium driver (dev server + Puppeteer): moved the slider, answered the training question, answered the diagnostic quiz, confirmed both `ConceptCard`s now render visible content, submitted a wrong antecedent answer (error message shown, no crash), submitted the correct answer (antecedent explanation revealed, "J'ai compris" button works, Step 8 "Compétence débloquée" fires after the expected 3s delay). Zero console/page errors across the entire flow.

### 1.2 — Three Pythagoras modules — TypeError crash on answer input

- **Problem:** `Module02CalculHypotenuse.jsx`, `Module03CalculCote.jsx`, and `Module05Contraposee.jsx` (all in `pythagore-3e`) threw on the first keystroke in the answer field.
- **Root cause:** All three still destructured/accessed the pre-refactor `useAdaptiveExercise` return shape (`value`, `setValue`, `feedback`, `isSolutionRevealed`) that commit `7382257` removed in favor of `status`, `specificFeedback`, `canViewSolution`, `viewSolution`. `setUserAnswer`/`.setValue` resolved to `undefined`, so typing threw `TypeError`. A second, independent bug in the same files: each module's `validate` callback returned a bare `boolean` instead of the `{ isCorrect }` object shape `useAdaptiveExercise` expects — so even with correct destructuring, a correct answer would never have registered as correct.
- **Note on prior audit:** the original cleanup audit cited these bugs at a *4e* `racines-carrees` path that doesn't exist; the actual files are in *3e* `pythagore-3e`, and a third affected file (`Module05Contraposee.jsx`, which calls the hook twice via property access rather than destructuring) wasn't previously flagged. Corrected here.
- **Fix:** Added local `useState` for the answer value(s) (no longer provided by the hook), fixed each `validate` to return `{ isCorrect }`, updated all field/status reads to the current hook contract (`specificFeedback`, `canViewSolution`, `viewSolution`), and wired `canViewSolution`/`onViewSolution` into each `<AdaptiveFeedback>` call — the hook's actual, designed mechanism for reaching the "solution revealed" state, already used correctly elsewhere in the codebase (`ExerciseValidator.jsx`). Existing custom `<GuidedSolution>` step-by-step displays and "Nouvel exercice" retry buttons were left exactly as authored — no pedagogical content changed. Did **not** restore the old hook API and did **not** touch the disconnected `detectError`/`errorClassifiers` wiring (a separate, pre-existing gap — see §13).
- **Verification:** Browser walkthrough of all three modules: typed into each `MathInput` (mathlive `<math-field>`), submitted right/wrong answers, exercised the hint → "Voir la solution" flow. Zero console errors (specifically zero `TypeError`/"is not a function") across all three, both of `Module05Contraposee`'s two independent exercises.

### 1.3 — Homepage dead link

- **Problem:** `Hero.jsx`'s "Lancer le simulateur complet" CTA pointed to `/modules/college/3e/fonctions-lineaires-affines/lessons/01-simulateur-graphique/index.html` — a page from the old static-HTML lesson system, absent from disk, 404ing today regardless of any other decision.
- **Fix:** Traced the intended destination to the *live* React equivalent of that same lesson (`fonctions-lineaires-affines`, confirmed registered in `App.jsx` at `LESSON_BASE = '/courses/college/3e/donnees_probabilites/fonctions-lineaires-affines'`) and repointed the CTA there, using React Router's `<Link>` (already imported and used elsewhere in the same file) instead of a raw `<a href>`, for correct client-side navigation. No placeholder/fake destination was created.
- **Verification:** Confirmed the link's `href`/`to` resolves to the real registered route, clicked it in a live browser session, confirmed client-side navigation (no full reload, no 404) landing on the actual lesson page.

### 1.4 — Unified progress-completion calculation

- **Problem:** Four independent implementations of "completion percentage" existed, one of them measurably wrong: `getLessonProgress.js` (canonical, regex-normalizing mixed-format module ids into a deduplicated count), a near-identical duplicate inline in `Courses.jsx`, `Courses.jsx`'s `getChapterProgress` (used raw array `.length` — no normalization, could over-count on mixed-format ids), and `LessonIndex.jsx` (also raw `.length`).
- **Fix:** Extracted one pure function, `calculateCompletionPercentage(completedModuleIds, totalModules)`, in `src/lessons/common/utils/progress/calculateCompletionPercentage.js`. Pure `input → output`: normalizes ids via the same regex the canonical implementation already used, dedupes into a `Set`, returns an integer 0–100. Explicit edge-case handling: zero/missing `totalModules` → 0 (not `Infinity`/`NaN`), missing/non-array `completedModuleIds` → 0, over-100 counts capped at 100. Applied at all four sites: `getLessonProgress.js` now calls it for its `progressPercent` field; `Courses.jsx`'s inline block and `getChapterProgress` both now call it (fixing the inaccurate chapter-level formula); `LessonIndex.jsx`'s displayed `pct` now calls it. `LessonIndex.jsx`'s separate `isMastered` boolean gate (which uses raw `completedCount === totalModules` for the sequential-unlock case) was deliberately left untouched — it serves a different purpose, wasn't flagged as inaccurate, and changing it would be a behavior change outside this fix's scope. Also removed the dead `lesson.totalLessons ||` fallback branch from all 3 remaining call sites (confirmed via grep: `totalLessons` is never set anywhere in `coursesData.js`).
- **Verification:** 8 unit tests in `calculateCompletionPercentage.test.js` covering every edge case named above, all passing. Browser-verified `/courses` renders no `NaN`/`Infinity` text and logs zero console errors.

### 1.5 — Testing the P0 fixes

Ran, in order: `npm run build` (clean), a full headless-browser walkthrough of all 4 fixes above via a temporary Puppeteer driver (dev server launched, driven, screenshotted, torn down — no trace left in the repo), and the new `calculateCompletionPercentage` unit tests. No frontend lint/type-check tooling exists to run (confirmed absent, not introduced). Full suite results in §12.

## 2. Dead Files Removed

| File | Evidence | Reason |
|---|---|---|
| `CV.pdf` (root) | md5-identical to `public/CV.pdf`; all live links resolve to the `public/` copy | Dead duplicate |
| `api/database/database.sqlite` | 0 bytes; `.env` has `DB_CONNECTION=mysql`; gitignored Laravel scaffold leftover | Unused |
| `src/utils/lessonLoader.js` | 0 callers repo-wide; self-labeled `// FUTURE IMPLEMENTATION` | Speculative, never wired up |
| `src/components/Blog.jsx` | 0 imports anywhere | Orphaned, not wired into any page |
| `src/components/Education.jsx` (top-level) | 0 imports; `About.jsx` uses `about/Education.jsx` | Superseded duplicate |
| `src/components/Experience.jsx` (top-level) | 0 imports; `About.jsx` uses `about/Experience.jsx` | Superseded duplicate |
| `src/lessons/common/components/ModulePlaceholder.jsx` | 0 imports anywhere | Unused |
| `src/lessons/common/utils/mathValidation.js` | 0 importers; fully superseded by `mathComparison.js` (5 active importers) | Dead duplicate |
| `.../fonctions-lineaires-affines/components/GraphFonctionAffine.jsx` | 0 importers; own copy says "bientôt" (never delivered) | Orphaned placeholder |
| `.../nombres-decimaux/assets/croissant.svg` | 0 references (verified precisely, excluding false-positive matches on the French word "croissant") | Orphaned asset |
| `src/lessons/college/3e/nombres_calculs/racines-carrees/modules/utils.js` | Consolidated, see §8 | Duplicate |
| `src/lessons/college/4e/nombres_calculs/racines-carrees/modules/utils.js` | Consolidated, see §8 | Duplicate |
| 2 now-empty directories (`nombres-decimaux/assets/`, `puissances-3e/components/`) | Empty after the above; never git-tracked | Scaffold leftovers |

**Deliberately not deleted:** `public/smarter-ui/` (3 files) — confirmed orphaned (its only consumer, the old `public/modules` static-HTML system, is already absent from disk), but its removal was explicitly gated in the audit on a human decision about `public/modules` itself (commit the pending deletion or archive first). Deleting one without the other's decision being made would expand scope beyond what was authorized. Left as-is; see §13.

## 3. Dependencies Removed

| Dependency | Evidence | Verification |
|---|---|---|
| `react-icons` | 0 `from 'react-icons...'` imports anywhere in `src/` (re-checked immediately before removal); every icon in the app goes through `lucide-react` instead | `npm uninstall react-icons` (updates `package.json` + lockfile together); `npm run build` succeeds; grep confirms zero references post-removal |

**Deliberately not removed:** `katex`, `mathlive` — both show zero `from '...'` imports under a naive grep, but are genuinely used via a CSS import (`katex/dist/katex.min.css` in `MathText.jsx`) and a side-effect import (`import 'mathlive'` registering the `<math-field>` custom element in `MathInput.jsx`) respectively. Removing either would have broken math rendering/input across every lesson. `clsx` (3 usages, all in one lesson subfolder) was also left as-is — flagged in the audit as a borderline case for a human call, not auto-removed.

## 4. Scripts Cleaned

| Script | Purpose | Recommendation applied |
|---|---|---|
| `refactor.py` | One-time Module→file rename automation | Deleted — target path no longer exists |
| `renumber.py` | One-time module renumbering (included `os.remove()` calls) | Deleted — target path no longer exists |
| `replace_lesson_navbars.py` | One-time navbar string replacement, hardcoded to a *different, unrelated sibling repo* on the same machine | Deleted — inert here, a footgun if ever run against the wrong checkout |
| `test_courses.js` | Ad hoc debug scratch (`console.log`s of `coursesData.js`) | Deleted — zero references, no `package.json` script invoked it |

No `scripts/` directory structure was introduced. Zero permanent/reusable scripts existed before or after this cleanup — organizing category folders for content that doesn't exist would be premature structure, which the audit explicitly flagged as unwarranted.

## 5. Naming Improvements

| File | Change | Reason |
|---|---|---|
| `errorClassifiers.js` | `isMissingSquareRoot`/`isSignError`: local vars `s`/`e` → `studentNum`/`expectedNum` | Meaning was recoverable from the parameter names one line up, but opaque at the point of use (`Math.abs(s - (e*e))`) |
| `src/lessons/college/{3e,4e}/nombres_calculs/racines-carrees/modules/utils.js` → `src/lessons/common/hooks/useSimpleExercise.js` | Renamed from a generic `utils.js` (that revealed nothing about its contents) to a name matching what it actually exports | Consolidated at the same time — see §8 |

**Deliberately not changed:** the `const data = await response.json()` pattern in `AdminDashboard.jsx`, `AuthContext.jsx`, `Login.jsx` (flagged in the audit as low-severity/stylistic). The instructions for this phase explicitly say not to rename already-understandable code for style alone — each of these is a narrow-scope, immediately-dereferenced binding, not a real clarity problem. Left untouched.

## 6. Function Responsibility Improvements

No function-splitting was performed. The audit's own findings here (`Courses.jsx`'s `CoursesPage`, `ContactSection.jsx`, `LessonIndex.jsx`, `ModuleLayout.jsx` all mixing multiple concerns) were explicitly classified `REFACTOR LATER`, not safe-now cleanup — splitting them touches component structure and render-tree shape in ways that risk behavior changes disproportionate to a cleanup pass. The one exception, extracting the progress-percentage calculation out of `Courses.jsx`/`LessonIndex.jsx`, **was** done — see §1.4/§7, since that was explicitly named in the P0 scope.

## 7. Pure Functions Extracted

| Function | File | Notes |
|---|---|---|
| `calculateCompletionPercentage(completedModuleIds, totalModules)` | `src/lessons/common/utils/progress/calculateCompletionPercentage.js` | New. Pure, documented, 8 unit tests. See §1.4. |

`getValidLevelId`/`getValidGradeId`/`getValidChapterId` in `Courses.jsx` were identified in the audit as already-pure functions needlessly recreated every render (should be hoisted to module scope) — **not** done in this pass; it's a real, safe micro-optimization but wasn't part of the P0/explicitly-authorized scope, so it's listed in §13 rather than applied silently.

## 8. Duplicated Logic Consolidated

| Location A | Location B | Action |
|---|---|---|
| `getLessonProgress.js` (canonical %) | `Courses.jsx` inline block (lines ~337–358) | Consolidated — inline block now calls the shared function |
| same canonical formula | `Courses.jsx`'s `getChapterProgress` (was raw `.length`, inaccurate) | Consolidated + fixed |
| same canonical formula | `LessonIndex.jsx`'s `pct` | Consolidated |
| `src/lessons/college/3e/.../racines-carrees/modules/utils.js` | Byte-identical copy at `4e/.../racines-carrees/modules/utils.js` | Consolidated into one shared file, `src/lessons/common/hooks/useSimpleExercise.js`; all 12 consumer import statements updated (7 in 3e, 5 in 4e); both originals deleted |
| `lesson.totalLessons \|\| lesson.totalModules \|\| 7` fallback (×3 sites) | — | `totalLessons` confirmed never set anywhere; dead branch removed from all 3 |

**Deliberately not consolidated:** the 13-file inline `parseFloat(val.replace(',', '.'))` pattern that duplicates `numberFormat.js`'s `parseDec()`. The audit itself flagged this as needing a per-site spot-check, since `parseDec` is *stricter* than `parseFloat` on malformed input — applying it blindly across 13 live student-facing answer fields risks a real behavior change in exactly the kind of code this phase says to leave alone unless the audit gave a clean go-ahead. Left as a named item in §13/remaining debt rather than guessed at.

## 9. Tests Added

New: `vitest` (dev dependency, `npm test` script). No config file — plain pure-function tests need no browser/DOM environment, so none was introduced.

| Test file | Covers | Tests |
|---|---|---|
| `numberFormat.test.js` | `roundTo`, `formatFr`, `texFr`, `formatDec`, `texDec`, `parseDec`, `parseFr`, `decEquals`, `decimalPlaces` | 20 |
| `lessonAccess.test.js` | `getModuleMastery`, `isModuleUnlocked`, `getModuleStatus`, `lockedReason` | 9 |
| `calculateCompletionPercentage.test.js` | The new pure function, all named edge cases | 9 |
| `mathComparison.test.js` | `compareMathExpressions` | 5 |

**47/47 passing.** Chosen per the audit's own ranking (highest usage-count / highest correctness-impact pure functions first) — not chasing a coverage percentage, per instructions.

## 10. Documentation Added

- **`README.md`** — expanded from the literal string `"# smarter-academy"` to a real project description, stack summary, setup/dev/test commands, and pointers to `AUDIT.md`, `CONTRIBUTING.md`, `.agents/AGENTS.md`, and the lesson-components README.
- **`CONTRIBUTING.md`** (new, concise) — documents conventions already followed in practice (module naming, the shared-vs-domain-utility pattern, pure-function preference, naming rules, testing entry points) rather than inventing new ones. Explicitly notes no `scripts/`/`generated/`/`tmp/` convention exists and none should be added speculatively.
- **`calculateCompletionPercentage.js`** and **`useSimpleExercise.js`** — both carry full JSDoc (purpose, inputs, output, edge cases) as new reusable functions.

No comments were added to obvious code, and no existing working code was re-documented just to add comments — per instructions.

## 11. Files Deliberately NOT Changed

| Item | Why deferred |
|---|---|
| `public/modules/` (195 files) + `public/smarter-ui/` (3 files) | Pending human decision from the original audit (commit the deletion vs. archive first) — not re-litigated here |
| `src/components/hero/GeoGebraGraph.jsx` | Audit found clean 0-reference evidence (dead), but this conflicts with `AUDIT.md`'s explicit "DO NOT TOUCH YET" — flagged, not resolved unilaterally |
| 3× `verified_scopes_*.json` | Not code-referenced, but may be intentional 5e/Lycée content-authoring reference material — a content-retention call, not a code-safety one |
| `public/robots.txt` / `sitemap.xml` | Stale pre-pivot domain content, but harmless (unused by any build step) — regenerating them is a content task, not cleanup |
| `clsx` dependency | Borderline usage (3 sites, one lesson subfolder) — flagged for a team call, not removed |
| 13-file inline decimal-parsing → `parseDec()` swap | Audit-flagged as needing per-site behavior verification before applying; deferred rather than guessed |
| `mathComparison.js`'s `normalizeMathAnswer`, `errorClassifiers.js`'s `isSignError`/`isAdditionInsteadOfMultiplication`, `getNextLesson.js`'s `getNextLesson()` | Zero call sites each, but could be intentionally forward-looking rather than dead — needs author confirmation before deletion |
| `getValidLevelId`/`getValidGradeId`/`getValidChapterId` hoist in `Courses.jsx` | Real, safe micro-cleanup identified by the audit, but not part of the explicitly authorized P0/dead-file/dependency/naming scope — noted for a future pass rather than snuck in |
| `errorClassifiers.js`/`useAdaptiveExercise.js` misconception-detector disconnect (`detectError` passed but never invoked by the hook) | Pre-existing architectural gap, explicitly out of scope ("Do NOT redesign the exercise architecture") |
| `Courses.jsx`/`ContactSection.jsx`/`ModuleLayout.jsx` multi-responsibility structure | Audit-classified `REFACTOR LATER` / `ARCHITECTURAL — DO NOT TOUCH` (the `ModuleLayout.jsx` access-control gate specifically) |
| Two generations of lesson primitives (Gen 1 `ConceptCard`/`FeedbackBox` vs. Gen 2 `LessonUI.jsx` toolkit), 3e lesson regeneration | Explicitly out of scope — architectural, later phase |
| Database schema, authentication/authorization architecture, API contracts, data model | Explicitly forbidden this phase |
| The pre-existing `ExampleTest.php` DB/session test-isolation gap (see §12) | Discovered during verification, confirmed pre-existing and unrelated to any change made here; fixing it (enabling `RefreshDatabase`, or reworking `SESSION_DRIVER` for testing) is a test-infrastructure change beyond "run Pint on 4 files" |

## 12. Verification Results

```
$ npm run build
✓ built in 9.24s   (only pre-existing chunk-size warning, unrelated to this cleanup)

$ npm test
Test Files  4 passed (4)
     Tests  47 passed (47)

$ cd api && php artisan test
2 passed, 1 failed — Tests\Feature\ExampleTest::test_the_application_returns_a_successful_response
  (expected 200, got 404 — see below)

$ cd api && vendor/bin/pint --test
{"tool":"pint","result":"passed"}
```

**On the one Laravel test failure:** isolated via `git stash` — reverting only the 4 Pint-touched files and re-running the full suite reproduces the *identical* failure. Root-caused to a pre-existing environment gap unrelated to any change in this cleanup: the `web` middleware group's session handler (`SESSION_DRIVER=database`) tries to read/write a `sessions` table; `phpunit.xml` swaps `DB_CONNECTION`/`DB_DATABASE` to an in-memory SQLite for tests, but `ExampleTest.php` has `RefreshDatabase` commented out, so no migrations ever run against that in-memory DB — a gap the original audit itself flagged as "worth enabling before any future DB-touching Feature test is added." Not fixed here (out of the authorized scope), but now precisely diagnosed rather than left as an unexplained red test.

**Browser verification** (headless Chromium via a temporary Puppeteer driver, dev server launched/driven/torn down, zero trace left in the repository — confirmed via `git status` before/after): all 4 P0 fixes exercised interactively; zero console/page errors across every page visited (`Module01NotionFonction` full 8-step flow, all 3 Pythagoras modules' answer inputs, 4 racines-carrées modules across both grades post-consolidation, homepage CTA click-through, `/courses` catalogue page).

**Reference/dependency sweeps:** every deleted file re-confirmed at zero references immediately before deletion; `react-icons` confirmed zero references and absent from `node_modules` after removal; `calculateCompletionPercentage` confirmed as the sole percentage-calculation implementation across all 4 original call sites.

**Diff-scope check:** `git status` before and after this entire phase, diffed — every newly-touched file corresponds to an intentional change listed above; zero unrelated files touched; zero pre-existing pending changes (the 322-line baseline) lost or altered. Full detail in §13.

## 13. Remaining Technical Debt

### P1 — should address soon
- Enable `RefreshDatabase` (or otherwise isolate the test DB/session driver) for Laravel Feature tests — currently masks real web-route failures behind an environment artifact (§12).
- Resolve the `public/modules`/`public/smarter-ui` pending deletion decision (commit vs. archive) — everything downstream of that decision (§2, §11) is blocked on it.
- Reconcile `GeoGebraGraph.jsx`'s dead-code evidence against `AUDIT.md`'s "DO NOT TOUCH YET" guidance.
- Hoist `Courses.jsx`'s three pure validator functions out of the component body (safe, already-identified, just not in this phase's authorized scope).

### P2 — later
- Decide the fate of the 3 `verified_scopes_*.json` files and `clsx`.
- Regenerate `public/robots.txt`/`sitemap.xml` for the current domain/routes before any real SEO push.
- Confirm whether `normalizeMathAnswer`, `isSignError`, `isAdditionInsteadOfMultiplication`, and `getNextLesson()` are dead code or intentionally forward-looking; remove or wire up accordingly.
- Apply the `parseDec()` consolidation across the 13 identified lesson files, with per-site malformed-input verification.

### ARCHITECTURAL — future phase
- Reconnect or remove the `errorClassifiers.js` misconception-detection layer (`detectError` is passed to `useAdaptiveExercise` but the hook never calls it).
- Decide a single canonical math-comparison API design (not just "delete the dead half," which is already done).
- Unify or consciously retire the Generation 1 (`ConceptCard`/`FeedbackBox`) vs. Generation 2 (`LessonUI.jsx`) lesson-primitive split.
- 3e lesson regeneration onto the Generation 2 toolkit (per `AUDIT.md`'s original recommendation — unaffected by this cleanup pass beyond the P0 crash fixes).
- Component-responsibility refactors for `Courses.jsx`, `ContactSection.jsx`, `LessonIndex.jsx` (extract subcomponents/hooks) — real but nontrivial, correctly deferred.
