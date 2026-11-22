# Plan — `wadiya-idmajiya-ibarat-harfiya-3` « أدمج تعلّماتي — الحساب الحرفي » (3AM unit 4 synthesis, queue Phase 0 #17)

Planner: Opus, 2026-10-25. Read the unit README first ([`README.md`](README.md)). Generated AFTER `qimat-ibara-harfiya` and
`muqaranat-natiqayn` are published. Every number below was computed exactly; `problems.test.js` recomputes them with its own code.

## 1. Identity

- **Code** `wadiya-idmajiya-ibarat-harfiya-3` · **title** « أدمج تعلّماتي — الحساب الحرفي » · unit `ibarat-harfiya-3` · catalogue `order` 19 ·
  `kind: synthesis` · `prerequisiteLessonCodes` = the four lessons of the unit (already in the catalogue).
- **Folder** `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/ibarat-harfiya-3/wadiya-idmajiya-ibarat-harfiya-3/` — the file set of the
  4AM unit-1 reference synthesis `4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/wadiya-idmajiya-aadad/` (`lesson.config.js` with
  `kind: 'synthesis'`, `modules/Module00Astaidd … Module06Wadiya6, Module07TahlilWadiya, Module08Ahill`, `content/{problems,textbook}.js` +
  `problems.test.js`, `knowledge.jsx`, `knowledgeGraph.js`, `moduleContext.js`, `routes.jsx`, `index.jsx`).
- **Textbook** elements destined to the synthesis (`extraction.json`): `integration` p. 68 « وضعية: انطلاقات متفاوتة » (lanes of an athletics
  track: two straights and two semicircles; why are the runners A, B, C staggered at the start? book's short answer ≈ 6,28 m ≈ 2π for a lane
  width of 1 m), `evaluation` p. 68 « هل يتم تفادي الاصطدام؟ » (90 km/h on a wet road, a cow at 85 m; $D_A=D_F+D_R$, $D_F=\frac{3V^2}{400}$,
  $D_R=\frac{3V}{10}$ → 27 + 60,75 = 87,75 > 85: collision), `deep-35` p. 66 (three triangles inside a rectangle 5 × 4 with BF = x; sum of
  areas 12 − 0,5x; the triangle EDF), `deep-47` p. 67 (a magic square of expressions in a — only four cells legible). Re-read all four at
  250 dpi; `verified: True`; module numbers in `destinations`.
- The unit's `challenge` element is NOT cited here (it is `nashr-jabri-3am`'s bank's); the synthesis poses its own analog (§ « تحدٍّ »).

## 2. Programme & net

- **programmeItems**: `[]` (as every synthesis). **الكفاءات**: the catalogue entry has none; proposed (owner question 4), like the 4AM
  syntheses:
  1. **P1** تجنيد مكتسبات الحساب الحرفي (التبسيط، النشر، حساب القيمة، المقارنة بإشارة الفرق) لحلّ وضعيات هندسية وعددية مركّبة
  2. **P2** ترييض وضعية بعبارة حرفية، ثم اتخاذ قرار مبرَّر بحساب قيمتها أو بمقارنة عبارتين
- **pointPrerequisites** (toward the published lessons of the unit, final codes — re-read their final الكفاءات): `P1 ← 3am_tabsit-hadhf-aqwas_P1,
  3am_nashr-jabri-3am_P4, 3am_qimat-ibara-harfiya_P1, 3am_muqaranat-natiqayn_P2`; `P2 ← 3am_qimat-ibara-harfiya_P3, 3am_muqaranat-natiqayn_P3`.
- « أستعدّ » measures the unit's four lessons (one or two statements each). No new knowledge; no « تذكّر » box needed (the lessons are linked
  from the knowledge map's nodes with `getLessonPath`).

## 3. Boundary

Mobilises only the unit (plus earlier tools: the perimeter of a circle π·d, rational arithmetic, areas of triangles and rectangles). No
identities named (4AM), no factoring, no equation solved formally (an « for which x are they equal? » is answered by the simplified
difference = 0 at a visible value, or by testing), no inequality manipulated (README boundary of `muqaranat-natiqayn`).

## Modules — the 9-module shape of the unit-1 reference

