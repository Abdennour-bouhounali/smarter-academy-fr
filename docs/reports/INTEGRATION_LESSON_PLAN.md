# The last lesson of each unit — « أدمج تعلّماتي » as three missions

**Status: PLAN, accepted by the owner on 2026-11-19. Step 1 of §6 is BUILT (2026-11-20): mission 1 as a playable
prototype — `http://localhost:5173/__qa/mission-1` (dev builds only; the page mounts the world itself, on a save of its
own and as a preview — no lesson page, no account, no redirect — and the mission starts by itself). STOP: the owner plays it.**
A first version, a flat 2D screen, was refused the same day (owner: « there is no game feeling here » — it must be like
the situation-game of the pilot's training, « تعاونية الواحة »). **The mission is now played IN THAT 3D DEPOT**: the
farmer's two stocks stand on the quay; whatever the student decides, the depot packs for real — pallets fly onto the
floor, each crate of a lot drawn while lots are few (a lot that differs is SEEN), what was not packed stays on the red
mat in its two colours, and the right lots leave on the truck (`divisorIsles/Depot.js › runLots`, `Game.js ›
startMission / missionRun`; the screen over the scene: `gameworld/missions/MissionPlayer.jsx`; what is true:
`missions/lots.js`, tested; the situation as data: `…/wadiya-idmajiya-aadad/missions/bem2022.js`, tested).
What the prototype is NOT yet: it borrows the pilot lesson's CONTENT to build the world (the integration lesson has
no pack), so the top bar shows that lesson's first island and a teacher's-preview banner;
a condition is placed by a tap, not dragged; no hearts, no coins, no save; « change the numbers and replay » is
absent; missions 2 and 3, the recap, the training exams, the board, the pack and the walk are not built.

The owner's brief (2026-11-19): the last lesson of every unit trains the last exercise of the BEM paper, the integration
situation « الوضعية الإدماجية », which students hate. It becomes a game in the unit's own world: the student enters, starts,
and is told he has three missions. Through them he learns how to read the text, extract the data, turn them into numbers,
understand the question and define the goal. The home of the lesson also holds a recap of the unit's lessons and real training
exams. The three exercises come from the BEM annals when they exist. **This lesson and its engine are designed and coded by
Fable** (owner, 2026-11-19), not delegated to opus agents.

## 1. What the 19 BEM papers ask (2007–2025)

> **CORRECTED 2026-11-20 (the owner: « mission 1 is not from the BEM 2021, check again »).** The annals print two
> columns a page, read right column first; a session's header stands where its first exercise starts, so the
> situation that closes it is often at the top of the NEXT column. Read again on pages 5–6: **2019 is the swimming
> pool, 2020 the trees, 2021 the painted room, 2022 the crates** — the four rows below were shifted by one year and are
> now right. The rows from 2007 to 2018 and from 2023 on were NOT re-read: check a session on the page before quoting it.

Source: `docs/official-BREVET-exams/` (the annals and their solutions), every paper read on 2026-11-19. The situation is always
the last exercise, « الجزء الثاني », worth 8 of 20 points: a story with a document (a plan, a table, a list of offers) and two to
five linked questions.

| Session | The situation | Family |
|---|---|---|
| 2007 | car hire, two tariffs (per km; per km plus a monthly fee): table, expressions, inequality, graph, the better tariff | offers |
| 2008 | a cylindrical tank fills a pool: volumes, a flow per hour, two functions, graph, what `f(x) = g(x)` means | volumes |
| 2009 | a car park on a plot of 2400 m² whose width is two thirds of its length: areas in `x`, places, income, a 30 % tariff | plot |
| 2010 | three phone formulas: cost of 100 minutes, expressions, graph, when the second is the cheapest | offers |
| 2011 | a newspaper, per copy or with a subscription: table, two functions, graph, the better one for 150 and for 270 | offers |
| 2012 | the floor of a hall (square, rectangle, half disc): lengths, a cosine, the price of the tiles | plot |
| 2013 | three car-hire agencies for a wedding: the cheapest for 7 days, three functions, graph, table, meaning of the equations | offers |
| 2014 | two SMS offers: table, expressions, graph, the right offer for each of two children | offers |
| 2015 | a grandfather's plot: a ratio (Thales), a length, an angle, a fair sharing, a price per m² after a 20 % tax | plot |
| 2016 | a square plot of 324 m² shared by two siblings: areas in `x`, one area double the other, graph | plot |
| 2017 | a plot of 1000 m² whose width is two fifths of its length: dimensions, two areas in `x`, equal areas, graph | plot |
| 2018 | two wages in a toy factory (fixed part plus a part per toy): expressions, lines, a system, when one is larger | offers |
| 2019 | a swimming pool, per session or with a subscription: sessions for a sum, graph, the better tariff | offers |
| 2020 | **trees around a 60 m × 42 m plot, equal and largest spacing, one at each corner; then a budget: the price a tree cannot exceed** | numbers |
| 2021 | painting a room 8 × 5 × 3 with a door and windows: area, buckets, labour, the price a bucket cannot exceed | plot |
| 2022 | **1188 crates of potatoes and 528 of carrots in identical lots: the largest number of lots, the content of each**; then a warehouse corridor (Thales) | numbers, plot |
| 2023 | a kindergarten's floor: a system for two prices per m², areas, 20 % of costs, profit or loss of the contractor | plot |
| 2024 | a bookshop, three offers to rent books: table, three functions, graph, when the second is the best | offers |
| 2025 | a commemorative race on a figure, three categories running different paths (statement read in part) | plot |

