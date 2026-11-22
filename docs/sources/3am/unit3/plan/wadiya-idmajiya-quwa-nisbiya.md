# Plan — `wadiya-idmajiya-quwa-nisbiya` « أدمج تعلّماتي — القوى ذات أسس نسبية صحيحة » (3AM unit 3, entry 4 of 4)

Read the unit README first (issues 3 and 4 concern this entry). Generated LAST, after the three lessons (and with `quwat-adad-nisbi`, already
published). Shape: exactly the unit-1 reference (MASAIL_GENERATION_GUIDE §14; models `4am/.../wadiya-idmajiya-aadad`,
`4am/.../wadiya-idmajiya-judhur`).

## 1. Identity

- Code `wadiya-idmajiya-quwa-nisbiya`, title « أدمج تعلّماتي — القوى ذات أسس نسبية صحيحة », unit `quwa-nisbiya`, catalogue order 14,
  kind `synthesis`, `prerequisiteLessonCodes`: the four lessons (already in the catalogue).
- Folder `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/quwa-nisbiya/wadiya-idmajiya-quwa-nisbiya/` (modules `Module00Astaidd`,
  `Module01Wadiya1` … `Module06Wadiya6`, `Module07AlWadiya`, `Module08Ahill` — ALL files present: `registry.test.js` fails on a declared module
  without its route).
- Textbook elements: « أدمج تعلّماتي » p. 52 (`integration`: the CO₂ molecule, pm / nm, prefix table — the printed short solution is wrong:
  « r1 = 48 × 10⁻¹¹ », « d = 2(r1 + r2 + d) »; the table misprints تيرا 10⁻¹² and جيغا 10⁶), « وضعية للتقويم » p. 52 (`evaluation`: red blood cells),
  ICT p. 53 (`ict`: grains on a chessboard, 2ⁿ, spreadsheet). They are the IDEAS; every context and number below is the platform's own.
  `ex-63/64/68/69` are NOT used (README issue 3).
- Does not seed.

## 2. Programme & net

- `programmeItems`: none (synthesis). Single LP proposed (catalogue `pointsToLearn` is empty today):
  **P1** « توظيف قوى العدد 10 وقواعدها، والكتابة العلمية والحصر ورتبة القدر، وقوة عدد نسبي وأولوية العمليات، لحلّ وضعيات مركّبة من
  الحياة والعلوم ».
- « أستعدّ » measures the unit's four lessons (`priorKnowledge` slugs of their main bricks); `reviewLinksForLesson` is empty (synthesis).
- noRebuild: none. pointPrerequisites: `"P1": ["3am_quwa-adad-ashara_P3", "3am_qawaid-quwa-ashara_P4", "3am_kitaba-ilmiya-rutba_P3",
  "3am_quwat-adad-nisbi_P3", "3am_quwat-adad-nisbi_P4"]` (all published and final by then; same-unit edges).
- Where it leads: 4AM BEM part I exercises (scientific writing of a computation result) and 4AM sciences.

## 3. Boundary

No new notion. Every step mobilises an LP already taught in the unit; a step that needs anything else (Pythagoras, Thales, fractions
beyond 3AM unit 2) is either given or absent. No « أؤكّد تعلّماتي », no « أتعمّق ».

## Shape (9 modules, unit-1 reference)

M0 أستعدّ · M1–M6 « الوضعية التدريبية N — … » (`stage: 'practice_lab'`, `track: 'problem'`, `GuidedProblem` data in `content/problems.js`, ids
`wadiya-idmajiya-quwa-nisbiya-1…6`, varied colours, an `illustration` each, `addition('exam_style_problem')`, no `assessment` on a training
step) · M7 « تحليل الوضعية النهائية للاختبار » (`al-wadiya`, `practice_lab`, read and analyse, NO solving; `knowledge.jsx` / `knowledgeGraph.js`
attached here) · M8 « وضعية الاختبار النهائي » (`ahill`, `evaluation`, `BossFinal`, the only mastery evidence). No `lessonProblem`. Lesson ≤ 90
min; catalogue `durationMinutes` = the validator's module total without the trainings (models: 30–40).

