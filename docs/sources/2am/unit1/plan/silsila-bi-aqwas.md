# Plan — `silsila-bi-aqwas` « سلسلة عمليات تتضمّن أقواسا » (2AM unit 1, lesson 2 of 4 + synthesis)

Read the unit [`README.md`](README.md) first. `silsila-bidun-aqwas` is published before this lesson (it seeded the unit).

## 1. Identity

- **Code** `silsila-bi-aqwas` · **title** « سلسلة عمليات تتضمّن أقواسا » · **unit** `amaliyat-tabiiya-ushriya` · catalogue order 1 ·
  kind `lesson` · programme items `2am.m1.r01`, `2am.m1.r02`.
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/amaliyat-tabiiya-ushriya/silsila-bi-aqwas/`.
- **Textbook pages** (book → PDF = book − 3):

  | Book p. (PDF) | Elements |
  |---|---|
  | 7 (4) | `prep` items 8 (AB = 20 ÷ 5), 10 (9,2/4 = 9,2 ÷ 4 = 2,3) |
  | 8–9 (5–6) | `act-3` (with / without brackets; role; useless brackets; q4 the librarian), `act-4` (bar; calculator 1 + 4 ÷ 4 + 16) |
  | 10 (7) | `know-2` (brackets first; E, F, G — F misprinted, discrepancy 1) |
  | 11 (8) | `method-1` (nested, [ ]), `method-2` (bar), `now-11` ① ② |
  | 14–15 (11–12) | `ex-8`, `ex-10` … `ex-17` |
  | 15–16 (12–13) | `ex-22`, `ex-29`, `ex-30` |
  | 17 (14) | `self-2`, `self-3`, `self-4` |
  | 18–19 (15–16) | `deep-38`, `deep-40`, `deep-41`, `deep-43`, `deep-50`, `deep-53` |
  | 21 (18) | `ict` (calculator with bars; « دوري الآن » ①–③) |

- **Seeds the unit: no.** Move this lesson's destinations in `build-extraction.py`, re-read its elements at 130 dpi (200 dpi for `now-11`
  ①, `ex-12`, `ex-15`, `deep-41`), set them `verified: True`.

## 2. Programme & net

**Programme items:** `2am.m1.r01` « إجراء سلسلة عمليات. » · `2am.m1.r02` « استعمال الأقواس. »

**Draft الكفاءات (verbatim):**
1. « إنجاز سلسلة عمليات تتضمّن أقواسا بإجراء العمليات داخل الأقواس أوّلا، مثل $E = 8 \times (12 - 7)$ »
2. « إنجاز سلسلة بمستويات مختلفة من الأقواس بدءا من الأقواس الداخلية، مع استبدال الأقواس الخارجية بعاقفتين [ ] »
3. « اعتبار البسط والمقام في كتابة كسرية كعبارتين بين قوسين: $\frac{40+8}{15-9} = (40+8) \div (15-9)$ »
4. « استعمال الأقواس لكتابة حساب على الآلة الحاسبة دون خطأ »

**Proposed final wording (order kept):**

| LP | Final | Change |
|---|---|---|
| P1 | إنجاز سلسلة عمليات تتضمّن أقواسا بإجراء العمليات داخل الأقواس أوّلا، وتمييز الأقواس الضرورية من غير الضرورية، مثل $E = 6 \times (15 - 9)$ | own example (the book's is `know-2`'s); adds useless brackets (`act-3` q3, `ex-22`) |
| P2 | إنجاز سلسلة بمستويات مختلفة من الأقواس بدءًا من الأقواس الداخلية، وكتابة الأقواس الخارجية على شكل معقوفين [ ] | wording only |
| P3 | اعتبار البسط والمقام في كتابة كسرية عبارتين بين قوسين، والانتقال بين الكتابتين: $\frac{36+12}{20-8} = (36+12) \div (20-8)$ | own example (the book's is `method-2`'s); adds the reverse writing (`ex-16`) |
| P4 | كتابة حساب على الآلة الحاسبة بالأقواس اللازمة دون خطأ، وتفسير نتيجة خاطئة لحساب حُجز دونها | adds explaining a wrong display (`ex-17`, `ict` ③) |

**Review items for « أستعدّ »** (`reviewLinksForLesson` = `1am.m1.r05` / `mana-jam-tarh`, published): measured by two items. Extra
`priorKnowledge`: `silsila-bidun-aqwas-2am` (same unit, published — two items, « تذكّر » with a link). **noRebuild:** empty.

**pointPrerequisites:**
- intra-lesson: P2 ← P1; P3 ← P1; P4 ← P1, P3;
- cross-lesson, same unit, shared item `2am.m1.r01` (no net link crossed — README question 2, default yes): **P1 ← `2am_silsila-bidun-aqwas_P2`**;
- no cross-year edge (P1–P4 do not lean on `mana-jam-tarh`'s LPs).

**Where it is used next:** `wasf-silsila-hisab`, `tawzi-darb-jam-tarh` (net `2am.m1.r02 → 2am.m1.r03`), `majmu-jabri` (2AM unit 3, `2am.m1.r02
→ 2am.m4.r06`), `quwat-adad-nisbi` P4 (published), 3AM `amaliyat-natiqa` P4 (compound fractions), every later chain with a bar.

## 3. Boundary

**Owns:** brackets first; nested from the inside; [ ]; necessary vs useless brackets; the bar ↔ two bracketed chains, both ways; typing
on a calculator with the brackets it needs; explaining a wrong display; translating a situation that needs brackets.

**Leaves:** naming a chain by its last operation → L3 (this lesson may say « القوسان يجعلان … أوّلًا » but never « هذه السلسلة جداء »);
distributivity → L4; removing brackets after − (3AM); algebraic sums with signs (2AM unit 3); orders of magnitude are kept only as a
check (`ex-12`, `ict` ②: bank).

## 4. Textbook analysis

| Element | What it asks | Idea to keep | Platform use |
|---|---|---|---|
| `act-3` q1–q3 | check six results with / without brackets; the role of brackets; useless ones | brackets change the order; some change nothing | **Not the entry** (results are given; the student checks). أتمرّن item 1 (own numbers) |
| `act-3` q4 | 12 + 102 books, ≤ 5 per shelf → a chain | a sum that must be divided as a whole | مسألة 1 (own: 18 + 129 books, 7 per shelf → 21) |
| `act-4` | A = (14 + 6)/(3 + 1) without the bar; on a calculator; 1 + 4 ÷ 4 + 16 = 18 | the bar hides brackets | أتمرّن item 6 (own) |
| `know-2` | rule + E, F, G | wording | معارف (own examples; F's misprint recorded) |
| `method-1`, `method-2` | nested; bar | the two techniques | طريقة (own numbers) |
| `now-11` | write without the bar; nested chains | practice | أتمرّن items 4, 5 (own) |
| `ex-8`, `ex-10`, `ex-14` | compute; place brackets to make equalities true; nested | P1, P2 | أتمرّن items 2, 3, 4 |
| `ex-13` | match three problems to (15 + 6) × 4, 15 × (6 + 4), 15 × 6 + 4 | translation with brackets | أتمرّن item 7 (own) |
| `ex-15`, `ex-16`, `ex-17` | bar both ways; Younes's calculator (12,6 for (12 + 3)/5) | P3, P4 | أتمرّن items 5, 6 |
| `ict` | the calculator method for A and B; ①–③ | P4 | مسألة 3 (own numbers) + bank |
| `self-2`…`self-4`, `ex-11`, `ex-12`, `ex-22`, `ex-29`, `ex-30`, `deep-*` | practice, puzzles | — | bank |

## 5. Design

**The lesson in one paragraph.** At the school cooperative, Hiba must enter a computation on the big scientific calculator: « ثمن
كتاب 45 DA وغلافه 15 DA ، ويتقاسم الثمن 4 أصدقاء ». She types 45 + 15 ÷ 4 and the calculator prints 48,75 — more than the whole book!
The calculator is not wrong: it obeys the rules of the previous lesson and divides 15 alone. To make it add FIRST, she must tell it:
(45 + 15) ÷ 4 = 15. **Brackets are how we order the calculator (and the reader) to compute something first.** Some brackets change nothing
(9 + (2 × 5)): they repeat what the priority already does. Several needs at once give brackets inside brackets: the inside first, and
the outer pair is written [ ] to be read easily. A fraction bar is a silent pair of brackets above and below: (40 + 8)/(15 − 9) is typed
(40 + 8) ÷ (15 − 9), otherwise the calculator shows 31,53….

**Entry point — candidates compared:**
- (a) **The book's `act-3`** (check six given results with and without brackets): results are given; nothing is at stake. Rejected → أتمرّن.
- (b) **Placing brackets to reach a target** (`ex-10`): a good puzzle but a target without a reason. Kept as a lab level (`k4`) and أتمرّن.
- (c) **A calculator that obeys the priorities and a story whose true amount is drawn**: the student TYPES, the calculator prints a result
  the story refutes, the student must add the brackets that make the machine compute what the story means. The calculator is P4 itself,
  the bar is P3. **Chosen.** `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'coopshop' }`.

**Order of ideas:** a result the story refutes (k1) → brackets first (k1, k2) → a useless pair (k3) → brackets inside brackets (k4) →
the bar (a1) → an average (a2) → معارف names P1–P3 → طريقة: nested, bar, keys → أتمرّن, three مسائل, the test.

**Contexts:** the school cooperative (books, pencils, shared costs); the class library (shelves); averages of a term (school life); a
bus shared by two classes.

## 6. Lab — `coop-calculator` « حاسبة التعاونية » (new type)

**Drawn world `coopshop`** (new theme, kind `objects`, shows « تعاونية المدرسة: منضدة، آلة حاسبة علمية كبيرة بشريط مطبوع، وسلعة الوضعية »):
- the cooperative's counter (wood, shelves of notebooks and pencil boxes behind);
- a big drawn SCIENTIFIC calculator (display, keys 0–9, «,», + − × ÷, ( ), =, ⌫, AC), with a paper TAPE printer on top that prints each
  typed line and its result (the tape keeps the history, scrolls);
- the STORY drawn on the counter: the goods with their price tags, the pupils who share (KidFigure), the coins/notes laid out as they
  should be split — the TRUE amount appears on a card « ما تقوله الوضعية » once the task is solved or after the second refusal (never
  before: it would give the answer);
- KidFigure Hiba (hijab, tunic, cooperative apron) at the keys; `wonder` on a refused line, `proud` on success.

**The variable in the hand: the brackets of the typed line** (where « ( » and « ) » go; in متقدم the whole line).

**Gesture:**
- **مبتدئ**: the line is pre-typed WITHOUT brackets as key-caps on the display row; the student taps a GAP between two key-caps (a cursor
  appears) and presses « ( » or « ) » on the keypad; ⌫ removes the bracket left of the cursor; « = » prints;
- **متقدم**: the student types the whole line from the story or from a fraction-bar expression on the card (keys only — no free text);
- keyboard: the digits, + - * / ( ) Enter, Backspace, arrows to move the cursor.

**What the world shows:**
- « = » prints the line and the calculator's value on the tape (the calculator applies the priorities — `chainOps.calculatorRead`);
- an unbalanced line is refused by the calculator itself: « Syntax ERROR » on the display (`reason: 'syntax'`), as a real calculator does;
- a value ≠ the story's truth: the tape line is stamped ✗ and the counter scene shows WHY in the story's own objects: « 48,75 DA لكلّ
  صديق؟ ثمن الكتاب كلّه 60 DA » (`reason: 'story'`); the brackets the student typed are coloured by depth (inner orange, outer blue);
- value = truth: ✓, the coins split on the counter, the card « ما تقوله الوضعية » appears; a line with a USELESS pair (k3) is accepted
  with the remark « هذان القوسان لا يغيّران شيئًا: احذفهما وتحقّق » and the student may print it again without them (same value).

**Opening (no title):**
- Context (k2): « ثمن كتاب 45 DA وثمن غلافه 15 DA . يتقاسم 4 أصدقاء ثمن الكتاب وغلافه بالتساوي. »
- Question: « اكتب الحساب على الآلة واضغط = حتى تطبع الآلة نصيب كلّ صديق. »
- `lead` (lesson): « الآلة تحترم أولوية العمليات. »

**Levels** (same `objective`: « أستعمل الأقواس لأفرض ترتيب الحساب على الآلة »):

*مبتدئ* (pre-typed line; insert brackets):

| id | Story | Pre-typed line | Truth | Without brackets |
|---|---|---|---|---|
| `k1` | 8 boxes of 12 pencils; 7 pencils taken out of EACH box | 8 × 12 − 7 | 8 × (12 − 7) = **40** | 89 |
| `k2` | book 45 DA + cover 15 DA, shared by 4 | 45 + 15 ÷ 4 | (45 + 15) ÷ 4 = **15 DA** | 48,75 |
| `k3` | « 9 notebooks + 2 boxes of 5 notebooks » (the line already right) | 9 + 2 × 5 | **19** — any bracket around 2 × 5 is useless, around 9 + 2 is refused (55) | 19 |
| `k4` | two buses of 50 seats; in each bus 12 teachers' and 8 parents' seats; seats left for pupils in both buses | 2 × 50 − 12 + 8 | 2 × [50 − (12 + 8)] = **60** | 96 |

*متقدم* (type the whole line; the card shows a fraction bar or a story):

| id | Card | Line to type | Truth |
|---|---|---|---|
| `a1` | « اشترى الفوج خبزًا بـ 40 DA وحليبًا بـ 8 DA ، وتقاسم الثمن التلاميذ الحاضرون: 15 تلميذًا غاب منهم 9 » shown as $\frac{40+8}{15-9}$ | (40 + 8) ÷ (15 − 9) | **8 DA** (without: 31,533…) |
| `a2` | « علامات سارة: 14 ، 17 ، 12,5 . معدّلها؟ » | (14 + 17 + 12,5) ÷ 3 | **14,5** (without: 35,166…) |
| `a3` | « 18 قاموسًا و 129 قصّة توضع 7 كتب في كلّ رفّ » | (18 + 129) ÷ 7 | **21 رفًّا** (without: 36,428…) |

**« جرّب أعدادك » (always open, `[data-coop-free]`):** a free line on the same keypad (≤ 24 keys, ≤ 2 bracket levels); the tape prints
the calculator's value AND, beside it, the left-to-right value « لو حسبنا من اليسار دون أولوية » for comparison; nothing counts.

**LabCheckpoint** (`coopCalculator.cp.*`, 2 hints each):
- after `k2`: « كم دفع كلّ صديق؟ » → 15 DA · « لماذا طبعت الآلة 48,75 أوّلًا؟ » (choice) → « لأنّها قسمت 15 وحده قبل الجمع » · rule « نحسب ما
  بين القوسين أوّلًا ».
- after `k3`: « هل غيّر القوسان حول 2 × 5 النتيجة؟ » → لا · « لماذا؟ » → « الضرب يُحسب أوّلًا دونهما » · rule « قوسان لا يغيّران الترتيب غير
  ضروريين ».
- after `k4`: « ما الذي حسبتَه أوّلًا؟ » → 12 + 8 · « ثم؟ » → 50 − 20 · rule « في الأقواس المتداخلة نبدأ بالداخلية، ونكتب الخارجية [ ] ».
- after `a1`: « ما العبارتان اللتان وضعتهما بين قوسين؟ » → البسط والمقام · rule « خطّ الكسر يجمع البسط ويجمع المقام: نكتبهما بين قوسين على
  الآلة ».
- L2 teacher switch (`useLabCheckpointSettings('coop-calculator')`), L3 `LabStepper`, L4 celebration, L5 « إعادة » from `k1`, L6 `playSfx`
  (key = gesture, print = `bell`, Syntax ERROR = `over`), L7 `immersive` (the calculator grows to the height), L9 guided.

**LabCoach** (`coachOf`): 1. `gap` « اضغط بين رمزين لتضع المؤشّر. » 2. `bracket` « اضغط على ( أو ) . » 3. `print` « اضغط = لتطبع الآلة
النتيجة. » 4. `syntax` (after a Syntax ERROR, on ⌫) « أكمل القوسين أو احذف واحدًا. » 5. `type` (متقدم) « اكتب الحساب كلّه بالأزرار. »
6. `free` « جرّب حسابك في « جرّب أعدادك ». » — never names a position or a value.

**Wrong moves made VISIBLE:** no brackets (k1, k2, a1–a3: the story refutes the printed amount); one bracket only (Syntax ERROR); the
outer bracket closed too early in k4 (2 × [50 − 12] + 8 = 84: « 84 مقعدًا والحافلتان فيهما 100 ، منها 40 للأساتذة والأولياء؟ »); brackets
around the wrong pair in k3 ((9 + 2) × 5 = 55); the numerator alone bracketed in a1 ((40 + 8) ÷ 15 − 9 = −5,8… → the calculator shows a
NEGATIVE number « −5,8 » — the story refutes « سالب؟ » without teaching it: the banner says only « لا يمكن أن يكون النصيب أقلّ من 0 »).

**Core maths:** `chainOps.js` L2 row (`[ ]`, bar, `withoutBar`, `calculatorKeys`, `calculatorRead`, `uselessBrackets`, `bracketDepth`);
lab logic `logic/coopCalculator.js`: `lineOf(task)`, `insert(line, gap, key)`, `print(line)` → `{ status: 'syntax' | 'ok', value }`,
`judge(task, line)` → `{ ok, reason: 'syntax' | 'story' | null, useless: [...] }`, `coachOf`; events:
- `{ kind: 'print', task, line, value, ok, useless, free }`;
- `{ kind: 'refused', task, reason: 'syntax' | 'story', line, value, truth }`;
- `{ kind: 'custom', free: true }`, `{ kind: 'solved', task, line, value }`.

**Why not another lab (DNA §12):**
- `merge-board` (3AM) draws existing « bubbles » (brackets) and the student merges tiles inside them; nobody PLACES a bracket. Here the
  bracket IS the hand's variable, and the referee is a real calculator + the story.
- `marble-run` (3AM) asks for brackets around a substituted negative number; the student writes a substitution line, not a calculation
  order.
- `trig-calculator` (4AM) is a calculator for sin/cos/tan in degree mode; nothing about brackets or priority.
- `tram-route` (L1) stamps an order on chips; here the order is imposed by the machine and the student changes the WRITING.

**Screen budget:** 1024×768: calculator on the right half (keys ≥ 48 px), the story counter and the tape on the left; the tape keeps the
last 4 lines visible. 768×1024: calculator under the story. Full screen: the calculator keys grow.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق من أولوية العمليات ومن القسمة في وضعية قبل أن أستعمل الأقواس »:

| # | Statement | Key | Item / prior |
|---|---|---|---|
| 1 | « $36 - 4 \times 6 = 192$ » | ✗ (12) | `silsila-bidun-aqwas` |
| 2 | « $45 \div 5 + 4 = 13$ » | ✓ | `silsila-bidun-aqwas` |
| 3 | rewritten `prep` 8: « قُسّمت قطعة [AE] طولها 18 cm إلى 4 قطع متقايسة: طول القطعة $18 \div 4$ » | ✓ (4,5 cm) | 1am.m1.r05 |
| 4 | rewritten `prep` 10: « العدد $\frac{13{,}5}{3}$ يُكتب $13{,}5 \div 3$ ويساوي 4,5 » | ✓ | 1am (fraction = quotient) |
| 5 | « $2{,}4 + 3 \times 1{,}2 = 6$ » | ✓ | 1am.m1.r05 + silsila |
| 6 | curiosity: « $(20 - 6) + 4 = 20 - (6 + 4)$ » | ✗ (18 ≠ 10) | 2am.m1.r02 |

**M1 نشاط — « حاسبة التعاونية »** — `objectives`: « أكتشف كيف أجعل الآلة (والقارئ) يحسبان جزءًا من السلسلة أوّلًا ». Lab on top; steps =
traces of the checkpoints + bricks: 1. trace `k2` → brick `aqwas-awwalan` (« أتوقّع القاعدة » first); 2. trace `k3` → brick `aqwas-ghayr-daruriya`;
3. trace `k4` → brick `aqwas-mutadakhila`; 4. trace `a1` → brick `khatt-kasr`.

**M2 معارف** — `objectives`: « أسمّي قاعدة الأقواس والأقواس المتداخلة وخطّ الكسر ».
- Opens on the lab ALONE (`levels={false}`, one task: « 5 صناديق في كلّ منها 20 كرّة، نُزعت من كلّ صندوق 3 كرات مثقوبة » → pre-typed
  5 × 20 − 3, truth 5 × (20 − 3) = **85**).
- Questions: « أين وضعتَ القوسين؟ لماذا؟ ».
- Boxes: « تذكّر — أولوية العمليات » (link `getLessonPath('silsila-bidun-aqwas')`); the rule (platform words); examples
  $E = 6 \times (15 - 9) = 36$ · $F = (7 + 5) \times (20 - 4) = 192$ · $G = (12{,}6 + 5{,}4) \div 4 = 4{,}5$; nested $H = 3 \times [20 - (4 + 6)] = 30$;
  bar $\frac{36+12}{20-8} = (36 + 12) \div (20 - 8) = 4$.

**M3 طريقة** — `objectives`: « أنجز سلسلة بأقواس متداخلة وأكتب كسرًا دون خطّ الكسر وعلى الآلة »:
1. $A = 4 \times [18 - (2 + 3) \times 3]$ → $4 \times [18 - 15]$ → **12** (Q « بأيّ قوسين أبدأ؟ »);
2. $B = \frac{54}{4 \times 3 - 3} + 2 = 54 \div (4 \times 3 - 3) + 2 = 54 \div 9 + 2$ → **8**;
3. the keys for B: « 54 ÷ ( 4 × 3 − 3 ) + 2 = ».
Method box: « نبدأ بأعمق الأقواس؛ نكتب البسط والمقام بين قوسين قبل حذف خطّ الكسر؛ على الآلة نكتب كلّ قوس نحتاجه ».

**M4 أتمرّن** — `objectives`: « أتدرّب على الأقواس وخطّ الكسر والآلة الحاسبة »:

| # | Statement | Answers | cites |
|---|---|---|---|
| 1 | احسب وقارن: $9 + 2 \times 5$ ، $(9 + 2) \times 5$ ، $9 + (2 \times 5)$ ؛ $60 - 24 \div 4$ ، $(60 - 24) \div 4$ — أيّ الأقواس غير ضرورية؟ | 19 · 55 · 19 · 54 · 9 ; $9 + (2 \times 5)$ | `act-3` |
| 2 | احسب: $50 - (17 + 9)$ ؛ $4 \times (13 + 7)$ ؛ $70 - (6 + 4) \times 3$ ؛ $(8{,}2 - 3{,}7) \times 10$ ؛ $24 \div (2 \times 1{,}5 + 3 \div 3)$ | 24 · 80 · 40 · 45 · 6 | `ex-8` |
| 3 | ضع قوسين لتصحّ المساواة: $6 + 4 \times 3 = 30$ ؛ $20 - 8 + 2 = 10$ ؛ $5 \times 9 - 3 = 30$ ؛ $2 \times 3 + 4 \times 5 = 70$ | $(6+4)\times3$ · $20-(8+2)$ · $5\times(9-3)$ · $2\times(3+4)\times5$ | `ex-10` |
| 4 | احسب: $[25 - (14 - 6)] \times 2$ ؛ $3 \times [4 + (10 + 6) \div 8]$ ؛ $60 - [20 - (2 + 3) \times 2]$ | 34 · 18 · 50 | `ex-14`, `now-11` ② |
| 5 | اكتب دون خطّ الكسر ثم احسب: $\frac{28}{11-4}$ ، $\frac{17+7}{15-9}$ ، $\frac{45}{9} - 3$ ؛ واكتب بخطّ الكسر: $8 \div (5 + 3)$ | 4 · 4 · 2 ; $\frac{8}{5+3} = 1$ | `ex-15`, `ex-16`, `now-11` ① |
| 6 | « لحساب $\frac{18+6}{4}$ حجزت رانيا 1 8 + 6 ÷ 4 = فظهر 19,5 . ما الخطأ؟ ما الحجز الصحيح؟ » | 18 + 1,5 ; ( 1 8 + 6 ) ÷ 4 → 6 | `ex-17`, `act-4` |
| 7 | اربط كلّ مشكلة بعبارتها: $12 \times (5 + 3)$ ، $12 \times 5 + 3$ ، $(12 + 5) \times 3$ (12 أفواج في كلّ منها 5 بنات و 3 أولاد / 12 علبة من 5 أقلام و 3 أقلام منفردة / 12 تلميذًا و 5 أساتذة لكلّ منهم 3 كتب) | 96 · 63 · 51 | `ex-13` |

**M5 مسألة 1 (`lessonProblem`)** — « رفوف المكتبة » (`act-3` q4 redesigned): « 18 قاموسًا و 129 قصّة، 7 كتب في كلّ رفّ. » 1) the chain
→ $(18 + 129) \div 7$; 2) → **21 رفًّا**; 3) « لو حسبنا $18 + 129 \div 7$ ؟ » → 36,428… — not a whole number of shelves: the brackets are needed.

**M6 مسألة 2** — « معدّل الفصل » (`2am-s1-75` ex 1 register: averages and the 10 threshold): « علامات سارة: 15 و 12,5 والاختبار 14 بمعامل 2 ؛
علامات أمين: 9 و 11 والاختبار 8,5 بمعامل 2 . المعدّل = مجموع العلامات (الاختبار مرّتين) مقسومًا على 4 . » 1) Sara's chain
$\frac{15 + 12{,}5 + 2 \times 14}{4}$ → **13,875**; 2) Amine's → **9,25**; 3) « من يتجاوز 10؟ » → Sara.

**M7 مسألة 3** — « الآلة الحاسبة » (`ict` redesigned): 1) $A = \frac{147 - 39}{2 + 5 \times 2}$: the keys « ( 147 − 39 ) ÷ ( 2 + 5 × 2 ) = » →
**9**; 2) « لحساب $\frac{600}{2{,}5 + 7{,}5}$ حجز ياسين 600 ÷ 2,5 + 7,5 = فوجد 247,5 . اشرح خطأه وصحّحه » → 240 + 7,5 ; **60**.

**M8 إختبار أولي** (`FINAL`):

| # | Prompt | Key | Distractors |
|---|---|---|---|
| 1 | $5 \times (14 - 8)$ | $30$ | $62$ (MISC-AQWAS-IGNORED) · $6$ · $70$ |
| 2 | $40 - [15 - (2 + 4)]$ | $31$ | $19$ (MISC-AQWAS-DROPOUTER: $40 - 15 - (2 + 4)$) · $27$ (IGNORED: $40 - 15 - 2 + 4$) · $23$ (inner pair dropped: $40 - [15 - 2 + 4]$) |
| 3 | $\frac{25+11}{10-6}$ | $9$ | $20{,}1$ (MISC-AQWAS-BARSPLIT: 25 + 11 ÷ 10 − 6) · $3{,}6$ ((25 + 11) ÷ 10) · $30$ |
| 4 | « لحساب $\frac{60}{4+8}$ نحجز: » | « 60 ÷ ( 4 + 8 ) = » (5) | « 60 ÷ 4 + 8 = » (23, MISC-AQWAS-CALCNOBRACKET) · « ( 60 ÷ 4 ) + 8 = » · « 60 ÷ 4 × 8 = » |
| 5 | « أيّ القوسين غير ضروريين؟ » | $7 + (3 \times 5)$ | $(7 + 3) \times 5$ · $7 \times (3 + 5)$ · $(7 - 3) \div 2$ (MISC-AQWAS-ALLUSELESS / ALLNEEDED) |

Every distractor is recomputed in `content.test.js` from its named error (values verified by the planner: 19, 27, 23, 20,1, 3,6, 23).

## 8. Misconceptions (`MISC-AQWAS-*`, prefix free)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `IGNORED` | brackets read as decoration; computed left to right | k1, k2 printed amounts | test 1; L1–L3 |
| `DROPOUTER` | inner bracket computed, outer one ignored | k4 « 84 مقعدًا » | test 2; L2–L3 |
| `BARSPLIT` | a fraction bar divides only the last term above / below | a1 31,53 | test 3; L1–L3 |
| `CALCNOBRACKET` | the calculator « knows » the bar | a1–a3 tape | test 4; L2, L5 |
| `ALLUSELESS` / `ALLNEEDED` | every bracket changes (or never changes) the result | k3 accepted useless pair | test 5; L2 |
| `IMPLICITX` | « 3(4 + 5) » read as 34 + 5 or 3 + (4 + 5) | free panel | L3 (bank; the × sign is always written in L1–L3, `3(…)` appears only in L4) |

## 9. Practice bank (`content/practice/2am/silsila-bi-aqwas/`, 5 levels × 10)

**Corpus read for this plan** (term 1): `2am-s1-87` ex 1 B, C (1,2 × (3,4 + 6,6) ÷ 6 = 2; 27 − 2 × [13 − 4 × (10 − 8)] = 17 — the text layer
reverses brackets: re-read), `2am-s1-91` ex 1 L (90 − [26 + (24 − 6 × 2) ÷ 3] + 5 = 65), `2am-s1-68` ex 1 E, F (350 − [(10 + 8) × 2 − 6] = 320;
(18 − 2,5 × 2 + 7)/(9 ÷ 3 + 7) = 2), `2am-s1-75` ex 1 A, B (3 × [15 − (18 − 3 × 3)] = 18; (25 − 16) × 2 − (32 − 25) = 11; context: three
pupils' averages vs 10), `2am-s1-77` ex 1 F + ② (125 − 3 × [35 − (5 × 7 − 1)] = 122; the milk seller: (52 − 8 × 2) ÷ 12 = 3, choose the chain
among three), `2am-s1-81` ex 1 B, C (2 × (3 × 5 − 20 ÷ 2) = 10; (25 − 2,5 × 2)/(9 ÷ 3 + 7) + 7 = 9), `2am-s1-84` ex 1 ② (32 − (2 + 5 × 4)/(1 + 2 × 5)
= 30), `2am-s1-70` ex 1 (25 + [4 × (3 + 12,25)] = 86; (5 × 4 + 16)/(13 − 4) = 4 + the calculator keys), `2am-s1-88` ex 1 K, L (50 − (25 ÷ 5 × 3) + 7 =
42; (6,5 × 12 − 6)/(3 × (15,2 − 7,2)) − 3 = 0), `2am-s1-78` ex 1 B (10 − [(13 − 9) × 2] = 2), `2am-s1-79` ex 2 D (8 + [(8 − 2) × 8] ÷ 4 − 3 = 17).
Not read: `2am-s1-66`, `-67`, `-74` ex 2, `2am-s2-59` ex 1, `2am-s3-40` ex 1 (signed — 2AM unit 3 territory).

**Honest count of FAITHFUL `term_exam`: 12–14** — the best-covered entry of the unit. Distributivity parts of the same papers (« احسب
بطريقتين », « حلّل ») are omitted (L4 is not published yet).

| Level | Content | Provenance |
|---|---|---|
| L1 | two or three chains with one bracket level | 3 term_exam (`2am-s1-87` ex 1, `2am-s1-81` ex 1, `2am-s1-88` ex 1) · 5 modelled · 2 adapted (`ex-8`, `self-2`) |
| L2 | place brackets / useless brackets / a calculator display to explain (« برّر ») | 2 term_exam (`2am-s1-70` ex 1 keys, `2am-s1-77` ex 1 ②) · 5 modelled · 3 adapted (`ex-10`, `ex-17`, `ex-22`) |
| L3 | full exercise: nested + bar + keys | 4 term_exam (`2am-s1-91` ex 1, `2am-s1-68` ex 1, `2am-s1-77` ex 1 F, `2am-s1-79` ex 2 D) · 4 modelled · 2 adapted (`now-11`, `self-4`) |
| L4 | mobilises L1 (priority without brackets) and 1AM (decimal division); L1 steps are `counted: false` (earlier lesson) | 2 term_exam (`2am-s1-84` ex 1 ②, `2am-s1-78` ex 1 B) · 7 modelled · 1 adapted (`deep-38`) |
| L5 | « الوضعية الإدماجية »: averages and the pass mark, a shared bill, shelves — a chain with bar/brackets and a justified decision | 2 term_exam (`2am-s1-75` ex 1 — averages; `2am-s1-77` milk seller) · 7 modelled · 1 adapted (`act-3` q4) |

**Answer types:** `decimal`, `choice` (which keys / which chain), `selfCheck` for « اشرح الخطأ ». **Oracle:**
`scripts/practice-oracle/silsila-bi-aqwas.mjs` (own BigInt evaluator with ( ) [ ] and bars; checks every intermediate ≥ 0, every
distractor's named error, every « useless bracket » claim by removing it).

## 10. Risks & owner questions

1. **The calculator's negative display** in a refused a1 line (−5,8…): shown as the calculator's honest output, never computed or taught;
   the banner refutes it by the story only. If the owner prefers, the lab refuses such a line BEFORE printing (« تحقّق من القوسين »).
2. **P1 / P3 / P4 wordings change** (useless brackets, both writings of the bar, explaining a wrong display) — README question 2 for the
   cross-lesson edge.
3. **Catalogue**: `prerequisiteLessonCodes` should gain `silsila-bidun-aqwas`; `textbookRef` should add p. 21 (README question 4).

## 11. Generator checklist

- [ ] `build-extraction.py`: re-read this lesson's elements (README table), `verified: True`, module numbers, rebuild; `check:textbook`.
- [ ] `chainOps.js` L2 row + tests (bar both ways, keys, `calculatorRead` vs `evaluateChain`, useless brackets).
- [ ] Lab `coop-calculator` (type, theme `coopshop`, registry, `levels.js` `k1`–`k4` / `a1`–`a3`, strings `coopCalculator` + `cp.*`,
  `logic/coopCalculator.js` + test, render test, LabCoach, LabCheckpoint, L1–L9; contract section + DNA row; screenshots: initial, Syntax
  ERROR, a story refusal with its counter scene, k3 useless pair accepted, k4 nested success, a1 typed, free panel — at the four sizes,
  reviewed). `lab-rollout-status.mjs --lesson silsila-bi-aqwas` ✅.
- [ ] Lesson: 9 modules + `objectives`; header (entry, rejected (a)–(b), order, LP changes); « أستعدّ »; « تذكّر » with the link to L1; memo
  cards; `content.test.js`.
- [ ] Catalogue: `pointsToLearn`, `pointPrerequisites` (§ 2), `prerequisiteLessonCodes` += `silsila-bidun-aqwas` (if the owner agrees),
  `durationMinutes`, `difficulty`, `icon`; `generate:lesson-index`, `generate:learning-net`.
- [ ] Bank (50) + oracle + JSON entries; e2e: extend `2am-amaliyat-tabiiya-ushriya.mjs`.
- [ ] Gates (`npm test`, `validate:lessons`, `check:textbook`, `check:lessons`, `build`, route boundary); publish (guide §11); successor
  edges (§ 12).

## 12. Successor connection

| Successor | Its LP | Edge to add | Along |
|---|---|---|---|
| `quwat-adad-nisbi` (3AM, published) | P4 « إجراء حساب يتضمن قوى باحترام أولوية القوى … » | `pointPrerequisites.P4` += **`2am_silsila-bi-aqwas_P1`** (brackets before powers) and **`2am_silsila-bi-aqwas_P3`** (its طريقة step 4 « كسر بسطه ومقامه سلسلتان ») | `2am.m1.r01 → 3am.m3.r08` (this lesson declares r01) |
| `tawzi-darb-jam-tarh` (2AM, next) | P1 | written by L4's generator: P1 ← `2am_silsila-bi-aqwas_P1` | `2am.m1.r02 → 2am.m1.r03` |
| `wasf-silsila-hisab` (2AM, next) | P1 | written by L3's generator (shared items) | — |
| `majmu-jabri` (2AM unit 3, planned) | P3 « تبسيط كتابة مجموع جبري بحذف إشارة الجمع والأقواس » | its own generator: P3 ← `2am_silsila-bi-aqwas_P1` | `2am.m1.r02 → 2am.m4.r06` |
| `amaliyat-natiqa` P4 (3AM, published: « … ومنها الكتابات الكسرية المركّبة ») | — | **only if** the owner adds a link from `2am.m1.r02` to `3am.m1.r08` (or the open `2am.m1.r01 → 3am.m1.r02`): P4 ← `2am_silsila-bi-aqwas_P3` | — |

**Links in published content:** `quwat-adad-nisbi › Module03Tariqa.jsx` step 4 « كسر بسطه ومقامه سلسلتان »: a « تذكّر — السنة الثانية »
remark (« خطّ الكسر يجمع البسط ويجمع المقام: نحسب كلًّا منهما قبل القسمة »), link `getLessonPath('silsila-bi-aqwas')`. Its « أستعدّ » panel
updates by itself.

## Generator notes

**Generated 2026-10-29** (lead generator + one helper agent for the bank). Deviations from the plan, all minimal:

1. **No miscomputed answer found.** Every value of §6, §7 and §9 re-computes (checked by `logic/coopCalculator.test.js`, `content.test.js` and the bank oracle): 40/89, 15/48,75, 19/55, 60/96/84/92, 8/31,53333333/−5,8, 14,5/35,16666667, 21/36,428571…, 85/97, 13,875, 9,25, 9, 247,5/60; M0 and the 5 tests (19, 27, 23, 20,1, 3,6, 30).
2. **Task order.** The plan quotes k2's story as « the opening » but lists the levels `k1`… first: the lab opens on `k1` (8 boxes of pencils, no checkpoint chain), `k2` is the second task and carries the first checkpoint; the module-1 traces are k2 → `aqwas-awwalan`, k3 → `aqwas-ghayr-daruriya`, k4 → `aqwas-mutadakhila`, a1 → `khatt-kasr`.
3. **Event vocabulary.** The plan wrote `kind`; the lab uses `tk` like every other lab (`print`, `refused`, `solved`, `custom`). `reason` gained `'math'` (÷ 0, the machine's « Math ERROR »), `'numbers'` (متقدم: the typed line must use the story's numbers, typing the result is refused) and `'nopair'` (k3: the bracket-free line is the right VALUE but the task asks for brackets; the machine prints 19 and the banner asks for brackets so the student lives « a bracket around 2 × 5 changes nothing » vs « around 9 + 2 gives 55 »). New task flag `needPair`.
4. **a1 numerator-only line** `(40 + 8) ÷ 15 − 9` prints the calculator's honest `−5,8` (plan risk 1, default kept): the banner says only « لا يمكن أن يكون النصيب أقلّ من 0 », nothing about negative numbers is computed or taught; the memo trap and a knowledge-map card quote it as the calculator's output. Owner may prefer the lab to refuse such a line before printing.
5. **Eighth misconception** `MISC-AQWAS-MISPLACED` (brackets around the wrong part) added by the bank; the plan listed seven.
6. **Bank counts**: 13 `term_exam` (the plan said 12–14) / 28 `term_exam_modelled` / 9 `adapted` / 0 `platform_addition`; per level 3/5/2 · 2/5/3 · 4/4/2 · 2/7/1 · 2/7/1. The plan's `decimal` answer type does not exist: exact decimals are `rational` answers with a point-decimal key.
7. **Module 3 numbers** keep the plan's A and B; the keys of B are `54 ÷ ( 4 × 3 − 3 ) + 2 =` and the bracket-free reading is `54 ÷ 4 × 3 − 3 + 2 = 39,5`.
8. **أستعدّ** has six statements (the plan's table): items 3–4 are the rewritten `prep` 8 and 10; `requires` ids: `silsila-bidun-aqwas-2am`, `mana-jam-tarh-1am`, `darb-ashari-1am`.
9. **Catalogue**: `prerequisiteLessonCodes` += `silsila-bidun-aqwas`; `textbookRef.pages.ict = [21, 21]`; the draft wordings of P1–P4 replaced by the plan's final ones; `durationMinutes` 66, `estimatedDurationMin` 90 (the 90-minute cap counts the مسائل: module 1 is 15 min, not 18).
10. **Textbook extraction**: elements re-rendered at 100 dpi (PDF pp. 5, 8, 11, 18) and compared word for word — `act-3` (partly cut at the bottom), `method-1`, `method-2`, `ex-8`, `ex-10`, `ex-11`, `ict` — are `verified: True` (`L2_VERIFIED` in `build-extraction.py`); the plan asked for every element of the lesson at 130 / 200 dpi, which was NOT done for `prep` 8/10, `act-4`, `now-11`, `ex-13…17`, `ex-22`, `ex-29`, `ex-30`, `self-2…4`, `deep-*` (they stay `verified: False`, cited through `cites`). Nothing contradicted the transcriptions seen.
11. **Successor connection (§12) NOT applied** (coordinator): `quwat-adad-nisbi` P4 ← `2am_silsila-bi-aqwas_P1` + `_P3` and its « تذكّر — السنة الثانية » remark in `Module03Tariqa.jsx`.
