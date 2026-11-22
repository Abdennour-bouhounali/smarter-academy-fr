# The learning net — the collège programme as data (6e–3e)

> **Status (2026-11-22).** Covers the data model of the official programme, the links between its items, the resolver
> and what reads it. Imported from the Algerian platform (DZ dev 7f4cef1c) on 2026-11-22 and corrected. True here: the
> MODEL, the resolver, its tests and the generators.
>
> **The 3e net is LIVE since 2026-11-22** (`packages/core/curriculum/fr/`), written from `docs/curriculum/officiel/`
> and NOT yet validated by the owner (`verified: false`; the sheet to validate is `docs/curriculum/net-3e/REVIEW.md`):
> 108 programme items — 55 taught in 3e and 53 **stubs** of 4e / 5e / 6e — 113 links (74 core, 39 support), 17 threads,
> 13 units, 60 lessons (47 + 13 « Vers le brevet » syntheses), 166 learning points, every lesson `coming_soon`
> (unit 1 « Multiples et diviseurs » reshaped by the owner on 2026-11-23).
> 6e, 5e and 4e are still empty skeletons. What the sections below do not say yet:
> - a **stub** (`stub: true`) is a real prerequisite whose own grade has no lesson: it has NO home lesson
>   (`homeLessonOf` → `null`, `isStub(id)`), and every resolver result names it with `lesson: null` and
>   `noLessonInGrade: '<grade>'`. Invariants: every non-stub item has a home lesson; a stub's grade has no lesson at
>   all; no link ends on a stub. The day 4e gets lessons, its stubs become full items;
> - what the 2026 programme ADDS to 3e from 2028-2029 is kept apart in `fr/net/horizon_2028.json` (19 items with
>   their `attachesTo`), which the resolver does not load;
> - `WEIGHTED_GRADES` is `['3e']`;
> - a lesson's title is the platform's own (`titleSource: "editorial"`); there is no textbook reference anywhere;
> - **learning-point ids are locked**: `fr/learning_points.lock.json` + `learningPointsLock.test.js`. A point is
>   appended, then `npm run generate:lp-lock`; a reorder is refused once a lesson has a folder or is `available`;
> - the FR↔DZ table (which Algerian lesson teaches the same point) is `docs/curriculum/net-3e/fr_dz_table.json`;
> - a lesson may carry `beyondProgramme` (`points`, `decidedBy: "owner"`, `decidedOn`, `note`): its points that go
>   beyond the strict wording of the official text by the owner's decision (today the PGCD and Euclid's algorithm,
>   `trouver-le-pgcd` P1–P3 and `fraction-irreductible` P4, attached to `3e.m1.r07`). Tested in `catalogue.test.js`;
>   no reader shows it yet `[Planned: lesson:brief]`.

**Authoritative for:** the official programme of the four grades as data, the links between its items, the lessons
still to generate (`coming_soon` in the catalogue), cross-year review links, and what the database and Mastery V2 do
with unpublished lessons.
**Readable maps (generated):** `docs/curriculum/LEARNING_NET_MAP.md`, `docs/curriculum/learning-net-map.html` (from
`scripts/learning-net-map.template.html` — edit the template, never the output), `docs/curriculum/LEARNING_NET_WEIGHTS.md`.
**Sources:** `docs/curriculum/officiel/` (its `README.md` says which text applies to which grade and year).

## 1. Why it exists

The net solves four problems with one structure:

1. **The official programme is the contract.** Every item of the four years has a stable id, worded as in the
   official text. Every item has a lesson that teaches it, published or planned.
2. **No duplication.** When the programme comes back to a notion, the link says how: `extends` carries the added
   value, `consolidates` means recall without rebuilding.
3. **Navigation.** A lesson knows, one step back, which items of which earlier lessons it builds on, and one step
   forward, where its own items serve later.
4. **The base for generating lessons.** Units, lesson codes and the items each lesson covers exist as planned data
   before a lesson is built. A generated lesson implements them; it never invents a parallel decomposition.

