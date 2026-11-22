# Plan — `qismat-nisbiyayn` « حاصل قسمة عددين نسبيين » (3AM unit 1, lesson 3 of 3 + synthesis)

## 1. Identity

- **Code** `qismat-nisbiyayn` · **title** « حاصل قسمة عددين نسبيين » · **unit** `aadad-nisbiya` · catalogue `order: 2`.
- **Folder** `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/aadad-nisbiya/qismat-nisbiyayn/`.
- **Textbook** (book p. = PDF − 1): نشاط 4 p. 9 « حاصل قسمة أعداد نسبية » (①② missing factors, ③ the sign of Q); معارف p. 12
  « قاعدة الإشارات » (know-8), « حساب حاصل القسمة » (know-9: a/b × b = a), « تنظيم وتبسيط حساب » (know-10); طرائق p. 13 « تعيين إشارة
  حاصل قسمة » (method-5), « حساب حاصل القسمة » (method-6), دوري الآن ① ② (now-13); exercises 15, 16, 21–28, 30–33 (pp. 15–16), أؤكّد
  8–11 (p. 17), أتعمّق 36, 40, 41, 45, 47, 48, 50, 52 (pp. 18–19), أستعدّ items 12, 13 (p. 7), the ICT page p. 21 (calculator).
- **Seeds the unit: no.** Moves its own destinations in `build-extraction.py`, `verified: True`.

## 2. Programme & net

- **Item** `3am.m1.r02` « حساب حاصل قسمة عددين نسبيين. »
- **Draft الكفاءات** (verbatim):
  1. ربط القسمة بالضرب: $a\div b=q$ معناه $b\times q=a$ مع $b\neq 0$
  2. تعيين إشارة حاصل قسمة عددين نسبيين بقاعدة الإشارات
  3. حساب حاصل قسمة عددين نسبيين ومعرفة أن $\frac{-a}{b}=\frac{a}{-b}=-\frac{a}{b}$
  4. تنظيم وتبسيط سلسلة حسابات باحترام أولوية العمليات
- **Proposed final wording** (order kept, `3am_qismat-nisbiyayn_P1…P4`):
  1. **P1** ربط القسمة بالضرب: $a\div b=q$ معناه $b\times q=a$ مع $b\neq0$ ، وإيجاد عامل مجهول في جداء، مثل $(-6)\times q=48$ يعطي $q=48\div(-6)=-8$
     — *the missing factor (ex-15, 16, 27, 30) had no LP; b ≠ 0 is made visible by the lab*.
  2. **P2** تعيين إشارة حاصل قسمة عددين نسبيين بقاعدة الإشارات (موجب إذا كان لهما الإشارة نفسها، وسالب إذا اختلفت إشارتاهما)، وإشارة حاصل قسمة
     جداءين بعدّ العوامل السالبة — *act-4 ③ (sign of Q) and method-5 had no explicit LP*.
  3. **P3** حساب حاصل قسمة عددين نسبيين (عشريًا أو على شكل كسر حين لا يكون عشريًا)، ومعرفة أنّ $\frac{-a}{b}=\frac{a}{-b}=-\frac{a}{b}$ و $\frac{-a}{-b}=\frac{a}{b}$
     — *the book's ملاحظة −a/−b = a/b and « حاصل القسمة يمكن أن يكون عددًا غير عشري » (p. 13) had no LP*.
  4. **P4** تنظيم سلسلة حسابات على الأعداد النسبية وتبسيطها باحترام أولوية العمليات: الأقواس أوّلًا، ثم الضرب والقسمة، ثم الجمع والطرح — *the
     order of the priorities, as the book's know-10 lists them*.
- **pointPrerequisites**: intra `P2 ← P1`, `P3 ← P1`, `P3 ← P2`, `P4 ← P3`; cross-lesson ALONG the net link `3am.m1.r01 → 3am.m1.r02`
  (both lessons published by then): `P1 ← 3am_jidaa-adadayn-nisbiyayn_P4`, `P2 ← 3am_jidaa-adadayn-nisbiyayn_P2`,
  `P2 ← 3am_jidaa-ida-nisbiya_P2` (sign of a quotient of products), `P4 ← 3am_jidaa-ida-nisbiya_P2`.
- **Review items for « أستعدّ »** (`reviewLinksForLesson`): `3am.m1.r01` « حساب جداء عددين نسبيين. » — homes `jidaa-adadayn-nisbiyayn`
  and `jidaa-ida-nisbiya` (PUBLISHED by then → links). **Extra** (not net-linked, README question 1): `2am.m1.r01` priority of
  operations (home `silsila-bidun-aqwas`, 2AM, `coming_soon`), `2am.m4.r06` algebraic sum (home `majmu-jabri`, 2AM, `coming_soon`).
  `priorKnowledge: ['jidaa-nisbi', 'jidaa-ida', 'awlawiya-amaliyat', 'majmu-jabri']`.
- **noRebuild**: none. The two unit lessons are recalled by a « تذكّر » box (linked); the 2AM priority rules by a « تذكّر — السنة
  الثانية » box (no link while unpublished).
