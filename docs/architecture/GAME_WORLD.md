# GAME_WORLD — the lesson played as a 3D game world (first built 2026-11-15)

**BINDING for the lesson v2 rollout (owner decision D6, 2026-11-17): every v2 lesson follows this contract — `LESSON_V2.md` says how a lesson plugs into it.** What has not changed: it was built on the pilot lesson and no real student has used it yet.

**Where it started:** a TRIAL on ONE lesson (`qasim-adad-tabii`), student view only — a free experiment the owner asked
for « without limiting it with the docs or what is already built ». Sections still marked « NOT validated » describe parts
he has not judged one by one; they are binding all the same, as built.

> **ONE SCREEN SIZE since 2026-11-19 (owner): 1366×768, alone.** A world, a forge, an experiment, a sitting are built,
> walked and reviewed at 1366×768 only. Measures and rules below that name 1024×768 or 1840×900 are the record of what
> was verified before that date; nothing new is checked at those sizes.

## 1. What it is

A student who opens the lesson enters **« أرخبيل القواسم »**: a chain of nine floating islands in a three.js scene, played in a
full window with a small hovering robot, « زيرو ». The teacher and Classroom Mode see no change.

- Switch: `world: { id: 'divisor-isles', content }` in the lesson's PACK (`lesson.pack.js`, `LESSON_V2.md` §1). The config
  has no `studentView` / `mission` any more (deleted with the old version, 2026-11-18).
- Mount: `LessonIndex.jsx` renders the world for a STUDENT (not a teacher, not Classroom Mode) of any lesson whose pack
  names a world, and for the teacher's preview (`?apercu=eleve`).
  `gameworld/LessonGameWorld.jsx` loads the WORLD (`gameworld/worlds.js › WORLDS`: one entry per world, never per
  lesson) and the lesson's content (its pack) together, lazily — three.js never enters the entry bundle. A world names
  no lesson. Both are usually on their way before it mounts (`lessons/worldPreload.js`, §1bis).
- **The old version is deleted (owner, 2026-11-18).** A v2 lesson has no mission player, no module page and no
  `?view=classic`: its module addresses (`/astaidd`, `/itqan`, …) redirect to the home, which is the world
  (`buildLessonRoutes › retiredModules`, `LESSON_V2.md` §2). A device without WebGL gets a message and the way out
  (`exitTo`). Trace: `docs/reports/OLD_VERSION_TRACE_2026-11-18.md`.

## 1bis. From the click to the title: ONE loading screen (2026-11-21)

Owner, 2026-11-21: « the user never feels: is there a problem with my laptop or my internet — always display the best
animation that gives peace ». Before: a light spinner, two or three blank light pages, nothing, then a dark screen whose
bar jumped to 70 % and stood still, then a plain line of text. Now `gameworld/WorldLoading.jsx` is the ONLY thing a
student sees between his click and the world's title, whatever is loading behind it:

| Who mounts it | While |
|---|---|
| `lessons/LessonWaiting.jsx` (the route boundary, the classroom shell, the page frame) — only when `useOpensWorld(lessonId)`: the pack names a world AND the viewer is a student, or a teacher's `?apercu=eleve` | the lesson's routes, runtime and home arrive |
| `LessonIndex.jsx`, `classSession/LessonBoard.jsx` | the world's loader arrives |
| `LessonGameWorld.jsx` | the world's code, the lesson's content and the server's save arrive |
| `kit/LessonWorld.jsx` (`over`, then `leaving`: it fades over the title in 0.45 s and lets clicks through) | the 3D scene is built |

What makes five mounts ONE screen, and what a change to it must keep:

- **One clock per lesson, outside React** (`readWorldClock`): a new instance goes on where the last one was. The bar
  never goes back; the drawing's animations start at the phase they had (`--gw-t`, a negative `animation-delay`).
