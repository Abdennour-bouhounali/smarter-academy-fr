# LESSON_LAB — « مختبري », the lab of a lesson (2026-11-16)

**BINDING for the lesson v2 rollout (owner decision D6, 2026-11-17): every v2 lesson follows this contract — `LESSON_V2.md` says how a lesson plugs into it.** What has not changed: it was built on the pilot lesson and no real student has used it yet.

**Status: built and wired on `dev`.** Fifteen instruments (the fifteenth, `piece`, for `natiqa-ghayr-natiqa` on 2026-11-21; the fourteenth, `court`, for `jidhr-tarbii` the same day — the first outside unit 1 of 4AM; the ninth, `planks`, for `khawass-qawasim` on 2026-11-18; the tenth,
`bracket`, for the 2AM `qisma-iqlidiya-hasr` the same day — the first instrument of 2AM; the eleventh, `lists`, for
`tayin-pgcd` on 2026-11-19; the twelfth, `duo`, for `awwaliyan-fima-baynahuma` on 2026-11-20; the thirteenth, `strip`, for `ikhtizal-kasr` the same day); the registry is
open. Code: `apps/web/src/lessons/common/lessonlab/`. It is a different thing from the Math Lab « مختبر الرياضيات »
(`/espace/atelier`, `MATH_LAB.md`), which stays untouched: that one is a general workspace with documents; this one belongs to
the LESSON the student is in and shows only what he has already studied.

## 1. What it is

One lab for every lesson of the cycle. From a lesson the student opens « 🧪 مختبري » and finds:

- **« أدوات هذا الدرس »** — the instruments introduced by this very lesson;
- **« خزانتي »** — the instruments of EVERY lesson before it, of every grade, grouped by grade then by lesson. An instrument of
  a later lesson is **not listed at all** (not even locked): a student never meets a tool of something he has not studied;
- **« أعدادي »** — two numbers, SHARED by all instruments: the student carries his numbers from one instrument to the next
  and sees the same fact in another form (42 and 5 as rows with 2 left over, then as jumps that stop 2 before the flag);
- **« جرّب »** — two or three things to MAKE per instrument, ticked when made, counted in one ⭐ total for the student.

The lab opens on the first instrument of the lesson (or of the cabinet when the lesson introduces none).

## 2. The « previous lessons only » rule

- The order is the catalogue's: grade (1AM → 4AM), then `order` in `packages/core/curriculum/dz/lessons_<g>_2026_2027.json`.
  It is copied into `lessonlab/lessonOrder.generated.json` (codes only, 6 KB) by `npm run generate:lab-order`
  (`apps/web/scripts/generate-lab-order.mjs`). **Run it after adding or re-ordering a lesson**; `lab.test.js` fails when stale.
- `order.js › isReached(x, of)`: x is `of` itself or a lesson before it. `registry.js › toolsFor(lesson)` returns
  `{ mine, cabinet, all }`; `hasLab(lesson)` says whether any instrument is reached (the very first lessons of 1AM have none:
  they get no door).
- Tested for **every lesson of the four grades**: no lesson ever lists an instrument of a lesson after it.
- **Opened BEFORE the lesson** (« عُدّة الانطلاق », 2026-11-19): `toolsFor(lesson, { earlierOnly: true })` and
  `<LessonLab earlierOnly />` leave out the lesson's OWN instruments — `mine` is empty, not in `all`, and the rail has no
  « أدوات هذا الدرس » group at all (`data-ll-mine` is not rendered); an `initialTool` that is one of them is ignored. The
  lesson's own instrument names what the lesson will make him discover (lesson 4's « 🤝 القواسم المشتركة » is the name of its
  first key). Only the cabinet « خزانتي » and the instrument picked from it are shown. `lab.test.js` checks it for every lesson;
  `launchkit.test.js` checks that every family's `labTool` is in the `earlierOnly` lab of every lesson whose kit shows it.
