# LESSON_LAB — the lab of a lesson

> **Status (2026-11-22).** Covers the lab a student opens from a lesson (`apps/web/src/lessons/common/lessonlab/`) — not
> the Math Lab (`/espace/atelier`, `MATH_LAB.md`). Imported from the Algerian platform (DZ dev `7f4cef1c`) on
> 2026-11-22. True here: the shell, the « previous lessons only » rule, the shared numbers, the quests, the sounds, the
> fifteen instruments' code. Since 2026-11-23 `factor` « L’échelle des facteurs » is tagged (3e
> `decomposer-en-facteurs-premiers`); since 2026-11-24 `common` and `lists` too (3e `trouver-le-pgcd`, its design's port
> map; `euclid` stays untagged: its name says « Euclide »); the thirteen other Algerian ones keep `lesson: null` (their tags are in
> `git show 049380e:apps/web/src/lessons/common/lessonlab/registry.js`) and are listed nowhere.
> `lessonOrder.generated.json` holds the French catalogue's order. Not true here: no lab walk exists, and no lesson
> mounts its lab yet. Since 2026-11-22 the lab is French and left to right: its screen
> (« Mon labo », « Les outils de cette leçon », « Mon armoire », « Mes nombres », « Essaie »), the instruments' names,
> hints and labels are French, and the drawings that the Arabic lab laid « from the right » now read from the left
> (`layout.render.test.jsx`). It was never used by a real student.

## 1. What it is

One lab for every lesson. From a lesson the student opens the lab and finds:

- **this lesson's tools** (« Les outils de cette leçon ») — the instruments introduced by this very lesson;
- **the cabinet** (« Mon armoire ») — the instruments of EVERY lesson before it, of every grade, grouped by grade then by lesson. An
  instrument of a later lesson is **not listed at all** (not even locked): a student never meets a tool of something he
  has not studied;
- **my numbers** (« Mes nombres ») — two numbers, SHARED by all instruments: the student carries his numbers from one instrument to the
  next and sees the same fact in another form;
- **try** (« Essaie ») — two or three things to MAKE per instrument, ticked when made, counted in one ⭐ total for the student.

The lab opens on the first instrument of the lesson (or of the cabinet when the lesson introduces none).

## 2. The « previous lessons only » rule

- The order is the catalogue's: grade (`6e` → `3e`), then `order` in `packages/core/curriculum/fr/lessons_<g>_2026_2027.json`.
  It is copied into `lessonlab/lessonOrder.generated.json` (codes only) by `npm run generate:lab-order`
  (`apps/web/scripts/generate-lab-order.mjs`). **Run it after adding or re-ordering a lesson**; `lab.test.js` fails when
  stale.
- `order.js › isReached(x, of)`: x is `of` itself or a lesson before it. `registry.js › toolsFor(lesson)` returns
  `{ mine, cabinet, all }`; `hasLab(lesson)` says whether any instrument is reached (a lesson with none gets no door).
- Tested for every lesson of the catalogue: no lesson ever lists an instrument of a lesson after it.
- **Opened BEFORE the lesson** (the launch kit): `toolsFor(lesson, { earlierOnly: true })` and
  `<LessonLab earlierOnly />` leave out the lesson's OWN instruments — `mine` is empty, not in `all`, and the rail has no
  « this lesson's tools » group at all (`data-ll-mine` is not rendered); an `initialTool` that is one of them is ignored.
  The lesson's own instrument names what the lesson will make him discover. `lab.test.js` checks it for every lesson;
  `launchkit.test.js` checks that every family's `labTool` is in the `earlierOnly` lab of every lesson whose kit shows it.
- **Opened from the world's title screen BEFORE the first key** (known debt): the world's door (`kit/Title.jsx`,
  `data-di-lab-open` → `kit/LessonWorld.jsx`) mounts `<LessonLab>` WITHOUT `earlierOnly`, so the lesson's own instrument
  is on the bench before any key is forged. Until the world says which keys are sealed, a lesson's instrument is built to
  be SAFE before its keys: it states facts only, runs no procedure on its own, and no string of its tile, quests or
  drawing holds a word of the lesson's tablets. **Planned, not wired**: the world passes `earlierOnly` until the
  lesson's first key is sealed — the lab already honours it. Of the imported instruments, `court` is NOT safe before its
  lesson's keys (it writes √ and the side to 0,01).

