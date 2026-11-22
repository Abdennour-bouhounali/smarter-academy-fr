# 2AM unit 2 « الكسور والعمليات عليها » — authors' brief (lesson `qisma-iqlidiya-hasr`, 2026-10-14)

Cycle moyen rollout, phase 3 — the FIRST 2AM lesson. Same organisation as `docs/sources/1am/unit2/brief-authors.md` and
`docs/sources/1am/unit3/brief-authors.md` (read their tables of file ownership and their lessons learned: they apply here with the
names below). The lead writes the lesson (`apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/kusur-amaliyat/qisma-iqlidiya-hasr/`)
and the extraction (`docs/sources/2am/unit2/extraction.json`, built by `build-extraction.py`).

| Author | Owns | Never touches |
|---|---|---|
| **Lab** | `manipulations/operations/EggTrays.jsx`, `manipulations/logic/eggTrays.js` (+ `.test.js`), `manipulations/operations/eggTrays.render.test.jsx`, a new drawn primitive if needed (`manipulations/primitives/EggFigure.jsx` + its test: egg, 12-egg carton, 30-egg tray, pallet), the `egg-trays` entries of `manipulations/levels.js` and `manipulationRegistry.js`, the `eggTrays` namespace of `i18n/locales/ar/lesson.manipulation.json` | the lesson folder, `content/practice/**`, the extraction |
| **Bank** | `content/practice/2am/qisma-iqlidiya-hasr/**` (the FIRST 2AM folder), the lesson's entries in `content/practice/{active,exam-style,policy,misconceptions}.json`, `scripts/practice-oracle/qisma-iqlidiya-hasr.mjs` and its import in `scripts/practice-answer-oracle.test.mjs` | the lesson folder, the lab, the extraction |

Already done by the lead (do not redo): the type `'egg-trays'` is declared in `packages/core/curriculum/manipulationTypes.js`; the drawn
world `farm` (« بيض مزرعة دواجن يوضَّب في علب وصفائح ») is in `VISUAL_THEMES` (`packages/core/curriculum/manipulationLevels.js`); the unit is
seeded (`…/kusur-amaliyat/_unit/`: `unitMeta.js` with the 2AM labels, the three one-line bindings, `prepDiagnostic.test.js`); the unit's
whole extraction exists (93 elements, every one with its destination lesson; this lesson's: `prep` items 5 and 9, `act-1`, `know-1a`,
`know-1b`, `ex-33`). Until your entries exist, `levels.test.js` and `manipulationRegistry.test.js` fail on `egg-trays` (and on the two
types declared by the other leads of this batch) — expected.

## The lesson in one paragraph

« القسمة الإقليدية وحصر حاصل القسمة » (2AM, textbook نشاط 1 p. 24 — 2145 eggs in trays of 30 —, معارف 1 p. 26 — the definition with
0 ≤ r < b, « يقبل القسمة / مضاعف » when r = 0, and « حصر حاصل القسمة » 22 < 180/8 < 23 —, exercise 33 p. 32). Programme items `2am.m1.r04`
« تعيين حاصل وباقي القسمة الإقليدية لعدد على عدد غير معدوم » and `2am.m1.r06` « حصر حاصل القسمة ». **The net forbids rebuilding the 1AM
lesson**: `2am.m1.r04` EXTENDS `1am.m3.r01` (published lesson `qisma-iqlidiya-baqi`, lab `division-jumps`), added value « القاسم أيّ عدد
طبيعي غير معدوم، لا عدد برقم أو رقمين فقط ». The 1AM lab already makes the student stop at the largest q and writes the bracket of the
DIVIDEND `14 × 19 ≤ 279 < 14 × 20`. What 2AM adds, and what the student must DISCOVER: **divide that bracket by b — the quotient a ÷ b is
a NUMBER on the line of whole trays; it lies strictly between q (the full trays: the approximate value by default to the unit) and q + 1
(the trays needed: by excess), and it falls EXACTLY on a whole number if and only if nothing is left (r = 0: b يقسم a, a مضاعف لـ b) —
for any divisor, with large numbers.** The textbook's own misconception is the son of act-1: 2145 = 30 × 70 + 45 is a TRUE equality but
not a Euclidean division (45 ≥ 30). `2am.m1.r06` requires `2am.m1.r05` (approximate values, taught in the NEXT lesson `kasr-hasil-qisma`):
a « renvoi en avant » — the lesson recalls « قيمة مقرّبة إلى الوحدة بالنقصان / بالزيادة » with a « تذكّر », never builds it.