**M0 أستعدّ** (6 min, `objectives` « ما الذي ستحتاجه من الوحدة؟ »). Six statements (true/false + why): 1. « $10^{-4}=0{,}0001$ » ✓
(`ashara-salib`). 2. « $10^{6}\times10^{-2}=10^{-12}$ » ✗ ($10^{4}$; `jidaa-quwa-ashara`). 3. « الكتابة العلمية لـ $45\,000$ هي $45\times10^{3}$ » ✗
($4{,}5\times10^{4}$; `kitaba-ilmiya`). 4. « رتبة قدر $6{,}7\times10^{5}$ هي $7\times10^{5}$ » ✓ (`rutbat-qadr`). 5. « $(-2)^{4}=-16$ » ✗ (16; `ishara-quwa`).
6. « $5-2\times3^{2}=-13$ » ✓ (`awlawiya-quwa`).

## The six training situations (M1–M6)

Each: context (values in the story), `data` sorted useful / parasite, questions with computed answers, the LPs it mobilises. 6–8 min each.
`objectives` (Arabic, for the Classroom entry slide): W1 « كم حبّة في خانة؟ », « ما رتبة قدر $2^{60}$ ؟ », « ما كتلة القمح كلّه؟ » ·
W2 « كم بكتيريا بعد عدد من الساعات؟ », « متى تتجاوز $10^{12}$ ؟ » · W3 « أيّ السطور خاطئة؟ », « ما التصحيح؟ » · W4 « كم كرية حمراء في الجسم؟ »,
« ما ارتفاع عمود الكريات؟ » · W5 « كيف نحسب بالأولويات وقوى؟ », « ما الكتابة العلمية لـ A؟ » · W6 « ما مساحة الجزائر بالمتر المربّع؟ »,
« كم مترًا مربّعًا لكل ساكن تقريبًا؟ ».

**W1 — رقعة القمح** (from the ICT idea; illustration `stacks` of the first cells). « في نادي الشطرنج بالمتوسطة رقعة من 64 خانة. نضع حبّة
قمح في الخانة الأولى، وحبّتين في الثانية، وأربعًا في الثالثة، ونضاعف هكذا حتى الخانة الأخيرة. كتلة حبّة القمح حوالي $0{,}04$ غ. »
1) grains in cell 11 as a power of 2, then the number → $2^{10}=1\,024$. 2) cell 64 → $2^{63}$ (exponent 63). 3) knowing $2^{10}\approx10^{3}$, the
order of $2^{60}=(2^{10})^{6}$ → about $10^{18}$ (choice: $10^{18}$ · $10^{9}$ · $10^{60}$ — the last two = adding / not powering). 4) the total is
about $1{,}8\times10^{19}$ grains; with $0{,}04$ g $=4\times10^{-5}$ kg each, the mass → $7{,}2\times10^{14}$ kg (scientific). Parasite datum: « 64 خانة »
is needed; « نادي الشطرنج يجتمع يوم الثلاثاء » is the parasite. Mobilises `quwat-adad-nisbi` P1 P3, `qawaid-quwa-ashara` P3 P4, `kitaba-ilmiya-rutba` P1.

**W2 — بكتيريا المخبر** (illustration `timeline`). « في مخبر لتحليل الماء يتضاعف عدد البكتيريا في عيّنة عشر مرّات كل ساعة. عند بداية
الملاحظة كان عددها $3\times10^{2}$ . » 1) after 5 h → $3\times10^{7}$. 2) after h hours (choice) → $3\times10^{2+h}$ · $3\times10^{2h}$ · $30^{h}$. 3) the first
whole hour when the count reaches $10^{12}$ → $h=10$ ($3\times10^{12}\ge10^{12}$; at $h=9$, $3\times10^{11}<10^{12}$). 4) how many times more at hour 8
than at hour 3 → $\frac{3\times10^{10}}{3\times10^{5}}=10^{5}$. Mobilises L1 P1, L2 P1 P2, L3 P2.

**W3 — دفتر سلمى** (judge and correct; illustration `tags` of the notebook lines). « صحّح دفتر سلمى: ضع ✓ أو ✗ وصحّح الخطأ. » Lines:
$(-2)^{4}=-16$ ✗ → 16 · $10^{-3}=-1000$ ✗ → $0{,}001$ · $10^{5}\times10^{3}=10^{8}$ ✓ · « الكتابة العلمية لـ $45\,000$ هي $45\times10^{3}$ » ✗ → $4{,}5\times10^{4}$ ·
« رتبة قدر $6{,}7\times10^{5}$ هي $7\times10^{5}$ » ✓ · $3^{-2}=\frac{1}{9}$ ✓. Mobilises all four lessons.

