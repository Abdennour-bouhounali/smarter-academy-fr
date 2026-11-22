# Lesson v2 — the lesson as data plus one world

**Status: rollout in progress (plan `docs/reports/LESSON_V2_MASTER_PLAN.md` §4ter-0). Six lessons have a pack on 2026-11-19
— the pilot `qasim-adad-tabii`, `qawasim-adad-tabii` and `khawass-qawasim` (4AM, committed), and `qisma-iqlidiya-baqi`,
`qawaid-qabiliyat-qisma` (1AM) and `qisma-iqlidiya-hasr` (2AM), NOT committed yet (review fixes in progress);
`npm run status:lesson-v2` prints the live list. This document is the contract a v2 lesson follows; sections marked
`Planned` are not built.**

A v2 lesson is what the pilot became: a game world the student plays, a practice space, exam sittings, a knowledge page,
a launch kit, a lab, and for the teacher a class session with its board and its memo. The pilot was written as one
lesson's code; Phase 0 turns it into a **kit** plus **the lesson's own content**, so the next lesson is content and — at
most once per unit — one world mechanic.

| Layer | Where | Authority |
|---|---|---|
| The kit (screens, frames, the world runtime, the shell) | `apps/web/src/lessons/common/gameworld/kit/` | `GAME_WORLD.md` §3 |
| A world (a mechanic, one per unit unless a lesson needs its own) | `apps/web/src/lessons/common/gameworld/<world>/` | `GAME_WORLD.md` §3 |
| The lesson's content | the lesson's own folder | this document |
| The class session | `apps/web/src/features/classSession/` | `CLASS_SESSION.md` |
| The launch kit, the lab | `lessons/common/launchkit/`, `lessons/common/lessonlab/` | `LAUNCH_KIT.md`, `LESSON_LAB.md` |

## 1. The pack — `lesson.pack.js`

**One file in the lesson's folder says everything the lesson gives the platform beyond its modules. No list anywhere
else names a lesson.** Before 2026-11-17 a lesson had to be added by hand to `PHONE_LESSONS`, `BOARD_LESSONS`, `SCRIPTS`,
`BOARD_MEMOS`, `KNOWLEDGE_LOADERS`, the exam coach's table, `content/practice/exam-coach.json`, the `gameWorld` and
`classSession` keys of its config, and the world's own import of its one lesson. All of these are gone.

```js
// lessons/moyen/4am/…/qasim-adad-tabii/lesson.pack.js
export const LESSON_PACK = {
  id: 'qasim-adad-tabii',
  phone: false, // every pack says false while phones are PAUSED (owner, 2026-11-18)
  world: { id: 'divisor-isles', content: () => import('./world').then((m) => m.lesson) },
  knowledge: () => import('./knowledge.jsx').then((m) => m.LESSON_KNOWLEDGE),
  coach: { P1: 'qasim-baqi', P2: 'qasim-jidaa', P3: 'siyagh-mutakafia', P4: 'wahid-wa-nafsuh' },
  board: {
    script: () => import('./board/script.js').then((m) => m.SCRIPT),
    memo: () => import('./board/memo.js').then((m) => m.MEMO),
  },
};
```