**Three families cover 18 of the 19 papers**: « which offer is best » (8), a plot or a room with areas and a cost (8), numbers
and PGCD (2); one paper is about volumes.

The PGCD also appears in the first part of eight papers, twice inside a story: 2010 (a glass sheet of 1,4 m × 2,20 m cut into
equal squares) and 2024 (a fabric of 270 cm × 378 cm cut into equal squares with no waste). So unit 1 has real BEM material.

**What makes a situation hard, as seen in the papers** — it is not useless numbers (they are rare):

- a condition carried by words, with no number: « في كل ركن شجرة », « دون ضياع », « أكبر ما يمكن », « مهما كان العدد »,
  « غير مسترجع », « لا تتجاوز أسبوعًا »;
- the role of each number: a fixed part or a part per unit, a length or a width, a price or a percentage of a price;
- a chain: the answer of one question is the datum of the next (PGCD → a count → a cost → a limit);
- a last question that asks for a decision or a limit, not a computation: « أيّ العرضين أفضل؟ », « ربح أم خسارة؟ مع التبرير »,
  « أعط القيمة التي لا يمكن أن يتجاوزها »;
- units to convert before computing (1,4 m and 2,20 m).

## 2. The idea

**The student is the engineer of the archipelago: whatever he reads, the world builds — his misreadings too.** A misreading is
never « wrong »: the world builds it and it looks unfair, wasteful or impossible. Across the three missions the world withdraws
until only the exam paper is left.

| Mission | What he gets | The world |
|---|---|---|
| 1 | the situation lived first, the exam text after | builds everything with him |
| 2 | the exam text first; he builds the model alone | arrives after he commits, for comparison |
| 3 | the paper only, in exam form | hidden in fog; after he submits, it plays his whole solution as a film |

