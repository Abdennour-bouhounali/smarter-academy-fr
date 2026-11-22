# Plan — `hall-mushkil-muadala` « حلّ مشكل باستعمال معادلة » (2AM unit 4, entry 2 of 4)

Read the unit [`README.md`](README.md) first. `ibara-harfiya-intaj` (entry 1) is published before this lesson; `ikhtibar-musawat-mutabayina`
is NOT (it is generated in pair 4) and this lesson never relies on it (README « renvois »).

## 1. Identity

- **Code** `hall-mushkil-muadala` · **title** « حلّ مشكل باستعمال معادلة » · unit `mafhum-muadala` · catalogue order 20 · `lesson`.
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/mafhum-muadala/hall-mushkil-muadala/`.
- **Textbook pages** (PDF = book − 3): act-4 p. 57 (PDF 54, lower half); know-5 p. 60 (PDF 57, bottom — cut); method-4, method-5,
  now-61 ② p. 61 (PDF 58); prep 6–9 p. 55; ex-34 … ex-40 p. 64 (PDF 61); self-11 p. 65; deep-53, deep-56, deep-59 p. 67. Catalogue
  `textbookRef` (activity 57, knowledge 60, method 61) is right.
- `durationMinutes` ≈ 85; `difficulty` « متوسط »; icon 🧃.
- Pair 2, lane B (port 5174); the other lane runs `jam-tarh-nisbiya` (unit 3).

## 2. Programme & net

**Item:** `2am.m4.r08` « حل المعادلات من الشكل: $a \div \ldots = b$ حيث $a$، $b$ عددان عشريان معلومان في وضعيات بسيطة ».

| LP | Draft (verbatim) | Final | Change and reason |
|---|---|---|---|
| P1 | ترجمة وضعية بمعادلة بعد تسمية المجهول بحرف | ترجمة وضعية بمعادلة بعد تسمية المجهول بحرف، مثل «$60$ قارورة متماثلة سعتها الكلّية $45$ لترًا»: $60\times x=45$ | Example added (meaning kept). |
| P2 | التعرّف على حلّ معادلة كقيمة تجعل المساواة صحيحة | التعرّف على حلّ معادلة: القيمة التي تجعل المساواة صحيحة، والتحقّق منها بإنجاز العملية، مثل $3$ حلّ للمعادلة $\frac{12}{x}=4$ لأنّ $12\div3=4$ | « verify by doing the ONE operation » (README renvois: never a two-member test). |
| P3 | حلّ معادلات من الشكل $a \times x = b$ و $\frac{x}{a} = b$ و $\frac{a}{x} = b$ حيث $a$ و $b$ عددان عشريان معلومان، مثل $\frac{489}{x} = 163$ | حلّ معادلات من الشكل $a\times x=b$ و $\frac xa=b$ و $\frac ax=b$ بالعملية العكسية، مثل $\frac{489}{x}=163$ ومنه $x=3$ ، ثمّ معادلة من خطوتين مثل $2x+240=300$ بإلغاء آخر عملية أوّلًا | The inverse operation named per form; the two-step case (README Q2, default yes). |

**Review items for « أستعدّ »:**

| Item | Text | Home | Status | Measured by |
|---|---|---|---|---|
| `1am.m5.r10` | إتمام مساواة من الشكل $a+\ldots=b$ ؛ $a-\ldots=b$ ؛ $a\times\ldots=b$ | `bahth-adad-naqisa` (1AM) | coming_soon → text only | items 1, 2 |

Extra `priorKnowledge`: `qisma-ala-ushri-2am` (a quotient by a decimal — `kasr-hasil-qisma`, published), `darb-qisma-ilaqa` (if 8 × 7 = 56
then 56 ÷ 7 = 8), `ibara-harfiya-2am` (entry 1, published), `akhir-amaliya-2am` (`wasf-silsila-hisab`, the last operation, published).

**noRebuild:** `2am.m4.r08` extends `1am.m5.r10`, added value « إتمام مساواة بالقسمة ($a\div\ldots=b$) بأعداد عشرية ». → M2 opens with a
« تذكّر — السنة الأولى » (no link: `bahth-adad-naqisa` is `coming_soon`): « $7+\ldots=12{,}5$ : $5{,}5$ ؛ $6\times\ldots=15$ : $2{,}5$ — نجد
العدد الناقص بالعملية العكسية »; the lesson builds the DIVISION forms with decimals, the letter, the word « حلّ » and the two-step case.

**pointPrerequisites:**
- intra: P2 ← P1, P3 ← P2;
- same unit, no net link (README Q4, default yes): **P1 ← `2am_ibara-harfiya-intaj_P1`** (an expression of the unknown before the
  equation);
- no 1AM edge (`bahth-adad-naqisa` is `coming_soon`, LEARNING_NET §4.8).
- `prerequisiteLessonCodes`: `['bahth-adad-naqisa']` → **`['bahth-adad-naqisa', 'ibara-harfiya-intaj']`** (README Q4).

**Where it is used next:** 3AM `muadalat-darajat-ula` (net `2am.m4.r08 → 3am.m5.r06`, `extends` « ax + b = cx + d »), the synthesis, the
2AM proportionality and geometry units (a dimension from an area or a volume: corpus `2am-s3-25` ex 2, `2am-s3-46` ex 4).

## 3. Boundary

**Owns:** see README. **Leaves:** testing an equality with two members (`ikhtibar` — this lesson computes ONE operation to check);
x on both sides (3AM `muadalat-darajat-ula`; the M3 translation « x + 150 = 2x + 60 » is translated, NOT solved, NOT tested); the same
operation on both members (3AM `musawiyat-amaliyat`); negative solutions in the modules (README Q10; the bank may use « x + 7 = 2 » in a
`counted: false` step once `jam-tarh-nisbiya` is published, same pair).

## 4. Textbook analysis (reference, not script)

| Element | What it asks | Idea kept | Platform use |
|---|---|---|---|
| `act-4` q1–q2 | 5760 eggs, 2 × 240 trays; match three equations (two correct) | one situation, SEVERAL right equations | **Not the entry** (a story to read; the egg world is 2AM `egg-trays`). M4 item 1 (own: dates in boxes) |
| `act-4` q3 | 1/3 × x = 21,7; x/250 = 1/5; 489/x = 163; 258,6/x = 21,55 | the three forms | M4 item 2 (own numbers) |
| `know-5` | values making A and B equal = solutions (cut) | the word « حلّ » | M2 (platform words) |
| `method-4` | Amine and Sylia's spending → x + 200 = 3x + 100 (discrepancy 1) | name the unknown, translate | M3 step 1 (own story; translation only) |
| `method-5` | 84/x = 14 → 14 × x = 84 → x = 6; check (discrepancy 2) | missing divisor → quotient | M3 step 2 (own: 63/x = 4,5) |
| `now-61` ② | 40/x = 16 | missing divisor | M4 item 3 (own: 30/x = 12 → 2,5) |
| `prep` 6–9 | AB from a figure: 9 − x, 12 − x, 6x, 7 + 2x | a length in x | M0 item 5 |
| `ex-34` | mental: + 16, 48 −, × 3, 144 ÷ ? | the 1AM forms | M0 items 1–2 (own) |
| `ex-37` … `ex-39` | □ with decimals, x/7 = 11, 21/x = 3, 169/x = 13 … 2530/x = 0,01 | practice | M4 items 2, 4 + bank |
| `ex-40` | Amine's 75 cm step, the giant's × 3, 15 m behind | a difference per step → a × x = b | M5 (own: Yacine and his robot) |
| `deep-56` | translate: temperature, ages, a 9 cm² rectangle of length 10 cm | translate then solve | M4 item 6 (the rectangle, own numbers) ; bank |
| `deep-53`, `deep-59`, `self-11`, `ex-35`, `ex-36` | spreadsheet 3x + 7 = 31; a sheet's perimeter 45 cm; 40,6/□ = 58 | practice | bank |

## 5. Design

**The lesson in one paragraph.** At the orange cooperative, a bottling line fills bottles from a tank. Today the tank holds 18 L and the
order is « exactly 12 full bottles, not a drop left ». The capacity of the bottle MOULD is the unknown x: the student stretches the mould
and runs a test fill — 1,4 L gives 12 bottles but 1,2 L stay in the tank; 1,6 L gives only 11 and a 12th one 0,4 L full. Each test costs
bottles: two tests, then the machine asks « اكتب العملية التي تعطي السعة ». The fill tells what the equation says: 12 bottles of x litres
make 18 L, **12 × x = 18**, or **18 ÷ x = 12** — x is a missing factor (a missing divisor): **x = 18 ÷ 12 = 1,5 L**. The checking fill
gives 12 full bottles and an empty tank: 1,5 is THE solution. In the advanced level the unknown moves into the tank (x ÷ 24 = 0,25 →
x = 24 × 0,25 = 6 L), and finally the tank already holds 4 L (« (4 + x) ÷ 0,25 = 40 »: undo the last operation first → 4 + x = 10 → 6).

**Entry point — candidates compared:**
- (a) **The book's act-4** (eggs in trays, three equations to match): a reading task, and the egg world is `egg-trays` (2AM unit 2).
  Rejected → M4 (dates).
- (b) **A balance** (the classic « 3 × x = 18 » on two pans): it is 4AM `equation-balance`; the hand there moves objects, not the unknown.
- (c) **A probe x on a number line** until « 12 = 12 » lights: 4AM `solution-ray`; trial without a reason to compute.
- (d) **A bottling line where x IS a physical setting** (mould capacity, tank content) with a SCARCE number of test fills: the fill's
  feedback (bottles, leftover) is the equation read in the world, and the scarcity makes the inverse operation necessary. **Chosen.**
  `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'juicery' }`.

**Order of ideas:** a test fill with a guess → what the fill says (b bottles of x make a) → the equation (two writings) → the inverse
operation → the checking fill = « حلّ » → the unknown in the tank (missing dividend: ×) → two steps (undo the last operation) → معارف
(equation, solution, the three forms) → طريقة (translate, a/x = b, x/a = b, a × x = b, two steps) → practice, مسائل, test.

**Contexts (values):** the orange cooperative (work, local produce of the Mitidja), dates of Biskra in boxes (farmers' work), Yacine and
his robot's steps (technology, play), a fenced plot (family land), an olive-oil cooperative (sharing a harvest).

## 6. Lab — `juice-line` « خطّ العصير » (new type)

**Drawn world `juicery`** (new theme, kind `quantities`, label « معصرة البرتقال التعاونية: خزّان وخطّ تعبئة »):
- the cooperative's workshop: crates of oranges, a press, a stainless TANK with a graduated window (litres, 0,5 L ticks, the content as
  an orange column), a conveyor with empty bottles, a filling nozzle;
- the bottle MOULD (a transparent template on the machine) whose height sets the capacity (label « $x$ L » hidden until the first test
  at مبتدئ: the student reads it on the mould's own scale, 0,05 L ticks);
- the fill: bottles fill one by one; when the tank is empty the line stops; a partly filled bottle is drawn with its level; juice left in
  the tank stays visible;
- a « تجارب » counter (two bottles-icons per task; a used test greys one); a slate « المعادلة » where the student's equation and operation
  are written;
- KidFigure Lina (girl, hijab + tunic) at the control panel at مبتدئ; Anis (boy, hoodie) at the tank at متقدم; the cooperative's
  workers are never drawn.

**The variable in the hand: x, the unknown** — the mould's capacity (0,05 … 2 L, step 0,05) at مبتدئ; the tank's content (0 … 30 L, step
0,5) at متقدم.

**Gestures (three paths):** drag the mould's top edge up / down (or the tank's level float); −/+ steppers; keyboard (↑/↓); « املأ »
(Enter) runs a test fill (counts down the tests); « اكتب العملية » opens the slate: the student types x or the operation (« 18 ÷ 12 »)
and the matching equation(s) by tapping cards.

**The question and its judge:** « ما سعة القارورة التي تملأ 12 قارورة تمامًا؟ » — accepted: x such that the form holds exactly
(`equation2.checkForm`); refused models, each DRAWN by a fill with that value: `mult` (a × b — a 216-L mould drawn overflowing the
frame), `flip` (b ÷ a = 0,666…, filled at the nearest tick 0,65 L — 27 small bottles and 0,45 L left), `sub` (a − b = 6), `add` (a + b). Equation cards (P1): two right
writings (12 × x = 18 and 18 ÷ x = 12) and two wrong (18 × x = 12, x ÷ 12 = 18); BOTH right cards must be chosen (the book's act-4 idea).

**Opening (no title):**
- Context: « طلبت التعاونية $12$ قارورة عصير مملوءة تمامًا من خزّان فيه $18$ لترًا، دون أن تبقى قطرة. »
- Question: « اضبط سعة القالب ثمّ املأ: لديك تجربتان فقط، وبعدهما اكتب العملية التي تعطي السعة الصحيحة. »
- `lead`: « كلّ تجربة فاشلة تُتلف قوارير: فكّر قبل أن تملأ. »

**Levels** (same `objective` on both):

*مبتدئ* (the mould is under the hand; two tests; the leftover always drawn):

| id | Story | Equation | End state |
|---|---|---|---|
| `t1` | 18 L → exactly 12 bottles | $12\times x=18$ ; $\frac{18}{x}=12$ | **x = 1,5 L** |
| `t2` | 30 L → exactly 40 bottles | $\frac{30}{x}=40$ | **x = 0,75 L** |
| `t3` | 9 L → exactly 36 bottles | $\frac{9}{x}=36$ | **x = 0,25 L** |

*متقدم* (the TANK is under the hand; PREDICT: the slate opens first, one checking fill):

| id | Story | Equation | End state |
|---|---|---|---|
| `a1` | how much juice fills 24 bottles of 0,25 L exactly? | $\frac{x}{24}=0{,}25$ | **x = 6 L** |
| `a2` | how much juice fills 15 bottles of 1,5 L? | $\frac{x}{15}=1{,}5$ | **x = 22,5 L** |
| `a3` | the tank already holds 4 L: how much to press so that 40 bottles of 0,25 L are filled exactly? | $\frac{4+x}{0{,}25}=40$ | **4 + x = 10 → x = 6 L** (undo ÷ first) |

Test fills verified (planner): 18 L with 1,4 L → 12 bottles and 1,2 L left; with 1,6 L → 11 bottles and a 12th at 0,4 L.

**« جرّب أعدادك » (always open):** the tank a (0,5 … 30 L) and b (2 … 60 bottles) free; unlimited fills; never counted.

**LabCoach** (`sa.labCoach.juice-line.off`): 1 `mould` « اسحب حافّة القالب لتغيّر سعة القارورة » · 2 `fill` « املأ لترى ما يحدث » ·
3 `leftover` (first fill with a leftover) « انظر: كم قارورة امتلأت، وكم بقي في الخزّان؟ » · 4 `slate` « اكتب العملية التي تعطي السعة » ·
5 `cards` « اختر كلّ المعادلات التي تصف الخطّ » · 6 `tank` (متقدم) · 7 `free`.

**Lab prototype (§6ter):** chains from the student's run:
- t1: « ماذا قال الملء الأوّل؟ » (bottles + leftover) → « كم لترًا في 12 قارورة سعتها $x$؟ » ($12\times x$) → « اكتب المعادلة » (both cards);
- t2: « أيّ عملية تعطي القاسم الناقص؟ » (÷) ; t3 ends on the RULE « القاسم الناقص = المقسوم ÷ حاصل القسمة »;
- a1: « هنا المجهول هو المقسوم: أيّ عملية؟ » (×) ; a3: « ما آخر عملية في $\frac{4+x}{0{,}25}$؟ » (÷) → « ألغِها أوّلًا ».
`LabStepper`, `useStepCelebration`, « إعادة », `playSfx` (`gesture` per stretch tick, `flag` on an exact fill, `over` on a leftover or a
partial bottle), full screen, `guided={!!chain}`, render test over every task.

**Wrong moves made VISIBLE:** `mult`, `flip`, `sub`, `add` (each value FILLED and drawn); a third test requested (the tests icon shakes,
« اكتب العملية »); a right x typed without an equation card (« أيّ معادلة تصف الخطّ؟ »).

**Formal phase:** $12\times x=18$ ، $x=18\div12=1{,}5$ ; $\frac{x}{24}=0{,}25$ ، $x=24\times0{,}25=6$ ; $\frac{4+x}{0{,}25}=40$ ، $4+x=10$ ،
$x=6$.

**Core maths:** `equation2.js` E2 (`solveForm`, `checkForm`, `undoChain`, `formOf`) on `powers.js`. Lab logic `logic/juiceLine.js`:
`tasksOf`, `fill(state)` → `{ full, partial, left }` (exact), `stretch(state, value)`, `judgeX(state, text)` → `{ ok, model }`,
`judgeCards(state, picked)`, `coachOf`; events `{ kind: 'fill', task, x, full, left, test }`, `{ kind: 'operation', task, text, ok,
model }`, `{ kind: 'cards', task, picked, ok }`, `{ kind: 'solved', task }`, `{ kind: 'custom', free: true }`.

**Why not another lab (DNA §12):**
- 2AM `kit-packer` (the closest kin: a workshop that fills): its dispensers release k × a and k × b items into k kits — a KNOWN product
  distributed; here the hand sets an UNKNOWN and the line's verdict is « exactly / leftover ». No dispenser, no kit.
- 2AM `mooring-lines` holds the candidate QUOTIENT a ÷ b laid along a rope (b and a given, the quotient sought at a rank); here the
  quotient b is GIVEN and the divisor (or the dividend) is the unknown — the equation, not the division.
- 2AM `egg-trays` (the dividend in trays of b), 3AM `group-tanks` (a mean in tanks), 3AM `scoop-scale` (a mass under a rounding screen),
  4AM `bucket-fill` (volumes of solids): none has an unknown capacity tested by a scarce fill.
- 4AM `equation-balance` / `solution-ray` / `term-ferry`: pans, a probe on a line, terms across a river — not here.

**Screen budget:** 1024×768: the line scene ≈ 440 × 280 px (tank on the right, conveyor of ≤ 12 visible bottles — beyond 12, a
« × n » counter on a crate), the mould and the slate in one row under it. The mould's handle ≥ 44 px; 0,05 L ticks every 6 px with a
magnifier on drag.

**DOM:** `[data-juice-line][data-level][data-task][data-x][data-tests][data-solved]`, `[data-jl-mould][role=slider]`,
`[data-jl-tank][role=slider]`, `[data-jl-fill]`, `[data-jl-bottle=<i>][data-level]`, `[data-jl-left]`, `[data-jl-slate]`,
`[data-jl-card=<i>][aria-pressed]`, `[data-jl-model]`, `[data-jl-free]`, `[data-jl-formal]`.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق من العدد الناقص ومن القسمة على عدد عشري »:

| # | Statement | Key | Measures |
|---|---|---|---|
| 1 | « العدد الناقص في $7+\ldots=12{,}5$ هو $5{,}5$ » | ✓ | `1am.m5.r10` |
| 2 | « العدد الناقص في $6\times\ldots=15$ هو $9$ » | ✗ ($2{,}5$) | `1am.m5.r10` |
| 3 | $4{,}5\div0{,}9=5$ | ✓ | `kasr-hasil-qisma` |
| 4 | « إذا كان $8\times7=56$ فإنّ $56\div7=8$ » | ✓ | × and ÷ |
| 5 | « $[AB]$ طوله $12$ و $M$ منه حيث $AM=x$ : $MB=12-x$ » | ✓ | `ibara-harfiya-intaj` (`prep` 6–9) |
| 6 | « من أجل $x=1{,}5$ قيمة $4x$ هي $5{,}5$ » | ✗ ($6$) | `ibara-harfiya-intaj` |

**M1 نشاط — « خطّ العصير »** — `objectives`: « أكتشف كيف أجد عددًا مجهولًا بالعملية العكسية دون تجريب أعمى ». Lab on top; then the trace
and the bricks: `ma-qal-al-mil` « ماذا قال الملء » (t1) · `muadala-kitabatan` « معادلتان للوضعية نفسها » (t1) · `qasim-naqis` « القاسم
الناقص بالقسمة » (t3) · `maqsum-naqis` « المقسوم الناقص بالضرب » (a1) · `akhir-amaliya` « نلغي آخر عملية أوّلًا » (a3).

**M2 معارف** — `objectives`: « أسمّي المعادلة وحلّها وأحلّ الأشكال الثلاثة ».
- Lab ALONE (`levels={false}`, t1) → $x=1{,}5$.
- Boxes: « تذكّر — السنة الأولى » (`bahth-adad-naqisa`, no link — text above) · definition (platform words: « المعادلة مساواة فيها عدد
  مجهول نرمز إليه بحرف. حلّ المعادلة هو القيمة التي تجعل المساواة صحيحة ») · the three forms: $a\times x=b$ ⟹ $x=b\div a$ ;
  $\frac xa=b$ ⟹ $x=a\times b$ ; $\frac ax=b$ ⟹ $x=a\div b$ · examples $2{,}5\times x=10$ ($4$), $\frac{x}{0{,}4}=15$ ($6$),
  $\frac{56}{x}=7$ ($8$), each checked by its one operation.

**M3 طريقة** — `objectives`: « أترجم مشكلًا بمعادلة وأحلّها وأتحقّق ». Steps:
1. translate (`method-4` own): « اشترت سلمى كتابًا ثمنه $x$ دينارًا ومجلّة بـ $150$ DA، واشترى أنس كتابين من النوع نفسه وقلمًا بـ $60$ DA،
   فصرفا المبلغ نفسه » → $x+150=2x+60$ (translation only — « سنعرف لاحقًا كيف نجد $x$ »: no forward link, no test);
2. a missing divisor: $\frac{63}{x}=4{,}5$ ⟹ $4{,}5\times x=63$ ⟹ $x=63\div4{,}5=14$ ; check $63\div14=4{,}5$ (discrepancy 2: « البحث عن
   قاسم مجهول يؤول إلى حساب حاصل قسمة »);
3. a missing dividend and a missing factor: $\frac{x}{2{,}5}=6$ ⟹ $x=15$ ; $1{,}2\times x=9$ ⟹ $x=7{,}5$ ;
4. two steps: $2x+240=300$: the last operation is « $+240$ » (unit 1, recalled) ⟹ $2x=60$ ⟹ $x=30$ ; check $2\times30+240=300$.

Method box: « نسمّي المجهول، نكتب المعادلة، نجد العدد الناقص بالعملية العكسية (نلغي آخر عملية أوّلًا)، ثمّ نتحقّق ».

**M4 أتمرّن** — `objectives`: « أتدرّب على ترجمة الوضعيات بمعادلات وعلى حلّها »:

| # | Statement (own numbers) | Answers | cites |
|---|---|---|---|
| 1 | جنى فلّاح $1350$ kg من التمر ووضعها في علب متماثلة، فحصل على $3$ شحنات من $150$ علبة. اختر المعادلات الصحيحة: $450\times x=1350$ ، $\frac{1350}{x}=450$ ، $150\times x=1350$ ، $\frac{x}{450}=1350$ ؛ ثمّ كتلة العلبة | الأولى والثانية ; $3$ kg | `act-4` q1–q2 |
| 2 | حلّ: $\frac x4=2{,}5$ ؛ $\frac14\times x=3{,}5$ ؛ $\frac{x}{200}=\frac15$ ؛ $\frac{392}{x}=98$ ؛ $\frac{75{,}6}{x}=12{,}6$ | $10$ ؛ $14$ ؛ $40$ ؛ $4$ ؛ $6$ | `act-4` q3, `ex-38`, `ex-39` |
| 3 | عيّن $x$ بحيث $\frac{30}{x}=12$ | $2{,}5$ | `now-61` ② |
| 4 | العدد الناقص: $0{,}1\times\ldots=0{,}53$ ؛ $\frac{144}{\ldots}=12$ ؛ $\frac{0{,}36}{\ldots}=0{,}1$ | $5{,}3$ ؛ $12$ ؛ $3{,}6$ | `ex-37` |
| 5 | « القيمة $3$ حلّ للمعادلة $\frac{4{,}8}{x}=1{,}6$ » صحيح أم خطأ؟ | صحيح ($4{,}8\div3=1{,}6$) | P2 |
| 6 | مستطيل مساحته $7{,}5$ cm² وطوله $5$ cm: ترجم بمعادلة ثمّ أوجد عرضه | $5\times x=7{,}5$ ; $1{,}5$ cm | `deep-56` |

**M5 مسألة 1 (`lessonProblem`) — « خطوات الروبوت »** (`ex-40` redesigned) — `objectives`: « أترجم فرقًا يتكرّر مع كلّ خطوة بمعادلة ».
- Statement: « طول خطوة ياسين $0{,}6$ m، وطول خطوة روبوته ثلاثة أضعافها. ينطلقان معًا ويخطوان العدد نفسه من الخطوات $x$. »
- Q/A: 1) خطوة الروبوت → $1{,}8$ m ; 2) بكم يتقدّم الروبوت بعد خطوة واحدة؟ → $1{,}2$ m ; 3) المعادلة لتقدّم $18$ m → $1{,}2\times x=18$ ;
  4) $x$ → $15$ خطوة ; 5) تحقّق → $1{,}8\times15-0{,}6\times15=27-9=18$.

**M6 مسألة 2 — « سياج قطعة الأرض »** — `objectives`: « أجد بُعدًا مجهولًا من محيط معلوم بمعادلة من خطوتين ».
- Statement: « قطعة أرض مستطيلة طولها $85$ m وعرضها $x$ ، ومحيطها $250$ m. يُسيَّج المتر بـ $120$ DA. »
- Q/A: 1) المحيط بدلالة $x$ → $2x+170$ ; 2) المعادلة → $2x+170=250$ ; 3) $x$ → $2x=80$ ، $x=40$ m ; 4) تكلفة السياج → $250\times120=30000$ DA.

**M7 مسألة 3 — « قوارير زيت الزيتون »** — `objectives`: « أحلّ معادلة قاسمها مجهول بأعداد عشرية وأوظّف الحلّ ».
- Statement: « عصرت تعاونية $157{,}5$ L من زيت الزيتون ووزّعتها في قوارير متماثلة، فملأت $210$ قارورة تمامًا. »
- Q/A: 1) المعادلة → $\frac{157{,}5}{x}=210$ ; 2) سعة القارورة → $x=0{,}75$ L ; 3) لو كانت السعة $1{,}5$ L، كم قارورة؟ → $105$ ; 4) وبسعة
  $0{,}25$ L؟ → $630$.

**M8 إختبار أولي:**

| # | Prompt | Key | Distractors | LP |
|---|---|---|---|---|
| 1 | حلّ $\frac{56}{x}=7$ | $8$ | $392$ (MULTDIV) · $49$ (SUBFORM) · $0{,}125$ (FLIP) | P3 |
| 2 | حلّ $2{,}5\times x=10$ | $4$ | $25$ (MULTDIV) · $7{,}5$ (SUBFORM) · $0{,}25$ (FLIP) | P3 |
| 3 | حلّ $\frac{x}{0{,}4}=15$ | $6$ | $37{,}5$ (DIVDIVIDEND) · $15{,}4$ (ADDFORM) · $0{,}6$ | P3 |
| 4 | أيّ عدد حلّ للمعادلة $\frac{4{,}8}{x}=1{,}6$؟ | $3$ | $7{,}68$ (MULTDIV) · $0{,}3$ (RANK) · $3{,}2$ (SUBFORM) | P2 |
| 5 | « $24$ علبة متماثلة كتلتها الكلّية $18$ kg »: المعادلة | $24\times x=18$ | $18\times x=24$ (SWAP) · $\frac{x}{24}=18$ (ROLE) · $24+x=18$ (ADDFORM) | P1 |

## 8. Misconceptions (`MISC-MAJHUL-*`)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `MULTDIV` | a missing divisor (or factor) found by multiplying a and b | `mult` fill overflows | tests 1, 2, 4 |
| `FLIP` | b ÷ a instead of a ÷ b | `flip` fill: many tiny bottles | tests 1, 2 |
| `SUBFORM` | the difference a − b used for any form | `sub` fill | tests 1, 2, 4 |
| `ADDFORM` | the sum, or « + » written for « × » | `add` fill | tests 3, 5 |
| `DIVDIVIDEND` | a missing dividend found by dividing | a1 tank refused | test 3 |
| `SWAP` | the two given numbers swapped in the equation | the wrong card | test 5 |
| `ROLE` | the known total put as a quotient | the wrong card | test 5 |
| `RANK` | the decimal comma misplaced in the quotient | — | test 4 |
| `UNDOFIRST` | in two steps, the first operation undone first (2x + 240 = 300 → x + 240 = 150) | a3 refused | M6; bank L4 |

## 9. Practice bank (`content/practice/2am/hall-mushkil-muadala/`, 5 × 10)

**Read by the planner:** `2am-s2-72` ex 2 (13x = 169, x + 7 = 2, 36/x = 9 — the second has x = −5: `counted: false` or replaced, README
Q10); misfiled `1am-s2-79` ex 2 q2 (two equations, numbers partly garbled — read the scan). Allotted parts (README): `2am-s2-50` ex 2 q1
(fractions garbled — read the scan) and ex 5 part 1 (choose 2x + 240, P = 300 → x = 30; the choice step is ibara's, `counted: false`);
`2am-s2-73` ex 5 part 1 (p = 2x + 240, p read on the scan); `2am-s2-75` ex 5 part 1 (a garage perimeter P1 = 24 m → x). **To read:**
`2am-s2-53` ex 1 / ex 5, `-56` ex 2, `-59` ex 2 / ex 5 (a field of perimeter 900 m), `-69` ex 1, `2am-s3-25` ex 2 (a prism's dimension
from its volume — term 3 badge), `-40` ex 1, `-46` ex 4 (π: only if exact), `-41` ex 5.

**Honest FAITHFUL count: 2 read today; 7–9 expected.**

| Level | Content | Provenance |
|---|---|---|
| L1 | one-operation equations a × x = b, x ÷ a = b, a ÷ x = b with decimals; the 1AM forms recalled | 2 term_exam (`2am-s2-72` ex 2, `1am-s2-79` ex 2 q2) · 6 modelled · 2 adapted (`ex-39`, `self-11`) |
| L2 | is this value a solution? (one operation); choose the equations of a story (several right) | 1 term_exam (`2am-s2-50` ex 2 q1 after reading) · 7 modelled · 2 adapted (`act-4`-like, `ex-37`) |
| L3 | translate a story, then solve: a dimension from an area / a volume, a price, a count | 1–2 term_exam (`2am-s3-25` ex 2, `-53` ex 1 after reading) · 7 modelled · 1 adapted (`deep-56`) |
| L4 | two-step equations k·x + c = d, (x + c) ÷ k = d — every intermediate ≥ 0 | 1 term_exam (`2am-s2-75` ex 5 part 1) · 9 modelled |
| L5 | « الوضعية الإدماجية » part 1: a plot / a house « بدلالة x », its perimeter given → x → a cost (the expression step `counted: false`) | 2–3 term_exam (`2am-s2-50` ex 5 part 1, `2am-s2-73` ex 5 part 1, `2am-s2-59` ex 5 after reading) · 7 modelled |

**Badges:** « على منوال اختبار الفصل الثاني » (`2am-s3-*` → « … الثالث »). **Oracle** `scripts/practice-oracle/hall-mushkil-muadala.mjs`
(BigInt rationals; every solution recomputed from the statement's equation and checked by substitution; every distractor equal to its
named error and not a solution).

## 10. Risks & owner questions

1. **The two-step equations** (README Q2) — if refused, P3 stops at one operation and the corpus' L4/L5 become « find x knowing 2x = 60 ».
2. **The scarce test fills** (two per task) must not frustrate: after two fails the slate opens with the fill's own numbers written
   (« 12 قارورة من $x$ لتر = 18 لترًا »), never the answer.
3. **Fractions as coefficients** (`act-4` q3 « 1/3 × x ») use 2AM `jida-kasrayn` (published): keep them in M4 / bank only.
4. **Negative solutions** (corpus « x + 7 = 2 ») — README Q10.

## 11. Generator checklist

- [ ] `build-extraction.py`: re-read PDF pp. 52, 54, 57 (bottom), 58, 61, 62, 64 at 200 dpi; `verified: True`; destinations: `prep` 6–9 →
  0; `ex-34` → 0; `act-4` q1–q2, q3 → 4; `know-5` → 2; `method-4`, `method-5` → 3; `now-61` ② → 4; `ex-37`, `ex-38`, `ex-39` → 4;
  `deep-56` → 4 (+ bank); `ex-40` → 5; `ex-35`, `ex-36`, `deep-53`, `deep-59`, `self-11` → `None` (bank). Discrepancies 1, 2, 8 written.
- [ ] `equation2.js` E2 functions + tests.
- [ ] Lab `juice-line` (type, theme `juicery`, levels, registry, strings `juiceLine`, logic + test (every task; every refused model's fill
  computed exactly; `fill` exact for x on the 0,05 grid and a ≤ 30), render test, LabCoach, §6ter ✅, contract section, DNA row,
  screenshots: initial, a test fill with a leftover, a partial bottle, the slate with cards, an exact fill, a1 tank, a3 two steps — four
  sizes, reviewed).
- [ ] Lesson: 9 modules with `objectives`, header, « تذكّر » (1AM text only), `content.test.js` (BigInt), memos.
- [ ] Catalogue, index, net, e2e `2am-mafhum-muadala-hall-mushkil-muadala.mjs`, gates, bank (`MISC-MAJHUL-*`), publish, commit
  `feat(lessons): hall-mushkil-muadala`.

## 12. Successor connection

- **3AM `muadalat-darajat-ula`** (published; net `2am.m4.r08 → 3am.m5.r06`, `extends`, added value « ax + b = cx + d، وترييض مشكلة بها »):
  - catalogue `pointPrerequisites`: **`3am_muadalat-darajat-ula_P1` ← `2am_hall-mushkil-muadala_P2`** (« an equation and what its solution
    is » — today P1 has no entry: create `"P1": ["2am_hall-mushkil-muadala_P2"]`) and **`3am_muadalat-darajat-ula_P4` ←
    `2am_hall-mushkil-muadala_P1`** (« ترييض مشكلة »: name the unknown, translate — append to `"P4": ["3am_muadalat-darajat-ula_P3"]`).
    No edge on P2 (verification by substitution of TWO members is r09, and there is no net link `2am.m4.r09 → 3am.m5.r06`: README Q5) nor
    on P3 (moving terms is 3AM's own);
  - « تذكّر — السنة الثانية »: `content/textbook.js › RECALL` already has `lesson: 'hall-mushkil-muadala'` and its text (« $12\div x=4$
    ( $x=3$ ) ») matches this lesson; `Module02Maarif.jsx` already renders `{base && <Link …>درس « حلّ مشكل باستعمال معادلة » — السنة
    الثانية متوسط</Link>}` → the link goes live by itself once the lesson is `available`. Only the header history line is added (« 2026-…:
    the 2AM base is published — P1, P4 edges »). Its « أستعدّ » item requiring `hall-qisma` is unchanged.
- **4AM**: reached through `muadalat-darajat-ula` (no direct link).

## Generator notes (2026-10-29)

- **Lab flow (decided at generation):** مبتدئ = test (two fills) → slate (operation or number) → exact control fill → equation cards (BOTH right equations, on every task) → solved; متقدم = slate first (a3 in two stages: the tank total, then what to add) → set the tank → exact fill. A fill orders N bottles: if the tank holds more than N, N full bottles and the juice left stays; if less, the last bottle is partial — this reproduces the plan's checked numbers (1,4 L → 12 bottles + 1,2 L left; 1,6 L → 11 + a 12th at 0,4 L). Refused values drawn by their fill at the nearest 0,05 tick (`12 ÷ 18` → 0,65 L); for `t2`/`t3` a subtraction is negative and is refused as unreadable.
- **`equation2.js` E2:** `checkForm({ form, a, b }, x)` takes the equation as an object (the plan wrote `checkForm(form, x)`); `solveForm(…, { allowNegative })`; `undoChain` returns `{ steps, x, mid, last }`; `formOf` reads « 2,5x = 10 », « 12 × x = 18 », « x ÷ 0,4 = 15 », « 56/x = 7 ».
- **Plan numbers:** the plan's M4 item 1 « 450 × x = 1350 » etc. kept; exercise `ex-5` (is this a solution?) is a platform addition (`interaction_generation`), not an element of the book.
- **Bank (helper-built):** 50 sheets, 8 `term_exam` / 36 modelled / 6 adapted; `2am-s2-72` ex 2 `x + 7 = 2` replaced by `x + 8 = 20` (README Q10); `act-4` and `deep-53` are adapted here (the plan listed `act-4` as modelled); `counted: false` steps carry `2am_hall-mushkil-muadala_P1` (the validator refuses another lesson's LP).
- **Extraction:** `act-4`, `know-5`, `method-4`, `method-5`, `ex-34 … ex-40` marked `verified` (pages 57, 58, 60, 64 of the book re-read at 90 dpi); `ex-34` and `ex-35` are cited through the lab resources' `sourceElementIds` (the mental « missing number » idea of the lab).
- **Catalogue:** `durationMinutes` 66 (the convention excludes the three مسائل; the plan said ≈ 85); `prerequisiteLessonCodes` `['bahth-adad-naqisa', 'ibara-harfiya-intaj']`; `pointPrerequisites` P1 ← `2am_ibara-harfiya-intaj_P1`, P2 ← P1, P3 ← P2.
- **« أستعدّ »:** items 1–2 measure `1am.m5.r10`; item 5 is the textbook `prep` 7 (a length in x).
- **Open points:** the successor connection (3AM `muadalat-darajat-ula` P1 ← `2am_hall-mushkil-muadala_P2`, P4 ← P1) is left to the coordinator; the plan's L5 « expression step `counted: false` » cites P1 of THIS lesson.
