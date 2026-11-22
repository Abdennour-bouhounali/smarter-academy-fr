# Generation plan — 3AM units 1–5 (owner priority, 2026-10-25)

**Status:** 20 plans written and cross-reviewed (2026-10-25); generation not started. **Authority:** this index gives the order, the lanes and the generator prompt;
each lesson's design is its plan file. The contracts stay authoritative for HOW (`LESSON_DEVELOPMENT_GUIDE.md` §14,
`LEARNING_NET.md` §4, `MANIPULATION_DNA.md`, `EXERCISE_CONTRACT.md`). Queue: `GENERATION_QUEUE.md` « Phase 0 » (`LEARNING_NET.md` §4bis).

The owner put the remaining lessons of five 3AM units first: الأعداد النسبية, العمليات على الكسور والأعداد الناطقة,
القوى ذات أسس نسبية صحيحة, الحساب الحرفي, المساويات - المتباينات - المعادلات. There are 20 entries: 15 lessons and 5 syntheses
« أدمج تعلّماتي ». Every entry has a PLAN written before generation (Opus, 2026-10-25). Sonnet 5.5 leads generate the lessons one at a
time from that plan, without redesigning them.

## Order and lanes

Two lanes run in parallel in the same tree, one dev-server port each. The local API's CORS allows 5173, 5174 and 4173. Port 4173 is
often taken by another project of the owner, so do not use it. Within a lane, entries are strictly sequential: each lesson is
published before the next one starts.

Pairs run at the same time, one entry per lane. A pair is published before the next one starts. The pairing respects the
cross-unit dependencies:
- `adad-natiq` comes after `qismat-nisbiyayn`, because the sign of a rational is taught in unit 1;
- `muqaranat-natiqayn` comes after `tasawi-muqaranat-kasrayn` and `amaliyat-natiqa`;
- the unit-3 net fix (owner question 1) must land before pair 7.

| Pair | Lane A — port 5173 | Lane B — port 5174 |
|---:|---|---|
| 1 | #1 `jidaa-adadayn-nisbiyayn` (seeds unit 1) | #5 `maqlub-qismat-kasrayn` (seeds unit 2) |
| 2 | #2 `jidaa-ida-nisbiya` | #6 `tasawi-muqaranat-kasrayn` |
| 3 | #3 `qismat-nisbiyayn` | #7 `jam-tarh-kasrayn` |
| 4 | #4 `wadiya-idmajiya-aadad-nisbiya` | #8 `adad-natiq` |
| 5 | #15 `qimat-ibara-harfiya` | #9 `amaliyat-natiqa` |
| 6 | #16 `muqaranat-natiqayn` | #10 `wadiya-idmajiya-kusur-natiqa` |
| 7 | #17 `wadiya-idmajiya-ibarat-harfiya-3` | #11 `quwa-adad-ashara` |
| 8 | #18 `mutabayinat-amaliyat` | #12 `qawaid-quwa-ashara` |
| 9 | #19 `hasr-adad-ushri` | #13 `kitaba-ilmiya-rutba` |
| 10 | #20 `wadiya-idmajiya-musawiyat-mutabayinat` | #14 `wadiya-idmajiya-quwa-nisbiya` |

## The 20 plans

« Faithful » is the planner's honest estimate of the faithful `term_exam` sheets; the rest of the 50 are modelled, adapted or
platform additions. The `<UNIT_DIR>` of the prompt is the folder in the first column.