| # | slug | title | stage | mobilises |
|---|---|---|---|---|
| 0 | `astaidd` | أستعدّ | prerequisite_check | the 4 lessons |
| 1 | `wadiya-1` | الوضعية التدريبية 1 — المربّع السحري | practice_lab, track problem | tabsit, qimat |
| 2 | `wadiya-2` | الوضعية التدريبية 2 — ساحة وممرّ | practice_lab | nashr, tabsit, qimat |
| 3 | `wadiya-3` | الوضعية التدريبية 3 — برامج الحساب | practice_lab | qimat P3, nashr |
| 4 | `wadiya-4` | الوضعية التدريبية 4 — اشتراكا القاعة | practice_lab | muqaranat P3, qimat |
| 5 | `wadiya-5` | الوضعية التدريبية 5 — مثلّثات في مستطيل | practice_lab | tabsit, qimat, muqaranat |
| 6 | `wadiya-6` | الوضعية التدريبية 6 — مسافة التوقّف | practice_lab | qimat (decimals), muqaranat P2 |
| 7 | `al-wadiya` | تحليل الوضعية النهائية للاختبار | practice_lab | read, sort the data, plan in 3 stages — not solved |
| 8 | `ahill` | وضعية الاختبار النهائي (+ تحدٍّ) | evaluation (boss) | all |

Every module has `objectives` (Classroom Mode entry slide). Each training situation = a `GuidedProblem` (statement with its context and
value, `illustration` `plan` / `tags` in plain text, steps with `numeric` / `choice` (`role: 'conclude'` with `ask`) / `selfCheck`, a
`solution` of ≥ 2 lines per step); `learningPointIds` on each resource.

**Module 0 — أستعدّ.** `objectives`: « أتحقّق من التبسيط والنشر وحساب القيمة والمقارنة بإشارة الفرق ». Six true/false statements:
1. « $7x-3-(2x-5)=5x+2$ » — صحيح (`tabsit-hadhf-aqwas`).
2. « $(x-3)(x+2)=x^2-x-6$ » — صحيح (`nashr-jabri-3am`).
3. « قيمة $x^2-2x$ من أجل $x=-3$ هي 3 » — خاطئ (**15**) (`qimat-ibara-harfiya`).
4. « إذا كانت لعبارتين القيمة نفسها من أجل $x=0$ فهما متساويتان » — خاطئ (`qimat-ibara-harfiya`).
5. « $\frac47-\frac59=\frac1{63}$ إذن $\frac47>\frac59$ » — صحيح (36/63 − 35/63) (`muqaranat-natiqayn`).
6. « إذا كان $A-B=x-2$ فإنّ $A>B$ من أجل $x=5$ » — صحيح (`muqaranat-natiqayn`).

**Module 1 — المربّع السحري** (cites `deep-47`, own grid). `objectives`: « أبسّط مجاميع عبارات لأتمّ مربّعًا سحريًا، وأتحقّق بقيمة لـ a ».
Statement: « في مربّع سحري 3 × 3 يكون المجموع نفسه على كل سطر وكل عمود وكل قطر. أُعطيت خانات: الزاوية العليا اليمنى… » — grid (rows top to
bottom, cells left to right in LTR math layout): row 1 = $-2a-2$ , ? , $2a-4$ ; row 2 = ? , $a-1$ , ? ; row 3 = $2$ , ? , $4a$.
Steps: Q1 the magic sum from a full diagonal: $(-2a-2)+(a-1)+4a$ = **$3a-3$** ; Q2 check with the other diagonal $(2a-4)+(a-1)+2$ = **$3a-3$** ;
Q3 the four missing cells: top middle **$3a+3$**, middle left **$5a-3$**, middle right **$1-3a$**, bottom middle **$-a-5$** ; Q4 for $a=2$:
the grid **−6, 9, 0 / 7, 1, −5 / 2, −7, 8**, every line sums to **3** (= 3 × 2 − 3) ; Q5 for $a=-1$: magic sum **−6**. Context/value: the
club's puzzle corner (patience). (`learningPointIds`: P1.)

**Module 2 — ساحة وممرّ.** `objectives`: « أنشر وأبسّط عبارة مساحة، ثم أحسب قيمتها وثمن التهيئة ». « ساحة مستطيلة بعداها بالمتر $(x+6)$ و
$(x+3)$. يُبلَّط ممرّ عرضه 1,5 م على طول البعد $(x+6)$ ويُعشَّب الباقي؛ ثمن المتر المربّع من العشب 120 دج. » Q1 total area: $x^2+9x+18$ ;
Q2 the grass: $(x+6)(x+1{,}5)$ = **$x^2+7{,}5x+9$** (or total − path: $x^2+9x+18-1{,}5(x+6)$) ; Q3 at $x=3{,}5$: total **61,75 م²**, grass
**47,5 م²**, path **14,25 م²** ; Q4 cost of the grass **5 700 دج** ; Q5 check: 47,5 + 14,25 = 61,75. (P1, P2.) `illustration` plan rect with the
strip.

