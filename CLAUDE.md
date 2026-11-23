# smarter-academy-fr — the French platform, being rebuilt on the DZ core

Mathematics for the French collège (6e, 5e, 4e, 3e), in French, left to right. **This repository is in the middle of a
rebuild: read `docs/FRANCE_REBUILD_PLAN.md` FIRST — it is the programme, the decisions and the progress log.**

| Where | What |
|---|---|
| `apps/web` | the React app (Vite, JSX — no TypeScript). The lesson engine: `src/lessons/common/`. A lesson will live in `src/lessons/college/<grade>/<theme>/<unit>/<lesson>/` — **ONE lesson exists**: `college/3e/nombres_calculs/multiples-et-diviseurs/decomposer-en-facteurs-premiers/` (2026-11-23) |
| `packages/core` | pure logic: the curriculum (`curriculum/fr/`: catalogue, programme, learning net, school calendar), number formats, progress, the practice evaluator |
| `apps/api` | the Laravel API. Tests: `cd apps/api && php8.4 artisan test` (in-memory SQLite) |
| `content/` | exercise banks, class tests, thinking-lab challenges — all EMPTY today |
| `docs/` | `FRANCE_REBUILD_PLAN.md`, the contracts (`docs/architecture/`), the official French texts (`docs/curriculum/officiel/`), the review sheet of the 3e net and the FR↔DZ table (`docs/curriculum/net-3e/`) |

## Where this repository comes from, and what is true today (2026-11-22)

- It was the old French site (still on `main`, commit `0ddfb98`). On 2026-11-22 the branch `rebuild/dz-core` replaced
  the whole tree by the Algerian platform's (`smarter-academy-dz`, `dev` at `7f4cef1c`), which was far ahead, and
  started turning it into the French product. Commit `049380e` holds that import whole: `git show 049380e:<path>`
  reads any Algerian file that was since deleted.
- **Done**: every Algerian lesson, exercise bank, class test, textbook source and the three legacy lesson systems are
  deleted; the tree is the lesson ENGINE and the SHELL around it; the official French texts are filed; **the 3e net
  is live** (`packages/core/curriculum/fr/`: 13 units, 60 lessons — ONE built and `available`, 59 `coming_soon` —, 166 learning points with locked
  ids, 55 programme items + 53 stubs of earlier grades — not yet validated by the owner; 6e, 5e, 4e are empty
  skeletons); `npm run lesson:brief -- <code>` prints what a lesson must teach; the server side of the payment switch
  is built (plan §4ter) — payments are CLOSED by default.
- **Done in the API** (2026-11-22): names in Latin letters, every e-mail and message in French, `Europe/Paris` and a
  Monday–Friday week, euros, the books store off (`BOOKS_ENABLED`), registration closed by default, payments closed
  by default (`PaymentGate`).
