# Generation plan — 2AM « ميدان الأنشطة العددية », مقطع 2am.m1 (units 1–2, 2026-10-28)

**Status:** 10 plans written and cross-reviewed (Opus planners, 2026-10-28); pair 1 (`silsila-bidun-aqwas`, `kasr-hasil-qisma`) published on `dev` 2026-10-29; pair 2 (`silsila-bi-aqwas`, `jam-tarh-kusur`) published on `dev` 2026-10-29; pair 3 (`wasf-silsila-hisab`, `jida-kasrayn`) and pair 4 (`tawzi-darb-jam-tarh`, `muqarana-kasrayn`) and pair 5 (the two syntheses) published on `dev` 2026-10-29 — **all ten entries done** (closing summary in `docs/reports/MOYEN_ROLLOUT_PROGRESS.md`). **Authority:** this index gives the order,
the lanes, the generator prompt and the « successor connection » step. Each entry's design is its plan file. The contracts stay
authoritative for HOW (`LESSON_DEVELOPMENT_GUIDE.md` §14, `LEARNING_NET.md` §4, `MANIPULATION_DNA.md`, `EXERCISE_CONTRACT.md`).
Method: the same as `PLAN_3AM_UNITS_1_5.md`.

The owner asked for the 10 remaining entries of 2AM مقطع `2am.m1`
« العمليات على الأعداد الطبيعية والأعداد العشرية – العمليات على الكسور » (8 lessons + 2 syntheses), generated along the net and
connected to 3AM and 4AM. **Connection = back links only** (owner, 2026-10-28): no new forward UI. Once a 2AM lesson is published,
its published successors in 3AM gain the LP edges and live « تذكّر » links toward it (`LEARNING_NET.md` §4.8). 4AM is reached through
those 3AM lessons, because no `2am.m1` item links directly into 4AM.

## Order and lanes

| Pair | Lane A — port 5173 (unit 1 `amaliyat-tabiiya-ushriya`) | Lane B — port 5174 (unit 2 `kusur-amaliyat`) |
|---:|---|---|
| 1 | `silsila-bidun-aqwas` (seeds unit 1 + whole-unit extraction) | `kasr-hasil-qisma` |
| 2 | `silsila-bi-aqwas` | `jam-tarh-kusur` |
| 3 | `wasf-silsila-hisab` | `jida-kasrayn` |
| 4 | `tawzi-darb-jam-tarh` | `muqarana-kasrayn` |
| 5 | `wadiya-idmajiya-amaliyat-tabiiya-ushriya` | `wadiya-idmajiya-kusur-amaliyat` |

Rules of the run:
- Within a lane, entries are strictly sequential.
- A pair is published before the next one starts.
- `jam-tarh-kusur` RECALLS the comparison of fractions (`muqarana-kasrayn`, later in the book: a renvoi en avant) and never builds it.

## The plans

Plans: `docs/sources/2am/unit1/plan/` and `docs/sources/2am/unit2/plan/`, with one README per unit (boundaries, shared maths,
extraction destinations, تحدّ, corpus, owner questions). « Faithful » is the planner's honest estimate of faithful `term_exam` sheets.

| Entry | Lab (new type) — what the hand controls | Faithful |
|---|---|---:|
| `silsila-bidun-aqwas` | `tram-route` « خطّ الترامواي » — the ORDER of the operations (stamped ①②③ tickets); the passenger counter refutes a wrong plan | 7–8 |
| `silsila-bi-aqwas` | `coop-calculator` « حاسبة التعاونية » — where the brackets go in a line typed on a drawn calculator | 12–14 |
| `wasf-silsila-hisab` | `chain-cutter` « مقصّ السلسلة » — where scissors cut a chain: only the LAST operation can be cut | 1–2 |
| `tawzi-darb-jam-tarh` | `kit-packer` « ورشة الحقائب التضامنية » — k identical kits filled by two dispensers (k×a and k×b) | 6–10 |
| `wadiya-idmajiya-amaliyat-tabiiya-ushriya` | synthesis, 6 training situations | 2–4 |
| `kasr-hasil-qisma` | `mooring-lines` « حبال المرسى » — the candidate quotient at rank 1 / 0,1 / 0,01; متقدم changes the tape unit (×10ⁿ) | 8–10 |
| `jam-tarh-kusur` | `trail-odometer` « عدّاد المسلك » — the distance walked, counted in small posts (a red post = k white) | 8–10 |
| `jida-kasrayn` | `window-blinds` « ستائر النافذة » — curtain width a/b and blind height c/d; the product is the overlap | 8–10 |
| `muqarana-kasrayn` | `level-laser` « ليزر المستوى » — a laser height read on two differently graduated tubes | 6–8 |
| `wadiya-idmajiya-kusur-amaliyat` | synthesis, 6 training situations | 5–7 |

Shared maths (imported by path): `packages/core/arithmetic/chainOps.js` (unit 1, new — `relativeOps.evaluate` has no [ ], no fraction
bar and no student-chosen order) and `packages/core/arithmetic/fractions2.js` (unit 2, new, on top of `fractions3.js`).