- **Where it serves later**: `maqlub-qismat-kasrayn` (r03: the reciprocal), `adad-natiq` (r07: a/b as a rational number) and through
  them `amaliyat-natiqa` (r08) → 4AM `talis-hisab-atwal` / `aksiya-talis` / `inshaat-talis` (4am.m2.r01: ratios with signs and
  quotients); 4AM `aadad-tabiiya-natiqa` (fractions), every 4AM series of calculations (BEM part 1, exercise 1).

## 3. Boundary

Owns P1–P4. Leaves: the name « عدد ناطق », the positive-denominator convention as a rule on rational numbers, comparing / placing
quotients on a line (`adad-natiq`); the reciprocal and « divide = multiply by the reciprocal » (`maqlub-qismat-kasrayn`); sums and
products of fractions (`jam-tarh-kasrayn`, `amaliyat-natiqa`); simplifying a fraction beyond moving the sign (1AM/2AM, used only as
a check). A series here uses integers and decimals; a fraction appears only as the RESULT of a quotient. Letters only as « a, b » in
the property box (the equal writings), never as an expression to expand (`nashr-jabri-3am`).

## 4. Textbook analysis

| Element | What it asks | Idea worth keeping | Platform use |
|---|---|---|---|
| act-4 ①② (p. 9) | 4×… = 32, (−5)×… = 60, 7×… = −28, …×(−3) = −42; write each missing number as a fraction; « what about the quotient of relatives? » | division = the missing factor | **Application** in أتمرّن (E1, own numbers). Rejected as entry: four blanks to fill from memory — the student guesses and nothing answers |
| act-4 ③ (p. 9) | Q = (−3)×(−5)×2×(−1) / ((−1)×8×5×(−5)): sign of numerator, denominator, Q | count negatives above and below | طريقة S2 (own Q) |
| know-8 (p. 12) | sign rule for quotients, « انتبه! سالب ÷ سالب = موجب », −a/−b = a/b; examples 6 ÷ (−3) = −2, −27/−9 = 3 | the same rule as the product | **named** in module 1 after q2 (own examples) |
| know-9 (p. 12) | « a/b is the number such that a/b × b = a »; −5/6 × 6 = −5; 3/−7 × (−7) = 3 | the definition | **named** after q1 + module 2 (fractions) |
| know-10 (p. 12) | priorities; A = 3 − (2×(−5) + 8) = 5 | the layout of a series | طريقة S3–S4 (own series) |
| method-5 (p. 13) | signs of 17/4, −3/7, 5/−9, −38/−23; « a quotient may not be a decimal » | sign before value; non-decimal quotients | module 2 + طريقة |
| method-6 (p. 13) | A = −63 ÷ 7 = −9, B = −54 ÷ (−6) = 9 | two-step method | طريقة S1 (own numbers) |
| now-13 (p. 13) | ① signs of a/b, −a/b, a/−b, −a/−b; ② −0,239 ÷ 100, 0,239 ÷ (−0,0001) | writings; decimal shifts | أتمرّن E4, E5 (own numbers) |
| ex-15, 16, 27, 30 | complete □ in products / quotients | the missing factor | أتمرّن E1 + bank |
| ex-21 | multiplication pyramids with missing cells (needs division) | inverse reasoning | bank (adapted) |
| ex-22…26 | sign without computing; positive quotients; compute 24 quotients | fluency | bank + أتمرّن E2, E3 |
| ex-28 | match equal results (products and quotients) | contrast | bank |
| ex-31 | two relatives with quotient −2, 10, −0,5, −1 | open | bank (open, checked by division) |
| ex-32 | on a line: opposite of −7, product −3×6, quotient −15÷3, square of −2 | the unit's four results | synthesis bank (adapted) |
| ex-33 | priority: A = −0,5×(−2−8)×(−1,7) … D | series | طريقة / أتمرّن E6 + bank |
| self-8…11 | (−25)÷(−5); x×(−3) = −10; a negative ⇒ …; 11 ÷ (−4) writings | QCM | test + bank (self-11 discrepancy, README) |
| deep-36 | −39 is half of …, three times …, opposite of … | inverse operations | bank |
| deep-40 | place brackets so the equality holds | priority | أتمرّن E7 (own) |
| deep-41 | signs of a², a/b, a×b, a+b, a−b for products of 24 / 13 numbers | parity + quotient sign | أتمرّن E8 |
| deep-45 | sequences: ×(−3), ×(−5), ÷(−5), ÷(−4)… | operators | bank (own sequence in أتمرّن E9) |
| deep-47, 48 | complete a multiplicative magic square; blanks | division as missing factor | bank (adapted) |
| deep-50 | n − 11…1 = 9 × … | missing factor in a pattern | bank |
| deep-52 | a « guess » programme ((x+1)×(−2)+2)÷(−4) | a conjecture | مسألة 2 (own programme) |
| ict (p. 21) | calculator keystrokes without brackets; when are brackets needed | priority and brackets | مسألة 3 (own numbers) |
| prep 12, 13 (p. 7) | 13 − 7 + 9 + 5 grouping; (−5)+(−3) as −3 − 5 | algebraic sums | « أستعدّ » statements, rewritten |

## 5. Design

