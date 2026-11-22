# 2AM unit 3 « الأعداد النسبية » (`adad-nisbiya-2`, مقطع `2am.m4`) — generation plans (planner, 2026-10-29)

These are plans only. Nothing in this folder is a lesson, a lab, a bank or an extraction. A lead generates ONE entry at a time from
its plan, in the order below, and publishes it (guide §11 « Publish a lesson ») before the next one in its lane starts. Every number
in these plans was recomputed with exact decimals (`decimal.Decimal`) while planning.

## The unit in one paragraph

Textbook unit 3 covers book pp. 38–53 = PDF pp. 35–50 (**PDF = book − 3**, `docs/sources/2am/textbook-map.json`). The scan is poor:
the right edge of pp. 41, 43–47 is cut (titles of activities 3–6, line ends), several exercise numbers are truncated
(`extraction.json › discrepancies › unit`). In 2AM a « عدد نسبي » is always written in DECIMAL form (the book's `prep` 2 says that
$\frac17$ « is not » one of them): no fraction ever appears as a relative number in this unit (fractions with a sign are 3AM).

The unit is **already seeded** by the published `muqarana-nisbiya` (2am.m4.r02, r03; lab `zero-probe`, theme `researchBoat`):
- `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/adad-nisbiya-2/_unit/` (unitMeta, lessonRoutes, moduleContext, prepDiagnostic);
- `docs/sources/2am/unit3/{brief-authors.md, build-extraction.py, extraction.json}`: 98 elements, every one with a destination
  (the lesson boundaries are in the header of `build-extraction.py`);
- `packages/core/arithmetic/relative.js` (relative decimals as BigInt HUNDREDTHS: `parse`, `cmp`, `distance`, `text`, `tex`, …).

What the student brings into the unit:
- 1AM `adad-nisbiya-siyaqat` (1am.m5.r05), `talim-mustaqim-mudarraj` (1am.m5.r06), `talim-fi-mustawi` (1am.m5.r07),
  `adad-ashri-mustaqim-mudarraj` (1am.m5.r04) — all **coming_soon** (not generated): « تذكّر — السنة الأولى » WITHOUT a link;
- 2AM `silsila-bi-aqwas` (2am.m1.r02, published): brackets computed first, [ ] for the outer level;
- 2AM `muqarana-nisbiya` (published): the distance to zero decides between two negatives, negative < 0 < positive, ordering.

Downstream (published): 3AM `jidaa-adadayn-nisbiyayn`, `jidaa-ida-nisbiya` (from r05), 3AM `tanasub-tamthil-bayani` (from r04),
4AM `murakkibata-shuaa`, `muntasaf-masafa` (from r04), 4AM `hisab-murakkibatay`, `ithbat-khawas-maalam` (from r07). Inside the unit,
`muqarana-nisbiya` waits for r01 (its « راجع » panel already names `talim-mustaqim-mudarraj-2`). Inside 2AM, unit 4 `mafhum-muadala`
(other planner) holds `ikhtibar-musawat-mutabayina` (2am.m4.r09), which `requires` r06. See each plan's « Successor connection ».

## Entries, in generation order (owner-approved run order; catalogue order in brackets)

