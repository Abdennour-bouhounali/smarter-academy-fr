# Plan — `jidaa-ida-nisbiya` « جداء عدة أعداد نسبية » (3AM unit 1, lesson 2 of 3 + synthesis)

## 1. Identity

- **Code** `jidaa-ida-nisbiya` · **title** « جداء عدة أعداد نسبية » · **unit** `aadad-nisbiya` · catalogue `order: 1`.
- **Folder** `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/aadad-nisbiya/jidaa-ida-nisbiya/`.
- **Textbook** (book p. = PDF − 1): معارف p. 10 « ضرب عدد نسبي في (−1) » (know-3), « دور ومعنى الإشارة (−) » (know-4), « جداء عدة
  أعداد نسبية » (know-5), « مربع عدد نسبي » (know-6); p. 12 « توزيع الضرب على الجمع أو الطرح » (know-7); طرائق p. 11 تمرين 3 of method-1,
  method-2 « حساب جداء عدة عوامل », method-3 « حالات خاصة », دوري الآن p. 11 (now-11); طرائق p. 13 method-4 « لحساب جداء أعداد نسبية
  يمكننا تغيير ترتيب العوامل » (P = 504); exercises 5, 9–14, 18, 20 (pp. 14–15), أؤكّد 6, 7, 12 (p. 17), أتعمّق 35, 39, 42, 44, 46, 49,
  51 (pp. 18–19), أستعدّ items 1, 5, 6, 8, 9 (p. 7), the تحدّ ① (p. 6).
- **Catalogue `textbookRef`** says activity p. 9 — the book has NO activity for several factors (act-3/act-4 p. 9 are L1/L3). Set
  `activity: null` and add `method: [11, 13]` at publish (pattern « A textbook page that belongs to another lesson », guide §3).
- **Seeds the unit: no** (lesson 1 did). Moves its own destinations in `docs/sources/3am/unit1/build-extraction.py` and flips them to
  `verified: True`.

## 2. Programme & net

- **Item** `3am.m1.r01` « حساب جداء عددين نسبيين. » (second half; boundary in README).
- **Draft الكفاءات** (verbatim):
  1. ضرب عدد نسبي في $(-1)$ وتفسير $(-1)\times a=-a$ كمعاكس العدد $a$
  2. تعيين إشارة جداء عدة أعداد نسبية حسب زوجية عدد العوامل السالبة
  3. معرفة أن مربع عدد نسبي موجب دائما: $(-a)^2=a^2$
  4. توظيف توزيع الضرب على الجمع أو الطرح لتبسيط حساب
- **Proposed final wording** (order kept, `3am_jidaa-ida-nisbiya_P1…P4`):
  1. **P1** ضرب عدد نسبي في $(-1)$: $(-1)\times a=a\times(-1)=-a$ هو معاكس (نظير) العدد $a$ ، وتمييز أدوار الإشارة $-$ (علامة طرح، إشارة عدد سالب،
     معاكس عدد) — *the book's know-4 « دور ومعنى الإشارة » had no LP; it belongs with the opposite; « نظير » is the 3AM book's word, « معاكس »
     the 2AM one: both are written*.
  2. **P2** تعيين إشارة جداء عدة أعداد نسبية غير معدومة حسب زوجية عدد العوامل السالبة، ثم حسابه بضرب المسافات إلى الصفر مع تغيير ترتيب العوامل
     لتسهيل الحساب — *adds the computation and method-4 (reordering), otherwise without an LP; « غير معدومة » because one factor 0 gives 0*.
  3. **P3** معرفة أنّ مربع عدد نسبي $a^2=a\times a$ موجب دائمًا وأنّ $(-a)^2=a^2$ — *« $a^2=a\times a$ » makes the square a product of two
     equal factors (the power notation beyond ² is `quwat-adad-nisbi`)*.
  4. **P4** توظيف توزيع الضرب على الجمع أو الطرح في الاتجاهين لتبسيط حساب عددي على أعداد نسبية، مثل $(-4{,}7)\times13-(-4{,}7)\times3=(-4{,}7)\times10=-47$
     — *restricted to NUMBERS: distributivity with letters is `nashr-jabri-3am` and like terms `tabsit-hadhf-aqwas`, both published*.
- **pointPrerequisites**: intra `P2 ← P1`, `P3 ← P2`, `P4 ← P2`; cross-lesson (same item `3am.m1.r01`, lesson 1 published before this
  one): `P1 ← 3am_jidaa-adadayn-nisbiyayn_P2`, `P2 ← 3am_jidaa-adadayn-nisbiyayn_P4`, `P3 ← 3am_jidaa-adadayn-nisbiyayn_P2`,
  `P4 ← 3am_jidaa-adadayn-nisbiyayn_P4`. (Two LPs of the SAME programme item: no net link is crossed — confirm, question 2.)
