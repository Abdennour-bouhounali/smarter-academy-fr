# « Vers le brevet » — the last lesson of every unit, in 2D

**Status (2026-11-26, evening): THE PURPOSE CHANGED. The owner refused the training path of §2 and redefined this lesson
as a RAPID REVISION of the whole unit. A prototype of that form exists on the first unit (§7bis) — dev builds only,
`/__qa/vers-le-brevet`. STOP: the owner plays it. §1, §2 and §4–§7 below describe the path he refused: they are kept as
history, not as a plan.**

> **The purpose, in his words (2026-11-26):** « the purpose of this final lesson of the unit is to enable the student to
> revise the entire unit rapidly, get the concepts, maybe make some quick manipulations, get the main laws, rules, key
> words, math voc… not to study them ». Then: « maybe you need to rethink again the form of the lesson », and, on the
> form proposed: « a rapid quiz at the end is good, with one or two solved exercises, no scroll will exist ». He removed
> the step where the student chose a tool card (« remove it »).

Who decided what, so that a later session does not take a default for a decision:

| Point | Source |
|---|---|
| No 3D world in this lesson; a 2D screen, « very attractive », and not only by colours, borders and key words | the owner, 2026-11-26 |
| The path of four steps (§2), one mission instead of three, no endless run, no island home | a council of five advisors and five reviewers, 2026-11-26 — a recommendation, **not accepted yet** |
| Everything else in this file (lengths, counts, the stamp, the names of the steps) | this plan's default, to be overruled |

The Algerian lesson of the same slot is the reference of what exists (`git show 049380e:docs/reports/INTEGRATION_LESSON_PLAN.md`).
It trains the one long 8-point situation that ends the Algerian paper. The French paper has none, so France does not port it.

## 1. What this lesson is for

The French maths paper (BO spécial n° 4 du 17-9-2026; `docs/curriculum/officiel/_txt/bo_special4_2026.txt`, lines 1262–1290) has
two parts: 20 minutes without calculator for 6 points (short answers, no justification), then 1 h 40 with calculator for 14
points (independent exercises of about 4 points, every answer justified, 2 points for the language, attempts counted).

After the four lessons of a unit a student still lacks three things, and each step of the path answers one:

- **choosing the tool** when nobody names it — a bank sorted by lesson gives the method away by its title;
- **answering fast without a calculator**;
- **writing the sentence that justifies** — with the collège calculator giving a decomposition or a greatest common
  divisor, the marks of part 2 sit on the sentence and the conclusion, not on the number (a brevet marker's remark, from
  memory, in the council).

## 2. The path — one line, four steps, about 40 minutes

One opening screen: « Le brevet a deux parties. Tu vas faire une petite version de chacune sur ce chapitre. » and one
button. No home with doors. The lesson is open to every student, whether or not the four lessons are finished.

| # | Step | What he does | The screen holds | Evidence |
|---|---|---|---|---|
| 1 | **Le tri** (8 min) | Reads 8 statements he has never seen and, for each, plays the card of the tool it needs, then picks the sentence that justifies it among three. He solves nothing. | one statement, the unit's tool cards, the picture that carries out the card he played | no |
| 2 | **Sans calculatrice** (13 min) | Answers 6 short questions on a clock. Plain exam: no decoration. | one question, one answer box, the clock, « Calculatrice interdite » | yes — first tries, re-judged by the server |
| 3 | **L'exercice guidé** (12 min) | Solves one brevet exercise of 3–4 questions, line by line; finds the faulty line in a classmate's copy. | the statement, his copy, the picture | no |
| 4 | **Sur papier** (10 min) | Solves one unseen exercise on a real sheet, types his answers, then compares his copy with a model copy and a marker's list. | the statement, the answer boxes, then the two copies side by side | yes — the typed answers only |

Details that the table does not hold:

- **Step 1.** Two of the eight statements carry a misleading story (a « lots » story that needs a common multiple). The
  statements are written for this lesson: taken from the banks, he would recognise the story, not the structure. A wrong card
  is carried out and looks wrong; the right one earns the sentence. It is not evidence: it is not in exam format
  (`CLAUDE.md`, « only exam-format first tries are evidence »).
