# Plan — `amaliyat-natiqa` « العمليات على الأعداد الناطقة » (3AM unit 2, lesson 5 of 5 + synthesis)

Read the unit [`README.md`](README.md) first. All four earlier lessons of the unit are published before this one, and so is unit 1.

## 1. Identity

- **Code** `amaliyat-natiqa` · **title** « العمليات على الأعداد الناطقة » · **unit** `kusur-natiqa` · catalogue order 8 · kind `lesson`.
- **Folder** `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/kusur-natiqa/amaliyat-natiqa/`.
- **Textbook pages** (book → pdf = book + 1):

  | Book p. (pdf) | Elements |
  |---|---|
  | 23 (24) | `prep` items 9 ((−7) + (−11) = −18), 10 ((−18) + 11 = −7), 11 ((−8) − (−12) = 4, read LTR) |
  | 25 (26) | `act-6` « العمليات على الأعداد الناطقة »: ① products (5/8 × 7/6, −5/8 × −7/6 vs (−5)(−7)/(8×6), 7/13 × −8/5, −6/5 × 15/−4, −12 × (−2/7)); ② sums (5/4 + −11/6 via the equal fractions, −4/9 + 5/6, 3/8 + −9/20); ③ quotients (2/7 ÷ 4/5, −7 ÷ 3/2, −2/9 ÷ 6, −2/9 ÷ −11/8) |
  | 28 (29) | `know-6`: + and − (same denominator, different denominators), × (signs), reciprocal of a rational (−3 → −1/3, 13/−7 → −7/13), ÷ |
  | 29 (30) | `method-7` (A = −5/7 + 3,2/4), `method-8` (B = −4,7/12 − 5,1/16, the smallest common multiple 48), `method-9` (D = 7/3 − 8/15 ÷ 11/20 — **book misprint**: 23/33, the right value is 15/11), `now-3` (A = (11/7 − 2/5) × 24/7, B = 11 ÷ (2/3 − 5/2), C = −3/14 − (3/7)/5 + 2, D = (3/2 − 1/3)/(3/4 + 2/3)) |
  | 30–32 (31–33) | `ex-3`, `ex-34`…`ex-54` |
  | 33 (34) | `self-5`, `self-6` |
  | 34–35 (35–36) | `deep-57`, `deep-58`, `deep-60`, `deep-63`, `deep-64`, `deep-66`, `deep-68`, `deep-73`, `deep-76`, `deep-77`, `deep-79` |

- **Seeds the unit: no.**

## 2. Programme & net

**Programme item:** `3am.m1.r08` « حساب مجموع وفرق وجداء وحاصل قسمة عددين ناطقين. »

**Draft الكفاءات (verbatim):**
1. « حساب مجموع وفرق عددين ناطقين بتوحيد المقامات »
2. « حساب جداء عددين ناطقين: $\frac{a}{b}\times\frac{c}{d}=\frac{a\times c}{b\times d}$ »
3. « حساب حاصل قسمة عددين ناطقين بالضرب في المقلوب »
4. « تنظيم سلسلة حسابات على الأعداد الناطقة باحترام أولوية العمليات »

**Proposed final wording (order kept):**

