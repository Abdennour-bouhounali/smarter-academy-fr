# Classroom Mode — « وضع القسم »

> One presentation shell for the whole learning hierarchy: a teacher takes a lesson, a module, an
> exercise or a manipulation to the projector, the interactive board or the classroom TV, without
> the student UI, the page navigation, the sidebars or the margins.
> Scope: `apps/web/src/lessons/common/classroom/`. Authorization: `packages/core/auth.js`.

## 1. Concept

Classroom Mode is **platform infrastructure**, not a fullscreen button on one component. A content
opts in by being wrapped; it never implements fullscreen, scroll locking, Escape, viewport fitting
or a toolbar itself. There is exactly **one** implementation of each of those, and exactly **one**
active session at a time.

```
Lesson      → 🎓 وضع القسم     مدخل الدرس → المحور 0 → المحور 1 (وحداته) → …
Module      → 🎓 وضع القسم      (rangée de repères du محور ; séance de LEÇON) المهمة → المختبر → الخطوات → الخلاصة
Test        → 🎓 وضع القسم      (idem) السؤال 1 → السؤال 2 → … → كشف النتائج → revue
Exercise    → ⛶ عرض التمرين     l'exercice seul, interaction intacte
Manipulation→ ⛶ عرض المناولة    la manipulation seule, mise en page de classe
```

The wrapped content stays at the **same place in the React tree and in the DOM** when a session
starts: the shell's root becomes the fullscreen element (or a fixed overlay), it does not move or
remount its children. A chosen divisor, a typed answer, a revealed correction, a reached step — all
survive entering and leaving.

## 2. Architecture

```
classroom/
├── ClassroomPresentation.jsx  the shell: session state, fullscreen, scroll lock, Escape, focus,
│                              route scope, orientation, toolbar, nav, context — AND the
│                              pass-through branch when an ancestor is already presenting
├── LessonClassroomShell.jsx   the lesson-level session: a pathless layout route above the
│                              lesson's index + modules, so the session survives module navigation
├── ClassroomToolbar.jsx       top toolbar (scope badge · title · slot · scale − / +)
│                              + ClassroomNav, the bottom bar: two tiers of steps, then خروج
├── ClassroomEntryButton.jsx   the entry point, per scope, presenters only
├── ClassroomContext.js        useClassroomMode() · useClassroomPortalTarget()
├── useClassroomStage.js       a presented page declares title / gestures / slot
├── ClassroomFrame.jsx         reading frame (+ ClassroomHidden) for page-authored content
├── classroomUnits.js          PURE unit maths: module units, navigation, lesson neighbours
├── ClassroomPaged.jsx         splits ONE unit (a step, the khulasa) into pages of whole blocks (§5 « Pages »)
├── classroomPages.js          PURE page maths: budget, greedy plan, clamp
├── useFullscreen.js           the browser Fullscreen API (+ WebKit spelling); state = real state
├── useScrollLock.js           html/body overflow: hidden, previous inline values restored
├── usePresentationFit.js      the viewport-fitting engine (ResizeObserver, rAF, settle, refit)
├── classroomFit.js            PURE fit maths: scale steps, available area, next fit factor
├── ClassroomPointer.jsx       the classroom pointer « المؤشّر » + spotlight overlay (§6quater)
├── classroomPointer.js        PURE pointer logic: sizes, diameter per viewport, P / Shift+P shortcut
├── classroom.css              `sa-classroom-*` scoped styles
└── index.js

kit/                           (the lesson kit, which CONSUMES the shell)
├── TestPresentation.jsx       the TEST scope (§5): one question at a time, for both
│                              PrerequisiteDiagnostic and BossFinal — one implementation
└── testPresentation.js        PURE test maths: question states, reveal, navigation (+ .test.js)
```

Separation: everything above is **presentation**. Lesson, module, exercise and manipulation content
lives in `lessons/**`, `features/practice/**` and `pages/**`, and only *reads* the context.

## 3. Presenter permission

`canPresentClassroom(user)` in `packages/core/auth.js`, built on the existing `hasRequiredRole`;
the list of roles is `CLASSROOM_PRESENTER_ROLES`. **Nothing anywhere names a role**: entry buttons,
shells and tests all ask that one function. Changing who may present is editing that one array.

> **Not to be confused with the Math Lab's fullscreen.** Since 2026-09-24 an
> instrument opened over a lesson has its own fullscreen button, available to
> **students and teachers alike, with no permission at all** (`MATH_LAB.md`
> §6a). It reuses `useFullscreen` — a *hook* carries no permission — but
> nothing in `features/mathlab/overlay/` imports `canPresentClassroom`.
> Giving an instrument room is not presenting to a class.
>
> The Math Lab pill is **rendered by this shell** during a session: it goes
> into `ClassroomToolbar`'s `slot`, beside whatever the presented page put
> there, because the module's marker row is not rendered while presenting.
> The personal floating pills (« كرّاسي », « بطاقتي ») still disappear.

`presenter={true|false}` on `ClassroomPresentation` overrides the account (fixtures, tests);
`LessonClassroomShell` does not expose it. The permission gates Classroom Mode only — it grants no
other teacher or admin capability, and it never changes what is written to a student's progress.