- **Review items for « أستعدّ »**: `2am.m4.r05` (home `jam-tarh-nisbiya`, 2AM, `coming_soon`). Also measured (same-item sibling,
  PUBLISHED by then): lesson 1's product of two numbers (`priorKnowledge: 'jidaa-adadayn'`); extra: the opposite / symmetric point
  (2AM `talim-mustaqim-mudarraj-2`, `2am.m4.r01`, `coming_soon`) and even / odd numbers.
- **noRebuild**: none. Lesson 1 is RECALLED in a « تذكّر » `TextbookBox kind="remark"` in the `brief` of معارف with
  `getLessonPath('jidaa-adadayn-nisbiyayn')` (published → link), never rebuilt (pattern `nashr-jabri-3am`).
- **Where it serves later**: same forward links as lesson 1 (`quwat-adad-nisbi`: the parity of aⁿ is the parity of n negative
  factors; `nashr-jabri-3am`; `musawiyat-amaliyat`; `qismat-nisbiyayn`); 4AM: `jidaa-maadum`, `nashr-tabsit` / `mutatabiqat-shahira`
  ((−a)² = a² in (a − b)²), `amaliyat-judhur` ((−√3)² = 3).

## 3. Boundary

Owns P1–P4 (several factors, ×(−1), roles of « − », parity, reordering, the square, numeric distributivity both ways). Leaves: the
two-factor rule and its justification (lesson 1, recalled); aⁿ, −a² vs (−a)² (`quwat-adad-nisbi`, published — never contrasted here);
distributivity with letters (`nashr-jabri-3am`); every division, « □ » blanks that need a division (L3).

## 4. Textbook analysis

| Element | What it asks | Idea worth keeping | Platform use |
|---|---|---|---|
| know-3 (p. 10) | (−1)×a = −a, examples 6×(−1) = −6, (−4,2)×(−1) = 4,2, « −a may be positive » | ×(−1) = the opposite; −a is not « a negative number » | **Discovered** in module 1 (the robot jumps to the symmetric point), named after q1 (own examples) |
| know-4 (p. 10) | three roles of « − »: 13 − 9, −4, −a | the reading of a sign | module 2 (tap classification) |
| know-5 (p. 10) | parity rule + 3,2×(−5)×4×(−2,5)×(−2) = −320, 3×(−2,3)×(−1,5)×(−2)×(−4) = 82,8 | the parity rule | **Discovered** in module 1 (record of trials), named after q3 (own examples) |
| know-6 (p. 10) | square rule, (+1,2)² = (−1,2)² = 1,44 | never negative | module 2 (the « impossible » square), own examples |
| know-7 (p. 12) | k(a ± b) = ka ± kb both ways; −7(a + 2) = −7a − 14; 5b − 12b = −7b | numbers only here | طريقة (P4), NUMERIC examples; the lettered examples are left to `nashr-jabri-3am` / `tabsit-hadhf-aqwas` |
| method-1 ex 3 (p. 11) | sign of P = (−2)×0,3×(−21)×6×(−11) = −831,6 | count, then sign | طريقة worked example (own numbers) |
| method-2 (p. 11) | A = (+3)×(−7)×(−0,5)×(−8) = −84, B = 13×(−5)×(−1)×(−3)×(−2) = 390 | the commented layout | طريقة layout (own numbers) |
| method-3 (p. 11) | 3×(−1), (−1)×(−4), 3×0 | special cases | طريقة last step |
| method-4 (p. 13) | (−4)×0,07×(−25)×(−12)×3×(−2) = 504 by regrouping 4×25 | reorder to compute mentally | module 1 متقدم (a2) + طريقة |
| now-11 (p. 11) | sign of (−2)×…×(−2) (50 factors) and of B = 3×(−5)×5×(−5)×5×(−5)×(−5) | parity on long products | أتمرّن E3 (own: 40 factors (−3), 7 factors) |
| ex-5, 9–14, 18, 20 | compute / sign of products of 3–6 factors; fill blanks; pyramids | fluency, parity | bank (adapted) + أتمرّن picks |
| self-6, 7, 12 | −a is…; 116 factors (−1); −4,7×13 − (−4,7)×3 | meaning of −a, parity, distributivity | test / bank |
| deep-35 | three relatives with product −72, 84, −1, −0,08 | open construction | bank (open answers checked by product) |
| deep-39 | negatives = twice positives → sign | parity reasoning | أتمرّن E7 |
| deep-42 | programmes A (opposite then −7) / B (×(−1) then +(−7)) | ×(−1) = opposite | أتمرّن E6 (own: −5) |
| deep-44 | a product of 3 factors with every factor replaced by its opposite; 4 factors | flipping all signs | أتمرّن E5 |
| deep-46 | check a multiplicative magic square | parity in every line | مسألة 2 (own square) |
| deep-49 | compute two ways A = (−3)×(5 − 7) … | distributivity both ways | طريقة / أتمرّن E8 (own) |
| deep-51 | points ×(−1) on a number line | symmetry about 0 | أتمرّن E1 (own abscissas) |
| prep 1, 5, 6, 8, 9 | number line, coldest temperature, largest number, symmetric points | the opposite, order | « أستعدّ » statements, rewritten |
| challenge ① | 2017 equal numbers, sum −2017, product? | each is −1, odd count | مسألة 1 (2025 numbers) |

