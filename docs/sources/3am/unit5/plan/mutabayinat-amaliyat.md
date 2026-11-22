# Plan — `mutabayinat-amaliyat` « المتباينات والعمليات » (3AM unit 5, lesson 1 of the remaining 3)

Every number in this plan was recomputed exactly while planning. Every Arabic string is final and the platform's own: never the book's contexts or
numbers verbatim, never « الكتاب ».

---

## 1. Identity

| | |
|---|---|
| Code | `mutabayinat-amaliyat` |
| Title | « المتباينات والعمليات » |
| Unit | `musawiyat-mutabayinat` « المساويات – المتباينات – المعادلات » (3AM unit 5) |
| Catalogue | `lessons_3am_2026_2027.json`, order 21, `kind: lesson`, `coming_soon` |
| Folder | `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/musawiyat-mutabayinat/mutabayinat-amaliyat/` |
| Book pages | book = pdf (offset 0): activity pp. 72–73 (نشاط 2 « المتباينات والجمع » / « المتباينات والضرب »), معارف p. 74 (§2), طرائق p. 75 (« توظيف خواص المتباينات والعمليات » + دوري الآن 1–2), exercises pp. 78–79 (6–18), أؤكّد p. 81 (3, 4), أستعدّ p. 71 (items 7, 8) |
| Seeds the unit? | No: the unit is seeded. This lesson is the FIRST of the remaining three and applies the README's re-routing in `build-extraction.py`. |

**Extraction elements destined here** (after the re-routing):
- **Prep and activities:** `prep` items 7, 8 · `act-2` (table a, b, a − b; « a + c < b + c ? »; part 5 « أكمل إن أمكن ») · `act-2b` (table a, b, c, ac, bc; k < l with ÷(−6), ÷5, ×(−3), ×2).
- **Knowledge and methods:** `know-2a` · `know-2b` · `method-2` (x > 7/5, A = 3x − 2, B = 5 − 2x) · `now-75-1` · `now-75-2`.
- **Exercises:** `ex-6` … `ex-18` · `ex-19`, `ex-23`, `ex-24`, `ex-26`, `ex-27` (moved in from `hasr-adad-ushri`) · `self-3`, `self-4`.

**Corrected readings** (re-read at 100 dpi while planning; set `verified: True` after your own 200-dpi read):
- `ex-7`: « m ≥ 0 ⟹ 5m ≥ … ؛ m ≤ … ⟹ m − 1 ≤ 0 ؛ m > … ⟹ 1 + 4m > 0 ؛ m > … ⟹ 3 − 2m < 0 » → 0 ; 1 ; −1/4 ; 3/2.
- `ex-9`: four pairs, (4/3 ; 24/21), (−4/7 ; −9/14), (4/15 ; −15/4), (2/3 ; 3/2) → > ; > ; > ; <.
- `ex-17` (pp. 78–79): « a ≥ b ⟹ b … a ؛ a ≥ b ⟹ b − a … 0 ؛ 3a ≤ 5b − 1 ⟹ 5b − 3a … 1 ؛ a + 10 ≥ b − 10 ⟹ a − b … −20 » → ≤ ; ≤ ; ≥ ; ≥.
- `ex-18`: « a ≥ b ⟹ 7a … 7b ؛ a > b ⟹ −2/5 a … −2/5 b ؛ a ≤ b ⟹ 4a + 1 … 4b + 1 ؛ a < b ⟹ −a + 3 … −b + 3 » → ≥ ; < ; ≤ ; >.
- `act-2` 5): a − 7/2 … b − 9/2 → **cannot be decided**, because (a − 7/2) − (b − 9/2) = (a − b) + 1 has an unknown sign. a + 3/5 … b + 6/5 → **<**, decidable,
  since a + 3/5 < b + 3/5 < b + 6/5. The current `reading` says neither is decidable: record a discrepancy. The other two: a − 4 < b − 4 and
  a + 3 < b + 3.

## 2. Programme & net

**programmeItems:** `3am.m5.r05`, « معرفة الخواص المتعلقة بالمساويات (أو المتباينات) والعمليات واستعمالها في وضعيات بسيطة. » This lesson
owns the INEQUALITY half. `musawiyat-amaliyat` (published) owns the equality half.

**Draft الكفاءات (verbatim):**
1. معرفة أنه إذا كان $a<b$ فإن $a+c<b+c$ و $a-c<b-c$
2. معرفة أن ضرب طرفي متباينة في عدد موجب تماما لا يغيّر اتجاهها
3. معرفة أن ضرب طرفي متباينة في عدد سالب تماما يغيّر اتجاهها
4. توظيف خواص المتباينات لمقارنة عبارات أو لحصرها

**Proposed final wording** (order kept; LP ids are positional):

| LP | Final | Change and why |
|---|---|---|
| P1 | معرفة أنّه إذا كان $a<b$ فإنّ $a+c<b+c$ و $a-c<b-c$ ($c$ عدد ناطق): لا يتغيّر اتجاه متباينة عندما نضيف إلى طرفيها (أو نطرح منهما) العدد نفسه | Adds the rule in words and « c ناطق », mirroring `3am_musawiyat-amaliyat_P1`. Whether c is negative does not matter here, and that is the misconception this LP fights. |
| P2 | معرفة أنّه إذا كان $a<b$ و $c>0$ فإنّ $ac<bc$ و $\frac{a}{c}<\frac{b}{c}$ : ضرب طرفي متباينة في (أو قسمتهما على) العدد الموجب تمامًا نفسه لا يغيّر اتجاهها | Adds DIVISION (know-2b states it, and `4am_mutarajiha-ula_P2` needs it). |
| P3 | معرفة أنّه إذا كان $a<b$ و $c<0$ فإنّ $ac>bc$ و $\frac{a}{c}>\frac{b}{c}$ : ضرب طرفي متباينة في (أو قسمتهما على) العدد السالب تمامًا نفسه يغيّر اتجاهها | Adds division by a negative number. Dividing by −3 is where 4AM students fail most (`MISC-MUTARAJIHA-SALIB-BILA-QALB`). |
| P4 | توظيف خواص المتباينات (وكذلك $\le$ و $\ge$) لاستنتاج متباينة من أخرى، ولحصر عبارة من الشكل $ax+b$ علمًا بحصر $x$ ، ولمقارنة عبارتين | Makes « لمقارنة عبارات أو لحصرها » operational: deduce (now-75-1/2, ex-13…16), bracket (ex-19, 23, 24, 26, 27) and compare (method-2). It also names ≤ / ≥ (know-2a remark, ex-17/18). It does NOT absorb « compare by the sign of the difference »: that is `3am_muqaranat-natiqayn_P2/P3`, used here as a recalled tool. |

**Review items for « أستعدّ »** (`reviewLinksForLesson`):

| Item | Text | Home lesson | Status |
|---|---|---|---|
| `2am.m4.r09` | اختبار صحة مساواة أو متباينة تتضمّن عددا مجهولا … عندما نستبدله بقيمة معلومة. | `ikhtibar-musawat-mutabayina` (2AM) | coming_soon, planned |
| `3am.m1.r01` | حساب جداء عددين نسبيين. | `jidaa-adadayn-nisbiyayn` (3AM unit 1) | coming_soon (another planner, same batch; may be published before this lesson) |

« أستعدّ » also measures, outside the net:
- the ORDER of relative numbers, `prep` 7–8 (2AM `muqarana-nisbiya`, published, with no net link to r05);
- the published sibling's P2 (equality × a negative number).

**noRebuild:** `noRebuildForLesson` is empty. Do not rebuild, as a matter of unit boundary:
- the sign of a difference (`muqaranat-natiqayn`): a « تذكّر » box only;
- the equality properties (`musawiyat-amaliyat`): a « تذكّر » box with a link, since it is published.