| # | Pair · lane | Code | Title | Items | Lab (new type) | What the hand holds | Gesture · drawn world | Faithful `term_exam` (honest) | Plan |
|---:|---|---|---|---|---|---|---|---:|---|
| 1 | 1 · A | `talim-mustaqim-mudarraj-2` [11] | التعليم على مستقيم مدرّج | r01 | `corniche-ruler` « مسطرة الكورنيش » | the ORIGIN of the graduated board (مبتدئ) and the VALUE of one graduation (متقدم) | plant a « 0 » pin under a landmark + throw a notched step lever · `corniche` « كورنيش المدينة » | 3 read, 4–6 expected | [`talim-mustaqim-mudarraj-2.md`](talim-mustaqim-mudarraj-2.md) |
| 2 | 2 · A | `jam-tarh-nisbiya` [14] | جمع وطرح عددين نسبيين | r05 | `balloon-ballast` « أكياس المنطاد » | the LOAD of a balloon: flame tokens (+1) and sandbags (−1), added or removed | tie a token / bag onto the basket, flick one overboard · `balloonvalley` « منطاد فوق وادي التاسيلي » | 3 read, 5–7 expected | [`jam-tarh-nisbiya.md`](jam-tarh-nisbiya.md) |
| 3 | 3 · A | `majmu-jabri` [16] | حساب مجموع جبري | r06 | `tug-rope` « شدّ الحبل » | the TEAM of every term: turn a « − » child round, then send each child to the left or right team | turn a figure + sort figures onto two sides of a rope · `tugfield` « ساحة يوم الرياضة » | 9 read, 10–12 expected | [`majmu-jabri.md`](majmu-jabri.md) |
| 4 | 3 · B | `talim-nuqta-mustawi` [13] | تعليم نقطة في المستوي | r04 | `dig-grid` « شبكة الحفرية » | the ORIGIN STAKE of a frame laid over an excavation (one 2D drag), then a tapped point | drag a stake with its two cords in 2D + tap a node · `digsite` « حفرية أثرية في جميلة » | 5 read, 7–9 expected | [`talim-nuqta-mustawi.md`](talim-nuqta-mustawi.md) |
| 5 | 4 · A | `masafa-nuqtatayn` [15] | المسافة بين نقطتين على مستقيم مدرّج | r07 | `gap-caliper` « مسماك الفرق » | the OPENING of a caliper clamped on one reading (always ≥ 0) | open / close a caliper jaw, swing it up or down · `meteoboard` « لوحة نادي الأرصاد » | 6 read, 7–8 expected | [`masafa-nuqtatayn.md`](masafa-nuqtatayn.md) |
| 6 | 5 | `wadiya-idmajiya-adad-nisbiya-2` [17] | أدمج تعلّماتي — الأعداد النسبية | — | none (synthesis) | — | — | 1 read, 3–4 expected | [`wadiya-idmajiya-adad-nisbiya-2.md`](wadiya-idmajiya-adad-nisbiya-2.md) |

« Read » = exercise parts whose text the planner actually read on 2026-10-29 (text layer of `2am-s2-50`, `-53`, `-62`, `-63`, `-69`,
`-70`, `-72`, `-73`, `-75`, `2am-s1-66`, `-69`, misfiled `1am-s2-79`); « expected » = after the lead reads the indexed papers WITHOUT
a usable text layer (`2am-s1-73`, `2am-s2-52`, `-59`, `-71`, `2am-s3-40`; and the missing numbers of `2am-s2-69`, `-75`) by rendering them
(`pdftoppm -r 150`). A sheet is `term_exam` ONLY when its exercise was read.

**Lab distinctness.** Five gesture families (plant a pin + throw a lever · tie / flick objects · turn and sort figures · 2D-drag a frame ·
open a caliper) and five worlds, all new (`VISUAL_THEMES` has no `corniche`, `balloonvalley`, `tugfield`, `digsite`, `meteoboard`; the five
type names are free in `packages/core/curriculum/manipulationTypes.js` on 2026-10-29). None reuses or reskins:
- 2AM m1 labs `tram-route` (stamp tickets), `coop-calculator` (place brackets), `chain-cutter` (cut a chain), `kit-packer` (dispensers),
  `mooring-lines` (slide a clip + precision dial), `trail-odometer` (walk a figure along a path), `window-blinds` (two orthogonal pulls),
  `level-laser` (slide a level line vertically);
- `zero-probe` (this unit: the CABLE LENGTH = distance to zero + a side toggle, vertical sea scale);
- the signed-number labs elsewhere: `difference-meter` (3AM, probes on beads read « red minus black »), `number-line-pegs` (3AM, carry a
  card and hang it on a rope), `robot-track`, `sign-machine`, `elevator-reel`, `marble-run`, `code-lockers`, `merge-board` (3AM, merge
  NEIGHBOURING tiles), `term-ferry` (4AM, carry a term across an equation), `equality-lanes`, `solution-ray`;
