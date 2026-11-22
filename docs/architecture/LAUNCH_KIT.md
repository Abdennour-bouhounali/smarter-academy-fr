# The launch kit — the launch of a lesson

> **Status (2026-11-22).** Covers the launch game played before a v2 lesson (`apps/web/src/lessons/common/launchkit/`).
> Imported from the Algerian platform (DZ dev `7f4cef1c`) on 2026-11-22. True here: the engine, the gestures, the
> bands, the gate and the capsule, the store, the walk library `e2e/lib/launchKitTwoTools.mjs`. Since 2026-11-22 the
> launch is French and left to right: its screen sentences (`LaunchKit.jsx`, the table at the top — the title
> « L’échauffement », the bag « Ma trousse »), the gestures and the named mistakes (`families.js › MISTAKES`, each
> « Attention : … ») are French, guarded by `ltr.render.test.jsx`. Not true here: `families.js › FAMILIES` is EMPTY
> (the nine Algerian families are in `git show 049380e:apps/web/src/lessons/common/launchkit/families.js`), so every
> launch is empty; no lesson exists, so no launch walk has been run. It was never played by a real student. Its
> phases 2–4: `docs/reports/LAUNCH_KIT_PLAN_2026-11-17.md`.

## 1. What it is

Before a lesson, the robot **charges the tools it needs**, then takes off into the lesson. A tool is ONE earlier learning
point the lesson stands on — a programme item of the learning net, of the same grade or of an earlier one.

| Moment | What happens |
|---|---|
| The bag (10 s) | 2–4 empty slots, each named in the student's words with the year it comes from. A tool measured `solid` in the last 21 days arrives charged and is not asked again |
| A station per tool | 2 or 3 questions; each right answer lights a segment; a miss says « On y reviendra » |
| The quick workshop (≈ 1 min, only if needed) | the weakest tool is repaired on the spot: a worked example revealed step by step, opened on the mistake the answers showed, then two similar questions |
| The kit | each tool in one of four states, the score, the honesty star, ONE lesson to revise first with four actions |
| The capsule (≈ 3 min, only when the gate asks) | a CORE tool left at `start`: its card, a worked example, its instrument in the lab (when its family has one), two easy questions — then the door is open (§3bis) |
| The take-off | countdown, then the lesson starts |

It is **one component for every lesson**: `<LaunchKit lessonCode lessonTitle onDone onClose inline />` needs only the
lesson's code. Nothing scrolls (zoomed to the window, like the lesson lab).

## 2. Rules (binding for the launch)

1. **Tools come from the net, never from a list typed in the lesson**: `planTools(toolsForLesson(code), …)` — the direct
   prerequisites, the CORE ones first (`LEARNING_NET.md` §2.2bis), then the supports, the nearest year first, at most
   four, only those that have a question family. **A tool is an EARLIER learning point**: `toolsForLesson` drops an item
   whose home lesson comes after the lesson.
2. **A tool is never judged on one answer, and the game stops as soon as it knows.** The band machine is the one of the
   year compass (`packages/core/compass/engine.js › itemProgress`, also held by the server in PHP): easy → harder; a
   miss gets a second easy one. Two or three answers per tool.
3. **Never the right answer during a station** — ✓ or « On y reviendra », never « faux »: showing it would
   spoil the next question of the same tool. The workshop is where the launch teaches.
4. **The answer is a gesture** (`gestures.jsx`): *write* the value in its own shape on the game's keypad, *sort* cards by
   DRAGGING each into one of two boxes (a tap on a box does the same), *place* a flag on a number line. Nothing moves by
   itself and nothing is timed per question. The answer is handed in with « Valider »: until then everything can be changed.
5. **No life, no losing, no speed score, no ranking, no luck.** The time of an answer is recorded (`ms`), never scored.
6. **« Pas sûr »** can be said before handing in. It counts as not succeeded for the band — never as a fault — and the
   **honesty star** rewards a student who knew what he knew: sure and right, or unsure and wrong, on 4 answers out of 5.
7. **A repaired tool is not `solid`**: from `start` it rises to `consolidate`, and the next launch asks it again.
8. **Five minutes and twelve questions at most**; what was not asked stays `unseen` and costs no point.
9. **The game is felt between the questions**: the segment that lights, the bed of music that gains a layer with each
   right answer in a row (`LaunchSound.layers`, show only), the countdown. A sound never tells right from wrong before
   « Valider » (each box of a sort has its own note, whatever the card).
