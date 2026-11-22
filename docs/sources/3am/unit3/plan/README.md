# 3AM unit 3 « القوى ذات أسس نسبية صحيحة » — generation plan (Phase 0, owner priority, 2026-10-25)

Book pp. 38–53 (pdf = book, offset 0). Programme segment `3am.m3` (items r01–r08). Catalogue: `packages/core/curriculum/dz/lessons_3am_2026_2027.json`
orders 10–14. **The unit is already seeded** (`apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/quwa-nisbiya/_unit/`) and **extracted
whole** (`docs/sources/3am/unit3/extraction.json`, built by `build-extraction.py`). Both were written with the published lesson
`quwat-adad-nisbi` (order 13, textbook-LAST, generated FIRST on 2026-10-21; lab `power-train`). No remaining entry seeds anything: each one
moves its own « pending » destinations in `build-extraction.py` and re-runs it. Elements destined to the remaining lessons are marked
`verified: False` there: **each lesson re-reads its own elements at 220+ dpi before citing them** (`pdftoppm -r 220 -f P -l P`).

## The unit in one paragraph

The unit turns « a number with many zeros » into a power. First the powers of TEN: 10ⁿ as n factors 10, 10⁰ = 1, 10⁻ⁿ = 1/10ⁿ, their
decimal writing (1 followed by n zeros / 1 at rank n after the comma), their names and the metric prefixes, and a decimal written with
powers of 10 (`quwa-adad-ashara`). Then the three rules on powers of ten, and computations a × 10ᵖ × b × 10ᵠ (`qawaid-quwa-ashara`).
Then the scientific writing a × 10ⁿ (1 ≤ a < 10), the bracket 10ⁿ ≤ A < 10ⁿ⁺¹ and the order of magnitude used to compare very large and very
small quantities (`kitaba-ilmiya-rutba`). Finally — already published — the power of ANY relative number, its sign, the five rules and the
priority of powers (`quwat-adad-nisbi`), and the synthesis.

## Order of generation (the remaining four)

**Catalogue order, strictly sequential** — the net's `requires` chain is r01 → r02 → r03 → r04 → r05 and each lesson's « أستعدّ » measures
the previous one:

| # | Entry | Order | Lab (new type) | What the hand holds | Seeds? |
|---|---|---|---|---|---|
| 1 | `quwa-adad-ashara` « قوى العدد 10 » | 10 | `ten-zoom` « عدسة القوى » | the EXPONENT of the frame side 10ⁿ m (zoom ring / pinch) | no (already seeded) |
| 2 | `qawaid-quwa-ashara` « قواعد الحساب على قوى العدد 10 » | 11 | `unit-ladder` « مسطرة التحويل » | the LENGTH of a band stretched between two unit plaques (columns crossed), and the columns-per-unit of the mode (length / area / volume) | no |
| 3 | `kitaba-ilmiya-rutba` « الكتابة العلمية ورتبة القدر » | 12 | `size-ladder` « سلّم الأحجام » | the POSITION of a number card on a logarithmic decade ladder: its rung n, then its cell inside the rung, then the magnet (rounding) | no |
| 4 | `wadiya-idmajiya-quwa-nisbiya` (synthesis) | 14 | — (synthesis: no lab) | — | no |

`quwat-adad-nisbi` (order 13) is published and is NOT regenerated. The synthesis comes last (it lists all four lessons).

## Boundaries — who owns what (written ONCE here; the plans refer to it)

