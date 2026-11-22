# Plan — `adad-natiq` « العدد الناطق » (3AM unit 2, lesson 4 of 5 + synthesis)

Read the unit [`README.md`](README.md) first. `maqlub`, `tasawi` and `jam-tarh` are published before this lesson. Unit 1
(`qismat-nisbiyayn`) is published before the unit.

## 1. Identity

- **Code** `adad-natiq` · **title** « العدد الناطق » · **unit** `kusur-natiqa` · catalogue order 7 · kind `lesson`.
- **Folder** `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/kusur-natiqa/adad-natiq/`.
- **Textbook pages** (book → pdf = book + 1):

  | Book p. (pdf) | Elements |
  |---|---|
  | 23 (24) | `prep` items 8 (compare −7 and −9) and 12 ((−7) ÷ (−2) = 7/2, read LTR) |
  | 25 (26) | `act-5` « العدد الناطق »: ① decimal or not among 3, −2, −8,2/5, 5/7, 11/3, −3/8; signs of −24/−32, 14/−18, −28/15; why −24/−32 = 24/32 and −28/15 = 28/−15 = −28/15; −a/−b = a/b; ② place −2/3 and −4/6 on a line; ③ equal rationals among −9/6, 4/3, 8/6, 16/12, −10/6, −5/3, −3/2; ④ order −5/6, −3/2, 17/6, −23/12, −2/3, 11/3 |
  | 28 (29) | `know-5`: the definition, every rational = a/b or −a/b with natural a, b; examples (−1,8, 9/5 decimal, 15/11 not decimal ≈ 1,36; π) |
  | 29 (30) | `method-10` « مقارنة عددين ناطقين » (−5,7/9 vs −3,9/6 over 18) |
  | 31 (32) | `ex-22`…`ex-33` |
  | 33 (34) | `self-4`, `self-9`, `self-10` |
  | 34 (35) | `deep-56`, `deep-69` |

- **Seeds the unit: no.**

## 2. Programme & net

**Programme item:** `3am.m1.r07` « التعرّف على العدد الناطق. »

**Draft الكفاءات (verbatim):**
1. « التعرّف على العدد الناطق كحاصل قسمة عدد نسبي على عدد نسبي غير معدوم $\frac{a}{b}$ »
2. « تعيين إشارة عدد ناطق وكتابته بمقام موجب »
3. « تمثيل أعداد ناطقة على مستقيم مدرج وترتيبها »

**Proposed final wording (order kept):**

| LP | Final | Change |
|---|---|---|
| P1 | التعرّف على العدد الناطق كحاصل قسمة عدد نسبي على عدد نسبي غير معدوم $\frac{a}{b}$ ، ومعرفة أنّ الأعداد الطبيعية والأعداد الصحيحة النسبية والأعداد العشرية النسبية أعداد ناطقة | Adds the inclusions (`know-5` and `ex-22` « تعرّف على الأعداد الطبيعية والعشرية والنسبية »). « Decimal or not, approximate value » stays 1AM `hasil-qisma-kasr` P3 (published): used, not rebuilt. |
| P2 | كتابة عدد ناطق على الشكل $\frac{a}{b}$ أو $-\frac{a}{b}$ بمقام موجب ($a$ و $b$ طبيعيان)، والتعرّف على الكتابات المتساوية لنفس العدد الناطق | **Meaning sharpened.** The SIGN rule of a quotient (−a/b = a/−b = −(a/b), (−a)/(−b) = a/b) is `qismat-nisbiyayn` P3 (unit 1 README owner question 2: unit 1 owns it). Here the sign is RECALLED and used. What is new is « a rational has many writings, one point »: the standard form with a positive denominator, reduced. |
| P3 | تمثيل أعداد ناطقة على مستقيم مدرّج، ومقارنتها وترتيبها بكتابتها بنفس المقام الموجب وبقواعد مقارنة الأعداد النسبية | Names the method (the book's طريقة p. 29). Comparing through the sign of a difference stays `muqaranat-natiqayn` (unit 4). |

**Review items for « أستعدّ »:**

| Item | Text | Home | Status |
|---|---|---|---|
| `1am.m5.r01` | التعرّف في حالات بسيطة على الكتابات الكسرية لعدد. | `hasil-qisma-kasr` (1AM) | **available** → « تذكّر — السنة الأولى » box WITH link (`getLessonPath('hasil-qisma-kasr')`) |
| `3am.m1.r02` | حساب حاصل قسمة عددين نسبيين. | `qismat-nisbiyayn` (3AM unit 1) | published before this unit → « تذكّر — حاصل قسمة عددين نسبيين » box WITH link |

Extra `priorKnowledge`, allowed:
- `muqarana-nisbiya-2am` (order of relative numbers; `muqarana-nisbiya` is published);
- `tawhid-maqamat-3am` (`tasawi`).

**noRebuild:** none from the net. But the sign rule (unit 1), decimal or not / approximation (1AM) and the order of relatives (2AM) are
all recalled, never rebuilt.

**pointPrerequisites** (net links `1am.m5.r01 → 3am.m1.r07` and `3am.m1.r02 → 3am.m1.r07`):
- P1 ← `1am_hasil-qisma-kasr_P1` (a/b is the quotient a ÷ b) — allowed, published;
- P2 ← `3am_qismat-nisbiyayn_P3` (the three equal writings) — only if published with that meaning;
- intra-lesson: P2 ← P1, P3 ← P2.
- No edge toward `tasawi` (no net link r05 → r07).

**Where it is used next:**
- `amaliyat-natiqa` (r07 → r08);
- 3AM unit 4 `muqaranat-natiqayn` and `qimat-ibara-harfiya` (values like x = −2/3);
- unit 5 (solutions like x = −7/3);
- **4AM `natiqa-ghayr-natiqa` starts from this definition** (√2 is not a/b);
- 4AM `muadalat-x-murabba`, `jidhr-tarbii`;
- the affine function at rational inputs;
- coordinates in a frame (4AM unit 12).

## 3. Boundary

**Owns:**
- the rational a/b, a and b relative, b ≠ 0;
- the inclusions ℕ ⊂ relative integers ⊂ relative decimals ⊂ rationals — in words, NO set symbols ℕ, ℤ, 𝔻, ℚ (they belong to the
  lycée; the book does not use them);
- standard form with a positive denominator, reduced;
- recognising equal writings;
- placing on a graduated line (thirds, quarters, sixths, twelfths);
- comparing and ordering signed fractions by a common positive denominator + the order of relative numbers;
- writing a rational as an integer + a fraction smaller than 1 (17/5 = 3 + 2/5);
- the largest integer smaller than a rational (`deep-56`).

**Leaves:**
- the sign rule of a quotient (unit 1);
- decimal or not and approximate values (1AM, used in exercises such as `ex-25`, `self-4`);
- operations on rationals (`amaliyat-natiqa`);
- comparing through a difference (`muqaranat-natiqayn`);
- irrationals and π (4AM `natiqa-ghayr-natiqa`): the book's line « π عدد غير ناطق » is NOT posed (scope conflict, recorded in the
  extraction).