For unit 1 (owner's choice: real BEM texts when they exist, labelled with their session; « DA » is shown as « دج »):

- mission 1 — BEM 2022, first part (the identical lots);
- mission 2 — BEM 2020 (the trees, then the budget);
- mission 3 — an exercise of the lesson's bank the student has not seen, served unchanged in exam form.

## 3. The stations of a mission

Each station answers one real difficulty of §1.

1. **The story without numbers** (mission 1 only). The numbers are hidden. He decides what he needs to know and sends the
   robot to count or measure. A datum he asked for has a meaning.
2. **He builds the situation.** He drags each quantity and each condition phrase of the text onto a small model of the scene.
   The world then runs HIS model: a missed « نفس العدد » gives unequal lots; a missed « في كل ركن » leaves a corner empty.
   He re-reads because of what he sees. In mission 2 the real scene arrives only after he commits, for comparison.
3. **The goal flags.** Before any computation he builds each answer sentence from tiles, with a hole for the number and its
   unit. The flags in order are his plan; a flag that needs an earlier one is linked to it (the chain).
4. **A bridge for each step.** He picks the key of the unit that opens it — the rules he forged in the unit's lessons — predicts,
   computes, and the world carries the result out. A wrong tool or a wrong reading of the result is built too (« 132 crates per
   lot » leaves crates on the quay).
5. **The seal.** The number enters its sentence. The world gives the answer its sense (the price range of the 2019 text lights
   the trees he can afford).

After mission 1, and only then, the four habits get their name on a tablet. Mission 1 ends with the reveal: the real exam text
of what he has just done. Mission 2 adds a short episode: he finds the faulty step in a classmate's copy, and the world replays
that copy's solution. After a mission he may change the numbers and replay the scene.

## 4. The home of the lesson

- the world and its three missions;
- **the recap**: the unit's islands, one per lesson, each showing the student's own sealed rule and a short replay of its
  experiment;
- **the training exams**: the lesson's bank as it is, in the existing exam sitting (`GAME_WORLD.md` §2quater).

## 5. Evidence

Missions 1 and 2 are never evidence. Mission 3 is a bank exercise in exam format: its first try is evidence under the existing
rule, re-judged by the server (`LESSON_V2.md` §1bis). What the student does at each station is saved in his world save, which
is private.

## 6. How it is built — one engine, every unit

A situation is DATA: the text with its marked quantities and condition phrases, a scene, the chain of questions with the tool
of each step. The engine extends what exists — the cases of « تعاونية الواحة » (`divisorIsles/cases.js`, `Depot.js`, `Worlds.js`:
the world packs what the student decided, `judge` answers by what the answer produces) and the tile forge (`kit/RuleForge.jsx`)
for the goal sentences. The stations are kit; a scene is a world mechanic.

| Scene | What it carries out | Needed by |
|---|---|---|
| lots | two stocks packed in identical lots | unit 1 (2021) |
| ring | things placed around a shape at equal spacing | unit 1 (2019) |
| tiling | a rectangle covered by equal squares | unit 1 (2010, 2024) |
| offers | two or three costs that grow with `x`, and where they cross | the 8 « offers » papers |
| plot | a plan with lengths, areas and a cost | the 8 « plot » papers |

**Order of work for unit 1** (each step ends with the checks of `LESSON_V2_MASTER_PLAN.md` §6):

1. mission 1 as a playable prototype → STOP: the owner plays it;
2. the engine (the stations, the data shape, the three scenes of the unit);
3. missions 2 and 3, the film of a bank exercise;
4. the home: the recap and the training exams;
5. the class-session version (the teacher runs a mission on the board), the class test, the pack;
6. the walks at 1366×768, 1024×768 and 1840×900, the screenshots, the gate report, the commit.

**For every other unit**: its last lesson is built at the end of the unit's batch, with the engine and the scenes that exist;
a new scene is added only when a family of §1 needs it.

## 7. Limits and open points

- Whether it is fun cannot be shown by a walk: mission 1 is played by the owner, then by a few students.
- The model of station 2 has slots; a student could fill it by elimination. More slots than data reduces this, it does not
  remove it.
- Mission 3 keeps the full exam text: the reading load stays.
- The annals hold no official marking scale: the marks of the « classmate's copy » episode are the platform's own until the
  owner provides official ones.
- BEM 2020 ends with a percentage and a budget limit taught in other chapters. It can be solved by arithmetic; a teacher
  should confirm it fits the week of the lesson.
- Not verified: that every story exercise of the bank (22 of the 50 of `wadiya-idmajiya-aadad`) fits one of the three scenes.


## 8. The mission, redesigned (council of 2026-11-20 — accepted by the owner « go on »; MISSION 1 IS BUILT on it)

> **Built 2026-11-20** (`http://localhost:5173/__qa/mission-1`, dev builds only): `missions/MissionPlayer.jsx` (the
> paper, one question, one gesture, the notebook), `missions/lots.js` (the lines, tested), `divisorIsles/Depot.js ›
> runLots / runPairing` (the depot deals lots; one stock is laid along the other), the situation as data
> (`…/wadiya-idmajiya-aadad/missions/bem2022.js`, tested). Played end to end in a browser at 1366×768: 14 screens,
> none overflows, no page error; five looked at. The seven steps on screen are the table's eight (steps 2–3 are one
> screen: free tries; step 6 follows step 5 on the same screen). NOT built: hearts (coins are), the save, sound cues of
> its own, missions 2 and 3, the lesson's home; the page still borrows the pilot's content to build the world. The first
> prototype of §3 (five stations) is deleted.

The owner played the prototype of §6 step 1 and said: « it is not clear at all […] the student must never feel lost,
everything that happens in the game should be translated to numbers as an operation ». A council of five advisors and
three reviewers (a BEM marker, a game designer, a mathematician), all on Fable 5.2, was run on that sentence. Its
verdict replaces §3 (the five stations) for the missions.

**The one rule: one sentence of the exam text ↔ one line of numbers.** One gesture all along (he types a number or
fills an operation in its shape), the depot carries it out, and ONE line is added to a notebook that stays on screen.
The exam text is on screen from the first second, with its numbers; each of its phrases lights when his act has
produced its line. At the end the notebook IS his exam copy.

**The screen never changes:** the exam paper (labelled with its session), the 3D depot, ONE instruction at the top
(the question of the moment, in plain words: « كم تشكيلة؟ »), the notebook, a progress strip « 2 من 6 ».

**Mission 1 — BEM 2022, the lots (the world helps a lot):**

