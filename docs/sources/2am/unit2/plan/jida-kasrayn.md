# Plan — `jida-kasrayn` « جداء كسرين » (2AM unit 2, entry 3 of 5)

Read the unit [`README.md`](README.md) first. `kasr-hasil-qisma` and `jam-tarh-kusur` are published before this lesson.

## 1. Identity

- **Code** `jida-kasrayn` · **title** « جداء كسرين » · unit `kusur-amaliyat` · catalogue order 8 · `lesson`.
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/kusur-amaliyat/jida-kasrayn/`.
- **Textbook pages** (PDF = book − 3): act-5 p. 25 (PDF 22; a 13 cm × 5 cm cake cut 7 × 3); know-2c p. 28 (PDF 25); method-4 p. 29
  (PDF 26); ex-15…ex-19, ex-26 p. 31–32, ex-27, ex-28, ex-30, ex-34 p. 32; self-7, self-8 p. 33 (+ `self-12` re-routed here);
  deep-39, deep-41…deep-45 pp. 34–35. Catalogue `textbookRef` (activity 25, knowledge 28, method 29) is right.
- `durationMinutes` ≈ 85; `difficulty` « متوسط »; icon 🪟.

## 2. Programme & net

**Item:** `2am.m1.r07` « ضرب كسرين ».

| LP | Draft (verbatim) | Final | Change and reason |
|---|---|---|---|
| P1 | حساب جداء كسرين بضرب البسطين فيما بينهما والمقامين فيما بينهما: $\frac{a}{b} \times \frac{c}{d} = \frac{a \times c}{b \times d}$ | حساب جداء كسرين بضرب البسطين فيما بينهما والمقامين فيما بينهما: $\frac{a}{b}\times\frac{c}{d}=\frac{a\times c}{b\times d}$ ، وتفسيره بمساحة مستطيل بُعداه $\frac ab$ و $\frac cd$ ، ثمّ اختزال الناتج | Adds the AREA meaning (book act-5) and reducing (1AM `ikhtizal` P3, recalled). |
| P2 | حساب جداء عدد (طبيعي أو عشري) في كسر | حساب جداء عدد (طبيعي أو عشري) في كسر: $n\times\frac ab=\frac{n\times a}{b}$ ، مثل $4\times\frac3{11}=\frac{12}{11}$ و $\frac57\times2{,}8=\frac{14}{7}=2$ | Example and the formula added; meaning kept. |
| P3 | أخذ كسر من عدد، مثل $\frac{2}{7}$ من 35، بالضرب | ترجمة «كسر من كمية» و«كسر من كسر» بجداء، مثل $\frac38$ من $48$ هو $48\times\frac38=18$ و $\frac34$ من $\frac25$ هو $\frac{3}{10}$ ، وتوظيفها في وضعيات «كسر من الباقي» | **Meaning extended.** « a/b of a NUMBER » is the planned 1AM `akhdh-kasr-min-adad` P1 (README Q6): recalled. 2AM adds « a fraction OF A FRACTION » (book ex-28, ex-34, deep-39) — the product's meaning that act-5 shows. Example replaced (2/7 of 35 is the book's method-4). |

**Review items for « أستعدّ »:**

| Item | Text | Home | Status | Measured by |
|---|---|---|---|---|
| `1am.m5.r03` | جمع وطرح وضرب كسور عشرية | `kusur-ashriya-kitaba` (1AM) | published → link | items 1, 2 |

Extra `priorKnowledge`: `kasr-hasil-qisma-1am` (b × a/b = a, published), `misahat-mustatil` (area of a rectangle), `akhdh-kasr-1am`
(planned 1AM `akhdh-kasr-min-adad`: « تذكّر » text only), `jam-tarh-kusur-2am` (« what remains », published entry 2).

**noRebuild:** `2am.m1.r07` extends `1am.m5.r03`, added value « ضرب كسرين كيفيين، لا الكسور العشرية فقط ». → M2 opens with a
« تذكّر — السنة الأولى » (0,3 × 0,7 = 21/100: tenths × tenths = hundredths) WITH a link; the lesson builds any b, d.

**pointPrerequisites:**
- intra: P2 ← P1, P3 ← P1, P3 ← P2;
- 1AM along `1am.m5.r03 → 2am.m1.r07` (extends): **P2 ← `1am_kusur-ashriya-kitaba_P2`** (a decimal written as a decimal fraction:
  2,8 = 28/10, needed for « decimal × fraction »). No other: the 1AM LPs teach no product of fractions;
- same unit: `jam-tarh-kusur` has no net link to r07 → no edge (M5–M6 use « 1 − … », recalled).

**Where it is used next:** 3AM `maqlub-qismat-kasrayn` (requires r07 → 3am.m1.r03: the reciprocal, division by a fraction), the
synthesis, 2AM proportionality (`rabi-mutanasib`… fraction of a quantity), 2AM areas and volumes (prism, cylinder at 1/3 full: corpus
`2am-s3-24`, `-25`), 3AM `amaliyat-natiqa`.

## 3. Boundary

**Owns:** see README. **Leaves:** the reciprocal and ÷ a fraction (3AM `maqlub`); cancelling before multiplying as a RULE (3AM `maqlub` P3
— a طريقة comment may show « $\frac{3}{8}\times48=3\times6$ » as « divide first », the book's method-4 comment does the same); signed
fractions; percentages (2AM `nisba-miawiya` later); a sum of unrelated fractions inside a « remainder » story (book ex-28 q 2 — adapted).

## 4. Textbook analysis (reference, not script)

| Element | What it asks | Idea kept | Platform use |
|---|---|---|---|
| `act-5` | a 13 cm × 5 cm cake cut 7 × 3; one piece 13/7 × 5/3; area two ways; the rule | area of a cell = product of the sides | **Not the entry** (the cut is given, the student does nothing). M4 item 1 (own: a 11 cm × 4 cm tablet cut 5 × 3 → 11/5 × 4/3 = 44/15 cm²) |
| `know-2c` | rule + 5/7 × 11/3, 3 × 2/5, 5/7 × 2,6 | the three cases | M2 (own examples) |
| `method-4` | 35 × 2/7 two orders | « من » = × | M3 step 1 (own: 3/8 of 48) |
| `ex-15`…`ex-18` | products, simplest form | practice | M4 item 2 + bank |
| `ex-19` | the intruder among four triple products | three factors | M4 item 3 (own) |
| `ex-26` | box volume 14/3 × 12/7 × 5/2 | three factors | M4 item 4 (own 7/2 × 4/3 × 3/7 = 2) |
| `ex-27` | rectangle 121 m, width 7/11 of it | fraction of a length | M4 item 5 (own: 90 m, 4/9 → 40 m) |
| `ex-28` | 1/3 sold, 3/5 of the rest, … (q 2 **scope**) | fraction of the remainder | M5 (own: 1/4 then 2/3 of the rest — every sum a 2AM case) |
| `ex-30` | three partners, 675 000 DA (« فوائد »!) | shares of an amount | bank L5 (adapted: « أرباح »; own numbers) |
| `ex-34` | ¼ of the tank, then half of the rest | of the remainder | M6 (own) |
| `self-7`, `self-8`, `self-12` | QCM products; « نصف 10/11 » | multiChoice | test register + bank |
| `deep-39` | 2/3 sold, 7/9 of the rest | of the remainder | bank L3 (adapted) |
| `deep-41` | camel loses 3/10 of 700 kg | « what remains » × | bank L2 (own: a lorry 1200 kg loses 3/8 → 750 kg) |
| `deep-42` | theatre 400 seats × 4/9 (**not whole**: reading to check, README) | — | bank (only if the scan reads 450) |
| `deep-43`…`deep-45` | class results, basketball points, passengers | fraction of a number | bank L2–L3 (own) |

## 5. Design

**The lesson in one paragraph.** Before the slide show, the teacher wants the darkest corner of the classroom window. The side curtain
can be drawn over part of the WIDTH; the roller blind can be lowered over part of the HEIGHT. Only the glass covered by BOTH is really
dark. Lina draws the curtain over 2/3 of the width and lowers the blind to 3/4 of the height. What part of the window is in double shade?
The shadows cut the glass into 3 × 4 = 12 equal panes; the double shade covers 2 × 3 = 6 of them: **2/3 × 3/4 = 6/12 = 1/2** — « 3/4 of
2/3 of the window ». Adding (2/3 + 3/4 = 17/12) is impossible: more than the whole window. In the advanced level the library's glass wall
has several windows (one window = 1): a curtain over 3/2 windows and a blind over 2/3 of the height hide exactly 1 window.

**Entry point — candidates compared:**
- (a) **The book's act-5** (a cake already cut 7 × 3): the cut is GIVEN; nothing for the hand. Rejected → M4.
- (b) **Folding paper** (fold 2/3 then 3/4): 4AM `square-fold` folds; folds are hard to read at 1/5.
- (c) **A garden plot planted on a part of a part**: a planting world is 3AM `seed-rake`'s; exam papers already use land.
- (d) **Two perpendicular covers on one window** (a side curtain and a roller blind): each factor is ONE physical pull, the product is the
  OVERLAP, and the grid b × d appears from the shadows themselves. **Chosen.**
  `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'classwindow' }`.

**Order of ideas:** two pulls → the double shade named as a fraction of the window (count panes) → the rule (numerators × numerators,
denominators × denominators) → « of » = × (3/4 of 2/3) → a natural × a fraction (a curtain over 2 whole windows) → fractions > 1 (glass
wall) → معارف → طريقة (of a quantity, of a fraction, decimal × fraction) → practice, مسائل (of the remainder), test.

**Contexts (values):** the classroom (care for the shared space), the orange harvest (a cooperative), the family car trip (planning), the
school garden of roses (beauty, effort).

## 6. Lab — `window-blinds` « ستائر النافذة » (new type)

**Drawn world `classwindow`** (new theme, kind `areas`, label « نافذة القسم: ستارة جانبية وستارة دوّارة وظلّ مزدوج »):
- the inside of a classroom: a large window (white aluminium frame) with the sunny schoolyard and a palm tree outside; at متقدم the
  school library's glass wall (2 × 2 windows, one window = 1);
- a side curtain on a rail with ring stops: the rail has b equal stops (b given by the task: 2…8); its fabric casts a light shadow on the
  glass;
- a roller blind with a pull bar; its cord has d notches (2…8); its shadow is light too;
- where both overlap the glass turns dark (two shadows multiply: drawn as two semi-transparent layers, the overlap visibly darker); a
  projector screen hangs in that corner when it is dark enough;
- faint guide lines appear ONLY after both pulls: b vertical and d horizontal lines (the panes the shadows create), never before;
- KidFigure Lina (girl, hijab + tunic) at the curtain cord at مبتدئ; Anis (boy, hoodie) at متقدم; the teacher is never drawn.

**The variables in the hand: the curtain's fraction a/b of the width and the blind's fraction c/d of the height** (two integers a ∈ 0…b·W,
c ∈ 0…d·H, W × H windows).

**Gestures (three paths):** drag the curtain's edge horizontally (snaps to the rail stops); drag the blind's bar down (snaps to the
cord notches); −/+ steppers for each; keyboard (←/→ curtain, ↑/↓ blind); « ماذا أُظلم؟ » (Enter) asks the question.

**The question and its judge:** « ما الكسر الذي يمثّل الجزء المظلم مرّتين من النافذة؟ » — typed fraction; accepted: any writing equal to
a·c/(b·d); refused models: `sum` (a/b + c/d), `sameDen` ((a·c)/(b + d)), `cross` ((a·d)/(b·c)), `oneFactor` (a/b alone), `count` (a·c
without the denominator). A refused value is DRAWN: a dashed frame of that area on the glass next to the real dark patch (17/12 overflows
the window frame; 6/7 is visibly larger than the patch).

**Opening (no title):**
- Context: « تريد المعلّمة ركنًا مظلمًا لعرض الصور: الستارة الجانبية تغطّي جزءًا من عرض النافذة، والستارة الدوّارة جزءًا من ارتفاعها. »
- Question: « اسحب الستارة إلى $\frac23$ العرض وأنزل الدوّارة إلى $\frac34$ الارتفاع، ثم اكتب الجزء المظلم مرّتين من النافذة. »
- `lead`: « الجزء المظلم مرّتين هو ما تغطّيه الستارتان معًا. »

**Levels** (same `objective` on both):

*مبتدئ* (one window; the stops and notches labelled):

| id | Curtain × blind | Grid | Dark panes | End state |
|---|---|---|---|---|
| `w1` | 2/3 × 3/4 | 3 × 4 | 6 | **6/12 = 1/2** |
| `w2` | 1/2 × 3/5 | 2 × 5 | 3 | **3/10** |
| `w3` | 4/5 × 2/3 | 5 × 3 | 8 | **8/15** |

*متقدم* (the glass wall; PREDICT: both cords are locked until the student types the product; then the pulls check; no guide lines before):

| id | Factors | Windows | End state |
|---|---|---|---|
| `a1` | 3/2 × 2/3 | 2 wide × 1 tall | **6/6 = 1** window |
| `a2` | 5/4 × 3/5 | 2 × 1 | **15/20 = 3/4** |
| `a3` | 7/4 × 4/3 | 2 × 2 | **28/12 = 7/3** |
| `a4` | 2 × 3/5 (the curtain over 2 whole windows) | 2 × 1 | **6/5** (P2) |

**« جرّب أعدادك » (always open):** b, d ∈ 2…8, a ≤ b·W, c ≤ d·H; a free « توقّعي » drawn as a dashed frame; never counted.

**LabCoach** (`sa.labCoach.window-blinds.off`): 1 `curtain` « اسحب طرف الستارة على السكّة » · 2 `blind` « أنزل الستارة الدوّارة من
حبلها » · 3 `ask` « اكتب الجزء المظلم مرّتين » · 4 `lines` (first time the guide lines appear) « عُدّ المربّعات الصغيرة التي صنعها
الظلّان » · 5 `predict` (متقدم) · 6 `free`.

**Lab prototype (§6ter):** chains from the student's run:
- w1: « كم مربّعًا صغيرًا في النافذة؟ » (12 = 3 × 4) → « كم منها مظلم مرّتين؟ » (6 = 2 × 3) → « اكتب الكسر » (6/12);
- w2: « من أين جاء المقام 10؟ » (2 × 5) → « والبسط 3؟ » (1 × 3);
- w3 (ends on the RULE): « نضرب البسطين ونضرب المقامين ».
- a1–a4: « لماذا يمكن أن يكون الناتج أكبر من نافذة؟ » ; a4: « الستارة تغطّي نافذتين كاملتين: $2\times\frac35$ ».
`LabStepper`, `useStepCelebration`, « إعادة », `playSfx` (`gesture` per stop, `flag` on a right product, `over` on a refused one), full
screen, `guided={!!chain}`, render test over every task.

**Wrong moves made VISIBLE:** `sum` (17/12 frame overflows the window), `sameDen` (6/7 frame larger than the patch), `cross` (8/9 frame),
`oneFactor` (the curtain's 2/3 frame = the whole curtain strip, not the dark corner), `count` (6 « windows » = a frame six times too big).

**Formal phase:** $\frac23\times\frac34=\frac{2\times3}{3\times4}=\frac6{12}=\frac12$ ; « $\frac34$ من $\frac23$ النافذة » ; at متقدم $\frac74\times\frac43=\frac{28}{12}=\frac73$.

**Core maths:** `fractions2.js` E3 row (`productGrid`, `timesNumber`, `fractionOf`, `ofRemainder`). Lab logic `logic/windowBlinds.js`:
`tasksOf`, `pull(state, 'curtain' | 'blind', stops)`, `grid(state)`, `judge(state, text)` → `{ ok, model, frame }`, `coachOf`; events
`{ kind: 'pull', task, which, value }`, `{ kind: 'product', task, value, ok, model }`, `{ kind: 'predict', task, value, ok }`,
`{ kind: 'solved', task }`, `{ kind: 'custom', free: true }`.

**Why not another lab (DNA §12):**
- 4AM `area-split` / `turf-factoring` / `pitch-expansion`: the hand cuts or extends a rectangle with algebraic lengths (distributivity,
  factoring); here two fractional covers OVERLAP and the product is the overlap — no cut line, no sum of areas.
- 1AM `tile-yard` carries one unit tile to measure an area; nothing is carried here.
- 3AM `gear-crank` multiplies turns through gears (the reciprocal); 1AM `fraction-knife` cuts one share.
- Two orthogonal pulls are a gesture no shipped lab uses.

**Screen budget:** 1024×768: the window scene ≈ 460 × 300 px (glass wall at متقدم: four windows in the same box), steppers in ONE row,
the answer pill inside the scene's top band. Rail stops ≥ 44 px apart at b ≤ 8 on one window (glass 360 px); at متقدم the curtain stops
use the whole wall width.

**DOM:** `[data-window-blinds][data-level][data-task][data-a][data-c][data-solved]`, `[data-wb-curtain]` (slider), `[data-wb-blind]`
(slider), `[data-wb-pane=<i>-<j>][data-dark]`, `[data-wb-answer]`, `[data-wb-frame][data-model]`, `[data-wb-free]`, `[data-wb-formal]`.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق من ضرب الكسور العشرية ومن معنى الكسر ومساحة المستطيل »:

| # | Statement | Key | Item |
|---|---|---|---|
| 1 | $\frac{3}{10}\times\frac{2}{10}=\frac{6}{100}$ | ✓ | `1am.m5.r03` |
| 2 | $4\times0{,}25=0{,}1$ | ✗ (1) | `1am.m5.r03` |
| 3 | $7\times\frac37=3$ | ✓ | `hasil-qisma-kasr` |
| 4 | مساحة مستطيل طوله $3$ cm وعرضه $2{,}5$ cm هي $7{,}5$ cm² | ✓ | area |
| 5 | « $\frac34$ من $20$ تلميذًا هو $15$ تلميذًا » | ✓ | `akhdh-kasr-min-adad` (planned) |
| 6 | $1-\frac38=\frac58$ | ✓ | `jam-tarh-kusur` (published) |

**M1 نشاط — « ستائر النافذة »** — `objectives`: « أكتشف أنّ الجزء من الجزء جداءٌ، وكيف أحسبه ». Lab on top; then the trace and the
bricks: `juz-min-juz` « $\frac34$ من $\frac23$ » (w1) · « أتوقّع القاعدة » then `qaidat-jida` (w3) · `jida-akbar-min-wahid` (a3) ·
`adad-fi-kasr` (a4).

**M2 معارف** — `objectives`: « أسمّي قاعدة ضرب كسرين وضرب عدد في كسر ».
- Lab ALONE (`levels={false}`, 3/4 × 2/5) → 6/20 = **3/10**.
- Boxes: « تذكّر — السنة الأولى » (`kusur-ashriya-kitaba`, link: $0{,}3\times0{,}7=\frac3{10}\times\frac7{10}=\frac{21}{100}$) · « تذكّر —
  أخذ كسر من عدد » (planned 1AM, no link: « $\frac34$ من 20 = 15 ») · rule (platform words) · examples $\frac23\times\frac57=\frac{10}{21}$ ;
  $4\times\frac3{11}=\frac{12}{11}$ ; $\frac29\times\frac34=\frac6{36}=\frac16$ (reduce).

**M3 طريقة** — `objectives`: « أترجم «من» إلى ضرب وأحسب جداءً بعدد عشري ». Steps:
1. $\frac38$ من $48$: $48\times\frac38=\frac{144}{8}=18$, or $48\div8\times3=18$ (Q « أيّ طريقة أسهل هنا؟ »);
2. $\frac23$ من $\frac38$: $\frac{6}{24}=\frac14$;
3. $\frac57\times2{,}8=\frac{5\times2{,}8}{7}=\frac{14}{7}=2$.

Method box: « كلمة «من» بعد كسر تعني الضرب: $\frac ab$ من $x$ هو $\frac ab\times x$ ».

**M4 أتمرّن** — `objectives`: « أتدرّب على ضرب الكسور وعلى الكسر من كمية »:

| # | Statement (own numbers) | Answers | cites |
|---|---|---|---|
| 1 | لوح حلوى $11$ cm × $4$ cm مقسّم إلى $5\times3$ قطع متماثلة: بُعدا قطعة؟ مساحتها بطريقتين | $\frac{11}5$ cm ، $\frac43$ cm ; $\frac{44}{15}$ cm² (= 44 ÷ 15) | `act-5` |
| 2 | احسب واختزل: $\frac37\times\frac52$ ، $\frac{9}{4}\times\frac{2}{3}$ ، $\frac16\times\frac{30}{7}$ ، $\frac{7}{10}\times\frac{15}{14}$ | $\frac{15}{14}$ ; $\frac32$ ; $\frac57$ ; $\frac34$ | `ex-15`…`ex-18` |
| 3 | العدد الدخيل: $\frac32\times\frac49\times3$ ، $\frac14\times\frac{8}{3}\times3$ ، $\frac56\times\frac{12}{5}$ ، $\frac25\times\frac{5}{4}\times\frac{3}{1}$ | 2 ; 2 ; 2 ; $\frac32$ → the last | `ex-19` |
| 4 | حجم علبة: $\frac72\times\frac43\times\frac37$ | $2$ | `ex-26` |
| 5 | حقل طوله $90$ m وعرضه $\frac49$ طوله: العرض، المحيط، المساحة | $40$ m ; $260$ m ; $3600$ m² | `ex-27` |
| 6 | « نصف $\frac{10}{11}$ » ، « ضعف $\frac5{22}$ » ، « ثلث $\frac9{14}$ » | $\frac5{11}$ ; $\frac5{11}$ ; $\frac3{14}$ | `self-12` |

**M5 مسألة 1 (`lessonProblem`) — « تعاونية البرتقال »** — `objectives`: « أحسب كسرًا من الباقي ».
- Statement: « باعت تعاونية $\frac14$ من غلّتها من البرتقال، ثم باعت $\frac23$ مما بقي. غلّتها $2400$ kg. »
- Q/A: 1) الباقي بعد البيع الأوّل → $\frac34$ ; 2) البيع الثاني كسرًا من الغلّة → $\frac23\times\frac34=\frac12$ ; 3) ما بيع كلّه → $\frac14+\frac12=\frac34$ ;
  4) ما بقي بالكيلوغرام → $\frac14\times2400=600$ kg.

**M6 مسألة 2 — « رحلة العائلة »** — `objectives`: « أتتبّع استهلاك خزّان على مرحلتين ».
- Statement: « استهلكت السيارة $\frac13$ من بنزين الخزّان في المرحلة الأولى، ثم نصف ما بقي في المرحلة الثانية. سعة الخزّان $45$ L. »
- Q/A: 1) المرحلة الثانية كسرًا من الخزّان → $\frac12\times\frac23=\frac13$ ; 2) المستهلك → $\frac23$ ; 3) الباقي باللتر → $15$ L.

**M7 مسألة 3 — « ورود الحديقة »** — `objectives`: « أحسب مساحة جزء من جزء بطريقتين ».
- Statement: « حديقة المدرسة مستطيلة: $18$ m × $12$ m. زُرعت ورود في مستطيل طوله $\frac23$ طول الحديقة وعرضه $\frac34$ عرضها. »
- Q/A: 1) الكسر الذي تمثّله الورود → $\frac23\times\frac34=\frac12$ ; 2) مساحتها بطريقتين → $\frac12\times216=108$ m² and $12\times9=108$ m².

**M8 إختبار أولي:**

| # | Prompt | Key | Distractors | LP |
|---|---|---|---|---|
| 1 | $\frac25\times\frac37$ | $\frac6{35}$ | $\frac5{12}$ (SUMACROSS) · $\frac6{12}$ (DENSUM) · $\frac{14}{15}$ (CROSS) | P1 |
| 2 | $4\times\frac29$ | $\frac89$ | $\frac8{36}$ (BOTHMUL) · $\frac69$ · $\frac2{36}$ | P2 |
| 3 | $\frac34$ من $60$ | $45$ | $80$ (FLIP) · $15$ (HALFWAY: ÷4 only) · $57$ | P3 |
| 4 | $\frac23\times\frac9{10}$ | $\frac35$ | $\frac{11}{13}$ (SUMACROSS) · $\frac{20}{27}$ (CROSS) · $\frac{18}{10}$ | P1 |
| 5 | « أنفق $\frac13$ من مبلغ، ثم نصف الباقي. ما الكسر الذي أنفقه في المرّة الثانية؟ » | $\frac13$ | $\frac12$ (OFWHOLE) · $\frac16$ (OFSPENT: ½ × ⅓) · $\frac56$ | P3 |

## 8. Misconceptions (`MISC-JIDAKASR-*`)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `SUMACROSS` | the product computed as the « across » sum | 17/12 frame overflows | tests 1, 4 |
| `DENSUM` | numerators multiplied, denominators added | 6/7 frame | test 1 |
| `CROSS` | a × d over b × c | 8/9 frame | tests 1, 4 |
| `BOTHMUL` | n × a/b = na/nb | a4's two windows | test 2 |
| `FLIP` | a/b of x = x × b/a | — | test 3 |
| `HALFWAY` | a/b of x = x ÷ b | — | test 3 |
| `OFWHOLE` | a fraction of the remainder taken of the whole | M5–M6 | test 5; L5 |
| `OFSPENT` | of the remainder taken of the spent part | — | test 5 |

## 9. Practice bank (`content/practice/2am/jida-kasrayn/`, 5 × 10)

**Read by the planner:** `2am-s1-68` ex 2 C ($\frac94\times\frac25+\frac1{10}=\frac9{10}+\frac1{10}=1$ — the sum step `counted: false`) and the
situation q 2 (a share of an amount; the amount reads « 10111 دج » on the text layer: read the scan); `2am-s1-75` ex 3 N
($\frac{10}6+\frac83\times\frac52=\frac53+\frac{20}3=\frac{25}3$) and K ($(\frac3{10}+\frac72)\times\frac13=\frac{38}{10}\times\frac13=\frac{19}{15}$);
`2am-s1-91` problem q 3 (780 000 DA × 5/12, × 2/4, × the rest → 325 000, 390 000, 65 000); `2am-s1-87` situation q 4 (a fraction of
800 m × 600 m). **To read:** `-83` ex 2, `-84` ex 2, `-67` ex 2, `-81` ex 2, `-66` ex 2, `-73` ex 1, `-70` ex 4, `-69` ex 5, `-88` ex 5,
`-73` ex 5, `2am-s2-53` ex 5, `2am-s3-24` ex 4 / `-25` ex 2 (a fraction of a volume — term 3 badge), misfiled `3am-s1-112` ex 4 / ex 8,
`2am-2AM` ex 21 (commercial book: NOT a term exam → `adapted` only if used at all).

**Honest FAITHFUL count: 4–5 read today; 8–10 expected.**

| Level | Content | Provenance |
|---|---|---|
| L1 | products of two fractions, n × a/b, reduce | 2 term_exam (`-68` ex 2 C product step, `-75` ex 3 N product step) · 6 modelled · 2 adapted (`ex-15`, `self-7`) |
| L2 | a fraction of a quantity (amount, length, mass) + « برّر » | 1 term_exam (`-91` q 3) · 7 modelled · 2 adapted (`deep-41`, `deep-43`) |
| L3 | full exercise: products, three factors, an intruder, an area/volume with fractional sides | 1–2 term_exam (`-75` ex 3 K, `-83` ex 2 after reading) · 6 modelled · 2 adapted (`ex-19`, `deep-39`) |
| L4 | mobilises `jam-tarh-kusur` / `kasr-hasil-qisma` (same term): sum then product, a product then its approximate value; those steps `counted: false` | 1 term_exam (`-84` ex 2) · 9 modelled |
| L5 | « الوضعية الإدماجية »: of the remainder, amounts, a decision (enough? who has most?) | 2–3 term_exam (`-87` situation q 4, `-88` ex 5, `3am-s1-112` ex 8) · 6 modelled · 1 adapted (`ex-30` with « أرباح ») |

**Oracle** `scripts/practice-oracle/jida-kasrayn.mjs` (BigInt; every « of the remainder » key recomputed from the statement's numbers;
each distractor checked against its named error and false).

## 10. Risks & owner questions

1. **P3's extension** (« a fraction of a fraction ») and its overlap with the planned 1AM `akhdh-kasr-min-adad` (README Q6).
2. **`deep-42`** (400 × 4/9) — read the scan; if it is 400, the element is cited only as « adapted » with 450 seats.
3. **Fractions > 1 in a window** (the glass wall at متقدم): one window = 1 must be said in the opening of each advanced task.
4. **`ex-30` « فوائد »** — the word is never shown (Islam-respect rule).

## 11. Generator checklist

- [ ] `build-extraction.py`: re-read PDF pp. 22, 25, 26, 28, 29, 30, 31, 32 at 200 dpi; `verified: True`; destinations: `act-5` → 4;
  `know-2c` → 2; `method-4` → 3; `ex-15`…`ex-19`, `ex-26`, `ex-27` → 4; `ex-28` → 5 (cited by M5), `ex-34` → 6; `self-12` (moved here)
  → 4; `ex-30`, `self-7`, `self-8`, `deep-39`, `deep-41`…`deep-45` → `None` (bank). Record `deep-42` and `ex-30` notes.
- [ ] `fractions2.js` E3 functions + tests.
- [ ] Lab `window-blinds` (type, theme `classwindow`, levels, registry, strings `windowBlinds`, logic + test (every task; `judge` models;
  the grid count = product for b, d ≤ 8 and W, H ≤ 2 exhaustively), render test, LabCoach, §6ter ✅, contract section, DNA row,
  screenshots: initial, curtain only, both pulled with the dark corner, the guide lines, a refused `sum` frame, the glass wall a3, a4 —
  four sizes, reviewed).
- [ ] Lesson: 9 modules, header, « تذكّر » (1AM with link; planned 1AM without), `content.test.js` (BigInt), memos.
- [ ] Catalogue, index, net, e2e `2am-kusur-amaliyat-jida-kasrayn.mjs`, gates, bank (`MISC-JIDAKASR-*`), publish, commit.

## 12. Successor connection

- **3AM `maqlub-qismat-kasrayn`** (published; net `2am.m1.r07 → 3am.m1.r03`, requires):
  - catalogue `pointPrerequisites`: **`3am_maqlub-qismat-kasrayn_P1` ← `2am_jida-kasrayn_P1`** (x × its reciprocal = 1 is a product of
    fractions) — today `P1` has no entry: create `"P1": ["2am_jida-kasrayn_P1"]`. The net item r03 is P1's; P3 (a/b ÷ c/d = a/b × d/c)
    is r04 — there is no net link `2am.m1.r07 → 3am.m1.r04`, so **no** edge on P3 (it reaches P1 through P2 ← P1 already);
  - `content/textbook.js › RECALL` already has `lesson: 'jida-kasrayn'` and `Module02Maarif.jsx` already computes
    `getLessonPath(RECALL.lesson)`: check that the `TextbookBox` renders `{base && <Link …>}` like `tasawi`'s (if it does not, add it);
    the text « … ولا نعيد بناءه » stays; its « أستعدّ » items (`jida-kasrayn-2am`) unchanged.
- **3AM `wadiya-idmajiya-kusur-natiqa`** (published synthesis): `requires: ['jida-kasrayn-2am']` in its problems stays; no LP edge (a
  synthesis has no item, no net link).
- **3AM `amaliyat-natiqa`**: products of rationals; no net link from r07 → nothing to write.

## 13. Generator notes (2026-10-29)

Fixes and deviations recorded while generating (nothing else was redesigned):

1. **`2am-s1-68` situation numbers.** The plan read the amount as « 10111 دج » from the text layer; the scan shows a phone at 7500 DA and a total of 15000 DA with shares 2/25, 3/5 and the rest (the text layer's « 0011 / 10111 » is garbled). No sheet uses the garbled numbers.
2. **Provenance.** 9 of 50 bank sheets are `term_exam` (only exercises actually read: `2am-s1-68` ex 2 C, `-75` ex 3 N and K, `-91`, `-87`, `-67`, `2am-s3-25` ex 2 …); 31 `term_exam_modelled`; 10 `adapted` (the plan listed 7: `self-8`, `deep-44`, `deep-45` were added because §11 sends them to the bank); 0 other `platform_addition`. `deep-42` is not used (400 × 4/9 is not whole; the scan was not re-read for 450). `ex-30` is adapted with « أرباح ».
3. **Lab events.** The plan's `{ kind: 'pull', task, which, value }` is emitted once per pull at each « ماذا أُظلم؟ » (two events: `curtain`, `blind`, each with `ok`), not on every drag step.
4. **a4 (`2 × 3/5`)** uses a rail with `b = 1` stop per window (the stops are the window edges; the curtain's value is `2/1`), so the lab accepts `b ≥ 1` while `d ≥ 2`.
5. **The answer pill** is a card under the pulls (as in `trail-odometer`), not inside the scene's top band; once both pulls are checked the pull row is hidden so the typing phase fits one screen at 1024 × 768.
6. **M1 chain `w1`** ends with « ما أبسط كتابة لـ 6/12؟ » (`half`) instead of a second « اكتب الكسر » (the lab itself already asks the student to type the fraction); `w2`'s two questions are choices (`den10`, `num3`); `a1`–`a4` carry one question each (`darkPanes`, `red15`, `whyBig`, `natural`), the plan's « لماذا يمكن أن يكون الناتج أكبر من نافذة؟ » is on a3 (the first task where the product exceeds 1 by a margin) and a1's product is exactly one window.
7. **Prep item 3** (`b × a/b = a`) links 1AM `hasil-qisma-kasr` (published) in M2's « تذكّر »; « كسر من عدد » (planned 1AM `akhdh-kasr-min-adad`) has no link.
8. **`2am_jida-kasrayn_P1/P2/P3` wording** and `pointPrerequisites` (P2 ← P1, `1am_kusur-ashriya-kitaba_P2`; P3 ← P1, P2) are as the plan §2; `durationMinutes` 66 (modules without the مسائل; with them 87 ≤ 90).
9. **`deep-42`** (400 × 4/9 is not whole) is cited by M4's seventh exercise `ex-7` with 450 seats (`450 × 4/9 = 200`, the plan's own « 450 » reading, not re-checked on the scan), so M4 has SEVEN exercises, not six; `ex-28` and `ex-34` are cited by the مسألة 1 and مسألة 2 `cites`.