| Lesson | Owns | Leaves to others / never does |
|---|---|---|
| `quwa-adad-ashara` | 10ⁿ (n ∈ ℕ*) = n factors 10; 10¹ = 10; 10⁰ = 1; 10⁻ⁿ = 1/10ⁿ; decimal writing (1 + n zeros; 1 at rank n after the comma); names (ألف … ألف مليار; جزء من عشرة … جزء من مليار); metric prefixes as powers of 10 (كيلو 10³ … نانو 10⁻⁹, octets); a decimal written with powers of 10: the مفكوك (3 985 = 3×10³ + 9×10² + 8×10¹ + 5×10⁰, 0,407 = 4×10⁻¹ + 7×10⁻³) and forms k × 10ⁿ with k given or an integer (45 000 = 45 × 10³, 0,07 = 7 × 10⁻²); comparing two powers of 10 by their exponent | NO product/quotient/power of powers (no 10³ × 10⁴, no 10⁹ / 10⁵ — a conversion that needs one is posed in decimal: « 1 Go = 1 000 000 000 octets »); NO normalisation 1 ≤ a < 10, no « الكتابة العلمية », no order of magnitude; no aⁿ for a ≠ 10 |
| `qawaid-quwa-ashara` | 10ᵐ × 10ⁿ = 10ᵐ⁺ⁿ, 10ᵐ / 10ⁿ = 10ᵐ⁻ⁿ, (10ᵐ)ⁿ = 10ᵐⁿ for m, n ∈ ℤ; one single power from a chain; computations a × 10ᵖ × b × 10ᵠ and (a × 10ᵖ)/(b × 10ᵠ) giving « عدد × قوة للعدد 10 » (21 × 10¹², 0,4 × … allowed: NOT normalised); conversions of length/area/volume units as products/quotients of powers | NOT the scientific writing (a result 21 × 10¹² stays as is; « اكتبه كتابة علمية » is the next lesson); no base other than 10 (the published `quwat-adad-nisbi` recalls these rules as a « تذكّر » box — keep the SAME three statements so the recall stays true) |
| `kitaba-ilmiya-rutba` | scientific writing a × 10ⁿ (1 ≤ a < 10, n ∈ ℤ) from a decimal, from k × 10ᵖ (35,2 × 10⁴), from a computation; bracket 10ⁿ ≤ A < 10ⁿ⁺¹ (A > 0); order of magnitude a' × 10ⁿ (a' = مدوّر a إلى الوحدة; a' = 10 is written 1 × 10ⁿ⁺¹); comparing / ordering quantities with it | recalls 1AM « رتبة مقدار » (`1am.m1.r06`, `extends`: noRebuild — a « تذكّر » box, builds only the added value); recalls the three rules (does not rebuild them) |
| `quwat-adad-nisbi` (published) | aⁿ for a relative ≠ 0, sign/parity, a⁰, a⁻ⁿ, the five rules, priority, −aⁿ vs (−a)ⁿ | — |
| synthesis | six training situations + final situation mobilising the four lessons; no new notion | no « أؤكّد تعلّماتي », no « أتعمّق » item cited (MASAIL guide §14) |

**Boundary with what is already published.** `quwat-adad-nisbi` already shows, as EXAMPLES, `10⁻³ = 1/1000 = 0,001` (its معارف box
`KNOWLEDGE.inverse`) and recalls `10³ × 10⁴ = 10⁷ , 10⁶/10² = 10⁴ , (10²)³ = 10⁶` (« تذكّر — قوى العدد 10 », `RECALL_TEN`). Its train teaches
« a product of n factors » for a general base with ×/÷ wagons and the coupling of two trains (product / quotient by « a × wagon and a ÷ wagon
cancel »). Consequences, binding on the three remaining labs (MANIPULATION_DNA §12):
- none of them may show a power as a row of unit factors built one by one, nor a quotient as « a factor and its inverse cancel »;
- `quwa-adad-ashara` must be about what is SPECIFIC to ten — decimal writing, ranks, names, sizes — not about « n factors » in general;
- `qawaid-quwa-ashara` reads the quotient as a DISTANCE between two marks (km and cm are 5 columns apart: 10³/10⁻² = 10⁵) and the power of a
  power as the columns-per-unit of area (×2) and volume (×3) tables — readings the train cannot give.

## Shared maths module (one, for the three lessons and the synthesis)

Create `packages/core/arithmetic/tenPowers.js` (+ `tenPowers.test.js`), imported BY PATH (`@smarter-academy/core/arithmetic/tenPowers.js`),
never through the core barrel (BUNDLE_BOUNDARIES §4). Exact arithmetic in BigInt: a decimal is `{ m: bigint, e: int }` = m × 10ᵉ (m ≠ 0
normalised without trailing zeros, sign in m). **Reuse, do not duplicate**: `placeValue.js › toArabicWords` (names up to 10¹¹) and
`decimals.js › partName / readFraction` (fraction names); `powers.js › rat` when a quotient is not decimal (e.g. 10⁻⁷ / (2,88 × 10⁻¹⁰)).