**The lesson in one paragraph.** Dividing a by b means finding the number q that, multiplied by b, gives a — so a quotient inherits
everything the product rule says: its distance is the quotient of the distances and its sign is « + » for equal signs, « − » for
different signs. When no decimal works, the quotient is still a number, written as a fraction, and the minus sign may stand on the
top, on the bottom or in front: the three writings are the same number. Dividing by 0 is impossible: no q gives 0 × q = a ≠ 0.

**Entry point.** Candidates:
- (a) The book's act-4 (four blanks « 7 × … = −28 ») — answered by recall and guessing; nothing resists. Rejected (application).
- (b) Sharing a debt among children (−24 DA among 4 → −6 each) — works only for a POSITIVE divisor: « sharing among −4 children » has no
  meaning. Rejected as entry; its failure is exactly why the definition is needed (mentioned in the lesson.config header).
- (c) **Chosen — the lockers of the municipal library.** Each locker's lock is a rule « $(-6)\times\;?=48$ » and opens only with the code
  q that makes it true. The hand rolls the code wheels (a SIGN wheel and digit wheels); the lock's screen multiplies live. The student
  finds that the distance is 48 ÷ 6 and that the sign must make the product right — the sign rule of division is needed to open the
  door at the first pull. Where no decimal code exists ($(-6)\times\;?=4$), the fraction mode opens with $-\frac{2}{3}$, $\frac{-2}{3}$ AND
  $\frac{2}{-3}$: three keys, one locker.

**Order of ideas.** missing factor = quotient (P1) → the sign of q from the signs of a and b (P2) → decimal quotients (P3) → معارف:
non-decimal quotients and the three writings (P3), division by 0 → طريقة: compute; sign of a quotient of products; series with priorities
(P4) → أتمرّن → مسائل (a week of temperatures, a guessing programme, a calculator without brackets) → test.

**Story contexts** (own): the lockers of the municipal library (« المكتبة البلدية », readers leave their bags; KidFigure « إيناس »
volunteers at the desk); a weather station in Djelfa (minimum temperatures); a « guess my result » game in class; « نسرين »'s calculator.

## 6. Lab — `code-lockers` « خزائن الأمانات »

- **Type** `code-lockers` (free), theme `libraryLockers` (« خزائن الأمانات في المكتبة البلدية: لكل خزانة قفل بعجلات رمز وشاشة صغيرة تضرب
  الرمز في عدد القفل »). Files: `manipulations/operations/CodeLockers.jsx` (+ `operations/codeLockers/`), `logic/codeLockers.js`
  (+ test), render test, `levels.js` preset, `lesson.manipulation.json › codeLockers`, contract section, DNA row.
- **Drawn world.** A wall of wooden lockers in the library's entrance hall (shelves of books behind, a reading lamp, a poster « الكتاب
  صديق »), each locker numbered; the active locker is large in the foreground: on its door a brass plate with the rule (LTR island
  « $(-6)\times\;?=48$ »), under it the combination lock — a SIGN wheel (+ / −) and two digit wheels (مبتدئ) or an integer wheel + two
  decimal wheels (متقدم) — and a small green screen. KidFigure « إيناس » (hijab + tunic) at the desk reacts (`wonder` at a sign refusal,
  `proud` when the door opens and a returned book slides out).
- **The variable in the hand.** The missing factor q, as a code: each wheel rolls by a vertical drag / swipe (detents at each digit,
  momentum capped), by tapping its ▲ / ▼, or by keyboard (↑ / ↓ on the focused wheel, ← / → between wheels). Pulling the handle
  (drag down, tap, Enter) is the TRIAL. Not auto-completable.
- **What the world shows.** The screen multiplies LIVE as the wheels roll: « $(-6)\times(-3)=18$ » next to the target 48; on a pull,
  a refused code shakes the door and the screen says the calculation: « $(-6)\times8=-48$ ، والقفل يريد $48$ » (the opposite: same
  distance, wrong sign) or « $(-6)\times(-7)=42$ ، والقفل يريد $48$ » (wrong distance). An opened locker writes its line in the « سجلّ
  الخزائن »: the rule, the code, and the division sentence « إذن $48\div(-6)=-8$ ». Nothing states the sign rule.
- **Opening (no title).** Context: « في مدخل المكتبة البلدية خزائن للأمانات، ولكل خزانة قفل لا يُفتح إلّا بالعدد الذي يجعل العملية المكتوبة
  على بابها صحيحة. » Question: « أدِر عجلات الرمز ثم اسحب المقبض حتى تُفتح الخزانة. »
- **مبتدئ** (integers; sign wheel + 2 digit wheels; the live product visible):
  - L1 $(-6)\times\;?=48$ → −8;
  - L2 $9\times\;?=-54$ → −6;
  - L3 $?\times(-7)=-63$ → 9 (the unknown written FIRST: MISC-QISMA-ORDER);
  - L4 $(-12)\times\;?=-60$ → 5.
  End state: four lockers open, four division sentences in the record.
- **متقدم** (decimals; the SIGN wheel must be set and « ثبّت » pressed before the digit wheels unlock — a prediction; no live product
  until the first pull):
  - A1 $(-8)\times\;?=-2$ → 0,25;
  - A2 $2{,}5\times\;?=-7{,}5$ → −3;
  - A3 $(-0{,}4)\times\;?=1{,}2$ → −3;
  - A4 $?\times(-5)=0$ → 0 (the sign wheel accepts either sign: −0 = 0, the door opens and the record notes it).
  A committed wrong sign is refused at the first pull with « الإشارة التي ثبّتّها تعطي $(-8)\times(-0{,}25)=2$ ، والقفل يريد $-2$ » and the
  sign wheel is freed again.
