# 2nde — Équations et inéquations — Design & Implementation Spec

> Built 2026-09-05. Sections follow LESSON_DESIGN_PLAYBOOK §15.3; shipped state at the end.

## 1. Identity & curriculum contract

- Key `seconde_equations_et_inequations` · id `equations-et-inequations-2nde` · ⚖️ · Difficile · free · 85 min.
- LPs: P1 équation = égalité à résoudre · P2 premier degré · P3 inéquation · P4 représenter les solutions · P5 produit nul · P6 quotient et valeur interdite · P7 interpréter et vérifier.
- Prerequisites: Calcul littéral, Ensembles et intervalles.

## 2. Central idea & misconceptions

**Central idea:** résoudre = trouver TOUTES les valeurs de x qui rendent la relation vraie. Discovered by scanning x: an equation of degree 1 has one solution (or none, or all), an inequality has a whole half-line. Then the methods: same operation on both sides; the sign flips on a negative divisor; a product is zero iff a factor is; a quotient is zero iff the numerator is, the denominator's zero being forbidden.

| # | Misconception | Confronted | Consequence |
|---|---|---|---|
| 1 | « une inéquation a une solution » | M1 prediction, boss e1 | the lit region [0 ; 4[ on the line |
| 2 | « on fait passer sans toucher l'autre membre » | M2 one-sided ops, boss e4 | the red line « ⚠ solutions changées » |
| 3 | « 7/3 ≈ 2,33, c'est pareil » | M2 step 3 | 18,31 ≠ 18,32 by substitution |
| 4 | « ÷ (−3) garde le sens » | M3 SignFlipLine, boss e5 | −2 lands to the right of −5 |
| 5 | « (x + 1)(x − 1) = 3 ⇒ x + 1 = 3 » | M4 step 4, boss e8 | the rule holds only for 0 |
| 6 | « x² = 9 ⇒ x = 3 » | M4 step 5 | (x − 3)(x + 3) = 0 |
| 7 | « la valeur interdite est une solution » | M5, boss e9 | the hole at −1 on the scanner |
| 8 | a solution without sense (x = −2 cm) | M6 step 4 | interpret before concluding |

## 3. Signature interaction — « Le scanner de solutions » (`SolutionScanner`)

Controlled variable x (handle, keyboard, stepper). State x only; L, R constants; bars (DOM tracks scaled by `scaleMax` over the range), relation badge, root point and lit region derived (`evalLin`, `solveLinearEq`, `solveLinearIneq`). Aha: equality at x = 4 only; the whole [0 ; 4[ lights for A < B; parallel plans never meet. Rejected candidates: the 3e balance (already the signature of équations-produit 3e; kept for M2 as `EquationSteps` lines rather than pans), a table of values (no continuity), a graph with two lines (the graph is a later lesson's tool).

`ProductScanner` reuses the scanner shape for a product (M4) and a quotient with its forbidden value (M5).

## 4. Module architecture (8 · 85 min)

| # | Slug | Stage | LPs | min | Responsibility | Interaction |
|---|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | réduire, développer, tester, ordre, intervalle | kit |
| 1 | le-scanner-de-solutions | trigger | P1 P4 P7 | 9 | one/none/infinitely many solutions; verify by substitution | `SolutionScanner`, `PredictionChips` |
| 2 | isoler-x-sans-casser-legalite | discovery | P2 P7 | 11 | both-sides operations, the one-sided trap, exact fraction | `EquationSteps` (3 tasks, escape after 5 ops) |
| 3 | le-signe-qui-se-retourne | discovery | P3 P4 | 11 | × négatif retourne; solve −3x + 4 ≤ 10; represent | `SignFlipLine`, `EquationSteps ineq` |
| 4 | produit-nul | manipulation | P5 P7 | 11 | scan, rule, branches, the « = 3 » trap, x² = 9 | `ProductScanner` |
| 5 | quotient-et-valeur-interdite | formalization | P6 P7 P2 P5 | 10 | hole and zero; double zero; À retenir card | `ProductScanner quotient` |
| 6 | modeliser | practice_lab | P7 P2 P3 | 14 | rectangle, budget, poursuite, interpréter | kit |
| 7 | mission-finale-les-deux-forfaits | evaluation | — | 15 | 10 QCM | kit `BossFinal` |

## 5. Model — `components/eqUtils.js` (17 tests)

Linear forms, `solveLinearEq` (exact fractions), `solveLinearIneq` (sign flip), `applyBothSides`/`applyOneSide`, `sameSolutions` (numeric tolerance — a ÷ 3 leaves 2,333333333, found by e2e), `isSolvedForm`, `checkSolution`, products (`productZeros`), quotients (`forbiddenValues`, `quotientSolutions`), `notation`.

## 6. Tests

E2E `2nde-equations-inequations.mjs` (51 checks): scanner sweeps audited, one-sided trap, reveal path, sign flips, product/quotient scans, wrong-on-purpose everywhere, boss flow, mobile M1.

## Shipped state (2026-09-05)

`available`, validator 7/7, zero errors from this lesson, e2e 51/51, duration 85 = module sum.