## 3. An instrument

An entry of `registry.js › TOOLS`:

| Field | Meaning |
|---|---|
| `id` | stable id; also the file `tools/<Name>.jsx` loaded lazily by `load` |
| `lesson` | the code of the lesson that INTRODUCES it (`null`: listed nowhere); its title is read from the catalogue |
| `icon`, `name`, `hint` | the tile; `hint` is one plain sentence ending on what to look for |
| `needs` | `'ab'` or `'a'`: which of the shared numbers it uses |
| `labels`, `range` | how the two numbers are named in this instrument, and the values it can draw (`clampFor`) |

The component receives `{ a, b, setA, setB, play, report, range }` and renders `<Tool>` from `kit.jsx` (the drawing, then
a one-line reading of FIXED height — the drawing never moves when the reading changes).

**Rules of an instrument**:

1. The student's hand holds a MATHEMATICAL variable: a wall that sets the divisor, a flag that sets the number, the
   corner of a rectangle, a padlock of digits, a lens that tests each number it passes over. A handle that was never
   moved pulses.
2. The drawing READS: counters, landings, squares and their numbers are computed (`logic.js`, pure, tested) — never typed.
3. Everything is laid out left to right (`.ll-draw > svg { direction: ltr }`; `FRENCH_LANGUAGE_CONTRACT.md` §8): the
   first counter, tab, column or list item is on the LEFT (`layout.render.test.jsx`, which also refuses a right-to-left
   direction and an Arabic string in any drawing). A label must stay inside the stage.
4. `report({ key: `${a}:${b}`, … })` tells the shell what was made. The `key` stamps the numbers it was made WITH: a
   report about other numbers is ignored.
5. No person is drawn.
6. Sound through `play(name, number)` only, with a name of the lab's palette (next section).

### The sounds (`sound.js`)

The lab has its OWN small instrument (`LabSound`: WebAudio, no asset), the same in every lesson — it borrows nothing from
the game world. (`new LabSound(palette, gaps, log)` lets another page bring its own palette to the same synthesiser: the
launch kit does, `launchkit/sound.js`.) ON by default; the lab's sound switch turns everything off.

**The rule: a sound says WHAT HAPPENED under the hand, never the rule of the lesson.**

| What | Sound |
|---|---|
| a number moves | `tick` / `click` / `select` — **the number has a note** (`pitchOf(n)`: five notes per octave, three octaves) |
| nothing is left | `fit` — ONE chime, the same in every instrument |
| something is left | `rest` / `short` — two soft low notes. **Never a buzzer: the lab has no wrong answer** |
| a divisor and its partner | `found` — two notes together; `miss` is a dull tap |
| a whole is finished | `complete`, `crown`, `lamps` |
| a material | `snip`, `pencil` / `erase`, `swap`, `hop`, `drawer` / `shut`, `dice` |
| the bench | `enter`, `open`, `quest` (played AFTER the instrument's own sound), `ui`, `on` |

How to use it in an instrument:

- a sound of the GESTURE is played in the handler: `play('tick', nb)`;
- a sound that ANSWERS a change uses `useChime(play, name, when, deps, { delay, p })` (`kit.jsx`): it plays when `deps`
  change and `when` holds — **never when the instrument first appears**;
- the same sound is not repeated faster than its gap (`GAP`); several sounds at once go through one compressor;
- a new sound = one entry in `SOUNDS`, short (≤ 1.3 s) and quiet (gain ≤ 0.3). `lab.test.js` fails when an instrument
  plays a name that is not in the palette, when a sound of the palette is never played, or when an instrument has no
  sound at all.

**Quests** (`logic.js › QUESTS`, `observe`): a quest names something to make, never a rule; `observe(tool, state, seen)`
returns the quests the state has just proved. Nothing is ticked before the student touches the instrument.

### The instruments (the fifteen Algerian ones untagged; `factor` tagged)

**`rope` « La corde et le triangle » — its mathematics crossed, the instrument is Planned** (2026-11-24, commit
`784f483a`). On the Algerian platform it is the first instrument drawn by `GeoFigure`: a triangle ABC whose sides from A
are knotted ropes AB = a and AC = b (whole metres, 2 to 30), a knot M on [AB] and a knot N on [AC] moved by the hand; the
knots stand on one line exactly when (MN) ∥ (BC). What is in this tree: `logic.js › ropeOf(a, b, m, n)` → `{ am, mb,
an, nc, aligned }` (`aligned` ⇔ m × b = n × a, integers only), `QUESTS.rope` (`align`: a parallel cut on two ropes of
different lengths; `two`: two different parallel cuts on one triangle; `big`: a parallel cut with both ropes above
20 m) and its `observe` case (reported only after a knot moved, `moved`, with `found` the values of m already cut),
and the `.ll-rope` styles. `lab.test.js` proves the law for every triangle it can show (PGCD(a ; b) − 1 parallel cuts on
whole knots) and keeps the lesson's words (« Thalès », « papillon », « coefficient », « proportion », « agrandissement »,
« réduction », « rapport », a fraction, « faux ») off its quests. NOT in this tree: the instrument `tools/RopeTriangle.jsx`
and its tile in `registry.js` — it draws its triangle with the « Les pyramides » world's figure spec and crosses with
that world.


