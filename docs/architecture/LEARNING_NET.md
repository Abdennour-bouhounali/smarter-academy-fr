# The learning net — شبكة الكفاءات of the cycle moyen (1AM–4AM)

**Status:** implemented 2026-10-13; platform and database for 1AM–3AM since 2026-10-14 (phase 2 — §3bis); phase 3 (lessons
generated one by one along §4bis, each published on `dev`) started 2026-10-14 — progress in `docs/reports/MOYEN_ROLLOUT_PROGRESS.md`.
**Authoritative for:** the official programme of the four years as data, the links between its items, the
lessons of 1AM–3AM still to generate (`coming_soon` in the catalogue), cross-year navigation (« راجع قبل أن تنطلق »
and « راجع » after a wrong answer), and what the database and Mastery V2 do with unpublished lessons.
**Readable map (generated):** [`docs/curriculum/LEARNING_NET_MAP.md`](../curriculum/LEARNING_NET_MAP.md). **Interactive map (generated, standalone, open in a browser):** `docs/curriculum/learning-net-map.html` — written by the same script from `scripts/learning-net-map.template.html` (edit the template, never the output); `check:learning-net` checks both files.
**Sources:** `docs/Math-Moyenne-programme/` — the 2016 منهاج (§3 resource matrix, §4 the four annual programmes)
and the four المخطّطات السنوية (September 2022).

## 1. Why it exists

Before the net, the platform knew 4AM only. It had 74 lessons, 219 learning points and 290 LP→LP edges, all of them
inside 4AM. What a 4AM lesson assumes from earlier years was free Arabic text (`prerequisites`, unit
`prerequisitesAr`) or a lesson-local slug (`priorKnowledge`). Nothing could send a student back to an earlier
lesson. Nothing stopped a future 2AM lesson from re-teaching a 1AM notion with no added value, either.

The net solves four problems with one structure:

1. **The official programme is the contract.** Every مورد معرفي of the four years is an item with a stable id,
   worded as in the official documents. Every item has a lesson that teaches it, published or planned. Nothing
   is taught that the programme does not ask for without that being visible.
2. **No duplication.** When the programme comes back to a notion, the link says how: `extends` carries the
   added value, and `consolidates` means recall without rebuilding.
3. **Navigation.** A lesson knows, one step back, which الكفاءات of which earlier lessons it builds on. It also
   knows, one step forward, where its own الكفاءات serve later.
4. **The base for generating 1AM–3AM.** Units, lesson codes and the items each lesson covers already exist
   as planned data. A generated lesson implements them; it never invents a parallel decomposition.

## 2. Three layers, one authority each

| Layer | File | Holds | Edited when |
|---|---|---|---|
| Official programme | `packages/core/curriculum/dz/net/official_programme_moyen.json` | 4 grades × 7 مقاطع (`segments`), **224 items**, verbatim, with the source page | a transcription error is found (never to "improve" wording) |
| The net | `packages/core/curriculum/dz/net/learning_net_moyen.json` | 17 `threads`, **369 `links`** between items (2026-11-17), those into 4AM carrying a **weight** (§2.2bis) | a link is added, corrected or removed |
| The lessons, four years | `packages/core/curriculum/dz/{lessons,units,programme}_<grade>_2026_2027.json` | every lesson and unit of 1AM–4AM, each lesson's `programmeItems`. 4AM: 74 lessons, all `available`. 1AM–3AM: **196 lessons** (157 + 39 syntheses) in **39 units**, all `coming_soon` until generated | a lesson is generated (published), added or re-scoped; a decomposition changes |

Until 2026-10-14 the 1AM–3AM lessons lived in the net as `plannedUnits` / `plannedLessons`. Phase 2 moved them,
same codes and same items, into the catalogue trio of their grade (§3bis). The net no longer has a planned layer,
and a test fails if one comes back.

Resolver (pure, tested): `packages/core/curriculum/dz/net/learningNet.js`. It reads the net and the four
`lessons_<g>` / `units_<g>` files. **It is not exported from the `@smarter-academy/core` barrel**, because the
barrel is in the entry bundle (`BUNDLE_BOUNDARIES.md`). Import it by path, and only from code that is already
lazy: the lesson runtime (`kit/ReviewLinks.jsx`, static import) or a dynamic `import()`
(`features/learning/EarlierYearReview.jsx`). It builds as its own chunk, `learningNet-*.js` (≈ 80 KB).

### 2.1 Items

```json
{ "id": "3am.m4.r03", "segment": "3am.m4", "grade": "3am", "number": 3,
  "textAr": "معرفة خاصية فيثاغورس واستعمالها.", "origin": "plan-2022", "domain": "geometry" }
```

- **Id:** `<g>am.m<مقطع>.r<nn>`. This is the مقطع number and the مورد number in the annual plan, so the id *is* the
  official reference.
  - Items found in the 2016 منهاج but absent from the 2022 plan are `<g>am.m<n>.x<k>` with
    `origin: "manhaj-2016"`. There are three: `1am.m5.x1` (عشري → كسري), `3am.m4.x1` (the converse of
    Pythagoras) and `3am.m5.x1` (حصر بالتدوير).
- **An id never changes meaning.** A new item is appended at the end of its مقطع. Items are never renumbered.
  Test: « numérote les موارد du plan 1..n sans trou ».
- `partsAr` keeps the official sub-bullets of a composite مورد (e.g. `4am.m5.r03` الدالة الخطية, four parts).
- **Formulas** are marked `$…$` so that `MathText` isolates them LTR. This markup is the only addition to the
  official wording. All 27 formulas are checked to render in KaTeX.
- `domain` is the official ميدان: `numbers`, `data` or `geometry`. A مقطع that mixes ميادين is overridden per item
  (`4am.m5.r01–r02` جمل المعادلتين are `numbers`).
- `verified: false`. The PDFs' text layer is corrupted (ى/ي, س/ز), so the transcription was read from the page
  images. Re-reading it against the PDFs is an open item (§8).

### 2.2 Links

```json
{ "from": "3am.m4.r07", "to": "4am.m2.r02", "type": "extends", "addedValueAr": "الجيب والظل بعد جيب التمام." }
```

| `type` | Meaning | Required field | Used by |
|---|---|---|---|
| `requires` | `to` cannot be built without `from` | — | « راجع قبل أن تنطلق », recommendations |
| `extends` | same notion further up the spiral: `to` **starts from** `from` and teaches only the added value | `addedValueAr` | the no-rebuild rule (§4), review links |
| `consolidates` | the programme repeats `from`: `to` recalls and consolidates it (الإرساء), **never rebuilds it** | `noteAr` | the no-rebuild rule, review links |

