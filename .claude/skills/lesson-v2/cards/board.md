# Card — the board, the memo, the class test, the warm-up, a lab tag

Read this card, the brief and the files you touch — nothing else unless « Not enough? » sends you there.
`<L>` = the lesson's folder; `L1/` = lesson 1, the model:
`apps/web/src/lessons/college/3e/nombres_calculs/multiples-et-diviseurs/decomposer-en-facteurs-premiers/`;
`CS/` = `apps/web/src/features/classSession/`; `LK/` = `apps/web/src/lessons/common/launchkit/`.

## 1. You write / you never touch

- **Write**: `<L>/board/script.js`, `memo.js`, `board.test.js`; `content/class-tests/<grade>/<code>.json`.
- **Append only, LAST, by an anchored Edit**: a warm-up family in `LK/families.js` (its object, then ONE entry in
  `FAMILIES`) with its block in `LK/launchkit.test.js`, if the brief asks; a lab instrument's tag
  `lesson: '<code>'` in `apps/web/src/lessons/common/lessonlab/registry.js`.
- **Never touch**: `<L>/world/` (read `story.js`, `knowledge.js`, `math.js`), the code of `CS/` (a missing station
  kind is REPORTED), the bank, `../smarter-academy-dz`.

## 2. The limits you can break

- 1366×768, nothing scrolls; text ≥ 12 px, 18 px for what the class reads. `<L>/world/limits.test.js › describeLimits`
  reads your `SCRIPT`: ≤ 14 steps, ≤ 6 options on an `ask`, a `cue` ≤ 70 characters with no `$`. A tablet over 320
  characters is drawn dense (`CS/lessonScripts.js › DENSE_WORDS`): French tablets are longer, count them.
- Register: a class-test question and a warm-up card speak « tu »; the memo speaks « vous » to the teacher. Never
  « faux »: the board shows what happens.
- U+00A0 before « : » and inside « … », U+202F before « ; ! ? », « ’ », « 3e »; numbers through `formatFr` / `texFr`
  (`@smarter-academy/core`); `\\times`, `{,}`; « PGCD(20 ; 30) = 10 » in a cue is a formula; every memo field through
  `MathText`.
- Agreement through `counted`, `listFr` (`kit/authoring/numbers.js`); a family joins its lists with its own joiner
  (`families.js › andList` — the briefs' `listText` does not exist).
- Vocabulary: « la leçon au tableau », « la fiche du professeur », « séance en classe », savoir-faire, clé,
  « L’échauffement ». Own numbers (`BOARD`) — not the student's story, not the bank; French names; no betting, no brand.

## 3. The hooks — what the machines read

- `script.js` exports `SCRIPT` (`{ steps: [{ id, kind, chapter, cue, … }] }`), `BOARD` (every number, ONE place),
  `KEYS` (the tablets' ids in order), `FACTS`, `sheets` → `lesson.pack.js › board.script`. The step kinds and what the
  board does with each: the header comment of `CS/lessonScripts.js` (`situation`, `ask` with `words: { card, held,
  fell }`, `name`, `trace`, `ladder`, `court`…). Lesson 1: `situation`, four `ladder`, four `name`, two `trace` last,
  ONE copybook group (`groupsOf`).
- `memo.js` exports `MEMO` (parts: `CS/lessonMemos.js`; an opening's `kind` picks a drawing of `MemoFigures.jsx`) →
  `lesson.pack.js › board.memo`.
- `board.test.js` computes every number of script and memo, checks kinds, cues, the order of the names, each key's
  words before its naming station, French (`typographyErrors`, `agreementErrors`, `stringsIn` of
  `kit/authoring/test/suites.js`), foreign numbers (`readBank`, `storiesOf`, `collisions` of
  `kit/authoring/test/bank.js`). Imitate `L1/board/` file by file.
- The class test: `{ lesson, grade, version, start, end, pool }`, each question `{ id, item, kind: 'truefalse' |
  'choice' | 'number', text, answer, options?, check, teaser?, pairOf? }` — model
  `content/class-tests/3e/decomposer-en-facteurs-premiers.json`. NO test reads `check` yet: re-compute each answer and
  say how. The status script checks only that the file exists (T2).
- A family (`LK/families.js › DECOMPOSITION`): `{ item, name, icon, labTool, mistakes, forms: { 1, 2 }, make, example,
  rules, memo }`; `labTool` is an EARLIER lesson's instrument or `null`. Status S1: a family per core tool of
  `toolsForLesson(<code>)`; S8: `lesson: '<code>'` in the lab registry.

## 4. The ten ledger lines you break most (`defects.md`)

- **A2** — No key's name before its naming station, in a cue, a card or the warm-up's lab. Caught: `board.test.js`,
  `LK/launchkit.test.js`, `e2e/lib/launchKitTwoTools.mjs`.
- **A7** — Compute every memo quiz option and class-test answer. Caught: `board.test.js`; the class test: eye only.
- **A10** — A station not about planks carries its own `words`. Caught: `CS/askWords.render.test.jsx`.
- **B6 / C17** — Join lists with the family's joiner; never deal a number where the slip equals the truth (2² = 2 × 2 =
  2 + 2). Caught: `launchkit.test.js`, `launchKitTwoTools.mjs › fill`.
- **B17** — A tablet: a method line, a short list, one note. Caught: `describeStory › tablet`, eye.
- **B39 / D48** — Size a drawing for its box; count a tablet's characters and fractions. Caught: the board walk,
  `CS/lessonScripts.test.js › denseTablet`.
- **B40** — Every memo field through `MathText`. Caught: `CS/lessonMemos.test.js`, `walk.mjs`.
- **D7 / D12** — Numbers no bank and no story hold. Caught: `board.test.js › collisions`.
- **D38** — An instrument with its own viewBox passes its point mapper. Caught: `lessonlab/*.render.test.jsx`.
- **B36** — Measure the shell with the longest French name. Caught: `e2e/lib/lessonWalk/board.mjs`.

## 5. Checks you run

```bash
cd apps/web && npx vitest run <L>/board/board.test.js src/features/classSession/lessonScripts.test.js \
  src/features/classSession/boardLessons.test.js --maxWorkers=2      # + launchkit.test.js / the instrument's test
npx eslint <your files> && npx prettier --check <your files>          # from the repo root
node -e "JSON.parse(require('fs').readFileSync('content/class-tests/<grade>/<code>.json','utf8'))"
```

Not: a walk, a build, the whole suite, `check:lessons`. Never commit.

## 6. Your report (≤ 300 words)

Files changed (ported: kept / converted / cut); what you ran, with numbers; what you could not verify (stations, memo,
warm-up); unsure points and open choices; ledger lines you may have hit; what a board walk must click and what differs
from lesson 1's board. Longer → the brief's file.

**Not enough?** A station kind → `CLASS_SESSION.md` §5ter; the memo → §2quater; the class test → §4; a family →
`LAUNCH_KIT.md`; French → `FRENCH_LANGUAGE_CONTRACT.md` §4–§7.
