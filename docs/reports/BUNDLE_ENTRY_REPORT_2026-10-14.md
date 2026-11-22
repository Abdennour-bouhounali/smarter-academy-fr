# Entry bundle fix — 2026-10-14 (before phase 3 of the cycle moyen rollout)

> Session goal: get the LESSON CONTENT out of the entry bundle without changing what any page shows or does.
> No lesson was generated. Contract: [`../architecture/BUNDLE_BOUNDARIES.md`](../architecture/BUNDLE_BOUNDARIES.md)
> (§2 ladder, §3 boundaries, §4 rules 9–10, §5 « Entry fix »).

## 1. Result

Measured with `node scripts/analyze-entry-bundle.mjs` (initial JS = entry chunk + its static imports, gzip -9).
Rows 1–2 are variant builds that re-inject the later steps' eager paths, so each step is measured on its own.

| State | Initial JS raw | gzip | Δ gzip |
|---|---:|---:|---:|
| Baseline (`dev` 01c4c7b8) | 2,803.3 KB | **629.2 KB** | — |
| 1. One lazy lesson-route boundary | 2,542.2 KB | 601.3 KB | −27.9 |
| 2. Generated lesson index; configs loaded with the lesson | 1,818.6 KB | 472.0 KB | −129.3 |
| 3. `lesson.manipulation` strings on demand | 1,283.1 KB | 339.8 KB | −132.2 |
| 4. Core barrel trimmed (unit maths, manipulation registries, practice) | 1,231.9 KB | **322.1 KB** | −17.7 |

**−49 % gzip, −56 % raw.** A published lesson now costs the entry one line of the index (≈ 20 bytes gzip) instead of
≈ 4.5 KB: phase 3's 196 lessons ≈ +4 KB instead of ≈ +0.9 MB. The budget gate is set at **330 KB gzip**.

What remains in the entry is the shell: framer-motion (accepted, §7), the catalogue JSON of four grades (≈ 95 KB gzip,
synchronous by design — the next candidate if the budget must come down), the eager i18n namespaces, React, React
Router, i18next.

## 2. What changed

### Step 1 — one lazy lesson-route boundary
- `App.jsx` no longer imports any `routes.jsx` (74 imports and 74 calls removed). Its `<Routes>` moved into an
  `AppRoutes` component that mounts `useLessonRoutes()` where the calls were (under `CourseLayout › RequireAccount`).
- `lessons/lessonRouteBoundary.jsx`: per built lesson, a `<basePath>/*` route whose element (under its own
  `<Suspense>`, same fallback as before) loads the lesson's `routes.jsx` and the lab strings, then the lesson's **real**
  routes (`buildLessonRoutes`, unchanged) replace it through a small store (`useSyncExternalStore`). Same route tree as
  before once loaded: deep links, the classroom shell mounted across modules, unknown module URL → `*`.
- `lessons/lessonLoaders.js`: the two lazy globs (`lesson.config.js`, `routes.jsx`), literal per active grade, itself
  reached only by `import()` — even the glob tables are out of the entry.
- `scripts/check-routes.mjs` re-expressed: the boundary is mounted under `RequireAccount`, no `routes.jsx` is imported
  statically, every active lesson is in the index and its grade in the loaders' glob, dormant grades are neither;
  catalogue base paths and the unit-page route as before.

### Step 2 — generated index instead of the eager config glob
- `scripts/generate-lesson-index.mjs` → `lessons/lessonIndex.generated.json` (id, level, grade, chapter,
  `[number, slug]` per module; 1.5 KB gzip for 74 lessons). `--check` (`npm run check:lesson-index`) in
  `check:lessons` and CI. It also ENFORCES what was convention: folder = id, `routes.jsx` present, level/grade = path,
  `LESSON_BASE_PATH` and every `m.path` = the reconstructed path.
- `lessons/registry.js`: synchronous answers from the index (`isLessonBuilt`, `getTotalModules`,
  `getFirstModuleNumber`, `getModulePath`, `getLessonBasePath`, `getBuiltLessons`); the full config through
  `loadLessonConfig(s)`, `useLessonConfig(s)` (`lessons/useLessonConfig.js`) or `getLoadedLessonConfig` once
  `buildLessonRoutes` has registered it (`rememberLessonConfig`). `getLessonConfig` no longer exists.
- Callers audited: progress / resume / progression / cards / StudentHome / LessonIndex / LP status keep their
  synchronous calls (index). Async now: UnitPage resources and teacher module chips (`useLessonConfig`), « مذكرة
  الدرس » (config loaded with the memo sources; retry reloads both). The knowledge map and its progressive view read
  `getLoadedLessonConfig` — always present on a lesson page.

