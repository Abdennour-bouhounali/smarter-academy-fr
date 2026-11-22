# Prompt for the next session: roll the BEM exam-sheet practice out to ALL lessons

You are continuing work in `/home/abdennour/websites/smarter-academy/smarter-academy-dz`
(Laravel API in `apps/api`, React in `apps/web`, Algerian 4AM maths, Arabic, RTL).

The prototype lesson `bahth-pgcd` now has the full « BEM exam sheet » practice. The owner has
now asked to EXPAND it to all lessons, and to the docs. Until now the owner was alarmed whenever
a change touched lessons other than the prototype, so work **unit by unit** and stop at each
gate below.

## 1. Read first

- `CLAUDE.md` (the documentation sync rule applies to every task).
- `docs/architecture/EXERCISE_CONTRACT.md`, sections:
  - « Présentation examen (BEM) »
  - « Level unlocking and the student setting »
  - « Saved answers and locked exam steps »
  - « Medals »
  - « Image answers and teacher validation »
  - « Two zones on a step that asks for working »
- `docs/sources/4am/bem-practice/brief-authors.md` (content format), `rollout-prompt.md` (this file),
  `docs/lessons/MASAIL_GENERATION_GUIDE.md` and `docs/sources/4am/masail-rollout/`
  (the previous unit-by-unit rollout: brief, lock, audit — reuse that machinery).
- Memory notes: `dz-bem-practice-restyle`, `dz-bem-image-answers`, `dz-masail-rollout`,
  `dz-qa-student-quota`, `php-sqlite-driver-missing`.

## 2. What the prototype contains (reuse, do not rebuild)

**Content (per lesson, `content/practice/4am/<lesson>/level-1..5/`):** 50 exercises, 10 per level,
as BEM sheets: official papers, adapted exercises, and « على منوال BEM <year> ». Each question has
`step`, `sub`, `solution`, and optionally `work` (`required` | `optional`), `timeSeconds`, `counted`.
Answer types: `rational`, `choice`, `selfCheck`. The exercise carries `metadata.exam`
(`kind`, `heading`, `points`, session).

**Engine (already generic, keyed on `metadata.exam`):**
- `ExamSheet`, progressive steps, « ابدأ » timer, MathLive field, line editor, locked answers.
- Medals, levels page (`PracticeHub` exam branch via `EXAM_STYLE_LESSONS` / `isExamLesson`).
- Photo answers, `student_settings.practice_validation` (teacher | self), review queue
  « تصحيح الإجابات », notification bell, read-only correction page.
- Two zones: « ١ مراحل الحساب » and « ٢ النتيجة النهائية ».

So **the rollout is mostly CONTENT plus enabling the lesson**, not new engine code. The engine
work is limited to anything hard-coded to `bahth-pgcd`: grep for `bahth-pgcd`, `EXAM_STYLE_LESSONS`
and `isExamLesson` in `apps/web/src`, `apps/api/app`, `scripts/` and fix each one to be generic.

## 3. Gates (ask the owner with AskUserQuestion; do not decide alone)

1. **Scope and order.** Which lessons, in which order? Propose by unit (14 units), starting with
   one SMALL unit as a pilot (suggest unit 2 « الحساب على الجذور » or unit 3 « الحساب الحرفي »),
   then the rest in waves.
2. **Source material per lesson.** Official BEM exercises exist for some topics only. For each
   lesson, which mix of official / adapted / « على منوال »? Where is the official corpus
   (`docs/official-BREVET-exams/`; PDFs are never versioned — render with `pdftoppm -r 150`)?
3. **Existing practice banks.** Do the new BEM-style exercises REPLACE the current bank of a
   lesson or sit beside it? Replacing changes mastery evidence and exercise ids (see
   `docs/architecture/MASTERY_*`, the answer-key registry and `AssessmentItem`). Get a decision
   and a migration plan for existing `question_attempts` and `learning_evidence`.
4. **Masail and « أتوقّع القاعدة » (predict-rule).** They coexist with the exam sheet today?
   Confirm how they combine in the same lesson.
5. **Photo answers and teacher validation everywhere?** Default yes (engine-level), but confirm,
   and confirm the privacy review (photos of minors, 12-month retention) is accepted for all
   lessons, and that the production scheduler runs `smarter:answer-images:purge`.
6. **Premium/free.** Does enabling a lesson change its free/premium status? (Owner supplies this;
   see `dz-4am-lesson-authoring`.)

## 4. Method (per unit)

