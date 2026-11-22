# 3AM unit 5 « المساويات – المتباينات – المعادلات » — generation plans for the remaining lessons (2026-10-25)

Planner: unit 5 of the « 3AM units 1–5 first » batch (owner, 2026-10-25). These files are PLANS for the Sonnet generators. They create
nothing in the lesson tree. Read them together with `../brief-authors.md`, written by the lead of the two published lessons, and
`../extraction.json` / `../build-extraction.py`. All maths below was recomputed in exact arithmetic while planning.

## The unit in one paragraph

Unit 5 (book pp. 70–85, `units_3am › musawiyat-mutabayinat`, segment `3am.m5`) turns the rationals of units 1–4 into tools for
transforming statements:
- equalities kept by « the same operation on both sides » (`musawiyat-amaliyat`, PUBLISHED, lab `equality-lanes`);
- inequalities kept, or REVERSED, by the same operation (`mutabayinat-amaliyat`). This is the 3AM base of 4AM unit 4: `mutarajiha-ula`
  (`4am.m3.r04`) solves inequations by these rules, and its whole difficulty is the reversal under a negative factor;
- a positive decimal trapped between approximations and pinned down by its rounding (`hasr-adad-ushri`, item `3am.m5.x1`, which EXTENDS 1AM
  `1am.m3.r05`);
- first-degree equations and modelling (`muadalat-darajat-ula`, PUBLISHED, lab `term-ferry`).

The synthesis `wadiya-idmajiya-musawiyat-mutabayinat` closes the unit.

## Order of generation (catalogue order, all in `lessons_3am_2026_2027.json`)

| # | Lesson | Catalogue order | Status | Plan |
|---:|---|---:|---|---|
| — | `musawiyat-amaliyat` | 20 | available | — |
| 1 | **`mutabayinat-amaliyat`** « المتباينات والعمليات » | 21 | coming_soon | [`mutabayinat-amaliyat.md`](./mutabayinat-amaliyat.md) |
| 2 | **`hasr-adad-ushri`** « حصر عدد عشري موجب » | 22 | coming_soon | [`hasr-adad-ushri.md`](./hasr-adad-ushri.md) |
| — | `muadalat-darajat-ula` | 23 | available | — |
| 3 | **`wadiya-idmajiya-musawiyat-mutabayinat`** (synthesis) | 24 | coming_soon | [`wadiya-idmajiya-musawiyat-mutabayinat.md`](./wadiya-idmajiya-musawiyat-mutabayinat.md) |

Generate in that order. `hasr-adad-ushri` USES the inequality properties when it bounds an expression (ex-28, ex-62, its مسائل). The synthesis needs
the four lessons published.

## Seeding and extraction — nothing to seed

The unit IS seeded. Its `_unit/` (unitMeta, lessonRoutes, moduleContext, prepDiagnostic + test) exists, and the whole-unit extraction
(107 elements, pp. 70–85, frozen 2026-10-21) already names every element's destination. **No lesson seeds the unit.** Each generator edits
`docs/sources/3am/unit5/build-extraction.py` to do four things, then rebuilds `extraction.json` (`python3 build-extraction.py`):
1. re-read its own elements at 150–220 dpi and set `verified: True`, with the builder's assertions on the answers (exact `Fraction`);
2. give each element its module number;
3. apply the re-routing listed below;
4. record the discrepancies listed in each plan.

Never edit `extraction.json` by hand.

### Re-routing decided by this plan (apply in `build-extraction.py`, by the lesson named first)

| Element(s) | Today | Moves to | Why |
|---|---|---|---|
| `ex-19`, `ex-23`, `ex-24`, `ex-26`, `ex-27` | `hasr-adad-ushri` | `mutabayinat-amaliyat` | « given a bracket of t, bracket 3t − 1 / a perimeter / a side / x from 2x + 1 / an area ». No decimal and no rounding: this is LP4 of the inequality lesson (« حصر عبارة »). The book prints them under « حصر عدد عشري موجب » only because of the page layout. |
| `ex-28`, `ex-62` | `hasr-adad-ushri` | stay | They start FROM a rounding (h rounds to 5,41) or from decimal approximations (3,14 < π < 3,15). They are the bridge « rounding → bracket → bracket an expression », and the earlier sibling's properties are used. |
| `ex-8`, `ex-9`, `ex-10` | `mutabayinat-amaliyat` | stay, cited by its BANK only (level 1, adapted: compare, then deduce with a property) | Pure comparison of two rationals is `3am.m5.r04` (`muqaranat-natiqayn`, unit 4). `check:textbook` collects citations from THIS unit's lessons only, so a cross-unit destination could never be satisfied. |
| `challenge` | synthesis | stays, cited by synthesis situation 1 | See the synthesis plan. |

