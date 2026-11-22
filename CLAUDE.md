# smarter-academy-fr — REBUILD IN PROGRESS on the DZ core

> **Read `docs/FRANCE_REBUILD_PLAN.md` FIRST. It is the authority for every task in this folder until its step 1I
> rewrites this file.**
>
> This folder is the FRENCH platform (France, French, left to right, collège 6e–3e, Stripe) being rebuilt from the
> Algerian one. Everything below this notice is DZ's `CLAUDE.md`, imported unchanged on 2026-11-22 with DZ `dev` at
> `7f4cef1c`. It describes the code as it was imported, and it is the reference for the engine and the working rules.
>
> - **Still binding here**: never push and never merge to `main` without the owner's word (`main` deploys to French
>   production, and the deploy workflow is locked — plan §Status); Fable orchestrates, agents code; ONE heavy check at
>   a time on this 13 GB machine; report honestly; the documentation rule; lessons drawn in code; the one screen size
>   1366×768; « discover, don't be told »; independence from the textbook.
> - **NOT binding here** (they are DZ's): Arabic and RTL, « دج », the BEM, the Algerian calendar, the DZ grade ladder,
>   the DZ content and character rules. Their French replacements are plan §4 and §7 — several wait for the owner.
> - Old FR is untouched on `main` and in the sibling folder `smarter-academy-fr`. DZ is the sibling
>   `smarter-academy-dz`. The two products share no runtime, no database and no deployment — never add one.

# smarter-academy-dz (imported text — see the notice above)

Arabic-first, RTL mathematics platform for the Algerian curriculum (المتوسط: 1AM–4AM, starting with 4AM).

| Where | What |
|---|---|
| `apps/web` | the React app (Vite, JSX — no TypeScript). Lessons: `src/lessons/moyen/<grade>/…`; the shared lesson engine: `src/lessons/common/` |
| `packages/core` | pure logic: the curriculum (catalogue, programme, learning net, school calendar), exact arithmetic, progress |
| `apps/api` | the Laravel API (tests: `php8.4 artisan test --configuration phpunit.local.xml`) |
| `content/` | the exercise banks, the class tests, the thinking-lab challenges |
| `docs/` | the contracts (`docs/architecture/`), the lesson guide (`docs/lessons/`), the plans and reports (`docs/reports/`) |

**This file is a MAP of what binds every task. The history of each feature, with its dates and the owner's words, is
`docs/reports/CLAUDE_MD_BEFORE_CUT_2026-11-17.md` (this file as it was before 2026-11-17, kept whole) and the contracts
below.** The French-era lessons and catalogue were deleted on 2026-09-25: an older doc that cites `lessons/college/` or
`lessons/lycee/` describes code that no longer exists.

## Start of a session

1. `docs/README.md` — which document is authoritative for what.
2. **`docs/reports/LESSON_V2_MASTER_PLAN.md` §4ter-0 — the LIVE state of the lesson v2 rollout and the ordered list of
   what is left** (the first unticked line is the next thing to do). `npm run status:lesson-v2` prints the same from the
   code: which lessons are v2, and how many still stand on each old system.
3. **Rebuilding a lesson: never read the old lesson** (owner, 2026-11-18 — it is rebuilt from scratch). What it must teach is
   `npm run lesson:brief -- <id>` (the learning net: الكفاءات, learning-point ids, prerequisites, what not to rebuild, and a
   digest of what its exercises ask, learning point by learning point); its
   **exercise bank is used as it is** (`content/practice/<grade>/<id>/`), never regenerated. The pipeline is
   `LESSON_V2_MASTER_PLAN.md` §9.
4. **Working on a lesson (designing, briefing an agent, reviewing screenshots, finishing): the project skill
   `.claude/skills/lesson-v2/`** (owner, 2026-11-19; versioned, the only part of `.claude/` that is) — the pipeline, the
   brief of each agent, the ledger of every defect met so far with the check that catches it, the screenshot review. A
   lesson is not finished until what it taught is written back into that skill (its §5).
5. The contract of the area you touch (table below), then the code.

## The lesson, today: v2 (BINDING since 2026-11-17, owner decision D6)

Every lesson is being rebuilt like the pilot `qasim-adad-tabii` — FROM SCRATCH, never held back by old code or old docs
(owner). A v2 lesson is **content plus, at most once per unit, one world mechanic**:

- **the kit** `lessons/common/gameworld/kit/` (screens, frames, the world runtime, the shell, the rule forge) names no
  lesson and no world; **a world** `gameworld/<world>/` is a mechanic; **the lesson's content** is in ITS folder
  (`world/`, `board/`, `knowledge.jsx`) and is declared in ITS **`lesson.pack.js`** — no list anywhere else names a
  lesson. After writing or changing a pack: `npm run generate:lesson-index`. Shared code reads a part with
  `lessons/lessonPack.js › loadPackPart` / `usePackPart`, never by the lesson's path (a test fails otherwise).
- **No rule is told**: each key of a lesson is FORGED by the student (predict → write his rule with tiles → the mirror
  tests it on his own evidence → attacks it → seal → use → only then its name). Exactly one rule holds; every other is
  refuted in front of him. The verdict is what the world does, never « wrong ».
- **Each rule has its own nature and its own way of discovery** (owner, 2026-11-17): the same mirror is not asked for every
  rule. A rule that is a search, a pattern or a procedure is FOUND FIRST by an experiment made for it (`forge.inquiry` —
  « استكشف »: he tries, predicts, claims, and the world answers with facts), starting from what he has just done; a help
  never narrows to a choice between written rules. `GAME_WORLD.md` « استكشف »; reference: `qawasim-adad-tabii`.
- **The LAST lesson of each unit** (« أدمج تعلّماتي ») is not a lesson of keys: it is three missions on the BEM's
  integration situation, a recap of the unit and the bank as training exams. It is built after the unit's other lessons,
  by `docs/reports/INTEGRATION_LESSON_PLAN.md` (owner, 2026-11-19; BUILT for 4AM unit 1 on 2026-11-20: world « جزيرة المهمّات » `gameworld/missionIsle/`, missions as data played by `gameworld/missions/MissionRunner.jsx`; its board and class test are not), and it is designed and coded by Fable.
- A lesson is done when `npm run status:lesson-v2 -- --lesson <id>` prints ✅ AND its tests, its walks at 1366×768 pass AND its screenshots were looked at with the eyes.
- Contracts: `LESSON_V2.md` (the pack, the folder, the definition of done), `GAME_WORLD.md` (the kit, a world, the
  forge, the phone rules), `LAUNCH_KIT.md`, `LESSON_LAB.md`, `CLASS_SESSION.md`.

The lessons NOT yet rebuilt keep what they have: the module lesson of `LESSON_DEVELOPMENT_GUIDE.md` §14 (its reference
architecture), the mission player (guide §4septies; state `docs/reports/MISSION_ROLLOUT_PROGRESS.md`), the lab prototype
(`LAB_PROTOTYPE_ROLLOUT.md`, `MANIPULATION_CONTRACT.md`, `MANIPULATION_DNA.md` §17), « وضع القسم ». Do not extend them:
a legacy system is deleted in the commit that converts its last lesson.
While one of their labs is touched, its rules still hold: the student's hand controls a mathematical variable, the
onboarding `LabCoach`, the questions over the lab after each step, one screen, and
`node apps/web/scripts/lab-rollout-status.mjs --lesson <id>` printing ✅.

## The other areas and their contracts

| Area | Contract |
|---|---|
| Navigation — FOUR DOORS per workspace (doors are data; one menu renders them); colour tokens `nav-*` | `docs/reports/NAVIGATION_REBUILD_PLAN.md` §0 |
| Exercises, the BEM « exam sheet », answer templates, the exam coach | `docs/architecture/EXERCISE_CONTRACT.md` |
| The learning net « شبكة الكفاءات » (224 programme items, typed and weighted links) | `LEARNING_NET.md` — after editing a link: `npm run generate:learning-net` |
| « بوصلتي », the year compass; ONE school calendar, renewed EVERY school year | `YEAR_COMPASS.md` (`check:year-calendar`) |
| 1AM–3AM lessons: catalogue entries `coming_soon`, generated one by one | `docs/curriculum/GENERATION_QUEUE.md`, `docs/reports/MOYEN_ROLLOUT_PROGRESS.md` |
| « مختبر التفكير », the thinking space | `THINKING_LAB.md` |
| The game space `/espace/jeux` | `MADAR_GAME.md` |
| Parents: « رابط الوليّ », no account | `PARENT_SPACE.md` |
| A school and its director « فضاء الإدارة » | `SCHOOL_ADMIN_SPACE.md` |
| The printed-books store | `BOOKS_STORE.md` |
| The Math Lab `/espace/atelier` (NOT « مختبري ») | `MATH_LAB.md` |
| The entry bundle and lazy boundaries | `BUNDLE_BOUNDARIES.md` |
| Lint, unused code, dead files, formatting | `CODE_HEALTH.md` |
| Arabic and RTL | `ARABIC_RTL_CONTRACT.md` |
| The brand and the logo | `BRAND.md` |

## Rules that hold in EVERY task (the owner's)

**Git and production**

- **Never push and never merge to `main` without the owner's word** — `main` deploys to production. Work on `dev`.
- Commit a lesson right after it is done: `feat(lessons): <id> — v2`.
- **Nothing generated stays `draft`**: a generated lesson, its modules and exercises end `published` in the LOCAL database
  too (guide §11 « Publish a lesson »).

**Pedagogy**

- **The textbook is the REFERENCE of the الكفاءات, never the script of the lesson**, and the platform is INDEPENDENT FROM
  THE BOOK: own contexts, own numbers, own wording; never a line that sends a student to the book
  (`LESSON_DEVELOPMENT_GUIDE.md` §4ter–§4ter-bis).
- **Discover, don't be told**: the student acts first; a rule gets its name only after he has it.
- **Show your limit**: a lesson or a lab that merely works is not done (`MANIPULATION_DNA.md` §17 — for 11–13 year olds).
- A learning point is « الكفاءة / الكفاءات » in every visible string — never « نقطة التعلّم » (identifiers unchanged).
- **The exercise bank is used AS IT IS, in every generation** (owner, 2026-11-18): a lesson's practice space and exam sitting
  serve `content/practice/<grade>/<id>/` unchanged — never generated look-alike exercises. A defect of the bank (a « DA »
  price, a textbook citation) is reported to the owner, never silently replaced. Where the code stands (review of
  2026-11-19): the exam sitting « الامتحان الأبيض » and the practice page serve the bank; the per-key drills « تدرّب » of a
  world still generate their own questions — OPEN, the owner decides whether they move to the bank; a « DA » of the bank is
  shown as « دج » on screen (the file is not changed) and the sheets are listed in `BANK_AS_IS_2026-11-18.md`. **A lesson is rebuilt from scratch and its
  old version is never read**: what it must teach is `npm run lesson:brief -- <id>` (`LESSON_V2_MASTER_PLAN.md` §9).
- **A class test never changes a student's progress.** Only exam-format first tries of the game are evidence, and the
  SERVER re-computes their verdict (`LESSON_V2.md` §1bis). The student's private answers and his world save are never
  evidence and never read by a teacher, a school or a parent.

**Respect and content**

- **Respect Islam in every string, icon and emoji**: never the pig (a money box is 💰), alcohol, gambling (cards, dice as
  a game, casino, lottery), usury or interest, pork, non-Islamic festivals or religious symbols. Neutral Algerian
  everyday contexts (guide § « Cultural and religious respect »).
- **People are ONE shared character, `primitives/KidFigure.jsx`**: boys in a hoodie, girls ALWAYS in Islamic dress.
  Never draw a person locally.
- **Lesson content is drawn in code, never a generated image** (§ « Images » below).

**Screens and writing**

- **ONE SCREEN SIZE: 1366×768, alone (owner, 2026-11-19, after a council; « all the lessons must work for this size only: 1366×768, alone, no other size is needed »).** A lesson is built, walked and looked at at 1366×768 and at no other size: no walk at 1024×768 or 1840×900, no tablet, no phone. An older document that names three sizes or « laptop and tablet » describes the rule before this date. Known and NOT measured: the real window of such a laptop is shorter than 768 px (the browser's bars), and no lesson has been tried on a weak school machine.
- **PHONES ARE PAUSED (owner, 2026-11-18): lessons are built for the laptop and the tablet only; every pack says `phone: false`, the phone walk is not part of « done ». The phone rules below are kept for when phones resume (known phone debt of `qawasim-adad-tabii`: `docs/reports/LESSON_V2_MASTER_PLAN.md` §4ter-0 step 8).**
- **Laptop first, then tablet, then phone.** Lessons are behind `components/auth/RequireLargeScreen.jsx`; a phone opens
  only the HOME of a lesson whose pack says `phone: true` (its world, played sideways) and the pages listed as
  exceptions: `/books`, the parent pages (`/w/:token`, `/wali/*`, `/himaya`), the game space. The teacher's side is not
  built for phones. Phone rules: `GAME_WORLD.md` « On a phone » (one scale, 12 px floor, readable beats unscrolled).
- **Nothing scrolls** in a world, a player or a lab, and **no back-and-forth**: what a question asks the student to look
  at is on the question's screen.
- **A typed answer is entered in its own shape** (templates, a real fraction bar, printed units) and **a formula never
  breaks across two lines**. LaTeX in an ordinary JS string takes TWO backslashes (`'\\times'`).
- **Money is « دج »**, never « DA », with no thousands space. Counters use the no-break space.
- **Reduce what shows at once, never delete** (the student's focus view): what leaves the screen stays reachable.
- **Shapes are the brand blue (`nav-accent`), never black; dark ink is for text only.** No raw colour class and no
  gradient in the menus, the teacher's pages, the lesson and unit cards. **A card is four lines at most.**

**Who does what, and working limits** (owner, 2026-11-17)

- **Fable orchestrates, Opus codes.** The main session (Fable) designs, briefs the agents, reviews what they return, runs
  the walks and reports. The code is written by agents on `opus` — except **the 3D** (the world runtime and its scenes)
  and **a task judged complicated**, which Fable codes itself.
- **No fixed cap on the number of agents** (the old cap of 2 was for VS Code, which was killed when memory ran out; the
  work now runs in the terminal). Agents that write code at the same time touch files that do not overlap, or each
  works in its own worktree.
- **ONE heavy check at a time** (`check:lessons`, a build, a walk, the whole suite) until two at once have been tried in
  the terminal: every crash measured before came from heavy runs overlapping, on a machine of 13 GB. Never edit source
  while a walk runs (hot reload contaminates it).
- **Report honestly**: what failed, what was not checked, what you are unsure of. Never « all green » on something that
  was not run.

## Checks (all in CI except the walks)

| Command | What it guards |
|---|---|
| `npm run lint` | ESLint on the whole tree (a function that is not a hook is never named `use…`) |
| `npm run check:unused` | unused exports, i18n keys and sentences; its baseline only SHRINKS — never park new code in it |
| `npm run check:unreached` | no dead file: delete what a change makes useless in the SAME change |
| `npm run check:format` / `format:v2` | Prettier, 120 columns, on the areas listed in `package.json` (a new or rebuilt area joins both lists) |
| `npm run check:lessons` | lesson and exercise validators, the generated indexes, the calendar, the entry budget |
| `npm run check:entry-budget` | the entry bundle: 212 KB gzip (measured 197.8). No entry module imports a catalogue name; lessons mount through ONE lazy boundary |
| `npm test` (core, web, scripts) — or `npx vitest run` in `apps/web` / `packages/core` | unit tests |
| `node apps/web/e2e/<walk>.mjs` | the walks (dev server on :5173): `E2E_SIZE=WxH`; the ONE size is `E2E_SIZE=1366x768`, the default; a sitting walk opens every sheet of the bank (`E2E_PARTS=<part>` runs one part, not a full run); `E2E_TOUCH=1 E2E_SIZE=800x370` for a phone (paused). WebGL is drawn by the GPU when the machine has one (`e2e/lib/gpu.mjs`; `E2E_GPU=0` forces software): measured 15× less CPU than software rendering, which had frozen the laptop. NOT in CI yet |

Generators to run after a change: `generate:lesson-index` (a lesson, its modules or its pack), `generate:lab-order`
(a lesson added or re-ordered), `generate:learning-net` (a link of the net), `generate:compass-index`.

## DOCUMENTATION SYNCHRONIZATION RULE (permanent, applies to every prompt)

For every development task — feature, bug fix, refactor, architectural change,
UI change, lesson change, exercise change, interaction change, or any other
meaningful modification — you MUST first determine whether the change affects
any documentation, and if it does, update the relevant `.md` files as part of
the SAME task. Documentation is not an optional final step, and the user must
never have to ask for it.

The implicit workflow of every development prompt in this repository is:

1. Read the relevant existing documentation.
2. Read the relevant current implementation.
3. Implement the requested change.
4. Determine what documentation is affected.
5. Update the relevant `.md` files.
6. Verify documentation consistency with the implementation.
7. Run the relevant tests.
8. Report the documentation changes in the final response.

Before considering a task complete, verify:

1. Did this change modify or introduce an architecture?
2. Did this change modify an existing component/API/contract?
3. Did this change introduce a new reusable pattern?
4. Did this change modify lesson-generation rules?
5. Did this change modify pedagogy or interaction rules?
6. Did this change modify UI/UX conventions?
7. Did this change modify RTL/Arabic rules?
8. Did this change modify exercises, progression, mastery, or student behavior?
9. Did this change modify Classroom Mode?
10. Did this change introduce a new testing requirement?

If YES to any of these, update the appropriate documentation immediately. Even
when the answer appears to be NO, briefly verify that no documentation is
affected before finishing.

- NEVER leave the repository documentation knowingly outdated after a
  meaningful architectural or behavioral change.
- Do not create unnecessary documentation for trivial changes. Use judgment.
- Always use the CURRENT CODE as the source of truth; never document behavior
  that is not actually implemented. Mark planned behavior `Planned` or
  `Not yet implemented`.
- If a new reusable pattern is introduced, document it so future developers
  and AI agents reuse it instead of creating another one-off implementation.
- Prefer updating the existing authoritative document over creating a new
  file. When two documents would define the same contract, one is
  authoritative and the other links to it.
- At the end of every task, include a short **"Documentation Sync"** section
  in the final report stating which `.md` files were updated and what was
  documented — or, if no documentation was required, why the change does not
  affect the documented architecture/contracts.

### Lesson-generation documentation rule

Whenever a task creates, modifies, or establishes a pattern that could be
reused in future lessons — a lesson structure, module pattern, activity
pattern, question type, manipulation or reusable manipulation behaviour,
exercise type, feedback pattern, `KnowledgeBrick` usage, progression
behaviour, Classroom presentation pattern, Arabic/RTL convention, responsive
interaction pattern, or reusable lesson component — the relevant
lesson-development documentation (`docs/lessons/LESSON_DEVELOPMENT_GUIDE.md`
and the contract it points to) MUST be updated in the same task. Future
lesson-generation agents must be able to learn the correct pattern from the
documentation without reverse-engineering old lessons.

## Images — where they may and may not be generated

### Lesson content: drawn in code, never generated

Everything under `apps/web/src/lessons/` — and `manipulations/` above all — is
drawn in code: inline SVG and styled DOM, parameterised by props, unit-tested,
with Arabic as live DOM text. There is not one raster image in the tree, and
that is deliberate.

**Never generate a raster image (`cf-image`, or any diffusion model) for lesson
content.** If a manipulation needs a new visual, extend its SVG. Four reasons:

1. **It must react.** A shelf re-shelves 420 books while the student drags its
   bookend; a player shakes when a full team refuses it. A flat JPG takes no
   props. See the shelf and its hand-drawn books in
   `manipulations/divisibility/DivisorExplorerBooks.jsx`.
2. **Arabic.** Diffusion models mangle Latin text and cannot render RTL Arabic
   at all. Labels like `رفّ ناقص` are DOM text so they stay correct and selectable.
3. **Determinism.** `logic/bookshelf.test.js` asserts on computed geometry.
   Generated output differs every run.
4. **Mathematical truth.** A generated "10 books on a shelf" may show 9 or 11.
   When the drawing *is* the divisibility argument, that is a wrong lesson.

> Le dessin n'est pas une illustration — il se LIT.
> See `docs/architecture/MANIPULATION_CONTRACT.md`.

**People are one shared character, `primitives/KidFigure.jsx`** (owner, 2026-10-14): boys in a hoodie, **girls always in
Islamic dress** (hijab draped over the shoulders + long tunic — no uncovered-hair style exists); the crown sits exactly on the
child's height. Never draw a person locally. Rules and cast: `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` §6 « People are the
platform's CHARACTERS »; the lab visual kit around it: `MANIPULATION_CONTRACT.md` §8ter.

**Every manipulation is built to the LIMIT of what you can produce for Gen Alpha (11–13)** (owner, 2026-10-14, every
generation): a lab that merely works is not done. The quality bar — drawn world, shared kit, physical gestures, visual feedback that
never states the rule, one screen at the tablet and laptop sizes, screenshots reviewed with the eyes — is `docs/architecture/MANIPULATION_DNA.md` §17.
A lab opens on NO title: the context in one or two plain sentences, then ONE direct question naming the goal and the end state (§17.9).

### Marketing and shell surfaces: generation is fine

Homepage hero, OG/social cards, blog headers, empty-state art, print covers —
anything outside `lessons/`.

- **`prompt-to-design`** — preferred. Deterministic, real typography, free, and
  the output is reproducible from a committed script.
- **`cf-image`** — only for photographic or illustrative art, and only when the
  image carries **no Arabic text**.

### Showing the product: real captures, never generated screens

When a marketing page shows what the student does (the `/methode` scroll
journey), it shows the REAL lesson screens, captured by Playwright with a
simulated session — `apps/web/scripts/capture-methode.mjs` (lesson
« التعرّف على قاسم لعدد طبيعي », football lab: 15 players in 3 teams, then 16
and one left out) then `apps/web/scripts/crop-methode.py` →
`apps/web/public/images/methode/lesson/*.webp`. The copy beside each capture
describes only what that lesson really does; if the lesson changes, re-run both
scripts and re-read the story strings (`marketing.json › method.steps.*.story`).
**Since 2026-11-18 the captured module pages no longer exist** (the lesson is v2, its old version deleted): the
captures and `capture-methode.mjs` are out of date until the page is re-captured on the world (plan C2).
The page uses NO generated image at all (owner decision, 2026-10-07): hero and
summit are typographic — simple and professional.

Station 09 « إختبار أولي » (2026-10-08) is a regular station in the third act:
`public/images/methode/lesson/test.webp` is the real module `itqan` of
`qasim-adad-tabii` (the lesson's five-question test). Station 10 « الإتقان » is
the only dark block (trophy, amber): `exercises.webp` is a real exam sheet
(level 1 of the same lesson, `/espace/pratique/<lesson>`), followed by the five
levels. Both captures were taken with a temporary student token from the local
API (`createToken`, deleted afterwards — no script committed) and cropped like
the others. The five level names come from `student.json › practice.levelNames`
and are copied into `marketing.json › method.exercises`. Station 10's copy claims
« 50 تمرينًا في كل درس » (verified: all 74 lessons hold 10 exercises per level)
and « امتحانات BEM من دورة 2007 إلى دورة 2025، أو على منوالها » — the corpus
range, not each lesson's own source (items are labelled « على منوال BEM <année> »
or official).

### OG share cards

`scripts/og-card.py` renders branded share cards with correctly shaped Arabic
(Cairo, via Pillow + raqm). Use it rather than generating cards:

```bash
python3 scripts/og-card.py "عنوان الدرس" --eyebrow "الرياضيات · 4 متوسط" -o card.png
```

The **site-wide** card is `apps/web/public/og-image.png` (1200×630), served
at `https://smarter-academy.com/og-image.png` and named by static `og:*` /
`twitter:*` tags in `apps/web/index.html`. Keep those tags static HTML with an
absolute URL — share crawlers never run React — and keep the PNG under
~300 KB (it is 256-colour for that reason): WhatsApp drops heavier previews.

### The logo

Since 2026-10-21 the brand mark is an **open ring holding an isometric cube** (owner's choice; it replaced the star + figure +
book emblem). Every logo file — `apps/web/public/brand/*`, favicons, PWA icons, `email/logo.png`, `og/smarter-academy.png` —
is generated by `python3 scripts/brand/build-logo.py`; never redraw or re-crop it. Usage rules: `docs/architecture/BRAND.md`.
