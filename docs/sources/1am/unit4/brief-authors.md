# 1AM unit 4 « الكتابات الكسرية » — authors' brief (lesson `ikhtizal-kitaba-kasriya`, 2026-10-14)

Cycle moyen rollout, phase 3 — same organisation as `docs/sources/1am/unit2/brief-authors.md` (read its tables of file ownership
and its two author sections: they apply here with the names below). The lead writes the lesson
(`apps/web/src/lessons/moyen/1am/ansab_al_aadad_wal_hisab/kitabat-kasriya/ikhtizal-kitaba-kasriya/`) and the extraction
(`docs/sources/1am/unit4/extraction.json`, built by `build-extraction.py`; the unit is seeded: `kitabat-kasriya/_unit/`).

| Author | Owns | Never touches |
|---|---|---|
| **Lab** | `manipulations/operations/FractionKnife.jsx`, `manipulations/logic/fractionKnife.js` (+ `.test.js`), `manipulations/operations/fractionKnife.render.test.jsx`, the `fraction-knife` entries of `manipulations/levels.js` and `manipulationRegistry.js`, the `fractionKnife` namespace of `i18n/locales/ar/lesson.manipulation.json`, its section in `MANIPULATION_CONTRACT.md` (§2 next free number, after the batch-2 `rank-exchange` one) and its row in `MANIPULATION_DNA.md` §15 | the lesson folder, `content/practice/**`, the extraction |
| **Bank** | `content/practice/1am/ikhtizal-kitaba-kasriya/**`, the lesson's entries in `content/practice/{active,exam-style,policy,misconceptions}.json`, `scripts/practice-oracle/ikhtizal-kitaba-kasriya.mjs` and its import in `scripts/practice-answer-oracle.test.mjs` | the lesson folder, the lab, the extraction |

Already done by the lead (do not redo): the type `'fraction-knife'` is declared in `packages/core/curriculum/manipulationTypes.js`
(its `shows` line is hidden until discovery); the drawn world `sweets-tray` is in `VISUAL_THEMES`
(`packages/core/curriculum/manipulationLevels.js`). Until the lab author adds the registry entry and the levels preset,
`manipulationRegistry.test.js` (« missing: fraction-knife ») and `levels.test.js` fail — expected, it is the lab author's first commit.

