# Plan — `tasawi-muqaranat-kasrayn` « تساوي كسرين ومقارنتهما » (3AM unit 2, lesson 2 of 5 + synthesis)

Read the unit [`README.md`](README.md) first. It holds the boundaries, `fractions3.js`, the element ids and the order. The unit is
seeded, and its extraction is written, by `maqlub-qismat-kasrayn` (published before this lesson).

## 1. Identity

- **Code** `tasawi-muqaranat-kasrayn` · **title** « تساوي كسرين ومقارنتهما » · **unit** `kusur-natiqa` · catalogue order 5 · kind `lesson`.
- **Folder** `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/kusur-natiqa/tasawi-muqaranat-kasrayn/`.
- **Textbook pages** (book → pdf = book + 1):

  | Book p. (pdf) | Section | Elements |
  |---|---|---|
  | 23 (24) | `prep` | items 3 (fraction equal to 15/21), 4 (5/7 of three figures), 5 (11/12 vs 5/6) |
  | 24 (25) | أنشطة | `act-2` « تساوي كسرين » (verify ad = bc for 3/2 = 15/10, then the proof both ways); `act-3` « مقارنة كسرين » (512/497 vs 652/783, 57/31 vs 57/29, 209/208 vs 208/207, 13/12 vs 23/20) |
  | 26 (27) | معارف | `know-3` « مقارنة كسرين »: ×k / ÷k, the cross-product property, the same-denominator rule, the rule « توحيد المقامين », examples 1–3 |
  | 27 (28) | طرائق | `method-1` (132/56 = 33/14), `method-2` (units digits), `method-3` (through 1), `method-4` (common multiple 12); `now-1` |
  | 30 (31) | أوظّف | `ex-8`, `ex-9`, `ex-10`, `ex-12`…`ex-17` |
  | 34 (35) | أتعمّق | `deep-55` |

- **Seeds the unit: no.** The lead re-reads its elements at 200–250 dpi, sets `verified: True` with `Fraction` assertions, gives each
  element its module number in `build-extraction.py`, and rebuilds `extraction.json`.

## 2. Programme & net

**Programme item:** `3am.m1.r05` « مقارنة كسرين. »

**Draft الكفاءات (verbatim):**
1. « التعرّف على تساوي كسرين بالجداءين المتصالبين: $\frac{a}{b}=\frac{c}{d}$ يكافئ $a\times d=b\times c$ »
2. « مقارنة كسرين لهما نفس المقام أو نفس البسط »
3. « مقارنة كسرين مقاماهما مختلفان بتوحيد المقامات أو بالجداءين المتصالبين »

**Proposed final wording (order kept):**

| LP | Final | Change |
|---|---|---|
| P1 | التعرّف على تساوي كسرين بالجداءين المتصالبين: $\frac{a}{b}=\frac{c}{d}$ يكافئ $a\times d=b\times c$ ، وإيجاد حدّ مجهول في تساوي كسرين | Adds the missing term (x/16 = 5/8). This is the book's own use (`ex-16`, the lab's « no whole number » case) and the exact tool 4AM Thales needs. |
| P2 | مقارنة كسرين مقاماهما مختلفان (ليس أحدهما مضاعفًا للآخر) بكتابتهما بنفس المقام، باستعمال مضاعف مشترك للمقامين | **Meaning changed.** « Same denominator / same numerator » is 2AM `muqarana-kasrayn` P1–P2: the net link `extends` with the added value « مقارنة كسرين كيفيين بتوحيد المقامات », and the no-duplication rule applies. Those cases are RECALLED (« تذكّر » + « أستعدّ »). |
| P3 | اختيار طريقة مناسبة لمقارنة كسرين: الجداءان المتصالبان، أو المقارنة بالعدد $1$ أو بكسر وسيط، أو نفس البسط | **Meaning sharpened.** The draft P3 repeated P2 + P1. The book's طريقة (p. 27) is explicitly « يمكن استعمال عدة طرق »: choosing the method is what remains to learn. |

**Review items for « أستعدّ »:**

| Item | Text | Home | Status |
|---|---|---|---|
| `2am.m1.r08` | مقارنة كسرين لهما نفس المقام أو مقام أحدهما مضاعف لمقام الآخر. | `muqarana-kasrayn` (2AM) | coming_soon → platform statements + rewritten `prep` 3, 5; « تذكّر — السنة الثانية » with no link |

`priorKnowledge`:
- `muqarana-kasrayn-2am`;
- `kasr-mutasawi-1am` (equal fractions ×k: `ikhtizal-kitaba-kasriya`, published).

