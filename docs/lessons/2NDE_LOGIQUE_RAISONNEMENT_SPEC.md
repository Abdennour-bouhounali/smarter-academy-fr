# 2nde — Logique et raisonnement — Design & Implementation Spec

> Built 2026-09-05. Sections follow LESSON_DESIGN_PLAYBOOK §15.3; shipped state at the end.

## 1. Identity & curriculum contract

- Key `seconde_logique_et_raisonnement` · id `logique-et-raisonnement-2nde` · 🧠 · Difficile · free · 65 min.
- LPs: P1 proposition · P2 connecteurs · P3 implication · P4 équivalence · P5 contre-exemple · P6 contradiction.
- Prerequisites: Ensembles, Calcul littéral.

## 2. Central idea & misconceptions

**Central idea:** a proposition is true or false, and the asymmetry is everything — no number of examples proves a universal claim, while ONE counterexample destroys it. Module 1 makes that happen with Euler's n² + n + 41: prime for n = 0…39, and 41 × 41 at n = 40.

| # | Misconception | Confronted | Consequence |
|---|---|---|---|
| 1 | « beaucoup d'exemples valent une preuve » | M1 lab, M5, boss e2 | the table falls at n = 40 |
| 2 | « OU exclut le cas des deux » | M2 filter, boss e3 | 8 passes « pair OU > 5 » with both lamps on |
| 3 | negation of a strict inequality | M2 step 2, boss e4 | 5 must satisfy « non (n > 5) » |
| 4 | « si P ⇒ Q alors Q ⇒ P » | M3 both directions, boss e5 | the forbidden box fills with 2, 6, 10 |
| 5 | contraposée confused with réciproque | M3 batch, boss e6 | « non Q ⇒ non P » vs « Q ⇒ P » |
| 6 | « x² = 9 ⇒ x = 3 » | M4, boss e7 | the counterexample −3 |
| 7 | « il existe » treated like « pour tout » | M5 step 2 | one example proves an existence claim |
| 8 | absurd confused with a counterexample | M6, boss e10 | supposing the contrary, then the clash |

## 3. Signature interaction — « La formule qui tombe » (`ConjectureLab`)

Controlled variable: n (next, jumps 10/20/39/40/41, free input). State `tested[]`; primality and factorisation derived (`isPrime`, `smallestFactorization`) — never written by hand, so the fall at 40 is produced by the mathematics. Aha: the streak counter climbs to 40 and then the row turns red with 41 × 41. Rejected candidates: a truth-table drill (formal before meaningful), a text about proofs (no phenomenon), a quiz on « is this a proposition » (kept as the step-2 follow-up).

Secondary labs: `FilterLab` (two properties, four connectors, both lamps always visible), `ImplicationLab` (the four TT/TF/FT/FF boxes, the TF box turning red when filled, direction switch for the converse), `PigeonLab` (13 pupils, 12 months).

## 4. Module architecture (8 · 65 min)

| # | Slug | Stage | LPs | min | Responsibility | Interaction |
|---|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | sets, literal calculus, ±3 | kit |
| 1 | la-formule-qui-tombe | trigger | P1 P5 | 9 | proposition, counterexample, refute vs prove | `ConjectureLab` |
| 2 | et-ou-non | discovery | P2 P1 | 10 | ET/OU inclusive/NON, negation incl. limits | `FilterLab` |
| 3 | implication-et-reciproque | discovery | P3 P5 | 11 | the single forbidden case, converse, contrapositive | `ImplicationLab` |
| 4 | equivalence | manipulation | P4 P3 | 10 | both senses; x² = 9 repaired | `ImplicationLab` |
| 5 | a-retenir | formalization | P1 P2 P3 P4 | 8 | the card; ∀ vs ∃; necessary/sufficient | kit |
| 6 | labsurde | practice_lab | P6 P5 | 8 | pigeonhole, proof order, cases | `PigeonLab`, `ProofOrder` |
| 7 | mission-finale-le-tribunal | evaluation | — | 15 | 10 QCM | kit `BossFinal` |

## 5. Model — `components/logicUtils.js` (7 tests)

`isPrime`, `smallestFactorization`, `euler`; `prop`/`and`/`or`/`not`; `caseOf`, `counterexample`, `implies`, `equivalence`, `universalCounterexample`, `range`; `pigeonhole`, `consecutiveProduct`. The unit test walks n = 0…39 to pin the 40-in-a-row property and the fall at 40 and 41.

## 6. Tests

E2E `2nde-logique.mjs` (50 checks): the streak and the fall, connector filters, both implication directions on two couples, the broken and repaired equivalence, the pigeonhole forcing, proof ordering, boss flow, mobile M1.

## Shipped state (2026-09-05)

`available`, validator 6/6, zero errors from this lesson, e2e 50/50, duration 65 = module sum.
