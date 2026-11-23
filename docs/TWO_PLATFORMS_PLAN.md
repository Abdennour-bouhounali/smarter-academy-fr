# Two platforms, one engine, cheap lessons — the plan (written 2026-11-24, NOT yet run)

**For the session that runs it.** Read this page whole, then `CLAUDE.md`, then the lesson skill
(`.claude/skills/lesson-v2/SKILL.md`). Everything here is a plan and a set of targets: nothing below is built, and no
number in a « target » column has been measured. The two tests at the end are how it gets judged.

## 1. What the owner wants

Keep developing the French platform (this repository) and the Algerian one (`../smarter-academy-dz`) at the same time,
with the least time and the fewest tokens; generate lessons with a much cheaper pipeline. Then prove it on two lessons:
**the PGCD** (exists in DZ, not in France) and **Thalès** (a NEW world and a new lesson for BOTH).

His words on the model, 2026-11-24: « i want to use opus for the lesson generator if possible since it consume less
tokens, but if only only it keep the same quality ». So Opus generates lessons, and quality is CHECKED, not assumed
(§6, §8).

## 2. What is fixed (the owner's rules — they hold)

- **Two repositories, two databases, two deployments.** No shared package, no shared runtime, no country switch.
- France is deployed: `main` = production (`3a72c5fc` on 2026-11-24). Work on `rebuild/dz-core`; **ask before any push
  to `main`**. DZ is at `7f4cef1c`, untouched since the import — today ALL engine drift is on the French side.
- **DZ is read, never written, until the owner says otherwise.** Test 2 builds a lesson in DZ: the session asks for
  that permission FIRST, in the owner's words, and for how he wants it delivered (§4).
- Pedagogy, one screen size (1366×768), the walk and the eyes before « done »: unchanged (`CLAUDE.md`).

## 3. What the council decided (2026-11-24: Skeptic, Pragmatist, Critic against the main session's first plan)

The first plan — split words from logic in BOTH repositories so engine and lesson logic become identical — was
rejected by all three voices, and the main session agreed:

1. **The money is in lesson generation, not in engine drift.** Measured on the first French lesson (13 agents, about
   5.1 M tokens): walks and fix batch 1.35 M, world and forges 1.0 M, engine pieces 0.73 M, bank and answer type
   0.69 M, board/warm-up/instrument 0.53 M, assembly 0.24 M, dossier 0.24 M — and every agent re-read the same six to
   eight long documents (estimated over 1 M in all). Algerian lessons measured 2.3–2.9 M each.
2. **Lessons do not port; learning points do.** The two programmes cut lessons differently (lesson 1: almost nothing
   ported whole). The unit of reuse is the KEY of one learning point: its experiment, forge, questions, exercises.
3. **No refactor of the live Algerian lessons.** Sentences there are functions with grammar inside; extracting them
   from 140 lessons risks the only platform with users, to save tokens spent elsewhere.
4. **No tooling designed from one lesson.** A specification language, an automatic porter, a universal text-key
   system: not built. Tooling is added when two lessons have shown its shape.

## 4. The engine across two repositories