**W4 — الكريات الحمراء** (the evaluation idea, own numbers; illustration `stacks`). « يحتوي $1\ \mathrm{mm^3}$ من الدم على حوالي $5\times10^{6}$ كرية
حمراء، وفي جسم رجل حوالي 5 لترات من الدم. نشبّه الكرية بقرص سُمكه حوالي $2{,}5\ \mu\mathrm{m}$ . » 1) $1\ \mathrm{L}=10^{6}\ \mathrm{mm^3}$: the volume in mm³ →
$5\times10^{6}$. 2) red cells in the body → $2{,}5\times10^{13}$. 3) piled up, the column's height in m ($1\ \mu\mathrm{m}=10^{-6}$ m) → $2{,}5\times10^{13}\times2{,}5\times10^{-6}=6{,}25\times10^{7}$ m.
4) its order of magnitude in km → $6\times10^{4}$ km (62 500 km; parasite comparison available: the Earth's circumference ≈ $4\times10^{4}$ km).
Mobilises L1 P3, L2 P3 P4, L3 P1 P3.

**W5 — ثلاثة أعداد** (term-exam style; illustration `tags` A, B, C). « $A=(-3)^{2}\times10^{-2}+4\times10^{-1}$ ؛ $B=\frac{(2^{3}\times5^{3})^{2}}{10^{4}}$ ؛
$C=(-1)^{7}-2\times(-2)^{3}$ . » 1) A → $0{,}49$, scientific $4{,}9\times10^{-1}$. 2) B as a power of 10 → $10^{2}$ ($(10^{3})^{2}/10^{4}$). 3) C → 15. 4) compare A and
$\frac{1}{2}$ → $A<\frac{1}{2}$. Mobilises `quwat-adad-nisbi` P1 P3 P4, L2 P3 P4, L3 P1.

**W6 — الجزائر بالأرقام** (illustration `tags`). « مساحة الجزائر حوالي $2\,381\,741\ \mathrm{km^2}$ ، وعدد سكّانها حوالي 47 مليون نسمة. »
1) the area in scientific writing → $2{,}381741\times10^{6}$ km². 2) in m² ($1\ \mathrm{km^2}=10^{6}\ \mathrm{m^2}$) → $2{,}381741\times10^{12}$ m², order $2\times10^{12}$.
3) the population → $4{,}7\times10^{7}$. 4) area per inhabitant, order of magnitude → $\frac{2{,}381741\times10^{12}}{4{,}7\times10^{7}}\approx5{,}07\times10^{4}$ m² → $5\times10^{4}$ m²
(about 5 ha). Mobilises L1 P3, L2 P2 P3, L3 P1 P3.

## The integration situation — « رقاقة الذهب » (M7 analysis, M8 test)

Platform rewrite of the book's integration idea (atoms, pm / nm / µm prefixes, scientific writing): « في ورشة لتذهيب إطارات الصور تستعمل
الحِرفيّة نور رقائق من الذهب سُمك الواحدة منها حوالي $0{,}1\ \mu\mathrm{m}$ ، وثمن الرقيقة 350 DA. قطر ذرّة الذهب حوالي $288\ \mathrm{pm}$ . »
Prefix table shown (correct values): ميلي $10^{-3}$ · ميكرو $10^{-6}$ · نانو $10^{-9}$ · بيكو $10^{-12}$. Questions of the situation: 1) the diameter of
an atom in m (scientific) → $288\times10^{-12}=2{,}88\times10^{-10}$ m. 2) the thickness of a leaf in m → $0{,}1\times10^{-6}=10^{-7}$ m. 3) how many layers
of atoms in the thickness → $\frac{10^{-7}}{2{,}88\times10^{-10}}\approx3{,}47\times10^{2}$ (≈ 347). 4) its order of magnitude → $3\times10^{2}$. 5) atoms side by side
on 1 mm → $\frac{10^{-3}}{2{,}88\times10^{-10}}\approx3{,}47\times10^{6}$, bracket $10^{6}\le N<10^{7}$. Parasite datum: the price 350 DA.

