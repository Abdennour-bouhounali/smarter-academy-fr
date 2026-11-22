# 1AM unit 3 « الضرب والقسمة » — authors' brief (lesson `qisma-iqlidiya-baqi`, 2026-10-14)

Cycle moyen rollout, phase 3 — same organisation as `docs/sources/1am/unit2/brief-authors.md` (read its tables of file ownership:
they apply here with the names below). The lead writes the lesson
(`apps/web/src/lessons/moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/qisma-iqlidiya-baqi/`) and the extraction
(`docs/sources/1am/unit3/extraction.json`, built by `build-extraction.py`).

| Author | Owns | Never touches |
|---|---|---|
| **Lab** | `manipulations/operations/DivisionJumps.jsx`, `manipulations/logic/divisionJumps.js` (+ `.test.js`), `manipulations/operations/divisionJumps.render.test.jsx`, the `division-jumps` entries of `manipulations/levels.js` and `manipulationRegistry.js`, the `divisionJumps` namespace of `i18n/locales/ar/lesson.manipulation.json` | the lesson folder, `content/practice/**`, the extraction |
| **Bank** | `content/practice/1am/qisma-iqlidiya-baqi/**`, the lesson's entries in `content/practice/{active,exam-style,policy,misconceptions}.json`, `scripts/practice-oracle/qisma-iqlidiya-baqi.mjs` and its import in `scripts/practice-answer-oracle.test.mjs` | the lesson folder, the lab, the extraction |

Already done by the lead: the type `'division-jumps'` is declared in `packages/core/curriculum/manipulationTypes.js`; the lab's world at
مبتدئ reuses the existing theme `garden` (flowers and bouquets, `primitives/itemThemes.js` / `ItemFigure`).

## The lesson in one paragraph

« القسمة الإقليدية » (1AM, textbook نشاط 3 p. 37, معارف 2 p. 41, exercises 15–21 pp. 45–46, ICT p. 50). Programme item `1am.m3.r01`
« تعيين حاصل وباقي القسمة الإقليدية لعدد طبيعي على عدد طبيعي مكتوب برقم واحد أو رقمين ». The idea the student must DISCOVER: the
quotient is the LARGEST number of groups of b that fit in a; we stop when what is left is SMALLER than b — not when nothing is left.
Two refusals bracket it: one group too many needs objects that do not exist (b × (q + 1) > a), one group too few leaves enough for
another group (r ≥ b). Hence a = b × q + r with r < b, and the bracket b × q ≤ a < b × (q + 1) (the textbook's « حصر »). The textbook's
own numbers: 279 flowers in bouquets of 14 (q = 19, r = 13; « 10 باقات؟ 20 باقة؟ »), and معارف 2's 253 pearls in necklaces of 17
(q = 14, r = 15) drawn on a NUMBER LINE of jumps of 17 (« 17 × 12 = 204, 17 × 13 = 221, 17 × 14 = 238, 17 × 15 = 255 »).

Final الكفاءات (`1am_qisma-iqlidiya-baqi_P<n>`):

1. **P1** إنجاز القسمة الإقليدية لعدد طبيعي على عدد طبيعي غير معدوم مكتوب برقم واحد أو رقمين
2. **P2** كتابة المساواة $a = b\times q + r$ مع $r<b$ وتسمية المقسوم والمقسوم عليه والحاصل والباقي
3. **P3** توظيف القسمة الإقليدية لحل مشكلات توزيع وتجميع

## Lab author — `division-jumps`

Read first exactly what the unit-2 brief lists for its lab author (MANIPULATION_DNA all; MANIPULATION_CONTRACT §1, §2, §2bis, §4.2,
§6bis, §6ter, §7, §7bis-levels, §7ter, §8, §8bis, §9; idioms `stats/GroupTanks.jsx`), plus `operations/StoryBars.jsx` (the newest lab:
how it budgets the scene from `useLessonViewport`, its narrow layout and its bidi isolates). Integer arithmetic only, through
`@smarter-academy/core/arithmetic/divisibility.js` (`divmod`) imported BY PATH. Strings in `lesson.manipulation.json › divisionJumps`
(counted nouns « زهرة / زهرات / باقة / باقات / قفزة » through plural keys `_zero … _other`, ARABIC_RTL_CONTRACT « Counting nouns »);
numbers with Latin units as LTR islands.

**This must not look like the 4AM team-builder or the bookshelf (DNA §12).** Here the divisor b is GIVEN and the hand holds q, the
number of groups — the gesture is a RIBBON pulled along a row (or a run of jumps along a line).

**Props contract (fixed):**

```jsx
<Manipulation type="division-jumps"
  a={279} b={14}                       // the dividend and the group size (the level preset gives them; a lesson may pass its own)
  world="flowers" | "line"             // from the level preset; a lesson may force it
  level, levels, title, lead           // levels={false} for the worked example of معارف (253 ÷ 17, world "line")
  onTrial={(e) => …}                   // each VALIDATED trial, via state.report: { a, b, q, r, kind: 'over' | 'short' | 'exact', ok }
  onFinished={({ a, b }) => …}         // the formal phase
/>
```

`levels.js`: `'division-jumps': { beginner: { numbers: { a: 47, b: 6, world: 'flowers', then: 48 }, …P }, advanced: { numbers: { a: 279, b: 14, world: 'line' }, …T('act-3') } }`.

**مبتدئ — `world: 'flowers'` (theme `garden`, platform).** 47 drawn flowers in ONE ROW (a near-square block if it does not fit:
rows of ~8–12, read in order), bouquets of 6. The hand STRETCHES the ribbon's end along the row (`useStretchInteraction`; slider
semantics, keyboard ±1 bouquet, −/+): each step ties the next 6 flowers into a bouquet (a ribbon arc over them, the flowers tinted).
Live during the drag, committed on release. Verdicts on commit, from the logic only:
- `over` (6 × q > 47): the missing flowers of the last bouquet are drawn as dashed rose ghosts — « لهذه الباقة تنقص 1 زهرة »;
- `short` (r ≥ 6): a ghost bouquet outline appears over 6 of the leftover flowers — « بقيت 11 زهرة: تكفي لباقة أخرى »;
- `exact` (q = 7, r = 5): « لا تكفي الأزهار الباقية (5) لباقة أخرى من 6 ».
Then the CONTRAST, opened by the student (a card « زهرة جديدة! » + button, MANIPULATION_CONTRACT §7quater style: the same lab, numbers
47 → 48): one more flower closes a bouquet exactly (8 bouquets, nothing left). `discoveryReady` = one `over` + one `short` + the exact
stop at 47 (and the 48 case is offered after, as transfer — or count it in the gate, your call, say which).

