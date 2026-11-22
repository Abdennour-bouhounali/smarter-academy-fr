# 3AM unit 1 « الأعداد النسبية » — generation plans (planner, 2026-10-25)

Plans only. Nothing in this folder is a lesson, a lab, a bank or an extraction. A Sonnet lead generates ONE lesson at a time from
its plan, in the order below, and each lesson is published (guide §11) before the next starts.

## The unit in one paragraph

Textbook unit 1, book pp. 6–21 (**PDF = book + 1** in this unit: book p. 6 = PDF p. 7; `docs/sources/3am/textbook-map.json`). The
2AM student can add and subtract relative numbers (2AM unit `adad-nisbiya-2`: `jam-tarh-nisbiya`, `majmu-jabri`, and the published
`muqarana-nisbiya` for distance to zero and order). This unit gives the relative numbers their two missing operations. **Product**: the
sign rule (same signs → positive, different signs → negative), its justification through distributivity, then the product of SEVERAL
factors (the parity of the number of negative factors), ×(−1) as the opposite, the square that is never negative, and distributivity
used both ways on relative numbers. **Quotient**: a ÷ b is the number q with b × q = a (b ≠ 0), the same sign rule, the three equal
writings −a/b = a/−b = −(a/b), and series of calculations under the priority rules. Programme items `3am.m1.r01` (product, shared by
the first two lessons) and `3am.m1.r02` (quotient). Downstream, the published 3AM lessons `quwat-adad-nisbi` (sign of aⁿ),
`nashr-jabri-3am` and `musawiyat-amaliyat` already build on it, and 3AM unit 2 (`kusur-natiqa`: reciprocal, rational numbers) needs
the quotient.

## Lessons, in generation order

| # | Code | Title | Item | Lab (new type) | What the hand holds | Plan |
|---:|---|---|---|---|---|---|
| 1 | `jidaa-adadayn-nisbiyayn` | جداء عددين نسبيين | r01 | `elevator-reel` « شريط المصعد » (+ module 2: `sign-machine` « آلة الجداءات », 2026-10-27) | the signed TIME t of a security-camera replay (and, متقدم, the signed speed r) | [`jidaa-adadayn-nisbiyayn.md`](jidaa-adadayn-nisbiyayn.md) |
| 2 | `jidaa-ida-nisbiya` | جداء عدة أعداد نسبية | r01 | `robot-track` « مسار الروبوت » | the SIGNS and the ORDER of the factor cards of a robot's programme | [`jidaa-ida-nisbiya.md`](jidaa-ida-nisbiya.md) |
| 3 | `qismat-nisbiyayn` | حاصل قسمة عددين نسبيين | r02 | `code-lockers` « خزائن الأمانات » | the missing factor q (sign wheel + digit / fraction wheels of a locker code) | [`qismat-nisbiyayn.md`](qismat-nisbiyayn.md) |
| 4 | `wadiya-idmajiya-aadad-nisbiya` | أدمج تعلّماتي — الأعداد النسبية | — | none (synthesis) | — | [`wadiya-idmajiya-aadad-nisbiya.md`](wadiya-idmajiya-aadad-nisbiya.md) |

Three gesture families, three drawn worlds: **scrub** a timeline (vertical tower world), **carry + tap-flip + reorder** cards
(horizontal floor-mat world), **roll** code wheels (a wall of lockers). None of them reuses the 2AM `zero-probe` (sea, the distance on a
cable) or the 3AM `power-train` (railway, the exponent).

## Seeding the unit and the whole-unit extraction (lesson 1 does both)

The unit is **NOT seeded** (no `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/aadad-nisbiya/`) and has **no extraction**.
The lead of lesson 1 (`jidaa-adadayn-nisbiyayn`):