## 4. Textbook analysis

| Element | What it asks | Idea to keep | Platform use |
|---|---|---|---|
| `act-5` ① | decimal or not; approximate values | 1AM recall | « أستعدّ » / أتمرّن item 1 (own numbers) |
| `act-5` ①ب–د | signs of quotients; why −24/−32 = 24/32; −a/−b = a/b | the sign rule (unit 1) | recalled in a « تذكّر » box; the lab shows it (a card (−9)/(−12) slides to the positive side) |
| `act-5` ② | place −2/3 and −4/6 on a line: what do you notice? | two writings, one point | **The idea of the entry**, but as a PASSIVE copy exercise it gives the answer by drawing. The lab makes the student HANG writings and see them fall on one peg. |
| `act-5` ③ | equal rationals among seven | writings | M2 lab world `writings` (own cards) |
| `act-5` ④ | order six rationals with the line | order | advanced level `a1` (own numbers) |
| `know-5` | definition, examples, π | wording | معارف, rewritten; π dropped (4AM) |
| `method-10` | compare −5,7/9 and −3,9/6 over 18 | a common denominator for signed decimals-in-fractions | طريقة (own: −4,9/6 vs −3,5/4 over 12) |
| `ex-22`…`ex-26` | classify, write a/b, signs, approximations to 0,01, integer + fraction | P1, P2 practice | أتمرّن items 2–5 + bank |
| `ex-27`…`ex-33` | compare, equality, calculator, order, line | P3 practice | أتمرّن items 6–8 + bank |
| `self-4` | approximation of 39/17 to 0,001 (2,294) | 1AM skill | bank L1 (adapted) |
| `self-9`, `self-10` | compare 12,2/(−7,6) and −5,4/3,17; −3/7 against −5/7, −1/7, −3/8 | P3 | أتمرّن item 7 + test register |
| `deep-56` | why 41/9 is not decimal; the largest natural smaller; integer + fraction | P1 + integer part | أتمرّن item 5 |
| `deep-69` | place −1/5 on a line marked at −1/4 and −1/6 | thinking about a line | أتمرّن item 8 (own: −1/3 between −1/2 and −1/6) |

## 5. Design

**The lesson in one paragraph.** A rational number is ONE point of the line with MANY names. Hang the cards 6/(−8), (−3)/4 and
(−9)/(−12) on the number line:
- the first two fall on the same peg, −3/4;
- the third, made of two negatives, falls on the POSITIVE side, at 3/4 (the sign rule of unit 1, seen).

−7/3 has no exact decimal writing (−2,333…). It still has an exact place between −3 and −2, at 28 twelfths to the left of zero. **The
quotient of two relative numbers (b ≠ 0) is a number: a rational.** Its standard name has a positive denominator and is reduced (−3/4,
7/3). Every natural (2 = 2/1), relative integer (−3 = −3/1) and relative decimal (−1,5 = −3/2) is rational. To ORDER rationals, write
them with the same positive denominator and use the order of relative numbers: −7/4 = −21/12 < −8/12 = −2/3. To the left of zero, the
number farther from zero is the smaller one.

