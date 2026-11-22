# « عُدّة الانطلاق » — the launch of a lesson

> **BINDING for the lesson v2 rollout (owner decision D6, 2026-11-17): every v2 lesson follows this contract — `LESSON_V2.md` says how a lesson plugs into it.** What has not changed: it was built on the pilot lesson and no real student has used it yet.
>
> **Status: phase 1 built on 2026-11-17 on the pilot lesson `qasim-adad-tabii`; no real student has
> played it.** Owner's idea (2026-11-16/17): before a lesson, a game of five minutes at most, fun, that tests the earlier
> الكفاءات the lesson needs, gives a score with the lessons to revise, and feeds the picture of the student's learning that the
> student and the teacher read. Build plan and the phases not built yet: `docs/reports/LAUNCH_KIT_PLAN_2026-11-17.md`.
> Code: `apps/web/src/lessons/common/launchkit/`.

## 1. What it is

Before a lesson, the robot **charges the tools it needs**, then takes off into the lesson. A tool is ONE earlier الكفاءة the
lesson stands on — a programme item of the learning net, of the same grade or of an earlier one.

| Moment | What happens |
|---|---|
| The bag (10 s) | 2–4 empty slots, each named in the student's words with the year it comes from. A tool measured « ثابتة » in the last 21 days arrives charged and is not asked again |
| A station per tool | 2 or 3 questions; each right answer lights a segment; a miss says « سنعود إليه » |
| The quick workshop (≈ 1 min, only if needed) | the weakest tool is repaired on the spot: a worked example revealed step by step, opened on the mistake the answers showed, then two similar questions |
| The kit | each tool in one of four states, the score, « نجمة الصدق », ONE lesson to revise first with four actions |
| The capsule (≈ 3 min, only when the gate asks) | a CORE tool left at « نبدأ منها »: its card, a worked example, its instrument in the lab (when its family has one), two easy questions — then the door is open (§3bis) |
| The take-off | countdown, then the lesson starts |

It is **one component for every lesson**: `<LaunchKit lessonCode lessonTitle onDone onClose inline />` needs only the lesson's
code. Nothing scrolls (designed 1280 × 720, and 1000 × 740 for a 4:3 screen, zoomed to the window — like « مختبري »).

## 2. Rules (binding for the launch)

1. **Tools come from the net, never from a list typed in the lesson**: `planTools(toolsForLesson(code), …)` — the direct
   prerequisites, the CORE ones first (`LEARNING_NET.md` §2.2bis), then the supports, the nearest year first, at most four,
   only those that have a question family.
2. **A tool is never judged on one answer, and the game stops as soon as it knows.** The band machine is the one of
   « بوصلتي » (`packages/core/compass/engine.js › itemProgress`, also held by the server in PHP): easy → harder; a miss gets a
   second easy one. Two or three answers per tool.
3. **Never the right answer during a station** — ✓ or « سنعود إليه », never « wrong »: showing it would spoil the next question
   of the same tool. The workshop is where the launch teaches.
4. **The answer is a gesture** (`gestures.jsx`): *write* the value in its own shape on the game's keypad, *sort* cards by
   DRAGGING each into one of two boxes (owner, 2026-11-17; a tap on a box does the same), *place* a flag on a number line.
   Nothing moves by itself and nothing is timed per question. The answer is handed in with « تمّ »: until then everything can be
   changed (a slip does not count).
5. **No life, no losing, no speed score, no ranking, no luck.** The time of an answer is recorded (`ms`), never scored.
6. **« غير متأكّد »** can be said before handing in. It counts as not succeeded for the band — never as a fault — and
   **« نجمة الصدق »** rewards a student who knew what he knew: sure and right, or unsure and wrong, on 4 answers out of 5.
7. **A repaired tool is not « ثابتة »**: from « نبدأ منها » it rises to « تحتاج تثبيتًا », and the next launch asks it again.
8. **Five minutes and twelve questions at most**; what was not asked stays « لم نفحصها بعد » and costs no point.
9. **The game is felt between the questions**: the segment that lights, the bed of music that gains a layer with each right
   answer in a row (`LaunchSound.layers`, show only), the countdown. A sound never tells right from wrong before « تمّ » (each
   box of a sort has its own note, whatever the card).
