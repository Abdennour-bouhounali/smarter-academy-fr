# Plan — `muqaranat-natiqayn` « مقارنة عددين ناطقين » (3AM unit 4, queue Phase 0 #16)

Planner: Opus, 2026-10-25. Read the unit README first ([`README.md`](README.md): boundaries, shared maths, owner questions).
Every number below was computed exactly (`fractions`, sympy); the generator recomputes them in `content.test.js` with its own BigInt code.

## 1. Identity

- **Code** `muqaranat-natiqayn` · **title** « مقارنة عددين ناطقين » · unit `ibarat-harfiya-3` · catalogue `order` 18 · `kind: lesson`.
- **Folder** `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/ibarat-harfiya-3/muqaranat-natiqayn/` (file set of `nashr-jabri-3am/`).
- **Textbook** pp. 54–69. Elements (`extraction.json`, `verified: false` — re-read at 250 dpi):
  - `act-5` p. 57 « مقارنة عددين ناطقين »: a table of five pairs (5/7 ; 2/3), (3/4 ; 7/9), (−8/3 ; 5/9), (−1/7 ; −4/9), (−5/3 ; −2/7) to place
    on a graduated line, then « إذا كان a − b … يكون a … من b », and a − b when a = b. Differences: **1/21, −1/36, −29/9, 19/63, −29/21**.
  - `know-5` p. 60 (معارف 5): a > b ⟺ a − b > 0, a < b ⟺ a − b < 0, a = b ⟺ a − b = 0; examples 5/3 − 9/7 = **8/21** > 0;
    −13/9 − (−6/5) = **−11/45** < 0.
  - `method-5` p. 61: 14/13 − 8/7 = **−6/91** → 14/13 < 8/7; −5/9 − 3/(−4) = **7/36** → −5/9 > 3/(−4); remark: or write both with the same
    positive denominator and order the numerators (that is unit 2's method — recalled, not taught).
  - `now-61` item ② p. 61: 13/6 and 35/17 → 13/6 − 35/17 = **11/102** > 0; −4/5 and 2/(−3) → −4/5 − (−2/3) = **−2/15** < 0 (read at 250 dpi).
  - `ex-27` p. 64: order from the difference ALONE: a − b = 0,1 ; −5/2 ; b − a = 7 ; −10⁻² ; a − b = 2/5 ; b − a ≥ 1.
  - `ex-28`: oral pairs (12 ; 4), (−5 ; −9), (−11 ; 7), (3 ; −8) → sign of x − y without computing, then check: **8, 4, −18, 11**.
  - `ex-29`: calculator: 53,4/7,89 − 23,55/3,48 = **25/30508** > 0 (6,76806… vs 6,76724…); 1,28/7 vs 0,441/2,4: difference **−1/1120**.
  - `ex-30`: 3/7 ; 13/28 → **−1/28** · −5/4 ; −13/12 → **−1/6** · 7/3 ; 15/7 → **4/21** · 5/6 ; −7/8 → **41/24**.
  - `ex-31`: Maryam divides, Younes subtracts (25,96/35,89 vs 38,94/53,89: difference **14278/19341121** ≈ 0,000738 > 0) — which way is better?
  - `ex-32`: A = 5x − 4, B = 4x + 3: signs at x = 0, 7, 9 (A: −4, 31, 41; B: 3, 31, 39); A − B = **x − 7**; A > B for x > 7.
  - `self-9` p. 65: a = π/2, b = π/3 → a − b = **π/6** > 0. `self-10`: 4/13 and 0,91/3 → difference **17/3900** > 0.
  - `deep-38` p. 66 « أقارن محيطين وأقارن مساحتين »: two shapes with sides in x (0 < x < 7): « same perimeter always » / « same area
    always »? The figure's tick marks are ambiguous at 110 dpi — **re-read at 400 dpi** before transcribing; the platform poses its own
    pair anyway (E8 below).
- **Seeds the unit?** No.

## 2. Programme & net

- **programmeItems** `3am.m5.r04` « مقارنة عددين ناطقين. »
- **Draft الكفاءات** (verbatim): 1. الربط بين ترتيب عددين وإشارة فرقهما: $a>b$ يكافئ $a-b>0$ · 2. مقارنة عددين ناطقين بحساب فرقهما وتعيين
  إشارته · 3. مقارنة عبارتين حرفيتين بدراسة إشارة الفرق
- **Proposed final wording** (order kept):
  1. **P1** الربط بين ترتيب عددين وإشارة فرقهما: $a>b$ معناه $a-b>0$ ، و $a<b$ معناه $a-b<0$ ، و $a=b$ معناه $a-b=0$ ، ومعرفة الترتيب من الفرق وحده — *the three cases of `know-5` and « from the difference alone » (`ex-27`, the lesson's sharpest idea).*
  2. **P2** مقارنة عددين ناطقين (موجبين أو سالبين، بكتابة كسرية أو عشرية) بحساب فرقهما وتعيين إشارته — *adds the cases the book uses (signs, decimals through a calculator difference).*
  3. **P3** مقارنة عبارتين حرفيتين بتبسيط فرقهما وتعيين إشارته حسب قيم $x$، مثل $A-B=x-4$ موجب عندما $x>4$ — *adds « by simplifying » (the published `tabsit` skill) and an example that fixes the scope (README boundary).*
- **Review items for « أستعدّ »**: the only net link INTO `3am.m5.r04` is `3am.m1.r05 → 3am.m5.r04` (**consolidates**, « مقارنة عددين
  ناطقين: هي مقارنة كسرين تُوظَّف في الحساب الحرفي ») → item `3am.m1.r05` « مقارنة كسرين », home `tasawi-muqaranat-kasrayn` (queue #6 —
  expected **published** at generation; check). Extra `priorKnowledge` (no net link — owner question 1): `3am.m1.r06` « جمع وطرح كسرين »
  (`jam-tarh-kasrayn`, queue #7), `2am.m4.r02` « مقارنة عددين نسبيين » (published `muqarana-nisbiya`), `3am.m5.r01` (published `tabsit-hadhf-aqwas`).
- **noRebuild**: `3am.m1.r05` consolidated → the lesson does NOT re-teach comparing fractions by a common denominator / cross products:
  معارف opens on a « تذكّر » `TextbookBox kind="remark"` « قارنّا كسرين بتوحيد مقاميهما » (link `getLessonPath('tasawi-muqaranat-kasrayn')`
  when published) and goes straight to the difference.
- **pointPrerequisites** — intra: `P2 ← P1`, `P3 ← P1`. Cross-lesson: along `3am.m1.r05 → 3am.m5.r04` only, if
  `tasawi-muqaranat-kasrayn` is `available`: `P2 ← 3am_tasawi-muqaranat-kasrayn_P<k>` where P<k> is its final « مقارنة كسرين مقاماهما
  مختلفان » (draft P3). No edge toward `tabsit-hadhf-aqwas` unless the owner adds `3am.m5.r01 → 3am.m5.r04`.
- **Where 4AM uses it**: no explicit net link out of r04 today. In 4AM, comparing via the difference reappears in inequations
  (`4am.m3.r04`), comparing two plans / tariffs (`tafsir-bayani-jumla`, `tarrid-taalufi`: which offer is cheaper) and in the BEM
  « قارن بين … » items (often numbers with roots: 4AM unit 2).

## 3. Boundary

Owns P1–P3 as in the README: the equivalence, ordering from the difference alone, comparing two rationals (signs, decimals,
multiples of π) by computing the difference, comparing two expressions whose simplified difference has a directly readable sign
(constant, x − c, c − x, a product of known-sign factors). Leaves: comparing fractions by a common denominator / cross products (unit 2,
recalled); operating on inequalities (`mutabayinat-amaliyat`, unit 5 — this lesson never writes « a < b ⇒ a + c < b + c » nor divides
an inequality); solving inequations (4AM); ordering more than two numbers (2AM / unit 2 practice); evaluating an expression (`qimat` —
used as a tool: values of A and B at a given x).

## 4. Textbook analysis

| Element | What it asks | Idea worth keeping | Platform use |
|---|---|---|---|
| `act-5` | five pairs on a graduated line, then the sign rule as a fill-in | the link order ⟷ sign comes from SEEING the pairs | rejected as entry: the pairs are visibly apart on a line, the sign of a − b is never NEEDED; the lab keeps the « see then compare » contrast and adds pairs the eye cannot separate → **application** in أتمرّن (E1, own pairs) |
| `know-5` | the three equivalences + two examples | the « معناه » wording (equivalence) | معارف box in own words, own examples |
| `method-5` | difference of two fractions, sign, conclusion; the remark on same denominators | the written conclusion « بما أنّ … فإنّ … » | طريقة, own numbers |
| `now-61` ② | two pairs | a negative denominator | أتمرّن E4 (own pairs) |
| `ex-27` | order from a given difference | **you do not need a and b** | lab متقدم task `d6` + أتمرّن E2 (own cards) |
| `ex-28` | oral comparison then sign of x − y | the rule read both ways | أتمرّن E3 (own pairs) |
| `ex-29`, `ex-31` | calculator: divide twice or subtract once | the difference shows the order in ONE display, the quotients need many digits | مسألة 3 (prices per litre) + أتمرّن E5 |
| `ex-30` | four pairs incl. one positive / negative | the sign of a positive − negative is immediate | أتمرّن E4 |
| `ex-32` | two expressions: signs at values, A − B, comparison for x > 7 | the difference of two expressions is ONE expression whose sign decides | طريقة lab world `race` + أتمرّن E7 (own) |
| `self-9`, `self-10` | π multiples; fraction vs decimal quotient | π/2 − π/3 = π/6 > 0 without approximating π | أتمرّن E6 + final test |
| `deep-38` | perimeters / areas of two shapes always equal? | equal perimeters for every x, areas differing by a constant | أتمرّن E8 with an own pair (square vs rectangle) |

## 5. Design

**The idea in one paragraph.** To compare two numbers we never need to SEE both: their difference, ONE number, carries the order —
a − b positive means a lies to the right of b (a > b), negative to the left, zero means a = b. It works where the eye fails (two
fractions closer than a pixel), where the numbers are unknown (only « a − b = −0,3 » is given), with negatives (−3/2 is NOT bigger than
−1/2 although 3/2 > 1/2), and for two EXPRESSIONS: A − B simplifies to one expression (x − 4) whose sign, read for each x, says which is
bigger. Swapping a and b swaps the sign of the difference, not the order.

**Entry decision.** Candidates:
- (a) the book's `act-5` (place five pairs on a graduated line, fill the sign column, then complete the rule): the pairs are far enough
  apart to be ordered by eye, so the difference is redundant — the rule is copied from a table, not needed. → application (E1).
- (b) comparing by common denominators: that is unit 2's method (consolidated) — not new, and not the lesson.
- (c) **chosen — the difference meter**: in the school physics lab, a long glass rail graduated like a number line carries two beads
  (the numbers a and b). A needle meter with TWO probes reads « red probe minus black probe ». The hand plugs the probes on the beads —
  deciding WHICH number is subtracted — and reads ONE needle: right of 0, left of 0, on 0. With far beads the student sees that the needle
  side always matches the bead order (discovery of P1); then a pair at 1/176 apart (0,85 px on the rail: the beads overlap) is decided
  by the needle alone; then the beads are hidden behind a curtain and only « a − b = −0,3 » is shown — still decidable. The difference
  becomes NECESSARY exactly where looking fails. In module 3 the hand holds x and the two beads move with A(x) and B(x): the needle crosses
  0 where the beads meet.

**Order of ideas.** needle side ⟷ bead order on visible pairs (P1) → swapping the probes flips the needle, not the order (P1) → the
negative pair (−3/2 vs −1/2, the « bigger without the sign » trap) → the invisible pair (P2) → (متقدم) write the difference before the
needle shows it; the curtain: the difference alone (P1, P2) → معارف: « معناه », the three cases, the written conclusion → طريقة: the method on
fractions, decimals and π; two expressions with x in the hand (P3) → أتمرّن → مسائل → إختبار أولي.

**Story contexts** (own): two classes' success rates at a school quiz, 25/31 and 29/36 (fair judging — problem 1); two buses for the
school trip with a fixed fee and a price per km (choose wisely — problem 2); two juice bottles, 1,5 L for 97,50 DA and 2,25 L for
146,40 DA (careful spending — problem 3).

## 6. Lab — `difference-meter` « مقياس الفرق »

- **Type** `difference-meter` (free on 2026-10-25 — re-check), declared in `manipulationTypes.js`; theme `physicslab` added to
  `VISUAL_THEMES` (`{ kind: 'objects', shows: 'سكّة مدرّجة ومقياس بإبرة' }`). Files `common/manipulations/operations/DifferenceMeter.jsx`
  (+ `operations/differenceMeter/*`), `logic/differenceMeter.js` (+ test), `operations/differenceMeter.render.test.jsx`, strings
  `lesson.manipulation.json › differenceMeter`.
- **Drawn world.** The school physics lab bench: a long glass rail with a printed graduation (a number line, 0 marked in gold, range set
  by the task: −2 … 2 for the fraction tasks, 0 … 80 for the expressions), two glass beads on it (« a » warm amber, « b » cool blue, each with
  its value tag in an LTR pill); above the rail a brass needle meter (a galvanometer: a curved scale with 0 in the middle, left half tinted
  red, right half green) with two coiled leads ending in probes, one red, one black; a magnifier lamp shows the beads when they overlap
  (« الحبّتان متراكبتان على السكّة »). A `KidFigure` girl in hijab and tunic, « ريم », holds the leads at the start (`wonder`, `proud`).
  No raster; honest positions (bead x-coordinates = values at scale).
- **The variable in the hand.** (1) WHICH number is subtracted: the hand drags the red probe onto one bead and the black probe onto
  the other (drag; tap a probe then a bead; keyboard: Tab to a probe, ← → between beads, Enter plugs); « بدّل المجسّين » swaps them.
  (2) At متقدم, the DIFFERENCE written before the needle moves (sign, numerator, denominator steppers or keypad; fraction reduced or not —
  judged by value). (3) In world `race`, x (a slider knob with −/+, arrows, Home/End; integers 0 … 10, `½` steps in the free panel).
- **What the world shows (never the rule).** Once both probes are plugged the needle swings to (red − black) on its scale, the
  digital window under it shows the exact value as a fraction (LTR), and a soft click when it settles. The beads never move in module 1.
  When the probes are swapped the needle crosses to the other side, the beads do not move. Verdict cards « a > b » « a < b » « a = b »
  (big, tactile) under the rail; a wrong verdict shakes and the banner says the two facts side by side in the student's numbers
  (« المجسّ الأحمر على a والأسود على b، والإبرة عند −1 ») — never the rule.
- **Opening (no title).** Context: « على سكّة المختبر حبّتان: a و b. المقياس يقرأ عدد المجسّ الأحمر ناقص عدد المجسّ الأسود. » Question:
  « صِل المجسّين بالحبّتين ثم اختر بطاقة الترتيب الصحيحة لكل زوج. » (the `lead` per task carries the two numbers).
- **Level مبتدئ** (the needle and its value visible as soon as both probes are plugged). Tasks:
  - `d1` a = 5/4, b = 3/4 (visible apart) → red on a: **+1/2** → « a > b ».
  - `d2` a = −3/2, b = −1/2 → red on a: **−1** → « a < b »; then the lab asks once for « بدّل المجسّين »: **+1** → the order card stays
    « a < b » (a contrast trial required before the discovery, `swapTried`).
  - `d3` a = 9/11, b = 13/16 (0,818… vs 0,8125: **0,85 px** apart on a 150 px-per-unit rail — they overlap; the magnifier shows a blur)
    → **+1/176** → « a > b ».
  End state: three verdicts accepted and one swap seen.
- **Level متقدم** (the needle is covered by a shutter until the student has WRITTEN the difference; then it swings to the true value; a
  wrong written value is refused with both numbers: « كتبتَ 1/36 والإبرة عند −1/36 »). Tasks:
  - `d4` a = 17/12, b = 10/7 → **−1/84** → « a < b ».
  - `d5` a = −7/6, b = −9/8 → **−1/24** → « a < b ».
  - `d6` the curtain: the beads are hidden, only a card « $a-b=-0{,}3$ » is shown and the needle stands at −0,3 → « a < b » without any
    computation (the discovery's wrong option « لا نستطيع الحكم دون معرفة a و b » is refuted here).
  End state: three verdicts accepted.
- **World `race` (module 3, `levels={false}`, the lesson's `tasks`).** The beads are now A(x) and B(x) (the expressions printed on their
  tags, their values below); the hand holds x; the beads slide as x changes (different speeds), the needle (probes fixed: red on A, black on
  B) reads A − B live. Each task: (1) simplify A − B (coefficient steppers for x and the constant, « تحقّق » judged at three x — the published
  `tabsit` skill as a tool); (2) fill three cards « عندما x < c » / « x = c » / « x > c » with « A > B / A = B / A < B » (or one card « لكل x »).
  Tasks (exact): `e1` A = $3x+5$, B = $2x+9$ → A − B = **x − 4** (x = 0: 5 / 9; x = 4: 17 / 17; x = 6: 23 / 21) → A < B for x < 4, equal at 4,
  A > B for x > 4. `e2` A = $2(x+3)$, B = $2x+1$ → **5** (the beads keep the same gap: x = 0: 6 / 1; x = 8: 22 / 17) → A > B for every x.
  `e3` A = $x^2+3$, B = $x^2+x$ → **3 − x** (x = 2: 7 / 6; x = 4: 19 / 20) → A > B for x < 3, A < B for x > 3. Opening: « حبّتان تتحرّكان مع
  x: الأولى عند قيمة A والثانية عند قيمة B. » / « حرّك x وبسّط A − B، ثم املأ بطاقات الترتيب لكل قيم x. »
- **« جرّب أعدادك » — always open.** Two numbers typed (integer, decimal with a comma, or fraction p/q; |value| ≤ 9, denominators ≤ 99;
  Arabic-Indic digits and the real minus accepted): the beads move there, the probes stay plugged. In `race`: two expressions `ax + b`
  or `x² + ax + b` (|a|, |b| ≤ 20). Free trials `free: true`, never tick a task; « عُد إلى مهامّك ».
- **LabCoach**: `plug` « اسحب المجسّ الأحمر إلى حبّة » → `plug2` « والمجسّ الأسود إلى الحبّة الأخرى » → `verdict` « اختر بطاقة الترتيب » →
  `swap` (once, `d2`) « المس "بدّل المجسّين" » → `write` (متقدم) « اكتب الفرق قبل أن تُرفع الستارة » ; `race`: `x` « حرّك x » → `coef`
  « اكتب معاملي A − B » → `cards`. `coachOf` pure, tested to the end of every task.
- **Misconceptions made VISIBLE.** « the bigger without its sign » (`d2`: the needle goes LEFT for −3/2 − (−1/2)); « a − b and b − a give
  different orders » (the swap: the needle crosses, the verdict card does not change); « bigger numerator (or denominator) ⇒ bigger »
  (`d3`: 9/11 vs 13/16 — smaller numerator wins; `d4`: 17/12 vs 10/7); « you need a and b » (`d6`); for expressions: « the one with the
  bigger coefficient is always bigger » (`e1` for x < 4) and « same coefficient of x ⇒ equal » (`e2`: always 5 apart).
- **Discovery** (after the level's tasks and `swapTried`): « متى تميل الإبرة إلى اليمين؟ » — right « عندما يكون عدد المجسّ الأحمر أكبر: الفرق
  موجب » ; wrong « عندما يكون عدد المجسّ الأحمر أبعد عن الصفر » (refuted by `d2`: −3/2 is farther, the needle went left) ; « عندما يكون للعدد
  الأحمر بسط أكبر » (refuted by `d3`). At متقدم a second one: « هل تحتاج إلى a و b لتعرف الترتيب؟ » — right « لا: إشارة a − b وحدها تكفي »
  (refuting option by `d6`). Formal (named only now): « $a>b$ معناه $a-b>0$ … ».
- **Core maths** — new `packages/core/arithmetic/orderSign.js` (+ test), exact through `powers.js` (`rat`, `sub`, `sign`, `ratTex`,
  `parseRat`): `difference(a, b) → rat`; `orderOf(a, b) → '>' | '<' | '='`; `verdictJudge(a, b, red, card) → { ok, reading }` (red ∈
  {'a','b'}); `fromDifference(card) → order` (card `{ left: 'a'|'b', value | bound: '≥' }`); `pixelGap(a, b, unitPx)`; `parseNumber(text) → rat`
  (comma decimals, fractions, Arabic-Indic, real minus); expressions: `exprDifference(A, B) → terms` and `signRegions(terms) → [{ from, to,
  sign }]` for a constant / `x − c` / `c − x` (through `polynomials.js` `reduce`, `brackets.js` `simplify`); `regionCardsJudge(task, cards)`.
  UI orchestration `logic/differenceMeter.js` (+ test: every task of both levels and `race` solved following `coachOf`; swap; written
  difference refusal; region cards; reset).
- **Events**: `{ kind: 'plug', task, red, black }` · `{ kind: 'reading', task, value }` · `{ kind: 'swap', task }` · `{ kind: 'write', task,
  written, value, ok }` · `{ kind: 'verdict', task, card, ok }` · `{ kind: 'x', x }` · `{ kind: 'coef', task, ok }` · `{ kind: 'regions', task, ok }` ·
  `{ kind: 'solved', world, task }` · `{ kind: 'custom', world }`.
- **DOM contract**: `[data-difference-meter][data-world][data-task][data-solved]`, `[data-dm-glance]`, `[data-dm-rail]`,
  `[data-dm-bead=a|b][data-value]`, `[data-dm-probe=red|black][data-on]`, `[data-dm-swap]`, `[data-dm-needle][data-reading]`,
  `[data-dm-shutter]`, `[data-dm-write]`, `[data-dm-card=gt|lt|eq]`, `[data-dm-curtain]`, `[data-dm-x]` (+ `-less` / `-more`),
  `[data-dm-coef=<p>]`, `[data-dm-region=<i>]`, `[data-dm-refused=<reason>]`, `[data-dm-banner]`, `[data-dm-free]`, `[data-dm-formal]`.
- **Why not another lab (DNA §12).** `zero-probe` (2AM): the hand holds the DISTANCE to zero of ONE sensor, its sign a switch — one
  number located; here two numbers are never located by the hand: the hand decides which is subtracted and reads their DIFFERENCE on a
  separate instrument. `ruler-compare` (1AM): the graduation of a ruler decides decimals by digits; here no graduation is chosen — the eye
  explicitly fails (0,85 px) and a single signed reading decides. `equality-lanes` (unit 5): runners at the values of two sides receive the
  same operation; here no operation is applied to the numbers — the beads never move in module 1, and in `race` x moves them while the needle
  reads A − B (no operation on an inequality, README boundary). `growth-race` (4AM): columns meet at an equation's solution; here no equation
  is solved, the sign REGIONS of one simplified difference are read. Gesture family: PLUG probes + read one needle; HOLD x.
- **Screen budget.** At 1024×768 with the sidebar open (column ≈ 450–520 px): meter (≤ 150 px high) above the rail (one row, labels never
  overlapping — geometry test), verdict cards in one row under it, the free panel a single row (two fields) kept open; at 768×1024 the
  same stack with more air. `race` adds the x knob row and the coefficient row (steppers ≥ 44 px). Budgets from `useLessonViewport`.

## 7. Modules (standard 9)

| # | slug | title | LPs |
|---|---|---|---|
| 0 | `astaidd` | أستعدّ | — |
| 1 | `nashat` | نشاط — مقياس الفرق | P1, P2 |
| 2 | `maarif` | معارف — الفرق يرتّب | P1, P2 |
| 3 | `tariqa` | طريقة — أحسب الفرق وأقرأ إشارته | P2, P3 |
| 4 | `atamarran` | أتمرّن | P1–P3 |
| 5–7 | `masala-1…3` | مسائل | P1–P3 |
| 8 | `itqan` | إختبار أولي | P1–P3 |

**Module 0 — أستعدّ.** `objectives`: « أتحقّق من مقارنة كسرين ومن طرحهما ومن مقارنة عددين نسبيين ». Six true/false statements:
1. « $\frac58<\frac23$ » — صحيح (15/24 < 16/24) (`tasawi-muqaranat-kasrayn`).
2. « $-\frac34>-\frac35$ » — خاطئ (−0,75 < −0,6) (`tasawi-muqaranat-kasrayn` / `muqarana-nisbiya`).
3. « $\frac56-\frac34=\frac1{12}$ » — صحيح (`jam-tarh-kasrayn`).
4. « $\frac25-\frac37=-\frac1{35}$ » — صحيح (14/35 − 15/35) (`jam-tarh-kasrayn`).
5. « $-7<-2$ » — صحيح (`muqarana-nisbiya`).
6. « $5x-2-(3x+4)=2x+2$ » — خاطئ (2x − 6) (`tabsit-hadhf-aqwas`).

**Module 1 — نشاط (lab `difference-meter`, two levels).** `objectives`: « أكتشف أنّ إشارة الفرق a − b تحدّد ترتيب العددين a و b ». Steps:
- q1 (choice) « في الأزواج التي رأيتها متباعدة على السكّة، متى مالت الإبرة إلى اليمين؟ » — right « عندما كان العدد تحت المجسّ الأحمر هو
  الأكبر » ; wrong « عندما كانت الحبّة الحمراء أبعد عن الصفر » ; « دائمًا عند الكسر ذي المقام الأكبر ». Brick `ishara-farq`.
- q2 (choice) « بدّلتَ المجسّين في الزوج الثاني فانتقلت الإبرة من −1 إلى 1. هل تغيّر الترتيب؟ » — right « لا: $-\frac32<-\frac12$ في الحالتين؛
  $a-b=-1$ و $b-a=1$ » ; wrong « نعم: صار $-\frac32$ أكبر ».
- q3 (numeric) « الحبّتان $\frac9{11}$ و $\frac{13}{16}$ متراكبتان على السكّة. ما الفرق $\frac9{11}-\frac{13}{16}$؟ » → **1/176** ; then (choice)
  « فأيّهما أكبر؟ » → $\frac9{11}$.
- q4 (choice, advanced) « لم ترَ الحبّتين في المهمة الأخيرة، ورأيت فقط $a-b=-0{,}3$. ماذا تستنتج؟ » → « $a<b$ ».

**Module 2 — معارف.** `objectives`: « أكتب العلاقة بين الترتيب وإشارة الفرق في حالاتها الثلاث، وأستعملها ». Opens on its first question:
q1 (choice) « أكمل: إذا كان $a-b=\frac27$ فإنّ … » → « $a>b$ » ; q2 (choice) « إذا كان $b-a=-4$ فإنّ … » → « $a>b$ » (the reversed
subtraction) ; « أتوقّع القاعدة » « اكتب بكلماتك العلاقة بين ترتيب عددين وإشارة فرقهما » ; box (own words, `know-5`): « a و b عددان. $a>b$
معناه $a-b>0$ ، و $a<b$ معناه $a-b<0$ ، و $a=b$ معناه $a-b=0$ » ; q3 (numeric) « احسب $\frac74-\frac53$ » → **1/12** and conclude $\frac74>\frac53$
(own example) ; q4 « احسب $-\frac{11}{8}-\left(-\frac43\right)$ » → **−1/24** and conclude $-\frac{11}8<-\frac43$. The « تذكّر » (unit 2) box in
the `brief`. Knowledge map: الترتيب ⟷ إشارة الفرق (three nodes), the reversed difference, a guide node « خطأ شائع: الأبعد عن الصفر ليس الأكبر »
under the second node.

**Module 3 — طريقة (lab `difference-meter`, world `race`, `levels={false}`).** `objectives`: « أقارن عددين ناطقين أو عبارتين حرفيتين بحساب
الفرق وتعيين إشارته ». First the method on numbers (own worked examples, `method-5` redesigned): « قارن $\frac{11}{8}$ و $\frac{15}{11}$ » →
$\frac{11}8-\frac{15}{11}=\frac{121-120}{88}=\frac1{88}>0$ إذن $\frac{11}8>\frac{15}{11}$ ; « قارن $-\frac59$ و $\frac{4}{-7}$ » →
$-\frac59+\frac47=\frac{-35+36}{63}=\frac1{63}>0$ إذن $-\frac59>\frac4{-7}$ ; then the lab `race` (`e1` → `e3`), then steps:
- q1 (choice) « في $e1$: لماذا كانت B أكبر عند $x=0$ مع أنّ معامل x في A أكبر؟ » — right « لأنّ $A-B=x-4$ سالب عندما $x<4$ ».
- q2 (choice) « في $e2$ لم تلتقِ الحبّتان أبدًا. لماذا؟ » — right « لأنّ $A-B=5$ موجب لكل قيم x ».
- q3 (numeric) « في $e3$: ما قيمة $A-B$ من أجل $x=10$؟ » → **−7** (103 − 110), then (choice) → « A < B ».
Box (own words): « لمقارنة عبارتين A و B نبسّط $A-B$ ثم نعيّن إشارته حسب قيم x ». Brick `farq-ibaratayn`.

**Module 4 — أتمرّن.** `objectives`: « أقارن أعدادًا ناطقة وعبارات بإشارة الفرق، ومن الفرق وحده ». Exercises (own numbers, `source` = element):
- E1 (`act-5`): table of five pairs → differences: (4/5 ; 3/4) **1/20** · (5/6 ; 7/8) **−1/24** · (−7/4 ; 2/9) **−71/36** · (−2/9 ; −3/5) **17/45**
  · (−4/3 ; −3/8) **−23/24**; place each pair on a drawn line (`GeoFigure` axis), column « إشارة a − b », column « المقارنة ».
- E2 (`ex-27`): from the difference alone: a − b = 0,04 → a > b · a − b = −7/3 → a < b · b − a = 5 → a < b · b − a = −10⁻³ → a > b · a − b = 0 →
  a = b · a − b ≥ 2 → a > b.
- E3 (`ex-28`): x ; y = (15 ; 6), (−4 ; −10), (−13 ; 2), (5 ; −7): sign of x − y first by comparing, then **9, 6, −15, 12**.
- E4 (`ex-30`, `now-61` ②): 6/11 ; 7/13 → **1/143** · −9/10 ; −8/9 → **−1/90** · 13/15 ; −1/6 → **31/30** · 5/6 ; 7/9 → **1/18**.
- E5 (`ex-29`, `ex-31`): with a calculator: 47,3/6,98 ≈ 6,7765 and 20,85/3,08 ≈ 6,7695: difference **755/107492 ≈ 0,0070** > 0 → the first
  is bigger; « Which display is enough: the two quotients or the difference? ».
- E6 (`self-9`, `self-10`): a = π/4, b = π/5 → a − b = **π/20** > 0 ; 5/17 and 0,88/3 → difference **1/1275** > 0 → 5/17 > 0,88/3.
- E7 (`ex-32`): A = 6x − 5, B = 5x + 1: values at 0, 6, 8 → (−5 ; 1), (31 ; 31), (43 ; 41); A − B = **x − 6** → A > B for x > 6.
- E8 (`deep-38`, own pair): a rectangle of sides (x + 5) and (x + 1), a square of side (x + 3), x > 0: perimeters **4x + 12** and
  **4x + 12** (difference 0: always equal); areas **x² + 6x + 5** and **x² + 6x + 9**, difference **−4** (expansion = published tool): the
  square always has 4 more. « سلمى: لهما المحيط نفسه دائمًا — أمين: لهما المساحة نفسها دائمًا. من على حق؟ ». `GeoFigure` data.

**Modules 5–7 — مسائل.**
1. **مسألة الدرس — مسابقة القسمين** (`lessonProblem`, module 5): « في مسابقة الرياضيات أجاب 25 تلميذًا من 31 في القسم الأول إجابة صحيحة، و 29
   من 36 في القسم الثاني. » Q1 اكتب النسبتين → 25/31, 29/36 ; Q2 احسب الفرق → **1/1116** (25 × 36 = 900, 29 × 31 = 899) ; Q3 أيّ القسمين أحسن
   نتيجة؟ → **القسم الأول** ; Q4 « قالت المعلّمة إنّ الفرق صغير جدًّا: هل كان النظر إلى الكسرين يكفي؟ » (selfCheck). Value: fair judging.
2. **حافلة الرحلة** (module 6): « حافلة A: 1500 دج ثابتة و 41 دج للكيلومتر؛ حافلة B: 1200 دج و 42 دج للكيلومتر. » Q1 the prices for x km:
   $A=1500+41x$, $B=1200+42x$ ; Q2 simplify $A-B$ → **300 − x** ; Q3 for a 220 km trip: A = **10 520**, B = **10 440** → B cheaper by **80 دج** ;
   Q4 from which distance is A cheaper? → **x > 300** (300 − x < 0) ; at 300 km both **13 800**.
3. **قنّينتا العصير** (module 7): « قنّينة 1,5 L بـ 97,50 دج وقنّينة 2,25 L بـ 146,40 دج. » Q1 price per litre → **65** and **65,0666…** (976/15) ;
   Q2 difference → **−1/15** dinar per litre ; Q3 which is cheaper per litre → **the small bottle** ; Q4 « is the difference worth it for 9 L? »
   → 9 × 1/15 = **0,60 دج** (selfCheck decision). Value: careful spending.

**Module 8 — إختبار أولي** (literal epreuves, `FINAL` data; cite `self-9`, `self-10`):
1. « $a-b=-0{,}2$ إذن »: **$a<b$** ✓ · $a>b$ (« 0,2 موجب », MISC-MUQ-ABS-DIFF) · « لا نستطيع الحكم دون a و b » (MISC-MUQ-NEED-VALUES) · $a=b$.
2. مقارنة $\frac56$ و $\frac79$: **$\frac56-\frac79=\frac1{18}>0$ إذن $\frac56>\frac79$** ✓ · « $\frac56-\frac79=\frac{-2}{-3}$ » (numerators and
   denominators subtracted, MISC-MUQ-SUB-TERMS) · « $\frac56<\frac79$ لأنّ $5<7$ » (MISC-MUQ-NUMERATOR) · « $\frac1{18}>0$ إذن $\frac56<\frac79$ »
   (sign read backwards, MISC-MUQ-ORDER-SUB).
3. مقارنة $-\frac34$ و $-\frac57$: **$-\frac34<-\frac57$ لأنّ الفرق $-\frac1{28}$** ✓ · « $-\frac34>-\frac57$ لأنّ $\frac34>\frac57$ »
   (MISC-MUQ-ABS) · « متساويان » · « $-\frac34>-\frac57$ لأنّ الفرق $\frac1{28}$ » (sign error).
4. $A=2x+7$ و $B=x+10$ ، من أجل $x>3$: **$A>B$ لأنّ $A-B=x-3>0$** ✓ · « $A<B$ » (MISC-MUQ-ORDER-SUB) · « $A-B=3x+17$ » (B added,
   MISC-MUQ-BRACKET) · « $A=B$ لكل x » .
5. « $b-a>0$ » معناه: **$a<b$** ✓ · $a>b$ (MISC-MUQ-ORDER-SUB) · $a=b$ · « a و b موجبان ».

## 8. Misconceptions (`MISC-MUQ-*`)

| id | wrong belief | lab | caught by |
|---|---|---|---|
| `MISC-MUQ-ABS` | of two negatives, the farther from 0 is bigger | `d2` (needle left) | final 3, E1, L1 |
| `MISC-MUQ-ORDER-SUB` | the sign of b − a read as the sign of a − b | the swap (`d2`) | final 2, 4, 5; معارف q2 |
| `MISC-MUQ-NUMERATOR` | bigger numerator (or denominator) ⇒ bigger fraction | `d3`, `d4` | final 2, L1 |
| `MISC-MUQ-SUB-TERMS` | a/b − c/d = (a − c)/(b − d) | the written difference refused (متقدم) | final 2, L2 |
| `MISC-MUQ-NEED-VALUES` | cannot order without knowing a and b | `d6` curtain | final 1, E2 |
| `MISC-MUQ-ABS-DIFF` | a − b = −0,2 read as « 0,2 so a > b » | `d6` | final 1 |
| `MISC-MUQ-COEF` | the bigger coefficient of x is always the bigger expression | `race` `e1` (x < 4) | E7, L3 |
| `MISC-MUQ-BRACKET` | A − B written without brackets (3x + 5 − 2x + 9) | `race` coefficient check refused | final 4, L3 |

## 9. Practice bank — `content/practice/3am/muqaranat-natiqayn/` (5 × 10)

**Corpus.** No exercise is tagged `3am.m5.r04` in `exams-index.json` (`coverageOwnGrade` = 0). Precise hits found by reading:
`3am-s3-47` ex 1 Q① (« إذا كان a = −3/2 و b = −4/3 فإنّ: a − b = 0 / a − b < 0 / a − b > 0 » — key **a − b = −1/6 < 0**; tagged `3am.m1.r05`
in the index), `3am-s2-80` ex 5 (Amine's and Khadija's parts S1 = 6x and S2 = 324 − 6x, x ≤ 18: test 6x < 324 − 6x at 18 and 30, « in which
case is Amine's part bigger? » — S2 − S1 = **324 − 12x**), `3am-s2-69` ex 2 (E = 5x(x − 4) − (x² − 4x − 16), F = (2x − 4)², M = E − F = **0** →
« ماذا تستنتج؟ » E = F). Fraction comparisons in S1 papers, by common denominators (unit 2's method — usable only as **modelled**
contexts, asking « بحساب الفرق »): `3am-s1-104` ex 2, `3am-s1-3` ex 4 (= `3am-s1-110` ex 4, cite ONE), `3am-s1-103` ex 5, `3am-s1-104` ex 5,
`3am-s1-108` ex 5. **Faithful `term_exam`: 3** (honest — the corpus barely asks this item).
- **L1** (10): order from a given difference; compute a − b of two fractions and conclude; positive vs negative. All `platform_addition`
  `term_exam_modelled` (`modelledOn: "3am-s3"` for the MCQ register of `3am-s3-47`), 1 `term_exam` (`3am-s3-47` ex 1).
- **L2** (10): compare with « علّل »; decimals by a calculator difference; π multiples; « صحيح أم خاطئ ». Modelled on `3am-s1-104` ex 2 (2 sheets),
  the rest platform additions.
- **L3** (10): complete exercises: two expressions, values at x, A − B simplified, comparison by regions (`ex-32` register); `3am-s2-69` ex 2
  (`term_exam`, the difference zero ⇒ equal; its expansion steps `counted: false`).
- **L4** (10): with another lesson of the same term (expansion `nashr`, powers of 10, Pythagoras): e.g. compare two areas in x after
  expanding (steps `counted: false`); compare 3,2 × 10⁻² and 31/1000 by difference.
- **L5** (10): « الوضعية الإدماجية (08 ن) »: shares of a field (`3am-s2-80` ex 5 as `term_exam`, plus 4 modelled on `3am-s1-104/108` ex 5 with
  the comparison asked by difference), tariffs, success rates, juice prices; a justified decision at the end.
- `answerType`: `choice` (distractors from §8, tagged), `rational` (differences), `selfCheck` (« علّل »). Each LP primary on ≥ 8 questions.
- **Oracle** `scripts/practice-oracle/muqaranat-natiqayn.mjs`: BigInt fractions of its own; every difference, sign and verdict recomputed;
  every « A > B for x > c » checked at 5 values on each side and by the simplified difference; imported into the oracle test.
- Wiring as the other banks (`active.json`, `exam-style.json`, `policy.json`, `misconceptions.json`, the practice index).

## 10. Risks & owner questions

- P3 scope (README question 3): differences only of the forms constant / x − c / c − x / known-sign product.
- Net links (README question 1): `3am.m1.r06`, `2am.m4.r02`, `3am.m5.r01` → `3am.m5.r04`.
- `deep-38`'s figure needs a 400 dpi re-read (tick marks); the lesson poses its own pair (E8) and cites the element.
- The meter could look like it « gives » the order: that is intended in module 1 (discovery of P1 on visible pairs), then the متقدم shutter
  makes the student WRITE the difference before reading the needle, and the method (module 3) and practice are pure computation.
- Decimal quotients (`ex-29`, `ex-31`): exact fractions in tests (no floating point); the student sees calculator-style decimals.

## 11. Generator checklist

- Core `orderSign.js` + test. Lab tests: `logic/differenceMeter.test.js` (both levels and `race` by `coachOf`; swap; shutter refusal; curtain;
  regions; reset), `operations/differenceMeter.render.test.jsx` (context then ONE question; no Latin; no `{{`; says each thing once); registry,
  `levels.js` (+ test; same `objective` both levels), contract section `§2…tricies` (next free), DNA §15 row, LAB_COACH_ROLLOUT row; label
  geometry tests (bead tags never overlap — the overlapping pair `d3` shows ONE merged tag « حبّتان متراكبتان »). Screenshots at the four
  sizes: initial, a plugged pair, the swap, the overlapping pair with the magnifier, the متقدم shutter refusal, the curtain, `race` with the
  needle crossing 0, the formal phase — reviewed and iterated.
- Lesson: `content.test.js` (BigInt fractions; every difference, verdict, final key and distractor; E1 axis `GeoFigure`; E8 figure measured),
  `problems.test.js`, `prepDiagnostic.test.js`, `validate:lessons`, `check:textbook` (all 13 elements cited), `audit:knowledge:gate`,
  `check:non-blocking`, `generate:lesson-index`.
- e2e `apps/web/e2e/lesson-kit/3am-ibarat-harfiya-3-muqaranat-natiqayn.mjs` + `lesson-route-boundary.mjs`. Port 5173 or 5174.
- Catalogue: `available`, `durationMinutes` ≈ 80, `difficulty: "متوسط"`, `icon: "⚖️"`, final `pointsToLearn`, `pointPrerequisites`;
  `generate:learning-net`; extraction elements verified with module numbers.
- Publish: coordinator, guide §11 (as in the qimat plan).

## 12. Generator notes (2026-10-26, Sonnet lead)

Minimal deviations from the plan, all recorded here:
- **`ex-30` d) is `−5/6` and `−7/8`** (both negative), re-read at 300 dpi: the extraction and §1 had « 5/6 ; −7/8 » (difference 41/24). The textbook's difference is `−5/6 − (−7/8) = 1/24`. `build-extraction.py` is fixed (`ex(30, …)`, the assertion and a `DISCREPANCIES` entry). The lesson's own E4 pairs (6/11 ; 7/13 …) are unaffected.
- **Extraction**: the 13 elements of the lesson (`act-5`, `know-5`, `method-5`, `now-61` ②, `ex-27`…`ex-32`, `self-9`, `self-10`, `deep-38`) are now `verified: True` (pp. 57, 60, 61, 64, 65 re-read at 130 dpi, `ex-30` at 300), every plan number recomputed with `Fraction` in the script, destinations moved to modules 2 / 3 / 4 (`DEST`). `deep-38`'s small equal-side marks stay unreadable at 130 dpi (the plan already posed its own pair, E8): recorded in `DISCREPANCIES`.
- **`d6`** (curtain) gets the hidden beads `a = 2/5`, `b = 7/10` (the plan gave only the card `a − b = −0,3`): the beads exist in the logic so the card is consistent with them, and the test asserts `a − b = −3/10`.
- **Overlapping beads (`d3`) and the hit areas**: the plan's « magnifier lamp » is a glass capsule with ONE HANDLE PER BEAD stacked vertically (a above b — no left/right information), because the second bead's hit circle covered the first (a student could not plug a probe on `a`). While the beads overlap the rail has no hit area; the drag drop picks the nearest handle or the upper / lower half of the cluster. The merged tag « حبّتان متراكبتان على السكّة » is 224 units wide.
- **Race x range**: integers 0 … 10 (`e3`: 0 … 8, so the beads stay on the 0 … 90 rail); the numeric question of module 3 (`e3` in x = 10 → −7) is calculated by hand, not read on the slider. Coefficient steppers open after two different values of x. « جرّب أعدادك » in `race` allows halves of x.
- **Modules**: as planned. `ex-29`, `ex-31` → E5 (with a decimal-quotient pair of own numbers 47,3/6,98 and 20,85/3,08: difference 755/107492 ≈ 0,0070), `self-9`, `self-10` → E6 (own numbers π/4, π/5 and 5/17 against 0,88/3), `ex-32` → E7 (6x − 5, 5x + 1: the plan's numbers), `deep-38` → E8 (rectangle (x + 5)(x + 1) against the square (x + 3)², with a `GeoFigure` measured at x = 2). Final test: P1 E1, E5 · P2 E2, E3 · P3 E4. Bricks: `ishara-farq`, `ibdal-mujassayn`, `farq-wahdahu` (module 1), `maana-farq`, `hisab-farq` (module 2), `farq-ibaratayn` (module 3).
- **`durationMinutes`** 64 (modules without the مسائل; 88 with them, cap 90), not the plan's « ≈ 80 »: the guide counts the lesson without its مسائل.
- **`pointPrerequisites`**: `P2 ← P1` and `P2 ← 3am_tasawi-muqaranat-kasrayn_P2` (the net edge `3am.m1.r05 → 3am.m5.r04`, `consolidates`); `P3 ← P1`. No edge toward `jam-tarh-kasrayn`, `muqarana-nisbiya` or `tabsit-hadhf-aqwas` (owner question 1 stays open); `P1` has none.
- **Bank** (by a helper from a written brief, oracle `scripts/practice-oracle/muqaranat-natiqayn.mjs`): 50 sheets, 230 questions; 9 `term_exam` (every sheet re-numbered), 34 `term_exam_modelled`, 7 `adapted`; the helper could NOT read `3am-s1-108` ex 5 and so does not cite it. The bank uses none of the lesson's own numbers (modules 4–8, problems, final test).
- **e2e** is named `3am-unit4-muqaranat-natiqayn.mjs` (as the qimat one) rather than the plan's `3am-ibarat-harfiya-3-…`; the route-boundary check is covered by `check:routes`.