## 5. Design

**The lesson in one paragraph.** Multiplying by −1 sends a number to its opposite — the symmetric point across zero; any negative
factor does that « half-turn » once, and a positive factor only stretches the distance. So in a product of many non-zero factors the
distance is the product of the distances and the side is decided by HOW MANY half-turns: an even number of negative factors brings it
back to the positive side, an odd number leaves it negative — whatever their order. A square makes two identical half-turns or none:
it can never land on the negative side.

**Entry point.** Candidates:
- (a) The book: no activity; the rule is stated in معارف with two examples — a statement, not a discovery. Rejected.
- (b) A long product to compute by hand and then « observe » the sign — the pen does the work, nothing resists. Rejected.
- (c) **Chosen — programming a robot on a graduated floor track.** The robot starts on 1; each card of its programme multiplies its
  position: « × 3 » rolls it three times farther, « × (−1) » makes it JUMP over the zero post to the symmetric spot. To bring it to −24
  with the cards 2, 3, 4 the hand must flip signs, and it finds that ONE flip or THREE flips work, two never do; reordering the cards
  never moves the final stop. The parity rule is what the hand needs to aim.

**Order of ideas.** ×(−1) = the opposite (P1) → flipping signs of several cards: the side depends on how many are negative (P2) → the
order does not matter, regroup to compute (P2, متقدم) → معارف: the square can never be negative (P3) + the three roles of « − » (P1) →
طريقة: compute a long product; distributivity both ways for mental calculation (P4) → أتمرّن → مسائل (the تحدّ ①, a magic square,
mental calculation at the cooperative) → test.

**Story contexts** (own): the school's robotics club (« نادي الروبوتيك ») where « سلمى » and « أمين » program a small robot on a floor
mat; a magic square for the club's open day; the school cooperative selling notebooks at a discount.

## 6. Lab — `robot-track` « مسار الروبوت »

- **Type** `robot-track` (free), theme `roboticsClub` (« نادي الروبوتيك: مسار مدرّج على الأرض وعمود الصفر في وسطه وروبوت صغير يتبع
  بطاقات برنامجه »). Files: `manipulations/operations/RobotTrack.jsx` (+ `operations/robotTrack/`), `logic/robotTrack.js` (+ test),
  render test, `levels.js` preset, `lesson.manipulation.json › robotTrack`, MANIPULATION_CONTRACT section, DNA §15 row.
- **Drawn world.** A long floor mat seen at a slight angle (perspective, soft shadows) graduated as a number line, the zero post in
  the middle (a little mirror-gate), the positive half in one colour, the negative half in another (labels « الجهة الموجبة / السالبة »
  only on the mat, as places). A small wheeled robot with LED eyes; a programme strip of 6 card slots above the mat; a tray of factor
  cards (cardboard tiles with a sign badge in a corner). KidFigure « سلمى » (hijab) with a tablet and « أمين » beside the mat, reacting
  (`wonder` on a jump, `proud` on success). The mat's scale is chosen per task (ticks every 1, 2, 5 or 10; |stop| ≤ 30).
- **The variables in the hand.** The SIGN of each factor (tap the sign badge: + ↔ −; keyboard Space on a focused card) and the ORDER
  and PRESENCE of the cards (carry from the tray to a slot and back, drag a card over another to swap: `useDragInteraction`, tap-tap,
  keyboard arrows + Enter / Esc). Every placement / flip is a trial (`onTrial`), not auto-completable.
- **What the world shows.** The robot replays the programme from 1 after every change (each card ~400 ms; reduced motion → instant
  with the arcs drawn): a positive card → it ROLLS along the mat to |k| times its distance; a negative card → it rolls AND jumps over
  the zero post (an arc drawn above the mat, which stays as a faint trace numbered 1, 2, 3…). Under the mat, the running product line
  « $1\times2\times(-3)\times4=-24$ » (LTR island) grows with the cards. The goal flag stands on the target spot. Nothing says « odd » or
  « even ».
- **Opening (no title).** Context: « في نادي الروبوتيك، يبدأ الروبوت من العدد 1، وكل بطاقة في برنامجه تضرب موقعه في العدد المكتوب عليها. »
  Question (per mission): « رتّب بطاقات البرنامج واقلب إشاراتها حتى يتوقّف الروبوت عند الراية. » (the mission chip shows the flag value).