- the frame labs: `pin-rails` (3AM, slide pins in column grooves), `component-steps`, `component-calc`, `midpoint-distance`,
  `route-compare`, `shape-prover` (4AM), and `ruler-compare`, `unit-ladder`, `size-ladder`, `ten-zoom` (graduations / scales).
Each plan's §6 « Why not another lab » names its closest kin. Leads re-grep `manipulationTypes.js` and `VISUAL_THEMES` before generating:
unit 4 is planned in parallel and must not take the same names.

## Is the run order the best generation order? — Keep it

| Entry | Needs (net) | Order constraint |
|---|---|---|
| `talim-mustaqim-mudarraj-2` | 1AM r06 (consolidates, not published) | none: first; it unlocks the `muqarana-nisbiya` back-edge |
| `jam-tarh-nisbiya` | r01 (entry 1) | after entry 1 |
| `majmu-jabri` | r05 (entry 2), 2am.m1.r02 (published) | after entry 2 |
| `talim-nuqta-mustawi` | 1AM r07 (consolidates, not published) | independent of entries 1–3 (lane B, parallel with `majmu-jabri`) |
| `masafa-nuqtatayn` | r05 (entry 2) | after entry 2 |
| synthesis | all six lessons | last |

The run order differs from the catalogue order (13 `talim-nuqta-mustawi` and 15 `masafa-nuqtatayn` are published AFTER 16
`majmu-jabri`). No `requires` link is crossed backwards (every net link inside 2am.m4 points from an earlier to a later entry of the run),
so there is **no renvoi en avant**. Students see the catalogue order: a « قيد الإعداد » card may sit between two available lessons for a
few days — harmless (`getLessonPath` gives `null`, nothing links to it).

**The book order and the net agree** (`LEARNING_NET.md` §4bis rule of 2026-10-26): r01 (p. 40, 42) before r02/r03 before r04 (act-1 c,
know-1c) before r05 (act-3/4) before r07 (act-5) before r06 (act-6). The net has no link that runs against it.

## Boundaries — who owns what (written ONCE; lead 1 copies this block into `build-extraction.py`'s header, replacing the old one)

- **`talim-mustaqim-mudarraj-2`** (r01) owns: a relative number = a sign and a distance to zero; two opposite numbers (same distance,
  other sign); READING the abscissa of a point on a graduated line whose graduation is 1, 2, 5, 10, 25, 100, 0,5, 0,1 …, including a
  point between two graduations; PLACING points with given abscissae; CHOOSING an origin and a graduation that suit given numbers;
  the fact that an abscissa depends on the origin chosen. It does NOT compare two relatives (`muqarana-nisbiya`), never computes a
  distance between two points (`masafa-nuqtatayn`), never a midpoint, never adds.
- **`muqarana-nisbiya`** (published) owns: compare, order, a number between two numbers. Never rebuilt.
- **`talim-nuqta-mustawi`** (r04) owns: the orthonormal frame (origin, two perpendicular axes, SAME unit); reading and placing a point
  $(x\,;y)$, decimals included; points on the axes; the sign of the coordinates by region; the coordinates of the symmetric of a point
  with respect to ONE AXIS (axial symmetry is 1AM). It does NOT own the symmetric with respect to the origin (central symmetry, 2am.m2 =
  book unit 8, later — a bank step citing it is `counted: false`), nor the nature of a quadrilateral (parallelogram = 2am.m5, later; a
  rectangle or a square from primary school may be COMPLETED from coordinates, never proved), nor a length computed by subtraction
  (it COUNTS unit squares along a grid line; subtraction is `masafa-nuqtatayn`).
