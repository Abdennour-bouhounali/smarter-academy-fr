# Cycle moyen rollout — phase 3 progress log

One entry per generated lesson, newest last. Each lesson is generated INTO its catalogue entry, published on `dev`
(owner decision D12) and imported + published in the local database (owner, 2026-10-14). Contracts:
`docs/architecture/LEARNING_NET.md` §4, `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` §11 « Publish a lesson » and
§ « Generating a 1AM–3AM unit LESSON BY LESSON ».

> **2026-11-18: `qisma-iqlidiya-baqi`, `qawaid-qabiliyat-qisma` (1AM) and `qisma-iqlidiya-hasr` (2AM) are v2 and their
> module pages are DELETED** (with `content/problems.js`, `moduleContext.js`, `lessonProblem`, and the 1AM unit's
> `_unit/prepDiagnostic.jsx` + `_unit/moduleContext.js`) — `LESSON_V2.md` §2, `OLD_VERSION_TRACE_2026-11-18.md` §8.
> Their sections below are history: the module files they cite no longer exist; their configs, knowledge maps, banks and
> class tests remain.

## Batch 1 (2026-10-14) — queue entries 1–3

### 1. `mana-jam-tarh` « معنى الجمع والطرح » (1AM, unit 2 `jam-tarh-ashriya`) — published

- **Unit seeded** (first generated lesson of the unit): `lessons/moyen/1am/ansab_al_aadad_wal_hisab/jam-tarh-ashriya/_unit/`;
  whole-unit extraction `docs/sources/1am/unit2/` (56 elements, pp. 23–34, answers computed in exact decimals; 42 pending for the
  unit's other lessons). One reading decided: the « وضعية تقويم » p. 33 prints its two clocks swapped (cut at 15 h 06, recorded in
  `discrepancies`, for the synthesis).
- **Lesson:** 9 modules (أستعدّ · نشاط 1 · معارف · طريقة · أتمرّن · 3 مسائل · إختبار أولي), 80 min (catalogue `durationMinutes` 56, the module total without the مسائل). New lab `story-bars`
  (MANIPULATION_CONTRACT §2sedecies): مبتدئ the school medical check (stretch the unknown height, choose the calc; « تزيد » with − and
  « تنقص » with + as traps), متقدم the textbook's six texts and six calc cards. New shared figure `ArcTape` (« مخطط بأقواس »,
  statement-figure kind `tape`). « أستعدّ » measures the net's review item `1am.m1.r03` (two platform statements) beside textbook items
  1, 2, 8 of p. 24.
- **الكفاءات (draft → final, order kept):**
  - P1 « …لحل مشكلة من الحياة اليومية » → « …لحلّ مشكلة من الحياة اليومية **بأعداد طبيعية أو عشرية** » (makes item `1am.m1.r05`
    explicit);
  - P2 « مجموع، فرق، حدود » → « مجموع، فرق، **حدّا المجموع، حدّا الفرق**، حدود » (the textbook's own terms, p. 26);
  - P3 unchanged.
  - `pointPrerequisites`: P3 ← P1 (intra-lesson). No cross-year edge: the net's prerequisite `kusur-ashriya-kitaba` still has draft
    الكفاءات (LEARNING_NET §4.8).
- **Practice:** `content/practice/1am/mana-jam-tarh/` — the FIRST 1AM–3AM bank: 50 exam sheets, 15 `term_exam` (1am-s1-91, -93, -94,
  -96, -98, -99, -101, -104, -106; 1am-s2-64 for a duration), 24 `term_exam_modelled` (1am-s1), 11 `adapted` from the lesson's textbook
  elements; misconceptions `MISC-JAMTARH-*`; in `active.json` and `exam-style.json`. Infra fix: the answer oracle only walked
  `content/practice/4am` — it now walks every grade.
- **Tooling made generic for lesson-by-lesson units:** `check:textbook` « pending » destinations; `coursesData.test.js` « available ⇔
  on disk » for 1AM–3AM; the unit's `prepDiagnostic.test.js` reads the catalogue.
- **Gates:** `npm test` (core 816 · web 9558 · scripts 10090), `npm run check:lessons` (entry 322.2 KB gzip ≤ 330), `npm run build`,
  browser `e2e/lesson-kit/1am-jam-tarh-ashriya.mjs` (every module at 1280/320 px, the lab by keyboard and tap-tap, one screen at four
  viewports × two levels) and `e2e/lesson-route-boundary.mjs` — all green.
- **URL:** `/courses/moyen/1am/ansab_al_aadad_wal_hisab/mana-jam-tarh`.

### 2. `qisma-iqlidiya-baqi` « القسمة الإقليدية » (1AM, unit 3 `darb-qisma-ashriya`) — published

- **Unit seeded** (first generated lesson of unit 3; its earlier lesson `darb-adad-ashriya` is still `coming_soon`, it comes later in the
  queue): `_unit/` bindings; whole-unit extraction `docs/sources/1am/unit3/` (75 elements, pp. 35–50; 60 pending). The unit's تحدّ (the
  leap year) is now cited by `units_1am › darb-qisma-ashriya.challenge.sourceElementId` and declared `duplicatedIn` the next lesson.
  Readings: act-3's bracket printed RTL; ex-21 depends on 365 / 366 days; ex-23 makes divisibility by 9 discovered (not in معارف p. 41).
- **Lesson:** 9 modules (أستعدّ · نشاط 3 · معارف · أتمرّن · مسائل الكتاب والآلة الحاسبة · 3 مسائل · إختبار أولي), 78 min (catalogue 54
  without the مسائل). New lab `division-jumps` (MANIPULATION_CONTRACT §2septdecies): b given, the hand holds q — مبتدئ 47 drawn flowers
  in bouquets of 6 (then 48), متقدم the textbook's 279 ÷ 14 on a line with no labelled multiples; معارف's 253 ÷ 17 in the same lab.
  « أستعدّ » measures the net item `1am.m1.r01` (three platform statements) beside textbook item 8 of p. 36.
- **الكفاءات:** the three drafts kept word for word (they already said what the lesson teaches). `pointPrerequisites`: P2 ← P1,
  P3 ← P1 and **P3 ← `1am_mana-jam-tarh_P1`** — the first LP edge along a net link toward a published earlier lesson.
- **Practice:** `content/practice/1am/qisma-iqlidiya-baqi/` — 50 sheets: 15 `term_exam` (1am-s2-70, -72, -73, -77, -78, -80 → « الفصل
  الثاني »; 1am-s1-101 → « الفصل الأول »), 22 `term_exam_modelled` (1am-s2), 13 `adapted`; misconceptions `MISC-IQLIDIYA-*`.
- **Also:** catalogue `durationMinutes` of both lessons aligned on the validator's convention (module total without the مسائل: 56 and 54),
  documented in the guide's publish steps.
- **Gates:** `npm test` (core 816 · web 9615 · scripts 10287), `check:lessons` (entry 322.3 KB gzip), `build`, browser
  `e2e/lesson-kit/1am-darb-qisma-ashriya.mjs` and `e2e/lesson-route-boundary.mjs` — all green. Local DB: published, 9 modules and 50
  exercises published.
- **URL:** `/courses/moyen/1am/ansab_al_aadad_wal_hisab/qisma-iqlidiya-baqi`.

### 3. `qawaid-qabiliyat-qisma` « قواعد قابلية القسمة » (1AM, unit 3 `darb-qisma-ashriya`) — published

- **Lesson:** 10 modules (أستعدّ · نشاط 4 · معارف · طريقة (القسمة على 4) · أتمرّن · السنة الكبيسة · 3 مسائل · إختبار أولي), 86 min
  (catalogue 62 without the مسائل). New lab `digit-cards` (MANIPULATION_CONTRACT §2octodecies): مبتدئ the textbook's 0..48 table
  coloured by hand for 2, 5 then 3 (a non-multiple refused with its remainder), متقدم the cards 4, 5, 9, 3 of exercise 26 with claim lamps
  re-judged on every swap; the rule is discovered, wrong rules are refuted with the student's own cells and swap. The rule for 9 (absent
  from معارف p. 41, discovered by exercise 23) is a declared addition; the rule for 4 is the طريقة p. 42; the unit's تحدّ (leap year) is
  the practice lab of module 5 with أتعمّق 8 (the century exception). The final test is cut from the p. 47 table (item 12). « أستعدّ »
  measures the net item `1am.m3.r01` (three platform statements) beside textbook item 10 of p. 36.
- **Extraction:** ex-25 (divide by 4 by halving twice, DECIMAL quotients 40,8 ÷ 4…) reassigned to `qisma-ashriya-taqrib`; deep-6 (prime
  numbers, not a 1AM programme item) reassigned to the unit's synthesis as enrichment — both with a `scope` note.
- **الكفاءات:** the four drafts kept word for word. `pointPrerequisites`: P4 ← `1am_qisma-iqlidiya-baqi_P1` (net link `1am.m3.r01` →
  `1am.m3.r02`), P1 ← P4, P2 ← P4, P3 ← P1.
- **Practice:** `content/practice/1am/qawaid-qabiliyat-qisma/` — 50 sheets (204 questions): 14 `term_exam` (1am-s2-70, -72, -78, -80 →
  « الفصل الثاني »; **1am-s2-62 is a term-3 paper filed under s2** — its header says الفصل الثالث, so its two sheets carry that badge), 22
  `term_exam_modelled`, 14 `adapted`; oracle by BigInt `n % d`; misconceptions `MISC-QABILIYA-*` (10).
- **Kit fix:** `IntegerSetQuestion`'s input was a fixed 256 px (`w-64`) and overflowed at 320 px; now `max-w-full` (every lesson).
- **Gates:** `npm test` (core 816 · web 9673 · scripts 10483), `check:lessons` (entry 322.4 KB gzip), `build`, browser
  `e2e/lesson-kit/1am-qawaid-qabiliyat-qisma.mjs` and `e2e/lesson-route-boundary.mjs` — all green. No API change, so no PHP test run.
  Local DB: imported, 10 modules and 50 exercises published.
- **URL:** `/courses/moyen/1am/ansab_al_aadad_wal_hisab/qawaid-qabiliyat-qisma`.

### Batch 1 summary

Three 1AM lessons published on `dev` (units 2 and 3), three new labs (`story-bars`, `division-jumps`, `digit-cards`), one shared figure
(`ArcTape`), three 50-sheet term-exam banks. No unit was completed, so no synthesis yet: unit 2 waits for `injaz-jam-tarh-mudad` and `rutbat-miqdar-jam`, unit 3
for `darb-adad-ashriya` and `qisma-ashriya-taqrib`. Open point for the owner: the corpus paper `1am-s2-62` sits in the term-2 folder but is
a term-3 exam (badges follow its header).

## Audit before batch 2 (2026-10-14) — the batch-1 labs against MANIPULATION_DNA §17

The three batch-1 labs (`story-bars`, `division-jumps`, `digit-cards`) were redesigned to the Gen Alpha bar (shared kit
`primitives/LabKit.jsx` + `SvgPill.jsx`, the character `KidFigure` — girls in hijab —, `BulbFigure`, `FlowerFigure`, `HopperFigure`;
hints closed by default platform-wide) and then audited: unit tests (core 816 · web 9688 · scripts 10483), the three browser suites
`e2e/lesson-kit/1am-*.mjs` (one screen at 1280×800, 1366×768, 390×844, 320×640, both levels) and the screenshots, read one by one.
Defects found and fixed:
- `division-jumps` متقدم: the textbook's marks « 10 قفزات؟ / 20 قفزة؟ » were clipped by the bottom of the number-line stage at every
  size (the stage ended 3 px under their baseline) — the stage is 12 px taller, the grass sits under the marks.
- « Say it once » (§17.7): `digit-cards` stated the gesture three times (prompt sub-line, side note, hint 1) and its grid hint 1 restated the
  colouring gesture; `story-bars`' hints were long sentences that repeated the gesture. The prompt keeps only « احكم على المصابيح، ثم أجب. »,
  every hint is now one short thinking question.
Known, not a lab defect: the lesson's floating column (« كرّاسي / بطاقتي ») overlaps the bottom-left of a lab on a 390 px phone while
scrolling (platform layer, `lesson-floating-column`).

## Batch 2 (2026-10-14) — queue entries 1–3