10. No person is drawn (a robot, drawn in code). Content rules: `FRENCH_LANGUAGE_CONTRACT.md` §9.

## 3. The bands, the score, the kit

| Band | Segments | How |
|---|---|---|
| `solid` | 2 | easy ✓ then harder ✓ |
| `consolidate` | 1 | one of the two missed — or `start` repaired in the workshop |
| `start` | 0 | two easy questions missed |
| `unseen` | — | the clock ended first; not counted in the score |

Score = lit segments / (2 × tools measured). The kit screen names ONE lesson to revise first (`priorities`: `start`,
then `consolidate` not repaired, then repaired) and offers, for the tool shown:

- **the revision card** — the family's `memo` (three or four lines), on a veil over the launch; the launch's ✕ and sound
  button stay ABOVE that veil (`launchKit.css › .lk-head__end`);
- **try the tool in the lab** — the lab opened ON the family's instrument (`LessonLab initialTool`), `earlierOnly`: the
  kit is played BEFORE the lesson, so the lab lists only the cabinet of the earlier lessons (`LESSON_LAB.md` §2);
- **check the tool again** — that tool alone is asked again (no workshop; the try is not counted twice);
- **the whole lesson** — the earlier lesson, with the one-click return (`lessons/common/components/returnToLesson.js`);
  « coming soon » when the lesson is not published.

## 3bis. The gate — the door opens by doing, not by scoring

`engine.js › gateOf(kit)`.

- **When:** a **core** tool (the weight of the learning net; a tool not classified yet counts as core) is left at
  `start` — two easy questions missed and the workshop did not repair it. A **support** tool never closes the door;
  `consolidate` is enough to go.
