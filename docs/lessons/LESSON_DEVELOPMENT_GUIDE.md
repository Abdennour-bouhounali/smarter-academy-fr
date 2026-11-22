# Lesson Development Guide — read this before creating a lesson

> **This is the entry point.** Everything here describes the platform as it is
> implemented today, for the Algerian 4AM curriculum. Where a rule has an
> authoritative contract elsewhere, this guide states the rule and links to it
> rather than repeating it — if the two ever disagree, the contract wins and
> this guide is the file to fix.

The live reference is the 4AM textbook unit 1 under
`apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/`:
eight textbook lessons plus one synthesis. Since 2026-09-30 a second unit sits
beside it, `…/hisab-judhur/` « الحساب على الجذور » (five lessons and their synthesis
« أدمج تعلّماتي », three new manipulation types — MANIPULATION_CONTRACT §2quater), and since
2026-10-01 a third, `…/hisab-harfi/` « الحساب الحرفي » (three lessons and their synthesis, two new
manipulation types on the football pitch — MANIPULATION_CONTRACT §2quinquies), and the same day a
fourth, `…/muadalat-mutarajihat/` « معادلات ومتراجحات من الدرجة الأولى بمجهول واحد » (four lessons and
their synthesis, four new manipulation types — MANIPULATION_CONTRACT §2sexies), and the same day a fifth,
`…/jumal-muadalatayn/` « جمل معادلتين من الدرجة الأولى بمجهولين » (three lessons and their synthesis, three new
manipulation types — MANIPULATION_CONTRACT §2septies), and since 2026-10-02 a sixth,
`lessons/moyen/4am/tanasubiya_duwal/tanasubiya-dala-khattiya/` « الدالة الخطية والتناسبية » (five lessons and their
synthesis, four new manipulation types — MANIPULATION_CONTRACT §2octies), the first unit under a DISPLAY ميدان decided
by the owner, « ميدان التناسبية والدوال », and the same day a seventh under that ميدان,
`…/tanasubiya_duwal/dala-taalufiya/` « الدالة التآلفية » (five lessons and their synthesis, five new manipulation
types — MANIPULATION_CONTRACT §2nonies), and the same day an eighth, `…/tanasubiya_duwal/ihsa/` « الإحصاء » (four lessons and
their synthesis, four new manipulation types — MANIPULATION_CONTRACT §2decies; programme domain « ميدان تنظيم المعطيات »), and the
same day a ninth, the first GEOMETRY unit, `lessons/moyen/4am/handasa/khassiyat-talis/` « خاصية طالس » (three lessons and their
synthesis, five new manipulation types — MANIPULATION_CONTRACT §2undecies — under the programme's own « ميدان الهندسة »).
These nine units are the **only** lesson content in the repository. The French-era lessons (`lessons/college/`, `lessons/lycee/`), their
specs, practice content, e2e scripts and French-only engines were deleted on
2026-09-25; older docs that cite them are describing git history.

**Frozen reference (2026-09-29).** The lesson architecture was audited and
frozen for generation: §14 is the generation contract — what a generated
lesson must implement, reuse and pass.

**Loading (since 2026-10-14).** A new lesson costs the entry bundle ≈ 20 bytes gzip — one line of the GENERATED
lesson index (`lessons/lessonIndex.generated.json`: id, level, grade, chapter, `[number, slug]` per module). Its
`routes.jsx` and `lesson.config.js` load WITH the lesson through ONE lazy route boundary
(`lessons/lessonRouteBoundary.jsx`, mounted once in `App.jsx`), its lab strings (`lesson.manipulation.json`) load with
the first lesson opened, the shared lesson runtime is one lazy chunk, and each page/module is its own lazy chunk. You
never touch `App.jsx`: run `node scripts/generate-lesson-index.mjs` (`npm run check:lessons` fails when the index is
stale, and when the entry exceeds its budget). Never import something heavy from `routes.jsx` or
`_unit/lessonRoutes.jsx` — every lesson shares them. See
[`../architecture/BUNDLE_BOUNDARIES.md`](../architecture/BUNDLE_BOUNDARIES.md).

---

> **SUPERSEDED 2026-11-19 (owner): ONE size, 1366×768, alone — root `CLAUDE.md` « Screens and writing ».** What follows is the rule before that date.
> **Supported screens: tablet and laptop only (owner, 2026-10-15)** — widths ≥ 768 px (768×1024, 1024×768, 1280×800, 1366×768, 1920×1080). Phones are NOT supported: do not design, tune or test for phone widths (320–430 px); older mentions of them below are superseded.
> **Enforced since 2026-10-27 (owner):** every lesson route (index and modules) and every practice route (`/espace/pratique/*`, `/espace/tashih/:id`, the teacher's `/enseignant/pratique/*`) sits behind the layout route `components/auth/RequireLargeScreen.jsx`. On a phone (`(max-width: 767px)`, or a touch screen under 500 px high = a phone held landscape) it renders « محتوى الدروس يظهر فقط في شاشة الحاسوب — رجاء افتح المنصة في الحاسوب لاستفادة قصوى » (`common.json › largeScreenOnly*`) instead of the content, and nothing of the lesson loads. **Generate for tablet and laptop ONLY** (owner, 2026-10-27): no `sm:` / `md:` Tailwind variant, no `@media (max-width: <768px)`, no phone-only element, no lab width branch under the 354 px lab-box floor. The phone code of every existing lesson was removed the same day. The rule, the measured floor and the exceptions are in `MANIPULATION_CONTRACT.md` §8bis « Screen floor ». Branches from 360 px up stay: a tablet in portrait, or the map column at 1024 px, really gives a lab that width. Test: `RequireLargeScreen.test.jsx`.

## 1. Before you start

**Read, in this order:**

1. This guide, end to end.
2. [`../architecture/LESSON_CONTRACT.md`](../architecture/LESSON_CONTRACT.md) — the lesson and module contract, the stage sequence, the unlock rules, and the non-blocking invariant.
3. [`../architecture/INTERACTION_PEDAGOGY.md`](../architecture/INTERACTION_PEDAGOGY.md) — how a concept becomes manipulable. §6bis (the opening manipulation) and §29 (the checklist) are normative.
4. [`../architecture/ARABIC_RTL_CONTRACT.md`](../architecture/ARABIC_RTL_CONTRACT.md) — language, direction, typography, terminology.
5. [`../architecture/KNOWLEDGE_DEPENDENCY.md`](../architecture/KNOWLEDGE_DEPENDENCY.md) — nothing may be demanded before it is taught.
6. The contract for whatever you are actually building: [`MANIPULATION_CONTRACT.md`](../architecture/MANIPULATION_CONTRACT.md), [`EXERCISE_CONTRACT.md`](../architecture/EXERCISE_CONTRACT.md), [`CLASSROOM_MODE.md`](../architecture/CLASSROOM_MODE.md), [`KNOWLEDGE_MAP.md`](../architecture/KNOWLEDGE_MAP.md).

**Then read two existing lessons** (§9 names which and why).

**What you need before writing anything:**

- The **textbook extraction** for the unit. Every pedagogical element of a
  textbook lesson cites `docs/sources/<grade>/<unit>/extraction.json` through a
  `source` object. If the extraction does not exist for your unit, it must be
  produced first — content is never invented, and the textbook is never
  "completed" because it seems incomplete. **The extraction is the REFERENCE of
  what the lesson must teach (its الكفاءات, definitions, notations, expected
  answers) — not the script of the lesson.** The entry point, the examples, the
  contexts and the order of ideas are DESIGNED by the platform (§4ter, owner rule
  2026-10-14).
- The **catalogue entry**: the lesson must exist in
  `packages/core/curriculum/dz/lessons_4am_2026_2027.json` with its
  `pointsToLearn`, and its unit in `units_4am_2026_2027.json`.
- The **learning point ids**, which are derived, never typed by hand:
  `{gradeId}_{lessonId}_P{n}` in `pointsToLearn` order.

---

## 2. The hierarchy and its words

```
المجال   chapter   (ميدان — a curriculum domain)
  └── الوحدة   unit   (a textbook unit — a GROUP OF LESSONS)
        └── الدرس   lesson
              └── المحور   module   (the engine's word for a module)
                    └── steps / units of presentation
                          └── questions, manipulations, exercises
              └── الكفاءات   learning points
```

**الوحدة is a unit of the textbook, never a module. المحور is a module, never a
unit.** Changing this vocabulary silently breaks four navigation surfaces and
the Classroom Mode toolbar.

A **محور's breadcrumb names three levels and no more** (since 2026-09-24):

```
الوحدة  /  الدرس  /  المحور
```

Neither الرئيسية nor the grade: the student knows which class they are in, and
the way back to the catalogue is in the sidebar. What helps here is knowing
*where in the textbook* they are. The الوحدة comes from `MODULE_CTX`
(`unitTitle`/`unitPath`, built once in the unit's `_unit/moduleContext.js`
from `unitMeta.js`); a lesson that declares none falls back to its المجال, so the trail is never two levels long. The one exception is internal: Classroom Mode calls
the slices of a presented module "units" in code (`moduleUnits`), which is a
presentation concept, not a curriculum one.

A lesson's `kind` is `'lesson'` (default) or `'synthesis'` — the unit's
« أدمج تعلّماتي », which is **never counted as a درس**.

---

## 3. Files of a lesson

```
lessons/moyen/4am/<chapter>/<unit>/<lesson>/
├── lesson.config.js     the contract: id, kind, unit, modules, stages, LPs, resources
├── index.jsx            three lines: renders <LessonIndex config basePath />
├── routes.jsx           import.meta.glob of modules/ + buildLessonRoutes(...)
├── moduleContext.js     one line: buildModuleContext(LESSON_CONFIG, LESSON_BASE_PATH)
├── knowledge.jsx        LESSON_KNOWLEDGE — the single source of the lesson's knowledge
├── knowledgeGraph.js    KNOWLEDGE_GRAPH — the progressive map's structure, relationships and
│                        guidance (re-exported by knowledge.jsx; KNOWLEDGE_MAP.md Part A).
│                        Every lesson has one since 2026-09-29; required for new lessons (§14.2)
├── content/
│   ├── textbook.js      the textbook's own words, each block with its `source`
│   └── exercises.js     the textbook's exercises attached to this lesson
└── modules/
    └── Module<NN><Descriptor>.jsx     one file per module
```

Shared across the unit, in `_unit/`: `unitMeta.js` (ids, Arabic labels, the
`src()` and `addition()` source helpers), `moduleContext.js`
(`buildModuleContext`), `lessonRoutes.jsx` (`buildLessonRoutes`) and
`prepDiagnostic.jsx` (`prepQuestion`). Since 2026-09-30 (unit 2) the three
factories are written ONCE in `lessons/common/unit/` and each unit's `_unit/`
only binds them to its `unitMeta` in one line each — a new unit writes its
`unitMeta.js` and those three lines, never a copy of a factory
(`LESSON_CONTRACT.md` « Les fabriques sont communes »).

`index.jsx`, `routes.jsx` and `moduleContext.js` are boilerplate. The real work
is `lesson.config.js`, the content files, `knowledge.jsx` and the modules.

**How a lesson is mounted (2026-10-14).** Nothing to wire by hand. The FOLDER name must be the lesson id (the
loader finds a lesson by its folder). `node scripts/generate-lesson-index.mjs` adds the lesson to
`lessons/lessonIndex.generated.json`; `App.jsx` mounts one `<basePath>/*` route per index entry, which loads the
lesson's `routes.jsx` (and so its config) and then mounts the routes it builds. Code that needs the full config
outside the lesson's own pages calls `loadLessonConfig(id)` / `useLessonConfig(id)` (`lessons/registry.js`,
`lessons/useLessonConfig.js`); synchronous questions (built? module count, first module, module path) go to
`isLessonBuilt` / `getTotalModules` / `getFirstModuleNumber` / `getModulePath`, answered from the index. Lab
strings go to `i18n/locales/ar/lesson.manipulation.json` (keys `lesson:manipulation.<type>.*`), never `lesson.json`.

### Adding a GRADE (done for 1AM, 2AM and 3AM, 2026-10-14 — cycle moyen rollout phase 2)

A grade is data, not code. It is never a parallel catalogue.

1. **The trio** in `packages/core/curriculum/dz/`:
   - `programme_<g>_2026_2027.json`: its ميادين and topics. For 1AM–3AM it is minimal, derived from
     `net/official_programme_moyen.json`: chapter ids `ansab_al_aadad_wal_hisab` / `tanasubiya_duwal` / `handasa`,
     one topic per مقطع.
   - `units_<g>_2026_2027.json`: the textbook's units, plus `chapterIcons` / `chapterOrder`.
   - `lessons_<g>_2026_2027.json`: every lesson in the 4AM shape. A lesson not yet generated has
     `status: "coming_soon"`. `LEARNING_NET.md` §2.4 lists the fields.
2. **Register it once:**
   - `coursesData.js › DZ_MOYEN_GRADES` (one line);
   - `net/learningNet.js › LESSON_FILES / UNIT_FILES`;
   - `activeGrades.js › ACTIVE_GRADE_IDS`;
   - the literal grade lists of the two LAZY `import.meta.glob` of `apps/web/src/lessons/lessonLoaders.js`
     (`lesson.config.js` and `routes.jsx`; `registry.test.js` compares each with `ACTIVE_GRADE_IDS`, `check:routes`
     checks every lesson's grade is globbed). The lesson index (`scripts/generate-lesson-index.mjs`) follows
     `ACTIVE_GRADE_IDS` by itself.
   - The teacher memo's glob already covers `lessons/moyen/*/`.
3. **What a `coming_soon` lesson gets for free:** a non-clickable card « قيد الإعداد ». Its unit page shows its
   الكفاءات with no progress or gesture. `getLessonPath` returns `null`, so no link leads to it. It is in the
   database as a `draft` lesson with all its LPs, which Mastery V2 ignores (`LEARNING_NET.md` §3bis).
4. **Lesson codes and unit codes are unique across all grades** (`coursesData.test.js`, `learningNet.test.js`): the
   API resolves lessons by bare code.
5. Then the DB handshake (§11) and `npm run generate:learning-net`.

Generating one of those lessons follows §14 and `LEARNING_NET.md` §4. Publishing it is § « Publish a lesson »
(§11).

### Generating a 1AM–3AM unit LESSON BY LESSON (phase 3, first done 2026-10-14 — 1AM unit 2, `mana-jam-tarh`)

The 4AM units were written whole; 1AM–3AM units are generated one lesson at a time along the net queue, each lesson published
before the next. What that adds to « Adding a textbook UNIT »:

- **Seed the unit at its first GENERATED lesson** (not necessarily its first lesson): `lessons/moyen/<g>/<chapter>/<unit>/_unit/` with
  `unitMeta.js` (grade labels: `GRADE_ID '1am'`, `GRADE_LABEL 'السنة الأولى متوسط'`, `PRINT_SUBJECT 'الرياضيات · السنة الأولى متوسط'`,
  `CHAPTER_TITLE` = the grade's own ميدان name, D13) and the three one-line bindings. Its `prepDiagnostic.test.js` compares the
  lessons on disk with the unit's **`available` lessons of the catalogue**, never with a fixed count.
- **Extract the whole unit once** (`docs/sources/<g>/unit<N>/build-extraction.py` → `extraction.json`, answers computed in exact
  decimals): its `destinations` may name lessons that are still `coming_soon`. `check:textbook` counts those elements **pending**
  (« en attente ») until the lesson exists; a pending destination must be a real catalogue lesson, and no other lesson may cite it.
- **Publishing flips one entry** (§11): `coursesData.test.js` now checks, for 1AM–3AM, « `available` ⇔ `lesson.config.js` on disk »
  (like 4AM's `decomposition.test.js`) and that `lessonCount` counts the published ones.
- **Two lessons share one programme item** (1AM `1am.m1.r02`: `kitabat-adad-tabii` and `kusur-ashriya-kitaba`, 2026-10-14): write the
  BOUNDARY once in the unit's `build-extraction.py` header (what each lesson owns), split a textbook element that straddles it with
  `destinations.<id>.items` (know-4 p. 13: item a → the first lesson, item b → the second), and move a draft الكفاءة's overlapping part
  to the lesson that teaches its prerequisite knowledge (never two LPs teaching the same thing — the net's no-duplication rule).
- **Authors in parallel on one lesson**: the lead writes the lesson, a lab author and a bank author work from a brief kept in the
  repo (`docs/sources/1am/unit2/brief-authors.md`: the lab's FIXED props contract, file ownership, the bank's provenance rules).
- **Make it visible locally** (owner, 2026-10-14): the DB handshake publishes the lesson, its modules (they follow the lesson)
  and its exercises by itself since 2026-11-11 (§ « Publish a lesson » step 4), so the owner can browse it before `dev` is promoted.
- **Textbook exercise figures in أتمرّن** (`hasil-qisma-kasr`, 2026-10-15): `TextbookExercise` draws no figure. A module renders the exercise's `GeoFigure` data (`content/figures.js`: hidden points, `polygons` tones for coloured cells, `figureQuality` + recomputed fractions in `content/content.test.js`) above it; a redesigned figure (illegible scan, e.g. the test tubes) says so in one line (`REDRAWN_NOTE`). Keep each figure ≤ 150 px wide on phones or the page overflows at 320 px (an exercise with a long KaTeX chain in a batch `label` did too: split it).
- **Batch 4 lessons (`kusur-ashriya-kitaba`, 2026-10-15) — patterns to reuse.** (1) `validate:lessons` requires the two levels of a lab resource to carry the SAME `objective` string. (2) One lab TYPE may serve two modules with different worlds (`decimal-comma`: `mosaic` in module 1, `machine` in module 4): the module passes its own `world` and `tasks`, the `levels.js` preset only fixes the module-1 numbers. (3) An exercise redesigned from several textbook elements cites the others in `cites: [src(...)]` (collected by `check:textbook`); `src()` without `number` so the student never sees « تمرين N ». (4) Final-test epreuves stay LITERAL in `Module09Itqan.jsx` (the audit reads them statically) while `FINAL` in `content/exercises.js` holds the same data for `content.test.js`, which recomputes every key in exact BigInt arithmetic and asserts the module source contains each option. (5) A bare number in an option (`3,8`) is wrapped as a math island by `vary`/`num` in `exercises.js`. (6) `learningNet.test.js` forbids a forward net link between published lessons for 4AM only.
- **Batch 4 entry 2 (`muqaranat-adad-ashriya`, 2026-10-15) — more patterns.** (1) A lab used ALONE in a module (`levels={false}`, e.g. `ruler-compare` in module 3 with its own `tasks`) is declared in `resources` WITHOUT `level` / `objective` / `experience` (a levelled resource without its twin fails `validate:lessons`); only the module-1 workspace carries the two levelled resources. (2) Comparison rows are written from DATA: `rel(p, q)` builds the symbol row (`<`, `>`, `=` in a fixed order, the key computed with exact integers) and `content.test.js` RE-parses each label with its own BigInt comparator — never trust the helper that wrote the key. Chains « a < b < c » are parsed back and checked sorted; `FINAL` epreuves carry a `kind` (`trueStatement`, `larger`, `ascending`, `max`) that the test evaluates. (3) A textbook ACTIVITY made of student answers to judge (act-5) becomes a `trueFalse` exercise (`rows: [{ text, answer, why }]`) in أتمرّن, not the entry. (4) `GuidedProblem.illustration` of kind `tags` takes 1–3 cards (`validateProblem`): group several values on one card (`lines`). (5) The unit's extraction destinations follow the redesign: `act-5`, `deep-3` ③④ and `ict` moved to module 4 in `build-extraction.py`.
- **Batch 4 entry 3 (`masahat-muhit-sath`, 2026-10-15, the first 1AM geometry-measure lesson) — patterns to reuse.** (1) A unit whose chapter is `handasa` is seeded under `lessons/moyen/1am/handasa/<unit>/` with `CHAPTER_TITLE` = the grade's own ميدان name (« ميدان الأنشطة الهندسية »). (2) **Squared-paper figures are DATA, not hand-typed GeoFigures**: `content/figures.js › cellFigure(rows)` turns rows of text (`#` full cell, `.` empty, `◤ ◥ ◣ ◢` half cells cut by a diagonal) into a validated GeoFigure (one polygon per cell, contour segments, `grid: true`); area and perimeter are NEVER typed — exercises derive their keys from the cells and `content.test.js` recomputes them with different code (symmetric difference of cell sides) and checks every distractor false. A lesson `config.lessonProblem.figure` must be a pure literal (write the outline polygon, test it with the shoelace formula). `GeoFigure` inside a BossFinal prompt takes the JSX prop `inline`. (3) A lab used in module 1 with two levels AND alone in module 3 in another world (`tile-yard`: `yard` then `floor`) declares only the module-1 workspace resources with `level`/`objective`; the module-3 resource has none. (4) When two tools of the lesson would state the same idea (the unit-② rule in the method AND in the next question), the METHOD keeps only what the lab has already shown and the rule is named after its question (`wahdatan-adad`). (5) Exam corpus with NO exercise tagged for the lesson's items (`1am.m2.r06/r07`): the bank models the nearest register (perimeter-as-boundary and fence cost) with only the lesson's concepts, `term_exam_modelled`.
- **Phase A entry 2 (`khassiyat-fitaghuras`, 3AM, 2026-10-20, the first 3AM geometry lesson) — patterns to reuse.** (1) **Two lessons share the same programme items** (`3am.m4.r03`, `3am.m4.x1` for the property AND its converse): the boundary is written once in the unit's `build-extraction.py` header — the property's lesson owns the direct statement, computing a side and the CONTRAPOSITIVE (prove « غير قائم »), the converse's lesson owns « IS right », deciding the nature in both cases and distinguishing the two in a proof; every « قائم أم لا » textbook element is split with `destinations.<id>.items` (the « no » case here, the « yes » case to the converse: `method-2` FEJ/ABC, `now-2` b/a, `ex-16` 2/1, `self-4` HDB/RPM). (2) **A calculator key is not a rebuild**: when a later year BUILDS a notion (4AM `jidhr-tarbii` builds √), the earlier lesson uses only the KEY (`√` → exact `√n`, a value rounded half-up, never truncated) and its lab may offer the key only after the hand has met the resistance (`ROOT_AFTER` pours). (3) **Right triangles are drawn AT SCALE** (coordinates = lengths in cm) through a small `triangle()` helper in `content/figures.js` that records `MEASURES`; `content.test.js` re-measures every printed length from the coordinates and checks every marked right angle by a null dot product; a triangle that only LOOKS right (`ex-17`, 88,8°) gets no right-angle mark. (4) **Independent arithmetic in tests**: keys are recomputed with decimals as BigInt hundredths (squares in ten-thousandths, `isqrt`), never with the lesson's core module. (5) **The final test's options are literal in `Module08Itqan.jsx` while `FINAL` holds the data**: an option with a backslash (`\\neq`, `\\sqrt`) appears DOUBLED in the raw module source — the content test compares `o.replace(/\\/g, '\\\\')`. (6) **A published lesson changes a net test's fixture**: `learningNet.test.js` asserted the Pythagoras lesson as `planned`; publishing flips it to `available` (update the assertion in the same task).
- **Phase A entry 3 (`tabsit-hadhf-aqwas`, 3AM unit 4 « الحساب الحرفي », 2026-10-20, the first lesson of the unit) — patterns to reuse.** (1) **The boundary with the NEXT lesson of the unit is written in `build-extraction.py`'s header** (here: simplify = like terms, product of monomials, brackets after + / −, sum vs product; `nashr-jabri-3am` owns `k(a + b)` and `(a + b)(c + d)`), and a textbook element that straddles it is split by `items` (`deep-43` أ، د here and ب، جـ there; `now-59` ① / ②); an element that only the next lesson can use goes there even when the book places it in the first (`deep-47`, the magic square). The whole-unit extraction (79 elements, pp. 54–69) computes every printed answer with an exact `Poly` class and re-checks it by assertion. (2) **Review links toward lessons not yet published** (`tawzi-darb-jam-tarh`, `amaliyat-natiqa`): « أستعدّ » measures exactly the two net items with two platform statements each, plus two rewritten textbook statements (`prep` 5 and 8); `pointPrerequisites` stay intra-lesson. (3) **Algebraic answers are CHOSEN, not typed**: an expression is DATA (`{ c, p }` terms and `brackets.js` groups), every option is written by `tex()` from terms, and `content/content.test.js` re-evaluates the key and every distractor at 9 values of x with its own evaluator (two polynomials of degree ≤ 2 that agree at 9 points are equal; the « only the first sign changed » and « signs kept » distractors are tested FALSE). (4) **Where `$…$` is NOT rendered**: a JSX `prompt={<span>…$x$…</span>}`, a brick `lead` and a `GuidedProblem` `data[].text` (InfoSorter) print the dollars raw — wrap a prompt in `<MathText>{String.raw`…`}</MathText>` and keep leads and `data` texts free of `$` (« 2x + 5 » in plain text); the e2e raw-text scan catches it. (5) **`GuidedProblem` rules met here**: a `solution` step needs ≥ 2 lines, every ask needs an answering `numeric` / `choice conclude` step, `illustration` kinds `plan` (shape `tri` with its three side expressions, or `rect` with `w` / `h`) and `tags` carry expressions as plain strings that must appear in the statement. (6) **One screen is measured on the REAL lesson page at 1024×768 with the sidebar open** — the content column is only ≈ 450–520 px wide there, so a lab that fits on a scratch page can still overflow (`like-terms` stacks its side panel under the table below 660 px and was tightened for 1024×768). (7) The unit's `prepDiagnostic.test.js` is red until the catalogue flip (« the published lessons »), as for every first lesson of a unit.
- **Phase A entry 4 (`nashr-jabri-3am`, 3AM unit 4, 2026-10-21, the SECOND lesson of a unit whose first is published) — patterns to reuse.** (1) **A lesson that follows a published lesson of the same unit** recalls it in a « تذكّر » `TextbookBox kind="remark"` placed in the `brief` of معارف (with `getLessonPath(code)` as a link — the base IS published, so the link shows), never reconstructs it, and takes a cross-lesson LP edge ALONG the net link (`3am.m5.r01 → 3am.m5.r02`: `P4 ← 3am_tabsit-hadhf-aqwas_P1`, `P1 ← …_P3`); « أستعدّ » still measures every review item (the unpublished one with two platform statements, the published one likewise, plus two rewritten textbook statements). (2) **Elements that straddle a boundary are re-routed in `build-extraction.py` when the second lesson is generated**: the whole-unit extraction already named this lesson as destination for ~35 elements, the lead re-read pp. 55 and 57–67 at 100–220 dpi, set `verified: True`, replaced the typed answers by `Poly` computations with assertions (a mis-computed value was caught: `(5·1/5 − 6)(1/5 + 4) = −21`, `(x−4)² − (x−2)(x−8) = 2x`), moved the elements that belong to the synthesis (`deep-35`, `deep-47`: an illegible grid) there with a note, and gave the module numbers of the ones the modules cite; the **bank cites the rest** (23 elements, one adapted exercise each — `check:textbook` accepts a citation by the same lesson's practice content). (3) **Two worlds of one lab type, one per module** (`area-split`: `plot` levelled in module 1, `arrows` alone with `levels={false}` and the lesson's `tasks` in module 3): the module-3 resource declares no `level` (batch-4 pattern). (4) **Algebra answers as DATA**: an exercise row carries `products: [{ sign, f1, f2 }]` (`f1`, `f2` = lists of `{ c, p }` terms), its key is `expandAll(products)` written by `tex()`, `content.test.js` re-evaluates the key and every distractor at 9 values of x with its own evaluator (a product of two degree-≤ 1 factors is degree ≤ 3: 9 points suffice); the lab tasks are re-derived from the written expression in the same test. (5) **Remarkable identities and factoring stay out**: `(x+3)²`, `(x+1)(x−1)`, `2010 × 81` are expansions (mental-calculation applications in the bank); the extraction header says so once. (6) **The textbook's ACTIVITY (two pre-cut rectangles) becomes an application**: the entry is a plot whose cut the hand moves, and the book's rectangles are the first exercise of أتمرّن (`act-3`). (7) **`GuidedProblem` details met here**: a `choice` with `ask` must be `role: 'conclude'` (a `translate` step may not carry `ask`); `illustration.kind: 'tags'` text values are free but `plan` sides must be literal expressions of the statement.
- **« مخطط بأقواس »** — the textbook's tape diagram (a line cut into parts, an arc above each part, an arc below the whole) is the
  shared figure `lessons/common/components/ArcTape.jsx` + `arcTape.js`: lesson figures, `statement.figure` with `kind: 'tape'`
  (dispatched by `StatementFigure` / `validateStatementFigure`), a مسألة `figure`, and the live tape of the `story-bars` lab. Lengths are
  schematic (≥ 16 % of the width per part); a statement tape must CLOSE (`validateArcTape`), a lab tape shows the gap / overflow of a
  wrong value. Unique SVG ids per instance (`useId`).
- **The first lesson of a new grade (2AM, `qisma-iqlidiya-hasr`, 2026-10-14) needed NO new wiring**: « Adding a GRADE » had
  already globbed `2am` (`lessonLoaders.js`), the index generator follows `ACTIVE_GRADE_IDS`, and the practice tooling reads every
  grade folder (`content/practice/2am/` is simply created by the bank). Seed `_unit/unitMeta.js` with that grade's labels
  (`GRADE_ID '2am'`, `GRADE_LABEL 'السنة الثانية متوسط'`, the grade's own ميدان name). While the lesson is still `coming_soon`, its
  MODULE pages mount (`…/<lesson>/nashat`) — that is what a parallel lab author opens — but its summary page says « هذا الدرس غير
  متاح حالياً » (the DB lesson is `draft` until the publish flip) and two tests are red by design until the flip:
  `coursesData.test.js` (« available ⇔ on disk ») and the unit's `prepDiagnostic.test.js` (« the published lessons »).
  `e2e/moyen-draft-grades.mjs` checked the drafting notice on the grade that still had NO published lesson (3AM, until
  `quwat-adad-nisbi` on 2026-10-21 — since then no grade is entirely draft: the script checks that 3AM has NO notice, that its other
  unit cards stay « قيد الإعداد », that a unit page links only to its published lesson, and that a « راجع » toward a published 3AM
  lesson is a link).
- **The first lesson of 3AM (`quwat-adad-nisbi`, 2026-10-21) needed NO new wiring either** (3AM was globbed by « Adding a GRADE »):
  seed `_unit/unitMeta.js` with `GRADE_ID '3am'`, `GRADE_LABEL 'السنة الثالثة متوسط'`, `CHAPTER_TITLE 'ميدان الأنشطة العددية'`
  (the 3AM programme's own name, D13). Patterns it adds: (1) its « راجع » lessons are all unpublished, two of them EARLIER in the same
  book (`qawaid-quwa-ashara`): « أستعدّ » measures each review item with platform statements, the same-year rules are RECALLED in
  معارف by a `TextbookBox kind="remark"` « تذكّر — قوى العدد 10 » (`addition('prior_year_reminder')`), and `pointPrerequisites` are
  intra-lesson only; (2) a lab used twice with two WORLDS (`power-train`: `build` levelled in module 1, `couple` alone in معارف with
  `levels={false}`) declares the module-2 resource without `level` (batch-4 pattern); (3) a lab whose hand holds a SIGNED integer on
  a graduated rail uses one knob with `role="slider"` (arrows, Home/End), a tap on the ruler, and a `StepperCard` −/+ row — the drag
  previews, the release is the trial (MANIPULATION_CONTRACT §2octovicies); (4) the extraction builder asserts `verified: True` for
  every element destined to the lesson generated now.
- **2AM unit 1, lesson 4 (`tawzi-darb-jam-tarh`, 2026-10-29) — patterns to reuse.** (1) **A distributive law is discovered by SHARING, not by area**: the lab deals each load one item per bag (`deal`), the bag is the referee and two equal counters are NOT enough (30 = 30 with wrong bags) — the area stays a context of P1 only in أتمرّن 1 (`act-6`), because `area-split` / `turf-factoring` already own the area picture. (2) **Refusal reasons from the counts, not from a list**: the dealt counts are always adjacent integers, so `unequal` (k does not divide the load) / `short` / `extra` are exhaustive; do not plan « some too few AND some too many ». (3) **The lab column is ~414 px at 1024×768**: one strip for the two characters and their counters, dials side by side, bags ≥ 34 px in ≤ 2 rows; the PREDICTION phase (typing) is the tallest — hide the idle banner while the typed prediction is open (measured 759 → under 700). (4) **A dial is a spinbutton**: drag in a circle + − / + 48 px buttons + ↑ ↓ ±step + PageUp / PageDown ±10 steps (`Dial` in `KitPacker.jsx`, step 10 for a round-number dial). (5) **`chainOps` L4** (`expand`, `factorOut`, `commonFactor`, `mentalSplits`, `expandLetter`) is the shared distributivity engine, tested against `relativeOps.factorize`; ONE letter only (`k × (x ± b)`, notation `4 × x = 4x`), checked by two values of the letter. (6) **A « true distractor » is a bug, again**: a distractor offered as « wrong » that is a TRUE equality of ITS reading (`4 × 5,5 + 1,5 = 23,5`) is fine only because the key is the VALUE — `content.test.js` compares the last member to the expected value, and every distractor reproduces a named `MISC-TAWZI-*` reading. (7) **A decimal inside KaTeX built from `chainOps.numText`** must be protected (`tex(val(...))` → `353{,}5`), a bare `353,5` leaves a thin space. (8) **Money in `$…$`** is `\mathrm{DA}`; in a plain Arabic string it is wrapped in an LTR isolate. (9) **Module minutes:** `durationMinutes` = modules WITHOUT the مسائل (66; 90 with them). (10) **Bank by a helper from a written brief** (50 sheets, oracle, MISC ids) while the lead writes the lab and the lesson, as in `adad-natiq`.
- **2AM unit 2, lesson 8 (`jida-kasrayn`, 2026-10-29) — patterns to reuse.** (1) **A lab that refuses by AREA** (`window-blinds`, MANIPULATION_CONTRACT §2novenquinquagies ter): `judgeProduct → { ok, model, value, bigger }` draws a dashed frame whose AREA is the wrong writing, beside the real dark corner; the models (`sum`, `sameDen`, `cross`, `oneFactor`, `count`) are the bank's `MISC-JIDAKASR-*`. (2) **Two perpendicular pulls** (a horizontal edge snapping to rail stops, a vertical bar snapping to cord notches) hold two variables at once; both are checked by one « ماذا أُظلم؟ » and the guide lines (the small squares the shadows cut) are drawn ONLY after that check. (3) **The grid count = the product is tested exhaustively** (`logic/windowBlinds.test.js`: every b ≤ 8, d ≤ 8, W, H ≤ 2, every a, c). (4) **« A fraction OF a fraction » is the product's meaning**: the lab's phase formelle writes « 3/4 من 2/3 النافذة = 3/4 × 2/3 », M3 translates « من » into × for a quantity, a fraction and « of the remainder » (the remainder is computed first: `1 − s/t`), and the bank keeps `OFWHOLE` / `OFSPENT` apart. (5) **A tape or area problem with a context fraction of the REMAINDER is checked from the statement's numbers** (`problems.test.js` + oracle), never from the displayed key. (6) **`GuidedProblem` icons are a CLOSED list** (`situationKinds.js › ICON_KINDS`: no `fuel`, `garden`, `flower` — use `car`, `plant`, `leaf`), a choice step's `role` is `translate` or `conclude`, and the first numeric of a two-answer part carries `role: 'answer'` with its `ask`. (7) **A « true distractor » is a bug, again**: `18/12` offered as wrong for `3/2`, `30/42` for `5/7`, `105/140` for `3/4` are all equal writings — `content.test.js` filters the distractors of every exercise row and asserts they differ in VALUE. (8) **Module minutes:** the catalogue `durationMinutes` is the modules WITHOUT the مسائل (here 66).
- **2AM unit 2, lesson 9 (`muqarana-kasrayn`, 2026-10-29) — patterns to reuse.** (1) **A lab that reads ONE value in two scales** (`level-laser`, MANIPULATION_CONTRACT §2novenquinquagies quater): the variable in the hand (a height) snaps to the UNION of two graduations, and a chip on each tube says where it falls (« على العلامة 9 من 12 » / « بين 4 و 5 من 8 ») — an equivalence (`3/4 = 9/12`) shown, not told. (2) **Refuse by moving the world**: a wrong claim makes the laser JUMP to the claimed level, so the refutation is one glance (`judgeChoice → { ok, model }`, the models are the bank's `MISC-MUQKASR-*`). (3) **Covered prediction** (متقدم): the sleeves hide the oil, the laser is locked, the student answers (sign, order, rewritten level) and only then lifts them; a wrong answer lifts them too. (4) **`fractions2.js › compareCase`** names the 2AM case of a pair (`sameDen`, `sameNum`, `multiple`, `viaOne`) and returns `null` for the 3AM case: the lab, the bank oracle and the free panel all use it, and a free pair outside the four cases gets NO verdict. (5) **A « تذكّر » toward a PUBLISHED lesson carries its live link** (`getLessonPath`), three on this lesson's M2 (`ikhtizal-kitaba-kasriya`, `hasil-qisma-kasr`, `jam-tarh-kusur`). (6) The test must carry every learning point: a P1 with no assessment question fails `validate:lessons` — here E3 (same denominator, decimal numerator) is the P1 question.
- **2AM unit 2, lesson 7 (`jam-tarh-kusur`, 2026-10-29) — patterns to reuse.** (1) **A lab that REFUSES BY DRAWING** (`trail-odometer`, MANIPULATION_CONTRACT §2novenquinquagies bis): a typed answer with classic wrong forms is judged by a pure `judgeWriting(task, text, field) → { ok, model, flagAt }`; the lab never says « wrong », it plants a dashed flag at the position the wrong writing would have (`6/16` short of the hiker) and the models (`across`, `noScale`, `natural`, `part`) are the bank's misconceptions. Any EQUAL writing is accepted (8/12 or 2/3). (2) **A path parameterised by arc length** (`makePath`, tested within 0,5 px) makes « equal fractions are equal lengths » true on a curved scene; a figure walks it and snaps to integer posts. (3) **Prediction before the hand moves** (متقدم): the lab is locked until the arrival fraction and the remainder are written (`phase: 'predict'`), the counters stay hidden until then; the lock is shown on the figure. (4) **A recall that points forward** (`muqarana-kasrayn` is the NEXT lesson of the unit): one « تذكّر » sentence with NO link and NO LP edge (net `r08 → r09` against the book order); the lesson never compares any pair other than the recalled same-denominator one. (5) **The 2AM scope guard is executable**: `fractions2.js › isMultipleCase` / `sumMultipleCase` throw on a pair where neither denominator divides the other (3AM), the lab's free panel answers « هذان المقامان سنراهما في السنة الثالثة », `content.test.js` asserts every lab task, exercise and test pair is a 2AM case, and the bank oracle re-reads the LaTeX of every statement for the same rule. (6) **A « true distractor » is a bug**: `6/9` offered as wrong for `4/9 + 2/9 = 2/3`, `16/18` for `8/9`, `3/12` for `1/4` are all TRUE equal writings — memo quizzes, test options and مسألة choices were rewritten with values that are genuinely different. (7) **`GuidedProblem`:** a `compute` numeric step may not carry `ask`; one ask needs one `numeric answer` / `choice conclude`; every `solution` step needs ≥ 2 lines. (8) **Module minutes:** the catalogue `durationMinutes` is the modules WITHOUT the مسائل (here 66), the lesson cap (90) counts them.
- **Phase A entry #7 (`muqarana-nisbiya`, 2AM, 2026-10-21, the first lesson of 2AM unit 3 « الأعداد النسبية ») — patterns to reuse.** (1) **A lesson whose prerequisite lesson is unpublished AND of the same book** (`talim-mustaqim-mudarraj-2`): « أستعدّ » measures its single review item (`2am.m4.r01`) by statements split into vocabulary (distance to zero, abscissa, opposite) — textbook items 5–7 rewritten + platform items — and never rebuilds reading or placing a point. (2) **A textbook activity answered by sight is not an entry**: the six thermometers (act-2) are read at a glance, so the rule is not needed; the entry is a lab where the hand holds the DISTANCE to zero and the sign is a consequence (`zero-probe`, MANIPULATION_CONTRACT §2novemvicies), and act-2 becomes an application in أتمرّن. (3) **One lab, three uses**: `levels` workspace in module 1, the same type alone (`levels={false}`, its own `tasks`) in معارف, declared in `resources` without `level`. (4) **A textbook misprint is corrected at generation and recorded in `discrepancies`** (know-1b prints « −2,5 < −4 »; ex-20 prints `−4,3 < … < −4,5`). (5) **An element whose content belongs to a later lesson stays out of this lesson even when its page is shared**: `deep-38` (a sum is always smaller…) needs addition, so it is `jam-tarh-nisbiya`'s. (6) **`GuidedProblem` `data` rows are plain text** (no `$…$`, the sorter does not render math: write `−3,25` with the real minus). (7) **Final-test options with a `x = …` prefix** stay literal in `Module08Itqan.jsx`; `content.test.js` accepts either `$o$` or `$x = o$`. (8) **The unit's challenge card cites its extraction element** (`units_<g> › challenge.sourceElementId: "challenge"`), otherwise `check:textbook` reports the `unit` destination uncited.
- **Phase A entries #5–#6 (`musawiyat-amaliyat` then `muadalat-darajat-ula`, 3AM unit 5 « المساويات – المتباينات – المعادلات », 2026-10-21) — patterns to reuse.** (1) **One programme item split in two lessons of the same unit** (`3am.m5.r05`: equalities here, inequalities in `mutabayinat-amaliyat`): the boundary is written once in the extraction header (this lesson never solves `ax + b = cx + d`, the next never flips an inequality) and a bank must not drift across it (« no inequality in #5 »). (2) **A recall lesson that EXTENDS an unpublished earlier-year lesson** (`muadalat-darajat-ula` extends 2AM `2am.m4.r08`): « أستعدّ » measures that item, معارف opens on a « تذكّر — السنة الثانية » `TextbookBox` whose link uses `getLessonPath(<code>)` (null while unpublished: no link), and `pointPrerequisites` add a cross-lesson edge ONLY toward the PUBLISHED lesson of the same book (P3 ← `3am_musawiyat-amaliyat_P1`, `_P2`, net link r05 → r06). (3) **Every extracted element needs a citation by its lesson**: when a lesson owns ~50 elements (`ex-29 … ex-65`) the redesigned exercises carry `cites: [src(…)]` for the ones they replace (`ex-49` cites the 15 `أتعمّق` modelling problems); `src('prep', …, n)` for the items kept; the final-test epreuves cite `self-N`. (4) **`GuidedProblem` `data[].text` and a `tags` illustration are plain text**: no `$…$` (the e2e raw-text scan catches it) — `3x − 40 = 200` with the real minus. (5) **Knowledge-map shape**: the layout tests refuse a guide node hung on the ROOT, a label that crosses a node and « guidance ≥ half the nodes » — hang a mistake under the SECOND node and keep ≥ 2 core nodes per guide node. (6) **A lab whose hidden value gives the refusal** (`term-ferry`: the solution x* is computed, never shown; `equality-lanes`: x hidden, the runners stand at the values): the discovery's wrong options are refuted with the student's own refused trial, so each lab REQUIRES one contrast trial (`oneSide`, `keepTried`) before its discovery opens and the LabCoach proposes it once. (7) **Native numbers, not the book's**: the lesson's beginner level uses the platform's own equation (`10 = 4x − 2`, `3x + 2 = x + 8`) and only the advanced level may use the textbook's (`9x + 1 = 5x − 7`). (8) **The extraction builder checks each prep item against its printed options** (`prep(n, …, options, correct, value)`) and each computed answer by exact `Fraction` assertions; unclear scan lines (`prep` 5, 11) were re-read at 200 dpi and recorded in `discrepancies`.
- **Phase A entry #9 (`tanasub-tamthil-bayani`, 3AM unit 6 « التناسبية », 2026-10-21, the first lesson of the unit) — patterns to reuse.** (1) **The unit challenge is made self-contained and cited**: the book's « البيان المقابل » points to a figure, so `units_3am › tanasubiya-sura.challenge.textAr` is rewritten with its data (« يقطع عدّاء 24 m في 4 s … »), `challenge.sourceElementId: "challenge"` is set and the extraction destination is `{ lesson: 'unit', module: 'page' }` — otherwise `check:textbook` reports the `unit` destination uncited and `UnitOpenerFigure` would need a drawing. (2) **A lab whose verdict is what a tool TOUCHES** (`pin-rails`, MANIPULATION_CONTRACT §2quinquatricies): the proportional / aligned-but-off-O / bent contrast comes from a ruler laid on two nodes, each lesson step quotes the student's own ruler trials (`count / total`, `cuts`); the lab never says « تناسبية ». (3) **A textbook proof that needs a later unit** (`deep-33` proves y = ax with Thales, taught in unit 9) is NOT posed: the exercise that replaces it computes the same fact (`cites: deep-33`) and the extraction records the scope conflict. (4) **Graph exercises are `GeoFigure` data** (`content/figures.js`: `planeFigure`, `brokenFigure`, axes + grid, points named A…E, O) kept to moderate aspect ratios (a = 0,75 … 2,5) because `GeoFigure` has one scale on both axes; `content.test.js` REMEASURES each figure from its data and classifies every table with BigInt cross products. (5) **Crowded rails**: a lab with pins 26 px apart grabs the NEAREST free pin on a press near the rail (`bgDown`), never overlapping 44 px hit circles. (6) **The unit's `prepDiagnostic.test.js` stays red until the catalogue flip** (as for every first lesson of a unit).
- **Phase A entry #10 (`nisba-miawiya-3am`, 3AM unit 6 « التناسبية », 2026-10-21) — patterns to reuse.** (1) **A lesson that CONSOLIDATES an unpublished earlier-year lesson** (net link `consolidates`, no `addedValueAr`: `3am.m7.r06` ← `2am.m6.r04`): « أستعدّ » measures the base item with platform statements next to the textbook `prep` items kept (7, 8, 9 rewritten), معارف opens on a « تذكّر — السنة الثانية » `TextbookBox` (`addition('prior_year_reminder')`, no link while the base is unpublished), and the lesson goes straight to the proportional treatment (the coefficient t/100, the table « الكلّ ↔ 100 », × (1 ± t/100)); `pointPrerequisites` stay intra-lesson. (2) **A lab whose coefficient becomes VISIBLE**: `hundred-grid` cuts the stock into 100 equal cells, one cell = x ÷ 100; the student WRITES the answer before the basket opens (`of`, `change`, `whole`) or searches it with the basket filling live (`rate`) — MANIPULATION_CONTRACT §2quattuortricies; distinct from `percent-tag` (4AM, a continuous bar). (3) **Exact keys in tests**: `content.test.js` recomputes every percent with BigInt rationals (`of`, `up`, `down`, chains, « the whole from the part »), the final-test options stay literal in `Module08Itqan.jsx` and a distractor is tested FALSE; the textbook's population / classes / prices activities become applications in أتمرّن with other numbers. (4) **Sizing a lab from BOTH screen height and column width** (`HundredGrid.jsx`: cell = min((screenH − 560) / 10, (stageW − basketW − 54) / 10)) keeps the grid and the basket side by side at 1024 × 768 with the sidebar open (content column ≈ 430 px) — a `flex-wrap` stage dropped the basket under the grid and overflowed the screen (847 / 768). (5) **A Playwright pointer test must scroll the target to the CENTRE** (`scrollIntoView({ block: 'center' })`), the sticky progress bar covers a grid scrolled to `start`.
- **Phase 0 « owner priority » entry (`maqlub-qismat-kasrayn`, 3AM unit 2 « العمليات على الكسور والأعداد الناطقة », 2026-10-25, the first lesson of the unit, which it SEEDS) — patterns to reuse.** (1) **Seeding a unit and extracting it whole in the same task**: `_unit/` (copy of `quwa-nisbiya/_unit`, the test date line adapted), `docs/sources/3am/unit2/build-extraction.py` → `extraction.json` for ALL the unit's pages (124 elements), `verified: True` only for the elements of the lesson generated now, the boundary of the five lessons in the script header, every printed answer recomputed with `Fraction` and the printed options of each QCM re-checked by assertion (this caught the plan's own `self-1` error). (2) **Scan islands may be printed in reverse order**: when a printed expression matches no option, test the right-to-left reading and record it in `discrepancies`. (3) **A lab whose hand holds a RATIO's consequence** (`gear-crank`, MANIPULATION_CONTRACT §2sextricies): the student turns a crank, the variable is the pedal turns, the wheel turns follow; the surprise (6 ÷ 3/4 = 8 > 6) is lived before it is named; a `reverse` world is posed ALONE in معارف (`levels={false}`, `tasks` from `LAB.reverse`, declared without `level`). (4) **Fractions as exercise data**: rows are built from literal strings (`'5/6'`, `'0,04'`) with `divRow` / `recipRow` helpers over `powers.js` + `fractions3.js`, the distractors are the lesson's three named mistakes (no flip, flip the first, flip both) and `content.test.js` re-parses every option back from its LaTeX with its own BigInt code. (5) **`GuidedProblem` numeric steps take numbers only**: a fractional answer is a `choice` with `role: 'conclude'` (options parsed back in `problems.test.js`), a decimal one (15/8 = 1,875) a `numeric` with `display`. (6) **`fractions3.js`** (`packages/core/arithmetic`) is the shared exact-fraction module of unit 2: `raw` (an UNREDUCED pair, d > 0) on top of `powers.js › rat`; later lessons add their functions to it.
- **Phase A entry #8 (`rabi-mutanasib`, 2AM unit 5 « التناسبية », 2026-10-21, the first lesson of the unit, chapter `tanasubiya_duwal`) — patterns to reuse.** (1) **A `consolidates` link is not a lesson to rebuild**: the net item `2am.m6.r02` consolidates `1am.m6.r04`, so « أستعدّ » measures the old routes (multiplicative, additive, the « same difference » trap) and the lesson builds only what is NEW (the cross-product equality `a × d = b × c`) and the CHOICE of route; the unit's sister lesson (`wadiya-tanasubiya-jadwal`, recognising a table) is measured too, never rebuilt. The boundary of the four lessons is in the header of `docs/sources/2am/unit5/build-extraction.py`; the element `now-75` and `know-1` are split by `destinations.<id>.items`. (2) **The 2AM ميدان of `tanasubiya_duwal`** is « ميدان الدوال وتنظيم المعطيات » (the grade's own name, D13). (3) **A lab whose hand holds the MISSING cell** of a 2×2 table (`fourth-gauges`, MANIPULATION_CONTRACT §2tertricies): three balances (per-unit price, between columns, cross products) lean the same way for any hole and balance together only at the fourth proportional; a decoy gauge « الفرق » that balances at the WRONG value refutes the additive misconception with the student's own release; level 2 veils the gauges until release (predict then check). Events carry `done` and `decoyHit`. (4) **« Which route avoids a non-terminating quotient » is a verifiable way to teach route choice** (3 kg ↔ 50 DA, 12 kg: `50 ÷ 3` is false, `12 = 3 × 4` is true): no distractor is a « longer but valid » route. (5) **`FINAL` options with an equation in x** (`3 × x = 8 × 9`) are evaluated at the known x by the content test, each wrong diagonal being false. (6) **`units_<g> › <unit>.challenge.sourceElementId: "challenge"`** was set at seeding, otherwise `check:textbook` reports the `unit` destination uncited. (7) The shared `LabCoach` gained an optional step field `noFlip` (bubble stays on its side when flipping would cover the work area; MANIPULATION_CONTRACT §8quater).
- **Phase 0 entry 1 (`jidaa-adadayn-nisbiyayn`, 3AM unit 1 « الأعداد النسبية », 2026-10-26, the first lesson of the unit) — patterns to reuse.** (1) **Generated from a PLAN** (`docs/sources/3am/unit1/plan/`): the lead of the unit's first lesson also seeds `_unit/` and the whole-unit extraction; the extraction (93 elements, 31 discrepancies) and the 50-sheet bank were each delegated to one helper with a written brief, the lead writing the lab and the lesson. (2) **A scan prints a purely numeric expression RIGHT-TO-LEFT** when the minus sign follows the digits (« 4-»): the extraction records each flipped reading and checks it against the printed options (`self-8`, `self-11`, `deep-47`, prep 11/12/13/15 here) — read a textbook figure's numbers with the options at hand, never literally. (3) **An unreadable box** (the history box of the opener, destroyed by pixel blocks) gets the SYNTHESIS as destination (module `None`, note « illisible ») like units 3 and 6, because `check:textbook` requires a `unit`-destined element to be cited by unit content. (4) **A lab whose hand holds a SIGNED TIME** (`elevator-reel`, MANIPULATION_CONTRACT §2septentricies): the module's questions read the student's own `onTrial` events by `taskId` (« في سجلّك: بعد 3 دقائق كان المصعد في الطابق −6 »), the lab itself asks the OTHER half of the rule (the distance) so the module's question about the signs is not asked twice, and a prediction stage (متقدم a1, مبتدئ p1) does not mount the timeline at all until it is answered. **Revised 2026-10-27 (council + owner):** a lab never WRITES the rule it makes the student discover — its stop says the time, the floor and the side, the product appears only after the discovery (MANIPULATION_CONTRACT §5); a replay film waits for every prediction; each factor of the product is a first-class readout (the speed card); the lab opts into the game screen (`immersive`). (5) **Knowledge-graph texts**: `lessonGraphs.test.js` evaluates every `$a = b$` in a node — a common-mistake `wrong` line must be written in WORDS (« جداء $(-3)$ في $(-4)$ سالب »), never as a false equality, and a chain ending in `× 0 = 0` is read as `−0 ≠ 0` — split it into separate math islands. (6) **Every LP needs an assessment item** (`validate:lessons --strict`): with five final-test items and four LPs, one LP (P1 here, the repeated addition) took the item the plan gave to a second neg × neg case. (7) **Render tests run from `apps/web`** (its `vitest` config loads the lazy `lesson.manipulation.json` strings through `src/test/setupOnDemandStrings.js`; run from the repo root they show raw keys). (8) **Browser QA without the API**: the lesson e2e accepts `QA_STUB=1` (the page-tours stub: `/auth/me` answers `{ success, user }`, every other `/api/v1` call `{ success, data: [] }`, a teacher account) when the local API is down. (9) **The A × 0 = 0 rule is TAUGHT where the plan puts it** (طريقة, with the elevator whose speed is 0 for free in « جرّب أعدادك »), and a decimal slip (`0,6` for `0,06`) is a named misconception tested by a final-test distractor.
  - **Added 2026-10-27 (owner request) — a معارف module may open on its OWN lab that makes the JUSTIFICATION manipulable.** Module 2 « لماذا جداء سالبين موجب؟ » now opens on `sign-machine` « آلة الجداءات » (MANIPULATION_CONTRACT §2septentricies-bis): the textbook's « the table keeps the same step » argument becomes a board the hand fills (the second factor goes down, each product lights a column, lit columns stay), with the side that would REVEAL the answer locked until the student predicts it on cards. Reuse the pattern when a rule is justified by a regularity: (a) the hand builds the table, the regularity is drawn (gap chips, a line through the tips), never written; (b) lock what the prediction is about; (c) the module's first question reads the student's own columns (`[data-evidence]`, answer computed from the trial's numbers), and the textbook's verbal argument (distributivity here) follows as transfer. Both levels keep ONE objective (`validate:lessons`).
- **Phase 0 entry 6 (`tasawi-muqaranat-kasrayn`, 3AM unit 2 lesson 2, 2026-10-26) — patterns to reuse.** (1) **A later lesson of an already-seeded unit re-reads ITS elements**: render the pages with `pdftoppm -r 130` (260 dpi crops for doubtful islands), set `verified: True` with `Fraction` assertions in `build-extraction.py`, record every correction in `DISCREPANCIES` (here `ex-15` is 5/7 and 15/17, not 5/17; `ex-17`'s pairs; the plan's « 23/20 < 13/12 » was false) and move each element's module number in `DEST`. (2) **An element nothing cites fails `check:textbook`**: give a topically close exercise a `cites: [S('ex-9', 30)]` rather than inventing a question. (3) **A lab whose hand holds a NUMERATOR and whose impossible case does the teaching** (`shade-match`, MANIPULATION_CONTRACT §2octentricies): a button « لا يوجد عدد صحيح » that refuses until the two consecutive neighbours were tried (and never says which number works when a solution exists), a VEILED level whose commitment reveals the instrument, and a `compare` task closed by one prediction. (4) **Questions placed BEFORE a brick in a module `requires` the prior-year ids of `priorKnowledge`** (`muqarana-kasrayn-2am`, `kasr-mutasawi-1am`), never the id the brick establishes later: `audit:knowledge:gate` reports `E_REQUIRES_ESTABLISHED_LATER` as CRITICAL. (5) **Render tests of a lab run from `apps/web`** (`cd apps/web && npx vitest run src/…`): from the repo root i18n is not loaded and every string is a raw key. (6) **Bank sheets modelled on a SIGNED corpus exercise** keep its structure with positive fractions when the signed case belongs to a later lesson (EXERCISE_CONTRACT status line). (7) **Hot-reload flakiness in browser QA**: do not edit sources while a Playwright run is in flight (the lab remounts and the run times out).
- **Phase 0 entry 4 (`wadiya-idmajiya-aadad-nisbiya`, the FIRST 1AM–3AM synthesis, 3AM unit 1, 2026-10-26) — patterns to reuse.** (1) **A synthesis of a grade 1AM–3AM is generated INTO its `coming_soon` entry like a lesson**: `kind: 'synthesis'`, `programmeItems: []` stays (validators accept it), you ADD one `pointsToLearn` (P1) and `pointPrerequisites` toward the unit's lessons; this bumps the LP total asserted in `packages/core/curriculum/coursesData.test.js` (524). (2) **Shape = 4AM unit-1 synthesis**: 0 أستعدّ, 1–6 `GuidedProblem` (« الوضعية التدريبية », `track: 'problem'`), 7 `ContentModule` analysis (with `objectives`), 8 `BossFinal`; no lab, no `KnowledgeBrick`; `priorKnowledge` strings feed every `requires`. (3) **`durationMinutes` of a synthesis = modules 0 + 7 + 8** (problem tracks excluded) — `validate:lessons` warns otherwise. (4) **`masailIllustrations.test.js` demands an `illustration` (kind `scene`, digits taken from the statement only) or a `figure` for every problem**; `InfoSorter` items and `BossFinal` prompts do NOT render LaTeX: write sorter texts in plain Unicode, wrap string prompts in `MathText`. (5) **An illegible textbook element** can be declared `notIntegrated: '<reason>'` in `DEST` instead of giving it to the synthesis. (6) **Every `assessment` of a BossFinal epreuve must be a literal** (`learningPointIds: ['…_P1']` inline) — the validator reads source text, not constants. (7) **Bank of a synthesis**: modelled on the term-1 paper's « exercice 1 » + a context, one LP on every question, `MISC-WIDMAJ-*` for the new errors.
- **Phase 0 entry 2 (`jidaa-ida-nisbiya`, 3AM unit 1 lesson 2, 2026-10-26) — patterns to reuse.** (1) **A lesson that follows the published first lesson of the SAME programme item** recalls it in a « تذكّر » `TextbookBox` in the `brief` of معارف (`addition('prior_year_reminder')`, link by `getLessonPath`), measures its product in « أستعدّ » (`priorKnowledge` outside the net) and takes cross-lesson `pointPrerequisites` toward it (no net link is crossed: both LPs belong to `3am.m1.r01`). (2) **A drag gesture needs the card draggable and the badge a SIBLING button**: `DraggableObject` is a `<button>`; a sign badge inside it is a nested button (invalid, and its click starts a drag) — the tile is a div, the number area the draggable, the badge a separate `<button>` (a 44 px pill). (3) **Evidence-based questions**: `onTrial` events (`kind: 'run'`, `taskId`, `negatives`, `stop`) feed the module (« في سجلّك … »); a question may be built FROM the record (the options of module 1 q2 are the student's own pair of counts, the correct one first) — the lab writes the count, the student never types it. (4) **A lab world posed alone** (`square`, `levels={false}`) is declared in `resources` without a level and carries its own task list (`LAB.square`). (5) **Bidi of a verdict island**: digits and signs without a strong LTR character are ordered as RTL (`−5` shows `5−`); wrap with `LRI` + `LRM` … `PDI`. (6) **A Playwright pointer test must use `behavior: 'instant'` on `scrollIntoView`** — the page scrolls smoothly, a drag started mid-scroll misses its target; read the FINAL value from a `data-stop`-like attribute, not from an animated position. (7) **The dev server reloads the page when another process edits `content/practice`** (`watchPracticeContent`): a flaky e2e on a shared tree is not a lesson bug. (8) **A scan reading disproves a plan**: re-reading `now-11` at 500 dpi showed « 85 » (last digit certain, odd) against the plan's « 50 » — the parity decides, so the extraction records the reading and the lesson uses its own numbers. (9) **A task whose flag is checked mid-programme** (`at: 2`) still requires the whole programme to be placed; the verdict writes the probe stop (« بعد البطاقتين الأوليين »).
- **Phase 0 entry 3 (`qismat-nisbiyayn`, 3AM unit 1 lesson 3, 2026-10-26, the LAST lesson of the unit) — patterns to reuse.** (1) **A quotient is taught as a MISSING FACTOR:** the lab's lock multiplies live (`b × code`), so the definition `a ÷ b = q ⇔ b × q = a` IS the mechanism, the sign rule is discovered from the signs of the two numbers on the doors whose code came out positive (the module asks about the student's own openings), and the lesson never states « سالب ÷ سالب = سالب » — its refusal does (`(−12) × (−5) = 60`). (2) **A rolling gesture is a `role="spinbutton"` in DOM:** vertical drag (`setPointerCapture`, one notch per 26 px), ▲ / ▼ buttons (`tabIndex -1`), ↑ ↓ on the focused wheel, ← → between wheels, typed digits; a sign wheel toggles on a tap; a locked wheel keeps `data-locked` and `aria-disabled`. A PREDICTION is a locked step: the digit wheels stay locked until the sign is committed (« ثبّت »), and the refusal of a wrong committed sign is written with the SAME distance and the wrong sign. (3) **Never rotate a DOM block in 3D without clipping it:** `perspective(…) rotateY(…)` on a door projected outside the card, covered the verdict and swallowed its clicks; the locker is `overflow-hidden`, the open door is `pointer-events: none`, and the angle that goes AWAY from the viewer is the positive one for a left hinge. (4) **Bidi is MEASURED, not looked at:** compare the x of the first and last character of an island with `Range.getBoundingClientRect()` (a screenshot read by a model mixes the order of LTR islands inside RTL text); the elevator-reel verdict of lesson 1 was checked this way for t = −3 … 3 and needs no LRM in Chromium (robot-track and code-lockers keep `LRI` + `LRM`). (5) **Fractions as ANSWERS of a lab, not of a question:** `NumericQuestion` takes decimals (`parseDec`), a non-decimal quotient is chosen, and a « which writings open the lock » question is a yes/no `BatchChoiceQuestion` (the kit has no multi-select). (6) **A wrong corpus note was found by re-reading the scan:** `3am-s1-2` ex 3 prints `(−10) × 2 × 0,1 × (−7) × (−0,5) = −7` (the `−70` was a misreading in a sister bank sheet), so a note « checked on the scan » is re-checked before it is copied. (7) **`learning-net-queue.mjs` queues a unit's synthesis when its LAST planned lesson is pushed** — once a unit's last lesson is published nothing pushed it (« leçons prévues hors file ») and the owner loop now queues it. (8) **Knowledge-map layout:** a node that has a mistake child goes in lane `end` (the label of its other edge crosses the mistake node otherwise) and every title is ≤ 28 characters. (9) **LabCoach bubbles prefer `below`** when the plate above the wheels states the rule; e2e `fillNumber` must pick `input:not([disabled]):not([readonly])` because an answered `NumericQuestion` keeps its input.
- **Phase 0 entry 7 (`jam-tarh-kasrayn`, 3AM unit 2 lesson 3, 2026-10-26) — patterns to reuse.** (1) **Module questions that quote the student's OWN refusal**: the lab's `refused` event carries `N` and `zone`; the module builds its options from them (cases = N × a/b as « between k and k + 1 » when the quotient is not a decimal, « لأنّ N ليس مضاعفًا للعدد b » with b the failing zone's denominator) and each question block is rendered ONLY once its `Evidence` exists (no `undefined` placeholders). (2) **A lab task that is done stays playable** when a later gesture depends on it (`seed-rake`: the star « أوسع مسافة؟ » needs two working spacings, exactly when g1 is done): emit `solved` once (`!s.done[s.ti]`), keep the controls, hide them only for locked prediction tasks. (3) **A textbook example is never reused**: the plan's examples (`1/6 + 4/5`, `7/10 − 3/8`) were the book's own, so the lesson uses `2/9 + 5/6` and `11/12 − 5/8` (record it in the plan's « Generator notes »). (4) **« counted: true » for an earlier lesson's step is impossible** in a bank: `validate-exercises` requires each question's learning point to belong to the lesson, so `maqlub` / `tasawi` steps are `counted: false` with this lesson's P2. (5) **An element only the bank can cite** (`self-2`, `self-3`, `deep-80`) has destination module `None`; a recall box may cite a 2AM-case element (`method-5`) because the unit's prep test accepts a textbook item only as `prep`. (6) **Pointer-to-N drag**: the whole bar is the grab (`nFromX` rounds `1 / spacing`), so precise values above ≈ 20 are reached with the ± buttons or Shift + arrows (a Playwright test uses `dragTo(n ≤ 15)` then buttons). (7) **`learning-net-queue.mjs` fails « leçons prévues hors file »** while another lead's synthesis edit is in flight: it is the coordinator's regeneration, not a lesson bug. (8) **Browser QA with a shared tree**: Vite reloads the page when another process edits tracked files; re-run before concluding a lab loses its state.
- **Phase 0 entry 8 (`adad-natiq`, 3AM unit 2 lesson 4, 2026-10-26) — patterns to reuse.** (1) **A lesson that RECALLS two published bases** (`qismat-nisbiyayn` for the sign of a quotient, 1AM `hasil-qisma-kasr` for decimal-or-not) measures them in « أستعدّ » (`priorKnowledge` ids `<lesson>-<grade>`, the `requires` of the questions that precede the first brick) and opens معارف on two « تذكّر » `TextbookBox` es with `getLessonPath` links; its `pointPrerequisites` cross one net edge (`P1 ← 1am_hasil-qisma-kasr_P1`, `P2 ← 3am_qismat-nisbiyayn_P3`). (2) **A lab whose cards are DOM over an SVG** (`number-line-pegs`): children of a zero-width absolutely positioned wrapper need an explicit `left: 0` — in an RTL page their static position is the right edge and every card was shifted half a width; a `Playwright` visibility check fails on a zero-width wrapper, read the attribute through the visible parent (`vis(page, '[data-npp-glance]').locator(...)`). (3) **The pointer capture trick**: the basket card calls `stage.setPointerCapture`, so the stage's move/up handlers run for a drag that began elsewhere; a tap (< 6 px) keeps the card in hand for a second tap on the rope. (4) **One chip per pile**: equal values stack, so annotations (standard writing, `×n`, slide in twelfths) belong to the FRONT card only. (5) **The textbook's printed key can be false**: `self-9` prints « > » where only « ≠ » is true — recompute every key and record it in `discrepancies`. (6) **`durationMinutes` of the catalogue = the modules WITHOUT the مسائل** (here 65; 89 with them, cap 90). (7) **Bank by a helper from a written brief** (50 sheets, oracle, MISC ids) while the lead writes the lab and the lesson; the helper's only dependency on the lead is the LP ids and the element ids to cite (`ex-25`, `ex-29`, `self-4` cited only by the bank).
- **Phase 0 entry 10 (`qimat-ibara-harfiya`, 3AM unit 4 lesson 3, 2026-10-26, a later lesson of an already-seeded unit) — patterns to reuse.** (1) **A new shared maths module for the unit** (`packages/core/arithmetic/substitution.js`: expression TREE, exact `evaluate` / `trace`, the written LINE as tokens, a strict literal `readLine`, `judgeLine`, polynomial normal form) is built on `powers.js` rationals and imported by path; the same module serves the lab, its logic and (in tests) nothing else — `content.test.js` re-evaluates every key with its OWN BigInt-rational evaluator written in the test. (2) **Value rows as data**: a row is `valueRow({ name, expr, env, key, right, wrongs })` with literal LaTeX options and `data: { expr, env, key }`; the test parses every option back (`\frac{a}{b}`, `{,}` decimals, « p و q » pairs) and asserts the key option is the only one equal to the recomputed value — write fractions as `\frac{7}{2}` (not `\frac72`) so they can be parsed. (3) **Evidence-based module questions** read the lab's `run` / `solved` / `drop` events by `task` (« سطرك الأول أعطى 2 فتوقّف المسار عند الناسخة »); a question must also read well when the student never met the refusal. (4) **A lab world posed alone** (`twins`, `levels={false}`, tasks from the logic) in معارف/طريقة after a levelled workspace in the first module (declared in `resources` without `level`). (5) **A cross-lesson `pointPrerequisites` edge toward a lesson published by another lead in the same batch** (`P1 ← 3am_amaliyat-natiqa_P4`) is written once its catalogue entry shows its final الكفاءات. (6) **Unit challenge card**: its text may be rewritten with own numbers (here 126,4 and 5) while its extraction element stays destined to the sister lesson's bank (no `sourceElementId`). (7) **Bank by a helper** (50 sheets, 243 questions, oracle) and **extraction update by another helper** (verified elements, destinations, header boundary) ran in parallel with the lead's lab; the extraction re-reading found `prep` item 2 printed `2 × (8 − 5)` (the extraction had `(8 − 5) × 2`). (8) **`ManipulationWorkspace` keeps both levels mounted**: a Playwright check must use `:visible` selectors (see MANIPULATION_CONTRACT §2tresquadragies pitfalls).
- **Phase 0 entry 9 (`amaliyat-natiqa`, 3AM unit 2 lesson 5, 2026-10-26) — patterns to reuse.** (1) **A lesson that COMBINES four published bases** (`jidaa-adadayn-nisbiyayn`, `maqlub-qismat-kasrayn`, `jam-tarh-kasrayn`, `adad-natiq`) measures all four in « أستعدّ » (five platform affirmations + the rewritten textbook items) and opens معارف on four « تذكّر » boxes with `getLessonPath` links, one per step after its question; the cross-lesson `pointPrerequisites` edges are one per base LP. (2) **A lab whose board is LTR inside an RTL page**: `dir="ltr"` on the board container so the chain reads left to right like the maths; the Arabic sentences around it stay RTL, and every number inside a sentence goes through `MathText`. (3) **Refusals decided at two moments** (selection of the pair: magnet / bubble / order; pad press: wrong sign / no flip) and **a wrong sign explained by the SITUATION (the longer bar, the number of red bars), never by the rule**. (4) **A pure chain engine in core** (`parseChain` / `links` / `linkStatus` / `mergeLink` / `nextLink` in `fractions3.js`): the lab's coach and the tests follow `nextLink` to solve every preset, so a chain that the engine cannot finish is caught by `mergeBoard.test.js`; a preset can be `signOnly`. (5) **The knowledge graph layout is checked at 328 / 400 / 720 / 1100 px** (`lessonGraphs.test.js`): guidance nodes must not hang on the root, and an edge label must not fall on a node — place a mistake node right after its parent and a lane `end` node after it (the `jam-tarh-kasrayn` shape). (6) **`masailIllustrations.test.js`**: every number in an illustration must appear in the statement — write « الأولى / الثانية / الثالثة », not « الخطوة 1 », on the tags. (7) **A missing textbook page** (book p. 37, `ict`) is GENERATED as a declared platform addition (a calculator check inside مسألة 3: brackets decide the key sequence, a decimal display is an approximation) and cited by `sourceElementIds` of the `situation` resource; textbook elements used only through the bank or a redesigned problem are cited in the exercise's `cites` / the resource's `sourceElementIds` (`check:textbook`). (8) **`durationMinutes` = modules without the مسائل** (66; 90 with them). (9) **A QA dev server can be started with a TEMPORARY vite config that stubs another lead's not-yet-created lazy lab** (a file in `apps/web` that merges `vite.config.js`; delete it afterwards).
- **Phase 0 entry 12 (`wadiya-idmajiya-kusur-natiqa`, the SECOND 1AM–3AM synthesis, 3AM unit 2, 2026-10-26) — patterns to reuse.** (1) **Same shape and same gates as entry 4**; the LP total of `coursesData.test.js` is now 525. (2) **A synthesis answered in FRACTIONS**: `GuidedProblem` `numeric` steps take a decimal number only, so a fractional answer is a `choice` (`role: 'conclude'`, `ask`) whose distractors are the named errors (ACROSS: numerators and denominators added; a product for a sum; a fraction of the WHOLE instead of the REMAINDER); integer and decimal answers stay `numeric`. (3) **The « fraction of the remainder » trap is exposed by a counter-check, not by a lecture**: module 7 asks « 1 − 1/3 − 1/4 − 3/5 = ? » and the student sees a negative number; the solution values are shown nowhere in module 7 (`content.test.js` greps the module source for them, comments included). (4) **`MethodSteps` does not render Markdown**: pass plain `label : text` lines, never `**label**` (the unit-1 synthesis still prints the asterisks; fix it when next touched). (5) **A textbook element can be cited by the synthesis AND by the unit card**: give it `duplicatedIn: [{lesson: 'unit', module: 'page'}]` in `DEST` (here `challenge`), otherwise `check:textbook` reports an undeclared duplication. (6) **`prep` items rewritten from `self-N` elements** keep `source: addition('prerequisite_diagnostic')` (the unit's `prepDiagnostic.test.js` accepts a textbook source only for `prep`) and name their origin in `cites: [src('self-N', …)]`. (7) **A « هل تعلم » box** has no kit component: put a `TextbookBox kind="remark"` in the `brief.body` of `PrerequisiteDiagnostic`. (8) ~~`npm run build` can fail in the `sa-share-pages` closeBundle on a stale `dist/.htaccess`~~ — **fixed 2026-10-29**: the plugin now reads its template from `public/.htaccess` and the base `index.html` from the bundle, never from `dist/`, so a stale `dist/` or two builds running at once no longer break the build (`docs/architecture/BOOKS_STORE.md` §6bis). No `rm -rf apps/web/dist` and no temporary config are needed.
- **Phase 0 entry 13 (`muqaranat-natiqayn`, 3AM unit 4 lesson 4, 2026-10-26, queue #16) — patterns to reuse.** (1) **An INSTRUMENT lab whose hand decides WHICH of two numbers is subtracted** (`difference-meter`, contract §2quattuorquadragies): two probes plug on two beads, ONE needle reads « red − black »; the evidence is the needle's side, the swap makes it CROSS without moving a bead or changing the right card, and a refusal states the two facts side by side (the probes, the reading, the chosen card) — never the rule. The needle angle is COMPRESSED (`(|v| / vmax)^0.4`) so a reading of 1/176 still shows its side while the window prints the exact value; the digital window is SVG text in an LTR isolate. (2) **Two targets that overlap cannot both be tapped**: when two beads are under one pixel apart the second hit circle covers the first (Playwright: « `<circle>` intercepts pointer events »). While they overlap the rail carries NO hit area and each bead gets a HANDLE in a lens, stacked vertically (a above b) so the layout says nothing about the order; the drag drop picks the nearest handle. Merge the two value tags into ONE pill wide enough for its Arabic caption (224 units), and offset the two probes when the beads touch. (3) **A world posed alone must bring its own default tasks**: `<Manipulation type="difference-meter" world="race" levels={false} />` had no `tasks` and silently showed the rail pairs — `numbersFor` now picks `PRESETS.race.tasks` when `world === 'race'` (a render test asserts the first reading is −4); the e2e caught it, the render tests did not. (4) **A shutter / curtain level** (متقدم): the needle is covered until the difference is WRITTEN (sign toggle + numerator / denominator steppers, judged by VALUE) and the beads are hidden behind a curtain with only the known difference given — the wrong option « لا نستطيع الحكم » is refused with the needle's reading. (5) **A new shared maths module for expressions**: `orderSign.js` reuses `substitution.js › toTerms` (integer polynomials in x) and `powers.js` rationals; the sign REGIONS of a linear `A − B` (`signRegions`: x < c, x = c, x > c, or « لكل قيم x ») are checked at sample points inside every region by the test with its OWN polynomial code. (6) **Row generators in an exercises file**: `diffRow(a, b, at)` writes « a − b = d إذن a > b » plus two distractors (the order flipped; the difference made by SUBTRACTING THE TERMS) from fraction strings, and `content.test.js` parses every option back (tolerating `\frac1{18}` and `\frac{-2}{-3}`) and asserts only the right option is true; `FractionQuestion` carries fraction answers in the modules, while `GuidedProblem` numeric steps accept only numbers — a fractional answer there is a `choice` « conclude ». (7) **The plan's numbers can be wrong, the scan decides**: `ex-30` d) is « −5/6 و −7/8 » (both negative; 1/24, not 41/24) — recompute every plan number with `Fraction` in `build-extraction.py` and record the correction in `DISCREPANCIES` and the plan's « Generator notes ». (8) **QA on a shared tree**: a vite server may already listen on 5173 (not yours: do not stop it); `pkill -f <script name>` also kills the shell whose command line contains the name — use `pgrep` first; never edit sources while the e2e runs (the lab remounts). (9) **`durationMinutes`** 64 = modules without the مسائل (88 with them). (10) **Bank by a helper from a written brief** (50 sheets, 230 questions, oracle, 8 `MISC-MUQ-*`), the helper stating honestly which exam items it could read.
- **Phase 0 entry 14 (`quwa-adad-ashara`, 3AM unit 3 lesson 1 of the remaining four, 2026-10-26) — patterns to reuse.** (1) **A net link that points FORWARD is corrected in the net, not worked around**: `3am.m3.r02 → r03` (rules → decimal writing) made the first lesson's « أستعدّ » measure the next lesson; it became `r01 → r03` plus `r02 → r04`, and `kitaba-ilmiya-rutba` gained `qawaid-quwa-ashara` in `prerequisiteLessonCodes` (`LEARNING_NET.md` § 4bis). (2) **A unit's shared maths module is seeded by its first lesson and EXTENDED by the others** (`packages/core/arithmetic/tenPowers.js`: exact BigInt decimals `{m, e}`, `parseDec` / `decText` with NBSP groups, `exponentOfPow10`, the three counts zeros / rank / zeros-before, names and prefixes, `expanded`, `timesPow10`); a LaTeX writer must replace the NBSP groups by `\\,` first and ONLY THEN the decimal comma by `{,}` (the first comma of `10\\,000` was eaten, a bug that printed raw `\\displaystyle`). (3) **A lab whose hand holds an EXPONENT** (`ten-zoom`, `MANIPULATION_CONTRACT` § 2quinquaquadragies): the evidence is the decimal plate (« the 1 moves, a zero appears »), a physical scale drawn from a virus to the Moon's orbit, and a prediction made BEFORE the first notch; no notation 10ⁿ is shown until the formal phase. (4) **A book entry that is another lesson's mechanism is rejected and written down**: activity 1 (a cell ×10 per hour) is exactly the train of `quwat-adad-nisbi` with base 10, so its square / cube became rows of أتمرّن and the config header lists the rejected candidates. (5) **A boundary written in the unit README is checked in the bank**: no 10ᵐ × 10ⁿ, 10ᵐ/10ⁿ or (10ᵐ)ⁿ anywhere; a conversion that would need one (1 Go, 10⁴ mm in m, 1 m² in cm²) is posed in DECIMAL; the plan's own option « 10³ × 10² = 10⁶ » (ex-8) was replaced by decimal / factor-count options. (6) **Extraction re-read found printing details the transcription had wrong** (ex-5 and ex-6 carry `1/10^-n` denominators, ex-10 is `1 mL = 10^-2 dL` and `1 cm³ = 10^-9 dam³`, `self-2` is printed `10 ⁴` with a blank): each was recorded in `DISCREPANCIES`, `self-2` is read 10⁻² in the test, `ex-13` (a product) was re-destined to the next lesson (pending) and `ex-63/64/68/69` (أتعمّق) left the synthesis as `notIntegrated` (MASAIL § 14). (7) **Knowledge-graph layout test**: a `common_mistake` is never a child of the root, and two mistakes in one lane under one parent (or a mistake before the next concept's edge label) fail the 328–1100 px layout — spread lanes or drop the node. (8) **Glance budget**: `[data-tz-glance]` ≤ viewport height at five sizes, also in the refusal state (the tallest banner), by cropping the SVG viewBox and keeping the ×10 / ÷10 buttons text-only at 414 px. (9) **Bank by a helper** (50 sheets, 170 questions, oracle with its own BigInt parser that decides every key without reading `expectedAnswer`; 7 `MISC-ASHARA-*`) in parallel with the extraction helper and the lead's lab.
- **Phase 0 entry 16 (`qawaid-quwa-ashara`, 3AM unit 3 lesson 2 of the remaining four, 2026-10-26) — patterns to reuse.** (1) **A lab whose hand holds a SIGNED COUNT of columns between two marks** (`unit-ladder`, `MANIPULATION_CONTRACT` § 2sexquadragies): the three rules on powers of ten are read as distances — two chained bands ADD, a band across the metre measures a GAP (3 − (−2) = 5), the area / volume tables re-tile the ruler (2 / 3 columns per unit) so a power of a power MULTIPLIES — which a train of factors cannot show; the student CHOOSES the table in متقدم and a wrong table, an end inside a plaque or a wrong plaque is refused with its calculation. (2) **A task direction decides its sign**: write the card as the question the band answers (« كم سم في 1 كم » = km → cm, +5, a red band; « 1 ملم² كم م² » = mm² → m², −6, blue) and let the unit test check every pair of every mode against the shared maths (`bandOf === unitColumns`). (3) **One discovery per level** (`ManipulationDiscovery` carries one prompt): put the strongest refutation in the discovery (the GAP, the table PRODUCT) and ask the other relation (the SUM) in the module question with the student's own evidence. (4) **A lesson that must not rebuild a published sibling's mechanism recalls it in a LINKED « تذكّر » box** (`TextbookBox kind="remark"` with a router `Link` to the published lesson and a `data-recall-link` hook), shown only at the step where it is needed; the published lesson's own recall box (`RECALL_TEN`) must stay a TRUE statement of this lesson. (5) **A notebook-to-judge module** (module 2): the lines of a classmate's notebook carry the book's error TYPES (multiplied exponents, ignored sign, added exponents in a power of a power, a sum of powers) with other numbers; the student judges all six lines in a `BatchChoiceQuestion`, then corrects them ONE at a time with a `TapQuestion`, and the box naming each rule appears only after its correction. (6) **A « practice » destination in the extraction needs a citation**: `check:textbook` wants every element whose `DEST` is this lesson cited by SOME content of the lesson (a `src(...)` in `content/*.js`, a bank sheet, or a module); elements only inspiring the bank are listed in `cites` of the closest exercise. (7) **Knowledge-graph layout, again**: a parent with ONE mistake child and one centre child puts the edge label on the mistake; a parent with TWO mistakes in the SAME lane and ONE child in lane `end` passes at every width; two mistakes in different lanes, or three in one lane, do not. Put the mistakes under a concept that is last in its محور and keep the rest of the chain in lane `end` (a mistake may `require` a LATER item of the same محور). Two of the four error types therefore stay in module 2 and the bank only. (8) **`durationMinutes` follows the catalogue convention** (modules without the مسائل: 62; `estimatedDurationMin` 86). (9) **An e2e stub user needs a real-looking name**: a one-letter first / last name sends the app to the « عرّفنا بنفسك » form and no lab is found. (10) **Plan fixes recorded in the plan's « Generator notes »**: the task u2 direction, one discovery per level, the 13-column length ruler, the corpus exercise cited by the bank (`3am-s2-83` ex 2, not ex 1).
- **Phase 0 entry 14 (`wadiya-idmajiya-ibarat-harfiya-3`, the THIRD 1AM–3AM synthesis, 3AM unit 4, 2026-10-26, queue #17) — patterns to reuse.** (1) **Same shape and gates as entries 4 and 12**, with TWO الكفاءات (P1 mobilise the tools, P2 translate then decide; `passingScore` 3 for four épreuves) — the LP total of `coursesData.test.js` is now 527; `durationMinutes` is modules 0 + 7 + 8 (30), `estimatedDurationMin` the sum (70). (2) **A synthesis of an algebra unit poses geometry and money situations answered by EXPRESSIONS**: `GuidedProblem` takes decimals in `numeric` and everything symbolic as a `choice` (`role: 'conclude'`, distractors = the unit's named errors: bracket sign, lost cross-term, forgotten ½, sum for difference); a 3×3 grid is a `problem.table` (row header column + `؟`), a rectangle is a `figure` GeoFigure measured in the test, a distance is a `route` illustration (digits from the statement only). (3) **Module 7 of a synthesis shows no formula of the solution, only the DECISIONS** (what changes, why letters and not tried values, simplify before substituting); `content.test.js` greps the module source, comments included, for every key and the stage-1 formulas. (4) **π in answers**: keep `k·π` symbolic in the keys and say « بمفتاح π في الآلة الحاسبة وتدوير النتيجة إلى 0,01 » — 3,14 gives 15,07 where the calculator gives 15,08. (5) **A bonus « تحدٍّ » is NOT an épreuve**: it lives in the `synthese` slot of `BossFinal` as a `TapQuestion` card without `assessment`, so it never counts toward mastery. (6) **JSX text containing `{,}` does not parse**: wrap prompts with decimals in `<Q>{'…'}</Q>` (a string), as the models do. (7) **Re-reading an extraction can overturn a transcription** (here « غير مبلّل » = dry, not wet): record it in `DISCREPANCIES` and never show it. (8) **Bank**: 5 × 10 sheets of exercise 2 / exercise 5 registers, `term_exam` only for the six papers actually read, `MISC-SYN-HARF-*` for the new distractor errors, oracle with exact BigInt rationals + polynomials and π as a letter (`scripts/practice-oracle/wadiya-idmajiya-ibarat-harfiya-3.mjs`).
- **Phase 0 entry 17 (`mutabayinat-amaliyat`, 3AM unit 5, lesson 1 of the remaining three, 2026-10-26, the INEQUALITY half of programme item `3am.m5.r05`) — patterns to reuse.** (1) **A lesson that shares a programme item with a published sibling** (`musawiyat-amaliyat`, the equality half) crosses NO net link, so it takes cross-lesson `pointPrerequisites` toward it (`P1 ← 3am_musawiyat-amaliyat_P1`, `P2`/`P3 ← …_P2`) next to its intra-lesson edges; « أستعدّ » measures the sibling with ONE platform statement (`priorKnowledge` id `musawiyat-amaliyat-3am`), and a « تذكّر » box (link by `getLessonPath`) recalls it in the `brief` of معارف next to the box of the later-unit tool it does not rebuild (`muqaranat-natiqayn`: the sign of a difference). The 2AM order of relatives (`muqarana-nisbiya`, no net link to the item) is measured too, outside the net. (2) **A lab whose hand holds ONE KNOT and the whole number line follows** (`loom-threads`, `MANIPULATION_CONTRACT` § 2sexaquadragies): comb (x + c) and nail (c·x) on two graduated beams, a red and a blue thread that CROSS exactly when the factor is negative; the release of the knot is the trial; a third beam chains two operations; a painted BAND (`x < 3`) is transported by `linear.js › imageRay` (new, with `boundAffine` for the brackets of `ax + b`, both swept in `linear.test.js`). The `levels.test.js` branch measures the pair by the stages allowed, the band and the step. (3) **Inequality keys are checked by WITNESSES, not by a typed value** (`content/content.test.js`): the written LaTeX of every option (`\frac`, `{,}`, `\leq`, implicit multiplication) is read back by a small evaluator on BigInt rationals, the key must be true for EVERY sample that satisfies the hypothesis AND equivalent to it (the tightest consequence), and every distractor must be FALSE for at least one sample — so a WEAKER TRUE consequence (`x > 7 ⟹ x + 3 > 4`, `x < −3 ⟹ x < 3`) is not a distractor: the test caught several in the plan (final-test item 4 `x < 3` became `x < −12`) and in the مسائل (`S < 74`, `25x ≤ 630`). « لا يمكن الحكم » rows need witnesses of BOTH signs. Row generators `tx(plain)` write the LaTeX from plain text; brackets keep their ends ordered. (4) **Boundary words**: the lesson never writes « متراجحة » / « حلّ » / a solution set / a number line of solutions for an inequality (4AM `mutarajiha-ula` owns them) — « استنتج متباينة طرفها الأول x » is the whole scope; the bank may say « حلّ » only for EQUATIONS. (5) **`validate:lessons` asks every levelled lab resource for `sourceElementIds`** (here `act-2b`, `know-2b`); a question placed BEFORE the brick that establishes its idea must `require` the prior-year id, never that brick (`E_REQUIRES_ESTABLISHED_LATER`). (6) **Order lines are LTR islands**: `<bdi dir="ltr">` with a minus sign and a symbol was painted in the wrong order — write the line as an `inline-flex` `dir="ltr"` span, each part its own isolated span, and read the real order from `getBoundingClientRect()` (a small RTL-page screenshot is easy to misread). (7) **A taller state must still fit**: three beams grew the lab block past the screen at 1024×768 — a narrower gap, no decorative carpet and `space-y-2` brought it back (765 / 768); the e2e measures the 3-beam state at the five sizes. (8) **A shared dev server reloads the page when another author edits the tree**: the lesson e2e re-measures a failing overflow check once and gives the page 15 s to mount; do not read a single red run as a lesson bug. (9) **Bank by a helper from a written brief** (50 sheets, 200 questions, oracle with its own BigInt rationals and 200 witnesses per key, 10 `MISC-MUTABAYINA-*`) and **extraction update by another helper** (re-routing of `ex-19`, `ex-23`, `ex-24`, `ex-26`, `ex-27`, `now-75-2` printed `x − 8 > 7`, `now-77-1` both stored answers wrong) ran in parallel with the lead's lab.
- **Phase 0 entry 19 (`hasr-adad-ushri`, 3AM unit 5, lesson 2 of the remaining three, 2026-10-26, programme item `3am.m5.x1`) — patterns to reuse.** (1) **A later lesson EXTENDS a 1AM item whose home lesson is unpublished** (`1am.m3.r05`, `hasr-qiyam-muqarraba`): « أستعدّ » measures it with platform statements next to two rewritten textbook items (`prep` 13 and 15; item 14 is the bank's / أتمرّن's), the « تذكّر — السنة الأولى » box sits in the `brief` of معارف (link by `getLessonPath`, none while unpublished) and `pointPrerequisites` stay intra-lesson; the published sibling's property (× positive) gets its own « تذكّر » box where the lesson uses it (طريقة C, مسائل). `priorKnowledge` ids may exceed the net's (here four, two of them for the 2AM quotient and the sibling). (2) **A lab whose hand holds the QUANTITY and an INSTRUMENT refuses** (`scoop-scale`, `MANIPULATION_CONTRACT` § 2septquadragies): the idea (the half-open interval of a rounded reading) is met by the hand at BOTH ends — 1,25 included, 1,35 excluded — and the refusal quotes the neighbour pinch in the student's numbers; the trap task (2/7 kg, a lamp that never says « balanced ») shows a quotient trapped between two ticks. `decimals.js` gained `floorAt` / `ceilAt` / `roundAt` (half up) / `roundingInterval` / `quotientDigits` (the LAST digit of a calculator screen is ROUNDED: 247 ÷ 83 → 2.975903614) / `quotientBracket`, all swept. (3) **A pointer hold-timer must read its direction BEFORE resetting it**: a `setState` updater runs later, so `release()` that zeroed `h.dir` made the tap-on-the-pile add a pinch instead of removing one — the e2e's pointer step caught it; capture `const { dir } = h` first. (4) **Equivalence, not just falsehood, for « from a rounding » options**: `content.test.js` reads the written LaTeX of every bracket option and checks on a fine grid that the key describes EXACTLY the set of numbers with that rounding and that each distractor either fails for a member of the set or is true for a number outside it (the closed right end `3,55 ≤ x ≤ 3,65`); brackets of a GIVEN number (a quotient, π) are strict, tight (two consecutive marks of the rank) and every distractor false — a TRUE but loose bracket (`35,7 < 250/7 < 35,8`) is not a distractor (the plan listed three; they were replaced). (5) **Decimals as exact data, the calculator screen as text**: the screens printed in statements (`8.276595745`, `7.093821510`) are recomputed with an independent BigInt rounding; a decimal point is used for the machine, the comma for the student's own writing. (6) **A step that needs the advanced level is optional** (`done: !!q.d || !hasTrap`): module 1 reads the trap task's evidence when it exists and shows an « اختياري » line otherwise. (7) **Number-line figure as data** (`content/figures.js › roundingLine(r, rank)` → `{ lo, r, hi }` from `roundingInterval`, drawn by `content/RoundingLine.jsx`: a filled dot on the included left end, a hollow one on the excluded right end), tested by `figures.test.js` with integers. (8) **Bank by a helper from a written brief** (oracle with its own BigInt scaled decimals) and **extraction update by another helper** (`prep` 14 option order and `prep` 15's merged rows corrected at 200 dpi, `now-77-1` keys 8,342 / 8,336 / 8,345 recomputed) ran in parallel with the lead's lab.
- **Phase 0 entry 18 (`kitaba-ilmiya-rutba`, 3AM unit 3, lesson 3 of the remaining four, 2026-10-26) — patterns to reuse.** (1) **A lesson that EXTENDS an unpublished earlier-year lesson (noRebuild)** (`1am.m1.r06` رتبة المقدار → the order of magnitude of a scientific writing): the idea is RECALLED in a « تذكّر » `TextbookBox` placed after the question that needs it (no link while `rutbat-miqdar-jam` is unpublished), « أستعدّ » measures it with one platform statement, and the lesson builds only the added value (bracket, `a'` = `a` rounded to the unit, the carry `a' = 10 → 1 × 10ⁿ⁺¹`). (2) **Two lessons of a unit share one maths module, extended not rewritten**: `tenPowers.js` gained `scientific`, `isScientific`, `bracketOf`, `cellOf`, `orderOfMagnitude`, `logPos`, `sciTex` (the lab's `logic/sizeLadder.js` and the tests call them; `content.test.js` recomputes with its own BigInt evaluator and asserts « the key is the scientific writing EQUAL to the value; every distractor is not that writing » — a distractor may equal the value yet be of the wrong form, e.g. `604 × 10⁴`). (3) **A lab whose hand holds a POSITION on a multiplicative scale** (`size-ladder`, MANIPULATION_CONTRACT § 2unquadragies): rung = bracket, cell = mantissa, magnet = order of magnitude, comparison = rungs first; two discoveries are split per level because the shell carries one. (4) **A typed phase BEFORE the gesture** (متقدم: write `a` and `n`, judged exactly with the value in the refusal) turns a typical fault into a refused trial (`4,8 × 10⁻¹ = 0,48 ≠ 0,000048`). (5) **Numbers in a refusal sentence are KaTeX** and exponents are real `<sup>`, never Unicode superscripts (blobs in the font) nor plain Arabic text (bidi turned `265 ≥ 1 000` into `1 ≥ 265 000`). (6) **A hang-by-colour shortcut is removed**: a wrong rung does not glow while hovering; the verdict comes with the release. (7) **`GuidedProblem` illustrations**: the scene icon list has no satellite — use `tags`. (8) **Elements bound for the bank that no module uses are cited as `cites` of the nearest exercise** (`check:textbook` wants a citation by the same lesson; an unreachable Pythagoras / Thales exercise is `notIntegrated` with its reason in `build-extraction.py`). (9) The unit's `prepDiagnostic.test.js` counts PUBLISHED lessons: it is red between the files existing and the catalogue flip.
- **Phase 0 entry 20 (`wadiya-idmajiya-quwa-nisbiya`, the FOURTH 1AM–3AM synthesis, 3AM unit 3, 2026-10-28) — patterns to reuse.** (1) **Same shape and same gates as entries 4 / 12 / 14**; the LP total of `coursesData.test.js` is 528. (2) **A synthesis answered in SCIENTIFIC WRITING**: a `GuidedProblem` `numeric` step takes ONE decimal, so `a × 10ⁿ` is two `numeric` answers (`ask` 0 = `a`, `ask` 1 = `n`), an intermediate product is a `compute` step, and a « which power / which unit » decision is a `choice`; a sorter item or a module `desc` never prints a raw `10^-6` (use words or `10¹²`). (3) **The final test's distractors are the unit's named errors** (an exponent ADDED in a quotient, the prefix kept un-normalised, the factor 0,1 forgotten, the quotient inverted, the order of magnitude rounded up, the bracket shifted) and module 7 shows none of the values (`content.test.js` greps for them). (4) **A 50-sheet numbers bank is generated from templates** (`docs/reports/MOYEN_ROLLOUT_PROGRESS.md` entry 20): one function per family (value of a power, exponent `10ⁿ`, scientific writing `a` / `n`, order of magnitude, bracket, comparison, sign, priority) and six story templates, ASCII expression → LaTeX + Fraction value, the oracle spec emitted with the sheet and evaluated by an independent BigInt oracle.
- **Phase 0 entry 21 (`wadiya-idmajiya-musawiyat-mutabayinat`, the FIFTH and last 1AM–3AM unit-1–5 synthesis, 3AM unit 5, 2026-10-28) — patterns to reuse.** (1) **Same shape and gates as entries 4 / 12 / 14 / 20**; the LP total of `coursesData.test.js` is 530 (TWO الكفاءات). (2) **A synthesis whose module 7 SOLVES its situation and module 8 tests ANOTHER one** (the unit's plan: pursuit analysed in five steps + four variant decisions, then the two trucks): the analysis is a `MethodSteps` block followed by `TapQuestion`s, no lab (a synthesis has none — do not wire `term-ferry`); module 7 may show its own values but must not contain the module-8 values (`content.test.js`). (3) **`requires` of a synthesis' questions are the unit's lesson slugs** from `priorKnowledge` (`E_REQUIRES_NOT_ESTABLISHED` otherwise — another lesson's brick id is not established); **each knowledge item rides exactly one `notebook` node** of `knowledgeGraph.js`; **a drawing may not print a digit the statement lacks** (`ربع T`, not `1/4`). (4) **An answer that is an inequality or a bracket is a `choice`; a bound, a count or a value is a `numeric` step**; « the smallest integer n > 23 » is a `numeric` (24) after a `choice` on `23 < n`. (5) **Template bank with a self-judging oracle**: an affine-form evaluator solves equations and tests substitutions; each MC option carries its own spec and EXACTLY one must be true; a translation distractor must be re-solved (a coincidence at x = 1 made one correct), and signatures of one question must have distinct values.
- **Phase 3 entry (`wadiya-idmajiya-amaliyat-tabiiya-ushriya`, the FIRST 2AM synthesis, 2AM unit 1, 2026-10-29) — patterns to reuse.** (1) **A synthesis of a unit generated lesson by lesson** is generated INTO its catalogue entry after the unit's lessons are published: `pointPrerequisites` P1 ← one الكفاءة of EACH lesson (here `_P3` of the three first, `_P4` of `tawzi`), « أستعدّ » = six platform affirmations (one or two per lesson, `requires` = the lessons' own `<code>-2am` ids declared in `priorKnowledge`), the module 7 carries a `RecallLinks` row « تذكّر » (`getLessonPath`, a link that renders nothing while a lesson is unpublished) — no situation REBUILDS a lesson. (2) **Module 8 is `BossFinal`, choice only**: a plan's numeric stages (« كم بيتًا؟ ») become choice epreuves whose distractors are the named errors (`ROUNDUP`: the quotient rounded up; `MAXNOTMIN`: the largest limit instead of the smallest; a result computed for one house too many) — the `GuidedProblem` of modules 1–6 keeps the numeric inputs. (3) **Module 7 never shows a solution value**: the test lists the forbidden strings (the quotients 7,5 / 6,5, the profit, the leftovers) and the decisions are asked in WORDS (« المبيعات − (ثمن الطلاء كلّه + ثمن الغراء) »). (4) **A plan's `selfCheck` bonus** whose answers are open chains is rebuilt as a `choice` with exactly ONE true option (independent evaluator in `problems.test.js`) when the module cannot run a chain evaluator. (5) **The bank's oracle imports the unit's chain evaluator** (`scripts/practice-oracle/silsila-bi-aqwas.mjs` exports `E`/`parse`) instead of a new parser; the generator that writes the 50 sheets and rewrites the `SPEC` block of the oracle lives outside the repo, so edit the oracle only through it. (6) **Textbook elements without a lesson destination** (`deep-*`) are cited by ADAPTED bank sheets (`source.type: textbook`, `exam.kind: adapted`); an illegible figure is redesigned in text with own numbers. Plan: `docs/sources/2am/unit1/plan/wadiya-idmajiya-amaliyat-tabiiya-ushriya.md` (Generator notes).
- **Phase 3 entry (`wadiya-idmajiya-kusur-amaliyat`, the SECOND 2AM synthesis, 2AM unit 2, 2026-10-29) — patterns to reuse.** (1) **Same shape as the 3AM unit-2 synthesis** (modules 0 + six `GuidedProblem` situations + 7 analysis (`ContentModule`, the only module that carries `objectives`) + 8 `BossFinal`), no lab; `durationMinutes` 30. (2) **« أستعدّ » carries LIVE recall links** to the unit's five lessons (`getLessonPath`, `data-recall-link`) in its brief — the situations recall, never rebuild; `priorKnowledge` ids are `<lesson-code>-2am`. (3) **2AM boundary inside a synthesis**: a whole is found from a unit fraction by MULTIPLICATION (`6 × 500`, never `÷ \frac16`); a bracket distractor must be FALSE (`0,4 < x < 0,5` around 0,486 is true — use shifted / flipped / wrong-area brackets); fractions are CHOSEN (`choice`), decimals typed (`numeric`). (4) **The final test's trap is a counter-check by sum** (`\frac38+\frac14+\frac18+\frac23 = \frac{17}{12} > 1`): the module-7 text never shows a solution value (`3/4`, `1/6`, `9600`, `1600`, `3600`, `0,48`), and the memo quizzes use other numbers than the test. (4bis) JSX: a string containing `{,}` in a `<Q>` child must be a `{'…'}` expression. (5) **The bank's Islam-respect regex needs word boundaries** (`ثلاثة أرباع` contains « ربا »).
- **Phase 3 « 2AM unit 1 » entry 1 (`silsila-bidun-aqwas`, 2AM `amaliyat-tabiiya-ushriya`, 2026-10-28, the first lesson of the unit — it SEEDS it; generated from `docs/sources/2am/unit1/plan/silsila-bidun-aqwas.md`) — patterns to reuse.** (1) **A lesson that seeds a unit also seeds its shared maths module** (`packages/core/arithmetic/chainOps.js`, grown one row per lesson — L1: `tokenize` · `parseChain` · `evaluateChain` · `valueInOrder` · `conventionalOrder` · `offTreeStep`; built on `powers.js` and `relativeOps.js`, imported BY PATH, cross-checked in its test against `relativeOps.evaluate`), the whole-unit `docs/sources/2am/unit1/build-extraction.py` (86 elements, only the lesson's own `verified: True`, `challenge` rewritten with own numbers and `sourceElementId`), and `_unit/` (copy of the previous 2AM unit's). (2) **A lab whose hand holds an ORDER** (`tram-route`): the student stamps tickets ① ② ③ on the operators, « انطلق » REPLAYS the plan and a world-truth (the tram counter) judges it; the first step off the conventional tree is DRAWN as an absurdity (`offTreeStep` → `overflow` / `groups` / `price`), and a different plan with the same value is ACCEPTED (the contrast opens the discovery). The task data are the chain only — the stops, the counter trail and the absurdity are derived (`termsOf`, `trailOf`, `absurdOf`), so `QUESTIONS` build every text from the task's numbers. متقدم adds writing the chain from a told story (tap plates into parity-checked slots, judged by VALUE) and a non-blocking prediction. Contract §2duoquadragies. (3) **No bracket anywhere** (the boundary with the next lesson): `content.test.js` / `problems.test.js` scan every `$…$` island of exercises and problems for `( ) [ ] \\frac`; `chainOps.tokenize` refuses them; every intermediate is ≥ 0 (`isNonNegativeChain`) until the relative numbers. (4) **`memo` fields `rule`, `example`, `chip` must be PURE KaTeX in strict mode — no Arabic, not even inside `\\text{…}`** (`memoContent.test.js`: « Unrecognized Unicode character »); express direction with `\\overrightarrow{a-b+c}`, priority with a colour (`R('b\\times c')`) or `\\succ`; the Arabic goes in `hook`, `trap`, `exam`. (5) **Validator facts met**: a levelled advanced preset must cite the textbook (`T('know-1')` in `levels.js`) and `levels.test.js` needs a branch measuring the pair of a new type; `durationMinutes` in the catalogue is the modules' minutes WITHOUT the مسائل (66 here, `validate:lessons` warns beyond ±10), the config's `estimatedDurationMin` is the total (90). (6) **Scratch-written JS with LaTeX**: write `\\;` `\\text` with DOUBLE backslashes in a template literal (a single `\;` is silently dropped and a Python `replace` can leave stray `\\;` after statement ends — `npx esbuild file.jsx` pinpoints the line). (7) **Bank answer type**: the plan's `decimal` does not exist — an exact decimal is a `rational` answer with a point-decimal key, as in `mana-jam-tarh`. (8) **The platform stays book-independent**: the book's misprints found while extracting (method-2 « = 6 », ex-34, prep 7 « 14,5 ») are recorded in the extraction `DISCREPANCIES`, never shown.
- **Phase 3 « 2AM unit 1 » entry 2 (`silsila-bi-aqwas`, the second lesson of `amaliyat-tabiiya-ushriya`, 2026-10-29) — patterns to reuse.** (1) **A later lesson of a seeded unit EXTENDS its shared maths module with a NEW row and keeps the old one strict**: `chainOps.js` gained its L2 row (`tokenizeB` · `parseB` · `evaluateB` · `bracketPairs` · `uselessBrackets` · `bracketForm` · `barToLine` / `lineToBar` · `calculatorRead` · `calcDisplay` · `leftToRight` · `calculatorKeys`) while L1's `tokenize` still REFUSES brackets (tested). `uselessBrackets` compares calculation-TREE shapes after removing a pair, so « the pair repeats what the priority already does » is computed, never asserted. (2) **A lab whose hand places a SYMBOL into a typed line and whose referees are a real machine AND the story** (`coop-calculator`, contract §2duoquadragies bis): the calculator prints exactly what a scientific calculator prints (« Syntax ERROR » for an unbalanced line, the honest negative of a numerator-only line, never taught), the story refuses a value in its own objects, and the final card « ما تقوله الوضعية » stays hidden until the task is done or after the second story refusal. A task flag (`needPair`) makes the student LIVE a contrast (a useless pair accepted with a remark, a necessary one refused). (3) **Every bracket a student may place yields a NAMED trap** (`task.traps: [{ line, key }]` → `refute.<task>.<key>`), recomputed in the logic test, so every refusal text is written for the wrong line the student actually typed. (4) **Keypad labs**: digits glue to the number left of the cursor, the cursor index shifts by one after each insertion (build nested lines from the right), `dir="ltr"` on the key grid and the line, a physical-keyboard map (digits, `+ - * / ( )`, Enter, Backspace, arrows) and a separate free-panel keypad that shows the machine's value NEXT TO the « left-to-right without priority » value. (5) **A scene that rescales its viewBox width by `SCENE_H / H`** keeps its proportions when the height budget compresses it. (6) **Textbook elements the lesson content does not cite fail `check:textbook`**: give a topically close exercise a `cites` list (`ex-12`, `ex-29`, `ex-30`, `self-3`, `deep-40/41/43/50/53` here); mark `verified: True` in `build-extraction.py` only for pages actually re-rendered (`L2_VERIFIED`). (7) **The 90-minute cap counts the مسائل**: `estimatedDurationMin` 90 = modules 66 + 24; the catalogue `durationMinutes` is 66. (8) **Memo cards and bricks**: `rule` / `example` / `chip` are PURE KaTeX (no Arabic), titles carry no `$`, and a « true » distractor (a correct inequality offered as wrong) is a bug — `content.test.js` re-computes every option with its own BigInt evaluator (with ( ) [ ]), including the « useless pair » of each exercise by REMOVING it.
- **Phase 3 « 2AM unit 1 » entry 3 (`wasf-silsila-hisab`, the third lesson of `amaliyat-tabiiya-ushriya`, 2026-10-29) — patterns to reuse.** (1) **A positioned parse tree in the shared maths module** (`chainOps.analyse`: token indices + operator indices, groups folded into `wraps`) turns « where is the root / what does a cut give / which staples » into computed facts (`cutAt`, `staplesOf`) without touching `parseB` (another lab depends on it). (2) **The referee is a PHYSICAL constraint, not a value**: a cut elsewhere than the root « bites a staple » even when the recollected value equals the true one (`same`), so the lab teaches structure, not a numeric coincidence. (3) **Arabic sentences from a tree** (`describe`, hand-written table in tests, depth-2 comma rule) are the single source for exercises, banks and the lab; never retype one. (4) **Never negative**: `cutAt` returns `rebuilt: null` instead of a negative recollected value; `nonNegative` guards the free panel and the banks. (5) **A multi-step lab inside a narrow column** (1024×768 → ~414 px): compact pockets, no visible label on the sticker row, say the sentence once; measure the worst phase (done + banner = 760 px). (6) A « riddle » context (not « magician ») for programs; a lesson never uses sorcery wording.
- **Phase 3 « 2AM unit 2 » entry 2 (`kasr-hasil-qisma`, the second lesson of `kusur-amaliyat`, 2026-10-28) — patterns to reuse.** (1) **`packages/core/arithmetic/fractions2.js`** (BigInt, imported BY PATH, tested in `fractions2.test.js`) is the shared exact module of 2AM unit 2, grown lesson by lesson (E1: `clearDecimals`, `decimalQuotientBracket`, `fitsAtRank`, `isDecimalQuotient`); it never re-implements `decimals.js` / `fractions3.js` / `powers.js`. (2) **A lab whose verdict is a PHYSICAL fact** (`mooring-lines`: b × q laid on a rope of a m — it fits, lands, or overflows) with a **dial that stays closed until the current rank's bracket is found** and a bar that ZOOMS into the found segment (MANIPULATION_CONTRACT §2novenquinquagies); a متقدم level whose clip is LOCKED until the student chooses the unit that makes the divisor natural (predict first). (3) **A module-2 lab posed alone with its own chain**: `tasks=[{ id: 'k1', … }]` + `levels={false}` + `CHAINS.k1` ends on the `rule` question, so the module's steps only keep the TRACE. (4) **A 2AM « تذكّر » toward a published lesson of the same unit is a link** (`getLessonPath('qisma-iqlidiya-hasr')`) after the question that needed it; a toward-1AM recall of a PLANNED lesson (`hasr-qiyam-muqarraba`) has no link (« قريبًا »). (5) **Textbook elements whose idea the bank does not reuse** (the 1AM-recall exercises `ex-3…ex-6`, `self-1…-9`, `ict-2`) are cited by an `alsoSource` array of the lesson's own exercise that really adapts the idea (extra rows), so `check:textbook` is green without a dishonest pointer. (6) **Never leave a distractor true**: a bracket option such as `0,7 < 5/7 < 0,8` is a TRUE inequality (wrong rank, not false) — use false shifts (`0,72 < 5/7 < 0,73`, `0,70 < 5/7 < 0,71`) and recompute each in `content.test.js` with its own BigInt division.
- **1AM unit 1, lesson 3 (`adad-ashri-mustaqim-mudarraj`, 2026-10-30) — patterns to reuse.** (1) **A catalogue entry's `programmeItems` can differ from the plan card's « rNN »** (the card named the net PREREQUISITE): keep the entry's item and record it in the plan's « Generator notes ». (2) **`prerequisiteLessonCodes` must name an EARLIER lesson of the unit** (`coursesData.test.js`): a forward reference of the book (here `muqaranat-adad-ashriya`, order 3 vs 2) is measured in « أستعدّ » and linked by `pointPrerequisites` only. (3) **A lab whose first step makes the student choose a SCALE** (`jump-tape`: the unit is stretched, a plage is refused by DRAWING, never worded) and whose second step uses it; level 2 reads flags already planted with a cursor (exact or by bounds) on a hidden-origin window and a finer scale. (4) **Textbook figures that need a graduated half-line** are drawn with `NumberLine` (`mode="static"`, `markers` without `label` values, `format={(v) => formatDec(v, { maxDecimals: 3 })}` — the default `formatFr` drops decimals); no `StatementFigure` kind draws one yet, so bank sheets use worded positions. (5) **Re-read figure positions at 400 dpi**: a 110 dpi reading of `act-4` gave B 1,9 / C 0,6 where the tick count says 1,7 / 0,5 — count ticks, do not estimate. (6) **Fallback questions placed BEFORE their brick take no `requires`** of that brick (`E_REQUIRES_ESTABLISHED_LATER`), and a brick is rendered only in the module `knowledge.jsx` declares it under; avoid a capital-letter-plus-parenthesis (`F(5,2)`) in the final test unless the notation is taught (`H_NEVER_TAUGHT « f(x) »`).
- **1AM unit 5, lesson 1 (`adad-nisbiya-siyaqat`, 2026-10-30, SEEDS UNIT 5) — patterns to reuse.** (1) **A unit whose book prints NO تحدّ** keeps `units_1am › <unit>.challenge: null` and says so in the extraction header (the card's « cite the تحدّ » is generic). (2) **An element that straddles the lesson boundary** (`know-2`: the half-line + abscissa go to the next lesson, the « distance to zero — opposites » paragraph to this one) is split with `destinations.<id>.items` and the boundary is written once in `build-extraction.py`'s header; the book's recap page (`prep`) is a UNIT-page element when no item serves the lesson (the lesson measures its own net items by `platform_addition`). (3) **A lab whose VARIABLE is a LEVEL on a vertical gauge** carries three worlds on one engine (`scene`: thermometer / altitude pin / lift cabin) and asks each reading IN WORDS, so the student translates words → level; the relative number is an OUTPUT (`reading pill`), and sign vs distance are drawn as two different things (the pill vs the hatched bracket). (4) **A negative number in an Arabic sentence is KaTeX `$-3$` inside `MathText`** — never a plain « −3 » with `U+2066/2069` isolates (the minus ended on the right of the digits in the checkpoint options); SVG `<text>` is wrapped in `U+2066 … U+2069` as well; an empty i18n value prints the KEY. (5) **A bank about signed numbers needs the « 0 is both positive and negative » rule respected in every item**: never ask « is 0 positive? » as a true/false; classification counts exclude 0 or state it. (6) **`GuidedProblem`**: a numeric step carrying `ask` must be `role: 'answer'`, a choice carrying `ask` must be `role: 'conclude'` (`validateProblem`); a `tags` illustration holds 1–3 cards and its icons come from the drawing set (no `sun` / `snow`). (7) **The bank generator can emit float noise** (`−0,36 − 1`): round every derived number to 2 decimals before writing a `misconceptionSignatures` value (the validator rejects « -1,3599999 » as unreadable).
- **1AM unit 5, lesson 2 (`talim-mustaqim-mudarraj`, 2026-10-30) — patterns to reuse.** (1) **A lab whose hand CARRIES a unit** (`stride-stamp`): the world is FINITE on purpose (a road of 250 west / 450 east) so a stride that is too long cannot reach the asked position — the judged model `edge` says « the road ends before » and never names the right stride, and changing the stride ERASES the ticks (a new situation clears the old verdict). (2) **One lab, five task kinds** (`stamp`, `twin`, `place`, `origin`, `bound`) each judged in exact TENTHS by a pure `judge`; the hand's position is the only state, the abscissa an OUTPUT; `origin` relabels every tick live from the flag so a wrong flag disagrees with the written graduations by itself. (3) **Graduated lines in أتمرّن / مسائل are `GeoFigure` data** (`content/figures.js`, generated with the same drawing as the bank: one label per WRITTEN tick, point names above the axis, hidden pad points for the 2:1 aspect rule); each position is re-read from the drawing's coordinates in `content.test.js`; the figures go above the exercise through `withFigures` (`Module04Atamarran.jsx`). (4) **A plain `−5` after Arabic text (a hint, a title) drifts to `5−`**: every hint, title and error string of the lab that contains a negative number is KaTeX and its element is wrapped in `MathText` (the placeholder of an LTR `<input>` is fine). (5) **An element whose direction the scan does not show** (`deep-4`, the snail) may be reused only if the platform's own statement SAYS the direction; otherwise leave it « not integrated » with its reason. (6) **A lesson with TWO programme items** (`1am.m5.r06` + `r05`) writes LP edges from the net link of EACH prerequisite: P1 ← the lesson that owns `r05` (`adad-nisbiya-siyaqat_P2`), P2 and P3 ← the lesson that owns `r04` (`adad-ashri-mustaqim-mudarraj_P2` / `_P3`); `prerequisiteLessonCodes` lists both home lessons. (7) **The successor's « تذكّر — السنة الأولى » goes live by itself** once the lesson is `available`; connecting it is only the LP edge in its catalogue entry plus a history line in its `lesson.config.js` header.
- **1AM unit 6, lesson 1 (`bahth-adad-naqisa`, 2026-10-30, SEEDS UNIT 6) — patterns to reuse.** (1) **A lab whose hand holds an OPERATION CARD and a direction** (`rewind-belt`): the missing number is the OUTPUT of the crate crossing a machine with the PICKED card, never typed; the check by substitution is a SECOND move (push the crate back through the ORIGINAL machine), so a wrong card is judged by what comes out (« 72 بدل 54 »), never corrected; `normalizeTasks` refuses a rack with zero or two right cards. (2) **A quotient that does not stop is a FRACTION, not a rounding**: `missingNumber.js` is rational-exact (`isTerminating`, `text`, `latex`), the crate shows `20/7` and the check is exact; the bank's `MISC-NAQISA-APPROX` catches `2,86`; a `rational` answer key is written canonically (`4.7` or `20/7`) and the oracle audits that form. (3) **The official form `a − … = b` puts the unknown in the SECOND position**: the trap card is `rsub` (its own inverse); the lab and the bank carry both `□ − a` and `a − □`. (4) **A program of several cards is rewound in the REVERSE order** (`MISC-NAQISA-ORDER`): not a lab task (one card keeps the gesture distinct) but a مسألة (stairs) and the bank's `back` questions. (5) **`validate:lessons` compares `LESSON_CONFIG.skills` with the catalogue `pointsToLearn` literally, KaTeX included** (`$\square+9=54$`). (6) **`levels.js` advanced preset must cite the textbook** (`...T('now-82')`) while the beginner is `...P`. (7) **Any equality in plain text inside a knowledge-graph node is an error** (`lessonGraphs.test.js` « math island »): write `$\square+9=54$` even in a definition. (8) **A bank of 50 sheets from a typed DSL**: a generator (kept in the lead's scratch, not committed) types each question once (`solve`, `calc`, `back`, `eq`, `calcchoice`, `verify`, `tf`) and writes BOTH the sheet and the oracle's `SPECS`; the oracle recomputes keys, renders the options itself and checks signatures (`SAMEOP`, `TRAPADD`, `REVSUB`, `MULAGAIN`, `DIVREV`, `ORDER`). (9) **A pointer drag must be snapped at the ends** (`clamp01` aims 0 / 1 within 3 %) or a real mouse lands on 0,99999 and never docks; the e2e drags with `page.mouse` after scrolling the SVG into view. (10) **The 1AM programme's `1am.m5.r10`** has an official wording « a + … = b ; a − … = b ; a × … = b » (unknown second): read it before choosing the card shapes.
- **1AM unit 5, lesson 3 (`talim-fi-mustawi`, 2026-10-30) — patterns to reuse.** (1) **A lab whose hand is LOCKED to ONE AXIS at a time** (`courtyard-drone`): the drone rolls only along the horizontal, « ثبّت » fixes it, then only along the vertical; the refusal of the diagonal is a DRAWN event (shake + crossed line, `last.kind === 'refuse'`), not a judged one and not a trial — a refusal is never evidence, only a record is; the pair `(x ; y)` is an OUTPUT (reading pill) and the ORDER of the two numbers is the hidden idea (the swapped pair is another place, judged `swap`). (2) **A place SAID by its two numbers is not drawn before it is photographed** (otherwise the student drives to the picture, not to the numbers); an object that must be READ is drawn with a dashed ring and no number. (3) **Coordinates in the plane are `GeoFigure` data** (`grid: true`, `axes: true`, two hidden corner points that fix the frame ±5 × ±4, so the aspect stays square): the same figure helper serves the lesson's `content/figures.js`, the مسائل (`PROBLEM_FIGURES`, a target made of nested `polygons`) and every bank sheet; a hidden-origin grid is `grid` WITHOUT `axes`. (4) **A bank answered with a PAIR uses `answerType: "point"`** (`{ x, y }`, abscissa first, `answerFormat` « اكتب الثنائية (x ; y) »); a read of ONE coordinate is `rational`; « which point », « which region », « on which axis » are `choice` whose distractors are the named errors `MISC-MUSTAWI-*` (`SWAP`, `SIGNX`, `SIGNY`, `SIGNBOTH`, `AXISSWAP`, `SAMEMIX`, `SYMMIX`, `SYMBOTH`…); only `recall | apply | transfer | reason` are valid `cognitiveDemand`s. (5) **A symmetric of a point of its own axis is that point**: the oracle must not flag « the answer is printed » there. (6) **`validateProblem`**: a written solution needs ≥ 2 lines. (7) **Do not name a notion in a lab before the module that names it**: « محور الفواصل / التراتيب » appear first in module 2; the lab says « الخط الأفقي / الشاقولي ». (8) **A new lab on a TALL plane cannot meet the 700 px of `stride-stamp`**: put the controls in one card (current place + counters, then ONE row of arrows and two buttons) and shorten the contexts; measure `[data-xx-glance]` at 1024×768 and write the real number in the contract.
- **1AM unit 6, lesson 2 (`tatbiq-qaida-harfiya`, 2026-10-30) — patterns to reuse.** (1) **A lab whose hand holds the VALUE of a letter** (`letter-dial`): a printed rule with slots, a dial per letter, a tape that shows the substituted line (explicit ×) then each reduction (brackets, products, sums); a value counts only at the RELEASE of the dial, so passing through the asked value finishes nothing. (2) **A pretended rule that holds at the start** (`claim`: `a + b = a × b` at (2 ; 2)) makes « one counterexample suffices, examples that hold prove nothing » something the hand does; `normalizeTasks` refuses a claim with no counterexample or whose start does not hold. (3) **The implicit product is read AND rendered**: `letterRule.js › tokenize` turns `2x`, `ab`, `3(x+2)` into products and every substitution prints × (`2x` for x = 3 is `2 × 3 = 6`, never `23`); the free panel lets the student type such a rule. (4) **A convention shared with the next lesson is split by `items` in the unit's extraction**: this lesson names the letter and the omitted ×, the next keeps the remarks (`x × 1`, `ba = ab`, `a × a`) and the production of expressions. (5) **A forward reference** (the rectangle's perimeter and area, `1am.m2.r08`, taught later) is a « تذكّر » `TextbookBox kind="remark"` with no link and no LP edge, and « أستعدّ » still measures it (the only net prerequisite of r08). (6) **Vars of `cp.*` question strings are plain integers written inside the string's own `$…$`** (never nested dollars). (7) **A page-wide bank** was produced by a delegated helper from a written brief (50 sheets, oracle with its own evaluator, `MISC-TATBIQ-*`), as in earlier lessons.
- **A lesson that EXTENDS a published earlier-year lesson opens on a « تذكّر »** (`LEARNING_NET.md` §4.3): a `TextbookBox
  kind="remark"` titled « تذكّر — السنة … », source `addition('prior_year_reminder')`, linking the base lesson with
  `getLessonPath(code)` (null — no link — while it is unpublished). The base item is a `priorKnowledge` id measured by « أستعدّ »,
  never a `knowledge.jsx` item of the new lesson. A same-year item taught LATER in the book (a « renvoi en avant » of the queue) is
  measured in « أستعدّ » through its earlier-year base and named in معارف without being built (`qisma-iqlidiya-hasr`: « قيمة
  مقرّبة بالنقصان / بالزيادة », built by `kasr-hasil-qisma`).
- **A textbook page that belongs to another lesson** (`qisma-iqlidiya-hasr`: the طرائق p. 27 is `kasr-hasil-qisma`'s) is removed
  from the lesson's catalogue `textbookRef.pages` (`"method": null`); a method module the lesson still needs is a declared
  `addition('knowledge_formalization')`, and exercises the textbook lacks are `addition('practice_generation')` « على منوال » the
  term exams.

### Adding a textbook UNIT (done for unit 2 « الحساب على الجذور », 2026-09-30)

A second unit is data plus three one-line bindings — never a copy of unit 1's plumbing:

1. **Extraction first**: `docs/sources/<grade>/unit<N>/extraction.json` (`unitCode`, every element of the
   pages word for word, computed answers marked `answerSource: computed`, `discrepancies` for misprints,
   and a `destinations` block giving each element ONE lesson — `items` may split an element such as
   `prep` or `qcm` across lessons). Unit 2's was generated from a script so that LaTeX escaping is
   reliable; the scanned PDF has no text layer, so the transcription is visual (zoom doubtful passages).
2. **Catalogue**: the unit in `units_<grade>_*.json` (objectives, `challenge` and `aside` citing their
   `sourceElementId`, `synthesisLessonCode: null` when the platform publishes no « أدمج تعلّماتي » lesson —
   the situation is then assigned to a lesson like any other element), its code appended to
   `publishedScope.unitIds`, and the lessons in `lessons_<grade>_*.json` (owner-supplied titles and
   points to learn, `sourceTopicId` among the unit's `sourceTopicIds`).
   Write the math in `challenge`/`aside` as `$…$`. Bare `x² + 12x = 85` gets reversed in RTL. **A
   `challenge` or `aside` that points to a figure** (« الشكل المقابل », « البيان المقابل », « التمثيل البياني
   المقابل », « في جدول ») must show that figure on the unit page. Register it in
   `apps/web/src/pages/unit/UnitOpenerFigure.jsx` under the key `<unitCode>:challenge|aside`. Reuse, lazily,
   the component the lesson already draws for that same figure (never a second copy). Strip anything that
   gives away the answer (`ChallengeSquare showAreas={false}`, `ChallengeGraph plain`). Then add the unit to
   `e2e/lesson-kit/4am-unit-opener-figures.mjs`, which fails when a تحدّ points to a figure that isn't
   registered.
3. **`_unit/`**: `unitMeta.js` (constants + `src`/`addition`) and the three bindings of
   `lessons/common/unit/` (`moduleContext.js`, `lessonRoutes.jsx`, `prepDiagnostic.jsx`), plus a copy of
   the unit's `prepDiagnostic.test.js` with the unit's lesson count.
4. **New mathematics → new manipulation types** by MANIPULATION_CONTRACT §7ter, arithmetic in
   `packages/core/arithmetic/` (unit 2: `squareRoots.js`; the three types of §2quater).
5. The lessons (this guide), then the lesson index (`node scripts/generate-lesson-index.mjs`; `App.jsx` until
   2026-10-14), the DB handshake (§11) and the documentation.

Unit-count assertions that read the real catalogue (`unitGrouping.test.js`, `finalSynthesis.test.js`,
`decomposition.test.js`) must be updated in the same task.

**Unit 3 « الحساب الحرفي » (2026-10-01) added three things to this recipe:**

- **A ميدان chosen by the owner.** The programme ranges النشر والتبسيط / التحليل under « ميدان الحساب
  الحرفي »; the owner placed the unit under « ميدان أنساب الأعداد والحساب » like units 1–2. The
  catalogue keeps the programme's topics (`sourceTopicIds: ['nashr_tabsit', 'tahlil']`, traceability)
  and the unit DECLARES the gap: `placement: { programmeDomainId, decidedBy: 'owner', decidedOn, note }`.
  `decomposition.test.js` accepts a lesson whose chapter differs from its topic's domain ONLY under such
  a declaration; `coursesData.js` looks a topic's official title up in the whole programme.
- **The extraction is generated and CHECKED** (`docs/sources/4am/unit3/build-extraction.py`): every
  expansion/factorisation answer is computed by sympy and every « أستعدّ » truth value recomputed, so a
  transcription slip fails the generation instead of reaching a lesson.
- **Parallel authoring without shared-file races.** Each lesson's oracle entries live in its own module
  `scripts/practice-oracle/<lesson>.mjs` (helpers: `scripts/practice-oracle/helpers.mjs`, an exact
  rational-polynomial calculator independent of `packages/core`), spread into the one ORACLE of
  `practice-answer-oracle.test.mjs`. The unit's misconception ids, `policy.json` and `active.json`
  entries are seeded once before the lessons are written.

**Unit 4 « معادلات ومتراجحات » (2026-10-01) confirmed the recipe and added:**

- **One exact module for a family of labs.** The four labs share `packages/core/arithmetic/linear.js`
  (fractions, `linear('4x-3')`, `solveEquation`, `solveInequality` with `flipped`, `applyBoth`, `factors`),
  written and tested BEFORE the authors started, so no lab carries its own arithmetic.
- **The lead seeds every shared file before parallel authoring**: catalogue, extraction, `_unit/`, `App.jsx`
  routes, the four type registrations (types, registry, level pairs, empty i18n namespaces), `policy.json`,
  `active.json`, the unit's misconceptions and one empty oracle module per lesson. Authors then touch only their
  lesson, their lab and their own namespace — five authors, no shared-file race.
- **A lab built for two lessons.** `growth-race` was written by lesson 4's author against a props contract fixed
  in the brief (`left`, `right`, `theme`, `domain`, `goal`), and the synthesis reuses it with its own world
  (`theme="pool"`) and its own level pair; the synthesis keeps the props in `content/textbook.js › LAB` and a
  lesson-local render test mounts the workspace with that same object.
- **New drawn worlds are data**: `family` and `pool` were added to `VISUAL_THEMES`
  (`packages/core/curriculum/manipulationLevels.js`) — `validate:lessons` refuses an undeclared theme.

**Unit 5 « جمل معادلتين » (2026-10-01) replayed the recipe (four authors on a seeded foundation) and added:**

- **A pair is an answer type.** In a lesson, `TextbookExercise` takes `interaction: 'pair'` (`PairQuestion`,
  `expected: { x, y }`, `names` for (a ; b)); in the bank, `answerType: "point"` — both judged by the same evaluator,
  one right number being `partially_correct` (`EXERCISE_CONTRACT.md` « Unit 5 »). The oracle checks the key equals
  the pair it recomputes (`P(x, y)`, `solve2`).
- **One exact module for systems**, `packages/core/arithmetic/linearSystem.js`, on `linear.js` fractions, written
  and swept over every textbook system before the authors started.
- **Owner rules born here, binding on every manipulation**: one screen without scrolling, hide / show
  (`LabFold`) and movable panels (`MovablePanel`), near-square blocks of objects (MANIPULATION_CONTRACT §8bis) —
  measured by the unit's e2e at four viewports.
- **The web build needs ~3,2 GB**: `apps/web`'s `build` script sets a 4 GB heap (`DZ_FIRST_DEPLOYMENT.md`).

**Unit 6 « الدالة الخطية والتناسبية » (2026-10-02) — six authors on a seeded foundation — added:**

- **A ميدان the programme does not have.** The owner asked for « ميدان التناسبية والدوال »; the programme
  (`programme_4am_2026_2027.json`, a verbatim transcription) files « الدوال الخطية » under « ميدان الحساب الحرفي » and stays
  untouched. The display ميدان is DATA: `units_4am_2026_2027.json › ownerChapters` (`{ id, titleAr, subtitleAr, decidedBy:
  'owner', decidedOn, note }`), appended by `coursesData.js` after the programme's domains with NO official topic; every
  unit ranged there declares its programme domain in `placement` (`decomposition.test.js` and `coursesData.test.js`
  check both). The lessons live under `lessons/moyen/4am/<that chapter id>/<unit>/`, the import depths are those of the
  other units (six levels from `modules/` and `components/`, five from the lesson root), and the DB handshake creates
  the chapter row like any other.
- **One exact module for proportionality**, `packages/core/arithmetic/proportional.js` (tables and ratios, fourth
  proportional, a from (m ; f(m)), image / antecedent / on-line, direction, percentage multipliers and chains, the
  « machine » rules x², ax, ax + b with their linearity witnesses), tested before the authors started.
- **One lab shared by three lessons with a contract fixed in the brief**: `origin-line` (L3 draw / read / pivot, L5 fit,
  synthesis read + `cap`), its props in MANIPULATION_CONTRACT §2octies; the reusing lessons keep theirs in
  `content/textbook.js › LAB` + `lab.render.test.jsx`.
- **A shared-file lock for parallel authors**: every shared file (lesson.json, levels.js, misconceptions.json, …) was
  edited through one script that re-reads the file inside a global `flock` (`json-set` / exact `replace`) — no race in
  six parallel authors. Each author pushed its i18n namespace as one JSON value.
- **Two owner requests on every lab**: a GENUINE manipulation (the hand holds the variable) AND a decorative layer of an
  Algerian Gen-Alpha world (e-scooters on the promenade, the Eid souk, the téléphérique, the mall soldes), decoration
  `aria-hidden` and never carrying an answer. The unit e2e measures the one-screen fit on each lab's « glance » block
  (instrument + controls + reading), not on the whole card (title, level selector and folds sit around it).

**Unit 7 « الدالة التآلفية » (2026-10-02) — six authors on a seeded foundation, the same day — added:**

- **A source with no formal pages.** The owner supplied only pages 77–79 (opener, تحدّ, أستعدّ, five أنشطة): no معارف,
  طرائق, exercises, QCM or « أدمج تعلّماتي ». The extraction says so (`discrepancies › scope`), and everything else is a
  DECLARED platform addition with a reason that names it: `knowledge_formalization` (the formal knowledge, label
  « معارف من المنصّة » in `textbook.additionReason`), `synthesis_generation` (« محتوى إضافي من المنصّة »),
  `prerequisite_diagnostic`, `interaction_generation`, `practice_generation`. Banks are almost entirely `practice_generation`.
- **A synthesis without a textbook synthesis.** The platform writes ONE composite situation that needs every lesson of the
  unit, in the textbook's shape (قراءة · تحليل · تنفيذ), each part linked back to its درس, solved in module 1; the final test
  TRANSPOSES it to other numbers so its answers appear nowhere else. A levelled manipulation must still cite an extraction
  element: the synthesis cites the unit's `objectives`, declared `objectives.duplicatedIn` in the builder.
- **One exact module on the previous ones**: `packages/core/arithmetic/affine.js` is written ON `linear.js` and
  `linearSystem.js` (an affine function is unit 4's `{ a, b }`, an equation is unit 5's ax + by = c) — no second fraction or
  system implementation; tested on every textbook number before the authors started.
- **Level pairs follow `levels.test.js`**: the advanced level cites the textbook and is measurably heavier, so when a
  textbook activity is the richest version, the platform's simpler numbers go to مبتدئ.
- **« أستعدّ » requires ONE id per item** (`prepDiagnostic.test.js` counts `requires: ['id']` literals): a prior-knowledge
  id that needs diagnosing gets its own item, never a second id on an existing one.
- **Glance selectors are fixed in the brief** (`data-am|al|ss|lc|pc-glance`) so the lead's unit e2e is written before the
  labs exist; e2e `apps/web/e2e/lesson-kit/4am-dala-taalufiya.mjs` (224 checks).
- **Misprints this time are bidi**: a coordinate pair printed reversed « (1 ; 0) » for (0 ; 1) in act-3, the unit after an
  amount (`$…$ DA` reverses — put `\,\mathrm{DA}` inside the island) and « 10°C » (written `$10\,^{\circ}\mathrm{C}$`).

**Unit 8 « الإحصاء » (2026-10-02) — five authors on a seeded foundation, the same day — added:**

- **Owner lessons that cut across the textbook's sections.** The owner's five lessons (cumulative frequencies; range / mean /
  median; spreadsheets; reading and interpreting situations; synthesis) do not follow the textbook's activity order: L3 gathers
  the textbook's Excel / GeoGebra / calculator exercises (ex-7, ex-15, ex-16, ex-23, ex-24, ex-1 هـ), L4 has NO textbook activity
  and enters through the unit's تحدّ. The `destinations` of the extraction say it element by element; the knowledge those two
  lessons formalize is a declared `knowledge_formalization`.
- **One exact module for statistics**, `packages/core/arithmetic/statistics.js` on `linear.js` fractions (tables, cumulative
  up / down, relative cumulative, « على الأكثر / على الأقل / تفوق » counts, range, weighted mean, median by ranks, classes and
  class centres, median class, mode, groups reunited, a hidden value from a mean, N from a removal), tested on every textbook
  number before the authors started.
- **A unit topic list = the topics its lessons carry.** `decomposition.test.js` requires every `sourceTopicIds` entry of a unit
  to have a lesson; the programme's nine statistics topics are taught inside four lessons, so the unit declares the four
  carried ones (ALGERIA_4AM_CURRICULUM §5 says where the other five are taught).
- **Misprints found by computation, not by eye**: the builder asserts every textbook count, sum and rank; it proved ex-20's
  median « 6 » impossible (→ 6,5), and showed that ex-19's « odd » bars are a puzzle, not a misprint.

**Unit 9 « خاصية طالس » (2026-10-02) — four authors on a seeded foundation, the first geometry unit — added:**

- **A programme ميدان, no `placement`.** « ميدان الهندسة » (`handasa`, topic `thales`) exists in the programme: the unit sits under it
  directly, lessons in `lessons/moyen/4am/handasa/khassiyat-talis/` (same import depths as the other units).
- **One exact module for Thales**, `packages/core/arithmetic/thales.js` on `linear.js` fractions: ratios, fourth proportional, k
  (`scale`), the reciprocal on SIGNED abscissas (`converse` decides ratios AND order, `reason`), partition and ratio points
  (`ratioPoint`), a constructed length, the shadow height, the cylinder in a cone — tested on every textbook number first.
- **Figures are DATA: `GeoFigure`** (`lessons/common/components/GeoFigure.jsx` + `geoFigure.js`): named points, segments, lines,
  rays, polygons, right angles, angles, equality ticks and parallel chevrons, an Arabic `ariaLabel`. Every textbook figure of the unit is
  `content/figures.js` data drawn by it, in modules, in the final test (`inline` inside a prompt) and in the practice bank through the
  new `statement.figure` (EXERCISE_CONTRACT « Unit 9 »). A geometry statement that says « الشكل المقابل » always carries its figure.
- **A synthesis whose workspace pairs two types** (`shadow-world` مبتدئ = the تحدّ — `shadow-stick` until 2026-10-13 —, `cone-cylinder` متقدم = the situation): the
  objective is what both levels share (MANIPULATION_CONTRACT §7bis-levels, §2undecies).
- **Bidi of geometry names**: the prime (B′) and « )//( » are now isolated by `utils/bidi.js` (ARABIC_RTL_CONTRACT « Geometry names »).
- **Seed stub `routes.jsx` before parallel authoring.** `App.jsx` imports every lesson's `routes.jsx`; while a sibling's file does not
  exist yet, Vite answers 500 on EVERY page, so an author cannot open the dev server. Unit 9's authors worked around it with a temporary
  resolver stub; next time the lead seeds a minimal `routes.jsx` per lesson (returning `null`) with the other shared files.
  *(Obsolete since 2026-10-14: `App.jsx` imports no `routes.jsx`; the lazy glob of `lessonLoaders.js` only sees files that
  exist, so a sibling's missing lesson no longer breaks the dev server. Run the index generator once all lessons exist.)*
- **Misprints found and corrected**: أستعدّ 5 (ADE → ADF), معارف 2 example (MN/AC → MN/BC), طرائق « حساب أطوال » (1/2 → 2/1 = 5/DN).
  Figure readings decided in the builder: the تحدّ minaret 7,25 m (shadow method), ex-9 needs the converse of Pythagoras, ex-13
  « not parallel » under either label reading, ex-23 equality marks read at 500 dpi.

**Unit 10 « حساب المثلثات في المثلث القائم » (2026-10-04) — five authors on a seeded foundation — added:**

- **One exact module for trigonometry**, `packages/core/arithmetic/trigonometry.js` on `linear.js` fractions and `squareRoots.js`: SURDS
  `{ q, r }` = q·√r (3/√13 = 3√13/13 stays exact), the sides relative to an acute angle (`sides`), the three ratios (`ratioExact`), the bounds
  (`isPossible`: sin, cos ∈ ]0 ; 1[), the relations (`fromRatio`: the two other exact ratios from one), the choice of ratio (`lengthPlan`,
  `anglePlan`), the calculator world (`sinDeg` …, `ratioRad` / `angleRad` (what a calculator left in RAD shows), `roundTo` with the decimal comma, `screen`, the textbook's key sequences) — tested on every
  textbook number first. The extraction builder asserts every printed screen value (5,915503958 …) with Python's own `math`.
- **The brief and the lock live in the repository** (`docs/sources/4am/unit10/brief-authors.md`, `locked_edit.py`): unit 8's scratchpad was
  wiped mid-session; nothing the authors need sits in a temporary directory any more.
- **Stubs for EVERYTHING a sibling imports**: `routes.jsx` per lesson (App.jsx) AND each new lab component (`manipulationRegistry.js` imports it
  lazily — Vite transforms the import even before it is called). Each stub says it is one and is replaced by its owner.
- **A lab shared by a lesson and the synthesis with a FIXED props contract** (`clinometer`: `height | ladder | align`), the synthesis keeping
  its numbers in `content/textbook.js › LAB` (unit 6's pattern).
- **Arabic never inside KaTeX**: the textbook's word fractions (« طول الضلع المقابل / طول الوتر ») use the new shared
  `lessons/common/components/WordFraction.jsx` (ARABIC_RTL_CONTRACT « Word fractions and calculator keys »).
- **Rounded values are `rational` keys, exact surds are `choice`** — no new answer type (EXERCISE_CONTRACT « Unit 10 »).
- **`levels.test.js` measures lists and objects** (angle tables, construction targets) by their numeric leaves.
- **A تحدّ that says « اعتمادا على الشكل » refers to a figure** too: `4am-unit-opener-figures.mjs` now detects it.
- **Misprints and readings**: معارف 2 example `tan B = AC/BC` → `AC/AB`; معارف 4 box `sin²x + sin²x = 1` → `cos²x + sin²x = 1`; the
  situation's distance read 95,65 m (h ≈ 92 m, the real height of مقام الشهيد; 96,65 would give 93 m); ex-25's 30° is at O (∠AOD), so
  ∠OAB = 15°; ex-18's sin x = 3/2 and √5/2 are deliberate impossibilities (« إن أمكن »); ex-15 names its third pupil « رضا ».

**Units 11 « الأشعة والانسحاب » and 12 « الأشعة في معلم » (2026-10-04) — two units in one run, ten authors in two waves — added:**

- **One exact module for both units**, `packages/core/arithmetic/vectors.js` (exported `vectors`) on `linear.js` fractions and
  `trigonometry.js` surds: points and vectors `{ x, y }`, `vec`, `translate`, `relation(u, v)` → the textbook's three elements
  (منحى / اتجاه / طول — every « same vector? » verdict of every lab), `fourthVertex`, `parallelogramSum`, `midpoint`, exact `distance`
  (√13, 3√2), `triangleNature`, `quadNature`, `onCircle`, and NAMED vectors as formal point combinations — `simplifyNamed(['AB', 'BC'])`
  → 'AC', opposites → '0', irreducible → null — so Chasles needs no special case. Authors added the crossing problems (`crossing`,
  `crossingSide` for the تحدّ swimmer, `shortestCrossing` for the synthesis) through the lock.
- **GeoFigure draws vectors and grid paper** (`vectors: [{ from, to, label }]` — arrowhead and the \vec-capped name; `grid: true |
  { step }`), used by every figure of both units, in modules, final tests and `statement.figure`. A grid figure displays at 540 px by default.
- **Figures are analysed, then reproduced or REDESIGNED** (owner rule born here, §5 « Textbook figures »): unit 11's act-1 (a 4 × 11 strip,
  C′ on C, E on L, H on P) was redrawn 14 × 8 with the same concept and recomputed answers; `figureQuality(fig)` is asserted empty in every
  lesson's `content/figures.test.js` — and content globs (`loadLessonMemoSources.js`, `check-textbook-coverage.mjs`) now skip `content/*.test.js`.
- **Two waves of five authors** on one seeded foundation and ONE lock (`docs/sources/4am/unit11/locked_edit.py`, brief
  `docs/sources/4am/unit11/brief-authors.md` for both units): ten parallel authors do not fit a 13 GB machine (dev server + browser each).
  The second extraction twice stalled the API reading full-page 300 dpi images: an extraction agent writes its builder page by page and
  Reads crops ≤ 1400 px.
- **A workspace mounts both levels**: SVG gradient / clip ids come from React `useId` (a constant id blanked the hidden level's twin sky),
  and Playwright uses `:visible` locators.
- **GeoFigure grew three keys during unit 12** (each through the lock, each tested): `axes: true | { every }` (the repère's two axes,
  arrows, graduations — a number is dropped when it would sit on a point name), `arcs: [{ from, to, sweep }]` (a semicircle on a
  diameter) and `circles: [{ center, through }]`. A unit-12 coordinate figure is GeoFigure `grid` + `axes`, never a third repère.
- **`BatchChoiceQuestion` rows grow with their label** (owner report, unit 12): the label column was a fixed 14 rem, so three formulas
  « EF² = 20 ، FG² = 20 ، EG² = 40 » broke after « = » and covered the choices; it is now `min 14rem, max 55 %`, formulas never break
  inside (`[&_.katex]:whitespace-nowrap`), the options take the rest and wrap.
- **Unit e2e and the smooth scroll**: the site scrolls with `scroll-behavior: smooth` and a module resumes at its step
  (`utils/scrollToStep.js`); under load Playwright's level-tab click landed mid-scroll (« element is not stable »). The unit files
  `4am-ashia-insihab.mjs` / `4am-ashia-maalam.mjs` centre the tab with `behavior: 'instant'`, wait for `scrollY` to settle and click in
  the page — the real tap was verified with `elementFromPoint` at three scroll positions.
- **Misprints and readings (unit 12)**: method-equal concludes AB = CD → AB = DC; know-origin's A printed « (2,5 ; -3-) » (an RTL
  reversal) → A(−3 ; 2,5); ex-8 « CD(2;-5) » is the vector CD; ex-12 and ex-26 name a crossed quadrilateral (→ ABDC, ACBD); ex-21
  « أربع نقط » → three; the situation's « ≈ 9,96 » is right only if rounding comes LAST (the rounded terms add to 9,97 — used as the
  rounding trap).
- **Misprints and readings (unit 11)**: ex-21's conclusion (the midpoint of [ED] is K, not L); ex-4 / ex-8 ask for more equal vectors than
  exist (5 and 3); act-1's grid read on a curled page; the GeoGebra TP's missing « ارسم نقطة D »; ex-13 « AC + AA » kept as printed.
  The unit page's « ستعود إلى هذا التحدّي في الدرس 6 » (true for unit 1 only) became « …خلال دروس الوحدة ».

**Unit 13 « الدوران - الزوايا - المضلّعات المنتظمة » (2026-10-04) — five authors on a seeded foundation — added:**

- **One exact module for rotations, angles and regular polygons**, `packages/core/arithmetic/rotation.js` (exported `rotation`) on `vectors.js`
  points and `trigonometry.js` surds: angles in degrees, orientation `'direct'` (anticlockwise, الموجب) | `'indirect'`; `rotate` EXACT for
  multiples of 90° (grid figures), `rotateApprox` for drawing only; **`imageCheck(O, M, M′, α, dir)` → `{ ok, length, angle, sense, measured }`**,
  the textbook's three conditions (OM = OM′, \widehat{MOM′} = α, the sense) — every « is this the image? » verdict of every lab names the failing
  one; inscribed / central (`arcAngles`, `inscribedFromCentral`, `sameArc`); regular polygons (`centralAngle`, `interiorAngle`,
  `sidesFromCentral` → null when no polygon exists, `sideFromRadius` exact for n = 3, 4, 6, `regularVertices`, `star`, `radiusForChord`).
  Authors added through the lock `lineAngle`, `polygonArea`, `rotationCenter`, `onBisector` (khawas-dawaran), `circlePosition`,
  `vertexAngle` (an angle whose vertex is inside / outside the circle, zawiya-muhitiya), `circleGaps`, `ringByRotation`, `chordOfArc`,
  `arcLength` (the synthesis).
- **GeoFigure grew three keys** (tested in `geoFigure.test.js`): centred arcs `arcs: [{ center, from, to, sweep: 'ccw' | 'cw', arrow, label }]`
  (the path of M to M′ around O; `ccw` = direct as SEEN; the intercepted arc of an inscribed angle), `angles[].arrow` (the rotation's sense),
  `circles: [{ center, radius }]`. A regular polygon's points come from `rotation.regularVertices` in `content/figures.js`.
- **A تحدّ that shows a photo**: the unit's تحدّ (the star of the flag) has no « الشكل المقابل » but the book shows the flag; the unit page draws it
  (`mudalaat-muntazama/components/FlagStarFigure.jsx`, no measurement), registered as `'dawaran-mudalaat:challenge'`.
- **A scan with gaps decided by computation**: ex-10 and ex-16 leave an angle unfixed (the lessons state the figure's 45° / 40° as data),
  ex-18's grid is almost erased (rebuilt from the only rotation that fits), ex-5's angles were measured on the scan (120°, 150°, 90°, 60°).
  Misprints: معارف 4 example 3 « AOB » → AMB; method-angle « 180° » → 108°; ex-12's missing angle name (AMD); ex-15 « ABCDEF » → BCDEF (A is
  the centre); ex-17 (BEM) « ABCD » → ABDC; QCM item 1 « صورة A » → B. The تحدّ « رأسين متتاليين » is read as the five tips (pentagon of side
  10 cm, R ≈ 8,51 cm; the other reading R ≈ 13,76 cm is kept in the extraction).
- **The extraction agent stalled once** (API watchdog after « render pages »): resumed by message with crops ≤ 900 px, the builder having been
  written page by page — nothing was lost.
- **Lead review by screenshots found what tests do not**: a stretch handle on a named point, a bidi-reversed « 0 × 50° = 0° » counter, a hub
  label under the image handle, crowded gap labels at a lab's start — sent back to the authors by message.

**Unit 14 « الهندسة في الفضاء » (2026-10-05) — five authors on a seeded foundation, the FIRST unit in space — added:**

- **A programme topic the owner's transcription did not have.** `programme_4am_2026_2027.json` had no space-geometry topic under
  « ميدان الهندسة »; `handasa_fada` « الهندسة في الفضاء » was added at the owner's request and DECLARED in the file (`addedBy:
  'owner_request'`, `addedOn`, `note`); `coursesData.test.js` counts 29 topics and names the only added one.
- **One exact module for space**, `packages/core/arithmetic/space.js` (exported `space`) on `linear.js` fractions and `trigonometry.js`
  surds: π-MULTIPLES `{ k, latex, number }` (exact AND rounded: 1372π/375 and 11,494), `ballPosition` (OM² vs R² compared exactly — every
  « on / in / outside » verdict), sphere area / ball volume and their inverses, Archimedes' ratios, the familiar solids, the sections
  (`sphereSection`, `cuboidSection`, `cylinderSection`, `apexSection`), `scaleEffect` / `scaled` / `ratioFrom` (k, k², k³, exact roots or
  null), `bucketWater` (Thales + V_big(1 − k³)) — tested on every textbook number first.
- **Statistical charts: `StatChart`** (`lessons/common/components/StatChart.jsx` + `statChart.js`, `kind: 'chart'`, 2026-10-08): bar chart,
  histogram (+ frequency polygon), line / cumulative polygon, pie and half-pie, declared as data and validated (`validateStatChart`: every
  unprinted value on a gridline, `missing` parts drawn « ؟ »). Use it in a practice statement or a مسألة (`figure`) instead of a lesson-local
  chart; `StatementFigure` / `validateStatementFigure` are the single dispatch for plane, space and chart figures (EXERCISE_CONTRACT
  « Statistical charts »).
- **Figures in space: `SpaceFigure`** (`lessons/common/components/SpaceFigure.jsx` + `spaceFigure.js`, `kind: 'space'`): an orthographic
  projection that dashes HIDDEN lines by computation (polyhedron edges by back faces, the back half of an equator, a cylinder's bottom rim,
  contour generators of cones and frustums), dispatched by `ExerciseStatement` and `validate-exercises.mjs`; `spaceFigureQuality(fig)` = [] in
  each lesson's `content/figures.test.js`; `segments[].labelOffset` added by the synthesis author.
- **Live 3D labs on ONE kit** `lessons/common/manipulations/space/stage3d/` (three.js, already a dependency of the Math Lab's 3D tool):
  `SpaceStage` (z-up maths ⟷ three.js, render on demand, DOM labels, `draggable` + `onPlane` / `onLine` as the in-scene gesture),
  `solids3d.js` factories, `Stage3D.jsx` whose `fallback` (a SpaceFigure) fills the window until the WebGL scene exists — so the server render
  of the render tests sees it. The unit e2e fails when a glance block's scene is not live (`data-stage3d-ready`). MANIPULATION_CONTRACT
  §2quindecies.
- **A scan with no exercises, no QCM, no situation** (pp. 163–169 only; the pyramid / cone sections and enlargement knowledge missing):
  unit 7's recipe — declared `knowledge_formalization` / `interaction_generation` / `synthesis_generation` / `practice_generation`; the
  synthesis's situation is the unit's تحدّ (the bucket), whose figure the unit page draws (`'handasa-fada:challenge'`).
- **Readings and corrections** (extraction, 13 discrepancies): the تحدّ is 7 cm (rim → water) + 28 cm (water → bottom), so H = 35 and
  V = 24388π/3 ≈ 25,54 L (the other reading kept in `answer.alternative`); act-1's photo is a pétanque boule, not a shot put; « حجم الكرة »
  in the Archimedes text means الجلّة; act-3's stray « I »; act-5's F, G, H defined; know-3's missing « ب) »; فيثاغورس.
- **Lessons learned**: `ManipulationShell` prints a lab TITLE raw (no bidi isolation) — write lab titles in words, never « 40 cm » or
  « r = 4 »; judge a 3D lab on VIEWPORT screenshots (a full-page Playwright screenshot resizes and the on-demand canvas comes out empty);
  a long-running dev server can keep serving a stale `packages/core/index.js` after a new export — restart it with a cleared
  `node_modules/.vite`; a lock `replace` must take its old text from a fresh read, never from remembered line numbers (one author
  overwrote a sibling's level pair and restored it).

### `routes.jsx` — the whole file

```jsx
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';
import { buildLessonRoutes } from '../_unit/lessonRoutes';

const MODULE_FILES = import.meta.glob('./modules/Module*.jsx');

export default function myLessonRoutes() {
  return buildLessonRoutes({
    config: LESSON_CONFIG, basePath: LESSON_BASE_PATH, moduleFiles: MODULE_FILES,
    loadKnowledge: () => import('./knowledge'), loadIndex: () => import('./index.jsx'),
  });
}
```

`buildLessonRoutes` resolves each module component by the **number in its
filename**, wraps every page in the premium gate (`LessonAccessGate`), the
knowledge provider and the notebook anchor, and puts `LessonClassroomShell`
above the whole lesson as a pathless layout route so a Classroom session
survives module navigation. You get Classroom Mode, the notebook and the
free/premium lock for free; do not rebuild any of them.

> **Two digits, always.** `Module0117Wa18.jsx` is read as module **117**, and
> its route is silently not mounted. This shipped once and was found in
> production.

### `lesson.config.js`

Everything must be a **static literal** — the validators parse this file, they
do not execute it.

```js
export const LESSON_BASE_PATH = '/courses/moyen/4am/<chapter>/<lesson-id>';

export const LESSON_CONFIG = {
  id: 'qasim-adad-tabii',        // = the catalogue id; the progress storage key
  kind: 'lesson',                 // 'lesson' | 'synthesis'
  unit: 'aadad-tabiiya-natiqa',   // must match the catalogue's unitId
  unitTitle: 'الأعداد الطبيعيّة والأعداد النّاطقة',
  sequentialUnlock: true,
  title, description,             // Arabic
  level: 'moyen', grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab', chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4, masteryThreshold: 0.8, emoji: '🔢',   // both INERT today (read by nothing /
                                  // only on the non-sequential branch) — keep them for the validator
  estimatedDurationMin: 45,       // = sum of module estimatedMin, cap 90
  textbookRef: { unit: 1, activity: 1, pages: '8, 10, 14' },
  skills: [ /* Arabic objectives, shown on the lesson index */ ],
  teachingScope: { include: [...], exclude: [...] },
  knowledgeMap: true,
  priorKnowledge: ['qisma-iqlidiya', ...],   // diagnosed by module 0
  resources: [
    // A LEVELLED manipulation declares its level, the objective both levels
    // share, and where its situation comes from (§6, MANIPULATION_CONTRACT
    // §7bis-levels). Both levels must be present.
    { kind: 'manipulation', code: 'team-builder-15-3', type: 'team-builder',
      module: 1, level: 'beginner', title: '…',
      objective: 'التوزيع بالتساوي: a = b × q + r، والباقي معدوم ⇔ b قاسم لـ a',
      autonomy: '',                     // required and non-empty on 'advanced'
      experience: { type: 'platform_context',
                    reason: 'smaller_numbers_for_first_contact', theme: 'football' },
      learningPointIds: ['4am_qasim-adad-tabii_P1'],
      sourceElementIds: ['act-1'] },
    { kind: 'manipulation', code: 'divisor-explorer-420',
      type: 'divisor-explorer-books',        // a type from the CLOSED registry
      module: 1, level: 'advanced', title: '…',
      objective: 'التوزيع بالتساوي: a = b × q + r، والباقي معدوم ⇔ b قاسم لـ a',
      autonomy: 'سبعة عشر حجمًا دون اقتراح: التلميذ يختار ويقارن محاولاته بنفسه',
      experience: { type: 'textbook', reason: '', theme: 'library' },
      learningPointIds: ['4am_qasim-adad-tabii_P1', '…'],
      sourceElementIds: ['act-1'] },
  ],
  modules: [ /* see below */ ],
};
```

Each module:

```js
{ id: '01', number: 1, slug: 'al-maktaba', path: `${LESSON_BASE_PATH}/al-maktaba`,
  title: 'نشاط 1 — 420 كتابًا في رفوف', desc: '…',
  stage: 'trigger',
  teachesLearningPointIds: ['4am_qasim-adad-tabii_P1'],
  color: 'indigo', style: 'featured',
  estimatedMin: 10, difficulty: 1, actionText: 'أجرّب' }
```

`stage` comes from `packages/core/curriculum/lessonStages.js` and must appear in
journey order across the array:

```
prerequisite_check → trigger → discovery → manipulation
        → formalization → practice_lab → evaluation
```

Required for a `lesson`: `trigger, discovery, formalization, practice_lab,
evaluation`. For a `synthesis`: `trigger, practice_lab, evaluation`.
`prerequisite_check` and `manipulation` are used when the mathematics calls for
them. A lesson with `knowledgeMap: true` formalises continuously through its
Knowledge Map and needs no separate `formalization` module.

`difficulty` is **display only** — nothing reads it to adapt anything, despite
the name.

---

## 4. The shape of a module

A module is one React component built on `ContentModule` from
`lessons/common/kit`. The kit applies the platform's policies by construction;
a module supplies only content and its own `done` booleans.

```jsx
<ContentModule
  ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
  moduleTitle="…" moduleSubtitle="…" estimatedTime="12 دقيقة"
  brief={{ tag: 'معارف — الكتاب ص 10', title: '…', tone: 'violet', body: <p>…</p> }}
  // La carte d'activité accepte aussi, tous OPTIONNELS (§4bis) :
  //   headline, emoji   l'accroche de l'expérience (« هيا نلعب كرة القدم! »)
  //   visual            une vignette de contexte, DESSINÉE (jamais raster)
  //   footer            typiquement <SourceTag source={…} />
  intro={<Manipulation type="divisor-explorer" a={143} b={11} … />}
  steps={[
    { num: 1, title: '…', subtitle: '…', done: q1, content: <TapQuestion … /> },
    { num: 2, title: '…', done: q2, content: (kit) => <MyLab react={kit.react} … /> },
  ]}
  footer={<KnowledgeSnapshot moduleNumber={2} />}
/>
```

**Prototype (2026-10-28, `maqlub-qismat-kasrayn`):** the footer is `<KnowledgeSnapshot moduleNumber={n} variant="memo" />` and each item of
`knowledge.jsx` carries a `memo: { rule, hook, example, trap, exam, chip, quiz }` (`quiz`: 2 questions × 3 choices for the timed « اختبر ذاكرتك ») — the memo card (KNOWLEDGE_MAP.md « The memo card »). New
lessons MUST follow it — it is validated and rolled out to every lesson (§6ter).

`ContentModule` wires `useProgress`, the step progress bar, the streak and
effects toolkit, sequential step locking (`isStepLocked` — sequential on the
first pass, all open on a revisit *and* for a free-navigation reader), the
"what's left" popover on the next button (disabled for a student only —
`canAdvance`), completion, **and** the Classroom Mode unit sequence. There is no
auto-scroll and no auto-advance, ever.

The recurring module roles in the 4AM unit, by their Arabic names:

| Module | Stage | What it is |
|---|---|---|
| `Module00Astaidd` — أستعدّ | `prerequisite_check` | Every lesson of the unit opens on it (9 of 9 since 2026-09-30; guarded by `_unit/prepDiagnostic.test.js`). Diagnoses the lesson's `priorKnowledge` — previous years or earlier lessons of the unit — and never the lesson's own material; every `priorKnowledge` id is measured by at least one question. Built as described under « The « أستعدّ » pattern » below. Never gates, never persists evidence; its result is stored locally and read by nothing but its own results screen, so its copy must not promise that the lesson adapts. Under the result, the kit renders « راجع قبل أن تنطلق » (`kit/ReviewLinks.jsx`, since 2026-10-13): the official الكفاءات of earlier lessons — earlier years included — that this lesson builds on, read from the learning net by `lessonId`; a link when that lesson is published, « قريبًا » when it is only planned. Nothing to write per lesson: it comes from the lesson's `programmeItems` (`LEARNING_NET.md` §3). Advice tiers are computed on the score ratio (`kit/diagnosticLevel.js`). « التالي » without submitting does not complete it. |
| `Module01…` — the activity | `trigger` | the lesson's ENTRY POINT, designed by the platform (§4ter): the signature manipulation in the `intro` slot, at the TOP of the page, then questions on what the student did there (§4quater). The textbook's own activity is one candidate for this entry, never the default — when it is not chosen it is posed as an application later (typically in أتمرّن) |
| `Module02Maarif` — معارف | `discovery` | the textbook's definitions, each laid by a `KnowledgeBrick` at the moment it is needed |
| `Module0xAwazzif` — أوظّف تعلّماتي | `practice_lab` | the textbook's exercises via `TextbookExercise` |
| `Module0xItqan` — إختبار أولي | `evaluation` | the only source of assessment evidence (displayed title « إختبار أولي » since 2026-09-24; the slug `itqan` and the file name are unchanged, so URLs and saved progress are stable); its `desc` names learning points « الكفاءات », e.g. « خمسة أسئلة تُقيّم الكفاءات الثلاث. » — never « نقاط التعلّم », see ARABIC_RTL_CONTRACT §terminology). Since 2026-10-14 its correction shows, under each WRONG answer, « راجع: <درس> (<السنة>) » toward an earlier year — derived from the question's `assessment.learningPointIds` through the learning net, nothing to write (`EXERCISE_CONTRACT.md` § « Earlier-year review link ») |

**Two rules the evaluation module must follow**, both learned from shipped
defects:

- **The synthesis shows the lesson's knowledge map**, through the component
  that reads the context:
  `synthese={<KnowledgeSnapshot complete variant="complete" />}`. Never
  `<CompleteView />` on its own — it takes its `items` as a prop, so rendering
  it bare produces an empty final screen, which is what nine modules did until
  2026-09-20.
- **The « أستعدّ » pattern (2026-09-30).** The textbook has ONE « أستعدّ »
  for the whole unit (p. 7, items 1–10 → lessons 1 and 8). A lesson without
  textbook items gets platform statements in the same form — « أصحيح أم خاطئ؟
  برّر إجابتك », with a justification (`why`) for each one. Both answers occur,
  and none uses the numbers of the activity that follows. They live in
  `content/textbook.js` as `PREP_ITEMS` with `source:
  addition('prerequisite_diagnostic')`; `SourceTag` labels them « عبارة
  إضافية من المنصّة » (`textbook.additionReason.<reason>`, falling back to
  « مثال تفاعلي إضافي »). The module writes its questions as **literal
  objects**, `{ ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires:
  ['qasim-jidaa'] }` (`_unit/prepDiagnostic.jsx`). Never build them with
  `PREP_ITEMS.map(…)`: the knowledge audit cannot read a mapped array, and
  then reports `W_PRIOR_NOT_DIAGNOSED` for a lesson that diagnoses everything.
  Formulas follow the RTL rules — `PGCD$(a ; b) = n$`, one island.
- **A module numbered `0` is a real module** (« أستعدّ »). Anything deciding
  "do I have a module number?" must call `isValidModuleNumber` from
  `@smarter-academy/core`, never `if (moduleNumber)` — zero is falsy, and that
  guard silently dropped module 0's progress, capping those lessons at 80 %.
  The same applies to any value where zero is legitimate: a count, an index, a
  score, a remainder.

### 4bis. The activity card — one component, every module

The card at the top of a module is `MissionBrief` (`common/components/LessonUI.jsx`),
supplied through `ContentModule`'s `brief` prop. It answers four questions, in
this visual order:

| Field | Answers | Required |
|---|---|---|
| `tag` | where does this come from? (pill, top) | no |
| `headline` + `emoji` | what are we doing? (the hook) | no |
| `title` | what idea will we discover? (the objective) | yes in practice |
| `body` | what is the concrete situation? (one or two sentences — never a list of questions the student cannot answer yet, never a rule) | yes when there is a brief |
| `footer` | on what source does it rest? (`SourceTag`) | no |
| `visual` | an optional context vignette | no |
| `tone` | the accent colour (8 available) | defaults to `slate` |

**It is data-driven, never lesson-specific.** No context is coded into the
component: football, a library or flowers arrive through `visual` and the text.
A module that supplies neither headline nor visual gets the same card, plainer
— which is why the 40 existing modules needed no change when it was redesigned
(2026-09-21).

Three rules worth knowing:

- **A lab module passes NO brief** (since 2026-10-14, §4quater): the lab's own top — its context and its ONE question
  (MANIPULATION_DNA §17.9) — is the brief. A card above it would be a second, competing start.
- **The visual is decorative and optional.** It helps the student picture the
  situation; it never carries mathematical information, so it is `aria-hidden`
  unless it has its own `alt`. Do not force one where it adds nothing.
- **It is drawn, never generated.** The card lives under `lessons/`, so the
  root `CLAUDE.md` no-raster rule applies to it as to everything else
  (`PitchScene` in `manipulations/primitives/PitchBackdrop.jsx` is the worked
  example).

### 4ter. The textbook is the REFERENCE of الكفاءات, not the script of the lesson (owner rule, 2026-10-14, binding on every generation)

The owner, on the generated 1AM lessons: « the book is the truth reference of the learning points of the lessons, not
necessarily the content itself — the platform has more capabilities of demonstrating the ideas to the student ». A lesson
that copies the book — its activity as the entry, its questions as the steps, its examples, its order — repeats a page the
student already has on the desk and wastes what only the platform can do (a lab where the hand makes the mathematics,
immediate feedback, a drawn world, a refusal).

**What the textbook decides:** WHAT is taught — the lesson's الكفاءات (with the catalogue `pointsToLearn` and the programme
items), the definitions and their wording, the notations and vocabulary the class uses, the expected answers, the boundary
with the neighbouring lessons. Every textbook element still has exactly one destination (`check:textbook`).

**What the platform designs, deliberately and ambitiously:** HOW it is learned —

1. **The entry point.** Ask « in which situation does this idea become NECESSARY for the student's hand? »
   (MANIPULATION_DNA §1–§2). Compare at least two candidates; the textbook's activity is ONE candidate, never the default.
   Reject an entry that asks questions the student can only answer from memory (that is a test, not a discovery).
2. **The order of ideas** — by what the student can discover from what they just did, not by the page order of the book.
3. **The examples and contexts** — chosen for what they make VISIBLE (a contrast, a refusal, a surprise, the student's own
   number); textbook numbers are kept where they serve, replaced where the platform's serve better.
4. **The place of each textbook element** — where it serves best. Typically: the activity becomes an APPLICATION after the
   discovery (in أتمرّن, « نشاط الكتاب ص N »), the معارف box NAMES what the student has just found, the exercises are
   practice. Move the element's `destinations.<id>.module` in `build-extraction.py` accordingly.
5. **Write the design down**, in the `lesson.config.js` header: the chosen entry, the rejected candidates and why, the order
   of ideas. A lab that is the designed entry declares `experience: { type: 'platform_context', reason:
   'platform_designed_entry' }` (`ADAPTATION_REASONS`, `packages/core/curriculum/manipulationLevels.js`).

Reference: `kitabat-adad-tabii` (1AM), redesigned 2026-10-14 — entry = the pencil workshop (the number cannot be WRITTEN
until every ten is tied); rejected = the book's نشاط 1 (0 1 3 8 / 25 and 52 / 999, answered from memory), now posed in
أتمرّن; order: ten-for-one → position value (the two 7s of the student's own 2577) → the 0 that keeps a place → reading by
classes (the dictation lab opens معارف) → rank table → مفكوك → رقم / عدد (banknotes).

### 4ter-bis. INDEPENDENCE FROM THE BOOK — the platform is self-sufficient (owner rule, 2026-10-15, CRITICAL, binding on every generation)

The student never needs the textbook and is never sent to it. **Read the textbook → analyse it → get the idea → generate your OWN content.**

- **Never** write a student-visible string that points to the book: « الكتاب ص 55 », « اقرأ ما يقوله الكتاب », « نشاط الكتاب », « تمارين من الكتاب »,
  « أرغفة الكتاب », « استحضر مكتسباتي — ص 52 ». Module `brief` tags are the platform's own words (« معارف », « أستعدّ », « أتمرّن »).
  Safety net (2026-11-11): `MissionBrief` strips any « الكتاب ص … » / « ص N » left in a tag (`common/textbook/bookRef.js › withoutBookRef`) — it
  does not excuse writing one, and it does not touch titles, subtitles, objectives, `desc` or bodies: those are reworded by hand.
- **Never** copy the book's boxes (تعريف · خاصية · ملاحظة · مثال · طريقة) or exercises to the student verbatim. Re-write each definition, remark and
  example in the platform's own sentences, with the platform's own contexts and numbers (same mathematical content, same notation, same
  rigour — different words). The extraction stays the REFERENCE of WHAT is taught (الكفاءات, notations, expected answers), never of HOW it is said.
- A book activity/exercise is **analysed, then redesigned**: new context, new numbers (checked by computation), same competence. The book's text
  may survive in `content/textbook.js` only as the authors' reference data; it must not reach the screen as-is.
- `SourceTag` is **muted for students** (`reveal` is for author / teacher tooling only): no « الكتاب المدرسي — ص 57 — تمرين 1 » badge. The `source`
  objects stay in the content files for traceability (`check:textbook`).
- A lab's wording is the platform's too (e.g. `fair-share` speaks of cakes — « كعكات » — not of the book's loaves).
- Retrofit: lessons generated before this date may still carry book-derived boxes, exercises and tags; each is rewritten when its lesson is next touched
  (`hasil-qisma-kasr` modules 0, 2 and 4 were cleaned on 2026-10-15; its book-derived exercises in `content/exercises.js` remain to be redesigned).

### 4quater. One module = one track: act first, answer about what you did, then name it (owner rule, 2026-10-14)

The page of a module reads top to bottom as ONE path. Two parallel tracks — a card of questions on top, then a lab with its
own question, then steps that answer the card — leave the student asking « where do I start? ». The order is always:

1. **Act.** The top of the module is the student's ACTION: the lab (its context + ONE question, DNA §17.9), or — in a module
   without a lab — the first question to try. Never above it: a textbook statement, a card listing questions, a definition, a
   `ManipulationWorkspace` `title` / `lead` repeating what the lab already says (pass neither; the level selector stays).
2. **Answer about what you did.** Each step's question is about what the student just DID or SAW, in their own numbers
   (« في لوحتك 2577 يظهر الرقم 7 مرّتين… »), and can be answered from that experience. A short evidence line recalls the
   trial (`onTrial` → `[data-activity-evidence]`) and, if the student skipped it, says where to go — it never blocks.
   A step never re-poses a textbook question the lab did not prepare.
   **Prototype (2026-10-28, `maqlub-qismat-kasrayn` module 1, lab `gear-crank`):** the questions about each lab step are
   asked INSIDE the lab, over it, right after the step (`LabCheckpoint`, MANIPULATION_CONTRACT §8quinquies): blocking the
   next task, guided by two hints before the answer, the step redoable. The module steps below then hold the TRACE of the
   answers (done on the lab's `checkpoint-done` event) and the names (bricks), not the same questions again. They are
   MANDATORY for every student; only a teacher can switch a lab's questions off, for his own account (`useLabCheckpointSettings`,
   « أسئلة المناولة » in the lab header) — the lab then opens its discovery below itself.
3. **Name it.** Then the brick (with « أتوقّع القاعدة » first, §14.3ter) and the textbook's box that NAMES what was found —
   after the answer, never before the question (`معارف`: question → box → brick).

`brief` is optional: a lab module passes none; a practice module (أتمرّن, أتعمّق) may keep one that says what the module is
(« ستة تمارين من الكتاب… »), never a rule or a fact the module asks for. Step titles are questions (§5 « Discovery pass »).
A lab's own onboarding (« what do I press now? ») is `LabCoach` — **mandatory for every manipulation** (owner, 2026-10-14;
MANIPULATION_CONTRACT §8quater, DNA §17.11), validated on `kitabat-adad-tabii`; a new or modified lab without it is not done.
Reference: `kitabat-adad-tabii` modules 1–3 (2026-10-14). The owner validated this reference the same day: it applies to every NEW lesson
now and to the existing ones by the retrofit in [`../reports/LESSON_METHOD_RETROFIT.md`](../reports/LESSON_METHOD_RETROFIT.md).

### 4quinquies. The redesign checklist — what was done to `kitabat-adad-tabii` (2026-10-14; follow it for a new lesson and for a retrofit)

1. **Design the entry first** (§4ter): candidates compared, the choice and the rejected ones written in the `lesson.config.js` header.
2. **Module 1**: no `brief`, no `ManipulationWorkspace` `title` / `lead`; the lab (both levels) in `intro`; `moduleSubtitle` never repeats the
   lab's question; steps = questions on the student's OWN lab numbers (« في لوحتك 2577 يظهر الرقم 7 مرّتين… »), each preceded by an
   evidence line from `onTrial` (`[data-activity-evidence]`, never blocking) and followed by its brick.
3. **Bricks after the answer**: `{q1 && <KnowledgeBrick …/>}` and the textbook box that NAMES the idea after the question — a brick or
   box visible before the answer gives it away. Re-check `audit:knowledge:gate` (`E_REQUIRES_ESTABLISHED_LATER` ⇒ drop that question's `requires`).
4. **No question that repeats the lab's own prediction** (module 3 asked « كم ورقة؟ » right after the lab did): ask WHY / the next idea instead.
5. **Module 2 (معارف)** opens on a lab (the dictation, posed alone with `levels={false}`) or its first question; definitions come after.
6. **The book's activity** becomes an application: an `EXERCISES` entry (`id: 'act-1'`, `TextbookExercise`) in أتمرّن, its
   `destinations.<id>.module` moved in `docs/sources/<g>/unit<N>/build-extraction.py`, `extraction.json` rebuilt, the content test extended;
   knowledge items / map nodes that quoted the book's numbers now quote the student's own (`WORKSHOP`-style data in `content/textbook.js`,
   `addition('platform_designed_entry')`, lab resource `experience.reason: 'platform_designed_entry'`).
7. **A top card on a non-lab module** says what the module is, never states a fact the module asks for.
8. **Every lab** carries the onboarding (`LabCoach`, MANIPULATION_CONTRACT §8quater) — default on. Shell-based labs wire it through the shell's `coach` prop (§8quater « Wiring for labs built on `ManipulationShell` »); never point at the answer the student must find.
9. **e2e + tests**: assertions « no `[data-module-brief]` above the lab », « the brick is hidden before the answer » (see
   `e2e/lesson-kit/1am-adad-tabiiya-ashriya.mjs`), the coach script `e2e/lesson-kit/lab-coach.mjs`, the retrofit check `e2e/lesson-kit/moyen-retrofit-phase1.mjs` (no `[data-module-brief]` above the lab, lab before the first question, bricks absent before their answer, coach step id — copy a block per new lesson); a step question asks WHY or about the student's own trial, never « which calculation » when the lab already asked it (phase-1 retrofit, 2026-10-15); `check:lessons`, `check:textbook`,
   web tests from `apps/web`; entry budget unchanged.

### 4sexies. The student « focus » view — `studentView: 'focus'` (owner pilot, 2026-11-03, lesson `qasim-adad-tabii`)

Gen Alpha does not read long text and must not see everything at once. A lesson that sets `studentView: 'focus'` in
`lesson.config.js` shows the STUDENT what they need now; everything else is one tap away (« المزيد »).

**Reduce what shows at once, never delete** (owner, 2026-11-04): every piece of content that focus takes off the screen must stay
reachable by the student, through a fold, a switch, or the step it belongs to once reached. Removing a line, a chip, a title or a
subtitle for the student is not allowed. Do not edit the lesson's text either: the teacher view must stay identical. The teacher (any
`freeNavigation` viewer) and Classroom Mode never change: the switch is `isStudentFocus()` in
`lessons/common/components/StudentFocus.jsx`. **Pilot status:** only `qasim-adad-tabii` has the flag. The owner compares, then the
flag is rolled out lesson by lesson (checklist below).

What focus changes. Every change lives in a shared component, so a lesson writes no extra code:

| Where | Student in focus |
| --- | --- |
| Lesson home (`LessonIndex`) | Title, progress and ONE « واصل: <module> » button. The « مجال • محاور • مدة » chip, the skills, الكفاءات, prerequisites and labs list go in one « تفاصيل الدرس » fold. Module descriptions show on « عرض الوصف ». The lesson-problem card shows its title + drawing, and the statement goes behind « اقرأ المسألة ». |
| Module header (`ModuleLayout`) | The H1, then « المزيد » holding the ⏱ chip and the `moduleSubtitle`. |
| Steps (`ContentModule`) | **One step on screen.** An answered step stays open (its feedback is read) with « التالي ». Steps the student has moved past collapse to a ✓ line (« إظهار » reopens them). Later steps sit in « الأسئلة القادمة (n) » (titles, locked until reached) next to « السؤال n من N ». The streak and sound row stays. The `brief` body folds unless `brief.keepBody`. |
| Lab (`ManipulationShell`) | Unchanged. |
| `KnowledgeBrick` | Title, summary and visual. The body + try-it go behind « المزيد ». |
| `TapQuestion`, `TextbookExercise` | A right answer shows « صحيح », with the explanation behind « لماذا؟ ». A wrong answer keeps its correction open. « خطأ شائع » folds. |
| `MemoCard` | Each tile shows title + hook + rule. مثال / فخّ / في الامتحان fold, and « تعرفه من قبل » folds. |
| `GuidedProblem` | The statement stays open (`keepBody`). The list of all part questions folds into « كل الأسئلة ». Locked sub-steps (with their instruction) fold into « الخطوات القادمة (n) ». |
| Module 0 (`PrerequisiteDiagnostic`, `ReviewLinks`) | The advice line and the programme texts of each review link fold. |

**`MoreToggle` is THE disclosure for lesson content** (`StudentFocus.jsx`): use it, never a local `<details>`.
- In focus it is a « المزيد ▾ » button, and the content stays mounted under `hidden` (React state and `data-*` survive).
- Out of focus it renders its children inline and nothing else. Wrapping content is therefore a no-op for the lessons without the flag.
- **In the mission player there is NO « المزيد »** (owner, 2026-11-04: « since the content is divided in slides, no need for the read
  more »): `MoreToggle` renders its children inline there (`InMissionPlayerContext`), and the paging gives each block its own screen.
  - The module header shows the title, then ONE small line « ⏱ <time> · <subtitle> » (`data-mission-subtitle`).
  - The locked « الخطوات القادمة » of a « مسألة » are not listed: each sub-step arrives on its own screen when it unlocks.
  - Focus outside the player (`studentView: 'focus'`) keeps its « المزيد » buttons.
- Put any separator INSIDE the toggle (`<> — {explain}</>`), so the non-focus rendering is byte-identical.

Inside a component tree, read the switch with `useStudentFocus()`; `ModuleLayout` and `LessonIndex` provide it. A component that
renders steps OUTSIDE that provider (`ContentModule`, `GuidedProblem`, which build their steps above `ModuleLayout`) uses
`useStudentFocusFor(ctx.studentView)`. `MODULE_CTX.studentView` is copied from the config by `unit/buildModuleContext.js`.

**The lesson's own text in focus** (done in `qasim-adad-tabii`): the text is NOT rewritten. An evidence list
(`data-activity-evidence`) where nothing has been tried yet is wrapped in `<MoreToggle force={anyTried ? false : undefined} label="تجاربي">`.
It folds while empty and opens by itself (inline) after the first try. The to-do paragraph stays visible: it is the instruction
the student needs now.

**Roll out to another lesson:**
1. Add `studentView: 'focus'`.
2. Wrap that lesson's empty evidence lists as above. Remove nothing.
3. Run `check:lessons`, `lab-rollout-status.mjs --lesson <id>` and the web tests.
4. Capture the student view (fresh progress per module) and the teacher view, and check the teacher view is unchanged.

Before / after numbers of the pilot: `docs/reports/STUDENT_FOCUS_VIEW_2026-11-03.md`.

### 4septies. The mission mode — `studentView: 'mission'` (owner pilot, 2026-11-04, lesson `qasim-adad-tabii`; stage 1 of 3)

> The pilot's mission player was deleted on 2026-11-18 with its module pages (the lesson is v2 — see the note at §9); the
> mission mode itself still serves 29 lessons: read it on one of them (e.g. `qasim-mushtarak-akbar`).

The lesson becomes a JOURNEY toward its « مسألة الدرس ». The student opens the lesson on the mission, collects the lesson's
ideas as « tools », answers a short mission question between modules, and wins the mission in its مسألة module. Mission mode
IMPLIES the focus view (§4sexies). The teacher (`freeNavigation`) and Classroom Mode see no change (`isMissionView`).
Plan, decisions and stages: `docs/reports/MISSION_PLAYER_PLAN_2026-11-04.md`. **Rolling the whole prototype out to other lessons
(the owner validated the pilot on 2026-11-08 — it is now BINDING):** `docs/reports/PILOT_PROTOTYPE_ROLLOUT_PLAN_2026-11-08.md` — old vs new, shared vs per-lesson work,
the conversion checklist, verification, traps and open items.

**Never build it on Classroom Mode.** Presenting unlocks every step and module, stops writing module completion, and turns
graded tests into the teacher's reveal-one-answer flow. The mission is a layer on the student's normal pages:
progress, sequential unlock and evidence are the lesson's own.

**The data** (`LESSON_CONFIG.mission`, literals):
```js
mission: {
  title: 'مكتبة 756 كتابًا',
  opening: { text: '<one sentence: the situation + the question>', cta: '<an honest « I can't yet » button>' },
  tools: [{ id: '<knowledge.jsx item id>', icon: '🔑', label: '<2–3 words>' }],   // earned when that brick is established
  climaxModule: 4,                                                              // the مسألة that IS the mission
  checkpoints: [{ id, afterModule, prompt, options, correct, explain }],        // asked on ARRIVAL at afterModule + 1
}
```

**What the student sees** (`lessons/common/mission/`):

| Piece | Where | Behaviour |
| --- | --- | --- |
| `MissionHome` | the lesson page (from `LessonIndex`) | Redesigned 2026-11-09 (owner: clearer, more attractive, more motivating). **First visit and « شاهد البداية » — the hook, built ON the home card (owner, 2026-11-11, binding for every lesson):** the SAME card as the return home (same `[data-mission-hero]` grid and classes, the same header `HomeHeader` — tag, title, ring — and the same tool chips `ToolChips`), so the CTA (`mission.opening.cta`, « لا أعرف بعد… » / « أجرّب ») sits on the SAME pixel as the home's « ابدأ : … » / « واصل : … » and the card has the same width; under the CTA, where the home has « التمارين », the facts (≈ duration from `estimatedDurationMin`, « في جلستين », « ستجمع في الطريق: » / « مفاتيحك معك: » + the number of tools, 🏆 the big problem); in the scene column the question as the character's SPEECH BUBBLE above the drawn scene (its numbers in amber chips); then « قبل أن تبدأ » as ONE slim line (`ReviseFirst variant="slim"`). « شاهد البداية » does NOT refit the player and must NOT change its zoom: `MissionHome` measures the home's natural height on click and gives the opening exactly that height; the scene takes the leftover room under the bubble (`[data-mission-opening-scene]`, `h-full`), so a long statement shrinks the DRAWING, never the screen. Check for every converted lesson: `node apps/web/e2e/mission-opening-align.mjs` (home vs « شاهد البداية » — same zoom, same card width, same button pixel, no overflow; 1366×768, 1024×768, 1920×1080). Keep it that way: never add a block above the CTA in the text column (it would move the button), and the header's tag line has a fixed 36 px height so the ⭐ badge never shifts the title. **Return — short so the player ENLARGES it (v2, 2026-11-09, owner: no separate « التالي » card, no zooming):** ONE wide hero card (`[data-mission-hero]`: the scene, the title, ⭐ stars, a RING of the tools earned, the tool chips, ONE big « واصل: <station> » / « ابدأ », and « 📝 التمارين » → `practiceHubPath` when practice is active, `[data-mission-practice]`); then « مسار المهمة » with « ✓ k من N »; then « قبل أن تبدأ » (`ReviseFirst variant="slim"`) and the two small links on one row (`[data-mission-home-foot]`). Keep it this short: any added block makes `FitToArea` shrink the home again. **Where the main button sits (owner, 2026-11-09):** the text and its « واصل » / « ابدأ » are in the RIGHT column (reading start) and the scene on the left, and the first visit's CTA is aligned right too — the same zone as « واصل الدرس » on the unit page, so the student clicks, then clicks again without crossing the screen. The player's bottom bar is NOT concerned: it keeps the RTL convention, « واصل » (next) on the LEFT and « السابق » on the right (owner, same day). « تفاصيل الدرس » opens a dialog with the description, the skills and the prerequisite lessons. |
| `UnitMissionView` | the UNIT page `/courses/…/units/:unitId`, STUDENT view of a converted unit (`pages/unit/`) | Owner, 2026-11-09 (mockup `docs/experiments/unit-home-mockup-2026-11-09.html` approved, then a centred window decided by the council). ONE screen, no scroll: « درسك الآن » (`[data-unit-now]`: the first open lesson not finished, its mission name and tools from its config, its progress, ONE big « واصل الدرس » / « ابدأ الدرس » / « ابدأ الوحدة », and « ما في الدرس؟ »); the unit challenge REWRITTEN by the platform with its 5 « مفاتيح الحلّ » lit as their lessons are finished (`[data-unit-keys]`); « طريق الوحدة », one station per lesson and the synthesis (✓ + stars, « أنت هنا », ⏱), then 🏁; four chips (goals, full challenge, history, « راجع قبل الوحدة »). Every detail of the old page is FOLDED into one centred window (`MissionDialog card`, 760 px, title centred): one info line, 3 goals (formulas isolated LTR, `Bidi`), « المزيد » for the rest (goals, tools, prerequisites side by side), an UNMET in-unit prerequisite shown up front (« راجع أولًا » + « افتحه », which swaps the window), one big button. The page is drawn ≥ 1000 px wide then scaled (×0.72–×1.6, `useFitZoom`): wider when the height limits (no empty sides), narrower down to 720 px when the width limits, and the « درسك الآن » picture leaves below 860 px. A unit switches when its content is written in `pages/unit/unitMissions.js` (icons, short labels, challenge, keys, history — `unitMissions.test.js`: every lesson covered, keys point to real lessons, no textbook line) — owner rule: each time a unit's lessons are converted, its page is updated too. The teacher keeps the detailed page. No-scroll check: `node apps/web/e2e/unit-mission-view.mjs` (4 sizes, sidebar open and collapsed, every window folded and unfolded; it loops over EVERY unit of `UNIT_MISSIONS`, whose `icons` keys must follow the catalogue order — lessons, then the synthesis). Units with this page: 1 (2026-11-09), 2 « الحساب على الجذور » (2026-11-10), 9, 3 and 4 (2026-11-10/11), 5 « جمل معادلتين » (2026-11-12). The challenge never writes its own answer. The lesson window shows the catalogue's free-text `prerequisites` only when the lesson names no prerequisite LESSON (`prerequisiteLessonCodes` empty): both together made the window scroll at 1366 / 1024 (units 4, 5). |
| `MissionLayer` | top of every module (from `ModuleLayout`) | The `MissionBar` (mission title opens the full statement, the 4 tools, « n من N », « الخريطة »), the map dialog, and the checkpoint dialog on arrival. |
| `MissionMap` | home + dialog | One station per module, with the REAL lock (`moduleGate.resolveModuleStatus`, same as the lesson page). The climax keeps a 🏆; stations after it are « مستوى إضافي ». |
| `MissionCheckpoint` | dialog, on arrival | One `TapQuestion` that brings the mission closer with the tool just earned, WITHOUT answering any question of the مسألة. Formative: no XP, no evidence. « لاحقًا » skips it, and it is never asked twice. |
| `LibraryScene` | everywhere | An SVG drawn in code. `fill` = earned tools / all tools, so the shelves fill as the student learns. |

**Rules:**
- A checkpoint must not solve the climax: it applies the newly earned tool to the mission in general (the remainder must be 0,
  `756 = b × q` means `b` divides…), never computes `756 ÷ 32` or `756 ÷ 36`.
- State is per student in `scopedStorage` (`smarter_mission_<lessonId>`: `opened`, `answered`). It is not progress.
- Nothing is deleted: the full lesson page, the full statement and the lesson's practice stay one tap away (§4sexies rule).

**Stage 2 — the player, NO SCROLLING (done 2026-11-04).** The owner's rule is « no scrolling in any part of the lesson-game ».
`MissionPlayer` is a full window drawn in CSS: it is portalled to `<body>`, at `z-[35]` so « كرّاسي / بطاقاتي » stay on top,
and the workspace sidebar is hidden. The browser full screen is an optional button.

Layout:
- **Top:** the mission bar, « الصوت » and ✕. ✕ leads back to the mission (or to the lessons list from the mission home).
- **Middle:** the content.
- **Bottom:** « السابق » · dots (and « صفحة n من m ») · « واصل ». At the last unit, « واصل » becomes « المحطة التالية » or
  « إنهاء », and the module's OWN `handleNextClick` / `commitCompletion` writes completion.

How the screens stay scroll-free:
- `ContentModule` plays ONE unit at a time (brief → lab → each step → memo), with the classroom unit machinery but the
  student's locks: « واصل » leaves a step only when it is done. It declares its navigation with `useDeclareUnitNav`
  (`mission/missionPlayerContext.js`).
- A unit taller than the window is split into pages by `ClassroomPaged` through `PagingContext` (`deepBlocks`; see
  `CLASSROOM_MODE.md` « Paging outside Classroom Mode »).
- Pages without units (أستعدّ, the final test) are paged by the player itself.
- `GuidedProblem` gives each sub-step its own block.
- `FitToArea` FITS every screen to the area (CSS `zoom`):
  - it ENLARGES short content up to `MAX_GROW = 1.9` (a lab up to 1.3), aiming at 92 % of the height, and centres it vertically
    (owner: « make the questions bigger, use the space »); text screens lay out in a 1100 px reading column before enlarging,
    labs use the full width;
  - it shrinks what does not fit, never below `MIN_FIT = 0.6`. Below that the area scrolls and
  carries `data-fit-overflow` (a last resort that tests detect).

Labs in the player:
- they get `ManipulationImmersiveContext = true` and no second full screen (`useInMissionPlayer`);
- the lab unit has no title row (DNA §17.9);
- **the GAME LAYOUT** (`ManipulationShell`, area ≥ 900 px wide): the instructions, controls and result in a right-hand column
  (18–26 rem), the SCENE across the rest of the width (`data-manipulation-game-layout`). Every shell-based lab gets it, with no
  code of its own;
- a lab can size its scene from the area: `useMissionArea()` gives `{ width, height }`. `TeamBuilder` sizes its pitch from the
  height (2:3 kept, 150–360 px wide).

**The student never reaches the old version** (owner, 2026-11-04):
- the lesson page is ALWAYS `MissionHome` for a student (no `?view=details`);
- a locked module redirects to the mission instead of the old « مقفل » page;
- every module opens in the player.

What only the old page had is in the mission: the details dialog and the practice entry. The teacher keeps the normal pages.

Motion:
- each unit or page slides in for 260 ms (CSS, replays when `hidden` is removed);
- « واصل » pulses when the step is done;
- a tool earned under the student's eyes flies into its slot (framer-motion, 1.1 s); with reduced motion it only glows;
- the first arrival at a station shows « أنت هنا » with the map for 2 s (a tap skips it, never twice, never over a
  checkpoint).

**One item per screen** (owner, 2026-11-04: « the content must never be small because of the quantity »). The player pages with
`onePerPage` (`classroomPages.planOnePerPage`):
- each substantial block (≥ `SMALL_BLOCK` = 90 px) has its own screen, and small blocks (a heading, a counter) ride with the
  next item;
- a LIST (≥ 2 children ≥ 110 px: the 6 questions of أستعدّ, the cards of a memo) is opened into its items;
- a replaced content (a test submitted: questions → result) is re-split from page 1 (`onRestructure`).
- a block REVEALED by an answer (the next sub-step of a « مسألة ») gets its own screen after the current one: answering never
  shrinks the screen the student is on (`ClassroomPaged`, MutationObserver).
- a decoration (`aria-hidden`, an absolute/fixed layer) is never an item, so no screen is ever empty (`isDecor`).

So أستعدّ shows its questions ONE BY ONE and its correction one by one. In the player it also has no per-skill progress cards
(owner: « no need »; the result reports the skills).

`FitToArea` is DAMPED: it grows only by a real step (`GROW_STEP` = 0.1). A zoom revisited within the last changes (a 1.17 ↔ 1.09
reflow loop) settles on the smaller one.

**One size for the whole lesson** (owner, 2026-11-04: « the consistency of the size of similar elements across the lesson is not
negotiable »). Outside labs, the player's zoom depends on the SCREEN only, never on a screen's content: `uniformZoom(width, height)`
(`FitToArea.jsx`: a 1100 px reading column, a 560 px reference height, between 1 and 1.6, in steps of 0.05). `MissionPlayer` passes
it as `fixedZoom` to `FitToArea` and as `userScale` to the paging, so pages are cut AT that size. Only a single block too tall for a
screen shrinks (last resort). Labs keep filling their space (`LAB_MAX_GROW`). Lay a big screen out in columns rather than let it
shrink: the opening screen of a « مسألة » is two columns in the player (text and questions | support). Measured on the pilot lesson:
64/64 screens at the same size at 1854×930, 62/64 at 1366×768 (two at 0.98).

**A settled screen never moves** (owner, 2026-11-04: « new content on the same slide changes the position and font size of what is
already there »). `FitToArea` takes a `screenKey` (module path + unit + page) from `MissionPlayer`:
- a NEW screen fits and centres itself, then settles after `SETTLE_MS` (700 ms; `data-fit-settled`);
- on a settled screen, what is already there keeps its place and its size (`keepInPlace`). New content takes the free space below.
  If it does not fit, the screen slides up just enough (animated, 300 ms; the moment a screen SETTLES is never animated, or every
  screen would appear twice: its entry, then a jump and a glide). Only if it still does not fit does it shrink, as little
  as possible. It never grows;
- in the player the streak chip « متتالية » lies OVER the screen (top corner), never above the content.
- **exception — an intended layout change re-fits once:** a component inside the player can call `useFitRefit()` (from
  `mission/missionPlayerContext.js`, provided by `FitToArea`) when its layout really changes; the lab shell calls it when its
  mission goes from big to compact. A settled screen whose content shrinks under 70 % of the height also re-fits once
  (`shrunkALot`). Small changes still move nothing.

**Revise first, return in one click** (owner, 2026-11-07):
- the FIRST view of a mission lesson (the opening scene, then the game home) shows « 🧭 راجع قبل أن تنطلق »: one card per
  prerequisite lesson of the catalogue (`prerequisiteLessonCodes`, often an earlier year), « راجع ← » when the lesson is
  `available`, « قيد الإعداد » otherwise (`mission/ReviseFirst.jsx`);
- opening one remembers where the student came from (sessionStorage `smarter_return_to`, `mission/returnToLesson.js`). Every page of
  ANY lesson then shows « ↩ العودة إلى درس: <title> » at the bottom (`mission/ReturnToLessonButton.jsx`, mounted once in
  `LessonPageFrame`) until the student is back in the starting lesson (by the button or otherwise), or closes it with ×.

**« أستعدّ » in the player** (owner, 2026-11-07):
- no intro card: on arrival a window says « أنجز هاته الأسئلة السريعة لتختبر معارفك السابقة التي ستحتاجها في هذا الدرس », with a
  bar at its top emptying in 5 s (`mission/TimedNotice.jsx`, `diagnostic.playIntro`); « ابدأ الآن » or a click beside it closes
  it earlier. Then the first question is the first screen;
- the « أنت هنا » welcome is skipped on a `prerequisite_check` station: never two windows at once;
- each answer brings the next question by itself after 0.6 s (`useAutoAdvance` + `MissionAdvanceContext`, which `MissionPlayer`
  provides as its « next » action, null on the last screen). Changing an answer already given does not jump;
- after the LAST answer the result shows by itself (0.7 s): no « عرض نتيجتي » in the player (the page keeps its button);
- the review is ONE screen (owner, 2026-11-07, « simpler than السابق / واصل »; it was 10): `DiagnosticReviewCompact`, two columns —
  the score, ONE circle per question (✓ green / ✗ red; a tap opens that correction in a window with « السؤال السابق / التالي »),
  the الكفاءات as two chips, the advice | the lessons to revise (`ReviseFirst columns={1}`), « 🚀 continue » and « إعادة التشخيص ».
  The page and the teacher keep the full list of corrections;
- `data-paging-keep` marks a screen DESIGNED to hold as one: the player's paging neither walks into it nor opens it into its
  children (`ClassroomPaged`); if it is too tall, the size fitting handles it (last resort);
- **a drawing is never split** (owner's screenshot, 2026-11-11): the pager's « one element per screen » used to open an `<svg>` into its
  strokes — unit 9's Thales figure showed the lone segment [AM] on « صفحة 1 من 3 ». `ClassroomPaged › isAtomic` now treats `<svg>` and
  everything in it, `<figure>`, `<img>`, `<canvas>`, `<table>` and `data-paging-keep` as ONE element (tested in `classroomDecor.test.js`);
- **NO BACK-AND-FORTH — BINDING for every lesson, existing and new** (owner, 2026-11-11): everything a question asks the student to LOOK AT
  is on the question's screen — the figure, the table, the numbers of the statement, the rule it applies, the student's own earlier result. The
  student never goes back a screen to read something and forward again to answer. How:
  1. *a figure followed by its question*: automatic (below) — do not put a long card or more than two short lines between them;
  2. *a later sub-question of the same statement* (part 2 appears after part 1 is answered, and the pager gives it its own screen): draw the
     figure again beside it — figures are data, `<GeoFigure {...FIG} maxWidth={180} />` costs nothing — or keep the sub-questions in ONE
     block with the figure (`data-paging-keep`) when they fit;
  3. *statement data or a table on one screen, the question on the next*: one `data-paging-keep` row (data beside the question), or the needed
     numbers repeated in the question's prompt in one short line;
  4. *a question about what the student did before* (a lab round, an earlier answer): its result line on the question's screen (the `wonLine`
     pattern of `talis-hisab-atwal`).
  Two of these are SHARED and automatic (2026-11-11): a « مسألة » sub-step carries « المعطيات » and « ما وجدته » beside it (« A « مسألة » in the
  player » below), and a `TextbookExercise` card that has a statement, a `context`, `items` or a figure is ONE screen in the player
  (`data-paging-keep`; with a figure, the statement and its figure — at most 210 px high — sit beside the question, `[data-textbook-side]`)
  — the pager used to put « 1) … 2) … 3) اكتب الكسر 1005/315 » on one screen and « 3) الشكل غير القابل للاختزال: » alone on the next. Exception:
  a grid of rows (`batch`, `trueFalse`) without `context`/`items` is not kept whole (its rows are already one block, and `pairFigures` puts
  the figure before it beside the statement and the rows; kept whole, « أربعة أشكال » fell under the minimum zoom). When EACH row speaks of its own
  figure (« الشكل (1) … الشكل (4) »), pass `rowAside={(k) => <GeoFigure … />}` to `TextbookExercise` (→ `BatchChoiceQuestion`): each row and its
  figure are ONE screen (`data-batch-row-aside`, `data-paging-keep`) — one screen per figure, and the grid's saved-answer key is unchanged
  (`talis-hisab-atwal` m4 ex 3). The PARTS of an exercise
  (`ex-21-1`, `ex-21-2`…) are separate exercises and only the first has the statement: a lesson's `partsOf` wraps its parts in
  `withContext` (`common/textbook/exerciseParts.js`, imported by path), which gives each later part `context` = the first part's statement,
  shown on its card in the player only (`[data-exercise-context]`). A lesson only writes cases 2–4 by hand when its question is NOT one of
  these (its own JSX): a figure drawn again beside the question with `PlayerSwitch` (`inshaat-talis` m2 step 2, `talis-hisab-atwal` m2 step 3;
  when the PAGE lacks the figure too, the same row on both — `aksiya-talis` m2 step 2), a row of figures kept as one reading screen (`talis-hisab-atwal` m2 step 1, `aksiya-talis` m2 step 1).
  The scan presses « لاحقًا » on the « محطة المهمة » checkpoint (it does not close with Escape: before 2026-11-11 the scan stopped there and
  never read most modules).
  Player only (`PlayerSwitch` / `useInMissionPlayer()`); the page and the teacher are unchanged. Check: `node apps/web/e2e/no-back-and-forth.mjs
  <lesson ids>` (every screen at 1366 and 1024: `LONE` = a figure with nothing to answer, `OVER` = overflow or scroll, `PAIR` captures to look
  at) AND a walk that ANSWERS each question (the scan presses « واصل » only: sub-questions that appear after an answer are seen by hand).
  A `LONE` screen left on purpose (a reading screen) is justified in the lesson's section of `MISSION_ROLLOUT_PROGRESS.md`. The lessons
  converted before the rule are brought to it with `docs/reports/NO_BACK_AND_FORTH_PROMPT.md`.
- **a figure and its question share ONE screen, side by side** (owner, 2026-11-11: « the student sees the figure on one screen, the question on
  the next, and has to go back to look at the figure »). Automatic in the player (`ClassroomPaged › pairFigures`, « one element per screen »
  only — Classroom Mode and the page are unchanged): a block that SHOWS one or more figures and asks nothing (a figure, a row of figures, a
  statement card holding its figure), then at most two short lines (≤ 300 characters, no figure), then a block that ASKS something (buttons,
  inputs; no figure of its own; not a lab) become one screen. `data-paging-pair` places them (`mission/mission.css`): `figure` (42 %, at most
  440 px) or `statement` (50 %) floats at the start of the line, the lines and the question (`side`, `question` — lifted to the figure's
  sibling when the question sits deeper, e.g. inside a تمرين card) take the rest, and the container holds the float (`display: flow-root`).
  Nothing to write in a lesson; a figure followed by a long card or by a lab stays alone. Check with a scan of every screen: no visible
  figure on a screen with nothing to answer, unless it is a knowledge card;
- **from a scene to a figure — show it in the lab, check it outside** (council of 2026-11-11, unit 9 lesson 1; PROVISIONAL until a real student
  is timed; decide unit by unit, only where the lab has a real scene — vectors and solids already work on the figure). The change of picture
  happens INSIDE the lab, on the drawing the student's hand placed: the décor fades, the named lines are drawn on the objects, then the lab's
  column asks which lines are parallel (tiles of the four named lines) and WHY with a reason that holds without ground or « upright » (two
  perpendiculars to one line); the parallel marks appear only after the right pair (they would give it away), and a « أرني الساحة / أرني
  الشكل » toggle lets the student look back (`shadow-meet › chains: 'readFigure'`, `Scene figure parallel`). The hypothesis comes BEFORE the
  equality it supports (read → figure → ratio → rule). The module step after the round then checks the TRANSFER on a figure that does not
  look like the lab (rotated, tilted parallels, other letters, bare-letter options: « which point plays the role of O? ») — never the same
  figure, never options that describe the answer;
- **sounds when answering** (owner, 2026-11-07; silent until the student turns « الصوت » on, `playSfx`): a TEST that corrects nothing
  before its result (« أستعدّ », the final test `BossFinal`) plays a NEUTRAL « pop » per answer and the « step » chime when the result
  comes; a right/wrong sound there would give the answer away. `InfoSorter` plays correct / wrong at « تحقّق » unless its parent passes
  `onCheck` (then the parent's sound, never two). The kit questions (`TapQuestion`, `BatchChoiceQuestion`, `NumericQuestion`) and
  the lab checkpoints already react with sound;
- `PrerequisiteDiagnostic` decides « in the player? » ITSELF (`isMissionView`), like `ContentModule`: it renders the player further
  down, so `useInMissionPlayer()` is always false at its level.

**« أستعدّ » v2 — BINDING since 2026-11-08 (owner validated the prototype `qasim-adad-tabii`)**: every change made on the pilot is the rule for
later updates and new lessons; roll it out lesson by lesson (`docs/reports/MISSION_ROLLOUT_PROGRESS.md`):
- **10 questions, from VERY easy to harder** (« شعور النشوة والذكاء »): the lesson's own ladder `content/prep.js › PREP_LADDER`
  (written by the platform, `addition('prerequisite_diagnostic')`; the textbook's items stay in `textbook.js` as source). The
  skills ALTERNATE, each climbing on its own; levels never go down; the first three are near-certain wins; at least one answer of
  each value (true/false). `content/prep.test.js` checks every division and divisibility claim. The unit test accepts a lesson
  ladder in place of the textbook items.
- **A signal on each question, never the answer** (council of 2026-11-07, owner's choice « signal only »):
  `kit/DiagnosticPlayQuestion.jsx` in the player —
  1. « 🤔 غير متأكّد » can be ticked BEFORE answering (optional; « sure » by default);
  2. a tap chooses, then a 1 s bar with « ↶ غيّر إجابتي » (a slip does not count); tapping another choice restarts it;
  3. the answer is COMMITTED and the question LOCKED (first answer only), then « ✓ أحسنت! » (green, `correct` sound) or
     « ↻ سنعود إليه في النهاية » (amber, `pop`) — never « خطأ », never the correct answer: showing it would spoil the
     diagnosis of the next questions of the same skill;
  4. the next question comes by itself (`SIGNAL_MS` + 200 ms); after the last one, the result.
  **The question never moves** (owner, 2026-11-09; « أستعدّ » AND « إختبار أولي », both render `kit/DiagnosticPlayQuestion.jsx`): nothing that
  appears after the tap changes the card's height — « 🤔 غير متأكّد » keeps its place (invisible once committed), the « غيّر إجابتي » bar
  lives in a fixed-height row that is always there (`[data-play-undo-row]`), and the signal is a STAMP laid OVER the card
  (`[data-play-signal-layer]`, absolute, `.sa-play-signal` pop-in, none under reduced motion), never an extra line under the options.
- **The review knows doubt and points to ONE lesson**: a right-but-unsure answer is « ✓؟ » (amber) and its skill is « to
  reinforce »; the weakest skill (an unsure answer counts as half an error) gives the big « راجع » card (`skills.<key>.lesson`,
  `ReviseFirst priority`), the other lessons follow small under « وأيضًا ». `unsure` is saved with the result.

**A « مسألة » in the player** (`GuidedProblem`, owner 2026-11-04):
- each part's header, repeated on every screen of that part, carries the FULL question (`part.question`), not its short title;
  the part's question box then keeps only « المطلوب » (and is not rendered when a part has none: no empty screen);
- a « 📜 نصّ المسألة » button sits at the top of EVERY screen of the problem (`problems/ProblemSheet.jsx`, portalled outside
  the zoomed area): it opens the whole problem (statement, support, all questions) in a wide two-column `MissionDialog`
  (`wide`), which fits without scrolling at 1366×768 and 1024×768;
- **every sub-step carries its data beside it** (« NO BACK-AND-FORTH », 2026-11-11): the statement is on the problem's first screen only,
  and « الجداء AM × AC » or « طول ظلّ النخلة SH » were asked on screens with no number and no figure. Each opened sub-step except the sort
  is one `data-paging-keep` row (`[data-problem-aside-row]`): on the right, `ProblemAside` — « المعطيات » = the statement's figure (at
  most 240 × 190 px), its table, the USEFUL data the student has just sorted (`problem.data`), or the statement itself in small print when
  the problem has no data list (`asideOf`, `guidedProblem.js`); then « النتائج السابقة » = the sub-steps ALREADY answered, each with its RIGHT
  result (`rightAnswerOf`: `display`/`expected`, the right option — the one the correction has just shown, so a wrong remainder never
  propagates): the results of the earlier parts (their demands), then the earlier sub-steps of this part (`foundOf`) — the next line of
  Euclid's algorithm (« باقي قسمة القاسم السابق على الباقي الذي وجدته ») is computed beside the lines before it. Nothing to write in a lesson; the sort
  sub-step has no column (showing the useful data would give it away). Tested in `guidedProblem.test.js`.

**The lab's mission in big:** entering a lab opens its mission card (`MANIPULATION_CONTRACT.md` « The mission in big »).

**Rounds with stars instead of levels** (owner, 2026-11-04): in the player a lab is a path of ROUNDS (`LabRounds`,
`MANIPULATION_CONTRACT.md` « Rounds and stars »), each worth 1–3 ★, and the total shows in the mission bar.
- **Module 1:** 15 → 3 teams, 16 players (who stays out, then a number of teams that works), 42: 5 or 6?, then the optional ⭐
  challenge (EVERY number of teams that works for 42), then the free pitch.
- **Module 2:** 48 in 6 teams, then in 8, then the free pitch.
- **Only the FIRST round is shared by hand**, a short one (15 players). Every later round passes `handDone`, so « أنشئ الفرق »
  distributes big numbers in one click (owner: « doing the same manipulation 48 times is so hard »). Rule for any lab played in
  rounds: the gesture is learned once, then it becomes a button.

**Questions during the lab, v2 — BINDING since 2026-11-08 (owner validated)** (council of 2026-11-07 + owner's choices; replaces the
centred full-screen card of 2026-11-04 and the separate « رتّب أفكارك » step, in the player only):
- **Where:** the question is a COLUMN inside the lab, beside the pitch (`TeamBuilder` places `cp.node` in a flex row in the game);
  no shade — the pitch stays sharp and whole, the questions are about what it shows. While the questions on the CURRENT
  distribution are open, nothing written may give the answer: `ManipulationShell hideRepresentation` hides the equality /
  roles (also the stale one it keeps), and the trials table hides.
- **Three moments per round:** (1) PREDICT before acting — « 🔮 توقّع قبل أن تلعب: هل سيبقى أحد على المقاعد؟ », free, judged by the
  pitch (« ✓ توقّعك صحيح! » / « الملعب يقول غير ذلك — هذا هو الاكتشاف! »), once per new configuration (`onTrial { tk: 'predict' }`);
  (2) OBSERVE by tapping — `fill`: « كم لاعبًا في كل فريق؟ ▢ · وكم على المقاعد؟ ▢ » with 4 number chips each (`chipsAround`),
  no typing, no « اكتب 0 إن لم يبقَ أحد »; (3) BUILD the equality — `build`: tap tiles into « اللاعبون كلّهم = الفرق × في كل فريق
  + خارج الفرق »; the meaning counts (15 = 5 × 3 + 0 is refused when 5 is not the teams). After the contrast: « أيّ توزيع ترك لاعبًا
  خارج الفرق؟ » then the rule (`CHAINS_PLAYER`); « fix » leaves the mandatory set (the action covers it).
- **The trials table lives IN the lab** (« 📋 جدول تجاربك »: players · teams · per team · outside; green row when nothing is
  left) and replaces the « رتّب أفكارك » step: the module step after the lab opens on the definition once its round is won.
- **Stars reward play, not typing:** ★ round won · ★ predictions right (`roundsModel.predictionsRight`; rounds without
  questions declare `stars.predict: false`) · ★ few trials. A wrong answer to a question no longer costs a star.
- Engine: `labCheckpoint.js` kinds `fill` and `build` (judged only when complete), widgets `FillAnswer` / `BuildAnswer` in
  `LabCheckpoint.jsx`. Outside the player every lab keeps the card over the lab (unchanged until the owner validates).

**The lab door — never walk back through screens** (council + owner, 2026-11-07). A step that waits for a round declares it:
`{ num, title, needsRound: { id: 'r3', label: 'الجولة 3' }, … }`. In the player (`ContentModule`, `LabJumpContext` from
`mission/missionPlayerContext.js`):
- **soft gate:** on the lab screen, when the NEXT step still waits for its round, « واصل » reads « العب الجولة 3 » and selects that
  round (`playNav.nextLabel`) — the student never lands on a locked step by accident;
- **the door:** a locked step shows ONE big button « ⚽ العب الجولة 3 ← » (`data-lab-door`) that opens the lab ON that round;
- **the way back:** when a round that opens a step is won, the win card's first button is « عُد إلى السؤال ← » (`data-round-return`,
  `labJump.toStep`), which goes to that step — whether the student came through the door or played on their own; « الجولة التالية »
  steps aside. The jump request is never saved and is dropped when the student leaves the lab another way.
The module's own « العب الجولة … في المختبر » hint lines are gone in the player (the door replaces them).

The module's steps open from the rounds: module 1, step 1 ← round 2 and step 2 ← round 3; module 2, step 1 ← round a and
step 2 ← round b.

**Two ideas from a competitor's lesson, rebuilt our way** (council + owner, 2026-11-08, BINDING since the owner validated the pilot). A council compared the same
lesson on another platform (a narrated teacher, AI chat, choice-only game). Rejected: the told lecture (it breaks « discover
before being told »), the AI chat (minors' data and voice to a third party, wrong maths, leaks answers) and the choice-only game.
Taken, rebuilt:
- **The second chance in the lab** — a struggling student (≥ 2 misses, never one) is offered a SMALLER round of the same
  gesture, then sent back to the real one; a student who succeeds never sees it. Contract: `MANIPULATION_CONTRACT.md`
  « The second chance ». Not a re-explanation: another try with numbers seen at a glance.
- **« ورقة زميل » — `kit/PeerSheet.jsx`** (logic `kit/peerSheet.js`, tested). A step where the student corrects an INVENTED
  classmate's worked solution (drawn with `KidFigure`, never a real student's work): tap the line where the error STARTS (2 tries,
  then the line is shown — never stuck), pick the fix (each wrong fix carries a `why` naming the misconception, never the answer),
  then the corrected sheet (wrong lines struck, right lines in green) + « لماذا يقع هذا الخطأ؟ ». Found first try: « أمسكتَ الخطأ!
  أنتَ الأستاذ اليوم 🎓 ». Data: `{ id, task, lines, errorLine, fixes: [{ text, ok?, why? }], fixedLines?, why }`; numbers are
  computed, not typed. Place it AFTER the name (an application, not a discovery). The sheet is one paging unit
  (`data-paging-keep`) and its answer is saved and restored like the others (key `peer:<id>`). In the pilot: module 2, step 5,
  « ورقة سلمى » (`content/peerSheet.js`) — the misconception « the quotient is a natural number, so the division is exact ».

**« التمارين » on the mission path** (owner, 2026-11-08, BINDING): `MissionMap` (given `lessonId`) adds a last station after the
final test — 📝 « التمارين », a link to the lesson's practice hub (`practiceHubPath`), locked (🔒 « تُفتح بعد الاختبار الأولي »)
until the last station is mastered, shown only when `isPracticeActive(lessonId)`. It is not a module: no slug, no gate.

**« إختبار أولي » in the player — like « أستعدّ »** (owner, 2026-11-08, BINDING). `BossFinal` decides « in the player » itself (same
test as `PrerequisiteDiagnostic`: mission config + `isMissionView`). In the player, phase « التحدي »:
- no tabs and no brief: a 5 s `TimedNotice` « الآن لنختبر تقدّمك بمجموعة من الأسئلة » (`boss.playIntro`), then question 1 directly;
- ONE épreuve per screen through `DiagnosticPlayQuestion` (« 🤔 غير متأكّد », 1 s undo, signal ✓ / « سنعود إليه » — never the right
  answer; options keep the test's shuffled order via `q.order`); the player advances by itself (`useAutoAdvance`);
- the timer stays OPTIONAL: a chip « ⏱ مؤقّت 7 دقائق » on question 1 (before any answer), then the countdown on every question
  (red in the last minute); at zero the test is sent;
- after the last answer the result comes by itself (`submitBoss`, the SAME single submit: grading, evidence and saved attempt
  unchanged): `BossReviewCompact` — score, one circle per épreuve opening its correction (`EpreuveReview`, « راجع » links), skills
  in one line, « واصل: نتيجتي حسب الكفاءات » and « إعادة الاختبار ».
- « نتيجتي » in the player (owner, 2026-11-08): NO tabs — « التحدي النهائي » is reached with the player's « السابق » (declared by
  `BossFinal` through `useDeclareUnitNav`: back = the test result, no longer the lesson home) and « الحوصلة » is removed from the
  player. ONE screen (`PlayerProfile`, `data-paging-keep`): title + score chip, a card per skill (✓ / ~ / ✗ in a big circle, its
  status, « 🔁 مراجعة المحور n » under the name when not mastered), the badges earned, and « 📊 حالتي على كل الكفاءات » opening the
  server الكفاءات status in a dialog. « إنهاء » is the player's own button.
Outside the player (page, teacher, Classroom Mode) nothing changes: the three tabs and the synthesis stay.
**Timer bug fixed for every lesson** (2026-11-08): `useCountdownTimer.start()` read a stale `enabled` when the toggle enabled then
started in the same click, so the countdown never ran; it now reads a ref.

**The knowledge map is totally open** (owner, 2026-11-08, BINDING): `knowledgeMapOpen: true` — every card of the lesson's map is
readable from the start, no unlocking by محور; the coins and « أتوقّع القاعدة » still follow what the student established
(`learnedItems`). Contract: `KNOWLEDGE_MAP.md` A.4 « Exception — the OPEN map ». In the player the mission bar
carries « 🧠 بطاقتي » (opens the map FULL-SCREEN, `openMap({ expanded: true })`, on the interactive « الاستكشاف » view; inside the player full screen
covers the WHOLE window — `KnowledgeMap` uses the window, not the page's content box, when `[data-mission-player]` is mounted) and
« 📓 كرّاسي » (the floating buttons are under the player); below 1280 px both are icons and « n من 8 » folds into « الخريطة ».

**The student's answers come back — synced and private** (council + owner, 2026-11-07, BINDING). In the pilot lesson only
(`studentView: 'mission'`) and for a real STUDENT account (`answers/useSavedAnswer.js › useSavedAnswersOn`), each answer in the
lesson is saved and restored when the student comes back, on this device or another:
- **What is saved:** `TapQuestion`, `BatchChoiceQuestion`, `NumericQuestion` (`kit/questions.jsx`, via `useRestore`), the progress
  and data of a `GuidedProblem` (key `gp:<problem id>`), and the text and reveals of a `WrittenAnswer`. The rule a student writes in
  « أتوقّع القاعدة » goes to « كرّاسي » instead (`docs/architecture/NOTEBOOK.md` « قاعدتي »).
- **Key:** `m<module>:<fingerprint>`, an FNV-1a hash of the question's own text and options (`answers/answersModel.js`). When a
  question is reworded, its old answer is ignored rather than shown under the wrong question.
- **Store:** a device copy (`scopedStorage` `smarter_answers_<lessonId>`) and a debounced `PUT /lessons/{code}/answers` (900 ms,
  retried on failure). On load, `GET` is merged key by key and the latest `at` wins (`mergeAnswers`, same rule on the server).
- **Restore:** a restored answer sets the state and calls `onAnswered` once, with no sound and no celebration. A chip
  « ↺ إجابتك السابقة · <date> » (`answers/SavedAnswerChip.jsx`, `data-saved-answer`) shows under it. The step continues as done.
- **Privacy:** the table `student_lesson_answers` is read ONLY by `StudentLessonAnswersController`, in the `learner` route group,
  for the student themselves. No teacher, school, parent or admin view reads it. The model hides `answers` from serialisation. It is
  never learning evidence and feeds no mastery (`apps/api/tests/Feature/StudentLessonAnswersTest.php`).
- Teachers, reviewers and every other lesson are unchanged. A component that renders outside `ContentModule` passes `lessonId` and
  `moduleNumber` itself (the hook reads the kit context optionally).

Measured (`play` walk, every unit and page of the 8 modules + home, at 1854×930, 1280×800 and 1024×768): EVERYTHING fits,
nothing scrolls. Labs in the game layout run at zoom 0.83–1.04, and text screens are enlarged up to 1.9.

**Stage 3** (planned): the climax animation (756 books → 21 shelves) and the bonus levels.

### Rollout recipe — converting a lesson whose lab is NOT the football lab (first conversions: `qawasim-adad-tabii` with `factor-pairs`, `khawass-qawasim` with `divisor-properties`, `qasim-mushtarak-akbar` with `common-divisors`, 2026-11-08)

The owner validated the pilot on 2026-11-08; lessons are converted one by one (`docs/reports/MISSION_ROLLOUT_PROGRESS.md`, plan
`PILOT_PROTOTYPE_ROLLOUT_PLAN_2026-11-08.md` §5). What a lesson with another lab needs beyond the checklist:

- **The mission scene is per lesson.** `mission.scene` in the config picks a drawn SVG from `mission/MissionScene.jsx` (a registry:
  `'library'` = 756 books, `'library-wall'` = 96 books + a `KidFigure` librarian, `'construction-wall'` = a brick wall that rises + a `KidFigure` apprentice, `'flower-shop'` = identical bouquets on a counter + a `KidFigure` florist in hijab (these four DELETED with their lessons' mission player — v2, LESSON_V2.md §2), `'school-bags'` = identical school bags filling on a table + a
  `KidFigure` volunteer (DELETED with `tayin-pgcd`'s mission player, 2026-11-19), `'sewing-workshop'` = two ribbons cut into equal pieces + a `KidFigure` seamstress in hijab (DELETED with `bahth-pgcd`'s mission player, 2026-11-19), `'bakery'` = identical dough portions on a tray + a
  `KidFigure` baker (DELETED with `ikhtizal-kasr`'s mission player, 2026-11-20), `'math-club'` = pairs of numbered tiles judged « ✓ » + a `KidFigure` in hijab (DELETED with `awwaliyan-fima-baynahuma`'s mission player, 2026-11-20), `'garden-bed'` = a square flower bed on the
  hypotenuse of a right-triangle corner, filling with rows of flowers + a `KidFigure` gardener, `'carpet-loom'` = a square carpet woven row by row on a loom, `'fold-strip'` = a paper strip folded in a V at a school science fair (two halves
  coloured symmetrically, a rosette on the fold; a `KidFigure` girl in hijab and a boy), `'courtyard-slabs'` = a square school courtyard paved slab by slab (`slabs` sets the slabs per side; a `KidFigure` girl in hijab and a boy),
  `'courtyard-big'` = the SAME courtyard re-paved with bigger slabs (`slabs={3}`, lesson `tawzif-khawass-judhur`) — a scene a lesson continues is a
  VARIANT registered in `MissionScene.jsx`, not a new drawing,
  its border and fringes closing at the end, + a `KidFigure` weaver in hijab). A new scene is a component `<Nom>Scene({ fill,
  label, className })` drawn in code (never a generated image), `fill` ∈ [0, 1] following the tools earned; it must not show any
  number of the مسألة (rows, capacities). `MissionHome`, `MissionCheckpoint` and `MissionLayer` read `mission.scene`.
- **No back-and-forth** (owner, 2026-11-11, BINDING): before a conversion is done, `node apps/web/e2e/no-back-and-forth.mjs <id>` shows 0 `OVER`
  and no unjustified `LONE`, and a walk that answers every question finds no screen whose question needs something shown on another screen
  (§4septies, « NO BACK-AND-FORTH »).
- **Checkpoints use other numbers.** A point d'étape speaks of 30, 50 or « n » — never of the climax's numbers (96 here). Its options are SHOWN in an
  order drawn from its `id` (`missionModel › checkpointOrder`, 2026-11-10): write the right answer anywhere — it is never always first on screen.
- **Rounds are data, in `content/<lab>.js`** (`books.js` for `factor-pairs`): `M<n>_ROUNDS = [{ id, title, goal, stars, easier?,
  optional?, free?, props }]`. Only round 1 is by hand (the next rounds set `handDone: true`); a challenge round (`optional: true`);
  a free round (`free: true`, bounded `nChoices`); `easier` on every hard round (a smaller number, `goal` = the same kind).
  Goals available: `{ checkpoint }`, `{ exact }`, `{ allExact }`, `{ inexact }`, plus (factor-pairs) `{ anyExact: true }` and
  `{ allPairs: n }` (every perfect rectangle of `n` seen — one side of each pair is enough), (common-divisors) `{ above: g }`, (square-root-side)
  `{ bracketed: g }` and `{ resists: true }`, (square-fold) `{ solvedAll: n }` (the n cards of the round solved — a verdict's `groups` is the card). (square-tiling, 2026-11-10) `{ discovered: true }` — the lab's OWN discovery (its mode-aware `discoveryReady`), announced once by `onTrial { tk: 'discovered' }`. (growth-race, 2026-11-11) `{ modelOk: true }` — a model of the situation checked right, `onTrial { tk: 'model' }` (bullet « A model check is not a trial » below). A verdict may carry `free: true` (a refusal that IS the discovery — the first of a round): it counts for the goals, never for the « few trials » star (`countedTrials`). A round may carry `helpAfterRefusals: n`: n refusals offer the `easier` round (a lab where a refusal is the normal move, and three in a row means the student is going round in circles). **Forbidden values by role** (council of 2026-11-10, lesson `tawzif-khawass-judhur`): when the lab's own tool IS the climax's method, the climax's numbers are forbidden on the lab's screens by ROLE, not as bare digits — a content file states the rule mechanically (`content/forbidden.js`: values never shown under any role; values allowed only in one role, e.g. 25 only as k² inside « n ÷ k² »; values allowed only as the RESULT of the student's own action on named cards, never as a decoy), and the round test, written FIRST and run on the card list before any content, scans everything a screen can show with its role (`square-tiling › simplestShown`) with negative controls (a dropped card must be caught). A lab's decoy builder takes an `avoid` list rather than the lesson changing its numbers by hand. **A prediction is asked ONCE per round:** « إعادة » (the scene restarts) asks again; « أعِد التجربة » of a lab question keeps the predictions already made (the round forgets only what the lab undid). **Every judged prediction is shown and heard once, never behind the round's question:** a lab whose question can open on the move that judges a prediction holds the question for a beat (`square-tiling › judgedPredictions` + `PRED_HOLD_MS`; at the discovery every prediction is judged, even a k never tried). **Every question a round asks is in its goal** (`{ checkpoint: <the chain's id> }` — in the player a one-question chain of `square-tiling` is `'tile'`, of `square-fold` the card's `c<i>`, a chain holding the rule is `'rule'`): otherwise the round is won, and its win card shown, while the question is still open (ECC review 2026-11-10). A lab's « أعِد التجربة » sends `onTrial { tk: 'retry', groups? }` so the round forgets what the lab undid; the win card reads its criteria from `starCriteria`, never on its own. A « few trials » star for a lab with nested steps (a magnifier) is a budget PER STEP (bisection: ≈ 4
  releases per refined graduation), tested by playing the round the efficient way. Numbers are COMPUTED (`divisorsOf`,
  `pairsOf`), never typed by hand. `LabRounds` takes `icon` / `freeIcon` (📚 / 🗂️ for books) and a round's `easier.helpLine` replaces
  the football sentence of the « جرّب أصغر » card.
- **One step = one round AND its question.** `needsRound: { id, label, icon?, won }` — pass `won: Boolean(won.<id>)` so the door and
  the soft gate disappear once the round is won even when the step's own question is still unanswered (`ContentModule`).
- **The v2 lab treatment, for any lab** (recipe taken from `team-builder`, applied to `divisibility/FactorPairs.jsx`; everything is
  gated by `useInMissionPlayer()` so the teacher's page and Classroom Mode are byte-for-byte the old lab):
  1. the lab reports each try to the round: `onVerdict({ groups, exact })` (and `onTrial` events, `{ tk: 'predict', ok }`);
  2. props `levels={false}` (no مبتدئ / متقدم), `handDone` (the learned gesture becomes the big « جرّب كل الإمكانيات » button; hidden
     in round 1), `chains` (which question sets to ask: `['first']`, `['rule']`, `[]`), `predict` (false = no prediction), `nChoices`
     (free round chips);
  3. PREDICT before the first tries (`primitives/PredictTray.jsx`, shared with `team-builder`, at most 2 per round): the rectangle is
     veiled until the student answered — a prediction made while looking at the answer is a reading;
  4. OBSERVE (`fill`) then BUILD (`build`) the equality of the FIRST try (`CHAINS_PLAYER`); the controls freeze while a question or a
     prediction is open (the picture must describe THAT try);
  5. the trials table (« 📋 جدول تجاربك », the last 3, newest last) and the found pairs live INSIDE the lab; nothing written gives an
     answer while the questions on the first try are open (`hideRepresentation`, `hideAnswers`);
  6. the scene is sized from `useMissionArea()` (`boxH = area.height − overhead`, the cell cap raised: `rectangleLayout({ maxCell })`)
     and measured again on every render — the player mounts the lab in a hidden measuring copy, so a `ResizeObserver` alone keeps the
     width of the hidden copy;
  7. in the player the lab is always `guided` (no « جرّب › اكتشف », no hint button, no « ماذا لاحظت؟ » card), `freeLabAlwaysOpen` and
     the free-lab panel are off.
  `divisor-properties` (lesson `khawass-qawasim`) is the second example and adds three reusable ideas: (a) a `sequence` of cases played one after the other
  INSIDE one round (the next case loads when the three operations are built; the verdict `groups` keep counting, +3 per case, `Math.max(seqIdx, 0)` for a round
  without a sequence), so a step that covers two textbook cases still has ONE door; (b) « a zone becomes a button » for the learned gesture when the lab has no
  « try all » (the drop zones render a big button once `handDone`); (c) a lab whose steps already hold questions per operation turns each operation's number
  question into `fill` and the division into `build`, and hides the written formulas while a question is open. In the player never celebrate « all tasks
  done » when the stepper is hidden. `common-divisors` (lesson `qasim-mushtarak-akbar`) is the third example and adds: (d) while a question is open the
  SCENE SHOWS WHAT THE QUESTION IS ABOUT, not the last try (`useLabCheckpoint` returns `qid`; « the greatest that worked » is drawn at the greatest, « beyond »
  at the first number tried above it); (e) a goal that needs « the greatest is SEEN » is `[{ exact: g }, { above: g }]`, never a lucky `exact` alone; (f) a lab
  with two stages (groups, then lists) plays ONE stage per round (`startWith`), and a stage without trials reports its result as the verdict (the PGCD
  placed). The rollout log lists which lab families already have it — when a lesson's lab family is ALREADY converted (e.g. `tayin-pgcd` after
  `qasim-mushtarak-akbar`), the conversion is content only: a rounds file, the wiring, the scene. A module with no lab takes the peer sheet. A tool
  label has no Latin letters (« b قاسم لـ a » reorders in RTL). A lab whose steps are FORCED (a chain of cuts or divisions — `pgcd-differences`,
  `euclidean-algorithm`, lesson `bahth-pgcd`): the prediction opens at the START of a step (« كم سيبقى؟ », « كم نسخة تدخل؟ »), the round's verdict is
  the PGCD placed (never the forced steps) with `maxTrials: 1`, and the `build` question may set `ops` (« 252 = 140 + 112 » → `['=', '+']`).
  `fraction-reduction` (lesson `ikhtizal-kasr`) follows the same shape: the verdict is path B (one division by the PGCD), and a premature « لا يمكن
  الاختزال أكثر » counts as a miss.
  A lab whose proof is « NOTHING works but 1 » (`coprime-explorer`, lesson `awwaliyan-fima-baynahuma`): the first round is SMALL by hand (8 and 9: eight
  taps), the activity's numbers come second with predictions and « جرّب كل الإمكانيات » (`handDone`), and its goal is « everything tried »
  (`[{ exact: 1 }, { above: min − 1 }]`); the module's steps may wait for that second round (`needsRound: { id: 'r2' }`). The build question builds what is
  LEFT (`n = k × q + r`), never an equality that would need a k that does not exist.
  A lab where the hand APPROXIMATES (`square-root-side`, unit 2, lesson `jidhr-tarbii`, council of 2026-11-09): (g) the « build » step may build an
  INEQUALITY (« 4 < 5 < 9 », `ops ['<','<']`) — the bracket the hand made, written as maths; (h) « never » is not asked as a belief (« will a finer
  graduation EVER land? » cannot be proven by doing): the student COUNTS an observable fact instead (c has k decimals, c² has 2k and its last digit
  is never 0, so c² is never the whole number a), and the rule comes after; (i) a yes/no prediction that would always get the same answer becomes a
  pattern — ask it at non-consecutive steps (`predictAt: [1, 100]`) and add a round where the answer FLIPS (2,25: « no » at 1, « yes » at 0,1), required;
  (j) a prediction the lab answers later is judged by the computed truth when it is made and its result shown when the lab has decided; (k) in the player
  the question chain follows the computed TRUTH, not what is already found. In the player a `TextbookExercise` batch of ≥ 6 rows is laid on two
  columns (from `lg`; a 768-px tablet keeps one) as one screen (`BatchChoiceQuestion rowCols`, `data-paging-keep`) so a long list never falls under the minimum zoom. A module that calls `BatchChoiceQuestion` itself passes `rowCols="auto"` (two columns in the player for 6 rows or more): `useInMissionPlayer()` at a module's top level is always false. Choice buttons of the lab questions never let their content take the pointer (a √ overflows above its button).
  The same lab in GRADUATION mode (lesson `natiqa-ghayr-natiqa`, council of 2026-11-09): (l) a « resists » verdict must be TRUE — in the player a card
  whose side lands on an offered graduation never « resists », even bracketed on three rulers that are not its own (`init({ truthful })`; 16/9 on 1/1,
  1/2, 1/4 stays open and the coach says « another ruler »), and a round never offers a rational card a ruler too short for it (test); (m) every round
  holds one card that lands and one that never does, and its two predictions have DIFFERENT truths (the card open at the start is « no » in one round,
  « yes » in the next) so always answering « no » cannot win the star; (n) the cards ARE the choice of the free round (no `choices` row); (o) a module step whose gate comes from the lab (a checkpoint
  event, the trials listed as evidence) must survive a reload — derive it from the round's STORED stars and keep the trials with `useSavedAnswer`
  (`key`, `lessonId`, `moduleNumber`), never from memory alone — and save a value that MERGES what is kept only once `ready` (the server's copy has
  arrived), or a partial newer save overwrites it; the module's door « العب الجولة … » never skips a closed round (`LabRounds` →
  `roundsModel › jumpTarget`).
  `square-fold` in the player (lesson `muadalat-x-murabba`, council of 2026-11-10): (p) a value NEXT to an irrational answer is never accepted as the
  answer — the lab says why with computed numbers (« 1,7² = 2,89 ≠ 3 ») and shows the exact object to take instead (the mark √3), and that first
  discovery is not counted as a trial; (q) each round's two predictions ask about two cards whose truths differ (`predictCards`), and a later round
  may ask ANOTHER question (« does a tick land on a solution? ») once the first one has become recall; (r) a build's decoy tile is the misconception of
  the moment (the nearest tick 1,7, or half of a) — never a random number. Strings: never interpolate `{{ns}}` (i18next reads `ns` as the NAMESPACE:
  the browser shows the raw key while a jsdom render passes), one formula per Arabic sentence (several `$…$` runs reorder), no equation in a
  plain-text `lead` (the cards carry them), and `content/*.js` never imports a sibling without its extension (Node reads them for `check:lessons`).
- **« ورقة زميل »** (`content/peerSheet.js`): an invented classmate (`KidFigure`; girls in hijab), 3–5 lines with ONE error on the
  lesson's main misconception, three fixes each with a `why`, the numbers computed from the same helpers as the rounds, and a test
  (`peerSheet.test.js`) that the error line is the only wrong one.
- **A geometry lab whose verdict is a separate PRESS (unit 9, `aksiya-talis` / `parallel-level`, council 2026-11-10, verdict L2.1).** When the lab
  shows its verdict LIVE (a bubble that centres as the hand moves), the hand can stop on the right place without thinking and every release
  becomes a trial. In the player, hide the verdict while the student moves and give it a button (« ضع الميزان », `[data-pl-press]`): ONE press =
  ONE trial, the same position twice is not a trial, and from round 2 the student first states the numbers the verdict depends on (the two ratio
  chips) — « compute before you look ». Reuse this shape for any lab whose truth is visible at a glance.
- **A build with a fixed side and several right fillings.** A `build` question may set `preset` (tiles already placed, e.g. the left side
  « AB′/AB » of « AB′/AB = ▢/▢ », which the student may take back) and `accept` (other fillings that are ALL true — the equality written the
  other way, « AC′/AC = AB′/AB »); test both, and test that the decoy (CC′, the rest of the bar) is refused. A `fill` field may set
  `render(value)` to draw its chips in their own shape (a real fraction bar), the compared value staying the string. Contract:
  `MANIPULATION_CONTRACT.md` § LabCheckpoint.
- **Geometry in the player: figures and tall labs.** A lab whose drawing is tall (an X-trestle) bounds its scene by the mission area
  (`useMissionArea()`) and puts everything but the controls (chips, the side of A, figure chips, verdict, journal) in the side column — otherwise
  the player zooms the whole screen down. In module steps, keep a row of figures ONE paging block (`data-paging-keep`), never draw an exercise's
  figure twice (`TextbookExercise` already draws `exercise.figure`), give exercise figures a `maxWidth` that fits a 1024 × 768 page (230 here),
  and put ONE exercise per step. A player-only layout inside a module goes through `PlayerSwitch` (rendered INSIDE the player) — a
  `useInMissionPlayer()` called at the top of the module component is always false (the module renders the player).
- **A construction lab in the player (unit 9, `inshaat-talis` / `segment-divider`, council 2026-11-10, verdict L3).** When a trial is a whole
  construction (many gestures), keep the page's notion of a trial and (1) REFUSE in words, before any number is computed, a construction whose
  premise is false (`sameUnitOnly`: two parallels graduated with two compass openings — otherwise the lab writes arbitrary ratios, and here one
  of them was the climax's); (2) CAP what the hand can build (`marks: 3`) so that every reachable value can be listed and scanned
  (`logic › shownValues`); (3) on a wrong construction show the evidence (bands, openings) and never the computed lengths; (4) refuse without
  counting a gesture that can never finish a trial (joining mark 1); (5) give the figure the NAMES the questions use (P₁ … Pₙ, M₁ …, F, E) at
  the moment the question needs them. A prediction may be a multiple choice given by KEY (`predict: ['joinWhich', 'parallels']`): the lab
  computes its options and its truth, so a content file never writes an answer.
- **The coach bubble must never block the next gesture.** Walk every lab ONCE without pressing « فهمت » (`click` with a short timeout and
  list what was blocked): a bubble anchored under the scene covered the dotted mark the student still had to tap, and a bubble above a « new
  construction » button covered the bands of the construction just finished. Remedies used in `segment-divider`: move the targeted controls to
  a bar above the scene in the player, give `prefer`, drop a step whose bubble has no free place, or mark it `idle` (shown only when the student
  stops for `COACH_IDLE_MS`).
- **A contrast as a goal, not as a question.** A round that wants « do it again with another setting » states it in its `mission`, sets
  `contrast: true` (the coach keeps « إنشاء جديد » after the chain) and puts `{ discovered: true }` in its goal; the lab's verdict then says what
  was SEEN (« نقط التقسيم في أماكنها نفسها ») — never the rule. Ask the contrast in ONE round only (verdict L3.4).
- **Role-paired forbidden values when a textbook method owns a number.** A value may be forbidden in the lab (`content/forbidden.js`, by role)
  and still be legitimate in a method card (here 3/7: the climax's decoy « MB/AB », but also the DATA of the method « 3/7 = 2/AB »). Keep it
  out of the unit's text scan (`_unit/missionStrings.test.js`), say why in the test's comment, and keep it in the lab's role scan.
- **A player-only lab beside a page lab (unit 9, `talis-hisab-atwal`: `shadow-world` on the page, `shadow-meet` in the player; council
  2026-11-10, verdict L1.1 = C).** When the page lab is a WORLD (many objects, a written rule, a companion) that cannot be cut into rounds
  without keeping dead state alive underneath, do not reduce it: write a NEW small lab for the player and leave the page lab untouched.
  The recipe: (1) the new lab has its own type in the registry, `levels.js` and `manipulationTypes.js`, its own logic file built on the
  PURE functions of the old one (`shadowMeet.js` imports `HOURS`, `K25`, `shadowAt`, `m` from `shadowWorld.js` — one source for the sun);
  (2) the module mounts `<PlayerSwitch player={<LabRounds … rounds={M1_ROUNDS} />} page={<ManipulationWorkspace …the old lab… />} />`;
  `lesson.config.js › resources` keeps declaring the PAGE lab (a comment says what the player plays); (3) `lab-rollout-status.mjs` reads
  the labs of a lesson's rounds too (`content/*.js` holding `…_ROUNDS`, `type: '…'`), so the player lab passes the same gate — it must
  also work outside the player (stepper, celebration, the questions above the scene); (4) the sentences of the steps that named the page
  lab's objects get a player variant (`inPlayer ? SHADOW_STEPS.bridgePlayer : SHADOW_STEPS.bridge` — the student never saw the minaret);
  (5) **nothing of the lesson is written in the component**: objects, heights, hours, tasks and texts are round data (`steps`), so another
  lesson (the unit's synthesis) plays the same lab with its own round; `shownValues(props)` lists what that round can show.
- **Round data may be a list of `steps` (the same lab, one hour then another, one object then another).** `verdict.groups` is then the step
  index and the goal is `{ solvedAll: n }`; a step that asks nothing (an observation) reports a `free` exact verdict — it counts for the
  goal, never as a trial. A round without prediction sets `stars: { predict: false }` (otherwise the second star can never be won).
- **A typed answer inside a lab uses the platform's answer template** (`templateFor()` + `TemplateInput`, « H = [ ] m » —
  `EXERCISE_CONTRACT.md` § « قوالب الإجابة »): build the template from a statement with a gap (`'$H = \\ldots\\,\\mathrm{m}$'`), read
  `{ value }`, and judge it in the lab's logic in whole centimetres. Keep one tap for the early rounds (typing is a barrier), the template
  for the later ones.
- **Scan only what a screen WRITES.** `shownValues` must follow the round's chains: `shadow-meet` lists the ratio OB/OA only when
  `chains: 'same'` writes it (the practice lamppost of 1,5 m has OB/OA = 2/3, a climax ratio, but no screen of that round writes a ratio).
- **Numbers on the zones, letters in the build — `labels: 'area'` (unit 3, `nashr-tabsit`, `pitch-expansion`, 2026-11-11).** When the tray of a lab
  would print the very terms a BUILD asks for, show the zones' VALUES at the current x instead (one pure `zoneText(term, x, labels)` for every
  place that shows a zone) and keep the letters on the sides: the student reads 18, 12, −3, −2 and writes 9x, 3x², −3, −x. A removed value keeps
  a non-colour cue (✂ and hatching) and its name says « مقتطعة ». Reusable for any lab that turns a number at x into a letter term.
- **The equal-values trap — `areaCollisions` (council of 2026-11-11).** When numbers stand for terms, two terms of DIFFERENT kinds (degree) must
  never show the same number at a reachable x (27 and 27 at x = 3: which tile is 9x, which is 3x²?). The ruler skips such x (`playerXs`), the
  start is never one, and a logic test sweeps EVERY reachable x of every round, practice rounds included. Same-kind twins (the two bx strips of a
  square) are allowed by the rule itself — no per-round whitelist.
- **Book exercises rewritten, the source kept for the teacher.** When a module's exercises were the book's, rewrite them with the platform's
  numbers, contexts and wording, keep `source: src(<id>, …)` (the competence they cover, `check:textbook`) and add `part: 'بأعداد المنصّة'` so
  the teacher's tag says it; check first that the practice bank / « بوصلتي » / BEM sheets do not read the file (they have their own data).
- **What a question of the round ASKS, the lab does not PRINT (unit 3, `tahlil-ibara`, `turf-factoring`, 2026-11-11).** When the page lab writes
  the answer of the round's BUILD (the equality `8x + 6 = 2(4x + 3)` under the field, the height chip `2x`, the corner reading `2 × 4 = 8`),
  the player hides it while a chain of the round is open or still to come (`hideAnswer`: the chip says « ? », the verdict says only « عدد
  الصفوف 2 : لا قطعة خارج الملعب », the corner reading is gone) and shows it again once the chain is done. Otherwise the build is a copy.
- **The forbidden FIX, narrow definition (unit 3, council of 2026-11-11, verdict L3).** When the climax's part 2 is a classmate's INCOMPLETE
  answer (here أمين's `5(2x^2 + 3x)`), the checkpoints, the peer sheet and « أستعدّ » never pose an incomplete factorisation k(…) whose bracket
  still shares an x — tested by a regex (`content/forbidden.js › incompleteFactor`). The lab's own chain MAY teach « the letter comes out » and
  « rows divide both counts » on its OWN numbers (`heightFill`, the build's decoy): that is the lesson's discovery, not the climax's fix.
- **A build with brackets: `wrap: [before, after]`** on a `LabCheckpoint` `build` question writes a sign before the first slot and after the
  last (« ▢(▢ + ▢) » = `ops: ['(', '+'], wrap: ['', ')']`; « (▢ + ▢)² » = `ops: ['+'], wrap: ['(', ')²']`). Choose the tiles so that NO other
  arrangement is also a true equality (`x(3x + 6)` from the tiles of `3x(x + 2)` would be equal and refused): the logic test tries every
  arrangement (`logic/turfFactoring.test.js`).
- **A build a screen reader can answer (unit 3, `mutatabiqat-shahira`, a11y review of 2026-11-11).** `BuildAnswer` renders `ops` and `wrap`
  `aria-hidden`: (1) the PROMPT states the left side (« أكمل $(a + b)^2$ بالحرفين », « انشر $(2x - 1)^2$ »), not only `wrap`; (2) a sign that
  matters lives IN the tile (`-4x`, `+1`, `-2ab`, `+b^2`, `ops: ['', '']`), never only in a hidden op; (3) when the build is in LETTERS on a lab
  drawn with numbers, the lab's sides relabel a / b on screen while the question is open (`pitch-expansion` `relabel`, verdict L2.6).
- **The coach bubble must never cover the next control.** If the « look at what lit up » bubble opens above the refused pieces, the controls
  (− r = n +) go ABOVE the scene in the player (`[data-turf-topbar]`), as `segment-divider` did with its join row.
- **A module body never calls `useInMissionPlayer()` (unit 4, 2026-11-11).** The player context is provided BELOW the module (`ContentModule ›
  ModuleLayout › MissionPlayer`), so the hook is always false there and a player-only step silently shows its PAGE version. Decide at module
  level with `lessons/common/mission/useModulePlayer.js › useModulePlayer(MODULE_CTX)` (the same rule as `ContentModule`: a lesson with
  `mission`, mission view, not free navigation, not Classroom Mode) — or render `PlayerSwitch`. Inside a LAB (rendered by the player)
  `useInMissionPlayer()` stays the right call (`MISSION_ROLLOUT_PROGRESS.md` « Cross-lesson fix — « in the player » decided at module level »).
- **A plain-text tile in a build: `{ text: 'أو' }` (unit 4, `jidaa-maadum`, verdict L2.3).** A `LabCheckpoint` `build` tile written as an
  object `{ text }` renders as Arabic text (`dir="rtl"`, `[data-lab-checkpoint-text]`) and is compared by its STRING in `expected` / `accept` /
  `preset`; number and string tiles keep their maths path. Use it for a connector the student must CHOOSE (« ▢ = 0 ▢ ▢ = 0 » with « أو » and the
  decoy « معًا » — never « و »). Test: `primitives/labCheckpointBuildText.test.jsx`.
- **A wide text slot for an Arabic word: `wideText` (unit 5, verdict X10 / L3.11).** `wideText: true` (every slot) or a list of slot
  indices (`[1]`) makes those `build` slots 7 rem wide (`[data-lab-checkpoint-wide]`; a placed word never wraps), and the row then reads
  RIGHT TO LEFT and wraps (`[data-lab-checkpoint-sentence]`): write `wrap` / `ops` / `slots` in Arabic reading order — « ثمن ▢ هو 90 دج،
  وثمن ▢ هو 50 دج. » with the text tiles « الكرّاس » · « القلم » and the decoy `x`. Measured at 1024 × 768 in a 388 px column: « الكرّاس »
  ≈ 70 px in the 112 px slot (zoom 1 and 0.9), the sentence on two lines, no horizontal overflow. Without `wideText` the render is
  unchanged byte for byte. Test: `primitives/labCheckpointBuildWide.test.jsx`.
- **A model check is not a trial: `tk: 'model'` and the goal `modelOk` (unit 4, `tarrid-mushkila`, verdict L4.3).** A lab whose first act is
  to MODEL the situation (`growth-race`: carry « + x » onto whoever grows, then « تحقّق ») sends `onTrial { tk: 'model', ok, key?, free? }`;
  `roundsModel` logs it in `log.models` (the same `key` once), a round's goal may require `{ modelOk: true }`, a refused non-free model is a
  MISS (`missesOf`), never a trial of x (the « few trials » star is not touched); « إعادة » clears the models, a retry clears them only with
  `{ models: true }`. Tests: `rounds/roundsModelModels.test.js` (the older `roundsModel.test.js` untouched).
- **A lab shared with a synthesis gets its player in its OWN file (unit 5, verdict X7 — the default).** `systems/<Lab>Player.jsx` + pure
  `logic/<lab>Player.js` (+ tests); the lab's file keeps the page component under another name and its default export becomes a ≤ 10-line
  dispatcher: `const inPlayer = useInMissionPlayer(); return inPlayer ? <LabPlayer {...props} /> : <LabPage {...props} />;` — the page, its
  logic and its render tests (and the synthesis's frozen `lab.snapshot.test.jsx`) stay untouched. References: `PairScoreboard.jsx`,
  `EliminationCards.jsx`, `StoryModeller.jsx` (MANIPULATION_CONTRACT « Twenty-third » to « Twenty-fifth example »).
- **The verdict masked while dragging, reused (unit 5, `pair-scoreboard`, verdict L1.2 — after `solution-ray`).** When what the lab shows during
  a drag would let the student sweep to the answer, the player masks it (`data-masked`) until the gesture is committed; the commit is the only way
  to read it, and a trial is a NEW committed value. A ruler then reads its value on the track's rect AT GESTURE TIME and never takes a fixed width
  from its container (`flex-1 min-w-0` + `ResizeObserver`): a width computed once ratcheted wider than its column and read the wrong value.
- **A module without a lab may open on short player-only rounds for its special cases (owner OQ1, `mafhum-jumla` module 2, 2026-11-12).**
  `intro={<PlayerSwitch player={<LabRounds labId="lab-…-m2" … />} page={null} />}`, the module's brief dropped in the player (the lab opens the
  module, nothing above it), two short required rounds (a discovery + ONE tap each), and the step that classifies re-reads the student's own
  boards beside its prediction (`needsRound`). The teacher page is unchanged.
- **The unit collision test (unit 5, verdict X3–X4).** When a unit's lessons are built in parallel, each lesson's `_unit/signatures/<lesson>.js`
  exports `TEXT` (climax signature by role), `UNIT` (what the other lessons may not show before its climax) and `SYSTEMS = [{ id, tier, system,
  callback? }]` built FROM the content files; `_unit/unitCollisions.test.js` checks K1 no system twice (canonical form), K2 headline pairs
  (required · ⭐ · checkpoint · peer) distinct as ORDERED pairs, K3 no easier / free / prep solution equals a headline pair, and a forward ban
  against the later lessons' climaxes, the synthesis and the unit page's reserved challenge. Contract: the folder's `signatures/README.md`.
- **A decoy by path (unit 5, `hall-jabri`, rule P).** When a lesson must not WRITE a form before its climax (a minus before a bracket), the lab
  may still SHOW the student's own path, and the BUILD decoy is chosen per path (`logic/eliminationCardsPlayer.js › buildSpec`), so the forbidden
  error is never offered as an option on that path.
- **In a `BossFinal` item `correct` is a numeric literal** (`scripts/validate-lessons.mjs`: the assessment-item registry exports it as the answer
  key). Rewriting a test item, write the literal and pin it to the content data by a test (`mafhum-jumla/content/mission.test.js`).

### Synthesis in the mission player — engine fields (PROVISIONAL until a real student has played the pilot)

Added on 2026-11-10 for the first synthesis lesson (unit 9, `wadiya-idmajiya-talis`; councils of 2026-11-10). The pilot is now CONVERTED
(same day) and uses every field below; the recipe for the other syntheses is in `docs/reports/MISSION_ROLLOUT_PROGRESS.md` › « The synthesis
recipe » — PROVISIONAL until a real student has been timed on the pilot (module 7 ≤ 32 min, module 8 finished). The fields may still change.

**Every field is opt-in.** A lesson that sets none of them behaves exactly as before (tests: `mission/missionModel.test.js`,
`mission/missionOwned.render.test.jsx`).

A synthesis teaches no new knowledge, so nothing is earned on the way: the student already owns the unit's keys and the six trainings
show which key each situation USES.

| Field (in `LESSON_CONFIG.mission` unless noted) | Default | Effect | Read in |
|---|---|---|---|
| `toolsOwned: true` | absent: tools are earned from the lesson's knowledge | Every tool is owned from the first screen, never 🔒. A tool is defined by the config alone, `{ id, label, emoji (or icon), usedIn: [modules] }`, so its `id` may be a knowledge item of ANOTHER lesson of the unit. Each tool carries `used` = one of its `usedIn` modules is completed. | `missionModel.js › missionTools`, `toolLit`, `toolProgress`, `sceneFill` |
| `tools[].usedIn` | `[]` (the key is never lit) | The modules that use this key. Only read with `toolsOwned`. | `missionTools` |
| `stationLabels: { [module]: label }` | the part of the module title after « — » | The short name of a station on the map, in « واصل: … » and on the arrival card. Unit syntheses use « وضعية الوحدة » (module 7) and « التحدّي 🏆 » (module 8). | `missionStations` (each station has `label`); `MissionMap`, `MissionHome`, `MissionLayer` |
| `climaxModule: <last module>` | — (existing field) | The 🏆 station is the lesson's last module (`BossFinal`); no bonus station follows it, then « التمارين ». Needs no new code; it is now tested. | `missionStations` |
| `checkpoints: []` | — (existing field) | No checkpoint is ever asked. Needs no new code; it is now tested. | `pendingCheckpoint` |
| `trainings: [1, 2, 3, 4, 5, 6]` | absent: no counter | The home shows « وضعيات تدريبية: n / 6 », counted from the completed modules. There is NO training star (a step is one try, so a star would be a grade). | `trainingsDone`; `MissionHome` (`data-mission-trainings`) |
| `hideStars: true` | absent: the ⭐ counter always shows | The ⭐ counter of the bar and the home is hidden **while it reads 0** and appears with the first lab star. It is not hidden for good, because a synthesis may have lab rounds (module 7) whose stars must show. | `showStars`; `MissionBar`, `MissionHome` |
| `durationMin` | `config.estimatedDurationMin` | The duration shown on the opening view. The catalogue value is untouched. | `openingMinutes`; `MissionHome` |
| `sittings: 2` | absent: nothing | The opening view adds « في جلستين ». Only the value 2 has a string. | `MissionHome` (`data-mission-sittings`) |
| `resumeInside: true` | absent: a module opens on its first screen | In the player, a `GuidedProblem` whose saved answers are restored jumps ONCE to its first open part, at that part's last page (`resumePart`). It never jumps if the student already moved, on a completed module, or outside the player. | `GuidedProblem` → `ContentModule` prop `resumeStep` |
| *(no `lessonProblem` in the config)* | — | The mission-title dialog of the bar shows `mission.title`, `mission.opening.text` and the scene instead of an empty window. | `MissionLayer` |
| step `shape` / `unit` / `subject` / `factor` (in `content/problems.js`) | absent: the bare box with `prefix` / `suffix` | A typed step of a guided problem is entered in its own shape. Contract: `EXERCISE_CONTRACT.md` § « قوالب الإجابة », « Typed steps of a guided problem ». | `guidedProblem.js › stepTemplate`; `NumericQuestion` prop `template` |

With `toolsOwned`, the home and the bar change as follows:

- The opening view says « مفاتيحك معك: » instead of « ستجمع في الطريق: » and the scene is full (`fill = 1`) on every screen.
- A **used** key is a filled amber chip with a ✓; an **owned, not used yet** key is a plain ring with its icon and label intact.
- The two states never differ by colour alone: the ✓ is the visible cue, and the accessible name says « استعملته » or « معك، لم تستعمله بعد »
  (`lesson.json › mission.toolUsed` / `mission.toolOwned`).
- The ring reads used / total under « مفاتيحي ». On the bar, a key flies to its place when it has just been used.

`opening.cta` was already config (« أجرّب » for a synthesis).

**What the pilot added or fixed (2026-11-10), reusable by every synthesis:**

- **The unit situation (module 7) plays its labs as rounds** (`LabRounds` behind `PlayerSwitch`; the teacher page keeps its workspace). Every
  synthesis-only lab gets a player version first (here `cone-cylinder` → `geometry/ConeCylinderPlayer.jsx`; `MANIPULATION_CONTRACT.md` «
  Sixteenth example »). `shadow-meet` takes `hideHeight` (a meet-only round whose height is a later step's answer) and the chain `why`.
- **`LabRounds`**: `easier.props` may be a FUNCTION of the main round's log (the practice numbers avoid what the student already saw);
  `easier.releases: true` — a practice win records 1 ★ (never fewer than the best) and announces the round as won, so the steps that wait for it
  open and a stuck student is never locked out of the pen steps nor of the 🏆. `roundsModel › missesOf` counts a question ONCE (at its end:
  right after retries, or revealed) — LabCheckpoint emits one event per try, and the wrong try + the right one used to count two misses.
- **Role scan FIRST** (`content/forbidden.js` + `content/mission.test.js`): module 8's signature by role and module 7's own answers, scanned in the
  six trainings, the memo cards (their BODIES too — the map is open), the knowledge map, the opening, « أستعدّ », the peer sheet and every round
  (`shownValues` / `shownValuesPlayer`, practice rounds included). Cards and map write the method in LETTERS (`content/textbook.js › CARD`);
  module 7 keeps its numbers at its own time.
- **Steps for both views**: module 7 gained a notebook screen (« اكتب في 3 أسطر »), the letter equality « TC/SK = □/□ » before the substitution,
  and a peer sheet (a wrong PLAN: Thales without the parallel) — text only, the teacher page sees them too. Links that leave the player
  (`BackLink` to a lesson) are `PlayerSwitch`ed out. The pause before the 🏆 is a line in module 7's footer (player only).
- **`resumeInside` really resumes now:** the questions of a guided problem restore their own saved answers BEFORE the problem restores its
  saved progress (child effects run first); their `onAnswered` used to mark the problem « touched », which blocked the jump and overwrote the
  saved progress with the partial one. `GuidedProblem` ignores those restoring calls and keeps the part-by-part maximum of both (walk: training
  4, reload after part 1 → the player reopens on part 2).
- **Answer shapes in a module** (outside `GuidedProblem`): `NumericQuestion template={stepTemplate({ kind: 'numeric', shape, unit })}` — without
  `kind: 'numeric'` `stepTemplate` returns `null` (a bare box).
- **Traps:** the data of a `sort` step are PLAIN text (`InfoSorter` writes them as they are: a « $ » showed raw — tested in `problems.test.js`);
  a figure component inside a paged step must be ONE `data-paging-keep` block (the pager hid the minaret's SVG children); a long memo example
  made `FitLine` oscillate (« Maximum update depth », teacher page) — `FitLine` now shrinks at once and grows again only when its frame's width changed; numbers with a Latin
  unit in a lab `lead` reverse in RTL (« 25 cm » → write « 25 سم »), and « h = 5 » in a `PredictTray` prompt needs Unicode isolates (no `$`).

*Not built:* the « smaller task » after a wrong training step (decided before the recipe binds); a home field announcing a station's minutes
(module 7 says « ≈ 30 دقيقة ثم التحدّي 🏆 » in its own header).

### The rule that breaks lessons most often

A step is done when the student **answered**, not when they answered correctly:

```jsx
onAnswered={(ok) => { if (ok) setQ2(true); }}   // ❌ dead end — the module can never complete
onAnswered={() => setQ2(true)}                  // ✅
```

The kit's question components call `onAnswered(isCorrect)` unconditionally and
reveal the correct answer; there is no retry loop. Gating a step on correctness
leaves `nextLink` undefined forever and locks the next module. This is a
**release blocker**, checked by `npm run check:non-blocking`. Full rule:
`LESSON_CONTRACT.md` § Progression non bloquante.

---

## 5. Questions, knowledge and textbook content

**Question components** (`lessons/common/kit`), formative, content modules only:

| Component | For | Key props |
|---|---|---|
| `TapQuestion` | single-choice MCQ | `prompt`, `above`, `options`, `correct`, `cols`, `explain`, `explainWrong`, `requires`, `onAnswered(ok, index)` |
| `BatchChoiceQuestion` | N rows, one correction at the last pick | `intro`, `rows: [{ id, label, options, correct, correction }]`, `feedback({allRight, nCorrect, total})`, `onAnswered(allRight)` |
| `NumericQuestion` | a typed number | `prompt`, `expected` (value or predicate), `parse`, `display`, `explainFor(n)`, `onAnswered(ok, n)` |

**Math in `batch` / `trueFalse` rows (2026-09-30).** `TextbookExercise` passes a row's string
options and its `correction` / `why` through `MathText`, like labels: write `$…$` there, never a
local wrapper.

**What a typed answer may look like.** Every parser accepts Arabic-Indic
(٠–٩) and Persian (۰–۹) digits; `NumericQuestion`'s default parser (`parseFr`)
reads integers and accepts a dot only as a well-formed thousands separator;
`TextbookExercise` numeric answers go through `parseDec`; fractions through
`Rational.parse`; integer sets accept `{…}`, `،`, `؛`, `,` and « و ». Never
write your own `Number(...)` parser in a lesson. Table:
`EXERCISE_CONTRACT.md` « Student input normalisation ».

**Knowledge** — `knowledge.jsx` is the single source of what the lesson
teaches. A `<KnowledgeBrick id="…">` in a module and the Knowledge Map render
the same item, written once. A brick establishes an id at the point it is
taught; a question declares what it needs with `requires={[...]}`. `requires`
has no runtime effect: it is the contract
`npm run audit:knowledge` checks, so that nothing is ever demanded before it is
taught. See `KNOWLEDGE_DEPENDENCY.md`.

**The Knowledge Map (approved architecture, 2026-09-29)** — the lesson's
knowledge is shown as a **progressive interactive learning map**: a Mind Map
(« الخريطة ») the learner discovers node by node along labelled relationships,
and its linear numbered reading (« المعارف مفصّلة »). Both read `knowledge.jsx`
(the mathematics) and `knowledgeGraph.js` (structure, relationships, and the
guidance layer — تذكّر · تحقّق · خطأ شائع · انتبه · نصيحة · خلاصة — taken from
the lesson's own exercises, questions and « أستعدّ », never invented). A node
is locked until the brick or completed module that establishes its item; the
map adds no progress and no mastery of its own. The model, types, authoring
rules and quality checklist are **`KNOWLEDGE_MAP.md` Part A**; the reference
implementation is `qasim-adad-tabii`, and all nine lessons of the unit carry the
map since the migration of 2026-09-29 (A.15 records what each one needed — read
it before authoring a graph: it lists the traps the tests now catch).

**Textbook content** — `content/textbook.js` holds the textbook's own words.
Every block carries a `source`, built with the `src(elementId, page, section,
number)` helper from `_unit/unitMeta.js`; anything the platform adds carries
`addition(reason)` and renders as « مثال تفاعلي إضافي », or as the reason's own
label when `textbook.additionReason.<reason>` exists (« عبارة إضافية من المنصّة »
for `prerequisite_diagnostic`). Render them with
`TextbookBox` (`kind`: definition, example, …), `SourceTag` and `MethodSteps`
from `lessons/common/textbook` (a `MethodSteps` line may be a React node since unit 10 — e.g. a calculator key sequence as LTR
`<kbd>`, never KaTeX; a fraction of Arabic WORDS is `WordFraction`). `npm run check:textbook` fails if an extracted
element has anything other than exactly one destination.

**Textbook figures — analyse, then reproduce or REDESIGN (owner rule, 2026-10-04, binding on every future lesson).**
The textbook gives the CONCEPT of a figure, not its drawing. Scanned figures are often cramped: a narrow strip, shapes
piled on one another, labels colliding with other labels or points (unit 11 act-1: C′ on C, E on L, H on P in a
2 : 1 strip). Before drawing any textbook figure:

1. **Analyse it**: what does each question need to SEE (which points, which arrows, which equalities)? Is the
   textbook drawing readable in a lab box of 354 px (the floor, `MANIPULATION_CONTRACT.md` §8bis « Screen floor ») — near-square, every label free, every shape distinct?
2. **Good → reproduce it** as GeoFigure data, faithfully.
3. **Not good → generate a better one with the SAME concept**: same mathematical situation, same named points and the
   same questions where possible, but a layout that reads — spread the shapes over a near-square grid, separate
   images that overlapped, move points so that no label collides, one tone per image. Then RECOMPUTE every answer
   on the new coordinates with the unit's exact module (never reuse the textbook's answers blindly), keep citing
   the same element (`src(...)`), and say it in ONE discreet line under the figure (`caption`: « أعادت المنصّة رسم شكل
   الكتاب بوضوح أكبر، بنفس المعطيات »). If the redesign changes an answer, the lesson shows the new one.
4. **Make it BIG and easy to see** (owner, the same day): a figure is read, not glanced at. A grid figure displays at
   540 px by default (`GeoFigure` `maxWidth`), any figure with more than ~6 named points at ≥ 480 px; never shrink it
   to fit beside text — put it on its own row. On a phone it takes the full width.
5. **Measure it**: `figureQuality(fig)` (`lessons/common/components/geoFigure.js`) returns the defects — a strip
   (aspect > 2 : 1) or a label colliding with another label or point. Every lesson's `content/figures.test.js` asserts
   `figureQuality(fig)` is empty for each figure (a figure of collinear points passes `{ maxAspect: Infinity }`
   with a comment saying why).

The rule holds everywhere a figure is drawn: modules, the final test, the practice bank (`statement.figure`),
the unit page's تحدّ, and a lab's textbook level.

**Figures in SPACE (unit 14, 2026-10-05).** A solid is never a GeoFigure: it is `SpaceFigure`
(`lessons/common/components/SpaceFigure.jsx` + `spaceFigure.js`, `kind: 'space'`) — 3D points with z up, an orthographic
`view { azimuth, elevation }`, `solids` (sphere + equator, polyhedron from faces — `cuboidPoints` / `cuboidFaces` name a pavé the
textbook's way —, vertical cylinder / cone / frustum), `circles` (`on` a sphere: back half dashed), `planes`, `sections`, `segments`,
`rightAngles`. Hidden lines are dashed BY COMPUTATION, as the textbook draws them (« الجزء الخلفي بخط متقطّع »). The same rules apply —
analyse, redesign when needed (a plane seen edge-on: turn the view), big, measured by `spaceFigureQuality(fig)` = [] in
`content/figures.test.js`. A flat figure inside a space problem (the right triangle OAM of a section, the axial section of a frustum
for Thales) stays a GeoFigure.

### Values in story contexts (owner rule, 2026-10-10)

Every word problem — in a module, a « مسألة », a textbook situation or a practice exercise — sets its situation
in a scene that carries a good value or deed: إتقان العمل، القراءة والعلم، الصدق والأمانة، العطاء والتكافل،
التعاون، برّ الوالدين، احترام الوقت، النظافة، حبّ الوطن. Rules:

- **Context only.** Numbers, quantities, conditions, answers and ids never change; the question asked stays
  mathematically equivalent. A pure-math item (« احسب… ») gets no invented story.
- **Woven, not preached**: one clause or sentence, short enough for a phone; rotate the values inside a lesson
  rather than repeating one. Religious phrasing (« الإنفاق في سبيل الله »، « صدقة جارية ») is welcome but sparing.
- A hint, an explanation or a test that recaps the story must be updated with it.
- Applied to unit 1 on 2026-10-10 (≈ 180 stories) and **extended to units 2–14 on 2026-10-13** (all lessons: مسائل,
  `lessonProblem`, platform texts, story exercises of `content/practice`); the unit-card challenge `textAr` was reworded
  for units 2, 5, 6 and 11 (`units_4am_2026_2027.json`, together with the lesson's `CHALLENGE.text`). New lessons follow the rule from the start.
- Extension checklist (units 2–14, 65 lessons) and the six places to touch per lesson:
  [`reports/UNIT1_REFERENCE_CHANGES_2026-10-13.md`](../reports/UNIT1_REFERENCE_CHANGES_2026-10-13.md) §1.
- Textbook-derived situations were reworded on the platform; `docs/sources/**/extraction.json` keeps the
  verbatim textbook wording (`check:textbook` still passes). The unit page's « تحدّ » card reads the curriculum
  `textAr` (`packages/core/curriculum/dz/units_4am_2026_2027.json`), reworded for unit 1 to match
  `bahth-pgcd/content/textbook.js › CHALLENGE`: change both together.

### Discovery pass on module text (unit 1 pilot, 2026-10-09)

A lesson's text must not state the law before the student has produced it (same principle as MANIPULATION_DNA §16, applied to
words). When writing or reviewing a module:

1. a manipulation `lead` names an **observation to make**, never the conclusion (« لاحظ ماذا يحدث لـ… », not « لاحظ أنّ… لا يتغيّر »);
2. a task describes the **action**, not the rule (« وزّع على حصص متماثلة », not « اقسم على قاسم مشترك »);
3. a step title carries no answer (« إلى أيّ عدد نختبر؟ », not « لماذا نتوقف عند 10؟ »);
4. an explanation or lead does not use a tool taught later (no √ bound, no « بالخاصية » before the property is seen);
5. the completion message and a `predictPrompt` are **questions**, and refer to what the student SAW, not to the module's conclusion;
6. a `PredictRule` sits right after the student produced the material for a name or method — the name is asked for, then given.

Applied to unit 1 (2026-10-09) and **extended to units 2–14 on 2026-10-13** (step titles/subtitles turned into questions, leads that
stated the law rewritten, `predictPrompt` hints removed, some bricks moved after the answer). One contract detail: a question whose
`requires` names a brick placed AFTER it fails `audit:knowledge:gate` (`E_REQUIRES_ESTABLISHED_LATER`) — when the brick is moved after a
discovery question, drop that question's `requires` (the brick then follows the student's answer). Checklist in
[`reports/UNIT1_REFERENCE_CHANGES_2026-10-13.md`](../reports/UNIT1_REFERENCE_CHANGES_2026-10-13.md) §2.

---

## 6. Manipulations

Read [`MANIPULATION_DNA.md`](../architecture/MANIPULATION_DNA.md) **before designing
one** (why), then [`MANIPULATION_CONTRACT.md`](../architecture/MANIPULATION_CONTRACT.md)
before touching one (how). In short:

**Living worlds (2026-10-13, owner directive).** The documented patterns are a floor, not a ceiling. When a concept is a
law that many objects obey, prefer a WORLD where the hand holds the cause, predictions are classified by misconception model,
the student WRITES the law and the world tests it on every object, and a companion only asks questions — never the rule. The
pattern, its gate and its tests are in [`MANIPULATION_DNA.md` §16](../architecture/MANIPULATION_DNA.md); reference
`geometry/ShadowWorld.jsx` + `logic/shadowWorld.js`.

- **Design from the mathematics, not from a widget.** Fill the DNA's design sheet
  (§7) in the component header first. Name the VARIABLE the finger controls, the
  RESISTANCE (how the mathematics refuses), the CONTRAST that opens the discovery
  and what stays INVARIANT. If a button could replace the gesture without loss, the
  lab is not causal yet. Never copy another lesson's lab with new colours: the
  platform must not converge toward one manipulation style (DNA §12).
- **Two readings of one division are never switched silently.** When b means
  "number of groups" in one lab and "size of a group" in another, render
  `DivisionRoles` under the equation and put both readings side by side before
  the question (DNA §8; reference: `qasim-adad-tabii` module 1).
- **Orientation is not an answer** (DNA §9). Question options must not carry the
  evidence (« … تبقى 4 كتب »); list the student's **own** trials above the question
  instead (`[data-activity-evidence]`, module 1 of the reference lesson). A
  knowledge-brick lead must not state the next question's answer.

- **One screen, no scroll (owner rule, 2026-10-01 — every manipulation).** The
  object, every control that acts on it and the reading it produces fit ONE
  viewport (1920 × 1080 down to 768 × 1024 / 1024 × 768 — tablet and laptop only): the stage height is budgeted from
  `100dvh`, countable objects shrink with the scene, handles sit beside what
  they move, secondary material goes below. A lab whose sliders are a scroll
  away from the figure they change is not done.
  For a large activity the student chooses what to see: secondary blocks are
  hidden / shown with `primitives/LabFold.jsx`, and a gauge or counter may
  float on the scene in `primitives/MovablePanel.jsx`, which the student
  drags aside (pointer or arrows) — never write a local version of either.
  Many objects form a near-square block (32 agents = 6 × 6), never a strip.
  [`MANIPULATION_CONTRACT.md` §8bis](../architecture/MANIPULATION_CONTRACT.md).
- **One visual language (2026-10-14).** A new or redesigned lab composes the shared kit — `primitives/LabKit.jsx`
  (PromptCard, ChoiceCard, StepperCard, NamePill, VerdictBanner…), `primitives/SvgPill.jsx` (value pills, dimensions) and, when
  people are measured, `primitives/KidFigure.jsx` (a drawn child whose crown IS its height) — never a local look-alike. Reference:
  `operations/StoryBars.jsx`; contract [`MANIPULATION_CONTRACT.md` §8ter](../architecture/MANIPULATION_CONTRACT.md).
- **Always push the UI/UX to the limit — Gen Alpha, 11–13 (owner rule, 2026-10-14, every generation).** A lab that only
  « works » is not done: build each new or redesigned manipulation to the best finish you can produce — a rich drawn world,
  the shared kit, physical gestures with purposeful micro-animations, immediate visual feedback in the student's numbers
  (never the rule), one screen at four sizes, honest drawing — and REVIEW screenshots of the initial and mid-activity states
  at 768 / 1024 / 1280 / 1366 before finishing. The full bar:
  [`MANIPULATION_DNA.md` §17](../architecture/MANIPULATION_DNA.md); gold-standard question 6 (§14).
- **Say it ONCE (owner, 2026-10-14).** Gen Alpha does not read repeated text: the question lives in the lab's prompt card (no
  shell `mission` on a kit lab), the gesture in one line, the story mapping in a one-line `lead` (« كل قفزة = عقد من 17 لؤلؤة. »)
  — a lesson's `lead` never restates the question, the gesture or the strategy. Hints are closed by default, short thinking
  questions. [`MANIPULATION_DNA.md` §17.7](../architecture/MANIPULATION_DNA.md).
- **Context, then ONE direct question — no title (owner, 2026-10-14, every lab).** The top of a lab is the context in one or two
  plain sentences with every given, then one question/instruction that names the goal and the end state (« اربط الأقلام حتى
  تستطيع كتابة عدد الأقلام. »). A lesson passes no lab `title` that only names the lab or poses a riddle (« صناديق وعلب وحزم وأقلام: كم
  قلمًا في الورشة؟ » was the counter-example). **No ambiguity:** every card row, number, pill or button on the stage sits under
  its own question/label that says what to do with it (three bare prediction cards « 1 132 437 · 2 577 · 75 » were the
  counter-example). [`MANIPULATION_DNA.md` §17.9](../architecture/MANIPULATION_DNA.md).
  How (kit labs, 2026-10-14): the shell gets `titleHidden`, the `PromptCard` its `context` slot (`MANIPULATION_CONTRACT.md` §8ter);
  on the five 1AM kit labs a lesson's `lead=` REPLACES the lab's default context on the authored level, so it must carry every number
  (« عندنا 253 لؤلؤة، وفي كل عقد 17 لؤلؤة: كل قفزة على المستقيم طولها 17، أي عقد. ») — otherwise pass no `lead`.
- A manipulation is a **tactile laboratory**: the student moves a real object
  and the notation appears as a consequence. Never an animated explanation,
  never a quiz.
- **Exactly two levels, everywhere: `beginner` (مبتدئ) and `advanced`
  (متقدم).** There is no other manipulation-level system — the old four-palier
  ladder (اكتشاف · موجّه · استقلالية · تحدّ) was removed on 2026-09-24. Every
  type declares its pair in `manipulations/levels.js`; a manipulation posed
  alone shows the مبتدئ / متقدم selector in its own header, and the lesson's
  numbers are always one of the two levels. **One selector per
  manipulation**: inside a `ManipulationWorkspace` the workspace owns it and the
  manipulations inside show none; a standalone `<Manipulation>` placed in a
  later step shows its own (MANIPULATION_CONTRACT « One selector, never
  two »). Call lesson callbacks through `state.report(onFinished, …)` so the
  other level never ticks a lesson step. Full contract:
  [`MANIPULATION_CONTRACT.md` §7](../architecture/MANIPULATION_CONTRACT.md).
- **One lab per level, and no silent switch.** A beginner level is ONE
  laboratory, finished by the gesture that carries the idea (for
  `common-divisors`: placing the *largest* number of identical groups).
  When an advanced level chains a second laboratory (groups → divisor lists),
  the move is **the student's gesture**: a card that says what was found and
  what comes next, a button, and a way back. Never swap the scene for another
  one on a hidden threshold — the student reads it as « a different
  manipulation appeared ». See
  [`MANIPULATION_CONTRACT.md` §7quater](../architecture/MANIPULATION_CONTRACT.md).
- **Two levels, one workspace.** Where a manipulation is pedagogically
  appropriate, the module opens on a `ManipulationWorkspace` offering
  **مبتدئ** and **متقدم** — never two stacked manipulations, never a second
  page. Both levels stay mounted, so switching never loses what the student
  built. Full rule and data model:
  [`MANIPULATION_CONTRACT.md` §7bis-levels](../architecture/MANIPULATION_CONTRACT.md).
- **The default level serves the module's task.** A module carrying a textbook
  activity (« نشاط N » in its title, a first step waiting on `onFinished`)
  must `defaultLevel="advanced"` so that activity is what opens. Otherwise the
  lesson's own activity hides behind a tab and the step cannot be satisfied.
  Name the numbers in the lab title, so the student sees which activity is
  open.
- **The textbook owns the mathematics; the platform owns the experience.**
  The concept, definition, method, notation and objective come from the
  textbook and never change. The *situation* dressing them may be replaced by
  one that a 4AM student engages with faster — but only when the mathematical
  structure survives intact, and **never silently**: the resource declares
  `experience: { type, reason, theme }` and keeps its `sourceElementIds`.
  `validate:lessons` fails on a missing level, a divergent objective, an
  `advanced` level with no `autonomy`, or an adapted context with no reason.
- **Do not force a context.** When the textbook's own situation is already
  manipulable and the drawing *is* the argument (the rectangle of points, the
  divisor lists), keep it at both levels and vary the cognitive demand
  instead. A theme bolted onto a list of divisors hides the mathematics.
- The type registry is **closed**. Content names a `type`; it never supplies a
  component. The forty-four types (ten for unit 1, three for unit 2, two for unit 3, four for unit 4, three for unit 5, four for unit 6, five for unit 7, four for unit 8, five for unit 9, four for unit 10) live in
  `packages/core/curriculum/manipulationTypes.js` (data) and
  `manipulations/manipulationRegistry.js` (components).
- **Reuse before writing.** The existing types are reused across lessons by
  changing props alone. Write a new type only when the mathematical idea or the
  gesture genuinely differs.
- Embed it in the module's `intro` slot so it is usable immediately, with no
  question or button between the student and the instrument.
- **`onFinished` is not completion.** It fires when the manipulation reaches its
  formal phase. It never completes a module, writes progress or produces
  evidence. A step may WAIT on it only when the manipulation is the module's
  own textbook activity, opened by default, and its formal phase is reachable
  for its numbers (four steps of the unit do this); otherwise use it for
  presentation only. Full rule: MANIPULATION_CONTRACT §7bis.
- **Draw real objects as real objects.** If the lesson talks about books on
  shelves, draw recognisable books on shelves, in parameterised inline SVG with
  Arabic labels as DOM text — not abstract bars. The drawing *is* the
  mathematical argument: 420 books means 420 drawn books. Never a generated
  raster image (root `CLAUDE.md`).
- **Every lesson has its own drawn world, and the world is a `theme`.** The
  pitch and the library are the reference; the other lessons open on bricks
  (`construction`), bouquets (`garden`), school bags (`school`), ribbons
  (`workshop`) and a recipe (`kitchen`). To reuse one, pass `theme="…"` to
  `<Manipulation>` and declare it in `resources[].experience.theme` — the
  objects come from `primitives/itemThemes.js`, the Arabic words from
  `lesson.manipulation.json` (`themes.<id>`, keys `lesson:manipulation.themes.<id>`), the scene from `GroupingScene`,
  `BrickWall` or `RibbonStrip`, and the card vignette from `ContextScenes.jsx`.
  Never write a second grouping scene or hardcode a theme's words in a
  component. Never give drawn countable objects a fixed pixel size either:
  they must read from the back of a classroom, so they scale with the
  scene's width (`itemSizeCss` — ×1 phone → ×2 projector; see the contract,
  « Objects are sized for the back of the classroom »). The full table, one line per lesson, is
  [`MANIPULATION_CONTRACT.md` §2bis](../architecture/MANIPULATION_CONTRACT.md).
  A world earns its place only when it shows the structure (whole bricks,
  a cut, identical groups); where the textbook's abstract drawing already *is*
  the argument (the rectangle, the divisor lists), keep it.
- **People are the platform's CHARACTERS — `KidFigure`, never a one-off (owner, 2026-10-14).** Whenever a lab or a
  scene shows a pupil (a height on a gauge, a team, a queue, a class), draw it with `primitives/KidFigure.jsx` (geometry
  `primitives/kidFigure.js`, tests `primitives/labKit.test.jsx`, contract
  [`MANIPULATION_CONTRACT.md` §8ter](../architecture/MANIPULATION_CONTRACT.md)). The cast:

  | Who | How they are drawn |
  |---|---|
  | **Girls** | ALWAYS in Islamic dress: `hairStyle="hijab"` + a `scarf` from `SCARVES` (`rose`, `lavender`, `mint`, `sky`, `sand`) — the scarf covers the head, ears and neck and is draped over the shoulders and chest, with a forehead band and a pin — and a long tunic over wide trousers (automatic with the hijab). There is NO uncovered-hair style for a girl. |
  | **Boys** | a hoodie (hood, drawstrings, kangaroo pocket), `hairStyle` `short` or `curly`, `hair` from `HAIRS`. |
  | **Everyone** | an 11–13-year-old with a friendly illustrated face; `skin` from `SKINS` (vary it across a scene), `outfit` from `OUTFITS`, `mood` `happy` (default) · `wonder` (still unknown, thinking) · `proud` (just solved) · `neutral`; `unknown` + `mark="؟"` puts a « ؟ » badge on the chest of the person whose value the student is looking for. |

  How to use it:
  ```jsx
  import KidFigure from '../primitives/KidFigure';
  // in the scene's SVG: the crown is EXACTLY `top`, the soles touch `foot`
  <KidFigure cx={x} top={g.yOf(130)} foot={g.floor} hairStyle="hijab" scarf="rose" outfit="pink" skin="light"
    mood="happy" data-sb-person="sara" data-height={130} />
  ```
  - **The drawing is the measure.** If a height matters, the floor is 0 and the crown is the value on the same scale as
    the ruler — a child floating above the ruler's zero (as in many mockups) is a wrong lesson.
  - **A stable cast per lesson.** Give each named person ONE look in a `LOOKS` map inside the lab (story-bars:
    `sara` rose hijab + pink tunic, `rim` lavender hijab + violet tunic, `amine` blue hoodie…), so every student sees the same
    سارة; `kidLook(index)` is only a deterministic fallback. Names come from the textbook or are Algerian first names, with
    the word « زميل / زميلة » the textbook uses.
  - **Read it with the kit:** a value pill above the head (`SvgPill`, `pointer="down"`), a name pill under the feet
    (`NamePill`, filled for the person the student holds), a difference as `SvgDimension` without a sign (« 6 cm », not
    « +6 cm » — the drawing must not dictate the operation).
  - Need something the character cannot do yet (sitting, holding an object, another age)? Extend `KidFigure` and its
    tests — never draw a second, local person, and never use a raster or generated image.
- **Manual first, then « let the lab finish it ».** When a manipulation's
  gesture *repeats* once understood (carrying 20 players into 4 teams, cutting
  the short ribbon a 12th time), the type may offer a student button that
  completes the rest — « أنشئ الفرق », « أكمل الفروق », « أكمل القسمات ». It
  is declared in the registry (`controls.autoComplete: { unlock: 'config' |
  'first-gesture' }` — all three types use `'first-gesture'` since 2026-09-30:
  one full example by hand first) and implemented as `controller.autoComplete` on the
  type's **own** pure logic, so it reaches exactly the state the hand would.
  It never removes the manual gesture, never fires without a click, never
  triggers the discovery, and is **never** added where each gesture is a
  choice or an answer (a divisor, a column count, which chips are common). A
  module does nothing to get it: it comes with the type. Rule, audit of the
  ten types and recipe:
  [`MANIPULATION_CONTRACT.md` §6bis](../architecture/MANIPULATION_CONTRACT.md).
- Students never see a وضع القسم toggle inside a module: `allowModeSwitch`
  defaults to `false` everywhere. That is a standing owner rule. It is unrelated
  to the platform's Classroom Mode.

---

### 6ter. The lab prototype — MANDATORY for every new lab and lesson (owner, 2026-10-28; rollout to the 112 existing lessons finished the same day)

The prototype validated on `maqlub-qismat-kasrayn` (reference lab `proportion/GearCrank.jsx`) is no longer "in progress": it is the **standard**.
A generated lesson is NOT done until `node apps/web/scripts/lab-rollout-status.mjs --lesson <id>` prints ✅. The full definition of "done"
(L1–L9 for a lab, C1–C6 for a lesson), the procedure, the content-quality rules and the browser walk-through are in
[`../reports/LAB_PROTOTYPE_ROLLOUT.md`](../reports/LAB_PROTOTYPE_ROLLOUT.md) §2–§6 — read them BEFORE writing a lab; contracts:
`MANIPULATION_CONTRACT.md` §8quinquies, `KNOWLEDGE_MAP.md` « The memo card ». What a new lab and lesson must contain from the first commit:

| Piece | Rule (short; details in the rollout doc) |
|---|---|
| Questions over the lab (L1) | `useLabCheckpoint`: after EACH task/step, 2–4 questions on what the student just DID, built from the task's own numbers, 2 hints each, the last chain ends on the RULE (the old `ManipulationDiscovery` moves into the card). Data: `CHAINS` + `QUESTIONS` in the lab file; strings in `lesson.manipulation.json › <lab>.cp.*`. Mandatory for students |
| Teacher switch (L2) | `useLabCheckpointSettings('<type>')`, `chain` only if `s.enabled`, `headerAction={s.control}` |
| Stepper (L3) + celebration (L4) | `LabStepper` (never hand-made dots), `useStepCelebration()` once per step, re-armed after « إعادة » |
| « إعادة » (L5) | restarts EVERYTHING from task 1 (state, trials, questions via `resetKey`) |
| Sound (L6) | `playSfx` only (gesture · `bell` · `flag` · `over`), off by default, the shell's « الصوت » switch |
| Full screen (L7) + guided (L9) | `immersive` stays on; the scene stays usable full screen; `guided={!!chain || ruleByCheckpoint}` so only the stepper guides |
| Tests (L8) | a render test over every task of every level (text, 2 hints, one right answer, no raw key / `{{`) and the guided-mode assertion — model `gearCrank.render.test.jsx` |
| Memo card (C2–C3) | every content-module footer is `<KnowledgeSnapshot moduleNumber={n} variant="memo" />`; every `knowledge.jsx` item carries `memo: { rule, hook, example, trap, exam, chip, quiz }` written in ONE pass (`memoContent.test.js` checks it) |
| Module steps (C4) | the steps under a lab keep only the TRACE of what the lab asked (`answered(id)` ← `checkpoint-done`), then the bricks — they never ask again (model `Module01Nashat.jsx`) |
| Lab onboarding | `LabCoach` as before (§6 / MANIPULATION_CONTRACT §8quater) — it is a separate layer, both stay |

Do not modify the shared pieces (`LabCheckpoint`, `labCheckpoint.js`, `LabSteps`, `MemoCard`, `MemoQuiz`, `playSfx`) to fit one lab: fix a proven bug there,
test it, and note it in the rollout doc §10. Do not invent a second question gate, stepper, celebration, sound set or end-of-module card.
A new lab TYPE is built to the prototype first, then to the DNA design sheet (§6, `MANIPULATION_DNA.md` §7): the prototype is the shell
around the world, not a substitute for a causal design.

---

## 7. Exercises

Read [`EXERCISE_CONTRACT.md`](../architecture/EXERCISE_CONTRACT.md). Two
different systems, often confused:

| | In-lesson exercises | The practice engine |
|---|---|---|
| Content | `content/exercises.js` in the lesson | JSON under `content/practice/<grade>/<lesson>/level-{1..5}/` |
| Rendered by | `TextbookExercise` inside a module | `PracticeSession` in the student space |
| Purpose | أوظّف تعلّماتي — the textbook's exercises | levelled training, separate from the lesson |
| Evidence | **never** — they are instructional (D9); their `learningPointId` is documentation | yes, a second evidence source, **judged by the server** |

**Two answer-input standards (owner, 2026-11-09) — binding for every question you write:**
1. **« الإجابة تُكتب في شكلها »** — a typed answer is drawn as the mathematics it completes: put the unknown as « … » in the
   statement's formula, or name the target form in `answerFormat` (« يُكتب $A$ على الشكل $ax + b$ : اكتب العدد $b$ فقط »),
   name the unit (« عدد بالدينار (دج) »), say « كسر » for a fraction. `templateFor()` turns that into the input; never rely on the
   placeholder to explain the form. Contract: `EXERCISE_CONTRACT.md` § « قوالب الإجابة ».
2. **A formula never breaks across two lines** — widen the card or let the formula's row scroll; never let it wrap.
   In a fixed narrow column (a lab's side column in the mission player) put the line in `components/FitLine.jsx`: its font
   shrinks just enough to fit (never below `MIN_FIT` 0.55). `EquationDisplay` does it for every lab since 2026-11-10 — a flex
   item without `min-w-0` overflowed the column to the LEFT in RTL and was clipped there, unseen by `data-fit-overflow`.
   Contract: `EXERCISE_CONTRACT.md` § « A formula never breaks ».

**The practice bank is written as BEM exam sheets — the standard since 2026-10-06.** A new or
reworked bank is 50 exercises (10 per level), each carrying `metadata.exam`: official papers from
the 2007–2025 annals (« BEM <year> », word for word, official solution), adapted ones (other
numbers) and « على منوال BEM <year> »; level 5 holds « الوضعية الإدماجية (08 ن) » sheets. Each
question is a STEP (`step`, `sub`, `solution`, optional `work`, `timeSeconds`, `counted: false`
for a step of another lesson or year). Which annals exercise belongs to which lesson is fixed by
`docs/sources/4am/bem-practice/annals-index.md` (cite each exercise ONCE). Format and rules:
`docs/sources/4am/bem-practice/brief-authors.md` and `EXERCISE_CONTRACT.md` § « Présentation
examen (BEM) ». The lesson switches to the BEM levels page when it is added to
`content/practice/exam-style.json`, after its audit; until then it keeps the classic page.

**How the practice player presents a multi-question exercise** (question
history, «السؤال السابق», the hint ladder, tones, focus) is specified in
`EXERCISE_CONTRACT.md` § « The practice player — screen contract ». Authoring
consequence: a question may lean on the previous one's result («هذا الدنّ»),
because the student now sees the previous statement and **their own** answer
right above the current question — but never the expected answer, so the
statement must still be solvable from the student's own work. Put shared data
in the exercise `statement`, not in question 1.

An in-lesson exercise entry carries `id`, `source`, `learningPointId`,
`difficulty`, the textbook `statement` word for word, an `interaction` naming
how it is answered (`choice`, `integerSet`, `trueFalse`, …), the `question`
itself, and optionally `method` and `commonError`.

Whatever you validate with, return the canonical result shape
`{ isCorrect, fields?, feedback? }`, and remember that it says nothing about
progression. Assessment questions — the only ones that generate evidence — may
live **only** in an `evaluation`-stage module, carry
`assessment: { enabled: true, type: 'assessment', learningPointIds: ['…'] }`
(one point) or `learningPoints: [{ code, role: 'primary' }, { code, role:
'secondary' }]` (several — exactly one primary), a numeric-literal `correct`,
and optionally `difficulty: 1..5`. Every code must belong to this lesson. See
`AI_LESSON_CONTRACT.md`.

**What happens to an answer (Mastery V2).** `BossFinal` sends the student's
ANSWER (`submitEvidence(question, { picked })`), never its verdict. The
server finds the question in the assessment-item registry (built from your
JSX by `smarter:import-content-registry`), judges it against `correct`, and
updates the Learning Point state through the versioned mastery engine.
Consequence for authors: **after adding or changing a final-test question,
run the registry import** (`php artisan smarter:import-content-registry`), or
the server answers 422 « unknown item » — the queue keeps the answer until it
is imported. A practice exercise that should count toward mastery belongs in
the practice bank (`content/practice/**`), not in `content/exercises.js`; the
exercise contract (`EXERCISE_CONTRACT.md` § « Mastery V2 additions ») lists
the fields a generated bank carries (`templateId`, per-question
`difficulty`, …).

**The final test shows options in a stable shuffled order** (2026-09-29).
Authors habitually put the right answer first; `BossFinal` therefore displays
each question's options in a per-question order seeded by its `id`
(`optionOrder`, `kit/testPresentation.js`) — the same on the student page and
on the board. Keep writing `correct` as the index in YOUR `options` array: the
picked index, the attempt, the evidence and the registry stay in your index
space. Set `keepOrder: true` on a question whose options must keep their
written order (a scale, « صحيح / خاطئ »). And the trophy « أتقنت … » /
`completion.masterTitle` appears only after a PERFECT attempt (every answer
right and every declared badge), never on a partial one.

**Every practice question is also a daily-challenge candidate** (« التحدّي
اليومي », 2026-09-25): once a student has worked a Learning Point, its
published practice items can be served ALONE, one per day, to retrieve it.
Write each question so it stands on the exercise statement plus its own text,
give it an honest per-question `difficulty`, and make `feedback.correct` a
one-line explanation — `EXERCISE_CONTRACT.md` § « A practice question may be
served alone ». More distinct items per point = better spaced retrieval
(the selector prefers items the student has never seen).

**`teachesLearningPointIds` now drives three things** — « ما التالي؟ » after the
test, the Knowledge Map's mastery overlay, and the soft-gate hint — so declare it
on every learning module. `requiresLearningPointIds` produces a review HINT,
never a lock.

**The results screen of the final test shows two different things**, and
never mixes them: « نتيجة هذا التحدي » (this attempt's score, and per skill
with neutral ✓ / ~ / ✗) and « حالتك على الكفاءات »
(`LessonLearningPointsStatus`, the Learning Point states from the server).

---

## 8. Classroom Mode

**You do not implement anything.** A lesson built with `buildLessonRoutes` and
modules built with `ContentModule` are already presentable: the lesson shell is
in the route factory, the entry button is in `LessonIndex` and `ModuleLayout`,
and `ContentModule` derives the presentation units.

Two things you get for free, and how to write for them (2026-10-13): **an entry page** per module (title +
« ماذا سنتعلّم » = your step titles, or an `objectives` array on `ContentModule` — write short
sentences or questions) and **pages** inside a step too tall for the screen. For pages, write a step's
content as one wrapper `<div>` whose **direct children are whole blocks** (a brick, a question, a figure):
the engine only cuts between blocks. See `CLASSROOM_MODE.md` § « Pages ». Every `ContentModule` of the 74 lessons now carries
`objectives` (2–4 short points, questions on discovery modules).

### Tests present themselves — never write a test UI

A module built on `PrerequisiteDiagnostic` (module 0 « أستعدّ ») or `BossFinal`
(the final test « إختبار أولي ») **automatically** gets the full fullscreen test
presentation, with no prop to pass and nothing to wire:

| In وضع القسم | What the teacher gets |
|---|---|
| one question at a time | the screen belongs to the question, not to a scrolling list |
| `السابق` / `التالي` | question-by-question navigation, with a compact navigator ≤ 12 questions |
| « تحقّق من الإجابة » | validates **only** the current question; never ends the test, never auto-advances |
| « كشف النتائج » | reveals every question, using the *same* evaluator — one corrector, never two |
| review | after revealing, `السابق` still walks back question by question; the summary never replaces it |
| answer state | answering question 2 and coming back leaves question 1 exactly as it was |

Your lesson supplies **data** — `questions` / `epreuves` — exactly as it does
today. The presentation reads the engine's own evaluator, so your scoring,
thresholds, learning points, evidence and attempt persistence are untouched.

**Three rules, all of them defects if broken:**

- **Never write your own test presentation**, fullscreen screen, per-question
  validation or second corrector. There is one implementation,
  `kit/TestPresentation.jsx`, and both engines consume it.
- **Answering is not succeeding.** A question is `unanswered` → `answered` →
  `correct`/`incorrect`; nothing may reveal correctness merely because an
  answer was entered. Never key UI off "answered = correct".
- **Per-question validation lives in وضع القسم only.** On the student page the
  final test stays silent until its single « أرسِل إجاباتي ». It is a
  teacher-at-the-board gesture; do not add student-facing reveal controls, and
  do not name a role anywhere — authorization is already centralized.

Contract and DOM attributes: [`CLASSROOM_MODE.md`](../architecture/CLASSROOM_MODE.md)
§5 *Test*. Pure logic and its tests: `kit/testPresentation.js`.

What you must not do: write your own fullscreen, scroll lock, Escape handler,
toolbar or scaling. There is exactly one implementation of each.

What you must do if you write a **custom** presentable component: wrap it once
in `ClassroomPresentation`, keep all state inside the wrapper, read
`useClassroomMode()` for `scale` and `area`, use `ClassroomFrame` for
page-authored content and `ClassroomHidden` for chrome that has no place on a
projector, and never conditionally mount on `isClassroomMode` — toggle `hidden`
instead, or the state is lost. Portals go through `useClassroomPortalTarget()`.
See [`CLASSROOM_MODE.md`](../architecture/CLASSROOM_MODE.md) §11.

---

### Free or premium is not your lesson's decision — you do nothing

Whether a lesson is free or premium is an **administrator decision** stored in
`lessons.tier` — the single source of truth. **Never write a `tier` anywhere**:
not in `lesson.config.js`, not in `dz/lessons_*.json`, not in `coursesData.js`,
and never a list of free or premium lesson ids. `check-dormant-isolation.mjs`
fails the build if a catalogue lesson carries a `tier`.

What happens to a lesson you add:

```text
new lesson in the catalogue → smarter:import-curriculum (locally, and on every deploy)
  → created in `lessons` with tier = free   (creation default, not a classification)
  → appears in /admin/contenu/lecons, filterable by its الوحدة
  → the administrator may switch it free ↔ premium at any time
  → every later sync or deploy keeps whatever the administrator chose
```

The student side follows automatically: `LessonAccessGate` (put around every
page by `buildLessonRoutes`), `LessonIndex`, `ModuleLayout` and `LessonCard`
read the server's decision from `ContentAvailabilityContext`, and the server
refuses every write on a locked lesson (`ContentAccess`). Contract:
`docs/architecture/ADMIN_PANEL_ARCHITECTURE.md` « Le palier du contenu ».

### A teacher may hide your lesson from a class — you do nothing

A teacher (الأستاذ) can hide a published lesson from one of their classes
(الأقسام). That is a per-class row in `classroom_lessons`, composed by
`ContentAccess` on the server as a third axis beside publication and tier; the
student UI shows the lesson as « أخفاه الأستاذ » through
`ContentAvailabilityContext`. **A lesson never checks visibility, never knows
about classes, and never branches on the reader's role.** Do not add
teacher-specific behaviour, props or copy inside `lessons/`. Contract:
`docs/architecture/TEACHER_CLASSROOM_ARCHITECTURE.md` §3.

### A teacher reads your lesson with every module open — you do nothing

The same teacher opens your lesson in their own space, jumps to any module —
and to any **step inside it**, in any order — and nothing they do is recorded
as progress. That is the *reader*
(`features/learning/learningViewer.js`: `freeNavigation`, `tracksProgress`),
applied once in `ModuleLayout`, `LessonIndex` and the progress hooks through
`lessons/common/utils/moduleGate.js`, and once more for the steps through
`lessons/common/utils/stepUnlock.js`. A module must therefore never assume it
is reached in order, nor that its steps are played in order, and must never
call the progress API itself: use `useProgress`, `useEvidenceSubmission` and
`useFinalTestAttempt`, which are already silent for a non-learner.

**Never pass `locked` to a `StepCard` yourself.** Declare your steps with
their `done` flag and let `ContentModule` own the gate — it is the single
place where the reader is consulted, and a hand-rolled lock would re-close
for a teacher what the policy just opened. `pages/teacherContract.test.js`
fails the build if a lesson under `lessons/moyen/` does it.
Contract: `TEACHER_CLASSROOM_ARCHITECTURE.md` §8b.

### Your lesson feeds the teacher's « مذكرة الدرس » — keep these shapes

Every built lesson gets a teacher orchestration page,
`/enseignant/cours/<id>/memoire`, **generated from your files** by
`features/teacher/lessonMemo/buildLessonMemo.js` — nobody writes it. What
you author therefore shows up there, and what you omit leaves a section
empty (never filled with invented text). To make it useful:

| You write | It becomes in the مذكرة |
|---|---|
| `modules[]` with `stage`, `estimatedMin`, `desc`, `teachesLearningPointIds` | the timeline — one phase per محور, its clock, its stage guidance, its expected outcome |
| `skills`, `teachingScope.include/exclude` | objectives and « حدود الحصة » |
| `resources[]` manipulations with `module` and `level` | the phase's support; `beginner` → « للمرافقة », `advanced` → « المستوى المنتظر » |
| `content/textbook.js` export **`ACTIVITY`** (or `ACTIVITY_A`, or `SITUATION` for a synthesis) with `situation`/`text`, `questions[]`, `closing`, `source` | « وضعية الانطلاق » and the trigger phase's questions |
| `content/exercises.js` export **`EXERCISES`** (or `EXERCISES_1`, `EXERCISES_2`…) with `statement`, `difficulty`, `learningPointId`, `question.explain`, **`commonError`** | examples, anticipated errors, each phase's vigilance, differentiation, exit ticket |
| `knowledge.jsx` bricks with a plain-text **`summary`** | knowledge objectives, the trace to build, oral questions, the « nudge » for an error |
| catalogue `prerequisiteLessonCodes`, `learningPoints` | prerequisites, remediation, success indicators |

Rules: keep those export **names** (the builder recognises only them); give
every exercise that has a known pitfall a `commonError`; keep each brick's
`summary` a short plain sentence (the مذكرة renders `$…$` math, JSX is not — the
brick's `body` never reaches the مذكرة; the STUDENT map and snapshot show `summary` as plain
text, so keep formulas out of it — write them in words or put them in `body`).
`buildLessonMemo.test.js` builds the memo of **every** lesson and fails if a
phase or a text cannot be traced back to the lesson. Do not add memo-specific
fields to a lesson; if a phase needs richer teacher guidance, it belongs in the
per-stage text of the `memo` i18n namespace. Contract:
`TEACHER_CLASSROOM_ARCHITECTURE.md` §8b.

## 9. Reference lessons — what each one demonstrates

All under
`lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/`. These are
references, not templates: read them for the pattern, never copy-and-modify.

> **2026-11-18 — the module pages of `qasim-adad-tabii`, `qawasim-adad-tabii` and `khawass-qawasim` are DELETED.** These
> three lessons are v2 (a game world, `docs/architecture/LESSON_V2.md`); on the owner's order their old version —
> module pages, mission player, `content/prep|problems|peerSheet…`, `?view=classic` — is gone (`LESSON_V2.md` §2,
> `docs/reports/OLD_VERSION_TRACE_2026-11-18.md`). Wherever this guide cites one of their MODULES or content files as a
> reference, read the same pattern in a lesson of the unit still on the module system — `qasim-mushtarak-akbar` has the
> same shape (« أستعدّ », a trigger module with its lab, معارف, أوظّف, three مسائل, « إختبار أولي »). Their config
> (`modules` as data, `resources`), their knowledge map and their practice bank are still there.

| Lesson | Read it for |
|---|---|
| **`qasim-mushtarak-akbar`** (was `qasim-adad-tabii` until its pages were deleted, 2026-11-18) | the complete canonical shape: module 0 diagnostic, a `trigger` module opening on a concrete manipulation, a `معارف` module laying knowledge bricks, practice, evaluation. The best first read. |
| **`qasim-adad-tabii` module 1** — PAGE DELETED 2026-11-18 (the `team-builder` component and its tests remain in `manipulations/divisibility/`) | the **manipulation quality reference** (redesigned 2026-09-30, `MANIPULATION_DNA.md`): the **two-level workspace** (مبتدئ = the football pitch, partition, carry gesture; متقدم = since 2026-11-04 the SAME pitch with 42 players, 5 or 6 teams — the owner replaced the library shelf (420 books, quotition) by the football lab for the whole lesson); the refusal-as-definition and the ghost shelf as resistance; contrast-gated discovery; `DivisionRoles` and the two-readings bridge; the student's own trials listed above the question. A quality bar, **not a visual template**. Module 2 is the worked-example pattern (`levels={false}`): 48 players, 6 teams then 8, so 48 = 6 × 8 = 8 × 6. One lab for the whole lesson: the numbers live in `content/teams.js`. |
| **`team-builder`** | a platform context replacing a textbook one, declared and traceable: equal teams on a real drawn pitch, where the remainder is a player left standing outside. Pure model in `packages/core/arithmetic/equalGrouping.js`, formation geometry swept by `teamFormation.test.js`. |
| **`bahth-pgcd`** | two manipulations in one lesson (successive differences, then Euclid), and the longest module sequence in the unit. |
| **`ikhtizal-kasr`** | a manipulation with two comparable paths (divide repeatedly vs divide once by the GCD), and the `Module00Astaidd` prerequisite diagnostic. |
| **`wadiya-idmajiya-aadad`** | the `synthesis` kind: no discovery or formalization, mobilises what the other lessons taught. Never counted as a lesson. Since 2026-10-13 it carries **six practice « وضعيات تدريبية »** (modules 1–6, GuidedProblem, `content/problems.js`), then « تحليل الوضعية النهائية للاختبار » (module 7) and « وضعية الاختبار النهائي » (module 8, the textbook's aprons challenge) — the only synthesis with `track: 'problem'` modules (`MASAIL_GENERATION_GUIDE.md` §14). |
| **`khawass-qawasim`** | a proof-oriented module (`أتعلّم البرهان`) inside the standard shape, and the **construction site**: a length drawn in bricks of n (`BrickWall`), one object carried to three zones. |
| **`qasim-mushtarak-akbar`** | the **drawn grouping scene** (`GroupingScene`) served by two themes from one type: balls and shirts at مبتدئ, the textbook's flowers at متقدم, words overridden by `context`. |
| **`awwaliyan-fima-baynahuma`** | a beginner level that *adds a stage* (`startWith="groups"`, the school bags) before the textbook's lists, without a new type. |
| **`bahth-pgcd`** | one world for two algorithms: the same ribbons are cut (differences) and laid along (Euclid), so the student meets one instrument, not two. |

Unit 2 « الحساب على الجذور » (`…/hisab-judhur/`, 2026-09-30), the first unit built on the frozen §14
architecture from its extraction:

| Lesson | Read it for |
|---|---|
| **`jidhr-tarbii`** | a textbook activity whose questions are answered from the student's OWN bracketings (`onTrial` of `square-root-side` → `[data-activity-evidence]`), the تحدّ of the unit page reused as the REAL hook and revisited as the last step, a drawn figure in `components/` |
| **`natiqa-ghayr-natiqa`** | a lesson with NO textbook « أستعدّ » item (platform statements only), a textbook misprint shown honestly, a declared prior-year reminder (`addition('prior_year_reminder')`, label « تذكير من المنصّة ») |
| **`muadalat-x-murabba`** | the unit's « أدمج تعلّماتي » situation placed in a lesson's practice module when the platform publishes no synthesis lesson |
| **`amaliyat-judhur`** | a table the student COMPLETES (never reads) before the conjecture, and a proof by squaring as a batch |
| **`tawzif-khawass-judhur`** | a lesson with no textbook activity: the lab is declared the entry into the طرائق (`experience.type: 'platform_adaptation'`), then worked methods revealed line by line; a corrected misprint turned into a complete exercise (now-30) |
| **`wadiya-idmajiya-judhur`** | unit 2's synthesis « أدمج تعلّماتي »: the situation analysed in the textbook's three phases (the corrected phase shown), the 11 QCM items written out one step each so the audit reads every `requires` (unit 1's synthesis maps them and is invisible to the audit), the item with two correct options as a « يساويه / لا يساويه » batch |

Unit 3 « الحساب الحرفي » (`…/hisab-harfi/`, 2026-10-01), built on the same architecture with four
lesson authors working in parallel (see « Adding a textbook UNIT »):

| Lesson | Read it for |
|---|---|
| **`nashr-tabsit`** | the LETTER as a length the student stretches (`pitch-expansion`): a textbook numeric question (3 × (9 + 5)) reached as the value x = 9 of the beginner pitch 3(x + 5) (`span={9}`); the corrected act-1 reading; a worked lab in معارف (`levels={false}`, the book's (2x − 1)(x + 4)) |
| **`mutatabiqat-shahira`** | the three identities read on square / cut pitches (removed and restored strips), Descartes' table as the lab's own grid (`history-descartes` duplicate), questions answered from the student's `onTrial` evidence, mental calculation as a learning point |
| **`tahlil-ibara`** | the inverse gesture (`turf-factoring`): identical rows = common factor (the PGCD of unit 1 reappears), a square pitch that closes only for a² + 2ab + b², x² + 25 that never closes; four corrected misprints; طرائق revealed line by line; two QCM items formative in أوظّف, five in the final test |
| **`wadiya-idmajiya-harfi`** | the synthesis: the pool and its strip modelled on a three-segment side (`x+10+x`), the textbook's « مساعدة » kept as such (no zero-product theory claimed), the 13 QCM one step each, أتعمّق exercises on choosing the expanded or factored form |

Unit 4 « معادلات ومتراجحات من الدرجة الأولى بمجهول واحد » (`…/muadalat-mutarajihat/`, 2026-10-01), five
authors in parallel on a seeded foundation (see « Adding a textbook UNIT »):

| Lesson | Read it for |
|---|---|
| **`muadala-ula`** | the BALANCE (`equation-balance`): a one-sided gesture tips the beam (the rule resists), the mirror gesture writes the textbook's « أي … » line under it; balloons are −1, so Fatima's 9x + 1 = −26 is solved by ADDING a balloon to both pans; Q4 (9x + 1 = 2x → −1/7) as the contrast that motivates ax = b → b/a; ex-9's equation without solution said honestly |
| **`jidaa-maadum`** | the pitch whose sides are the FACTORS (`vanishing-pitch`): it collapses exactly when a side is 0; pins refused with the exact area, « لا حلول أخرى » gated by the sweep; the ruler's graduation derived from the roots' denominators (no rounding ever); the unit تحدّ and الخوارزمي duplicated as transfer and closing |
| **`mutarajiha-ula`** | the solution RAY (`solution-ray`): traces painted by the student's own trials (red = solutions, the textbook's colour), the bracket placed and refused with a witness, then (متقدم) transformation cards where ÷(−3) without flipping contradicts the student's red traces; module 1's lab posed alone on the textbook numbers (`levels={false}`); number lines as answer options (`components/RayFigure.jsx`, `GraphChoice.jsx`, also in BossFinal) |
| **`tarrid-mushkila`** | a lesson with NO textbook activity whose lab is the entry (`growth-race`, `platform_adaptation`): BUILD the model by carrying « + x » onto each person (a forgotten child refused in the story's words), then RACE x on a timeline — the meeting point is the equation, beyond it the inequality; P2 (« ملاءمة للواقع ») taught on a negative solution |
| **`wadiya-idmajiya-muadalat`** | the synthesis: the pool situation in the textbook's three phases on `growth-race` (`theme="pool"`, `goal="greater"`), interpretation practised on the beginner pricing so the textbook answer (9 sessions) stays for the final test; the 9 QCM one step each, two-correct items as batches, number-line options in SVG |

Unit 5 « جمل معادلتين من الدرجة الأولى بمجهولين » (`…/jumal-muadalatayn/`, 2026-10-01), four authors on a
seeded foundation, the first unit under the one-screen rule:

| Lesson | Read it for |
|---|---|
| **`mafhum-jumla`** | the PAIR held by the hand (`pair-scoreboard`): two gauges, a claim refused while one equation fails, the swapped pair as a refused trial; the textbook's 32 agents in a near-square office that fits one screen with both handles; the تحدّ (coins) as REAL hook and transfer on the same lab; the special cases (none / infinite) written line by line; a two-answer QCM as a combination choice |
| **`hall-jabri`** | `elimination-cards`: a discovery that opens only when BOTH methods (the textbook's two students) gave the same pair; the worked example revealed line by line; « which method » taught as a platform brick whose distractors state false facts about the coefficients; a three-answer QCM as combinations in the BossFinal; `pair` with `names` for (a ; b) / (d ; t); exact non-integer pairs (68/19 ; 39/19) kept as the textbook prints them |
| **`mushkilat-jumla`** | `story-modeller` as the textbook's 5-step table, the table's «حل» column filled ONLY from the student's own lab work; the method applied to the تحدّ and to أبو كامل's problem (classical reading declared); a story whose solution is not a natural number; SVG figures for ex-19 and ex-21 |
| **`wadiya-idmajiya-jumal`** | the synthesis reusing `story-modeller` (`theme="party"`, two money facts, `LAB` in `content/textbook.js` + `lab.render.test.jsx`); solving and checking practised on the beginner numbers so the textbook answer stays for the final test; QCM items 2 and 6 as « صحيح / خاطئ » batches; ex-31 corrected |

Unit 6 « الدالة الخطية والتناسبية » (`lessons/moyen/4am/tanasubiya_duwal/tanasubiya-dala-khattiya/`, 2026-10-02), six
authors on a seeded foundation, under the owner's display ميدان « ميدان التناسبية والدوال »:

| Lesson | Read it for |
|---|---|
| **`tanasub-muamil`** | a unit ENTRY lesson with no formal textbook « معارف »: proportionality taught as declared platform reminders (`prior_year_reminder`), never as the textbook's words; `ratio-ride` — the student's OWN rides recorded as table columns, « جدول تناسبية » refused with two quotients, the fixed unlock fee as the contrast; act-1 Q1 as a declared duplicate with the 20 % correction; no f(x) notation before lesson 2 |
| **`dala-khattiya`** | `linear-machine`: a hidden rule fed with the student's own cards, a claim refused with a witness, 0 that fixes nothing, the machine run backwards for the antecedents of act-1; act-2's three machines classified; method-determine revealed line by line; QCM 2, 3, 5, 6 in the BossFinal |
| **`tamthil-bayani-khatti`** | `origin-line` built for three lessons: O that refuses to move, a point refused with its gap, readings by probes, the GeoGebra slider of p. 76 (`tech-76`) honestly replaced by the lab's `pivot` mode; the ex-14 sign trap made explicit; exercise graphs drawn in SVG |
| **`tatbiqat-tanasub`** | `percent-tag`: the additive bar refused by the multiplied one, the tank's chain BET before it is built (−15 % refused by the water); compound quantities (speed, flow, density) with the act-6 copper and know-4 kWh corrections; QCM 7 (three correct) as a combination choice |
| **`tarrid-khatti`** | a modelling lesson reusing `origin-line` in `fit` mode (beginner on a platform cable car because no lab world draws kg × DA; the textbook's spring at advanced), act-4's three graphs redrawn, the spring method revealed after the student completes the table, the تحدّ (two vehicles) as transfer |
| **`wadiya-idmajiya-khattiya`** | the synthesis: the cable car (Pythagoras → time → cost 3,8x) in the textbook's three phases, practised on a platform cable and family so the textbook answers stay for the test; `origin-line` `read` + `cap` (`theme="budget"`, `experience.theme: 'cablecar'`); the largest price ROUNDED DOWN (526 DA) and why; all 8 QCM one step each; units with a slash put in `$…$` (they reverse in RTL) |

Unit 7 « الدالة التآلفية » (`lessons/moyen/4am/tanasubiya_duwal/dala-taalufiya/`, 2026-10-02), six authors on a seeded
foundation, same display ميدان; the supplied textbook pages have NO formal pages, so every lesson declares its formal knowledge:

| Lesson | Read it for |
|---|---|
| **`mafhum-taalufiya`** | a unit ENTRY lesson whose textbook has NO معارف: the act-1 payroll on `affine-meter` (three stages opened by the student: the textbook table's columns as ruler marks, the target 37775 reached then the inverse program written, the knobs a / b to b = 0 and a = 0), act-2's six rules as one batch (a and b whatever the writing order), the formalization written by the platform and declared (`knowledge_formalization`), act-1's « أضيف » → « أضف » corrected in one line |
| **`tamthil-bayani-taalufi`** | `affine-line`: the textbook's (d) → (d′) lifted by the student, probe readings at two abscissas showing the same gap, b′ ≠ 1 refused with f(0) = 1, then a chained second lab (a hidden descending ramp read with b′ then the step a′); act-3 2-أ corrected from (1 ; 0) to (0 ; 1); graph figures drawn in `components/AffineFigure.jsx`; `point` answers for (0 ; b) in the bank |
| **`tanasub-taghayyurat`** | `slope-stairs`: the textbook's act-4 staircase COMPLETED by the student's own stairs, the invariant quotient against stairs of different widths, x₁ = x₂ refused; the تحدّ (°C → °F) as a declared duplicate in `points` mode (unknown images refused until the stair gives a, then descend to 0 for b); the property, its proof sketch f(x₁) − f(x₂) = a(x₁ − x₂), and the two methods (a then b, or the system in a and b) |
| **`tafsir-bayani-jumla`** | `line-crossing`: the class fund (نشاط 5) where each condition is first WRITTEN y = ax + b (wrong cards refuted by a witness), then P walked until both lamps light at (36 ; 7); the cases stage chained by the student (parallel / coincident); the platform note on the unknowns the textbook leaves to question 2; « القراءة تقريبية » — a graphical reading is exact only on a grid node, confirmed by calculation |
| **`tarrid-taalufi`** | a lesson whose only textbook element is a declared duplicate (act-4 question 1); `plan-compare` built for two lessons: the bill (the fixed part paid x times refused with the bill's own cost) then the comparison (marker on the crossing, the x-axis painted with the cheapest plan); the comparison taught as equation + inequality + lower line; a five-step platform method (`stage: 'formalization'`) |
| **`wadiya-idmajiya-taalufiya`** | the FIRST synthesis with NO textbook synthesis: a class trip to Tipaza beach (participants by a جملة read graphically, a bus as an affine function — image and antecedent —, a second bus known by two quotes, the two lines' crossing, three kayak tariffs on `plan-compare` `theme="rental"` incl. a constant one), every part linked back to its درس; the final test a transposed trip (Les Sablettes); Arabic SVG axis titles with explicit `direction="rtl"` |

Unit 8 « الإحصاء » (`lessons/moyen/4am/tanasubiya_duwal/ihsa/`, 2026-10-02), five authors on a seeded foundation, same display
ميدان; a COMPLETE textbook unit split into the owner's five lessons:

| Lesson | Read it for |
|---|---|
| **`takrar-mujamma`** | the unit ENTRY on `cumul-gate`: act-1's 20 pupils in the textbook's own (unsorted) order, the student sorts the queue, sets t on a ride's height gauge and ANNOUNCES the count (a refusal names the people of height exactly t), the two textbook tables filled by the student's own accepted counts, « ÷ N » for التواتر; the invariant up + down = N + f(t) as a declared brick; طرائق revealed line by line; دوري الآن (open) made checkable on declared platform data; tables in final-test prompts as KaTeX arrays (`texTable`); bar chart, histogram and pie redrawn in SVG (`components/Charts.jsx`) |
| **`mada-wasit-mutawassit`** | `stat-balance` built for two lessons: the كلّاب then the fulcrum (five e-sport scores / El Oued) with act-3 decided on the student's own fulcrum trials and the HONEST answer to « أي المدينتين كانت أكثر حرّا؟ » (same mean 482/30, (ب) more spread); the curtain in rank space, the far token that moves the mean and not the median; act-4's three parts (class centres 1816/41, median class); معارف 4's misprints corrected; طرائق's « add 3 and 43 » asked BEFORE its solution; the plain mean as `prior_year_reminder`; « اقترح سلسلة » exercises turned into « which series satisfies… » choices |
| **`majdulat-ihsaiya`** | a lesson whose textbook elements are only exercises (ex-7, 15, 16, 23, 24, ex-1 هـ): the spreadsheet knowledge declared (`knowledge_formalization`); `sheet-lab` — the series typed and saved, the hand result before the formula, a short range or a wrong function contradicted by the student's own number, the outlier that moves MOYENNE and not MEDIANE, a chained chart stage; ex-7's screenshot misprint corrected; French (textbook) and English function names accepted; formulas as LTR code (ARABIC_RTL_CONTRACT) |
| **`qiraat-wadiyat-ihsaiya`** | a lesson with NO textbook activity whose entry is the unit's تحدّ on `group-tanks`: the student BETS the merged class's level, the water refuses the mean of the means, the two classes settle at the same 384/33; the opener « تلوث البيئة » as the real context of a platform chart; ex-19's two combined bars read as a puzzle (not a misprint); ex-14 (position AND spread), ex-22 (N = 31 from a removal); the platform method « أقرأ · أحسب المؤشرات · أقارن · أقرّر » |
| **`wadiya-idmajiya-ihsa`** | the synthesis WITH a textbook situation: the Olympic medals' two hidden values found BY HAND on `stat-balance` `mode="hidden"` (the curtain fixes 3, the beam 28), then by calculation in the textbook's three phases (rank 15/16, 176 + 2 × 3 + y = 210, 0,69 × T = 30 → 13); a beginner table whose single hidden value is the EXTREME one (only the balance finds it); the 6 QCM one step each with a link back to their درس; ex-20 corrected (6 → 6,5); the final test TRANSPOSES the situation |

Unit 9 « خاصية طالس » (`lessons/moyen/4am/handasa/khassiyat-talis/`, 2026-10-02), four authors on a seeded foundation, the first
geometry unit, under the programme's « ميدان الهندسة »:

| Lesson | Read it for |
|---|---|
| **`talis-hisab-atwal`** | the unit ENTRY, rebuilt 2026-10-13 around `shadow-world` at BOTH levels (the same world, minaret 5 m then 6,5 m; MANIPULATION_DNA §16: the student holds the sun, WRITES « shadow ÷ height is one number » and sees it break and mend; the synthesis keeps 7,25 m). The `thales-beam` no longer lives in this lesson. Module 1 now runs **world → figure → equality → calculation → the textbook's general letters**: step 1 « from the square to the figure » (`FIG_SHADOW`, (AM) ∥ (BE) because two verticals), step 2 the Thales equality with its three false friends (inverse, the segment AB, the difference), step 3 a calculation on the square's own objects (palm 4,5 m), then the textbook's case 1 (with a bridge « A is our O » and the cinema vignette), its calculations, case 2 and the text, `PredictRule talis-nashat`. Earlier text that said « the screen » was rewritten (module 0 advice, module 2 brief and brick leads, the knowledge prompts). Generation rule shown by this lesson: **when a world replaces a textbook lab, the textbook's questions stay as the FORMALISATION steps and every later reference to the old lab is rewritten**: a screen slid in a projector's beam (`cinema`), tilted, and pushed THROUGH A into the camera obscura (`camera`, the butterfly case); every stop JUDGED by the student and decided exactly; the textbook's questions (56/15 ≈ 3,73, 244/75 ≈ 3,25; case 2 k = 1/2) answered under the student's own stops; three misprints corrected in one line each; أستعدّ 4–5 revisited in أوظّف once the property is known; every figure GeoFigure data, also in the BossFinal (`inline`) |
| **`aksiya-talis`** | `parallel-level`: B′ and C′ PLACED notch by notch, a spirit level on the plank centred only when parallel (`thales.converse`); the graffiti A-frame ladder (6/9: two level planks, so « the midpoints » is refuted) then نشاط 2 on an X-trestle (9/12, ratio 1/3 imposed, figure 3 refused by the ORDER); طرائق in both directions (decide, then reveal); ex-16 يونس / إيناس (an approximation is not a proof) as the map's خطأ شائع |
| **`inshaat-talis`** | a lesson with NO textbook activity whose entry is `segment-divider` (`platform_adaptation`, `tifo` banner): real ruler, compass and set square, a parallel off a mark refused, unequal bands measured exactly; the ratio point inside AND outside on two graduated parallels; دوري الآن done in the lab posed alone; the owner's « نسبة غير ناطقة » taught by one declared example (√13, then 2√13/3 by Thales); a bank that checks the REASONING of constructions |
| **`wadiya-idmajiya-talis`** | the synthesis with a textbook situation: the تحدّ in a **living world**, `shadow-world` (2026-10-13, MANIPULATION_DNA §16: the student holds the sun, measures, bets, WRITES the law that the world tests and the moving sun refutes, repairs it, then finds 7,25 m; the stick at the edge of the minaret's shadow is the textbook's method) and the cylinder in the cone on `cone-cylinder` (piercing refused, h = r → V = 91,125π), two types in one workspace; `MinaretFigure` drawn once for the unit page, M1 and the final test; QCM cells judged one by one; the pyramid of Khufu by its shadow as transfer; the final test transposes cone and minaret |

Unit 10 « حساب المثلثات في المثلث القائم » (`lessons/moyen/4am/handasa/hisab-muthallathat/`, 2026-10-04), five authors on a seeded
foundation, the second geometry unit:

| Lesson | Read it for |
|---|---|
| **`nisab-muthallathiya`** | the unit ENTRY on `ramp-ratios` (`skatepark`): a CHAINED carry inside one level — tap the acute angle (the right angle refused), carry the labels الوتر / المقابل / المجاور onto the sides (the board as « المقابل » refused with its reason), compose cos / sin / tan from the named sides (the hypotenuse over a sine refused, > 1), then lift the rise — the board swung down and stood up always outruns it (0 < sin, cos < 1); at متقدم (act-2) the student JUDGES three ramps at 40° before reading 0,64 / 0,84; the textbook's word definitions through `WordFraction`; the طرائق key sequences as LTR `<kbd>` through `MethodSteps` node lines (`components/KeySequence.jsx`) |
| **`hasiba-muthallathiya`** | `trig-calculator` (`drone`): a drawn calculator that STARTS IN RAD (sin 30 = −0,988 drawn as a side going under the ground), real key sequences, forgetting 2nd contradicted by the drone lying on the ground, rounding as a CUT LINE dragged across the screen digits (truncation refused); act-4's table and its three inverse angles answered from the student's own presses; the know-3 screen misprint corrected; the narrow-screen recipe (4-column keypad, one shared control row under 380 px) |
| **`alaqat-muthallathiya`** | `angle-compass` (`kite`): set square, a carried length, the compass opening and a pencil LOWERED from 90° until the arc cuts the other leg at the exact √(r² − a²); a string shorter than the height never lands; sin 2/5 built on the two legs refused as a tangent (21,8° vs 23,6°); the vertex of x designated by the student; cos² + sin² shown as a bar filling exactly 1 on every triangle, refused ones included; act-5 from lesson B's rounded table (0,87² + 0,5² = 1,0069 — hence the proof); know-4's misprint corrected; « إن أمكن » (ex-18) taught as a declared brick |
| **`tarrid-muthallathiya`** | a lesson with NO textbook activity whose entry is the تحدّ on `clinometer`: the ladder (`mural`) bracketed by hand (1,8 < L < 1,9) before sin ÷ gives 1,9 m; the floodlight (`floodlight`) gives the same height from two distances, the wobble explained by the angle read to the degree; a wrong ratio refused naming the side it would need, a wrong operation refused with the value it would give; platform طرائق on ex-26 (rounding early: 5,8 vs 5,7) and ex-27; the unit page's `LadderFigure` |
| **`wadiya-idmajiya-muthallathat`** | the synthesis REUSING lesson D's lab (`clinometer` `mode: 'align'`, `maqam`, numbers in `content/textbook.js › LAB`, `lab.render.test.jsx`): the observer slides until the pole's top hides مقام الشهيد's — Thales gives 92,09 m, the real height, then tan gives 43° — in the textbook's three phases; the six QCM items (item 3 two correct, item 5's two rows judged separately); أتعمّق's right triangles inside solids, rounding only at the end (22° vs 23°); the final test transposed to the minaret of جامع الجزائر (265 m) |
| **`insihab-shuaa`** | unit 11 ENTRY on `translation-glide` (`drone-show`): the hand holds the leader drone's arrow and each image node; a refusal names the differing element (`vectors.relation`: direction / sense / length); a rogue drone flying −u is the built-in contrast; moving A′ glides every placed image; advanced = act-1 REDRAWN 14 × 8 (the textbook's strip had C′ on C, E on L, H on P — Q / S / T name the images that coincided), its questions answered from the student's own placements; ex-4 / ex-8 count misprints corrected |
| **`shuaayn-mutasawiyayn`** | `parallelogram-pin` (`tifo`): I slid along a scarf (AI vs IB vs BI), then the banner's corner D as the image of C — CD = AB tightens the banner and merges the diagonals' midpoints, DC = AB twists it into a bow-tie —, then E with EB = AC (E on D refused); one workspace mounted twice (M1 مبتدئ, M3 متقدم because it is the طريقة); ex-12's sum prepared and deferred to the next lesson |
| **`majmu-shuaayn`** | the تحدّ (swimmer) on `vector-sum` (`swim`): the velocity's direction turned until the parallelogram's diagonal lies on (AB) — 30° decided exactly (`vectors.crossing`), real speed 2√3, then solved by trigonometry (bridge to unit 10); Chasles by carrying the second leg's tail onto the first leg's head (`scooter`; same origin or a jump refused; return trip → 0); the unit page's `RiverFigure` |
| **`barahin-ashia`** | a lesson with no textbook activity entered by `vector-chain` (`metro`): tickets coupled by Chasles, carried as translations, an equality true on the drawing but not GIVEN refused (« الشكل لا يبرهن »), the proof written line by line by the gestures; `construct` mode for دوري الآن 138 (sums of several vectors head to tail); ex-21 corrected (K) |
| **`wadiya-idmajiya-ashia`** | the synthesis on its own lab `bridge-path` (`crosswalk` / `bridge`): the crossing slid along the road (lengths read), the translation opened by the student, B′ placed and judged by `relation(BB′, NM)`, the bent A–M–B′ straightened (√85 + 2, the extraction's declared example); the textbook street redrawn near-square; QCM one step per item; the final test transposed to an Oran motorway footbridge |
| **`murakkibata-shuaa`** | unit 12 ENTRY on `component-steps` (`delivery`): a rider walked street by street whose signed counters ARE the column vector; codes typed before leaving and judged by where the scooter stops (sign / swap / address-instead-of-trip refused); the depot O where the code equals the address; a destination pin for given components; act-1 without counters at متقدم, D off the figure; the four معالم as vignettes; know-origin's reversed pair corrected; دوري الآن 1 in the lab posed alone (`story: 'draw'`) |
| **`hisab-murakkibatay`** | `component-calc` (`game-map`): the portal's code PREDICTED on signed counters before the hero jumps (a reversed subtraction is drawn backwards), then a portal with two unknown coordinates placed with live (مبتدئ) or deferred (متقدم, `live: false`) component lamps — CD = AB crosses ABCD and is refused; act-2's twin portals DE = CF; method-equal, ex-8, ex-12 misprints corrected; a platform « نقطة مجهولة » method |
| **`muntasaf-masafa`** | `midpoint-distance` (`gps-meet`): two stages opened by the student — the meeting pin (accepted only where AM = MB; the group chat's « sum without ÷ 2 » and « half-difference » refused by name), then the right-angle staircase and the distance claim (the street « taxi » distance and the square refused, only √(Δx² + Δy²) accepted); act-3 / act-4 answered from the student's own trials; the تحدّ as hook, solved at the end (√365 / 3) |
| **`ithbat-khawas-maalam`** | a lesson with no textbook activity entered by `shape-prover` (the فار of the neighbourhood pitch): proof cards sent to the video referee, sufficiency refused card by card (equal diagonals alone are not a parallelogram), the « looks right-angled » start refused by its numbers (10 + 5 ≠ 17); method-unknown (C slides on x = −2 to y = −4) as متقدم, then the square and the circle; perpendicularity without dot product as a declared formalization; the method-unknown figure redrawn so it no longer shows the answer |
| **`wadiya-idmajiya-maalam`** | the synthesis on its own lab `route-compare` (`cross` / `rally`): a BET first, then each route built piece by piece — a semicircle closes only when its centre is the midpoint (wrong centre: the lab names where the arc would end), a skipped checkpoint refused as a shortcut; two smartwatches add exact then rounded lengths (3π ≈ 9,42 vs √13 + √5 + √17 ≈ 9,96); the two levels disagree on the winner on purpose; the final test transposed to جبل الوحش (Constantine), where the broken line wins |
| **`mafhum-dawaran`** | unit 13 ENTRY on `rotation-dial` (`ferris-wheel`): the hand holds the IMAGE point; every drop judged by `rotation.imageCheck`, the refusal naming the missing condition (sense / OM′ ≠ OM / the measure read); مبتدئ = the Ben Aknoun wheel, each rotation asked in both senses (60° ↺ A → B vs 60° ↻ A → F); متقدم = act-2 then act-3 with a real compass (snapped onto OP) and a protractor ruler, the magnet attracting only toward the student's OWN constructions; QCM 1 corrected; ex-5 redrawn with the scan's angles given as gaps |
| **`khawas-dawaran`** | a lesson with no textbook activity entered by `shape-turn` (`zellige`): a tracing-paper sheet turned around a pin, a stretch handle as the counter-example (« ليس دورانا: تغيّر الطول »), invariant gauges (length, angle, area, alignment, the angle between a line and its image), a six-petal rosette stamped by `imageCheck`; متقدم = method-properties ([AC] lands on [BD] only for 90° direct, then property cards prove AC = BD and ⊥) and ex-18's centre pin (two perpendicular bisectors); two declared formalizations (the line-and-image angle, finding the centre) |
| **`zawiya-muhitiya`** | `inscribed-angle` (`football`): the shooting angle — a BET before the reading, the striker held in polar coordinates and snapped to the circle, off-circle vertices refused with their changed measure, the other arc (180° − x); متقدم = act-4's stages (مزيان's equalities with the student's numbers, هوارية with O inside / outside the angle, ex-12's interior point as the half-sum of arcs via `rotation.vertexAngle`); a declared طريقة « من القوس إلى الزاوية »; know-4 and ex-12 corrected, ex-10 / ex-16 data stated |
| **`mudalaat-muntazama`** | the تحدّ (the flag's star) as entry on `polygon-forge` (`honeycomb` / `flag-star`): the rotation angle held, each « دوّر » places the next vertex — the figure closes only when n·α = 360° (50° spirals with its reason, 144° makes a star); متقدم opens three stages (72°, R to 0,01 via sin 36°, the branches with a pentagon side refused); method-angle (108°) and ex-15 corrected; the unit page's `FlagStarFigure` |
| **`wadiya-idmajiya-dawaran`** | the synthesis on its own lab `lamp-ring` (`flower-bed`): posts placed by hand and refused while the gaps differ, then one second post sets the rotation and each « دوّر » places the next image (the ring closes only when n·α = 360°), then the distance chosen by card (half-angle sine; equilateral for n = 6) against the arc, « d = r » and the unhalved angle; the extra after the rule is 12 posts so the final test's numbers (8 posts around an Oran roundabout, 5 m: 45°, ≈ 3,83 m) appear nowhere else |
| **`kura-julla`** | unit 14 ENTRY on `sphere-probe` (`glass-globe` / `shot-put`): the hand holds a point M on whole grid points around a real 3D sphere (drag on its horizontal plane, ▲/▼ for the height, x/y/z spinbuttons); every claim judged EXACTLY by `space.ballPosition`, the refusal naming the comparison (« OB = √3 < 3 = R »); the كرة / جلّة toggle on the stage is act-1's contrast; at متقدم OM is never shown during the gesture; a second stage opened by the student: a diameter [MM′] (a chord refused), great and small circles with a plane z = h; know-1's egg-shaped figures redrawn |
| **`misaha-hajm-kura`** | a lesson with NO textbook activity entered through the Archimedes introduction (declared duplicate), on `orange-peel` (`boufarik-orange`): the student predicts how many discs of radius R the peel covers (locked by the gesture; the peel overflows into red ghost discs or leaves one empty), then the juice of the ball poured into the wrapping cylinder stops at 2/3; cards judged on DIMENSION then value (the R = 3 « 36π cm² = 36π cm³ » trap); the book's rounding as a number of decimals; the method « القيمة المضبوطة ثم المدوّرة » and its reverse declared `knowledge_formalization` |
| **`maqati-mustawiya`** | `section-slicer` (`3d-printer`): each printed layer is a plane section; the student holds the plane (the printer's nozzle dragged on `onLine` + an HTML rail) and PREDICTS each layer by card before it prints — a wrong card stays as a dashed ghost layer that misses the surface or sticks out of the solid (OM = √(h² + ρ²) written against R); the sphere's discovery needs a great circle, a small one and contact / nothing; the act-3/4/5 solids are tabs of ONE lab at متقدم; the missing pyramid / cone page declared `knowledge_formalization`; act-3 part 2 redrawn |
| **`takbir-tasghir`** | `scale-blocks` (`voxel-blocks`): act-6's cuboid built in unit cubes; k held by a 3D handle on the image's far corner (snapped to a list) + a stepper; the image volume predicted (×k, ×k², ×k³) before « ابنِ » and refuted by the COUNT (each cube becomes a same-colour block of k³); the « +1 cm لكل حرف » contrast (6/5 ; 5/4 ; 4/3: not an enlargement); the missing knowledge and methods declared `knowledge_formalization`; act-5 as a duplicate (the pyramid's section = a reduction of ratio 3/4) |
| **`wadiya-idmajiya-fada`** | the synthesis whose situation is the unit's تحدّ (the scan has no « أدمج تعلّماتي »): the frustum bucket on `bucket-fill` (`beach-bucket`) in three phases the student opens — the water level read from the drawing (7 cm from the BOTTOM refused), the apex S lowered until the generators pass through the rim (SO = 105, Thales in an axial-section `MovablePanel`), V = V₁(1 − k³) = 24388π/3 ≈ 25,54 L chosen by card against k and the mean-radius cylinder; QCM one per lesson, أتعمّق the reverse path (k³ → k, a melting ice cream), the final test a frappé glass in Oran |

1AM unit 2 « الحساب على الأعداد الطبيعية والأعداد العشرية: الجمع والطرح » (`lessons/moyen/1am/ansab_al_aadad_wal_hisab/jam-tarh-ashriya/`,
2026-10-14), the FIRST 1AM–3AM content, generated lesson by lesson:

| Lesson | Read it for |
|---|---|
| **`mana-jam-tarh`** | a lesson whose concept is a MEANING (choose + or −): `story-bars` — مبتدئ the school medical check (the hand stretches the unknown child's height until the sentence is true, then chooses the calc card; « تزيد » with − and « تنقص » with + as traps), متقدم the textbook's six texts and six calc cards (no gauge: the tape judges); module 1's questions answered from the student's own trials; the vocabulary named AFTER it is asked (bricks `predict: false`); the طريقة p. 29 replayed in the same lab posed alone (`levels={false}`); « أستعدّ » measuring the net's review item `1am.m1.r03` with two platform statements; the p. 31 self-assessment items kept for the final test; every tape a tested `ArcTape` figure (`content/tapes.test.js`) |
| **`qisma-iqlidiya-baqi`** — MODULE PAGES DELETED 2026-11-18 (v2, `docs/reports/OLD_VERSION_TRACE_2026-11-18.md` §8; the `division-jumps` component and its tests remain in `manipulations/operations/`) | 1AM unit 3, the first lesson generated in a unit whose earlier lessons are still `coming_soon`: `division-jumps` (b given, the hand holds q; flowers then the textbook's 279 ÷ 14 on a line without labelled multiples); the textbook's questions أ–هـ answered from the student's trials; the four names asked on the story before the brick; the column division revealed line by line (`MethodSteps`) as the answer to يونس's claim; the calculator page (the remainder is RECOMPUTED, the screen shows 19,58…); the first LP edge along a net link toward a published earlier lesson (P3 ← `1am_mana-jam-tarh_P1`) |
| **`qawaid-qabiliyat-qisma`** — MODULE PAGES DELETED 2026-11-18 (v2, `docs/reports/OLD_VERSION_TRACE_2026-11-18.md` §8; the `digit-cards` component and its tests remain in `manipulations/operations/`) | a lesson of RULES discovered from evidence: `digit-cards` (the textbook's 0..48 table coloured by hand, then the cards of exercise 26 with lamps re-judged on each swap); module 1's questions answered from the student's coloured cells; the rule for 9 (absent from the textbook's معارف) formalised as a declared addition after exercise 23 makes it visible; the rule for 4 as the طريقة p. 42; a practice lab on the leap year (the unit's تحدّ, `duplicatedIn`); a final test cut from ONE self-assessment table (p. 47 item 12), one rule per question; textbook exercises whose numbers belong to another lesson are REASSIGNED in the extraction with a note (ex-25's decimal quotients → `qisma-ashriya-taqrib`) |

3AM unit 4 « الحساب الحرفي » (`lessons/moyen/3am/ansab_al_aadad_wal_hisab/ibarat-harfiya-3/`, 2026-10-20), generated lesson by lesson:

| Lesson | Read it for |
|---|---|
| **`tabsit-hadhf-aqwas`** | a lesson whose idea is a RULE on written expressions, entered through a lab where the hand carries a TERM (`like-terms`, 4AM's `PitchExpansion` / `TurfFactoring` not reused): bundles of wooden pieces sorted into trays by shape — a pile in the wrong tray is refused with both values at x, opposite pieces cancel, the written value and the table's value stay equal when the hand moves x; then the SAME lab as crates `+( )` / `−( )` (`world="brackets"`, `levels={false}`, a wrong exit refused with the expression's value); the book's activities 1–2 posed as applications in أتمرّن; algebraic options built from term data and re-evaluated at 9 values of x in the content test; first lesson whose « أستعدّ » measures two review links toward UNPUBLISHED lessons |

**Textbook misprints are CORRECTED, not only noted (owner decision, 2026-09-30).**
The extraction keeps the book's verbatim `text` and adds a `correction`
`{ decidedBy, decidedOn, text | analysis1, answer?, note }`; `discrepancies`
records the resolution. The lesson displays the corrected version with one
discreet line (« صحّحت المنصّة خطأً مطبعيًا … »), never a long note. Unit 2:
act-2 (L2), ex-27 and now-30 (L5 — now-30 is a reconstructed, complete
exercise), the situation's analysis (synthesis). Unit 5: ex-31 (« x + y = 216 » → 270, synthesis). Unit 6: act-1 (2 % → 20 %, L1–L2), act-6 (copper 6 → 8 cm³, L4), know-4 (« kw/h » → kWh, L4), ex-13 (missing x, L3), ex-17 (question 2 on P و r, L1). Unit 7: act-3 2-أ (« (1 ; 0) » → (0 ; 1), a bidi-reversed couple, L2), act-1 4-ب (« أضيف » → « أضف », L1). Unit 8: ex-20 (median « 6 » impossible → 6,5, synthesis), ex-7 (the spreadsheet screenshot's other series and four formulas in one cell, L3), know-4 (« نفس التكرار 4 » → 5, « بالمتر » → بالسنتيمتر, the median class written as the table's, L2). Unit 9: prep 5 (« ADE » → ADF, L1), know-2 example (MN/AC → MN/BC, L1), method-lengths (« 1/2 = 5/DN » → 2/1, L1). Unit 10: know-2 example (« tan B = AC/BC » → AC/AB, L1), know-4 box (« sin²x + sin²x = 1 » → cos²x + sin²x = 1, L3), know-3 example 2's screen (16,69924453 → 16,69924423, L2), ex-15's third pupil (« رضا », L1), QCM item 5's duplicated option (shown once, L1 and synthesis).

---

## 10. The workflow

1. Read the documents in §1 and the reference lessons in §9.
2. Confirm the textbook extraction and the catalogue entry exist.
3. Design the **pedagogical sequence** before writing any JSX: what the student
   already knows, what they will do, what they should notice, what they will
   name, and what proves they understood. Map it onto the stages. The entry
   point and the order of ideas are YOUR design, not the book's page order
   (§4ter); every module is one track — act, answer about it, name it (§4quater).
4. Decide the manipulation, **at two levels**, and plan its prototype layer from the start (questions over the lab after each
   step, stepper, sound, memo card — §6ter). Work in this order, and never
   start from a widget:

   ```
   the lesson's الكفاءات (catalogue + textbook)        — the textbook is the reference, not the script (§4ter)
      ↓  candidate entries: the textbook activity, AND at least one platform situation
      ↓  choose the one where the idea becomes NECESSARY for the hand; write why in lesson.config.js
      ↓  extract the mathematical objective and structure (not the story)
      ↓  judge the textbook's context: is it already manipulable and engaging?
      ↓  keep it, adapt it, or choose a context a 4AM student lives in
      ↓  مبتدئ  — small numbers, one obvious gesture, visible consequence
      ↓  متقدم  — same objective, scaffolding removed or a real decision added
      ↓  pick the type: reuse an existing one, or justify a new one
      ↓  declare `level`, `objective`, `autonomy`, `experience`, `sourceElementIds`
      ↓  validate: mathematics, interaction, age-appropriateness
   ```

   The objective is identical at both levels — that is what makes them two
   experiences of one concept rather than two exercises. Keep the textbook's
   context whenever the drawing *is* the mathematical argument.
5. Write `lesson.config.js`, then `content/textbook.js` and
   `content/exercises.js` (with sources), then `knowledge.jsx`.
6. Write the modules, in order, on `ContentModule`.
7. Add exercises and the evaluation module with its assessment metadata.
8. Wire `index.jsx`, `routes.jsx`, `moduleContext.js`.
9. Run the gates (§11) and fix what they say — including `lab-rollout-status.mjs --lesson <id>` ✅ (§6ter).
10. Verify in the browser: Arabic everywhere, RTL at 768 px (tablet) and 1280 px, the manipulation by
    real gesture, progression through the whole lesson, Classroom Mode.
11. **Update the documentation** if you introduced a reusable pattern — root
    `CLAUDE.md`, Documentation Synchronization Rule.

---

## 11. What you must run

### Cultural and religious respect (owner, 2026-10-26 — applies to every generated lesson, module, exercise, icon, badge)

The platform serves Algerian Muslim students. Never put in student-visible text, a catalogue `icon`, a badge `emoji`, a scene
or a bank sheet: the pig (🐷 🐖 🐗 — a savings box is 💰, never a pig), alcohol or drinks of it (🍷 🍺 🍻 🥂 🍸 🍹), pork (🥓 🌭), gambling
(🎰 🃏 and dice or cards used as a game, casino, lottery, betting), usury/interest on loans as a context, non-Islamic festivals and religious
symbols (🎄 🎅 ⛪ ✝️ 🕍 🔯), dancing or music-hall contexts, or any statement touching them. Prefer neutral everyday Algerian
contexts (market, school, bakery, football, garden, trip). Dice/cards as a neutral PROBABILITY object are tolerated only in the
probability lab tools, never as a game or a bet in a story. Before publishing, grep the new lesson folder, its bank and its
catalogue entry for the emoji and words above; fix, never rationalise.

### Publish a lesson (cycle moyen rollout, owner decisions D6 and 2026-10-14)

A 1AM–3AM lesson is published **as soon as it is generated**, so the owner can review it while the next one is
written. **Owner decision (2026-10-14): « publish » means pushing to `dev`.** CI runs and nothing is deployed. The owner
reviews `dev` and promotes it to `main` (the production deploy) when they choose. The exact sequence, for a
lesson `<code>` of grade `<g>`:

1. **Catalogue flip**, in `packages/core/curriculum/dz/lessons_<g>_2026_2027.json`:
   - `status: "coming_soon"` → `"available"`;
   - final `pointsToLearn` (same order: LP ids are positional), `durationMinutes` (the module total WITHOUT the مسائل — what `validate:lessons` compares it to; the whole lesson, مسائل included, stays ≤ 90; `smarter:validate-curriculum`
     requires it of an `available` lesson), `difficulty`, `icon`;
   - `pointPrerequisites` only along a net link (`LEARNING_NET.md` §4.6).
   The lesson keeps its `code` and `programmeItems`.
2. **Wiring:**
   - `node scripts/generate-lesson-index.mjs` — the lesson enters `lessons/lessonIndex.generated.json`, which mounts
     its routes (nothing to add to `App.jsx` since 2026-10-14; `check:routes` and the index `--check` fail otherwise);
   - if it has practice: its bank in `content/practice/<g>/<code>/`, its `active.json` entry, and `exam-style.json`
     when its sheets are exam-style (`EXERCISE_CONTRACT.md` § « Term-exam provenance »).
     The lesson summary then shows the bank card (« بنك تمارين هذا الدرس » for a teacher, the practice entry for a student,
     `features/practice/PracticeEntryCard.jsx`). The dev server watches `content/practice` since 2026-10-14
     (`vite.config.js › watchPracticeContent`): before that, a server started before the bank existed kept the old
     `active.json` and hid the card until restarted.
3. **Regenerate** the net's map and queue (the lesson drops out of the queue): `npm run generate:learning-net`.
4. **Local DB handshake:**
   ```bash
   node packages/core/curriculum/exportCurriculum.mjs
   (cd apps/api && php artisan smarter:import-curriculum)          # coming_soon → available: draft → published
   node packages/core/curriculum/exportContentRegistry.mjs
   (cd apps/api && php artisan smarter:import-content-registry)    # modules take the lesson's state; exercises are published
   ```
   **Pushing publishes** (owner, 2026-11-11): the import publishes an `available` lesson still `draft`
   (`CurriculumImporter::publicationOnUpdate`), a **module has no state of its own** — it carries its lesson's state, written
   by the import and by the admin's lesson gesture — and an exercise is born `published` under a published lesson (a `draft`
   one there is published). Nothing is left to publish by hand, locally or in production: the deploy's import does it.
   `hidden` / `archived` are kept (that is how the admin holds a written lesson back). `php artisan
   smarter:publish-available-content` (and the manual workflow `publish-content.yml`) remains as a one-off repair for rows
   imported before this rule.
5. **Gates:** `npm test`, `npm run check:lessons`, `npm run build` (§ below). Then a browser check at 768 px and 1280 px, in RTL.
6. **Commit and publish:** commit on a work branch, fast-forward `dev`, `git push origin dev`. CI (`ci.yml`) runs
   tests, build and the PHP suite. **Nothing reaches production until `dev` is merged into `main`**: `deploy.yml` then
   exports, imports (`--from-json`), prunes and checks tiers on the server.


```bash
npm test                 # packages/core, then apps/web, then scripts
npm run check:lessons    # the full editorial gate chain (see below)
npm run build
```

`check:lessons` runs, in order: `validate:lessons --strict`,
`validate:exercises --strict`, `audit:knowledge:gate`, `check:katex`,
`check:routes`, `check:non-blocking`, `check:dormant-isolation`,
`check:textbook`, `check:activation-drift`. (`check:level-leak`, a French 6e
vocabulary audit, was removed with the French lessons on 2026-09-25;
`check:dormant-isolation` now also fails if a `lessons/college|lycee/` folder
comes back.)

**Answer keys are checked, not trusted** (2026-09-24 answer audit).
`validate:lessons --strict` refuses, in live `moyen/` lessons, an assessed
option object or a `<TapQuestion>` without an explicit `correct`, or with a
`correct` outside its option range. `validate:exercises --strict` replays every
practice key through the real evaluator (key accepted, every distractor
rejected, no misconception signature that is itself correct), and
`scripts/practice-answer-oracle.test.mjs` recomputes each constructed answer
from the mathematics — **a new constructed-answer practice question needs an
oracle entry** or `npm test` fails. When you write distractors, make each one
**false**, not just "not the book's argument"; say whether bounds are strict.
Details: [`EXERCISE_CONTRACT.md`](../architecture/EXERCISE_CONTRACT.md)
§ « Answer-key integrity ».

**Exercises from another official sheet** (not the textbook) go into the
practice bank with a declared provenance file and `source.type: "worksheet"` —
the full recipe is [`EXERCISE_CONTRACT.md`](../architecture/EXERCISE_CONTRACT.md)
§ « Non-textbook sources — worksheets ».

If you touched a **module 0** or a **final test**, also run the test-presentation
suite against a running dev server (`npm run dev`), on a port the API's CORS
allows (5173 / 5174 / 4173):

```bash
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/test-presentation.mjs
```

> **`check:activation-drift` reads your database, not just the files.** It
> fails when the local database and the file catalogue disagree about which
> lessons exist or what they cost — typically after you add, rename or remove a
> lesson without re-running the import handshake:
>
> ```bash
> node packages/core/curriculum/exportCurriculum.mjs
> cd apps/api && php artisan smarter:import-curriculum
> ```
>
> A lesson **deleted** from the catalogue leaves its database row behind on
> purpose, because student history references it. On a development database
> that row keeps the gate red; reconcile it with
> `smarter:prune-retired-learning-points --with-history` (local only, needs
> `--force`). The full rule, including what must never be done to production,
> is in
> [`../architecture/LEARNING_ARCHITECTURE.md`](../architecture/LEARNING_ARCHITECTURE.md)
> § Curriculum sync.

### Backend tests, and the local config trap

```bash
cd apps/api && php artisan test          # the committed config (SQLite in memory)
```

If this machine has no `pdo_sqlite`, the repository convention is a **local,
gitignored override** pointing at MySQL:

```bash
cd apps/api && php artisan test -c phpunit.local.xml
```

> **Keep that override's `<env>` block in step with `phpunit.xml`.** It exists
> only to swap the database driver, so every other variable must match. The one
> that matters most is:
>
> ```xml
> <env name="CURRICULUM_ENFORCE_ACTIVE_GRADES" value="false"/>
> ```
>
> The active-grade gate is **deliberately off during tests**
> (`config/curriculum.php` explains why): the inherited Feature suite builds ad
> hoc grade fixtures — `6e`, `seconde`, `3e` — to exercise publication, tier
> and entitlement logic that has nothing to do with grade activation.
> Active-grade isolation has its own dedicated coverage (`registry.test.js`,
> `check-dormant-isolation.mjs`, `check-routes.mjs`).
>
> Omitting that line makes eleven progression and evidence tests fail on a 422,
> which reads exactly like obsolete French fixtures. It is not: it is the local
> override having drifted. Diff the two `<env>` blocks before concluding a test
> is stale.

Browser suites (Playwright scripts, not in CI — start the **dev** server first):

```bash
npm run dev    # 5173
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-aadad-tabiiya-natiqa.mjs
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-hisab-judhur.mjs   # unit 2: every module mounted at 1280/320 px + the three root labs
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-hisab-harfi.mjs    # unit 3: every module at 1280/320 px + the pitch and turf labs by real gesture
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-muadalat-mutarajihat.mjs  # unit 4: every module at 1280/320 px + the four labs by real gesture
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-jumal-muadalatayn.mjs     # unit 5: every module at 1280/320 px + the three labs by real gesture + one-screen fit at 4 viewports
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-tanasubiya-dala-khattiya.mjs  # unit 6: unit page + every module at 1280/320 px + every lab's glance block in one screen at 4 viewports, both levels
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-tanasub-muamil.mjs           # unit 6 L1: ratio-ride by real gesture (drag, keyboard, refusals, ghost column in Arabic digits)
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/math-raw-scan.mjs                # every page of every 4AM lesson: no raw `$…$` / `\command` / KaTeX error in visible text (INDEX_ONLY=1: catalogue, units, indexes)
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-dala-taalufiya.mjs            # unit 7: unit page + every module at 1280/320 px + the five labs' glance blocks in one screen at 4 viewports, both levels (224 checks)
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-ihsa.mjs                       # unit 8: unit page + every module at 1280/320 px + the four labs' glance blocks (stat-balance twice) in one screen at 4 viewports, both levels
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-khassiyat-talis.mjs              # unit 9: unit page + every module at 1280/320 px + the five geometry labs' glance blocks in one screen at 4 viewports (the synthesis switches type with the level)
#   LABS_ONLY=1 skips the mounts; MOUNT_ONLY=1 (unit 9) skips the labs; MOUNT_LESSONS=a,b mounts only those lessons (the full run is ~35 min — split it)
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-hisab-muthallathat.mjs          # unit 10: unit page + every module at 1280/320 px + the four trigonometry labs (clinometer twice) in one screen at 4 viewports × 2 levels; LAB_MODULES=lesson:N moves a lab's module
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/1am-jam-tarh-ashriya.mjs          # 1AM unit 2: unit page + every module at 1280/320 px, story-bars by keyboard and tap-tap, one-screen fit at 4 viewports × 2 levels
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/1am-darb-qisma-ashriya.mjs         # OPENS DELETED PAGES since 2026-11-18 (trace §8, follow-up 4) — 1AM unit 3: every module at 1280/320 px, division-jumps short/over/exact by −/+ at both levels, one-screen fit at 4 viewports
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/1am-qawaid-qabiliyat-qisma.mjs   # OPENS DELETED PAGES since 2026-11-18 (trace §8, follow-up 4) — 1AM unit 3 lesson 3: every module at 1280/320 px, digit-cards (14 coloured, 15 refused with its remainder, 9534 placed and lamp 2 opened), one screen at four viewports × two levels
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/3am-quwa-nisbiya.mjs            # 3AM unit 3 lesson quwat-adad-nisbi: every module at 1280/768 px, power-train by keyboard, tap and a tap on the ruler (16, −32, 1, 1/9, couple 7), one screen at five sizes × two levels + couple (123 checks)
KIT_BASE=http://localhost:4173 node apps/web/e2e/lesson-kit/3am-ibarat-harfiya-3.mjs        # 3AM unit 4 lesson tabsit-hadhf-aqwas: every module at 1280/768 px, like-terms by tap-tap, mouse drag and keyboard (collect) + coefficient check (متقدم) + the brackets world (+( ) kept, −( ) refused then flipped), one screen at five sizes × two levels + brackets (GLANCE_ONLY=1 runs only the one-screen part)
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/manipulations.mjs
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/classroom.mjs
```

Always pass `KIT_BASE`. The default is 5183, which is `vite preview` serving a
stale build with no API.

**Offline or slow network (2026-10-01).** `index.html` loads Google Fonts; when they are unreachable
the browser's `load` event waits for them and every `page.goto` times out. `helpers.mjs › newCtx`
(and `test-presentation.mjs`, which builds its own context) therefore aborts `fonts.googleapis.com` /
`fonts.gstatic.com` — fonts carry no assertion. A suite that creates its own context must do the same.
If 5173 is taken, Vite starts on 5174 (also CORS-allowed): pass the port it printed.
**A long-running dev server can serve a stale catalogue** (2026-10-01): after editing `packages/core/curriculum/dz/*.json`
a server started earlier redirected the new unit's page to `/courses`. Start a fresh server (`npx vite --port 5174`)
before concluding a new lesson or unit is broken.

**What a new lesson must verify**

- *Functional*: every module reachable in order; every step completes on
  answered; a deliberately wrong run still progresses and shows the correction;
  the manipulation responds to a real gesture and to the tap and keyboard
  alternatives; exercises validate and explain; progress survives a reload.
- *Arabic & RTL*: no French or English prose in any state, including
  `aria-label` and placeholders; every `N / M` pair isolated `dir="ltr"`;
  terminology matching the register.
- *Responsive*: 768 px with no horizontal scroll, touch targets ≥ 44 px for
  controls (tablets are touch), and the tablet and laptop widths. Phones are out of scope.
- *One screen*: every manipulation fits one viewport with its controls (no
  vertical scroll to interact) at 1024×768, 1280×800, 1366×768 (phone sizes retired).
- *Classroom*: entry as a presenter, unit navigation, state surviving
  enter/exit, no page scroll, exit restoring the page.
- *Accessibility*: keyboard path for every gesture, visible focus, readable
  contrast, semantic controls.
- *Regression*: the other lessons of the unit still pass their suites.

---

## 12. Do not do this

Each of these has actually happened in this repository, or is a standing rule.

**Math in text**
- Do not print a content string with `{bidi(x)}` (or raw `{x}`) in JSX when it may carry `$…$`: the student
  reads the dollars. Use `<MathLabel>{x}</MathLabel>`, or `mathToPlain(x)` where only a string fits
  (ARABIC_RTL_CONTRACT « Content text outside a module »). Owner report, 2026-10-02: 122 raw formulas, 7 units.

**Characters**
- Do not draw a person locally (circles, rectangles, a new figure component): use `KidFigure` (§6 « People are the
  platform's CHARACTERS »). Do not draw a girl without the hijab and Islamic dress (owner, 2026-10-14). Do not let a
  character's drawn height disagree with the ruler.

**Progression**
- Do not gate a step on a *correct* answer (§4). Release blocker.
- Do not test a module number for truthiness. Module `0` exists; use
  `isValidModuleNumber`.
- Do not render `<CompleteView />` without items — use
  `<KnowledgeSnapshot complete />` for the final synthesis.
- Do not make a step depend on a manipulation's `onFinished` unless it is the
  module's own, default-open textbook activity with a reachable formal phase
  (MANIPULATION_CONTRACT §7bis). Never on a question's correctness.
- Do not let a diagnostic (`prerequisite_check`) block the next module.
- Do not put an evidence-generating question outside an `evaluation` module.
- Do not invent or compute a learning-point id; only ids from this lesson's
  `pointsToLearn` may appear in `learningPointIds` / `learningPoints`.
- Do not list several `learningPointIds` on one question; use
  `learningPoints` with exactly one `primary`.
- Do not compute `correct`; the registry exports it as the answer key.
- Do not call a completed path « إتقان »: completion and mastery never share
  words (`ARABIC_RTL_CONTRACT.md` § « Mastery and completion never share
  words »).

**Architecture**
- Do not write another fullscreen, scroll lock, Escape handler or toolbar. A lab that must fill the laptop screen (« game screen »,
  owner 2026-10-27; ON BY DEFAULT for every lab since 2026-10-28) uses `ManipulationShell`'s `immersive`, which reuses `useFullscreen` + `useScrollLock`
  (MANIPULATION_CONTRACT § « Game screen »); its scene reads `useManipulationImmersive()` to use the screen's height.
- Do not build a second state-management or progress system; `useProgress` and
  the queues are it.
- Do not build DOM-based lesson navigation; routes come from the config.
- Do not change the curriculum hierarchy to make one lesson easier to build.
- Do not add a manipulation component from content; the type registry is closed.
- Do not fork a shared component; extend it behind an optional prop.
- Do not copy an existing lesson wholesale and edit it — read it, then write
  yours. Reference ≠ template, and a copied lesson inherits copied bugs.

**Content and language**
- Do not add mathematics the textbook does not contain because it "seems
  incomplete".
- Do not silently change established terminology (الوحدة ≠ المحور).
- Do not introduce French or English UI text, including in defaults, fallbacks
  and `aria-label`s.
- Do not import a lesson-level Arabic font or override the global typography.
- Do not render a server `message` to a student.

**Two-level workspaces**
- Do not ship one level only. `validate:lessons` rejects it, and a lone
  « مبتدئ » leaves the confident student with nothing to climb.
- Do not make « متقدم » the same screen with bigger numbers. It must remove
  scaffolding or demand a real decision, and say so in `autonomy`.
- Do not change the `objective` between levels. The context may change; the
  mathematical objective may not.
- Do not replace a textbook situation without declaring `experience.reason`.
- Do not render the same manipulation twice on one page — check the module's
  steps before adding a level that duplicates one of them.
- Do not make the student scroll between a figure and the controls that move
  it (MANIPULATION_CONTRACT §8bis — found on unit 5's 32 agents, 2026-10-01).
- Do not add a third level, a hidden level, or a « palier » row inside a
  manipulation. Two levels, one selector.
- Do not let a manipulation replace its own scene on a threshold (« after
  three tries, show the lists »). A second laboratory is opened by the
  student, with an explanation and a way back — and only at متقدم.
- Do not write a `lead` that promises a stage the level does not have
  (« ثم تجد الأعداد نفسها في القائمتين » on a groups-only مبتدئ).
- In e2e, do not select a manipulation with `.first()` when its type serves
  both levels: it resolves to the `hidden` panel and the test hangs. Use
  `pickLevel()` and `visibleManip()` (`manipulations.mjs`).

**Visuals**
- Do not generate a raster image for anything under `lessons/`.
- Do not replace a concrete object with an abstract bar when the pedagogical
  intent is concrete manipulation.
- Do not add decorative animation; every animation must explain a mathematical
  relationship.
- Do not show a وضع القسم toggle inside a module.
- Do not ship a lab without the prototype layer (questions over the lab, `LabStepper`, celebration, `playSfx`, restart-all, `guided`),
  nor a module footer without `variant="memo"`, nor a knowledge item without `memo` (§6ter). Do not re-ask in the module the questions
  the lab already asked: keep the trace. Do not hand-make dots, a second question gate or a second memo card.

---

## 13. Documentation is part of the task

If your work introduces or changes a reusable pattern — a module shape, a
question type, a manipulation or manipulation behaviour, an exercise type, a
feedback pattern, a `KnowledgeBrick` usage, progression behaviour, a Classroom
presentation pattern, an Arabic/RTL convention, a responsive interaction
pattern, or a reusable component — update this guide and the relevant contract
**in the same task**, and report it. The full rule is in the root `CLAUDE.md`.

## 14. LESSON REFERENCE ARCHITECTURE — FROZEN FOR GENERATION (2026-09-29)

> **Amended 2026-09-29 (owner-approved):** the Knowledge Map row of §14.2 now
> requires the progressive map (`knowledgeGraph.js` + `knowledgeMapMode`) and
> §14.3 adds its checklist — `KNOWLEDGE_MAP.md` Part A. Everything else in §14
> is unchanged. **Same day, later:** the eight other lessons were migrated to the
> map and its blockers resolved (gate in `validate-lessons.mjs`, per-lesson
> invariants in `lessonGraphs.test.js`) — `KNOWLEDGE_MAP.md` A.15.
>
> **Amended 2026-10-14 (owner):** two rows added to §14.2 — « Pedagogical design » (the textbook is the reference of
> the الكفاءات, not the script: §4ter) and « Module track » (act first, answer about it, then name it: §4quater). The
> file layout, the components and the gates are unchanged; reference `kitabat-adad-tabii`.

The architecture below was audited end to end on 2026-09-29 (all nine lessons,
every shared component, every gate, the server judge and the browser suites;
record: [`../reports/LESSON_ARCHITECTURE_AUDIT_2026-09-29.md`](../reports/LESSON_ARCHITECTURE_AUDIT_2026-09-29.md)).
It is the reference a generated lesson must follow. **Generated lessons reuse
it; they never add a parallel lesson architecture.** Changing any part of it is
an architectural change, made deliberately and documented here first.

### 14.1 The real structure

```
App.jsx ─ CourseLayout
  ├─ /courses/:level/:grade/:chapter/units/:unit      → UnitPage (unit card, 8 lessons + synthesis)
  └─ useLessonRoutes() (lessonRouteBoundary.jsx, one entry per lessonIndex.generated.json line)
       ├─ not loaded: <basePath>/* → loads routes.jsx (+ config) and lesson.manipulation.json, then ↓
       └─ loaded:     <lesson>Routes() ─ buildLessonRoutes (_unit/lessonRoutes.jsx)
       └─ LessonClassroomShell   (pathless layout: one Classroom session across modules)
            ├─ LESSON_BASE_PATH  → LessonAccessGate → KnowledgeProvider → LessonIndex
            └─ modules[].path    → LessonAccessGate → KnowledgeProvider → NotebookAnchor → Module<NN>
                                     └─ ContentModule | PrerequisiteDiagnostic | BossFinal
                                          └─ ModuleLayout (breadcrumb الوحدة/الدرس/المحور, header,
                                             step bar, prev/next, the ONLY completion writer)

A lesson  = lesson.config.js + index.jsx + routes.jsx + moduleContext.js + knowledge.jsx
            + content/{textbook.js, exercises.js} + modules/Module<NN><Descriptor>.jsx
A module  = one stage (prerequisite_check → trigger → discovery → manipulation →
            formalization → practice_lab → evaluation), numbers contiguous from 0 or 1
Knowledge = knowledge.jsx items, laid by <KnowledgeBrick> where taught, mapped by the Knowledge Map,
            demanded by `requires` (audited), closed by <KnowledgeSnapshot complete> in the final test;
            structured by knowledgeGraph.js (progressive map — every lesson, KNOWLEDGE_MAP.md Part A)
Evidence  = ONLY the evaluation module's assessed questions → { picked } → server registry judge
            → versioned mastery engine (Learning Point states). Everything else is formative.
Progress  = useProgress (localStorage cache) → progressQueue → PUT /progress (union merge)
Practice  = content/practice/<grade>/<lesson>/level-N (separate engine, server-judged evidence)
```

### 14.2 The generation contract — what a generated lesson must implement

**Input (must exist before any JSX):**
grade and المجال; the الوحدة in `units_<grade>_*.json`; the lesson entry in
`lessons_<grade>_*.json` with its `pointsToLearn` (learning-point ids are
DERIVED: `{grade}_{lessonId}_P{n}`), `prerequisiteLessonCodes`,
`durationMinutes`, and its **`programmeItems`** — the official items of the
learning net it teaches (`LEARNING_NET.md`; for 1AM–3AM the entry already
exists, `coming_soon`, with its code, items, draft الكفاءات and net-derived
`prerequisiteLessonCodes` since 2026-10-14 — the lesson is generated INTO it,
then published (§11 « Publish a lesson »); `noRebuildForLesson(code)` says what
the lesson must recall rather than rebuild — §4 of that contract); the textbook extraction `docs/sources/<grade>/<unit>/extraction.json`
for every element the lesson cites. Mastery criteria are the server's
(Mastery V2) — a lesson declares none.

**Required output:**

| Part | Contract |
|---|---|
| Files | exactly the layout of §3; `index.jsx`, `routes.jsx`, `moduleContext.js` are the one-line factories |
| `lesson.config.js` | static literals only; `id` = catalogue code; `kind`; `unit`; stages in journey order with the required set per kind (§3); `teachesLearningPointIds` on every learning module covering every LP; `estimatedDurationMin` = Σ `estimatedMin` ≤ 90; `color` a `COLOR_MAP` key; `resources[]` for every workspace manipulation (both levels, same `objective`, `autonomy` on advanced, `experience` with reason and theme) |
| Pedagogical design | §4ter: the textbook fixes the الكفاءات, the platform designs the entry point, the examples and the order; the design (chosen entry, rejected candidates) is written in the `lesson.config.js` header; a textbook activity not chosen as entry is posed as an application |
| Lab prototype | **mandatory (owner, 2026-10-28)**: questions over the lab after each step (`useLabCheckpoint`, teacher switch), `LabStepper`, celebration, `playSfx` sound, « إعادة » restarting everything, full screen, `guided` shell — §6ter, `reports/LAB_PROTOTYPE_ROLLOUT.md` §2 (L1–L9); `lab-rollout-status.mjs --lesson <id>` must print ✅ |
| Lab onboarding | every manipulation has `LabCoach` (default on): a ring + one-sentence bubble on the control needed now, shown once, hidable — MANIPULATION_CONTRACT §8quater; the lab's pure `coachOf` is tested by following it to the end of every task |
| Module track | §4quater: one track per module — the action at the top (lab with no brief above it, or the first question), then questions on what the student did, then the name (box, brick); the steps under a lab keep only the TRACE of the lab's own questions (§6ter, C4) |
| Module shape | `ContentModule` for content, `PrerequisiteDiagnostic` for « أستعدّ » (module 0, `priorKnowledge` only, questions as literal objects with `requires` — §4 « The « أستعدّ » pattern »), `BossFinal` for « إختبار أولي » — never a hand-rolled module shell, test UI, fullscreen, toolbar or progress write |
| Steps | `done` on ANSWERED, never on correct (`check:non-blocking`); a step may wait on `onFinished` only per §6; never pass `locked` |
| Questions | kit components only (`TapQuestion`, `BatchChoiceQuestion`, `NumericQuestion`, `TextbookExercise` for the textbook's exercises); explicit `correct`; every distractor FALSE; `requires` on every question; the parsers of §5, never a custom one |
| Manipulation | a type from the closed registry (`MANIPULATION_TYPE_IDS`, 54 types on 2026-10-04), two levels in one `ManipulationWorkspace`, the lesson's world as a `theme` (§6); a new type only by the recipe of MANIPULATION_CONTRACT §7ter |
| Knowledge | `knowledge.jsx` with a plain-text `summary` per item; a brick at the point of teaching; `knowledgeMap: true`; every content module's footer `<KnowledgeSnapshot moduleNumber={N} variant="memo" />` and every item's `memo` card data `{ rule, hook, example, trap, exam, chip, quiz }` (§6ter; `KNOWLEDGE_MAP.md` « The memo card »); the final test's `synthese={<KnowledgeSnapshot complete variant="complete" />}`; **and** the progressive map from the start (owner decision, 2026-09-29): a `knowledgeGraph.js` exporting `KNOWLEDGE_GRAPH`, re-exported by `knowledge.jsx`, and `knowledgeMapMode: 'progressive'` — every item carried by a `notebook` node, labelled relationships, guidance only where the lesson's own exercises / questions / « أستعدّ » support it, authored per `KNOWLEDGE_MAP.md` A.10 (rules 1–16) and passing A.14. Enforced: `validate-lessons.mjs` refuses a lesson with a map but no mode / graph / re-export, and `lessonGraphs.test.js` runs the A.14 invariants on every lesson without any per-lesson code |
| Final test | only in the `evaluation` module; every question assessed with ONE primary LP of this lesson; every LP covered; 4–6 questions; timer ≈ 1 min per question + 1; `badges`, `completion`, `skills` as in the reference lessons |
| Textbook | every pedagogical block carries a `source` (`src()` / `addition()`); `check:textbook` maps each extracted element to exactly one destination |
| Figures | every textbook figure ANALYSED, then reproduced if readable or REDESIGNED with the same concept (answers recomputed, one-line caption), and `figureQuality(fig)` empty in `content/figures.test.js` (§5 « Textbook figures ») |
| Practice | a separate bank under `content/practice/**` with provenance, oracle entries for constructed answers (§11) |
| Arabic/RTL | all user-visible text Arabic (including `aria-label`, `title`, placeholders, KaTeX `\text{}` — put words in DOM, not in KaTeX); numbers and equations `dir="ltr"`; `PGCD` Latin |
| Responsive / a11y | no horizontal scroll at 768 px; controls ≥ 44 px; every gesture has a tap and keyboard path; visible focus; reduced motion honoured |
| Teacher / Classroom | nothing: `buildLessonRoutes` + `ContentModule` give free navigation, the مذكرة, the premium gate and Classroom Mode |

**Reuse, never rebuild:** `buildLessonRoutes`, `buildModuleContext`,
`ContentModule`, `ModuleLayout`, `BossFinal`, `PrerequisiteDiagnostic`,
`TestPresentation`, the kit questions, `TextbookBox`/`SourceTag`/`MethodSteps`,
`KnowledgeBrick`/`KnowledgeSnapshot`, `Manipulation`/`ManipulationWorkspace`,
the primitives (`GroupingScene`, `BrickWall`, `RibbonStrip`, `BookRectangle`…),
`useProgress`/`useEvidenceSubmission`/`useFinalTestAttempt`, the parsers of
`@smarter-academy/core`. Prohibited: everything in §12, plus a second state or
progress system, a second corrector, a client-computed verdict sent as
evidence, a raster image under `lessons/`, a `tier` anywhere in the lesson.

### 14.3 Validation a generated lesson must pass

| Gate | Command / check |
|---|---|
| Build | `npm run build` |
| Unit + scripts tests | `npm test` (core, web, scripts — includes the practice oracle and the memo builder over every lesson) |
| Lab prototype | `node apps/web/scripts/lab-rollout-status.mjs --lesson <id>` ✅; `npx vitest run <lab dir> <lesson dir> src/lessons/common/knowledge/memoContent.test.js src/lessons/common/i18nHookScope.test.js`; browser walk-through of `LAB_PROTOTYPE_ROLLOUT.md` §6 at 1366×768 (a task to the card, a wrong answer, the celebration, « إعادة », full screen, sound off, the memo card and « اختبر ذاكرتك ») |
| Editorial gates | `npm run check:lessons` (validate:lessons --strict, validate:exercises --strict, audit:knowledge:gate, check:katex, check:lesson-index, check:routes, check:non-blocking, check:dormant-isolation, check:textbook, check:activation-drift, check:learning-net, check:entry-budget) |
| DB handshake | `node packages/core/curriculum/exportCurriculum.mjs && php artisan smarter:import-curriculum`; `node packages/core/curriculum/exportContentRegistry.mjs && php artisan smarter:import-content-registry` |
| Runtime | `node apps/web/e2e/lesson-route-boundary.mjs` (the lazy lesson mount: deep link, classroom shell kept, lab strings, unknown module → `*`, unit page, مذكرة; 2026-10-14), the browser suites of §11 against the dev server (all green on 2026-09-29: 27/27, 183/183, 73/73, 47/47, 9/9) + the new lesson loaded at 320 / 414 / 820 / 1440 px with no console error, no failed request, no horizontal overflow |
| Mathematics | every key recomputed; every distractor false; parsers exercised with Arabic digits |
| Interaction | the manipulation by drag, tap and keyboard; a deliberately wrong run still progresses; reload keeps progress |
| Knowledge Map | the checklist of `KNOWLEDGE_MAP.md` A.14 — core items all carried, relationships labelled, guidance grounded in the lesson (automated: each aid quotes the lesson word for word; relevance reviewed by a human), mistakes with wrong / why / right, the map not overloaded, ① first in « المعارف مفصّلة », every equality inside `$…$` and arithmetically true, mathematics never truncated or mirrored, locked until taught, no evaluation answer in the map; browser QA `node apps/web/e2e/knowledge-map.mjs` |
| Documentation | a new reusable pattern is documented here and in its contract in the same task |

### 14.3bis Modules « مسائل » (2026-10-05, prototype validated 2026-10-06)

A lesson adds three exam-style problem modules (`track: 'problem'`, before the
evaluation), built from data with `GuidedProblem`, never hand-written JSX.
**Everything — owner rules, design method, schema, wiring, validation, pitfalls,
parallel rollout — is in [`MASAIL_GENERATION_GUIDE.md`](./MASAIL_GENERATION_GUIDE.md).**
Reference lesson: `qasim-adad-tabii`. **Since 2026-10-07 every regular 4AM lesson (60) has its
three مسائل** — a new lesson ships with them (MASAIL guide §7–§8; statement support `figure` /
`visual` / `table` / `illustration`, problem 1's support in `lessonProblem`). **Since 2026-10-13 every مسألة has a drawn support** (`illustration` kinds `plan` `stacks` `tags` `tanks` `route` `ladder` `timeline` `scene` + the six sheet drawings — `MASAIL_GENERATION_GUIDE.md` § `illustration`; gate `common/problems/masailIllustrations.test.js`: no support, or a number not in the statement, fails). Synthesis lessons have none.

**« مسألة الدرس » lives in ONE place (owner, 2026-10-14).** `config.lessonProblem` is shown on the lesson's summary page
(`LessonIndex` → `LessonProblemCard`, linked to the module that solves it) and solved step by step in its « مسألة » module
(`GuidedProblem`). It is NEVER re-printed inside another module (not at the end of the نشاط, not as a reminder): gate
`common/problems/lessonProblemPlacement.test.js` fails on any module that renders `LessonProblemCard`.

### 14.3ter « أتوقّع القاعدة » — the student writes the rule before reading it (2026-10-06)

Every new `KnowledgeBrick` of a rule the student can conclude is gated by default
in ALL lessons: the student writes the rule in their own words, then sees it.
When you author a lesson: give each predictable `knowledge.jsx` item a
`predictPrompt` built on what the student has just done; wrap a `TextbookBox`
that introduces a rule (no brick before it) in `<PredictRule id prompt>`; never
place a box stating the rule right before its brick. Full contract:
[`../architecture/KNOWLEDGE_DEPENDENCY.md`](../architecture/KNOWLEDGE_DEPENDENCY.md) § « أتوقّع القاعدة »;
how to write the prompts: [`PREDICT_PROMPT_GUIDE.md`](./PREDICT_PROMPT_GUIDE.md).
**Since 2026-10-07 every gated rule of every lesson has its own prompt (296 / 296) and
`check:lessons` runs `audit-predict-prompts.mjs --strict`: a new lesson without its prompts fails.**

### 14.4 Known open items (do not block generation)

Recorded by the audit, owned by the product owner, none of them a defect a
generated lesson would inherit if it follows 14.2:

- A module closed by the admin between a student's offline completion and the
  sync makes that lesson's later snapshots 422 (PROGRESS_MODEL « Known gap »).
- `priorKnowledge` mixes previous-year knowledge and earlier lessons of the
  unit. Since 2026-09-30 all 9 lessons have a « أستعدّ » that diagnoses every
  declared id (the audit reports no `W_PRIOR_NOT_DIAGNOSED`); 39 of the 49
  statements are platform additions, because the textbook has only 10.
- The weak-prerequisite recommendation links to the prerequisite's lesson
  (2026-09-29). Since 2026-10-13 the diagnostic result shows « راجع قبل أن
  تنطلق » from the learning net, but a weak answer does not yet highlight its
  own card (the `priorKnowledge` slugs are not mapped to net items —
  `LEARNING_NET.md` §8).
- Seven textbook-activity steps wait on their lab's `onFinished` (allowed, §6; the list is in
  MANIPULATION_CONTRACT §7bis).
  The reference lesson's module 1 does **not** wait (its default level is the
  platform's football warm-up by owner decision); its step 1 lists the
  student's own trials instead. This is a documented exception to « the
  default level serves the module's task ».
- Lessons 2–9's manipulations were redesigned against `MANIPULATION_DNA.md` on
  2026-09-30 at the owner's request (see its §15 for what changed per lesson). Still
  open from the audit's Part II: dormant class-mode code (untested), the standalone
  labs' second level (defect k) except the معارف 143 worked example, and
  `NumberTile size="sm"` at 40 px on the list chips.
- The textbook's own erratum « رتبة عشرات الآلاف (مشكّل من أربعة أرقام) »
  (wadiya analysis) is kept verbatim: textbook words are never edited.
- `docs/reports/QUESTION_ANSWER_AUDIT_2026-09-24.md` « Flagged » items that are
  wording choices (true-fact distractors in bahth M01, « فقط » in khawass E1…).

## « مختبري » — the lab of the lesson (2026-11-16, not validated by the owner)

Every lesson that has reached at least one instrument shows a door « 🧪 مختبري » (game-world title screen, mission home, or
beside the lesson chip; `?lab=1`). It is ONE lab for the whole cycle (`lessons/common/lessonlab/`): the instruments of the
lesson, and in « خزانتي » those of every lesson BEFORE it — never of a later one. Contract: `docs/architecture/LESSON_LAB.md`.

What it asks of lesson work:

- **You do nothing to get the door**: `LessonIndex` and `MissionHome` mount it from `hasLab(lesson)`.
- **After adding or re-ordering a lesson** in a catalogue file, run `npm run generate:lab-order` (a unit test fails otherwise).
- **When your lesson has a manipulation worth keeping at hand afterwards**, give it an instrument in the lab: an entry in
  `lessonlab/registry.js › TOOLS` tagged with YOUR lesson's code and exact title, a component in `lessonlab/tools/`, its maths
  and « جرّب » quests in `lessonlab/logic.js` with tests (`LESSON_LAB.md` §3). It is a small free-numbers instrument, not a
  copy of the lesson's lab: one gesture on one mathematical variable, no steps, no questions.
- **An instrument is never silent** (2026-11-17): it plays the lab's own palette (`lessonlab/sound.js`) — the number under
  the hand has a note, « nothing is left » is the one chime `fit`, « something is left » is two soft low notes and never a
  buzzer. The gesture's sound goes in the handler (`play('tick', n)`), the answer's sound through `useChime` so that nothing
  sounds before the student touches the instrument (`LESSON_LAB.md` § « The sounds »; a unit test fails for an unknown name
  or a silent instrument).
- The lab writes no learning evidence and unlocks nothing.

## « مصهر القاعدة » — the student forges the rule (2026-11-18, pilot game world only, not validated)

Where a lesson reaches its rule, the pilot's game world no longer tells it. The student predicts cases he has not tried, writes
his rule with tiles, and the game tests it on HIS OWN trials, then attacks it with a case chosen to break it; a rule that
survives is his, he may say it in his words, and only then it gets its name (`gameworld/divisorIsles/RuleForge.jsx`,
`docs/architecture/GAME_WORLD.md` §2sexies). What is fixed for whoever extends it to another rule:

- **inside the game of the lesson** — never a separate lab, never a box to write in before the rule has been tested;
- **a rule is data the game can evaluate** (pieces → a predicate), so that it can be tested and attacked: write the false
  rules students really hold, and prove by a test that every one of them is contradicted;
- **the verdict is what the world does** (a bridge holds or crumbles), never « wrong »; the help never gives the rule;
- **keep how it was found** (rules tried, nudges, level): it is what a teacher will want to read.

## « عُدّة الانطلاق » — the launch of a lesson (phase 1, 2026-11-17, pilot lesson only, not validated)

A five-minute game before a lesson that measures the earlier الكفاءات it needs (`lessons/common/launchkit/`, contract
`docs/architecture/LAUNCH_KIT.md`). **It changes nothing for lesson work today**: only `qasim-adad-tabii` opens it, and
« أستعدّ » stays the rule everywhere else until the owner validates it. What is already fixed, for whoever extends it:

- the tools of a lesson are its direct prerequisites in the learning net — never a list typed in the lesson;
- a prerequisite enters the game through a **question family** (`families.js`): generated questions on two levels and several
  forms (write / sort / place), wrong answers that NAME a mistake, a worked example, a revision card, and tests that re-compute
  every generated question;
- never the right answer during a station, never one answer to judge a tool, no speed score, no ranking.

## Opening the Math Lab from a lesson (integration point only)

The Math Lab (مختبر الرياضيات, `/espace/atelier`) is a standalone workspace,
**not** part of a lesson. Every lesson page already carries the generic
« 🧪 المختبر » button (`MathLabEntryButton`, mounted by `LessonIndex` and
`ModuleLayout`), which opens the Lab OVER the lesson without seeding it — on
the lab of the lesson's cycle (`<MathLabEntryButton scope={levelId} />`:
مخبر المتوسط for a 4AM lesson, so its instruments show only college
capabilities; `MATH_LAB.md` §2.1). A lesson passes its `levelId`; it never
chooses tools or capabilities itself. What
is **not** built is a *seeded*, per-activity button: do **not** add
« استكشف في المختبر » buttons to lessons as part of ordinary lesson work — that
flow is `Planned`. When it is implemented, the only API to use is
`buildMathLabLaunch({ tool, seed, title, origin })` from
`features/mathlab/openMathLab.js`, which returns `{ to, state }` for
`<Link>`/`navigate`; the instrument builds its initial state from `seed`.
Fourteen instruments exist (`MATH_LAB_TOOLS`, `features/mathlab/toolRegistry.js`;
`PLANNED_MATH_LAB_TOOLS` is empty): the whiteboard (`whiteboard`, seed = Excalidraw
skeleton elements), the function grapher (`functionGrapher`, seed =
`{ functions: [{ expression: '2x+3' }], viewport?, points?, tangent?: { enabled: true, functionIndex: 0, x: 1 } }`
— expressions in the documented subset, ASCII or LaTeX; `tangent` opens the
« المماس » mode on a function), the 3D geometry explorer (`geometry3d`,
seed = `{ shape: 'cone', dimensions?: { radius: 3, height: 4 }, showAxes?, showGrid?, showMeasurements? }`
— shapes `cube | cuboid | sphere | cylinder | cone`, dimensions in
`[0.5, 10]`) and the probability & statistics lab (`probabilityStats`, seed =
`{ experiment: 'twoDice', draws: 1000 }` or
`{ mode: 'dataset', values: [12, 15, 14, 18, 10] }` — a simulation is never
seeded: the student runs it), the algebra lab (`algebra`, seed =
`{ source: '2x + 3 = 11' }` — first degree in one unknown, equalities and
inequalities) and the vectors lab (`vectors`, seed =
`{ scene: { points: [...], vectors: [...], polygons: [...] }, viewport?, settings? }`
— objects carry stable `id`s and reference each other by id, so a seeded
⃗AB is `{ kind: 'points', from: '<idA>', to: '<idB>' }`; an unreadable or
dangling seed falls back to the default plane rather than opening a broken
scene) and the trigonometry lab (`trigonometry`, seed =
`{ mode: 'triangle', triangle: { given: 'opp-hyp', opposite: 3, hypotenuse: 5 }, highlight: 'sin' }`
for the 4AM right-triangle work, or `{ preset: 'unitCircle', angle: 60 }` /
`{ mode: 'circle', angle: 450, unit: 'rad' }` for the circle; `given` is one
of `angle-hyp | angle-opp | angle-adj | opp-adj | opp-hyp | adj-hyp`, the
triangle's angle stays **acute**, and the practice score is never seeded) and
the sequences lab (`sequences`, seed =
`{ primary: { kind: 'arithmetic', first: 2, difference: 3, startIndex: 0 }, count?: 10, cursor?, layers? }`
— `kind` is one of `arithmetic | geometric | affine | explicit | recurrence |
secondOrder`; a free rule travels as **text** in `explicitSource` (`'2n + 1'`)
or `ruleSource` (`'2u - 1'`, where `u` is uₙ), never as a function; or simply
`{ preset: 'fibonacci' }`. Parameters are clamped to `[−1000, 1000]`, `count`
to `[2, 500]`, and the practice score is never seeded) and the
transformations lab (`transformations`, seed =
`{ figures: [{ kind: 'triangle', vertices: [{x:1,y:1},{x:4,y:1},{x:1,y:3}] }], steps: [{ kind: 'rotation', angle: 90, center: { type: 'origin' } }], viewport?, settings? }`
— `kind` is one of `point | segment | triangle | rectangle | square |
polygon`; a step is one of `translation {vx, vy}`, `rotation {angle,
center}`, `reflection {axis}` or `dilation {k, center}`; a `center` is
`{type:'origin'}`, `{type:'vertex', index}` — which then **follows** that
vertex when the student drags it — or `{type:'point', point}`; an `axis` is
`xAxis | yAxis | origin | diagonal | antidiagonal | horizontal {value} |
vertical {value} | line {slope, intercept} | twoPoints {a, b}`. Coordinates
are clamped to ±10⁴, `k` to [−10, 10], the angle normalised into [0, 360),
and the practice score and puzzle state are never seeded) and the conics lab
(`conics`, seed =
`{ scene: { objects: [{ kind: 'circle', h: 0, k: 0, r: 3 }], probe?: {x, y} }, viewport? }`
— `kind` is one of `circle {r} | parabola {a, orientation} | ellipse {a, b} |
hyperbola {a, b, orientation}`, plus `line {slope, intercept}` or
`line {vertical: true, x}`; `orientation` is `horizontal | vertical`. At most
**4 conics and 2 lines**; coordinates are clamped to ±10⁴, radii and
semi-axes to `]0, 10⁴]`, a parabola's `a` to `[−100, 100]` and never through
zero (a zero coefficient is a line, not a parabola). A traced point travels
as its **parameter** (`trace: { targetId, t, branch }`), never as
coordinates, so it stays exactly on the curve. The practice score is never
seeded).
- `measurement` — `{ investigation }`, the id of one of the ten
  investigations (`rectangle-area`, `rectangle-perimeter`, `triangle-area`,
  `circle-circumference`, `circle-area`, `cube-volume`, `cuboid-volume`,
  `unit-conversion`, `pythagoras`, `triangle-angle-sum`). An unknown id
  falls back to the rectangle rather than failing. **Seed the investigation,
  never the rule**: the whole instrument exists so the student builds the
  relation themselves, and a lesson that pre-fills it would hand over the
  one thing it is there to discover (`MATH_LAB.md` §5o.2).

Contract, seed shapes and rules:
[`../architecture/MATH_LAB.md`](../architecture/MATH_LAB.md) §5b.3, §5b.6, §5c.5, §5d.6, §5f.4, §5g.8, §5h.8, §5j.9, §5k.9, §5l.10, §5n.10, §5o.8, §6.

**Adding a fifteenth instrument?** Besides its definition, its id in the server
registry and its Arabic strings, it owes « أعمالي » a `summarize(data)` — a
pure function returning a few hundred bytes that let the workspace draw its
preview and search its content **without loading the instrument**. The
checklist is `MATH_LAB.md` §3.2, the contract §5i.2, and
`summaries.test.js` fails if the function is missing, too large, or throws
on an unexpected state. Whatever the preview shows, it is drawn in **SVG**
from that summary — never a generated raster image (root `CLAUDE.md`).

**Which instrument for measurement, and what NOT to seed.** The measurement
lab (`measurement`) is the instrument for « قِس → قارن → صُغ القاعدة →
اختبر ». It is the one to open whenever a lesson would otherwise *state* a
formula for area, perimeter, volume, unit conversion, the Pythagorean
relation or the angle sum: the lab has the student build that formula from
their own measurements and test it. Do **not** press the 3D explorer (§5c)
into this role — it shows a solid and its computed volume, which is the
opposite gesture.

**Which instrument for reasoning, and what NOT to seed.** The logic & proof
lab (`logic`) is the instrument for « اقترح → اختبر → ابحث عن مثال مضاد →
ابنِ الحجّة ». Seed `{ area, statementId | implicationId | counterexampleId |
proofId | connector }`; every seed is re-read by the same guards as a stored
document (`MATH_LAB.md` §5n.10).

Three rules when a lesson opens it:

- **Seed a QUESTION, never an answer.** The instrument opens on
  `counterexample` precisely because §54 forbids opening on a menu. Seeding
  an area so the student *reads* that the converse is false wastes the one
  thing the lab does: let them find the counterexample themselves.
- **Formal logic is not on the 4AM programme** — the lab exists because
  *reasoning* runs through all of it: « أوجد مثالًا مضادًا » is exactly what
  LP 2.1's divisibility claims ask for, and « إذا كان n زوجيًا فإنّ n² زوجي »
  is the parity argument of the same unit. Seed `counterexample` or a
  concrete `proofId`; the quantifier notation (∀, ∃), De Morgan and the
  fallacy detector are built and correct but are **lycée** material and
  should not be what a 4AM lesson opens. Same rule as the unit circle
  (§5g.1) and the cobweb (§5h.1).
- **L'aire « البرهان بالتراجع » a deux escaliers interactifs — choisir le
  bon.** Ils ne posent pas la même question, et se tromper envoie l'élève
  vers une grammaire qui refusera ce qu'il écrit.
  - **L'escalier des PROPOSITIONS** (`MATH_LAB.md` §5n.6ter) est la forme du
    BAC : une proposition `gauche RELATION droite` (`uₙ < 3`, `wₙ = −2`) sur
    des suites **définies par récurrence** (`uₙ₊₁ = ⅓uₙ + 2`), y compris
    **auxiliaires** (`wₙ = uₙ − vₙ`, dépendances résolues seules). Six
    relations : `=` `≠` `<` `>` `≤` `≥`. C'est lui qu'une leçon ouvre pour
    une démonstration par récurrence.
  - **L'escalier des RÈGLES** (§5n.6bis) pose « ma règle décrit-elle cette
    suite ? ». Sa grammaire est **explicite uniquement** : `n`, les quatre
    opérations, les puissances, les parenthèses, le produit implicite. Le
    factoriel, `Σ` et les règles récurrentes n'y sont pas — une leçon qui les
    demanderait à CET écran enverrait l'élève vers une erreur.
  - Les exercices de l'escalier des propositions sont **déclarés**
    (`inductionExercises.js`) et **vérifiés par les tests** : suites,
    proposition et chaîne d'hérédité. Ajouter un exercice faux fait échouer
    la suite plutôt que d'atteindre un élève. C'est le modèle à suivre pour
    tout nouvel exercice de récurrence.
  - **Tester n'est jamais prouver.** Un escalier tout vert rend « تحقّق
    تجريبي », jamais « prouvé » ; seul le couple base + hérédité donne
    « برهان بالتراجع مكتمل » (§5n.6ter). Une leçon ne doit pas contredire
    cette distinction : c'est elle que l'écran enseigne.
- **A search is never a proof.** If a lesson asks a student to test a
  universal claim, it must not then call the result proved: the lab
  deliberately says « هذه ملاحظة، وليست برهانًا » and points at
  « بناء البرهان » (`MATH_LAB.md` §5n.5). A lesson's wording must agree.

**Which instrument for sequences — and whether to use one at all.**
**المتتاليات are not in the 4AM programme** (`ALGERIA_4AM_CURRICULUM.md`). The
sequences lab exists because one 4AM gesture genuinely needs it —
**«الفروق المتتالية»**, successive differences, named by LP 2.1 in the PGCD
lesson — and because الدوال الخطية/التآلفية (LP 3.7–3.8) have the arithmetic
sequence as their discrete cousin. A 4AM lesson may therefore seed
`kind: 'arithmetic'` with `layers: { differences: true }` to let a student see
a constant difference, and should **not** seed the cobweb, the fixed points or
the convergence layers: they are lycée material, built and correct, but never
what a 4AM lesson opens (`MATH_LAB.md` §5h.1). If a lesson only needs to
*place and compare* numbers on a line, that is a different instrument — the
**number lab** (`numberLab`), whose `line` mode does exactly that
(`MATH_LAB.md` §5l.5). Do not press the sequences lab into that role.

**Which instrument for trigonometry.** The 4AM programme's trigonometry is
**النسب المثلثية في مثلث قائم** (LP 4.2–4.3): a *right triangle* and *acute*
angles. A lesson on جيب / جيب تمام / ظل therefore seeds
`mode: 'triangle'`, not the unit circle — the circle is built and correct,
but it is lycée material and never what a 4AM lesson should open
(`MATH_LAB.md` §5g.1). Use `highlight: 'sin' | 'cos' | 'tan'` to have the
lab open with that ratio's two sides already lit.

**Which instrument for numbers, fractions and arithmetic.** The number lab
(`numberLab`) covers LP 2.1 and 2.2 of the programme — **قواسم عدد طبيعي
والقاسم المشترك الأكبر** and **الأعداد الأولية / كسر غير قابل للاختزال** —
and it is the instrument a 4AM lesson seeds for divisors, PGCD, primes,
factorisation, fractions, decimals, percentages or proportionality.

Seed `{ mode, value }` for a single number (`explorer`, `divisibility`,
`factors`, `primes`, `place`, `rounding`), `{ mode: 'gcdLcm', a, b }` for two,
`{ mode: 'fractions', fraction, right }` for fractions, or
`{ mode: 'percent', percent, quantity }`. Every seed is re-read by the same
guards as a stored document, so a lesson cannot produce a state the
instrument could not reopen (`MATH_LAB.md` §5l.3).

Two rules when writing such a lesson:

- **Do not seed a mode to show an answer.** The instrument's whole design is
  that the mathematics is *seen happening* — seed `gcdLcm` so the student
  runs Euclid, not so they read « ق.م.أ = 12 ».
- **A fraction seeded is not reduced.** `2/4` stays `2/4` on purpose: the
  student discovers equivalence by cutting the parts. If a lesson wants the
  irreducible form, it seeds the irreducible fraction.

- **2AM unit 4, lesson 1 (`ibara-harfiya-intaj`, 2026-10-29) — patterns to reuse.** (1) **Seeding a unit:** `_unit/` copied from a sibling unit, a whole-unit `extraction.json` built by `build-extraction.py` (boundary block in its header; book elements the lesson does not integrate carry `notIntegrated: <reason>` in `destinations`; every other element is cited by some content of its destination lesson — module exercises through `alsoSource`). (2) **`equation2.js` E1 + `substitution.js` `letters` option** (MANIPULATION_CONTRACT §2novenquinquagies quater) — later unit-4 lessons grow E2/E3 in the same file. (3) **A lab that judges a typed rule on the drawing** (`wax-cells`): the rule is evaluated at every built n against an edge count of the drawing. (4) A question inside a module must not `requires` a knowledge item whose brick comes LATER in the module (`E_REQUIRES_ESTABLISHED_LATER`). (5) Money in problems is written `$150$ DA` as in the 2AM models; no negative value in this lesson (run order).

- **2AM مقطع `2am.m4` (units 3–4, ten lessons, 2026-10-29/30; run index `docs/curriculum/PLAN_2AM_M4.md`) — patterns to reuse.** (1) **Judge on the DRAWING, not on a rule:** in `corniche-ruler`, `dig-grid`, `gap-caliper`, `juice-line`, `bridge-load`, `wax-cells`, `balloon-ballast` the typed value or operation is turned into a drawn state (a ghost jaw, a refused fill at its level, a blinking child, the rod count of the drawn cells) BEFORE any sentence, and each named error is recomputed from the task numbers (`judgeX` / `modelOf`); the student never reads « wrong because of rule R ». (2) **A judge that checks the gesture log AND the typed value** (`balloon-ballast`): an opposite gesture cancels its twin, a refused gesture (throwing what is not aboard) is itself a trial, and the coach proposes the workaround after two refusals. (3) **Prediction-first levels:** the typed value gates the hand (`phase: 'predict'` → `'act'`) and the task ends by itself when log and value agree (`balloon-ballast`, `gap-caliper`, `bridge-load`). (4) **Hand-controlled variable in two dimensions** (`dig-grid`): drag the origin stake, tap a crossing, arrow keys; the pit is capped at ≈ 28 % of the viewport height so the glance stays ≤ 700 px at 1024×768 — every lab e2e of the run ASSERTS `[data-…-glance]` ≤ 700 px in BOTH levels. (5) **A typing slate** drops its 0–9 chips to fit one screen only with `inputMode="decimal"` (`juice-line`). (6) **`TextbookExercise` accepts an optional `figure`** rendered with `StatementFigure` (a reading exercise shows its GeoFigure). (7) **Bidi:** in an Arabic sentence a signed number and every « value + Latin unit » is ONE LTR run — plain strings wrap it in an LTR isolate (U+2066 … U+2069, real minus U+2212 inside), KaTeX strings use `$-7$` / `$10\,\mathrm{m}$` (never `$10$ m`), JSX puts the number and unit INSIDE `<bdi dir="ltr">`; parenthesis chips need `dir="ltr"`. A screenshot that looks mirrored is MEASURED (Range rects, a 4× crop: « −10 » has the minus to the LEFT of the digits) before it is reported. (8) **Strings:** every الكفاءة (`pointsToLearn`, config `skills`) is ≤ 255 characters (`learning_points.title` is a VARCHAR(255); `learningPoints.test.js` guards it); in a JSX ATTRIBUTE string a backslash is literal (`prompt="… \frac …"`, never `\\frac`) — `check:katex` does not see it; a knowledge-item `title` carries words only (a formula there prints twice next to its `chip`). (9) **Memo cards:** a `rule` ≤ ~20–28 characters of KaTeX and an `example` ≤ ~40, otherwise it is clipped on the left or overprints the example; the lesson e2e asserts that no `.katex` inside a `[data-memo-card]` leaves its card or overlaps another formula. (10) **Knowledge graph:** run `apps/web/src/lessons/common/knowledge` whenever `knowledge.jsx` / `knowledgeGraph.js` change (`lessonGraphs.test.js`: every item on exactly ONE notebook node, chain order = module order, no false numeric equality in a « wrong » text, no overlap or arrow through a node at 328 / 400 / 720 / 1100 px) — the lesson-folder tests do not run it. (11) **Syntheses:** a GuidedProblem question never contains `$$` (DOM nesting breaks the render); `explain` passed as JSX needs `MathText` itself; `requires` in modules 7–8 may only name `priorKnowledge` ids; plain-string `InfoSorter` data needs LTR isolates plus non-breaking spaces; every number of a مسألة's illustration appears in its statement (`masailIllustrations.test.js`). (12) **Back links:** `pointPrerequisites` of a 3AM successor may name `2am_<lesson>_P<n>` along a net link and its « تذكّر — السنة الثانية » box is a `RECALL` entry with a `getLessonPath` link; a 4AM lesson CANNOT (`decomposition.test.js` keeps the 4AM decomposition closed on itself) — the 2AM → 4AM edges of `talim-nuqta-mustawi` / `masafa-nuqtatayn` are an open owner decision. (13) **Coordination of two leads in one tree:** shared files (`relative.js`, `lessonIndex.generated.json`, `content/practice/*.json`, the i18n file, the extraction) get small targeted edits after a fresh read; the full `npm test` runs once, ALONE, by the coordinator; a lead's « I did not view / re-run X » means it is not finished.
