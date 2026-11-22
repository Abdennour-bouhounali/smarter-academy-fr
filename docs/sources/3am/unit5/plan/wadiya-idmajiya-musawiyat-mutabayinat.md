# Plan — `wadiya-idmajiya-musawiyat-mutabayinat` « أدمج تعلّماتي — المساويات – المتباينات – المعادلات » (synthesis of 3AM unit 5)

Every number in this plan was recomputed exactly while planning. Every Arabic string is final and the platform's own. Shape reference: the 4AM
syntheses `wadiya-idmajiya-aadad` (unit-1 reference) and `wadiya-idmajiya-muadalat` (equations), nine modules: 0 أستعدّ · 1–6 « الوضعية
التدريبية » · 7 « تحليل الوضعية » · 8 « وضعية الاختبار النهائي ».

---

## 1. Identity

| | |
|---|---|
| Code | `wadiya-idmajiya-musawiyat-mutabayinat` |
| Title | « أدمج تعلّماتي — المساويات – المتباينات – المعادلات » |
| Unit | `musawiyat-mutabayinat` (3AM unit 5), `units_3am › synthesisLessonCode` |
| Catalogue | `lessons_3am_2026_2027.json`, order 24, `kind: synthesis`, `coming_soon`, `prerequisiteLessonCodes` = the four lessons of the unit |
| Folder | `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/musawiyat-mutabayinat/wadiya-idmajiya-musawiyat-mutabayinat/` |
| Book pages | p. 84 (« أدمج تعلّماتي »: وضعية + تحليل الوضعية + حل مختصر ; وضعية للتقويم) ; p. 70 (تحدّي, التمهيد) |
| Seeds the unit? | No. Generated LAST, once `mutabayinat-amaliyat`, `hasr-adad-ushri` (and the two published lessons) are `available`. |

**Extraction elements destined here:** `integration` (the two cyclists, 50t = 45t + 1 → t = 1/5 h = 12 min, 10 km), `evaluation` (15 sacks + 25 kg
= 10 sacks + 150 kg → 25 kg), `challenge` (reward split: 3 937,5 DA and 4 725 DA), `opener` (history aside: Egypt, الخوارزمي, عمر الخيام,
Bombelli). Set `verified: True` on all four after a 200-dpi read of pp. 70 and 84.

## 2. Programme & net

- **programmeItems:** none (a synthesis). It mobilises `3am.m5.r05` (both halves), `3am.m5.x1` and `3am.m5.r06`.
- **pointsToLearn:** empty in the catalogue. PROPOSED, like the 4AM syntheses:
  - **P1** « تجنيد خواص المساويات والمتباينات والعمليات وحصر عدد عشري موجب لمعالجة وضعيات مركّبة من الحياة اليومية »
  - **P2** « ترييض وضعية بمعادلة من الدرجة الأولى بمجهول واحد وحلّها والتحقق من الحل، ثم الحكم على النتيجة أو تقريبها بمتباينة أو بحصر أو بتدوير »
- **Review for « أستعدّ »:** the four lessons of the unit, all published by then (statements below, each `requires` a lesson slug).
- **noRebuild:** everything. A synthesis teaches nothing new; each situation's correction names the lesson it uses.
- **pointPrerequisites** (toward PUBLISHED lessons of the unit, the 4AM synthesis pattern):
  - P1 ← `3am_musawiyat-amaliyat_P3`, `3am_mutabayinat-amaliyat_P4`, `3am_hasr-adad-ushri_P3`;
  - P2 ← `3am_muadalat-darajat-ula_P3`, `3am_muadalat-darajat-ula_P4`, and the synthesis's own P1.
- **Where 4AM uses it:** the whole unit feeds 4AM unit 4 « معادلات ومتراجحات » (`mutarajiha-ula`, `tarrid-mushkila`, `wadiya-idmajiya-muadalat`).
  Situations 4 and 6 (« ابتداءً من … ») prepare `4am.m3.r05` without naming the inequation.

## 3. Boundary

- **Only the unit's four lessons.**
  - No system of two equations, no product-equals-zero (4AM).
  - No « حلّ المتراجحة », no solution set on a line.
  - No negative rounding.