- **Step 2.** The questions are drawn from the unit's four banks, `brevet: 1` and `calculator: false`. Thirteen minutes
  for six keeps the rhythm of the official reference paper, which asks 9 questions in 20 minutes
  (`dnb_sujet_ref_01.txt`; the second paper was not counted). The first time, the clock reaching zero is shown and stops
  nothing.
- **Step 3.** One sentence of the statement gives one line of his copy; whatever he types is carried out by the picture.
  Each wrong answer gets its guidance: the fact, why, where to look, never the answer.
- **Step 4.** A copy he marks himself is never evidence: the server cannot re-judge it and a weak student marks himself
  generously.
- **After a failed step 2**: the fact (« 4 justes sur 6, dans le temps. Tu perds : fraction irréductible. »), that
  lesson's revision page, three untimed questions on that rule, then the round again.
- **The end**: facts, no mark out of 20 and no prediction, and a stamp in his « carnet du brevet » — 13 stamps by June.
- **The return** (from the second unit on): step 1 holds 2 statements and step 2 holds 3 questions from units already
  closed. That is the only place where « je relie ce que j'ai appris » reaches beyond one unit.

## 3. What makes a flat screen attractive

A first page of three looks (a school sheet, tool cards, a blackboard) was refused by the owner on 2026-11-26: « i did not
like ». He asked for a search of what attracts teenagers of this generation, then for its results to be applied. The page now
holds three looks built on that search — **1 « Arcade »** (a night screen, loud colour, chunky keys), **2 « Affiche »**
(one flat colour that changes with his answer, giant type), **3 « Tactile »** (light raised tiles, key words as stickers) —
and the table of findings and sources they rest on. The look is his choice. This plan's default: Arcade for the student,
Affiche's full-screen colour change for the right answer, Tactile for the teacher's board.

What the search found, by strength of evidence (sources on the page):

- teenagers reject what is childish or glitzy, dislike small text and long reading, like things to do (Nielsen Norman
  Group, 100 users aged 13–17);
- pleasant colours and faces in the material improved learning in a meta-analysis of 33 samples; later work finds the
  effect depends on the task;
- decoration beside the content lowers learning a little (a meta-analysis of 58 studies): colour and motion go ON the
  maths, never around it;
- rankings lower motivation, progress and feedback help: no leaderboard;
- a brand that borrows young people's slang is liked less: plain French, « tu », no slang;
- loud colour, depth, oversized type and dark screens are what agencies and forecasters report — opinion, not studies.

Whatever the look, eight things carry the game feeling:

1. the picture obeys him — a misreading is carried out and seen, never only marked wrong;
2. one instruction, one place to touch, a flashing « Appuie ici » on the first;
3. his copy grows by one line at each right act and, at the end, is the copy he would hand in;
4. a wrong answer is answered by a guidance that grows at each failure;
5. a success is felt: a word, coins, a sound; stars at the end of the exercise;
6. a pen over the screen (`missions/Ink.jsx` exists);
7. no text under 18 px, a maths statement on one line, 1366×768, nothing scrolls;
8. a stamp per unit, not a mark.

On 2026-11-19 the owner refused a flat 2D version of the Algerian lesson: « there is no game feeling here ». This plan's
reading is that it lacked point 1, not the third dimension. Only he can say whether that reading is right, by playing step 2 of §7.

## 4. What is built once

| Piece | What | Size |
|---|---|---|
| The 2D stage | `MissionRunner.jsx` (837 lines, already French) reaches the world through five calls only — `run`, `stock`, `cheer`, `keep`, `done`. A 2D stage answers the same five, so the engine, its seven step kinds and its guidances stay. | medium |
| Two scenes for unit 1 | « lots » and « rendez-vous » as 2D components. Later units reuse the figure components that exist: `GeoFigure`, `CoordPlane`, `StatChart`, `NumberLine`, `SpaceFigure`. | medium |
| Le tri | a new screen: the statement, the cards, the three sentences | medium |
| Sans calculatrice | a loader that merges several lessons' banks and filters on `brevet` and `calculator` (`kit/bankSitting.js › createBankSittings` takes one lesson but its `load` is injectable); the fixed clock; the calculator badge | small |
| The server | see §5 | small to medium |
| The path | the opening screen, the strip of four steps, the end, the stamp | small |
| The sheet | one printable A4 in two columns, on the revision page's print rules | small |
| The checks | `apps/web/scripts/lesson-v2-status.mjs` today judges this kind of lesson on « two missions, an island, a bank, a recap »: it is rewritten for the path. `GAME_WORLD.md` and `LESSON_V2.md` are corrected in the same task. | small |

