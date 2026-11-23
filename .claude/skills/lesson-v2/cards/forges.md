# Card — the forges and their experiments

Read this card, the brief and the files you touch — nothing else unless « Not enough? » sends you there.
`<L>` = the lesson's folder; `L1/` = lesson 1, the model:
`apps/web/src/lessons/college/3e/nombres_calculs/multiples-et-diviseurs/decomposer-en-facteurs-premiers/`;
`KIT/` = `apps/web/src/lessons/common/gameworld/kit/`; `DI/` = `apps/web/src/lessons/common/gameworld/divisorIsles/`.

## 1. You write / you never touch

- **Write**: `<L>/world/forges.js`, `inquiries.js`, `forges.test.js`, `inquiries.test.js`, and only the edits the brief
  allows in `story.js` / `text.js` / `math.js` / `index.js` (list them).
- **A new MODE of an existing kind** (§K): new files beside the newest kind — pure logic and reducer, a pure view, CSS
  scoped to the kind, a logic test, a render test — then ONE registration line, LAST: a ladder mode in
  `DI/InquiryGcd.jsx › Ladder` (`if (mode === '…')`), a new kind in the `[spec.kind]` table of `DI/Inquiry.jsx`.
- **Never touch**: `board/`, the bank, the rest of `KIT/`, `../smarter-academy-dz`. A missing piece or claim kind is
  REPORTED.

## 2. The limits you can break

- 1366×768; text ≥ 12 px at its drawn size (SVG: `font × frame / viewBox`), 18 px for what he must read.
  `PROVEN_LIMITS` (`KIT/authoring/test/suites.js`, held by `limits.test.js`): 2–4 tile columns, ≤ 4 tiles each; tile
  ≤ 32 characters, heading ≤ 35, chip ≤ 54; `buildLead` ≤ 135; his rule ≤ 145; an attack ≤ 155; `tryKey` ≤ 146;
  last step ≤ 4 lines, ≤ 4 boxes a line.
- Every sentence of an experiment is a FACT; a verdict is what the world does, never « faux ». « tu ».
- U+00A0 before « : » and inside « … », U+202F before « ; ! ? », « ’ »; wrap texts in `frAll` (today in `L1/world/math.js`; never copied — from
  `KIT/authoring/numbers.js` once moved there, through your `math.js`);
  `\\times`, `{,}`; `$…$` only where `MathText` renders; a fraction over a real bar, a real exponent (never « 2^3 »).
- A tile needs no agreement with another (« est un nombre pair »). Read every `use` template at 0, 1, 2, 11+, for each
  gender and elision (« de 8 », never « d’8 »; « l’île », « le 11 »).
- Never a pair of the bank (`BANK_PAIRS` = `node scripts/lesson-bank-numbers.mjs <code> --js`) or of another lesson.

## 3. The hooks — what the machines read

- `FORGES = { [K.x]: forge }`, keyed by `story.js › K` (the status script looks for `[K.name]` or the literal). A forge
  (`L1/world/forges.js › ladderForge`): `slots` (`slot()` of `KIT/forge.js`), `text` (`buildLead`, `tryKey`, `attack`…),
  `inquiry`, `predictCases`, `evidence(log)` / `fromInquiry`, `attacks`, `use` (lines of tokens). Build it from
  `KIT/authoring/forgeBlocks.js` — lesson 1 used `judge`, `gather`, `hard`, `lazy`, `line`, `firstBreak`, `powerBox`,
  `noPredictions`; also there: `fromLog`, `fromRounds`, `attacksOf`, `pairPool`, `plankCase`, `pairCase`, `makerOf`,
  `firstWrong`, `fractionBox`, `boxesOf`.
- `inquiries.js`: one spec per experiment, `{ kind, mode, …, text: frAll({…}) }` (`L1 › LADDER_INQUIRY`: `ladder` ·
  `factor`; also `pairs`, `sheet`). The walk must play it: `apps/web/e2e/lib/lessonWalk/experiments.mjs ›
  EXPERIMENTS` (`'kind:mode'` or `kind`) — a new mode has no handler there: say so.
- `forges.test.js › describeForges({ forges, keys, roads, inquiry, solve, forbidden, before, bank, tiles, draw })`:
  every rule the tiles write, each wrong one refuted on his evidence or by an attack, each `use` checked. Then only
  « the rules students really hold » and `verifyClaim` of each `use`.
- `inquiries.test.js › describeExperiments({ ofKey, linesOf, never, own })`: `never` = words no experiment says,
  `own[key]` = the words of that key's name; it fails when two keys share a (kind, mode).
- A key found ON THE ISLANDS: no `inquiry`; `evidence(log)` from the bridges; `predictCases` → `[]`. A key not about a
  bridge: its cases carry what `DI/forgeParts.jsx` draws (`deal`, `pair`, `factor`); no « planche », « fossé », « pont ».
- §K: `data-iq-*` on every control a walk drives, `window.__inquiry`; a spec without the mode plays as before.

## 4. The ten ledger lines you break most (`defects.md`)

- **A1** — Tell no rule before the seal. Caught: `describeExperiments` (`never`, `own`).
- **A3** — One key, one (kind, mode) of its nature. Caught: `describeExperiments`.
- **A4 / E3** — Give every wrong tile rule a computed refuting case. Caught: `describeForges`; `review.md` §A q. 3.
- **A10 / A10b** — Draw a non-bridge key, and a pair, in their own language. Caught: your tests,
  `DI/forgeParts.render.test.jsx`.
- **B27** — Facts only: no column that tells the answer. Caught: render tests, eye.
- **B37** — Test the layout at the heaviest number; scope CSS to the kind. Caught: `DI/inquiryLayout.test.js`.
- **B38** — Keep an experiment's result in the flags at once. Caught: `KIT/ruleForgeKept.render.test.jsx`.
- **C16** — Check the WHOLE `use` pool against foreign numbers. Caught: your test.
- **D28** — Name each box by the words beside it; one line, one question. Caught: eye.
- **D43** — Read a line's boxes with `boxesOf`. Caught: render tests.

## 5. Checks you run

```bash
cd apps/web && npx vitest run <L>/world/forges.test.js <L>/world/inquiries.test.js <L>/world/limits.test.js --maxWorkers=2
# §K: + your logic and render tests, + the tests of every lesson that uses the kind
npx eslint <your files> && npx prettier --check <your files>   # from the repo root
```

Not: a walk, a build, the whole suite, `check:lessons`. Never commit.

## 6. Your report (≤ 300 words)

Files changed (and the shared world edits); what you ran, with numbers; the screens to look at (each experiment at its
heaviest number, each tile board, each last step); unsure points and open choices; ledger lines you may have hit; for the
walks: per forge, the hooks in order, the right tiles, one false rule and its refutation. Longer → the brief's file.

**Not enough?** A kind and its `text.*` keys → `GAME_WORLD.md` « Explore » (table of kinds, « To add a kind »); the
forge's frame → `GAME_WORLD.md` §2sexies; a forge skeleton → `KIT/authoring/README.md` « Skeletons »; the design
questions → `review.md` §A.
