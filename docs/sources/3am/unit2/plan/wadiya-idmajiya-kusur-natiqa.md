# Plan — `wadiya-idmajiya-kusur-natiqa` « أدمج تعلّماتي — العمليات على الكسور والأعداد الناطقة » (3AM unit 2, synthesis)

Read the unit [`README.md`](README.md) first. The five lessons of the unit are published before this synthesis. The shape is the
unit-1 / 4AM synthesis reference (`4am/…/wadiya-idmajiya-aadad`, `…/wadiya-idmajiya-judhur`; the 3AM unit-1 synthesis plan
`docs/sources/3am/unit1/plan/wadiya-idmajiya-aadad-nisbiya.md` follows the same shape).

## 1. Identity

- **Code** `wadiya-idmajiya-kusur-natiqa` · **title** « أدمج تعلّماتي — العمليات على الكسور والأعداد الناطقة » · **unit** `kusur-natiqa` ·
  catalogue order 9 · `kind: synthesis` · `prerequisiteLessonCodes`: the five unit lessons.
- **Folder** `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/kusur-natiqa/wadiya-idmajiya-kusur-natiqa/`, with ALL its module
  files `Module00Astaidd.jsx`, `Module01Wadiya1.jsx` … `Module06Wadiya6.jsx`, `Module07TahlilWadiya.jsx`, `Module08Ahill.jsx`.
  `registry.test.js` fails on a declared module without a route.