- **It covers the whole window** (a portal on the body, `z-index` of the world's root): the side bar never shows.
- **The bar never stands still and never lies.** `stage` = what really landed, weighted by its size (0 the lesson
  opens · 1 the world is asked for · 2 its light parts are here · 3 its code is here · 4 the scene is built); between
  two stages it creeps toward the next one, slower and slower, and never reaches it by itself.
- **Everything that moves is `transform` / `opacity`**, so it keeps moving while the page is busy building the scene.
- **A wait that lasts is named, calmly**: after 8 s « الاتصال بطيء قليلًا. كلّ شيء يسير جيّدًا، لا تغلق الصفحة. »; offline, at
  once, « انقطع الاتصال بالأنترنت. سنواصل وحدنا حالما يعود. »; after 30 s, or when the load has failed, « حاول من جديد ».
- **A failed load is tried again by itself, once**: the page is reloaded (at once, or when the connection is back) —
  a second `import()` of a chunk that failed is NOT fetched again by the browser (measured). One reload per lesson per
  two minutes (`sessionStorage`), then the sentence and the button: never a loop.
- The lesson's name is shown without raw LaTeX (`mathToPlain`); its line and the note's line keep their height.
- World-neutral: a gem, three lights turning, a few stars — it names no world and no lesson. Reading sizes ≥ 18 px.

Checks: `gameworld/worldLoading.test.jsx` (the clock, the three states), `e2e/gameworld-sync.mjs` (the screen on a
slow server). NOT measured: how long the scene's build blocks a weak school laptop, and real timings on a school
network.

## 2. The mathematical idea of the world

Between two islands there is a gap of `a` cells. The student carries a mould of length `b` and fires planks of that length:
the scene lays `q` planks one by one and shows the `r` cells left — `a = b × q + r`, written live at the top of the screen.
**The bridge holds only when `r = 0`; otherwise it crumbles.** « b is a divisor of a » is seen before it is named.
The robot's chest screen shows the last remainder.

| Stage | What the student does | الكفاءة |
|---|---|---|
| 15, then 16 | mould 3 fills 15; the same mould leaves 1 cell on 16; moulds 2, 4, 5 to try | P1 |
| 42 | moulds 4, 5, 6, 7 — 4 is even and fails, 7 is odd and holds | P1 |
| island D | **« مصهر القاعدة »** (since 2026-11-18, §2sexies): the student forges the rule himself in the mirror of the island — only then tablet 🔑 « القاسم بالباقي » gives it its name | P1 |
| 48 | mould 6 lays 8 planks; a storm takes the bridge; among 5, 7, 8, 9 one fills 48 « without any division »; on the next island the SECOND forge (the plank's table) → tablet 🗝️ « القاسم بالجداء » | P2 |
| 120 | moulds 6, 9, 20 | P1, P2 |
| the four guardians | one fact (120 = 6 × 20), four sentences to put the right way round; then the guardians' mirror, the THIRD forge (which number is written first) → tablet 🗣️ | P3 |
| gate dash | eight sentences in the four phrasings, three gates, one right | P3 |
| 7 | nothing on the pedestals fills it; the workshop makes any length 1–9; then the stone's mirror, the FOURTH forge (two planks that hold over every gap) → tablet ⭐ | P4 |
| 756 | the lesson's problem: the student CHOOSES between moulds 32 and 36, types the Euclidean division of the one chosen, sees it built (32 leaves 20 cells; 36 holds with 21 planks), then pays 21 × 1850 | P1, P2 |

**Two results, never mixed** (owner's report, 2026-11-15): after a forge the screen gives the student's PREDICTION its own verdict
first — « ✓ توقّعك صحيح: بقيت خانتان فارغتان » in green, with the robot cheering — and only then, in a neutral tone, what the mould does
to the gap (« القالب 5 لا يملأ 42: الجسر لا يثبت »). A remainder that is not 0 is a fact about the mould, not a mistake: it is amber,
never the red of an error, and there is no buzzer nor shake when the prediction was right (`state.verdict`, `Verdict` in the HUD).

**What to do next is shown IN the world** (owner's report, 2026-11-15): the prompt of the thing the robot can use floats above it
as a big bouncing bubble — « اضغط E — ابنِ الجسر بألواح طولها 3 » (« اضغط هنا » on touch), anchored by `Game.placePrompt` — and the forge
platform of the current bridge carries a beacon (light beam, halo, bouncing arrow) as soon as a mould is in hand. The bottom
button stays for thumbs; it is never the only signal.

**Never a prompt that does nothing, never a wrong answer without a next step** (owner's report, 2026-11-15, island « المرفأ الأخير »):

- a thing the student cannot use yet shows NO prompt (the store of the last bridge stays silent until the island's stone is answered),
  and the beacon stands on the one thing to do now — the question stone first, the platform after;
- the objective at the top names the place and the action (« اذهب إلى لوح الجزيرة (السهم الأصفر) وأجب عن سؤاله »);
- a wrong answer on a multi-choice stone is judged choice by choice with the division that proves it (« ✗ 7 = 3 × 2 + 1 — تبقى خانة
  واحدة فارغة », « ✓ 7 يملأ 7 تمامًا »), and the missing moulds are COUNTED, never named (`answerQuiz` → `marks`, `missing`);
- the store states its mission and its three steps on every screen, a mould already tried keeps what it left (« جُرِّب: تبقى 20 خانة »),
  and each refused division says why in the world's words (`checkDivision`: `long` — the planks overshoot the gap, `sum`, `big`).

Rules kept from the platform's method: the student acts first and a rule is named only on a tablet that opens afterwards (and,
on island D, only after he has forged it himself — §2sexies); the
student announces the remainder before each forge (a right first prediction is a star); all wording is the platform's own.

## 2bis. After the story: « خريطة المعارف », « فضاء التدريب » and « تعاونية الواحة » (2026-11-15)

The story is played once to UNDERSTAND. Three things let the student come back — before an exam, without replaying it. All three
open from the title screen, so no walk in the world is needed.

### « خريطة المعارف » — the full page of what the lesson teaches (`KnowledgePage.jsx`)

A FULL page (not a card, no scrolling): the lesson's own mind map — the 13 nodes of `knowledgeGraph.js` (the idea, the two
definitions, the reminder on Euclidean division, the two examples, the check, the four sentences, 1 and the number itself, the two
common mistakes, the warning « القاسم ليس 0 », the summary) with their labelled links — and, for the four rules, the memo sheet of
`knowledge.jsx` (rule, hook, example, trap, exam tip, memory test). **Nothing is retyped: the page imports the lesson's data**, so a
change in the lesson changes the page. Three families of cards, three colours: what to know, what helps, what to beware of.

Gamified, and saved (`know: { read, sealed }`): a card is locked until its key is owned (a rule is named only after it is
discovered), is ticked once read — a common mistake only once the student has uncovered why it is wrong — and a rule is sealed in
gold by its memory test.

**Every kind of card has its icon and its word** (`kit/text.js › TX.know.kinds`: `[icon, word, family]`; the family is one of
the legend's three). A kind with no entry was drawn « • » with no word — 39 cards of the v2 lessons (`relationship`, `method`,
`tip`) until 2026-11-19, when they got `🔑 قاعدة`, `🧭 طريقة` (core) and `✨ حيلة` (guide). `kit/knowledgeKinds.test.js` reads
every `world/knowledge.js` under `lessons/moyen` and fails on a `kind` the table does not name: a new kind is added to the
table in the same change. **The map's positions** (`world/knowledge.js › POSITIONS`, percent of the map box) keep every card
inside the box and every link's label between two cards, never under one, at 1366 × 768, 1024 × 768 and 1840 × 900, the
card panel open: a card is at most 15rem wide (8.6rem below 1101 px), so three columns at 17 %, 50 %, 83 % never touch, and a
link joins two rows about 18 % apart (lesson 4's layout, 2026-11-19; its trainer walk checks it — `mapLaidOut`). **The page's
subtitle wraps, it is never cut** (`knowledgeJourney.css`: an ellipsis had eaten its end at 1840 × 900, where the counters show
their words; below 1101 px the page hides it on purpose).

**The discovery JOURNEY « رحلة الاكتشاف »** (owner, 2026-11-15; rebuilt the same day after « the text is very small ») — the way the
page OPENS until everything is found. It is not a small graph: it is ONE card at a time, large and comfortable to read, in the
middle of the screen (`Journey` in `KnowledgePage.jsx`):

- the card being read takes more than half of the screen, with its explanation, memo sheet, memory test and training on it;
- beside it, the MYSTERY cards of what follows (the lesson's own `reveals`, so the order of discovery is the lesson's order): a tap
  turns one over — it is found (`game.discover`, saved in `know.found`) and becomes the card being read;
- above, the trail of what was found: any card of it can be read again; when a branch ends, the cards that still hide something
  are offered; a locked card (key not owned) cannot turn anything over;
- « الخريطة كاملة » shows the thirteen cards and their links at once, and « رحلة الاكتشاف » comes back: nothing is out of reach.

**The page is scaled to the screen** (`useFit`: designed for 1280 × 720, zoomed up to ×1.8): a big screen gets big text. Measured by
the walk at 1366 × 768 — card title ≥ 34 px, explanation ≥ 22 px, next card ≥ 20 px; at 1840 × 900: 44, 28 and 26 px.

**« تدرّب » opens ON the card, inside the page** (owner, 2026-11-15; `Trainer.jsx`, logic `trainer.js`): a tab of every card, six
questions on the point of that card, in TWO FORMATS that alternate and drift toward the exam so the student adapts to it —
`SESSION = game, game, exam, game, exam, exam`:

- **game format** (dark, the looks of the games): tap the right gate, true / false in one tap — small numbers, mental arithmetic;
- **exam format** (a white ruled sheet, « السؤال 3 », the exam's verbs): « أجرِ القسمة الإقليدية للعدد a على b، ثمّ استنتج »,
  « بيّن أنّ b قاسم للعدد a، ثمّ استنتج قاسمًا آخر », « أكمل بالعبارة المناسبة », « صحيح أم خطأ؟ علّل », « دون أيّ حساب، اذكر قاسمين » —
  paper numbers, the answer typed in its own shape (`a = b × [ ] + [ ]`, then « إذن b [قاسم / ليس قاسمًا] للعدد a »).

A wrong answer gets a HINT first — what the answer gives, never the answer — then, after a second one, the written correction
« التصحيح » (`check` → `hint`, `fix`). Stars = questions right at the first try, kept per card (`know.trained`). The 13 cards map
to five plans (`PLAN_OF`): by remainder, by product, the four sentences, 1 and the number itself, and a mix for the idea and the summary.

### « وضع الورقة » — the paper mode (`Paper.jsx`, logic `kit/longDivision.js`; owner, 2026-11-15)

An exam has no music and no gates: it has a sheet, a pen and a method. **Every screen that asks for written work is in paper
mode**: the exam-format questions of the trainer, the calculation steps of the depot, and — in the story — the store of the last
bridge (the only place of the story that needs paper). The game formats stay playful: the contrast is the lesson.

- **Silence**: `game.paperMode(source, on)` stops the music (`audio.setMusic`) while a paper screen is open and brings it back when
  the last one closes; the effects stay. A sign says so — « وضع الورقة · بلا موسيقى » with a clock that counts UP (`PaperChip`).
- **The pen first** (`PaperGate`): the answer boxes stay closed behind « خذ قلمك وورقتك »; the button « كتبتُ على ورقتي — أنقل جوابي »
  wakes after a few seconds, so a reflex tap is not possible. The data of an exam statement are underlined for the student
  (« أقرأ وأسطّر المعطيات »).
- **How to think, how to write** (`PaperModel`): « كيف أكتبها على الورقة؟ » opens a model sheet — the Euclidean division POSED as
  on paper, one step per tap, each step said aloud (« في 59، كم مرّة 17؟ … أطرح … أُنزل الرقم … »), then the check and the sentence
  to write. Above it, the six gestures of an exam answer (`METHOD`): read and underline, find what is asked, choose the rule,
  compute on paper, check, write the sentence.
- **It never gives the answer**: before answering, the model shows a TWIN division (`twin`: same nature, other numbers); only
  after the written correction may the student read « التحرير النموذجي » of his OWN question.

### « فضاء التدريب » — the practice space (`KnowledgeMap` in `DivisorIsles.jsx`, logic `kit/ladder.js` + the lesson's `world/practice.js`)

Five nodes in the order of the mind map; 16 levels, 48 ★, easiest first. Each key: two runs of the gate dash, then a field mission
at the depot. The summary node « 🏆 تحدّي الامتحان »: one mixed run, then three full cases. « واصل التدريب » always proposes the next level.

- **What opens what** (`nodeOpen / levelOpen / nextLevel`): a node opens with its key — earned in the story on this device, or proven
  by the lesson's synced progress (`keysFromModules`), so a new device can revise; a level opens after the one before; the exam node
  opens once level 1 of the four keys is passed. « من البداية » restarts the STORY only (`keysEver`, `practice`, `know` stay).
- **A key's name comes after him** (2026-11-19, « no rule is told … only then its name »): a node whose key he does not hold
  shows the lock and `KT.hidden` (« ؟ ؟ ؟ ») — never the tablet's title (`rules[key].title`), in the node or in its side panel,
  and its levels are listed by number only, without the lesson's level names (`text.levels`). Once the key is held, the name
  appears. The summary node « تحدّي الامتحان » is not a rule and keeps its name. The same guard holds on « تقدّمي » (a row not
  earned), on the end card's key tooltips and in the knowledge journey's trail (a card turned over whose key is not held).
  Enforced in `kit/PracticeHub.jsx`, `kit/Spaces.jsx › ProgressPage`, `kit/End.jsx`, `kit/KnowledgePage.jsx`; tested by
  `kit/lockedNames.render.test.jsx` and asserted on a new student by each `e2e/gameworld-*-hub.mjs`. Not covered: the map's
  ROOT (`practiceMap.root`, the lesson's title) and its edge labels are lesson data shown from the first screen — they must
  name places of the story, never a rule.
- **The gate dash is MENTAL ARITHMETIC** (owner, 2026-11-15, after questions no teacher could answer in the time of a gate): every
  number to work with stays inside the multiplication tables — `MENTAL`: a ≤ 100, a divisor or a factor ≤ 10 — and the slowest
  gate leaves 5 seconds. A test enforces it on every generated wave. Bigger numbers belong to the cases of the depot and to the
  exam format of the trainer, where the student has paper.
- **A run**: 6 gates, 3 shields, stars = shields left, points with a streak bonus. Questions are GENERATED (`makeRun`, nine
  kinds; `isRight` is the one definition used to build, judge and test). A wrong gate STOPS the run on a card — the chosen number
  with the division that proves it, the right one with its own — and a question of the same kind is added.
- **A wave the lesson writes itself** (2026-11-18): the world's `strings.js` writes the sentence and the guidance of the types it
  knows (`missing`, `divides`, `multipleOf`, `remainder`…). A lesson whose rule needs another sentence gives the wave a type of
  ITS OWN (judged by its own `isRight`) and carries the words as data: `say` (the sentence, `$…$` for maths, LaTeX with two
  backslashes) and `why: { right, wrong: { [gate]: line } }` (one line per wrong gate). `waveSay` and `explain` fall back to
  them for any type they do not know. Reference: `khawass-qawasim/world/practice.js` (« عدد يقسم $21 + 35$ », « قاسم مشترك
  للعددين 21 و 35 », « عدد يقسم باقي قسمة 42 على 12 »: the right gate is the common divisor, the wrong ones divide only one
  of the numbers).
- **The rule is never far**: « القاعدة » during any run or case (it pauses), « ذكّرني بالقاعدة » on every guidance card, and the rule
  shown by itself after two mistakes. It is always the rule the CURRENT question uses.
- **الكفاءات**: a run of the gate dash writes no evidence; see §4 for what does.

### « تعاونية الواحة » — the real-world game (`cases.js`, `Depot.js`)

The student runs the packing depot of a cooperative (dates, olive oil, eggs — a 3D oasis island far from the archipelago). A level is
a short day of ORDERS; an order is a real case solved in one to four STEPS. After a step **the depot packs for real what the student
decided**: crates appear one by one, the equality `n = b × q + r` follows, and what does not fit stays on a red mat — or the last
truck stays half empty. Seven kinds of order, one per idea:

| Mission | The case | Idea |
|---|---|---|
| `fit` | which crate leaves nothing on the floor? | divisor by the remainder |
| `count` | the client wants q equal full crates: what capacity? | divisor by the product |
| `orders` | one crate size in stock, three orders: which one can go? (worded in the four phrasings) | the four sentences |
| `special` | an order no usual crate fits: the two packings that always work | 1 and the number itself |
| `day` | one day, three orders: `cost` (two crate sizes, the invoice), `profit` (which tray earns more), `trip` (the remainder MEANS one more truck) | exam case |
| `share` | another world — see below | exam case |
| `tiling` | another world — see below | exam case |

**Three worlds, three real stories, each carrying a value** (owner, 2026-11-15) — the cases of the summary node are not all at
the depot (`WORLD_OF` in `cases.js`, scenes in `Depot.js` and `Worlds.js`, one contract: `setOrder / runSim / clearSim / ship`):

| Level | World | The story | The value |
|---|---|---|---|
| exam 2 | « تعاونية الواحة » (`day`) | a whole day: the invoice (`cost`), the best packaging (`profit`), the export trucks (`trip`) | honest accounts |
| exam 3 | « قعدة الأصدقاء » (`share`) | sweets shared between a child and his friends: what is left on the tray, then how many children share them with nothing left | fairness — nobody takes more than the others — and generosity: he invites the neighbours |
| exam 4 | « ورشة التبليط » (`tiling`) | a tiler lays a corridor: the tile that covers it without a cut, the whole floor, the boxes to buy | work done properly — no tile cut, no gap — and no waste: not one box too many, the spare tiles kept for repairs |

A value is part of the SITUATION (it is what makes the remainder matter: an unfair share, a tile to cut, a box wasted), never a
sentence added on top. No person is drawn: the friends are their plates and names, the tiler is his tools. A step never asks for
a number the world has just shown by packing.

**« حيلة » — a calculation shortcut after the answer** (`kit/tips.js`; owner, 2026-11-15): when a clean one exists for the numbers at
hand — lean on a round product, as in 180 ÷ 19: « 19 × 10 = 190، ثمّ 190 − 19 = 171؛ من 171 إلى 180 يبقى 9: الباقي 9 »; a rule of
divisibility (digit sum for 3 and 9, last digit for 2, 5, 10); a product split in tens and units for an invoice. It is shown ONLY
after a right answer or the final correction (before, it would give the result away), and the function returns null when no
shortcut is clearly simpler: a tip that confuses is worse than none. The tests re-compute every equality a tip writes.

**Everything a step needs is on its screen** (owner, 2026-11-15 — the platform's « no back-and-forth » rule, applied to the cases):
the order card carries, under the story, the lines of what is known NOW — the data of the story and the results the student has
already found in this case (`facts(order, step)`: « طول الرواق: 300 سم », « 300 = 25 × 12: 12 بلاطة في الصفّ », « المجموع: 4 × 12 = 48 بلاطة »).
A result appears only once it is found. The world keeps what was built too: after a mistake and « أجرّب من جديد », the wrong
attempt is cleared and the last right construction comes back at once (`caseRun.keep`, `resumeCase`). A test checks, for every
step of every case, that each number the answer needs is in the facts, the prompt or the options.

**Going back** (owner, 2026-11-15): every answer of the day is kept, right or wrong (`caseRun.log`, published as `depot.history`).
Above the current question, the steps already done are chips — « الورشة 1 · 2 » — and a tap opens that step again, READ-ONLY: its
question, each answer the student gave as he gave it (`answerParts`: the option chosen, or the whole template with his numbers),
why a wrong one was wrong, the shortcut, and the facts as they were at THAT step. « أعود إلى سؤالي » returns; the current step's
boxes are only hidden meanwhile (the paper gate is not asked twice). The trainer of the knowledge page does the same: its six
dots are buttons, an earlier one shows the statement, the answers given (`answerLabel`) and the correction.

`judge(order, step, value)` is the one place that says whether a step is right and, when it is not, WHY — **by what the answer
produces** (« بسعة 9: 96 = 9 × 10 + 6، تبقى 6 علب على الأرض »), never by giving the answer. An order pays 1200 دج, less 300 per mistake;
three mistakes end the day. Money is written « دج », without a thousands space.

## 2ter-2. A second world: « جزيرة المهمّات » (`gameworld/missionIsle/`, 2026-11-20)

The world of a unit's LAST lesson (`docs/reports/INTEGRATION_LESSON_PLAN.md`). It extends the same runtime
(`kit/WorldRuntime.js`) and the same shell (`kit/LessonWorld.jsx`), and is registered in `worlds.js › WORLDS`
as `mission-isle`. What differs from « أرخبيل القواسم »: one island (the oasis depot, `divisorIsles/Depot.js`, the
only file it takes from the other world), no road, no key, no title screen, the robot does not walk — the phase is
`home` (the lesson's missions, the exam door, the recap, drawn by `MissionIsle.jsx › Home`) or `mission`. The kit's
doors it has no use for lead home (`openMap`, `closeMap`, `roam`, `quitSitting`). A mission is DATA of the lesson and
is played by `gameworld/missions/MissionRunner.jsx`, ONE engine for every mission (step kinds `data`, `goal`, `tries`,
`connect`, `plan`, `work`, `review`; `resume` for a mission left half-way); the
scenes are the depot's (`runLots`, `runPairing`, `setPlot` / `runRing`). A new SCENE is added to the depot only when a
family of situations needs it (the plan's §6 table). Text on this world's screens is never under 18 px.
Its home has a third door when the lesson gives `lesson.endless` (`{ title, say, levels, gates, round(level, rand) }`):
the unit's ENDLESS GAME — lesson 1's gate run design for design (rail of light, arches, board, camera, `di-dash`
screen), with no end and faster — the phase is `run`; the lesson gives
the rounds (an order, three options, one right, a fact per wrong option), the world runs them and keeps the best score.

## 2ter-3. A third world: « قصر الساحات » (`gameworld/rootCourts/`, 2026-11-21 — BEING BUILT, not validated)

The world of 4AM unit 2 « الحساب على الجذور » (design, council and plan: `docs/reports/ROOTS_WORLD_PLAN.md`). It extends
the same runtime (`kit/WorldRuntime.js`) and the same shell (`kit/LessonWorld.jsx`) and is registered in
`worlds.js › WORLDS` as `root-courts`. The owner validated the story of lesson 1 `jidhr-tarbii`
on 2026-11-21; the lesson was then completed the same day: its written world (practice ladder, « تدرّب », the exam
sitting, the knowledge map), its board, class test, launch family and lab instrument, and the two things below.

**A level of the practice ladder is played on the kit's rail** (`Game.startPractice` → `kit/GateRun.js`): the lesson's
ladder (`kit/ladder.js`) makes the waves; a wave carries what the rail shows — `say` (the order), `tex?`, `gates` (three
numbers or short strings; « p/q » is drawn with a real bar), `good`, `why: { right, wrong: { [gate]: fact } }`. Three
hearts; the stars of a level are the hearts left; the result is the kit's `result` overlay (`endPractice`),
« ذكّرني بالقاعدة » the kit's `rule` overlay (`showRule` / `closeRule`).

**The lesson's final mission** (`story.mission = { prompt, title, lead, lines(), check(values) → 'ok' | a FACT }`) waits in
the pavilion of the last terrace, under the column of light: one written problem on a wide card (`RootCourts › Mission`,
the kit's `UseLines`, its lines one under the other, each box named by the words beside it). « تحقّق » answers with a
fact of the world about the first line that does not hold yet; solved, it is kept (`flags.mission`) and the story ends.
In `jidhr-tarbii`: a court of 1849 tiles (its side, 43) and a garden of 1900 (between 43 and 44; the square of its side).

**The mechanic** (`rootCourts/logic.js` is its law, pure and exact — fractions of BigInt; a number is TEXT everywhere
else: « 30 », « 5,47 », « 49/64 »):

- a TERRACE of the ksar holds square COURTS; a court's area is written on its gate, in tiles;
- at a court's corner post the student takes the ROD (`E`) and walks along the wall with ← →: **his walk is the
  length** — mark by mark of the rod's dial (« 1 », then « 0,1 », « 0,01 » when the story opens them; the longer he
  holds a key, the faster the marks go by). The world builds a square PLATFORM on the rod, hovering over the court;
- `E` lowers it. A rod of whole tiles first asks how many tiles the platform will cover (typed; a right first
  prediction is a star). Then the world answers: the platform **RIDES** (it covers the court exactly) and flies him to
  the terrace the court leads to; or it leaves a **BAND** (amber, its area written); or it **JAMS** on the rim (violet,
  what sticks out written). A band and a jam are FACTS, never « wrong »: no red, no buzzer;
- when the story allows it (`story.canClamp`), the rod is **CLAMPED on the wall**, corner to corner: `wall(a)`, a
  length that may have no number — the platform built on it rides.

**A rod** is `{ q: '5,47' }` or `{ root: '30' }` (a wall); `outcome(rod, area)` → `{ kind: 'ride' | 'band' | 'jam',
covers, diff }`. The ten digits a calculator shows for the side of the court of 30 leave a band of
0,000000000565919375 tile: nothing is ever compared by a float.

**The ground of the runtime is flat** (the robot stands at y = 0): the terraces float at one height, like the islands,
and a platform that rides FLIES. A ridden platform stays as a shuttle between its court and its pad on the terrace it
reached (`E` on it): this is how he walks back (§2ter-1).

**The story is the lesson's** (`lesson.story`, played by `rootCourts/Game.js`; its header lists every field):
`terraces: [{ id, name, at: [x, z], courts: [{ id, a, to, steps?, unit?, predict? }], feature?, decor? }]`, `end`,
`complete`, `text`, and the hooks `objective(game)` (the WHOLE instruction), `recall(game, terraceId)`,
`onArrive(game, terraceId, first)`, `onVerdict(game, court, row)`, `afterKey[key]`, `pendingForge`, `featureOpen`,
`courtOpen`, `canClamp`, `stepsOf`, `release` (after a band or a jam, the story may take the rod back to its post — the first court does it once a band AND a jam are seen, so that the student is never left holding a rod on a court that has nothing more to give). The student himself puts the rod down WHENEVER he wants, at any length and without lowering anything: the key X or the button « ضع المقياس » beside the rod's length (`Game.putDown`) — owner, 2026-11-21. A `feature` is a thing of the terrace that opens the forge of a key: the `mirror`,
a `calculator` (its ten digits on its screen), the two `stations`. `complete: false` — the story is not the whole
lesson yet: its end does NOT mark the lesson's modules done.

**The terraces stand in ONE line, on the axis that goes into the screen** (owner, 2026-11-21: « like the first world »):
`at: [0, -46 × k]` in the order he meets them; a long flight (back to the first terrace, or over three of them) rises
higher so that it passes over the terraces between.

**A view that follows him in every direction — the kit's `freeLook()`** (owner, 2026-11-21): a world that returns
`true` gets clock controls instead of « forward / turn round »: the arrows are the hours of a clock laid on the ground,
twelve being the world's `heading()` (up 12, right 3, down 6, left 9, two keys together the hour between). The robot
walks that way and the lens swings to look along it; the clock does not turn with the lens, so a key held keeps one
direction. `steers()` says when the keys walk him (false while the world reads them for a gesture of its own — here,
while he holds the rod); `lookTo(angle)` turns him at once (on arriving, after a fall). ON in « قصر الساحات » only: the
worlds of the islands keep « forward / turn round » until the owner asks, because every walk of their lessons steers
with it and would have to be re-run.

**The building yard — the root's own gesture** (`terrace.yard = { crates: ['9', '25'] }`, owner 2026-11-21 after a
brainstorm): on a court he picks a LENGTH and the world answers an area (that is squaring); the yard goes the other way.
A crate holds loose tiles; he takes the rod at the yard's post and walks, and the tiles are laid as a square, row by row,
while the crate's label counts what is left. « ثبّت المربّع »: the crate is empty and no cell is open (the kerb rises,
the plaque is written) — or tiles remain — or cells stay open, shown as violet holes. A yard is driven by the rod as a
court is (`hold.court` is the yard) but it is not a court: nothing rides it, it joins no evidence, no star and no
travel (`game.yards`, `flags['yard:<terrace>']` = crates built). The story decides what waits for it (`story.yardOpen`,
`story.onYard`): in `jidhr-tarbii` the court of 30 opens after the crates of 9 and 25.

**A feature that calls him stands under a column of light** (owner, 2026-11-21): while a terrace's feature is open and
not done, a column of light from above and a ring on the ground mark it; `feature.beside: '<court id>'` places it beside
the court it speaks about instead of the terrace's front right. In `jidhr-tarbii`, back on the court of 30 with the fine
marks, the longest rod of two decimals that still leaves a band (5,47) is the stage's goal: the robot says so, the rod
returns to its post (`story.release`), the court's lamp goes out and the calculator lights up (`flags.near`).

**The count, the two sides, the key** (owner, 2026-11-21: « the gate shows the result then asks the student for it — a
stupid activity »): the world never asks a number it is about to show — the typed prediction of a platform's tiles is
GONE. When he lowers a platform set on a WHOLE mark (up to 20), the lens rises over the court and looks straight down,
the tiles of the platform light one by one from the corner post while a counter runs at the top of the screen
(`state.count`, `[data-rc-count]`; slow at first, then faster — `Game.countCells`), the last number stays written on the
platform, and only then is the product written. While he pulls the rod its length is written on BOTH sides of the
square (the bar and its label along the side wall too). A platform that rides gives THE KEY OF THE COURT: a golden key
turns in front of him, « خذ مفتاح الساحة » (E, `Game.takeKey`), and only then does the platform carry him on. After a
reload the key is not shown again: the platform waits and E boards it.
Each counted tile carries its NUMBER inside it (one canvas laid over the platform, `Game.cellNums`) and sounds a note that
climbs with the count. A court declared `hide: true` shows « ؟ » on its gate and in the HUD until the count of a platform
that rides has ended — then the gate writes its area (`Game.reveal`); a band or a jam on such a court is said without a
number. Lesson 1 hides its three discovery courts (16, 36, 100); a court he must ride FROM its area (30, 49, 196) shows it.
The count is cleared when the verdict is written (the instruction comes back); the ride is SAVED before the key is taken
(a reload with the key floating keeps the ride); the robot's answer to a guess is never covered by « انطلقنا »; a fact of
the rail (`why`) and a tap answer of « تدرّب » are drawn through MathText / a stacked fraction — never « p/q » as text.
Known: on a terrace of five courts not every gate is in view on arrival; the E bubble over the key hides the gate that
has just written its area.

**A terrace of several courts** (added for lesson 2, 2026-11-21 — a court's data: `{ id, a, to?, steps?, ask?, seal? }`):
- a court WITHOUT `to` flies nowhere: its platform rides and stays; the ONE court of a terrace that has `to` is its way
  out, and its platform waits on its court until every other open court of the terrace is done (then E boards it);
- `seal: true` — the court may be CLOSED: once a band and a jam are seen on two NEIGHBOURING marks of the terrace's
  finest dial (`steps.at(-1)`), no mark of that dial rides it; the world says so, takes the rod back, writes
  « لا علامة تركبها » over the court (`game.sealed`, `story.onSeal`). A court is DONE when it rides or is closed
  (`Game.courtDone`): that is what opens travel and puts its lamp out;
- `ask: 'rides'` — before his first try the court asks « will a mark of this terrace ride it? » (`overlay: 'guess'`,
  `[data-rc-guess="yes|no"]`, `game.guess`); when the court is done his word is compared with the fact (three stars
  when they agree);
- a court smaller than three tiles a side is drawn with bigger tiles (areas like 0,49 or 2,25 stay readable). The 3D
  world shows DECIMAL areas and marks only: a fraction is drawn with a real bar in the 2D screens (forges, trainer, board).

**The game holds the order** (owner, 2026-11-21): a platform that waits flies him to another terrace only when the
terrace he stands on is FINISHED — the story asks nothing more there and none of its courts waits to be ridden
(`Game.mayTravel`). On the last terrace everything is finished: he roams freely.

**A course of gates on a terrace** (`feature: { kind: 'run' }`, owner 2026-11-21): a gate of light that opens the lesson's
`run` on the kit's rail (below). The story decides what waits for it (`game.flags.run`, set when the course is passed
whole): in `jidhr-tarbii` the court of 100 opens after « سباق المربّعات » (fourteen gates: 1 × 1 … 10 × 10, then
2 × 2 × 2 … 5 × 5 × 5; `world/run.js`).

#### The kit's « قواعدي » — a rule stays within reach, in EVERY world (owner, 2026-11-21)

The top bar of every world shows the button « قواعدي » (`[data-di-rules]`) as soon as the student owns one rule. It opens
`RulesSheet` (`kit/Tablet.jsx`): every rule he owns, one tab each, his own forged sentence above its name
(`game.openRules()` / `closeRules()`, overlay `{ type: 'rules' }`; it opens while he plays or from the title screen).
When he closes a tablet he has JUST received, the card shrinks and flies to that button, which then beats
(`Tablet › flyToRules`): he sees where his rule went. No motion for `prefers-reduced-motion`.
The older keys pill of the top bar still opens the practice hub.

#### The kit's gate run — `kit/GateRun.js` + `kit/GateRunHud.jsx`

The rail of light (the robot on its board seen from behind, three arches, ← → for the lane, Space pauses, three hearts)
is a kit part since 2026-11-21: it names no world and no lesson. A world owns one `GateRun`, passes it its runtime hooks
(`stepWorld`, `lanesLive`, `robotPose`, `cameraShot`, `dispose` — listed at the top of the file) and draws
`<GateRunHud run={s.run} game={game} content={…} />` over everything while `state.run` is set. The lesson gives the
content: `{ levels, gates, round(level, random, n) → { ask, tex?, options × 3, right, why × 3 }, total?, text }`.
Without `total` the run ends with the last heart; with `total` it is a COURSE that ends after that many gates
(`won`). A gate that was not the right one shows a FACT (`why`), never « wrong ».
**Not yet migrated:** « سباق الأعداد » in `missionIsle/Game.js` still carries its own copy of this engine (the kit's was
extracted from it, line for line); it moves to the kit when the owner says so. `divisorIsles/Game.js` has the first run.

**The files** (`rootCourts/`): `logic.js` (the law), `Game.js` (the mechanic), `scenery.js` (what is drawn in 3D: a
terrace with its parapet, towers and palms, a tiled court with its ruler and gate, the platform, the pad, the mirror,
the calculator, the stations, the pavilion), `strings.js` (the world's sentences; `tiles` agrees « بلاطة » with its
number), `RootCourts.jsx` + `rootCourts.css` (the HUD: the instruction, the rod in his hand with the dial's marks, what
the platform did; the prediction card), `courtParts.jsx` + `court.css` (THE 2D drawing of a court, `Court`, used by the
mirror and the experiments: to scale, cut tiles, blocks above 150 tiles, a sub-divided tile under one tile, a
MAGNIFIER when the band is too thin to see — the exact difference is always written), `ruleForge.js` (what a case is:
`caseOf`, `caseId`, `evidenceOf`, `courtPool`, `COURT_TEXT`), `forgeParts.jsx` (`Mirror`, `Line`, `beats`),
`Inquiry.jsx` and its three kinds:

| Kind | The rule it finds | What the student does |
|---|---|---|
| `calc` | the exact length of a side against what a calculator shows (a comparison of candidates, none of which is the length) | rods lie ready on a rack — a whole number, a decimal, the calculator's ten digits (a drawn calculator); for each he says BEFORE whether it rides; the platform comes down on the court and the band or the overhang is written exactly; when it is too thin to see HE presses « كبّر » (×10 a press) until he sees it; the rows stay in a table. Last, he clamps the rod on the wall: it rides, and its cell is « ؟ » — a length with no number |
| `roundtrip` | two operations that undo each other | two stations, « ابنِ ساحة » (a rod in, a court out) and « خذ الضلع » (a court in, a rod out); for each journey of the spec (a wall, a number, a walk to the LEFT of the post, a chain of three) he TYPES what will come out before the station runs — a plaque, or a rod (a number, or « ضلع الساحة التي مساحتها [ ] »); the station runs and shows the fact; the journeys stay as strips |
| `chase` | a pursuit that never closes: the side of a court whose area is not the square of a fraction is written by NO fraction (added 2026-11-21 for lesson 2; no lesson uses it yet) | a court of `a` tiles and a list of fractions p/q, better and better (the spec gives them). For each, the rod p/q over its real bar beside the court; he PREDICTS « يبقى شريط » / « تعلق » / « تركب »; the platform comes down (drawn to scale, a magnifier on the far corner when the gap is too thin: its power of ten written) and the card writes the fact on ONE common denominator — p × p small tiles of side 1/q against a × q × q (7/5 on 2: 49 against 50) and the sign between them; every fraction stays in a table. Last, ONE question to observe: in how many did it ride? (0 / 1 / all) |

**Spec shape of `chase`** (`rootCourts/chase.js` + `InquiryChase.jsx`, styles in `inquiry.css` « chase »; the conventions
of the spec blocks of §2sexies: `T` = `spec.text`, the lesson's words; a `T.x(…)` returns a string that MAY hold `$…$`
(MathText) unless marked « plain »; the kind itself writes no word — `inquiryChase.render.test.jsx` renders every stage
with Latin tags and fails on one Arabic letter, and reads the two source files):

```js
// chase — logic: chase.js › chaseFact(a, 'p/q') → { p, q, a, kind: 'band'|'jam'|'ride', platform: p×p, court: a×q×q,
//         gap: |court − platform| (small tiles of side 1/q), covers, diff (the same in whole tiles) } — BigInt, as text
{ kind: 'chase',
  a: '2',                                    // a whole number, 1 … 400 (a square is allowed: then a fraction may ride)
  fracs: ['3/2', '7/5', '17/12', '41/29', '99/70'],   // 1 … 6 fractions « p/q », p ≥ 1, q ≥ 2, kept as given (6/4
                                             //   counts small tiles of 1/4); refused: a number of more than 8 digits
                                             //   (p, q, p×p, a×q×q, the gap), or a card formula wider than 10.8 em
                                             //   (chase.js › lineEm: digits of « a × q × q = C » ≤ 14)
  text: {
    // every function below receives ARGS = { a, i, n, p, q, rodTex: '\\dfrac{p}{q}', perTile: q×q } — the fraction on
    // screen (at the closing question: the last one)
    lead: (ARGS) => …, goal: (ARGS) => …,    // the question; the goal (in the 🎯 frame) — both MathText
    ask: (ARGS) => …,                        // before each platform comes down — never the fact
    sayBand, sayJam, sayRide,                // plain — the three predictions (« يبقى شريط » / « تعلق » / « تركب »)
    rodName, platformName, courtName,        // plain — the card's labels (≤ 8 characters)
    smallTile: (ARGS) => …,                  // beside the drawn small tile: « بلاطة صغيرة ضلعها $\\dfrac{1}{5}$ … »
    unit: (n) => …,                          // plain — the noun after a whole number of small tiles, agreed (≤ 12 chars)
    unknown,                                 // plain — in place of the numbers before his prediction (« ؟ »)
    fact: ({ ...ARGS, ...row }) => …,        // after the platform: row = the result row below (kind, platform, court,
                                             //   gap, predicted, right…) — a miss is answered by the fact, never « خطأ »
    colRod, colPlatform, colCourt, colFact,  // plain — the table's headers (two lines at most in 6.2 / 10.4 rem)
    band, jam, rides,                        // plain — the chip's word (≤ 5 characters), followed by the gap
    next,                                    // plain — after each fraction (the last one leads to the question)
    countAsk: (ARGS) => …,                   // the closing question: in how many did the platform ride?
    countNone, countOne, countAll,           // plain — its three taps
    countFact: ({ ...ARGS, said, tapped, rides, n, right }) => …,   // after his tap: what the world counted
    done,                                    // plain — the last button
  } }
// result: { rows: [{ i, frac: 'p/q', a, s: { q: 'p/q' reduced }, kind, p, q, platform, court, gap, covers, diff,
//                    predicted: 'band'|'jam'|'ride', right }],
//           count: { said: 0|1|n, tapped: '0'|'1'|'all', rides, n, right } }
//           (a row is a case of this world: `ruleForge.js › caseOf(row.a, row.s)` reads it; `s` keeps the fraction)
// stages: say → build → seen → (next fraction: say …) → count → counted → done
// hooks:  data-iq="chase", data-iq-stage, data-iq-area, data-iq-i, data-iq-p, data-iq-q, data-iq-progress="tried:n",
//         data-iq-say="band|jam|ride", data-iq-next, data-iq-count="0|1|all", data-iq-fact, data-iq-ask, data-iq-goal,
//         data-iq-court=<a> (+ -rod, -stage say|build|done, -kind), data-iq-band / data-iq-over=<gap>,
//         data-iq-lens=<k> (the magnifier ×10^k), data-iq-frac="p/q" (every fraction drawn over its bar),
//         data-iq-smalltile=<q>, data-iq-platform / data-iq-courtline=<whole number> ('' before the fact),
//         data-iq-relation="band|jam|ride", data-iq-table=<rows>, data-iq-row=<i> data-iq-row-kind,
//         data-iq-cell-platform, data-iq-cell-court, data-iq-cell="band|jam|ride"
//         window.__inquiry = { kind: 'chase', a, i, n, stage, frac, rows }
```

Its screen at 1366 × 768 (`chase.js › CHASE_LAYOUT`, a budget checked by the render test — never yet measured in a
browser): the court 14 rem high with the card of numbers beside it, then the question, the buttons and the fact; the table
(27.2 rem) on the left, six rows at most. Where he is in the list is a row of dots (never « 2 / 5 », which would read as a
fraction there). Sounds: `pick` (his prediction), `sweep` (the platform comes down), `gate` / `plank` / `hit` (it rides /
leaves a band / jams), then `key` or `fail` (his prediction against the fact, heard); the count: `pick`, then `key` /
`fail`; `ui` on « next ». Tests: `chase.test.js` (the two whole numbers and the fact for √2's five convergents; every a
from 2 to 20 that is not a square, five fractions each, against `logic.js › outcome`; no fraction p/q with q ≤ 400 rides
such a court, while on a square court the right one does; the magnifier; the refused specs; the reducer played through
with predictions that do not match, every road), `inquiryChase.render.test.jsx` (every stage, the fact never before the
prediction, no « p/q » as text, no word of the rule, the layout budget, ≥ 18 px). The walk's player:
`e2e/lib/lessonWalk/worlds/rootCourtsExperiments.mjs › chaseExperiment` (to register in `experiments.mjs › EXPERIMENTS`
as `chase`).

**Two things this world asked of the kit** (both generic): `lesson.notYet` — a lesson being built names the doors it
has not got yet (`map`, `know`, `progress`, `lab`, `launch`, `sitting`, `test`): `kit/Title.jsx` and `kit/End.jsx` do
not show them (a door never opens on nothing) and the world's `openHub` ignores them; and `data-di-clear` — anything a
world's HUD shows in the middle and marks so is never covered by the « E » bubble (`WorldRuntime › placePrompt`).
`kit/Instruction.jsx › Recall` takes the world's own `title` (« من الساحة السابقة »).

**Known, not done**: no unit test plays `Game.js` (the 3D mechanic is played by a browser only: the walk
`e2e/lessons/jidhr-tarbii.walk.mjs`, through `e2e/lib/lessonWalk/worlds/rootCourts.mjs`; the free view's clock controls
are not walked — the walk places the robot); the typed radical sign the last steps need does not exist in the kit (the forges spell
« ضلع الساحة [ ] »); no test renders `RootCourts.jsx` (a wrong import path in it reached the browser on 2026-11-21 — see `defects.md`).

## 2quater. « الامتحان الأبيض » — the exam sitting (PROTOTYPE, 2026-11-16)

**Status: a prototype of the SITTING, to judge the feel, not validated. Since 2026-11-18 its sheets are the lesson's EXERCISE
BANK, served as it is** (owner: « you will use the exercises bank as it is »; `kit/bankSitting.js`, findings and design:
`docs/reports/BANK_AS_IS_2026-11-18.md`).
Opened from a level of the exam ladder (§2quinquies; until 2026-11-16 a button of the title screen opened it directly). `ExamSitting.jsx`, logic `sitting.js` + `bankSitting.js`, style
`examSitting.css` (prefix `xs-`). It is the opposite of the game on purpose: one sheet of paper, three colours — black for the
subject, blue for what the student writes, RED for the corrector and never before the copy comes back — silence, no stars.

| Phase | What the student has | What he does NOT have |
|---|---|---|
| `read` — reading time | the whole subject (the bank's sheets, each with its statement, formulas, table and numbered steps « 2) ب) »); a tap underlines a word or a number in pencil | any answer box |
| `sit` — the sitting | the subject on one side, the answer sheet on the other (one sheet per page, never a screen back; every page stays mounted, hidden when not on screen, so a box keeps what he typed); each step answered in the practice space's OWN widget for its `answerType` — `choice` → `ChoiceInput`, `rational` → `TemplateInput` (« قوالب الإجابة », `templateFor`), `integerSet` → `IntegerSetInput`; a `selfCheck` step (« بيّن أن ») has no box: « تُحرَّر على ورقتك فقط »; a flag « أعود إليه »; a quiet pace line; one notice at the last minute; « أسلّم ورقتي » asks once; **« خروج »** in the header (reading time and sitting; owner, 2026-11-17) leaves after ONE confirmation (« تخرج من الامتحان؟ » — « أواصل » / « نعم، أخرج »): nothing is marked, no evidence is sent, the ladder does not move, and the same level opens again on a new sheet (`Game.js › quitSitting`); **a forgotten exercise is shown first** (owner, 2026-11-16): if an exercise that is not on screen has NO box filled at all, the first « أسلّم ورقتي » turns the answer sheet to it and names it (« انتبه: لم تكتب شيئًا في التمرين الثاني. ها هو أمامك. » + « أواصل ») — once per sitting; the next « أسلّم ورقتي » is accepted, exercises empty or not (`sitting.js › forgotten`, `answered`). It says only « empty », never right or wrong; the time-out hand-in is not delayed by it | any verdict: no tick, no mark, no red, no hint, no sound |
| `back` — the copy handed back | the total in a red circle and an appreciation; a red mark per question (✓ ½ ✗, « لم تُجب », ✎ for a step written on paper); for a question: the scheme to tick against his own paper, then « أرشدني » (the bank's HINTS — never the answer — and back to the paper) or « اشرح لي » (the bank's model solution, its lines and its boxed result); « دفتر أخطائي »: one line to write by hand per rule that lost points | — |

- **The subject is the lesson's BANK, as it is** (`kit/bankSitting.js › createBankSittings({ lesson })`; a lesson's
  `world/sitting.js` is that one call): level N of the ladder serves `sheets` exam sheets drawn from
  `content/practice/<grade>/<lesson>/level-N/` (`BANK_LEVELS`: 1, 2, 2, 2, 1 sheets — level 5 is the bank's « الوضعيّة
  الإدماجيّة (08 ن) »), loaded when the exam space or a sitting opens through the practice space's own loader
  (`features/practice/practiceContent.js`, lazily: it never enters a world's chunk). Nothing is generated, copied or rewritten:
  statement, formulas, table, steps, answer types, points (`metadata.exam.points`), minutes (`metadata.estimatedMinutes`),
  hints and model solution are the bank's. Two things happen AT DISPLAY only: « DA » of MONEY is written « دج » (`cashDj`), and
  nothing of `metadata.source` (textbook pages) is shown. `cashDj` (2026-11-19) touches money only: in a formula `\text{ DA}`
  or DA glued to a number (`1040DA`, `11225\,DA`) — leaving the formula when it ends it (`$1040$ دج`), `\text{ دج}` inside;
  in the words DA after a number (« 900DA », « 900 DA »), right after a formula ending on a number (`$1500$DA`), « (DA) »,
  « بالـ DA », « بالدينار DA » — never when a Latin letter follows, never a name (`$AB + DA = 7$` stays). The amount before a
  DA in the words loses its thousands spaces (« 211 500DA » → « 211500 دج »: groups of exactly three digits only). A third
  display rule (`namesAsMath`, 2026-11-19): a « PGCD(a ; b) » / « PPCM(a ; b) » written in the WORDS of a bank line (with
  the « = n » that follows it) is drawn as a formula `$\mathrm{PGCD}(a ; b) = n$` — in plain Arabic text the bidi algorithm
  scrambled it (« هو PGCD(252 ; 36 = (180. ») — and inside a formula the name gets upright letters; the answer format the
  widgets parse is left as the bank wrote it. lib/sittingWalk.mjs writes the same rules again for its word-for-word check. It runs
  on every string the sitting shows — statement, formulas, table, steps, the model copy and its boxed `result`, the hints,
  the choice written back — and on what the practice WIDGETS draw: each step carries `shown` (its `statement`, `lead`,
  `answerFormat` and choices through `cashDj`), given to `ChoiceInput` / `TemplateInput` / `IntegerSetInput`, while the mark
  and the copy sent to the server read the bank's own step (`bank`). `kit/bankDisplay.test.js` draws EVERY sheet of every
  level of the twelve v2 banks (the DEV hook below) and finds no « DA » left on screen. A sheet with a step of a type the sitting does not draw (`multiChoice`,
  `affine`, `interval`, `point`: `SITTING_TYPES`) is left out of the sittings and stays in « /espace/pratique » — none in the six
  v2 banks of 2026-11-18.
- **An empty level is never sat** (2026-11-19): `makeSubject` returns `null` when the level has nothing to mark — no sheet
  in its pool (an empty bank level, a lesson missing from the exercise index), or only sheets written on paper (total 0).
  The sitting then says « لا يوجد بعدُ موضوع لهذه الدرجة. » with a way out (`data-xs="empty"`): nothing is marked, sent or
  promoted. And a subject whose total is 0 is never passed (`sitting.js › sittingPassed`: no star, no appreciation, no
  promotion in `journey.applySitting`). `sittings.available(n)` says whether a level can be sat: once the bank is loaded,
  the ladder (`Spaces.jsx`) shows such a rung locked, with its reason « لا توجد بعدُ ورقة امتحان لهذه الدرجة »
  (`data-di-exam-empty`), and it cannot be opened; the « empty » screen stays as the fallback.
- **Every copy is evidence, whatever happens** (owner, 2026-11-19: « we do not care if the student leave or not, we must
  count evidence whatever happen »): a sheet sat again — after a blank copy, after reading its model solution — is drawn and
  sent like the first time (the draw only leaves out the sheets of the last miss while the level has others, as before);
  opening a sitting and quitting costs nothing (nothing is recorded, marked or sent). `kit/sittingSat.test.js` checks both.
- **An answer sheet too long for its box is shown in LEAVES, never cut, never scrolled** (2026-11-20; `kit/ExamSittingLeaves.jsx`,
  logic `kit/sheetLeaves.js`). The answer sheet is a `Fit` with the 12 px floor; when it reaches Fit's smallest scale
  (`min`) and is STILL taller than its box, Fit says so (`onShort`) and the answers are measured and split into leaves at a
  boundary between two answers — as few leaves as the room allows, the most even split among those, an answer taller than
  the room alone on its leaf. Every answer stays mounted (the others `hidden`): what he typed is kept when he turns. Under
  the sheet, always on screen, the pager: « السابق », the count « 1 / 2 » (with « تتمّة الأجوبة في الصفحة التالية » while
  a leaf follows), « التالي ». The exercise tabs' count (« 0/8 ») counts every leaf; « أسلّم ورقتي » is unchanged. A sheet
  that fits is ONE leaf, exactly as before, no control. Hooks: `data-xs-leaves` (how many) and `data-xs-leaf-on` (the one on
  screen) on the column, `data-xs-leaf` on each answer, `data-xs-leaf-prev` / `data-xs-leaf-next` / `data-xs-leaf-count`.
  Cheaper remedies first: the line a fraction box writes under itself (« كسر لا يقبل الاختزال — اترك المقام فارغًا… ») is
  said once per leaf (`data-xs-quiet` on the others) — it took one sheet of `ikhtizal-kasr` back under its box (636 → fits
  in 581 px at 1366 × 768) and another from 684 to 650; tighter gaps gained 4 px and were not kept. Three sheets of that bank
  are in two leaves (l3-003, l4-006, l5-004), none of `qasim-mushtarak-akbar`. The corrected copy is not in leaves (one line
  per answer: it fits); the walk checks it after handing in every sheet in leaves (`lib/sittingWalk.mjs › everyLeaf`: each
  leaf a screen of its own, every answer typed on its leaf, kept, counted, then the copy handed back whole).
- **The clock hands in once**: the countdown updater is pure (`sitting.js › tick`), and the time-out hand-in is an effect on
  `left === 0` (`timeUp`) behind a once-only guard — a StrictMode double call cannot send two copies.
- **Marked by the practice evaluator** (`mark` = `@smarter-academy/core/practice › evaluateAnswer`): a sheet's points are
  shared between its typed steps in quarter points (`shareQuarters`); correct or equivalent → the step's points, partially
  correct (e.g. a strict subset of a set) → half, anything else → 0; a blank earns 0 and is shown as a blank; a `selfCheck` step
  carries no points here (written on paper, its model copy comes back with the copy).
- **الكفاءات** (`sheetOf`, `kit/bankEvidence.js`): at the hand-in — and only then — the copy goes to the PRACTICE ENGINE, the
  path of the exam sheets of « /espace/pratique »: one session at the level (`POST /lessons/{code}/practice/sessions`), one
  question attempt per ANSWERED step (`…/questions`, `…/answers` with the raw answer; the browser's outcome travels only as a
  prediction), the exercises completed, the session closed. The SERVER reads each question in the content and re-computes the
  verdict with its own evaluator; a `selfCheck` or `counted: false` step is judged but never evidence. A step left BLANK is
  not sent: the server would read a missing answer as `abandoned`, which is INERT (recorded, but it moves no mastery and is
  out of every rate — `Outcome.php`), so sending it would cost nothing either. What follows is a fact of the MASTERY ENGINE, not a rule of the
  sitting: it classifies a question answered again in a later session by its `item_key` — after a failure
  `retry_after_failure` (weight ×0.6), after a success `repeat_after_success` (×0.1); an `abandoned` row is not a try, so a
  question left blank then answered later arrives as a `first`. Ids are chosen once, so a retry is a duplicate; a copy that
  could not be sent waits (per student, 30 days) and goes when the world opens or the connection returns — one flush at a
  time, and a copy queued while a flush waits on the network stays queued (the flush re-reads the queue before writing it).
  A copy or a step the server REFUSES (4xx) is dropped with a trace: a warning in development and a counter
  (`refusedSittings()`, storage key `smarter_world_sitting_refused`) that no screen reads. No game claim is sent by a sitting. A teacher's preview sends nothing. Each answered step with a key
  also adds to the key's tally of « تقدّمي » (`Game.handInSitting`, `tallyOf`).
- **The ladder** shows a level's minutes and points once its bank is loaded (`levelMinutes`, `levelPoints`: a range when
  the sheets of a level differ, e.g. « 2–2,5 نقاط »).
- Check: the sitting walk of each v2 lesson — `gameworld-sitting.mjs` (the pilot) and `gameworld-<lesson>-sitting.mjs`
  (`qawasim`, `khawass`, `baqi`, `qawaid`, `hasr`), all built on `e2e/lib/sittingWalk.mjs` (2026-11-19), at 1366×768,
  `E2E_SIZE=1024x768` and `1840x900`. Three parts, each in its own session: `levelFive` (one sitting of level 5 answered
  right with the bank's key on disk, the hand-in, the model copy, the promotion, « تقدّمي » before and after a reload),
  `copies` (a blank copy, a wrong copy with « أرشدني » / « اشرح لي », a copy quit half-way, a right copy) and `everySheet`
  (EVERY sheet of EVERY level opened through the ladder with the DEV hook below, its text checked against the disk, its
  answer boxes in their shape, each screen through the walk's `shot`: nothing scrolls or is cut, 12 px, no raw formula,
  no « DA »). `E2E_PARTS=five|copies|sheets` (comma list) runs only some parts and prints « NOT a full run ». The answer
  key and the points are always read from the bank on disk (`e2e/lib/bankSheet.mjs › fromDisk`), never from the page.
  **Written on 2026-11-19 and NOT yet run** at the time of writing. Unit: the kit's `kit.test.js` (a toy bank: money-only `cashDj`, the empty level, the DEV hook
  in and out of production, the clock), `examSitting.render.test.jsx` (the empty screen), `sittingSat.test.js` (every copy
  is evidence),
  `bankEvidence.test.js` (sent, queued, refused, the flush race) and `bankDisplay.test.js` (every sheet of the twelve v2
  banks, no « DA » of money on screen); per lesson `world/sitting.test.js` against its REAL bank (every level, every step
  markable to full points by the bank's key, no « DA » of money in any shown string); `journey.test.js`. Status script: S4bis.
- **A walk chooses its sheet (DEV only)**: when `import.meta.env.DEV` and `localStorage['di.dev.sheet']` holds the id of a
  bank exercise of the level being opened, `makeSubject` puts that sheet first (`DEV_SHEET_KEY`); `sittings.sheetIds(n)`
  lists a level's sittable sheets so a walk can loop over all of them. A production build reads nothing (the branch is
  dropped; `kit.test.js` checks it with `DEV` stubbed false). See §5.
- **12 px on the screen, however far a sheet is zoomed** (2026-11-19, after the first walks measured choice labels at
  10.5 px and the sheet's tip at 8.5 px at 1366×768 and 1024×768): every `Fit` of the sitting is given `floor={12}`
  (`Fit.jsx › floor`): the box sets `--di-min-font` on its content to 12 px divided by its own zoom × the zoom of the frames
  above it (`.xs-fit`, zoomed to the window), and every size of `examSitting.css` is written `max(var(--di-min-font, 12px),
  <its size>)` — the practice widgets too (`.xs-field` and its Tailwind `text-xs … text-2xl`). Floored text no longer shrinks
  with the box: only the paddings, the gaps and the widgets do; if that is not enough the box reaches its `min` (0.5) and is
  cut, which the walks report. To keep the sheet's zoom high, a `choice` step lays its choices side by side at the width of
  their words (`.xs-field[data-xs-type='choice'] .grid`: « نعم / لا » on one line, seven weekdays on two) instead of
  ChoiceInput's two columns of 48 px rows. `Fit` now also shrinks a box that is too tall by more than ONE pixel (its 0.5 %
  dead band alone let a 685 px sheet stand cut in a 682 px box at 1840×900) — this applies to every `Fit` of the kit.
- Not built yet (the rest of the proposal): a full BEM-length exam, spaced returns, the resume of an interrupted sitting, the
  photo of the paper, the student's own self-mark of a `selfCheck` step inside the sitting, the parent's line.

## 2quinquies. Two practice spaces, the exam ladder, « تقدّمي » and « مختبري » (2026-11-16, NOT validated)

Owner request: the student practises in the GAME first, then in the REAL format; the exercises follow his level; the game is
felt BETWEEN two levels of the exam, never inside a sitting.

- **« فضاء اللعب » / « فضاء الامتحان »** — a switch at the top of the practice hub (`KnowledgeMap`, `data-di-space`). The game
  space is the 16 levels of §2bis. The exam space opens once the student has PLAYED: the four keys and the first run of each
  (`journey.js › examOpen`). The title screen no longer opens a sitting directly.
- **The ladder** (`Spaces.jsx › ExamLadder`, `bankSitting.js › BANK_LEVELS`): five rising steps — the five levels of the
  lesson's bank, with the names the practice space gives them.

  | Level | Sheets drawn from the bank's level | Minutes, points |
  |---|---|---|
  | 1 « أستعيد الأساسيات » | 1 | the sheet's own (`estimatedMinutes`, `exam.points`) |
  | 2 « أوظّف » | 2 | their sum |
  | 3 « أتدرّب » | 2 | their sum |
  | 4 « أتعمّق » | 2 | their sum |
  | 5 « الوضعيّة الإدماجيّة » | 1 (08 ن) | the sheet's own |

  A level is passed at **80 %** of its points (`PASS`); stars: 1 from 80 %, 2 from 90 %, 3 for a full paper. A passed level
  opens the next. Each sitting draws its sheets at random from the bank's level (ten sheets each).
- **Adapted to the student** (`applySitting`, `weakKinds`): after a sheet under 80 %, what lost points is remembered for that
  level — the rule KEYS of the lost steps (a step's الكفاءة → the key, `keysOfPoints`) and the sheets themselves (`ex:<id>`);
  the next sheet of the level leaves out the sheets already missed while the level has others, and puts the sheets that ask
  the missed keys FIRST (`focus`). After two fails in a row the student is sent to train on the rule first (« أتدرّب أوّلًا »
  opens the card of the first missed key: `cards.ofExercise[w] ?? cards.ofKey[w]`).
- **The moment between two levels** (`Spaces.jsx › Promotion`, `Game.js › finishSitting`): when the copy is closed the game
  comes back — the finale sound, the stars one by one, confetti, « ارتقيتَ إلى الدرجة n! » — or, under 80 %, a calm card:
  « ليس بعد… ورقة أخرى وتنجح ». Nothing of this exists inside the sitting.
- **« تقدّمي »** (`Spaces.jsx › ProgressPage`, button on the title screen, `data-di-progress-open`): one page for THIS lesson —
  the road in five stations (story, keys, game stars, exam levels, knowledge cards); per key: the game stars, the sealed memo
  sheet, the answers given as in an exam (right / all), and the platform's own status when the page received it; an exam
  readiness; and ONE next thing to do (`journey.js › nextStep`), one tap away.
  **The readiness is honest**: half the ladder (levels passed / 5), half the first tries done as in an exam (counted from the
  same claims that go to الكفاءات, at least four of them). The game's stars never enter it.
- **« مختبري »** (button on the title screen, `data-di-lab-open`): the lab of the lesson, the same for every lesson —
  contract `LESSON_LAB.md`. Here it is rendered inside the game's root, with the game's sound.


### « عُدّة الانطلاق » before the world (phase 1, 2026-11-17)

The FIRST « ابدأ المغامرة » of a student plays the launch of the lesson (`lessons/common/launchkit/`, contract
`LAUNCH_KIT.md`): overlay `{ type: 'launch', then: 'start' }`; when it ends, `Game.js › launched` closes it and starts the world.
Afterwards « واصل » goes straight in (`launchkit/store.js › launchDone`) and « 🎒 عُدّتي » on the title screen opens the kit again
(`data-di-launch-open`). The 3D world is neither simulated nor drawn behind it (as behind « مختبري » and the exam sheet). The
walks of the game world seed the launch as already played.

## 2ter-0. Three rules a world's screens never break (owner, 2026-11-17 — each one was a defect he found on lesson 2)

1. **A formula is DRAWN, never read.** Every sentence a lesson gives a world, a forge or the kit goes through `MathText`:
   a lesson's string may carry `$…$` anywhere, and a screen that prints it as plain text shows « `$5 \times 5 = 25$` ».
   The defect was the sentence under a prediction (`RuleForge.jsx`, `T.fact`). **Checked**: `noScroll` of the four world
   walks fails on any dollar sign or backslash command readable on screen (« raw formula on screen »), and the walk of
   lesson 2 reads the sentence under EVERY prediction.
2. **A world's screen writes no number and no word of a story.** The store of the last bridge printed the pilot's gap
   (756), its two moulds (32, 36) and its price (1850) inside lesson 2: the equation showed a wrong number, the mould 32
   was offered, and the price to pay could never be right — a dead end. `Boss` now reads `game.bossSeg`
   (`{ a, boss: { options, price } }`) and the lesson's `text.boss` (`steps`, `change`, `unit`, `err.*` — a lesson that
   speaks of shelves overrides every sentence that says planks or moulds). A lesson keeps the numbers of its last bridge
   in ONE constant that its segment and its sentences both read. **Checked**: the lesson's `journey.test.js` (its store
   says its own numbers, in its own words; the world's screen contains none of the pilot's) and its walk, which PLAYS the
   store through the screen and compares each number shown with the story's. A walk that drives the game by its commands
   proves nothing about what the student reads: lesson 2's first walk stopped at the store's door and saw none of this.
3. **The student can always leave.** The veil of a dialog covers the top bar and its ✕. `kit/parts.jsx › Card` draws the
   same ✕ again over the veil, at the same corner (`ExitTo` context given by `LessonWorld`; `data-di-exit`), and every
   step of the store has « إغلاق » (the payment step had no way out; the store opens again where it was).
   **A full screen that covers the top bar draws its two buttons again** (owner, 2026-11-17: « add also the quit button
   and the sound on off in these kind of views »): the rule forge shows, at the end of its header and in every phase,
   the sound button and the ✕ — `kit/parts.jsx › SoundToggle` and `ExitLink`, the SAME components the top bar and the
   dialogs use (one button, one stored choice `smarter_world_sound`). A new full screen of a world does the same. The knowledge page and « تقدّمي » carry it too (2026-11-18). ONE exception: the exam sitting (`kit/ExamSitting.jsx`) is silent by design (« صامت » in its header), so it has no sound button.
   **Checked** in lesson 2's walk: the ✕ is over the dialog and a click reaches it; the payment step closes and reopens;
   in the forge (while he writes his rule, and on the chart) the ✕ and the sound button are on screen, uncovered, beside
   the steps, and the sound is turned off and on from there.

## 2ter-1. Three more rules for EVERY game world (owner, 2026-11-19 — « a very important update for all the games »)

1. **The instruction of the moment is BIG and stays on screen until it is done.** He may fold it and open it again; a new
   instruction always opens. `kit/Instruction.jsx › Instruction` (the world's `Hud` renders it from `state.objective`,
   keyed by its text): 1.4 rem, the fold button « المهمّة » (`data-di-instruction="open|folded"`,
   `data-di-instruction-fold`). While a bridge is being built (`state.equation`) it is `compact` — one line — so the
   equation and its verdict keep their place above the world; it is never removed. **So the instruction must be whole:**
   what the robot SAYS disappears after a few seconds (`game.say`), the instruction does not — a story gives the full
   sentence through its hook `objective(game, seg, i)` (the world's default is one short line per kind of segment).
2. **What matters from the island before is shown on the RIGHT of the game**, so that he connects one island to the
   next: `kit/Instruction.jsx › Recall` — the card « من الجزيرة السابقة » (`data-di-recall`, three lines at most, `$…$`
   allowed), rendered by the world's `Under` from `state.recall`. The world fills it on arrival (`Game.js › recallOf`):
   the story's hook `recall(game, k)`, or by default the gap he has just crossed (`198 = 11 × 18`). The middle column
   narrows to leave the card its room (`.di-center:has(~ .di-recall)`).
3. **He can turn ROUND and walk back.** Before, the camera always looked along the road ahead: « back » walked him
   towards the lens, blind. The control is the owner's (2026-11-19): **each PRESS of « back »** (ArrowDown / S / the
   stick pulled down) **turns him round** — `game.facing` flips between 1 and -1 (`kit/WorldRuntime.js › updateHero`),
   the world's `heading()` points back along the road (`Game.js › place()` — the bridge under him, or the island he is
   on — and `heading()`) and the camera swings behind him (a quicker damping for a turn round than for the bend from
   one island to the next), and **the ROBOT turns round on the spot with the view** (`turning`: its yaw follows
   `heading()` while it stands still); **« forward » then walks him the way he faces**, towards the island before; « back » again
   turns the camera to the road ahead. « back » never walks him. His keys are read in a frame blended from the lens's
   direction and the direction it is turning TO, so he never walks an arc towards the gap while it swings. `facing`
   goes back to 1 on arrival at a new island and after a fall.

### A situation lived on the islands may REPLACE the experiment screen of a forge (owner, 2026-11-19)

The need for a rule may come from the world itself — a constraint he carries from one island to the next — instead of
the mirror's « استكشف ». The forge then has no `inquiry`: its evidence is the world's log of bridges
(`forge.evidence(log)`, every bridge fired, held or not), and the mirror keeps the tiles, the test on what he did, the
attacks, the seal, the last step and the tablet. Two mechanics of the world « أرخبيل القواسم » serve it:

- **A CONVOY — two (or more) bridges built with the planks of ONE island.** Consecutive bridge segments that carry the
  same `convoy: '<id>'` (the story's `segments`): the first holds the `moulds`; the later ones have `moulds: []`, their
  islands hold no planks, and he keeps the plank he carries on arriving there. A later bridge takes only the planks
  that hold the bridge before it (`T.say.convoyOnly`). When a later gap refuses them: `flags.convoyStuck`, and the
  instruction sends him back to the first island (`T.objective.convoyBack(name)`, `T.say.convoyBack(name, r)`). Taking
  OTHER planks there sends every standing bridge of the convoy back to its pedestal (`convoyChoice`,
  `T.say.convoyReset(b)`): the road starts again from that island (`state.stage` goes back to it, so `onArrive` of the
  islands after it runs again — a story's `onArrive` must bear being run twice). `seg.builtWith` is the plank that
  holds a bridge (saved as `built` in the world's save; `restore` lays it again).
- **A PURSE** — `story.convoys = { <id>: { purse: n } }`: a coin per plank laid, WHATEVER ITS LENGTH. `purseOf(seg)`
  = `{ of, left }`, derived from the convoy's standing bridges (never stored); the chip `data-di-purse=<left>` shows it
  while a bridge of the convoy is still to build. When the coins run out the bridge stops where they did: the equation
  shows what is laid and what is still open, the verdict says so (`T.verdict.purse`), everything goes back
  (`T.say.purseOut(laid, need)`) — on a later bridge of the convoy he is sent back, as above.
- **A WORKSHOP — he MAKES the plank** (every island with `feature: 'anvil'` has its own). The segment leaving that island
  declares `workshop: { min, max, open?, typed?, bench? }`: `open` — it works from the start (else after two refusals,
  `flags.anvil`); `Game.actAnvil(i)` opens the overlay `{ type: 'workshop', a, seg, gaps, … }` (`gaps`: every gap of the
  convoy still to build) and `craft(b)` gives him the plank. Its screen is `divisorIsles/Workshop.jsx` (words
  `T.workshop`): without `typed`, the pilot's stepper (`data-di-minus`, `data-di-plus`, `data-di-craft`); with `typed`,
  he TYPES the length in one box with the printed unit « خانة » (`data-di-workshop="typed"`, `data-di-in="plank"`; Enter
  or `data-di-craft` makes it), the card names the gaps (`data-di-gaps`, « القالب للهوّتين 32 و 44 »), and an empty box
  or a length outside 1 … the longest gap is answered by a sentence (`data-di-workshop-error`). **The BENCH** (`bench`:
  an inquiry spec, e.g. `{ kind: 'lists', rounds: [{ a: 32, b: 44 }], text }`): the button `data-di-bench-open`
  (`new` | `kept`) → `Game.openBench()` plays the experiment with the world's `Inquiry` in the forge's frame
  (`data-di-bench=<kind>`); `data-di-bench-back`, or finishing it, → `Game.closeBench(state)` back to the workshop. It
  covers the top bar, so its header draws the sound button and the ✕ again; leaving the lesson by that ✕ keeps the
  bench as it stands (`closeBench` first; 2026-11-19, lesson 5's walk). What
  he did STAYS: the experiment's state per segment id in `flags.benches` (saved with the world; `Game.benchKept(i)`),
  given back to the screen as `spec.from` — reopened, it shows his lists, not an empty bench (`lists`, `ladder` in the
  modes `subtract`, `divide` and `both` read `spec.from` / `spec.onState`; a `ladder` bench is `plain`: its rows only). The bench gives facts; it never says which plank to make. Test:
  `divisorIsles/workshop.render.test.jsx`.

First used by lesson 4 `qasim-mushtarak-akbar` (keys 1 and 2: one choice of planks for two gaps; then planks that all
fill both, and a purse that only the longest pays). NOT yet unit-tested: the mechanic lives in the 3D runtime
(`Game.js`), which only the walks play.

## 2ter. No scrolling anywhere (owner rule; restated 2026-11-15: « the student must never scroll »)

Nothing in the game world scrolls — not the page, not a card, not a panel — and nothing is cut.

1. **Show less first.** A panel that risks being tall shows less: while training, the card's head steps back; once an exam
   answer is final, the input form is replaced by ONE line (the question and what was answered) so the correction and the
   shortcut have the room; an earlier step is read in place of the current one, not under it.
2. **`Fit` guarantees the rest** (`Fit.jsx`; it remembers the scale that overflowed and never grows back past it — a text in
   columns re-wraps when scaled and would otherwise loop for ever): every panel puts its content in this box — the pop-up cards, the practice hub, the
   model sheet, the body of a knowledge card, the bottom panel of a case. It never scrolls; when the content is taller than its
   room it is scaled down just enough, and grows back when there is room. It is the LAST resort: a panel whose content is scaled
   below ×0.8 is a panel to redesign (the walks print those places).
3. **Checked at every screenshot of the three walks** (`noScroll` in `e2e/gameworld-*.mjs`): nothing can scroll, no fitted box cuts
   its content, no panel leaves the screen, the page is not taller than the window.

## 2sexies. « مصهر القاعدة » — the rule forge (2026-11-18; all four rules since 2026-11-17 of the rollout; NOT validated)

Owner, 2026-11-18: the method says the student discovers, touches, observes « until concluding the maths rule » — « how are we
giving him the chance to do that? »; the earlier answer (a space where he writes the rule after the manipulation) cannot tell
him whether his rule is right, and « it must be integrated in the game of the lesson, inside, not as a separate lab or game ».

On island D the game used to ask one multiple-choice question, then a tablet TOLD the rule. Now **the student defends his rule,
and the island's mirror judges it with bridges** (screen `kit/RuleForge.jsx`, frame `kit/forge.js`, overlay
`{ type: 'forge', key }`). The table below is the FIRST forge; the three others follow the same six steps (« The four forges »).
A forge with no `inquiry` whose `predictCases` returns no case — its evidence came from the WORLD, which held the
predictions (§2ter-1 « A situation lived on the islands ») — opens directly on ② its tiles, and its steps shown are
« اكتب قاعدتك → المرآة تختبرها → اختم » (`kit/RuleForge.jsx`, since 2026-11-19):

| Step | What happens | Never |
|---|---|---|
| The evidence | « سجلّ عبورك »: every bridge he fired on the way (`Game.logBridge`, saved) — the last five of his own, then those the mirror builds in front of him (marked 🪞), eight lines, each a small drawn bridge | a line he did not see |
| ① « تنبّأ » | bridges he has NOT built: « will it hold? ». The mirror builds it plank by plank and writes its division. **Three right in a row = the rule is in his head** (at most six are asked; a trap of two even numbers that crumbles comes second) | « wrong »: a missed prediction is « توقّعك لم يصب هذه المرّة », and what the bridge did is a fact, in amber |
| ② « اكتب قاعدتك » | « يثبت الجسر عندما: [ماذا أقرأ؟] [كيف يجب أن يكون؟] » — two tiles among four and four: sixteen rules can be written, ONE holds | an empty box to write in |
| ③ « المرآة تختبرها » | his rule is run on his OWN evidence, line by line; the first bridge that contradicts it stops it: « قاعدتك تقول إنّ جسر 15 باللوح 3 ينهار — لكنّك رأيته يثبت », with his rule applied to that bridge in words | the platform's opinion: the verdict is a bridge |
| The attack | a NEW gap. A false rule that survived the evidence: the smallest gap where it fails, which he SEES fall. The right rule: two hard gaps (two even numbers that crumble, an odd plank that holds). He first says what HIS rule predicts | a rule sealed without having been attacked |
| ④ « اختم مفتاحك » | the rule that survives is his key; he may say it in his own words (optional); then one gap too long to count (about 100 cells): the division typed, and the rule decides | counting cells |
| The name | the tablet opens with « مفتاح صنعتَه أنت »: HIS rule and his words first, then « وهذا اسمها في الرياضيات » — the official wording and the word « قاسم » | the name before the idea |

- **A rule is two tiles `{ q, c }`** — a quantity read on the gap and the plank (`QUANTITIES`: the remainder, the quotient, the
  plank, the gap) and a condition on it (`CONDITIONS`: equals 0, is even, is smaller than the plank, is greater than 1) — so it can
  be EVALUATED on any bridge: that is what lets the game test it and look for the case that breaks it (`runOnEvidence`,
  `attacks`). The false rules are the ones students really hold: « the plank is even », « the remainder is smaller than the
  plank » (true of every division, so it says every bridge holds).
- **The robot helps without giving the rule** (« ساعدني يا زيرو », three nudges, `nudge`): two of his own bridges over the same
  gap to compare; two bridges built in the mirror, the same plank on a gap and on the next one; a choice of two rules that he
  must still test.
- **How the rule was found is kept** (`Game.sealRule` → `rules[<key>]` in the save): the tiles, his words, how many rules he
  tested, the nudges and the level they give (`alone` / `nudged` / `guided`), his predictions. Browser only for now: a teacher
  does not see it yet.
- **It cannot be skipped**: a forge left unfinished opens again at the next « واصل » (`Game.start`). The 3D world is not drawn
  behind it.
- Check: `divisorIsles/ruleForge.test.js` (the law of the world: exactly one of the sixteen rules agrees with every bridge;
  the evidence, the predictions, the nudges) and the lesson's `world/forges.test.js` (29 tests — for EACH of the four
  forges: sixteen rules can be written and one holds; every false rule is contradicted by the evidence or by an attack; the
  right rule survives two attacks; the predictions alternate; every sentence is worded; the last step refuses any wrong
  box). The story walk `gameworld-divisor-isles.mjs` (104 checks) crosses the four forges: in each a false rule is refuted
  in front of him, the right one is attacked, the last step is typed wrong then right, and the tablet shows HIS rule.

### The four forges of the pilot — no rule of the lesson is told

| Key | Where | The tiles (a rule = one per slot) | A false rule students hold | Its evidence | The last step, typed in its own shape |
|---|---|---|---|---|---|
| 🔑 `qasim-baqi` | island « المرايا » | what I read × how it must be (4 × 4) | « the plank is even » | his own crossing | the Euclidean division of a gap of about 100 cells, then « holds / crumbles » |
| 🗝️ `qasim-jidaa` | island E, after the storm | what I read × how it must be (4 × 4): « the gap = the plank × a natural number » | « the gap = the plank + a number » (true of every bridge) | his own crossing; the mirror writes a PRODUCT, never a remainder | `b × [k] = [p]`: the biggest product of the plank's table that does not pass the gap, then the verdict |
| 🗣️ `siyagh-mutakafia` | the guardians, once the four sentences are right | one slot per phrasing (4 × 2): is the number written first the plank or the gap? | « the plank is always written first » | the guardians' four sentences; a case is a SENTENCE — asked alone, then the mirror builds the bridge it means | one fact (`96 = 8 × 12`) written in the four sentences, eight boxes |
| ⭐ `wahid-wa-nafsuh` | the stone of island H, once the gap of 7 is understood | the shortest plank that always holds × the longest (4 × 4) | « a plank of 2 always holds », « twice the gap » (a multiple, not a divisor) | the mirror builds the two planks of HIS rule over the gaps he crossed | a gap never seen (143, 187…): the two planks that surely hold, no calculation |

**How a forge is made** (binding for the next lessons):

- **The kit runs it, the lesson describes it.** `kit/forge.js` documents the description: `key`, `slots` (the tiles),
  `says(rule, case)`, `isTheRule`, `ruleText`, `explain`, `caseId`, `evidence(rows)`, optional `tests(rule, rows)` (a rule
  that builds its own cases — the fourth forge), `predictCases`, `attacks`, `nudge`, `use` (`make`, `lines` of tokens with
  `slot()`, optional `verdict`, `check` → `'ok'` or a key of `text.use`), `logs`, `text`. A case always carries `held`:
  what the world really does with it. The lesson's forges are `world/forges.js` → `lesson.forges[key]`.
- **The world says what a case is and draws it.** Here a case is a bridge: `divisorIsles/ruleForge.js` (`outcome`,
  `holds`, `evidence`, the pool `SMALL`, `attackOn`, `casesOfKinds`, `nudgeWith`, the shared wording `BRIDGE_TEXT`, and
  the law of the world as a forge, `remainderForge(key)`) and `divisorIsles/forgeParts.jsx` (`FORGE_PARTS`: the bridge in
  the mirror, the line of evidence, the beats of a build). The class board still reads the remainder tiles from there.
- **The story opens it and goes on after it.** `Game.openForge(key)`; `sealRule(key, record)` opens the tablet, then
  `afterKey[key]` runs what the story does next; `pendingForge()` reopens a forge left unfinished. A forge cannot be
  closed.
- **Exactly ONE rule holds, and every other rule is refuted in front of the student.** Write the test first
  (`forges.test.js` is the model): every rule the tiles allow is run on the story's crossing and attacked.
- **A sentence is never shown with its answer.** A case that is a sentence is asked alone; its bridge is built after the
  answer (`forgeParts › Mirror`).
- **Formulas go through `MathText`.** An equality inside a sentence of a forge is written `$…$`; the screen renders the
  question, the attack, the last step and the rule applied to a case with it.
- **On a phone** the forge does not zoom itself (one scale): it has a compact layout in `kit/ruleForge.css`, and its list
  and its panel slide inside themselves.
- **12 px floor at every size** (2026-11-18 — not a phone-only rule): no visible text of the kit, the forge or the class
  board is under 12 px ON THE SCREEN (computed size × every CSS zoom). A small label is written
  `max(var(--di-min-font, 12px), <its size>)`; a frame that zooms itself below 1 sets `--di-min-font` to 12 px in its
  own units (the forge: `RuleForge › rf-fit`, 15 px at the 0.8 of 1024×768); a `<small>` with no size of its own is
  floored by `:where(.di-root) small` / `:where(.cs-root) small`. The knowledge map is NOT exempt (2026-11-19 — its labels
  were drawn at 10–11.5 px below 1101 px and under « تدرّب »): `KnowledgePage` sets `--di-page-floor` (12 px ÷ the page's
  zoom) on its zoomed box, the map divides it again by its own ×0.84 while « تدرّب » is open, and every text of the map
  (edge labels, a card's kind and title, the legend, the stars) is floored in `kit/styles/knowledge.css`; below 1101 px a
  card gives back the room with a smaller icon and padding. A `Fit` given a `floor` keeps 12 px while it shrinks: the exam sitting
  (§2quater) and, since 2026-11-19, every pop-up card of the world (`parts › Card` — a tablet with the student's own rule
  above a long list was shrunk to ×0.87 and its labels drawn at 11.4 px, lesson `qisma-iqlidiya-hasr`), the card panel of
  the knowledge page (`KnowledgePage › di-kpanel__body`, 2026-11-19 — a common mistake once uncovered, four parts, shrank
  to ×0.975 and its labels « الخطأ … مثال » were drawn at 11.7 px) and, in the sitting, a TABLE of the bank: drawn by
  `problems/ProblemTable` in a fixed `text-sm`, it is floored on the paper and its long headers wrap inside their column
  (`examSitting.css`): it never slides sideways in a frame of its own. The walks check it
  at every screenshot (`e2e/lib/walk.mjs`): `fontFloor` is ON by default since 2026-11-19 (it was opt-in, at 11.5 px), the
  threshold is 12 px less only the rounding a zoom leaves (`FLOOR_PX = 11.95`), the knowledge map is no longer exempt, and a
  walk that switches it off (`fontFloor: false`) must say why in a comment; walks with their own `shot` call `tinyText(page)`, which does not measure a text hidden
  UNDER a layer that fills the window (a lab or a world opened over a page: the point at its middle belongs to that layer).
- **The panel fits under the mirror** (2026-11-19: the « اختبر قاعدتي » button ran below the window at 720 units of height —
  1366×768, 1840×900 — in builds with three slots or with long two-line tiles plus the robot's experiment). The mirror row
  is `minmax(min-content, 15.5rem)`: it gives way, down to what it holds, when the panel needs the room (never cut,
  never pushing the panel out). Three slots are laid side by side (`.rf-tiles[data-rf-slots='3']`, like four and five);
  a tile wraps on a compact line (1.45) and the build panel keeps tighter gaps; while he builds, `RuleForge` passes
  `tight` to the world's `Mirror` (`parts.Mirror({ c, stage, fast, tight })`) — the bridge world then leaves out the empty
  band above a built bridge (same scale, less height: `divisorIsles/forgeParts.jsx`, `.rf-bridge.is-tight`).
- **A case that is a PAIR of gaps is drawn as two bridges** (2026-11-19, lesson 4's keys 1 and 2: the question named
  two gaps and one plank, the mirror drew one bridge). A case may carry `c.pair = { a, b, d, need? }`
  (`divisorIsles/forgeParts.jsx › PairMirror`): gap a above gap b at one scale, the plank laid on both at once, each
  bridge with its own held / fell look and what is left in amber (`data-rf-pair="A:B:d"`, `data-rf-pair-row`,
  `data-rf-fills`); its log line names both gaps and the plank on ONE line, with a mini of two bars and the lesson's
  tag (or `need` planks). A case that is neither a pair nor a sharing is a single bridge, as before.
- **A case that is a SHARING is drawn as a sharing, never as a bridge** (2026-11-19: the vases' forge of
  `qasim-mushtarak-akbar` drew « 36 وردة و 60 زنبقة في 12 مزهرية » as « لوح 12 » over « 60 خانة », and its log read
  « 56 لوح 5 »). A case of this world may carry `deal` (`divisorIsles/forgeParts.jsx`):
  `c.deal = { a: { n, item }, b: { n, item }, k, lot, claim? }` — the two collections (how many, and the kind of item: a
  glyph of `dealParts.jsx › GLYPHS`, rose / lily / date / fig), the number of identical lots `k` and their kind `lot`
  (`vase`, `basket`: `dealParts.jsx › LOTS`), and `claim: [x, y]` when the case asks « does each lot hold x and y? ».
  Whether everything is shared is `fits` (or `held`), as for a bridge. The `Mirror` then draws it with the SAME pieces as
  the experiment `deal` (`dealParts.jsx`: `GlyphDefs`, `Pile`, `Lot`, `LotShape` — `InquiryDeal.jsx` draws with them too):
  a 1000 × 230 scene in the bridge's box (`.rf-deal`, 46rem × 10.6rem, also `tight`), the table on top with its two piles
  and their counts and, between them, the kind of lot and its number; the k lots under it. `ask`: the collections and
  the EMPTY lots (a claim drawn faint in them — or once over them, numbers and drawings only, when its items would be too
  small); `build`: the world deals, one round per beat (`beats` = the rounds of the deal); `done`: what is left stays on
  the table, set apart in amber and blinking, or the lots glow when nothing is left. Up to two collections of 60 and 12
  lots stay legible (a pile of 60 is three rows of twenty; the numbers are drawn at 17 px or more at 1024 × 768). Its
  `Line` names no plank: the two counts with their item glyphs, the case's `tag`, and a mini of k small lots plus an amber
  block when something is left. Hooks: `data-rf-deal="nA:nB:k"`, `data-rf-stage`, `data-iq-lot` / `data-iq-holds`,
  `data-iq-pile` / `data-iq-count`, `data-rf-claim`. A case with no `deal` is a bridge, drawn as before. Tested:
  `divisorIsles/forgeParts.render.test.jsx`. A case drawn as a bridge that is NOT about a plank (lesson 6's ⏱️: a pair of
  numbers and their two notebooks) carries `head` (« 1003 و 34 »): its log line names it so, never « a لوح b » (A10).
- **A list never starts a line with its comma** (2026-11-19: the rule card of lesson 4's race wrapped « … 9 ، 6 ، 3 ، 2 ، 1 »
  and left « ، 18 » alone on the next line). A list of numbers is joined with a no-break space BEFORE each « ، » and a
  normal space after it (`'\u00a0، '`), so a line can break only after a comma: `world/math.js › listAr` of
  `qasim-mushtarak-akbar`, `divisorIsles/strings.js` (the divisors listed after a mistake), and the launch kit's
  `LIST_SEP`. A test or a walk that reads such a list compares it with the same separator, or splits on « ، » and trims.
- **A fact under a verdict** (`.rf-fb > span`, the child only): a formula inside it keeps KaTeX's inline boxes (a block on
  every span had broken « 72 = 3 × 24 » into a column of atoms).
- **A typed remainder box holds the slip it exists to catch**: `slot('r', …, w)` takes as many digits as the remainder
  written one plank too few (`r + b`) — a box of 2 digits read « 126 » as « 12 » and answered « the sum is wrong » instead
  of « too big » (`qisma-iqlidiya-baqi`, 2750 ÷ 64). Tested in that lesson's `forges.test.js`.
- **The evidence fits its column** (2026-11-19: at 1840×900, in the last step and the sealed step of the forges whose cases
  are SENTENCES — lessons `qisma-iqlidiya-baqi`, `qisma-iqlidiya-hasr` — eight long sentences ran below the window). The log
  never scrolls and is never cut: (1) a sentence row holds two lines at most (`.rf-line--sentence > span`, line clamp; its
  verdict stays beside it; the whole sentence is the row's `title`); (2) the list takes only the room its column has left
  (`.rf-log ul { flex: 1 1 0; overflow: hidden }`) and `RuleForge` measures it before paint: while it is taller than that
  room, the OLDEST row leaves, until the rest fit (per layout: phase, number of rows, window size, zoom — a new layout starts
  from all rows again). The row that matters always stays: the newest — or, while the mirror marks the rows, the row it is
  marking or the one that refuted his rule — while the mirror tests, EVERY row he made is offered to that window, not only
  the last `EVIDENCE_MAX` (2026-11-19: a summit search of 15 planks was refuted by its first plank, which had left). Only fewer rows are shown, never another student's or invented evidence; the
  rows that left are still in the forge's evidence (the test runs on all of them). A phone held sideways is unchanged (its
  list slides inside itself).
- **A forge whose experiment WRITES the rule (`inquiry.writes`) holds no false tile** (2026-11-19, `khawass-qawasim`):
  `RuleForge` skips the tiles there (`phases` = « استكشف → المرآة تختبرها → اختم ») and the world's screen hands over only
  an ACCEPTED claim or a complete proof, so a false tile, a help on tiles or a test of a false rule on his rows could never
  be shown. Such a forge keeps ONE option per slot (the rule — its sentence for the tablet), the two attacks, the seal and
  the last step; its false rules are refuted where he writes them (the `peel` table refuses a claim that takes in an
  intruder, a false `letters` card is answered by numbers), and the lesson's `inquiries.test.js` enumerates them.
- **After an experiment no prediction is asked**: the experiment held them. `RuleForge` still calls `forge.predictCases`
  for every forge (`kit/RuleForge.jsx`, at mount), so a forge that opens on an experiment returns `[]`
  (`khawass-qawasim › noPredictions`, its four forges) and leaves the words of that step (`text.ask`, `fact`, `next`)
  unwritten. (Other v2 lessons still return cases there; on a forge that opens on an experiment the kit has no
  « تنبّأ » phase, so they are computed and never shown.)
- **Known limit of the kit — the last step (`use`) asks ONE verdict**: besides the typed boxes of `use.lines`, `use.verdict`
  is a single yes / no (`data-rf-use-verdict`, `RuleForge.jsx`), and `check(case, values, verdict)` receives one boolean. A
  last step that needs two separate judgements (or a choice among more than two) cannot be written yet: the lesson
  folds it into boxes, or the kit must grow first.
- **A fraction in the last step is typed in its own shape** (2026-11-20, lesson 8 `ikhtizal-kasr` first): a token
  `{ frac: { n, d } }` of a `use` line, each part a box `slot(…)` or a printed number — built with
  `authoring/forgeBlocks.js › fractionBox(n, d, { w, nw, dw })` (typed) and `givenFraction(n, d)` (printed; never
  `'66/78'` as a string token). `kit/RuleForge.jsx › UseLines` draws it stacked with the trainer's classes
  (`span.di-frac.rf-frac`, `dir="ltr"`, `data-rf-frac="n/d"` — the box names or the numbers —, `di-frac--typed` when it
  holds boxes; `span.di-frac__bar`); its boxes keep `data-rf-use=<name>` and `aria-label` (« البسط » / « المقام »),
  numerator first, no label under them. `kit/ruleForge.css` only sizes them (2.6rem one-line step, 2.1rem on a step of
  several lines) and centres a line that holds one. The boxes of a line are `forgeBlocks.js › boxesOf(tokens)` (a
  fraction gives its numerator's box, then its denominator's) — the frame reads them so. Tests:
  `kit/ruleForgeFrac.render.test.jsx`. NOT yet: `authoring/test/suites.js › describeForges` reads a line's boxes as its
  object tokens — a lesson with fractions hands the suite its lines flattened (`ikhtizal-kasr/world/forges.test.js ›
  flat`) until the suite reads `boxesOf`; `describeLimits` counts a fraction as ONE object of its line.
- **A case that is a FRACTION** (lesson 8): drawn as a `pair` — `{ a: the whole, b: its lit stretch, d: the plank laid
  on both }` — with its own `head` (an isolated LTR run, « 66/78 → 33/39 »): `forgeParts.jsx › Line` then names the
  pair by that head, never « 78 و 66 لوح 6 ».
- NOT done: the class board (`LessonBoard`) forges only the first rule with the class; the three others are still asked
  and proved there. How a rule was found is kept in the browser only.

### « استكشف » — a rule found by an experiment of ITS OWN nature (owner, 2026-11-17)

> « it is stacked to the same analogy used on the lesson 1 but each rule has its own nature and way of discovery, the
> student get lost at some point and he suddenly get told the rule » — then: « by experiencing, touching, step by step:
> the student is never told the rule, he gets the rule himself ».

The mirror with its tiles (predict → write → test) fits a rule that is ONE condition on a case the student has built
(the remainder, the product). It does not fit every rule: asked in the same mirror, « where does the search stop? » and
« what to read instead of dividing? » were abstract questions, and their help ended on a choice between two written
rules — the rule was told. **A rule whose nature is a search, a pattern or a procedure is FOUND FIRST, by an experiment
made for it.** The forge then opens on that experiment:

- **`forge.inquiry`** (the lesson's data: its numbers and its words) and **`parts.Inquiry`** (the world's screen) make
  the first phase of `RuleForge` — « استكشف ». No prediction is asked and no tile is offered before it is over.
- **`forge.fromInquiry(result)`** says what the experiment gives the mirror: `rows` — the evidence is what HE did in it —
  and, when the experiment itself wrote the rule (`inquiry.writes`), `rule`: what he claimed and the world accepted IS his
  rule, the tiles are skipped and the mirror ATTACKS it at once. The steps shown are then « استكشف → المرآة تختبرها →
  اختم »; otherwise « استكشف → اكتب قاعدتك → المرآة تختبرها → اختم ». The predictions are not asked again: the experiment
  held them.
- **The help of such a forge never narrows to a choice of two rules**: its third help is one more pair of cases to look at.
- **An experiment says facts, never the rule**: every sentence tells what the strip or the chart has just done (a test
  of the lesson forbids the words of the rule in them); a miss is answered by a fact (« its partner 4 was tried before
  it »), never by « wrong »; the student predicts before the world shows; what he found stays on screen in his words.
- **It starts from what he has just done**: the gap of the island he crossed, the question the stone asked. A question
  the student cannot answer yet OPENS the search — it is never asked as a quiz before the rule exists — and comes back as
  the last step of the forge (`use`).

**Every key of `qawasim-adad-tabii` opens on an experiment — four keys, four kinds** (owner, the same day: « not only
this one … all the steps of rule discovery »); a test of the lesson fails if two of its keys share a kind.

The twenty-two kinds of `divisorIsles/` (logic `inquiry.js`; screens `Inquiry.jsx` — strip and chart —, `InquiryMoves.jsx`
— wall and saw —, `InquiryCombine.jsx` — join and stack —, `InquiryProof.jsx` — peel and letters —,
`InquiryDivision.jsx` — groups, rebuild, estimate, bracket —, `InquiryGcd.jsx` — common, ladder, nest —,
`InquiryCycle.jsx` — cycle, with its own logic `cycle.js` and styles `inquiryCycle.css`, added on 2026-11-19 for the
second key of `qisma-iqlidiya-baqi` —, and `InquirySummit.jsx` — summit — and `InquiryDeal.jsx` — deal —, each with its
own logic (`summit.js`, `deal.js`) and styles (`inquirySummit.css`, `inquiryDeal.css`), added on 2026-11-19 for 4AM
unit 1, batch 2 (`docs/reports/BATCH_2_DESIGN.md` §2), and `InquiryLists.jsx` — lists — with `lists.js` and
`inquiryLists.css`, added the same day for lesson 5 `tayin-pgcd`, and `InquirySort.jsx` — sort — with `sort.js` and
`inquirySort.css`, added the same day for lessons 7 and 8, and `InquiryMeasure.jsx` — measure — and `InquiryPart.jsx`
— part — with `measure.js`, `part.js`, `inquiryMeasure.css`, `inquiryPart.css`, added the same day for lesson 8
`ikhtizal-kasr`; what every screen shares — the walks' dev hooks `FAST` / `expose`, the scene's frame
`X0` / `SPAN`, the timers `useLater`, the « yes / no » of a prediction — is ONE copy in `inquiryParts.jsx` (2026-11-19);
styles `inquiry.css`; join … letters were added on 2026-11-18 for `khawass-qawasim`, groups … bracket the same day for the
Euclidean division of 1AM `qisma-iqlidiya-baqi` and 2AM `qisma-iqlidiya-hasr`, common … nest the same day for the
greatest common divisor of 4AM unit 1 (PGCD, Euclid's algorithms, coprime numbers, reducing fractions). 1AM
`qawaid-qabiliyat-qisma` (2026-11-19) plays keys 1 and 2 on `chart` — key 1 with the link `equals` (planks 5 then 2),
key 2 with `divides` (planks 9 then 3) — and key 3 on `join`, mode `sum`: plank 4 on a gap of whole hundreds GLUED to a
short gap (100 + 28, 100 + 26, 300 + 28, 200 + 26, 200 + 12, 300 + 22; hundreds stop at 300, the scale of the `join`
drawing); its `inquiries.test.js` fails if two keys share a (kind, mode) — see the note under the `chart` row):

| Kind | The rule it finds | What the student does |
|---|---|---|
| `turn` | a bridge that holds gives a second one (a = d × e, read both ways) | lifts the planks of HIS first bridge one by one into a WALL (one row per plank), then takes the wall down column by column: the same cells are the second bridge. Then he says what the columns will give BEFORE the wall is turned: a bridge that held, a bridge that fell (its wall is ragged — unequal columns, no plank), a square wall (the plank itself), and a bridge that is not drawn. Then he writes his rule with the tiles. |
| `cut` | the plank fills the gap when the count of planks is a natural number | on the gap no mould filled, his hand SLIDES the length of the plank: the planks are laid again at once, with the piece that would have to be sawn, and the count written as the quotient; the lengths he tried make a table. He says how many lengths need no cut (answered with the ones HE found). Then he judges planks from the quotient ALONE, before the saw lays them. Then he writes his rule with the tiles. |
| `pairs` | where the search for all the planks of a gap stops | tries the planks of ONE gap in order; a plank and its partner (gap ÷ plank, whole or not) walk toward each other on a strip and CROSS; past the crossing every partner is a plank already tried. First gap: after the crossing, « can a new plank still appear? » — on « maybe » the world tries every plank up to the gap in front of him. Next gaps: he says the last plank BEFORE trying; the squares join the table from the second gap; on the last gap only the planks and their squares are shown before any trial. Then he writes his rule with the tiles. |
| `chart` | what to read in a number instead of dividing | tests ONE plank on the gaps of a chart (a row per tens digit, a column per units digit), one after the other, then lets the world finish; chooses a LENS (units digit, tens digit, sum of the digits) and what he claims of it (its values, or the number it is divisible by): the chart shows the cells that are not green his claim takes in and counts the green cells it leaves out; a claim that holds is tried on the next hundred — he tests its first gaps HIMSELF, one after the other with their divisions written (`spec.nextManual`, default 3; the lead is `text.confirmTest(b, from, n)`, or the world's own sentence when the lesson gives none), his claim outlined on every gap tested, then the world finishes the hundred (`text.confirming`) — the hundred is never only watched. Plank 4, which no single digit and no sum separates, is offered a fourth lens: the number the tens and the units write (`last2`) — on the first chart it is the gap itself, and the next hundred is where it is tried. Today only `qawasim-adad-tabii` (4AM) offers that lens; `qawaid-qabiliyat-qisma` (1AM) finds plank 4's reading on `join` instead (note below the table). |
| `join` | a common divisor of a and b divides a + b and a − b | sees two bridges with plank d (filled, or a piece left: a FACT, with `a = d × q + r` written under each); says BEFORE whether d will still fill the gap made by GLUING them (`sum`) or by cutting the shorter off the longer (`diff`); the world slides the second strip after the first (or over its end, and the cut part falls), lays the planks again and writes `a ± b = v` and `v = d × q + r`. A round where neither gap is filled and the glued one holds anyway (22 + 20 with 7) is shown, never hidden. What he found stays in a list. |
| `stack` | a divisor of a number divides every multiple of it | sees the gap `base` with plank d; for each k says BEFORE whether d fills k copies glued end to end; the copies travel from the gap into a row (2 and 3 drawn, up to 12 packed, more only as a number line with « k × base »), the planks are laid and the calculation written (`k × base = total`, `total = d × q + r`, and `k × (base ÷ d)` planks when d fills the gap). An optional second round has a gap the plank does NOT fill where some copies are filled anyway (14 on 21: two copies) — a fact, never a verdict. |
| `peel` | a common divisor of a and b divides the remainder of a ÷ b | presses once: the world lays planks of b on the gap a again and again (`a − b = …` written at each step, a sound per plank) down to the piece r < b, and writes `a = b × q + r`. For each plank of the round the table says whether it fills a and whether it fills b (with both divisions written); he says whether it fills the PIECE before the world lays it there. The table of every round stays. Then he BUILDS his claim from the table's columns — « if the plank [fills a] [and / or] [fills b], it fills the piece »: the table outlines the rows his claim takes in, in orange those whose plank does not fill the piece; the claim that takes in no such row (and at least one row) is his rule (`writes: true`). |
| `letters` | how to prove an « if … then … » for every number (a procedure) | checks the statement on numbers he is given (`a + b = d × □`, he presses □); the world changes the numbers and puts his last line against them (it does not carry over), then hides a number (nothing to compute). Then he assembles the proof from CARDS into numbered slots: a false card is answered by a sample where its numbers do not match (« with d = 3, a = 12, b = 6 this line gives 24, but a + b is 18 »), a card placed too early by what it uses that no line above has written (« this line needs k′ »). The proof he built is the rule (`writes: true`). |
| `groups` | lay as many full planks as fit; the quotient counts them; stop when what is left is shorter than a plank (a SEARCH) | lays planks of b on a gap of a ONE AT A TIME and says BEFORE each one « will one more plank fit? » (yes / no); the world lays it (`plank` sound, `a − b × k = left` written, the cells left labelled on the strip) or shows it hanging past the dashed end of the gap (`hit`, `b > left` written). A round may have b > a (no plank fits), an exact fit (the plank that does not fit hangs over 0 cells), or a big gap (a ≥ 10 b: after `manual` predictions « أكمل » lets the world lay the rest quickly, `sweep` per plank). Then he types how many planks and how many cells are left (two boxes); a miss is answered by a fact and the planks get their numbers; his answers stay in the list. |
| `rebuild` | a = b × q + r — the gap is rebuilt from its planks and its piece (a PATTERN read backwards) | sees q planks of b and a piece of r cells lying on a gap hidden under a CLOTH; types the gap's length in its template « b × q + r = □ » (a round may be `bare`: the box alone); the cloth is lifted (`sweep`), the gap and `b × q + r = a` are shown. A round with r ≥ b: after the lift the world lays the planks that fit in the piece (`plank` each, drawn green) and writes `a = b × q′ + r′` — a fact: that piece was not left over. |
| `estimate` | the technique for a big gap and a long plank: estimate the tens of planks, then the units (hundreds first when there are that many) (a PROCEDURE) | the whole gap is a bar; under it a RULER of the current step from 0 to 10 marks of b × 10^place (×10, ×20 … ×90, then ×1 … ×9), with what is left as a gold flag; he presses the biggest mark that does not pass the flag (chips 0 … 9 × 10^place). A mark past the flag, or one with room for the next mark, is answered by the fact (`fail`); the right one lays that block of planks (`sweep`, `plank`) and writes `from − b × count = left`. The steps are the kit's long division (`kit/longDivision.js`), so a 0 in the quotient is a step too. At the end `a = b × q + r` (`gate`). **Blind** (`blind: true` on the spec or on one round — 2026-11-19, for a three-digit plank whose multiples he does not know): the marks show their count only (« ×10 » … « ×1 » …), never the product, and the gold flag stands APART at the ruler's right end (placed on the ruler it would show which mark passes it); he presses a mark, THEN the world writes `b × count = value` against what is left (`value > left` — past the flag; `value + unit = next ≤ left` — room for one more), and every product he revealed stays under its mark until the step is laid (`data-iq-shown`). Every mark he pressed, refused ones included, is in the result's `guesses`. Without `blind` the ruler prints every product, as before. **Used by** 1AM `qisma-iqlidiya-baqi` (two-digit planks, sighted) and 2AM `qisma-iqlidiya-hasr` key 1 (`ESTIMATE_INQUIRY`: `blind: true`, THREE-digit planks 208, 248, 365 on the gap 4576 he has just crossed, then 2241 ÷ 365 and 22152 ÷ 208; the first round — the plank that filled his gap — is sighted, `blind: false`). The mirror of that forge draws what is left cell by cell up to `DRAW_MAX = 2600` cells (`world/forges.js`): its speed with that many cells has NOT been measured. |
| `bracket` | a ÷ b lies between two consecutive natural numbers — the planks that are full and the planks that are needed; it IS a natural number exactly when nothing is left (a BRACKETING) | a number line of the multiples of b (eight steps around the flag, « … » and 0 at the left when the window does not start at 0; the mark below the flag stands 1 to 5 steps from the window's start, from (a + b) mod 5, so the flag's place changes with the round) with the gap a as a gold flag; he types the two numbers in the template « b × □ ≤ a < b × □ »; a miss is answered by the two products he made; the right pair lights the two marks (`b×lo`, `b×hi`) and the step between them, then he says whether the flag stands BETWEEN two marks or ON one; the world writes `a ÷ b` (`quotientTex`, computed on integers: a natural number, an exact decimal written exactly — 23 ÷ 5 = 4,6 —, or two places and « … » when it goes on) and `a = b × q + r`. Rounds include flags ON a mark (a multiple of b): the template still accepts exactly one pair (the mark the flag stands on, and the next), and once he has answered, that mark takes the flag's gold (`data-iq-onmark`) beside `a = b × q + 0`. |
| `common` | the planks that hold BOTH gaps; the longest of them (the greatest common divisor) (a SEARCH over two gaps) | two strips, gap a above gap b; he TAKES each candidate plank from the tray and says BEFORE, twice, whether it holds a and whether it holds b (yes / no each, then « ضع »); the world lays it on both strips (`plank`), writes both divisions (`a = d × q + r`, rest green when 0) and the plank goes to its shelf: « a only », « b only », « both » (a fourth shelf « neither » appears only when a candidate holds neither). When the tray is empty he marks the longest plank of « both » and types how many planks « both » holds; a miss is answered by the fact (`sayMiss`) and he tries again. Rounds may have only the plank 1 in common, b a multiple of a, a = b. **`crown: false`** (spec or round, 2026-11-19): the experiment ends when the tray is empty and he has typed how many planks « both » holds — the longest is NOT asked, no chip of a shelf can be marked and nothing names or outlines the longest (the longest is its own search, `summit`; used where a lesson keeps the shelves and the next lesson searches the longest). Absent = the behaviour above. **Mode `witness`** (spec `mode: 'witness'`, 2026-11-19 — « ONE witness is enough »): the tray is the planks the lesson passes (the divisibility rules' 2, 3, 5, 9, 10); he takes and predicts as above, but the round ENDS as soon as ONE plank stands on the shelf « both »: the planks left stay in the tray (disabled) and the world asks « is one enough? » (yes / no — his answer is kept; the fact shown either way is that the round is over with one plank, no rule sentence). A tray where no plank fills both (85 and 119: their common plank 17 is not among the rules' planks) ends when the tray is empty, on the fact « no plank of this tray fills both » only — the kit never says the gaps share no plank, never names 17. The longest is never asked. **A gap of 0 cells** (lesson 5, « direct results »: `{ a: 27, b: 0 }`) is allowed in `common` (one gap only, never both): it is drawn as an empty dashed mark with its « 0 », no plank lies on it, every plank « fills » it and the calculation reads `0 = d × 0 + 0`; twins (27 ; 27) and (27 ; 1) play as any pair. |
| `ladder` | a pair of gaps can be replaced by a simpler pair that keeps the same common planks, until one gap is gone; the last value that is not 0 is the longest common plank (Euclid — a PROCEDURE, `mode: 'subtract'` or `'divide'`) | a ladder of rows (left to right: its number, a bar of the gap a with the plank(s) b laid and the piece left in amber, the pair `(a ; b)` and its calculation `a − b = …` or `a = b × q + r`, then the planks that hold both gaps of that row with a ✓ — the same list on every row, a FACT). He types the NEXT pair `( □ ; □ )` (either order) for the first `manual` rows; the world writes the row anyway and answers by the fact. Then he types how many rows the ladder will have; the world finishes it (`sweep` per row, `gate` at the end) and the last value that is not 0 is lit gold. More than six rows: the first, one folded line « … », the last four. The result keeps the number of rows, so a lesson can compare the two modes on the same pair. **Mode `fold`** (2026-11-19 — « the remainder keeps the common planks »): the world writes the subtraction rows that take away the SAME gap (962 − 296 = 666, 666 − 296 = 370, 370 − 296 = 74), then he folds them into one line in its template `962 = 296 × □ + □`; a wrong fold is answered by the rows themselves (each row of the run counted 1×, 2×, 3×, what is left amber) and he folds again; the run becomes one folded line (its rows named « 1–3 », its bar, `a = b × q + r`, the ✓ list); after his `folds` runs the world finishes the ladder in folded lines and the last value that is not 0 is lit gold. **Mode `both`** (« which algorithm is faster »): the two ladders of the SAME pair side by side, subtractions and divisions; BEFORE they run he says which will be shorter — or « the same » — and by how many rows; the world runs both in step (a row of each per beat) and the counts stand under them. The drawing is bars only, all rows of both ladders sharing one height that shrinks with the longer ladder (1003 and 34: 31 rows against 2 on one screen, never scrolled); under each ladder its newest row as a formula. The same length happens only for twin gaps (a = b: one row each) — the logic's test sweeps it. |
| `nest` | the common planks of two gaps are exactly the planks (divisors) of their longest common plank (a SET EQUALITY) | the world gives a, b, g (`given`, a formula line of the lesson) and the chips of the planks of g, and draws three strips a, b, g; for each probe (common ones, ones holding a single gap, longer than g, dividing g) he says, looking at g only, whether it holds BOTH gaps; the world lays it on the three strips (`plank`) and writes the three divisions; at the end the two lists — the planks of both gaps / the planks of g — stand side by side. **Mode `pair`** (2026-11-19 — « the difference keeps the common planks »): the third strip is replaced by a SECOND PAIR of gaps given by the spec ((b ; a − b) or (b ; r)): four strips on two pale bands; for each probe he says (yes / no, twice) whether it fills both gaps of the first pair and both of the second, then « ضع »; the world lays it on the four strips and writes the four divisions; at the end the planks of both gaps of each pair stand side by side (equal — a fact he sees; no sentence states it). |
| `cycle` | what a plank of b can leave on a gap: 0, 1, …, b − 1 — never b cells or more — and the most is b − 1 (a PATTERN) | ONE plank b and a gap that GROWS one cell at a time (a, a + 1, a + 2 …). The first gap of a round is shown as a fact (its planks, the cells left, `a = b × q + r`); before each new cell he says how many cells will be left (chips 0 … b + 1: « b » can be said); the world adds the cell and lays every plank that fits (`sweep`, pitched by the cells left — or `plank` where one more plank goes in) and writes the division. Under the strip a STAIRCASE keeps one column per gap he has seen — as many small cells as were left: it climbs to b − 1 and falls to 0 where a plank went in (a mark of the plank; what he had said stays beside it, struck through, when the strip did otherwise). Then PROBES — planks he has not laid: he types the most cells the plank will leave and says whether b cells will be left once, BOTH before the world moves; the world then grows the gap alone from a gap the plank fills, through the whole climb, the fall and one more cell, and the staircase answers. What he found stays in a list. |
| `summit` | the longest plank that fills both gaps is among the planks of the SHORTER gap: tried from the longest down, the first that fills the other gap is it, and the shorter ones need not be tried (a search for a MAXIMUM, with the reason to STOP) | two strips, gap a and gap b; when the round has a `start` (a plank he has just used that fills both) it lies on both strips with both divisions written. FREE TRIES (`free`, default 2): he TYPES any plank length (a box, 1 … the longer gap; any length is laid and answered); the world lays it on both strips and writes both divisions (rest green when 0); every plank laid stays as a mark on a LINE OF LENGTHS (1 … the shorter gap, a dashed tail up to the longer gap) coloured by what it did — both, a only, b only, neither; a try that fills both and is longer than the best so far becomes the best (ringed — a fact, no praise). Then ONE prediction (yes / no): can a plank that does NOT fill the shorter gap fill both? — answered by one of HIS tries when one fits, else by a plank the world lays (one that fills the longer gap only). THE DESCENT: the planks of the shorter gap appear as chips from the longest (its own length) down — laid right to left, the longest beside their label and on the same side as on the line of lengths; a mark standing on an end of the line (1, the shorter gap, the longer gap) carries no label of its own, the end writes its number — ; before each he says whether it fills the OTHER gap; the world lays it on both strips; the first that holds is crowned (gold chip, gold mark). Then « must the shorter planks still be tried? » (yes / no): on yes the world lays them all (`sweep`) — each shorter than the crown, a fact; on no, nothing more (not asked when the crown is 1). **Mode `first`** (per round): before the descent he types how many planks will be TRIED until one holds; he predicts the first plank only, the world finishes, and the count is shown against what he typed (one try exactly when the shorter gap's own length fills the longer). |
| `deal` | sharing two collections into identical lots with nothing left: the numbers of lots that work fill both numbers; the most lots is the longest of them (a SHARING read with common divisors) | two collections DRAWN on a table (roses and lilies, dates and figs — SVG glyphs of the kit, one per item, up to 60 a kind) and drawn lots (vases, baskets). He chooses the number of lots k (chips, default 2 … 12), says BEFORE (yes / no) whether everything will be shared with nothing left; the world DEALS both collections round by round (one item of each kind per lot and per round, a sound per round); what cannot be dealt stays on the table, set apart in amber; `nA = k × q + r` and `nB = k × q′ + r′` are written (rest green when 0). A TABLE keeps every try, one column per k: lots · of the first kind per lot · of the second per lot · left. A k already tried is not dealt twice (its column is lit, the scene shows its deal). After `minTries` tries (default 4) he may answer: THE MOST lots and what ONE lot then holds (three boxes, the item names printed as units). A miss is a FACT: the world deals what he typed and shows what is left (or lights its column when he tried it), or lights the column of a bigger k of HIS table that worked, or — when a bigger one exists that he never tried — says only that a number he has not tried is still open; never the answer. |
| `lists` | to find the longest plank of two small gaps: list the planks of each gap, cross the two lists, take the longest plank they share (a PROCEDURE on two lists) | two strips, gap a and gap b, and under them two LISTS, one above the other, one column per plank of either list (shortest at the left), so that equal planks stand one under the other. He BUILDS the list of gap a by pairs: he types a plank (a box); the world lays it on the gap — when it fills, `n = d × q` is written with the partner q in gold and both join the list, sorted; when it does not, `n = d × q + r` with the piece in amber, nothing added (lesson 2's method, not re-taught: no word about where to stop). The world CLOSES the list when every plank is in it; « the list is complete » said earlier is answered by ONE missing plank laid on the gap (the shortest missing; the list is not given — he types it). The same for gap b. Then he LINKS: he taps a plank of either list (« it is in both »); the world lays it on both strips and writes both divisions — a green line joins the two equal planks, or the plank is outlined amber with the division that leaves a piece. « All linked » said too early: ONE missing link is shown (dashed). LAST he taps the longest linked plank; a shorter pick is answered by a longer linked plank, shown on both strips; the right one is crowned gold. |
| `sort` | a pair whose only common plank is 1 / a pair that shares a longer plank — for lesson 8, a fraction that can / cannot be counted again in a longer unit (a CLASSIFICATION) | a HAND of 5–8 cards, one pair of gaps `(a ; b)` each, or one fraction `a/b` with a real bar (the numerator is gap a); the card on the table lies between two BASKETS named by the lesson (never the mathematical name before the key is forged) and its two gaps are drawn as strips on one scale (up to 700 cells: a gap is one bar, a plank too thin to draw is one bar); the cards left in his hand are small cards he may tap to play another first. For each card he MAY open ONE instrument he already owns, among those the spec lists — `lists` (the planks of each gap, shortest first from the right, the planks of both outlined green), `summit` (the planks of the shorter gap from the longest down, each laid on both strips with its rest on the longer gap written under it, stopping on the first that fills), `ladder` (Euclid's rows `a = b × q + r` down to the rest 0, rest amber, 0 green); the world runs it fact by fact — numbers, divisions, planks laid, never a conclusion. Then he DRAGS the card into a basket (touch and mouse) or taps the basket. A card in its own basket stays there. A card in the OTHER basket is answered by what the world does: said « only 1 » for a pair that shares a longer plank → the longest shared plank is laid on both strips, both divisions written (rest 0); said « a longer plank » for a pair that shares none → the planks of the shorter gap are laid on both strips from the longest down, each rest written: none but 1 leaves no rest. Then « next » takes the card to the basket it belongs to (outlined amber there: the world moved it). Never the word « wrong ». At the end both baskets stay on screen with their cards — the evidence his rule is written from. |
| `measure` | two gaps one above the other are ONE fraction; a plank that fills both is a UNIT in which both are counted again, and the fraction it writes is the same fraction; by any road the counts end on the same fraction, and one stage is enough with the longest common plank (a CHANGE OF UNIT) | two strips, the numerator above the denominator, a fraction bar drawn between them; the chain of equal fractions is written with real bars (KaTeX, one formula, never broken). He picks a plank — a chip of the lesson's candidates and/or a typed length, counted in the CURRENT unit (2 … the longer strip). One that does not fill both is laid: what is left shows in amber, both divisions are written, nothing changes (the chip is struck while that fraction stands). One that fills both: the world counts both strips again — they are re-drawn as that many planks — and the new fraction joins the chain with « = » (66/78 = 22/26 = 11/13). **Mode `stages`**: he goes on by the road HE chooses and ends a run by claiming « no plank but 1 fills both »; the world answers by trying the planks of the upper strip (shortest first) on the lower one — one that fills is laid and the run goes on, none: the run ends. Before a SECOND run (`runs`, default 2, never more than the planks that can open a road) he types where it will end (a fraction template); the second road must open with another plank (while one exists); it ends on the same fraction — a fact, his prediction beside it. **Mode `direct`**: one stage only; a plank that fills both is counted honestly (66/99 = 22/33), then the world tries the planks of the upper strip on the lower: when one still fills both, one stage was not enough and he starts again from the fraction given. |
| `part` | a part of a whole, re-cut in a longer unit: the painted length does not move, its writing does (13/39 = 1/3) — a fraction that comes out of a calculation is written again in the longest unit (a RE-CUT) | ONE strip, the whole (up to ~130 cells), and a painted part the world paints in strokes one after the other (5 cells, then 8), each stroke's length printed over it. He writes the fraction painted in its template (two boxes over a real bar — exactly the cells: painted over whole; a miss is answered by which count differs). Then he picks a plank (chips and/or typed, 2 … the whole) that fills the painted part AND the whole: one that does not is laid along the strip, outlined so the paint stays visible, what is left amber, both divisions written; one that does RE-CUTS the strip — the new cuts are drawn over the paint, which does not move, and the two writings stand side by side with « = ». He may instead claim « no plank but 1 fills both »: the world tries the planks of the painted part on the whole (a round whose part and whole share only 1 ends there, the writing unchanged; otherwise the plank it finds is laid and he picks again). One re-cut ends the round. |

**Key 3 of `qawaid-qabiliyat-qisma` (« الرقمان الأخيران », plank 4) — what the code does, and an OPEN choice.** The
experiment is `join` / `sum` (`world/inquiries.js › HUNDREDS_INQUIRY`): it starts from the gate dash he has just ridden
(28 is the number divisible by 4, 26 its even neighbour), a gap of hundreds is always filled (a fact, `300 = 4 × 75 + 0`),
and he says BEFORE each gluing whether plank 4 fills the new gap. He then writes his rule with tiles (no `writes`): the
reading `last2` of the forge's tiles is worded « العدد المشكّل من رقمَي آحادها وعشراتها » — the lesson says « المشكّل »
everywhere, the bank's word (its tests forbid « المكوّن » in the journey and on the board); the rule that holds is
`last2` × « يقبل القسمة على 4 » (4 readings × 3 conditions = 12 rules, one holds; the lesson's forges allow 60 rules in all,
`forges.test.js`).
> **2026-11-19 — OPEN, for the owner.** The draft of this lesson had played keys 2 AND 3 on the same `chart` (the review:
> the same experiment twice), key 3 with the `last2` lens and the words « العدد المكوّن من الآحاد والعشرات » — the reading
> THE OWNER named on 2026-11-17 for plank 4 of `qawasim-adad-tabii`'s chart (recorded below, « An experiment opens on its
> QUESTION … »; still used there). The `join` experiment and the word « المشكّل » replaced that chart reading in this
> lesson. The owner has been asked to choose: (a) the new `join` experiment, (b) his chart reading back for key 3, or
> (c) the `join` experiment with his word « المكوّن ». Until he answers, the code is (a).

**Spec shapes of `join`, `stack`, `peel`, `letters`** (the contract a lesson's `world/inquiries.js` writes against;
`T` = `spec.text`, the lesson's words; a `T.x(…)` is a function returning a string, which MAY hold `$…$` formulas
(MathText) unless marked « plain » — plain strings go into SVG text. No sentence may state the rule; a question never says
the fact it asks about — the screen passes it only what is already on screen). Every screen exposes its state on
`window.__inquiry` (dev) and carries `data-iq="<kind>"`, `data-iq-stage`, `data-iq-goal`, `data-iq-fact`, `data-iq-calc`,
`data-iq-next`, `data-iq-found`; the extra hooks are listed per kind.

```js
// join — logic: inquiry.js › joinOf(d, a, b, op) → { value, planksA, planksB, fillsA, fillsB, planks, rest, holds }
{ kind: 'join', d: 7,
  rounds: [{ op: 'sum' | 'diff', a, b, d? }],          // diff needs a ≥ b; `d` overrides spec.d for one round
  text: {
    lead: (d) => …,                                     // THE QUESTION, on screen all along
    goal: (d) => …,                                     // the goal, plain, in the 🎯 frame
    label: (n, d, { planks, rest }) => …,               // plain — under a strip: « 21 — 3 ألواح » / « … وبقيت 1 »
    ask: ({ op, a, b, d, fillsA, fillsB, planksA, planksB }) => …,   // the prediction (yes / no)
    seen: (f, guess) => …,                              // f = { op, a, b, d, ...joinOf }, after the planks are laid
    foundLine: (f) => …,                                // kept in the list (f has `guess`)
    yes, no, next, done,                                // button labels
  } }
// result: { rounds: [{ op, a, b, d, guess, holds }] }      hooks: data-iq-say="yes|no", data-iq-step, data-iq-op

// stack — logic: inquiry.js › stackOf(d, base, k) → { total, planks, rest, holds, fillsBase }
{ kind: 'stack', d: 7, base: 21, times: [2, 3, 10, 100],   // k ≤ 3 drawn, ≤ 12 packed, more: a number line only
  free?: { d: 14, base: 21, times: [2, 3] } | [ … ],       // more rounds after the first (a gap d does NOT fill)
  text: {
    lead: (d, base) => …, goal: (d) => …,                // question; goal (plain)
    label: (n, d, { planks, rest }) => …,               // plain, as in join
    ask: ({ d, base, k, fillsBase }) => …,
    seen: (f, guess) => …,                              // f = { d, base, k, ...stackOf }
    foundLine: (f) => …,
    yes, no, next, done,
  } }
// result: { rounds: [{ d, base, k, guess, holds }] }   (one entry per k of every round)
//                                                          hooks: data-iq-say, data-iq-k, data-iq-mode, data-iq-copy, data-iq-numline

// peel — logic: inquiry.js › peelOf(a, b) → { q, r, steps }, fitsRow(a, b, d) → { a, b, r } (booleans),
//        judgePeelClaim(rounds, claim) → { taken, intruders, orphans, ok }
{ kind: 'peel', writes: true,
  rounds: [{ a: 50, b: 20, candidates: [2, 4, 5, 25] }], // a > b, r = a % b > 0 — r = 10: 25 fills a alone, 4 fills b
                                                         // alone (neither fills 10), 2 and 5 fill both: exactly ONE claim
                                                         // holds (54, 21, [2, 3, 6, 7] alone would hold two: every plank of
                                                         // 54 there fills 12 — inquiry2.test.js checks both)
  text: {
    lead: (a, b, ri) => …,                              // before the peel: the question of the round
    goal: …,                                            // plain STRING
    peelBtn: (b) => …, peeling: (a, b) => …,            // the button that starts the world's peel; the lead while it runs
    piece: (r) => …,                                    // plain — over the piece left
    ask: ({ a, b, d, q, r, fitsA, fitsB }) => …,        // « does plank d fill the piece r? » (yes / no)
    shown: (row, guess) => …,                           // row = the same + fitsR
    cols: { plank, a, b, r },                           // the table's row labels (plain)
    yes, no, next, nextRound, toClaim,
    claimLead, claimIf, claimThen,                      // plain: the claim is « claimIf [colLabel.a] [link] [colLabel.b] claimThen »
    colLabel: { a, b }, link: { and, or },
    claimAsk,                                           // no column chosen yet
    claimFact: (judge) => …, claimOk: (judge) => …,     // judge = judgePeelClaim(spec.rounds, claim)
    seal,
  } }
// claim = { cols: [] | ['a'] | ['b'] | ['a', 'b'], link: 'and' | 'or' } — `link` counts only with two columns.
// A claim is REFUTED only by an intruder (a row it takes in whose plank does not fill the piece); `orphans` (rows that
// fill the piece without being taken) are facts, not refutations. Accepted: exactly { cols: ['a', 'b'], link: 'and' } —
// PROVIDED the rounds hold a plank of a alone, a plank of b alone (each not filling the piece) and a plank of both:
// the lesson's test must enumerate the five claims and find exactly one ok (see divisorIsles/inquiry2.test.js).
// result: { rounds: [{ a, b, q, r, rows: [{ d, fitsA, fitsB, fitsR, guess }] }], claim }
//         hooks: data-iq-peel, data-iq-say, data-iq-ptable, data-iq-row="a:b:d", data-iq-r, data-iq-claim,
//                data-iq-col="a|b", data-iq-link="and|or", data-iq-seal, data-iq-ok

// letters — logic: inquiry.js › checkProofOrder(cards, ids, given) → { ok, at, missing },
//           refuteCard(card, samples) → the first sample where card.holdsOn(sample) is false, or null
{ kind: 'letters', writes: true,
  statement: { given: ['$d \\mid a$', …], goal: '$d \\mid a + b$', gives: ['d|a', 'd|b'] },  // MathText strings; `gives` = tokens
  numbers: { value: (v) => v.a + v.b, by: (v) => v.d, max?: 20 },   // stage 1: he presses □ with by(v) × □ = value(v)
  samples: [{ d: 7, a: 21, b: 35 }, { d: 3, a: 12, b: 6 }, { d: 5, a: 40, b: 15, hide: 'b' }],   // stage 1 in order;
                                                      // `hide` = the letter shown as « ? » (no □ asked)
  show?: ['d', 'a', 'b'],                             // the letters printed (default: the keys of samples[0])
  cards: [{ id, tex,                                  // tex: a MathText string (Arabic words and $…$)
            ok: boolean,
            needs?: [tokens], gives?: [tokens],       // what the line uses / introduces (« k », « k′ », « d(k+k′) »)
            holdsOn: (sample) => boolean,             // is the line TRUE for these numbers?
            why?: (sample) => …,                      // REQUIRED when ok: false — the numeric fact for the sample the world picked
          }],
  order: [ids],                                       // ONE valid order of exactly the ok cards (any order whose `needs` are met is accepted)
  text: {
    lead, goal,                                       // strings (goal plain)
    numbersAsk: (v) => …, numbersOk: (v, q) => …, numbersMiss: (v, q) => …,
    carry: (v, before, q) => …,                       // his last line (on `before`) put against the new numbers v
    hidden: (v, before, q) => …,                      // the sample with a letter hidden (before/q null if no line yet)
    line: (v, q) => …,                                // his calculation, kept in the list
    nextSample, toCards,
    cardsLead, cardsAsk, givenLabel, goalLabel,       // stage 2 (givenLabel / goalLabel plain)
    needs: (card, missing) => …,                      // a card placed too early: what it uses that no line above wrote
    placed?: (card) => …, proved, done,
    unrefuted?: (card) => …,                          // a false card NO sample refutes (data that should not exist —
                                                      //   the lesson's test forbids it): where it stands, never a crash
    noWhole?: (v, value, by) => …,                    // a sample with no natural □ (value not a multiple of by): shown,
                                                      //   then « next » — defaults for both in strings.js › INQUIRY_TEXT
  } }
// the chips of □ run from 1 to max(numbers.max, the sample's quotient): a quotient past `max` still has its chip
// result: { order: [ids as placed], tries: number of refused placements, refuted: [ids of false cards he tried] }
//         hooks: data-iq-sample, data-iq-values, data-iq-q=<n>, data-iq-sheet, data-iq-slot=<i>, data-iq-card-in,
//                data-iq-deck, data-iq-card=<id>, data-iq-said="false|early|ok", data-iq-done
```

**Spec shapes of `groups`, `rebuild`, `estimate`, `bracket`** (the Euclidean division: a gap of a cells, planks of b,
a = b × q + r with 0 ≤ r < b; the same conventions as above — `T` = `spec.text`, `$…$` allowed unless « plain », no
sentence states the rule; every screen carries `data-iq`, `data-iq-stage`, `data-iq-goal`, `data-iq-calc`,
`data-iq-fact`, `data-iq-next`, `data-iq-found`, and exposes its state on `window.__inquiry`). The typed boxes are the
kit's `Num` (`kit/parts.jsx`), laid inside the line they complete (`.iq-tpl`, never two lines); Enter checks.

```js
// groups — logic: inquiry.js › groupsOf(a, b) → { q, r, steps: [{ k, fits, left }] }
//          (steps[k − 1] = the k-th plank tried; the last step is always the plank that does NOT fit; `left` = cells left)
{ kind: 'groups', manual?: 3,                          // predictions before « أكمل » is offered (only when a ≥ 10 b)
  rounds: [{ a, b }],                                  // b > a (0 planks), an exact fit, a big gap (a ≥ 10 b) are all allowed
  text: {
    lead: (a, b) => …, goal: (a, b) => …,              // the question; the goal (plain)
    ask: ({ a, b, k, left }) => …,                     // « will plank k fit? » — left = the cells left NOW
    yes, no, finish,                                   // button labels (finish = « أكمل »)
    laid: (f) => …, over: (f) => …,                    // f = { a, b, q, r, k, fits, left, guess } — the plank just tried
                                                       //   (guess is null for the plank tried after « أكمل »)
    left: (n) => …,                                    // plain — over the cells left on the strip
    sayLead: ({ a, b }) => …,                          // how many planks, how many cells left?
    sayPlanks, sayLeft, check,                         // plain labels of the two boxes; the button
    sayMiss: (f) => …,                                 // f + said: { q, r } — what he typed, answered by the strip
    sayOk: (f) => …,
    foundLine: ({ a, b, q, r, said }) => …,            // kept in the list
    next, done,
  } }
// result: { rounds: [{ a, b, q, r, guesses: [{ k, guess, fits }], said: { q, r } }] }   (said = his FIRST answer)
//         hooks: data-iq-say="yes|no", data-iq-k, data-iq-finish, data-iq-in="q|r", data-iq-check

// rebuild — logic: inquiry.js › rebuildOf(b, q, r) → { a, valid: r < b, more, q2, r2 }   (q2, r2 = the division of a)
{ kind: 'rebuild',
  rounds: [{ b, q, r, bare? }],                        // r ≥ b allowed: the world lays `more` planks in the piece;
                                                       // bare: the box alone, without « b × q + r = »
  text: {
    lead: (round) => …, goal: (round) => …,            // goal plain
    label: (round) => …,                               // plain — under the strip (and the scene's aria-label)
    ask: (round) => …,                                 // how long is the gap under the cloth?
    lift,                                              // the button that says the length and lifts the cloth
    seen: (f) => …, more: (f) => …,                    // f = { b, q, r, said, a, valid, more, q2, r2 }; `more` when r ≥ b
    foundLine: (f) => …,                               // shown dim when said ≠ a
    next, done,
  } }
// result: { rounds: [{ b, q, r, said, a }] }           hooks: data-iq-in="a", data-iq-lift, data-iq-cloth="down|up"

// estimate — logic: inquiry.js › estimateSteps(a, b) → [{ place, unit, q, from, left }]
//            (the steps of kit/longDivision.js: unit = b × 10^place, q = 0…9 the biggest that does not pass `from`,
//             from < 10 × unit, left = from − q × unit < unit)
{ kind: 'estimate',
  blind?: true,                                        // the marks hide their products until pressed (also per round)
  rounds: [{ a, b, blind? }],                          // 1AM: a ≤ 4 digits, b = 11…99; 2AM: any b
  text: {
    lead: (a, b) => …, goal: (a, b) => …,              // goal plain
    ask: ({ a, b, place, unit, from }) => …,           // which mark? (10^place planks a mark)
    left: (n) => …,                                    // plain — over what is left of the gap
    passes: (m) => …, short: (m) => …,                 // m = { a, b, place, unit, from, k, count, value, left }:
                                                       //   k marks = count planks = value cells; short also has `next`
    laid: (m) => …,                                    // the step just laid (same m, for that step)
    sum: ({ a, b, q, r, steps }) => …,                 // the end of the round
    foundLine: ({ a, b, q, r, tens, units }) => …,
    next, done,
  } }
// result: { rounds: [{ a, b, q, r, tens, units, guesses: [{ place, count, ok }] }] }   (tens = ⌊q / 10⌋, units = q mod 10)
//         hooks: data-iq-place, data-iq-ruler=<unit>, data-iq-flag=<from>, data-iq-mark=<count>,
//                data-iq-blind="1|0", data-iq-shown=<count> (blind: a mark whose product he revealed)
//         logic of one press: inquiry.js › estimateMark(step, k) → { k, value, kind: 'passes'|'short'|'ok', next }

// bracket — logic: inquiry.js › bracketOf(a, b) → { lo, hi, exact, r }   (hi = lo + 1; exact ⇔ r = 0)
//           bracketSays(a, b, lo, hi) → { loFits, hiPasses, consecutive, ok }
{ kind: 'bracket',
  rounds: [{ a, b }],                                  // include flags ON a mark (exact) and between two marks
  text: {
    lead: (a, b) => …, goal: (a, b) => …,              // goal plain; « full crates / crates needed » wording goes here
    ask: ({ a, b }) => …, check,                       // above the template « b × □ ≤ a < b × □ »
    miss: (m) => …,                                    // m = { a, b, lo, hi, loValue, hiValue, ...bracketSays }
    ok: (f) => …,                                      // f = { a, b, lo, hi, exact, r, said } — the pair holds
    where: (f) => …, between, onMark,                  // between two marks, or ON one? (two buttons)
    seen: (f) => …,                                    // after he said where (f.said = 'between' | 'on')
    foundLine: (f) => …,                               // shown dim when said is not what the line shows
    next, done,
  } }
// result: { rounds: [{ a, b, lo, hi, exact, said, guesses: [{ lo, hi, ok }] }] }
//         hooks: data-iq-in="lo|hi", data-iq-check, data-iq-where="between|on", data-iq-flag=<a>
```

**Spec shapes of `common`, `ladder`, `nest`** (the greatest common divisor: a gap of a cells is held by planks of d when
d divides a; the same conventions as above — `T` = `spec.text`, `$…$` allowed unless « plain », no sentence states the
rule, `data-iq`, `data-iq-stage`, `data-iq-goal`, `data-iq-calc`, `data-iq-fact`, `data-iq-next`, `data-iq-found`,
`window.__inquiry`; the typed boxes are the kit's `Num` inside `.iq-tpl`). None writes the rule (`writes` is not set).

```js
// common — logic: inquiry.js › commonOf(a, b, candidates) → { rows: [{ d, holdsA, holdsB, both }], common, longest }
//          (common = the candidates that hold both, shortest first; longest = the last of them, null when none);
//          gcd(a, b) → the longest plank of both gaps (a, b > 0)
{ kind: 'common',
  crown?: false,                                       // the longest is not asked (also per round); absent = asked
  rounds: [{ a, b, candidates: [planks…], crown? }],  // include gcd(a, b) among the candidates so `longest` IS the gcd
                                                       // (the lesson's test checks commonOf(...).longest === gcd(a, b))
  text: {
    lead: (a, b) => …, goal: (a, b) => …,              // the question; the goal (plain)
    take: ({ a, b }) => …,                             // no plank in hand: « take a plank from the pile »
    ask: ({ a, b, d }) => …,                           // the prediction for plank d (two yes / no below it)
    onA: (a) => …, onB: (b) => …,                      // plain — the label before each pair of yes / no
    yes, no, lay,                                      // button labels (lay = the world lays the plank)
    seen: (f, guess) => …,                             // f = { a, b, d, holdsA, holdsB, both, guessA, guessB },
                                                       //   guess = { a, b } — after the plank is laid on both strips
    shelf: { a: (a, b) => …, b: (a, b) => …, both: (a, b) => …, none: (a, b) => … },   // plain shelf labels
    sayLead: ({ a, b, crown }) => …,                   // mark the longest of « both », type how many it holds
                                                       //   (crown false: type how many it holds — no longest)
    sayCount, check,                                   // plain label of the box; the button
    sayMiss: (f) => …, sayOk: (f) => …,                // f = { a, b, crown, common, longest, said: { longest, count } }
                                                       //   (crown false: said.longest is null — do not name `longest`)
    sayFirst?: ({ a, b, crown, needLong, needCount }) => …,   // « تحقّق » with no plank marked and/or the box empty: what is
                                                       //   missing (default: the world's sentence, strings.js › INQUIRY_TEXT)
    foundLine: (f) => …,                               // f = { a, b, crown, rows, common, longest, said } — kept in the list
    next, done,
  } }
// result: { rounds: [{ a, b, rows: [{ d, guessA, guessB, both }], common, longest, said: { longest, count } }] }
//         (said = his FIRST answer; longest null with crown false)
//         logic of « تحقّق »: inquiry.js › commonSays(c, said, crown) → { needLong, needCount, ok }
//         hooks: data-iq-crown="1|0", data-iq-tray, data-iq-plank=<d>, data-iq-say-a="yes|no", data-iq-say-b="yes|no",
//                data-iq-lay, data-iq-shelf="a|b|both|none", data-iq-long=<d> (the chips of « both »; absent with
//                crown false), data-iq-in="count", data-iq-check, data-iq-strip="a|b"
//         a gap of 0: rounds: [{ a: 27, b: 0, … }] (one gap only; commonOf throws on (0 ; 0) and on a plank 0) — the strip
//                is an empty mark, data-iq-zero; the lesson's `seen` must word 0 = d × 0 itself (q = 0 is not « too long »)

// common · witness — screen InquiryGcdModes.jsx › Witness (a reducer: gcdModes.js › witnessReducer, a pure WitnessView)
{ kind: 'common', mode: 'witness',                   // the whole spec (a round cannot switch mode)
  rounds: [{ a, b, candidates: [2, 3, 5, 9, 10] }],  // the tray, in the order shown; no 1 in it (1 fills every pair)
  text: {
    lead, goal, take, ask, onA, onB, yes, no, lay, seen, shelf, next, done,   // as `common` above
    enoughAsk: ({ a, b, d }) => …,                     // the first plank on « both » ended the round: is one enough?
    enoughSeen: ({ a, b, d, said, tried, left }) => …, // after his yes / no: the round is over with one plank (a FACT;
                                                       //   said = his answer, tried = planks laid, left = still in the tray)
    empty?: ({ a, b, tried }) => …,                    // the tray is empty and none filled both — default: the world's
                                                       //   sentence (strings.js › INQUIRY_TEXT.witnessEmpty); never « they
                                                       //   share no plank », never the hidden common plank
    foundLine: (r) => …,                               // r = the round of the result
  } }
// result: { rounds: [{ a, b, tried: [{ d, guessA, guessB, holdsA, holdsB, both }], witness: d | null,
//           enough: true | false | null }] }        (enough null when no plank filled both)
//         hooks: data-iq="common", data-iq-mode="witness", data-iq-crown="0", data-iq-witness=<d> (once found),
//                data-iq-tray, data-iq-plank=<d>, data-iq-say-a|b="yes|no", data-iq-lay, data-iq-shelf, data-iq-enough="yes|no"
//         window.__inquiry = { kind: 'common', mode: 'witness', ri, a, b, stage, hand, placed, tray, witness, enough, rounds }
//         stages: take → guess → lay → take … → enough → seen (or → seen on the empty tray)

// ladder — logic: inquiry.js › ladderOf(a, b, mode) → { rows: [{ a, b, q, value, next }], gcd, steps }
//          (the first row is (max, min); subtract: value = a − b, q = 1, next = (max(b, value), min(b, value));
//           divide: a = b × q + value, next = (b, value); the last row is the one where value = 0 (next = null);
//           gcd = the b of the last row; steps = the number of rows);
//          commonPlanks(a, b) → the planks of both gaps, shortest first (the ✓ list of each row)
{ kind: 'ladder', mode: 'subtract' | 'divide',
  manual?: 2,                                          // rows whose next pair he predicts before the count (default 2;
                                                       //   capped at steps − 1: a ladder of one row asks the count at once)
  plain?: true,                                        // (also per round) a workshop's BENCH (2026-11-19, lesson 6): the
                                                       //   rows and their calculations only — no ✓ column of the planks
                                                       //   common to each row's pair and no last value lit gold (on a
                                                       //   bench they show which plank to make); `T.planks` is not shown;
                                                       //   hook data-iq-plain. Without it the screen is exactly as before
  from?, onState?,                                     // set by the bench (Workshop.jsx › Bench): it starts where he left
                                                       //   it (inquiry.js › ladderStart: a row being written is written, a
                                                       //   ladder being finished is finished) and hears every move.
                                                       //   Mode `both` keeps its state the same way (gcdModes.js › bothStart)
  rounds: [{ a, b, mode? }],                           // a, b > 0; `mode` overrides spec.mode for one round — the same
                                                       //   pair in both modes lets the lesson compare the rows. Keep a
                                                       //   subtract ladder short (≤ 10 rows): past six rows the screen folds
  text: {
    lead: (a, b, mode) => …, goal: (a, b, mode) => …,  // goal plain
    ask: ({ a, b, mode, row }) => …,                   // « what pair comes after (a ; b)? » — above the template ( □ ; □ )
    write,                                             // the button that writes the row
    seen: (f) => …,                                    // f = { a, b, mode, value, q, next, said: [x, y], hit } — the row
                                                       //   just written (hit: his pair, in either order, is `next`)
    planks,                                            // plain — the head of the ✓ column
    folded: (k) => …,                                  // plain — the folded line (k rows hidden)
    countAsk: ({ a, b, mode, written }) => …,          // how many rows will the ladder have (all of them)?
    countLabel, finish,                                // plain label of the box; the button (the world finishes)
    end: (f) => …,                                     // f = { a, b, mode, steps, guessed, gcd } — the ladder is done
    foundLine: (f) => …,                               // same f (+ guesses); shown dim when guessed ≠ steps
    next, done,
  } }
// result: { rounds: [{ a, b, mode, steps, guessed, gcd, guesses: [{ row, said: [x, y], hit }] }] }
//         hooks: data-iq-mode, data-iq-ladder, data-iq-row=<n>, data-iq-ticks="1,2,…", data-iq-fold=<k>,
//                data-iq-in="x|y|count", data-iq-write, data-iq-count

// ladder · fold — logic gcdModes.js › foldRuns(a, b) → { rows (the subtraction ladder), runs: [{ from, to, a, b, q, r }],
//          gcd, steps } (a run = the consecutive rows that take away the same gap; it IS the row a = b × q + r of the
//          division ladder); screen InquiryGcdModes.jsx › Fold (foldReducer, a pure FoldView)
{ kind: 'ladder', mode: 'fold',
  folds?: 1,                                           // runs he folds himself (also per round); the world folds the rest
  rounds: [{ a, b, folds? }],                          // pick a pair whose first run has ≥ 2 rows (962 ; 296: 3 rows, 74)
  text: {
    lead: (a, b, 'fold') => …, goal: (a, b, 'fold') => …, planks, folded: (k) => …,   // as `ladder`
    foldAsk: ({ a, b, rows }) => …,                    // above the template a = b × □ + □ (a, b = the run's)
    fold,                                              // the button
    foldMiss: ({ a, b, q, r, said: { q, r } }) => …,   // a wrong fold: the rows are counted on screen, r lit amber
    foldSeen: (f) => …,                                // f = the fold of the result — after it, while the ladder goes on
    end: ({ a, b, gcd, steps, lines, folds }) => …,    // the ladder is done (lines = the folded lines)
    foundLine: (r) => …, next, done,                   // r = the round of the result; dim when a first fold was wrong
  } }
// result: { rounds: [{ a, b, gcd, steps, lines, folds: [{ rows: [from, to] (1-based), a, b, said: { q, r }, q, r }] }] }
//         (said = what he typed first)
//         hooks: data-iq-mode="fold", data-iq-ladder, data-iq-lines=<n>, data-iq-row=<n> (a subtraction row),
//                data-iq-counted=<k> (after a miss), data-iq-line=<k> + data-iq-rows="1-3" (a folded line), data-iq-fold=<k>
//                (rows hidden behind « … »), data-iq-ticks, data-iq-in="q|r", data-iq-fold-go
//         window.__inquiry = { kind: 'ladder', mode: 'fold', ri, a, b, stage, run, runs: [{ q, r }], written, lines, gcd, rounds }
//         stages: write (the world writes the run) → fold → write … → finish (the world's folded lines) → seen

// ladder · both — logic gcdModes.js › bothOf(a, b) → { subtract, divide (two ladderOf), steps: { subtract, divide },
//          shorter: 'divide'|'subtract'|'same', by, gcd } — the same length only when a = b; screen › Both (bothReducer)
{ kind: 'ladder', mode: 'both',
  rounds: [{ a, b }],                                  // 1003 ; 34 (31 rows against 2); twins for « the same »
  text: {
    lead: (a, b, 'both') => …, goal: (a, b, 'both') => …,
    ladderLabel: (mode) => …,                          // plain — over each ladder ('subtract' | 'divide')
    countLine: (mode, n) => …,                         // plain — the rows of a ladder so far, under it (« 31 صفًّا »)
    ask: ({ a, b }) => …,                              // which will be shorter, by how many rows?
    shorter: { subtract, divide, same },               // the three choice buttons
    byLabel, byUnit,                                   // plain — around the box « by □ rows » (hidden for « same »)
    run,                                               // the button that runs both ladders (enabled once he has said)
    end: ({ a, b, steps, shorter, by, gcd, said }) => …,   // the counts stand under the ladders
    foundLine: (r) => …, next, done,                   // dim when his prediction was not the fact
  } }
// result: { rounds: [{ a, b, said: { shorter, by }, steps: { subtract, divide }, shorter, by, gcd }] }   (by 0 with same)
//         hooks: data-iq-mode="both", data-iq-shorter="subtract|divide|same", data-iq-in="by", data-iq-run,
//                data-iq-col="subtract|divide" + data-iq-rows=<shown> (+ data-iq-steps=<n> once done), data-iq-bar=<n>,
//                data-iq-count-of=<mode>
//         window.__inquiry = { kind: 'ladder', mode: 'both', ri, a, b, stage, shown, steps, said, rounds }
//         stages: say → run → seen

// nest — logic: inquiry.js › nestOf(a, b, probes) → { g, divisorsOfG, common, rows: [{ p, inG, both }], equal }
//        (equal is always true — the lesson's test sweeps it)
{ kind: 'nest',
  rounds: [{ a, b, probes: [numbers…] }],             // mix: planks of g, planks of a single gap, longer than g
  text: {
    lead: (a, b) => …, goal: (a, b) => …,              // goal plain
    given: ({ a, b, g }) => …,                         // a MathText line naming g (the lesson writes its notation)
    divisorsLabel: (g) => …,                           // plain — over the chips of the planks of g (and in the end lists)
    ask: ({ a, b, g, p }) => …,                        // looking at g only: does p hold both gaps? (yes / no)
    yes, no,
    seen: (f, guess) => …,                             // f = { a, b, g, p, inG, both, holdsA, holdsB, guess }
    foundLine: (f) => …,                               // same f — kept in the list, dim when guess ≠ both
    compare: (f) => …,                                 // f = { a, b, ...nestOf } — under the two lists
    commonLabel: (a, b) => …,                          // plain — over the list of the planks of both gaps
    next, done,
  } }
// result: { rounds: [{ a, b, g, rows: [{ p, guess, both }] }] }
//         hooks: data-iq-probe=<p>, data-iq-say="yes|no", data-iq-divs="1,2,…", data-iq-strip="a|b|g",
//                data-iq-lists, data-iq-list="common|g"

// nest · pair — logic gcdModes.js › pairOf(a, b, [x, y], probes) → { first, second (the planks of both gaps of each
//        pair, shortest first), rows: [{ p, holdsA, holdsB, holdsX, holdsY, inFirst, inSecond }], equal };
//        screen InquiryGcdModes.jsx › Pair (pairReducer, a pure PairView)
{ kind: 'nest', mode: 'pair',
  rounds: [{ a, b, pair: [x, y], probes: [numbers…] }],   // pair = (b ; a − b) or (b ; r), all > 0 — (152 ; 95), (95 ; 57)
  text: {
    lead: (a, b, [x, y]) => …, goal: (a, b, [x, y]) => …,
    ask: ({ a, b, x, y, p }) => …,                     // does p fill both gaps of each pair?
    onFirst: ({ a, b }) => …, onSecond: ({ x, y }) => …,   // plain — before each yes / no
    yes, no, lay,
    seen: (f, guess) => …,                             // f = { a, b, x, y, p, holdsA, holdsB, holdsX, holdsY, inFirst,
                                                       //   inSecond, guessFirst, guessSecond }, guess = { first, second }
    foundLine: (f) => …,                               // same f — dim when a prediction was not the fact
    compare: ({ a, b, x, y, first, second, equal }) => …,   // under the two lists — a fact, never the rule
    firstLabel: (a, b) => …, secondLabel: (x, y) => …, // plain — over each list
    next, done,
  } }
// result: { rounds: [{ a, b, pair: [x, y], rows: [{ p, guessFirst, guessSecond, inFirst, inSecond }], first, second }] }
//         hooks: data-iq="nest", data-iq-mode="pair", data-iq-probe=<p>, data-iq-pairs="a:b|x:y", data-iq-strip="a|b|x|y",
//                data-iq-say-first|second="yes|no", data-iq-lay, data-iq-lists, data-iq-list="first|second" + data-iq-planks
//         window.__inquiry = { kind: 'nest', mode: 'pair', ri, a, b, pair, pi, stage, rows, rounds }
//         stages: guess → lay → guess … → compare
```

World sounds: common — `pick` (he takes a plank), `sweep` + `plank` (the world lays it on both strips), `success` /
`crumble` (his two predictions against the strips), `key` / `fail` on his longest and count; ladder — `pick` (his pair,
his count), `plank` per row written, `sweep` per row the world finishes, `gate` at the end; nest — `pick`, `sweep` +
`plank` (laid on the three strips), `success` / `crumble`. The logic is swept by `divisorIsles/inquiryGcd.test.js` (every
experiment true for every a, b ≤ 120–160); the screens by `inquiryGcd.render.test.jsx`.
The four modes (2026-11-19) live in `gcdModes.js` (logic and reducers), `InquiryGcdModes.jsx` (pure views) and
`inquiryGcdModes.css`; `InquiryGcd.jsx › Common | Ladder | Nest` mount them on `spec.mode` and any other spec plays as
before. Sounds: witness — `pick`, `sweep` + `plank`, `success` / `crumble`, `spark` when a plank fills both, `gate` at
the end of a round; pair — `pick` per yes / no, `sweep` + `plank`, `success` / `crumble` (both predictions), `gate` on the
lists; fold — `plank` per row the world writes, `key` / `fail` on his fold, `sweep` per line the world folds, `gate`;
both — `pick`, `sweep` per row of the two ladders, `gate`. Tests: `gcdModes.test.js` (witness: every pair ≤ 150 and every
order of the tray 2, 3, 5, 9, 10 played through the reducer — the round stops on the first plank that fills both, or on
the empty tray; pair: (a ; b), (b ; a − b), (b ; r) have the same common planks for every pair ≤ 200; fold: every run is
the Euclidean division and the runs are the rows of the division ladder, pairs ≤ 150; both: the counts are Σq and the
number of divisions, equal only for twins, pairs ≤ 150; each state machine played with wrong and out-of-stage moves; the
gap of 0 in `commonOf`) and `inquiryGcdModes.render.test.jsx` (each mode mounted by `Inquiry` and played stage by stage;
1003 ; 34 folded behind « … » in `fold` and drawn as 31 + 2 bars in `both`; a gap of 0 drawn as its mark).

World sounds: groups — `pick` (his prediction), `plank` per plank laid, `hit` for the plank that does not fit, `sweep`
per plank of « أكمل », `key` / `fail` on his count; rebuild — `pick`, `sweep` (the cloth), `plank` per extra plank,
`success` / `crumble`; estimate — `fail` on a mark that passes or leaves room, `sweep` + `plank` when a block is laid,
`gate` at the end; bracket — `key` / `fail` on his pair, `success` / `crumble` on « between / on ». None of the four
writes the rule (`writes` is not set): the forge's tiles come after them.

**Spec shape of `cycle`** (2026-11-19; one plank on gaps that grow cell by cell — the same conventions: `T` =
`spec.text`, `$…$` allowed unless « plain », no sentence states the rule, `data-iq`, `data-iq-stage`, `data-iq-goal`,
`data-iq-calc`, `data-iq-fact`, `data-iq-next`, `data-iq-found`, `window.__inquiry`; `writes` is not set):

```js
// cycle — logic: cycle.js › cycleOf(b, from, count) → { b, from, steps: [{ a, q, r, wraps }] }
//         (steps[0] = the gap `from`, shown; wraps: the cell just added was the b-th cell left — one more plank went in);
//         probeOf(b, from) → the same from the gap the plank fills at or under `from` (`start`), b + 2 gaps: the whole
//         climb 0 … b − 1, the fall, one more; largestLeft(b) = b − 1
{ kind: 'cycle',
  rounds: [{ b, from, count }],                        // b ≥ 2, from ≥ b, count ≥ 2 — choose `from` and `count` so that
                                                       //   the round SHOWS b − 1 cells left, then the fall, then one gap
                                                       //   more (the lesson's test checks it); keep a round short (≤ 8
                                                       //   gaps: every one is predicted) and b ≤ 9 (chips 0 … b + 1)
  probes?: [{ b, from }],                              // planks he has not laid cell by cell (b up to 12: one column a gap)
  text: {
    lead: (b, from, count) => …, goal: (b) => …,       // the question of a round; the goal (plain)
    start: (f) => …,                                   // f = { a, b, q, r } — the first gap, a FACT
    ask: ({ a, b, from, left }) => …,                  // a = the gap once the cell is added; from, left = the gap now
    grew: (f) => …,                                    // f = { a, b, q, r, wraps, said } — said: his number, or null
                                                       //   while the world grows a probe
    left: (n) => …,                                    // plain — over the cells left on the strip
    foundLine: ({ b, from, steps }) => …,              // a round kept in the list (steps: [{ a, r, said }])
    next, toProbe, done,                               // next round · the first probe · the end (button labels)
    probeLead: (b, start) => …,                        // the question of a probe
    maxAsk: ({ b }) => …, maxUnit,                     // « the most cells it will leave? »; plain label of its box
    sameAsk: ({ b }) => …, yes, no,                    // « will b cells be left once? »
    grow,                                              // the button that lets the world grow the gap
    probeSeen: (p) => …, probeLine: (p) => …,          // p = { b, from, max, said: { max, same } } — after the run; kept
  } }
// result: { rounds: [{ b, from, steps: [{ a, r, said }] }], probes: [{ b, from, max, said: { max, same } }] }
//         hooks: data-iq-part="round|probe", data-iq-plank, data-iq-gap, data-iq-strip=<a>, data-iq-left=<r>,
//                data-iq-stairs="4,5,6,7,0", data-iq-col="<a>:<r>", data-iq-col-next=<a>, data-iq-chips,
//                data-iq-say=<n>, data-iq-in="max", data-iq-same="yes|no", data-iq-grow
```

World sounds: cycle — `pick` (his number, his « yes / no »), then what the world does with the new cell: `sweep`
(pitched by the cells left: the count climbs) or `plank` where one more plank goes in; a probe plays the same per
cell, then `key` / `fail` on the two things he had said. **A kind may live in its own files** — `cycle.js`,
`InquiryCycle.jsx`, `inquiryCycle.css` (imported by its screen), one line of the `Kind` map of `Inquiry.jsx` — and
**its screen is a pure VIEW of a reducer** (`cycleReducer(spec, state, action)`, `CycleView({ spec, state, act })`):
the tests have no DOM, so a stage is reached by playing actions through the reducer and rendered with
`renderToString` — `cycle.test.js` (every step is the Euclidean division of its gap, the cells left climb by one and
fall exactly where they would be b, for every plank up to 40; the state machine: a prediction, the world, the last gap,
both answers before a probe runs) and `inquiryCycle.render.test.jsx` (it opens on its question, its goal and the first
gap as a fact; a round and a probe PLAYED stage by stage). A new screen should be written the same way.

**Spec shapes of `summit` and `deal`** (2026-11-19, 4AM unit 1 batch 2 — the same conventions: `T` = `spec.text`, `$…$`
allowed unless « plain », no sentence states the rule, `data-iq`, `data-iq-stage`, `data-iq-goal`, `data-iq-calc`,
`data-iq-fact`, `data-iq-next`, `data-iq-found` (deal: on its table), `window.__inquiry`; `writes` is not set; each a
reducer and a pure view like `cycle`):

```js
// summit — logic: summit.js › divisorsDown(n) → the planks of n, longest first;
//          plankOn(a, b, d) → { d, qa, ra, qb, rb, fillsA, fillsB, both, kind: 'both'|'a'|'b'|'none' };
//          descentOf(a, b) → { short, long, all, planks, crown, tries, rest } (planks = tried until the first that fills
//            the longer gap, crown last — crown = gcd(a, b); tries = planks.length; rest = the shorter planks of `all`);
//          outsideWitness(a, b, tries) → { d, mine } | null; state machine summitReducer / initSummit / summitResult
{ kind: 'summit',
  rounds: [{ a, b,
             start?,                                   // a plank he has just used that fills both: on the strips at once
             free?: 2,                                 // free tries (0 allowed)
             mode?: 'search' | 'first',                // 'first': he types the number of tries before the descent
             outside?: boolean }],                     // ask the outside prediction (default: true, false in mode 'first')
                                                       // gaps up to ~400 cells (one scale for both strips)
  text: {
    lead: (a, b, mode) => …, goal: (a, b) => …,        // the question of the round; the goal (plain)
    start: (f) => …,                                   // f = { a, b, ...plankOn(start) } — the plank already laid, a FACT
    freeAsk: ({ a, b, best, left }) => …,              // best: the best so far (or null); left: free tries left
    unit, lay,                                         // plain unit of the box (« خانة »); the button
    freeBound: ({ a, b, max }) => …,                   // a length out of 1 … max (or an empty box): what can be laid
    tried: (f) => …,                                   // f = { a, b, ...plankOn(d), best, isBest } — the try just laid
    line,                                              // plain — the label of the line of lengths (SVG)
    outsideAsk: ({ a, b, short, long }) => …,          // « can a plank that does not fill the shorter gap fill both? »
    outsideSeen: (f) => …,                             // f = { a, b, short, long, ...plankOn(d), mine, guess }
    go,                                                // the button after it (on to the count or the descent)
    countAsk: ({ a, b, short, long }) => …, countUnit, countGo,   // mode 'first': how many planks will be tried
    chipsLabel: (short) => …,                          // plain — over the chips of the planks of the shorter gap
    descentAsk: ({ a, b, short, long, d }) => …,       // « does d fill the other gap? »
    descentSeen: (f) => …,                             // f = { a, b, short, long, ...plankOn(d), guess } (guess null:
                                                       //   the world's own plank in mode 'first')
    crowned: (f) => …,                                 // f = { a, b, short, long, crown, tries, guessCount }
    restAsk: ({ a, b, short, long, crown, rest }) => …,   // rest = how many planks are shorter than the crown
    restSeen: (f) => …,                                // f = crowned's + { rest: [d…], checked } — the end of the round
    countSeen: (f) => …,                               // mode 'first': f = crowned's + { said } — the end of the round
    foundLine: (r) => …,                               // r = the round of the result — kept in the list
    yes, no, next, done,
  } }
// result: { rounds: [{ a, b, mode, tries: [{ d, fillsA, fillsB }], outside: { d, guess, mine } | null,
//                      descent: [{ d, guess, holds }], crown, checkedRest: true|false|null, guessCount? }] }
//         (guessCount only in mode 'first'; checkedRest null when it was not asked)
//         hooks: data-iq-mode, data-iq-pair="a:b", data-iq-crown=<d>, data-iq-strip="a|b", data-iq-in="free|count",
//                data-iq-lay, data-iq-lengths="d:kind,…", data-iq-mark=<d> + data-iq-kind, data-iq-best=<d>,
//                data-iq-say="yes|no" (outside, descent), data-iq-go, data-iq-count, data-iq-planks="266,133,…",
//                data-iq-chip=<d> + data-iq-chip-state="now|no|crown|shorter|", data-iq-rest="yes|no"

// deal — logic: deal.js › dealOf(nA, nB, k) → { k, qA, rA, qB, rB, ok, rounds }; dealsThatWork(nA, nB) → the ks with
//        nothing left (the common divisors, fewest first); mostLots(nA, nB) → { k, x, y } (k = gcd);
//        answerOf(nA, nB, tries, said) → { kind: 'ok'|'deal'|'bigger'|'open', k? }; dealReducer / initDeal / dealResult
{ kind: 'deal',
  a: { n: 40, item: 'rose' }, b: { n: 56, item: 'lily' },   // item: 'rose' | 'lily' | 'date' | 'fig' (drawn in SVG by
                                                       //   InquiryDeal.jsx › GLYPHS); n ≤ 60 each
  lot: 'vase' | 'basket',                              // the drawn lot
  choices?: [2, …, 12],                                // the chips of k (≤ 12 lots drawn); MUST include gcd(nA, nB):
                                                       //   the most he may type is max(choices)
  minTries?: 4,                                        // tries before the answer is offered
  text: {
    lead: (a, b) => …, goal: (a, b) => …,              // a, b = spec.a, spec.b; goal plain
    choose: ({ a, b, tried }) => …,                    // « how many lots? » (tried = tries so far)
    ask: ({ a, b, k }) => …,                           // BEFORE the deal: will everything be shared? (yes / no)
    dealt: (f) => …, again: (f) => …,                  // f = { a, b, k, qA, qB, restA, restB, ok, guess } — after the
                                                       //   deal; a k already tried, shown again
    cols: { lots, a, b, left },                        // plain — the labels of the table's rows
    toAnswer, back, check,                             // buttons
    answerLead: ({ a, b }) => …,                       // the most lots, and what one lot holds
    lotsUnit, unitA, unitB,                            // plain — the units printed after the three boxes
    miss: (f) => …,                                    // f = { a, b, kind: 'deal'|'bigger'|'open', said: { k, x, y },
                                                       //   row } — row = the column shown (null for 'open': say only
                                                       //   that a number he has not tried is still open)
    ok: ({ a, b, said }) => …,
    bound: ({ a, b, max }) => …,                       // a box left empty, or k outside 1 … max
    yes, no, done,
  } }
// result: { tries: [{ k, guess, restA, restB, ok }], most, perLot: [x, y], answers: [{ k, x, y, kind }] }
//         (guess null for a deal the world made of his answer)
//         hooks: data-iq-k, data-iq-dealt=<rounds shown>, data-iq-choice=<k>, data-iq-say="yes|no",
//                data-iq-pile="a|b" + data-iq-count=<on the table>, data-iq-lot=<i> + data-iq-holds="x,y",
//                data-iq-table, data-iq-try=<k> + data-iq-ok="1|0", data-iq-to-answer, data-iq-in="k|x|y",
//                data-iq-check, data-iq-back
```

World sounds: summit — `sweep` + `plank` (a try laid), `spark` (a new best), `pick` + `plank` + `success` / `crumble`
(the outside prediction, each plank of the descent), `gate` (the crown), `sweep` per plank the world lays alone, `key` /
`fail` on the count of mode `first`; deal — `pick` (a chip, his « yes / no »), `sweep` per round dealt, `success` /
`crumble` against his prediction, `key` / `fail` on his answer. Tests: `summit.test.js` (the descent's crown IS the gcd
and every plank before it fails the longer gap, for every pair up to 200; one try exactly when the shorter gap fills the
longer; the outside answer never fills both; the state machine played through both modes), `deal.test.js` (every deal
is a Euclidean division; the ks that work are the common planks and the most is the gcd, for every pair up to 80; an
answer is never met by the most; the state machine), `inquirySummit.render.test.jsx`, `inquiryDeal.render.test.jsx`
(stages rendered from the reducer; every item a drawn symbol, 60 + 60 in 12 baskets).

**Spec shape of `lists`** (2026-11-19, for lesson 5 `tayin-pgcd` — the same conventions: `T` = `spec.text`, `$…$`
allowed unless « plain », no sentence states the rule nor names the longest common plank, `data-iq`, `data-iq-stage`,
`data-iq-goal`, `data-iq-calc`, `data-iq-fact`, `data-iq-next`, `data-iq-found`, `window.__inquiry`; `writes` is not set;
a reducer and a pure view like `cycle`):

```js
// lists — logic: lists.js › divisorsUp(n) → the planks of n, shortest first; plankFill(n, d) → { n, d, q, r, fills, partner };
//         addPair(list, n, d) → the list with d and n ÷ d, sorted; isComplete(n, list); missingPlank(n, list) → the
//         shortest plank missing (its partner is missing too) | null; columnsOf(listA, listB) → the aligned columns;
//         commonPlanks(a, b); longerLinked(links, d) → the shortest linked plank longer than d;
//         state machine listsReducer / initLists / listsNow / listsResult
{ kind: 'lists',
  crown?: false,                                       // false: no round asks the longest — it ends on the links
  rounds: [{ a, b, crown? }],                          // a, b ≥ 1, up to ~120 (≤ 16 planks a list, ≤ 22 columns: 84 and 120);
                                                       //   a round's `crown` overrides the spec's. `crown: false` makes a
                                                       //   bench that gives facts and stops (lesson 5's workshop): « all
                                                       //   linked » → `seen` (linksDone is its last fact), no longAsk /
                                                       //   longer / crowned, picks [] and no data-iq-crown
  text: {
    lead: (a, b) => …, goal: (a, b) => …,              // the question of the round; the goal (plain)
    listLabel: (n) => …,                               // plain — the label of a list (SVG: above the first, under the second)
    buildAsk: ({ n, list }) => …,                      // while the list of the gap n is built (list = the planks so far)
    unit, lay, claim,                                  // plain unit of the box; the button; « the list is complete »
    bound: ({ n }) => …,                               // a length out of 1 … n (or an empty box)
    fills: ({ n, d, q }) => …,                         // d fills: its partner q is written, both join the list
    again: ({ n, d, q }) => …,                         // d fills but is already in the list (nothing added)
    misses: ({ n, d, q, r }) => …,                     // d leaves a piece: nothing added
    missing: ({ n, d, q }) => …,                       // « complete » said early: the plank d is laid, a fact
    closed: ({ n, d, q, list }) => …,                  // the world closes the list (d, q: the pair that completed it)
    go,                                                // the button after a closed list (the second gap, then the links)
    linkAsk: ({ a, b }) => …, allLinked,               // « tap the planks of both lists »; « I linked them all »
    linked: ({ a, b, d, from, qa, qb }) => …,          // from = 'a' | 'b', the list he tapped
    unlinked: ({ a, b, d, from, n, q, r }) => …,       // n = the OTHER gap, n = d × q + r with r > 0
    linkMissing: ({ a, b, d, qa, qb }) => …,           // « all linked » said early: the link d shown
    linksDone: ({ a, b, links }) => …,                 // every link made
    longAsk: ({ a, b }) => …,                          // « which linked plank is the longest? » (he taps it)
    longer: ({ a, b, d, longer }) => …,                // a shorter pick: the longer linked plank shown
    crowned: ({ a, b, d, picks }) => …,                // the end of the round (picks: every pick, in order)
    foundLine: (r) => …,                               // r = the round of the result — kept in the list
    next, done,
  } }
// result: { rounds: [{ a, b,
//             typed: { a: [{ d, fills, known }], b: […] },   // every plank he typed (known: already in the list)
//             lists: { a: [...], b: [...] },                 // the two lists (complete: the world closes them)
//             early: { a: [d…], b: [d…], links: [d…] },      // the plank shown each time he said « complete » / « all
//                                                            //   linked » too early
//             taps: [{ d, from, holds }],                    // every link he made, right and wrong
//             links: [...], common: [...],                   // his links at the end (= common) and the truth
//             picks: [d…], firstPick, longest }] }           // his picks of the longest; longest = gcd(a, b)
//         hooks: data-iq-side="a|b", data-iq-pair="a:b", data-iq-crown=<d>, data-iq-strip="a|b", data-iq-in="plank",
//                data-iq-lay, data-iq-complete, data-iq-go, data-iq-all-linked,
//                data-iq-list="a|b" + data-iq-items="1,2,4,…", data-iq-chip=<d> + data-iq-chip-state=
//                "new|partner|now|linked|wrong|hint|picked|longer|crown|" (a plank to tap carries role="button":
//                `[data-iq-list="a"] [data-iq-chip="4"]`), data-iq-links="1,2,4"
```

World sounds: lists — `sweep` (a plank typed), then `plank` (it fills) + `spark` (its partner joins the list) or `hit`
(a piece left), `gate` when the world closes a list, `pick` for a refused length or an empty box; `fail` + `plank` on
« complete » or « all linked » said early, `key` when every link is made; `pick` + `plank` + `success` / `crumble` on a
link; `pick` + `plank` + `gate` / `fail` on the longest. Tests: `lists.test.js` (every list built by pairs from the planks
up to √n is complete, every missing plank shown is a real plank with its partner missing too; for every pair up to 120
the planks that link from either list are exactly the common planks and the longest is the gcd, a shorter pick always
has a longer linked plank; the widest pair, 84 and 120, gives 22 columns ≥ 40 units; the state machine played through
pairs up to 120 and through every wrong move; `crown: false` on the spec or a round), `inquiryLists.render.test.jsx` (a
round PLAYED through the view: partner in gold, a piece, « complete » early, the closed list, the aligned columns, a wrong
link, a missing link, a shorter pick, the crown; a round with `crown: false` ending on its links; the widest pair drawn
with SVG text ≥ 18 units).

**Spec shape of `sort`** (2026-11-19, for lesson 7 `awwaliyan-fima-baynahuma` key 1 and lesson 8 `ikhtizal-kasr` key 2 —
the same conventions: `T` = `spec.text`, `$…$` allowed unless « plain », no sentence states the rule, and the baskets are
NOT named by the mathematical name before the key is forged — the kit writes no word of its own (its render test fails
on one Arabic letter of its own); `data-iq`, `data-iq-stage`, `data-iq-goal`, `data-iq-calc`, `data-iq-fact`,
`data-iq-next`, `window.__inquiry`; `writes` is not set; a reducer and a pure view like `cycle`):

```js
// sort — logic: sort.js › truthOf(a, b) → 'one' | 'more' (gcd = 1 or not); listsOf(a, b) → { a, b, common } (shortest
//        first); summitFactsOf(a, b) → { short, long, all, tried: [{ d, q, r }], stop } (stop = gcd); ladderFactsOf(a, b)
//        → [{ a, b, q, r }] (Euclid, down to r = 0); toolSteps(tool, a, b); witnessOf(a, b, said) → null (his basket is
//        the card's) | { kind: 'common', d, qa, qb, both } | { kind: 'none', short, long, planks: [{ d, q, r }] };
//        answerSteps(w); sortProblems(spec) → [] when the spec can be played (the lesson's test asserts it);
//        state machine sortReducer / initSort / sortResult / basketsOf
{ kind: 'sort',
  as: 'pair' | 'fraction',                             // a card is (a ; b), or a/b drawn with a real bar (a = numerator)
  cards: [{ a, b }],                                   // 5 … 8 cards, 1 ≤ a, b ≤ 700; both baskets must get a card
  instruments: ['lists', 'summit', 'ladder'],          // the instruments he OWNS, any of them (none allowed)
  text: {
    lead: ({ as, n }) => …, goal: ({ as }) => …,       // the question; the goal (plain)
    baskets: { one, more },                            // plain — the names of the two baskets (the lesson's words)
    ask: ({ a, b, as, tool }) => …,                    // the line over the buttons (tool null: none opened yet)
    tools: { lists, summit, ladder },                  // plain — the buttons that open an instrument
    panel: { lists: (now) => …, summit: (now) => …, ladder: (now) => … },  // plain — the label over each panel of
                                                       //   facts (SVG); now = { i, a, b, as, truth, short, long };
                                                       //   `summit`'s also labels the world's answer « none but 1 »
    seen?: (f) => …,                                   // optional, the fact line under a finished instrument: f = { tool,
                                                       //   a, b, as, short, long } + lists { common } | summit { tried,
                                                       //   stop } | ladder { rows, last } — numbers only: never the basket
    placed?: (card) => …,                              // optional, the fact line when the next card comes (card = the
                                                       //   result entry of the card just placed)
    answer: (f) => …,                                  // a card in the other basket, after the world's answer: f = { a, b,
                                                       //   as, said, truth, ...witnessOf(a, b, said) }
    end: ({ one, more }) => …,                         // the hand is sorted: how many cards in each basket
    next, done,
  } }
// result: { cards: [{ a, b, as, said: 'one'|'more', truth: 'one'|'more', instrument: 'lists'|'summit'|'ladder'|null,
//                     firstTry }] } — in the order he played them (firstTry = said === truth: one drop per card)
//         hooks: data-iq-as, data-iq-pair="a:b", data-iq-tool=<opened|''>, data-iq-card=<i> (the card he drags),
//                data-iq-basket="one|more" + data-iq-count, data-iq-placed="a:b" + data-iq-moved="0|1" (a card in a
//                basket), data-iq-hand=<i> + data-iq-left=<cards left>, data-iq-open="lists|summit|ladder",
//                data-iq-strip="a|b", data-iq-panel="lists|summit|ladder|none|common", data-iq-common="1,17",
//                data-iq-list="a|b", data-iq-plank=<d> + data-iq-both="1|0" (lists) or data-iq-rest=<r> (a plank laid),
//                data-iq-laid="85,17", data-iq-rows, data-iq-row=<k>, data-iq-witness=<d>
//         window.__inquiry = { kind, stage, ci, a, b, truth, tool, shown, said, hand, placed }
//         stages: card → [tool → card] → (its basket) the next card … → end
//                                      → (the other basket) answer → answered → next → the next card … → end
//         a walk drags with the pointer (data-iq-card onto data-iq-basket) or clicks the basket; « next » = data-iq-next
```

World sounds: sort — `pick` (an instrument opened), then `sweep` per fact of the lists and the ladder, `plank` per plank
of the summit and `gate` when it stops; `ui` (a card picked from his hand); `success` (a card in its basket) and `key`
when the hand is sorted; `crumble` (a card in the other basket), then `plank` per plank the world lays and `gate`; `pick`
on « next ». Tests: `sort.test.js` (the basket of a card is `one` exactly when 1 is its only common plank, for every
pair up to 200; the lists' marked planks are exactly the common planks; every rest of the summit is a Euclidean
division and it stops on the gcd; every row of the ladder is a division, chained, ending on the gcd; the world's answer
is a witness — a plank longer than 1 that fills both gaps, or every plank of the shorter gap with only 1 leaving no
rest — for every pair up to 200; the state machine played through right and wrong drops, a card picked from the hand,
fraction cards), `inquirySort.render.test.jsx` (mounted by `Inquiry`; the three panels; a 650-cell gap drawn as bars; a
hand PLAYED through the view's own buttons — found by their `data-iq-*` hook in the element tree and pressed —, both
answers of the world, the end with both baskets; fraction cards with KaTeX's bar).

**Spec shapes of `measure` and `part`** (2026-11-19, for lesson 8 `ikhtizal-kasr` keys 1, 3 and 4 — the same
conventions: `T` = `spec.text`, `$…$` allowed unless « plain », no sentence states the rule or names it (« اختزال »,
« غير قابل للاختزال », « PGCD » are the lesson's to say after the forge), the kit writes no word of its own (both render
tests fail on one Arabic letter of the kit's); `data-iq`, `data-iq-stage`, `data-iq-goal`, `data-iq-calc`,
`data-iq-fact`, `data-iq-next`, `data-iq-found`, `window.__inquiry`; `writes` is not set; each a reducer and a pure view
like `cycle`). A fraction on screen is always KaTeX `\dfrac{p}{q}` (`InquiryMeasure.jsx › fracTex`, `chainTex`); a typed
fraction is `FracTpl` (two boxes over a bar, `data-iq-in="num"` / `"den"`), shared by both screens:

```js
// measure — logic: measure.js › planksUp(n) → the planks of n longer than 1, shortest first; bothPlanks(p, q);
//          checkOf(p, q) → { tried: [{ d, r, fills }], found } (the planks of p tried on q, stopping on the first that
//            fills; found null ⇔ gcd(p, q) = 1); countAgain(p, q, d) → [p/d, q/d] | null; roadEnd(a, b, road);
//          lastOf(a, b) → [a/g, b/g]; firstsUsed(state); state machine measureReducer / initMeasure / measureNow / measureResult
{ kind: 'measure',
  chips?: [2, 3, …],                                   // candidate planks for every round (a round's own `chips` wins);
                                                       //   none: the typed box only (always on screen)
  rounds: [{ a, b,                                     // a above (numerator), b below; up to ~130 cells (one scale)
             mode?: 'stages' | 'direct',               // default 'stages'
             runs?: 2,                                 // stages: the roads asked (clamped to the planks that open one)
             chips? }],
  text: {
    lead: (a, b, mode) => …, goal: (a, b, mode) => …,  // the question; the goal (plain)
    pickAsk: ({ a, b, p, q, mode, stage, run }) => …,  // the line over the controls (p/q = the fraction now)
    unit, lay, end,                                    // plain — the unit of the box; the buttons (end: « no plank but
                                                       //   1 fills both », stages only)
    bound: ({ a, b, p, q, max }) => …,                 // a length out of 2 … max, or an empty box
    sameRoad: ({ a, b, d, used }) => …,                // a second road opened with a plank already used
    refused: (f) => …,                                 // f = { a, b, p, q, ...plankOn(p, q, d), at } — laid, nothing changes
    counted: ({ a, b, d, from, to, stage }) => …,      // the strips counted again: from = [p, q], to = [p/d, q/d]
    checkLabel: ({ p, q }) => …,                       // plain — over the planks the world tries
    checkSeen: ({ a, b, p, q, tried, found }) => …,    // his end claim answered by a plank that still fills both
    runEnd: (f) => …,                                  // a run (or the direct round) ended: f = { a, b, mode, run, end,
                                                       //   chain, predicted, same (every run so far ended on the same
                                                       //   fraction), p, q, tried, found }
    notEnough: ({ a, b, d, end, p, q, tried, found }) => …,   // direct: one stage was not enough
    predictAsk: ({ a, b, run, ends }) => …, predictGo, // before a second road: where will it end?
    again,                                             // direct: the button back to the fraction given
    runLine: ({ run, chain, end }) => …,               // a run of this round kept in the list (chain = TeX of its chain)
    foundLine: (r) => …,                               // r = the round of the result — kept in the list
    next, done,
  } }
// result: { rounds: [{ a, b, mode, runs: [{ stages: [{ d, from: [p, q], to: [p, q] }], end: [p, q], predicted: [p, q] | null,
//                      checks: [{ at: [p, q], found }] }], refused: [{ d, at: [p, q] }], final: [p, q] }] }
//         (direct: each attempt is a run of one stage; an attempt whose check found a plank is « not enough »)
//         hooks: data-iq-mode, data-iq-pair="a:b", data-iq-frac="p:q", data-iq-run=<runs ended>,
//                data-iq-strip="a|b" + data-iq-count, data-iq-chain="66/78,22/26", data-iq-chip=<d> + data-iq-chip-state="no|",
//                data-iq-in="plank|num|den", data-iq-lay, data-iq-end, data-iq-check="2:0,11:1" (+ data-iq-tried=<d>),
//                data-iq-predict, data-iq-again
//         window.__inquiry = { kind, ri, stage, mode, a, b, cur, chain, last, runs, check, rounds }
//         stages: pick → lay → pick … ; pick →(end) checkRun → pick | predict → pick … | seen
//                 direct: pick → lay → checkRun → again → pick … | seen

// part — logic: part.js › partOf(round) → { whole, strokes, painted } (throws on a round that cannot be drawn);
//        recutOf(painted, whole, d) → { to, cuts, paintedEnd } | null; reuses measure.js › checkOf, countAgain;
//        state machine partReducer / initPart / partNow / partResult
{ kind: 'part',
  chips?: [2, 3, 13],                                  // as in measure (a round's own `chips` wins)
  rounds: [{ whole: 39, strokes: [5, 8], chips? }],    // whole up to ~130 cells; the strokes sum to less than the whole;
                                                       //   a round whose part and whole share only 1 is allowed
  text: {
    lead: (whole, strokes) => …, goal: (whole, strokes) => …,
    painted: ({ k, stroke, so, whole }) => …,          // a stroke painted (k = how many; so = the strokes painted)
    writeAsk: ({ whole, strokes }) => …, write,        // the template « □ over □ » and its button
    writeMiss: ({ said: { p, q }, painted, whole, okP, okQ }) => …,   // which count differs — never « wrong »
    written: ({ p, q }) => …,                          // the writing accepted (cells over cells)
    pickAsk: ({ painted, whole }) => …, unit, lay, none,   // none: « no plank but 1 fills both » (plain)
    bound: ({ whole, painted, max }) => …,
    refused: (f) => …,                                 // f = { painted, whole, ...plankOn(painted, whole, d) }
    checkLabel: ({ painted, whole }) => …, checkSeen: ({ p, q, tried, found }) => …,
    recut: ({ d, from, to }) => …,                     // the strip re-cut: from = [painted, whole], to = the new writing
    unchanged: ({ painted, whole, laid, tried, found }) => …,   // his claim held: no re-cut changes the writing
    foundLine: (r) => …, next, done,
  } }
// result: { rounds: [{ whole, strokes, writes: [{ p, q, ok }], tried: [d…], claims: [{ found }], cut, final: [p, q] }] }
//         (cut = the unit of the re-cut, 1 when none; one re-cut ends the round)
//         hooks: data-iq-whole, data-iq-painted=<cells painted so far>, data-iq-cut, data-iq-writing="13/39,1/3",
//                data-iq-strip="whole", data-iq-stroke=<len>, data-iq-laid=<d>, data-iq-in="num|den|plank",
//                data-iq-write, data-iq-chip, data-iq-lay, data-iq-none, data-iq-check, data-iq-chain
//         window.__inquiry = { kind, ri, stage, whole, strokes, painted, cut, writing, check, rounds }
//         stages: paint (the world, a tick per stroke) → write → pick → lay → seen | pick ; pick →(none) checkRun → pick | seen
```

World sounds: measure — `pick` (a chip refused before laying, his claim, his prediction), `sweep` + `plank` (a plank
that fills both) or `hit` (one that leaves a piece), `spark` (the strips counted again), then per plank the world tries
`sweep` (it leaves a piece) or `plank` (it fills); after his claim `success` / `crumble`, `gate` when a run ends, `key` /
`fail` on his prediction of the second road; direct: `gate` (one stage was enough) / `crumble` (not enough). part —
`sweep` per stroke painted, `key` / `fail` on his writing, `sweep` + `plank` / `hit` on a plank, `spark` on the re-cut, the
check as in measure. Tests: `measure.test.js` (for every fraction with terms up to 130: every road ends on a/g over b/g —
all roads enumerated —, one stage ends it exactly with the gcd, a refused plank fills one strip at most, the check finds
a plank exactly when gcd > 1, the chain's fractions are equal; the state machine played through both modes, wrong moves
included — out of range, a refused plank, a wrong claim, the same first plank twice —, and 600 random roads through the
reducer), `part.test.js` (for every whole up to 130 and every painted part: a re-cut exists exactly when the plank fills
both, the painted end never moves and is a cut; the state machine through a wrong writing, a refused plank, a wrong
« none », the round with only 1 in common; every part up to 60 played to its final writing),
`inquiryMeasure.render.test.jsx`, `inquiryPart.render.test.jsx` (mounted by `Inquiry`; each mode PLAYED stage by stage
from the reducer — chain, divisions, the world's check, the prediction template, « again »; 130 + 117 cells drawn; the
paint drawn at the same place before and after the re-cut).

The lesson's own test must check that every `ok` card `holdsOn` every sample, that every false card is refuted by one
(`refuteCard(...) !== null`), that `checkProofOrder(cards, order, statement.gives).ok`, and that `order` holds exactly
the ok cards. World sounds: join — `sweep` (the strips move), `plank` / `hit` (laid again / cut), `success` / `crumble`;
stack — `plank` per copy (`sweep` when packed), then `success` / `crumble`; peel — `plank` per plank laid, `gate` when the
piece is left; letters — `key`, `fail`, `crumble`, `paper`, `success` on the student's own moves.

**An experiment opens on its QUESTION and its GOAL, and each try shows its calculation** (owner, 2026-11-17: « the
student must be given the goal … each one we see the rest of the division: x = c × 2 + d, and if d = 0 the cell becomes
green »). On the chart, while he tests, three lines in the owner's words: the question (`text.lead(b)` — « ما هي الهوّات
التي يمكن تشكيل جسر لها باستخدام لوح طوله 5؟ »), the goal in its own frame (`text.goal(b)` — « الهدف: معرفة تلك الهوّات
فقط من شكلها، دون تقسيم طولها في كلّ مرّة على العدد 5. ») and what to do now (`text.how`). They say WHAT is looked for, never what the
reading is (a test of the lesson forbids the words of the readings in them). Every gap he tries writes ITS division
`n = q × b + r` (the last four stay, the newest large; the newest only on a phone) with « الباقي r » beside it; the cell turns
**green** exactly when r = 0 — green means « rest 0 » everywhere on the chart, and a cell his lens takes in is outlined
in cyan. A new kind opens the same way: the question, then the goal, in one sentence each, on screen while he acts.
His CLAIM is laid as an Arabic sentence, RIGHT TO LEFT (owner, the same day: « numbers in the left side and the arabic
choices in the right, rtl »): the three lenses in a column on the right, the plank's LINK in the middle, then the numbers
he presses on the left, in columns read downwards (five to a column, three on a phone). A plank says its claim in
one of two ways (`link` on the plank; words `text.link`; logic `inquiry.js › claimValues`): **`equals`** — « رقم الآحاد ·
يساوي · 0 أو 5 », he gathers the VALUES of the lens (planks 5 and 2); **`divides`** — « مجموع الأرقام · يقبل القسمة على ·
9 », he presses ONE number among `divisors` (2…9) and the claim takes every gap whose lens shows a number divisible by it
(planks 9, 3 and 4 — owner: « use يساوي for 5 and 2, for others use يقبل القسمة على »). Said that way a reading holds on
every hundred, where a list of values would not: the sum lens offers every sum a hundred shows (`LENSES.sum.values(from)`
= 1 … the hundreds' own digit sum + 18 — 18 on the first chart, 19 on 100–199, 27 on 900–999, so a sum of 27 is taken
too; `inquiry.test.js` checks 3 and 9 on every hundred up to 1999). In `qawasim-adad-tabii` (the lesson these owner's
words were given for, 2026-11-17) a test of the lesson requires that exactly
one lens with one number holds for each of them: the sum of the digits for 9 and for 3, and for 4 the lens the owner
named — « العدد المكوّن من الآحاد والعشرات » (`last2`), offered to plank 4 only. Plank 4's former side road (« no lens
separates this chart », the same cells in every hundred, long gaps placed on the one chart) was removed with it: with
that lens the sentence « no lens separates » would be false. (1AM `qawaid-qabiliyat-qisma` charts only planks 5, 2, 9
and 3; its plank 4 is played on `join` — the OPEN note under the table of kinds.)

**What the world does alone is HEARD** (owner, 2026-11-17: « add sound effect when completing the numbers here »): while
the chart is filled by the world (« أكمل الجدول », then the next hundreds) each step plays `sweep` (a count that climbs),
`spark` when a cell lights in that step (`inquiry.js › lightsIn` — a plank's own rhythm, a fact, never a verdict) and
`gate` when the chart is full. The sounds are synthesised in `engine/audio.js` (`play(name, p)`, no sound file). An
animation of a new kind that the student only watches gets its sound the same way.

**To add a kind**: its pure logic in the world's `inquiry.js` (tested apart: the experiment is true for every number it
may show), its screen in `Inquiry.jsx`, its words in the lesson. **To use one**: the lesson's `world/inquiries.js` and
`inquiry` + `fromInquiry` on its forge (`qawasim-adad-tabii` is the reference). Before writing a forge, ask what the
NATURE of its rule is: one condition on a case → the mirror alone; anything else → an experiment first.

**Lesson 3 (`khawass-qawasim`) uses the four new kinds, one per key** — `jam-wal-farq` on `join`, `madaaf` on `stack`,
`baqi-qisma` on `peel` (`writes`), `burhan` on `letters` (`writes`); its `world/inquiries.test.js` fails if two keys share a
kind. Two things the walk of that lesson taught, now rules of the kit: (1) a judged row of `judgePeelClaim` keeps its
columns as booleans (`a`, `b`, `r`) and names its round by `gap` and `bridge` — a screen matches a row by those, never by
`a`/`b`; (2) the statement block of `letters` puts every piece of `MathText` in its own `<span>`, or a grid lays one token
per row. The exam sheet of « تدرّب » (`kit/Trainer.jsx › Marked`) prints a prompt as plain text with its numbers
underlined; a prompt that contains `$…$` is rendered through `MathText` instead, so a formula in a prompt is allowed.
`rf-says`, the labels of `RuleForge` and a tablet's `notes` stay plain text: no `$` in them.

**Lesson 4 (`qasim-mushtarak-akbar`, 2026-11-19) — two keys found on the islands, two on experiments** (design:
`docs/reports/BATCH_2_DESIGN.md` §3 and §7): `qawasim-mushtaraka` on the CONVOY « twins » (the planks of island A — 7, 11,
13, 9 — build 198 then 234, island B has none; the instruction names both gaps before he picks, the card on B recalls the
first bridge, the card on C what each plank he fired did) and `al-akbar` on the convoy « crown » with a PURSE of 42 coins
(the planks 2, 7, 14 of island C all fill 266 and 322; only 14 pays for both bridges, 19 + 23). Their forges have NO
`inquiry`: `evidence(log)` turns the world's log of bridges into one line per plank fired on the pair, the kit opens them
on predictions of new pairs (`predictCases`, five each), then the tiles (12 and 9 rules); every wrong rule falls on his
lines or by an attack, whatever road he took (one plank at once, or every plank) — `world/forges.test.js`.
`baqat-mutamathila` on `deal` (40 roses and 56 lilies into identical vases: the numbers of
vases that work, the most, what one vase holds); `qawasim-al-pgcd` on `nest` (228 and 276 against 12: the planks of both
gaps are the planks of their longest). Its `world/inquiries.test.js` fails if the two experiments share a (kind, mode) or
an island's sentence names a rule before its tablet. What its walks taught, now in the kit: the forge's log offers EVERY
row while the mirror tests (a refuting row older than the last
`EVIDENCE_MAX` had left the screen); the summit's chips run right to left like the line above them; a « PGCD(a ; b) »
written in the words of a bank line is drawn as a formula at display (`kit/bankSitting.js › namesAsMath`); the mirror of
`baqat-mutamathila` draws every case as a SHARING (`c.deal`, §2sexies « A case that is a SHARING »), never a bridge — its
walk asserts it and that no text of that screen says « لوح ». The last bridge needs the lesson: the market's walkway is
TWO stretches, 364 (roses) then 286 (lilies), and one kind of plank must fill each, the longest there is — the store offers
28 (it fills the roses' stretch alone, 286 = 28 × 10 + 6) and 26 = PGCD(364 ; 286); the store still divides the whole
walkway (650 = 28 × 23 + 6: the same 6 cells), and its failure sentence names the stretch left unfilled. Known limit:
`nest` has no claim-building step.

**Checked**: `divisorIsles/inquiry.test.js` (pairs, chart, turn, cut; `quotientTex` against an integer long division for
every a ≤ 2000, b ≤ 100) and `inquiry2.test.js` (join, stack, peel, letters: every fact true over the ranges written in
its header — the numbers the lessons give today with room above: join gaps ≤ 160 and planks ≤ 40, stack ≤ 1000 copies,
peel gaps ≤ 1000 and bridges ≤ 300 —, a lesson that gives more widens them; exactly one peel claim holds),
`inquiryDivision.test.js` (groups, rebuild, estimate, bracket:
a = b × q + r with 0 ≤ r < b over every gap up to 400 and plank up to 40, every two-digit plank on every gap up to 9999,
planks up to 1000; only the right bracket accepted), `inquiryScreens.render.test.jsx`,
`inquiryDivision.render.test.jsx` and `inquiryGcd.render.test.jsx` (the screens open on their question, goal and first
act), `inquiryStages.render.test.jsx` (groups, rebuild, estimate, bracket, common, ladder, nest and chart PLAYED past their
first screen — a prediction answered, the world's fact, the next stage —, plus the guards of join and letters: the
screen is called as a function with a three-hook store and fake timers, no DOM), the lesson's `world/inquiries.test.js`, and the lesson's walk, which plays
both experiments through their screens (a wrong pick, a wrong lens, the right claim, the next hundred) and, at each
screenshot, that nothing leaves the frame, no button is covered, nothing scrolls and no text is under 12 px.

## 3. Files

Since 2026-11-17 the code is in THREE places (Phase 0 of the lesson v2 rollout, kit extraction — in progress, see the
state line under the tables):

1. **the kit** `apps/web/src/lessons/common/gameworld/kit/` — lesson-independent; it names no lesson and imports none
   (`kit.test.js` drives it with a toy lesson and reads its files for the boundary);
2. **the lesson's content** `<lesson folder>/world/` — the pilot's is
   `lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii/world/`;
3. **the world** `gameworld/divisorIsles/` — the three.js scene and its mechanic, and, until the next sub-steps move
   them, the React screens.

**The kit** (`gameworld/kit/`)

| File | What it is | What the lesson gives it |
|---|---|---|
| `random.js` | `rng(seed)`, `int`, `pick`, `shuffle`: everything generated takes a `rand`, so the tests replay it | — |
| `ladder.js` | the practice ladder: fair waves, runs, what is open, the next level, the stars; `buildWave` for generators | `createLadder({ nodes, generators, isRight })` |
| `trainer.js` | « تدرّب »: six questions, game, game, exam, game, exam, exam; the stars of a session | `createTrainer({ kinds, plans, planOf, fallback })` |
| `sitting.js` | « الامتحان الأبيض »: the frame — `answered`, `forgotten`, `pace`, the stars, `PASS` | — |
| `bankSitting.js` | the sittings served from the lesson's BANK as it is: the levels, a subject drawn from a level, the marking by the practice evaluator, « دج » at display, the model copy and hints, what the hand-in sends; tests `bankDisplay.test.js` (every sheet of the v2 banks drawn, no « DA » of money left) and `sittingSat.test.js` (every copy is evidence; quitting costs nothing) | `createBankSittings({ lesson })` |
| `bankEvidence.js` (+ `bankEvidence.test.js`) | sends a handed-in copy to the practice engine (session, attempts, raw answers) and keeps what could not be sent (sent, queued, refused, the flush race) | — |
| `storyEnd.js` (+ test) | the END of the story completes the lesson: `storyFinished(save)`, every module of the config marked done (a finished save repairs an older student's progress); mastery untouched (`LESSON_V2.md` §1ter) | its `lesson.config.js` modules |
| `journey.js` | the road: when the exam space opens, a promotion, « تقدّمي », the ONE next step | `createJourney({ keys, ladder, levels, stages, cards })` |
| `evidence.js` | which answers count (first try, no help), the id of the الكفاءة, the payload sent; `guardEvidence` drops a TRUE claim made on an answer the lesson's `check` refused (`LESSON_V2.md` §1bis) | `createEvidence({ grade, points })` |
| `evidenceSend.js` | the POST to `/lessons/{code}/game-evidence` and the retry queue (§4) | — |
| `tips.js` (+ test) | « حيلة »: the calculation shortcuts, given only when one clearly helps | — |
| `longDivision.js` (+ test) | the long division as it is written and said on paper, its twin (used by `Paper.jsx` and by « مختبري ») | — |
| `LessonContext.jsx` | `<LessonProvider lesson={…}>` and `useLesson()`: the ONE way a screen of the kit reaches the lesson | the pack (below) |
| `text.js` | `TX` (spaces, « تقدّمي », a case, the knowledge page) and `KT` (the shell: title screen, HUD, hub, a run, a tablet, the end): the kit's chrome. No sentence of a lesson or of a world | — |
| `Fit.jsx` | the box of every panel: it never scrolls, it fits (§2ter) | — |
| `Paper.jsx` | the paper mode: the gate, the sign, the long-division model sheet | — |
| `Spaces.jsx` | `ExamLadder`, `Promotion`, `ProgressPage` (« تقدّمي ») | `journey`, `sittings`, `rules`, `cards`, `evidence` |
| `ExamSitting.jsx`, `examSitting.css` | the screen of « الامتحان الأبيض » (§2quater): the bank's sheets, the practice widgets | `sittings` (from `createBankSittings`), `rules`, `keys`, `evidence` |
| `Trainer.jsx` | the screen of « تدرّب »: it draws a tap, a true / false, or a FORM the lesson describes | `trainer` |
| `KnowledgePage.jsx` | the full-page « خريطة المعارف » | `knowledge`: `{ graph, modules, positions }` |
| `LessonWorld.jsx` | **the shell**: the canvas, the top bar, the controls, the overlay switch; it mounts `<LessonProvider>` and creates the world's game | `world` (below) and the pack |
| `Title.jsx`, `PracticeHub.jsx`, `Tablet.jsx`, `Result.jsx`, `End.jsx` | the title screen, the practice hub (the lesson's mind map as a level select), a rule tablet, the result of a level, the end | `ladder`, `journey`, `rules`, `keys`, `text`, `practiceMap` |
| `claims.js` (+ test) | the kinds of claim a game answer can make and `verifyClaim` — the browser's copy of the server's `ClaimVerifier` (one fixture) | — |
| `forge.js`, `RuleForge.jsx`, `ruleForge.css` | « مصهر القاعدة »: the frame of a rule forge (pure) and its screen — predict, write the rule with tiles, the mirror tests and attacks it, seal, use (§2sexies) | `forges` (one description per key) and the world's `parts` |
| `parts.jsx` | a formula, the toast, the robot's bubble, the touch stick, a card over the world, three stars, a box for a number | — |
| `styles/` | eleven style sheets, one per screen (`world`, `practice`, `knowledge`, `cases`, `trainer`, `paper`, `steps`, `knowledgeJourney`, `fit`, `spaces`, `phone`), imported by `styles/index.js` **in the order of the cascade** — `fit.css` and `phone.css` override the others, so a new sheet takes its place in that list and is never imported from a screen. Classes `di-…` | — |
| `saveSync.js` (+ test) | the browser's copy of the save (`readSave`, `writeSave`) and its copy on the server: `pullSave` before the world mounts, `schedulePush` after a save (`LESSON_V2.md` §1ter) | — |
| `../LessonGameWorld.jsx` | the LOADER of a lesson's world: the world chunk, the lesson's content and the server's save arrive together behind the loading screen; one automatic reload when the load fails | the pack's `world` |
| `../worlds.js` | `WORLDS`: the worlds that exist, one `() => import()` per world (read by the entry bundle: only chunk names) | — |
| `../WorldLoading.jsx`, `../worldLoading.css` | the ONE loading screen from the click to the title (§1bis) | `lessonId`, `title`, `stage` |
| `WorldRuntime.js` | **the world runtime**: the three.js scene, the loop, the robot and its movement, the camera, the sky, the things to use, the gems, the state React reads, the hub, the knowledge page's state, the exam ladder, the paper mode, the evidence tally, the save | the pack as `lesson`; a WORLD extends it (below) |

**The pilot's content** (`…/qasim-adad-tabii/world/`, each with its test)

| File | What it holds |
|---|---|
| `practice.js` | the kinds of wave of the lesson, `isRight`, the five nodes and sixteen levels; exports the bound `ladder` and `PRACTICE_MAP` (where each node sits on the hub, its links) |
| `trainer.js` | the kinds of question, the plan of each card, `check` (hint, then correction), `solution`, `answerLabel`, `PHRASES` |
| `sitting.js` | ONE call: `createBankSittings({ lesson: '<id>' })` — the exam sittings serve the lesson's bank as it is |
| `forges.js` | the four forges of the lesson, one per key (§2sexies) |
| `journey.js` | the four keys, bound to the ladder and the levels |
| `evidence.js` | the الكفاءة of each key and the CLAIM each kind of answer makes (their verdict is the kit's `claims.js`) |
| `knowledge.js` | the lesson's graph and memo sheets (imported from the lesson, never retyped) and where each card sits on the map |
| `text.js` | the names of its levels and of its real-world worlds |
| `index.js` | **the pack**: `lesson = { keys, keysFromModules, rules, ladder, practiceMap, sittings, trainer, journey, evidence, cards, knowledge, text }` |

**The world** (`gameworld/divisorIsles/`)

| File | Role |
|---|---|
| `logic.js` (+ test) | PURE: Euclidean division, prediction options, stars, the islands and segments data, dash waves, world layout |
| `Game.js` | **the mechanic** — `DivisorIslesGame extends WorldRuntime`: islands, gaps, moulds, forge, storm, statues, last bridge, the gate dash and the real-world cases; it reads the lesson as `this.lesson` and imports no lesson |
| `DivisorIsles.jsx` | what THIS world adds to the shell: the equation and the verdict of a forge, the HUD of a run and of a case, its own overlays (prediction, stone, statues, workshop, last bridge, guidance); it defines `WORLD` and renders `<LessonWorld world={WORLD} lesson={…}>` — the ONE place of the world that names the lesson |
| `cases.js` (+ test) | PURE: the orders of « تعاونية الواحة », their steps, `judge` and its explanations |
| `Depot.js`, `Worlds.js` | the 3D worlds of the cases: the depot, the friends' table, the tiler's site; `runSim` shows what was decided |
| `ruleForge.js` (+ test), `forgeParts.jsx` (+ `forgeParts.render.test.jsx`), `dealParts.jsx` | the rule forge IN THIS WORLD: a bridge as a case, the evidence of a crossing, the law of the world as a forge (`remainderForge`), and how a case is drawn — a bridge, or a SHARING (`c.deal`) drawn with the pieces of the experiment `deal` (`dealParts.jsx`, shared with `InquiryDeal.jsx`) (§2sexies) |
| `strings.js` | every Arabic sentence, the sentence of a practice wave (`waveSay`) and the guidance after a mistake (`explain`) |
| `inquiry.js` (+ `inquiry.test.js`, `inquiry2.test.js`, `inquiryDivision.test.js`, `inquiryGcd.test.js`), `Inquiry.jsx`, `InquiryMoves.jsx`, `InquiryCombine.jsx`, `InquiryProof.jsx`, `InquiryDivision.jsx`, `InquiryGcd.jsx`, `inquiry.css` | « استكشف »: the pure logic and the screens of the experiments (§2sexies, twenty-two kinds — seven in their own files, below) |
| `cycle.js` (+ test), `InquiryCycle.jsx`, `inquiryCycle.css` (+ `inquiryCycle.render.test.jsx`) | the `cycle` kind in its own files: a reducer and a pure view (2026-11-19) |
| `summit.js` (+ test), `InquirySummit.jsx`, `inquirySummit.css` (+ `inquirySummit.render.test.jsx`) | the `summit` kind: the longest plank of two gaps and the reason to stop (2026-11-19) |
| `deal.js` (+ test), `InquiryDeal.jsx`, `inquiryDeal.css` (+ `inquiryDeal.render.test.jsx`) | the `deal` kind: two collections dealt into identical lots; its items and lots drawn in SVG (2026-11-19) |
| `lists.js` (+ test), `InquiryLists.jsx`, `inquiryLists.css` (+ `inquiryLists.render.test.jsx`) | the `lists` kind: the planks of two gaps listed by pairs, the lists crossed, the longest shared plank (2026-11-19) |
| `sort.js` (+ test), `InquirySort.jsx`, `inquirySort.css` (+ `inquirySort.render.test.jsx`) | the `sort` kind: a hand of pair or fraction cards sorted into two baskets, one instrument he owns per card, the world's witness for a card in the other basket (2026-11-19) |
| `measure.js` (+ test), `InquiryMeasure.jsx`, `inquiryMeasure.css` (+ `inquiryMeasure.render.test.jsx`) | the `measure` kind: two strips are one fraction, counted again in a plank that fills both; the chain of equal fractions; `FracTpl` (a typed fraction: two boxes over a bar) and `fracTex` / `chainTex`, shared with `part` (2026-11-19) |
| `part.js` (+ test), `InquiryPart.jsx`, `inquiryPart.css` (+ `inquiryPart.render.test.jsx`) | the `part` kind: a part of a whole painted in strokes, written, then re-cut in a plank that fills the part and the whole (2026-11-19) |
| `inquiryParts.jsx` | what every experiment screen shares: `FAST`, `expose`, `X0` / `SPAN`, `useLater`, `YesNo` |
| `inquiryScreens`, `inquiryDivision`, `inquiryGcd`, `inquiryStages` `.render.test.jsx` | the screens rendered without a DOM: their first screen, and (`inquiryStages`) eight kinds played past it |
| `../engine/builders.js`, `robot.js`, `audio.js`, `input.js` | reusable: low-poly builders, the robot, synthesised sound, keyboard + touch input |
| `../../lessonlab/` | « مختبري », the lab of every lesson — its own contract: `LESSON_LAB.md` |

**A world is a class that extends the runtime.** `kit/WorldRuntime.js` reaches a world ONLY through these hooks; a
new world implements them and nothing else of the runtime:

| Hook | What the world answers |
|---|---|
| `initWorld(save)`, `worldState(save)`, `worldSave()` | its own fields, its keys of the state React reads, its part of the save |
| `worldCentre()`, `buildWorld(rand)`, `spawnPoint()`, `restore()` | where the sea of clouds is centred, the scene, where the robot starts, the world as the save left it |
| `walkable(x, z)`, `onGround()`, `respawnPoint()`, `onFall()` | is there ground here, what standing there triggers (an arrival), where a fall brings back and what it says |
| `onStart()` | the story begins or resumes |
| `stepPhase(phase, dt)`, `lanesLive(phase)`, `stepWorld(dt, phase)`, `robotPose(phase)` | a phase of its own (a run on a rail), its animations, how the robot holds itself |
| `heading()`, `cameraShot(phase)`, `followsHero(phase)`, `fov()`, `skyTarget()` | the camera when it does not follow the robot, and the sky |
| `busy()`, `pausesWorld(page)` | may the hub open now; does this full-screen page hide the world |

The runtime gives a world: `this.scene`, `this.hero`, `this.robot`, `this.input`, `this.audio`, `this.particles`,
`tween` / `wait`, `addInteract`, `addGem`, `set` / `say` / `toast`, `this.cine` (a cinematic shot), `this.shake`,
`this.flags`, `save()`, and the lesson's data as `this.lesson`.

**What a world gives the shell** (`kit/LessonWorld.jsx` lists every field): `id`, `Game`, `stages`, `maxStars`, `text`
(its title, its story, its end), `Hud` (the middle of the screen while playing), `Under` / `Over` (its layers below
and above the kit's overlays), `overlay(o, s, game)` and `guide(o, s, game)` (its own overlays by `o.type`), and five
small answers about the state: `playing`, `busy`, `quiet`, `paperOn`, `held`.

**State of the extraction (2026-11-17).** Done: the pure logic (the six frames), the world runtime, the shell and
eleven screens. What is NOT extracted, and why:
- **the gate dash and the real-world cases** are generic ideas still written INSIDE the pilot's world — `Game.js` (they
  use its rail and its three case scenes) and, on screen, `DashHud`, `DepotHud`, `Guide`, `CaseGuide` in
  `DivisorIsles.jsx`: another world would have to write them again;
- **`cases.js` and `strings.js`** still mix kit and lesson; the lesson's content still reads `logic.js`, `strings.js`
  and `ruleForge.js` of the world (the forge itself is in the kit since 2026-11-17: §2sexies);
- **the CSS** is split by SCREEN (`kit/styles/`, 2026-11-17), not yet by OWNER: `styles/cases.css` and parts of
  `styles/world.css` (the dash, the question stone, the store of the last bridge) are the pilot's world, and every
  class is still named `di-…`. Moving them to the world would change the cascade (the later sheets override them):
  it is done when a second world exists to prove what is shared;
- **the story is the lesson's since 2026-11-17** (`lesson.story`, the pilot's `world/story.js`): its islands and gaps
  (an island may `keepMould` and hold a `feature`: `guardians`, `anvil`, `stone`; a segment may be the `boss`, have a
  `workshop` or a `storm`, and names the plank it `holdsWith`), the guardians' fact, the waves of the dash, its own
  words (`text`, laid over the world's) and what happens on the way — `onArrive`, `afterKey`, `pendingForge`, `onHold`,
  `objective`, `onStatues`, `onStone`, `onQuiz`, `onBossPaid`: functions that receive the game and use its commands.
  A story's `game.onModule(n)` marks only the modules it teaches on the way; the END of the story marks every module of
  the config (the kit, `kit/storyEnd.js` — LESSON_V2.md §1ter): a story never marks the rest itself.
  `Game.js` names no island by its number and no key any more. STILL the pilot's inside the world: its story DATA
  (`logic.js › ISLANDS, SEGMENTS, DASH_WAVES, STATUES`) and its story WORDS (`strings.js`: the robot's sentences, the
  stone's question, the store, the tablets) — a second lesson gives its own and overrides them;
- ~~the title screen still links to the classic mission player (`classicHref`)~~ — gone 2026-11-18 with the old version
  of the three v2 lessons (decision D3).
A lesson declares its content in ONE `lesson.pack.js` (`LESSON_V2.md` §1, 2026-11-17); what its world is played with is
`world/index.js`, named there (`world.content`). The world receives it as the `lesson` prop.

**The shape of an exam answer is DATA.** The kit draws what the lesson describes, and never knows its mathematics:
- a sitting question is a STEP of a bank sheet (`kit/bankSitting.js › fromBank`): its `answerType`, its bank question in
  `bank`, its points, its key; its answer is what the practice widget writes (`{ choiceId }`, `{ value }`);
- a trainer question is a `tap` (`options`), a true / false (`statement`, `truth`, `reasons?`), or a `form` — lines of
  tokens: a string, `{ strong }`, `{ text, rtl? }`, `{ num, label }`, `{ choice, options }`, `{ frac: { n, d } }` —
  `kit/trainer.js`, drawn by `kit/Trainer.jsx › FormLines`.
  **The fraction template** (2026-11-20, lesson 8 `ikhtizal-kasr` first): ONE token `{ frac: { n, d } }`, `n` and `d`
  each a box `{ num, label }` (typed) or a printed number / string (a fraction GIVEN by the statement — never `'66/78'`
  as text). It is drawn stacked: `span.di-frac` (`dir="ltr"`, `data-di-frac`, `di-frac--typed` when it holds boxes)
  around the numerator, `span.di-frac__bar` (a real bar), the denominator — so it reads the same inside an RTL sentence
  (an isolated LTR block between the words) and on an `ltr` formula line. Its boxes keep every box's hooks
  (`data-di-tr=<num>`, `aria-label`), the numerator comes first in the keyboard order, a box holds three digits
  (`Num` w = 3), sheet boxes 2.15rem high at 1.2rem (≥ 12 px at 1366×768). A fraction is typed whole or printed whole,
  and a typed one is ONE answer in its shape: the B17 rule « ≤ 3 answers a line » (`describeTrainer`,
  `authoring/test/suites.js › answersOnLine`) counts it once. The CSS lives in ONE place, `kit/styles/trainer.css`
  (`.di-frac`, `.di-frac__bar`, colours from `currentColor`); any other screen of the kit that writes a fraction by hand
  (the forge's last step) uses these classes and only sizes its boxes. Tests: `kit/trainerFrac.render.test.jsx`.
The lesson keeps how an answer is judged (`check`, `mark`), its model copy and its claims.

**Rules of the kit.** A frame is a `create…(lesson data)` function, or a pure helper; a screen reads the lesson with
`useLesson()`; neither ever imports a lesson, a world or a string table of one (`kit.test.js` reads every file of the
kit for it). What is mathematics — when a gate is right, how an answer is marked, what a claim
proves — stays with the lesson. New generated content takes `rand` and is tested with `rng(seed)`.

Everything is drawn in code (no model, no image, no sound file); Arabic in the scene is canvas text. No person is drawn.

## 4. State, progress and « الكفاءات »

- The game saves in the browser (`scopedStorage`, key `smarter_world_<lessonId>`, never waiting for the network): stage, stars, gems, keys, flags, the
  practice (`practice`, `keysEver`), the knowledge page (`know: { read, sealed, trained, found }`), the exam ladder
  (`exam: { best, fails, weak, sittings }`), per key the first tries done as in an exam (`tally: { ok, n }`), the bridges fired
  (`log`, the evidence of the rule forge) and the rules the student forged (`rules`, §2sexies).
- **The journey follows the student from one device to the next** (2026-11-17, `kit/saveSync.js`; `LESSON_V2.md` §1ter): a
  copy of the save is kept on the server in his private answers store; the newest whole save wins. The world opens on
  a loading screen (`LessonGameWorld.jsx`) that brings the server's copy when it is newer, then mounts.
- It marks lesson modules complete through `useProgress.markModuleCompleted`: module 1 after tablet 1 (that is, after the rule forge), module 2 after tablet 4,
  module 3 after the dash, module 4 after the last bridge. Modules 0, 5, 6 and 7 are not played in the world.

### Which game answers count toward « الكفاءات » (owner decision, 2026-11-15)

Until that day the game wrote no learning evidence; it now does, on strict terms (`evidence.js`, `evidenceSend.js`):

- **What counts**: an answer that looks like an exam answer — WRITTEN format, FIRST try, in paper mode, with no help opened before
  it (no rule reminder, no model sheet). That is: the exam-format questions of « تدرّب » (`division`, `show`, `complete`, `two`) and
  the division steps of the real cases (`STEP_KEY`). The first try is sent right OR wrong.
- **What never counts**: the gate dash, the story, a game-format question, a second try, an invoice or a sum, and « صحيح أم خطأ؟ علّل »
  (its verdict cannot be re-computed from numbers).
- **The server is the judge**: the browser sends a CLAIM — the numbers of the question and what the student wrote — to
  `POST /lessons/{code}/game-evidence` (`GameEvidenceController`); `ClaimVerifier` re-computes the verdict and ignores any flag
  from the browser. The JS `verifyClaim()` (`kit/claims.js`) and the PHP verifier share ONE fixture (`apps/api/tests/Fixtures/game-claims.json`);
  a claim kind belongs to no lesson, and adding one is the same three edits on both sides (`LESSON_V2.md` §1bis).
- **The learning point**: each question carries its key; the four keys map onto the lesson's P1–P4 (`learningPointOf`).
- **The weight**: a practice evidence judged by the server, difficulty 2 (trainer) or 3 (case). The same division asked twice is
  the same item (`ClaimVerifier::itemId`). A game alone never declares a point mastered: `mastery.require_assessment` still asks
  for « إختبار أولي » (tested: twelve right cases leave the point below « mastered »).
- **Offline**: what could not be sent is kept per student and retried when the game opens or the connection returns (idempotent
  by `attemptId`); a refused payload is dropped.

## 5. Check

`node apps/web/e2e/gameworld-divisor-isles.mjs [outDir]` (dev server up) plays the whole game as a simulated student — every bridge,
the storm, the guardians, the dash, the workshop, the last bridge, the ending — then checks that a reload offers the save, that
a module address and `?view=classic` both land on the world (the old version is deleted) and that a TEACHER never gets
the world. It fails on a missed stage or a page error.
`node apps/web/e2e/gameworld-field.mjs [outDir]` plays every mission of the depot (wrong crate packed and explained, the classic
truck mistake, a lost day) and reads the knowledge page card by card (13 cards, a mistake uncovered, a rule sealed, the locks of a
student without keys, full page without scrolling) and trains on five cards without leaving the page (the order of the formats,
a hint then the correction, the exam sheet without scrolling).
`node apps/web/e2e/gameworld-practice.mjs [outDir]` plays the practice game: the map locked then open, a run with a deliberate
mistake (guidance, rule, the question that comes back), a won and a lost level, the exam node, the save, « من البداية », and a
device without a game save. Unit tests: `npx vitest run src/lessons/common/gameworld` in `apps/web` (every generated wave has
exactly one right gate; every wrong gate has its guidance).

**Choosing the sheet of a sitting (DEV only, 2026-11-19).** A sitting draws its sheet at random; a walk that must see a given
sheet sets, before opening the sitting, `localStorage.setItem('di.dev.sheet', '<bank exercise id>')` (e.g.
`ex-4am-khawass-qawasim-l5-001`) — `bankSitting.js › makeSubject` then puts that sheet first when it belongs to the level
being opened (otherwise the key is ignored). To loop over a whole level, read its ids from `window.__world.lesson.sittings
.sheetIds(n)` (or the bank folder on disk) and set the key before each sitting. It works only under `import.meta.env.DEV`;
a production build never reads it. Remove the key after the walk (`localStorage.removeItem('di.dev.sheet')`). The sitting
walks do exactly this for every sheet of the bank (`e2e/lib/sittingWalk.mjs › everySheet`, about 3 s a sheet, ~2.5–3 min
for the 50 sheets of a lesson at one size, plus `levelFive` and `copies` — §2quater); `E2E_PARTS=sheets` runs that part
alone and says it is not a full run.

Two behaviours a change must keep: a slow machine drops the retina resolution, then the shadows (`adaptQuality`); a tree standing
between the camera and the robot ducks down, and a sign too close to the lens hides (`occluders`, `signs`).

## 6. Known limits

- Verified in headless Chromium (software rendering) at 1366×768, and the first stage at 1024×768. **Not yet played by a real
  student, nor on a real tablet or a real GPU**: speed, the touch stick and the sound were not judged by a human ear or hand.
- Strings live in `strings.js`, not in the i18n namespace; the lab kit (`LabCoach`, rounds, memo card) is not used.
- Two devices played at the same time do not merge: the newest whole save wins (the device's clock).
- **Other screen sizes (2026-11-17, Chromium emulation — not a real tablet, not a real phone).** The pilot's eight walks
  pass at 1366×768, 1024×768 and 1840×900 (92 + 30 + 102 + 45 + 56 + 47 + 59 + 102 checks each), and the six student
  walks pass on a phone held sideways (touch, 800×370: 92 + 30 + 102 + 45 + 55 + 33). What was repaired to get there:
  - the knowledge page at 1024×768 and 1840×900: the world is no longer drawn behind an opaque page
    (`WorldRuntime › pausesWorld`), a card of the map keeps its width, the legend sits in the free corner, the whole map
    is scaled while the side panel is on « تدرّب »;
  - the header of the teacher's tools at 1024×768 (tab icons hidden between 768 and 1100 px);
  - on a phone: see « On a phone » below.
  The phone walks check the PHONE rules, not the laptop ones: text floors are lower (root font 13 px), and the boxes
  named there may slide inside themselves. **Still not judged by a human on a real device**: touch comfort, the stick,
  the sound, a notch, a browser bar that hides and shows.

## On a phone (TRIAL, owner 2026-11-16 — pilot lesson only; **PAUSED 2026-11-18**: both packs say `phone: false`, nothing new is built or walked for phones until the owner resumes it)

**What opens.** Lessons are closed on phones (`RequireLargeScreen`). For a lesson listed in
`components/auth/phoneLessons.js › PHONE_LESSONS` a phone opens exactly (owner: « allow only the pages that are designed
for mobile; for the others display the message »):

- the lesson's HOME — the student's game world, the teacher's card;
- for the teacher, **« المذكّرة الكاملة » and « ملفّ الدرس »** (to read and to note, anywhere) and « جرّب الدرس كتلميذ ».

Everything else keeps the message « محتوى الدروس يظهر فقط في شاشة الحاسوب »: « حصّة القسم », the bank, the tracking, the knowledge card. **On the teacher's card and in the common
header those tools are shown closed — a dashed line and the badge « على الحاسوب » — never a link that leads to the
message** (`Door › closed`, `PHONE_TOOL_IDS`). A lesson enters the list when these pages have been looked at on a phone.

**The teacher's pages on a phone.**

- **The card** (upright): the lesson's name, the tools on one line that slides, the open doors first.
- **The memo** (`memo.css`, print untouched): one column, no zoom, its parts on ONE line that slides — the part in use is
  brought into sight — and every grid a list. Upright the step bar « السابق / التالي » stays at the thumb; sideways it is
  not pinned and the header is one line without the closed tools.
- **The lesson file is opened SIDEWAYS** (owner): a whiteboard needs the width. Upright, a touch phone shows « أدِر هاتفك »
  under the header; sideways the whiteboard is the whole screen — over the teacher space's bars (`data-workspace-bar`),
  without the common header; its own arrow goes back to the lesson. A laptop always opens the file, however narrow its
  window: the turn screen asks for a touch screen.
- **« أدِر هاتفك » is ONE component**, `components/common/TurnPhone.jsx` (`cover`: the whole screen for the game, the
  place of the page for the lesson file). Never write a second one.
- **Checking a phone with Playwright**: never judge a sideways phone on a full-page screenshot — the capture makes the
  page taller than 500 px and switches the phone rules off. Capture the visible screen.

**The rules of a phone held sideways** (`gameworld/engine/phoneScreen.js`; `SHORT_SCREEN` = at most 500 px high):

1. **One scale.** Every size of the game is in `rem`; the root font size becomes `COMPACT_ROOT_PX` (13) while the game
   is mounted. 11 was tried first and was too small on the owner's phone: « font size must be always readable ».
2. **Never two scales.** A page that zooms itself to the window (launch kit, « مختبري ») does NOT zoom on a short screen
   (`isShortScreen()`): the two scales together gave 6 px text.
3. **Readable beats unscrolled.** `Fit` never scales below `PHONE_FLOOR` (0.9); the box scrolls inside itself
   (`data-di-fit-scroll`), like the forge's list and panel (which no longer zooms itself on a phone), the launch kit's stage and the lab's panels. The page itself and
   the sideways direction never scroll. This is the ONE exception to « nothing scrolls »; tablets and laptops are unchanged.
4. **The middle of the screen is the world.** The equation and the verdict go to the corner under the island's name, the
   robot's sentence to the bottom between the stick and the buttons: in the middle they covered the bridge the student
   had just built. The teacher's preview notice is a small pill under the corner buttons.
5. **The instrument gets the room** in « مختبري »: its quests are one line that slides.
6. The page's background is the game's night colour: a phone shows it beside its camera cut-out.

**Upright**: « أدِر هاتفك » (`TurnPhone`) covers the game until the phone is turned. The teacher's card is responsive
upright: the lesson's name, then the tools on one line that slides.

**What each screen does on a phone held sideways** (2026-11-17; `kit/styles/phone.css`, the phone blocks of
`launchKit.css` and `lessonLab.css`):

- **the practice hub**: two columns — the map, compact, beside the levels;
- **a card over the world** (a case's step, a result, a tablet): it uses the width; when it is still too tall at the
  smallest readable scale, the box INSIDE the card slides (`Fit › data-di-fit-scroll`) — the card never cuts a line;
- **« خريطة المعارف »**: the trail of the journey is ONE line that slides sideways (`data-di-slides`, the only box that
  does), the card being read is brought into sight;
  on the full map, the steps of « تدرّب » stand aside;
- **« تقدّمي »**: the road is a thin strip, the gauge is small, one line per row;
- **« الامتحان الأبيض »**: the statement is 14 px at least (17 on a laptop); the sheet slides inside its box;
- **« عُدّة الانطلاق »**: the bag is compact (no sub-lines), a capsule's body slides inside itself; « الدرس كاملًا » of an
  earlier lesson is a link ONLY when that lesson opens on a phone — otherwise the line « الدرس كاملًا: على الحاسوب »
  (`data-lk-lesson-computer`), never a link to the closed message;
- **« مختبري »**: 12 px is the floor of a label, the quests are one line that slides, the instrument's drawing
  (`.ll-draw`) slides inside itself; the lab of a lesson that does not open on a phone is closed with it.

**Walks.** Every game walk takes `E2E_TOUCH=1 E2E_SIZE=800x370`; `launch-kit.mjs` and `lesson-lab.mjs` also take
`E2E_SOFT=1` (a failed check is printed and the walk goes on, to look at every screen). A walk knows it is on a phone
(`PHONE` = touch and at most 500 px high) and then checks the phone rules: the floors above, the boxes that may slide
inside, and — where the laptop walk goes to a page a phone closes (`?view=classic`, another lesson) — the closed
message instead. State on 2026-11-17, Chromium emulation: the six student walks pass (story 92 checks, practice 30,
cases and knowledge page 102, exam sitting 45, launch kit 55, « مختبري » 33). The story used to stop at island H: two
of the game's delays ran on the real clock while the walk fast-forwards the game's clock — they are on the game's clock
now (`this.wait`). Not walked on a phone: « إختبار أولي » and the classic player (closed there), the teacher's class
session (closed there).