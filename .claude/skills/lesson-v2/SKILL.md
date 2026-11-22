---
name: lesson-v2
description: Build, review or repair a « v2 » lesson of this repository (a lesson on a game world, like the pilot `qasim-adad-tabii`) — the pipeline, the brief of each agent, the ledger of every defect met so far with the check that catches it, the screenshot review. Use it BEFORE designing a lesson, before briefing any agent on a lesson, before reviewing a lesson's screenshots, and at the END of every lesson to write back what it taught.
---

# Lesson v2 — how a lesson is generated here, and how the next one is generated better

This skill is the project's memory of lesson generation. A session remembers nothing of the session before: what was
learned exists only if it is written HERE (or is a test in the code). So the skill has two halves that matter equally:

- **Before and during a lesson**: follow the pipeline below; build every agent brief from `briefs.md`; give every agent
  the ledger `defects.md`; review the screenshots with `review.md`; walk only what `trusted.md` does not already cover (§6).
- **After a lesson** (part of « done »): write back — §5.

The binding rules are the repository's: root `CLAUDE.md`, then `docs/architecture/LESSON_V2.md` (the pack, the folder,
the definition of done), `GAME_WORLD.md` (the kit, a world, the forge, « استكشف »), `LAUNCH_KIT.md`, `LESSON_LAB.md`,
`CLASS_SESSION.md`. The live state of the rollout is `docs/reports/LESSON_V2_MASTER_PLAN.md` §4ter-0. This skill never
restates those documents: it says how to WORK with them. If the skill and a contract disagree, the contract wins and the
skill is corrected in the same task.

## 0. ONE screen size: 1366×768, alone (owner, 2026-11-19)

His words: « from now on, all the lessons must work for this size only: 1366×768, alone, no other size is needed ».
Every walk, every review, every limit of `trusted.md` is at 1366×768. No walk at 1024×768 or 1840×900, no tablet, no
phone; a defect that shows only at another size is not a defect of the lesson. Lines of `defects.md`, `trusted.md` and
`review.md` that name three sizes were written before this date: read them as 1366×768.

## 0bis. What the owner gave up for speed (2026-11-19 — « agree to : 1 , 2 , 3 »)

Asked what a lesson of 1–2 hours costs, he was shown six losses and accepted the first three (the main session's
reading of his answer — the three first rows of the table he was shown):

1. **The eyes look at about TEN chosen screens per lesson**, not at every new one: the screens the lesson is the first
   to show (a new world piece, a new kind of last step, its longest instruction, its final mission). The walks still
   check every screen automatically.
2. **No other screen size** (§0).
3. **A change of shared code is re-walked on ONE reference lesson**, not on every lesson that uses it.

NOT given up (he did not accept rows 4–6): a lesson may still need a new mechanic (it then takes longer), the design
keeps its depth (the road checked against the bank, each wrong rule refuted by a computed case, a final mission that
needs the lesson), and a weakness of pedagogy seen on the way is worked on, not left.

## 0ter. The textbook says WHAT, never HOW (owner, 2026-11-21)

His words: « when you plan for the lesson generation: never stick to the textbook: the textbook is used to know what the
student must learn in math, but we build for them what we see as appropriate ».

- **What binds a plan**: what the student must KNOW AND BE ABLE TO DO at the end — the الكفاءات of `lesson:brief` and
  what the bank's exercises ask. Nothing else.
- **What is ours to decide**: how many keys, in which order, with which experiments, contexts and numbers — and where the
  cut between two lessons of a unit falls. A plan that gives one key to each listed learning point, in the list's order,
  is the mistake this rule names: it copies the book's cutting instead of following the student's path.
- **Before designing a lesson, read what the lessons before it in the unit ALREADY made him do.** What he has done is a
  tool he owns: it comes back in the practice and in the final mission, it is not forged a second time (first met on
  2026-11-21: lesson 1 of « قصر الساحات » had already made him bracket a root and meet the calculator's display — two
  points the list assigns to lesson 2).
- **Then ask what is NEW for him** in this lesson, and build the keys around that.
- A learning point the bank does not test (`lesson:brief` says « no exercise tests it ») is still taught if the student
  needs it; the report says the sitting cannot prove it.
- The textbook itself, its extraction (`docs/sources/**`) and the lesson's old version are never read (§2 step 0). An
  element of the book that no lesson cites any more is marked `notIntegrated`: it is bookkeeping about the book, never a
  reason to add something to a lesson.

## 1. Who does what

- **The main session designs, briefs, reviews, runs the walks and reports. Agents on `opus` write the code** (the 3D and a
  task judged complicated are coded by the main session). No cap on agents; agents that write at the same time touch
  files that do not overlap — say in each brief which files belong to whom.
- **One heavy check at a time** (a walk, the whole suite, a build, `check:lessons`, lint on the tree). An agent runs only
  the unit tests of what it touched (`npx vitest run <files> --maxWorkers=2`), `eslint` and `prettier --check` on its files.
- **Never edit source while a walk runs on that tree.** To walk while agents write, walk a FROZEN COPY: §4.

## 2. The pipeline of one lesson

