# 3AM unit 2 « العمليات على الكسور والأعداد الناطقة » — generation plans (planner, 2026-10-25)

These are plans only. Nothing in this folder is a lesson, a lab, a bank or an extraction. A Sonnet lead generates ONE lesson at a
time from its plan, in the order below, and publishes each lesson (guide §11) before the next one starts. The numbers in every plan
were recomputed with exact fractions while planning.

## The unit in one paragraph

Textbook unit 2 covers book pp. 22–37, which are PDF pp. 23–37:
- In this unit **PDF = book + 1** (the opener, book p. 22, is PDF p. 23).
- Book p. 37 (« أوظّف تكنولوجيات الإعلام والاتصال ») is **missing from the scan** (`textbook-map.json › scanIssues`): PDF p. 37 is
  book p. 36.

What the student brings into this unit:
- **From 2AM** (unit `kusur-amaliyat`, its fraction lessons NOT published): multiplying two fractions, and comparing, adding and
  subtracting two fractions when the denominators are equal or one is a multiple of the other.
- **From 3AM unit 1** (`aadad-nisbiya`, generated just before this unit): the product and the quotient of relative numbers.
- **From 1AM** (published): `hasil-qisma-kasr` (a/b is the quotient a ÷ b) and `ikhtizal-kitaba-kasriya` (equal fractions,
  reducing a fraction).

The unit finishes the arithmetic of fractions and then turns fractions into a new set of numbers:
- the **reciprocal** of a non-zero number, and division by a fraction done as multiplication by its reciprocal (r03, r04);
- **equality and comparison** of any two fractions: the cross products and a common denominator (r05);
- **sum and difference** of any two fractions through a common multiple of the denominators, preferably the smallest (r06);
- the **rational number** a/b with a and b relative (b ≠ 0): its writings with a positive denominator, its place on a line, and order
  (r07);
- the **four operations on rationals** and chains of calculations (r08).

