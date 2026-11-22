# 2AM unit 1 « العمليات على الأعداد الطبيعية والأعداد العشرية » — generation plans (planner, 2026-10-28)

Plans only. Nothing in this folder is a lesson, a lab, a bank or an extraction. A Sonnet lead generates ONE entry at a time from
its plan, in the order below, and each entry is published (guide §11 « Publish a lesson ») before the next starts. The plans follow
the format of `docs/curriculum/PLAN_3AM_UNITS_1_5.md` and `docs/sources/3am/unit{1,2}/plan/`; every plan ends with an empty
« Generator notes » section for the generator's deviations.

## The unit in one paragraph

Textbook unit 1, book pp. 6–21 (**PDF = book − 3** in this unit: book p. 6 = PDF p. 3; `docs/sources/2am/textbook-map.json`,
`pageOffset: 3`). The 1AM student adds, subtracts and multiplies naturals and decimals in a situation (`1am.m1.r05`, home
`mana-jam-tarh`, PUBLISHED, lab `story-bars`), one operation at a time. This unit chains them. **Without brackets** a chain has ONE
agreed reading: + and − only (or × and ÷ only) from left to right, and × ÷ before + − (`2am.m1.r01`). **Brackets** change that order;
nested ones are computed from the inside, the outer pair written [ ]; a fraction bar groups its numerator and its denominator; a
calculator needs the brackets the bar hides (`2am.m1.r02`). A chain is **named by its last operation** (مجموع، فرق، جداء، حاصل قسمة)
and can be described in a sentence and rebuilt from one. Finally **distributivity** k × (a ± b) = k × a ± k × b, used both ways
(نشر / تحليل) and for mental calculation (`2am.m1.r03`). Downstream: the published 3AM `quwat-adad-nisbi` (priority of powers),
`tabsit-hadhf-aqwas` (like terms = a factorisation; sum vs product), and — through links the net does NOT have yet (owner questions
3–4) — `nashr-jabri-3am`, `jidaa-ida-nisbiya`, `qismat-nisbiyayn`, `amaliyat-natiqa`.

## Entries, in generation order

| # | Code | Title | Items | Lab (new type) | What the hand holds | Plan |
|---:|---|---|---|---|---|---|
| 1 | `silsila-bidun-aqwas` | سلسلة عمليات دون أقواس وأولوية العمليات | r01 | `tram-route` « خطّ الترامواي » | the ORDER of the operations: numbered tickets ①②③ stamped on the operators of a trip's chain (متقدم: also the chain written from the trip) | [`silsila-bidun-aqwas.md`](silsila-bidun-aqwas.md) |
| 2 | `silsila-bi-aqwas` | سلسلة عمليات تتضمّن أقواسا | r01, r02 | `coop-calculator` « حاسبة التعاونية » | the BRACKETS of the line typed on a scientific calculator (where each « ( » and « ) » goes) | [`silsila-bi-aqwas.md`](silsila-bi-aqwas.md) |
| 3 | `wasf-silsila-hisab` | وصف سلسلة حسابات | r01, r02 | `chain-cutter` « مقصّ السلسلة » | WHERE the scissors cut a printed chain into two blocks (the root = the last operation); متقدم: which two blocks are glued by which operation | [`wasf-silsila-hisab.md`](wasf-silsila-hisab.md) |
| 4 | `tawzi-darb-jam-tarh` | توزيع الضرب على الجمع والطرح | r03 | `kit-packer` « ورشة الحقائب التضامنية » | how many items each DISPENSER releases to fill k identical school kits (k × a and k × b, or one model kit k times) | [`tawzi-darb-jam-tarh.md`](tawzi-darb-jam-tarh.md) |
| 5 | `wadiya-idmajiya-amaliyat-tabiiya-ushriya` | أدمج تعلّماتي | — | none (synthesis) | — | [`wadiya-idmajiya-amaliyat-tabiiya-ushriya.md`](wadiya-idmajiya-amaliyat-tabiiya-ushriya.md) |