**Module 3 — برامج الحساب.** `objectives`: « أحكم على تساوي عبارتين: بمثال مضاد أو بالنشر ». Program 1: « اختر عددًا، أضف إليه 4، ثم اضرب
الناتج في العدد مطروحًا منه 1 » → $(x+4)(x-1)$ ; Program 2: « ربّع العدد، أضف إليه ثلاثة أضعافه، ثم اطرح 4 » → $x^2+3x-4$ ; Program 3:
« ربّع العدد ثم اطرح 4 » → $x^2-4$. « قال يونس: الثلاثة متساوية، جرّبتُ 0 فوجدت −4 في كلٍّ منها. » Q1 values at 0 → **−4, −4, −4** ;
Q2 at 2 → **6, 6, 0** ; Q3 conclusion for program 3 → **غير مساوٍ، مثال مضاد x = 2** ; Q4 programs 1 and 2 at $x=-\frac12$ → **−5,25** both — prove
by expanding: $(x+4)(x-1)=x^2+3x-4$ → **متساويان**. Value: a claim needs a proof (honesty). (P2.)

**Module 4 — اشتراكا القاعة.** `objectives`: « أقارن عرضين بتبسيط فرقهما وتعيين إشارته ». « قاعة رياضة تقترح: العرض A 600 دج في الشهر و 25 دج
لكل حصّة؛ العرض B 625 دج و 24 دج لكل حصّة. » Q1 $A=600+25x$, $B=625+24x$ ; Q2 **$A-B=x-25$** ; Q3 for 12 sessions: **900** and **913** → A
cheaper ; Q4 for 30 sessions: **1 350** and **1 345** → B cheaper ; Q5 « متى يتساوى العرضان؟ » → **x = 25** (1 225 both) ; Q6 decision for a student
who trains 3 times a week (≈ 12 sessions) → **A**. (P2.)

**Module 5 — مثلّثات في مستطيل** (cites `deep-35`, own numbers). `objectives`: « أعبّر عن مساحات بدلالة x وأبسّط مجموعها، ثم أقارنها ».
« ABCD مستطيل: AB = 6 cm و AD = 4 cm ؛ E من [AB] حيث AE = 2 cm ؛ F من [BC] حيث BF = x (0 ≤ x ≤ 4). » Q1 area of AED → **4** ; Q2 EBF → **$2x$**
(½ · 4 · x) ; Q3 DFC → **$12-3x$** (½ · 6 · (4 − x)) ; Q4 the sum → **$16-x$** ; Q5 EDF = 24 − (16 − x) = **$8+x$** ; Q6 at $x=1$: **15** and **9** ;
Q7 compare the sum and EDF: difference $(16-x)-(8+x)=8-2x=2(4-x)$, **≥ 0** since x ≤ 4 (a product of positive factors) → the sum is never
smaller, equal only at **x = 4** (F at C: 12 and 12). `GeoFigure` at scale. (P1.)

**Module 6 — مسافة التوقّف** (cites `evaluation`, own formulas and numbers). `objectives`: « أحسب قيمة عبارة بأعداد عشرية وأقرّر بمقارنة
عددين ». « تسير سيارة بسرعة V (km/h). خلال ثانية ردّ الفعل تقطع $D_R=\frac{5V}{18}$ (m)، ثم تقطع أثناء الفرملة $D_F=\frac{V^2}{250}$ على طريق
جافّ و $D_F=\frac{V^2}{125}$ على طريق مبلّل؛ مسافة التوقّف $D_A=D_R+D_F$. يرى السائق حاجزًا على بعد 45 م وهو يسير بـ 72 km/h. » Q1 $D_R$ →
**20 m** ; Q2 dry $D_F$ → **20,736 m**, $D_A$ → **40,736 m** ; Q3 $45-D_A$ → **4,264 > 0** → **يتوقّف قبل الحاجز** ; Q4 wet: $D_F$ = **41,472**,
$D_A$ = **61,472** → $45-D_A<0$ → **يصطدم** ; Q5 at 90 km/h on a dry road → **57,4 m**. Value: road safety. (P2.)