### Step 3 — lab strings on demand
- `lesson.json › manipulation` (≈ 600 KB raw, 137 KB gzip) moved verbatim to `i18n/locales/ar/lesson.manipulation.json`;
  `i18n/lessonManipulationStrings.js` merges it into `lesson` — **the keys `lesson:manipulation.*` are unchanged**, no
  call site changed. Awaited by the route boundary (a lesson's routes mount only once they are there), by
  `loadLessonRuntime`, and by the QA fixture. Only lesson code reads these keys (checked: no page, feature or Math Lab
  tool does). Listing pages prefetch them on idle with the lesson runtime and `lessonLoaders.js`.
- Tests: `src/test/setupLessonStrings.js` (vitest `setupFiles` in `vite.config.js`) registers them through a
  `vi.mock` of `i18n/index.js` — only for tests that load i18n (a first version that initialised i18n globally made 5
  Math Lab tests suspend on the on-demand `mathlab` namespace).

### Step 4 — core barrel
- `packages/core/index.js` no longer re-exports `arithmetic/*` (14 modules), `practice/`, `manipulationTypes.js`,
  `manipulationLevels.js`; 217 files rewritten to path imports (`import * as LIN from
  '@smarter-academy/core/arithmetic/linear.js'`), aliases kept. `packages/core/barrel.test.js` guards it.

### Step 5 — the budget gate
- `analyze-entry-bundle.mjs --budget <KB>` (own analysis build) and `--dist <dir> --budget <KB>` (an existing build:
  `index.html`'s module script + modulepreloads). `npm run check:entry-budget` (330) is the last step of
  `check:lessons`; CI runs `--dist apps/web/dist --budget 330` after « Build », plus the index/route checks.

## 3. Verification

| Gate | Result |
|---|---|
| `npm test` | core 816 · web 9,477 · scripts 9,905 — all pass |
| `npm run check:lessons` | pass (incl. index check, routes, budget 322.1 ≤ 330) |
| `npm run build` | pass; `--dist` budget on it: 322.1 KB gzip |
| New `apps/web/e2e/lesson-route-boundary.mjs` | 19/19 on the dev server **and** on a production build (`vite preview`) |
| `catalogue-views.mjs` | 52/52 (after the script fix below) |
| `knowledge-map.mjs` | 648/649 — the one failure is pre-existing (§4) |
| `notebook-lesson.mjs` | 26/27 — identical on `HEAD` (§4) |
| `moyen-draft-grades.mjs` | 1 failure — identical on `HEAD` (§4) |
| lesson-kit `test-presentation.mjs` | D1 failures — identical on `HEAD` (§4) |
| PHP | not run: the API did not change |

The new suite checks: `/` requests no lesson file nor lab strings; a deep link to a module mounts the lesson with
its lab, no raw `manipulation.*` key, بطاقتي and كرّاسي; index → module by a link keeps the SAME classroom-shell DOM
node; an unknown module URL falls to `*` (→ `/espace`); the unit page shows the 8 module chips and the lab chips;
the مذكرة builds; 390 px without overflow, RTL, no console error.

## 4. Pre-existing problems found (not caused by this change)

1. **Unit 4's synthesis has no modules 1–6.** `wadiya-idmajiya-muadalat` declares the six « وضعيات تدريبية » since
   2b1e7342 (2026-10-13) but has no `Module01…06` files: those URLs fall to the home page. Found by the new
   `registry.test.js` check (every declared module must be mounted); pinned as `KNOWN_UNMOUNTED_MODULES` so the test
   fails for any other lesson and again once the files exist. **Content to generate — owner decision.**
2. **Stale e2e expectations** (same result on `HEAD`, checked by stashing the work and rerunning):
   - `catalogue-views.mjs` assumed a public `/courses` (gated since 3e83277f, 2026-10-07) — **fixed**: it logs in once
     as the QA student;
   - `knowledge-map.mjs`: page tours (2026-10-07) cover the click — **fixed** (closes the tour); and « élève M1 » on
     the unit-1 synthesis expects knowledge after module 1, which is a training situation laying no brick since
     2026-10-13 — expectation to update, left as is;
   - `notebook-lesson.mjs` step 7 waits for `[data-nb-add="qawasim-mushtaraka"]` on module 1, no longer there;
   - `moyen-draft-grades.mjs`: « practice: no answer field found » (adaptive question choice for the QA student);
   - lesson-kit `test-presentation.mjs` D1: diagnostic questions hidden in presentation.

## 5. Documentation sync

| File | What |
|---|---|
| `docs/architecture/BUNDLE_BOUNDARIES.md` | §2 ladder; §3 rows « Lesson index », « Lesson route boundary », « lesson.manipulation strings », « Core barrel »; §4 rules 3–4 rewritten, new rules 9 (barrel) and 10 (budget); §5 « Entry fix » table; §6 budget modes |
| `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` | « Loading »; §3 « How a lesson is mounted »; « Adding a GRADE » (loader globs); unit recipe step 5; unit-9 stub note obsolete; §11 « Publish a lesson » wiring (index, not `App.jsx`); §14.1 diagram; §14.3 gates (index, budget, new e2e); theme-words file |
| `docs/architecture/LESSON_CONTRACT.md` | id agreement (folder = id enforced, boundary); `path` rule; the route factory is loaded with each lesson and registers its config |
| `docs/architecture/MANIPULATION_CONTRACT.md` | every « strings in `lesson.json › manipulation.*` » → `lesson.manipulation.json` (same keys) |
| `docs/architecture/ARCHITECTURE.md`, `LESSON_DESIGN_PLAYBOOK.md` | `App.jsx` no longer lists lessons; mounting = the index |
| `docs/README.md`, `CLAUDE.md` | map row and the standing rule (budget, index, lab-strings file, path imports) |
| `docs/reports/MOYEN_ROLLOUT_PHASE2_REPORT_2026-10-14.md` | §6 marked done; points to the prompt below |

## 6. Phase 3 prompt (updated for the new lesson wiring)

```text
Phase 3 of the cycle moyen rollout — generate the next N=3 lessons of the learning-net queue.
Read first: CLAUDE.md, docs/README.md, docs/architecture/LEARNING_NET.md (§3bis platform/DB, §4 generation contract,
§4bis order), docs/reports/MOYEN_ROLLOUT_PHASE2_REPORT_2026-10-14.md (owner decisions D1–D12; D12: publish = push
to dev), docs/lessons/LESSON_DEVELOPMENT_GUIDE.md end to end (§3 « How a lesson is mounted » and « Adding a GRADE »,
§11 « Publish a lesson », §14), docs/architecture/BUNDLE_BOUNDARIES.md §4 (rules 3, 4, 9, 10),
docs/architecture/MANIPULATION_DNA.md, docs/architecture/EXERCISE_CONTRACT.md (« Term-exam provenance »,
« Earlier-year review link »), docs/sources/moyen/exams/EXAM_PATTERN.md §6.

Run `node scripts/learning-net-queue.mjs` so the queue is fresh, then take its first N entries that are still
`coming_soon` in packages/core/curriculum/dz/lessons_<g>_2026_2027.json. For each, in order:
1. If it is the first lesson of its unit: seed the unit (lessons/moyen/<g>/<chapter>/<unit>/, _unit/ with the three
   one-line bindings) and build docs/sources/<g>/unit<N>/extraction.json (+ build-extraction.py) from the pages in the
   unit's `textbook` block (docs/official-book-pdfs/; render only the pages you need with pdftoppm; the 2AM scan is the
   only copy — get the idea and move on, D5/D9). Pages missing from the scan (D11) are GENERATED in the book's format
   as declared platform additions.
2. Generate the lesson INTO its existing catalogue entry (same code, same programmeItems) per guide §14 and
   LEARNING_NET §4, in a folder named exactly like the lesson code: « أستعدّ » measures every review-link item; nothing
   noRebuildForLesson lists is rebuilt; pointPrerequisites only along net links; the lab follows MANIPULATION_DNA with
   two levels; knowledge map, « أتوقّع القاعدة », « مسائل », values woven into story contexts. Lab strings go to
   apps/web/src/i18n/locales/ar/lesson.manipulation.json (keys lesson:manipulation.<type>.*), never lesson.json;
   unit maths in packages/core/arithmetic/ are imported BY PATH, never added to the core barrel. Do NOT touch App.jsx:
   run `npm run generate:lesson-index` once the lesson's lesson.config.js and routes.jsx exist. The draft الكفاءات may
   be refined (keep their order — LP ids are positional), never silently dropped: list every change for me.
3. Build its practice bank (5 levels × 10) from docs/sources/moyen/exams/exams-index.json and exercises generated
   « على منوال » the term exams: source.type "term_exam" (one precise corpus exercise) or platform_addition /
   term_exam_modelled, badge « على منوال اختبار الفصل … », oracles for every constructed answer; add it to
   active.json and exam-style.json.
4. Run the gates (npm test, npm run check:lessons — it includes the lesson-index check and the 330 KB entry budget —,
   npm run build), check it in the browser (RTL, 320 px; node apps/web/e2e/lesson-route-boundary.mjs; extend
   apps/web/e2e/moyen-draft-grades.mjs if useful), then PUBLISH it with guide §11 « Publish a lesson » (status
   available, durationMinutes ≤ 90, lesson index regenerated, export/import, commit, fast-forward dev, push origin dev)
   and give me its URL before starting the next lesson. If the entry budget fails, find the leak with
   `node scripts/analyze-entry-bundle.mjs --chain <module>` — never raise the budget to make a lesson pass.
5. If it completes its unit, generate and publish the unit's synthesis « أدمج تعلّماتي » (unit-1 9-module format,
   with ALL its Module<NN> files — registry.test.js fails on a declared module without a route).
PHP tests on MySQL (phpunit.local.xml), one run at a time. Follow the documentation synchronization rule.
End with a short progress report appended to docs/reports/MOYEN_ROLLOUT_PROGRESS.md and the same prompt for the
next batch.
```