- **Opened from the world's title screen BEFORE the first key** (known debt, 2026-11-20): the world's door
  (`LessonWorld.jsx`, `data-di-lab-open`) mounts `<LessonLab>` WITHOUT `earlierOnly`, so the lesson's own instrument is on
  the bench before any key is forged (lesson 5's `lists` then ran its whole procedure). Until the world says which keys are
  sealed, a lesson's instrument is built to be SAFE before its keys: it states facts only, runs no procedure on its own (`duo`
  writes its divisions one press at a time), and no string of its tile, quests or drawing holds a word of the lesson's tablets
  (`lab.test.js` checks it for `duo`). **Planned, not wired** (it is the world's code, `gameworld/kit/LessonWorld.jsx`): the
  world passes `earlierOnly` until the lesson's first key is sealed — the lab already honours it.
  **`court` « ساحة العدد » (2026-11-21) is NOT safe before its lesson's keys**: by the brief of its lesson it writes the
  sign √ and the side to 0,01 from below and from above — the words of tablets 🔑 and ✍️ of `jidhr-tarbii`. While the
  world's door mounts the lab without `earlierOnly`, a student who opens « مختبري » from the title screen before forging
  key 1 meets them (defects ledger A2). Its tile, its quests and its drawing name nothing until the hand has tried two sides;
  the √ lines appear only then. OPEN: the world passes `earlierOnly` until the lesson's keys are sealed.

## 3. An instrument

An entry of `registry.js › TOOLS`:

| Field | Meaning |
|---|---|
| `id` | stable id; also the file `tools/<Name>.jsx` loaded lazily by `load` |
| `lesson`, `lessonTitle` | the code of the lesson that INTRODUCES it and that lesson's exact catalogue title (the test compares) |
| `icon`, `name`, `hint` | the tile; `hint` is one plain sentence ending on what to look for |
| `needs` | `'ab'` or `'a'`: which of the shared numbers it uses |
| `labels`, `range` | how the two numbers are named in this instrument, and the values it can draw (`clampFor`) |

The component receives `{ a, b, setA, setB, play, report, range }` and renders `<Tool>` from `kit.jsx` (the drawing, then a
one-line reading of FIXED height — the drawing never moves when the reading changes).

**Rules of an instrument** (the bar of `MANIPULATION_DNA.md` applies):

1. The student's hand holds a MATHEMATICAL variable: a wall that sets the divisor, a flag that sets the number, the corner of a
   rectangle, a padlock of digits, a lens that tests each number it passes over. A handle that was never moved pulses.
2. The drawing READS: counters, landings, squares and their numbers are computed (`logic.js`, pure, tested) — never typed.
3. Numbers and equalities are written left to right (`.ll-draw > svg { direction: ltr }`); an Arabic label sets
   `direction="rtl"` on itself. A label must stay inside the stage (the walk checks every `<text>`).
4. `report({ key: `${a}:${b}`, … })` tells the shell what was made (divisors found, squares cut, a division finished). The
   `key` stamps the numbers it was made WITH: a report about other numbers is ignored.
5. No person is drawn.
6. Sound through `play(name, number)` only, with a name of the lab's palette (next section).

### The sounds (`sound.js`, 2026-11-17)

The lab has its OWN small instrument (`LabSound`: WebAudio, no asset, 27 sounds), the same in every lesson — it borrows nothing
from the game world. (`new LabSound(palette, gaps, log)` lets another page bring its own palette to the same synthesiser:
« عُدّة الانطلاق » does, `launchkit/sound.js`.) ON by default; the « الصوت » switch of the lab turns everything off (saved with the lab's state).

**The rule: a sound says WHAT HAPPENED under the hand, never the rule of the lesson.**

| What | Sound | Where |
|---|---|---|
| a number moves | `tick` / `click` / `select` — **the number has a note** (`pitchOf(n)`: five notes per octave, three octaves): 12 does not sound like 13 | the wall, the flag, the knob, the corner, a digit of the padlock, « − / + » of the number boxes |
| nothing is left | `fit` — ONE chime, the same in every instrument: sweeping the wall, the student HEARS where the rows are full | rows, jumps, the four sentences, the written division |
| something is left | `rest` / `short` — two soft low notes. **Never a buzzer: the lab has no wrong answer** | the same |
| a divisor and its partner | `found` — two notes together, the divisor's and its partner's; `miss` is a dull tap | the lens |
| a whole is finished | `complete` (every divisor found), `crown` (the PGCD), `lamps` (one soft note per lamp lit) | divisors, common divisors, Euclid, the padlock |
| a material | `snip` (scissors), `pencil` / `erase`, `swap` (the lever), `hop` (a jump), `drawer` / `shut` (the cabinet), `dice` | — |
| the bench | `enter` (the lab opens), `open` (an instrument is set down), `quest` (a « جرّب » is made — played AFTER the instrument's own sound), `ui`, `on` | the shell |

How to use it in an instrument:

- a sound of the GESTURE is played in the handler: `play('tick', nb)`;
- a sound that ANSWERS a change uses `useChime(play, name, when, deps, { delay, p })` (`kit.jsx`): it plays when `deps` change
  and `when` holds — **never when the instrument first appears** (an instrument is silent until the student moves something);
- the same sound is not repeated faster than its gap (`GAP`: a fast drag ticks, it does not rattle); several sounds at once go
  through one compressor;
- a new sound = one entry in `SOUNDS`, short (≤ 1.3 s) and quiet (gain ≤ 0.3). `lab.test.js` fails when an instrument plays a
  name that is not in the palette, when a sound of the palette is never played, or when an instrument has no sound at all.

**« جرّب »** (`logic.js › QUESTS`, `observe`): a quest names something to make, never a rule; `observe(tool, state, seen)`
returns the quests the state has just proved. Nothing is ticked before the student touches the instrument.

### The instruments (eight on 2026-11-16; `planks` and `bracket` added 2026-11-18; `lists` 2026-11-19; `duo` 2026-11-20 — its step in `e2e/lesson-lab.mjs` is NOT written yet)

| id | Lesson that introduces it | The hand holds | What is read |
|---|---|---|---|
| `rows` « صفوف القسمة » | 4AM `qasim-adad-tabii` | the wall (the divisor) | a counters in rows of b: full rows, counters left over, `a = b × q + r` |
| `jumps` « قفزات المضاعفات » | 4AM `qasim-adad-tabii` | the flag (the number) and the first landing (the jump) | landings on the multiples of b; what is missing before the flag |
| `sentences` « آلة الجمل الأربع » | 4AM `qasim-adad-tabii` | the swap lever | four sentences true together or false together, with the equality that proves it |
| `divisors` « قوس القواسم » | 4AM `qawasim-adad-tabii` | the lens | each divisor rises with its partner; an arc joins them |
| `planks` « اللوح المشترك » | 4AM `khawass-qawasim` | the end of the plank (its length d; arrows also move it) | one plank laid along six lengths — a, b, a + b, the difference, the remainder of the greater by the smaller, 3 × a: each filled (green, ✓) or with what is left (amber, « يبقى r »); `logic.js › plankRows`. The opening plank (4) is arbitrary; quests are reported only after the plank was moved |
| `common` « القواسم المشتركة » | 4AM `qasim-mushtarak-akbar` | the two numbers; a tap on a divisor | three trays; the greatest common one wears the crown |
| `lists` « مِنضدة القائمتين » | 4AM `tayin-pgcd` | the two numbers; the button « جرّب d » (the next number tried on BOTH at once — it calls the hand until first pressed); « من جديد »; a tap on a written divisor | the two lists BUILT by pairs (`logic.js › twoLists`): each number that divides one of them is written with its partner, small ones from the left, partners from the right, an arc joining a pair; a list closes by itself when the next number's square passes it (« قائمة n كاملة: 8 × 8 أكبر من 56 »). Once both are closed, a line joins every number in both and the greatest wears the crown (`PGCD(a ; b) = g`). Up to 120 (16 divisors at most, 16 slots). Why not `common`: lesson 4's instrument shows the lists already made and sorted in three trays; lesson 5 teaches the PROCEDURE — the lists written by pairs, where to stop, then what is in both. Its tile names no key of the lesson. Quests: both lists to their end for two numbers above 50, two different numbers that meet in the whole list of the smaller, two numbers meeting in 6 numbers or more. New numbers start a new sheet (the state is keyed by the numbers, like `bracket`) |
| `euclid` « مربّعات إقليدس » | 4AM `bahth-pgcd` | the corner of the rectangle; the scissors | each family of squares writes its division; the last side is the PGCD |
| `duo` « مِجهر العددين » (2026-11-20) | 4AM `awwaliyan-fima-baynahuma` | the two numbers (up to 999); three tabs drawn in the stage (`data-ll-face-tab`); on « القواسم » a tap on a divisor; on « القسمات المتتالية » the button « القسمة التالية » (calls the hand until first pressed) and « من جديد »; on « اختبر عددًا » the end of a ruler (d from 2 to the greater number; arrows, « − / + ») | ONE instrument for the lesson's three keys, three faces on the same two numbers (`logic.js › pairLists`, `euclidLines`, `probeOf`): the divisors of each number in a row and, between them, those « في القائمتين » (32 divisors at most up to 999: two lines of 16); the divisions one after another written row by row, remainders amber and 0 green, two columns of seven (987 and 610, the longest chain up to 999, need 14), then `PGCD(a ; b) = g` and « عدد القسمات: n »; one number d laid in pieces along BOTH numbers (one bar beyond 60 pieces), the two equalities, « d يقسم العددين معًا / يقسم a وحده / لا يقسم أيًّا منهما », and the last twelve d tried on these numbers. Facts only: it never names what two numbers sharing only 1 are, nor says anything of the last remainder; it opens on the lists and reports only after a gesture. Why not `common` + `euclid`: `common` sorts trays up to 100 and crowns the greatest, `euclid` cuts squares up to 60; the lesson's numbers (546 and 385, 645 and 410) need three digits, and its third key needs one number tried on both. Its tile names no key of the lesson. Quests: two lists above 100 meeting in 4 numbers or more, divisions down to 0 needing 5 or more, a number above 10 dividing both. New numbers start a new sheet |
| `strip` « شريط الكسر » (2026-11-20) | 4AM `ikhtizal-kasr` | the length k of a piece (2 to the longer term): the handle on a ruler (`data-ll-strip-handle`; arrows), « − / + » (`data-ll-strip-minus`, `data-ll-strip-plus`) | a fraction of the student's own (`a` = البسط, `b` = المقام, up to 999): a strip of b cells with its first a cells lit (`data-ll-strip-bar`, `data-ll-strip-lit`), the pieces of k laid from 0 (`logic.js › stripOf`): their joints (`data-ll-strip-joint`; beyond 120 pieces one bar and « n قطعة », `data-joints="bar"`), the piece INSIDE which the light ends outlined amber (`data-ll-strip-cut="from:to"`) or the light ending on a joint (`data-ll-strip-onjoint`), what no whole piece covers at the end (`data-ll-strip-left`); the fraction drawn with its bar (`data-ll-strip-frac="cells"`) and, ONLY when k divides both, the same fraction in pieces « = (a ÷ k)/(b ÷ k) » with « قطع k: x مضاءة من y » (`data-ll-strip-rewrite`, `data-ll-strip-frac="pieces"`); the reading writes the two divisions and « k يقسم البسط والمقام معًا / يقسم البسط وحده / يقسم المقام وحده / لا يقسم البسط ولا المقام » (`data-ll-strip-verdict`); the last twelve k tried as chips (`data-ll-strip-tried`, `data-ll-strip-tried-k`). Facts only: no word of what a fraction is when only 1 fits, nothing about the longest piece, no PGCD, not the word « اختزال »; it does nothing on its own and reports only after the handle moved. Why not `duo`'s probe: `duo` tries one number on two numbers side by side; the lesson's world is ONE bridge with a lit stretch, and what matters is where the light ends among the joints and the fraction rewritten. Quests: a piece above 10 dividing both, a denominator above 500 rewritten under 50, a piece of the denominator only (denominator above 100). New numbers start a new sheet |
| `court` « ساحة العدد » (2026-11-21) | 4AM `jidhr-tarbii` | the side s of a square (1 to 21) on a ruler (`data-ll-court-handle`; arrows), « − / + » (`data-ll-court-minus`, `data-ll-court-plus`); `needs: 'a'`, a = the court's area in tiles (1 to 400: every whole square up to 20 × 20) | a court of a tiles laid from its corner into an s × s square, row by row (`logic.js › courtOf`, integers only): the tiles inside (`data-inside`), the places left empty drawn dashed (`data-ll-court-hole`), the tiles that do not fit in amber along the square's next column and row (`data-ll-court-out`; « +n » beyond them, `data-ll-court-more`); the reading writes « s × s = s² » and « خارج المربّع: n بلاطة » / « خانات فارغة في المربّع: n » / « المربّع ممتلئ » (`data-ll-court-verdict`: `out`, `holes`, `fits`). Once the hand has tried k (the greatest whole square) and k + 1 — k alone for a perfect square (`courtSettled`, like `bracket`) — a panel of DOM text (MathText) writes the court: « أكبر مربّع كامل فيها: k × k = k² », what is left, then « √a = k » (`data-ll-court-root`) or « k < √a < k + 1 » (`data-ll-court-bracket`) and « إلى 0,01: lo < √a < hi » (`data-ll-court-near`, e.g. `5,47:5,48` for 30) with the two squares that prove it (5,47² = 29,9209, 5,48² = 30,0304) — all from `isqrt(a × 10000)`, never a float root. Why `needs: 'a'` and not a second number b « a rod to try »: the trial side IS the hand's gesture — a number typed in the shared panel would replace the gesture by a field. Why not the world's `Court` of `rootCourts/courtParts.jsx`: it lowers ONE platform on one rod, in the world's palette; the lab's gesture is the opposite (the area fixed, the side swept) and must show where the tiles go. NOT safe before the lesson's keys (§2). Quests: a court above 100 filled by a whole square, a court above 150 settled between two sides tried, 20 tiles or more left beside the greatest whole square. New numbers start a new sheet |
| `piece` « منصّة الكسر » (2026-11-21) | 4AM `natiqa-ghayr-natiqa` | the NUMERATOR p of a rod p/q: a handle on a ruler marked in steps of 1/q, the whole tiles labelled (`data-ll-piece-handle`; arrows), « − / + » (`data-ll-piece-minus`, `data-ll-piece-plus`); `needs: 'ab'`: a = the court's area in whole tiles (1 to 50), b = the denominator q (1 to 12); a new q keeps the rod's length (p rescaled) | a court of a tiles, each tile cut into q × q small pieces, and the square platform built on the rod p/q from the court's corner, both to scale: the band it leaves amber (`data-ll-piece-band`), what it holds more violet (`data-ll-piece-over`), green when it covers the court; its small pieces drawn when they are 4 units wide or more (`data-ll-piece-grid`); the rod under it, p/q with a real bar (`data-ll-piece-rod`). The panel (DOM text, MathText) COUNTS in integers (`logic.js › pieceOf`): « في البلاطة: q × q », « في الساحة: a × q² », « في المنصّة: p × p »; the reading writes « p² <, =, > a·q² » and « يبقى شريط: n قطعة / تزيد المنصّة: n قطعة / المنصّة تغطّي الساحة بالضبط » (`data-ll-piece-verdict`: `band`, `jam`, `fits`); « أقرب ما وصلتَ إليه » keeps the NEAREST rod reached on this court, whatever its denominator, with its difference in tiles n/q² (`closerPiece`: compared by multiplying across; `data-ll-piece-best="p:q:n"`). Facts only: it never says why the two counts can or cannot agree, writes no root and names no key of its lesson (`lab.test.js` keeps « ناطق », « مدوّر », « مقرّب », « جذر » and √ off its tile, quests and source). Why not lesson 1's `court`: `court` sweeps WHOLE sides on whole tiles; this lesson's news is the rod that is a fraction — the court counted in pieces of 1/q, and a court that no denominator ever covers (2: 7/5 is one piece short, 17/12 one piece over). Its own viewBox (560 × 370) and point mapper (`piecePoint`, D38). Quests: a court above 10 covered exactly by a rod of denominator above 1, a difference of ONE piece with a denominator above 4, a difference under a hundredth of a tile (not zero). A new court starts a new record |
| `paper` « القسمة على الورقة » | 1AM `qisma-iqlidiya-baqi` | the step button | the division as written on a sheet, with what one says at each step (`gameworld/kit/longDivision.js`) |
| `rules` « كاشف قابلية القسمة » | 1AM `qawaid-qabiliyat-qisma` | the digits of a padlock; a tap on a lamp | six lamps (2, 3, 4, 5, 9, 10) and the digits each rule reads |
| `bracket` « مسطرة الحصر » | 2AM `qisma-iqlidiya-hasr` | the end of the last plank (how many planks of b are laid from 0 — reset to one plank when the numbers change; arrows and two buttons « لوح آخر + » / « − لوح » for one plank at a time) | planks of b along a length a (up to 9999, b up to 999): inside blue, the one that passes rose, what is left a dashed amber gap; under them « n × b = … <, =, > a ». The hand can lay at most ONE plank past the full ones (`logic.js › bracketOf`: `q`, `need`, `left`, `over`). Only once the hand has laid BOTH the full count and the next one does it write the bracket of these numbers (« 27 < 438 ÷ 16 < 28 », or « a ÷ b = q » when nothing is left) and the chip « الكاملة q · اللازمة q + 1 » — never a rule. Over 60 planks are drawn as one bar. Quests: the last plank alone passing, filling exactly with more than 10 planks, the full and the needed planks for a four-digit length and a two-digit plank |

The three lessons of the division road (2026-11-18) each have an instrument of their own (status part S8): `paper` (1AM
division) and `rules` (1AM divisibility) were already there; `bracket` is new. A 4AM lesson's cabinet now has THREE grades
when it reaches 2AM: it opens on the NEAREST grade (2AM), 1AM is one tap away.

**To add an instrument**: write `tools/<Name>.jsx`, add its `TOOLS` entry (lesson code + exact title), its maths in `logic.js`
with tests, its `QUESTS` and its `observe` branch, a step in `e2e/lesson-lab.mjs`, and a row in the table above.
When a NEW lesson has a manipulation worth keeping at hand, give it an instrument here — small, free numbers, one gesture.

## 4. Where it opens

| From | Door | How |
|---|---|---|
| a lesson with a game world (`qasim-adad-tabii`) | « مختبري » on the title screen (`data-di-lab-open`) | overlay `{ type: 'lab' }`, the lab rendered `inline` inside the game's root, with the lab's own sounds; the 3D world behind it is neither simulated nor drawn while it is open (`Game.js › loop`) |
| a lesson in mission mode | « 🧪 مختبري » in the foot row of the returning home (`MissionHome`, `data-mission-lab`) | `?lab=1` |
| any other lesson page, for a student | « 🧪 مختبري » beside the lesson chip (`data-lesson-lab-open`) | `?lab=1` |
| the kit of « عُدّة الانطلاق » (`LAUNCH_KIT.md`) | « جرّب الأداة في مختبري » | `<LessonLab initialTool={family.labTool} earlierOnly />`: the lab opens ON that instrument, put on the bench like a pick from the cabinet (ignored when the lesson has not reached it); `earlierOnly` (§2): the kit is played before the lesson, so the lab shows no « أدوات هذا الدرس » — only the cabinet (the walk library `e2e/lib/launchKitTwoTools.mjs › labShot` asserts it). A family with no instrument (`labTool: null`, e.g. `1am.m1.r01`, shown before the lesson that introduces `paper`) shows no lab button and its capsule has no lab step |

`LessonIndex` renders the lab for `?lab=1` when `hasLab(lesson)` (portal to the body); closing removes the parameter. A teacher
gets no button (he may open `?lab=1` by hand). Lessons and the lab stay behind `RequireLargeScreen` (≥ 768 px).

## 5. Screen

- **Nothing scrolls.** Two designs so the text never gets small: 1280 × 720 for a wide screen, 1000 × 740 for a 4:3 one
  (`ll-root--narrow`), each zoomed to the window. Measured: tile / quest / reading text 17 / 16 / 20 px at 1366 × 768,
  16 / 15 / 19 px at 1024 × 768, 20 / 19 / 23 px at 1840 × 900.
- The cabinet never scrolls either: one grade per tab, four lessons a page — three when the grade has more than four and needs the pager (2026-11-19).

## 6. State

`scopedStorage` key `smarter_lesson_lab` (per student, browser only, not synced): the two numbers, the instruments picked from
the cabinet (the last five), the quests done, the sound switch. One toolbox for the student: what he made in one lesson's lab
is counted in another's. **The lab writes NO learning evidence** and unlocks nothing.

## 7. Bundle

Everything is inside the lazy lesson boundary: `LessonIndex` imports only `registry.js` + `order.js` + the 6 KB order file;
`LessonLab.jsx` and each instrument are loaded when opened. Nothing enters the entry bundle (`BUNDLE_BOUNDARIES.md`).

## 8. Check

- Unit: `npx vitest run src/lessons/common/lessonlab` in `apps/web` (68 tests in eight files — since 2026-11-21 `piece.render.test.jsx` (« منصّة الكسر »: the opening rod q/q with nothing kept, 7/5 on 2 one piece short and kept as the nearest rod, an overhang in violet, 12/4 covering 9 with its pieces drawn, a denominator of 1 in whole numbers, the largest court and denominator inside the drawing, the point mapper) and `lab.test.js` checking `pieceOf` for every a ≤ 50, q ≤ 12 and every p of the ruler (a rod covers the court for a perfect square only, once), `closerPiece`, the quests and the lesson's lab; `court.render.test.jsx` (« ساحة العدد »: the opening square of 2 and nothing written, a square too big with its empty places, 30 settled by 5 and 6 — 5,47 and 5,48 and their squares —, 144 filled with √144 = 12, the agreement of « بلاطة », 400 tiles and a side of 21 inside the drawing) and `lab.test.js` checking `courtOf` for every a ≤ 400 against sides tried one by one and the hundredths by squaring, `courtSettled`, the quests and the lesson's lab —, `lab.test.js` (since 2026-11-20 also `stripOf` on a grid up to 999 and the words of lesson 8's tablets kept off `strip`), `strip.render.test.jsx` (« شريط الكسر »: the piece 2 at the opening, the light ending inside a piece, the fraction in pieces only when k divides both, 500 pieces as one bar, every drawn x and y inside 940 × 370), `duo.render.test.jsx` (« مِجهر العددين »: the lists and what is in both, a pair sharing only 1 read as a fact with no name, 840 and its 32 divisors inside the drawing, the divisions empty then row by row to the remainder 0 — 546 and 385 —, 987 and 610 in two columns, one number tried on both with its verdict and the one-bar branch; `lab.test.js` checks `pairLists` / `probeOf` on a grid up to 999, the 14 divisions at most, the tile, quests and every Arabic string of `Duo.jsx` against the words of the lesson's tablets), `planks.render.test.jsx` (the planks drawn by a server render: its labels, no raw formula, a plank kept inside the drawing), `lists.render.test.jsx` (« مِنضدة القائمتين »: two empty lists and the button calling the hand, one list closed and one open half-way, the links and the one crown once both are closed, the smaller dividing the greater, 120 and its 16 divisors inside the drawing; `twoLists` checked for every a ≤ 120 against the divisors and the PGCD) and `bracket.render.test.jsx` (the opening plank, the product compared with a, no bracket before the hand laid both counts, a length shorter than one plank, and — through its `start` prop — 5000 planks of 2 laid on 9999 drawn by the one-bar branch: one bar and one rose plank, never thousands of rectangles); `bracketOf` is checked for every a ≤ 200, b ≤ 60 and every n: the order is the catalogue's; no future
  instrument for any lesson; every equality the instruments draw; quests ticked only by what was made; the sounds — every
  name played exists, a number has a note, a sound is short and quiet and does not rattle).
- Walk: `node apps/web/e2e/lesson-lab.mjs [outDir]` (dev server up; also `E2E_SIZE=1024x768` and `1840x900`): lesson 1 of 4AM
  from its game world, then lesson 5 `tayin-pgcd` from its game world (`lists` PLAYED: 40 and 56, « جرّب » pressed until both
  lists close — ⌊√56⌋ = 7 presses —, each list against the divisors the walk computes, the links 1, 2, 4, 8 and the one crown
  on 8, « من جديد » clears the sheet), then lesson 6 `bahth-pgcd` from its game world since 2026-11-19 (its one instrument `euclid`; its 4AM shelf: five earlier
  lessons; the lab closed by its ✕), then lesson 7 `awwaliyan-fima-baynahuma` from its game world since 2026-11-20 (its one
  instrument `duo` opens, the lab closed by its ✕), then lesson 8 `ikhtizal-kasr` (`strip`), then `jidhr-tarbii` from its
  world « قصر الساحات » (step written 2026-11-21, **NOT run**: its one instrument `court` on 30 — « + » up to 6, its six
  empty places, « − » to 5, the court written 5 × 5 = 25, 5 < √30 < 6 and 5,47 / 5,48, every value computed by the walk
  — then 144 with the handle DRAGGED to 12: full, √144 = 12, the quest ticked, the tick and the chime heard), then `natiqa-ghayr-natiqa` (step « 2quinquies », written 2026-11-21, **NOT run**: `piece` on 2 cut in 5 × 5, « + / − » to 7/5 — 49 against 50, the nearest rod 7:5:1, quest `one` —, denominator 12: 17/12, 289 against 288, the nearest rod 17:12:1, quest `close` —, then 16 in 3 × 3 with the handle DRAGGED to 12/3: 144 each, its pieces drawn, quest `exact`; every count computed by the walk; `E2E_LAB_ONLY=2quinquies`), then
  a lesson with no lab. Real pointer drags on the wall,
  the flag, the corner and the lens. At every screenshot: nothing scrolls, nothing leaves the screen, no label is clipped. The walk also LISTENS (in dev `sound.js`
  writes each sound it has really played into `window.__labSounds`): the opening chime, the ticks of the wall and the one
  chime of the full rows, silence with the switch off, the eight hops, the drawer, the pencil, the scissors, the crown. Lesson 1 of 4AM counts three instruments in « خزانتي » (two of 1AM, one of 2AM), its cabinet opens on 2AM (`qisma-iqlidiya-hasr`, `bracket`) and the walk taps « 1AM » before `paper` and `rules`; the PGCD lesson's cabinet has three grades. **Since 2026-11-19 `bracket` and `planks` are PLAYED, and every drawing is read against what the walk computes itself** (`bracketWanted`, `planksWanted` — never read from the instrument): `bracket` on 100 ÷ 7 (one plank at the opening and no bracket, the hand drags to the 14 full planks — still no bracket —, then one more: « 14 < 100 ÷ 7 < 15 », the quest ticked), on new numbers 1000 ÷ 37 (27 full, 28 needed), on 84 ÷ 7 (filled exactly: the bracket closes on one number), and a HARD check that after typing 84 and 9 one « − لوح » does not write the bracket (the hand must lay both counts for the new numbers — the `Bracket.jsx` reset); `planks` (in the PGCD lesson's cabinet): the plank of 4 at the opening, then dragged to 7, 14 and 5, each time every row (planks, green, « يبقى r », where the planks and the gap end) compared with the computation. **This version of the walk has NOT been run yet** (2026-11-19; the `lists` step was added the same day, not run either).

## 9. Known limits

- Fifteen instruments: thirteen around division, divisors and fractions (unit 1 of 4AM and its earlier lessons), `court` and `piece` for the first two lessons of unit 2; the other lessons show the cabinet only.
- Not validated by the owner; no real student has used it.
- The lab's state is not synced between devices.
- The sounds were checked by a walk that reads what was played, not by a human ear: their level and their feel on a tablet's
  speaker are still to be judged by the owner.
- The old « 🧪 المختبر » button of the Math Lab (`MathLabEntryButton`) is still on lesson pages; whether « مختبري » replaces it
  is the owner's decision.
- **On a phone held sideways** (`E2E_TOUCH=1 E2E_SIZE=800x370`: 33 checks; rules in `GAME_WORLD.md` « On a phone »): 12 px
  is the floor of a label, the quests are one line that slides, the instrument's drawing (`.ll-draw`) slides inside
  itself. The lab opens there only with a lesson that opens on a phone: the walk checks that another lesson's lab is
  closed with its lesson. The instruments were looked at on screenshots, not held in a hand.