## Boundaries — who owns what (written ONCE here; copy it into the header of `build-extraction.py`)

- **`musawiyat-amaliyat`** (published): EQUALITIES only. a = b ⟹ a ± c = b ± c, ac = bc, a/c = b/c (c ≠ 0). It transforms a known equality and
  judges whether another one follows. It never flips anything and never solves.
- **`mutabayinat-amaliyat`**: INEQUALITIES (`<`, `>`, `≤`, `≥`) and the four operations on both sides.
  - It owns: + / − keep the direction; × / ÷ by c > 0 keep it; × / ÷ by c < 0 reverse it; × 0 destroys a strict inequality.
  - It owns « deduce an inequality from another », including the book's « استنتج متباينة طرفها الأول x » (now-75-2, ex-14…16).
  - It owns « bracket an expression ax + b from a bracket of x », and compares two expressions BY THE PROPERTIES.
  - It does NOT own:
    - the word « متراجحة », « حلّ متراجحة », « مجموعة الحلول » and the number-line representation of a solution set (4AM `mutarajiha-ula`);
    - comparing two rationals by the sign of their difference, a > b ⇔ a − b > 0 (`muqaranat-natiqayn`, unit 4: RECALLED in a « تذكّر »
      box and used as a tool in the proofs and in method-2, never re-taught);
    - decimals rounded at a rank (next lesson).
- **`hasr-adad-ushri`**: a positive decimal and its approximations at a rank.
  - It owns: the bracket between consecutive integers and between the approximations by defect and by excess at 1/10, 1/100 and 1/1000; the
    rounding at a given rank (half up); THE BRACKET OF A NUMBER KNOWN BY ITS ROUNDING, r − ½·10⁻ᵏ ≤ x < r + ½·10⁻ᵏ (the heart of `3am.m5.x1`);
    bracketing a quotient read on a calculator.
  - It does NOT own:
    - negative numbers (the item says « موجب »);
    - scientific notation and bracketing between powers of 10 (`kitaba-ilmiya-rutba`, unit 3, `3am.m3.r05`);
    - comparing decimals (1AM `muqaranat-adad-ashriya`);
    - the inequality properties themselves (previous lesson: used, not re-taught).
- **`muadalat-darajat-ula`** (published): equations ax + b = cx + d and modelling. No inequality, no rounding.
- **Synthesis**: no new knowledge. Its situations mix the four lessons. It may decide a situation with an inequality deduced by the
  properties (« ابتداءً من… »). It never writes « حلّ المتراجحة » as a method, never draws a solution set, and never solves a system.

## Shared maths modules (exact, imported BY PATH, never through the core barrel)

| Module | Status | Used by | What to add |
|---|---|---|---|
| `packages/core/arithmetic/linear.js` | exists (4AM unit 4) | `mutabayinat-amaliyat` | REUSE `frac`, `cmp`, `mul`, `add`, `flipRelation`, `compareWith`, `applyBoth(L, R, op, k, rel)` (it already flips on a negative factor and refuses × 0). ADD `imageRay({ rel, bound }, stages)` and `boundAffine({ lo, loRel, hi, hiRel }, P)` with their tests in `linear.test.js` (the plan gives the signatures). |
| `packages/core/arithmetic/decimals.js` | exists (1AM unit 1) | `hasr-adad-ushri` | ADD `floorAt(v, k)`, `ceilAt(v, k)`, `roundAt(v, k)`, `roundingInterval(r, k)`, `quotientDigits(a, b, n)` and `quotientBracket(a, b, k)`. All in BigInt with `{ n, k }` values ≥ 0, tested in `decimals.test.js` by sweeps. |
| `packages/core/arithmetic/equalities.js` | exists (unit 5) | synthesis (via `term-ferry`) | nothing |

## Labs of the unit — four different hands

