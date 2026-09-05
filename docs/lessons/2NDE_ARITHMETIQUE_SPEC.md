# 2nde — Arithmétique — Design & Implementation Spec

> Built 2026-09-05. Sections follow LESSON_DESIGN_PLAYBOOK §15.3; shipped state at the end.

## 1. Identity & curriculum contract

- Key `seconde_arithmetique` · id `arithmetique-2nde` · 🔢 · Difficile · free · 65 min.
- LPs: P1 multiples et diviseurs · P2 propriétés de divisibilité · P3 raisonner sur les entiers · P4 problèmes · P5 démonstration.
- Prerequisites: Nombres entiers, Calcul numérique.
- Distinct from the 3e lesson « Multiples et diviseurs » (rectangle detector, sieve, factor tree): here packs and remainders, criteria that are PROVED, literal parity, and written proof.

## 2. Central idea & misconceptions

**Central idea:** a multiple of p is a number that packs into groups of p with NO remainder. The remainders decide everything — the sum of two multiples is a multiple because both remainders are 0; two odds add to an even because their two lone tokens complete a pack. Writing 2k / 2k + 1 turns that observation into a proof.

| # | Misconception | Confronted | Consequence |
|---|---|---|---|
| 1 | « impair + impair = impair » | M1 packs (7 + 9, p = 2), boss e5 | the two lone tokens make one pack |
| 2 | direction multiple/diviseur | M1 step 3, boss e1 | 91 = 7 × 13 read both ways |
| 3 | « si a n'est pas multiple de p, a + b non plus » | M1 (12 + 20, p = 7) | remainders 5 + 6 = 11 → one pack, remainder 4 |
| 4 | « des exemples prouvent » | M2, M6 step 3, boss e9/e10 | 2k + 1 covers all odds; Euler's polynomial quoted |
| 5 | « divisible par 3 ⇔ dernier chiffre 3, 6, 9 » | M3, boss e3 | the split n = 9k + digit sum |
| 6 | « multiple de 3 ⇒ multiple de 9 » | M3 batch, boss e3 | 2 346, digit sum 15 |
| 7 | « le rendez-vous, c'est a × b » | M4, boss e7 | 12 and 18 meet at 36, not 216 |
| 8 | PGCD confused with PPCM | M4 step 2, boss e8 | the tile must DIVIDE both sides |

## 3. Signature interaction — « Les paquets et les restes » (`PackLab`)

Controlled variables: two heaps a and b, and the pack size p. State a, b, p; packs, lone tokens, the union line and every verdict derived (`divmod`, `addPacks`). Full packs are DOM tiles capped at 12 plus a « ×N » badge; lone tokens are round chips; no SVG text. Aha: two heaps without remainder give a sum without remainder; 7 + 9 at p = 2 completes a pack; 12 + 20 at p = 7 does not. Rejected candidates: a divisibility MCQ (no phenomenon), the 3e rectangle array (already shipped, and it shows divisors of one number, not the sum rule), a number line of multiples (kept as the module 4 rhythm line).

## 4. Module architecture (8 · 65 min)

| # | Slug | Stage | LPs | min | Responsibility | Interaction |
|---|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | tables, euclidean division, parity | kit |
| 1 | les-paquets-et-les-restes | trigger | P1 P3 | 9 | remainder decides; vocabulary at the end | `PackLab` |
| 2 | pair-impair-et-la-lettre | discovery | P3 P5 | 10 | 2k / 2k + 1; proof of the sum and the odd square | kit + shared `ValueTable` |
| 3 | les-criteres-demontres | discovery | P2 P5 | 10 | n = 9k + digit sum; n = 100k + last two | `DigitSplit` |
| 4 | multiples-communs | manipulation | P4 P1 | 10 | PPCM on a timeline; PGCD as the largest tile | `RhythmLine` |
| 5 | a-retenir | formalization | P1 P2 P3 | 7 | the rules card + three checks | kit |
| 6 | demontrer | practice_lab | P5 P3 P4 | 10 | order a proof, consecutive integers, a false proof | `ProofOrder` |
| 7 | mission-finale-latelier | evaluation | — | 15 | 10 QCM | kit `BossFinal` |

## 5. Model — `components/arithUtils.js` (7 tests)

`divmod`/`euclidText`, `packs`/`addPacks` (the union rule), `multiplesBetween`, `divisors`, `gcd`/`lcm`/`commonMultiples`, `parityForm`, `oddSquareForm`, `digitSum`, `nineSplit` (the proof of the 3/9 rule), `hundredSplit` (the rule for 4), `divisibleBy` with its reason string.

## 6. Tests

E2E `2nde-arithmetique.mjs` (45 checks) with a new shared helper `tapOption(page, scope, i)` that skips a step's PredictionChips group — chips and answers share the `aria-pressed` selector, so a bare nth() hit the prediction.

## Shipped state (2026-09-05)

`available`, validator 5/5, zero errors from this lesson, e2e 45/45, duration 65 = module sum.
