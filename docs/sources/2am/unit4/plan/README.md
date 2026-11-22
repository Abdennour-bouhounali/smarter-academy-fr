# 2AM unit 4 « مفهوم معادلة » (`mafhum-muadala`, مقطع 2am.m4) — generation plans (planner, 2026-10-29)

Plans only. Nothing in this folder is a lesson, a lab, a bank or an extraction. A lead generates ONE entry at a time from its plan, in
the order below, and each entry is published (guide §11 « Publish a lesson ») before the next one of its lane starts. Run index, lanes,
generator prompt and the « successor connection » step: [`docs/curriculum/PLAN_2AM_M4.md`](../../../../curriculum/PLAN_2AM_M4.md).
The format is the one of `docs/sources/2am/unit1/plan/` and `docs/sources/2am/unit2/plan/`; each lead appends a « Generator notes »
section to its plan for the deviations.

## The unit in one paragraph

Textbook unit 4, book pp. 54–69 (**PDF = book − 3**: book p. 54 = PDF p. 51; `docs/sources/2am/textbook-map.json`, `pageOffset: 3`;
read in full by the planner on 2026-10-29 at 110 dpi, cut zones at 180–200 dpi). The 1AM student applies a literal rule
(`1am.m5.r08`, home `tatbiq-qaida-harfiya`), produces a simple literal expression (`1am.m5.r09`, `intaj-ibara-harfiya`) and completes
an equality « a + … = b », « a − … = b », « a × … = b » (`1am.m5.r10`, `bahth-adad-naqisa`) — **all three 1AM home lessons are
`coming_soon`**: their content is RECALLED (« تذكّر — السنة الأولى », no link) and measured by « أستعدّ », never rebuilt, and no 1AM
LP edge is written (LEARNING_NET §4.8). This unit adds four things. (1) **Literal expressions** produced from a situation or by
GENERALISING a growing pattern, evaluated for given values of one or two letters, and written in the simplified way (× dropped before a
letter or a bracket, 1 × a = a, 0 × a = 0, a², a³, k·a + m·a = (k + m)·a) — the book teaches it, the 2022 plan has no 2AM item for it
(`ibara-harfiya-intaj`, `programmeItems: []`, owner decision D10). (2) **Testing** an equality or an inequality with one or two
unknowns by substitution, the counterexample that proves two expressions different, the values that make an inequality true among
given ones (`2am.m4.r09`, `ikhtibar-musawat-mutabayina`). (3) **Equations** « a × x = b », « x ÷ a = b », « a ÷ x = b » with decimal
a and b, solved by the inverse operation, the word « حلّ », and translating a situation into an equation (`2am.m4.r08`,
`hall-mushkil-muadala`). (4) The synthesis. Downstream (published 3AM): `musawiyat-amaliyat` and `mutabayinat-amaliyat` (r09 → 3am.m5.r05)
and `muadalat-darajat-ula` (r08 → 3am.m5.r06, `extends`, which already carries a « تذكّر — السنة الثانية » toward `hall-mushkil-muadala`).
4AM is reached only through these 3AM lessons.

## Entries, in generation order (the run order, NOT the catalogue order)

| # | Pair · lane | Code [catalogue order] | Title | Items | Lab (new type) | What the hand holds | Gesture · drawn world | Faithful `term_exam` (honest) | Plan |
|---:|---|---|---|---|---|---|---|---:|---|
| 1 | 1 · B (5174) | `ibara-harfiya-intaj` [18] | إنتاج عبارة حرفية واستعمالها | — (« isolée ») | `wax-cells` « خلايا الشمع » | n, the NUMBER OF CELLS of a row of hexagonal wax cells (rods shared), then the typed rule | drag cells from the tray and snap them onto the row (or lift one back) + type a rule · `apiary` « منحل الجدّ » | 0 read, 5–7 expected | [`ibara-harfiya-intaj.md`](ibara-harfiya-intaj.md) |
| 2 | 2 · B | `hall-mushkil-muadala` [20] | حلّ مشكل باستعمال معادلة | r08 | `juice-line` « خطّ العصير » | x, the UNKNOWN: the capacity of the bottle mould (a ÷ x = b), or the juice in the tank (x ÷ a = b) | stretch the mould (or the tank level), then « املأ » — two test fills per task · `juicery` « معصرة البرتقال التعاونية » | 2 read, 7–9 expected | [`hall-mushkil-muadala.md`](hall-mushkil-muadala.md) |
| 3 | 4 · B | `ikhtibar-musawat-mutabayina` [19] | اختبار صحة مساواة أو متباينة | r09 | `bridge-load` « حمولة الجسر » | x and y, the NUMBERS OF SACKS loaded on a truck (one load feeds two trucks in the equality tasks) | carry sacks (1 or a pallet of 5) onto the truck bed, then « اعبر » onto the weighbridge · `weighbridge` « جسر الوادي وميزانه » | 4 read, 6–8 expected | [`ikhtibar-musawat-mutabayina.md`](ikhtibar-musawat-mutabayina.md) |
| 4 | 5 · B | `wadiya-idmajiya-mafhum-muadala` [21] | أدمج تعلّماتي — مفهوم معادلة | — | none (synthesis) | — | — | 0 read, 3–5 expected | [`wadiya-idmajiya-mafhum-muadala.md`](wadiya-idmajiya-mafhum-muadala.md) |

« Read » = exercises whose text the planner actually read on 2026-10-29 (text layers of `2am-s2-50`, `-72`, `-73`, `-75`, `2am-s3-39`,
misfiled `1am-s2-79`); « expected » = after the lead renders the indexed papers without a usable text layer (`pdftoppm -r 150`). A sheet
is `term_exam` ONLY when its exercise was read.