Organisation: three lesson leads (seed + whole-unit extraction + authors' brief, then the lesson), a lab author and a bank author per
lesson from the brief (`docs/sources/<g>/unit<N>/brief-authors.md`). All three published on `dev` and in the local database.

### 1. `qisma-iqlidiya-hasr` « القسمة الإقليدية وحصر حاصل القسمة » (2AM, unit 2 `kusur-amaliyat`) — published — the FIRST 2AM lesson
- Nothing was missing for 2AM (`lessonLoaders.js`, the index generator and the practice tooling already covered it). Fix found: a
  `textbookRef.pages.method: null` was rendered as « page 0 » on the unit page (`textbookPages.js`, with a test); the method page p. 27
  belongs to `kasr-hasil-qisma`, so this lesson's طريقة is a declared addition.
- 9 modules, 86 min (catalogue `durationMinutes` 62). New lab `egg-trays` (MANIPULATION_CONTRACT §2unvicies): the hand holds the DIVIDEND a
  (eggs on a conveyor, trays closing at b), the trays ruler is the same line read ÷ b, the student brackets a ÷ b with a one-unit frame; it
  does NOT reuse `division-jumps` (1AM holds q) — the net's no-rebuild rule. « تذكّر » box toward the published 1AM lesson.
- الكفاءات: P1 « …على أيّ عدد طبيعي غير معدوم b … 0 ≤ r < b »; P2 + « قيمتين مقرّبتين إلى الوحدة بالنقصان وبالزيادة »; P3 reworded to
  « انعدام الباقي: a/b عدد طبيعي ». `pointPrerequisites` P1 ← `1am_qisma-iqlidiya-baqi_P1`, `_P2`.
- Bank: 50 sheets, 15 `term_exam` (2am-s1-79, -87, -74, -70, -77, -68), `MISC-HASR-*`.
- URL: `/courses/moyen/2am/ansab_al_aadad_wal_hisab/qisma-iqlidiya-hasr`.

### 2. `kitabat-adad-tabii` « كتابة الأعداد الطبيعية ودلالة الأرقام » (1AM, unit 1 `adad-tabiiya-ashriya`) — published
- 10 modules, 88 min (catalogue 64). New lab `rank-exchange` (§2novodecies): the hand moves quantities between ranks (ties ten into one,
  opens one into ten); the written digits are an OUTPUT, never a card (so it differs from `digit-cards`); worlds `packing` (pencils) and
  `money` (generic drawn notes and coins). Exact maths in the new `packages/core/arithmetic/placeValue.js` (`toArabicWords` identical to
  the extraction's `words()`).
- Boundary with `kusur-ashriya-kitaba` (both carry `1am.m1.r02`): this lesson = naturals (classes of three, rank of a digit, « رقم » vs
  « عدد »), the next = decimal fractions and decimal places; `know-4`, `ex-12`, `deep-3` are split between them.
- الكفاءات: P2 + « التمييز بين رقم منزلة وعدد وحداتها »; P3 → decomposition of a NATURAL (the decimal part of the draft moved to kusur's P3).
- Bank: 50 sheets (14 `term_exam`, term 1), `MISC-KITABA-*`; oracle with its own number speller.
- URL: `/courses/moyen/1am/ansab_al_aadad_wal_hisab/kitabat-adad-tabii`.

### 3. `ikhtizal-kitaba-kasriya` « الكتابات الكسرية لحاصل قسمة واختزال كسر » (1AM, unit 4 `kitabat-kasriya`) — published
- 10 modules, 89 min (catalogue 65). New lab `fraction-knife` (§2vicies): one whole with one fixed share, the hand holds the knife (d, the
  number of equal pieces); a/d is writable only when the share's edge falls on a cut; bands when a piece would be < 10 px (d = 45 on a phone).
  It stands on its own before `hasil-qisma-kasr` (queue order): the fraction-as-quotient idea is only recalled.
- الكفاءات: P1 + « أو بقسمتهما عليه »; P2 makes `1am.m5.x1` (decimal fraction ↔ decimal writing) explicit; P3 + « حتى أبسط شكل ممكن ».
  `pointPrerequisites` P3 ← `1am_qawaid-qabiliyat-qisma_P1`, `_P2`; P2 ← `1am_kitabat-adad-tabii_P2` (net link `1am.m1.r02 → 1am.m5.r01`).
- Bank: 50 sheets (term 2 and term 3 badges by source paper), `MISC-KASRIYA-*`.
- URL: `/courses/moyen/1am/ansab_al_aadad_wal_hisab/ikhtizal-kitaba-kasriya`.

### Open points for the owner
1. **2AM unit 2 تحدّ**: no four of the five printed cards (1/24, 1/6, 1/2, 1/12, 1/8) sum to 1 (best 7/8); either the answer is « لا » or the scan hides a card (1/4 would work). Decide before the synthesis.
2. **Two proposed net links, NOT applied**: `1am.m5.r01 → 2am.m1.r06` (P2 writes 180/8) and `1am.m3.r02 → 2am.m1.r04`.
3. Brief errors found by authors: unit 4's « readable at {5, 15} » is true only among the divisors of 45 (every multiple of 5 below 45 is readable).
4. The platform's floating « كرّاسي / بطاقتي » pills still cover the lower-left of a lab on a 390 px phone (platform layer, not a lab).

## Batch 3 (2026-10-15) — queue entry 1

### 1. `hasil-qisma-kasr` « حاصل القسمة والكسر » (1AM, unit 4 `kitabat-kasriya`) — published (committed with batch 4, entry 1)

- **Lesson:** 9 modules (أستعدّ · نشاط · معارف · طريقة · أتمرّن · 3 مسائل · إختبار أولي), 85 min (catalogue `durationMinutes` 61). The unit's
  extraction was reused (`build-extraction.py` edits: `act-1` → module 4 as an application, `opener` → module 2, `self-1` / `self-9` → 4,
  `self-2` / `self-3` → 8, `deep-2` → 6; `ex-2 ①` re-read at 300 dpi: SEVEN cells, not eight; `self-1` tubes unreadable → REDESIGNED, a
  discrepancy is recorded). Unit NOT complete (`hasil-qisma-mustaqim`, `akhdh-kasr-min-adad` and the synthesis are still `coming_soon`).
- **New lab `fair-share`** (MANIPULATION_CONTRACT §2duovicies; `noRebuildForLesson` was empty, and it differs from `fraction-knife` in what the
  hand holds): the hand holds the SHARE of one child, the lab lays b shares against the a loaves; decimal rulers (0,1 / 0,01 / 0,001) land for
  3 ÷ 4 and never for 2 ÷ 3, 5 ÷ 6, 7 ÷ 3; the earned « cut » ruler (every loaf in b pieces) lands for every a, b. مبتدئ the school canteen
  (3 ÷ 4 then 2 ÷ 3), متقدم the textbook's 5 loaves for 6 people then 7 ÷ 3. New drawing `CakeFigure › Cake` (redesigned 2026-10-15 from `BreadFigure › Loaf`: round cakes, coloured slices per child, Mawlid bunting, always-open « جرّب أعدادك »), theme `bakery`. Screenshots at
  1280 × 800, 390 × 844 and 320 × 640 reviewed (initial, 0,8 over, 0,75 exact, cut ruler, discovery): the 320 px stage, controls and
  question were compacted until the glance fit (609 / 640).
- **الكفاءات (draft → final, order kept):** P1 + « وكتابة حاصل قسمة عددين طبيعيين على شكل كسر »; P2 made explicit « …لإيجاد عدد ناقص في
  مساواة من الشكل $b\times\ldots=a$ »; P3 unchanged. `pointPrerequisites`: P1 ← `1am_kitabat-adad-tabii_P2`, P2 ← P1, P3 ← P1 and
  `1am_kitabat-adad-tabii_P2` (net link `1am.m1.r02` → `1am.m5.r01`); and the published sibling `ikhtizal-kitaba-kasriya` gained P1 ←
  `1am_hasil-qisma-kasr_P1` (net link `1am.m5.r01` → `1am.m5.r02`), as its brief had announced.
- **Practice:** `content/practice/1am/hasil-qisma-kasr/` — 50 sheets / 207 questions (22 `term_exam` from `1am-s2-72`, `-78`, `-64`, `-65` and
  « الفصل الثالث » `1am-s3-37`, 16 platform additions, 12 textbook), oracle `scripts/practice-oracle/hasil-qisma-kasr.mjs`, `MISC-HASIL-*`.
- **Gates:** see the final report of the session (npm test, check:lessons, build, `e2e/lesson-kit/1am-hasil-qisma-kasr.mjs`).
- **URL:** `/courses/moyen/1am/ansab_al_aadad_wal_hisab/hasil-qisma-kasr`.

## Batch 4 (2026-10-15) — queue entries 1–3 (done)

### 1. `kusur-ashriya-kitaba` « الكسور العشرية والكتابة العشرية » (1AM, unit 1 `adad-tabiiya-ashriya`) — published
- **Commit note:** the commit also carries the previous session's uncommitted work of the same rollout (`hasil-qisma-kasr` retrofit, `FairShare` / `CakeFigure`, LabCoach docs, CLAUDE.md).
- **Unit** already seeded (`kitabat-adad-tabii`); extraction reused, destinations moved in `build-extraction.py`: act-2, act-3, ex-4…ex-14 (②–④ of ex-12), ex-26…ex-28 are APPLICATIONS in module 5, method-2 / now-14 module 4. `deep-3` ③④ stay with `muqaranat-adad-ashriya` (the extraction gives them to the comparison lesson: they ask for the smallest / largest decimal).
- **Lesson:** 10 modules (أستعدّ · نشاط « ورشة الزليج » · معارف · طريقة (31,25 ⇄ 3125/100) · طريقة (× ÷ 10, 100, 1000, lab) · أتمرّن (9 redesigned exercises + a 10 × 10 plate figure) · 3 مسائل · إختبار أولي), 62 min (catalogue `durationMinutes` 62, whole lesson 86). Entry designed by the platform (config header): the book's نشاط 2 and a zoomable ruler (reserved for the graduated half-line lesson) rejected.
- **New lab `decimal-comma`** (MANIPULATION_CONTRACT §2tervicies; `noRebuildForLesson` is empty and it differs in what the hand holds): the DIGITS are fixed on a slip, the hand holds the COMMA. World `mosaic` (honest blocks panel / strip / tile / shard; `match` and `fraction` tasks), world `machine` (× ÷ 10 … 0,001 with zeros to add). Exact arithmetic in `packages/core/arithmetic/decimals.js`. LabCoach, always-open free panel, discovery and formal phase. Screenshots at 768×1024, 1024×768, 1280×800, 1366×768, 1920×1080 reviewed by the lab author (panels stacked at the origin, lost keyboard focus, off-centre RTL slips fixed).
- **الكفاءات (draft → final, order kept):** P1 + « أو عن كمية أكبر منها … وكتابته بكتابات متساوية مثل 3/10 = 30/100 »; P2 + « (عدد الأرقام بعد الفاصلة هو عدد أصفار المقام) وحذف الأصفار غير الضرورية »; P3 → « (مفكوكه النموذجي) … ولو كانت حدوده غير مرتّبة، وتعيين عدد الأعشار أو الأجزاء من مائة » (also covers `1am.m5.r03`, the sum of decimal fractions); P4 + « (أو في 0,1 أو 0,01 أو 0,001) … مع كتابة الأصفار عند اللزوم » (the programme item `1am.m1.r03`). `pointPrerequisites`: P2 ← `1am_hasil-qisma-kasr_P1`, P1; P3 ← `1am_hasil-qisma-kasr_P1`, `1am_mana-jam-tarh_P1`, P2; P4 ← `1am_kitabat-adad-tabii_P2`, P2; and the published `mana-jam-tarh` P1 ← `1am_kusur-ashriya-kitaba_P4` (net link `1am.m1.r03 → 1am.m1.r05`). `prerequisiteLessonCodes` = `kitabat-adad-tabii`.
- **Overlap to decide (owner):** the published `ikhtizal-kitaba-kasriya` P2 already teaches « decimal fraction ⇄ decimal writing » (it was generated before this lesson by queue order). This lesson is the foundation (meaning of the comma); no edge was written between the two P2 to avoid an LP cycle.
- **Net test:** `learningNet.test.js › respecte l'ordre du manuel` now applies to 4AM only (1AM–3AM follow the queue, whose « renvois en avant » are listed: hasil-qisma-kasr → this lesson).
- **Practice:** `content/practice/1am/kusur-ashriya-kitaba/` — 50 sheets / 245 questions (24 `term_exam` from 1am-s1-91, -93, -94, -95, -96, -97, -98, -99, -101, -104, -106 and 1am-s2-64, -65; 10 `term_exam_modelled`; 16 `adapted`), oracle `scripts/practice-oracle/kusur-ashriya-kitaba.mjs`, 16 `MISC-KUSUR-*`. `1am-s2-65` is the first corpus source for `1am.m5.r03`.
- **Gates:** `npm test` (core 841 · web 10142 · scripts 11521), `check:lessons` (entry 323.0 KB gzip ≤ 330), `build`, browser `e2e/lesson-kit/1am-kusur-ashriya-kitaba.mjs`, `lesson-route-boundary.mjs`, block added to `moyen-retrofit-phase1.mjs`. Local DB: imported, 10 modules and 50 exercises published.
- **URL:** `/courses/moyen/1am/ansab_al_aadad_wal_hisab/kusur-ashriya-kitaba`.


### 2. `muqaranat-adad-ashriya` « مقارنة الأعداد العشرية وترتيبها » (1AM, unit 1 `adad-tabiiya-ashriya`) — published
- **Unit NOT complete** (`adad-ashri-mustaqim-mudarraj`, `hasr-qiyam-muqarraba` and the synthesis are still `coming_soon`): no synthesis this time.
- **Lesson:** 9 modules (أستعدّ · نشاط « القفز الطويل » · معارف · طريقة « أقارن وأرتّب » · أتمرّن · 3 مسائل · إختبار أولي), 82 min whole, 58 without the مسائل (catalogue `durationMinutes` 58; modules 6 / 14 / 9 / 10 / 13 / 8×3 / 6). Entry designed by the platform (config header): the book's نشاط 5 (four pupils' answers to judge) rejected as entry and posed in أتمرّن; a graduated half-line rejected (next lesson); a marks table to sort rejected (becomes the TIC exercise). Extraction destinations moved in `build-extraction.py`: `act-5`, `deep-3` ③④, `ict` → module 4; elements re-read at 100 dpi (p. 10, 16, 18) set `verified: True`. Act-5 ③ (marking A(3,2), B(3,14) on a graduated line) belongs to `adad-ashri-mustaqim-mudarraj`.
- **New lab `ruler-compare`** (MANIPULATION_CONTRACT §2quatervicies; differs from `decimal-comma` (the hand holds the comma) in what the hand holds: the GRADUATION of a measuring ruler shared by the compared numbers). World `jump` (theme `sandpit`): a number reads as a whole count of graduations + an exact hatched leftover; the verdict `< = >` is refused while the ruler cannot separate the two numbers; level 2 sorts a row on a podium (drag, tap-tap, keyboard). Standalone use in module 3. LabCoach, always-open « جرّب أعدادك », discovery and formal phase. Built by a lab author; screenshots at 768×1024, 1024×768, 1280×800, 1366×768, 1920×1080 reviewed (tape rescaled, knob/labels, order height 850 → ~740 px). Open: at 1024×768 the solved state needs a short scroll (833 px); pointer drag of an order token tested only through tap-tap in the browser. Exact arithmetic added to `packages/core/arithmetic/decimals.js` (`readAt`, `decidedAt`, `minGraduation`).
- **الكفاءات (draft → final, order kept):** P1 + « (مكتوبين بالفاصلة أو على شكل كسرين عشريين) … بمقارنة الجزأين الصحيحين ثم الأرقام رتبة برتبة »; P2 + « غير ضرورية ليصير للعددين عدد الأرقام نفسه بعد الفاصلة (مثل 3,2 = 3,20) »; P3 + « وتشكيل أصغر أو أكبر عدد عشري من أرقام معطاة » (`deep-3` ③④). `pointPrerequisites`: P1 ← `1am_kitabat-adad-tabii_P2`, `1am_kusur-ashriya-kitaba_P2` (net link `1am.m1.r02 → 1am.m1.r04`); P2 ← `1am_kusur-ashriya-kitaba_P2`, P1; P3 ← P1, P2; `prerequisiteLessonCodes` + `kusur-ashriya-kitaba`. No other lesson edited (no loop; the open point ikhtizal P2 vs hasil-qisma P1 left as is).
- **Bank:** 50 sheets / 201 questions (19 `term_exam`, 20 `term_exam_modelled`, 11 `adapted`; all « على منوال اختبار الفصل الأول »), `content/practice/1am/muqaranat-adad-ashriya/`, oracle `scripts/practice-oracle/muqaranat-adad-ashriya.mjs`, ten `MISC-MUQARANA-*`. Cards sheets read `deep-3` as 0,379 / 970,3.
- **Gates:** `npm test` (core 846 · web 10215 · scripts 11702), `check:lessons` (entry 323.2 KB gzip ≤ 330), `build`, browser `e2e/lesson-kit/1am-muqaranat-adad-ashriya.mjs`, block added to `moyen-retrofit-phase1.mjs` (green), `lesson-route-boundary.mjs`. Local DB: imported, 9 modules and 50 exercises published.
- **URL:** `/courses/moyen/1am/ansab_al_aadad_wal_hisab/muqaranat-adad-ashriya`.

### 3. `masahat-muhit-sath` « مساحة سطح مستو ومحيطه » (1AM, unit 11 `sutuh-masahat-muhitat`) — published — the FIRST lesson of the unit
- **Unit seeded** (`lessons/moyen/1am/handasa/sutuh-masahat-muhitat/_unit/`, `CHAPTER_ID handasa`, `CHAPTER_TITLE « ميدان الأنشطة الهندسية »`, the three one-line bindings) and the WHOLE unit extracted: `docs/sources/1am/unit11/{extraction.json, build-extraction.py, brief-authors.md}` — printed pp. 147–160 (PDF 147–161; printed p. 150 is DOUBLED at PDF 151, PDF = printed + 1 from p. 151). Figures on squared paper are read as cell rows and area / perimeter are COMPUTED (prep 2–3, act-1). The unit is not complete (`wahdat-tul-masaha`, `mustatil-murabba-masaha`, `masahat-muthallath-qaim`, `muhit-qurs` and the synthesis are `coming_soon`: 57 elements pending): no synthesis. Boundary written in the script header (units mm²…km², `P = 2(a+b)`, `A = a × b`, right-triangle area and π belong to the next lessons).
- **Lesson:** 9 modules (أستعدّ · نشاط « حوش الزليج » · معارف · طريقة « أعيّن المساحة برصف » · أتمرّن (7 steps) · 3 مسائل · إختبار أولي), 86 min whole, 62 without the مسائل (catalogue `durationMinutes` 62; 6 / 14 / 10 / 12 / 14 / 8×3 / 6). Entry designed by the platform (config header): the book's نشاط 1 (a table of area / perimeter of four figures, answered by counting) rejected as entry and posed in أتمرّن; cutting pieces on paper and eyeballing ready-made figures rejected. The honeycomb text (تمهيد) is a card closing معارف.
- **New lab `tile-yard`** (MANIPULATION_CONTRACT §2quinvicies; no existing area / perimeter lab; it differs from every other lab in what the hand holds: ONE TILE, a unit area). World `yard` (theme `courtyard`): 12 zellige tiles that are only MOVED — the area (tiles) never moves, the perimeter (fence sticks) changes; « أمشِ حول السياج » (a girl in hijab walks the fence), « أحتفظ بهذا الحوش » (a notebook); refusals `detached` / `splits` / `hole` / `rope`; مبتدئ shortest fence then exactly 20, متقدم a ROPE of 12: areas 5…9. World `floor` (module 3, `levels={false}`): a terrace with whole tiles and half tiles (14 + 4 halves = 16), then a double unit (21 = 10,5). Exact maths in `packages/core/arithmetic/surfaces.js`. LabCoach, 5 sizes reviewed by the lab author (768×1024, 1024×768, 1280×800, 1366×768, 1920×1080). `levels.test.js`: one branch added (rope ranks above fence). Open: at 1024×768 with the menu open the cells are 26–35 px (targets below 44 px; buttons 44–48).
- **الكفاءات (draft → final, order kept):** P1 + « (طول حدّه، يُعدّ بوحدات الطول على حدّه) … (الحيّز الذي يشغله، يُعدّ بوحدات المساحة التي تغطّيه) »; P2 + « والتعبير عن المساحة نفسها بوحدتين مختلفتين بينهما علاقة (إحداهما ضعف الأخرى) » (method-1: 21 = 10,5); P3 made explicit in both directions « سطحان لهما نفس المساحة دون نفس المحيط، وسطحان لهما نفس المحيط دون نفس المساحة ». `pointPrerequisites`: P2 ← P1, P3 ← P1, P2 (the net has no edge into `1am.m2.r06/r07`); `prerequisiteLessonCodes` unchanged (empty); no other lesson edited. The forward net link `1am.m2.r06 → 1am.m2.r08` is for `mustatil-murabba-masaha`.
- **Bank:** 50 sheets / 235 questions (13 `term_exam` modelled on `1am-s1-96`, `1am-s2-62/64/70/77/78/80`, `1am-s3-39`; 32 `term_exam_modelled`; 5 `adapted`), `content/practice/1am/masahat-muhit-sath/`, oracle `scripts/practice-oracle/masahat-muhit-sath.mjs` (areas by shoelace, perimeters by boundary edges, figure segments checked against the cells), 11 `MISC-MASAHA-*`. No corpus exercise is tagged `1am.m2.r06/r07`: the nearest register (fence length and cost, an entrance subtracted) is used with this lesson's concepts only. Open: the 1AM bank row of `EXERCISE_CONTRACT.md` was not extended with the boundary-figure convention (cell polygons + bold fence segments).
- **Gates:** `npm test` (core 870 · web 10316 · scripts 11920), `check:lessons` (entry 323.3 KB gzip ≤ 330), `build`, browser `e2e/lesson-kit/1am-masahat-muhit-sath.mjs` (all green at the five sizes), block added to `moyen-retrofit-phase1.mjs`, `lesson-route-boundary.mjs`. Graph: the « الأطول سياجًا هو الأكبر؟ » mistake node was dropped (it collided with an edge label in the layout test; the idea is carried by module 1 step 3 and the `thalath-hallat` item). Local DB: imported, 9 modules and 50 exercises published.
- **URL:** `/courses/moyen/1am/handasa/masahat-muhit-sath`.

### Batch 4 summary
Three lessons published on `dev`: `kusur-ashriya-kitaba` (lab `decimal-comma`), `muqaranat-adad-ashriya` (lab `ruler-compare`) and `masahat-muhit-sath` (lab `tile-yard`, a new unit seeded). New labs each differ in what the hand holds (comma, graduation, tile). Patterns reused: lab on top and one track per module, lessons NEVER pointing to the book, figures as data (guide §3 « Batch 4 entry 3 »). Open points: the overlap `ikhtizal-kitaba-kasriya` P2 vs `hasil-qisma-kasr` P1 / `kusur-ashriya-kitaba` P2 (owner decision); the small cell size of `tile-yard` at 1024×768 with the menu open.

## Method retrofit, phase 1 (2026-10-15)

The five generated lessons (`mana-jam-tarh`, `qisma-iqlidiya-baqi`, `qawaid-qabiliyat-qisma`, `qisma-iqlidiya-hasr`, `ikhtizal-kitaba-kasriya`) were retrofitted to « the textbook is the reference, not the script » (guide §4ter–§4quinquies): lab on top with no card / workspace title / lead, questions on what the student did (WHY, not a repeated calculation), bricks and naming boxes after the answer, the design written in each `lesson.config.js` header. Table and judgement calls: [`LESSON_METHOD_RETROFIT.md`](LESSON_METHOD_RETROFIT.md). The same day their five labs (`story-bars`, `division-jumps`, `digit-cards`, `egg-trays`, `fraction-knife`) received the LabCoach onboarding ([`LAB_COACH_ROLLOUT.md`](LAB_COACH_ROLLOUT.md)). Browser check: `apps/web/e2e/lesson-kit/moyen-retrofit-phase1.mjs`. Phase 2 started the same day: the eight lessons of 4AM unit 1 « الأعداد الطبيعية والناطقة » — then 4AM units 2–14 (all remaining 4AM lessons, phase 2): [`LESSON_METHOD_RETROFIT_PHASE2.md`](LESSON_METHOD_RETROFIT_PHASE2.md).

## Methodology correction (owner, 2026-10-14) — pending validation

The owner found the generated lessons copying the textbook (activity as the entry, its questions as steps, its order) and
modules with two competing starts (a card of textbook questions above a lab that has its own question). Rule written in
`LESSON_DEVELOPMENT_GUIDE.md` §4ter (the textbook is the reference of الكفاءات, not the script) and §4quater (one track per
module: act → answer about what you did → name it). Applied to ONE lesson, `kitabat-adad-tabii`:
- module 1: no brief, no workspace title/lead — the pencil lab is the top; three steps on the student's own lab numbers (the
  two 7s of 2577, one pencil more on 999, the 0 of 2017); the book's نشاط 1 moved to أتمرّن (`EX['act-1']`, destination
  module 4); new `ADAPTATION_REASONS` value `platform_designed_entry`;
