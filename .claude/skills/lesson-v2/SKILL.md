---
name: lesson-v2
description: Build, review or repair a « v2 » lesson of the French platform (a lesson of the French collège, 6e–3e, played on a game world such as `divisor-isles` « L’archipel des diviseurs ») — porting first what the Algerian platform already has, then the pipeline, the brief of each agent, the ledger of every defect met so far with the check that catches it, the screenshot review. Use it BEFORE designing a lesson, before briefing any agent on a lesson, before reviewing a lesson's screenshots, and at the END of every lesson to write back what it taught.
---

# Lesson v2 — how a French lesson is generated here, and how the next one is generated better

This skill is the project's memory of lesson generation. A session remembers nothing of the session before: what was
learned exists only if it is written HERE (or is a test in the code). It was born on the Algerian platform
(`../smarter-academy-dz`, where eleven v2 lessons were built with it) and rewritten for France on 2026-11-23: the
pipeline, the briefs and the whole ledger are kept; the language, the paths, the curriculum and the content rules are
France's; a stage was added in front — **port before you build** (§1bis).

- **Before and during a lesson**: port (§1bis), then follow the pipeline (§2); build every agent brief from `briefs.md`;
  give every agent the ledger `defects.md`; review the screenshots with `review.md`; play the world with `play.md`; walk
  only what `trusted.md` does not already cover (§6).
- **After a lesson** (part of « done »): write back — §5.

The binding rules are the repository's: root `CLAUDE.md`, `docs/FRANCE_REBUILD_PLAN.md` (§7bis the council's verdicts,
§8 the lessons, §8bis the debts), then `docs/architecture/LESSON_V2.md` (the pack, the folder, the definition of done),
`GAME_WORLD.md` (the kit, a world, the forge « Forge ta règle », « Explore »), `LAUNCH_KIT.md`, `LESSON_LAB.md`,
`CLASS_SESSION.md`, `EXERCISE_CONTRACT.md` (the bank, the brevet tags), and for every word a student or a teacher reads
**`FRENCH_LANGUAGE_CONTRACT.md`** (register, vocabulary, typography, numbers, notation, content rules). This skill never
restates those documents: it says how to WORK with them. If the skill and a contract disagree, the contract wins and
the skill is corrected in the same task.

## 0. ONE screen size: 1366×768, alone (owner, 2026-11-19, kept for France)

His words: « from now on, all the lessons must work for this size only: 1366×768, alone, no other size is needed ».
Every walk, every review, every limit of `trusted.md` is at 1366×768. No walk at 1024×768 or 1840×900, no tablet, no
phone; a defect that shows only at another size is not a defect of the lesson. Lines of `defects.md`, `trusted.md` and
`review.md` that name three sizes were written before this date: read them as 1366×768.

## 0bis. What the owner gave up for speed (2026-11-19 — « agree to : 1 , 2 , 3 »)

Asked what a lesson of 1–2 hours costs, he was shown six losses and accepted the first three (the main session's
reading of his answer — the three first rows of the table he was shown):

1. **The eyes look at about TEN chosen screens per lesson**, not at every new one: the screens the lesson is the first
   to show (a new world piece, a new kind of last step, its longest instruction, its final mission). The walks still
   check every screen automatically. **Until the first French lesson is walked, EVERY screen is new** (`trusted.md`):
   the kit was translated and nothing has been seen in a browser since.
2. **No other screen size** (§0).
3. **A change of shared code is re-walked on ONE reference lesson**, not on every lesson that uses it.

NOT given up (he did not accept rows 4–6): a lesson may still need a new mechanic (it then takes longer), the design
keeps its depth (the road checked against the bank, each wrong rule refuted by a computed case, a final mission that
needs the lesson), and a weakness of pedagogy seen on the way is worked on, not left.

## 0ter. The official text says WHAT, never HOW (owner, 2026-11-21; for France: CLAUDE.md « The curriculum »)

His words (about the Algerian textbook, and they hold for the French programme): « never stick to the textbook: the
textbook is used to know what the student must learn in math, but we build for them what we see as appropriate ».

- **What binds a plan**: what the student must KNOW AND BE ABLE TO DO at the end — the learning points (« savoir-faire »
  in the interface) printed by `npm run -s lesson:brief -- <code>`, which come from the official French texts
  (`docs/curriculum/officiel/`, the 3e net `packages/core/curriculum/fr/`) and from nothing else — and what the bank's
  exercises ask. Nothing else. Never a textbook, a tutoring site, the old French site's catalogue.
