# Plan — `jam-tarh-kasrayn` « جمع وطرح كسرين » (3AM unit 2, lesson 3 of 5 + synthesis)

Read the unit [`README.md`](README.md) first (boundaries, `fractions3.js`, element ids). `maqlub-qismat-kasrayn` and
`tasawi-muqaranat-kasrayn` are published before this lesson.

## 1. Identity

- **Code** `jam-tarh-kasrayn` · **title** « جمع وطرح كسرين » · **unit** `kusur-natiqa` · catalogue order 6 · kind `lesson`.
- **Folder** `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/kusur-natiqa/jam-tarh-kasrayn/`.
- **Textbook pages** (book → pdf = book + 1):

  | Book p. (pdf) | Elements |
  |---|---|
  | 23 (24) | `prep` items 6 (5/14 + 3/7 = 11/14) and 7 (4/3 − 8/15 = 4/5, read LTR) |
  | 24 (25) | `act-4` « جمع و طرح كسرين »: pie charts for 1/4 + … and … − …; 5/6 − 4/9, 1/4 + 5/6; 7/4 − 5/3, 5/8 + 11/6; « give a rule » |
  | 26 (27) | `know-4`: same denominator, rule « نكتبهما بنفس المقام », examples 1/6 + 4/5 = 29/30, 7/10 − 3/8 = 13/40 |
  | 27 (28) | `method-5` (A = 29/18 + 11/18, B = 5/4 + 31/12: both 2AM cases), `method-6` (C = 8/25 − 4/15 via the multiples of 25 → 4/75), `now-2` (A = 8/5 − 2/7, B = 3 + 1/4 − 3/8, C = 5/8 + 7/24 − 1/6, D = (4/3 − 2/15) − (3/4 − 1/8)) |
  | 30–31 (31–32) | `ex-11`, `ex-18`…`ex-21` |
  | 33 (34) | `self-2`, `self-3` |
  | 34–35 (35–36) | `deep-62`, `deep-65`, `deep-74` (bicycle, 10 % discount), `deep-80` (Egyptian fractions) |

- **Seeds the unit: no.**

## 2. Programme & net

**Programme item:** `3am.m1.r06` « جمع وطرح كسرين. »

**Draft الكفاءات (verbatim):**
1. « جمع وطرح كسرين لهما نفس المقام »
2. « جمع وطرح كسرين مقاماهما مختلفان بتوحيد المقامات »
3. « اختيار مضاعف مشترك مناسب للمقامين لتبسيط الحساب »

**Proposed final wording (order kept):**

| LP | Final | Change |
|---|---|---|
| P1 | إدراك أنّنا لا نجمع (أو نطرح) إلا أجزاءً من النوع نفسه: كتابة كسرين مقاماهما كيفيان بمقام مشترك هو مضاعف مشترك للمقامين | **Meaning changed.** « Same denominator » is 2AM `jam-tarh-kusur` P1 (net link `extends`, added value « كسرين كيفيين بتوحيد المقامات »; no duplication). P1 keeps the first position with what is new: WHY a common denominator is needed and HOW to rewrite both fractions. |
| P2 | جمع وطرح كسرين (أو أكثر) مقاماهما مختلفان بتوحيد المقامات، ومنها عدد طبيعي يُكتب كسرًا، ثم اختزال الناتج | Adds the natural number (3 + 1/4 − 3/8, `now-2`) and reducing the result. |
| P3 | اختيار أصغر مضاعف مشترك للمقامين (أوّل مضاعف للمقام الأكبر يقبل القسمة على المقام الآخر) لتبسيط الحساب | « suitable » made precise: this is the book's method (p. 27 « نبحث عن مضاعف مشترك », p. 29 « قائمة المضاعفات الأولى للعدد الأكبر »). |

**Review items for « أستعدّ »:**

| Item | Text | Home | Status |
|---|---|---|---|
| `2am.m1.r09` | جمع أو طرح كسرين لهما نفس المقام أو مقام أحدهما مضاعف لمقام الآخر. | `jam-tarh-kusur` (2AM) | coming_soon → platform statements + rewritten `prep` 6, 7; « تذكّر — السنة الثانية » with no link |

Extra `priorKnowledge`, allowed:
- `tawhid-maqamat-3am`: `tasawi`'s common denominator. Measured by one item and recalled in a « تذكّر » box with `getLessonPath`;
- `mudaafat-1am`: multiples.

**noRebuild:** `3am.m1.r06` extends `2am.m1.r09`. Recall the base and build only « كيفيين بتوحيد المقامات ». « وبإشارات » (a negative
result) is `amaliyat-natiqa`'s.

**pointPrerequisites:**
- intra-lesson: P2 ← P1, P3 ← P1;
- **no cross-lesson edge**: there is no net link from `3am.m1.r05` (`tasawi`) to `3am.m1.r06` (README owner question 1), and the 2AM base
  is unpublished.