**noRebuild:** `3am.m1.r05` extends `2am.m1.r08`. Open by recalling the base (« تذكّر » node + box) and build only « كيفيين بتوحيد
المقامات ». The « وبإشارات » part of the added value is placed in `adad-natiq` (README owner question 5).

**pointPrerequisites:**
- intra-lesson only: P3 ← P1, P3 ← P2;
- no net link connects this item to `maqlub`'s items, so there is no cross-lesson edge;
- the 2AM base is unpublished.

**Where it is used next:**
- `jam-tarh-kasrayn` reuses the common denominator (recall only — no net link: README owner question 1);
- `adad-natiq` uses it to order signed fractions;
- 3AM unit 4 `muqaranat-natiqayn` (`3am.m5.r04` CONSOLIDATES r05) recalls it;
- 4AM `talis-hisab-atwal` (AM/AB = AN/AC = MN/BC and a missing length by cross products);
- 4AM `ikhtizal-kasr` (equal fractions);
- 4AM proportionality (the fourth proportional by cross products).

## 3. Boundary

**Owns:**
- ad = bc ⇔ a/b = c/d, both directions, for positive fractions with natural terms (decimals in numerators are 2AM conversions, used);
- a missing term of an equality of fractions;
- comparing two positive fractions with ANY denominators through a common denominator (product or smaller common multiple);
- comparing through cross products, through 1 or an intermediate fraction, or through the same numerator;
- ordering 3–6 positive fractions;
- the units-digit test of non-equality.

**Leaves:**
- the same denominator / same numerator / one-multiple cases themselves (2AM, recalled);
- signed fractions and the number line → `adad-natiq`;
- sums → `jam-tarh` (a question « did they finish the corridor? » needs a sum and is NOT posed here);
- the sign of a difference → `muqaranat-natiqayn`.

## 4. Textbook analysis

| Element | What it asks | Idea to keep | Platform use |
|---|---|---|---|
| `act-2` | verify ad = bc for 3/2 = 15/10, then prove « a/b = c/d ⇔ ad = bc » via the common denominator bd | the proof by the denominator b·d | **Not the entry** (a proof asked before any need). Its reasoning becomes the معارف justification, with own numbers (6/8 and 9/12 over 8 × 12 = 96). |
| `act-3` | four pairs « بالطريقة المناسبة » (> 1 vs < 1; same numerator; 1 + 1/208 vs 1 + 1/207; 13/12 vs 23/20) | each pair calls a DIFFERENT method | أتمرّن item 1 (own pairs): this is exactly P3 |
| `know-3` | ×k / ÷k, the cross-product property, the rules, 3 examples | wording and notation | معارف, rewritten, own examples |
| `method-1`…`method-4` | cross products; units digits; through 1; common multiple | the menu of methods | طريقة, one own example each |
| `now-1` | equal? 2018/2017 & 2017/2016; 345/667 & 15/29; 10/9 & 7/6 | consecutive numbers are never equal | أتمرّن item 2 (own) |
| `prep` 3, 4, 5 | equal fraction to 15/21; 5/7 of figures; 11/12 vs 5/6 | 2AM level | « أستعدّ » (rewritten) |
| `ex-8`, `ex-12`…`ex-17` | identify equal; same denominator then order; cross products; compare without a common denominator | practice | أتمرّن items 3–5 + bank |
| `ex-9`, `ex-10` | decimal writings → fractions; reduce | 2AM / 1AM recalls | bank (L1, adapted) |
| `deep-55` | a calculator says equal, the units digits say different | the limit of a calculator | أتمرّن item 6 (own numbers) |

## 5. Design

**The lesson in one paragraph.** Two paint mixtures have the same shade exactly when they hold the same blue per white: 3 shots of blue
for 4 of white and 6 for 8 look identical. **Matching a reference shade means finding c with c/d = a/b, and the shade matches exactly
when c × b = a × d — the cross products.** When no whole number of shots matches (3/4 with 10 white needs 7,5 shots), the meter leans:
7 shots is lighter, because 7 × 4 = 28 < 30 = 3 × 10, and 8 shots is darker (32 > 30). So the cross products also COMPARE. Writing
both mixtures with the same white count says the same thing: 3/4 = 15/20 and 7/10 = 14/20. Any common multiple of the two whites
works; the product always does. The eye cannot tell 3/4 from 7/10 on a wall, but the numbers can. Choosing a method is the last step:
cross products, through 1, same numerator, or a common denominator.

**Entry point — candidates compared:**
- (a) **The book's نشاط 2** (verify, then prove the property): a proof before a need, answered by algebra. It is a test, not a
  discovery. Rejected as the entry; it becomes معارف's justification.
