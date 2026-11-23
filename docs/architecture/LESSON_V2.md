# Lesson v2 — the lesson as data plus one world

> **Status (2026-11-22).** Covers the contract of a v2 lesson: its pack, its folder, what the server checks, the
> definition of done. Imported from the Algerian platform (DZ dev `7f4cef1c`) on 2026-11-22. True here: the whole
> plumbing exists (`lesson.pack.js` loaders, the generated index, `buildLessonRoutes`, the kit's evidence, save sync and
> story end, the status script). Since 2026-11-23 ONE lesson exists: 3e `decomposer-en-facteurs-premiers` (world
> `divisor-isles`, `available` in the catalogue, the one line of `lessonIndex.generated.json`) — not yet walked; every
> other example below names an Algerian lesson, not in this repository (see the Algerian platform, or `git show 049380e`);
> the kit still speaks Arabic (plan §4, steps 1C–1D). A lesson will live in
> `apps/web/src/lessons/college/<grade>/<theme>/<unit>/<lesson>/`.

A v2 lesson is a game world the student plays, a practice space, exam sittings, a knowledge page, a launch kit, a lab,
and for the teacher a class session with its board and its memo. It is a **kit** plus **the lesson's own content**, so
a lesson is content and — at most once per unit — one world mechanic.

| Layer | Where | Authority |
|---|---|---|
| The kit (screens, frames, the world runtime, the shell) | `apps/web/src/lessons/common/gameworld/kit/` | `GAME_WORLD.md` §3 |
| A world (a mechanic, one per unit unless a lesson needs its own) | `apps/web/src/lessons/common/gameworld/<world>/` | `GAME_WORLD.md` §3 |
| The lesson's content | the lesson's own folder | this document |
| The class session | `apps/web/src/features/classSession/` | `CLASS_SESSION.md` |
| The launch kit, the lab | `lessons/common/launchkit/`, `lessons/common/lessonlab/` | `LAUNCH_KIT.md`, `LESSON_LAB.md` |

## 1. The pack — `lesson.pack.js`

**One file in the lesson's folder says everything the lesson gives the platform beyond its modules. No list anywhere
else names a lesson.**

