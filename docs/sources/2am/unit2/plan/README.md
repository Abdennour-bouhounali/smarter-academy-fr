# 2AM unit 2 « الكسور والعمليات عليها » (`kusur-amaliyat`) — generation plans (planner, 2026-10-28)

These are plans only. Nothing in this folder is a lesson, a lab, a bank or an extraction. A lead generates ONE entry at a time from
its plan, in the order below, and publishes it (guide §11 « Publish a lesson ») before the next one starts. Every number in these
plans was recomputed with exact fractions (`fractions.Fraction`) while planning.

## The unit in one paragraph

Textbook unit 2 covers book pp. 22–37 = PDF pp. 19–34 (**PDF = book − 3**, `docs/sources/2am/textbook-map.json`). The scan is poor:
the right margin of p. 25 and the bottoms of pp. 26 and 28 are cut (`extraction.json › discrepancies`).

The unit is **already seeded** by the published `qisma-iqlidiya-hasr` (2am.m1.r04, r06; lab `egg-trays`):
- `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/kusur-amaliyat/_unit/` (unitMeta, bindings, `prepDiagnostic.test.js`);
- `docs/sources/2am/unit2/{brief-authors.md, build-extraction.py, extraction.json}`: 93 elements, every one with a destination.

What the student brings into the unit (all PUBLISHED unless said):
- 1AM `qisma-iqlidiya-baqi` (Euclidean division by a one/two-digit divisor);
- 1AM `hasil-qisma-kasr` (a ÷ b = a/b; b × a/b = a; « 7/3 is not decimal, 2,33 is an approximate value »);
- 1AM `ikhtizal-kitaba-kasriya` (a/b = ka/kb; decimal fraction ↔ decimal writing; reducing; it ALREADY shows 2,1 ÷ 3,5 = 21/35);
- 1AM `kusur-ashriya-kitaba` (decimal fractions, 2,35 = 2 + 3/10 + 5/100, ×10 / ×0,1);
- 1AM `hasr-qiyam-muqarraba`, `qisma-ashriya-taqrib`, `akhdh-kasr-min-adad` are **planned** (coming_soon): « تذكّر » without a link;
- 2AM `qisma-iqlidiya-hasr` (this unit): a/b between two consecutive naturals, the two ends named « قيمة مقرّبة إلى الوحدة
  بالنقصان / بالزيادة ».

Downstream (published 3AM, unit `kusur-natiqa`): `maqlub-qismat-kasrayn` (requires 2am.m1.r07), `tasawi-muqaranat-kasrayn` (extends
r08), `jam-tarh-kasrayn` (extends r09). Each of them holds a « تذكّر — السنة الثانية » box WITHOUT a link today — see each plan's
« Successor connection ».

## Entries, in generation order (= catalogue order 6 → 10)

| # | Code | Title | Items | Lab (new type) | What the hand holds | Gesture · drawn world | Faithful `term_exam` (honest) | Plan |
|---:|---|---|---|---|---|---|---:|---|
| 1 | `kasr-hasil-qisma` | الكسر: نسبة وحاصل قسمة وقيم مقرّبة | r05, r06 | `mooring-lines` « حبال المرسى » | the candidate QUOTIENT q at a rank (1 / 0,1 / 0,01): the length of one piece, or the number of pieces | drag a clip along a laid rope + a precision dial · `harbor` « مرسى الصيّادين » | 4 read, 8–10 expected | [`kasr-hasil-qisma.md`](kasr-hasil-qisma.md) |
| 2 | `jam-tarh-kusur` | جمع وطرح كسرين | r09 | `trail-odometer` « عدّاد المسلك » | the DISTANCE walked, counted in the trail's small posts | walk a hiker along a winding path · `mountaintrail` « مسلك الأرز في الحظيرة الوطنية » | 4 read, 8–10 expected | [`jam-tarh-kusur.md`](jam-tarh-kusur.md) |
| 3 | `jida-kasrayn` | جداء كسرين | r07 | `window-blinds` « ستائر النافذة » | the TWO factors: the curtain's width a/b and the blind's height c/d | two perpendicular pulls · `classwindow` « نافذة القسم » | 4–5 read, 8–10 expected | [`jida-kasrayn.md`](jida-kasrayn.md) |
| 4 | `muqarana-kasrayn` | مقارنة كسرين | r08 | `level-laser` « ليزر المستوى » | the HEIGHT of a laser line across two sight tubes graduated differently | slide a level line vertically · `oilpress` « معصرة الزيتون التعاونية » | 3–4 read, 6–8 expected | [`muqarana-kasrayn.md`](muqarana-kasrayn.md) |
| 5 | `wadiya-idmajiya-kusur-amaliyat` | أدمج تعلّماتي — الكسور والعمليات عليها | — | none (synthesis) | — | — | 3–4 read, 5–7 expected | [`wadiya-idmajiya-kusur-amaliyat.md`](wadiya-idmajiya-kusur-amaliyat.md) |