- (b) **The book's نشاط 3** (four pairs to compare): it needs the methods before they exist. It becomes the أتمرّن application.
- (c) **Rows of recipe copies aligned to equal white counts**: a good picture of the common denominator, but it is a stretch-and-align
  gesture close to unit 3's `unit-ladder` band. It is also less direct for the cross products.
- (d) **The shade match**: the hand dispenses the NUMERATOR c into a bucket of d white until the colour meter balances against a
  reference a/b. The equality is NECESSARY (the paint must match the wall). The impossible case forces COMPARISON. The meter's verdict
  is honest (computed exactly). **Chosen.** `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'paintshop' }`.

**Order of ideas:**
1. a matching shade, c × b = a × d (P1);
2. no whole match → lighter / darker → the cross products compare;
3. the same comparison with the same white count (a common multiple, P2);
4. معارف: « تذكّر » (2AM), the property both ways (the proof via b·d), the rule of a common denominator;
5. طريقة: choosing the method (P3);
6. أتمرّن, three مسائل, the test.

**Contexts:**
- the school's mural club buys paint at the neighbourhood shop (care for the school);
- a shooting contest at the sports day (accuracy as a fraction);
- the corridor tiling by volunteer parents.

## 6. Lab — `shade-match` « آلة مزج الألوان » (new type)

**Drawn world `paintshop`** (new theme, kind `objects`, shows « آلة مزج الألوان في محلّ الطلاء: دلوان وعلب أبيض ورافعة للأزرق »):
- the shop's tinting machine: a brass nozzle above bucket B and a lever;
- the reference bucket A (sealed, its label « 3 أزرق : 4 أبيض » and its swatch) on the left;
- bucket B on the right, with its d white shots drawn as white layers;
- each blue shot drops as a drawn dollop and the mixture in B re-tints live;
- above the buckets, two big swatches side by side (A | B) and a balance-needle **meter** « أغمق ◄ ► أفتح »;
- KidFigure Amine (boy, hoodie) holds the roller by the mural sketch.

The colour is computed honestly from the blue share t = c / (c + d) (a linear mix white → club blue), so equal ratios give IDENTICAL
colours. The needle leans by the sign of c·b − a·d (magnitude clamped). The numbers decide when the eye cannot.

