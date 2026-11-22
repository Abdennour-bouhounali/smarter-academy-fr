# The briefs — one template per agent

Fill the `<…>`; keep everything else. Every brief = §0 header + its own section + §0 limits + §0 report. `<L>` is the
lesson's folder, `<id>` its id, `<REF>` the reference lesson — the most recent lesson of the same world that is « done »
(today: `khawass-qawasim` for a written world, a board and walks; `qasim-mushtarak-akbar` once committed, for a key that
is not about a bridge). Launch agents with the Agent tool, `model: "opus"`, in the main tree (a worktree misses
untracked folders). When a lesson teaches something a template did not foresee, correct the template (`SKILL.md` §5).

## §0. The three blocks every brief carries

**Header**

> You are `<the task in one line>` of one lesson of the repo at `/home/abdennour/Projects/smarter-academy/smarter-academy-dz`
> (branch `dev`; an Arabic RTL maths platform for the Algerian middle school; React + Vite, JSX, no TypeScript). Read the
> root `CLAUDE.md` first: it binds you. Then read `.claude/skills/lesson-v2/defects.md`: every line is a mistake already
> made here — do not make it again, and say in your report which lines your work could have hit. Another session
> orchestrates, reads your diff and runs the browser walks.
> The lesson: `<grade>` `<id>` « `<Arabic title>` » (`<place in its unit>`), folder `<L>`. It is rebuilt from scratch:
> DO NOT read its old version (`modules/`, `content/`, the root `knowledge.jsx`, `moduleContext.js`).
> DO NOT read the textbook either, nor its extraction `docs/sources/**` (owner, 2026-11-19): what the lesson must
> teach is `npm run -s lesson:brief -- <id>` (its learning points) and some exercises of its bank
> `content/practice/<grade>/<id>/` — nothing else.

**Limits**

> - Write ONLY: `<the files of this agent>`. Other agents write at the same time in: `<their files>` — never edit those.
>   A shared document is edited by small anchored replacements with the Edit tool, never rewritten whole; a registration
>   in a shared file is your LAST edit.
> - If a shared file is wrong or lacks something you need, do NOT bend your work around it silently: report exactly what
>   is missing.
> - Checks you run: `cd apps/web && npx vitest run <your files> --maxWorkers=2`, `npx eslint` and `npx prettier --check`
>   on your files. Do NOT run a walk, a build, the whole suite or `check:lessons`. Do NOT commit, do not touch git state.
> - One screen, no scroll, at 1366×768 — the ONE size (owner, 2026-11-19; no other size is built or checked); text (SVG text included) at least 12 px at its real size;
>   a formula never breaks across two lines (LaTeX in a JS string takes two backslashes; a plain string holds no `$`);
>   a typed answer in its own shape, with printed units; money « دج », no thousands space; brand blue shapes, never
>   black; drawn in code, never an image; a list is joined with a no-break space before its comma.
> - Own contexts, own numbers, own wording — never the textbook's, never a line of the exercise bank. Respect Islam
>   (neutral Algerian everyday contexts). « الكفاءة », never « نقطة التعلّم ». Arabic number agreement through the
>   lesson's helpers (`counted`, `planks`, `cells`), never a number glued to a noun by hand.

**Report**

> Your final message: (1) what you changed, file by file; (2) what you ran, with numbers; (3) what you could NOT verify
> without a browser — name the screens and sizes the orchestrator must look at; (4) what you are unsure of, and every
> design choice you made that the brief left open; (5) defects you saw and did not fix. Never say something passes that
> you did not run.

## §W. The written world (wave 1)

> **Build on the authoring kit (since lesson 7): `apps/web/src/lessons/common/gameworld/kit/authoring/README.md` — read it
> first.** Before any number is used: `node scripts/lesson-bank-numbers.mjs <id> --check a,b c,d …` must print CLEAR for
> every pair of the road, and `buildersOf(gaps, purse)` (`authoring/test/suites.js`) must give exactly the convoy's
> plank. `math.js` re-exports what it needs from `authoring/numbers.js` (never a copy) and holds only `NUMBERS` and the
> words of its own world. Each test file calls its shared suite in three lines
> (`describeStory`, `describeEvidence`, `describeTrainer`, `describeKnowledge`, `describeLimits`, `describeSitting`, from
> `authoring/test/suites.js`), then adds ONLY the lesson's own checks. Never re-write a helper or a check the kit has. If
> a suite fails on a limit, that screen is walked; the limit is never raised to make the test pass.