- If the owner adds the link `3am.m1.r05 → 3am.m1.r06`, add P1 ← `3am_tasawi-muqaranat-kasrayn_P2`.

**Where it is used next:**
- `amaliyat-natiqa` (r06 → r08);
- the synthesis;
- 3AM unit 4 (`tabsit-hadhf-aqwas`: 2x/3 + x/4; `qimat-ibara-harfiya`);
- unit 5 equations with fractional coefficients;
- 4AM: `natiqa-ghayr-natiqa`, the affine function at fractional inputs, Thales lengths (AB = AM + MB with fractional parts).

## 3. Boundary

**Owns:**
- the sum and difference of two or more POSITIVE fractions with natural terms when no denominator is a multiple of the other;
- a natural number written as a fraction;
- the smallest common multiple by listing the multiples of the larger denominator;
- reducing the result;
- « 1 − (sum of parts) » for a remaining part when the denominators are unrelated;
- a missing addend found by subtraction (87/60 = … + 1/x);
- Egyptian-fraction checks.

**Leaves:**
- the same-denominator and one-multiple cases (2AM, recalled; the book's `method-5` A and B are such cases → used in « أستعدّ »);
- any NEGATIVE result or signed term (8/15 − 4/3) → `amaliyat-natiqa`;
- « fraction of the remainder » chains that need a product → the synthesis (they also need 2AM × and `maqlub`);
- percentages (3AM unit 6): `deep-74` is redesigned without « نسبة مئوية ».

## 4. Textbook analysis

| Element | What it asks | Idea to keep | Platform use |
|---|---|---|---|
| `act-4` | translate pie pictures into sums; compute 5/6 − 4/9, 1/4 + 5/6, 7/4 − 5/3, 5/8 + 11/6; « give a rule » | pies cut differently cannot be counted together | **Not the entry.** The pies are pre-cut by the book, so the student never chooses the common piece and the rule is asked from memory. It becomes the أتمرّن application (own numbers). |
| `know-4` | rule + two examples | wording | معارف, own examples |
| `method-5` | A, B: same denominator / one multiple of the other | 2AM cases | « أستعدّ » (rewritten) |
| `method-6` | C = 8/25 − 4/15: multiples of 25 → 75 | the « smallest common multiple » method | طريقة (own: 7/18 + 5/12 → 36; 13/20 − 4/15 → 60) |
| `now-2` | four computations incl. a natural and brackets | P2 practice | أتمرّن item 2 (own) |
| `prep` 6, 7 | 5/14 + 3/7; 4/3 − 8/15 | 2AM case; a different-denominators case | « أستعدّ » (rewritten) |
| `ex-11` | smallest common multiple of pairs | P3 | أتمرّن item 3 (own pairs) |
| `ex-18`…`ex-21` | mental sums, smallest denominators, sums of 2–3 fractions | practice | أتمرّن items 4, 5 + bank |
| `self-2`, `self-3` | 5/18 + 1/12 = 13/36; « 17/24 is the result of » (TWO right options) | QCM | test register + bank (multiChoice) |
| `deep-62`, `deep-65` | 1/2 + 1/4 + 1/3 + 1/6 + 1/x = 87/60 → x = 5; 3/4 = 2 − 1/5 − 1/x → x = 20/21 | missing term, with `maqlub`'s reciprocal | أتمرّن item 6 (own numbers) |
| `deep-74` | Zakaria's bicycle: 3/8 + 2/5 + 1/8 = 9/10 → the merchant's discount 10 % | « what part is missing » | مسألة 2 (redesigned without percentages) |
| `deep-80` | Egyptian fractions table | decompositions | bank L3 (adapted) |

## 5. Design

**The lesson in one paragraph.** In the school garden, 1/4 of a one-metre bed is given to tomatoes and 1/6 to peppers. How long is the
planted part? « 1/4 + 1/6 = 2/10 » is impossible: 2/10 m is SHORTER than the tomatoes alone. **We can only count pieces of the same
size.** The gardener plants the whole bed with ONE spacing 1/N m, and every crop must hold a whole number of plants. With N = 10, the
tomato zone needs 2,5 plants and a plant falls on the border. With N = 12, the zones hold 3 and 2 plants: 5 plants of 1/12 m, so
1/4 + 1/6 = 3/12 + 2/12 = **5/12**. N = 24 works too (6 + 4 = 10 plants, 10/24 = 5/12: the same length), because 12 and 24 are
**common multiples** of 4 and 6. Plants need room, so the gardener wants the WIDEST spacing that works: the **smallest common multiple**
(12). It is found quickly by going up the multiples of the larger denominator (6, 12 ✓). Subtracting works the same way: a bed of 3/4
from which 1/6 is harvested keeps 9 − 2 = 7 plants of 1/12 m → 7/12.

**Entry point — candidates compared:**
- (a) **The book's نشاط 4** (pre-cut pies): the common piece is GIVEN, so the student never needs to choose it. Rejected as the entry;
  it becomes an application.
- (b) **A clock** (1/4 h + 1/6 h = 15 + 10 min): the common unit 60 is imposed. It hides the choice, and the « smallest » never appears.
  It is kept for مسألة 3.
- (c) **Measuring with one spoon / scoop**: honest, but it uses the scoop gesture of unit 5's `scoop-scale` and the kitchen world of
  `fraction-reduction`.
- (d) **The planting rake**: the hand stretches the SPACING (the common unit 1/N). Two adjacent zones must both hold whole plants. The
  gardener's own need (room for plants) makes the SMALLEST common multiple natural, not a rule imposed. **Chosen.**
  `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'seedbed' }`.

**Order of ideas:**
1. a common spacing → both zones whole → the sum read in plants (P1);
2. other spacings that work give the same length → any common multiple (P1, P2);
3. the widest spacing = the smallest common multiple (P3);
4. subtracting the same way;
5. معارف: « تذكّر » (2AM cases and `tasawi`'s common denominator), the rule, two examples;
6. طريقة: the multiples of the larger denominator, sums with a natural and three terms;
7. أتمرّن, three مسائل, the test.

**Contexts:**
- the school garden (environment club);
- a class cleaning the courtyard in groups (care for the school);
- a family that pays together for a bicycle (family solidarity);
- study and reading time (balance).

## 6. Lab — `seed-rake` « مشط الشتلات » (new type)

**Drawn world `seedbed`** (new theme, kind `lengths`, shows « حوض غرس في حديقة المدرسة: مشط زراعي وشتلات ومسطرة متر »):
- a 1 m planting bed of dark soil with a wooden metre ruler along its edge (0 … 1 m);
- coloured crop zones painted on the soil from the left (tomatoes red, peppers green, onions purple), each with a small drawn sign
  carrying its fraction;
- above the bed, a long garden rake whose teeth spacing is the hand's variable (the teeth throw thin shadow lines onto the soil);
- seedlings are drawn plants (two leaves, a small stem) standing in square soil cells;
- a second bed slides in on the right when the total exceeds 1 m;
- KidFigure Sara (hijab, tunic, gardening gloves) holds the watering can and reacts (`wonder` on a border plant, `proud` on success).

**The variable in the hand: the spacing 1/N m** (N = number of cells per metre, 2…60).

**Gesture:**
- **stretch the rake**: drag its right handle left or right. The teeth spread or tighten and snap to spacings 1/N; the readout says
  « المسافة بين شتلتين: 1/12 m ».
- −/+ buttons (N ± 1);
- keyboard ← → (N ∓ 1 / ± 1), Home = N 2;
- then « ازرع » (tap or Enter) plants one seedling per whole cell in every zone.

**What the world shows:**
- for each zone, its plants and a count pill (« الطماطم: 3 شتلات »);
- a zone border that falls INSIDE a cell: that cell gets a wilted plant split by the border, a red outline, and the banner « شتلة على
  الحدّ بين الطماطم والفلفل » (`refused`, reason `border`). Nothing is counted;
- on success: the planted length « 5 شتلات × 1/12 m » and a ruler bracket over the planted part;
- the student's earlier successful spacings stay listed as small badges (« 1/12 → 5 · 1/24 → 10 ») with the SAME bracket length. That
  is the invariant;
- a « أوسع مسافة؟ » star appears only after two working spacings have been found (never before: it would tell the answer).

**Opening (no title):**
- Context: « في حوض طوله 1 m خُصّص $\frac14$ منه للطماطم و $\frac16$ للفلفل، متجاورين. »
- Question: « مُدّ المشط واختر مسافةً واحدة بين الشتلات حتى يمتلئ الجزءان بشتلات كاملة، ثم ازرع. »
- `lead`: « كل شتلة تأخذ خانة واحدة من التربة. »

**Levels** (same `objective` on both):

*مبتدئ* (counts visible, borders flagged):

| id | Zones | Working N (≤ 60) | Widest | End state | Shows |
|---|---|---|---|---|---|
| `g1` | 1/4 + 1/6 | 12, 24, 36, 48, 60 | 1/12 | **3 + 2 = 5 plants → 5/12 m** (and a second spacing, e.g. 1/24 → 10 → same bracket) | common multiple, the invariant, the « 2/10 » refusal (see below) |
| `g2` | 2/3 + 1/5 | 15, 30, 45, 60 | 1/15 | **10 + 3 = 13 → 13/15 m** | coprime denominators: the product |
| `g3` | 3/4 planted, then 1/6 harvested from its end (subtraction) | 12, 24, … | 1/12 | **9 − 2 = 7 → 7/12 m** | the difference |

*متقدم* (PREDICT: the rake is locked until the student types N and the resulting fraction; then planting checks; no count pills before
planting):

| id | Zones | End state |
|---|---|---|
| `a1` | 5/6 + 3/8 | N = 24: 20 + 9 = 29 → **29/24 m** (> 1: the second bed slides in) |
| `a2` | 7/10, then 4/15 harvested | N = 30: 21 − 8 = 13 → **13/30 m** |
| `a3` | 1/2 + 1/3 + 1/4 (three crops) | N = 12: 6 + 4 + 3 = 13 → **13/12 m** |
| `a4` | 3/8 + 5/12, « أوسع مسافة ممكنة » | working N ∈ {24, 48}: the widest is **1/24**: 9 + 10 = 19 → **19/24 m**. N = 48 is accepted but the star asks « هل توجد مسافة أوسع؟ » |

**« جرّب أعدادك » (always open):**
- up to three zones a/b (b ≤ 12, total ≤ 2 m), the last one may be « حصاد » (subtract);
- a field « توقّعي للمجموع »: the student may type ANY fraction (e.g. 2/10). The bed draws a dashed bracket of that length next to the
  real one. 2/10 is visibly shorter than the tomato zone alone;
- free trials never count.

**LabCoach:**
1. `rake`: « اسحب مقبض المشط لتوسيع المسافة بين الأسنان أو تضييقها. »
2. `plant`: « اضغط « ازرع » لترى هل امتلأ كل جزء بشتلات كاملة. »
3. `border`: « شتلة على الحدّ؟ جرّب مسافة أخرى. » (on the first `border` refusal)
4. `predict` (متقدم): « اكتب المسافة والطول قبل أن تزرع. »
5. `free`: « جرّب أجزاءك في « جرّب أعدادك ». »

**Wrong moves made VISIBLE:**
- adding across (1/4 + 1/6 = 2/10): the dashed bracket is shorter than one part;
- a spacing that is a multiple of only one denominator (1/8 for 1/4 + 1/6): a border plant;
- « the bigger denominator is the common one » (1/6): a border plant in the 1/4 zone;
- « any common multiple gives a different result »: the same bracket for 1/12 and 1/24;
- subtraction across (3/4 − 1/6 = 2/2): the free panel bracket.

**Discovery** (after g1 with two working spacings, and g2):
- Question: « لماذا نجحت المسافتان 1/12 و 1/24 ولم تنجح 1/10؟ »
- Right: « لأنّ 12 و 24 مضاعفان لـ 4 ولـ 6 معًا، و 10 ليس مضاعفًا لـ 4 ».
- Wrong:
  - « لأنّ 12 أكبر من 10 » (refuted: 1/14 — 14 > 10 — fails; she may try it, or the option shows a witness);
  - « لأنّ 4 + 6 = 10 » (refuted by her own 1/10 refusal).

The formal phase names: $\frac14+\frac16=\frac3{12}+\frac2{12}=\frac5{12}$; a common multiple; the smallest common multiple.

**Core maths:**
- `fractions3.js` (L3 row): `isCommonMultiple`, `smallestCommonMultiple`, `multiplesUntil`, `cellsOf(p, N)`, `sumWith(terms, N)`,
  `widestUnit(dens, maxN)`;
- lab logic `logic/seedRake.js`: `zonesOf(task)`, `plant(state, N)` → `{ ok, counts[], borderAt? }`, `coachOf`, `report` events:
  - `{ kind: 'plant', task, N, ok, counts, total }`;
  - `{ kind: 'refused', task, reason: 'border', N, zone }`;
  - `{ kind: 'predict', task, N, value, ok }`;
  - `{ kind: 'custom' }`;
  - `{ kind: 'solved', task, N, total }`.

**Why not another lab (DNA §12):**
- `fraction-knife` (1AM): ONE share is fixed and the hand holds the number of pieces d of one whole. Its point is that one share has
  many names; it never adds.
- `tile-yard` (1AM): the hand carries one tile (unit AREA) to measure area and perimeter.
- `ruler-compare` (1AM): the hand holds a decimal graduation (m, dm, cm, mm) to separate two lengths.
- Here the hand STRETCHES a rake (a continuous gesture snapping to unit fractions 1/N) so that TWO OR THREE adjacent zones are whole at
  once. The result is a SUM read in plants. The invariant (same length for every working N) and the gardener's need for room (the
  widest = the smallest common multiple) are what the lab is about. Nothing is cut, carried or tiled.
- Unit-3 `unit-ladder` stretches a band across unit columns (conversions), a different object and variable.

**Screen budget:**
- 1024×768 with the sidebar: the bed is drawn at the column width (≈ 480 px → 1 m ≈ 440 px). At N = 60 a cell is ≈ 7 px: draw the
  seedlings as dots below N = 30 and keep the teeth as lines. The rake handle grab is ≥ 56 px.
- The second bed (sums > 1) appears UNDER the first, not to the right. The counts row under the beds; « جرّب أعدادك » as a compact
  form row (always open).
- 768×1024: same layout, more height for the beds.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق من جمع كسرين وطرحهما في الحالات البسيطة ومن توحيد المقامات »:

| # | Statement | Key | Item |
|---|---|---|---|
| 1 | $\frac59+\frac29=\frac79$ | ✓ | 2am.m1.r09 |
| 2 | $\frac7{12}-\frac14=\frac13$ | ✓ (7/12 − 3/12 = 4/12) | 2am.m1.r09 |
| 3 | $\frac3{10}+\frac25=\frac5{15}$ | ✗ (= 7/10) | 2am.m1.r09 |
| 4 | $1-\frac58=\frac38$ | ✓ | 2am.m1.r09 |
| 5 | rewritten `prep` 6: $\frac4{15}+\frac25=\frac23$ | ✓ (4/15 + 6/15 = 10/15) | 2am.m1.r09 |
| 6 | rewritten `prep` 7: $\frac53-\frac7{12}=\frac{13}{12}$ | ✓ (20/12 − 7/12) | 3am.m1.r06 (the new case, as curiosity) |
| 7 | « $\frac34$ و $\frac56$ بنفس المقام هما $\frac9{12}$ و $\frac{10}{12}$ » | ✓ | `tasawi` (recall) |

**M1 نشاط — « مشط الشتلات »** — `objectives`: « أكتشف لماذا نوحّد المقامات قبل الجمع، وكيف أختار المقام المشترك ». Lab on top; then:
1. Evidence « في g1 رفض الحوض المسافة 1/10 ». Q: « كم شتلة كان يحتاج جزء الطماطم بالمسافة 1/10؟ » → 2,5. « لماذا رُفضت؟ » (choice) →
   « لأنّ 10 ليس مضاعفًا لـ 4 ». Distractors: « لأنّ 10 صغير », « لأنّ الفلفل أقصر ».
2. Q: « بالمسافة 1/12: كم شتلة زرعتَ في المجموع؟ وما طول الجزء المزروع؟ » → 5; 5/12 m. « أتوقّع القاعدة » (« لنجمع كسرين مقاماهما
   مختلفان… »), then brick `tawhid-qabl-jam` « نكتب الكسرين بنفس المقام، ثم نجمع البسطين ».
3. Q: « بالمسافة 1/24 زرعتَ 10 شتلات: هل تغيّر طول الجزء المزروع؟ » → no: 10/24 = 5/12. Brick `mudaaf-mushtarak` « أيّ مضاعف مشترك
   للمقامين يصلح مقامًا مشتركًا ».
4. Q: « أيّ مسافة يفضّلها البستاني ليترك مكانًا للشتلات؟ » (choice) → the widest, 1/12 = the smallest common multiple of 4 and 6.
   Brick `asghar-mudaaf`.

**M2 معارف** — `objectives`: « أسمّي قاعدة جمع كسرين وطرحهما ».
- Opens on the lab ALONE (`levels={false}`, world `fewest`, task 3/4 + 5/6 « أوسع مسافة ») → N = 12: 9 + 10 = 19 → 19/12 m.
- Questions:
  1. « ما أوسع مسافة نجحت؟ » → 1/12;
  2. « اكتب الحساب » → 9/12 + 10/12 = 19/12.
- Boxes:
  - « تذكّر — السنة الثانية » (same denominator, one multiple of the other; no link);
  - « تذكّر — تساوي كسرين ومقارنتهما » (link `getLessonPath('tasawi-muqaranat-kasrayn')`, published);
  - the rule (platform words);
  - examples $\frac16+\frac45=\frac5{30}+\frac{24}{30}=\frac{29}{30}$ · $\frac7{10}-\frac38=\frac{28}{40}-\frac{15}{40}=\frac{13}{40}$.

**M3 طريقة** — `objectives`: « أجد أصغر مضاعف مشترك وأحسب مجموعًا أو فرقًا ». Steps:
1. $\frac7{18}+\frac5{12}$: the multiples of 18 are 18, 36 (36 ÷ 12 = 3 ✓) → 14/36 + 15/36 = **29/36**. Q « ما أوّل مضاعف لـ 18 يقبل القسمة
   على 12؟ » → 36.
2. $\frac{13}{20}-\frac4{15}$: 20, 40, 60 ✓ → 39/60 − 16/60 = **23/60**.
3. $2+\frac16-\frac34=\frac{24}{12}+\frac2{12}-\frac9{12}=$ **17/12**.

Method box: « لجمع كسرين أو طرحهما: نكتب مضاعفات المقام الأكبر حتى نجد أوّل مضاعف يقبل القسمة على المقام الآخر، ثم نوحّد ونحسب ونختزل ».

**M4 أتمرّن** — `objectives`: « أتدرّب على الجمع والطرح بمقامات مختلفة »:

| # | Statement | Answers | cites |
|---|---|---|---|
| 1 | احسب: $\frac78-\frac16$ ، $\frac13+\frac34$ ، $\frac94-\frac56$ ، $\frac3{10}+\frac74$ | 17/24 · 13/12 · 17/12 · 41/20 | `act-4` |
| 2 | احسب: $\frac56-\frac14+\frac23$ ، $3+\frac58-\frac7{12}$ | 5/4 · 73/24 | `now-2`, `ex-21` |
| 3 | أصغر مضاعف مشترك: 6 و 9 ؛ 8 و 12 ؛ 10 و 15 ؛ 14 و 21 ؛ 9 و 12 | 18 · 24 · 30 · 42 · 36 | `ex-11`, `ex-19` |
| 4 | احسب ذهنيًا: $\frac12+\frac14$ ، $\frac56-\frac13$ ، $1+\frac25$ ، $4-\frac34$ | 3/4 · 1/2 · 7/5 · 13/4 | `ex-18` |
| 5 | احسب واكتب على أبسط شكل: $\frac56+\frac49$ ، $\frac7{12}+\frac38$ ، $\frac{11}{15}-\frac3{10}$ ، $\frac12+\frac13+\frac15$ | 23/18 · 23/24 · 13/30 · 31/30 | `ex-20` |
| 6 | جد $x$: $\frac{19}{20}=\frac12+\frac13+\frac1{12}+\frac1x$ ؛ وأيّ قيمة تحقّق $\frac56=2-\frac34-\frac1x$: $\frac{12}5$ ، $\frac5{12}$ ، $12$؟ | x = 30 · 12/5 | `deep-62`, `deep-65` |

**M5 مسألة 1 (`lessonProblem`)** — « تنظيف الساحة »:
- Statement: « نظّف الفوج الأول $\frac14$ من ساحة المدرسة، ونظّف الفوج الثاني $\frac25$ منها. »
- Questions and answers:
  1. « ما الجزء المنظّف؟ » → 13/20;
  2. « ما الجزء الباقي؟ » → 7/20;
  3. « يستطيع الفوج الثالث تنظيف $\frac13$ من الساحة: هل يكفي لإنهائها؟ » → no: 1/3 = 20/60 < 21/60 = 7/20; 1/60 remains (comparison:
     `tasawi`, published).
- Illustration `tags`.

**M6 مسألة 2** — « درّاجة زكرياء » (redesign of `deep-74`, no percentage):
- Statement: « دفع الجدّ $\frac38$ من ثمن الدرّاجة، ودفع الأب $\frac25$ ، ودفعت الأمّ $\frac1{10}$ ، وأكمل زكرياء الباقي من مدّخراته. »
- Questions and answers:
  1. « ما الجزء الذي دفعه الجدّ والأب معًا؟ » → 31/40;
  2. « وما دفعته العائلة كلّها؟ » → 35/40 = 7/8;
  3. « ما الجزء الذي دفعه زكرياء؟ » → 1/8.

**M7 مسألة 3** — « وقت المراجعة »:
- Statement: « قضى أنس $\frac34$ ساعة في المراجعة و $\frac56$ ساعة في المطالعة. »
- Questions and answers:
  1. « كم ساعة في المجموع؟ » → 19/12 h;
  2. « كم دقيقة؟ » → 95 min;
  3. « بكم يزيد وقت المطالعة على وقت المراجعة؟ » → 1/12 h = 5 min.

**M8 إختبار أولي** (literal in `Module08Itqan.jsx`, data in `FINAL`):

| # | Prompt | Key | Distractors |
|---|---|---|---|
| 1 | $\frac23+\frac14$ | $\frac{11}{12}$ | $\frac37$ (MISC-JAMTARH-ACROSS) · $\frac3{12}$ (MISC-JAMTARH-NOSCALE) · $\frac{11}7$ |
| 2 | أصغر مقام مشترك لـ $\frac3{10}$ و $\frac58$ | $40$ | $80$ (MISC-JAMTARH-PRODUCTONLY — valid but not the smallest) · $18$ (MISC-JAMTARH-SUMDEN) · $10$ (MISC-JAMTARH-BIGGER) |
| 3 | $\frac56-\frac34$ | $\frac1{12}$ | $\frac22$ (ACROSS) · $\frac2{12}$ (NOSCALE) · $\frac1{24}$ |
| 4 | $3-\frac58$ | $\frac{19}8$ | $-\frac28$ (MISC-JAMTARH-INTEGER) · $\frac25$ · $\frac{19}5$ |
| 5 | « زُرع $\frac13$ حقل قمحًا و $\frac29$ منه شعيرًا. ما الجزء غير المزروع؟ » | $\frac49$ | $\frac34$ (ACROSS: 1 − 3/12) · $\frac59$ (the sum, not the rest) · $\frac13$ |

## 8. Misconceptions (`MISC-JAMTARH-*`)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `ACROSS` | add (subtract) numerators and denominators | the free panel's short bracket | tests 1, 3, 5; L1–L3 |
| `NOSCALE` | change the denominators but not the numerators | — (the lab counts plants) | tests 1, 3; L1 |
| `BIGGER` | the bigger denominator is always a common denominator | border plant with 1/6 | test 2; L2 |
| `SUMDEN` | the common denominator is the sum of the denominators | 1/10 refused | test 2 |
| `PRODUCTONLY` | the common denominator must be the product | g1: 1/12 works, smaller than 1/24 | test 2; L2 (برّر) |
| `INTEGER` | n − a/b computed as (n − a)/b | free panel | test 4; L1 |
| `RESULTCHANGES` | another common denominator gives another result | badges with the same bracket | L2 |

## 9. Practice bank (`content/practice/3am/jam-tarh-kasrayn/`)

**Corpus:** `3am.m1.r06` has 22 distinct exercises. The best ones:
- compute exercises: `3am-s1-1` ex 2, `3am-s1-2` ex 4 / ex 7, `3am-s1-103` ex 2 (N = 2/3 + 8/(−3) ÷ 1/5 → signed, `counted: false`
  beyond the sum of positives), `3am-s1-104` ex 2 (E = −7/12 + 4/3 − 11/(−4) → signs: amaliyat; keep only positive pairs), `3am-s1-108`
  ex 2, `3am-s1-110` ex 2, `3am-s2-69` ex 1, `3am-s2-75` ex 1, `3am-s3-59` ex 1, misfiled `1am-s1-100` ex 2;
- situations: `3am-s1-1` ex 3 (phone credit: a fraction of the remainder → product + difference), `3am-s1-3` ex 4 I ② (did they plant
  the whole land: 1/4 + 2/6 + 10/24 = 1 ✓ — FAITHFUL here), `3am-s1-5` ex 5 (cable car — the fraction part), `3am-s1-103` ex 5 III ②
  (three days: 2/3 + 1/12 + 1/4 = 1 ✓), `3am-s1-104` ex 5 / `3am-s1-108` ex 5 (shares of three brothers), `3am-s1-109` ex 5 (orchard
  fractions), `1am-s1-100` ex 5, `3am-s3-56` ex 5 (trees, term 3).

**Honest count of FAITHFUL `term_exam`: 10–13.** It is the best-covered item of the unit, but many compute exercises carry signed terms
(→ `counted: false` or relabelled modelled).

| Level | Content | Provenance |
|---|---|---|
| L1 | sum / difference of two fractions, smallest common denominator | 3 term_exam (positive pairs of `3am-s1-108` ex 2, `3am-s1-110` ex 2, `3am-s2-69` ex 1) · 5 modelled · 2 adapted (`ex-20`, `self-2`) |
| L2 | compute then « برّر » (why this denominator; is the result reducible) | 2 term_exam · 6 modelled · 2 adapted (`self-3` multiChoice, `ex-19`) |
| L3 | full exercise: A, B, C (three terms, a natural), irreducible results; a missing term | 3 term_exam (`3am-s1-1` ex 2, `3am-s1-2` ex 4, `3am-s3-59` ex 1) · 5 modelled · 2 adapted (`now-2`, `deep-80`) |
| L4 | mobilises `maqlub` / `tasawi` (same term): a sum compared with a fraction, a sum then a division; steps of the earlier lessons `counted: true` (published), signed steps `counted: false` | 1–2 term_exam (`1am-s1-100` ex 2, `3am-s1-103` ex 2) · 8 modelled |
| L5 | « الوضعية الإدماجية »: shares of a land over days / brothers — is it all? what remains? who has most? | 3 term_exam (`3am-s1-3` ex 4, `3am-s1-103` ex 5 III, `3am-s1-108` ex 5 — Thales parts dropped or `counted: false`) · 7 modelled (`deep-74` adapted once) |

**Answer types:**
- `rational` (`requiredForm: 'irreducible'` when asked);
- `choice` / `multiChoice` (self-3);
- `selfCheck` for « برّر ».

**Oracle:** `scripts/practice-oracle/jam-tarh-kasrayn.mjs` (BigInt rationals, own lcm, own reduction; checks each « smallest common
multiple » key is minimal and each distractor false). Badges « على منوال اختبار الفصل الأول / الثالث ».

## 10. Risks & owner questions

1. **P1's meaning changes** (README owner question 4).
2. **No net link `r05 → r06`**: the lesson recalls `tasawi` but cannot write an LP edge (README owner question 1).
3. **Small cells at N = 60** at 1024×768: draw dots, cap the free panel at N ≤ 60. A screenshot at N = 48 must still read.
4. **`deep-74` loses its percentage** (3AM unit 6 is later in the book). Its redesign asks for the missing fraction only.

## 11. Generator checklist

- [ ] `build-extraction.py`: re-read L3's elements, `verified: True` with `Fraction` asserts, module numbers, rebuild.
- [ ] `fractions3.js`: L3 functions + tests.
- [ ] Lab `seed-rake`:
  - type, theme `seedbed`, registry, `levels.js`, strings `lesson.manipulation.json › seedRake`;
  - `logic/seedRake.js` + test: every task via `coachOf`; the border refusal; the invariant across N; the second bed; prediction;
  - render test;
  - contract section + DNA row;
  - screenshots (initial, a border refusal, two working spacings with the same bracket, the second bed, the advanced prediction, the
    formal phase) at the five sizes — reviewed.
- [ ] Lesson:
  - 9 modules;
  - header (entry, rejected (a)–(c), order, LP history);
  - « تذكّر » boxes (2AM without a link; `tasawi` with a link);
  - « أستعدّ » measures `2am.m1.r09` (+ the `tasawi` recall item);
  - `content.test.js` (BigInt, independent lcm).
- [ ] `generate:lesson-index`, `generate:learning-net`; e2e `3am-kusur-natiqa-jam-tarh.mjs` + coach / retrofit blocks.
- [ ] Gates: `npm test`, `validate:lessons`, `check:textbook`, `check:lessons`, `build`.
- [ ] Bank (50) + oracle + JSON entries.
- [ ] Publish (guide §11, coordinator).

## Generator notes (2026-10-26)

Deviations from this plan, all minimal:

1. **« Examples » of M2 (`know-4`).** The plan listed `1/6 + 4/5 = 29/30` and `7/10 − 3/8 = 13/40`, which are the book's own examples word for word; the independence rule (CLAUDE.md) forbids copying them, so the lesson uses `2/9 + 5/6 = 19/18` (common denominator 18) and `11/12 − 5/8 = 7/24` (24), both recomputed in `content.test.js`.
2. **`prep` 6 / 7** are rewritten with other numbers (`4/15 + 2/5 = 2/3`, `5/3 − 7/12 = 13/12`) exactly as § 7 M0 says; `method-5` (the book's 2AM cases) is cited by the « تذكّر — السنة الثانية » box, not by an « أستعدّ » item (the unit's prep test requires a textbook item to be `prep`).
3. **Destinations (`build-extraction.py`).** L3's elements were re-read at 130 dpi (250 dpi crops for `ex-19`, `ex-20`, `ex-21`) and set `verified: True` with exact asserts; the truncated « … » of `ex-19`/`20`/`21` and `deep-80` were completed from the scan. `ex-18`…`ex-21`, `deep-62`, `deep-65` → module 4 (`ex-19` and `ex-20` are also cited by the bank), `deep-74` → module 6, `deep-80`, `self-2`, `self-3` → the bank. **The first difference printed in `ex-21` is NEGATIVE** (`3/4 − 7/9 = −1/36`): out of scope, recorded in `DISCREPANCIES`. The transcription's `deep-80` key `2/5` was the statement's example, not row 2 (`2/7 = 1/4 + 1/28`).
4. **Lab.** `seed-rake`: a task done by a plant-kind sequence stays playable (the star « أوسع مسافة؟ » needs two working spacings, which is exactly when g1 is done); `g1` finishes after TWO different working spacings AND one refusal (the module's questions quote the student's own refusal — whichever N and zone). `fewest` (معارف) is a plant-kind task flagged `widest`. The free panel's prediction is drawn dashed and never judged.
5. **M1 questions** read the student's own events: the refused spacing (cases in the failing zone as « between k and k + 1 » because 1/6-zone cases like 4/3 are not decimals), the first working spacing (plants, length), a second working spacing (same length), the widest (1/12 found).
6. **LP assessment** (`validate:lessons --strict`): E3 (`5/6 − 3/4`, the common-denominator rewrite) carries P1, E1/E4/E5 P2, E2 P3.
7. **Bank:** « counted: true » for earlier lessons' steps is impossible (the validator requires every question's learning point to belong to this lesson): `maqlub` / `tasawi` steps of L4–L5 are `counted: false`. See EXERCISE_CONTRACT.
8. **Open for the owner:** the bank's `3am-s1-2` ex 4 (model 5 ex 2) prints `35 + T = 0` with `T = 1/4`, a corpus error replaced by a true step; README owner questions 1–5 unchanged.