**Cross-review (coordinator, 2026-10-28).** The 8 lab names, themes and `MISC-*` prefixes are free. The labs differ in gesture
(stamp, type, cut, dial, lay, walk, slide, aim) and in world. `kasr-hasil-qisma` owns r05, and its draft الكفاءات were reworded so they
do not rebuild 1AM `hasil-qisma-kasr` / `ikhtizal-kitaba-kasriya`. The net link `2am.m1.r08 → r09` runs against the book order (sum
p. 24, comparison p. 25). It is a LISTED renvoi en avant (the net test accepts it), so `jam-tarh-kusur` recalls the comparison and never
builds it. Flipping the link is an owner question.

Owner questions are consolidated in each unit README. Until the owner decides, each one takes the default stated there.

## Successor connection (after each publish, coordinator)

For each published successor named in the plan's « Successor connection » section:
1. **LP edges:** add `pointPrerequisites` P<n> ← `2am_<code>_P<m>`, only along a net link, with a history line in its
   `lesson.config.js` header.
2. **Live link:** its « تذكّر — السنة الثانية » becomes a link to the new lesson; the « راجع » panels light up by themselves.

Successors in the net:

| 2AM lesson | Published successors |
|---|---|
| `silsila-*`, `wasf-silsila-hisab` | `quwat-adad-nisbi` (3AM) |
| `tawzi-darb-jam-tarh` | `tabsit-hadhf-aqwas` (3AM) |
| `jam-tarh-kusur` | `jam-tarh-kasrayn` (3AM) |
| `jida-kasrayn` | `maqlub-qismat-kasrayn` (3AM) |
| `muqarana-kasrayn` | `tasawi-muqaranat-kasrayn` (3AM) |
| `kasr-hasil-qisma` | inside 2AM: `qisma-iqlidiya-hasr` (its r05 « تذكّر ») |

## The generator prompt (Sonnet 5.5 lead, one per entry)

Replace `<CODE>`, `<UNIT_DIR>` (unit1 / unit2), `<UNIT>` (amaliyat-tabiiya-ushriya / kusur-amaliyat), `<PORT>` and `<OTHER>`.