**متقدم — `world: 'line'` (textbook نشاط 3: 279 flowers, bouquets of 14).** Too many to draw one by one: a NUMBER LINE graduated from 0
to past a, a marked « 279 », jumps of 14 drawn as arcs from 0 (the textbook's معارف figure). The hand stretches the number of jumps
(the landing point 14 × q moves); the same three verdicts with the line's words (« القفزة 20 تصل إلى 280 بعد 279 »). After an
`exact` commit the bracket is written under the line: `14 × 19 ≤ 279 < 14 × 20`, the gap 279 − 266 = 13 drawn as a short rose segment.
No scaffolding: the multiples are NOT labelled until a jump lands on them (the student must think 14 × 10 = 140, 14 × 20 = 280), and
the textbook's « 10 باقات؟ 20 باقة؟ » are just marks the student may visit.

**Discovery** (both levels, `ManipulationDiscovery`): « متى نتوقّف عن تشكيل الباقات؟ » — right: « عندما يصبح الباقي أصغر من عدد
الأزهار في الباقة » ; wrong, refuted with the student's own numbers: « عندما لا يبقى أيّ زهرة » (47: 5 left and no bouquet is possible),
« عندما يصبح عدد الباقات 10 » (the bracket). **Formal**: `a = b × q + r` with `r < b` written with the level's numbers, the four
names under it (المقسوم a, المقسوم عليه b, الحاصل q, الباقي r — reuse `primitives/DivisionRoles.jsx` if its API fits, otherwise your own
chips; say which), and at متقدم the bracket line.

**`world: 'line'` alone** (`levels={false}`, a = 253, b = 17): معارف's worked example, same gestures, its formal line `253 = 17 × 14 + 15`.

**Must:** not eligible for « جرّب كل الإمكانيات » (each q is the answer) — say so in the header; design sheet + five questions; one
screen at 1280×800 → 320×640 (measure: `[data-dj-glance]`), the row of flowers shrinks with the scene; keyboard + tap paths; reduced
motion; three progressive hints that never give q; « إعادة » resets; `state.report` for callbacks. DOM:
`[data-division-jumps][data-world][data-a][data-b][data-solved]`, `[data-dj-glance]`, `[data-dj-handle]` (slider), `[data-dj-group=<i>]`,
`[data-dj-left]`, `[data-dj-ghost]`, `[data-dj-verdict=<kind>]`, `[data-dj-refused=<kind>]`, `[data-dj-bracket]`, `[data-dj-formal]`,
`[data-dj-next]` (47 → 48).

**Tests:** `logic/divisionJumps.test.js` — for every (a, b) used (47/6, 48/6, 279/14, 253/17 and a sweep a ∈ 1..300, b ∈ 1..30) the
`exact` q is unique and equals `divmod`, every q below is `short` or exact-with-r≥b-impossible, every q above is `over`; layout of the
flower block swept at five widths (each flower once, inside the width); the line's jump geometry. `operations/divisionJumps.render.test.jsx`
— both levels and the standalone line render; no raw keys, no `{{`, no Latin prose. Then
`cd apps/web && npx vitest run src/lessons/common/manipulations src/lessons/common/i18nHookScope.test.js` (do not name a local test helper
`t`: `i18nHookScope.test.js` flags it). A fresh Vite of the repo runs on http://localhost:5174 (do not start another one, never touch
5173). Report as the unit-2 lab author did.