**Entry point — candidates compared:**
- (a) **The book's نشاط 5** (decimal-or-not lists, signs, then a line to draw on): it opens with what 1AM already did (decimal or not),
  and the line comes third. Rejected as the entry; split into applications.
- (b) **A rate replay (temperatures, signed hours)**: honest for −7/3 (a quotient of relatives with meaning), but unit 1's
  `elevator-reel` already scrubs a SIGNED TIME with a speed. Rejected (DNA §12 against the sibling).
- (c) **Code wheels for the missing factor** (b × q = a): that is unit 1's `code-lockers`. Rejected.
- (d) **Hanging WRITINGS on a number line**: the hand places a card where it believes the number lives. The card then slides to its true
  peg, and equal writings stack on ONE peg. The point « many names, one number » becomes visible, and so do the sign of (−a)/(−b) and
  the order of negatives. **Chosen.** `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'clothesline' }`.

**Order of ideas:**
1. writings of one number fall on one peg; two negatives land on the positive side (P2, the unit-1 rule recalled);
2. −7/3: a number with an exact place but no exact decimal → the rational (P1);
3. the standard form (positive denominator, reduced) (P2);
4. inclusions: 2, −3, −1,5 are rationals (P1);
5. order and placement with a common positive denominator (P3);
6. معارف: the definition, the inclusions, the standard form; « تذكّر » (1AM, unit 1);
7. طريقة: write with a positive denominator, compare, place; an integer + a fraction;
8. أتمرّن, three مسائل, the test.

**Contexts:**
- the courtyard « number line » for the school's maths day (pegs, cards, a wind that moves the cards);
- winter cooling in Sétif, Batna and Khenchela (rates of change);
- a diver's descent;
- the level of the Beni Haroun dam (care for water).

## 6. Lab — `number-line-pegs` « حبل الأعداد » (new type)

**Drawn world `clothesline`** (new theme, kind `objects`, shows « حبل مشدود في ساحة المدرسة بين عمودين، عليه ملاقط وبطاقات أعداد »):
- a rope strung between two painted poles in the school courtyard for « يوم الرياضيات »;
- fixed wooden tags at the integers −4 … 4 (zero a little larger, the negative side painted cool blue, the positive side warm orange
  — always together with the « − » / « + » signs, never colour alone);
- small clothes-pegs ride along the rope;
- a basket on the ground holds the CARDS: each card a writing a/b in a KaTeX LTR island (« $\frac{-9}{-12}$ »);
- KidFigure Nour (hijab, tunic) holds the basket and reacts (`wonder` when two cards stack, `proud` on a correct order).

**The variable in the hand: the POSITION where a card is hung** (a rational x; at مبتدئ the drop snaps to 1/12; at متقدم it is
continuous).

**Gesture:**
- **carry a card from the basket and hang it on the rope**: drag; or tap the card then tap the rope; keyboard: Tab to a card, Enter to
  take, ← → to move by 1/12 (Shift ± 1), Enter to hang;
- while dragging, a magnifier loupe (×3) over the finger shows the twelfth ticks near it (مبتدئ only);
- « تحقّق » (or the last card hung) lets the wind act: every card slides along the rope to its TRUE peg (animated; reduced motion: it
  jumps).

**What the world shows (never the rule):**
- each card's slide distance written in twelfths on a small tag (« تحرّكتْ 6/12 نحو اليمين »);
- equal writings STACK on one peg, with a counter « 3 بطاقات على الملقط نفسه »;
- a card's standard writing appears under it once it has landed (« $-\frac34$ »);
- a card that was hung on the wrong SIDE of zero crosses zero with a little swing. That is where the student SEES the sign she missed;
- the true peg for −7/3 shows a decimal readout « −2,333… » that keeps scrolling (it never ends) next to the exact « $-\frac73$ ».

**Opening (no title):**
- Context: « في سلّة نور بطاقات مكتوب على كل منها حاصل قسمة، والحبل مدرّج بالأعداد الصحيحة. »
- Question: « علّق كل بطاقة حيث تظنّ أنّ عددها يقع، ثم اضغط « تحقّق » وانظر أين تستقرّ البطاقات. »
- `lead`: « كل بطاقة عددٌ واحد، مهما كانت كتابته. »

**Levels** (same `objective` on both):

*مبتدئ* (1/12 snap, loupe, the wind after each card):

| id | Cards | End state (true pegs, in twelfths) | Shows |
|---|---|---|---|
| `w1` | $\frac{6}{-8}$ , $\frac{-3}{4}$ , $\frac{3}{4}$ , $\frac{-9}{-12}$ | −9, −9, +9, +9 → two stacks | equal writings; (−a)/(−b) on the positive side |
| `w2` | $\frac{-7}{3}$ , $\frac{7}{-3}$ , $\frac{-14}{6}$ , $\frac{14}{6}$ | −28 (three cards), +28 | a non-decimal rational has an exact place between −3 and −2 |
| `w3` | $-1{,}5$ , $2$ , $\frac{-20}{-8}$ , $-3$ | −18, +24, +30, −36 | decimals and integers hang like any rational; (−20)/(−8) = 5/2 |