- **مبتدئ** (running product visible, arcs visible):
  - m1 slot 1 holds « 5 »; tray: « −1 ». Flag −5 → place −1 (1×5×(−1) = −5);
  - m2 « أعِد الروبوت إلى 5 ببطاقة واحدة » tray: « −1 », « 2 », « −5 » → only −1 works (×2 → −10, ×(−5) → 25: refused with the stop);
  - m3 cards 2, 3, 4 already placed (signs flippable). Flag −24 → one or three negative signs;
  - m4 same cards, flag 24, « واجعل في البرنامج إشارتين سالبتين على الأقل » → exactly two negatives.
  The « سجلّ التجارب » lists each validated stop with the number of negative cards (filled by the lab, not by the student). End state: m1–m4.
- **متقدم** (no running product, no arcs before « شغّل »; the student predicts the SIDE then presses « شغّل »):
  - a1 programme $(-2)\times3\times(-1)\times(-4)\times0{,}5$ fixed: predict the side (two big cards « يمين الصفر / يسار الصفر ») and the
    distance (stepper) → left, 12 → stop −12;
  - a2 cards « −5 », « 4 », « −0,5 », « 2 »: « رتّبها حتى يكون الروبوت عند −2 بعد البطاقتين الأوليين » → 4 and −0,5 first (either order);
    the final stop is 20 whatever the order (each reorder is replayed);
  - a3 a card « 3 » and a « −1 » card with a repetition stepper (1…20): « اجعل الروبوت عند −3 ثم عند 3 » → n odd, then n even; the
    prediction is asked once for n = 15 (→ left).
  End state: a1–a3.
- **World `square`** (module 2, alone, `levels={false}`): ONE card a set by a stepper (−6…6, step 0,5) is placed TWICE. Tasks: « اجعل
  الروبوت يتوقّف في الجهة السالبة » — no a works; after at least one negative and one positive trial the button « لا يمكن » is enabled and
  is the right answer (a press before that says « جرّب عددًا موجبًا وعددًا سالبًا أوّلًا »); then « اجعله يتوقّف عند 2,25 » — done when BOTH
  a = 1,5 and a = −1,5 have been tried.
- **« جرّب أعدادك »** (always open): type a factor (−10…10, one decimal) and add it to the tray (≤ 6 cards in the programme); « امسح »
  empties the programme. A card 0 makes the robot stop on the zero post and stay there whatever follows (one factor 0 → product 0).
- **LabCoach**: ① tray card — « اسحب بطاقة إلى خانة في البرنامج. » ② sign badge — « انقر على الإشارة لتقلبها. » ③ (m3 onward) a placed
  card — « اسحب بطاقة فوق أخرى لتبدّل مكانيهما. » ④ (متقدم) side cards — « توقّع الجهة ثم اضغط «شغّل». » ⑤ (square) — « إن رأيت أنّ الراية لا
  تُبلغ، اضغط «لا يمكن». »
- **Wrong moves made visible**: ANY-NEG (one negative card ⇒ negative: m4's two-negative stop is +24), MORE-NEG (more negatives than
  positives ⇒ negative: in m4 2 negatives vs 1 positive still give +24), ORDER (order changes the product: a2 replays every order to 20),
  SQUARE-NEG ((−a)² < 0: world `square`), MINUSONE ((−1)×a = −1 or a − 1: m1/m2 jumps), ZERO-FACTOR (free panel).
- **Core maths**: `relativeOps.js` L2 functions (`product`, `negativesIn`, `signByParity`, `opposite`, `square`, `factorize`). Lab logic
  `logic/robotTrack.js`: `run(cards, start = 1)` → `stops[]` with `{ value, jumped }`, `scaleFor(task)`, `judge(task, cards)` →
  `{ ok, stop, negatives, reason: 'side' | 'distance' | 'constraint' }`, `canReach(task)`, `coachOf(state)`.
- **Why not another lab (DNA §12).** `power-train` (3AM): the factors are all EQUAL (one base), the hand holds the EXPONENT on a rail,
  the train carries a load; here the factors are DIFFERENT, the exponent does not exist, the hand holds the SIGNS and the ORDER, and the
  world shows a point JUMPING over zero (symmetry) on a floor mat. `rotation-dial` / `shape-turn` (4AM): geometric rotations of a figure
  by an angle; here the half-turn is multiplication by −1 on a line, never an angle. `zero-probe`: a distance on a cable. Gesture family
  (carry + tap-flip + swap) and world (robotics floor mat) both differ from the unit's `elevator-reel` (scrub, tower) and `code-lockers`
  (roll wheels, lockers).
- **Screen budget.** 1024×768: mat full width of the lab (≈ 680 px; ≥ 16 px per graduation, labels every 5 when the scale is 1), programme
  strip above, tray + record in one row below; cards ≥ 56 px. 768×1024: same order stacked, the record under the tray; the free panel
  open below. Screenshots at four sizes: initial, a jump, m2 refusal, a2 reorder, square « لا يمكن ».

## 7. Modules (9)

`durationMinutes` = 6 + 14 + 12 + 12 + 12 + 8 = **64**; with مسائل 3 × 8 → 88 ≤ 90.