| # | Plan | Lab (new type) — what the hand controls | Faithful |
|---:|---|---|---:|
| 1 | [unit1/plan/jidaa-adadayn-nisbiyayn.md](../sources/3am/unit1/plan/jidaa-adadayn-nisbiyayn.md) | `elevator-reel` « شريط المصعد » — the signed time t on a camera replay (floor = r × t); rewinding a descending lift raises it; module 2: `sign-machine` « آلة الجداءات » (2026-10-27) — the hand lowers the second factor, the lit table keeps its step across 0 | 3–4 |
| 2 | [unit1/plan/jidaa-ida-nisbiya.md](../sources/3am/unit1/plan/jidaa-ida-nisbiya.md) | `robot-track` « مسار الروبوت » — the sign of each factor card; each negative card jumps the robot over zero | 7–8 |
| 3 | [unit1/plan/qismat-nisbiyayn.md](../sources/3am/unit1/plan/qismat-nisbiyayn.md) | `code-lockers` « خزائن الأمانات » — the missing factor q on code wheels to open « b × ? = a » | 9 |
| 4 | [unit1/plan/wadiya-idmajiya-aadad-nisbiya.md](../sources/3am/unit1/plan/wadiya-idmajiya-aadad-nisbiya.md) | synthesis, 6 training situations | 0–2 |
| 5 | [unit2/plan/maqlub-qismat-kasrayn.md](../sources/3am/unit2/plan/maqlub-qismat-kasrayn.md) | `gear-crank` « دوّاسة الدرّاجة » — pedal turns, one tooth = 1/F | 6–8 |
| 6 | [unit2/plan/tasawi-muqaranat-kasrayn.md](../sources/3am/unit2/plan/tasawi-muqaranat-kasrayn.md) | `shade-match` « آلة مزج الألوان » — the numerator c: blue shots into d white, judged by a colour meter | 4–5 |
| 7 | [unit2/plan/jam-tarh-kasrayn.md](../sources/3am/unit2/plan/jam-tarh-kasrayn.md) | `seed-rake` « مشط الشتلات » — the common unit 1/N; the widest spacing that works is the smallest common multiple | 10–13 |
| 8 | [unit2/plan/adad-natiq.md](../sources/3am/unit2/plan/adad-natiq.md) | `number-line-pegs` « حبل الأعداد » — where a card a/b is hung; equal writings stack on one peg | 1–2 |
| 9 | [unit2/plan/amaliyat-natiqa.md](../sources/3am/unit2/plan/amaliyat-natiqa.md) | `merge-board` « لوحة الدمج » — the predicted sign, the tile to flip for ÷, the merge order | 13–16 |
| 10 | [unit2/plan/wadiya-idmajiya-kusur-natiqa.md](../sources/3am/unit2/plan/wadiya-idmajiya-kusur-natiqa.md) | synthesis, 6 training situations | 5–8 |
| 11 | [unit3/plan/quwa-adad-ashara.md](../sources/3am/unit3/plan/quwa-adad-ashara.md) | `ten-zoom` « عدسة القوى » — the exponent n of a frame whose side is 10ⁿ m (zoom ring) | ~2 |
| 12 | [unit3/plan/qawaid-quwa-ashara.md](../sources/3am/unit3/plan/qawaid-quwa-ashara.md) | `unit-ladder` « مسطرة التحويل » — a band stretched between two unit plaques, counted in columns | ~4 |
| 13 | [unit3/plan/kitaba-ilmiya-rutba.md](../sources/3am/unit3/plan/kitaba-ilmiya-rutba.md) | `size-ladder` « سلّم الأحجام » — where a card hangs on a decade ladder, then a rounding magnet | ~13 |
| 14 | [unit3/plan/wadiya-idmajiya-quwa-nisbiya.md](../sources/3am/unit3/plan/wadiya-idmajiya-quwa-nisbiya.md) | synthesis, 6 situations + « رقاقة الذهب » | ~6 |
| 15 | [unit4/plan/qimat-ibara-harfiya.md](../sources/3am/unit4/plan/qimat-ibara-harfiya.md) | `marble-run` « مسار الكريات » — the value of the letter, then the written substituted line (brackets, ×) | ~12 |
| 16 | [unit4/plan/muqaranat-natiqayn.md](../sources/3am/unit4/plan/muqaranat-natiqayn.md) | `difference-meter` « مقياس الفرق » — which bead each probe takes; the needle reads a − b | 3 |
| 17 | [unit4/plan/wadiya-idmajiya-ibarat-harfiya-3.md](../sources/3am/unit4/plan/wadiya-idmajiya-ibarat-harfiya-3.md) | synthesis, 6 training situations | ~6 |
| 18 | [unit5/plan/mutabayinat-amaliyat.md](../sources/3am/unit5/plan/mutabayinat-amaliyat.md) | `loom-threads` « خيوط النول » — where the thread of 1 (× c) or of 0 (+ c) lands; threads cross only when c < 0 | 5 |
| 19 | [unit5/plan/hasr-adad-ushri.md](../sources/3am/unit5/plan/hasr-adad-ushri.md) | `scoop-scale` « ميزان العطّار » — the mass itself on a scale whose screen rounds | 3 |
| 20 | [unit5/plan/wadiya-idmajiya-musawiyat-mutabayinat.md](../sources/3am/unit5/plan/wadiya-idmajiya-musawiyat-mutabayinat.md) | synthesis; module 7 reuses `term-ferry` | 7 |

