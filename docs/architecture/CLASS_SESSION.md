# « حصّة القسم » — the teacher's class session

> **Status: steps 1 and 2 built on 2026-11-18 on the pilot lesson `qasim-adad-tabii`; the same day the owner asked for the
> rules revised after the start test and for the during-the-lesson mode « rebuilt entirely » — both built (§5bis, §5ter).
> No real class has used it.** The steps not built are listed in §9.
>
> **BINDING for the lesson v2 rollout (owner decision D6, 2026-11-17): every v2 lesson follows this contract — `LESSON_V2.md` says how a lesson plugs into it.** What has not changed: it was built on the pilot lesson and no real class has used it yet.
> The older « وضع القسم » (Classroom Mode of a lesson page, `TEACHER_CLASSROOM_ARCHITECTURE.md`) is untouched: the lesson
> on the board described here is a separate screen of the class session, on the pilot lesson only.
> Code: `apps/web/src/features/classSession/`, `apps/web/src/pages/teacher/ClassSessionPage.jsx`,
> `apps/api/app/Domain/ClassSession/`, default tests in `content/class-tests/`.

## 1. The goal

The lesson in class is ONE shared event: one screen, one mouse. Every student takes part BY NAME and is treated with
dignity. In five minutes the teacher knows where the class stands before teaching, and in five minutes at the end what the
hour changed. The teacher owns the content. **Nothing here touches a student's progress.**

The teacher's screens are not the student's: no game, no story. Light and calm (a projector washes out dark themes), facts
and counts, one decision per screen, readable from the last row, nothing to learn before using it.

## 2. On the lesson page: the teacher's card

**While it loads, a skeleton — never an empty gap** (2026-11-21, `BUNDLE_BOUNDARIES.md` rule 13):
`features/classSession/TeacherSkeletons.jsx` gives the card's shape (`TeacherPanelSkeleton`, the fallback of its lazy
boundary in `LessonIndex`), the class-session page's (`ClassSessionSkeleton`, while the pack's parts arrive) and its
set-up screen's (`ClassWorkSkeleton`, while the class's four requests are pending), and the layer of « مختبر الدرس »
opening (`LabOpeningSkeleton`). A new lazy boundary on the teacher's side uses one of them, never `fallback={null}`.
The mission of the board opens behind the world's own loading screen (`GAME_WORLD.md` §1bis).

`TeacherLessonPanel.jsx`, shown to a teacher on a lesson whose pack has a `board` or a `world` (`lesson.pack.js`, `LESSON_V2.md` §1). It is the
teacher's ONE place on the page, in the order of his work (owner, 2026-11-18: « organize the thing and the tools of the
teacher », then « the UI/UX needs absolutely to be enhanced », « update the colors too »):

| Block | Doors |
|---|---|
| **في القسم** | « حصّة القسم » and — on a lesson that has its board — the four moments of the hour, each a card that says what happens in it and opens it directly (`?moment=start\|revise\|lesson\|end`) |
| **أحضّر** | « جرّب الدرس كتلميذ » · « المذكّرة الكاملة » · « ملفّ الدرس » (§2ter: its own full-screen page) |
| **أدواتي** | « مختبر الدرس » (the lesson's own lab `LessonLab`) · « بنك التمارين » (§5quater) · « بطاقة المعارف » (the lesson's knowledge card, full screen) |
| **أتابع** | « متابعة القسم » (§2bis) |
| **قبل أن تبدأ** | what the students will learn · what the lesson stands on (`toolsForLesson`: core / support, with the year) · the mistakes students really make (`launchkit/families.js`) |

**The top of the page**, for the teacher of a lesson that has its board, is one calm line — back to his lessons, where
he is (ميدان › وحدة), a discreet report link — and a quiet line of facts under it (level, محاور, minutes), instead of
the mono breadcrumb, the amber report pill and the blue chip.

**The header common to the lesson's tools** (`LessonToolsBar.jsx`; owner: « make the top header common between the tools…
easy to navigate through all the tools of the lesson »): the lesson's title, then one tab per tool — الدرس · حصّة القسم ·
المذكّرة · ملفّ الدرس · بنك التمارين · متابعة القسم · بطاقة المعارف. **The tabs sit on the RIGHT, the lesson's name on the
LEFT** (owner, 2026-11-18). It is the top of the lesson page and of the five tool pages — the memo, the lesson file, the
exercise bank, the tracking (`/enseignant/mutabaa/:lessonId`) and the knowledge card (`/enseignant/bitaqa/:lessonId`,
both in `pages/teacher/LessonToolPages.jsx`). All live INSIDE the teacher's space (its side navigation stays); only
« حصّة القسم » opens full screen.