- **World `fraction`** (module 2, alone, `levels={false}`): the lock gains a FRACTION mode (sign wheel in front, numerator wheel with its
  own sign, denominator wheel with its own sign; 1…20). Tasks: F1 $(-6)\times\;?=4$ — the decimal wheels show that −0,66 gives 3,96 and
  −0,67 gives 4,02 (the switch « وضع الكسر » appears after two decimal pulls); the door opens for any code of value −2/3, and the task asks
  to open it with TWO DIFFERENT writings (e.g. $\frac{-2}{3}$ then $\frac{2}{-3}$; $-\frac{4}{6}$ counts as different); F2 $(-9)\times\;?=-6$ →
  2/3 (opens with $\frac{-2}{-3}$ and with $\frac{2}{3}$: the record shows they are one key). Values compared exactly (`sameValue`).
- **« جرّب أعدادك »** (always open): the student writes his own lock « b × ? = a » (b: −20…20, one decimal; a: −99…99, one decimal).
  b = 0 is accepted and shown honestly: a ≠ 0 → every pull refused with « $0\times q=0$ مهما كان الرمز »; a = 0 → every code opens it
  (« كل الرموز تفتحها ») — the reason division by 0 is not defined, seen, not stated.
- **LabCoach**: ① a digit wheel — « مرّر العجلة إلى الأعلى أو الأسفل لتغيّر الرقم. » ② the sign wheel — « هذه عجلة الإشارة: أدِرها بين + و −. »
  ③ the handle — « اسحب المقبض لتجرّب الرمز. » ④ (متقدم) « ثبّت » — « ثبّت الإشارة أوّلًا، فتتحرّر عجلات الأرقام. » ⑤ (fraction) the switch —
  « إن لم تكفِ الأرقام العشرية، جرّب وضع الكسر من هنا. »
- **Wrong moves made visible**: SIGN (neg ÷ neg = neg: L4 refused with « $(-12)\times(-5)=60$ »), ORDER (reading « ? × (−7) = −63 » as
  −7 ÷ −63), DIST (subtracting instead of dividing), ZERO (b = 0 in the free panel), FRAC-SIGN (believing $\frac{2}{-3}\neq-\frac{2}{3}$ or that
  $\frac{-2}{-3}$ is negative: F1/F2), DECIMAL (0,4 × 3 = 1,2 read as 0,3).
- **Core maths**: `relativeOps.js` L3 functions (`divide`, `quotientSign`, `missingFactor`, `isFiniteDecimal`, `writingsOf`, `sameValue`,
  `evaluate`). Lab logic `logic/codeLockers.js`: `codeValue(wheels, mode)`, `pull(lock, code)` → `{ open, product, reason: 'sign' | 'distance'
  | 'zero-lock' }`, `decimalReachable(lock, places)`, `writingKey(code)` (to count DIFFERENT writings), `coachOf(state)`.
- **Why not another lab (DNA §12).** `division-jumps` (1AM): the hand holds q as JUMPS along a line of b objects (Euclidean division,
  remainders); `egg-trays` (2AM): the hand holds the DIVIDEND (eggs into trays); `fourth-gauges` (2AM): the missing cell of a proportion
  table on a brass rod; `term-ferry` (3AM): the divisor of an equation's last step. Here the hand holds a SIGNED code, rolled digit by
  digit with a separate sign wheel, and the resistance is a lock that multiplies: the definition b × q = a IS the mechanism; the fraction
  mode makes the three writings open the same door. Gesture (roll wheels) and world (library lockers) differ from the unit's
  `elevator-reel` (scrub, tower) and `robot-track` (carry / flip, floor mat).
- **Screen budget.** 1024×768: the active locker 300 px wide (wheels ≥ 48 px wide, digits 32 px bold), the wall of the other lockers as a
  narrow strip (their states as small doors), the record (4 rows) beside the locker; 768×1024: locker on top, record below, free panel
  open under it. Screenshots: initial, a sign refusal, an open door, متقدم before/after « ثبّت », fraction mode with two writings.

## 7. Modules (9)

`durationMinutes` = 6 + 14 + 12 + 12 + 12 + 8 = **64**; with مسائل 3 × 8 → 88 ≤ 90.

**00 أستعدّ** — `objectives`: « أتحقّق من ضرب الأعداد النسبية ومن أولوية العمليات قبل أن أقسم. » Statements:
1. $(-8)\times(-0{,}5)=4$ → صحيح (r01).
2. $(-3)\times4\times(-1)\times(-2)=24$ → خطأ (−24) (r01, several factors).
3. $7\times(-6)=-42$ → صحيح.
4. $20-4\times3=48$ → خطأ (8) (2am.m1.r01).
5. $5+(12-2)\div2=10$ → صحيح (2am.m1.r01, brackets).
6. $-7+10-5=-2$ → صحيح (2am.m4.r06).