**pointPrerequisites:**
- intra-lesson: P2 ← P1 ; P3 ← P2 ; P4 ← P1, P2, P3;
- cross-lesson, toward the PUBLISHED lesson sharing the item `3am.m5.r05`: P1 ← `3am_musawiyat-amaliyat_P1` ; P2 ← `3am_musawiyat-amaliyat_P2` ;
  P3 ← `3am_musawiyat-amaliyat_P2`. The owner must confirm that a shared item counts as « a net link » (README Q2). If not, keep intra-lesson
  edges only;
- nothing toward `jidaa-adadayn-nisbiyayn` or `muqaranat-natiqayn` unless they are published first AND a net link exists. There is no
  r04 → r05 link: README Q1.

**Where 4AM uses it:** `3am.m5.r05 → 4am.m3.r04` (requires), lesson `mutarajiha-ula` (4AM unit 4, published).
- Its P2 = « حل متراجحة … الحفاظ على اتجاه المتباينة عند إضافة/طرح عدد أو الضرب/القسمة في عدد موجب، وتغيير اتجاهها عند الضرب أو القسمة في
  عدد سالب »: exactly P1–P3 here;
- 4AM `tarrid-mushkila` (`4am.m3.r05`) follows from it.

`3am.m5.r05 → 3am.m5.r06` makes `muadalat-darajat-ula` a successor, but through the equality half only.

## 3. Boundary

**Owns:** the effect of + − × ÷ by the same rational on both sides of `<` `>` `≤` `≥`, including ÷ (−k) and the case × 0. It also owns
deducing an inequality step by step down to « طرفها الأول x » (the book's own form), bracketing ax + b, and comparing two expressions
when one property suffices or with the recalled sign-of-difference tool.

**Leaves:**
- to 4AM `mutarajiha-ula`: the words « متراجحة », « حلّ », « مجموعة الحلول », the shaded number line of solutions, and the bracket « [ » ;
- to `muqaranat-natiqayn`: teaching a > b ⇔ a − b > 0, comparing two fractions by their difference, and comparing A and B by simplifying A − B
  as a method of its own. Here it is recalled in ONE « تذكّر » box and used, never asked for itself;
- to `hasr-adad-ushri`: decimals at a rank, rounding;
- to `muadalat-darajat-ula`: solving an equation;
- multiplying two inequalities together is not a 3AM property. `ex-27` (area) is done in two allowed steps (L·ℓ < 110·ℓ < 110·75, ×positive
  twice), never with « ضرب متباينتين ».

## 4. Textbook analysis

| Element | What it asks | Idea worth keeping | Platform use |
|---|---|---|---|
| `prep` 7, 8 | larger of 2/3 and −2/3 ; smaller of −5/4 and −7/4 | the order of relatives, needed to SEE a reversal | « أستعدّ », rewritten with other numbers (items 5, 6 below) |
| `act-2` 1)–2) | table of a − b and the order; « a − b > 0 ⟹ a … b » | the sign of the difference decides the order (r04) | NOT re-taught. The « تذكّر » box in معارف recalls it and the PROOF step of معارف uses it. |
| `act-2` 3)–5) | « is a + c < b + c true? », then complete « إن أمكن » | adding keeps the order; DIFFERENT constants can make it undecidable | أتمرّن E2 (redesigned: « إن أمكن » with one undecidable row) |
| `act-2b` | table ac / bc for four (a, b, c); k < l with ÷(−6), ÷5, ×(−3), ×2 | the reversal appears only when c < 0 | **Entry candidate (rejected, §5).** The table is answered by computation, not discovered. Becomes أتمرّن E3 (own k < l rows). |
| `know-2a` | property + remark ≤ ≥ + reading « أصغر أو يساوي » | — | معارف box (own words, own examples: y < 5 ⟹ y + 3 < 8 ; y − 1/2 < 9/2) |
| `know-2b` | two properties c > 0 / c < 0 ; examples z < −4 ⟹ 2z < −8 ; x < 15 ⟹ x/(−3) > −5 | — | معارف boxes with own examples: z < −3 ⟹ 4z < −12 ; x < 12 ⟹ x/(−4) > −3 |
| `method-2` | x > 7/5: compare A = 3x − 2 and B = 5 − 2x (two values, conjecture, prove by A − B = 5x − 7 > 0) | conjecture from two values, then prove with a property | طريقة method B, own numbers: x > 2, A = 4x + 1, B = 2x + 5 |
| `now-75-1` | x < −6: inequalities for x + 4, −6x, x/12 | three operations, one of them reversing | أتمرّن E4 (own: m > 2) |
| `now-75-2` | 7 > x − 8 ; −3x > 15 ; 9 > −x/4 → form x > … / x < … | down to « x alone » | طريقة method A (own) + أتمرّن E5 |
| `ex-6` | x > 10 ⟹ x − 10 > … (four, all 0) | — | أتمرّن E1 (own constants, not all 0) |
| `ex-7` | conditions on m for 5m ≥ 0, m − 1 ≤ 0, 1 + 4m > 0, 3 − 2m < 0 | the inverse direction (find the condition) | bank L2 adapted |
| `ex-8`, `ex-9`, `ex-10` | compare two rationals (1,2 < 1,25 ; four pairs ; 3/5 > 11/20) | r04 content | bank L1 adapted: « compare, THEN deduce with a property » (e.g. 6/5 < 5/4 ⟹ 6/5 − 2 < 5/4 − 2) |
| `ex-11`, `ex-12` | a < 2000 ⟹ a + 18 < 2018 ; x ≥ 5 ⟹ x − 10 ≥ −5 | words « أصغر من » / « أكبر من أو يساوي » | bank L1 adapted |
| `ex-13` | m > 3: m + 3, m − 3, −5 + m, 3m, −3m, −m/4 + 4 | six results: > 6, > 0, > −2, > 9, < −9, < 13/4 | أتمرّن E4 (own m > 2) + bank |
| `ex-14`…`ex-16` | −2x + 3 ≤ 18 ⟹ x ≥ −15/2 ; 3y + 5 ≤ −5 ⟹ y ≤ −10/3 ; −2z ≥ −7 ⟹ z ≤ 7/2 | down to x, with and without a reversal | أتمرّن E5 (own) + bank L2–L3 |
| `ex-17`, `ex-18` | ≥ / ≤ chains (b ≤ a ; b − a ≤ 0 ; 5b − 3a ≥ 1 ; a − b ≥ −20 / 7a ≥ 7b ; −2/5 a < −2/5 b ; 4a + 1 ≤ 4b + 1 ; −a + 3 > −b + 3) | the properties hold for ≤ ≥ | أتمرّن E6 (own) + bank |
| `ex-19` | 1 ≤ t ≤ 3: t + 10 ∈ [11 ; 13], 3t − 1 ∈ [2 ; 8], t/2 ∈ [1/2 ; 3/2], 14/3 t − 2 ∈ [8/3 ; 12] | bracket ax + b | طريقة method C (own 2 ≤ t ≤ 5) + bank |
| `ex-23`, `ex-24` | 3 < x < 8 ⟹ 12 < 4x < 32 ; 5 < P < 6 ⟹ 5/3 < P/3 < 2 | geometry brackets | أتمرّن E7 (own) |
| `ex-26` | 1 ≤ 2x + 1 < 3 ⟹ 0 ≤ x < 1 | bracket « backwards » | أتمرّن E8 (own: 3 ≤ 2x + 1 < 9 ⟹ 1 ≤ x < 4) |
| `ex-27` | 100 ≤ L ≤ 110, 64 ≤ ℓ ≤ 75 ⟹ 6 400 ≤ A ≤ 8 250 | two ×positive steps | مسألة 3 (own garden) + bank L4 |
| `self-3`, `self-4` | x < −3 ⟹ −x > 3 ; 2y − 2 ≥ 4 ⟹ y ≥ 3 | — | إختبار أولي items 3–4 carry `cites: [src('self-3')]`, `[src('self-4')]` with own numbers |

## 5. Design