« Read » = exercises whose text the planner actually read on 2026-10-28 (text layer of `2am-s1-68`, `-75`, `-87`, `-91`); « expected »
= after the lead reads the indexed papers without a text layer (`2am-s1-73`, `-77`, `-78`, `-79`, `-83`, `-84`, `-88`, `-92`, misfiled
`3am-s1-112`) by rendering them (`pdftoppm -r 150`). A sheet is `term_exam` ONLY when its exercise was read.

**Lab distinctness.** The four labs use four gesture families (sliding clip + dial · walk a figure along a 2D path · two orthogonal covers ·
a vertical level line) and four worlds, all new (`VISUAL_THEMES` has no `harbor`, `mountaintrail`, `classwindow`, `oilpress`; the four
type names are free in `manipulationTypes.js` on 2026-10-28). None reuses or reskins:
- 1AM `fraction-knife` (d pieces of ONE fixed share), `fair-share` (a child's share, cakes), `ruler-compare` (the graduation of a ruler),
  `rank-exchange` (tie ten / open one), `division-jumps` (q jumps), `decimal-comma`, `tile-yard`;
- 2AM `egg-trays` (the DIVIDEND, trays closing at b, a one-unit frame);
- 3AM `seed-rake` (the common UNIT 1/N of a rake), `shade-match` (numerator c dispensed into d, colour meter), `gear-crank`,
  `number-line-pegs`, `merge-board`, `scoop-scale` (the MASS under a rounding screen — the closest kin of `mooring-lines`: see its plan
  §6 « Why not another lab »), `zero-probe` (a cable unrolled to a depth — hence `mooring-lines` never unrolls: the rope is LAID and the
  hand moves a clip);
- 4AM `fraction-reduction` (kitchen portions), `area-split`, `turf-factoring` (an area cut by a hand-held line).

**Cross-check with 2AM unit 1 (done 2026-10-28 against `docs/sources/2am/unit1/plan/README.md`):** its labs are `tram-route`,
`kit-packer`, `chain-cutter` « مقصّ السلسلة », `coop-calculator`; themes `tramline`, `metro`, `coopshop`, `corkboard`. No name or theme
collides. Entry 1's lab was RENAMED from « مقصّ الحبال » to `mooring-lines` « حبال المرسى » so that two 2AM labs do not both present as
« scissors »: its gesture is a sliding clip whose b copies are laid end to end — nothing is cut on screen. Leads re-grep before generating.

## Is catalogue order the best generation order? — Keep it, with ONE net question

| Entry | Needs | Order constraint |
|---|---|---|
| `kasr-hasil-qisma` | 1AM published (quotient = fraction, ×k), `qisma-iqlidiya-hasr` (unit-rank bracket) | none: first |
| `jam-tarh-kusur` | 1AM `kusur-ashriya-kitaba`, ×k; the net also says it `requires` r08 (comparison, entry 4) | **renvoi en avant** (`GENERATION_QUEUE.md`): it RECALLS « same denominator: larger numerator, larger fraction » in one « تذكّر » and never builds a comparison |
| `jida-kasrayn` | 1AM decimal fractions, area of a rectangle | independent of entries 1–2: could go anywhere |
| `muqarana-kasrayn` | 1AM `hasil-qisma-kasr`, `ikhtizal` | after `jam-tarh-kusur` in the book (act-4 p. 24 before act-6 p. 25) |
| synthesis | all five lessons | last |

**Owner question 1 — the net link `2am.m1.r08 → 2am.m1.r09` (requires) contradicts the textbook order.** The book teaches the sum
(act-4, know-2a/2b, method-3) BEFORE the comparison (act-6, know-3a–3c, method-5), and both use the same « توحيد المقامات ». The
rule written on 2026-10-26 (`LEARNING_NET.md` §4bis, unit-3 net fix): « a `requires` link must follow the textbook order of the
LESSONS that own its two items; when it does not, the link is wrong, not the order ». **Proposal:** replace it by
`2am.m1.r09 → 2am.m1.r08` (requires). Effects: the renvoi en avant disappears; `muqarana-kasrayn` gets `jam-tarh-kusur` as a review
link and may write `P3 ← 2am_jam-tarh-kusur_P2`; `jam-tarh-kusur` loses its review link to a later lesson. **Default if undecided:** the
plans apply the current net (renvoi en avant, no cross-lesson edge either way).

The same rule flags `2am.m1.r05 → 2am.m1.r06`: r06 is shared, and the PUBLISHED `qisma-iqlidiya-hasr` (r06, unit rank) precedes
`kasr-hasil-qisma` (r05). Its « راجع قبل أن تنطلق » panel already lists `kasr-hasil-qisma` as a review lesson; the day entry 1 is
published, that card becomes a LINK to a lesson the student has not reached. See `kasr-hasil-qisma.md` §12 (owner question 2).

## Boundaries — who owns what (written ONCE; lead 1 copies this block into `build-extraction.py`'s header)

- **`qisma-iqlidiya-hasr`** (published) owns: Euclidean division by any divisor; a/b between two consecutive NATURALS; the names
  « قيمة مقرّبة إلى الوحدة بالنقصان / بالزيادة »; r = 0 ⇔ « يقسم / مضاعف / يقبل القسمة ».
- **`kasr-hasil-qisma`** owns:
  - the word « نسبة a إلى b » and « كتابة كسرية » (terms that are decimals); the exact value of a quotient;
  - turning a fractional writing with decimal terms into a fraction with a NATURAL denominator by ×10ⁿ, and its purpose: dividing by a
    decimal (15,96 ÷ 2,8 = 159,6 ÷ 28);
  - performing that division and continuing it after the comma;
  - the approximate values by default / by excess at **0,1, 0,01 (0,001)** and the bracket at those ranks (2,33 < 7/3 < 2,34).

  It does NOT rebuild a ÷ b = a/b, b × a/b = a or « 7/3 is not decimal » (1AM `hasil-qisma-kasr` P1–P3), nor a/b = ka/kb (1AM
  `ikhtizal` P1), nor the unit-rank bracket (`qisma-iqlidiya-hasr` P2): « تذكّر » boxes with links. It never rounds to the nearest
  (« المدوّر » is 3AM `hasr-adad-ushri` P3).
- **`jam-tarh-kusur`** owns: a/c ± b/c for ANY c (decimal numerators allowed: 3,2/3 − 1,6/3); a/b ± c/(kb) by rewriting a/b; 1 − a/b
  and n ± a/b (a natural written as a fraction); several terms when ONE denominator is a multiple of all the others (4/9 + 5/18 + 1/6);
  reducing the result (1AM recalled). It never adds when no denominator is a multiple of the other (3AM `jam-tarh-kasrayn`), never
  compares beyond recalling « same denominator », never multiplies (no « fraction of the remainder »).
- **`jida-kasrayn`** owns: a/b × c/d and its AREA meaning; n × a/b with n natural or decimal; « a fraction OF a quantity » and « a
  fraction OF a fraction » (of the remainder) translated into a product; reducing the result. It does NOT own the reciprocal or
  division by a fraction (3AM `maqlub`), nor « simplify before multiplying » as a rule (3AM `maqlub` P3; a lead may SHOW it once in a
  طريقة comment), nor « a/b of a NUMBER by three procedures » as such (1AM planned `akhdh-kasr-min-adad`: recalled).
- **`muqarana-kasrayn`** owns: same denominator (decimal numerators allowed); same numerator; one denominator a multiple of the other
  (rewrite, then compare); ordering such fractions; a fraction compared with 1; 1 as an INTERMEDIATE (7/11 < 1 < 4/3). It never uses
  cross products or an arbitrary common multiple (3AM `tasawi`), never signed fractions.
- **`wadiya-idmajiya-kusur-amaliyat`** introduces nothing. A whole is found from a unit fraction by multiplication (« 1/6 is 500 MB,
  so 6/6 is 3000 MB »), never by dividing by a fraction (3AM).

**Out-of-scope textbook elements** (they need a common denominator when NO denominator is a multiple of the other — 3AM r06):
`opener` (1/3 + 1/2 = 5/6), `ex-11` (9/2 + 4/5, 1/4 + 4/5), `ex-12` (11/6 + 10/9 only), `ex-14` (13/6 + 3/4), `ex-28` q2 (1/3 + 2/5),
`ex-29` (2/5 + 1/4), `self-6` (10/3 − 5/7), `deep-40` (1/20 + 1/30). Each is used ADAPTED (own numbers inside the 2AM case) or, for
`opener`, as history without computation. Record them in `DISCREPANCIES` (`kind: 'scope'`).

## Shared maths — `packages/core/arithmetic/fractions2.js` (new; created by entry 1, grown entry by entry)

Do NOT re-implement what exists; import BY PATH (never the core barrel, BUNDLE_BOUNDARIES §3–§4):
- `fractions3.js`: `raw`, `toRaw`, `valueOf`, `rawTex`, `rawText`, `lcm`, `toDenominator`, `compareFractions`, `cellsOf`, `sumWith`;
- `decimals.js`: `make`, `parse`, `cmp`, `floorAt`, `ceilAt`, `quotientBracket(a, b, k)` (naturals), `formatTrim`;
- `powers.js`: `rat`, `add`, `sub`, `mul`, `eq`, `ratTex`;
- `divisibility.js`: `gcd`, `divmod`.

`fractions2.js` adds only the 2AM-specific pieces (pure, BigInt, tested in `fractions2.test.js`):

| Added by | Functions |
|---|---|
| E1 `kasr-hasil-qisma` | `clearDecimals(a, b)` → `{ k, a10, b10 }` (the smallest power of ten making b natural, and the one making both natural) · `decimalQuotientBracket(a, b, k)` (a, b decimals as strings « 15,96 » / « 2,8 »; wraps `quotientBracket` after `clearDecimals`) → `{ lo, hi, exact }` · `fitsAtRank(a, b, q)` → `{ product, verdict: 'fits' | 'exact' | 'over', gap }` (b × q vs a, exact decimals) · `isDecimalQuotient(a, b)` (reduced denominator of the form 2ⁱ5ʲ) |
| E2 `jam-tarh-kusur` | `isMultipleCase(b, d)` → `{ big, small, k }` or `null` · `rewriteTo(p, D)` (= `toDenominator`, refuses a non-multiple) · `sumMultipleCase(terms)` (terms with sign; throws if no denominator is a multiple of all others — the 2AM guard) → `{ D, numerators[], total: raw, reduced }` · `complement(p, n = 1)` → raw |
| E3 `jida-kasrayn` | `productGrid(p, q)` → `{ cols: b, rows: d, shaded: a·c, total: b·d, raw, reduced }` · `timesNumber(n, p)` (n natural or decimal string) → raw · `fractionOf(p, x)` (x a number or a raw) → raw · `ofRemainder(spent, part)` → raw |
| E4 `muqarana-kasrayn` | `compareCase(p, q)` → `'sameDen' | 'sameNum' | 'multiple' | 'viaOne' | null` (null = 3AM case) · `compareSimple(p, q)` → `{ sign, method, rewritten? }` (refuses the 3AM case) · `orderSimple(list)` · `vsOne(p)` |

Each lab keeps its own state logic in `apps/web/src/lessons/common/manipulations/logic/<lab>.js` on top of this module. Oracles never
import it (`scripts/practice-oracle/<code>.mjs` uses its own BigInt code).

## Extraction — destinations to MOVE in `build-extraction.py` (each lead moves its own; re-read them at 200 dpi, `verified: True`)

The current `DEST` map was written by the seeding lead with module `None` for every pending element. The plans re-route as follows
(details and module numbers in each plan's §11). Letters: L2 = `kasr-hasil-qisma`, L3 = `jam-tarh-kusur`, L4 = `jida-kasrayn`,
L5 = `muqarana-kasrayn`, SYN = synthesis.

| Element | Today | Planned | Why |
|---|---|---|---|
| `act-2`, `act-3` | L2 m1 | L2 **m4** | the entry is the platform's lab (guide §4ter); the book activities become applications |
| `act-4` | L3 m1 | L3 **m4** | same |
| `act-5` | L4 m1 | L4 **m4** | same |
| `act-6` | L5 m1 | L5 **m4** | same |
| `opener` | L3 None | **SYN m0** (« هل تعلم ») | its 1/3 + 1/2 is out of the 2AM scope; history only |
| `challenge` | unit page | unit page + **SYN m3** (redesigned) | the printed cards have no solution (discrepancy); the synthesis poses a redesigned set |
| `deep-46` | L5 None | **L2** None | it is about ratios AM/AB, BA/BM (« نسبة »), not comparison |
| `deep-47` | L5 None | **L3** None | 2 − 1/6 and 2 + 1/3 are n ± a/b |
| `self-12` | L2 None | **L4** None | « نصف 10/11 », « ضعف 5/22 » are products |
| `ex-30` | L4 None | L4 None (kept) | rewrite « فوائد » as « أرباح » in any use (Islam-respect rule: « فوائد » reads as interest) |
| `ict-1` | L3 None | L3 None (kept, adapted without a spreadsheet) | — |
| `ict-2` | L2 None | L2 None (adapted: a regular polygon's side from a perimeter, approximate values) | the platform runs no GeoGebra |
| `ict-3` | L2 None | L2 None (adapted: a decimal between two fractions) | the last number is cut on the scan |

## Discrepancies already in the extraction, and new ones to add

Already there: `challenge` (no four printed cards sum to 1), `act-1`, `know-1b`, `know-2b` (5/12 + 1/4 printed, computed as 5/12 + 11/4),
`method-3` (« 34/21 » for 24/21), `deep-34` (numbering), `deep-42` (400 × 4/9 not whole), `ex-32` (names), `ex-33`, `unit`.

To add (planner, 2026-10-28):
1. `scope` — the eight out-of-scope elements listed above.
2. `ex-30` — « فوائد شركتهم » (= profits) must never be shown; any adaptation says « أرباح ».
3. `deep-45` — the children (1/6) and women (3/7) are computed separately (fine); never ask their SUM as a fraction (6 and 7).
4. Exam corpus (not the book): `2am-s1-87` « الوضعية الإدماجية » reads 1/3, 1/6, 5/8, 1/24 on the text layer — their sum is 28/24 > 1;
   the « 5/8 » is probably a misread (« 5/24 »? then the rest is 6/24 = 1/4). The lead of entry 2 must look at the scan before citing it.

## The unit's تحدّ

Printed cards 1/24, 1/6, 1/2, 1/12, 1/8: the sums of four are 5/12, 3/4, 19/24, 5/6, 7/8 — never 1. The unit card
(`units_2am › kusur-amaliyat.challenge.textAr`) copies the book verbatim (independence rule). **Owner question 3:** rewrite the card
with the synthesis' redesigned cards 1/2, 1/3, 1/4, 1/6, 1/12 (exactly one choice of four makes 1: 1/2 + 1/4 + 1/6 + 1/12; bonus:
three cards 1/2 + 1/3 + 1/6). Default: the card is kept until the owner decides; the synthesis poses the redesigned set (module 3).

## Corpus at a glance (`docs/sources/moyen/exams/exams-index.json`, coverage)

| Item | Exercises indexed | Read by the planner | Notes |
|---|---:|---|---|
| r05 / r06 | 16 / 12 | `2am-s1-87` ex 3, `-91` ex 2, `-68` ex 1 q 2, `-75` ex 2 | `qisma-iqlidiya-hasr`'s bank already used the EUCLIDEAN parts of `-79`, `-87`, `-74`, `-70`, `-77`, `-68`: entry 1 uses their DECIMAL parts (other questions — never the same question twice) |
| r07 | 28 | `-68` ex 2 C, `-75` ex 3 N K, `-91` q 3, `-87` situation q 4 | mostly « a fraction of an amount / an area » inside situations |
| r08 | 20 | `-68` ex 2 ب, `-91` q 1, `-87` situation q 2 | « which share is largest » inside situations |
| r09 | 25 | `-68` ex 2 A B + situation, `-75` ex 3 M, `-91` q 2 | « what remains » inside situations |

Term 1 everywhere (badge « على منوال اختبار الفصل الأول », `modelledOn: "2am-s1"`). `2am-s1-76` duplicates `-75`; `3am-s1-112` is a
misfiled 2AM paper (cite it as `3am-s1-112`, grade from the index). Contexts are REWRITTEN (never copied); `2am-s1-70` ex 4 (Mawlid
pastries) and `2am-s1-91` (donations for Gaza) are rewritten in neutral everyday contexts — keep the solidarity value, drop the event.

## Misconception id prefixes (free in `content/practice/misconceptions.json` on 2026-10-28)

`MISC-QARIBA-*` (E1) · `MISC-JAMKASR-*` (E2) · `MISC-JIDAKASR-*` (E3) · `MISC-MUQKASR-*` (E4) · `MISC-SYN-KASR2-*` (E5).
Taken and NOT to be used: `MISC-JAMTARH` (1AM, 3AM), `MISC-TAQRIB`, `MISC-KASRIYA`, `MISC-MUQARANA`, `MISC-JIDAA`, `MISC-HASR`,
`MISC-SYN-KUSUR`.

## Owner questions common to the unit

1. **Net link `2am.m1.r08 → r09`** against the book order (above). Proposed: `r09 → r08`.
2. **`2am.m1.r05 → r06`** and the published `qisma-iqlidiya-hasr`'s review card toward a LATER lesson (entry-1 plan §12).
3. **The unit card's تحدّ** (no solution with the printed cards; verbatim text).
4. **Changed meanings of draft الكفاءات** (positions kept): E1 P1–P3 (the drafts rebuild published 1AM lessons: `hasil-qisma-kasr` P1/P3,
   `ikhtizal` P1), E3 P3 (adds « a fraction of a fraction »; « a fraction of a number » is the planned 1AM `akhdh-kasr-min-adad` P1),
   E4 P4 (adds 1 as an intermediate). Every change is listed in the plans.
5. **Missing net links** proposed (default: « أستعدّ » measures, no LP edge): `1am.m3.r03 → 2am.m1.r05` (decimal division, needed by
   r05); `1am.m5.r01 → 2am.m1.r06` and `1am.m5.r02 → 2am.m1.r05` (already proposed in `MOYEN_ROLLOUT_PROGRESS.md`, batch 2 owner point
   2); `2am.m1.r05` / `r06 → 3am.m5.x1` (consolidates — 3AM unit-5 README Q1, still open).
6. **Catalogue overlaps found in 1AM DRAFTS** (not generated yet, so cheap to fix now):
   - `qisma-ashriya-taqrib` P3 « … إلى $0{,}1$ ، $0{,}01$ » and `hasr-qiyam-muqarraba` P2 « (أو إلى الجزء من عشرة) » claim the rank 0,1 /
     0,01 that the net gives to 2AM (`1am.m3.r04 → 2am.m1.r05`, added value « القيمة المقرّبة إلى أيّ رتبة … لا إلى الوحدة فقط »);
   - `akhdh-kasr-min-adad` P1 (a/b of a number, three procedures) vs `jida-kasrayn` P3;
   - `kusur-ashriya-kitaba` is the home of `1am.m5.r03` « جمع وطرح وضرب كسور عشرية » but none of its LPs teaches a sum or a product of
     decimal fractions (P3 only decomposes 2,35 = 2 + 3/10 + 5/100). The review link of entries 2 and 3 therefore points to a lesson that
     only partly teaches the base.
7. **The 3AM `jam-tarh-kasrayn` P2 claims « ومنها عدد طبيعي يُكتب كسرًا »** while the 2AM book already does it (`prep` 8: 2 + 5/6;
   `ex-14`; `deep-47`). Once E2 is published, that part of 3AM P2 is a recall. Confirm; no edit needed in the 3AM wording if the edge
   `3am_jam-tarh-kasrayn_P2 ← 2am_jam-tarh-kusur_P3` is written (E2 plan « Successor connection »).
8. **First 2AM synthesis with `programmeItems: []`** — same decision as the 3AM syntheses (one P1, published as such on 3AM unit 2).