*متقدم* (no ticks between integers, no loupe; ALL cards hung first, then one « تحقّق »; the verdict needs the right ORDER, and each card in
its right unit interval):

| id | Cards | Expected order | Twelfths |
|---|---|---|---|
| `a1` | −7/4, 5/6, −2/3, −13/6, 3/2, −1/12 | −13/6 < −7/4 < −2/3 < −1/12 < 5/6 < 3/2 | −26, −21, −8, −1, 10, 18 |
| `a2` | $\frac{9}{-4}$ , $\frac{-11}{4}$ , $\frac{-10}{4}$ | −11/4 < −10/4 < −9/4 | −33, −30, −27 |
| `a3` | $\frac{15}{-20}$ , $\frac{-6}{8}$ , $-\frac56$ | the first two on ONE peg (−9), −5/6 just left (−10) | |

**« جرّب أعدادك » (always open):**
- type a writing a/b (integers, |a| ≤ 48, 1 ≤ |b| ≤ 12, decimals with one digit allowed in a) and it joins the basket;
- b = 0 is refused: « لا يوجد عدد مضروب في 0 يعطي هذا البسط: القسمة على 0 مستحيلة »;
- a card outside −4…4 is refused with « خارج الحبل ».

**LabCoach:**
1. `card`: « اسحب بطاقة من السلّة إلى الحبل. »
2. `loupe` (مبتدئ): « حرّك البطاقة ببطء: العدسة تُريك التدريجات الصغيرة. »
3. `check`: « اضغط « تحقّق » لتهبّ الريح وتستقرّ كل بطاقة في مكانها الحقيقي. »
4. `stack` (first stack): « بطاقتان على ملقط واحد؟ اقرأ كتابتيهما. »
5. `free`: « اكتب بطاقتك في « جرّب أعدادك ». »

**Wrong moves made VISIBLE:**
- « two negatives give a negative » ((−9)/(−12) hung on the left → it crosses zero);
- −7/3 hung between −2 and −1 (« −2 then a third ») → it slides left past −2;
- ordering negatives by distance (−9/4 hung left of −11/4) → the cards swap;
- « different writings are different numbers » → a stack;
- « 14/6 ≠ 7/3 because they look different » → the same peg.

**Discovery** (after w1 and w2):
- Question: « ماذا تقول البطاقات المكدّسة على ملقط واحد؟ »
- Right: « إنّها كتابات مختلفة للعدد نفسه ».
- Wrong:
  - « إنّ الريح خلطتها » (refuted: the wind stacks only equal values — try (−3)/4 and 3/4);
  - « إنّ لها البسط نفسه » (refuted: 6/(−8) and (−3)/4 stack although their numerators are 6 and −3).

The formal phase names: a rational number; the standard writing; the order.

**Core maths:**
- `fractions3.js` (L4 row): `normalize`, `writingsEqual`, `isDecimalRational`, `twelfths`, `integerAndFraction`, `sortRationals`;
- lab logic `logic/numberLinePegs.js`: `hang(state, card, x)`, `settle(state)` → `{ moves[], stacks[] }`, `verdictOrder(state)`,
  `coachOf`, `report` events:
  - `{ kind: 'hang', task, card, x }`;
  - `{ kind: 'settle', task, moves: [{ card, from, to, crossedZero }], stacks }`;
  - `{ kind: 'order', task, ok }`;
  - `{ kind: 'custom' }`;
  - `{ kind: 'solved', task }`.

**Why not another lab (DNA §12):**
- `zero-probe` (2AM): the hand holds the DISTANCE to zero of a probe on a cable; the sign is a consequence.
- `ruler-compare` (1AM): the hand holds a decimal graduation to separate two lengths.
- `pin-rails` (3AM): a pin slides on a column rail to a table value; a ruler on two nodes.
- Here the hand CARRIES a WRITING and commits a POSITION (a prediction, DNA §16.3). The wind's slide is the refutation, and the STACK of
  different writings on one peg is the new mathematics. No probe, no graduation choice, no ruler.
- Against the unit-1 siblings: no timeline (`elevator-reel`), no code wheels (`code-lockers`). `robot-track` carries factor cards onto
  a floor mat to build a product. Here the cards are numbers hung on a line, and the variable is their position.

**Screen budget:**
- 1024×768 with the sidebar: the rope spans the column (−4…4 over ≈ 440 px → 55 px per unit, 4,6 px per twelfth). That is why the
  loupe exists at مبتدئ: the loupe circle is ≈ 120 px and stays above the finger, never under it.
- Per task the visible range may narrow (w1: −2…2, ≈ 110 px per unit). Size the cards to ≥ 44 px tall. The basket is under the rope;
  « جرّب أعدادك » in one row under the basket, always open.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق من الكتابة الكسرية لحاصل قسمة ومن حاصل قسمة عددين نسبيين »:

| # | Statement | Key | Item |
|---|---|---|---|
| 1 | $\frac34=0{,}75$ | ✓ | 1am.m5.r01 |
| 2 | $\frac73=2{,}33$ | ✗ (2,33 is an approximate value) | 1am.m5.r01 |
| 3 | $15\div4=\frac{15}4$ | ✓ | 1am.m5.r01 |
| 4 | $(-18)\div3=-6$ | ✓ | 3am.m1.r02 |
| 5 | $12\div(-4)=3$ | ✗ (−3) | 3am.m1.r02 |
| 6 | rewritten `prep` 12: $(-9)\div(-2)=4{,}5$ | ✓ | 3am.m1.r02 |
| 7 | rewritten `prep` 8: $-11<-8$ | ✓ | order of relatives (extra) |

**M1 نشاط — « حبل الأعداد »** — `objectives`: « أكتشف أنّ حاصل قسمة عددين نسبيين عددٌ له مكان على المستقيم وكتابات كثيرة ». Lab on top; then:
1. Evidence « في w1 استقرّت $\frac{-9}{-12}$ عند … ». Q: « في أيّ جهة من الصفر استقرّت؟ لماذا؟ » (choice) → « الموجبة: حاصل قسمة عددين
   سالبين موجب ». Distractors: « السالبة: فيها إشارتان سالبتان »; « على الصفر ».
2. Q (w2): « بين أيّ عددين صحيحين استقرّت $\frac{-7}3$ ؟ » → −3 and −2. « هل لها كتابة عشرية تامّة؟ » → no: −2,333… « أتوقّع القاعدة »
   (« حاصل قسمة عدد نسبي على عدد نسبي غير معدوم هو… »), then brick `adad-natiq` (definition).
3. Q: « اكتب $\frac6{-8}$ بمقام موجب وعلى أبسط شكل » → −3/4. Brick `maqam-mujab` « كل عدد ناطق يُكتب $\frac ab$ أو $-\frac ab$ بمقام موجب ».
4. Q (a1, or the statement if a1 was skipped): « رتّب تصاعديًا: $-\frac74$ ، $-\frac23$ ، $\frac56$ » → −7/4 < −2/3 < 5/6 (−21/12, −8/12,
   10/12). « أتوقّع القاعدة », then brick `tartib-natiqa` « نكتب الأعداد بنفس المقام الموجب ثم نقارنها كأعداد نسبية ».

**M2 معارف** — `objectives`: « أسمّي العدد الناطق وكتابته المعيارية وأعرف أنّ الأعداد العشرية النسبية ناطقة ».
- Opens on the lab ALONE (`levels={false}`, world `writings`): cards $\frac{15}{-20}$ , $\frac{-6}8$ , $\frac3{-4}$ , $\frac{-12}{16}$ ,
  $\frac34$ → four on −3/4, one on 3/4.
- Questions:
  1. « كم بطاقة على الملقط نفسه؟ » → 4;
  2. « ما الكتابة على أبسط شكل بمقام موجب؟ » → −3/4.
- Boxes, platform words:
  - the definition;
  - « كل عدد صحيح نسبي وكل عدد عشري نسبي عدد ناطق: $-3=\frac{-3}1$ ، $-1{,}8=-\frac{18}{10}=-\frac95$ »;
  - the standard form;
  - « تذكّر — حاصل قسمة عددين نسبيين » (link, unit 1): $\frac{-a}b=\frac a{-b}=-\frac ab$ , $\frac{-a}{-b}=\frac ab$;
  - « تذكّر — السنة الأولى » (link, `hasil-qisma-kasr`): $\frac{15}{11}$ is not decimal, ≈ 1,36.
- Examples: $\frac{-28}{15}=-\frac{28}{15}$ ; $\frac{14}{-21}=-\frac23$ ; $\frac{-24}{-32}=\frac34$.

**M3 طريقة** — `objectives`: « أكتب عددًا ناطقًا بمقام موجب وأقارن عددين ناطقين وأمثّلهما ». Steps:
1. Standard form: $\frac{14}{-21}=-\frac23$ ; $\frac{-3{,}6}{-8}=\frac{3{,}6}8=\frac{36}{80}=\frac9{20}$.
2. Compare (method-10 redesigned): $\frac{-4{,}9}6$ vs $\frac{-3{,}5}4$ → the same denominator 12: $\frac{-9{,}8}{12}$ vs $\frac{-10{,}5}{12}$ →
   $-10{,}5<-9{,}8$ → $\frac{-3{,}5}4<\frac{-4{,}9}6$. Q « أيّ العددين أبعد عن الصفر؟ ».
3. Place on a line in sixths: $-\frac56$ , $-\frac32=-\frac96$ , $\frac23=\frac46$ , $\frac76$ → order −3/2 < −5/6 < 2/3 < 7/6.
4. Integer + fraction: $\frac{17}5=3+\frac25$ ; $\frac{41}9=4+\frac59$ (the largest natural smaller than 41/9 is 4).

Method box: « لمقارنة عددين ناطقين: نكتبهما بمقام موجب مشترك، ثم نقارن البسطين حسب قواعد مقارنة الأعداد النسبية ».

