# France rebuild plan — the French platform rebuilt on the DZ core

**Update 2026-11-26: FIVE French lessons are built and `available` (3e « Multiples et diviseurs » complete with `fraction-irreductible` and `multiples-et-diviseurs-communs`, plus `thales-configuration-papillon`; §9). The paragraph below is the status of 2026-11-23.**

**Status (2026-11-23, evening): the FIRST French lesson is built, walked and looked at — 3e « Décomposer un nombre
en facteurs premiers » on `divisor-isles` (§9). Stage 1 is done except what needs eyes: the API and the whole web
interface speak French; payments, registration and accounts created by a school or a teacher are each CLOSED behind an
admin switch; the math lab shows the collège only; 59 lessons are announced (« bientôt »). NEXT: the owner PLAYS
lesson 1 (his remarks go to `play.md`); then lesson 2 « Trouver le PGCD de deux nombres », which really ports from
three DZ lessons; the shell seen in a browser (only the lesson's screens have been). **DEPLOYED to smarter-academy.fr on 2026-11-23** (`main` = `3a72c5fc`, onto the existing database; §9). Owed: the shell's walks, the API suite on MySQL, a local database,
the owner's validation of the 3e net. The progress log is §9.**

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
| The administrator | `GET` / `PATCH /admin/payments/switch` (`/admin/payments` is the list of payments received) — the switch, written in the activity log with the old and the new value. Opening is refused with `payments_not_configured` while Stripe has no secret, no webhook secret or no price: an open switch on a broken checkout is worse than a closed one |

Opening the switch restores the tiers, the plans and the limits exactly as they are configured — nothing is lost
while it is closed. The legal pages and the public copy say what is true at the time: free while closed.

**Built in the API on 2026-11-22** (`PaymentGate`, 22 tests in `tests/Feature/PaymentGateTest.php`). How it is wired:
the access layer may not import Billing (`PaymentProviderBoundaryTest`), so it reads the neutral interface
`Domain\Access\PaidAccessSwitch`, which `PaymentGate` implements. The authorities that answer « full access,
reason `payments_closed` » while closed: `EntitlementService::decide` (content tiers), `FeatureAccessService`
(feature limits — a closed platform gets the premium column; a feature the admin switched off stays off),
`PlanEntitlementResolver` (a teacher's seats, classes, class size, allowed grades), `SchoolCapacityService` (a
licence's seats). A real entitlement keeps its own reason. Choices made there, open to the owner: a VISITOR with no
account also reads what would be premium (« no tier » read literally — one line to require an account instead); the
class daily challenge still draws free questions only; real Stripe was never contacted — « configured » is judged
from the configuration alone. **The web side is built too** (2026-11-22): `context/PaymentsContext.jsx` reads
`/billing/status` once and fails closed; the admin's panel « Paiement en ligne » sits beside the registration switch.

### 4quater. Steps 1C–1D in detail — the web in French (the brief shared by every agent of the campaign)

Measured on 2026-11-22: 10,936 strings in the 18 namespaces of `apps/web/src/i18n/locales/ar/`; about 2,560 lines of
Arabic written in 224 source files; 211 test files that assert Arabic. After the campaign the web holds NO Arabic.

**The authority is `docs/architecture/FRENCH_LANGUAGE_CONTRACT.md`** — read it whole before writing a word: who is
spoken to (« tu » to a student, « vous » to adults), the vocabulary table (ONE French word per thing — use its words
and no other), typography, numbers, money, dates, plurals, mathematical writing, direction, content rules.

**Rules of the campaign**
1. **Rewrite, never translate word for word.** A string is rewritten from what it must do on its screen; read the
   component that renders it when the Arabic alone does not say. A mathematical term is the French programme's. A
   context that is Algerian is replaced by its French counterpart or removed.
2. **Keys never change.** A JSON keeps its file name, its keys, their order and its interpolation variables
   (`{{count}}`, `<1>…</1>`) exactly. The folder stays `locales/ar/` during the campaign: the main session renames
   it to `locales/fr/` at the end. Do NOT touch another agent's namespace.
3. **Plurals.** The six Arabic forms and the dual families collapse to French `_one` (0 and 1) and `_other`: write
   those two, DELETE `_zero`, `_two`, `_few`, `_many`, and any separate dual key family once its reader is changed to
   the plain plural. Where « 0 » reads badly, the component shows a separate empty-state sentence.
4. **Text written in source files** moves into the area's namespace when it is interface text; a table of sentences
   that belongs to a module (the kit's `text.js`, a world's `strings.js`, a board's script) stays where it is and is
   rewritten in place.
5. **Direction.** Remove from your files every `dir="rtl"`, every CSS `direction: rtl`, every `text-align: right`
   that only served Arabic, every unconditional mirror (`-scale-x-100`, `scaleX(-1)`) of an icon that pointed the
   Arabic way, every layout « placed from the right » (hand-computed SVG coordinates included: a sentence, a list of
   chips, a table of steps now reads left to right); physical `left`/`right` utilities become logical ones when they
   meant start/end. `dir="ltr"` islands around a formula may stay. Icons that depend on direction go through
   `components/common/DirectionalIcons.jsx`.
6. **Formats.** No literal `'ar-DZ'`, `'fr-DZ'`, `'en-US'` for something a user reads: `LOCALE` from `locale.js`.
   Money in euros through the shared helper the foundation agent provides (`utils/money.js › formatEur`); « دج »
   disappears. The Arabic font stacks (Cairo, Tajawal, Amiri, Noto Naskh) leave your CSS.
7. **Tests follow the text.** A test that asserted an Arabic sentence asserts the French one — same element, same
   strength. A test that asserted « this is Arabic » (a regex on Arabic letters, « no Latin word ») is inverted: it
   asserts French and refuses Arabic. Never weaken, never skip, never delete a test whose subject still exists.
8. **No Arabic character is left in your files — comments included** (a comment that quoted an Arabic term names the
   French one). Exempt until the books exist: `features/books/**` (the store is off).
9. **Not yours**: the mathematics of an engine, an API call, a key name, another agent's file. If you need a change
   in a file you do not own, say it in your report instead of making it.
10. **Machine**: 13 GB, several agents at once. Run ONLY your folders' tests, `npx vitest run <paths> --maxWorkers=1`,
    never the whole suite, never a build, never lint on the whole tree (`npx eslint <your files>` is fine),
    `npx prettier --check <your files>` for the formatted paths. The main session runs the whole suite and the checks
    when everyone has finished.
11. **Report** (fixed shape): what changed with counts (strings rewritten per namespace, source files, tests);
    every term you were unsure of, with the alternative you rejected; every place where the French is longer than the
    screen probably allows (you cannot see the screen: say where to look); changes you need in files you do not own;
    Arabic left and why; what you ran, with its numbers; what you did not verify.

**Who owns what** (under `apps/web/src/` unless said otherwise)

| Agent | Source | Namespaces |
|---|---|---|
| Foundation | `locale.js`, `i18n/index.js` and `i18n/*.test.js`, `utils/**`, `hooks/**`, `context/**`, `services/**` except `services/admin`, `components/common/**`, `components/layout/**`, `components/navigation/**`, `data/**`, `App.jsx`, `main.jsx`, `index.css`, `test/**`, `apps/web/index.html`, `apps/web/public/**`, `apps/web/tailwind.config.js`, `apps/web/vite*.js` | `common`, `nav` |
| Engine | `lessons/**` | `lesson` |
| Admin | `pages/admin/**`, `components/admin/**`, `services/admin/**`, `features/admin/**`, `pages/adminContract.test.js` | `admin` |
| Teacher, school, family | `pages/teacher/**`, `pages/school/**`, `pages/parent/**`, `components/teacher/**`, `features/classSession/**`, `features/teacher/**`, `features/school/**`, `features/family/**`, `features/classJoin/**`, `features/studyTime/**`, `features/notifications/**`, `features/tours/**`, `pages/teacherContract.test.js` | `teacher`, `memo`, `idara`, `family`, `tour` |
| Student and public | the page files directly under `pages/` (and their tests there, except the two contract tests above and `legalConsentContract.test.js`), `pages/student/**`, `pages/unit/**`, `pages/onboarding/**`, `components/{about,access,account,auth,contact,content,diagnostic,faq,hero,home,student}/**`, `features/{access,home,learning,practice,progression,settings,reports}/**` | `student`, `auth`, `access`, `marketing` |
| Math lab | `features/mathlab/**` | `mathlab` |
| Games and challenges | `features/{madar,dailyChallenge,thinkingLab,compass}/**` | `madar`, `challenge`, `thinking`, `compass` |

`pages/legal/**` and `legalConsentContract.test.js` are nobody's: the legal pages are the old site's, restored word
for word at the owner's word (`docs/reports/LEGAL_PAGES_REVIEW_2026-11-22.md`).

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
2. **The production database is KEPT** (owner, 2026-11-23: « replace the current one, use its db » — this replaces
   the fresh-database line of 2026-11-22). The deploy backs it up, then `migrate --force` brings the old site's 49
   migrations up to this tree's 144. Rehearsed on MySQL on 2026-11-23 (§9) on the SCHEMA of `main`, without its data.
   Then the deploy with `FR_REBUILD_CUTOVER_APPROVED=yes`, a smoke test; the Stripe test payment waits until payments open.
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
| 10 | The legal pages | ANSWERED 2026-11-22: « use them as they are ». Kept word for word; what does not fit is listed in `docs/reports/LEGAL_PAGES_REVIEW_2026-11-22.md`, not fixed |
| 11 | Accounts created for a student by a school or a teacher | ANSWERED 2026-11-22: switched OFF, opened and closed from the admin panel (`ManagedAccountsGate`). This also parks question 4's hardest point until a lawyer has read it |
| 12 | The 59 announced lessons | ANSWERED 2026-11-22: shown as « bientôt »; ONE complete lesson is built first, on divisors |
| 13 | 3e chapter 1 | ANSWERED 2026-11-23: « Multiples et diviseurs » — prime decomposition; PGCD (common prime factors, Euclid); irreducible fraction (by the PGCD, by the prime factors); gears and meetings (conjunction of periodic phenomena); then « Vers le brevet ». The PGCD is beyond the strict wording of the 2020 programme: the owner's choice. The world is DZ unit 1's, `divisorIsles` |
| 14 | What DZ already has | ANSWERED 2026-11-23: « for the things that already exist in the dz platform use them » — lessons, banks, class tests, instruments, warm-up families, checkers and walks are PORTED and adapted; only what DZ lacks is built. This overrides the council's opinion that banks be rebuilt per country |

### 7bis. Verdicts of the third council (2026-11-22), accepted by the owner's go

| Point | Verdict |
|---|---|
| Characters | ordinary clothes, varied hair; no headscarf by default (`KidFigure`) |
| Math lab | the collège side only, re-sorted to the French programme (probability and statistics in, vectors and systems on the hidden lycée side) |
| Visitors | one open demo lesson; a free account for the rest |
| Probability contexts | dice, coins, urns, spinners as experiments; no playing cards; never betting |
| Exercise bank | two tags added — brevet part 1 / part 2, calculator yes / no; the five « paliers » stay for progression |
| Build order of 3e | the lessons that survive the 2028 programme first |
| World problems of `divisorIsles` | implausible euro amounts rescaled, tests regenerated — with lesson 1 |

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
| ~~`audit-knowledge-dependencies.mjs` and `apps/web/scripts/lesson-v2-status.mjs` still recognise a v2 lesson by the text `retiredModules: true`~~ SETTLED 2026-11-23: both import `scripts/validate-lib.mjs › isV2Lesson` (the pack) | docs pass, 2026-11-22 | — |
| `check:non-blocking` and `audit:knowledge:gate` look for patterns only a module lesson had: they pass on any tree. Delete them or re-aim them at the v2 lesson | docs pass | the first French lesson |
| The teacher's lesson memo page (`/enseignant/cours/:lessonId/memoire`) reads module-lesson files a v2 lesson does not have; `teacher_lab_settings` (API) has no web caller; nothing calls `POST /lessons/{code}/evidence` | docs pass | step 1H (dead code of the shell) |
| The API still reads `content/class-tests/`; the web guard that checked a default class test's answers was deleted with the Algerian tests | docs pass | the first French class test |
| ~~`.claude/skills/lesson-v2/` tells agents to read deleted Algerian documents~~ SETTLED 2026-11-23: the skill is French | docs pass | — |
| ~~`deploy.yml` has steps that fail on a fresh French deployment~~ SETTLED 2026-11-23: the book-page check is gone (store off), the backup step skips only a database with ZERO tables of its own, the content checks pass (lesson 1's bank; the thinking-lab index exists, empty) | API pass | — |
| ~~The web still validates a name as Arabic and formats money as dinars~~ SETTLED 2026-11-23 (`utils/personName.js`, `utils/money.js`) | API pass | — |
| No walk has been run since the translation: the French label handles in `apps/web/e2e/` are unconfirmed; `_phase6-activation.mjs` and `access-limits.mjs` fail while payments are closed | closing pass, 2026-11-23 | the first look in a browser |
| The old transliterated routes (`/wali`, `/idara`, `/w/:token`…) have no redirect — right while no user exists | closing pass | — (noted so nobody looks for them) |
| The admin's per-seat PRICE tiers are also called « palier », the word of a practice step | closing pass | when payments open |
| Two wording mismatches: « L’échauffement » vs « Je me prépare »; « On commence par là » vs « Notre point de départ » | closing pass | when the compass is switched on |
| The legal pages are the old site's, restored unchanged at the owner's word; what does not fit the product today is listed for him, not fixed | owner, 2026-11-22 | before registration opens |
| Code comments cite deleted documents (about 80 places in `apps/api`, `apps/web/src`, `scripts`) | docs pass | with each file's next change |
| ~~The thinking-lab leak detector treats Latin letters as mathematics~~ SETTLED 2026-11-23: rewritten for French prose, tested | tooling pass | — |
| 15 `[NOT CHECKED 2026-11-22]` marks in the corrected contracts | docs pass | when the area is next touched |

## 9. Progress log

Working rule learned on 2026-11-22: while agents share this folder, **every commit names its paths**
(`git commit … -- <paths>`). A commit without a path list takes whatever another agent has staged with `git rm`
(it happened once: commit `08dcb413` carries the web agent's first deletions; its message says so).

| Date | Step | What happened |
|---|---|---|
| 2026-11-26 | « Vers le brevet » in 2D — plan and PROTOTYPE (nothing validated) | The owner dropped the 3D world for a unit's last lesson and asked for a 2D screen built on what attracts teenagers, with a dark and a light look. Plan: `docs/reports/VERS_LE_BREVET_PLAN.md`; looks: `docs/reports/mockups/vers-le-brevet-2d.html`. A first prototype (a training path of four steps) was refused the same day: he redefined the lesson as a RAPID REVISION of the unit — concepts, rules, key words, quick manipulations — with one or two solved exercises and a quick quiz at the end, and no scroll. Rebuilt on that: `/__qa/vers-le-brevet`, dev builds only (`apps/web/src/features/versLeBrevet/`, 7 tests) — the chapter on one screen, each lesson on one screen with a twenty-second manipulation, two solved exercises, six quiz questions; played end to end in a browser at 1366×768 in both looks, no cut content. It saves and sends nothing; no document of `docs/architecture/` changed, since nothing of it is a contract yet. **STOP: the owner plays it.** |
| 2026-11-26 | « Vers le brevet » — a second presentation, « En une page » (prototype) | On the owner's word, the prototype has a switch at the top, « Par écrans / En une page »: the same content, look and manipulations on one page that scrolls (`ScrollMode.jsx`; the lesson body and the quiz's end are shared, nothing is written twice); the switch keeps the student's place. Sound on by default and audible when turned on (it was reported silent). Played in a browser at 1366×768, both looks: no cut content, the page is about ten windows tall. A council advised ONE presentation; which becomes the pattern is not decided. « Nothing scrolls » still holds for lessons: this is outside the engine. **STOP: the owner compares the two.** |
| 2026-11-26 | The student's home of a lesson; the revision page in the 2D look; « Espace brevet » open; « Vers le brevet » a real lesson (NOT committed) | On the owner's words, the same evening. (1) A lesson's address is the student's HOME of the lesson, plain like the teacher's page; the world is at `?monde=1` and leaving it comes back there (LESSON_V2.md §2bis). (2) Two councils on the title screen's doors: « Page de révision » moved to the home; the five others stay in the world; ONE link added on the home, « Sujets de brevet » (`?monde=1&ouvrir=brevet`). The unit page's rows lost « Page de révision » for the student. (3) The student's revision page is the 2D game look with « Par écrans / En une page »; the plain sheet stays for the teacher and for paper (REVISION_PAGE.md §4). (4) « Espace brevet » is open from the start and first in the training space (GAME_WORLD.md) — it reverses « the game first ». (5) « Vers le brevet — Multiples et diviseurs » is `available`: a unit's last lesson is a revision, never evidence; the validator no longer asks it for an evaluation stage nor an assessed learning point (« remove that rule for this lesson »). Checked: web 6741 tests, core 1020 of 1021 (one failure in the PGCD bank, `ex-3e-trouver-le-pgcd-l1-009`, not touched here), scripts 175; lint, dead files, unused code; `check:lessons` green except `check:activation-drift` (the local database is the old site's); the story and hub walks of `trouver-le-pgcd` at 1366×768 (the story's 15 known « its line wraps » apart); the revision page of the five lessons walked by screens and as one page, nothing cut. NOT checked: the walks of the four other lessons, the sitting walk, a real API, a print of the new student page, the page `/espace/pratique/:lesson` (it crashed under the walk's doubled server). Open: Google Fonts by CSS import; the brevet link still loads the 3D world. |
| 2026-11-26 | The lesson's tools open with NO world; the games and the sheets open from the start (NOT committed) | On the owner's words. « Espace d'entraînement », « Fiche de connaissances », « Mon labo » are on the student's home of the lesson AND on the world's title screen; from the home they open with no three.js (`?outil=…`): the world runtime's non-3D flows moved, unchanged, to `kit/lessonFlows.js`, mixed into `WorldRuntime` and into a new `ToolsRuntime`; one wiring of save and evidence for both (`kit/runtimeWiring.js`). A game level loads the world then, straight on its run. Every rule's games and every knowledge card are open before the story (`ladder.js`, `KnowledgePage.jsx`; 5 tests rewritten to the new rule, the hub walk too). The link « Sujets de brevet » is replaced by « Espace d'entraînement ». Checked: web 6742 tests; lint, dead files, unused code; the hub, story and sitting walks of `trouver-le-pgcd` and the hub and story walks of `thales-configuration-papillon` at 1366×768 (only the 15 known « its line wraps »); in a browser, the network shows no three.js for the three tools in both worlds and a brevet paper sat with no world; on the owner's own server (port 5173, real API), signed in as a demo student, every page changed tonight opens. His « Cette page ne s’affiche pas » was his dev server holding `Spaces.jsx` as an EMPTY file (a hot-reload race while it was being edited); touching the file cured it. |
| 2026-11-26 | Lessons `fraction-irreductible` and `multiples-et-diviseurs-communs` (3e unit « Multiples et diviseurs », world `divisor-isles`) | **Two lessons built, FIVE French lessons now `available`; the unit's 4 lessons are complete (synthesis apart), so its summary page exists.** `fraction-irreductible` « Rendre une fraction irréductible » (4 keys; ported from DZ `ikhtizal-kasr`, its key 2 rebuilt on prime factors; final mission « la plaque du gardien » 3/34 × 85/87 = 5/58): story 1583, hub 337, trainer 688, board 295, sitting 2606 — 0 FAIL at 1366×768. `multiples-et-diviseurs-communs` « Engrenages et rendez-vous : quand deux rythmes se retrouvent » (4 keys, nothing ported; five-team workshop, mission of three ferries): story 1445, hub 335, trainer 779, board 329, sitting 2610 — 0 FAIL. New kit pieces: segment `walkway`, inquiry `crews`, `story.mission` (and its plaque variant), claim `ppcm`, `story.onMiss`, `measure` options. Banks 50 + 50, gates A and B passed « with corrections » (debts in the design page and `TWO_PLATFORMS_PLAN.md` §9). Owner decisions taken by default, he may override: « plus petit multiple commun » in full, never « PPCM »; no gear drawn; five teams as rows. NOT done: published in the local database (it is in the drifted state); web suite 6 732 tests green (475 files); core 1 020 of 1 021 — the one failure is 3 PRE-EXISTING duplicate signatures of trouver-le-pgcd’s bank (l1-009, l3-005, l3-006: subtraction vs Euclid’s wrong stop, the owner decides); scripts 175 green. Uncommitted. Details and cost (about 6,8 M, OVER): `TWO_PLATFORMS_PLAN.md` §9 |
| 2026-11-25 | Lesson 3 `thales-configuration-papillon` | Built on the world `nile-pyramids` carried from Algeria (one code, `strings.fr.js`); walked 0 FAIL at 1366×768 in every part; web suite 6 266 green; published locally. Details and cost: `TWO_PLATFORMS_PLAN.md` §9 |
| 2026-11-23 | 6 | **Cutover: the rebuild is in production.** With the owner's go, `FR_REBUILD_CUTOVER_APPROVED=yes` set by the owner, `main` fast-forwarded `0ddfb987` → `3a72c5fc` (48 commits, no force). CI green; deploy run `45224595354` green on every step: tests (core 37 files, web 401), build, files, **backup of the existing database first (38 tables, 669,520 bytes, `storage/app/backups/pre-deploy-2026-11-23_171246-3a72c5fc.sql`)**, 95 migrations, none pending after; curriculum sync — 60 lessons, 125 old-site lessons with no history deleted, **8 old-site lessons with student history kept and archived** (they appear in the public `closed` list, not as open lessons), tiers unchanged; `practice-doctor` green; frontend, SPA routing, API and the four schema endpoints answer. The server does not advertise its PHP version (warning, check skipped). Looked at after: `/`, `/cours`, `/enseignant`, `/api/v1/legal/versions` → 200, `<html lang="fr">`. NOT done: a look in a browser, an admin account on the new tree (`php artisan make:admin` — or the old one), the Stripe test (payments closed). |
| 2026-11-23 | 6 (prep) | **The cutover rehearsed on MySQL.** `deploy.yml` made fit for France: no `/books/smart-protocol` check, the pre-migration backup skips a database with no table of its own (counted from `db:show --json`, kept to the configured MySQL schema; a missing or unreadable answer fails the step). Rehearsal, local MySQL 8.0, throwaway databases dropped after: (a) an EMPTY database → detector 0, this tree's migrations all apply, none pending — the first run of the API's migrations on MySQL; (b) `main`'s 49 migrations, then this tree's → 144, none pending; then the server steps of the workflow — curriculum export (60 lessons, 166 points) and import, content registry (50 exercises), prune (nothing), tiers unchanged, `practice-doctor` green. NOT rehearsed: production's DATA (old lessons, users, progress rows) — no dump in this folder. The server `.env` is the old site's: every new switch defaults CLOSED when absent (`PAYMENTS_OPEN`, `REGISTRATION_OPEN`, `MANAGED_ACCOUNTS_OPEN`, `BOOKS_ENABLED`). |
| 2026-11-23 | shell on a real server | **The student's home `/espace` was BLANK after a real login**: with the compass OFF the home still rendered the compass section in its `off` state, whose year strip read the empty French calendar (`start: null`) and threw. Fixed at the cause: the compass off renders nothing of it (`features/home/components/TodayLesson.jsx`), and `yearStrip` / `teachingWeekNumber` survive a calendar not written; a `SectionErrorBoundary` (none existed in the app) now stands around every page of the student's space and the home's section. Walked at 1366×768 on the real API (port 8010, demo seed): public pages, student (home, lessons, chapter, lesson world — two bridges and the first forge played, the world's save `PUT …/answers` 200 —, practice: a decomposition typed with the pad, `POST …/answers` 201), teacher, admin. Also fixed: the public copy that said no lesson is open, the visitor bar's « Commencer gratuitement » cut at 1366, the theme chips of « Mes leçons » / « Explorer » cut, « 71% » and « 1229 » / « 2569 » typography, the chapter goals in « je » shown to a teacher. Nothing committed. |
| 2026-11-23 | §8 (lesson 1) | **The first French lesson: `decomposer-en-facteurs-premiers`** — design `docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md`. DZ had nothing to port whole (it excludes prime factorisation): ported — the world, the STOP experiment (`pairs`), the board's structure, 9 exercises; built new — a ladder for one number (`ladder · factor`), a remainder sheet (`sheet`), a typed exponent, the answer type `factorization` (JS = PHP, 49 shared cases), claims `factorization` and `prime`, a board station, a lab instrument, the warm-up family `4e.m1.r06`, a bank of 50 (10 per palier, brevet and calculator tags) with its oracle, the class test. Four keys (the smallest prime again and again; powers; when to stop; the sheet), a last bridge announced as « 2³ × 3² × 7 cases ». Walks green twice at 1366×768 (story, hub, trainer, board, launch; the sitting once); the walk library, never run in French, needed about 15 repairs; the walks and the main session's review of 26 screens found about 45 defects, fixed, each with its line in the skill's ledger. At `bcca5dbb`: web 398 files / 5,776 tests, core 1,021, scripts 145, API 1,566 (the same 8 MySQL-only do not pass); lint, unused, unreached, format, `check:lessons` (190.9 KB) pass. NOT done: the owner has not played it; the warm-up, the class test and the practice map were walked but not looked at; level-2 forms `divisible` and `write` of the warm-up are asked by no launch; key 2 cannot read key 1's ladders (the engine passes no experiment from one forge to another) |
| 2026-11-23 | §8 (prep) | **The lesson skill and the validators are French** (`c388e94f`): the skill opens with « Port before you build » and keeps its whole ledger (8 lines moved to « no longer applies »); validators: sub-items a–h, brevet provenance, the `brevet` / `calculator` tags required in 3e, French typography as errors, French forbidden contexts; a v2 lesson is recognised by its pack. Scripts: 14 files, 141 tests. The port map of DZ 4AM unit 1 says: **DZ has NO prime-factorisation lesson** (lesson 1 is built new on `divisorIsles`, porting the STOP experiment and the divisibility lens); the PGCD lesson ports from three DZ lessons, the irreducible fraction from one, the gears lesson from none. The new rules have not met a real French bank. Chosen without the owner: brevet years 2017–2027, typography failures are errors, pork kept and bank interest removed in the thinking-lab list |
| 2026-11-23 | 7bis (math lab) | **The math lab shows the collège only** (`40dd5a45`): `labConfig.js › LYCEE_LAB_ENABLED = false`; probability and statistics come to the collège, vectors / systems / sequences / conics / analysis stay hidden; no playing card or bet was found. About 15 walks open the hidden side and will fail; none run |
| 2026-11-23 | 1F (accounts, web) | The admin card and the hiding of the roster import and credential buttons while closed (`3dccb02e`). Reported, not changed: the teacher's credential endpoint re-issues a password to a SELF-registered student (the school's refuses); a managed student who forgets his password has no way back while closed |
| 2026-11-23 | 2C (3e unit 1) | **Owner's decision: unit 1 becomes « Multiples et diviseurs »** (`multiples-et-diviseurs`): decompose → NEW `trouver-le-pgcd` (decompositions and Euclid) → `fraction-irreductible` (two methods, P4 appended) → `multiples-et-diviseurs-communs` (rendez-vous, P3 re-cut) → `vers-le-brevet-multiples-et-diviseurs`. The PGCD and Euclid go beyond the 2020 text: marked by the new optional lesson field `beyondProgramme`, attached to `3e.m1.r07`; new link `3e.m1.r07 → 3e.m1.r06` (support). `calculer-avec-des-fractions` moved to the head of unit 4 « Résoudre des équations ». Now 60 lessons, 166 points, 113 links (74 core, 39 support); FR↔DZ table 59 rows (the PGCD lesson ports from 4AM `qasim-mushtarak-akbar`, `tayin-pgcd`, `bahth-pgcd`). Core 963 tests, scripts 104: pass. No lesson was built, so no learning-point id was in use |
| 2026-11-23 | 1C–1D (end) | **The web is French.** Seven areas translated by agents (foundation, admin, teacher/school/family, games, math lab, student and public pages, engine), then a closing pass: `locales/ar` → `locales/fr`, French routes with no redirect, one word for a practice step (« palier ») and for the mastery states, the dinars helper deleted, the production build repaired (`TourOverlay` imported a constant that no longer existed — lint had not seen it), 41 walks rewritten and none run. Re-run by the main session before the commit (`c542dc82`): core 36 files / 958 tests, scripts 12 / 104, web 369 / 5,495, all pass; lint, `check:unused` (baseline 233), `check:unreached` (1,292 reached, 14 kept), `check:format`, `check:lessons` (entry 190.5 KB gzip) pass. **Nothing seen in a browser** |
| 2026-11-22 | 1F (accounts) | API: `ManagedAccountsGate`, closed by default — accounts created by a school or a teacher (`a72f5528`); the mails write the French paths. The web side follows |
| 2026-11-22 | legal | The three legal pages of the old site restored word for word (versions 2026-09-12); findings in `docs/reports/LEGAL_PAGES_REVIEW_2026-11-22.md` |
| 2026-11-22 | 1B | **The empty French house.** The owner: no real user exists, no lesson is kept, DZ is never touched, commits and pushes are allowed here. Deleted: 140 DZ lessons, their banks, class tests and textbook sources (10,483 files). `packages/core`: the curriculum is an empty French skeleton, 6e–3e (74 test files, 1,581 tests pass). `apps/api`: French grade ladder, tests on neutral fixtures under `apps/api/tests/Fixtures/content` (1,506 tests, 1,497 pass, the same 8 MySQL-only tests as the baseline do not; no migration touched). Tooling: every check and generator runs on the empty catalogue, `check-dormant-isolation` inverted, 139 per-lesson oracles / 46 Arabic challenges / 193 lesson walks deleted (scripts tests: 97 pass). Web: in progress. Known and left for later: `check:activation-drift` cannot run without a local database; the thinking-lab leak detector is weaker on French prose (a formula is caught only after a colon or `=`); the exporter's « no tier » invariant has no lesson to be tested on |
| 2026-11-22 | 1B (end) | Web: the app on the empty catalogue, the legacy lesson systems deleted (1,283 files reached from `main.jsx`, 4,938 before). Then everything the deletions left unused: 337 strings, 548 exports, 39 arithmetic modules of core; the unused baseline shrank from 399 to 233 lines. Lint, `check:unused`, `check:unreached`, `check:format`, the entry budget (192 KB gzip) pass. NOT seen in a browser |
| 2026-11-22 | 1I (first pass) | Documentation: 181 documents of things that are gone deleted, ~65 contracts corrected with a status block, `CLAUDE.md` and `docs/README.md` rewritten for this product; §8bis lists the debts found |
| 2026-11-22 | 1F (server) | The payment switch, closed by default (§4ter): `PaymentGate`, 22 tests. API suite: 1,528 tests, 1,519 pass, the same 8 MySQL-only ones do not. The web side is not built |
| 2026-11-22 | 1F (web) | The payment switch in the web (`context/PaymentsContext.jsx`: reads `/billing/status`, fails closed; every commercial surface absent while closed; the admin panel « Paiement en ligne ») and `config/features.js` (books, thinking lab, daily challenge, compass, 6e diagnostic OFF: no door, routes redirect, no API call). Not seen in a browser |
| 2026-11-22 | 1E + 1G (API) | The French country layer of the API: Latin names, French mails and messages, `Europe/Paris`, Monday–Friday, euros (other plan prices `PRICE_TO_BE_DECIDED_BY_OWNER = 0`, unbuyable), French demo data, books off on the server, the reports migration made schema-only, the deploy guard inverted. 1,549 tests, 1,540 pass, the same 8 MySQL-only. **For the web, still to mirror**: the name pattern — Latin letters with accents (`A-Za-zÀÂÆÇÉÈÊËÎÏÔŒÖÙÛÜŸ` and lower case), space / hyphen / apostrophe only between two letters, 1–50 characters per part, NFC — and the roster codes `firstName_invalid` / `lastName_invalid`; the waitlist form: `email` required, `name`, `role` (`student`/`teacher`/`parent`) and a French `phone` optional; weeks start on Monday everywhere. **`deploy.yml` steps that would fail on a fresh French deployment** (listed, not changed — §6): the check of `/books/smart-protocol`, the backup that refuses a database under 1 KB, the practice and thinking-lab content checks that expect non-empty lists, the reference to `HOSTINGER_CATCHUP_ALL.sql` |
| 2026-11-22 | 2A | Official sources fetched and filed: `docs/curriculum/officiel/` |
| 2026-11-22 | 2C (3e) | **The 3e net is live** in `packages/core/curriculum/fr/`, from the official texts, NOT yet validated by the owner (`docs/curriculum/net-3e/REVIEW.md`): 55 items of 3e + 53 stubs of earlier grades, 112 weighted links, 17 threads, 13 units, 59 lessons all `coming_soon`, 161 learning points with locked ids (`generate:lp-lock`); the 19 items the 2026 programme adds in 2028 wait in `net/horizon_2028.json`. A lesson shows its own title; stubs have no home lesson. `lesson:brief` prints a French lesson's brief. A 3e student sees his 13 chapters announced, never a dead link; 6e–4e say « no lesson yet ». Core 36 files / 958 tests, scripts 12 / 104, web 347 / 5,231: all pass, with every check (`check:lessons` with `SKIP_DB_DRIFT_CHECK=1` — no local database yet). Still to do in Stage 2: the owner's validation; 2D the school calendar and the progression by week; 4e, 5e, 6e; 2G the exercise bank's contract for the brevet |
| 2026-11-22 | 1D (prep) | `docs/architecture/FRENCH_LANGUAGE_CONTRACT.md` written before any translation |
| 2026-11-22 | survey | five read-only surveys (RTL coupling, backend diff, curriculum model, engine portability, FR inventory), two councils |
| 2026-11-22 | 0 | branch, import of DZ `7f4cef1c`, workflows locked; nothing committed |
| 2026-11-22 | 1A | Baseline of the imported tree, unmodified (Arabic). `packages/core`: 76 files, 1,577 tests pass (16 s). `scripts`: 9 files, 22,641 pass (15 s). `apps/web`: 1,166 files, 19,452 pass (200 s, 4 workers). `apps/api` on the tracked `phpunit.xml` (in-memory SQLite): 1,503 tests, 1,494 pass, 1 skipped, **8 do not pass** — `DbBackupCommandTest` ×6, `MathLabFileFlowTest::test_l_ajout_verrouille…` (row lock), `PracticeEvidenceConvergenceTest::test_there_is_no_second_mastery_table` (`SHOW TABLES` is not SQLite). Read as MySQL-only tests — NOT confirmed: DZ and CI run this suite on MySQL. Checks: `check:unreached` ✅ (4,938 files reached), `check:unused` ✅ (web and API), `check:format` ✅, `check:learning-net` ✅, `check:year-calendar` ✅, `check:compass-index` ✅, `check:entry-budget` ✅ (203.9 KB gzip ≤ 212). **`check:textbook` ❌ — 3 lines on `hisab-judhur` (`prep` and `qcm` of `jidhr-tarbii`, `ex-31` of `natiqa-ghayr-natiqa`); the SAME 3 lines fail in DZ `dev` at `7f4cef1c` (run there the same day): a DZ defect carried by the import, and it stops `check:lessons` before its last five checks, which were run one by one.** `check:activation-drift` not run: it needs a local database, and this folder has none yet. **Still owed for 1A**: a local database for this folder (its own — never DZ's `smart_academy_test`), the API suite on MySQL, `check:activation-drift`, `npm run lint` (6 GB heap: not run while another session was working in DZ), and one walk |