**The lesson in one paragraph.** An inequality between two numbers is an ORDER: one is to the left of the other on the line. Applying the same
operation to both numbers moves the WHOLE line. Shifting it (+ c, whatever the sign of c) or stretching it from 0 by a positive factor keeps every
number in its place relative to the others: the left one stays on the left. Stretching by a NEGATIVE factor turns the line over around 0: what was
on the left lands on the right, so the direction of the inequality reverses (dividing is multiplying by 1/c, of the same sign). Multiplying by 0
crushes everything onto 0, and a strict inequality becomes 0 = 0. The student does not get this as three rules to memorise. The student sees ONE
picture: the threads that join each number to its image never cross, except when the factor is negative.

**Entry-point decision.**
- **(a) The book's activity** (act-2b table: compute ac and bc for four triples, compare). REJECTED as entry. Every row is answered by
  computing, so the reversal is a fact read in a table, not a necessity met by the hand. Four rows give no feel for « always » and none
  for « why ». It becomes the application أتمرّن E3.
- **(b) Two runners on a graduated wall** (the published `equality-lanes` world with `<`). REJECTED: a reskin. Same wall, same « who receives c ».
- **(c) A tilting bar through a pivot** (heights = c × position). REJECTED: this is `origin-line`'s pivot stage (4AM, a line through O whose
  slope the hand turns).
- **(d) A loom (CHOSEN).** Two parallel graduated beams. Each number of the upper beam is joined by a thread to its image on the lower beam.
  The hand moves ONE knot, and every thread follows:
  - in « مشط » (comb, + c) the hand drags the knot of the thread of 0, and every thread shifts parallel;
  - in « مسمار » (nail, × c) the thread of 0 is nailed at 0 and the hand drags the knot of the thread of 1 to c.

  The two marked threads (red at a, blue at b, a < b) CROSS exactly when c < 0. The idea becomes NECESSARY because the mission asks the student
  to bring the red knot to the RIGHT of the blue one: no shift ever does it (the threads stay parallel), no positive stretch does it, and the
  student must discover the only way.

**Order of ideas across modules:**

| Module | Step | LP |
|---|---|---|
| 1 نشاط (lab) | shifting never swaps | P1 |
| | stretching by c > 0 never swaps | P2 |
| | stretching by c < 0 always swaps, × 0 crushes | P3 |
| 2 معارف | WHY: the recalled sign of a difference, (a + c) − (b + c) = a − b and ac − bc = (a − b)c, then the three boxes, ≤ / ≥, division | P1–P3 |
| 3 طريقة | deduce step by step (down to x); compare two expressions; bracket ax + b | P4 |
| 4 أتمرّن | the book's activity, now-75 and the exercises, rewritten | P1–P4 |
| 5–7 مسائل | three problems | P1–P4 |
| 8 إختبار أولي | final test | P1–P4 |

**Story contexts** (Algerian daily life, own numbers):
- the lab: a carpet loom in a weaving workshop in غرداية, where مريم ties wool threads;
- مسألة 1: the cultural quiz of the middle school (−3 points per mistake);
- مسألة 2: the elevator of a building (630 kg maximum);
- مسألة 3: the fence of a school garden.

## 6. Lab — `loom-threads` « خيوط النول » (new type, free in the registry)

- **Folder / files.** `apps/web/src/lessons/common/manipulations/algebra/LoomThreads.jsx`, logic `logic/loomThreads.js` + `logic/loomThreads.test.js`,
  render test `algebra/loomThreads.render.test.jsx`.
  - Registry key `loom-threads`, level presets in `levels.js`, strings `lesson.manipulation.json › loomThreads`, theme `loom`.
  - The section « The order under the hand — `loom-threads` » goes into MANIPULATION_CONTRACT (§7ter recipe).
- **Drawn world.**
  - A wooden loom seen from the front: two horizontal beams of carved wood (upper « العارضة العليا », lower « العارضة السفلى »), each a
    graduated number line, LTR, the same scale on both: integers −10 … 10, labels every 2, ticks every 1, halves at متقدم.
  - Faint grey warp threads join every integer n of the upper beam to its image. The two story threads are thick wool: RED from a, BLUE from b,
    each with a pompom knot.
  - Beside the loom stands مريم (`KidFigure`, girl in hijab, `mood` reacts). Behind: a half-woven carpet whose pattern is decorative
    (`aria-hidden`, frozen under reduced motion).
- **THE variable in the hand:** the image of ONE reference thread.
  - In the nail tool (× c) the thread of 0 is nailed to 0 and the hand drags the KNOT of the thread of 1 along the lower beam. Its position IS c,
    and every thread x lands at c·x.
  - In the comb tool (+ c) the hand drags the knot of the thread of 0. Its position IS c, and every thread x lands at x + c.
  - The tool is chosen on two big tool cards: « مشط: أزح كل الخيوط » / « مسمار: ثبّت الصفر ومدّد ». At متقدم a second stage (a third beam)
    can be added, so two operations chain.
  - Gesture: drag along the beam (the knot lifts under the finger, snaps to graduations: integers at مبتدئ, halves at متقدم). The drag
    PREVIEWS and the release (or « اربط ») is the trial, as in `power-train` §2octovicies.
  - Keyboard: the knot is `role="slider"`, ← → ±1 step, Home/End. Round −/+ buttons in a `StepperCard`. Tap on a graduation of the lower beam
    moves the knot there.
  - Ranges:

    | Tool | مبتدئ | متقدم |
    |---|---|---|
    | comb c | −6 … 6 | −6 … 6 (step 1/2) |
    | nail c | −3 … 3 | −3 … 3 (step 1/2) |
- **What the world shows** (never the rule):
  - The threads move live during the drag.
  - When the red and blue threads cross, the crossing point gets a small glowing knot and both pompoms swap sides.
  - Under each beam, ONE line in an LTR island writes the pair in order with its symbol, computed: « 1 < 3 » above, « −2 > −6 » below.
  - At c = 0 in the nail, every thread converges on 0. The two pompoms sit on one knot and the line reads « 0 = 0 » with the strict symbol
    struck out.
  - The verdict banner says the CONSEQUENCE in the student's numbers: « الأحمر عند −2 والأزرق عند −6: صار الأحمر على يمين الأزرق. ». It
    never says « لأنّ العدد سالب ».
- **Opening (§17.9), no title.**
  - Context: « على النول خيطان: الأحمر مربوط عند 1 والأزرق عند 3 في العارضة العليا. كل أداة تنقل الخيوط كلّها إلى العارضة السفلى. »
  - ONE question: « اجعل الخيط الأحمر ينزل على يمين الخيط الأزرق في العارضة السفلى. »
- **Levels** (two levels in ONE `ManipulationWorkspace`, module 1; the same `objective` string on both):

  | Level | Task | Start | Goal / end state | Exact keys |
  |---|---|---|---|---|
  | مبتدئ | T1 `swap` | a = 1, b = 3 | red to the RIGHT of blue on the lower beam | comb: any c gives 1 + c < 3 + c (never); nail c ∈ {1, 2, 3} gives c < 3c (never); nail c ∈ {−1, −2, −3} gives (−1 ; −3), (−2 ; −6), (−3 ; −9), each red > blue ✓ |
  | | T2 `reach` | a = −2, b = −1 (−2 < −1) | « اجعل الخيطين يصلان إلى 6 و 3 » | nail c = −3: (−2)(−3) = 6, (−1)(−3) = 3 ✓, and 6 > 3 |
  | | T3 `meet` | a = 1, b = 3 | « اجعل العقدتين تلتقيان » | nail c = 0 → 0 and 0; the line reads 0 = 0 ✓ |
  | متقدم | T1 `reach2` (two stages) | a = −3/2, b = 1 | reach 5 and 0 | route 1: × (−2) → 3 and −2, then + 2 → 5 and 0 ✓; route 2: + (−1) → −5/2 and 0, then × (−2) → 5 and 0 ✓. Both accepted (the target pair is judged, not the route). |
  | | T2 `band` | the upper beam shows a PAINTED BAND, all x < 3 (a fan of threads, a hollow knot at 3) | « اجعل حافة الحزمة عند −6 والحزمة كلّها على يمينها » | × (−2): x < 3 → −2x > −6 ✓; or × (−1) then + (−3): −x − 3 > −6 ✓. Refused: × 2 → band left of 6; + (−9) → band left of −6. |
  | | T3 `reach` | a = 2, b = 3 | reach −1 and −3/2 | nail c = −1/2: −1 and −3/2 ✓; the readout writes « × (−1/2) أي ÷ (−2) » |