> **Who presents today.** `CLASSROOM_PRESENTER_ROLES` contains `['admin', 'teacher']`.
> `teacher` is the product role this mode was built for (the teacher account exists since
> 2026-09-22 — see [`TEACHER_CLASSROOM_ARCHITECTURE.md`](./TEACHER_CLASSROOM_ARCHITECTURE.md)).
> **A student never sees « وضع القسم »** (owner decision, 2026-10-01): `student` had been added
> temporarily to exercise the mode from a student account, which put the entry button on every
> lesson page of every student. The tests assert the mechanism (every listed role passes, an unlisted
> role fails, the array is frozen) **and** this one decision: `canPresentClassroom({ role: 'student' })`
> is false. Browser QA of Classroom Mode therefore needs a teacher account (`qa-prof@smarter.dz`).
>
> **Two words that both contain « قسم ».** « وضع القسم » is *this* mode, the projector shell, and
> keeps its name. « قسمي » / « أقسامي » is the teacher's *class* — a roster of students with a join
> code, per-class lesson visibility and progress views. That object lives in `App\Domain\Classroom`
> on the server and under `features/teacher/` (identifier `classGroup`) on the client; nothing in
> `lessons/common/classroom/` knows it exists. Presenting a lesson never reads or writes a class.

`CourseLayout` picks the shell from the reader (`features/learning/learningViewer.js`): a student
reads in `StudentLayout` (the student workspace; without a grade they are redirected to
`/espace/bienvenue`), a **teacher reads in `TeacherLayout`** — the same lesson engine, every module
open, nothing written to any progression (see `TEACHER_CLASSROOM_ARCHITECTURE.md` §8b) — and admins
and visitors read in the **visitor shell** (`MainLayout`). `usesStudentShell(user)` stays
`user?.role === 'student'`; the lesson chrome offset follows `usesWorkspaceShell(user)` (student or
teacher: same mobile header, same sidebar — `useLessonChrome.js`). `/espace` is guarded for
students only, so a non-student is sent to `/login`.

## 4. One session, never nested

`ClassroomPresentation` checks its parent context first. If an ancestor is already presenting, it
renders a **pass-through** `<div data-classroom-nested="true">`: no second `requestFullscreen`, no
second toolbar, no entry button. Its children read the running session's context, so a manipulation
inside a presented module still gets its classroom layout, and an exercise inside a presented lesson
is still framed — through the one shell that owns the screen.

Consequence: wrapping a component is always safe. `TextbookExercise` wraps itself, and stays correct
whether it is presented alone, inside a presented module, or inside a presented lesson.

Two details a reader will otherwise get wrong:

* **`isNested` in the context is always `false`.** The nested branch renders no provider at all, so
  children of a pass-through shell read the *running* session's context. Never branch on `isNested`.
* **Sibling shells are not mutually exclusive.** "One session" is enforced for *ancestors*, not for
  two shells side by side on one page. In practice fullscreen and the fallback hiding rule make the
  second unreachable, but nothing rejects it.

## 5. Scope-by-scope

### Lesson — 🎓 وضع القسم

Entry: the lesson index hero (`LessonIndex`) — and, for a teacher, the « وضع القسم » button of a
lesson on its **unit page** and in its « مذكرة الدرس » (§6ter). Session owner: `LessonClassroomShell`, a **pathless
layout route** that `buildLessonRoutes` puts above the index and every module. Because that shell is
above the routes, it is not unmounted when the URL moves from one module to the next — which is why
native fullscreen survives `التالي`.

Progression is derived from `LESSON_CONFIG.modules` (`lessonNeighbours`): `مدخل الدرس` → module 0 →
module 1 → … Inside a module, the module's own units come first; only at a module's last unit does
`التالي` move to the next module (and `السابق` at the first unit moves back, entering the previous
module at its **last** unit via `takeArrival()`).

The index renders a dedicated overview when presented: title, description, skills, and the module
roadmap — not the student page with its progress widget, mastery dots and breadcrumb.

`routeScope` keeps the session while the URL stays inside the lesson, and ends it on the way out.

### From a محور — 🎓 وضع القسم (was ⛶ عرض, module scope)

Entry: **the محور's marker row**, beside « 🧪 المختبر » (and the XP counter),
`tone="quiet"`. Since 2026-09-24 it opens a **lesson-scope** session, exactly
like the one from the lesson index — so `التالي` walks محور → محور from inside
any محور. It is therefore labelled « وضع القسم » too: one mode, one name,
wherever it is opened. `classroom.enter.floating` (« عرض ») is gone.

Why it changed: a module-scope session sets `session.scope = 'module'`, and
`lessonNav` is `null` outside lesson scope — so `التالي` died at the end of
the محور and the teacher had to *leave the session* to reach the next one. The
shell answering inside a محور is already `LessonClassroomShell` (mounted above
every module route), so it was enough to tell it the right scope.

**The floating column is now two pills**, both at the corner:

| `bottom` | button |
| --- | --- |
| `1.5rem` | « 🧠 بطاقتي » (`KnowledgeMap`) — same gap as `left`, in the angle |
| `5.5rem` | « 📓 كرّاسي » (`LessonNotebookAnchor`; the exercise player's `NotebookButton` is the same pill at the same height) |

**Below 1024 px (fixed 2026-09-29):** the student and teacher spaces show an `h-16` bottom nav
that used to cover « بطاقتي ». Both pills now add `--sa-bottom-nav` (4rem below `lg` when the
workspace shell is on the page, 0 otherwise — `index.css`): « بطاقتي » at `1.5rem + 4rem`,
« كرّاسي » at `5.5rem + 4rem`; the exercise player keeps its own below-`lg` height (`8.5rem`, over
its sticky « السؤال التالي » bar). Desktop is unchanged. See `KNOWLEDGE_MAP.md` « The trigger button »;
asserted by `e2e/notebook-lesson.mjs` (« les déclencheurs cahier/carte ne se recouvrent pas ») and
`e2e/knowledge-map.mjs` (the map opens at 820 and 390 px).

Both presentation entry and the Math Lab left this column for the marker row:
it is `sticky` (always reachable without scrolling) and **in the flow**, so it
never covers the lesson — which a growing stack of floating pills did.

« بطاقتي » is set **in the angle**: its gap to the bottom (`1.5rem`) equals its
gap to the left, so the pill reads as anchored to the corner rather than
floating above it. The two heights are a single system — moving one without
the other makes the pills overlap. *(Until 2026-09-24 a third pill, « ⛶ عرض »,
sat in the angle below them; it moved to the marker row as « وضع القسم ».)*

The corner is free because the site's old « Ctrl+K » pill was **removed**. It was placed with `end-6`, which
under RTL resolves to the *physical left*, so it occupied this exact spot and
swallowed the ground-floor clicks. The command palette itself was deleted on 2026-11-17 (owner: no command
palette, no global search).

`left` is a **physical** value, never `start`: under RTL the student sidebar
owns the right edge and would swallow the clicks (the lesson recorded in
`KnowledgeMap.jsx`).

The exercise and manipulation scopes keep their explicit labels (« عرض
التمرين », « عرض المناولة »), where the word distinguishes *which* object is
being presented.

**Leaving happens at the top, in the toolbar.** « ⛶ خروج » is rendered by
`ClassroomToolbar`, at its end edge, with the session's other controls (the
scale). It used to sit under « التالي » at the foot of the nav bar; it moved up
so that the bar below carries **only the steps of the content** — one never
closes a session while aiming for « التالي », and on an interactive board the
bottom of the screen is the hardest place to reach. Escape still works.

Consequence: the bottom bar may now be empty (a manipulation presented alone,
no step, no neighbour). It no longer carries the exit, so nothing forces it to
render.

Because the exit now lives there, `ClassroomPresentation` renders the nav bar
for **every** active session, even one with no neighbour to offer — otherwise
the way out would disappear with it. The nav still renders no dead step
buttons.

The page's own floating chrome (« كرّاسي », « بطاقتي ») is hidden for the
duration by `body.sa-classroom-session`, a class the scroll lock adds and
removes: it has no place on a projector. Nothing unmounts, so no state is
lost. `classroom.mjs` asserts (updated 2026-09-29) that « وضع القسم » lives in
the محور's marker row next to « المختبر », outside the floating column; that
the column stacks « بطاقتي » under « كرّاسي » on the same edge, « بطاقتي » with
equal corner gaps; and that the page chrome disappears.

The toolbar badge names **what is presented** (« المحور », « التمرين »,
« المناولة » — `classroom.scopeLabel.*`), not the gesture that opened it:
reusing the trigger's label would have produced a badge reading « عرض ».
Presented, `ModuleLayout`
drops its breadcrumb, header, XP, progress bar, bottom navigation and footer, and keeps the content.

`ContentModule` turns the module into **pedagogical units** in the order it already had
(`moduleUnits`): المدخل (overview, see below) → المهمة (brief) → المختبر (intro) → each step → الخلاصة (footer, only when the module
is complete). One unit is shown at a time; the others are rendered in place with `hidden`, so
nothing remounts and no state is lost. Step locking is untouched: a step that the student has not
unlocked still shows «أتمِم الخطوة السابقة».

The two **test** engines (`BossFinal`, `PrerequisiteDiagnostic`) have their own unit sequence —
one *question* at a time — through `TestPresentation`. See **Test** below.

#### Module entry page — « المدخل » (2026-10-13)

Every `ContentModule` opens, when presented, on `kit/ModuleOverview.jsx`: the محور number, its **title**,
its subtitle and « ماذا سنتعلّم في هذا المحور؟ » as numbered points (+ the estimated time). Points come
from the optional `objectives` prop (sentences or questions) and otherwise from the **step titles**, so
all 261 modules are covered with no authoring. It exists only while presenting (`presenting &&`), so the
student page is unchanged. The test engines (`PrerequisiteDiagnostic`, `BossFinal`) pass an `overview`
prop to `TestPresentation`: title + the skills it checks + « N أسئلة » shown before question 1
(`[data-test-overview]`; السابق on question 1 returns to it).
The lesson index presented (`LessonIndex`) is split in two screens: identity (title, description,
what you will learn) then « مسار الدرس » (`[data-lesson-overview-page]`, chip « 1 / 2 »).

#### Pages — a step too tall is split, not shrunk (2026-10-13)

The fit engine only shrinks (floor 0.55). A step whose blocks would need shrinking by more than 10 %
(`MIN_PAGE_FIT = 0.9`) is instead cut into **pages**: `ClassroomPaged` wraps the step body, takes its
direct children (descending through one wrapper `<div>`) as blocks, measures them at scale 1
(height ÷ effective scale, so the plan does not depend on the current fit) and packs whole blocks into pages
(`planPages`, greedy, order preserved). Hidden blocks carry `data-classroom-page-hidden`
(`display:none`) — they stay mounted, **no state is lost**. The step header stays on every page.
`التالي` / `السابق` turn pages first, then change unit (السابق into a paged unit lands on its last page);
the toolbar adds a « الجزء 1 / 2 » chip. Replanned on area / chosen scale / unit change, never on fit
changes; a block added later (feedback) joins the current page. Applies to steps and the khulasa of
every `ContentModule`; a single block taller than a screen (a lab) still shrinks. `userScale` is now in
the classroom context. Tests: `classroomPages.test.js`, `classroomUnits.test.js`.

