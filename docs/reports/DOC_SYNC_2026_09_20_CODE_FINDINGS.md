# Code findings from the documentation synchronization — 2026-09-20

During the full documentation synchronization the code was read as the source
of truth. These were **defects found in the code, not in the documentation**.

> **Status update (2026-09-20, later the same day).** Findings **1, 2 and 3
> are FIXED and verified** — in unit tests and in a real browser. Each entry
> below keeps its original diagnosis for the record and ends with what was
> done. Findings 4 and 5 are **not fixed**: they are separate concerns (Arabic
> copy, display arithmetic, tooling) and remain the owner's call.

Each item is verified, with the file and line that proves it. Ordered by
apparent severity.

---

## 1. Module 0 (« أستعدّ ») is never recorded as completed or visited

**Where:** `apps/web/src/lessons/common/components/ModuleLayout.jsx:135,141,164,370`

Every progress write is guarded by `if (lessonId && moduleNumber && …)`. A
module whose `number` is `0` fails that test, because `0` is falsy. These are
the only call sites of `markModuleCompleted` / `markModuleVisited` in the app.

**Affects:** `qasim-adad-tabii` and `ikhtizal-kasr`, the two lessons that open
with a `prerequisite_check` module.

**Consequences, all verified against the readers:**

- Lesson progress caps at 4/5 (80 %); `isMastered` on the lesson index requires
  every module completed and so is unreachable.
- `progressQueue` never sets `status: 'completed'`, so the lesson never reads as
  finished on the unit page, the courses page or the student space.
- The diagnostic card never shows its completed state.

**Masked by:** the e2e suites seed `completed: ['0']` by hand, so no browser
test catches it.

**Note if fixing:** the same off-by-falsy exists in resume logic —
`packages/core/progress/getNextIncompleteModule.js:82` iterates from 1, and
`getLessonProgress` defaults `currentModule` to 1, so module 0 is never a resume
target either. A fix should treat "module number 0" as valid throughout, not
special-case one call site.

### ✅ Fixed

`isValidModuleNumber` (`packages/core/progress/isValidModuleNumber.js`) now
decides whether a module number is usable, and the four `ModuleLayout` write
sites ask it instead of testing truthiness. The predicate validates the
*nature* of the value — a finite integer ≥ 0 — and deliberately rejects the
values `Number()` would coerce to 0 (`''`, `[]`, `false`).

The resume path was fixed with it: `getNextIncompleteModule` takes an optional
`firstModuleNumber` (default 1, so every existing caller is unchanged) and
sweeps the lesson's real range, and `getFirstModuleNumber` was added to the
lesson registry and wired into `getResumeLesson` and the progression tree.
Otherwise "continue" sent a student to module 1, silently skipping أستعدّ.

Verified in a browser: visiting module 0 records `currentModule: 0`, the index
counts it (20 % of 5), the lesson reaches 100 % and reads as mastered.

---

## 2. The final « الحوصلة » synthesis phase renders an empty knowledge map

**Where:** `apps/web/src/lessons/common/knowledge/KnowledgeMap.jsx:601`, and all
nine evaluation modules.

`CompleteView({ items, printable, columns })` takes its items **as a prop** and
never reads the knowledge context. Every evaluation module in the unit renders
`synthese={<CompleteView />}` with no `items`, so `buildStructure([])` produces
no strata and the phase shows only a print button.

`BossFinal` also never calls `unlockAll()`, and `KnowledgeSnapshot`'s `complete`
variant — the component that would populate the full map — is not used anywhere
in the unit.

**Effect:** the last thing a student sees after the final test is a blank
synthesis. The knowledge map itself is fine everywhere else.

### ✅ Fixed

`CompleteView` was left alone — it is a presentational component and its
`items` prop is a sound contract. The nine evaluation modules now render
`<KnowledgeSnapshot complete variant="complete" />`, the component that already
existed for exactly this: it calls `unlockAll()` and passes the real items to
`CompleteView`. No new pedagogical content was introduced; the synthesis shows
the knowledge the lesson already taught.

Verified in a browser on `qasim-adad-tabii`: after submitting the final test,
الحوصلة renders the map with all four of the lesson's knowledge items
(`qasim-baqi`, `qasim-jidaa`, `siyagh-mutakafia`, `wahid-wa-nafsuh`), organised
in strata. A lesson with a genuinely empty map still shows the existing empty
state, not a broken one.

---

## 3. The unit page prints `[object Object]` for textbook pages

**Where:** `apps/web/src/pages/UnitPage.jsx:119`, data in
`packages/core/curriculum/dz/lessons_4am_2026_2027.json`.

`lesson.textbookRef.pages` is an object for all nine unit lessons — for example
`{"activity": 8, "knowledge": 10, "exercises": 14}` — and is interpolated into
the `unit.textbookPages` string, which renders `الكتاب ص [object Object]`.

Note that `LESSON_CONFIG.textbookRef.pages` in the lesson file is a *string*
(`'8, 10, 14'`) while the catalogue's is an object. The config copy is not read
by anything; the catalogue's is what displays.

### ✅ Fixed

`formatTextbookPages` (`packages/core/curriculum/textbookPages.js`) turns the
section map into the ordered, de-duplicated list of pages the lesson occupies,
joined with the Arabic comma: `{activity: 8, knowledge: 10, exercises: 14}`
becomes `8، 10، 14`. It also flattens a section spanning several pages
(`knowledge: [10, 12]`) and passes through the already-readable forms — the
unit-level `pages` is the string `"7–16"`.

