# Cycle moyen 1AM–3AM rollout — phase 1 report (sources and decomposition)

**Date:** 2026-10-13/14. **Status:** phase 1 done. **Next:** phase 2 (platform and database), then phase 3, the
generation loop. Each phase runs in its own session; the prompts are in §5.

Contract: [`docs/architecture/LEARNING_NET.md`](../architecture/LEARNING_NET.md) (§2.4 planned lessons, §4 generation
contract, §4bis generation order).

## 1. Owner decisions (2026-10-13), binding for every later phase

| # | Decision |
|---|---|
| D1 | **الكفاءات are drafted by the platform** from each unit's « سأتعلّم في هذا الباب » and the net items. The owner validates. |
| D2 | **All learning points of all grades go into the database.** Lessons not yet generated appear in the catalogue as **draft cards, not clickable**. |
| D3 | **Generation follows the net, not the grades.** Start from the 4AM lessons. For each one, generate all its connected lessons in the earlier years, one by one, oldest first. Then move to the next 4AM lesson. When the 4AM chains are exhausted, do the same from 3AM, then 2AM, then 1AM. Isolated lessons come last. |
| D4 | **Practice comes from the term exams** in `docs/Exames-1 AM to 3AM/`. When the pattern is clear, new exercises are generated « على منوال » rather than copied. |
| D5 | **The 2AM scan is the only copy.** Get the idea from it; don't spend tokens on illegible passages. |
| D6 | **Publish each lesson as soon as it is generated**, so the owner can review it while the next one is generated. |
| D7 | **Links to earlier years also go inside exercises**, not only in the « أستعدّ » prerequisite test. |
| D8 | **Run one phase per session**, ending with a report and the next session's prompt, to save tokens. |
| D9 | **Files with bad text are skipped**, never OCR'd. |
| D10 | **The lessons without a programme item are generated** like the others (2026-10-14): 3AM « البرهان في الرياضيات » (3 lessons), 3AM « المتباينة المثلثية », 2AM « إنتاج عبارة حرفية ». They keep `programmeItems: []`, stay at the end of the queue (phase E), and are labelled as textbook content beyond the 2022 plan. |
| D11 | **Missing scan pages are generated** (2026-10-14): 2AM p.140 (the second « معارف » page of unit 9) and pp.196–198 (unit 12's « أدمج تعلّماتي », its ICT page and the glossary), and 3AM p.37 (unit 2's ICT page). They are written in the book's format, as **declared platform additions** (`addition('knowledge_formalization' / 'synthesis_generation' / 'interaction_generation')`), never presented as textbook text. |

## 2. What phase 1 produced

| Output | Path | Content |
|---|---|---|
| 1AM textbook map | `docs/sources/1am/textbook-map.json` | موفم 2017, 210 p. **14 units, 55 lessons**, « سأتعلّم » copied word for word, draft الكفاءات, programme items, page map (PDF = printed p. up to 150, then +1) |
| 2AM textbook map | `docs/sources/2am/textbook-map.json` | الشهاب, 191 p. phone scan. **12 units, 53 lessons**. Book page = PDF + 3, then + 4 after the missing p.140. The scan stops at p.195. |
| 3AM textbook map | `docs/sources/3am/textbook-map.json` | الشهاب 2017, 220 p. **13 units, 49 lessons**. Page offset varies by range; p.37 is missing. Unit 8 « البرهان في الرياضيات » has no programme item. |
| Exam corpus | `docs/sources/moyen/exams/exams-index.json`, `EXAM_PATTERN.md` | 186 files (176 distinct). 108 indexed with **504 exercises**, including 97 integration situations. Text layer: 51 good, 38 poor, 87 none. Pattern, coverage per item, and a recipe for the practice banks. |
| Net, rebuilt | `packages/core/curriculum/dz/net/learning_net_moyen.json` | The provisional plan is replaced by the textbook cut: **39 units, 157 lessons + 39 syntheses**, every 1AM–3AM item covered. |
| Generation order | `scripts/learning-net-queue.mjs` → `docs/curriculum/GENERATION_QUEUE.md` and `generation-queue.json` | **196 entries**: A 108 · B 35 · C 22 · D 23 · E 8. Also lists 18 same-year forward references. |
| Maps | `docs/curriculum/LEARNING_NET_MAP.md`, `learning-net-map.html` | Regenerated |
| Gates | `learningNet.test.js` (18 tests); `check:learning-net` now also checks the queue | All green |

