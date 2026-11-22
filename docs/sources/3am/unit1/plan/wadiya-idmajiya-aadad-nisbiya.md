# Plan — `wadiya-idmajiya-aadad-nisbiya` « أدمج تعلّماتي — الأعداد النسبية » (3AM unit 1, synthesis)

## 1. Identity

- **Code** `wadiya-idmajiya-aadad-nisbiya` · **title** « أدمج تعلّماتي — الأعداد النسبية » · **unit** `aadad-nisbiya` · catalogue
  `order: 3` · `kind: synthesis` · `prerequisiteLessonCodes`: the three unit lessons (all published before this one).
- **Folder** `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/aadad-nisbiya/wadiya-idmajiya-aadad-nisbiya/` with ALL its
  module files `Module00Astaidd.jsx` … `Module08Ahill.jsx` (`registry.test.js` fails on a declared module without a route).
- **Textbook** (book p. = PDF − 1): « أدمج تعلّماتي » p. 20 — `integration` (وضعية: thermal amplitude on the Moon, Venus and Mars with
  Kelvin and Celsius, three documents) and `evaluation` (وضعية للتقويم: Fahrenheit, Paris −2 °C, Chicago 14 °F, T°F = 1,8 × T°C + 32);
  the تحدّ ② p. 6 (decompositions of −36); أستعدّ items 2–4 p. 7 (coordinates); `deep-38` p. 18 (magic triangle, addition) for the bank.
- **Seeds the unit: no.** The synthesis moves its destinations in `build-extraction.py` and flips them to `verified: True`.
- **Shape**: the unit-1 / 4AM reference (`4am/…/wadiya-idmajiya-judhur`, `…/wadiya-idmajiya-aadad`): 00 أستعدّ · 01–06 « الوضعية
  التدريبية 1…6 » · 07 « تحليل الوضعية النهائية للاختبار » · 08 « وضعية الاختبار النهائي ». It is the FIRST 1AM–3AM synthesis generated.

## 2. Programme & net

- `programmeItems: []` (catalogue). One LP is needed (4AM pattern): **P1** « حلّ وضعية إدماجية بتوظيف جداء وحاصل قسمة الأعداد النسبية
  وسلسلة حسابات عليها » → `3am_wadiya-idmajiya-aadad-nisbiya_P1` (owner question 1).
- `pointPrerequisites`: `P1 ← 3am_jidaa-adadayn-nisbiyayn_P4`, `P1 ← 3am_jidaa-ida-nisbiya_P2`, `P1 ← 3am_qismat-nisbiyayn_P4` (the unit's
  own lessons, published; they refine the items the synthesis integrates).
- « أستعدّ » measures the three lessons' key الكفاءات plus the coordinates of prep 2–4 (2AM `talim-nuqta-mustawi`, `2am.m4.r04`,
  `coming_soon`); `reviewLinksForLesson` is empty (no item), so the « راجع » panel shows nothing — the advice text names the three lessons.
- noRebuild: nothing is taught.

## 3. Boundary

No new notion. Every question uses only: products of two or more relative numbers (signs, parity, ×(−1), squares, numeric
distributivity), quotients (missing factor, sign, writings), series with priorities, and 2AM sums/differences, coordinates and averages.
No equation-solving technique (`muadalat-darajat-ula` is unit 5): where an unknown appears, it is found by a quotient (b × q = a) or
checked by substitution. No fraction arithmetic (unit 2): a non-decimal result is written as a fraction or rounded.

## 4. Textbook analysis

| Element | What it asks | Idea | Platform use |
|---|---|---|---|
| integration (p. 20) | thermal amplitude (°C) on the Moon, Venus, Mars; average temperature in Kelvin on Venus; average in °C on Mars (K = °C + 273,15) | amplitudes = differences of relatives; averages = quotients; a change of scale | **Training situation 1** redesigned: a night at the Assekrem (Hoggar), own data, the Kelvin conversion kept as one question |
| evaluation (p. 20) | T°F = 1,8 × T°C + 32; Paris −2 °C → °F; Chicago 14 °F → °C; which city is colder | product of relatives, then the inverse calculation (a quotient) | **Modules 7 + 8** redesigned: Sétif −3 °C and a cousin in Montréal at −13 °F |
| challenge ② (p. 6) | all decompositions of −36 as a product of relative integers | divisors + one negative factor | **Training situation 5** |
| prep 2–4 (p. 7) | coordinates of A and B on a grid | reading coordinates | « أستعدّ » statement 6 + training situation 3 |
| deep-38 (p. 18) | magic triangle with sums 2 | 2AM addition only | bank (`adapted`, `counted: false` for r01/r02) |