**01 نشاط — خزائن الأمانات** — `objectives`: « أكتشف أنّ حاصل قسمة a على b هو العدد الذي إذا ضُرب في b أعطى a، وأكتشف إشارته. » Lab
(both levels). Then:
- q1 (L1) « فتحتَ الخزانة الأولى بالرمز −8 لأنّ $(-6)\times(-8)=48$. ما حاصل قسمة 48 على $-6$ إذن؟ » → −8. → brick P1.
- « أتوقّع القاعدة »: « كيف نعرف إشارة حاصل قسمة عددين نسبيين قبل أن نحسبه؟ »
- q2 (record) « في أيّ الخزائن كان الرمز موجبًا؟ ماذا تلاحظ على إشارتي العددين المكتوبين على بابها؟ » choices: « لهما الإشارة نفسها » ✓ ·
  « العدد الثاني موجب » · « الناتج المطلوب موجب » · « العدد الأكبر مسافةً موجب ». → brick P2 + box (know-8 rewritten; examples
  $(-35)\div(-5)=7$ ، $42\div(-6)=-7$).
- q3 (no lab) « احسب: $(-72)\div(-9)$ و $56\div(-7)$ » → 8 and −8.

**02 معارف — حين لا يكون حاصل القسمة عشريًا** — `objectives`: « أكتب حاصل قسمة غير عشري على شكل كسر وأتعرّف على كتاباته المتساوية. » Opens
on the lab world `fraction` (`levels={false}`). Then:
- q1 « بأيّ كتابات فتحتَ الخزانة $(-6)\times\;?=4$؟ اختر كل الكتابات التي تفتحها. » multi-select: $\frac{-2}{3}$ ✓ · $\frac{2}{-3}$ ✓ · $-\frac{2}{3}$ ✓ ·
  $\frac{-2}{-3}$ ✗ (MISC-QISMA-FRACSIGN). → brick P3.
- q2 « $\frac{-15}{-4}$ موجب أم سالب؟ اكتبه دون إشارة سالبة ثم كتابةً عشرية » → $\frac{15}{4}=3{,}75$.
- q3 « لماذا لا توجد خزانة قفلها $0\times\;?=5$؟ » choices: « لأنّ $0\times q=0$ مهما كان $q$ » ✓ · « لأنّ الرمز سالب » · « لأنّ 5 فردي ».
- Box (know-9 rewritten: a/b is the number that gives a when multiplied by b; b ≠ 0; the three writings; −a/−b = a/b), « تذكّر » boxes
  (the two unit lessons, linked).

**03 طريقة — أحسب حاصل قسمة وأنظّم سلسلة حسابات** — `objectives`: « أحسب حاصل قسمة عددين نسبيين وأحسب سلسلة حسابات باحترام الأولويات. »
- S1 (method-6) sign then distances: $-63\div7=-9$; $(-54)\div(-6)=9$; $0{,}36\div(-0{,}001)=-360$; $-4{,}5\div100=-0{,}045$.
- S2 (act-4 ③ redesigned) $Q=\frac{(-2)\times(-5)\times3\times(-1)}{(-1)\times4\times5\times(-6)}$: « إشارة البسط؟ » → − (3 negatives: −30); « إشارة
  المقام؟ » → + (2 negatives: 120); « إشارة Q وقيمته؟ » → $-\frac{30}{120}=-\frac{1}{4}=-0{,}25$.
- S3 (know-10) $A=5-(3\times(-4)+7)$: « ما العملية الأولى؟ » card → $3\times(-4)$; then $5-(-12+7)=5-(-5)=10$.
- S4 $B=(-18)\div(2-5)+4\times(-0{,}5)$ → $(-18)\div(-3)+(-2)=6-2=4$ (MISC-QISMA-PRIORITY: left to right gives −18 ÷ 2 … ).
- → brick P4 + method boxes.

**04 أتمرّن** — `objectives`: « أحسب حواصل قسمة وأكمل جداءات وأحسب سلاسل حسابات. » Exercises:
- E1 (act-4 ①② redesigned) complete: $(-5)\times\square=35$ → −7; $\square\times(-8)=-2$ → 0,25; $4\times\square=-30$ → −7,5; $(-1{,}5)\times\square=-6$ → 4.
- E2 sign without computing: $(-17)\div(-3)$ → +; $(-4{,}2)\div6$ → −; $9\div(-0{,}2)$ → −.
- E3 compute: $(-96)\div8=-12$; $(-3{,}6)\div(-0{,}9)=4$; $45\div(-0{,}5)=-90$; $(-7)\div(-20)=0{,}35$.
- E4 (now-13 ① redesigned with a = 7, b = 4) signs and values of $\frac{7}{4}$, $\frac{-7}{4}$, $\frac{7}{-4}$, $\frac{-7}{-4}$ → 1,75 ; −1,75 ; −1,75 ; 1,75.
- E5 (now-13 ② redesigned) $-0{,}52\div100=-0{,}0052$; $0{,}52\div(-0{,}001)=-520$.
- E6 (ex-33 style) $C=(6-14)\div(10-(2+3\times4))$ → $(-8)\div(10-14)=(-8)\div(-4)=2$.
- E7 (deep-40 redesigned) « ضع قوسين لتصبح المساواة صحيحة: $20-5\times4-2=30$ » → $(20-5)\times(4-2)=30$.
- E8 (deep-41 redesigned) « a جداء 9 أعداد غير معدومة منها 7 سالبة، و b جداء 6 أعداد غير معدومة منها 5 سالبة. ما إشارة كلٍّ من $a\times b$ و
  $\frac{a}{b}$ و $a+b$؟ » → a < 0 (7 odd), b < 0 (5 odd): $a\times b>0$, $\frac{a}{b}>0$, $a+b<0$.