**00 أستعدّ** — `objectives`: « أتحقّق من جداء عددين نسبيين ومن معاكس عدد قبل أن أضرب عدة أعداد. » Statements:
1. $(-6)\times(-5)=30$ → صحيح (lesson 1).
2. $(-0{,}5)\times8=4$ → خطأ (−4) (lesson 1).
3. « معاكس $-7$ هو $7$ » → صحيح.
4. « النقطتان اللتان فاصلتاهما $-2{,}5$ و $2{,}5$ متناظرتان بالنسبة إلى المبدأ » → صحيح.
5. « العدد 17 زوجي » → خطأ.
6. $(-8)+3=-5$ → صحيح (2am.m4.r05).

**01 نشاط — مسار الروبوت** — `objectives`: « أكتشف كيف تحدّد البطاقات السالبة جهة توقّف الروبوت مهما كان ترتيبها. » Lab (both levels) at the
top. Then:
- q1 (m1–m2) « بطاقة $-1$ نقلت الروبوت من 5 إلى −5 ثم أعادته إلى 5. ماذا يكون $-5$ بالنسبة إلى 5؟ » choices: « معاكسه (نظيره) » ✓ · « مقلوبه »
  · « ضعفه » · « العدد الذي يسبقه ». → brick P1 + box (know-3 rewritten: $(-1)\times8{,}4=-8{,}4$، $(-1)\times(-3)=3$).
- q2 (m3–m4 evidence) « حين توقّف الروبوت عند 24 ، كم بطاقة سالبة كانت في برنامجك؟ » choices 0 or 2 accepted (from the trial) — the
  step's answer is whatever the student's record shows; the follow-up « وحين توقّف عند −24؟ » → 1 or 3.
- « أتوقّع القاعدة »: « متى يتوقّف الروبوت في الجهة السالبة؟ »
- q3 (record) « ماذا تشترك فيه كل البرامج التي أوقفت الروبوت في الجهة السالبة؟ » choices: « عدد البطاقات السالبة فيها فردي » ✓ · « فيها بطاقة
  سالبة واحدة على الأقل » · « البطاقات السالبة فيها أكثر من الموجبة » · « آخر بطاقة فيها سالبة ». → brick P2 + box (know-5 rewritten, own
  examples: $2\times(-5)\times(-1)\times(-3)=-30$ ; $(-2)\times(-2)\times(-5)\times(-0{,}5)=10$).
- q4 (no lab) « برنامج فيه 9 بطاقات كلّها $-1$: أين يتوقّف الروبوت؟ » → −1.

**02 معارف — المربع وأدوار الإشارة** — `objectives`: « أكتشف أنّ مربع عدد نسبي لا يكون سالبًا، وأميّز أدوار الإشارة −. » Opens on the lab
world `square` (`levels={false}`). Then:
- q1 « جرّبتَ $a=3$ و $a=-3$: أين توقّف الروبوت في المرّتين؟ » → 9 both. → brick P3.
- q2 « هل يوجد عدد نسبي مربّعه سالب؟ » → لا. Box: square rule ($(-1{,}5)^2=(+1{,}5)^2=2{,}25$).
- q3 (know-4) classify by tapping: « $15-6$ » → علامة طرح · « $-6$ » → إشارة عدد سالب · « $-a$ » → معاكس العدد $a$.
- q4 « إذا كان $a=-6$ فما قيمة $-a$؟ » → 6 (MISC-IDA-MINUSA: « −a is always negative »).
- « تذكّر » box (lesson 1, linked) in the `brief` of معارف.

**03 طريقة — أحسب جداء عدة أعداد وأستعمل التوزيع** — `objectives`: « أحسب جداء عدة أعداد نسبية بعدّ العوامل السالبة، وأستعمل التوزيع
لأحسب ذهنيًا. » Steps:
- S1 « كم عاملًا سالبًا في $P=(-4)\times0{,}07\times(-25)\times(-3)$؟ » → 3 → sign − ; « رتّب المسافات لتسهيل الحساب: $4\times25\times0{,}07\times3$ » →
  $100\times0{,}21=21$ → $P=-21$.
- S2 $(-1)\times(-1)\times5\times(-2)\times0=0$ (special case 0).
- S3 « احسب ذهنيًا $(-3{,}2)\times7+(-3{,}2)\times3$ » → $(-3{,}2)\times10=-32$.
- S4 « احسب ذهنيًا $(-25)\times(4-0{,}4)$ » → $-100+10=-90$ (MISC-IDA-DISTSIGN: −100 − 10).
- → brick P4 + method boxes (method-2, method-4, know-7 rewritten with numbers).

**04 أتمرّن** — `objectives`: « أعيّن إشارة جداءات طويلة وأحسبها وأوظّف التوزيع. » Exercises:
- E1 (deep-51 redesigned) points with abscissas −4 ; −1,5 ; 0 ; 2,5 ; 6 multiplied by −1 → 4 ; 1,5 ; 0 ; −2,5 ; −6 (on a drawn line):
  « ماذا تلاحظ؟ » → symmetric about the origin.