| # | He does | The depot does | The line written | The phrase that lights |
|---|---|---|---|---|
| 1 | taps each number of the text and the stock it counts | the two stocks land on the quay | `1188 صندوق بطاطا` · `528 صندوق جزر` | the two quantities |
| 2 | types a number of lots — any | deals the crates into that many lots; what does not fit stays on the red mat | `1188 = 5 × 237 + 3` · `528 = 5 × 105 + 3` | « كلّ الصناديق » turns red while crates are left |
| 3 | tries again until nothing is left | lots identical, mat empty | `1188 = 4 × 297 + 0` · `528 = 4 × 132 + 0` | « متماثلة », « كلّ » |
| 4 | « دور أكثر؟ » — fills `1188 = 528 × □ + □` | lays the carrots against the potatoes, twice: 132 potato crates stand alone | `1188 = 528 × 2 + 132` | — |
| 5 | tries the numbers that worked on those 132 crates, then fills `528 = 132 × □ + □` | every number of lots that worked splits the 132; 132 itself splits both stocks | `132 = 4 × 33 + 0` … `528 = 132 × 4 + 0` | « أكبر » |
| 6 | types a number greater than 132 — any | it cannot split the 132 crates: they stay on the mat | `1188 = 264 × 4 + 132` | « أكبر » stays lit |
| 7 | fills the content of a lot | packs the 132 lots; the truck leaves | `1188 = 132 × 9` · `528 = 132 × 4` | question (ب) |
| 8 | completes the sentence of his copy with his numbers and the name of the key he forged in the unit | the notebook folds into the exam copy | « العدد 132 يقسم 1188 و 528 وهو الأكبر: PGCD(1188 ; 528) = 132 » | the whole text |

Steps 4–6 are the answer to the mathematician's objection: a refuted 264 does not prove « the greatest »; what
proves it is that a number of lots which splits both stocks must split the 132 crates left alone — which is what
Euclid's first line MEANS in the depot.

**Removed from the prototype:** the hidden numbers and the robot sent to count; the useless data (mission 1); the
ticked conditions; the rehearsal on 12 and 8 crates (his own tries on the real stock are the rehearsal); the goal
sentences built from tiles; the choice of a key in a menu; the four named habits; the names « الوضعية », « الأعلام »,
« الجسور », « الختم ».

**Missions 2 and 3 — ONE thing fades: who writes the line.**
- Mission 2 (BEM 2020, the trees): HE writes each line first, in its shape, then the plot plays it — a corner without
  a tree, a spacing that does not close. The trap of the text is his to meet (the perimeter, « في كل ركن »). The
  notebook carries the 34 trees into the budget line.
- Mission 3 (an unseen exercise of the bank): the paper and a blank notebook — no shape is given any more. The world
  is dark until he hands in, then plays his own lines once.

**Never lost:** one instruction, one thing to touch, one live line. After a third try that leaves crates, the depot
puts his tries side by side (facts, no hint of the answer). Hearts and coins as in the order game of the pilot.

**What the council could not settle, for the owner:** no mark out of 8 on the notebook (a BEM copy is marked on its
justification too — a score would lie, and it feeds the fear); the engine for the other families (offers, plots) is
extracted AFTER mission 2 exists, not before; one real student plays mission 1 before missions 2 and 3 are built.


## 9. The mission prepares for the EXAM: paper and pen first (2026-11-20 — ACCEPTED by the owner the same day)

> **The owner's four answers (« 1-yes 2-yes 3-optional 4-the clock must be applied to all of them »):** this is the
> mission he wants; 18 px is the smallest text of a mission; the photo of the sheet in mission 3 is optional; **a clock
> runs in EVERY mission**, not only the third (the platform's choice of length: 25 minutes; in missions 1 and 2 the
> clock reaching 0 is shown and stops nothing — my reading; in mission 3 it ends the sitting).

The owner, after playing §8's mission: « at the beginning the student will not know that he has to click on the numbers
to start; also the mission must prepare the student for the exam — to use the paper and pen to write down data, connect
the dots, make operations of calculation in the paper ». §8 stays (one sentence of the text ↔ one line of numbers, the
depot plays every line); what changes is WHERE he works.