> Task: write `<L>/world/` — every file EXCEPT `forges.js` and `inquiries.js` (another agent writes those next):
> `story.js`, `math.js`, `text.js`, `practice.js`, `trainer.js`, `journey.js`, `knowledge.js`, `evidence.js`,
> `sitting.js`, `index.js`, each with its test.
> Read first: `npm run -s lesson:brief -- <id>`; `docs/architecture/LESSON_V2.md` (the folder, evidence §1bis);
> the lesson's section of `<the design page>`; `<REF>/world/` — every file and its test; `kit/claims.js`,
> `kit/bankSitting.js`, `guardEvidence`.
> - The story is the design's: `<islands, gaps, keys with their ids, what happens between them>`. Its hook `objective`
>   gives the WHOLE instruction of each step (it stays on screen; the robot's sentence does not), `recall` the card of
>   the island before; a situation that makes a rule necessary is declared with `convoy` / `convoys` (`GAME_WORLD.md`
>   §2ter-1) — `onArrive` must bear being run twice. Check every new number
>   with `story.test.js` (no number of another lesson, no headline pair of the lesson's bank) BEFORE using it elsewhere.
> - **The final mission must need the lesson**: `<the mission, its right plank and its distractor — the error the lesson fights>`.
> - Nothing states a rule or names a key before its forge: the story's `say`, the dash, the stone, the trainer's
>   guidance are played before some keys exist — check the order. Tablets and knowledge cards come after: they may.
> - Evidence: a claim only for a first-try, exam-format answer that is ENTIRELY right; it states the whole answer; write
>   the property test « `verifyClaim(claim) === check.ok` » for every trainer question type.
> - Re-compute every answer key, distractor and hint from the numbers in a test; never trust a written key.
> - `sitting.js` is one call to `createBankSittings`. Knowledge cards use only kinds of `kit/text.js`. The map's
>   `POSITIONS`: no card cut by the box, no two cards overlapping, no link label under a card, with the panel open, at
>   1366×768 — compute it from the kit's CSS and give your margins.
> Report also, for the forges' agent: what the student HOLDS when each key's island is reached (the bridges he crossed,
> with which planks, the last sentence he heard).

## §B. The board, the class test, the launch-kit family (wave 1)

> Task: `<L>/board/script.js` (`SCRIPT`), `memo.js` (`MEMO`), `board.test.js`; `content/class-tests/<grade>/<id>.json`;
> the launch-kit family `<family id>` if the status script says it is missing.
> Read first: `lesson:brief`; the lesson's `world/story.js` and `world/knowledge.js` (read, never write);
> `CLASS_SESSION.md` (§5ter), `LAUNCH_KIT.md`; `<REF>/board/` and its class test; `launchkit/families.js`.
> - The hour: a situation of the lesson's own on numbers DIFFERENT from the student's story, then one question per key
>   in the order of the keys, each PROVED on the board before its rule is named, then the copybook pages. Use only
>   station types the board already plays; a missing one is reported, not bent.
> - **A station that is not about planks carries its own words** (`ask` step `words: { card, held, fell }`): never
>   « لوح … يثبت / ينهار » for a sharing, a fraction, a classification.
> - No key's name on screen or in an oral cue before its naming station. A Latin name inside an Arabic cue (« PGCD(20 ; 30)
>   = 10 ») is a formula or is isolated.
> - Every number of the script and the memo is computed by `board.test.js`. The class test's questions are the
>   platform's own, cover every الكفاءة, each answer key re-computed.
> - A launch family never shows the lesson's own instrument or names one of its keys (`labTool` is an instrument of an
>   EARLIER lesson, or null). Its lists are built with the family's `listText`.
> Report also what a walk of the board must click, and what differs from `<REF>`'s board walk.

## §F. The forges and their experiments (wave 2)

