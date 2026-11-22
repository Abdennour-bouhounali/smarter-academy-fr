# Plan — `wasf-silsila-hisab` « وصف سلسلة حسابات » (2AM unit 1, lesson 3 of 4 + synthesis)

Read the unit [`README.md`](README.md) first. `silsila-bidun-aqwas` and `silsila-bi-aqwas` are published before this lesson.

## 1. Identity

- **Code** `wasf-silsila-hisab` · **title** « وصف سلسلة حسابات » · **unit** `amaliyat-tabiiya-ushriya` · catalogue order 2 · kind
  `lesson` · programme items `2am.m1.r01`, `2am.m1.r02`.
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/amaliyat-tabiiya-ushriya/wasf-silsila-hisab/`.
- **Textbook pages** (book → PDF = book − 3):

  | Book p. (PDF) | Elements |
  |---|---|
  | 7 (4) | `prep` items 1 (3,6 + 8,7 is a sum), 2 (« عاملان ») |
  | 9 (6) | `act-5` (four chains, underline the last operation, stickers) |
  | 12 (9) | `know-3` (the last operation names the chain; A = 3 + 6 × 8, B = (3 + 6) × 8, full sentences) |
  | 14 (11) | `ex-9` (calculation trees) |
  | 15 (12) | `ex-18` (write from sentences), `ex-19` (circle the last operation, describe), `ex-20` (a = 32, b = 6, c = 10) |
  | 17 (14) | `self-5` (match chains to names — discrepancy 6) |
  | 19 (16) | `deep-47`, `deep-48`, `deep-49` (calculation programs) |

- **Seeds the unit: no.** No طرائق page in the book for this lesson (`textbookRef.method: null` already): the طريقة module is
  `addition('knowledge_formalization')`.

## 2. Programme & net

**Programme items:** `2am.m1.r01`, `2am.m1.r02` (shared with L1/L2).

**Draft الكفاءات (verbatim):**
1. « تعيين آخر عملية تُنجز في سلسلة عمليات وتسمية السلسلة بها (مجموع، فرق، جداء أو حاصل قسمة) »
2. « وصف سلسلة عمليات بجملة، مثل «$3 \times (5+7)$ جداء العدد 3 ومجموع العددين 5 و 7» »
3. « كتابة سلسلة عمليات انطلاقا من وصفها اللفظي »

**Proposed final wording (order kept):**

| LP | Final | Change |
|---|---|---|
| P1 | تعيين آخر عملية تُنجز في سلسلة عمليات وتسمية السلسلة بها (مجموع، فرق، جداء أو حاصل قسمة) وتعيين حدّيها أو عامليها | adds naming its two terms / factors (`know-3`: « الحدّ الأول لهذا المجموع هو 3 ») |
| P2 | وصف سلسلة عمليات بجملة، مثل « $4 \times (9 + 6)$ جداء العدد 4 ومجموع العددين 9 و 6 » | own example (the book's `3 × (5 + 7)` is `know-4`'s) |
| P3 | كتابة سلسلة عمليات بالأقواس اللازمة انطلاقًا من وصفها اللفظي أو من برنامج حساب، ثم حسابها | adds the brackets it needs, calculation programs (`deep-47`–`49`), computing it |

**Review items for « أستعدّ »** (`reviewLinksForLesson` = `1am.m1.r05` / `mana-jam-tarh`, published): the vocabulary مجموع / فرق / حدّا
(`mana-jam-tarh` P2) is measured by one item. Extra `priorKnowledge`: `silsila-bidun-aqwas-2am`, `silsila-bi-aqwas-2am` (published, « تذكّر »
with links), the words جداء / عامل / حاصل قسمة / مقسوم / قاسم (1AM multiplication and division lessons; recalled). **noRebuild:** empty.

**pointPrerequisites:**
- intra-lesson: P2 ← P1; P3 ← P2;
- cross-lesson, shared items (README question 2): **P1 ← `2am_silsila-bi-aqwas_P1`**, **P3 ← `2am_silsila-bi-aqwas_P1`**;
- cross-year (net link `1am.m1.r05 → 2am.m1.r01`; `mana-jam-tarh` published): **P2 ← `1am_mana-jam-tarh_P2`** (« استعمال المفردات: مجموع،
  فرق، حدّا المجموع، حدّا الفرق … في وصف عملية »).

**Where it is used next:** `tawzi-darb-jam-tarh` (« جداء عدد ومجموع » is the language of the property), the synthesis, 2AM
`ibara-harfiya-intaj` (expressions from sentences), 3AM `tabsit-hadhf-aqwas` P4 (« التمييز بين عبارة على شكل مجموع وعبارة على شكل جداء
(آخر عملية فيها) » — no net link yet, § 12), every « انشر / حلّل » of 3AM–4AM (they name sums and products).

## 3. Boundary

**Owns:** the last operation (the root); the two terms / factors / dividend and divisor; one-sentence descriptions, nested; writing a chain
with the brackets it needs from a sentence or a « اختر عددًا » program, then computing it; trees ↔ chains.

**Leaves:** distributivity (« جداء عدد ومجموع … يساوي … ») → L4; letters beyond reading a program (a program `5 × (n + 3)` is read on
numbers; never simplified) → 2AM `ibara-harfiya-intaj`; algebraic sums → 2AM unit 3. Every value in the lesson is ≥ 0 (`self-5`'s « 2,5 −
2 × 7 » is not used).

## 4. Textbook analysis

| Element | What it asks | Idea to keep | Platform use |
|---|---|---|---|
| `act-5` | underline the last operation of four chains; stick مجموع / فرق / جداء / حاصل قسمة | a chain has ONE name | **Not the entry** (the student is told that the last operation names it, then applies it). أتمرّن item 1 (own chains) |
| `know-3` | rule + two examples with full sentences | the sentence model « … هي مجموع العدد 3 وجداء العددين 6 و 8 » | معارف (own examples) |
| `ex-9` | trees ↔ chains | the tree = the structure | أتمرّن item 5 (own tree) |
| `ex-18`, `ex-19` | write from sentences; describe | P2, P3 | أتمرّن items 2, 3 |
| `ex-20` | values of a + b/c, (a + b)/c, a/(b + c) | the bar decides the structure | bank (adapted) |
| `deep-47`, `deep-49` | programs: « add 3, × 5 »; the magician | a program IS a description | مسائل 1 and 3 (own programs) |
| `deep-48` | a longer program and its simplification | — | bank |
| `self-5` | match | test register | bank (rewritten without a negative) |
| `prep` 1, 2 | vocabulary | — | « أستعدّ » (rewritten) |

## 5. Design

**The lesson in one paragraph.** On the class corkboard hangs a paper strip printed « 7 + 4 × 5 ». We want to tell a friend over the
phone what it is, without dictating every sign. Cut it in TWO with scissors so that each piece can be computed on its own and the two
pieces, put back together with the operation where you cut, give the strip's value. Cut at « × »: the pieces « 7 + 4 » and « 5 » give
11 × 5 = 55, but the strip is worth 27 — and the scissors bite into a staple: when the strip was computed, 4 × 5 was stapled together
FIRST. Cut at « + »: « 7 » and « 4 × 5 » give 7 + 20 = 27 ✓ — the only free place is the operation done LAST. So the strip is a SUM: the
sum of the number 7 and the product of 4 and 5. Cutting each piece again until single numbers gives the full sentence. Conversely, from a
sentence, glue blocks with an operation — adding the brackets the sentence needs — and the strip must come out with the right name.

**Entry point — candidates compared:**
- (a) **The book's `act-5`** (underline, then stickers): the rule « last operation » is given in the question itself. Rejected → أتمرّن.
- (b) **Trees** (`ex-9`, the تحدّ trees): the structure is drawn already; the student only reads it. Kept as an application (أتمرّن 5).
- (c) **Dictation over the phone** (describe so that a friend rewrites the same chain): genuine need for a description, but the check is
  slow and verbal. Kept as مسألة 2's register (a coded message).
- (d) **Cutting the strip into two computable blocks**: the hand chooses WHERE (the variable = the root), the strip resists (a staple and
  a value that does not match), the name comes from the only cut that works, and the recursion produces the sentence. **Chosen.**
  `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'corkboard' }`.

**Order of ideas:** one free cut (c1) → the name (c1–c4: sum, product, difference, quotient) → the pieces' names (terms, factors, dividend,
divisor) → cutting again: the full sentence (c5) → equal value by chance, wrong cut (c6) → glue from a sentence (متقدم) → معارف → طريقة →
أتمرّن, three مسائل (programs), the test.

**Contexts:** the class corkboard and a coded message (classroom life); « اختر عددًا » programs and a « magician » trick (games of
mind — no cards, no dice); a phone dictation between cousins.

## 6. Lab — `chain-cutter` « مقصّ السلسلة » (new type)

**Drawn world `corkboard`** (new theme, kind `objects`, shows « سبّورة فلّين في القسم: شريط ورقي مطبوع، دبابيس ومقصّ وجيوب بطاقات »):
- a cork board in a wooden frame; the chain printed on a long cream paper STRIP pinned across it (numbers and operators as print,
  brackets printed too, LTR island);
- after « ثبّت » the strip is computed by the rules: each operation, in the conventional order, clips a STAPLE (a metal bracket drawn over
  the strip) joining its two blocks; staples nest outward; each staple shows its small value tag (« 20 » over 4 × 5) — the last staple
  spans the whole strip;
- the scissors (big, drawn, ≥ 56 px handle) above the strip; under the board, two labelled pockets that RELABEL themselves after the cut:
  « الحدّ الأول / الحدّ الثاني » (+), « الحدّ الأول / الحدّ الثاني » (−, order kept), « العامل الأول / العامل الثاني » (×), « المقسوم / القاسم » (÷);
- a sticker sheet (مجموع / فرق / جداء / حاصل قسمة) and a sentence bar that grows as the student names the pieces;
- KidFigure Yasmine (hijab) holds the phone (she will dictate the sentence); `wonder` / `proud`.

**The variable in the hand: WHERE the strip is cut** (which operator is the root); in متقدم also which blocks are glued, with which
operation, and whether a bracket clip is added.

**Gesture:**
- **cut**: drag the scissors onto an operator (it snaps) and release — or tap an operator then « قصّ »; keyboard: ← → move the scissors
  between operators, Enter cuts;
- after a valid cut the two pieces fall into the pockets; the student drags the right STICKER onto the cut operator (the name), then may
  cut a piece again (tap it to bring it up to the board);
- **glue** (متقدم): drag two blocks (number cards or glued strips) onto the board, tap an operation chip between them; « مشبك » adds a
  bracket clip around a block; « ألصق » prints the new strip.

**What the world shows:**
- a cut at the ROOT: the last staple opens, the pieces fall, the two pockets show their values and the « check » reads `27 = 7 + 20` ✓;
- a cut elsewhere: the scissors bite into a staple (red flash, shake), the check shows the rebuilt value « 55 ≠ 27 » (`reason: 'staple'`,
  `rebuiltValue`) — or, when the rebuilt value is EQUAL by chance (c6: 20 + 5 − 3 cut at « + » → 20 + (5 − 3) = 22), only the staple refuses
  and the banner says « القيمة نفسها، لكن الشريط مدبّس هنا: هذه العملية لم تُنجز في الأخير »;
- a wrong sticker (« جداء » on a « + »): the sticker does not stick (slides off), `reason: 'name'`;
- in متقدم the staples are HIDDEN until the student commits a cut (predict-then-see) and appear after it.

**Opening (no title):**
- Context (c1): « على السبّورة شريط مكتوب عليه $7 + 4 \times 5$ . ستصفه ياسمين لصديقتها في الهاتف. »
- Question: « قصّ الشريط إلى قطعتين تُحسب كلّ منهما وحدها، ثم ضع على موضع القصّ اسم السلسلة. »
- `lead` (lesson): « الدبّوس يربط عددين حُسبا معًا. »

**Levels** (same `objective`: « أكتشف العملية التي تسمّي سلسلة عمليات »):

*مبتدئ* (staples visible after « ثبّت »):

| id | Strip | Value | Root (name) | Wrong cut → rebuilt value |
|---|---|---|---|---|
| `c1` | 7 + 4 × 5 | 27 | + (مجموع 7 و 4 × 5) | × → 55 |
| `c2` | (7 + 4) × 5 | 55 | × (جداء 7 + 4 و 5) | + → 27 |
| `c3` | 40 − 12 ÷ 4 | 37 | − (فرق 40 و 12 ÷ 4) | ÷ → 7 |
| `c4` | (18 + 6) ÷ 3 | 8 | ÷ (حاصل قسمة 18 + 6 على 3) | + → 20 |
| `c5` | 6 × (9 − 2) + 5 | 47 | + then × then − : « مجموع جداء العدد 6 وفرق العددين 9 و 2، والعدد 5 » | × → 72 |
| `c6` | 20 + 5 − 3 | 22 | − (فرق 20 + 5 و 3) | + → 22 (same value: staple refuses) |

*متقدم* (staples hidden until the cut; then the glue world):

| id | Task | End state |
|---|---|---|
| `a1` | cut 63 − 28 ÷ 7 and name both levels | فرق العدد 63 وحاصل قسمة 28 على 7 = **59** |
| `a2` | glue: « فرق العدد 50 وجداء العددين 6 و 7 » | 50 − 6 × 7 = **8** (no clip needed) |
| `a3` | glue: « حاصل قسمة مجموع العددين 15 و 9 على 4 » | (15 + 9) ÷ 4 = **6** (clip NEEDED: without it the strip is a sum, 17,25 — refused « شريطك مجموع ») |
| `a4` | glue: « جداء مجموع العددين 3 و 5 وفرق العددين 10 و 4 » | (3 + 5) × (10 − 4) = **48** (two clips) |

**« جرّب أعدادك » (always open, `[data-cutter-free]`):** type a strip (≤ 20 characters, + − × ÷ ( ), naturals and decimals, every value
≥ 0 — `isNonNegativeChain`), cut and name freely; the sentence is generated; nothing counts.

**LabCheckpoint** (`chainCutter.cp.*`):
- after `c1`: « عند أيّ عملية نجح القصّ؟ » → + · « وأيّ عملية أُنجزت أوّلًا عند الحساب؟ » → × · rule « نسمّي السلسلة بآخر عملية تُنجز فيها ».
- after `c4`: « ما اسم القطعة 18 + 6 في جيبها؟ » → المقسوم · « وما القاسم؟ » → 3.
- after `c5`: « أكمل الجملة: مجموع … والعدد 5 » → جداء العدد 6 وفرق العددين 9 و 2 · rule « نصف القطع بالطريقة نفسها حتى نصل إلى الأعداد ».
- after `c6`: « لماذا رُفض القصّ عند + رغم أنّ القيمة 22 نفسها؟ » → « لأنّ 20 + 5 حُسبت أوّلًا: آخر عملية هي الطرح ».
- after `a3` (متقدم): « لماذا احتجت المشبك؟ » → « دونه تكون القسمة أوّلًا ويصبح الشريط مجموعًا ».
- L2 teacher switch, L3 `LabStepper`, L4 celebration, L5 « إعادة » from `c1`, L6 `playSfx` (snip = gesture, sticker = `bell`, staple bite = `over`),
  L7 `immersive`, L9 guided.

**LabCoach** (`coachOf`): 1. `pin` « اضغط « ثبّت » ليُحسب الشريط. » 2. `cut` « اسحب المقصّ إلى عملية وأفلته لتقصّ. » 3. `sticker` « اسحب
الاسم المناسب إلى موضع القصّ. » 4. `again` « اضغط على قطعة لتقصّها هي أيضًا. » 5. `glue` (متقدم) « ضع قطعتين على السبّورة واختر العملية
بينهما. » 6. `clip` (متقدم, after a `glue` refusal) « المشبك يجعل قطعة تُحسب وحدها. » 7. `free` — never points at the root.

**Wrong moves made VISIBLE:** naming by the FIRST operation done (c1 cut at ×: 55 ≠ 27); naming by the last WRITTEN operator (c2 « (7 + 4) ×
5 » read as a sum? the cut at + bites the bracket staple); the pieces of a difference / quotient swapped (the pockets are ordered: a piece dropped
into the wrong pocket slides back with « الحدّ الأول هو المكتوب أوّلًا » — the swapped value is never computed, so no negative appears); a
sentence glued without its bracket (a3: the strip is a sum).

**Core maths:** `chainOps.js` L3 row (`lastOperation`, `operands`, `chainName`, `cutAt`, `describe`, `build`); lab logic `logic/chainCutter.js`:
`staplesOf(tree)` (each staple: span, step, value), `cut(state, opIndex)` → `{ ok, reason: 'staple' | null, pieces, rebuiltValue }`,
`stick(state, name)`, `glue(blocks, op, clips)` → `{ tree, name }`, `matches(sentence, tree)`, `coachOf`; events:
- `{ kind: 'cut', task, at, ok, rebuiltValue, value, free }`, `{ kind: 'refused', task, reason: 'staple' | 'name' | 'glue', at?, name?, got? }`;
- `{ kind: 'name', task, piece, name, ok }`, `{ kind: 'glue', task, text, name, ok }`;
- `{ kind: 'custom', free: true }`, `{ kind: 'solved', task, sentence }`.

**Why not another lab (DNA §12):**
- `marble-run` (3AM): the tree is a physical run for SUBSTITUTION (a value flows through stations); here the tree is never drawn: the hand
  FINDS the root by cutting, and names it.
- `merge-board` (3AM): merges tiles bottom-up; here the strip is taken apart top-down.
- `fraction-knife` (1AM) / `area-split` (3AM) cut a quantity (cake, side); here the cut is through WRITING, at an operator.
- `coop-calculator` (L2) changes the writing to change the order; here the writing is fixed and the student reads its structure.

**Screen budget:** 1024×768: strip across the board (font ≥ 28 px; ≤ 7 operators), pockets and stickers under it, sentence bar at the
bottom; staples stack above the strip (≤ 3 levels). 768×1024: pockets below the board. Full screen: the board fills the height.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق من أسماء العمليات وحدودها ومن ترتيب الحساب »:

| # | Statement | Key | Item / prior |
|---|---|---|---|
| 1 | rewritten `prep` 1: « $4{,}7 + 9{,}3$ عبارة عن جداء » | ✗ (مجموع) | `mana-jam-tarh` P2 (1am.m1.r05) |
| 2 | rewritten `prep` 2: « في $6 \times 2{,}5$ يُسمّى العددان 6 و 2,5 عاملين » | ✓ | 1AM multiplication (prior) |
| 3 | « في الفرق $45 - 18$ ، العدد 18 هو الحدّ الثاني » | ✓ | `mana-jam-tarh` P2 |
| 4 | « في $36 \div 4$ ، العدد 36 هو المقسوم » | ✓ | 1AM division (prior) |
| 5 | « $5 + 4 \times 3 = 17$ » | ✓ | `silsila-bidun-aqwas` |
| 6 | « $(5 + 4) \times 3 = 17$ » | ✗ (27) | `silsila-bi-aqwas` |

**M1 نشاط — « مقصّ السلسلة »** — `objectives`: « أكتشف كيف أسمّي سلسلة عمليات وأصفها بجملة ». Lab on top; steps = traces + bricks: 1.
trace `c1` → brick `akhir-amaliya` (after « أتوقّع القاعدة »); 2. trace `c4` → brick `hudud-awamil` (the names of the pieces); 3. trace `c5` →
brick `wasf-jumla`; 4. trace `c6` → no brick (the same-value contrast).

**M2 معارف** — `objectives`: « أسمّي قاعدة تسمية سلسلة ووصفها ».
- Opens on the lab ALONE (`levels={false}`, one strip: $(20 - 8) \div (1 + 2)$ = 4) → cut at ÷, name « حاصل قسمة », then both pieces.
- Questions: « ما المقسوم؟ ما القاسم؟ » → 20 − 8 ; 1 + 2 · « صِف السلسلة » → حاصل قسمة فرق العددين 20 و 8 على مجموع العددين 1 و 2.
- Boxes: « تذكّر — الأقواس » (link `getLessonPath('silsila-bi-aqwas')`); the rule (platform words); examples
  $A = 9 + 2 \times 7$ (= 23) « مجموع العدد 9 وجداء العددين 2 و 7 » · $B = (9 + 2) \times 7$ (= 77) « جداء مجموع العددين 9 و 2 والعدد 7 »;
  a remark « في الفرق وحاصل القسمة يهمّ الترتيب: نذكر الحدّ الأول (المقسوم) أوّلًا ».

**M3 طريقة** (`addition('knowledge_formalization')`) — `objectives`: « أصف سلسلة وأكتب سلسلة من وصفها »:
1. describe $C = 12 \times (15 - 9)$: the order (15 − 9 first, then ×) → the last operation × → « جداء العدد 12 وفرق العددين 15 و 9 » → **72**;
2. write « مجموع العدد 12 وحاصل قسمة 45 على 9 » → $12 + 45 \div 9$ (no bracket needed — why?) → **17**;
3. write « حاصل قسمة مجموع العددين 27 و 9 على 6 » → $(27 + 9) \div 6$ (bracket needed) → **6**.
Method box: « لأصف: أحدّد آخر عملية ← أسمّي السلسلة ← أصف كلّ حدّ (عامل) بالطريقة نفسها. لأكتب: أبدأ بآخر عملية، وأضع بين قوسين كلّ
حدّ (عامل) يجب أن يُحسب قبلها ».

**M4 أتمرّن** — `objectives`: « أتدرّب على تسمية السلاسل ووصفها وكتابتها »:

| # | Statement | Answers | cites |
|---|---|---|---|
| 1 | اسم كلّ سلسلة: $(36 + 4) \div 8$ ؛ $30 - (9 + 6)$ ؛ $14 + 3 \times 6$ ؛ $5 \times (16 - 7)$ — ثم احسبها | حاصل قسمة 5 · فرق 15 · مجموع 32 · جداء 45 | `act-5` |
| 2 | اكتب ثم احسب: مجموع العدد 9 وجداء 4 و 7 ؛ حاصل قسمة فرق 30 و 6 على 4 ؛ جداء العدد 12 وفرق 15 و 9 ؛ فرق العدد 40 وفرق 26 و 11 | 37 · 6 · 72 · 25 | `ex-18` |
| 3 | أحط آخر عملية ثم صِف: $8 \times (3 + 6)$ ؛ $50 - (12 + 8)$ ؛ $6 + 4 \times 9$ ؛ $63 - 28 \div 7$ ؛ $4 \times (1{,}5 + 2{,}5)$ ؛ $7 \times 2 + 3 \times 5$ ؛ $24 \div 4 \times 3$ | جداء 72 · فرق 30 · مجموع 42 · فرق 59 · جداء 16 · مجموع 29 · جداء 18 | `ex-19` |
| 4 | « $a = 24$ ، $b = 6$ ، $c = 2$ : احسب $a + b \div c$ ، $(a + b) \div c$ ، $a \div (b + c)$ وسمّ كلًّا منها » | 27 مجموع · 15 حاصل قسمة · 3 حاصل قسمة | `ex-20` |
| 5 | « ارسم شجرة الحساب للسلسلة $(15 - 6) \times 4 + 2$ ؛ ما آخر عملية في الشجرة؟ » | 38 ; + (أسفل الشجرة) | `ex-9` |
| 6 | اربط: $9 + (15 - 4)$ ، $(45 - 15) \div 3$ ، $(14 + 6) \times (12 - 2)$ ، $26 - 2 \times 7$ بـ: مجموع / فرق / جداء / حاصل قسمة | مجموع · حاصل قسمة · جداء · فرق | `self-5` (no negative) |

**M5 مسألة 1 (`lessonProblem`)** — « برنامج حساب » (`deep-47` register): « اختر عددًا، أضف إليه 4، ثم اضرب الناتج في 3. » 1) « طبّق البرنامج على
5 ثم على 2,5 » → **27**, **19,5**; 2) « أيّ السلسلتين تترجم البرنامج للعدد 5: $3 \times 5 + 4$ أم $(5 + 4) \times 3$ ؟ » → the second; 3) « صِفها »
→ « جداء مجموع العددين 5 و 4 والعدد 3 ».

**M6 مسألة 2** — « الرسالة المشفّرة » (dictation register): « أرسل يوسف لابن عمّه رمز قفل حقيبته في ثلاث جمل؛ كلّ جملة تعطي رقمًا: (1) فرق العدد
50 وجداء العددين 6 و 7 ؛ (2) حاصل قسمة مجموع العددين 27 و 9 على 6 ؛ (3) جداء العدد 3 ومجموع العددين 2 و 1 . » 1) write the three chains; 2)
the code → **8 6 9**; 3) « كتب ابن عمّه للجملة (2) $27 + 9 \div 6$ : ما الرقم الذي وجده؟ لماذا لا يُفتح القفل؟ » → 28,5 — not a digit: brackets
missing.

**M7 مسألة 3** — « الساحر » (`deep-49` register): « اختر عددًا، أضف إليه 6، اضرب الناتج في 2، ثم اقسم على 4 . يقول الساحر: أعطني النتيجة
أعطك عددك! » 1) for 4 → **5**; for 10 → **8**; 2) the chain for 4 and its description « حاصل قسمة جداء مجموع العددين 4 و 6 والعدد 2 على 4 »; 3)
« يضاعف الساحر النتيجة ثم يطرح 6: جرّب على النتيجتين » → 2 × 5 − 6 = 4 ✓ ; 2 × 8 − 6 = 10 ✓.

**M8 إختبار أولي** (`FINAL`):

| # | Prompt | Key | Distractors |
|---|---|---|---|
| 1 | « $12 + 6 \times 3$ عبارة عن » | مجموع | جداء (MISC-WASF-FIRSTOP) · فرق · حاصل قسمة |
| 2 | « $(12 + 6) \times 3$ عبارة عن » | جداء | مجموع (MISC-WASF-FIRSTWRITTEN) · فرق · حاصل قسمة |
| 3 | « وصف $45 - (10 + 5)$ » | فرق العدد 45 ومجموع العددين 10 و 5 | مجموع العددين 10 و 5 والعدد 45 (MISC-WASF-ORDERDIFF) · فرق العددين 45 و 10 والعدد 5 (MISC-WASF-PIECES) · مجموع فرق … |
| 4 | « حاصل قسمة مجموع العددين 20 و 8 على 7 » يُكتب | $(20 + 8) \div 7$ (= 4) | $20 + 8 \div 7$ (MISC-WASF-NOBRACKET) · $7 \div (20 + 8)$ (ORDERDIFF) · $20 \div 7 + 8$ |
| 5 | « جداء العدد 5 وفرق العددين 11 و 4 » يساوي | $35$ | $51$ (NOBRACKET: 5 × 11 − 4) · $40$ · $20$ |

## 8. Misconceptions (`MISC-WASF-*`, prefix free)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `FIRSTOP` | the chain is named by the operation done FIRST | c1 cut at × (55 ≠ 27) | test 1; L1–L2 |
| `FIRSTWRITTEN` | the chain is named by the first (or last) operator WRITTEN | c2, c6 | test 2; L1 |
| `PIECES` | the terms of 3 + 6 × 8 are « 3 و 6 » | pockets' values | test 3; L2 |
| `ORDERDIFF` | in a difference / quotient the order of the description does not matter | pocket order | tests 3, 4; L2–L3 |
| `NOBRACKET` | a description written without its brackets (« جداء 4 ومجموع 9 و 6 » → 4 × 9 + 6) | a3 glue refused | tests 4, 5; L3–L5 |

## 9. Practice bank (`content/practice/2am/wasf-silsila-hisab/`, 5 levels × 10)

**Corpus:** this item is a CORPUS GAP as a stand-alone exercise. Read: `2am-s1-87` ex 2 ① (« عبّر بكسر عن العبارة E ثم احسبها: E حاصل قسمة مجموع
العدد 5 وجداء 15 و 3 على فرق جداء … و العدد 20 » — the text layer garbles the denominator's numbers: re-read the image before use). Tagged
but NOT read: `2am-s1-83` ex 1 (true / false including « طبيعة عبارة »), `2am-s1-87` ex 2 ② letters (L4). **Honest count of FAITHFUL
`term_exam`: 1–2.** The rest: `term_exam_modelled` (the « exercise 1 » pattern of 2AM term 1 with « سمّ / صِف / اكتب ») and adapted textbook
elements.

| Level | Content | Provenance |
|---|---|---|
| L1 | name four chains (choice), compute | 0 term_exam · 7 modelled · 3 adapted (`act-5`, `self-5`, `ex-19`) |
| L2 | describe / write from a sentence with « برّر » (why a bracket) | 1 term_exam (`2am-s1-87` ex 2 ① after re-reading) · 7 modelled · 2 adapted (`ex-18`, `ex-20`) |
| L3 | full exercise: name, describe, write, compute; a tree | 0–1 term_exam (`2am-s1-83` ex 1 if it fits) · 8 modelled · 1 adapted (`ex-9`) |
| L4 | mobilises L1–L2 (priority, brackets, bar) inside the description; earlier steps `counted: false` | 0 term_exam · 9 modelled · 1 adapted (`deep-48`) |
| L5 | « الوضعية الإدماجية »: a program or a coded message → chains → a decision (which program gives more? does the lock open?) | 0 term_exam · 9 modelled · 1 adapted (`deep-49`) |

**Answer types:** `choice` (names, sentences, chains), `decimal`, `selfCheck` (« صِف بجملة »). **Oracle:**
`scripts/practice-oracle/wasf-silsila-hisab.mjs` (own parser → root; checks each name, each generated sentence against a hand-written
description table, each distractor's named error; every value ≥ 0).

## 10. Risks & owner questions

1. **Faithful exam share ≈ 0** (corpus gap; honest count above).
2. **Same-value cuts** (c6): the staple, not the value, is the referee; the banner says so in the student's own numbers. If testers find
   it confusing, drop c6 to the bank (never drop the staple rule).
3. **Sentence generation in Arabic** (`describe`): masculine « العدد / العددين », « و » between terms, « على » for a quotient; nested
   descriptions limited to depth 2 on screen (deeper → bank only). The sentence table in `chainOps.test.js` is written by hand.
4. Cross-lesson edges without a net link (README question 2); the successor edge toward `tabsit` P4 needs a net link (README question 3).

## 11. Generator checklist

- [ ] `build-extraction.py`: this lesson's elements `verified: True`, modules; rebuild; `check:textbook`.
- [ ] `chainOps.js` L3 row + tests (root, operands, names, `cutAt` incl. the same-value case, `describe` table, `build` with brackets).
- [ ] Lab `chain-cutter` (type, theme `corkboard`, registry, `levels.js` `c1`–`c6` / `a1`–`a4`, strings `chainCutter` + `cp.*`, logic +
  test, render test, LabCoach, LabCheckpoint, L1–L9; contract section + DNA row; screenshots: staples shown, a staple bite with « 55 ≠ 27 »,
  c5's three-level naming, c6's same-value refusal, a3 glue refused then clipped, free panel — four sizes, reviewed). Rollout status ✅.
- [ ] Lesson: 9 modules + `objectives`; header (entry, rejected (a)–(c)); « أستعدّ »; two « تذكّر » with links; memo cards; `content.test.js`.
- [ ] Catalogue: `pointsToLearn`, `pointPrerequisites` (§ 2), `prerequisiteLessonCodes` += `silsila-bidun-aqwas`, `silsila-bi-aqwas`
  (if agreed), `durationMinutes`, `difficulty`, `icon`; index + learning-net regenerated.
- [ ] Bank (50) + oracle + JSON entries; e2e block; gates; publish; successor edges (§ 12, only if the net link exists).

## 12. Successor connection

| Successor | Its LP | Edge | Along |
|---|---|---|---|
| `tabsit-hadhf-aqwas` (3AM, published) | P4 « التمييز بين عبارة على شكل مجموع وعبارة على شكل جداء (آخر عملية فيها) » | **P4 ← `2am_wasf-silsila-hisab_P1`** | **no net link today** (`2am.m1.r01`/`r02` → `3am.m5.r01` missing). Write it ONLY after the owner adds `2am.m1.r02 → 3am.m5.r01` (`requires`) — README question 3 |
| `tawzi-darb-jam-tarh` (2AM, next) | P3 (« جداء … ومجموع … ») | written by L4's generator if it measures this lesson (`priorKnowledge`), no LP edge (L4's net link comes from `silsila-bi-aqwas`) | — |
| `ibara-harfiya-intaj` (2AM, planned, no item) | P1 « التعبير عن وضعية بعبارة حرفية » | its own generator may name this lesson as `priorKnowledge`; no LP edge (no item, no link) | — |

**Links in published content:** `tabsit-hadhf-aqwas › knowledge.jsx` (the « مجموع أم جداء » item of P4): a « تذكّر — السنة الثانية » remark
« نسمّي العبارة بآخر عملية تُنجز فيها » with `getLessonPath('wasf-silsila-hisab')` — useful even before the net link (a recall box is not an
LP edge).

## Generator notes

Generated 2026-10-29 (lead + two helpers). Deviations, all minimal:
1. **Masala 3 « الساحر » → « لغز سالم »** (school-fair riddle corner): no sorcery wording. Numbers unchanged (4 → 5, 10 → 8, then 2 × 5 − 6 = 4, 2 × 8 − 6 = 10).
2. **M8 distractors**: E3 has no ORDERDIFF distractor (swapping `45 − (10 + 5)` is negative); E5 options are 35 / 51 / 75 / 7 (35, NOBRACKET 51, PIECES 75, FIRSTOP 7) instead of 35 / 51 / 40 / 20 (the plan's 40 and 20 matched no named error).
3. **`priorKnowledge`** adds `qisma-ashriya-1am` (the « المقسوم » item); « أستعدّ » items map to `mana-jam-tarh-1am`, `darb-ashari-1am`, `qisma-ashriya-1am`, `silsila-bidun-aqwas-2am`, `silsila-bi-aqwas-2am`.
4. **Lab**: `c5`'s staples sit on three levels; pockets are one compact line each (1024×768 column ≈ 414 px); sticker is tapped (the scissors are the only dragged object); `a1` is a cut task with hidden staples (plan: « cut and name both levels »); « ثبّت » is required only in مبتدئ. The sentence of `a2`–`a4` is given in the story (the target is the described chain).
5. **ORDERDIFF** in written-chain choices only for ÷ (a swapped difference is negative); **PIECES** only for 3-number chains whose root is not ÷.
6. **Bank**: faithful `term_exam` = 2 (`2am-s1-87` ex 2 ① re-read: the denominator reads 40 × 3 − 20 = 100 in the paper, numbers changed here to stay ≥ 0; `2am-s1-83` ex 1 item ج). The tree of `ex-9` is a `selfCheck` (no tree figure kind).
7. `describe` adds a « ، » between the blocks when the first block holds a nested chain (« مجموع جداء العدد 6 وفرق العددين 9 و 2 ، والعدد 5 »).
8. Textbook elements of this lesson were NOT re-read on the rendered pages by this generation (`verified: False` stays in `extraction.json`); the lesson uses own numbers throughout.