- E9 (deep-45 redesigned) « أكمل المتتالية: 360 ; −72 ; … ; −6 ; 3 ; −3 (القسمة على −5 ثم −4 ثم −3 …) » → 18.

**05 مسألة 1 — محطة الأرصاد بالجلفة** (lessonProblem) — `objectives`: « أحسب متوسّط درجات حرارة سالبة وموجبة. » Minimum temperatures of
five days: −3 ; −5 ; 2 ; −4 ; −5 (°C). 1) sum → −15; 2) mean → $(-15)\div5=-3$ °C; 3) « في اليوم السادس سُجّلت −9°C: ما المتوسّط
الجديد للأيام الستة؟ » → $(-24)\div6=-4$ °C; 4) « هل انخفض المتوسّط أم ارتفع؟ » → انخفض (−4 < −3).

**06 مسألة 2 — خمّن نتيجتي** (deep-52 redesigned) — `objectives`: « أطبّق برنامج حساب على أعداد نسبية وأصوغ تخمينًا. » « اختر عددًا، أضف
إليه 3، اضرب الناتج في $(-4)$، أضف 12، ثم اقسم على $(-2)$. » 1) for 5 → $((5+3)\times(-4)+12)\div(-2)=(-32+12)\div(-2)=10$; 2) for −3,5 →
$((-0{,}5)\times(-4)+12)\div(-2)=14\div(-2)=-7$; 3) for −20 → $((-17)\times(-4)+12)\div(-2)=80\div(-2)=-40$; 4) « ماذا تلاحظ؟ » → the result
is double the chosen number (conjecture only: the proof with a letter belongs to `nashr-jabri-3am`).

**07 مسألة 3 — آلة نسرين الحاسبة** (ict redesigned) — `objectives`: « أكتشف متى تكون الأقواس ضرورية في الحساب بالآلة. » « أرادت نسرين حساب
$\frac{9+3\times(-5)}{1+2\times(-2)}$ فكتبت على الآلة: 9 + 3 × (−) 5 ÷ 1 + 2 × (−) 2 = » 1) « ما النتيجة الصحيحة؟ » → $\frac{-6}{-3}=2$; 2) « ما الذي
حسبته الآلة؟ » → $9+(-15)\div1+(-4)=-10$; 3) « أين يجب وضع الأقواس؟ » → around the numerator and around the denominator; 4) « احسب
$(-16)\times(-25)+(-14)\times15$ ثم $(16+(-25))\times(14+15)$ » → 190 and −261 (brackets needed only in the second).

**08 إختبار أولي**:
1. $(-42)\div(-6)$ → **7**; −7 (SIGN), −36 (DIST: $(-42)-(-6)$), −48 (DIST: adds).
2. $\square\times(-4)=10$ → **−2,5**; 2,5 (SIGN), −40 (MULTIPLIES), −0,4 (ORDER: 4 ÷ 10).
3. « أيّ عدد يساوي $\frac{-5}{8}$؟ » → **$\frac{5}{-8}$**; $\frac{-5}{-8}$ (FRACSIGN), $\frac{8}{-5}$ (INVERTS), $\frac{5}{8}$.
4. $7-3\times(-2)$ → **13**; −8 (PRIORITY: $(7-3)\times(-2)$), 1 (SUBNEG: $7-6$), −13.
5. $(-12)\div(1-4)+2$ → **6**; −2 (SIGN: $(-12)\div(-3)$ taken as −4), −14 (PRIORITY: $(-12)\div1-4+2$), 4 (the + 2 forgotten).

## 8. Misconceptions (`MISC-QISMA-*`)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `MISC-QISMA-SIGN` | neg ÷ neg = neg (or the sign of the dividend) | L4, A1 refusals | test 1, 2, 5 |
| `MISC-QISMA-ORDER` | a ÷ b = b ÷ a (« ? × (−7) = −63 » read backwards) | L3 | test 2, E1 |
| `MISC-QISMA-DIST` | subtracting / multiplying the distances | live product | test 1, 2 |
| `MISC-QISMA-ZERO` | dividing by 0 gives 0 | free panel, معارف q3 | bank |
| `MISC-QISMA-FRACSIGN` | 2/−3 ≠ −2/3; −2/−3 negative | world `fraction` | test 3, E4 |
| `MISC-QISMA-PRIORITY` | left to right with + before × / ÷ | — (طريقة S3–S4) | test 4, 5; E6, E7; مسألة 3 |
| `MISC-QISMA-SUBNEG` | 7 − (−6) = 1 | — | test 4, S3 |
| `MISC-QISMA-DECIMAL` | 0,52 ÷ (−0,001) = −52 (wrong shift) | A1–A3 | E5 |

## 9. Practice bank — `content/practice/3am/qismat-nisbiyayn/`

