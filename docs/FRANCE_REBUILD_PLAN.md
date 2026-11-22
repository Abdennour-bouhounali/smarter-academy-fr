# France rebuild plan — the French platform rebuilt on the DZ core

**Status: Stage 0 done; step 1A (baseline) partly done — unit suites run, the checks and the MySQL run of the API suite
are still owed (2026-11-22). Nothing is committed and nothing is deployed. The progress log is §9.**

This folder is the French platform being rebuilt from the Algerian one. It is the mirror image of
`docs/ALGERIA_PLATFORM_MASTER_SPEC.md` (how DZ was made from FR in September 2026), and that spec's rule still binds:
two products, two repositories, two deployments, two databases, no shared runtime, no country switch.

| | |
|---|---|
| Work branch | `rebuild/dz-core` of the FR repository, in the folder `smarter-academy-fr-next` |
| Source | DZ `dev` at `7f4cef1c9b55ac900a461cd0938fe363bd1872bf` (2026-11-22), imported with `git archive` — 14,978 files |
| Old FR | untouched on `main` (`0ddfb98`, 2026-09-17), still in production; its files are read with `git show main:<path>` |
| Production | LOCKED: `deploy.yml` and `publish-content.yml` are skipped unless the repository variable `FR_REBUILD_CUTOVER_APPROVED` is `yes` |

## 1. What was measured before planning (2026-11-22)

- DZ was copied from FR on 2026-09-14; no shared git history. DZ: 5,831 web files, 143 migrations, 383 API routes,
  ~1,430 backend tests. FR: 2,882 web files, 49 migrations, 83 routes, ~591 backend tests.
- **FR's database schema is a strict subset of DZ's**: all 49 FR migrations exist in DZ under the same file names (one
  differs; reported as a MySQL guard only). DZ adds 94 migrations and about 78 tables.
- **Stripe is still in DZ**, unchanged and unused (`Domain/Billing/*`; only `PlanCatalog.php` differs).
- FR today: 132 lessons on the old module architecture (23 in 3e), one Stripe plan (35 €/year), Google sign-in, three
  legal pages, no teacher, parent or school space, no exercise bank for collège, no learning net.
- DZ's shell text: ~11,300 strings in 18 i18n files (Arabic only) plus ~1,300 hardcoded lines in ~154 files. The v2
  lesson engine (`lessons/common/gameworld/`) has NO i18n: ~400 Arabic lines in the kit, ~600 in two worlds, Arabic
  grammar helpers, `dir="rtl"` hardcoded in ~25 files, some SVG layouts placed right to left by hand.
- Legacy lesson systems FR will never use: `lessons/common/manipulations/` (208,000 lines), the old module-lesson kit,
  the mission player, `i18n/locales/ar/lesson.manipulation.json` (2 MB).
- ~170 unit-test files and ~234 walks assert Arabic text; a few contract tests fail if French appears.

### Traps if this tree ran on the French database as it is

| Trap | Where | Stage that removes it |
|---|---|---|
| Deletes every student report, its notes and files | migration `2026_10_05_000002_reset_reports_and_add_screenshot.php` | 1G |
| Every grade closed | `grades.is_active` default false + `curriculum.enforce_active_grades` | 2 |
| Registration closed | `REGISTRATION_OPEN` default false | 1G |
| A name in Latin letters is refused | `utils/personName.js`, `Domain/Identity/PersonName.php` | 1E |
| Every e-mail in Arabic, right to left | `User::preferredLocale()`, `resources/views/emails`, `lang/ar.json` | 1E |
| Books store reachable with no switch | `routes/api.php` books groups | 1F |
| Dinars, Algiers time, Friday skipped | `plan_prices`, `config/{daily_challenge,madar,thinking_lab,family,classroom}.php` | 1E |
| Old lessons, learning points and progress of real students | curriculum import + prune commands | 2E (retire, never delete) |
| FR production has always been migrated by hand (phpMyAdmin); this deploy runs `migrate --force` | `deploy.yml` | 6 |

## 2. Decisions taken with the council (2026-11-22)