**One frame, `LessonToolPage`** (owner: « the top header must have the same width, style and position of buttons in all
these tools, unless the full-screen mode is activated »): every tool page is `<LessonToolPage lessonId active>` — the
header across the whole width, then the tool. Rules: a tool NEVER adds a button to the header (the memo's « طباعة » is in
its rail); a tool page writes no second title of itself under the header; the report button « بلّغ » of the lesson page is at the BOTTOM of that page (`data-teacher-report`), not in the header; on the lesson file the page is exactly one
viewport (the lab's shell is one viewport tall by itself and pushed the header out). The walk measures the header and
every tab on the five pages and requires the SAME boxes. **Full screen is the computer's real one** (Fullscreen API on
the document — the browser's tabs and bars go): the knowledge card's « ملء الشاشة » is a tool of its dock, beside قلم ·
المؤشّر · ستار · مؤقّت · مختبري (`BoardTools › fullscreen`), it becomes « خروج » while on, and the teacher's navigation and
the header are hidden only then. A new tool of a lesson = one entry in `lessonTools`.

**One calm palette** (binding for the teacher's screens of a lesson): white surfaces, dark ink (`slate-900`), grey for
what is secondary; the dark tone marks only what is pressed. No gradient, no colour per tool; green only where it means
something (« أساسي », a right answer).

### A lesson that has its board has no « وضع القسم » and no old lesson home for its teacher

`features/classSession/boardLessons.js › BOARD_LESSONS` is the lessons that have a board script — read from the generated
lesson index: the lessons whose pack has `board` (`LESSON_V2.md` §1), never a list typed by hand. Owner, 2026-11-18: « no need for the older version → delete it », scope **the
pilot lesson only** — the other lessons keep everything until each gets its script. For a listed lesson:

- the old « وضع القسم » is retired: `LessonClassroomShell` passes `retired` to `ClassroomPresentation`, so no entry button
  exists on the lesson page, its modules, or the labs and tests nested in them; an old arrival (`CLASSROOM_START_STATE`)
  is sent to « حصّة القسم »;
- the teacher's catalogue card and the مذكرة open « حصّة القسم » instead (`memoRoutes.js › classDoor`); the per-phase
  « اعرض » links of the memo are not shown (`canPresentPath`);
- **the teacher's lesson page is the title and his card**: the progress box, « الكفاءات / المتطلبات / المناولات »,
  « مسألة الدرس », « مسار المحاور » and the practice card are not rendered for him (`LessonIndex › teacherBoard`); the
  floating « بطاقتي » and « كرّاسي » buttons are hidden — both are doors of the card. Students see the world. A v2
  lesson has no module page any more (deleted 2026-11-18, `LESSON_V2.md` §2): its module addresses redirect here.

To retire the old mode on another lesson: write its script and its memo in its folder (`board/script.js`,
`board/memo.js`), name them in its pack (`board: { script, memo }`), run `npm run generate:lesson-index`.

**« جرّب الدرس كتلميذ »** (`?apercu=eleve`): the teacher opens the student's own world — the game, the launch, the rule
forge — under a banner « معاينة الأستاذ: ما يراه التلميذ. لا شيء يُسجَّل. ». In preview no module is marked done and no game
evidence is sent (`DivisorIsles preview`, `LessonIndex › previewAsStudent`). Before this, a teacher could not see what his
students live: he got the classic lesson page only.

## 2bis. « متابعة القسم » — the class on this lesson, student by student (`ClassTracking.jsx`, `tracking.js`)

Data: ONE read-only endpoint,
`GET /teacher/classrooms/{id}/lesson-tracking/{lessonCode}` (`ClassroomLearningPointService::lessonTracking`; same
entitlement as the per-student detail, `PROGRESS_STUDENT`; active members only; the lesson must be in the class's scope).
For each student: his state on every الكفاءة of the lesson, and per exercise the questions answered, right (last try) and
right at the first try.

- The class first, in facts: per الكفاءة a bar of four COUNTS (« متمكّن », « يحتاج دعمًا », « ثغرة », « لم يُقيَّم بعد ») —
  never a percentage, never an average.
- One line per student: a square per الكفاءة, his exercises (« تمرينان · أصاب 6 / 7 »). A line opens on the detail.
- **The order is « who needs me first »** (a gap, then « needs support », then not started, then the others; by name
  inside a group) — never a ranking by score (`tracking.js › orderStudents`, tested).
- Read-only: the endpoint writes nothing (`LessonTrackingTest`).
- **Its own screen** (`/enseignant/mutabaa/:lessonId`, in the teacher's space under the common header; the class is chosen there, the first active one by default; the old `?onglet=suivi` view of the session page still exists): owner — « it has nothing to do with مسار الحصّة ». It
  is NOT a tab of the set-up screen: the class and the tracking, nothing of the hour around them.
- **The window of one exercise of one student** (`StudentWork`): from the opened line, « شاهد إجاباته » shows the exact
  exercise — its statement, each question, what the student wrote at each try (right, or « يُعاد »), the questions he
  did not answer, and the expected answer. Data: the existing `GET /teacher/practice/{lesson}/exercises/{id}/students/{student}`.
  A right answer is `correct` or `equivalent_correct` (`tracking.js › isRight`).
- In the opened line the two blocks are one under the other: a long الكفاءة wraps, nothing runs over anything (checked).

## 2ter. « ملفّ الدرس » — the teacher's work file of a lesson (`LessonFilePage.jsx`, `lessonFileDoc.js`)

ONE file per (teacher, lesson). The owner's decisions of 2026-11-18, in the order he took them — the last ones win:
« one single file per lesson » → « not a window: a full screen, one empty space without any guidance » → « use exactly
the existing whiteboard of the Math Lab and remove the one you created » → « the whiteboard must be separated completely
from the lab: when the teacher exits he returns to the lesson, not the lab; adapt the colours ».

- **The instrument is the Math Lab's whiteboard, used as it is** (`features/mathlab/tools/whiteboard`: pens, geometry
  tools, text, shapes, attachments under the lab's quota, autosave). Nothing of it is rebuilt — an earlier page with its
  own drawing, image and link code was removed the same day.
- **The page is not in the lab**: `/enseignant/milaff/:lessonId`, outside `/enseignant/atelier` — but INSIDE the teacher's
  space, under the common header of the lesson's tools (owner's last word: « without hiding the right nav and the top
  header… hidden only if the full screen gets activated »): the whiteboard's own full-screen button is what covers them. The way out (`MathLabShell labHome`) is the lesson page. The lab's blue accents are replaced
  by the teacher's calm palette there only (`pages/teacher/lessonFile.css`).
- **The link lesson → document** is the table `teacher_lesson_files` (`math_lab_document_id`, null on delete);
  `GET|PUT /teacher/lesson-files/{lessonCode}` — the PUT accepts only the teacher's OWN whiteboard document. The first
  opening creates the document and attaches it; two openings made together share one (`lessonFileDocumentId`).
- **It is not a work of the lab**: the lab's « أعمالي » never lists it (`MathLabDocumentService::listFor` leaves out the
  documents attached to a lesson file).
- The student's « كرّاسي » is a different thing and is untouched.

## 2quater. « المذكّرة الكاملة », one part at a time (`LessonMemoPage.jsx`, `memo.css`)

Owner, 2026-11-18: « too heavy… the teacher gets lost and tired from scrolling: make it more intelligent and flexible ».
The memo of EVERY lesson (the page is shared) was one column of eleven sections — 16 screens on the pilot. Now:

- **One part on screen at a time.** A rail lists the parts in the order of a teacher's hour — قبل الحصّة (overview,
  objectives, opening situation) · أثناء الحصّة (the hour, examples, mistakes, differentiation) · بعد الحصّة (synthesis,
  evaluation, what comes next) · لي (his notes). « السابق / التالي » walk through them.
- **« سير الحصة » shows one phase at a time**: the phases are tabs (number and minutes); « كلّ المراحل » shows them all.
- **« المذكّرة كاملة »** puts the whole memo back in one column for whoever wants it; **printed, the whole memo comes out**
  as before.
- The links of the page still work: `#memo-<part>` opens that part, `#memo-phase-<n>` that phase.
- The sections themselves (`MemoSections.jsx`) and their content are unchanged.

**A lesson that has its board has a WRITTEN memo** (owner, same day: « the content must be updated: research what a good
one is », « in وضعية الانطلاق propose different ones, including the one of the class session, with SVG images », « the
UI/UX also, specially the top »). The memo is the lesson's own file `board/memo.js` (`export const MEMO`, named in its pack — a lesson that has a board
has both a script and a memo; the model's parts are `features/classSession/lessonMemos.js`), page `BoardMemo.jsx`, drawings `MemoFigures.jsx`. Its model is what good lesson plans share (the
« 5 practices » of orchestrating discussions, launch–explore–summarize, the Algerian وضعية الانطلاق → بناء التعلّمات →
الاستثمار): a goal with OBSERVABLE success criteria; several opening situations; the hour as « حصّة القسم » runs it;
the students' likely answers and misconceptions ANTICIPATED, each with a question to check and a question to push
forward; what goes on the board and in what order; what is written; a three-question exit ticket; support and
extension; and **« الحصّة في صفحة »**, the one page for the desk.