- **« جرّب أعدادك »** (always open, `free: true` trials never tick a task or the discovery):
  - the student types a and b (rationals, decimal comma or a/b, −5 ≤ a, b ≤ 5, a ≠ b, step 1/2 so they sit on graduations) and keeps both tools
    and their ranges;
  - at متقدم they may type a band bound (−5 … 5) and its direction (< / >).
- **Discovery** (after every task AND one comb trial with a NEGATIVE c, i.e. the contrast trial `negShiftTried`; the coach proposes it once):
  - question: « متى يتبادل الخيطان مكانيهما؟ »
  - options: « فقط حين نمدّد بعدد سالب تمامًا » ✓ ; « كلّما استعملنا عددًا سالبًا » ✗, refuted by HIS comb trial « أزحت بـ −4: بقي الأحمر
    على يسار الأزرق » ; « حين نمدّد بعدد أكبر من 1 » ✗, refuted by his × 2 or × 3 trial.
  - Formal phase, with his own pairs:
    - if a < b then a + c < b + c ;
    - if a < b and c > 0 then ac < bc ;
    - if a < b and c < 0 then ac > bc ;
    - × 0 gives 0 = 0.
- **LabCoach steps** (`coachOf`, one sentence each, never pointing at the answer):
  1. `tool`: « اختر أداة: المشط أو المسمار. »
  2. `drag`: « اسحب العقدة على العارضة السفلى. »
  3. `tie`: « اترك العقدة لتربط الخيوط. »
  4. `tryNeg` (once, the contrast): « جرّب المشط بعدد سالب. »
  5. `stage` (متقدم): « أضف عارضة ثالثة لعملية ثانية. »
  6. `next`: « انتقل إلى المهمّة التالية. »

  The test follows it to the end of both levels.
- **Wrong moves the lab makes VISIBLE:**

  | Misconception | What the student sees |
  |---|---|
  | `SUB-FLIP`: « subtracting / a negative shift reverses » | comb with c < 0, threads parallel, no crossing |
  | `POS-FLIP`: « dividing (×1/2) reverses » | متقدم nail c = 1/2: threads converge, no crossing |
  | `NEG-NOFLIP`: « a negative factor keeps the order » | the crossing |
  | `ZERO` | 0 = 0 |
  | `NEG-BOTH`: « both numbers negative, so it reverses by itself » | T2 starts with −2 < −1, and a comb keeps them |

- **Core maths** (exact, `packages/core/arithmetic/linear.js`, imported BY PATH):
  - REUSE `frac`, `add`, `mul`, `cmp`, `flipRelation`, `compareWith`, and `applyBoth(lin(0, a), lin(0, b), 'mul' | 'add', k, '<')`, which
    already returns `{ rel, flipped }` and `refused: 'zero'`. Here × 0 is NOT refused, it COLLAPSES: the lab logic handles it, `applyBoth` stays
    unchanged.
  - NEW `imageRay(ray, stages)`: `ray = { rel, bound }`, `stages = [{ op: 'add' | 'mul', k }]` → `{ rel, bound }`, or `{ collapsed: true }` for
    × 0. Used by T2 `band`.
  - NEW `boundAffine(interval, P)`: `interval = { lo, loRel: '<' | '<=', hi, hiRel }`, `P = lin(p, q)` → the bracket of p·x + q with ordered
    bounds and inherited strictness (p < 0 swaps the ends). Used by طريقة, أتمرّن and the مسائل.
  - Lab logic `logic/loomThreads.js`: `init(task)`, `setTool`, `dragKnot(s, value)` (preview), `tie(s)` (trial → `{ images, rel, crossed,
    collapsed, reached }`), `addStage`, `discoveryReady(memory)` (all tasks + `negShiftTried`), `coachOf(s)`, `witnesses(memory)` (the
    refutations), `freeSet(s, a, b | band)`.
  - Tests:
    - every c of every range, for every pair a < b of the grid −5…5 by halves, `crossed ⇔ c < 0`;
    - comb never crosses; × 0 collapses;
    - `band` swept over the bounds;
    - the coach followed to the end.
- **Why not another lab** (DNA §12):
  - **vs `equality-lanes`.** It holds c too, but its decision is WHO receives it (one side breaks the equality). Its world is a single wall
    with two runners, and its evidence is « together / apart ». Here BOTH sides always receive the operation, and the misconception is the
    DIRECTION. The evidence is the threads crossing, and the whole line is mapped (every warp thread), not two points. The control is a knot
    swept continuously through 0, not a number dialled and then applied.
  - **vs `origin-line`.** That lab is a line in a coordinate plane whose slope the hand turns. Here there are two parallel axes and a MAPPING
    diagram, with no plane and no slope, and the order of images is read along a beam.
  - **vs `solution-ray`** (4AM). There the hand holds a probe x and red traces of solutions. Here there is no unknown, and the band of T2 is
    only transported, never solved.
- **Screen budget.**
  - 1024×768, sidebar open (column ≈ 414 px): beams 380 px wide (19 px per unit), stage ≈ 300 px tall at مبتدئ (two beams + threads + the
    two order lines), ≈ 380 px at متقدم (three beams), tool cards and stepper in one row under it. Glance target ≤ 740 / 768.
  - 768×1024 (column ≈ 494 px): beams 460 px.
  - The knot's hit circle is 44 px; neighbouring graduations are 19 px apart, so drag snaps to the nearest graduation and the stepper gives
    precision. Pompoms 22 px.
  - No phone layout.

## 7. Modules (9, the standard shape)

`estimatedMin`: 0 → 6 · 1 → 15 · 2 → 11 · 3 → 11 · 4 → 12 · 5, 6, 7 → 8 each · 8 → 6. Total 85 (≤ 90). `durationMinutes` = 61 (without the مسائل).

### Module 0 — أستعدّ (`PrerequisiteDiagnostic`, `priorKnowledge: ['ikhtibar-musawat', 'jidaa-nisbi']`)

`objectives`: « أتحقّق من أنّني أختبر صحة متباينة بتعويض قيمة، وأحسب جداء عددين نسبيين، وأقارن عددين نسبيين. »

Seven true/false statements, each `requires` its slug:

| # | Statement | Key | Measures |
|---:|---|---|---|
| 1 | من أجل $x=4$ المتباينة $2x-3<5$ صحيحة. | خطأ (2·4 − 3 = 5, and 5 < 5 is false) | 2am.m4.r09 |
| 2 | من أجل $y=-1$ المتباينة $3-y>3$ صحيحة. | صحيح (3 − (−1) = 4 > 3) | 2am.m4.r09 |
| 3 | $(-6)\times\left(-\frac{2}{3}\right)=-4$ | خطأ (= 4) | 3am.m1.r01 |
| 4 | $(-5)\times 1{,}2=-6$ | صحيح | 3am.m1.r01 |
| 5 | $-\frac{3}{4}<-\frac{1}{2}$ (`src('prep', …, 7)` rewritten) | صحيح (−0,75 < −0,5) | relative order |
| 6 | العدد الأصغر من بين $-\frac{7}{3}$ و $-\frac{8}{3}$ هو $-\frac{7}{3}$ (`prep` 8 rewritten) | خطأ (−8/3 is smaller) | relative order |
| 7 | إذا كان $a=b$ فإنّ $-3a=-3b$ | صحيح | `3am_musawiyat-amaliyat_P2` (published sibling) |