- **Corpus candidates** (term 1):
  - `3am-s1-103` ex 1 — B = (+24)(−15) ÷ (−13 + 10) = −360 ÷ (−3) = 120 (A, C → L2 steps `counted: false`);
  - `3am-s1-104` ex 1 — A = 16,5×(−4) + (−39) ÷ 0,5 = −66 − 78 = −144; B = (9 − 12)×[18 − (1 + 35 ÷ 7)] = (−3)×12 = −36; A ÷ B = 4 and its
    opposite −4 (the reciprocal of A/B → `counted: false`, unit 2);
  - `3am-s1-108` ex 1 — the same A, B; « show A ÷ B is a natural number » → 4 (has a correction);
  - `3am-s1-110` ex 1 — D = (−2)×(−3)×(+7) ÷ (+2) = 21;
  - `3am-s1-113` ex 1 — A = (−5,2) + (−6,33) − (+9,06) = −20,59; B = −141,44; C = A ÷ B = 2059/14144 ≈ 0,1456 → rounded to 0,01: 0,15
    (reciprocals → `counted: false`);
  - `3am-s1-5` ex 1 — C = (−3) + (−4)×(−21) − (−7) ÷ (−2) = −3 + 84 − 3,5 = 77,5 (« as a simplified rational » 155/2 → `counted: false`;
    A, B fractions → dropped);
  - `1am-s1-100` ex 1 (misfiled 3AM paper) — x with 72x = −36 → x = −0,5; F = 3×[(−12) + (+8)×(−2)] ÷ (−5) = −84 ÷ (−5) = 16,8;
    G = (7 + 3×(−5)) / (−10 ÷ 2 + 3) = −8 / −2 = 4 « natural »;
  - `3am-s1-2` ex 3 (model 5) — V/E = (−10)/(−7) = 10/7 ≈ 1,4286: bracket between two decimals with three places (1,428 < V/E < 1,429)
    and round to 10⁻¹ → 1,4;
  - `3am-s1-2` ex 6 (model 7) — B = (+6)×(−10) ÷ (−2) = 30;
  - `3am-s1-109` ex 1 — A = [−6 − (4 − 9) + (−12)] + (−2) = −15, B = 75, A/B = −1/5 (its sign; reciprocal and opposite → `counted: false`).
- **Honest FAITHFUL `term_exam` count: 9** (ten candidates, but `3am-s1-104` ex 1 and `3am-s1-108` ex 1 are the same exercise printed in two
  papers: cite each paper on its own sheet only if the questions differ — 104 asks the opposite of A ÷ B, 108 asks « natural number »). ~25 `term_exam_modelled`
  (`modelledOn: "3am-s1"`), ~16 `adapted` (ex-15, 16, 21–28, 30–33, self-8…11, deep-36, 45, 47, 48, 50).
- **Per level**: L1 sign of a quotient; L2 compute quotients (integers, then decimals, shifts by powers of 10); L3 missing factors and the
  three writings; L4 series with priorities (brackets, × ÷ before + −); L5 term-exam sheets (104/108, 103, 113, 100, s1-2).
- **Oracle** `scripts/practice-oracle/qismat-nisbiyayn.mjs`: its own exact evaluator (BigInt fractions, priorities, brackets, unary minus)
  re-parses every statement's expression; a « □ » statement is solved by `missing = a / b` and re-checked by multiplication; a rounding
  key is recomputed from the exact fraction (round half up at the asked place).

## 10. Risks & owner questions

1. Overlap with `adad-natiq` (unit 2) on « the sign of a rational number / positive denominator » — README question 2.
2. P4 depends on 2AM priorities (`2am.m1.r01`) that the net does not link to `3am.m1.r02` — README question 1.
3. `self-11`'s printed « (−4) ÷ 11 » (RTL scan artefact) is transcribed as 11 ÷ (−4); confirm.
4. The fraction mode compares VALUES (so −4/6 opens the −2/3 locker): the lab never asks to simplify — simplification is 1AM/2AM
   knowledge used only as a check. Confirm this is the intended boundary with unit 2.

## 11. Generator checklist

- Move destinations in `build-extraction.py`, `verified: True`; `check:textbook`.
- Extend `relativeOps.js` (L3 functions, incl. `evaluate` with steps; tests with BigInt/fractions, unary minus, nested brackets).
- Lab `code-lockers`: type, theme `libraryLockers`, registry, `levels.js` (module-1 preset; world `fraction` declared without level),
  logic test (every lock solvable, `decimalReachable` false for F1 with 2 places, writings counted by `writingKey`, zero-lock cases,
  `coachOf` to the end), render test (context then ONE question, says it once, wheels by keyboard, reduced motion), screenshots at four
  sizes reviewed.