Each unit's `plan/README.md` holds the boundaries between its lessons (written once), the shared maths module, the extraction
destinations and the discrepancies found in the scan.

Shared maths, all built on the exact rationals of `packages/core/arithmetic/powers.js` and imported by path:
- `relativeOps.js` (unit 1); unit 2 imports it;
- `fractions3.js` (unit 2); unit 4 imports it;
- `tenPowers.js` (unit 3);
- `substitution.js` and `orderSign.js` (unit 4);
- unit 5 extends the existing `decimals.js` and `equalities.js`.

**Cross-unit review (coordinator, 2026-10-25).** All 15 lab names are free in the registry. Each lab differs from its siblings in
gesture and drawn world. Four labs show a number line, each in a different world and with a different gesture:
- `robot-track`: flip a card;
- `number-line-pegs`: carry and hang a card;
- `difference-meter`: plug a probe;
- `loom-threads`: place a thread.

A generator must not drift two of them toward the same look. Two collisions were already removed during planning: a signed-time
replay in `adad-natiq` (`elevator-reel` has it) and a pouring gesture in `jam-tarh-kasrayn` (`scoop-scale` has it).

The boundaries agree across units:
- the sign of a rational belongs to `qismat-nisbiyayn`; `adad-natiq` only recalls it;
- comparing by the sign of a − b belongs to `muqaranat-natiqayn`; `mutabayinat-amaliyat` recalls it in a « تذكّر » box;
- `quwa-adad-ashara` and `qawaid-quwa-ashara` never rebuild what the published `quwat-adad-nisbi` teaches (a power built factor
  by factor, a quotient shown as cancellation).

## The generator prompt (Sonnet 5.5 lead, one per entry)

Replace `<CODE>`, `<UNIT_DIR>` (unit1 … unit5), `<PORT>` and `<OTHER>` (the entry the other lane is generating). Paste:

```
You are the lead generator for ONE 3AM lesson of the cycle moyen rollout (phase 3, Phase 0 « owner priority »).
Repo /home/abdennour/Projects/smarter-academy/smarter-academy-dz, branch dev.

Your lesson: <CODE>. Its PLAN is docs/sources/3am/<UNIT_DIR>/plan/<CODE>.md and the unit's plan README is
docs/sources/3am/<UNIT_DIR>/plan/README.md. Execute the plan. Do not redesign it: the entry point, the lab, the modules, the
numbers and the bank sources are decided. If something in the plan is wrong (a miscomputed answer, a lab name already taken, a
contract it breaks), fix it minimally, record the fix in the plan file under a final « Generator notes » section and in your report.

Read first: CLAUDE.md, docs/README.md, docs/architecture/LEARNING_NET.md (§3bis, §4), docs/lessons/LESSON_DEVELOPMENT_GUIDE.md
(§3 « How a lesson is mounted », §4ter–§4quinquies, §11 « Publish a lesson », §14 and the « patterns to reuse » notes),
docs/architecture/BUNDLE_BOUNDARIES.md §4 (rules 3, 4, 9, 10), docs/architecture/MANIPULATION_DNA.md (§17), MANIPULATION_CONTRACT.md
(§8ter, §8quater), docs/architecture/EXERCISE_CONTRACT.md (« Term-exam provenance », « Earlier-year review link »),
docs/sources/moyen/exams/EXAM_PATTERN.md §6. Model lessons: the published 3AM lessons under
apps/web/src/lessons/moyen/3am/ (e.g. quwat-adad-nisbi, tabsit-hadhf-aqwas, musawiyat-amaliyat).

Do, in order:
1. If the plan says this entry seeds the unit: seed lessons/moyen/3am/ansab_al_aadad_wal_hisab/<unit>/_unit/ and build
   docs/sources/3am/<UNIT_DIR>/extraction.json (+ build-extraction.py) for the WHOLE unit, with the destinations listed in the
   plans. Otherwise move this lesson's « pending » destinations in the unit's build-extraction.py.
2. Generate the lesson INTO its catalogue entry (same code, same programmeItems), in a folder named exactly like the code: the
   modules, the lab (new type, core maths imported BY PATH, strings in i18n/locales/ar/lesson.manipulation.json, LabCoach on,
   KidFigure, no title, context then ONE question), knowledge map, « أستعدّ » from the net, the الكفاءات wording of the plan (order
   kept). No student-visible line points to the textbook. Never touch App.jsx: run `npm run generate:lesson-index`.
3. Build the practice bank (5 levels × 10) from the plan's section 9; oracles for every constructed answer; add it to
   active.json and exam-style.json.
4. Gates: the lab's logic + render tests, content.test.js (independent arithmetic), the unit's prepDiagnostic test,
   `npm test`, `npm run check:lessons` (entry budget 330 KB — never raise it), `npm run build`; browser check of every module on
   port <PORT> at 768×1024, 1024×768, 1280×800 and 1366×768 (tablet and laptop only, no phone); lab screenshots of the initial and
   mid-activity states at those sizes, reviewed and iterated; a lesson-kit e2e apps/web/e2e/lesson-kit/3am-<unit>-<CODE>.mjs;
   node apps/web/e2e/lesson-route-boundary.mjs.
5. Set the catalogue status to `available` and durationMinutes (≤ 90, guide §11 convention), regenerate the lesson index.
6. Documentation sync: patterns reusable by later lessons go into the guide's « patterns to reuse » notes and the contracts.

Coordination: another lead generates <OTHER> in the same tree on another port. Use only port <PORT>; never touch port 4173;
the local API runs on 127.0.0.1:8000 (do not start or stop it). Do NOT commit, push, stash, reset, checkout or clean, and do NOT
run the DB export/import: the coordinator does it. Edit shared JSON files with small targeted edits after a fresh read. At most
two helper sub-agents at a time (memory ~13 GB); close your browser and dev server when done.

Final report: URL path; modules; the lab and the screenshots you reviewed; bank counts (term_exam / modelled / adapted /
platform_addition); every الكفاءات change; gates with results; the full list of files created or changed; docs updated; fixes to the
plan; open points for the owner.
```

## Coordinator steps after each pair of entries

1. Read both reports and look at the lab screenshots.
2. Run the full gates on the tree: `npm test`, `npm run check:lessons`, `npm run build`, `node scripts/learning-net-queue.mjs --check`.
3. Publish each lesson as guide §11 « Publish a lesson » says: one commit per lesson, then fast-forward `dev` and `git push origin dev`.
4. Run the local DB handshake (export/import curriculum, then export/import content registry). Then publish the lesson's modules and its 50 exercises locally.
5. Append the entries to `docs/reports/MOYEN_ROLLOUT_PROGRESS.md` and start the next pair.

## Owner questions (consolidated, open)

The details are in each unit README and in section 10 of each plan. Until a question is decided, the plan applies its stated
default.