1. Write a **brief** and a **lock** file in `docs/sources/4am/bem-practice/rollout/unit<N>/`
   (the lock prevents parallel authors from colliding; reuse the masail rollout's locking).
2. Seed shared foundations BEFORE parallel authors: any new core helper in
   `packages/core/arithmetic/`, figure kinds, `policy.json` entries, `active.json`.
3. Fan out authors by lesson (Workflow or parallel Agents; one lesson per author, ≤ 5 at a time).
   Each writes 50 exercises to the format in `brief-authors.md`, with step marks, `solution`,
   `work`, `timeSeconds`, and `counted:false` for steps that belong to another lesson.
4. **Audit** every lesson: `node scripts/validate-exercises.mjs --strict`, the answer oracle
   (`npx vitest run --dir scripts`) — an independent recomputation of EVERY answer; textbook-style
   figures per `dz-textbook-figure-redesign`; no dangling « المقابل » figure references.
5. Enable the lesson (`content/practice/active.json` and `EXAM_STYLE_LESSONS`), then
   `php artisan cache:clear` (the practice index is cached for 1 hour).
6. QA in the browser per unit (Playwright from `apps/web`, dev server :5173, API :8000):
   - student flow: `apps/web/e2e/lesson-kit/practice-exam-sheet.mjs` (parameterise the lesson);
   - photo + teacher flow: `practice-image-answers.mjs` (needs a qa-prof class containing
     qa-eleve; tokens by tinker; clean up afterwards: tokens, class, images, reviews,
     notifications);
   - 360 px: no horizontal scroll; Arabic only, no French fallbacks.
7. Report per unit, then wait for the owner's go before the next one.

## 5. Docs to update (same task, not at the end)

- `docs/architecture/EXERCISE_CONTRACT.md`: replace « prototype `bahth-pgcd`, … only » wording
  with the real state; list the lessons that have exam sheets; the per-lesson rollout status table.
- `docs/sources/4am/bem-practice/brief-authors.md`: any new author rule learned in a wave.
- `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md`: the exam-style practice becomes the standard for
  new lessons (what a generated lesson must ship for practice).
- `docs/architecture/TEACHER_CLASSROOM_ARCHITECTURE.md`: scope of « تصحيح الإجابات » and « إجابات
  تلاميذي » across lessons.
- `docs/architecture/BUNDLE_BOUNDARIES.md`: if the practice index or `import.meta.glob` grows.
- `CLAUDE.md` intro paragraph (lesson/practice status), `docs/README.md` map.
- Memory: update `dz-bem-practice-restyle`; add a rollout note like `dz-masail-rollout`.
- End the report with a « Documentation Sync » section.

## 6. Working rules

- Arabic first; never hard-code UI text (`apps/web/src/i18n/locales/ar/*.json`, Arabic plurals);
  isolate maths LTR in RTL (`ARABIC_RTL_CONTRACT.md`). Learning points are « الكفاءة ».
- Heavy libraries stay lazy (`BUNDLE_BOUNDARIES.md` §6; MathLive via `exam/math/lazy.jsx`).
- Tests: web `cd apps/web && npx vitest run`; content `node scripts/validate-exercises.mjs --strict`;
  PHP (no pdo_sqlite here):
  `cd apps/api && DB_CONNECTION=mysql DB_DATABASE=smarter_academy_dz_test DB_URL= DB_PASSWORD=$(grep -E "^DB_PASSWORD=" .env | cut -d= -f2- | tr -d '"') php artisan test`.
- Vite gotcha: a file written in several quick steps can be cached as an EMPTY module. Write each
  file once, `touch` it, and check `curl -s localhost:5173/src/<file> -w "%{size_download}"`.
- MathLive fields need a real mouse click after `scrollIntoView({block:'center'})`.
- Playwright: use `waitUntil: 'domcontentloaded'` plus selector waits (`networkidle` stalls).
- Known open issue to fix on the way (small): the French `syntax_error` fallback in
  `packages/core/practice/answerEvaluator.js` (~line 349) must be Arabic.
- Never commit, push or deploy unless the owner asks. PDFs are never versioned.

## 7. Official source: the BEM annals 2007 → 2025

Files in `docs/official-BREVET-exams/` (never versioned, never `git add`):
- `حوليات شهادة التعليم المتوسط سابقة من 2007الى 2025.pdf` — the papers;
- `حوليات شهادة التعليم المتوسط سابقة من 2007الى 2025.pdf حلول` — the official solutions
  (no `.pdf` extension, so `.gitignore` does not catch it).
The text layer is garbled: render with `pdftoppm -r 150 -png` and read the images.

**Step 0, before any authoring.** Build one index of the whole corpus in
`docs/sources/4am/bem-practice/annals-index.md` (+ `.json`), by year 2007…2025: year/session,
exercise number, points (ن), topic, the 4AM lesson(s) it tests (map to the 14 units / lesson
codes), the page in the paper and the page of its official solution. Flag exercises that mix
lessons (they become several steps, `counted:false` outside the lesson, as in the prototype)
and the « الجزء الثاني » (وضعية إدماجية) problems. Then list, per lesson, the annals exercises
that belong to it: that list drives its 50 exercises.

**Using the annals when writing a lesson's 50 exercises**
- « BEM <year> » (official): the exercise as in the paper, same wording and points, official
  solution as `solution`, real year in the label. Never invent a year; never alter an official
  statement (redraw a poor figure, keep the numbers).
- adapted: same exercise, other numbers, solution recomputed by the oracle.
- « على منوال BEM <year> »: new exercise in the style of that year.
- Use as many real annals exercises per lesson as the corpus gives; cite each once, in the
  lesson that owns its main skill (the rest are `counted:false` steps).
- Every answer, official ones included, must pass the answer oracle. If an official solution
  disagrees with the recomputed value, STOP and report it to the owner; do not silently fix it.
- Record in each lesson's brief which years/exercises were used.

Ask the owner: is the 2007–2025 file complete for all 4AM topics, and may exercises from the
old programme be skipped or adapted?
