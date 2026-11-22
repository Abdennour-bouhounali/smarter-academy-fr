# Generation plan — 2AM « ميدان الأنشطة العددية », مقطع 2am.m4 (units 3–4, 2026-10-29)

**Status:** all 10 plans written and cross-checked (2026-10-29; labs `corniche-ruler`, `balloon-ballast`, `tug-rope`, `dig-grid`,
`gap-caliper` in unit 3, `wax-cells`, `juice-line`, `bridge-load` in unit 4 — names free, gestures distinct); pair 1 in progress. **Authority:** this index gives the order, the lanes, the generator prompt and
the « successor connection » step. Each entry's design is its plan file. The contracts stay authoritative for HOW
(`LESSON_DEVELOPMENT_GUIDE.md` §14, `LEARNING_NET.md` §4, `MANIPULATION_DNA.md`, `EXERCISE_CONTRACT.md`). Method: the same as
`PLAN_2AM_M1.md`, the run that closed مقطع 2am.m1 (units 1–2).

The owner asked to continue with the 2AM « ميدان الأنشطة العددية ». After مقطع 2am.m1, the remaining مقطع is 2am.m4 « الأعداد النسبية »,
with 10 `coming_soon` entries:
- unit 3 `adad-nisbiya-2`: 5 lessons + the synthesis (`muqarana-nisbiya` was published earlier);
- unit 4 `mafhum-muadala`: 3 lessons + the synthesis.

**Connection = back links only** (owner, 2026-10-28). Unlike m1, three items of this مقطع (r03 already published, r04, r07) link
DIRECTLY into 4AM. **Finding (2026-10-29, pair 3): the 4AM LP edges are NOT written** — `curriculum/dz/decomposition.test.js ›
« ne déclare que des prérequis pédagogiques qui existent »` requires every 4AM الكفاءة prerequisite to be a 4AM الكفاءة (the 4AM
decomposition is closed on itself), so `4am_murakkibata-shuaa_P2/P3` ← `2am_talim-nuqta-mustawi_P2/P3` and `4am_muntasaf-masafa_P1` ←
`2am_talim-nuqta-mustawi_P2` fail the gate. Writing them means an owner decision to open that guard to earlier-year LP ids (the edges are
ready as a patch); until then the 4AM lessons reach 2AM at item and lesson level (« راجع » panel, `prerequisiteLessonCodes`).

## Order and lanes

| Pair | Lane A — port 5173 | Lane B — port 5174 |
|---:|---|---|
| 1 | `talim-mustaqim-mudarraj-2` (r01) | `ibara-harfiya-intaj` (no item; seeds unit 4 `_unit/` + whole-unit extraction) |
| 2 | `jam-tarh-nisbiya` (r05) | `hall-mushkil-muadala` (r08) |
| 3 | `majmu-jabri` (r06) | `talim-nuqta-mustawi` (r04, unit 3; only needs r01) |
| 4 | `masafa-nuqtatayn` (r07) | `ikhtibar-musawat-mutabayina` (r09; needs r06, published in pair 3) |
| 5 | `wadiya-idmajiya-adad-nisbiya-2` | `wadiya-idmajiya-mafhum-muadala` |

Rules of the run:
- Within a lane, entries are strictly sequential.
- A pair is published before the next one starts.
- The book order of unit 4 (ibara → ikhtibar → hall) is changed because of the net link `2am.m4.r06 → r09`. The catalogue order, which is
  what the student sees, is unchanged.

## The plans

Plans: `docs/sources/2am/unit3/plan/` and `docs/sources/2am/unit4/plan/`, with one README per unit (boundaries, shared maths, extraction
destinations, تحدّ, corpus, owner questions with defaults). Unit 3 reuses its existing extraction (`docs/sources/2am/unit3/extraction.json`,
98 elements, built for `muqarana-nisbiya`). Unit 4's extraction is built whole by `ibara-harfiya-intaj`.

## Successor connection (after each publish, coordinator)

For each published successor named in the plan's « Successor connection » section:
1. **LP edges:** add `pointPrerequisites` P<n> ← `2am_<code>_P<m>`, only along a net link, with a history line in its `lesson.config.js`
   header.
2. **Live link:** its « تذكّر — السنة الثانية » becomes a link to the new lesson; the « راجع » panels light up by themselves.