- **Opening situations are drawn from their own numbers** (`openingFacts`): the planks laid, the players left out, the
  books that do not fit, the gap no tile fills — never a typed count, never a generated image, no person drawn. The one
  used by the class session is marked and opens it. A lesson on « قصر الساحات » uses the figure **`court`** (2026-11-21,
  `jidhr-tarbii`): an opening `{ kind: 'court', a, b, alt }` (numbers as text: « 324 », « 14,44 ») is a square court and
  two rods tried on it, each panel drawn from the exact `rootCourts/logic.js › outcome` — the band in amber, what sticks
  out in violet, green when it rides — and captioned in the world's words (« شريط مساحته بلاطتان », « تعلق: تزيد 11
  بلاطة », agreed by `rootCourts/strings.js › tiles`). `openingFacts` then gives `{ b, kind, covers, diff, r, exact }`.
- Every equality of the memo is re-computed by `lessonMemos.test.js`; the memo never names « وضع القسم ».
- **The top bar is one calm line**: the lesson, the title, the length of the hour, print, « ملفّ الدرس », « حصّة القسم ».
- It has no « كرّاسي » block: the teacher's own notes on the lesson are « ملفّ الدرس », in the top bar. Its text is drawn
  one size up (the stage is zoomed 16 %): a memo is read from a step back.
- **On paper the whole memo is two A4 pages at most** (owner): a dense print layout in `memo.css` (the stage drawn at
  61 %, the four opening situations in one row, lists in columns, its own title). The walk prints the real PDF and counts
  its pages — a longer memo must be shortened, not allowed a third page.
- To write the memo of another lesson that gets its board: write its `board/memo.js` with the same parts.

## 3. The seating map (`SessionSetup.jsx › SeatingMap`, `session.js`)

The classroom drawn from above, the board on top. Set once at the start of the year, changed whenever the teacher wants.

- **A tap on a student, a tap on a desk**: he moves there; if the desk is taken the two swap (`moveSeat`). « عدد الصفوف »
  re-seats the class in the same order (`reflow`). A student who joins later sits after the last row
  (`seatEveryone`); one who left loses his desk.
- **The turn follows the seats**: row by row from the board (`turnOrder`).
- **Teams.** By default one team per **« صفّ », the VERTICAL line of desks from the board to the back of the room** (owner,
  2026-11-18: « pick the vertical one » — seven students on four lines make four teams of 2, 2, 2 and 1): as many teams as
  lines, under the names of scholars (`SCHOLARS`: الخوارزمي، ابن الهيثم، الكاشي…), renamable. « الفرق » gives the teacher **his own teams, any number from 2 to 12** (owner: « not
  necessarily 3 teams »): the class is dealt in the order of the turn, then a tap on a student's colour moves him to the
  next team (`customTeams`, `nextTeam`).
- **ولد / بنت** is set by the teacher on each desk — **never guessed from a name**. It chooses the form of the sentences
  (« لا تقلق » / « لا تقلقي ») and the character on the podium; unset, the sentence is one that fits everyone and the podium
  shows a medal with the initial.
- Saved by itself (`PUT /teacher/classrooms/{id}/seating`); the server keeps only ACTIVE students of the class.

## 4. The test of a lesson (`SessionSetup.jsx › TestEditor`)

Two moments: **« اختبار البداية »** (the earlier الكفاءات the lesson stands on, then two questions of the NEW lesson) and
**« اختبار النهاية »** (the lesson, with those two asked again under other numbers).