- **`jam-tarh-nisbiya`** (r05) owns: the sum of TWO relatives (same sign, different signs, opposites → 0); the difference of two
  relatives (subtract = add the opposite); a missing term in a two-term sum or difference (book ex-28, ex-31: « … + (+5) = (−8) »,
  completed by reasoning on the rule, never named an equation); pyramids of pairwise sums. It does NOT own a chain of three or more terms
  (`majmu-jabri`), nor the distance between two points (`masafa-nuqtatayn`).
- **`majmu-jabri`** (r06) owns: a chain of three or more additions and subtractions of relatives; turning each subtraction into the
  addition of the opposite; moving and grouping terms (positives together, negatives together, opposites cancel); brackets and [ ]
  computed FIRST (recalled from `silsila-bi-aqwas`); the simplified writing (drop « + » and the brackets of a single number:
  $(+5)-(+6)+(-8)=5-6-8$) and computing a chain written in that form. It never removes a bracket preceded by « − » that holds several
  terms by a sign rule (3AM `tabsit-hadhf-aqwas` P1): $(+12)-[(-5)-(-3)+(+8)]$ is computed inside first.
- **`masafa-nuqtatayn`** (r07) owns: the distance between two points of a graduated line = the larger abscissa − the smaller one; it is
  always positive and $AB=BA$; the two points at a given distance from a given point; the abscissa of the MIDPOINT of $[AB]$ as an
  APPLICATION (« half the distance from the smaller end »), never as a formula $\frac{a+b}2$ (4AM `muntasaf-masafa` P1).
- **`wadiya-idmajiya-adad-nisbiya-2`** introduces nothing: abscissae, coordinates, order, sums, algebraic sums, distances in six
  situations; no product or quotient of relatives (3AM), no equation (unit 4).

**Out-of-scope textbook elements** (record them in `DISCREPANCIES`, `kind: 'scope'`):
- `ex-2`, `evaluation`: « باستعمال محرّك بحث في الإنترنيت » — the platform never sends the student away (independence rule): the
  platform GIVES the data (temperatures, time offsets);
- `integration` q 1 and `ict-1`: a spreadsheet / GeoGebra — redesigned without software;
- `ex-10 b`, `prep` 2: « points whose abscissae are not relative numbers » (fractions) — kept only as « $\frac17$ is not written as a
  2AM relative number »; never a fraction placed as a relative;
- `deep-47` (a − (b − c)): its « ماذا تستنتج؟ » leads to the 3AM bracket rule — used with numbers only (two computations compared),
  no rule stated;
- `deep-53` D (symmetric with respect to the ORIGIN) and the exam steps « نظيرة … بالنسبة إلى O / إلى نقطة » — central symmetry (2am.m2,
  book unit 8): only as `counted: false` steps.

## Shared maths — EXTEND `packages/core/arithmetic/relative.js` (never fork)

`relative.js` holds 2AM relative decimals as BigInt hundredths. A sum or a difference of two hundredths is a hundredth, so r05, r06 and
r07 stay in it. **Do not use `relativeOps.js`** (3AM, rationals via `powers.js`; its header says why it does not extend `relative.js`).
Import BY PATH (`@smarter-academy/core/arithmetic/relative.js`, never the core barrel, BUNDLE_BOUNDARIES §3–§4). Each addition is pure,
BigInt, tested in `relative.test.js` (append, never rewrite the `zero-probe` tests):

