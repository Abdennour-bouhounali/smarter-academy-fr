# Card — repairing what a walk or a review found

Read this card, the brief (its numbered defects) and the files you touch — nothing else unless « Not enough? » sends
you there. `LIB/` = `apps/web/e2e/lib/`; `LW/` = `apps/web/e2e/lib/lessonWalk/`; the model descriptor is lesson 1's
`apps/web/e2e/lessons/decomposer-en-facteurs-premiers.walk.mjs` (the `bahth-pgcd.walk.mjs` the README names is only in
git: `git show 049380e:…`).

## 1. You write / you never touch

- **Write**: the descriptor `apps/web/e2e/lessons/<code>.walk.mjs`, and the files the brief's defects point to — a
  lesson file, a kit file, a `LIB/` file — the smallest change, each with its check.
- **The shared library** serves every lesson: never weaken a check for one lesson; a check wrong for every lesson is
  fixed there and said loudly. A new handler is registered LAST in its table (`LW/experiments.mjs › EXPERIMENTS`,
  `LW/lab.mjs › INSTRUMENTS`, a branch of `LW/board.mjs`).
- **Never touch**: the files another fix agent owns (the brief splits: the student's world ∥ board, warm-up, lab); a
  test of theirs you break is REPORTED with its fix. Never `../smarter-academy-dz`.

## 2. The limits you can break

- ONE size, `E2E_SIZE=1366x768` (the README's « once at 1024×768 » is outdated).
- The 12 px floor (`LIB/walk.mjs › FLOOR`, `px < 11.95`) is never lowered, no screen exempted.
- Compare what is SEEN: normalise U+00A0 / U+202F before comparing text; numbers as numbers (« 7,2 » = 7.2).
- A sentence you fix keeps its file's French rules (U+00A0 before « : », U+202F before « ; ! ? », « ’ », `counted`);
  that file's unit test says whether it holds.

## 3. The hooks — descriptor and library

- The descriptor's default export (`LW/README.md` « The descriptor »): `id` (a LITERAL: the status script finds the walk
  by it), `uid`, `forbidden` `{ key: [words] }`, `benchForbidden`, `story` `{ wrongFirst, purseOut, markMiss,
  fallFirst, reloadOn }`, `truth` `{ key: (case) => bool }`, `use` `{ key: (c) => ({ box: value }) }`, `useWrong`,
  `falseTiles`, `notBridge`, `dash`, `gate`, `solve` `{ kind: (q) => ({ box: value }) }`, `statement`, `train`,
  `launch` (REQUIRED: `{ scenario, tool, tools }`), `bossParts`, `foreignWords`, `foreignNumbers`, `ownNumbers`, `steps`.
- `steps` hooks: `island:<id>:before`, `convoy:<name>:before`, `forge:<key>:before|after`, `dash:before`,
  `boss:before`, `board:<stepId>` (replaces that station's play); `ctx` = `{ w, page, W, L, D, OUT }`.
- The library DERIVES — never re-write it in a descriptor: the rule that holds, each convoy's planks, the bench's
  answers, the board's picks, foreign words and numbers (`LW/load.mjs`, `LIB/lessonWords.mjs`), the map's cards.
- The checks: `LIB/walk.mjs › shot` at every screenshot (scroll, cut, raw LaTeX, one-line formulas, foreign words,
  money, a way out, `tinyText`); `LW/checks.mjs` (`worldShot`, `noName`, `tilesFit`, `lastStepLayout`, `pairChecks`,
  `inquiryFits`, `tellsNothing`, `mapLaidOut`, `mapApart`); `LIB/sittingWalk.mjs` (`everySheet`, `sameAnswer`);
  `LIB/launchKitTwoTools.mjs`; `LIB/bankSheet.mjs`.
- The orchestrator's run line (not yours): `E2E_SIZE=1366x768 node apps/web/e2e/lesson.mjs <code> <part> <out>`.

## 4. The ten ledger lines you break most (`defects.md` §C, §D)

- **C1** — Compute every answer from the numbers on screen; a state hook gives the question only. Caught: diff review.
- **C3** — Never weaken a check (a floor, an exemption, a looser match). Caught: diff review.
- **C4** — A check failing on equal numbers or whole text is the check's fault: fix it, say so. Caught: the report.
- **C5 / C17** — Test the worst random case on purpose; check each « wrong » value differs from the right one. Caught:
  `launchKitTwoTools.mjs › fill`.
- **C11** — Normalise no-break spaces; never measure under a full-screen layer. Caught: `sittingWalk.mjs › readBox`,
  `walk.mjs › tinyText`.
- **C12 / C22** — Read kinds and lists from the kit, never from a copied table. Caught: `bankSheet.mjs`,
  `launchkit.test.js`.
- **C13** — One hook value, one control. Caught: diff review.
- **C18 / C20** — Decimals as numbers; a raised exponent is not a new line. Caught: `sittingWalk.mjs › sameAnswer`.
- **C19 / C4b** — Wait for the element, never for a duration. Caught: `LW/forge.mjs` (`[data-di-tablet]` gone).
- **C6 / D49** — No source edit while a walk runs; nothing else writes then. Caught: the frozen copy (`SKILL.md` §4).

## 5. The rules of a fix batch (§R)

- For EACH defect: what was seen, why it is one, what the fix achieved, and the machine check added — a unit test, or
  an assertion in the descriptor marked « to move to `LIB/` ».
- A changed number or sentence updates the walk's expectation; no assertion is weakened.
- What you cannot fix in your files is reported with its file and fix.

## 6. Checks you run

```bash
node --check apps/web/e2e/lessons/<code>.walk.mjs <each edited LIB/ file>
cd apps/web && npx vitest run <the unit tests of each lesson or kit file you edited> --maxWorkers=2
npx eslint <your files> && npx prettier --check <your files>   # from the repo root
```

Not: a walk (the orchestrator re-runs them on a frozen copy), a build, the whole suite, `check:lessons`. Never commit.

## 7. Your report (≤ 300 words)

Per defect: file, cause, fix, check added. What you ran, with numbers. What only a walk can confirm (part, screen).
Library changes, loudly, with the lessons they touch. Unsure points; ledger lines you may have hit; lines for
`defects.md` and `trusted.md`. Longer → the brief's file.

**Not enough?** Descriptor keys and hooks → `LW/README.md` « The descriptor », « Hooks »; adding to the library →
« Adding to the library »; what it does not play → « Not covered »; a defect's story → its line in `defects.md` §C.