- **The default test is a file of the repository**, `content/class-tests/<grade>/<lesson>.json` (`start`, `end`, and a
  `pool` of more prepared questions). It is never overwritten. Every question carries a `check` from which its answer is
  RE-COMPUTED by `defaultTests.test.js`, and for a choice every other option is proved wrong: a default test never ships a
  wrong answer. Files on 2026-11-18: `qasim-adad-tabii`, `qawasim-adad-tabii`, `khawass-qawasim` (lesson 3, written before
  its board). Lesson 3 added the `check` types of a PROPERTY of divisors — `commonFactor` (« a ± b = d × … », d dividing
  both), `multipleFactor` / `multipleDivides` (m × a), `converseSum` (d divides a + b but not each: the converse that does
  not hold), `commonRemainder` / `remainderShares` (the remainder of the Euclidean division, the division written in the
  text is checked), `letterProof` (« $a + b = d \times (k + m)$ »: an option proves it when its right side is d times a
  bracket AND equals the left side for several k > m — evaluated, never read from the answer). A check also verifies that
  the numbers it computes on are the ones written in the question.
  **The division road (2026-11-18)**: `1am/qisma-iqlidiya-baqi.json`, `1am/qawaid-qabiliyat-qisma.json`,
  `2am/qisma-iqlidiya-hasr.json` — the API finds a file in ANY grade folder (`ClassSessionService::defaultTest` globs
  `*/<lesson>.json`), and the test checks that a file sits in `<grade>/<lesson>.json` of its own `grade` and `lesson`. Their
  start tests ask what the launch kit measures (the 1AM operations for the 1AM division; the 1AM division for the two others)
  then two teasers. New `check` types, each re-computed: the operations — `product`, `difference`, `equality` (« $7 \times 6
  + 4 = 46$ », the product before the sum), `valuePick`, `trueEquality`; the division — `dividend` (b × q + r with r < b),
  `restMax`, `restPick`, `remainderIs`, `euclidIs` (a written equality: true AND r < b), `quotientBetween` (« بين 30 و 40 »:
  the quotient estimated by tens); the rules — `missingDigit` (« 47▢ »: exactly one digit fits), `ruleReads` (what the rule
  of k reads: the units digit, the digit sum or the last two digits, each option written as its form says); the bracket —
  `needed` (the trips NEEDED, ⌈a ÷ b⌉), `upper` (the value by excess, a remainder required), `bracket` (« $q < a \div b <
  q + 1$ » or « $a \div b = q$ », compared as fractions, the two numbers consecutive, the Euclidean division written in the
  question). The numbers are the platform's own, none of the lesson's world.
  **Lesson 4 « القاسم المشترك الأكبر » (2026-11-19)**: `4am/qasim-mushtarak-akbar.json` — no pair of the lesson's exercise
  bank. New `check` types: `pgcd` (a number, re-computed by Euclid), `pgcdPick` (the option equal to the PGCD — a common
  divisor that is not the greatest and the larger number are the wrong ones), `commonDivisor` (true / false: d divides a
  AND b — also a sharing into d identical lots), `commonSet` (« 1 ، 3 ، 9 »: the list of the common divisors, exactly),
  `pgcdDivisors` (the PGCD the question gives is checked true, and the right list is its divisors), `perLot` (the lots
  given ARE the PGCD; one lot holds a ÷ PGCD).
  **Lesson 5 « تعيين القاسم المشترك الأكبر » (2026-11-19)**: `4am/tayin-pgcd.json` — no pair of the lesson's exercise
  bank; the end test weighs the three الكفاءات as the bank does (four questions on listing, two on the direct results,
  two on the smaller dividing the greater). New `check` type: `pgcdIs` (true / false: the sentence « $\mathrm{PGCD}(a ;
  b) = g$ », written as such in the question, judged by Euclid — 0 and equal numbers included).
  **Lesson 6 « البحث عن القاسم المشترك الأكبر » (2026-11-19)**: `4am/bahth-pgcd.json` — no pair of the lesson's exercise
  bank nor of its story; the end test weighs the five الكفاءات as the bank does (Euclid and the choice of the algorithm
  first). New `check` types: `pgcdEqual` (true / false: « $\mathrm{PGCD}(a ; b) = \mathrm{PGCD}(c ; d)$ » — the remainder
  and the difference that keep the PGCD, the quotient taken for the remainder as the trap; a Euclidean division written
  beside it is checked too), `pgcdSame` (choice: the option « $\mathrm{PGCD}(x ; y)$ » that keeps the PGCD of the pair),
  `subtractions` / `divisions` (the steps of each algorithm down to 0, each algorithm RUN by the test), `fewerSteps`
  (which algorithm is shorter, each option written as its form says).
  **Lesson 7 « العددان الأوّليّان فيما بينهما » (2026-11-19)**: `4am/awwaliyan-fima-baynahuma.json` — no pair of the
  lesson's exercise bank nor of its story; the end test weighs P1–P3 as the bank does (one, five, two questions). New
  `check` types: `coprime` (true / false: the pair's PGCD is 1), `coprimePick` (choice: options « a و b », the pair whose
  PGCD is 1), `witnessPick` (choice: the common divisor other than 1), `noSmallWitness` (true / false, ALWAYS false:
  « none of 2, 3, 5 divides both, so they are coprime » — the test checks the premise is true AND that a common divisor
  other than 1 exists, so the sentence never teaches a false proof with a true end).
  **Lesson 8 « اختزال كسر » (2026-11-20)**: `4am/ikhtizal-kasr.json` — no pair of the lesson's exercise bank nor of its
  story (`scripts/lesson-bank-numbers.mjs`); the end test weighs P1–P4 as the bank does (P1 4, P2 9, P3 94, P4 42 of 149
  questions: one, one, four, two). A fraction is written « $\frac{n}{d}$ » and judged by the test from its terms. New
  `check` types: `equalFraction` (choice: the option of the same value — 1AM), `missingTerm` (number: « $\frac{n}{d} =
  \frac{m}{\dots}$ », a whole denominator), `irreducible` (true / false: the fraction's PGCD is 1), `irreduciblePick`
  (choice), `oneStep` (number: the divisor that gives the irreducible form in ONE division — the PGCD, never 1),
  `reduced` (choice: the option EQUAL to n/d AND irreducible — an equal fraction still reducible is the trap),
  `reducedIs` (true / false: « the irreducible form of n/d is p/q »), `stage` (choice: n/d with both terms divided by
  k — k subtracted, or one term divided, are the traps), `resultReduced` (choice: a calculation on two fractions, `+`,
  `−` or `×`, computed by the test; the unreduced result is the trap).
  **Unit 2, lesson 1 « الجذر التربيعي لعدد موجب » (2026-11-21)**: `4am/jidhr-tarbii.json` — the start test asks the
  powers of a rational number (3am.m3.r06) and the SQUARE of a hypotenuse (3am.m4.r03); the end test weighs P1–P3 about
  equally, as the bank does. Every value is computed EXACTLY on text numbers (`rootCourts/logic.js`: « 7,94 » is never a
  float); a number answer must be a whole number of at most six digits (the board's keypad has digits only), so a
  decimal or a root is asked as a choice. New `check` types — `power`, `pythagoras`, `root`, `squareOfRoot`,
  `rootOfSquare` COMPUTE one value and serve all three kinds (`valued`): a number answers it, a choice holds exactly the
  options equal to it (« $7{,}94$ »), a true-false is « $<formula> = <claim>$ » written as such in the question —
  `power` (x^n, a negative or decimal base in brackets), `pythagoras` (a² + b², the legs shown), `root` (the positive
  number whose square is a; none when a has no exact root; `court: true` asks it in words, « ساحة مربّعة مساحتها … »),
  `squareOfRoot` ((√a)² = a), `rootOfSquare` (√(x²) = |x|: a side has no sign); and `rootBetween` (choice « p و q »: two
  consecutive whole numbers with p² < a < q², a having no whole root), `exactSide` (choice: « $\sqrt{a}$ » or a decimal
  whose square IS a — the calculator's digits and the half are the traps), `rootApprox` (choice: the value of √a to a
  `step` « بالنقصان » (d² ≤ a < (d + step)²) or « بالزيادة » ((d − step)² < a ≤ d²), d a whole number of steps).
  **Unit 2, lesson 2 « الأعداد الناطقة والأعداد غير الناطقة » (2026-11-21)**: `4am/natiqa-ghayr-natiqa.json` — the start
  test asks the powers of a rational number (a fraction squared among them, 3am.m3.r06) and what lesson 1 taught (a whole
  root, a value by default), then two teasers asked in a court's words, never with a key's name; the end test covers the
  three keys and P1–P4 (P4, the rounded value, is tested by no question of the bank). A FRACTION is now an answer like any
  number: an option « $\dfrac{5}{7}$ » (or « $-\dfrac{16}{49}$ ») is read exactly, and a fraction given in a question
  keeps its terms (`texGiven`: « \sqrt{\dfrac{50}{98}} » is never rewritten 25/49) — `root`, `power` and `exactSide`
  take fractions. New `check` types: `isRational` (true / false: « $\sqrt{a}$ عدد ناطق » or « … عدد غير ناطق », judged by
  whether a is the square of a rational — whole, decimal, fraction reduced or not), `rationalPick` (choice: the one root
  that is — `want: 'rational'` — or is not rational), `rounded` (choice: the ROUNDED value of √a to a `step`, a whole
  number of steps d with (d − step/2)² < a < (d + step/2)², the word « المدوَّر » in the question; the values by default
  and by excess are the traps).
- **The teacher's copy** lives beside it (`class_tests`, one per teacher and lesson): remove, reorder, add from the pool,
  **write his own question** (choice, true / false, number). Writing one, he reads « أنت المسؤول عن صحّة هذا السؤال: المنصّة
  لا تتحقّق من الأسئلة التي تكتبها »; it is marked « سؤال الأستاذ » and stays private to him.
- **« استرجع الاختبار الأصلي »** deletes the copy: the default is back, whole.
- Three kinds only — `choice`, `truefalse`, `number` — because the class answers with ONE mouse.

## 5. The test on the board (`SessionPlay.jsx › Player`)

- **The question owns the board** (owner, 2026-11-18: the board must serve a BIG class, read from the last desk). The name
  of the student whose turn it is stands ACROSS THE TOP in very large letters (72 px on a laptop), with his team; the
  question and its answers take the whole width (44 px and 36 px).
- **The class is not on the board**: « القسم » opens it as a WINDOW in the middle (`ClassWindow`) — the desks, who has
  spoken, who is away, « غياب ». In « أختار أنا » it opens by itself at each question and closes on the tap.
- **A red pointer follows the mouse** (« المؤشّر », on by default): the one of Classroom Mode (`ClassroomPointer`), so that the
  back of the room sees where the student at the mouse is.
- **Who answers next** — the teacher switches at any moment:
  `order` « بالترتيب » (the next present student), `teacher` « أختار أنا » (nobody until he taps a desk), `fair` « اختر لي »
  (among those who have spoken LEAST, counting the sessions of the last 60 days: over a few lessons everyone is called).
  **A tap on a desk of the small map always gives the turn to that student**, whatever the mode (owner: « I select the
  student myself despite the default order »).
- **An absent student** is marked with one tap (« غياب ») and is skipped.
- **The sentence that meets an answer** (`praise`) always carries the name, the owner's own words first:
  right — « أحسنت يا عمر، بارك الله فيك! »; a miss — « لا تقلق يا عمر، الكلّ يرتكب الأخطاء، لكنّ قليلًا فقط من يستدركون خطأهم. »
  Never « wrong » as a verdict.
- **The right answer is not shown after a miss until the teacher presses « أظهر الجواب »**: he decides whether the class
  looks for it first.
- Enter or ← goes to the next question. Leaving in the middle asks once and saves nothing.

## 5bis. The rules revised before the lesson (`RulesReview.jsx`)

The hour is a script of four moments, shown as four numbered buttons on the set-up screen (« مسار الحصّة »): **① اختبار
البداية → ② مراجعة القواعد → ③ الدرس على السبّورة → ④ اختبار النهاية**. Each can be opened alone; the result of the start
test leads to ② by one button (« مراجعة القواعد »), the last rule leads to ③, the last station of ③ leads to ④.

- **What is revised**: the rules the new lesson will USE — those of its earlier الكفاءات, taken from the learning net
  (`toolsForLesson(lesson)`), core links before support. The wording is the `rules` of the launch-kit family of each
  الكفاءة (`lessons/common/launchkit/families.js`: `{ id, title, text, example, check }`; every example is re-computed by
  `lessonScripts.test.js`). **A new rule card = an entry there**, never a sentence typed in a screen.
- **Order**: when the start test was taken, the الكفاءة the class missed most comes first, with its count
  (« في اختبار البداية: 0 / 4 ») — `lessonScripts.js › reviewCards`.
- **One rule per screen**, very large (≥ 30 px on every supported size, checked by the walk).
- **The teacher decides who reads — the platform proposes nobody** (owner): « أختار قارئًا » opens the class window and
  he taps a desk, or « أقرأها أنا ». The name stands across the top (« يقرأ: سلمى »). The window marks who has already
  read.
- **The example is hidden** until « أظهر المثال », so that the class can give one first.
- Nothing is graded and nothing is saved.

## 5ter. The lesson on the board (`LessonBoard.jsx`, `lessonScripts.js`, `BoardBridge.jsx`, `board.jsx`)

The platform's method moved to the board, for one mouse and a whole class: **the class ACTS first, CONCLUDES itself, and
only a rule that survived gets its NAME.** The teacher is never told what to say and is never locked.

**The script is data** — the lesson's own `board/script.js` (`export const SCRIPT = { title, steps }`, named in its
pack; the page loads it with `usePackPart(lessonId, 'script')`). A lesson without a script has no
moment ③. Lesson 4 `qasim-mushtarak-akbar` (13 stations, 2026-11-19) shows how a question about TWO numbers is asked with
an `ask`, which builds over ONE gap: the options are chosen so that the planks filling that gap are exactly the answer (all
options divide the other number, written with its equalities in the text) — its `board.test.js` computes both sides.
Lesson 8 `ikhtizal-kasr` (11 stations, 2026-11-20) asks a FRACTION the same way: the fraction is a bridge whose stretch is
lit; the options are planks of the lit stretch (proved by an equality in the text), the gap `a` is the whole bridge, so
the planks that hold ARE the common divisors; the fractions themselves are formulas of `text` / `after`
(`$\frac{60}{96} = \frac{30}{48} = …$`). **Not built:** a station that draws a bridge WITH its lit stretch, or a fraction
with its bar beside a bridge — the board shows the whole bridge only.
**A lesson NOT on the islands**: `jidhr-tarbii` (11 stations, 2026-11-21) is on « قصر الساحات » (`rootCourts/`): its
hour is `court` → `court` → `name`, three times, then two `trace` pages — no `situation`, `ask` or `bridges` (those draw
a bridge). Its `board.test.js` evaluates every formula of the script and the memo EXACTLY (products, `\sqrt{…}`, `^2`,
chains of `=` and `<`), and checks that nothing before the naming of the first key says « جذر » or shows √ (no wall card
either: a wall is drawn with its sign).
`natiqa-ghayr-natiqa` (10 stations, 2026-11-21) is the second hour on the courts, with NO new kind: `court` → `court` →
`name` (🧩: a court whose gate shows 529/49, then 722/98 not reduced), `court` → `name` (♾️: the court of 14 chased by
11/3, 3,75, 101/27, 116/31 and the calculator — none rides), `court` → `court` → `name` (🎯: on 69 the middle mark
of a tenth jams, the middle mark of a hundredth leaves a band), two `trace` pages. **A rod card may be a FRACTION**
(« 23/7 »: `courtCards` keeps it a fraction whenever its denominator is not made of 2 and 5 only — 31/8 would be written
3,875 —, its card drawn `\dfrac` with a real bar); a card's own `label` names a middle mark (« العلامة الوسطى »). Its
`board.test.js` evaluates `\dfrac{…}{…}` and `>` too, checks that no key's word (« ناطق », « غير ناطق », « مدو ») is
said or labelled before its naming, that no fraction is written with a slash where the class reads, and that a line of
the script holds at most one of the hour's numbers. **Known, not mine to fix (`rootCourts/courtParts.jsx`)**: inside
the court's own drawing the rod's label under the platform and the difference written beside it are plain text, so a
fraction rod reads « 23/7 » there (the card beside it has the bar). **The memo figure `court`** (`MemoFigures.jsx ›
NumCap`) draws a fraction area, rod or difference with a real bar — its captions laid lower and its courts smaller only
when a fraction is drawn (lesson 1's figures are unchanged, tested in `courtStation.render.test.jsx`).
Lessons 2 and 3 are the reference scripts (`qawasim-adad-tabii` 11 stations, `khawass-qawasim` 13: an `ask` whose answer the
board COMPUTES, then a `name` step that reads the lesson's own tablet; 1AM `qisma-iqlidiya-baqi` has 14 stations). **Tip, tested:**
a long `cue` is cut in the footer at 1024 px, so keep it at about 70 characters or fewer, and a tablet's `math` holds at most
two rows of short equalities, or its row leaves the card — `board/board.test.js` of `khawass-qawasim`, `qisma-iqlidiya-baqi`,
`qawaid-qabiliyat-qisma` and `qisma-iqlidiya-hasr` asserts both (`cue.length ≤ 70`, `math.length ≤ 2`); `qawasim-adad-tabii`'s
does not yet. Each step has `id`, `kind`, `chapter` (« نكتشف », « نستنتج », « نسمّي », « نكتب ») and `cue` — ONE oral question
shown in the footer for the teacher. Kinds, each drawn by one component of `LessonBoard.jsx`:

| Kind | What the class does |
|---|---|
| `situation` | the problem that opens the lesson, with a bridge the board can build (`bridge`) |
| `mission` | **a unit's last lesson** (2026-11-20): the station says what the class needs (`needs`), then opens the lesson's OWN world (`world`, `lesson`) on one mission (`mission`) over the whole window, as a preview — the class solves on paper, the board builds what is typed. Leaving the mission comes back to the station. `wadiya-idmajiya-aadad/board/script.js` |
| `bridges` | **experiments**: it chooses a gap and a plank (two big steppers, or a suggested bridge), PREDICTS « يثبت / ينهار » (or builds without predicting), the board builds; the bridge joins « جسور القسم » (the class's evidence, the last 8); a right prediction earns the class a star; the equality $a = b \times q + r$ is written under each bridge |
| `forge` | **concludes**: its bridges become a table (planks laid, cells left, held or not); it writes a rule with two tiles (the same tiles as the student's rule forge, `ruleForge.js`); the board runs the rule on every line, then ATTACKS it with a gap the class has not built. A rule contradicted by a line, or broken by the attack, goes back to the class — the bridge that broke it joins the evidence. The rule that survives two attacks is sealed « قاعدة القسم صمدت » |
| `name` | the rule gets its name: the tablet of the lesson (`tablet` = a key of the lesson's own `rules` — its `world/` content, handed to the board by `ClassSessionPage` through `usePackPart(lessonId, 'world')`: **one wording for the student's world and for the board**; before 2026-11-18 the board read the pilot's strings), read aloud by a student the teacher picks or by the teacher; after a `forge` the class's own rule is shown above it. « من يتذكّر؟ » hides the key words (`recall`), never inside a formula: the class says them, a tap shows them |
| `ask` | one question whose choices are planks (`a` = the gap, `options`, `answer` = the planks that fill it — **a test must compute it**); « نتحقّق بالجسور » builds every choice in one line (bar + equality). Up to SIX choices stand on ONE row (`.cs-planks[data-many]`, smaller type from five). A card is labelled « لوح » and its verdict is « يثبت / ينهار »; a step whose choices are NOT planks gives its own `words: { card, held, fell }` (`lessonScripts.js › askWords`; a word left out keeps the default) — lesson 4's `deal`, a number of bouquets: « عدد الباقات », « توزَّع كلّها / تبقى زنابق ». A `card` label holds no number (it would need Arabic number agreement: 3 باقات، 12 باقة) |
| `statements` | sentences judged « صحيح / خطأ » one after the other; each verdict comes with its reason (`proofOf`) |
| `court` | **a court of « قصر الساحات »** (2026-11-21, `LessonBoard › CourtStation`, logic `lessonScripts.js › courtCards / courtShown / courtWords`): ONE square court drawn by the world's own `Court` (`rootCourts/courtParts.jsx`, its tokens turned for the light board in `classSession.css`), and a column of at most six cards beside it — rods over a given court (`area`, `rods`: « 4,2 », `{ q, label }`, or the wall `{ root, label }`) or courts under a given rod (`rod`, `areas`). A tap on a card holds its platform over the court, dashed (the class predicts aloud); « أنزل المنصّة » lowers it and the world answers — it rides (green), leaves a band (amber), jams (violet), the exact difference written beside the court, a lens on a band too thin to see. A card lowered keeps its verdict (a thumbnail `CourtMini` and « تركب / شريط / تعلق »). `answer` = the cards that ride (**a test computes it** from `courtCards`: `jidhr-tarbii/board/board.test.js`); the proof `after` replaces the question once they were lowered — or once every card was, when none rides (`answer: []`). Its words are the world's, never a plank's; `words` overrides any (`card`, `court`, `ride`, `band`, `jam`, `lower`, `rod`). Hooks: `data-cs-court` (the step), `data-cs-court-card="<key>"` (« 18 », « 7,28 », « √53 », or the area), `data-cs-court-kind` (after lowering), `data-cs-court-lower`, `data-cs-court-on` / `data-cs-court-stage` (the court box), `data-cs-court-rod` (a given rod, before any court), `data-cs-court-shown`, `data-cs-court-after`. `jidhr-tarbii/board/script.js` |
| `trace` | what goes in the copybook: the keys of the lesson, in the wording just read. A lesson whose tablets are long splits the copybook into SEVERAL `trace` steps of two keys (lesson 2: `trace-1`, `trace-2`). A chain of four `=` or more (« 60 = 1 × 60 = 2 × 30 = … ») takes its own row and a smaller size (`data-long`); a tablet of five items or more shrinks its card (`data-dense`) — never cut, never broken |

Rules of this screen:

- **The verdict is what the class sees**: planks drop into the water and the open cells blink, or the child crosses
  (`BoardBridge.jsx`, the shared `KidFigure`). Never « wrong »: a prediction that misses is met by « لماذا؟ », a choice
  that misses by « لننظر إلى الجسور ».
- **On the board, an `ask`'s `answer` is what FILLS the gap** (2026-11-19): `LessonBoard › Ask` draws every choice as the
  bridge of the gap and that plank — green when the plank fills it, amber and falling when it does not. So the right choice
  must be a plank that fills `a`: a question whose right answer is a plank that LEAVES cells (« which plank leaves 2? »)
  would show the right answer as a fallen bridge. Ask it the other way round. `qisma-iqlidiya-baqi` re-asked its questions
  so (its five `ask` stations: `count`, `grow`, `rebuild`, `scope`, `cable`) and its `board.test.js` checks every `ask` against the world's
  `ruleForge.js › outcome(a, plank).held`: the planks drawn as holding are exactly the `answer`.
- **A name never comes before the action**: every `name` step follows a `forge`, an `ask` or a `statements` step (tested).
- **An adult's board**: the rail (one group per key of the lesson, then ONE group for the copybook, however many `trace` pages — `lessonScripts.js › groupsOf`) jumps to any station; ← / → and
  PageDown / PageUp work for a presenter remote; « التالي » is never disabled — it is only quieter while the class has
  not enough evidence or no sealed rule.
- **The board remembers the hour** (station, the class's bridges, its rule, who spoke) in the browser tab
  (`sessionStorage`, key `smarter_class_lesson_board`, per class and lesson; « من البداية » clears it). Never sent.
- **The board tools are the same on every board screen** (`board.jsx`; the test player uses them too): « القسم » (the
  class window: a tap on a desk names the student — « على السبّورة: نور » or « يقرأ: … »), « قلم » (ink over anything or on
  a blank page; three pens, undo, clear), « المؤشّر » (the red pointer), « ستار » (the board goes dark: « انظروا إليّ »)
  and « مؤقّت » (1, 2 or 5 minutes; a soft bell, never an alarm).
- **Arabic numbers are agreed** (`cellsOf`, `leftCells`: « 8 خانات », « 15 خانة ») and every equality and proof is
  computed, never typed.
- Nothing scrolls; nothing leaves its card; the oral question is never cut; a formula never breaks (checked by the walk).

**To give another lesson its board**: write its `board/script.js` with the existing kinds; a lesson whose manipulation is
not a bridge needs its own `bridges`/`forge`-like kinds (a new component per kind in `LessonBoard.jsx`, its pure logic
tested in `lessonScripts.test.js`). Do not copy the pilot's numbers.
**A lesson need not use `bridges` and `forge`** (those two are the pilot's remainder mirror: the class writes its rule with
two tiles). `qawasim-adad-tabii` (2026-11-18) is the reference for a lesson whose four rules are each forged by the
student in his own world: its script is `situation` → (`ask` → `name`) four times → `trace` ×2, each question made for its
rule (the partner of a plank, the part of a plank, the planks to try, the planks a number tells at a glance) and PROVED by the
bridges the board builds. Its tests (`board/board.test.js`) compute every answer, every equality, every memo number and check
that each `recall` word is in its tablet; its walk is `apps/web/e2e/class-lesson-qawasim.mjs` (the lesson opened alone, every
step played through the UI, the layout, no raw formula and no word of the pilot on screen, formulas read left to right — at
1366×768, 1024×768 and 1840×900). The pilot's hour (start test → rules → lesson → end test) stays in `class-lesson.mjs`.

## 5quater. The teacher's exercise bank, and an exercise on the board

Owner, 2026-11-18: « the practice space (the old version that appears to the teacher) needs to be updated completely ».
`pages/teacher/practice/TeacherBankGate.jsx` decides for `/enseignant/pratique/:lessonCode[/:level/:exerciseId]`: a lesson
in `BOARD_LESSONS` gets what follows; every other lesson keeps the shared hub and the old player.

- **« بنك تمارين الدرس »** (`TeacherExerciseBank.jsx`, pure helpers `exerciseBank.js`): a teacher does not « start a
  level ». He READS (level tabs; a line per exercise opens on the statement, the questions and — on « أظهر الحلول » — the
  key of every question, `keyOf`: never empty, tested on the 50 exercises of the pilot), he SHOWS one on the board
  (« على السبّورة »), he PRINTS a sheet (he ticks exercises of any level; the tray says how many exercises, questions and
  minutes; « مع التصحيح » adds the key on its own page). Printed, the page is white: the shell, the platform's decorative
  background (`BackgroundLayer`, `data-background-layer`) and every tinted surface are removed (`teacherBank.css`).
- **An exercise on the board** (`ExerciseBoard.jsx`, view `exercise` of the class session, `?exercice=<level>:<id>`): the
  statement stays in sight for every question; one question at a time; the teacher calls a student by his desk; a hint
  only when he asks, one at a time; the answer and its solution only when he asks. The text fits the board by itself
  (`Fit`: drawn smaller, never cut, never scrolled; refits when the space changes). Same dock as every board screen.
- Nothing is recorded by the bank or the board.

**The dock « أدوات الأستاذ »** (`board.jsx › BoardTools`) is the same on every board screen — the test, the rules, the
lesson, an exercise: three groups (who speaks « القسم » · the board « قلم », « المؤشّر », « ستار » · the hour « مؤقّت »,
« مختبري » = the lesson's lab over the board). A tool is an icon over one word. While a tool holds the screen the keys of
the board wait (`tools.busy`).

## 5quinquies. « بطاقة المعارف » on the board (`KnowledgeBoard.jsx`, `knowledgeCards.js`)

Owner, 2026-11-18: « بطاقتي must also be able to be presented in the classroom… used for a quick revision with all the
class… provide the direct link for the teacher to the previous lesson connected with the new الكفاءة ». The teacher's
« بطاقة المعارف » (a door of his card and a tab of the common header: `/enseignant/bitaqa/:lessonId`, real full screen from its dock; the set-up screen's link `?carte=1` is the same board as a view of the class session) is shown in the session's
design: one piece of knowledge per screen — the rule (large), the sentence that makes it stick; then, each only when
the teacher asks, an example, the trap, what to do in the exam. **It is a display**: no class to choose, nobody to
name (owner: « it is just used for displaying in the class… keep only the tools »), so it opens at once, with the dock
without « القسم ». The cards are
the lesson's OWN knowledge (`LESSON_KNOWLEDGE › memo`, the source the student's « بطاقتي » reads — imported, never
retyped; a lesson has cards when its pack names its `knowledge`). On every card, for the teacher: **the earlier lessons
this الكفاءة is connected with** (the learning net, core first, « يحتاج إلى » / « يوسّع »), each with its direct link when
it is published (`earlierLessons`). Whatever is opened stays on the board (`Fit`). Nothing is recorded.

## 6. The result (`SessionPlay.jsx › Result`)

- After the START test the result offers the next moment of the hour: « مراجعة القواعد » (§5bis), or « الدرس الجديد »
  when the lesson has no rule card.

- « 7 من 10 » for the class, and the sentence « هذا الاختبار لا يغيّر تقدّم أيّ تلميذ ».
- **« كفاءات تحتاج مراجعة »**: each الكفاءة with less than half right, the weakest first, named by the lesson that teaches it.
- **« منصّة التتويج »**: three steps, **the first in the middle**; the TEAMS stand on it under their names with their
  students drawn as the platform's characters (`KidFigure`: boys in a hoodie, girls in hijab). Teams with the same result
  share a step. **Nobody is ever shown as last**: a team with nothing right is simply not on the podium.
- **« أصابوا اليوم »**: the names of those who answered right.
- **« في بداية الحصّة / الآن »** (end test only): the questions of the new lesson asked at the start of the hour against the
  same الكفاءة now — what the hour changed.

## 7. What is saved, and what never is

| Table | Holds |
|---|---|
| `class_seatings` | the map of a class (one row per class) |
| `class_tests` | a teacher's copy of a lesson's test |
| `class_sessions` | a FINISHED session: class, lesson, moment, absent students, the result (recomputed by the server per الكفاءة) |
| `class_session_answers` | who answered which question, right or not, and how he was chosen |
| `teacher_lesson_files` | « ملفّ الدرس »: a teacher's one file of notes on a lesson (text; private to him) |

- **Never learning evidence** (`ClassSessionTest::test_a_class_session_is_never_learning_evidence`): no row in
  `learning_evidence` nor in `student_learning_point_progress`.
- **The revision and the lesson on the board send nothing**: no table, no request (the walk checks that the only saved
  session of an hour is the start test). What the board remembers lives in the browser tab (§5ter).
- A session names only ACTIVE students of the class; only the teacher of the class reads and writes (`ClassroomPolicy`).
- **A lost connection loses nothing**: the session runs fully in the browser and is sent once at the end; if the network
  fails it waits in an outbox (`classSessionService.js › sendSession`, `flushOutbox`) and is sent at the next visit. The
  server ignores a session it already has (`uuid`).

API (`/api/v1/teacher`, the three locks of every teacher route): `GET|PUT /classrooms/{id}/seating`,
`GET|POST /classrooms/{id}/class-sessions`, `GET|PUT|DELETE /class-tests/{lessonCode}`.

## 8. Check

- API: `cd apps/api && php8.4 artisan test --filter=ClassSessionTest` (7 tests).
- Unit: `npx vitest run src/features/classSession` in `apps/web` (the turn, the teams, the three ways to choose a student,
  the sentences, the result and the podium, the map's edits, and every default answer re-computed).
- Walk: `node apps/web/e2e/class-session.mjs [outDir]` (dev server up; also `E2E_SIZE=1024x768` and `1840x900`): 48 checks
  with an in-memory API — the teacher's card, the preview, the map, the test editor, the board, the result, the end test,
  a lost connection, and a class of THIRTY-FIVE (every desk on the map and in the class window, none cut). On the board nothing scrolls and nothing leaves the screen.
- Walk of the hour: `node apps/web/e2e/class-lesson.mjs [outDir]` (same sizes): 59 checks with a class of 35 — the four
  moments, the start test, the rules revised (order by the test, no reader proposed, a desk tapped, « أقرأها أنا », the
  example, the remote's arrow), the pen, the curtain, the timer, then the eleven stations of the lesson (a wrong rule
  contradicted by a line, a wrong rule broken by the attack, the right rule sealed, the names, « من يتذكّر؟ », the
  questions and sentences, the copybook), the rail, the memory after leaving and after a reload, and the end test. It
  fails on any scroll, clipped card, cut oral question or broken formula.
- Unit, the court station and its memo figure: `courtStation.render.test.jsx` (the cards computed by the world's law, the
  proof's moment, the drawing and its hooks, the figure's agreed words).
- Unit, the script: `lessonScripts.test.js` (the order of the rule cards, every example true, a name never before the
  action, every choice and sentence re-computed, the evidence needed to conclude, the class's voice, the recall words).

- Since the reorganisation (same day): the teacher walk has 77 checks (the card's five blocks, no « وضع القسم », no old
  section, the lesson file saved by itself, the knowledge card, the tracking tab and its order, the dock and the lab over
  the board, the bank, the printed sheet on white paper, an exercise on the board, the old player's address redirected);
  API `php8.4 artisan test --filter='ClassSessionTest|LessonTrackingTest'` (10 tests); unit `boardLessons.test.js`,
  `exerciseBank.test.js`, `tracking.test.js`. `e2e/teacher-learning.mjs` now runs on `qawasim-adad-tabii` (a lesson that
  still has the old page and « وضع القسم »).

## 8bis. Asked by the owner on 2026-11-18 and NOT built yet

- (Built the same day: « بطاقة المعارف » on the board, §5quinquies; the lesson file as the whiteboard on its own page,
  §2ter. The teacher's walk has 86 checks; `ClassSessionTest` has 8 tests, `LessonTrackingTest` 2.)
- The teacher's shell has a plain background: the coloured halos (`BackgroundLayer`) were removed from `TeacherLayout`
  (owner: « not professional »). They are still mounted in the student and public shells — his decision to take.
- The earlier-lesson links are per LESSON (the pilot teaches one programme item); a lesson with several items should
  show them per item.
- Whether « بطاقتي » leaves the STUDENT's screens (« from now بطاقتي will be used by the teacher only ») — only the
  teacher's side was changed; the student's game world and mission bar still open it.

## 9. Not built yet (agreed design, in this order)

3. **Group formats** — « التتابع » (relay by rows), « من الأسرع؟ » (first hand up, the teacher as referee), « الألواح » (slates),
   « جسر القسم » (the whole class against the clock); speed only as a tie-break; balanced teams in one tap; the individual
   podium at the end of a unit; the awards « نجم الاستدراك » and « أحسن مساعدة »; « استدركتَ خطأك » (the student who missed
   at the start is asked the same الكفاءة again at the end); « من يساعد عمر؟ ».
4. **The hour as a script** — BUILT on 2026-11-18 for the pilot (§5bis, §5ter: the four moments, the rules revised, the
   lesson on the board, the pen, the curtain, the timer). Still not built: **the student's view at home** of his own class
   answers, the teacher's record of the session.

Also not built: default tests, rule cards and board scripts for other lessons (only the pilot has them — a lesson without
a script simply has no moment ③, a lesson whose prerequisites have no rule card has no moment ②), the other three keys of
the pilot are asked and proved on the board but not FORGED by the class (only the first is), and the results of the
student's own launch, capsule and rule forge on the teacher's side (they still live in the student's browser).