**M4 أتمرّن** — `objectives`: « أتعرّف على الأعداد الناطقة وأكتبها وأرتّبها »:

| # | Statement | Answers | cites |
|---|---|---|---|
| 1 | أيّ حواصل القسمة عشرية: $4$ ، $-3$ ، $\frac{-7{,}4}5$ ، $\frac56$ ، $\frac{13}4$ ، $-\frac58$ ، $\frac73$ ؟ أعطِ قيمة مقرّبة إلى 0,01 للأخرى؛ وحدّد إشارة $\frac{-21}{-28}$ ، $\frac{-30}{12}$ ، $\frac{16}{-20}$ | decimal: 4, −3, −1,48, 3,25, −0,625; not: 5/6 ≈ 0,83, 7/3 ≈ 2,33; signs + (3/4), − (−5/2), − (−4/5) | `act-5` |
| 2 | صنّف: $\frac{12}{-4}$ ، $\frac{4{,}5}9$ ، $\frac{11}7$ ، $0{,}6$ ، $-3{,}25$ ، $\frac{18}6$ | −3 relative integer · 1/2 = 0,5 decimal · 11/7 rational, not decimal · 0,6 decimal · −3,25 decimal · 3 natural | `ex-22` |
| 3 | اكتب على الشكل $\frac ab$ أو $-\frac ab$ ($a$ ، $b$ طبيعيان): $-0{,}35$ ، $\frac{1{,}5}6$ ، $\frac{-3{,}6}{0{,}4}$ ، $\frac{2{,}4}{1{,}6}$ | −7/20 · 1/4 · −9 · 3/2 | `ex-23` |
| 4 | إشارة: $\frac{-15}{-35}$ ، $\frac{-7{,}2}{-4{,}8}$ ، $\frac9{-11}$ ، $\frac{-1{,}4}5$ | + · + · − · − | `ex-24` |
| 5 | اكتب مجموع عدد طبيعي وكسر أصغر من 1: $\frac{17}5$ ، $\frac{23}6$ ، $\frac{41}9$ ؛ لماذا $\frac{41}9$ ليس عشريًا؟ | 3 + 2/5 · 3 + 5/6 · 4 + 5/9; 9 = 3 × 3 has a factor other than 2 and 5 | `ex-26`, `deep-56` |
| 6 | قارن $-\frac7{12}$ و $-\frac58$ ؛ رتّب تصاعديًا $-\frac74$ ، $1{,}3$ ، $-\frac32$ ، $\frac95$ ، $-2$ (بالمقام 20) | −5/8 < −7/12 · −2 < −7/4 < −3/2 < 1,3 < 9/5 | `ex-27`, `ex-30`, `ex-31`, `ex-33` |
| 7 | قارن $\frac{10{,}5}{-7}$ و $\frac{-4{,}5}3$ ؛ صحيح أم خطأ: $-\frac29<-\frac19$ ، $-\frac29>-\frac27$ | equal (−1,5) · ✓ · ✓ | `self-9`, `self-10`, `ex-28` |
| 8 | على مستقيم عُلّم فيه $-\frac12$ و $-\frac16$ ، أين يقع $-\frac13$ ؟ | exactly midway (−3/6, −2/6, −1/6) | `deep-69`, `ex-32` |

**M5 مسألة 1 (`lessonProblem`)** — « أيّ مدينة بردت أسرع؟ »:
- Statement: « في ليلة شتوية نزلت الحرارة بانتظام: في سطيف من 3° إلى −4° في 3 ساعات، وفي باتنة من 1° إلى −8° في 4 ساعات، وفي خنشلة من
  0° إلى −13° في 6 ساعات. »
- Questions and answers:
  1. « اكتب تغيّر الحرارة في الساعة لكل مدينة عددًا ناطقًا بمقام موجب » → −7/3, −9/4, −13/6;
  2. « رتّبها تصاعديًا » → −7/3 < −9/4 < −13/6 (−28/12, −27/12, −26/12);
  3. « أيّ مدينة بردت أسرع؟ » → Sétif.
- Illustration `tags` (three cities).

**M6 مسألة 2** — « الغوّاص »:
- Statement: « نزل غوّاص 20 m في 6 دقائق بانتظام. »
- Questions and answers:
  1. « اكتب تغيّر العمق في الدقيقة عددًا ناطقًا على أبسط شكل » → −10/3;
  2. « بين أيّ عددين صحيحين يقع؟ » → −4 and −3;
  3. « هل هو عدد عشري؟ أعطِ قيمته المدوّرة إلى 0,01 » → no; −3,33.

**M7 مسألة 3** — « سدّ بني هارون »:
- Statement: « انخفض منسوب السدّ 7 cm في 4 أيام، ثم ارتفع 5 cm في 6 أيام. »
- Questions and answers:
  1. « اكتب التغيّر اليومي في كل فترة » → −7/4 and 5/6;
  2. « أيّ التغيّرين أبعد عن الصفر؟ » → −7/4 (21/12 > 10/12);
  3. « رتّب: $-\frac74$ ، $\frac56$ ، $0$ ، $-\frac32$ » → −7/4 < −3/2 < 0 < 5/6.

