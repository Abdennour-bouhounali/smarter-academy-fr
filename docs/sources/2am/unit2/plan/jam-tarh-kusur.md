# Plan — `jam-tarh-kusur` « جمع وطرح كسرين » (2AM unit 2, entry 2 of 5)

Read the unit [`README.md`](README.md) first. `kasr-hasil-qisma` is published before this lesson; `muqarana-kasrayn` comes AFTER it
(renvoi en avant, README owner question 1).

## 1. Identity

- **Code** `jam-tarh-kusur` · **title** « جمع وطرح كسرين » · unit `kusur-amaliyat` · catalogue order 7 · `lesson`.
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/kusur-amaliyat/jam-tarh-kusur/`.
- **Textbook pages** (PDF = book − 3): act-4 pp. 24–25 (PDF 21–22; the right margin of p. 25 is cut); know-2a, know-2b p. 28 (PDF 25);
  method-3 p. 29 (PDF 26); ex-7…ex-14 pp. 30–31, ex-29, ex-31 p. 32; self-5, self-6 p. 33; deep-36, deep-37, deep-40 p. 34; deep-47
  p. 35 (re-routed here); ict-1 p. 37; `prep` item 8 p. 23. Catalogue `textbookRef` (activity 24–25, knowledge 28, method 29) is right.
- `durationMinutes` ≈ 85; `difficulty` « متوسط »; icon 🥾.

## 2. Programme & net

**Item:** `2am.m1.r09` « جمع أو طرح كسرين لهما نفس المقام أو مقام أحدهما مضاعف لمقام الآخر ».

| LP | Draft (verbatim) | Final | Change and reason |
|---|---|---|---|
| P1 | جمع (أو طرح) كسرين لهما نفس المقام: نجمع (أو نطرح) البسطين ونحافظ على المقام المشترك | جمع (أو طرح) كسرين لهما نفس المقام، أيًّا كان المقام ولو كان البسطان عشريين: نجمع (أو نطرح) البسطين ونحافظ على المقام المشترك | Adds « any denominator » (the added value over 1AM decimal fractions, net `extends`) and decimal numerators (book know-2a: 3,2/3 − 1,6/3). |
| P2 | توحيد مقامي كسرين مقام أحدهما مضاعف للآخر ثمّ جمعهما أو طرحهما، مثل $\frac{5}{12} + \frac{1}{4} = \frac{5}{12} + \frac{3}{12}$ | توحيد مقامي كسرين مقام أحدهما مضاعف لمقام الآخر بضرب حدّي الكسر الآخر في نفس العدد، ثمّ جمعهما أو طرحهما واختزال الناتج، مثل $\frac{7}{15}+\frac{2}{5}=\frac{7}{15}+\frac{6}{15}=\frac{13}{15}$ | Example replaced (5/12 + 1/4 is the book's misprinted know-2b example; independence rule); « how » made explicit; « اختزال الناتج » added (1AM `ikhtizal` P3, recalled, used). |
| P3 | حساب الجزء الباقي من كلّ بطرح كسر من 1، مثل $1 - \frac{17}{18}$ | حساب الجزء الباقي من كلّ بطرح كسر (أو مجموع كسرين) من 1، وكتابة عدد طبيعي على شكل كسر لجمعه مع كسر أو طرحه منه، مثل $1-\frac{7}{12}=\frac{5}{12}$ و $2+\frac{5}{6}=\frac{17}{6}$ | Adds n ± a/b (book `prep` 8, `ex-14`, `deep-47`, `ex-31`) and « the remainder after two parts »; the example is the platform's (17/18 is the book's act-4). |

**Review items for « أستعدّ »:**

| Item | Text | Home | Status | Measured by |
|---|---|---|---|---|
| `1am.m5.r03` | جمع وطرح وضرب كسور عشرية | `kusur-ashriya-kitaba` (1AM) | **published** → link | items 2, 3 |
| `2am.m1.r08` | مقارنة كسرين لهما نفس المقام أو مقام أحدهما مضاعف لمقام الآخر | `muqarana-kasrayn` (2AM) | planned, LATER in the book (renvoi en avant) → « قريبًا » | items 5, 6 |

Extra `priorKnowledge`: `kasr-mutasawi-1am` (`ikhtizal` P1, published), `ikhtizal-1am` (P3), `mudaaf-1am` (multiples).

**noRebuild:** `2am.m1.r09` extends `1am.m5.r03` (`kusur-ashriya-kitaba`, published), added value « جمع وطرح كسرين مقام أحدهما مضاعف
لمقام الآخر، لا الكسور العشرية فقط ». → M2 opens with a « تذكّر — السنة الأولى » (3/10 + 5/100 = 30/100 + 5/100 = 35/100: tenths
rewritten as hundredths — the decimal case of « one denominator a multiple of the other ») WITH a link; the lesson builds the general
case (any c; 4 → 12, 5 → 15, 9 → 18).

**Renvoi en avant (`2am.m1.r08`):** one « تذكّر » sentence in M2 — « بين كسرين لهما نفس المقام، الأكبر هو صاحب البسط الأكبر » — used
only in مسألة 2 (« أكثر من النصف؟ » 5/8 vs 4/8). The lesson never compares any other pair.

**pointPrerequisites:**
- intra: P2 ← P1, P3 ← P1;
- 1AM, along `1am.m5.r03 → 2am.m1.r09` (extends), toward the published `kusur-ashriya-kitaba`:
  **P1 ← `1am_kusur-ashriya-kitaba_P1`** (a decimal fraction as tenths/hundredths, 3/10 = 30/100) and
  **P2 ← `1am_kusur-ashriya-kitaba_P3`** (2 + 3/10 + 5/100: the sum of tenths and hundredths — the decimal prototype of P2);
- `muqarana-kasrayn`: none now (planned). If the net link stays `r08 → r09` the edge P2 ← `2am_muqarana-kasrayn_P3` is added when
  `muqarana` is published; with the proposed `r09 → r08` it is the other way (`muqarana` P3 ← this P2). See §12.

**Where it is used next:** `jida-kasrayn` (« what remains » before « a fraction of the remainder »), `muqarana-kasrayn`, the synthesis,
2AM `adad-nisbiya` sums, 3AM `jam-tarh-kasrayn` (extends) and `amaliyat-natiqa`.

## 3. Boundary

See README. In short: same denominator (any) and ONE denominator a multiple of the other(s), n ± a/b, 1 − parts, several terms when the
largest denominator is a multiple of all the others; reduce the result. **Never:** unrelated denominators (3AM), comparisons other than the
recalled same-denominator one, products (« of the remainder »: `jida-kasrayn`), negative results.

## 4. Textbook analysis (reference, not script)

| Element | What it asks | Idea kept | Platform use |
|---|---|---|---|
| `act-4` ① | a 4 × 6 grid, 6 green + 5 orange → 6/24 + 5/24 | counting same-size parts | **Not the entry** (pre-drawn grid, the parts are already the same). M4 item 1 (own: 20 squares, 7 + 6 → 13/20) |
| `act-4` ② | Ahmed's trip: 7/18 fast train, 5/9 suburban train, rest by bus; choose the operation; 1 − 17/18 | legs of a journey; « the rest » | inspires the lab's WORLD (a trail in legs), own numbers; M4 item 2 (choose the operation) |
| `know-2a` | rule + 13/7 + 11/7, 3,2/3 − 1,6/3 | decimal numerators | M2 (own examples) |
| `know-2b` | rule + 5/12 + 1/4 (**misprint**), 3/4 − 5/12 | rewriting | M2 (own examples; the misprint never shown) |
| `method-3` | 5/7 + 9/21 (**misprint 34/21**), 14/9 − 2/3 | the two-step method | M3 (own numbers) |
| `ex-7`…`ex-10` | same denominator; one multiple (3/5 + 1/10, 2/5 + 7/15, 1/4 + 3/8, 13/21 − 3/7 …) | practice | M4 item 3 + bank (own) |
| `ex-11`, `ex-12` | addition tables (some cells unrelated: **scope**) | tables | bank L2 (own table, every cell a 2AM case) |
| `ex-13` | « which result is a natural » (illegible) | — | bank (adapted, own) |
| `ex-14` | order 1 − 5/7, 8/3 − 1, 2 + 7/12, 13/6 + 3/4 (**scope**: 6 and 4) | n ± a/b | M4 item 4 (own, without ordering — comparison is entry 4) |
| `ex-29` | books 2/5 + 1/4, rest (**scope**) | « the rest » | M5 (own 2/5 + 3/10) |
| `ex-31` | add the denominator to the numerator: +1 | (a + b)/b = a/b + 1 | M4 item 6 |
| `self-5` | 8/5 + 6/15 = ? (three right options) | multiChoice | test register + bank |
| `self-6` | 10/3 − 5/7 (**scope**) | — | bank adapted (own 10/3 − 5/6) |
| `deep-36` | flowers 3/5 morning, 3/10 afternoon, unsold | « what remains » | M6 register (own) |
| `deep-37` | 1/2 L + 3/4 L | a sum > 1 | M4 item 5 (own) |
| `deep-40` | sum pyramid (**scope**) | pyramid | bank L3 (own base 1/2, 1/4, 1/8, 1/16 → all multiples) |
| `deep-47` | 2 − 1/6, 2 + 1/3 on a line | n ± a/b | M4 item 4 |
| `ict-1` | three fractions summing to 1 (spreadsheet + pies) | sums to 1 | bank L3 (adapted, no spreadsheet) |
| `prep` 8 | 2 + 5/6 | natural + fraction | M0 item 1 (rewritten) |

## 5. Design

**The lesson in one paragraph.** The scout troop walks the cedar trail of the national park, from the gate to the spring. Small white
posts mark every twelfth of the trail; every third post is a tall red one (quarters). In the morning the group walks 5 white posts, in
the afternoon « a quarter of the trail » — one red stretch. Where are they? The student walks the hiker: the white counter climbs 5,
then the red stretch adds 3 more white posts: **8 white posts = 8/12 of the trail**. « 5/12 + 1/4 = 6/16 » is impossible: 6/16 of the
trail is not even as far as the morning leg alone. A quarter IS 3/12 because each red stretch holds 3 white posts (12 is a multiple of
4). How much is left to the spring? 12 − 8 = 4 white posts = 4/12 = 1/3. Walking back (to the picnic table) subtracts the same way.

**Entry point — candidates compared:**
- (a) **The book's act-4 ①** (a grid already cut into 24 equal squares): the common part is GIVEN; nothing to discover. Rejected → M4.
- (b) **The book's act-4 ②** (a train trip in 18ths and 9ths, read off a statement): the idea « legs of one journey » is good, but the
  student never handles the two units. Its idea is kept as the drawn world, with own numbers and a walk the hand performs.
- (c) **Measuring jugs** (pour 1/4 L and 5/12 L): a pouring gesture belongs to 3AM `scoop-scale`, a kitchen to 4AM `fraction-reduction`.
- (d) **A trail marked by two kinds of posts, walked by the hand** (one leg counted in white posts, the other given in red stretches):
  the conversion red → white is SEEN (one red stretch = k white posts) while the hand walks. **Chosen.**
  `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'mountaintrail' }`.

**Order of ideas:** same posts (same denominator) → two kinds of posts (one denominator a multiple of the other) → what remains to the
spring (1 − …) → walking back (difference) → a whole loop + a part (n + a/b) → معارف (recall 1AM, the rule, examples) → طريقة (three
terms with one common denominator) → practice, مسائل, test.

**Contexts (values):** the scout trail (cooperation, respect for nature — « لا نترك نفاياتنا »), the class library (reading), the olive
harvest (family work), the village water tank (saving water).

## 6. Lab — `trail-odometer` « عدّاد المسلك » (new type)

**Drawn world `mountaintrail`** (new theme, kind `lengths`, label « مسلك جبلي في غابة الأرز: أعمدة بيضاء وحمراء وعين ماء »):
- a winding path drawn as a ribbon over hills and cedar trees, from a wooden gate « مدخل الحظيرة » to a spring « العين »; the path is
  ONE arc length (the whole trail = 1), parameterised so equal fractions are equal arc lengths (`pathAt(t)`);
- small white posts every 1/n (n = the fine denominator); every k-th post a taller RED post with a red band (the coarse unit 1/m, n = k·m);
  in same-denominator tasks only white posts exist;
- a hiker (KidFigure: at مبتدئ a girl in hijab + long tunic, scout scarf, backpack; at متقدم a boy in a hoodie) standing ON the path;
- a wrist « عدّاد » on a pill near the hiker: two counters — « أعمدة بيضاء: 8 » and « أعمدة حمراء: 2 و 2 أعمدة بيضاء » (the red counter
  reads whole red stretches + leftover white posts, never a fraction);
- a wooden plan board at the gate with the day's legs written as fractions (`$\frac5{12}$ صباحًا ، $\frac14$ مساءً`);
- a footprint trail behind the hiker coloured per leg (leg 1 green, leg 2 blue, a walk-back leg orange dashed).

**The variable in the hand: the distance walked, in white posts (an integer 0…n·L, L = number of laps for n + a/b tasks).**

**Gestures (three paths):** drag the hiker along the path (projection on `pathAt`, snaps to white posts); −/+ (one white post) and
« عمود أحمر » +/− (k white posts — the coarse step, available only where red posts exist); keyboard ← → (± 1), PageUp/PageDown (± k);
« وصلنا » (Enter) ends a leg and is judged.

**Judging a leg:** the leg's target is the plan board's fraction; « وصلنا » is ok when the hiker stands exactly on it. A leg written in
red stretches is accepted whether the student walked with ±1 or with the red step — the counters show both readings.

**Then the question the world asks** (a NamePill under the plan board, typed answer): « أين أنتم من المسلك؟ اكتب كسرًا » — accepted:
any EQUAL writing with the fine denominator or reduced (8/12 or 2/3); refused with the model: `across` (6/16), `noScale` (6/12: the red
stretch counted as one white post), `coarse` (2/4 + … mixed). A refused writing is DRAWN: a dashed flag stands on the path where that
fraction would be (6/16 sits before the end of the morning leg), with the pill « هنا يقع $\frac{6}{16}$ ».

**Opening (no title):**
- Context: « خرج الفوج الكشفي في مسلك الأرز: قطع صباحًا $\frac{5}{12}$ من المسلك. »
- Question: « امشِ بالكشّافة المرحلة الثانية، $\frac14$ المسلك، ثم اكتب أين وصل الفوج وكم بقي إلى العين. »
- `lead`: « الأعمدة البيضاء تقسم المسلك إلى أجزاء متساوية. »

**Levels** (same `objective` string on both):

*مبتدئ* (counters visible):

| id | Posts | Legs | End state | Shows |
|---|---|---|---|---|
| `g1` | white every 1/12 | 5/12 then 4/12 | at **9/12**; to the spring **3/12** | same denominator; « the rest » |
| `g2` | white 1/12, red 1/4 | 5/12 then 1/4 | at **8/12 = 2/3**; rest **4/12 = 1/3** | one red stretch = 3 white posts |
| `g3` | white 1/12, red 1/4 | at 3/4, walk BACK 5/12 to the picnic table | at **4/12 = 1/3** | the difference 9/12 − 5/12 |

*متقدم* (PREDICT: the hiker is locked until the student types the arrival fraction and « the rest »; the white counter is hidden until
arrival):

| id | Posts | Legs | End state |
|---|---|---|---|
| `a1` | white 1/16, red 1/8 | 5/16 then 3/8 | **11/16**, rest **5/16** |
| `a2` | white 1/20, red 1/5 | at 13/20, back 2/5 | **5/20 = 1/4** |
| `a3` | white 1/12, red 1/6 | 1/6 then 7/12 | at 9/12; rest **1 − 9/12 = 1/4** |
| `a4` | white 1/6 (a LOOP trail) | one full loop then 5/6 of a second | **1 + 5/6 = 11/6** (the counter shows 11 white posts) |

**« جرّب أعدادك » (always open):** two legs a/b ± c/d where one denominator is a multiple of the other (b, d ≤ 24; the form refuses
an unrelated pair with « هذان المقامان سنراهما في السنة الثالثة » — a free-panel message, never a verdict on the student), and a free
« توقّعي » writing drawn as a dashed flag. Free trials never count.

**LabCoach** (`sa.labCoach.trail-odometer.off`): 1 `walk` « اسحب الكشّافة على المسلك » · 2 `arrive` « اضغط « وصلنا » عند نهاية
المرحلة » · 3 `red` (first red leg) « مرحلة بالأعمدة الحمراء؟ راقب العدّاد الأبيض وأنت تمشي » · 4 `write` « اكتب أين وصلتم » ·
5 `predict` (متقدم) · 6 `free`.

**Lab prototype (§6ter):** chains after each task, from the student's run:
- g1: « كم عمودًا أبيض مشيتم في اليوم كلّه؟ » (9) → « فما الكسر؟ » (9/12) → « وكم بقي إلى العين؟ » (3/12);
- g2: « كم عمودًا أبيض في المرحلة الحمراء؟ » (3) → « اكتب $\frac14$ بالأعمدة البيضاء » (3/12) → « لماذا لا نكتب $\frac{6}{16}$؟ » (the dashed
  flag the student saw);
- g3 (ends on the RULE): « نطرح كما نجمع: نكتب الكسرين بنفس المقام ثم نطرح البسطين ».
- a-chains: « لماذا يكفي أن نحوّل $\frac38$ وحده؟ » → « لأنّ 16 مضاعف لـ 8 ».
`LabStepper`, `useStepCelebration`, « إعادة », `playSfx` (`gesture` per post, `flag` on arrival, `bell` at the spring), full screen,
`guided={!!chain}`, render test over every task.

**Wrong moves made VISIBLE:** `across` (dashed flag before leg 1's end); `noScale` (the flag at 6/12 sits short of where the hiker
stands); « 1 − 9/12 = 1/3 » (the dashed flag for « the rest » measured from the spring lands off the hiker); n + a/b « = (n + a)/b »
(11/6 written as 6/6? the counter shows 11 white posts after a full loop of 6).

**Formal phase:** $\frac5{12}+\frac14=\frac5{12}+\frac{3}{12}=\frac8{12}=\frac23$ ; $1-\frac23=\frac13$ ; $\frac34-\frac5{12}=\frac9{12}-\frac5{12}=\frac4{12}=\frac13$.

**Core maths:** `fractions2.js` E2 row (`isMultipleCase`, `rewriteTo`, `sumMultipleCase`, `complement`) on `fractions3.js`
(`toDenominator`, `raw`). Lab logic `logic/trailOdometer.js`: `pathAt`, `postsOf(task)`, `walk(state, posts)`, `arrive(state)`,
`judgeWriting(state, text)` → `{ ok, model: 'right' | 'across' | 'noScale' | 'coarse' | 'other', flagAt }`, `coachOf`; events
`{ kind: 'leg', task, leg, posts, ok }`, `{ kind: 'writing', task, value, ok, model }`, `{ kind: 'predict', task, value, ok }`,
`{ kind: 'solved', task }`, `{ kind: 'custom', free: true }`.

**Why not another lab (DNA §12):**
- 3AM `seed-rake` (the successor's lab): the hand STRETCHES the common unit 1/N until adjacent zones are whole — it CHOOSES a common
  multiple. Here the units are given by the trail's two kinds of posts (one already a multiple of the other), and the hand WALKS a
  distance: the conversion red → white is read while walking. Nothing is chosen, stretched or planted.
- 1AM `rank-exchange` (tie ten / open one) exchanges objects; nothing is exchanged here. `fraction-knife` cuts one share.
- 3AM `number-line-pegs` hangs a card on a line; 3AM `robot-track` flips cards to move a robot; `elevator-reel` scrubs a timeline — here a
  figure is walked along a curved 2D path and the counters are the output.

**Screen budget:** at 1024×768 with the sidebar the trail fits a 470 × 230 px scene (a gentle S-curve), counters and buttons in ONE
row below; 24 posts max (white posts drawn as 4-px pegs above 16 posts). 768×1024: the path gets taller curves.

**DOM:** `[data-trail-odometer][data-level][data-task][data-posts][data-solved]`, `[data-to-hiker]` (role slider, `aria-valuenow` = white
posts), `[data-to-post=<i>][data-red]`, `[data-to-counter=white|red]`, `[data-to-leg=<i>][data-state]`, `[data-to-write]`,
`[data-to-flag][data-model]`, `[data-to-free]`, `[data-to-formal]`.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق من جمع كسور عشرية ومن الكتابات الكسرية المتساوية »:

| # | Statement | Key | Item / source |
|---|---|---|---|
| 1 | rewritten `prep` 8: $3+\frac47=\frac{25}{7}$ | ✓ | prep 8 |
| 2 | $\frac{3}{10}+\frac{45}{100}=\frac{75}{100}$ | ✓ | `1am.m5.r03` |
| 3 | $\frac{7}{10}-\frac{25}{100}=\frac{45}{100}$ | ✓ | `1am.m5.r03` |
| 4 | $\frac34=\frac{9}{12}$ | ✓ | `ikhtizal` (×k) |
| 5 | $\frac59<\frac79$ | ✓ | `2am.m1.r08` (renvoi) |
| 6 | $\frac{11}{15}>\frac{13}{15}$ | ✗ | `2am.m1.r08` (renvoi) |

**M1 نشاط — « عدّاد المسلك »** — `objectives`: « أكتشف كيف أجمع وأطرح أجزاءً من مسار حين تكون الأجزاء من نوع واحد أو من نوعين ».
Lab on top; then the trace of the chains and the bricks: `nafs-al-maqam` (after g1) · « أتوقّع القاعدة » then `tawhid-mudaaf` (after g2)
· `al-baqi` « الباقي من الكلّ: نطرح من 1 = $\frac{n}{n}$ » (after g1/g2) · `tarh` (after g3) · `adad-tabii-kasr` (after a4).

**M2 معارف** — `objectives`: « أسمّي قاعدتي جمع كسرين وطرحهما ».
- Lab ALONE (`levels={false}`, task: white 1/8, red 1/4; 3/8 + 1/4) → 3/8 + 2/8 = **5/8**.
- Boxes: « تذكّر — السنة الأولى » (`kusur-ashriya-kitaba`, link: $\frac3{10}+\frac5{100}=\frac{30}{100}+\frac5{100}=\frac{35}{100}$) ·
  « تذكّر — كتابات كسرية متساوية » (`ikhtizal`, link) · « تذكّر — مقارنة كسرين لهما نفس المقام » (renvoi: one sentence, no link,
  « سندرسها في درس مقارنة كسرين ») · rule 1 (same denominator) $\frac49+\frac29=\frac69=\frac23$ ; $\frac{3{,}5}{6}-\frac{1{,}5}{6}=\frac26=\frac13$ ·
  rule 2 (multiple) $\frac{11}{18}-\frac16=\frac{11}{18}-\frac3{18}=\frac8{18}=\frac49$ · rule 3 (the rest) $1-\frac38=\frac88-\frac38=\frac58$.

**M3 طريقة** — `objectives`: « أوحّد المقامات حين يكون أحدها مضاعفًا للآخر وأحسب ثم أختزل ». Steps:
1. $\frac7{15}+\frac25$: « هل 15 مضاعف لـ 5؟ » → $\frac7{15}+\frac6{15}=\frac{13}{15}$;
2. $\frac{11}6-\frac23=\frac{11}6-\frac46=\frac76$;
3. $2+\frac38=\frac{16}8+\frac38=\frac{19}8$;
4. $\frac49+\frac5{18}+\frac16$: 18 is a multiple of 9 AND of 6 → $\frac8{18}+\frac5{18}+\frac3{18}=\frac{16}{18}=\frac89$.

Method box: « نختار المقام الأكبر إذا كان مضاعفًا لكلّ المقامات الأخرى، نحوّل الكسور الأخرى إليه بضرب حدّيها في نفس العدد، نجمع
(أو نطرح) البسطين، ثمّ نختزل ».

**M4 أتمرّن** — `objectives`: « أتدرّب على الجمع والطرح والباقي »:

| # | Statement (own numbers) | Answers | cites |
|---|---|---|---|
| 1 | مستطيل من 20 مربّعًا: 7 زرقاء و 6 صفراء — الكسر الملوّن؟ اكتب $\frac7{20}+\frac6{20}$ | $\frac{13}{20}$ | `act-4` ① |
| 2 | قطع سمير $\frac{5}{16}$ من طريقه بالحافلة و $\frac38$ بالقطار: أيّ عملية تعطي الجزء المقطوع بالقطار والحافلة؟ ($+$ ، $-$ ، $\times$) ثم احسب الباقي سيرًا | $+$ ; $\frac{11}{16}$ ; $\frac{5}{16}$ | `act-4` ② |
| 3 | احسب: $\frac27+\frac9{14}$ ، $\frac56-\frac7{12}$ ، $\frac34-\frac58$ ، $\frac{2{,}3}{5}+\frac{1{,}7}{5}$ | $\frac{13}{14}$ ; $\frac14$ ; $\frac18$ ; $\frac45$ | `ex-7`…`ex-10` |
| 4 | احسب: $1-\frac5{8}$ ، $\frac73-2$ ، $3+\frac5{12}$ ، $2-\frac16$ | $\frac38$ ; $\frac13$ ; $\frac{41}{12}$ ; $\frac{11}6$ | `ex-14`, `deep-47` |
| 5 | شربت سلمى $\frac12$ L ثم $\frac34$ L من الماء بعد الركض: كم شربت؟ هل أكثر من لتر؟ (اكتب الناتج عددًا طبيعيًا وكسرًا) | $\frac54=1+\frac14$ ; نعم | `deep-37` |
| 6 | أضف المقام إلى البسط في $\frac{3}{7}$: بكم يزيد الكسر؟ جرّب مع $\frac{5}{9}$ | $\frac{10}7=\frac37+1$ ; يزيد بـ 1 | `ex-31` |

**M5 مسألة 1 (`lessonProblem`) — « مكتبة القسم »** — `objectives`: « أحسب الجزء الباقي من مجموعة ».
- Statement: « في مكتبة القسم: $\frac25$ من الكتب قصص و $\frac{3}{10}$ كتب علمية، والباقي كتب تاريخ. »
- Q/A: 1) القصص والعلمية معًا → $\frac7{10}$ ; 2) كتب التاريخ → $\frac3{10}$ ; 3) « إذا كان في المكتبة 60 كتابًا، فكم كتاب تاريخ؟ » →
  **not asked** (a product = `jida-kasrayn`): instead « اكتب الكسرين بالمقام 20 » → $\frac{14}{20}$ ، $\frac6{20}$. Illustration `tags`.

**M6 مسألة 2 — « جني الزيتون »** — `objectives`: « أجمع جزأين وأقارن الناتج بالنصف ».
- Statement: « جنت العائلة $\frac14$ من زيتون البستان في اليوم الأول و $\frac38$ منه في اليوم الثاني. »
- Q/A: 1) ما جُني في اليومين → $\frac58$ ; 2) الباقي → $\frac38$ ; 3) « هل جنوا أكثر من النصف؟ » → $\frac58>\frac48$ (the renvoi
  « تذكّر », same denominator only).

**M7 مسألة 3 — « خزّان المدرسة »** — `objectives`: « أتتبّع ما يبقى في خزّان بعد الاستهلاك والتعبئة ».
- Statement: « استُهلك صباحًا $\frac5{12}$ من ماء الخزّان، ومساءً $\frac13$ منه، ثم أُضيف ليلًا $\frac1{12}$ منه. »
- Q/A: 1) المستهلك → $\frac9{12}=\frac34$ ; 2) الباقي مساءً → $\frac14$ ; 3) في الصباح الموالي → $\frac3{12}+\frac1{12}=\frac4{12}=\frac13$.

**M8 إختبار أولي:**

| # | Prompt | Key | Distractors | LP |
|---|---|---|---|---|
| 1 | $\frac38+\frac14$ | $\frac58$ | $\frac4{12}$ (ACROSS) · $\frac48$ (NOSCALE) · $\frac5{12}$ | P2 |
| 2 | $\frac7{10}-\frac25$ | $\frac3{10}$ | $\frac55$ (ACROSS) · $\frac5{10}$ (NOSCALE) · $\frac35$ | P2 |
| 3 | $1-\frac59$ | $\frac49$ | $\frac59$ (PART) · $\frac14$ (ONEASNUM: 1 − 5/9 read as (9 − 5)… over 9 − 5?) · $\frac4{10}$ | P3 |
| 4 | $\frac{13}{15}+\frac{4}{15}$ | $\frac{17}{15}$ | $\frac{17}{30}$ (DENSUM) · $\frac{17}{225}$ · $\frac{9}{15}$ | P1 |
| 5 | « زُرع $\frac4{15}$ من الحقل قمحًا و $\frac25$ منه شعيرًا. ما الجزء المزروع؟ » | $\frac{10}{15}=\frac23$ | $\frac6{20}$ (ACROSS) · $\frac6{15}$ (NOSCALE) · $\frac13$ (REST) | P2 |

(Test 3's second distractor is replaced by the lead if no named error fits: `ONEASNUM` = « 1 written as 1/9 ». Keep the three others.)

## 8. Misconceptions (`MISC-JAMKASR-*`)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `ACROSS` | add numerators and denominators | the dashed flag short of the hiker | tests 1, 2, 5; L1–L3 |
| `NOSCALE` | rewrite the denominator only | flag at 6/12 short | tests 1, 2, 5 |
| `DENSUM` | same denominators added too (17/30) | — | test 4; L1 |
| `PART` | the part given for the rest | the spring flag | test 3; L2 |
| `ONEASNUM` | 1 written as 1/b | — | test 3 |
| `NATURAL` | n + a/b = (n + a)/b | the loop counter (a4) | L1, L3 |
| `REST` | the rest given for the sum (or vice versa) in a story | — | test 5; L5 |

## 9. Practice bank (`content/practice/2am/jam-tarh-kusur/`, 5 × 10)

**Read by the planner:** `2am-s1-68` ex 2 A ($\frac74+\frac54=3$) and B ($\frac{16}{10}-\frac25=\frac{16}{10}-\frac4{10}=\frac{6}5$) and the
situation q 1 (1 − 3/5 − 2/25 = 8/25: 25 is a multiple of 5); `2am-s1-75` ex 3 M ($\frac{13}{15}+\frac95=\frac{40}{15}=\frac83$);
`2am-s1-91` problem q 2 (1 − 5/12 − 2/4 = 1/12). **To read:** `-73` ex 1, `-78` ex 1, `-84` ex 2, `-67` ex 2, `-66` ex 2, `-83` ex 5,
`-88` ex 5, `-73` ex 5, `-69` ex 5, `-70` ex 4, `-92` ex 1 / `-67` ex 5, `-74` ex 5, `-87` situation (README discrepancy 4),
`2am-s2-53` ex 1, `2am-s2-56` ex 2, misfiled `3am-s1-112` ex 4 / ex 8.

**Honest FAITHFUL count: 4 read today; 8–10 expected.** Only the fraction parts count; products (« of the remainder »,
« amount = fraction × total ») are `counted: false` until `jida-kasrayn` is published, then still `counted: false` (validator: a
counted question's LP belongs to this lesson).

| Level | Content | Provenance |
|---|---|---|
| L1 | same denominator; one multiple; reduce | 2 term_exam (`-68` ex 2 A/B, `-75` ex 3 M) · 6 modelled · 2 adapted (`ex-9`, `ex-10`) |
| L2 | « احسب ثم برّر » (why this denominator; is it reducible); an addition table | 1 term_exam (`-84` ex 2 after reading) · 7 modelled · 2 adapted (`ex-12`, `self-5` multiChoice) |
| L3 | full exercise: A, B, C with n ± a/b, three terms; a pyramid | 1–2 term_exam (`-73` ex 1, `-78` ex 1) · 6 modelled · 2 adapted (`deep-40`, `ict-1`) |
| L4 | mobilises `kasr-hasil-qisma` (same term): a sum, then a decimal writing / approximate value of the result; those steps `counted: false` | 0–1 term_exam · 9 modelled |
| L5 | « الوضعية الإدماجية »: shares of a land / a budget — the part spent, what remains (the amount parts `counted: false`) | 2–3 term_exam (`-68` situation, `-91` problem q 2, then `-83` / `-88` / `3am-s1-112` ex 8) · 6 modelled · 1 adapted (`deep-36`) |

**Oracle** `scripts/practice-oracle/jam-tarh-kusur.mjs` (BigInt rationals, own reduction; asserts every pair is a 2AM case: one
denominator divides the other — the bank never contains a 3AM pair).

## 10. Risks & owner questions

1. **Net `r08 → r09`** (README Q1). Default: renvoi en avant, one « تذكّر » sentence.
2. **`kusur-ashriya-kitaba` barely teaches operations on decimal fractions** (README Q6): the « أستعدّ » items 2–3 measure them anyway.
3. **`2am-s1-87` situation** reading (README discrepancy 4).
4. **Test 3's second distractor** has a weak name; the lead may swap it for $\frac{4}{8}$ (« 1 − 5/9 = (9 − 5)/(9 − 1) ») if that error is
   observed in the corpus correction keys.

## 11. Generator checklist

- [ ] `build-extraction.py`: re-read PDF pp. 21–22, 25, 26, 27–28, 30, 31, 32 at 200 dpi; `verified: True`; destinations: `act-4` → 4;
  `know-2a`, `know-2b` → 2; `method-3` → 3; `ex-7`…`ex-10`, `ex-14`, `ex-31`, `deep-37`, `deep-47` → 4; `ex-11`, `ex-12`, `ex-13`,
  `ex-29` (→ M5 register, cite), `self-5`, `self-6`, `deep-36` (→ M6 register, cite), `deep-40`, `ict-1` → `None` / their module;
  `prep` item 8 → 0; **`deep-47` moved here from `muqarana-kasrayn`**; **`opener` moved to the synthesis**. Record the `scope`
  discrepancies (README).
- [ ] `fractions2.js` E2 functions + tests.
- [ ] Lab `trail-odometer` (type, theme `mountaintrail`, levels, registry, strings `trailOdometer`, logic + test (every task via `coachOf`;
  `judgeWriting` models; the path parameterisation: equal fractions = equal arc lengths within 0,5 px), render test, LabCoach, §6ter ✅,
  contract section, DNA row, screenshots: initial, mid-leg on a red stretch, the `across` flag, the spring, the walk back, a4's loop, the
  formal phase — at the four sizes, reviewed).
- [ ] Lesson: 9 modules (`objectives`), header (entry, (a)–(c), order, LP history), « تذكّر » (1AM ×2 with links; the renvoi sentence
  without), `content.test.js` (BigInt; asserts every lesson pair is a 2AM case), knowledge `memo`s.
- [ ] Catalogue: final LPs, `pointPrerequisites` (§2), duration, difficulty, icon; `generate:lesson-index`, `generate:learning-net`.
- [ ] e2e `2am-kusur-amaliyat-jam-tarh-kusur.mjs`; gates; bank + oracle + JSON entries (`MISC-JAMKASR-*`); publish; commit.

## 12. Successor connection

- **3AM `jam-tarh-kasrayn`** (published; net `2am.m1.r09 → 3am.m1.r06`, extends):
  - catalogue `pointPrerequisites` (LP codes from `lessons_3am_2026_2027.json`): **`3am_jam-tarh-kasrayn_P1` ← `2am_jam-tarh-kusur_P2`**
    (the common denominator when one is a multiple → any common multiple); **`3am_jam-tarh-kasrayn_P2` ← `2am_jam-tarh-kusur_P1`,
    `2am_jam-tarh-kusur_P3`** (the 3AM P2 adds natural numbers and reducing: the 2AM P3 already writes n as a fraction — README Q7). Today
    its `pointPrerequisites` are P2 ← P1, P3 ← P1 (intra): ADD the cross-year codes to those lists;
  - `content/textbook.js › RECALL` (« تذكّر — السنة الثانية », `src('method-5', …)`, NO `lesson` field): add `lesson: 'jam-tarh-kusur'`,
    and in `modules/Module02Maarif.jsx` render it like `RECALL_TASAWI` (`const y2 = getLessonPath(RECALL.lesson)` → `{y2 && <Link …
    data-recall-link>درس « جمع وطرح كسرين » (السنة الثانية)</Link>}` inside the `TextbookBox`); its « أستعدّ » items (`jam-tarh-kusur-2am`)
    stay; the « راجع » card lights up by itself;
  - its plan's « Generator notes » / `MOYEN_ROLLOUT_PROGRESS.md`: note the edge.
- **3AM `amaliyat-natiqa`**: its `RECALL.sum` links to the 3AM lesson; no 2AM edge (no net link).
- **2AM `muqarana-kasrayn`** (entry 4, same unit): if the owner reverses the link (`r09 → r08`), `muqarana` writes P3 ← this lesson's P2
  (its plan §2). If the link stays `r08 → r09`, add **`2am_jam-tarh-kusur_P2` ← `2am_muqarana-kasrayn_P3`** in THIS lesson's catalogue
  entry the day `muqarana` is published, and turn M2's renvoi sentence into a « تذكّر » with `getLessonPath('muqarana-kasrayn')`.
- **2AM `adad-nisbiya`** sums (unit 4 of 2AM): no net link to r09 found today; nothing to do.

## 13. Generator notes (lead, 2026-10-29)

Executed as planned. Differences and decisions:

- **No miscomputed number** in the plan (every M2–M8 value, the lab tasks and the bank keys were recomputed with exact fractions; the bank helper reached the same result). The lab name `trail-odometer` and the theme `mountaintrail` were free.
- **Test 3 distractors:** `ONEASNUM` was dropped; the options are `5/9` (PART), `4/8` (the plan's alternative « (9 − 5)/(9 − 1) »), `4/10`. `ONEASNUM` and `REST` are not used by any bank signature (5 `MISC-JAMKASR-*` ids exist: ACROSS, NOSCALE, DENSUM, PART, NATURAL).
- **`judgeWriting` models:** `right`, `across` ((Σ num)/(Σ den)), `noScale` (the red leg counted as a white post), `natural` (loop: (n + a)/b), `part` (the part written for the remainder), `other`. The plan's `coarse` is folded into `other` (a mixed writing is just unequal); the dashed flag is drawn for every refused writing.
- **Predict level:** the plan asks to type arrival AND remainder before walking; implemented for the non-loop tasks (`a1`–`a3`), the loop `a4` asks the arrival only (the remainder of a loop is not a fraction of one lap).
- **M0:** six items as planned; items 2–3 carry `1am.m5.r03`, items 5–6 the `2am.m1.r08` renvoi (statements only, no link); items 1 and 4 are `prep` 8 and the equal-writings check.
- **M2:** the lab alone is the task `k1` (3/8 + 1/4 on an 8-post trail, chain `ksum · ruleMulti`), the « تذكّر » boxes link `kusur-ashriya-kitaba` and `ikhtizal-kitaba-kasriya` (published), and the comparison sentence has NO link (`muqarana-kasrayn` is unpublished). No LP edge toward `muqarana-kasrayn` is written: the coordinator adds `2am_jam-tarh-kusur_P2 ← 2am_muqarana-kasrayn_P3` the day it is out.
- **M5 question 3** asks the two numerators over 20 (14 and 6), never a product. M7 (the tank) keeps the plan numbers; the « night refill » is a sum of parts of the same capacity.
- **`pointPrerequisites`** as planned: P2 ← P1, P3 ← P1, P1 ← `1am_kusur-ashriya-kitaba_P1`, P2 ← `1am_kusur-ashriya-kitaba_P3` (catalogue order: P1 ← 1AM P1; P2 ← own P1 and 1AM P3; P3 ← own P1).
- **Extraction:** `know-2a`, `know-2b`, `method-3` re-read on PDF p. 25–26 (book pp. 28–29) at 100 dpi (`verified: True`; the printed 5/12 + 1/4 and 34/21 misprints confirmed, never shown); `act-4`, `ex-7`…`ex-14`, `ex-29`, `ex-31`, `self-5`, `self-6`, `deep-36`, `deep-37`, `deep-40`, `deep-47`, `ict-1` → this lesson, module 4 (the bank and the exercises cite them); `opener` → the synthesis, module 0. The other elements of the unit keep `verified: False`.
- **Open point:** the extraction's `self-5` answer `["أ","ب","د"]` for `8/5 + 6/15` looks wrong for option أ (the option reads 18/15 + 6/15, and 18/15 ≠ 8/5 = 24/15; to re-read on the scan): the bank's `self-5` sheet uses its own numbers and does not depend on it.
- **Duration:** the modules total 66 min without the three مسائل (87 with them, under the 90-minute cap); catalogue `durationMinutes` is 66, not the plan's ≈ 85.