```
You are the lead generator for ONE 2AM lesson of the cycle moyen rollout (phase 3, 2AM مقطع 2am.m1).
Repo /home/abdennour/Projects/smarter-academy/smarter-academy-dz, branch dev.

Your lesson: <CODE>. Its PLAN is docs/sources/2am/<UNIT_DIR>/plan/<CODE>.md and the unit's plan README is
docs/sources/2am/<UNIT_DIR>/plan/README.md. Execute the plan. Do not redesign it: the entry point, the lab, the modules, the
numbers and the bank sources are decided. If something in the plan is wrong (a miscomputed answer, a lab name already taken, a
contract it breaks), fix it minimally, record the fix in the plan file under a final « Generator notes » section and in your report.

Read first: CLAUDE.md, docs/README.md, docs/architecture/LEARNING_NET.md (§3bis, §4), docs/lessons/LESSON_DEVELOPMENT_GUIDE.md
(§3 « How a lesson is mounted », §4ter–§4quinquies, §6ter, §11 « Publish a lesson », §14 and the « patterns to reuse » notes),
docs/architecture/BUNDLE_BOUNDARIES.md §4 (rules 3, 4, 9, 10), docs/architecture/MANIPULATION_DNA.md (§17),
MANIPULATION_CONTRACT.md (§8ter, §8quater), docs/architecture/EXERCISE_CONTRACT.md (« Term-exam provenance », « Earlier-year
review link »), docs/sources/moyen/exams/EXAM_PATTERN.md §6, docs/reports/LAB_PROTOTYPE_ROLLOUT.md. Model lessons: the published
2AM lesson apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/kusur-amaliyat/qisma-iqlidiya-hasr/ and the published 3AM lessons
under apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/ (e.g. kusur-natiqa/jam-tarh-kasrayn).

Do, in order:
1. If the plan says this entry seeds the unit: seed lessons/moyen/2am/ansab_al_aadad_wal_hisab/<UNIT>/_unit/ (copy the shape of
   kusur-amaliyat/_unit/) and build docs/sources/2am/<UNIT_DIR>/extraction.json (+ build-extraction.py) for the WHOLE unit, with
   the destinations listed in the plans. Otherwise move this lesson's « pending » destinations in the unit's build-extraction.py.
2. Generate the lesson INTO its catalogue entry (same code, same programmeItems), in a folder named exactly like the code: the
   modules (each with `objectives`), the lab (new type, core maths imported BY PATH, strings in
   i18n/locales/ar/lesson.manipulation.json, LabCoach on, KidFigure — girls always in hijab —, no title, context then ONE question,
   the full lab prototype: questions over the lab after each step, stepper, success celebration, sounds off by default with a
   « الصوت » switch, « إعادة », full screen, memo end card with « اختبر ذاكرتك »), knowledge map, « أستعدّ » from the net (every
   review item measured), the الكفاءات wording of the plan (order kept), `pointPrerequisites` as the plan says. No student-visible
   line points to the textbook. Respect Islam in every string, icon and emoji (no pig, alcohol, gambling, dice as a game,
   interest). Never touch App.jsx: run `npm run generate:lesson-index`.
3. Build the practice bank (5 levels × 10) from the plan's bank section; oracles for every constructed answer; add it to
   active.json and exam-style.json. `term_exam` only for exercises you actually read in the corpus; otherwise
   `term_exam_modelled` / `adapted` / `platform_addition`.
4. Gates: the lab's logic + render tests, content.test.js (independent arithmetic), the unit's prepDiagnostic test,
   `node apps/web/scripts/lab-rollout-status.mjs --lesson <CODE>` prints ✅, `npm test`, `npm run check:lessons` (entry budget
   212 KB gzip — never raise it; no eager module imports catalogue names), `NODE_OPTIONS=--max-old-space-size=8192 npm run build`;
   browser check of every module on port <PORT> at 768×1024, 1024×768, 1280×800 and 1366×768 (tablet and laptop only, no phone);
   lab screenshots of the initial and mid-activity states at those sizes, reviewed with your eyes and iterated; a lesson-kit e2e
   apps/web/e2e/lesson-kit/2am-<UNIT>-<CODE>.mjs; node apps/web/e2e/lesson-route-boundary.mjs.
5. Set the catalogue status to `available` and durationMinutes (guide §11 convention), regenerate the lesson index and
   `npm run generate:learning-net`.
6. Documentation sync: the lab's § in MANIPULATION_CONTRACT.md; patterns reusable by later lessons go into the guide's « patterns
   to reuse » notes and the contracts.

Coordination: another lead generates <OTHER> in the same tree on another port. Use only port <PORT>; never touch port 4173;
the local API runs on 127.0.0.1:8000 (do not start or stop it). Do NOT commit, push, stash, reset, checkout or clean, and do NOT
run the DB export/import: the coordinator does it. Do NOT edit the published 3AM successor lessons (the coordinator applies the
« Successor connection »). Edit shared JSON files with small targeted edits after a fresh read. At most two helper sub-agents at
a time (memory ~13 GB); close your browser and dev server when done.

Learned in pair 1 (2026-10-29): reuse what is already committed — unit 1 `_unit/` and `packages/core/arithmetic/chainOps.js`, unit 2
`packages/core/arithmetic/fractions2.js` (extend them, never fork them). Run the FULL `npm test` at most once, at the end, alone (the
machine overloads with two leads; a single timeout under load that passes alone is a load flake — say so). The student-phone check of
lesson-route-boundary.mjs (390×844 on a 4AM lesson) is stale since the 2026-10-27 large-screen enforcement: report it, do not chase
it. Name scratchpad logs and screenshots with your <CODE> (the scratchpad is shared). Knowledge item titles carry no `$`; memo
`rule` / examples / chips are pure KaTeX (no Arabic `\text{}`); a « true » distractor (a correct inequality offered as wrong) is a bug.

Learned in pair 2 (2026-10-29): a modelled sheet is stored `type: platform_addition` + `reason: term_exam_modelled` + `modelledOn`
(EXERCISE_CONTRACT « Term-exam provenance ») — report it as modelled; never cite one paper's same part as `term_exam` on two sheets.
VIEW every screenshot you save (all four sizes of the glance, every module), not a sample. The lab must fit one screen at 1024×768 in
BOTH levels, the متقدم typing phase included (measure its height). Money in Arabic strings is wrapped in an LTR isolate (« 48,75 DA »);
in KaTeX use `\mathrm{DA}`.

Learned in pair 3 (2026-10-29): the Islam-respect rule covers the BANK sheets too — renaming a context in a module (« الساحر » → a riddle)
means grepping `content/practice/2am/<code>/` for the same word. A lab column at 1024×768 is only ~414 px wide beside the sidebar: design
the pockets / cards as one compact line each and measure the worst phase (banner + « next » shown).

Final report: URL path; modules; the lab and the screenshots you reviewed; bank counts (term_exam / modelled / adapted /
platform_addition); every الكفاءات change; gates with results; the full list of files created or changed; docs updated; fixes to
the plan; open points for the owner.
```

## Coordinator steps after each pair

1. Read both reports and look at the lab screenshots.
2. Run the gates on the tree: `rm -rf apps/web/dist`, `npm test`, `npm run check:lessons`, `npm run build`,
   `node scripts/learning-net-queue.mjs --check`, `npx vitest run curriculum/dz/net` (in `packages/core`), and grep for forbidden
   emoji.
3. Commit one commit per lesson, `feat(lessons): <code>`; then `git push origin dev`.
4. Local DB: export/import the curriculum and the content registry; set the lesson's modules and its 50 exercises to `published`.
5. Apply the successor connection, gate it, and commit it as `feat(lessons): connect <3AM lesson> to <2AM lesson>`.
6. Append the entry to `docs/reports/MOYEN_ROLLOUT_PROGRESS.md`.
