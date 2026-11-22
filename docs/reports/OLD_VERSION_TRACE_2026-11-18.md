# The old version of the three v2 lessons — trace of its readers, what was deleted, what stays (2026-11-18)

**Order (owner, 2026-11-18):** « for each lesson that is updated to the gaming version, delete the old version ».
Lessons: `qasim-adad-tabii`, `qawasim-adad-tabii`, `khawass-qawasim`
(`apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/<id>/`). The rule that came out of it is
`docs/architecture/LESSON_V2.md` §2 « The old version is deleted »; the status script checks it.

« The old version » = the React module pages (`modules/`), the content only they read, the module routes, the mission
player of these lessons (`studentView: 'mission'`, `mission`, `lessonProblem`, their scenes), `?view=classic`.

## 1. Phase 1 — every reader, and what it reads

Legend — **pages**: imports or mounts a module page; **data**: reads the config's module list (ids, numbers, slugs,
titles, stages) or another config field; **DB**: reads rows (`lesson_modules`, items, progress).

| # | Reader | Reads | Decision |
|---|---|---|---|
| 1 | `<lesson>/routes.jsx` → `common/unit/buildLessonRoutes.jsx` (one lazy route per `modules/Module<NN>*.jsx`), through `lessons/lessonRouteBoundary.jsx` + `lessonLoaders.js` | pages + data (`m.path`) | **changed**: `retiredModules: true`; each module path is a `<Navigate to={home} replace />` |
| 2 | `<lesson>/moduleContext.js` (`MODULE_CTX`, `getNavLinks`) | data, for the pages only | **deleted** |
| 3 | `lessons/registry.test.js` (every module of the config has a route) | data | kept + a check that a v2 lesson's module routes redirect home |
| 4 | `scripts/check-routes.mjs` (routes.jsx calls `buildLessonRoutes`, index, globs) | routes.jsx text | unchanged, passes |
| 5 | `LessonIndex.jsx`: the world for the student when `studentView === 'mission'` and `config.mission`; `?view=classic` → `MissionHome`; module cards, `LessonProblemCard`, soft-gate links for the others | data + `mission` + `lessonProblem` | **changed**: the world opens for any student of a lesson whose pack has a world (not `studentView`); `?view=classic` removed; the old home (module cards linking to the now-redirecting addresses) is still what an admin / سفير (free navigation, not a teacher) sees — follow-up 7 |
| 6 | the kit: `LessonWorld.jsx`, `Title.jsx` (`classicHref`, « الدرس بالطريقة العادية »), the no-WebGL fallback | the classic link | **changed**: link removed; the no-WebGL screen offers the way out (`exitTo`) |
| 7 | `components/auth/phoneLessons.js` (`?view=classic` closed on a phone) | the query | **changed**: the classic branch removed (`isPhoneLessonPath(pathname)`) |
| 8 | `lessons/common/mission/*` (`MissionHome`, `MissionLayer`, `MissionCheckpoint`, `MissionScene`, `useMission`, `useModulePlayer`), `kit/ContentModule`, `kit/BossFinal`, `kit/PrerequisiteDiagnostic`, `kit/PredictRule`, `problems/GuidedProblem`, `answers/useSavedAnswer` (read `studentView` / `mission` through `getLoadedLessonConfig`) | `mission` + `studentView`, only on a module page or MissionHome | kept (29 other lessons use them); the three lessons' keys **deleted** from their configs; their scenes `library` (default), `library-wall`, `construction-wall` **deleted** (no other lesson used them); `MissionScene` draws nothing for an unknown name |
| 9 | `pages/unit/UnitMissionView.jsx` (the student's unit page): `config.mission.title`, `config.mission.tools` | `mission` data | degrades by design (optional): the « درسك الآن » card and the lesson window no longer show the old mission's name (« مكتبة 756 كتابًا »…) nor its tool chips (the rule NAMES, which the world forges and names only after) for lessons 1–3. Visible change — follow-up 8 |
| 10 | `pages/unit/unitMissions.js` (icons, short names, keys `after: <lesson>`) | lesson ids | unchanged |
| 11 | Progress: `useProgress(config.id)` + `markModuleCompleted(String(n))` (the world's `onModule`), `packages/core/progress/*` (`moduleLayoutMigrations.js` names these lessons' module numbers), `calculateCompletionPercentage` (modules count) | data (numbers) | **kept**: the `modules` entries stay in the three configs |
| 12 | API: `lesson_modules` rows (`CurriculumSql`, `ContentRegistryImporter`, `CurriculumController` modules list), progress endpoints by module number, `ContentAccess`, `RecommendationService`, `AnalyticsService`, the two remap migrations of 2026-10-05/06, `DemoDataSeeder`, the tests in `apps/api/tests` | DB | **untouched**: the module ids/numbers/slugs/titles exported are identical (8, 8, 9 modules; verified by running `exportContentRegistry.mjs`). No migration, no row deleted |
| 13 | `packages/core/curriculum/exportContentRegistry.mjs` (deploy step): modules from the config (data), resources (data), **final-test items parsed from the evaluation module's JSX** | data + **page files** | modules and resources unchanged; the final-test items of the three deleted « إختبار أولي » disappear from the export (5 + 6 + 5 = 16) — follow-up 1 |
| 14 | Compass « بوصلتي », the year calendar, the parent's link, school reports, the teacher's tracking (`features/classSession/tracking`, `features/teacher/*`), the learning net, the launch kit, « مختبري », the class session, the board, the memo, the exam coach, the practice space | lesson ids, module numbers as data, the pack | unchanged (no reader mounts a module page). The teacher's card (`TeacherLessonPanel`, `LessonToolsBar`) links to no module page |
| 15 | Links that BUILD a module address: `registry.getModulePath`, `utils/nextSteps.js`, `progress/getResumeLesson.js`, `features/progression/buildProgressionTree.js`, `pages/student/Progression.jsx`, `StudentHome.jsx`, `KnowledgeMap.jsx`, `knowledgeMastery.js`, `LessonLearningPointsStatus.jsx`, `features/practice/notebook/noteContext.js`, the teacher's `UnitPage` module chips | data (slug/number) | unchanged: every such address now redirects to the lesson home (the world) — never a 404 |
| 16 | `scripts/validate-lessons.mjs`: `content/problems.js` required for `track: 'problem'` modules; every الكفاءة needs an assessment question in the lesson's code | page files | **changed**: a `retiredModules` lesson needs no `problems.js`; its coverage is read from `world/evidence.js › POINTS` (the server-verified exam answers, LESSON_V2 §1bis) |
| 17 | `scripts/audit-knowledge-dependencies.mjs` (exposure stream over `modules/`) | page files | **changed**: a `retiredModules` lesson is skipped (`[v2 — no module page]`); its three stale reports `docs/reports/knowledge-contracts/4am_<id>.json` deleted |
| 18 | `scripts/check-textbook-coverage.mjs`: the textbook's QCM (`qcm`, p. 16) was destined to `qasim-adad-tabii` module 7 and cited only by the two deleted final tests | page files | **changed data**: `docs/sources/4am/unit1/extraction.json` — destination moved to `bahth-pgcd` module 8 (which cites item 9), a `note` says why — follow-up 3 |
| 19 | `apps/web/scripts/lesson-v2-status.mjs` | config text | **changed**: new part « the old version is deleted »; the ledger's « أستعدّ » row no longer counts v2 lessons, a row counts v2 lessons whose old version is gone |
| 20 | Unit tests reading the pages: `_unit/prepDiagnostic.test.js`, `knowledge/finalSynthesis.test.js`, `progressive/lessonGraphs.test.js` (aids must quote the lesson's text — modules were part of it), `qawasim/world/journey.test.js` (keys = `mission.tools`), the deleted pages' own tests (`content/prep|problems|peerSheet|walls.test.js`) | pages | adapted (see §4); the pages' own tests deleted with them |
| 21 | e2e walks that open the deleted pages | pages | §5 |
| 22 | `apps/web/scripts/capture-methode.mjs` + `pages/Methode.jsx` / `marketing.json` copy (football lab of module 1, « إختبار أولي ») | pages | **not changed** — follow-up 5 |
| 23 | `knowledge.jsx`, `knowledgeGraph.js`, `content/textbook.js`, `content/exercises.js` (+ `content/teams.js` for lesson 1) | — | **kept**: the lesson page's knowledge map (`LessonPageFrame` › `loadKnowledge`), lesson 1–2's world knowledge page (`world/knowledge.js` imports `KNOWLEDGE_GRAPH`), `validate:lessons`' graph check, `progressiveMap.test.js` |
| 24 | `lesson.config.js › resources` (labs `team-builder`, `divisor-explorer-books`, `factor-pairs`, `divisor-properties`, the three مسائل) | data → DB `lesson_resources` | **kept** as data — follow-up 2 |

## 2. Phase 2 — deleted

| What | Files | Lines |
|---|---|---|
| module pages: 8 + 8 + 9 (« أستعدّ », activities, معارف, أوظّف, three مسائل, « إختبار أولي ») | 25 | |
| `moduleContext.js` ×3 | 3 | |
| `content/` only the pages read, with their tests — lesson 1: `peerSheet`, `prep`(+test), `problems`(+test); lesson 2: `books`, `peerSheet`(+test), `prep`(+test), `problems`(+test); lesson 3: `peerSheet`(+test), `prep`(+test), `problems`(+test), `walls`(+test) | 20 | |
| **lesson folders, total** | **48** | **4,359** |
| mission scenes `LibraryScene`, `LibraryWallScene`, `ConstructionWallScene` | 3 | 134 |
| walk `e2e/lesson-kit/masail-pilot.mjs` (the pilot's مسائل modules) | 1 | 151 |
| stale audit reports `docs/reports/knowledge-contracts/4am_<id>.json` ×3 | 3 | 1,145 |
| **total** | **55** | **5,789** |

Also removed (edits): `studentView`, `mission` (45 / 52 / 51 lines with comments) and `lessonProblem` of the three
configs; `?view=classic` (`LessonIndex`, the kit's `classicHref` and its string `KT.hud.classic`, `.di-link--dim`,
`phoneLessons.js`).

**The redirects**: every address of `config.modules[].path` of the three lessons (e.g.
`/courses/moyen/4am/ansab_al_aadad_wal_hisab/qasim-adad-tabii/maarif`) is a route `<Navigate to={basePath} replace />`;
`?view=classic` is ignored (the home is the world).

## 3. What stays, and why

- `lesson.config.js › modules` (data): progress is stored by module numbers, the world marks them (`onModule`), the DB
  rows and every report read them (rows 11–15).
- `resources`, `skills`, `teachingScope`, `priorKnowledge`, `knowledgeMap*`, `textbookRef`: exported or validated data.
- `index.jsx` (the home: `LessonIndex`), `routes.jsx`, the knowledge map files (row 23), `world/`, `board/`,
  `lesson.pack.js`, the practice banks `content/practice/4am/<id>/`, the class tests `content/class-tests/4am/<id>.json`.
- The mission player and the module system as a whole: 29 lessons are still on the mission player only, 108 on the
  older lesson page (ledger of `status:lesson-v2`). No shared helper was moved: nothing another lesson imports was
  deleted (`check:unreached`, `check:unused` pass).

## 4. Tests changed

- `lessons/registry.test.js`: a lesson with a world → each module route redirects to its home.
- `_unit/prepDiagnostic.test.js`: a v2 lesson keeps module 0 as data but has no « أستعدّ » page; the item checks run on
  the six lessons that still have it; a test names the three v2 lessons.
- `knowledge/finalSynthesis.test.js`: 74 → 71 evaluation modules (unit 1: 9 → 6).
- `progressive/lessonGraphs.test.js`: a lesson's text now includes `world/*.js` and `board/*.js`; one aid of lesson 1's
  map (`khata-amil`) quoted the deleted module 2 — listed in `KNOWN_UNGROUNDED` (content debt, follow-up 6).
- `qawasim-adad-tabii/world/journey.test.js`: keys compared with the exam coach's sheets (`LESSON_PACK.coach`) instead
  of the deleted `mission.tools`.
- `components/auth/phoneLessons.test.js`: the `?view=classic` checks removed.

## 5. Walks (NONE was run — the orchestrator runs them)

Changed: `e2e/gameworld-divisor-isles.mjs` — the `?view=classic` block now checks that `/maarif` redirects to the home
and shows the world, and that `?view=classic` shows the world without the mission behind it. Deleted:
`e2e/lesson-kit/masail-pilot.mjs`.

**Still opening deleted pages — they will fail or test nothing until re-targeted to a lesson on the module system
(follow-up 4):** `lesson-kit/classroom.mjs` (qasim, « وضع القسم » through its modules), `lesson-kit/manipulations.mjs`
(qasim `/al-maktaba` `/maarif`, qawasim `/al-adad-60`, khawass `/thalath-halat`), `lesson-kit/lab-coach.mjs` (same three
labs), `lesson-kit/predict-rule.mjs` (qasim modules 1–2), `lesson-kit/test-presentation.mjs` (qasim `/astaidd`, `/itqan`),
`lesson-kit/4am-aadad-tabiiya-natiqa.mjs` (qasim `/al-maktaba`), `teacher-learning.mjs` (qawasim `/awazzif`, `/itqan`,
`/tariqa-105`, `/al-adad-60`), `page-tours.mjs` (qasim `/maarif`, `/astaidd`), `lesson-route-boundary.mjs` (clicks
`/al-maktaba` from the unit page, counts 8 module chips of qasim — the chips still exist, the click now lands on the
world), and `apps/web/scripts/capture-methode.mjs` (row 22).

## 6. Follow-ups NOT done (each needs a decision or more than a mechanical change)

1. **Final-test items retired at the next deploy.** `exportContentRegistry.mjs` reads the « إختبار أولي » questions from
   the JSX; with the pages gone, the import of the next deploy marks 16 assessment items `retired_at` (5 + 6 + 5; never
   deleted, past evidence kept) and purges the per-الكفاءة item counts that bound the mastery engine's minimum-evidence
   rule. The practice items of the three lessons stay (172 / 134 / 155). To confirm before `main`: that the engine reads
   these lessons' mastery correctly with the practice items and the game evidence only.
2. **Four manipulation types are now mounted by no page**: `team-builder`, `divisor-explorer-books`, `factor-pairs`,
   `divisor-properties` (named only in the three configs' `resources`, i.e. DB `lesson_resources`). They stay in the
   closed registry (`manipulationRegistry.js` + `packages/core/curriculum/manipulationTypes.js`), with their strings,
   tests and walks. Deleting them is one change across the registry, core, i18n, tests, the walks and the configs'
   `resources` (retired at deploy) — or « مختبري » takes them as instruments. Owner's call.
3. **The textbook QCM (p. 16)**: its items 1–7 are no longer used by any lesson (destination moved to `bahth-pgcd`, which
   cites item 9). Owner: keep as is, or declare items 1–7 `notIntegrated` with a reason.
4. **Nine older walks** (and `capture-methode.mjs`) open the deleted pages (§5): re-target each to a lesson still on the module system (same shape:
   `qasim-mushtarak-akbar`) or cut their cases. They test shared old systems (« وضع القسم », BossFinal presentation,
   PredictRule, lab coach, page tours) that 29 + 108 lessons still use.
5. **`/methode`**: its captures, `capture-methode.mjs` and the copy (`marketing.json › method.steps.*.story`) describe the
   deleted module pages of lesson 1 (plan C2: re-capture on the world). The root `CLAUDE.md` says so since this change.
6. **Content debt in lesson 1's knowledge map**: the aid `khata-amil` (« قاسم واحد فقط؟ ») quoted module 2; reword it
   on the world's or the board's text, then remove it from `KNOWN_UNGROUNDED`.
7. **The admin / سفير view of a v2 lesson home** is still the old `LessonIndex` page (module cards, « مسار المحاور »);
   its links land back on the same page. Decide what a reviewer sees (the teacher's card? the world in preview?).
8. **The student's unit page** lost, for lessons 1–3, the old mission's name and its tool chips (row 9). If the owner
   wants something there, it is the world's (its title, its keys after they are forged) — a new field, not the old one.
9. **Lesson 3's proof key (P4)**: `world/evidence.js` maps `burhan → P4`, so `validate:lessons` counts P4 as covered,
   but the gate report says the proof key sends no claim (a proof with letters cannot be re-checked from numbers). P4
   of `khawass-qawasim` has, in fact, no exam evidence since « إختبار أولي » is gone. Owner's call (open item of
   `LESSON_3_GATE_REPORT.md`).

## 7. Checks run (one at a time)

`npm run lint` ✅ · `npm run check:unused` ✅ (baseline 549, nothing added) · `npm run check:unreached` ✅ (4,926
files) · `npm run check:format` ✅ · `npm run check:lessons` ✅ (entry 197.8 KB gzip) ·
`node apps/web/scripts/lesson-v2-status.mjs --lesson <id>` ✅ for the three · `cd apps/web && npx vitest run` ✅ (1,023 files,
18,109 tests; its first run found the 9 failures of §4, all old-version assertions). NOT run: any walk, the API tests (apps/api was not touched), a build.

## 8. Second batch (same day) — the division road: `qisma-iqlidiya-baqi`, `qawaid-qabiliyat-qisma`, `qisma-iqlidiya-hasr`

Lessons: 1AM `qisma-iqlidiya-baqi` and `qawaid-qabiliyat-qisma`
(`apps/web/src/lessons/moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/<id>/`) and 2AM `qisma-iqlidiya-hasr`
(`…/moyen/2am/ansab_al_aadad_wal_hisab/kusur-amaliyat/qisma-iqlidiya-hasr/`). Same job, same shape as §1–§7. Their
`world/`, `board/` and `lesson.pack.js` (the new version) are untouched. These three lessons were on the OLDER lesson
page (no `studentView: 'mission'`, no `mission`): there was no mission player and no mission scene to delete.

### 8.1 Phase 1 — the readers

Rows 1, 3–5, 10–12, 14–15 and 17 of §1 hold for these three lessons unchanged (the machinery is shared and already knows
`retiredModules`). What is specific to them:

| # | Reader | Reads | Decision |
|---|---|---|---|
| a | `<lesson>/routes.jsx` (`import.meta.glob('./modules/Module*.jsx')`) | pages | **changed**: `retiredModules: true`; each of the 9 / 10 / 9 module addresses redirects to the home |
| b | `<lesson>/moduleContext.js` | data, for the pages only | **deleted** |
| c | 1AM `darb-qisma-ashriya/_unit/prepDiagnostic.jsx` + `_unit/moduleContext.js` (the unit has no other lesson) | pages | **deleted** (nothing else imports them); the unit labels of `_unit/unitMeta.js` they alone read (`UNIT_ID`, titles, `BASE`, ids, labels) removed — `src`, `addition`, `PRINT_SUBJECT` stay (content and routes read them). The 2AM unit's helpers stay (five lessons of `kusur-amaliyat` still use them) |
| d | `lesson.config.js › lessonProblem` (`LessonIndex` › `LessonProblemCard`, `validate:lessons`' check against `problems.js`) | data | **deleted** from the three configs (as §2) |
| e | `content/problems.js` (the three مسائل pages) + `problems.test.js` | pages | **deleted** |
| f | `content/textbook.js`, `content/exercises.js` (+ `content.test.js`) | knowledge map (`knowledge.jsx`, `knowledgeGraph.js`), the textbook-coverage citations | **kept** (as row 23). `qawaid`'s `content.test.js` lost its block that parsed the deleted `Module09Itqan.jsx`; `SELF_12` (`exercises.js`, read only by the deleted test page) stays as a textbook citation |
| g | `packages/core/curriculum/exportContentRegistry.mjs` (deploy) | data + page files | modules and resources **identical** (9 / 10 / 9 modules, 6 / 5 / 5 resources — verified by running the export before and after); **the final-test items of the three deleted « إختبار أولي » disappear: 5 + 5 + 5 = 15** (`final_test:<id>:final:E1…E5`). Practice items stay: 199 / 204 / 207 — follow-up 10 |
| h | API `lesson_modules`, `lesson_resources`, progress by module number | DB | **untouched** (row 12) |
| i | Other lessons that name these: `ikhtizal-kitaba-kasriya` (`priorKnowledge`, `requires: ['qawaid-qabiliyat-qisma']`), `wadiya-idmajiya-kusur-amaliyat` (`requires: ['qisma-iqlidiya-hasr-2am']`, its « أستعدّ » « راجع »), `kasr-hasil-qisma` (« تذكّر » `lesson: 'qisma-iqlidiya-hasr'`), `awwaliyan-fima-baynahuma` (« راجع » to `qawaid`), `qasim-adad-tabii` (net comments) | lesson ids | unchanged: they name the LESSON (its home, the world), never a module page |
| j | `scripts/check-textbook-coverage.mjs` | page files | passes with no destination moved: every element the deleted pages cited is still cited by `textbook.js` / `exercises.js` / `resources`. Only the declared platform additions fall (unit `darb-qisma-ashriya` 9 → 4, `kusur-amaliyat` 51 → 48: those of the deleted `problems.js`) |
| k | `scripts/audit-knowledge-dependencies.mjs` | page files | skips the three (`[v2 — no module page]`); their stale reports `docs/reports/knowledge-contracts/{1am_qisma-iqlidiya-baqi,1am_qawaid-qabiliyat-qisma,2am_qisma-iqlidiya-hasr}.json` **deleted** |
| l | `scripts/validate-lessons.mjs` | page files | coverage from `world/evidence.js › POINTS`: 3/3, 4/4, 3/3 الكفاءات covered |
| m | the three labs `division-jumps`, `digit-cards`, `egg-trays` (`manipulations/operations/`) | named only in the three configs' `resources` | **kept** in the closed registry with their tests — now mounted by NO page (same case as follow-up 2) — follow-up 11 |
| n | unit tests: `1am …/_unit/prepDiagnostic.test.js`, `2am …/_unit/prepDiagnostic.test.js` | pages | adapted (§8.3) |
| o | e2e walks | pages | §8.4 |

### 8.2 Phase 2 — deleted

| What | Files | Lines |
|---|---|---|
| module pages 9 + 10 + 9 (« أستعدّ », نشاط, معارف, …, three مسائل, « إختبار أولي ») | 28 | 1,696 |
| `moduleContext.js` ×3 | 3 | 12 |
| `content/problems.js` + `problems.test.js` ×3 | 6 | 883 |
| **lesson folders, total** | **37** | **2,591** |
| 1AM unit `_unit/prepDiagnostic.jsx`, `_unit/moduleContext.js` | 2 | 7 |
| stale audit reports `docs/reports/knowledge-contracts/*.json` ×3 | 3 | 1,301 |
| **total** | **42** | **3,899** |

Also removed (edits): `lessonProblem` (with its comment) of the three configs, replaced by the v2 note; the 1AM unit's
unused labels in `_unit/unitMeta.js`; the « إختبار أولي » block of `qawaid-qabiliyat-qisma/content/content.test.js`.
**Redirects**: every `config.modules[].path` of the three (e.g.
`/courses/moyen/2am/ansab_al_aadad_wal_hisab/qisma-iqlidiya-hasr/nashat`) → `<Navigate to={basePath} replace />`.
What stays is §3's list (config `modules`/`resources`/الكفاءات as data, `index.jsx`, the knowledge map files, the
practice banks, the class tests, DB rows).

### 8.3 Tests changed

- `1am …/darb-qisma-ashriya/_unit/prepDiagnostic.test.js`: both lessons are v2 → module 0 checked as data, no page; the
  item checks (they read the deleted pages) are gone; a test names the two v2 lessons; the unit id is a literal.
- `2am …/kusur-amaliyat/_unit/prepDiagnostic.test.js`: the 4AM pattern (`isV2`, item checks on the lessons still on pages,
  a test naming `qisma-iqlidiya-hasr`).
- `qawaid-qabiliyat-qisma/content/content.test.js`: the block reading `Module09Itqan.jsx` removed.
- Unchanged and passing: `registry.test.js` (its v2 redirect check is generic), `finalSynthesis.test.js` (4AM only: 71),
  `lessonGraphs.test.js` (no aid of the three maps quoted a deleted page: `KNOWN_UNGROUNDED` unchanged).

### 8.4 Walks (NONE was run)

None deleted, none re-targeted. **Opening the deleted pages** (follow-up 4 extends to them):
`lesson-kit/1am-darb-qisma-ashriya.mjs` (every module of `qisma-iqlidiya-baqi`, the `division-jumps` lab on `/nashat`),
`lesson-kit/1am-qawaid-qabiliyat-qisma.mjs` (every module, `digit-cards` on `/nashat`),
`lesson-kit/2am-kusur-amaliyat.mjs` (every module of `qisma-iqlidiya-hasr`, `egg-trays` on `/nashat`) — these three were
also the browser suites of the three labs (`MANIPULATION_CONTRACT.md` §2septdecies, §2octodecies, §2unvicies) — and
`lesson-kit/moyen-retrofit-phase1.mjs` (`/nashat`, `/maarif` of the three, among other lessons). Unaffected: the
lessons' own world / board walks, `launch-kit.mjs`, `lesson-lab.mjs`, `class-session.mjs` (home and lab links only).

### 8.5 Follow-ups NOT done

10. **15 final-test items retired at the next deploy** (5 per lesson), as follow-up 1: confirm before `main` that the
    mastery engine reads these lessons with the practice items and the game evidence only.
11. **Three more labs mounted by no page**: `division-jumps`, `digit-cards`, `egg-trays` (and their figures
    `FlowerFigure`, `HopperFigure`, `BulbFigure`, `EggFigure`) — keep, delete, or move to « مختبري »: owner's call, with
    follow-up 2.
12. **The admin / سفير view and the unit pages** of 1AM `darb-qisma-ashriya` and 2AM `kusur-amaliyat`: as follow-up 7, a
    reviewer still sees the old `LessonIndex` (module cards whose links land back on the home).

### 8.6 Checks run (one at a time)

`npm run lint`: 1 error, NOT from this change — `scripts/lesson-brief.mjs:67` (`countJson` unused; an untracked file of
another agent) — **fixed since** (2026-11-19: `countJson` is no longer in `scripts/lesson-brief.mjs`). `npm run check:unused`: nothing of this change; 6 `lesson` exports of `world/index.js` « imported by a test
only » in the six lessons other agents are writing (`ikhtizal-kitaba-kasriya`, `awwaliyan-fima-baynahuma`, `bahth-pgcd`,
`ikhtizal-kasr`, `qasim-mushtarak-akbar`, `tayin-pgcd` — their packs are not written yet); the PHP half ✅.
`npm run check:unreached`: 61 files, all in those six lessons' `world/` (same cause), none of this change.
`npm run check:format` ✅ · `npm run check:lessons` ✅ (entry 197.8 KB gzip) · `lesson-v2-status --lesson` ✅ for the
three (phone ➖ paused) · ledger: 6 v2, all 6 with their old version deleted; 29 mission; 105 older page; 134 « أستعدّ »;
134 without a board. `cd apps/web && npx vitest run` ✅ (1,083 files, 18,550 tests). NOT run: any walk, the API tests (apps/api was not touched), a build.

### 8.7 Residue of the old versions in the six lessons' root files (review fixes, 2026-11-19, NOT committed)

- **Deleted**: `content/exercises.js` of `qisma-iqlidiya-baqi`, `qawaid-qabiliyat-qisma`, `qisma-iqlidiya-hasr` (row f
  above). Their only readers were their own `content.test.js` (the exercise blocks removed), the derived memo's glob (not
  shown for a lesson with a board memo) and `check-textbook-coverage.mjs` — every element they cited (`ex-15…21`,
  `self-7/8`, `ex-22…32`, `now-42`, `deep-8`, `self-12`, `ex-33`) is still cited by the lesson's practice bank or config:
  the coverage check passes unchanged. The 4AM three keep theirs (their `knowledgeGraph.js` imports them).
- **Scrubbed** in the six `lesson.config.js`: `textbookRef` (read by nothing — the API's comes from the catalogue), the
  headers and comments that described deleted modules and the textbook's pages, module `desc` and resource titles that
  named the book (« تمارين الكتاب 22 », « تمرين الكتاب 33 », « مثال الكتاب », « أعداد الكتاب », « من الكتاب », « طريقة الكتاب »),
  the hasr description and emoji (eggs → planks). KEPT: module ids, numbers, slugs, TITLES and stages, `skills`,
  `resources` codes / `sourceElementIds` / `experience` (the coverage check and the validators read them).
- **Scrubbed** in the six root `knowledge.jsx`: every `predictPrompt` (17; read only by `KnowledgeBrick` / `PredictRule` of
  the deleted module pages — they named « الورشة », « المختبر », « الملعب », « الكتاب ») and the French `\text{vraie}` of
  `khawass-qawasim` (now `P \Rightarrow Q`); the card « أمثلة الكتاب » of `qawaid-qabiliyat-qisma/knowledgeGraph.js` → « مثالان ».
- **Open (owner / orchestrator):** the root `knowledge.jsx` + `knowledgeGraph.js` stay — they are still visible: the
  pack's knowledge of `qasim-adad-tabii` and `qawasim-adad-tabii` (board cards, exam coach), and for all six the 🧠 map
  of the lesson home (`routes.jsx › loadKnowledge` → `LazyLessonKnowledgeProvider`). The other four packs read
  `world/knowledge.js`, so those lessons show TWO knowledge sources (the world's map and the home's 🧠 map). These maps are
  built from `content/textbook.js` (the textbook's own activities and numbers, e.g. « 2145 بيضة في صفائح من 30 » in hasr):
  deleting them means re-pointing `loadKnowledge` and the two packs, and updating `progressiveMap.test.js`,
  `lessonGraphs.test.js`, `buildLessonMemo.test.js` and the four 4AM batch-2 graphs that import the pilot's graph. Module
  TITLES that still carry the book or the old context (« مسائل الكتاب والآلة الحاسبة », « نشاط 1 — بيض المزرعة », …) were
  kept as instructed.

## 9. A v2 lesson could never be completed — fixed (2026-11-19)

**Found by an independent review.** Rows 11 and 14 above were wrong: the world calls `onModule` for only 4 of a lesson's
8–9 modules (the pilot marks 1–4 of 0–7; `khawass-qawasim` 1, 2, 3, 5 of 0–8; `qisma-iqlidiya-baqi` 1, 2, 4, 5 of 0–8),
and `progressQueue.js › snapshotLessonProgress` sends `completed` only at 100 % of `config.modules`. The other modules
have no page any more, so every v2 lesson stayed `in_progress` forever for the parent, the teacher, the school's reports
and the unit page (« next lesson », the tiles).

**Fix (one mechanism in the kit, no lesson's `story.js` touched):** `gameworld/kit/storyEnd.js` + `LessonWorld.jsx` —
the first time a world save says `finished` (the end of the story), every module of the config is marked through the
same `onModule`; a save already finished repairs the progress when the world opens; nothing from a teacher's preview.
Mastery unchanged (evidence only). Rule: `LESSON_V2.md` §1ter. Test: `kit/storyEnd.test.js` (5 tests).

**Still imperfect (not changed — screens not redesigned):**
- `currentModule` is never written by a world (no `markModuleVisited`): the teacher's tracking gets `null`, and the
  resume link of `getLessonProgress` / `getResumeLesson` defaults to module 1 — an address that redirects to the world;
  `lastActivityAt` of a v2 snapshot is the time of the snapshot (no `lastVisitedAt`).
- A repaired student's `completed_at` is the day of the repair, not the day he finished the story.
- The parent's « التقدّم بالتفصيل » shows `modulesCompleted/modulesTotal` (counts only — no retired module titles) and a
  `finalTest` line that a v2 lesson never fills; the teacher's unit page still shows module chips of the retired pages
  (row 15); `StudentDossier` writes « N module(s) terminé(s) » — module counts that mean nothing to a v2 lesson's reader.
- Between two pieces of the story, partial progress stays « 4 of 8 » at most (the modules the story marks).

## 10. One knowledge source, neutral module titles, no dead module link (2026-11-19, NOT committed)

The open items of §8.7 and §9 (« two knowledge sources », module titles, module chips and the resume link).

**1. One knowledge source per v2 lesson.** Readers traced: the home's 🧠 map (`routes.jsx › loadKnowledge` →
`lessonRuntime.jsx › LessonPageFrame` → `LazyLessonKnowledgeProvider` → `KnowledgeMapTrigger`), the pack (`knowledge`:
board cards `features/classSession/knowledgeCards.js`, the exam coach), the world (`world/index.js › knowledge`), the
derived memo glob (`features/teacher/lessonMemo/loadLessonMemoSources.js` — not shown for a lesson with a board memo),
`validate-lessons.mjs` (graph check), `check-textbook-coverage.mjs` (citations), `audit-predict-prompts.mjs` /
`audit-knowledge-dependencies.mjs` / `lab-rollout-status.mjs` (skip a missing file), and the tests (`lessonGraphs`,
`memoContent`, `buildLessonMemo`, the units' `prepDiagnostic`, `wadiya-idmajiya-aadad/content/mission.test.js`, the
lessons' `content.test.js`). No shared component reads the knowledge context on a v2 home (the world never did).
- The 🧠 map of the lesson page could NOT render the world's knowledge as is (same `{ modules }` sheets, but its graph is
  laid out by the world at its own `positions`, its `requires` are keys, and it fails the page map's layout invariants),
  so no converter was written: **a v2 home mounts no 🧠 map** — the six `routes.jsx` pass no `loadKnowledge`,
  `buildLessonRoutes` refuses one with `retiredModules`, `LessonPageFrame` skips the provider without it. The lesson's
  knowledge is the world's « خريطة المعارف », the board's cards and the coach — all through the pack.
- **Deleted** (`qisma-iqlidiya-baqi`, `qawaid-qabiliyat-qisma`, `qisma-iqlidiya-hasr`, `khawass-qawasim`): the root
  `knowledge.jsx`, `knowledgeGraph.js`, `content/textbook.js`, `content/exercises.js` (khawass), `content/content.test.js`
  (1AM/2AM) — 13 files + 3 tests, 1,471 lines. The one textbook element only they cited, `now-11-2` (khawass, module 4),
  is now declared on that module (`sourceElementIds`): `check:textbook` ✅ (declared platform additions fall: unit
  `darb-qisma-ashriya` 4 → 0, `kusur-amaliyat` 48 → 41).
- `validate-lessons.mjs`: a v2 lesson with `knowledgeMap: true` needs the file its pack names to export `KNOWLEDGE_GRAPH`
  (no root `knowledgeGraph.js`). `lessonGraphs.test.js`: those four are checked for a map in `world/knowledge.js`; the page
  map's invariants stay for the others. `knowledgeMapOpen` (read only by the provider) removed from the three 4AM configs.
- **The two pilots** keep root `knowledge.jsx` + `knowledgeGraph.js` + `content/` (their pack and `world/knowledge.js`
  read them). Their cards are BUILT FROM THE TEXTBOOK (`content/textbook.js`, `content/exercises.js`) — listed for the
  owner, NOT rewritten (pedagogy); no plain textbook reference (« الكتاب », a page) is visible in them, so nothing was removed:
  - `qasim-adad-tabii` — sheets' `body` (now rendered by nothing) = « معارف 1 » p. 10 verbatim (two definitions with
    « 11 قاسم للعدد 143 », « 120 = 6 × 20 », the four sentences, 1 / the number itself); memos `siyagh-mutakafia`
    (6 ∣ 120) and `wahid-wa-nafsuh` (1 ∣ 143) use the book's numbers; map cards `baqi`, `jidaa`, `siyagh`, `wahid`,
    `intabih` (definitions/remarks verbatim), `ex120`, `ex143`, `khata-amil` (the book's examples), `tadhakkar` (ex-1's
    method + « أستعدّ » p. 7 items 2–3: 137 = 5 × 25 + 12, 72 = 24 × 3), `khata-ittijah` (ex-5 « 8 يقسم 4 »).
  - `qawasim-adad-tabii` — sheet `tariqa-qawasim` body = « طرائق » p. 11 rule verbatim; map cards `qawasim` (نشاط 2 p. 8:
    60, 48, 17), `ex60`, `tariqa`, `ex105` and `khata-nisf` (the method's worked 105), `qawaid` (its rule line),
    `khata-nisyan` (ex-3: 84), `khata-9` (ex-6).

**2. Module titles** (six configs): each module names what it stands for in the v2 lesson — the key or the stage the
world marks (`onModule`), « مسألة الدرس » for the last bridge, « مسألة 2 / 3 », « التقويم » for the evaluation; module 0
stays « أستعدّ » (the units' tests ask it). No « نشاط N », « معارف — », « أوظّف تعلّماتي », « مسائل الكتاب », no deleted
context (eggs, flowers, library, teams…). `desc` rewritten the same way. Ids, numbers, slugs, stages, `skills`,
`sourceElementIds` unchanged. Readers: the DB `lesson_modules.title` at the next deploy (the notebook's `moduleTitle`, the
admin reports), the old `LessonIndex` an admin / سفير still sees; the parent sees counts only.

**3. Module chips and resume** (driven by `lessonPackFlags(id).world`, never a list): `LessonModuleChips` shows NONE for a
lesson with a world (the chips had no link already; showing a lesson's محاور the teacher cannot open was the defect).
`getResumeLesson.js › getResumeModulePath` gives no module address for such a lesson, so « واصل » (`resumePath`) and the
progression tree's « continue » (`StudentHome`, `Progression` pass it as `getModulePath`) open the lesson's home.
Tests: `components/teacher/lessonModuleChips.render.test.jsx`, `resumePath.test.js` (+9), `registry.test.js` (a v2 home
carries no `loadKnowledge`).

**4. Still visible, still old (not removed — owner's call or other scope):**
- `resources` titles of the six configs name the deleted labs' textbook numbers and contexts (e.g. hasr « 2145 بيضة في
  صفائح من 30 », baqi « 279 زهرة في باقات من 14 », « 253 لؤلؤة », qawasim « قواسم العدد 60 »), and the « مسألة » resource
  titles their old problems; the UNIT PAGE lists the manipulations to students and teachers (`data-unit-resource`). They
  go with follow-ups 2 / 11 (the labs no page mounts).
- The two pilots' textbook-built cards (above).
- `bahth-pgcd` (old module 0, `priorKnowledge`) names `khassiya-1` / `khassiya-2`, item ids of the deleted khawass
  `knowledge.jsx` — concept strings, no check failed; that lesson is being rebuilt.
- Stale comments in `world/knowledge.js` of baqi / hasr / khawass (« the older knowledge.jsx … left untouched ») — world
  folders are other agents' scope.
- Walks NOT updated (e2e is other scope): `e2e/lesson-route-boundary.mjs:127` expects 8 module chips for
  `qasim-adad-tabii` (now 0); `e2e/teacher-memo.mjs` is on `qasim-mushtarak-akbar` (no pack: unchanged) until that lesson
  gets a world; `e2e/knowledge-map.mjs` opens the 🧠 map of the lesson page for `qasim-adad-tabii`, `qawasim-adad-tabii`,
  `khawass-qawasim` (its `ALL` list) — those three must leave it (their map is the world's).

## 11. Lesson 4 — `qasim-mushtarak-akbar` (2026-11-19, NOT committed)

Lesson: 4AM `qasim-mushtarak-akbar` (`…/aadad-tabiiya-natiqa/qasim-mushtarak-akbar/`), the first of the unit's batch 2.
Same job and shape as §8, with §10's rules applied at once (one knowledge source, neutral module titles). Its new version
— `world/` (another agent was still writing `world/forges.js` and `world/inquiries.js`), `board/` — was not touched; its
pack `lesson.pack.js` was written in this change (world `divisor-isles`, `knowledge` = `world/knowledge.js ›
LESSON_KNOWLEDGE`, `coach` P1 `qawasim-mushtaraka` · P2 `al-akbar` · P3 `baqat-mutamathila` · P4 `qawasim-al-pgcd`, as
`world/evidence.js › POINTS`, `board` script and memo, `phone: false`). This lesson was on the MISSION PLAYER (like
lessons 1–3, unlike §8's three).

### 11.1 Phase 1 — the readers

Rows 1, 3–5, 10–12, 14–15 and 17 of §1 hold unchanged. What is specific to this lesson:

| # | Reader | Reads | Decision |
|---|---|---|---|
| a | `routes.jsx` (`import.meta.glob('./modules/Module*.jsx')`, `loadKnowledge: () => import('./knowledge')`) | pages + the 🧠 map | **changed** as the reference (`retiredModules: true`, no `loadKnowledge`): the 8 module addresses redirect home |
| b | `moduleContext.js` | data, for the pages only | **deleted** |
| c | `lesson.config.js › studentView`, `mission` (scene `flower-shop`, tools, three checkpoints), `lessonProblem`, `knowledgeMapOpen`, `textbookRef` | the mission player, `LessonProblemCard`, the old 🧠 provider; `textbookRef` read by nothing | **deleted**; the header and comments that described the textbook's activity and pages rewritten (§8.7) |
| d | `lessons/common/mission/MissionScene.jsx` › `'flower-shop'` → `FlowerShopScene.jsx` | `mission.scene` of this config only | **deleted** (no other lesson names it) |
| e | `content/bouquets.js`, `peerSheet.js`, `prep.js`, `problems.js` (+ their 4 tests) | the module pages only | **deleted** |
| f | root `knowledge.jsx`, `knowledgeGraph.js`, `content/textbook.js`, `content/exercises.js` | the home's 🧠 map, `validate:lessons`' graph check, `check:textbook`, the pages; nothing of `world/` or `board/` imports them (verified: `world/` imports only `../lesson.config` and the kit) | **deleted** (§10.1). Every textbook element they cited (`act-4`, `know-3`, `know-4-def`, `now-11-1`, `ex-10`) is still cited by the lesson's practice bank (`content/practice/4am/qasim-mushtarak-akbar/`) and/or `resources › sourceElementIds`: `check:textbook` ✅ with no destination moved |
| g | `lessons/common/textbook/index.js › IntegerSetQuestion` (re-export) | its only importer was the deleted `Module02Maarif.jsx` | the re-export **removed** (`check:unused`); the component stays (`TextbookExercise` imports it by file) |
| h | `packages/core/curriculum/exportContentRegistry.mjs` (deploy) | data + page files | modules and resources unchanged (8 modules, 6 resources); **the 5 items of the deleted « إختبار أولي » (`E1…E5`, P1–P4) disappear** — follow-up 13 |
| i | the `common-divisors` lab (`resources` of this config) | `resources` | **kept**, and NOT orphaned: `tayin-pgcd` and `wadiya-idmajiya-aadad` still mount it |
| j | other lessons naming this one: `tayin-pgcd` and `wadiya-idmajiya-aadad` « أستعدّ » (`lesson: 'qasim-mushtarak-akbar'`), `wadiya-idmajiya-aadad/content/prep.js › PREP_LESSON`, `unitMissions.js` (icon, short name), `lessonlab/registry.js` (its instrument `common`), `moduleLayoutMigrations.js` (`{ 4: 7 }`), the learning net, the launch kit | lesson ids, module numbers as data | unchanged |
| k | **`wadiya-idmajiya-aadad/content/mission.test.js`** (« owned keys from the unit's lessons, each id exists there ») — globs the siblings' ROOT `knowledge.jsx`; its tools `qawasim-mushtaraka`, `pgcd-taarif` existed only in this lesson's deleted `knowledge.jsx` | knowledge ids | **NOT changed** (another lesson's folder): **this test now FAILS** — follow-up 14 |
| l | `scripts/audit-knowledge-dependencies.mjs`, `validate-lessons.mjs`, `lesson-v2-status.mjs` | page files | skip / adapt by `retiredModules` (no change); `validate:lessons`: 4/4 الكفاءات covered from `world/evidence.js`; its stale report `docs/reports/knowledge-contracts/4am_qasim-mushtarak-akbar.json` **deleted** |
| m | `docs/sources/4am/masail-rollout/audit-locked-leaks.mjs` (walks lessons that have `content/problems.js`) | page data | the lesson drops out; its allow-list line `'qasim-mushtarak-akbar masala-2 1) 6'` is now stale (a doc-sources script, not run by CI) |
| n | e2e walks | pages | §11.4 |

### 11.2 Phase 2 — deleted

| What | Files | Lines |
|---|---|---|
| module pages (« أستعدّ », نشاط, معارف, أوظّف, three مسائل, « إختبار أولي ») | 8 | 416 |
| `moduleContext.js` | 1 | 3 |
| root `knowledge.jsx`, `knowledgeGraph.js` | 2 | 194 |
| `content/` — `bouquets`, `peerSheet`, `prep`, `problems` (+ their tests), `textbook`, `exercises` | 10 | 850 |
| **lesson folder, total** | **21** | **1,463** |
| mission scene `FlowerShopScene.jsx` | 1 | 89 |
| stale audit report `docs/reports/knowledge-contracts/4am_qasim-mushtarak-akbar.json` | 1 | 330 |
| **total** | **23** | **1,882** |

Also edited: `lesson.config.js` (keys of 11.1 c removed; module titles and `desc` neutral as §10.2 — 1
« القواسم المشتركة والباقات المتماثلة », 2 « القاسم المشترك الأكبر وقواسمه », 3 « أتمرّن », 4 « مسألة 1 », 5 « مسألة 2 »,
6 « مسألة الدرس » (the store of the world's last bridge, `world/story.js › PROBLEM_MODULE`), 7 « التقويم »; ids, numbers,
slugs, stages, `teachesLearningPointIds` unchanged — `world/journey.test.js` checks them against `MODULE_KEYS`; the
resource autonomy « أعداد الكتاب » → « أعداد كبيرة », the resource `masala-1` no longer titled « مسألة الدرس »);
`MissionScene.jsx` (import, entry, comment); `common/textbook/index.js`; `package.json` (`format:v2`, `check:format`: the
lesson's `world`, `board`, `lesson.pack.js`); the generated `lessonIndex.generated.json` (the lesson's `pack` flags).
`generate:lab-order` / `generate:compass-index` not run: they read the catalogue, the instruments and the bank, unchanged.

### 11.3 Tests changed

- `features/classSession/boardLessons.test.js`: the lesson joined `BOARD_LESSONS` (its door is « حصّة القسم »); the
  « no board yet » example is now `jidhr-tarbii` (still on the mission player).
- `4am …/_unit/prepDiagnostic.test.js`: four v2 lessons have no « أستعدّ » page (the list names this one).
- `knowledge/finalSynthesis.test.js`: 71 → 70 evaluation modules (unit 1: 6 → 5).
- Unchanged and passing: `registry.test.js`, `lessonPack.test.js` (generic), `lessonGraphs.test.js` (the lesson is now
  found among the world-only maps), the lesson's own `world/*.test.js` and `board/board.test.js`.
- **Failing, not changed**: `wadiya-idmajiya-aadad/content/mission.test.js` (11.1 k).

### 11.4 Walks (NONE was run)

None deleted, none changed. **Opening the deleted pages or the old home's tools** (follow-up 4 extends to them):
`lesson-kit/lab-coach.mjs` and `lesson-kit/manipulations.mjs` (the `common-divisors` lab on `/baqat` — they were its
browser suites; `tayin-pgcd` still mounts the lab), `lesson-kit/moyen-retrofit-phase1.mjs` (this lesson's modules),
`lesson-kit/4am-aadad-tabiiya-natiqa.mjs` (walks the unit's lessons and their modules), `knowledge-map.mjs` (its `ALL`
list opens the 🧠 map of this lesson's page — gone), `notebook-lesson.mjs` (`/baqat`, the 🧠 card, the knowledge brick),
`teacher-memo.mjs` (« وضع القسم » from the teacher's card — that door now opens « حصّة القسم »). To re-check, lesson
level only: `notebook.mjs`, `notebook-space.mjs`, `progression.mjs`, `lesson-kit/classroom.mjs` (practice of this lesson),
`lesson-lab.mjs` (the 4AM shelf — unchanged registry). `lesson-route-boundary.mjs` picks its module lesson by the index
(`!pack.world`): it moves on by itself.

### 11.5 Follow-ups NOT done

13. **5 final-test items retired at the next deploy** (as follow-ups 1 and 10).
14. **`wadiya-idmajiya-aadad/content/mission.test.js` fails**: the synthesis' `mission.tools` ids (`qawasim-mushtaraka`,
    `pgcd-taarif`) must exist in a sibling lesson's ROOT `knowledge.jsx`; lesson 4's is gone (its world names the keys
    `qawasim-mushtaraka`, `al-akbar`, …), and `bahth-pgcd`'s (`pgcd-baqi`, `khwarizmiyat-iqlidus`) will go the same way.
    Fix belongs to that lesson's owner: read the siblings' `world/knowledge.js` too and re-point `pgcd-taarif` → `al-akbar`
    (or rebuild the synthesis — `INTEGRATION_LESSON_PLAN.md`).
15. Stale mentions in other lessons' folders (not this change's scope): `tayin-pgcd/content/bags.js` cites
    « qasim-mushtarak-akbar › content/bouquets.js »; `wadiya-idmajiya-aadad/lesson.config.js` comment; the allow-list of
    `audit-locked-leaks.mjs` (11.1 m).
16. The `resources` titles still name the old labs' and problems' contexts (« 90 زهرة حمراء و 54 زهرة بيضاء », « صناديق
    السمك », « تبليط قاعة المطالعة ») — as §10.4, with follow-up 2.

### 11.6 Checks run (one at a time)

`cd apps/web && npx vitest run src/lessons/lessonPack.test.js src/lessons/registry.test.js src/features/classSession <lesson>`
✅ (18 files, 270 tests) · `_unit`, `common/knowledge`, `common/mission`, `wadiya-idmajiya-aadad`, `teacher/lessonMemo`,
`lessonlab`, `launchkit`: 4,297 ✅, **1 ❌ (follow-up 14)** · `status:lesson-v2 --lesson`: ✅ pack, world, knowledge, coach,
board, old version deleted; ❌ « a test per part » (no `forges` test yet — the world's agent) and ❌ « a walk plays its
world » (the orchestrator) · `validate-lessons.mjs` ✅ · `check-textbook-coverage.mjs` ✅ · `check:unreached` and
`check:unused`: nothing of this lesson (the other batch-2 lessons' `world/` only) · `eslint` and `prettier --check` on the
touched files ✅. NOT run: the whole suite, a build, `check:lessons`, any walk.

## 12. Lesson 5 — `tayin-pgcd` (2026-11-19, NOT committed)

Lesson: 4AM `tayin-pgcd` (`…/aadad-tabiiya-natiqa/tayin-pgcd/`), lesson 5 of the unit. Same job and shape as §11. Its new
version — `world/` (another agent was rewriting `world/forges.js` and `world/inquiries.js`: their two tests failed during
this change, its work in progress), `board/` — was not touched; its pack `lesson.pack.js` was written in this change (world
`divisor-isles`, `knowledge` = `world/knowledge.js › LESSON_KNOWLEDGE`, `coach` P1 `hasr-wa-taqatu` · P2 `nataij-mubashira`
· P3 `b-yaqsim-a`, as `world/evidence.js › POINTS`, `board` script and memo, `phone: false`). `board/script.js › KEYS`
already equals `world/journey.js › KEYS`; `board/board.test.js` passes. This lesson was on the MISSION PLAYER (scene
`school-bags`).

### 12.1 Phase 1 — the readers

Rows 1, 3–5, 10–12, 14–15 and 17 of §1 and rows h, l of §11.1 hold unchanged. What is specific to this lesson:

| # | Reader | Reads | Decision |
|---|---|---|---|
| a | `routes.jsx` (`import.meta.glob('./modules/Module*.jsx')`, `loadKnowledge: () => import('./knowledge')`) | pages + the 🧠 map | **changed** as §11 (`retiredModules: true`, no `loadKnowledge`): the 8 module addresses redirect home |
| b | `moduleContext.js` | data, for the pages only | **deleted** |
| c | `lesson.config.js › studentView`, `mission` (scene `school-bags`, tools `tayin-bil-hasr`, `nataij-mubashira`, `pgcd-idha-qasim`, three checkpoints), `lessonProblem`, `knowledgeMapOpen`, `textbookRef` | the mission player, `LessonProblemCard`, the old 🧠 provider; `textbookRef` read by nothing | **deleted**; the header (the textbook's activity 5 and pages) and the French design comments rewritten |
| d | `lessons/common/mission/MissionScene.jsx` › `'school-bags'` → `SchoolBagsScene.jsx` | `mission.scene` of this config only (grep: no other config, no test) | **deleted** |
| e | `content/bags.js` (`M1_ROUNDS`), `peerSheet.js`, `prep.js`, `problems.js`, `exercises.js`, `textbook.js` (+ the 4 tests of the first four) | the module pages only (verified: `world/` imports only the kit, `divisorIsles/` and its own files; `board/` imports `features/classSession/lessonScripts`) | **deleted** |
| f | root `knowledge.jsx`, `knowledgeGraph.js` | the home's 🧠 map, `validate:lessons`' graph check, `check:textbook`, the pages, the globs of `lessonGraphs.test.js` / `memoContent` / `wadiya…/mission.test.js` | **deleted**. Every textbook element they and `content/` cited (`act-5`, `know-4-results`, `ex-17`, `ex-18`, `ex-22`) is still cited by the practice bank (`content/practice/4am/tayin-pgcd/`) and `resources › sourceElementIds` (verified by grep; `check:textbook` NOT run) |
| g | `wadiya-idmajiya-aadad/content/mission.test.js` — (1) `knowledgeOf` (the synthesis' tools must exist in a sibling's knowledge): none of its five tools is a key of this lesson (`qawasim-mushtaraka`, `al-akbar` are lesson 4's world; `pgcd-baqi`, `khwarizmiyat-iqlidus` bahth-pgcd's; `jidaa-aamilayn` the pilot's); (2) `lessonContent` (`../../*/content/*.js`: the pairs of the unit's lessons for the collision rule) loses this lesson's old pairs; (3) `peerSheets` loses « ياسين » | ids, pairs, names | **unchanged, and passing** (follow-up 18 for (2)) |
| h | `wadiya-idmajiya-aadad` « أستعدّ » (`pgcd: { lesson: 'tayin-pgcd' }`), `content/prep.js › PREP_LESSON`, `bahth-pgcd/modules/Module00Astaidd.jsx` (`lesson: 'tayin-pgcd'`), `unitMissions.js` (🎒, « تعيين PGCD »), `lessonlab/registry.js` (its instrument `lists`), `moduleLayoutMigrations.js`, the learning net, the launch kit, the API's tests and seeders, `content/practice`, `content/class-tests/4am/tayin-pgcd.json` | lesson ids, module numbers as data | unchanged |
| i | the `common-divisors` lab (`resources` of this config: `common-divisors-8-12`, `common-divisors-42-60`) | `resources` | **kept** as data; the lab is NOT orphaned: `wadiya-idmajiya-aadad` (module 7) still mounts it |
| j | `lesson.config.js › priorKnowledge: ['pgcd-taarif', …]` | `audit-knowledge-dependencies.mjs` (skips a v2 lesson), the lesson brief | `pgcd-taarif` existed only in lesson 4's deleted `knowledge.jsx` → **re-pointed to `al-akbar`** (lesson 4's world key), as §11's follow-up 14 did for the synthesis |
| k | `docs/reports/knowledge-contracts/4am_tayin-pgcd.json` | the audit's stale report (it lists the module pages) | **deleted** |
| l | e2e walks | pages | §12.4 |

### 12.2 Phase 2 — deleted

| What | Files | Lines |
|---|---|---|
| module pages (« أستعدّ », نشاط 5, معارف, أوظّف, three مسائل, « إختبار أولي ») | 8 | 326 |
| `moduleContext.js` | 1 | 3 |
| root `knowledge.jsx`, `knowledgeGraph.js` | 2 | 187 |
| `content/` — `bags`, `peerSheet`, `prep`, `problems` (+ their tests), `textbook`, `exercises` | 10 | 791 |
| **lesson folder, total** | **21** | **1,307** |
| mission scene `SchoolBagsScene.jsx` | 1 | 59 |
| stale audit report `docs/reports/knowledge-contracts/4am_tayin-pgcd.json` | 1 | 264 |
| **total** | **23** | **1,630** |

Also edited: `lesson.config.js` (keys of 12.1 c removed; `teachingScope` without the textbook's numbers; module titles and
`desc` neutral as §10.2 — 0 « أستعدّ », 1 « تعيين PGCD بحصر القواسم », 2 « نتائج مباشرة، وعدد يقسم الآخر », 3 « أتمرّن »,
4 « مسألة الدرس » (the store of the world's last bridge, `world/story.js › PROBLEM_MODULE = '4'`), 5 « مسألة 2 », 6 « مسألة 3 »,
7 « التقويم »; ids, numbers, slugs, stages, `teachesLearningPointIds` unchanged — `world/journey.test.js` and
`world/evidence.test.js` check them against `MODULE_KEYS` and `POINTS`; the resource `common-divisors-42-60` retitled
« قائمتا قواسم عددين: من القائمتين إلى PGCD » (its autonomy line no longer names 60), the resource `masala-1` no longer titled
« مسألة الدرس »); `routes.jsx`; `MissionScene.jsx` (import, entry, comment); `package.json` (`format:v2`, `check:format`:
the lesson's `world`, `board`, `lesson.pack.js`); the generated `lessonIndex.generated.json` (the lesson's `pack` flags);
`e2e/lesson-lab.mjs` (a `lists` step, and the PGCD lesson's 4AM shelf now has five lessons — `LESSON_LAB.md`).
`generate:lab-order` / `generate:compass-index` not run: they read the catalogue, the instruments and the bank, unchanged.

### 12.3 Tests changed

- `features/classSession/boardLessons.test.js`: the lesson joined `BOARD_LESSONS` (its door is « حصّة القسم », its module
  addresses belong to its board, « present » refused on them).
- `4am …/_unit/prepDiagnostic.test.js`: five v2 lessons have no « أستعدّ » page (the list names this one).
- `knowledge/finalSynthesis.test.js`: 70 → 69 evaluation modules (unit 1: 5 → 4).
- Unchanged and passing: `registry.test.js`, `lessonPack.test.js`, `lessonGraphs.test.js` (the lesson is now among the
  world-only maps), `common/mission`, `teacher/lessonMemo`, `lessonlab`, the unit's `_unit` and `wadiya-idmajiya-aadad`, the
  lesson's `board/board.test.js` and `world/` tests except the two below.
- **Failing, not mine**: `world/forges.test.js` (« Cannot read properties of undefined (reading 'gaps') ») and one case of
  `world/inquiries.test.js` — the world agent's rewrite in progress.

### 12.4 Walks (NONE was run)

Added: the `lists` step of `lesson-lab.mjs` (open the lab from the world of `tayin-pgcd`, 40 and 56, « جرّب » until both
lists close, the links and the crown computed in the walk). **Opening this lesson's deleted pages or its old home**
(follow-up 4 extends to them): `lesson-kit/lab-coach.mjs` (`tayin-pgcd/42-wa-60`, the `common-divisors` lab),
`lesson-kit/manipulations.mjs` (`tayin-pgcd/42-wa-60`), `lesson-kit/moyen-retrofit-phase1.mjs` (this lesson's module 1 and
its brick `tayin-bil-hasr`), `lesson-kit/4am-aadad-tabiiya-natiqa.mjs` (walks the unit's lessons and their modules),
`knowledge-map.mjs` (its `ALL` list opens the 🧠 map of this lesson's page — gone), `mathlab-labs-scope.mjs` (its default
`QA_LESSON` is this lesson's home, where it looks for the old home's « المختبر » button — give it a lesson still on the old
home), `page-tours.mjs:204` (navigates through this lesson's home between two module pages of another lesson — to re-check).
To re-check, lesson level only: `progression.mjs` (the CTA « ابدأ » of a never-opened lesson is this one's home: the address
is unchanged). `lesson-route-boundary.mjs` picks its module lesson by the index (`!pack.world`): it moves on by itself.

### 12.5 Follow-ups NOT done

17. **4 final-test items retired at the next deploy** (`E1…E4` of the deleted « إختبار أولي »), as follow-ups 1, 10, 13.
18. **The synthesis' collision rule reads only `content/*.js`** (`wadiya…/content/mission.test.js › lessonContent`): the
    pairs of the v2 lessons' worlds (here 32/44, 27/27, 19/76, 154/238 in `world/math.js › NUMBERS`) are not in it, and the
    old pairs of lessons 4 and 5 dropped out. The test passes, but it no longer guards against the worlds' numbers — the
    synthesis' owner should read `world/math.js` too (or the rule goes with the integration lesson's rebuild).
19. Still in the config as identifiers (ids and slugs stay, §10.2): module 1's slug `42-wa-60` and the resource code
    `common-divisors-42-60` (`experience.type: 'textbook'`) carry the textbook's activity numbers; the resources
    `common-divisors-8-12` (8 pens, 12 notebooks), `masala-1` (90 pens, 126 notebooks), `masala-2` (« قفة رمضان »), `masala-3`
    (« تربّص النادي ») still name the old labs' and problems' contexts — as §10.4, with follow-up 2 (the unit page lists them).
20. `check:unused` flags one export of shared code not of this lesson: `gameworld/divisorIsles/Workshop.jsx › Bench` (the
    world agent's new file) — for that agent.
21. Follow-up 15's `tayin-pgcd/content/bags.js` mention is gone with the file.

### 12.6 Checks run (one at a time)

`cd apps/web && npx vitest run src/lessons/lessonPack.test.js src/lessons/registry.test.js src/features/classSession
src/lessons/common/lessonlab <lesson>/board <unit>/_unit <unit>/wadiya-idmajiya-aadad` ✅ (21 files, 333 tests) ·
`common/knowledge`, `common/mission`, `teacher/lessonMemo`, `<lesson>/world`: 4,194 ✅, 1 ❌ + 1 file not loading (12.3, the
world agent's) · `status:lesson-v2 --lesson tayin-pgcd`: ✅ every part but « a walk plays its world » (the orchestrator) and
the paused phone · `check:unreached` and `check:unused`: nothing of this lesson (the four batch-2 `world/` drafts, and
20.) · `eslint` on the touched files ✅ · `prettier --check` on the pack, `routes.jsx`, `board/`, `boardLessons.test.js` ✅.
NOT run: `validate-lessons.mjs`, `check-textbook-coverage.mjs`, the whole suite, a build, `check:lessons`, any walk.

## 13. Lesson 6 — `bahth-pgcd` (2026-11-19, NOT committed)

Lesson: 4AM `bahth-pgcd` (`…/aadad-tabiiya-natiqa/bahth-pgcd/`), lesson 6 of the unit. Same job and shape as §12. Its new
version — `world/` (another agent was rewriting `world/forges.js` and `world/inquiries.js` during this change), `board/` —
was not touched; its pack `lesson.pack.js` was written in this change (world `divisor-isles`, `knowledge` =
`world/knowledge.js › LESSON_KNOWLEDGE`, `coach` P1 `farq-yabqi` · P2 `khawarizmiyat-al-tarh` · P3 `baqi-yabqi` · P4
`iqlidis` · P5 `aqall-khutuwat`, as `world/evidence.js › POINTS`, `board` script and memo, `phone: false`).
`board/script.js › KEYS` equals the world's keys (`board.test.js` checks `KEYS` against `lesson.keys`, and passes). This
lesson was on the MISSION PLAYER (scene `sewing-workshop`).

### 13.1 Phase 1 — the readers

Rows 1, 3–5, 10–12, 14–15 and 17 of §1 and rows h, l of §11.1 hold unchanged. What is specific to this lesson:

| # | Reader | Reads | Decision |
|---|---|---|---|
| a | `routes.jsx` (`import.meta.glob('./modules/Module*.jsx')`, `loadKnowledge: () => import('./knowledge')`) | pages + the 🧠 map | **changed** as §12 (`retiredModules: true`, no `loadKnowledge`): the 9 module addresses redirect home |
| b | `moduleContext.js` | data, for the pages only | **deleted** |
| c | `lesson.config.js › studentView`, `mission` (scene `sewing-workshop`, five tools, four checkpoints), `lessonProblem`, `knowledgeMapOpen`, `textbookRef` | the mission player, `LessonProblemCard`, the old 🧠 provider | **deleted**; the header (the textbook's activity 6, its pages, the French design notes) rewritten |
| d | `common/mission/MissionScene.jsx › 'sewing-workshop'` → `SewingWorkshopScene.jsx` | this config only | **deleted** |
| e | `content/ribbons.js`, `peerSheet.js`, `prep.js`, `problems.js` (+ their 4 tests), `exercises.js`, `textbook.js` | the module pages only (`world/` imports the kit, `divisorIsles/` and its own files; `board/` imports `features/classSession/*`) | **deleted** |
| f | root `knowledge.jsx`, `knowledgeGraph.js` | the home's 🧠 map, `validate:lessons`' graph check, the globs of `lessonGraphs.test.js` / `wadiya…/mission.test.js` | **deleted** |
| g | **`check-textbook-coverage.mjs`**: the textbook elements the deleted files cited. `act-6a`, `act-6b`, `know-4-props`, `method-differences`, `method-euclid`, `challenge`, `ex-19`–`ex-21` are still cited by the bank and/or `resources › sourceElementIds`; **`qcm`** (destination bahth-pgcd, item 9 of the deleted « إختبار أولي ») and **`now-13-1`** (« دوري الآن » p. 13, destination bahth-pgcd module 4) were not | coverage | `qcm`: destination **moved** to `awwaliyan-fima-baynahuma` (module 7, item 8 — the only lesson still citing it), noted in `docs/sources/4am/unit1/extraction.json`, as §1's follow-up 3. **`now-13-1`: NOT fixed — `check-textbook-coverage.mjs` fails on it** (follow-up 22) |
| h | `wadiya-idmajiya-aadad`: (1) `mission.tools` `pgcd-baqi`, `khwarizmiyat-iqlidus` (ids of this lesson's deleted `knowledge.jsx`; `mission.test.js › knowledgeOf` wants each in a sibling's knowledge); (2) `mission.test.js › lessonPairs.has('140/252')` (a pair of this lesson's deleted `content/`) | ids, pairs | (1) **re-pointed** to this lesson's world keys `baqi-yabqi`, `iqlidis`, as §11's follow-up 14 did (`pgcd-taarif` → `al-akbar`); (2) the sentinel **re-pointed** to `65/91` (ikhtizal-kasr's `content/prep.js`) — it moves again when that lesson converts (follow-up 18 still holds) |
| i | the synthesis' and lessons 7–8's `priorKnowledge` and `requires` (`pgcd-baqi`, `khwarizmiyat-iqlidus`), `ikhtizal-kasr`/`awwaliyan-fima-baynahuma`/`wadiya` « أستعدّ » (`lesson: 'bahth-pgcd'`), `PREP_LESSON`, `unitMissions.js` (🧵, « خوارزمية إقليدس »), `lessonlab/registry.js` (its instrument `euclid`), `moduleLayoutMigrations.js` (`{ 5: 8 }`), the learning net, the launch kit, `content/practice`, `content/class-tests/4am/bahth-pgcd.json`, the API's tests and seeders, `scripts/practice-oracle/bahth-pgcd.mjs` | ids as data; nothing checks that a `priorKnowledge` id exists | unchanged (as §11 left `pgcd-taarif`); `khwarizmiyat-iqlidus` still exists in the synthesis' own `knowledge.jsx` |
| j | this lesson's `priorKnowledge: ['khassiya-1', 'khassiya-2', 'pgcd-taarif', 'nataij-mubashira']` — the first three existed only in deleted root files | the brief, the audit | **re-pointed** to the worlds' keys `jam-wal-farq`, `baqi-qisma` (khawass-qawasim), `al-akbar` (lesson 4); `nataij-mubashira` is lesson 5's world key |
| k | the labs `pgcd-differences` (`DifferenceAlgorithm.jsx`) and `euclidean-algorithm` (`resources` of this config) | `resources` | **kept** as data. `euclidean-algorithm` is still mounted by `wadiya-idmajiya-aadad` (module 7); **`pgcd-differences` is now mounted by no page** — reached through `manipulationRegistry.js`, so `check:unreached` does not flag it (follow-up 23) |
| l | `lessonPack.test.js`, `examCoach.test.js` used `bahth-pgcd` as « a lesson with no pack » | the example | **re-pointed** to `jidhr-tarbii` (still on the mission player, no pack) |
| m | `docs/reports/knowledge-contracts/4am_bahth-pgcd.json` | the audit's stale report | **deleted** |
| n | e2e walks | pages | §13.4 |

### 13.2 Phase 2 — deleted

| What | Files | Lines |
|---|---|---|
| module pages (« أستعدّ », نشاط 6 أ, معارف, نشاط 6 ب, أوظّف, three مسائل, « إختبار أولي ») | 9 | 425 |
| `moduleContext.js` | 1 | 3 |
| root `knowledge.jsx`, `knowledgeGraph.js` | 2 | 285 |
| `content/` — `ribbons`, `peerSheet`, `prep`, `problems` (+ their tests), `textbook`, `exercises` | 10 | 885 |
| **lesson folder, total** | **22** | **1,598** |
| mission scene `SewingWorkshopScene.jsx` | 1 | 69 |
| stale audit report `docs/reports/knowledge-contracts/4am_bahth-pgcd.json` | 1 | 359 |
| **total** | **24** | **2,026** |

Also edited: `lesson.config.js` (keys of 13.1 c removed; `teachingScope` without the textbook's numbers; module titles and
`desc` neutral as §10.2 — 0 « أستعدّ », 1 « الفرق، ثمّ الفروق المتتابعة », 2 « الفرق والباقي », 3 « القسمات المتتابعة، وأقصر
طريق », 4 « أتمرّن », 5 « مسألة 1 », 6 « مسألة 2 », 7 « مسألة الدرس » (the store of the world's last bridge,
`world/story.js › PROBLEM_MODULE = '7'`), 8 « التقويم »; ids, numbers, slugs, stages, `teachesLearningPointIds` unchanged —
`world/journey.test.js` and `world/evidence.test.js` check them; the resources' titles and autonomy lines no longer name
the textbook's numbers (252 و 140, 117 و 91, 765 و 135, 836 و 1938, 936 و 845) nor « أعداد الكتاب »; `masala-1` no longer
titled « مسألة الدرس »; `priorKnowledge` 13.1 j); `routes.jsx`; `MissionScene.jsx` (import, entry, comment);
`wadiya-idmajiya-aadad/lesson.config.js` (13.1 h); `docs/sources/4am/unit1/extraction.json` (`qcm`); `package.json`
(`format:v2`, `check:format`: the lesson's `world`, `board`, `lesson.pack.js`); the generated `lessonIndex.generated.json`
(the lesson's `pack` flags); `e2e/lesson-lab.mjs` (the PGCD step opens the lab from the world: `[data-di-lab-open]`, its rail
`[data-ll-mine]` = `euclid`, closed by `[data-ll-close]`; the dead mission-home seed removed — `LESSON_LAB.md`);
`LESSON_V2.md`, `LESSON_DEVELOPMENT_GUIDE.md`, `MISSION_ROLLOUT_PROGRESS.md`. `generate:lab-order` / `generate:compass-index`
not run: they read the catalogue, the instruments and the bank, unchanged.

### 13.3 Tests changed

- `features/classSession/boardLessons.test.js`: the lesson joined `BOARD_LESSONS` (door « حصّة القسم », its module addresses
  belong to its board, « present » refused on them).
- `4am …/_unit/prepDiagnostic.test.js`: six v2 lessons have no « أستعدّ » page.
- `knowledge/finalSynthesis.test.js`: 69 → 68 evaluation modules (unit 1: 4 → 3).
- `lessonPack.test.js`, `features/practice/exam/examCoach.test.js`: « a lesson with no pack » is `jidhr-tarbii` (13.1 l).
- `wadiya-idmajiya-aadad/content/mission.test.js`: the pairs' sentinel (13.1 h).
- Unchanged and passing: `registry.test.js`, `common/lessonlab` (the 4AM shelf of this lesson's lab is still the five
  earlier lessons), `common/mission`, `common/knowledge`, `_unit`, the lesson's `board/board.test.js`.

### 13.4 Walks (NONE was run)

Changed: the PGCD step of `lesson-lab.mjs` (13.2). **Opening this lesson's deleted pages or its old home** (follow-up 4
extends to them): `lesson-kit/manipulations.mjs` (`bahth-pgcd/al-furuq`, `bahth-pgcd/khwarizmiyat-iqlidus` — the browser
suites of the `pgcd-differences` and `euclidean-algorithm` labs), `lesson-kit/4am-aadad-tabiiya-natiqa.mjs` (the same two
pages, and the unit's lessons and modules), `lesson-kit/moyen-retrofit-phase1.mjs` (this lesson's modules 1–3 and their
bricks `pgcd-farq`, `khwarizmiyat-al-furuq`, `pgcd-baqi`, `khwarizmiyat-iqlidus`, `ikhtiyar-al-tariqa`), `knowledge-map.mjs`
(its `ALL` list opens the 🧠 map of this lesson's page — gone). To re-check, lesson level only: `lesson-kit/practice-exam-sheet.mjs`
and `lesson-kit/practice-image-answers.mjs` (default `LESSON=bahth-pgcd`: the practice page, whose address is unchanged).
`lesson-route-boundary.mjs` picks its module lesson by the index (`!pack.world`): it moves on by itself.

### 13.5 Follow-ups NOT done

22. **`now-13-1` (« دوري الآن » p. 13) is cited by no content any more: `check-textbook-coverage.mjs` (hence
    `check:lessons`) FAILS.** Its only citer was the deleted `content/textbook.js` (module 4). The bank does not cite it.
    Needs a decision: a destination that cites it, or `notIntegrated` with the owner's reason.
23. The lab `pgcd-differences` (`DifferenceAlgorithm.jsx`, its i18n, its tests) is mounted by no lesson page now; its
    browser suites are the walks of 13.4.
24. **6 final-test items retired at the next deploy** (`E1…E6` of the deleted « إختبار أولي »), as follow-ups 1, 10,
    13, 17.
25. Still in the config as identifiers (ids and slugs stay, §10.2): the slug `khwarizmiyat-iqlidus` of module 3, the resource
    codes `pgcd-differences-252-140`, `method-differences-117-91`, `euclid-765-135`, `method-euclid-1938-836`,
    `challenge-936-845` carry the textbook's numbers; the resources `masala-1` (« ورشة الخياطة »), `masala-2` (« التعاونية
    الحليبية »), `masala-3` still name the old problems' contexts — as §10.4, with follow-up 2.
26. The legacy mission home (`mission/MissionHome.jsx`, its ring « أدواتي » / « مفاتيحي » at 10 px) is still mounted in this
    unit by `awwaliyan-fima-baynahuma`, `ikhtizal-kasr` and the synthesis `wadiya-idmajiya-aadad`.
27. `check:unused` flags `bahth-pgcd/world/math.js › divisorsOf` (imported by a test only) — the world agent's file.

### 13.6 Checks run (one at a time)

`cd apps/web && npx vitest run src/lessons/lessonPack.test.js src/lessons/registry.test.js src/features/classSession
src/lessons/common/lessonlab <lesson>/board <unit>/_unit <unit>/wadiya-idmajiya-aadad src/lessons/common/knowledge
src/lessons/common/mission src/features/practice/exam/examCoach.test.js` — 35 files, 4,195 tests: 1 ❌ (13.1 h (2)), then
fixed and the two folders re-run ✅ (58 tests) · `status:lesson-v2 --lesson bahth-pgcd`: ✅ pack, world, knowledge, coach,
board, old version deleted; ❌ « every rule is forged, never told » (the forges' agent, in progress) and ❌ « a walk plays its
world » (the orchestrator) · `check:unreached`: nothing of this lesson (the three batch-2 `world/` drafts) · `check:unused`:
27. only, besides those drafts · `validate-lessons.mjs`: 5/5 الكفاءات covered · `check-textbook-coverage.mjs`: ❌ 22. ·
`eslint` on the touched files ✅ · `prettier --check` on the pack, `routes.jsx`, `board/`, `world/`, `boardLessons.test.js`,
`lessonPack.test.js` ✅. NOT run: the lesson's `world/` tests, the whole suite, a build, `check:lessons`, any walk.

## 14. Lesson 7 — `awwaliyan-fima-baynahuma` (2026-11-20, NOT committed)

Lesson: 4AM `awwaliyan-fima-baynahuma` (`…/aadad-tabiiya-natiqa/awwaliyan-fima-baynahuma/`), lesson 7 of the unit. Same job
and shape as §13. Its new version — `world/` (another agent was writing `world/forges.js` and `world/inquiries.js` during
this change), `board/` — was not touched, except `world/evidence.js` and its test (14.4); its pack `lesson.pack.js` was
written in this change (world `divisor-isles`, `knowledge` = `world/knowledge.js › LESSON_KNOWLEDGE`, `coach` P1
`awwaliyan` · P2 `ithbat-awwaliyan` · P3 `shahid-wahid`, as `world/evidence.js › POINTS`, `board` script and memo,
`phone: false`). This lesson was on the MISSION PLAYER (scene `math-club`).

### 14.1 Phase 1 — the readers

Rows 1, 3–5, 10–12, 14–15 and 17 of §1, rows h, l of §11.1 and rows b, f, m of §13.1 hold unchanged. What is specific:

| # | Reader | Reads | Decision |
|---|---|---|---|
| a | `routes.jsx` (`import.meta.glob('./modules/Module*.jsx')`, `loadKnowledge: () => import('./knowledge')`) | pages + the 🧠 map | **changed** as §13 (`retiredModules: true`, no `loadKnowledge`): the 8 module addresses redirect home |
| b | `lesson.config.js › studentView`, `mission` (scene `math-club`, four tools `awwaliyan-taarif`, `nafy-awwaliyan`, `laysa-awwali`, `ithbat-awwaliyan`, three checkpoints), `lessonProblem`, `knowledgeMapOpen`, `textbookRef` | the mission player, `LessonProblemCard`, the old 🧠 provider | **deleted**; the header (the textbook's activity, pages and exercises, the French design notes) rewritten |
| c | `common/mission/MissionScene.jsx › 'math-club'` → `MathClubScene.jsx` | this config only | **deleted** (import, entry, comment) |
| d | `content/kits.js`, `peerSheet.js`, `prep.js`, `problems.js` (+ their 4 tests), `exercises.js`, `textbook.js` | the module pages only (`world/` imports the kit, `divisorIsles/` and its own files; `board/` imports `features/classSession/*`) | **deleted** |
| e | the globs over every lesson's `content/` and `knowledge.jsx`: `kit/peerSheet.test.js`, `problems/masailIllustrations.test.js`, `problems/lessonProblemPlacement.test.js`, `knowledge/memoContent.test.js`, `progressive/lessonGraphs.test.js`, `wadiya…/content/mission.test.js` (`lessonContent`, `peerSheets`, `knowledgeOf`) | files | pass without them, except `mission.test.js › lessonPairs` (14.3) |
| f | **`check-textbook-coverage.mjs`**: `ex-23`, `ex-24`, `ex-26` (destination module 3, cited by the deleted `content/textbook.js` only) and **`qcm`** (destination module 7, item 8 of the deleted « إختبار أولي » — moved here by §13.1 g) were cited by no content any more; `act-7` is still cited by `resources › sourceElementIds`, `ex-25`, `ex-27`, `ex-39` by the bank | coverage | the four marked **`notIntegrated`** in `docs/sources/4am/unit1/extraction.json` with the reason of `now-13-1`, this lesson's id (owner, 2026-11-19 — `defects.md` D8); `qcm` keeps its history note. Nothing moved to another lesson. The textbook and the extraction's content were not used to decide |
| g | `ikhtizal-kasr/lesson.config.js › priorKnowledge` (`awwaliyan-taarif`, an id of this lesson's deleted `knowledge.jsx`) | ids as data | **re-pointed** to the world key `awwaliyan` |
| h | `wadiya-idmajiya-aadad`: `mission.tools` cite no id of this lesson (`baqi-yabqi`, `iqlidis` are lesson 6's world keys); the pairs' sentinel `65/91` is ikhtizal-kasr's | ids, pairs | unchanged; `lessonPairs` re-fed (14.3) |
| i | this lesson's `priorKnowledge: ['pgcd-taarif', 'khwarizmiyat-iqlidus', 'qawaid-qisma']` — the first two existed only in deleted root files | the brief, the audit | **re-pointed** to `al-akbar` (lesson 4's world) and `iqlidis` (lesson 6's); `qawaid-qisma` is lesson 2's key |
| j | the labs `coprime-explorer` (`resources` of this config) | `resources` | **kept** as data, titles without the textbook's numbers; mounted by no page now — reached through `manipulationRegistry.js` (as §13 follow-up 23). The lesson's instrument in « مختبري » is `duo` (another agent, `lessonlab/registry.js`) |
| k | `unitMissions.js`, `moduleLayoutMigrations.js` (`{ 4: 7 }`), `lessonlab/registry.js`, `launchkit/families.js`, the learning net, `content/practice`, `content/class-tests`, the API's seeders and migration, `scripts/practice-oracle/awwaliyan-fima-baynahuma.mjs` | ids, slugs, the bank | unchanged |
| l | `docs/reports/knowledge-contracts/4am_awwaliyan-fima-baynahuma.json` | the audit's stale report | **deleted** |

### 14.2 Phase 2 — deleted

| What | Files | Lines |
|---|---|---|
| module pages (« أستعدّ », نشاط, معارف, أوظّف, three مسائل, « إختبار أولي ») | 8 | 332 |
| `moduleContext.js` | 1 | 3 |
| root `knowledge.jsx`, `knowledgeGraph.js` | 2 | 219 |
| `content/` — `kits`, `peerSheet`, `prep`, `problems` (+ their tests), `textbook`, `exercises` | 10 | 847 |
| **lesson folder, total** | **21** | **1,401** |
| mission scene `MathClubScene.jsx` | 1 | 53 |
| stale audit report `docs/reports/knowledge-contracts/4am_awwaliyan-fima-baynahuma.json` | 1 | 311 |
| **total** | **23** | **1,765** |

Also edited: `lesson.config.js` (14.1 b; `teachingScope` without the textbook's example; module titles and `desc` neutral —
0 « أستعدّ », 1 « قاسم مشترك وحيد، أو أكثر », 2 « الإثبات بالحساب », 3 « أتمرّن », 4 « مسألة الدرس » (the store of the
world's last bridge, `world/story.js › PROBLEM_MODULE = '4'`), 5 « مسألة 1 », 6 « مسألة 2 », 7 « التقويم »; ids, numbers,
slugs, stages, `teachesLearningPointIds` unchanged — `world/journey.test.js` and `world/evidence.test.js` check them; the
resources' titles no longer carry the textbook's pairs nor the old problems' contexts); `routes.jsx`; `MissionScene.jsx`;
`ikhtizal-kasr/lesson.config.js` (14.1 g); `extraction.json` (14.1 f); `package.json` (`format:v2`, `check:format`: the
lesson's `world`, `board`, `lesson.pack.js`); `lessonIndex.generated.json` (the lesson's `pack` flags); `e2e/lesson-lab.mjs`
(a step 2bis: lesson 7 opens the lab from its world, its one instrument `duo`, closed by its ✕ — `LESSON_LAB.md`);
`LESSON_V2.md` (retirement ledger, §1bis), `LESSON_DEVELOPMENT_GUIDE.md` (`math-club` deleted), `MISSION_ROLLOUT_PROGRESS.md`.

### 14.3 Tests changed

- `features/classSession/boardLessons.test.js`: the lesson joined `BOARD_LESSONS` (door « حصّة القسم », « present » refused).
- `4am …/_unit/prepDiagnostic.test.js`: seven v2 lessons have no « أستعدّ » page.
- `knowledge/finalSynthesis.test.js`: 68 → 67 evaluation modules (unit 1: 3 → 2).
- `gameworld/kit/bankDisplay.test.js`: at least 10 v2 sittings (the lesson's `world/sitting.js`).
- `wadiya-idmajiya-aadad/content/mission.test.js`: `lessonPairs` fell to 5 pairs once this lesson's `content/` went (the
  test wants more than 20): it now ALSO reads the gaps, lanes and piers of every v2 world's road (`world/math.js ›
  NUMBERS`) — the collision rule checks the synthesis' rounds against more pairs than before, and a new sentinel `85/119`
  (this lesson's convoy « hidden ») proves the roads are read. Nothing weakened.
- the evidence gap (14.4): `kit/claims.test.js`, the fixture, `ClaimVerifierTest`, the lesson's `world/evidence.test.js`.

### 14.4 The evidence gap closed — `commonDivisor` with `notOne: true`

No claim kind stated « d is a common divisor of a and b OTHER THAN 1 »: `commonDivisor` is true for d = 1, the answer the
key ❌ `shahid-wahid` refuses, so `world/evidence.js` sent nothing for it. Now `commonDivisor` takes the option `notOne: true`
(d ≥ 2) in `kit/claims.js` and `ClaimVerifier.php` (read `=== true` on both sides), with 7 rows in the shared fixture and a
test on each side; `world/evidence.js` sends `{ kind: 'commonDivisor', a, b, d, notOne: true }` for every « shahid »
answer, and its property test has NO silent case left (every exam answer sends a claim, true exactly when `check` accepts).

### 14.5 Walks (NONE was run)

Changed: `lesson-lab.mjs` (14.2). **Opening this lesson's deleted pages or its old home**: `lesson-kit/manipulations.mjs`
(`awwaliyan-fima-baynahuma/17-wa-18` and `/maarif` — the browser suites of the `coprime-explorer` lab),
`lesson-kit/4am-aadad-tabiiya-natiqa.mjs` (the unit's lessons and modules), `lesson-kit/moyen-retrofit-phase1.mjs` (modules
`17-wa-18`, `maarif` and their bricks `awwaliyan-taarif`, `nafy-awwaliyan`, `laysa-awwali`, `ithbat-awwaliyan`),
`knowledge-map.mjs` (its `ALL` list opens the 🧠 map of this lesson's page — gone). `lesson-route-boundary.mjs` picks its
module lesson by the index (`!pack.world`): it moves on by itself.

### 14.6 Follow-ups NOT done

28. **`lessonPack.test.js` FAILS on `launchkit/families.js`** (another agent's uncommitted edit, line 906): a comment names
    `qasim-mushtarak-akbar` and `awwaliyan-fima-baynahuma` (« shared code names no lesson that has a pack »). The first
    already had a pack, so the failure predates this change; the comment needs rewording by the launch kit's owner.
29. **`kit/authoring/proof.tayin.test.js` FAILS**: « 19 ; 76 in awwaliyan-fima-baynahuma/world/story.js » — the line
    `pgcdWave(76, 57, [1, 3, 19])` of this lesson's gate dash holds both numbers of lesson 5's road pair 19 ; 76. The world's
    agent's numbers (or the check's reading of a line): not changed here.
30. The coprime labs (`CoprimeExplorer.jsx`) are mounted by no lesson page now; their browser suites are the walks of 14.5.
31. **5 final-test items retired at the next deploy** (the deleted « إختبار أولي »), as follow-ups 1, 10, 13, 17, 24.
32. Still identifiers in the config (§10.2): the slug `17-wa-18` of module 1 and the resource codes `coprime-17-18`,
    `coprime-22-35` carry the textbook's numbers.
33. The legacy mission home is mounted in this unit by `ikhtizal-kasr` and the synthesis `wadiya-idmajiya-aadad` only.

### 14.7 Checks run (one at a time)

`cd apps/web && npx vitest run src/lessons/lessonPack.test.js src/lessons/registry.test.js src/features/classSession
src/features/practice src/lessons/common/lessonlab <lesson>/board <lesson>/world/evidence.test.js <lesson>/world/journey.test.js
<unit>/_unit <unit>/wadiya-idmajiya-aadad <unit>/ikhtizal-kasr src/lessons/common/knowledge src/lessons/common/mission
src/lessons/common/gameworld/kit src/lessons/common/kit/peerSheet.test.js src/lessons/common/problems` — 89 files, 5,131
tests: 3 ❌ — `mission.test.js` (fixed, 14.3, the folder re-run ✅ 43), 28. and 29. (not this change's files) ·
`php8.4 artisan test --filter Claim` ✅ 6 tests · `status:lesson-v2 --lesson awwaliyan-fima-baynahuma`: ✅ pack, world,
forged rules, knowledge, coach, bank, « مختبري », launch kit, board, class test, published, old version deleted; ❌ « a test
per part — no test for forges » (the forges' agent) and ❌ « a walk plays its world » (the orchestrator) ·
`check-textbook-coverage.mjs` ✅ · `check:unreached`: only `kit/authoring/{forgeBlocks,numbers}.js` (not imported yet) ·
`check:unused`: `kit/authoring/numbers.js` and, in `world/`, `inquiries.js › PROOF_INQUIRY` and `math.js › DIVISIONS` (test
only) — nothing of this change · `eslint` on the touched files ✅ · `prettier --check` on the pack, `routes.jsx`, `board/`,
`world/evidence*`, `claims*`, `bankDisplay.test.js`, `boardLessons.test.js` ✅. NOT run: the lesson's other `world/` tests,
the whole suite, a build, `check:lessons`, any walk.

## 15. Lesson 8 — `ikhtizal-kasr` (2026-11-20, NOT committed)

Lesson: 4AM `ikhtizal-kasr` (`…/aadad-tabiiya-natiqa/ikhtizal-kasr/`), lesson 8 of the unit — its LAST ordinary lesson.
Same job and shape as §14. Its new version — `world/` (other agents were writing `world/forges.js`, `inquiries.js`,
`trainer.js`, `story.test.js` during this change), `board/` — was not touched, except `world/evidence.js` and its test
(15.4); its pack `lesson.pack.js` was written in this change (world `divisor-isles`, `knowledge` = `world/knowledge.js ›
LESSON_KNOWLEDGE`, `coach` P1 `ikhtizal-marahil` · P2 `ghayr-qabil` · P3 `ikhtizal-pgcd` · P4 `natija-mukhtazala`, as
`world/evidence.js › POINTS`, `board` script and memo, `phone: false`). This lesson was on the MISSION PLAYER (scene
`bakery`).

### 15.1 Phase 1 — the readers

Rows 1, 3–5, 10–12, 14–15 and 17 of §1, rows h, l of §11.1, rows b, f, m of §13.1 and rows a, e, k of §14.1 hold
unchanged. What is specific:

| # | Reader | Reads | Decision |
|---|---|---|---|
| a | `routes.jsx` (`import.meta.glob('./modules/Module*.jsx')`, `loadKnowledge: () => import('./knowledge')`) | pages + the 🧠 map | **changed** as §14 (`retiredModules: true`, no `loadKnowledge`): the 9 module addresses redirect home |
| b | `lesson.config.js › studentView`, `mission` (scene `bakery`, four tools `ikhtizal`, `kasr-ghayr-qabil`, `ikhtizal-bil-pgcd`, `tahaqquq-al-ikhtizal`, four checkpoints), `lessonProblem`, `knowledgeMapOpen`, `textbookRef` | the mission player, `LessonProblemCard`, the old 🧠 provider | **deleted**; the header (the textbook's activity, pages and exercises, the French design notes) rewritten |
| c | `common/mission/MissionScene.jsx › 'bakery'` → `BakeryScene.jsx` | this config only (the 1AM `theme: 'bakery'` of `hasil-qisma-kasr` is a lab theme, not a scene) | **deleted** (import, entry; the comment no longer names the lesson — `lessonPack.test.js`) |
| d | `content/exercises.js`, `peerSheet.js`, `prep.js`, `problems.js`, `recipes.js` (+ their 4 tests), `textbook.js` | the module pages only (`world/` imports the kit, `divisorIsles/` and its own files; `board/` imports `features/classSession/*`) | **deleted** |
| e | the old knowledge ids `ikhtizal`, `kasr-ghayr-qabil`, `ikhtizal-bil-pgcd`, `tahaqquq-al-ikhtizal` and the old graph's ids | no app code outside the lesson (the `'ikhtizal'` of `ikhtizal-kitaba-kasriya` 1AM and `maqlub-qismat-kasrayn` 3AM are THEIR OWN ids); the legacy walk `moyen-retrofit-phase1.mjs` (15.5) | nothing to re-point: no 1AM/2AM/3AM lesson and no `priorKnowledge` names them. The new keys are `ikhtizal-marahil`, `ghayr-qabil`, `ikhtizal-pgcd`, `natija-mukhtazala` (`world/story.js › K`) |
| f | **`check-textbook-coverage.mjs`**: `now-13-2` (module 3), `ex-30`, `ex-31`, `ex-33`, `ex-37`, `ex-38` (module 4), `ex-35`, `ex-36` (module 3) were cited by the deleted `content/textbook.js` only | coverage | the eight marked **`notIntegrated`** in `docs/sources/4am/unit1/extraction.json` with the reason of `now-13-1`, this lesson's id — edited by id, their text not read (owner, 2026-11-19 — `defects.md` D11). `act-8` and `method-reduce` are still cited by `resources › sourceElementIds`; the other exercises by the bank. Nothing moved to another lesson |
| g | `wadiya-idmajiya-aadad/content/mission.test.js › lessonPairs` — the sentinel `65/91` was a pair of THIS lesson's deleted `content/prep.js` | pairs | **moved** (15.3) |
| h | `wadiya-idmajiya-aadad › mission.tools` | ids | cite no id of this lesson (`al-akbar`, `baqi-yabqi`, `iqlidis`, … — lessons 4–6 and the synthesis' own): unchanged |
| i | this lesson's `priorKnowledge: ['al-aadad-al-natiqa', 'awwaliyan', 'khwarizmiyat-iqlidus']` | the brief, the audit | `khwarizmiyat-iqlidus` (bahth-pgcd's deleted root id) **re-pointed** to `iqlidis` (lesson 6's world key); `awwaliyan` is lesson 7's; `al-aadad-al-natiqa` (an earlier year's knowledge) kept as data — no file defines it now (it was cited by the deleted `content/problems.js` only) |
| j | the labs `fraction-reduction` (`resources` of this config; `manipulationRegistry.js`, `levels.js`, its own tests) | `resources` | **kept** as data, titles without the textbook's numbers nor its character; mounted by no page now. The lesson's instrument in « مختبري » is `strip` « شريط الكسر » (another agent, `lessonlab/registry.js`) |
| k | `unitMissions.js` (the lesson's icon, title, and the milestone after it), `moduleLayoutMigrations.js` (`{ 5: 8 }`), the API's migration and seeders (`4am_ikhtizal-kasr_P3`), `learningNet.test.js`, `practice-oracle/ikhtizal-kasr.mjs`, `content/practice`, `content/class-tests` | ids, slugs, the bank | unchanged |
| l | `docs/reports/knowledge-contracts/4am_ikhtizal-kasr.json` | the audit's stale report | **deleted** |

### 15.2 Phase 2 — deleted

| What | Files | Lines |
|---|---|---|
| module pages (« أستعدّ », نشاط, معارف, two « أوظّف », three مسائل, « إختبار أولي ») | 9 | 350 |
| `moduleContext.js` | 1 | 3 |
| root `knowledge.jsx`, `knowledgeGraph.js` | 2 | 236 |
| `content/` — `exercises`, `peerSheet`, `prep`, `problems`, `recipes` (+ their 4 tests), `textbook` | 10 | 850 |
| **lesson folder, total** | **22** | **1,439** |
| mission scene `BakeryScene.jsx` | 1 | 54 |
| stale audit report `docs/reports/knowledge-contracts/4am_ikhtizal-kasr.json` | 1 | 337 |
| **total** | **24** | **1,830** |

Also edited: `lesson.config.js` (15.1 b, i; `textbookRef` gone; module titles and `desc` neutral — 0 « أستعدّ », 1 « نختزل
على مراحل », 2 « قسمة واحدة », 3 « أتمرّن (1) », 4 « أتمرّن (2) », 5 « مسألة 1 », 6 « مسألة الدرس » (the store of the
world's last bridge, `world/story.js › PROBLEM_MODULE = '6'`), 7 « مسألة 2 », 8 « التقويم »; ids, numbers, slugs, stages,
`teachesLearningPointIds` unchanged — `world/journey.test.js` and `world/evidence.test.js` check them; the resources'
titles no longer carry the textbook's fractions nor the old problems' contexts); `routes.jsx`; `MissionScene.jsx`;
`extraction.json` (15.1 f); `package.json` (`format:v2`, `check:format`: the lesson's `world`, `board`, `lesson.pack.js`);
`lessonIndex.generated.json` (the lesson's `pack` flags); `e2e/lesson-lab.mjs` (a step 2ter: lesson 8 opens the lab from
its world, its one instrument `strip`, one « + » judged by the walk's own arithmetic, closed by its ✕); `LESSON_V2.md`
(retirement ledger, §1bis), `LESSON_DEVELOPMENT_GUIDE.md` (`bakery` deleted), `MISSION_ROLLOUT_PROGRESS.md`.

### 15.3 Tests changed

- `features/classSession/boardLessons.test.js`: the lesson joined `BOARD_LESSONS` (door « حصّة القسم », « present » refused).
- `4am …/_unit/prepDiagnostic.test.js`: eight v2 lessons have no « أستعدّ » page.
- `knowledge/finalSynthesis.test.js`: 67 → 66 evaluation modules (unit 1: 2 → 1, the synthesis).
- `gameworld/kit/bankDisplay.test.js`: at least 11 v2 sittings.
- `wadiya-idmajiya-aadad/content/mission.test.js`: the sentinel `65/91` left with this lesson's `content/prep.js`. The
  road reader now ALSO reads the fraction of every MARKED bridge of a v2 world (`{ gap, mark }` or `{ gap, strokes }` of
  `world/math.js › NUMBERS` → lit/gap): more pairs are checked against the synthesis' rounds than before, and the new
  sentinel `66/78` (this lesson's first bridge) proves they are read. Nothing weakened.
- the claim (15.4): `kit/claims.test.js`, the fixture, `ClaimVerifierTest`, the lesson's `world/evidence.test.js`.

### 15.4 The evidence gap closed — `fraction` with the option `op`

For P4 the trainer asks « احسب x/y op z/w ثمّ أعطِ النتيجة على شكل كسر غير قابل للاختزال »; the browser computed the result
A/B and claimed `fraction (A ; B ; p ; q)`: the server re-checked p/q against A/B but TRUSTED A/B. Now `fraction` takes the
option `op` (`'+'`, `'-'`, `'*'`) with the operands x, y, z, w (naturals ≤ 10^6, y and w > 0) in `kit/claims.js` and
`ClaimVerifier.php`: each side computes x/y op z/w itself and the claim is false unless a/b equals it (irreducible forms
compared — exact: the unreduced result stays ≤ 2 × 10^12; a negative result is false). A present but invalid `op` (null, an
unknown operation, an array, a missing operand) is false on both sides. The item id (`fraction-AxB`) and the controller's
validation (`claim.a`, `claim.b`) are unchanged. 15 rows in the shared fixture (6 true, 9 false), a test on each side;
`world/evidence.js` sends the calculation with both claims of a « hisab » answer (`×` → `'*'`), and its test checks that a
result A/B forged by the browser makes the claim false (it is true without `op`). The property test « `verifyClaim(claim)
=== check.ok` » is unchanged and has no silent case.

### 15.5 Walks (NONE was run)

Changed: `lesson-lab.mjs` (15.2). **Opening this lesson's deleted pages or its old home**:
`lesson-kit/manipulations.mjs` (`ikhtizal-kasr/samir` — the browser suites of the `fraction-reduction` lab, five places),
`lesson-kit/4am-aadad-tabiiya-natiqa.mjs` (the unit's lessons and modules; `ikhtizal-kasr/samir` on a phone),
`lesson-kit/moyen-retrofit-phase1.mjs` (modules `samir`, `maarif` and their bricks `ikhtizal`, `kasr-ghayr-qabil`,
`ikhtizal-bil-pgcd`, `tahaqquq-al-ikhtizal`), `knowledge-map.mjs` (its `ALL` list opens the 🧠 map of this lesson's page —
gone), `teacher-memo.mjs` (`/enseignant/cours/ikhtizal-kasr/memoire` waited for the old memo's rail and timeline built from the
deleted root knowledge and `content/`; the page now shows the lesson's WRITTEN memo from its pack, `usePackPart(…, 'memo')`). `lesson-route-boundary.mjs`
picks its module lesson by the index (`!pack.world`): it moves on by itself.

### 15.6 Follow-ups NOT done

34. **5 final-test items retired at the next deploy** (the deleted « إختبار أولي »), as follow-ups 1, 10, 13, 17, 24, 31.
35. Still identifiers in the config (§10.2): the slug `samir` of module 1 (a textbook character) and the resource codes
    `fraction-reduction-12-18`, `fraction-reduction-84-48`, `method-reduce-595-560` carry the textbook's numbers.
36. The `fraction-reduction` lab (`FractionReduction.jsx`, its v2 player treatment) is mounted by no lesson page now; its
    browser suites are the walks of 15.5.
37. **The legacy mission home is mounted in unit 1 by the synthesis `wadiya-idmajiya-aadad` ONLY.** In `common/mission/`
    nothing but its scene `ApronStoreScene.jsx` (+ its `'apron-store'` entry) is used by it alone: the player, the home,
    the map, the checkpoints and the synthesis options (`toolsOwned`, `stationLabels`, `trainings`, `hideStars`,
    `sittings`, `resumeInside`) serve 23 other lessons on the mission player (5 other syntheses use those options).
38. `teacher-memo.mjs` used this lesson as its « KaTeX in the memo » example: it needs another lesson (or the written
    memo's own selectors) — a walk, not touched here.

### 15.7 Checks run (one at a time)

`cd apps/web && npx vitest run src/lessons/lessonPack.test.js src/lessons/registry.test.js src/features/classSession
src/features/practice src/lessons/common/lessonlab <lesson>/world/evidence.test.js <lesson>/world/journey.test.js
<lesson>/board <unit>/_unit <unit>/wadiya-idmajiya-aadad src/lessons/common/knowledge src/lessons/common/mission
src/lessons/common/gameworld/kit src/lessons/common/kit/peerSheet.test.js src/lessons/common/problems --maxWorkers=2` — 88
files, 5,101 tests ✅ · `src/features/teacher/lessonMemo` ✅ 267 · `php8.4 artisan test --filter Claim` ✅ 7 tests, then `--filter
"ClaimVerifier|test_the_two_verifiers_share_one_fixture"` ✅ 6 · `status:lesson-v2 --lesson ikhtizal-kasr`: ✅ pack,
world, knowledge, coach, bank, « مختبري », launch kit, board, class test, published, old version deleted; ❌ « a test per
part — no test for forges » and « every rule is forged — no keys found » (the forges' agent) and ❌ « a walk plays its
world » (the orchestrator) · `check-textbook-coverage.mjs` ✅ · `check:unreached` ✅ · `check:unused`: 9, none of this
change — `kit/authoring/forgeBlocks.js › fractionBox`, `givenFraction` and, in this lesson's `world/math.js`, `PLANKS`,
`commonDivisors`, `euclid`, `listAr`, `planks`, `range`, `reduce` (imported by a test only, while the forges are being
written) · `eslint` on the touched files ✅ · `prettier --check` on the pack, `routes.jsx`, `world/evidence*`, `claims*`,
`bankDisplay.test.js`, `boardLessons.test.js` ✅. NOT run: the lesson's other `world/` tests, the whole suite, a build,
`check:lessons`, any walk.

## 16. Unit 2, lesson 1 — `jidhr-tarbii` (2026-11-21, NOT committed)

Lesson: 4AM `jidhr-tarbii` « الجذر التربيعي لعدد موجب » (`…/hisab-judhur/jidhr-tarbii/`), the first lesson of unit 2 to
become v2 — on a NEW world, `root-courts` « قصر الساحات » (`gameworld/rootCourts/`), not the islands. Same job and shape
as §15. Its new version — `world/`, `board/`, the class test `content/class-tests/4am/jidhr-tarbii.json`, the lab
instrument `court`, the launch family `3am.m3.r06` — was not touched, except `world/index.js` (its `notYet` list
`['lab', 'launch', 'test']` and the « BEING BUILT » paragraph removed: the three doors now exist) and the one assertion of
`world/journey.test.js` that read that list. Its pack `lesson.pack.js` was completed in this change (`knowledge` =
`world/knowledge.js › LESSON_KNOWLEDGE`, `coach` P1 `dil-as-saha` · P2 `qima-madbuta` · P3 `dhahab-wa-iyab`, as
`world/evidence.js › POINTS`, `board` script and memo; `world` and `phone: false` kept). This lesson was on the MISSION
PLAYER (scene `garden-bed`). The world marks no module itself: the story's end marks them all (`kit/storyEnd.js`, §9).

### 16.1 Phase 1 — the readers

Rows 1, 3–5, 10–12, 14–15 and 17 of §1, rows h, l of §11.1 and rows a, b, d of §15.1 hold unchanged. What is specific:

| # | Reader | Reads | Decision |
|---|---|---|---|
| a | `routes.jsx` (`import.meta.glob('./modules/Module*.jsx')`, `loadKnowledge: () => import('./knowledge')`) | pages + the 🧠 map | **changed** as §15 (`retiredModules: true`, no `loadKnowledge`): the 8 module addresses redirect home |
| b | `lesson.config.js › studentView`, `mission` (scene `garden-bed`, four tools `qima-mudbuta`, `jidhr-taarif`, `murabba-jidhr`, `jidhr-murabba`, three checkpoints), `lessonProblem`, `knowledgeMapOpen`, `textbookRef` | the mission player, `LessonProblemCard`, the old 🧠 provider, `missionStrings.test.js` (checkpoint strings) | **deleted**; the French header (the textbook's pages, activity and design notes) rewritten. The v2 comment names the keys as `` `studentView`, `mission` `` — never the literal `studentView: 'mission'`, which the ledger of `lesson-v2-status.mjs` (line 243, unanchored) and `e2e/no-back-and-forth.mjs` (`includes`) would read as a mission lesson |
| c | `common/mission/MissionScene.jsx › 'garden-bed'` → `GardenBedScene.jsx` | this config only | **deleted** (import, entry; the comment no longer names the lesson — `lessonPack.test.js`) |
| d | `components/RootFigures.jsx`, `content/exercises.js`, `peerSheet.js`, `prep.js`, `problems.js`, `squares.js` (+ their 4 tests), `textbook.js`, root `knowledge.jsx`, `knowledgeGraph.js`, `moduleContext.js` | the module pages and the old 🧠 map only (`world/` imports the kit, `rootCourts/`, its own files and `../lesson.config`; `board/` imports `features/classSession/*` and `../world`) | **deleted** |
| e | `common/manipulations/geometry/PythagorasTanks.jsx` (3AM `khassiyat-fitaghuras`'s lab) — a comment « la racine est construite en 4AM par jidhr-tarbii » | the lesson id | the comment names the unit instead (`lessonPack.test.js`); the lab is unchanged |
| f | the lab `square-root-side` (`resources` of this config, modes « refine » and the example 0,04) | `resources` | **kept** as data, titles without the textbook (« نشاط 1 — … BC » → « مربّع مساحته 5: هل يقع ضلعه على تدريجة؟ »); NOT orphaned: `natiqa-ghayr-natiqa` still mounts it (graduation mode). This lesson's instrument in « مختبري » is `court` |
| g | **`wadiya-idmajiya-judhur`** (the unit's synthesis, still on the mission player): (1) `mission.tools[0].id: 'jidhr-taarif'` — an id of this lesson's deleted `knowledge.jsx`, and `content/mission.test.js › knowledgeOf` wants every tool in a sibling's knowledge; (2) `mission.test.js › labContent` read this lesson's `content/squares.js` (the collision rule of module 7: ≥ 5 files, the sentinel `2.25`); (3) `peerSheets` loses this lesson's name; (4) `content/prep.js › PREP_LESSON.jidhr = 'jidhr-tarbii'`, `Module00Astaidd.jsx` « راجع » | ids, numbers, names, the lesson id | (1) **re-pointed** to the world key `dil-as-saha` (§13.1 h did the same for unit 1) and `knowledgeOf` also globs `world/knowledge.js` (as unit 1's test did); (2) the collision reader also reads the courts of every `world/story.js` (`COURTS`, `YARD`: 30, 16, 36, 100, 49, 196, 9, 25 — none is a number of module 7: 40, 14, 28, 56, 60) and the sentinel `196` proves they are read; files counted as content + worlds ≥ 5; (3), (4) unchanged and passing (they name the lesson's home) |
| h | `muadalat-x-murabba` (lesson 3): `priorKnowledge: ['murabba-adad', 'jidhr-taarif', …]`, `requires: ['jidhr-taarif']` in its `content/problems.js` and its module pages | a concept string | **unchanged** (its own data, declared in its `priorKnowledge`: `audit:knowledge` is satisfied by the declaration); the id no longer names a file — as §10.4's `bahth-pgcd` case |
| i | `hisab-judhur/_unit/prepDiagnostic.test.js` (every lesson has an « أستعدّ » page) and `_unit/missionStrings.test.js` (globs the root `knowledge.jsx`, `knowledgeGraph.js`, `content/textbook.js`, `content/exercises.js`; checkpoint strings) | pages, files | adapted (16.3); the unit's `_unit/prepDiagnostic.jsx`, `_unit/moduleContext.js` **kept** (the five other lessons still use them) |
| j | **`check-textbook-coverage.mjs`**: eight elements of `docs/sources/4am/unit2/extraction.json` are destined to `jidhr-tarbii` and were cited by its deleted `content/textbook.js` / `exercises.js` only — `method-compute`, `now-23-1`, `ex-2`, `ex-5`, `ex-6` (module 3), `ict-construct` (module 1), and two SHARED elements: `prep` (« أستعدّ » p. 19: items 1–2, 4, 10 here, 3 / 5–6 / 7–9 in lessons 3, 4, 5) and `qcm` (items 1–3 here, `duplicatedIn` lessons 3, 4, 5) | coverage | **NOT changed — `check:textbook` FAILS (8 problems)**: `extraction.json` was outside this change's files. The six single ones take `notIntegrated` with the reason of `now-13-1` (`defects.md` D11); `prep` and `qcm` cannot (other lessons cite their items, and `notIntegrated` forbids every citation) — follow-up 39 |
| k | `packages/core/curriculum/exportContentRegistry.mjs` (deploy) | data + page files | modules and resources unchanged (8 modules, 6 resources); **the 5 items of the deleted « إختبار أولي » (`final_test:jidhr-tarbii:final:E1…E5`) disappear** — follow-up 40 |
| l | `features/practice/exam/examCoach.test.js` (« a lesson with no pack » was `jidhr-tarbii`), `features/classSession/boardLessons.test.js` (« no board yet » was `jidhr-tarbii`), `knowledge/finalSynthesis.test.js` (unit 2: 6 evaluation pages) | the lesson id, counts | adapted (16.3) |
| m | `unitMissions.js` (icon 🌷, short name, the milestone after it), `moduleLayoutMigrations.js`, the API's remap migration `2026_10_06_000002_remap_problem_modules_unit2_judhur.php` and its tests, the compass and calendar data, the learning net, `practice-oracle/jidhr-tarbii.mjs`, `content/practice`, `content/class-tests`, `lessonlab/registry.js` (`court`), `launchkit` | ids, slugs, the bank | unchanged |
| n | `pages/unit/UnitMissionView.jsx` (unit 2's student page: `config.mission.title`, `tools`) | `mission` data | degrades by design (row 9 of §1): lesson 1's card no longer shows « حوض الأزهار على الوتر » nor its four tool chips |
| o | `docs/reports/knowledge-contracts/4am_jidhr-tarbii.json` | the audit's stale report | **deleted** |
| p | e2e walks | pages | 16.4 |

### 16.2 Phase 2 — deleted

| What | Files | Lines |
|---|---|---|
| module pages (« أستعدّ », نشاط, معارف, أوظّف, three مسائل, « إختبار أولي ») | 8 | 768 |
| `moduleContext.js` | 1 | 4 |
| root `knowledge.jsx`, `knowledgeGraph.js` | 2 | 298 |
| `components/RootFigures.jsx` | 1 | 114 |
| `content/` — `exercises`, `peerSheet`, `prep`, `problems`, `squares` (+ their 4 tests), `textbook` | 10 | 1,119 |
| **lesson folder, total** | **22** | **2,303** |
| mission scene `GardenBedScene.jsx` | 1 | 56 |
| stale audit report `docs/reports/knowledge-contracts/4am_jidhr-tarbii.json` | 1 | 475 |
| **total** | **24** | **2,834** |

Also edited: `lesson.config.js` (16.1 b; module titles and `desc` neutral — 0 « أستعدّ », 1 « ضلع الساحة », 2 « القيمة
المضبوطة، ذهاب وإياب », 3 « أتمرّن », 4–6 « مسألة 1 / 2 / 3 », 7 « التقويم »; ids, numbers, slugs, stages,
`teachesLearningPointIds` unchanged — `world/evidence.test.js › describeEvidence` reads them; the resources' titles no longer
carry the textbook's activity nor the old problems' contexts); `routes.jsx`; `lesson.pack.js`; `world/index.js` (`notYet`);
`MissionScene.jsx`; `PythagorasTanks.jsx` (a comment); `wadiya-idmajiya-judhur/lesson.config.js` (16.1 g); `package.json`
(`format:v2`, `check:format`: the lesson's `world`, `board`, `lesson.pack.js`); `lessonIndex.generated.json` (the lesson's
`pack` flags: world, knowledge, coach, board); `LESSON_V2.md` (retirement ledger).

### 16.3 Tests changed

- `features/classSession/boardLessons.test.js`: the lesson joined `BOARD_LESSONS` (door « حصّة القسم », `boardLessonOfPath`,
  « present » refused); the « no board yet » example is now `natiqa-ghayr-natiqa`.
- `features/practice/exam/examCoach.test.js`: the « no pack » example is now `natiqa-ghayr-natiqa`; two new checks — P1 and
  P3 of `jidhr-tarbii` find their world's sheets (`dil-as-saha`, `dhahab-wa-iyab`).
- `knowledge/finalSynthesis.test.js`: 65 → 64 evaluation modules (unit 2: 6 → 5).
- `hisab-judhur/_unit/prepDiagnostic.test.js`: the unit-1 pattern (`isV2` by `retiredModules`, item checks on the lessons
  still on pages, a test naming the v2 lesson).
- `hisab-judhur/_unit/missionStrings.test.js`: the scans also read every `world/knowledge.js` (the lesson's map and sheets
  now face the same « no book » and « no climax » rules); the map's book check is `/الكتاب(?!ة)/` like the file's other
  checks — the world's map says « الكتابة » (the writing of a number), which the old `includes('الكتاب')` took for the book.
- `wadiya-idmajiya-judhur/content/mission.test.js`: 16.1 g (1), (2).
- `jidhr-tarbii/world/journey.test.js`: `lesson.notYet` is now `undefined` (it asserted `['lab', 'launch', 'test']`).
- Unchanged and passing: `lessonPack.test.js` (the lesson now owes the FULL contract: `keys, ladder, trainer, sittings,
  journey, evidence, knowledge, text`; « shared code names no lesson that has a pack » passes again), `registry.test.js`,
  `lessonGraphs.test.js`, `missionModel.test.js`, `kit/peerSheet.test.js`, `defaultTests.test.js`.

### 16.4 Walks (NONE was run)

None changed. **Opening this lesson's deleted pages or its old home**: `learning-progress-hisab-judhur.mjs` (its `CODES`
list: opens `/astaidd` and `/itqan` of every unit-2 lesson, answers « أستعدّ » and the final test, expects POST
`evidence` and PUT `final-test-attempt` — for this lesson both pages now redirect to the world: FAILS for it),
`lesson-kit/4am-hisab-judhur.mjs` (`LESSONS` list, and two cases on `modulePath('jidhr-tarbii', 'trigger')` — the lab
`square-root-side` on `/nashat`), `lesson-kit/moyen-retrofit-phase1.mjs` (modules `nashat`, `maarif`, the lab and its bricks
`qima-mudbuta`, `jidhr-taarif`, `murabba-jidhr`, `jidhr-murabba`). Moves on by itself: `no-back-and-forth.mjs` (picks the
lessons whose config holds `studentView: 'mission'`). Unaffected: `lesson-lab.mjs` (opens the lab from the world),
`moyen-draft-grades.mjs` (the practice space of the bank).

### 16.5 Follow-ups NOT done

39. **`check:textbook` fails on 8 elements of unit 2** (16.1 j). `method-compute`, `now-23-1`, `ex-2`, `ex-5`, `ex-6`,
    `ict-construct`: `notIntegrated` with the D11 reason, edited by id in `docs/sources/4am/unit2/extraction.json`. `prep`
    and `qcm` are shared with lessons 3–5 and have no per-item `notIntegrated`: either their primary `lesson` passes to a
    lesson that cites them (`muadalat-x-murabba` cites `prep` item 3 and `qcm` 4–6, 10–11) — a « move » D11 forbids — or the
    script learns a per-item `notIntegrated`. A decision, not a mechanical change.
40. **5 final-test items retired at the next deploy** (the deleted « إختبار أولي »), as follow-ups 1, 10, 13, 17, 24, 31, 34.
41. The `square-root-side` lab keeps its « refine » mode and the 0,04 example for no page (`natiqa-ghayr-natiqa` uses the
    graduation mode only) — a mode now unused, not detected by `check:unused` (a branch, not an export).
42. Stale mentions left in documents (not this change's files): `LESSON_DEVELOPMENT_GUIDE.md` (`'garden-bed'` in the
    scene list, not marked DELETED), `MISSION_ROLLOUT_PROGRESS.md` (unit 2, lesson 1).
43. The three walks of 16.4 test the old pages of unit 2 (they are, with `learning-progress-hisab-judhur.mjs`, the browser
    proof of the final-test evidence for the unit): re-target to `natiqa-ghayr-natiqa` or drop this lesson from their lists.

### 16.6 Checks run (one at a time)

`cd apps/web && npx vitest run src/lessons/lessonPack.test.js src/features/classSession src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/hisab-judhur --maxWorkers=2`
— before: 1 failure (« shared code names no lesson that has a pack »: `GardenBedScene.jsx`, `MissionScene.jsx`,
`PythagorasTanks.jsx`), 55 files, 447 tests; after: ✅ 51 files, 423 tests (the four deleted `content/*.test.js` left the count). `src/lessons/registry.test.js
src/features/practice src/lessons/common/{lessonlab,launchkit,knowledge,mission,gameworld/kit,kit/peerSheet.test.js,problems,utils/progress}
src/pages/unit src/features/teacher/lessonMemo` — 3 failures of old-version assertions (examCoach ×2, finalSynthesis), fixed
(16.3), re-run ✅. `src/features/{compass,home,teacher} src/components src/pages` ✅ 725 tests. `status:lesson-v2 --lesson
jidhr-tarbii`: everything ✅ but « a walk plays its world » (the orchestrator). `check:unreached` ✅ (4,928 files).
`check:unused`: 10, none of this lesson (`board/script.js › SCRIPT`, `memo.js › MEMO` clean now that the pack names them) —
`lessonScripts.js › courtRides` and nine of `gameworld/rootCourts/` (`calc.js › longestCell`, `forgeParts.jsx ›
COURT_FORGE_PARTS`, `logic.js › rides`, `marksIn`, `ruleForge.js › freshOf`, `firstBreak`, `rodIn`, `courtCase`,
`scenery.js › makePalm`). `eslint` on the touched files ✅ · `prettier --check` on the pack, `routes.jsx`, `world/`,
`board/`, `boardLessons.test.js` ✅. `check-textbook-coverage.mjs` ❌ (16.1 j). NOT run: the whole suite, a build,
`check:lessons`, `validate:lessons`, any walk, the API tests.

## 17. Unit 2, lesson 2 — `natiqa-ghayr-natiqa` (2026-11-21, NOT committed)

Lesson: 4AM `natiqa-ghayr-natiqa` « الأعداد الناطقة والأعداد غير الناطقة » (`…/hisab-judhur/natiqa-ghayr-natiqa/`), the
second lesson of the world `root-courts` « قصر الساحات ». Same job and shape as §16. Its new version — `world/`, `board/`,
the class test `content/class-tests/4am/natiqa-ghayr-natiqa.json`, the lab instrument `piece` — was not touched (its
`world/index.js` holds no `notYet` list; `world/forges.js` and `inquiries.js` were being written by another agent at the
same time). Its pack `lesson.pack.js` was CREATED in this change: `world` (`root-courts`), `phone: false`, `knowledge` =
`world/knowledge.js › LESSON_KNOWLEDGE`, `board` script and memo, and `coach` P1 `murabba-natiq` · P2 `murabba-natiq` · P3
`la-kasr-yarkab` · P4 `al-mudawwar`. P2–P4 are `world/evidence.js › POINTS` (one الكفاءة a key); P1 (classifying a root)
is proved by no key's evidence (the bank's sitting proves it) and its rule is the 🧩 sheet's — the coach maps a POINT to a
sheet (`examCoach.js › loadRule` reads `coach[point]`), so two points on one sheet is allowed. The lesson was on the
MISSION PLAYER (scene `carpet-loom`).

### 17.1 Phase 1 — the readers

Rows 1, 3–5, 10–12, 14–15 and 17 of §1, rows h, l of §11.1, rows a, b, d of §15.1 and rows a, b, i, k, l, m, n of §16.1
hold unchanged. What is specific:

| # | Reader | Reads | Decision |
|---|---|---|---|
| a | `lesson.config.js › studentView`, `mission` (scene `carpet-loom`), `lessonProblem`, `knowledgeMapOpen`, `textbookRef`, the French header | the mission player, `LessonProblemCard`, the old 🧠 provider | **deleted**, header rewritten (as §16.1 b, the keys named without the literal `studentView: 'mission'`); module titles and `desc` neutral (0 « أستعدّ », 1 « ساحات مساحتها عشريّة », 2 « ساحة لا تقع على علامة », 3 « أتمرّن », 4–6 « مسألة 1 / 2 / 3 », 7 « التقويم »); `teachingScope` without the textbook's numbering; ids, numbers, slugs, stages unchanged. **P4 was taught by no module** (`world/evidence.test.js › describeEvidence`, « a module of the lesson teaches it », failed): P4 added to modules 2 and 3 |
| b | `common/mission/MissionScene.jsx › 'carpet-loom'` → `CarpetLoomScene.jsx` | this config only | **deleted** (import, entry; the comment lists it with `garden-bed`) |
| c | `content/exercises.js`, `peerSheet.js`, `prep.js`, `problems.js`, `rulers.js` (+ their tests and `mission.test.js`), `textbook.js`, root `knowledge.jsx`, `knowledgeGraph.js`, `moduleContext.js`, `modules/` | the module pages and the old 🧠 map only (`world/` and `board/` import none of them) | **deleted** |
| d | the lab `square-root-side` (`resources`, two « graduation » workspaces, `sourceElementIds: ['act-2']`) | `resources` | **kept** as data (the coverage check reads `act-2` there). **Now mounted by no lesson** (lesson 1's pages went in §16): reached through `manipulationRegistry.js`, so `check:unreached` keeps it — follow-up 44. `logic/squareRootSide.js › RESIST_AFTER` was exported for the deleted `content/rulers.test.js` only: `export` removed (`check:unused`). Lesson 1's config comment (« natiqa-ghayr-natiqa still mounts it ») corrected |
| e | **`wadiya-idmajiya-judhur`**: (1) `mission.tools[1].id: 'qima-muqarraba'` — an id of this lesson's deleted `knowledge.jsx` (`content/mission.test.js › knowledgeOf`); (2) `mission.test.js › labContent` read this lesson's `content/rulers.js`; its world reader took `Number('2,56')` (NaN) for this lesson's courts | ids, numbers | (1) **re-pointed** to the world key `al-mudawwar` (🎯; the `requires: ['qima-muqarraba']` of its problems and `priorKnowledge` are concept strings, unchanged, as §16.1 h); (2) the courts are read with the decimal comma as a point, the sentinel `10.24` (a court of this lesson) proves it, files counted content + worlds ≥ 4 (folds, tilings, two worlds) |
| f | `_unit/prepDiagnostic.test.js` (the v2 lessons of the unit), `_unit/missionStrings.test.js` (raw scans ≥ 18) | pages, files | adapted (17.3) |
| g | `knowledge/finalSynthesis.test.js` (unit 2: 5 evaluation pages), `lessonPack.test.js`, `boardLessons.test.js`, `examCoach.test.js` (this lesson was their « no pack / no board » example) | ids, counts | adapted (17.3); the example is now `muadalat-x-murabba` |
| h | **`check-textbook-coverage.mjs`**: two elements destined to this lesson were cited by its deleted files only — `ict-sqrt2` (module 2) and `ex-31` (module 3; its item 2 is destined to `tawzif-khawass-judhur`, which cites it) | coverage | `ict-sqrt2`: **`notIntegrated`** with the D11 reason (edited by id). `ex-31`: **NOT changed** — shared with a lesson not rebuilt (`notIntegrated` would make lesson 5's citation an error): stays red (ledger D40), with `prep` and `qcm` of §16 |
| i | `exportContentRegistry.mjs` (deploy) | page files | **the 5 items of the deleted « إختبار أولي » (`final_test:natiqa-ghayr-natiqa:…E1…E5`) disappear** — follow-up 45 |
| j | `docs/reports/knowledge-contracts/4am_natiqa-ghayr-natiqa.json` | the audit's stale report | **deleted** |
| k | `unitMissions.js` (icon 🧶, short name, milestone), `moduleLayoutMigrations.js` (`{4: 7}`), the API's remap migration, `lessonlab/registry.js` (`piece`) and `lab.test.js`, `defaultTests.test.js`, `practice-oracle/natiqa-ghayr-natiqa.mjs`, `content/practice`, compass, calendar, catalogue | ids, slugs, the bank | unchanged |
| l | e2e walks | pages | 17.4 |

### 17.2 Phase 2 — deleted

| What | Files | Lines |
|---|---|---|
| module pages (« أستعدّ », نشاط, معارف, أوظّف, three مسائل, « إختبار أولي ») | 8 | 648 |
| `moduleContext.js` | 1 | 4 |
| root `knowledge.jsx`, `knowledgeGraph.js` | 2 | 239 |
| `content/` — `exercises`, `peerSheet`, `prep`, `problems`, `rulers` (+ their 4 tests), `mission.test.js`, `textbook` | 11 | 1,220 |
| **lesson folder, total** | **22** | **2,111** |
| mission scene `CarpetLoomScene.jsx` | 1 | 67 |
| stale audit report `docs/reports/knowledge-contracts/4am_natiqa-ghayr-natiqa.json` | 1 | 355 |
| **total** | **24** | **2,533** |

Also edited: `lesson.config.js`, `routes.jsx` (`retiredModules: true`, no `loadKnowledge`), `lesson.pack.js` (new),
`MissionScene.jsx`, `logic/squareRootSide.js` (one `export`), `jidhr-tarbii/lesson.config.js` (a comment),
`wadiya-idmajiya-judhur/lesson.config.js` (17.1 e), `package.json` (`format:v2`, `check:format`: the lesson's `world`,
`board`, `lesson.pack.js`), `lessonIndex.generated.json` (the lesson's `pack` flags: world, knowledge, coach, board),
`docs/sources/4am/unit2/extraction.json` (`ict-sqrt2`), `LESSON_V2.md` (retirement ledger).

### 17.3 Tests changed

- `lessonPack.test.js`: the « no pack » example is `muadalat-x-murabba`.
- `features/classSession/boardLessons.test.js`: the lesson joined `BOARD_LESSONS` (door « حصّة القسم », `boardLessonOfPath`,
  « present » refused); « no board yet » is `muadalat-x-murabba`.
- `features/practice/exam/examCoach.test.js`: « no pack » is `muadalat-x-murabba`; three new checks — P1 and P2 find the 🧩
  sheet, P4 the 🎯 one.
- `knowledge/finalSynthesis.test.js`: 64 → 63 evaluation modules (unit 2: 5 → 4).
- `_unit/prepDiagnostic.test.js`: the v2 lessons of the unit are `jidhr-tarbii`, `natiqa-ghayr-natiqa`.
- `_unit/missionStrings.test.js`: the raw scans read 17 files (lessons 3–5: four each, the synthesis three, two
  `world/knowledge.js`): ≥ 18 → ≥ 17.
- `wadiya-idmajiya-judhur/content/mission.test.js`: 17.1 e.

### 17.4 Walks (NONE was run)

None changed. **Opening this lesson's deleted pages or old home**: `learning-progress-hisab-judhur.mjs` (`CODES` starts
with this lesson: `/astaidd`, `/itqan` now redirect to the world — FAILS for it), `lesson-kit/4am-hisab-judhur.mjs`
(`LESSONS` list, and case 3b on `modulePath('natiqa-ghayr-natiqa', 'trigger')` — the `square-root-side` lab on `/nashat`),
`lesson-kit/moyen-retrofit-phase1.mjs` (modules `nashat`, `maarif`, the lab and the bricks `murabba-natiq`, `ghayr-natiq`).
Move on by themselves: `no-back-and-forth.mjs`, `mission-opening-align.mjs` (pick the configs holding
`studentView: 'mission'`). Plays the new version: `lesson-lab.mjs` (opens `piece` from the world).

### 17.5 Follow-ups NOT done

44. The `square-root-side` lab (`SquareRootSide.jsx`, `logic/squareRootSide.js`, `levels.js`, core `manipulationTypes.js`,
    its strings, tests and the walk cases of 17.4) is mounted by no page now; only the two configs' `resources` name it —
    the same owner's call as follow-ups 2 and 23.
45. **5 final-test items retired at the next deploy** (the deleted « إختبار أولي »), as follow-up 40.
46. `check:textbook` stays red on 3 elements: `prep`, `qcm` (follow-up 39) and now `ex-31` (item 1 here, item 2 in
    `tawzif-khawass-judhur`) — until the last lesson citing it is rebuilt, or the script learns a per-item `notIntegrated`.
47. Stale mention left in documents (not this change's files): `LESSON_DEVELOPMENT_GUIDE.md` (`'carpet-loom'` in the scene
    list, not marked DELETED), `MISSION_ROLLOUT_PROGRESS.md` (unit 2, lesson 2).
48. The three walks of 17.4: re-target to `muadalat-x-murabba` or drop the two v2 lessons from their lists (with 43).

### 17.6 Checks run (one at a time)

`cd apps/web && npx vitest run src/lessons/lessonPack.test.js src/features/classSession src/features/practice src/lessons/common/knowledge src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/hisab-judhur --maxWorkers=2`
— after the deletion, 1 failure (`missionStrings` « found the lessons »: 17 < 18), fixed (17.3); re-run ✅ 88 files, 4,344
tests. `src/lessons/registry.test.js src/lessons/common/{mission,lessonlab,kit/peerSheet.test.js,problems,manipulations/roots}
src/pages/unit` ✅ 27 files, 924 tests; `manipulations/logic/squareLabs.test.js` ✅ 20. `status:lesson-v2 --lesson
natiqa-ghayr-natiqa`: everything ✅ but « a test per part » (`world/forges.test.js`, another agent's) and « a walk plays its
world » (the orchestrator). `check:unreached` ✅ (4,923 files). `check:unused`: `RESIST_AFTER` (fixed) and
`world/math.js › tiles` (re-exported, imported by a test only — the world's, not the old version's; left). `eslint` on the
touched files ✅ · `prettier --check` on the pack, `routes.jsx`, `world/`, `board/`, `boardLessons.test.js` ✅.
`check-textbook-coverage.mjs`: 2 problems before (`prep`, `qcm`), 4 after the deletion, 3 after `ict-sqrt2` (17.1 h).
NOT run: the whole suite, a build, `check:lessons`, `validate:lessons`, any walk, the API tests.
