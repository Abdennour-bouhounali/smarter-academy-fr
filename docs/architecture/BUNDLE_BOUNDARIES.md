# Bundle boundaries — what each visitor downloads, and when

> **Authoritative** for: what goes in the entry bundle, where lazy
> boundaries sit, how a lesson / the Math Lab / the notebook are loaded, which
> i18n namespaces are on demand, and the rules that keep the entry small.
> Established 2026-09-25 (performance & architecture pass). Code is the source
> of truth; this file describes it.

> **Status (2026-11-22).** Imported from the Algerian platform (DZ `dev` `7f4cef1c`) on 2026-11-22. True here: the
> loading ladder, the boundaries of §3 that name an existing file, the rules of §4, the budget (212 KB gzip; entry
> measured 192.2 KB on 2026-11-22 after the legacy lesson systems and the unused exports were deleted, commit `4511da19`). Not true here: no lesson exists, so the
> lesson rows describe a path no lesson uses yet; the legacy lab strings (`lesson.manipulation.json`), the module pages,
> `_unit/` and the old knowledge map are DELETED and their rows are cut. §5 and §9 are dated measurements of the
> Algerian app (its 74 lessons), kept as history.

## 1. The principle

Rich lessons are allowed to be rich. **Their cost is paid when a learner opens
them, not before.** A visitor on `/` must not download the admin panel, the
Math Lab's fourteen instruments, KaTeX, or any lesson's modules.

The reference stress test was a self-contained fractions lesson
(`lab_fractions_1am.html`: five visual representations, a slider lab, a
10-question quiz, print layout) — **20 KB raw, ~5 KB gzip, ~200 DOM nodes, no
dependency**. Before this pass the entry chunk alone was ~130× that. Rich
content was never the cost; *coupling* was.

## 2. The loading ladder

```text
index.html
  └─ entry chunk (index-*.js)           shell: React, router, i18n (eager namespaces),
     │                                  auth/context providers, layouts, landing page,
     │                                  login/register, the grade summary (NOT the catalogue, §3), the LESSON INDEX
     │                                  (lessonIndex.generated.json, ≈ 20 B gzip per lesson)
     ├─ lessonLoaders chunk             the two lazy globs (config + routes.jsx per lesson)
     │    └─ a lesson's routes chunk    its routes.jsx + lesson.config.js, loaded by the
     │                                  lesson route boundary when its URL is opened
     ├─ a lesson's GAME WORLD (v2)      asked for WITH its routes, not after them (`lessons/worldPreload.js`, 2026-11-21):
     │                                  the world's code + three.js + KaTeX (≈ 400 KB gzip, shared by a unit's lessons)
     │                                  and the lesson's content (≈ 12 KB) — §3 « World preload »
     ├─ page chunks (lazy routes)       every student / teacher / admin / legal page
     ├─ admin.json / teacher.json       the strings of the admin panel and of the teacher space, each requested
     │                                  TOGETHER with its layout chunk (`preloadNamespace`, since 2026-11-17)
     │    StudentHome, MesCours, Explorer, Progression, Notebook, Profil, ChooseGrade,
     │    Courses, UnitPage, practice, diagnostic, Math Lab pages, TeacherLayout, …
     ├─ lesson runtime (lessonRuntime-*) shared by ALL lessons: access gate,
     │    notebook anchor, return-to-lesson button
     │    └─ lesson page chunk          index.jsx of THAT lesson (its home: the world, or the teacher's card)
     ├─ MathLabOverlay chunk            the tool picker laid over a lesson
     │    └─ tool chunk                 one per instrument (three.js, mafs+MathLive,
     │                                  Excalidraw, Nerdamer stay in their tool's chunk)
     ├─ NotebookWindow chunk            the كرّاسي window (editor, KaTeX)
     └─ mathlab.json namespace          Math Lab UI strings (~250 KB JSON)
```

Nothing below a line is fetched until the level above needs it.

## 3. The boundaries and why each exists