**Paging outside Classroom Mode (2026-11-04, the student mission player).** `ClassroomPaged` reads its geometry from
`PagingContext` (`classroom/PagingContext.js`) when one is provided, otherwise from the classroom as before:
`{ isClassroomMode: true, scale: 1, userScale: 1, area, deepBlocks: true }`. The mission player
(`lessons/common/mission/MissionPlayer.jsx`, guide §4septies) uses it to page units WITHOUT turning Classroom Mode on.
Classroom Mode would unlock steps and modules, stop writing completion, and switch tests to the reveal flow.
`deepBlocks` changes only that player's paging:
- blocks are found through every single-child wrapper;
- a block taller than a page is OPENED into its children, up to 5 levels deep (the five exercises of a test, the
  cards of a memo);
- its first child stays glued to the next when they fit together, so a heading is never alone on a page.
- an element marked `data-paging-keep` (a screen designed to hold as one, e.g. the compact review of « أستعدّ ») is never walked
  into nor opened: it stays ONE block.
- a DECORATIVE child (`aria-hidden="true"`, or positioned absolute/fixed: a card's gradient background) is never an item:
  it is skipped when a block is opened and stays visible with its parent (`isDecor`). Before this rule (2026-11-04) a
  module's opening card could open on its empty background, an empty first screen.

With `onePerPage` (one item per screen):
- a block starting with a heading (`<header>`, h1–h4) is GLUED to the next item, so a memo's header never stands alone;
- a list is also found through a single large child (up to 3 levels: the body of a « للتذكّر » card);
- a `<li>` is ONE item and is never opened for this rule (only when it is taller than the page);
- an opened list's items each keep their own screen.
- a block that APPEARS after an answer (the next sub-step of a « مسألة ») and is substantial (≥ `SMALL_BLOCK`) gets its OWN
  screen, inserted just after the current one (hidden until « واصل »). Small added blocks join the current screen. Without this
  the current screen grows and `FitToArea` shrinks everything (owner, 2026-11-04).
- new blocks are watched not only at the host but also in the CONTAINER of an opened block and in any ANCESTOR of the host inside
  the unit (the plan may have walked down through single-child wrappers; content revealed after an answer arrives one level up).
- a block that was SMALL when planned or added (an empty wrapper, one line) is watched: if it grows to ≥ `SMALL_BLOCK` while it
  shares the current screen, it moves to its own screen right after (2026-11-07: a « معارف » step answered → its two knowledge
  cards no longer crush the question to zoom 0.6).

Blocks are GROUPS of elements, shown or hidden together. Without `deepBlocks` each group is one element, and the
classroom plan is unchanged.

**Presenting is not learning.** While a session is active, `ModuleLayout` writes neither
`markModuleVisited` nor `markModuleCompleted`, and the sequential unlock does not apply — a teacher
projects module 3 without having completed 0–2 on their own account.

### Test — ⛶ عرض (module 0 « أستعدّ » et test final « إختبار أولي »)

A **test** is presented like a module, from the same « وضع القسم » entry (a lesson-scope session), but its units are
its **questions**: one question fills the screen, and `السابق` / `التالي` move between them. Both
engines go through **one** implementation — `kit/TestPresentation.jsx` — so there is no second
fullscreen system and no separate screen for the diagnostic and the final test.

```
Module 0 « أستعدّ »   PrerequisiteDiagnostic ─┐
                                              ├─→ TestPresentation ─→ ClassroomPresentation
Final test « إختبار أولي »  BossFinal ──────────────┘
```

**The presentation never corrects, scores or persists anything.** It decides what is *shown*. Each
engine keeps its own evaluator, its scoring, its evidence and its single attempt record; the
presentation is handed that evaluator and calls it. `kit/testPresentation.js` holds the pure logic
(question states, reveal, navigation), with `testPresentation.test.js` covering it.

**Answer ≠ result.** Four states, never conflated — the rule the whole feature rests on:

| State | Meaning | Where it shows |
|---|---|---|
| `unanswered` | nothing chosen | grey dot in the navigator |
| `answered` | an answer is in, and **nothing is said about it** | indigo dot |
| `correct` / `incorrect` | revealed, and judged | green / red dot, badge on the question |

Answering never reveals. A question is revealed only by « تحقّق من الإجابة » on **that** question,
or by « كشف النتائج » on all of them — and `revealAll(questions)` is exactly `revealOne` applied to
each, so there is provably one correction engine (asserted in `testPresentation.test.js`).

**State survives navigation.** As in `ContentModule`, every question is always rendered at the same
place in the tree; the others carry `hidden`. Going to question 2 and back leaves question 1's
answer, its revealed correction and any custom manipulation untouched.

**Validating one question does not end the test.** The teacher stays on it, moves on, or goes back;
nothing auto-advances. After « كشف النتائج », the engine's summary (diagnostic result, mastery
profile + synthesis) appears at the last question, and `السابق` still walks back through the
questions one by one — the summary never replaces the question-by-question review.

**Where it is available, and why.** Only inside a presentation. On the normal student page both
engines render exactly what they rendered before: the final test stays silent until its single
« أرسِل إجاباتي », and no student can reveal a graded answer one question at a time. Per-question
validation is a *teacher-at-the-board* gesture, and entry to Classroom Mode is already restricted
to `canPresentClassroom`. **Nothing in the test presentation names a role**: when the platform wants
an explicit teacher mode, it changes `useTestPresentation()` in `kit/TestPresentation.jsx`, and
neither engine is touched.