- **Steps from earlier units** (fractions, relative numbers, literal expressions) appear only as ordinary computation, never as a step that is
  assessed.
- **Every decision is justified by a property or a bracket**, never « by trial ».

## 4. The nine modules (`objectives` on every module; `estimatedMin`: 0 → 6 · 1–6 → 6 each · 7 → 16 · 8 → 6; total 64; `durationMinutes` 28, without the six training situations, `track: 'problem'`)

### Module 0 — أستعدّ (`PrerequisiteDiagnostic`)

`objectives`: « أتحقّق من أنّني أتذكّر خواص المساويات والمتباينات، والتدوير والحصر، وحلّ معادلة. »

| # | Statement | Key | Lesson |
|---:|---|---|---|
| 1 | إذا كان $2x-5=9$ فإنّ $2x=14$ . | صحيح | musawiyat-amaliyat |
| 2 | إذا كان $a<b$ فإنّ $-2a<-2b$ . | خطأ (−2a > −2b) | mutabayinat-amaliyat |
| 3 | إذا كان $x\le 4$ فإنّ $x-6\le -2$ . | صحيح | mutabayinat-amaliyat |
| 4 | مدوّر $3{,}465$ إلى $0{,}01$ هو $3{,}46$ . | خطأ (3,47) | hasr-adad-ushri |
| 5 | كل عدد مدوّره إلى $0{,}1$ هو $2{,}3$ يحقّق $2{,}25\le x<2{,}35$ . | صحيح | hasr-adad-ushri |
| 6 | العدد $3$ حلّ للمعادلة $5x-4=2x+5$ . | صحيح (11 = 11) | muadalat-darajat-ula |
| 7 | حلّ المعادلة $3x+7=x-1$ هو $4$ . | خطأ (2x = −8, x = −4) | muadalat-darajat-ula |

### Modules 1–6 — the six training situations (`GuidedProblem` from `content/problems.js`, `track: 'problem'`, drawn support required, platform additions)