- **Textbook** (book p. = pdf − 1 in this unit):
  - « أدمج تعلّماتي » p. 36: `integration` (the pool tiled over three days, two documents: the pool's dimensions, the stock of bricks)
    and `evaluation` (« وضعية للتقويم »: four siblings, x, y, z, then 900 DA);
  - the unit تحدّ p. 22 (`challenge`);
  - `self-8` and `self-12` (p. 33);
  - the bank-only elements `deep-61`, `deep-67`, `deep-70`, `deep-72`, `deep-75`, `deep-78` (pp. 34–35);
  - `opener` (p. 22, the history box) as a « هل تعلم » in module 0.
- **Seeds the unit: no.** The synthesis moves its destinations in `build-extraction.py`, sets them `verified: True`, and leaves
  `check:textbook` with NO pending element in the unit.
- **Shape:**
  - 00 أستعدّ;
  - 01–06 « الوضعية التدريبية 1…6 » (`track: 'problem'`, `practice_lab`);
  - 07 « تحليل الوضعية النهائية للاختبار »;
  - 08 « وضعية الاختبار النهائي ».

## 2. Programme & net

- `programmeItems: []` (catalogue). One LP is needed (4AM pattern; unit-1 owner question 3): **P1** « حلّ وضعية إدماجية بتوظيف العمليات
  على الكسور والأعداد الناطقة: المقلوب والقسمة، المقارنة، الجمع والطرح، وسلاسل الحساب » → `3am_wadiya-idmajiya-kusur-natiqa_P1`.
- `pointPrerequisites`:
  - P1 ← `3am_maqlub-qismat-kasrayn_P3`;
  - P1 ← `3am_tasawi-muqaranat-kasrayn_P3`;
  - P1 ← `3am_jam-tarh-kasrayn_P2`;
  - P1 ← `3am_adad-natiq_P3`;
  - P1 ← `3am_amaliyat-natiqa_P4`.

  These are the unit's own lessons, all published.
- `reviewLinksForLesson` is empty (no item). « أستعدّ » measures one key الكفاءة of each lesson, and its advice text names the five
  lessons.
- noRebuild: nothing is taught.

## 3. Boundary

No new notion. Every question uses only:
- the reciprocal and division of fractions;
- equality, comparison and order;
- sums and differences with a common denominator;
- rationals (sign, writing, order);
- chains of operations on rationals;
- the 2AM product « a fraction of a quantity » (a/b × N) — the « fraction of the remainder » pattern.

It uses NO percentages (3AM unit 6), NO equation-solving technique (unit 5: an unknown whole is found by ONE division by a fraction, as
in `maqlub`'s problems), NO Thales (units 8–9), and NO powers (unit 3).

## 4. Textbook analysis

| Element | What it asks | Idea to keep | Platform use |
|---|---|---|---|
| `integration` (p. 36) | a pool 9/2 m × 2 m × 3/2 m: tile the floor and walls, 1/3 on day 1, 3/7 of the rest on day 2, the rest on day 3; the brick stock (two full boxes = 15 m³…) | a fraction of the REMAINDER; area of a box's faces | **Training situation 1, redesigned** (own pool 5 m × 3 m × 3/2 m, own fractions). The book's « حل مختصر » misprint (59/7 for 57/7) is recorded in the extraction. The brick-stock document (volume in boxes) is dropped: its « كمية الآجر » in m³ is ambiguous. |
| `evaluation` (p. 36) | four siblings: Jaafar 1/3, Jamal 3/5 of the rest, two sisters share the rest; which of x, y, z is a sister's share; the sisters' total 900 DA → Jaafar's and Jamal's | choose the right EXPRESSION, then the whole from a part | **Training situation 2, redesigned** (own fractions 2/5, 1/2 of the rest; 1800 DA) |
| `challenge` (p. 22) | Hisham: 1/4, 1/5, then 2/3 of the rest → 11/60 | the unit's whole chain | **Modules 7 + 8, redesigned** (Meriem: 1/3, 1/4, then 3/5 of the rest → 1/6; 1500 DA → 9000 DA) |
| `self-8`, `self-12` | reciprocal of 3/7 + 3/5 (35/36); x/z from x/y = 2/5 and y/z = 5/3 (2/3) | two lessons in one item | « أستعدّ » items 1 and 6 (own numbers) |
| `opener` | Abu al-Wafa al-Buzjani (10th c.) and al-Kashi (1427) on fractions | history | module 0, a short « هل تعلم » in platform words (no claim beyond the box) |
| `deep-61`, `deep-67`, `deep-70`, `deep-72`, `deep-75`, `deep-78` | triangle area with fraction sides; write a problem; sold 2/3 then 3/5 of the rest; land shares + price; butter from milk; a survey 400 → 600 | integration registers | bank (one adapted sheet each); `deep-70`'s register also inspires training situation 4 |

## 5. Modules (9) — each with `objectives`

`durationMinutes` = **40** (4AM syntheses: 30–40; copy the `wadiya-idmajiya-aadad` rule that `validate:lessons` applies to a synthesis).

**00 أستعدّ** — `objectives`: « أتحقّق من أنّي أقسم الكسور وأقارنها وأجمعها وأحسب بالأعداد الناطقة قبل الوضعيات ».

Six statements:

| # | Statement | Key | Lesson |
|---|---|---|---|
| 1 | « مقلوب $\frac14+\frac23$ هو $\frac{12}{11}$ » (`self-8` rewritten) | ✓ (11/12 → 12/11) | jam-tarh + maqlub |
| 2 | $\frac58>\frac35$ | ✓ (25 > 24) | tasawi |
| 3 | $\frac56-\frac14=\frac7{12}$ | ✓ | jam-tarh |
| 4 | $\frac9{-12}=\frac34$ | ✗ (−3/4) | adad-natiq |
| 5 | $-\frac23\div\frac49=-\frac32$ | ✓ | amaliyat |
| 6 | « إذا كان $\frac xy=\frac34$ و $\frac yz=\frac25$ فإنّ $\frac xz=\frac3{10}$ » (`self-12` rewritten) | ✓ | maqlub (product of the ratios) |

A « هل تعلم » (`opener`, rewritten) closes the module.

**01 الوضعية التدريبية 1 — تبليط حوض النادي** (`integration` redesigned)
- `objectives`: « أحسب مساحة أوجه حوض بأبعاد كسرية وأتتبّع كسر الباقي يومًا بعد يوم ». Mobilises maqlub P3, jam-tarh P2, the 2AM product,
  amaliyat P4.
- Context: « حوض سباحة صغير للنادي على شكل متوازي مستطيلات: طوله $5\,\text{m}$ وعرضه $3\,\text{m}$ وعمقه $\frac32\,\text{m}$ . بلّط العمّال في
  اليوم الأول $\frac13$ من القاع والجدران، وفي اليوم الثاني $\frac38$ مما بقي، وأنهوا في اليوم الثالث. »
- Questions and answers:
  1. the area to tile (floor + 4 walls) → 15 + 2 × 5 × 3/2 + 2 × 3 × 3/2 = 15 + 15 + 9 = **39 m²**;
  2. day 1 → **13 m²**;
  3. day 2 → 3/8 × 26 = **39/4 m²** = 9,75 m²;
  4. day 3 → 26 − 39/4 = **65/4 m²**;
  5. « ما الكسر الذي يمثّله عمل اليوم الثالث من الحوض كلّه؟ » → (1 − 1/3)(1 − 3/8) = 2/3 × 5/8 = **5/12** (check: 65/4 ÷ 39 = 5/12).

**02 الوضعية التدريبية 2 — جائزة الإخوة** (`evaluation` redesigned)
- `objectives`: « أختار العبارة التي تمثّل حصّة، ثم أجد الكلّ من جزئه ». Mobilises jam-tarh P2, amaliyat P4, maqlub P3.
- Context: « اقتسم أربعة إخوة جائزة مالية: أخذ الأكبر $\frac25$ منها، وأخذ الثاني نصف الباقي، واقتسمت الأختان ما بقي بالتساوي. »
- Questions and answers:
  1. « ما الكسر الذي يمثّل حصّة الثاني؟ » → 1/2 × 3/5 = **3/10**;
  2. « أيّ العبارات تمثّل حصّة أخت واحدة؟ » →
     - $x=\left(1-\frac25-\frac12\right)\div2=\frac1{20}$ ✗;
     - $y=\left(1-\frac25-\frac12\times\frac35\right)\times\frac12=\frac3{20}$ ✓;
     - $z=\left(\frac35-\frac12\right)\times2=\frac15$ ✗;
  3. « إذا كانت حصّتا الأختين معًا $1800$ DA ، فما قيمة الجائزة؟ » → 1800 ÷ 3/10 = **6000 DA**;
  4. the eldest's and the second's shares → **2400 DA**, **1800 DA**.

**03 الوضعية التدريبية 3 — جرار العسل**
- `objectives`: « أقسم كمية على سعة كسرية وأقارن ثمنين للكيلوغرام ». Mobilises maqlub P2/P3, tasawi P3.
- Context: « جنى نحّال $\frac{27}4\,\text{kg}$ من العسل. يبيع الجرّة الصغيرة ($\frac38\,\text{kg}$) بـ $900$ DA والجرّة الكبيرة ($\frac58\,\text{kg}$) بـ $1450$ DA. »
- Questions and answers:
  1. small jars → **18**;
  2. large jars → 27/4 ÷ 5/8 = 54/5 → **10 full jars**, and 27/4 − 10 × 5/8 = **1/2 kg** left;
  3. « ما ثمن الكيلوغرام في كل جرّة؟ » → 900 ÷ 3/8 = **2400 DA**; 1450 ÷ 5/8 = **2320 DA**;
  4. « أيّ الجرّتين أوفر للزبون؟ » → the large one.

**04 الوضعية التدريبية 4 — رحلة الدرّاجات** (register of `deep-70`)
- `objectives`: « أجد طول مسار من الجزء الباقي منه ». Mobilises jam-tarh P2, maqlub P3.
- Context: « قطع فوج النادي $\frac25$ من مسار الرحلة صباحًا، و $\frac13$ منه بعد الظهر، وبقي له $16\,\text{km}$ . »
- Questions and answers:
  1. the part covered → **11/15**;
  2. the part left → **4/15**;
  3. the length of the route → 16 ÷ 4/15 = **60 km**;
  4. the morning and afternoon distances → **24 km** and **20 km**;
  5. « في أيّ فترة قطعوا مسافة أطول؟ » → the morning (2/5 > 1/3).

**05 الوضعية التدريبية 5 — ليلة باردة في سطيف** (rationals)
- `objectives`: « أحسب بأعداد ناطقة سالبة لأتتبّع درجة الحرارة وأقارن سرعتي انخفاض ». Mobilises amaliyat P1/P2/P4, adad-natiq P3.
- Context: « عند الساعة 18:00 كانت الحرارة $4^\circ\text{C}$ . انخفضت بانتظام $\frac54^\circ$ في الساعة مدّة 4 ساعات، ثم $\frac13^\circ$ في الساعة مدّة
  3 ساعات. »
- Questions and answers:
  1. at 22:00 → 4 + 4 × (−5/4) = **−1 °C**;
  2. at 1:00 → −1 + 3 × (−1/3) = **−2 °C**;
  3. « متوسّط التغيّر في الساعة بين 18:00 و 1:00 » → (−2 − 4) ÷ 7 = **−6/7 °C**;
  4. « في مدينة أخرى كان المتوسّط $-\frac56$ : أيّهما انخفضت أسرع؟ » → −6/7 < −5/6 (−36/42 < −35/42) → Sétif.

**06 الوضعية التدريبية 6 — ورقة إجابات سارة** (judge a classmate)
- `objectives`: « أحكم على حسابات زميلة وأصحّح الخاطئ منها مع التعليل ». Mobilises all five lessons.
- Five answers to judge (صحيح / خطأ, then the corrected value):
  - a) $\frac34+\frac25=\frac59$ → خطأ, 23/20 (ACROSS);
  - b) $\frac{-6}{-9}=-\frac23$ → خطأ, 2/3 (TWONEG);
  - c) $\left(\frac56-\frac32\right)\times\frac94=-\frac32$ → صحيح;
  - d) $\frac12-\frac34\times\frac23=-\frac16$ → خطأ, 0 (PRIORITY);
  - e) $\frac{14}5\div\frac7{10}=4$ → صحيح.