`gameworld/missionIsle/` (the 3D island and its endless run) is deleted once the path replaces it, with its tests.

## 5. Evidence and the server — to settle before step 2 is coded

`apps/api/app/Domain/Practice/PracticeSessionService.php` checks an answered exercise against the lesson of its session
(`ContentAccess::isExerciseAvailable($lessonCode, $exerciseId, $user)`, line 116). A sitting that holds exercises of four
other lessons is not accepted as it stands. The refusal itself was not traced.

This plan's default: **an answer of step 2 is evidence for the lesson its exercise comes from** (a question on an
irreducible fraction proves that lesson's point), and **step 4 is evidence for this lesson's own point**, from a small bank
of its own. Whether the bank contract accepts fewer than 10 exercises per level is not checked (`EXERCISE_CONTRACT.md`).

## 6. What the teacher gets

- **The class hour** (about 40 working minutes): the sorting on the board with slate votes, the no-calculator round on
  paper, one written exercise, the correction against the model copy. It must also run with no student device.
- **One printable A4**: six no-calculator questions, one exercise, the marker's list coded 0 / 1 / 2.
- **Tracking**: the evidence of steps 2 and 4 only. What a student does in steps 1 and 3 is private.
- The board script, the written memo and the class test, as for every lesson.

## 7. What is written per unit, and the order of work

Per unit, about eight files: 8 sorting statements with their card and sentences; one guided exercise as data, with its
test; 2 or 3 paper exercises with model copy and marker's list; the board script, the memo, the class test; the pack.
No new world, no bank of 50.

| Step | What | Then |
|---|---|---|
| 1 | The owner chooses a look on the mockup page | **STOP** |
| 2 | Real past brevet exercises on this unit are filed in `docs/curriculum/officiel/` (6 to 10). None is filed today, and eduscol refused automated reading on 2026-11-22: he may have to download them. | every statement is written after them |
| 3 | Prototype, unit 1 only, on a `/__qa/` address: step 1 and step 3 on the 2D stage | **STOP: the owner plays it** |
| 4 | The server decision of §5, then step 2 | |
| 5 | Step 4, the end, the stamp | |
| 6 | The board, the memo, the class test, the A4 | |
| 7 | The walks at 1366×768, the status script, the documents, the commit on `rebuild/dz-core` | |
| 8 | One guided exercise on Thalès with `GeoFigure`, before the pattern is frozen for 12 units | **STOP: the owner plays it** |

Each step records its cost in tokens and its defects, as `TWO_PLATFORMS_PLAN.md` §8 asks.

## 7bis. The prototype — a rapid revision of the unit (rebuilt 2026-11-26 on the owner's new purpose)

