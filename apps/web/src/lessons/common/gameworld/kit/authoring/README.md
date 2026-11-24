# The authoring kit — write a lesson's world by filling content, not by rewriting machinery

The three lessons built on « L’archipel des diviseurs » (an Algerian unit, lessons 4–6) each re-derived the same helpers, forge
blocks and tests: 31 + 39 agent minutes for lesson 6's written world. This folder holds that machinery ONCE, tested (it
was proved on two of those lessons; the proofs left with the Algerian lessons on 2026-11-22). Since 2026-11-20 the `world/math.js` of
lessons 4–7 RE-EXPORT `numbers.js` (their copies are deleted) and lesson 6's `forges.js` is assembled from
`forgeBlocks.js`: a block or a helper no lesson uses is deleted, never kept « for later » (`npm run check:unused`).

| File                              | Side   | What it gives                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `numbers.js`                      | app    | the PGCD, divisors, `euclid`, `differences`, `roadOf` (a convoy's road), LaTeX (`pgcdTex`, `divTex`, `divisionTex`, `subTex`), `listFr` (« 1, 2 et 4 »), `fr` / `frAll` (French typography laid on a sentence, or on every sentence of a text object), `counted(n, [singular, plural])` (French agreement: 0 and 1 singular; a no-break space after the number; thousands separated by U+202F, the core's `formatFr`) and the world's noun tables (`COINS`, `PLANKS`, `ROWS`, `CELLS`…), `planks`, `planksFill`, `planksOf`, `emptyCells`, `coinsLeft`                                                                                                                                                                                                                       |
| `forgeBlocks.js`                  | app    | `judge` (tiles → `slots`, `says`, `isTheRule`), `noPredictions`, `pairCase` / `plankCase`, `pairPool`, `gather` / `fromLog` / `fromRounds` (evidence), `firstBreak` / `hard` / `attacksOf` (attacks), the last step's lines (`givenDivision`, `divisionRow`, `subtractionRow`, `differenceBox`, `pgcdBox`, `pgcdPairBox`, `line`; a fraction over a real bar: `fractionBox`, `givenFraction`; a decimal box « 77,5 »: `decimalBox`; a choice of written options: `choiceBox`, and a ratio of segment names `ratioChoice`; `boxesOf` — the boxes of a line), `makerOf`, `pairsOutside`, `firstWrong`                                                                                                                                                                          |
| `test/suites.js`                  | vitest | `describeStory`, `describeForges`, `describeExperiments`, `describeEvidence`, `describeTrainer`, `describeKnowledge`, `describeLimits` (+ `PROVEN_LIMITS`), `describeSitting`; helpers `said` (since 2026-11-23 also: every number of four digits or more grouped, `thousandsErrors`; every variable written one way, `variableErrors`), `plain`, `trueEqualities`, `agreementErrors`, `typographyErrors` (kinds `milliers` and `variable` added the same day; and its kept alias `looseComma`), `thousandsErrors`, `variableErrors`, `BIDI`, `stringsIn`, `allRules` (every rule a forge's tiles write), `buildersOf` (the planks that build a road; marked gaps too), `holdsOn`, `convoyBuilders`, `storeHolders`, `fractionOf`, `answersOnLine`, `valueOf`, `pointErrors` |
| `test/bank.js`                    | Node   | `readBank(id)` (each sheet's `text`, and its `body` without the textbook's metadata: source, page, minutes), `bankPairs`, `pairLines`, `collisions`, `bankNumbers` (every number the bank writes: whole, decimal « 7,5 » / `7{,}5`, fraction « 5/6 » / `\dfrac`), `alone`, `valueOf`, `shown`, `storiesOf`, `islandNamesIn`                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `scripts/lesson-bank-numbers.mjs` | CLI    | `node scripts/lesson-bank-numbers.mjs <id> [--check 119,85 1833,546 57.5,77.5 1/38 …] [--js] [--numbers]` — a decimal is given with a POINT (the comma separates a group)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

The kit names no lesson and no world's key: the lesson is always the argument. `test/` is a test folder for the repo's checks: it is never in the app.

## The order to write a `world/`

1. **Numbers first.** Choose the road's numbers, then, BEFORE using them anywhere:
   `node scripts/lesson-bank-numbers.mjs <id> --check 259,185 1833,546 1176,868` — every group must print `CLEAR`.
   Paste `--js`'s line into `forges.js` (`BANK_PAIRS`: the mirror never draws one).
2. `math.js` — `NUMBERS` and re-exports from `numbers.js` (never a copy). `story.test.js` checks each convoy with
   `buildersOf(gaps, purse)` (`test/suites.js`).
3. `story.js` (+ `story.test.js`), `text.js`, `journey.js`, `sitting.js`, `index.js`.
4. `knowledge.js`, `practice.js`, `trainer.js`, `evidence.js` and their tests.
5. `inquiries.js`, `forges.js` and their tests (wave 2).
6. `limits.test.js` — `describeLimits` with the defaults; a limit is raised ONLY to a number a walk of this lesson measured.

## Skeletons

`<kit>` = `../../../../../../common/gameworld/kit` from a lesson's `world/`.

```js
// math.js
export { gcd, euclid, differences, listFr, counted, COINS, ROWS, planksFill, coinsLeft } from '<kit>/authoring/numbers';
export const NUMBERS = { tarh: { gaps: [259, 185], purse: 12, plank: 37 }, boss: { lanes: [1176, 868], plank: 28 } };
```

```js
// forges.js — one forge met on a convoy (lesson 6's 🔁 was rebuilt this way)
import {
  attacksOf,
  fromLog,
  judge,
  noPredictions,
  pairPool,
  plankCase,
  makerOf,
  pairsOutside,
  givenDivision,
  divisionRow,
  pgcdBox,
  firstWrong,
} from '<kit>/authoring/forgeBlocks';
const BANK_PAIRS = new Set('…'.split(' ')); // scripts/lesson-bank-numbers.mjs <id> --js
const iqCase = (A, B, d) => plankCase('iqlidis', A, B, d);
const plankId = (c) => `${c.of}:${c.A}:${c.B}:${c.d}`;
const J = judge({
  slots: [NEXT, STOP, MAKE],
  right: { next: 'sr', stop: 'zero', make: 'last' },
  says: (rule, c) => iqRun(rule, c.A, c.B).made === c.d,
}); // iqRun: what the tiles mean — the lesson's own
const iqForge = {
  key: 'iqlidis',
  ...J,
  caseId: plankId,
  predictCases: noPredictions,
  evidence: fromLog({ of: 'iqlidis', gaps: NUMBERS.iqlidis.gaps, make: iqCase, lived: [39], caseId: plankId }),
  attacks: attacksOf({
    ...J,
    caseId: plankId,
    hard: [iqCase(63, 45, 18), iqCase(63, 45, 9)],
    pool: pairPool({ A: [6, 40], B: (a) => [a + 1, 60], d: (a, b) => [1, b], make: iqCase, exclude: BANK_PAIRS }),
  }),
  use: {
    make: makerOf(pairsOutside(IQ_USE, BANK_PAIRS), (A, B) => ({ A, B, rows: euclid(A, B), g: gcd(A, B) })),
    lines: (c) => [
      givenDivision(c.A, c.B, { q: 'q1', r: 'r1', rw: 3 }),
      divisionRow(2),
      divisionRow(3),
      pgcdBox(c.A, c.B),
    ],
    check: (c, v) =>
      firstWrong([
        ['row1', +v.q1 === c.rows[0].q && +v.r1 === c.rows[0].r],
        [+v.g ? 'pgcd' : 'zero', +v.g === c.g],
      ]),
  },
  ruleText,
  explain,
  chip,
  nudge,
  text,
}; // the lesson's words
```

Each test file then holds three lines for the shared checks, plus ONLY what is the lesson's own (its road's facts,
the false rules its students hold, its trainer's mistakes):

```js
// story.test.js
import { describeStory } from '<kit>/authoring/test/suites.js';
describeStory({
  id: '<id>',
  story: STORY,
  tablets: TABLETS,
  keys: KEYS,
  before: { '<key>': { words: /garde|commun/, lines: [STORY.text.say.hello /* every sentence before its forge */] } },
});

// forges.test.js — roads: the log as the world writes it ([{ a, b }]) on three roads; solve: the last step's answer
describeForges({
  forges: FORGES,
  keys: KEYS,
  roads: { AT_ONCE, WALKED, EVERY },
  before: BEFORE,
  inquiry: { '<key with an experiment>': RESULT },
  solve: SOLVE,
  forbidden: FORBIDDEN,
  bank: '<id>',
});

// inquiries.test.js
describeExperiments({
  ofKey: { '<key>': BENCH },
  linesOf: (key, spec) => [
    /* every sentence it can say */
  ],
  never: /PGCD|diviseur/,
  own: { '<key>': /jusqu’à obtenir/ },
});

// evidence.test.js
describeEvidence({
  id: '<id>',
  keys: KEYS,
  evidence,
  trainerEvidence,
  trainer,
  check,
  solution,
  config: LESSON_CONFIG,
  cards: KNOWLEDGE.graph.nodes.map((n) => n.id),
  boxes: { farq: ['e', 'g'] },
  mistakes: (q, right) => [],
});

// trainer.test.js
describeTrainer({
  trainer,
  check,
  solution,
  answerLabel,
  evidenceOf: trainerEvidence,
  planOf: PLAN_OF,
  cards: KNOWLEDGE.graph.nodes.map((n) => n.id),
  kinds: ['farq', 'tap', 'tf'],
});

// journey.test.js (the knowledge map)
describeKnowledge({ knowledge: KNOWLEDGE, keys: KEYS, cards: lesson.cards });

// limits.test.js
describeLimits({
  forges: FORGES,
  keys: KEYS,
  tablets: TABLETS,
  objectives: [
    /* every instruction */
  ],
  knowledge: KNOWLEDGE,
  practiceMap: PRACTICE_MAP,
  script: SCRIPT,
});

// sitting.test.js
describeSitting({ id: '<id>', lesson, sittings, levels: LEVELS });
```

## What each suite checks (and what it does NOT)

- **describeStory** — one island more than segments; every bridge holds with its plank; the store last with exactly
  one right option; every convoy SOLVABLE (`buildersOf` over the moulds, the workshop's lengths or the store's options,
  with the purse, is exactly its plank). **A marked bridge** (`mark`, `strokes` — `divisorIsles/mark.js`, lesson 8) is
  read as the world plays it: a plank holds only when it fills the gap AND puts a joint on the post (`markVerdict`),
  the strokes add up to the mark, and a store standing in a convoy with a purse is right when its option is the ONLY one
  that holds within the purse (`storeHolders` — several may hold the post). A lesson hands the suite its REAL story,
  never an adapted view; `onArrive` run twice gives the same forges, never a held key's; `pendingForge` agrees with
  `onArrive`; no pair of the bank, no pair on one line of the bank or of another story; headline numbers in no other
  story; island names unique across all stories; the gate dash; the tablets (true equalities, 2 lines, 2 formulas,
  1 plain note with no bidi control — an equality of FRACTIONS, `\frac{66}{78} = \frac{11}{13}` or a sum of
  them, is checked by cross-multiplication, `fractionOf`); French agreement (« 1 dalle », « 2 dalles ») and French typography (no-break spaces, ’, « 3e ») over every fixed sentence; no key's words
  before its forge (the lesson lists the sentences — it knows which are played before which key). NOT: what
  `objective` / `recall` say on a given island (the lesson's own fake-game test), the boss's mission wording.
- **describeForges** — every rule the tiles write is refuted but one, on EVERY road; evidence idempotent, a mirror
  case joins last; hard attacks give a « yes » and a « no »; nudges are cases, never a choice of rules; every sentence
  worded and plain where the screen does not render maths; forbidden words before the last step; the last step accepts
  its solution and refuses each wrong box with a `text.use` key; no bank pair in anything the mirror shows; drawable
  sizes. NOT: which false rule falls on which plank (the lesson's « students really hold » tests).
- **describeEvidence** — `verifyClaim(claim) === check(q, v).ok` over right, off-by-one, empty, swapped and the
  lesson's own mistakes; never evidence for a tap, a true/false, a second try or a helped answer. Each key proves its
  OWN point — unless the lesson DECLARES `pointOf: { key: 'P<n>' }` (more keys than points): then every key is declared
  with the point the evidence gives it, and every point a module teaches is proved by a key (`pointErrors`).
- **describeTrainer** — every question accepts its solution (true equalities in the correction) and refuses a wrong
  answer with a hint; ≤ 3 answers a line — a box, a choice, a TYPED FRACTION `{ frac: { n, d } }` or a TYPED POWER
  `{ pow: { base, exp } }` counted as ONE (one answer in its shape: `answersOnLine`), a fraction typed whole or printed
  whole, a power with both parts and no exponent typed flat after its base; agreement and commas. NOT: the lesson's own
  hint texts. `valueOf` (every equality check) reads powers: `2^{3}`, `2^3`, `2³`, a printed `{ pow }` token.
- **describeKnowledge** — positions, reachability, key order along links, layout distances, memo sheets.
- **describeLimits** — `PROVEN_LIMITS` (lesson 6's measured limits, 2–4 columns): past one, WALK the screen first.