Downstream, 4AM needs:
- `ikhtizal-kasr` (irreducible fraction through the PGCD);
- `natiqa-ghayr-natiqa` (rational versus irrational — it starts from this unit's definition);
- `amaliyat-judhur` (quotients of roots);
- `talis-hisab-atwal` (equal ratios, and a missing length by cross products — net link `3am.m1.r08 → 4am.m2.r01`).

In the same year, the published `tabsit-hadhf-aqwas` (`3am.m1.r08 → 3am.m5.r01`) and the coming `qimat-ibara-harfiya` and
`muqaranat-natiqayn` compute with rationals.

## Lessons, in generation order (= catalogue order 4 → 9)

| # | Code | Title | Items | Lab (new type) | What the hand holds | Gesture family · drawn world | Plan |
|---:|---|---|---|---|---|---|---|
| 1 | `maqlub-qismat-kasrayn` | مقلوب عدد وقسمة كسرين | r03, r04 | `gear-crank` « دوّاسة الدرّاجة » | the number of PEDAL turns (a fraction, one tooth = 1/F turn) | crank-rotate · a bicycle on a workshop stand | [`maqlub-qismat-kasrayn.md`](maqlub-qismat-kasrayn.md) |
| 2 | `tasawi-muqaranat-kasrayn` | تساوي كسرين ومقارنتهما | r05 | `shade-match` « آلة مزج الألوان » | the NUMERATOR c: blue shots dispensed into a bucket of d white | press-and-hold a dispenser lever · the paint shop's tinting machine | [`tasawi-muqaranat-kasrayn.md`](tasawi-muqaranat-kasrayn.md) |
| 3 | `jam-tarh-kasrayn` | جمع وطرح كسرين | r06 | `seed-rake` « مشط الشتلات » | the common UNIT 1/N: the rake's teeth spacing | stretch a rake · the school garden's planting bed | [`jam-tarh-kasrayn.md`](jam-tarh-kasrayn.md) |
| 4 | `adad-natiq` | العدد الناطق | r07 | `number-line-pegs` « حبل الأعداد » | the POSITION where a card bearing a WRITING a/b is hung | carry and hang a card · a line strung across the courtyard | [`adad-natiq.md`](adad-natiq.md) |
| 5 | `amaliyat-natiqa` | العمليات على الأعداد الناطقة | r08 | `merge-board` « لوحة الدمج » | the predicted SIGN of each merge, the divisor to flip, the order of the merges | tap two neighbours to merge · an arcade puzzle cabinet | [`amaliyat-natiqa.md`](amaliyat-natiqa.md) |
| 6 | `wadiya-idmajiya-kusur-natiqa` | أدمج تعلّماتي — العمليات على الكسور والأعداد الناطقة | — | none (synthesis) | — | — | [`wadiya-idmajiya-kusur-natiqa.md`](wadiya-idmajiya-kusur-natiqa.md) |

The five labs use five different gesture families and five different worlds. None of them reuses or reskins the shipped labs:
- `fraction-knife` holds the number of equal pieces d of ONE fixed share;
- `fair-share` holds the share of one child through two steppers, round cakes;
- `egg-trays` holds a dividend swept into trays of b;
- `fraction-reduction` (4AM) carries portions in a kitchen;
- `fourth-gauges` holds the missing cell of a price table.

They also differ from the labs planned by the sibling planners in units 1, 3, 4 and 5 (checked against their `plan/README.md` on
2026-10-25):
- unit 1: `elevator-reel` (scrub a timeline), `robot-track` (carry and tap-flip cards), `code-lockers` (code wheels);
- unit 3: `ten-zoom`, `unit-ladder`, `size-ladder`;
- unit 4: `marble-run`, `difference-meter`;
- unit 5: `loom-threads`, `scoop-scale` (press-and-hold pour on a spice scale).

`shade-match` uses press-and-hold too, but it dispenses DISCRETE shots that a counter names. It is not a pour onto a scale, and it
judges the result by a colour meter, not a weight.

## Is catalogue order the best generation order? — Yes, keep it

| Lesson | Needs | Can go before / after |
|---|---|---|
| `maqlub-qismat-kasrayn` | 2AM product of fractions (unpublished: measured in « أستعدّ ») and `qismat-nisbiyayn` (a ÷ b = q ⇔ b × q = a; unit 1, published before) | does NOT need `tasawi-muqaranat-kasrayn`: dividing by c/d never compares or equalises denominators. It may come first (the book's نشاط 1). |
| `tasawi-muqaranat-kasrayn` | 2AM comparison (unpublished) | must come BEFORE `jam-tarh-kasrayn`, because it is the first to write two fractions with a common denominator taken from a common multiple of the denominators. |
| `jam-tarh-kasrayn` | the common denominator (recalled from `tasawi`), the 2AM sums | then refines « a common multiple » into « the SMALLEST » one: the book's method of listing the multiples of the larger denominator. |
| `adad-natiq` | `hasil-qisma-kasr` (1AM, published), `qismat-nisbiyayn` (unit 1) | uses common denominators to ORDER signed fractions, so it comes after `tasawi`. It is independent of `maqlub` and `jam-tarh`. |
| `amaliyat-natiqa` | all four, and `jidaa-adadayn-nisbiyayn` | last. |

So `maqlub` may come first or anywhere before `amaliyat`, and the only hard constraints are `tasawi` → `jam-tarh` → `amaliyat` and
`tasawi` → `adad-natiq` → `amaliyat`. Catalogue order satisfies all of them and follows the book. **Keep 4 → 9.**

One gap in the net (owner question 1 below): there is no link `3am.m1.r05 → 3am.m1.r06`. So `jam-tarh-kasrayn` may RECALL `tasawi`'s
common denominator in a « تذكّر » box, but it may not write a cross-lesson `pointPrerequisites` edge toward it.

## Boundaries — who owns what (written ONCE here; the first lead copies it into `build-extraction.py`'s header)

- **2AM bases — recalled, never rebuilt.** These lessons are all unpublished at generation time:
  - `jida-kasrayn` (a/b × c/d, a fraction of a number);
  - `muqarana-kasrayn` (same denominator, same numerator, one denominator a multiple of the other, compared with 1);
  - `jam-tarh-kusur` (the same cases for sums and differences, and 1 − a/b);
  - `kasr-hasil-qisma` (equal writings ka/kb, a decimal division turned into a natural one).

  This unit uses all of them freely and measures them in « أستعدّ ». The net links are `extends` (r05 ← 2am.m1.r08, r06 ← 2am.m1.r09)
  and `requires` (r03 ← 2am.m1.r07). Each lesson builds only the added value: « كسرين كيفيين بتوحيد المقامات ».
- **3AM unit 1 — recalled.** `qismat-nisbiyayn` owns a ÷ b = q ⇔ b × q = a, the quotient's sign rule and −a/b = a/(−b) = −(a/b),
  (−a)/(−b) = a/b (the unit-1 planner's README, owner question 2 — agreed). `jidaa-adadayn-nisbiyayn` owns the product sign rule.
- **`maqlub-qismat-kasrayn`** owns:
  - the reciprocal of a non-zero natural, decimal or POSITIVE fraction (1/a, b/a), with the property x × (reciprocal of x) = 1;
  - 0 has no reciprocal;
  - « ÷ b = × 1/b »;
  - a/b ÷ c/d = a/b × d/c with natural terms, simplifying before multiplying;
  - a compound fraction (a/b)/(c/d) with positive terms.

  It never takes the reciprocal of a NEGATIVE number (that is `amaliyat-natiqa` P3, following the book: know-1 has natural a, b;
  know-6 has −3 → −1/3). It never adds fractions.
- **`tasawi-muqaranat-kasrayn`** owns:
  - a/b = c/d ⇔ ad = bc, both directions, including finding a missing term (x/16 = 5/8);
  - comparing two positive fractions with ANY denominators, by a common denominator built from a common multiple (the product of the
    denominators always works);
  - choosing a method: cross products, comparison with 1 or with an intermediate fraction, same numerator.

  It never adds, and never compares SIGNED fractions (`adad-natiq`).
- **`jam-tarh-kasrayn`** owns:
  - the sum and the difference of two or more POSITIVE fractions (natural terms, a natural written as a fraction), when no denominator
    is a multiple of the other;
  - the smallest common multiple of the denominators, found by listing the multiples of the larger one;
  - reducing the result.

  A difference whose result is NEGATIVE (8/15 − 4/3) is `amaliyat-natiqa`'s.
- **`adad-natiq`** owns:
  - the rational number: the quotient of a relative number by a non-zero relative number;
  - the inclusions (naturals, relative integers and relative decimals are rationals);
  - writing a rational as a/b or −a/b with a positive denominator;
  - equal writings of the same rational;
  - placing rationals on a graduated line, comparing and ordering them by a common positive denominator and the order rules of relative
    numbers (the book's method p. 29 « مقارنة عددين ناطقين »);
  - writing a rational as an integer plus a fraction smaller than 1.

  It does NOT own:
  - the sign rule of a quotient (recalled from `qismat-nisbiyayn`);
  - « decimal or not, approximate value » (1AM `hasil-qisma-kasr` P3, published: USED, never rebuilt);
  - comparing through the sign of a DIFFERENCE (3AM unit 4 `muqaranat-natiqayn`, `3am.m5.r04`);
  - irrationals and π (4AM `natiqa-ghayr-natiqa`: the book's « π is not rational » line is NOT posed).
- **`amaliyat-natiqa`** owns:
  - the sum, difference, product and quotient of two rationals (signs and fractions together, decimal numerators included);
  - the reciprocal of a negative rational;
  - chains of calculations with priorities and brackets, and compound fractions;
  - evaluating such chains at given rational values of letters (x = 3/4, y = −1/6) as a COMPUTATION.

  It does not own the logic of substitution (`qimat-ibara-harfiya`) or solving equations (unit 5). « Find x » items whose answer is one
  operation (6/8 + x = −5/7, −3/5 × x = −6/7) are kept as a missing term found by the inverse operation, as in 2AM. They are never
  solved as equations with the transformation rules.
- **`wadiya-idmajiya-kusur-natiqa`** introduces no new knowledge. It has six training situations, the analysed final situation (the
  unit's تحدّ, redesigned), and the final test.

## Shared maths module — `packages/core/arithmetic/fractions3.js` (new; created by lesson 1, grown lesson by lesson)

Exact fractions on top of the BigInt rationals of `powers.js` (`rat`, `add`, `sub`, `mul`, `div`, `inverse`, `neg`, `sign`, `eq`,
`ratText`, `ratTex`, `parseRat`):
- **Import them; never re-implement them.** If unit 1 already created `relativeOps.js` (its README), import `parseRel` / `relText`
  from it instead of writing another parser.
- **Import by PATH**, never through the core barrel (BUNDLE_BOUNDARIES §3–§4).
- The unit-4 planner expects this module (its README: « if the unit-2 planner's lessons created a fraction module (e.g.
  `fractions3.js`), `orderSign.js` imports its parser »). Keep the name.

`powers.js › rat` REDUCES. The labs and exercises also need UNREDUCED writings (6/8 must stay 6/8 on a card), so the module adds a
raw pair `{ n, d }` (BigInt, d ≠ 0, never reduced) beside `rat`.

| Added by | Functions (pure, tested in `fractions3.test.js`) |
|---|---|
| L1 `maqlub` | `raw(n, d)` (throws on d = 0) · `valueOf(raw)` → rat · `rawTex(raw)` · `reciprocal(x)` (throws on 0; x may be a natural, a decimal string « 0,8 » or a raw) → raw `b/a` · `isReciprocalPair(x, y)` (x·y = 1) · `divideFractions(p, q)` → `{ product: [p, flip(q)], value }` · `simplifyBeforeMultiply(p, q)` → the cancelled factors (gcd pairs) and the result · `gearTurns(F, R, teeth)` → `{ pedal: teeth/F, wheel: teeth/R }` |
| L2 `tasawi` | `crossProducts(p, q)` → `[pn·qd, pd·qn]` · `sameFraction(p, q)` · `compareFractions(p, q)` → −1 / 0 / 1 · `lcm(a, b)` (on `gcd` from `divisibility.js`) · `commonMultiples(b, d, limit)` · `toDenominator(p, N)` (throws if N is not a multiple of p.d) · `missingTerm({ a, b, c?, d? })` (a/b = c/d, one unknown; returns raw or `null` if not an integer when `integerOnly`) · `matchNumerator(a, b, d)` → `{ exact, c, below, above }` |
| L3 `jam-tarh` | `isCommonMultiple(N, dens)` · `smallestCommonMultiple(dens)` · `multiplesUntil(b, d)` (the book's list) · `cellsOf(p, N)` (null if not whole) · `sumWith(terms, N)` (terms with sign) → `{ cells[], total: raw(Σ, N), reduced }` · `widestUnit(dens, maxN)` |
| L4 `adad-natiq` | `normalize(raw)` → `{ sign, n, d }`, d > 0, reduced · `writingsEqual(r1, r2)` · `isDecimalRational(x)` (reduced denominator of the form 2^i·5^j) · `twelfths(x)` (null if not k/12) · `integerAndFraction(x)` → `{ k, frac }` (−17/3 = −6 + 1/3 AND the « −5 − 2/3 » reading: record which one the plan uses) · `sortRationals(list)` |
| L5 `amaliyat` | `parseChain(text)` → tree (+ − × ÷, brackets, fraction bars, decimals in numerators) · `mergeable(chain, i)` (priority: a × / ÷ link binds tighter, brackets first) · `merge(chain, i)` → `{ chain, step }` · `resultSign(op, p, q)` · `evaluateChain(text)` → `{ value, steps[] }` (also the oracle's reference — but oracles use their own `helpers.mjs` code) |

Each lab keeps its own state logic in `apps/web/src/lessons/common/manipulations/logic/<lab>.js` on top of this module.

## Seeding the unit and the whole-unit extraction — lesson 1 (`maqlub-qismat-kasrayn`) does both

The unit is **NOT seeded**: `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/kusur-natiqa/` does not exist. It has **no
extraction**: `docs/sources/3am/unit2/` holds only this `plan/`. The lead of `maqlub-qismat-kasrayn`:

1. **Seeds `…/kusur-natiqa/_unit/`**, copying the shape of `…/quwa-nisbiya/_unit/`:
   - `unitMeta.js`: `UNIT_ID 'kusur-natiqa'`, `UNIT_TITLE 'العمليات على الكسور والأعداد الناطقة'`, `CHAPTER_ID 'ansab_al_aadad_wal_hisab'`,
     `CHAPTER_TITLE 'ميدان الأنشطة العددية'`, `GRADE_ID '3am'`, `GRADE_LABEL 'السنة الثالثة متوسط'`,
     `PRINT_SUBJECT 'الرياضيات · السنة الثالثة متوسط'`, `src`, `addition`;
   - `lessonRoutes.jsx` and `moduleContext.js`;
   - `prepDiagnostic.jsx` and `prepDiagnostic.test.js`, compared with the unit's `available` catalogue lessons. The test is red until
     the publish flip, by design.
2. **Sets `units_3am_2026_2027.json › kusur-natiqa.challenge.sourceElementId: "challenge"`.** Without it, `check:textbook` reports the
   `unit` destination uncited. Owner question 2 decides whether the card's text is rewritten.
3. **Writes `docs/sources/3am/unit2/build-extraction.py` → `extraction.json` for the WHOLE unit** (book pp. 22–36):
   - answers computed with `fractions.Fraction` and asserted;
   - `verified: True` for every element destined to lesson 1, `False` for the others (each lead re-reads its own at 200–250 dpi);
   - the boundary block above goes in the header;
   - expressions in the scan are LTR islands: read them left to right. `prep` item 7 is 4/3 − 8/15 = 4/5, item 11 is (−8) − (−12) = 4,
     and item 12 is (−7) ÷ (−2) = 7/2 — the only readings that match the printed options (zoom at 220 dpi).
4. **Records `ict` (book p. 37) as MISSING from the scan.** Decision D11 normally GENERATES a missing page in the book's format as a
   declared platform addition. Proposal: a short calculator activity destined to `amaliyat-natiqa` module 7, or skip with a discrepancy
   note (owner question 3).
5. **Fixes the catalogue `textbookRef.pages`** — today the first three lessons all point to activity 24 / knowledge 26 / method 27:

   | Lesson | activity | knowledge | method |
   |---|---|---|---|
   | `maqlub-qismat-kasrayn` | [24, 24] (act-1) | [26, 26] (know-1, know-2) | **`null`** — p. 27 has no division method; module 3 is a declared `addition('knowledge_formalization')` (guide « A textbook page that belongs to another lesson ») |
   | `tasawi-muqaranat-kasrayn` | [24, 24] (act-2, act-3) | [26, 26] (know-3) | [27, 27] (method-1…4) |
   | `jam-tarh-kasrayn` | [24, 24] (act-4) | [26, 26] (know-4) | [27, 27] (method-5, 6) |
   | `adad-natiq` | [25, 25] (act-5) | [28, 28] (know-5) | [29, 29] (method-10 only) |
   | `amaliyat-natiqa` | [25, 25] (act-6) | [28, 28] (know-6) | [29, 29] (method-7, 8, 9) |

### Element ids and destinations

Module numbers: 0 أستعدّ · 1 نشاط · 2 معارف · 3 طريقة · 4 أتمرّن · 5–7 مسائل · 8 إختبار أولي. `None` means the bank cites it (one adapted
exercise). Lessons are abbreviated: L1 maqlub, L2 tasawi, L3 jam-tarh, L4 adad-natiq, L5 amaliyat, S synthesis.

| Element (book p.) | What it is | Destination |
|---|---|---|
| `objectives` (22) | the « سأتعلّم » list | `{ lesson: 'unit', module: 'page' }` |
| `opener` (22) | history box (Abu al-Wafa al-Buzjani, al-Kashi) | S module 0 (a « هل تعلم » remark, rewritten), or `unit` |
| `challenge` (22) | Hisham's piggy bank 1/4, 1/5, 2/3 of the rest → 11/60 | S modules 7–8 (redesigned, see the synthesis plan) + the unit card |
| `prep` (23) items 1–12 | 12 multiple-choice items | split by `items`: 1, 2 → L1 m0 · 3, 4, 5 → L2 m0 · 6, 7 → L3 m0 · 8, 12 → L4 m0 · 9, 10, 11 → L5 m0 |
| `act-1` (24) | division of fractions (strip 3/4 ÷ 2) | L1 m4 (application, own numbers) |
| `act-2` (24) | proof of the cross-product property | L2 m2 (the reasoning, own numbers) |
| `act-3` (24) | four pairs to compare « بالطريقة المناسبة » | L2 m4 |
| `act-4` (24) | sum and difference by pie charts | L3 m4 |
| `act-5` (25) | rational number: decimal or not, signs, line, order | L4 m4 (its line task feeds m1's advanced level, own numbers) |
| `act-6` (25) | products, sums, quotients of rationals | L5 m4 |
| `know-1` (26) | reciprocal | L1 m2 |
| `know-2` (26) | division property | L1 m2 |
| `know-3` (26) | equal fractions (×k, ÷k), cross products, comparison rule, 3 examples | L2 m2 |
| `know-4` (26) | sum / difference rule, 2 examples | L3 m2 |
| `know-5` (28) | rational number, examples (π line NOT posed) | L4 m2 |
| `know-6` (28) | operations on rationals (+ −, ×, reciprocal, ÷) | L5 m2 |
| `method-1` (27) | 132/56 = 33/14 by cross products | L2 m3 |
| `method-2` (27) | ≠ by units digits of the cross products | L2 m3 |
| `method-3` (27) | 122/76 vs 54/317 through 1 | L2 m3 |
| `method-4` (27) | 10/3 vs 7/4 through the common multiple 12 | L2 m3 |
| `method-5` (27) | A = 29/18 + 11/18, B = 5/4 + 31/12 | L3 m0 (2AM cases: a recall) |
| `method-6` (27) | C = 8/25 − 4/15 through the multiples of 25 | L3 m3 |
| `now-1` (27) | are the fractions equal? (2018/2017…) | L2 m4 |
| `now-2` (27) | compute A, B, C, D | L3 m4 |
| `method-7` (29) | A = −5/7 + 3,2/4 | L5 m3 |
| `method-8` (29) | B = −4,7/12 − 5,1/16, the smallest common multiple 48 | L5 m3 |
| `method-9` (29) | D = 7/3 − 8/15 ÷ 11/20 (book MISPRINT: 23/33, the right value is 15/11) | L5 m3 |
| `method-10` (29) | compare −5,7/9 and −3,9/6 | L4 m3 |
| `now-3` (29) | compute A, B, C, D (irreducible) | L5 m4 |
| `ex-1`, `ex-2` (30) | reciprocals | L1 m4 |
| `ex-3` (30) | table: number, reciprocal, opposite (negatives, and the trap 0,33) | L5 (bank) |
| `ex-4`…`ex-7` (30) | products, simplify then compute, divisions | L1 (m4 or bank) |
| `ex-8`, `ex-12`…`ex-17` (30) | equal fractions, same denominator, order, cross products, without a common denominator | L2 (m4 or bank) |
| `ex-9`, `ex-10` (30) | decimal writings → fractions, reduce | L2 m0 / bank (recall) |
| `ex-11` (30) | smallest common multiple of pairs | L3 m3 / bank |
| `ex-18`…`ex-21` (30–31) | mental sums, smallest common denominators, sums | L3 |
| `ex-22`…`ex-33` (31) | classify, write a/b, signs, approximations, integer + fraction, compare, order, line | L4 |
| `ex-34`…`ex-41` (31–32) | rational sums, differences, grouping, calculator, find x, pyramid | L5 |
| `ex-42`…`ex-54` (32) | products, quotients, calculator, number grid, verify, compound fractions, a and b, find x | L5 |
| `self-1`, `self-7`, `self-11` (33) | 4/3 ÷ 8/9; B = (2/5)/8; « 3/14 is the result of » | L1 m8 / bank |
| `self-2`, `self-3` (33) | 5/18 + 1/12; « 17/24 is the result of » (two right options) | L3 |
| `self-4`, `self-9`, `self-10` (33) | approximation of 39/17; compare 12,2/(−7,6) and −5,4/3,17; −3/7 against three numbers | L4 |
| `self-5`, `self-6` (33) | 2,2/3 + (−5,3)/4; 2/3 − 2/3 × 5/7 | L5 |
| `self-8`, `self-12` (33) | reciprocal of 3/7 + 3/5; x/z from x/y and y/z | S m0 |
| `deep-55` (34) | « equal by calculator, different by units digits » | L2 m4 |
| `deep-56` (34) | 41/9 not decimal, integer + fraction | L4 |
| `deep-57`, `deep-58`, `deep-60`, `deep-63`, `deep-64`, `deep-66`, `deep-68` (34) | continued fraction, values at x, y, z, pairs from a list, order of opposites and reciprocals, nested fractions, telescoping product, compare A and B at four x | L5 (m4 or bank) |
| `deep-59` (34) | rectangle: width = area ÷ length (15/4 ÷ 27/4) | L1 m4 |
| `deep-61` (34) | triangle area with fraction lengths | S (training situation 6, redesigned) |
| `deep-62`, `deep-65`, `deep-80` (34–35) | 87/60 = … + 1/x; 3/4 = 2 − 1/5 − 1/x; Egyptian fractions | L3 |
| `deep-67` (34) | write a problem for 3/5 × 9 + 7/5 | S bank |
| `deep-69` (34) | place −1/5 on a line marked −1/4, −1/6 | L4 |
| `deep-70` (34) | 2/3 sold, then 3/5 of the rest → 2/15 | S (training situation 2 register) |
| `deep-71` (35) | 15 pupils = 3/4 of 5/6 of the class → 24 | L1 m7 (redesigned) |
| `deep-72`, `deep-75`, `deep-78` (35) | land shares + price; butter from milk; survey 400 → 600 | S |
| `deep-73`, `deep-76`, `deep-77`, `deep-79` (35) | A and B (B natural); values at x, y, z; prove A natural; calculation programme | L5 |
| `deep-74` (35) | bicycle paid 3/8 + 2/5 + 1/8 → 10 % discount | L3 m6 (redesigned) |
| `integration` (36) | the pool tiled over three days (book misprint 59/7: the right value is 57/7) | S training situation 1 (redesigned) |
| `evaluation` (36) | four siblings: x, y, z, then 900 DA | S training situation 2 (redesigned) |
| `ict` (37) | missing from the scan | owner question 3 |

**Discrepancies to record** (`discrepancies[]`):
1. `method-9`: D = 7/3 − 32/33 = 77/33 − 32/33 = **15/11**. The book writes « 55/33 − 32/33 = 23/33 »: it used 5/3 in place of 7/3.
2. `integration` « حل مختصر »: day 2 = 3/7 × 19 = **57/7 m²**, not 59/7. The area tiled on day 3 is 19 − 57/7 = 76/7 m². The pool's
   tiled surface is floor + 4 walls = 9 + 13,5 + 6 = 28,5 m², and day 1 = 9,5 m² is right.
3. `prep` 7, 11, 12 and every island in the scan read LTR (see step 3 above).
4. `self-3` has TWO right options: 5/24 + 1/2 = 17/24 and 15/8 − 7/6 = 17/24 (« الإجابات الصحيحة » allows it).
5. `self-10`: options (a) and (b) are both true (−3/7 > −5/7 and −3/7 < −1/7); (c) is false.
6. `ex-3` writes 0,33 as the reciprocal of 3. It is an approximate value, not the reciprocal (1/3): keep it as a trap, never as a key.

## The unit's تحدّ and where it goes

The book (p. 22) has Hisham pay 1/4 of his savings, then 1/5, then 2/3 of the remainder. What is left is (1 − 1/4 − 1/5) × 1/3 =
11/20 × 1/3 = **11/60**. It needs `jam-tarh` (1 − 1/4 − 1/5) and the 2AM product, so it belongs at the END of the unit:
- **the synthesis analyses it in module 7** (« تحليل الوضعية النهائية للاختبار »);
- **module 8 evaluates it** (« وضعية الاختبار النهائي »), with platform numbers and context: 1/3, then 1/4, then 3/5 of the
  remainder → 1/6, then the total from 1/6 = 1500 DA → 9000 DA. This is the unit-1 / 4AM synthesis shape.

The unit card keeps citing the element `challenge` (`sourceElementId`). Owner question 2 decides whether the card's text is rewritten in
platform words.

## Corpus at a glance (`docs/sources/moyen/exams/exams-index.json`)

Counts are distinct exercises. `3am-s1-114` duplicates `3am-s1-109`, and `3am-s1-110` ex 5 repeats `3am-s1-3` ex 4. Almost all papers
are term 1 (badge « على منوال اختبار الفصل الأول »).

| Item | Exercises | Best candidates |
|---|---:|---|
| r03 reciprocal | 3 | `3am-s1-104` ex 1 (reciprocal of A ÷ B), `3am-s1-109` ex 1, `3am-s1-113` ex 1 |
| r04 division | 13 | `3am-s1-1` ex 2, `3am-s1-2` ex 4 / ex 7, `3am-s1-103` ex 2 (Q = N/3 ÷ M), `3am-s1-104` ex 2, `3am-s1-108` ex 2, `3am-s1-110` ex 2, `3am-s2-69` ex 1, `3am-s2-72` ex 1, `3am-s2-75` ex 1, `3am-s3-59` ex 1, misfiled `1am-s1-100` ex 2 |
| r05 compare | 6 | integration parts: `3am-s1-3` ex 4 (which vegetable has the largest share: 1/4, 2/6, 10/24), `3am-s1-103` ex 5 (which day tiled most: 2/3, 1/12, 1/4), `3am-s1-104` ex 5, `3am-s1-108` ex 5; `3am-s1-104` ex 2 (compare K and E); `3am-s3-47` ex 1 (QCM) |
| r06 sum / difference | 22 | the r04 compute exercises, plus the fraction-of-remainder situations `3am-s1-1` ex 3 (phone credit), `3am-s1-5` ex 5 (Skikda cable car), `3am-s1-109` ex 5 (orchard), `1am-s1-100` ex 5, `3am-s3-56` ex 5 |
| r07 rational | 1 | `3am-s1-109` ex 2 (« show that … is a natural number ») — a gap |
| r08 operations | 15 usable | the compute exercises, `3am-s1-4` ex 1 (sign without computing), `3am-s1-5` ex 1 / ex 2 (area with fraction sides); `3am-s2-78` is unreadable |

Each plan says how many sheets can be FAITHFUL `term_exam`, and is honest that `adad-natiq` has almost none.

## Owner questions common to the unit

1. **Net link `3am.m1.r05 → 3am.m1.r06` (requires)?** The book's sums reuse the common denominator of the comparison lesson, and the
   catalogue lists « تساوي كسرين » as a prerequisite of `jam-tarh-kasrayn`. Without the link, `jam-tarh` may only RECALL `tasawi` (a
   « تذكّر » box) and cannot write a cross-lesson LP edge. Should the net gain it (`npm run generate:learning-net` + the queue)?
2. **The unit card's تحدّ shows the book's text verbatim** (`units_3am › kusur-natiqa.challenge.textAr`). Rewrite it in platform words?
   - Option A: same numbers, new context.
   - Option B: the synthesis' numbers (1/3, 1/4, 3/5 → 1/6).

   Unit 6 rewrote its card « with its data ». The plans assume the card is kept until you decide, and that the synthesis poses option B.
3. **The missing ICT page (book p. 37).** Generate a platform calculator activity (D11) for `amaliyat-natiqa` module 7, or record it as
   missing?
4. **Draft الكفاءات reworded to avoid duplicating 2AM / unit 1.** Each plan lists the change and its reason:
   - `tasawi` P2 and P3: same denominator and same numerator are 2AM;
   - `jam-tarh` P1: same denominator is 2AM;
   - `adad-natiq` P2: the sign of a quotient is `qismat-nisbiyayn` P3.

   Positions are kept (LP ids are positional), but the MEANING of these three draft LPs changes. Confirm.
5. **The added value of r05 in the net says « … وبإشارات »**, but the book compares SIGNED fractions only in the rational section
   (p. 29, ex-27…33). The plans put signed comparison in `adad-natiq` P3, not in `tasawi`. Confirm.
