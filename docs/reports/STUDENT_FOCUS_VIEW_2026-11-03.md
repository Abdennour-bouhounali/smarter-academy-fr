# Student « focus » view — pilot on `qasim-adad-tabii` (2026-11-03)

**Owner request:** Gen Alpha does not like to read much or to see a lot of content at once. Show the student what they need right
away, and let them open more if they want. The teacher view is fine and must not change. If the result is better, it goes to the
other lessons.

**Status:** pilot, one lesson (`studentView: 'focus'` in its `lesson.config.js`). The rules and the rollout checklist are in
`docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` §4sexies.

## Before / after (student, 1280×800)

Revision 2026-11-04 (owner: « reducing what appears at once is not deleting »): every piece the focus view takes off the screen is
reachable again. « All folds open » counts the words after clicking every « المزيد » and « عرض الوصف » on the page.

| Page | Before (words) | After, on screen | After, all folds open |
| --- | --- | --- | --- |
| Lesson home | 568 | 214 | 534 (teacher: 544) |
| أستعدّ | 221 | 205 | 223 |
| نشاط 1 (al-maktaba) | 433 | 221 | 268 |
| معارف (maarif) | 520 | 222 | 279 |
| أوظّف تعلّماتي (awazzif) | 589 | 163 | 294 |
| مسألة 1 | 370 | 251 | 382 |
| إختبار أولي | 245 | 236 | 247 |

Caveats:
- The "before" captures had every module marked done (memo cards open). The "after" captures are a fresh student.
- On module pages, "all folds open" stays below "before" because the later questions are still locked until reached, as they were
  for a student before. Their titles open in « الأسئلة القادمة ».
- The words are the visible `innerText` of `<main>`.

## What changed

- **Shared:** `components/StudentFocus.jsx` (the switch + `MoreToggle`), wired into:
  - `ModuleLayout` (time + subtitle under « المزيد »);
  - `ContentModule` (one step on screen, « التالي », ✓ lines, « الأسئلة القادمة ») and `LessonUI › StepCard` (`collapsible`);
  - `KnowledgeBrick`, `questions › TapQuestion`, `TextbookExercise`, `MemoCard`;
  - `GuidedProblem` (« كل الأسئلة », « الخطوات القادمة »);
  - `LessonIndex` (« تفاصيل الدرس », « عرض الوصف »), `LessonProblemCard`, `PrerequisiteDiagnostic`, `ReviewLinks`.
  - Strings: `lesson.json › focus.*`.
- **Lesson:**
  - Modules 1–2: the text is unchanged. An evidence list where nothing has been tried folds under « تجاربي ».
  - Module 3: the « الكتاب ص 14 » / « تمارين الكتاب » wording is gone (book independence; this also shows to the teacher).
  - Config: the module descriptions and the lab title « مثال الكتاب » were reworded for the same reason.
- **Unchanged:**
  - the lab (`ManipulationShell`), the teacher / admin view and Classroom Mode (`studentFocus.test.jsx`, plus a teacher capture);
  - every lesson without the flag (`MoreToggle` renders inline);
  - the lab prototype (`lab-rollout-status` ✅).

## Verified

- **Tests and checks:**
  - `studentFocus.test.jsx`;
  - the lesson unit tests (`npx vitest run src/lessons`: 11683 passed, 2026-11-04; the full web suite passed on the 2026-11-03
    version);
  - `check:lessons`.
- **Browser, mocked student session, on أوظّف:**
  - one exercise on screen;
  - a right answer stays open with « صحيح » + « لماذا؟ » and « التالي »;
  - « التالي » collapses it to a ✓ line and opens exercise 2;
  - « إظهار » reopens it with its answer intact.
- **Not run:** `e2e/lesson-kit/4am-aadad-tabiiya-natiqa.mjs` runs as an anonymous visitor, and lessons now redirect visitors to
  `/register`, so it stops at its first step (the unit page) for a reason unrelated to this change.

## Rollout checklist (per lesson)

Follow the guide §4sexies:
1. Add the flag.
2. Fold the empty evidence lists. Remove nothing.
3. Run the checks.
4. Capture the student and teacher views.