**Persistence is unchanged.** A per-question reveal writes nothing — no evidence, no XP, no
attempt. « كشف النتائج » calls the engine's existing submit, once: `BossFinal` submits its evidence,
awards XP and saves the attempt exactly as the page's button does; `PrerequisiteDiagnostic` saves
its local result. This matters because every `submitEvidence` mints a fresh `attemptId`, so
per-reveal submission would duplicate mastery evidence.

**Toolbar.** The stage is declared at **priority 2** (the test knows its questions), overriding
`ModuleLayout`'s generic priority-1 declaration, exactly as `ContentModule` does. The slot carries
« السؤال 3 من 10 », the revealed tally once results are out, and — for **12 questions or fewer**, on
`sm` and up — a compact navigator of numbered dots coloured by state. Primary navigation remains
`السابق` / `التالي`; the dots are an optional extra, hidden when they would not fit.

**Navigation matches a module's.** `resolveTestNavigation` delegates to `resolveModuleNavigation`,
so a test's questions behave exactly like a module's units: in a *lesson* session `السابق` at the
first question and `التالي` at the last cross into the neighbouring module, and a projected lesson
stays traversable end to end with one gesture. In module scope there is simply no button at the
ends — never a dead one.

What protects an unfinished test is therefore **not** a missing button but the *placement* of
« كشف النتائج »: it is a wide button **inside the content**, under the last question, where the eye
already is — not on the bottom bar competing with `التالي`.

**Long questions** (`.sa-test-presentation__body`): the statement area scrolls internally past
~62 % of the offered height rather than shrinking the type below readability. The
validation button and both nav bars stay outside that scroll area, always reachable.

### Exercise — ⛶ عرض التمرين

Two surfaces, one shell:

* **Textbook exercises** (`TextbookExercise`): the button sits in the exercise header; the exercise
  wraps itself in a shell with `entry="none"`. Choices, corrections, KaTeX and the `requires` gate
  are the component's own — the shell only frames them.
* **The practice engine** (`PracticeSession`): the button sits in the session's navigation row; the
  shell wraps the page so both share one session. Presented, the session chrome (back link,
  progress, heading, notebook, report) is removed by `ClassroomHidden` and the exercise is framed.
  Answer, hints, attempt UUID, evaluation and retry state all survive, because nothing unmounts.
  Since the 2026-09-24 redesign the page is a grid from `xl`; presented, it collapses to one block
  (`[[data-sa-classroom]_&]:block`), the side column (Learning Point module + «سياق السؤال») is `ClassroomHidden`,
  and the question history («السؤال السابق») **stays** — the class sees the previous step. Arrival
  scrolling/focus is skipped while presenting (`QuestionArrival` reads `useClassroomMode()`), and
  buttons carry an explicit text size because the frame's inherited size is `1rem × scale`.

### Manipulation — ⛶ عرض المناولة

`DivisorExplorerBooks` (the shelf the student stretches, redesigned 2026-09-30) wraps itself in
`ClassroomPresentation scope="manipulation" entry="none"` and poses `<ClassroomEntryButton />` in
its shell header (`ManipulationShell headerAction`). A manipulation is **not zoomed** by the
presentation (§8), so the lab fits the offered area itself. Presented, it reads
`useClassroomMode()` and:

- puts the stretchable shelf (45 % of the width: shelf, −/+, counters) and the bookcase (with
  the `DivisionRoles` and the floor note) **side by side**. On a projector width is plentiful
  and height is scarce;
- drops the lab's mission and lead, and the workspace lead (`ClassroomHidden`): the teacher
  says them aloud;
- **measures a height budget** for the bookcase: the bottom of `.sa-classroom-content`, minus
  the bookcase's top, minus everything below it (roles and note, stage padding, the equation,
  the discovery). No term depends on the bookcase's own height, so the measure cannot feed
  itself. It then takes the **largest book unit** (≤ 11 px) whose `bookcaseLayout` fits that
  budget. Every shelf stays drawn; nothing scrolls internally.

Measured on 2026-09-30 in the presented lesson at 1366×768, 26 books per shelf: the content
box is 644/644 (no overflow), and the 16 shelves are drawn at a small but countable size.
**Known limit:** once the discovery panel opens, it takes its height from the same budget, and
at the minimum book unit the unit can still overflow. The conjecture is discussed aloud in
class, but this is **not yet fitted**. The old grid solver `booksClassroomLayout.js`, written
for the 17-button lab, was removed with it.

## 6. The presentation contract

A presented page tells the shell what to show, without the shell knowing what a module or an
exercise is:

```jsx
useClassroomStage({
  title,          // the toolbar title
  onPrevious,     // undefined → no button (never a dead one)
  onNext,
  slot,           // a chip or controls at the right of the toolbar
  priority,       // 2 (ContentModule, which knows its units) beats 1 (ModuleLayout)
}, isPresenting);
```

Gestures and slot must be stable (`useCallback` / `useMemo`). The highest priority declaration wins,
so a page with units overrides the generic module declaration.

When no page declares a stage, the shell falls back to its own `onPrevious` / `onNext` /
`toolbarSlot` props. No consumer uses them today.

## 6bis. The two bars

**Top — `ClassroomToolbar`** (`data-classroom-toolbar`, min-height 48 px, reserves its own height):
scope badge (`وضع القسم` for a lesson, else `classroom.scopeLabel.*` — « المحور », « التمرين »,
« المناولة ») · title · the page's `slot` · the scale group (`−`, `حجم العرض NN%` in `dir="ltr"`,
`+`).