- **What is ours to decide**: how many keys, in which order, with which experiments, contexts and numbers — and where the
  cut between two lessons of a unit falls. A plan that gives one key to each listed learning point, in the list's order,
  is the mistake this rule names: it copies the list's cutting instead of following the student's path.
- **Before designing a lesson, read what the lessons before it in the unit ALREADY made him do** — and, for a 3e lesson,
  what the net says he did in 4e (`lesson:brief` › « What it stands on », « What it must NOT rebuild »). What he has done
  is a tool he owns: it comes back in the practice and in the final mission, it is not forged a second time (first met on
  2026-11-21 in the Algerian world « Le palais des dalles »: lesson 1 had already made him bracket a root and meet the
  calculator's display — two points the list assigned to lesson 2).
- **Then ask what is NEW for him** in this lesson, and build the keys around that.
- A learning point the bank does not test (`lesson:brief` says « no exercise tests it ») is still taught if the student
  needs it; the report says the sitting cannot prove it.
- What the official texts do not say is marked `[À VÉRIFIER DANS LE PROGRAMME OFFICIEL]`, never invented. A
  learning-point id (`<grade>_<lessonCode>_P<n>`, e.g. `3e_decomposer-en-facteurs-premiers_P2`) is opaque and
  append-only (`learning_points.lock.json`): never reorder a lesson's points; after APPENDING one, `npm run
  generate:lp-lock`.

## 1. Who does what

- **The main session designs, briefs, reviews, runs the walks and reports. Agents on `opus` write the code** (the 3D and a
  task judged complicated are coded by the main session). Agents that write at the same time touch files that do not
  overlap — say in each brief which files belong to whom.
- **One heavy check at a time** (a walk, the whole suite, a build, `check:lessons`, lint on the tree) — the machine has
  13 GB. An agent runs only the unit tests of what it touched (`npx vitest run <files> --maxWorkers=2`), `eslint` and
  `prettier --check` on its files.
- **Never edit source while a walk runs on that tree.** To walk while agents write, walk a FROZEN COPY: §4.
- **`../smarter-academy-dz` is READ, never written** (owner, 2026-11-22: « do not touch the dz platform »), and its
  databases are never used. Deleted Algerian files of this tree are read with `git show 049380e:<path>`.

## 1bis. Port before you build — the FIRST stage of every lesson (owner: « for the things that already exist in the dz platform use them »)

The Algerian platform has, for many learning points, a lesson that is built, walked, looked at and played by the owner:
its world content, forges, bank, class test, warm-up family, lab instrument, checks and walk. **What exists there is
PORTED and converted, never regenerated; only what it lacks is built new, on the same world.** The engine, the kit and
the worlds are already here (`apps/web/src/lessons/common/`), in French.

**Step P1 — the table.** Read the lesson's rows in `docs/curriculum/net-3e/fr_dz_table.json` (`type`: `same`,
`same-maths-other-method`, `partial`; `points`: which FR point maps to which DZ point; `note`). No row = nothing to port
for that lesson (say so, and look one grade around: a DZ 1AM–3AM lesson may hold a prerequisite's warm-up family).

**Step P2 — the inventory.** For each DZ lesson of the rows, list with paths (`../smarter-academy-dz/…`):

| Piece | Where in DZ |
|---|---|
| the lesson folder, `lesson.config.js` (its learning points, `teachingScope.exclude`) and `lesson.pack.js` | `apps/web/src/lessons/moyen/<grade>/<theme>/<unit>/<lesson>/` |
| the world content: `world/{story,math,text,forges,inquiries,practice,trainer,journey,knowledge,evidence,sitting,index}.js` and their tests | the lesson's `world/` |
| the world's own pieces it relies on (an experiment kind, the workshop, the purse, the lit stretch) | `apps/web/src/lessons/common/gameworld/<world>/` — the same files exist HERE, translated |
| the forges and keys | `world/forges.js` (`FORGES`), `world/journey.js` (`KEYS`) |
| the exercise bank, its counts per level (`level-1` … `level-5`), its `metadata.exam` and `source` | `content/practice/<grade>/<lesson>/` |
| the class test | `content/class-tests/<grade>/<lesson>.json` |
| the warm-up (launch-kit) families of its prerequisites | `apps/web/src/lessons/common/launchkit/families.js › FAMILIES` (keyed by net item; `toolsForLesson` of `packages/core/curriculum/dz/net/learningNet.js`) |
| the lab instruments tagged to it | `apps/web/src/lessons/common/lessonlab/registry.js › TOOLS` (`lesson:` tag) — the instrument CODE is already here, untagged |
| the claim kinds its evidence uses (the checkers) | `world/evidence.js` → `kit/claims.js` (the same kinds exist here and in `ClaimVerifier.php`) |
| the board and memo | `board/{script,memo,board.test}.js` |
| the walk | `apps/web/e2e/lessons/<lesson>.walk.mjs` (descriptor of the shared library) |

**Step P3 — the cut.** A French lesson teaches ITS net's learning points, and only them:
- a DZ key, exercise or station that teaches a point the French lesson has → **port**;
- one that teaches a point OUTSIDE the French lesson's points (another lesson of the French net, or nothing in the
  French programme) → **cut** (and say in the report where it goes, or that France does not teach it);
- a French point no DZ piece teaches → **build new**, on the same world, with the same pipeline (§2);
- a DZ « same maths, other method » (DZ through the PGCD, France through prime factors) → port the WORLD pieces and the
  numbers' checks, rebuild the key around the French method.

**Step P4 — convert.** Converting means, concretely:
- **Every string is REWRITTEN from its job**, with the Arabic as the description of that job — never translated word for
  word (`FRENCH_LANGUAGE_CONTRACT.md` §1). The student is « tu », short sentences, no exclamation marks in a row; the
  vocabulary is the contract's table (« clé », « la forge », « palier », « savoir-faire », « brevet blanc »…); the
  world's own nouns are the ones already in `gameworld/<world>/strings.js` (« planche », « fossé », « pont », « case »,
  « moule », « atelier »).
- **French typography** (§4): « … » with no-break spaces, U+00A0 before « : », U+202F before « ; ! ? », « ’ », « 3e »,
  « 1re ». `kit/authoring/test/suites.js › typographyErrors` and `scripts/validate-lib.mjs › typographyErrors` catch it.
- **Notation** (§5, §7): `\times` for a product (never `·` or `*`; in a JS string `'\\times'`), the decimal comma
  `2{,}5` in LaTeX (« 2,5 » in prose), a pair with a semicolon « PGCD(12 ; 18) », « ⩽ » `\leqslant`, units after a
  no-break space, a power as a real exponent (`$2^2$`, « 2² »), never « 2^2 » or « 2**2 » in prose.
- **Money**: dinars become PLAUSIBLE euros — not the same number with another sign: re-scale to a French price
  (a crate of fruit 12 €, not 1 200 €), « 12,50 € » with a no-break space, never « EUR » (§5, §9). The worlds' own
  problems were re-scaled once (plan §7bis); a ported lesson re-scales its own.
- **Contexts and names**: an Algerian context (a wilaya, a dinar price, the BEM, a religious feast, a local custom) is
  replaced by a neutral everyday French one (school, sport, music, cooking, transport, nature, building, a local shop) or
  removed — never translated. First names of the France of today, boys and girls in equal number and roles.
- **Characters**: `KidFigure` (`lessons/common/components/KidFigure.jsx`) in ordinary clothes and varied hair; **no
  headscarf by default** (plan §7bis).
- **Probability**: dice, coins, urns, spinners, as EXPERIMENTS; never playing cards, never betting, never money won.
- **Direction**: the Algerian layout read from the right. A layout that placed the important thing on the right, a
  mirrored icon, a `dir="rtl"`, a « start = right » position, an SVG label anchored for RTL — all become left to right
  (`FRENCH_LANGUAGE_CONTRACT.md` §8; « no longer applies » in `defects.md`).
- **Programme scope**: an Algerian step outside the French lesson's points is CUT (P3); the BEM-modelled exercises of the
  bank become brevet exercises with the French provenance (`EXERCISE_CONTRACT.md` « The exam sheet »: « Sur le modèle du
  brevet <année> », `brevet: 1 | 2 | null`, `calculator`), the brevet's part 1 being automatisms WITHOUT calculator.
- **Ids**: the lesson's id is the French `lessonCode`; learning-point ids are rewritten through the table's `points`
  (`4am_tayin-pgcd_P1` → `3e_trouver-le-pgcd_P1`); exercise ids `ex-3e-<lesson>-l<n>-<nnn>`; a DZ number that collides
  with another French lesson's numbers is changed (`scripts/lesson-bank-numbers.mjs`, D7, D10, D12).

**Step P5 — write the port map** in the design section before any brief: each DZ piece → port / cut / new, its target
path here, and what conversion it needs. The briefs (`briefs.md` §W, §B, §F, §P) say which ported file is the agent's
starting point. Until the transfer tool exists (plan §8 step 2), a port is a careful agent's work, file by file, never a
copy with a search-and-replace.

## 2. The pipeline of one lesson

| # | Step | Who | Output |
|---|---|---|---|
| P | **Port before you build** (§1bis): the table, the inventory, the cut, the conversion plan, the port map | main | the port map |
| 0 | `npm run -s lesson:brief -- <code>`, `npm run status:lesson-v2 -- --lesson <code>`; the official text behind each point (`docs/curriculum/officiel/`); the exercise bank `content/practice/<grade>/<code>/` — the brevet bank FIRST (plan §8): ported from DZ where the port map says so, written new otherwise, validated by `npm run validate:exercises -- --strict` | main | what the lesson must teach, its learning points and their weights in the bank |
| 1 | **Design** (`review.md` §A is the checklist; §0ter first: what is NEW for him, never the list item by item): one key per rule; for each key its NATURE and the experiment of that nature — a (kind, mode) no other key of the lesson uses; the numbers; what the student holds when each forge opens; the final mission, which must NEED the lesson. Written in the unit's design page (`docs/reports/`, one page per unit; the Algerian model is `docs/reports/BATCH_2_DESIGN.md` of `../smarter-academy-dz`). A new kind or a new world mechanic is the owner's « go » | main | the design section |
| 2 | Kit work, only if a kind, a mode or a claim kind is missing — brief `briefs.md` §K | agent(s) | new files in the world's folder, registered LAST |
| 3 | **Wave 1, in parallel**: the written world (§W) ∥ the board, the class test, the warm-up family (§B) | 2 agents | `world/` without forges, `board/`, `content/class-tests/…`, the family |
| 4 | **Wave 2, in parallel**: the forges and their experiments (§F) ∥ the pack and the satellites (§P) | 2 agents | `world/forges.js`, `inquiries.js`, `lesson.pack.js`, the generated index |
| 5 | **The walks**, written and run at 1366×768 (the ONE size) by ONE agent that is alone in the tree (§X) | 1 agent | the walks, the defects they find fixed |
| 6 | **Review**: a frozen copy; the walks at 1366×768 only; EVERY new screen looked at with the eyes (`review.md` §B); the world played as a student (`play.md` §5) | main | a list of defects |
| 7 | **Fix batches** by agents that do not run walks (§R), then step 6 again on a new frozen copy, until nothing is left | agents, main | — |
| 8 | Repo checks, one at a time: `npm run lint`, `check:format`, `check:unused`, `check:unreached`, `check:lessons`, the web unit suite; published locally (lesson `available`, modules and exercises `published`) | main | — |
| 9 | Docs (`GAME_WORLD.md`, the design page, `FRANCE_REBUILD_PLAN.md` §9), then the commit `feat(lessons): <code> — v2` on `rebuild/dz-core`, **naming its paths** (`git commit … -- <paths>`: other agents share the folder). **Never push to `main`, never merge, never set `FR_REBUILD_CUTOVER_APPROVED`, without the owner's word** — `main` deploys to French production | main | the commit |
| 10 | **Write back into this skill** — §5 | main | `defects.md`, `briefs.md`, `review.md`, `play.md`, `trusted.md` updated in the same commit |

A lesson is done when its status line prints ✅, its tests pass, its walks pass at 1366×768 (the one size) and its
screenshots were looked at — and step 10 is made.

## 3. Briefing an agent

- Start from the template of `briefs.md`; fill its `<…>`; never write a brief from memory.
- Paste into EVERY brief the block « Limits » of `briefs.md` §0 and tell the agent to read `defects.md` and
  `FRENCH_LANGUAGE_CONTRACT.md` — the ledger is the part of the brief that grows.
- Say what the agent holds that it cannot see: the port map (§1bis) and the DZ files it starts from; what the agents
  before it reported (hooks, numbers, what a walk must do).
- Ask for a report in the fixed shape of §0: what changed, what was run with numbers, what was NOT verified, what it is
  unsure of. An agent's report is not a fact: check the diff of anything shared (the kit, the walk library).
- An agent that hands back an open design choice gets an answer or the choice goes to the owner — never silence.

## 4. Walking while agents write: the frozen copy

Hot reload contaminates a walk, and waiting for every agent before every walk wastes hours. So a walk runs on a copy:

1. copy `apps/web` (without `node_modules`, `dist`, the screenshots under `e2e/`), `packages/core`, `content/` and the
   root `package.json` into a scratch folder; make its `node_modules` a folder of links to the real packages, except
   `@smarter-academy/core` and `web`, which point INSIDE the copy;
2. add a Vite config that merges the real one with `server: { port: 5174, strictPort: true, hmr: false, watch: null,
   fs: { strict: false } }` and start it from the copy;
3. run the copy's walks with `E2E_BASE=http://localhost:5174`;
4. after a new copy, RESTART that server (with no watcher it keeps the old modules).

`git archive HEAD` instead of a copy gives the same for the last commit (the walks owed on what was committed).
The two scripts used on 2026-11-19 lived in the Algerian session's scratchpad; when this is done a third time, put them
in `apps/web/scripts/` and name them here.

## 5. The closing step — what makes the next lesson better

**How a world is PLAYED** — every remark the owner made while playing, as rules, with the six-step play-through to do
before saying « playable »: **`play.md`**. A designer reads it before drawing a world; a new remark of the owner on how
something feels is added there in the same task (owner, 2026-11-21).

Before the lesson's commit, for EVERY defect met in the lesson (by a walk, by the eyes, by an agent, by the owner):

1. **Can a machine catch it?** Then add the check where it will run for every lesson: a unit test over all lessons (a
   glob of `world/*.js`), a check of the walk library (`apps/web/e2e/lib/`), a line of
   `apps/web/scripts/lesson-v2-status.mjs`, a rule of `scripts/validate-lib.mjs` for the bank. A check written inside
   one lesson's walk only is half done: note in `defects.md` that it must move to the shared library.
2. **Write its line in `defects.md`**: what it was, where it was first seen, what catches it now (the test's path, or
   « eye: `review.md` §… »), and the sentence a brief must carry so it is not made again.
3. **Correct the template** of `briefs.md` that let it through, and `review.md` if the eyes found something the list
   did not name.
4. Record the lesson's cost in `defects.md` §« Cost » (agents, tokens, minutes — the task notifications give them).
5. **Write what the port taught** (§1bis): which DZ piece came over whole, which needed more than a conversion, which
   conversion step the list above did not name — as a line of `defects.md` §E and a correction of §1bis.

A defect that comes back although its line is in the ledger is the ledger's failure: the line is rewritten as a check.

## 6. What a new lesson does NOT check again (owner, 2026-11-19)

His words: « always enhance and improve the skill of building lessons by the feedback you get on the walk, so in the
future when you generate a lesson you do not check what 100 % works ». A walk is the most expensive part of a lesson
(`defects.md` « Cost »): it must be spent on what is NEW, never on re-proving what earlier lessons already proved.

**Every screen of a lesson is one of three things — say which in the walks' brief:**

| | What it is | How it is checked |
|---|---|---|
| **Proven kit** | a screen of the kit or of the world that the lesson only fills with data, already walked by earlier FRENCH lessons and unchanged since (`trusted.md` lists them, with the commit that last changed each) | NOT walked again for this lesson. Its DATA is checked by a unit test that runs in seconds: the lesson's longest sentence, list and number against the limits the walks measured (`trusted.md` gives each limit) |
| **Changed kit** | a proven screen whose code changed since its last walk (`git log` on its files against the commit in `trusted.md`) | walked once, on ONE reference lesson, at 1366×768 — not once per lesson |
| **New** | the lesson's own story, its forges' content, a world piece or an experiment kind used for the first time | walked at 1366×768 and looked at with the eyes |

**Today (2026-11-23) the French table of `trusted.md` is EMPTY**: every screen was proven in Arabic, right to left, and
the kit's words and direction changed since. The first French lesson walks everything; what it proves goes into
`trusted.md`.

**After every lesson, the closing step (§5) also feeds this:**
1. Every screen that passed at 1366×768 and was looked at goes into `trusted.md`, with the commit, the lesson
   that proved it, and the LIMITS it was proved for (how long a sentence, how many items, how large a number).
2. Every failure a walk found that depended only on the lesson's DATA (a sentence too long for its card, a list on
   three lines, a tablet too tall) becomes a unit test over the lesson's data — so the next lesson learns it in seconds,
   without a browser.
3. A screen leaves `trusted.md` the moment its code changes or a lesson breaks it; it comes back after one walk.

**What is never trusted without a walk:** anything a student does for the first time in this lesson (its story from
the first island to the end), and any screen whose content exceeds the limits it was proved for. « It worked in the
last lesson » is not a proof for content of another size: the gate dash worked for five lessons and sent the hero to
the wrong island in the first lesson with a longer road (`defects.md` D6). French sentences are LONGER than the Arabic
ones they replace (often by a third): a limit proved in Arabic proves nothing for French text.
