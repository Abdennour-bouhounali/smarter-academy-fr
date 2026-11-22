# Plan — `ibara-harfiya-intaj` « إنتاج عبارة حرفية واستعمالها » (2AM unit 4, entry 1 of 4)

Read the unit [`README.md`](README.md) first. This entry SEEDS the unit (`_unit/`, the whole-unit extraction, the `substitution.js`
extension and `equation2.js` E1). The 2AM unit-1 lessons (`silsila-*`, `wasf-silsila-hisab`, `tawzi-darb-jam-tarh`) are published.

## 1. Identity

- **Code** `ibara-harfiya-intaj` · **title** « إنتاج عبارة حرفية واستعمالها » · unit `mafhum-muadala` · catalogue order 18 · `lesson`.
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/mafhum-muadala/ibara-harfiya-intaj/`.
- **Textbook pages** (PDF = book − 3): act-1, act-2 p. 56 (PDF 53); know-1, know-2 p. 58 (PDF 55); method-1, method-2, now-59 p. 59
  (PDF 56); prep p. 55 (PDF 52, items 1–5, 10); ex-1 … ex-26 pp. 62–63; self-1 … self-7, self-10 p. 65; deep-44 … deep-48, deep-51,
  deep-52 p. 66; opener + challenge p. 54. Catalogue `textbookRef` (activity 56, knowledge 58, method 59) is right.
- `durationMinutes` ≈ 85; `difficulty` « متوسط »; icon 🐝.
- **Seeds the unit: yes** (README « Seeding »). Pair 1, lane B (port 5174); the other lane runs `talim-mustaqim-mudarraj-2` (unit 3).

## 2. Programme & net

**Item:** none (`programmeItems: []`, owner decision D10; the queue calls it « isolée »). The book teaches it; its nearest items are
`1am.m5.r08` (تطبيق قاعدة حرفية), `1am.m5.r09` (إنتاج عبارة حرفية بسيطة) and, downstream, `3am.m5.r03` (حساب قيمة عبارة حرفية) — none
is declared (README owner question 3).

| LP | Draft (verbatim) | Final | Change and reason |
|---|---|---|---|
| P1 | التعبير عن وضعية بعبارة حرفية يمثّل فيها حرف عددا مجهولا أو متغيّرا، مثل محيط مربّع $4 \times x$ | التعبير عن وضعية بعبارة حرفية يمثّل فيها حرف عددًا مجهولًا أو متغيّرًا، ومنها تعميم نمط متزايد، مثل محيط مربّع ضلعه $x$: $4x$ ، وعدد الأعواد في صفّ من $n$ خلية: $5n+1$ | Adds GENERALISING a pattern (book method-2, challenge, deep-47 — the lab). |
| P2 | حساب قيمة عبارة حرفية من أجل قيم معطاة للحرف (يدويا أو بجدول إكسل) | حساب قيمة عبارة حرفية بحرف أو بحرفين من أجل قيم معطاة باحترام أولوية العمليات، وتنظيم القيم في جدول، مثل قيمة $3x+4y+1$ من أجل $x=2$ و $y=3$ | « إكسل » → « جدول » (README Q9); two letters (book ex-17, ex-25, ex-26). |
| P3 | تبسيط كتابة عبارة حرفية بحذف إشارة × أمام حرف أو قوس وباستعمال $1 \times a = a$ و $0 \times a = 0$ والكتابتين $a^2$ و $a^3$ | تبسيط كتابة عبارة حرفية: حذف إشارة × أمام حرف أو قوس ($7\times a=7a$ ، $7\times(a+1)=7(a+1)$)، واستعمال $1\times a=a$ و $0\times a=0$ و $a\times b=b\times a$ ، والكتابتين $a^2$ و $a^3$ ، وتجميع حدود مثل $2a+5a-3a=(2+5-3)a=4a$ | Adds a × b = b × a and the like-terms FACTORISATION (book know-2 example a, ex-22), read as unit-1 distributivity (recalled). |

**Review items for « أستعدّ »:** `reviewLinksForLesson` is empty (no item). « أستعدّ » measures what the book's أستعدّ (p. 55) uses —
the published unit-1 lessons — and the planned 1AM r09 (text only):

| Measured | Home | Status | Items |
|---|---|---|---|
| chains without / with brackets (`2am.m1.r01`, r02) | `silsila-bidun-aqwas`, `silsila-bi-aqwas` | published → advice links | 1, 2, 3 |
| the last operation names a chain | `wasf-silsila-hisab` | published → link | 4 |
| k × (x ± b) = kx ± kb | `tawzi-darb-jam-tarh` | published → link | 5 |
| « مجموع a و b » written a + b (`1am.m5.r09`) | `intaj-ibara-harfiya` (1AM) | coming_soon → text only | 6 |

Extra `priorKnowledge`: `silsila-amaliyat-2am`, `wasf-silsila-2am`, `tawzi-2am`, `ibara-harfiya-1am` (planned 1AM: « تذكّر » text only),
`muhit-murabba` (perimeter of a square).

**noRebuild:** none from the net (no item). In spirit, 1AM r09 is recalled (« تذكّر — السنة الأولى », no link: « $a+b$ ، $4\times c$ »)
and the notation 3 × x = 3x NAMED in `tawzi-darb-jam-tarh` P3 is recalled WITH a link (unit-1 owner question 1 default).

**pointPrerequisites:**
- intra: P2 ← P1, P3 ← P1;
- same grade, NO net link (README Q4, default yes): **P1 ← `2am_wasf-silsila-hisab_P3`** (write a chain from a calculation program —
  the program → expression step), **P3 ← `2am_tawzi-darb-jam-tarh_P3`** (the notation and k·a + m·a as a factorisation);
- no 1AM edge (the 1AM lessons are `coming_soon`, LEARNING_NET §4.8).
- `prerequisiteLessonCodes`: `[]` → **`['wasf-silsila-hisab', 'tawzi-darb-jam-tarh']`** (README Q4).

**Where it is used next:** inside the unit, `hall-mushkil-muadala` P1 (an equation starts with an expression) and
`ikhtibar-musawat-mutabayina` P1–P2 (both members are expressions; « equal for every value »); the synthesis; 3AM
`qimat-ibara-harfiya` / `tabsit-hadhf-aqwas` through 1AM r08 and 2AM unit 1 (no net link to this lesson).

## 3. Boundary

**Owns:** see README. **Leaves:** solving (`hall`); testing an equality, the counterexample, « always equal » (`ikhtibar` P2 — this
lesson only OBSERVES two writings giving the same table, the lab says « في كلّ الأعمدة التي رسمتها », never « مهما كان n »);
expanding (a + b)(c + d), removing brackets preceded by − (3AM); negative values (README Q10: every value ≥ 0 in modules and in the
counted steps of the bank).

## 4. Textbook analysis (reference, not script)

| Element | What it asks | Idea kept | Platform use |
|---|---|---|---|
| `challenge` | n × n apple trees, a ring of windbreak trees: a count for any n | a growing pattern counted for ANY n | the lab's idea (own world: a row of hexagonal wax cells); the unit card rewritten (README) |
| `act-1` | square tables joined in a row, chairs on the free sides: 1, 2, 3, 10, 51 tables; a sentence; a formula | far values force a rule | **Not the entry** (the figure is drawn; nothing moves). M4 item 1 (own: rectangular canteen tables, 6n + 2) |
| `act-2` | club 2000 + 150 per session; a spreadsheet | a fixed part + a part per unit; a table | M5 (own: municipal pool card 1500 + 120x, table x = 0, 1, 2) |
| `know-1` | definition; 4 × x; a program → 2x − 3 | the letter, the program | M2 (own examples) |
| `know-2` | conventions, 1·a, 0·a, a·b = b·a, a², a³; 2a + 5a − 3a = 4a; 10², 10³ | the simplified writing | M2 rules, M3 step 4 |
| `method-1` | 50 + x stamps; 5x cars; a perimeter 22 + 6x | from words to x | M3 step 1 (own: marbles, pencil boxes, an isosceles triangle) |
| `method-2` | border tiles 4n + 4 (n ambiguous — README discrepancy 3) | count a border two ways | M3 step 2 (own: a square basin of n × n tiles, 4n + 4 = 4(n + 1)) |
| `now-59` | AB = x + y + 2; program « × 2, + 13 » at 0 and 5 | two letters; a program's value | M4 items 4, 5 |
| `prep` 1–5, 10 | chains; « the sum of a and b »; a pentagon's perimeter | prerequisites | M0 (own), item 10 → M4 item 4 |
| `ex-1`, `ex-2`, `ex-5`, `ex-13` | n → half, next, previous, double, square; a list → 9 × n + 7; a length 8 + x; a program and three pupils' writings | writings in n | M4 items 2, 3, 6 + bank |
| `ex-14`, `ex-17`, `ex-19` | values of 3x + 5; of 3x + 4y + 1; simplify ½ × a, 5 × (a + b), 2 × a × a, 7 × a × b | P2, P3 | M4 items 5, 6 |
| `ex-21`, `ex-22` | simplify; 5x + 2x + 3 × 8 (terms, common factor, (… + …)x) | P3 | M4 item 6 + bank |
| `deep-46` | a 10 cm string rectangle, x and 5 − x | a side from the other | M6 (own: 24 m of rope, x and 12 − x) |
| `deep-47` | matchstick triangles 2n + 1 | a pattern | bank L3 (the lab already does a pattern) |
| `deep-52` | program « n + (n + 1), × 2, − 2, ÷ 4 » gives back n | a program that always gives the same | M7 (own: « + 4, × 2, − 2x » → always 8) |
| `opener` | al-Khwarizmi's « شيء » | history | M2 « هل تعلم » |
| `self-1` … `self-7`, `self-10`, `ex-3`, `ex-4`, `ex-6` … `ex-12`, `ex-18`, `ex-20`, `ex-23` … `ex-26`, `deep-44`, `deep-45`, `deep-48`, `deep-51` | QCM, lengths, perimeters, angles, values, equal writings | practice | bank (L1–L4), adapted |

## 5. Design

**The lesson in one paragraph.** At grandfather's apiary, Yacine builds a model of a honeycomb for the school science fair: a ROW of
hexagonal cells made of wax rods, two neighbouring cells SHARING a rod. One cell takes 6 rods, two take 11, three 16. The fair asks for a
row of 40 cells — the frame holds only 8, and the tray only 50 rods: drawing and counting stop working. Seen in the drawing, each new
cell adds 5 rods to a first rod: **5n + 1** rods for n cells (Rania counts « 6 for the first, then 5 each »: 6 + 5(n − 1) — the same
numbers in every column of the table). For 40 cells: 5 × 40 + 1 = 201. A guess « 6n » is refuted by the drawing: at n = 3 it says 18,
the row shows 16 — the two shared rods counted twice blink red. In the advanced level the strip has TWO staggered rows (8n + 3 rods) and
a second letter appears (a row of n cells and a strip of m columns: 5n + 1 + 8m + 3).

**Entry point — candidates compared:**
- (a) **The book's act-1** (tables and chairs drawn for 1, 2, 3 tables): the figures are GIVEN, nothing is under the hand. Rejected → M4.
- (b) **The book's تحدّ** (apple trees in squares with a windbreak ring): a square pattern, four figures given; its idea is kept, its
  world is the book's. Rejected as the world.
- (c) **A calculation machine** (choose a number, apply a program): `linear-machine` (4AM) and the unit-1 programs already do it; it
  produces a value, not the need for a letter.
- (d) **A row the hand BUILDS until it cannot** (shared walls make « 6 per cell » wrong, the far value is out of reach of the frame and
  the tray): the letter is NEEDED, the drawing refutes a wrong rule. **Chosen.**
  `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'apiary' }`.

**Order of ideas:** build 1, 2, 3, 4 cells and read the rod counter → the table n / rods → « 40 cells? » out of reach → a rule in words →
the rule with a letter (5n + 1) → judged on every built column → its value at 40 (P1, P2) → a second counting (6 + 5(n − 1)) gives the
same table → معارف (the literal expression, the conventions) → طريقة (in terms of x, a border counted two ways, a program, simplifying)
→ practice, مسائل, test.

**Contexts (values):** the apiary (patience, care of bees, a grandfather's craft), the school canteen (sharing a meal), the municipal
pool (health, saving), a rope fence for the school garden (making the most of a resource), a mind-reading program (fun of mathematics).

## 6. Lab — `wax-cells` « خلايا الشمع » (new type)

**Drawn world `apiary`** (new theme, kind `patterns`, label « منحل الجدّ: صفّ من خلايا الشمع السداسية »):
- grandfather's apiary at the edge of an orchard (wooden hives, flowers, a few drawn bees — never on the children); a wooden FRAME
  (the model's support) holding at most 8 cells per row; a TRAY of wax rods with a visible count (50 at مبتدئ);
- each cell is a hexagon of 6 golden rods; a new cell snaps to the row's end and SHARES its left rod with the previous cell (the shared
  rod drawn once, a little thicker);
- a ROD COUNTER (a small wooden slate) and, after the first three cells, a TABLE panel « عدد الخلايا n / عدد الأعواد » that fills one
  column per built row length;
- KidFigure Yacine (boy, hoodie) builds at مبتدئ; Rania (girl, hijab + tunic) holds the slate and counts at متقدم; grandfather is never
  drawn (« قال الجدّ » in a bubble).

**The variable in the hand: n, the number of cells in the row** (1 … 8; at متقدم a second row of m cells, 0 … 6), then the typed rule.

**Gestures (three paths):** drag a cell from the tray onto the row's end (snaps), drag the last cell back to the tray; −/+ steppers
« خلية »; keyboard (←/→). « اكتب القاعدة » opens a field with the chips n, digits, + − × ( ) (the 2AM `parseExpression` letters).
« ماذا يقول الصفّ؟ » (Enter) judges the rule.

**The question and its judge:** « اكتب عدد الأعواد بدلالة n » — the typed rule is evaluated (`equation2.valueTable`) at EVERY n the
student has built (and at least n = 1 … 4): accepted iff it equals the drawn count at each; refused models drawn on the row:
`perCell` (6n — at the first built n ≥ 2 the shared rods blink red, « عُدّ مرّتين »), `noFirst` (5n — the first rod drawn dashed, « نسيته »),
`plusSix` (5n + 6), `recursive` (« الأعواد السابقة + 5 » typed as text — accepted as a SENTENCE in the lesson's words, then the lab asks
« وبدون الصفّ السابق؟ »). A refused rule shows the table with a red column where it differs.

**Opening (no title):**
- Context: « يصنع ياسين نموذج قرص شمع لمعرض العلوم: خلايا سداسية متلاصقة من أعواد الشمع، والخليتان المتجاورتان تشتركان في عود. »
- Question: « ابنِ صفوفًا من خلية، ثمّ خليتين، ثمّ ثلاث… واكتب قاعدة تعطي عدد الأعواد لصفّ من n خلية، ثمّ احسب عددها لـ 40 خلية. »
- `lead`: « الإطار لا يتّسع لأكثر من 8 خلايا: القاعدة هي التي ستعدّ الأربعين. »

**Levels** (same `objective` on both):

*مبتدئ* (one row; the counter visible; the table appears from the third cell):

| id | Task | Built | End state |
|---|---|---|---|
| `w1` | build 1, 2, 3 cells, read the counter | n = 1, 2, 3 | **6, 11, 16** |
| `w2` | write the rule (judged at every built n) | n ≤ 8 | **5n + 1** (or any equal writing: 6 + 5(n − 1), 1 + 5n) |
| `w3` | the far value | — | **5 × 40 + 1 = 201** rods (the tray holds 50: « لا يكفي ») |

*متقدم* (PREDICT: the counter is hidden until the student types the count for the built row; two rows):

| id | Task | End state |
|---|---|---|
| `a1` | a strip of TWO staggered rows of n cells (n = 1 … 6) | **11, 19, 27** → **8n + 3** |
| `a2` | Rania's writing 6 + 5 × (n − 1) vs Yacine's 5n + 1 on the same row | the same value in every built column (observation only) |
| `a3` | a row of n cells AND a strip of m columns (two letters) | **5n + 1 + 8m + 3** ; n = 6, m = 4 → **31 + 35 = 66** |

All counts verified by an edge count of the drawn hexagons (planner, 2026-10-29: 5n + 1 and 8n + 3 for n = 1 … 8).

**« جرّب أعدادك » (always open):** n (and m) free in range, any typed rule judged on the built columns; never counted.

**LabCoach** (`sa.labCoach.wax-cells.off`): 1 `drag` « اسحب خلية من الصينية إلى آخر الصفّ » · 2 `count` « اقرأ عدد الأعواد على اللوح »
· 3 `table` (first time the table appears) « كلّ عمود: عدد الخلايا وعدد أعوادها » · 4 `rule` « اكتب القاعدة بالحرف n » · 5 `far` « الإطار
ممتلئ: احسب بالقاعدة » · 6 `free`.

**Lab prototype (§6ter):** chains from the student's run:
- w1: « كم عودًا أضافت الخلية الثانية؟ » (5) → « ولماذا ليس 6؟ » (one rod shared);
- w2: « ما العدد الذي يتكرّر مع كلّ خلية؟ » (5) → « وما العدد الذي يبقى وحده؟ » (1) — ends on the RULE « $5n+1$ »;
- w3: « كم عودًا لـ 40 خلية؟ » (201) → « هل تكفي الصينية؟ » (no);
- a1: « كم عودًا تشترك فيه الطبقتان؟ » ; a2: « هل تعطي الكتابتان العدد نفسه في كلّ عمود رسمته؟ » ; a3: « ما الحرفان؟ وما قيمة العبارة من
  أجل $n=6$ و $m=4$؟ ».
`LabStepper`, `useStepCelebration`, « إعادة », `playSfx` (`gesture` per snap, `flag` on an accepted rule, `over` on a refused one),
full screen, `guided={!!chain}`, render test over every task.

**Wrong moves made VISIBLE:** `perCell` (shared rods blink red, the counter of the rule shows 18 vs the slate's 16), `noFirst` (the first
rod dashed), `plusSix`, a rule judged only on n = 1 (« جرّب القاعدة على صفّ آخر »).

**Formal phase:** « عدد الأعواد $=5\times n+1=5n+1$ » ; « من أجل $n=40$: $5\times40+1=201$ » ; at متقدم « $8n+3$ » and
« $5n+1+8m+3$ ».

**Core maths:** `substitution.js` (letters option) + `equation2.js` E1 (`valueTable`, `firstMismatch`, `sameCount`). Lab logic
`logic/waxCells.js`: `tasksOf`, `rodsOf(rows)` (the drawn count — an edge count of the hexagon geometry, NOT the formula), `snap(state)`,
`lift(state)`, `judgeRule(state, text)` → `{ ok, model, column }`, `coachOf`; events `{ kind: 'build', task, n, m }`,
`{ kind: 'rule', task, text, ok, model }`, `{ kind: 'predict', task, value, ok }`, `{ kind: 'far', task, value, ok }`,
`{ kind: 'solved', task }`, `{ kind: 'custom', free: true }`.

**Why not another lab (DNA §12):**
- 1AM `tile-yard` carries ONE unit tile to measure an area; 4AM `square-tiling` holds k tiles per side of a square of area n — here the
  hand GROWS a pattern and the shared rods are the resistance.
- 4AM `linear-machine` (cards into a hopper, x ↦ a·x) and 3AM `marble-run` (a value down an expression tree) compute a GIVEN
  expression; here the expression is the student's product, judged by the drawing.
- 2AM `kit-packer` fills k identical kits from dispensers (k × a + k × b): nothing is shared between kits.
- The book's matchstick triangles (deep-47) are a bank exercise, not a lab.

**Screen budget:** 1024×768: the frame ≈ 420 × 180 px (8 cells of 50 px, two rows at متقدم), the tray and the slate in one row under it,
the table panel (≤ 8 columns) and the rule field in the scene's lower band. Snap targets ≥ 44 px.

**DOM:** `[data-wax-cells][data-level][data-task][data-n][data-m][data-solved]`, `[data-wc-tray]`, `[data-wc-cell=<row>-<i>]`,
`[data-wc-rod=<id>][data-shared][data-blink]`, `[data-wc-counter]`, `[data-wc-table]` + `[data-wc-col=<n>][data-verdict]`,
`[data-wc-rule]`, `[data-wc-judge]`, `[data-wc-model]`, `[data-wc-free]`, `[data-wc-formal]`.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق من سلاسل العمليات والخاصية التوزيعية قبل العبارات الحرفية »:

| # | Statement | Key | Measures |
|---|---|---|---|
| 1 | $40-12-8=20$ | ✓ | `silsila-bidun-aqwas` |
| 2 | $40-(12-8)=20$ | ✗ (36) | `silsila-bi-aqwas` |
| 3 | $15+3\times4=72$ | ✗ (27) | `silsila-bidun-aqwas` |
| 4 | « $5\times(8+2)$ جداء » | ✓ | `wasf-silsila-hisab` |
| 5 | $4\times(x+3)=4x+12$ | ✓ | `tawzi-darb-jam-tarh` |
| 6 | « مجموع العددين $a$ و $b$ يُكتب $a\times b$ » | ✗ ($a+b$) | 1AM r09 (planned) |

**M1 نشاط — « خلايا الشمع »** — `objectives`: « أكتشف كيف يعدّ حرفٌ ما لا أستطيع رسمه ». Lab on top; then the trace and the bricks:
`harf-yaud` « الحرف n يمثّل عدد الخلايا » (w2) · `qaida-5n1` « $5n+1$ » (w2) · `qima-40` « $5\times40+1=201$ » (w3) ·
`kitabatan` « كتابتان والعدد نفسه في الجدول » (a2) · `harfan` (a3).

**M2 معارف** — `objectives`: « أسمّي العبارة الحرفية وأكتبها مبسّطة ».
- Lab ALONE (`levels={false}`, w2 with n ≤ 6) → **5n + 1**, at n = 6 → 31.
- Boxes: « تذكّر — السنة الأولى » (1AM r09, no link: « مجموع $a$ و $b$: $a+b$ ؛ أربعة أضعاف $c$: $4\times c$ ») · definition (platform
  words: « العبارة الحرفية عبارة تكون فيها بعض الأعداد ممثّلة بحروف ») · « تذكّر — الخاصية التوزيعية » (`tawzi-darb-jam-tarh`, link:
  $3\times(x-5)=3x-15$) · conventions ($5\times n=5n$ ، $3\times(n+2)=3(n+2)$ ، $1\times a=a$ ، $0\times a=0$ ، $a\times b=b\times a$) ·
  $a\times a=a^2$ « $a$ مربّع » ، $a\times a\times a=a^3$ « $a$ مكعّب » · « هل تعلم » (`opener`, platform words: al-Khwarizmi's « شيء »).

**M3 طريقة** — `objectives`: « أعبّر بحرف عن وضعية وأعمّم نمطًا وأبسّط الكتابة ». Steps:
1. in terms of x: « كان مع كريم $35$ كرية وربح $x$ كرية » → $35+x$ ; « $6$ علب في كلّ منها $x$ قلمًا » → $6x$ ; an isosceles triangle with
   legs $x$ and base $7$ → $2x+7$ ;
2. a border counted two ways: a square basin of $n\times n$ tiles with a frame around it → $4n+4$ (four sides + four corners) and
   $4(n+1)$ (four equal strips) — at $n=5$: $24$ both (README discrepancy 3: « $n$ بلاطة على ضلع الحوض، والإطار حوله »);
3. a program: « اختر عددًا، اضربه في $3$، أضف $5$ » → $3x+5$ ; at $x=4$ → $17$ ;
4. simplify: $2\times a+5\times a-3\times a=(2+5-3)a=4a$ ; $10\times10=10^2=100$ ; $10\times10\times10=10^3=1000$.

Method box: « لكتابة عبارة حرفية نسمّي المتغيّر بحرف، ونكتب الحساب كما لو كان الحرف عددًا، ثمّ نبسّط الكتابة ».

**M4 أتمرّن** — `objectives`: « أتدرّب على إنتاج العبارات الحرفية وحساب قيمها وتبسيطها »:

| # | Statement (own numbers) | Answers | cites |
|---|---|---|---|
| 1 | طاولات مطعم المدرسة مستطيلة تُصفّ متلاصقة: 3 كراسٍ على كلّ جانب طويل وكرسيّ على كلّ طرف حرّ. كم كرسيًا لـ $1$، $2$، $10$، $51$ طاولة؟ اكتب القاعدة | $8$ ، $14$ ، $62$ ، $308$ ; $6n+2$ | `act-1` |
| 2 | $n$ عدد طبيعي: نصفه، الذي يليه، الذي يسبقه، ضعفه، مربّعه، مكعّبه | $\frac n2$ ، $n+1$ ، $n-1$ ، $2n$ ، $n^2$ ، $n^3$ | `ex-1` |
| 3 | قائمة: $7\times4+3$ ، $7\times5+3$ ، … ، $7\times10+3$ — تعليمة واحدة | $7n+3$ ($n$ من $4$ إلى $10$) | `ex-2` |
| 4 | محيط المثلث المتساوي الساقين (الساقان $x$، القاعدة $7$) ثمّ من أجل $x=6{,}5$ ؛ $AB=x+y+2$ | $2x+7$ ; $20$ | `prep` 10, `now-59` ① |
| 5 | $A=4x+3$ من أجل $x=0$ ، $2$ ، $2{,}5$ ؛ $B=3x+2y$ من أجل $x=4$ و $y=5$ | $3$ ، $11$ ، $13$ ; $22$ | `ex-14`, `ex-17` |
| 6 | بسّط: $3\times a\times b$ ؛ $1\times x+0\times y$ ؛ $2a+3a+a$ ؛ $a\times a\times5$ | $3ab$ ؛ $x$ ؛ $6a$ ؛ $5a^2$ | `ex-19`, `ex-21`, `ex-22` |

**M5 مسألة 1 (`lessonProblem`) — « بطاقة المسبح البلدي »** — `objectives`: « أكتب عبارة لجزء ثابت وجزء لكلّ حصّة وأحسب قيمها في جدول ».
- Statement: « يدفع المشترك في المسبح البلدي $1500$ DA للتسجيل السنوي و $120$ DA لكلّ حصّة. »
- Q/A: 1) عبارة المبلغ بدلالة عدد الحصص $x$ → $1500+120x$ ; 2) من أجل $10$ ، $25$ ، $50$ حصّة → $2700$ ، $4500$ ، $7500$ DA ; 3) أكمل
  الجدول $x=0, 1, 2$ → $1500$ ، $1620$ ، $1740$ ; 4) « ماذا يمثّل العدد $1500$ في الجدول؟ » → المبلغ من أجل $x=0$ (التسجيل وحده).

**M6 مسألة 2 — « حبل حديقة المدرسة »** — `objectives`: « أعبّر عن بُعد بدلالة الآخر وأحسب مساحة ».
- Statement: « بحبل طوله $24$ m نحيط قطعة مستطيلة من حديقة المدرسة، أحد بُعديها $x$. »
- Q/A: 1) البعد الآخر → $12-x$ ; 2) المساحة → $x(12-x)$ ; 3) من أجل $x=5$ ثمّ $x=6$ → $35$ m² ، $36$ m² ; 4) « لماذا لا يمكن أن يكون
  $x=12$؟ » → البعد الآخر $0$.

**M7 مسألة 3 — « برنامج الساحر »** (`deep-52` redesigned) — `objectives`: « أكتب برنامج حساب بعبارة وأفسّر لماذا تكون النتيجة نفسها ».
- Statement: « اختر عددًا، أضف إليه $4$، اضرب الناتج في $2$، ثمّ اطرح ضعف العدد الذي اخترته. »
- Q/A: 1) طبّق على $3$ ، $10$ ، $0$ → $8$ في كلّ مرّة ; 2) العبارة بدلالة $x$ → $2(x+4)-2x$ ; 3) بسّطها → $2x+8-2x=8$ (« $(2-2)x=0\times x=0$ »)
  ; 4) « هل يمكن أن يعطي البرنامج عددًا آخر غير $8$؟ » → لا (selfCheck, the expansion is unit 1's).

**M8 إختبار أولي:**

| # | Prompt | Key | Distractors | LP |
|---|---|---|---|---|
| 1 | محيط مربّع ضلعه $x$ | $4x$ | $x^4$ (POWER) · $x+4$ (ADDFOR) · $4+4x$ | P1 |
| 2 | قيمة $2x^2+1$ من أجل $x=3$ | $19$ | $37$ (PRODSQUARE: $(2x)^2$) · $13$ (SQUARE2: $x^2$ read $2x$) · $7$ | P2 |
| 3 | $3\times a+4\times a$ | $7a$ | $7a^2$ (ADDPOWERS) · $12a$ (MULTCOEF) · $7+a$ | P3 |
| 4 | « صفّ من $n$ خلية يحتاج $5n+1$ عودًا. لـ $12$ خلية: » | $61$ | $72$ (PERCELL: $6n$) · $60$ (NOFIRST) · $513$ (JUXTA: « $5n$ » read $512$, then $+1$) | P1, P2 |
| 5 | $5\times x\times0+2\times x$ | $2x$ | $7x$ (ZEROSKIP) · $0$ (ZEROALL) · $10x$ | P3 |

## 8. Misconceptions (`MISC-IBARA2-*`)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `PERCELL` | a shared element counted once per cell (6n) | shared rods blink red | test 4 |
| `NOFIRST` | the starting element forgotten (5n) | first rod dashed | test 4 |
| `POWER` | 4 × x written x⁴ | — | test 1 |
| `ADDFOR` | « 4 times x » written x + 4 | — | test 1 |
| `PRODSQUARE` | 2x² computed as (2x)² | — | test 2 |
| `SQUARE2` | x² read as 2x | — | test 2 |
| `ADDPOWERS` | 3a + 4a = 7a² | — | test 3 |
| `MULTCOEF` | 3a + 4a = 12a | — | test 3 |
| `ZEROSKIP` | 0 × x dropped as if it were 1 × x | — | test 5 |
| `JUXTA` | a value juxtaposed to the letter's coefficient (5n at n = 12 read 512) | — | test 4 |

## 9. Practice bank (`content/practice/2am/ibara-harfiya-intaj/`, 5 × 10)

**Corpus.** No `term_exam` was read for THIS lesson's parts today (README « one paper part, one sheet »). Parts allotted to it: `2am-s2-50`
ex 5 part 3 (areas in x, x = 30), `2am-s2-73` ex 5 part 2 (areas in x, x = 30), `2am-s2-72` ex 5 part 2 (a path in terms of b,
simplified, b = 2 km), `2am-s3-39` ex 4 (a sports hall: P in x simplified, areas, x = 8 m — term 3 badge). **To read:** `2am-s2-69`
ex 4, `2am-s3-30` ex 5, `2am-s3-37` ex 5 (poor text layers: render them). `2am-s1-87` ex 2 (« أنشر 2(x + y) ») is unit 1's
(`tawzi-darb-jam-tarh` bank) — do not claim it twice.

**Honest FAITHFUL count: 0 read today (the parts above were read only at question level); 5–7 expected.** A perimeter step whose letters
need an equation afterwards (« أوجد x ») is hall's part — never here.

| Level | Content | Provenance |
|---|---|---|
| L1 | from a sentence to an expression (n's neighbours, double, half, square); one value | 8 modelled · 2 adapted (`ex-1`, `self-3`) |
| L2 | values of expressions with one or two letters, a table of values; simplify (× dropped, 1·a, 0·a, a², k·a + m·a) | 8 modelled · 2 adapted (`ex-21`, `self-7`) |
| L3 | figures « بدلالة x »: perimeter, area, simplified; a growing pattern (matchsticks, tables) | 1–2 term_exam (`2am-s3-39` ex 4; `-69` ex 4 after reading) · 6 modelled · 2 adapted (`deep-47`, `ex-11`) |
| L4 | programs → expression → value; two writings of the same program; ≥ 0 values only | 1 term_exam (`2am-s2-72` ex 5 part 2) · 9 modelled |
| L5 | « الوضعية الإدماجية » part: a plot / a house « بدلالة x », areas, a value of x GIVEN (never found) | 2–3 term_exam (`2am-s2-50` ex 5 part 3, `2am-s2-73` ex 5 part 2, `2am-s3-37` ex 5 after reading) · 7 modelled |

**Badges:** « على منوال اختبار الفصل الثاني » (term 2) / « … الثالث » (`2am-s3-*`). Modelled: `platform_addition`,
`reason: "term_exam_modelled"`, `modelledOn: "2am-s2"`. **Oracle** `scripts/practice-oracle/ibara-harfiya-intaj.mjs` (BigInt; every value
recomputed from the statement's expression; every distractor equal to its named error and false).

## 10. Risks & owner questions

1. **No item** (README Q3) and the **same-grade edges without a net link** (README Q4): if `learningNet.test.js` refuses P1 ← wasf P3 /
   P3 ← tawzi P3, drop them and keep `prerequisiteLessonCodes` only (record it in « Generator notes »).
2. **P3's like-terms clause** overlaps 3AM `tabsit-hadhf-aqwas` P1: here only k·a + m·a with a positive result, read as distributivity
   backwards; never a bracket preceded by −.
3. **The table panel instead of a spreadsheet** (README Q9).
4. **Bees in the drawing**: drawn small, around the hives, never on the children; a « خوف من النحل » child is not a theme.

## 11. Generator checklist

- [ ] Seed `_unit/` (README « Seeding » 1) and `docs/sources/2am/unit4/build-extraction.py` → `extraction.json` for the WHOLE unit
  (README table and discrepancies; boundary block in the header). `verified: True` for this lesson's elements after re-reading PDF
  pp. 51–53, 55, 56, 59, 60, 62, 63 at 200 dpi; destinations: `challenge` → unit page + `duplicatedIn` m1; `opener` → 2; `prep` 1–5 → 0,
  10 → 4; `act-1` → 4; `act-2` → 5; `know-1`, `know-2` → 2; `method-1`, `method-2` → 3; `now-59` → 4; `ex-1`, `ex-2`, `ex-5`, `ex-13`,
  `ex-14`, `ex-17`, `ex-19`, `ex-21`, `ex-22` → 4; `deep-46` → 6; `deep-52` → 7; the rest of I's → `None` (bank). Other lessons' elements
  `verified: False`, pending.
- [ ] Unit card: the rewritten تحدّ (README) with `challenge.sourceElementId`.
- [ ] `substitution.js` letters option (+ tests, 3AM cases green) and `equation2.js` E1 (+ `equation2.test.js`).
- [ ] Lab `wax-cells` (type, theme `apiary`, levels, registry, strings `waxCells` in `lesson.manipulation.json`, logic + test — `rodsOf` by
  an edge count equals 5n + 1 / 8n + 3 for n ≤ 8 exhaustively, every refused model drawn —, render test, LabCoach, §6ter ✅
  (`lab-rollout-status.mjs --lesson ibara-harfiya-intaj`), contract section in `MANIPULATION_CONTRACT.md`, DNA row, screenshots: initial,
  three cells, the table, a refused 6n with blinking rods, w3 far value, a1 strip, a3 two letters — four sizes, reviewed).
- [ ] Lesson: 9 modules with `objectives`, header, « تذكّر » (1AM text only; `tawzi-darb-jam-tarh` with link), `content.test.js`
  (BigInt), memos.
- [ ] Catalogue (`pointsToLearn`, `pointPrerequisites`, `prerequisiteLessonCodes`, `durationMinutes`, `difficulty`, `icon`, `available`),
  `generate:lesson-index`, `generate:learning-net`, e2e `2am-mafhum-muadala-ibara-harfiya-intaj.mjs`, gates, bank (`MISC-IBARA2-*`),
  export / import, local DB publish (nothing `draft`), commit `feat(lessons): ibara-harfiya-intaj`.

## 12. Successor connection

**None.** The lesson has no programme item, so no net link leaves it: no successor gains a `pointPrerequisites` edge, no « تذكّر — السنة
الثانية » changes. Inside the unit, `hall-mushkil-muadala` P1 and `ikhtibar-musawat-mutabayina` P1 cite it by their OWN generators (README
Q4). 3AM `qimat-ibara-harfiya` and `tabsit-hadhf-aqwas` keep their recalls (README Q6, default no).

## Generator notes (2026-10-29)

- **Extraction:** whole unit built (92 elements, `docs/sources/2am/unit4/build-extraction.py`). Pages 51–66 read at 110 dpi; `ex-10/11/12/16` have unsure readings (`verified: false`). Not integrated (reasons in `destinations`): `deep-44, 45, 48, 51`, `ex-10, 11, 12, 15, 16, 18`, `deep-61`; `ex-20` moved to `ikhtibar` (equality testing). Extra book numerics fixed: act-3 q2 balance (10 g, 70 g) is NOT balanced, (20 g, 80 g) is.
- **Letters:** `LETTERS_2AM` is `n x y a b c m` (the plan's list plus `c` and `m`, needed by the bank and the two-letter task).
- **`equation2.js` E1** also exports `polyOf`, `asRat`; `toTerms/samePolynomial/witness` gained an optional `letter` (non-breaking).
- **Lab:** no « recursive » refused model; a2 asks the student to write a rule before comparing with Rania's writing; `a3` has no build phase (rule judged at several (n, m) pairs). Level pair cites `method-2`.
- **Module 4** has 6 exercises (rows added so every destined element is genuinely used); module durations 20/13/10/12 so the lesson stays under 90 min; `durationMinutes` 67.
- **Unit card** challenge rewritten (`sourceElementId: challenge`). Bank: 6 `term_exam` / 36 modelled / 6 adapted.