```js
// lessons/college/<grade>/<theme>/<unit>/<lesson>/lesson.pack.js — shape (example from an Algerian lesson)
export const LESSON_PACK = {
  id: '<lesson-id>',
  phone: false, // every pack says false while phones are PAUSED
  world: { id: 'divisor-isles', content: () => import('./world').then((m) => m.lesson) },
  knowledge: () => import('./world/knowledge.js').then((m) => m.LESSON_KNOWLEDGE),
  coach: { P1: '<knowledge item id>', P2: '<knowledge item id>' },
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
| `world` | `id` = a world of `gameworld/worlds.js › WORLDS`; `content` = what the world is played with (`GAME_WORLD.md` §3) | `LessonIndex.jsx`, `LessonGameWorld.jsx` |
| `knowledge` | the lesson's knowledge sheets (`LESSON_KNOWLEDGE`) and its map (`KNOWLEDGE_GRAPH`, same file) — the lesson's ONLY knowledge source (§2) | the board's knowledge card, the exam coach, the world's knowledge map (through `world.content`) |
| `coach` | `{ <learning point>: <knowledge item id> }` — the sheet the exam coach reminds; needs `knowledge` | `features/practice/exam/examCoach.js` |
| `board` | the class session: the lesson on the board (`script`) and its written memo (`memo`) — both or none. The teacher's card offers the class session only for a lesson that has it | `boardLessons.js`, `ClassSessionPage`, `LessonMemoPage`, the teacher's card |

Rules:

- **A data module without a static import** — Node reads it. Everything heavy is behind `() => import()` that resolves to
  the thing itself (the script, not its module).
- **The flags are generated.** `npm run generate:lesson-index` reads every pack and writes
  `pack: { phone?, world?, knowledge?, coach?, board? }` on the lesson's line of `lessons/lessonIndex.generated.json`.
  The entry bundle asks the flags (`registry.js › lessonPackFlags(id)`, `lessonsWithPack(flag)`) and loads nothing.
  `check:lesson-index` (in `check:lessons`) fails when a pack changed and the index did not; the generator refuses an
  unknown key, a wrong shape, an id that is not the folder's.
- **A page asks for ONE part**: `lessons/lessonPack.js › loadPackPart(lessonId, part)` or, in a component,
  `usePackPart(lessonId, part)` — `undefined` while it loads, `null` when the lesson has none. Parts: `world`,
  `knowledge`, `coach`, `script`, `memo`. Never import a lesson's file by its path from shared code.
- **Tests**: `lessons/lessonPack.test.js` loads every pack of the index and every part it names, and FAILS when shared
  code (`lessons/common`, `features`, `components`, `services`, `utils`, `hooks`, `contexts`) names a lesson that has a
  pack. A lesson's own tests import its files directly.

**To give a lesson a pack**: write `lesson.pack.js` beside `lesson.config.js` with the keys it really has, run
`npm run generate:lesson-index`, run the tests. Nothing else is edited.

### A lesson being built: `notYet`

A lesson whose world is shown to the owner before the rest is written declares, in its `world/index.js`,
`notYet: ['map', 'know', 'progress', 'lab', 'launch', 'sitting', 'test']` — the doors of the kit it has not got yet. The
title and end screens do not show those doors and the world does not open them; `lessons/lessonPack.test.js` then asks
of its world only `keys`, `rules`, `story` and `forges`. Each name leaves the list when its part is written; the lesson
is not « done » (§3) while the list is not empty.

### What is NOT in the pack (and why)

| Still elsewhere | Why |
|---|---|
| `lessonlab/registry.js › TOOLS` — an instrument may be tagged with the lesson that introduces it (no tag today) | an instrument is shared CODE |
| `launchkit/families.js` — a question family per earlier learning point (empty today) | keyed by the learning point of the net, shared by every lesson that needs it |
| `content/practice/exam-style.json` — the lessons whose bank is the exam sheet (`[]` today) | read by `scripts/validate-exercises.mjs` |
| `content/class-tests/<grade>/<lesson>.json` — the default class test (the folder does not exist yet) | one file per lesson, served by the API (`config/class_session.php`) |
| `pages/unit/unitMissions.js` — the student's unit page (`{}` today) | one entry per UNIT |

## 1bis. What the server must know about a lesson — nothing

The server holds no code of a lesson's game. An answer that counts toward a learning point is sent as a **claim** (the
numbers of the question and what the student wrote) to `POST /lessons/{code}/game-evidence`, and
`Domain/GameWorld/ClaimVerifier.php` re-computes its verdict from the numbers alone. The kinds of claim (`division`,
`product`, `phrase`, `sure`, `containers`, `pair`, `divisors`, `stop`, `divisible`, `bracket`, `fullNeeded`, `pgcd`,
`coprime`, `commonDivisor`, `fraction`, `factorization`, `prime`) are statements about natural numbers — they belong to no lesson. Each states the
WHOLE answer (e.g. `bracket`: b × lo ≤ a < b × hi with hi = lo + 1; `fullNeeded`: full = ⌊a ÷ b⌋ and need = ⌈a ÷ b⌉;
`pgcd`: g = PGCD(a ; b), a and b not both 0; `coprime`: `says` = (PGCD = 1); `commonDivisor`: d ≥ 1 divides a and b —
with the option `notOne: true`, d ≥ 2; `fraction` (a/b given, p/q written): a × q = p × b, b and q > 0, and
PGCD(p ; q) = 1 unless `reduced: false` — with the option `op` (`'+'`, `'-'`, `'*'`), the claim also carries the
calculation `x/y op z/w` (naturals ≤ 10^6, y and w > 0) and a/b must EQUAL its result, computed on each side). The kinds
from `bracket` on admit only naturals ≤ 10^6 on both sides. `factorization` (2026-11-23): `{a, factors: [{p, e}, …]}`,
2 ≤ a ≤ 10^6, every p prime, the p strictly INCREASING (each prime once), every e ≥ 1 (≤ 20), product = a — the
decomposition written with its powers; `prime`: `{a, says}`, `says` = (a is prime; 0 and 1 are not). These two carry ONE
number: `GameEvidenceController` requires `claim.b` for every kind except `ClaimVerifier::SINGLE` (`factorization`,
`prime`). `phrase` (`{a, b, first, phrase}`) names its four sentences by French-neutral ids since 2026-11-23:
`diviseur` (« est un diviseur de ») and `divise` (« divise ») put the divisor first, `multiple` (« est un multiple de »)
and `divisible` (« est divisible par ») the multiple; an old Arabic id is false on both sides.

- A lesson says, in its `world/evidence.js`, WHICH claim each of its answers makes and which learning point each key
  proves (`createEvidence({ grade, points })`); the verdict is the kit's `kit/claims.js › verifyClaim`.
- **A claim is FALSE whenever the lesson's own `check` calls the answer wrong.** The claim states the WHOLE answer, in
  the part that carries THIS lesson's learning point — a right first half never earns the key on its own. Each lesson's
  `world/evidence.test.js` checks it over the exam questions its trainer generates (many seeds), with wrong and
  half-wrong answers. The kit keeps a safety net: `kit/evidence.js › guardEvidence(ev, ok)`, called by `Trainer.jsx` on
  every answer, drops a TRUE claim made on an answer the lesson's `check` refused — a wrong answer with a FALSE claim is
  still sent: it is evidence too.
- **A missing statement that only narrows a kind is an OPTION of that kind, not a new kind** (as `commonDivisor`'s
  `notOne`): the option is read as `=== true` on both sides, and the fixture carries rows of both verdicts with it. An
  option that brings DATA (`fraction`'s `op`) is checked whenever its key is present: an invalid value makes the claim
  false on both sides.
- **To add a kind**: write it in `kit/claims.js` AND in `ClaimVerifier.php` (`KINDS`, `verify`), and add true and false
  rows to the one fixture `apps/api/tests/Fixtures/game-claims.json`. `kit/claims.test.js` fails when the two lists
  differ, when a kind lacks a row of each verdict, or when the two sides disagree; `ClaimVerifierTest` replays the
  fixture on the server.
- An answer whose verdict cannot be re-computed from numbers (« vrai ou faux ? justifie ») is never evidence.
- **The exam sittings serve the lesson's BANK** (`GAME_WORLD.md` §2quater), so a handed-in copy does not make claims: it
  goes to the PRACTICE ENGINE like an exam sheet of « /espace/pratique » (`kit/bankEvidence.js`: one session, one
  attempt per answered step, the raw answer). The server re-computes the verdict with its own evaluator
  (`AnswerEvaluator.php`, `EXERCISE_CONTRACT.md` « Server-side evaluation »); `selfCheck` and `counted: false` steps are
  never evidence. Only exam-format first tries: one answer per step, no hint during a sitting, nothing sent before the
  hand-in.

## 1ter. The student's journey, his progress, and a lesson that is rebuilt

**The journey follows him** (`gameworld/kit/saveSync.js`). The world's save stays in the browser so the game never
waits for the network; a copy is kept on the server in the student's PRIVATE answers store
(`GET/PUT /lessons/{code}/answers` — his alone, never evidence, never read by a teacher, a school or a parent):

- **pull** before the world mounts (`LessonGameWorld.jsx`, at most 2.5 s, never blocking): the server's copy replaces
  the browser's only when it is strictly newer;
- **push** a few seconds after a save (one request for a burst of saves), when the page is hidden, when the world closes;
- the store takes small values and reads keys by dot paths, so the save is cut into pieces under keys WITHOUT a dot:
  `world:n` = how many, `world:0` … = slices of base64, all stamped with the time of the save; a copy whose pieces do
  not all carry that time is ignored;
- the newest WHOLE save wins (the device's clock): two devices played at the same time do not merge;
- a teacher's preview pulls nothing and pushes nothing.
- Check: `kit/saveSync.test.js`, `StudentLessonAnswersTest`. (The Algerian walk `e2e/gameworld-sync.mjs` was deleted
  with its lesson; no walk covers it here.)

**While the world arrives** the student sees his lesson's name and a bar that fills (`WorldLoading.jsx`,
`worldLoading.css`). three.js is ONE chunk shared by every world. A budget per lesson is `Planned`.

**Progress, mastery and the reports still read MODULES — and a v2 lesson still has them, as DATA.** Its
`lesson.config.js` keeps its modules (ids, numbers, slugs, titles, stages) and its learning points; the world marks a
module done when the story reaches what that module taught (`onModule`), and the exam-format answers are evidence
(§1bis). A v2 lesson has no module page: every module address redirects to the home (§2).

**A v2 lesson is COMPLETE when its world's story is finished.** The progress layer says `completed` only when every
module of the config is done (`progressQueue.js › snapshotLessonProgress`), so the kit (`gameworld/kit/storyEnd.js`,
wired in `LessonWorld.jsx`) marks EVERY module of `config.modules` through `onModule` the first time a world save says
`finished`:
- on a save during play (the finale saves `finished: true`);
- **on load** — a save already finished (on another device: the pulled save) repairs his progress;
- never from a teacher's preview. Mastery of each learning point is unchanged: evidence only. Check:
  `kit/storyEnd.test.js`.

With that, the readers of `status: 'completed'` (the server keeps it monotonic and trusts the client's snapshot:
`LessonProgressService`) — the parent's link and weekly report, the teacher's tracking (`ClassroomProgressService`),
the school / admin reports (`AnalyticsService`, `StudentDossier`) — and those of the module count (`getLessonProgress`)
see a finished v2 lesson as done.

## 2. The lesson's folder

```
<lesson>/
  lesson.config.js     modules (as DATA), learning points, resources
  lesson.pack.js       the pack (§1)
  world/               what the game world is played with — index.js exports `lesson`: its keys and their tablets, its
                       FORGES (one per key: no rule is told — GAME_WORLD.md §2sexies), the practice ladder, the trainer,
                       the exam sittings, the journey, the evidence, the knowledge page, its sentences (GAME_WORLD.md §3)
  board/script.js      the lesson on the board (CLASS_SESSION.md §5ter)
  board/memo.js        the written memo (CLASS_SESSION.md §2quater)
  routes.jsx           calls `buildLessonRoutes({ config, basePath, loadIndex })` of `lessons/common/lessonRoutes.jsx`:
                       the home, and each module address → the home
  index.jsx            renders `lessons/common/components/LessonIndex.jsx`
