# 3AM unit 4 « الحساب الحرفي » — plan of the remaining lessons (Phase 0, owner priority, 2026-10-25)

Planner: Opus, 2026-10-25. Generation: one Sonnet 5.5 lead per entry, in this order, each lesson published before the next
(`docs/curriculum/PLAN_3AM_UNITS_1_5.md`, `GENERATION_QUEUE.md` Phase 0 #15–#17).

## The unit in one paragraph

Textbook unit 4, pp. 54–69 (PDF page = printed page). Programme segment `3am.m5`, items r01–r04. The unit makes the letter an
everyday tool: an expression is **simplified** (like terms, brackets after + / −: `tabsit-hadhf-aqwas`, published 2026-10-20, lab
`like-terms`), **expanded** (k(a + b), (a + b)(c + d): `nashr-jabri-3am`, published 2026-10-21, lab `area-split`), **evaluated** by
putting a number in place of the letter (`qimat-ibara-harfiya`, r03), and two numbers or two expressions are **compared** through the
sign of their difference (`muqaranat-natiqayn`, r04). The synthesis `wadiya-idmajiya-ibarat-harfiya-3` mobilises the four. 4AM
needs r03 at once (affine function `4am.m5.r07`: images f(−2), f(1/2)) and BEM uses « احسب قيمة العبارة من أجل x = … » in almost
every algebra exercise (often at a fraction or a root).

## Order (catalogue `order` 17 → 19)

| # | Code | Title | Items | Lab (new) | Plan |
|---:|---|---|---|---|---|
| 15 | `qimat-ibara-harfiya` | حساب قيمة عبارة حرفية | `3am.m5.r03` | `marble-run` « مسار الكريات » | [`qimat-ibara-harfiya.md`](qimat-ibara-harfiya.md) |
| 16 | `muqaranat-natiqayn` | مقارنة عددين ناطقين | `3am.m5.r04` | `difference-meter` « مقياس الفرق » | [`muqaranat-natiqayn.md`](muqaranat-natiqayn.md) |
| 17 | `wadiya-idmajiya-ibarat-harfiya-3` | أدمج تعلّماتي — الحساب الحرفي | — | none (situations) | [`wadiya-idmajiya-ibarat-harfiya-3.md`](wadiya-idmajiya-ibarat-harfiya-3.md) |

## Boundaries — who owns what (written ONCE here; each lead copies the relevant lines into `build-extraction.py`'s header)

The header of `docs/sources/3am/unit4/build-extraction.py` already states the boundary tabsit / nashr and one line each for r03 and r04.
The lead of `qimat-ibara-harfiya` REPLACES the two short lines « qimat-ibara-harfiya (r03) » / « muqaranat-natiqayn (r04) » by this:

- **`tabsit-hadhf-aqwas` (published)** — simplify; a value of x is only a CHECK that simplifying does not change the value.
- **`nashr-jabri-3am` (published)** — expand; its P4 « مراقبة النشر بقيمة لـ x » uses a value to CHECK an expansion it has just made
  (consistent / not consistent). It never states the LOGIC of a counter-example.
- **`qimat-ibara-harfiya` (r03)** owns: substituting a relative or rational value (one letter or two) and computing with priority of
  operations; writing the hidden × and the brackets around a negative value (and around a fraction raised to a power); the
  exact value with π versus a rounded value; and the LOGIC « a value where two expressions differ PROVES they are not equal; equal values
  prove nothing — expand to prove equality ». It never compares two numbers by the sign of a difference and never solves an equation
  (an equality « verified for which x? » is answered by TESTING the proposed values only).
- **`muqaranat-natiqayn` (r04)** owns: « a > b ⟺ a − b > 0 » (and < / =), ordering from the difference ALONE, comparing two rationals by
  computing their difference (fractions of any signs, quotients of decimals through a calculator difference, π multiples), and comparing
  two EXPRESSIONS by simplifying A − B into a form whose sign is read directly: a constant, `x − c` or `c − x` (read with P1 itself:
  « x > c means x − c > 0 »), or a product of factors of known sign. It does NOT:
  - re-teach comparing two fractions by a common positive denominator or by cross products (3AM unit 2 `tasawi-muqaranat-kasrayn`,
    item `3am.m1.r05`, which this item CONSOLIDATES — recalled in one « تذكّر » box, never rebuilt);
  - add, subtract, multiply or divide both sides of an inequality, or turn « 2x − 6 > 0 » into « x > 3 » (3AM unit 5 `mutabayinat-amaliyat`,
    its P1–P4, and 4AM inequations). When an expression difference is `k(x − c)` with k > 0, the sign comes from the rule of signs of a
    product (3AM unit 1), never from « dividing an inequality ».
- **`wadiya-idmajiya-ibarat-harfiya-3`** owns no new knowledge: six training situations, the integration situation of the book (the
  staggered starts of an athletics track) and the unit's own « تحدٍّ » analog. It cites the textbook elements `deep-35`, `deep-47`,
  `integration`, `evaluation` (already destined to it).

## Shared maths

Every exact computation goes through `packages/core/arithmetic/`, imported BY PATH (never the core barrel, `BUNDLE_BOUNDARIES.md` §3–§4):

- **Reuse:** `powers.js` (`rat`, `add`, `sub`, `mul`, `div`, `pow`, `sign`, `eq`, `ratText`, `ratTex`, `parseRat` — exact BigInt
  rationals), `polynomials.js` (terms `{ c, p }`, `reduce`, `evaluate`, `termsTex`), `brackets.js` (`simplify`, `valueAt`,
  `sameExpression`, `witness`), `expansion.js` (`exprValue`, `reducedExprTerms`) — all already tested.
- **Create `packages/core/arithmetic/substitution.js`** (+ test) for `qimat-ibara-harfiya`: the expression TREE, rational evaluation,
  the student's substituted line and its literal reading (functions in that plan, §6).
- **Create `packages/core/arithmetic/orderSign.js`** (+ test) for `muqaranat-natiqayn`: exact difference, sign, verdict, reading of a
  « known difference » card, expression differences through `brackets.js` (functions in that plan, §6).
- If the unit-2 planner's lessons (`tasawi-muqaranat-kasrayn`, `amaliyat-natiqa`, queue #6 and #9 — published before #15) created a
  fraction module (e.g. `fractions3.js`), `orderSign.js` imports its parser/formatter instead of duplicating them.

## The unit's تحدّ

The unit challenge (« عددان مجموعهما 191,7 … ») is destined to the bank of `nashr-jabri-3am` (element `challenge`, already cited
there): nobody else may cite it. The synthesis poses its OWN analog with other numbers (sum 48,5, add 4 to each → the product grows by
4 × 48,5 + 16 = 210) as the bonus stage of its final module, without citing the element.

## Seeding and the extraction

The unit is seeded (`ibarat-harfiya-3/_unit/`, by `tabsit-hadhf-aqwas`) and the whole-unit extraction exists. No re-seeding. Each lead:

1. re-reads ITS elements at 200–250 dpi (`pdftoppm -r 250`), sets `verified: True`, replaces typed answers by `Poly` / `Fraction`
   computations with assertions, and gives each element its module number (or `None` = bank) in `destinations`;
2. records corrections in `discrepancies`. Already found by this planner (the `qimat` lead writes it): **`prep` item 1 reads
   « $8-5\times2$ » (LTR), not « 2 × 5 − 8 »** — its value is −2 = option (2): the « no right answer » note in the extraction is a
   misreading (zoom at 250 dpi, row 1 of the table p. 55). Also: `now-61` item ② is $\frac{13}{6}$ / $\frac{35}{17}$ and
   $-\frac45$ / $\frac{2}{-3}$ (the « −2/3 » transcription drops where the minus sits — same value).
3. The `qimat` lead also rewrites the « qimat / muqaranat » lines of the header (boundary above).

`check:textbook` counts every element destined to a lesson still `coming_soon` as « pending »; each lesson must cite all of its own
elements (modules or bank). Element → lesson (unchanged, from the extraction): `qimat-ibara-harfiya` = `prep` (1–4), `act-4`, `know-4`,
`method-4`, `now-61` ①, `ex-1`…`ex-4`, `self-3`, `deep-37`, `deep-39`, `ict`; `muqaranat-natiqayn` = `act-5`, `know-5`, `method-5`,
`now-61` ②, `ex-27`…`ex-32`, `self-9`, `self-10`, `deep-38`; synthesis = `deep-35`, `deep-47`, `integration`, `evaluation`.

## Lanes and siblings

The three entries are strictly sequential (the synthesis needs both lessons published). Labs of the unit and their gesture families —
each new lab differs from all of them: `like-terms` (CARRY a bundle into a tray / out of a crate), `area-split` (SLIDE a cut handle, then
decide each parcel's sign; DRAW arrows), `marble-run` (CHOOSE the value released into every slot of the letter, then CLIP brackets and
signs into the written line; RUN and read where the two calculations part), `difference-meter` (PLUG two probes on two numbers — which
one is subtracted — and read ONE needle; HOLD x and watch the needle cross zero).

## Owner questions (collected from the three plans)

1. **Net links that the lessons need and the net does not have** (proposed, `requires` unless stated): `3am.m3.r06` (قوة عدد نسبي,
   published `quwat-adad-nisbi`) → `3am.m5.r03` — evaluating $x^2$ at a negative is $(-3)^2$; `2am.m4.r09` (اختبار صحة مساواة, 2AM) →
   `3am.m5.r03` as `extends` (« the value can also DISPROVE an equality between expressions »); `3am.m1.r06` (جمع وطرح كسرين) →
   `3am.m5.r04`; `2am.m4.r02` (مقارنة عددين نسبيين, published `muqarana-nisbiya`) → `3am.m5.r04`; `3am.m5.r01` (published `tabsit-hadhf-aqwas`)
   → `3am.m5.r04` (A − B is simplified). Until decided, « أستعدّ » still MEASURES them as extra `priorKnowledge`, but no cross-lesson
   الكفاءة edge is written along them.
2. **`prep` item 1** of the extraction: confirm the corrected reading `8 − 5 × 2 = −2` (it removes a « no correct answer » item).
3. **`muqaranat-natiqayn` P3 scope**: expression differences are restricted to forms whose sign is read directly (constant, x − c,
   c − x, a product of known-sign factors). Anything needing « divide both sides » stays in `mutabayinat-amaliyat` / 4AM. Confirm.
4. **Synthesis الكفاءات**: the catalogue entry has none; the plan proposes two (like the 4AM syntheses). Confirm, and confirm the
   « تحدٍّ » as a non-counted bonus stage of the final module.
5. **Notation**: 3AM writes « قيمة A من أجل x = −3 »; the function notation A(−3) / f(−3) is 4AM's. The plans never print A(−3). Confirm.