| Key | Meaning | Who reads it |
|---|---|---|
| `id` | the lesson's id — the generator fails when it differs from the folder | — |
| `phone` | its home was designed AND walked on a phone held sideways (`GAME_WORLD.md` « On a phone ») | `components/auth/phoneLessons.js`, the launch kit |
| `world` | `id` = a world of `gameworld/worlds.js › WORLDS`; `content` = what the world is played with (`GAME_WORLD.md` §3 « The pilot's content ») | `LessonIndex.jsx`, `LessonGameWorld.jsx` |
| `knowledge` | the lesson's knowledge sheets (`LESSON_KNOWLEDGE`) and its map (`KNOWLEDGE_GRAPH`, same file) — the lesson's ONLY knowledge source (§2). A rebuilt lesson writes it in `world/knowledge.js`; the two pilots keep it in their root `knowledge.jsx` (imported by their `world/knowledge.js`) | « بطاقة المعارف » on the board, the exam coach, the world's « خريطة المعارف » (through `world.content`) |
| `coach` | `{ <الكفاءة>: <knowledge item id> }` — the sheet « مدرّب الامتحان » reminds; needs `knowledge` | `features/practice/exam/examCoach.js` |
| `board` | « حصّة القسم »: the lesson on the board (`script`) and its written memo (`memo`) — both or none. The teacher's card shows « في القسم » only for a lesson that has it; a class session with the tests alone, without a script, cannot be declared (the old `classSession: true` of the config is gone) | `boardLessons.js`, `ClassSessionPage`, `LessonMemoPage`, the teacher's card |

Rules:

- **A data module without a static import** — Node reads it. Everything heavy is behind `() => import()` that resolves to
  the thing itself (the script, not its module).
- **The flags are generated.** `node scripts/generate-lesson-index.mjs` (`npm run generate:lesson-index`) reads every
  pack and writes `pack: { phone?, world?, knowledge?, coach?, board? }` on the lesson's line of
  `lessons/lessonIndex.generated.json`. The entry bundle asks the flags (`registry.js › lessonPackFlags(id)`,
  `lessonsWithPack(flag)`) and loads nothing. `check:lesson-index` (in `check:lessons` and CI) fails when a pack changed
  and the index did not; the generator refuses an unknown key, a wrong shape, an id that is not the folder's.
- **A page asks for ONE part**: `lessons/lessonPack.js › loadPackPart(lessonId, part)` or, in a component,
  `usePackPart(lessonId, part)` — `undefined` while it loads, `null` when the lesson has none. Parts: `world`,
  `knowledge`, `coach`, `script`, `memo`. Never import a lesson's file by its path from shared code.
- **Tests**: `lessons/lessonPack.test.js` loads every pack of the index and every part it names, and FAILS when shared
  code (`lessons/common`, `features`, `components`, `services`, `utils`, `hooks`, `contexts`) names a lesson that has a
  pack — the one exception is the instrument tags of `lessonlab/registry.js`. A lesson's own tests import its files
  directly.

**To give a lesson a pack**: write `lesson.pack.js` beside `lesson.config.js` with the keys it really has, run
`npm run generate:lesson-index`, run the tests. Nothing else is edited.

### A lesson being built: `notYet` (2026-11-21)

A lesson whose world is shown to the owner before the rest is written declares, in its `world/index.js`,
`notYet: ['map', 'know', 'progress', 'lab', 'launch', 'sitting', 'test']` — the doors of the kit it has not got yet. The
title and end screens do not show those doors and the world does not open them; `lessons/lessonPack.test.js` then asks
of its world only `keys`, `rules`, `story` and `forges`. Each name leaves the list when its part is written; the lesson
is not « done » (§3) while the list is not empty. First used by `jidhr-tarbii` (world « قصر الساحات »,
`GAME_WORLD.md` §2ter-3).

### What is NOT in the pack (and why)

| Still elsewhere | Why |
|---|---|
| `lessonlab/registry.js › TOOLS` — an instrument is tagged with the lesson that introduces it | an instrument is shared CODE; lessons without a pack (1AM–3AM) own instruments too |
| `launchkit/families.js` — a question family per earlier الكفاءة | keyed by the الكفاءة of the learning net, shared by every lesson that needs it |
| `content/practice/exam-style.json` — the lessons whose bank is the BEM exam sheet | read by `scripts/validate-exercises.mjs` for all 74+ converted lessons, most of which have no pack |
| `content/class-tests/<grade>/<lesson>.json` — the default class test | already one file per lesson, served by the API |
| `pages/unit/unitMissions.js` — the student's unit page | one entry per UNIT |

## 1bis. What the server must know about a lesson — nothing

The server holds no code of a lesson's game. An answer that counts toward a الكفاءة is sent as a **claim** (the numbers of
the question and what the student wrote) to `POST /lessons/{code}/game-evidence`, and `Domain/GameWorld/ClaimVerifier.php`
re-computes its verdict from the numbers alone. The kinds of claim (`division`, `product`, `phrase`, `sure`,
`containers`, `pair`, `divisors`, `stop`, `divisible`, `bracket`, `fullNeeded`, `pgcd`, `coprime`, `commonDivisor`,
`fraction`) are statements about natural numbers — they belong to no lesson. Each states the WHOLE answer (e.g. `bracket`:
b × lo ≤ a < b × hi with hi = lo + 1; `fullNeeded`: full = ⌊a ÷ b⌋ and need = ⌈a ÷ b⌉; `pgcd`: g = PGCD(a ; b), a and b
not both 0; `coprime`: `says` = (PGCD = 1); `commonDivisor`: d ≥ 1 divides a and b — with the option `notOne: true` (2026-11-20, for `awwaliyan-fima-baynahuma`'s
witness ❌), d ≥ 2: a common divisor OTHER THAN 1, so the answer d = 1 is a false claim; `fraction` (a/b given, p/q written):
a × q = p × b, b and q > 0, and PGCD(p ; q) = 1 unless `reduced: false` — with the option `op` (2026-11-20, for
`ikhtizal-kasr`'s « result of a calculation in irreducible form »), the claim also carries the calculation `x/y op z/w`
(`op` ∈ `'+'`, `'-'`, `'*'`; x, y, z, w naturals ≤ 10^6, y and w > 0) and a/b must EQUAL its result, computed on each side
(the irreducible forms compared; a negative result is false) — the server then trusts neither the browser's a/b nor p/q). The kinds from `bracket` on admit only naturals ≤ 10^6 on both sides.

- A lesson says, in its `world/evidence.js`, WHICH claim each of its answers makes and which الكفاءة each key proves
  (`createEvidence({ grade, points })`); the verdict is the kit's `kit/claims.js › verifyClaim`.
- **A claim is FALSE whenever the lesson's own `check` calls the answer wrong** (2026-11-19, after the review found
  half-right answers credited: a claim that carried only the sum of a « sum and difference » answer, only the division of a
  « remainder » answer, a swapped phrase or a bracket judged on one bound). The claim states the WHOLE answer, in the part
  that carries THIS lesson's الكفاءة — a right first half never earns the key on its own. Each v2 lesson's
  `world/evidence.test.js` checks it over the exam questions its trainer generates (many seeds), with wrong and
  half-wrong answers: `check` refuses ⇒ the claim does not verify (most lessons also: a true claim ⇒ `check` accepts), plus
  the half-right cases the review found. The six lessons of batch 2 started before that day do not test it yet. The kit keeps a safety net:
  `kit/evidence.js › guardEvidence(ev, ok)`, called by `Trainer.jsx` on every answer, drops a TRUE claim made on an answer
  the lesson's `check` refused (a warning in development) — a wrong answer with a FALSE claim is still sent: it is
  evidence too. The net covers « تدرّب » only; the division steps of the real cases are not passed through it.
- **A missing statement that only narrows a kind is an OPTION of that kind, not a new kind** (as `commonDivisor`'s
  `notOne`): the option is read as `=== true` on both sides, and the fixture carries rows of both verdicts with it. An
  option that brings DATA (`fraction`'s `op` and its operands) is checked whenever its key is present: a present but
  invalid value (`null`, an unknown operation, a missing operand) makes the claim false on both sides.
- **To add a kind** (a lesson needs a statement none of the kinds makes): write it in `kit/claims.js` AND in
  `ClaimVerifier.php` (`KINDS`, `verify`), and add rows that are true and rows that are false to the one fixture
  `apps/api/tests/Fixtures/game-claims.json`. `kit/claims.test.js` fails when the two lists differ, when a kind lacks a
  row of each verdict, or when the two sides disagree; `ClaimVerifierTest` replays the fixture on the server.
- An answer whose verdict cannot be re-computed from numbers (« صحيح أم خطأ؟ علّل ») is never evidence.
- **The exam sittings are the exception: they serve the lesson's BANK** (owner, 2026-11-18 — GAME_WORLD.md §2quater), so a
  handed-in copy does not make claims: it goes to the PRACTICE ENGINE like an exam sheet of « /espace/pratique »
  (`kit/bankEvidence.js`: one session, one attempt per answered step, the raw answer). The server reads the question in the
  content and re-computes the verdict with its own evaluator (`AnswerEvaluator.php`, EXERCISE_CONTRACT.md « Server-side
  evaluation »); `selfCheck` and `counted: false` steps are never evidence. Still only exam-format first tries: one answer per
  step, no hint exists during a sitting, nothing is sent before the hand-in or when he leaves.

## 1ter. The student's journey, his progress, and a lesson that is rebuilt

**The journey follows him** (`gameworld/kit/saveSync.js`, 2026-11-17). The world's save stays in the browser so the game
never waits for the network; a copy is kept on the server in the student's PRIVATE answers store
(`GET/PUT /lessons/{code}/answers` — his alone, never evidence, never read by a teacher, a school or a parent; no new
table):

- **pull** before the world mounts (`LessonGameWorld.jsx`, at most 2.5 s, never blocking): the server's copy replaces
  the browser's only when it is strictly newer;
- **push** a few seconds after a save (one request for a burst of saves), when the page is hidden, when the world closes;
- the store takes small values and reads keys by dot paths, so the save is cut into pieces under keys WITHOUT a dot:
  `world:n` = how many, `world:0` … = slices of base64, all stamped with the time of the save; a copy whose pieces do
  not all carry that time is ignored;
- the newest WHOLE save wins (the device's clock): two devices played at the same time do not merge;
- a teacher's preview pulls nothing and pushes nothing.
- Check: `kit/saveSync.test.js` (the pieces, an incomplete copy, who wins), `StudentLessonAnswersTest` (a real chunked
  save through the controller), and the walk `e2e/gameworld-sync.mjs` (two devices, a slow server, a server that is
  down, a teacher's preview — 12 checks, laptop and phone).

**While the world arrives** the student sees his lesson's name and a bar that fills (`LessonGameWorld.jsx`,
`lessonGameWorld.css`), and a sentence with « حاول من جديد » when the network gives up. three.js is ONE chunk shared by
every world (135 KB gzip, measured); the pilot's world is 73 KB gzip of code and 17 KB of styles; a lesson adds its own
content. A budget per lesson is `Planned` (the status script, §3).

**Progress, mastery and the reports still read MODULES — and a v2 lesson still has them, as DATA.** Its
`lesson.config.js` keeps its modules (ids, numbers, slugs, titles, stages) and its الكفاءات; the world marks a module
done when the story reaches what that module taught (`onModule`), and the exam-format answers are evidence (§1bis). Its
module PAGES are deleted (§2): every module address redirects to the home. Traced reader by reader on 2026-11-18:
`docs/reports/OLD_VERSION_TRACE_2026-11-18.md`.

**A v2 lesson is COMPLETE when its world's story is finished** (2026-11-19, « fix all »). The story marks only some
modules (4 of 8–9: those it teaches on the way); the others (preparation, the test, the synthesis…) have no page, and
the progress layer says `completed` only when every module of the config is done (`progressQueue.js ›
snapshotLessonProgress`). So the kit (`gameworld/kit/storyEnd.js`, wired in `LessonWorld.jsx`) marks EVERY module of
`config.modules` through `onModule` the first time a world save says `finished` (the last bridge paid, the End screen):
- on a save during play (the finale saves `finished: true`);
- **on load** — a save already finished (a student who ended the story before this rule, or on another device: the
  pulled save) repairs his progress the next time the world opens;
- never from a teacher's preview. Mastery of each الكفاءة is unchanged: evidence only. The modules the story marks on
  the way are still marked when their key is sealed (partial progress still shows), and a world needs nothing in its
  `story.js`. Check: `kit/storyEnd.test.js`.

With that, the readers of `status: 'completed'` (the server keeps it monotonic and trusts the client's snapshot:
`LessonProgressService`) — the parent's link and weekly report, the teacher's tracking (`ClassroomProgressService`),
the school / admin reports (`AnalyticsService`, `StudentDossier`) — and those of the module count (`getLessonProgress` →
the unit page, the lesson tiles, `UnitGroup`, `getStudentActivity`) see a finished v2 lesson as done. « بوصلتي » reads
the calendar and the learning net, not this status. What stays imperfect: §9 of the trace report.

**When a lesson in use is rebuilt as v2** (rule taken from the pilot — it was never decided otherwise; the owner may
change it):

- nothing the student earned is taken: his الكفاءات, his evidence and the modules he completed stay (the module numbers
  of the lesson do not change);
- the keys his own progress proves are his from the first screen (`lesson.keysFromModules(done)`): the practice space
  and the knowledge page are open to him as far as he went;
- the STORY of the world is new to him: he starts it at the first island, and may leave it for the practice space.

## 2. The lesson's folder

```
<lesson>/
  lesson.config.js     modules (as DATA), الكفاءات, resources — no `studentView`, no `mission`, no `lessonProblem`
  lesson.pack.js       the pack (§1)
  world/               what the game world is played with — index.js exports `lesson`: its keys and their tablets, its
                       FORGES (one per key: no rule is told — GAME_WORLD.md §2sexies), the practice ladder, the trainer,
                       the exam sittings, the journey, the evidence, the knowledge page, its sentences (GAME_WORLD.md §3)
  board/script.js      « الدرس على السبّورة » (CLASS_SESSION.md §5ter)
  board/memo.js        the written memo (CLASS_SESSION.md §2quater)
  routes.jsx           `buildLessonRoutes({ …, retiredModules: true })`: the home, and each module address → the home;
                       NO `loadKnowledge` (the builder refuses it): the home mounts no 🧠 map of its own
```

**ONE knowledge source** (2026-11-19, `OLD_VERSION_TRACE_2026-11-18.md` §10): what the lesson knows is the file its pack
names (`knowledge`), shown by the world's « خريطة المعارف », the board's « بطاقة المعارف » and the exam coach. The old
lesson page's 🧠 map (`LazyLessonKnowledgeProvider`, built from the deleted lesson's `knowledge.jsx` / `knowledgeGraph.js`
/ `content/textbook.js`) is not mounted on a v2 home. A rebuilt lesson has no root `knowledge.jsx`, `knowledgeGraph.js`
or `content/`: `validate:lessons` asks that the pack's knowledge file export `KNOWLEDGE_GRAPH` instead, and
`lessonGraphs.test.js` checks only that this file holds a map (the world draws it at its own `positions`; its invariants
are the lesson's `world/journey.test.js`). The two pilots' root `knowledge.jsx` + `knowledgeGraph.js` + `content/` stay:
their pack and their `world/knowledge.js` read them (their cards still quote the textbook's wording — §10 of the trace).

**The modules as the platform shows them.** A module's `title` is TEXT read by the parent, the teacher's tracking and
the reports: it names what the module stands for in the v2 lesson — the key or the stage the world marks (`onModule`),
« مسألة الدرس » for the last bridge, « التقويم » for the evaluation — never the deleted page's activity, context or the
book's section names (« نشاط 3 », « أوظّف تعلّماتي », « مسائل الكتاب »). The teacher's unit page shows no module chips
for a lesson whose pack has a world (`LessonModuleChips`), and « واصل » / the progression tree open its home
(`getResumeLesson.js › getResumeModulePath`): its module addresses only redirect there.

**The old version is deleted when the lesson becomes v2** (owner, 2026-11-18: « for each lesson that is updated to the
gaming version, delete the old version »; decision D3). Done for `qasim-adad-tabii`, `qawasim-adad-tabii`,
`khawass-qawasim`, then (same day) the 1AM `qisma-iqlidiya-baqi`, `qawaid-qabiliyat-qisma` and the 2AM
`qisma-iqlidiya-hasr`, then (2026-11-19) the 4AM `qasim-mushtarak-akbar` (lesson 4, with its mission scene `flower-shop`) `tayin-pgcd` (lesson 5, with its mission scene `school-bags`) and `bahth-pgcd` (lesson 6, with its mission scene `sewing-workshop`), then (2026-11-20) `awwaliyan-fima-baynahuma` (lesson 7, with its mission scene `math-club`) and `ikhtizal-kasr` (lesson 8, with its mission scene `bakery`; the unit's last ordinary lesson on the mission player — only the synthesis `wadiya-idmajiya-aadad` stays on it), then (2026-11-21) the first lesson of unit 2 `jidhr-tarbii` (world `root-courts`, with its mission scene `garden-bed`) and its lesson 2 `natiqa-ghayr-natiqa` (same world, with its mission scene `carpet-loom`) — with the unit's `_unit/prepDiagnostic.jsx` and `_unit/moduleContext.js` when no lesson of the unit
still has a module page (1AM `darb-qisma-ashriya`); the trace of every reader: `docs/reports/OLD_VERSION_TRACE_2026-11-18.md`. What goes, in the same
commit as the conversion:

- `modules/` (every module page, « إختبار أولي » included), `moduleContext.js`, and the `content/` files only the pages
  read (`prep`, `peerSheet`, `problems`, the activities' own data) with their tests;
- the old root `knowledge.jsx`, `knowledgeGraph.js` and `content/textbook.js` / `exercises.js` when the pack's knowledge
  lives elsewhere (`world/knowledge.js`) — a `sourceElementIds` on the destination module keeps a textbook element they
  alone cited covered (`check:textbook`);
- `studentView: 'mission'`, `mission` and `lessonProblem` in `lesson.config.js`; its mission scene in
  `lessons/common/mission/MissionScene.jsx` when no other lesson uses it;
- the module routes: `routes.jsx` passes `retiredModules: true` instead of its `import.meta.glob` — each module ADDRESS
  stays a route that redirects to the home (an old link never ends on a 404);
- the walks of the deleted pages.

What stays: the `modules` of the config as data (progress is stored by their numbers; the DB rows `lesson_modules`, the
reports, the compass read them), `resources` (exported to the DB), the pack's knowledge file, the practice bank
(`content/practice/`), the class test. The checks know a v2 lesson by `retiredModules: true`: `validate:lessons` takes
its الكفاءات coverage from `world/evidence.js › POINTS` (the final test is gone) and does not ask for
`content/problems.js`; `audit:knowledge` skips it (no exposure stream); the status script checks that the old version is
gone. At the next deploy the content registry retires (`retired_at`, never deleted) the final-test items of the deleted
« إختبار أولي » — follow-up 1 of the trace.

## 3. Is a lesson done? — the status script and the definition of done

```bash
npm run status:lesson-v2                      # every lesson that has a pack, then the retirement ledger
npm run status:lesson-v2 -- --lesson <id>     # one lesson, part by part; exit 1 unless it prints ✅
```

**A unit's LAST lesson (« أدمج تعلّماتي ») is a v2 lesson of another kind** (2026-11-20, `INTEGRATION_LESSON_PLAN.md`):
its pack names the world `mission-isle` and nothing else is asked of the pack yet. Its `world/` holds `index.js`
(`keys: []`, `missions`, `bank`, `recap`, `sittings`, `journey`, `text`), `sitting.js` (the bank, as it is) and
`text.js`; its situations are data files of `missions/`, each with its test. No forge, no trainer, no knowledge map,
no instrument: the status script prints those parts ➖ and judges M1 (two situations with their tests), M2 (the
island's content and its test), M3 (the bank mission and the recap declared), the bank, the walks
(`e2e/missionHome.mjs`, `e2e/mission.mjs`), the board, the class test, the deletion of the old version.
`scripts/validate-lessons.mjs` reads its الكفاءات coverage from its bank.

**The teacher of a v2 lesson that has no board yet** (`features/classSession/boardLessons.js`, 2026-11-20): his page is
his card alone (no list of the deleted modules, no site footer, no floating « كرّاسي »); `hasTeacherBank` gives him the
teacher's own bank; `toolHasContent` keeps in the common header only the tools that have content for the lesson
(« الدرس », « بنك التمارين », « متابعة القسم » until its board is written); the memo door comes back with the board;
« ما يتعلّمه تلاميذك » carries a button to the tracking.

`apps/web/scripts/lesson-v2-status.mjs` reads files and markers and judges nothing. Its parts, for one lesson:

| Part | What it looks at |
|---|---|
| the pack | `lesson.pack.js` and its flags in the generated index |
| S2 the world | `pack.world`; the nine files of `world/` (`index`, `forges`, `practice`, `trainer`, `sitting`, `journey`, `evidence`, `knowledge`, `text`); a test for six of them |
| S2 every rule is forged | every key of `world/journey.js › KEYS` has its forge in `world/forges.js` |
| S3 knowledge, S6 exam coach | `pack.knowledge`, `pack.coach` |
| S4 the practice bank is the BEM exam sheet | the lesson is in `content/practice/exam-style.json` |
| S4bis the bank is served AS IT IS (owner, 2026-11-18) | the lesson's `world/sitting.js` is ONE call to the kit's bank adapter, `createBankSittings({ lesson })` (`kit/bankSitting.js`), and no `createSittings` — its exam sittings serve `content/practice/<grade>/<id>/` unchanged and generate no exercise (GAME_WORLD.md §2quater, `docs/reports/BANK_AS_IS_2026-11-18.md`) |
| S8 « مختبري » | an instrument tagged with the lesson in `lessonlab/registry.js` |
| S1 the launch kit | every CORE tool of the learning net for the lesson has a family in `launchkit/families.js` |
| T1–T3 the board | `pack.board`, `board/script.js`, `board/memo.js`; a board test that computes every number (`board/board.test.js`) and a board walk (reference: `qawasim-adad-tabii`, CLASS_SESSION.md §5ter) |
| T2 the class test | `content/class-tests/<grade>/<id>.json` |
| the phone | **PAUSED (owner, 2026-11-18)**: `pack.phone` stays `false`; not part of « done ». Set only after its home was designed and walked on a phone, when phones resume |
| a walk | a walk of `apps/web/e2e/` that names the lesson and plays its world |
| published | status `available` in the catalogue |
| the old version is deleted | no `modules/`, `retiredModules: true` in `routes.jsx`, no `studentView: 'mission'` / `mission` in the config (§2) |

**A lesson is done when** (plan §6):

1. the status script prints ✅ for it;
2. its unit tests pass — in particular `world/forges.test.js`: for every forge exactly one rule holds and every other is
   refuted in front of the student;
3. its walk passes at 1366×768 — the ONE size since 2026-11-19 (owner: « 1366×768, alone, no other size is needed »; 1024×768 and 1840×900 are no longer walked) (**the phone walk, `E2E_TOUCH=1 E2E_SIZE=800x370`, is PAUSED since 2026-11-18** — phones are built later, see `GAME_WORLD.md` « On a phone »);
4. its screenshots were looked at with the eyes, student and teacher;
5. `check:lessons`, the entry budget, lint, `check:unused`, `check:unreached` and `check:format` pass;
6. what it replaced is deleted in the same change (§2 « The old version is deleted »; the status script checks it); its
   docs are updated; it is committed `feat(lessons): <id> — v2`.

**The retirement ledger** is printed by the same script: how many lessons still stand on each old system (the mission
player, the older lesson page, « أستعدّ », « وضع القسم » and the derived memo). A legacy system is deleted in the commit
that converts its last lesson — never before, never later. On 2026-11-17: 140 lessons built, 1 with a v2 world, 31 on the
mission player only, 108 on the older lesson page, 139 without a board. On 2026-11-18: 3 with a v2 world, all three with
their old version deleted; 29 on the mission player only, 108 on the older lesson page, 137 with an « أستعدّ » module,
137 without a board. Later on 2026-11-18 (the division road `qisma-iqlidiya-baqi`, `qawaid-qabiliyat-qisma`,
`qisma-iqlidiya-hasr` converted, their old version deleted): 6 with a v2 world, all six with their old version deleted;
29 on the mission player only, 105 on the older lesson page, 134 with an « أستعدّ » module, 134 without a board.

NOT in the script yet: a weight budget per lesson; the content checks of `check:lessons` (respect of Islam, independence
from the book, « دج », counters, formulas) do not read a lesson's `world/` and `board/` folders — plan B8.