## Bank author — `content/practice/1am/qisma-iqlidiya-baqi/`

Exactly the unit-2 bank brief (`docs/sources/1am/unit2/brief-authors.md` « Bank author »), its reading list and its rules, with:

- LP ids `1am_qisma-iqlidiya-baqi_P1..P3` (above), each primary on ≥ 8 questions.
- **Corpus** (`exams-index.json`, items `1am.m3.r01`): `1am-s2-70` ex 1 (231 ÷ 14), `1am-s2-72` ex 1, `1am-s2-73` ex 5 (roses), `1am-s2-77`
  ex 1, `1am-s2-78` ex 1 (34 ÷ 5), `1am-s2-80` ex 1 (852 ÷ 45), `1am-s1-101` ex 5. These are TERM 2 papers: badge « على منوال اختبار الفصل
  الثاني » (`semester: 2`, `modelledOn: "1am-s2"` for the generated ones). About half of levels 3–5 modelled on one precise corpus exercise.
- **Textbook elements you may cite** (destination `qisma-iqlidiya-baqi`): `act-3`, `know-2`, `ex-15` … `ex-21`, `self-7`, `self-8`, `ict`,
  `prep`. Nothing else.
- **What is assessed:** Euclidean division of a natural number by a one- or two-digit number (quotient and remainder typed as `rational`,
  or the whole equality as a `choice` whose distractors are FALSE Euclidean divisions — r ≥ b, a wrong product, swapped q and b when it
  is not legitimate); the condition r < b (« هل تعبّر المساواة عن قسمة إقليدية؟ »); the bracket b × q ≤ a < b × (q + 1); the names
  (المقسوم، المقسوم عليه، الحاصل، الباقي); interpreting q and r in a story (how many full groups, how many left, how many groups are NEEDED —
  q + 1 when r ≠ 0, the textbook's eggs and the bus problems), the weekday problem (365 = 7 × 52 + 1). Steps of another lesson of the
  same term (decimal division, multiplication of decimals) are `counted: false`.
- Misconception ids `MISC-IQLIDIYA-*` (remainder ≥ divisor, remainder taken as the quotient, quotient + 1 forgotten when the leftovers
  need a group, the « nothing left » stop, the reading in both directions of `a = b × q + r` when r ≥ q).
- Oracle `scripts/practice-oracle/qisma-iqlidiya-baqi.mjs` recomputes every key with its own integer division.
- Gates you run: `node scripts/validate-exercises.mjs --strict`, `node scripts/check-textbook-coverage.mjs`, `npm run test:scripts`.

---

# Lesson `qawaid-qabiliyat-qisma` « قواعد قابلية القسمة » (same unit, second batch of authors, 2026-10-14)

| Author | Owns | Never touches |
|---|---|---|
| **Lab** | `manipulations/operations/DigitCards.jsx`, `manipulations/logic/digitCards.js` (+ `.test.js`), `manipulations/operations/digitCards.render.test.jsx`, the `digit-cards` entries of `levels.js` and `manipulationRegistry.js`, the `digitCards` namespace of `lesson.manipulation.json` | the lesson folder, `content/practice/**`, the extraction |
| **Bank** | `content/practice/1am/qawaid-qabiliyat-qisma/**`, the lesson's entries in `content/practice/{active,exam-style,policy,misconceptions}.json`, `scripts/practice-oracle/qawaid-qabiliyat-qisma.mjs` and its import | the lesson folder, the lab, the extraction |

The type `'digit-cards'` is declared in `manipulationTypes.js` by the lead.

## The lesson in one paragraph

Textbook نشاط 4 pp. 37–38 (the table 0–48 in SEVEN columns: colour the multiples of 2, of 5, of 3; guess the rules), معارف 3 p. 41
(2: units digit 0, 2, 4, 6, 8 — « زوجي »; 5: units digit 0 or 5; 3: digit sum divisible by 3), طريقة p. 42 (4: the number formed by the
last two digits — 100 candies share into 4 bags, so only the rest matters), ex. 22–26 and 32 p. 46 (ex. 23 makes 9 discovered: none of
the multiples of 3 of its list is a multiple of 9 — declared formalisation), the unit's تحدّ and أتعمّق 8 (the leap year, p. 35 and 48).
Programme item `1am.m3.r02` « معرفة قواعد قابلية القسمة على 2، 3، 4، 5، 9 واستعمالها ». The idea the student must DISCOVER: divisibility
is decided WITHOUT dividing — by the units digit (2, 5), by the digit sum, which no reordering changes (3, 9), by the last two digits (4);
and « a يقبل القسمة على b » means the Euclidean remainder is 0 (previous lesson).

Final الكفاءات (`1am_qawaid-qabiliyat-qisma_P<n>`):
1. **P1** التعرّف على عدد يقبل القسمة على 2 أو على 5 من خلال رقم آحاده
2. **P2** التعرّف على عدد يقبل القسمة على 3 أو على 9 من خلال مجموع أرقامه
3. **P3** التعرّف على عدد يقبل القسمة على 4 من خلال العدد المشكّل من رقميه الأخيرين
4. **P4** التعبير عن «$a$ يقبل القسمة على $b$» بباقي قسمة إقليدية معدوم

## Lab author — `digit-cards`

Same reading list and rules as `division-jumps` above (and its lessons learned: Latin units and numbers isolated in RTL strings, no local
`t` helper in tests, one screen at 320×640 checked in the browser). Integer arithmetic through `core/arithmetic/divisibility.js` (`divmod`)
by path. Every verdict is the Euclidean remainder, shown as `a = b × q + r` — the rule is never asserted by the lab before the discovery.

**Props contract (fixed):**

```jsx
<Manipulation type="digit-cards"
  mode="grid" | "cards"                  // from the level preset; a lesson may force it
  divisors={[2, 5, 3]}                   // grid: the order of the colourings; cards: the lamps shown (e.g. [2, 3, 5, 4, 9])
  digits={[4, 5, 9, 3]}                  // cards only
  from={0} to={48} columns={7}           // grid only (the textbook's table)
  level, levels, title, lead
  onTrial={(e) => …}                     // each judged gesture, via state.report:
                                         //   grid  { mode, n, d, r, ok }           (a cell tapped as « multiple of d »)
                                         //   cards { mode, n, d, claim, r, ok }    (a claim « n يقبل/لا يقبل القسمة على d » judged)
  onFinished={({ mode }) => …}
/>
```

`levels.js`: `'digit-cards': { beginner: { numbers: { mode: 'grid', from: 0, to: 48, columns: 7, divisors: [2, 5, 3] }, …T('act-4') },
advanced: { numbers: { mode: 'cards', digits: [4, 5, 9, 3], divisors: [2, 3, 5, 4, 9] }, …T('ex-26') } }` (both levels cite the textbook;
the advanced one is harder: four digits, five divisors, a target to reach and an impossible one).

**مبتدئ — `mode: 'grid'` (نشاط 4).** The textbook's table, 0 → 48 in 7 columns (deliberately: the multiples of 2 and 5 do NOT fall in
columns, so the student must look at the digits). Three colourings in order (red ÷2, blue ÷5, green ÷3 — the textbook's colours), each
opened by the student. Tap a cell = « this is a multiple of d »: accepted when r = 0 (the cell takes the colour and shows `n = d × q`),
refused otherwise with its division (`21 = 2 × 10 + 1`). A small side ledger collects, for the coloured cells, their UNITS DIGIT (÷2, ÷5)
or their DIGIT SUM (÷3) — the material of the conjecture, never the rule itself. A colouring is complete when every multiple is found
(missed ones may be revealed by a « أكمل » only after the student coloured at least 5 by hand — or keep it manual, your call, say which).
`discoveryReady` = the three colourings complete. Discovery: « ما الذي يكفي أن ننظر إليه؟ » — right: « رقم الآحاد للقسمة على 2 و 5،
ومجموع الأرقام للقسمة على 3 »; wrong, refuted with the student's own cells: « العمود الذي تقع فيه الخانة » (24 and 31… the 7 columns),
« رقم الآحاد للقسمة على 3 » (12 and 13: units 2/3, but 12 is a multiple of 3 and 13 is not… pick refutations from the table).

**متقدم — `mode: 'cards'` (تمرين 26: cards 4, 5, 9, 3).** Four slots; the student CARRIES digit cards into them (`useDragInteraction`,
tap-tap, keyboard) and may swap two placed cards. For the number on the slots, five lamps (2, 3, 5, 4, 9) are CLOSED: the student claims
« يقبل / لا يقبل » on a lamp, the lab judges with the division shown. Tasks (the textbook's): form the LARGEST number divisible by 2, by 3,
by 5 (9534, 9543, 9435) — a claimed answer is checked for divisibility AND for being the largest (a larger valid arrangement is named);
then « by 4? » and « by 9? »: impossible with these cards (no two-digit ending divisible by 4; digit sum 21) — the student must SAY it is
impossible (a button « لا يوجد »), which the lab accepts only when true. The invariance must be FELT: after a swap the 3 and 9 lamps keep
their verdict, the 2 / 5 / 4 ones may flip (show which lamp flipped). `discoveryReady` = the three textbook targets reached + one swap that
kept the ÷3 verdict while ÷2 flipped. Same discovery prompt, with the 4-rule added after it (or as a second discovery after « by 4? »).

**Must:** design sheet + five questions; one screen at 1280×800 → 320×640 (`[data-dc-glance]`; the 49-cell table must fit a phone: 7
columns × 7 rows of ≥ 40 px cells); keyboard + tap paths; reduced motion; three progressive hints that never state a rule; « إعادة »;
`state.report`. Not eligible for « جرّب كل الإمكانيات » (each cell / claim is an answer). DOM: `[data-digit-cards][data-mode][data-solved]`,
`[data-dc-glance]`, `[data-dc-cell=<n>][data-colour]`, `[data-dc-ledger]`, `[data-dc-card=<digit>]`, `[data-dc-slot=<i>]`,
`[data-dc-lamp=<d>][data-state]`, `[data-dc-claim=<d>]`, `[data-dc-none]`, `[data-dc-verdict]`, `[data-dc-refused]`, `[data-dc-formal]`.

**Tests:** every multiple of 2, 3, 5 in 0..48 found by the logic; every refusal carries the right remainder; all 24 arrangements of 4, 5,
9, 3 checked for 2, 3, 4, 5, 9 (the three maxima, none for 4 and 9); invariance of ÷3 / ÷9 under every swap; the grid layout fits 280 px.
Render test for both levels.

## Bank author — `content/practice/1am/qawaid-qabiliyat-qisma/`

Exactly the bank rules above (`qisma-iqlidiya-baqi`), with:
- LP ids `1am_qawaid-qabiliyat-qisma_P1..P4`, each primary on ≥ 8 questions.
- **Corpus** (`1am.m3.r02`): `1am-s2-62` ex 1 (a misfiled paper — it counts for its HEADER's grade and term, see `exams-index.json`),
  `1am-s2-70` ex 2, `1am-s2-72` ex 1, `1am-s2-78` ex 1, `1am-s2-80` ex 2 — the divisibility tables (« يقبل القسمة على 2 ، 3 ، 5 ، 9 » with
  نعم / لا) and the classifications. Badges follow each paper's term.
- **Textbook elements you may cite:** `act-4`, `know-3`, `method-2`, `now-42`, `ex-22` … `ex-26`, `ex-32`, `self-12`, `deep-8`, `prep`.
  Not `challenge` (unit page) — `deep-8` carries the leap year.
- **What is assessed:** the five rules (2, 3, 4, 5, 9), choosing a missing digit so that a number becomes divisible (« أتمم بالرقم المناسب
  ليقبل العدد … القسمة على 3 » — every possible digit, or the smallest/largest one: say which in the statement), divisibility by 2 AND 5
  (units digit 0, the textbook's ex-22 ②), « 3 then 9 » (a multiple of 9 is a multiple of 3, not conversely), the leap-year rule, and
  « يقبل القسمة » ⇔ remainder 0 (choose the right Euclidean equality). Distractors are the real misconceptions: the units digit for 3, « the
  number is even so divisible by 4 », digit sum for 4, « ends in 5 so divisible by 25 »… Misconception ids `MISC-QABILIYA-*`.
- Oracle `scripts/practice-oracle/qawaid-qabiliyat-qisma.mjs` decides every key by `n % d`, never by a digit rule.