Both interpolation sites on the unit page go through it. Verified in a
browser: the footer now reads `الكتاب ص 8، 10، 14`, and a test asserts that no
lesson in the catalogue can produce `[object Object]`.

---

## 4. Latin and French text on Arabic student surfaces

Each violates the Arabic-first rule in
`docs/architecture/ARABIC_RTL_CONTRACT.md`.

| Where | What renders |
|---|---|
| `LessonIndex.jsx:276` | the hero pill shows the raw chapter id and the Latin words `modules` / `min`, e.g. `🔢 ansab_al_aadad_wal_hisab • 5 modules • ~45 min` |
| `LessonIndex.jsx:477,520,554,590` | `~N min` |
| `LessonIndex.jsx:551` | `MISSION (04)` |
| `BossFinal.jsx:452` | a full French paragraph under the earned badges |
| `ModuleLayout.jsx:293` | `aria-label="Progression : N%"` — read aloud by a screen reader |
| `DivisorExplorerBooks.jsx:84` | `aria-label={`Livre ${index + 1}`}` on each of the 420 books |
| `packages/core/lessonAccess.js:157` | a deprecated French `lockedReason` |

---

## 5. Smaller inconsistencies

- **Module progress in the header is off by the numbering.**
  `ModuleLayout.jsx:105` computes `moduleNumber / totalModules`, so in a
  five-module lesson numbered 0–4 the last module reads 80 % and module 0 reads
  0 %.
- **Diagnostic score thresholds assume a /10 scale.**
  `PrerequisiteDiagnostic.jsx:70,201` hardcode `< 5` / `≤ 7` / else, while the
  two diagnostics in the unit have maxima of 9 and 8. In `ikhtizal-kasr` only a
  perfect score reaches the top tier.
- **`validate-lessons.mjs:203`** still names the obsolete
  `modules/<NN>_<slug>.jsx` convention in its error message; the real one is
  `Module<NN><Descriptor>.jsx`.
- **Stale catalogue metadata:** `packages/core/curriculum/activeGrades.js:11`
  comments that no lesson is written, and `coursesData.js:3252` sets
  `curriculumStatus: 'lessons_planned'`, while nine lessons are `available`.
- **`Itqan` / `Ahill` are load-bearing filename words.**
  `scripts/check-textbook-coverage.mjs:106` identifies an evaluation module by
  the regex `/modules\/Module\d+.*(Itqan|Boss|Ahill)/`. Renaming a module file
  silently changes coverage checking.
- **Config fields nothing reads:** `passingScore`, `unitTitle`, and the config's
  own `textbookRef`.
- **`requires`, `establishes` and `requiresLearningPointIds`** have no runtime
  effect. The first two are audit contracts, which is by design and documented.
  The third is a real mastery gate that `LessonIndex.jsx:408` never activates,
  because it does not pass `masteryStatusById`. No lesson in the unit uses it.

---

## 6. A failing gate in the local environment

`npm run check:activation-drift` fails on this machine:

```
✗ Leçon « pgcd » (4am) : palier base = free, source = ABSENTE de la source.
```

This is **dev-database drift, not a code or documentation defect**. The
prototype `pgcd` lesson was retired from the catalogue in phase 8, but its row
survives in the local database. The gate reads the database, not the
repository, so it cannot be fixed by editing files. The handshake it names
resolves it:

```bash
node packages/core/curriculum/exportCurriculum.mjs
cd apps/api && php artisan smarter:import-curriculum
```

Every other gate in `check:lessons` passes, as do all unit tests
(5082 web, 47 scripts, plus core).

---

## 7. Test and tooling gaps

> **Correction (2026-09-20).** An earlier report from this session described
> eleven failures in `LessonProgressFlowTest` and `LearningEvidenceFlowTest` as
> **stale French fixtures** left over from the Algeria migration. **That
> diagnosis was wrong.** The fixtures are correct and the tests are valid: they
> exercise generic progression and evidence mechanics, and the suite is
> *designed* to build ad hoc grade fixtures.
>
> The real cause was the **gitignored `apps/api/phpunit.local.xml`**, which
> overrides the committed config to use MySQL and had drifted from it by one
> missing line, `CURRICULUM_ENFORCE_ACTIVE_GRADES=false`. Restoring it made all
> 24 tests pass with no change to any fixture. The full PHP suite is green:
> **731 tests, 2851 assertions, 0 failures.** See the guide's
> « Backend tests, and the local config trap ».

- Neither browser suite runs in CI; `.github/workflows/ci.yml` runs unit tests
  only, deliberately.
- The e2e helper defaults `KIT_BASE` to `http://localhost:5183`, which is
  `vite preview` serving a stale build with no API. Three suite headers print
  5183 in their run instructions; only `classroom.mjs` prints the correct 5173.
- No unit tests exist for `useFullscreen`, `useScrollLock`, `usePresentationFit`
  or `ClassroomPresentation`. The pure modules (`classroomFit`,
  `classroomUnits`, `booksClassroomLayout`) are well covered.
- `manipulations.mjs` does not exercise class mode, though its header says it
  does, and it does not assert the "no result before discovery" invariant
  generally.

---

## 8. What was fixed in the documentation instead

The documents now describe the behaviour above as it really is, rather than as
intended: the Classroom Mode, manipulation and Arabic/RTL contracts were
corrected, and `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` documents the rules a
new lesson must follow. This report is the record of what the code should
change, whenever the owner decides to.
