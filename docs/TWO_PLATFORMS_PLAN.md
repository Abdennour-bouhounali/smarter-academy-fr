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

**2026-11-23 — step 0 (the tools) and the design of test 1. The lesson itself is NOT built.** Measured from the agents'
task notices (the main session's own tokens are not counted). Models: main session Fable then Sonnet; every worker
`opus`; gate A `fable`.

| Piece | Tokens | Result |
|---|---|---|
| `scripts/engine-patch.mjs` + list + test | 139 k | 8 tests green; first patch (+2431 −4, 7 paths) passes `git apply --check` on DZ. The list holds a FEATURE (the `factorization` answer type, JS + PHP), not a fix: every real engine fix made in France sits in a file that also holds French sentences — those are carried by hand |
| the five role cards `.claude/skills/lesson-v2/cards/` | 251 k | written; 5 × 910–960 words (a little over the 900 target); NOT yet used by an agent. The writer found 16 places where the skill's documents contradict the code (`scratchpad` report) — not yet corrected in `briefs.md` / `defects.md` |
| `lesson:new`, `lesson:assemble` + 21 tests | 237 k | built; `lesson:assemble` never ran for real on a new lesson (only `--check` on lesson 1 and on fixtures); 7 « one lesson » test assertions made catalogue-driven. Not automated: bank, class test, walk, lab instrument, warm-up families, docs |
| design of lesson 2 (`trouver-le-pgcd`) | 325 k + 401 k (the correction) | in `docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md`; four keys; the numbers are recomputed by a script that prints « every line ok » |
| gate A (`fable`) | 175 k | PASS WITH CORRECTIONS: 16 defects — **12 pedagogy (2 blocking)**, 2 feasibility, 2 other. Blocking: the final mission was won by one division (2 408 ÷ 86); K4 and K5 forged the same rule. All fixed and re-checked by the main session |
| the Thalès world, three propositions (DZ, `docs/reports/mockups/thales-world.html`) | 215 k | built, looked at; waits for the owner's choice (his rule: new worlds are built together) |

**Step 0 total: about 627 k against a budget of 300 k — OVER; the owner was told and said to continue.** The tools
must now save more than they cost: the judgment is test 1's cost.

**Counted against Opus as designer (§8): gate A found 2 design-level pedagogy defects on the first lesson.** If gate A
finds design-level defects on the NEXT lesson too, the design goes back to the strongest model.

**Done before the PGCD lesson is briefed (2026-11-23, commit `d4cfd67c`, ~290 k more tokens, so step 0 + preparation ≈ 0.9 M):**
the sheet bench keeps its state and shows it in the typed workshop (436 tests green in `divisorIsles` + the lesson folders;
lesson 1 re-walked once at 1366×768 as the reference: 0 FAIL — story 1 390 ok, hub 412, trainer 791, board 286, launch);
the 16 contradictions of the skill corrected (13 in the skill, `lessonWalk/README.md`, `EXERCISE_CONTRACT.md`, a stale
comment; the 16th, an Arabic comment in `packages/core/practice/answerEvaluator.js`, is shared-engine data and stays);
SKILL §2/§3 and `briefs.md` rewritten around the cards, the two commands and the two gates.

**Still to do, in the PGCD session:** read aloud to the owner the K3 tile wording « qu'on voit »; the cards have never
been used by an agent — the first brief that uses one tells what was missing; `fr`/`frAll` should move to
`kit/authoring/numbers.js` (the cards' writer's recommendation) before lesson 2 copies them.

**Test 1 — `trouver-le-pgcd`, built 2026-11-23, one session to « visible on the platform » (the owner's definition of
done for a session).** Done: `lesson:new` → wave 1 (world ∥ board, bank of 50, class test) → wave 2 (forges ∥ pack, two
warm-up families, lab tags, walk descriptor) → `lesson:assemble` → one walk agent (walk 0 FAIL at 1366×768 in every
part; lesson 1 re-walked green after the kit changes) → gate B by the main session on 7 screens (fixed: K4 tablet said
« 3 divisions » and showed 2; « PGCD(a;b) » without spaces in every formula — fixed once in `MathText` › `frenchMath`;
the forge log cut long pair lines — they now wrap) → lint, format, unused, unreached, web suite (5 929 tests) green →
imported and published in the local MySQL (lesson, 7 modules, 50 exercises). The K3 wording was read to the owner: he
asked « human and clear » → « chacun avec » [son plus petit exposant · son plus grand exposant · l’exposant 1].
Also done: `fr`/`frAll` moved to `kit/authoring/numbers.js`; the walk library gained `deal` and `nest:pair` players;
`PairMirror` draws big pairs as scaled bars (125 000 rects before).
**Cost:** 5 Opus agents ≈ 1.88 M tokens (world 0.51, board/bank 0.40, forges 0.38, pack 0.32, walk 0.27) + the main
session — **over the 1.2 M target**. The cards worked: no agent asked for a missing file; what they missed is the walk
library's players (now added) and a knowledge-quiz pair changed in one place only (16/24 vs 12/18, caught by the pack
agent). Gate A defects against Opus: 2 (design level, before the build); gate B: 3 layout/typography, 0 pedagogy.
**Open:** `check:lessons` fails only on the LOCAL database's drift (lycée grades still in MySQL — `smarter:scope-curriculum`
awaits the owner's yes); the warning on `ex-3e-trouver-le-pgcd-l5-010` q3 (two distractors without a misconception);
the walk README does not list the two new players.