1. seeds `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/aadad-nisbiya/_unit/`: `unitMeta.js` (`UNIT_ID 'aadad-nisbiya'`,
   `UNIT_TITLE 'الأعداد النسبية'`, `CHAPTER_ID 'ansab_al_aadad_wal_hisab'`, `CHAPTER_TITLE 'ميدان الأنشطة العددية'`, `GRADE_ID '3am'`,
   `GRADE_LABEL 'السنة الثالثة متوسط'`, `PRINT_SUBJECT 'الرياضيات · السنة الثالثة متوسط'`, `src`, `addition`), `lessonRoutes.jsx`,
   `moduleContext.js`, `prepDiagnostic.jsx` + `prepDiagnostic.test.js` (compared with the unit's `available` catalogue lessons). Copy the
   shape of `…/quwa-nisbiya/_unit/`;
2. writes `docs/sources/3am/unit1/build-extraction.py` → `extraction.json` for the WHOLE unit (pp. 6–21, answers computed with
   `fractions.Fraction`, `verified: True` for every element destined to lesson 1, `False` for the others — their lesson re-reads
   them). The **boundary block below goes in its header, once**;
3. sets the destinations in the table below (later leads only move their own lessons' destinations and flip `verified`).

### Element ids and destinations (planned; module numbers: 0 أستعدّ · 1 نشاط · 2 معارف · 3 طريقة · 4 أتمرّن · 5–7 مسائل · 8 إختبار أولي; `None` = bank)

| Element (book p.) | Destination |
|---|---|
| `objectives` (6) | `{ lesson: 'unit', module: 'page' }` |
| `opener` (6) — history box destroyed by pixel blocks (scan) | `{ lesson: 'unit', module: 'page', note: 'illisible' }` (discrepancy recorded) |
| `challenge` (6) | split by `items`: ① (2017 equal numbers) → `jidaa-ida-nisbiya` module 5 ; ② (decompose −36) → `wadiya-idmajiya-aadad-nisbiya` module 5 |
| `prep` (7), items 1–15 | split: 7, 10, 11, 14, 15 → L1 m0 ; 1, 5, 6, 8, 9 → L2 m0 ; 12, 13 → L3 m0 ; 2, 3, 4 → synthesis m0 |
| `act-1` (8) well | L1 m4 (application) |
| `act-2` (8) escalator | L1 m4 (application) |
| `act-3` (9) justification + (−7)×n table | L1 m2 (the reasoning, redesigned numbers) |
| `act-4` (9) quotients ① ② ③ | split: ①② → L3 m4 ; ③ (sign of Q) → L3 m3 |
| `know-1` sign rule (10) | L1 m2 |
| `know-2` product of two + a×0 (10) | L1 m3 |
| `know-3` ×(−1) (10) | L2 m1 (named after q1) |
| `know-4` roles of « − » (10) | L2 m2 |
| `know-5` several factors (10) | L2 m1 |
| `know-6` square (10) | L2 m2 |
| `method-1` (11) exercises 1–3 + طريقة | split: ex 1, 2 + طريقة → L1 m3 ; ex 3 (5 factors) → L2 m3 |
| `method-2` several factors (11) | L2 m3 |
| `method-3` special cases ×(−1), ×0 (11) | L2 m3 |
| `now-11` دوري الآن (11) | L2 m4 |
| `know-7` distributivity (12) | L2 m3 |
| `know-8` quotient sign rule (12) | L3 m1 (named after q2) |
| `know-9` computing a quotient, a/b × b = a (12) | L3 m2 |
| `know-10` organise a calculation (12) | L3 m3 |
| `method-4` reorder factors, P = 504 (13) | L2 m3 |
| `method-5` sign of a quotient (13) | L3 m2 |
| `method-6` computing a quotient (13) | L3 m3 |
| `now-13` دوري الآن ① ② (13) | L3 m4 |
| `ex-1`…`ex-4`, `ex-6`, `ex-7`, `ex-8`, `ex-17`, `ex-19`, `ex-29`, `ex-34` | L1 (m4 or bank) |
| `ex-5`, `ex-9`…`ex-14`, `ex-18`, `ex-20` | L2 |
| `ex-15`, `ex-16`, `ex-21`…`ex-28`, `ex-30`…`ex-33` | L3 |
| `self-1`…`self-5` | L1 ; `self-6`, `self-7`, `self-12` → L2 ; `self-8`…`self-11` → L3 |
| `deep-37`, `deep-43` | L1 ; `deep-35`, `39`, `42`, `44`, `46`, `49`, `51` → L2 ; `deep-36`, `40`, `41`, `45`, `47`, `48`, `50`, `52` → L3 ; `deep-38` (addition only) → synthesis bank |
| `integration` (20) | synthesis m1 (redesigned) |
| `evaluation` (20) Fahrenheit | synthesis m7 + m8 (redesigned) |
| `ict` (21) calculator | L3 m7 (redesigned as a مسألة) |

**Discrepancies to record** (`discrepancies[]`): (1) the opener's history box is unreadable; (2) `self-11` prints « (−4) ÷ 11 » but its
options (11/−4, −11/4, −2,75, 11/4) only fit 11 ÷ (−4) = −2,75 (RTL rendering of an LTR island) — transcribe as 11 ÷ (−4), keys a, b, ج;
(3) `deep-47` prints « 52 » where the multiplicative magic square needs 25 (centre −10, constant (−10)³ = −1000; completed square
−50 1 20 / 4 −10 25 / 5 100 −2) — same RTL digit reversal; (4) `deep-40` ب) needs TWO pairs of brackets: (−9 + 2 × 8) × (2 − 12) = −70;
(5) `self-12` reads −4,7 × 13 − (−4,7) × 3 (= −47: keys أ and ج).

## Boundaries (written ONCE here; copy into `build-extraction.py`'s header)

- **`jidaa-adadayn-nisbiyayn` (r01, first half)** = the product of TWO relative numbers (integers or decimals): neg × pos as repeated
  addition, the sign rule, its justification by distributivity (k × b + k × (−b) = k × 0 = 0), computing (sign, then product of the
  distances), and a × 0 = 0. It never multiplies three factors, never names « المعاكس » as ×(−1), never squares, never divides.
- **`jidaa-ida-nisbiya` (r01, second half)** = a product of SEVERAL factors: (−1) × a = −a (the opposite), the roles of the sign
  « − », the sign by the parity of the number of negative factors, reordering factors to compute mentally, the square (−a)² = a² ≥ 0,
  and distributivity both ways on NUMBERS (k × a + k × b = k × (a + b), k × (a − b) = k × a − k × b). It never uses letters for
  distributivity (k(a + b) with a letter is `nashr-jabri-3am`, published; like terms are `tabsit-hadhf-aqwas`, published), never writes
  aⁿ beyond ², never contrasts −a² with (−a)² (`quwat-adad-nisbi` P4, published), never divides.
- **`qismat-nisbiyayn` (r02)** = a ÷ b = q ⇔ b × q = a (b ≠ 0), the missing factor, the quotient's sign rule (also for a quotient of
  products), computing a quotient (decimal or written as a fraction), −a/b = a/−b = −(a/b) and −a/−b = a/b, then organising a series
  of calculations on relative numbers (brackets → × ÷ → + −). It never names « عدد ناطق », never simplifies a fraction beyond moving the
  sign, never divides by multiplying by the reciprocal (all `kusur-natiqa`, unit 2), never computes with fractions a/b + c/d.