Four gestures, four drawn worlds: **stamp an order** on a tram line (time runs left to right), **type** on a drawn calculator at the
school cooperative, **cut** a paper strip on the class corkboard, **set dispensers** in a solidarity workshop. None rebuilds
`story-bars` (1AM: the tape decides + or −), `merge-board` (3AM: tap two neighbouring tiles, a magnet IMPOSES the priority, rationals and
signs), `marble-run` (3AM: the expression tree as stations, substitution), `area-split` / `turf-factoring` / `pitch-expansion`
(3AM–4AM: distributivity as an AREA cut by a knob, letters), `vector-chain` (4AM: metro map, Chasles). Each plan's « Why not another
lab » says it for its lab.

Order and lanes: the four lessons are strictly sequential (each builds on the previous one — owner question 2), the synthesis last.
They may run in parallel with the 2AM unit-2 entries planned in `docs/sources/2am/unit2/plan/` (another planner), one dev-server port per
lane (5173 / 5174 — never 4173).

## Seeding the unit and the whole-unit extraction (entry 1 does both)

The unit is **NOT seeded**: no `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/amaliyat-tabiiya-ushriya/` and no
`docs/sources/2am/unit1/` (except this folder). The lead of `silsila-bidun-aqwas`:

1. seeds `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/amaliyat-tabiiya-ushriya/_unit/` — a copy of
   `…/kusur-amaliyat/_unit/` (`unitMeta.js` with `UNIT_ID 'amaliyat-tabiiya-ushriya'`, `UNIT_TITLE 'العمليات على الأعداد الطبيعية
   والأعداد العشرية'`, `CHAPTER_ID 'ansab_al_aadad_wal_hisab'`, `CHAPTER_TITLE 'ميدان الأنشطة العددية'`, `GRADE_ID '2am'`, `GRADE_LABEL
   'السنة الثانية متوسط'`, `PRINT_SUBJECT 'الرياضيات · السنة الثانية متوسط'`, `src`, `addition`; `lessonRoutes.jsx`,
   `moduleContext.js`, `prepDiagnostic.jsx` + `prepDiagnostic.test.js` compared with the unit's `available` catalogue lessons);
2. writes `docs/sources/2am/unit1/build-extraction.py` → `extraction.json` for the WHOLE unit (book pp. 6–21 = PDF 3–18; render with
   `pdftoppm -r 130`, 200–260 dpi crops for doubtful islands; answers computed with `fractions.Fraction`/`Decimal`, never typed;
   `verified: True` for the elements of lesson 1, `False` for the others — their lesson re-reads them). The **boundary block below goes in
   its header, once**, and the discrepancies below go in `DISCREPANCIES`;
3. writes `docs/sources/2am/unit1/brief-authors.md` if the lab or the bank is delegated (model: `docs/sources/2am/unit2/brief-authors.md`);
4. creates `packages/core/arithmetic/chainOps.js` (below) with its L1 functions.

### Element ids and destinations (planned)

Module numbers: 0 أستعدّ · 1 نشاط · 2 معارف · 3 طريقة · 4 أتمرّن · 5–7 مسائل · 8 إختبار أولي; `None` = bank only. L1 =
`silsila-bidun-aqwas`, L2 = `silsila-bi-aqwas`, L3 = `wasf-silsila-hisab`, L4 = `tawzi-darb-jam-tarh`, S = the synthesis. Every
element is ANALYSED then redesigned (own numbers and contexts); a destination says where its IDEA serves.

| Element (book p.) | Content (read 2026-10-28) | Destination |
|---|---|---|
| `objectives` (6) | the three « سأتعلّم » lines | `{ lesson: 'unit', module: 'page' }` |
| `opener` (6) | history of the digits (India → Arab scholars → al-Khwarizmi → Fibonacci who learnt them in Béjaïa) | S m0 « هل تعلم » (platform words) |
| `challenge` (6) | 30 − 8 + 2: Younes's tree gives 20 (8 + 2 first), Inès's gives 24 | unit page with the REWRITTEN text below (`challenge.sourceElementId: 'challenge'`), `duplicatedIn` L1 m1 (lab task `t1` is its idea) |
| `prep` (7), items 1–11 | 1 3,6 + 8,7 is a sum · 2 « عاملان » · 3 13 + 24 + 17 = 13 + 17 + 24 = 54 · 4 37,3 + 456,2 + 62,7 = 556,2 (mental) · 5 427,3 − 219,54 = 207,76 · 6 AC = 13 + 8,5 · 7 AC = 14,5 − 9 · 8 AB = 20 ÷ 5 (5 equal parts) · 9 area 2,4 × 2 + 2,4 × 3 · 10 9,2/4 = 9,2 ÷ 4 = 2,3 · 11 a × 2 = 2a | split by `items`: 3, 4, 5, 6, 7 → L1 m0 ; 8, 10 → L2 m0 ; 1, 2 → L3 m0 ; 9, 11 → L4 m0 |
| `act-1` (8) | 25 − 7 + 3 (15 or 21?); the scientific calculator's keys; four checked results (+ − and × ÷ only); Younes 230 − 160 + 100 | L1 m4 (application, own numbers) |
| `act-2` (8) | 8 + 3 × 4 = 20, 30 ÷ 5 − 2 = 4, 3 × 7 − 4 ÷ 2 = 19 by calculator; uncle Ahmed's 4 instalments | q1 → L1 m4 ; q2 → L1 m5 (redesigned) |
| `act-3` (8–9) | with / without brackets (7 + 3 × 4 / (7 + 3) × 4 / 7 + (3 × 4); 48 − 12 ÷ 3 …), role of brackets, useless brackets; q4 the librarian: 12 + 102 books, ≤ 5 per shelf | q1–q3 → L2 m4 ; q4 → L2 m5 (redesigned) |
| `act-4` (9) | A = (14 + 6)/(3 + 1) without the bar; calculator; 1 + 4 ÷ 4 + 16 on a calculator = 18 | L2 m4 |
| `act-5` (9) | (41 + 9) ÷ 5, 24 − (6 + 4), 12 + 4 × 5, 8 × (13 − 4): underline the last operation, stickers مجموع / فرق / جداء / حاصل قسمة | L3 m4 |
| `act-6` (9) | two rectangles 3 × (4,8 + 2,1) and 3 × (4,8 − 1,3), justify both equalities | L4 m4 |
| `know-1` (10) | + − left to right (A = 35 + 12 − 4, B = 17 − 7 + 4); × ÷ left to right (C = 36 ÷ 3 × 4, D = 15 ÷ 5 × 4 ÷ 6); priority (C = 13 + 7 × 4, D = 2,5 + 3 × 7 − 35 ÷ 5) | L1 m2 |
| `know-2` (10) | brackets first, then the two rules (the podium picture); E = 8 × (12 − 7), F, G = (4,5 + 27) ÷ 9 | L2 m2 |
| `method-1` (11) | nested brackets A = 2,5 × (7 − (5 − 3)) = 12,5; outer pair written [ ] | L2 m3 |
| `method-2` (11) | fraction bar: (40 + 8)/(15 − 9) = 6, 36/(3 × 5 − 6) + 6 = 10 | L2 m3 |
| `now-11` (11) | ① write without the bar E, F = 5/(11 + 9), G, H = 17 − 45/(6 × 4 − 9) + 3 ; ② A = [17 − (5 + 4)] × 2, B, C, D | ① → L2 m4 ; ② → L2 m4 |
| `know-3` (12) | the last operation names the chain; A = 3 + 6 × 8 a sum, B = (3 + 6) × 8 a product, with the full sentences | L3 m2 |
| `know-4` (12) | property k × (a ± b) = k × a ± k × b (k, a, b decimals), A = 3 × (5 + 7), B = 9 × (6 − 2); remark نشر / تحليل | L4 m2 |
| `method-3` (13) | mental: 17 × 6,1 + 17 × 3,9; 13,1 × 16 − 3,1 × 16; 2,5 × 11 | L4 m3 |
| `method-4` (13) | expand E = 3(x − 5) = 3x − 15; values for x = 12, 5, 7,5; notation 3 × x = 3x, 5 × (x − 2) = 5(x − 2) | L4 m3 (step 4 — owner question 1) |
| `now-13` (13) | ① F = 5(3a − 2), two ways for a = 0,5 (gives −2,5!) ; ② 37 × 9, 6,15 × 110, 26 × 11, 0,84 × 999, 2,3 × 99, 17 × 5,39 − 17 × 2,39 | ① → L4 m4 (rewritten, a positive value) ; ② → L4 m4 |
| `ex-1` … `ex-7` (14) | + − / × ÷ chains, mental, priority, Khaled's errors, complete with operations | L1 (`ex-4`, `ex-5`, `ex-7` → m4 ; the rest bank) |
| `ex-8`, `ex-10`, `ex-11`, `ex-12`, `ex-13`, `ex-14`, `ex-15`, `ex-16`, `ex-17` (14–15) | brackets, place brackets, mental, order of magnitude, problems ↔ expressions, nested, bar both ways, Younes's calculator | L2 (`ex-8`, `ex-10`, `ex-13`, `ex-14`, `ex-15`, `ex-16`, `ex-17` → m4 ; the rest bank) |
| `ex-9` (14) | calculation trees A and B ↔ chains, draw a tree | L3 m4 |
| `ex-18`, `ex-19`, `ex-20` (15) | write chains from sentences; circle the last operation and describe; a = 32, b = 6, c = 10 | L3 m4 (`ex-18`, `ex-19`) ; `ex-20` → L3 bank |
| `ex-21` … `ex-28` (15–16) | complete, Samira's errors, expand, factor, two ways, strawberry rows, broken keys ( and 8 | L4 (`ex-21`, `ex-23`, `ex-24`, `ex-25`, `ex-26` → m4 ; `ex-27` → m4 ; `ex-22` → L2 bank ; `ex-28` → L4 m7) |
| `ex-29`, `ex-30` (15–16) | isosceles triangle: which chain gives the leg; triangles ABD / ACD: write two chains | L2 bank |
| `ex-31` … `ex-34` (16) | T-shape area mentally (16 cm²); mental products; 6 × 43 = 258 → 6 × (43 − 8); 35,4 × 608 | L4 (`ex-31` → m4 ; the rest bank) |
| `ex-35`, `ex-36` (16) | 4x + 3x = (4 + …)x …; simplify 5x + 2x + 3x … | L4 bank (owner question 1) |
| `self-1`, `self-6` (17) | chains without brackets; BOC = 82° − 27° − 33° | L1 bank |
| `self-2`, `self-3`, `self-4` (17) | brackets; the 7 7 7 7 chains; calculator keys for three bar expressions | L2 bank |
| `self-5` (17) | match chains to مجموع / فرق / جداء / حاصل قسمة | L3 bank (naming only — discrepancy 6) |
| `self-7` … `self-10` (17) | two ways; 48 × 7 two ways; 9x − 4 for x = 0,5 and 2; expand 5(x − 7), (a + 4) × 3, 6(2x − 1) | L4 bank |
| `deep-37` (18) | crossword of chains | S bank |
| `deep-38`, `deep-40`, `deep-41`, `deep-43`, `deep-50`, `deep-53` (18–19) | nested chains; five 4s → 0…9; two expressions (partly cut); BN on a segment; table of 5 expressions at x = 3 and 4,5; the « 24 » grid | L2 bank (`deep-40` also S m6 bonus) |
| `deep-39` (18) | 8 + 2 × … = 29, 4 + 3 × … = 25, 9 − 4 + 2 × … = 19, 7 × 6 + 4 × … = 50 | L1 m4 |
| `deep-42` (18) | 243 528 729 × 574 with a calculator (too many digits) | L4 m7 (redesigned) |
| `deep-44`, `deep-45`, `deep-46`, `deep-51`, `deep-52` (18–19) | perimeter with a half-circle; pentagon BCDEA; polygon in a rectangle (figure cut); aquarium; 52 sweets in red/blue boxes | S bank |
| `deep-47`, `deep-48`, `deep-49` (19) | calculation programs (add 3, × 5; add 10, × 2, ÷ 20; the « magician ») | L3 m5 (`deep-47`), m7 (`deep-49`) ; `deep-48` → L3 bank |
| `integration` (20) | °F → °C program « − 32, × 5, ÷ 9 »; Laghouat shows 50 °F: hot? | S m1 (redesigned: a DIFFERENT program — the 3AM unit-1 synthesis already uses Fahrenheit) |
| `evaluation` (20) | a carpenter's shelf kit (4 long boards, 6 short, 12 small angles, 2 big, 5 screws) and the stock → how many shelves (bottom cut) | S m7 + m8 (redesigned: bird-houses) |
| `ict` (21) | A = (129 − 25)/(5 + 4 × 2) = 8, B = 15/(2 + 13) + 8 = 9 with the keys; « دوري الآن » ① 14 ÷ 2 + 5 =, keys for 2,28/(11,4 + 8,6) ; ② order of magnitude then exact ; ③ Assim's 316,5 for 760/(2,5 + 12,5) | act → L2 m7 (redesigned) ; ① ③ → L2 m4 / bank ; ② → L2 bank |

**Discrepancies to record** (`DISCREPANCIES`; never shown to students):
1. `know-2` example F: printed « F = 3 + 6 × 15 − 5 » (= 88) but worked as « (3 + 6) × (15 − 5) = 9 × 10 » (= 90) — 200 dpi crop.
2. `act-1`: the chain is 25 − 7 + 3 (results 15 and 21) but the calculator keys show « 2 5 − 7 + 5 = ».
3. `act-2` q2: instalments of « 1500DA » on a 54 000 DA computer (the 4th would be 49 500 DA; 15 000 is likely).
4. `now-13` ①: F = 5(3a − 2) at a = 0,5 is −2,5 — a NEGATIVE result before 2AM unit 3 (relative numbers). Rewritten with a = 1.
5. `ex-24` B = 9,5 × (4,2 − 5): the difference is negative (expansion « without computing » only). Not used as printed.
6. `self-5`: « 2,5 − 2 × 7 » is a difference whose value is negative; naming only, never computed.
7. `ex-12`: E « 9,7 × 4 × (107,9 − 8… » cut on the right edge; B and C cut at the page bottom (p. 14). `verified: False`, illegible part noted.
8. Scan cuts (in addition to `textbook-map.json › scanIssues`): p. 8 bottom (`act-3` q2–q3 partly), p. 11 right edge (`now-11` ① E and G),
   p. 14 bottom (`ex-7` second line), p. 16 bottom (`ex-36`), p. 18 (`deep-41` statement, `deep-46` figure), p. 19 right edge
   (`deep-47`–`deep-49` first words), p. 20 bottom (the evaluation's question), p. 21 right edge (ict ② A).
9. `ex-5` C (Khaled's sheet) and `ex-34`'s last line must be re-read at 200 dpi by L1 / L4.

## Boundaries (written ONCE here; copy into `build-extraction.py`'s header)

- **`silsila-bidun-aqwas` (r01, without brackets)** = chains with NO brackets and no fraction bar: + and − only from left to right, × and
  ÷ only from left to right, × ÷ before + −, on naturals and decimals; translating a situation into such a chain and computing it; the
  scientific calculator applies the same rule (it is shown, not typed for brackets). It never writes a bracket, never names a chain by its
  last operation, never distributes. Every intermediate result is ≥ 0 (2AM unit 3 owns relative numbers).
- **`silsila-bi-aqwas` (r01 + r02)** = brackets first; nested brackets from the inside, outer pair as [ ]; necessary vs useless brackets;
  the fraction bar as two bracketed chains, both ways (with ↔ without the bar); typing a chain on a calculator with the brackets it needs;
  translating a situation that NEEDS brackets. It never names a chain by its last operation (it may say « القوسان يجعلان الجمع أوّلًا »),
  never distributes, never removes brackets preceded by − (3AM `tabsit-hadhf-aqwas`), never computes algebraic sums (2AM unit 3
  `majmu-jabri`).
- **`wasf-silsila-hisab` (r01 + r02)** = the last operation names the chain; its two terms / factors / dividend and divisor; a sentence that
  describes it, nested (« جداء العدد 4 ومجموع العددين 9 و 6 »); writing a chain (with the brackets it needs) from a sentence or a calculation
  program, then computing it; trees ↔ chains. It never distributes and never uses letters beyond « اختر عددًا » programs computed on
  numbers (a letter program `5 × (n + 3)` is read, never simplified).
- **`tawzi-darb-jam-tarh` (r03)** = k × (a + b) = k × a + k × b and k × (a − b) = k × a − k × b (a ≥ b) on naturals and decimals, read
  both ways: نشر (product → sum) and تحليل (sum → product, the common factor visible); mental calculation (×11, ×99, ×101, 48 × 7 =
  (50 − 2) × 7); with ONE letter in the simple form k × (x ± b) and its notation 3 × x = 3x (owner question 1). It never multiplies two
  brackets (`nashr-jabri-3am`), never uses negative numbers, never simplifies sums of like terms beyond « (4 + 3)x = 7x » read as a
  factorisation (`tabsit-hadhf-aqwas` P1), never removes brackets preceded by −.
- **Synthesis** = no new notion: six training situations + the analysed final situation + the final test.

## Shared maths module — `packages/core/arithmetic/chainOps.js` (new, grown lesson by lesson)

`relativeOps.js › evaluate(text)` (3AM) already evaluates + − × ÷ and ( ) with the priorities on the exact rationals of `powers.js`, one
operation per step. It does not fit as is: no [ ], no fraction bar, no TREE (the last operation, the operands, a description), no
evaluation in a STUDENT-CHOSEN order (lab 1), and its 3AM callers must not change. So a new module, imported BY PATH (never through the
core barrel, BUNDLE_BOUNDARIES §4), built on `powers.js` (`rat`, `add`, `sub`, `mul`, `div`, `eq`, `cmp`) and reusing `relativeOps.js`
(`parseRel`, `relText`, `divide`, `factorize`) — do not re-implement them. Its `chainOps.test.js` cross-checks `evaluateChain` against
`relativeOps.evaluate` on every bracket-only chain of the unit.

| Added by | Functions (all pure, tested) |
|---|---|
| L1 | `tokenize(text)` (digits incl. Arabic-Indic, decimal comma, + − × ÷ and the ASCII aliases; refuses a negative literal) ; `parseChain(text)` → tree `{t:'num', v, text}` / `{t:'op', o, l, r, group?}` with the priorities ; `evaluateChain(treeOrText)` → rat ; `traceChain(tree, { grouped })` → the written lines, one operation per line (or, `grouped`, every × ÷ of a level in one line — the textbook's way) ; `operatorsOf(text)` → the operator chips with positions ; `valueInOrder(text, order)` → `{ value, lines, conventional }` for ANY permutation of the operators (lab 1's plan) ; `conventionalOrder(text)` ; `chainText(tree)` (decimal comma, × ÷ −) ; `isNonNegativeChain(text)` (every intermediate ≥ 0 — the 2AM guard) |
| L2 | `[` `]` and the fraction bar in `parseChain` (`{a}/{b}` as `group: 'bar'`) ; `withoutBar(tree)` / `withBar(tree)` (both writings) ; `calculatorKeys(tree)` (the minimal key sequence with brackets) and `calculatorRead(keys)` (what a SCIENTIFIC calculator shows: priorities applied to the typed line) ; `uselessBrackets(tree)` (pairs whose removal keeps the tree) ; `minimalText(tree)` ; `bracketDepth(tree)` (for the [ ] rendering) |
| L3 | `lastOperation(tree)` → '+' / '−' / '×' / '÷' (the root; left-to-right convention) ; `operands(tree)` → `[left, right]` ; `chainName(tree)` → 'مجموع' / 'فرق' / 'جداء' / 'حاصل قسمة' ; `cutAt(text, opIndex)` → `{ ok, left, right, leftValue, rightValue, rebuilt, rebuiltValue, staples }` ; `describe(tree)` → the Arabic sentence (« جداء العدد 4 ومجموع العددين 9 و 6 »; « فرق … و … بهذا الترتيب » for − and ÷) ; `build(op, leftText, rightText)` → the chain with the brackets it needs |
| L4 | `expand(k, a, b, op)` / `factorOut(k, a, b, op)` (reuse `relativeOps.factorize`) → both sides + equal values ; `commonFactor(term1, term2)` (the visible common factor of k × a ± k × b) ; `mentalSplits(n)` → `[{ parts: [50, 2], op: '−' }, { parts: [40, 8], op: '+' }]` (round tens / hundreds) ; `expandLetter({ k, b, op })` → « 3x − 15 » and its value at x |

Each lab keeps its own logic in `apps/web/src/lessons/common/manipulations/logic/<lab>.js` on top of this module.

## The unit's تحدّ and where it goes

The book's تحدّ (p. 6) is 30 − 8 + 2 with two trees (Younes 20, Inès 24). Its idea — a chain without brackets has ONE reading — is the
entry of L1 (lab task `t1`, other numbers). The units file (`units_2am_2026_2027.json › amaliyat-tabiiya-ushriya.challenge.textAr`) is a
copy of the book: **proposed rewrite** (own numbers, own names, self-contained, verified: 40 − 12 + 6 = 34 and 40 − (12 + 6) = 22):

> « احسب: 40 − 12 + 6 . وجدت سلمى 34 ووجد أنس 22. من منهما على صواب؟ ولماذا؟ »

with `challenge.sourceElementId: "challenge"` and the destination `{ lesson: 'unit', module: 'page', duplicatedIn: L1 m1 }` (3AM unit-6
pattern, guide « Phase A entry #9 »). L1's generator applies it (owner question 5).

## Corpus at a glance (`docs/sources/moyen/exams/exams-index.json`)

37 exercise rows carry `2am.m1.r01`–`r03` (34 in 2AM papers; `2am-s1-76` duplicates `2am-s1-75`). Almost all are term 1, exercise 1:
one or two chains without brackets, one or two with (nested, bar), then « احسب بطريقتين » / « انشر » / « حلّل ». Read for this plan (text
layer or a 90 dpi render): `2am-s1-68`, `-70`, `-75`, `-77`, `-78`, `-79`, `-81`, `-84`, `-87`, `-88`, `-91` (exercise 1, and `-79` ex 2,
`-87` ex 2). NOT read (each lesson's bank author reads them before claiming them): `2am-s1-66`, `-67`, `-73`, `-74`, `-83`, `2am-s2-52`,
`-53`, `-59`, `-62`, `-71`, `2am-s3-39`, `-40`, `-43`. The 3AM papers `3am-s1-104/108/112` carry r01/r02 but are 3AM papers (badge
grade = 3AM): not usable for a 2AM bank. Corpus anomalies found: `2am-s1-79` ex 2 ② says the SCIENTIFIC calculator gave 56 for
« 4 + 3 × 8 » (it gives 28; the ordinary one 56); `2am-s1-78` ex 1 A « 23 + 2 × 5 − 220 » is negative (misprint likely); `2am-s1-91`
ex 1 N = 7 × 1,4 − 7 × 2,4 + 14 has a negative intermediate when computed left to right; `2am-s1-87` ex 2 ① numbers garbled in the text
layer (re-read the image).

## Successor connection (summary — details in each plan § « Successor connection »)

| Successor (status) | LP | Gains `pointPrerequisites` ← | Net link |
|---|---|---|---|
| `quwat-adad-nisbi` (3AM, published) | P4 | `2am_silsila-bidun-aqwas_P2`, `2am_silsila-bi-aqwas_P1`, `2am_silsila-bi-aqwas_P3` | `2am.m1.r01 → 3am.m3.r08` (both lessons declare r01) |
| `tabsit-hadhf-aqwas` (3AM, published) | P1 | `2am_tawzi-darb-jam-tarh_P3` | `2am.m1.r03 → 3am.m5.r01` |
| `tabsit-hadhf-aqwas` | P4 | `2am_wasf-silsila-hisab_P1` | **none yet** — needs `2am.m1.r02 → 3am.m5.r01` (owner question 3) |
| `nashr-jabri-3am` (3AM, published) | P1 | `2am_tawzi-darb-jam-tarh_P3` | **none yet** — needs `2am.m1.r03 → 3am.m5.r02` (`extends`) |
| `jidaa-adadayn-nisbiyayn` P3, `jidaa-ida-nisbiya` P4 (3AM, published) | — | `2am_tawzi-darb-jam-tarh_P1` / `_P3` | **none yet** — the 3AM unit-1 owner question « `2am.m1.r03 → 3am.m1.r01` » is still open |
| `qismat-nisbiyayn` P4, `amaliyat-natiqa` P4 (3AM, published) | — | `2am_silsila-bi-aqwas_P1` (and bidun P2) | **none yet** — the 3AM unit-1 question « `2am.m1.r01 → 3am.m1.r02` » is still open |
| `majmu-jabri` (2AM unit 3, planned), `mutawassit-mutawazin` (3AM, planned) | — | written by THEIR generator (bi-aqwas P1 / bidun P2) | `2am.m1.r02 → 2am.m4.r06`, `2am.m1.r01 → 3am.m7.r11` |

The edges toward published lessons are added by the generator of the 2AM lesson, in the successor's catalogue entry
(`lessons_3am_2026_2027.json › pointPrerequisites`), after its own lesson is published (LEARNING_NET §4.8), then
`npm run generate:learning-net`.

## Owner questions common to the unit

1. **Letters in `tawzi-darb-jam-tarh`.** The book puts `method-4` (3(x − 5) = 3x − 15), `now-13` ①, `self-9`, `self-10`, `ex-35`, `ex-36`
   in this unit, and term-1 papers ask « أنشر K = 2(x + y) ، حلّل 15a − 15b » (`2am-s1-87` ex 2). The 2AM lesson that owns letters,
   `ibara-harfiya-intaj` (later in the book, no programme item), lists « حذف إشارة × أمام حرف أو قوس ». **Default:** L4 P3 expands and
   factors k × (x ± b) with one letter and NAMES the notation 3 × x = 3x (recalled later by `ibara-harfiya-intaj`); `ex-36` (sums of like
   terms) stays bank-only as a factorisation. Alternative: no letter in L4 (then `method-4`, `now-13` ①, `self-9/10` move to `ibara-harfiya-intaj`).
2. **Cross-lesson edges on a shared item without a net link** (`silsila-bi-aqwas` P1 ← `silsila-bidun-aqwas` P2; `wasf` P1 ← `silsila-bi-aqwas`
   P1, both on r01/r02). **Default: yes** (3AM precedent `jidaa-ida-nisbiya`, `mutabayinat-amaliyat`).
3. **Net additions proposed** (none is applied by the plans): `2am.m1.r02 → 3am.m5.r01` (requires: sum vs product by the last operation,
   `tabsit` P4); `2am.m1.r03 → 3am.m5.r02` (extends, added value « نشر جداء بحروف وبأعداد نسبية، وجداء قوسين »: `nashr-jabri-3am` today
   has no 2AM base); the two 3AM unit-1 questions still open (`2am.m1.r03 → 3am.m1.r01`, `2am.m1.r01 → 3am.m1.r02`).
4. **Catalogue fixes proposed** (not applied):
   - `silsila-bi-aqwas.prerequisiteLessonCodes` lacks `silsila-bidun-aqwas`, and `wasf-silsila-hisab` lacks `silsila-bidun-aqwas` +
     `silsila-bi-aqwas` (`reviewLinksForLesson` cannot show them because the lessons share r01/r02; LEARNING_NET §4.5 « plus the earlier
     lessons of the unit the textbook requires »);
   - `silsila-bidun-aqwas.textbookRef.pages.method: [11, 11]` — p. 11 is brackets only (nested, bar): set `method: null` (the
     `qisma-iqlidiya-hasr` pattern), L1's طريقة is a declared `addition('knowledge_formalization')`;
   - `silsila-bi-aqwas.textbookRef.pages` should add the ict page 21.
5. **The unit تحدّ** is a verbatim copy of the book: rewrite proposed above.
6. **Negative values in the book and the corpus** (discrepancies 4–6, corpus anomalies): every platform statement keeps intermediate
   results ≥ 0 until 2AM unit 3; `chainOps.isNonNegativeChain` guards the banks.
7. **The synthesis needs ONE الكفاءة** with `programmeItems: []` (precedent: the five 3AM syntheses, LP total in `coursesData.test.js`).
8. **The integration's Fahrenheit program is replaced** (the published 3AM unit-1 synthesis already uses Fahrenheit) by a thunder-distance
   program; confirm.
9. **The tram's left-to-right reading** makes the convention MEANINGFUL for a trip written in time order and leaves it a convention for a
   bare chain (the lesson says so: « اتّفاق »). Confirm the framing.