- Then « ما نقطة سارة من 5؟ » → **2**.
- Bonus (`deep-41` register, own numbers): a sum pyramid with base −1/2, 2/3, −1/4 → middle row 1/6, 5/12 → top **7/12**.

**07 تحليل الوضعية النهائية للاختبار — حصّالة مريم** (the تحدّ, redesigned, analysed, NOT solved)
- `objectives`: « أقرأ الوضعية النهائية وأفرز معطياتها وأختار الحسابات وترتيبها قبل أن أحلّها ».
- Context: « أنفقت مريم $\frac13$ مما ادّخرته في حصّالتها على حقيبة مدرسية، و $\frac14$ منه على كتب، ثم أهدت $\frac35$ ما بقي لجمعية خيرية
  في الحيّ. »
- Three analysis stages (4AM pattern):
  1. **Sort the data**:
     - which fractions are « of the WHOLE savings » (1/3, 1/4);
     - which is « of the REMAINDER » (3/5);
     - the unknown is a fraction, then (module 8) an amount.
  2. **Choose the operations**, as cards to order:
     - « what is spent first » = sum;
     - « what is left after » = 1 − sum;
     - « the gift » = 3/5 × the remainder;
     - « what is left at the end » = the remainder − the gift.
  3. **The plan**: the trap « 3/5 of the whole » is exposed by a counter-check (1 − 1/3 − 1/4 − 3/5 = −11/60 < 0: impossible).