- **Synthesis** = no new notion; six training situations + the analysed final situation + the final test.

## Shared maths module — `packages/core/arithmetic/relativeOps.js` (new, grown lesson by lesson)

Exact arithmetic on relative numbers (integers, decimals, quotients) built on the exact rationals of `powers.js` (`rat`, `mul`, `div`,
`add`, `sub`, `neg`, `sign`, `ratText`, `ratTex` — import them, do not re-implement). Imported BY PATH, never through the core barrel
(BUNDLE_BOUNDARIES §4). `relative.js` (2AM, centièmes) is NOT extended: its unit is the hundredth, and a product of two hundredths
needs ten-thousandths.

| Added by | Functions (all pure, tested in `relativeOps.test.js`) |
|---|---|
| L1 | `parseRel(text)` (accepts « −2,5 », « -2.5 », Arabic-Indic digits, « 3/4 ») → rat ; `relText(r)` (decimal comma when finite, else « a/b ») ; `relTex(r)` ; `distance(r)` ; `productSign(a, b)` (−1 / 0 / 1) ; `times(a, b)` ; `repeatedSum(a, n)` → the list of partial sums for n ∈ ℕ (P1) ; `distributeCheck(k, b)` → `{ left: k×b + k×(−b), right: k×0 }` |
| L2 | `product(list)` ; `negativesIn(list)` ; `signByParity(list)` (0 if a factor is 0) ; `opposite(a)` ; `square(a)` ; `factorize(k, a, b, op)` → both sides of k×a ± k×b = k×(a ± b) |
| L3 | `divide(a, b)` (throws on b = 0) ; `quotientSign(a, b)` ; `missingFactor(b, a)` ; `isFiniteDecimal(r)` ; `writingsOf(a, b)` → `['-a/b','a/-b','-(a/b)']` texts with equal values ; `sameValue(x, y)` ; `evaluate(exprText)` → `{ value, steps[] }` for + − × ÷ and brackets with the priority rules (the series of P4 and every oracle's parser) |

Each lab keeps its own logic in `apps/web/src/lessons/common/manipulations/logic/<lab>.js` on top of this module.

## The unit's تحدّ and where it goes

The book's تحدّ (p. 6) has two parts. ① « 2017 equal relative numbers have sum −2017: what is their product? » — each number is
−1, an odd count of factors (−1): the product is −1. It needs exactly the parity rule → **`jidaa-ida-nisbiya`, مسألة 1 (module 5)**,
redesigned with 2025 numbers. ② « all decompositions of −36 as a product of relative integers » → **the synthesis, training situation 5**
(9 unordered pairs: (−1)×36, 1×(−36), (−2)×18, 2×(−18), (−3)×12, 3×(−12), (−4)×9, 4×(−9), (−6)×6). The units file
(`units_3am_2026_2027.json › aadad-nisbiya.challenge`) keeps the book's text for now; owner question 1 in each plan.

## Corpus at a glance (`docs/sources/moyen/exams/exams-index.json`)

13 exercises hit `3am.m1.r01` / `r02` — 12 unique (`3am-s1-114` duplicates `3am-s1-109`), all term 1 (badge « على منوال اختبار الفصل
الأول »): `3am-s1-1` ex 1, `3am-s1-2` ex 3 and ex 6 (booklet, models 5 and 7), `3am-s1-4` ex 1, `3am-s1-5` ex 1, `3am-s1-103` ex 1,
`3am-s1-104` ex 1, `3am-s1-108` ex 1, `3am-s1-109` ex 1, `3am-s1-110` ex 1, `3am-s1-113` ex 1, and the misfiled 3AM paper `1am-s1-100`
ex 1 (header « سنة ثالثة متوسط », term 1). Almost every one mixes products, quotients and series — each lesson plan says which steps
it keeps as `term_exam` and which become `counted: false`.

## Owner questions common to the unit

1. The net has no link from `2am.m1.r03` (distributivity) to `3am.m1.r01`, nor from `2am.m1.r01` (priority) / `2am.m4.r06`
   (algebraic sum) to `3am.m1.r02`, although lessons 1–3 lean on them. The plans measure them in « أستعدّ » as extra `priorKnowledge`
   (allowed) — should the net gain these `requires` links?
2. `adad-natiq` (unit 2) has a draft الكفاءة « تعيين إشارة عدد ناطق وكتابته بمقام موجب » that overlaps `qismat-nisbiyayn` P3 (the book
   puts −a/b = a/−b = −(a/b) on p. 12 of unit 1). Proposal: unit 1 owns it; `adad-natiq` recalls it (no-duplication rule).
3. This synthesis would be the FIRST 1AM–3AM synthesis generated. It needs one `pointsToLearn` entry
   (`3am_wadiya-idmajiya-aadad-nisbiya_P1`, like the 4AM syntheses) although its catalogue entry has `programmeItems: []`.
