# The class session — the teacher's hour in class

> **Status (2026-11-22).** Covers the teacher's side of a v2 lesson: his card on the lesson page, the seating map and
> the teams, the class test, the test and the lesson on the board, the rules revised, the exercise bank on the board,
> the knowledge card, the tracking, the lesson file, the memo. Imported from the Algerian platform (DZ dev `7f4cef1c`)
> on 2026-11-22. True here: the code (`apps/web/src/features/classSession/`, `pages/teacher/ClassSessionPage.jsx`,
> `LessonMemoPage.jsx`, `LessonFilePage.jsx`, `LessonToolPages.jsx`, `pages/teacher/practice/`,
> `apps/api/app/Domain/ClassSession/`), its API and its tables. Not true here (2026-11-23): no lesson's PACK names a
> board yet, so none of these screens has anything to show — the first board (`board/script.js`, `board/memo.js` of
> 3e `decomposer-en-facteurs-premiers`, with the new station `ladder`) and the first class test
> (`content/class-tests/3e/decomposer-en-facteurs-premiers.json`) are written, not yet reached; no class-session walk
> exists. Since 2026-11-22 these screens are French and read left to right (the sentences of `session.js`,
> `lessonScripts.js` and the teacher's namespaces of `apps/web/src/i18n/locales/fr/`). No real class has used it.

## 1. The goal

The lesson in class is ONE shared event: one screen, one mouse. Every student takes part BY NAME and is treated with
dignity. In five minutes the teacher knows where the class stands before teaching, and in five minutes at the end what
the hour changed. The teacher owns the content. **Nothing here touches a student's progress.**

The teacher's screens are not the student's: no game, no story. Light and calm (a projector washes out dark themes),
facts and counts, one decision per screen, readable from the last row, nothing to learn before using it.

## 2. On the lesson page: the teacher's card

**While it loads, a skeleton — never an empty gap** (`BUNDLE_BOUNDARIES.md` rule 13):
`features/classSession/TeacherSkeletons.jsx` gives the card's shape (`TeacherPanelSkeleton`, the fallback of its lazy
boundary in `LessonIndex`), the class-session page's (`ClassSessionSkeleton`), its set-up screen's (`ClassWorkSkeleton`)
and the lesson lab opening (`LabOpeningSkeleton`). A new lazy boundary on the teacher's side uses one of them, never
`fallback={null}`.

`TeacherLessonPanel.jsx`, shown to a teacher on a lesson whose pack has a `board` or a `world` (`LESSON_V2.md` §1). It is
the teacher's ONE place on the page, in the order of his work:

| Block | Doors |
|---|---|
| **in class** | the class session and — on a lesson that has its board — the four moments of the hour, each a card that opens it directly (`?moment=start\|revise\|lesson\|end`) |
| **prepare** | try the lesson as a student · the full memo · the lesson file (§2ter) |
| **my tools** | the lesson's lab (`LessonLab`) · the exercise bank (§5quater) · the knowledge card (full screen) |
| **follow** | the class tracking (§2bis) |
| **before you start** | what the students will learn · what the lesson stands on (`toolsForLesson`: core / support, with the year) · the mistakes students really make (`launchkit/families.js` — one family today, `4e.m1.r06`) |

**The header common to the lesson's tools** (`LessonToolsBar.jsx`): the lesson's title, then one tab per tool — the
lesson · the class session · the memo · the lesson file · the exercise bank · the tracking · the knowledge card. It is
the top of the lesson page and of the five tool pages — the memo, the lesson file, the exercise bank, the tracking
(`/enseignant/suivi/:lessonId`) and the knowledge card (`/enseignant/carte/:lessonId`, both in
`pages/teacher/LessonToolPages.jsx`). All live INSIDE the teacher's space; only the class session
(`/enseignant/seance/:lessonId`) opens full screen. Left to right: the lesson's name first, on the left, then its tabs
(`.ltb__title`, then `.ltb__tabs`).