**Situation 1 — « مكافأة النجاح »** (solves the unit's تحدّ; `cites: [src('challenge')]`)
- Context: « قرّر أبٌ مكافأة أبنائه الثلاثة على نجاحهم: يأخذ صاحب أعلى معدّل مبلغًا $T$ ، ويأخذ صاحب أدنى معدّل ربعه، ويأخذ الثالث ثلاثة
  أعشاره. وزّع الأب 24 800 DA كلّها. »
- Questions and keys:
  1. عبّر بدلالة $T$ عن حصّتي الولدين الآخرين → $\frac{T}{4}$ و $\frac{3T}{10}$
  2. اكتب معادلة تترجم المبلغ الموزّع → $T+\frac{T}{4}+\frac{3T}{10}=24\,800$ ، أي $1{,}55\,T=24\,800$
  3. حلّها → $T=16\,000$ ؛ الحصّتان $4\,000$ DA و $4\,800$ DA
  4. تحقّق → 16 000 + 4 000 + 4 800 = 24 800
  5. لو كان المبلغ 25 000 DA، أعط $T$ مدوّرًا إلى الدينار، واحصره بقيمتين مقرّبتين إلى الوحدة → $25\,000\div 1{,}55=16\,129{,}03\ldots$ ⟹ $16\,129$ ؛ $16\,129<T<16\,130$
- Mobilises: `muadalat-darajat-ula` P4, P3 ; `hasr-adad-ushri` P3, P4.
- Illustration `tags`.

**Situation 2 — « كراريس سلمى »**
- Context: « اشترت سلمى 4 كراريس لها الثمن نفسه $x$ ، ودفعت ورقة 200 DA فأعاد لها البائع 32 DA: $4x+32=200$ . »
- Questions and keys:
  1. بطرح 32 من الطرفين، اكتب المساواة الناتجة → $4x=168$
  2. دون حساب $x$ ، ما ثمن 8 كراريس؟ → $8x=336$ (×2 on both sides)
  3. احسب $x$ → $42$ DA
  4. تحقّق → 4·42 + 32 = 200
- Mobilises: `musawiyat-amaliyat` P1, P2, P3 ; `muadalat-darajat-ula` P2.
- Illustration `tags`.

**Situation 3 — « رفّ التوابل »**
- Context: « يكتب ميزان العطّار الكتلة مدوّرة إلى $0{,}1$ kg، وقرأ على علبة توابل $0{,}8$ kg. يحمل الرفّ 10,5 kg على الأكثر. »
- Questions and keys:
  1. احصر كتلة العلبة $m$ → $0{,}75\le m<0{,}85$
  2. احصر كتلة 12 علبة مماثلة → $9\le 12m<10{,}2$
  3. هل يمكن وضع 12 علبة على الرفّ بأمان؟ → نعم (12m < 10,2 < 10,5)
  4. و13 علبة؟ → لا يمكن الجزم ($9{,}75\le 13m<11{,}05$)
- Mobilises: `hasr-adad-ushri` P3 ; `mutabayinat-amaliyat` P2, P4.
- Illustration `stacks`.

**Situation 4 — « سيارة الأجرة »**
- Context: « ثمن رحلة بسيارة أجرة $50+30d$ دينارًا، حيث $d$ المسافة بالكيلومتر. »
- Questions and keys:
  1. ثمن رحلة 7 km → 260 DA
  2. دفع أمين 410 DA: اكتب معادلة وجد المسافة → $50+30d=410$ ، $d=12$ km
  3. معه 500 DA: اكتب الشرط واستنتج متباينة طرفها الأول $d$ → $50+30d\le 500$ ⟹ $30d\le 450$ ⟹ $d\le 15$
  4. هل يكفيه المبلغ لرحلة 16 km؟ → لا (530 DA)
- Mobilises: `muadalat-darajat-ula` P4 ; `mutabayinat-amaliyat` P1, P2, P4.
- Illustration `route`.

**Situation 5 — « غرفة التبريد »**
- Context: « تبقى حرارة غرفة تبريد $T$ (بالدرجة المئوية) بين $-22$ و $-18$ : $-22\le T\le -18$ . »
- Questions and keys:
  1. احصر $1{,}8T$ ثم $F=1{,}8T+32$ (الحرارة بالفهرنهايت) → $-39{,}6\le 1{,}8T\le -32{,}4$ ⟹ $-7{,}6\le F\le -0{,}4$
  2. «مؤشّر البرودة» $I=-2T+10$ : احصره → $46\le I\le 54$ (the reversal: −2 × (−18) + 10 = 46 is the SMALLER end)
  3. صحيح أم خطأ: «كلّما انخفضت الحرارة انخفض المؤشّر» → خطأ (×(−2) reverses)
- Mobilises: `mutabayinat-amaliyat` P2, P3, P4.
- Illustration `scene` (a thermometer).

**Situation 6 — « أعمار العائلة »**
- Context: « عمر الأب 41 سنة وعمر ابنه 9 سنوات. »
- Questions and keys:
  1. بعد كم سنة يكون عمر الأب ثلاثة أمثال عمر ابنه؟ → $41+n=3(9+n)$ ، $n=7$
  2. تحقّق → 48 = 3 × 16
  3. ابتداءً من أيّ عدد من السنوات يصير عمر الأب أقلّ من ضعف عمر ابنه؟ → $41+n<2(9+n)$ ⟹ $41+n<18+2n$ ⟹ $23<n$ ⟹ $n>23$
  4. عند $n=23$ ؟ → 64 = 64: equal, not less
- Mobilises: `muadalat-darajat-ula` P4, P3 ; `mutabayinat-amaliyat` P1, P4.
- Illustration `timeline`.

Each situation: `objectives` (e.g. S1: « أترجم توزيع مبلغ بمعادلة، وأحلّها، وأدوّر النتيجة إلى الدينار. »), every step with its own numbers, a
`solution` of ≥ 2 lines, and an answering `numeric` / `choice conclude` step for every ask (`validateProblem`). `data[].text` and `tags` are plain
text, never `$…$`.

### Module 7 — « تحليل الوضعية » (the book's `integration`, redesigned with own numbers; a lab, then the analysis)

`objectives`: « أحلّل وضعية لحاق دراجتين: أختار المجهول وأترجم المعطيات بمعادلة وأحلّها وأتحقق، ثم أحكم بمتباينة وأدوّر النتيجة. »

- **Context:** « في سباق دراجات بولاية تيبازة انطلق رضا بسرعة متوسطة 40 km/h خلف ياسين الذي يسبقه بـ 2 km ويسير بسرعة متوسطة 36 km/h. »
- **Lab at the top** (no card above it): `term-ferry` alone, `levels={false}`, `tasks: [{ left: '40x', right: '36x+2' }]`.
  - Solution x = 1/2, unique and ≠ 0, the divisor 4 within −12…12.
  - Declared in `resources` without `level`.
  - `lead` line (one short story mapping): « x = مدّة اللحاق بالساعة ».
- **Analysis steps** (the book's five stages, in the platform's words):
  1. المجهول: $t$ مدّة اللحاق بالساعة
  2. الترجمة: يقطع رضا $40t$ ، ويكون ياسين على بعد $36t+2$ من نقطة انطلاق رضا
  3. المعادلة $40t=36t+2$ ⟹ $4t=2$ ⟹ $t=\frac12$ h = 30 min
  4. التحقق → 40 × 1/2 = 20 و 36 × 1/2 + 2 = 20
  5. الخلاصة → يلحق به بعد 30 دقيقة، وقد قطع 20 km
- **Extension (the unit's other lessons):**
  - « خطّ الوصول على بعد 15 km من انطلاق رضا: هل يلحق به قبل الخطّ؟ » → لا (20 > 15).
  - « لو كان ياسين يسبقه بـ 1,3 km: احسب مدّة اللحاق ثم دوّرها إلى الدقيقة » → $4t=1{,}3$ ، $t=0{,}325$ h = 19,5 min → 20 min (half up).
    « والمسافة؟ » → 13 km < 15 → yes before the line.
  - « ما أكبر مسافة $d$ (بالكيلومتر) بين الدرّاجين تسمح للّحاق قبل الخطّ؟ » → $40\times\frac{d}{4}\le 15$ ⟹ $10d\le 15$ ⟹ $d\le 1{,}5$ km.
- The `opener` (history: the equation from Egypt to الخوارزمي and الخيام) appears as a short « حكاية » side card AFTER the analysis
  (`cites: [src('opener')]`, platform's own sentences), never above the lab.

### Module 8 — « وضعية الاختبار النهائي » (`BossFinal`; the book's `evaluation`, redesigned; 5 stages, each assessed with ONE primary LP of the synthesis; timer 6 min)

`objectives`: « أحلّ وضعية شاحنتين: أكتب معادلة وأحلّها وأتحقق، ثم أحكم بمتباينة وبحصر. »

Context: « تحمل شاحنة 12 صندوق تمر و 40 kg من البرتقال، وتحمل شاحنة أخرى 8 صناديق مماثلة و 140 kg من البرتقال. الشاحنتان تحملان الكتلة نفسها.
نرمز بـ $x$ إلى كتلة الصندوق الواحد (kg). » (`cites: [src('evaluation')]`)

| # | LP | Stage | ✓ key | Distractors (misconception) |
|---:|---|---|---|---|
| 1 | P2 | المعادلة التي تترجم الوضعية | $12x+40=8x+140$ | $12x+8x=40+140$ (`MUADALA-TRANSLATE`) ; $12x+140=8x+40$ ; $12+40x=8+140x$ |
| 2 | P2 | حلّها | $x=25$ | $45$ ($180\div 4$, signs kept: `MUADALA-SIGN-KEPT`) ; $22{,}5$ ; $-25$ |
| 3 | P2 | كتلة حمولة كل شاحنة (التحقق) | $340$ kg | $300$ (oranges forgotten) ; $380$ ; $440$ |
| 4 | P1 | تحمل الشاحنة الثانية 500 kg على الأكثر. ما أكبر عدد من الصناديق يمكن إضافته إليها؟ | $6$ ($340+25k\le 500$ ⟹ $k\le 6{,}4$) | $7$ (rounded 6,4 up) ; $6{,}4$ ; $20$ ($500\div 25$) |
| 5 | P1 | كتلة الصندوق قيست على ميزان يدوّر إلى $0{,}1$ kg فقرأ $25{,}0$ : حصر حمولة الشاحنة الأولى | $339{,}4\le L<340{,}6$ | $340\le L<341{,}2$ (`TADWIR-TRUNC`: 25 ≤ x < 25,1) ; $339{,}4\le L\le 340{,}6$ (`TADWIR-UPPER-INCLUDED`) ; $299{,}4\le L<300{,}6$ (+ 40 forgotten) |

Check: 12 × 24,95 + 40 = 339,4 ; 12 × 25,05 + 40 = 340,6 ; 8 × 25 + 140 = 340 ; (500 − 340) ÷ 25 = 6,4.

`synthese={<KnowledgeSnapshot complete variant="complete" />}`, `badges` / `completion` / `skills` as in the 4AM syntheses.

## 5. Practice bank — `content/practice/3am/wadiya-idmajiya-musawiyat-mutabayinat/` (5 × 10, the 4AM syntheses also have one)

- **Corpus** (integration-level 3AM exercises that combine the unit's lessons; already modelled by the sibling banks for their own steps, so
  here each sheet must keep the COMBINATION and change every number and context):

  | File / ex | Combination |
  |---|---|
  | `3am-s2-68` ex 5 | perimeter in x → equation → composite area |
  | `3am-s3-56` ex 5 | water tank; equation step |
  | `3am-s3-57` ex 4 | rectangle by an equation; speed, distance, duration |
  | `3am-s3-59` ex 3 | consecutive numbers by an equation; pyramid volume |
  | `3am-s3-59` ex 5 | perimeter and area in x, equation; Pythagoras |
  | `3am-s2-80` « الوضعية » | test an inequality, decide |
  | `3am-s3-51` ex 3 | averages: equation, then the least average |

  **Honest count: 7 faithful `term_exam`.** Steps belonging to other units are `counted: false`.
- **Plan per level:**

  | Level | Content | Provenance |
  |---|---|---|
  | L1 | one-skill review items from each lesson (2–3 per lesson) | `term_exam_modelled` `modelledOn: "3am-s3"` |
  | L2 | « احسب ثم علّل » pairs crossing two lessons | 2 `term_exam`, the rest modelled |
  | L3 | complete exercises: equation + check + rounding | 2 `term_exam`, the rest modelled |
  | L4 | an equation or bracket in a geometry / speed context | 2 `term_exam`, the rest modelled |
  | L5 | « الوضعية الإدماجية (08 ن) » in two parts ending on a justified decision | 1 `term_exam` + 9 modelled |

  Totals: 7 `term_exam` ; ~40 `term_exam_modelled` ; ~3 `adapted`: `integration` / `evaluation` / `challenge` variants with badge `null`. These
  are allowed because the synthesis owns those elements, but the modules already cite them, so adapted sheets are optional.
- **Misconceptions:** reuse `MISC-MUSAWIYA-*`, `MISC-MUADALA-*`, `MISC-MUTABAYINA-*`, `MISC-TADWIR-*`. No new id.
- **Oracle** `scripts/practice-oracle/wadiya-idmajiya-musawiyat-mutabayinat.mjs`: own BigInt rationals and decimals, never `packages/core`. It solves each
  equation, re-derives each inequality bound and each rounding interval, and evaluates every `choice`.

## 6. Risks & owner questions

1. **Synthesis الكفاءات** (P1, P2 above) are proposed. The catalogue entry has none: owner to confirm (the 4AM syntheses carry 1–2).
2. **The تحدّ text in `units_3am`** is the book verbatim: rewrite it in platform words (situation 1's context, total 24 800 DA). Do NOT set
   `challenge.sourceElementId` (the synthesis already cites `challenge`; two citations break `check:textbook`).
3. **Module 7 reuses `term-ferry`** with a fractional solution (x = 1/2). Its `init` accepts any unique non-zero solution, but verify the divisor step
   (4x = 2 → ÷ 4 → x = 1/2 rendered as a fraction) in the lab's render test, or fall back to no lab and a `MethodSteps` block.
4. **Two book situations** (integration + evaluation). The plan maps integration → M7 (analysed and solved, as the book itself does) and
   evaluation → M8 (the test). The 4AM pattern solves ONE situation in M7–M8. Confirm that two different situations are acceptable, or move the
   trucks to a seventh training situation and test on the cyclists.

## 7. Generator checklist

- [ ] All four lessons of the unit are `available` (else `prepDiagnostic.test.js` and `coursesData.test.js` disagree).
- [ ] `build-extraction.py`: `integration`, `evaluation`, `challenge`, `opener` read at 200 dpi, `verified: True`, module numbers (7, 8, 1, 7),
  assertions (1/5 h, 10 km, 25 kg, 3 937,5 / 4 725 DA).
- [ ] `units_3am_2026_2027.json › musawiyat-mutabayinat.challenge.textAr` rewritten (platform words; no `sourceElementId`).
- [ ] Lesson files on the 4AM synthesis layout:
  - [ ] `lesson.config.js` with `kind: 'synthesis'`, nine modules, ALL their `Module<NN>` files (`registry.test.js` fails on a declared module without a
    route), `objectives` on every module, resources (six situations, the M7 `term-ferry` without `level`, the M7 situation);
  - [ ] `content/problems.js` + `problems.test.js` (every key recomputed with own BigInt arithmetic), `content/textbook.js`;
  - [ ] `knowledge.jsx` / map as in the 4AM syntheses.
- [ ] e2e `apps/web/e2e/lesson-kit/3am-musawiyat-mutabayinat-wadiya.mjs` (every module mounts, M7 lab first, M8 options literal).
- [ ] Bank (section 5), active / exam-style / policy, oracle import.
- [ ] Gates: lesson index, `npm test`, `npm run check:lessons`, `npm run build`, browser 768 / 1280 RTL.
- [ ] Publish (coordinator, guide §11):
  - [ ] catalogue flip: `available`, `pointsToLearn` P1–P2, `pointPrerequisites` (§2), `durationMinutes: 28`, `difficulty: "متوسط"`, `icon: "🚴"`;
  - [ ] `generate:learning-net`;
  - [ ] export/import, local DB publish;
  - [ ] commit, push `dev`.

## 8. Generator notes (2026-10-28)

Generated INTO the catalogue entry; bank by a template generator, lesson by hand. Changes to the plan:
- **Module 7 has NO `term-ferry` lab** (risk 3, fallback): a synthesis has no lab; `MethodSteps` + `TapQuestion`s analyse the pursuit (40 / 36 km/h, 2 km) and four variants (finish line 15 km → no; gap 1,3 km → 19,5 min → 20 min; 13 km < 15; `d ≤ 1,5`). The « حكاية » (opener, reworded) appears after the last answer. Module 8 stays the plan's trucks (two different situations: owner question 4, default kept).
- **`durationMinutes` is 28** (modules 0 + 7 + 8 = 6 + 16 + 6; the six situations are a problem track); `pointPrerequisites` as planned, P2 also depends on the synthesis's own P1.
- **Situation 6** adds the plan's « n = 23 » equality check as part 4; **situation 1** part 3 gives T = 16 000, 4 000, 4 800 as three numeric answers; **situation 5** asks the I bounds as numeric answers after the sign-reversal `choice`.
- **Module 0**: seven statements as planned, `requires` = the four lesson slugs. **Module 8**: the plan's options verbatim (E1–E3 P2, E4–E5 P1).
- **Bank:** 0 faithful `term_exam` (no paper re-read), 47 `term_exam_modelled`, 3 `adapted` (`integration`, `evaluation`, `challenge`); no new misconception id.
- `opener`, `challenge`, `integration`, `evaluation` → modules 7 / 1 / 7 / 8 in `build-extraction.py`, `verified: True` after re-reading pdf pp. 70 and 84 at 130 dpi (conform). The unit تحدّ text is rewritten in `units_3am_2026_2027.json` (no `sourceElementId`).