**The variable in the hand: c, the number of blue shots in bucket B** (0…40); d (B's white) and a/b (the reference) are given.

**Gesture:**
- **press-and-hold the lever** (one shot every 0,45 s while held, each with a click, a dollop and the counter +1);
- a tap on the lever = one shot;
- the « تصريف » tap = remove one shot (a drop drains back);
- keyboard: Space held = dispense, Enter = one shot, Backspace = remove one;
- reduced motion: no dollop animation, the counter and colour change at once.

**What the world shows (never the rule):**
- the live re-tint;
- the needle and its lamp « تطابق » when c·b = a·d (stamp + Amine `proud`);
- each release pins a small tick on the meter scale labelled with c (the trial memory: 5, 7, 6…);
- when no c can match, the two neighbouring ticks stay on opposite sides of the centre, lighter and darker. The banner says what the
  student did, in her own numbers (« 7 طلقات: أفتح من المرجع · 8 طلقات: أغمق »), never the rule.

**Opening (no title):**
- Context: « في دلو المرجع 3 طلقات أزرق مع 4 علب أبيض، وفي الدلو الثاني 8 علب أبيض. »
- Question: « اضغط الرافعة حتى يطابق لون الدلو الثاني لون المرجع تمامًا. »
- `lead`: « كل ضغطة = طلقة أزرق واحدة. »

**Levels** (same `objective` string on both):

*مبتدئ* — meter visible:

| id | reference a/b | B's white d | end state | contrast |
|---|---|---|---|---|
| `s1` | 3/4 | 8 | **c = 6** (6 × 4 = 24 = 3 × 8) | 5 lighter (20 < 24), 7 darker (28 > 24); the « +4 white so +4 blue » idea (c = 7) is refused by the needle |
| `s2` | 2/3 | 9 | **c = 6** (18 = 18) | — |
| `s3` | 3/4 | 10 | **no whole c**: 7 lighter (28 < 30), 8 darker (32 > 30) — the student ends by pressing « لا يوجد عدد صحيح » after trying both neighbours | the impossible case → comparison |

*متقدم* — the meter is VEILED until the student commits: she types c, or « مستحيل » plus the two neighbours and which is darker; then the
needle is revealed.

| id | reference | d | end state |
|---|---|---|---|
| `a1` | 5/6 | 18 | c = 15 (90 = 90) |
| `a2` | 4/7 | 12 | impossible (48/7): 6 lighter (42 < 48), **7 darker but closest** (49 vs 48) |
| `a3` | 9/12 (not reduced) | 8 | c = 6 (72 = 72): an unreduced reference matches like 3/4 |
| `a4` | two finished buckets, A 7/9 and B 10/13, no dispensing | — | predict « أيّهما أغمق؟ » → A (7 × 13 = 91 > 9 × 10 = 90) |

**« جرّب أعدادك » (always open):** a, b, d ∈ 1…20 and c dispensed 0…40. Free trials never count.

**LabCoach** (`coachOf`):
1. `lever`: « اضغط الرافعة مطوّلًا لتصبّ الأزرق، أو انقر مرّة لطلقة واحدة. »
2. `meter`: « راقب إبرة المقياس: إلى أين تميل؟ »
3. `drain`: « زدتَ كثيرًا؟ زرّ التصريف يُعيد طلقة. »
4. `impossible` (s3, once both neighbours have been tried): « إن لم يتطابق أيّ عدد، اضغط « لا يوجد عدد صحيح ». »
5. `commit` (متقدم): « اكتب توقّعك قبل أن يُكشف المقياس. »

**Wrong moves made VISIBLE:**
- the additive idea (B has 4 more white, so add 4 more blue → 7 for 8): needle « أغمق »;
- comparing numerators only (a4: « 10 > 7 so B darker »): refuted by the reveal;
- « a bigger denominator means a bigger fraction »: a4 and the free panel;
- « an unreduced fraction is a different colour » (a3): it matches.

**Discovery** (after s1 and s3):
- Question: « متى يطابق لونُ الدلو الثاني لونَ المرجع؟ »
- Right: « حين يكون عدد الأزرق × 4 = 3 × عدد الأبيض ».
- Wrong:
  - « حين نضيف من الأزرق قدر ما أضفنا من الأبيض » (refuted by her c = 7 tick);
  - « حين يكون عدد الأزرق أكبر من عدد الأبيض » (refuted: 6 < 8 matched).

The formal phase names: $\frac{3}{4}=\frac{6}{8}$ because $3\times8=4\times6$; and $\frac{7}{10}<\frac34$ because $7\times4<3\times10$.

**Core maths:**
- `fractions3.js` (L2 row): `crossProducts`, `sameFraction`, `compareFractions`, `lcm`, `commonMultiples`, `toDenominator`,
  `missingTerm`, `matchNumerator(a, b, d)` → `{ exact, c, below, above }`;
- lab logic `logic/shadeMatch.js`: `mixShade(c, d)` (t = c/(c+d) as an exact rat, the colour derived from it), `verdict(a, b, c, d)`,
  `coachOf`, `report` events:
  - `{ kind: 'release', mission, c, d, verdict: 'lighter' | 'match' | 'darker' }`;
  - `{ kind: 'impossible', mission, below, above, ok }`;
  - `{ kind: 'commit', mission, value, ok }`;
  - `{ kind: 'custom' }`;
  - `{ kind: 'solved', mission }`.

**Why not another lab (DNA §12):**
- `fraction-knife` (1AM): the share is fixed and the hand holds the number of pieces d of one whole; the refusal is a straddling piece.
- `fourth-gauges` (2AM): the hand holds a missing cell of a price board; balances of « per unit », « between columns », « cross
  products ».
- `fraction-reduction` (4AM): carry portions in a kitchen.
- Here the hand DISPENSES discrete shots into a mixture. The judge is a COLOUR that the eye cannot resolve near equality and a needle
  that can. The impossible case is the core of comparison. No board, no gauge row, no cut.
- The unit-5 `scoop-scale` pours a continuous mass onto a rounding scale. Here: discrete shots, a ratio, a colour.

**Screen budget:**
- 1024×768 with the sidebar: the two buckets and the machine side by side on top (≈ 50 % of the height); the swatches + meter under
  them on one row; the lever's grab ≥ 56 px.
- « جرّب أعدادك » in a compact row (three small fields) under the meter, always open.
- 768×1024: stack swatches above the buckets.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق من مقارنة كسرين لهما نفس المقام أو نفس البسط أو مقام أحدهما مضاعف للآخر ». Seven statements:

| # | Statement | Key |
|---|---|---|
| 1 | $\frac{7}{12}<\frac{11}{12}$ | ✓ |
| 2 | $\frac58>\frac56$ | ✗ (same numerator: the smaller denominator is larger) |
| 3 | $\frac34>\frac7{12}$ (because $\frac34=\frac9{12}$) | ✓ |
| 4 | $\frac25>\frac3{10}$ | ✓ (4/10) |
| 5 | $\frac97<1$ | ✗ |
| 6 | rewritten `prep` 3: « $\frac34$ يساوي $\frac{18}{24}$ » | ✓ |
| 7 | rewritten `prep` 5: « $\frac7{10}>\frac35$ » | ✓ (6/10) |

**M1 نشاط — « آلة مزج الألوان »** — `objectives`: « أكتشف متى يتساوى كسران وكيف أقارن كسرين بالجداءين المتصالبين ». Lab on top (both levels);
then:
1. Evidence « في s1 طابق اللون حين صببتَ 6 طلقات ». Q: « احسب $6\times4$ و $3\times8$ » → 24 and 24. « أتوقّع القاعدة » (« كسران
   متساويان حين… »), then brick `jidaa-mutasalib` « $\frac ab=\frac cd$ يكافئ $a\times d=b\times c$ ».
2. Evidence « في s3 كانت 7 أفتح و 8 أغمق ». Q: « قارن $3\times10$ و $4\times7$ ؛ ثم أكمل: $\frac7{10}\;\square\;\frac34$ » → 30 > 28, so
   7/10 < 3/4. Brick `muqarana-mutasalib`.
3. Q: « اكتب $\frac34$ و $\frac7{10}$ بالمقام 20 » → 15/20 and 14/20, the same conclusion. « أيّ عدد آخر كان يصلح مقامًا مشتركًا؟ »
   (choice) → 40. Distractors: 14 (4 + 10), 30. « أتوقّع القاعدة », then brick `tawhid-maqamat` « لمقارنة كسرين مقاماهما مختلفان نكتبهما
   بنفس المقام: مضاعف مشترك للمقامين ».

**M2 معارف** — `objectives`: « أسمّي خاصية الجداءين المتصالبين وقاعدة توحيد المقامات ».
- Opens on the lab ALONE (`levels={false}`, world `equal`):
  - reference 6/8 and four candidate buckets 9/12, 15/20, 7/9, 12/15;
  - the student taps each candidate to load it and reads the needle;
  - end state: picks exactly the matching two (9/12 ✓, 15/20 ✓; 7/9 ✗, 12/15 ✗).
- Questions:
  1. « أيّ الدلاء طابقت؟ » → 9/12 and 15/20;
  2. « تحقّق بالجداءين: $6\times12$ و $8\times9$ » → 72 = 72.
- Boxes:
  - « تذكّر — السنة الثانية » (same denominator, same numerator, one multiple of the other; no link);
  - the ×k / ÷k property;
  - the cross-product property both ways, with its justification over the denominator b × d (own numbers: 6/8 = 72/96 and
    9/12 = 72/96, so 6 × 12 = 8 × 9);
  - the comparison rule « بتوحيد المقامين »;
  - examples: 5/6 vs 7/8 → 20/24 < 21/24; 11/18 vs 7/12 → 22/36 > 21/36.

**M3 طريقة** — `objectives`: « أختار طريقة مناسبة لمقارنة كسرين ». One question per method:
1. $\frac{156}{84}$ and $\frac{13}{7}$: equal? → $156\times7=1092=84\times13$, yes.
2. Units digits: $\frac{3217}{5419}$ vs $\frac{4826}{8133}$ → the units digit of 3217 × 8133 is 1, of 5419 × 4826 is 4 → not equal
   (no full product needed).
3. Through 1: $\frac{125}{97}$ vs $\frac{61}{340}$ → the first > 1 > the second.
4. Common multiple: $\frac{11}6$ vs $\frac94$ → 12: 22/12 < 27/12.
5. Same numerator: $\frac{13}{20}$ vs $\frac{13}{21}$ → the first is larger.

Method box: « لمقارنة كسرين: نوحّد المقامين، أو نقارن الجداءين المتصالبين، أو نقارن كلًّا منهما بالعدد 1 أو بكسر وسيط، أو نستعمل نفس البسط ».

**M4 أتمرّن** — `objectives`: « أتدرّب على التساوي والمقارنة بالطريقة المناسبة »:

| # | Statement | Answers | cites |
|---|---|---|---|
| 1 | قارن بالطريقة المناسبة: $\frac{413}{398}$ و $\frac{562}{631}$ ؛ $\frac{47}{23}$ و $\frac{47}{25}$ ؛ $\frac{306}{305}$ و $\frac{305}{304}$ ؛ $\frac{17}{16}$ و $\frac{29}{24}$ | > (through 1) · > (same numerator) · < (1 + 1/305 < 1 + 1/304) · < (51/48 < 58/48) | `act-3` |
| 2 | هل الكسران متساويان؟ $\frac{2026}{2025}$ و $\frac{2025}{2024}$ ؛ $\frac{336}{609}$ و $\frac{16}{29}$ ؛ $\frac{11}{10}$ و $\frac98$ | no (4 100 624 ≠ 4 100 625) · yes (9744 = 9744) · no (88 ≠ 90) | `now-1` |
| 3 | من بين $\frac{15}{18}, \frac72, \frac56, \frac{21}6, \frac{20}{24}, \frac98$ ، جمّع الكسور المتساوية | {15/18, 5/6, 20/24}, {7/2, 21/6} | `ex-8` |
| 4 | اكتب بنفس المقام ثم رتّب تصاعديًا: $\frac53, \frac76, \frac34, \frac{11}{12}, \frac32$ | 3/4 < 11/12 < 7/6 < 3/2 < 5/3 | `ex-12`, `ex-13`, `ex-14` |
| 5 | تحقّق أنّ $18\times35=21\times30$ ، ثم اكتب كسرين متساويين؛ وجد $x$: $\frac x{16}=\frac58$ | 630 = 630 → 18/21 = 30/35 (and 18/30 = 21/35); x = 10 | `ex-15`, `ex-16` |
| 6 | تقول الحاسبة إنّ $\frac{355}{113}$ و $\frac{35500000001}{11300000000}$ متساويان. ما رأيك؟ برّر برقمي آحاد الجداءين المتصالبين | units digits 0 and 3 → different (the difference is ≈ 8,8 × 10⁻¹¹, invisible on 10 digits) | `deep-55`, `ex-17` |

**M5 مسألة 1 (`lessonProblem`)** — « مسابقة الرمي »:
- Statement: « في يوم الرياضة أصاب أمين 7 رميات من 9 ، وأصابت ياسمين 10 من 13 ، وأصاب رياض 11 من 14 . »
- Questions and answers:
  1. « من الأدقّ؟ » → Riad (11/14);
  2. « رتّب الثلاثة » → 10/13 < 7/9 < 11/14 (7 × 13 = 91 > 90; 7 × 14 = 98 < 99).
- Illustration `tags`: three cards.

**M6 مسألة 2** — « لون الجدارية »:
- Statement: « خلطت سلمى 5 طلقات أزرق مع 8 علب أبيض، وخلط يونس 8 طلقات مع 13 علبة أبيض. »
- Questions and answers:
  1. « هل اللونان متماثلان؟ من الأغمق؟ » → no; Salma darker (65 > 64);
  2. « كم طلقة يضع يونس مع 13 علبة ليطابق لون سلمى؟ » → 65/8 is not whole → impossible;
  3. « ومع 16 علبة؟ » → 10.

**M7 مسألة 3** — « تبليط الممرّ »:
- Statement: « بلّط أولياء متطوّعون ممرّ المدرسة: $\frac25$ منه في اليوم الأول، و $\frac38$ في الثاني، و $\frac9{40}$ في الثالث. »
- Questions and answers:
  1. « اكتب الكسور الثلاثة بالمقام 40 » → 16/40, 15/40, 9/40;
  2. « في أيّ يوم بلّطوا أكبر جزء؟ » → day 1;
  3. « رتّب الأيام » → day 3 < day 2 < day 1.
- Modelled on the corpus register `3am-s1-103` ex 5 III (which day tiled most). The « was it enough? » question needs a sum: NOT posed.

**M8 إختبار أولي** (literal in `Module08Itqan.jsx`, data in `FINAL`):

| # | Prompt | Key | Distractors |
|---|---|---|---|
| 1 | أيّ كسر يساوي $\frac{12}{18}$؟ | $\frac23$ | $\frac{14}{20}$ (MISC-TASAWI-ADDSAME) · $\frac6{12}$ (MISC-TASAWI-HALFTOP) · $\frac32$ |
| 2 | $\frac57\;\square\;\frac7{10}$ | $>$ (50 > 49) | $<$ (MISC-TASAWI-NUMERATORS) · $=$ (MISC-TASAWI-GAP) |
| 3 | هل $\frac{21}{35}=\frac{33}{55}$؟ | « نعم لأنّ $21\times55=35\times33=1155$ » | « لا لأنّ $21\neq33$ » (NUMERATORS) · « لا لأنّ $55-35\neq33-21$ » (ADDSAME) · « نعم لأنّ $35-21=14$ » |
| 4 | الترتيب التصاعدي لـ $\frac23, \frac58, \frac7{12}$ | $\frac7{12}<\frac58<\frac23$ | $\frac23<\frac58<\frac7{12}$ (MISC-TASAWI-DENOMS) · $\frac58<\frac23<\frac7{12}$ |
| 5 | $\frac x{15}=\frac46$ ، إذن $x=$ | $10$ | $13$ (ADDSAME) · $22{,}5$ (MISC-TASAWI-CROSSWRONG: 6 × 15 ÷ 4) · $\frac{8}{3}$ |

## 8. Misconceptions (`MISC-TASAWI-*`)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `ADDSAME` | adding the same number to both terms keeps the fraction | s1: c = 7 is darker | tests 1, 3, 5; L1–L3 |
| `NUMERATORS` | compare numerators only | a4 reveal | tests 2, 3; L1 |
| `DENOMS` | a bigger denominator means a bigger fraction | a4, free panel | test 4; L1, L2 |
| `GAP` | fractions with the same gap b − a are equal (5/6 = 7/8) | free panel | test 2; L2 (برّر) |
| `CROSSWRONG` | the missing term from the wrong diagonal | — | test 5; L3 |
| `HALFTOP` | dividing only one term | — | test 1 |
| `EYE` | « the colours look the same, so the fractions are equal » | s3 / a2: lighter-darker ticks | L2 (برّر), M4 item 6 |
| `CALC` | a calculator display proves equality | M4 item 6 | L2, L3 |

## 9. Practice bank (`content/practice/3am/tasawi-muqaranat-kasrayn/`)

**Corpus:** `3am.m1.r05` has 6 distinct exercises, mostly integration parts:
- `3am-s1-3` ex 4 I (which vegetable has the largest share: 1/4, 2/6, 10/24 → 10/24; « did they plant the whole land? » needs a sum →
  `counted: false`);
- `3am-s1-103` ex 5 III ① (which day: 2/3, 1/12, 1/4);
- `3am-s1-104` ex 5 and `3am-s1-108` ex 5 (shares of three brothers — the comparison step);
- `3am-s1-104` ex 2 ③ (compare K and E — needs sums → only the comparison step is counted, with K and E given);
- `3am-s3-47` ex 1 (QCM with justification, term 3).

**Honest count of FAITHFUL `term_exam`: 4–5.** The Thales parts of the integration exercises belong to 3AM units 8–9 (not generated):
those sheets keep the fraction part only, or are relabelled `term_exam_modelled`.

| Level | Content | Provenance |
|---|---|---|
| L1 | equal or not by cross products; compare two fractions; one missing term | 1 term_exam (`3am-s3-47` item) · 6 modelled · 3 adapted (`ex-8`, `ex-15`, `ex-10`) |
| L2 | compare, then « برّر » (method named); « is 5/6 = 7/8? » | 1 term_exam (`3am-s1-104` ex 2 ③ with K and E given) · 7 modelled · 2 adapted (`ex-17`, `deep-55`) |
| L3 | order 4–5 fractions with a common denominator; a missing term; choose methods | 0 term_exam · 8 modelled · 2 adapted (`ex-12`, `ex-13`) |
| L4 | mobilises `maqlub` (published, same term): compare a quotient with a fraction (12 ÷ 4/5 vs 31/2); division steps `counted: false` | 0 term_exam · 10 modelled |
| L5 | « الوضعية الإدماجية »: shares of a land / days of work — compare, order, justify a decision | 2–3 term_exam (`3am-s1-3` ex 4, `3am-s1-103` ex 5, `3am-s1-108` ex 5 — the comparison parts; Thales parts dropped or `counted: false`) · 7 modelled |

**Answer types:**
- `choice` for relations (< = >) and orders;
- `rational` for missing terms;
- `selfCheck` for « برّر ».

Each LP is primary on ≥ 8 questions.

**Oracle:** `scripts/practice-oracle/tasawi-muqaranat-kasrayn.mjs`. It recomputes every relation with BigInt cross products (its own code,
never `packages/core`), re-parses every order chain and checks it sorted, and recomputes every missing term. Badges « على منوال اختبار الفصل
الأول » (or « الثالث » for `3am-s3-47`).

## 10. Risks & owner questions

1. **Meaning changes of P2 and P3** (README owner question 4): the draft P2 duplicated 2AM.
2. **Signed comparison** goes to `adad-natiq` (README owner question 5).
3. **Colour honesty.** The swatches of 3/4 and 7/10 differ by about 2 % in blue share. Check on screenshots that they look almost the
   same (that is the point) while the needle clearly leans. Colour-blind safety: the meter also prints « أفتح / أغمق » and the needle
   position; colour is never the only signal.
4. **The units-digit test** (method-2) is an extra tool, not an LP. Keep it in طريقة as a choice, never in the final test.

## 11. Generator checklist

- [ ] `build-extraction.py`:
  - re-read L2's elements (pp. 23, 24, 26, 27, 30, 34) at 200–250 dpi;
  - set `verified: True` with `Fraction` assertions;
  - set the module numbers per §4 / §7;
  - rebuild `extraction.json`.
- [ ] `fractions3.js`: add the L2 functions + tests.
- [ ] Lab `shade-match`:
  - type, theme `paintshop`, registry, `levels.js` (same `objective`), strings `lesson.manipulation.json › shadeMatch`;
  - `logic/shadeMatch.js` + test: each mission solved via `coachOf`; the impossible verdict; the veil; a colour equal for equal ratios;
  - render test (context then ONE question; says each thing once);
  - MANIPULATION_CONTRACT section + DNA §15 row;
  - screenshots at the five sizes: initial, a darker tick, the match stamp, the impossible case, the advanced reveal, the formal phase —
    reviewed.
- [ ] Lesson:
  - 9 modules;
  - `lesson.config.js` header (entry, rejected (a)–(c), order, LP history with the P2 / P3 changes);
  - knowledge map;
  - `content/content.test.js` (BigInt cross products, every FINAL option literal in `Module08Itqan.jsx`).
- [ ] « تذكّر — السنة الثانية » box in معارف (no link); « أستعدّ » measures `2am.m1.r08`; intra-lesson `pointPrerequisites` only.
- [ ] `npm run generate:lesson-index`, `npm run generate:learning-net`.
- [ ] e2e `apps/web/e2e/lesson-kit/3am-kusur-natiqa-tasawi.mjs` + coach and retrofit blocks; route boundary.
- [ ] Gates: `npm test`, `validate:lessons`, `check:textbook`, `check:lessons` (≤ 330 KB), `build`.
- [ ] Bank (50) + oracle + JSON entries.
- [ ] Publish (coordinator, guide §11): `available`, `durationMinutes` ≤ 90, index, export/import, local DB publish, commit, push `dev`,
  progress report.

## Generator notes (2026-10-26)

Deviations from this plan, all minimal:

1. **`act-3` fact.** The plan's list in § 4 says « 23/20 vs 13/12 » is compared; the printed pair is **23/20 > 13/12** (23 × 12 = 276 > 260). The extraction answer key was wrong and is fixed (`DISCREPANCIES`). No lesson content uses that pair as printed.
2. **Transcription fixes** (re-read at 260 dpi): `ex-15` first pair is **5/7 and 15/17** (not 5/17); `ex-17` pairs are 17/18 and 18/17, 11/15 and 11/21, 64/31 and 17/9, **8/9 and 256/288 (equal)**. All L2 elements are now `verified: True`; `ex-9`, `ex-10`, `ex-17` have destination « bank », the others module 4 (§ 4 table); `ex-9` is cited by `ex-16`'s `cites` in module 4.
3. **M4 item 5** is two exercises on one step (`ex-15`: which equality follows from 18 × 35 = 21 × 30 — one option only; `ex-16`: x/16 = 5/8 → 10), because one `TextbookExercise` carries one interaction.
4. **M0**: the prep statements keep the plan's order of keys, but the two rewritten textbook items (`prep` 3, `prep` 5) come last (statements 6 and 7); `prep` 4 (figures) is not reproduced (the bank carries the picture-free equivalent).
5. **Lab**: `a1`… in متقدم are `veil: true` for every task (the level test measures the pair by the task count and the veil). The impossible commitment writes TWO neighbours (« أقرب عدد أفتح » / « أقرب عدد أغمق ») instead of three fields. The `equal` world finishes when the four buckets are all loaded (the module's first question then asks which matched, so it is not asked twice). LabCoach `lever` sentence slightly shortened (« اضغط الرافعة مطوّلًا لتصبّ، أو انقر مرّة لطلقة واحدة »).
6. **M1** questions are numeric / tap questions on the student's own releases (6 × 4 and 3 × 8; 3 × 10 vs 7 × 4; 15/20 and 14/20; the other common denominator 40), with the three bricks `jidaa-mutasalib`, `muqarana-mutasalib`, `tawhid-maqamat`.
7. **Bank**: see EXERCISE_CONTRACT status line. `3am-s3-47` ex 1 and `3am-s1-104` ex 2 are SIGNED in the corpus (a = −3/2, b = −4/3; K = −3/8 − 9/5): kept as `term_exam` with positive fractions; `3am-s1-104` ex 5 (the brothers) was NOT cited because the printed shares sum to more than 1. `deep-55` uses the pair 123456789/987654321 and 12345679/98765432 (the second is exactly 1/8; an 8-digit calculator shows both as 0,12500000).
8. **Not done / open**: owner questions 1–5 of the unit README are unchanged; the 1AM–3AM « راجع » link of `2am.m1.r08` stays a recall without link (the 2AM lesson is unpublished).

