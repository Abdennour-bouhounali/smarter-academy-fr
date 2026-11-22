# 1AM unit 1 « الأعداد الطبيعية والأعداد العشرية » — authors' brief (lesson `kitabat-adad-tabii`, 2026-10-14)

Cycle moyen rollout, phase 3 — same organisation as `docs/sources/1am/unit2/brief-authors.md` and `docs/sources/1am/unit3/brief-authors.md`
(read their tables of file ownership: they apply here with the names below). The lead writes the lesson
(`apps/web/src/lessons/moyen/1am/ansab_al_aadad_wal_hisab/adad-tabiiya-ashriya/kitabat-adad-tabii/`) and the extraction
(`docs/sources/1am/unit1/extraction.json`, built by `build-extraction.py`). This is the **very first lesson of 1AM** (order 0): no
prerequisite lesson, and the learning net has NO review link into its item `1am.m1.r02` — « أستعدّ » is the textbook's p. 8.

| Author | Owns | Never touches |
|---|---|---|
| **Lab** | `packages/core/arithmetic/placeValue.js` (+ `.test.js`), `manipulations/operations/RankExchange.jsx`, `manipulations/logic/rankExchange.js` (+ `.test.js`), `manipulations/operations/rankExchange.render.test.jsx`, the `rank-exchange` entries of `manipulations/levels.js` and `manipulationRegistry.js`, the `rankExchange` namespace of `i18n/locales/ar/lesson.manipulation.json` | the lesson folder, `content/practice/**`, the extraction |
| **Bank** | `content/practice/1am/kitabat-adad-tabii/**`, the lesson's entries in `content/practice/{active,exam-style,policy,misconceptions}.json`, `scripts/practice-oracle/kitabat-adad-tabii.mjs` and its import in `scripts/practice-answer-oracle.test.mjs` | the lesson folder, the lab, the extraction, `placeValue.js` |

Already done by the lead: the type `'rank-exchange'` is declared in `packages/core/curriculum/manipulationTypes.js`, and the drawn world
`packing` is in `VISUAL_THEMES` (`packages/core/curriculum/manipulationLevels.js`). Until the lab author adds the `levels.js` and
`manipulationRegistry.js` entries, `levels.test.js` and `manipulationRegistry.test.js` are red on `rank-exchange` (expected — as in batch 1).

## The lesson in one paragraph

« كتابة الأعداد الطبيعية ودلالة الأرقام » (1AM, textbook نشاط 1 « أكوّن أعدادا » p. 9, معارف 1 p. 11 and 4 (a) p. 13, exercises 1–3 and
12 ① p. 17, أقوّم 1 p. 19, أتعمّق 1, 2, 3 (①②), 5 p. 20, « استحضر مكتسباتي » p. 8 items 1–4 and 6). Programme item `1am.m1.r02`
« استعمال الكتابة العشرية والكتابة الكسرية والانتقال بينهما » — shared with the NEXT lesson `kusur-ashriya-kitaba`; the boundary
(net no-duplication rule, decided 2026-10-14, header of `build-extraction.py`):

- **this lesson**: reading and writing a natural number (digits, words, classes of three digits from the right), the RANK of each digit
  in a written number — on both sides of the comma: « الأعشار، الأجزاء من مائة، من ألف » are rank NAMES known from primary school
  (prep item 6) —, « رقم » ≠ « عدد » of a rank for a natural (2017: رقم العشرات 1، عدد العشرات 201), the decomposition of a NATURAL
  (6 392 = 6 × 1000 + 3 × 100 + 9 × 10 + 2);
- **`kusur-ashriya-kitaba`** (later): decimal fractions 1/10, 1/100…, fraction ↔ comma, the decomposition of a DECIMAL (+ 4/10 or
  + 4 × 0,1), « عدد الأعشار » of a decimal, × ÷ 10, 100, 1000. Its own draft P3 (`2,35 = 2 + 3/10 + 5/100`) already holds what this
  lesson's draft P3 example carried — so that part moves there (see « Final الكفاءات »).

The idea the student must DISCOVER: **ten of a rank make ONE of the rank on its left** — so a written number never holds 10 in a
rank: its digit is what is LEFT in that rank once everything is packed, and a place left empty must be kept by a 0. Consequences the
student meets with his own hands: 1 carton + 13 boxes + 24 packs + 37 pencils is NOT « 1 13 24 37 » (it is 2 577); 999 + 1 packs
three times in a cascade (1 000); 2017 pencils make 201 packs of ten, though the tens digit is 1; « سبعة آلاف وخمسة وستون » is 7065,
not 765. Reading a long number is reading it by classes of three from the right (45 671 « خمسة وأربعون ألفا وستمائة وواحد وسبعون »).

Final الكفاءات (`1am_kitabat-adad-tabii_P<n>`, order of the drafts kept):

1. **P1** قراءة عدد طبيعي كبير وكتابته بالأرقام وبالحروف بتجزئته إلى فئات من ثلاثة أرقام — *unchanged.*
2. **P2** تعيين رقم ورتبة كل منزلة (الآحاد، العشرات، المئات، ... الأجزاء من عشرة، من مائة، من ألف) في كتابة عدد، والتمييز بين رقم
   منزلة وعدد وحداتها (رقم العشرات في $2017$ هو $1$ وعدد عشراته $201$) — *added: « رقم » vs « عدد » (textbook ex-1, self-1, prep 1–2;
   it was nowhere in the drafts).*
3. **P3** كتابة عدد طبيعي على شكل مجموع مفكّك (مفكوكه النموذجي) مثل $6\,392 = 6\times1000+3\times100+9\times10+2$ — *changed: the
   decimal part of the draft example (`+ 4/10 + 5/100 + 9/1000`) moves to `kusur-ashriya-kitaba` P3 (decimal fractions are taught
   there, AFTER this lesson — KNOWLEDGE_DEPENDENCY; and the two P3 would duplicate).*

`pointPrerequisites`: P1 ← P2, P3 ← P2 (intra-lesson only; no review link, no earlier lesson).

