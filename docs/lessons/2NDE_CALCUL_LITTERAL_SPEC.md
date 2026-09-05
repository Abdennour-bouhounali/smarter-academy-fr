# 2nde — Calcul littéral — Design & Implementation Spec

> Built 2026-09-05. Sections follow LESSON_DESIGN_PLAYBOOK §15.3; shipped state at the end.

## 1. Identity & curriculum contract

- Key `seconde_calcul_litteral` · id `calcul-litteral-2nde` · ✏️ · Difficile · free · 80 min.
- LPs: P1 identifier/manipuler une expression · P2 réduire · P3 développer · P4 factoriser · P5 choisir la forme · P6 démontrer ou résoudre.
- Prerequisite displayed: Arithmétique (the 2nde lesson named by the curriculum data).
- Distinct from the 3e lesson « Calcul littéral et algébrique » (border of tiles, algebra tiles, area rectangle): here the program of calculation, identities with adjustable a and b, composite common factors, the choice of form, proofs.

## 2. Central idea & misconceptions

**Central idea:** a letter follows every number at once. A trick that always returns 3 is not a coincidence checked on ten numbers but an equality of expressions, true for all x. Reducing, developing and factoring change only the writing; each writing answers a different question.

| # | Misconception | Confronted | Consequence |
|---|---|---|---|
| 1 | « dix essais qui marchent = preuve » | M1 « Suivre avec x », M6 proof, boss e1 | the symbolic chain 3x → 3x + 9 → x + 3 → 3 |
| 2 | 3x² + 2x = 5x³ ; 3x + 2 = 5x | M2 refusal + ValueTable, boss e3 | x = 1 agrees, x = 2 gives 16 ≠ 40 |
| 3 | (a + b)² = a² + b² | M3 grid, boss e4 | the two ab rectangles |
| 4 | sign of the double product, (a − b)² = a² − b² | M3 minus mode | the corner removed twice |
| 5 | partial common factor (4 instead of 4x); « (x + 1) n'est pas un facteur » | M4, boss e6/e7 | « on peut sortir plus » ; the bracket sum |
| 6 | « … + 9 » counted as factorised | M4 task 4 | a sum is not a product |
| 7 | wrong form for the question | M5, boss e8 | tap the form, read the answer |
| 8 | simplifying terms instead of factors | M6 step 4, boss e10 | 2x + 4 = 2(x + 2) first |

## 3. Signature interaction — « Le tour de magie » (`MagicTrick`)

Controlled variable: the starting number (chips incl. −7 and 2,5, free input). State `trials[]`, `showX`; numeric and symbolic chains derived (`numericChain`, `symbolicChain`). The lab is on screen at once; the prediction is an optional prompt inside step 1 (user rule 2026-09-05). Aha: always 3, even for −1 000 000; « Suivre avec x » shows why; the second trick (x + 1)² − x² = 2x + 1 is predicted for 10. Rejected candidates: a static worked example (no cause/effect), the 3e border pattern (already shipped), a calculator (hides the chain).

## 4. Module architecture (8 · 80 min)

| # | Slug | Stage | LPs | min | Responsibility | Interaction |
|---|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | collège literal calculus, integers | kit |
| 1 | le-tour-de-magie | trigger | P1 P6 | 9 | expression, égalité pour tout x | `MagicTrick` |
| 2 | reduire | discovery | P2 P1 | 9 | like terms only, value unchanged, 5x³ trap | `TermMerger`, shared `ValueTable` |
| 3 | developper-laire-qui-se-decoupe | discovery | P3 | 10 | three identities on areas, double distributivity | `IdentityGrid` (plus/minus/diff) |
| 4 | factoriser-le-facteur-commun | manipulation | P4 | 11 | monomial, binomial, a² − b², (a + b)² | `FactorFinder` (cap 3 → reveal) |
| 5 | trois-formes-trois-usages | formalization | P5 P3 P4 | 9 | A(0), zeros, minimum; À retenir | kit |
| 6 | demontrer-et-resoudre | practice_lab | P6 P5 P2 | 13 | proof order, n(n + 2) + 1, frame area, fraction | `ProofOrder`, `ValueTable` |
| 7 | mission-finale-le-magicien | evaluation | — | 15 | 10 QCM | kit `BossFinal` |

## 5. Model — `components/litteralUtils.js` (8 tests)

Polynomials as coefficient arrays: `add`, `sub`, `mul`, `scale`, `evaluate`, `formatPoly`/`texPoly`, `termsOf`; programs (`applyStep`, `symbolicChain`, `numericChain`, `stepLabel`); `squarePieces`; `divideByMonomial`, `commonMonomial`, `asDifferenceOfSquares`, `asPerfectSquare`.

## 6. Layout safety & tests

`IdentityGrid`: fixed 300 × 300 viewBox, scale from the side, inside labels only when the piece is ≥ 34 × 26 px, all numbers in the DOM legend (swept over a 1–6 × b 1–4 in the e2e, desktop and 375 px). `MagicTrick` cards are DOM with `break-words` (−1 000 000 tested). E2E `2nde-calcul-litteral.mjs`.

## Shipped state (2026-09-05)

`available`, validator 6/6, zero errors from this lesson, duration 80 = module sum.