| Lesson | Lab | What the hand holds | Gesture family | Drawn world |
|---|---|---|---|---|
| `musawiyat-amaliyat` | `equality-lanes` (published) | c of an operation + WHO receives it | knob on a rail + choice + « نفّذ » | stadium wall, two runners |
| `muadalat-darajat-ula` | `term-ferry` (published) | the SIGN of a carried term, then the divisor | carry and drop on a dock | river, ferry |
| **`mutabayinat-amaliyat`** | **`loom-threads`** « خيوط النول » (new) | the KNOT where the thread of 1 (× stage) or of 0 (+ stage) lands on the lower beam: the factor / the shift applied to the whole line | drag a knot along a beam (direct mapping); two tool cards | a carpet loom in a weaving workshop (Ghardaïa), warp threads between two beams |
| **`hasr-adad-ushri`** | **`scoop-scale`** « ميزان العطّار » (new) | the MASS itself (the number), by pouring and pinching | press-and-hold to pour, tap = one pinch, tap the pile = remove one | a spice shop, a digital scale whose screen ROUNDS |

The two new labs differ from each other (mapping a whole line versus building a quantity, a workshop versus a shop, drag versus pour) and
from the two published labs. Each plan has a « why not another lab » section against the nearest existing types (`origin-line`,
`solution-ray`, `equality-lanes`, `ruler-compare`, `zero-probe`, `decimal-comma`).

**Assumption about the other planners (units 1–4, planned in parallel):** I cannot see their labs. Unit 4's `muqaranat-natiqayn`
(sign of a difference) will most likely use a number line or a balance of differences. If a sibling plan also proposes a « loom / threads »
or a « scale that rounds » world, the coordinator should keep this unit's (the inequality reversal and the rounding interval are not their
concepts) and ask that planner for another world.

## The unit's تحدّ

The book's تحدّ (p. 70) is a reward split: the top student gets 15 750 DA, the lowest a quarter of that, the third three tenths
(3 937,5 DA and 4 725 DA, computed). In the catalogue (`units_3am › musawiyat-mutabayinat.challenge.textAr`) it is the book's text VERBATIM,
which breaks the independence rule.

What the plan decides:
- The synthesis generator rewrites `challenge.textAr` in platform words, with the platform's numbers (synthesis plan, situation 1).
- Synthesis training situation 1 « مكافأة النجاح » SOLVES it, extended with an unknown so that an equation and a rounding are needed. It
  cites `src('challenge')`, whose destination stays the synthesis.
- Do NOT set `challenge.sourceElementId` (that would cite `challenge` twice).

## Owner questions (summary; details in each plan)

1. **Net links missing.**
   - `3am.m5.r04 → 3am.m5.r05` (requires): comparing by the sign of a difference is what PROVES the inequality properties.
   - `2am.m1.r05 → 3am.m5.x1` and `2am.m1.r06 → 3am.m5.x1` (consolidates): approximations to 0,1 / 0,01 and the bracket of a quotient are
     already 2AM items, so two of `hasr-adad-ushri`'s draft الكفاءات re-teach a 2AM item unless the net says « consolidate ».

   With the links, « أستعدّ » can name them and `pointPrerequisites` can follow them.
2. **Same-item cross-lesson edges.** `mutabayinat-amaliyat` P1 ← `3am_musawiyat-amaliyat_P1` and P2/P3 ← `…_P2`. The two lessons share the
   programme item `3am.m5.r05`. No validator forbids this, but LEARNING_NET §4.6 speaks of « a net link ». Confirm that a shared item counts.
3. **`hasr-adad-ushri` P3 rewording** (adds « bracket a number known by its rounding »). This is the programme item's own wording and the
   book's know-3 / act-3 / now-77-1, which were missing from the draft الكفاءات.
4. **2AM term-exam papers in a 3AM bank.** The 3AM corpus has very few faithful exercises on rounding. Can `hasr-adad-ushri` model 2AM
   « قسمة عشرية / قيم مقرّبة / حصر » papers (`term_exam` with `grade: "2am"`)? The badge does not show the grade.
5. **Extraction errors found while planning** (each generator fixes its own):
   - `now-77-1`: 8,345 rounds to 8,35, so its answer must be `false`;
   - `act-2` 5): a + 3/5 < b + 6/5 IS decidable;
   - `ex-7`, `ex-9`, `ex-17`, `ex-18` are transcribed incompletely.