10. No person is drawn (a robot, drawn in code). Respect of Islam: no luck, no gambling image.

## 3. The bands, the score, the kit

| Band | Label | Segments | How |
|---|---|---|---|
| `solid` | « ثابتة » | 2 | easy ✓ then harder ✓ |
| `consolidate` | « تحتاج تثبيتًا » | 1 | one of the two missed — or « نبدأ منها » repaired in the workshop (« أُصلحت الآن ») |
| `start` | « نبدأ منها » | 0 | two easy questions missed |
| `unseen` | « لم نفحصها بعد » | — | the clock ended first; not counted in the score |

Score = lit segments / (2 × tools measured). The kit screen names ONE lesson to revise first (`priorities`: « نبدأ منها », then
« تحتاج تثبيتًا » not repaired, then repaired) and offers, for the tool shown:

- **« بطاقة المراجعة »** — the family's `memo` (three or four lines), on a veil over the launch; the launch's ✕ and sound
  button stay ABOVE that veil (`launchKit.css › .lk-head__end`, 2026-11-19: the veil had covered them);
- **« جرّب الأداة في مختبري »** — the lab opened ON the family's instrument (`LessonLab initialTool`), `earlierOnly`: the kit is played BEFORE the lesson, so the lab lists no « أدوات هذا الدرس » (the lesson's own instrument names what it will make him discover) — only the cabinet of the earlier lessons (`LESSON_LAB.md` §2);
- **« أعد فحص الأداة »** — that tool alone is asked again (no workshop; the try is not counted twice);
- **« الدرس كاملًا »** — the earlier lesson, with the existing one-click return (`mission/returnToLesson.js`); « الدرس قريبًا »
  when the lesson is not published.

## 3bis. The gate — the door opens by doing, not by scoring (owner, 2026-11-17)

`engine.js › gateOf(kit)`. It replaced the first idea of a lock under a percentage (with two tools, 10 % only blocks a student
with nothing right; a score can be guessed; a wall sends a child away).

- **When:** a **core** tool (the weight of the learning net: the lesson cannot be passed without it; a tool not classified yet
  counts as core) is left at « نبدأ منها » — two easy questions missed and the workshop did not repair it. A **support** tool
  never closes the door; « تحتاج تثبيتًا » is enough to go.