| LP | Final | Change |
|---|---|---|
| P1 | حساب مجموع وفرق عددين ناطقين بتوحيد المقامات مع تعيين إشارة الناتج (منها ناطق بسطه عشري) | Adds the sign (the new part relative to `jam-tarh`) and the decimal numerators of the book (method-7, 8). |
| P2 | حساب جداء عددين ناطقين: $\frac{a}{b}\times\frac{c}{d}=\frac{a\times c}{b\times d}$ مع تعيين الإشارة أوّلًا | sign first (the book's « (−5)×(−7) / (8×6) » contrast) |
| P3 | تعيين مقلوب عدد ناطق غير معدوم (مقلوب $-3$ هو $-\frac13$) وحساب حاصل قسمة عددين ناطقين بالضرب في مقلوب القاسم | Adds the reciprocal of a NEGATIVE rational: `know-6` puts it here; `maqlub` kept positive numbers (README boundary). |
| P4 | تنظيم سلسلة حسابات على الأعداد الناطقة باحترام أولوية العمليات والأقواس، ومنها الكتابات الكسرية المركّبة | Adds compound fractions (`now-3` D, `ex-48`…`ex-50`, `deep-64`). |

**Review items for « أستعدّ »** (`reviewLinksForLesson`):

| Item | Text | Home | Status at generation |
|---|---|---|---|
| `3am.m1.r01` | حساب جداء عددين نسبيين. | `jidaa-adadayn-nisbiyayn` (unit 1) | published (« تذكّر » with link) |
| `3am.m1.r04` | قسمة كسرين. | `maqlub-qismat-kasrayn` | published (link) |
| `3am.m1.r06` | جمع وطرح كسرين. | `jam-tarh-kasrayn` | published (link) |
| `3am.m1.r07` | التعرّف على العدد الناطق. | `adad-natiq` | published (link) |

Extra `priorKnowledge`: `jam-tarh-nisbiya-2am` (sums of relatives, the rewritten `prep` 9–11). Its 2AM home lesson `jam-tarh-nisbiya` is
coming_soon, so the reminder carries no link.

**noRebuild:** none from the net. Still, the lesson never re-teaches the common denominator, the reciprocal of a positive fraction or the
sign rules. It COMBINES them.

**pointPrerequisites** (net links r01, r04, r06, r07 → r08; all four homes published):
- P1 ← `3am_jam-tarh-kasrayn_P2`;
- P1 ← `3am_adad-natiq_P2`;
- P2 ← `3am_jidaa-adadayn-nisbiyayn_P4` (use the final LP of unit 1 that teaches « sign then product of distances » — check its
  catalogue);
- P3 ← `3am_maqlub-qismat-kasrayn_P3`;
- intra-lesson: P4 ← P1, P2, P3.

**Where it is used next:**
- **already published:**
  - `tabsit-hadhf-aqwas` (r08 → `3am.m5.r01`: it lists `amaliyat-natiqa` as an unpublished review link today; once this lesson is
    published, its « راجع » becomes a link);
  - `muadalat-darajat-ula`;
- **coming:**
  - `qimat-ibara-harfiya` (r08 → `3am.m5.r03`);
  - `muqaranat-natiqayn`;
  - unit 5;
- **4AM:**
  - `talis-hisab-atwal` (r08 → `4am.m2.r01`: lengths as rational chains);
  - affine functions (f(−2/3));
  - systems (unit 5 4AM);
  - roots;
  - every BEM « احسب واكتب على شكل كسر غير قابل للاختزال ».

## 3. Boundary

**Owns:**
- the four operations on two rationals (signed fractions, decimal numerators);
- the reciprocal of a negative rational;
- chains with priorities, brackets and compound fractions;
- evaluating a chain at given rational values of letters as a COMPUTATION (`deep-58`, `deep-76`: x = 3/4, y = −1/6);
- « show that this number is a natural / relative integer »;
- a missing term found by ONE inverse operation (6/8 + x = −5/7 → x = −5/7 − 6/8), as in 2AM.

**Leaves:**
- the logic of substitution (witnesses, counter-examples) → `qimat-ibara-harfiya`;
- comparing by the sign of a difference → `muqaranat-natiqayn` (`deep-68` « قارن A و B » is posed as « احسب A و B ثم رتّب » with the
  `adad-natiq` method);
- solving equations with transformation rules → unit 5 (`ex-40`, `ex-54` kept as one inverse operation);
- powers → unit 3.

## 4. Textbook analysis

| Element | What it asks | Idea to keep | Platform use |
|---|---|---|---|
| `act-6` | ① products incl. −5/8 × −7/6 vs (−5)(−7)/(8×6); ② a sum via equal fractions; ③ quotients | the rules extend; the sign first | **Not the entry.** It asks for rules by imitation, and nothing in it needs the sign to be decided before computing. It becomes the أتمرّن application (own numbers). |
| `know-6` | rules + examples (A = (−3,6 + 7,8)/3, B, C; ×: 7/5 × −2,9/6, 8 × −4/9; reciprocals; ÷: −8/5 ÷ (−9), 4/7 ÷ −5/8) | wording | معارف (own examples) |
| `method-7`, `method-8` | decimal numerators; the smallest common multiple 48 (not 192) | P1 with decimals | طريقة (own: −4/9 + 1,5/6; −2,5/14 − 3,1/21 → 42) |
| `method-9` | a chain with ÷ first; the book prints 23/33 (it used 5/3 for 7/3) | priority | طريقة (own chain E = 5/2 − 9/14 ÷ 3/7 = 1); the misprint is recorded |
| `now-3` | four chains, irreducible | P4 | أتمرّن item 6 (own) |
| `prep` 9–11 | sums of relatives | 2AM recall | « أستعدّ » (rewritten) |
| `ex-3` | table: x, reciprocal, opposite (−8, −5/9), and the trap 0,33 | reciprocal of negatives | bank (L1, adapted); the trap 0,33 becomes a distractor |
| `ex-34`…`ex-41` | sums, grouping terms, the calculator, find x, the pyramid | P1 practice | أتمرّن items 2, 3 + bank |
| `ex-42`…`ex-54` | products, quotients, the number grid, verify equalities, compound fractions, a and b, find x | P2–P4 | أتمرّن items 4–7, 9 + bank |
| `self-5`, `self-6` | 2,2/3 + (−5,3)/4 = −71/120; 2/3 − 2/3 × 5/7 = 4/21 | QCM | test register + bank |
| `deep-57`, `deep-64` | continued fractions (3 + 1/(7 + 1/15) ≈ π) | compound fractions | bank L3 (adapted; « تذكّرك بـ π » kept as a curiosity, no irrational content) |
| `deep-58`, `deep-76` | values of expressions at x, y, z | chains | مسألة 2 (redesigned) |
| `deep-60` | pick two numbers from a list with a given product / difference / sum / quotient | the inverse reading | أتمرّن item 7 |
| `deep-63` | order the numbers, their opposites, their reciprocals, the opposites of their reciprocals | the reciprocal of negatives | أتمرّن item 8 |
| `deep-66` | telescoping (1 − 1/2)(1 − 1/3)…(1 − 1/100) = 1/100 | structure | bank L3 |
| `deep-68` | compare A = (5 + x)/8 and B = 5/(x + 3) at four values | compute then order | bank L4 (as « احسب ثم رتّب ») |
| `deep-73`, `deep-77` | « B is a natural number » | prove by computing | مسألة 3 (redesigned) |
| `deep-79` | a calculation programme (× 2/3, − 5/8; which input gives 0) | an inverse question | مسألة 1 (redesigned) |

## 5. Design

**The lesson in one paragraph.** Nothing new has to be invented for rationals: the fraction rules (common denominator, numerators ×
numerators, × reciprocal) do the DISTANCE, and the relative-number rules do the SIGN. Deciding the sign FIRST makes every computation
safer:
- in −5/4 + 11/6, the two numbers pull in opposite directions, and 11/6 = 22/12 is farther from zero than 5/4 = 15/12, so the sum is
  positive: 22/12 − 15/12 = 7/12;
- in −9/8 ÷ (−3/4), two negatives give a positive quotient: 9/8 × 4/3 = 3/2;
- dividing by −3/4 multiplies by its reciprocal −4/3 (the reciprocal keeps the sign: (−3/4) × (−4/3) = 1).

In a chain, × and ÷ hold their neighbours tighter than + and −: 7/3 − 8/15 ÷ 11/20 starts with 8/15 ÷ 11/20 = 32/33, and the result is
77/33 − 32/33 = 15/11.

**Entry point — candidates compared:**
- (a) **The book's نشاط 6** (lists of operations to imitate): it never makes the student decide a sign before computing. Rejected as the
  entry; it becomes an application.
- (b) **A signed-movement world** (a lift, a diver): it gives sums meaning but makes products and quotients artificial, and it collides
  with unit 1's `elevator-reel` (a tower, signed time). Rejected.
- (c) **A merge board** (an arcade puzzle): the chain's numbers are TILES; merging two neighbours performs their operation. The hand
  must PREDICT the result's sign before each merge (a diagnostic instrument, DNA §16.3). For ÷ it must FLIP the divisor itself. The
  merge ORDER is physically constrained by magnets that bind × / ÷ (priority made tangible). Each tile shows a signed bar, so the sign
  of a sum is VISIBLE as the bar that remains when opposite bars overlap. **Chosen.**
  `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'arcade' }`.

**Order of ideas:**
1. a sum of two rationals: the sign from the bars, then the distance with a common denominator (P1);
2. a product: the sign by the count of negatives, then numerators × numerators (P2);
3. a quotient: flip the divisor (its sign stays), then multiply (P3);
4. a chain: magnets (priority) and bubbles (brackets) (P4);
5. معارف names the four rules with own examples, plus « تذكّر » boxes (links);
6. طريقة: decimal numerators, the smallest common multiple, a chain;
7. أتمرّن, three مسائل, the test.

**Contexts:**
- the school club's arcade puzzle (a game, kept honest);
- a calculation programme for the class quiz;
- values of expressions for the maths competition;
- « show that the result is an integer », as on the term exams.

## 6. Lab — `merge-board` « لوحة الدمج » (new type)

**Drawn world `arcade`** (new theme, kind `abstract`, shows « لوحة ألغاز في خزانة ألعاب بنادي المتوسطة: بلاطات أعداد ومغناطيس وفقاعات »):
- an arcade cabinet in the school club, with a glowing board;
- each NUMBER is a thick rounded tile showing its fraction (LTR KaTeX) and, under it, a signed BAR: its length ∝ the distance to zero
  (scale chosen per chain, clamped), blue to the right for « + » and red to the left for « − », always with the sign printed (never
  colour alone);
- operator chips (+ − × ÷) sit between the tiles;
- a pair linked by × or ÷ is held by a drawn MAGNET clip;
- a bracket is a translucent BUBBLE around its tiles;
- a fraction bar of a compound fraction is a long magnet rail with a bubble above and a bubble below;
- a score strip counts merges without a mistake (no stars for speed);
- KidFigure Ilyes (boy, hoodie) at the controls reacts.

**The variables in the hand:**
- (1) the predicted SIGN of the merge's result (two big pads « + » / « − » — the prediction is REQUIRED before the merge);
- (2) for ÷, which tile to FLIP (the divisor: a tap turns it over to its reciprocal, with its sign kept);
- (3) the ORDER of the merges (which neighbouring pair to merge next).

**Gesture:**
- **tap two neighbouring tiles** (or the operator chip between them) to select the pair, tap the sign pad, then the tiles slide together
  and MERGE into one tile;
- keyboard: ← → move between operator chips, Enter selects, « + » / « − » keys for the sign, F flips a selected divisor tile;
- reduced motion: no slide, an instant swap.

**What the world shows:**
- for + / −, the two bars are laid end to end on a mini-line under the pair before the merge. Same colours extend; opposite colours
  OVERLAP and the shorter part vanishes. The remaining bar IS the result's sign and distance — seen, not stated;
- the common denominator of the merge is written in the merged tile's trail (« $-\frac{15}{12}+\frac{22}{12}$ ») — chosen automatically
  as the SMALLEST common multiple (jam-tarh's skill, used);
- for ×, the bar's length scales and each red factor flips the colour once (two reds → blue);
- for ÷, the divisor must be flipped first, then it becomes ×;
- a wrong sign prediction is REFUSED: the pair wobbles, the bars show why (« الشريط الأحمر أطول: $\frac{15}{12}>\frac{22}{12}$ ؟ لا — الأزرق
  أطول »), and the student predicts again;
- trying to merge across a magnet (7/3 − 8/15 when 8/15 is clipped to ÷ 11/20) is REFUSED: the magnet holds, the tile shakes, and the
  banner says « $\frac{8}{15}$ مشدودة بالمغناطيس إلى $\div\frac{11}{20}$ »;
- trying to flip the dividend instead of the divisor is REFUSED;
- the chain ends with one tile, its standard form (positive denominator, reduced), and a stamp.

**Opening (no title):**
- Context: « على لوحة إلياس بلاطتان: $-\frac54$ و $\frac{11}{6}$ ، بينهما إشارة $+$ ، وتحت كل بلاطة شريط يدلّ على إشارتها وبعدها عن الصفر. »
- Question: « ادمج البلاطات حتى تبقى بلاطة واحدة، وتوقّع قبل كل دمج إشارة الناتج. »
- `lead`: « لا يتمّ الدمج إلا بعد توقّع الإشارة. »

**Levels** (same `objective` on both):

*مبتدئ* (bars visible, magnets visible):

| id | Chain | Merges and end state |
|---|---|---|
| `c1` | $-\frac54+\frac{11}6$ | sign + → $-\frac{15}{12}+\frac{22}{12}=$ **$\frac7{12}$** |
| `c2` | $\frac7{13}\times\left(-\frac85\right)$ | sign − → **$-\frac{56}{65}$** |
| `c3` | $-\frac98\div\left(-\frac34\right)$ | flip → $-\frac43$; sign + → **$\frac32$** |
| `c4` | $\frac73-\frac8{15}\div\frac{11}{20}$ | the magnet forces ÷ first: $\frac8{15}\times\frac{20}{11}=\frac{32}{33}$ (+), then $\frac{77}{33}-\frac{32}{33}=$ **$\frac{15}{11}$** (+) |

*متقدم* (bars HIDDEN until the merge, magnets drawn faintly, a three-strike limit per chain before the bars come back):

| id | Chain | End state |
|---|---|---|
| `a1` | $\left(\frac23-\frac52\right)\times\frac{-6}{11}$ | bubble: $-\frac{11}6$; × → **$1$** |
| `a2` | $-\frac34+\frac56\times\left(-\frac9{10}\right)$ | × first: $-\frac34$; then **$-\frac32$** |
| `a3` | $\dfrac{\frac12-\frac43}{\frac56+\frac{-3}4}$ | top $-\frac56$, bottom $\frac1{12}$, ÷ → **$-10$** |
| `a4` | $\frac45-\frac35\div\left(-\frac9{10}\right)+(-2)$ | ÷: $-\frac23$; $\frac45-\left(-\frac23\right)=\frac{22}{15}$; $+(-2)$ → **$-\frac8{15}$** |

**« جرّب أعدادك » (always open):**
- type a chain: up to 4 numbers (fractions with |numerator|, denominator ≤ 20, a decimal numerator allowed), operators + − × ÷, one pair
  of brackets;
- the board builds it (magnets and bubbles placed by `parseChain`);
- a division by 0 is refused when that merge happens (« لا مقلوب للعدد 0 »);
- free trials never count.

**LabCoach:**
1. `pair`: « انقر بلاطتين متجاورتين لتختارهما. »
2. `sign`: « قبل الدمج: اضغط إشارة الناتج التي تتوقّعها. »
3. `flip` (first ÷): « في القسمة اقلب البلاطة التي نقسم عليها أوّلًا. »
4. `magnet` (first magnet refusal): « المغناطيس يشدّ بلاطتين: ادمجهما قبل غيرهما. »
5. `bubble`: « ما داخل الفقاعة يُدمج أوّلًا. »
6. `free`: « اكتب سلسلتك في « جرّب أعدادك ». »

**Wrong moves made VISIBLE:**
- the sum's sign taken from the first term, or « − + + = − always » → the remaining bar;
- the sum's sign from the larger NUMERATOR (11 > 5 but compared at the same denominator) → bars;
- the product's sign wrong → the colour flips;
- dividing without flipping, or flipping the dividend → refused;
- « the reciprocal of −3/4 is 4/3 » (the sign dropped) → the flipped tile keeps its red bar, and the product check (−3/4) × (4/3) = −1 ≠ 1
  is shown on request;
- left-to-right in a chain → the magnet.

**Discovery** (after c1–c3):
- Question: « كيف تعرف إشارة الناتج قبل أن تحسب؟ »
- Right: « في الجمع: إشارة العدد الأبعد عن الصفر؛ في الضرب والقسمة: موجبة إذا تشابهت الإشارتان وسالبة إذا اختلفتا ».
- Wrong:
  - « دائمًا إشارة العدد الأول » (refuted by c1: −5/4 first, result +);
  - « سالبة متى وُجدت إشارة − » (refuted by c3).

The formal phase names the four rules.

**Core maths:**
- `fractions3.js` (L5 row): `parseChain`, `mergeable`, `merge`, `resultSign`, `evaluateChain`;
- lab logic `logic/mergeBoard.js`: `select(state, i)`, `predict(state, sign)`, `flip(state, tileId)`, `doMerge(state)` →
  `{ ok, reason?: 'sign' | 'magnet' | 'bubble' | 'flip' | 'zero' }`, `coachOf`, `report` events:
  - `{ kind: 'merge', chain, op, left, right, result, predicted, ok }`;
  - `{ kind: 'refused', chain, reason, … }`;
  - `{ kind: 'flip', chain, tile, ok }`;
  - `{ kind: 'custom' }`;
  - `{ kind: 'solved', chain, result }`.

**Why not another lab (DNA §12):**
- `like-terms` (3AM unit 4): carry term bundles into SHAPE trays; brackets are crates emptied « as is / sign changed ».
- `term-ferry` (unit 5): carry a term across the equals sign.
- `equality-lanes`: the number c of an operation and who receives it.
- Here the tiles never leave their row: two NEIGHBOURS merge. The new variables are the predicted SIGN (refuted by the overlap of signed
  bars), the FLIP of the divisor, and the ORDER (constrained by magnets).
- No sorting by kind, no crossing, no balance. Unit-1 `robot-track` reorders factor cards of a product (commutativity). Here the order is
  imposed by priority, not chosen freely.

**Screen budget:**
- 1024×768 with the sidebar: a chain of ≤ 4 tiles + 3 chips in one row (tiles ≈ 84 px wide, chips 40 px → ≈ 456 px). The compound
  fraction (a3) stacks two bubbles vertically.
- The mini-line of bars under the pair ≈ 60 px tall; the sign pads (« + » / « − ») are big (≥ 64 px) under the board.
- « جرّب أعدادك » is one input row, always open.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق من قواعد الإشارات والعمليات على الكسور والعدد الناطق »:

| # | Statement | Key | Item |
|---|---|---|---|
| 1 | $(-3)\times(-7)=21$ | ✓ | 3am.m1.r01 |
| 2 | $(-2)\times5\times(-1)\times(-3)=-30$ | ✓ (three negatives) | 3am.m1.r01 |
| 3 | $\frac56\div\frac23=\frac54$ | ✓ (5/6 × 3/2 = 15/12) | 3am.m1.r04 |
| 4 | $\frac34+\frac16=\frac4{10}$ | ✗ (11/12) | 3am.m1.r06 |
| 5 | $\frac6{-8}=-\frac34$ | ✓ | 3am.m1.r07 |
| 6 | rewritten `prep` 9: $(-9)+(-6)=-15$ | ✓ | 2AM sums (extra) |
| 7 | rewritten `prep` 10: $13+(-20)=-7$ | ✓ | 2AM sums (extra) |
| 8 | rewritten `prep` 11: $(-15)-(-9)=-6$ | ✓ | 2AM sums (extra) |

**M1 نشاط — « لوحة الدمج »** — `objectives`: « أكتشف كيف أحسب بالأعداد الناطقة: الإشارة أوّلًا ثم الكسر ». Lab on top; then:
1. Evidence (c1). Q: « قبل دمج $-\frac54$ و $\frac{11}6$ ، أيّ الشريطين بقي؟ لماذا؟ » (choice) → « الأزرق: $\frac{11}6=\frac{22}{12}$ أبعد عن
   الصفر من $\frac54=\frac{15}{12}$ ». Then « ما الناتج؟ » → 7/12. « أتوقّع القاعدة », then brick `jam-natiqa`.
2. Q (c2, c3): « لماذا كان ناتج $-\frac98\div\left(-\frac34\right)$ موجبًا؟ » → two negatives. « ما مقلوب $-\frac34$ ؟ » → $-\frac43$ (the sign
   is kept: the product is 1). Bricks `jida-natiqa`, `qisma-natiqa`.
3. Q (c4): « لماذا لم تستطع دمج $\frac73$ و $\frac8{15}$ أوّلًا؟ » (choice) → « لأنّ القسمة تُنجز قبل الطرح ». Then « ما الناتج؟ » → 15/11.
   Brick `awlawiya`.

**M2 معارف** — `objectives`: « أسمّي قواعد العمليات الأربع على الأعداد الناطقة ».
- Opens on the lab ALONE (`levels={false}`, world `signs`): six quick merges where only the SIGN is asked (the board shows bars only
  after the prediction):
  - $-\frac23+\frac14$ (−);
  - $\frac35\times\left(-\frac{10}9\right)$ (−);
  - $-\frac47\div\left(-\frac2{21}\right)$ (+);
  - $-\frac12-\frac13$ (−);
  - $\frac56-\frac78$ (−);
  - $(-6)\times\left(-\frac{5}{12}\right)$ (+).

  End state: six correct predictions in a row (refusals restart the streak, never block).
- Then the boxes, own examples:
  - $\frac{-2{,}4}5+\frac{6{,}9}5=\frac{4{,}5}5=\frac9{10}$ ; $-\frac58-\left(-\frac{13}8\right)=1$ ; $\frac56+\left(-\frac74\right)=-\frac{11}{12}$;
  - $\frac94\times\frac{-1{,}6}3=-\frac65$;
  - reciprocal of $-5$ is $-\frac15$, of $-\frac8{11}$ is $-\frac{11}8$;
  - $-\frac67\div(-3)=\frac27$ ; $\frac59\div\left(-\frac{10}3\right)=-\frac16$.
- « تذكّر » boxes with links: `jidaa-adadayn-nisbiyayn`, `maqlub-qismat-kasrayn`, `jam-tarh-kasrayn`, `adad-natiq`.

**M3 طريقة** — `objectives`: « أحسب بكسور بسطها عشري وأنظّم سلسلة حسابات ». Steps:
1. $-\frac49+\frac{1{,}5}6$: the smallest common multiple 18 → $-\frac8{18}+\frac{4{,}5}{18}=\frac{-3{,}5}{18}=-\frac{35}{180}=$ **$-\frac7{36}$**.
2. $-\frac{2{,}5}{14}-\frac{3{,}1}{21}$: multiples of 21: 21, 42 ✓ → $-\frac{7{,}5}{42}-\frac{6{,}2}{42}=-\frac{13{,}7}{42}=$ **$-\frac{137}{420}$**.
   Q « لماذا لا نأخذ $14\times21=294$ ؟ » → 42 is smaller.
3. $E=\frac52-\frac9{14}\div\frac37=\frac52-\frac9{14}\times\frac73=\frac52-\frac32=$ **$1$**.
   Q « أيّ عملية أوّلًا؟ » → ÷.

Method box: « في سلسلة: الأقواس، ثم الضرب والقسمة، ثم الجمع والطرح؛ وفي كل عملية: الإشارة أوّلًا ».

**M4 أتمرّن** — `objectives`: « أتدرّب على العمليات الأربع وسلاسل الحساب »:

| # | Statement | Answers | cites |
|---|---|---|---|
| 1 | جداءات: $\frac34\times\frac59$ ، $\left(-\frac34\right)\times\left(-\frac59\right)$ ، $\frac4{11}\times\left(-\frac72\right)$ ، $\frac{-9}{10}\times\frac{25}{-6}$ ، $-15\times\left(-\frac25\right)$ ؛ مجاميع: $\frac76+\left(-\frac{13}8\right)$ ، $-\frac5{12}+\frac34$ ، $\frac56+\left(-\frac7{10}\right)$ ؛ قسمة: $\frac38\div\frac94$ ، $-5\div\frac{10}3$ ، $-\frac47\div8$ ، $-\frac3{10}\div\left(-\frac95\right)$ | 5/12 · 5/12 · −14/11 · 15/4 · 6 · −11/24 · 1/3 · 2/15 · 1/6 · −3/2 · −1/14 · 1/6 | `act-6` |
| 2 | $-\frac34-\frac56$ ، $\frac29+\left(-\frac79\right)$ ، $\frac{-11}6+\frac4{-9}$ ، $1-\frac74$ | −19/12 · −5/9 · −41/18 · −3/4 | `ex-34`, `ex-35`, `ex-36` |
| 3 | احسب بتجميع الحدود: $x=\frac34-\frac25+\frac14-\frac35+\frac57-\frac27$ | 3/7 | `ex-37` |
| 4 | $\frac{-6}7\times\frac{14}{-9}$ ، $\frac{0{,}6}{-4}\times\frac{10}9$ ، $-\frac8{15}\div\left(-\frac45\right)$ ، $\frac{2{,}4}5\div(-0{,}8)$ | 4/3 · −1/6 · 2/3 · −3/5 | `ex-42`, `ex-43`, `ex-44` |
| 5 | $\dfrac{\frac23-\frac12}{\frac14+\frac16}$ ؛ $1+\dfrac1{1+\frac12}$ | 2/5 · 5/3 | `ex-48`, `ex-50`, `deep-64` |
| 6 | $a=-\frac3{10}$ و $b=\frac4{-15}$: احسب $a-b$ ، $a+b$ ، $a\times b$ ، $a\div b$ ، $b\div a$ | −1/30 · −17/30 · 2/25 · 9/8 · 8/9 | `ex-53`, `now-3` |
| 7 | من بين $-\frac23$ ، $\frac34$ ، $-\frac56$ ، $\frac12$ ، $\frac43$ ، جد عددين: جداؤهما $-\frac12$ ؛ فرقهما $\frac{19}{12}$ ؛ مجموعهما $-\frac13$ ؛ حاصل قسمتهما $-2$ | (−2/3, 3/4) · 3/4 − (−5/6) · −5/6 + 1/2 · 4/3 ÷ (−2/3) | `deep-60` |
| 8 | رتّب $\frac52$ ، $-\frac43$ ، $-1$ ، $\frac35$ ، $-\frac27$ ثم رتّب مقلوباتها | −4/3 < −1 < −2/7 < 3/5 < 5/2 · −7/2 < −1 < −3/4 < 2/5 < 5/3 | `deep-63` |
| 9 | جد $x$ بعملية عكسية واحدة: $-\frac23\times x=-\frac89$ ؛ $x\div\frac34=-\frac25$ ؛ $-\frac52=\frac{10}7\div x$ | 4/3 · −3/10 · −4/7 | `ex-54`, `ex-40` |

**M5 مسألة 1 (`lessonProblem`)** — « برنامج حساب » (redesign of `deep-79`):
- Statement: « في مسابقة القسم: اختر عددًا، اضربه في $-\frac23$ ، ثم أضف $\frac56$ . »
- Questions and answers:
  1. « ما النتيجة إذا اخترت $\frac34$ ؟ » → 1/3;
  2. « وإذا اخترت $-\frac54$ ؟ » → 5/3;
  3. « أيّ عدد نختار لتكون النتيجة $0$ ؟ » → 5/4 (−2/3 × x = −5/6, found by one inverse operation).
- Illustration `tags`.

**M6 مسألة 2** — « قيم العبارات » (redesign of `deep-76`):
- Statement: « $x=-\frac23$ ، $y=\frac34$ ، $z=-\frac16$ . »
- Questions and answers:
  1. « احسب $A=x+2y-z$ » → 1;
  2. « $B=(x+y)\div z$ » → −1/2;
  3. « $C=x\times y-z$ » → −1/3, each in irreducible form.

**M7 مسألة 3** — « عدد صحيح؟ » (redesign of `deep-73` / `deep-77`, modelled on the corpus `3am-s1-109` ex 2):
- Statement: « $D=\left(\frac56-\frac34\right)\div\left(-\frac1{24}\right)$ و $E=\left(-\frac7{10}+\frac15\right)\times(-8)$ . »
- Questions and answers:
  1. « بيّن أنّ $D$ عدد صحيح نسبي » → −2;
  2. « بيّن أنّ $E$ عدد طبيعي » → 4;
  3. « احسب $D\times E$ » → −8.
- If the owner accepts the ICT page proposal (README owner question 3), a calculator check step goes here.

**M8 إختبار أولي:**

| # | Prompt | Key | Distractors |
|---|---|---|---|
| 1 | $-\frac23+\frac14$ | $-\frac5{12}$ | $\frac5{12}$ (MISC-AMAL-SUMSIGN) · $-\frac17$ (MISC-AMAL-ACROSS) · $-\frac{11}{12}$ (MISC-AMAL-ADDDIST) |
| 2 | $\left(-\frac35\right)\times\left(-\frac{10}9\right)$ | $\frac23$ | $-\frac23$ (MISC-AMAL-PRODSIGN) · $\frac32$ · $-\frac{30}{14}$ |
| 3 | $\frac47\div\left(-\frac2{21}\right)$ | $-6$ | $6$ (PRODSIGN) · $-\frac8{147}$ (MISC-AMAL-NOFLIP) · $-\frac16$ (MISC-AMAL-FLIPFIRST) |
| 4 | $\frac12-\frac34\times\frac23$ | $0$ | $-\frac16$ (MISC-AMAL-PRIORITY: left to right) · $1$ · $-\frac12$ |
| 5 | $\dfrac{\frac23-1}{\frac13}$ | $-1$ | $-\frac19$ (NOFLIP) · $1$ (SUMSIGN) · $\frac13$ |

## 8. Misconceptions (`MISC-AMAL-*`)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `SUMSIGN` | a sum takes the sign of the first term (or is always negative when a − appears) | the remaining bar | tests 1, 5; L1–L3 |
| `ADDDIST` | add the distances whatever the signs | the overlap | test 1 |
| `ACROSS` | add numerators and denominators | — | test 1 |
| `PRODSIGN` | wrong product / quotient sign | the colour flip | tests 2, 3 |
| `NOFLIP` | divide without the reciprocal | flip refused | tests 3, 5 |
| `FLIPFIRST` | flip the dividend | flip refused | test 3 |
| `RECIPSIGN` | the reciprocal of −a/b is b/a | the flipped tile stays red; (−3/4)(4/3) = −1 | L1, L2 |
| `PRIORITY` | compute left to right | the magnet | test 4; L3 |
| `DECNUM` | a decimal numerator is « not allowed » / is dropped | M3 | L2 |

## 9. Practice bank (`content/practice/3am/amaliyat-natiqa/`)

**Corpus:** `3am.m1.r08` has 15 usable exercises, all term 1 except `3am-s2-69` / `3am-s2-72` / `3am-s2-75` (term 2):
- `3am-s1-1` ex 2;
- `3am-s1-2` ex 4 / ex 7 (booklet);
- `3am-s1-4` ex 1 (compute + sign of a product without computing);
- `3am-s1-5` ex 1 and ex 2 (area of a rectangle with fraction sides, rounded to the unit);
- `3am-s1-103` ex 2 (N, M, Q irreducible);
- `3am-s1-104` ex 2 (F, E, D = −4, K; compare K and E);
- `3am-s1-108` ex 2; `3am-s1-109` ex 2 (« show that … is natural »); `3am-s1-110` ex 2;
- `3am-s2-72` ex 1, `3am-s2-75` ex 1 (with powers / scientific notation: those steps are unit 3, published `quwat-adad-nisbi` → counted
  if the item is that lesson's, otherwise `counted: false`);
- misfiled `1am-s1-100` ex 2.

`3am-s2-78` is unreadable: excluded.

**Honest count of FAITHFUL `term_exam`: 13–16.** The compute exercises match this lesson almost step for step.

| Level | Content | Provenance |
|---|---|---|
| L1 | one operation on two rationals, irreducible result; the reciprocal of a negative | 3 term_exam (single items of `3am-s1-103` ex 2, `3am-s1-110` ex 2, `3am-s1-108` ex 2) · 4 modelled · 3 adapted (`ex-3`, `self-5`, `ex-43`) |
| L2 | compute then « برّر » (the sign without computing, `3am-s1-4` ex 1; « is the result an integer? ») | 3 term_exam (`3am-s1-4` ex 1, `3am-s1-109` ex 2, `3am-s1-104` ex 2 ②) · 5 modelled · 2 adapted (`self-6`, `ex-47`) |
| L3 | a full compute exercise: A, B, C, D chains, compound fractions, irreducible form | 5 term_exam (`3am-s1-1` ex 2, `3am-s1-2` ex 4, `3am-s1-104` ex 2, `3am-s1-110` ex 2, `1am-s1-100` ex 2) · 3 modelled · 2 adapted (`deep-66`, `deep-57`) |
| L4 | mobilises unit 1 / unit 3 (term 2 papers): chains with powers of a relative number (`quwat-adad-nisbi`, published), products of several relatives | 3 term_exam (`3am-s2-69` ex 1, `3am-s2-72` ex 1, `3am-s2-75` ex 1; badge « … الفصل الثاني ») · 7 modelled |
| L5 | « الوضعية الإدماجية »: a rectangle with fraction sides (area, perimeter, a decision with a rounding: `3am-s1-5` ex 2 register), a calculation programme, values at x, y, z | 1–2 term_exam (`3am-s1-5` ex 2) · 8 modelled (`deep-79` adapted once) |

**Answer types:**
- `rational` with `requiredForm: 'irreducible'`;
- `choice` (signs, which operation first);
- `selfCheck` (« بيّن أنّ … عدد طبيعي »).

**Oracle:** `scripts/practice-oracle/amaliyat-natiqa.mjs`. It has its own chain evaluator over BigInt rationals (`helpers.mjs`), never
`packages/core`. It recomputes every key, checks each distractor false, checks each « integer » claim, and checks priorities by evaluating
the literal statement string.

## 10. Risks & owner questions

1. **`method-9` misprint** (23/33 → 15/11): recorded in the extraction. The lesson never shows the book's chain.
2. **The ICT page** (README owner question 3): if a calculator activity is generated, it goes to مسألة 3 here.
3. **Automatic common denominator in the lab.** The board picks the smallest common multiple itself, because `jam-tarh` owns choosing it.
   If the owner wants the student to pick it again here, add a multiples wheel to ± merges (costs screen space at 1024×768).
4. **`deep-68` (compare A and B)** is reframed as « compute then order », to stay clear of `muqaranat-natiqayn`'s difference method.
5. **Unit-1 LP for P2's edge**: use whichever final LP of `jidaa-adadayn-nisbiyayn` teaches « sign then product of distances » (its
   draft P4).

## 11. Generator checklist

- [ ] `build-extraction.py`: re-read L5's elements (pp. 23, 25, 28, 29, 30–35), `verified: True`, `Fraction` asserts (the misprint as a
  discrepancy), module numbers; rebuild.
- [ ] `fractions3.js`: L5 functions + tests (`parseChain` on every chain of the plan, priorities, compound fractions).
- [ ] Lab `merge-board`:
  - type, theme `arcade`, registry, `levels.js`, strings `lesson.manipulation.json › mergeBoard`;
  - `logic/mergeBoard.js` + test: each chain solved via `coachOf`; every refusal reason; the bars' overlap; the advanced strike limit;
  - render test;
  - contract section + DNA row;
  - screenshots (initial, a sign refusal with overlapping bars, a magnet refusal, the flip, a compound fraction, the formal phase) at the
    five sizes — reviewed.
- [ ] Lesson:
  - 9 modules, header, knowledge map;
  - four « تذكّر » boxes with links;
  - « أستعدّ » measures r01, r04, r06, r07;
  - `pointPrerequisites` cross-lesson edges as in §2;
  - `content.test.js` (own BigInt chain evaluator; FINAL literals).
- [ ] After publishing: `tabsit-hadhf-aqwas`'s « راجع » toward `amaliyat-natiqa` becomes a link. Check `learningNet.test.js` fixtures
  that assert its status (`planned` → `available`).
- [ ] `generate:lesson-index`, `generate:learning-net`; e2e `3am-kusur-natiqa-amaliyat.mjs` + coach / retrofit blocks.
- [ ] Gates: `npm test`, `validate:lessons`, `check:textbook`, `check:lessons`, `build`.
- [ ] Bank (50) + oracle + JSON entries.
- [ ] Publish (guide §11, coordinator).

## 12. Generator notes (2026-10-26)

Generated from this plan. Fixes and decisions, none a redesign:
1. **`ex-48` … `ex-52` were not transcribed** (the extraction named only the variables). Re-read at 150 dpi: a = (8/11)/3, b = (6/7)/9, c = (−5/3)/(10/9), d = (−25/21)/(5/−7) (= 8/33, 2/21, −3/2, 5/3); e, f, g, h; x, y, z with z = (5/9 − 11 × 3/44)/(5/9 + 2/3 × 7/4) = **−7/62** (not −7/72); K = 7/5 ÷ (7/18 − 2/9) = 42/5, L = 42/145; M = −37/990, N = −1/10. Recorded in `build-extraction.py` (asserted with `Fraction`) and in `discrepancies`; the bank and the lesson use their own numbers.
2. **The theme `arcade` is `kind: 'objects'`**, not `abstract` (the registry has no `abstract` kind: `lengths` · `objects` · `people` · `tiles`).
3. **The ICT page (book p. 37, missing from the scan) is generated** (README default): part 4 of مسألة 3 — « التحقّق بالحاسبة » — asks which key sequence gives D (brackets decide) and what the calculator's `0,0833333333` for 5/6 − 3/4 means (an approximation of the non-decimal 1/12; the exact answer is the fraction). Declared `addition('ict_replacement')`; the element `ict` and the textbook calculator exercises `ex-39` and `ex-45` are cited by `masala-3`'s `sourceElementIds`.
4. **Pad « 0 ».** The plan has two pads (« + » / « − »). A free chain can produce a zero sum (1/2 − 1/2), so a third pad « معدوم » exists in « جرّب أعدادك » ONLY; guided chains never have a zero result.
5. **Refusals are decided at two moments.** A pair separated by a bubble, a magnet or the left-to-right order is refused when the pair is SELECTED (the tile shakes, the banner says why); `noflip` (÷ without a flipped divisor) and `sign` are decided by the pad press. The chain reads LEFT TO RIGHT (`dir="ltr"` on the board) inside the RTL page.
6. **Order rule of the board.** A × ÷ link is refused (`order`) when the previous link is also × ÷ (in a ÷ b × c the product b × c is never done first); a + − link is refused (`magnet`) next to a × ÷ link, and (`order`) when the previous link is + −. This makes every legal order give the SAME value (tested: the canonical `nextLink` solves every preset).
7. **`signs` world.** The pair is pre-selected and a division needs no flip (only the sign is asked); a wrong prediction restarts the streak at the first chain (never blocks).
8. **M2 shows four « تذكّر » boxes with links** (`jidaa-adadayn-nisbiyayn`, `maqlub-qismat-kasrayn`, `jam-tarh-kasrayn`, `adad-natiq`), one per step, after the matching question.
9. **Bank** (helper): 50 sheets, 16 `term_exam` (modelled on the corpus items listed in §9: the exam text itself was not readable, so each sheet follows the index's topic and question type with new numbers), 26 `term_exam_modelled`, 8 `adapted`; L5 is 2 `term_exam` + 7 modelled + 1 adapted (§9 said 1–2 + 8 modelled). Nine `MISC-AMAL-*` entries.
10. **Catalogue.** `durationMinutes` 66 (modules without the مسائل; 90 with them), `pointPrerequisites` P1 ← `3am_jam-tarh-kasrayn_P2` + `3am_adad-natiq_P2`, P2 ← `3am_jidaa-adadayn-nisbiyayn_P4`, P3 ← `3am_maqlub-qismat-kasrayn_P3`, P4 ← P1, P2, P3; الكفاءات reworded as §2 proposes.