| 2AM lesson | Net link | Published successors |
|---|---|---|
| `talim-mustaqim-mudarraj-2` | r01 → r02 | inside 2AM: `muqarana-nisbiya` |
| `jam-tarh-nisbiya` | r05 → 3am.m1.r01 | `jidaa-adadayn-nisbiyayn`, `jidaa-ida-nisbiya` (3AM) |
| `majmu-jabri` | r06 → r09 | inside 2AM: `ikhtibar-musawat-mutabayina` (generated later; edge written by its lead) |
| `talim-nuqta-mustawi` | r04 → 3am.m7.r01, 4am.m4.r04, 4am.m4.r06 | `tanasub-tamthil-bayani` (3AM); `murakkibata-shuaa`, `muntasaf-masafa` (4AM) |
| `masafa-nuqtatayn` | r07 → 4am.m4.r05 | `hisab-murakkibatay`, `ithbat-khawas-maalam` (4AM) |
| `ikhtibar-musawat-mutabayina` | r09 → 3am.m5.r05 | `musawiyat-amaliyat`, `mutabayinat-amaliyat` (3AM) |
| `hall-mushkil-muadala` | r08 → 3am.m5.r06 (`extends`) | `muadalat-darajat-ula` (3AM) |
| `ibara-harfiya-intaj`, the syntheses | — | none |

## The generator prompt (lead, one per entry)

This is the `PLAN_2AM_M1.md` prompt with the m4 names filled in. Replace `<CODE>`, `<UNIT_DIR>` (unit3 / unit4), `<UNIT>`
(adad-nisbiya-2 / mafhum-muadala), `<PORT>` and `<OTHER>`.

