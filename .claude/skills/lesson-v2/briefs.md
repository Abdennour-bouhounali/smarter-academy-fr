# The briefs — the source the role cards are condensed from

**Since the lean pipeline (`SKILL.md` §2–§3, `docs/TWO_PLATFORMS_PLAN.md` §6) an agent reads its CARD (`cards/`), not
this file.** The three blocks of §0 and the sections §W, §B, §F, §P, §X stay here as the SOURCE the cards were
condensed from: a rule changes HERE first, then in the card that repeats it, in the same task. A brief is now the short
« fill these » list of §0 for its role. §K (a new kind or mode) and §R (a fix batch) are still pasted as written: the
forges' and walk-fix cards point to them. Below, `<…>` are the facts a brief fills. `<L>` is the
lesson's folder (`apps/web/src/lessons/college/<grade>/<theme>/<unit>/<code>/`), `<code>` its id (the French
`lessonCode`), `<REF>` the reference lesson — the most recent FRENCH lesson of the same world that is « done »; while
none is done, the Algerian lesson the port map names (`../smarter-academy-dz/apps/web/src/lessons/moyen/…`, READ only;
for `divisor-isles` the most complete are `bahth-pgcd`, `awwaliyan-fima-baynahuma`, `ikhtizal-kasr`). `<DZ>` is the
Algerian lesson(s) the port map (`SKILL.md` §1bis) converts, with the list of its files that come over. Launch agents
with the Agent tool, on the model `SKILL.md` §2 names for the step, in the main tree (a worktree misses untracked
folders). When a lesson teaches something a template did not foresee, correct the template and the card (`SKILL.md` §5).

## §0. A brief per role — fill these

Every brief, whatever the role:
1. « Read `.claude/skills/lesson-v2/cards/<role>.md` — it binds you, with the root `CLAUDE.md` — and the files you touch.
   Nothing else unless the card's « Not enough? » sends you there. »
2. The lesson: `<grade>` `<code>` « `<French title>` », folder `<L>`, world `<world>`; the design section to read
   (`docs/reports/<page>` › `<heading>`); `<REF>` if not lesson 1.
3. The port map's lines for this role: `<DZ files, each port / cut / new>` (`SKILL.md` §1bis).
4. You write ONLY `<files>`; at the same time `<other agent>` writes `<their files>` — never edit those.
5. What the agents before reported that you need: `<hooks, numbers, what the student holds>`.
6. Only a limit this lesson ADDS to the card's (never the card's limits pasted again).
7. « Final message ≤ 300 words; the details in `<scratch>/reports/<code>-<role>.md`. »

Per role, the facts that role also needs:

| Role (card, model) | Also fill |
|---|---|
| bank (`bank.md`, `sonnet`/`haiku`) | the learning points and their weights (`lesson:brief`); the DZ bank ids to port and the count per level; the numbers reserved for the story (never in the bank) |
| world (`world.md`, `sonnet`) | the design's islands, gaps, keys with their ids, convoys, the final mission with its right plank and its distractor; the numbers already cleared by `lesson-bank-numbers.mjs` |
| board (`board.md`, `sonnet`) | the keys in order and their tablets; the net item of the warm-up family; the class test's learning points |
| forges (`forges.md`, `opus`) | per key: its experiment (kind, mode, numbers), the wrong rules students really hold, its `use`; what the student HOLDS when each forge opens (the world agent's report); a §K task: paste §K |
| walk-fix (`walk-fix.md`, `opus`) | the failing lines of the walk (or the numbered defects of a review: paste §R); the frozen copy's path; who owns which files |
| gate A / gate B (`fable`, no card) | `SKILL.md` §3 « A gate's brief » |

## §0 (source). The three blocks every brief carried — condensed into the cards

**Header**

> You are `<the task in one line>` of one lesson of the repo at
> `/home/abdennour/Projects/smarter-academy/smarter-academy-fr-next` (branch `rebuild/dz-core`; the French maths
> platform for the collège, 6e–3e, French, left to right; React + Vite, JSX, no TypeScript; rebuilt on the Algerian
> platform's engine). Read the root `CLAUDE.md` first: it binds you. Then read `.claude/skills/lesson-v2/defects.md`:
> every line is a mistake already made — do not make it again, and say in your report which lines your work could have
> hit. Then `docs/architecture/FRENCH_LANGUAGE_CONTRACT.md`: every word a student or a teacher reads follows it. Another
> session orchestrates, reads your diff and runs the browser walks.
> The lesson: `<grade>` `<code>` « `<French title>` » (`<place in its unit>`), folder `<L>`, on the world `<world>`.
> What it must teach is `npm run -s lesson:brief -- <code>` (its learning points, from the official French texts) and
> some exercises of its bank `content/practice/<grade>/<code>/` — nothing else; never a textbook, a tutoring site or the
> old French site.
> **What comes from the Algerian platform** (`SKILL.md` §1bis — the port map): `<DZ files, each: port / cut / new>`.
> Read them in `../smarter-academy-dz` (NEVER write there) and CONVERT them: each string rewritten from its job (never
> word for word), dinars → plausible euros, Algerian contexts and names → French ones, LTR, `\\times`, `{,}`,
> « PGCD(12 ; 18) », the Algerian steps outside this lesson's points cut.

**Limits**

> - Write ONLY: `<the files of this agent>`. Other agents write at the same time in: `<their files>` — never edit those.
>   A shared document is edited by small anchored replacements with the Edit tool, never rewritten whole; a registration
>   in a shared file is your LAST edit. Never write in `../smarter-academy-dz`.
> - If a shared file is wrong or lacks something you need, do NOT bend your work around it silently: report exactly what
>   is missing.
> - Checks you run: `cd apps/web && npx vitest run <your files> --maxWorkers=2`, `npx eslint` and `npx prettier --check`
>   on your files. Do NOT run a walk, a build, the whole suite or `check:lessons`. Do NOT commit, do not touch git state.
> - One screen, no scroll, at 1366×768 — the ONE size (owner, 2026-11-19); text (SVG text included) at least 12 px at
>   its real size, 18 px for what a student must read; a formula never breaks across two lines (LaTeX in a JS string
>   takes two backslashes; a plain string holds no `$`); a typed answer in its own shape, with printed units; brand blue
>   shapes, never black; drawn in code, never an image.
> - French, « tu » to the student, « vous » to the teacher; French typography (« … » with no-break spaces, U+00A0
>   before « : », U+202F before « ; ! ? », « ’ », « 3e »); the decimal comma (`{,}` in LaTeX); money « 12,50 € » with a
>   no-break space, plausible French prices; « × » for a product; « PGCD(12 ; 18) »; the vocabulary of the contract
>   (« clé », « forge », « palier », « savoir-faire », « leçon », « chapitre »). French agreement through the helpers
>   (`counted(n, ['planche', 'planches'])` — 0 and 1 take the singular), never a number glued to a noun by hand; a tile
>   worded so it needs no agreement with another tile.
> - Own contexts, own numbers, own wording — never a textbook's, never a line of the exercise bank. Neutral everyday
>   French contexts that exclude nobody (no religion, no brand, no alcohol, no tobacco, no betting, no playing cards; a
>   die, a coin, an urn, a spinner only as an experiment); first names of today's France, boys and girls equally;
>   `KidFigure` in ordinary clothes, varied hair, no headscarf by default.

**Report**

> Your final message: (1) what you changed, file by file — and for each ported file, what you kept, converted and cut;
> (2) what you ran, with numbers; (3) what you could NOT verify without a browser — name the screens the orchestrator
> must look at; (4) what you are unsure of, and every design choice you made that the brief left open; (5) defects you
> saw and did not fix. Never say something passes that you did not run.

## §W. The written world (wave 1)

> **Build on the authoring kit: `apps/web/src/lessons/common/gameworld/kit/authoring/README.md` — read it first.**
> Before any number is used: `node scripts/lesson-bank-numbers.mjs <code> --check a,b c,d …` must print CLEAR for every
> pair of the road, and `buildersOf(gaps, purse)` (`authoring/test/suites.js`) must give exactly the convoy's plank.
> `math.js` re-exports what it needs from `authoring/numbers.js` (never a copy) and holds `NUMBERS`, the words of its
> own world and the number helpers of its own maths (lesson 1: `powersOf`, `powTex`…). The French typography layer
> `fr` / `frAll` lives TODAY in lesson 1's `world/math.js`, not in the kit: a second lesson never copies it (D8) — the
> session moves it into `authoring/numbers.js` first (a kit edit) and every lesson imports it from there.
> Each test file calls its shared suite in three lines (`describeStory`, `describeEvidence`,
> `describeTrainer`, `describeKnowledge`, `describeLimits`, `describeSitting`, from `authoring/test/suites.js` — the
> story suite also runs `typographyErrors` on every sentence), then adds ONLY the lesson's own checks. Never re-write a
> helper or a check the kit has. If a suite fails on a limit, that screen is walked; the limit is never raised to make the
> test pass.

> Task: write `<L>/world/` — every file EXCEPT `forges.js` and `inquiries.js` (another agent writes those next):
> `story.js`, `math.js`, `text.js`, `practice.js`, `trainer.js`, `journey.js`, `knowledge.js`, `evidence.js`,
> `sitting.js`, `index.js`, and `limits.test.js`. Tests: the status script requires one for `forges`, `practice`,
> `trainer`, `sitting`, `journey`, `evidence` (`lesson-v2-status.mjs › WORLD_TESTED`); lesson 1 also has `story`,
> `math`, `limits`; `knowledge.js` is tested by `journey.test.js` (`describeKnowledge`); `text.js` and `index.js` have
> none. `limits.test.js` imports `board/script.js` and `forges.js` — it fails until wave 2 and the board exist.
> Start from: `<DZ>/world/` — the files the port map keeps, converted (`SKILL.md` §1bis P4); the keys it cuts are
> removed with their numbers, sentences, knowledge cards and evidence points.
> Read first: `npm run -s lesson:brief -- <code>`; `docs/architecture/LESSON_V2.md` (the folder, evidence §1bis);
> the lesson's section of `<the design page>`; `<REF>/world/` — every file and its test; `kit/claims.js`,
> `kit/bankSitting.js`, `guardEvidence`.
> - The story is the design's: `<islands, gaps, keys with their ids, what happens between them>`. Its hook `objective`
>   gives the WHOLE instruction of each step (it stays on screen; the robot Zéro's sentence does not), `recall` the card
>   of the island before; a situation that makes a rule necessary is declared with `convoy` / `convoys` (`GAME_WORLD.md`
>   §2ter-1) — `onArrive` must bear being run twice. Check every new number with `story.test.js` (no number of another
>   lesson, no headline pair of the lesson's bank) BEFORE using it elsewhere.
> - **The final mission must need the lesson**: `<the mission, its right plank and its distractor — the error the lesson fights>`.
> - Nothing states a rule or names a key before its forge: the story's `say`, the dash, the stone, the trainer's
>   guidance are played before some keys exist — check the order. Tablets and knowledge cards come after: they may.
> - Evidence: a claim only for a first-try, exam-format answer that is ENTIRELY right; it states the whole answer; write
>   the property test « `verifyClaim(claim) === check.ok` » for every trainer question type. A missing claim kind is
>   REPORTED (it is a §K task: `kit/claims.js` AND `ClaimVerifier.php` AND the shared fixture), never worked around.
> - Re-compute every answer key, distractor and hint from the numbers in a test; never trust a written key — nor a
>   ported one.
> - `sitting.js` is one call to `createBankSittings`. Knowledge cards use only kinds of `kit/text.js`. The map's
>   `POSITIONS`: no card cut by the box, no two cards overlapping, no link label under a card, with the panel open, at
>   1366×768 — compute it from the kit's CSS and give your margins (French titles are longer than the Arabic ones).
> Report also, for the forges' agent: what the student HOLDS when each key's island is reached (the bridges he crossed,
> with which planks, the last sentence he heard).

## §B. The board, the class test, the warm-up family (wave 1)

> Task: `<L>/board/script.js` (`SCRIPT`), `memo.js` (`MEMO`), `board.test.js`; `content/class-tests/<grade>/<code>.json`;
> the warm-up (launch-kit) family `<net item id>` if the status script says it is missing.
> Start from: `<DZ>/board/`, `../smarter-academy-dz/content/class-tests/<dzGrade>/<dzLesson>.json`, the DZ family of the
> same prerequisite in `launchkit/families.js` — converted (`SKILL.md` §1bis P4), re-keyed to the French net item.
> Read first: `lesson:brief`; the lesson's `world/story.js` and `world/knowledge.js` (read, never write);
> `CLASS_SESSION.md` (§5ter), `LAUNCH_KIT.md`; `<REF>/board/` and its class test; `launchkit/families.js`.
> - The hour: a situation of the lesson's own on numbers DIFFERENT from the student's story, then one question per key
>   in the order of the keys, each PROVED on the board before its rule is named, then the copybook pages. Use only
>   station types the board already plays; a missing one is reported, not bent.
> - **A station that is not about planks carries its own words** (`ask` step `words: { card, held, fell }`): never
>   « la planche … tient / s’effondre » for a sharing, a fraction, a classification.
> - No key's name on screen or in an oral cue before its naming station. « PGCD(20 ; 30) = 10 » inside a cue is a formula.
> - Every number of the script and the memo is computed by `board.test.js`. The class test's questions are the
>   platform's own, cover every learning point, each answer key re-computed from its `check`; a class test never
>   changes progress. No test of the repository re-reads a class test's `check` yet (`CLASS_SESSION.md` §4, the file's
>   own `_comment`): its key is proved by YOUR arithmetic and the session's eyes — say so in the report.
> - A warm-up family never shows the lesson's own instrument or names one of its keys (`labTool` is an instrument of an
>   EARLIER lesson, or null). Its lists are joined « 1, 2 et 4 » with `families.js › andList` (a local helper of that
>   file; no family exports a `listText`).
> Report also what a walk of the board must click, and what differs from `<REF>`'s board walk.

## §F. The forges and their experiments (wave 2)

> **Assemble each forge from `authoring/forgeBlocks.js`** (the README's skeleton): `judge({ slots, right, says })` for
> the tiles; `fromLog` / `gather` / `fromRounds` for the evidence; `hard` and `firstBreak` for the attacks and the
> refutations; `line` and the boxes (`powerBox`, `pgcdBox`, `fractionBox`…), `makerOf`, `firstWrong` for the last step.
> A lesson whose cases are PAIRS of gaps (the Algerian PGCD lessons) also takes `attacksOf({ pool: pairPool({… exclude:
> BANK_PAIRS }), hard })` and `plankCase` / `pairCase`, `BANK_PAIRS` pasted from `node scripts/lesson-bank-numbers.mjs
> <code> --js`; lesson 1 (one number at a time) uses none of those three — it imports `judge`, `gather`, `hard`,
> `firstBreak`, `lazy`, `line`, `noPredictions`, `powerBox`. The lesson writes only what the tiles mean, the words,
> the hard cases and the last step's numbers. `forges.test.js` calls `describeForges(...)`, `inquiries.test.js` calls
> `describeExperiments(...)`; then only the « false rules students really hold » tests.

> Task: `<L>/world/forges.js`, `inquiries.js`, `forges.test.js`, `inquiries.test.js`, and the minimal edits they need
> in `story.js` / `text.js` / `math.js` / `index.js` (say which).
> Start from: `<DZ>/world/{forges,inquiries}.js` for the keys the port map keeps — their tiles REWRITTEN in French so
> that no tile agrees with another; the false rules kept (they are the students' real errors) and re-worded.
> The owner's rule: no rule is told. Each key is FORGED: an experiment made for the nature of that rule (he tries,
> predicts, the world answers with FACTS) → he writes his rule with tiles (unless the experiment itself wrote it) → the
> mirror tests it on HIS evidence → attacks it → seal → a last step where he USES it → only then the tablet names it.
> Exactly one rule holds; every other rule the tiles can write is refuted by a computed case. A help never narrows to a
> choice between two written rules. No two keys share a (kind, mode).
> Read first: `GAME_WORLD.md` §2sexies and « Explore » (the table of kinds, the spec blocks of the kinds you use);
> the lesson's section of `<the design page>`; `<REF>/world/{forges,inquiries}.js` and their tests; `kit/forge.js`,
> `kit/RuleForge.jsx`, `divisorIsles/ruleForge.js`, `forgeParts.jsx`, and the logic and screen of each kind you use (to
> know EXACTLY which `text.*` keys the screen calls, with which arguments, which are plain strings).
> What the student holds when each forge opens: `<from the world agent's report>`.
> The forges: `<per key: its experiment (kind, mode, numbers), the wrong rules students really hold, its `use`>`.
> - Every sentence of an experiment is a FACT; `inquiries.test.js` lists the forbidden words of each key (in French:
>   « premier », « décomposition », « facteur premier »… — the words of its NAME) and fails if two keys share a
>   (kind, mode). `forges.test.js` enumerates EVERY rule the tiles can write and refutes each wrong one, and checks each
>   `use` accepts its solution and refuses near misses.
> - **A key discovered ON THE ISLANDS** (`review.md` §A.0): no `inquiry`; `evidence(log)` builds the rows from the
>   world's log of bridges; `predictCases` returns none (the forge opens on its tiles); a case about two gaps carries
>   `pair`. He may have tried ONE plank only: the mirror's tests and attacks must still refute every wrong rule.
> - **A key that is not about a bridge** (a sharing, a fraction, a decomposition …): its cases carry what the world's
>   `forgeParts.jsx` needs to draw them in their own language (a sharing: `deal`); no tag, attack or refutation says
>   « planche », « fossé », « pont » — test it.
> - The `use` contexts: read each sentence built from a template with 0, 1, 2 and 11+, for each noun's gender
>   (« une planche », « un fossé ») and its elision (« de 8 » / « d’8 » never; « l’île », « le 11 »).
> Report also, for the walks' agent: per forge, the hooks a walk clicks, in order, with the right tiles and one false
> rule that shows a refutation.

## §P. The pack and the satellites (wave 2) — now two commands, no agent

`npm run lesson:new -- <code> --world <world>` writes the pack, the config, the routes, `index.jsx` (as `.draft` files);
`npm run lesson:assemble -- <code>` does the catalogue status, the Prettier lists, the generators, the KEPT lines,
check-routes and the status line, then prints what it does NOT do (the bank and class test, the walk descriptor, the
lab tag and launch-kit families, the comments above the KEPT lists, new dead files, the docs, the heavy checks) — the
session does that to-do (`SKILL.md` §2 step 4). The block below is the rule set those commands follow.

> Task: `<L>/lesson.pack.js`; `<L>/lesson.config.js` (modules as DATA, learning points); `routes.jsx`, `index.jsx`; the
> generated index; the tests that enumerate.
> Read first: `LESSON_V2.md` (the pack §1, the folder §2); `<REF>/{lesson.pack.js, routes.jsx, lesson.config.js}`;
> `npm run -s status:lesson-v2 -- --lesson <code>`.
> - There is NO old version here (every Algerian lesson was deleted from this tree): nothing to trace or delete. What the
>   Algerian `OLD_VERSION_TRACE` method still teaches: every list or test that enumerates lessons or modules is found and
>   updated (`apps/web/src/`, `e2e`, `scripts`, `packages`, `content`), and the unit's integration lesson's tests read the
>   other lessons' knowledge.
> - The pack like `<REF>`'s: `phone: false`, the world, `knowledge`, `coach` (each learning point → a knowledge sheet),
>   `board`. `lesson.pack.js` exporting `LESSON_PACK` is what makes the lesson v2 for `validate-lessons.mjs`
>   (`scripts/validate-lib.mjs › isV2Lesson`) — and for `audit-knowledge-dependencies.mjs` and
>   `apps/web/scripts/lesson-v2-status.mjs` too, which read the pack through the same `isV2Lesson`. No marker
>   `retiredModules: true` is written in `routes.jsx` (`buildLessonRoutes` does not take it).
> - Neutral module titles in French (they are read by the parent, the teacher's tracking, the reports).
> - `npm run generate:lesson-index`; the lesson's folder in the two Prettier lists of `package.json`; the lines of
>   `check:unreached`'s `KEPT` list that this lesson now reaches leave it.
> - A test is updated to the new truth, never weakened. A test that imports every pack gets its own time limit.
> Checks, ONE AT A TIME: the pack, registry and class-session tests and the lesson's folder; the status script;
> `check:unreached` and `check:unused` once each (report only what concerns this lesson).

## §X. The walks (alone in the tree) — through the shared library

> Task: write `apps/web/e2e/lessons/<code>.walk.mjs`, a DESCRIPTOR for `apps/web/e2e/lib/lessonWalk/` (its `README.md` is
> the contract; the model is lesson 1's `apps/web/e2e/lessons/decomposer-en-facteurs-premiers.walk.mjs` — the
> Algerian `bahth-pgcd.walk.mjs` the README names is NOT in this tree: `../smarter-academy-dz/apps/web/e2e/lessons/`),
> and RUN it. Write no other walk file. (Under the lean pipeline the descriptor is written WITH the lesson from the
> design's « walk's outline », and this brief is used only on a failing walk — `cards/walk-fix.md`.)
> The descriptor says only what the lesson's files cannot: `uid`, `forbidden` (per key, the French words of its name),
> `benchForbidden`, `story` (`{ wrongFirst, purseOut, markMiss, fallFirst, reloadOn }` — lesson 1 uses
> `{ fallFirst, reloadOn }`), `truth` (per forge, what the world does with a case — your own arithmetic), `use` (per
> forge, every box of the last step computed from the case shown), `falseTiles` / `useWrong` when the defaults do not
> fit, `dash`, `gate`, `solve` (per trainer form), `launch` (REQUIRED: `{ scenario, tool, tools }`), optionally
> `statement`, `train` — the README's descriptor table is the contract.
> The library DERIVES the rest — do not write it: the tiles of the rule that holds, the false rule, each convoy's right,
> wrong and purse-out planks, the bench's answers, the board's right picks, the foreign words and numbers, the map's
> cards, each trainer session's kinds.
> Anything new to the library (a segment, a board station, an experiment kind, a last step with buttons) stops the walk
> with a sentence: write it as a hook in `steps`, make it pass, then MOVE it into the library in the same task (README
> « Adding to the library »). Never weaken a library check for one lesson; a check wrong for every lesson is fixed in the
> library and said in the report (defects.md C4). The library was translated on 2026-11-23 and has not run since: a
> failure of the library itself is likely on the first French lesson — fix it there, say so loudly.
> **ONE size: `E2E_SIZE=1366x768`**. Run (dev server on :5173; ONE walk at a time; never edit source while it runs):
> `node apps/web/e2e/lesson.mjs <code> story <out>`, then `… hub`, `trainer`, `board`, `launch`; `sitting` alone, once.
> The runner mutes Vite's HMR.
> **Eyes (SKILL.md §0bis): about TEN chosen screens** — the ones this lesson is the first to show (on the first French
> lesson: all the kinds of screen once). Read those PNGs; do not open the rest.
> Fix what the walks find (in the lesson; in the kit or the library when the defect is there — smallest change, tested,
> said loudly). Expected: descriptor 15–20 min; the five parts ≈ 5 min a run.
> Report: each line `walk lesson-<code>-<part> @ 1366x768: N ok, F FAIL, S s`; the hooks written and whether they moved
> into the library; the screens you LOOKED at; every defect fixed (file, cause); what you did NOT verify; lines for
> `defects.md` and `trusted.md`; YOUR OWN TIME in minutes.

## §K. A new experiment kind, a new mode of one, or a new claim kind

> Task: add the kind `<name>` to the world `<world>` — new files beside the newest kind (`<its files>`): pure logic and
> reducer, a pure view, its CSS, a logic test, a render test; ONE registration edit, made LAST: a new KIND in the
> `[spec.kind]` table of `divisorIsles/Inquiry.jsx`; a new MODE of `ladder` in `divisorIsles/InquiryGcd.jsx › Ladder`
> (`if (mode === '…')`, as `fold`, `both`, `factor`) — other kinds dispatch their modes in their own view.
> (A CLAIM kind instead: `kit/claims.js` AND `apps/api/app/Domain/GameWorld/ClaimVerifier.php` (`KINDS`, `verify`) AND
> true and false rows in `apps/api/tests/Fixtures/game-claims.json` — `LESSON_V2.md` §1bis.)
> Start from: the Algerian kind closest to it, if the port map names one (its spec block in `GAME_WORLD.md`).
> Read first: `GAME_WORLD.md` « Explore » (the table of kinds, « To add a kind », the spec blocks — the conventions);
> the design page's row for this kind.
> What it is: `<the nature of the rule; what the student does, step by step; what the world answers>`.
> - Nothing in the kit states a rule or holds a lesson's words: every sentence comes from `spec.text`. A render test
>   fails if the kit itself writes French beyond its shared labels (`kit/text.js`).
> - Predictions before facts. The result object carries what a forge needs as evidence (what HE did, right and wrong).
> - `data-iq-*` hooks for every control a walk must drive; `window.__inquiry`.
> - Logic tested exhaustively over the range the lessons use; the state machine played through with wrong moves.
> - For a MODE of an existing kind: a spec without the mode renders and plays exactly as before — run the tests of
>   every lesson that uses the kind.
> Docs: the kind's row, spec block, sounds, tests and files in `GAME_WORLD.md`; the count of kinds re-read just before
> your edit.
> Report also every design choice left open (they go to the owner or get an answer), and the screens to look at when a
> lesson first uses the kind — a kind is never seen in a browser before that.

## §R. A fix batch after a review

> Task: fix the defects below, found by `<the walks / the screenshot review>` of `<code>`.
> You do NOT run walks: the orchestrator re-runs them on a frozen copy when you finish.
> For EACH defect: what was seen (the screen, the words), why it is a defect, what the fix must achieve — not how.
> `<numbered list>`
> - For each defect a machine can catch, add the check: a unit test, or an assertion in the lesson's walk (say that it
>   should move to the shared library).
> - Update the walk's expectations when you change a number or a sentence; never weaken an assertion.
> - Two fix agents at once split by files (the student's world ∥ the board, the warm-up, the lab); a test of the
>   other agent's area that your change breaks is REPORTED with the fix it needs.