**Lab author must meet MANIPULATION_DNA §17 incl. §17.7 and review screenshots at 1280×800, 1366×768, 390×844, 320×640 of initial
and mid-activity states** (a refused cut, a readable writing stamped, Amine's claim judged, the prediction pins judged, the formal phase).

## The lesson in one paragraph

« الكتابات الكسرية لحاصل قسمة واختزال كسر » (1AM, textbook نشاط 4 p. 54, معارف 3 p. 55 (+ the last example of معارف 1, « 0,7 = 7/10 »),
طريقة p. 56 « اختزال كتابة كسرية » (45/567 = 5/63), دوري الآن ②③ p. 56, exercises 15–27 p. 58, أقوّم 4–5 p. 59, أتعمّق 1 and 8 p. 60,
the unit's تحدّ « أين أضع الفاصلة؟ 235017/1000 » p. 51 and the calculator page p. 62). Programme items `1am.m5.r01` « التعرّف في حالات
بسيطة على الكتابات الكسرية لعدد », `1am.m5.r02` « اختزال كتابة كسرية (كسر) », `1am.m5.x1` « الانتقال من الكتابة العشرية لعدد عشري إلى
كتابة كسرية له ». The idea the student must DISCOVER: **one and the same share of a whole has MANY fractional writings — cutting every
piece into k equal pieces multiplies the number of pieces in the share AND in the whole by k (3/5 = 6/10 = 12/20); gluing k pieces into
one divides both by k, which is only possible when k divides BOTH counts (27/45 = 9/15 = 3/5) — that is reducing, and the divisibility
rules tell which k to try. A writing with denominator 10, 100, 1000 is a decimal fraction and gives the decimal writing (3/5 = 6/10 = 0,6;
0,7 = 7/10).** The textbook's own numbers: the three identical rectangles of نشاط 4 (5 strips; 5 × 2 = 10; 5 × 4 = 20 pieces) and the
grandfather's question « 3/5 من 3500DA أو 27/45 من 3500DA؟ » to answer WITHOUT computing.

**How the lesson stands without « حاصل القسمة والكسر » (queue order).** The net queue generates this lesson (catalogue order 18) BEFORE
`hasil-qisma-kasr` (order 15, same unit), whose content is « الكسر a/b حاصل قسمة a على b ، a/b × b = a ». This lesson does NOT rebuild it
(no-duplication rule): its lab and its discovery need only the primary-school meaning « a fraction is a share of a whole cut into equal
pieces » (textbook prerequisite « الكسور البسيطة كأجزاء من الوحدة »; « أستعدّ » measures it with textbook item 9 of p. 52); the quotient
reading appears ONCE, as the textbook's own wording in معارف 3 (« لا يتغير حاصل القسمة a/b … ») with a one-line « تذكّر » box naming
« حاصل القسمة والكسر » (shown as « قريبًا » until published), and P2 goes fraction → decimal fraction → decimal by MULTIPLYING
(7/4 = 175/100 = 1,75), never by the decimal division of another lesson. `pointPrerequisites` toward `hasil-qisma-kasr` are NOT written
(not published, D1); that lesson, once generated, adds its own edges to this one's P1.

Final الكفاءات (`1am_ikhtizal-kitaba-kasriya_P<n>`, order kept; changes vs the drafts and reasons in the lead's report):

1. **P1** إنتاج كتابات كسرية مختلفة لنفس العدد بضرب البسط والمقام في نفس العدد غير المعدوم أو بقسمتهما عليه: $\frac{a}{b}=\frac{a\times k}{b\times k}$ ($k\neq0$)
2. **P2** الانتقال بين الكتابة العشرية لعدد عشري وكتابته على شكل كسر عشري، وتحويل كتابة كسرية إلى كسر عشري ثم إلى كتابة عشرية عندما يكون ذلك ممكنا
3. **P3** اختزال كتابة كسرية بالبحث عن قاسم مشترك للبسط والمقام بقواعد قابلية القسمة، مرّة أو عدّة مرّات حتى أبسط شكل ممكن

`pointPrerequisites`: P2 ← P1, P3 ← P1 (intra-lesson); **P3 ← `1am_qawaid-qabiliyat-qisma_P1`, P3 ← `1am_qawaid-qabiliyat-qisma_P2`** (net
link `1am.m3.r02` → `1am.m5.r02`, toward a published lesson). The net's other review item, `1am.m1.r02` (home `kitabat-adad-tabii`, being
generated in this batch, not yet published) stays at item / lesson level; `kitabat-adad-tabii` adds the P2 edge when it publishes.

Modules (lead, phase 2; ≤ 90 min): 0 أستعدّ (textbook items 1, 2, 9 of p. 52 + platform items for `1am.m1.r02` and `1am.m3.r02`) ·
1 نشاط « نفس الحصّة » (the lab, both levels, then « أتوقّع القاعدة ») · 2 معارف (know-3 + « 0,7 = 7/10 ») · 3 طريقة « اختزال كتابة كسرية »
(45/567, دوري الآن ②③) · 4 أتمرّن (ex-15 … ex-27) · 5 تحدّ « أين أضع الفاصلة؟ » + الآلة الحاسبة (p. 62) · 6–8 three مسائل (أتعمّق 1:
the triangles 5/16 and 6/16 = 3/8; أتعمّق 8: 5Δ2□; one platform problem modelled on `1am-s3-43` ex 1 ②) · 9 إختبار أولي (cut from أقوّم 4–5).

## Lab author — `fraction-knife`

Read first exactly what the unit-2 brief lists for its lab author (MANIPULATION_DNA all — §12, §16.3 and §17 above all;
MANIPULATION_CONTRACT §1, §2, §4.2, §6bis, §6ter, §7, §7bis-levels, §7ter, §8, §8bis, §8ter, §9), then the three batch-1 labs as the
quality and idiom references: `operations/DivisionJumps.jsx` (stretch engine on a rail, `useLessonViewport` budget, the « say it once »
render test), `operations/DigitCards.jsx` (claims judged by the logic, kit composition) and `operations/StoryBars.jsx` (bidi isolates);
`primitives/LabKit.jsx`, `SvgPill.jsx`, `KidFigure.jsx` (girls ALWAYS in hijab + tunic, guide §6). Exact arithmetic ONLY through
`@smarter-academy/core/arithmetic/linear.js` (`frac`, `mul`, `div`, `eq`, `cmp`, `isInteger`, `fracText`, `fracDecimal`) and
`…/divisibility.js` (`divmod`), imported BY PATH — never floats for a verdict, never the core barrel. Strings in
`lesson.manipulation.json › fractionKnife` (counted nouns « قطعة / قطع » through plural keys `_zero … _other`; numbers and fractions as
LTR islands, decimal comma).

**Why this is not another lab (DNA §12).** 1AM: `story-bars` stretches an unknown height / carries calc cards onto texts; `division-jumps`
stretches q, the number of groups of a GIVEN size, along a row or a line; `digit-cards` colours table cells and arranges digit cards under
claim lamps. 4AM: `fraction-reduction` (the kitchen recipe) has the student CARRY a number of portions k (2…12) and divide two ingredient
counts — the variable is the common divisor, the object two separate quantities. Here the object is ONE AREA with ONE FIXED SHARE (its
edge never moves: the invariant IS the number), and the hand holds the KNIFE — d, the number of equal pieces of the whole, finer or coarser.
The numerator is never chosen: it is READ (how many pieces lie in the share), and it exists only when the share's edge falls on a cut. The
refusal is geometric — a piece straddling the edge — not a rejected chip. (`square-root-side` « graduation » also asks « does a point land
on a graduation? », but on a 1D length with an irrational target; here it is an area, both terms of the fraction are counted, and the
movement goes both ways — finer = ×k, coarser = ÷k.)

**Props contract (fixed — the lesson is written against it):**

```jsx
<Manipulation type="fraction-knife"
  world="tray" | "paper"               // from the level preset; a lesson may force it
  share={[3, 5]}                       // the share's value as the writing first shown (p, q); the edge sits at p/q of the whole
  start={5}                            // the knife's initial number of pieces d (the first writing drawn: p/q itself)
  max={20}                             // the largest d on the rail (the rail is 1 … max)
  claim={[4, 6]}                       // optional (مبتدئ): Amine's claim « 3/5 = 4/6 » to be judged by the tray
  targets={[[6, 10], [12, 20]]}        // optional (متقدم): writings the student must reach (the textbook's rectangles 2 and 3)
  then={{ share: [27, 45], start: 45, max: 45, predict: true }}   // optional (متقدم): the second share, opened by the student
  level, levels, title, lead           // as every type
  onTrial={(e) => …}                   // each VALIDATED gesture, via state.report:
                                       //   { kind: 'cut',   share: '3/5', d, inShare: '18/5' (exact, fracText), readable, writing?: '6/10' }
                                       //   { kind: 'claim', claim: '4/6', ok }       (Amine's claim judged)
                                       //   { kind: 'pin',   share: '27/45', d, readable }  (a prediction pin judged by the knife)
  onFinished={({ share }) => …}        // the formal phase (share = the last share worked, '3/5' or '27/45')
/>
```

`levels.js`: `'fraction-knife': { beginner: { numbers: { world: 'tray', share: [3, 5], start: 5, max: 20, claim: [4, 6] }, ...P },
advanced: { numbers: { world: 'paper', share: [3, 5], start: 5, max: 20, targets: [[6, 10], [12, 20]], then: { share: [27, 45], start: 45,
max: 45, predict: true } }, ...T('act-4') } }`.

**The mathematics (logic/fractionKnife.js, pure).** For a share p/q and a cut d: `inShare = p × d / q` (exact); the cut is READABLE iff
`inShare` is an integer (⇔ q / gcd(p, q) divides d); then the writing is `inShare/d`. For an unreadable cut: `whole = ⌊inShare⌋` pieces lie
inside, the straddling piece is split at the fraction `inShare − whole` of its width (drawn exactly). From a readable d to a smaller readable
d′, the glue size is `d / d′` (an integer when d′ divides d): the two terms are divided by it. Decimal tag: a readable writing whose d is 10,
100 or 1000 is a `كسر عشري`, its decimal writing is `fracDecimal`. Amine's claim a/b is judged at d = b: true iff readable with
inShare = a (here 3 × 6 / 5 = 18/5 = 3,6 ≠ 4 — false, and drawn: 4 pieces overflow the edge by 2/5 of a piece).

**مبتدئ — `world: 'tray'` (theme `sweets-tray`, platform).** The evening of the Aïd: grandmother's long tray of « قلب اللوز » (drawn with
care: golden cake, almond on each piece, syrup sheen, a tray rim with depth), and grandma's ribbon across the tray at 3/5 of its length —
the neighbours' share (value: صلة الجار). A girl (KidFigure, hijab) holds the box for the neighbours; she reacts. Start: 5 pieces, 3 in the
share (3/5 stamped into the « دفتر الكتابات » notebook as the first writing). The hand drags the KNIFE along a rail under the tray
(`useStretchInteraction`, slider semantics: keyboard ±1, −/+ round buttons, tap on the rail; live cut lines during the drag, committed
on release). On commit, from the logic only:
- **readable** (d = 10, 15, 20): every piece inside the share takes the box colour, the count pill reads « 6 قطع من 10 », the writing
  `6/10` is STAMPED into the notebook (a writing already there is not stamped twice); at d = 10 the stamp carries a small « كسر عشري: 0,6 »;
- **unreadable** (any other d): the straddling piece is drawn half in, half out (the cut and the ribbon visibly apart), the pill reads
  « 3 قطع وجزء من قطعة » — no writing; the girl hesitates (`mood`).
Then **Amine's claim** (a card, opened by the student once ≥ 2 writings are stamped: « أمين: أضفتُ 1 إلى البسط والمقام: 3/5 = 4/6 »):
the student judges it by cutting at 6 — the tray draws Amine's 4 pieces as dashed ghosts that OVERFLOW the ribbon; « صحيح / خطأ »
judged against the logic. `discoveryReady` = 3 distinct readable writings stamped (incl. one with d ≠ 5) + ≥ 1 unreadable cut + the claim
judged.

**متقدم — `world: 'paper'` (textbook نشاط 4: the rectangle on squared paper).** The textbook's rectangle (drawn on « ورقة مرصوفة »,
its 5 strips first), share 3/5 coloured yellow (the textbook's colour). Task 1 — reach the textbook's two other rectangles: 6/10 (red) and
12/20 (green), each stamped beside its textbook rectangle number (1, 2, 3); the three coloured areas are drawn superposed to show they
COINCIDE (the textbook's « قارن بين مساحات السطوح الملوّنة »). Task 2 — **the grandfather's gift**, opened by the student (« 3/5 من
3500DA أو 27/45 من 3500DA؟ »): a second rectangle at d = 45 with 27 pieces in the share. BEFORE the knife moves (`predict: true`), the
student plants up to three pins on the rail (d < 45) where they think the gift will still be readable with fewer pieces; then the knife
judges each pin as it passes (`kind: 'pin'`). The traps are real: d = 9 divides 45 but 27 × 9 / 45 = 5,4 (straddle), d = 3 divides both
27 and 45 but gives 1,8 — what matters is the GLUE size 45 ÷ d dividing 27 (readable d = 15 → 9/15, d = 5 → 3/5). When the student
reaches d = 5, the two rectangles' edges coincide: same share, so « لا فرق » — answered without computing 2100 DA. No scaffolding: the
rail is not labelled with the readable values; glue groups (brackets of 3 or 9 old pieces) are drawn only AFTER a readable coarser cut.
`discoveryReady` = the two targets stamped + 27/45 brought to 5 pieces + ≥ 1 refused d < 45 (a pin or a cut).

**Discovery** (`ManipulationDiscovery`, conjectures refuted with the student's OWN cuts and notebook):
- مبتدئ — « ما الذي يجمع كل الكتابات في دفترك؟ »: right « نضرب البسط والمقام في نفس العدد » ; wrong « نضيف نفس العدد إلى البسط
  والمقام » (refuted by Amine's 4/6 and the student's cut at 6), « يكفي أن نكبّر المقام » (refuted by the student's own unreadable cut,
  e.g. 7 or 8: « 4 قطع وجزء من قطعة »).
- متقدم — « كيف نمرّ من 27/45 إلى 3/5 دون أن تتغيّر الحصّة؟ »: right « نجمع كل 9 قطع في قطعة: نقسم البسط والمقام على نفس العدد 9 » ;
  wrong « نقسم المقام على أيّ قاسم له » (refuted by d = 9: 45 ÷ 5 but 27 ÷ 5 is not whole — 5,4 قطع), « نقسم المقام وحده » (27/5 —
  more than the whole tray: drawn).
**Formal:** $\frac{3}{5}=\frac{3\times k}{5\times k}$ with the student's own k's (2, 3, 4) and $\frac{27}{45}=\frac{27\div 9}{45\div 9}=\frac{3}{5}$,
« نقول إننا اختزلنا الكسر »; the decimal line $\frac{3}{5}=\frac{6}{10}=0{,}6$ when d = 10 was stamped. The rule is never visible before
the discovery (no `shows` line, no lead that states it, no option carrying evidence — DNA §9).

**Must:** not eligible for « جرّب كل الإمكانيات » (each cut and each pin is an answer) — say so in the header; design sheet (DNA §7) +
the contract's five questions in the header; one screen at 1280×800 → 320×640 (measure: `[data-fk-glance]` = tray + rail + count pill +
notebook strip; the notebook is a one-line strip of stamps under the tray, `LabFold` for older stamps on phones); pieces ≥ 6 px wide at
320 px (at d = 45 the tray may be drawn as 3 equal bands of 15 read in order — RTL —, the share continuous across bands; sweep-tested);
keyboard + tap paths for the knife, the pins, the claim; reduced motion (no cutting animation, instant state); three progressive hints,
closed by default, each one short thinking question that never gives a readable d (« أين تقع حافّة الحصّة بالنسبة إلى القطع؟ »);
« إعادة » resets the scene and the notebook; `state.report` for every lesson callback. DOM contract:
`[data-fraction-knife][data-world][data-share][data-d][data-solved]`, `[data-fk-glance]`, `[data-fk-knife]` (slider, `aria-valuenow` = d),
`[data-fk-piece=<i>][data-in]` (`in` = `full` | `part` | `out`), `[data-fk-edge]`, `[data-fk-count]`, `[data-fk-stamp=<a/d>]`,
`[data-fk-decimal]`, `[data-fk-claim][data-judged]`, `[data-fk-pin=<d>][data-state]`, `[data-fk-verdict=<readable|straddle>]`,
`[data-fk-glue]`, `[data-fk-formal]`, `[data-fk-next]` (opens the second share).

**Tests:** `logic/fractionKnife.test.js` — for every share used (3/5, 27/45) and a sweep p/q (1 ≤ p ≤ q ≤ 30) × d ∈ 1..60: readable ⇔
q / gcd(p, q) | d, the writing equals p/q exactly (`eq`), the straddle fraction is in ]0, 1[ when unreadable; 27/45 readable below 45
exactly at {5, 15} (and 9, 3 are not); Amine's 4/6 false, 6/10 and 9/15 true; the glue size divides both terms; the layout (single row
or bands) swept at five widths: each piece once, inside the width, ≥ 6 px, the edge at the exact fraction of the band length.
`operations/fractionKnife.render.test.jsx` — both levels render, the second share opens, no raw keys, no `{{` in a rendered option, no
Latin prose, and « says each thing ONCE » (the `division-jumps` test as the model). Then
`cd apps/web && npx vitest run src/lessons/common/manipulations src/lessons/common/i18nHookScope.test.js` (do not name a local test helper
`t`). A fresh Vite of the repo runs on http://localhost:5174 (do not start another one, never touch 5173). Do NOT run `npm run build`.
Report: files, test results, the DOM contract as built, the screenshots reviewed and what changed after looking at them.

## Bank author — `content/practice/1am/ikhtizal-kitaba-kasriya/`

Exactly the unit-2 bank brief (`docs/sources/1am/unit2/brief-authors.md` « Bank author »), its reading list and its rules, with:

- LP ids `1am_ikhtizal-kitaba-kasriya_P1..P3` (above), each primary on ≥ 8 questions.
- **Corpus** (`exams-index.json`, items `1am.m5.r01` / `1am.m5.r02` / `1am.m5.x1`) — read each PDF (`pdftotext -layout`, or
  `pdftoppm -r 110` when the layer is poor) and model only the steps that belong to THIS lesson:
  - TERM 2 (badge « على منوال اختبار الفصل الثاني »): `1am-s2-64` ex 1 (decimal → fraction 1,9 ; a fraction with denominator 1000 → its
    decimal writing — the x1 item), `1am-s2-72` ex 1 (صحيح أو خطأ مع التصحيح, its fraction item « الكسر … يساوي الكسر … ») and ex 5
    (comparing shares of an amount, « التعبير بكسر » — only its equal-writings / reduction steps are THIS lesson; the « أخذ كسر من عدد »
    steps belong to `akhdh-kasr-min-adad` and are `counted: false`), `1am-s2-82` ex 1 (« إتمام فراغات وحساب كسور مع الاختزال », poor text
    layer — render it).
  - TERM 3 (badge « على منوال اختبار الفصل الثالث »): `1am-s3-37` ex 2 ③ (« اختزل الكسر … إلى أبسط شكل ممكن »), `1am-s3-39` ex 1 ①
    (« ضع مكان النقط العدد المناسب »: three equal-writing blanks, around 12/8, 1/2 and 25/100 — read the rendered page), `1am-s3-43` ex 1 ② (« اشرح لماذا 59/7,5 = 590/75 »),
    `1am-s3-47` ex 1 ② (« اختزل الكسور التالية »). The fraction ARITHMETIC of these papers (sums, products of fractions) is NOT this
    lesson — skip it or mark it `counted: false`.
  - Not usable as `term_exam`: `1am-s3-44`, `1am-s3-45` (examType `remedial`, « استدراك »), `1am-s2-65` (`other`, no text layer),
    `1am-s2-62` ex 2 (a term-3 paper filed under s2, and its fractions are « كسور من مربعات ملونة » — `hasil-qisma-kasr`), `1am-s1-100`
    (a 3AM paper).
  About half of levels 3–5 modelled on one precise corpus exercise; the generated ones `{type:"platform_addition",
  reason:"term_exam_modelled", modelledOn:"1am-s2"}` with the term-2 badge.
- **Textbook elements you may cite** (destination `ikhtizal-kitaba-kasriya`): `act-4`, `know-3`, `method-2`, `now-56` (its items ②③ only),
  `ex-15` … `ex-27`, `self-4`, `self-5`, `deep-1`, `deep-8`, `ict`, `prep` (items 1, 2, 9), and `challenge` (declared `duplicatedIn`).
  NOT `know-1` (its « 0,7 = 7/10 » item is cited by the lesson's معارف, the element belongs to `hasil-qisma-kasr`), not `act-1..3`,
  `ex-1..14`, `self-1..3`, `self-6..9`, `deep-2..7`, `aside-58`, `ict-opinion`, `integration`, `evaluation` — citing them breaks
  `check:textbook`.
- **What is assessed:** completing equal writings (« 18/32 = …/16 », « 3/8 = 24/… ») — the missing term found by the SAME factor on both
  terms; recognising equal fractions among a list (and the odd one out, ex-18); writing a decimal as a (decimal) fraction and as a simplest
  fraction (0,8 = 8/10 = 4/5; ex-20) and a fraction as a decimal fraction then a decimal when possible (7/4 = 175/100 = 1,75 ; 3/5 = 0,6 ;
  2/3 has none — its multiples never reach a denominator 10, 100, 1000); a quotient of two decimals as a fraction of naturals (×10, ex-23,
  `1am-s3-43` ②); reducing step by step with the divisibility rules to the simplest form (ex-21, 22, 25; method 45/567), with the table
  facts for 7, 11, 13 when the last step needs them; the « لماذا » questions (414/391 = 18/17 by 23; 91 = 7 × 13 — a number with no divisor
  among 2, 3, 4, 5, 9 may still be reducible). `answerType`: `rational` for a missing term or a reduced fraction (a NON-reduced equal fraction
  must be refused when the statement says « أبسط شكل ممكن » — say which in the statement), `choice` (every distractor FALSE and tagged),
  `selfCheck` for « برّر ».
- Misconception ids `MISC-KASRIYA-*`: adding the same number to both terms (3/5 → 4/6), multiplying or dividing only one term, reducing by a
  divisor of one term only (27/45 ÷ 5), stopping before the simplest form, « no rule applies ⇒ irreducible » (91, 391), the decimal comma
  misplaced in a decimal fraction (235017/1000 → 2350,17), a fraction read as its digits (3/5 = 3,5).
- Oracle `scripts/practice-oracle/ikhtizal-kitaba-kasriya.mjs` recomputes every key with its own exact fractions (cross-multiplication and
  gcd, never a divisibility rule), including the « simplest form » keys.
- Gates you run: `node scripts/validate-exercises.mjs --strict`, the oracle test, `node scripts/check-textbook-coverage.mjs`,
  `npm run test:scripts`. Do NOT run `npm run build`.

---

# Lesson `hasil-qisma-kasr` « حاصل القسمة والكسر » — authors' brief (2026-10-15, batch 3, queue entry 1)

The unit is already seeded (`kitabat-kasriya/_unit/`, this extraction). The lead writes the lesson folder
(`apps/web/src/lessons/moyen/1am/ansab_al_aadad_wal_hisab/kitabat-kasriya/hasil-qisma-kasr/`) and a NEW lab `fair-share`
(`operations/FairShare.jsx`, MANIPULATION_CONTRACT § next free number). The Bank author owns ONLY
`content/practice/1am/hasil-qisma-kasr/**`, the lesson's entries in `content/practice/{active,exam-style,policy,misconceptions}.json`,
`scripts/practice-oracle/hasil-qisma-kasr.mjs` and its import in `scripts/practice-answer-oracle.test.mjs`; never the lesson folder, the lab,
the extraction or the catalogue.

**The lesson in one paragraph.** « الكسر $\frac{a}{b}$ هو حاصل قسمة $a$ على $b$ » (textbook نشاط 1 p. 53 « تقسيم رغيف تقليدي » — 5 loaves among 6
people —, معارف 1 p. 55, exercises 1–5 p. 57, أقوّم 1, 2, 3, 9 p. 59, أتعمّق 2 p. 60). Programme item `1am.m5.r01`. The idea the student
DISCOVERS in the lab (the hand holds the SHARE of one person; the lab compares b shares with the a loaves): the number x such that
b × x = a exists for EVERY a and b ≠ 0 — it is written a/b (a pieces of 1/b of a loaf) — and it is a DECIMAL number only sometimes
(3 ÷ 4 = 0,75 lands, 2 ÷ 3 / 5 ÷ 6 / 7 ÷ 3 never do: 2,33 is only an approximate value, 7/3 is the exact one).

Final الكفاءات (ids positional, `1am_hasil-qisma-kasr_P<n>`; each primary on ≥ 8 questions):

1. **P1** التعرّف على الكسر $\frac{a}{b}$ كحاصل قسمة $a$ على $b$ ($b\neq0$)، وكتابة حاصل قسمة عددين طبيعيين على شكل كسر
2. **P2** توظيف النتيجة $\frac{a}{b}\times b=a$ لإيجاد عدد ناقص في مساواة من الشكل $b\times\ldots=a$
3. **P3** التمييز بين حاصل قسمة عدد عشري وحاصل قسمة غير عشري (مثل $\frac{7}{3}$) وإعطاء قيمة مقرّبة له

**Boundaries (the net's no-duplication rule — each belongs to ANOTHER lesson of the unit, never a primary LP here, at most a step
`counted: false`):** reducing a fraction / equal writings (`ikhtizal-kitaba-kasriya`, published), placing a quotient on a graduated half-line
(`hasil-qisma-mustaqim`), taking a fraction of a number or an amount (`akhdh-kasr-min-adad`), decimal division with rounding to the unit
(`qisma-ashriya-taqrib`, unit 3, not yet generated). Reading the fraction of a coloured figure with EQUAL parts (numerator = coloured
parts, denominator = all equal parts) IS this lesson (ex-1, ex-2: « 3 ÷ 4 ») — draw it as a `statement.figure` (GeoFigure `polygons` with a
tone for the coloured cells, `figureQuality` clean) or describe the grid in words.

**Textbook elements you may cite** (destination `hasil-qisma-kasr`, as `adapted` sheets, badge `null`): `act-1`, `know-1` (NOT its item
« 0,7 = 7/10 » → `ikhtizal-kitaba-kasriya`), `ex-1` … `ex-5`, `self-1` (the four test tubes — the lead REDESIGNS it with the
graduations 3/4, 2/5, 6/6, 5/8 of the tubes A, B, C, D), `self-2`, `self-3`, `self-9`, `deep-2`, `prep` (items 5, 6, 7 only), `opener`.
NOT any other element of the unit (citing one breaks `check:textbook`).

**Corpus** (`docs/sources/moyen/exams/exams-index.json`; read the PDFs under `docs/Exames-1 AM to 3AM/1am/`: `pdftotext -layout` then
NFKC, or `pdftoppm -r 110` — rendered pages of `1am-s3-37` p. 1 and `1am-s2-64` p. 1 are already in the lead's scratchpad
`/tmp/claude-1000/-home-abdennour-websites-smarter-academy-smarter-academy-dz/c83946f0-8d92-4bf2-bb25-f71d55b9166d/scratchpad/ex/` as
`s337-1.png`, `s264-1.png`). Exercises of THIS lesson, to model one by one (keep the structure and register, CHANGE numbers and context):
- `1am-s2-72` (TERM 2) ex 1 item 3 « حاصل قسمة العدد 20 على 3 هو عدد عشري : صحيح أو خطأ مع تصحيح الخطأ » (false — it is a fraction, 6,66… never ends)
  and ex 3 item 4 « اكتب العدد الناقص على شكل كسر : 3 × … = 5 ؛ 9 × … = 7 » (the figures of ex 3 — a graduated line — are NOT this lesson);
- `1am-s2-78` (TERM 2) ex 2 item 2 « انقل وأتمم : 17/3 × 3 = … ؛ …/… × 7 = 3 ؛ 28/2 × … = 28 » (the 4th fraction of the first blank is 17/3);
- `1am-s3-37` (TERM 3, badge « على منوال اختبار الفصل الثالث ») ex 2 item 1 « انقل وأتمم : 45 × …/… = 102 ؛ …/19 × 19 = 23 » (read `s337-1.png`: the
  unknown of the first is a blank fraction — its answer 102/45 is NOT in lowest terms and for this lesson stays as it comes, reduction is another
  lesson —, the second is 23/19);
- `1am-s2-64` (TERM 2) ex 1 item 3 « أكمل بما يناسب : 0.24 × … = 24 ؛ 15 ÷ … = 1500 » (decimal factor; answers 100 and 0,01; `counted: true`,
  P2-flavoured) and its ex 2 (decimal division 459 ÷ 8 and 126,7 ÷ 2 with the table of approximate values — usable ONLY for the vocabulary
  « قيمة مقرّبة بالنقصان / بالزيادة / مدوّر » of an exact quotient, `counted: false` otherwise);
- `1am-s2-65` ex 3 (NO text layer — render it at 110 dpi and read: sharing 7000 DA among three sons, true/false on a decimal division);
- NOT usable: `1am-s2-62` (a term-3 paper filed under s2; its fractions are « كسور من مربعات ملونة » — you MAY model that idea as a platform
  sheet), `1am-s3-44`, `1am-s3-45` (examType `remedial`), `1am-s1-100` (a 3AM paper).
About half of levels 3–5 modelled on ONE precise corpus exercise above (`metadata.source = {type:"term_exam", grade:"1am", semester, file,
exercise}`, kind `modelled`, badge « على منوال اختبار الفصل الثاني » — « الثالث » for `1am-s3-37`); the rest
`{type:"platform_addition", reason:"term_exam_modelled", modelledOn:"1am-s2"}` with the term-2 badge, a few `adapted` from the textbook
elements above.

**What is assessed:** writing a quotient as a fraction (5 ÷ 6 = 5/6, 7 ÷ 3 = 7/3, never 6/5, never 5,6) and the other way (« 9 ÷ 11 »: the
fraction among 13/9, 9/11, … that equals it); reading a coloured figure with equal parts; the missing factor (b × … = a → a/b; … × 8 = 13;
a/b × b = a, also with decimals 0,24 × … = 24); « نضرب الكسر في مقامه فنجد بسطه »; decided true/false « حاصل قسمة a على b عدد عشري » with
the correction (3 ÷ 4 = 0,75 yes — decimal division stops; 20 ÷ 3 no — it never stops) and a decimal writing when it exists (3/4 = 0,75, 9/2 =
4,5 — by ×25 / ×5 or by the division); an approximate value of a non-decimal quotient to 0,1 or 0,01 (BY DEFECT / BY EXCESS — 7/3: 2,3 and
2,4; 2,33 and 2,34) and the sentence « 7/3 هي القيمة المضبوطة و 2,33 قيمة مقرّبة ». Vocabulary: البسط، المقام، كسر، حاصل قسمة.
New misconception ids `MISC-HASIL-*` (e.g. the quotient written upside down 6/5, the comma for the bar 5,6, « every quotient is decimal »,
the figure's coloured parts counted over UNEQUAL parts, the missing factor found by subtraction (3 × … = 7 → 4) or taken as a product (21),
the denominator zero).
Everything else as `docs/sources/1am/unit2/brief-authors.md` « Bank author » (50 sheets = 10 per level, ids `ex-1am-hasil-qisma-kasr-l<N>-<NNN>`,
levels per EXAM_PATTERN §6, oracle recomputing every constructed answer with exact BigInt fractions — copy the helper idiom of
`scripts/practice-oracle/ikhtizal-kitaba-kasriya.mjs`, the previous 1AM unit-4 bank —, hints that never give the answer, explicit keys,
every distractor FALSE, values woven into story contexts, « دج » in Arabic text). Gates you run: `node scripts/validate-exercises.mjs
--strict`, the oracle test (`npx vitest run scripts/practice-answer-oracle.test.mjs` from the repo root), `node scripts/check-textbook-coverage.mjs`
(the lesson folder does not exist yet: its destination is « pending » — expected). Do NOT run `npm run build` or the PHP suite. Report:
files, counts per level and per LP, the corpus exercises used (file + exercise), test results.
