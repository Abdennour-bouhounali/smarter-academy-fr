# 2nde — Valeur absolue et distance — Design & Implementation Spec

> Built 2026-09-05. Sections follow LESSON_DESIGN_PLAYBOOK §15.3; shipped state at the end.

## 1. Identity & curriculum contract

- Key `seconde_valeur_absolue_et_distance` · id `valeur-absolue-distance-2nde` (kept from the provisional catalogue; MySQL rows carry this code) · 📏 · Difficile · free · 59 min.
- LPs: P1 |x| = distance à 0 · P2 calculer |x| · P3 distance entre deux réels · P4 situations · P5 distance ↔ valeur absolue ↔ intervalles.
- Prerequisites: Nombres réels, Ensembles et intervalles (the two 2nde lessons named by the curriculum data).

## 2. Central idea & misconceptions

**Central idea:** |x| is a LENGTH on the line (distance to 0), shared by x and −x; |b − a| is the distance between a and b whatever the order; « |x − a| ≤ r » is a symmetric beam centred at a, i.e. the interval [a − r ; a + r].

| # | Misconception | Confronted | Consequence |
|---|---|---|---|
| 1 | « −4 est plus loin que 4 » / « la distance de −5 est −5 » | M1 prediction (no verdict), boss e1 | same green bar at −4 and 4 |
| 2 | « |−3| = −3 », « −x est négatif » | M2 machine, boss e2/e3 | rule 2 lights: −x = −(−3) = 3 |
| 3 | distance = 5 − 3 = 2 (sign dropped) | M3, boss e4 | |5 − (−3)| = 8 read on the bar |
| 4 | one side only: |x − 3| ≤ 2 ⇔ x ≤ 5 | M4 scan, boss e6 | beam symmetric around 3 |
| 5 | centre = left bound; |x + 2| centred at 2 | M4 step 2, M5, boss e7 | centre = milieu, rayon = demi-longueur |
| 6 | ≤ vs < on the edge | M4 step 3 | x = 5 « dans le noir » once strict |
| 7 | |x − a| = r has one solution | M5/M6, boss e10 | the two edges |

## 3. Signature interaction — « Deux bateaux, une distance » (`DistanceLine`, then `BeamLine`)

Controlled variable: the boat's position x (handle + stepper, keyboard). State: x, the set of positions visited, the positions where the bar measures 5. Visual: the emerald distance band between the lighthouse (0) and x with its length written on it; a hollow twin at −x in step 3. Aha: −5 and 5 give the same bar; two positions at 5 km. |x| appears in step 4 as the name of the bar. Rejected candidates: a table of |x| values (no length), a thermometer (a single side), a numeric slider printing |x| (proxy, no bar).

The beam lab (M4) reuses the same line with a centre, a radius, a strict toggle and a test boat coloured green/red by `satisfies`.

## 4. Module architecture (8 · 59 min)

| # | Slug | Stage | LPs | min | Responsibility | Interaction |
|---|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | opposé, lecture, relatifs, intervalles | kit (+ inline `RealLine`) |
| 1 | deux-bateaux-une-distance | trigger | P1 | 8 | the bar; two positions at 5 km; |x| named last | `DistanceLine`, `Stepper`, `PredictionChips` |
| 2 | calculer-une-valeur-absolue | discovery | P2 P1 | 7 | two rules, −x positive, batch of traps | `AbsMachine` |
| 3 | la-distance-entre-deux-nombres | discovery | P3 | 8 | |b − a| = |a − b|, translation invariance | `DistanceLine` two handles |
| 4 | le-faisceau | manipulation | P5 P4 | 9 | beam ⇔ interval; centre/rayon from [−1 ; 7]; strict edge | `BeamLine`, `BuildCheck` |
| 5 | a-retenir | formalization | P1 P2 P3 P5 | 6 | the four formulas; |x + 2| trap | kit |
| 6 | situations | practice_lab | P4 P5 | 8 | vis ± 0,5, vaccin, randonneur, deux positions | kit + static `RealLine` |
| 7 | mission-finale-le-phare | evaluation | — | 15 | 10 QCM | kit `BossFinal` |

## 5. Model — `components/absUtils.js` (7 tests)

`abs`, `distance`, `absText`, `solveAbsEquation`, `absInequalitySet`, `centerRadius`, `notation`, `satisfies`.

## 6. Tests

E2E `2nde-valeur-absolue.mjs` (41 checks): handle sweeps with the CTM-aware layout audit, wrong-on-purpose paths, `BuildCheck` cap, boss flow, mobile M4 pass.

## Shipped state (2026-09-05)

`available`, validator 5/5, zero errors from this lesson, e2e 41/41, duration 65 = module sum.