- E2 compute: $(-2)\times(-5)\times3=30$; $4\times(-0{,}5)\times(-3)\times(-1)=-6$; $(-1{,}5)\times2\times(-2)\times(-10)=-60$.
- E3 (now-11 redesigned) sign of $(-3)\times(-3)\times\dots\times(-3)$ (40 factors) → + ; of $2\times(-1)\times7\times(-4)\times(-3)\times5\times(-6)$ → +
  (4 negatives).
- E4 (ex-13 style) sign of $(-1)\times(-2)\times(-3)\times\dots\times(-13)$ → − (13 factors).
- E5 (deep-44) « جداء ثلاثة أعداد يساوي 12. نعوّض كل عامل بمعاكسه: كم يصبح الجداء؟ » → −12 ; « وجداء أربعة أعداد؟ » → unchanged.
- E6 (deep-42 redesigned) « البرنامج أ: اختر عددًا، خذ معاكسه، ثم اطرح 5. البرنامج ب: اختر عددًا، اضربه في $(-1)$، ثم أضف $(-5)$. » For 6,4:
  −11,4 both; for −2,5: −2,5 both → « always equal » (because $(-1)\times a=-a$).
- E7 (deep-39) « عدد العوامل السالبة ضعف عدد العوامل الموجبة (ولا عامل معدوم): ما إشارة الجداء؟ » → موجب (even).
- E8 (deep-49 redesigned) compute two ways $(-4)\times(6-9)$ → 12 ; $(-7-3)\times(-0{,}5)$ → 5.

**05 مسألة 1 — 2025 عددًا متساوية** (lessonProblem; the unit's تحدّ ①) — `objectives`: « أستعمل زوجية عدد العوامل السالبة في وضعية
مسألة. » « كتبت سلمى 2025 عددًا نسبيًا كلّها متساوية، فوجدت أنّ مجموعها $-2025$. » 1) « ما هو كل عدد؟ » → −1; 2) « ما إشارة جداء هذه
الأعداد؟ » → سالبة (2025 odd); 3) « ما قيمة الجداء؟ » → −1; 4) « لو كان العدد 2026 والمجموع −2026؟ » → product 1.

**06 مسألة 2 — مربّع النادي السحري** — `objectives`: « أتحقّق من مربّع سحري ضربي وأعلّل إشارات جداءاته دون حساب. » Square
$\begin{smallmatrix}-1&-18&-1{,}5\\-4{,}5&-3&-2\\-6&-0{,}5&-9\end{smallmatrix}$ (the platform's own, built on centre −3 with the factors
2 and 3; every row, column and diagonal has product −27):
1) compute the first row and one diagonal → $(-1)\times(-18)\times(-1{,}5)=-27$, $(-1)\times(-3)\times(-9)=-27$;
2) « لماذا كل الجداءات سالبة دون حساب؟ » → three negative factors in every line (odd);
3) « نعوّض كل عدد بمعاكسه: ما الجداء السحري الجديد؟ » → 27;
4) « نقلب إشارات الأركان الأربعة فقط: هل يبقى المربّع سحريًا؟ » → yes: every line contains 0 or 2 corners, so each product stays −27
(computed: row 1 → 1 × (−18) × 1,5 = −27, row 3 → 6 × (−0,5) × 9 = −27, column 1 → 1 × (−4,5) × 6 = −27, column 3 → 1,5 × (−2) × 9 = −27,
diagonals 1 × (−3) × 9 = 1,5 × (−3) × 6 = −27).

**07 مسألة 3 — حساب ذهني في التعاونية** — `objectives`: « أوظّف التوزيع في الاتجاهين لأحسب ذهنيًا تغيّرات سالبة. » « باعت التعاونية 99
كرّاسًا بتخفيض: خسرت 4,5 DA في كل كرّاس. » 1) total change → $(-4{,}5)\times99=(-4{,}5)\times(100-1)=-450+4{,}5=-445{,}5$ DA; 2) « في الشهر
الموالي خسرت 12 DA في كل علبة أقلام: 37 علبة في الأسبوع الأول و 63 في الثاني » → $(-12)\times37+(-12)\times63=(-12)\times100=-1200$ DA.

**08 إختبار أولي**:
1. sign of $(-2)\times5\times(-3)\times(-1)\times4$ → **سالب** (3 negatives); « موجب » (MORE-POS), « لا يمكن معرفته », « معدوم ».
2. $(-1)\times(-7{,}5)$ → **7,5**; −7,5 (SIGN), −8,5 (MINUSONE: a − 1), 6,5.
3. $(-0{,}3)^2$ → **0,09**; −0,09 (SQUARE-NEG), 0,9 (DECIMAL), −0,6 (DOUBLE).
4. $(-5)\times0{,}2\times(-4)\times(-10)$ → **−40**; 40 (ANY-NEG reversed / count error), −4, −400.
5. $(-6)\times17+(-6)\times3$ → **−120**; 120 (SIGN), −99 ((−6)×17 + 3: the second product forgotten), −20 (adds the factors).