> **MISSION 1 IS BUILT on this plan (2026-11-20, `http://localhost:5173/__qa/mission-1`)**, with what the owner asked
> while it was being built: the message « الساعة ستبدأ الآن » stays 5 seconds and cannot be closed; **the first step is
> to READ the whole exercise** (the paper stands out, a call moves toward it, « قرأتُ التمرين كلّه » opens after 8
> seconds; nothing else can be touched before); **the student has a PEN over the screen, as the teacher has on the
> board** (`missions/Ink.jsx`: three colours, undo, « امسح »; what he drew stays when the pen is closed); **every
> division of the PGCD is guided** (« القسمة الأولى », « الباقي 132 ليس 0: القسمة التالية », « الباقي 0: توقّفت
> القسمات », then he writes the PGCD) and the method's lines always show in « الحلّ » of his copy (his tries fold);
> « أربط » draws each line to the datum he tapped. Played end to end in a browser at 1366×768: 27 screens, no text
> under 18 px, none overflows, no page error; eight looked at. NOT built: hearts, the save, missions 2 and 3, the
> photo of the sheet; the end of the clock stops nothing.
>
> **Successes and « اضغط هنا » (owner, 2026-11-20, built).** Each right answer is celebrated: a word (« أحسنت! »,
> « صحيح! »…) with its coins rises in the middle of the depot, the robot cheers, a star rings and sparks fly
> (`MissionPlayer › bravo`, `Game.js › missionCheer`); a right division of the PGCD earns 5, a finished step 10, a wrong
> operation nothing. **The end of the mission gets the big one**: a trophy, « أنهيتَ المهمّة! », one to three stars
> (3 with one slip at most, 2 up to three, else 1 — his free tries are never slips; MY scale, not the owner's), the
> coins, the time left, confetti, then « أقارن ورقتي بالحلّ ». **What must be tapped and does not look like a button
> carries a flashing red sign « 👆 اضغط هنا » from the first second**: a number and a question in the exam text, the
> first datum to connect, the number to try again. The call to read is ON the exercise, and nowhere else (the line at the bottom of the screen was removed): a flashing band « 📖 اقرأ التمرين كلّه »
> at the top of the exam text, whose border flashes red and amber. The coins and stars are not saved and buy nothing yet.
>
> **A wrong answer is answered by a GUIDANCE, never by the next question (owner, 2026-11-20, built for the free tries;
> `lots.js › advice`, tested).** A number of lots that leaves crates gets, in the fact box: what stayed on the quay,
> WHY (« 8 يقسم 528، لكنّه لا يقسم 1188 »), then where to look — a little more at each failure: 1st « ابحث عن عدد
> يقسم 1188 و 528 معًا », 2nd the nearest numbers that work (« جرّب 6 أو 11 »), 3rd a small one to start from (« هل 2
> يقسم…؟ »). The greatest common divisor is never offered: it is the answer. The question of the step is rewritten
> from his number (« العدد 8 ترك صناديق… »). Every later mission keeps this rule: each wrong answer has its guidance.

> **MISSION 2 IS BUILT (2026-11-20, `http://localhost:5173/__qa/mission-2`) — and with it THE ENGINE of every later
> mission.** `missions/MissionRunner.jsx` plays a mission FROM DATA: a situation is one file of the lesson (here
> `wadiya-idmajiya-aadad/missions/bem2020.js`, tested) holding the exam text with what is underlined in it, the question
> and the steps it hides, each operation (`sheet` to write, `shape` of its boxes, `check` with THE GUIDANCE OF EACH
> WRONG ANSWER and the `scene` the world carries out), the model copy and the marker's list. Step kinds: `data` (he
> underlines every number AND every condition carried by words), `goal`, `plan` (he orders the hidden steps; one taken
> too early is answered by what it needs), `work`. The shared pieces are `missions/parts.jsx`; mission 1 keeps its own
> player (`MissionPlayer.jsx`) until it is rewritten as data. BEM 2020 in 10 stages: data (9 lines), question, plan
> (4 steps), the three divisions of the PGCD, the spacing — **the plot is PLANTED with whatever he types** (scene
> « ring », `Depot.js › setPlot / runRing`: a corner without a tree and a shorter last gap carry a red sign) — the
> perimeter and the count, the budget (32000 − 1400, ÷ 34), the percentage (100 % + 125 %) and the price, the sentence,
> then the model copy and the marker's list. The budget is worked by arithmetic (the official solution uses an
> inequality, taught later in the year): 400 دج either way. A long exam text gets a wider paper (`ms-root--long`).
> The walk of the missions is `node apps/web/e2e/mission.mjs <1|2> <out>` (kept): it plays the mission through its UI
> with wrong answers on the way and fails on a text under 18 px, on text beyond the screen, on a missing guidance, on
> a success after a wrong answer, on a page error. Both missions pass it; 9 screens of mission 2 looked at.
> NOT built: mission 3, the home of the lesson, the save, hearts; mission 2's « classmate's copy » episode of §3.