### Module 1 — نشاط « خيوط النول » (lab at the top, nothing above it)

`objectives`: « أكتشف متى يتغيّر ترتيب عددين عندما أجري عليهما العملية نفسها. »

The `ManipulationWorkspace` (both levels) has no `title`, no `lead`, no `brief`. Then the steps, each preceded by an evidence line from `onTrial`
(`[data-activity-evidence]`, never blocking):

| Step | Question | Options / key | LP and brick |
|---|---|---|---|
| Q1 | Evidence: « أزحت كل الخيوط بـ … فصار الأحمر عند … والأزرق عند … ». « حين أزحت كل الخيوط بالعدد نفسه، موجبًا كان أو سالبًا، ماذا حدث لترتيب الخيطين؟ » | ✓ « بقي الأحمر على يسار الأزرق في كل مرّة » ; ✗ « تبادلا مكانيهما حين كان العدد سالبًا » ; ✗ « تبادلا مكانيهما حين كان العدد كبيرًا » | P1, followed by a `NumericQuestion` choice of symbol: « $1<3$ ، أزحنا بـ $-7$ : أكمل $-6\ \square\ -4$ » → `<`. Brick P1 after the answer (`predictPrompt`: « اكتب بكلماتك ما يحدث لمتباينة حين نضيف إلى طرفيها العدد نفسه. ») |
| Q2 | « بالمسمار عند 3 وصل الأحمر إلى 3 والأزرق إلى 9. وعند 2 وصلا إلى 2 و 6. ماذا تلاحظ؟ » | ✓ « الترتيب نفسه: $3<9$ و $2<6$ » ; ✗ « تبادلا لأنّ العدد أكبر من 1 » ; ✗ « صارا متساويين » | P2 + brick P2 |
| Q3 | Evidence of his negative nail. « بالمسمار عند $-2$ وصل الأحمر إلى $-2$ والأزرق إلى $-6$ . أكمل: $-2\ \square\ -6$ » | `>` | P3. Then « في أيّ محاولاتك فقط تبادل الخيطان مكانيهما؟ »: ✓ « حين مدّدنا بعدد سالب تمامًا » ; ✗ « حين استعملنا عددًا سالبًا بالمشط أو بالمسمار » ; ✗ « حين مدّدنا بعدد أكبر من 1 ». Brick P3 (`predictPrompt`: « اكتب ما يحدث لاتجاه متباينة حين نضرب طرفيها في عدد سالب. ») |
| Q4 | « عند المسمار في 0 التقت العقدتان. ماذا صارت المتباينة $1<3$ ؟ » | ✓ « $0=0$ : لم تعد متباينة تامّة » ; ✗ « $0<0$ » ; ✗ « بقيت $1<3$ » | P2/P3 remark: « لذلك نشترط في الخاصيتين $c\neq 0$ » (a remark, not a brick) |

### Module 2 — معارف « لماذا ينقلب الاتجاه؟ » (opens on its first question)

`objectives`: « أبرّر خواص المتباينات بإشارة الفرق، وأسمّيها، وأطبّقها على $\le$ و $\ge$ وعلى القسمة. »

Track:
1. **First question** (own numbers, P1–P3). « $x<-2$ . أكمل بالرمز المناسب: $x+6\ \square\ 4$ ؛ $3x\ \square\ -6$ ؛ $-5x\ \square\ 10$ ؛
   $\frac{x}{-4}\ \square\ \frac{1}{2}$ » → `<` ; `<` ; `>` ; `>` (`BatchChoiceQuestion`).
2. **Two « تذكّر » boxes** (`TextbookBox kind="remark"`):
   - « تذكّر — المساويات والعمليات », linked by `getLessonPath('musawiyat-amaliyat')`;
   - « تذكّر — مقارنة عددين بإشارة فرقهما »: a < b يعني a − b < 0. Link via `getLessonPath('muqaranat-natiqayn')`, null while unpublished.
     Both boxes take source `addition('prior_year_reminder')`. `nashr-jabri-3am` set the precedent of using it for a SAME-year published sibling.
3. **Proof questions:**
   - « $a<b$ . احسب $(a+c)-(b+c)$ ؛ ما إشارته؟ » → a − b, negative ⟹ a + c < b + c ;
   - « $a<b$ و $c<0$ . ما إشارة $(a-b)\times c$ ؟ » → ✓ موجبة ⟹ ac − bc > 0 ⟹ ac > bc ; ✗ سالبة ; ✗ لا يمكن معرفتها.
4. **Boxes** naming P1, P2, P3 (own wording). Examples: $y<5 \Rightarrow y+3<8$ و $y-\frac12<\frac92$ ; $z<-3 \Rightarrow 4z<-12$ ;
   $x<12 \Rightarrow \frac{x}{-4}>-3$. Remark: the same holds for ≤, ≥ (« $a\le b$ تُقرأ $a$ أصغر من أو يساوي $b$ »). Division by c = multiplication
   by 1/c, which has the same sign.
5. **Bricks** P1–P3 already shown in M1 (`KnowledgeSnapshot` footer).
6. **One `levels={false}` lab call (optional, recommended):** `loom-threads` alone with the task `{ kind: 'reach', a: -3, b: 2, target: [6, -4] }`
   (× (−2): 6 and −4) → declare the resource without `level` (batch-4 pattern).

### Module 3 — طريقة « أستنتج، أقارن، أحصر »

`objectives`: « أستنتج متباينة من أخرى خطوة خطوة، وأقارن عبارتين، وأحصر عبارة من الشكل $ax+b$ . »

Each method starts with a question, then `MethodSteps`:

- **Method A (P4: deduce).**
  - Q: « $x>4$ . ما المتباينة التي يحقّقها $-3x+5$ ؟ » → $-3x<-12$ then $-3x+5<-7$ (✓) ; distractors $-3x+5>-7$ (`NEG-NOFLIP`), $-3x+5<-12$ (`TERM-LOST`).
  - Second: « $7-2x\ge 1$ : استنتج متباينة طرفها الأول $x$ » → $-2x\ge -6$, then ÷(−2): $x\le 3$ (✓) ; distractor $x\ge 3$.
  - Lines « نطرح 7 من الطرفين … نقسم الطرفين على $-2$ (سالب) فنغيّر الاتجاه ».
- **Method B (P4: compare, `method-2` redesigned).**
  - « $x>2$ ، $A=4x+1$ ، $B=2x+5$ . قارن A و B من أجل $x=3$ ثم $x=\frac52$ ، ضع تخمينًا ثم أثبته. »
  - Values: x = 3 → A = 13, B = 11 ; x = 5/2 → A = 11, B = 10.
  - Conjecture A > B. Proof: A − B = 2x − 4 ; x > 2 ⟹ 2x > 4 ⟹ 2x − 4 > 0 ⟹ A > B. Uses the recalled tool.
- **Method C (P4: bracket, `ex-19` redesigned).**
  - « $2\le t\le 5$ . احصر $3t-1$ ثم $-2t+4$ »:
    - 6 ≤ 3t ≤ 15 ⟹ 5 ≤ 3t − 1 ≤ 14 ;
    - −4 ≥ −2t ≥ −10, rewritten in increasing order −10 ≤ −2t ≤ −4 ⟹ −6 ≤ −2t + 4 ≤ 0.
  - Distractor « $0\le -2t+4\le -6$ » (`BOUND-ORDER`).

Bricks: P4 (« خطوات الاستنتاج والحصر »), with `predictPrompt`.

### Module 4 — أتمرّن (`TextbookExercise` / kit questions; `brief` allowed: « ثمانية تمارين لتثبيت الخواص. »)

`objectives`: « أطبّق خواص المتباينات في الجمع والطرح والضرب والقسمة وفي الحصر. »