| # | Step | Who | Output |
|---|---|---|---|
| 0 | `npm run lesson:brief -- <id>`, `npm run status:lesson-v2 -- --lesson <id>`; **never read the lesson's old version**; the exercise bank `content/practice/<grade>/<id>/` is used as it is | main | what the lesson must teach, الكفاءات and their weights in the bank |
| 1 | **Design** (`review.md` §A is the checklist; §0ter first: what is NEW for him, never the book's list item by item): one key per rule; for each key its NATURE and the experiment of that nature — a (kind, mode) no other key of the lesson uses; the numbers; what the student holds when each forge opens; the final mission, which must NEED the lesson. Written in the unit's design page (`docs/reports/BATCH_2_DESIGN.md` is the model). A new kind or a new world mechanic is the owner's « go » | main | the design section |
| 2 | Kit work, only if a kind or a mode is missing — brief `briefs.md` §K | agent(s) | new files in the world's folder, registered LAST |
| 3 | **Wave 1, in parallel**: the written world (§W) ∥ the board, the class test, the launch-kit family (§B) | 2 agents | `world/` without forges, `board/`, `content/class-tests/…`, the family |
| 4 | **Wave 2, in parallel**: the forges and their experiments (§F) ∥ the pack, the satellites, the old version deleted (§P) | 2 agents | `world/forges.js`, `inquiries.js`, `lesson.pack.js`, the generated index |
| 5 | **The walks**, written and run at 1366×768 (the ONE size — owner, 2026-11-19) by ONE agent that is alone in the tree (§X) | 1 agent | six walks, the defects they find fixed |
| 6 | **Review**: a frozen copy; the walks at 1366×768 only; EVERY new screen looked at with the eyes (`review.md` §B) | main | a list of defects |
| 7 | **Fix batches** by agents that do not run walks (§R), then step 6 again on a new frozen copy, until nothing is left | agents, main | — |
| 8 | Repo checks, one at a time: `npm run lint`, `check:format`, `check:unused`, `check:unreached`, `check:lessons`, the web unit suite; published locally (lesson `available`, modules and exercises `published`) | main | — |
| 9 | Docs (`GAME_WORLD.md`, the design page, the master plan §4ter-0, a gate report), then the commit `feat(lessons): <id> — v2` on `dev`. **Never push, never touch `main`, without the owner's word** | main | the commit |
| 10 | **Write back into this skill** — §5 | main | `defects.md`, `briefs.md`, `review.md` updated in the same commit |

A lesson is done when its status line prints ✅, its tests pass, its walks pass at 1366×768 (the one size) and its screenshots
were looked at — and step 10 is made.

## 3. Briefing an agent

- Start from the template of `briefs.md`; fill its `<…>`; never write a brief from memory.
- Paste into EVERY brief the block « Limits » of `briefs.md` §0 and tell the agent to read `defects.md` — the ledger is
  the part of the brief that grows.
- Say what the agent holds that it cannot see: what the agents before it reported (hooks, numbers, what a walk must do).
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

`git archive HEAD` instead of a copy gives the same for the last commit (the walks owed on what was pushed).
The two scripts used on 2026-11-19 lived in the session's scratchpad; when this is done a third time, put them in
`apps/web/scripts/` and name them here.

## 5. The closing step — what makes the next lesson better

**How a world is PLAYED** — every remark the owner made while playing, as rules, with the six-step play-through to do
before saying « playable »: **`play.md`**. A designer reads it before drawing a world; a new remark of the owner on how
something feels is added there in the same task (owner, 2026-11-21).

Before the lesson's commit, for EVERY defect met in the lesson (by a walk, by the eyes, by an agent, by the owner):

1. **Can a machine catch it?** Then add the check where it will run for every lesson: a unit test over all lessons (a
   glob of `world/*.js`), a check of the walk library (`e2e/lib/`), a line of `scripts/lesson-v2-status.mjs`. A check
   written inside one lesson's walk only is half done: note in `defects.md` that it must move to the shared library.
2. **Write its line in `defects.md`**: what it was, where it was first seen, what catches it now (the test's path, or
   « eye: `review.md` §… »), and the sentence a brief must carry so it is not made again.
3. **Correct the template** of `briefs.md` that let it through, and `review.md` if the eyes found something the list
   did not name.
4. Record the lesson's cost in `defects.md` §« Cost » (agents, tokens, minutes — the task notifications give them).

A defect that comes back although its line is in the ledger is the ledger's failure: the line is rewritten as a check.

## 6. What a new lesson does NOT check again (owner, 2026-11-19)

His words: « always enhance and improve the skill of building lessons by the feedback you get on the walk, so in the
future when you generate a lesson you do not check what 100 % works ». A walk is the most expensive part of a lesson
(`defects.md` « Cost »): it must be spent on what is NEW, never on re-proving what earlier lessons already proved.

**Every screen of a lesson is one of three things — say which in the walks' brief:**

| | What it is | How it is checked |
|---|---|---|
| **Proven kit** | a screen of the kit or of the world that the lesson only fills with data, already walked by earlier lessons and unchanged since (`trusted.md` lists them, with the commit that last changed each) | NOT walked again for this lesson. Its DATA is checked by a unit test that runs in seconds: the lesson's longest sentence, list and number against the limits the walks measured (`trusted.md` gives each limit) |
| **Changed kit** | a proven screen whose code changed since its last walk (`git log` on its files against the commit in `trusted.md`) | walked once, on ONE reference lesson, at the three sizes — not once per lesson |
| **New** | the lesson's own story, its forges' content, a world piece or an experiment kind used for the first time | walked at 1366×768 and looked at with the eyes, as today |

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
the wrong island in the first lesson with a longer road (`defects.md` D6).