**M7 تحليل الوضعية النهائية للاختبار** (`practice_lab`, 12 min; `objectives` « ما المطلوب؟ », « أيّ معطى لا نحتاجه؟ », « بأيّ وحدة نحسب؟ »).
`InfoSorter` (useful: 0,1 µm, 288 pm, the table; parasite: 350 DA) → three analysis steps revealed one by one (read · choose the common unit:
the metre · the operation: a QUOTIENT of two lengths, then the scientific writing and the order) → three decisions (TapQuestion, no
computation): « لنعرف عدد الطبقات نقسم: » ✓ « السُّمك على قطر الذرّة » · « قطر الذرّة على السُّمك » · « السُّمك × قطر الذرّة » ; « نحوّل
القياسين إلى: » ✓ « المتر، بقوى العدد 10 » · « نترك µm و pm كما هما » ; « رتبة القدر نأخذها من: » ✓ « الكتابة العلمية للنتيجة » · « عدد أرقام
النتيجة ». Knowledge map attached to this module.

**M8 وضعية الاختبار النهائي** (`evaluation`, `BossFinal`, 10 min; five épreuves, LP P1, every distractor false and named):
E1 « قطر ذرّة الذهب بالمتر » ✓ $2{,}88\times10^{-10}$ · $2{,}88\times10^{-12}$ (prefix kept, no normalisation) · $288\times10^{-10}$ · $2{,}88\times10^{-9}$.
E2 « سُمك الرقيقة بالمتر » ✓ $10^{-7}$ · $10^{-5}$ · $10^{-6}$ · $10^{-8}$. E3 « عدد طبقات الذرّات » ✓ $3{,}47\times10^{2}$ تقريبًا · $3{,}47\times10^{-17}$ (exponents
added in the quotient) · $3{,}47\times10^{3}$ · $2{,}88\times10^{3}$ (inverted quotient read). E4 « رتبة قدر عدد الطبقات » ✓ $3\times10^{2}$ · $4\times10^{2}$ ·
$1\times10^{2}$ · $3\times10^{3}$. E5 « عدد الذرّات المتجاورة على 1 mm محصور بين » ✓ $10^{6}$ و $10^{7}$ · $10^{5}$ و $10^{6}$ · $10^{7}$ و $10^{8}$ · $10^{-7}$ و $10^{-6}$.

## The تحدّ

The textbook تحدّ is already `quwat-adad-nisbi`'s مسألة الدرس. Recommended (README issue 4): when this synthesis is published, set
`units_3am › quwa-nisbiya.challenge` to « رقاقة الذهب » (`sourceElementId: 'integration'`, page 52) with its drawing through
`pages/unit/UnitOpenerFigure.jsx › FIGURES['quwa-nisbiya:challenge']` reusing this lesson's illustration — never an answer. Owner to confirm.

## 9. Practice bank (`content/practice/3am/wadiya-idmajiya-quwa-nisbiya/`, section « الوضعيات »)

- **Corpus (multi-lesson / integration exercises):** `3am-s2-83` ex5 (integration: a right-triangle plot, its area in scientific writing —
  geometric steps given, `counted: false`) · `3am-s2-76` ex1 (orders of A, B, A × B; bracket of A/B) · `3am-s2-80` ex1 (bracket, order, a
  fraction computation `counted: false`) · `3am-s3-51` ex1 (scientific writing + a power of 3 + an expansion `counted: false`) · `3am-s2-69` ex1
  and `3am-s2-75` ex1 (scientific writing within mixed computations; poor text layers: read visually). **Honest faithful `term_exam`: ≈ 6**.
- **Plan:** 5 levels × 10 « وضعيات »: L1 single-lesson warm-ups modelled on `3am-s2` (10 modelled); L2 two-lesson chains (powers of 10 +
  scientific): 2 term_exam (3am-s2-76, 3am-s2-80) + 8 modelled; L3 relative powers + priority + scientific (W5 type): 2 term_exam (3am-s3-51,
  3am-s2-69) + 8 modelled; L4 real-world quantities (W2/W4/W6 types, own contexts): 1 term_exam (3am-s2-75) + 6 modelled + 3 adapted
  (`integration`, `evaluation`, `ict` — the three textbook situations rewritten with their own numbers corrected); L5 full integration
  situations: 1 term_exam (3am-s2-83 ex5) + 9 modelled. ≈ 6 / 41 / 3. Badges per paper header (« الفصل الثاني », « الثالث » for 3am-s3-51).