- module 2 (معارف): opens on the dictation lab (7065, 4 908 732, moved from module 1's advanced level); question → book box →
  brick (the definitions no longer head the module);
- module 3 (طريقة): the money lab at the top, the brief that asked the question removed;
- module 5: the brief no longer states the facts the module asks for.
- **Onboarding prototype (same day, same lesson):** `LabCoach` on the `rank-exchange` labs of modules 1–3 (prop `coach`):
  a pulsing ring + one-sentence bubble on the button the student needs now, shown once, hidable (« فهمت » / « إيقاف الإرشاد » /
  Esc / the switch under the question). Contract MANIPULATION_CONTRACT §8quater, DNA §17.11; screenshots reviewed at 1280, 390, 320.
  Validated by the owner the same day: now MANDATORY for every manipulation — rollout in `LAB_COACH_ROLLOUT.md`.

**After the owner validates, extend to the other generated lessons** (1AM–2AM batches 1–2, then the 4AM units) and add a gate
(e.g. a lab module with a `brief`, or a `ManipulationWorkspace` with `title`/`lead`, fails `check:lessons`).

## Queue reorder (owner, 2026-10-20) — what 4AM needs NOW

The 4AM students already use the platform, so the queue now starts with their CURRENT needs. The new **Phase A**
(`LEARNING_NET.md` §4bis) takes the 4AM units in textbook order. For each lesson it takes only the DIRECT earlier-year
prerequisites, from the most recent year (3AM, otherwise 2AM, otherwise 1AM). Phase A has 35 entries:
- U2: `quwat-adad-nisbi`, `khassiyat-fitaghuras`, `tabsit-hadhf-aqwas`;
- U3: `nashr-jabri-3am`;
- U4: `musawiyat-amaliyat`, `muadalat-darajat-ula`, `muqarana-nisbiya`;
- U6: `rabi-mutanasib`, `tanasub-tamthil-bayani`, `nisba-miawiya-3am`, `haraka-muntazama-sura` + synthesis
  `wadiya-idmajiya-tanasubiya-sura`;
- U7: `qimat-ibara-harfiya`;
- U8: `fiat-takrarat`, `mutawassit-mutawazin`;
- U9: `amaliyat-natiqa`, `tanasub-atwal-muthallath`;
- U10: `jayb-tamam-zawiya`, `hisab-jayb-tamam`, `mustaqimat-mutaamida-mutawazia`;
- U11: `suwar-ashkal-insihab`, `tarif-mutawazi-adla`;
- U12: `talim-nuqta-mustawi`, `masafa-nuqtatayn`;
- U13: `qays-zawiya-minqala`, `daira-mustalahat`, `mudallaat-zawiya`, `majmu-zawaya-muthallath`;
- U14: `manzur-mutasawi-qiyas`, `ustuwana-dawaran-wasf`, `masahat-qurs`, `mawshur-qaim-wasf`, `wasf-tamthil-haram`,
  `miqyas-kharita-mukhattat`, `hajm-haram`.

Units 1 and 5 add nothing: unit 1 is covered by the published lessons, unit 5 by `muadalat-darajat-ula`. The full chains
of the previous rule follow as Phase B; the old head `mustatil-murabba-masaha` is now #36. `hall-mushkil-muadala` (2AM) and
`wasf-mutawazi-mustatilat` (1AM) are not in Phase A because a more recent lesson there extends their item.

## Batches 5–8 (2026-10-20 → 10-21) — Phase A « what 4AM needs NOW », queue entries 1–10 (all published)

Organisation: one lead per lesson (three in parallel, then the freed slot), each with a lab author and a bank author working from the unit's
`brief-authors.md`; one dev-server port per lead (5173 / 5174 / 4173 — the local API's CORS allows only these). The coordinator reviewed the
lab screenshots, ran the full gates and published each lesson in the LOCAL database (lesson, 9 modules and 50 practice exercises set to
`published`) as soon as it was done. Lessons: 3AM `quwat-adad-nisbi`, `khassiyat-fitaghuras`, `tabsit-hadhf-aqwas`, `nashr-jabri-3am`,
`musawiyat-amaliyat`, `muadalat-darajat-ula`, `tanasub-tamthil-bayani`, `nisba-miawiya-3am`; 2AM `muqarana-nisbiya`, `rabi-mutanasib`.
Seven units were seeded and extracted whole: 3AM units 3, 4, 5, 6, 11 (`docs/sources/3am/unit{3,4,5,6,11}/`) and 2AM units 3, 5
(`docs/sources/2am/unit{3,5}/`). Each lesson: 9 modules (أستعدّ · نشاط · معارف · طريقة · أتمرّن · 3 مسائل · إختبار أولي), a new lab, a 50-sheet bank.

| # | Lesson | Lab (what the hand holds) | Bank (`term_exam` / modelled / adapted) |
|---:|---|---|---|
| 1 | `quwat-adad-nisbi` (3AM) — the FIRST 3AM lesson | `power-train` — the exponent n, signed train length | 16 / 23 / 11 |
| 2 | `khassiyat-fitaghuras` (3AM) | `pythagoras-tanks` — the angle at A or the length BC | 16 / 27 / 7 |
| 3 | `tabsit-hadhf-aqwas` (3AM) | `like-terms` — a term (wooden pieces), brackets world | 15 / 35 / 0 |
| 4 | `nashr-jabri-3am` (3AM) | `area-split` — the cut line and the sign of each parcel | 16 / 11 / 23 |
| 5 | `musawiyat-amaliyat` (3AM) | `equality-lanes` — the number c of an operation and who receives it | 17 / 26 / 7 |
| 6 | `muadalat-darajat-ula` (3AM) | `term-ferry` — the sign of a carried term, then the divisor | 14 / 29 / 7 |
| 7 | `muqarana-nisbiya` (2AM) | `zero-probe` — the distance to zero of a sensor on a cable | 8 / 42 / 0 |
| 8 | `rabi-mutanasib` (2AM) | `fourth-gauges` — the missing cell of a price table | 7 / 31 / 12 |
| 9 | `tanasub-tamthil-bayani` (3AM) | `pin-rails` — a pin on its rail, a ruler on two nodes | 8 / 22 / 20 |
| 10 | `nisba-miawiya-3am` (3AM) | `hundred-grid` — t painted cells of a 10×10 tray | 7 / 34 / 9 |

- **Fidelity rule applied during review:** a `term_exam` sheet is a faithful corpus exercise; sheets that only keep a paper's situation are
  `term_exam_modelled` (6 sources of `muqarana-nisbiya` relabelled; `rabi-mutanasib`, `tanasub-tamthil-bayani` and `nisba-miawiya-3am` ship fewer
  than 15 `term_exam` because the 2AM/3AM corpus holds few faithful exercises on those topics).
- **الكفاءات:** order kept everywhere, wording sharpened only (every change is listed in each lesson's `lesson.config.js` header history and in the
  agents' reports). `pointPrerequisites` are intra-lesson, plus the first cross-lesson edges between published lessons: `nashr-jabri-3am` ←
  `tabsit-hadhf-aqwas` (P1←P3, P4←P1), `muadalat-darajat-ula` ← `musawiyat-amaliyat` (P1, P2).
- **Shared infrastructure added:** LabCoach `prefer` / `noFlip` on a coach step (`primitives/labCoach.js`, tested); `e2e/moyen-draft-grades.mjs`
  adapted (3AM now has published lessons); `units_{2am,3am} › challenge.sourceElementId` set for the units whose تحدّ is cited.
- **Owner report, 2026-10-21 — `rabi-mutanasib` نشاط, mission 3 « not clear »:** the refusal text showed a raw fraction (« يعطي 130 مقابل 551/6 »),
  the stepper clipped « 551 », and the decoy question said « أضئ ميزان الفرق ». Fixed: verdicts now write both sides as calculations
  (« 520 ÷ 4 = 130 بـ 551 ÷ 6 ≈ 91,8 », `fourthGauges.js › calcText`, LTR isolates with non-breaking spaces), the decoy question states the two end
  states, the number scales down with its digits. Rule written in MANIPULATION_CONTRACT (§2tertricies, « Verdicts say the CALCULATION »).
- **Open for the owner:** `area-split` folds « جرّب أعدادك أنت » into a closed `LabFold` only at 1024×768 with the sidebar open (to keep one screen);
  the rule says always open. At 1024×768 the `pythagoras-tanks` machine is small (the lesson column is 414 px) and its coach bubble covers part of it.
- **Gates (final tree):** `npm test` core 965 · web 11794 · scripts 13777; `npm run check:lessons` every step green (entry 325.5 KB gzip ≤ 330);
  `npm run build`; per-lesson browser e2e (`3am-quwa-nisbiya`, `3am-fitaghuras-jayb-tamam`, `3am-ibarat-harfiya-3`, `3am-ibarat-harfiya-3-nashr`,
  `3am-musawiyat-mutabayinat`, `2am-adad-nisbiya-2`, `2am-tanasubiya-2am`, `3am-tanasubiya-sura`, `lesson-route-boundary`, `moyen-draft-grades`).
  Local DB: the ten lessons, their 90 modules and 500 exercises are `published`.
- **URLs:** `/courses/moyen/3am/ansab_al_aadad_wal_hisab/{quwat-adad-nisbi,tabsit-hadhf-aqwas,nashr-jabri-3am,musawiyat-amaliyat,muadalat-darajat-ula}`,
  `/courses/moyen/3am/handasa/khassiyat-fitaghuras`, `/courses/moyen/3am/tanasubiya_duwal/{tanasub-tamthil-bayani,nisba-miawiya-3am}`,
  `/courses/moyen/2am/ansab_al_aadad_wal_hisab/muqarana-nisbiya`, `/courses/moyen/2am/tanasubiya_duwal/rabi-mutanasib`.
- **Next (Phase A):** #11 `haraka-muntazama-sura` + the synthesis `wadiya-idmajiya-tanasubiya-sura` (closes 3AM unit 6), then `qimat-ibara-harfiya`
  (4AM unit 7), `fiat-takrarat`, `mutawassit-mutawazin`, … (`docs/curriculum/GENERATION_QUEUE.md`, run `node scripts/learning-net-queue.mjs`).

## Owner priority — 3AM units 1–5, planned before generation (2026-10-25)

The owner put the remaining 20 entries of the 3AM units 1–5 first (15 lessons + 5 syntheses: الأعداد النسبية, الكسور والأعداد
الناطقة, القوى, الحساب الحرفي, المساويات والمتباينات). They are « Phase 0 » of the queue (`LEARNING_NET.md` §4bis, `OWNER_FIRST_UNITS` in
`scripts/learning-net-queue.mjs`). New working method: every entry was PLANNED first, by one Opus planner per unit, with the textbook
pages read, the net, the exam corpus and the sibling lessons. The plans are `docs/sources/3am/unit<N>/plan/<code>.md`, plus one README
per unit. The coordinator cross-reviewed them for distinct labs, consistent boundaries and shared maths. Sonnet 5.5 leads then generate
each lesson FROM its plan, two lanes in parallel, and the coordinator publishes each pair. The index, the pairing, the generator prompt
and the open owner questions are in `docs/curriculum/PLAN_3AM_UNITS_1_5.md`. Generation has not started; owner question 1 (a unit-3 net
link) blocks entry #11.

### Phase 0, entry 1 — `jidaa-adadayn-nisbiyayn` « جداء عددين نسبيين » (3AM unit 1, generated 2026-10-26, NOT yet exported / committed)

First lesson of the unit; it seeded `lessons/moyen/3am/ansab_al_aadad_wal_hisab/aadad-nisbiya/_unit/` and the whole-unit extraction
(`docs/sources/3am/unit1/`, 93 elements, 31 discrepancies). New lab `elevator-reel` « شريط المصعد » (the hand holds the SIGNED TIME of a
camera replay; MANIPULATION_CONTRACT §2septentricies), new exact module `packages/core/arithmetic/relativeOps.js` (grown by lessons 2–3). Nine
modules (62 min, 86 with the three مسائل), bank of 50 sheets (7 `term_exam`, 25 `term_exam_modelled`, 18 `adapted`), seven `MISC-JIDAA-*`.
Catalogue flipped to `available` (durationMinutes 62). Remaining for the coordinator: export / import (guide §11 step 4), commit, push `dev`.
The plan's deviations are in its « Generator notes » (`docs/sources/3am/unit1/plan/jidaa-adadayn-nisbiyayn.md`).

### Phase 0, entry 2 — `jidaa-ida-nisbiya` « جداء عدة أعداد نسبية » (3AM unit 1, lesson 2, generated 2026-10-26, NOT yet exported / committed)

Second lesson of `aadad-nisbiya`, generated from its plan (`docs/sources/3am/unit1/plan/jidaa-ida-nisbiya.md`, « Generator notes » at its end). New lab `robot-track` « مسار الروبوت »
(the hand holds the SIGN of each card and the ORDER of a robot's programme on a graduated mat; a negative card makes the robot jump over the zero gate; MANIPULATION_CONTRACT
§2novetricies), theme `roboticsClub`; `relativeOps.js` grew `product`, `negativesIn`, `signByParity`, `opposite`, `square`, `factorize`. Nine modules (64 min, 88 with the three
مسائل), bank of 50 sheets (8 `term_exam`, 23 `term_exam_modelled`, 19 `adapted`), eight `MISC-IDA-*`. الكفاءات: the plan's proposed final wording (P1 gains the roles of the sign −, P2 the
computation and the reordering, P3 `a² = a × a`, P4 numeric distributivity in both directions); the cross-lesson `pointPrerequisites` toward lesson 1. **Plan error found:** `now-11`
reads 85 (odd), not 50. The extraction elements of the lesson are `verified: true`. Remaining for the coordinator: export / import (guide §11 step 4), commit, push `dev`.

### Phase 0, entry 3 — `qismat-nisbiyayn` « حاصل قسمة عددين نسبيين » (3AM unit 1, lesson 3, generated 2026-10-26, NOT yet exported / committed)

Third and last lesson of `aadad-nisbiya`, generated from its plan (`docs/sources/3am/unit1/plan/qismat-nisbiyayn.md`, « Generator notes » = § 12). New lab `code-lockers` « خزائن الأمانات »
(the hand rolls the CODE of a library locker's combination lock — a sign wheel and digit / fraction wheels — so that `b × ? = a` opens the door; a quotient is the missing factor;
MANIPULATION_CONTRACT §2quadragies), theme `libraryLockers`; `relativeOps.js` grew `divide`, `missingFactor`, `quotientSign`, `sameValue`, `writingsOf` and `evaluate` (priorities, brackets,
unary minus, with its steps). Nine modules (64 min, 88 with the three مسائل), bank of 50 sheets (10 `term_exam`, 17 `term_exam_modelled`, 23 `adapted`; 211 questions, 30 `counted: false`), eight
`MISC-QISMA-*`. الكفاءات: the plan's proposed final wording (P1 gains the missing factor, P2 the quotient of products, P3 the fraction writings, P4 the order of the priorities); cross-lesson
`pointPrerequisites` toward lessons 1 and 2. Catalogue `available`, `durationMinutes` 64, `prerequisiteLessonCodes` gains `jidaa-ida-nisbiya`. **Findings:** `3am-s1-2` ex 3 prints E = −7 (not −70):
the sister sheet `jidaa-ida-nisbiya-l3-003` was repaired (E = −7, bounds 1,428 / 1,429) and the notes in `EXERCISE_CONTRACT` and the lesson-2 plan corrected; the elevator-reel verdict
needs no LRM (islands measured LTR for t = −3 … 3); `learning-net-queue.mjs` now queues the synthesis of a unit whose last lesson is published (`wadiya-idmajiya-aadad-nisbiya` is the
next lesson of the unit). The extraction elements of the lesson are `verified: True`. Entry bundle 329.4 KB gzip (the catalogue JSON grew; headroom 0.6 KB). Browser QA with `QA_STUB=1` (the local API was
down), glance 623–820 px at the four tablet / laptop sizes. Remaining for the coordinator: export / import (guide §11 step 4), commit, push `dev`.

### Phase 0, entry 7 — `jam-tarh-kasrayn` « جمع وطرح كسرين » (3AM unit 2, lesson 3, generated 2026-10-26, NOT yet exported / committed)

Third lesson of `kusur-natiqa`, generated from its plan (`docs/sources/3am/unit2/plan/jam-tarh-kasrayn.md`, « Generator notes » at its end). New lab `seed-rake` « مشط الشتلات »
(the hand stretches a rake: spacing 1/N m over a 1 m bed of crop zones; the sum is read in plants and is the same for every spacing that works; the widest is the smallest
common multiple; a harvest subtracts; متقدم locks the rake and asks N and the length first; MANIPULATION_CONTRACT §2undequadragies), theme `seedbed`; `fractions3.js` grew
`isCommonMultiple`, `smallestCommonMultiple`, `multiplesUntil`, `cellsOf`, `zoneEnds`, `sumWith`, `widestUnit`. Nine modules (63 min, 87 with the three مسائل), bank of 50 sheets
(13 `term_exam`, 30 `term_exam_modelled`, 7 `adapted`), seven `MISC-JAMTARH-*`. الكفاءات: P1 changes meaning, P2 adds the natural number and the reduction, P3 becomes « أصغر مضاعف مشترك »
(plan § 2). The extraction elements of L3 were re-read at 130–250 dpi and set `verified: True`. Catalogue `available`, `durationMinutes` 63. Browser QA with `QA_STUB=1` (the local API was down),
glance 501–593 px at the five tablet / laptop sizes. Remaining for the coordinator: export / import, commit, push `dev`; `learning-net-queue.mjs` reports « leçons prévues hors file :
wadiya-idmajiya-aadad-nisbiya » (the unit 1 lead's synthesis edit), to regenerate at the end.

## Next batch — prompt

### Phase 0, entry 6 — `tasawi-muqaranat-kasrayn` « تساوي كسرين ومقارنتهما » (3AM unit 2, lesson 2, generated 2026-10-26, NOT yet exported / committed)

Second lesson of `kusur-natiqa`, generated from its plan (`docs/sources/3am/unit2/plan/tasawi-muqaranat-kasrayn.md`, « Generator notes » at its end). New lab `shade-match`
« آلة مزج الألوان » (the hand pours c blue shots into d white to match a reference a/b; a needle judged by the sign of c·b − a·d; when a·d/b is not whole NO integer fits and the
cross products COMPARE; MANIPULATION_CONTRACT §2octentricies), theme `paintshop`; `fractions3.js` grew `crossProducts`, `sameFraction`, `compareFractions`, `lcm`, `commonMultiples`,
`toDenominator`, `missingTerm`, `matchNumerator`, `shadeVerdict`, `unitsDigitOfProduct`. Nine modules (63 min, 87 with the three مسائل), bank of 50 sheets (5 `term_exam`, 38
`term_exam_modelled`, 7 `adapted`), eight `MISC-TASAWI-*`. الكفاءات: P1 gains « وإيجاد حدّ مجهول », P2 and P3 change meaning (plan §2). The extraction elements of L2 were re-read at
130–260 dpi and set `verified: True` (two transcription errors fixed: `ex-15` 5/7 not 5/17, `ex-17` pairs). Catalogue `available`, `durationMinutes` 63. Browser QA with `QA_STUB=1`
(the local API was down). Remaining for the coordinator: export / import, commit, push `dev`.

**Superseded on 2026-10-25 for Phase 0:** use the generator prompt in `docs/curriculum/PLAN_3AM_UNITS_1_5.md`. The prompt below
still applies to the Phase A entries that come after Phase 0.


Phase A entries 1–10 are published (see « Batches 5–8 »). The queue now continues at Phase A #11 `haraka-muntazama-sura` (3AM unit 6, whose
extraction `docs/sources/3am/unit6/` already exists — move its destinations in `build-extraction.py`), then the synthesis
`wadiya-idmajiya-tanasubiya-sura` and `qimat-ibara-harfiya` (`docs/curriculum/GENERATION_QUEUE.md`; run `node scripts/learning-net-queue.mjs` first). Organisation that worked twice: a lead per lesson (phase 1: seed + extraction + brief; phase 2: lesson), a lab
author and a bank author per lesson from the brief. Paste:

```
Phase 3 of the cycle moyen rollout — generate the next N=3 lessons of the learning-net queue.
Read first: CLAUDE.md, docs/README.md, docs/architecture/LEARNING_NET.md (§3bis platform/DB, §4 generation contract,
§4bis order), docs/reports/MOYEN_ROLLOUT_PHASE2_REPORT_2026-10-14.md (owner decisions D1–D12; D12: publish = push
to dev), docs/lessons/LESSON_DEVELOPMENT_GUIDE.md end to end (incl. §6ter, the lab prototype) and docs/reports/LAB_PROTOTYPE_ROLLOUT.md §2–§6 (§3 « How a lesson is mounted » and « Adding a GRADE »,
§11 « Publish a lesson », §14), docs/architecture/BUNDLE_BOUNDARIES.md §4 (rules 3, 4, 9, 10),
docs/architecture/MANIPULATION_DNA.md, docs/architecture/EXERCISE_CONTRACT.md (« Term-exam provenance »,
« Earlier-year review link »), docs/sources/moyen/exams/EXAM_PATTERN.md §6.

Run `node scripts/learning-net-queue.mjs` so the queue is fresh, then take its first N entries that are still
`coming_soon` in packages/core/curriculum/dz/lessons_<g>_2026_2027.json. For each, in order:
1. If it is the first lesson of its unit: seed the unit (lessons/moyen/<g>/<chapter>/<unit>/, _unit/ with the three
   one-line bindings) and build docs/sources/<g>/unit<N>/extraction.json (+ build-extraction.py) from the pages in the
   unit's `textbook` block (docs/official-book-pdfs/; render only the pages you need with pdftoppm; the 2AM scan is the
   only copy — get the idea and move on, D5/D9). Pages missing from the scan (D11) are GENERATED in the book's format
   as declared platform additions.
2. Generate the lesson INTO its existing catalogue entry (same code, same programmeItems) per guide §14 and
   LEARNING_NET §4, in a folder named exactly like the lesson code. FIRST design it (guide §4ter): the textbook is the
   REFERENCE of the الكفاءات, not the script — choose the entry point (compare the book's activity with at least one
   platform situation where the idea becomes necessary for the hand), the examples and the order of ideas, and write the
   choice in the lesson.config.js header; every module is ONE track (guide §4quater: the lab at the top with no card above
   it, then questions on what the student did, then the name). Then: « أستعدّ » measures every review-link item; nothing
   noRebuildForLesson lists is rebuilt; pointPrerequisites only along net links; the lab follows MANIPULATION_DNA with
   two levels and meets its §17 Gen Alpha quality bar (push the UI/UX to the limit; the shared kit and KidFigure — girls in
   hijab; no title — context then ONE direct question naming the goal and end state, §17.9; screenshots of initial and mid-activity states at four sizes, reviewed and iterated; the LabCoach onboarding on the lab — MANIPULATION_CONTRACT §8quater, default on; the LAB PROTOTYPE layer, MANDATORY since 2026-10-28 — guide §6ter and docs/reports/LAB_PROTOTYPE_ROLLOUT.md §2–§2bis: questions over the lab after each step with the teacher switch, LabStepper, celebration, playSfx sound, restart-all, guided shell, render tests, the `memo` card data on every knowledge item and `variant="memo"` footers, module steps keeping only the trace — the lesson is done only when `node apps/web/scripts/lab-rollout-status.mjs --lesson <id>` prints ✅; the module redesign checklist of guide §4quinquies); knowledge map, « أتوقّع القاعدة », « مسائل », values woven into story contexts. Lab strings go to
   apps/web/src/i18n/locales/ar/lesson.manipulation.json (keys lesson:manipulation.<type>.*), never lesson.json;
   unit maths in packages/core/arithmetic/ are imported BY PATH, never added to the core barrel. Do NOT touch App.jsx:
   run `npm run generate:lesson-index` once the lesson's lesson.config.js and routes.jsx exist. The draft الكفاءات may
   be refined (keep their order — LP ids are positional), never silently dropped: list every change for me.
3. Build its practice bank (5 levels × 10) from docs/sources/moyen/exams/exams-index.json and exercises generated
   « على منوال » the term exams: source.type "term_exam" (one precise corpus exercise) or platform_addition /
   term_exam_modelled, badge « على منوال اختبار الفصل … », oracles for every constructed answer; add it to
   active.json and exam-style.json.
4. Run the gates (npm test, npm run check:lessons — it includes the lesson-index check and the 330 KB entry budget —,
   npm run build), check it in the browser (RTL, 320 px; node apps/web/e2e/lesson-route-boundary.mjs; extend
   apps/web/e2e/moyen-draft-grades.mjs if useful), then PUBLISH it with guide §11 « Publish a lesson » (status
   available, durationMinutes ≤ 90, lesson index regenerated, export/import, commit, fast-forward dev, push origin dev)
   and give me its URL before starting the next lesson. Also import it into the LOCAL database and publish its
   modules and exercises there (owner, 2026-10-14) so I can browse it. If the entry budget fails, find the leak with
   `node scripts/analyze-entry-bundle.mjs --chain <module>` — never raise the budget to make a lesson pass.
5. If it completes its unit, generate and publish the unit's synthesis « أدمج تعلّماتي » (unit-1 9-module format,
   with ALL its Module<NN> files — registry.test.js fails on a declared module without a route).
PHP tests on MySQL (phpunit.local.xml), one run at a time. Follow the documentation synchronization rule.
End with a short progress report appended to docs/reports/MOYEN_ROLLOUT_PROGRESS.md and the same prompt for the
next batch.
```

### Phase 0, entry 4 — `wadiya-idmajiya-aadad-nisbiya` « أدمج تعلّماتي — الأعداد النسبية » (3AM unit 1, synthesis, generated 2026-10-26, NOT yet exported / committed)

First 1AM–3AM synthesis, generated from its plan (« Generator notes » = § 12). No lab: nine modules (0 أستعدّ · 1–6 « الوضعية التدريبية » via `GuidedProblem` — Assekrem night, association balance, treasure map with a GeoFigure grid, quiz points, −36 decompositions, Riyad's sheet · 7 analysis of the Sétif/Montréal situation · 8 final test, five stages). One الكفاءة P1 with `programmeItems: []` (accepted); `coursesData.test.js` LP total is now 524. Catalogue `available`, `durationMinutes` 30, pointPrerequisites toward the three lessons. Bank of 50 sheets (0 `term_exam`, 40 `term_exam_modelled`, 10 `adapted`; 165 questions), oracle `scripts/practice-oracle/wadiya-idmajiya-aadad-nisbiya.mjs`. Entry bundle 329.6 KB gzip. Browser QA with `QA_STUB=1` at the four tablet/laptop sizes. Remaining for the coordinator: export / import, commit, push `dev`.

### Phase 0, entry 8 — `adad-natiq` « العدد الناطق » (3AM unit 2, lesson 4, generated 2026-10-26, NOT yet exported / committed)

Fourth lesson of `kusur-natiqa`, generated from its plan (`docs/sources/3am/unit2/plan/adad-natiq.md`, « Generator notes » = § 12). New lab `number-line-pegs` « حبل الأعداد » (theme `clothesline`, contract §2unquadragies, DNA row): the hand carries a card bearing a writing a/b and hangs it on a courtyard rope; « تحقّق » makes it slide to its true peg, equal writings stack, (−9)/(−12) lands on the positive side, −7/3 has an exact place with a never-ending decimal; متقدم hangs all cards and one verdict judges order and unit intervals. Nine modules (0 أستعدّ measuring `1am.m5.r01` and `3am.m1.r02` · 1 نشاط · 2 معارف, alone lab `writings` + two « تذكّر » with links · 3 طريقة · 4 أتمرّن (12 exercises) · 5–7 مسائل · 8 إختبار أولي); catalogue `available`, `durationMinutes` 65, الكفاءات reworded (P1 gains the inclusions, P2 = forms/equal writings with the sign RECALLED, P3 names the method). Fixes: extraction `self-9` (only « ≠ » true), `ex-27` six pairs, `ex-28`. Bank (helper): 50 sheets, 2 `term_exam` (modelled) / 40 `term_exam_modelled` / 8 adapted / 0 other, oracle `scripts/practice-oracle/adad-natiq.mjs`, 10 `MISC-NATIQ-*`. Gates: `npm test` (core + web 647 files / 12580 tests + scripts 15346), `validate:lessons --strict`, `check:textbook`, `check:learning-net` (map and queue regenerated), `check:entry-budget` 329.7 KB (headroom 0.3 KB, no leak from this lesson), `npm run build`; e2e `apps/web/e2e/lesson-kit/3am-unit2-adad-natiq.mjs` with `QA_STUB=1` (API down) green at 768 / 1280 (modules) and four sizes (glance block ≈ 650 px). Left for the coordinator: DB export/import, commit, push.

### Phase 0, entry 9 — `amaliyat-natiqa` « العمليات على الأعداد الناطقة » (3AM unit 2, lesson 5, generated 2026-10-26, NOT yet exported / committed)

Fifth and last lesson of `kusur-natiqa`, generated from its plan (`docs/sources/3am/unit2/plan/amaliyat-natiqa.md`, « Generator notes » = § 12). New lab `merge-board` « لوحة الدمج » (theme `arcade`, contract §2duoquadragies, DNA row): a chain of calculations is a row of tiles (fraction + signed bar); the hand predicts the sign of each merge, flips the divisor of a division (sign kept) and chooses the order (magnets = priority, bubbles = parentheses, a rail = compound fraction); a wrong sign is refused and the bars show why. Pure chain engine added to `packages/core/arithmetic/fractions3.js`. Nine modules (0 أستعدّ measuring `3am.m1.r01`, `r04`, `r06`, `r07` + three 2AM sums · 1 نشاط · 2 معارف, alone lab `signs` + four « تذكّر » with links · 3 طريقة · 4 أتمرّن (12 exercises) · 5–7 مسائل, مسألة 3 with a generated calculator check replacing the missing book p. 37 · 8 إختبار أولي); catalogue `available`, `durationMinutes` 66 (90 with the مسائل), الكفاءات reworded (P1 + sign and decimal numerators, P2 sign first, P3 + reciprocal of a negative, P4 + brackets and compound fractions), `pointPrerequisites` P1 ← `3am_jam-tarh-kasrayn_P2` + `3am_adad-natiq_P2`, P2 ← `3am_jidaa-adadayn-nisbiyayn_P4`, P3 ← `3am_maqlub-qismat-kasrayn_P3`, P4 ← P1–P3. Extraction: `ex-48`…`ex-52` transcribed (z = −7/62), all lesson-5 elements `verified`. Bank of 50 sheets (16 `term_exam`, 26 `term_exam_modelled`, 8 `adapted`; 167 questions), oracle `scripts/practice-oracle/amaliyat-natiqa.mjs`, nine `MISC-AMAL-*`. Entry bundle 233.1 KB gzip. Browser QA `apps/web/e2e/lesson-kit/3am-unit2-amaliyat-natiqa.mjs` with `QA_STUB=1` at 768 / 1024 / 1280 / 1366. Remaining for the coordinator: export / import, commit, push `dev`; once published, `tabsit-hadhf-aqwas`'s « راجع » toward this lesson becomes a link.

### Phase 0, entry 11 — `qimat-ibara-harfiya` « حساب قيمة عبارة حرفية » (3AM unit 4, lesson 3, generated 2026-10-26, NOT yet exported / committed)

Third lesson of `ibarat-harfiya-3` (unit already seeded; plan `docs/sources/3am/unit4/plan/qimat-ibara-harfiya.md`, « Generator notes » = § 12). New shared maths `packages/core/arithmetic/substitution.js` (expression tree, exact evaluation and trace, written line as tokens, strict literal `readLine`, `judgeLine`, polynomial normal form for the counter-example tool). New lab `marble-run` « مسار الكريات » (theme `marblerun`, contract §2tresquadragies, DNA row, LabCoach row): the hand drops a marble (the value) into the letter's reservoir and WRITES the substituted line (brackets, hidden ×); the wall computes what the expression means, a strict reader what the line says, and the first station where they part lights up (fused 43, `(−2)²` vs −2², syntax, swallowed sign); متقدم predicts the value first and has two reservoirs; the world `twins` (module 3) finds a counter-example or proves equality with « انشر ». Nine modules (0 أستعدّ measuring `3am.m1.r08` + `1am.m5.r08` + powers + priority · 1 نشاط · 2 معارف, two « تذكّر » (links appear when the lessons are published) · 3 طريقة · 4 أتمرّن (9 exercises) · 5–7 مسائل · 8 إختبار أولي); catalogue `available`, `durationMinutes` 64, الكفاءات reworded (P1 + two letters / rational values, P2 = × and brackets, P3 names the logic « values refute, expansion proves »), `pointPrerequisites` P1 ← `3am_amaliyat-natiqa_P4`, P2 ← P1, P3 ← P1, P2. Extraction (helper): `prep` 1–4, `act-4`, `know-4`, `method-4`, `now-61`, `ex-1`…`ex-4`, `self-3`, `deep-37` (32π confirmed), `deep-39`, `ict` verified, `prep` item 2 reads `2 × (8 − 5)`, `now-61` ② fixed. Bank (helper): 50 sheets / 243 questions (14 `term_exam` modelled, 36 `term_exam_modelled`, 0 adapted; P1 141 / P2 70 / P3 32 primary), oracle `scripts/practice-oracle/qimat-ibara-harfiya.mjs`, nine `MISC-QIMA-*`. Unit challenge card rewritten (126,4 / 5 → 657). Gates: `npm test` (core 1029 + web 656 files / 12727 tests + scripts 15723), `check:lessons` (validate strict, predict prompts, exercises strict, knowledge gate, katex, routes, textbook, learning-net, entry budget 233.1 KB), `npm run build`; e2e `apps/web/e2e/lesson-kit/3am-unit4-qimat-ibara-harfiya.mjs` with `QA_STUB=1` (API down) 276 checks green at 768 / 1024 / 1280 / 1366. Remaining for the coordinator: DB export / import, commit, push `dev`; once pushed, `nashr-jabri-3am` and this lesson cite each other only through the unit page.

### Phase 0, entry 12 — `wadiya-idmajiya-kusur-natiqa` « أدمج تعلّماتي — العمليات على الكسور والأعداد الناطقة » (3AM unit 2, synthesis, generated 2026-10-26, NOT yet exported / committed)

Second 1AM–3AM synthesis, generated from its plan (« Generator notes » = § 12); it completes unit 2 (`kusur-natiqa`: 5 lessons + synthesis). No lab; nine modules: 0 أستعدّ (one statement per lesson of the unit, plus a « هل تعلم ») · 1–6 « الوضعية التدريبية » via `GuidedProblem` (a club pool tiled over three days, four siblings' prize, honey jars, a bike route, a cold night in Sétif, Sara's answer sheet + a sum pyramid) · 7 analysis of Meriem's piggy bank (the unit تحدّ redesigned: 1/3, 1/4 of the whole, 3/5 of the remainder, 1500 DA left) · 8 final test, five stages (7/12, 5/12, 1/4, 1/6, 9000 DA). One الكفاءة P1 (`pointPrerequisites` toward the five lessons), `programmeItems: []`, `durationMinutes` 30. Bank: 5 × 10 sheets (198 questions): 8 `term_exam`, 36 modelled, 6 adapted; oracle `scripts/practice-oracle/wadiya-idmajiya-kusur-natiqa.mjs`; 7 new `MISC-SYN-KUSUR-*`. `check:textbook` has no pending element left in the unit. Gates: unit tests, `npm test` (core 1039, web 12801, scripts 16129), `check:lessons`, lesson-kit e2e `apps/web/e2e/lesson-kit/3am-unit2-wadiya-idmajiya-kusur-natiqa.mjs` (stubbed API) green; `npm run build` fails in the `sa-share-pages` closeBundle only (stale `dist/.htaccess`), the bundle itself builds. Open for the owner: the unit card text (Hisham, README question 2), the dropped brick-stock document, the P1-only LP, publication (export/import, local DB, commit, push).


### Phase 0, entry 13 — `muqaranat-natiqayn` « مقارنة عددين ناطقين » (3AM unit 4, lesson 4, generated 2026-10-26, NOT yet exported / committed)

Fourth lesson of `ibarat-harfiya-3` (unit already seeded; plan `docs/sources/3am/unit4/plan/muqaranat-natiqayn.md`, « Generator notes » = § 12). New shared maths `packages/core/arithmetic/orderSign.js` (exact difference, order, verdict of an order card, the order read from a « known difference », written-difference judge, comma / fraction / Arabic-Indic number parser, expression differences through `substitution.js › toTerms`, sign REGIONS of a linear `A − B`, region-card and coefficient judges; imported by path). New lab `difference-meter` « مقياس الفرق » (theme `physicslab`, contract §2quattuorquadragies, DNA row, LabCoach row): two probes are plugged on two beads of a graduated glass rail and ONE galvanometer needle reads « red minus black »; swapping the probes crosses the needle without changing the right card; −3/2 against −1/2 sends it left; 9/11 against 13/16 (0,85 px) is decided by the needle; متقدم covers the needle with a shutter until the difference is written and hides the beads behind a curtain (`a − b = −0,3`); the world `race` (module 3) makes the beads A(x), B(x), the hand holds x, writes A − B and fills one order card per region of x. Nine modules (0 أستعدّ measuring `3am.m1.r05` via `tasawi-muqaranat-kasrayn` + `jam-tarh-kasrayn` + `muqarana-nisbiya` (2AM) + `tabsit-hadhf-aqwas` · 1 نشاط · 2 معارف with one « تذكّر » (link) · 3 طريقة (lab `race`) · 4 أتمرّن (8 exercises) · 5–7 مسائل (the two classes' success rates 25/31 and 29/36 → 1/1116; two buses A − B = 300 − x; two juice bottles −1/15 DA per litre) · 8 إختبار أولي); catalogue `available`, `durationMinutes` 64 (88 with the مسائل), الكفاءات reworded (the plan's final wording, order kept), `pointPrerequisites` P2 ← P1 + `3am_tasawi-muqaranat-kasrayn_P2`, P3 ← P1. Extraction: the 13 elements `verified` (`ex-30` d) is −5/6 and −7/8: 1/24, not the plan's 41/24), destinations moved. Bank of 50 sheets (230 questions): 9 `term_exam` (re-numbered, never word for word), 34 `term_exam_modelled`, 7 `adapted`; oracle `scripts/practice-oracle/muqaranat-natiqayn.mjs`; 8 new `MISC-MUQ-*`. Gates: unit tests (`orderSign` 10, `differenceMeter` logic 15, lab render 11, `content` 21, `problems` 5, the unit's `prepDiagnostic`, the oracle 210 for this bank), `npm test` (core 1039, web 12857, scripts 16129), `check:lessons` (entry bundle 233.2 KB gzip ≤ 245), `npm run build`, lesson-kit e2e `apps/web/e2e/lesson-kit/3am-unit4-muqaranat-natiqayn.mjs` (217 checks, stubbed API, 768 / 1024 / 1280 / 1366) green; one `examSheet` test timed out once under load and passes alone (22 s). Open for the owner: the net links `3am.m1.r06`, `2am.m4.r02`, `3am.m5.r01` → `3am.m5.r04` (README question 1), the P3 scope (README question 3, applied as written), publication (export / import, local DB, commit, push).

### Phase 0, entry 14 — `wadiya-idmajiya-ibarat-harfiya-3` « أدمج تعلّماتي — الحساب الحرفي » (3AM unit 4, synthesis, generated 2026-10-26, NOT yet exported / committed)

Third 1AM–3AM synthesis; it completes unit 4 (`ibarat-harfiya-3`: 4 lessons + synthesis), generated from its plan (« Generator notes » = § 12). No lab; nine modules: 0 أستعدّ (one or two statements per lesson of the unit) · 1–6 « الوضعية التدريبية » via `GuidedProblem` (magic square as a table, yard and path, three calculation programmes, two gym offers, triangles in a rectangle with a GeoFigure, stopping distance) · 7 analysis of the school track's staggered starts (no formula of the solution shown) · 8 final test, four épreuves (lane lengths `2y + π(x + 2,4(k−1))`, differences 2,4π / 4,8π independent of x and y, ≈ 7,54 m / 15,08 m, ≈ 399,34 m and the decision) + an uncounted bonus (48,5 → 210). Two الكفاءات P1 / P2 (`pointPrerequisites` toward the unit's lessons), `programmeItems: []`, `durationMinutes` 30; the LP total of `coursesData.test.js` is 527. Bank (helper): 5 × 10 sheets / 285 questions, 6 `term_exam` (all read), 44 `term_exam_modelled`, 0 adapted; oracle `scripts/practice-oracle/wadiya-idmajiya-ibarat-harfiya-3.mjs`; 11 `MISC-SYN-HARF-*`. Extraction: the four synthesis elements re-read (`verified`, destinations with module numbers); `evaluation` is a DRY road (transcription fixed). Fixes to the plan are in its § 12 (π calculator key, module 7 without formulas, boss shape). e2e `apps/web/e2e/lesson-kit/3am-unit4-wadiya-idmajiya-ibarat-harfiya-3.mjs` with `QA_STUB=1` at 768 / 1024 / 1280 / 1366. Remaining for the coordinator: DB export / import, commit, push `dev`.

### Phase 0, entry 15 — `quwa-adad-ashara` « قوى العدد 10 » (3AM unit 3, lesson 1 of the remaining four, generated 2026-10-26, NOT yet exported / committed)

First of the four remaining lessons of `quwa-nisbiya` (unit already seeded; plan `docs/sources/3am/unit3/plan/quwa-adad-ashara.md`, « Generator notes » at its end). **Net fix first** (`3am.m3.r02 → r03` replaced by `r01 → r03`, `r02 → r04` added, `kitaba-ilmiya-rutba` lists `qawaid-quwa-ashara`; `LEARNING_NET.md` § 4bis). New shared maths `packages/core/arithmetic/tenPowers.js` (+ test, extended by the next lessons), new lab `ten-zoom` « عدسة القوى » (theme `science-lens`, worlds `zoom` and `prefixes`, `MANIPULATION_CONTRACT` § 2quinquaquadragies), modules 0–8 (أستعدّ with 7 statements, نشاط with the lab and four evidence questions, معارف on the `prefixes` world, طريقة with three methods — counting, مفكوك, k × 10ⁿ —, أتمرّن with 8 rows, three مسائل: under the microscope, big distances, the water meter, إختبار أولي), bank 5 × 10 (2 `term_exam` / 33 modelled / 15 adapted). Catalogue: `available`, `durationMinutes` 62 (modules without the مسائل; 86 with them), icon 🔭, difficulty سهل, final الكفاءات (P1 reading and 10¹, P2 10⁰ and 10⁻ⁿ, P3 decimal writing + names + prefixes, P4 مفكوك and k × 10ⁿ), `pointPrerequisites` P2 ← P1, P3 ← P1 and `1am_kusur-ashriya-kitaba_P4`, P4 ← P3. Gates: lab logic (22 tests) + render (11) + levels + `tenPowers` (10) + content / problems tests, `npm run check:lessons`, `npm test` (the only failures under CPU load were a 4AM lesson-memo timing test and `examSheet` timing out at 60 s, both green alone), build, entry bundle 233.2 KB, e2e `apps/web/e2e/lesson-kit/3am-unit3-quwa-adad-ashara.mjs` (238 checks, `QA_STUB=1`).

### Phase 0, entry 16 — `qawaid-quwa-ashara` « قواعد الحساب على قوى العدد 10 » (3AM unit 3, lesson 2 of the remaining four, generated 2026-10-26, NOT yet exported / committed)

Second of the four remaining lessons of `quwa-nisbiya` (plan `docs/sources/3am/unit3/plan/qawaid-quwa-ashara.md`, « Generator notes » = § 12). `tenPowers.js` extended (`productExp`, `quotientExp`, `powerExp`, `chainExp`, `UNIT_SCALE`, `unitColumns`, `mulSci`, `divSci`, + tests). New lab `unit-ladder` « مسطرة التحويل » (theme `tech-bench`, `MANIPULATION_CONTRACT` § 2sexquadragies, DNA row, LabCoach row): a band stretched between two unit plaques on a ruler of columns; two chained bands add (km → m → mm, dashed total), a band across the metre measures a gap (km → cm = 5), area / volume tables re-tile the ruler and the student chooses the table (km² → m² = 6, mm² → m² = −6 with a blue band). Modules 0–8 (أستعدّ with 7 statements; نشاط with the lab and four evidence questions; معارف « دفتر رياض » with six judged lines, the three rules, the sum remark and a linked « تذكّر » to `quwat-adad-nisbi`; طريقة with the chain method and k × 10ᵖ NOT normalised; أتمرّن with 6 rows; three مسائل: phone memory, tank and farm, a calculation programme; إختبار أولي with 5 épreuves). Bank 5 × 10 (4 `term_exam` / 32 modelled / 14 adapted, oracle `scripts/practice-oracle/qawaid-quwa-ashara.mjs`, 9 `MISC-QAWAID-*`). Catalogue: `available`, `durationMinutes` 62 (86 with the مسائل), icon 📏, difficulty متوسط, final الكفاءات P1–P4 (domain « m و n صحيحان نسبيان », P4 with the a × 10ᵖ computations), `pointPrerequisites` P1 ← `3am_quwa-adad-ashara_P1`, P2 ← own P1 and `3am_quwa-adad-ashara_P2`, P3 ← own P1, P4 ← own P1–P3. Extraction: elements re-read at 130–260 dpi, `verified: True`, destinations moved (`act-4`, `know-3` → 2; `method-43c`, `now-43` → 3; `ex-14 / 17 / 20 / 50 / 56` → 4; `ex-55` → 7; `self-4 / 5 / 6` → 8; the rest → the bank). Gates: lab logic (17) + render (9) + levels + `tenPowers` (13) + content / problems tests, `npm run check:lessons`, `npm test` (the only failures: the other lead's `mutabayinat-amaliyat` graph and a 4AM lesson-memo timing test), build, entry bundle 233.2 KB, e2e `apps/web/e2e/lesson-kit/3am-unit3-qawaid-quwa-ashara.mjs` (`QA_STUB=1`). Open points for the owner: P4 widened to the a × 10ᵖ computations (plan risk 1); area / volume conversions are used as power-of-power evidence (plan risk 2); two of the four typical errors are not nodes of the knowledge map (layout test).

### Phase 0, entry 17 — `mutabayinat-amaliyat` « المتباينات والعمليات » (3AM unit 5, lesson 1 of the remaining three, generated 2026-10-26, NOT yet exported / committed)

Inequality half of `3am.m5.r05` (plan `docs/sources/3am/unit5/plan/mutabayinat-amaliyat.md`, « Generator notes » at its end; the unit was already seeded). New lab `loom-threads` « خيوط النول » (theme `loom`, `MANIPULATION_CONTRACT` § 2sexaquadragies, DNA row, LabCoach row): the hand holds ONE knot of the lower beam of a loom (comb x + c, nail c·x) and the whole line follows; a red and a blue thread cross exactly when the factor is strictly negative, × 0 gathers them (0 = 0); متقدم chains two operations on a third beam and transports a painted band (x < 3 to x > −6). New maths in `packages/core/arithmetic/linear.js`: `imageRay` and `boundAffine` (swept). Nine modules (0 أستعدّ with 7 statements · 1 نشاط with the lab and four evidence questions · 2 معارف with two « تذكّر » boxes (links) and the lab alone · 3 طريقة with three methods (deduce, compare, bracket) · 4 أتمرّن with 8 exercises · 5–7 مسائل (a cultural contest S = 50 − 3e, a lift 25x + 80 ≤ 630, a school garden 12 < L < 15) · 8 إختبار أولي); catalogue `available`, `durationMinutes` 61 (85 with the مسائل), icon 🧶, difficulty متوسط, الكفاءات reworded as in the plan (P2 and P3 add the DIVISION, P4 = deduce / bracket / compare, ≤ and ≥ named), `pointPrerequisites` P1 ← sibling P1, P2 ← P1 + sibling P2, P3 ← P2 + sibling P2, P4 ← P1–P3. Extraction: 28 elements `verified` and re-routed (`ex-19`, `ex-23`, `ex-24`, `ex-26`, `ex-27`), the plan's `now-75-2` reading corrected (the scan prints `x − 8 > 7`), `now-77-1` fixed (both stored answers wrong). Bank of 50 sheets (200 questions): 5 `term_exam` (all five read at the scan), 33 `term_exam_modelled`, 12 `adapted`; oracle `scripts/practice-oracle/mutabayinat-amaliyat.mjs`; 10 new `MISC-MUTABAYINA-*`. Gates: lab logic (8 tests, a sweep of 2730 pairs × ranges) + render (8) + `levels` + `linear` (20) + `content` (11) + `problems` (4) + the unit's `prepDiagnostic`, `check:lessons` chain (the only reds are other authors' in-flight lessons), build, e2e `apps/web/e2e/lesson-kit/3am-unit5-mutabayinat-amaliyat.mjs` (stubbed API, 768 / 1024 / 1280 / 1366 / 1920). Open for the owner: the net link `3am.m5.r04 → 3am.m5.r05` (README question 1), the shared-item cross-lesson edges (README question 2, applied), the free band (not built), publication (export / import, local DB, commit, push).

### Phase 0, entry 18 — `kitaba-ilmiya-rutba` « الكتابة العلمية ورتبة القدر » (3AM unit 3, lesson 3 of the remaining four, generated 2026-10-26, NOT yet exported / committed)

Plan `docs/sources/3am/unit3/plan/kitaba-ilmiya-rutba.md` (« Generator notes » = § 12). `tenPowers.js` extended (`scientific`, `isScientific`, `bracketOf`, `cellOf`, `orderOfMagnitude` with the carry, `logPos`, `sciTex`, + tests). New lab `size-ladder` « سلّم الأحجام » (theme `fair-wall`, `MANIPULATION_CONTRACT` § 2unquadragies, DNA row, LabCoach row; the hand holds the POSITION of a length card on a ladder of decades: rung = bracket, cell = mantissa, magnet = order of magnitude; متقدم types `a` and `n` first). Lesson of 9 modules (`durationMinutes` 63, with the مسائل 87), the three الكفاءات rewritten as in plan § 2 with cross-lesson edges P1 ← `3am_quwa-adad-ashara_P4` / `3am_qawaid-quwa-ashara_P4`. Bank 5 × 10: 13 `term_exam` / 23 `term_exam_modelled` / 14 adapted / 0 other platform additions; oracle with its own BigInt parser; 7 `MISC-ILMIYA-*`. `ex-61` / `ex-62` are `notIntegrated` (tools of `khassiyat-fitaghuras` / 4AM). e2e `apps/web/e2e/lesson-kit/3am-unit3-kitaba-ilmiya-rutba.mjs` (~200 checks, five sizes, `QA_STUB=1`). Coordinator: export / import, publish modules and exercises locally, commit.

### Phase 0, entry 19 — `hasr-adad-ushri` « حصر عدد عشري موجب » (3AM unit 5, lesson 2 of the remaining three, queue #19, generated 2026-10-26, NOT yet exported / committed)

Programme item `3am.m5.x1` (extends 1AM `1am.m3.r05`). Plan `docs/sources/3am/unit5/plan/hasr-adad-ushri.md` (« Generator notes » at its end). `decimals.js` extended (`floorAt`, `ceilAt`, `roundAt`, `roundingInterval`, `quotientDigits`, `quotientBracket`, swept). New lab `scoop-scale` « ميزان العطّار » (theme `attar`, `MANIPULATION_CONTRACT` § 2septquadragies, DNA row, LabCoach row): the hand pours / pinches a MASS onto a spice scale whose seven-segment screen rounds; the student finds where the screen flips (1,25 included, 1,35 excluded; 1,50 and 2,49 for the kilo screen; 5,675 / 5,684 and the 2/7 sachet whose lamp never says « balanced » in متقدم); free panel (a reading — « 7 » and « 7,0 » differ — or a quotient). Nine modules (0 أستعدّ 7 statements · 1 نشاط with four evidence questions (the 2/7 step optional) · 2 معارف (6,358, the 8,5 · 9 · 9,5 figure) · 3 طريقة with three methods · 4 أتمرّن 7 exercises · 5–7 مسائل (a semolina bag read 24,9 kg, a family car trip 437 km / 31 L, a 100 m race at 0,01 s) · 8 إختبار أولي); catalogue `available`, `durationMinutes` 58 (82 with the مسائل), icon ⚖️. الكفاءات reworded as in the plan (P1 names the approximations, P2 adds « وحصره بهما », P3 adds the INVERSE — a number known by its rounding — and P4 « وتعيين مدوّره »). Bank 5 × 10 (3 `term_exam`, 31 `term_exam_modelled`, 9 `adapted`; oracle with its own BigInt decimals, 193 entries). Extraction: elements verified at 200 dpi (`prep` 14 and 15 and `now-77-1` corrected). Gates: lab logic + render tests, content / problems / figures tests, unit tests, e2e `apps/web/e2e/lesson-kit/3am-unit5-hasr-adad-ushri.mjs` (4 sizes × 9 modules + gestures + glance at 5 sizes).

### Phase 0, entry 20 — `wadiya-idmajiya-quwa-nisbiya` « أدمج تعلّماتي — القوى ذات أسس نسبية صحيحة » (3AM unit 3, synthesis, queue #14, generated 2026-10-28, published on `dev`)

Fourth synthesis of the 3AM plan and the LAST entry of unit 3 (`quwa-nisbiya`: 4 lessons + synthesis). No lab; nine modules: 0 أستعدّ (one or two statements per lesson of the unit + a « هل تعلم » on the metric prefixes) · 1–6 « الوضعية التدريبية » via `GuidedProblem` (the grains on a 64-cell board, ten-fold bacteria, Salma's notebook of six lines, red cells in a litre of blood, three numbers A / B / C, Algeria in numbers) · 7 analysis of « رقاقة الذهب » (the book's CO₂ molecule redesigned: leaf 0,1 µm, atom 288 pm, a 350 DA price as the parasite datum, prefixes recalled) · 8 final test, five stages (2,88 × 10⁻¹⁰ m, 10⁻⁷ m, 3,47 × 10² layers, order 3 × 10², between 10⁶ and 10⁷ atoms on 1 mm). One الكفاءة P1 (`pointPrerequisites` toward the four lessons), `programmeItems: []`, `durationMinutes` 30. Catalogue flipped to `available` (`difficulty` « متوسط », icon 🧩); LP total of `coursesData.test.js` is now 528.

- **Textbook elements** (`integration`, `evaluation`, `ict`) re-read at 110 dpi (pdf pp. 52–53), `verified: True`, destinations moved to module 8 / situation 4 / situation 1 in `docs/sources/3am/unit3/build-extraction.py` (extraction rebuilt, `check:textbook` green). The unit card's تحدّ is NOT moved to « رقاقة الذهب » (owner question 1 of the plan stays open).
- **Answers in scientific writing are TWO numbers** (`a` then `n`, two `numeric` steps with `ask` 0 / 1) — a `GuidedProblem` cannot hold « 7,2 × 10¹⁴ »; a pure choice (« which power? ») stays a `choice`. A power of 10 never appears with a raw `^` in a sorter item (`10¹²` or words).
- **Bank (50 sheets, 210 questions) generated from TEMPLATES, not typed one by one** — reusable for any numbers synthesis: `content/practice/3am/wadiya-idmajiya-quwa-nisbiya/`, built by a throw-away Python generator (Fraction arithmetic, ASCII expression → LaTeX) whose every question carries an oracle spec; the committed oracle `scripts/practice-oracle/wadiya-idmajiya-quwa-nisbiya.mjs` RETYPES nothing from `expectedAnswer`: it evaluates the spec in its own BigInt rationals (power before unary minus, negative exponents), checks that each 2-digit / decimal literal of the spec appears in the sheet, finds the unique `n` (scientific writing tested over all n, never by counting digits), rounds half up with the `a' = 10` carry, judges every choice option by READING its two powers of 10 (brackets) or its words (compare / sign) and recomputes the named misconceptions it can (SIGN, PRIORITY, MULEXP, POWSUM, DIGITS, ROUND, FIRST). Six situation templates (layers = thickness ÷ diameter, a count × a volume, light travel time, ten-fold growth, area per inhabitant, a mass) × two parameter sets in levels 4 / 5. Provenance: **0 `term_exam`** (no corpus paper was re-read at the scan for this entry, and the rule is « `term_exam` only for exercises actually read »), 47 `term_exam_modelled` (`3am-s2` / `3am-s3` badges alternate), 3 `adapted` (`evaluation`, `ict`, `integration` of the book, new numbers); 24 `MISC-WQ-*` in `misconceptions.json`. A signature must be readable by `validate-exercises`: a value like 0,000000000000000125 is refused (« illisible »), so tiny-decimal distractors are left out.
- **Not done / deviations from the plan:** the plan's « ≈ 6 faithful `term_exam` » (3am-s2-76 / -80 / -83, 3am-s3-51, 3am-s2-69 / -75) is replaced by `term_exam_modelled` (honest, reading skipped); the optional `UnitOpenerFigure` challenge drawing is not built; no new e2e interaction script is committed beyond `apps/web/e2e/lesson-kit/3am-unit3-wadiya-idmajiya-quwa-nisbiya.mjs` (mounts every module at 4 tablet / laptop sizes, no console error, no raw `$`).

### Phase 0, entry 21 — `wadiya-idmajiya-musawiyat-mutabayinat` « أدمج تعلّماتي — المساويات – المتباينات – المعادلات » (3AM unit 5, synthesis, queue #20, generated 2026-10-28, published on `dev`)

Fifth and LAST synthesis of the 3AM units 1–5 plan (`musawiyat-mutabayinat`: 4 lessons + synthesis). No lab; nine modules: 0 أستعدّ (seven statements, one or two per lesson) · 1–6 « الوضعية التدريبية » via `GuidedProblem` (the reward split with T unknown and 24 800 DA, Salma's notebooks `4x + 32 = 200`, the spice shelf with a rounded scale reading, the taxi `50 + 30d`, the cold room with ×1,8 and ×(−2), the ages `41 + n = 3(9 + n)` then `n > 23`) · 7 analysis of the pursuit in Tipaza (40 / 36 km/h, 2 km — the book's `integration` redesigned, analysed AND solved in five steps, then four decisions: finish line, rounding 19,5 min → 20, 13 km < 15, `d ≤ 1,5`; the « حكاية » card after the last answer) · 8 final test on ANOTHER situation (the two trucks `12x + 40 = 8x + 140`, x = 25, 340 kg, 6 more boxes, `339,4 ≤ L < 340,6`). TWO الكفاءات (P1 properties and brackets, P2 model / solve / check; E1–E3 are P2, E4–E5 P1), `programmeItems: []`, `durationMinutes` 28, catalogue `available` (`difficulty` « متوسط », icon 🚴); the LP total of `coursesData.test.js` is now 530. The unit card's تحدّ is rewritten in the platform's words (24 800 DA, T unknown; no `sourceElementId`).

- **No `term-ferry` lab in module 7** (plan risk 3, fallback taken): a synthesis has no lab and the solution x = 1/2 is fractional; the analysis is a `MethodSteps` block + `TapQuestion`s.
- **`requires` of a synthesis' questions are the unit's four LESSON slugs** (`musawiyat-amaliyat-3am`, `mutabayinat-amaliyat-3am`, `hasr-adad-ushri-3am`, `muadalat-darajat-ula-3am` — `priorKnowledge`), never another lesson's brick ids (`E_REQUIRES_NOT_ESTABLISHED`); `knowledgeGraph.js` carries each knowledge item on exactly ONE `notebook` node (`lessonGraphs.test.js`); a drawing may not contain a digit absent from the statement (`masailIllustrations.test.js`: « ربع T », not « 1/4 »).
- **Textbook elements** `opener`, `challenge` (p. 70), `integration`, `evaluation` (p. 84) re-read at 130 dpi, `verified: True`, destinations → modules 7 / 1 / 7 / 8 in `docs/sources/3am/unit5/build-extraction.py` (extraction rebuilt, `check:textbook` green).
- **Bank (50 sheets, 210 questions) generated from TEMPLATES** (family builders with seeded numbers: property of equalities, scaling, solve, solve with brackets, sat / holds / translate choices, ranges of an affine expression, `law` implications, rounding, rounded-reading brackets, integer cap, bracket vs limit decision) and checked by the committed oracle `scripts/practice-oracle/wadiya-idmajiya-musawiyat-mutabayinat.mjs`: BigInt rationals + AFFINE FORMS `a·x + b` (an equation is solved in x, a number is tested by substitution), round-half-up `rnd`, `lo / hi` (r ∓ p/2), `fl / ce`, and every MC option judged by its own spec (`sat`, `holds`, `eqsol` — a distractor must NOT have the context's solution, `br`, `law` on a ½-step grid, `always` / `undecided` / `never` for « is the limit inside the bracket »); exactly ONE true option per MC, every signature `via` recomputed, every ≥ 2-digit literal re-read in the sheet. Two generator lessons: **no two signatures of one question may share a value** (`content.test.js` evaluates the first declared id), and a translation distractor must be re-solved (x = 1 made `30 = 2t + 28` accidentally correct). Provenance: **0 `term_exam`**, 47 `term_exam_modelled`, 3 `adapted` (`integration`, `evaluation`, `challenge`, new numbers); NO new misconception id (`MISC-MUSAWIYA-*`, `MISC-MUADALA-*`, `MISC-MUTABAYINA-*`, `MISC-TADWIR-*` reused).
- **Not done / deviations:** the plan's « 7 faithful `term_exam` » became `term_exam_modelled` (no corpus paper re-read); `objectives` exist only where the component takes them (`ContentModule`: module 7; `GuidedProblem`, `PrerequisiteDiagnostic`, `BossFinal` have no such prop); owner questions 1 (P1 / P2 wording), 4 (two different situations, M7 and M8) keep the plan's default.

## HANDOFF — 3AM units 1–5 plan, state at the end of the 2026-10-26 session (coordinator notes)

Master plan: `docs/curriculum/PLAN_3AM_UNITS_1_5.md` (20 entries). **18 of 20 are generated, gated, committed, pushed to `dev` and
published in the LOCAL database (modules + exercises `published`, nothing draft).** Pairs 1–9 are in `git log` as
`feat(3am): publish …` (pair 8 = `26e43ff0`, pair 9 = `6e82348b`).

### What is left — pair 10 (the last two entries, both syntheses)

| Lane | Entry | Code | Unit dir | Port | Notes |
|---|---|---|---|---|---|
| A | #20 | `wadiya-idmajiya-musawiyat-mutabayinat` | `unit5` | 5173 | **DONE 2026-10-28** (entry 21): unit-5 synthesis; module 7 WITHOUT `term-ferry` (fallback); plan `docs/sources/3am/unit5/plan/wadiya-idmajiya-musawiyat-mutabayinat.md` |
| B | #14 | `wadiya-idmajiya-quwa-nisbiya` | `unit3` | 5174 | **DONE 2026-10-28** (entry 20): unit-3 synthesis + « رقاقة الذهب »; plan `docs/sources/3am/unit3/plan/wadiya-idmajiya-quwa-nisbiya.md` |

Start both with the plan's « generator prompt » (`PLAN_3AM_UNITS_1_5.md` § « The generator prompt »; replace `<CODE>`, `<UNIT_DIR>`,
`<PORT>`, `<OTHER>`), launched as two background Sonnet sub-agents, plus these rules added since the plan was written:
- nothing generated stays `draft` (the coordinator publishes locally); no pig / alcohol / gambling cards or dice / interest /
  non-Islamic symbols in any string, icon or emoji (guide § « Cultural and religious respect »);
- entry bundle budget is **245 KB gzip** (measured ≈ 233.3 KB); no eager module imports catalogue names;
- `term_exam` only for exercises actually read at the scan, otherwise `term_exam_modelled` / `adapted`;
- do not touch the stray root-level `nisba-miawiya-3am` entry of `content/practice/policy.json`;
- agents never commit / push / import the DB; they reuse the seeded `_unit/` and move « pending » destinations in `build-extraction.py`.
Syntheses have no new lab (nine modules; modules 1–6 « وضعيات تدريبية »; see entries 4, 12, 14 above as models).

### Coordinator sequence after each pair (exactly what was run)

1. `npm test` (web + scripts) — the former `rm -rf apps/web/dist` step is no longer needed: since 2026-10-29 the
   `sa-share-pages` plugin never reads `dist/` (template from `public/.htaccess`), so a stale `dist/` or two parallel builds pass —,
   `npm run check:lessons`, `NODE_OPTIONS=--max-old-space-size=8192 npm run build`, `node scripts/learning-net-queue.mjs --check`.
   The `buildLessonMemo` 4AM `insihab-shuaa` test is a known load flake (passes alone); `examSheet.test.js` timeout is 180 s.
2. Grep the changed files for `🐷 🃏 🎰 🍺 🍷` (the guide's own rule text is the only legitimate hit).
3. ONE commit per pair, `feat(3am): publish <a> (unit N) and <b> (unit M)`, trailer `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`;
   `git push origin dev`.
4. Local DB (API at 127.0.0.1:8000): `node packages/core/curriculum/exportCurriculum.mjs`; `(cd apps/api && php artisan smarter:import-curriculum)`;
   `node packages/core/curriculum/exportContentRegistry.mjs`; `(cd apps/api && php artisan smarter:import-content-registry)`; then in
   tinker set `publication_status='published'` on `lesson_modules` and `practice_exercises` where `retired_at` is null.
5. Append the entry to this file; update the plan's « Generator notes ».

When pair 10 is done the 3AM unit 1–5 plan is complete: update `docs/curriculum/GENERATION_QUEUE.md` (regenerated by
`npm run generate:learning-net`) and continue with the next batch of the queue (`GENERATION_QUEUE.md`).

### Open owner confirmations (defaults applied until decided)

- Unit 1: Assekrem-night redesign of the synthesis (default: kept).
- `adad-natiq`: negative "integer + fraction" ambiguity; `amaliyat-natiqa` module 7 self-made calculator (book page missing).
- Unit 4: تحدّ text rewrite (126,4/5→657) vs synthesis تحدّ (48,5/4→210); net-link proposals `3am.m1.r06`, `2am.m4.r02`, `3am.m5.r01 → 3am.m5.r04`, `3am.m3.r06` / `2am.m4.r09 → r03` (default: measured by « أستعدّ », no edge written).
- Unit 2 synthesis: brick-stock document dropped.
- `quwa-adad-ashara`: P3 includes names/prefixes; self-2 reading `10⁻²`; ex-63/64/68/69 notIntegrated.
- `qawaid-quwa-ashara`: P4 widened to `a × 10ᵖ` computations; area/volume tables as power-of-power evidence.
- `mutabayinat-amaliyat`: net link `3am.m5.r04 → r05` missing (sign-of-difference only recalled); shared programme item counts as « no net link » for cross-lesson edges (default yes).
- `kitaba-ilmiya-rutba`: ex-61 / ex-62 (Pythagoras, Thales) notIntegrated; order-of-magnitude convention follows the book (half up); negatives only in P1.
- `hasr-adad-ushri`: unit-5 README Q1 (net links `2am.m1.r05` / `r06 → 3am.m5.x1`), Q3 (P3 adds the inverse), Q4 (no 2AM papers, 3 faithful term-exam sheets); loose `RANK` distractors on L1–L3 (helper offered a rework); the 1AM home lesson `hasr-qiyam-muqarraba` is unpublished so its « تذكّر » box has no link yet.
- Other: 🎲 in `ProbabilityStatsTool.jsx` / `MATH_LAB.md` (probability object); whether the importer should create content as `published` directly; unchecked `term_exam` claims in pair-5 banks (`amaliyat-natiqa` 16, `qimat-ibara-harfiya` 14); unit-card تحدّ texts of units 1/2 still book-verbatim; `node apps/web/e2e/lesson-route-boundary.mjs` never run against the real API.

## 2AM مقطع `2am.m1` (units 1–2) — 10 entries, plan and run index `docs/curriculum/PLAN_2AM_M1.md` (from 2026-10-28)

Owner request: the 10 `coming_soon` entries of 2AM « ميدان الأنشطة العددية », مقطع 2am.m1, along the net, connected to 3AM / 4AM by
BACK links only (successor `pointPrerequisites` ← `2am_<code>_P<m>` along net links + linked « تذكّر — السنة الثانية »). Plans per entry
in `docs/sources/2am/unit{1,2}/plan/` (owner questions in each README). One commit per lesson; the successor connection is its own commit.

### Pair 1 — `silsila-bidun-aqwas` (unit 1, seeds the unit) and `kasr-hasil-qisma` (unit 2), published on `dev` 2026-10-29

- `silsila-bidun-aqwas` « سلسلة عمليات دون أقواس »: lab `tram-route` (theme `tramline`), `packages/core/arithmetic/chainOps.js`, unit 1 `_unit/` +
  whole-unit extraction (`docs/sources/2am/unit1/`), unit تحدّ rewritten (40 − 12 + 6). Bank 7 `term_exam` / 33 modelled / 10 adapted.
- `kasr-hasil-qisma` « الكسر وحاصل القسمة »: lab `mooring-lines` (theme `harbor`), `packages/core/arithmetic/fractions2.js`. Bank 10 `term_exam` /
  32 modelled / 8 adapted. « تذكّر » links to `hasil-qisma-kasr`, `ikhtizal-kitaba-kasriya`, `qisma-iqlidiya-hasr`; P4 ← `2am_qisma-iqlidiya-hasr_P2`.
- Successor connection (commit `feat(lessons): connect quwat-adad-nisbi to silsila-bidun-aqwas`): `quwat-adad-nisbi` P4 ←
  `2am_silsila-bidun-aqwas_P2` (link `2am.m1.r01 → 3am.m3.r08`), linked « تذكّر — السنة الثانية » in its طريقة step 2. `kasr-hasil-qisma` has
  no 3AM successor in the net (owner question `2am.m1.r05/r06 → 3am.m5.x1` still open).
- Gates (coordinator, whole tree): `npm test` exit 0 (core, web 714 files / 14 576 tests, scripts 18 211), `check:lessons` (entry 236.6 KB gzip),
  build, net tests, queue check, `lab-rollout-status` ✅ for both. Local DB: 9 modules + 50 exercises each `published`.
- Known: `apps/web/e2e/lesson-route-boundary.mjs` fails its student-phone check (390×844 on a 4AM lesson) since the 2026-10-27 large-screen
  enforcement — the check is stale, not these lessons.
- Owner points added: bank L4 sheets 1–3 of `silsila-bidun-aqwas` use the arc tape (`ArcTape`) — drop if arcs count as grouping; textbook
  misprints listed in `docs/sources/2am/unit1/build-extraction.py › DISCREPANCIES`.

### Pair 2 — `silsila-bi-aqwas` (unit 1) and `jam-tarh-kusur` (unit 2), published on `dev` 2026-10-29

- `silsila-bi-aqwas` « سلسلة عمليات تتضمّن أقواسا »: lab `coop-calculator` (brackets typed on a calculator at the school cooperative's
  counter), extends `chainOps.js`. Bank 13 `term_exam` / 28 modelled / 9 adapted (modelled = `platform_addition` + `reason: term_exam_modelled`,
  the contract's form). Eighth misconception `MISC-AQWAS-MISPLACED`.
- `jam-tarh-kusur` « جمع وطرح كسرين »: lab `trail-odometer` (theme `mountaintrail`: a scout walks a trail of white posts; the hand holds the
  distance), extends `fractions2.js`. Bank 8 `term_exam` / 35 modelled / 7 adapted. Its متقدم predict phase was reflowed to fit 1024×768
  (886 → 706 px; « Screen budget » in `MANIPULATION_CONTRACT.md` §2novenquinquagies bis).
- Successor connection (commit `feat(lessons): connect quwat-adad-nisbi and jam-tarh-kasrayn to pair 2`): `quwat-adad-nisbi` P4 ← also
  `2am_silsila-bi-aqwas_P1`, `_P3`, and a second linked « تذكّر — السنة الثانية » (the fraction bar) in طريقة step 4; `jam-tarh-kasrayn`
  P1 ← `2am_jam-tarh-kusur_P2`, P2 ← `_P1`, `_P3`, and its معارف « تذكّر — السنة الثانية » now links. Both links checked in the browser.
  Still to write the day `muqarana-kasrayn` is published: `2am_jam-tarh-kusur_P2` ← `2am_muqarana-kasrayn_P3`.
- Gates (coordinator, whole tree): `npm test` exit 0 (core 1094, web 722 files / 14 717 tests, scripts 18 548), `check:lessons` (entry
  236.7 KB gzip), build, net tests, queue check, `lab-rollout-status` ✅ for both. Local DB: 9 modules + 50 exercises each `published`.
- Known: `apps/web/e2e/lesson-kit/3am-unit2-jam-tarh-kasrayn.mjs` stalls in its lab drive (a lab question overlay intercepts the click) —
  the script predates the lab-prototype rollout (lot 5, 2026-10-28); its module checks up to the lab pass.
- Owner points added: `coop-calculator` prints the calculator's honest −5,8 for a numerator-only line (negatives not taught; refuse the line
  instead?); `2am-s1-77` ex 1 is cited as `term_exam` on three `silsila-bi-aqwas` sheets (L2-002, L5-002 may reuse the same part);
  many unit-1 extraction elements are still `verified: False` (re-read at 100 dpi only).

### Pair 3 — `wasf-silsila-hisab` (unit 1) and `jida-kasrayn` (unit 2), published on `dev` 2026-10-29

- `wasf-silsila-hisab` « وصف سلسلة حسابات »: lab `chain-cutter` « مقصّ السلسلة » (theme `corkboard`: the hand chooses where a printed chain
  is cut; only a cut at the last operation works, any other bites a staple and shows the recollected value), extends `chainOps.js` (L3 row:
  `analyse`, `lastOperation`, `describe`, `cutAt`, `build`…). Bank 2 `term_exam` / 40 modelled / 8 adapted (few faithful sheets: the 2AM
  papers describe chains rarely). Coordinator fix: two level-5 bank sheets still said « الساحر » / « خدعة » (the lead had renamed the
  مسألة only) — now « لغز سالم » / « لغز العدد ».
- `jida-kasrayn` « جداء كسرين »: lab `window-blinds` « ستائر النافذة » (theme `classwindow`: two perpendicular pulls — a side curtain on rail
  stops for a/b, a roller blind on cord notches for c/d — the doubly shaded corner is the product), extends `fractions2.js` (E3:
  `productGrid`, `timesNumber`, `fractionOf`, `ofRemainder`). Bank 9 `term_exam` / 31 modelled / 10 adapted. M4 has seven exercises.
- Successor connection (commit `feat(lessons): connect maqlub-qismat-kasrayn to jida-kasrayn`): `maqlub-qismat-kasrayn` P1 ←
  `2am_jida-kasrayn_P1` (net `2am.m1.r07 → 3am.m1.r03`); its معارف « تذكّر — السنة الثانية » already computed `getLessonPath('jida-kasrayn')`
  and now renders the link. `wasf-silsila-hisab` has NO successor edge: its plan's `tabsit-hadhf-aqwas` P4 ← `2am_wasf-silsila-hisab_P1`
  waits for the owner to add the net link `2am.m1.r02 → 3am.m5.r01` (and with it the « تذكّر » in that lesson's « مجموع أم جداء » item).
- Gates (coordinator, whole tree): `npm test` exit 0 (core 1106, web 730 files / 14 857 tests, scripts 18 928), `check:lessons` (entry
  236.7 KB gzip), build, net tests, queue check, `lab-rollout-status` ✅ for both; lesson-kit e2e green (227 and 196 checks). Local DB:
  9 modules + 50 exercises each `published`; the new 3AM edge is in `learning_point_prerequisites`.
- Owner points added: the net link `2am.m1.r02 → 3am.m5.r01` (above); `ex-9` of `wasf-silsila-hisab` (a calculation tree) is a `selfCheck`
  because no tree figure kind exists; `jida-kasrayn` M4 `ex-7` uses 450 seats from the plan's reading of `deep-42`, not re-checked on the scan;
  unit-1 extraction stays `verified: False`.

### Pair 4 — `tawzi-darb-jam-tarh` (unit 1) and `muqarana-kasrayn` (unit 2), published on `dev` 2026-10-29

- `tawzi-darb-jam-tarh` « توزيع الضرب على الجمع والطرح »: lab `kit-packer` « ورشة الحقائب التضامنية » (theme `solidarity`: the hand sets
  what each dispenser releases, a belt deals one item per bag, and the BAG is the referee — two equal counters are not enough), extends
  `chainOps.js` (L4: `expand`, `factorOut`, `commonFactor`, `mentalSplits`, `expandLetter`). Bank 9 `term_exam` / 32 modelled / 9 adapted.
- `muqarana-kasrayn` « مقارنة كسرين »: lab `level-laser` « ليزر المستوى » (theme `oilpress`: the hand holds the height of a laser level
  across tanks whose tubes are graduated differently; wrong models are refuted by the laser jumping to the claimed level), extends
  `fractions2.js` (E4: `compareCase`, `compareSimple`, `orderSimple`, `vsOne`). Bank 12 `term_exam` / 28 modelled / 10 adapted.
- Successor connection (commit `feat(lessons): connect tasawi-muqaranat-kasrayn, tabsit-hadhf-aqwas and jam-tarh-kusur to pair 4`):
  `tasawi-muqaranat-kasrayn` P2 ← `2am_muqarana-kasrayn_P3`, P3 ← also `_P2`, `_P4` (its معارف « تذكّر » now links by itself);
  `tabsit-hadhf-aqwas` P1 ← `2am_tawzi-darb-jam-tarh_P3` (net `2am.m1.r03 → 3am.m5.r01`); `jam-tarh-kusur` P2 ← `2am_muqarana-kasrayn_P3`
  and its forward renvoi on comparison is now a linked « تذكّر ». NOT written (no net link): `nashr-jabri-3am`, `jidaa-adadayn-nisbiyayn`,
  `jidaa-ida-nisbiya` ← `tawzi-darb-jam-tarh`; the plan's recall box in `tabsit-hadhf-aqwas` معارف has no like-terms brick to sit before
  (its أستعدّ « راجع » card links by itself).
- Coordinator fix: `scripts/learning-net-queue.mjs` dropped the synthesis of a unit whose lessons were all published lesson by lesson
  (`--check` failed on both 2AM syntheses); each grade phase now closes with the syntheses of its complete units (commit `fix(net): …`,
  `LEARNING_NET.md` §4bis rule 5).
- Gates (coordinator, whole tree): `npm test` exit 0 (core 1113, web 739 files / 15 003 tests, scripts 19 312), `check:lessons` (entry
  236.8 KB gzip), build, net tests, `lab-rollout-status` ✅ for both; lesson-kit e2e green. The coordinator re-captured the `level-laser`
  lab at 1024×768, 1366×768 and 768×1024 (the lead's captures were gone). Local DB: 9 modules + 50 exercises each `published`, no draft
  module left among the eight 2AM lessons.
- Owner points added: the three net links above (`2am.m1.r03 → 3am.m5.r02`, `→ 3am.m1.r01`); `2am-s1-75` ex 5 was read on the text layer
  only (the shakiest `term_exam` of `muqarana-kasrayn`); the net direction `r08 ↔ r09` question stays open (current direction kept).

### Pair 5 — the syntheses `wadiya-idmajiya-amaliyat-tabiiya-ushriya` (unit 1) and `wadiya-idmajiya-kusur-amaliyat` (unit 2), published on `dev` 2026-10-29

- Both copy the 3AM synthesis architecture (00 أستعدّ · 01–06 « الوضعية التدريبية » · 07 analysis of the final situation, the only
  `ContentModule`, with `objectives` · 08 final test), no lab, one الكفاءة each with `pointPrerequisites` P1 ← the unit's lessons
  (unit 1: `silsila-bidun-aqwas_P3`, `silsila-bi-aqwas_P3`, `wasf-silsila-hisab_P3`, `tawzi-darb-jam-tarh_P4`; unit 2:
  `qisma-iqlidiya-hasr_P2`, `kasr-hasil-qisma_P4`, `jam-tarh-kusur_P3`, `jida-kasrayn_P3`, `muqarana-kasrayn_P3`). Banks: unit 1
  4 `term_exam` / 40 modelled / 6 adapted; unit 2 8 `term_exam` / 42 modelled. `coursesData.test.js` LP total 530 → 532.
- No successor connection (a synthesis has no item and no net link).
- Gates (coordinator, whole tree): `npm test` exit 0 (core 1113, web 743 files / 15 108 tests, scripts 19 722), `check:lessons` (entry
  236.8 KB gzip, queue 146), build, net tests; lesson-kit e2e green for both. Local DB: 9 modules + 50 exercises each `published`.
- Owner points added: unit-1 synthesis L5 sheets `l5-004`, `l5-006`, `l5-007` divide by a decimal (22 ÷ 0,4 …) — inside the unit's
  boundary?; L3-008 uses « diameter × 3,14 » for a half circle; unit-2 synthesis redesigned the printed challenge cards (the book's set
  has no sum-to-1 choice) and replaced the book's sanitation statistics by a water-network situation — confirm.

### 2AM مقطع `2am.m1` — closing summary (2026-10-29)

All ten `coming_soon` entries of 2AM units 1–2 are generated, `available`, pushed to `dev` and published in the local DB (9 modules + 50
exercises each, no draft): `silsila-bidun-aqwas`, `silsila-bi-aqwas`, `wasf-silsila-hisab`, `tawzi-darb-jam-tarh`,
`wadiya-idmajiya-amaliyat-tabiiya-ushriya` (unit 1) and `kasr-hasil-qisma`, `jam-tarh-kusur`, `jida-kasrayn`, `muqarana-kasrayn`,
`wadiya-idmajiya-kusur-amaliyat` (unit 2) — with `qisma-iqlidiya-hasr`, published earlier, the whole مقطع. Eight new labs: `tram-route`,
`coop-calculator`, `chain-cutter`, `kit-packer`, `mooring-lines`, `trail-odometer`, `window-blinds`, `level-laser`; shared maths in
`packages/core/arithmetic/chainOps.js` and `fractions2.js`. Connection to 3AM (and through it to 4AM), back links only, along net links:
`quwat-adad-nisbi`, `jam-tarh-kasrayn`, `maqlub-qismat-kasrayn`, `tasawi-muqaranat-kasrayn`, `tabsit-hadhf-aqwas` (LP edges + linked
« تذكّر »), and inside 2AM `jam-tarh-kusur` ← `muqarana-kasrayn`. Open owner questions are listed in each pair's entry and in
`docs/sources/2am/unit{1,2}/plan/README.md`. Next in the queue: `docs/curriculum/GENERATION_QUEUE.md`.

## 2AM مقطع `2am.m4` (units 3–4) — 10 entries, plan and run index `docs/curriculum/PLAN_2AM_M4.md` (from 2026-10-29)

Owner request: « continue generating the ميدان الأنشطة العددية lessons 2AM » — after `2am.m1`, the 10 `coming_soon` entries of مقطع 2am.m4
« الأعداد النسبية – مفهوم معادلة » (unit 3 `adad-nisbiya-2`: 5 lessons + its synthesis; unit 4 `mafhum-muadala`: 3 lessons + its synthesis;
`muqarana-nisbiya` had been published earlier), along the net, connected by BACK links only. Plans per entry in `docs/sources/2am/unit{3,4}/plan/`
(owner questions in each README, defaults applied). Five pairs in two lanes; one commit per lesson; the successor connection is its own commit.

### Pair 1 — `talim-mustaqim-mudarraj-2` (unit 3) and `ibara-harfiya-intaj` (unit 4, seeds the unit), published on `dev` 2026-10-29
- `talim-mustaqim-mudarraj-2` « التعليم على مستقيم مدرّج »: lab `corniche-ruler` (the hand holds the ORIGIN, then the value of a graduation; wrong
  readings raise a ghost), `relative.js` E1. Bank 5 `term_exam` / 40 modelled / 5 adapted.
- `ibara-harfiya-intaj` « إنتاج عبارة حرفية واستعمالها »: lab `wax-cells` (hexagonal cells; the rod count is read off the DRAWN cells), `equation2.js` E1,
  letters option in `substitution.js`; unit 4 `_unit/` + whole-unit extraction (92 elements). Bank 6 `term_exam` / 36 modelled / 6 adapted.
- Successor connection (`feat(lessons): connect muqarana-nisbiya to talim-mustaqim-mudarraj-2`): `muqarana-nisbiya` P1 ← `2am_talim-mustaqim-mudarraj-2_P1`
  (net r01 → r02). `ibara-harfiya-intaj` has no net link: none.
- Coordinator review caught: « value + unit » reversed in `corniche-ruler` strings (« m 3 »), a clipped off-board label, a cramped tray pill in
  `wax-cells`, a missing `predictPrompt` (strict audit).

### Pair 2 — `jam-tarh-nisbiya` (unit 3) and `hall-mushkil-muadala` (unit 4), published on `dev` 2026-10-29
- `jam-tarh-nisbiya` « جمع وطرح عددين نسبيين »: lab `balloon-ballast` (flames and sandbags tied or thrown; the judge reads the gesture log AND the typed
  altitude), `relative.js` E2. Bank 7 `term_exam` / 37 modelled / 6 adapted.
- `hall-mushkil-muadala` « حلّ مشكل باستعمال معادلة »: lab `juice-line` (the hand holds a bottle mould or the tank; the world checks the typed
  operation), `equation2.js` E2; the advanced slate drops its digit chips (`inputMode="decimal"`) to fit one screen. Bank 8 `term_exam` / 36 / 6.
- Production bug found at the local import: the third الكفاءة of `hall-mushkil-muadala` was 292 characters and `learning_points.title` is a VARCHAR(255)
  (`smarter:import-curriculum` crashed; production would have too). Shortened to 181; `learningPoints.test.js` now guards every title at 255.
- Successor connection: `jidaa-adadayn-nisbiyayn` P1 ← `2am_jam-tarh-nisbiya_P1`, P3 ← `_P2`; `jidaa-ida-nisbiya` P4 ← `_P2`, `_P3`;
  `muadalat-darajat-ula` P1 ← `2am_hall-mushkil-muadala_P2`, P4 ← `_P1` (their linked « تذكّر » go live by themselves).

### Pair 3 — `majmu-jabri` and `talim-nuqta-mustawi` (both unit 3), published on `dev` 2026-10-29
- `majmu-jabri` « حساب مجموع جبري »: lab `tug-rope` (turn the children whose term follows « − », send each to a team; the ribbon moves by the
  difference), `relative.js` E3. Bank 15 `term_exam` / 27 modelled / 8 adapted.
- `talim-nuqta-mustawi` « تعليم نقطة في المستوي »: lab `dig-grid` (drag the origin stake in 2D; a swapped reading is drawn), `relative.js` E4,
  `TextbookExercise` accepts `figure`. Bank 10 `term_exam` / 33 modelled / 7 adapted.
- Successor connection: `tanasub-tamthil-bayani` P1 ← `2am_talim-nuqta-mustawi_P3`, P4 ← `_P2`. `majmu-jabri`: none (`ikhtibar-musawat-mutabayina`
  writes its own edge). **The direct 2AM → 4AM edges (`murakkibata-shuaa`, `muntasaf-masafa`) are NOT written**: `decomposition.test.js` requires every 4AM
  الكفاءة prerequisite to be a 4AM one; the edges are ready as a patch (owner decision, below).
- Coordinator review caught: clipped / overprinting memo-card formulas in both lessons (new e2e assertion), 8 failing `lessonGraphs` tests for `majmu-jabri`.

### Pair 4 — `masafa-nuqtatayn` (unit 3) and `ikhtibar-musawat-mutabayina` (unit 4), published on `dev` 2026-10-30
- `masafa-nuqtatayn` « المسافة بين نقطتين على مستقيم مدرّج »: lab `gap-caliper` (a caliper screw on a thermometer; the opening is the distance),
  `relative.js` E5. Bank 7 `term_exam` / 37 modelled / 6 adapted.
- `ikhtibar-musawat-mutabayina` « اختبار صحة مساواة أو متباينة »: lab `bridge-load` (sacks on a truck on a weighbridge; the world tests the sign),
  `equation2.js` E3; writes `P1 ← 2am_majmu-jabri_P2` itself. Bank 12 `term_exam` / 32 modelled / 6 adapted.
- Successor connection (`feat(lessons): connect musawiyat-amaliyat and mutabayinat-amaliyat …`): `musawiyat-amaliyat` P1/P3 ← `2am_ikhtibar-musawat-mutabayina_P1`,
  `mutabayinat-amaliyat` P1 ← `_P3`, and a linked « تذكّر — السنة الثانية » (`RECALL.year2`) in both معارف modules. Found and fixed on the way: two doubled
  backslashes in JSX `prompt="…"` attributes of `musawiyat-amaliyat` Module02 showed « frac23 » / « times » to the student.
  `masafa-nuqtatayn` → 4AM: not written (same guard).

### Pair 5 — the syntheses `wadiya-idmajiya-adad-nisbiya-2` (unit 3) and `wadiya-idmajiya-mafhum-muadala` (unit 4), published on `dev` 2026-10-30
- Both copy the 2AM synthesis architecture (00 أستعدّ · 01–06 « الوضعية التدريبية » · 07 analysis of the final situation, the only `ContentModule`, with
  `objectives` · 08 final test), no lab, one الكفاءة each with `pointPrerequisites` P1 ← the unit's lessons (unit 3: `talim-mustaqim-mudarraj-2_P2`,
  `muqarana-nisbiya_P3`, `talim-nuqta-mustawi_P3`, `jam-tarh-nisbiya_P3`, `majmu-jabri_P2`, `masafa-nuqtatayn_P1`; unit 4: `ibara-harfiya-intaj_P2`,
  `hall-mushkil-muadala_P3`, `ikhtibar-musawat-mutabayina_P1`, `_P3`). Banks: unit 3 2 `term_exam` / 48 modelled; unit 4 3 `term_exam` / 45 modelled /
  2 adapted. `coursesData.test.js` LP total 532 → 534. Unit 3's تحدّ rewritten with Chott Melghir / Tahat (`challenge.textAr` and the textbook map).
- No successor connection (a synthesis has no item and no net link).

### Gates (coordinator, whole tree, after each pair)
Final run (2026-10-30): `npm test` exit 0 (core 1147, web 780 files / 15 798 tests, scripts 21 428); `check:lessons` exit 0 (entry 237.1 KB gzip ≤ 245;
predict audit 586/586); build; net tests 98; queue check 136; `lab-rollout-status` ✅ for the eight lab lessons; each lesson's own lesson-kit e2e green
at 768×1024, 1024×768, 1280×800, 1366×768 (the lab glance asserted ≤ 700 px at 1024×768 in both levels). Local DB: 9 modules + 50 exercises each
`published` for all ten. Old 3AM lesson-kit scripts (`3am-unit5-mutabayinat-amaliyat.mjs`, `3am-musawiyat-mutabayinat.mjs`) time out in their lab drive
(they predate the lab prototype); their module-mount checks have no failure.

### 2AM مقطع `2am.m4` — closing summary (2026-10-30)
All ten `coming_soon` entries of 2AM units 3–4 are generated, `available`, pushed to `dev` and published in the local DB: `talim-mustaqim-mudarraj-2`,
`jam-tarh-nisbiya`, `majmu-jabri`, `talim-nuqta-mustawi`, `masafa-nuqtatayn`, `wadiya-idmajiya-adad-nisbiya-2` (unit 3) and `ibara-harfiya-intaj`,
`hall-mushkil-muadala`, `ikhtibar-musawat-mutabayina`, `wadiya-idmajiya-mafhum-muadala` (unit 4) — with `muqarana-nisbiya`, the whole مقطع, and with
مقطع `2am.m1` the whole ميدان الأنشطة العددية of 2AM. Eight new labs: `corniche-ruler`, `balloon-ballast`, `tug-rope`, `dig-grid`, `gap-caliper`, `wax-cells`,
`juice-line`, `bridge-load`; shared maths in `relative.js` (E1–E5) and `equation2.js` (E1–E3). Back links: `muqarana-nisbiya`, `jidaa-adadayn-nisbiyayn`,
`jidaa-ida-nisbiya`, `muadalat-darajat-ula`, `tanasub-tamthil-bayani`, `musawiyat-amaliyat`, `mutabayinat-amaliyat` (LP edges + linked « تذكّر »).
Next in the queue: `docs/curriculum/GENERATION_QUEUE.md`.

**Open owner decisions:**
1. **2AM → 4AM LP edges** (`4am_murakkibata-shuaa_P2/P3` ← `2am_talim-nuqta-mustawi_P2/P3`, `4am_muntasaf-masafa_P1` ← `_P2`, and the `masafa-nuqtatayn`
   edges toward `hisab-murakkibatay` / `ithbat-khawas-maalam`): blocked by `decomposition.test.js` (the 4AM decomposition accepts only 4AM prerequisites).
   Open the guard to earlier-year LP ids, or keep the item / lesson level links.
2. Net links proposed by the planners and NOT added: `2am.m4.r02 → r07`, `r01 → r04`, `2am.m4.r09 → 3am.m5.r03` / `→ 3am.m5.r06`; the direction of
   `2am.m4.r08 ↔ r09` in the net is unchanged.
3. The unit 3 تحدّ was rewritten (Chott Melghir / Tahat); the unit 4 تحدّ (wax cells) too — confirm.
4. Extraction elements not re-read at 200 dpi stay `verified: False` in `docs/sources/2am/unit{3,4}/` (the lessons use none of the book's numbers).
5. Several bank sheets cite two parts of one exam paper in different lessons (`2am-s2-52` ex 3, `2am-s2-71` ex 1, `2am-s1-73` ex 3): the validator accepts it;
   drop them if you want one bank per exercise.
6. `juice-line` advanced slate has no on-screen digit chips (tablet students use the numeric keyboard).

## 1AM ميدان الأنشطة العددية (units 1–6) — 20 entries, plan and run index `docs/curriculum/PLAN_1AM_NUMBERS.md` (from 2026-10-30)

Planned on 2026-10-30 (14 lessons + 6 syntheses, 11 pairs, one design card per entry, 14 new labs). Entry 1 below; the others not started.

### 1AM entry 1 — `adad-ashri-mustaqim-mudarraj` « الأعداد العشرية ونصف المستقيم المدرّج » (1AM unit 1 `adad-tabiiya-ashriya`, pair 1 A, 2026-10-30) — generated, published locally

- **Shape:** nine modules (0 أستعدّ · 1 نشاط · 2 معارف · 3 طريقة (platform addition: the book has none) · 4 أتمرّن · 5–7 مسائل · 8 إختبار أولي), `durationMinutes` 58, three الكفاءات kept as drafted (P1 draw the graduation, P2 read the abscissa exactly or by bounds, P3 plant a known abscissa), programme item **`1am.m5.r04`** (the card's « r04 » is the net prerequisite `1am.m1.r04`), `pointPrerequisites` P2, P3 ← `1am_muqaranat-adad-ashriya_P1`.
- **Lab `jump-tape` « شريط القفز »** (theme `sportsday`, contract `MANIPULATION_CONTRACT.md` § 2novenquinquagies duodecies): the hand STRETCHES the unit (the « 1 » mark), then plants a flag per jump; متقدم: a reading cursor, exact or by bounds, on a tape without its origin and on a tape in hundredths. Core maths `packages/core/arithmetic/halfLine.js`.
- **Bank:** 5 × 10 sheets (5 `term_exam` / 31 modelled / 14 adapted / 0 other `platform_addition`), 16 `MISC-ABSC-*`.
- **Corrections:** extraction `act-4`: B = 1,7 and C = 0,5 (not 1,9 / 0,6); `prerequisiteLessonCodes` stays `[]` (a forward reference cannot be a prerequisite lesson). See « Generator notes » in `docs/curriculum/PLAN_1AM_NUMBERS.md`.
- **Patterns to reuse:** a lab whose FIRST step makes the student choose the SCALE (unit stretch with a plage refused by drawing) and whose second step plants marks on it; a hidden-origin window as a task of a reading lab; module-4 arrows drawn with `NumberLine` static + `markers` (values never written); `NumberLine` needs `format={(v) => formatDec(v, …)}` for decimals (the default drops them).

### 1AM entry 2 — `adad-nisbiya-siyaqat` « الأعداد النسبية وسياقات استعمالها » (1AM unit 5 `adad-nisbiya`, pair 1 B, SEEDS UNIT 5, 2026-10-30) — generated, published locally

- **Unit seeded:** `lessons/moyen/1am/ansab_al_aadad_wal_hisab/adad-nisbiya/_unit/` (lessonRoutes, moduleContext, prepDiagnostic + test, unitMeta) and the whole-unit extraction `docs/sources/1am/unit5/` (`build-extraction.py` → `extraction.json`, 60 elements, pp. 63–76, answers computed; 18 for this lesson, 40 pending for `talim-mustaqim-mudarraj`, `talim-fi-mustawi` and the synthesis; `brief-authors.md`). The unit prints **no تحدّ**: `units_1am › adad-nisbiya.challenge` stays `null`.
- **Shape:** nine modules (0 أستعدّ · 1 نشاط · 2 معارف · 3 طريقة (platform addition: the book has none for this lesson) · 4 أتمرّن · 5–7 مسائل · 8 إختبار أولي), `durationMinutes` 58, programme item **`1am.m5.r05`** (as in the card). « أستعدّ » measures `1am.m5.r04` and `1am.m1.r04` (the item has no net predecessor, so « راجع » adds nothing).
- **الكفاءات (draft → final, order kept):** P1 « …الارتفاعات والأعماق » → « …الارتفاعات والأعماق، **طوابق العمارة** » (the lift of the book's opening and the lab's third world); P2, P3 unchanged. `pointPrerequisites`: none (the item has no net predecessor, card).
- **Lab `frost-gauge` « ميزان الصقيع »** (theme `winterdjelfa`, contract `MANIPULATION_CONTRACT.md` § 2novenquinquagies terdecies): the hand holds the LEVEL of a vertical gauge (thermometer, altitude pin, lift cabin) and puts it on a reading given IN WORDS; the pill writes `−3` live; a mirror on the 0 makes the shadow; متقدم: two levels at the same distance, floors, who is farther from the sea. Core maths `packages/core/arithmetic/signedGauge.js`. Reviewed at 768×1024, 1024×768, 1280×800, 1366×768 (initial, mid, wrong, mirror, altitude, floors, free).
- **Bank:** 5 × 10 sheets (5 `term_exam` — `1am-s3-37` ex 1 ×2 and `1am-s2-72` ex 1 ×3, read from the PDFs / 33 modelled / 12 adapted / 0 other `platform_addition`), 16 `MISC-REL-*`; oracle `scripts/practice-oracle/adad-nisbiya-siyaqat.mjs`.
- **Corrections to the card:** see « Generator notes » entry 2 in `docs/curriculum/PLAN_1AM_NUMBERS.md` (the unit has no تحدّ; the « mountain peak » is a 50 m hill on the 10-m gauge; a module 3 طريقة is added).
- **Patterns to reuse:** see the guide's « 1AM unit 5, lesson 1 » bullet (KaTeX negatives inside `MathText`, a vertical-gauge lab with three worlds, `GuidedProblem` role rules, no « is 0 positive? » item).
- **URL:** `/courses/moyen/1am/ansab_al_aadad_wal_hisab/adad-nisbiya-siyaqat`.

### 1AM entry 3 — `talim-mustaqim-mudarraj` « التعليم على مستقيم مدرّج » (1AM unit 5 `adad-nisbiya`, pair 2 A, 2026-10-30) — generated, published locally

- **Shape:** nine modules (0 أستعدّ · 1 نشاط · 2 معارف · 3 طريقة · 4 أتمرّن (eight exercises with `GeoFigure` number lines) · 5–7 مسائل · 8 إختبار أولي), `durationMinutes` 60, programme items **`1am.m5.r06` + `1am.m5.r05`** (as in the catalogue). « أستعدّ » measures `1am.m5.r04` (items 1–3) and `1am.m5.r05` (items 4–6), the two net prerequisites of the item.
- **الكفاءات (draft → final, order kept):** P1 and P3 unchanged; **P2 gains « ولو لم يُعلَّم المبدإ »** (the hidden-origin tasks of متقدم, as in `adad-ashri-mustaqim-mudarraj_P2`). `pointPrerequisites`: **P1 ← `1am_adad-nisbiya-siyaqat_P2`** (net `1am.m5.r05 → r06`), **P2 ← `1am_adad-ashri-mustaqim-mudarraj_P2`**, **P3 ← `1am_adad-ashri-mustaqim-mudarraj_P3`** (net `1am.m5.r04 → r06`); `prerequisiteLessonCodes` gains `adad-nisbiya-siyaqat`.
- **Lab `stride-stamp` « خطوة الطابع »** (theme `villageroad`, contract `MANIPULATION_CONTRACT.md` § 2novenquinquagies quaterdecies): the hand CARRIES a unit stride from the bus stop O to both sides of a village road (ticks `−1, −2, −3` exist only once stamped west; the road is finite, a stride too long cannot reach −3, changing the stride erases the ticks), then the twin of a house, then `A(−3)`, `B(2,7)`, `C(−1,5)`; متقدم: the flag of the origin between two written graduations (−3 and 3; −8 and −2 two by two) and a one-stride frame between two consecutive ticks. Core maths `packages/core/arithmetic/graduatedLine.js`. Reviewed at 768×1024, 1024×768, 1280×800, 1366×768 (initial, mid, road-ends refusal, both sides, twin, houses, origin, frame, free).
- **Bank:** 5 × 10 sheets, 191 questions (6 `term_exam` — `1am-s3-37` ex 1 part 2, `1am-s2-82` ex 2 and `1am-s3-39` ex 2, read from the PDFs, each cited on two sheets / 30 modelled / 14 adapted / 0 other `platform_addition`), 17 `MISC-TALIM1-*`; oracle `scripts/practice-oracle/talim-mustaqim-mudarraj.mjs`. Number lines are `GeoFigure` data (the same drawing as the module's figures).
- **Corrections to the card:** see « Generator notes » entry 3 in `docs/curriculum/PLAN_1AM_NUMBERS.md`.
- **Patterns to reuse:** see the guide's « 1AM unit 5, lesson 2 » bullet (a finite world as a resistance, one lab with five judged task kinds, `GeoFigure` number lines, KaTeX for every negative in a hint, two programme items and their LP edges).
- **URL:** `/courses/moyen/1am/ansab_al_aadad_wal_hisab/talim-mustaqim-mudarraj`.
- **Successor connection:** `talim-mustaqim-mudarraj-2` (2AM, net `1am.m5.r06 → 2am.m4.r01`, consolidates): LP edge P1 ← `1am_talim-mustaqim-mudarraj_P3`; its « تذكّر — السنة الأولى » links to this lesson by itself.

### 1AM entry 4 — `bahth-adad-naqisa` « البحث عن أعداد ناقصة » (1AM unit 6 `ibarat-harfiya`, pair 2 B, SEEDS UNIT 6, 2026-10-30) — generated, published locally

- **Unit seeded:** `lessons/moyen/1am/ansab_al_aadad_wal_hisab/ibarat-harfiya/_unit/` (lessonRoutes, moduleContext, prepDiagnostic + test, unitMeta) and the whole-unit extraction `docs/sources/1am/unit6/` (`build-extraction.py` → `extraction.json`, 51 elements, pp. 77–88; boundary of the four entries written in the header; the تحدّ of al-Kāshī goes to the synthesis; two misprints read and recorded).
- **Shape:** nine modules (0 أستعدّ · 1 نشاط · 2 معارف (platform addition: the book has none) · 3 طريقة (the book's p. 82 method with the platform's numbers) · 4 أتمرّن (seven exercises) · 5–7 مسائل · 8 إختبار أولي), `durationMinutes` 60, programme item **`1am.m5.r10`**.
- **الكفاءات (draft → final, order kept):** P1 explicit with the lab's numbers (« □ + 9 = 54 أو 6 × □ = 54 »); **P3 gains « (ولو كان الناتج كسرًا) » and « كلّ نتيجة »**; P2 unchanged. `pointPrerequisites`: **P2 ← `1am_mana-jam-tarh_P1`** along the net link `1am.m1.r05 → 1am.m5.r10`; P3 has no edge (see Generator notes 4 a).
- **Lab `rewind-belt` « الحزام المعاكس »** (theme `packingline`, contract `MANIPULATION_CONTRACT.md` § 2novenquinquagies quindecies; `packages/core/arithmetic/missingNumber.js`): the hand picks the OPERATION CARD that runs a packing-workshop belt backward, drags the crate from the output tray through the machine to the input bin (the missing number is the crate's number as it crosses), then pushes it forward through the original machine (check by substitution); a wrong card is never corrected (« وضعتَ 63 في الآلة فخرج 72 بدل 54 »); the trap card « 80 − » refuses « + » (134, then −54); متقدم: decimals, « 12,5 − », and `20 ÷ 7` as the fraction `20/7`, checked exactly.
- **Bank:** 5 × 10 sheets, 172 questions (5 `term_exam` — `1am-s3-47` ex 1, `-39` ex 2, `-43` ex 4, `-44` ex 1, `-37` ex 2, all read in the PDFs / 34 modelled / 11 adapted / 0 other `platform_addition`), 11 `MISC-NAQISA-*`; oracle `scripts/practice-oracle/bahth-adad-naqisa.mjs` (exact BigInt rationals; solve, calc, back, eq, calcchoice, verify, tf).
- **Corrections to the card:** see « Generator notes » entry 4 in `docs/curriculum/PLAN_1AM_NUMBERS.md` (P3 edge not written, الكفاءات wording, the unit's تحدّ, the official `a − … = b` form, two textbook misprints, level 2 split in three tasks).
- **Patterns to reuse:** see the guide's « 1AM unit 6, lesson 1 » bullet (a lab whose hand holds an OPERATION CARD and a direction, a two-phase move with a check by substitution, a fraction that is checked exactly, a bank generated from a typed DSL with an oracle spec per question).
- **URL:** `/courses/moyen/1am/ansab_al_aadad_wal_hisab/bahth-adad-naqisa`.
- **Successor connection:** `hall-mushkil-muadala` (2AM, net `1am.m5.r10 → 2am.m4.r08`, extends): its « تذكّر — السنة الأولى » links to this lesson and LP edges written: P2 ← `1am_bahth-adad-naqisa_P3` (the check by substitution), P3 ← `1am_bahth-adad-naqisa_P2` and `_P3` (the inverse operation; the two-step equation undoes a `+` first).

### 1AM entry 5 — `talim-fi-mustawi` « التعليم في المستوي » (1AM unit 5 `adad-nisbiya`, pair 3 A, 2026-10-30) — generated, published locally

- **Shape:** nine modules (0 أستعدّ · 1 نشاط · 2 معارف · 3 طريقة (the book's p. 70 method with the platform's numbers) · 4 أتمرّن (eight exercises: read coordinates, points of an axis, the words, true/false, the hidden frame, points on one line, describing a place, the scale in cm) · 5–7 مسائل · 8 إختبار أولي), `durationMinutes` 60, programme item **`1am.m5.r07`**, `prerequisiteLessonCodes: ['talim-mustaqim-mudarraj']` (unchanged).
- **الكفاءات:** the draft's three, UNCHANGED and in order (P1 the orthogonal frame, P2 reading `M(x ; y)` abscissa first, P3 marking a point on squared or plain paper). `pointPrerequisites`: **P1 ← `1am_talim-mustaqim-mudarraj_P1`, P2 ← `_P2`, P3 ← `_P3`** along the net link `1am.m5.r06 → r07` (the card named P2, P3 only; P1 added, see Generator notes 5).
- **Lab `courtyard-drone` « مسيّرة الساحة »** (theme `schoolcourt`, contract `MANIPULATION_CONTRACT.md` § 2novenquinquagies sexdecies; `packages/core/arithmetic/planeFrame.js`): the hand drives a drone over a school courtyard one axis at a time — horizontal, « ثبّت الأفقي », vertical, « صوّر » —; the drone refuses a diagonal (it shakes); the place is said by its two numbers (fountain `(3 ; −2)`; the swapped order lands on `(−2 ; 3)`) or drawn and read live (gate `(−3 ; 2)`, kiosk `(2 ; −4)`); points of an axis (`(4 ; 0)`, `(0 ; −3)`); متقدم: half tiles, then a map WITHOUT squares where the drone projects its two parallels.
- **Bank:** 5 × 10 sheets, 160 questions (4 `term_exam` — `1am-s3-43` ex 2, `-37` ex 4, `-45` ex 4, `-39` ex 3, all read in the PDFs / 34 modelled / 12 adapted / 0 other `platform_addition`), 15 `MISC-MUSTAWI-*`; oracle `scripts/practice-oracle/talim-fi-mustawi.mjs` (exact BigInt tenths; pairs are `answerType: "point"`).
- **Corrections to the card:** see « Generator notes » entry 5 in `docs/curriculum/PLAN_1AM_NUMBERS.md` (P1 edge, the bank's four read papers, `cognitiveDemand` vocabulary, tall-plane glance height).
- **Patterns to reuse:** see the guide's « 1AM unit 5, lesson 3 » bullet (a lab locked to ONE AXIS at a time, a place said by its numbers is not drawn before the photo, plane figures as `GeoFigure` frames, a bank of pairs in `answerType: "point"`).
- **URL:** `/courses/moyen/1am/ansab_al_aadad_wal_hisab/talim-fi-mustawi`.
- **Successor connection:** `talim-nuqta-mustawi` (2AM, net `1am.m5.r07 → 2am.m4.r04`, consolidates): its « تذكّر — السنة الأولى » links to this lesson by itself and its LP edges are written (see the connection commit and the plan's Generator notes 5).

### 1AM entry 6 — `tatbiq-qaida-harfiya` « تطبيق قاعدة حرفية » (1AM unit 6 `ibarat-harfiya`, pair 3 B, 2026-10-30) — generated, published locally

- **Shape:** nine modules (0 أستعدّ · 1 نشاط · 2 معارف (the definition and the omitted-× conventions of the book's p. 81 with the platform's words, the « تذكّر » for the rectangle's perimeter and area) · 3 طريقة (platform addition: the book has none) · 4 أتمرّن (seven exercises) · 5–7 مسائل · 8 إختبار أولي), `durationMinutes` 60, programme item `1am.m5.r08`.
- **الكفاءات (draft → final, order kept):** P1 gains « دون الخلط مع 2 × 3 = 6 لا 23 »; P2 « كلّ حرف … في كلّ موضع … بالأولويات » with a = 15, b = 8; P3 gains « وإدراك أنّ الأمثلة التي تصحّ فيها لا تثبت صحّتها ». No LP edge in 1AM (the only net prerequisite, `1am.m2.r08`, is unpublished).
- **Lab `letter-dial` « قرص الحروف »** (theme `copyshop`, contract `MANIPULATION_CONTRACT.md` § 2novenquinquagies septdecies; `packages/core/arithmetic/letterRule.js`): the hand holds the VALUE of each letter on a rotary dial; it drops into EVERY slot of the letter and the card computes (`5 × 12 + 20 → 60 + 20 → 80`); a value counts at the release; level 2: `2 × (a + b)` with two dials, then `a + b = a × b` that holds at (2 ; 2) and falls to ONE counterexample.
- **Bank:** 5 × 10 sheets, 177 questions (3 `term_exam` — `1am-s3-47` ex 3, `1am-s3-37` ex 5 ×2, read in the PDFs / 37 modelled / 10 adapted / 0 other), 10 `MISC-TATBIQ-*`; oracle `scripts/practice-oracle/tatbiq-qaida-harfiya.mjs` (own BigInt rationals and expression evaluator).
- **Corrections to the card:** see « Generator notes » entry 6 in `docs/curriculum/PLAN_1AM_NUMBERS.md`.
- **Patterns to reuse:** see the guide's « 1AM unit 6, lesson 2 » bullet.
- **URL:** `/courses/moyen/1am/ansab_al_aadad_wal_hisab/tatbiq-qaida-harfiya`.
- **Successor connections:** `ikhtibar-musawat-mutabayina` (2AM, net `1am.m5.r08 → 2am.m4.r09`, requires): « تذكّر — السنة الأولى » is a live link, LP edges P1 ← `1am_tatbiq-qaida-harfiya_P2`, P2 ← `_P3`; `qimat-ibara-harfiya` (3AM, net `r08 → 3am.m5.r03`, extends): LP edges P1 ← `_P2`, P3 ← `_P3` (its link was already wired).