**08 وضعية الاختبار النهائي**
- `objectives`: « أحلّ وضعية الحصّالة وأجد المبلغ الكلّي ».
- Five evaluated stages:

| Stage | Question | Key | Distractors |
|---|---|---|---|
| 1 | ما أنفقته أوّلًا | $\frac13+\frac14=\frac7{12}$ | $\frac27$ (ACROSS) · $\frac1{12}$ (product) |
| 2 | الباقي بعدها | $\frac5{12}$ | $\frac12$ |
| 3 | الهدية | $\frac35\times\frac5{12}=\frac14$ | $\frac35$ (SYN-WHOLE: « of the whole ») · $\frac{3}{12}+\frac{5}{12}$ |
| 4 | ما بقي في النهاية | $\frac5{12}-\frac14=\frac16$ | $-\frac{11}{60}$ (SYN-WHOLE: 1 − 1/3 − 1/4 − 3/5) · $\frac14$ (the gift given as the rest) |
| 5 | إذا كان الباقي $1500$ DA ، فما المبلغ المدّخر؟ وما أكبر إنفاق؟ | $1500\div\frac16=9000$ DA ; the bag $3000$ DA (books 2250, gift 2250) | $250$ (× 1/6: NOFLIP) · « الهدية » (compared fractions of different wholes) |