The queue starts with:

1. `mana-jam-tarh` (1AM)
2. `qisma-iqlidiya-baqi` (1AM)
3. `qawaid-qabiliyat-qisma` (1AM), the chain under 4AM « قاسم عدد طبيعي »
4. `qisma-iqlidiya-hasr` (2AM), under « القاسم المشترك الأكبر »
5. `kitabat-adad-tabii`, `ikhtizal-kitaba-kasriya`, `hasil-qisma-kasr` (1AM), under « اختزال كسر »

### Things to review (owner)

- **The draft الكفاءات** of the 157 lessons (`pointsToLearn`, `decisionStatus: "draft"`). The queue order means you can
  validate them unit by unit, just before each unit's lessons are generated.
- **The lesson cut decisions** each reader made (merges, splits). They are written in each map's `notes` and
  per-lesson `notes`.
- ~~Lessons without a programme item~~ → **decided D10: generated.**
- **Exam files never to use:**
  - `2am/2AM.pdf` is a commercial exercise book (Dar El Maarifa), not an exam.
  - `2am-s2-61` builds its integration situation on bombings and soldiers killed.
- **Four misfiled exams** (`1am-s1-100`, `1am-s2-79`, `2am-s2-65`, `3am-s1-112`) are indexed under the grade printed
  on the paper.

### Known gaps carried forward