- Lesson folder, `content.test.js` (independent evaluator for every key and every distractor's claimed misconception value),
  `prepDiagnostic`.
- e2e `apps/web/e2e/lesson-kit/3am-aadad-nisbiya-qismat-nisbiyayn.mjs` + `lab-coach.mjs` block.
- `validate:lessons`, `generate:lesson-index`, `check:lessons`, `npm test`.
- Publish (coordinator): final `pointsToLearn`, `pointPrerequisites` above, `durationMinutes: 64`, `difficulty: 'متوسط'`, `icon: '🔐'`,
  status `available`; then the unit can close with its synthesis.

## 12. Generator notes (2026-10-26, lead of `qismat-nisbiyayn`)

The plan was executed as written (entry point, lab, nine modules, numbers, bank sources). Deviations and findings, by decreasing weight:

1. **`3am-s1-2` ex 3 prints E = (−10) × 2 × 0,1 × (−7) × (−0,5) = −7** (re-read on the scan at 100 and 300 dpi by the lead and by the bank helper), **not −70** as the coordinator's brief and the notes of the lesson-2 plan / `EXERCISE_CONTRACT` said. The sheet `jidaa-adadayn-nisbiyayn-l3-007` was right; the faulty sheet was the sister `jidaa-ida-nisbiya-l3-003` (E read as (−10)(−7)(+1)·2·(−0,5) = −70, bounds 0,142 / 0,143): repaired to the printed expression, E = −7, V/E = 10/7, bounds 1,428 / 1,429; both notes corrected. Here `qismat-nisbiyayn-l5-007` uses the printed values.
2. **Two writings counted as different in the world `fraction`:** the lock reads the five wheels (front sign, numerator sign, numerator, denominator sign, denominator) and counts DIFFERENT wheel positions (`writingKey`), not different values: `−2/3`, `2/−3`, `−(2/3)` and `−4/6` are four keys. F2 is posed directly in fraction mode (`layout: 'frac'`); F1 starts on the decimal wheels (`live: true`, so the live product shows −0,66 → 3,96 and −0,67 → 4,02) and the switch « وضع الكسر » appears after two pulls of the task.
3. **Advanced sign refusal:** a committed wrong sign is refused with `committed × |a ÷ b|` (the same distance, the wrong sign: « (−8) × (−0,25) = 2 ، والقفل يريد −2 »), whatever the digit wheels show (they are still at 0 at the first pull), and the sign wheel is freed. Task `a4` (? × (−5) = 0) accepts either sign (the code is 0).
4. **Module 2 q1** is a four-row yes/no batch (« يفتح / لا يفتح » for −2/3, 2/−3, −(2/3), −2/−3), not a multi-select: the kit has no multi-select question and the batch asks the same thing row by row.
5. **« أستعدّ » has seven statements, not six:** textbook items 12 and 13 rewritten (the algebraic sum written as a grouping, `(−4) + (−6) = −4 − 6`) + the five platform statements of the plan (the product of two, of several, the priorities twice); `priorKnowledge` as in §2.
6. **Module 4 has nine steps** (E1 act-4 ①②; E2 ex-22/23; E3 ex-24/25/26; E4 now-13 ①; E5 now-13 ②; E6 ex-33; E7 deep-40; E8 deep-41; E9 deep-45), E1 is a four-row batch with a missing factor first and last position (□ × b = a once) and each row carries the three named distractors (opposite, quotient the wrong way round, product/sum).
7. **Module 3** adds a fourth S1 question (the four quotients of the plan, one at a time: −9, 9, −360, −0,045) and a « تذكّر — السنة الثانية » priorities box in its `brief` (no link: `silsila-bidun-aqwas` is `coming_soon`); the two unit lessons are recalled with their links in module 2.
8. **Extraction:** every element of the lesson is `verified: True` (act-4, know-8/9/10, method-5/6, now-13 re-read at 110 dpi; ex-15…33, self-8…11, deep-36…52 by the bank helper at 130–260 dpi; `ict` text is clear). Corrections: the `deep-47` note is more precise (with « 52 » rows and columns can be completed to product −2080 but the diagonals fail; only 25 makes the square magic), `ex-24` is confirmed as printed (−32)÷(−5) and (−21)÷(−5), `self-8` is read (−25)÷(−5) = 5. Destinations moved to module numbers: ex-15, 16, 22–27, 30, 33 and deep-40, 41, 45 → module 4, deep-52 → module 6, self-8…11 → module 8 (and the bank).
9. **Catalogue:** `pointsToLearn` is the plan's final wording (order kept), `skills` of `lesson.config.js` are the same four strings, `prerequisiteLessonCodes` gains `jidaa-ida-nisbiya`, `pointPrerequisites` as in §2, `durationMinutes` 64, `difficulty` « متوسط », `icon` 🔐, status `available`.
10. **Bank (50 sheets, 211 questions):** 10 `term_exam` (the plan's 9 plus `3am-s1-110` ex 1, kept faithful), 17 `term_exam_modelled`, 23 `adapted`, 0 other platform additions; 30 `counted: false` steps; 8 `MISC-QISMA-*`. `3am-s1-104` ex 1 and `3am-s1-108` ex 1 are the same exercise printed twice with different questions (104: the opposite and the reciprocal of A ÷ B; 108: « natural number »): both kept, each cites its own paper.
11. **`learning-net-queue.mjs` bug exposed by this publication:** once the LAST lesson of a unit is `available` nothing calls `push`, so the unit's still-planned synthesis never entered the queue and `--check` failed (« leçons prévues hors file : wadiya-idmajiya-aadad-nisbiya »). Fixed in the owner loop (the synthesis is queued when no planned lesson of its unit is left); `GENERATION_QUEUE.md` regenerated.
12. **Not run:** the local API on 127.0.0.1:8000 was down, so the lesson e2e ran with `QA_STUB=1`; no DB export / import (coordinator).