**Test 3 — the two last lessons of unit 3e « Multiples et diviseurs », 2026-11-26 (uncommitted).** Built on `divisor-isles`:
`fraction-irreductible` (lesson 3; ported from DZ `ikhtizal-kasr`, its key 2 rebuilt on prime factors; final mission « la plaque
du gardien », 3/34 × 85/87 = 5/58, distractor 85/986) and `multiples-et-diviseurs-communs` (lesson 4; nothing ported; the
owner's five-team workshop, day 61; mission three ferries, day 681, 3 posters a run). The unit now has its 4 lessons, so its
summary page exists. Four NEW kit pieces: segment `walkway`, inquiry `crews` (modes `story`, `days`), `story.mission` (and its
`write` variant, the plaque: 2 plaques a run), claim `ppcm` (JS + `ClaimVerifier.php` + fixture); small ones: `measure` options
`typed: false` / `long: true`, `story.onMiss`, `c.sub`, the hub map's wrap and `kit/mapNudge.js`, `kit/ladder.js › waveBack`
(a guided retry no longer pushes a wave past the last gate — the crash « arches »), the end card « 0 chute », thousands grouped
in strings, `figureAfter` on the board, `LadderStation` `step.words`. The walk library gained `walkwayStory`, `crewsExperiments`,
`measure:stages` / `measure:direct` and the plaque; `readScreen` and `numbersIn` read « 2 121 » as ONE number (it had made 248
« another lesson's number » on lesson 2); `pairChecks` accepts a `c.sub` line.
Walks at 1366×768, final, 0 FAIL: L3 story 1583, hub 337, trainer 688, board 295, sitting 2606; L4 story 1445, hub 335, trainer
779, board 329, sitting 2610. References re-walked after the shared changes: `trouver-le-pgcd` hub 336, trainer 777, board 317
(0 FAIL; its story 15 FAIL, all « its line wraps » in the forge log — the 15 already recorded as environment), `decomposer-en-facteurs-premiers`
board 286, thales hub 278 / board 248 — 0 FAIL. Banks 50 + 50, `validate:exercises --strict` clean; lint, format, unused, unreached
green; `check:lessons`: both lessons cover all points, fails only on the known local-DB drift. Web suite 6 732 tests green (475 files); core 1 020 of 1 021 (the failure: 3 pre-existing duplicate signatures in `trouver-le-pgcd`’s bank, l1-009, l3-005, l3-006 — for the owner); scripts 175 green.
**Owner's decisions taken by default (he said « continue » without answering; he may override):** « plus petit multiple commun »
in full, never « PPCM »; no gear drawn; five teams as rows, 0 at the left; the go for the new pieces; mission costs; the plaque
and the `measure` options.
**Defects by who found them.** Gate A (fable): L3 7 to fix and 6 of pedagogy, L4 13 defects and 4 of pedagogy — all corrected
before any code. Gate B (fable): L3 6 to fix (pedagogy 1, 2, 4, 6, minor), L4 9 to fix and 5 of pedagogy — corrected, except the
debts below. The walk-fix agents: the number readers (C26), the guided retry (`waveBack`), the forge log. Ledger lines added:
A12–A14, B47–B51, C26 (`defects.md`).
**Cost (agents only, from their notices):** designs 0,54 + 0,38 M; gate A 0,13 + 0,13; banks 0,21 + 0,22; kit 0,50; worlds
0,43 + 0,58; boards 0,31 + 0,26; forges 0,43 + 0,43; revision 0,17 + 0,17; walk descriptors 0,54; walk-fix L3 0,22 + 0,35, L4
0,47; gate B 0,14 + 0,15 — **about 6,8 M for the two lessons with the four new kit pieces, against 1,2 M a lesson: OVER.** The
causes: the new kit pieces (0,5 M of kit plus the worlds that drew them) and the walk-fix rounds (1,04 M). Plus, the same day, a
fix of the Thalès world (`636349db`: the Nile sight walk seen inland), not counted. Models: all `opus` except banks, worlds,
boards and revision on `sonnet`, gates on `fable`.
Published locally the same day at the owner's remark « Bientôt »: `smarter:import-curriculum`, `smarter:import-content-registry`, `smarter:publish-available-content` (backup first) — both lessons `available`, `published`, `free`. **Open:** the debts — L3 13 (far islands' labels
overlap by < 12 px), 14 (forge mini-bars thin, kit), 15 (K2 sealed sentence clumsy); L4 rest of 11 (the evidence list opens
scrolled), 12 (kit subtitle wraps with four steps; the built rule loses its column labels), 15 (translucent panel), 16 (typed
« 2129 » ungrouped) and « avant » not fitting the 110 px team column; the 15 « its line wraps » of `trouver-le-pgcd story`.

## 10. Open, for the owner at the start of the session

- May the session write in DZ for test 2, and how (branch or patches)? May engine patches be prepared for DZ?
- The local MySQL database `smart-academy-db` was left mid-migration on 2026-11-24 (the owner stopped it; a dump from
  just before is in that session's scratch folder, which a reboot clears): finish it keeping `users`, or go back to
  the SQLite file (`apps/api/.env` was switched to MySQL).
- Brand, tu/vous, and the points of `FRANCE_REBUILD_PLAN.md` §7 still open.

**Test 2 — Thalès, a new world for both platforms, 2026-11-24.** DZ first: the world « الأهرامات » (`nile-pyramids`)
designed, gated (A), built and walked with `talis-hisab-atwal` (5 docks, 4 keys; story 1 491 ok, hub, trainer, board,
sitting 2 101, launch — 0 FAIL), published in the local DZ database; local branch `feat/thales-pyramids`, not pushed.
Then made ONE code for two countries (W1–W4: the words in `strings.<country>.js`, `story.stages`, `chainOwn` opt-in,
`plan` on butterflies) and carried to France with the kit pieces it needed (`784f483a`), its French words
(`strings.fr.js`), then `thales-configuration-papillon` built on it (3 docks, 2 keys): `lesson:new` → wave 1 (world ∥
board) → wave 2 (forges) → `lesson:assemble` → one walk agent → gate B on 3 screens by the main session → checks (lint,
format, unused, unreached, lesson validators, web suite 6 266 tests) → published locally (lesson 724, 5 modules, 50
exercises). What the French walk changed in shared files was carried back to DZ and re-walked (`e6bc783c`).
Found on the way: the API refused a `scale` claim (`claim.a`/`b` required) — fixed in both.
Cost of the France half (agents only, from their notices): kit port 346 k, contracts 206 k, the W1–W4 changes 263 k,
French words 252 k, world 460 k, board 412 k, forges 284 k, walk-fix 634 k — **≈ 2.9 M**, plus the DZ walk round 2
(383 k). Over the 1.2 M target: the world crossing (kit + words + contracts ≈ 0.8 M) is paid once; the lesson itself
≈ 1.8 M, of which the walk agent is the largest part, as in test 1.
Open: `trouver-le-pgcd story` shows 15 « its line wraps » in the forge log on this machine since the reboot — the SAME
15 at its own commit `11594db8`, so the cause is the environment, not today's code; not resolved.