**M8 إختبار أولي:**

| # | Prompt | Key | Distractors |
|---|---|---|---|
| 1 | أيّ عدد يساوي $\frac9{-12}$ ؟ | $-\frac34$ | $\frac34$ (MISC-NATIQ-DROPSIGN) · $\frac43$ · $-\frac{12}9$ (MISC-NATIQ-INVERT) |
| 2 | $\frac{-14}{-6}=$ | $\frac73$ | $-\frac73$ (MISC-NATIQ-TWONEG) · $-\frac37$ · $\frac37$ |
| 3 | يقع $-\frac{11}4$ بين | $-3$ و $-2$ | $-2$ و $-1$ (MISC-NATIQ-NEGPLACE) · $2$ و $3$ (DROPSIGN) · $-4$ و $-3$ |
| 4 | الترتيب التصاعدي لـ $-\frac56$ ، $-\frac34$ ، $-\frac23$ | $-\frac56<-\frac34<-\frac23$ | $-\frac23<-\frac34<-\frac56$ (MISC-NATIQ-NEGORDER) · $-\frac34<-\frac56<-\frac23$ |
| 5 | أيّ عدد ليس عشريًا؟ | $\frac5{12}$ | $\frac78$ · $-\frac9{20}$ · $-\frac{13}{25}$ (MISC-NATIQ-NEGNOTDEC: « a negative fraction is not decimal ») |

## 8. Misconceptions (`MISC-NATIQ-*`)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `DROPSIGN` | the sign of a numerator or denominator can be dropped | the card crosses zero | tests 1, 3; L1 |
| `TWONEG` | (−a)/(−b) is negative | w1 | test 2; L1, L2 |
| `NEGPLACE` | −11/4 lies between −2 and −1 | w2-type slide | test 3; L2 |
| `NEGORDER` | among negatives, the larger distance is larger | a2 swap | test 4; L1–L3 |
| `WRITINGS` | different writings are different numbers | the stack | L1, L2 |
| `NOTANUMBER` | a non-decimal quotient is « not a number » / not exact | w2's exact peg | L2 (برّر) |
| `NEGNOTDEC` | a negative fraction cannot be decimal | M4 item 1 | test 5 |
| `INVERT` | the standard form flips the fraction | — | test 1 |

## 9. Practice bank (`content/practice/3am/adad-natiq/`)

**Corpus:** `3am.m1.r07` is a GAP — 1 exercise: `3am-s1-109` ex 2 (« bring the result to a natural / relative integer »; dup
`3am-s1-114`). The compute exercises of r04 / r06 / r08 often end with « اكتب الناتج على شكل كسر غير قابل للاختزال »: their
writing-with-a-positive-denominator step is a P2 exercise in the same register.

**Honest count of FAITHFUL `term_exam`: 1** (maybe 2 counting the final step of `3am-s1-104` ex 2 ③ « قارن K و E », with K and E
given). EXAM_PATTERN §6 « item en lacune »: generate 100 % from the term-1 model → `platform_addition`, `reason: "term_exam_modelled"`,
`modelledOn: "3am-s1"`, badge « على منوال اختبار الفصل الأول ». Earlier batches shipped 7–8 faithful for gap items. Here, fewer: say so
in the report.

| Level | Content | Provenance |
|---|---|---|
| L1 | standard form; sign; classify; decimal or not (1AM used) | 8 modelled · 2 adapted (`ex-24`, `self-4`) |
| L2 | compare two rationals then « برّر »; « is (−9)/(−12) negative? » | 1 term_exam (`3am-s1-104` ex 2 ③) · 7 modelled · 2 adapted (`self-9`, `self-10`) |
| L3 | full exercise: write, place on a line (GeoFigure line), order 5–6 rationals, an integer + fraction | 8 modelled · 2 adapted (`ex-32`, `ex-26`) |
| L4 | mobilises `tasawi` / `jam-tarh` / unit 1: a quotient of relatives → its standard form → compare with a fraction | 1 term_exam (`3am-s1-109` ex 2) · 9 modelled |
| L5 | « الوضعية الإدماجية »: rates of change (temperatures, dam, diver) written as rationals, ordered, a decision (which is fastest, is it safe) | 10 modelled |

**Answer types:**
- `rational` (key in standard form, `requiredForm: 'irreducible'` when asked);
- `choice` for orders and intervals;
- `selfCheck` for « برّر ».

Lines are `GeoFigure` data (an axis with ticks), never images.

**Oracle:** `scripts/practice-oracle/adad-natiq.mjs`. It normalizes every writing (BigInt, own gcd), re-parses every order chain and
checks it sorted, checks every interval, and checks every « decimal? » key by the 2^i5^j test.

## 10. Risks & owner questions