**Module 7 — تحليل الوضعية النهائية للاختبار** (cites `integration`, own numbers; NOT solved here). `objectives`: « أقرأ الوضعية وأفرز
معطياتها وأخطّط لحلّها في ثلاث مراحل ». The situation: « مضمار المدرسة يتكوّن من مستقيمين طول كلٍّ منهما y ونصفي دائرة. عرض كل رواق 1,2 م،
وقطر نصف الدائرة لخطّ الرواق الأول x. في سباق دورة كاملة تنطلق ريم (الرواق 2) أمام سلمى (الرواق 1)، وتنطلق إيناس (الرواق 3) أمامهما. لماذا؟
وبكم مترًا؟ » Steps (as in the unit-1 reference): read (what is asked), sort the data (`InfoSorter` plain text: « عرض الرواق 1,2 م » useful,
« لون المضمار أحمر » useless…), the three stages: (1) write each lane's length $P_k=2y+\pi(x+2{,}4(k-1))$; (2) simplify the differences;
(3) evaluate and decide.

**Module 8 — وضعية الاختبار النهائي** (boss, four graded stages + bonus). `objectives`: « أحلّ الوضعية النهائية وأبرّر الفرق بين نقاط الانطلاق ».
Stages: S1 $P_1=2y+\pi x$, $P_2=2y+\pi(x+2{,}4)$, $P_3=2y+\pi(x+4{,}8)$ ; S2 **$P_2-P_1=2{,}4\pi$**, **$P_3-P_1=4{,}8\pi$** — independent of x and y
(the key insight) ; S3 values → **≈ 7,54 m** and **≈ 15,08 m** (π ≈ 3,14 gives 7,536 and 15,072; to 0,01 with the calculator key: 7,54 and
15,08) ; S4 for y = 85 and x = 73: $P_1=170+73\pi$ ≈ **399,34 m** (decision sentence: each runner runs the same distance because the starts
are staggered by the differences).
**تحدٍّ** (bonus stage, not counted — owner question 4): « عددان مجموعهما 48,5. بكم يزداد جداؤهما إذا أضفنا 4 لكلٍّ منهما؟ » →
$(a+4)(b+4)-ab=4(a+b)+16$ = **210**.

## 9. Practice bank — `content/practice/3am/wadiya-idmajiya-ibarat-harfiya-3/` (5 × 10, like the 4AM syntheses)

Corpus situations that mix the unit (S2 « الوضعية الإدماجية » register): `3am-s2-81` ex 5 (farmer's plot, trees at x = 1; `3am-s2-76` ex 5
same — cite ONE), `3am-s2-82` ex 5 (school yard parts in x + vertical tree), `3am-s2-80` ex 5 (shares S1/S2, inequality tested, decision),
`3am-s3-47` ex 5 (new school: perimeter, area, pipe), `2am-s2-65` ex 5 (basketball court + ladder — misfiled 3AM paper), `3am-s2-69` ex 2 (M = E − F
= 0). **Faithful `term_exam`: about 6** (all L4–L5); L1–L3 sheets are short mixed items modelled on the S2 papers' exercise 2 (simplify /
expand / value / compare) — `platform_addition` `term_exam_modelled` (`modelledOn: "3am-s2"`). Each item's primary LP is P1 or P2 of the
synthesis; sub-steps of a single lesson stay counted (it is the synthesis). Oracle `scripts/practice-oracle/wadiya-idmajiya-ibarat-harfiya-3.mjs`
(exact BigInt rationals + polynomials of its own; π kept symbolic: a value « k·π » is checked as k). Wiring as the other banks.

## 10. Risks & owner questions

- The synthesis الكفاءات and the تحدٍّ as a bonus (README question 4).
- The lanes situation uses π·d (1AM/2AM circle perimeter) — earlier-year knowledge, not built here; a « تذكّر » line in module 7's statement
  (« محيط دائرة قطرها d هو π × d ») is allowed as data.
- `deep-47`'s book grid is only partly legible: the module poses its own fully-computed grid and cites the element.
- `evaluation`: the plan uses own formulas (1 s reaction, dry / wet coefficients); the book's numbers (27 + 60,75 = 87,75 > 85) stay in the
  extraction only.

## 11. Generator checklist

- `problems.test.js` (every value above recomputed with its own BigInt rational code; the magic grid's 8 sums for a ∈ {−2…3}; the triangle
  figure measured; π handled symbolically), the unit's `prepDiagnostic.test.js`, `validate:lessons` (synthesis shape: modules 1–6 « وضعيات
  تدريبية », `objectives` on every module), `check:textbook` (the four elements cited: `deep-47` M1, `deep-35` M5, `evaluation` M6,
  `integration` M7–M8), `audit:knowledge:gate`, `check:non-blocking`, `generate:lesson-index`.