Counts on 2026-11-18: 329 `requires`, 31 `extends`, 10 `consolidates` (328 on 2026-11-17; 312 / 31 / 10 on 2026-10-13). Links are meant to be
**direct**: an item lists the step just below it, never the whole staircase. This is a writing rule, not a tested one: 36
links join two items that another path already joins (audit of 2026-11-17). Most are true direct needs (the Euclidean division
is needed by « قاسم » itself, not only through the divisibility rules), so no automatic rule removes them.

Invariants, from `learningNet.test.js`:

- **Endpoints and type.** Both ends exist, no item links to itself, and the type is one of the three.
- **Never backwards in time.** The `from` year is ≤ the `to` year. In the same year, the `from` مقطع is ≤ the `to`
  مقطع. `extends` and `consolidates` point at a strictly earlier item.
- **No cycle**, all types together.
- **One base per item.** An item has at most one `extends`/`consolidates` base; otherwise "what it adds" means
  nothing.
- **Lesson order.** The home lesson (§2.4) of a link's `from` never comes after the home lesson of its `to`.

The lesson-order invariant caught three real conflicts with the 4AM textbook order. Each was fixed in the net,
never by moving a lesson:

1. المتطابقات → النشر was dropped: the textbook expands before it teaches the identities.
2. التمثيل البياني لوضعية now requires reading a *linear* graph, not an affine one.
3. `muadala-ula` became a recall lesson (§2.4).

### 2.3 Threads

Seventeen conceptual strands. Each item belongs to exactly one (tested). The strands are the lanes of the drawn map.

- **Numbers:** `naturals-decimals`, `divisibility`, `fractions-rationals`, `relatives-line-frame`,
  `powers-roots`, `literal-calculus`, `equations`.
- **Data:** `proportionality-functions`, `measures-units`, `statistics`.
- **Geometry:** `plane-figures`, `angles`, `lengths-areas`, `transformations`, `triangles-proof`,
  `trigonometry`, `solids`.

### 2.4 Lessons, published and to generate

All lessons live in `lessons_<grade>_*.json`. The resolver reports `status: 'available'` for a published lesson and
`status: 'planned'` for a `coming_soon` one.

- **Published lessons** declare `programmeItems` in `lessons_<grade>_*.json`.
  - Every 4AM item has a published 4AM home lesson (tested).
  - Synthesis lessons declare none.
  - A lesson may list several items, and several lessons may share an item: the 4AM textbook splits الدالة الخطية
    over four lessons.
  - **Recall lessons.** A lesson whose textbook content is a recall from an earlier year declares that year's
    item. There is one: `muadala-ula` → `3am.m5.r06`. The list is closed in the test (`RECALL_LESSONS`), so a new
    recall lesson is a decision, not drift.