```

**ONE knowledge source**: what the lesson knows is the file its pack names (`knowledge`, written in
`world/knowledge.js`), shown by the world's knowledge map, the board's knowledge card and the exam coach.
`validate:lessons` asks that this file export `KNOWLEDGE_GRAPH`.

**The modules as the platform shows them.** A module's `title` is TEXT read by the parent, the teacher's tracking and
the reports: it names what the module stands for in the v2 lesson — the key or the stage the world marks (`onModule`),
the lesson's problem for the last bridge, the evaluation — never an activity or a textbook section. The teacher's unit
page shows no module chips for a lesson whose pack has a world (`LessonModuleChips`), and « continue » / the progression
tree open its home (`getResumeLesson.js › getResumeModulePath`).

**How the checks know a v2 lesson** — by what it IS: a lesson folder with a `lesson.pack.js` that exports
`LESSON_PACK` (§1). `scripts/validate-lessons.mjs` reads it so since 2026-11-23 (`scripts/validate-lib.mjs ›
isV2Lesson`, `packWorldId`, `packKnowledgePath`; tests `scripts/validate-lib.test.mjs`): the world `mission-isle` marks
a unit's last lesson, the pack's `knowledge` names the file that must export `KNOWLEDGE_GRAPH`, and the text
`retiredModules: true` in a `routes.jsx` proves nothing. `scripts/audit-knowledge-dependencies.mjs` (a v2 lesson has
no exposure stream to audit) and `apps/web/scripts/lesson-v2-status.mjs` (« the old version is deleted », the
retirement ledger) read the pack the same way since 2026-11-23 (`isV2Lesson`); no script looks at `routes.jsx` any
more.

## 3. Is a lesson done? — the status script and the definition of done

```bash
npm run status:lesson-v2                      # every lesson that has a pack
npm run status:lesson-v2 -- --lesson <id>     # one lesson, part by part; exit 1 unless it prints ✅
```

**A unit's LAST lesson** (the integration lesson) is a v2 lesson of another kind: its pack names the world
`mission-isle`. Its `world/` holds `index.js` (`keys: []`, `missions`, `bank`, `recap`, `sittings`, `journey`, `text`),
`sitting.js` (the bank, as it is) and `text.js`; its situations are data files of `missions/`, each with its test. No
forge, no trainer, no knowledge map, no instrument: the status script prints those parts ➖. Its Algerian model was
built on the BEM's integration situation; what the French one rests on (the brevet) is not decided (plan §5, 2G).

**The teacher of a v2 lesson that has no board yet** (`features/classSession/boardLessons.js`): his page is his card
alone; `hasTeacherBank` gives him the teacher's own bank; `toolHasContent` keeps in the common header only the tools
that have content for the lesson; the memo door comes back with the board.

`apps/web/scripts/lesson-v2-status.mjs` reads files and markers and judges nothing. Its parts, for one lesson:

| Part | What it looks at |
|---|---|
| the pack | `lesson.pack.js` and its flags in the generated index |
| S2 the world | `pack.world`; the nine files of `world/` (`index`, `forges`, `practice`, `trainer`, `sitting`, `journey`, `evidence`, `knowledge`, `text`); a test for six of them |
| S2 every rule is forged | every key of `world/journey.js › KEYS` has its forge in `world/forges.js` |
| S3 knowledge, S6 exam coach | `pack.knowledge`, `pack.coach` |
| S4 the practice bank is the exam sheet | the lesson is in `content/practice/exam-style.json` (the script still labels it « BEM ») |
| S4bis the bank is served AS IT IS | the lesson's `world/sitting.js` is ONE call to `createBankSittings({ lesson })` (`kit/bankSitting.js`), and no `createSittings` |
| S8 the lesson's lab | an instrument tagged with the lesson in `lessonlab/registry.js` |
| S1 the launch kit | every CORE tool of the learning net for the lesson has a family in `launchkit/families.js` |
| T1–T3 the board | `pack.board`, `board/script.js`, `board/memo.js`; a board test that computes every number (`board/board.test.js`) |
| T2 the class test | `content/class-tests/<grade>/<id>.json` |
| the phone | **PAUSED**: `pack.phone` stays `false`; not part of « done » |
| a walk | a walk of `apps/web/e2e/` that names the lesson and plays its world |
| published | status `available` in the catalogue |
| no module page | no `modules/`, a `lesson.pack.js` exporting `LESSON_PACK` (`isV2Lesson`, §2), no mission player in `lesson.config.js` |

**A lesson is done when**:

1. the status script prints ✅ for it;
2. its unit tests pass — in particular `world/forges.test.js`: for every forge exactly one rule holds and every other is
   refuted in front of the student;
3. its walk passes at 1366×768 — the ONE size;
4. its screenshots were looked at with the eyes, student and teacher;
5. `check:lessons`, the entry budget, lint, `check:unused`, `check:unreached` and `check:format` pass;
6. its docs are updated and it is committed.

NOT in the script yet: a weight budget per lesson; the content checks of `check:lessons` do not read a lesson's
`world/` and `board/` folders. The content rules a French lesson must respect: `FRENCH_LANGUAGE_CONTRACT.md` §9 and plan
§7 — not yet applied in the code.