**Lab distinctness.** Three gesture families (build a row by snapping cells · stretch a container then run a fill · carry sacks then run
a weighing) and three worlds, all new: `wax-cells`, `juice-line`, `bridge-load` and the themes `apiary`, `juicery`, `weighbridge` are
free in `manipulationRegistry.js` / the themes used in `lesson.config.js` on 2026-10-29 (`bakery` — 1AM `hasil-qisma-kasr` —, `zellige`
— 4AM `khawas-dawaran`, `tile-yard`'s courtyard — and `bridge` — a 4AM synthesis — are taken: hence no dough divider, no zellige border,
no plain « bridge »). None reuses or reskins:
- the equation / substitution labs: `equation-balance` (4AM: the CONTENTS of two pans — the book's act-3 balance is therefore an exercise,
  never a lab), `solution-ray` (4AM: a probe x on a ray, traces true / false), `marble-run` (3AM: a value travels down an expression
  tree), `growth-race`, `term-ferry`, `equality-lanes`, `loom-threads`, `difference-meter`, `pair-scoreboard` (4AM: both numbers of a pair
  under two handles, read by the two equations of a SYSTEM), `story-modeller`, `linear-machine` (input cards into a hopper);
- the quantity / division labs: `mooring-lines` (2AM unit 2: the candidate QUOTIENT laid along a rope), `egg-trays` (2AM: the dividend
  in trays — hence the book's egg activity is not the hall entry), `group-tanks` (a class tank, a mean), `scoop-scale`, `bucket-fill`;
- the pattern / tile labs: `tile-yard` (1AM: one tile carried to measure an area), `square-tiling` (4AM: k tiles per side, roots);
- 2AM m1 labs `tram-route`, `coop-calculator`, `chain-cutter`, `kit-packer` (dispensers filling k kits — the closest kin of `juice-line`:
  its plan §6 says why not), `mooring-lines`, `trail-odometer`, `window-blinds`, `level-laser`;
- 2AM unit 3 (planned in parallel, `docs/sources/2am/unit3/plan/README.md`, read 2026-10-29): `corniche-ruler`, `balloon-ballast`,
  `tug-rope`, `dig-grid`, `gap-caliper`, and the published `zero-probe`. No name, theme or `MISC-*` prefix collides.

Each plan's §6 « Why not another lab » names its closest kin. Leads re-grep `manipulationRegistry.js` and the themes before generating.

## The run order and the book order — renvois

The book order is ibara (act. 1–2, معارف 1–2, طرائق p. 59) → ikhtibar (act. 3, معارف 3–4, طريقة « اختبار مساواة » p. 61) → hall (act. 4,
معارف 5, طريقتا « ترجمة مشكلة بمعادلة » و « حلّ معادلة من الشكل a/x = b » p. 61). The catalogue order (18, 19, 20) follows the book and
is NOT changed (owner question 1). The run generates hall (pair 2) BEFORE ikhtibar (pair 4) because of the net link `2am.m4.r06 → r09`:
ikhtibar needs `majmu-jabri` (unit 3, pair 3) published.

**No renvoi is created, in either order:**
- **hall before ikhtibar (run order).** hall checks a candidate only in a ONE-OPERATION equation: it computes a ÷ x (or a × x, x ÷ a)
  and compares the result with b — a computation (`kasr-hasil-qisma`, 1AM r10), not the r09 skill of computing TWO members. hall's
  translation step (طريقة 1: « x + 150 = 2x + 60 ») is translated and never tested. The book's prerequisite « اختبار صحة مساواة » for
  hall is satisfied by the 1AM « إتمام مساواة » (recalled).
- **ikhtibar before hall (catalogue order, what the student sees).** The words « معادلة » and « حلّ » belong to hall (book معارف 5
  p. 60 → hall M2). ikhtibar never uses them: it says « المساواة صحيحة / خاطئة من أجل x = … » and « القيم التي تجعل المتباينة صحيحة ».
  So ikhtibar has NO « تذكّر » toward hall, and hall's `prerequisiteLessonCodes` do not list ikhtibar. Had ikhtibar needed « حلّ », it
  would have been a renvoi en avant toward a later catalogue lesson — avoided by design, not by a link.
- The synthesis (last) mobilises all three.

## Seeding the unit and the whole-unit extraction (entry 1 does both)

The unit is **NOT seeded**: there is no `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/mafhum-muadala/` and no
`docs/sources/2am/unit4/` (except this folder). The lead of `ibara-harfiya-intaj`:

1. seeds `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/mafhum-muadala/_unit/` — a copy of `…/kusur-amaliyat/_unit/`
   (`unitMeta.js` with `UNIT_ID 'mafhum-muadala'`, `UNIT_TITLE 'مفهوم معادلة'`, `CHAPTER_ID 'ansab_al_aadad_wal_hisab'`,
   `CHAPTER_TITLE 'ميدان الأنشطة العددية'`, `GRADE_ID '2am'`, `GRADE_LABEL 'السنة الثانية متوسط'`, `PRINT_SUBJECT 'الرياضيات · السنة
   الثانية متوسط'`, `src`, `addition`, header « pp. 54–69, source docs/sources/2am/unit4/extraction.json »; `lessonRoutes.jsx`,
   `moduleContext.js`, `prepDiagnostic.jsx` + `prepDiagnostic.test.js` compared with the unit's `available` catalogue lessons);
2. writes `docs/sources/2am/unit4/build-extraction.py` → `extraction.json` for the WHOLE unit (book pp. 54–69 = PDF 51–66; render with
   `pdftoppm -r 110`, 180–200 dpi crops for the cut zones; answers computed with `fractions.Fraction` / `decimal.Decimal`, never typed;
   `verified: True` for the elements of entry 1, `False` for the others — their lesson re-reads them). Shape: copy
   `docs/sources/2am/unit2/build-extraction.py` (helpers `dec`, `fr`, `frac`, `q`; `DEST`, `DISCREPANCIES`, `PENDING` lists). The
   **boundary block below goes in its header, once**, and the discrepancies below go in `DISCREPANCIES`;
3. writes `docs/sources/2am/unit4/brief-authors.md` if the lab or the bank is delegated (model: `docs/sources/2am/unit2/brief-authors.md`);
4. extends `packages/core/arithmetic/substitution.js` and creates `packages/core/arithmetic/equation2.js` (below) with its E1 functions.

### Element ids and destinations (planned)

Module numbers: 0 أستعدّ · 1 نشاط · 2 معارف · 3 طريقة · 4 أتمرّن · 5–7 مسائل · 8 إختبار أولي; `None` = bank only. **I** =
`ibara-harfiya-intaj`, **H** = `hall-mushkil-muadala`, **T** = `ikhtibar-musawat-mutabayina`, **S** = the synthesis. Every element is
ANALYSED then redesigned (own numbers and contexts); a destination says where its IDEA serves.

| Element (book p.) | Content (read 2026-10-29) | Destination |
|---|---|---|
| `objectives` (54) | the two « سأتعلّم » lines (test an equality / inequality; solve « a ÷ … = b ») | `{ lesson: 'unit', module: 'page' }` |
| `opener` (54) | al-Khwarizmi (781–847) called the unknown « شيء »; Spanish « xei », then « x » | I m2 « هل تعلم » (platform words) |
| `challenge` (54) | apple trees planted in n × n squares, wind-resistant trees around them, figure for n = 1…4: how many of each kind for any n? | unit page with the REWRITTEN text below (`challenge.sourceElementId: 'challenge'`), `duplicatedIn` I m1 (the lab's idea) |
| `prep` (55), items 1–10 | 1 36 − 10 − 6 · 2 36 − (10 − 6) · 3 12 + 4 × 3 · 4 3 × (2 × 3 + 7) · 5 the sum of a and b · 6–9 a length AB on a figure (9 − x, 12 − x, 6x, 7 + 2x) · 10 perimeter of a pentagon (sides 2x, 3) | 1–5 → I m0 ; 6–9 → H m0 (a length in terms of x) ; 10 → I m4 |
| `act-1` (56) | square tables joined in a row, one chair per free side; 1, 2, 3, 10, 51 tables; a sentence; a formula | I m4 (application, own tables: 6n + 2) |
| `act-2` (56) | sports club 2000 DA + 150 DA per session; 10, 50, 100 sessions; a spreadsheet from 1 to 100 (bottom cut) | I m5 (redesigned: the municipal pool card, 1500 + 120x) |
| `act-3` (57) | balance: 3 cubes = 2 balls + 200 g, 3 × c = 2 × b + 200, (b, c) = (10, 70), (20, 80); 7x + 8 = 12x − 4 at x = 6; 9x + 8 = 7x + 10 at x = 1; 10x − 2 < 55 − 3x among « …, 5, 6, 7 » (first values cut) | q1–q2 → T m4 (an exercise, own masses — never a balance lab) ; q3 → T m4 ; q4 → T m4 |
| `act-4` (57) | a farmer: 5760 eggs, two loads of 240 trays; match 240x = 5760, 480x = 5760, 5760/x = 480; solve 1/3 × x = 21,7, x/250 = 1/5, 489/x = 163, 258,6/x = 21,55 | q1–q2 → H m4 (redesigned: dates in boxes — the egg world is `egg-trays`') ; q3 → H m4 |
| `know-1` (58) | definition « العبارة الحرفية »; perimeter of a square 4 × x; « اختر عددًا، اضربه في 2، اطرح 3 » → 2x − 3 | I m2 |
| `know-2` (58) | simplifying: × dropped before a letter / bracket (7a, 7(a + 1), 7a + 3b); 1 × a = a, 0 × a = 0, a × b = b × a; a², a³; 2a + 5a − 3a = 4a; 10², 10³ | I m2 (rules) ; examples → I m3 |
| `method-1` (59) | in terms of x: Amine's 50 + x stamps, Ayman's 5x cars in 5 boxes, a perimeter 22 + 6x | I m3 (own contexts) |
| `method-2` (59) | coloured border tiles of a square: 4 × 5 + 4, 4 × 6 + 4, 4 × 7 + 4 → 4n + 4 « for n tiles on the side » (discrepancy 3) | I m3 (redesigned: a square basin of n × n tiles and its border) |
| `now-59` (59) | ① AB = x + y + 2 ; ② « × 2, + 13 » for 0 and 5 | I m4 |
| `know-3` (60) | test two expressions: 2x + 3 vs 5x at 4 (11 ≠ 20); 2(x + 3) = 2x + 6 always; one counterexample suffices; x² + 9 vs 4x + 6 (equal at 1 and 3, not at 0) | T m2 |
| `know-4` (60) | test an inequality: 4 + 6x < 27 true for 3, false for 4 | T m2 |
| `know-5` (60) | « المعادلات »: values making A and B equal are the solutions of A = B (bottom cut) | H m2 |
| `method-3` (61) | test x + 5 = 3x − 7 for x = 6 (11 = 11) and x = 2 (7 ≠ −1), the table « النتيجة » | T m3 |
| `method-4` (61) | translate: Amine (x + 200), Sylia (3x + 100), equal spending → x + 200 = 3x + 100 (discrepancy 1) | H m3 (own story; translation only, never tested) |
| `method-5` (61) | 84/x = 14: 14 × x = 84, x = 84/14 = 6, check (discrepancy 2) | H m3 |
| `now-61` (61) | ① 2 + 7x = 9x at x = 1, 3; true for every x? ② 40/x = 16 | ① → T m4 ; ② → H m4 |
| `ex-1` … `ex-13` (62–63) | n: half, next, previous, double, square, quarter; lists → an instruction (9 × n + 7, 5 − 4 + n, (5 + n) × 4); lengths in x; perimeters (isosceles, rectangle ℓ, a composite figure); angles in x; a program « × 3, + 7, half » and three pupils' writings | I (`ex-1`, `ex-2`, `ex-5`, `ex-13` → m4 ; the rest → bank) |
| `ex-14` … `ex-20` (63, right edge cut) | A = 3x + 5 at 3, 4, 5; B = 2 − 5x at 0, 1, −1; C = 100x + 25 at 0,25, 0,5, 12,5; 3x + 4y + 1 at (2, 3), (4, 9); a table of 4x − 5, 6x + 25, 3(x + 5); simplify ½ × a, 5 × (a + b), 2 × a × a, 7 × a × b; match equal writings | I (`ex-14`, `ex-17`, `ex-19` → m4 ; `ex-15` (negative values) → bank after unit 3 ; the rest → bank) |
| `ex-21` … `ex-23` (63) | simplify 2a + 0 × b − 4 + a, 3a × b − 3a − 3ab, c + c × c + c, a × a − 2 × a × b + b × b; 5x + 2x + 3 × 8 (terms, common factor); show the hidden × (7x, 2x + y, 3(2x + y), x³, 2x² + 12) | I (`ex-21`, `ex-22` → m4 ; `ex-23` → bank) |
| `ex-24` … `ex-26` (63) | values at x = 3; at a = 3, b = 4, c = 10; at x = 2, y = 3 | I bank |
| `ex-27` … `ex-31` (64) | 28 + 4x = 9x − 2 at 6; a table 1 + x = 2x + 0,2 and 2 + 2x = 2(x + 1) at 2, 5, 0,2; −4 + 6x = 2(x + 8) at 5, 7; which of x + 2x = 3x², 2x + 4x = 8x², 3 + 4x = 7x, 3(x + 5) = 3x + 15 are true; 6x + 7 = 22 among 1, 1,5, 2, 2,5 | T (`ex-27`, `ex-28`, `ex-30`, `ex-31` → m4 ; `ex-29` → bank) |
| `ex-32`, `ex-33` (64) | writings equal to 4n + 4; other writings of 6n + 14 | T bank (P2: equal for every n, not « for one value ») |
| `ex-34` … `ex-39` (64) | mental missing numbers (+, −, ×, ÷); □ in 150 − □ = 75, 0,5 × □ = 2, 24 − □ = −6, 121/□ = 11, 0,47/□ = 0,1; x/7 = 11, 21/x = 3; 169/x = 13, 145/x = 29, 47/x = 0,1, 2530/x = 0,01 | H (`ex-34` → m0 ; `ex-37`, `ex-38`, `ex-39` → m4 ; `ex-35`, `ex-36` → bank) |
| `ex-40` (64) | Amine's 75 cm step, the giant's three times longer; after x steps Amine is 15 m behind | H m5 (redesigned) |
| `ex-41` … `ex-43` (64) | **missing from the scan** (page bottom cut) | — (`DISCREPANCIES`) |
| `self-1` … `self-11` (65) | QCM: program → 3(x + 1/2); program → (x + 1) × 3 − 2 = 3x + 1; 5 × n + 1 list; A = 7 + 3(2x − 5) at 4 → 16; 6x + 4 at 3,5 → 25; 3(5x + 4) = 3 × (5 × x + 4); 73x + 27x at 43,75 → 4375; 3x + 20 = 8x → 4; 5(x − 2) and 5x − 10 equal for all x; area 9 × x → 9x; 40,6/□ = 58 → 0,7 | I bank (1–7, 10) ; T bank (8, 9) ; H bank (11) |
| `deep-44` … `deep-47` (66) | edges of a box (42 cm, x); squares ABCD and AEFG (areas in x and y); a 10 cm string rectangle (x and 5 − x; area at 3); matchstick triangles in a row (2n + 1) | I (`deep-46` → m6 redesigned ; `deep-47` → bank ; `deep-44`, `deep-45` → bank) |
| `deep-48` (66) | open problem: the number of diagonals of a polygon with x sides | I bank (« مشكل مفتوح », selfCheck) |
| `deep-49`, `deep-50` (66) | 5(x + 6) + 5 = 5(x + 8) − 5 and 4(x + 3) − 8 = 4(x + 1): test, conjecture « always », justify | T m5 / bank (`deep-49` → bank ; `deep-50` idea → T m7 redesigned) |
| `deep-51` (66) | 46 × 35 in column = 230 + 1380: explain (distributivity) | I bank |
| `deep-52` (66) | program: n, + its successor, × 2, − 2, ÷ 4 → gives back n | I m7 (redesigned program « + 4, × 2, − 2x » → always 8) |
| `deep-53` (67, right edge cut) | spreadsheet: 3x + 7 = 31 with x from 0 to 10 | H bank |
| `deep-54`, `deep-55` (67) | « the sum of three consecutive naturals = 3 × the middle one »; n + n = n × n at n = 0 — always? | T m7 (`deep-54` redesigned with a counterexample twin) ; `deep-55` → T m4 |
| `deep-56` (67) | translate by an equation: temperature +10 °C → 9 °C (needs −1); ages differ by 9, Amine 10; a 9 cm² rectangle of length 10 cm | H m4 (the rectangle, own numbers) ; the rest → H bank |
| `deep-57` (67) | a dialogue: perimeter of a triangle x, x − 2, x + 2 is 27 for x = 9 | T bank |
| `deep-58` (67) | angles x, 2x, 3x of a triangle → x = 30 | S bank (like terms then a × x = b) |
| `deep-59` (67) | a sheet with a notch: perimeter and area in x; P = 45 cm → x | H bank (figure re-read at 200 dpi) |
| `deep-60` (67) | four numbers with difference 2: the sum is a multiple of 4 | T bank (selfCheck proof) |
| `deep-61` (67) | three fuel tanks, B = A + 150, C = 2B, total 3000 L → A = 637,5 L | **not used** (4x + 450 = 3000 needs grouping and a two-step decimal equation: 3AM `muadalat-darajat-ula`) |
| `integration` (68) | club A 1300 DA + 150 DA / session, B 800 DA + 170 DA; table; when equal (n = 25), when B is cheaper (n < 25) | S m1 (redesigned: a computer club, 1200 + 150n vs 600 + 180n, equal at 20) |
| `evaluation` (68) | braking distance D = V × V / 203,2 (dry) or / 101,6 (wet); a car at 130 km/h, an animal at 150 m | S m2 (redesigned: a workshop's shoe-size rule P = 1,5L + 2 — exact values, a value, an equation, a decision) |
| `ict` (69) | act: (x + 3) × 2 + 2x = 48 by a spreadsheet in steps of 0,5 (x = 10,5); « دوري الآن »: 2x + 3 = 3x − 1 by a table of x = 0…11 (x = 4) | act → S m6 (redesigned program) ; « دوري الآن » → T m4 (own: 3x + 2 = 5x − 6, x = 4) |

**Discrepancies to record** (`DISCREPANCIES`; never shown to students):
1. `method-4` (p. 61): the solution's last line prints « x + 200 = 3 × x + 1000 »; the statement and the comment give 100.
2. `method-5` (p. 61): the method box says « البحث عن قاسم مجهول يؤول إلى حساب **جداء** عددين » — the computation is a QUOTIENT
   (x = 84 ÷ 14); the second calculation arrow « 84 ×x→ 14 » should read « 14 ×x→ 84 ». The platform writes « … يؤول إلى حساب حاصل
   قسمة » (H M3).
3. `method-2` (p. 59): « مربّع له n بلاطة على ضلعه » with « 4 × n + 4 » — a square with n tiles per side has 4n − 4 border tiles; the
   book's count is the border AROUND an n-tile square. The platform always says « حوض من n × n بلاطة، يحيط به إطار » (I M3).
4. `act-3` q4 (p. 57): the list of values is cut on the right edge (« … ، 5 ، 6 ، 7 »); the first value(s) are illegible
   (10x − 2 < 55 − 3x is true for x ≤ 4 only, so the printed list must contain a value ≤ 4).
5. `act-2` q3 b–c (p. 56): cut at the page bottom.
6. `ex-41` … `ex-43` (p. 64): absent from the scan (the page bottom is cut after `ex-40` and `ex-33`).
7. `ex-14` … `ex-20` (p. 63) and `deep-53` … `deep-57` (p. 67): numbers and line starts cut on the right edge; their numbering is
   inferred from the sequence.
8. `know-5` (p. 60): the end of the definition and its example are cut at the page bottom (« … تعطيان نفس النتيجة 5 »).
9. `integration` (p. 68): « الصيغة A » then « النادي B » (naming); both formulas cost 5050 DA at n = 25.
10. Negative values in the book (`ex-15` B = 2 − 5x at x = 1, −1; `ex-36` 24 − □ = −6; `deep-56` +10 °C → 9 °C): legitimate after
    unit 3, but see owner question 10 (run order) before using them in I and H.
11. `deep-61` (p. 67): out of the 2AM scope (above).

## Boundaries (written ONCE here; copy into `build-extraction.py`'s header)

- **`ibara-harfiya-intaj` (no item)** = a letter stands for an unknown or variable number; writing a literal expression from a
  situation, from a calculation program, or by GENERALISING a growing pattern (kn + c read off the drawing); its value for given values
  of one or two letters (priority rules recalled from unit 1), organised in a table of values; the simplified writing: × omitted before a
  letter or a bracket, 1 × a = a, 0 × a = 0, a × b = b × a, a × a = a², a × a × a = a³, and k·a + m·a = (k + m)·a READ AS A FACTORISATION
  (unit-1 `tawzi-darb-jam-tarh` P3, recalled). It never solves an equation, never tests an equality or an inequality (it may OBSERVE
  that two writings of the same count give the same table — never « for every value »: that is T P2), never expands a product of two
  brackets (3AM `nashr-jabri-3am`), never removes brackets preceded by − (3AM `tabsit-hadhf-aqwas`), never computes with negative values
  (run order: owner question 10).
- **`hall-mushkil-muadala` (r08)** = an equation is an equality with an unknown named by a letter; its solution is the value that makes
  it true, checked by computing the one operation; translating a situation into an equation after naming the unknown; solving
  « a × x = b », « x ÷ a = b » (also written x/a = b) and « a ÷ x = b » (a/x = b) with decimal a and b (a ≠ 0) by the inverse operation
  (missing factor → quotient, missing dividend → product, missing divisor → quotient), the 1AM « a + … = b », « a − … = b » recalled;
  a two-step equation k·x + c = d or (x + c) ÷ k = d solved by undoing the LAST operation first (owner question 2), every intermediate
  value ≥ 0. It never puts x on both sides to solve them (3AM `muadalat-darajat-ula`), never tests a two-member equality (T), never
  « moves a term » or applies an operation to both sides (3AM `musawiyat-amaliyat`).
- **`ikhtibar-musawat-mutabayina` (r09)** = substitute a given value (or a pair of values) in both members of an equality or an
  inequality (<, >, ≤, ≥), compute each member (priorities, algebraic sums of unit 3) and compare; find, among GIVEN values, those that
  make it true; two literal expressions are equal when they give the same value for EVERY value of the letter (justified by a known rule,
  e.g. distributivity) — one counterexample proves they are not, and equal values for some values prove nothing. It never uses the words
  « معادلة » / « حلّ » (H), never solves (no inverse operation, no list beyond the given values), never transforms an equality or an
  inequality (3AM `musawiyat-amaliyat`, `mutabayinat-amaliyat`).
- **Synthesis** = no new notion: six training situations + the analysed final situation + the final test.

## Shared maths — extend `substitution.js`, one new module `equation2.js`

Do NOT re-implement; import BY PATH (never the core barrel, BUNDLE_BOUNDARIES §3–§4):
- `substitution.js` (3AM `qimat-ibara-harfiya`): `parseExpression` (numbers incl. decimals, x, y, + − × ( ), ², ³, implicit « 3x »),
  `evaluate(tree, env)`, `trace`, `treeTex`, `treeText`, `writeLine`, `toTerms`, `samePolynomial`, `witness(a, b, candidates)`;
- `powers.js`: `rat`, `parseRat`, `add`, `sub`, `mul`, `div`, `eq`, `sign`, `ratText`, `ratTex`;
- `chainOps.js` (2AM unit 1): `lastOperation`, `describe` (a program's last operation — H's « undo the last operation first »).

**Extension of `substitution.js` (E1, non-breaking):** `parseExpression(text, { letters })` — an optional list of accepted letters
(default `['x', 'y']`, the 3AM callers unchanged); the 2AM lessons pass `['n', 'x', 'y', 'a', 'b']`. Its test gains a case per new letter
and keeps every 3AM case green. Nothing else changes in that file.

**New `packages/core/arithmetic/equation2.js`** (2AM, pure, exact on `powers.js` rationals, tested in `equation2.test.js`), grown entry by
entry:

| Added by | Functions |
|---|---|
| E1 `ibara-harfiya-intaj` | `valueTable(text, letter, values, env?)` → rows `{ v, value, line }` (the line in the textbook's form « 5 × 40 + 1 = 201 ») · `firstMismatch(textA, textB, letter, values)` → the first value where they differ, or `null` (wraps `witness`) · `simplified(text)` → the simplified writing (× dropped, 1·a, 0·a, a², a³, k·a + m·a) built from `toTerms`, and `showTimes(text)` (the hidden × written back, `ex-23`) · `sameCount(textA, textB)` (`samePolynomial`) |
| E2 `hall-mushkil-muadala` | `solveForm({ form: 'times' \| 'over' \| 'under' \| 'plus' \| 'minus', a, b })` → `{ x, inverse: '÷' \| '×' \| '−' \| '+', line }` (a decimal or a fraction, exact; refuses a = 0, and an x ≤ 0 unless asked) · `checkForm(form, x)` → `{ value, holds, line }` · `undoChain({ k, c, d, order: 'times-first' \| 'plus-first' })` → the two steps (undo the last operation first) with `chainOps.lastOperation` · `formOf(text)` (reads « 2,5x = 10 », « x/0,4 = 15 », « 56/x = 7 ») |
| E3 `ikhtibar-musawat-mutabayina` | `parseRelation(text)` → `{ left, rel: '=' \| '<' \| '>' \| '≤' \| '≥', right }` (trees of `parseExpression`) · `testAt(relation, env)` → `{ leftValue, rightValue, holds, lines }` (the textbook table « النتيجة ») · `whichHold(relation, letter, values)` · `identityVerdict(textA, textB, candidates)` → `'always'` (`samePolynomial`) / `{ counterexample }` |

Each lab keeps its own state logic in `apps/web/src/lessons/common/manipulations/logic/<lab>.js` on top of this module. Oracles never
import it (`scripts/practice-oracle/<code>.mjs` uses its own BigInt code).

## The unit's تحدّ and where it goes

The book's تحدّ (p. 54) is apple trees planted in n × n squares with a ring of wind-resistant trees. The units file
(`units_2am_2026_2027.json › mafhum-muadala.challenge.textAr`) copies it verbatim (independence rule). Its idea — count a growing pattern
for ANY n — is the entry of entry 1 (lab `wax-cells`). **Proposed rewrite** (own context, self-contained, verified: 5 × 40 + 1 = 201 and
5 × 30 + 1 = 151):

> « يصنع ياسين صفًّا من خلايا سداسية متلاصقة بأعواد الشمع: الخلية الواحدة تحتاج 6 أعواد، والخليتان 11 عودًا. كم عودًا يحتاج لصفّ من
> 40 خلية؟ ومعه 151 عودًا: كم خلية يصنع بها كلّها؟ »

with `challenge.sourceElementId: "challenge"` and the destination `{ lesson: 'unit', module: 'page', duplicatedIn: I m1 }`; the second
question (an equation 5n + 1 = 151) is answered in the synthesis (S m5). Entry 1's lead applies it (owner question 8).

## Corpus at a glance (`docs/sources/moyen/exams/exams-index.json`)

104 exercise rows touch an item of `2am.m4` (coverage table of `EXAM_PATTERN.md`), but most are unit 3 (relative numbers). **r08: 24 rows,
r09: 16 rows**, in 21 papers, almost all term 2 (`EXAM_PATTERN.md` §4 « 2AM S2 »): exercise 1 or 2 = « حلّ المعادلات » (a + x = b,
a × x = b, a ÷ x = b) and « اختبر صحة المساواة / المتباينة من أجل … »; the « الوضعية الإدماجية » = a plot or a house « بدلالة x »
(perimeter expression → an equation → a cost), or a truck before a bridge limited in mass (an inequality with two unknowns). Literal
expressions without an r08/r09 tag (`1am.m5.r09` in 2AM papers): `2am-s2-69` ex 4, `2am-s3-30` ex 5, `-37` ex 5, `-39` ex 4,
`2am-s1-87` ex 2.

- **Read for this plan (text layer):** `2am-s2-50` (ex 2: equations — fractions garbled — and 1 − 3x = 2 − 4x at x = 1, 0,5; ex 5: a
  plot, choose 2x + 240 among three expressions, P = 300 → x, fence with a 2 m gate at 150 DA/m, areas, x = 30), `2am-s2-72` (ex 2:
  13x = 169, x + 7 = 2, 36/x = 9; ex 5: the truck 50x + 80y + 5000 < 7500 at (10, 30) and (8, 25), a path in terms of b), `2am-s2-73`
  (ex 2: 3x − 1 = 4x − 2 at 3 and 1, 2x + 5 < 15 at 6; ex 5: a plot p = 2x + 240, areas, x = 30), `2am-s2-75` (ex 1: equality and
  inequality — formulas are images; ex 5: a garage and a house perimeter in x, P1 = 24 m → x; a truck with cement bags before a 5,5 t
  bridge), `2am-s3-39` (ex 2: 2x − 4 = 3x − 7 at 4, 5y − 8 ≤ 20 − 2y at 3, three missing-number equations; ex 4: a sports hall in x,
  x = 8), misfiled `1am-s2-79` (a 2AM term-2 paper; ex 2 q2: two equations; ex 5: 9 lanterns + 630 DA = 14 lanterns, test x = 180,
  126, 75).
- **Not read** (each lead renders them before claiming them): `2am-s2-52` (ex 1, ex 5), `-53` (ex 1, ex 5), `-56` (ex 2, ex 5), `-59`
  (ex 2, ex 5), `-69` (ex 1, ex 4), `2am-s3-25` (ex 2, ex 5), `-30` ex 5, `-31` ex 1, `-37` ex 5, `-41` (ex 1, ex 5), `-44` ex 1,
  `-46` ex 4.
- **Not usable** for a 2AM bank: the 3AM papers `3am-s2-80` ex 5, `3am-s2-81` ex 2, `3am-s3-47` ex 1, `3am-s3-57` ex 1 (badge grade
  = 3AM). `2am/2AM.pdf` is a commercial book (`adapted` only).
- **Corpus anomalies found:** `2am-s2-73` ex 5 « p = 033 m » on the text layer (reversed digits: read the scan, likely 300);
  `2am-s2-75` ex 5 « 3058 kg », « 58 kg », « 5588 kg » (garbled: read the scan); `2am-s2-50` ex 2 fractions unreadable on the text layer;
  `2am-s3-39` ex 2 « 16/(2x) = 4 » and « 3x ÷ 6 = 2 » are two-step equations (owner question 2); `2am-s2-72` ex 2 « x + 7 = 2 » has a
  negative solution (owner question 10); `1am-s2-79` is filed under 1AM but its header says « الثانية متوسط » (badge = 2AM term 2,
  `EXAM_PATTERN.md` « misfiled »).
- **One paper part, one sheet.** The plans share the term-2 integration situations by PART (a « الجزء » or a numbered question group):
  `2am-s2-50` ex 5 part 1 → H, part 2 (the fence) → S, part 3 → I; ex 2 q1 → H, ex 2 q2 → T; `2am-s2-73` ex 5 part 1 → H, part 2 → I; `2am-s2-72` ex 5 part 1 →
  T, part 2 → I; `2am-s2-75` ex 5 part 1 → H, part 2 → T; `2am-s3-39` ex 2 → T (q3, a hall step, `counted: false`), ex 4 → I. No paper
  part is `term_exam` on two sheets.

## Misconception id prefixes (free in `content/practice/misconceptions.json` on 2026-10-29)

`MISC-IBARA2-*` (E1) · `MISC-MAJHUL-*` (E2) · `MISC-IKHTIBAR-*` (E3) · `MISC-SYN-MUAD2-*` (E4).
Taken and NOT to be used: `MISC-MUADALA-*`, `MISC-MUSAWIYA-*`, `MISC-MUTABAYINA-*`, `MISC-HALL-*`, `MISC-QIMA-*`, `MISC-TABSIT-*`,
`MISC-NASHR-*`, `MISC-TAWZI-*`, `MISC-WASF-*`, `MISC-SILSILA-*`, and unit 3's `MISC-JABRI-*`, `MISC-JAMNISB-*`, `MISC-SYN-NISB2-*`.
Re-grep before writing.

## Successor connection (summary — details in each plan § « Successor connection »)

| 2AM lesson | Successor (status) | LP edges ← | Net link | « تذكّر — السنة الثانية » |
|---|---|---|---|---|
| `hall-mushkil-muadala` | `muadalat-darajat-ula` (3AM, published) | **P1 ← `2am_hall-mushkil-muadala_P2`** (what a solution is) · **P4 ← `2am_hall-mushkil-muadala_P1`** (translate a situation after naming the unknown) | `2am.m4.r08 → 3am.m5.r06` (extends) | exists (`content/textbook.js › RECALL`, `lesson: 'hall-mushkil-muadala'`); `Module02Maarif.jsx` already renders `{base && <Link …>}` → live by itself |
| `ikhtibar-musawat-mutabayina` | `musawiyat-amaliyat` (3AM, published) | **P1 ← `2am_ikhtibar-musawat-mutabayina_P1`** · **P3 ← `2am_ikhtibar-musawat-mutabayina_P1`** | `2am.m4.r09 → 3am.m5.r05` (requires) | **none today**: add one compact box at the top of M2 (owner question 7) |
| `ikhtibar-musawat-mutabayina` | `mutabayinat-amaliyat` (3AM, published) | **P1 ← `2am_ikhtibar-musawat-mutabayina_P3`** | `2am.m4.r09 → 3am.m5.r05` | **none today**: a third `RECALL` entry `year2` in `content/textbook.js`, rendered first in M2 (owner question 7) |
| `ikhtibar-musawat-mutabayina` | `qimat-ibara-harfiya` (3AM, published) P3 (the counterexample) | **none** | **none** — `2am.m4.r09 → 3am.m5.r03` proposed (owner question 5) | — |
| `ibara-harfiya-intaj` | — | none (no item, no net link) | — | — (owner question 6) |
| `majmu-jabri` (2AM unit 3, pair 3) → `ikhtibar-musawat-mutabayina` | inside 2AM | ikhtibar's lead writes **P1 ← the `majmu-jabri` LP that computes an algebraic sum** (draft P2) | `2am.m4.r06 → r09` | ikhtibar M2 « تذكّر — المجموع الجبري » with link |

The edges toward the published 3AM lessons are added by the coordinator after the 2AM lesson is published, in the successor's catalogue
entry (`lessons_3am_2026_2027.json › pointPrerequisites`) with a history line in its `lesson.config.js` header, then
`npm run generate:learning-net` (LEARNING_NET §4.8). 4AM: none directly (no `2am.m4.r08/r09` link into 4AM).

## Owner questions common to the unit (each with its DEFAULT)

1. **Catalogue order vs run order.** Keep the catalogue (= book) order ibara 18 → ikhtibar 19 → hall 20; the run order differs only for
   the net. **Default: keep** (no renvoi either way, section above). Alternative: swap ikhtibar and hall in the catalogue.
2. **Two-step equations in hall.** The book's r08 is one operation, but every term-2 « الوضعية الإدماجية » ends with « 2x + 240 = 300 »
   (`2am-s2-50`, `-73`, `-75`, `-59`) and `2am-s3-39` asks « 3x ÷ 6 = 2 ». **Default: yes** — hall P3 ends with k·x + c = d and
   (x + c) ÷ k = d solved by undoing the LAST operation first (unit-1 `wasf-silsila-hisab`, recalled), never x on both sides.
3. **`ibara-harfiya-intaj` has no item.** **Default: keep `programmeItems: []`** (D10), no « راجع », no net link; its « أستعدّ »
   measures the unit-1 lessons the book's أستعدّ uses (chains, description, distributivity). Alternative: declare it a RECALL lesson of
   `1am.m5.r09` (`RECALL_LESSONS` is a closed list — a decision).
4. **Same-year LP edges without a net link** (ibara has no item, so no net link can carry them): `ibara` P1 ← `2am_wasf-silsila-hisab_P3`,
   `ibara` P3 ← `2am_tawzi-darb-jam-tarh_P3`, `hall` P1 ← `2am_ibara-harfiya-intaj_P1`, `ikhtibar` P1 ← `2am_ibara-harfiya-intaj_P2`.
   **Default: write them** (same grade, earlier lessons the book requires; precedent unit-1 owner question 2) unless `learningNet.test.js`
   refuses them — then drop them and keep only `prerequisiteLessonCodes`.
5. **Net additions proposed** (none is applied by the plans): `2am.m4.r09 → 3am.m5.r03` (requires: the counterexample of
   `qimat-ibara-harfiya` P3 is r09's added skill); `2am.m4.r09 → 3am.m5.r06` (requires: `muadalat-darajat-ula` P2 « التحقق بالتعويض »).
6. **Should 3AM `qimat-ibara-harfiya` or `tabsit-hadhf-aqwas` recall `ibara-harfiya-intaj`?** **Default: no** (no net link; their own
   « تذكّر » point to 1AM r08 / 2AM unit 1).
7. **New « تذكّر — السنة الثانية » boxes** in the published `musawiyat-amaliyat` and `mutabayinat-amaliyat` (they have none; their
   « أستعدّ » already measures r09). **Default: add** one compact box each, with the live link (texts in the ikhtibar plan §12).
8. **The unit تحدّ** is a verbatim copy of the book: rewrite proposed above. **Default: apply** in entry 1.
9. **« جدول إكسل »** in the draft ibara P2: the platform has no spreadsheet lab for formulas (`sheet-lab` is the 4AM statistics sheet).
   **Default:** P2 says « جدول قيم »; the `wax-cells` lab has its own table panel, and the ICT activities become tables of values.
10. **Negative values and the run order.** ibara is generated in pair 1 and hall in pair 2, before `majmu-jabri` (pair 3) is published.
    **Default:** ibara and hall modules keep every value ≥ 0; their banks may use signed values only in steps `counted: false` after
    unit 3's lessons are published; ikhtibar (pair 4) uses signed values freely (`2am-s2-50`: 1 − 3x = 2 − 4x at x = 1).
11. **The synthesis needs ONE الكفاءة** with `programmeItems: []` (precedent: the 2AM unit-1 and unit-2 syntheses).
12. **≤ and ≥ in ikhtibar** (corpus `2am-s3-39`, the « 7 t أو أقلّ » signs). **Default: yes**, in P3.
13. **The evaluation's braking formula is replaced** (130² ÷ 101,6 = 166,33… is not exact) by a workshop's shoe-size rule; confirm.