| Function | Lesson that adds it | Contract |
|---|---|---|
| `parseDec(text)` / `decText(v, {group:true})` | L1 | « 1 000 000 », « 0,000 001 » (U+00A0 groups of 3 in the INTEGER part only — the book writes 0,000001 ungrouped: keep `{ group: false }` for the fractional part), « 45 × 10^3 », « 3,52 × 10^5 », « −6,5 × 10^7 »; `null` on anything else |
| `pow10(n)` → `{m:1n, e:n}`; `pow10Text(n)`; `exponentOfPow10(text)` → n or `null` | L1 | ±12 at least; `exponentOfPow10('100 000') === 5`, `('0,0001') === -4`, `('120') === null` |
| `zerosOf(n)` (n ≥ 0: zeros after the 1) · `rankOfOne(n)` (n < 0: rank after the comma = −n) · `zerosBeforeOne(n)` (n < 0: −n zeros counting the units 0) | L1 | the three counts the lab and the misconceptions use |
| `pow10Name(n)` → « مليون », « جزء من ألف » … ; `PREFIXES` (T, G, M, k, h, da, —, d, c, m, µ, n, p with Arabic names and exponents) | L1 | names for −12 ≤ n ≤ 12 (extends `DEN_WORDS` locally to مليار / ألف مليار; « مائة » spelling as in `placeValue.js`) |
| `expanded(v)` → `[{digit, exp}]` and `expandedTex(v)` (« 5\times10^{3}+3\times10^{1}+7\times10^{-2} ») | L1 | empty ranks absent; wraps `decimals.decomposeDigits` semantics for BigInt values |
| `productExp(m, n)`, `quotientExp(m, n)`, `powerExp(m, n)`, `chainExp(steps)` | L2 | `steps = [{op:'×'|'÷'|'^', n}]` → the single exponent |
| `unitColumns(from, to, mode)` (mode 1 length · 2 area · 3 volume) and `UNIT_SCALE` (km … nm with their exponents in m) | L2 | `unitColumns('km','cm',1) === 5`, `('km','m',2) === 6`, `('m','cm',3) === 6`, `('mm','m',2) === -6` |
| `mulSci([...])`, `divSci(a, b)` on k × 10ᵖ | L2 | exact; returns `{k, p}` NOT normalised (21 × 10¹²) |
| `scientific(v)` → `{a, n}` (a as a decimal string 1 ≤ a < 10, sign kept) · `isScientific(k, p)` · `bracketOf(v)` → n (v > 0) · `orderOfMagnitude(v)` → `{a1, n1}` (round half up; a1 = 10 → `{1, n+1}`) · `compareDec(u, v)` | L3 | `orderOfMagnitude('9,85 × 10^5')` → `{1, 6}`; `orderOfMagnitude('2,5 × 10^-4')` → `{3, -4}` |
| `logPos(v, rungMin, rungMax)` → the abscissa of v on the decade ladder (for the lab view, float OK — never used for a verdict) | L3 | verdicts always through `bracketOf` / `scientific` |

The test file is extended by each lesson (never rewritten): round-trip `parseDec ∘ decText` over every power of 10 in ±12 and every
`k × 10^p` with k of ≤ 5 digits; the extraction's computed answers (now-43, ex-26, method-45a/b …) reproduced.

## Net, catalogue and extraction issues the coordinator must settle BEFORE generating entry 1

1. **BLOCKER — a forward review link.** The net has `3am.m3.r02 → 3am.m3.r03 (requires)`. r02 (rules) lives in `qawaid-quwa-ashara` (order 11)
   but r03 (« كتابة عدد عشري باستعمال قوى 10 ») lives in `quwa-adad-ashara` (order 10). So `reviewLinksForLesson('quwa-adad-ashara')`
   returns `qawaid-quwa-ashara` (status planned): its « أستعدّ » would have to MEASURE the rules before they are taught, and its « راجع قبل
   أن تنطلق » would send the student to the NEXT lesson. The book teaches r03 (p. 42–43) with the counting of zeros, not with the rules.
   **Recommended net edit:** replace `3am.m3.r02 → 3am.m3.r03` by `3am.m3.r01 → 3am.m3.r03`, and add `3am.m3.r02 → 3am.m3.r04` (the
   scientific writing of a computation result needs the rules — every term-exam exercise does it), then `npm run generate:learning-net`. If
   the owner refuses, `quwa-adad-ashara` treats r02 as a « renvoi en avant » (LEARNING_NET §4bis.6): a NON-measured mention only — and the
   prepDiagnostic audit must be told (owner decision).