- **Oracle** `scripts/practice-oracle/wadiya-idmajiya-quwa-nisbiya.mjs`: reuses the three lessons' oracle helpers (BigInt rationals and
  decimals, the power parser of `quwat-adad-nisbi.mjs`), recomputes every key from the statement. No `أتعمّق` item cited or labelled.

## 10. Risks & owner questions

1. The unit's تحدّ card (README issue 4) — confirm it moves to « رقاقة الذهب ».
2. ex-63/64/68/69 destinations (README issue 3) — re-destine or `notIntegrated`.
3. Real values rounded with « حوالي » (blood ≈ 5 L, 5 × 10⁶ cells/mm³, cell thickness ≈ 2,5 µm, gold atom ≈ 288 pm, leaf ≈ 0,1 µm,
   Algeria ≈ 2 381 741 km² and ≈ 47 million inhabitants, wheat grain ≈ 0,04 g): keep « حوالي » visible.
4. W1 uses 2¹⁰ ≈ 10³ as an approximation — an order-of-magnitude reasoning; confirm it is acceptable at 3AM (it is the ICT's spirit).
5. Synthesis LP wording (P1) is new (the catalogue entry has none) — confirm.

## 11. Generator checklist

- [ ] Move the destinations of `integration`, `evaluation`, `ict` to M7/M8 and the bank (`module: "practice"` for the adapted sheets);
      apply README issue 3; re-run `build-extraction.py`; `check:textbook` green.
- [ ] Lesson files (config without `lessonProblem`, `situations`, `priorKnowledge`, `teachingScope.exclude: ['أي مفهوم جديد']`), the nine
      modules, `content/problems.js` + `problems.test.js` (every number recomputed independently, BigInt), `knowledge.jsx` / `knowledgeGraph.js` on M7.
- [ ] Stages `practice_lab` + `evaluation` only (`REQUIRED_STAGES_BY_KIND.synthesis`); `masailIllustrations.test.js` (a support per situation,
      every number in the statement).
- [ ] e2e: extend `apps/web/e2e/lesson-kit/3am-quwa-nisbiya.mjs` or add `3am-quwa-nisbiya-wadiya.mjs` (every module mounts at 768 and 1280, no
      console error, no raw `$`).
- [ ] `generate:lesson-index`, `npm test`, `check:lessons`, `build`; catalogue (`pointsToLearn` P1, `pointPrerequisites`, `available`,
      `durationMinutes`, `difficulty: 'متوسط'`, `icon: '🧩'`); units challenge if approved; coordinator publishes (guide §11).

## 12. Generator notes (2026-10-28)

Generated INTO the catalogue entry; bank by a template generator, lesson by hand. Changes to the plan:
- **`durationMinutes` is 30**: `validate:lessons` computes a synthesis as modules 0 + 7 + 8 (6 + 12 + 12 min), problem tracks excluded.
- **Situations** keep the plan's six ideas but the answers in scientific writing are two numeric steps (`a`, `n`); W1 gets the planned `2¹⁰ ≈ 10³` order-of-magnitude reasoning and gives the total grains « حوالي 1,8 × 10¹⁹ » as data (the sum 2⁶⁴ − 1 is not 3AM); W3 has SIX lines (the plan's list) so the notebook note is 3 / 6; W5 / W6 as planned.
- **Module 7** data: the plan's table row becomes one sorter item « جدول البادئات » (no raw `^`) and the 350 DA price + « الورشة تذهّب إطارات الصور » are the two useless data; the three decisions are as planned (operation, unit, where the order of magnitude comes from); E3's inverted-quotient distractor is `2,88 × 10⁻³` (the real inverse), not the plan's `2,88 × 10³`.
- **Bank:** 0 faithful `term_exam` (no paper re-read), 47 `term_exam_modelled`, 3 `adapted` (`integration`, `evaluation`, `ict`); the unit تحدّ card is unchanged (owner question 1).
- `integration`, `evaluation`, `ict` → modules 8 / 4 / 1 in `build-extraction.py`, `verified: True` after re-reading pdf pp. 52–53 at 110 dpi; the book's misprinted prefix table and « حل مختصر » appear nowhere.