- **Lessons to generate** (1AM–3AM, `status: "coming_soon"`). Since 2026-10-13 they are cut from the **official
  textbooks** (1AM موفم 2017, 2AM and 3AM منشورات الشهاب 2017; `docs/official-book-pdfs/`) by the 4AM rule: one
  textbook باب = one unit, and its numbered « أنشطة » / « أكتشف » rubrics, grouped as the book's معارف groups them,
  = its lessons. Since 2026-10-14 they sit in `lessons_<g>_2026_2027.json` in the 4AM shape:
  - `code`, `sourceTopicId` (the مقطع of the first item, else the unit's main مقطع, else `null`), `chapterId`,
    `unitId`, `order` (global within the grade = the book's order), `kind`, `decompositionType`, `decisionStatus`.
  - `titleSource: "textbook"`, `title`, `description`, `prerequisites` (Arabic, from the book).
  - `prerequisiteLessonCodes` (§3bis), `programmeItems`, `textbookRef {unit, pages}`, `status`.
  - **`pointsToLearn`**: DRAFT الكفاءات written from the unit's « سأتعلّم في هذا الباب » and the lesson's activity
    (owner decision D1: drafted by the platform, the owner validates); `decisionStatus: "draft"`.
  - No `durationMinutes`, `difficulty` or `icon` until the lesson is generated.
  - Synthesis lessons have no `pointsToLearn` yet; they are drafted with the synthesis.
- **Units** (`units_<g>_2026_2027.json`): `code`, `chapterId` (numbers → `ansab_al_aadad_wal_hisab`, data →
  `tanasubiya_duwal`, geometry → `handasa`), `order`, `number`, `titleAr`, `sourceTopicIds` (the مقاطع of its
  lessons' items), `textbook {title, unit, pages, bookPages, pdfPages, prepPage, exercisesPages, integrationPages,
  map}`, `objectivesAr` (verbatim), `challenge {titleAr, textAr}` or `null`, `synthesisLessonCode`. Each unit ends
  with its « أدمج تعلّماتي » (`wadiya-idmajiya-<unit>`). Scan defects stay in `textbook-map.json › scanIssues`.
- **Programme** (`programme_<g>_2026_2027.json`, minimal): three ميادين under the chapter ids above, titled from the
  official domains (« ميدان الأنشطة العددية », « ميدان الدوال وتنظيم المعطيات », « ميدان الأنشطة الهندسية »). Their
  topics are the grade's مقاطع (`<g>am.m<n>`, official titles). 4AM keeps its own programme file and its owner
  display names.
  - Source of each decomposition, with the reading decisions and scan defects:
    `docs/sources/<grade>/textbook-map.json` (1AM 14 units / 55 lessons, 2AM 12 / 53, 3AM 13 / 49). The book's
    unit order is NOT the مقاطع order: a same-year prerequisite taught later in the book is a listed « renvoi en
    avant » (§4bis), never a reordering.
  - **Lessons without a programme item** (the book teaches them, the 2022 plan has no item): 3AM unit 8 « البرهان
    في الرياضيات » (3 lessons), 3AM « المتباينة المثلثية », 2AM « إنتاج عبارة حرفية ». They are queued last (§4bis)
    and keep `programmeItems: []`. **Owner decision D10 (2026-10-14): they are generated** like every other lesson.
- **Codes** are globally unique across the four grades, lessons and units (tested); a collision is resolved by a
  grade suffix (`-2`, `-3am`).
- **Home lesson** of an item: the first lesson in curriculum order (grade, then `order`) that declares it, synthesis
  excluded. A struggling student is sent there.

### 2.2bis The weight of a link — core / support (2026-11-17)

Owner, 2026-11-16: the tracking must tell a problem in a prerequisite from a problem in the new idea, and a strong result on
a الكفاءة that **leans heavily** on others must update them. All links weighing the same, neither is possible. Since 2026-11-17 a
link may carry a weight, whatever its type:

```json
{ "from": "3am.m4.r03", "to": "4am.m1.r06", "type": "requires", "weight": "support",
  "weightNote": "Pythagoras is the situation that calls for the square root; its definition does not need it." }
```

| `weight` | The test | What it allows |
|---|---|---|
| `core` | a student **cannot pass the exercises of `to` while failing `from`** | `from` is measured first by a launch; it can be NAMED as the cause of a difficulty on `to`; a success on `to` lets `from` be deduced « يبدو ثابتًا » |
| `support` | `from` helps, explains or serves a proof, but `to` can be passed without it — `weightNote` (English, one sentence) says why | measured after the core ones; never named as a cause; **nothing is deduced through it** |

- **Classified year by year.** `WEIGHTED_GRADES` (`['4am']` today) lists the grades whose incoming links are ALL classified —
  the links into their items, and into the items of another year that their lessons teach (the recall lesson `muadala-ula`
  → `3am.m5.r06`). On 2026-11-18: **123 links classified, 86 core and 37 support** (122 / 85 on 2026-11-17); the 1AM–3AM links are classified when
  their lessons get a launch. An unclassified link counts as core in `toolsForLesson` (a grade not yet classified loses no tool).
- **Every الكفاءة of a classified grade keeps at least one core prerequisite** (tested): otherwise nothing could be named as a
  cause.
- **The owner reviews the weights** in the generated table `docs/curriculum/LEARNING_NET_WEIGHTS_4AM.md` (one block per lesson,
  in the order of the book); a correction is an edit of the JSON, then `npm run generate:learning-net`.
- **13 links were added with the weights** — needs the lessons state and the net did not: solving an inequality needs solving
  a first-degree equation (`3am.m5.r06 → 4am.m3.r04`, core); twelve supports (the identities after the expansion, the linear
  and affine functions after the equation, the affine function from two points after the system, the trigonometric ratios
  after Thales, the sections and the enlargement after Thales and the sphere…).
- **One more on 2026-11-18: `2am.m1.r04 → 4am.m1.r02`, core** (Euclidean division by any number → the set of divisors).
  Listing the divisors of a number is dividing it and reading the remainder, and the third property of « خواص قواسم » (a
  common divisor of $a$ and $b$ divides the remainder of $a$ by $b$) cannot be used without it. The 2AM item, not the 1AM
  `1am.m3.r01`: it already `extends` the 1AM one (one direct step, §2.2). Since `qawasim-adad-tabii` and `khawass-qawasim`
  share `4am.m1.r02`, both launches now measure two core tools (`LAUNCH_KIT.md` §4).

## 3. Navigation — what the resolver gives

| Function | Returns | Used by |
|---|---|---|
| `reviewLinksForLesson(code)` | One step back. The items the lesson builds on (`requires` plus its `extends`/`consolidates` bases), minus its own, grouped by home lesson, oldest first: `[{ lesson: {code, grade, titleAr, status}, items: [{id, grade, segment, textAr, via}] }]` | « أستعدّ » result screen (`kit/ReviewLinks.jsx`) |
| `forwardLinksForLesson(code)` | One step forward: where the lesson's items serve later, grouped by home lesson | Planned: lesson end / teacher memo |
| `noRebuildForLesson(code)` | For each item that `extends`/`consolidates` an earlier one: the base, its home lesson and the added value | Lesson generation (§4) |
| `earlierYearReviewFor({ learningPointCode, lessonCode })` | The review links of the learning point's lesson (or of `lessonCode` when the code is not a known LP), keeping only items from an **earlier year** | « راجع » after a wrong answer (`features/learning/EarlierYearReview.jsx`) |
| `lessonCodeOfLearningPoint(lpCode)` | `{grade}_{lesson}_P{n}` → `lesson`, or `null` | the above |
| `toolsForLesson(code, { max = 4 })` | The prerequisites a launch measures, in the order it measures them: core first, then support; at equal weight the nearest year first, then programme order. **Never an item whose home lesson comes AFTER the lesson** (2026-11-18: « القسمة الإقليدية وحصر حاصل القسمة », 2AM order 5, shares `2am.m1.r06` with the lesson of order 6, and `2am.m1.r06` requires `2am.m1.r05` — the link goes from r05 to r06 — whose home is that lesson of order 6: r05 stays a review link of lesson 5, never a tool). Flat: `[{ id, grade, segment, textAr, via, weight, lesson }]` | « عُدّة الانطلاق » (`launchkit/engine.js › planTools`), the review table |
| `corePrerequisitesOf(itemId)`, `coreDependentsOf(itemId)` | One step along the core links, down and up | Planned: the automatic update and the diagnosis (`LAUNCH_KIT_PLAN_2026-11-17.md`, phase 3) |
| `weightOf(link)`, `WEIGHTS`, `WEIGHTED_GRADES` | The weight of a link (`null` when not classified) | — |
| `homeLessonOf(itemId)`, `lessonsOf(itemId)`, `linksInto`, `linksFrom`, `itemRank`, `getItem`, `getLesson`, `UNITS` | Primitives | — |

**« راجع قبل أن تنطلق » (live since 2026-10-13).** `PrerequisiteDiagnostic`'s result screen renders
`<ReviewLinks lessonId={ctx.lessonId} />` under the advice, both on the page and in the classroom summary. Every
lesson that uses the kit therefore gets the panel with no per-lesson code: all 60 4AM lessons with a « أستعدّ ».

- One card per home lesson. The card shows the year chip (« السنة الثالثة متوسط »), the lesson title and the
  official text of each الكفاءة.
- The title is a **link** when `status === 'available'` and `getLessonPath(code)` resolves. A **planned** lesson
  shows its title with « قريبًا »: the student still learns *what* to revise and from which year. The link lights
  up by itself the day the lesson is published.
- Contract unchanged from the diagnostic: never gates, sends no evidence, shows nothing if the lesson has no review
  links. Strings: `lesson.json › diagnostic.reviewTitle / reviewHint / reviewSoon`.
- Today each 4AM lesson shows 1–5 cards. Example: الجذر التربيعي → قوة عدد نسبي (3AM) and فيثاغورس (3AM).

**« راجع » after a wrong answer (live since 2026-10-14, owner decision D7).** Links to earlier years also appear
**inside exercises**, under the verdict of a wrong answer, in two places:

- the practice player (`PracticeSession`): classic card and BEM / term-exam sheet alike, inside `FeedbackPanel`;
- the lesson's final test review (`BossFinal` › `EpreuveReview`): the student page and the classroom presentation.

How it works:

- One component, `features/learning/EarlierYearReview.jsx`, renders a compact line « راجع: <lesson> (<year>) »,
  up to three, nearest year first.
- **Derived, never written in exercises.** The question's primary learning point → its lesson
  (`lessonCodeOfLearningPoint`) → `reviewLinksForLesson`, keeping only items from earlier years
  (`earlierYearReviewFor`). Without a known LP it falls back to the exercise's lesson.
- **Published target:** a link (`getLessonPath`). **Unpublished target:** the official text of the الكفاءة, with no
  link; it lights up by itself the day the lesson is published.
- Same contract as the panel: never gates, sends no evidence, renders nothing when there is nothing earlier
  (every 1AM lesson). Not shown on a self-check (`selfCheck`) or an inert outcome.
- The resolver is loaded with a dynamic `import()` on the first wrong answer, so it is never in the entry or the
  practice page chunk.
- Strings: `lesson.json › review.earlierYear` (« راجع: »), `review.earlierYearLabel`.
- The pattern is documented for exercise authors in `EXERCISE_CONTRACT.md` § « Earlier-year review link ».

**Relation to the learning-point graph and Mastery V2.** The net works at the *programme-item* level. The finer
LP→LP graph (`pointPrerequisites`, `{grade}_{lesson}_P{n}`) is unchanged. It still feeds `learning_point_prerequisites`,
`RecommendationService` (`KIND_PREREQUISITE`) and `nextSteps.js`. A lesson's LPs refine its items. Cross-year LP edges
become possible once 1AM–3AM lessons exist; `pointPrerequisites` may then name `2am_<lesson>_P<n>` codes.

## 3bis. Platform and database (phase 2, 2026-10-14)

**Catalogue.** `coursesData.js` builds 1AM, 2AM, 3AM and 4AM from their trios (`DZ_MOYEN_GRADES`), and
`activeGrades.js` activates all four.

- A `coming_soon` lesson is a **non-clickable card**: `LessonCard` / `LessonRow` show « قريبًا » and « قيد الإعداد ».
- The unit card shows « قيد الإعداد » instead of `0/N` while none of its lessons is published. It stays a link:
  the unit page shows what each lesson will teach.
- The unit page draws each draft lesson as a dashed card with its الكفاءات, without progress, and a disabled
  « قيد الإعداد » button.
- A grade with no published lesson opens the catalogue with « البرنامج متوفّر، الدروس قيد الإعداد »
  (`CatalogueBrowser`).
- `getAllGrades().lessonCount` counts **published** lessons only, so the grade choice shows « قريبًا · البرنامج قيد
  الإعداد » for 1AM–3AM. A teacher's default grade (catalogue, new class) is the first one with published lessons.
- **`getLessonPath(code)` returns `null` for a lesson that is not `available`.** Every link that leads to a lesson
  (review links, recommendations, practice back-link) is therefore safe. Draw a card from `getLessonById(id).path`.
- Prerequisite chips (`lessons/common/components/PrerequisiteLessonChips.jsx`, unit page and lesson index) name
  the year of a prerequisite from another year. They are links only when the target is published.
- The lesson registry's glob and the teacher memo's glob cover `1am`–`3am`, so a generated lesson needs no wiring
  beyond its own routes.

**Lesson-level prerequisites from the net.** `prerequisiteLessonCodes` of a 1AM–3AM lesson = the home lessons of
its review links (`reviewLinksForLesson`) that **precede** it: an earlier year, or earlier in the same book.

- A same-year prerequisite taught later in the book (« renvoi en avant », §4bis) is not a prerequisite: the lesson
  recalls it itself.
- A synthesis lists the lessons of its unit.
- These edges are imported into `lesson_prerequisites` (178 on 2026-10-14) and drawn as prerequisite chips.

**Cross-year LP→LP edges: kept at lesson level, on purpose.** `pointPrerequisites` of the 1AM–3AM lessons are empty.
An "every LP depends on every LP of the review lesson" rule would write hundreds of edges between DRAFT الكفاءات that
the owner has not validated (D1). `RecommendationService` and the teacher map would then name prerequisites that do
not exist yet. The precise LP→LP edges are written when a lesson is generated, on its final الكفاءات and only
along a net link (§4.6). Until then cross-year navigation is lesson- and item-level: the « راجع » panel, the « راجع »
after an error, and the prerequisite chips. The 4AM lessons' `prerequisiteLessonCodes` were left 4AM-only by phase 2;
their cross-year links come from the net at run time. Since 2026-11-07 a 4AM lesson connected to its PUBLISHED earlier-year
lessons also lists them there (first: `qasim-adad-tabii` ← `qisma-iqlidiya-baqi`, `qawaid-qabiliyat-qisma`), so « المتطلبات السابقة »
shows them as clickable chips with their year, and the free-text `prerequisites` they replace are removed (no duplicate chip). Second
(2026-11-09, unit 2 mission rollout): `jidhr-tarbii` ← `quwat-adad-nisbi`, `khassiyat-fitaghuras` (3AM, the net's `requires` links of its items) — its
« أستعدّ » review and « راجع قبل أن تنطلق » were empty without them. Third (2026-11-10, unit 9 mission rollout): `aksiya-talis` ← `talis-hisab-atwal` (4AM) + `amaliyat-natiqa` (3AM, the net's
`3am.m1.r08 → 4am.m2.r01` link); its free-text « حساب واختبار تساوي نسبتين (كسرين) » removed (council of 2026-11-10: a `coming_soon` lesson is
never a revise target). Fourth (the same day): `inshaat-talis` ← `talis-hisab-atwal` (already there) + `amaliyat-natiqa` (3AM, the same link — the
lesson builds a point from a RATIO of lengths); its two free-text prerequisites stay (no lesson replaces « الإنشاءات الهندسية الأساسية »). Fifth (the
same day): `talis-hisab-atwal` ← `amaliyat-natiqa` (3AM, the same link; it was `[]`, so « راجع قبل أن تنطلق » was empty); its two free-text
prerequisites stay — « مستقيم المنتصفين » (3AM) is still `coming_soon`, so it is NOT a revise target (council of 2026-11-10). Its « أستعدّ »
revises `tasawi-muqaranat-kasrayn` (3AM) and `rabi-mutanasib` (2AM), the published lessons that TEACH what its ten statements test.
Sixth (2026-11-11, unit 3 mission rollout, council verdict L1.6): `nashr-tabsit` ← `nashr-jabri-3am` + `tabsit-hadhf-aqwas` (3AM). The net has NO
`requires` link into `4am.m3.r02`: its only review link is `3am.m5.r02 → 4am.m3.r02` (`extends`, home `nashr-jabri-3am`). **An `extends` home counts
as a prerequisite lesson** (the 4AM item consolidates what that lesson taught; « راجع قبل أن تنطلق » was empty without it); `tabsit-hadhf-aqwas`
(`3am.m5.r01`, one `requires` step further) is the lesson its « أستعدّ » skill « تبسيط عبارة وحذف الأقواس » revises. Its two free-text prerequisites
that these lessons replace are removed; « أولويات العمليات… » stays.
Seventh (2026-11-11, unit 4 mission rollout, council verdicts L1.8, L3.7, L4.6): `muadala-ula` ← `muadalat-darajat-ula` + `musawiyat-amaliyat` (3AM,
the lessons that teach solving a first-degree equation and operating on both sides of an equality — `muadala-ula` is a recall lesson of `3am.m5.r06`),
`nashr-tabsit` kept; `mutarajiha-ula` ← `mutabayinat-amaliyat` (3AM, operations on inequalities) + `muqarana-nisbiya` (2AM, comparing relative numbers),
`muadala-ula` kept; `tarrid-mushkila` ← `muadalat-darajat-ula` (3AM, translating a situation into an equation) added before its three 4AM prerequisites.
`jidaa-maadum` unchanged (`muadala-ula`, `tahlil-ibara`, verdict L2.9).
Eighth (2026-11-11, unit 5 mission rollout, council verdict X6): `mafhum-jumla` ← `muadalat-darajat-ula` (3AM, solving a first-degree equation) +
`qimat-ibara-harfiya` (3AM, the value of an expression with letters — testing a pair is substituting two values), `muadala-ula` kept;
`hall-jabri` ← `musawiyat-amaliyat` (3AM, operating on both sides of an equality) + `qimat-ibara-harfiya`, its three 4AM prerequisites kept — the
two skills its « أستعدّ » diagnoses; NOT `muadalat-darajat-ula` (`muadala-ula` already requires it). `mushkilat-jumla` unchanged. « راجع قبل
أن تنطلق » reads the catalogue's `prerequisiteLessonCodes` (`mission/ReviseFirst.jsx`); the net ALSO gained two `requires` links (owner, 2026-11-12:
the first lesson of a unit must lead the student back to the earlier year by every path): `3am.m5.r03` (the value of an expression with letters) →
`4am.m5.r01` and `3am.m5.r05` (operations on both sides of an equality) → `4am.m5.r01`, beside the existing `3am.m5.r06` → `4am.m5.r01`.

**Database — imported, closed, ignored by Mastery V2.**

- `exportCurriculum.mjs` → `smarter:import-curriculum` imports the three grades, their units, the 196 lessons and
  **all 524 learning points (523 drafts + the unit-1 synthesis P1, 2026-10-26)** (`{g}_{code}_P{n}`), as D2 requires.
- **The importer creates a `coming_soon` lesson with `publication_status = draft`** (`CurriculumImporter::
  publicationOnCreate`). The column defaults to `published`: without this rule the 196 empty lessons would be open
  on the server, since every server gate (`ContentAccess`, `visibleToStudents`) reads `publication_status`, not
  `status`. An `available` lesson is still created `published`.
- On re-import, the admin keeps authority (`publicationOnUpdate`):
  - a `coming_soon` lesson is never `published` (`published` → `draft`; `hidden` / `archived` are kept);
  - the flip `coming_soon` → `available` (**publishing**, LESSON_DEVELOPMENT_GUIDE § « Publish a lesson ») turns
    the import's `draft` into `published`;
  - an `available` lesson that the admin set to `draft` stays `draft`.
- `smarter:curriculum-sql` (the Hostinger SQL path) emits the same rule.
- Mastery V2 ignores the unpublished lessons:
  - **Evidence and practice:** `ContentAccess` refuses a draft lesson, so no progress row is ever created on its LPs.
  - **Class:** the effective lessons of a class (map, progress, signals, snapshot, daily challenge) are
    `visibleToStudents`.
  - **Two prerequisite reads join LPs without that scope, and now filter on the prerequisite lesson's
    publication:** the LP detail of the teacher map (`ClassroomLearningPointService::prerequisites`) and
    `RecommendationService` (`KIND_PREREQUISITE` never sends a student to a draft lesson).
  - The tier stays admin-owned: new lessons are created `free`, and publishing never touches the tier.
- Tests: `apps/api/tests/Feature/MoyenComingSoonImportTest.php` (MySQL, `phpunit.local.xml`).
- `smarter:registry-health --gate`, read by `check:activation-drift`, now also fails when the export activates a
  grade the database does not have yet. Before, the three new grades would have passed it unimported.

## 4. Generating a 1AM–3AM lesson from the net (contract)

These rules complete `LESSON_DEVELOPMENT_GUIDE.md` §14.2 for any year other than 4AM.

1. **Start from the catalogue entry.** The lesson already exists in `lessons_<grade>_2026_2027.json` with
   `status: "coming_soon"`, its `code`, `unit`, `title`, `programmeItems`, draft `pointsToLearn` and
   `prerequisiteLessonCodes`. Generate it **under the same code with the same `programmeItems`**; finalise its
   `pointsToLearn` (keep their order — the LP ids are positional) and give it `durationMinutes`, `difficulty`, `icon`.
   If the textbook calls for another decomposition, change the catalogue entries first; the invariants then check
   the new one. Publishing is the last step (LESSON_DEVELOPMENT_GUIDE § « Publish a lesson »).
1bis. **The textbook is the reference, not the script** (owner, 2026-10-14). The extraction fixes WHAT the lesson teaches;
   the entry point, the examples, the contexts and the order of ideas are designed by the platform, and each module is one
   track (act → answer about what you did → name it). `LESSON_DEVELOPMENT_GUIDE.md` §4ter–§4quater; reference
   `kitabat-adad-tabii`.
2. **`pointsToLearn` refine the items.** Every item must be taught by at least one LP, and no LP may teach outside
   the lesson's items. Add the programme item's text to the knowledge map's guidance where useful.
3. **Do not rebuild.** For each entry of `noRebuildForLesson(code)`:
   - `extends`: the lesson opens by **recalling** the base (a « تذكّر » node, a link to the base lesson) and builds
     only `addedValueAr`.
   - `consolidates`: the lesson **does not re-teach** the base. It recalls it and goes straight to الإرساء
     (practice and situations in new contexts).
4. **« أستعدّ » diagnoses the review links.** Every item of `reviewLinksForLesson(code)` must be measured by at
   least one diagnostic question. The `priorKnowledge` slugs remain the audit's vocabulary
   (`KNOWLEDGE_DEPENDENCY.md`). The panel under the result is automatic.
5. **`prerequisiteLessonCodes`** = the home lessons of the review links that precede the lesson (already filled by
   phase 2, §3bis), plus the earlier lessons of the unit the textbook requires.
6. **`pointPrerequisites`** may name LP codes of an earlier year (`1am_<code>_P<n>`), but only along a net link
   between the two lessons' items.
7. Run `npm run generate:learning-net` and commit the regenerated map.
8. **Phase 3 practice (since 2026-10-14, first lesson `mana-jam-tarh`).** A cross-year LP→LP edge is written only toward a lesson
   whose الكفاءات are FINAL (published). When the net's prerequisite lesson is still `coming_soon` (its الكفاءات are drafts, D1),
   the generated lesson declares only its intra-lesson edges (`mana-jam-tarh`: P3 ← P1) and the cross-year link stays at item and
   lesson level (« راجع », `prerequisiteLessonCodes`) until that lesson is generated — it then adds the edge to its successors.
   First edge written this way: `qisma-iqlidiya-baqi` P3 ← `1am_mana-jam-tarh_P1` (net link `1am.m1.r01` → `1am.m3.r01`).
   First back-edges written from PUBLISHED 3AM lessons toward a newly generated earlier year (2AM مقطع `2am.m1`, 2026-10-29,
   `docs/curriculum/PLAN_2AM_M1.md`): `quwat-adad-nisbi` P4, `jam-tarh-kasrayn` P1/P2, `maqlub-qismat-kasrayn` P1,
   `tasawi-muqaranat-kasrayn` P2/P3, `tabsit-hadhf-aqwas` P1 ← the 2AM الكفاءات, each only along a net link, and the successor's
   « تذكّر — السنة الثانية » box gains its `getLessonPath` link in the same commit (`feat(lessons): connect …`). Where the net has
   no link (`wasf-silsila-hisab` → `tabsit-hadhf-aqwas`, `tawzi-darb-jam-tarh` → `nashr-jabri-3am` …) no edge is written; the
   link is an owner question. 4AM is reached only through these 3AM lessons (no `2am.m1` item links straight into 4AM).
   First cross-year LP edges INTO a 4AM lesson (2026-11-07, `qasim-adad-tabii`, item `4am.m1.r01`): P1 ← `1am_qisma-iqlidiya-baqi_P1` +
   `1am_qawaid-qabiliyat-qisma_P4`, P2 ← `1am_qisma-iqlidiya-baqi_P2`, P3 ← `1am_qawaid-qabiliyat-qisma_P4`, along `1am.m3.r01 → 4am.m1.r01`
   (`requires`) and `1am.m3.r02 → 4am.m1.r01` (`extends`); both lessons are also in its `prerequisiteLessonCodes` (§3bis); the 2AM lesson
   `qisma-iqlidiya-hasr` (2am.m1.r04) gets no edge — the net links it to 4am.m1.r03, not r01. `decomposition.test.js` accepts an
   earlier-year LP only when its lesson is published, and an earlier-year prerequisite lesson from anywhere in the cycle.
   The unit's extraction is written whole; its elements destined to lessons not yet generated are « en attente » in
   `check:textbook` (`LESSON_DEVELOPMENT_GUIDE.md` § « Generating a 1AM–3AM unit LESSON BY LESSON »).

## 4bis. Generation order (owner decision, 2026-10-13)

Lessons are generated **along the net, not grade by grade**. `scripts/learning-net-queue.mjs` writes the queue to
`docs/curriculum/GENERATION_QUEUE.md` (readable) and `docs/curriculum/generation-queue.json` (machine). Batches take
the queue's first entries that are still `coming_soon`, in order.

0. **Phase 0 — owner priority** (owner, 2026-10-25). The remaining lessons of the 3AM units 1–5 (`aadad-nisbiya`, `kusur-natiqa`,
   `quwa-nisbiya`, `ibarat-harfiya-3`, `musawiyat-mutabayinat`, in that order; `OWNER_FIRST_UNITS` in the script) come first, in
   catalogue order, each synthesis after its unit's last lesson — 20 entries. Each one has a written generation plan
   (`docs/sources/3am/unit<N>/plan/<code>.md`, index `docs/curriculum/PLAN_3AM_UNITS_1_5.md`) that the generator executes.
   The same method then generated the 2AM مقطع `2am.m1` (units 1–2, 10 entries, owner request 2026-10-29; index
   `docs/curriculum/PLAN_2AM_M1.md`).
1. **Phase A — what the 4AM student needs NOW** (owner, 2026-10-20). The 4AM students already use the platform, so their
   current needs come first, before lessons they will need later in the year or not at all in 4AM. The 4AM units are taken in
   textbook order (`units_4am › number`, 1 → 14), and their lessons in catalogue order. For each lesson:
   - take its **direct** prerequisites: the earlier-year items linked INTO its `programmeItems`, one hop, no closure;
   - use the **most recent year** for each one: an item that a later year (< 4AM) extends is replaced by that extension, so
     3AM is used, otherwise 2AM, otherwise 1AM. For example, `2am.m4.r08` → `3am.m5.r06`, so the queue takes
     `muadalat-darajat-ula`, not `hall-mushkil-muadala`;
   - map each item to its home lesson. Published lessons and lessons already queued are skipped. Within one 4AM lesson,
     the oldest year comes first, then catalogue order.

   A unit with no new need is listed as « rien à générer ».
2. **Phase B — the full 4AM chains** (rule of 2026-10-13). For each 4AM lesson in catalogue order, the WHOLE upstream chain
   of its items in earlier years (transitive closure of `requires` / `extends` / `consolidates`) is mapped to home lessons
   and generated oldest first.
3. **Phases C, D, E** — the same from the remaining 3AM lessons (with their own 1AM–2AM chains), then 2AM, then 1AM.
4. **Phase F — isolated lessons** (no item, or items linked to nothing) come last.
5. A **synthesis** enters the queue right after the last lesson of its unit, in any phase. In Phase A, for example,
   `wadiya-idmajiya-tanasubiya-sura` follows #9–#11. A unit whose lessons are ALL published before its synthesis
   (2AM units 1–2, 2026-10-29) puts its synthesis at the end of its grade's phase (`learning-net-queue.mjs`).
6. The queue also lists the **renvois en avant**: same-year prerequisites the textbook teaches later. The lesson that
   suffers one recalls it itself (a « تذكّر » box), without building it.

On 2026-10-13: 196 lessons — A 108, B 35, C 22, D 23, E 8 (the previous phase letters); 18 renvois en avant.
On 2026-10-20 (10 lessons published): 186 — A 35 (34 lessons + 1 synthesis), B 63, C 35, D 22, E 23, F 8.
Phase A does not change what a lesson builds. A Phase-A lesson whose own earlier prerequisites are not generated yet still
reviews them in its « أستعدّ » (« راجع قبل أن تنطلق »), and they come in Phase B.

**Net fix 2026-10-26 (3AM unit 3 « القوى ذات أسس نسبية صحيحة »).** The unit teaches r01/r03 (`quwa-adad-ashara`) BEFORE r02
(`qawaid-quwa-ashara`): the link `3am.m3.r02 → 3am.m3.r03` would have made the first lesson's « أستعدّ » measure a rule taught in the
NEXT lesson. It is replaced by `3am.m3.r01 → 3am.m3.r03`, and `3am.m3.r02 → 3am.m3.r04` is added (the scientific writing of a computation
needs the rules); `kitaba-ilmiya-rutba › prerequisiteLessonCodes` gained `qawaid-quwa-ashara`. General rule shown by the case: a `requires`
link must follow the textbook order of the LESSONS that own its two items; when it does not, the link is wrong, not the order.

## 5. Editing the net

- **Fix a transcription:** edit the item's `textAr` in `official_programme_moyen.json`. Never change its id.
- **Add a link:** append to `links` in `learning_net_moyen.json`, then run
  `npx vitest run curriculum/dz/net` in `packages/core`. The tests reject backwards links, cycles, a missing
  `addedValueAr`/`noteAr`, a second base, and a lesson-order contradiction.
- **Re-scope a lesson:** edit `programmeItems` (published or planned). The coverage tests require every item to
  keep a home lesson, and every 4AM item a published one.
- **Weigh a link:** set `weight` (`core` / `support`) and, for a support, `weightNote`. A link INTO a classified grade must
  have one (tested). Ask the one question of §2.2bis; when unsure, it is support.
- **Always regenerate the map, the weights table and the queue:** `npm run generate:learning-net`. `npm run
  check:learning-net`, part of `check:lessons`, fails while `LEARNING_NET_MAP.md`, `learning-net-map.html`,
  `LEARNING_NET_WEIGHTS_4AM.md`, `GENERATION_QUEUE.md` or `generation-queue.json` is stale.

## 6. Validation

| Gate | What it checks |
|---|---|
| `packages/core/curriculum/dz/net/learningNet.test.js` (25 tests; since 2026-11-17 also: every link into a classified grade has a weight and a support says why, every الكفاءة of such a grade has a core prerequisite, the order of a lesson's tools, and **the catalogue does not contradict the net** — §8bis) | items (format, uniqueness, official numbering), links (existence, direction, acyclicity, `extends`/`consolidates` fields, one base), threads (partition), lessons (every item homed, 4AM fully covered by published lessons, closed recall list, unique codes, every unit of every grade ends with its synthesis, no planned layer left in the net, lesson order), resolver behaviour (review links, earlier-year review after an error) |
| `packages/core/curriculum/coursesData.test.js` | the five grades; `lessonCount` counts published lessons; 1AM–3AM lessons all `coming_soon` with no routable path; their 524 LP ids; prerequisites exist and precede |
| `apps/api/tests/Feature/MoyenComingSoonImportTest.php` | coming_soon imported `draft` with its LPs; cross-year lesson prerequisite; publishing opens without touching the tier; admin authority kept; no recommendation to a draft prerequisite |
| `npm run check:learning-net` (in `check:lessons`) | the generated maps and the generation queue are up to date; the queue also fails if a planned lesson is missing from it |

## 7. Decisions (2026-10-13)

- **Programme grain, not LP grain.** The official موارد are stable and are what the student is examined on. LP
  decompositions belong to lessons and change with textbooks.
- **The 2022 plan's numbering is the id.** The منهاج 2016 adds three items the plan omits; they are kept (`x<k>`)
  so that nothing official is lost.
- **Planned 1AM–3AM lessons are data, not content.** No JSX, no route yet. Since 2026-10-14 they are catalogue
  entries (`coming_soon`) of active grades (§3bis). **Owner decisions for the rollout (2026-10-13)** — recorded in
  `docs/reports/MOYEN_ROLLOUT_PHASE1_REPORT_2026-10-13.md`: الكفاءات drafted by the platform from the textbooks; ALL
  learning points of all grades imported into the database, the not-yet-generated lessons shown as **draft cards,
  not clickable**; generation along the net (§4bis); each lesson **published as soon as it is generated**; practice
  from the term-exam corpus `docs/sources/moyen/exams/` (« على منوال اختبار الفصل … », new exercises generated in the
  same pattern when needed); links to earlier years also inside **exercises**, not only in « أستعدّ ».
- **Review links show planned lessons as text, not as hidden.** Telling a 4AM student "revise فيثاغورس, 3AM" is
  useful even before that lesson exists.

## 7bis. Three prerequisite graphs, one authority each (2026-11-17)

The catalogue holds three descriptions of « what needs what ». They are not three opinions: each has its grain and its job,
and a test forbids them to contradict each other.

| Grain | Where | Authority for | Read by |
|---|---|---|---|
| الكفاءة of the programme (224 items) | the net, `learning_net_moyen.json` | **dependencies across the four years**, and the weights | « أستعدّ » review links, « بوصلتي », « عُدّة الانطلاق », the generation queue |
| lesson | `prerequisiteLessonCodes` in `lessons_<g>_*.json` | the order in which lessons open; the database's lesson prerequisites | curriculum sync, recommendations |
| learning point (`<g>_<lesson>_P<n>`) | `pointPrerequisites` in the same files | the fine steps INSIDE a lesson and between neighbouring lessons | Mastery V2 (`learning_point_prerequisites`), the teacher's insights |

**The rule that holds them together (tested):** when a lesson declares that it needs another lesson — at the lesson grain or
through a learning point — the net must say so too: an item of the needed lesson is an ancestor of an item of the lesson, or
the two share an item. 390 pairs are checked. The pairs the net does not explain are a **closed list with a reason each**
(`learningNet.test.js › KNOWN`, seven pairs on 2026-11-17): a new gap fails the test, a solved one must leave the list.

## 8. Open items

### 8bis. Known gaps between the catalogue and the net (audit of 2026-11-17)

Eleven lesson pairs were unexplained by the net after the 13 links added that day. **Four were false prerequisites and were
corrected the same day (owner: « yes »)**; seven remain, a closed list in the test.

**Corrected — the book's sequence.** The 4AM catalogue had chained four lessons to the one before them, with no mathematical
need. These chips are shown to students (« راجع », `PrerequisiteLessonChips`) and imported as lesson prerequisites: a student
weak on the sphere was sent to the regular polygons. Each was replaced by the lessons of the lesson's CORE prerequisites in
the net (the established pattern for a cross-year prerequisite: a chip, never a lock; text only while the lesson is unpublished):

| Lesson | Was | Now |
|---|---|---|
| `insihab-shuaa` | `tarrid-muthallathiya` | `suwar-ashkal-insihab` (3AM) |
| `murakkibata-shuaa` | `barahin-ashia` | `insihab-shuaa`, `talim-nuqta-mustawi` (2AM) |
| `kura-julla` | `mudalaat-muntazama` (and the edge `P1 ← 4am_mudalaat-muntazama_P1`, removed) | `daira-mustalahat` (1AM) |
| `zawiya-muhitiya` | `khawas-dawaran` | `daira-mustalahat`, `mudallaat-zawiya` (1AM) |

The local database was synced (`smarter:import-curriculum`: 4 lesson prerequisites, 1 learning-point prerequisite); production
gets it at the next sync.

**Remaining — seven pairs:**

| Pairs | Kind | What it means |
|---|---|---|
| `mafhum-dawaran ← insihab-shuaa`, `zawiya-muhitiya ← mafhum-dawaran` | an analogy | a transformation after another, the angle at the centre and the angle of a rotation: context, not a need |
| `tahlil-ibara ← mutatabiqat-shahira`, `tarrid-taalufi ← mafhum-taalufiya`, `tarrid-taalufi ← tamthil-bayani-taalufi` | **grain** | one programme item is taught by lessons on BOTH sides of another lesson (`4am.m3.r02` covers expanding, before the identities, and factoring, after; `4am.m5.r12–r13` cover the linear and the affine problem lessons). The item grain cannot say it; the learning-point grain does |
| `muadala-ula ← nashr-tabsit` | the recall lesson | it carries a 3AM item; a 4AM → 3AM link would go back in time |
| `muqarana-kasrayn ← jam-tarh-kusur` (2AM) | a contradiction | the lesson says comparing needs adding, the net says adding needs comparing (`2am.m1.r08 → 2am.m1.r09`): to settle when 2AM is classified |

What the grain gaps teach: **65 items are taught by more than one lesson (one by six) and 69 lessons teach more than one
item.** A level measured on an item cannot always be pinned on one lesson; the home lesson (the first that teaches it) is
where a student is sent. This is why the picture of a الكفاءة planned for « عُدّة الانطلاق » keeps the learning-point level,
measured by the exercises, as its first source, and uses the item grain for the years where the student has no exercise yet.

### 8quater. Open for the owner — 18 « prerequisite taught later » pairs hidden by the guard (computed 2026-11-19)

Since 2026-11-18 `toolsForLesson` drops an item whose home lesson comes AFTER the lesson (§3). The guard is right for a
launch (it never measures what is not taught yet), but it also HIDES the pairs where the net says a lesson needs an item
that the catalogue teaches later — either the link, the item's home lesson or the catalogue order is wrong. Computed from
the net (`reviewLinksForLesson`, home lesson later in `LESSONS`): **18 pairs, all in 1AM–3AM (8 / 6 / 4), none in 4AM**;
all are `requires` links not yet weighted (1AM–3AM are not classified). To review with the net (`2am.m1.r05` is the case
that made the guard, `qisma-iqlidiya-hasr`):

| Grade | Lesson (order) | Needs item | Whose home lesson comes later |
|---|---|---|---|
| 1AM | `kusur-ashriya-kitaba` (1) | `1am.m1.r05` | `mana-jam-tarh` |
| 1AM | `kusur-ashriya-kitaba` (1) | `1am.m5.r01` | `hasil-qisma-kasr` |
| 1AM | `adad-ashri-mustaqim-mudarraj` (2) | `1am.m1.r04` | `muqaranat-adad-ashriya` |
| 1AM | `hasr-qiyam-muqarraba` (4) | `1am.m3.r03` | `qisma-ashriya-taqrib` |
| 1AM | `tatbiq-qaida-harfiya` (25) | `1am.m2.r08` | `mustatil-murabba-masaha` |
| 1AM | `naql-tul-muntasaf` (41) | `1am.m4.r08` | `nazir-shakl-khawas` |
| 1AM | `qays-zawiya-minqala` (56) | `1am.m4.r03` | `tasnif-zawaya-munassif` |
| 1AM | `tasnif-zawaya-munassif` (57) | `1am.m4.r08` | `nazir-shakl-khawas` |
| 2AM | `qisma-iqlidiya-hasr` (5) | `2am.m1.r05` | `kasr-hasil-qisma` |
| 2AM | `jam-tarh-kusur` (7) | `2am.m1.r08` | `muqarana-kasrayn` (the contradiction of §8bis) |
| 2AM | `nazirat-nuqta` (39) | `2am.m2.r02` | `markaz-tanazur-shakl` |
| 2AM | `nazir-shakl-khawas-2` (40) | `2am.m2.r02` | `markaz-tanazur-shakl` |
| 2AM | `mawshur-qaim-wasf` (60) | `2am.m7.r05` | `ustuwana-dawaran-wasf` |
| 2AM | `hajm-mawshur-qaim` (61) | `2am.m7.r04` | `ustuwana-dawaran-wasf` |
| 3AM | `mutawassit-mutawazin` (29) | `3am.m7.r08` | `fiat-takrarat` |
| 3AM | `mutawassit-mutawazin` (29) | `3am.m7.r09` | `tamthil-silsila-ihsaiya` |
| 3AM | `mahawir-munassifat` (41) | `3am.m4.r03` | `khassiyat-fitaghuras` |
| 3AM | `awda-daira-mustaqim` (45) | `3am.m4.r03` | `khassiyat-fitaghuras` |

Nothing was changed (no link, no order): each pair is the owner's call, best taken with the 1AM–3AM weights.

### 8ter. Other open items


- **Not verified.** The transcription has not been re-read against the PDFs by a second reader (`verified: false`).
- **1AM–3AM decomposition and الكفاءات are drafts** (`decisionStatus: "draft"`) until the owner validates them.
- **Scans:** 2AM is missing book p.140 and pp.196–198 (unit 12's « أدمج تعلّماتي »); 3AM is missing p.37; details
  in each `textbook-map.json › scanIssues`. **Owner decision D11 (2026-10-14): the missing pages are generated** in
  the book's format as declared platform additions when their unit is seeded.
- **Not yet implemented:**
  - `forwardLinksForLesson` is not shown anywhere yet.
  - Programme items are not imported into the API database. Mastery V2 knows LPs only; a `programme_items` table
    and an item code on `learning_points` would let the server recommend across years.
  - Cross-year LP→LP edges (§3bis): written lesson by lesson at generation, none yet.
  - The teacher memo (مذكرة) does not list the review links yet.
  - The 1AM–3AM catalogue (≈ 47 KB gzip of Arabic text) is in the entry bundle with the rest of `coursesData`
    (`BUNDLE_BOUNDARIES.md`); a per-grade lazy catalogue is a possible follow-up.
- **The 4AM `priorKnowledge` slugs are not mapped to net items.** The panel uses the lesson's `programmeItems`, not
  the diagnostic questions, so a weak answer does not yet highlight its own card.