> **Assemble each forge from `authoring/forgeBlocks.js`** (the README's skeleton; `proof.bahth.test.js` rebuilds lesson
> 6's 🔁 that way): `judge({ slots, right, says })` for the tiles; `fromLog` / `gather` / `fromRounds` for the evidence;
> `attacksOf({ pool: pairPool({… exclude: BANK_PAIRS }), hard })`; `plankCase` / `pairCase`; `makerOf`,
> the template lines and `firstWrong` for the last step. `BANK_PAIRS` is pasted from
> `node scripts/lesson-bank-numbers.mjs <id> --js`. The lesson writes only what the tiles mean, the words, the hard
> cases and the last step's numbers. `forges.test.js` calls `describeForges(...)`, `inquiries.test.js` calls
> `describeExperiments(...)`; then only the « false rules students really hold » tests.


> Task: `<L>/world/forges.js`, `inquiries.js`, `forges.test.js`, `inquiries.test.js`, and the minimal edits they need
> in `story.js` / `text.js` / `math.js` / `index.js` (say which).
> The owner's rule: no rule is told. Each key is FORGED: an experiment made for the nature of that rule (he tries,
> predicts, the world answers with FACTS) → he writes his rule with tiles (unless the experiment itself wrote it) → the
> mirror tests it on HIS evidence → attacks it → seal → a last step where he USES it → only then the tablet names it.
> Exactly one rule holds; every other rule the tiles can write is refuted by a computed case. A help never narrows to a
> choice between two written rules. No two keys share a (kind, mode).
> Read first: `GAME_WORLD.md` §2sexies and « استكشف » (the table of kinds, the spec blocks of the kinds you use);
> the lesson's section of `<the design page>`; `<REF>/world/{forges,inquiries}.js` and their tests; `kit/forge.js`,
> `kit/RuleForge.jsx`, `divisorIsles/ruleForge.js`, `forgeParts.jsx`, and the logic and screen of each kind you use (to
> know EXACTLY which `text.*` keys the screen calls, with which arguments, which are plain strings).
> What the student holds when each forge opens: `<from the world agent's report>`.
> The forges: `<per key: its experiment (kind, mode, numbers), the wrong rules students really hold, its `use`>`.
> - Every sentence of an experiment is a FACT; `inquiries.test.js` lists the forbidden words of each key and fails if
>   two keys share a (kind, mode). `forges.test.js` enumerates EVERY rule the tiles can write and refutes each wrong one,
>   and checks each `use` accepts its solution and refuses near misses.
> - **A key discovered ON THE ISLANDS** (`review.md` §A.0): no `inquiry`; `evidence(log)` builds the rows from the
>   world's log of bridges; `predictCases` returns none (the forge opens on its tiles); a case about two gaps carries
>   `pair`. He may have tried ONE plank only: the mirror's tests and attacks must still refute every wrong rule.
> - **A key that is not about a bridge** (a sharing, a fraction …): its cases carry what the world's `forgeParts.jsx`
>   needs to draw them in their own language (a sharing: `deal`); no tag, attack or refutation says « لوح », « هوّة »,
>   « جسر » — test it.
> - The `use` contexts: read each sentence built from a template with 1, 2, 3–10 and 11+, and for each noun's gender.
> Report also, for the walks' agent: per forge, the hooks a walk clicks, in order, with the right tiles and one false
> rule that shows a refutation.

## §P. The pack, the satellites, the old version deleted (wave 2)