```
You are the lead generator for ONE 2AM lesson of the cycle moyen rollout (phase 3, 2AM مقطع 2am.m4).
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
2AM lessons apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/adad-nisbiya-2/muqarana-nisbiya/ and
.../kusur-amaliyat/jida-kasrayn/, and the 2AM syntheses .../wadiya-idmajiya-*/ for a synthesis entry.

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
   `platform_addition` + `reason: term_exam_modelled` + `modelledOn` / `adapted` / `platform_addition`.
4. Gates: the lab's logic + render tests, content.test.js (independent arithmetic), the unit's prepDiagnostic test,
   `node apps/web/scripts/lab-rollout-status.mjs --lesson <CODE>` prints ✅, `npm test`, `npm run check:lessons` (entry budget
   212 KB gzip — never raise it; no eager module imports catalogue names), `NODE_OPTIONS=--max-old-space-size=8192 npm run build`;
   browser check of every module on port <PORT> at 768×1024, 1024×768, 1280×800 and 1366×768 (tablet and laptop only, no phone);
   lab screenshots of the initial and mid-activity states at those sizes, reviewed with your eyes and iterated; a lesson-kit e2e
   apps/web/e2e/lesson-kit/2am-<UNIT>-<CODE>.mjs.
5. Set the catalogue status to `available` and durationMinutes (guide §11 convention), regenerate the lesson index and
   `npm run generate:learning-net`.
6. Documentation sync: the lab's § in MANIPULATION_CONTRACT.md; patterns reusable by later lessons go into the guide's « patterns
   to reuse » notes and the contracts.

Coordination: another lead generates <OTHER> in the same tree on another port. Use only port <PORT>; never touch port 4173;
the local API runs on 127.0.0.1:8000 (do not start or stop it). Do NOT commit, push, stash, reset, checkout or clean, and do NOT
run the DB export/import: the coordinator does it. Do NOT edit published lessons other than yours (the coordinator applies the
« Successor connection »). Edit shared JSON files with small targeted edits after a fresh read. At most two helper sub-agents at
a time (memory ~13 GB); close your browser and dev server when done.

Learned in the m1 run (2026-10-29):
- Reuse what is committed: unit 3 `_unit/` and the relative-number core (`packages/core/arithmetic/relative.js`, `relativeOps.js`
  — extend, never fork).
- Run the FULL `npm test` at most once, at the end, alone; a single timeout under load that passes alone is a load flake — say so.
- The student-phone check of e2e/lesson-route-boundary.mjs is stale since the 2026-10-27 large-screen enforcement: do not chase it.
- Name scratchpad logs and screenshots with your <CODE>. Knowledge item titles carry no `$`; memo `rule` / examples / chips are pure
  KaTeX (no Arabic `\text{}`); a « true » distractor is a bug.
- Never cite one paper's same part as `term_exam` on two sheets. VIEW every screenshot you save, not a sample.
- The lab fits one screen at 1024×768 in BOTH levels, the متقدم typing phase included (measure it). A lab column at 1024×768 is
  ~414 px wide beside the sidebar: one compact line per pocket / card; measure the worst phase (banner + « next » shown).
- Money in Arabic strings sits in an LTR isolate (« 48,75 DA »); in KaTeX `\mathrm{DA}`. Negative numbers in Arabic strings too:
  wrap « −5 » in an LTR isolate so the minus sign stays on the left.
- The Islam-respect rule covers the BANK sheets: after renaming a context, grep `content/practice/2am/<code>/` for the old word.
- An older lab-kit e2e script can stall on a lab question overlay; write yours against the current prototype.

Learned in pair 1 (2026-10-29):
- Bidi: in an Arabic sentence every « value + Latin unit » (`10 m`, `20 m`, `3 kg`) is ONE LTR run — in plain strings wrap it in an LTR
  isolate (U+2066 … U+2069), in KaTeX write `$10\,\mathrm{m}$` (never `$10$ m`), in JSX put the unit INSIDE the `<bdi dir="ltr">`. Parenthesis
  chips need `dir="ltr"`. Re-grep `[0-9}$] m\b` in every new lab, module and bank sheet.
- `npm run check:lessons` must exit 0 BEFORE you report: it includes `node scripts/audit-predict-prompts.mjs --strict` — every memo rule whose
  brick is not a « rappel » needs a `predictPrompt` (a question asked BEFORE the rule is shown); run the script alone while you build.
- VIEW every screenshot you save, all four sizes, every module; a pill or label whose text touches its border is a defect.
- A memo-card rule clipped on the left means it is too long: shorten it, then re-capture the card.
- Two leads share `lessonIndex.generated.json`, `content/practice/*.json`, the registries and the i18n file: edit them with small targeted
  edits after a fresh read; never regenerate over the other lead's lines.
- `lessonProblem.table` must be the مسألة 1 table and every مسألة needs a drawn support; checkpoint options never keep the correct one first.

Learned in pair 2 (2026-10-29):
- Every الكفاءة (`pointsToLearn`, the lesson config `skills`) is at most 255 characters: `learning_points.title` is a VARCHAR(255) and a longer
  one crashes `smarter:import-curriculum` (`hall-mushkil-muadala` P3 was 292). `learningPoints.test.js` guards it; aim at ≤ 200.
- Signed numbers and « value + unit » in Arabic sentences are LTR runs (rule above). When a screenshot looks mirrored, measure it before
  reporting: character x-positions (Range rects) or a 4× crop — a number is « −10 » when the minus is to the LEFT of the digits.
- A lab typing slate drops the 0–9 chips to fit one screen only with `inputMode="decimal"`; the lab glance is asserted ≤ 700 px at 1024×768
  in BOTH levels by the lesson's e2e (`[data-…-glance]`).
- A lead who reports « I did not view / re-run X » has not finished: view every capture, re-run the e2e and `check:lessons` after the LAST edit.
Learned in pair 3 (2026-10-29):
- Whenever you touch `knowledge.jsx` / `knowledgeGraph.js` (memo cards, items, nodes), run `cd apps/web && npx vitest run src/lessons/common/knowledge`:
  it holds `lessonGraphs.test.js` (every item on exactly ONE notebook node; chain order = module order; no false numeric equality in a
  « wrong » text; no overlap or arrow through a node at 328/400/720/1100 px). Your lesson-folder tests do not run it.
- Memo cards: a `rule` ≤ ~20–28 characters of KaTeX and an `example` ≤ ~40; a longer formula is clipped on the left or overprints the
  example. Your e2e asserts that no `.katex` inside a `[data-memo-card]` leaves its card or overlaps another formula.
- The local API (`php artisan serve` on 127.0.0.1:8000, in `apps/api`) must be up for the lesson-kit e2e; if it is down, ask the coordinator.
- 4AM lessons cannot take a 2AM/3AM LP as `pointPrerequisites` (`decomposition.test.js`): only the item / lesson level links reach 4AM.
Learned in pair 4 (2026-10-30):
- In a JSX ATTRIBUTE string (`prompt="…"`, `title="…"`) a backslash is literal: write `\frac`, never `\\frac` (a doubled one shows
  « frac23 » to the student; `check:katex` does not see it). Inside a JS string `'…'` / template literal the doubled form is right.
- A duplicated formula in a knowledge item title next to its `chip` (`title: '… AB = BA'` + `chip: AB=BA`) prints twice: titles carry words only.
- Old lesson-kit e2e scripts of 3AM lessons may time out in their lab drive (`[data-lt-next]`): they predate the lab prototype; judge them by
  their module-mount checks (no ✗) and say so.
- A synthesis (pair 5) has NO lab: 00 أستعدّ · 01–06 « الوضعية التدريبية » · 07 analysis of the final situation (the only `ContentModule`, with
  `objectives`) · 08 final test; copy the published 3AM / 2AM syntheses (`wadiya-idmajiya-kusur-amaliyat` is the nearest), one الكفاءة with
  `pointPrerequisites` P1 ← the unit's lessons.
- Two leads in the SAME unit (pair 3 is unit 3 twice) edit `docs/sources/2am/unit3/build-extraction.py` / `extraction.json` and
  `relative.js`: small targeted edits after a fresh read, never a regeneration of the whole file.

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
5. Apply the successor connection, gate it, and commit it as `feat(lessons): connect <successor> to <code>`.
6. Append the entry to `docs/reports/MOYEN_ROLLOUT_PROGRESS.md`.