The top bar also carries the **classroom pointer** group (« 🔴 المؤشّر », §6quater, from `sm` up) and
`خروج`, at its end edge (see *Module* above — the bottom bar carries only the steps of the content).

There is **no fullscreen toggle, no fit button, no unit jump-list, no timer and no annotation
tool**. Keyboard: **Escape** (leave, in fallback), **P** (pointer on/off) and **Shift+P**
(spotlight) — there is no arrow-key navigation anywhere in the shell.

**Bottom — `ClassroomNav`** (`data-classroom-nav`), rendered for **every** active session — it
carries the way out, so it may not disappear with the last neighbour. It has **two tiers of steps**,
which is what makes a lesson session navigable, and then the exit on its own line:

| Control | Attribute | What it does |
|---|---|---|
| `◀◀ المحور السابق` | `data-classroom-nav-module="previous"` | jumps to the previous **module**, named after it; dashed style |
| `◀ السابق` | `data-classroom-nav-unit="previous"` | previous **unit** inside the module |
| `التالي ▶` | `data-classroom-nav-unit="next"` | next unit; primary style |
| `المحور التالي ▶▶` | `data-classroom-nav-module="next"` | jumps to the next module |
| `⛶ خروج` | `data-classroom-exit` | ends the session; own line under « التالي », same end edge, primary style |

Step buttons come only from the gestures that exist, so the bar still renders **no dead step** —
a manipulation presented alone shows the exit and nothing else. Module-jump buttons come only from
`lessonNavigation`, so they exist in a **lesson** session and never in a module-scope one. The jump labels always show (the phone-only rule that collapsed them to chevrons
was removed on 2026-10-27: lessons no longer open on phones, `RequireLargeScreen`); the exit label never hides, because a way out is
not something to guess. Every button is at least 44 × 44 px, and its icon comes from
`DirectionalIcons` so it mirrors in RTL.

**A lone exit gets a compact bar.** When the bar carries *only* the exit — a manipulation or an
exercise presented on its own, with no step and no jump — it drops its padding, its top margin and
its own band (a `:has()` rule, so the bar recognises itself with no state to thread through). It
still costs the scene something: a presented manipulation now has a bottom bar it did not have
before, so the fit engine settles a little lower. The shelf lab does not enlarge by default: it
fits its measured height budget (§5 « Manipulation »), and block C1 checks the side-by-side layout
and that nothing overflows at 26 and at 42 shelves.

**The bar's height is taken from the scene.** `usePresentationFit` measures both bars
(`reservedRefs`) and gives the content what is left; the scale bottoms out at `MIN_FIT_FACTOR`
(0.55), below which a manipulation's objects stop being readable from the back of a room. Adding
the exit line therefore pushed the presented library of « نشاط 1 » into overflow at 768 px tall.
The pixels were taken back from **chrome, not from the drawing**: tighter bar padding, and a
presentation-only rule that trims `[data-manipulation-workspace]` padding and gaps (its border,
background and مبتدئ/متقدم tabs stay). Do not re-inflate those paddings without re-running
`classroom.mjs`, which measures that overflow.

## 6ter. Starting a session from outside the lesson (teacher)

`TeacherLessonActions` (unit page, teacher reader only) and the « مذكرة الدرس » page link to the
lesson — or to one of its محاور — with the navigation state `CLASSROOM_START_STATE`
(`features/teacher/lessonMemo/memoRoutes.js`). `LessonClassroomShell` renders `StartOnArrival`,
which, once `canPresent` is known, clears the state (`replace`) and calls the same
`enterClassroomMode({ scope: 'lesson' })` as the index button. Consequences:

* a **navigation state, never a URL parameter**: a shared link, a refresh or a back navigation never
  opens a presentation by itself;
* fullscreen is requested a few milliseconds after the click, inside the browser's transient user
  activation — if the browser refuses, the session opens in the fallback, as everywhere else;
* the permission is unchanged (`canPresentClassroom`); a module link opens a **lesson** session
  positioned on that محور.

## 6quater. The classroom pointer — « المؤشّر »

In a large room the mouse arrow is invisible from the back row. The pointer is a large red disc with
a translucent halo, a white-rimmed core (shape as well as colour) and a soft glow, that **follows**
the real mouse. It does not replace it: the browser cursor stays underneath and acts.

| | |
|---|---|
| Toggle | « 🔴 المؤشّر » in the top bar (`aria-pressed`, label « المؤشّر مفعّل » when on) · key **P** |
| Size | three presets — صغير / متوسط / **كبير (default)** — remembered per device (`smarter_classroom_pointer_size`) |
| Spotlight | « تسليط الضوء » · **Shift+P**: the screen darkens except a disc around the pointer (radius 2.2 × the pointer); turning it on turns the pointer on |
| Colour | red only; `POINTER_COLORS` is a table so another colour is one entry, not a component change |
| Lifetime | off when a session starts, reset when it ends; announced in an `aria-live` region |
| Phones | the group is hidden below `sm` (640 px): no projector use, and the bar keeps its room for the content |

Rules (all asserted — `classroomPointer.test.js`, `e2e/teacher-memo.mjs`):

* **Never intercepts anything.** The layer is `pointer-events: none`; a click under the disc reaches
  « التالي ».