- **Done in the web**: the payment switch (`context/PaymentsContext.jsx` — nothing sells and nothing locks while
  closed; the admin's panel « Paiement en ligne »), and `config/features.js`: books, thinking lab, daily challenge,
  compass and the 6e diagnostic are OFF until their French content exists.
- **Done in the web** (2026-11-23): the whole interface is FRENCH, left to right — `i18n/locales/fr/`, `locale.js`
  (`fr-FR`, `Europe/Paris`), the kit's and the worlds' sentences, the tests, the walks' handles, names in Latin
  letters, euros (`utils/money.js`). `src/test/noArabic.test.js` refuses an Arabic character anywhere in `apps/web`
  except the books store (switched off). The routes are French words (`/parent`, `/etablissement/…`,
  `/enseignant/seance/…`, `/espace/enigmes`); the old transliterated paths have NO redirect.
- **Accounts created by a school or a teacher are CLOSED** behind an admin switch (`ManagedAccountsGate`; the admin's
  card « Comptes créés… » on the dashboard; `hooks/useManagedAccounts.js` hides the roster import and the credential
  buttons of the teacher's and the school's spaces while closed, and fails closed).
- **NOT done yet — do not be surprised**: only the FIRST lesson's screens have been seen in a browser (its world, its
  forges, its board, the teacher's memo, the brevet sitting — walked at 1366×768, `apps/web/e2e/lessons/`); the rest of
  the shell (the student's and the teacher's spaces, the admin, the math lab, the public pages) has NOT been seen and
  its walks have not run since the translation; the API has never run on MySQL and no local database exists (the
  lesson walks need none: they double the server in the browser); the math lab's walks still open the hidden lycée
  side; a few comments in `apps/api` and `packages/core` still cite Arabic.
- **The two products are 100% separated** (owner): two repositories, two databases, two deployments, no shared runtime,
  no shared package, no country switch, no locale parameter. This repository holds ONE language.

## Start of a session

1. `docs/FRANCE_REBUILD_PLAN.md` — the status line at its top, §4 (what the current step must leave behind), §7 (what
   waits for the owner), §9 (the log; its first line is a working rule about commits).
2. `docs/README.md` — which document is authoritative for what, and which ones still describe unconverted code.
3. The contract of the area you touch, then the code. Language, register, vocabulary, typography, formats, content
   rules: `docs/architecture/FRENCH_LANGUAGE_CONTRACT.md`. The curriculum: `docs/curriculum/officiel/README.md`.

## The owner's rules — they hold in EVERY task

**The other platform**
- **Never write in `smarter-academy-dz`** (owner, 2026-11-22: « do not touch the dz platform »). Read it freely — it is
  the reference of the engine and the source of a lesson that teaches the same thing. Never use its databases either:
  its local API tests use MySQL `smart_academy_test`; this repository's use in-memory SQLite.

**Git and production**
- Commits and pushes are allowed in this repository (owner, 2026-11-22). Work on `rebuild/dz-core`. **Ask before the
  push that replaces `main`**: `main` deploys to French production. The deploy and publish workflows are skipped unless
  the repository variable `FR_REBUILD_CUTOVER_APPROVED` is `yes` — only the owner sets it.
- While agents share this folder, **every commit names its paths** (`git commit … -- <paths>`): a commit without a
  path list takes what another agent has staged.
- No real user and no real subscriber exists (owner, 2026-11-22): the French database is created fresh; nothing of
  the old site is preserved.

**The curriculum**
- **Lessons and learning points are defined from the official French texts and from nothing else**
  (`docs/curriculum/officiel/`): never a textbook, a tutoring site or the old site's catalogue. What the texts do not
  say is marked `[À VÉRIFIER DANS LE PROGRAMME OFFICIEL]`, never invented.
- **Every lesson is generated from scratch from the learning points of the net.** When the Algerian platform already
  has a lesson that teaches the same learning point, it is reused: brought over by a tool of THIS repository that
  reads the Algerian one and converts it (plan §8). The world, the engine and the kit are always the same.
- A learning-point id (`<grade>_<lessonCode>_P<n>`) is opaque and append-only: never reorder a lesson's points.

**Pedagogy — kept from the Algerian platform, word for word in spirit**
- **The official text says WHAT, never HOW**: own contexts, own numbers, own wording; the platform is independent
  from every textbook and never sends a student to one.
- **Discover, don't be told**: the student acts first; a rule gets its name only after he has it. In a v2 lesson no
  rule is told: each key is FORGED by the student (predict → write his rule → the world tests it on his own evidence
  → seal → use → only then its name). The verdict is what the world does, never « faux ».
- **Show your limit**: a lesson that merely works is not done.
- **A class test never changes a student's progress.** Only exam-format first tries are evidence, and the SERVER
  re-computes their verdict. A student's private answers are never read by a teacher, a school or a parent.

**Content and culture** — `FRENCH_LANGUAGE_CONTRACT.md` §9; several lines wait for the owner (plan §7). Until he
answers: neutral everyday French contexts, euros, no religion, no brand, no betting; a die or an urn is an experiment.
- **Lesson content is drawn in code, never a generated image**: inline SVG and styled DOM, text as live DOM text. It
  must react to the student, be exact, and be testable. Generated images are for marketing surfaces only.

**Screens and writing**
- **ONE screen size: 1366×768, alone** (owner, 2026-11-19, kept). A lesson is built, walked and looked at at that
  size. Phones are paused.
- Nothing scrolls in a world; no back-and-forth: what a question asks the student to look at is on its screen.
- A typed answer is entered in its own shape; a formula never breaks across two lines. LaTeX in an ordinary JS string
  takes TWO backslashes.
- Shapes are the brand blue (`nav-accent`), never black; dark ink is for text. A card is four lines at most.

**Who does what, and the limits of this machine**
- **Fable orchestrates, Opus codes**: the main session designs, briefs the agents, reviews what they return, runs the
  checks and reports. Agents write the code — except a task judged complicated.
- Agents that write at the same time own files that do not overlap; each brief says which.
- **ONE heavy check at a time** (the web suite, a build, lint, a walk): the machine has 13 GB. Agents run only the
  tests of what they touched, with `--maxWorkers=2`.
- **A test is deleted only when the thing it tested is deleted.** Never weaken an assertion, never skip.
- **Report honestly**: what failed, what was not checked, what you are unsure of. An agent's report is not a fact:
  re-run its numbers before committing.

## The lesson engine

A v2 lesson is **content plus, at most once per unit, one world mechanic**:
- the kit `apps/web/src/lessons/common/gameworld/kit/` (screens, the world runtime, the rule forge, the exam sitting,
  the trainer) names no lesson and no world; a world `gameworld/<world>/` is a mechanic (`divisorIsles`, `rootCourts`,
  `missionIsle`); a lesson's content is in ITS folder and declared in ITS `lesson.pack.js` — no list elsewhere names a
  lesson. After writing a pack: `npm run generate:lesson-index`.
- a lesson's `routes.jsx` calls `buildLessonRoutes` of `lessons/common/lessonRoutes.jsx`; its `index.jsx` renders
  `lessons/common/components/LessonIndex.jsx`.
- around it: the launch kit (`launchkit/`, its families are empty), the lesson lab (`lessonlab/`, 15 instruments with
  no lesson tag), the class session (`features/classSession/`), the practice engine and the exam sheet.
- Contracts: `LESSON_V2.md`, `GAME_WORLD.md`, `LAUNCH_KIT.md`, `LESSON_LAB.md`, `CLASS_SESSION.md`,
  `EXERCISE_CONTRACT.md`, `LEARNING_NET.md` — imported from the Algerian platform and corrected for this tree.
- `.claude/skills/lesson-v2/` is the FRENCH skill (2026-11-23): its first stage is « Port before you build » — what
  the Algerian platform already has for the same learning points is ported and adapted, only the rest is built. Its
  table of trusted screens is empty: the first French lesson walks every screen.

## Checks

| Command | What it guards |
|---|---|
| `npm test` — or `npx vitest run` in `packages/core`, `apps/web`, `--dir scripts` at the root | unit tests |
| `cd apps/api && php8.4 artisan test` | the API, on in-memory SQLite. 8 tests need MySQL and do not pass there: `DbBackupCommandTest` ×6, `MathLabFileFlowTest::test_l_ajout_verrouille…`, `PracticeEvidenceConvergenceTest::test_there_is_no_second_mastery_table` — NOT confirmed on MySQL |
| `npm run lint` | ESLint on the tree |
| `npm run check:unreached` | no dead file. Its `KEPT` list names the files of the lesson path that no lesson mounts yet: each line leaves when the first lesson reaches it |
| `npm run check:unused` | unused exports and i18n keys; its baseline only SHRINKS |
| `npm run check:format` | Prettier on the listed areas |
| `npm run check:lessons` | the validators, the generated indexes, the net, the calendar (which passes while saying the French year is not written), the entry budget (212 KB gzip) |
| `E2E_BASE=http://localhost:<port> E2E_SIZE=1366x768 node apps/web/e2e/lesson.mjs <lesson> all <outDir>` (then `sitting`, alone) | a lesson's walks at 1366×768, on a running `vite` of this tree — green for `decomposer-en-facteurs-premiers`. The shell's walks (`node apps/web/e2e/<walk>.mjs`) were rewritten for French and NOT run; `_phase6-activation.mjs` and `access-limits.mjs` fail while payments are closed |

Generators: `generate:lesson-index`, `generate:lab-order`, `generate:learning-net`, `generate:compass-index`,
`generate:lp-lock` (after APPENDING a learning point; it refuses a reorder on a built lesson).
`check:activation-drift` needs a local database; this folder has none yet.

## Documentation — part of every task

A change that makes a document false corrects that document in the SAME task: an architecture, a contract, a reusable
pattern, a rule of lesson generation, a convention of the interface, a new check. The CURRENT CODE is the source of
truth: never document what is not implemented; mark it `Planned`. Prefer correcting the authoritative document over
adding a file. End every task's report with which documents changed, or why none had to.
`docs/FRANCE_REBUILD_PLAN.md` §9 gets a line for every step finished.

## The brand

The mark is an open ring holding an isometric cube; every logo file is generated by
`python3 scripts/brand/build-logo.py` — never redrawn. Whether France keeps this mark or the old site's logo and
colours is an open decision (plan §7, 8). Rules: `docs/architecture/BRAND.md`.