> **It is a real lesson now (owner, 2026-11-26, night).** « Vers le brevet — Multiples et diviseurs » is `available` in the
> net and has its folder (`lessons/college/3e/nombres_calculs/multiples-et-diviseurs/vers-le-brevet-multiples-et-diviseurs/`:
> config, routes, `brevet.js` = the content that was the prototype's). The dev address `/__qa/vers-le-brevet` is gone. The
> owner's word on the rule that blocked it — every open lesson must assess its savoir-faire —: « remove that rule for this
> lesson ». Encoded for the kind `synthesis` (LESSON_V2.md §2bis). Its top bar has a button back to the chapter. Still
> true: its rules and words are sentences written for it, not read from the lessons' knowledge sheets; its fonts come
> from Google Fonts by a CSS import, which must be replaced by files of our own before this reaches production.

> **Two presentations, one switch (owner, 2026-11-26, evening).** He asked for « the scroll mode but with the new fancy
> colored design and small manipu », then: « the user could easlly toggle between the 2 mode from the top toogle biutton ».
> The top bar now has « Par écrans / En une page ». « En une page » (`ScrollMode.jsx`) is the SAME content, the same lesson
> bodies, manipulations and pictures on one page that scrolls: four jump tiles, the four lessons, the two solved exercises
> (line by line), the six questions one under the other, then the stamp. The top bar stays in place. It has NO robot's bar
> (owner, the same evening: « remove this from the one page mode… if it has useful content put it directly on the page »):
> what the robot said is written under each manipulation and under each copy. The switch keeps the student's place. Measured at 1366×768: the page is about ten
> windows tall (5 700 px). The sound is now ON by default (he reported it silent: it was off, and gave no sign when
> turned on). The council's advice was ONE presentation, not two behind a switch: both exist so that he compares them;
> which one becomes the pattern — or both — is HIS decision, not taken. The platform's « nothing scrolls » rule is
> untouched: this is a prototype outside the lesson engine.

`apps/web/src/features/versLeBrevet/` — open `http://localhost:<port>/__qa/vers-le-brevet` on a running `vite` (the route
exists in dev builds only; `?etape=1…3` opens a part, `?lecon=dec|pgcd|ppcm|irr` a lesson). The look is « Arcade » with a
light twin; the switch « Sombre / Clair » is in the top bar and is remembered. ONE fixed screen at a time: nothing scrolls.

| Part | What is there |
|---|---|
| 1. La carte du chapitre | the whole unit on one screen: four tiles, one per lesson, each with its rule in one line and three key words, joined by what one lesson gives the next (« les facteurs communs », « tous les facteurs », « diviser par le PGCD »). Free order; a tile visited is ticked |
| a lesson, opened from its tile | ONE screen: « L'idée », « La règle » with its example, « Le piège », « Les mots » (a word touched shows its meaning), and « À toi, en vingt secondes » — a manipulation: break 60 into primes; share 24 roses and 36 tulips into a chosen number of bouquets; step two lighthouses to their first meeting; shrink 42/70 by common divisors |
| 2. Exercices résolus | two exercises (identical lots; two trains), the copy revealed line by line, each line tagged with the lesson it uses, the picture carrying out the result |
| 3. Quiz rapide | six one-tap questions, the reason right after each; then the count, the lessons to look at again, and the stamp |

Checked: its 7 unit tests, ESLint, Prettier, `check:unreached`, `check:unused`; played end to end by a scripted browser at
1366×768 with wrong answers on the way; every lesson screen, with every word opened, measured for cut content in both
looks (none); no page error. About twenty-five screens looked at.

What it is NOT: it saves and sends nothing; its rules and words were written for it in one sentence each, from the four
lessons' knowledge sheets, NOT read from them — a real version should read them, as the unit summary does; no real brevet
paper was filed before the solved exercises were written; no teacher's board or printed sheet; its two fonts come from
Google Fonts by a CSS import. What was removed with the first prototype: the tool cards, the timed round drawn from the
banks, the guided exercise, the paper exercise.

Not decided by him: the map as the form (he answered the quiz and the solved exercises, not the map itself), the four
manipulations, the points, the stamp, the wording of every rule.

## 8. What waits for the owner

1. The look: Arcade, Affiche or Tactile — or a mix.
2. One path instead of the island's home; one guided exercise instead of three missions; no endless run. All three
   reverse what he accepted for Algeria.
3. No mark, facts and a stamp — or a mark.
4. Open to every student, or only after the four lessons.
5. Where the evidence of step 2 lands (§5).
6. The colour codes of the mockup against the rule « shapes are the brand blue, never black » (`CLAUDE.md`).
7. Whether Algeria takes the 2D path too. Not proposed here.

## 9. Not verified

- That past brevet papers asked this unit as a full justified exercise: two council members said so from memory; the two
  official reference papers hold one short question on it (`dnb_sujet_ref_01.txt`, line 43).
- That the five calls are the whole of the engine's tie to the 3D world: counted by a search of `missions/*.jsx`, not by
  running it on a 2D stage.
- That the existing figure components are enough for the other 12 units' scenes: listed, not tried.
- That choosing the tool without solving teaches as well as solving mixed exercises: the research the council cited
  had students solve.