- e2e `apps/web/e2e/lesson-kit/3am-ibarat-harfiya-3-wadiya-idmajiya-ibarat-harfiya-3.mjs` (every module mounts, no raw `$`, the boss stages) +
  `lesson-route-boundary.mjs`. Port 5173 or 5174.
- Catalogue: `available`, `durationMinutes` ≈ 70 (≤ 90), `difficulty: "متقدم"`, `icon: "🏃"`, the two الكفاءات, `pointPrerequisites`;
  `generate:learning-net`; extraction destinations with module numbers. The unit becomes complete: the unit page shows no « قيد الإعداد » card.
- Publish: coordinator, guide §11.

## 12. Generator notes (Sonnet 5.5, 2026-10-26)

Generated INTO the catalogue entry (`status: available`, `durationMinutes: 30` = modules 0 + 7 + 8 as `validate:lessons` computes — the plan's « ≈ 70 » was the sum of all nine modules, which is `estimatedDurationMin: 70` in the config). Minimal fixes to the plan:

1. **Module 7 shows no formula of the solution.** § « Module 7 » listed stage (1) as `P_k = 2y + π(x + 2,4(k − 1))`, which is the answer of the boss's S1. The analysis describes the stages in words only (what changes between lanes, why letters, simplify before substituting); `content.test.js` greps the module-7 source (comments included) for `2{,}4`, `4{,}8`, `7{,}54`, `15{,}08`, `399`, `2y`, `170`.
2. **S3 rounding.** `π ≈ 3,14` gives 7,536 and **15,072 → 15,07**, not 15,08. The key 15,08 needs the calculator's π (4,8π = 15,0796…): the prompt of E3 says « بمفتاح π في الآلة الحاسبة وتدوير النتيجة إلى 0,01 », and E4 (399,34 = 170 + 73π, π from the calculator) follows. The 3,14 estimate is never displayed.
3. **Extraction `evaluation` misread** (recorded in `build-extraction.py › DISCREPANCIES`): the scan prints « على طريق **غير مبلّل** » (a DRY road) in the statement and under the formulas; the old transcription said « مبلّل ». Values (27 ; 60,75 ; 87,75 > 85) unchanged. The platform's own formulas (dry `V²/250`, wet `V²/125`) never use the book's.
4. **Boss shape**: four graded épreuves (E1 = S1 P1 · E2 = S2 P1 · E3 = S3 P2 · E4 = S4 + the decision sentence P2) and the plan's « تحدٍّ » as an UNCOUNTED bonus card in the `synthese` slot (a `TapQuestion`, no `assessment`, answer 210); `passingScore: 3`.
5. **Unit تحدّ**: the unit card carries the text rewritten by the `qimat-ibara-harfiya` lead (126,4 / 5 → 657, `units_3am_2026_2027.json`); the synthesis's own analog (48,5 / 4 → 210) is deliberately different and does not cite the `challenge` element (it stays `nashr-jabri-3am`'s bank).
6. **Kit limits**: `GuidedProblem` has no `selfCheck` step kind — the check lines are `numeric` / `choice conclude` steps; the magic grid is a `problem.table` (rows with a row header, `؟` for an empty cell); the stopping-distance picture is a `route` illustration (digits taken from the statement only); the rectangle of situation 5 is a `GeoFigure`.
7. **`requires` ids** are the unit's lesson ids (`tabsit-hadhf-aqwas-3am`, `nashr-jabri-3am`, `qimat-ibara-harfiya-3am`, `muqaranat-natiqayn-3am`) = the config's `priorKnowledge`.
8. **الكفاءات**: P1 / P2 as proposed; `pointPrerequisites` as the plan (final codes verified in the catalogue); the LP total of `coursesData.test.js` is now 527.
9. **Bank**: 5 × 10 sheets, 285 questions, 6 `term_exam` (`3am-s2-81`, `3am-s2-82`, `3am-s2-80`, `3am-s3-47`, `2am-s2-65`, `3am-s2-69` — all read, re-numbered), 44 `term_exam_modelled`; oracle `scripts/practice-oracle/wadiya-idmajiya-ibarat-harfiya-3.mjs`; 11 `MISC-SYN-HARF-*`. The sheets are text-only (no GeoFigure).
10. **e2e**: `apps/web/e2e/lesson-kit/3am-unit4-wadiya-idmajiya-ibarat-harfiya-3.mjs` (the plan's name carried the unit code twice).