These five stages are the final test. The distractors encode the unit's misconceptions; new synthesis ids `MISC-SYN-KUSUR-*` only where
no lesson id fits (SYN-WHOLE: taking a fraction of the whole instead of the remainder).

## 6. Practice bank — `content/practice/3am/wadiya-idmajiya-kusur-natiqa/` (5 levels × 10)

**Corpus** (integration situations whose FRACTION parts belong to this unit; term 1 unless noted):
- `3am-s1-3` ex 4 (vegetable shares 1/4, 2/6, 10/24: largest share, the whole land planted?);
- `3am-s1-103` ex 5 III (tiling over three days: 2/3, 1/12, 1/4 — which day, was it enough, the area each day: the area part needs
  Thales → given);
- `3am-s1-104` ex 5 and `3am-s1-108` ex 5 (three brothers' contributions / shares, 120 000 DA);
- `3am-s1-109` ex 5 (an orchard: apple, pear and apricot fractions);
- `3am-s1-1` ex 3 (phone credit: a fraction of the remainder, the whole credit);
- `3am-s1-5` ex 5 (the Skikda cable car: the remaining fraction);
- misfiled `1am-s1-100` ex 5 (a father's land for two sons);
- `3am-s3-56` ex 5 (trees watered from a tank — term 3; its volume part is unit 10).

**Honest count of FAITHFUL `term_exam`: 5–8.** It is faithful only when the fraction part can stand alone. The Thales / volume parts belong
to later units and are given as data or `counted: false`.

| Level | Content | Provenance |
|---|---|---|
| L1 | mixed calculations: one item from each lesson (reciprocal, compare, sum, standard form, a chain) | 10 modelled (the « exercise 2 » of a term-1 paper) |
| L2 | short contexts: a fraction of a quantity, the whole from a part, compare two shares — with « برّر » | 2 term_exam (`3am-s1-1` ex 3, `3am-s1-5` ex 5 — fraction parts) · 6 modelled · 2 adapted (`deep-75`, `deep-78`) |
| L3 | shares of a land / a prize / a harvest over days: the largest share, is it all, what remains | 3 term_exam (`3am-s1-3` ex 4, `3am-s1-103` ex 5 III, `3am-s1-109` ex 5) · 5 modelled · 2 adapted (`deep-70`, `deep-72`) |
| L4 | areas and lengths with fraction sides (`deep-61` register), signed rationals (temperatures, levels) | 1 term_exam (`1am-s1-100` ex 5) · 7 modelled · 2 adapted (`deep-61`, `deep-67`) |
| L5 | « الوضعية الإدماجية (08 ن) », two parts, a justified decision (which offer, is it enough, who receives most) | 2 term_exam (`3am-s1-104` ex 5, `3am-s1-108` ex 5 — share parts) · 8 modelled |

**Badges:** « على منوال اختبار الفصل الأول » (« الثالث » for `3am-s3-56`). Modelled sheets: `platform_addition`,
`reason: "term_exam_modelled"`, `modelledOn: "3am-s1"`.

**Answer types:** `rational` (irreducible), `choice`, `selfCheck`. Every question has a `learningPoints` primary: the synthesis P1, or the
lesson LP it mobilises — follow what the 4AM synthesis banks do.

**Oracle:** `scripts/practice-oracle/wadiya-idmajiya-kusur-natiqa.mjs`. It REUSES the chain evaluator written for `amaliyat-natiqa`'s
oracle (import its helper; no new parser) and recomputes every key from the statement's own numbers.

## 7. Risks & owner questions

1. **One LP with `programmeItems: []`.** The same question as unit 1's synthesis: if `validate:lessons` / the net invariant refuses it,
   give the synthesis `programmeItems: ['3am.m1.r03', … , '3am.m1.r08']`.
2. **The challenge redesign** (1/3, 1/4, 3/5 → 1/6) versus the unit card's book text (README owner question 2).
3. **The book's brick-stock document is dropped** (an ambiguous volume of bricks). Confirm.
4. **Training situation 5 uses signed rates** (an average change). It is a quotient of rationals, not a percentage and not a function.

## 8. Generator checklist

- [ ] `build-extraction.py`:
  - `integration` → module 1; `evaluation` → module 2; `challenge` → modules 7–8;
  - `self-8`, `self-12`, `opener` → module 0;
  - the bank's `deep-*` → `None`;
  - all `verified: True`;
  - `check:textbook` green with no pending element in the unit.
- [ ] Lesson folder:
  - nine module files;
  - `content/problems.js` + `problems.test.js` (every answer recomputed with exact fractions; every distractor false);
  - `content/textbook.js`;
  - a progressive knowledge map;
  - `objectives` on every `ContentModule`.
- [ ] Bank (50) + oracle + `active.json` / `exam-style.json` / `misconceptions.json` entries.
- [ ] `validate:lessons`, `generate:lesson-index`, `generate:learning-net`, `check:lessons`, `npm test`, `build`.
- [ ] e2e: extend the unit's lesson-kit script with the synthesis (the module routes mount, module 8 evaluates).
- [ ] Publish (coordinator, guide §11):
  1. `pointsToLearn` (P1), `durationMinutes` 40, `difficulty: 'متقدم'`, `icon`, status `available`;
  2. export / import;
  3. local DB publish (lesson, 9 modules, 50 exercises);
  4. commit, push `dev`;
  5. progress report: unit 2 complete.

## 12. Generator notes (2026-10-26)

Generated INTO the catalogue entry; bank by a helper, lesson by the lead. Changes to the plan:
- **`durationMinutes` is 30, not 40**: `validate:lessons` computes a synthesis as modules 0 + 7 + 8 (6 + 12 + 12 min), problem tracks excluded; the plan's 40 was a guess.
- **Final test E2 distractors**: the plan's `1/2` has no named error behind it; replaced by `7/12` (the spent fraction taken for the rest), `5/7` (1 − 2/7, following the ACROSS error of E1) and `11/12` (1 − 1/12, following the product error). E3 gets `7/20` (3/5 of the SPENT fraction) in place of the plan's `3/12 + 5/12` kept as the fourth option; E4 gets `1/3` (spent − gift).
- **Module 7** is five steps (sorter, three-stage analysis, whole-or-remainder, order of the calculations, the « 3/5 of the whole » counter-check) and the `situation` text carries the `1500 DA` datum, so that module 8 stage 5 needs no new statement; the ordering « cards » are a one-of-four `TapQuestion` (no new component).
- **Training situation 6** keeps the plan's five answers; the pyramid bonus is its part 4. **Situation 2** shows `x`, `y`, `z` with `y` correct as planned. **Situation 5** uses Sétif and « مدينة أخرى ».
- **`challenge`** is destined to module 7 (`duplicatedIn` the unit page: the unit card keeps the book's Hisham text until the owner decides, README question 2). `self-8`, `self-12`, `opener` → module 0 (items 1, 6 and the « هل تعلم »), `integration` → 1, `evaluation` → 2, all `verified: True` after re-reading pdf pp. 34 and 37; `deep-*` stay bank-only (`module: None`).
- **Bank (helper):** 8 `term_exam` (`3am-s1-1` ex 3, `3am-s1-5` ex 5, `3am-s1-3` ex 4, `3am-s1-103` ex 5, `3am-s1-109` ex 5, `1am-s1-100` ex 5, `3am-s1-104` ex 5, `3am-s1-108` ex 5; `3am-s3-56` is NOT used, no row of the table asks for it), 36 `term_exam_modelled`, 6 adapted (`deep-61, 67, 70, 72, 75, 78`; `deep-67` « write a problem » became a choose-the-computation question and one `selfCheck`).
- The two book misprints (`method-9` 23/33, integration 59/7) appear nowhere in the lesson or the bank.