| Added by | Functions |
|---|---|
| E1 `talim-mustaqim-mudarraj-2` | `opposite(a)` · `abscissaOf(pos, origin, step)` (world position → abscissa; positions and step in hundredths) · `positionOf(x, origin, step)` · `boardFit(values, step, half = 6)` → `{ fits, off: [...], between: [...] }` (`off` = outside ±half graduations, `between` = not on a graduation) · `smallestStep(values, steps, half = 6)` → the smallest step of `steps` with `fits` and no `between`, or `null` |
| E2 `jam-tarh-nisbiya` | `add(a, b)` · `sub(a, b)` (= `add(a, opposite(b))`) · `ruleCase(a, b)` → `'same' | 'different' | 'opposites' | 'zero'` · `ballastOf(a)` → `{ tokens, bags }` (the minimal load of altitude a) |
| E3 `majmu-jabri` | `terms(text)` → `[{ op: '+' | '-', value }]` (parses « (−9) − (+2) + (−5) − (−4) » and « −9 − 2 − 5 + 4 », brackets « [ ] » and « ( … ) » of several terms as a nested group) · `asSum(terms)` (each `-x` → `+opposite(x)`) · `groupBySign(terms)` → `{ pos[], neg[], posSum, negSum, total }` · `algebraicSum(tree)` (inner groups first) · `simplifiedText(terms)` (« -9 - 2 - 5 + 4 ») |
| E4 `talim-nuqta-mustawi` | points `{ x, y }` in hundredths: `pointText(p)` (« (-1,5 ; 2,5) ») · `quadrantOf(p)` → 1…4 or `'axisX' | 'axisY' | 'origin'` · `symX(p)`, `symY(p)` (axial) · `coordsOf(world, origin)` · `originFor(world, wanted)` (the stake that gives `world` the coordinates `wanted`) · `consistent(pairs)` (one stake for several finds, or `null`) |
| E5 `masafa-nuqtatayn` | `gap(a, b)` (= `sub(max, min)`, ≥ 0) · `pointsAt(a, d)` → `[a − d, a + d]` · `midpointAbscissa(a, b)` (null when it needs a third decimal) |

Each lab keeps its state logic in `apps/web/src/lessons/common/manipulations/logic/<lab>.js` on top of this module. Oracles never import it
(`scripts/practice-oracle/<code>.mjs` uses its own BigInt code, like `muqarana-nisbiya.mjs`).

## Extraction — destinations to MOVE in `build-extraction.py` (each lead moves its own; re-read them at 200 dpi, `verified: True`)

The seeding lead routed every pending element to module 1 (activities) or 4 (exercises). Letters: L1 = `talim-mustaqim-mudarraj-2`,
L3 = `talim-nuqta-mustawi`, L4 = `jam-tarh-nisbiya`, L5 = `masafa-nuqtatayn`, L6 = `majmu-jabri`, SYN = synthesis (the letters of the
existing script).

| Element | Today | Planned | Why |
|---|---|---|---|
| `act-1` items a-b | L1 m1 | L1 **m4** | the entry is the platform's lab (guide §4ter); the book's timeline becomes an application (own dates) |
| `act-1` item c | L3 m1 | L3 **m4** | same |
| `act-3`, `act-4` | L4 m1 | L4 **m4** | same |
| `act-5` | L5 m1 | L5 **m4** | same |
| `act-6` | L6 m1 | L6 **m4** | same |
| `ex-29` (sums of 4–6 terms) | L4 m4 | **L6** m4 | three terms or more = `majmu-jabri` (boundary) |
| `deep-49`, `deep-50`, `deep-58` (magic squares, paths: sums of 3–4 terms) | L4 m4 | **L6** m4 | same |
| `self-4` (opposite of −5) | L4 m8 | **L1** m8 | the opposite is r01 |
| `integration`, `evaluation` | SYN None | SYN **m1**, **m2** | redesigned training situations |
| `challenge` | unit page | unit page + **SYN m3** (redesigned) | the card copies the book (owner question 1) |
| `ict-1` | L5 None | L5 **m4** (adapted, no GeoGebra) | « find other positions with AB = 7 » is the lab's free mode |
| `deep-47` | L6 m4 | L6 **None** (bank only, numbers compared, no rule) | scope (above) |

Everything else keeps its destination (lesson and module), re-verified by its lead.

## Discrepancies already in the extraction, and new ones to add

Already there: `know-1b` (−2,5 < −4 printed), `ex-20` (bounds reversed), `ex-29` (« 118 » = +18), `challenge` (blurred altitudes),
`opener`, `unit`.