**How FR is rebuilt.** Three voices and the main session, on: replace and translate in place / a file boundary first /
port feature by feature.
- Porting features into the old FR code is rejected by all four.
- FR takes DZ's tree and drops the legacy lesson systems on day one.
- A FILE boundary between engine and language is drawn ONLY on the path a v2 lesson runs through: the kit, the worlds,
  the missions, the launch kit, the lab, the class board. The rest of the shell is translated through its i18n files
  (they already are the boundary) and its hardcoded text is moved into them.
- The boundary is built and proven HERE first (one French lesson rendering left to right), then offered to DZ as its
  own change, in a freeze window the owner chooses. Reason (the critic): drawn before a second user exists, it would be
  wrong in places. Cost accepted: DZ's kit keeps moving meanwhile; the pinned commit above is the diff base.
- It is not a multi-country architecture: no runtime switch, no shared package. Each repository holds ONE language.
- The cutover is the dangerous part under any strategy and is its own track (§6).

**How a lesson is identified and moved between the platforms.**
- No neutral concept registry: one FR↔DZ table, kept in each repository.
- Learning-point ids are OPAQUE and APPEND-ONLY, with a lock file and a test that fails on a reorder — before any table.
  (Today they are positional `P<n>` on both sides; DZ's catalogue and configs already disagree for 35 lessons.)
- The French net is built from the official French programme FIRST. Where a French teaching unit coincides with a DZ
  lesson, the same cut is the tie-breaker — never the driver (two voices against forcing DZ's grain onto 3e).
- What travels is the mechanics: world, forges, experiments, point mapping, with its origin, source hash and kit version.
  The 50-exercise bank and the class test are rebuilt on each side (BEM sheets are not brevet sheets).
- « Automatic » = an automatic DRAFT for review, never an automatic publication.
- Two or three lessons are ported by hand before any transfer tool is written; DZ→FR first.
- A lesson is named in ~45 files outside its folder; a manifest per lesson that generates those registrations is the
  prerequisite of any automatic import.

## 3. Stage 0 — safety (done)

- [x] Work branch in its own folder; old FR checkout and `main` untouched.
- [x] DZ tree imported at the pinned commit; no secret in the import (checked: only `.env.example` and deployment SQL docs).
- [x] Deploy and publish workflows locked.
- [ ] Owner: number of active subscribers (Stripe dashboard) and a real copy of the production database for §6.

Never copied into this folder: `apps/api/.env*` of FR, the deploy zips, the SQL dump, `public/CV.pdf`.

## 4. Stage 1 — the core (nothing about programme, grades, lessons)

Order matters: each step keeps the checks runnable.

| Step | What | Done when |
|---|---|---|
| 1A | Baseline: install, and run the suites on the imported tree AS IT IS (Arabic) — the reference every later step is compared to | core, web, scripts and API suites run; their numbers written in §9 |
| 1B | Prune what FR never runs: the 126 legacy DZ lessons, `manipulations/`, the old lesson kit, the mission player, `lesson.manipulation.json`, DZ textbook sources and exam PDFs, DZ marketing captures. The 14 v2 DZ lessons stay parked as fixtures of the engine until §8 replaces them | `check:unreached`, lint and the suites pass on what is left |
| 1C | The engine boundary: every sentence of `gameworld/` (kit `text.js` and the `L` tables, world `strings.js` and `cases.js`, `MissionRunner`), the grammar helpers (`authoring/numbers.js`), the direction (`dir`, CSS, canvas), the hand-placed right-to-left layouts — behind files of one folder per language | the Arabic fixtures still pass unchanged; a French fixture lesson on `rootCourts` is walked at 1366×768 and looked at |
| 1D | The shell in French: glossary first (register: « tu » for students, « vous » for adults; the word for « الكفاءة »), then the 18 namespaces, then the hardcoded text of `classSession`, practice, unit pages moved into i18n; plural families reduced to French forms | no Arabic character left outside the parked fixtures (a check enforces it) |
| 1E | The country layer: left to right, Latin names, euro, `fr-FR` dates and numbers, `Europe/Paris`, the school week, fonts, French e-mails, legal pages carried from `main` and updated for the new features, SEO for `smarter-academy.fr`, brand | registration, login, e-mail, profile walked in French |
| 1F | Payment and switches: Stripe pages (`/tarifs`, `/abonnement`, `/abonnement/retour`) re-attached to DZ's plan system in EUR; books OFF in the front end AND on the server (a flag — today there is none); content-bound features hidden until their French content exists | the Stripe tests pass on the new registration and access rules; a books request is refused |
| 1G | Backend for France: the reports migration made schema-only, registration open, `/contact` route, deploy guard inverted (refuse a DZ domain) | API suite passes |
| 1H | Contract tests and walks rewritten for French (they must assert French and forbid Arabic) | `lint`, `check:unused`, `check:unreached`, `check:format`, `check:lessons`, `npm test`, API suite: all pass |
| 1I | `CLAUDE.md`, `docs/README.md` and the contracts rewritten for this product; DZ-only docs deleted | a new session can start from `CLAUDE.md` alone |

### 4bis. Step 1B in detail — « the empty French house » (contract of every agent of this step)

The owner, 2026-11-22: « imagine the FR platform does not exist … no real user or subscriber exists yet … no lesson
exists, they will be generated from scratch based on the learning points of the net ». So nothing of DZ's content is
kept as a fixture and nothing of old FR is preserved: after 1B the tree is the ENGINE and the SHELL around an EMPTY
French catalogue. A thing that only served a deleted lesson is deleted too, with its tests, in the same step.

**The curriculum data** — same data MODEL as DZ (`docs/architecture/LEARNING_NET.md`), new names, no content yet:

| DZ | Here |
|---|---|
| `packages/core/curriculum/dz/` | `packages/core/curriculum/fr/` |
| level `moyen` | level `college` (« Collège ») |
| grades `1am`, `2am`, `3am`, `4am` | `6e`, `5e`, `4e`, `3e` — in that order; `terminale_dz` is removed |
| `net/official_programme_moyen.json`, `net/learning_net_moyen.json` | `net/official_programme_college.json`, `net/learning_net_college.json` |
| `programme_<g>_2026_2027.json`, `lessons_…`, `units_…`, `calendar/progression_…` | same names with the French grade |
| keys `titleAr`, `textAr`, `partsAr`, `subtitleAr`, `objectivesAr`, `prerequisitesAr`, `addedValueAr`, `noteAr`, `labelAr`, `officialAr`, `namedPartsAr`, `namedMethodsAr`, `captionAr`, `levelLabelAr`, `gradeLabelAr` | the same key WITHOUT `Ar` (`title`, `text`, …), in the data and in every reader |
| function and export names in `Dz` / `dz` (`buildDzLesson`, `dzCourseLevels`, `DZ_UNIT_PATH_SEGMENT`…) | neutral names (`buildLesson`, `allCourseLevels`, `UNIT_PATH_SEGMENT`…) |

Content of the skeleton: the four grades; for each, its domains = the five thèmes of the cycle 4 programme
(`nombres_calculs` « Nombres et calculs », `organisation_gestion_donnees_fonctions` « Organisation et gestion de
données, fonctions », `grandeurs_mesures` « Grandeurs et mesures », `espace_geometrie` « Espace et géométrie »,
`algorithmique_programmation` « Algorithmique et programmation »), marked `verified: false` (6e belongs to cycle 3 —
Stage 2 corrects it from the official text); NO topic, NO unit, NO lesson, NO programme item, NO link, NO thread; the
calendar file keeps its shape with an empty list of weeks and events (Stage 2D writes the French year). Every grade
has `curriculumStatus: 'lessons_planned'`.

**What must keep working on the empty catalogue**: the app builds and starts; a student can register, choose a grade
and sees an honest « no lesson yet » state (never a crash, never an empty page); the teacher, parent, school and admin
spaces open; every generator runs and writes an empty index; every check of `package.json` passes or is deleted with
the thing it guarded.

**Deleted in 1B** (with their tests, walks, scripts, docs and i18n keys): every DZ lesson, bank, class test and
textbook source (done, 10,483 files); then whatever `check:unreached` reports once no lesson mounts — expected: the
legacy lab system `lessons/common/manipulations/`, the old module-lesson kit `lessons/common/kit/`, the mission player
`lessons/common/mission/`, `i18n/locales/ar/lesson.manipulation.json`, the textbook layer (`textbookPages.js`,
`check:textbook`, `lessons/common/textbook/`), `manipulationTypes.js` / `manipulationLevels.js` if nothing reads them;
the per-lesson walks of `apps/web/e2e/` (the walk LIBRARY `e2e/lib/` stays); `scripts/practice-oracle/<lesson>.mjs`
(the oracle's engine stays); the DZ thinking-lab challenges and compass index content; the 16 migrations that only
remap DZ lesson codes are NOT deleted (a migration history is never rewritten) — they do nothing on a French database.

**Kept, untouched in 1B**: the v2 engine `lessons/common/gameworld/` (kit, the three worlds, missions), `launchkit/`,
`lessonlab/`, `features/classSession/`, the practice engine and the exam sheet, the math lab, the thinking-lab ENGINE,
the compass ENGINE, the games space, every space of the shell, the whole API. They still speak Arabic and still read
right to left: that is steps 1C–1E, not this one. A test of a kept thing that used a DZ lesson as its example gets a
small neutral fixture of its own (in the test's folder), never a real lesson.

**Rules of the step**: DZ's repository is never touched (owner, 2026-11-22 — read it, never write it). One heavy
check at a time on this machine; an agent runs only the tests of what it touched, with `--maxWorkers=2`. No test is
weakened to pass: a test is deleted only when the thing it tested is deleted, and the report names every deleted test
file and why.

**Done in `packages/core` (2026-11-22) — the names every other area must now use:**

| Was | Is |
|---|---|
| `@smarter-academy/core/curriculum/dz/net/learningNet.js`, `…/dz/calendar/schoolCalendar.js`, any `curriculum/dz/…` path | the same path under `curriculum/fr/…`; data files as in the table above |
| `dzCourseLevels`, `DZ_UNIT_PATH_SEGMENT`, `buildDzUnitPath` | `allCourseLevels`, `UNIT_PATH_SEGMENT`, `buildUnitPath` |
| `formatTextbookPages` (and `textbookPages.js`) | deleted |
| `ACTIVE_GRADE_IDS`, `schoolCalendar.GRADES` | `['6e','5e','4e','3e']`; `learningNet.WEIGHTED_GRADES` is `[]` until Stage 2 weights 3e |
| every `…Ar` key in the data and in what the resolvers return (`describeLesson().titleAr`, `describeItem().textAr`, `noRebuildForLesson().addedValueAr`/`.noteAr`, `scope.itemInfo().textAr`, `homeLesson.titleAr`) | the key without `Ar` |
| `MODULE_LAYOUT_MIGRATIONS` (74 DZ entries) | `{}` |
| catalogue grade | gains `shortName` (« 6e »…) |

New, for tests that need content: `buildCourseLevels(gradeSources)` is exported, `createLearningNet({ programme, net, lessonFiles, unitFiles, weightedGrades })`, and `scope.js` / `moduleLayoutMigrations.js` functions take an optional net / table — a test builds a 2–3 item neutral fixture in its own file, never real curriculum content. The shipped school year is EMPTY (`start`/`end` null) and `validateSchoolYear` refuses it on purpose until Stage 2D. The catalogue builder still hides a thème that has no lesson, so every grade exports `chapters: []` today.

### 4ter. The payment switch (owner, 2026-11-22) — part of step 1F

The owner: « in the fr platform I must be able to toggle this: open or close the online payment … when I develop the
platform to the best version I will open the activity to be able to receive money from the platform ». France starts
with payments CLOSED: the platform is free, takes no money by any path, and shows nothing that sells.

One authority, built like the registration switch (`Domain/Registration/RegistrationGate`):
`app/Domain/Billing/PaymentGate.php`, the ONLY reader of `config/billing.php › payments.open` (env `PAYMENTS_OPEN`,
default **false**), overridden by the administrator's row `payments` of `platform_settings`.

| While payments are CLOSED | |
|---|---|
| Starting a payment | refused by the SERVER: `POST /billing/checkout`, a subscription request, a plan quote → 403 `payments_closed`. Hiding a button is never the protection |
| What is shown | `GET /billing/status` (public) says `open: false`; the plans list is empty; the web shows no price, no « Premium », no lock, no pricing page, no subscription page |
| Access | nobody is locked by a tier, a plan or a paid limit: every account has full access (a paywall nobody can pay is a dead end). `/me/access` says why (`payments_closed`) |
| Never blocked, open or closed | a provider's webhook (an event is never refused); cancelling or managing a subscription that exists; redeeming an activation code (a grant by the administrator, not a payment) |
| The administrator | `GET` / `PATCH /admin/payments` — the switch, written in the activity log with the old and the new value. Opening is refused with `payments_not_configured` while Stripe has no secret or no price: an open switch on a broken checkout is worse than a closed one |

Opening the switch restores the tiers, the plans and the limits exactly as they are configured — nothing is lost
while it is closed. The legal pages and the public copy say what is true at the time: free while closed.

Culture rules for French content replace DZ's (owner to confirm, §7): neutral secular everyday French contexts, euros,
French first names, characters in ordinary clothes; the independence from the textbook, « discover, don't be told »,
drawn-in-code and the one screen size 1366×768 are kept as they are.

## 5. Stage 2 — the curriculum

| Step | What |
|---|---|
| 2A | Sources — DONE 2026-11-22: `docs/curriculum/officiel/` (its `README.md` says which text applies to which grade and year, with the proving quotes). In short: **3e = the 2020 cycle 4 programme until 2027-28, the NEW programme of 2026 from 2028-29; 4e = 2020 this year, new from 2027-28; 5e = new since September 2026; 6e = the 2025 cycle 3 programme.** 3e is defined from the 2020 text + its repères annuels de progression + its attendus de fin d'année, read against the 2026 text so that a lesson survives 2028 (`officiel/OUTLINE_3e.md`). 5e and 6e are defined directly on their new texts; 4e on the new text (it applies from next year). The brevet from the 2027 session: 2 h, part 1 automatisms without calculator (6 points, 20 min), part 2 problems (14 points). FR's old `smarter_academy_programmes_maths_2026.json` is NOT a source: it adds inequations, vectors, quartiles and omits « Grandeurs et mesures » |
| 2B | Grade ladder: `6e`, `5e`, `4e`, `3e` (ids kept — they are in the production database). `activeGrades.js`, the loader globs, `check-dormant-isolation` inverted |
| 2C | Per grade, in DZ's data model (`packages/core/curriculum/fr/`): programme items with stable ids, domains (thèmes A–E), units, lessons, learning points (opaque ids + lock), links `requires` / `extends` / `consolidates`, weights `core` / `support` (3e first), threads |
| 2D | The French school calendar 2026-2027 (three zones, trimestres) and the progression by week |
| 2E | Every lesson `coming_soon`. The old FR lessons leave the tree (they stay in git on `main`); their learning points are RETIRED in the database, never deleted — a student's history stays |
| 2F | The FR↔DZ table: a row per pair of lessons, the pairs of points inside, typed `same` / `same maths, other method` / `partial` |
| 2G | The exercise bank's contract for France: the brevet sheet, levels, « sur le modèle du DNB », euros |

First alignment (titles only, to be redone on the real net): DZ 4AM matches 3e on divisors, square roots, literal
calculation, product-zero equations, linear and affine functions, Thales, trigonometry, statistics; DZ 3AM matches on
Pythagoras, powers, rationals. DZ-only: PGCD algorithms, systems, vector coordinates, rotation. FR-only: probabilities,
prime factorisation, algorithmics, ratio, homothety.

Gate: the owner validates the 3e lesson list and its net.

## 6. Going live — simplified by the owner on 2026-11-22

The owner: « imagine the FR platform does not exist … no real user or subscriber exists yet ». So there is no
production data to carry and no migration rehearsal: the French database is created FRESH from this tree's migrations.
What is left of this track:

1. The branch replaces `main` when the rebuilt platform is coherent (core in French, catalogue defined, at least the
   first 3e lessons) — the owner allowed commits and pushes in the FR repository; the main session pushes the WORK
   BRANCH and asks before the push that replaces `main`.
2. A fresh database on the server (the old one dropped or renamed by the owner), then the deploy with
   `FR_REBUILD_CUTOVER_APPROVED=yes`, a smoke test, and one real Stripe test payment.
3. Old FR stays reachable in git on the last commit of today's `main` (`0ddfb98`).

## 7. Open — the owner decides (defaults in use until then)

| # | Question | Default in use |
|---|---|---|
| 1 | When does old FR leave production? | ANSWERED 2026-11-22: no real user exists; see §6 |
| 2 | May the engine boundary go into DZ, and when? | ANSWERED 2026-11-22: « do not touch the dz platform ». The boundary lives here only; a DZ lesson is brought over by a tool of THIS repository that reads DZ and converts (§8) |
| 3 | Which DZ features does France get? | all, books off; thinking lab, compass, daily challenge hidden until French content exists |
| 4 | Minors' data in France (parent link, teacher-made accounts, school space, push, answer photos) | features kept; privacy policy to be rewritten and read by a lawyer before they go live |
| 5 | Price; « 1 mois offert » is advertised and not implemented | PARTLY ANSWERED 2026-11-22: payments start CLOSED behind a switch (§4ter) — nothing is sold or priced in public until the owner opens it. The price and the trial are decided when he opens it; 35 €/year stays configured meanwhile |
| 6 | Lycée | not carried; « 6e à Terminale » leaves the copy |
| 7 | Culture rules; dice, coins, urns in probabilities (brevet material) | allowed as experiments, never betting |
| 8 | Brand: DZ's ring-and-cube or FR's current logo | DZ's mark |
| 9 | Commits on this branch | ANSWERED 2026-11-22: commits and pushes are allowed in the FR repository |

## 8. Stage 3 — the 3e lessons

1. By hand: « racine carrée » from `jidhr-tarbii` on `rootCourts`, then a divisors lesson on `divisorIsles` — to learn
   what a transfer really is.
2. The transfer tool (export a bundle with its provenance; import as a draft; ids rewritten from the table).
3. Every 3e lesson, in the French progression's order: the table says `same` → import and adapt; otherwise generate with
   the lesson-v2 pipeline (`.claude/skills/lesson-v2/`, to be adapted) — the brevet bank first, then design, waves,
   walks at 1366×768, screenshots looked at, the skill written back. A new world only when a unit needs a new mechanic.

## 8bis. Known debts found on the way — each must be settled before the step named

| Debt | Found | Settle before |
|---|---|---|
| `validate-lessons.mjs`, `audit-knowledge-dependencies.mjs` and `lesson-v2-status.mjs` recognise a v2 lesson by the text `retiredModules: true` in its `routes.jsx`; `buildLessonRoutes` no longer takes that option — the first French lesson would be judged a module lesson | docs pass, 2026-11-22 | the first French lesson (§8) |
| `check:non-blocking` and `audit:knowledge:gate` look for patterns only a module lesson had: they pass on any tree. Delete them or re-aim them at the v2 lesson | docs pass | the first French lesson |
| The 6e diagnostic is reachable (`ChooseGrade` sends a new 6e student to it) and recommends lessons that do not exist | docs pass | step 1F (hide what has no French content) |
| The daily challenge, the thinking lab and the compass are not hidden yet although they have no French content | docs pass | step 1F |
| The teacher's lesson memo page (`/enseignant/cours/:lessonId/memoire`) reads module-lesson files a v2 lesson does not have; `teacher_lab_settings` (API) has no web caller; nothing calls `POST /lessons/{code}/evidence` | docs pass | step 1H (dead code of the shell) |
| The API still reads `content/class-tests/`; the web guard that checked a default class test's answers was deleted with the Algerian tests | docs pass | the first French class test |
| `.claude/skills/lesson-v2/` tells agents to read deleted Algerian documents | docs pass | §8 (the skill is adapted first) |
| `deploy.yml` still refuses a `.fr` domain (the Algerian guard) | docs pass | step 1G |
| Code comments cite deleted documents (about 80 places in `apps/api`, `apps/web/src`, `scripts`) | docs pass | with each file's next change |
| The thinking-lab leak detector treats Latin letters as mathematics: on French prose a formula is caught only after a colon or `=` | tooling pass | the first French challenge |
| 15 `[NOT CHECKED 2026-11-22]` marks in the corrected contracts | docs pass | when the area is next touched |

## 9. Progress log

Working rule learned on 2026-11-22: while agents share this folder, **every commit names its paths**
(`git commit … -- <paths>`). A commit without a path list takes whatever another agent has staged with `git rm`
(it happened once: commit `08dcb413` carries the web agent's first deletions; its message says so).

| Date | Step | What happened |
|---|---|---|
| 2026-11-22 | 1B | **The empty French house.** The owner: no real user exists, no lesson is kept, DZ is never touched, commits and pushes are allowed here. Deleted: 140 DZ lessons, their banks, class tests and textbook sources (10,483 files). `packages/core`: the curriculum is an empty French skeleton, 6e–3e (74 test files, 1,581 tests pass). `apps/api`: French grade ladder, tests on neutral fixtures under `apps/api/tests/Fixtures/content` (1,506 tests, 1,497 pass, the same 8 MySQL-only tests as the baseline do not; no migration touched). Tooling: every check and generator runs on the empty catalogue, `check-dormant-isolation` inverted, 139 per-lesson oracles / 46 Arabic challenges / 193 lesson walks deleted (scripts tests: 97 pass). Web: in progress. Known and left for later: `check:activation-drift` cannot run without a local database; the thinking-lab leak detector is weaker on French prose (a formula is caught only after a colon or `=`); the exporter's « no tier » invariant has no lesson to be tested on |
| 2026-11-22 | 2A | Official sources fetched and filed: `docs/curriculum/officiel/` |
| 2026-11-22 | 1D (prep) | `docs/architecture/FRENCH_LANGUAGE_CONTRACT.md` written before any translation |
| 2026-11-22 | survey | five read-only surveys (RTL coupling, backend diff, curriculum model, engine portability, FR inventory), two councils |
| 2026-11-22 | 0 | branch, import of DZ `7f4cef1c`, workflows locked; nothing committed |
| 2026-11-22 | 1A | Baseline of the imported tree, unmodified (Arabic). `packages/core`: 76 files, 1,577 tests pass (16 s). `scripts`: 9 files, 22,641 pass (15 s). `apps/web`: 1,166 files, 19,452 pass (200 s, 4 workers). `apps/api` on the tracked `phpunit.xml` (in-memory SQLite): 1,503 tests, 1,494 pass, 1 skipped, **8 do not pass** — `DbBackupCommandTest` ×6, `MathLabFileFlowTest::test_l_ajout_verrouille…` (row lock), `PracticeEvidenceConvergenceTest::test_there_is_no_second_mastery_table` (`SHOW TABLES` is not SQLite). Read as MySQL-only tests — NOT confirmed: DZ and CI run this suite on MySQL. Checks: `check:unreached` ✅ (4,938 files reached), `check:unused` ✅ (web and API), `check:format` ✅, `check:learning-net` ✅, `check:year-calendar` ✅, `check:compass-index` ✅, `check:entry-budget` ✅ (203.9 KB gzip ≤ 212). **`check:textbook` ❌ — 3 lines on `hisab-judhur` (`prep` and `qcm` of `jidhr-tarbii`, `ex-31` of `natiqa-ghayr-natiqa`); the SAME 3 lines fail in DZ `dev` at `7f4cef1c` (run there the same day): a DZ defect carried by the import, and it stops `check:lessons` before its last five checks, which were run one by one.** `check:activation-drift` not run: it needs a local database, and this folder has none yet. **Still owed for 1A**: a local database for this folder (its own — never DZ's `smart_academy_test`), the API suite on MySQL, `check:activation-drift`, `npm run lint` (6 GB heap: not run while another session was working in DZ), and one walk |