1. **Net fix — BLOCKS #11.** The net has `3am.m3.r02 → 3am.m3.r03`, but r02 is taught in the NEXT lesson (`qawaid-quwa-ashara`).
   So the « أستعدّ » of `quwa-adad-ashara` would test a rule that has not been taught yet. Proposed: replace it with
   `r01 → r03` and add `r02 → r04`. Also add `qawaid-quwa-ashara` to the `prerequisiteLessonCodes` of `kitaba-ilmiya-rutba`.
2. **Missing `requires` links proposed by the planners.** Default: « أستعدّ » measures these items, but no cross-lesson الكفاءة edge
   is written along them.
   - unit 1: `2am.m1.r03` → r01; `2am.m1.r01` and `2am.m4.r06` → r02;
   - unit 2: `3am.m1.r05 → 3am.m1.r06`;
   - unit 4: `3am.m3.r06` and `2am.m4.r09` → r03; `3am.m1.r06`, `2am.m4.r02` and `3am.m5.r01` → r04;
   - unit 5: `3am.m5.r04 → 3am.m5.r05`; `2am.m1.r05` and `2am.m1.r06` → `3am.m5.x1` (consolidates). Without the last two,
     `hasr-adad-ushri` re-teaches 2AM items.
3. **Two lessons on one programme item** (`jidaa-ida-nisbiya` → `jidaa-adadayn-nisbiyayn`; `mutabayinat-amaliyat` →
   `musawiyat-amaliyat`). May a cross-lesson `pointPrerequisites` edge be written when no net link is crossed? Default: yes.
4. **The syntheses have `programmeItems: []`** and no الكفاءات in the catalogue. These are the first 1AM–3AM syntheses. Each plan
   proposes one or two الكفاءات. Default fallback if validation refuses an empty list: give the synthesis its unit's items.
5. **Unit تحدّ texts are verbatim copies of the textbook** in `units_3am_2026_2027.json` (book-independence rule). Default: each
   unit's first generator rewrites the text with its own numbers and points `challenge.sourceElementId` where the plan says.
   For unit 3, the plan proposes the synthesis situation « رقاقة الذهب ». For unit 4, an own-numbers version.
6. **Few faithful exam exercises.** Several lessons have few faithful exercises: `adad-natiq` (1–2), `quwa-adad-ashara` (~2),
   `jidaa-adadayn-nisbiyayn` (3–4), `muqaranat-natiqayn` (3), `hasr-adad-ushri` (3). May 2AM papers be used for 3AM banks when
   the exercise matches? Default: no; the rest of the 50 sheets are `term_exam_modelled` / adapted.
7. **Scope decisions to confirm:**
   - `muqaranat-natiqayn` P3 is limited to differences whose sign can be read directly;
   - `mutabayinat-amaliyat` keeps « استنتج متباينة طرفها الأول x » without « حلّ », without a solution set and without a number line
     (4AM owns inequations);
   - `adad-natiq` only recalls the sign of a quotient;
   - the 4AM notation A(−3) is never used — the lessons write « قيمة A من أجل x = … ».
8. **Changed wordings.** Some draft الكفاءات change meaning (positions kept) so that they do not repeat 2AM or a sibling lesson:
   `tasawi` P2/P3, `jam-tarh` P1, `adad-natiq` P2, `hasr-adad-ushri` P3 (adds « bracket a number known by its rounding »).
   Every change is listed in the plans.
9. **Missing page.** Book page 37 (the ICT page of unit 2) is missing from the scan. Default: `amaliyat-natiqa` module 7
   generates its own calculator activity, declared as a platform addition.
10. **Textbook errors found** (recorded in each unit's extraction, never shown to students):
    - unit 2 `method-9` (prints 23/33, correct 15/11) and its integration solution (prints 59/7, correct 57/7);
    - unit 4 `prep` item 1 (reads 8 − 5 × 2 = −2);
    - unit 5 `now-77-1` (both stored answers are wrong);
    - unit 3: the extraction routes `ex-63/64/68/69` (أتعمّق) to the synthesis, which is forbidden; they are re-routed.