To add (planner, 2026-10-29):
1. `self-11` — the options (−18,8 ; −21,3 ; −11,9) do not contain the computed value $-3-4+7{,}1-2{,}5-4{,}7=-7{,}1$: the stem is cut
   on the left; the L6 lead re-reads it at 200 dpi before citing it.
2. `self-10` — « الشكل المبسّط للعبارة 5,5 − 3 » with bracketed options: the stem is probably reversed (which bracketed sum
   simplifies to 5,5 − 3: (−3) + (+5,5)); re-read.
3. `act-5` — the abscissa of D is cut; the lesson uses its own points anyway.
4. `integration` — table read at 90 dpi, several amounts cut; the synthesis redesigns it (own amounts).
5. `evaluation` — time offsets change with daylight saving: the synthesis gives WINTER offsets explicitly.
6. `scope` — the five elements listed under « Out-of-scope textbook elements ».

## The unit's تحدّ

The book's card (`units_2am › adad-nisbiya-2.challenge.textAr`) copies the textbook verbatim (the Great Lakes of North America,
depth = surface altitude − bottom altitude, values read on a blurred scan). **Owner question 1:** rewrite it with the platform's own
Algerian version (synthesis module 3):

> « أخفض نقطة في الجزائر هي شطّ ملغيغ، على حوالي $40$ m تحت مستوى سطح البحر، وأعلى نقطة هي قمّة تاهات بالأهقار، على حوالي $2908$ m فوقه.
> ما فرق الارتفاع بينهما؟ تحلّق طائرة على ارتفاع $3500$ m : كم مترًا تعلو كلًّا منهما؟ وحفر فلّاح قرب الشطّ بئرًا عمقها $160$ m من سطح الأرض:
> ما ارتفاع قاعها؟ »

Answers: $2908-(-40)=2948$ m ; $3500-2908=592$ m and $3500-(-40)=3540$ m ; $-40-160=-200$ m. Default: the card is kept until the owner
decides; the synthesis poses the redesigned version (module 3). The figures are the commonly cited ones (« حوالي »).

**Applied (2026-10-30, synthesis):** the unit card's `challenge.textAr` (and the textbook map's `challengeAr`) now carry this Algerian version, as the plan's default question 1 proposed; the synthesis poses it as training situation 3. Revert = restore the two strings from git.

## Corpus at a glance (`docs/sources/moyen/exams/exams-index.json`)

The index tags 23 papers with an item of r01–r07 (r01 7 exercises, r02 0, r03 3, r04 13, r05 17, r06 20, r07 11). 2am.m4 is the
**backbone of TERM 2** (EXAM_PATTERN §3: « sommes algébriques à chaque sujet (ex. 1), droite graduée et repère »): badge « على منوال
اختبار الفصل الثاني », `modelledOn: "2am-s2"`, except the term-1 papers `2am-s1-66`, `-69`, `-73` and the term-3 `2am-s3-40`, `-44`.
Also to look at: eleven 2AM term-2 papers indexed with `exercises: null` (`2am-s2-51`, `-55`, `-57`, `-58`, `-60`, `-64`, `-66`, `-67`,
`-68`, `-74`, `-76`) — almost certainly relative-number papers; `2am-s2-57` ex 1 is readable (an algebraic sum, distances on a line).
A lead who reads one may cite it as `term_exam` (its file id exists in the index; `exercise` = its number on the paper — check that the
validator accepts an exercise number on a `null` entry, otherwise use it as `term_exam_modelled` only). **Excluded:** `2am-s2-61` (war
context), the 3AM papers (`3am-s1-1`, `-109`, `-114`: their header is 3AM), `1am-s1-100` (header 3AM). Misfiled `1am-s2-79` has a 2AM
term-2 header: cite it as `1am-s2-79`, it counts as 2AM term 2.