1. **P2's meaning change** (README owner question 4; agreed with the unit-1 planner's question 2).
2. **« Integer + fraction smaller than 1 » for a NEGATIVE rational is ambiguous** (−17/3 = −5 + (−2/3) or −6 + 1/3: both fractions are
   « smaller than 1 »). The plan poses this skill on POSITIVE rationals only (17/5, 23/6, 41/9). The book's `ex-26` (−17/3, −2/7, −47/3)
   is cited by an adapted bank item that accepts both answers as `multiChoice`. Owner: which convention?
3. **π is not posed** (scope: 4AM). The extraction records the scope conflict on `know-5`.
4. **The loupe** is a new reusable component idea. Build it inside the lab first. Promote it to `primitives/` only if a second lab needs
   it (document it then).
5. **Gap item:** the bank's faithful share will be about 1–2 sheets.

## 11. Generator checklist

- [ ] `build-extraction.py`: re-read L4's elements (pp. 23, 25, 28, 29, 31, 33, 34), `verified: True`, asserts, module numbers, the π scope
  note; rebuild.
- [ ] `fractions3.js`: L4 functions + tests.
- [ ] Lab `number-line-pegs`:
  - type, theme `clothesline`, registry, `levels.js`, strings `lesson.manipulation.json › numberLinePegs`;
  - `logic/numberLinePegs.js` + test: each task via `coachOf`; stacks; zero crossings; the order verdict; b = 0 refusal;
  - render test;
  - contract section + DNA row;
  - screenshots (initial, a card mid-drag with the loupe, the wind slide, a stack of three, the advanced order verdict, the formal
    phase) at the five sizes — reviewed.
- [ ] Lesson:
  - 9 modules, header, knowledge map;
  - two « تذكّر » boxes with links (1AM, unit 1);
  - « أستعدّ » measures `1am.m5.r01` and `3am.m1.r02`;
  - `pointPrerequisites` P1 ← `1am_hasil-qisma-kasr_P1` (+ P2 ← `3am_qismat-nisbiyayn_P3` if valid);
  - `content.test.js` (BigInt normalization, order chains, FINAL literals).
- [ ] `generate:lesson-index`, `generate:learning-net` (the new cross-year LP edge appears in the map);
  `apps/web/e2e/lesson-kit/3am-kusur-natiqa-adad-natiq.mjs` + coach / retrofit blocks.
- [ ] Gates: `npm test`, `validate:lessons`, `check:textbook`, `check:lessons`, `build`.
- [ ] Bank (50, mostly modelled — state the gap in the report) + oracle + JSON entries.
- [ ] Publish (guide §11, coordinator).

## 12. Generator notes (2026-10-26)

Generated from this plan. Fixes and decisions, none a redesign:
1. **The plan's `self-9` line was wrong** (extraction): `12,2/−7,6 ≈ −1,605` and `−5,4/3,17 ≈ −1,703` are DIFFERENT, so the printed option (جـ) « −5,4/3,17 > 12,2/−7,6 » is false and only (أ) « ≠ » is right. `ex-27` has SIX pairs (one of them, −18/45 and −14/35, is an EQUAL pair) and `ex-28` three; both were re-read at 230 dpi and recorded in `discrepancies`.
2. **Advanced snap.** « Continuous » drop is a 1/48 step (`SNAP_ORDER`): the verdict is exact (unit interval + order of DISTINCT values; two equal writings need not be hung at the same x). a3's « first two on ONE peg » is therefore seen after « تحقّق » (the wind), not demanded of the hand.
3. **Wind timing.** The wind acts when « تحقّق » is pressed on the cards already hung (not after each card): finer than the plan's « after each card », same effect, and a card hung on its true peg « stays » (`ثابتة`). The discovery opens when w1–w3 are all done (not after w2).
4. **Slide tag / chip.** One chip per pile (the front card: standard writing, `×n`, slide in twelfths) — the plan's one tag per card overlapped at a stack. The decimal readout « −2,333… » (non-decimal values, مبتدئ only, at most two) is a static 3-digit prefix with a pulsing ellipsis, not a scrolling strip.
5. **Order stays positive-only for « integer + fraction ».** The unit's open question (plan §10, risk 2) is unchanged: M3 and `ex-26` use positive rationals; the bank's `l3-006` accepts both readings of a negative.
6. **π not posed**, **no set symbols**, all numbers in M0–M8 are the platform's own; the book's `method-10` (−5,7/9 vs −3,9/6) is replaced by (−4,9)/6 vs (−3,5)/4.
7. **Bank** (helper): 2 `term_exam` (modelled on `3am-s1-104` ex 2 ③ and `3am-s1-109` ex 2), 40 `term_exam_modelled`, 8 textbook-adapted; `ex-25`, `ex-29`, `self-4` are cited only by the bank. Two extra misconceptions: `MISC-NATIQ-DECIMAL`, `MISC-NATIQ-APPROX`.
8. **Catalogue.** `durationMinutes` 65 (modules without مسائل; 89 with them), `pointPrerequisites` P1 ← `1am_hasil-qisma-kasr_P1`, P2 ← `3am_qismat-nisbiyayn_P3` + `3am_adad-natiq_P1`, P3 ← `3am_adad-natiq_P2`; the three draft الكفاءات reworded as §2 proposes.