## 8. Misconceptions (`MISC-IDA-*`)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `MISC-IDA-ANYNEG` | one negative factor ⇒ negative product | m4 (+24 with 2 negatives) | test 1, 4; E2 |
| `MISC-IDA-MORENEG` | sign = the majority of the factors | m4, record | test 1; E7 |
| `MISC-IDA-ORDER` | reordering changes the product | a2 replays | E2, طريقة S1 |
| `MISC-IDA-SQUARENEG` | (−a)² is negative | world `square` | test 3 |
| `MISC-IDA-MINUSONE` | (−1)×a = −1 or a − 1 | m1, m2 | test 2 |
| `MISC-IDA-MINUSA` | −a is always negative | — (معارف q4) | E6, bank |
| `MISC-IDA-DISTSIGN` | (−25)×(4 − 0,4) = −100 − 10 | — (طريقة S4) | test 5, مسألة 3 |
| `MISC-IDA-ZERO` | a factor 0 does not cancel the product | free panel | طريقة S2, bank |

## 9. Practice bank — `content/practice/3am/jidaa-ida-nisbiya/`

- **Corpus candidates** (term 1): `3am-s1-1` ex 1 (sign of A = (−2)(+5)(−3)(+4)(−1) with justification, A = −120; B algebraic sum = 0 →
  `counted: false`); `3am-s1-4` ex 1 Q2 (sign of G = −11×0,52×(−3,12)×6×(−14,4) without computing → negative, 3 negatives; Q1 fractions →
  dropped); `3am-s1-103` ex 1 (A = (−2)×7×(−5)×(−3) = −210; sign of C, a product of 123 factors of which 16 positive → 107 negatives →
  negative; B with ÷ → `counted: false`); `3am-s1-2` ex 3 (V = (−0,25)×4×(−10)×(−1) = −10, E = (−10)×2×0,1×(−7)×(−0,5) = −7; the bracketing
  and rounding of V/E → `counted: false`, L3); `3am-s1-2` ex 6 (C = (−3)×(−1)×(+2)×(+10)×(−5)×(+1) = −300); `3am-s1-109` ex 1 (B =
  (−5)×(−6)×(+2,5) = 75 « natural »; A, A/B → `counted: false`); `3am-s1-113` ex 1 (B = (−5,2)×(−3,4)×(−8) = −141,44); `1am-s1-100` ex 1
  (misfiled 3AM paper: the coefficient of x in E = (−5)×(−2)×3×(−2,4)×(−1)×x is 72; finding x = −0,5 → `counted: false`, L3).
- **Honest FAITHFUL `term_exam` count: 7–8** (the eight above). ~28 `term_exam_modelled` (`modelledOn: "3am-s1"`), ~14 `adapted` (ex-5,
  9–14, 18, 20, self-6, 7, 12, deep-35, 46).
- **Per level**: L1 sign of a product (count negatives); L2 compute 3–5 factors (integers); L3 decimals, reordering, ×(−1) and squares;
  L4 numeric distributivity both ways, long products (n factors); L5 term-exam sheets.
- **Oracle** `scripts/practice-oracle/jidaa-ida-nisbiya.mjs`: parses the product (and « n factors of which p positive » statements) with
  BigInt fractions; a sign key is recomputed by counting parsed negative factors AND by the exact product (both must agree).

## 10. Risks & owner questions

1. `textbookRef` of the catalogue cites an activity p. 9 that is not this lesson's; proposal: `activity: null`, `method: [11, 13]`.
2. Cross-lesson `pointPrerequisites` between two lessons of the SAME item (`3am.m1.r01`): allowed by the spirit of LEARNING_NET §4.6
   (no net link is crossed) — confirm.
3. P1 now also carries know-4 (roles of « − »); P2 carries reordering (method-4, printed under « تنظيم وتبسيط حساب » p. 13, which the
   catalogue gives to L3). Confirm these two moves.
4. The magic square of مسألة 2 is the platform's own (decimals, all nine entries negative, constant −27); the book's deep-46 / deep-47
   squares (constants 216 and −1000) stay in the bank as `adapted` items — never shown as the مسألة.

## 11. Generator checklist

- Move this lesson's destinations in `build-extraction.py` (README table), `verified: True`, rebuild `extraction.json`; `check:textbook`.
- Extend `relativeOps.js` (L2 functions + tests).
- Lab `robot-track`: type, theme `roboticsClub`, registry, `levels.js` (module-1 preset; world `square` declared WITHOUT level in
  `resources`), logic test (every task reachable, `canReach` false for « square negative », judge reasons, `coachOf` to the end), render test
  (context then ONE question, says it once, keyboard path, reduced motion), screenshots at four sizes reviewed.