| What | How it crosses |
|---|---|
| A fix in a file that holds NO sentence (logic, number helpers, the practice evaluator, an experiment's reducer, the API's verifiers, a shared test suite, a walk-library check) | `scripts/engine-patch.mjs` (to write, §7 step 0): reads a short LIST of paths, diffs them against `../smarter-academy-dz`, writes a `.patch` in the scratch folder. The owner reads it and applies it in DZ (`git apply`, commit). The script never writes in DZ |
| A fix in a file that holds sentences | not synced. Carried by hand only when worth it, and the file's logic is separated from its words AT THAT MOMENT, in that one file |
| The checks (validators, the ledger's tests) | same patch path — they are language-neutral and are the cheapest quality gain for DZ |
| **New engine code** (a new world, a new experiment kind) | written from day one with its sentences in ONE text file per country and a direction constant — new code costs nothing to split. It crosses whole, as a patch plus one text file to write |
| Lessons, banks, catalogues, the net | never synced. Each country's own |

The list starts short and grows one file at a time. A path leaves the list the day its two copies differ by more than
the fix (the script says so and stops — a patch that needs judgment is not sent).

## 5. Reuse at the level of a learning point

A lesson of one platform may hold points the other does not have (France: prime factorisation, the PGCD by
decompositions; DZ: the PGCD by subtraction). So, before any lesson, per learning point
(`docs/curriculum/net-3e/fr_dz_table.json` maps points, not lessons):

| The point is… | Then |
|---|---|
| built in the other platform | port that ONE key and its exercises, converted (skill §1bis) |
| in both programmes, built in neither | build once here, words in a text file; the other platform takes it later |
| only in this programme | build here; it never crosses |

After a lesson, the session writes in the table which of its keys the other platform could take, and for which of its
lessons. Taking it is a small port the owner decides on — never automatic.

## 6. The lean lesson pipeline (what changes against the skill as it is)

| # | Change | Replaces | Target saving |
|---|---|---|---|
| 1 | **Role cards**: one page per role (world, forges, board, bank, walk-fix) holding the limits, the hooks and the ten ledger lines that role breaks most — an agent reads its card and the files it touches, nothing else | « read these six documents » in every brief | most of the re-reading |
| 2 | **Reports capped at 300 words**, details in a file under the scratch folder | 1,000–1,800-word reports in the main context | the main session's own context |
| 3 | **Opus generates the lesson** (the owner's wish): the lesson session runs on `opus` — design, briefs, checks, reports — and its workers are `opus` for forges and new mechanics, `sonnet` for the world's written content and the board, `sonnet` or `haiku` for the bank, the class test and translations, in a loop with the validator. **The strongest model is called at TWO gates only** (below) | the strongest model for the whole session, `opus` for every worker | the session's cost; the weekly Opus limit is a scheduling constraint — plan a lesson's Opus work inside it |
| 4 | **Every machine check before any review**: suites, validators, `status:lesson-v2`, the ledger's tests run as plain commands before an agent or the eyes look at anything | defects found late by a walk | repair loops |
| 5 | **Scripts for the mechanical**: `lesson:new` (folder, glue files, test files calling their suites, pack, routes) and `lesson:assemble` (catalogue status, generators, kept-lists, status line) | the assembly agent (0.24 M) | all of it |
| 6 | **The walk is a command the session runs**; its descriptor is written with the lesson; an agent is called only on a failing walk, with the failing lines | a walk agent that discovers the lesson (0.77 M) | most of it |
| 7 | **One chapter designed at once**: the keys of all its lessons, the numbers reserved once, new mechanics built once | one design per lesson | design and kit work |
| 8 | **One session per lesson**, started from this page and the design page | one endless session | history paid at every step |

**The two quality gates (how « the same quality » is checked).** A cheaper model can write a refutation that looks
right and is wrong, or a key that quietly tells its rule; validators only catch what was foreseen. So the strongest
model reads, in a fresh short context:
- **Gate A — the design, before any code**: the design page against `review.md` §A (each wrong rule has a computed
  refuting case; no rule told before its seal; the final mission needs the lesson; the numbers are free).
- **Gate B — the result, before « done »**: ten chosen screenshots against `review.md` §B, and the forges' tiles.
Each gate returns a list of defects and a verdict. What the gates find is counted (§8): if they find design-level
defects on two lessons in a row, the design goes back to the strongest model and only the building stays on Opus.

## 7. Order of work for the next session

**Step 0 — the tools (budget: 300 k tokens, before any lesson).**
`scripts/engine-patch.mjs` with its first list and a test; the role cards in `.claude/skills/lesson-v2/cards/`;
`lesson:new` and `lesson:assemble`, built from what lesson 1's assembly did (commit `be86718d`); the skill's §2
rewritten around §6. If step 0 passes 300 k, stop and tell the owner: the tools must not cost what they save.

**Test 1 — France, « Trouver le PGCD de deux nombres »** (`trouver-le-pgcd`, world `divisor-isles`, exists already).
Points P1 common divisors and the greatest, P2 by the prime decompositions (new, French only), P3 Euclid's divisions,
P4 identical lots. Port keys from DZ `qasim-mushtarak-akbar`, `tayin-pgcd`, `bahth-pgcd`; cut DZ's subtraction
algorithm; the bank is a port of DZ's 150 exercises down to 50, plus new ones for P2. Open design questions the
session answers BEFORE briefing: how Euclid's rule is discovered without DZ's two subtraction keys; which experiment
carries P2 (a mode, not a new kind, if possible); why a student who has the decompositions needs Euclid (pairs whose
decomposition is painful). **Target: under 1.2 M tokens** (measured DZ lessons: 2.3–2.9 M).

**Test 2 — Thalès, a new world, both platforms.**
France: unit `thales-et-triangles-semblables` — `triangles-semblables`, `thales-configuration-papillon`,
`reciproque-de-thales`, then the brevet synthesis. DZ: unit `khassiyat-talis` (4AM) — `talis-hisab-atwal`,
`aksiya-talis`, `inshaat-talis`, `wadiya-idmajiya-talis`; today old-style lessons with banks and NO game world.
1. Ask the owner for the permission to build in DZ and how (a branch there, or patches he applies).
2. Design the WORLD once for both programmes (its mechanic, its gesture, what makes a ratio necessary), then the
   point-to-point table of the two units. **The owner validates the world's story before any code** (the Algerian
   practice for a first lesson of a world).
3. Build the world in France: sentences in one text file, direction a constant, no country word in the mechanic.
4. The first French lesson on it.
5. The world crosses to DZ as a patch + an Arabic text file; the DZ lesson that shares the most points is built there.
**Targets: the world and the first French lesson under 2.5 M; the Algerian lesson on the same world under 0.8 M.**

## 8. How the plan is judged

For each test the session records, in `defects.md` § « Cost » and in §9 here: the model of the session and of each
worker, tokens per step, wall time, and the defects by who found them — a machine check, gate A, gate B, the walk, the
owner playing. Also what crossed to the other platform (files, tokens).

- **Cost**: the plan is kept if test 1 costs under half of a measured Algerian lesson.
- **Quality (the owner's condition on Opus)**: the same as lesson 1 means — walks green twice at 1366×768, every
  ledger check passing, and NO MORE defects reaching the owner's play than on lesson 1. The gates' findings are the
  early signal: gate A or B finding a defect of pedagogy (a rule told, a wrong rule with no refutation, a mission
  winnable without the lesson) counts against Opus as designer.
- A target missed is reported with its cause, never hidden in an average.

## 9. Results

Nothing yet.

## 10. Open, for the owner at the start of the session

- May the session write in DZ for test 2, and how (branch or patches)? May engine patches be prepared for DZ?
- The local MySQL database `smart-academy-db` was left mid-migration on 2026-11-24 (the owner stopped it; a dump from
  just before is in that session's scratch folder, which a reboot clears): finish it keeping `users`, or go back to
  the SQLite file (`apps/api/.env` was switched to MySQL).
- Brand, tu/vous, and the points of `FRANCE_REBUILD_PLAN.md` §7 still open.