## 2. Three layers, one authority each

| Layer | File (`packages/core/curriculum/fr/`) | Holds | Today |
|---|---|---|---|
| Official programme | `net/official_programme_college.json` | `grades` (6e–3e), `domains` (the five thèmes, `verified: false`), `segments`, `items`, verbatim, with their source | grades and domains only; 0 segment, 0 item |
| The net | `net/learning_net_college.json` | `linkTypes`, `threads`, `links` between items, a link into a classified grade carrying a **weight** (§2.4) | 0 thread, 0 link |
| The lessons | `{lessons,units,programme}_<grade>_2026_2027.json` | every lesson and unit, each lesson's `programmeItems` | empty lists; every grade `curriculumStatus: 'lessons_planned'` |

Resolver (pure, tested): `net/learningNet.js`. `createLearningNet({ programme, net, lessonFiles, unitFiles,
weightedGrades })` builds a net from any data (the tests use neutral fixtures); the module also exports the net built
from the shipped files, with `weightedGrades: []`. **It is not exported from the `@smarter-academy/core` barrel**,
because the barrel is in the entry bundle (`BUNDLE_BOUNDARIES.md`): import it by path, and only from code that is
already lazy or from scripts.

### 2.1 Items

Shape (as read by the resolver; the keys lost their `Ar` suffix on 2026-11-22, plan §4bis):

```json
{ "id": "<grade>.m<n>.r<nn>", "segment": "<grade>.m<n>", "grade": "3e", "number": 3, "text": "…", "domain": "…" }
```

- **Id format, tested:** `<grade>.m<n>.(r<nn>|x<n>)`; the numbered items of a segment run 1..n without a gap. What a
  « segment » is for the French programme (a thème, a sub-heading of the attendus…) is decided in Stage 2C
  `[NOT CHECKED 2026-11-22]` — the plan also asks for OPAQUE, append-only ids with a lock file (plan §2), which this
  format does not give yet.
- **An id never changes meaning.** A new item is appended; items are never renumbered.
- `parts` keeps the official sub-bullets of a composite item. **Formulas** are marked `$…$` so that `MathText` renders
  them; this markup is the only addition to the official wording.
- `verified: false` until a second reading against the official text.

### 2.2 Links

```json
{ "from": "<item>", "to": "<item>", "type": "extends", "addedValue": "…" }
```

| `type` | Meaning | Required field |
|---|---|---|
| `requires` | `to` cannot be built without `from` | — |
| `extends` | same notion further up the spiral: `to` starts from `from` and teaches only the added value | `addedValue` |
| `consolidates` | the programme repeats `from`: `to` recalls and consolidates it, never rebuilds it | `note` |

Links are meant to be **direct**: an item lists the step just below it, never the whole staircase (a writing rule,
not a tested one).

Invariants (`net/learningNet.test.js`, on fixtures): both ends exist and differ; never backwards in time (grade, then
segment of `from` ≤ those of `to`); no cycle, all types together; the added value / the note is present; every item
in exactly one thread; every item has a home lesson; lesson codes unique; a lesson declares items of its own grade, a
synthesis none, and a unit's synthesis comes last; no « renvoi en avant » between two published lessons of the same
grade; the catalogue does not contradict the net (§5, with a closed list `KNOWN` of explained gaps).

### 2.3 Threads and lessons

**Threads** are conceptual strands; each item belongs to exactly one; they are the lanes of the drawn map. None is
written yet.

**Lessons.** The resolver reports `status: 'available'` for a published lesson and `'planned'` for a `coming_soon`
one. A lesson may list several items and several lessons may share one. The **home lesson** of an item is the first
lesson in curriculum order (grade, then `order`) that declares it, synthesis excluded: a struggling student is sent
there. Lesson-level fields (`code`, `unitId`, `order`, `kind`, `programmeItems`, `pointsToLearn`,
`prerequisiteLessonCodes`, `pointPrerequisites`, `status`) are those of the catalogue `[NOT CHECKED 2026-11-22]` for
the exact list: the French files are empty, so no entry shows it.