- Lesson folder, `content.test.js` (independent arithmetic for every key, including the magic square lines), `prepDiagnostic`.
- e2e `apps/web/e2e/lesson-kit/3am-aadad-nisbiya-jidaa-ida-nisbiya.mjs` + `lab-coach.mjs` block.
- `validate:lessons`, `generate:lesson-index`, `check:lessons`, `npm test`.
- Publish (coordinator, guide §11): final `pointsToLearn`, `pointPrerequisites` above, `durationMinutes: 64`, `difficulty: 'متوسط'`,
  `icon: '🤖'`, `textbookRef` fix, status `available`; `challenge.sourceElementId: 'challenge'` in `units_3am › aadad-nisbiya` (its part ①
  is cited here).


## 12. Generator notes (2026-10-26)

Deviations from this plan, each minimal and recorded:

1. **`now-11` reads « 85 », not « 50 » — the plan was wrong.** Re-read at 500 dpi: the LAST digit under the brace is an unambiguous 5, so the number of factors is ODD and the sign of P is « − » whatever the first digit is (8, 6 or 0). The extraction (`build-extraction.py`) now says so; the lesson does not use that number (its own `now-11` redesign has 40 and 7 factors, plus the platform's 4-negative product). The cautions about `ex-15`, `ex-24`, `ex-30` (destined to `qismat-nisbiyayn`) and `ex-17` (to `jidaa-adadayn-nisbiyayn`) were NOT needed here: none of them is used by this lesson or its bank.
2. **Lab `a2`.** The plan wrote « the final stop is 20 whatever the order » AND « at −2 after the first two cards »: the task has two stops. The task field is `at: 2` (the flag −2 is checked after the second card while all four cards must be placed); the final stop (20) is shown in every verdict and is the same in all 24 orders (`logic/robotTrack.test.js`). The mat of a2 is 40 wide (5 × 4 × 2 = 40 is a partial product).
3. **Lab numbers and shape.** The programme shows `need` slots (≥ 2), six only in the free panel (six 66 px slots do not fit the 414 px lab column at 1024 px with the sidebar open); the distance stepper is ±1 with ±5 chips (a1 needs 12). « لا يمكن » is always clickable (no `aria-disabled`: it answers « جرّب عددًا موجبًا… » before the two trials) and carries `data-ready`.
4. **« أستعدّ ».** Seven statements instead of six: textbook prep 6 and 9 rewritten (the largest of five negatives; two points symmetric about the origin) plus five of the platform (two products, the opposite of −7, 17 is odd, (−8) + 3). The skills: `jidaa`, `maakus`, `tartib`, `zawji`, `jam`.
5. **Module 1.** q2 reads the student's OWN two last lines of the record (« 1 و 2 »: the negative cards of the program ending at −24, then at 24) instead of « 0 or 2 accepted » — m4 forces at least two negatives, so the record never holds a 0-negative 24; the follow-up « −24 → 1 or 3 » is the first number of that pair. « أتوقّع القاعدة » is the `predictPrompt` of the brick `adad-salib`, shown after q3.
6. **Module 3.** S1 is split in three answers (count 3 → sign − → P = −21 by reordering 4 × 25 first); method-1 exercise 3 is cited by a worked line (`METHOD.count`, −24 with five factors).
7. **Module 4.** Ten steps (the plan's eight, E1 and E6 each followed by their « ماذا تلاحظ؟ » choice). No figure for E1: the abscissas and their images are rows of a batch + a choice about the symmetry.
8. **Extraction destinations moved** to this lesson's module 4: `ex-13`, `deep-39`, `deep-42`, `deep-44`, `deep-49`, `deep-51` (the other module-`None` elements of the lesson are cited by its bank); every element destined to `jidaa-ida-nisbiya` is now `verified: true`.
9. **Catalogue.** `textbookRef.pages.activity` is `null`, `method` is `[11, 13]`, `pointPrerequisites` P1–P4 as in §2, `durationMinutes` 64, `icon` 🤖, status `available`; `units_3am › aadad-nisbiya.challenge.sourceElementId: "challenge"` was already set by lesson 1. The final الكفاءات wording is the plan's « proposed final wording » word for word (spaces around `\times`).
10. **Bank** (50 sheets, 225 questions): 8 `term_exam`, 23 `term_exam_modelled`, 19 `adapted`. The bank author found two errors in the corpus notes of this plan and of the lesson-1 bank: `3am-s1-2` ex 3 was read as E = (−10) × (−7) × (+1) × 2 × (−0,5) = −70 — **wrong**: the scan prints E = (−10) × 2 × 0,1 × (−7) × (−0,5) = **−7** (re-read by the `qismat-nisbiyayn` lead; the plan §9 and `jidaa-adadayn-nisbiyayn-l3-007` were right, and `jidaa-ida-nisbiya-l3-003` was repaired to −7 and the bracket 1,428 < V/E < 1,429); G of `3am-s1-4` ex 1 keeps its factor (−3,12) (negative either way).
11. **Not run.** `e2e/lesson-route-boundary.mjs` needs the API; the lesson e2e ran with `QA_STUB=1` (the page-tours stub) while the API was down.

