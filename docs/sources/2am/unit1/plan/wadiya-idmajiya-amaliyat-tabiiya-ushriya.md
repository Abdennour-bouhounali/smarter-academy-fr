# Plan — `wadiya-idmajiya-amaliyat-tabiiya-ushriya` « أدمج تعلّماتي — العمليات على الأعداد الطبيعية والأعداد العشرية » (2AM unit 1, synthesis)

Read the unit [`README.md`](README.md) first. The four lessons of the unit are published before this synthesis. Shape: the 1AM–3AM
synthesis reference (`docs/sources/3am/unit2/plan/wadiya-idmajiya-kusur-natiqa.md` and its generator notes; guide « Phase 0 entry 4 / 12 / 14 /
20 / 21 »).

## 1. Identity

- **Code** `wadiya-idmajiya-amaliyat-tabiiya-ushriya` · **title** « أدمج تعلّماتي — العمليات على الأعداد الطبيعية والأعداد العشرية » · **unit**
  `amaliyat-tabiiya-ushriya` · catalogue order 4 · `kind: synthesis` · `prerequisiteLessonCodes`: the four unit lessons (already in the catalogue).
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/amaliyat-tabiiya-ushriya/wadiya-idmajiya-amaliyat-tabiiya-ushriya/`, with ALL
  its module files `Module00Astaidd.jsx`, `Module01Wadiya1.jsx` … `Module06Wadiya6.jsx`, `Module07TahlilWadiya.jsx`, `Module08Ahill.jsx`
  (`registry.test.js` fails on a declared module without a route).
- **Textbook** (book p. = PDF + 3):
  - « أدمج تعلّماتي » p. 20: `integration` (°F → °C program, Laghouat at 50 °F) and `evaluation` (a carpenter's shelf kit and his stock — the
    question is cut at the page bottom, discrepancy 8);
  - `opener` (p. 6, history of the digits) → module 0 « هل تعلم »;
  - the bank-only elements `deep-37`, `deep-44`, `deep-45`, `deep-46`, `deep-51`, `deep-52` (pp. 18–19).
- **Seeds the unit: no.** The synthesis moves its destinations in `build-extraction.py`, sets them `verified: True`, and leaves
  `check:textbook` with NO pending element in the unit.
- **Shape:** 00 أستعدّ · 01–06 « الوضعية التدريبية 1…6 » (`track: 'problem'`, `practice_lab`) · 07 « تحليل الوضعية النهائية للاختبار » · 08
  « وضعية الاختبار النهائي ». No lab (a synthesis has none).

## 2. Programme & net

- `programmeItems: []` (catalogue, kept). One الكفاءة is added (precedent: the five 3AM syntheses; `coursesData.test.js` LP total +1):
  **P1** « حلّ وضعية إدماجية بترجمتها إلى سلاسل عمليات (دون أقواس أو بأقواس أو بخطّ كسر) ووصفها وحسابها، وتوظيف توزيع الضرب على الجمع
  والطرح لتبسيط الحساب » → `2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1`.
- `pointPrerequisites` (the unit's own published lessons):
  - P1 ← `2am_silsila-bidun-aqwas_P3`;
  - P1 ← `2am_silsila-bi-aqwas_P3`;
  - P1 ← `2am_wasf-silsila-hisab_P3`;
  - P1 ← `2am_tawzi-darb-jam-tarh_P4`.
- `reviewLinksForLesson` is empty (no item). « أستعدّ » measures one key الكفاءة of each lesson; its advice text names the four lessons.
- noRebuild: nothing is taught.

## 3. Boundary

No new notion. Every question uses only: chains without brackets (priority), brackets and the fraction bar, the calculator, naming and
describing a chain, writing one from words or a program, distributivity both ways and mental calculation — on naturals and decimals, every
value ≥ 0. Allowed 1AM tools: the four operations, the whole part of a quotient (Euclidean division, `qisma-iqlidiya-baqi`, published),
rectangle area and perimeter. NOT used: fractions as operations (2AM unit 2), relative numbers (unit 3), letters beyond « اختر عددًا » programs.

## 4. Textbook analysis

| Element | What it asks | Idea to keep | Platform use |
|---|---|---|---|
| `integration` (p. 20) | a program « اطرح 32، اضرب في 5، اقسم على 9 » turns °F into °C; Laghouat shows 50 °F: hot? (10 °C → cold); the freezing point in °F | a PROGRAM is a chain; apply it, describe it, reverse it | **Training situation 1, redesigned**: a thunder-distance program (« اضرب عدد الثواني في 340 ثم اقسم على 1000 »). Fahrenheit is NOT reused: the published 3AM unit-1 synthesis already uses it (README question 8) |
| `evaluation` (p. 20) | one shelf needs 4 long boards, 6 short, 12 small angles, 2 big angles, 5 screws; the stock: 16, 33, 200, 20, 510 → how many shelves (4: the long boards limit) | the bottleneck among several quotients; the leftovers | **Modules 7 + 8, redesigned** (bird-houses, own numbers, the brackets limit) |
| `opener` | the history of the digits (India, Arab scholars, al-Khwarizmi, Fibonacci in Béjaïa) | history | module 0 « هل تعلم » in platform words (no claim beyond the box) |
| `deep-37`, `deep-44`, `deep-45`, `deep-46`, `deep-51`, `deep-52` | crossword of chains; perimeter with a half circle; pentagon area; polygon in a rectangle; aquarium; red / blue boxes | integration registers | bank (one adapted sheet each; `deep-46`'s figure is cut: redrawn or dropped) |

## 5. Modules (9) — each with `objectives`

`durationMinutes`: modules 0 + 7 + 8 (≈ 30), `estimatedDurationMin` the sum (guide « Phase 0 entry 14 »).

**00 أستعدّ** — `objectives`: « أتحقّق من أدوات الباب كلّها قبل الوضعيات »:

| # | Statement | Key | Lesson |
|---|---|---|---|
| 1 | « $40 - 15 + 5 = 20$ » | ✗ (30) | `silsila-bidun-aqwas` |
| 2 | « $3 + 5 \times 2 = 13$ » | ✓ | `silsila-bidun-aqwas` |
| 3 | « $\frac{18+6}{4-1} = 8$ » | ✓ (24 ÷ 3) | `silsila-bi-aqwas` |
| 4 | « $(9 - 4) \times 6$ عبارة عن فرق » | ✗ (جداء) | `wasf-silsila-hisab` |
| 5 | « $8 \times (5 + 0{,}5) = 40 + 0{,}5$ » | ✗ (44) | `tawzi-darb-jam-tarh` |
| 6 | « $99 \times 6 = 600 - 6$ » | ✓ (594) | `tawzi-darb-jam-tarh` |

A « هل تعلم » (`opener`, rewritten) closes the module.

**01 الوضعية التدريبية 1 — برنامج الرعد** (`integration` redesigned)
- `objectives`: « أطبّق برنامج حساب وأكتبه سلسلة وأصفه، ثم أستعمله في الاتجاه المعاكس ». Mobilises bidun P1/P3, wasf P2/P3.
- Context: « نرى البرق قبل أن نسمع الرعد. لمعرفة بعد العاصفة بالكيلومتر: نعدّ الثواني بين البرق والرعد، نضرب العدد في 340 ، ثم نقسم الناتج على
  1000 . » (the sound travels about 340 m per second).
- Questions and answers:
  1. 6 s → $6 \times 340 \div 1000$ = **2,04 km**;
  2. « صِف السلسلة » → « حاصل قسمة جداء العددين 6 و 340 على 1000 » (choice among three sentences);
  3. « هل يجب ترتيب آخر للعمليات؟ » → no: × and ÷ only, from the left (choice with $6 \times (340 \div 1000)$ — same value: « القيمة نفسها هنا »);
  4. « تقول نسرين إنّ العاصفة على بعد 1,7 km : كم ثانية عدّت؟ » → **5 s** (check $5 \times 340 \div 1000 = 1{,}7$);
  5. « يُنصح بالابتعاد عن المكان المفتوح إذا كانت العاصفة على أقلّ من 3 km . عدّت 9 ثوانٍ: هل تبتعد؟ » → $9 \times 340 \div 1000 = 3{,}06$ km → not
     yet (just over 3), keep watching.

**02 الوضعية التدريبية 2 — قفّة السوق** (translation with brackets; `2am-s1-77` ex 1 ② register)
- `objectives`: « أختار السلسلة التي تترجم وضعية وأحسبها ». Mobilises bidun P3, bi-aqwas P1, wasf P3.
- Context: « اشترت أمّ يونس 3 kg من الطماطم بـ 80 DA للكيلوغرام و 2 kg من البطاطا بـ 60 DA للكيلوغرام، ودفعت 500 DA . »
- Questions and answers:
  1. « أيّ سلسلة تعطي الباقي؟ » → $500 - (3 \times 80 + 2 \times 60)$ ✓ ; $500 - 3 \times 80 + 2 \times 60$ (= 380, MISC-AQWAS-IGNORED) ;
     $(500 - 3) \times 80 + 2 \times 60$ ;
  2. → **140 DA**;
  3. « اكتبها دون الأقواس بحيث تبقى صحيحة » → $500 - 3 \times 80 - 2 \times 60$ (choice; « نطرح الثمنين واحدًا بعد الآخر »);
  4. « هل يكفي الباقي لشراء 2 kg من البصل بـ 65 DA ؟ » → 130 < 140: نعم.

**03 الوضعية التدريبية 3 — معدّل سمير** (bar + calculator; `2am-s1-75` ex 1 register)
- `objectives`: « أكتب معدّلًا بخطّ كسر وأحجزه على الآلة الحاسبة ». Mobilises bi-aqwas P3/P4.
- Context: « علامات سمير في ثلاثة فروض: 13 و 15,5 و 12 . المعدّل = مجموعها مقسومًا على 3 . حجز سمير على آلته: 1 3 + 1 5 , 5 + 1 2 ÷ 3 = »
- Questions and answers:
  1. the average → $\frac{13 + 15{,}5 + 12}{3}$ = **13,5**;
  2. « ما الذي ظهر على الآلة؟ » → **32,5** (12 ÷ 3 first);
  3. the right keys → « ( 13 + 15,5 + 12 ) ÷ 3 = »;
  4. « بعد فرض رابع صار المعدّل $\frac{13 + 15{,}5 + 12 + 17}{4}$ : هل تحسّن؟ » → 57,5 ÷ 4 = **14,375** > 13,5: نعم.

**04 الوضعية التدريبية 4 — فاتورة الكهربائي** (description ↔ chain)
- `objectives`: « أكتب سلسلة من وصفها وأقارن عرضين ». Mobilises wasf P2/P3, bidun P2.
- Context: « يطلب كهربائي 800 DA للتنقّل و 450 DA لكلّ ساعة عمل. ويطلب كهربائي آخر 1200 DA للتنقّل و 350 DA لكلّ ساعة. »
- Questions and answers:
  1. « ثمن 3 ساعات عند الأوّل، اكتبه سلسلة وصِفها » → $800 + 450 \times 3$ = **2 150 DA**, « مجموع العدد 800 وجداء العددين 450 و 3 »;
  2. at the second → $1200 + 350 \times 3$ = **2 250 DA**;
  3. for 5 hours → **3 050 DA** and **2 950 DA**;
  4. « أيّ العرضين أفضل لعمل يدوم 5 ساعات؟ » → the second.

**05 الوضعية التدريبية 5 — دكّان الحيّ** (distributivity, mental)
- `objectives`: « أحسب ذهنيًا بتوزيع الضرب في وضعية ». Mobilises tawzi P3/P4.
- Context: « يبيع صاحب الدكّان علب العصير بـ 98 DA للعلبة. اشترى منه نادي المدرسة 25 علبة. ويبيع الشريط بـ 12,5 DA للمتر: اشترى النادي 7 m
  أحمر و 3 m أزرق. »
- Questions and answers:
  1. the juice, mentally: $25 \times 98 = 25 \times (100 - 2) = 2500 - 50$ = **2 450 DA**;
  2. the ribbon two ways: $12{,}5 \times 7 + 12{,}5 \times 3 = 12{,}5 \times 10$ = **125 DA**;
  3. « ما المبلغ الكلّي؟ » → **2 575 DA**; « صِف السلسلة $25 \times 98 + 12{,}5 \times (7 + 3)$ » → مجموع.

**06 الوضعية التدريبية 6 — ورقة زميلة** (judge a classmate)
- `objectives`: « أحكم على حسابات زميلة وأصحّح الخاطئ منها مع التعليل ». Mobilises all four lessons.
- Five answers to judge (صحيح / خطأ, then the corrected value):
  - a) $18 - 6 + 2 = 10$ → خطأ, **14** (MISC-SILSILA-ADDFIRST);
  - b) $4 + 6 \times 5 = 34$ → صحيح;
  - c) $\frac{30+6}{10-4} = 6$ → صحيح;
  - d) $7 \times (8 + 2) = 7 \times 8 + 2 = 58$ → خطأ, **70** (MISC-TAWZI-FIRSTONLY);
  - e) « $5 \times (12 - 3)$ جداء » → صحيح.
- Then « ما نقطة زميلتك من 5؟ » → **3**.
- Bonus (`deep-40` register, own): « باستعمال الأعداد 3 ، 3 ، 3 ، 3 والعمليات والأقواس، اكتب سلسلة تساوي 1 ، ثم أخرى تساوي 10 » → e.g. $(3 + 3) \div (3 + 3) = 1$,
  $3 \times 3 + 3 \div 3 = 10$ (selfCheck, any correct chain accepted by the evaluator).

**07 تحليل الوضعية النهائية للاختبار — ورشة بيوت العصافير** (the `evaluation`, redesigned, analysed, NOT solved)
- `objectives`: « أقرأ الوضعية النهائية وأفرز معطياتها وأختار الحسابات وترتيبها قبل أن أحلّها ».
- Context (document 1, the kit): « يصنع نادي البيئة بيوتًا للعصافير. يحتاج كلّ بيت إلى 6 ألواح خشبية و 4 زوايا معدنية و 16 برغيًا. » Document 2, the stock:
  « في المخزن 45 لوحًا و 26 زاوية و 120 برغيًا. » Document 3, the sale: « يُطلى كلّ بيت بطلاء ثمنه 85 DA ، وتُشترى علبة غراء واحدة بـ 120 DA لكلّ البيوت،
  ويُباع البيت بـ 450 DA في معرض المدرسة. »
- Three analysis stages (4AM / 3AM pattern):
  1. **Sort the data**: what each document gives; « ما المطلوب؟ » (the number of bird-houses, then the profit);
  2. **Choose the operations** (cards to order, one-of-four `TapQuestion`): « لكلّ مادّة: قسمة المخزون على حاجة البيت الواحد » → « نأخذ الحاصل
     الصحيح » → « أصغرها هو عدد البيوت » → « الربح = المبيعات − (الطلاء + الغراء) »;
  3. **The plan's trap**: « هل نقسم 45 + 26 + 120 على 6 + 4 + 16 ؟ » refuted by a counter-check (191 ÷ 26 ≈ 7,3 but the brackets stock is enough for
     only 6 houses) — and the bracket of « الطلاء + الغراء » (without it the profit is wrong).

**08 وضعية الاختبار النهائي**
- `objectives`: « أحلّ وضعية بيوت العصافير وأتّخذ قرارًا ».
- Five evaluated stages (`GuidedProblem`: integers / decimals `numeric`, decisions `choice`):

| Stage | Question | Key | Distractors |
|---|---|---|---|
| 1 | « كم بيتًا تكفيه الألواح؟ الزوايا؟ البراغي؟ » | 7 ; 6 ; 7 (whole parts of 7,5 ; 6,5 ; 7,5) | 8 (rounded up: MISC-SYN-AMALIYAT-ROUNDUP) · 7,5 |
| 2 | « كم بيتًا يمكن صنعه؟ » | **6** (the brackets limit) | 7 (the largest quotient: MISC-SYN-AMALIYAT-MAXNOTMIN) · 20 |
| 3 | « ما الذي يبقى في المخزن؟ » | 9 ألواح ، 2 زاويتان ، 24 برغيًا | « 3 ألواح و 8 براغٍ » (computed for 7 houses: MAXNOTMIN) · « لا شيء » |
| 4 | « اكتب سلسلة واحدة تعطي الربح ثم احسبها » | $6 \times 450 - (6 \times 85 + 120)$ = **2 070 DA** | $6 \times 450 - 6 \times 85 + 120$ = 2 310 (MISC-AQWAS-IGNORED) · $6 \times (450 - 85 + 120)$ |
| 5 | « كم زاوية يجب شراؤها لصنع 7 بيوت؟ » | **2** ($4 \times 7 - 26$) | 4 · 1 |

These five stages are the final test. Distractors reuse the lessons' ids (`MISC-SILSILA-*`, `MISC-AQWAS-*`, `MISC-WASF-*`, `MISC-TAWZI-*`); new
synthesis ids `MISC-SYN-AMALIYAT-*` (prefix free) only where no lesson id fits: `ROUNDUP` (a number of objects taken as the quotient rounded
up), `MAXNOTMIN` (the largest possible count taken instead of the smallest).

## 6. Practice bank — `content/practice/2am/wadiya-idmajiya-amaliyat-tabiiya-ushriya/` (5 levels × 10)

**Corpus** (integration situations whose CHAIN parts belong to this unit; NOT read for this plan — the bank author reads each before
claiming it): `2am-s1-84` ex 5 (fencing a plot: perimeter × price — term 1), `2am-s1-75` ex 5 (what is left of 2 000 DA, jam gifts — the
fraction part is unit 2: `counted: false`), `2am-s2-62` ex 5 (painting a wall: a cost chain — term 2), `2am-s2-59` ex 5 (a field's fence and its
cost — the equation part is later: `counted: false`), `2am-s2-71` ex 5 (re-tiling a classroom: area and cost), `2am-s2-52` ex 5 (tiling a
kitchen, choosing the cheaper width — x parts later). **Honest count of FAITHFUL `term_exam`: 2–4** (only where the chain part stands alone).

| Level | Content | Provenance |
|---|---|---|
| L1 | mixed calculations: one item from each lesson (priority, brackets / bar, name, two ways) | 10 modelled (the « exercise 1 » of a 2AM term-1 paper) |
| L2 | short contexts: a purchase, a program, an average — with « برّر » | 1 term_exam (`2am-s1-75` ex 5 chain part) · 7 modelled · 2 adapted (`deep-51`, `deep-52`) |
| L3 | areas and perimeters written as chains (rectangle + half circle, pentagon), computed two ways | 1 term_exam (`2am-s2-71` ex 5 area-and-cost part, badge « الفصل الثاني ») · 6 modelled · 3 adapted (`deep-44`, `deep-45`, `deep-46` if its figure can be redrawn) |
| L4 | a calculator task, a crossword of chains, a « 24 / four 4s » puzzle | 0 term_exam · 8 modelled · 2 adapted (`deep-37`, `deep-53` register) |
| L5 | « الوضعية الإدماجية (08 ن) » in two parts: a budget with stock limits, a fence / tiling cost, a justified decision | 1–2 term_exam (`2am-s1-84` ex 5, `2am-s2-62` ex 5 — chain parts) · 8 modelled |

**Badges:** « على منوال اختبار الفصل الأول » (« الثاني » for the `2am-s2-*` sources). Modelled sheets: `platform_addition`,
`reason: "term_exam_modelled"`, `modelledOn: "2am-s1"`. **Answer types:** `decimal`, `choice`, `selfCheck`. Every question has a
`learningPoints` primary: the synthesis P1 (questions of the four lessons stay `counted: false` toward their LPs — the validator requires this
lesson's LP; follow the 3AM synthesis banks). **Oracle:** `scripts/practice-oracle/wadiya-idmajiya-amaliyat-tabiiya-ushriya.mjs` — reuses the
chain evaluator of `silsila-bi-aqwas`'s oracle (import its helper; no new parser) and recomputes every key; every value ≥ 0.

## 7. Risks & owner questions

1. **One LP with `programmeItems: []`** (README question 7) — validated precedent in 3AM.
2. **Fahrenheit replaced by the thunder program** (README question 8). The sound speed 340 m/s is a rounded physical value; the context says
   « تقريبًا ».
3. **The book's evaluation question is cut** at the page bottom; the redesign does not depend on it.
4. **Training situation 6's bonus** accepts any correct chain: the evaluator must refuse a negative intermediate and a division by zero.

## 8. Generator checklist

- [ ] `build-extraction.py`: `integration` → module 1; `evaluation` → modules 7–8; `opener` → module 0; the `deep-*` above → `None` (bank);
  all `verified: True`; `check:textbook` green with NO pending element in the unit.
- [ ] Lesson folder: nine module files; `content/problems.js` + `problems.test.js` (every answer recomputed exactly; every distractor false and
  tied to its named error); `content/textbook.js`; a progressive knowledge map; `objectives` on every `ContentModule`.
- [ ] Catalogue: `pointsToLearn` [P1], `pointPrerequisites` (§ 2), `durationMinutes` (modules 0 + 7 + 8), `difficulty: 'متقدم'`, `icon`; the LP
  total in `packages/core/curriculum/coursesData.test.js` +1.
- [ ] Bank (50) + oracle + `active.json` / `exam-style.json` / `misconceptions.json` (`MISC-SYN-AMALIYAT-ROUNDUP`, `-MAXNOTMIN`).
- [ ] `validate:lessons`, `generate:lesson-index`, `generate:learning-net`, `check:lessons`, `npm test`, `build`; e2e: extend the unit's
  lesson-kit script (module routes mount, module 8 evaluates).
- [ ] Publish (guide §11): status `available`, export / import, local DB publish (lesson, 9 modules, 50 exercises — nothing `draft`), commit,
  push `dev`; progress report: 2AM unit 1 complete.

## 9. Successor connection

None: a synthesis has no programme item and no forward net link. The unit's successors are wired by the four lessons' plans (README
« Successor connection »).

## Generator notes

2026-10-29 (generator). Fixes and choices, all minimal:
- **Module 8 stages are choice epreuves, not numeric inputs**: `BossFinal` (the architecture of every published synthesis) only takes `TapQuestion` epreuves. Keys unchanged: 7 · 6 · 7 / 6 / 9 · 2 · 24 / `6 × 450 − (6 × 85 + 120)` = 2 070 / 2 équerres. The plan's stage-3 distractor « 3 ألواح و 8 براغٍ » (computed for 7 houses) is kept and says « لا زاوية » (28 > 26 corners).
- **Module 6 bonus**: the plan's `selfCheck` « any correct chain » becomes two `choice` steps with exactly one true option each (`(3+3)÷(3+3)` = 1 ; `3×3+3÷3` = 10) — the module has no chain evaluator.
- **Module 7**: four decisions (what each material asks, which quotient to keep, why not to add the stocks, how to write the profit) instead of three; the plan's counter-check « 191 ÷ 26 » is NOT shown (it would reveal a result); the refutation is in words.
- **Module 6 part 1 uses a `batch`** (five true/false rows) and a `table`; part 3 asks the mark (3).
- **Bank**: 4 `term_exam` / 40 modelled / 6 adapted. `deep-53` and `deep-40` are not cited by the bank (their destination is `silsila-bi-aqwas`); `deep-40` is cited by module 6 (`duplicatedIn`). `deep-46` redesigned in text (a staircase polygon). Some L5 sheets divide by a decimal (22 ÷ 0,4): within decimals, flagged to the owner.
- **Programme**: still `programmeItems: []`; one الكفاءة P1; `coursesData.test.js` LP total +1.