- **Missing scan pages:** 2AM p.140 and pp.196–198 (unit 12's « أدمج تعلّماتي »); 3AM p.37 (an ICT page).
  **Decided D11: generated** as declared platform additions when their unit is seeded (phase 3).
- **Thin exam coverage**, so these lessons will rely on generated exercises:
  - solids: 1am.m7, 2am.m7, 3am.m6;
  - statistics, motion and spreadsheets: 1am.m6, 3am.m7;
  - a few isolated items, listed in `EXAM_PATTERN.md` §5.

## 3. State of the repository

- **Pushed:** the learning-net work done before this phase is on `origin/dev` as `7797dc50`.
- **Phase-1 output:** committed on the same branch, `feat/learning-net`, and pushed to `dev` at the end of this
  session (see the final message for the commit).
- **The owner's working copy** is on a local `dev` at `d223a016`, behind `origin/dev`. It holds an unfinished
  « remove islamic feature » diff from another session (six files). `origin/dev` already contains that change
  completed (`2b1e7342`). **Before starting phase 2, the session must sync the working copy** (prompt step 0).
- **Two failures predate this work.** They are the same on `origin/dev` without these commits:
  - `levels.test.js` and `manipulationRegistry.test.js` find 65 manipulation types where 64 are expected.
  - `check:activation-drift` fails until the local database is re-imported.

## 4. The next phases

### Phase 2 — platform and database (one session)

> **Done on 2026-10-14** — see [`MOYEN_ROLLOUT_PHASE2_REPORT_2026-10-14.md`](./MOYEN_ROLLOUT_PHASE2_REPORT_2026-10-14.md)
> (owner decision D12: publish = push to `dev`; the phase-3 prompt there supersedes the one below).

Goal: the three grades exist in the platform, and all their lessons appear as non-clickable cards. All their
learning points are in the database. The net reads the new files. Exercises can carry links to earlier years.

1. **Catalogue files per grade.** Create them from the net's `plannedUnits` and `plannedLessons`, following the
   4AM trio:
   - `packages/core/curriculum/dz/units_<g>_2026_2027.json`
   - `lessons_<g>_2026_2027.json`
   - a minimal `programme_<g>_2026_2027.json`, whose domains and topics come from the official segments.

   Lessons get `status: "coming_soon"`, which the catalogue already shows as a non-clickable card; the published
   scope comment in the 4AM file explains the term. They also get their `programmeItems`, `pointsToLearn`
   (draft), and `prerequisiteLessonCodes`, derived from the net's review links. Then remove the migrated entries
   from `plannedLessons` and `plannedUnits`: the code-uniqueness test enforces it, and the net reads the new
   files through `EXISTING_LESSON_FILES`, with `coming_soon` mapping to `planned`.
2. **`coursesData` and the catalogue for four grades.**
   - `buildDzCourseLevels` builds 1am, 2am and 3am as well as 4am.
   - `activeGrades.js` adds them.
   - Make sure every grade-dependent surface works with grades that have zero published lessons: grade choice,
     courses, unit page, teacher classes, progression, practice index.
   - Unit pages show the draft cards with a « قيد الإعداد » state (Arabic only).
3. **Database.**
   - `exportCurriculum` and `smarter:import-curriculum` must import the `coming_soon` lessons and **all their learning
     points** (`{g}_{code}_P{n}`). They must not become clickable or routable, and Mastery V2 must ignore them until
     they are published.
   - Lesson-to-lesson prerequisites come from the net.
   - Cross-year LP→LP edges: only where safe. Each LP of a lesson depends on all LPs of the review-link home lesson,
     at the threshold of 0.7. Or keep them at lesson level and document why.
   - Check `CurriculumImporter`, `ValidateCurriculum` and `ScopeCurriculum`; lesson tier stays admin-owned, so new
     lessons are free.
   - Write a feature test on MySQL with `phpunit.local.xml`, one run at a time.
4. **Links to earlier years in exercises (D7).** Design the pattern once and apply it to 4AM:
   - a practice or lesson question whose LP has review links shows, after a wrong answer, a compact
     « راجع: <lesson> (<year>) » link;
   - the link is derived from the net through LP → lesson → `reviewLinksForLesson`, never written by hand;
   - when the target lesson is not yet published, show the الكفاءة text without a link.

   Document it in `EXERCISE_CONTRACT.md` and `LEARNING_NET.md` §3.
5. **Exercise contract:** add the `term_exam` source type and the platform-addition reason `term_exam_modelled`,
   with the badge « على منوال اختبار الفصل الأول/الثاني/الثالث ». The recipe is in `EXAM_PATTERN.md` §6. Update
   `validate-exercises.mjs`.
6. **Define "publish"** for the loop: the lesson's status becomes `available`, the curriculum is exported and
   imported, the change is committed and pushed. Write the exact command sequence into the guide, then confirm
   with the owner whether publishing means `dev` (CI only) or `main` (production deploy).
7. **Gates and docs:** `npm test`, `npm run check:lessons`, `npm run build`. Update `LEARNING_NET.md`,
   `LESSON_DEVELOPMENT_GUIDE.md` (§3 adding a grade, §14), `EXERCISE_CONTRACT.md`, `ARCHITECTURE.md` and
   `docs/README.md`. End the session with a phase-2 report and the phase-3 prompt.

### Phase 3 — the generation loop (many sessions, about 3–5 lessons each)

Each session takes the **next entries of `docs/curriculum/generation-queue.json`**. For each lesson:

1. **First lesson of a unit:** seed the unit, as 4AM did — unit folder, `_unit/`, routes, and the exact-maths module
   if one is needed. Build `docs/sources/<g>/unit<N>/extraction.json` from the textbook pages listed in the unit's
   `textbook` block, with a `build-extraction.py` beside it.
2. **The lesson:**
   - Follow the guide's §14 generation contract and LEARNING_NET.md §4: the « أستعدّ » diagnoses the review links,
     the lesson does not rebuild what `noRebuildForLesson` lists, and `pointPrerequisites` follow net links only.
   - The lab follows MANIPULATION_DNA, with two levels.
   - The knowledge map, the « أتوقّع القاعدة » prompts, the « مسائل » modules, and values woven into story
     contexts, as in the 4AM unit-1 rules.
3. **The practice bank:** 5 levels × 10 exercises, built from `exams-index.json` and generated « على منوال »
   exercises, with answer-checking scripts, the badge, and links to earlier years.
4. **Gates,** browser check at 320 px and in RTL, then **publish** (D6).
5. **When the unit's last lesson is done,** generate its synthesis « أدمج تعلّماتي » (the 9-module unit-1 format)
   and publish it.
6. **End of session:** progress report, then remove the done entries from the queue view. The queue regenerates
   itself from statuses: published lessons drop out.

## 5. Prompts for the next sessions

### Phase 2 prompt (paste into a new session)

```text
Phase 2 of the cycle moyen rollout — platform and database for 1AM–3AM.
Read first: CLAUDE.md, docs/README.md, docs/architecture/LEARNING_NET.md,
docs/reports/MOYEN_ROLLOUT_PHASE1_REPORT_2026-10-13.md (owner decisions D1–D11 and §4 "Phase 2" = your scope),
docs/lessons/LESSON_DEVELOPMENT_GUIDE.md §3 and §14, docs/architecture/BUNDLE_BOUNDARIES.md,
docs/architecture/EXERCISE_CONTRACT.md, docs/sources/moyen/exams/EXAM_PATTERN.md §6.

Step 0 — sync the working copy: the local `dev` is behind origin/dev and holds an unfinished six-file
« remove islamic feature » diff that origin/dev already contains completed (2b1e7342). Show me `git status`
and propose how to align the working copy with origin/dev without losing anything; wait for my OK before
discarding anything.

Then do exactly Phase 2 §4.1–§4.7 of the report:
catalogue files per grade (coming_soon cards), coursesData + activeGrades for 1am/2am/3am,
DB import of all learning points (not routable, ignored by Mastery V2 until published),
cross-year links inside exercises (pattern designed once, applied to 4AM), term_exam source type,
the "publish" procedure (ask me whether publish = push to dev or to main).
Run npm test, npm run check:lessons, npm run build; PHP tests on MySQL one at a time.
Follow the documentation synchronization rule. Commit on a branch and push to dev.
End the session with docs/reports/MOYEN_ROLLOUT_PHASE2_REPORT_<date>.md and the prompt for phase 3.
Do not generate any lesson in this session.
```

### Phase 3 prompt (one session per batch; paste and set N)

```text
Phase 3 of the cycle moyen rollout — generate the next N=3 lessons of the learning-net queue.
Read first: CLAUDE.md, docs/README.md, docs/architecture/LEARNING_NET.md (§4 generation contract, §4bis order),
the latest docs/reports/MOYEN_ROLLOUT_PHASE*_REPORT_*.md (owner decisions D1–D11, the "publish" procedure),
docs/lessons/LESSON_DEVELOPMENT_GUIDE.md end to end, docs/architecture/MANIPULATION_DNA.md,
docs/sources/moyen/exams/EXAM_PATTERN.md.

Take the first N entries of docs/curriculum/generation-queue.json that are not yet published (with
`node scripts/learning-net-queue.mjs` first, so the queue is fresh). For each, in order:
1. If it is the first lesson of its unit: seed the unit (folder, _unit/, routes) and build
   docs/sources/<g>/unit<N>/extraction.json from the textbook pages in the unit's `textbook` block
   (docs/official-book-pdfs/; render pages with pdftoppm, never more than needed; the 2AM scan is the only copy —
   get the idea and move on). Pages missing from the scan (D11) are GENERATED in the book's format as declared
   platform additions.
2. Generate the lesson per guide §14 and LEARNING_NET §4 (« أستعدّ » diagnoses reviewLinksForLesson; nothing that
   noRebuildForLesson lists is rebuilt; pointPrerequisites only along net links; links to earlier years inside
   exercises). The draft الكفاءات in lessons_<g>_*.json may be refined, never silently dropped — list changes for me.
3. Build its practice bank (5 levels × 10) from docs/sources/moyen/exams/exams-index.json and exercises generated
   « على منوال » the term exams, with oracles and provenance badges.
4. Run the gates (npm test, npm run check:lessons, npm run build), check it in the browser (RTL, 320 px),
   then PUBLISH it with the documented procedure and tell me its URL before starting the next lesson.
5. If it completes its unit, generate and publish the unit's synthesis « أدمج تعلّماتي » (unit-1 9-module format).
End with a short progress report appended to docs/reports/MOYEN_ROLLOUT_PROGRESS.md and the same prompt for the
next batch.
```

## Documentation sync (phase 1)

- **New:** `docs/sources/{1am,2am,3am}/textbook-map.json`, `docs/sources/moyen/exams/{exams-index.json,EXAM_PATTERN.md}`,
  `docs/curriculum/GENERATION_QUEUE.md` and `generation-queue.json` (generated), this report.
- **Updated:**
  - `docs/architecture/LEARNING_NET.md`: §2 counts, §2.4 textbook-based planned lessons, new §4bis generation order,
    §5–§8 gates, decisions, open items.
  - `docs/README.md`: rows for the textbook maps, the exam corpus and this report.
  - Regenerated: `LEARNING_NET_MAP.md` and `learning-net-map.html`.