> Task: `<L>/lesson.pack.js`; trace then delete the lesson's old version; the generated index; the tests that enumerate.
> Read first: `LESSON_V2.md` (the pack §1, the folder §2, the retirement ledger); `OLD_VERSION_TRACE_2026-11-18.md` —
> the METHOD (do exactly the same; add this lesson's section); `<REF>/{lesson.pack.js, routes.jsx, lesson.config.js}`;
> `npm run -s status:lesson-v2 -- --lesson <id>`.
> - Phase 1: trace every reader of every old file (the whole repo: `apps/web/src`, `e2e`, `scripts`, `packages`,
>   `content`, `docs/reports/knowledge-contracts`, the unit's `_unit/`, lists and tests that enumerate lessons or
>   modules — and the unit's integration lesson, whose tests read the other lessons' knowledge).
> - The pack like `<REF>`'s: `phone: false`, the world, `knowledge`, `coach` (each الكفاءة → a knowledge sheet), `board`.
> - Phase 2: delete the module pages, `moduleContext.js`, the root knowledge files, the `content/` files nothing new
>   reads, the mission-player keys of the config; `routes.jsx` with `retiredModules: true`; neutral module titles.
> - `npm run generate:lesson-index`; the lesson's folder in the two Prettier lists of `package.json`.
> - A test is updated to the new truth, never weakened. A test that imports every pack gets its own time limit.
> Checks, ONE AT A TIME: the pack, registry and class-session tests and the lesson's folder; the status script;
> `check:unreached` and `check:unused` once each (report only what concerns this lesson).
> Report also the walks that still open this lesson's deleted pages.

## §X. The walks (alone in the tree) — through the shared library (since lesson 7)

> Task: write `apps/web/e2e/lessons/<id>.walk.mjs`, a DESCRIPTOR for `apps/web/e2e/lib/lessonWalk/` (its `README.md` is
> the contract; `lessons/bahth-pgcd.walk.mjs` is the model, 78 lines), and RUN it. Write no other walk file.
> The descriptor says only what the lesson's files cannot: `forbidden` (per key, the words of its name),
> `benchForbidden`, `story` (`{ wrongFirst, purseOut, reloadOn }`), `truth` (per forge, what the world does with a case —
> your own arithmetic), `use` (per forge, every box of the last step computed from the case shown), `dash`, `gate`,
> `solve` (per trainer form), optionally `statement`, `train`, `launch`.
> The library DERIVES the rest — do not write it: the tiles of the rule that holds, the false rule, each convoy's right,
> wrong and purse-out planks, the bench's answers, the board's right picks, the foreign words and numbers, the map's
> cards, each trainer session's kinds.
> Anything new to the library (a segment, a board station, an experiment kind, a last step with buttons) stops the walk
> with a sentence: write it as a hook in `steps`, make it pass, then MOVE it into the library in the same task (README
> « Adding to the library »). Never weaken a library check for one lesson; a check wrong for every lesson is fixed in the
> library and said in the report (defects.md C4).
> **ONE size: `E2E_SIZE=1366x768`** (owner, 2026-11-19). Run (dev server on :5173; ONE walk at a time; never edit source
> while it runs): `node apps/web/e2e/lesson.mjs <id> story <out>`, then `… hub`, `trainer`, `board`, `launch`; `sitting`
> alone, once. The runner mutes Vite's HMR.
> **Eyes (SKILL.md §0bis): about TEN chosen screens** — the ones this lesson is the first to show (what its agents
> reported as beyond `trusted.md`'s limits or new). Read those PNGs; do not open the rest.
> Fix what the walks find (in the lesson; in the kit or the library when the defect is there — smallest change, tested,
> said loudly). Expected: descriptor 15–20 min; the five parts ≈ 5 min a run.
> Report: each line `walk lesson-<id>-<part> @ 1366x768: N ok, F FAIL, S s`; the hooks written and whether they moved
> into the library; the screens you LOOKED at; every defect fixed (file, cause); what you did NOT verify; lines for
> `defects.md` and `trusted.md`; YOUR OWN TIME in minutes.

## §K. A new experiment kind, or a new mode of one

> Task: add the kind `<name>` to the world `<world>` — new files beside the newest kind (`<its files>`): pure logic and
> reducer, a pure view, its CSS, a logic test, a render test; ONE registration edit in `Inquiry.jsx`, made LAST.
> Read first: `GAME_WORLD.md` « استكشف » (the table of kinds, « To add a kind », the spec blocks — the conventions);
> the design page's row for this kind.
> What it is: `<the nature of the rule; what the student does, step by step; what the world answers>`.
> - Nothing in the kit states a rule or holds a lesson's words: every sentence comes from `spec.text`. A render test
>   fails if the kit itself writes Arabic beyond its shared labels.
> - Predictions before facts. The result object carries what a forge needs as evidence (what HE did, right and wrong).
> - `data-iq-*` hooks for every control a walk must drive; `window.__inquiry`.
> - Logic tested exhaustively over the range the lessons use; the state machine played through with wrong moves.
> - For a MODE of an existing kind: a spec without the mode renders and plays exactly as before — run the tests of
>   every lesson that uses the kind.
> Docs: the kind's row, spec block, sounds, tests and files in `GAME_WORLD.md`; the count of kinds re-read just before
> your edit.
> Report also every design choice left open (they go to the owner or get an answer), and the screens and sizes to look
> at when a lesson first uses the kind — a kind is never seen in a browser before that.

## §R. A fix batch after a review

> Task: fix the defects below, found by `<the walks / the screenshot review>` of `<id>`.
> You do NOT run walks: the orchestrator re-runs them on a frozen copy when you finish.
> For EACH defect: what was seen (the screen, the size, the words), why it is a defect, what the fix must achieve — not
> how. `<numbered list>`
> - For each defect a machine can catch, add the check: a unit test, or an assertion in the lesson's walk (say that it
>   should move to the shared library).
> - Update the walk's expectations when you change a number or a sentence; never weaken an assertion.
> - Two fix agents at once split by files (the student's world ∥ the board, the launch kit, the lab); a test of the
>   other agent's area that your change breaks is REPORTED with the fix it needs.