## 5. Modules (9) — each with `objectives`

`durationMinutes` (catalogue) = **40** (4AM syntheses: 30–40); module estimates 6 + 6 × 4 + 6 + 10 = 46 with the two final modules —
keep `durationMinutes` as `validate:lessons` computes it for a synthesis (copy the 4AM `wadiya-idmajiya-aadad` rule).

**00 أستعدّ** — `objectives`: « أتحقّق من أنّني أضرب الأعداد النسبية وأقسمها وأحسب سلسلة حسابات قبل الوضعيات. » Six statements:
1. $(-4)\times(-2{,}5)=10$ → صحيح (L1).
2. $(-1)\times2\times(-3)\times(-5)=30$ → خطأ (−30) (L2).
3. $(-0{,}7)^2=0{,}49$ → صحيح (L2).
4. $(-45)\div9=5$ → خطأ (−5) (L3).
5. $8-2\times(-3)=14$ → صحيح (L3).
6. « النقطة $M(-2\,;\,3)$ فاصلتها $3$ » → خطأ (−2) (prep 2–4).

**01 الوضعية التدريبية 1 — ليلة في الأسكرام** (integration redesigned) — `objectives`: « أوظّف ضرب الأعداد النسبية وقسمتها لأتتبّع انخفاض
درجة الحرارة ليلًا وأحسب سعتها ومتوسّطها. » Mobilises L1 P4, L3 P1/P3, L3 P4. Context: « في هضبة الأسكرام بالهقار كانت درجة الحرارة
12°C عند الساعة 18:00، ثم أخذت تنخفض بانتظام 1,5°C في كل ساعة حتى الساعة 4:00. وبلغت أعلى درجة في النهار 18°C. »
1) at 23:00 → $12+(-1{,}5)\times5=4{,}5$ °C;
2) « في أيّ ساعة كانت 0°C؟ » → $(-12)\div(-1{,}5)=8$ hours after 18:00 → 2:00;
3) the minimum at 4:00 → $12+(-1{,}5)\times10=-3$ °C; the day's thermal amplitude → $18-(-3)=21$ °C;
4) « الكلفن: نضيف 273,15 » → $-3+273{,}15=270{,}15$ K;
5) mean of the maximum and the minimum → $(18+(-3))\div2=7{,}5$ °C.

**02 الوضعية التدريبية 2 — رصيد جمعية الحيّ** — `objectives`: « أعبّر بجداء عدد نسبي عن تغيّر رصيد في المستقبل وفي الماضي. » Mobilises
L1 P2/P4, L3 P1. « تدفع جمعية الحيّ 750 DA في كل أسبوع لكراء القاعة، وتتلقّى 450 DA من الاشتراكات. رصيدها اليوم 5400 DA. »
1) weekly change → $-750+450=-300$ DA;
2) in 6 weeks → $5400+(-300)\times6=3600$ DA;
3) 6 weeks ago → $5400+(-300)\times(-6)=7200$ DA;
4) « بعد كم أسبوعًا ينفد الرصيد إن بقي الحال كذلك؟ » → $(-5400)\div(-300)=18$.

**03 الوضعية التدريبية 3 — خريطة الكنز** — `objectives`: « أضرب إحداثيات نقط في −1 وأفسّر النتيجة، وأحسب إحداثيي نقطة بجداء وحاصل قسمة. »
Mobilises L2 P1, L1 P4, L3 P1 + 2AM coordinates. A grid with $A(-3\,;\,2)$, $B(4\,;\,-1)$, $C(-2\,;\,-5)$ (statement figure: `GeoFigure` with
`grid` + `axes`).
1) read the coordinates of B and C (the figure shows the points) → (4 ; −1), (−2 ; −5);
2) multiply both coordinates of A by −1 → $A'(3\,;\,-2)$: « ما علاقة A' بـ A؟ » → نظيرتها بالنسبة إلى المبدأ O;
3) multiply only the abscissa of A by −1 → $A''(3\,;\,2)$ → symmetric about the ordinate axis;
4) « فاصلة الكنز T هي $x_A\times y_B$ وترتيبه $(y_A\times y_C)\div x_C$ » → $(-3)\times(-1)=3$, $(2\times(-5))\div(-2)=5$ → $T(3\,;\,5)$.