**One frame, `LessonToolPage`**: every tool page is `<LessonToolPage lessonId active>` — the header across the whole
width, then the tool. Rules: a tool NEVER adds a button to the header (the memo's print button is in its rail); a tool
page writes no second title of itself under the header; the report button of the lesson page is at the BOTTOM of that
page (`data-teacher-report`). **Full screen is the computer's real one** (Fullscreen API on the document): the knowledge
card's full-screen button is a tool of its dock (`BoardTools › fullscreen`), and the teacher's navigation and the header
are hidden only then. A new tool of a lesson = one entry in `lessonTools`.

**One calm palette** (binding for the teacher's screens of a lesson): white surfaces, dark ink (`slate-900`), grey for
what is secondary; the dark tone marks only what is pressed. No gradient, no colour per tool; green only where it means
something (« core », a right answer).

### A lesson that has its board

`features/classSession/boardLessons.js › BOARD_LESSONS` is the lessons that have a board script — read from the
generated lesson index: the lessons whose pack has `board`, never a list typed by hand. For such a lesson the teacher's
catalogue card and the memo open the class session (`features/teacher/lessonMemo/memoRoutes.js › classDoor`), and the
teacher's lesson page is the title and his card (`LessonIndex › teacherBoard`). To give a lesson its board: write
`board/script.js` and `board/memo.js` in its folder, name them in its pack (`board: { script, memo }`), run
`npm run generate:lesson-index`.

**Try the lesson as a student** (`?apercu=eleve`): the teacher opens the student's own world — the game, the launch, the
rule forge — under a preview banner (« nothing is recorded »). In preview no module is marked done and no game evidence
is sent (`LessonIndex › previewAsStudent`).

## 2bis. The class tracking — the class on this lesson, student by student (`ClassTracking.jsx`, `tracking.js`)

Data: ONE read-only endpoint, `GET /teacher/classrooms/{id}/lesson-tracking/{lessonCode}`
(`ClassroomLearningPointService::lessonTracking`; entitlement `PROGRESS_STUDENT`; active members only; the lesson must be
in the class's scope). For each student: his state on every learning point of the lesson, and per exercise the questions
answered, right (last try) and right at the first try.

- The class first, in facts: per learning point a bar of four COUNTS (mastered, needs support, gap, not assessed yet) —
  never a percentage, never an average.
- One line per student: a square per learning point, his exercises. A line opens on the detail.
- **The order is « who needs me first »** (a gap, then « needs support », then not started, then the others; by name
  inside a group) — never a ranking by score (`tracking.js › orderStudents`, tested).
- Read-only: the endpoint writes nothing (`LessonTrackingTest`).
- **Its own screen** (`/enseignant/suivi/:lessonId`, the class chosen there, the first active one by default). It is
  NOT a tab of the set-up screen.
- **The window of one exercise of one student** (`StudentWork`): the exact exercise — its statement, each question, what
  the student wrote at each try, the questions he did not answer, and the expected answer. Data:
  `GET /teacher/practice/{lesson}/exercises/{id}/students/{student}`. A right answer is `correct` or
  `equivalent_correct` (`tracking.js › isRight`).

## 2ter. The lesson file — the teacher's work file of a lesson (`LessonFilePage.jsx`, `lessonFileDoc.js`)

ONE file per (teacher, lesson).

- **The instrument is the Math Lab's whiteboard, used as it is** (`features/mathlab/tools/whiteboard`: pens, geometry
  tools, text, shapes, attachments under the lab's quota, autosave).
- **The page is not in the lab**: `/enseignant/dossier/:lessonId`, inside the teacher's space under the common header; the
  whiteboard's own full-screen button covers them. The way out (`MathLabShell labHome`) is the lesson page. The lab's
  accents are replaced by the teacher's calm palette there only (`pages/teacher/lessonFile.css`).
- **The link lesson → document** is the table `teacher_lesson_files` (`math_lab_document_id`, null on delete);
  `GET|PUT /teacher/lesson-files/{lessonCode}` — the PUT accepts only the teacher's OWN whiteboard document. The first
  opening creates the document and attaches it; two openings made together share one (`lessonFileDocumentId`).
- **It is not a work of the lab**: the lab's saved works never list it (`MathLabDocumentService::listFor`).
- The student's notebook is a different thing and is untouched.

## 2quater. The full memo, one part at a time (`LessonMemoPage.jsx`, `memo.css`)

- **One part on screen at a time.** A rail lists the parts in the order of a teacher's hour — before the hour
  (overview, objectives, opening situation) · during (the hour, examples, mistakes, differentiation) · after
  (synthesis, evaluation, what comes next) · mine (his notes). Previous / next walk through them.
- **The course of the hour shows one phase at a time**: the phases are tabs; « all phases » shows them all.
- **The whole memo** can be put back in one column; **printed, the whole memo comes out**.
- The links of the page: `#memo-<part>` opens that part, `#memo-phase-<n>` that phase.
- The sections are `features/teacher/lessonMemo/MemoSections.jsx`.

**A lesson that has its board has a WRITTEN memo**: the lesson's own file `board/memo.js` (`export const MEMO`, named
in its pack; the model's parts are `features/classSession/lessonMemos.js`), page `BoardMemo.jsx`, drawings
`MemoFigures.jsx`. Its model is what good lesson plans share (launch–explore–summarize, the « 5 practices » of
orchestrating discussions): a goal with OBSERVABLE success criteria; several opening situations; the hour as the class
session runs it; the students' likely answers and misconceptions ANTICIPATED, each with a question to check and a
question to push forward; what goes on the board and in what order; what is written; a three-question exit ticket;
support and extension; and the one page for the desk.

- **Opening situations are drawn from their own numbers** (`openingFacts`) — never a typed count, never a generated
  image, no person drawn. The one used by the class session is marked and opens it. A lesson on the `rootCourts` world
  may use the figure `court` (`{ kind: 'court', a, b, alt }`, drawn from `rootCourts/logic.js › outcome`).
- **A geometry opening carries its FIGURE** (2026-11-24, carried from the Algerian platform with commit `784f483a`):
  `figure` is the data of a bank sheet's `statement.figure` (plane: `points` drawn to scale from the opening's numbers,
  `segments` with their lengths and « ? » on the one asked, `arrows` on the parallels, `rightAngles`, `polygons`), drawn
  by the practice space's own `components/StatementFigure.jsx` (`MemoFigures.jsx › Geo` — never a second renderer), at
  its practice width and never narrower than the width where its smallest label reads 12 px
  (`gameworld/kit/sheetFigure.js`, the exam sitting's rule). An opening with a `figure` draws it whatever its `kind`;
  `openingFacts` gives `{ a: null, first: { r: null, exact: null }, second: null }` (nothing laid, nothing left). No
  French memo has such an opening yet (**Planned**, with the first geometry lesson).
- Every equality of the memo is re-computed by `lessonMemos.test.js`.
- **On paper the whole memo is two A4 pages at most**: a dense print layout in `memo.css`. A longer memo is shortened.

## 3. The seating map (`SessionSetup.jsx › SeatingMap`, `session.js`)

The classroom drawn from above, the board on top. Set once at the start of the year, changed whenever the teacher wants.

- **A tap on a student, a tap on a desk**: he moves there; if the desk is taken the two swap (`moveSeat`). The number of
  rows re-seats the class in the same order (`reflow`). A student who joins later sits after the last row
  (`seatEveryone`); one who left loses his desk.
- **The turn follows the seats**: row by row from the board (`turnOrder`).
- **Teams.** By default one team per VERTICAL line of desks from the board to the back of the room, under the names of
  mathematicians (`session.js › SCHOLARS`: Thalès, Hypatie, Euclide, Sophie Germain, Al-Khwârizmî, Emmy Noether,
  Pythagore, Ada Lovelace, Descartes, Maryam Mirzakhani, Fermat, Émilie du Châtelet — six women, six men; not yet
  validated by the owner), renamable. The teacher may make **his own teams, any number from 2 to 12** (`customTeams`, `nextTeam`).
- **Boy / girl** is set by the teacher on each desk — **never guessed from a name**. It chooses the agreement of the French
  sentences (« Ne sois pas déçu » / « déçue ») and the character on the podium; unset, the sentence fits everyone
  (« Pas grave, Léa : … ») and the podium shows a medal with the initial.
- Saved by itself (`PUT /teacher/classrooms/{id}/seating`); the server keeps only ACTIVE students of the class.

## 4. The test of a lesson (`SessionSetup.jsx › TestEditor`)

Two moments: **the start test** (the earlier learning points the lesson stands on, then two questions of the NEW lesson)
and **the end test** (the lesson, with those two asked again under other numbers).

- **The default test is a file of the repository**, `content/class-tests/<grade>/<lesson>.json` (`start`, `end`, and a
  `pool` of more prepared questions), never overwritten. The API finds it in any grade folder
  (`ClassSessionService::defaultTest` globs `*/<lesson>.json`; path `config/class_session.php`). One file exists:
  `content/class-tests/3e/decomposer-en-facteurs-premiers.json`. The Algerian files carried a `check` per question from which a test re-computed every answer; that test
  (`defaultTests.test.js`) was deleted with them, so **no check guards a default test here until it is rewritten** — a
  default test must never ship a wrong answer.
- **The teacher's copy** lives beside it (`class_tests`, one per teacher and lesson): remove, reorder, add from the pool,
  **write his own question** (choice, true / false, number). Writing one, he reads that he is responsible for its
  correctness; it is marked « the teacher's question » and stays private to him.
- **« restore the original test »** deletes the copy: the default is back, whole.
- Three kinds only — `choice`, `truefalse`, `number` — because the class answers with ONE mouse.

## 5. The test on the board (`SessionPlay.jsx › Player`)

- **The question owns the board** (it must serve a BIG class, read from the last desk). The name of the student whose
  turn it is stands ACROSS THE TOP in very large letters, with his team; the question and its answers take the whole
  width.
- **The class is not on the board**: the class button opens it as a WINDOW in the middle (`ClassWindow`) — the desks, who
  has spoken, who is away. In « I choose » it opens by itself at each question and closes on the tap.
- **A red pointer follows the mouse** (on by default; `lessons/common/classroom/ClassroomPointer`).
- **Who answers next** — the teacher switches at any moment: `order` (the next present student), `teacher` (nobody until
  he taps a desk), `fair` (among those who have spoken LEAST, counting the sessions of the last 60 days). **A tap on a
  desk of the small map always gives the turn to that student**, whatever the mode.
- **An absent student** is marked with one tap and is skipped.
- **The sentence that meets an answer** (`praise`) always carries the name. Never « faux » as a verdict (`session.js ›
  praise`: « Bien vu, Léa. », and on a miss « Pas grave, Léa : on apprend de ses erreurs. »).
- **The right answer is not shown after a miss until the teacher asks for it**: he decides whether the class looks for it
  first.
- Enter or ← goes to the next question. Leaving in the middle asks once and saves nothing.

## 5bis. The rules revised before the lesson (`RulesReview.jsx`)

The hour is a script of four moments, shown as four numbered buttons on the set-up screen: **① start test → ② rules
revised → ③ the lesson on the board → ④ end test**. Each can be opened alone; the result of the start test leads to ②,
the last rule to ③, the last station of ③ to ④.

- **What is revised**: the rules the new lesson will USE — those of its earlier learning points, taken from the learning
  net (`toolsForLesson(lesson)`), core links before support. The wording is the `rules` of the launch-kit family of each
  learning point (`launchkit/families.js`: `{ id, title, text, example, check }`; every example is re-computed by the
  family's tests in `launchkit/launchkit.test.js`). **A new rule card = an entry there**, never a sentence typed in a
  screen. One family exists, `4e.m1.r06` (four cards: a prime number, divisible by 2, 3, 5, a product of primes, what
  2³ is worth): the first 3e lesson « Décomposer un nombre en facteurs premiers » gets moment ② once its pack names its
  board.
- **Order**: when the start test was taken, the learning point the class missed most comes first, with its count
  (`lessonScripts.js › reviewCards`).
- **One rule per screen**, very large.
- **The teacher decides who reads — the platform proposes nobody**: he taps a desk, or reads it himself. The window marks
  who has already read.
- **The example is hidden** until the teacher shows it, so that the class can give one first.
- Nothing is graded and nothing is saved.

## 5ter. The lesson on the board (`LessonBoard.jsx`, `lessonScripts.js`, `BoardBridge.jsx`, `board.jsx`)

The platform's method moved to the board, for one mouse and a whole class: **the class ACTS first, CONCLUDES itself, and
only a rule that survived gets its NAME.** The teacher is never told what to say and is never locked.

**The script is data** — the lesson's own `board/script.js` (`export const SCRIPT = { title, steps }`, named in its pack;
the page loads it with `usePackPart(lessonId, 'script')`). A lesson without a script has no moment ③. Each step has `id`,
`kind`, `chapter` (discover, conclude, name, write) and `cue` — ONE oral question shown in the footer for the teacher;
keep a `cue` short (about 70 characters) and a tablet's `math` to two rows of short equalities. Kinds, each drawn by one
component of `LessonBoard.jsx`:

| Kind | What the class does |
|---|---|
| `situation` | the problem that opens the lesson, with a bridge the board can build (`bridge`) |
| `mission` | **a unit's last lesson**: the station says what the class needs (`needs`), then opens the lesson's OWN world (`world`, `lesson`) on one mission (`mission`) over the whole window, as a preview — the class solves on paper, the board builds what is typed. Leaving the mission comes back to the station |
| `bridges` | **experiments**: the class chooses a gap and a plank, PREDICTS « holds / falls » (or builds without predicting), the board builds; the bridge joins the class's evidence (the last 8); a right prediction earns the class a star; the equality $a = b \times q + r$ is written under each bridge |
| `forge` | **concludes**: its bridges become a table; the class writes a rule with two tiles (the same tiles as the student's rule forge, `ruleForge.js`); the board runs the rule on every line, then ATTACKS it with a gap the class has not built. A rule contradicted or broken goes back to the class. The rule that survives two attacks is sealed |
| `name` | the rule gets its name: the tablet of the lesson (`tablet` = a key of the lesson's own `rules`, handed to the board by `ClassSessionPage` through `usePackPart(lessonId, 'world')`: **one wording for the student's world and for the board**), read aloud by a student the teacher picks or by the teacher; after a `forge` the class's own rule is shown above it. A recall mode hides the key words (`recall`), never inside a formula |
| `ask` | one question whose choices are planks (`a` = the gap, `options`, `answer` = the planks that fill it — **a test must compute it**); every choice can be built in one line (bar + equality). **What is drawn under a card is the WORLD's business** (2026-11-24, `lessonScripts.js › askProof`): `'bridge'` by default (every lesson before the geometry units), `'none'` when the lesson's world content says `boardAsk: 'none'` (handed by `ClassSessionPage` from `usePackPart(lessonId, 'world')` as `askWorld`) — the verdict word only, a card agreeing when it is in `answer` (`askHeld`). **A station may carry a `figure`** (the SAME data as a bank sheet's `statement.figure`, plane): it is drawn by the practice space's `StatementFigure` at the inline end of the station (the right; `.cs-askstep--figure`, the question and its cards beside it), at the width where its smallest label reads **18 px or more at 1366 × 768** (`boardFigure.js`: the exam sitting's `sheetFigure` size rule with the board's floor `BOARD_LABEL_PX` and the board's zoom `boardFit(1366, 768)`), and such a station draws NO bridge under its cards whatever the world; its button reads « On vérifie sur la figure » and a miss « Regardons la figure. » (a world `'none'` without a figure: « On vérifie », « Regardons de plus près. »). An optional **`figureAfter`** (2026-11-26) is what the figure shows once the class has checked — the proof drawn — while `figure` alone, before the check, must not show the answer; the box keeps the `figure`'s width so the cards do not move (`data-cs-figure-state="before|after"`; a station without it renders exactly as before). Hooks: `data-cs-ask-proof`, `data-cs-figure` (the figure box). Figure stations: thalès's board; `multiples-et-diviseurs-communs › pilier-88` (the two walkways running past, then stopping at 88 with the post). No French world is `'none'` yet. Up to SIX choices on ONE row. A step whose choices are NOT planks gives its own `words: { card, held, fell }` (`lessonScripts.js › askWords`) |
| `statements` | sentences judged true / false one after the other; each verdict comes with its reason (`proofOf`) |
| `court` | **a court of the `rootCourts` world** (`LessonBoard › CourtStation`, logic `lessonScripts.js › courtCards / courtShown / courtWords`): ONE square court drawn by the world's own `Court` (`rootCourts/courtParts.jsx`), and at most six cards beside it — rods over a given court (`area`, `rods`) or courts under a given rod (`rod`, `areas`). A tap holds a platform over the court (the class predicts); lowering it, the world answers — it rides, leaves a band, jams, the exact difference written. `answer` = the cards that ride (**a test computes it** from `courtCards`); the proof `after` replaces the question once they were lowered. A rod card may be a fraction, drawn with a real bar |
| `ladder` | **a factor ladder of the `divisorIsles` world** (`LadderStation.jsx`; logic `lessonScripts.js › ladder*`, on the world's own law `divisorIsles/factorLadder.js › layPlank`): ONE gap of `n` cases broken plank by plank. The class proposes the next plank, a tap lays it — it holds: the gap becomes the number of planks laid and a rung « 168 = 2 × 84 » is written on the ladder at the left, as a copybook writes it; it falls: the gap stays, its division and what is left are written. `rack` = the planks on offer (at most eight), `whole` adds a plank as long as the whole gap, `group` counts the equal planks of the finished row (« 4 planches de 2 »), `sheet` replaces the rack by a SHEET of remainders (`divisorIsles/sheet.js`: column A the primes up to the stop, column B the remainders, `=MOD(n;A2)`) — the class taps the line it reads as 0, or says that no remainder is 0 (refused when one is: the zeros are shown, never « faux »). Once the gap is 1 case the row is written as one product and the proof `after` comes — under it, in place of the last rung, the planks of the row still laid in shorter planks (« 6 = 2 × 3 », `lessonScripts.js › ladderBreaks`; « Aucune planche … » when none, 2026-11-23); « Une autre échelle » starts again and keeps two finished ladders beside it. **A test lays every ladder of the script** (to 1 case with what it offers, at most nine rungs, a sheet of at most sixteen lines) |
| `trace` | what goes in the copybook: the keys of the lesson, in the wording just read; long tablets split into SEVERAL `trace` steps of two keys. A long chain of `=` takes its own row (`data-long`); a dense tablet shrinks its card (`data-dense`) — never cut, never broken |

Rules of this screen:

- **The verdict is what the class sees**: planks drop into the water, or the child crosses (`BoardBridge.jsx`, the shared
  `KidFigure`). Never « wrong »: a prediction that misses is met by « why? ».
- **On the board, an `ask`'s `answer` is what FILLS the gap** — over a bridge, the default (a station with a `figure` or a
  world `'none'` has no gap: its cards agree when they are the `answer`): every choice is drawn as the bridge of the gap and that
  plank — green when it fills, amber and falling when it does not. A question whose right answer is a plank that LEAVES
  cells would show the right answer as a fallen bridge: ask it the other way round, and test every `ask` against the
  world's `ruleForge.js › outcome(a, plank).held`.
- **A name never comes before the action**: every `name` step follows a `forge`, an `ask`, a `court`, a `ladder` or a
  `statements` step (tested by the lesson's `board/board.test.js`).
- **An adult's board**: the rail (one group per key, then ONE group for the copybook — `lessonScripts.js › groupsOf`)
  jumps to any station; ← / → and PageDown / PageUp work for a presenter remote; « next » is never disabled.
- **The board remembers the hour** (station, the class's bridges, its rule, who spoke) in the browser tab
  (`sessionStorage`, key `smarter_class_lesson_board`, per class and lesson). Never sent.
- **The board tools are the same on every board screen** (`board.jsx`): the class window, the pen (three pens, undo,
  clear), the red pointer, the curtain (the board goes dark), the timer (1, 2 or 5 minutes; a soft bell).
- **Numbers in sentences are agreed** (`lessonScripts.js › cellsOf`, `leftCells`: « 1 case », « il reste 3 cases »)
  and every equality and proof is computed, never typed.
- Nothing scrolls; nothing leaves its card; the oral question is never cut; a formula never breaks.

**To give a lesson its board**: write its `board/script.js` with the existing kinds; a lesson whose manipulation is not a
bridge or a court needs its own kinds (a new component per kind in `LessonBoard.jsx`, its pure logic tested in
`lessonScripts.test.js`). A lesson need not use `bridges` and `forge`: the pattern `situation` → (`ask` → `name`) per
key → `trace` is valid when each question is made for its rule and PROVED by what the board builds. Each lesson's
`board/board.test.js` computes every answer, every equality and every memo number.

## 5quater. The teacher's exercise bank, and an exercise on the board

`pages/teacher/practice/TeacherBankGate.jsx` decides for `/enseignant/pratique/:lessonCode[/:level/:exerciseId]`: a lesson
in `BOARD_LESSONS` gets what follows; every other lesson keeps the shared hub and the player (`TeacherPracticePlayer.jsx`).

- **The lesson's exercise bank** (`TeacherExerciseBank.jsx`, pure helpers `exerciseBank.js`): a teacher does not
  « start a level ». He READS (level tabs; a line per exercise opens on the statement, the questions and — on demand —
  the key of every question, `keyOf`: never empty), he SHOWS one on the board, he PRINTS a sheet (exercises of any level;
  the tray says how many exercises, questions and minutes; with or without the key on its own page). Printed, the page is
  white (`teacherBank.css`).
- **An exercise on the board** (`ExerciseBoard.jsx`, view `exercise` of the class session, `?exercice=<level>:<id>`): the
  statement stays in sight for every question; one question at a time; the teacher calls a student by his desk; a hint
  only when he asks; the answer and its solution only when he asks. The text fits the board by itself (`Fit`).
- Nothing is recorded by the bank or the board.

**The teacher's dock** (`board.jsx › BoardTools`) is the same on every board screen — the test, the rules, the lesson,
an exercise: who speaks (the class) · the board (pen, pointer, curtain) · the hour (timer, the lesson's lab over the
board). While a tool holds the screen the keys of the board wait (`tools.busy`).

## 5quinquies. The knowledge card on the board (`KnowledgeBoard.jsx`, `knowledgeCards.js`)

The teacher's knowledge card (`/enseignant/carte/:lessonId`; `?carte=1` is the same board as a view of the class
session): one piece of knowledge per screen — the rule (large), the sentence that makes it stick; then, each only when
the teacher asks, an example, the trap, what to do in the exam. **It is a display**: no class to choose, nobody to name;
the dock without the class window. The cards are the lesson's OWN knowledge (`LESSON_KNOWLEDGE › memo`), imported, never
retyped. On every card, for the teacher: **the earlier lessons this learning point is connected with** (the learning net,
core first), each with its direct link when it is published (`earlierLessons`). Nothing is recorded.

## 6. The result (`SessionPlay.jsx › Result`)

- After the START test the result offers the next moment of the hour (the rules, or the new lesson when it has no rule
  card).
- « 7 / 10 » for the class, and the sentence « this test does not change any student's progress ».
- **Learning points to revise**: each with less than half right, the weakest first, named by the lesson that teaches it.
- **The podium**: three steps, **the first in the middle**; the TEAMS stand on it under their names with their students
  drawn as the platform's character (`KidFigure`). Teams with the same result share a step. **Nobody is ever shown as
  last**: a team with nothing right is simply not on the podium. How the character is dressed is an open decision for
  France (plan §7, 7) — the code still draws the Algerian rule.
- **Right today**: the names of those who answered right.
- **At the start / now** (end test only): the questions of the new lesson asked at the start of the hour against the
  same learning point now — what the hour changed.

## 7. What is saved, and what never is

| Table | Holds |
|---|---|
| `class_seatings` | the map of a class (one row per class) |
| `class_tests` | a teacher's copy of a lesson's test |
| `class_sessions` | a FINISHED session: class, lesson, moment, absent students, the result (recomputed by the server per learning point) |
| `class_session_answers` | who answered which question, right or not, and how he was chosen |
| `teacher_lesson_files` | the lesson file: a teacher's one whiteboard document on a lesson (private to him) |

- **Never learning evidence** (`ClassSessionTest::test_a_class_session_is_never_learning_evidence`): no row in
  `learning_evidence` nor in `student_learning_point_progress`.
- **The revision and the lesson on the board send nothing**: no table, no request. What the board remembers lives in the
  browser tab (§5ter).
- A session names only ACTIVE students of the class; only the teacher of the class reads and writes (`ClassroomPolicy`).
- **A lost connection loses nothing**: the session runs fully in the browser and is sent once at the end; if the network
  fails it waits in an outbox (`classSessionService.js › sendSession`, `flushOutbox`). The server ignores a session it
  already has (`uuid`).

API (`/api/v1/teacher`, the locks of every teacher route): `GET|PUT /classrooms/{id}/seating`,
`GET|POST /classrooms/{id}/class-sessions`, `GET|PUT|DELETE /class-tests/{lessonCode}`,
`GET /classrooms/{id}/lesson-tracking/{lessonCode}`, `GET|PUT /lesson-files/{lessonCode}`.

## 8. Check

- API: `cd apps/api && php8.4 artisan test --filter='ClassSessionTest|LessonTrackingTest'`.
- Unit: `npx vitest run src/features/classSession` in `apps/web` (the turn, the teams, the three ways to choose a student,
  the sentences, the result and the podium, the map's edits, the script helpers, the tracking order, the bank helpers,
  `boardLessons.test.js` on the fixture `test/lessonIndexFixture.js`, `courtStation.render.test.jsx`,
  `ladderStation.render.test.jsx`, `figureStation.render.test.jsx` — a station and a memo opening that draw a geometry
  figure: drawn by StatementFigure at the board's width, 18 px labels at 1366 × 768, no bridge under its cards once
  checked, the bridge kept for a station without a figure, a world `'none'`; the memo's figure and its 12 px floor). A lesson's own board: `npx vitest run <its folder>/board`.
- Walk: none. The Algerian walks (`class-session.mjs`, `class-lesson.mjs`, `class-lesson-qawasim.mjs`) were deleted with
  their lessons; the checks they made (nothing scrolls, no clipped card, a class of 35 on the map, the header boxes equal
  on the five tool pages, the memo printed on two pages) are owed again by the first French lesson's walk.

## 9. Not built yet

- **Group formats** — relay by rows, first hand up (the teacher as referee), slates, the whole class against the clock;
  speed only as a tie-break; balanced teams in one tap; the individual podium at the end of a unit; awards for the one
  who recovers and the one who helps; the student who missed at the start asked the same learning point again at the end.
- **The student's view at home** of his own class answers; the teacher's record of the session.
- The earlier-lesson links of the knowledge card are per LESSON; a lesson with several items should show them per item.
- The results of the student's own launch, capsule and rule forge on the teacher's side (they still live in the
  student's browser).