**Partition of the paper PARTS** — a part is cited as `term_exam` by ONE bank only (the validator cites file + exercise; the sheet's
`notes` names the questions it models). Already used by `muqarana-nisbiya`: `2am-s2-63` ex 2 q 4 (order), `2am-s2-69` ex 1 q 1 (order),
`2am-s1-73` ex 3 (order part).

| Paper · exercise | Parts → bank |
|---|---|
| `2am-s2-63` ex 1 | A, B, C → `majmu-jabri` |
| `2am-s2-63` ex 2 | q 1 (place A(+4,5), B(−5), C(−2)) → `talim-mustaqim-mudarraj-2`; q 2–q 3 (BC, AC, AB; K such that C is the midpoint of [BK]) → `masafa-nuqtatayn` |
| `2am-s2-63` ex 3 | q 1, q 4–q 5 (place; complete a rectangle, coordinates of C) → `talim-nuqta-mustawi` (q 2 central symmetry `counted: false`) |
| `2am-s2-62` ex 1 | A, B (two terms) → `jam-tarh-nisbiya`; C, D, « A + C = 0 » → `majmu-jabri` |
| `2am-s2-62` ex 2 | q 1, q 3, q 4 (place A(−5), B(+3), C(−2); L symmetric of A about O on the LINE = the opposite; read abscissae) → `talim-mustaqim-mudarraj-2`; q 2, q 5 (midpoint M of [AB], distances BC, ML) → `masafa-nuqtatayn` |
| `2am-s2-62` situation part 1 | wall corners L(0;4), M(−4;0) in a frame, symmetric points, area, painting cost → synthesis |
| `2am-s2-70` ex 1 | q 1 A, B → `jam-tarh-nisbiya`; q 1 C and D → `majmu-jabri`; q 2 (E(−5), G(−30), F(+20): EG, FE, E is the midpoint of [GF]) → `masafa-nuqtatayn` |
| `2am-s2-70` ex 2 | place A, B, C; D and the quadrilateral (`counted: false`) → `talim-nuqta-mustawi` |
| `2am-s2-50` ex 1 | A, B → `jam-tarh-nisbiya`; C, D → `majmu-jabri` |
| `2am-s2-72` ex 1 | E, G → `majmu-jabri` |
| `2am-s2-72` ex 3 | place L, N, M; K for a rectangle → `talim-nuqta-mustawi` |
| `2am-s2-73` ex 1 | a) A, B → `majmu-jabri`; b) L(−6), K(−4), KL → `masafa-nuqtatayn` |
| `2am-s2-53` ex 1 q 1 | → `majmu-jabri` |
| `2am-s2-53` ex 2 | place A, B, C; midpoint M read on the figure → `talim-nuqta-mustawi` |
| `1am-s2-79` ex 2 q 1 | P, R (brackets) → `majmu-jabri` |
| `1am-s2-79` ex 4 | place E, F, G, L; « E and L symmetric about O? » (`counted: false`) → `talim-nuqta-mustawi` |
| `2am-s1-66` ex 1 F | → `majmu-jabri` (term 1) |
| `2am-s1-66` ex 3 | A(−7), B(−3), C(+2): AB, BC, midpoint E of [AC] → `masafa-nuqtatayn` (term 1) |
| `2am-s1-69` ex 4 | q 1, q 4 (place F(+5), E(−3); D with the opposite abscissa of G) → `talim-mustaqim-mudarraj-2`; q 2, q 3 (EF, midpoint G) → `masafa-nuqtatayn` (term 1) |
| `2am-s2-69` ex 1 | q 2 (A − D, B + C) → `jam-tarh-nisbiya`, q 3 (AB) → `masafa-nuqtatayn` (values on the scan) |
| `2am-s2-69` ex 3 | D symmetric of A about the ORDINATE axis (axial) → `talim-nuqta-mustawi` (points on the scan) |
| to render | `2am-s1-73` ex 1 → `jam-tarh-nisbiya`; ex 3 rest → L1 / L3 / L5 by question · `2am-s2-71` ex 1 → L1 / L5, ex 2 → `majmu-jabri`, ex 5 → synthesis · `2am-s2-52` ex 2 → L6 / L5, ex 3 → L3 · `2am-s2-59` ex 1 → L6, ex 4 → L3 · `2am-s2-75` ex 1 q 1 → L6, ex 2 → L3 · `2am-s3-40` ex 1, `2am-s3-44` ex 1 → L6 (term 3) · `2am-s1-66` ex 5 (situation in a frame, poor) → synthesis |