| Ex | cites | Statement (own numbers) | Keys |
|---|---|---|---|
| E1 | `ex-6`, `act-2` | x عدد ناطق. أكمل: إذا كان $x>7$ فإنّ $x+3>\dots$ ؛ $x<-5$ فإنّ $x-2<\dots$ ؛ $x\ge -4$ فإنّ $x+4\ge\dots$ ؛ $x\le\frac34$ فإنّ $x-\frac14\le\dots$ | 10 ; −7 ; 0 ; 1/2 |
| E2 | `act-2` (part 5) | $a<b$ . أكمل إن أمكن بـ $<$ أو $>$ : $a+\frac23\ \square\ b+\frac23$ ؛ $a-5\ \square\ b-5$ ؛ $a+\frac14\ \square\ b+\frac34$ ؛ $a-1\ \square\ b-3$ | < ; < ; < ; « لا يمكن الحكم » ((a − 1) − (b − 3) = a − b + 2, sign unknown) |
| E3 | `act-2b`, `ex-18` | $k<l$ . أكمل: $4k\ \square\ 4l$ ؛ $-5k\ \square\ -5l$ ؛ $\frac{k}{3}\ \square\ \frac{l}{3}$ ؛ $\frac{k}{-2}\ \square\ \frac{l}{-2}$ ؛ $-\frac25 k\ \square\ -\frac25 l$ | < ; > ; < ; > ; > |
| E4 | `ex-13`, `now-75-1` | $m>2$ . استنتج متباينة لكل من: $m+6$ ؛ $m-9$ ؛ $5m$ ؛ $-4m$ ؛ $-\frac12 m+3$ | > 8 ; > −7 ; > 10 ; < −8 ; < 2 |
| E5 | `ex-14`, `ex-15`, `ex-16`, `now-75-2` | استنتج متباينة طرفها الأول x: $3x-4\le 11$ ؛ $-2x+5>13$ ؛ $6\ge -\frac{x}{3}$ | x ≤ 5 ; x < −4 ; x ≥ −18 |
| E6 | `ex-17`, `ex-7` | $a\ge b$ . أكمل: $b\ \square\ a$ ؛ $a-b\ \square\ 0$ ؛ $3a+1\ \square\ 3b+1$ ؛ $2-a\ \square\ 2-b$ | ≤ ; ≥ ; ≥ ; ≤ |
| E7 | `ex-23`, `ex-24` | ضلع مربّع $x$ حيث $4<x<6{,}5$ (cm): احصر محيطه. مثلث متقايس الأضلاع محيطه $P$ حيث $12<P<13{,}5$ (cm): احصر طول ضلعه. | 16 < 4x < 26 ; 4 < P/3 < 4,5 |
| E8 | `ex-26` | $x$ عدد حيث $3\le 2x+1<9$ . استنتج حصرًا للعدد $x$ . | 1 ≤ x < 4 |

### Modules 5–7 — مسائل (`GuidedProblem` from data, `MASAIL_GENERATION_GUIDE.md`; drawn support required)

**مسألة 1 = `lessonProblem`** « المسابقة الثقافية » (module 5; P2, P3, P4)
- Statement: « في المسابقة الثقافية للمتوسطة يبدأ كل متسابق بـ 50 نقطة، ويخسر 3 نقاط عن كل إجابة خاطئة. نرمز بـ $e$ إلى عدد الإجابات الخاطئة،
  فتكون النتيجة $S=50-3e$ . »
- Questions and keys:
  1. أخطأ أمين أكثر من 8 مرّات ($e>8$). ما المتباينة التي يحقّقها $-3e$ ؟ → $-3e<-24$
  2. استنتج متباينة لنتيجته → $S<26$
  3. أخطأت سلمى 5 مرّات على الأكثر ($0\le e\le 5$). احصر نتيجتها → $35\le S\le 50$
  4. مَن نتيجته أكبر؟ → سلمى (35 > 26)
- Illustration `tags`: « نقاط البداية: 50 », « كل خطأ: −3 », « أخطاء أمين: أكثر من 8 ». Plain text, no `$`.

**مسألة 2** « مصعد العمارة » (module 6; P1, P2, P4)
- Statement: « يحمل مصعد عمارة 630 kg على الأكثر. يركبه عامل كتلته 80 kg ومعه $x$ صندوقًا كتلة كل منها 25 kg . »
- Questions and keys:
  1. اكتب المتباينة التي تعبّر عن الشرط → $25x+80\le 630$
  2. استنتج متباينة لـ $25x$ → $25x\le 550$
  3. استنتج متباينة طرفها الأول $x$ → $x\le 22$
  4. هل يمكنه أن يحمل 23 صندوقًا؟ → لا (25·23 + 80 = 655 > 630). With 22 boxes: 630, allowed.
- Illustration `scene` / `stacks`.
- Do NOT write « حل المتراجحة ».

**مسألة 3** « سياج حديقة المدرسة » (module 7; P2, P4)
- Statement: « حديقة مستطيلة عرضها 8 m وطولها $L$ حيث $12<L<15$ (m). »
- Questions and keys:
  1. احصر المحيط $P=2L+16$ → 40 < P < 46
  2. تكفي لفّة سياج طولها 45 m؟ → لا يمكن الجزم (P could be 45,5)
  3. ولفّة طولها 46 m؟ → نعم دائمًا
  4. احصر المساحة $8L$ → 96 < A < 120
- Cites `ex-27` (two ×positive steps). Illustration `plan` (`rect`, `w: '8'`, `h: 'L'`).

### Module 8 — إختبار أولي (`BossFinal`; 5 items, one primary LP each, timer 6 min; options LITERAL in `Module08Itqan.jsx`, data in `FINAL`)

| # | LP | Prompt | ✓ key | Distractors (misconception) |
|---:|---|---|---|---|
| 1 | P1 | $a<b$ . أيّ عبارة صحيحة دائمًا؟ | $a-4<b-4$ | $a-4>b-4$ (`SUB-FLIP`) ; $a+4<b-4$ (`DIFF-CONST`) ; $a-4=b-4$ |
| 2 | P2 | $x<6$ إذن… | $3x<18$ | $3x>18$ (`POS-FLIP`) ; $3x<6$ (`ONE-SIDE`) ; $3x<2$ (divides instead) |
| 3 | P3 (`cites: self-3`) | $y\ge -2$ إذن… | $-5y\le 10$ | $-5y\ge 10$ (`NEG-NOFLIP`) ; $-5y\ge -10$ (sign lost) ; $-5y\le -10$ |
| 4 | P4 (`cites: self-4`) | $-4x>12$ ، متباينة طرفها الأول x: | $x<-3$ | $x>-3$ (`NEG-NOFLIP`) ; $x>3$ ; $x<3$ (`RESULT-FLIP`) |
| 5 | P4 | $2\le t\le 4$ ، حصر $5-2t$ : | $-3\le 5-2t\le 1$ | $1\le 5-2t\le 3$ (`COEF-LOST`: 5 − t) ; $9\le 5-2t\le 13$ (5 + 2t) ; $-8\le 5-2t\le -4$ (the + 5 forgotten) |

Verify with the content test (each distractor false at t ∈ {2, 3, 4}): 5 − 2t ∈ {1, −1, −3}.

## 8. Misconceptions (`MISC-MUTABAYINA-*`, new, in `content/practice/misconceptions.json`)

