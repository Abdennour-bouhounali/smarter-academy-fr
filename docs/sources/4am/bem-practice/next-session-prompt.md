# Prompt for the next session: BEM prototype, image answers and teacher validation

> **Status: IMPLEMENTED on 2026-10-06.** The owner's answers to §4 and the resulting
> contract are in `docs/architecture/EXERCISE_CONTRACT.md` § « Image answers and teacher
> validation ». This prompt is kept as history.

You are continuing work on the "BEM exam sheet" practice PROTOTYPE in
`/home/abdennour/websites/smarter-academy/smarter-academy-dz`. The app is a Laravel API in
`apps/api` and React in `apps/web`, for Algerian 4AM maths, in Arabic and right to left.

**Stay on the prototype lesson ONLY.** That lesson is `bahth-pgcd` (« البحث عن القاسم
المشترك الأكبر لعددين طبيعيين »). Do not extend anything to other lessons until the owner
approves.

## 1. Read first

- `CLAUDE.md`. Its documentation sync rule applies to every task.
- `docs/architecture/EXERCISE_CONTRACT.md`, these sections:
  - « Présentation examen (BEM) »
  - « Level unlocking and the student setting »
  - « Saved answers and locked exam steps »
  - « Medals »
  - « The BEM levels page »
- `docs/sources/4am/bem-practice/brief-authors.md`, for the content format.
- The auto-memory note `dz-bem-practice-restyle.md`, plus `dz-qa-student-quota.md` and
  `php-sqlite-driver-missing.md`.

## 2. What already exists (2026-10-06)

**Content.** The prototype bank has 50 exercises in `content/practice/4am/bahth-pgcd/` (10 per
level): official BEM papers, adapted exercises, and exercises « على منوال BEM ». Each question
carries `step`, `sub`, `solution`, and optionally `work` (`required` or `optional`),
`timeSeconds` and `counted`. Answer types are `rational`, `choice` and `selfCheck`.

**Student player** (`apps/web/src/pages/student/practice/PracticeSession.jsx`):
- The exam sheet: `features/practice/exam/ExamSheet.jsx`.
- Steps appear one at a time, each behind a « ابدأ » button that starts its countdown
  (`StepTimer`).
- Fields:
  - MathLive: `exam/math/ExamMathField.jsx`;
  - the line editor for steps and proofs: `MathLinesEditor.jsx`, with `linesModel.js`;
  - field width set by `answerChars`, plus a resize handle.
- Proofs (`selfCheck`) are saved and locked first, then the model answer appears, then the
  student self-marks.
- The model answer appears only after a real attempt.
- Navigation buttons sit in the top band.
- A centred `Modal` holds « التنقل في التمرين » and « الكفاءة ».

**Teacher view.** `apps/web/src/pages/teacher/practice/TeacherPracticePlayer.jsx` shows the same
sheet, never records anything, and opens « إجابات تلاميذي » in a window. That panel is
`StudentResponsesPanel.jsx`; it shows the formula answer, the steps, the proof, the time and the
medal.

**Saving.**
- Every answer is saved in `question_attempts.submitted_answer` as
  `{value, latex, work, text, selfMark, seconds}`.
- An answered exam step is LOCKED: `PracticeSessionService::openQuestion` reuses the answered
  attempt.
- Self-marking: `PracticeEvidenceRecorder::recordSelfMark`.
- Two endpoints:
  - `GET /practice/sessions/{id}/answers` feeds « التمرين السابق »;
  - `GET /lessons/{code}/practice/medals` feeds the medals.
- Self-checked and `counted:false` steps never write mastery evidence (`countsForMastery`, in JS
  and PHP).

**Settings.**
- The `student_settings` table (`practice_levels_open`) and `StudentSettingsService`.
- Who decides: the TEACHER for a student in an active class, the student otherwise.
- APIs:
  - student: `GET/PATCH /me/settings`;
  - teacher, per student: `GET/PATCH /teacher/classrooms/{id}/students/{studentId}/settings`.
- Screens:
  - the student settings window: `features/settings/SettingsButton.jsx` and
    `StudentSettingsPanel.jsx`;
  - the teacher card on the student page: `features/teacher/settings/StudentSettingsCard.jsx`.

**Medals.** `features/practice/exam/medals.js` (mirrored in `App\Domain\Practice\Medals`),
`features/practice/medals/*`, and a sound gated by the device preference
`useEffectsPreference`.

**Levels page.** `PracticeHub.jsx` takes the exam branch through
`isExamLesson(lessonCode)` (`EXAM_STYLE_LESSONS`).

## 3. The new feature to build: image answers and teacher validation

### A. An optional image answer, on every exam step

- Next to the typed input, the student can attach one or more PHOTOS of their handwritten
  work. On a phone that means the camera (`accept="image/*" capture="environment"`); on a
  computer, a file.