> **TWO DEBTS PAID (2026-11-20, after the merge).** (1) **A mission left half-way is kept** — for a mission played
> from data (`MissionRunner`: `world.keep(snapshot)` at each step forward, `resume` given back; `missionIsle/Game.js ›
> missionKeep`, in his world save, private): the home says « توقّفتَ في منتصفها », the card offers « أكمل من حيث
> توقّفت (الخطوة n من N) » or « أبدأ من جديد »; the clock goes on from where it was; nothing is kept from the class
> board. Mission 1 keeps its place the same way (`MissionPlayer › snapshot / takeBack`; the depot's floor is not kept,
> his next gesture builds it again). (2) **« ورقة زميلك »**, the episode of
> the plan's §3, is a step kind `review` of the engine: a classmate's copy of the same mission, ONE faulty line (he
> added the four corner trees: 204 ÷ 6 + 4 = 38); a sound line he suspects is answered by why it holds, the faulty one
> by its fact while the plot counts 34; then he corrects it on the copy. Mission 2 has 11 stages. Both are walked by
> `e2e/mission.mjs` (`VIA_HOME=1`). (3) **MISSION 1 IS DATA TOO** (2026-11-21): `missions/bem2022.js` is written as
> steps and played by the same engine, with the flow the owner validated — the engine gained the step kinds `tries`
> (free tries; a condition marked `late` is added to his data when the world has shown what happens without it),
> `connect` (« أربط ») and `choices` on a work step (the name of what he found). The first player
> `MissionPlayer.jsx` is deleted: ONE engine plays every mission (`MissionRunner.jsx`, `parts.jsx`, `words.js`,
> `lots.js`). What was lost on the way: the red flash of a phrase of the paper after a try that left crates, the
> line « محاولاتك » after three failures, and the « قارن قسمتك » helper — the guidance of each wrong try covers them.
>
> **ITS BOARD AND ITS CLASS TEST ARE BUILT (2026-11-20): `status:lesson-v2 -- --lesson wadiya-idmajiya-aadad` prints ✅.**
> The hour on the board IS a mission: `board/script.js` holds two stations of a NEW kind, `mission`
> (`features/classSession/LessonBoard.jsx › MissionStation`): the station says what the class needs (a sheet each, a
> pen, the mission's minutes), then « افتح المهمّة على السبّورة » mounts the lesson's OWN world on that mission over the
> whole window, as a preview (`MissionIsle › board = { mission, onLeave }`); the class solves on paper, one student
> types, the board builds it. Leaving the mission, the world's ✕ or « خروج من المعاينة » come back to the station. ONE
> mission per hour. The written memo (`board/memo.js`, 14 tests) covers both hours; the class test is
> `content/class-tests/4am/wadiya-idmajiya-aadad.json` (8 start, 8 end, 3 pool). The teacher's header now holds every
> tool but « بطاقة المعارف » (the lesson has no knowledge of its own). Walk kept: `e2e/missionBoard.mjs`.
> LIMITS, said by their author (an Opus agent) and not corrected: no opening of the memo is the board's own (the
> memo's drawings cannot draw crates or trees); the class test has no question in words (« which datum is needed »):
> no existing check type judges one; the memo was looked at on its page (first part only), never printed.
>
> **THE LESSON IS BUILT (2026-11-20) — except its board and its class test.** The owner said yes to the home (« 1-yes »).
> « أدمج تعلّماتي » of 4AM unit 1 is a v2 lesson of its own kind: its world is **« جزيرة المهمّات »**
> (`gameworld/missionIsle/`: `Game.js` on the shared runtime, `MissionIsle.jsx`), the oasis island alone — no road, no
> key, no title screen. Its HOME over the island: three mission cards in order (the next one is marked « ابدأ من هنا »,
> a finished one shows its stars and « ألعبها من جديد »; all three are open), the door « الامتحان الأبيض » (the bank's
> five levels, each opening the next) and « ملخّص الوحدة » (the eight lessons of the unit and their rules, read from
> their worlds — a rule he has not forged shows « 🔒 قاعدة لم تصنعها بعد », never its name). **Mission 3** is a sheet of
> the bank's level 5 (« الوضعيّة الإدماجيّة ») in the kit's exam sitting, whatever the ladder; its answers are evidence,
> re-judged by the server. A finished mission is kept in his save (best stars and coins); the three done finish the
> lesson (`save.finished` → every module marked, kit/storyEnd.js). Missions 1 and 2 are never evidence.
> The lesson's content is `wadiya-idmajiya-aadad/world/` (`index.js`, `sitting.js`, `text.js`, tested) and
> `missions/`; its pack names the world `mission-isle`. **Its old version is deleted**: the nine module pages, the old
> content, its knowledge map, the old mission player's scene `ApronStoreScene`, two unit helpers nothing reached any
> more; its module addresses redirect to the home; the teacher's page of a lesson that has a world no longer lists
> the deleted modules (board or not). `status:lesson-v2` and `validate-lessons` know the kind (its الكفاءة is proved
> by its bank). Walks kept: `e2e/missionHome.mjs` (every door), `e2e/mission.mjs` (`VIA_HOME=1`: a mission opened
> from the home comes back marked done), `e2e/missionLesson.mjs` (the real address as a student, two old module
> addresses, the teacher's page). All pass at 1366×768; the home, the recap, the exam door, mission 3's sheet and
> the teacher's page were looked at. Preview: `http://localhost:5173/__qa/missions`.
> **The teacher's page of this lesson (owner, 2026-11-20).** A v2 lesson that has its world before its board gets, like
> the others: the teacher's OWN bank behind « بنك التمارين » (read, show on the class board, print —
> `boardLessons.js › hasTeacherBank`, `TeacherBankGate`); a header with ONLY the tools that have content (« الدرس »,
> « بنك التمارين », « متابعة القسم » — `toolHasContent`); **the teacher follows his students on this lesson** (owner:
> « the teacher must track the work of his student »): the door « متابعة القسم » and a button « أين وصل كلّ تلميذ؟ »
> under « ما يتعلّمه تلاميذك » open the existing tracking (per الكفاءة and per exercise of the bank — the sittings and
> mission 3; missions 1 and 2 and the endless game are never tracked: they are not evidence); no « المذكّرة الكاملة » door (its memo comes with its board); no site footer and
> no floating « كرّاسي » on the page (`LessonIndex`, `LessonNotebookAnchor`). Checked by `e2e/missionLesson.mjs` and
> `boardLessons.test.js`.
> NOT built: the board script and memo, the class test (status prints ❌ 2 parts), the save of a mission left
> half-way, hearts, the « classmate's copy » episode, the film of mission 3. The teacher's tabs « حصّة القسم » and
> « المذكّرة » still run on the old derived memo.
>
> **« سباق الأعداد », THE ENDLESS GAME, IS BUILT (2026-11-20)** — a third door of the home. The owner's words, in
> order: up/down keys; then, seeing it, « i did not like the up/down system, use the same structure of the game inside
> the lesson 1, left right »; then « the game is too slow, use 100% the same design of the game of the lesson 1 ».
> So it IS lesson 1's gate run, design for design (`divisorIsles/Game.js › buildRail`, `DashHud`): the rail of light
> (two glowing rails, a floor of light, sleepers, two lane lines), three arches of light with their veil and their
> number above, the robot on its board with its trail of sparks, the same camera close behind him (60° field, leaning
> with his lane), the same lanes (−2,5 · 0 · 2,5), the same gap between gates (34), three hearts, the same screen (the
> kit's `di-dash`: hearts and score in a pill, the order on its white card, two round arrows), the same sounds. What
> differs: the rail has NO END (the robot stays, the sleepers and two sets of arches come to him); it is FASTER
> (10,5 at the first gate against 7,2, rising with the level and the score up to 17); a wrong gate stops the run for
> 2,4 s and the card shows the fact that refutes it (« 6 × 9 = 54، وليس 55 ») while the right arch turns green.
> Five right gates open the next level. **It starts very easy with 1AM content** (parity, the tables, multiples —
> three levels) then climbs through the unit's lessons to the irreducible fraction (eight levels). The content is the
> lesson's (`world/endless.js`, pure, tested: 2400 rounds, exactly one right gate each, a fact for every wrong one);
> the engine is the world's (`missionIsle/Game.js › buildTrack … placeGates`, `MissionIsle.jsx › Run`). The numbers
> over the arches are text of the page placed each frame (a real fraction bar). His best is saved with his world.
> A GAME: never evidence, sends nothing. Walk kept: `e2e/missionRun.mjs` (six right gates and a level passed, the
> screen arrows, three wrong gates with their facts, the end card, the best kept) — passes at 1366×768; four screens
> looked at. **A PAUSE** (owner, 2026-11-20): « توقّف » in the pill or the space bar freezes the run where it is (the
> gate, the speed, the hearts) under a card « السباق متوقّف »; a hidden page pauses by itself. NOT built: the hearts
> of « مدار » (OPEN — see the question put to the owner: by `MADAR_GAME.md` a maths game is free), phones; the speed
> was not tried by a student.

**The principle: the paper first, the depot checks.** The BEM is written with a pen. In a mission the student's REAL
sheet is where he works; the screen holds its typed twin, « ورقتي », laid out as an exam copy (« المعطيات »,
« المطلوب », « الحلّ »), and the depot is what proves each line. Every step has the same three beats, always shown in
the same place: **✍️ على ورقتك** (what to write, with the shape of the line) → **⌨️ اكتب ما كتبتَ** (he types only the
numbers he wrote) → **🏗️ المستودع يتحقّق** (the depot plays that line, and « ورقتي » inks it). The kit already has the
gate « كتبتُ على ورقتي » (`kit/Paper.jsx › PaperGate`: a few seconds must pass, no reflex tap) and the model of a
division posed on paper (`PaperModel`, `kit/longDivision.js`): both are reused.

**The start can no longer be missed.**
- A mission card before anything: the session, « ستحلّها كما في الامتحان: بورقة وقلم » , and ONE button
  « ورقتي وقلمي أمامي — أبدأ ».
- The robot does the first gesture ITSELF, once: it underlines « 1188 » in the text and writes it in « المعطيات ».
  Then « دورك » with the next thing to touch pulsing. A gesture is shown before it is asked — in every step where it is new.
- If nothing is touched for 8 seconds, the thing to touch pulses again and the instruction says where it is.

**Mission 1 (BEM 2022, the crates) — the exam's own method, lived step by step:**

| # | The question on screen | ✍️ On his paper | He touches | The depot / « ورقتي » |
|---|---|---|---|---|
| 0 | the mission card | takes a sheet, writes the session's name | « أبدأ » | — |
| 1 | « ما المعطيات؟ سطّرها » | underlines them in his head, writes « المعطيات: 1188 صندوق بطاطا، 528 صندوق جزر » | the two numbers of the text (the robot showed the first) | each stock lands on the quay; « المعطيات » fills |
| 2 | « ما المطلوب؟ » | writes « المطلوب: (ا) أكبر عدد من التشكيلات (ب) ما في كلّ تشكيلة » | the two questions of the text, with the other pen (blue) | « المطلوب » fills; the two questions stay lit as the goal |
| 3 | « كم تشكيلة؟ جرّب » | writes each try as a division: `1188 = 9 × … + …` | types a number of lots | deals; the two lines; a phrase he had NOT written turns red in the text (« يُجمّع الصناديق ») and the robot asks him to add it to « المعطيات » on his sheet |
| 4 | « أربط: ما الذي يحتاجه السؤال (ا)؟ » | draws an arrow from each datum to the question | taps the data of « ورقتي » that (ا) needs | a line is drawn from each to the question — the dots, connected |
| 5 | « احسب على ورقتك » | POSES the division of 1188 by 528 as on an exam sheet, then 528 by 132 | types quotient and remainder | lays one stock along the other; « ورقتي » shows the posed division to compare with his |
| 6 | « أكبر من 132؟ » | writes why none can be | types a greater number | the 132 crates left alone are not split |
| 7 | « أربط: والسؤال (ب)؟ » | arrow from the answer of (ا) to (ب) | taps what (ب) needs — it needs 132: the CHAIN | the answer of (ا) becomes a datum of (ب) |
| 8 | « احسب ما في كلّ تشكيلة » | `1188 ÷ 132`, `528 ÷ 132` | types 9 and 4 | packs the 132 lots; the truck leaves |
| 9 | « حرّر جوابك » | writes the two answer sentences, with their units | completes them on screen | « ورقتي » is whole |
| 10 | « قارن ورقتك » | corrects his sheet with his pen | ticks, line by line, what HIS sheet holds | the model copy beside the list |

**The last screen is the marker's eye.** A list he ticks against his own sheet: the data are listed; the question is
restated; the reason for the PGCD is written in a sentence; the divisions are posed; each result has its unit; each
question has its answer sentence. No mark out of 8 (the annals give no official scale): what he sees is what a marker
looks for.

**Missions 2 and 3 — the screen withdraws, the sheet stays.**

| | « ورقتي » on screen | When the depot plays | What is new |
|---|---|---|---|
| Mission 1 | shows the shape of every line | after each line | — |
| Mission 2 (BEM 2020, the trees) | only its three headings; he writes whole lines on paper first, then types them | after each QUESTION | data he must not use yet (prices), a condition in words (« في كل ركن شجرة »), a chain of four |
| Mission 3 (an unseen exercise of the bank) | nothing: the exam paper, a clock, and his sheet | once, after he hands in: the film of his own lines | exam conditions; then the marker's list; a photo of his sheet may be attached (the bank already allows it: `work: optional`) |

**Nothing is read by leaning toward the screen (owner, 2026-11-20: « the size of the text must not be at a point
where the student has to get closer to the screen, never »).** In a mission every text he must read — the exam text,
the question, the lines of « ورقتي », the depot's sentence, the labels in the scene — is at least 18 px at 1366×768
(the platform's general floor of 12 px is a floor against unreadable text, not a reading size). Today's build is under
it in the notebook (15 px) and the depot's sentence (17 px); the exam text is at 19 px. With eleven screens instead of
one crowded screen there is room: a step shows only its own lines of « ورقتي », the others fold above it.

**What it costs.** Mission 1 becomes eleven short screens, about twelve minutes — the time such an exercise takes
in the exam. Steps 4 and 7 (« أربط ») are new screens to build; the rest re-uses what §8 built and the kit's paper mode.

**Open, for the owner:** (1) whether a photo of the sheet is asked at the end of mission 3 or left optional; (2) the
clock of mission 3 (the platform's own choice: 25 minutes); (3) the marker's list is the platform's, not an official
scale.