| Id | Wrong belief | Lab shows it | Caught by |
|---|---|---|---|
| `SUB-FLIP` | subtracting or adding a negative reverses the direction | comb with c < 0: no crossing | M1 Q1, test 1, bank L1 |
| `NEG-NOFLIP` | × / ÷ by a negative number keeps the direction | the crossing (T1, T2) | M3 A, test 3–4, all levels |
| `POS-FLIP` | × / ÷ by a positive number (esp. < 1, or a division) reverses | متقدم ×1/2: threads converge, no crossing | M1 Q2, test 2 |
| `ZERO` | × 0 keeps a strict inequality | T3: 0 = 0 | M1 Q4, bank L2 |
| `ONE-SIDE` | operates on one side only | (bank) | test 2 |
| `DIFF-CONST` | adding different numbers to the two sides keeps the order | E2 « لا يمكن الحكم » | E2, test 1 |
| `BOUND-ORDER` | after a reversal, writes the bracket with its ends in the wrong order (0 ≤ … ≤ −6) | T2 band edge | M3 C, test 5, L3 |
| `COEF-LOST` | forgets the coefficient (5 − 2t treated as 5 − t) | — | test 5 |
| `NEG-BOTH` | when a and b are negative the order reverses by itself | T2 start, comb trial | M0 5–6, bank L1 |
| `RESULT-FLIP` | reverses because the RESULT is negative (3x < −6 ⟹ x > −2) | — | test 4, bank L2 |

## 9. Practice bank — `content/practice/3am/mutabayinat-amaliyat/` (5 levels × 10)

**Corpus.** `exams-index.json › coverage['3am.m5.r05'] = 5`. I read the PDFs (rendered at 80 dpi). FAITHFUL `term_exam` candidates (inequality
steps only):

| File / ex | Term (header) | What it asks | Use |
|---|---|---|---|
| `3am-s3-47` ex 1 (row II) | الفصل الثالث | mcq with justification: « x > 3 ⟹ −2x + 7 = 1 / > 1 / < 1 » → < 1 | L1 / L2 |
| `3am-s3-59` ex 1 q3 | الفصل الثالث | « x > 2 ⟹ −3x + 1 … » → < −5. Q1–2 are fraction arithmetic: `counted: false` | L2 |
| `3am-s3-57` ex 1 q3 | الفصل الثالث | « −2x − 2 > 4: find an inequality with x first » → x < −3. Q1–2 (test −1, solve the equation) `counted: false` (muadalat) | L2 / L4 |
| `3am-s3-51` ex 3 q2 | الفصل الثالث | two term averages sum 19,28 with a difference of 4,36 (equation, `counted: false`); « the least term-3 average to pass » → (19,28 + m)/3 ≥ 10 ⟹ m ≥ 10,72 | L4 |
| `3am-s2-80` « الوضعية » | الفصل الثاني | square plot of perimeter 72 m (side 18); S1 = 6x, S2 = 324 − 6x; test 6x < 324 − 6x at x = 18 and x = 30; deduce when Amine's part is larger → 12x < 324 ⟹ x < 27, with 0 ≤ x ≤ 18 so always | L5 |

**Honest count: 5 faithful `term_exam` sheets** (one per exercise; never two sheets on the same exercise).

**Plan per level:**

| Level | Content | Provenance |
|---|---|---|
| L1 (one direct skill, 2–3 ن) | « أكمل بالرمز », « صحيح أم خطأ » | 1 `term_exam` (`3am-s3-47`), 5 `adapted` (`ex-8`, `ex-9`, `ex-10` « compare, then deduce », `ex-11`, `ex-12`), 4 `term_exam_modelled` `modelledOn: "3am-s3"` |
| L2 (compute then « علّل ») | deduce down to x, the inverse condition (`ex-7`), × 0 | 2 `term_exam` (`3am-s3-59`, `3am-s3-57`), 2 `adapted` (`ex-7`, `ex-15` / `ex-16`), 6 modelled |
| L3 (complete 3–4-question exercise) | bracket ax + b, compare two expressions | 4 `adapted` (`ex-19`, `ex-24`, `ex-13`, `ex-17` / `ex-18`), 6 modelled `modelledOn: "3am-s3"` |
| L4 (with another lesson of the term, `counted: false`) | equation then inequality (averages, prices) | 1 `term_exam` (`3am-s3-51` ex 3), 1 `adapted` (`ex-27`), 8 modelled `modelledOn: "3am-s3"` |
| L5 (« الوضعية الإدماجية (08 ن) », two parts, a justified decision) | areas / loads / a temperature scale with a negative factor | 1 `term_exam` (`3am-s2-80` situation), 9 modelled `modelledOn: "3am-s2"` / `"3am-s3"` (e.g. a truck over a bridge, modelled on the 2AM context `2am-s2-72` ex 5 but written as a 3AM sheet) |

Totals: 5 `term_exam`, ~33 `term_exam_modelled`, ~12 `adapted`.

Every textbook element destined here that the modules do not cite MUST be cited by one adapted sheet (`check:textbook`). Badges « على منوال
اختبار الفصل الثاني / الثالث » follow each source paper's header; `adapted` sheets keep `badge: null`.

**Answer types:** `choice` (a symbol among `<` `>` `≤` `≥` « لا يمكن الحكم », or a whole inequality among four), `rational` (a bound), `selfCheck` for
« برّر ». Each LP is primary on ≥ 8 questions.

**Oracle** `scripts/practice-oracle/mutabayinat-amaliyat.mjs`, own BigInt rationals, never `packages/core`:
1. symbolically, it applies the operation chain with its own sign rule;
2. by WITNESS, it samples 200 pairs a < b (or a bracket of x) on a rational grid and checks that the key relation holds for every sample;
3. each distractor must fail on at least one sample; « لا يمكن الحكم » requires samples of both signs;
4. brackets of ax + b are recomputed at both ends;
5. each `term_exam` step is recomputed from the statement's numbers (10,72 ; 27 ; −5 ; −3).

## 10. Risks & owner questions

1. **Missing net link `3am.m5.r04 → 3am.m5.r05`** (README Q1). Without it the sign-of-difference tool is recalled in a box, but it is not
   measured by « أستعدّ » and has no LP edge.
2. **Same-item cross-lesson edges** toward `musawiyat-amaliyat` (README Q2).
3. **« استنتج متباينة طرفها الأول x »** (now-75-2, ex-14…16, `3am-s3-57`) is, technically, solving an inequation, which is the 4AM item. The
   3AM book and the 3AM term exams ask for it, so it stays, with the book's wording only. No « حلّ », no set, no number line of solutions. The
   owner should confirm.
4. **The extraction mis-reads `act-2` 5)** (second row decidable) and transcribes `ex-7`, `ex-9`, `ex-17`, `ex-18` incompletely. Fix and
   record them in `discrepancies`.
5. **`ex-27` uses bounds on two quantities.** Done by two ×positive steps. If a reviewer prefers « no product of two brackets in 3AM », drop
   it to the bank only (it stays cited).
6. **`loom-threads` T2 `band`** draws an infinite band clipped at the beam's end. Draw a fade plus an arrow, and say in the lab's line
   « وكل الأعداد بعدها ».

## 11. Generator checklist

- [ ] `build-extraction.py`:
  - [ ] re-routing (README table: `ex-19`, `ex-23`, `ex-24`, `ex-26`, `ex-27` → here);
  - [ ] re-read this lesson's elements at 200 dpi, `verified: True`, `Fraction` assertions for every answer above;
  - [ ] module numbers;
  - [ ] discrepancies (`act-2` 5), `ex-7`, `ex-9`, `ex-17`, `ex-18`);
  - [ ] boundary header updated;
  - [ ] `python3 build-extraction.py`.
- [ ] Core: `imageRay`, `boundAffine` in `linear.js` + sweeps in `linear.test.js`.
- [ ] Lab `loom-threads`:
  - [ ] registry entry (type id), `levels.js` presets, i18n `loomThreads.*`;
  - [ ] `logic/loomThreads.test.js` (crossing ⇔ c < 0 swept; coach to the end; discovery witnesses);
  - [ ] `algebra/loomThreads.render.test.jsx` (« opens on its CONTEXT then ONE question », « says each thing ONCE », DOM contract);
  - [ ] MANIPULATION_CONTRACT section;
  - [ ] screenshots at 1024×768, 1280×800, 1366×768, 768×1024 (initial, comb trial, crossing, 0 = 0, formal phase), looked at and iterated.