Final الكفاءات (`2am_qisma-iqlidiya-hasr_P<n>`; order kept; changes vs the drafts in the lead's report):

1. **P1** تعيين حاصل وباقي القسمة الإقليدية لعدد طبيعي $a$ على أيّ عدد طبيعي غير معدوم $b$، وكتابة المساواة $a = b \times q + r$ مع $0 \le r < b$
2. **P2** حصر حاصل القسمة $\frac{a}{b}$ بين عددين طبيعيين متتاليين، مثل $22 < \frac{180}{8} < 23$، وتسمية طرفي الحصر قيمتين مقرّبتين إلى الوحدة بالنقصان وبالزيادة
3. **P3** التعبير عن انعدام الباقي: $\frac{a}{b}$ عدد طبيعي، فنقول «$a$ يقبل القسمة على $b$» أو «$a$ مضاعف لـ $b$» أو «$b$ يقسم $a$»

`pointPrerequisites`: P1 ← `1am_qisma-iqlidiya-baqi_P1`, P1 ← `1am_qisma-iqlidiya-baqi_P2` (net link `1am.m3.r01` → `2am.m1.r04`, extends),
P2 ← P1, P3 ← P1.

## Lab author — `egg-trays`

Read first exactly what the unit-2 and unit-3 1AM briefs list for their lab authors (MANIPULATION_DNA all — §12, §16, §17 incl. §17.7 are
binding; MANIPULATION_CONTRACT §1, §2, §2bis, §4.2, §6bis, §6ter, §7, §7bis-levels, §7ter, §7quater, §8, §8bis, §8ter, §9), then the three
1AM labs of 2026-10-14 as the quality and idiom reference: `operations/DivisionJumps.jsx` (+ `logic/divisionJumps.js`, the newest Gen
Alpha finish, the « says each thing ONCE » render test), `operations/StoryBars.jsx` (scene budget from `useLessonViewport`, narrow layout,
bidi isolates), `operations/DigitCards.jsx`. Kit: `primitives/LabKit.jsx` (PromptCard, StepperCard, ChoiceCard, NamePill, LabNote,
VerdictBanner…), `primitives/SvgPill.jsx`, `primitives/KidFigure.jsx` (the farmer's son is a boy in a hoodie; at مبتدئ a girl ALWAYS in
hijab + tunic — `hairStyle="hijab"`, a `scarf` from `SCARVES`), `primitives/DivisionRoles.jsx` for the names. Integer arithmetic only,
through `packages/core/arithmetic/divisibility.js › divmod` imported BY PATH (never the core barrel); every verdict compares integers
(`n·b < a < (n+1)·b`), floats only draw. Strings in `lesson.manipulation.json › eggTrays` (counted nouns « بيضة / بيضات / علبة / علب /
صفيحة / صفائح / شاحنة » through plural keys `_zero … _other`, ARABIC_RTL_CONTRACT « Counting nouns »); numbers and formulas as LTR islands.

**Why a NEW lab, not `division-jumps` at a new level (DNA §12 + the net's no-rebuild rule).** `division-jumps` gives b and puts **q** in the
hand (ribbon / jumps), and its discovery is « stop when what is left is smaller than b » — exactly the 1AM base that `2am.m1.r04` may only
RECALL. Re-levelling it with 2145 ÷ 30 would rebuild that experience with bigger numbers (forbidden), and it has no object for what 2AM
adds: the quotient as a number between two whole numbers and its two approximate values. The other division labs hold other variables:
4AM `team-builder` (number of groups), `divisor-explorer-books` (b, a shelf length), `square-root-side` (a side bracketed by graduations — a
different mathematics), 1AM `digit-cards` (divisibility rules), `story-bars` (an unknown height). Here the hand holds **a, the number of
eggs on the conveyor** (no division lab holds the dividend), and the new object is the **trays ruler**: the same line read ÷ b, where the
marker « a ÷ b » sits at q + r/b. The resistance is new too: a tray can never hold b eggs — it CLOSES by itself at b (r < b is physical,
at every scale), which is also what refutes the son's « 45 left ».

**Props contract (fixed):**

```jsx
<Manipulation type="egg-trays"
  a={2145} b={30}                    // the day's order: a eggs, b per tray (the level preset gives them; a lesson may pass its own)
  then={2160}                        // the contrast harvest (default: the next multiple of b above a)
  claim={{ q: 70, r: 45 }}           // optional — a classmate's division to judge (متقدم: the son's 2145 = 30 × 70 + 45); null = none
  world="carton" | "tray"            // 12-egg cartons, every egg drawn (مبتدئ) / 30-egg trays grouped in pallets of 10 (متقدم)
  max                                // optional end of the trays ruler (default ⌈then ÷ b⌉ + 2 trays)
  level, levels, title, lead         // as every lab; title in words (never « 2145 ÷ 30 » raw — ManipulationShell prints it unisolated)
  onTrial={(e) => …}                 // each JUDGED gesture, via state.report:
                                     //   { kind: 'frame', a, b, q, r, n, ok, model }       the frame [n ; n + 1] checked against a ÷ b
                                     //        model: 'right' | 'below' | 'above' | 'remainder' (n = r) | 'onMark' (r = 0: no strict frame)
                                     //   { kind: 'exact', a, b, q, ok }                     « يقع على عدد طبيعي » claimed
                                     //   { kind: 'claim', a, b, claimQ, claimR, agree, ok } the classmate's division judged
  onFinished={({ a, b }) => …}       // the formal phase
/>
```

`levels.js`: `'egg-trays': { beginner: { numbers: { a: 50, b: 12, then: 60, world: 'carton' }, …P }, advanced: { numbers: { a: 2145,
b: 30, then: 2160, claim: { q: 70, r: 45 }, world: 'tray' }, …T('act-1') } }` (the advanced level cites the textbook and is measurably
heavier — `levels.test.js`).

**The gesture, both levels.** One order at a time, in two moves (« one action panel at a time », DNA §16.6):
1. **Predict — place the frame.** The order card (« طلبية اليوم: 2145 بيضة ») sits on an EMPTY conveyor. Under it, the trays ruler
   (0, 1, 2 … whole trays; at متقدم labelled every 10 with ticks every 1). The student drags a frame one unit wide that snaps to whole
   numbers (stretch engine on the ruler; ←/→ ±1, tap a tick) — « where will 2145 ÷ 30 fall? ». Estimating is the thinking: 30 × 70 = 2100.
   The marker is NOT shown yet.
2. **Fill — the hand holds a.** The egg handle (`[data-et-handle]`, role slider, `useStretchInteraction`) moves a from 0 up to the order;
   it cannot pass the order (no eggs after the last one: a soft bump). Live under the hand, from the logic only: closed cartons/trays
   stack (at متقدم every 10 trays tie into a pallet — the place value of the quotient is SEEN: 7 pallets + 1 tray = 71), the open one
   holds exactly r eggs in its cells and **snaps shut with a stamp when it reaches b** (a new empty one slides in), and the marker
   « a ÷ b » slides along the ruler at q + r/b. Precision: a `StepperCard` with ±1 بيضة, ±1 صفيحة (± b) and at متقدم ±10 صفائح (± 10b) —
   the steppers ARE the long division by hand (pallets, then trays, then eggs). Under the ruler, a zoom of the segment [q ; q + 1]
   (`[data-et-zoom]`) drawn as the open tray itself: its fill bar is r/b of the segment — honest drawing, the same picture twice.
3. **The frame is judged when the order is full** (from the logic: ok ⇔ n·b < a < (n+1)·b). A wrong frame stays drawn with the marker
   and the gap in trays (« الحاصل بعد إطارك بـ 2 صفيحة »); the student moves it and the world re-judges (a new trial). Models read the
   misconception: `below` / `above` (off by one, or a bad estimate), `remainder` (the frame on [15 ; 16]: the remainder taken for the
   quotient).
4. **Contrast — « بيض إضافي »** (a card + button, MANIPULATION_CONTRACT §7quater: same lab, the order grows to `then`): the student fills
   on, the last tray closes EXACTLY, the marker lands ON a whole number (72; 5 at مبتدئ): no strict frame exists — the student must tap
   « يقع على عدد طبيعي » (`[data-et-exact]`); framing instead is judged `onMark`.
5. **The classmate's claim (متقدم, `claim`).** The son of the farmer (KidFigure boy, mood `wonder`) holds his card « 2145 = 30 × 70 + 45 »
   (`[data-et-claim]`). The student answers أوافق / لا أوافق. Either way the lab REPLAYS his state — 70 trays (7 pallets) and 45 loose eggs
   — and pours the 45 into a tray, which closes at 30 and leaves 15: the refutation is the same resistance, in his numbers
   (« 45 بيضة تملأ صفيحة أخرى ويبقى 15 »). `ok` = the student disagreed.

**مبتدئ — `world: 'carton'` (theme `farm`, platform).** Salma (KidFigure girl in hijab, `scarf="mint"`) collects the hen-house basket:
50 eggs, cartons of 12 (2 × 6 cells, drawn lids), every egg drawn on the conveyor (a near-square block when it does not fit). Ruler 0 … 7,
labelled at every whole number. The contrast: 10 more eggs → 60 = 12 × 5. No claim.

**متقدم — `world: 'tray'` (textbook نشاط 1).** The farm's packing station: 2145 eggs, cardboard trays of 30 (5 × 6), pallets of 10 trays.
Too many eggs to draw one by one: the conveyor shows the egg COUNT left (« على الحزام: 2145 − a »), the closed trays as pallets + single
trays, the open tray with its r eggs drawn. Ruler 0 … 74 with the zoom. The contrast: 15 more eggs → 2160 = 30 × 72. Then the son's claim.

**Discovery** (both levels, `ManipulationDiscovery`), ready when the order's frame was right, the exact landing was claimed on `then`, and
(متقدم) the claim was judged. Prompt « متى يقع حاصل القسمة على عدد طبيعي بالضبط؟ » — right: « عندما لا تبقى علبة مفتوحة: الباقي معدوم » ;
wrong, refuted with the student's OWN path (the logic picks the numbers he passed through): « عندما يكون عدد البيض زوجيًا » (50 is even,
yet 50 ÷ 12 lies between 4 and 5; at متقدم an even a he passed, e.g. 2140 = 30 × 71 + 10), « عندما يكون عدد البيض أكبر من عدد
بيض العلبة » (50 > 12 and 50 ÷ 12 is not a whole number; 12 and 24, passed on the way, are). A second, shorter question names the frame's ends: « ماذا يمثّل طرفا
الإطار؟ » — right « عدد العلب المملوءة، وعدد العلب اللازمة لكلّ البيض » ; wrong « الحاصل والباقي » (refuted: the frame is [4 ; 5], the
remainder is 2). **Formal** (`[data-et-formal]`): `50 = 12 × 4 + 2` with `2 < 12`, then `4 < \frac{50}{12} < 5` with the two ends named
under the ruler — « 4: قيمة مقرّبة إلى الوحدة بالنقصان (العلب المملوءة) », « 5: بالزيادة (العلب اللازمة) » —, and
`\frac{60}{12} = 5` ⇒ « 12 يقسم 60 » ، « 60 مضاعف لـ 12 » ، « 60 يقبل القسمة على 12 ». At متقدم the same with 2145, 30, 71, 15, 72,
2160, and the son's line struck: `2145 = 30 × 70 + 45` « مساواة صحيحة لكنها ليست قسمة إقليدية: 45 > 30 ». Names under the equality:
`DivisionRoles` if its API fits, otherwise your own chips (say which).

**Must:** the design sheet (DNA §7) and the contract's five questions in the component header; not eligible for « جرّب كل الإمكانيات »
(each frame and claim is an answer) — say so; no auto-completion (the steppers ARE the method); one screen at 1280×800 → 320×640 (measure
`[data-et-glance]`: order card + conveyor + ruler + steppers); keyboard and tap paths for every gesture (frame, handle, steppers, claim,
exact); reduced motion (the lid snap, the hop of eggs, the pallet tie stop); hints closed by default, three short THINKING questions that
never give q, the frame or the rule; « إعادة » starts over (frame, fill, contrast, claim, memory); every callback through `state.report`.
**Lab author must meet MANIPULATION_DNA §17 incl. §17.7 and review screenshots at 1280×800, 1366×768, 390×844, 320×640 of initial and
mid-activity states** (the empty conveyor with the frame placed, a fill mid-way with an open tray, a wrong frame judged, the exact landing,
the son's replay, the formal phase — both levels), then report what you improved after looking.

**DOM:** `[data-egg-trays][data-world][data-a][data-b][data-count][data-solved]` (`data-count` = eggs placed), `[data-et-glance]`,
`[data-et-order]`, `[data-et-handle]` (slider: `aria-valuenow` = eggs), `[data-et-step=egg|tray|pallet][data-dir=less|more]`,
`[data-et-tray=<i>][data-full]`, `[data-et-pallet=<i>]`, `[data-et-open][data-eggs]`, `[data-et-ruler]`, `[data-et-marker][data-q][data-r]`
(rendered only after the fill starts), `[data-et-zoom]`, `[data-et-frame][data-n][data-state=idle|right|wrong]`, `[data-et-exact]`,
`[data-et-next]` (the contrast card), `[data-et-claim][data-verdict=agree|disagree]`, `[data-et-verdict=<kind>]`, `[data-et-formal]`.

**Tests:** `logic/eggTrays.test.js` — sweep a ∈ 0..3000, b ∈ 1..60: the state is `divmod` (q closed trays, r in the open one, r < b
always — the open tray never holds b), the marker is q + r/b and increases with a, it is on a whole number ⇔ a % b = 0; the frame judge
(ok ⇔ n·b < a < (n+1)·b) and its models (`remainder`, `below`, `above`, `onMark`) on every (a, b, n) of a sweep; the claim judge for
(70, 45) and a sweep of true-but-not-Euclidean equalities (r' ≥ b → closes ⌊r'/b⌋ more trays); pallets = ⌊q/10⌋ + q mod 10; `then`
default; the discovery gate; the refutation picks (an even a passed with r ≠ 0). Layout: the 50/60 eggs of مبتدئ swept at five widths (each
egg once, inside the width), the ruler geometry (marks at multiples, the marker between them, the zoom segment = the open tray).
`operations/eggTrays.render.test.jsx` — both levels render; no raw keys, no `{{`, no Latin prose; « says each thing ONCE » (the
`divisionJumps.render.test.jsx` idiom); no message reachable before the discovery contains the rule (« الباقي معدوم », « بالنقصان »,
« بالزيادة », « يقسم »). Then `cd apps/web && npx vitest run src/lessons/common/manipulations src/lessons/common/i18nHookScope.test.js` (do
not name a local test helper `t`). A fresh Vite of the repo runs on http://localhost:5174 (do not start another one). Report as the 1AM lab
authors did (files, tests, screenshots reviewed and what changed after looking).

## Bank author — `content/practice/2am/qisma-iqlidiya-hasr/`

Exactly the 1AM bank briefs (`docs/sources/1am/unit2/brief-authors.md` « Bank author »: reading list, sheet format, levels, provenance,
wiring, gates), with:

- **The first 2AM bank**: the folder `content/practice/2am/` is new. Exercise ids `ex-2am-qisma-iqlidiya-hasr-l<N>-<NNN>`; sheet header
  « 2 متوسط » comes from the grade (`examPaper`). Check that whatever index/registry the practice content generates picks up a new grade
  folder (`packages/core/curriculum/exportContentRegistry.mjs` reads every grade folder; `validate-exercises.mjs` checks the folder's grade
  against the lesson) and say so in your report.
- LP ids `2am_qisma-iqlidiya-hasr_P1..P3` (above), each primary on ≥ 8 questions.
- **Corpus** (`exams-index.json`, items `2am.m1.r04` / `2am.m1.r06`) — all TERM 1 papers: badge « على منوال اختبار الفصل الأول »
  (`semester: 1`, `modelledOn: "2am-s1"` for the generated ones). About half of levels 3–5 modelled on ONE precise exercise:
  - `2am-s1-79` ex 1 — « أوجد حاصل القسمة الإقليدية للعدد 225 على 13 » (17, r 4) then « استنتج حصرا لحاصل القسمة بين عددين طبيعيين
    متتاليين » (17 < 225/13 < 18); its table of values to 1/10 and 1/100 belongs to `kasr-hasil-qisma` → `counted: false` or left out.
  - `2am-s1-87` ex 3 — « أكتب عبارة القسمة الإقليدية للعدد 134 على 19 » (134 = 19 × 7 + 1) and the « حصرا إلى الوحدة » of q 2 ب
    (7 < 134/19 < 8); the decimal division and 1,34 ÷ 0,19 are the next lesson's (`counted: false`).
  - `2am-s1-74` ex 2 q 2 — « أنجز القسمة الإقليدية للعدد 147 على 11 ثم أكمل: 147 = … × … + … » (147 = 11 × 13 + 4).
  - `2am-s1-70` ex 2 q 2 — printed « باقي وحاصل القسمة الإقليدية للعدد 4 على 0,7 » right after q 1 « أكتب C = 4/0,7 بكسر بسطه ومقامه
    طبيعيان »: READ AS the Euclidean division of 40 by 7 (40 = 7 × 5 + 5) — a Euclidean division by a decimal is not in the programme.
  - `2am-s1-77` ex 2 q 2–3 — « هات حصرا بين عددين طبيعيين متتاليين للحاصل 32,46 ÷ 4 » (8 < 8,115 < 9) and « كم عدد الشاحنات الصغيرة
    (حمولة 4 طن) التي تلزم لنقل 32,46 طن رمل؟ » (9, the value by excess). Give the decimal quotient in the statement or mark its
    computation `counted: false` (decimal division is the next lesson). Same exercise in `3am-s1-112` model 01 (misfiled, header 2AM
    term 1): cite `2am-s1-77`.
  - `2am-s1-68` ex 1 q 2, last bullet — « أحصر M بين عددين طبيعيين متتاليين » (M = 2,820: 2 < M < 3).
- **Textbook elements you may cite** (destination `qisma-iqlidiya-hasr`): `act-1`, `know-1a`, `know-1b`, `ex-33`, `prep` (items 5 and 9 only).
  Nothing else — every other element of the unit belongs to a lesson not yet generated and citing it breaks `check:textbook`. The unit has
  no other Euclidean-division exercise: everything else is `term_exam` / `term_exam_modelled`.
- **What is assessed:** Euclidean division by ANY divisor (one-, two- and three-digit divisors, dividends in the thousands; q and r typed
  as `rational`, or the equality as a `choice` whose distractors are FALSE Euclidean divisions); « هل تعبّر المساواة عن قسمة إقليدية؟ »
  (true equalities with r ≥ b — the son of act-1); the bracket b × q ≤ a < b × (q + 1); the bracket of a/b between two consecutive natural
  numbers (strict when r ≠ 0; a/b IS a natural number when r = 0); the two ends named « قيمة مقرّبة إلى الوحدة بالنقصان / بالزيادة » and
  read in a story (full trays / trays needed, buses, trucks: q + 1 when r ≠ 0, q when r = 0); a fraction greater than 1 written as a natural
  number plus a fraction smaller than 1 (ex-33: 129/11 = 11 + 8/11); r = 0 said three ways (« يقبل القسمة على »، « مضاعف لـ »، « يقسم »).
  Steps of another lesson of the same term (decimal division, values to 0,1 / 0,01, order of operations) are `counted: false`.
- **Misconception ids** `MISC-HASR-*` (r ≥ b accepted as a remainder; the remainder taken for the quotient in the bracket — [r ; r + 1];
  bracket off by one; a strict bracket claimed when r = 0; default and excess swapped in a story — « trays needed = q »; « a يقسم b » for
  « b يقسم a »; q and b swapped when r ≥ q).
- **Values in story contexts** (guide §5): each story woven with a good value (التعاون، التضامن، احترام الوقت، الأمانة…), short; rewrite the
  corpus' contexts, never copy them.
- **Oracle** `scripts/practice-oracle/qisma-iqlidiya-hasr.mjs` recomputes every key with its own integer division (decimals as scaled
  integers) and decides every bracket by `n·b < a < (n+1)·b`, never by a float.
- **Gates you run:** `node scripts/validate-exercises.mjs --strict`, the oracle test, `node scripts/check-textbook-coverage.mjs`,
  `npm run test:scripts`. Do NOT run `npm run build`. Report: files, counts per level and per LP, the corpus exercises used (file +
  exercise), test results.