* **Inside the session root**, `position: fixed`, `z-index: 2147483000` — so it is visible in native
  fullscreen (only the fullscreen element's subtree is drawn) and above the Math Lab overlay (80).
* **No React render per movement.** One `pointermove` listener stores the position, one
  `requestAnimationFrame` writes `transform` (and the spotlight's CSS variables).
* **Diameter follows the viewport** — `pointerDiameter(size, w, h)` = small side × {0.05, 0.075,
  0.1}, clamped to [40–120], [56–170], [72–240] px: L is 77 px on a 1366×768 laptop, 108 px at 1080p,
  144 px at 1440p, 216 px in 4K; recomputed on `resize`.
* Hidden when the mouse leaves the window; follows a finger or pen on touch.
* **The shortcut reads `event.code === 'KeyP'`** (the key's position — the same key on AZERTY and on
  an Arabic layout, where it types « ح »), never with Ctrl/Cmd/Alt, never on repeat, and never when
  the target is editable (`input`, `textarea`, `contenteditable`, `math-field`) or inside a Math Lab
  instrument (`[data-ml-overlay]`, `.excalidraw` — Excalidraw's own « P » is its pen).
* Hidden when printing.

## 7. Fullscreen, fallback, cleanup

1. Click → session active **and** `requestFullscreen({ navigationUI: 'hide' })` in the same user
   gesture (deferring it a render would make Chrome refuse).
2. `fullscreenchange` is the only truth: Escape, F11 or a system gesture end the session too.
3. API missing (iOS Safari on non-video) or refused → the root stays `position: fixed; inset: 0;
   z-index: 70`. In this mode `html[data-sa-classroom="fallback"]` hides everything outside the
   presentation, because a fixed root cannot escape its ancestors' stacking context and page chrome
   (footer, navbar) would otherwise sit on top and swallow clicks. Escape is
   handled by the shell here, and yields when a drag object is held.
4. Exit / unmount / leaving `routeScope` → fullscreen released, scroll lock restored, focus returned
   to the entry button. `screen.orientation.lock('landscape')` is attempted **only in native
   fullscreen** and under 1024 px, caught, and unlocked only if we locked it.
5. Body portals are invisible under a native fullscreen element: `useClassroomPortalTarget()`
   returns the presentation root (used by `DragGhost`).

## 8. Scale and fitting

`--sa-classroom-scale = userScale × fitFactor`, plus `--sa-classroom-w/-h`; the same values in
`useClassroomMode().scale / .area`.

* `userScale` ∈ {0.9, 1, 1.1, 1.25} — the − / + buttons, remembered per device.
* `fitFactor` ≤ 1 (floor 0.55): the engine measures the stage against the content box, reduces on
  overflow, grows back on slack, and decides only on a **settled** layout (120 ms) so a content with
  its own area-dependent layout can adapt first.
* `refit()` resets the factor when the content changes nature (a new unit, a new page).
* Two ways to consume it: `ClassroomFrame` (page-authored content — `zoom` re-lays out the content
  at the new size, it is not a transform and not a browser zoom), or reading the variables directly
  (a manipulation that computes its own layout). A frame inside a frame does not enlarge twice.

## 9. RTL and mathematics

The shell inherits the page direction (RTL). Numbers and equations declare LTR themselves, as
everywhere: `420 = 28 × 15 + 0` stays `direction: ltr` in the books lab, KaTeX keeps its
`.sa-math-inline` isolation inside a presented exercise (asserted by e2e), and the scale percentage
is `dir="ltr"`. Directional icons go through `DirectionalIcons`.

## 10. DOM contract (e2e)

```
[data-classroom-scope=lesson|module|exercise|manipulation]
[data-classroom-active=true|false] [data-classroom-native=true|false] [data-classroom-scale]
[data-classroom-nested=true]                 a pass-through shell
[data-classroom-toolbar] [data-classroom-nav] [data-classroom-position]
[data-classroom-enter=<scope>]               the entry button
[data-classroom-units] [data-classroom-current] [data-classroom-unit]   module units
[data-classroom-frame=<zoom>]                a reading frame
html[data-sa-classroom=native|fallback]
[data-classroom-pointer-controls] [data-classroom-pointer-toggle][aria-pressed]
[data-classroom-pointer-size=s|m|l] [data-classroom-spotlight-toggle]
[data-classroom-pointer-layer] [data-classroom-pointer=<size>] [data-classroom-spotlight]
```

A presented **test** (§5, *Test*) adds its own, emitted by `kit/TestPresentation.jsx`:

```
[data-test-presentation] [data-test-questions=N] [data-test-current=i]
[data-test-question=i] [data-test-state=unanswered|answered|correct|incorrect]
[data-test-body]        the statement + answer area (the scrolling region)
[data-test-reveal-all]  « كشف النتائج »          [data-test-summary]  the engine's summary
[data-test-navigator] [data-test-nav=<i>]        the compact question navigator
[data-test-position] [data-test-tally]           toolbar chips
```

Also emitted, and used by the suites: `[data-classroom-nav-unit=previous|next]`,
`[data-classroom-nav-module=previous|next]`, `[data-classroom-title]`,
`[data-classroom-scope-label]`, `[data-classroom-unit-index]`, `[data-module-presented]`,
`[data-lesson-presented]`, `[data-lesson-roadmap]`, and, on the books lab, `[data-bookshelf][data-presentation]`. The CSS variables `--sa-classroom-scale / -w / -h` are published on the
root (§8).

### Running the suites

```bash
# dev server first — NOT vite preview
npm run dev            # http://localhost:5173

KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/classroom.mjs
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/manipulations.mjs
KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/test-presentation.mjs
# the pointer, the card → session entry, the مذكرة (real QA accounts, API on 8000)
node apps/web/e2e/teacher-memo.mjs
```

> **State on 2026-09-29 (lesson audit):** `classroom.mjs` **73/73**, `test-presentation.mjs`
> **47/47**, against the dev server. The 7 + 2 checks that failed earlier that day were triaged one
> by one: all but one described the pre-2026-09-24 layout or scope and were updated (the entry lives
> in the محور marker row and opens a LESSON session, so السابق/التالي cross into the neighbouring
> محور at a test's first/last question; the admin presenter reads in free navigation, so all three
> exercises of module 3 render and the module has 5 units with الخلاصة). The one product defect was
> the Math Lab « المختبر » button in the toolbar, 36 px wide under 640 px — fixed
> (`MathLabEntryButton` `min-w-[44px]`); the pointer controls, `hidden` below `sm` on purpose, are
> no longer counted as small targets.

**Use a port the API allows.** `apps/api/config/cors.php` permits 5173 / 5174 / 4173 only; a dev
server that fell back to 5175 makes every API call fail CORS, and `test-presentation.mjs`'s console
check fails for a reason that has nothing to do with the feature.

**Always pass `KIT_BASE`.** The shared helper defaults to `http://localhost:5183`, which is
`vite preview` serving a stale build with no API configured — several suite headers still print
5183, and that is a documentation bug in those files, not a setting to follow.

The presenter is faked without touching the database: the context routes
`**/api/v1/auth/me` to an `admin` fixture and seeds `localStorage.token`. When a test needs an
unlocked module on the **normal** page, it seeds that account's own progress key
`u_<id>_smarter_lesson_<lessonId>` — the sequential lock applies to a presenter like anyone else
outside a presentation.

`classroom.mjs` covers permissions, the lesson run-through, one-session pass-through, module scope,
exercise scope, the fallback, Escape, route cleanup, 1366×768 / 1024×768 / 390×844, and the
practice engine against the real QA account (skipped when the API is down). `manipulations.mjs`
covers the manipulation scope. Its lesson run-through now steps through module 0's **questions**
before crossing into module 1, since the diagnostic has units like any other presented page.
`test-presentation.mjs` (47 checks) covers the **test** scope on both
engines: one question at a time, answer state surviving navigation, « تحقّق » revealing only the
current question and not ending the test, the four states, « كشف النتائج » revealing all, the
question-by-question review afterwards, the statement actually being rendered, the normal page
staying silent, and 390×844. Its evidence and attempt calls are stubbed, so it writes nothing.

**Not covered:** native Escape (headless Chromium grants fullscreen but a synthetic Escape does not
leave it — exit through the toolbar instead), the orientation lock, real iOS Safari, the `presenter`
prop, two sibling shells, and the `DragGhost` portal under fullscreen. Neither suite runs in CI, and
there are no unit tests for `useFullscreen`, `useScrollLock`, `usePresentationFit` or the shell
itself; `classroomFit.js` and `classroomUnits.js` are the tested parts (the shelf geometry is tested
in `logic/bookshelf.test.js`, which is not presentation code).

## 11. Opting in

**A manipulation**

```jsx
export default function MyManipulation(props) {
  return (
    <ClassroomPresentation scope="manipulation" title={props.title} entry="none">
      <MyLab {...props} />   {/* reads useClassroomMode() for its classroom layout */}
    </ClassroomPresentation>
  );
}
// inside MyLab's header:  <ClassroomEntryButton scope="manipulation" title={title} />
// a shell-based lab passes it to the shell:  <ManipulationShell headerAction={<ClassroomEntryButton />} … />
```

**An exercise** — same shape with `scope="exercise"`, wrapping the content in `<ClassroomFrame>`
rather than computing a layout, and `<ClassroomHidden>` around page chrome that has no place on a
projector.

**A module** — nothing to do. `ModuleLayout` carries the entry button and the presented layout;
`ContentModule` derives the units. A custom module engine gets the generic behaviour for free, and
can declare its own units with `useClassroomStage` at priority ≥ 2.

**A test (module 0 or the final test)** — nothing to do, and nothing you *may* do. A module built on
`PrerequisiteDiagnostic` or `BossFinal` inherits the whole test presentation (§5, *Test*) from the engine:
one question at a time, `السابق` / `التالي`, « تحقّق من الإجابة », « كشف النتائج », the review, the
existing scoring. A lesson supplies **data** — `questions` / `epreuves` — and never a presentation
UI. Writing your own fullscreen test screen, your own per-question validation or a second corrector
is a defect, not a feature.

**A lesson** — nothing to do for lessons built by `buildLessonRoutes`: the shell is in the route
factory and the entry button is in `LessonIndex`. A lesson family with its own route builder adds
`<Route element={<LessonClassroomShell config={…} basePath={…} />}>` above its pages.

## 12. Limitations

* Only the 4AM unit-1 lessons exist (the French lessons were deleted on 2026-09-25); all of them use
  `buildLessonRoutes`, so lesson scope is live everywhere a lesson exists.
* Changing module resets the page (as in normal navigation): the session preserves **position**, not
  the state of a page left behind. Moving between units of one module preserves everything.
* A content that fills its budget exactly cannot signal slack, so after a legitimate reduction the
  scale grows back on − / +, a window resize, or `refit()`.
* Presented, a module's steps still follow the student unlock rule — a teacher who wants to show a
  later step answers the earlier one, exactly as in class.
* No keyboard navigation between units: the shortcuts are Escape, P (pointer) and Shift+P (spotlight).
* The scroll lock sets `overflow: hidden` on `html`/`body` and nothing else — iOS rubber-banding is
  mitigated only by `overscroll-behavior: contain`.
* No design tokens and no dark mode: `classroom.css` hard-codes its indigo palette.
* Not implemented, by design: annotation, drawing, live student sync, recording, remote control.