- **What:** the take-off button is replaced by the capsule (3 minutes). Four steps, always shown: ① the card (the
  family's `memo`) → ② the worked example, revealed step by step, opened on the named mistake → ③ the family's
  instrument, in the lesson lab → ④ two easy questions (phase `capsule`).
- **Then the door is open, whatever the two answers say.** Both right: the tool rises to `consolidate`. Otherwise it
  stays `start`, flagged `items[<item>].capsule` in the toolbox: nothing is pretended.
- **Never a second capsule in the same launch, never a dead end.** Re-checking the tool with success also opens the door.
- **For every student** — the one of a class and the independent one.

## 4. A question family (`families.js`) — how to add one

One entry in `FAMILIES`, keyed by the item id of the net:

```js
'<item id>': { item, name, icon, labTool, forms: { 1: [...], 2: [...] }, make(rand, level, form, { first }), example(rand, level, { k, mistake }), rules: [...], memo: [...] }
```

- **It generates** its questions on two levels (1 very easy, 2 harder), in several forms; a retake never shows the same
  numbers. The very first question of a launch is a near-certain win (`first`).
- **Which form is asked** (`pickForm`, `nextForm`): a form not used yet in this launch, in the order of `forms[level]` —
  except that **at level 2 a form named `sort` comes FIRST**. A station asks level 2 only ONCE per tool, the workshop
  repeats the form of the last station miss (two questions LIKE the one missed), a re-check starts the tool afresh and
  the capsule asks level 1 only: a level-2 form listed second would otherwise never be asked. The sort is where a family
  keeps its traps and the cards to ACCEPT.
- **A question is plain data**; `grade(q, answer)` says right or not and NAMES the mistake when the answer shows one
  (`MISTAKES`). A question that carries its operation (`calc: { op, … }`) is graded by re-computing its value — never a
  stored answer. A sort card that is a trap carries the mistake it catches (`trap`); a card the student must ACCEPT may
  name the mistake of refusing it (`miss`). The workshop opens on that sentence.
- **The worked example answers the mistake shown** when the family can (the kit passes `mistake` to `example`). An
  example that talks about something else than the sentence above it teaches nothing.
- **The shapes a family may use, without touching the gestures**: *write* with boxes inside an equality; a fraction token
  `{ frac: [top, bottom] }` drawn with a real bar (`.lk-frac`), its terms strings or ONE box; a power token
  `{ pow: [base, exponent] }` drawn with a real superscript (`.lk-pow`, `data-lk-pow`), graded by `calc: { op: 'pow' }` or
  `gradePower`. **The keypad has no minus sign and three characters a box: a typed value is never negative** — a negative
  result is only ever a *sort* card. A *sort* card is a number, a LaTeX equality (`text` starting with `$`), or a
  sentence (`say: true`, two lines at most); a sentence that carries a LIST (`card.list`, « Diviseurs de 54 : 1, 2, 3,
  6, 9, 18, 27 et 54 ») is written by `listFr` of the kit's `gameworld/kit/authoring/numbers.js` and drawn smaller
  (`data-lk-list`, `gestures.jsx`) so the longest list of a family stays on two lines.
- **An instrument** (`labTool`) must belong to the item's home lesson or one before it, and never to a lesson whose kit
  shows the family (`launchkit.test.js`); with `labTool: null` the capsule skips its lab step.
- **A family never writes a number or a word the lesson it opens is about to make the student discover** (the Algerian
  families kept « avoid » lists read from the lesson's bank and world for that).
- **Tests are part of the family** (`launchkit.test.js`): every generated question is re-computed apart and graded right,
  the numbers of each level stay in their range, every trap names a known mistake, the worked example is true.

**A lesson with no family for its tools opens an EMPTY kit** (0 / 0): a family per core tool is part of a lesson's
definition of done (`status:lesson-v2`, part S1). Today every lesson would — `FAMILIES` is `{}`.

## 5. Where it opens

In a lesson's world, the FIRST « start the adventure » plays the launch, then the world starts
(`kit/LessonWorld.jsx › onBegin`: `launchDone(config.id) ? game.start() : game.openLaunch(true)`; overlay
`{ type: 'launch', then: … }`, `kit/WorldRuntime.js`); afterwards « continue » goes straight in, and the kit button on the
title screen (`kit/Title.jsx`) opens it again. The 3D world is not drawn behind it.

## 6. State and what it is NOT yet

`scopedStorage` key `smarter_launch_kit` (`store.js`; per student, **browser only**): `items[<item>] = { band, repaired,
at }`, `lessons[<code>] = { first, last, tries }`, the sound switch.

**Not built** (plan, phases 2–4):

- the server does not ask or grade: the result is **not learning evidence**, is **not seen by a teacher**, is not synced;
- the gate (§3bis) lives in the browser like the rest: a teacher does not see who needed a capsule;
- no picture of a learning point with its sources (measured / deduced), no automatic update from a later success, no
  « prerequisite or new idea? » diagnosis, no class grid;
- no family.

## 7. Check

- Unit: `npx vitest run src/lessons/common/launchkit` in `apps/web` (`launchkit.test.js`, `fraction.render.test.jsx`):
  the engine — never one answer, the workshop, the caps, the gate and its capsule, the honesty star —, the order of the
  level-2 forms, whole launches played by the pure pieces (`nextStep` → `nextForm` → `makeQuestion` → `grade`, seeded) on
  test families, the fraction and power tokens, the sounds; `ltr.render.test.jsx`: the sort laid out from the left, no
  Arabic character, no right-to-left switch and no Arabic font in the kit's sources, every named mistake French
  (« Attention : … », no-break spaces, the typographic apostrophe, never « faux »).
- Walk: none has been run (no lesson). The library `e2e/lib/launchKitTwoTools.mjs` keeps two scenarios, `walkLaunchOne`
  (one tool) and `walkLaunchPair` (two tools chosen by the descriptor), and `LONGEST_LIST`; the Algerian scenarios
  `walkLaunch` (« two ») and `walkLaunchLists` (« lists ») left with their lessons. A lesson's walk reaches them through
  `e2e/lib/lessonWalk/launch.mjs › launchWalk`, and the lesson's descriptor MUST name its launch —
  `launch: { scenario: 'one', tool }` or `launch: { scenario: 'pair', tools }` (no default: the walk throws without it;
  `e2e/lib/lessonWalk/README.md`). Its checks: nothing scrolls, a sentence stays in its card on two lines at most, a placed
  card stays in its box, every answer is computed from the numbers on screen. The Algerian per-lesson walks were deleted.
- The game-world walks seed the launch as already played (`u_<id>_smarter_launch_kit`).
- Phones are paused; the phone rules of the launch are in `GAME_WORLD.md` « On a phone ».