2. **`kitaba-ilmiya-rutba › prerequisiteLessonCodes`** lacks `qawaid-quwa-ashara` (it lists `rutbat-miqdar-jam`, `quwa-adad-ashara`). With the
   net edit above it becomes a review link; add the code (catalogue edit by the coordinator).
3. **Extraction destinations of the synthesis.** `ex-63, ex-64, ex-68, ex-69` (أتعمّق) point to `wadiya-idmajiya-quwa-nisbiya`, which
   MASAIL_GENERATION_GUIDE §14 forbids (« أتعمّق never appear in أدمج تعلّماتي »: no module, no resource, no label in its bank). Re-destine
   them `module: "practice"` of `quwat-adad-nisbi` (their topic: powers of 2, 8 and doubling — its bank can add adapted sheets in a later
   pass; ex-64 is already the idea of its مسألة 2, the folded paper), or mark them `notIntegrated` with the owner's decision. `integration`,
   `evaluation` and `ict` stay with the synthesis (integration material, allowed).
4. **The unit's « 🏁 تحدّ ».** `units_3am › quwa-nisbiya.challenge` is the textbook's flowers challenge, already solved as
   `quwat-adad-nisbi`'s مسألة الدرس (masala-1, « حملة الكتب »). MASAIL §14 makes the unit's تحدّ = the synthesis's module-7 situation.
   Recommended: point it to the synthesis situation (« رقاقة الذهب », `sourceElementId: 'integration'`, page 52) when the synthesis is
   published; owner to confirm (the 4AM precedent keeps the textbook challenge only when module 7 already contains it — not the case here).

## The unit's تحدّ and where it goes

The textbook تحدّ (p. 38, flowers 1, 3, 9 → « 300 on day 10? ») is consumed: `quwat-adad-nisbi` masala-1 (rewritten). The remaining lessons
do NOT re-pose it. The synthesis's final situation (module 7 analysis, module 8 test) becomes the unit's تحدّ card (issue 4 above).

## Practice-bank corpus for the unit (exams-index, de-duplicated)

19 exercise hits on r01–r05: r01 2 · r02 12 · r03 1 · r04 15 · r05 12 (all in 3AM papers; one misfiled 3AM paper `2am-s2-65`). The typical
term-exam exercise is « A = (k × 10ᵖ × …)/(…) : 1) الكتابة العلمية 2) الحصر 3) رتبة القدر » — it belongs to `kitaba-ilmiya-rutba` (its
computing step to `qawaid-quwa-ashara`). Honest faithful `term_exam` counts: L1 ≈ 2, L2 ≈ 5, L3 ≈ 13, synthesis ≈ 6 (details in each plan
§9). `quwat-adad-nisbi` already used 2am-s2-65 ex1, 3am-s2-69/72/76/78/80/83 ex1–2 and 3am-s3-51 ex1 (with these lessons' steps
`counted: false`): reusing the SAME corpus exercise from another lesson's angle is allowed, but each sheet must count only its own lesson's steps.

## Plans

- [`quwa-adad-ashara.md`](./quwa-adad-ashara.md)
- [`qawaid-quwa-ashara.md`](./qawaid-quwa-ashara.md)
- [`kitaba-ilmiya-rutba.md`](./kitaba-ilmiya-rutba.md)
- [`wadiya-idmajiya-quwa-nisbiya.md`](./wadiya-idmajiya-quwa-nisbiya.md)

## Status of the four coordinator issues (2026-10-26)

1 and 2 applied (net + `kitaba-ilmiya-rutba` prerequisite codes; `LEARNING_NET.md` § 4bis). 3 applied: `ex-13` → `qawaid-quwa-ashara` (pending), `ex-63/64/68/69` → `notIntegrated` (owner decision pending; they were NOT left on the synthesis). 4 open (the unit challenge card follows the synthesis).