**04 الوضعية التدريبية 4 — مسابقة الأسئلة** — `objectives`: « أحسب نقاطًا بأعداد نسبية وأستنتج عددًا مجهولًا بحاصل قسمة ومتوسّطًا. »
Mobilises L1 P4, L3 P1/P4. « مسابقة من 20 سؤالًا: +5 للإجابة الصحيحة، −3 للخاطئة، 0 لسؤال بلا إجابة. »
1) أيوب: 12 correct, 6 wrong, 2 blank → $12\times5+6\times(-3)=42$;
2) إيناس: 14 correct, 6 wrong → 52; رانية: 11 correct, 5 wrong, 4 blank → 40;
3) « نقطة أمين −6 ولم يُجب صحيحًا عن أيّ سؤال: كم سؤالًا أخطأ؟ » → $(-6)\div(-3)=2$;
4) mean of the four → $(42+52+40+(-6))\div4=128\div4=32$.

**05 الوضعية التدريبية 5 — تفكيك −36** (the unit's تحدّ ②) — `objectives`: « أجد كل كتابات عدد سالب على شكل جداء عددين صحيحين نسبيين. »
Mobilises L1 P2, L3 P1.
1) « اكتب $-36$ على شكل جداء عددين صحيحين نسبيين بكل الطرق الممكنة (دون اعتبار الترتيب). كم طريقة؟ » → 9: $(-1)\times36$, $1\times(-36)$,
   $(-2)\times18$, $2\times(-18)$, $(-3)\times12$, $3\times(-12)$, $(-4)\times9$, $4\times(-9)$, $(-6)\times6$;
2) « أيّ تفكيك مجموع عامليه أصغر ما يمكن؟ » → $1\times(-36)$ (sum −35);
3) « أيّ تفكيك مجموع عامليه معدوم؟ » → $(-6)\times6$;
4) « اكتب $-36$ جداءً لثلاثة أعداد صحيحة سالبة » (open; checked: three negative integers, product −36; e.g. $(-1)\times(-4)\times(-9)$).

**06 الوضعية التدريبية 6 — ورقة إجابات رياض** — `objectives`: « أحكم على حسابات زميل وأصحّح الخاطئة منها مع التعليل. » Mobilises all
three lessons. Five answers to judge (صحيح / خطأ, then the corrected value):
a) $(-3)\times(-5)=-15$ → خطأ, 15 (NEGNEG);
b) $(-2)^2=-4$ → خطأ, 4 (SQUARENEG);
c) $(-24)\div(-6)=4$ → صحيح;
d) $6-2\times(-3)=-12$ → خطأ, 12 (he computed $(6-2)\times(-3)$: PRIORITY);
e) $(-1)\times(-1)\times(-1)\times(-1)\times(-1)=-1$ → صحيح;
then « ما نقطة رياض من 5؟ » → 2.

**07 تحليل الوضعية النهائية للاختبار — درجات الحرارة عبر العالم** (evaluation redesigned, analysed, not solved) — `objectives`: « أقرأ
الوضعية النهائية، أفرز معطياتها، وأختار العمليات وترتيبها قبل أن أحلّها. » Context: « أرسل ياسين من سطيف رسالة إلى ابن عمّه في مونتريال: «
الحرارة عندنا −3°C ». فأجابه: « وعندنا −13°F ». نستعمل لتحويل درجة الحرارة من سيلسيوس إلى فهرنهايت القاعدة $T_F=1{,}8\times T_C+32$. » Three
analysis stages (4AM pattern): ① sort the data (which number is in °C, which in °F; the 32 and the 1,8 are not temperatures); ② choose
the operations: °C → °F is « × 1,8 then + 32 »; °F → °C is the reverse chain « − 32 then ÷ 1,8 » (cards to order); ③ the plan: convert
both to the same scale, then compare.

**08 وضعية الاختبار النهائي** — `objectives`: « أحلّ وضعية التحويل بين سلّمي الحرارة وأقارن مدينتين. » Five evaluated stages:
1) Sétif in °F → $1{,}8\times(-3)+32=-5{,}4+32=26{,}6$ °F;
2) Montréal in °C → $(-13-32)\div1{,}8=(-45)\div1{,}8=-25$ °C;
3) « أيّ المدينتين أشدّ برودة؟ » → مونتريال ($-25<-3$);
4) the difference between the two temperatures → $-3-(-25)=22$ °C;
5) « تحقّق أنّ درجة الحرارة −40 لها القيمة نفسها في السلّمين » → $1{,}8\times(-40)+32=-72+32=-40$ ✓ (a substitution check, no equation).

Final-test items are the five stages; their distractors encode the unit's misconceptions (stage 1: $-5{,}4-32=-37{,}4$ — SIGN of the
sum; $1{,}8\times3+32=37{,}4$ — sign dropped; stage 2: $(-13+32)\div1{,}8$ ≈ 10,56 — reverse chain wrong; $-13-32\div1{,}8$ ≈ −30,78 —
PRIORITY).