| Boundary | Where | What it keeps out of the entry | Prefetch |
|---|---|---|---|
| Lazy route pages | `App.jsx` (`lazy(() => import(...))`), `CourseLayout.jsx` (`TeacherLayout`) | every page except the landing `Home`, `Login`, `Register` — including the join-link page `JoinClassLink` (2026-10-01). Because `Login`/`Register` are eager, the pending-join helper they read (`features/classJoin/pendingClassJoin.js`, ≈2.1 KB gzip as commented source, less minified) and `components/auth/ClassJoinNotice.jsx` (≈0.5 KB) are in the entry; keep that helper dependency-free | — |
| Layout `<Suspense>` | `StudentLayout`, `MainLayout` around `<Outlet/>` | — (UX: the sidebar/navbar stay on screen while a page chunk arrives) | — |
| Books store (2026-10-17) | `App.jsx`: `features/books/BooksPage`, `BookDetailPage` and `pages/admin/books/*` are `lazy()` pages; their Arabic strings live in `features/books/strings.js` (a local module in the lazy chunk, NOT an i18n namespace) | the whole storefront and its admin screens. Only the nav label `books` (`nav.json`), the admin nav keys (`admin.json › nav.books*`) and `features/books/bookCache.js` (≈ 0.5 KB, apiClient only — it starts a book page's data request inside the route's `lazy()`, BOOKS_STORE.md §4) are eager | a book card prefetches the detail page's chunk and data on hover / focus |
| Lesson index (2026-10-14) | `lessons/registry.js` reads `lessons/lessonIndex.generated.json` (generated by `scripts/generate-lesson-index.mjs`, `npm run check:lesson-index` in `check:lessons` and CI): id, level, grade, chapter, `[number, slug]` per module and, since 2026-11-17, the FLAGS of the lesson's pack (`pack: { phone?, world?, knowledge?, coach?, board? }`, read from its `lesson.pack.js` — `LESSON_V2.md` §1) — what SYNCHRONOUS callers need (`isLessonBuilt`, `getTotalModules`, `getFirstModuleNumber`, `getModulePath`, `getLessonBasePath`, `lessonPackFlags`, `lessonsWithPack`). The pack itself is `loadLessonPack(id)` (a third literal glob of `lessonLoaders.js`, `PACK_LOADERS`) and ONE of its parts `lessons/lessonPack.js › loadPackPart` / `usePackPart` — never in the entry. The full config is `loadLessonConfig(id)` / `useLessonConfig(id)` (UnitPage resources, module chips, مذكرة الدرس), or `getLoadedLessonConfig(id)` on the lesson's own pages, where `buildLessonRoutes` has registered it | every `lesson.config.js` (was an EAGER glob: 775 KB rendered, ≈ 129 KB gzip with 74 lessons). Only active grades are indexed or globbed (`lessons/lessonLoaders.js`, literals guarded by `registry.test.js`) | — |
| Lesson route boundary (2026-10-14) | `App.jsx › AppRoutes` mounts `useLessonRoutes()` (`lessons/lessonRouteBoundary.jsx`): per index entry, a `<basePath>/*` route whose element (under its own `<Suspense>`) loads the lesson's `routes.jsx` through `lessonLoaders.js`, then the lesson's REAL routes (`buildLessonRoutes` of `lessons/common/lessonRoutes.jsx`) replace it. `check:routes` checks the boundary is mounted under `RequireAccount` and that no `routes.jsx` is imported statically | every lesson's `routes.jsx` (none exists today) | `usePrefetchLessonRuntime` (pages that list lessons) also requests `lessonLoaders.js` |
| Practice level counts (2026-10-17) | `features/practice/practiceCounts.js` reads `virtual:practice-level-counts` (plugin `practiceLevelCounts`, `vite.config.js`), computed at build time from `content/practice/index.generated.json` | `practiceContent.js` (the full index, 183 KB JSON, + the glob table of ≈ 4,200 exercises: an 80 KB gzip chunk) from every lesson INDEX — `PracticeEntryCard` and `teacherBank.js` only need the counts. `practiceContent.js` re-exports `levelCounts` for the pages that also load exercises | — |
| Lesson intent prefetch (2026-10-17) | `lessons/lessonRouteBoundary.jsx` › `installIntentPrefetch` (one delegated `pointerover` / `touchstart` / `focusin` listener, installed by `useLessonRoutes`) | — (a prefetch, not a boundary): hovering, touching or focusing ANY link into a lesson calls `loadLessonRoutes(id)` (`lessonIdForPath`), which also starts the lesson runtime in parallel with the routes chunk | on intent |
| World preload (2026-11-21) | `lessons/worldPreload.js` › `preloadWorld(lessonId)` / `preloadWorldCode` / `loadWorld` / `loadWorldContent`; the worlds' table of `() => import()` is `gameworld/worlds.js` | not a boundary — it FLATTENS a chain. A v2 lesson's world (≈ 400 KB gzip) used to be discovered at the end of five serial downloads (entry → loaders → routes + runtime → lesson home → world shell → world). The pack flags are in the entry, so the world is asked for by whoever knows a STUDENT is coming: the route boundary when the lesson's URL opens (`LessonRoutesLoader`, also for a teacher's `?apercu=eleve`), a link he points at (`loadLessonRoutes`, behind `viewerPlaysWorlds` — never for a teacher, whose lesson home is his card), and the unit page at rest (`lessonRuntimeLoader › usePrefetchWorlds`, the world's code only). `LessonGameWorld` reads the same memoised promises; a failed one is forgotten. Measured in dev (2026-11-21): the world's code is requested at ≈ 0.5 s, before the lesson's `routes.jsx`. In the ENTRY because the boundary shows it: `LessonWaiting.jsx`, `gameworld/WorldLoading.jsx` + `worldLoading.css` (React and a style sheet), `worldPreload.js`, `worlds.js` | on intent, on open, at rest on the unit page |
| Core barrel (2026-10-14) | `packages/core/index.js` does not re-export `arithmetic/*`, `practice/`, `curriculum/manipulationTypes.js`, `curriculum/manipulationLevels.js`; they are imported by path (`import … from '@smarter-academy/core/arithmetic/divisibility.js'`; `arithmetic/` holds ONE module today, `divisibility.js` — `divmod`, `differenceSteps`, `euclidSteps`, `gcd`, `isIrreducible`; the 39 others were deleted on 2026-11-22 and remain in the Algerian repository). `packages/core/barrel.test.js` guards it | ≈ 18 KB gzip of unit maths and registries whose top-level data Rollup cannot drop | — |
| Lesson runtime | `lessons/common/lessonRuntime.jsx` (`LessonPageFrame`), loaded by `lessons/common/lessonRoutes.jsx` through `lessonRuntimeLoader.js › loadLessonRuntimeCore` | access gate, notebook anchor, return-to-lesson button | idle prefetch from `UnitPage`, `StudentHome`, `MesCours` (`usePrefetchLessonRuntime`) |
| Math Lab overlay | `MathLabOverlayProvider.jsx` lazy-loads `MathLabOverlay.jsx` | tool registry → every instrument's state & math engine (~700 KB source) | `MathLabEntryButton` on pointer-enter / focus (`preloadMathLabOverlay`) |
| Notebook window | `NotebookProvider.jsx` lazy-loads `NotebookWindow.jsx` | editor, KaTeX (~580 KB source), framer-motion use of the window | idle prefetch the first time a page publishes its position (`setLocation`) |
| `mathlab` i18n namespace | `i18n/index.js` `onDemandBackend` | ~250 KB of JSON | loaded by the first `useTranslation('mathlab')` |
| `challenge` i18n namespace (2026-09-25) | `i18n/index.js` `onDemandBackend` | the daily challenge's screens (≈ 17 KB JSON, 3.8 KB gzip chunk) | read only by the lazy challenge pages, the class tab `DailyChallengeTab` (lazy, own `<Suspense>` in `ClassGroupDetail`) and `ChallengeDisplayPage` (own `<Suspense>`); the home card lives in `student`, the admin screen in `admin`, the nav labels in `nav` — those few strings (~2 KB gzip) are the feature's whole cost in the entry |
| `madar` i18n namespace + the game (2026-10-22) | `i18n/index.js` `onDemandBackend`; `App.jsx` lazy `MadarPage` (`/espace/madar`, outside `StudentLayout`) and `TeacherMadarDisplay`; `ClassGroupDetail` lazy `MadarTab` under its own `<Suspense>` | the whole game — engine, canvas renderer, synthesized audio, screens (`MadarPage` ≈ 70 KB raw) — and its strings (`madar` ≈ 6 KB chunk) | read only by those lazy chunks; the entry carries the nav labels (`nav.madar*`), the tab label (`teacher.classes.tabs.madar`) and `common.apiErrors.madar`. Measured after: entry 326.2 KB gzip (budget 330). `MADAR_GAME.md` §12 |
| `thinking` i18n namespace + « مختبر التفكير » (2026-11-01) | `i18n/index.js` `onDemandBackend`; `App.jsx` lazy `ThinkingLadderPage`, `ThinkingChallengePage`, `ThinkingNumberPage` (`/espace/enigmes*`, inside `StudentLayout` + `RequireLargeScreen`); `features/thinkingLab/figures/index.js` lazy `import.meta.glob` (one chunk per figure); MathLive through the existing `exam/math/lazy.jsx` | the screens, the replay player, the 15 SVG figures and the strings | read only by those lazy chunks; the entry carries `nav.thinkingLab*` and `common.apiErrors.thinkingLab`. `packages/core/thinkingLab/*` is imported by path and `content/thinking-lab/` never by the web (`serverOnly.test.js`). Measured after: entry 237.8 KB gzip (budget 245), `--chain features/thinkingLab` finds no path. `THINKING_LAB.md` §2 |
| `compass` i18n namespace + « بوصلتي » (2026-11-09) | `i18n/index.js` `onDemandBackend`; `App.jsx` lazy `CompassPage` (`/espace/boussole`, inside `StudentLayout` + `RequireLargeScreen`) | the check player, the report, the week v0, the strings, and — by path — `curriculum/fr/calendar/schoolCalendar.js`, `compass/{scope,engine}.js` and the learning net | the home page imports ONLY `services/compassService.js` and lazy-loads `features/home/compass/CompassHomeSections.jsx` (calendar + net, shared `compassModel` chunk with `CompassPage`), strings `student.compassHome`; API errors read `common.apiErrors.compass`. `content/compass/index.generated.json` is read by the SERVER only. Measured after the home (2026-11-09): entry 240.5 KB gzip (budget 245; +0.9 KB = the `student.compassHome` strings), the calendar data lives only in the lazy `compassModel` chunk. `YEAR_COMPASS.md` §9 |
| `idara` i18n namespace + the school space (2026-10-26) | `i18n/index.js` `onDemandBackend`; `App.jsx` lazy `SchoolLayout`, `SchoolHome`, `SchoolClassrooms`, `SchoolTeachers`, `SchoolStudents`, `SchoolSettings` (`/etablissement/*`), the teacher's `TeacherSchoolPage`, `TeacherSchoolJoin` (`/enseignant/etablissement*`, strings in `idara › teacher.*`) and the admin's `AdminSchoolList`, `AdminSchoolDetail` (`/admin/etablissements*`) | the director's and the teacher's school pages, the roster import, the cards and their strings | the ENTRY carries `common.apiErrors.idara`, `nav.mySchool`, `student.json › qism.sharing.school` and `qism.schoolConsent.*` (« قسمي » is bundled), `admin.json › schools` and `nav.schools` (the `admin` namespace is bundled). Measured: entry 235.1 KB gzip after phase 6 (budget 245); the reports, the print stylesheet and the meeting view are lazy. `SCHOOL_ADMIN_SPACE.md` |
| `family` i18n namespace + parent pages (2026-10-22, link model 2026-10-23) | `i18n/index.js` `onDemandBackend`; `App.jsx` lazy `ParentLinkPage` (`/p/:token`), `ParentLayout`, `ParentHome`, `ParentChildReport`, `DeviceGuidePage` (`/parent/*`, `/protection`) and `StudentParentView`; `Profil.jsx` lazy `ParentLinkCard`, and `MembersTab.jsx` lazy `ParentCardsDialog`, each under its own `<Suspense>`; `features/family/QrCode.jsx` + `qrcode-generator` (its own chunk, pulled only by the card and the dialog) | the parent link page, the week report, the progress tab, the device guide, the QR and their strings | the ENTRY carries `features/studyTime/StudyTimeTracker` + `studyClock.js` (mounted under the router for every student page) and three keys (`common.apiErrors.family`, `marketing.footer.deviceGuide`, `teacher.students.parentCards.open`). Measured: entry 326.5 → 328.1 KB gzip (budget 330). `PARENT_SPACE.md` |
| `memo` i18n namespace + lesson-content glob (2026-09-29) | `i18n/index.js` `onDemandBackend`; `features/teacher/lessonMemo/loadLessonMemoSources.js` (**lazy** `import.meta.glob`, scoped to `lessons/college/*/**/knowledge.jsx` and `…/content/*.js`) | the « مذكرة الدرس » page (`LessonMemoPage` ≈ 13 KB gzip, `memo` ≈ 4.7 KB gzip) and every lesson's content modules | read only by `LessonMemoPage` under its own `<Suspense>`; only the opened lesson's content is fetched, and those files are the same chunks its modules already use. The card buttons' labels live in `teacher`; entry cost of the whole feature (pointer, search, memo route, keys) measured at +0.7 KB gzip (233.74 → 234.44 KB) |
| `admin` and `teacher` i18n namespaces (2026-11-17) — **OUT of the entry** | `i18n/index.js › ON_DEMAND_NAMESPACES`. `App.jsx` (and `CourseLayout.jsx` for the teacher) call `preloadNamespace('<ns>')` INSIDE the `lazy()` of `AdminLayout` / `TeacherLayout`, so the strings travel in parallel with the layout chunk (rule 11) and the layout suspends once under the root `<Suspense>`. Who may read them is a closed list held by `i18n/onDemandNamespaces.test.js`: `admin` → `pages/admin/`, `components/admin/`; `teacher` → `pages/teacher/`, `features/teacher/`, `components/teacher/` and two components rendered FOR a teacher elsewhere (`TeacherPracticeEntry` inside `PracticeEntryCard.jsx`, and `PracticeHub`, which declares the namespace only when `isTeacher`). **The shared primitives of `components/admin/ui/` (`Modal`, `FilterBar` / `Pagination`, `DataTable`, `states`) read `common › ui.*`**, which ships with the application: a dialog opened in the teacher space, the school space or « قسمي » never suspends. Tests get both namespaces from `src/test/setupOnDemandStrings.js` | `admin.json` (≈ 21.9 KB gzip) and `teacher.json` (≈ 11.1 KB gzip): a visitor and a student no longer download either (checked in the browser: no request for them on `/`, `/espace`, a lesson, « قسمي »). Measured: entry **240.8 → 210.3 KB gzip**. Rows above that say a key of `teacher` or `admin` is « in the entry » were written before this row: those keys now travel with their namespace | with the layout chunk |
| framer-motion in the shell (2026-11-17) | `main.jsx` mounts `<LazyMotion features={domAnimation}>` (synchronous features: nothing waits, nothing starts invisible) and the shell files animate with **`m`**, not `motion` (`Navbar`, `Footer`, `BackgroundLayer`, `Hero`, `MethodTeaser`, `TrustRelevanceSection`, `FreePremiumTeaser`, `SmarterEverydaySection`, `CtaBanner`, `AuthShell`). `entryGraph.test.js` follows the static imports from `main.jsx` and fails when an eager file imports `motion`. Lazy pages keep `motion` (it works inside `LazyMotion`) | the animated layout engine and the drag gestures of framer-motion (`projection/`, `gestures/drag/`: 353.5 → 232.2 KB rendered). None of the shell files uses `layout`, `layoutId` or `drag`; one that needs them is not a shell file. Measured: entry **210.3 → 199.2 KB gzip** | — |
| KaTeX for catalogue text (2026-10-02) | `lessons/common/components/MathLabel.jsx` → `React.lazy(() => import('./MathText'))` | KaTeX from the pages that show catalogue text (cards, progression, dashboards, unit page): fetched only when a string carries a `$…$` formula; until then `utils/mathPlain.js` (no dependency) shows it as Unicode. Verified: the entry chunk holds only the chunk names in its dep map | — |
| Report screenshot capture (2026-10-05) | `features/reports/screenshot.js` → `await import('html-to-image')` inside `captureRegion()` (snipping tool) | `html-to-image` (≈ 13 KB minified chunk) — only reviewers (admin, ambassador) see the report button | requested when a region (or « الشاشة كاملة ») is captured, never before; pre-bundled in dev by `optimizeDeps.include`. Verified in the build: `skipFonts` (an html-to-image string) is absent from the entry chunk |
| Photo answers + teacher review (2026-10-06, every BEM exam-sheet lesson) | lazy routes `TeacherReviewsPage` (`/enseignant/corrections`, with `AnnotationEditor`) and `AnswerReviewPage` (`/espace/corrections/:id`); the picker and gallery live in the `PracticeSession` chunk | the review queue, the canvas annotation editor and the read-only correction page | — . In the ENTRY, because `StudentLayout` is eager: `NotificationBell.jsx` + `notificationService.js` (React, lucide and `apiRequest` only, no new dependency; ≈1 KB gzip) and the `nav.notifications.*` keys. Keep the bell dependency-free |
| Page tours « جولة تعريفية » (2026-10-07) | `features/tours/PageTourProvider.jsx` → `React.lazy(() => import('./TourOverlay'))`; `tour` namespace in `i18n/index.js` `onDemandBackend` | the card, spotlight and keyboard handling (`TourOverlay` chunk) and every tour text (`tour` chunk) | fetched when a page's tour opens (first visit or « جولة في الصفحة »). In the ENTRY, because `StudentLayout` is eager: the provider, the pure model, the registry (keys and selectors only), `tourService.js`, `TourReplayButton` and `nav.tourReplay`, with no new dependency. `PAGE_TOURS.md` §3 |
| Learning net resolver (2026-10-13; dynamic since 2026-10-14) | `features/learning/EarlierYearReview.jsx` (`import()` on the first wrong answer, practice and lesson final test) | `learningNet.js` + `official_programme_college.json` + `learning_net_college.json` — its own chunk `learningNet-*.js` (≈ 80 KB). **Never import it from the barrel, a layout, a provider or an eager page** (`LEARNING_NET.md` §2) | — |
| The catalogue, all four grades (2026-10-26) — **OUT of the entry** | `utils/gradeSummary.js` reads `virtual:grade-summary` (plugin `gradeSummary`, `vite.config.js`): `getAllGrades()`, the landing page's grade chips and the published-lesson count, computed at build by the catalogue itself (a child Node process; the catalogue files are watched) — ≈ 0.4 KB. `StudentLayout`, `StudentNavbar` and `TrustRelevanceSection` use it. `Home.jsx` mounts `StudentHomeBanner` (resume lesson = full catalogue) as a `lazy()` only for `role === 'student'`. `packages/core/package.json` has `"sideEffects": false` and `coursesData.js` marks its top-level builders pure, so a barrel import that uses no catalogue name (`hasRequiredRole`, `ACTIVE_GRADE_IDS`, `getFlatAvailableLessons`…) no longer drags the JSON in | `coursesData.js` + `lessons_/units_/programme_<grade>_2026_2027.json` (≈ 95 KB gzip in the Algerian app with its catalogue; the French files are empty skeletons today): now the shared chunk `coursesData-*.js`, fetched in parallel with the first page that reads `courseLevels` / `getLessonById` / `getUnitById` (every student, teacher and admin page that shows lessons). Measured: entry **329.7 → 233.1 KB gzip** (1,293 → 802 KB raw, −96.6 KB). **Rule: no module of the entry graph imports a catalogue name** (find the culprit with `--chain packages/core/curriculum/coursesData.js`; the budget is now 245) | on demand |
| KaTeX dedupe | `vite.config.js` `resolve.dedupe: ['katex']` | a **second** KaTeX copy (react-katex/mafs nested 0.16) | — |

## 4. Rules (for every future change)

1. **A provider mounted above the router imports nothing heavy statically.**
   `App.jsx` providers (`NotebookProvider`, `MathLabOverlayProvider`, …) are in
   the entry by definition. Anything they render only on a user gesture is a
   `lazy()` component behind a `<Suspense>`, with a prefetch on intent.
2. **A route page is `lazy()`** unless it is the landing page or the auth
   pages. Its layout provides the `<Suspense>` boundary.
3. **`import.meta.glob` never sweeps `./**`** over lesson content, and is never
   `eager` over lesson content in eager code. Globs are literals: scope them to
   what is active, and guard the literal with a test (`registry.test.js`
   « build-time glob scope »).
4. **A lesson's shared wrapper code lives in the lesson runtime**, not in the
   route factory. Route factories are loaded with each lesson but shared by all.
   **No lesson file is imported by eager code**: `App.jsx` reaches lessons only
   through the route boundary, and eager code asks the registry (index) —
   never a `lesson.config.js`.
5. **An on-demand i18n namespace is read only under a `<Suspense>` boundary**
   and never by a shared component. `admin` and `teacher` are on demand since
   2026-11-17 (§3): the UI primitives that teacher pages and « قسمي » also
   render (`Modal`, `DataTable`, `FilterBar`, `states`) read `common › ui.*`,
   which is eager — a dialog that suspended on open would blank the page.
   A component rendered FOR one role inside a shared page reads that role's
   namespace in its OWN component, mounted only for that role
   (`TeacherPracticeEntry`), and joins the list of `onDemandNamespaces.test.js`.
   `t(key, { ns })` does NOT load a namespace: declare it in `useTranslation`.
   A string needed on a lesson page lives in `lesson`, not `mathlab`
   (`mathLabEntry.*`).
6. **Heavy engines stay behind their feature**: three.js, Excalidraw, mafs +
   MathLive, Nerdamer (via its facade) are only imported from their Math Lab
   tool or lesson module. One more MathLive importer since 2026-10-06: the
   practice EXAM SHEET (`features/practice/exam/math/`). It is reached only
   through `exam/math/lazy.jsx` (`React.lazy`), so MathLive loads with the
   first exam sheet and never enters the practice or entry chunks.
   A game world imports three.js inside its own chunk (`gameworld/worlds.js`,
   reached through `worldPreload.js`), never from the entry. The static figures
   (`lessons/common/components/SpaceFigure.jsx`) are SVG and import no engine.
7. **Data built by function calls at module top level is kept even when
   unused** (Rollup cannot prove the calls pure). Annotate with
   `/* @__PURE__ */` or move it out of product modules.
8. **Measure, don't guess**: before/after with the method in §6.
9. **The core barrel holds only what eager code needs.** A module whose top
   level computes data (unit maths, registries) is imported by path, never
   re-exported (`packages/core/barrel.test.js`). The thinking lab's pure logic
   `packages/core/thinkingLab/*` (2026-10-30, `THINKING_LAB.md` §2) follows this rule: it is imported by path,
   and no entry module imports it. Its content index `content/thinking-lab/index.generated.json` holds the
   answers, so no web module may import it at all.
10. **The entry has a budget: 212 KB gzip** (330 until 2026-10-26; 245 until 2026-11-17, when the entry had filled it again at 240.8 KB; lowered to 212 after `admin` / `teacher` and the heavy half of framer-motion left the entry, measured 199.2 KB, so they cannot silently come back — never raise it). `npm run check:entry-budget` (in `check:lessons`, own
    analysis build) and CI (`analyze-entry-bundle.mjs --dist apps/web/dist
    --budget 212`, after « Build ») fail above it. Find the leak with
    `--chain`; raise the budget only for a deliberate, measured, documented
    entry cost (a row in §3).
11. **A page waits only for what it renders, and nothing waits in series** (2026-10-17, §9). Start a page's data
    in the route's `lazy()` (like `bookCache.js`), preload a lazy child that sits under another suspending
    boundary (`Component.preload()`, like `LessonPageFrame`), never gate a request on the `user` OBJECT (key
    effects on `user?.id`: `/auth/me` replaces the object), and never put a large prefetch where it competes with
    the page that is still loading (start it after the page is shown).
12. **A suspense fallback inside a layout is `min-h-screen`** so the footer stays below the fold until the page
    arrives; a page's loading state is a skeleton of its final shape; an image whose size is unknown sits in a box of
    fixed height. (Algerian rule while the interface is Arabic: Arabic text does not use `font-mono`, JetBrains Mono has
    no Arabic glyph.)
13. **No lazy boundary a student or a teacher waits behind is `fallback={null}` or a blank page** (owner, 2026-11-21:
    « the user never feels: is there a problem with my laptop or my internet »). Toward a game world, every boundary
    shows the SAME screen (`lessons/LessonWaiting` → `gameworld/WorldLoading`, `GAME_WORLD.md` §1bis); on the teacher's
    side, a skeleton of `features/classSession/TeacherSkeletons.jsx`. A wait that lasts is named calmly (slow network,
    lost connection), never left as a frozen screen.

## 5. Measured result (2026-09-25)

Production build, `vite build`, sizes of the files the browser needs before
first render (entry + its static imports).

| Metric | Before | After | Change |
|---|---:|---:|---:|
| Initial JS raw | 2,611 KB | 768 KB | −71% |
| Initial JS gzip | 674 KB | 224 KB | −67% |
| Initial JS brotli | 535 KB | 187 KB | −65% |
| Initial CSS raw | 194 KB | 117 KB | −40% (French-only Tailwind classes gone with the lessons) |
| Initial CSS gzip | 30.5 KB | 18.4 KB | −40% |
| Rendered source in entry | 4,538 KB | ~1,196 KB | −74% |
| KaTeX copies shipped | 2 | 1 | — |
| JS chunks (total) | 507 | 564 | +57 |

What was in the entry before, and why:

| Source | Size in entry | Chain |
|---|---:|---|
| 132 French `lesson.config.js` | 1,130 KB | `App → Courses → registry.js` glob `./**` (filtered at runtime) |
| Math Lab (14 tools' state + engines) | 704 KB | `App → MathLabOverlayProvider → MathLabOverlay → toolRegistry` |
| KaTeX | 586 KB | `App → Notebook page / NotebookProvider → NotebookWindow → noteContent` |
| i18n `mathlab.json` | ~250 KB | `i18n/index.js` static import |
| French reference catalogue + JSON | ~255 KB | `packages/core` barrel → `coursesData.js` |
| Practice / progression / student pages | ~300 KB | static page imports in `App.jsx` |
| Lesson runtime (classroom, knowledge) | ~80 KB | `App → lesson routes.jsx → _unit/lessonRoutes.jsx` |
| Teacher layout | small | `App → CourseLayout → TeacherLayout` |

Browser measurements (Playwright, cold cache, mid-range phone profile:
4× CPU throttle, 1.6 Mbps / 150 ms RTT, 412×915): see §5.1.

### 5.1 Per-route (median of 3 cold runs, 2026-09-25)

Playwright, cold cache, mid-range phone profile (4× CPU throttle,
1.6 Mbps / 150 ms RTT, 412×915, gzip transfer). *Ready* = the route's main
content is visible. JS/CSS = compressed bytes transferred until network idle.
84 loads, 0 render failures, 0 console errors; RTL + Arabic on every route.

| Route | Ready (ms) | LCP (ms) | JS KB | CSS KB | JS requests | Script (ms) | JS heap (MB) |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/` landing | 5158 → 2325 | 5380 → 2664 | 758 → 318 | 35.5 → 23.3 | 3 → 4 | 739 → 527 | 16.3 → 10.1 |
| `/login` | 5135 → 2178 | 5112 → 2464 | 677 → 225 | 33.3 → 21.1 | 1 → 1 | 472 → 297 | 11.3 → 9.5 |
| `/courses` | 5141 → 2566 | 4868 → 2292 | 677 → 234 | 33.3 → 21.1 | 1 → 6 | 572 → 407 | 12.1 → 9.5 |
| unit page | 5294 → 2607 | 4920 → 2488 | 677 → 254 | 33.3 → 26.6 | 1 → 22 | 602 → 470 | 14.5 → 9.5 |
| `/espace` | 5137 → 3076 | 5348 → 2820 | 677 → 268 | 33.3 → 26.6 | 1 → 31 | 548 → 428 | 12.1 → 9.5 |
| `/espace/cours` | 5145 → 2568 | 4984 → 2280 | 677 → 250 | 33.3 → 26.6 | 1 → 19 | 469 → 328 | 11.3 → 9.5 |
| `/espace/progression` | 5167 → 3193 | 5504 → 3168 | 677 → 257 | 33.3 → 21.1 | 1 → 18 | 642 → 483 | 14.5 → 9.5 |
| `/espace/cahier` | 5142 → 4094 | 5232 → 3848 | 677 → 346 | 33.3 → 27.8 | 1 → 32 | 516 → 391 | 12.1 → 9.5 |
| lesson index (اختزال كسر) | 7154 → 4542 | 6744 → 4492 | 788 → 379 | 41.5 → 34.8 | 16 → 48 | 628 → 491 | 13.6 → 9.5 |
| lesson module (اختزال كسر / samir) | 5149 → 2048 | 7280 → 5216 | 826 → 424 | 41.5 → 34.8 | 34 → 73 | 821 → 659 | 15.4 → 12.1 |
| `/espace/atelier` | 5632 → 4795 | 5372 → 4296 | 699 → 390 | 36.2 → 29.2 | 7 → 22 | 697 → 535 | 15.4 → 10.1 |
| Number Lab | 5630 → 4595 | 6216 → 5216 | 736 → 510 | 42.5 → 35.5 | 16 → 39 | 575 → 459 | 12.8 → 10.7 |
| `/enseignant` | 5629 → 3060 | 5564 → 2912 | 685 → 238 | 33.3 → 21.1 | 8 → 13 | 514 → 358 | 12.1 → 9.5 |
| `/admin` | 5660 → 3046 | 5648 → 3028 | 697 → 250 | 33.3 → 21.1 | 17 → 24 | 485 → 328 | 12.1 → 9.5 |

On the lesson module page, in all three runs: the « المختبر » pill opens the
overlay (Arabic picker, no raw i18n key) and Escape closes it; « كرّاسي »
opens the notebook window; KaTeX renders. JS request counts rose (lazy
chunks), but Vite modulepreloads each lazy chunk's dependencies in parallel,
so the added cost is about one round-trip per lazy level, not per file.

### Entry drift, investigated 2026-10-14 — 224 → 576 KB gzip, then 629 KB with 1AM–3AM

`origin/dev` (ccd83600) shipped ONE initial script of 2,532 KB raw / 576.5 KB gzip, against 768 / 224 KB on
2026-09-25; the 1AM–3AM catalogue (phase 2) brought it to 2,803 / 629.2 KB. Measured with
`node scripts/analyze-entry-bundle.mjs` (§6). Contributors, gzip estimated per area from the sources:

| Contributor | 2026-09-25 → 2026-10-14 | Why it is in the entry |
|---|---|---|
| The lessons' `lesson.config.js` + `routes.jsx` (9 → 74 lessons; 775 + 122 KB rendered) | 11 → 191 KB | `App.jsx` imports every lesson's `routes.jsx` STATICALLY (74 imports), and each imports its config; `lessons/registry.js` also globs every config **eagerly** |
| `lesson.json` › `manipulation` — the strings of every lab (368 KB raw) | 13.6 → 145 KB (whole `lesson` namespace) | `lesson` is an eager namespace (`i18n/index.js`); every new lab adds its strings under `lesson.manipulation.<type>` |
| The catalogue JSON, 4AM | 7 → 41 KB | `coursesData` (barrel) — by design |
| The catalogue JSON, 1AM–3AM | 0 → ≈ 55 KB | idem (phase 2) |
| Unit maths and manipulation registries via the core barrel (`arithmetic/rotation.js`, `vectors.js`, `trigonometry.js`, `linear.js` …, `manipulationTypes.js`, `manipulationLevels.js`) | ≈ 9 → ≈ 45 KB | `StudentLayout` → `packages/core/index.js` re-exports every unit's exact-math module |
| framer-motion | ≈ 100 KB, unchanged | accepted (§7) |

**The rule that broke:** the lesson content was lazy in 2026-09 (§2), but two eager paths grew with every lesson — a
static route import per lesson and lab strings in an eager namespace — so each published lesson now costs every
visitor ≈ 4.5 KB gzip. **Phase 3 (196 lessons) would add ≈ 0.9 MB gzip.** The recommended fix: one lazy lesson-route boundary, a light
generated lesson index instead of the eager config glob, `lesson.manipulation` on demand, unit maths out of the
barrel, and an entry budget gate — **applied the same day, see the next section.**

The same day `vite build` hit the 4 GB heap of `npm run build` at « computing gzip size » (≈ 2,000 chunks).
`vite.config.js` now sets `build.reportCompressedSize: false` (peak RSS 5.7 → 4.5 GB): measure sizes with §6, not
with Vite's console table.

### Entry fix, 2026-10-14 — 629.2 → 322.1 KB gzip

The fix recommended above, applied before phase 3 (report `docs/reports/BUNDLE_ENTRY_REPORT_2026-10-14.md`). Each
row is a measured build (`analyze-entry-bundle.mjs`; rows 1–2 measured as variants re-injecting the later steps'
eager paths):

| State | Initial JS raw | gzip | Δ gzip |
|---|---:|---:|---:|
| Baseline (`dev` 01c4c7b8) | 2,803.3 KB | 629.2 KB | — |
| 1. One lazy lesson-route boundary (74 static `routes.jsx` imports removed) | 2,542.2 KB | 601.3 KB | −27.9 |
| 2. Generated lesson index; configs loaded with the lesson | 1,818.6 KB | 472.0 KB | −129.3 |
| 3. `lesson.manipulation` strings on demand | 1,283.1 KB | 339.8 KB | −132.2 |
| 4. Unit maths / manipulation registries / practice out of the core barrel | 1,231.9 KB | 322.1 KB | −17.7 |

A published lesson now costs the entry ONE line of the index (≈ 20 bytes gzip) instead of ≈ 4.5 KB; phase 3's 196
lessons ≈ +4 KB instead of ≈ +0.9 MB. What remains is the shell: framer-motion (§7), the catalogue JSON of four grades
(≈ 95 KB gzip, synchronous by design — the next candidate if the budget must come down), the eager i18n namespaces
(`admin`, `student`, `teacher`, `marketing` …), React, React Router, i18next.

### Entry fix, 2026-10-26 — 329.7 → 233.1 KB gzip (catalogue out of the entry)

The entry had reached 329.7 of 330 KB and grew ≈ 0.2–0.3 KB with every published 1AM–3AM lesson (≈ 150 more to come).
`--chain` showed the whole catalogue (four grades' lessons / units / programme JSON, ≈ 95 KB gzip, 1,293 KB raw
entry) was pulled by `StudentLayout → core barrel → coursesData.js`, for three tiny answers. Fix: the virtual module
`virtual:grade-summary` for those answers, a lazy `StudentHomeBanner` (students only), and tree-shaking of the barrel
(`sideEffects: false`, pure annotations in `coursesData.js`; without the former the JSON modules stayed because
`JSON.parse(...)` is a top-level call). No behaviour change; the catalogue is now a shared lazy chunk. Gates: `npm test`,
`check:lessons`, `npm run build`; smoke on a dev server (landing, a student's `/espace`, `/courses`, a lesson index).

### Entry fix, 2026-11-17 — 240.8 → 199.2 KB gzip (room before the lesson v2 kit)

The entry had filled its budget again (240.8 of 245 KB; 833.1 KB raw) by ordinary growth: strings added to the eager
namespaces with each feature. Two things in it were read by no visitor and no student:

| State | Initial JS raw | gzip | Δ gzip |
|---|---:|---:|---:|
| Before (`dev` 3a16fdee) | 833.1 KB | 240.8 KB | — |
| 1. `admin` and `teacher` namespaces on demand (§3) | 711.4 KB | 210.3 KB | −30.5 |
| 2. The shell animates with `m` under a synchronous `LazyMotion` (§3) | 671.8 KB | 199.2 KB | −11.1 |

The same day the visitor's command palette (Ctrl+K) was deleted by the owner's decision — no command palette, no
global search: entry **197.7 KB gzip** (665.3 KB raw).

What remains, by weight (rendered): framer-motion's animation core 232 KB, react-dom 131 KB, the eager namespaces
105 KB (`student` 49, `lesson` 22, `marketing` 13), react-router 84 KB, i18next 81 KB, `App.jsx` 44 KB, the lesson
index 36 KB. Next candidates, not done: `student` on demand (17.8 KB gzip — but `SettingsButton` and the tour registry
read it in the shell, and every student page needs it at once, so only visitors and teachers would gain), and the
landing page without framer-motion (CSS animations).

Checked: 17,921 web tests; lint; `check:unused`; a browser walk on the dev server at 1366×768 — visitor (`/`: hero at
opacity 1, every section visible after scrolling; `/login`), student (home, lessons, a
lesson, practice hub, « قسمي »: neither file requested), teacher (home, classes, a class and its five sections, lessons,
a unit page, a lesson, the bank, profile: no raw key, `teacher.json` requested, `admin.json` not), admin (nine pages:
no raw key from the catalogue). Not checked: a production build served behind the real cache headers.

## 6. How to measure

**The budget gate:** `--budget <KB gzip>` exits 1 above it (on its own analysis build, or on an existing build
with `--dist <dir>`, which reads `index.html`'s module script and modulepreloads). §4 rule 10.

**Runnable since 2026-10-14:** `node scripts/analyze-entry-bundle.mjs [--chain <path suffix>]` builds with
`apps/web/vite.analyze.config.js` (steps 1–3 below) into a temp dir and prints the initial JS (raw, gzip -9), the
entry's content by area, its largest modules, and the static import chain from `src/main.jsx` to any module.

**Build memory (2026-11-01):** the app outgrew a 4 GB node heap. Both `npm run build` (`apps/web/package.json`) and the
analysis build of `analyze-entry-bundle.mjs` ran out of memory at `--max-old-space-size=4096`, so both now set **8192**.
That is measured: the production build passes in about 1 min 30 s. GitHub's runners have 16 GB.

1. Dump the module graph: a throwaway Vite config that spreads
   `apps/web/vite.config.js` and adds a plugin whose `buildEnd` writes
   `this.getModuleInfo(id).importedIds` for every module and whose
   `generateBundle` writes each chunk's `modules[id].renderedLength`.
2. Walk **static** imports from the entry chunk → what is initial.
3. BFS from `src/main.jsx` over static imports → the exact chain that pulls a
   heavy module in (that is how every row of §5 was found).
4. Browser: build with `VITE_API_URL` pointing at a `vite preview` origin that
   proxies `/api` to the Laravel API, log in once via the API (login is
   throttled at 6/min) and inject the token in `localStorage`.

## 8. Browser caching (production, Hostinger)

Hostinger sent every file — hashed chunks included — with
`Cache-Control: private, max-age=0, no-store, no-cache`, so a returning
visitor re-downloaded the whole application on every visit. Two rules ship
inside the build (`apps/web/public/`):

| File | Rule | Why |
|---|---|---|
| `assets/.htaccess` | `public, max-age=31536000, immutable` | Vite names every file after its content hash: a new build means new names, so these can be kept forever. Scoped to `assets/` so `api/` (which inherits the web root's `.htaccess`) is never affected. |
| `.htaccess` (web root) | `index.html` → `no-cache, must-revalidate` | the shell names the current build's assets, so a deploy reaches visitors on their next visit. |

The deploy uses `rsync` without `--delete`: the previous build's chunks stay on
the server, so a tab opened before a deploy can still load its lazy chunks.
`deploy.yml` refuses to ship a build without `assets/.htaccess`.

## 7. Deliberately not done (and why)

- **framer-motion `LazyMotion` with ASYNC features** (≈ 232 KB source still in the entry: the animation
  core). With async features, elements whose `initial` is `opacity: 0` stay invisible until the feature chunk
  arrives — that would *delay* LCP. (This entry used to say « sync features save nothing »: measured on
  2026-11-17, `m` + synchronous `domAnimation` saves 11.1 KB gzip, and it is done — §3.)
- **`experimentalMinChunkSize`** to merge tiny chunks: measured at 8 KB and
  20 KB — it moves code into chunks that did not need it (Number Lab 187 → 345
  KB gzip, lesson runtime 13 → 28 KB) for 1–3 fewer requests. Vite already
  `modulepreload`s a lazy chunk's dependencies in parallel.
- **Trimming Google Fonts weights**: all five families are used; the browser
  downloads a face only when rendered text needs it, so unused declared
  weights cost only a few hundred bytes of `@font-face` CSS. Cairo stays.
- **`manualChunks`**: Rollup's automatic chunking already follows the lazy
  boundaries; a hand-written map would need maintenance with no measured gain.

## 9. Request waterfalls, layout shift and server cost (2026-10-17)

The entry budget (§4 rule 10) bounds what the FIRST file costs. This pass looked at what happens AFTER it: what each page
waits for, in what order, and what the API does meanwhile. Method: production build served with gzip and the §8 cache
headers, `/api` proxied on the same origin (as in production), Playwright, tablet 1024×768 @2x, 4× CPU, 1.6 Mbit/s /
150 ms RTT, median of 3 runs. *Ready* = no spinner / `aria-busy` placeholder and the main area holds text.

### 9.1 What was fixed

| Problem (measured before) | Fix | Where |
|---|---|---|
| Every authenticated page waited for `/auth/me` before requesting its own chunk and data (guards render a spinner while `loading`); `study-context`, `lesson-progress`, tours, notifications waited for the role | The user is cached per token (fingerprint, never the token) and reused at boot: `loading` is false at once, `/auth/me` revalidates in the background; only a 401/403 closes a cached session (a network error no longer logs the student out). Effects keyed on the user use `user?.id`, not the object `/me` replaces | `context/sessionUserCache.js`, `AuthContext.jsx`, `useLessonProgressSync.js`, `useEvidenceSubmission.js` |
| The lesson INDEX waited for the lab strings and the knowledge map before its own chunk (both deleted since) | The boundary starts the runtime with the routes; `LessonPageFrame` calls `Component.preload()` so the page downloads in parallel with the frame (`lazyWithPreload`, `lessons/common/lessonRoutes.jsx`) | `lessonRouteBoundary.jsx`, `lessonRuntimeLoader.js`, `lessonRuntime.jsx` |
| The lesson index downloaded `practiceContent` (80 KB gzip) to count exercises | `virtual:practice-level-counts` (§3 row) | `practiceCounts.js`, `vite.config.js` |
| A click on a lesson waited for its routes chunk | Intent prefetch on every lesson link (§3 row) | `lessonRouteBoundary.jsx` |
| Two notification bells (sidebar + mobile header) each fetched and polled | One request shared by all bells (5 s window; a « lu » forces one re-read) | `features/notifications/NotificationBell.jsx` |
| « فضائي » fetched the whole learning profile (≈ 147 KB) and kept one grade | `?grade=` sent to the server | `StudentHome.jsx` |
| The navbar logo was the 1536×1024 original (97 KB) on every page, shown 32–48 px high | `public/smarter-academy-logo-sm.webp` (216×144, 11 KB) with `width`/`height`; the original stays for JSON-LD. Since 2026-10-21 both are gone: the new brand mark is `public/brand/mark-color.svg` (< 1 KB, BRAND.md) | navbars, footer, sidebar |
| `/books/smart-protocol` showed « جارٍ تحميل » ≈ 4.8 s, behind a 301 to `/books/smart-protocol/` | Share page written under `share/` with an explicit rewrite (no directory at the public path: LiteSpeed redirects directories before rewrites; deploy removes old `books/`) with the real `BookHero` pre-rendered at build, a data snapshot and the page chunk modulepreloaded: content at ≈ 1.0 s (BOOKS_STORE.md §6bis) | `vite-plugin-share-pages.js`, `public/.htaccess`, `deploy.yml` |
| Book pages: data requested after the chunk; footer painted at mid-screen then pushed away (CLS 0.44) | Data starts with the chunk, cards prefetch the detail, skeletons, a fixed-height hero box (BOOKS_STORE.md §4); `MainLayout`'s fallback is `min-h-screen` | `bookCache.js`, `MainLayout.jsx` |
| Unit page CLS 0.25: JetBrains Mono (no Arabic glyph) arrived late on Arabic `font-mono` labels and changed line heights | JetBrains Mono is its own stylesheet with `display=optional`; the Arabic breadcrumb no longer uses `font-mono` | `index.html`, `UnitPage.jsx` |
| Script parse time of the eager JSON (catalogue ≈ 430 KB, i18n) | `json.stringify: true` (`JSON.parse("…")`, faster to parse than object literals). No JSON file may be imported with NAMED imports | `vite.config.js` |

### 9.2 Server side (apps/api)

| Problem (measured) | Fix |
|---|---|
| `GET /daily-challenge`, first call of the day: **16,343 SQL queries, ≈ 7.2 s** — `ExerciseRepository` re-read the 183 KB index from the DATABASE cache and one cache row per exercise, for every candidate | `ExerciseRepository` is a singleton (`AppServiceProvider`) that memoizes the index and the exercises per request, and caches a lesson's exercises under ONE key (`practice:lesson:{code}`). Warm cache: **9,695 → 107 queries, 3.5 s → 0.85 s**; every practice endpoint benefits |
| `statefulApi()` opened a database session on every API call coming from the site's own domain (2–3 extra queries, a `sessions` write) although the SPA authenticates by Bearer token only | Removed (`bootstrap/app.php`) — no cookie, CSRF or session flow exists (login returns a token, Google is stateless, logout revokes the token) |
| Sanctum wrote `personal_access_tokens.last_used_at` on every request | `App\Models\PersonalAccessToken` writes it at most every 5 min (`Sanctum::usePersonalAccessTokenModel`) |
| `lessons.code` / `units.code` indexed only behind `chapter_id` | migration `2026_10_17_000003_index_lessons_and_units_code` |
| CORS preflight re-sent before every cross-origin call | `config/cors.php` `max_age` 7200 (no effect same-origin) |

### 9.3 Result (median of 3, cold = empty HTTP cache, warm = reload)

| Route | Ready cold (ms) | Ready warm (ms) | CLS cold | JS cold (KB) | API calls |
|---|---:|---:|---:|---:|---:|
| `/` | 4401 → 4419 | 632 → 612 | 0.043 → 0.034 | 418 → 418 | 1 → 1 |
| `/books` | 3487 → 3192 | 895 → 475 | 0.145 → 0.028 | 331 → 330 | 2 → 2 |
| `/books/smart-protocol` | 3791 → 3602 | 987 → 559 | **0.437 → 0.001** | 335 → 336 | 3 → 3 |
| `/espace` | 5865 → 4637 | 2681 → 1181 | 0.001 → 0.001 | 532 → 531 | 18 → 8 |
| `/espace/cours` | 4415 → 3687 | 1297 → 548 | 0.001 → 0 | 522 → 521 | 14 → 6 |
| unit page | 4719 → 3850 | 1541 → 632 | **0.25 → 0** | 550 → 549 | 16 → 7 |
| **lesson index** | **7513 → 5801** | 1532 → 954 | 0.024 → 0.001 | **788 → 552** | 16 → 7 |
| lesson module | 8046 → 6660 | 1382 → 943 | 0.044 → 0.037 | 746 → 746 | 14 → 6 |

Images: 97 → 11 KB on every page (logo). The visitor home and `/login` are bound by the entry chunk (unchanged, 324 KB
gzip) — their next step is §9.4.

### 9.4 Not done — candidates, in order of measured weight

- **The entry chunk itself** (324 KB gzip, every cold visit ≈ 2.2 s at 1.6 Mbit/s): the four-grade catalogue (≈ 95 KB
  gzip, reached by 10 eager importers of the core barrel, Home's sections among them), the `admin` / `teacher` / `student`
  namespaces (rule 5), framer-motion (§7). *(Since then: the catalogue left the entry on 2026-10-26, `admin` /
  `teacher` and half of framer-motion on 2026-11-17 — §5.)*
- **`CACHE_STORE=database` in production**: every `Cache::` call and every `throttle:` hit is SQL (≈ 6 queries per
  throttled call). `file` (or Redis) is a server `.env` change — the owner's decision.
- **The daily challenge is still BUILT inside a GET** (≈ 0.85 s warm, more after a deploy's `cache:clear`): pre-generate
  it on a schedule or after the response.
- **`route:cache` / `event:cache` on deploy**: no difference measurable locally (`artisan serve` runs without OPcache) —
  measure on the server before adopting.
- `Progression.jsx` still loads the whole learning profile; `/content/availability/public` is fetched on visitor pages
  that do not read it; the book gallery serves 1004 px images in ≈ 270 px cells.
