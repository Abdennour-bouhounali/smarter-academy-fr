# Classroom Mode — the presentation shell

> **Status (2026-11-22).** Covers the projector shell `apps/web/src/lessons/common/classroom/` (fullscreen, fallback,
> scale and fitting, the classroom pointer, the presenter permission). Imported from the Algerian platform (DZ dev
> `7f4cef1c`) on 2026-11-22. True here: the shell, used by the practice engine (`scope="exercise"` in
> `pages/student/practice/PracticeSession.jsx` and `pages/teacher/practice/TeacherPracticePlayer.jsx`), the pointer
> (`ClassroomPointer`, also used by the class session's board) and `useFullscreen` (used by the Math Lab). Not true here:
> the classroom mode of MODULE lessons — the lesson, module, test and manipulation scopes, `LessonClassroomShell`, the
> kit's `TestPresentation` — was deleted with the module-lesson system; a v2 lesson is taken to class by the class
> session (`CLASS_SESSION.md`), not by this shell. Its labels are Arabic and it inherits right to left (plan §4, step 1D).

## 1. Concept

Classroom Mode is **platform infrastructure**, not a fullscreen button on one component. A content opts in by being
wrapped; it never implements fullscreen, scroll locking, Escape, viewport fitting or a toolbar itself. There is exactly
**one** implementation of each of those, and exactly **one** active session at a time.

The wrapped content stays at the **same place in the React tree and in the DOM** when a session starts: the shell's root
becomes the fullscreen element (or a fixed overlay), it does not move or remount its children. A typed answer, a revealed
correction, a reached step — all survive entering and leaving.

## 2. Architecture

```
classroom/
├── ClassroomPresentation.jsx  the shell: session state, fullscreen, scroll lock, Escape, focus, route scope,
│                              orientation, toolbar, nav, context — AND the pass-through branch when an ancestor is
│                              already presenting
├── ClassroomToolbar.jsx       top toolbar (scope badge · title · slot · scale − / +) + ClassroomNav, the bottom bar
├── ClassroomEntryButton.jsx   the entry point, per scope, presenters only
├── ClassroomContext.js        useClassroomMode()
├── ClassroomFrame.jsx         reading frame (+ ClassroomHidden) for page-authored content
├── useFullscreen.js           the browser Fullscreen API (+ WebKit spelling); state = real state
├── useScrollLock.js           html/body overflow: hidden, previous inline values restored
├── usePresentationFit.js      the viewport-fitting engine (ResizeObserver, rAF, settle, refit)
├── classroomFit.js            PURE fit maths: scale steps, available area, next fit factor
├── ClassroomPointer.jsx       the classroom pointer + spotlight overlay (§6)
├── classroomPointer.js        PURE pointer logic: sizes, diameter per viewport, P / Shift+P shortcut
├── classroom.css              `sa-classroom-*` scoped styles
└── index.js
```

Everything above is **presentation**. Content lives in `features/practice/**` and `pages/**`, and only *reads* the
context. The paging (`ClassroomPaged`, `classroomPages.js`, `PagingContext`), the stage registration (`useClassroomStage`)
and `useClassroomPortalTarget()` served module lessons only and were deleted on 2026-11-22 (commit `4511da19`).

## 3. Presenter permission

`canPresentClassroom(user)` in `packages/core/auth.js`, built on `hasRequiredRole`; the list of roles is
`CLASSROOM_PRESENTER_ROLES` = `['admin', 'teacher']`. **Nothing anywhere names a role**: entry buttons, shells and tests
all ask that one function. A student never sees the classroom entry: `canPresentClassroom({ role: 'student' })` is false,
and a test asserts it.

> **Not to be confused with the Math Lab's fullscreen.** An instrument opened over a page has its own fullscreen button,
> for students and teachers alike, with no permission (`MATH_LAB.md`). It reuses `useFullscreen` — a hook carries no
> permission — but nothing in `features/mathlab/` imports `canPresentClassroom`.

`presenter={true|false}` on `ClassroomPresentation` overrides the account (tests). The permission gates Classroom Mode
only — it grants no other capability, and it never changes what is written to a student's progress.

The teacher's *class* (`App\Domain\Classroom`, `features/teacher/`, identifier `classGroup`) is a different thing:
nothing in `lessons/common/classroom/` knows it exists. Presenting never reads or writes a class.

## 4. One session, never nested

`ClassroomPresentation` checks its parent context first. If an ancestor is already presenting, it renders a
**pass-through** `<div data-classroom-nested="true">`: no second `requestFullscreen`, no second toolbar, no entry
button. Its children read the running session's context. Consequence: wrapping a component is always safe.

* **`isNested` in the context is always `false`.** The nested branch renders no provider at all. Never branch on it.
* **Sibling shells are not mutually exclusive.** « One session » is enforced for *ancestors*, not for two shells side by
  side on one page.

## 5. The scope in use: the practice engine — « present the exercise »

`PracticeSession` (student) and `TeacherPracticePlayer` (teacher) wrap the page in
`<ClassroomPresentation scope="exercise" entry="none">` and pose `<ClassroomEntryButton scope="exercise" />` in the
session's navigation row. Presented, the session chrome (back link, progress, heading, notebook, report) is removed by
`ClassroomHidden` and the exercise is framed (`ClassroomFrame`). Answer, hints, attempt UUID, evaluation and retry state
all survive, because nothing unmounts. Presented, the page collapses to one block, the side column is `ClassroomHidden`,
and the question history **stays**. Arrival scrolling/focus is skipped while presenting (`features/practice/QuestionArrival`
reads `useClassroomMode()`).

The shell still holds the code of the other scopes (`lesson`, `module`, `manipulation`; `lessonNavigation` in
`ClassroomPresentation.jsx`), with no consumer.

**Opting in** — another content: the same shape, `scope="exercise"` (or `manipulation` for a content that computes its
own layout from `useClassroomMode().scale / .area`), `<ClassroomFrame>` around page-authored content, `<ClassroomHidden>`
around page chrome that has no place on a projector.

## 6. The two bars, and the pointer

**Top — `ClassroomToolbar`** (`data-classroom-toolbar`, min-height 48 px): scope badge · title · the page's `slot` · the
scale group (`−`, the percentage in `dir="ltr"`, `+`) · the pointer group (from `sm` up) · the exit. There is **no
fullscreen toggle, no fit button, no timer and no annotation tool**. Keyboard: **Escape** (leave, in fallback), **P**
(pointer on/off), **Shift+P** (spotlight).

**Bottom — `ClassroomNav`** (`data-classroom-nav`), rendered for every active session — it carries the way out. Step
buttons come only from gestures that exist (never a dead step); an exercise presented alone shows the exit only, in a
compact bar (a `:has()` rule). Every button is at least 44 × 44 px, its icon from `DirectionalIcons`. `usePresentationFit`
measures both bars (`reservedRefs`) and gives the content what is left.

**The classroom pointer** — a large red disc with a translucent halo and a white-rimmed core that **follows** the real
mouse (the cursor stays underneath and acts). Three sizes, the largest by default, remembered per device
(`smarter_classroom_pointer_size`); a spotlight (Shift+P) darkens the screen except a disc around the pointer; off when a
session starts. Rules (asserted by `classroomPointer.test.js`):

* **Never intercepts anything**: `pointer-events: none`.
* **Inside the session root**, `position: fixed`, `z-index: 2147483000` — visible in native fullscreen and above the
  Math Lab overlay.
* **No React render per movement**: one `pointermove` listener, one `requestAnimationFrame` writing `transform`.
* **Diameter follows the viewport** — `pointerDiameter(size, w, h)` = small side × {0.05, 0.075, 0.1}, clamped.
* **The shortcut reads `event.code === 'KeyP'`** (the key's position, the same on every layout), never with a modifier,
  never on repeat, never in an editable target or inside a Math Lab instrument (`[data-ml-overlay]`, `.excalidraw`).
* Hidden when the mouse leaves the window and when printing.

The class session's board (`features/classSession/board.jsx`) mounts the same `ClassroomPointer`.

## 7. Fullscreen, fallback, cleanup

1. Click → session active **and** `requestFullscreen({ navigationUI: 'hide' })` in the same user gesture.
2. `fullscreenchange` is the only truth: Escape, F11 or a system gesture end the session too.
3. API missing or refused → the root stays `position: fixed; inset: 0; z-index: 70`, and
   `html[data-sa-classroom="fallback"]` hides everything outside the presentation. Escape is handled by the shell here.
4. Exit / unmount / leaving `routeScope` → fullscreen released, scroll lock restored, focus returned to the entry button.
   `screen.orientation.lock('landscape')` is attempted only in native fullscreen and under 1024 px.
5. Body portals are invisible under a native fullscreen element: a portal that must show there finds the presentation
   root in the DOM itself (`features/mathlab/overlay/MathLabOverlayProvider.jsx`).

## 8. Scale and fitting

`--sa-classroom-scale = userScale × fitFactor`, plus `--sa-classroom-w/-h`; the same values in
`useClassroomMode().scale / .area`.

* `userScale` ∈ {0.9, 1, 1.1, 1.25} — the − / + buttons, remembered per device.
* `fitFactor` ≤ 1 (floor 0.55): the engine measures the stage against the content box, reduces on overflow, grows back on
  slack, and decides only on a **settled** layout (120 ms).
* `refit()` resets the factor when the content changes nature.
* `ClassroomFrame` uses `zoom` (it re-lays out the content at the new size); a frame inside a frame does not enlarge twice.

## 9. Direction and mathematics

The shell inherits the page direction (right to left today). Numbers and equations declare LTR themselves; KaTeX keeps its
`.sa-math-inline` isolation; the scale percentage is `dir="ltr"`. The French direction: `FRENCH_LANGUAGE_CONTRACT.md`,
not yet applied in the code.

## 10. DOM contract

```
[data-classroom-scope=exercise|…] [data-classroom-active=true|false] [data-classroom-native=true|false]
[data-classroom-scale] [data-classroom-nested=true] [data-classroom-toolbar] [data-classroom-nav]
[data-classroom-enter=<scope>] [data-classroom-frame=<zoom>] [data-classroom-exit] html[data-sa-classroom=native|fallback]
[data-classroom-pointer-controls] [data-classroom-pointer-toggle][aria-pressed] [data-classroom-pointer-size=s|m|l]
[data-classroom-spotlight-toggle] [data-classroom-pointer-layer] [data-classroom-pointer=<size>] [data-classroom-spotlight]
```

## 11. Check

- Unit: `classroomFit.test.js`, `classroomPointer.test.js` in
  `lessons/common/classroom/`; the permission in `packages/core/auth.test.js`.
- Walk: none. The Algerian suites (`e2e/lesson-kit/classroom.mjs`, `test-presentation.mjs`, `teacher-memo.mjs`) were
  deleted. Not covered by any test: `useFullscreen`, `useScrollLock`, `usePresentationFit`, the shell itself, native
  Escape, the orientation lock.

## 12. Limitations

* A content that fills its budget exactly cannot signal slack: after a reduction the scale grows back on − / +, a window
  resize, or `refit()`.
* No keyboard navigation between steps: the shortcuts are Escape, P and Shift+P.
* The scroll lock sets `overflow: hidden` on `html`/`body` only.
* No design tokens and no dark mode: `classroom.css` hard-codes its palette.
* Not implemented, by design: annotation, drawing, live student sync, recording, remote control.