## 6. Practice bank — `content/practice/3am/wadiya-idmajiya-aadad-nisbiya/` (5 levels × 10)

- Integration sheets (« وضعية » format, multi-step): the corpus « الوضعية الإدماجية » sections rarely use relative numbers — none of the
  13 `r01`/`r02` corpus exercises is an integration situation. **Faithful `term_exam`: 0–2** (only if a 3AM term-1 paper's وضعية turns out
  to contain a temperature / altitude calculation when the generator reads the papers' page 2; the planner found none in the index
  topics). So ~40 `term_exam_modelled` (`modelledOn: "3am-s1"`, the term-1 paper's « exercise 1 » mixed calculation + a context) and
  ~10 `adapted` (deep-38, ex-32, the integration's three documents rewritten).
- Levels: L1 mixed calculations (product, quotient, series) — the « exercise 1 » of a term-1 paper; L2 contexts with temperatures and
  altitudes; L3 money and scores; L4 coordinates and symmetric points; L5 full situations with a conversion formula.
- Oracle `scripts/practice-oracle/wadiya-idmajiya-aadad-nisbiya.mjs`: reuses the evaluator of `qismat-nisbiyayn`'s oracle (import its
  helper; no new parser), recomputes every key from the statement's own numbers.

## 7. Risks & owner questions

1. First 1AM–3AM synthesis: one LP with `programmeItems: []` — does `validate:lessons` / the net invariant (« no LP outside the lesson's
   items ») accept it, as for the 4AM syntheses? If not, give the synthesis `programmeItems: ['3am.m1.r01', '3am.m1.r02']`.
2. The book's integration uses planetary data (Moon −170 °C / 160 °C, Venus 460 °C, Mars 210 K); the plan replaces it with the
   Assekrem (own numbers). Confirm the redesign (independence rule) — the Kelvin question is kept.
3. Training situation 3 needs a statement figure with a grid and axes (`GeoFigure` `grid` + `axes`, available since unit 12 of 4AM).

## 8. Generator checklist

- Destinations in `build-extraction.py` (`integration` → module 1, `evaluation` → modules 7–8, `challenge` item ② → module 5, prep 2–4 →
  module 0), `verified: True`; `check:textbook` green with NO pending element left in the unit.
- Lesson folder with the nine modules, `content/problems.js` (+ `problems.test.js` recomputing every answer with fractions),
  `content/textbook.js`, knowledge map progressive; `objectives` on every `ContentModule`.
- Bank + oracle; `active.json` / `exam-style.json` entries.
- `validate:lessons`, `generate:lesson-index`, `check:lessons`, `npm test`; e2e: extend the unit's lesson-kit script with the synthesis
  (module routes mount, module 8 evaluates).
- Publish (coordinator): `pointsToLearn` (P1), `durationMinutes`, `difficulty: 'متقدم'`, `icon: '🌡️'`, status `available`;
  `units_3am › aadad-nisbiya.challenge.sourceElementId` already set by L2.

## 12. Generator notes (2026-10-26, lead of `wadiya-idmajiya-aadad-nisbiya`)

1. **Empty `programmeItems` accepted:** the validators (`validate:lessons`, learning-net tests) accept the synthesis with `programmeItems: []` and one `pointsToLearn` (P1), like the 4AM syntheses; no fallback to the unit's items. Side effect: `coursesData.test.js` LP total 523 → 524.
2. **Cards to order (module 7 stage ②)** became a `TapQuestion` (« نطرح 32 ثم نقسم على 1,8 » among four chains): the kit has no card-ordering component. Module 7 has four steps (sort, three-stage analysis, same-scale question, inverse chain).
3. **Opener** (illegible) is declared `notIntegrated` in `build-extraction.py`. `integration`, `evaluation`, `challenge ②`, `prep 2–4`, `deep-38` are `verified: True` (re-read at 110 dpi); `check:textbook` has no pending element left in the unit.
4. **Situation 5** open question 4 is a four-option choice (no open-answer step in `GuidedProblem`); situation 6 uses a `batch` for the five verdicts. Every problem has an `illustration` (scene) because `masailIllustrations.test.js` demands a support; situation 3 has the GeoFigure grid + axes.
5. **Duration:** `durationMinutes` 30 (modules 0 + 7 + 8 = 6 + 12 + 12, the rule `validate:lessons` applies); `estimatedDurationMin` 30.
6. **Bank:** 50 sheets, 165 questions (40 `term_exam_modelled`, 10 `adapted`, 0 `term_exam`: no 3AM term-1 paper has a relative-numbers situation), 29 `counted: false`, six `MISC-WIDMAJ-*` added. The unit تحدّ text in `units_3am` is left as the book's (owner question).