- [ ] Lesson files (§3 layout).
  - `lesson.config.js` header:
    - design: entry chosen, entry rejected (a)(b)(c);
    - الكفاءات changes.
  - Config fields:
    - `teachesLearningPointIds` on every learning module;
    - resources: the two levels share the same `objective`, the M2 resource has no `level`;
    - `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'loom' }`;
    - `lessonProblem` = مسألة 1;
    - `estimatedDurationMin` 85.
  - Knowledge:
    - `knowledge.jsx`, `knowledgeGraph.js`, `knowledgeMapMode: 'progressive'`;
    - `predictPrompt` on P1, P2, P3, P4.
- [ ] `content/content.test.js`:
  - every key above recomputed with its OWN BigInt rationals, never `linear.js`;
  - every distractor false;
  - `FINAL` options found literally in `Module08Itqan.jsx` (backslashes doubled).
- [ ] `content/problems.test.js` for the three مسائل.
- [ ] `_unit/prepDiagnostic`: add this lesson's items if the unit diagnostic lists lessons (`prepDiagnostic.test.js` follows the catalogue).
- [ ] e2e: `apps/web/e2e/lesson-kit/3am-musawiyat-mutabayinat-mutabayinat.mjs`.
  - No `[data-module-brief]` above the lab; lab before the first question; bricks absent before their answer; coach step id; the crossing
    by real drag, tap and keyboard.
  - Copy a block into `moyen-retrofit-phase1.mjs`.
- [ ] Bank (section 9): `active.json`, `exam-style.json`, `policy.json`, oracle imported in `scripts/practice-answer-oracle.test.mjs`.
- [ ] Gates:
  - [ ] `npm run generate:lesson-index`;
  - [ ] `npm test`;
  - [ ] `npm run check:lessons` (validate --strict, textbook, predict prompts, entry budget ≤ 330 KB);
  - [ ] `npm run build`;
  - [ ] browser at 768 and 1280, RTL.
- [ ] Publish (guide §11, coordinator):
  - [ ] catalogue flip: `available`, final `pointsToLearn` (§2), `durationMinutes: 61`, `difficulty: "متوسط"`, `icon: "🧶"`, `pointPrerequisites`
    (§2);
  - [ ] `npm run generate:learning-net`;
  - [ ] export/import curriculum + content registry;
  - [ ] publish its modules and exercises in the LOCAL DB;
  - [ ] commit, fast-forward `dev`, push.

## Generator notes (extraction prepared 2026-10-26)

`build-extraction.py` was updated and `extraction.json` rebuilt; `npm run check:textbook` passes (this lesson's elements are « pending » until it is published).

**Re-routing applied.** `ex-19`, `ex-23`, `ex-24`, `ex-26`, `ex-27` now go to this lesson. `ex-28` and `ex-62` stay with `hasr-adad-ushri`. `ex-8`…`ex-12` and `ex-18` have `module: None` and the note « cited by the bank ».

**Verified (`verified: True`, exact `Fraction` assertions, grid sweeps over rationals).** `prep` 7–8, `act-2`, `act-2b`, `know-2a`, `know-2b`, `method-2`, `now-75-1`, `now-75-2`, `ex-6`…`ex-19`, `ex-23`, `ex-24`, `ex-26`, `ex-27`, `self-3`, `self-4`. Pages 71–75, 78–79 and 81 were re-read at 170 dpi, and the p. 75 « دوري الآن » at 400–600 dpi.

**Final DEST for this lesson** (module numbers follow §7):

| Element | Module |
|---|---:|
| `prep` items 7–8 | 0 |
| `know-2a`, `know-2b` | 2 |
| `method-2`, `now-75-2`, `ex-19` | 3 (method B, A, C) |
| `act-2` (E1, E2), `act-2b` (E3), `ex-6` (E1), `ex-13` and `now-75-1` (E4), `ex-14`/`15`/`16` (E5, `now-75-2` is also E5), `ex-17` and `ex-7` (E6), `ex-23`/`24` (E7), `ex-26` (E8) | 4 |
| `ex-27` | 7 (مسألة 3) |
| `self-3`, `self-4` | 8 |
| `ex-8`…`ex-12`, `ex-18` | None (bank) |

**Corrections against the scan.**
- **The plan was right:**
  - `ex-7`: the printed hypothesis is `5m ≥ 0`, `m − 1 ≤ 0`, `1 + 4m > 0`, `3 − 2m < 0`, and the blank conclusion is `m ≥ …`, `m ≤ …`, `m > …`, `m > …`. Answers 0 ; 1 ; −1/4 ; 3/2 (hypothesis and conclusion were swapped in the old transcription).
  - `ex-9`: > ; > ; > ; <.
  - `ex-17`: ≤ ; ≤ ; ≥ ; ≥.
  - `ex-18`: ≥ ; < ; ≤ ; >.
  - `act-2` part 5 (it is at the TOP of p. 73): `a − 7/2 … b − 9/2` is undecidable (the sign of `(a − b) + 1` is unknown: <, = and > all occur); `a + 3/5 … b + 6/5` is `<`; `a − 4 < b − 4`; `a + 3 < b + 3`.
- **The plan was WRONG on `now-75-2`.** The scan prints `x − 8 > 7` (not `7 > x − 8`), so the answer is `x > 15`. The other two lines agree: `−3x > 15` ⟹ `x < −5`; `9 > −x/4` ⟹ `x > −36`. The old stored answer `x < 15` was wrong. The lesson uses its own numbers anyway (E5, method A), so only the key of any exercise copied from it matters.
- `ex-24` prints « محصور بين 5cm و 6cm » with no symbol; the plan's `5 < P < 6` is kept.
- The old `act-2` « reading » (neither of the first two is decidable) is replaced; the second one IS decidable.
- `now-77-1` (belongs to `hasr-adad-ushri`, fixed here): 8,336 rounds to 8,34 (yes) and 8,345 to 8,35 (no); both stored answers were wrong. Never shown to students.
- Note on `prep` 7–8: the scan's options are (1) 2/3, (2) −2/3, (3) لا يمكن تعيينه and (1) −5/4, (2) −7/4, (3) لا يمكن تعيينه, so the extraction's keys (largest = 2/3, smallest = −7/4) stand.
- Every item is recorded in `DISCREPANCIES` (`act-2`, `ex-7`, `ex-9`, `ex-17`, `ex-18`, `now-75-2`, `ex-24`, `now-77-1`).

## Generator notes (lesson generated 2026-10-26)

Executed as planned (9 modules, lab `loom-threads`, bank 5 × 10). Minimal fixes and decisions, none redesigning the plan:
- **Distractors that were TRUE consequences.** The witness test of `content/content.test.js` requires every distractor to be false for at least one sample, so weaker true statements were replaced: final-test item 4 `x < 3` (implied by `x < −3`) became `x < −12`; E1/E4 bounds like `x + 3 > 4`, and the مسائل options `S < 74`, `25x ≤ 630`, `x ≤ 525` became false ones.
- **Free band not built.** « جرّب أعدادك » takes `a` and `b` only; the band bound / direction of the plan's متقدم free panel is a guided task only (`MANIPULATION_CONTRACT` § 2sexaquadragies).
- **Module 2** poses the lab alone (`levels={false}`, `reach` −3 < 2 → 6 and −4) in the `intro`, after a `brief` holding the two « تذكّر » boxes with their links (guide precedent), instead of opening on the first question.
- **Lab resources** carry `sourceElementIds` (`act-2b`, `know-2b`) because `validate:lessons --strict` requires it for levelled labs.
- **Knowledge map**: nodes for ≤ / ≥ / division and for comparing two expressions were added (every brick carried once).
- **Bank** (helper): 5 `term_exam` (all five source exercises read at the scan), 33 `term_exam_modelled`, 12 `adapted`; the word « حلّ » appears only for equations.
- **Glance**: three beams at 1024×768 needed a narrower gap, no carpet and tighter spacing (765 px).
