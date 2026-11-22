# Plan — `kasr-hasil-qisma` « الكسر: نسبة وحاصل قسمة وقيم مقرّبة » (2AM unit 2, entry 1 of 5)

Read the unit [`README.md`](README.md) first (boundaries, `fractions2.js`, destinations). The unit is seeded; this lesson CREATES
`packages/core/arithmetic/fractions2.js`.

## 1. Identity

- **Code** `kasr-hasil-qisma` · **title** « الكسر: نسبة وحاصل قسمة وقيم مقرّبة » · unit `kusur-amaliyat` · catalogue order 6 · `lesson`.
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/kusur-amaliyat/kasr-hasil-qisma/` (same shape as
  `qisma-iqlidiya-hasr/`: `lesson.config.js`, `knowledge.jsx`, `knowledgeGraph.js`, `content/{textbook,exercises,problems}.js`,
  `content/content.test.js`, `modules/Module00Astaidd.jsx … Module08Itqan.jsx`, `routes.jsx`, `index.jsx`, `moduleContext.js`).
- **Textbook pages** (book → PDF = book − 3): act-2, act-3 p. 24 (PDF 21); know-1c, know-1d, know-1e p. 26 (PDF 23; bottom cut);
  method-1, method-2, now-27 p. 27 (PDF 24); now-29 ① p. 29; ex-1…ex-6 p. 30; self-1, -2, -3, -4, -9 p. 33; deep-35, deep-38 p. 34;
  deep-46 p. 35 (re-routed here); ict-2, ict-3 p. 37; `prep` items 1, 2, 3, 4, 6, 7, 11 p. 23. Catalogue `textbookRef` (activity 24,
  knowledge 26, method 27) is right.
- `durationMinutes` ≈ 85 (≤ 90); `difficulty` « متوسط »; icon 🪢 (or ⚓).

## 2. Programme & net

**Items:** `2am.m1.r05` « تعيين قيمة مقرّبة بالزيادة (أو بالنقصان) لحاصل قسمة عشري » · `2am.m1.r06` « حصر حاصل القسمة » (shared with
the published `qisma-iqlidiya-hasr`).

**Draft الكفاءات (verbatim) and final wording (order kept — LP ids are positional):**

| LP | Draft | Final | Change and reason |
|---|---|---|---|
| P1 | التعرّف على الكسر $\frac{a}{b}$ كنسبة (حصص من كلّ) وكحاصل القسمة $a \div b$ | تسمية الكتابة الكسرية $\frac{a}{b}$ لحاصل قسمة عددين عشريين ($b\neq0$) «نسبة $a$ إلى $b$»، والتمييز بين «الكسر» (حدّاه طبيعيان) و«الكتابة الكسرية» (حدّاها عشريان)؛ وهي القيمة المضبوطة لحاصل القسمة ولو لم يكن عشريًا | **Meaning narrowed.** « a/b = a ÷ b » and « not always decimal » are 1AM `hasil-qisma-kasr` P1/P3 (published) → recalled (« تذكّر » with a link). What 2AM adds (book know-1d): the WORD « نسبة a إلى b » (9 of 35 pupils → 9/35) and « كتابة كسرية » when the terms are decimals. |
| P2 | إيجاد كتابات كسرية متساوية بضرب (أو قسمة) البسط والمقام في نفس العدد غير المعدوم | تحويل كتابة كسرية حدّاها عشريان إلى كتابة مقامها طبيعي بضرب الحدّين في 10 أو 100 أو 1000 حسب عدد الأرقام بعد الفاصلة في المقام، مثل $\frac{4{,}2}{0{,}35}=\frac{420}{35}$ | **Meaning changed.** ×k / ÷k is 1AM `ikhtizal-kitaba-kasriya` P1 (published, it even shows 2,1/3,5 = 21/35) → recalled. 2AM keeps the step the decimal division needs: choosing the power of ten from the DIVISOR (book method-1, now-27, know-1e). |
| P3 | تحويل قسمة على عدد عشري إلى قسمة على عدد طبيعي بضرب الحدّين في 10 أو 100 أو 1000 | قسمة عدد عشري على عدد عشري غير طبيعي: تحويلها إلى قسمة على عدد طبيعي ثمّ إنجاز القسمة العشرية ومواصلتها بعد الفاصلة، مثل $9{,}1\div3{,}5=91\div35=2{,}6$ | **Completed**: the draft P3 = the new P2; P3 now owns PERFORMING the division (book know-1e « 1596 على 280 »), which r05 needs (« حاصل قسمة عشري »). The 1AM base (decimal division by a natural, `1am.m3.r03`, planned `qisma-ashriya-taqrib`) is recalled. |
| P4 | تعيين قيمة مقرّبة بالزيادة أو بالنقصان إلى الوحدة أو إلى $0{,}1$ أو $0{,}01$ لحاصل قسمة، مثل $2{,}33 < \frac{7}{3} < 2{,}34$ | تعيين القيمتين المقرّبتين بالنقصان وبالزيادة إلى $0{,}1$ أو $0{,}01$ (أو $0{,}001$) لحاصل قسمة، وحصره بهما، مثل $1{,}66<\frac{5}{3}<1{,}67$ | « إلى الوحدة » removed (it is `qisma-iqlidiya-hasr` P2, published: recalled); « وحصره بهما » added (r06 at a decimal rank); the example is the platform's (7/3 is the book's method-2). |

**Review items for « أستعدّ »** (`reviewLinksForLesson`):

| Item | Text | Home | Status | Measured by |
|---|---|---|---|---|
| `1am.m3.r04` | تعيين القيمة المقرّبة إلى الوحدة بالزيادة (أو بالنقصان) لحاصل قسمة عشري | `hasr-qiyam-muqarraba` (1AM) | planned → « قريبًا », « تذكّر » text only | items 5, 6 below |

Extra `priorKnowledge` (allowed, audit vocabulary): `kasr-hasil-qisma-1am` (published `hasil-qisma-kasr`), `kasr-mutasawi-1am`
(published `ikhtizal`), `qisma-ashriya-1am` (`1am.m3.r03`, planned), `hasr-wahda-2am` (published `qisma-iqlidiya-hasr` P2).

**noRebuild** (`noRebuildForLesson`): `2am.m1.r05` extends `1am.m3.r04` (planned `hasr-qiyam-muqarraba`), added value « القيمة المقرّبة
إلى أيّ رتبة (0,1 ؛ 0,01 …) لا إلى الوحدة فقط ». → The unit rank is recalled (it is also taught by `qisma-iqlidiya-hasr` P2); the lab's
first rank (the metre) is a warm-up the student already masters, the lesson BUILDS only 0,1 and 0,01.

**pointPrerequisites:**
- intra: P2 ← P1, P3 ← P2, P4 ← P3;
- intra-unit, shared item `2am.m1.r06`: **P4 ← `2am_qisma-iqlidiya-hasr_P2`** (the unit-rank bracket, published). This follows the
  default of `PLAN_3AM_UNITS_1_5.md` owner question 3 (« two lessons on one programme item: an edge may be written »). Write it unless
  the owner says no;
- 1AM: **none** today (no net link from `1am.m5.r01` / `r02` / `1am.m3.r03` into r05/r06; `1am.m3.r04`'s home is planned). If the owner
  adds the README's question-5 links: P1 ← `1am_hasil-qisma-kasr_P1`, `_P3`; P2 ← `1am_ikhtizal-kitaba-kasriya_P1`.

**Where it is used next:** `jida-kasrayn` P2 (5/7 × 2,8: a decimal term), the synthesis, 3AM `hasr-adad-ushri` (rounding and screens —
no net link: README Q5), 3AM `adad-natiq` (« decimal or not »), every later « اعط قيمة مقرّبة » of the cycle (π, square roots in 4AM).

## 3. Boundary

**Owns:** see README. **Leaves:**
- Euclidean division and the unit bracket (`qisma-iqlidiya-hasr`, recalled; the lab's metre rank is a warm-up);
- a ÷ b = a/b, b × a/b = a, non-decimal fractions (1AM `hasil-qisma-kasr`, recalled);
- a/b = ka/kb in general and reducing (1AM `ikhtizal`, recalled; used freely);
- rounding to the NEAREST (« المدوّر », 3AM `hasr-adad-ushri`): never asked. A corpus question « تدوير » (`2am-s1-73` ex 2) is
  `counted: false` or rewritten as default/excess;
- the calculator screen (3AM `hasr-adad-ushri` P4): `ex-2` « يمكن استعمال الحاسبة » is posed without it (long division).

**With `qisma-iqlidiya-hasr` (precise r06 split):** it owns `q < a/b < q + 1` for NATURAL a, b; this lesson owns the brackets at
**0,1 / 0,01 / 0,001**, and the unit bracket of a quotient of DECIMALS only as the first line of a table (« إلى الوحدة » column of the
corpus tables, e.g. `2am-s1-91` ex 2), primary LP P4 with P3 for the division.

## 4. Textbook analysis (reference, not script)

| Element | What it asks | Idea kept | Platform use |
|---|---|---|---|
| `act-2` | Leila's cake in 8, Manal's 3 shares → 3/8; a quarter = 2 shares; cut in 16 → 6/16 | ratio as parts of a whole (primary + 1AM) | **Not the entry** (1AM content). M4 item 1 (own: a tray of 12 مقروط, 5 taken; cut in 24 → 10/24) |
| `act-3` | 6 juice boxes 160 DA → 160/6 not decimal; 15 boxes 3 kg → 3/15 = 0,2 kg | quotient as a number; decimal or not | M4 item 2 (own numbers) |
| `know-1c` | « a better bracket with approximate values » | bridge from unit to 0,1 | M2 (platform words) |
| `know-1d` | a/b « نسبة a إلى b »; notes 1)–3); 9/35 club; 11/7 ≃ 1,571428 | the words نسبة, كتابة كسرية | M2 box (own examples) |
| `know-1e` | ÷ decimal → ×10, 100…; 15,96 ÷ 2,8 = 5,7; 4/2,75 = 400/275 (cut) | the method | M2 + M3 (own numbers) |
| `method-1` | 4,8 three writings; 5/3 = 35/21; 45/36 = 5/4 | equal writings (1AM) | M0 recall item / M4 item 3 |
| `method-2` | 7 ÷ 3 = 2,333…; 2,3 to 1/10, 2,33 to 1/100 | approximate values | M3 (own 5 ÷ 3, 12,5 ÷ 0,35) |
| `now-27` | 54 ÷ 1,8 = 540/18; 9,7/5,03 = 970/503 | P2 | M4 item 3 (own) |
| `now-29` ① | 2,7 ÷ 0,9; 8,5 ÷ 2,5 | P3 | M4 item 5 (own) |
| `ex-1`, `ex-2` | decimal writings; = or ≠ (0,33 trap) | decimal or not, exact vs approximate | M4 item 4 (own) |
| `ex-3`, `ex-4` | place thirds/sixths/quarters on a half-line | 1AM recall | bank (adapted) |
| `ex-5`, `ex-6` | equal or not; four equal fractions | 1AM recall | M0 / bank |
| `self-1`…`-4`, `-9` | QCM | — | M8 register + bank (multiChoice) |
| `deep-35` | from 6885 ÷ 17 = 405, six quotients | P2 shifts | M4 item 5 (own: 4416 ÷ 23 = 192) |
| `deep-38` | three fractions between 1,23 and 1,24 | strategy | M4 item 6 (own: between 2,71 and 2,72) |
| `deep-46` | AM/AB, MA/MB on a line | « نسبة » | bank L3 (adapted) |
| `ict-2`, `ict-3` | software measures; a decimal between π and 22/7 | approximate displays | bank (adapted, README) |

## 5. Design

**The lesson in one paragraph.** At the fishermen's harbour, Yacine (KidFigure boy, hoodie) must cut a rope of 8 m into 3 equal
mooring lines. He slides a clip along the rope laid on the quay: 2 m — three pieces fit and 2 m remain; 3 m — the third piece runs off
the end. The answer is between 2 and 3 (he knows this from `qisma-iqlidiya-hasr`). He turns the precision dial to decimetres: 2,6 fits
(0,2 m left), 2,7 overflows (0,1 m missing). Centimetres: 2,66 fits, 2,67 overflows — **and it never fits exactly**: the leftover
shrinks but never reaches 0. The exact length is the NUMBER 8/3; 2,66 and 2,67 are its approximate values to 0,01 by default and by
excess: 2,66 < 8/3 < 2,67. Then the contrast: 9 m in 4 lines lands EXACTLY on 2,25 (8/3 is not decimal, 9/4 is). In the advanced
level the boatman asks a different question: « how many lines of 0,7 m can be cut from 4,6 m? » The tape switches from metres to
decimetres: 46 dm ÷ 7 dm — **the same count** (both terms ×10), now a division by a natural: 6 whole lines, 6,5 < 46/7 < 6,6.

**Entry point — candidates compared:**
- (a) **The book's نشاط 2 / 3** (a cake in 8 shares; 6 juice boxes for 160 DA): it is 1AM content (published `hasil-qisma-kasr`) and gives
  no reason to approximate. Rejected as the entry; both become M4 applications.
- (b) **A shared bill** (1000 DA among 7): money has no rank below the centime and invites rounding to the NEAREST (3AM). Kept for a
  bank register only.
- (c) **A scale** (mass under a rounding screen): that is 3AM `scoop-scale`. Rejected.
- (d) **Cutting a rope into equal pieces, checked by laying them end to end** (b × q against a): the bracket is a PHYSICAL fact (fits /
  overflows), the rank is a tool the student turns, and switching the tape's unit (m → dm) shows « ×10 on both terms » without a rule.
  **Chosen.** `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'harbor' }`.

**Order of ideas:** unit bracket (recall) → refine to 0,1 → refine to 0,01 → never exact (8/3) vs exact (9/4) → name: exact value,
approximate values by default/by excess, bracket → the ratio words (نسبة, كتابة كسرية) in معارف → change the tape's unit = ×10ⁿ on both
terms (advanced level, then M2/M3) → perform the division → practice, three مسائل, test.

**Contexts (values woven, guide §5):** the harbour (cooperation between fishermen), a cooperative's olive oil (sharing fairly), a school
cycling club (effort, patience), a water tank for a village (care for water).

## 6. Lab — `mooring-lines` « حبال المرسى » (new type)

**Drawn world `harbor`** (new theme, kind `lengths`, `VISUAL_THEMES` label « مرسى الصيّادين: حبل ممدود على الرصيف وشريط قياس وقوارب »):
- a stone quay seen from above at a slight angle, sea and two small painted fishing boats (no flags, no text on hulls);
- a coiled rope's free part LAID straight along the quay over a fixed measuring tape (0 … a m, labelled every metre; dm / cm ticks
  appear with the dial);
- a brass CLIP on the rope at the candidate length q from the left end; ghost copies of the piece (dashed outlines, alternating tints)
  are laid end to end after it, b in all: they end before the rope's end (leftover painted bright), exactly on it, or past it (the
  overflow hangs off the quay edge over the water, red);
- a precision dial (three detents: « متر » / « ديسيمتر » / « سنتيمتر ») on a wooden post;
- KidFigure Yacine (boy, hoodie, mood `wonder` on a fit with leftover, `proud` on an exact landing) and, at مبتدئ, his sister Lina
  (girl, hijab + tunic, `scarf` from `SCARVES`) holding the end of the measuring tape (the cut itself is drawn as the clip's « طق », never a blade in a child's hand).

**The variable in the hand: the candidate quotient q at the current rank** (a length in m at مبتدئ; a number of lines at متقدم).

**Gestures (three paths):**
- drag the clip along the rope (`useStretchInteraction`; snaps to the current rank: 1 m, 0,1 m, 0,01 m);
- −/+ buttons (one step of the current rank); keyboard ← → (± one step), PageUp/PageDown (± ten steps), Home (q = 0);
- tap a detent on the dial (or ↑/↓ on the focused dial) to refine. **The dial unlocks the next rank only after the bracket of the
  current rank is FOUND** (the largest q that fits and the smallest that covers both tried): no jumping to centimetres;
- « ضع القطع » (Enter) lays the b pieces and judges: ok if the student's pair (default, excess) is right at the current rank.

**What the world shows (from the logic only — `fitsAtRank`):**
- the b pieces laid, the leftover or overflow LENGTH as a pill (« يبقى 0,2 m » / « ينقص 0,1 m »), never the quotient;
- the two bracket ends the student found as flags on the tape (« يكفي » / « لا يكفي »), kept when the dial refines (the next rank zooms
  INTO that segment: the tape re-labels [2,6 ; 2,7] in centimetres — honest geometry, the same rope);
- an exact landing: the last piece clicks on the rope's end, the leftover pill says « لا شيء يبقى » and the dial greys the next rank
  (« لا حاجة إلى رتبة أدقّ »).

**Opening (no title, DNA §17.9):**
- مبتدئ context: « يريد ياسين أن يقطع حبلًا طوله $8\,\text{m}$ إلى $3$ حبال ربط متساوية للقوارب. »
- Question: « حرّك المشبك لتجد أطول قطعة تكفي وأقصر قطعة لا تكفي، ثم دقّق بالقرص حتى السنتيمتر. »
- `lead`: « القطع الثلاث توضع واحدة بعد الأخرى على الحبل. »

**Levels** (same `objective` string on both, `validate:lessons`):

*مبتدئ — partition (`kind: 'share'`: q = a length)*

| id | Task | Brackets (default \| excess) | End state | Shows |
|---|---|---|---|---|
| `r1` | 8 m into 3 | 2 \| 3 → 2,6 \| 2,7 → 2,66 \| 2,67 | never exact (leftover 0,02 m at 2,66) | the rank refines, the leftover never vanishes |
| `r2` | 9 m into 4 | 2 \| 3 → 2,2 \| 2,3 → **2,25 exact** | the last piece lands on the end | contrast: a decimal quotient |
| `r3` | 9,5 m into 3 | 3 \| 4 → 3,1 \| 3,2 → 3,16 \| 3,17 | never exact | a decimal dividend |

*متقدم — quotition with a decimal divisor (`kind: 'count'`: q = a number of lines; PREDICT first: the clip is locked until the student
types the tape's unit that makes the line length natural, then the first bracket)*

| id | Task | Unit switch | Brackets | End state |
|---|---|---|---|---|
| `a1` | lines of 0,7 m from 4,6 m | m → dm: 46 ÷ 7 | 6 \| 7 → 6,5 \| 6,6 → 6,57 \| 6,58 | 6 whole lines; 46/7 not decimal |
| `a2` | lines of 1,8 m from 13,5 m | m → dm: 135 ÷ 18 | 7 \| 8 → **7,5 exact** | half a line, exactly |
| `a3` | lines of 0,6 m from 5 m | m → dm: 50 ÷ 6 | 8 \| 9 → 8,3 \| 8,4 → 8,33 \| 8,34 | never exact |

The unit switch is a second control at متقدم (« وحدة الشريط: m / dm / cm »): switching re-labels the WHOLE tape and both lengths
(4,6 m → 46 dm, 0,7 m → 7 dm); the laid pieces do not move (the invariant). Choosing cm for `a1` also works (460 ÷ 70) and is accepted;
the coach line after a1 asks « ما أصغر وحدة تجعل طول الحبل الواحد عددًا طبيعيًا؟ ».

**« جرّب أعدادك » (always open, `[data-ml-free]`):** a ∈ ]0 ; 99,99] and b (a natural 2…12 at مبتدئ, a decimal 0,1…9,9 at متقدم);
the same clip and dial; free trials carry `free: true` and never count.

**LabCoach** (`coachOf`, storage key `sa.labCoach.mooring-lines.off`):
1. `clip`: « اسحب المشبك على الحبل لتغيّر طول القطعة. »
2. `lay`: « اضغط « ضع القطع » لترى هل يكفي الحبل. »
3. `dial`: « وجدت الحصر؟ أدِر القرص إلى رتبة أدقّ. » (after the first bracket)
4. `unit` (متقدم): « غيّر وحدة الشريط حتى يصير طول الحبل الواحد عددًا طبيعيًا. »
5. `free`: « جرّب حبالك في « جرّب أعدادك ». »

**Lab prototype (guide §6ter, binding):** `CHAINS` + `QUESTIONS` (`lesson.manipulation.json › mooringLines.cp.*`) after each task:
- r1: « كم يبقى من الحبل بالقطعة 2,6 m؟ » (0,2 m — from the student's run) → « وبالقطعة 2,66 m؟ » (0,02 m) → « هل يمكن أن يصير الباقي 0؟ »
  (لا: 8 ÷ 3 = 2,666… لا تنتهي) — 2 hints each;
- r2: « لماذا انتهت القسمة هنا؟ » (9 ÷ 4 = 2,25 عدد عشري);
- r3 (last beginner chain, ends on the RULE): « 3,16 قيمة مقرّبة بالنقصان أم بالزيادة؟ » → the rule « القيمة بالنقصان تكفي، والقيمة
  بالزيادة لا تكفي، وحاصل القسمة بينهما »;
- a1–a3: « لماذا لم يتغيّر عدد الحبال حين غيّرنا الوحدة؟ » → « ضربنا الطولين في 10 معًا ».

`useLabCheckpointSettings('mooring-lines')`, `LabStepper` (r1 r2 r3 / a1 a2 a3), `useStepCelebration` once per task, « إعادة » restarts
everything (`resetKey`), `playSfx` (`gesture` on a snap, `bell` on an exact landing, `flag` on a found bracket, `over` on an overflow),
full screen, `guided={!!chain}`, render test over every task of both levels (model `gearCrank.render.test.jsx`).

**Wrong moves made VISIBLE (never a rule):**
- the remainder written after the comma (8 ÷ 3 « = 2,2 » because 8 = 3 × 2 + 2): the clip at 2,2 lays pieces that leave 1,4 m;
- default and excess swapped: the flag « لا يكفي » sits on the larger value, always;
- a wrong rank (2,6 given at the 0,01 rank): the dial shows the 1-cm ticks between 2,60 and 2,70 and 2,6 is not the largest that fits;
- « 2,67 = 8/3 »: the overflow pill (« ينقص 0,01 m ») stays red;
- ×10 on ONE term (4,6 ÷ 7): the tape in dm with the rope still read 4,6 makes the pieces 7 dm overflow at the first one.

**Discovery (folded into the last chain of each level):** « متى ينتهي البحث عن رتبة أدقّ؟ » — right « عندما تقع آخر قطعة على طرف الحبل
بالضبط: حاصل القسمة عدد عشري » ; wrong « عندما نصل إلى السنتيمتر » (refuted by r1: at the centimetre 0,02 m still remains), « عندما
يكون الحبل طويلًا » (refuted: 9,5 m never lands, 9 m lands).

**Formal phase (`[data-ml-formal]`):** $8=3\times2{,}66+0{,}02$ · $3\times2{,}66<8<3\times2{,}67$ · $2{,}66<\frac83<2{,}67$ with the names
« قيمة مقرّبة إلى $0{,}01$ بالنقصان / بالزيادة »; « $\frac83$ هي القيمة المضبوطة ». At متقدم: $\frac{4{,}6}{0{,}7}=\frac{46}{7}$, $6{,}57<\frac{46}{7}<6{,}58$.

**Core maths:** `fractions2.js` E1 row (`clearDecimals`, `decimalQuotientBracket`, `fitsAtRank`, `isDecimalQuotient`) on `decimals.js`
(`quotientBracket`, `floorAt`, `ceilAt`). Lab logic `logic/mooringLines.js`: `tasksOf(level)`, `lay(state, q)` → `{ verdict, gap }`,
`bracketFound(state, rank)`, `dialUnlocked`, `coachOf`, events:
- `{ kind: 'lay', task, rank, q, verdict: 'fits' | 'exact' | 'over', gap }`;
- `{ kind: 'bracket', task, rank, lo, hi, ok, model: 'right' | 'swapped' | 'notLargest' | 'notSmallest' | 'remainderComma' }`;
- `{ kind: 'unit', task, unit, divisorNatural }` (متقدم);
- `{ kind: 'solved', task, exact }`; `{ kind: 'custom', free: true }`.

**Why not another lab (DNA §12):**
- `egg-trays` (2AM, same unit): the hand holds the DIVIDEND; trays close at b; a one-unit frame between naturals. Here the hand holds the
  QUOTIENT candidate at decimal ranks, judged by b × q against a.
- `scoop-scale` (3AM): the hand pours a MASS read through a ROUNDING screen; its `trap` task brackets a/b between ticks with a lamp. Here
  nothing is rounded: the verdict is a physical fit (pieces laid end to end), the student chooses the rank, and the advanced level changes
  the UNIT of both terms (×10ⁿ) — the scale never does.
- `ruler-compare` (1AM): the hand holds a ruler's graduation to separate two given numbers; here the dial only refines a search and the
  number in the hand is a quotient.
- `division-jumps` (1AM): q jumps of b toward a (naturals); `zero-probe` unrolls a cable to a depth — this rope is laid and never
  unrolled.

**Screen budget:** 1024×768 with the sidebar (column ≈ 450–520 px): the quay strip ≤ 190 px high (rope + tape + overflow zone), dial and
buttons in ONE row under it, the verdict pill inside the scene. At the cm rank only the zoomed decimetre segment is drawn (10 ticks).
768×1024: same layout, scene taller. Measure `[data-ml-glance]`.

**DOM:** `[data-mooring-lines][data-level][data-task][data-rank][data-q][data-solved]`, `[data-ml-clip]` (role slider), `[data-ml-dial]`,
`[data-ml-unit]`, `[data-ml-piece=<i>]`, `[data-ml-gap][data-verdict]`, `[data-ml-flag=lo|hi]`, `[data-ml-free]`, `[data-ml-formal]`.

## 7. Modules (9) — each `ContentModule` with `objectives`

**M0 أستعدّ** — `objectives`: « أتحقّق من أنّي أكتب حاصل قسمة كسرًا وأحصره بين عددين طبيعيين ». Statements (true/false + why):

| # | Statement | Key | Source / item |
|---|---|---|---|
| 1 | rewritten `prep` 1: « في الكسر $\frac{7}{30}$ البسط 7 والمقام 30 » | ✓ | prep 1 |
| 2 | rewritten `prep` 2: « $\frac{27}{12}$ عدد عشري » | ✓ (2,25) | prep 2 |
| 3 | rewritten `prep` 4/6: « العدد الذي إذا ضربناه في 9 نجد 4 هو $\frac{9}{4}$ » | ✗ ($\frac49$) | prep 4, 6 — `hasil-qisma-kasr` |
| 4 | rewritten `prep` 7/11: « $\frac{12}{28}=\frac{3}{7}$ » | ✓ | prep 7, 11 — `ikhtizal` |
| 5 | platform: « القيمة المقرّبة إلى الوحدة بالنقصان لحاصل قسمة $47$ على $5$ هي $9$ » | ✓ (9,4) | `1am.m3.r04` |
| 6 | platform: « حاصل قسمة $7{,}2$ على $4$ محصور بين 2 و 3 » | ✗ (1,8: between 1 and 2) | `1am.m3.r04` + `1am.m3.r03` |
| 7 | rewritten `prep` 3: « الكتابة العشرية لـ $\frac{5}{8}$ هي $0{,}625$ » | ✓ | prep 3 |

(Rewritten = own numbers, same idea; the `source` stays `src('prep', 23, 'أستعدّ', n)` for 1–4 and 7, `addition('prerequisite_diagnostic')`
for 5–6.)

**M1 نشاط — « حبال المرسى »** — `objectives`: « أكتشف لماذا لا تنتهي بعض القسمات، وكيف أحصر حاصل القسمة بدقّة أكبر فأكبر ». Lab on
top (two levels), nothing above it. Then the TRACE of the chains (`answered(id)`) and the bricks, in order:
1. evidence of r1 → brick `qima-madbuta` « $\frac83$ هو القيمة المضبوطة لحاصل قسمة 8 على 3 »;
2. evidence of the two ranks → « أتوقّع القاعدة » (guide §14.3ter) → brick `qiyam-muqarraba-ushr` « 2,6 و 2,7 قيمتان مقرّبتان إلى 0,1 … »;
3. r2 vs r1 → brick `ashri-am-la` « حاصل القسمة عشري إذا انتهت القسمة »;
4. متقدم a1 → brick `tahwil-qasim` « نضرب الحدّين في نفس القوّة لـ 10 فلا يتغيّر حاصل القسمة ».

**M2 معارف** — `objectives`: « أسمّي النسبة والقيمة المضبوطة والقيم المقرّبة لحاصل قسمة ».
- Opens on the lab ALONE (`levels={false}`, task 10 m into 7, ranks 0,1 then 0,01) → 1,4 | 1,5 then **1,42 | 1,43** (7 × 1,42 = 9,94;
  7 × 1,43 = 10,01).
- Questions: « اكتب الحصر إلى 0,01 » → $1{,}42<\frac{10}{7}<1{,}43$; « ما القيمة المضبوطة؟ » → $\frac{10}{7}$.
- Boxes (order: what was just done → name):
  - « تذكّر — السنة الأولى » (`hasil-qisma-kasr`, published, link): $a\div b=\frac ab$; $\frac73$ ليس عشريًا;
  - « تذكّر — كتابات كسرية متساوية » (`ikhtizal`, published, link);
  - « تذكّر — الحصر إلى الوحدة » (`qisma-iqlidiya-hasr`, published, link);
  - النسبة: « من بين 28 تلميذًا في القسم 12 في نادي المطالعة: نسبتهم $\frac{12}{28}=\frac37$ » ; « الكتابة الكسرية » $\frac{4{,}2}{0{,}35}$;
  - القيم المقرّبة (platform words) + example $1{,}6<\frac53<1{,}7$ ، $1{,}66<\frac53<1{,}67$;
  - قسمة على عدد عشري: $\frac{4{,}2}{0{,}35}=\frac{420}{35}=12$.

**M3 طريقة** — `objectives`: « أحوّل قسمة على عدد عشري وأحصر حاصلها إلى رتبة مطلوبة ». Steps:
1. $12{,}5\div0{,}35$: the divisor has 2 decimals → ×100 → $1250\div35=35{,}714\ldots$ → $35{,}7<\ldots<35{,}8$ ; $35{,}71<\ldots<35{,}72$.
   Q « في أيّ عدد نضرب الحدّين؟ » → 100.
2. « عشري أم لا؟ »: $\frac78=0{,}875$ (ends) ; $\frac56=0{,}833\ldots$ (does not) → the bracket at 0,01: $0{,}83<\frac56<0{,}84$.
3. A ratio: 18 of 45 pupils → $\frac{18}{45}=\frac25=0{,}4$ (exact).

Method box: « لحصر حاصل قسمة إلى $0{,}1$ أو $0{,}01$: نجعل المقسوم عليه طبيعيًا، ننجز القسمة ونواصلها بعد الفاصلة حتى الرتبة المطلوبة؛
الرقم الذي نتوقّف عنده يعطي القيمة بالنقصان، ونضيف وحدة من تلك الرتبة لنجد القيمة بالزيادة ».

**M4 أتمرّن** — `objectives`: « أتدرّب على النسبة والقسمة على عدد عشري والقيم المقرّبة »:

| # | Statement (platform numbers) | Answers | cites |
|---|---|---|---|
| 1 | صينية مقروط مقسّمة إلى 12 قطعة، أخذت سلمى 5 : ما الكسر؟ ولو قُسّمت إلى 24؟ | $\frac5{12}$ ; $\frac{10}{24}$ | `act-2` |
| 2 | 7 كراريس بـ 150 DA: ثمن الكرّاس عشري؟ حصره إلى 0,01 ؛ 12 علبة تزن 3 kg : كتلة العلبة كسرًا ثم عشريًا | لا ; $21{,}42<\frac{150}7<21{,}43$ ; $\frac{3}{12}=\frac14=0{,}25$ kg | `act-3` |
| 3 | أكمل: $63\div2{,}1=\frac{630}{21}=\ldots$ ؛ $\frac{8{,}4}{0{,}12}=\frac{\ldots}{12}=\ldots$ | 30 ; 840, 70 | `now-27`, `method-1` |
| 4 | = أم ≠ : $\frac38$ و $0{,}375$ ؛ $\frac23$ و $0{,}66$ ؛ $\frac94$ و $2{,}25$ ؛ $\frac5{11}$ و $0{,}45$ | = ; ≠ ; = ; ≠ | `ex-1`, `ex-2` |
| 5 | احسب $3{,}6\div0{,}9$ ، $9{,}1\div3{,}5$ ؛ نعلم أنّ $4416\div23=192$ : استنتج $441{,}6\div2{,}3$ ، $44{,}16\div0{,}23$ ، $4416\div0{,}23$ | 4 ; 2,6 ; 192 ; 192 ; 19200 | `now-29` ①, `deep-35` |
| 6 | أعط ثلاث كتابات كسرية محصورة بين $2{,}71$ و $2{,}72$ (برّر) | e.g. $\frac{543}{200}=2{,}715$ ، $\frac{19}{7}=2{,}714\ldots$ ، $\frac{87}{32}=2{,}71875$ | `deep-38` |

**M5 مسألة 1 (`lessonProblem`) — « زيت التعاونية »** — `objectives`: « أوظّف القيم المقرّبة لاختيار سعة مناسبة ».
- Statement: « تقتسم ثلاث عائلات بالتساوي $10$ لترات من زيت الزيتون، وتملك كلّ عائلة قارورة. »
- Q/A: 1) حصّة العائلة كتابةً كسرية → $\frac{10}{3}$ L ; 2) حصرها إلى 0,01 → $3{,}33<\frac{10}3<3{,}34$ ; 3) « هل تكفي قارورة سعتها
  $3{,}3$ L؟ وقارورة $3{,}5$ L؟ » → no ; yes (choose a value by excess). Illustration `tags`.

**M6 مسألة 2 — « نادي الدرّاجات »** — `objectives`: « أقسم على عدد عشري وأحصر النتيجة ».
- Statement: « قطع فريق النادي $25$ km في $1{,}5$ ساعة بسرعة منتظمة. »
- Q/A: 1) المسافة في ساعة واحدة كتابةً كسرية → $\frac{25}{1{,}5}=\frac{250}{15}=\frac{50}{3}$ km ; 2) حصرها إلى 0,1 → $16{,}6<\ldots<16{,}7$ ;
  3) « هل يقطع الفريق 17 km في ساعة؟ » → لا (أقلّ من 16,7).

**M7 مسألة 3 — « خزّان القرية »** — `objectives`: « أفسّر القيمتين المقرّبتين في وضعية تعبئة ».
- Statement: « يحتوي خزّان $1000$ لتر من الماء، نملأ منه قارورات سعة كلّ منها $1{,}5$ لتر. »
- Q/A: 1) عدد القارورات المملوءة تمامًا → 666 ; 2) حصر $\frac{1000}{1{,}5}$ إلى 0,1 → $666{,}6<\ldots<666{,}7$ ; 3) « ماذا تمثّل 667؟ » →
  the bottles needed for all the water (by excess, unit rank — recall of `qisma-iqlidiya-hasr`).

**M8 إختبار أولي** (literal epreuves in `Module08Itqan.jsx`, data in `FINAL`):

| # | Prompt | Key | Distractors (misconception) | LP |
|---|---|---|---|---|
| 1 | القيمة المقرّبة إلى $0{,}1$ بالنقصان لـ $\frac{11}{6}$ | $1{,}8$ | $1{,}9$ (SWAP) · $1{,}5$ (REMCOMMA: 11 = 6 × 1 + 5) · $1{,}83$ (RANK) | P4 |
| 2 | $3{,}6\div0{,}08=$ | $45$ | $4{,}5$ (ONETERM: ×10 on one term) · $0{,}45$ · $450$ | P3 |
| 3 | حصر $\frac57$ إلى $0{,}01$ | $0{,}71<\frac57<0{,}72$ | $0{,}7<\frac57<0{,}8$ (RANK) · $0{,}72<\frac57<0{,}73$ (ROUNDED: 0,714 → 0,72?) · $0{,}71<\frac57<0{,}73$ | P4 |
| 4 | أيّ كسر قيمته المضبوطة عدد عشري؟ | $\frac98$ | $\frac56$ · $\frac43$ · $\frac79$ | P1 |
| 5 | $9$ تلاميذ من $36$ في النادي: نسبتهم | $\frac{9}{36}=0{,}25$ | $\frac{36}{9}$ (RATIOFLIP) · $0{,}9$ · $\frac{9}{27}$ | P1 / P2 |

(Distractor 3b: 0,72 < 5/7 is FALSE because 5/7 = 0,714…; it encodes « the rounded value taken as the default value ».)

## 8. Misconceptions (`MISC-QARIBA-*`)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `REMCOMMA` | the remainder written after the comma (11 ÷ 6 = 1,5) | the clip at 1,5 leaves a visible leftover | test 1; L1 |
| `SWAP` | default and excess swapped | the flags « يكفي / لا يكفي » | tests 1, 3; L1–L2 |
| `RANK` | the value at the wrong rank | the dial's ticks | tests 1, 3 |
| `ROUNDED` | the nearest value given as the value by default | — (the overflow pill) | test 3; L2 |
| `EXACTAPPROX` | « 2,67 = 8/3 » | the red overflow pill | L2 (برّر) |
| `ONETERM` | ×10ⁿ applied to one term only | the unit switch with the rope unchanged | test 2; L1, L3 |
| `RATIOFLIP` | the ratio of a to b written b/a | — | test 5; L1 |

## 9. Practice bank (`content/practice/2am/kasr-hasil-qisma/`, 5 × 10)

**Corpus read by the planner (faithful candidates, term 1):**
- `2am-s1-91` ex 2 — vertical division 68,9 ÷ 1,2 (two decimals) and the table « إلى الوحدة / إلى 1/10, بالنقصان / بالزيادة » + the two
  brackets → 57 | 58 ; 57,4 | 57,5 (computed: 68,9 ÷ 1,2 = 57,41666…);
- `2am-s1-75` ex 2 — « أكمل » 13,05 ÷ 0,8 = 130,5/8 = … and the table at 0,1 → 16,3 | 16,4 (13,05 ÷ 0,8 = 16,3125);
- `2am-s1-87` ex 3 q 2 أ–ب — 134 ÷ 19 to three decimals, then 1,34 ÷ 0,19 and its values to 1/100 → 7,05 | 7,06 (the Euclidean q 1 was
  used by `qisma-iqlidiya-hasr`: never cite q 1 again);
- `2am-s1-68` ex 1 q 2 — 29,9 ÷ 10,6 to three decimals (2,820…), then M = 2,820 and its approximate values (the text layer prints
  « إلى 1,1 » and « 1,111 »: read the scan — almost surely 0,1 and 0,001; the « حصر M بين عددين طبيعيين » bullet belongs to
  `qisma-iqlidiya-hasr`'s bank already: `counted: false` here).

**Indexed, to read before citing:** `2am-s1-73` ex 2 (18,14 ÷ 0,7, bracket to 0,1, « تدوير » → `counted: false`), `-77` ex 2 (32,46 t of
sand — q 1 only, the trucks are `qisma-iqlidiya-hasr`'s), `-78` ex 2 (43,7 ÷ 1,1), `-79` ex 1 (225 ÷ 13 table to 1/10, 1/100 — the part
NOT used by `qisma`), `-88` ex 2 (37,6 ÷ 0,6), `-81` ex 2 q 1, `-66` ex 2 (15 ÷ 2,3), `-70` ex 2 q 3 (to 0,01), `-74` ex 2 q 3 (to 0,001),
`-83` ex 1 (true/false), misfiled `3am-s1-112` ex 2 / ex 6.

**Honest count of FAITHFUL `term_exam`: 4 read today; 8–10 once the lead has read the indexed papers.** It is the best-covered register of
the unit (« أنجز القسمة ثم أكمل الجدول »).

| Level | Content | Provenance |
|---|---|---|
| L1 | one division by a decimal (« أكمل » the ×10ⁿ writing), one approximate value | 2 term_exam (`-75` ex 2 q 1, `-87` ex 3 q 2 أ) · 6 modelled · 2 adapted (`now-27`, `ex-2`) |
| L2 | a bracket to 0,1 / 0,01 + « برّر » (why default, why not exact) | 1 term_exam (`-68` ex 1 q 2) · 7 modelled · 2 adapted (`self-3`, `ex-1`) |
| L3 | the full exercise: vertical division, the table of four values, the two brackets | 2–4 term_exam (`-91` ex 2, `-75` ex 2, then `-78`, `-88` after reading) · 4 modelled · 2 adapted (`deep-35`, `deep-46`) |
| L4 | mobilises `qisma-iqlidiya-hasr` (same term): Euclidean division then the decimal division and the 0,01 bracket; the Euclidean steps `counted: false` (validator rule: every counted question's LP belongs to this lesson) | 1–2 term_exam (`-79` ex 1, `-74` ex 2) · 8 modelled |
| L5 | « الوضعية الإدماجية »: sharing, speed, filling — choose the value by default or by excess and justify (decision) | 0–1 term_exam (`3am-s1-112` ex 2, read first) · 8 modelled · 1–2 adapted (`act-3`, `ict-2`) |

Answer types: `decimal` (Algerian comma), `rational`, `choice`, `multiChoice` (`self-3` style), `selfCheck` for « برّر ». **Oracle**
`scripts/practice-oracle/kasr-hasil-qisma.mjs`: decimals as BigInt scaled integers, its own long division; checks every bracket
`b·lo ≤ a < b·hi` (strict when not exact) and every distractor false.

## 10. Risks & owner questions

1. **P1–P3 change meaning** (README Q4): the drafts rebuild published 1AM lessons. Option for the owner: merge P2 into P3 (3 LPs). Default:
   4 LPs as written.
2. **`2am.m1.r05 → r06` and `qisma-iqlidiya-hasr`'s « راجع » card** (README Q2): once this lesson is published, the published
   `qisma-iqlidiya-hasr` shows « راجع: الكسر: نسبة وحاصل قسمة وقيم مقرّبة » as a LINK before its own start — a lesson the student has not
   reached. Options: (a) leave it (the card is a review panel; the lesson only names « القيمة المقرّبة »); (b) change the link to
   `consolidates` from `1am.m3.r04` only; (c) drop `r05 → r06` (r06 is in both lessons anyway). Default (a), flagged.
3. **Missing link `1am.m3.r03 → 2am.m1.r05`** (decimal division by a natural): measured by M0 item 6 without an edge.
4. **`2am-s1-68`'s « 1,1 / 1,111 »** reading (corpus, not the book).
5. **Small ticks at the cm rank** on 1024×768: only the zoomed decimetre is drawn; a screenshot at r1 cm rank must still read.

## 11. Generator checklist

- [ ] `build-extraction.py`: re-read PDF pp. 21, 23, 24, 26, 27, 30, 31, 34 at 200 dpi for this lesson's elements; set `verified: True`
  with `Fraction` / `Decimal` asserts; **move destinations**: `act-2`, `act-3` → module 4; `know-1c`, `know-1d`, `know-1e` → 2;
  `method-1` → 4 (and 0 for the recall item); `method-2` → 3; `now-27` → 4; `now-29` item 1 → 4; `ex-1`, `ex-2` → 4; `ex-3`…`ex-6`,
  `self-1`…`self-4`, `self-9`, `ict-2`, `ict-3` → `None` (bank); `deep-35`, `deep-38` → 4; **`deep-46` → this lesson, `None`** (from L5);
  **`self-12` → `jida-kasrayn`** (README); `prep` items 1, 2, 3, 4, 6, 7, 11 → module 0. Copy the README boundary block into the header.
  Add the README discrepancies (`scope`, `ex-30`, `deep-45`). Rebuild; `check:textbook` lists only the other lessons' elements pending.
- [ ] `fractions2.js` (new) E1 functions + `fractions2.test.js`.
- [ ] Lab `mooring-lines`: type in `manipulationTypes.js`, theme `harbor` in `VISUAL_THEMES`, `levels.js`, registry, strings
  `lesson.manipulation.json › mooringLines`, `logic/mooringLines.js` + test (sweep a ∈ {0,1 … 99,9}, b ∈ 2…12 and decimals: the bracket is
  `decimalQuotientBracket`, verdicts by exact products, the dial lock, the unit switch invariant), `operations/MooringLines.jsx`,
  render test, LabCoach, lab prototype (§6ter: `lab-rollout-status.mjs --lesson kasr-hasil-qisma` prints ✅), contract section
  `MANIPULATION_CONTRACT.md` (next free §2…), DNA row, screenshots (initial, a fit with leftover, an overflow, the dial refined, the exact
  landing r2, the unit switch a1, the formal phase) at 768×1024, 1024×768, 1280×800, 1366×768 — reviewed and iterated.
- [ ] Lesson: 9 modules with `objectives`; header comment (entry chosen, (a)–(c) rejected, order of ideas, LP history); « تذكّر » boxes
  (three, all with links: published); « أستعدّ » measures `1am.m3.r04` (items 5–6); `content.test.js` (BigInt, own division);
  knowledge items with `memo` (C2–C3).
- [ ] Catalogue: final `pointsToLearn`, `pointPrerequisites` (§2), `durationMinutes`, `difficulty`, `icon`.
- [ ] `generate:lesson-index`, `generate:learning-net`; e2e `apps/web/e2e/lesson-kit/2am-kusur-amaliyat-kasr-hasil-qisma.mjs`.
- [ ] Gates: `npm test`, `validate:lessons --strict`, `check:textbook`, `check:lessons`, `build`; the unit `prepDiagnostic.test.js`.
- [ ] Bank (50) + oracle + `active.json`, `exam-style.json`, `misconceptions.json` (`MISC-QARIBA-*`).
- [ ] Publish (guide §11; nothing left `draft`), commit `feat(lessons): kasr-hasil-qisma`.

## 12. Successor connection (what to add later, in published lessons)

- **`qisma-iqlidiya-hasr` (2AM, published, same unit)** — the day this lesson is published:
  - its `lesson.config.js › teachingScope.exclude` line « القسمة العشرية والقيم المقرّبة إلى 0,1 أو 0,01 (الدرس التالي) » stays true;
    add the code comment « درس kasr-hasil-qisma » for the audit;
  - its knowledge item `qiyam-muqarraba` (Module02 step 2): add, after the brick, a one-line « للمزيد » note for the TEACHER memo only
    (not a student forward link — the panel already shows it); no LP edge from `qisma-iqlidiya-hasr` toward this lesson (it would make a
    cycle with this lesson's P4 ← `2am_qisma-iqlidiya-hasr_P2`, and the book order is qisma → kasr);
  - its « أستعدّ » platform items `taqrib` (7,4 → 7 / 8) measure the 1AM base, unchanged;
  - its « راجع » card toward this lesson lights up by itself (owner question 2).
- **3AM `hasr-adad-ushri`** (published): no net link today. If the owner adds `2am.m1.r05` / `r06 → 3am.m5.x1` (consolidates), write
  `3am_hasr-adad-ushri_P2 ← 2am_kasr-hasil-qisma_P4` and `3am_hasr-adad-ushri_P4 ← 2am_kasr-hasil-qisma_P4`, and turn its 1AM-only recall
  into « تذكّر — السنة الثانية » with `getLessonPath('kasr-hasil-qisma')`.
- **3AM `adad-natiq`** (published) recalls « decimal or not » from 1AM `hasil-qisma-kasr` (`RECALL_1AM`): unchanged.
- No 4AM edge.

## 13. Generator notes (2026-10-28)

Fixes and decisions made while generating (the plan stays the design; these are minimal corrections):
- **M8 test 3** (`5/7` at `0,01`): two of the planned distractors were TRUE inequalities (`0,7 < 5/7 < 0,8`, `0,71 < 5/7 < 0,73`). Replaced by FALSE ones: `0,72 < 5/7 < 0,73` (ROUNDED) and `0,70 < 5/7 < 0,71`. The same rule rewrote the bank (no loose-but-true option).
- **M8 test 2** covers P2 AND P3 (`learningPointIds: [P2, P3]`) so every الكفاءة has an epreuve; test 5 is P1.
- **`fractions2.js`**: `clearDecimals` returns `{ ka, kb, k, a10, b10 }` (adds `ka`, `kb`); `decimalQuotientBracket(a, b, k)` and `fitsAtRank(a, b, q)` take decimal strings or `{ n, k }`.
- **Lab**: the clip lives on a separate wooden BAR under the tape (not on the rope) at both levels — a `share` task also shows a small clip glyph at the end of the first piece; the dial labels are « 1 m · 0,1 m · 0,01 m » (`share`) and « 1 · 0,1 · 0,01 » (`count`); `k1` (module 2) is a task id with its own chain (`write, names, rule`). `ruleUnit` (a3) asks which fractional writing gives the same quotient with a natural divisor.
- **Textbook coverage**: `ex-3…ex-6`, `self-1/2/4/9`, `ict-2` are cited through `alsoSource` of the module-4 exercises that adapt their idea (extra rows: numerator, equal writings, « the number × 7 giving 150 », the regular heptagon's side from its perimeter, a number on a graduated half-line). `extraction.json`: `know-1e` verified against the 120 dpi render of PDF p. 23; the other elements stay `verified: false` (own numbers throughout).
- **pointPrerequisites** written as planned: `P2 ← P1`, `P3 ← P2`, `P4 ← P3 + 2am_qisma-iqlidiya-hasr_P2` (acyclic: no edge from `qisma-iqlidiya-hasr` toward this lesson).
- **Bank**: 10 `term_exam` (more than the 4 read at planning: `-78`, `-88`, `-79`, `-74` and `3am-s1-112` were read in the scan), 32 `term_exam_modelled`, 8 `adapted`, no `platform_addition`.