Lesson plan (the lead writes it, ≈ 87 min): 0 أستعدّ (prep items 1–4, 6 + platform items) · 1 نشاط 1 « أكوّن أعدادا » (act-1 and the
lab, both levels) · 2 معارف (know-1, know-4 a, the natural's مفكوك; « أتوقّع القاعدة »: the classes of three from the right) · 3 طريقة
« رقم المرتبة وعدد وحداتها » (declared platform method on ex-2: the lab's `money` standalone, 1345 DA) · 4 أتمرّن (ex-1, ex-2, ex-3,
ex-12 ①, self-1) · 5 أعداد كبيرة (deep-1, deep-2, deep-3 ①②, deep-5 — the Roman and Egyptian ADDITIVE systems of the opener p. 7
against our POSITIONAL one) · 6–8 three مسائل · 9 إختبار أولي.

## Lab author — `rank-exchange`

Read first exactly what the unit-2 and unit-3 briefs list for their lab authors (MANIPULATION_DNA all — §12, §16 and **§17 incl.
§17.7 « say it once » are binding**; MANIPULATION_CONTRACT §1, §2, §2bis, §4.2, §6bis, §6ter, §7, §7bis-levels, §7ter, §7quater, §8,
§8bis, §8ter (the kit), §9), plus the three newest labs as idioms: `operations/DivisionJumps.jsx` (stretch, `useLessonViewport` budget,
LabKit, narrow layout, bidi isolates), `operations/DigitCards.jsx` (carry gesture with `useDragInteraction`, tap-tap, keyboard, lamps),
`operations/StoryBars.jsx` (`KidFigure`). Lessons learned there apply: Latin numbers isolated in RTL strings, no local test helper named
`t`, one screen at 320×640 checked in the browser, hints closed by default and each one a short THINKING question.

**Lab author must meet MANIPULATION_DNA §17 incl. §17.7 and review screenshots at 1280×800, 1366×768, 390×844, 320×640 of initial and
mid-activity states** (a refused pack, a cascade, the 2017 unpacking half done, the formal phase) for BOTH levels — and report what was
improved after looking at them.

**Why this is not a copy (DNA §12).** 1AM labs so far: `story-bars` (stretch a height until a sentence is true, choose a calc card),
`division-jumps` (b given, stretch q groups along a row / a line), `digit-cards` (colour cells of a table; carry digit cards into SLOTS and
judge divisibility lamps). 4AM labs about integers (`team-builder`, `divisor-explorer-books`, `common-divisors`…) share objects into
groups. Here the hand moves **QUANTITIES BETWEEN RANKS** — it ties ten of a rank into ONE object and carries it one column to the left,
or opens one object into ten of the rank on its right. The written digits are an OUTPUT (what is left in each column), never a card the
student places — the opposite of `digit-cards`, where the digit is the object. What resists: a column holding 10 or more cannot be
written (its digit box overflows); a pack of 9 does not close; a pack carried two columns away or kept in its own column is refused.
Packing by ten is a Euclidean division by 10 (2017 = 201 × 10 + 7 — the link with `division-jumps` is mathematical, not the gesture: no
ribbon, no q to stretch; a CHAIN of exchanges, possibly in cascade).

**Exact arithmetic — `packages/core/arithmetic/placeValue.js` (NEW, yours, imported BY PATH — never the core barrel, BUNDLE_BOUNDARIES §4
rule 9).** Pure integers (`Number.isSafeInteger`, n < 10¹²). API (fixed, the lesson uses it too):

```js
digitsByRank(n)            // { 0: units, 1: tens, … } — digitsByRank(2017) → {0:7, 1:1, 2:0, 3:2}
countOfRank(n, k)          // Math.floor(n / 10**k) — « عدد العشرات » = countOfRank(n, 1); countOfRank(2017, 1) === 201
valueOfCounts(counts)      // Σ counts[k] × 10**k for ANY counts (≥ 10 allowed) — {3:1, 2:13, 1:24, 0:37} → 2577
isWritable(counts)         // every counts[k] ∈ 0..9
decompose(n)               // [{ digit, rank, value }] non-zero ranks from the highest — 6392 → 6×1000, 3×100, 9×10, 2×1
classesOf(n)               // ['4', '908', '732'] — groups of three from the RIGHT
spaced(n)                  // '4 908 732' with U+00A0 between classes (the textbook's « فراغ عقب كل ثلاثة أرقام »)
toArabicWords(n)           // the platform's spelling, byte-identical to words() in docs/sources/1am/unit1/build-extraction.py
RANK_NAMES                 // ['الآحاد', 'العشرات', 'المئات', 'الآلاف', 'عشرات الآلاف', 'مئات الآلاف', 'الملايين', 'عشرات الملايين', 'مئات الملايين', 'الملايير']
```

`toArabicWords` convention (`extraction.json › discrepancies` « words »): 3–9 with ة (خمسة وأربعون ألفا, the textbook's « خمس وأربعون »
is accepted in reading but never written by the platform); « مائة / مائتان / ثلاثمائة… تسعمائة »; classes ألف / مليون / مليار: 1 → ألف,
2 → ألفان, 3–10 → آلاف / ملايين / ملايير, 11–99 → ألفا / مليونا / مليارا, ≥ 100 by the last two digits (00, 01, 02 → singular: مائة ألف,
مائتا ألف (construct dual when nothing follows), 3–10 → plural, 11–99 → accusative); units joined with « و » units before tens (واحد
وسبعون); classes joined with « و »; 0 → صفر. **Test** it against EVERY `words` answer of the extraction (`ex-3`, `know-1`, `deep-2`,
`act-1`, `prep` item 4, `self-1`) read from `extraction.json`, plus a sweep 0..100 000 (no `undefined`, no double space, no « و » at an
end) and spot values (11, 12, 100, 101, 200, 1000, 2000, 3000, 11 000, 200 000, 1 000 000, 2 000 000, 10¹⁰).

**Props contract (fixed — the lesson is written against it):**

```jsx
<Manipulation type="rank-exchange"
  world="pencils" | "tokens" | "money"   // from the level preset; a lesson may force it
  tasks={['pack', 'unpack']}             // the sequence of tasks of the level (preset); or ONE task when levels={false}
  start={{ 3: 1, 2: 13, 1: 24, 0: 37 }}  // 'pack': the counts per rank the stock arrives with (not writable)
  n={2017} rank={1}                      // 'unpack': the number on the board and the rank to count (« كم حزمة من 10؟ »)
  next={999} borrow={1000}               // 'next' / 'previous' / 'borrow' (advanced)
  dictation={[7065, 4908732]}            // 'dictation': numbers given IN WORDS (toArabicWords) to build on the board
  level, levels, title, lead             // as every type (levels={false} for the standalone uses below)
  onTrial={(e) => …}                     // each judged gesture, via state.report:
                                         //   { task, kind: 'pack' | 'unpack' | 'add' | 'remove' | 'predict' | 'answer', rank, ok, counts, value }
  onFinished={({ tasks }) => …}          // the formal phase (or, with levels={false} and no discovery, the task done)
/>
```

`levels.js`:
`'rank-exchange': { beginner: { numbers: { world: 'pencils', tasks: ['pack', 'unpack'], start: { 3: 1, 2: 13, 1: 24, 0: 37 }, n: 2017, rank: 1 }, …P },
advanced: { numbers: { world: 'tokens', tasks: ['next', 'previous', 'borrow', 'dictation'], next: 999, borrow: 1000, dictation: [7065, 4908732] }, …T('act-1') } }`.

**The board (both levels).** One column per rank, the HIGHEST RANK ON THE LEFT, units on the right — a number is written left to right
even in an Arabic page, exactly the textbook's « جدول المراتب » p. 13: the board is an LTR island (`dir="ltr"`) with Arabic column
headers (`RANK_NAMES`), and at متقدم the headers are grouped by CLASS (« فئة الملايين | فئة الآلاف | فئة الوحدات », each مئات/عشرات/آحاد).
Under each column, a big digit box shows the column's count when it is 0..9; with 10 or more it shows the count overflowing its box
(two digits squeezed, rose, a small shake) — the number cannot be written. The WRITTEN NUMBER (big, under the boxes) appears only when
every column is writable, with leading zeros dropped and class spaces (`spaced`). Never a running « = 2577 » before that: the total is
what the student must earn (prediction first, see 'pack').

**مبتدئ — `world: 'pencils'` (theme `packing`, platform).** The school club's packing workshop: pencils collected for the pupils of a
mountain school (value: التضامن — one line in the lesson's `lead`, never in the lab). Four columns: كراتين (1000) | علب (100) |
حزم (10) | أقلام (1), each object DRAWN (a pencil; a pack = 10 pencils tied with a rubber band; a box with its lid showing 10 packs; a
carton showing 10 boxes) — honest: a pack is visibly ten pencils. A `KidFigure` packer (a girl in hijab at the table, `mood` reacts)
stands beside the board on wide screens (not on 320 px).
- **Gesture PACK** (the variable: how many objects of a rank are tied): the student SWEEPS a finger/pointer across objects of one column
  (each swept object lifts and gets a number 1, 2, 3…); releasing at exactly 10 ties them (the band snaps, a « stamp ») into ONE object of
  the next rank, which the student CARRIES (drag; tap-tap; keyboard) into the column on the LEFT. Refusals, in the student's numbers:
  `short-pack` (« 7 أقلام لا تكفي لحزمة: الحزمة 10 أقلام » — the 7 drop back), `wrong-column` (a pack dropped in its own column, or two
  columns away: it slides back to the packing tray, « الحزمة مكانها في عمود الحزم »). Keyboard path: focus a column, « ربط 10 » button
  (enabled at ≥ 10), then « انقل يسارًا ».
- **Gesture UNPACK**: drag one object one column to the RIGHT (or its « فتح » button): it opens into 10 objects of that rank (the lid
  lifts, ten fall in). Units cannot be opened (no rank on their right in this lab — decimals are the next lesson).
- **Task `pack`** (start 1 · 13 · 24 · 37, value 2 577 — not writable): FIRST a prediction card « كم قلمًا في الورشة؟ » with three big
  cards built in `logic/` from the start counts: the side-by-side reading `1132437` (`MISC-KITABA-CONCAT`), the sum of the counts `75`
  (`MISC-KITABA-SUMCOUNTS`) and `2577` — any card may be chosen, nothing is judged yet. Then the student packs until every column is
  writable: the written number appears, the prediction card is judged by the board itself (the chosen card glows green or is struck, with
  its own number). Packing order is free (37 → 3 packs + 7 left, then 27 packs → 2 boxes + 7, then 15 boxes → 1 carton + 5…).
- **Task `unpack`** (n = 2017, written: 2 cartons, 0 boxes, 1 pack, 7 pencils): the order says « الطلبية: حزم من 10 أقلام فقط. كم حزمة
  نرسل؟ ». A prediction card first: `1` (the tens digit, `MISC-KITABA-DIGIT-COUNT`), `20` (`MISC-KITABA-RANKSHIFT`), `201`. The student
  opens cartons and boxes until no carton or box is left; a counter of packs counts as he opens (live, it is the variable): 201 packs and
  7 pencils. The board then writes `2017 = 201 × 10 + 7` and the two pills « رقم العشرات: 1 » / « عدد الحزم: 201 » side by side.
- `discoveryReady` = both tasks done (one refusal is NOT required). **Discovery** (`ManipulationDiscovery`): « ماذا يعني رقم مرتبة في
  كتابة عدد؟ » — right: « ما يبقى في تلك المرتبة بعد ربط كل عشرة في واحدة من المرتبة التي على يسارها »; wrong, refuted with the
  student's own numbers: « عدد القطع التي في العمود كما وصلت » (refuted: 1 · 13 · 24 · 37 written side by side is 1 132 437, the board
  shows 2 577), « عدد كل وحدات تلك المرتبة في العدد » (refuted: 2017 has tens digit 1, and he sent 201 packs). **Formal**: the « جدول
  المراتب » of 2017 with the digit roles (رقم الآحاد 7 …), `2017 = 2 × 1000 + 1 × 10 + 7` (= `decompose`, zero ranks shown greyed in
  the table, absent from the sum), and the pair رقم / عدد per rank (the textbook's ex-1 table, filled from the board: 7 / 2017, 1 / 201,
  0 / 20, 2 / 2).

**متقدم — `world: 'tokens'` (textbook act-1 ③, know-1 p. 11, prep 3).** No drawn pencils (too many): round TOKENS stamped with their
rank value (1, 10, 100, 1 000 … 1 000 000), one colour per CLASS, on the 7-column class board. Same gestures (sweep 10 → one token,
carry left; open → ten tokens right), plus « +1 » / « −1 » on the units column and ± on any column for the dictation (round −/+
buttons of the kit, keyboard ↑/↓).
- `next` (act-1 ③, board 999): « العدد الذي يلي تسعمائة وتسعة وتسعون »: the student adds one unit token → 10 units → he must pack →
  10 tens → pack → 10 hundreds → pack → 1 000 « ألف ». Each pack is his gesture; the board refuses to write while a column holds 10.
- `previous` (act-1 ③, board 999): remove one unit → 998 (one gesture — the contrast with `next`).
- `borrow` (platform contrast, board 1 000): « العدد الذي يسبق ألفًا »: there is no unit to remove — the student must OPEN the thousand
  (10 hundreds), one hundred (10 tens), one ten (10 units), then remove one: 999.
- `dictation` (prep 3, know-1): the number is GIVEN IN WORDS (`toArabicWords`: « سبعة آلاف وخمسة وستون », then « أربعة ملايين
  وتسعمائة وثمانية آلاف وسبعمائة واثنان وثلاثون »); the student sets each column (± or sweep). « تحقّق » judges the board's value;
  a wrong board is refused with what it reads (« لوحتك: 765 — سبعمائة وخمسة وستون ») — the missing 0 is felt: the empty hundreds
  column shows its 0 in the written number only between non-empty ranks.
- `discoveryReady` = the four tasks done. **Discovery**: « لماذا نكتب 0 في 7065؟ » — right: « الصفر يحفظ مكان مرتبة فارغة (لا مئات)
  فيبقى 7 في مرتبة الآلاف »; wrong, refuted with the student's boards: « الصفر لا قيمة له فيمكن حذفه » (765: the 7 falls to the hundreds),
  « نكتب صفرًا بعد كل رقم » (… his 4 908 732 has one 0 only). **Formal**: the class table of 4 908 732, `spaced` writing, the reading by
  classes (« أربعة ملايين | وتسعمائة وثمانية آلاف | وسبعمائة واثنان وثلاثون », each class read like a number under 1000 + its class
  name), and its `decompose`.

**`world: 'money'` alone** (`levels={false}`, `tasks={['unpack']}`, `n={1345}`, `rank={2}` — textbook ex-2: يونس's 1345 DA exchanged for
100 DA notes): columns أوراق 1000 دج | أوراق 100 دج | قطع 10 دج | قطع 1 دج, DRAWN generic notes and coins (a rectangle « 100 دج », a disc
« 10 دج » — never an imitation of a real banknote's design); same unpack gesture; the answer 13 notes (`1345 = 13 × 100 + 45`), the 45 DA
left in coins. No discovery (`onFinished` when answered). Used in module 3 of the lesson.

**Must:** not eligible for « جرّب كل الإمكانيات » (every pack/open is the student's experiment) — say so in the header; design sheet
(DNA §7) + the five questions; one screen at 1280×800 → 320×640 (measure `[data-rx-glance]`: board + digit boxes + written number + the
current task card; on 320 px the 7-column advanced board must fit: columns ≥ 40 px, tokens stacked in a 2-wide column, a count badge
from 10 tokens on — the count is still exact); `useLessonViewport` budget; keyboard + tap-tap + pointer paths for every gesture;
reduced motion (no sweep animation, instant ties); three progressive hints per task that never give the number (« كم قلمًا في الحزمة
الواحدة؟ » …); « إعادة » resets the task; `state.report` for every callback; all strings in `lesson.manipulation.json › rankExchange`
with counted nouns through plural keys `_zero … _other` (قلم / حزمة / علبة / صندوق / ورقة / قطعة — ARABIC_RTL_CONTRACT « Counting
nouns »), numbers as LTR islands, class spaces U+00A0. Say each thing ONCE (§17.7): the task question in the `PromptCard`, the gesture
in one idle line, the story in the lesson's `lead`.

**DOM:** `[data-rank-exchange][data-world][data-task][data-solved]`, `[data-rx-glance]`, `[data-rx-col=<k>][data-count]`,
`[data-rx-item=<k>-<i>]`, `[data-rx-digit=<k>][data-overflow]`, `[data-rx-written]` (text = the written number, empty while not writable),
`[data-rx-tray]` (a tied pack waiting to be carried), `[data-rx-tie]` / `[data-rx-open=<k>]` (buttons), `[data-rx-predict=<value>]`,
`[data-rx-counter]` (unpack), `[data-rx-verdict=<kind>]`, `[data-rx-refused=<kind>]` (`short-pack` | `wrong-column` | `overflow` |
`no-unit` | `wrong-board`), `[data-rx-words]`, `[data-rx-formal]`, `[data-rx-plusminus=<k>]`.

**Tests:** `placeValue.test.js` (above). `logic/rankExchange.test.js` — packing any start state always ends on `digitsByRank(value)`
whatever the order of packs (property sweep: random start counts 0..40 per rank, random pack order); `valueOfCounts` invariant under
every pack and open; refusals carry the right kind and numbers; the three prediction cards of `pack` and `unpack` are distinct and
computed from the start (1 132 437, 75, 2 577 ; 1, 20, 201); `next` from 999 needs exactly 3 packs; `borrow` from 1000 needs 3 opens;
the dictation judge accepts only the exact value; layout of the board swept at five widths (each object drawn once, inside its column,
counts ≥ 10 badge-rendered with the exact count). `operations/rankExchange.render.test.jsx` — both levels and the `money` standalone
render; no raw keys, no `{{`, no Latin prose; the prediction and discovery strings reachable before the formal phase do NOT contain the
rule (« عشرة » + « واحدة » together, « 201 » before unpacking); « says each thing ONCE » like `divisionJumps.render.test.jsx`. Then
`cd apps/web && npx vitest run src/lessons/common/manipulations src/lessons/common/i18nHookScope.test.js` and
`cd packages/core && npx vitest run arithmetic/placeValue.test.js`. A fresh Vite of the repo runs on http://localhost:5174 (do not
start another one, never touch 5173). Do NOT run `npm run build`. Report as the unit-2/3 lab authors did (files, tests, the DOM as built,
the screenshots reviewed and what changed after looking at them).

## Bank author — `content/practice/1am/kitabat-adad-tabii/`

Exactly the unit-2 bank brief (`docs/sources/1am/unit2/brief-authors.md` « Bank author »), its reading list and its rules, with:

- LP ids `1am_kitabat-adad-tabii_P1..P3` (above), each primary on ≥ 8 questions.
- **Corpus** (`exams-index.json`, items `1am.m1.r02`; ALL term-1 papers: badge « على منوال اختبار الفصل الأول », `semester: 1`,
  `modelledOn: "1am-s1"` for the generated ones). Only the parts in THIS lesson's scope (ranks, reading/writing, natural decompositions)
  may be `term_exam` exercises:
  - `1am-s1-94` ex 1 q 1 (« ما هي مرتبة الرقم 4 » in 765,498 ; 342,906 ; 3065,94) and q 3 (« ضع الفاصلة بحيث يصبح الرقم 4 رقم
    الأعشار » in 906243 → 9062,43);
  - `1am-s1-95` ex 1 q 3 (« ضع الفاصلة بحيث يصبح الرقم 7 رقم الأجزاء من 100 في العدد 581274 » → 581,274);
  - `1am-s1-97` ex 1 q 1–3 (in 934,857 the digits of units, hundreds, tenths, hundredths; place the comma in 31795 so that 9 is the
    hundredths digit → 31,795; in 10900 so that 9 is the tens digit → 1090,0 i.e. 1090 — say how you read it in `solution.lines`);
  - `1am-s1-93` ex 1 bullet 1 (« مرتبة الرقم 3 في العدد 15,03 هي جزء من عشرة » — صحيح أو خطأ: خطأ, الأجزاء من مائة);
  - `1am-s1-101` ex 1 q 2 (the number whose tens digit is 2, hundredths digit 2, units digit 3, thousandths digit 6, tenths digit 0 →
    23,026 — scan, read `docs/Exames-1 AM to 3AM/1am/SEMESTER 1/…رقم-101.pdf` with `pdftoppm -r 110`);
  - `1am-s1-93` ex 2 item B only (`B = (8×100)+(9×10)+3` → 893: a natural decomposition).
  The decimal-only parts of these papers (fraction ↔ comma, decimal decompositions, × ÷ 10, « عدد الأعشار » of 1am-s1-97 q 4,
  comparisons) are `kusur-ashriya-kitaba` / `muqaranat-adad-ashriya`: allowed ONLY as `counted: false` steps of a level-4 exercise (same
  term). The corpus has NO exercise on writing naturals in words: P1 is assessed by `term_exam_modelled` exercises in the register of
  the term-1 papers (a short « أكتب بالحروف / بالأرقام » item with 2–3 numbers, then a reformatting « أعد كتابته بفئات من ثلاثة أرقام »)
  and by `adapted` textbook elements. About half of levels 3–5 modelled on one precise corpus exercise above.
- **Textbook elements you may cite** (destination `kitabat-adad-tabii`): `act-1`, `know-1`, `know-4` (its item a: ranks — not the
  decimal decompositions of item b), `ex-1`, `ex-2`, `ex-3`, `ex-12` (item ① only, 5 276), `self-1`, `deep-1`, `deep-2`, `deep-3`
  (items ① ② only: 3 079, 9 730), `prep` (items 1–4 and 6). Nothing else (`check:textbook` fails on any other id).
- **What is assessed:** writing a natural in digits from words and in words from digits (`choice` among readings whose distractors are
  the real misconceptions — digit-by-digit reading, wrong class « أربعة آلاف وخمسمائة… » for 45 671, a lost zero 765 for 7 065, the
  hundreds read as thousands; or `rational` for the digits); reformatting by classes from the RIGHT (`MISC-KITABA-CLASS-LEFT`: 456 71);
  the digit and the rank of a digit (both sides of the comma; « العشرات » vs « الأعشار » confusion `MISC-KITABA-TENS-TENTHS`); « رقم » vs
  « عدد » of a rank (2017: 1 / 201; 1345 DA in 100 DA notes → 13; a 3 005 → 300 tens); the largest / smallest natural from given digits
  (0 never first: `MISC-KITABA-LEADING-ZERO`); a natural from its decomposition, terms possibly out of order (`(8×100)+3+(9×10)`) or
  with a missing rank (`5×1000 + 7×10 + 6` → 5 076, `MISC-KITABA-ZERO-PLACE`); the natural's decomposition; the next / previous number
  across ranks (9 999 + 1, 10 000 − 1); big numbers (million, billion, the textbook's planet distances — values as in the textbook,
  `deep-2`). Words: the platform spelling (`toArabicWords` convention above); a `choice` NEVER opposes two spellings of the same number
  (« خمس » / « خمسة »). Units in Arabic text « دج », « km » inside a math island when glued to a number.
- Misconception ids `MISC-KITABA-*` (at least: `CONCAT`, `SUMCOUNTS`, `DIGIT-COUNT`, `RANKSHIFT`, `LEADING-ZERO`, `ZERO-PLACE`,
  `CLASS-LEFT`, `TENS-TENTHS`, `DIGIT-BY-DIGIT`) in `content/practice/misconceptions.json`.
- **Oracle** `scripts/practice-oracle/kitabat-adad-tabii.mjs`: recomputes every digit, rank, count of a rank (`Math.floor(n / 10**k)`),
  decomposition and comma placement with its OWN integer/string code, and every words key with its OWN speller — never by importing
  `placeValue.js` (two independent implementations cross-check each other); it also asserts its speller on the extraction's `words`
  answers (`docs/sources/1am/unit1/extraction.json`).
- Gates you run: `node scripts/validate-exercises.mjs --strict`, `node scripts/check-textbook-coverage.mjs`, `npm run test:scripts`.

---

# Lesson 2 — `kusur-ashriya-kitaba` « الكسور العشرية والكتابة العشرية » (cycle moyen rollout, batch 4, 2026-10-15)

Same organisation as above and as `docs/sources/1am/unit2/brief-authors.md` (file ownership tables apply with the names below). The lead writes
the lesson (`apps/web/src/lessons/moyen/1am/ansab_al_aadad_wal_hisab/adad-tabiiya-ashriya/kusur-ashriya-kitaba/`) and the extraction
(destinations updated in `build-extraction.py`: act-2, act-3, ex-4…ex-14, ex-26…ex-28 are APPLICATIONS in module 5; know-2/3/4b module 2;
method-1 + now-12 module 3; method-2 + now-14 module 4; `deep-3` ③④ stay with `muqaranat-adad-ashriya`).

| Author | Owns | Never touches |
|---|---|---|
| **Lab** | `packages/core/arithmetic/decimals.js` (+ `.test.js`), `manipulations/operations/DecimalComma.jsx`, `manipulations/logic/decimalComma.js` (+ `.test.js`), `manipulations/operations/decimalComma.render.test.jsx`, new drawing primitives it needs under `manipulations/primitives/` (e.g. `MosaicFigure.jsx`), the `decimal-comma` entry of `manipulations/manipulationRegistry.js`, the `decimalComma` namespace of `i18n/locales/ar/lesson.manipulation.json`, `primitives/labCoach*` wiring ONLY for its own lab, its section in `MANIPULATION_CONTRACT.md` (`## 2tervicies`, after `2duovicies`) and its row in `MANIPULATION_DNA.md` §15 | the lesson folder, `content/practice/**`, the extraction |
| **Bank** | `content/practice/1am/kusur-ashriya-kitaba/**`, the lesson's entries in `content/practice/{active,exam-style,policy,misconceptions}.json`, `scripts/practice-oracle/kusur-ashriya-kitaba.mjs` and its import in `scripts/practice-answer-oracle.test.mjs` | the lesson folder, the lab, the extraction |

Already done by the lead (do not redo): the type `'decimal-comma'` is declared in `packages/core/curriculum/manipulationTypes.js`; the drawn
world `mosaic` is in `VISUAL_THEMES` (`packages/core/curriculum/manipulationLevels.js`); the two level presets are written in
`manipulations/levels.js` (**their `numbers` are the props contract below — read them first**). Until the lab author adds the registry entry,
`manipulationRegistry.test.js` and `levels.test.js` are red on `decimal-comma` (expected). The lesson pages mount while the lesson is still
`coming_soon`: `http://localhost:5174/courses/moyen/1am/ansab_al_aadad_wal_hisab/kusur-ashriya-kitaba/nashat` (module 1 = the lab, both levels)
and `…/tariqa-ashara` (module 4 = the lab's `machine` world) — the lead writes those pages in the first minutes; until they load use vitest
render tests. Do NOT start another Vite, never touch 5173. Do NOT run `npm run build`. Screens are TABLET and LAPTOP only (768×1024,
1024×768, 1280×800, 1366×768, 1920×1080); phones are not supported (owner, 2026-10-15).

## The lesson in one paragraph

Programme items `1am.m1.r02` (decimal/fractional writings and the passage between them), `1am.m5.x1`, `1am.m1.r03` (× ÷ 10, 100, 1000 or
0,1, 0,01, 0,001), `1am.m5.r03` (adding decimal fractions). The boundary with `kitabat-adad-tabii` (naturals, ranks, رقم ≠ عدد) is in the
header of `build-extraction.py`. The idea the student must DISCOVER: **a decimal fraction is a count of equal tiny pieces of the unit (tenths,
hundredths, thousandths); the comma is where the written number changes the size of the piece — every step to the right makes the piece ten
times smaller — so the SAME digits mean different amounts (235, 23,5, 2,35, 0,235), the digits after the comma are as many as the zeros of the
denominator (2,35 = 235/100), a zero keeps an empty place (0,05 ≠ 0,5), a zero at the very end changes nothing (2,50 = 2,5), and ×10, ×100,
×1000 / ÷10, ÷100, ÷1000 only slide the comma (zeros fill the places that appear).**

Final الكفاءات (`1am_kusur-ashriya-kitaba_P<n>`, order of the drafts kept — changes and reasons are in the progress log):

1. **P1** التعرّف على الكسر العشري والتعبير عن جزء من الوحدة، أو عن كمية أكبر منها، بالأجزاء من عشرة، من مائة، من ألف، وكتابته بكتابات متساوية مثل $\frac{3}{10}=\frac{30}{100}$
2. **P2** الانتقال من الكتابة العشرية لعدد عشري إلى كتابته على شكل كسر عشري، والعكس، مثل $31{,}25=\frac{3125}{100}$ (عدد الأرقام بعد الفاصلة هو عدد أصفار المقام)، وحذف الأصفار غير الضرورية
3. **P3** كتابة عدد عشري على شكل مجموع عدد طبيعي وكسور عشرية (مفكوكه النموذجي) مثل $2{,}35=2+\frac{3}{10}+\frac{5}{100}$ ، وإعطاء الكتابة العشرية لمجموع كهذا ولو كانت حدوده غير مرتّبة، وتعيين عدد الأعشار أو الأجزاء من مائة في عدد عشري
4. **P4** ضرب عدد عشري في 10 أو 100 أو 1000 (أو في 0,1 أو 0,01 أو 0,001) أو قسمته عليها بإزاحة الفاصلة، مع كتابة الأصفار عند اللزوم

`pointPrerequisites` (along net links only): P2 ← `1am_hasil-qisma-kasr_P1`, P1; P3 ← `1am_hasil-qisma-kasr_P1`, `1am_mana-jam-tarh_P1`, P2;
P4 ← `1am_kitabat-adad-tabii_P2`, P2. The lesson stands on `kitabat-adad-tabii` (ranks, ten for one) and recalls it — it does not rebuild it.

Lesson plan (lead, ≈ 85 min): 0 أستعدّ · 1 نشاط « ورشة الزليج » (the lab, both levels) · 2 معارف · 3 طريقة « من الكتابة العشرية إلى الكسر العشري
وبالعكس » · 4 طريقة « الضرب في 10 و100 و1000 والقسمة عليها » (the lab's `machine` world) · 5 أتمرّن · 6–8 three مسائل · 9 إختبار أولي.

## Lab author — `decimal-comma`

Read first exactly what the unit-1 brief above lists for its lab author (MANIPULATION_DNA all — §12, §16 and **§17 incl. §17.7, §17.9, §17.11
(LabCoach) are binding**; MANIPULATION_CONTRACT §1, §2, §2bis, §4.2, §6bis, §6ter, §7, §7bis-levels, §7ter, §7quater, §8, §8bis, §8ter (the kit),
**§8quater (LabCoach — mandatory)**, §9, and the sections of the newest labs `2novodecies` `rank-exchange`, `2vicies` `fraction-knife`,
`2duovicies` `fair-share` (incl. « جرّب أعدادك أنت — always open »)), plus the newest labs as code idioms: `operations/RankExchange.jsx`
(columns, ranks, tie/open gestures, `coachOf`), `operations/FairShare.jsx` + `primitives/CakeFigure.jsx` (kit composition, the always-open free
card, `KidFigure` scene), `operations/FractionKnife.jsx`. Memory rules from the owner: independence from the book (the lab's words are the
platform's own), girls ALWAYS in hijab (`KidFigure`), tablet/laptop only, the always-open own-numbers panel, say each thing ONCE. Arithmetic:
exact integers only, in `packages/core/arithmetic/decimals.js` (yours, imported BY PATH, never the core barrel) — a value is `{ n, k }` =
`n / 10^k` with `Number.isSafeInteger(n)`; write what you need (parse `'2,35'` / `'2.35'` / `'3125/1000'`, exact compare, write with the
decimal COMMA, `fractionOf`, decomposition by rank, shift by a power of ten, Arabic reading « ثلاثة أعشار وخمسة أجزاء من مائة ») and TEST it.

**Why this is not another lab (DNA §12).** `rank-exchange` (same unit): the hand moves QUANTITIES between ranks (ties ten into one, opens one into
ten); the written digits are an OUTPUT. `fraction-knife`: the hand holds d, the number of equal pieces, of ONE whole and a fixed share.
`fair-share`: the hand cuts and picks a share. `digit-cards`: the digit is the object, carried into slots. Here the DIGITS are FIXED on a printed
slip and **the hand holds the COMMA** — its place in the string of digits, i.e. the number of digits after it. The value is `N / 10^p`; the
quantity is an OUTPUT drawn in honest blocks (mosaic) or read on rank names (machine). What resists: the comma never leaves the string of digits;
in `machine`, the comma cannot pass the end of the digits — a zero must be added there first (« لا رقم هنا »).

**Props contract (fixed — the lesson is written against it; `levels.js` already holds the two presets):**

```jsx
<Manipulation type="decimal-comma"
  world="mosaic" | "machine"
  tasks={[ …task objects… ]}          // the sequence of tasks of the level (preset) — the lesson may pass its own for `machine`
  level, levels, title, lead          // as every type (levels={false} for a standalone use)
  onTrial={(e) => …}                  // EVERY judged release of the comma / every judged zero
  onFinished={({ tasks }) => …}       // all tasks of the sequence done
/>
```

Task objects (digits are a STRING of 1–6 Latin digits, may contain 0; the decimal mark of every string below is a comma or a slash):

| kind | fields | the student's job | judged by |
|---|---|---|---|
| `match` | `digits: '235'`, `target: '2,35'` | the client's TABLE shows the target amount as blocks; the slip prints `digits` with the comma at the far right; slide the comma until the workshop's tray (blocks drawn from the slip) matches the table | exact value `N/10^p` equals the target |
| `fraction` | `digits: '3125'`, `target: '3125/1000'` | NO table: the order is the fraction (shown as a fraction); slide the comma until the slip's amount equals it; the slip's live readout shows its own fraction `N/10^p` | exact value equals the target |
| `shift` | `start: '143,75'`, `op: '×1000'` | `machine` world: an input slip (start, comma fixed) goes through a machine whose operator is one of ×10 ×100 ×1000 ÷10 ÷100 ÷1000 ×0,1 ×0,01 ×0,001; the OUTPUT slip starts with the same digits and the same comma; slide the comma (and add zeros where the digits run out) until the output equals the machine's result | exact value of the output = start × 10^e |

`levels.js` presets (mosaic): مبتدئ `[match 235→2,35, match 37→0,37, match 05→0,05]` (platform context: the zellige workshop; 2 panels + 3 strips
+ 5 tiles on the client's table; the same digits make 235 panels, 23,5, 2,35 or 0,235 — the student SEES why the comma matters; the second
and third tasks teach the zero that keeps an empty tenths place); متقدم `[fraction 3125/1000, fraction 605/100, match 250→2,5]` (the digit count after
the comma equals the zeros of the denominator; the last task: 2,50 and 2,5 fill the table the same — a zero at the very end changes nothing).
The `machine` tasks are passed by the module (module 4): مبتدئ `[shift 3,5 ×10, shift 3,5 ×100, shift 3,5 ÷10, shift 3,5 ÷100]`; متقدم
`[shift 143,75 ×1000, shift 43,7 ÷1000, shift 27,5 ×0,1, shift 0,6 ×0,01]`. Support any task object of these three kinds with any digits (the
module may pass others), and tolerate `tasks` of a single object.

**The slip (both worlds).** A row of big digit tiles in an LTR island (`dir="ltr"`, bidi isolates, Latin digits). Between/around the tiles the
gaps (`len + 1` positions). The comma is a BIG round handle (≥ 44 px, lifts under the finger) sitting in a gap: pointer drag with snapping to
the nearest gap, tap a gap to jump there, keyboard (focus the comma; ← → move it, Home/End; remember the island is LTR: ArrowLeft moves it left).
`point` = the number of digits after the comma (0 = no decimal part, `len` = the comma before the first digit — the slip then prints `0,` itself).
Under the digits, the rank of each digit follows the comma (as short pills or as the piece icon of the world — your design call, say it once):
units, tenths, hundredths, thousandths (آحاد، أعشار، أجزاء من مائة، أجزاء من ألف) to the right of the units digit, tens, hundreds … to the left.
Live next to the slip: the number as written (`[data-dc-written]`, e.g. `2,35`), and its fraction `235/100` (`[data-dc-fraction]`; the
denominator's zeros are drawn as visible zeros, never a power of ten notation). Never print a rule.

**World `mosaic` (theme `mosaic`, platform).** A zellige workshop (Algerian geometric tile art, Tlemcen/Fès-style colours — no real artwork, a
plain 8-point-star tessellation is a fine motif). The UNIT is one PANEL = a 10 × 10 grid of small tiles; blocks, drawn to honest relative sizes:
PANEL (1), STRIP (1/10: a column of 10 tiles, same height as the panel), TILE (1/100), SHARD (1/1000: a tile cut into ten thin slivers — draw
it as a tile with a visible 10-way cut; a shard is exactly 1/10 of a tile's area). Blocks of the slip's amount are laid out from the digits
with the current comma: the digit at the units rank counts panels, at tenths strips, at hundredths tiles, at thousandths shards; ranks above
units (tens, hundreds…) count GROUPS of ten / a hundred panels (draw a compact ×10 / ×100 bundle icon) or collapse to one panel icon with a
`×N` badge once N > 12 — exact counts always. Ranks beyond thousandths (a 4th digit after the comma) never occur in tasks; the FREE panel
limits the slip to 5 digits and the comma so that at most 3 decimal places show blocks — beyond that print the pieces as « أصغر من شظية »
without lying about their size (your design call; document it). A craftswoman `KidFigure` (a girl in hijab, mood reacts) works at the table.
Two zones on the stage: **the client's table** (`match`: the target amount in blocks; `fraction`: the fraction printed big instead of blocks)
and **the workshop tray** (the slip's amount in blocks, re-drawn at every comma move). Verdict states (a banner under the stage that never
makes the stage jump): `exact` (stamp), `more` (the tray holds more than the order), `less`; never the rule, never the target's comma
position. The sizes of the blocks DO change as the comma moves — that is the point; make the change legible (blocks regroup with a short
motion; reduced motion = instant).
A trial is a RELEASE of the comma (or a tap on a gap) — every release is judged and reported once; a keyboard step is a release.

**World `machine` (theme `mosaic`, same workshop: « آلة العشرة »).** Stage: the machine in the middle with its operator pill; above it the INPUT
slip (read-only, comma fixed, its ranks named); below it the OUTPUT slip (the student's). Same drag/tap/keyboard comma. **Zeros**: two `+ 0`
affordances at the ends of the output slip (`[data-dc-zero=left|right]`, ≤ 3 added each side, removable); the comma can only be released inside
the string of digits + added zeros, so ×1000 of 3,5 needs two zeros on the right and ÷100 of 3,5 needs one on the left: a release that would pass
the end is refused with the verdict `nodigit` (« لا رقم هنا: أضف صفرًا ») and the comma stays at the end. The rank pills under the output digits
FOLLOW the comma, so the student sees each digit change rank (the 7 of 143,75 was « أعشار », it is now « آحاد »); thin links from each input digit
to the same digit of the output show how many places it travelled. Judged on every release/zero change: `exact`, `more`, `less` (the output is
bigger/smaller than the machine's result). The leading zero before the comma is automatic; an extra zero is never an error when the value is
right, but the formal phase shows the writing WITHOUT unnecessary zeros.

**Free panel — always open (owner rule, 2026-10-15).** Under each world, a card « جرّب أعدادك أنت » with a digits field (≤ 5 Latin digits;
`inputMode="numeric"`) lets the student type ANY digits and slide the comma over them: in `mosaic` the blocks of that amount, in `machine` a
free operator selector (the 9 operators). Free trials carry `free: true` (the lesson ignores them), never count for `discoveryReady`, `canNext`
or `onFinished`; a button returns to the guided task (see `FairShare.jsx › setCustom / toGuided`).

**Discovery and formal phase.** `discoveryReady` = every task of the level done. Discovery (`ManipulationDiscovery`), mosaic: « ماذا يغيّر موضعُ الفاصلة؟ »
right: « كلّ خطوة نحو اليمين تجعل القطعة التي يعدّها الرقم أصغر بعشر مرّات » (no digit, no numbers); wrong, each refuted with the student's OWN
boards (`refutations` from the trials): « لا يغيّر الفاصلةُ المقدارَ، بل طريقة قراءته فقط » (his 235 became 235 panels and 0,235) and « العدد الأطول
أكبر دائمًا » (his 2,35 has three digits yet is smaller than 23,5, two digits less one… — build it from his trials). Machine: « ماذا فعلت الآلة
بأرقام عددك؟ » right: « حرّكت كل رقم عدد المراتب نفسه (عشرة في كل مرتبة) » / wrong: « غيّرت الأرقام نفسها » (his digits are the same) and « أضافت
أصفارًا فقط » (÷10 added none). Formal phase, mosaic: the rank table of the last task with the fraction (`235/100`, read « مئتان وخمسة وثلاثون
جزءًا من مائة »), the decomposition `2 + 3/10 + 5/100` and `2 + 3 × 0,1 + 5 × 0,01` (zero ranks greyed and absent from the sum), the count
« عدد الأجزاء من مائة » once; and after a `250 → 2,5` task, `2,50 = 2,5`. Formal, machine: the rank table before/after with the arrows and the
rule as the student's own boards (« ÷100: الفاصلة انتقلت مرتبتين إلى اليسار »). Exact strings are your call within DNA §16–§17, but NO
discovery or prompt string may contain the rule it hides (the render test checks it like `fairShare.render.test.jsx`).

**Callbacks.** `onTrial({ task: <index>, kind: 'match'|'fraction'|'shift', digits, point, shown: '23,5' (the slip as written, trailing zeros kept),
value: '23,5' (exact, comma), target: '2,35', ok: <bool>, verdict: 'exact'|'more'|'less'|'nodigit', zeros: { left, right }, free: <bool> })`
for every judged release / zero change / refused release; `onFinished({ tasks })` once when all guided tasks are done. `ok` is true ONLY
when the value equals the target. A solved task stays solved; « إعادة » restarts the task in progress.

**LabCoach.** Mandatory (§8quater): `logic/decimalComma.js › coachOf(state)` → `{ id, target, gesture }` — `grab` (the comma), `move`, `zero`
(machine, when the comma sits at the end and a zero is needed — it points at the ZERO button, never at the answer position), `next`. Its test
follows the coach to the end of every task of both levels and both worlds. Strings `decimalComma.coach.*`. It never says WHERE the comma
should end.

**Layout & measures.** One screen: `[data-dc-glance]` fits at 1280×800, 1366×768, 1024×768 and 768×1024, 1920×1080 for both levels, both worlds
(initial and mid-activity states); controls inside the stage on 768; sentence ≥ 18 px; the digits ≥ 40 px tall; all numbers LTR islands, Arabic
as DOM text; `useLessonViewport` budget like the other labs. Opens on CONTEXT then ONE question, NO title (§17.9): e.g. mosaic مبتدئ —
« بقي من وصل الطلبية الأرقام 2 3 5 دون فاصلة. على طاولة الزبون لوحتان و3 أعمدة و5 بلاطات. » / « حرّك الفاصلة حتى يصنع الحرفيّ ما يطلبه الزبون. »
(your final wording, your call, but a 12-year-old must be able to start dragging and know when she is done).

**DOM.** `[data-decimal-comma][data-world][data-task][data-solved][data-layout]`, `[data-dc-glance]`, `[data-dc-slip=input|output]`,
`[data-dc-digit=<i>]`, `[data-dc-comma][data-point]`, `[data-dc-gap=<j>]`, `[data-dc-rank=<i>]`, `[data-dc-written]`, `[data-dc-fraction]`,
`[data-dc-table=target|tray]`, `[data-dc-block=panel|strip|tile|shard]` (+ `data-count` on collapsed bundles), `[data-dc-op]`, `[data-dc-zero=left|right]`,
`[data-dc-verdict=exact|more|less|nodigit]`, `[data-dc-prompt][data-lit]`, `[data-dc-next]`, `[data-dc-free][data-active]`, `[data-dc-free-digits]`,
`[data-dc-formal]`, `[data-dc-kid]`, `[data-lab-fold=decimal-comma.trials]`, LabCoach markers (`[data-lab-coach-toggle]`, `[data-lab-coach][data-step]`…).

**Tests.** `packages/core/arithmetic/decimals.test.js` (exactness sweeps: parse/format round trip over all strings of ≤ 5 digits and every
comma place, shift ± 3, fraction text, the Arabic reading), `logic/decimalComma.test.js` (for every digits string ≤ 4 digits and every comma
place the value is `N/10^p` and exactly one comma place matches each target of the presets; the preset tasks are solvable; shift tasks need
exactly the zeros you document; the coach followed to the end; block counts equal the digits at every comma place; layout swept at five
widths), `operations/decimalComma.render.test.jsx` (both worlds render, no raw keys, opens on CONTEXT then ONE question, says each thing once,
no discovery/prompt string leaks the rule). Then `cd apps/web && npx vitest run src/lessons/common/manipulations src/lessons/common/i18nHookScope.test.js`
and `cd packages/core && npx vitest run arithmetic/decimals.test.js`. Also extend `apps/web/e2e/lesson-kit/lab-coach.mjs` ONLY if its structure
asks for a per-lab entry. Report: files, tests, the DOM as built, screenshots reviewed (initial, mid-activity, refusal, formal phase, both
worlds, both levels, at 768×1024, 1024×768, 1280×800, 1366×768, 1920×1080 — taken with Playwright against :5174, LOOKED at one by one) and what
changed after looking at them.

## Bank author — `content/practice/1am/kusur-ashriya-kitaba/`

Exactly the unit-2 bank brief (`docs/sources/1am/unit2/brief-authors.md` « Bank author » — its reading list, rules, wiring and gates), with:

- LP ids `1am_kusur-ashriya-kitaba_P1..P4` (above), each primary on ≥ 8 questions (P4 ≥ 10: it is the most examined).
- **Corpus** (`exams-index.json`, `grade: 1am`, items `1am.m1.r02`, `1am.m1.r03`, `1am.m5.x1`; badge « على منوال اختبار الفصل الأول » for
  semester 1, `semester: 1`, `modelledOn: "1am-s1"` for the generated ones; `1am-s2-64` ex 1 → « الفصل الثاني »). Exercises whose decimal-fraction
  / decimal-writing / × ÷ 10^k parts are IN this lesson's scope (read the PDFs under `docs/Exames-1 AM to 3AM/1am/`; `pdftotext -layout`, `pdftoppm
  -r 110` for scans): `1am-s1-91` ex 1 (fraction → decimal writing; the comparison / ordering parts belong to `muqaranat-adad-ashriya`: only as
  `counted: false` steps) and ex 2 (× ÷ 0,1 0,01 100 1000), `1am-s1-93` ex 1 (rank, × by 10) and ex 2 (decimal from a decomposition, fractional
  writing; the ordering part excluded), `1am-s1-94` ex 2 (× ÷ 10, 100, 0,1; comparison part excluded), `1am-s1-95` ex 1 (table: decimal number /
  decimal fraction / decomposition; place the comma) and ex 2 (× 10, 0,01), `1am-s1-96` ex 1 (standard decomposition, ÷ 1000) and ex 2 (blanks × ÷ 1000, 0,01),
  `1am-s1-97` ex 1 (number of tenths, place the comma) and ex 2, `1am-s1-98` ex 1 (table × ÷ 100 and 0,01; decimal fraction; decomposition),
  `1am-s1-99` ex 1 (table decimal/fractional writing, × ÷ 0,01 0,001), `1am-s1-101` ex 2 (× ÷ 0,1 0,01; the comparison part excluded),
  `1am-s1-104` ex 1 (fractional and decomposed writing, × ÷ 100 and 0,001; the descending order excluded), `1am-s1-106` ex 1 (decimal writing of fractions)
  and ex 2 (× ÷ 100, 0,1, 1000; the descending order excluded), `1am-s2-64` ex 1 (fractional ↔ decimal writing, × ÷). Ordering / comparison is
  `muqaranat-adad-ashriya`, rank names of naturals `kitabat-adad-tabii`: allowed ONLY as `counted: false` steps of a level-4/5 exercise. `1am-s2-65`
  ex 1 (adding decimal fractions) may be used for the sum of decimal fractions ONLY (item `1am.m5.r03`: `3/10 + 5/100 = 35/100`, no reduction —
  reduction is `ikhtizal-kitaba-kasriya`). About half of levels 3–5 modelled on ONE precise corpus exercise; the rest `term_exam_modelled`
  and a few `adapted` from the textbook elements listed below.
- **Textbook elements you may cite** (destination `kusur-ashriya-kitaba`): `prep` (items 7–9 only), `act-2`, `act-3`, `know-2`, `know-3`, `know-4`
  (its item b only), `method-1`, `now-12`, `method-2`, `now-14`, `ex-4` … `ex-11`, `ex-12` (items ②–④ only), `ex-13`, `ex-14`, `ex-26`, `ex-27`, `ex-28`,
  `self-2` … `self-6`, `self-13`. Nothing else (`check:textbook` fails on any other id; `deep-3` ③④ and every ordering item are `muqaranat`'s).
  Read `docs/sources/1am/unit1/extraction.json` for the answers (computed), but REWRITE every exercise: own contexts, own numbers (independence from
  the book — never copy a statement).
- **What is assessed:** (P1) the tenths / hundredths / thousandths of the unit (a shaded part of a 10 × 10 grid or a bar → a fraction with denominator
  10, 100, 1000; the equal writings 3/10 = 30/100 = 300/1000; a quantity above 1: 243/100 = 2 + 4/10 + 3/100); (P2) decimal writing → decimal fraction (digits
  after the comma = zeros: 31,25 = 3125/100; 0,05 = 5/100; 15 = 150/10; 43,5 = …/1000) and back (9345/1000 = 9,345; 356/10; 2017/1000), the zero that keeps a
  place (0,05 vs 0,5) and the unnecessary zeros (340,40 = 340,4; 07,5 = 7,5; 12,0 = 12); (P3) the standard decomposition both ways, terms out of order
  (`5 + 6×100 + 3×1000 + 2/10 → 3605,2`), `× 0,1` / `× 1/10` forms, « عدد الأعشار / الأجزاء من مائة » of a decimal (217,48 holds 2174 tenths,
  21748 hundredths), the sum of decimal fractions; (P4) × ÷ 10, 100, 1000 and × ÷ 0,1 0,01 0,001 mentally, zeros that appear (3,5 × 100 = 350; 3,5 ÷ 100 =
  0,035; 15 ÷ 10 000), « the missing factor » blanks (… × 100 = 4 , 43,7 ÷ … = 0,437), a calculator exercise with a broken decimal key. Distractors are real
  misconceptions, every one FALSE: `MISC-KUSUR-ADD-ZERO` (× 10 adds a zero: 3,5 × 10 = 3,50), `MISC-KUSUR-COMMA-LEFT` (× moves the comma left), `MISC-KUSUR-
  DEN-DIGITS` (35,2 = 352/1000: denominator not matching the digits), `MISC-KUSUR-ZERO-PLACE` (0,05 = 5/10), `MISC-KUSUR-NUM-DEN-SWAP`, `MISC-KUSUR-SPLIT-DIGITS`
  (2,35 = 2 + 35/10), `MISC-KUSUR-ORDER-TERMS` (the sum's terms read in the order written), `MISC-KUSUR-TRAILING-ZERO` (2,50 ≠ 2,5), `MISC-KUSUR-TENTHS-COUNT`
  (the number of tenths of 217,48 is 4), `MISC-KUSUR-MULT-SHRINKS` (× 0,1 makes it bigger).
- `answerType`: `choice` (every distractor FALSE and tagged `misconceptionId`), `rational` (a value; decimal comma accepted; exact decimals via
  `scripts/practice-oracle/helpers.mjs`), fractions as `a/b` strings per the existing banks (see `ikhtizal-kitaba-kasriya` and `kitabat-adad-tabii`), `selfCheck`
  for « برّر » steps. A `choice` NEVER opposes two writings of the same value as right/wrong (« 2,5 » / « 2,50 »).
- **Oracle** `scripts/practice-oracle/kusur-ashriya-kitaba.mjs`: recomputes EVERY constructed answer and every choice key with its OWN exact decimal
  arithmetic (BigInt or the helpers), never by importing the lab's `decimals.js`.
- **Wiring + gates you run:** exactly as in the unit-2 brief (`active.json`, `exam-style.json`, `policy.json`, `misconceptions.json`; `node scripts/validate-exercises.mjs
  --strict`, the oracle test, `node scripts/check-textbook-coverage.mjs`, `npx vitest run scripts`). Do NOT run `npm run build`. Report: files, counts per level
  and per LP, the corpus exercises used (file + exercise), test results.


# Lesson 4 — `muqaranat-adad-ashriya` « مقارنة الأعداد العشرية وترتيبها » (cycle moyen rollout, batch 4 entry 2, 2026-10-15)

Same organisation as the lessons above (file ownership tables apply with the names below). The lead writes the lesson
(`apps/web/src/lessons/moyen/1am/ansab_al_aadad_wal_hisab/adad-tabiiya-ashriya/muqaranat-adad-ashriya/`) and the extraction destinations
(`build-extraction.py`: `act-5` moves to module 4 as an APPLICATION; know-6 / know-7 module 2; method-3 + now-16 module 3; ex-17…ex-20 module 4;
prep item 5 module 0; `deep-3` ③④ and `ict` have module `null` = bank / final test / exercises).

| Author | Owns | Never touches |
|---|---|---|
| **Lab** | `manipulations/operations/RulerCompare.jsx`, `manipulations/logic/rulerCompare.js` (+ `.test.js`), `manipulations/operations/rulerCompare.render.test.jsx`, a new section in `packages/core/arithmetic/decimals.js` ONLY by ADDING exports (+ tests in `decimals.test.js`), drawing primitives it needs under `manipulations/primitives/`, the `ruler-compare` entry of `manipulations/manipulationRegistry.js`, the `rulerCompare` namespace of `i18n/locales/ar/lesson.manipulation.json`, its section in `MANIPULATION_CONTRACT.md` (`## 2quatervicies`, after `2tervicies`) and its row in `MANIPULATION_DNA.md` §15 | the lesson folder, `content/practice/**`, the extraction, `levels.js` / `manipulationTypes.js` / `manipulationLevels.js` (the lead already wrote the type, the theme `sandpit` and the two presets — ask the lead if a preset must change; you MAY edit the preset `numbers` if a task proves unsolvable, and report it) |
| **Bank** | `content/practice/1am/muqaranat-adad-ashriya/**`, the lesson's entries in `content/practice/{active,exam-style,policy,misconceptions}.json`, `scripts/practice-oracle/muqaranat-adad-ashriya.mjs` and its import in `scripts/practice-answer-oracle.test.mjs` | the lesson folder, the lab, the extraction |

Already done by the lead (do not redo): type `'ruler-compare'` in `packages/core/curriculum/manipulationTypes.js` (read its comment), theme
`sandpit` in `VISUAL_THEMES`, the two presets in `manipulations/levels.js` (**their `numbers` are the props contract below**). Until the lab author
adds the registry entry `manipulationRegistry.test.js` / `levels.test.js` are red on `ruler-compare` (expected). Lesson pages mount while the
lesson is `coming_soon`: `http://localhost:5174/courses/moyen/1am/ansab_al_aadad_wal_hisab/muqaranat-adad-ashriya/nashat` (module 1 = the lab,
both levels) and `…/tariqa` (module 3 = a standalone `order` use) — the lead writes them in the first minutes; until they load use vitest
render tests. A Vite of the repo may already run on :5174 (check `curl -s localhost:5174`; if not, start ONE with
`cd apps/web && npx vite --port 5174`; never touch 5173). Do NOT run `npm run build`. Screens are TABLET and LAPTOP only (768×1024, 1024×768,
1280×800, 1366×768, 1920×1080); phones are not supported (owner, 2026-10-15).

## The lesson in one paragraph

Programme item `1am.m1.r04` « ترتيب أعداد عشرية ». Net link `1am.m1.r02 → 1am.m1.r04` (requires). The idea the student must DISCOVER:
**a decimal number is compared like a written word of ranks, left to right: first the whole parts; if they are equal, the tenths digit, then
the hundredths, … — the first rank where the digits differ decides. Equivalently: complete both numbers with unnecessary zeros up to the same
number of decimals (3,2 = 3,20) and compare two natural numbers (320 hundredths against 314 hundredths). Having more digits after the comma does
NOT make a number bigger (3,14 < 3,2).** Ordering a series is comparing pairs; `<` and `>` are the symbols, ascending = from the smallest.

Final الكفاءات (`1am_muqaranat-adad-ashriya_P<n>`, order of the drafts kept):

1. **P1** مقارنة عددين عشريين (مكتوبين بالفاصلة أو على شكل كسرين عشريين) جزآهما الصحيحان مختلفان أو متساويان، بمقارنة الجزأين الصحيحين ثم الأرقام رتبة برتبة
2. **P2** تفادي الخطإ الشائع «$3{,}14 > 3{,}2$ لأن $14>2$» بإتمام الأرقام العشرية بأصفار غير ضرورية ليصير للعددين عدد الأرقام نفسه بعد الفاصلة (مثل $3{,}2=3{,}20$)
3. **P3** ترتيب سلسلة أعداد عشرية تصاعديا أو تنازليا واستعمال الرمزين $<$ و $>$، وتشكيل أصغر أو أكبر عدد عشري من أرقام معطاة

`pointPrerequisites` (net links only): P1 ← `1am_kitabat-adad-tabii_P2`, `1am_kusur-ashriya-kitaba_P2`; P2 ← `1am_kusur-ashriya-kitaba_P2`, P1; P3 ← P1, P2.
The lesson stands on `kitabat-adad-tabii` (ranks of a written number) and `kusur-ashriya-kitaba` (the comma, tenths / hundredths, the
unnecessary zero 2,50 = 2,5): it recalls them, never rebuilds them. NOT in scope (next lessons): the graduated half-line (`adad-ashri-mustaqim-mudarraj`:
placing and reading a point on a line, zooming), bracketing and rounding (`hasr-qiyam-muqarraba`), inserting a number between two decimals.

Lesson plan (lead, ≈ 85 min): 0 أستعدّ · 1 نشاط « القفز الطويل » (the lab, both levels) · 2 معارف · 3 طريقة « ألف مقارنة وأرتّب » (the lab standalone,
`order`) · 4 أتمرّن · 5–7 three مسائل · 8 إختبار أولي.

## Lab author — `ruler-compare`

Read first what the lessons above list for their lab authors (MANIPULATION_DNA all — §12, §16 and **§17 incl. §17.7, §17.9, §17.11 (LabCoach) are
binding**; MANIPULATION_CONTRACT §1, §2, §2bis, §4.2, §6bis, §6ter, §7, §7bis-levels, §7ter, §7quater, §8, §8bis, §8ter (the kit), **§8quater
(LabCoach — mandatory)**, §9, and the sections of the newest labs `2tervicies` `decimal-comma` and `2duovicies` `fair-share` incl. « جرّب أعدادك أنت
— always open »), plus the code idioms: `operations/DecimalComma.jsx` (+ `primitives/CommaSlip.jsx`, `MosaicFigure.jsx`: honest blocks), `operations/FairShare.jsx`,
`operations/RankExchange.jsx`. Owner rules: independence from the book (the lab's wording is the platform's own — no « كتاب »), girls ALWAYS in hijab (`primitives/KidFigure.jsx`,
never draw a person locally), tablet/laptop only, the always-open own-numbers panel, say each thing ONCE. Arithmetic: exact integers only. `packages/core/arithmetic/decimals.js`
exists (values `{ n, k }`, `parse`, `cmp`, `normalize`, `format`…): ADD exports there (e.g. `readAt(v, g)` → `{ count, rest }` = `floor(v·10^g)` and the exact remainder,
`decidedAt(a, b, g)`, `minGraduation(a, b)`), import BY PATH, never the core barrel; test them.

**Why this is not another lab (DNA §12).** `decimal-comma` (same unit): the DIGITS are fixed, the hand holds the COMMA. `rank-exchange`: the hand moves QUANTITIES between ranks.
`fraction-knife`: the hand holds d, the number of equal pieces of ONE whole. Here the hand holds **the GRADUATION of the measuring ruler** shared by the numbers being
compared (1 m, 1 dm, 1 cm, 1 mm), and in the ordering level also places the numbers in a row. A jump length in metres is read on the ruler: at graduation g the number is a
WHOLE number of graduations plus a leftover strictly smaller than one graduation, drawn hatched and never rounded away. What resists: the verdict `< = >` is refused while the ruler
cannot separate the numbers (4,6 m and 4,65 m both read « 46 dm + leftover »: the lamp says the ruler is too coarse, in the student's numbers, without telling which finer ruler); a wrong
verdict is refuted by the readings (« على مسطرة السنتيمتر: 460 مقابل 435 »). The mathematical content that must become VISIBLE: (1) when the whole parts differ the coarsest ruler already separates the numbers;
(2) when they are equal, the first graduation where the two readings differ is the first rank where the digits differ, and the order of the readings is the order of the numbers;
(3) refining one number alone (4,6 → 4,60) changes nothing, but a ruler fine enough for both turns the comparison into one between NATURAL numbers (460 against 435) — the misleading
reading « 35 > 6 » (comparing 4,35 with 4,6 as if the digits after the comma were a natural) is refuted by the same ruler; (4) 12,70 and 12,7 read the same at every graduation (equal, no leftover from cm on).

**Props contract (fixed — the lesson is written against it; `levels.js` holds the presets):**

```jsx
<Manipulation type="ruler-compare"
  world="jump"                       // the only world: the long-jump pit of a school sports day (theme `sandpit`)
  tasks={[ …task objects… ]}         // the sequence of tasks of the level (preset); the lesson may pass its own when levels={false}
  level, levels, title, lead         // as every type (levels={false} for a standalone use)
  onTrial={(e) => …}                 // EVERY judged gesture, via state.report (see below)
  onFinished={({ tasks }) => …}      // all tasks of the sequence done
/>
```

| task kind | fields | the student's job | judged by |
|---|---|---|---|
| `compare` | `a: '4,6'`, `b: '4,35'` (strings with a decimal COMMA, 1–3 decimals, whole part 0–99) | set the graduation until the ruler separates the two jumps (or shows them equal), then choose `<`, `=` or `>` for `a ? b` | exact comparison `cmp(a, b)` |
| `order` | `values: ['7,4', …]` (3–6 strings, may contain equal values and an integer written without comma), `dir: 'asc' \| 'desc'` | set ONE common graduation for the whole row, and place the jumps in the order of the podium (a row of slots, smallest-first for `asc`) | exact order; equal values may stand in any order among themselves |

`onTrial` event: `{ task: <index>, kind: 'compare' | 'order', event: 'ruler' | 'verdict' | 'place' | 'check', g: 0..3, a, b, verdict: '<' | '=' | '>' | null, ok: boolean | null, decided: boolean, free: boolean, … }`.
The lesson uses (1) `event: 'verdict'` with `ok` and `g` (« the student found the verdict on the dm ruler / needed the cm ruler »), and `a`, `b` as strings; (2) `event: 'ruler'` with `g` (« the student tried the finer ruler »);
(3) `free: true` for the always-open own-numbers panel — the lesson ignores those as evidence.

**The lab must offer, in this order (suggested — DNA §17 decides the details):**
- **Context then ONE direct question, no title** (§17.9): the school sports day, two jumps (names of children, a `KidFigure` girl in hijab and a boy), e.g. « قفزت ريم 4,6 م وقفز سامي 4,35 م. من قفز أبعد؟ ». The question names the goal and the end state.
- **The ruler** the hand holds: a horizontal tape (LTR island, `dir="ltr"`, labels in Arabic: متر، ديسيمتر، سنتيمتر، ميليمتر) with a handle / stepper with FOUR stops. Each jump is a bar on the pit sand; under it the reading at the current graduation as
  « n دسم + باقٍ » (number of graduations, leftover hatched, exact — drawn as a fraction of one graduation). The leftover is honest: 4,35 m on the dm ruler is 43 dm + a hatched part of a dm (half) — never rounded.
  The reading n is a NATURAL number written in Latin digits (LTR islands) — it is the thing the student compares. Bars are NOT drawn to a misleading scale: if you draw them proportional to value the 6 cm difference is ~2 % of the length — use a zoomed
  "the pit near the take-off board" or a bracket "المسافة الكلية 4 م + …" so the difference is not decided by eye; the visual must not give the verdict away before the student has used the ruler. Decide and defend in your report.
- **Verdict**: three big buttons `<` `=` `>` (symbols as LTR islands, spoken form on aria-label: « أصغر من »…); enabled in the sense above; wrong → refuted by the readings; right → the lab names nothing, it SHOWS (the two readings side by side with the first differing rank highlighted in the written digits, e.g. 4,**6** / 4,**3**5).
  Do not state the rule in a string reachable before the formal phase (DNA §17.7; a render test like `decimalComma.render.test.jsx`).
- **`order` level**: five or six jumps on the sand; ONE ruler for the whole row (the finest needed = the maximum number of decimals); drag (pointer), tap-tap and keyboard to place the jumps into podium slots; « تحقّق » judges; a wrong order shows the first inversion with the readings. An integer (« 3 م ») reads `300 cm` at g = 2: no comma, still on the ruler.
- **Always-open « جرّب أعدادك »** panel (two inputs, Latin digits, comma or dot accepted, ≤ 3 decimals, whole part 0–99): shows the same readings and verdict lamp; `free: true` events.
- **Discovery + formal phase** like the other labs (`ManipulationDiscovery`): after the tasks, one question of the kind « ماذا يحدّد أيّ العددين أكبر؟ » with refutable wrong options built from the student's own numbers (`longer = bigger`, `bigger digits after the comma = bigger`),
  and a formal card: the written comparison with the first differing rank highlighted and `=` / `<` / `>` written; then `onFinished`. LabCoach (default on, one ring + sentence at each moment: the ruler handle, then a verdict button, never pointing at the answer).
- Not eligible for « جرّب كل الإمكانيات » if the free panel already exists (say so in the header).

**Layout:** one screen at every size, `[data-rc-glance]` = question + both bars + readings + verdict buttons without scrolling at 768×1024, 1024×768, 1280×800, 1366×768, 1920×1080 (use `useLessonViewport`, the kit, stretch like `DivisionJumps`). Strings: `lesson.manipulation.json › rulerCompare`, counted nouns through plural keys (متر/ديسيمتر/سنتيمتر/ميليمتر/قفزة), Latin numbers isolated, no local helper named `t`.

**DOM:** `[data-ruler-compare][data-world][data-task][data-solved]`, `[data-rc-glance]`, `[data-rc-grad=<0..3>]` (the stops), `[data-rc-reading=<index>][data-count]` (the whole-graduations count of jump index), `[data-rc-rest=<index>]` (leftover),
`[data-rc-verdict=<lt|eq|gt>]` (buttons), `[data-rc-lamp][data-decided]`, `[data-rc-slot=<i>]`, `[data-rc-jump=<index>]`, `[data-rc-check]`, `[data-rc-free]`, `[data-rc-formal]`, `[data-rc-refused=<kind>]`.

**Tests:** `decimals.test.js` additions (sweep: for every pair of decimals ≤ 3 decimals and whole part ≤ 20, `decidedAt` is monotone in g, equals the order of the numbers once decided, and `minGraduation` is the first rank where the digits differ);
`logic/rulerCompare.test.js` (each preset task solvable; the verdict is never enabled while undecided; the first decided graduation of each preset pair is the one documented: 4,6 / 4,35 → dm; 8,05 / 8,5 → dm; 12,70 / 12,7 → equal from g = 1; 9,87 / 10,2 → g = 0; the order tasks have the documented orders and ties; the coach followed to the end; layout swept at five widths);
`operations/rulerCompare.render.test.jsx` (both levels render, no raw keys, opens on CONTEXT then ONE question, says each thing once, no string before the formal phase leaks the rule, the free panel is open). Then `cd apps/web && npx vitest run src/lessons/common/manipulations src/lessons/common/i18nHookScope.test.js`
and `cd packages/core && npx vitest run arithmetic/decimals.test.js`. Extend `apps/web/e2e/lesson-kit/lab-coach.mjs` ONLY if its structure asks for a per-lab entry. Report: files, tests, the DOM as built, the screenshots reviewed (initial, mid-activity, refusal, a decided verdict, the order level mid-drag and solved, the formal phase, both levels, at 768×1024, 1024×768, 1280×800, 1366×768, 1920×1080 — taken with Playwright against :5174, LOOKED at one by one) and what changed after looking at them.

## Bank author — `content/practice/1am/muqaranat-adad-ashriya/`

Exactly the unit-2 bank brief (`docs/sources/1am/unit2/brief-authors.md` « Bank author » — its reading list, rules, wiring and gates) and the unit-1 lesson-2 bank brief above (§ « Bank author — kusur-ashriya-kitaba » — same file layout, `term_exam` /
`term_exam_modelled` / `adapted` provenance, oracle, `misconceptions.json`), with:

- LP ids `1am_muqaranat-adad-ashriya_P1..P3` (above), each primary on ≥ 12 questions (P2 ≥ 14: the zero-completion is the most examined).
- **Corpus** (`exams-index.json`, `grade: 1am`, item `1am.m1.r04`; badge by semester — « على منوال اختبار الفصل الأول » for semester 1, `semester: 1`, `modelledOn: "1am-s1"`; other terms by the paper). Search every 1AM paper (the index lists items; read the PDFs under
  `docs/Exames-1 AM to 3AM/1am/` with `pdftotext -layout`, `pdftoppm -r 110` for scans) for the comparison / ordering parts that the lessons `kusur-ashriya-kitaba` and `hasil-qisma-kasr` EXCLUDED
  (the « ranger dans l'ordre croissant / décroissant » questions of `1am-s1-91`, `-104`, `-106`, `-101`, `-93` and any other) and use them as `term_exam` exercises (about half of levels 3–5 modelled on ONE precise corpus exercise; the rest `term_exam_modelled` / `adapted`).
  Comparison parts of exercises whose other parts are decimal-fraction conversions or × ÷ 10^k belong to the other lesson: cite only the part that is IN this lesson's scope.
- **Textbook elements you may cite** (destination `muqaranat-adad-ashriya`): `prep` (item 5 only), `act-5`, `know-6`, `know-7`, `method-3`, `now-16`, `ex-17` … `ex-20`, `self-8`, `self-9`, `deep-3` (items ③④ only: the smallest / largest decimal formed from the cards 9 0 7 3 and a comma, no unnecessary zero), `ict` (the marks table of a class: largest / smallest mark and who; the spreadsheet sort is described, never required).
  Nothing else (`check:textbook` fails on any other id). Read `docs/sources/1am/unit1/extraction.json` for the answers (computed), but REWRITE every exercise: own contexts, own numbers (independence from the book — never copy a statement).
- **What is assessed:** (P1) compare two decimals with different whole parts (9,87 / 10,2), equal whole parts (tenths decide: 12,6 / 12,4; hundredths decide when tenths are equal), a natural number against a decimal (43 / 12,9), fractional writings (5/10 / 7/10, 25/10 / 32/100 → 2,5 / 0,32, 4/10 / 40/100 equal), `<` `>` `=` chosen from a set; (P2) the trap
  « more digits = bigger » and « the digits after the comma read as a natural » (3,14 / 3,2; 0,5 / 0,25; 8,05 / 8,5), completion with zeros (3,2 = 3,20; 6,5 = 6,500), the equal writings (4,70 = 4,7), the missing digit that makes an inequality true (5,☐2 < 5,3 …); (P3) order of a series ascending / descending (4–6 numbers incl. an integer and a number with a leading 0,…),
  the smallest / largest number from digit cards with a comma (cards 9 0 7 3 with ONE comma: smallest 0,379? read `deep-3` note: « no unnecessary zero » — the lead's reading is 0,379 and 970,3; keep to it), the symbols in a chain (`0,4 < 1,04 < 1,5`), the greatest / smallest mark of a table, the position of the symbol (`<` versus `>`).
  Distractors are real misconceptions, every one FALSE: `MISC-MUQARANA-DIGITS-AS-NATURAL` (3,14 > 3,2 because 14 > 2), `MISC-MUQARANA-LONGER-BIGGER` (more digits after the comma is bigger), `MISC-MUQARANA-IGNORE-WHOLE` (compare the decimal parts only), `MISC-MUQARANA-ZERO-CHANGES` (4,70 > 4,7), `MISC-MUQARANA-ZERO-PLACE` (8,05 > 8,5), `MISC-MUQARANA-SYMBOL-SWAP` (the symbol opened toward the smaller), `MISC-MUQARANA-ORDER-DIRECTION` (descending given for ascending), `MISC-MUQARANA-LAST-DIGIT` (compare the last digits), `MISC-MUQARANA-CARDS-ZERO-FIRST` (0 placed first without a comma: 0379 is not a number to write),
  `MISC-MUQARANA-FRACTION-NUMERATOR` (25/10 < 32/100 because 25 < 32). Each is declared in `misconceptions.json` like the earlier lessons' and the answer oracle recomputes every constructed answer.


---

# Lesson 3 — `adad-ashri-mustaqim-mudarraj` « الأعداد العشرية ونصف المستقيم المدرّج » (cycle moyen rollout, phase 3, 1AM pair 1 A, 2026-10-30)

Generated from the design card « 1 » of `docs/curriculum/PLAN_1AM_NUMBERS.md`. The lesson's programme item is **`1am.m5.r04`** (the catalogue entry's
`programmeItems`, unchanged; the card's « r04 » is the net PREREQUISITE `1am.m1.r04` — ordering — that « أستعدّ » measures with `1am.m1.r02`).
Extraction destinations (moved out of « pending » by the lead): `act-4` → module 1 (an APPLICATION after the lab, never the entry), `know-5` → 2,
`ex-15`, `ex-16` → 4, `self-7` → `null` (bank / final test).

| Author | Owns | Never touches |
|---|---|---|
| **Lab** | `manipulations/operations/JumpTape.jsx` (+ `operations/jumpTape/*`), `manipulations/logic/jumpTape.js` (+ `.test.js`), `operations/jumpTape.render.test.jsx`, a new section in `packages/core/arithmetic/decimals.js` ONLY by ADDING exports (+ tests in `decimals.test.js`) — or a new `packages/core/arithmetic/halfLine.js` imported BY PATH —, the `jump-tape` entry of `manipulationRegistry.js`, the `jumpTape` namespace of `i18n/locales/ar/lesson.manipulation.json`, its section in `MANIPULATION_CONTRACT.md` (`## 2novenquinquagies quinquies`, after the last `2novenquinquagies …` section — check the file's tail for the right ordinal) and its row in `MANIPULATION_DNA.md` §15 | the lesson folder, `content/practice/**`, the extraction, `lesson.config.js` |
| **Bank** | `content/practice/1am/adad-ashri-mustaqim-mudarraj/**`, the lesson's entries in `content/practice/{active,exam-style,policy,misconceptions}.json`, `scripts/practice-oracle/adad-ashri-mustaqim-mudarraj.mjs` and its import in `scripts/practice-answer-oracle.test.mjs` | the lesson folder, the lab, the extraction |

Already done by the lead (do not redo): type `'jump-tape'` in `packages/core/curriculum/manipulationTypes.js` (read its comment), theme `sportsday` in `VISUAL_THEMES`,
the two presets in `manipulations/levels.js` and their branch in `levels.test.js` (**their `numbers` are the props contract below**).

## Lab author — `jump-tape` « شريط القفز » (read first: `GapCaliper.jsx` + `gapCaliper/art.jsx` + `logic/gapCaliper.js` + its tests = the newest lab built to the prototype; `RulerCompare.jsx` / `primitives/RulerTape.jsx` for the sports-day look; `MANIPULATION_CONTRACT.md` §2quatervicies, §8ter, §8quater, §8quinquies; `docs/reports/LAB_PROTOTYPE_ROLLOUT.md` §2–§6)

**World.** The school's sports day. A long-jump pit seen from the side: raked sand, the white take-off board on the LEFT (the board IS the origin O), the pit's end on the RIGHT, a yellow measuring tape unrolled along it (numbers always LTR, `dir=ltr`
inside the SVG, Latin digits). **The tape shows O and NOTHING ELSE at the start.** People: KidFigure only (girls in hijab; Salma, Yasmine; Anis) — jumpers' bibs and the flag tray; never a drawing of a person locally. No title: a context of one or two sentences,
then ONE direct question (DNA §17.9).

**Tape geometry (pure, in `logic/jumpTape.js`, exact decimals through `decimals.js`).** The window is `W = 600` units wide (SVG user units; the tape starts at x = 0, the pit's end bar is at x = 600). A big mark is worth `step` (1 or 0,1); ten small ticks per big mark, each worth `step/10`
(0,1 or 0,01) — **the spacing between two small ticks IS 1/10 of the big-mark length**. A task has `from` (value at the left edge of the window; marks at from, from+step, …) and `unit` = pixels per big mark `u`:
- `unit: 'free'` (مبتدئ b1, b2): **STEP 1 — the hand stretches the « 1 » mark** (a 52 px knob on the first mark; drag / ← → / tap): `u` runs continuously from 40 to 230; the tape redraws live (marks 1, 2, 3 … at `k·u`). The unit is ACCEPTED on release iff
  `ceil(longest)·u ≤ 580` (the pit must hold the mark above the longest jump) **and** `u/10 ≥ 10` (small ticks distinct). b1 longest 3,1 → u ∈ [100, 145]; b2 longest 3 → u ∈ [100, 193]. Refusals are DRAWN, never worded as the answer: too long → the marks beyond the pit's end go grey with a dashed
  « خارج الحفرة » bar and the jumper cards of the longest jump show a small « لا يتّسع » cross; too short → the ten ticks of a unit are drawn as a grey smudge and no tick shows. When accepted the tape draws its ten ticks per unit (staggered animation) and the unit locks (« إعادة » unlocks everything).
  The student is never told the range.
- `unit: <number>` (b3): u given (140), step 1 only.
- read tasks: u is fixed so that the window holds 3 big marks (u = 200: a1 `0…3`, a2 `9…12`, a3 `4…4,3` with `step '0,1'`, small ticks 0,01).

**plant task (مبتدئ).** `jumps` are written numbers `'2,4'`, `'3,1'`, `'1,8'`, `'3'`, and the SUM writing `'2+6/10'` (shown as « 2 + 6/10 » on the bib; its abscissa is 2,6). Each jump = a bib card (KidFigure + name + the written distance) in a tray under the tape; **the hand drags the card's flag onto the tape** (snap to the nearest small tick within ±½ tick, ghost follows the finger;
tap-tap and keyboard also work: Tab to a flag, ← → moves it tick by tick, Enter plants). While the flag is dragged, **the abscissa reads live above it** in the shape `A(2,4)` (letter = the flag's own letter A, B, C; Latin digits, comma). A planted flag can be picked up again. « ثبّت » (or the last flag planted) asks the referee:
exact judge `judgePlant(task, jump, planted)` → `{ ok, model, trueAt }`. **Resistance by DRAWING**: a wrong flag stays, and the jumper's FOOTPRINT appears in the sand at the TRUE place with a dashed gap between flag and footprint and the live reading of the planted flag beside it (never the right tick named). Models of a wrong planting (the bank's `MISC-ABSC-*`):
`swap` (the digits swapped: 2,4 planted at 4,2 — if beyond the visible window the flag is refused at the edge), `fromO` (only the decimal digit counted from O: 2,4 at 0,4), `wholeTicks` (the whole part counted in small ticks: 2,4 at 2 + 2 tenths? — i.e. `whole` read as tenths), `next` (the right mark but one tick off), `other`. Choose a clean set, document it, test it.
When all flags of the task are right: success celebration, stepper to the next task.

**read task (متقدم).** The flags are already planted (a figure: three coloured flags A, B, C at exact positions, some between two small ticks). **The hand holds a READING CURSOR** (a vertical hairline + a handle; drag / arrows; it moves from small tick to small tick). The cursor shows the abscissa of the tick it stands on (« المؤشّر عند 2,3 »).
For each flag (tap a flag to select it) the student answers by one of two buttons under the tape: « العلم على هذه التدريجة » (exact reading = the cursor's tick) or « العلم بين هذه والتي تليها » (bounds: [tick, tick + step/10]). Judge `judgeRead(flag, tick, mode)` → `{ ok, model }`: exact on a flag that is NOT on that tick → **refused by drawing**: the gap between the hairline and the flag is drawn (a hatched strip), the flag keeps its place, nothing is
said; bounds on a flag that IS exactly on a tick → refused (the flag touches the hairline: drawn); wrong tick → the hairline and the flag are shown apart. Models: `exactOnBetween`, `boundsOnTick`, `wrongTick`, `swap`.
A flag solved shows its reading beside it: `B(1,9)` or `2,3 < C < 2,4` (inequality, comma, Latin digits). a2 has **no origin on screen** (the window starts at 9: first mark labelled « 9 », an arrow « المبدأ ← »); a3 is graduated in hundredths (`step 0,1`).

**Always-open « جرّب أعدادك أنت »** (MANIPULATION_CONTRACT: free panel never counts for a task): one input (comma or dot; 0 ≤ value ≤ the window's right edge; at most 3 decimals); the SAME tape with the student's unit (u = 140 for 0…4) puts a flag at the exact place (between two ticks if needed, with its bounds).
Typed text is judged exactly; `free: true` trials never count; « عُد إلى مهامك ». Not « جرّب كل الإمكانيات ».

**Questions over the lab (L1, `useLabCheckpoint`)** after each task / step, 2–4 questions on what the student just DID, built from the task's own numbers, 2 hints each; the last chain ends on the rule. The card fixes the first two:
- after b1 step 1 (the unit locked): « كم تدريجة صغيرة في الوحدة الواحدة؟ » (10) then « ماذا يمثّل التباعد بين تدريجتين صغيرتين متتاليتين؟ » (1/10 = 0,1 of the unit);
- after b1 planting: « ما فاصلة العلم الأزرق؟ » (the flag of the longest jump: 3,1) then « كم وحدة وكم تدريجة صغيرة تفصل العلم الأحمر عن O؟ » (2 and 4);
- b2: the whole number (« العلم الذي فاصلته 3 : على أيّ تدريجة؟ » — on the mark 3, no small ticks); b3: « 2 + 6/10 » → 2,6;
- a1: the flag between two ticks (« بين أيّ تدريجتين يقع العلم C؟ » → 2,3 and 2,4); a2: « لماذا لا نراه نقطة O ومع ذلك نقرأ 10,8 ؟ »; a3: « كم تساوي الآن المسافة بين تدريجتين صغيرتين؟ » (0,01).
Never ask what the lab already said; wrong options are refuted by the student's own readings where possible.

**Rest of the prototype (non-negotiable):** `LabCoach` (`coachOf` pure, followed to the end of every task in the logic test; the ring points at the knob → a tray flag → the tape → « ثبّت » → next; read: cursor → a flag → exact/bounds → next, never at an answer), `LabStepper` (steps: unit · plant for `free` tasks, plant for the others, read), `useStepCelebration` re-armed after « إعادة »,
`playSfx` (gesture · `bell` · `flag` · `over`), off by default with the shell's « الصوت » switch, « إعادة » restarting EVERYTHING (state, locks, questions via `resetKey`), full screen (`immersive`), `guided={!!chain || ruleByCheckpoint}`, `useLabCheckpointSettings('jump-tape')` + `headerAction`. Screen budget: the lab column is ≈ 414 px wide at 1024×768 with the menu open and 494 px at 768×1024 — the SVG scales (`viewBox 0 0 600 …`), tray cards ≥ 44 px, glance block ≤ 768 px high at 1024×768.
Callbacks `onTrial({ task, kind, event: 'unit'|'plant'|'check'|'read'|'cursor'|'free', ok, refused?, model?, … })`, `onFinished({ tasks })` once. Strings: `lesson.manipulation.json › jumpTape` (Arabic; Latin digits; never a raw key or `{{`). DOM: `[data-jump-tape][data-level][data-kind][data-task][data-solved][data-layout]`, `[data-jt-glance]`, `[data-jt-knob]`, `[data-jt-unit]`, `[data-jt-tick=<value>]`, `[data-jt-flag=<id>][data-state][data-at]`, `[data-jt-tray]`, `[data-jt-print=<id>]`, `[data-jt-cursor][data-at]`, `[data-jt-exact]`, `[data-jt-bounds]`, `[data-jt-reading=<id>]`, `[data-jt-free]`, `[data-jt-next]`, `[data-jt-formal]`.
Tests: `logic/jumpTape.test.js` (unit range per task, tick values by exact decimals, every task solvable and every wrong model refused, coach followed to the end, a sweep of all ticks for `judgeRead` / `judgePlant`), `operations/jumpTape.render.test.jsx` (every task of every level: text, 2 hints per question, one right answer, no raw key / `{{`, guided-mode assertion — model `gapCaliper.render.test.jsx`), the manipulation registry test and `levels.test.js` green.
Distinct from `ruler-compare` (the hand holds the GRADUATION to separate two numbers), `decimal-comma`, `rank-exchange`, `fraction-knife`, `number-line-pegs` (a card CARRIED to a place, 3AM), `gap-caliper`, `zero-probe`. `talim-mustaqim-mudarraj` (pair 2) will own `stride-stamp` (the unit stick carried both sides of O): here the unit is STRETCHED, not stamped, and only to the right.
Check in the browser at 768×1024, 1024×768, 1280×800, 1366×768 (a Vite of the repo may already run on 5173 — check `curl -s localhost:5173`; if not, start ONE with `cd apps/web && npx vite --port 5173`): `http://localhost:5173/courses/moyen/1am/ansab_al_aadad_wal_hisab/adad-ashri-mustaqim-mudarraj/nashat` (module 1 = the lab, both levels; the lead writes it in the first minutes — until it loads use the vitest render tests). Take screenshots of the initial and mid-activity states of both levels, LOOK at them and iterate. Do NOT run `npm run build`. Do not touch `App.jsx`.

## The lesson in one paragraph

Entry (lab): the sports day (b1) — three jumps (2,4 · 3,1 · 1,8 m) to flag on a tape that shows only O: the hand stretches the unit, then the tape draws ten ticks per unit (each 1/10 = 0,1) and the hand plants the flags. Named afterwards: half-line, origin, unit, abscissa, O(0), A(2,4), « في حالات معيّنة لا يظهر المبدأ ».
الكفاءات: P1 draw the graduation (choose an origin and a unit, split the unit in equal parts); P2 read the abscissa of a point exactly or by bounds; P3 plant a point of known decimal abscissa (written 2,4 or 2 + 4/10). Module 4 (أتمرّن) applies the textbook's ex-15 (completing sequences with a constant step — 0,5 · 0,03 · −0,1 …) and ex-16 (reading the arrows of four graduated half-lines, from 0–4 to 9,1–9,2).

## Bank author — `content/practice/1am/adad-ashri-mustaqim-mudarraj/`

5 levels × 10 sheets in the BEM exam-sheet presentation (`EXERCISE_CONTRACT.md` « Présentation examen (BEM) », prototype `bahth-pgcd`; follow the published 1AM banks `muqaranat-adad-ashriya`, `hasil-qisma-kasr`, `qisma-iqlidiya-baqi`: same JSON shape, same statement-figure kinds (look at what exists for a graduated half-line: `kind: 'numberline'`/the half-line figure used by `muqaranat-adad-ashriya` and `hasil-qisma-kasr`; if none fits, ask the lead — do not invent a figure type).
Provenance (`EXERCISE_CONTRACT.md` « Term-exam provenance »): `term_exam` ONLY for an exercise you actually read in `docs/Exames-1 AM to 3AM/1am/SEMESTER 1/` / `SEMESTER 2/` (render papers without a text layer with `pdftoppm -r 150`); otherwise `platform_addition` + `reason: term_exam_modelled` + `modelledOn`, or `adapted` from the textbook elements `ex-15`, `ex-16`, `act-4`, `self-7`. Oracle `scripts/practice-oracle/adad-ashri-mustaqim-mudarraj.mjs` (answers computed independently in exact decimals), misconceptions `MISC-ABSC-*`
(`swap` 2,4 read 4,2 · `fromO` the decimal digit as the abscissa · `tickAsUnit` a tick counted as a whole unit · `shiftedOrigin` the first mark read as 0 when the origin is hidden · `count` counting marks instead of ticks · `hundredth` a tick of a 0,01-scale read as 0,1 · `boundsReversed`).
Level ladder: 1 read / plant on 0…4 graduated in tenths · 2 sums 2 + 4/10 and whole numbers · 3 hidden origin and steps 0,5 / 0,02 · 4 bounds (« حصر ») and hundredths · 5 mixed multi-step and short problems. Every level-1/2 sheet has the half-line figure; no student-visible line points to the textbook; contexts are Algerian, everyday and Islam-respecting (no pig, alcohol, gambling, dice, interest).