### 2.4 The weight of a link — core / support

| `weight` | The test | What it allows |
|---|---|---|
| `core` | a student cannot pass the exercises of `to` while failing `from` | `from` is measured first by a launch; it can be NAMED as the cause of a difficulty on `to`; a success on `to` lets `from` be deduced |
| `support` | `from` helps but `to` can be passed without it — `weightNote` (one sentence) says why | measured after the core ones; never named as a cause; nothing is deduced through it |

- `WEIGHTED_GRADES` lists the grades whose incoming links are ALL classified. **Today `[]`**; 3e is weighted first
  (plan §5, 2C). An unclassified link counts as core in `toolsForLesson`.
- Tested: every link into a classified grade has one of the two weights; every item of a classified grade keeps at
  least one core prerequisite; when an item is reached by two links the stronger weight wins.
- The owner reviews the weights in the generated `docs/curriculum/LEARNING_NET_WEIGHTS.md`.

## 3. The resolver

| Function | Returns |
|---|---|
| `reviewLinksForLesson(code)` | one step back: the items the lesson builds on (`requires` plus its `extends`/`consolidates` bases), minus its own, grouped by home lesson, oldest first |
| `forwardLinksForLesson(code)` | one step forward: where the lesson's items serve later |
| `noRebuildForLesson(code)` | for each item that extends / consolidates an earlier one: the base, its home lesson, `addedValue` / `note` |
| `earlierYearReviewFor({ learningPointCode, lessonCode })` | the review links of the point's lesson, keeping only items of an EARLIER grade |
| `lessonCodeOfLearningPoint(lpCode)` | `<grade>_<lesson>_P<n>` → `lesson`, or `null` |
| `toolsForLesson(code, { max = 4 })` | the prerequisites a launch measures: core first, then support; never an item whose home lesson comes AFTER the lesson |
| `corePrerequisitesOf(itemId)`, `coreDependentsOf(itemId)` | one step along the core links |
| `weightOf`, `WEIGHTS`, `WEIGHTED_GRADES`, `homeLessonOf`, `lessonsOf`, `linksInto`, `linksFrom`, `itemRank`, `getItem`, `getSegment`, `getThreadOf`, `getLesson`, `GRADES`, `ITEMS`, `SEGMENTS`, `THREADS`, `LINKS`, `UNITS`, `LESSONS` | primitives |

On the shipped (empty) net every function answers an empty result, never a crash (tested).

**Readers in the tree:** `features/learning/EarlierYearReview.jsx` (« revoir » under a wrong answer in the practice
player, loaded by a dynamic `import()` on the first wrong answer; never gates, sends no evidence, renders nothing when
there is nothing earlier); the launch kit (`lessons/common/launchkit/`, `toolsForLesson`); the year compass
(`features/compass/`, `packages/core/compass/scope.js`, `scripts/generate-compass-index.mjs`); the class session
(`features/classSession/`, `pages/teacher/ClassSessionPage.jsx`); `scripts/lesson-brief.mjs`; the two generators of §4.
Their visible strings are still Arabic (steps 1C–1D).

**Relation to Mastery V2.** The net works at the programme-item grain. The finer learning-point graph
(`pointPrerequisites`, `<grade>_<lesson>_P<n>`) feeds `learning_point_prerequisites`, `RecommendationService` and the
teacher's insights (`LEARNING_ARCHITECTURE.md`).

## 3bis. Platform and database — unpublished lessons

- **Catalogue.** A `coming_soon` lesson is a card that cannot be opened; `getLessonPath(code)` returns `null` for a
  lesson that is not `available`, so every link to a lesson is safe. With no lesson at all, the student's home,
  courses and progress show `components/student/NoLessonYet`.