Contexts are REWRITTEN (never copied). `2am-s2-70` ends with a Ramadan greeting and `1am-s2-79`'s situation is about Ramadan lanterns
(not this unit): no religious occasion is reused as a context.

## Misconception id prefixes (free in `content/practice/misconceptions.json` on 2026-10-29)

`MISC-TALIM2-*` (E1) · `MISC-JAMNISB-*` (E2) · `MISC-JABRI-*` (E3) · `MISC-NUQTA2-*` (E4) · `MISC-MASAFA2-*` (E5) · `MISC-SYN-NISB2-*` (E6).
Taken and NOT to be used: `MISC-MUQARANA-*` (this unit's `muqarana-nisbiya`), `MISC-JAMTARH-*`, `MISC-JAMKASR-*`, `MISC-MAALAM-*` (4AM),
`MISC-ISHARA`, `MISC-AMAL-*`, `MISC-IDA-*`, `MISC-QISMA-*`, `MISC-SYN-KASR2`. Unit 4 (other planner) picks its own: re-grep before writing.

## Owner questions common to the unit (each plan says its default)

1. **The unit card's تحدّ** (verbatim Great Lakes): rewrite with the Algerian version above. Default: keep until decided.
2. **Missing net link `2am.m4.r02 → 2am.m4.r07`** (requires): « the larger abscissa minus the smaller » needs the comparison. The
   extraction header already says so. Default: `masafa-nuqtatayn`'s « أستعدّ » measures the comparison (extra `priorKnowledge`), no LP
   edge, `prerequisiteLessonCodes` unchanged (`LEARNING_NET.md` §3bis: they are the homes of the review links).
3. **Missing net link `2am.m4.r01 → 2am.m4.r04`** (requires): reading a coordinate IS reading an abscissa on an axis. Default: measured
   by « أستعدّ », no edge.
4. **First cross-year LP edges INTO 4AM.** The net links `2am.m4.r04 → 4am.m4.r04 / r06` and `2am.m4.r07 → 4am.m4.r05` would give the
   first `2am_*` prerequisites of 4AM الكفاءات (none exists today; 4AM is the Mastery V2 grade in use). Default: NOT written; the edges
   are listed in plans 4 and 5; the 4AM « راجع قبل أن تنطلق » panels turn into links by themselves.
5. **Changed meanings of draft الكفاءات** (positions kept): E1 P1 (adds the distance to zero), E2 P2 (adds « opposites → 0 »), E3 P2
   (adds the brackets computed first, the net's `2am.m1.r02`), E4 P3 (adds the symmetric about an axis), E5 P2 (adds the two points at a
   given distance). Every change is listed in the plans.
6. **1AM drafts that duplicate 2AM** (cheap to fix before 1AM is generated): 1AM `talim-mustaqim-mudarraj` P1–P3 are nearly the words of
   2AM r01 (the net says `consolidates`, fine), and 1AM `talim-fi-mustawi` P1–P3 those of r04; the 1AM lessons should keep integers and
   simple decimals, the 2AM ones add graduations 5/10/25/0,1, the origin choice and the orthonormal frame. Confirm.
7. **Facts in contexts**: altitudes (Tahat ≈ 2908 m — some sources give 3003 m; Chott Melghir ≈ −40 m) and winter time offsets (synthesis
   module 2). Default: « حوالي » and « في فصل الشتاء ».
8. **One LP with `programmeItems: []`** for the synthesis — the decision already published for the 3AM and 2AM-m1 syntheses.