| id | The hand holds | What is read |
|---|---|---|
| `rows` | the wall (the divisor) | a counters in rows of b: full rows, counters left over, `a = b × q + r` |
| `jumps` | the flag (the number) and the first landing (the jump) | landings on the multiples of b; what is missing before the flag |
| `sentences` | the swap lever | four sentences true together or false together, with the equality that proves it |
| `divisors` | the lens | each divisor rises with its partner; an arc joins them |
| `planks` | the end of the plank (its length d) | one plank laid along six lengths (a, b, a + b, the difference, the remainder, 3 × a): each filled or with what is left |
| `common` — **`trouver-le-pgcd`** | the two numbers; a tap on a divisor | three trays; the greatest common one wears the crown |
| `lists` — **`trouver-le-pgcd`** | the two numbers; « try d » on both at once | the two lists built by pairs, each closing when the next square passes it; then what is in both and the greatest |
| `euclid` | the corner of the rectangle; the scissors | each family of squares writes its division; the last side is the PGCD |
| `duo` | the two numbers (up to 999); three faces | the divisors of each and those in both; the successive divisions to the remainder 0; one number tried on both |
| `strip` | the length k of a piece | a fraction a/b as a strip of b cells, a lit; pieces of k; the fraction rewritten in pieces only when k divides both |
| `court` | the side s of a square | a court of a tiles laid into an s × s square; once settled, √a = k or k < √a < k + 1 and the bracket to 0,01 (from `isqrt(a × 10000)`, never a float root) |
| `piece` | the numerator p of a rod p/q | a court of a tiles cut in q × q pieces and the square platform on p/q, counted in integers (p² against a·q²); the nearest rod reached |
| `paper` | the step button | the division as written on a sheet, with what one says at each step (`gameworld/kit/longDivision.js`) |
| `rules` | the digits of a padlock; a tap on a lamp | six lamps (2, 3, 4, 5, 9, 10) and the digits each rule reads |
| `bracket` | the end of the last plank | planks of b along a: « n × b <, =, > a »; once both counts were laid, the bracket of a ÷ b |
| `factor` — **`decomposer-en-facteurs-premiers`** | the plank: 2 to 13 on the rack, any length typed, or the whole gap | the number (2 … 9 999) as a gap; a plank that fills it shortens it to the number of planks laid (a rung « 72 = 2 × 36 » on the ladder at the left, the world's `divisorIsles/factorLadder.js`); one that does not leaves its rest in amber; once the gap is 1 case, the row of planks as one product. Free play: no order imposed, no word of the lesson's tablets (safe before its keys, §2). Quests: a number above 100 to 1 case, a ladder of 6 planks, a four-digit number |

Files: `tools/Rows.jsx`, `Jumps.jsx`, `Sentences.jsx`, `Divisors.jsx`, `Planks.jsx`, `Common.jsx`, `Lists.jsx`,
`Euclid.jsx`, `Duo.jsx`, `Strip.jsx`, `NumberCourt.jsx`, `FractionPlatform.jsx`, `PaperDivision.jsx`, `Rules.jsx`,
`Bracket.jsx`, `FactorLadder.jsx`. The labels are French and the numbers take the decimal comma (`logic.js`: « 29,9209 », « 5,47 »).
Whether the layout of `paper` (« La division posée », `gameworld/kit/longDivision.js`) is the French division posée
of the official texts: `[NOT CHECKED 2026-11-22]`.

**To add an instrument**: write `tools/<Name>.jsx`, add its `TOOLS` entry (lesson code), its maths in `logic.js` with
tests, its `QUESTS` and its `observe` branch, and a row in the table above. When a NEW lesson has a manipulation worth
keeping at hand, give it an instrument here — small, free numbers, one gesture.

## 4. Where it opens

| From | Door | How |
|---|---|---|
| a lesson's game world | the lab button on the title screen (`kit/Title.jsx`, `data-di-lab-open`) | overlay `{ type: 'lab' }`, the lab rendered `inline` inside the game's root (`kit/LessonWorld.jsx`); the 3D world behind it is neither simulated nor drawn while it is open |
| the kit of the launch (`LAUNCH_KIT.md`) | « try the tool in the lab » | `<LessonLab initialTool={family.labTool} earlierOnly />`; a family with `labTool: null` shows no lab button and its capsule has no lab step |

A teacher gets no button. Lessons and the lab stay behind `RequireLargeScreen`.

## 5. Screen

- **Nothing scrolls.** Two designs so the text never gets small: 1280 × 720 for a wide screen, 1000 × 740 for a 4:3 one
  (`ll-root--narrow`), each zoomed to the window. The one size a lesson is checked at is 1366×768.
- The cabinet never scrolls either: one grade per tab, four lessons a page — three when the grade needs the pager.

## 6. State

`scopedStorage` key `smarter_lesson_lab` (per student, browser only, not synced): the two numbers, the instruments
picked from the cabinet (the last five), the quests done, the sound switch. **The lab writes NO learning evidence** and
unlocks nothing.

## 7. Bundle

Everything is inside the lazy lesson boundary; `LessonLab.jsx` and each instrument are loaded when opened. Nothing enters
the entry bundle (`BUNDLE_BOUNDARIES.md`).

## 8. Check

- Unit: `npx vitest run src/lessons/common/lessonlab` in `apps/web` — `lab.test.js`, `order.test.js` and the render
  tests of `bracket`, `court`, `duo`, `factor`, `lists`, `piece`, `planks`, `strip` and `layout.render.test.jsx` (left to right): the order is the catalogue's, no future
  instrument for any lesson, every equality the instruments draw (each `logic.js` function checked on a grid against an
  independent computation), quests ticked only by what was made, the sounds. Which of their lesson-bound assertions still
  run on an empty catalogue: `[NOT CHECKED 2026-11-22]`.
- Walk: none (the Algerian `e2e/lesson-lab.mjs` was deleted with its lessons).

## 9. Known limits

- **`common` and `lists` are NOT safe before their lesson's first key**: they write « Diviseurs communs » and
  PGCD(a ; b), and the world's title-screen door mounts the lab without `earlierOnly` (§2, known debt) — until that door
  passes `earlierOnly` before the first seal, a student can read K1's name there.
- Three instruments are tagged (`factor`, `common`, `lists`); the thirteen others were made for Algerian lessons on division, divisors,
  fractions and square roots, were turned French on 2026-11-22, and wait for a French lesson to take them. `factor` has
  never been seen in a browser.
- Not validated by the owner; no real student has used it. The lab's state is not synced between devices.
- The sounds were checked by a walk that read what was played, not by a human ear.
- Phones are paused; the phone rules are in `GAME_WORLD.md` « On a phone ».
