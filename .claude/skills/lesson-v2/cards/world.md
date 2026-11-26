# Card — the written world (no forges)

Read this card, the brief and the files you touch — nothing else unless « Not enough? » sends you there.
`<L>` = the lesson's folder (the brief); `L1/` = lesson 1, the model:
`apps/web/src/lessons/college/3e/nombres_calculs/multiples-et-diviseurs/decomposer-en-facteurs-premiers/`;
`KIT/` = `apps/web/src/lessons/common/gameworld/kit/`.

## 1. You write / you never touch

- **Write**: `<L>/world/{story,math,text,practice,trainer,journey,knowledge,evidence,sitting,index}.js` and the tests
  `story`, `math`, `practice`, `trainer`, `journey` (it also tests the knowledge map), `evidence`, `sitting`, `limits`.
- **Never touch**: `forges.js`, `inquiries.js` and their tests; `board/`; the bank; `KIT/`; a world's code
  (`gameworld/divisorIsles/`…); `../smarter-academy-dz` (read only). A kit gap is REPORTED, never patched.
- `index.js` imports `FORGES` from `./forges` before it exists, and `limits.test.js` reads `forges.js` and
  `board/script.js`: write both as in `L1/`, and say they fail until those files exist.

## 2. The limits you can break

- ONE screen, 1366×768. `PROVEN_LIMITS` (`KIT/authoring/test/suites.js`; measured in DZ, a French proof only for the
  screens of `trusted.md`'s French table) bounds your data: an instruction
  (`objective`) ≤ 212 characters; a tablet ≤ 2 lines, 2 equalities, 1 note; practice map ≤ 7 nodes; knowledge map
  ≤ 15 cards; a trainer line ≤ 3 answers (a typed power or fraction is ONE). Past a limit, report — never raise it.
- Student « tu », short imperatives, never « faux »; teacher (a sheet's `memo`) « vous ».
- U+00A0 before « : » and inside « … »; U+202F before « ; ! ? »; « ’ » (U+2019); « 3e »; decimal comma (`{,}` in LaTeX);
  every number through `nb` / `tx` (`formatFr` / `texFr`, thousands U+202F); `\\times` (two backslashes), never `·`;
  « PGCD(12 ; 18) »; « 12,50 € ». A plain string holds no `$`. Wrap text objects in `frAll` — today in `L1/world/math.js`, NOT the kit: never copy it
  (D8); import it from `KIT/authoring/numbers.js` once the session has moved it there, else report it missing.
- Agreement: `counted(n, ['planche', 'planches'])`, `listFr` (re-exported from `KIT/authoring/numbers.js`).
- Vocabulary: clé, forge, palier (never « niveau » for a step), savoir-faire, leçon, chapitre, Zéro, « Entraîne-toi ».
- Own numbers and contexts; French first names, girls and boys equally; no religion, brand, alcohol, betting.

## 3. The hooks — what the machines read

| File | Exports (as `L1/`) | Read by |
|---|---|---|
| `story.js` | `K` (literal ids), `STORY` (`segments`, `text.objective`, `text.say`), `TABLETS`, `MODULE_KEYS` | `index.js`; `apps/web/scripts/lesson-v2-status.mjs` parses `export const K = {…}` |
| `journey.js` | `KEYS = [K.x, …]`, `journey` | the status script parses `KEYS = [...]` |
| `math.js` | `NUMBERS`, the kit's re-exports, `nb`, `tx`, the world's words | all |
| `text.js` | `TEXT = frAll({ levels, worlds, summary, busy })` | the hub |
| `practice.js` | `PRACTICE_MAP` (`root`, `positions`, `edges`), `PRACTICE_NODES`, `ladder` | the hub |
| `trainer.js` | `trainer`, `check`, `solution`, `answerLabel`, `PLAN_OF` | « Entraîne-toi » |
| `knowledge.js` | `KNOWLEDGE`, `CARDS`, `LESSON_KNOWLEDGE` | `lesson.pack.js › knowledge` |
| `evidence.js` | `evidence`, `trainerEvidence` (kinds of `KIT/claims.js › CLAIM_KINDS`) | the claims |
| `sitting.js` | ONE call: `createBankSittings({ lesson, levels: BANK_LEVELS })` | status S4bis |
| `index.js` | `lesson` (every export above, `rules: TABLETS`, `keysFromModules`) | `lesson.pack.js › world.content` |

Each test calls its suite from `KIT/authoring/test/suites.js`, then adds only the lesson's own checks:
`describeStory({ id, story, tablets, keys, sentences, before: { [key]: { words, lines } } })` — typography, agreement,
thousands, variables, other stories, the bank's pairs, nothing named before its forge; `describeKnowledge({ knowledge,
keys, cards })`; `describeEvidence({ id, keys, evidence, trainerEvidence, trainer, check, solution, cards, boxes, config })`;
`describeTrainer({ trainer, check, solution, answerLabel, evidenceOf, planOf, cards, kinds })`; `describeSitting({ id,
lesson, sittings, levels })`; `describeLimits({ forges, keys, tablets, objectives, knowledge, practiceMap, script })` —
`objectives` = EVERY instruction with its longest arguments. The status script wants tests for practice, trainer,
sitting, journey, evidence (and forges).

## 4. The ten ledger lines you break most (`defects.md`)

- **A2** — Name no key on the hub, a level title, a sentence or a card reachable before its forge. Caught:
  `describeStory › before`, `practice.test.js`, `KIT/lockedNames.render.test.jsx`.
- **A6** — A claim carries the WHOLE first-try answer; a missing claim kind is reported. Caught: `describeEvidence`.
- **A7** — Compute every key, distractor and hint in the test; trust no ported answer. Caught: your trainer tests.
- **A9 / D7 / D12** — Check every number, comments and the dash included, with `lesson-bank-numbers.mjs` first.
  Caught: `describeStory`.
- **B8** — Compute map positions for the widest French card, panel open. Caught: `describeKnowledge`.
- **B11** — Agree through `counted`; read templates at 0, 1, 2, 11+. Caught: `agreementErrors`.
- **B14** — Put the WHOLE instruction in `objective`, never in Zéro's `say`. Caught: `describeLimits`, the walk.
- **B26** — Bound every generated sentence in a test. Caught: your trainer test.
- **B31 / B32** — Numbers through `nb` / `tx`; every variable `$x$`. Caught: `thousandsErrors`, `variableErrors`.
- **D52** — Export only what an app file imports. Caught: `npm run check:unused` (at assembly).

## 5. Checks you run

```bash
node scripts/lesson-bank-numbers.mjs <code> --check a,b c,d   # CLEAR before any number is written
cd apps/web && npx vitest run <L>/world/<your>.test.js … --maxWorkers=2
npx eslint <your files> && npx prettier --check <your files>   # from the repo root
```

Not: a walk, a build, the whole suite, `check:lessons`, `validate:lessons` (the orchestrator, after wave 1 — D50).
Never commit.

## 6. Your report (≤ 300 words)

What changed, file by file (ported: kept / converted / cut); what you ran, with numbers; the screens only a browser can
judge; what you are unsure of and every open choice; the ledger lines you may have hit; for the forges agent, what the
student HOLDS at each key's island. Longer → the file the brief names.

**Not enough?** A suite option → its comment in `KIT/authoring/test/suites.js`; the order of writing →
`KIT/authoring/README.md` « The order to write a `world/` »; claims → `LESSON_V2.md` §1bis; convoys → `GAME_WORLD.md`
§2ter-1; French → `FRENCH_LANGUAGE_CONTRACT.md` §4–§7.
- **A13 / B49 / B51** — a refusal that GIVES THE ANSWER; a pillar's label crossing a lane's label; hub map labels on one line (L3 and L4, 2026-11-26).
- **B47** — a story that never hears a failed try: use `story.onMiss`.