- They may use the typed input, the image, or both.
- The image is saved with the attempt, locked once submitted like everything else, and
  visible later in « التمرين السابق », in the teacher panel and in the review link (see C).
- Storage:
  - a PRIVATE disk, never public URLs; served through an authorised route (the student
    themself, or a teacher of their active class);
  - strip EXIF/GPS metadata; cap the size and dimensions; resize on upload.
  - These are photos of minors: follow `docs/legal` and the privacy contract tests
    (`TeacherPrivacyContractTest`).

### B. Who validates: a per-student setting, following the existing settings rule

- **Independent student (no class):** validates themself. A typed answer is checked
  automatically, as today. An image-only answer goes through the self-check flow: the model
  answer appears, the student marks « مطابق / غير مطابق », and it is never counted for mastery.
- **Student in a class:** the teacher chooses PER STUDENT, as a new column on
  `student_settings` set from the teacher's « إعدادات التلميذ » card:
  - « تصحيح الأستاذ » (teacher validates). The student submits and CONTINUES freely to the
    next question without waiting. The answer is pending review: no verdict, no model answer,
    no medal yet.
  - « مستقل » (autonomous). Same as an independent student, so the teacher can focus on the
    weaker students.

### C. The teacher reviews, and the student is notified

- The teacher gets a review queue: answers pending review from their students in teacher
  mode, with the typed answer, the steps and the images.
- They mark each one correct or incorrect, with a written comment.
- The STUDENT then gets a NOTIFICATION. Clicking it opens EXACTLY that exercise and that
  question, read-only, showing their answer, the images and the teacher's verdict and
  comment.
- Check whether a notification system already exists before building one: grep for
  `notification` and `Notification` in `apps/api` and `apps/web`.

## 4. Ask the owner FIRST (use AskUserQuestion), before coding

1. In teacher-validation mode, if the step also has an auto-checkable typed answer, should
   the student still see the automatic verdict and model answer immediately, or only after
   the teacher's review?
2. Does the teacher's verdict count for MASTERY (`evaluated_by: teacher`) and award a MEDAL
   when it arrives? If so, does the time limit still apply?
3. Limits: how many images per step, the maximum size, and how long images are kept (and
   what happens when a student leaves the class).
4. Where should the teacher's review queue live: a new page « تصحيح الإجابات » per class, a
   tab on the class page, or inside the exercise's « إجابات تلاميذي » window?
5. Notifications: in the app only (a bell with an unread count), or also e-mail?
6. Can the teacher annotate the image itself (draw on it), or only write a comment?

## 5. Working rules and gotchas

- **Arabic first.** Never hard-code UI text: every string goes in
  `apps/web/src/i18n/locales/ar/*.json`, using Arabic plural forms. Mind RTL and LTR
  isolation of maths (`ARABIC_RTL_CONTRACT.md`).
- **Bundle rule.** Heavy libraries stay lazy (`BUNDLE_BOUNDARIES.md` §6); MathLive is loaded
  through `exam/math/lazy.jsx`.
- **Tests:**
  - web: `cd apps/web && npx vitest run`;
  - content: `node scripts/validate-exercises.mjs --strict` and `npx vitest run --dir scripts`
    (the answer oracle);
  - PHP: `pdo_sqlite` is missing on this machine, so run against MySQL:
    `cd apps/api && DB_CONNECTION=mysql DB_DATABASE=smarter_academy_dz_test DB_URL= DB_PASSWORD=$(grep -E "^DB_PASSWORD=" .env | cut -d= -f2- | tr -d '"') php artisan test`.
- **Browser QA** (Playwright, from `apps/web`; the dev server runs on :5173, the API on
  :8000):
  - Main test: `KIT_BASE=http://localhost:5173 PRACTICE_TOKEN=… node e2e/lesson-kit/practice-exam-sheet.mjs`.
    Extend it.
  - Tokens come from tinker: `qa-eleve@smarter.dz` (independent, verified),
    `qa-prof@smarter.dz` (teacher). Delete the tokens you create afterwards.
  - Locally, no active class links a student to the teacher. You will need a test class and
    membership. Create them, then clean up.
  - MathLive fields need a REAL mouse click after `scrollIntoView({block:'center'})`, because
    the sticky bar and `locator.click()` both fail on them.
- **Vite gotcha.** A file written in several quick steps can be cached as an EMPTY module
  (blank page, or « Cannot convert object to primitive value »). Write each file once, then
  `touch` it, and check with `curl -s localhost:5173/src/<file> -w "%{size_download}"`.
- After any content change, run `php artisan cache:clear`: the practice index is cached for
  1 hour.
- **Never** commit, push or deploy unless the owner asks. PDFs are never versioned.
- End with a « Documentation Sync » section, and update EXERCISE_CONTRACT.md plus the memory
  note.
