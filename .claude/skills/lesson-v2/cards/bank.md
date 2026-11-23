# Card — the exercise bank

Read this card, the brief and the files you touch — nothing else unless « Not enough? » sends you there.
`<B>` = `content/practice/<grade>/<code>/`; the model is lesson 1's bank `content/practice/3e/decomposer-en-facteurs-premiers/`
(50 sheets; `choice`, `rational`, `factorization`, `integerSet`; 9 ported from DZ).

## 1. You write / you never touch

- **Write**: `<B>level-<N>/ex-<grade>-<code>-l<N>-<nnn>.json` (N = 1…5); the oracle `scripts/practice-oracle/<code>.mjs`.
- **Append only, LAST, by an anchored Edit**: new ids in `content/practice/misconceptions.json`; the code in
  `content/practice/active.json` and (exam format) `exam-style.json`; `policy.json` only if the brief says so.
  `index.generated.json` is written by `npm run validate:exercises`, never by hand.
- **Never touch**: the lesson's folder, the validators, `packages/core/practice/`, `../smarter-academy-dz` (read only).

## 2. The limits — notation and money, in full

- **Register**: « tu », imperatives (« Décompose », « Justifie »); never « faux »; feedback says what is observed;
  hints graded (`look`, then `direction`), never the answer.
- **Typography** (prose): U+00A0 before « : » and inside « … »; U+202F before « ; ! ? »; « ’ » (U+2019); « 3e »,
  « 1re »; no « !! ».
- **Numbers**: decimal comma — prose « 3,5 », LaTeX `3{,}5`; thousands `1\\,764` in a formula, U+202F in prose (the
  validator does NOT check thousands: re-read). Numbers of a statement inside `$…$`.
- **Writing**: `\\times` (never `\\cdot`, `*`); `\\leqslant`, `\\geqslant`; « PGCD(12 ; 18) », « (2 ; −3) »; `2^{4}`;
  `\\dfrac{p}{q}`; units after U+00A0 (« 5 cm », « cm² »); a variable always `$x$`; two backslashes in JSON.
- **Money**: « 12,50 € » — sign after, U+00A0 before; never « 35€ », « €35 », « EUR », « DA », « dinars »; a plausible
  French price (a crate 12 €, not 1 200 €); « 20 % » with U+00A0.
- **Contexts**: own wording and numbers, never a textbook's; school, sport, music, cooking, transport, a local shop;
  first names of today's France, girls and boys equally; no religion, brand, politics, alcohol, tobacco, betting,
  playing cards; a die, a coin, an urn only as an experiment.
- **Porting a DZ exercise**: rewrite each sentence from its job; dinars → plausible euros; names and places → French;
  re-scale to the grade and change numbers that collide; cut steps outside the lesson's points (or `counted: false`
  with one of its points); declare it (§3). Never cite the BEM.

## 3. The hooks (`scripts/validate-exercises.mjs`, `scripts/validate-lib.mjs`)

- An exercise (imitate `level-1/…-l1-001.json`, `level-5/…-l5-001.json`): `id`, `lessonCode`, `level` (1
  recognition → 5 problem), `brevet: 1 | 2 | null` and `calculator` (REQUIRED in 3e; `brevet: 1` ⇒ `false`),
  `metadata.{ title, estimatedMinutes, tags, source, exam }`, `statement.{ content, formulas?, table?, figure? }`,
  `questions[]`.
- `source`: new → `{ type: 'platform_addition', reason: 'practice_generation', learningPoint, modelledOn: null }`;
  ported → `reason: 'dz_port', adaptedFrom: '<DZ id>'` (lesson 1; undocumented in the contract); on a brevet's model →
  `reason: 'brevet_modelled'` + badge « Sur le modèle du brevet <année> »; a real item → `{ type: 'brevet', year, part,
  exercise }`, `brevet` = `part`.
- `exam`: `kind` (`adapted` → `badge: null`), `heading`, `points` two digits (« 01,5 »). Exam-format lessons: 10 sheets
  a level in `--strict`; otherwise ≥ 3 (`policy.json`).
- A question: `step` « 01 »… non-decreasing, `sub` a–h never back, `learningPoints` (ONE `primary`; codes
  `<grade>_<code>_P<n>` of `packages/core/curriculum/fr/lessons_<grade>_*.json`), `cognitiveDemand`, `answerType` ∈
  `SUPPORTED_ANSWER_TYPES` (`packages/core/practice/answerEvaluator.js`: choice, multiChoice, rational, affine,
  interval, point, integerSet, selfCheck, factorization), `expectedAnswer` the evaluator parses (`"2^2*3^2*7^2"` +
  `evaluationPolicy.requiredForm`), `answerFormat`, `hints`, `feedback`, `solution.{ lines, result }`. Wrong choices
  carry an existing `misconceptionId`; the right one none.
- The oracle exports `ORACLE = { '<exercise id>:<question id>': R(…) | F(…) }`, each key RECOMPUTED from the
  statement by an independent path (imitate lesson 1's; `helpers.mjs`) — read by
  `scripts/practice-answer-oracle.test.mjs`.

## 4. The ten ledger lines you break most (`defects.md`)

- **E1** — Re-tag every port: French provenance, `brevet` / `calculator`, sub-items. Caught: `--strict`.
- **A8 / B13** — « 12,50 € » at a French price; no « DA ». Caught: `typographyErrors` (`devise`, `monnaie`, `unité`).
- **A7** — Recompute every key, make every distractor false. Caught: `practice-answer-oracle.test.mjs`.
- **D50** — Points from the catalogue, each primary on enough questions. Caught: `validate:exercises`.
- **E5** — Report what the bank asks that the keys do not carry (paliers 3–5). Caught: eye.
- **D7** — Report your headline pairs: the world must avoid them. Caught: `lesson-bank-numbers.mjs`, `story.test.js`.
- **B30 / B20** — Few answers a sheet; a spreadsheet grid is `statement.table.sheet`. Caught: `sittingWalk.mjs`.
- **B31** — Group thousands. Caught: eye only in the bank.
- **B35** — A program listing left-aligned, nested lines indented with no-break spaces. Caught:
  `problemTable.render.test.jsx`.
- **C18 / C20** — Decimal keys the evaluator reads as numbers. Caught: `sittingWalk.mjs › sameAnswer`.

## 5. Checks you run (loop until clean)

```bash
npm run validate:exercises                  # rewrites index.generated.json, prints errors
npm run validate:exercises -- --strict      # the gate: 0 errors
npx vitest run --dir scripts practice-answer-oracle --maxWorkers=2
node scripts/lesson-bank-numbers.mjs <code>
cd apps/web && npx vitest run <L>/world/sitting.test.js --maxWorkers=2   # if the lesson's world exists
```

Not: a walk, a build, the whole suite, `check:lessons`. Never commit.

## 6. Your report (≤ 300 words)

Sheets per level and answer type; ports (DZ id → kept / converted / cut); validator and oracle numbers; primary
questions per point; headline pairs; what you could not verify (sheet heights); unsure points; ledger lines you may
have hit. Longer → the brief's file.

**Not enough?** A field → `EXERCISE_CONTRACT.md` « The exam sheet » and « The brevet tags »; an answer shape →
« Platform-generated practice exercises », « `answerType: 'factorization'` »; typography → « French typography of the
bank »; a figure → « Statement figures ».