- **What:** the take-off button is replaced by « ابدأ الكبسولة · 3 دقائق ». The capsule has four steps, always shown:
  ① « البطاقة » (the family's `memo`) → ② « المثال » (a worked example, revealed step by step, opened on the named mistake) →
  ③ « جرّب بيدك » (the family's instrument, in « مختبري ») → ④ « سؤالان » (two easy questions, phase `capsule`).
- **Then the door is open, whatever the two answers say.** Both right: the tool rises to « تحتاج تثبيتًا » (« أُصلحت الآن »).
  Otherwise it stays « نبدأ منها », flagged « كبسولة منجزة » (`items[<item>].capsule` in the toolbox): nothing is pretended.
- **Never a second capsule in the same launch, never a dead end.** Re-checking the tool with success also opens the door.
- **For every student** — the one of a class and the independent one (owner, 2026-11-17, after seeing it: « yes »).

## 4. A question family (`families.js`) — how to add one

One entry in `FAMILIES`, keyed by the item id of the net:

```js
'1am.m3.r01': { item, lesson, name, icon, labTool, forms: { 1: [...], 2: [...] }, make(rand, level, form, { first }), example(rand, level, { k, mistake }), rules: [...], memo: [...] }
```

- **The worked example answers the mistake shown** when the family can (`mistake` = the name `grade` gave: the kit passes
  it to `example`; « قاسم عدد طبيعي » has one example for the order of the two numbers, one for 1 and the number itself,
  and the division with its remainder by default). An example that talks about something else than the sentence above it
  teaches nothing.

- **It generates** its questions on two levels (1 very easy, 2 harder), in several forms; a retake never shows the same numbers.
  The very first question of a launch is a near-certain win (`first`).
- **Which form is asked** (`pickForm`, `nextForm`): a form not used yet in this launch, in the order of `forms[level]` —
  except that **at level 2 a form named `sort` comes FIRST** (2026-11-18). A station asks level 2 only ONCE per tool, the
  workshop repeats the form of the last station miss (`nextForm`: two questions LIKE the one missed), a re-check starts the
  tool afresh and the capsule asks level 1 only: a level-2 form listed second was therefore NEVER asked in a launch, and the
  sort is where a family keeps its traps and the cards to ACCEPT. A family with no level-2 `sort` keeps its own order; the
  bands, the number of questions and the score do not depend on the form. The level-2 `write` of a family with a sort is now
  asked by the workshop when the tool's missed station question was a `write` (e.g. ✗ write, ✓ place, ✓ sort →
  « تحتاج تثبيتًا » → the workshop asks level-2 writes).
- **A question is plain data**; `grade(q, answer)` says right or not and NAMES the mistake when the answer shows one
  (`MISTAKES`: « الباقي دائمًا أصغر من المقسوم عليه », « في قاعدتي 3 و 9 نجمع الأرقام »…). A sort card that is a trap carries the
  mistake it catches (`trap`); a card the student must ACCEPT may name the mistake of refusing it (`miss`: 1 and the number
  itself are divisors). The workshop opens on that sentence.
- **The shapes a family may use, without touching the gestures**: *write* with or without a box for the remainder
  (« 47 = 6 × ▢ + ▢ », « 42 = 6 × ▢ » — with no `r` slot only the factor is judged); a *sort* card that is a number, an
  equality (`text` starting with `$`), or a SENTENCE in Arabic (`say: true`: drawn right-to-left, smaller, two lines at
  most — the walk fails on three). A sentence that is a LIST (a card with `list`, « قواسم 88: 1 ، 2 ، … », drawn with
  `data-lk-list`) is joined by `families.js › LIST_SEP` — a NO-BREAK space before each comma, an ordinary one after — so a
  line breaks only after a comma, never starts with one; it is set smaller (1.3rem, 1.1rem on a 4:3 screen) so the LONGEST
  list the family draws holds in two lines: « قواسم 88: 1 ، 2 ، 4 ، 8 ، 11 ، 20 ، 22 ، 44 ، 88 » (9 numbers: 8 divisors and an
  intruder), measured in Cairo Black at 444 px for 1.5rem against a card of 246 px (198 px at 1024 × 768). The launch walks
  (`lib/launchKitTwoTools.mjs › LONGEST_LIST`, drawn from the generator with a fixed seed) lay that text in a copy of the
  card on every screen that deals a list and fail on three lines or a line opening on a comma — whatever card the draw dealt.
- **A power** (2026-11-21, for `3am.m3.r06`): a *write* token `{ pow: [base, exponent] }` drawn with a REAL superscript
  (`gestures.jsx`, `.lk-pow`, `data-lk-pow="8^2"`, `"(−11)^2"`, `"2/3^2"`): its base is a string — a negative base always in
  brackets, « (−8) » — or a fraction `{ frac: [p, q] }` of two strings, drawn in tall brackets; it holds no box (`slotsOf`
  skips it). The answer after it is a box, or a fraction of TWO boxes (`{ frac: [S('n'), S('d')] }`). It is graded by
  `calc: { op: 'pow', x, e }` (`CALC.pow`) or `{ op: 'pow', n, d, e }` (`gradePower`: both terms, an EQUAL fraction accepted).
  **The keypad has no minus sign and three characters a box: a typed value is never negative** — a negative result
  ((−2)³ = −8) is only ever a *sort* card, where the sign is part of what is judged. A sort card of powers is a LaTeX
  equality (« $(-5)^{2} = -25$ », « $(0{,}3)^{2} = 0{,}09$ », « $\left(\frac{2}{3}\right)^{2} = \frac{4}{9}$ ») judged
  from its base, exponent and shown value as exact fractions.
- **Tests are part of the family** (`launchkit.test.js`): every generated question is re-computed apart and graded right, the
  numbers of each level stay in their range, every trap names a known mistake, the worked example is true.

Families on 2026-11-17 (the two prerequisites of the pilot lesson, then the pilot's own الكفاءة, which lesson 2 stands on):

| Item | Tool | Level 1 | Level 2 | Instrument |
|---|---|---|---|---|
| `1am.m3.r01` | القسمة الإقليدية | write « 47 = 6 × ▢ + ▢ »; place the greatest multiple not beyond the number | sort three equalities (is it THE Euclidean division?) — asked first; write with a two-digit divisor | `paper` |
| `1am.m3.r02` | قواعد قابلية القسمة | sort by 2, by 5 | sort by 3, by 9, by 4 — with numbers chosen to trap the wrong rule | `rules` |
| `2am.m1.r04` | القسمة الإقليدية على أيّ عدد (2AM, 2026-11-18) | write « 47 = 13 × ▢ + ▢ » (a two-digit divisor, quotient ≤ 5; the first one ≤ 29); place the greatest multiple of 11–15 on the 0–60 line | sort three equalities where « $9 = 14 \times 0 + 9$ » must be ACCEPTED (`miss` `quotient-zero`; four shapes in five hold such a card) beside the traps of the remainder — asked first; write a three-digit number by 12–25 (a two-digit quotient, remainder 0 possible). Its worked example estimates the quotient by tens first | `paper` |
| `1am.m1.r01` | الجمع والطرح والضرب (2026-11-18) | write « 7 × 8 = ▢ » in a situation (pencils in boxes; the first one ≤ 25) or « 47 − 42 = ▢ » (money in دج); place the flag on « a − d » (a pinned on the 0–60 line) | sort three equalities « صحيحة / خاطئة » — a neighbour of the table (`table-slip`), « 5 × 9 + 4 = 65 » the sum before the product (`order-ops`), a borrow forgotten (`borrow-forgot`) beside true ones — asked first; write « 23 × 4 », « 6 × 9 + 5 » (the shape of b × q + r) or a three-digit subtraction with a borrow. A question carries its operation (`calc`): `grade` re-computes it; a sum written for a difference, or the flag moved the wrong way, is `add-for-sub` (in the family's `mistakes`, its worked example is the borrow). Worked examples: product first, the borrow, the table built from a known product or by tens | **none** (`labTool: null`, 2026-11-19): this kit is shown BEFORE « القسمة الإقليدية », and `paper` is that lesson's own instrument. A family's instrument must belong to the item's home lesson or one before it, and never to a lesson whose kit shows the family (`launchkit.test.js`, for every lesson of the cycle); with none, the capsule skips its lab step (card → example → questions) and the result shows no « مختبري » button |
| `4am.m1.r01` | قاسم عدد طبيعي | write « 42 = 6 × ▢ » (the equality that shows a divisor); sort three numbers: divisor of 36 or not — a multiple of it is a trap | sort three sentences « صحيحة / خاطئة » (« قاسم », « مضاعف », « يقبل القسمة »: true, turned round, or with a remainder); sort numbers where 1 or the number itself appears | `rows` |
| `4am.m1.r03` | القاسم المشترك الأكبر لعددين (2026-11-20, for lesson 7 — and lesson 8, which also stands on it) | write « PGCD(x ; y) = ▢ » (x = g × m, y = g × n, m ≠ n from 2 to 5 sharing nothing, both ≤ 45; the very first ≤ 15); sort three numbers « قاسم مشترك / ليس قاسمًا مشتركًا » of one pair — a divisor of only one of the two is the trap (`divisor-of-one`), 1 is never a card | sort three equalities « PGCD(x ; y) = v », each on its own pair of 30–99 — asked first — true, a smaller common divisor (`common-not-greatest`) or the smaller number that leaves a remainder in the greater (`smaller-not-divisor`); write « PGCD(x ; y) = ▢ » on 30–99. A written answer is graded by `calc: { op: 'pgcd' }` and its slip named from the numbers. **Never a pair whose PGCD is 1, never one number dividing the other, never a pair named by the banks of lessons 4, 7 and 8** (`PGCD_AVOID`; `launchkit.test.js` reads the three banks): the kit is played just before the lesson that makes the student discover pairs sharing only 1. Its worked example writes both lists, what is in both and the greatest; its first step answers the mistake shown | `common` |
| `1am.m5.r02` | الكسور المتساوية (2026-11-20, for lesson 8 « اختزال كسر ») | write « n/d = p/▢ » or « n/d = ▢/q » — the FIRST family written with a real fraction bar: a token `{ frac: [top, bottom] }` whose terms are strings or ONE box (`gestures.jsx`, `.lk-frac`; `slotsOf` reads the boxes inside it); n/d = (k × p)/(k × q), k from 2 to 5, d ≤ 45 (the very first: k = 2, d ≤ 10); sort three equalities « n/d = x/y » (`equal`) | sort three equalities on fractions up to 180 with d ≥ 30, k up to 12 — asked first — divided by k, multiplied, the same number SUBTRACTED from both terms (`subtract-not-divide`) or one term divided only (`one-term-only`); write the missing term. A written answer is graded by `calc: { op: 'frac' }`, its slip named from the numbers. **Never a fraction the banks of `ikhtizal-kasr` and `ikhtizal-kitaba-kasriya` write** (`FRAC_AVOID`; `launchkit.test.js` reads both banks). Nothing names a key of lesson 8 (no stages, no « cannot be reduced », no PGCD, not even « اختزال »). Its worked example: a number dividing both terms, the two divisions, the equal fraction; its first step answers the mistake with an UNEQUAL fraction | `rules` |
| `3am.m3.r06` | حساب قوّة عدد نسبي (2026-11-21, the one core tool of « الجذر التربيعي لعدد موجب », unit 2) | write « 8² = ▢ » or « (−11)² = ▢ » — the first family with a real EXPONENT (the very first: 2² or 8²); sort three equalities of squares (`squares`): true, the base times the exponent (« 8² = 16 », `power-times`), a square of a negative written negative (`square-sign`) | sort three equalities — asked first — of a decimal squared (one decimal place where two belong: `decimal-places`), a fraction squared (the numerator alone: `fraction-one-term`), a negative cube (the sign lost: `odd-sign`), a power of ten (`power-times`); write « 3³ = ▢ » or « (2/3)² = ▢/▢ » (two boxes over a real bar). **The whole squares of the lesson's world (9, 16, 25, 36, 49, 81, 100, 196) are never written** (`SQ_BASES`: 2, 8, 11, 12, 13; `launchkit.test.js` reads the lesson's `world/story.js`); a decimal or a fraction is free. Nothing writes √, « الجذر », or a word of the world (ساحة, بلاطة, المقياس, ضلع). Its worked example writes the power as equal factors, its first step on the mistake shown | **none** (`labTool: null`): no 3AM lesson has an instrument; the capsule skips its lab step |
| `4am.m1.r02` | تعيين قواسم عدد (2026-11-19, for lesson 4) | write « 24 = 4 × ▢ »: the PARTNER of a divisor (the first one ≤ 29); sort three LISTS « قواسم 18: 1 ، 2 ، … » (6 to 8 divisors, never a square, three different numbers): whole, or a partner missing (`partner-forgot`), 1 or the number left out (`one-and-itself`), an intruder that leaves a remainder (`rest-not-zero`) | sort three lists of 40–99 — asked first — where the last pair tried is missing, both halves (`stop-early`), beside the other slips; write the partner of a two-digit divisor. A list card carries `n` and `list` (`launchkit.test.js` judges it from them). Its worked example writes every pair up to the square and the whole list; its first step answers the mistake shown (where to stop, 1 and the number, a remainder) | `divisors` |

Lessons 2 « قواسم عدد طبيعي » and 3 « خواص قواسم عدد طبيعي » (`qawasim-adad-tabii`, `khawass-qawasim`) share their
programme item `4am.m1.r02`, so the net gives them the same tools. Since 2026-11-18 there are TWO, both core: `4am.m1.r01`
(the lesson before), then `2am.m1.r04` (the Euclidean division by any number — lesson 3's third property, a common divisor
divides the remainder, uses it; link added in the net, `LEARNING_NET.md` §2.2bis). `launchkit.test.js` checks both lists and
that every core link has a family. The `2am.m1.r04` family also gives the three PGCD lessons the core tool they had no family
for. **Re-walked 2026-11-18**: `launch-kit-qawasim.mjs` and `launch-kit-khawass.mjs` (rewritten for the two tools, one shared
scenario, `e2e/lib/launchKitTwoTools.mjs`) pass at 1366×768, 1024×768 and 1840×900 (§7).

**The division road (2026-11-18)** — `toolsForLesson` (learning net): « القسمة الإقليدية » (1AM) has ONE tool, `1am.m1.r01`
(new family above); « قواعد قابلية القسمة » has `1am.m3.r01`; « القسمة الإقليدية وحصر حاصل القسمة » (2AM) has `1am.m3.r01`. The
2AM lesson ALSO received `2am.m1.r05` (« قيمة مقرّبة لحاصل قسمة عشري », home « الكسر: نسبة وحاصل قسمة », the lesson AFTER it,
which shares `2am.m1.r06` with it — and `2am.m1.r06` requires `2am.m1.r05`, the link goes from r05 to r06): **a tool is an EARLIER الكفاءة** — `toolsForLesson` now drops an item whose home lesson
comes after the lesson (`LEARNING_NET.md` §3, `toolsForLesson`); it stays in the lesson's review links. No family was written for `2am.m1.r05`.
A family no longer carries a `lesson` field: a lesson that has a pack is never named by shared code (`lessonPack.test.js`).

**Lesson 4 « القاسم المشترك الأكبر لعددين طبيعيين » (2026-11-19)**: two core tools, `4am.m1.r02` (home `qawasim-adad-tabii`, family above) then
`2am.m1.r04`; `launchkit.test.js` checks the list and that every core link has a family. Not walked yet.

**Lesson 7 « العددان الأوّليّان فيما بينهما » (2026-11-20)**: ONE core tool, `4am.m1.r03` (home `qasim-mushtarak-akbar`, family
above), on lesson 4's instrument `common` — the lesson's own `duo` is never in the kit's lab (`earlierOnly`). The kit names
the tool by its gesture (« القاسم المشترك الأكبر لعددين »). `launchkit.test.js` checks the
list from the net and that every core link has a family. Not walked yet.

**Lesson 8 « اختزال كسر » (2026-11-20)**: TWO core tools, `4am.m1.r03` (lesson 7's family, on `common`) and `1am.m5.r02`
(home `ikhtizal-kitaba-kasriya`, family above, on the 1AM instrument `rules`); the support `4am.m1.r04` (lesson 7) has no
family. The lesson's own `strip` is never in the kit's lab. Not walked yet: **the walk library `e2e/lib/launchKitTwoTools.mjs`
reads `.lk-equation > b` and cards of PGCD / Euclid shapes only — it must learn the fraction token and the cards
« $\frac{n}{d} = \frac{x}{y}$ »** before this lesson's launch is walked; the height of an equation with two bars at
1366 × 768 is not measured yet.

**« الجذر التربيعي لعدد موجب » (2026-11-21, lesson 1 of unit 2 `hisab-judhur`)**: ONE core tool, `3am.m3.r06` (home
`quwat-adad-nisbi`, 3AM, family above, no instrument); the support `3am.m4.r03` (Pythagoras) has no family. Not walked yet:
**the walk library `e2e/lib/launchKitTwoTools.mjs` reads `.lk-equation > b` — it must learn the power token (`data-lk-pow`
on `.lk-equation > .lk-pow`) and the answer of TWO boxes (`data-lk-slot="n"`, `"d"`)**, and its sort cards (LaTeX powers);
the height of « (2/3)² = ▢/▢ » at 1366 × 768 and the place of the superscript are not measured.

**A lesson with no family for its tools opens an EMPTY kit** (« عُدّتك جاهزة », 0 / 0 — seen by the owner on lesson 2,
2026-11-17): a family per core tool is part of a lesson's definition of done (`status:lesson-v2`, part S1).

## 5. Where it opens (phase 1)

The lessons that have a game world (the pilot and « قواسم عدد طبيعي »): in the world, the FIRST « ابدأ المغامرة » plays the launch, then the world starts
(`DivisorIsles.jsx › onBegin`, overlay `{ type: 'launch', then: 'start' }`, `Game.js › openLaunch / launched`); afterwards
« واصل » goes straight in, and « 🎒 عُدّتي » on the title screen opens the kit again (`data-di-launch-open`). The 3D world is
not drawn behind it. Other lessons keep « أستعدّ » unchanged until the owner validates this.

## 6. State and what it is NOT yet

`scopedStorage` key `smarter_launch_kit` (`store.js`; per student, **browser only**): `items[<item>] = { band, repaired, at }`,
`lessons[<code>] = { first, last, tries }`, the sound switch.

Phase 1 is a prototype to judge the feel. **Not built** (plan, phases 2–4):

- the server does not ask or grade: the result is **not learning evidence**, is **not seen by a teacher**, is not synced;
- the gate (§3bis) lives in the browser like the rest: a teacher does not see who needed a capsule;
- no picture of a الكفاءة with its sources (measured / deduced), no window of earlier الكفاءات, no automatic update from a
  later success, no « prerequisite or new idea? » diagnosis, no class grid;
- nine families (`1am.m1.r01`, `1am.m3.r01`, `1am.m3.r02`, `1am.m5.r02`, `2am.m1.r04`, `3am.m3.r06`, `4am.m1.r01`, `4am.m1.r02`, `4am.m1.r03`): a lesson whose tools have none has no launch.

## 7. Check

- Unit: `npx vitest run src/lessons/common/launchkit` in `apps/web` (37 tests in `launchkit.test.js` + 3 in `fraction.render.test.jsx` — the fraction token drawn with its bar and one box, the power token drawn with a real `<sup>` and no « ^ » seen (2026-11-21); the powers of `3am.m3.r06` each judged apart by exact repeated products, never a negative typed value, its five slips named, no square of the lesson's world, no word of the lesson, and the tool of « الجذر التربيعي لعدد موجب » read from the net: families true and in range — the missing term of `1am.m5.r02` found apart by trying every number, its two slips named, its given fractions checked against two banks — — the divisor lists of `4am.m1.r02` judged from their own numbers, the PGCD of `4am.m1.r03` computed apart by trying every number (its pairs checked against the banks, never a PGCD of 1, its three slips named, its worked example and memo true, no word of lesson 7's keys) and the tool of lesson 7 read from the net, every trap and worked example checked, the tools of lesson 4 — — the 2AM division with its own ranges, the 1AM operations with theirs (every equality of their worked examples evaluated, every slip named) —, the tools of lessons 2 and 3 and of the three lessons of the division road read from the net, a whole launch of « القسمة الإقليدية » (one who knows, one who misses everything and gets the capsule), named mistakes,
  the engine — never one answer, the workshop, the caps, the fresh tools, the gate and its capsule, the honesty star —,
  the order of the level-2 forms of every family, WHOLE launches played by the pure pieces the component chains
  (`nextStep` → `nextForm` → `makeQuestion` → `grade`, seeded) for the documented students of the walks — their sequences,
  bands and scores, the pilot's re-check reaching the 1AM sort —, a launch that produces `quotient-zero` and opens its
  workshop on it, and the sounds).
- Walk: `node apps/web/e2e/launch-kit.mjs [outDir]` (dev server up; also `E2E_SIZE=1024x768` and `1840x900`): 56 checks — the
  first « ابدأ », the three gestures with real taps and drags, the two verdicts, the workshop, the kit, the lab opened on the
  instrument, a tool re-checked (its level-2 question is now the sort of three equalities — walk updated 2026-11-18, not re-run since), the take-off, « played once », a student who misses everything: the gate, the four steps of
  the capsule, the door open after two missed answers, then the earlier lesson and the return. At every screenshot nothing scrolls and nothing leaves its panel; the walk also listens to the sounds played.
- Walks of lessons 2 and 3's launch: `node apps/web/e2e/launch-kit-qawasim.mjs [outDir]` and `launch-kit-khawass.mjs` —
  ONE scenario for both (`e2e/lib/launchKitTwoTools.mjs`; the two lessons have the same two core tools), rewritten for the
  two tools on 2026-11-18 and **passing at the three sizes** (one run of the khawass walk at 1840×900 died on a 30 s page load of the second student and passed on the re-run) — **then updated, NOT re-run, for the level-2 sort asked first** (same day, below). Four students: one who knows (four answers — A's equality and sentences, B's
  equality and its level-2 sort of three equalities —, 4 / 4, take-off); one who slips (A's sentences, B's first equality: B's flag, B's sort, both
  « تحتاج تثبيتًا », the workshop on A, the tool NOT repaired named first to revise, 2 / 4); one who misses everything
  (0 / 4, ONE capsule — A's, on `rows` —, the door open, B left « نبدأ منها » without a second lock); one who misses only B
  (B's workshop on the flag, B's capsule on `paper` answered right: « أُصلحت الآن », 3 / 4, take-off). Answers are computed
  from the numbers on screen. It adds to the layout rules: a sentence stays in its card on two lines at most, a placed card
  stays in its box, the boxes never lie under the buttons of the question; and soft checks on every screen (no raw formula,
  no text under 12 px, the ✕ reachable, and for lesson 3 no word of lesson 2). **B's level-2 sort is played by students 1
  and 2** (since 2026-11-18 a level-2 `sort` is asked first, §4 — before, it was never asked in a launch): every card's box
  is computed from its own equality, a card « s = b × 0 + s » must be in « قسمة إقليدية »; the walk FAILS if the sort never
  came up and prints a `note` when neither sort happened to hold a quotient-0 card (one shape in five). The pilot's walk
  re-checks the 1AM division and now meets its level-2 sort there (boxes computed apart too).
- Walks of the ONE-tool launches (2026-11-19, **written, NOT yet run**): `node apps/web/e2e/launch-kit-baqi.mjs`,
  `launch-kit-qawaid.mjs`, `launch-kit-hasr.mjs` [outDir] — one scenario for all three, `e2e/lib/launchKitTwoTools.mjs ›
  walkLaunchOne({ id, url, grade, outName, ids, alien, tool })`, the lesson giving only its tool (`item`, `name`, its
  year, its home lesson, `labTool`, the lines of its memo, the shape of the very first question). Four students: one who
  knows (one tool in the bag, 2 / 2, take-off); one who slips on the level-2 sort of three equalities (the workshop,
  repaired); one who misses everything (the capsule, the door opens anyway); one who misses then answers the capsule right
  (repaired, take-off). Every answer is computed from the screen. Tools: `qisma-iqlidiya-baqi` ← « الجمع والطرح والضرب »
  (`1am.m1.r01`); `qawaid-qabiliyat-qisma` and `qisma-iqlidiya-hasr` ← « القسمة الإقليدية » (`1am.m3.r01`, on `paper`).
  Known mismatch to fix before the run: `launch-kit-baqi.mjs` still expects the lab on `paper`, while `1am.m1.r01` has NO
  instrument since 2026-11-19 (`families.js`: `labTool: null` — the capsule skips its lab step).
- The older game-world walks seed the launch as already played (`u_<id>_smarter_launch_kit`).
- **On a phone held sideways** (`E2E_TOUCH=1 E2E_SIZE=800x370`: 55 checks; rules in `GAME_WORLD.md` « On a phone »): the bag
  is compact, a capsule's body slides inside itself, and « الدرس كاملًا » of an earlier lesson is a link only when that
  lesson opens on a phone (`PHONE_LESSONS`) — otherwise the line « الدرس كاملًا: على الحاسوب », never a link to the closed
  message. **Sorting fits above « تمّ »** (2026-11-17): on a short screen the card, its boxes and the placed cards are
  shorter and the boxes wider — the card kept its laptop height and, with the boxes, lay under the two buttons.