- **Import.** `exportCurriculum.mjs` → `smarter:import-curriculum` imports grades, units, lessons and their learning
  points. `CurriculumImporter::publicationOnCreate` creates a `coming_soon` lesson with `publication_status = draft`
  (the column defaults to `published`, and every server gate reads `publication_status`). On re-import the admin keeps
  authority: a `coming_soon` lesson is never `published`; the flip `coming_soon` → `available` turns the import's
  `draft` into `published`; an `available` lesson the admin set to `draft` stays `draft`. `smarter:curriculum-sql`
  emits the same rule. The tier stays admin-owned: new lessons are created `free`.
- **Mastery V2 ignores unpublished lessons**: `ContentAccess` refuses a draft lesson (no progress row on its points);
  the class reads `visibleToStudents`; the teacher map's prerequisite detail and `RecommendationService` filter on the
  prerequisite lesson's publication.
- Tests: `apps/api/tests/Feature/ComingSoonImportTest.php`.
- `smarter:registry-health --gate`, read by `check:activation-drift`, fails when the export activates a grade the
  database does not have (needs a local database; this folder has none yet).

## 4. Generation order and editing

- `scripts/learning-net-queue.mjs` writes `docs/curriculum/GENERATION_QUEUE.md` and `generation-queue.json`: Phase A,
  what the anchor grade (the last of `GRADES`, i.e. 3e) needs NOW, unit by unit, its direct prerequisites at the most
  recent year; then phases B… the whole upstream chain of every lesson, from the anchor down; a synthesis right after
  its unit's last lesson; the « renvois en avant » listed. Empty today.
- **Fix a transcription:** edit the item's `text`; never its id. **Add a link:** append to `links`, then
  `npx vitest run curriculum/fr/net` in `packages/core`. **Re-scope a lesson:** edit its `programmeItems`. **Weigh a
  link:** set `weight` (and `weightNote` for a support); when unsure, it is support.
- **Always regenerate:** `npm run generate:learning-net` (the maps, the weights table, the queue). `npm run
  check:learning-net`, part of `check:lessons`, fails while one of them is stale.
- How a lesson is generated from its entry (which pipeline, which brief) is plan §8; `npm run lesson:brief -- <id>`
  prints what the net says of a lesson.

## 5. Three prerequisite graphs, one authority each

| Grain | Where | Authority for |
|---|---|---|
| programme item | the net | dependencies across the four grades, and the weights |
| lesson | `prerequisiteLessonCodes` in `lessons_<g>_*.json` | the order in which lessons open; the database's lesson prerequisites |
| learning point (`<g>_<lesson>_P<n>`) | `pointPrerequisites` in the same files | the fine steps inside a lesson and between neighbouring lessons |

**The rule that holds them together (tested):** when a lesson declares that it needs another lesson — at the lesson
grain or through a learning point — the net must say so too (an item of the needed lesson is an ancestor of an item
of the lesson, or the two share an item). The pairs it does not explain are a closed list with a reason each
(`learningNet.test.js › KNOWN`): a new gap fails, a solved one must leave the list.

## 6. Validation

| Gate | What it checks |
|---|---|
| `packages/core/curriculum/fr/net/learningNet.test.js` | §2 invariants and the resolver, on fixtures; the shipped net is an empty skeleton that answers without crashing |
| `packages/core/curriculum/coursesData.test.js` | the catalogue built from the four grades |
| `apps/api/tests/Feature/ComingSoonImportTest.php` | `coming_soon` imported `draft`; publishing opens without touching the tier; admin authority; no recommendation to a draft prerequisite |
| `npm run check:learning-net` | the generated maps and the queue are up to date |

## 7. Not yet implemented

- The French items, links, threads, weights, units and lessons (Stage 2C), and the opaque learning-point ids with their
  lock (plan §2).
- `forwardLinksForLesson` is shown nowhere.
- Programme items are not imported into the API database: Mastery V2 knows learning points only.
