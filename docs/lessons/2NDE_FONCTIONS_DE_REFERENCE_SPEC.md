# 2nde — Fonctions de référence — Design & Implementation Spec

> Built 2026-09-06. Sections follow LESSON_DESIGN_PLAYBOOK §15.3.

## 1. Identity & curriculum contract
- Key `seconde_fonctions_de_reference` · id `fonctions-de-reference-2nde` · domain `fonctions` · 📈 · Difficile · **80 min** (= module sum).
- Route `/courses/lycee/seconde/fonctions/fonctions-de-reference-2nde`. LPs `seconde_fonctions-de-reference-2nde_P1…P11`.
- Diagnostic: image, lecture de courbe, |−3|, (−4)², inverse de 0,5.
- Specificity: carré, inverse, valeur absolue — expressions, tableaux, courbes, images mentales, sans dérivation.

## 2. Central idea & misconceptions
Trois machines, trois caractères : parabole, hyperbole, V. Symétrie, signe, sens de variation (au sens « la courbe monte/descend »), comportement près de 0 / loin de 0, points caractéristiques ; l'ordre x² < |x| < 1/x sur ]0 ; 1[ et son inverse au-delà de 1.

| # | Misconception | Confronted |
|---|---|---|
| 1 | 1/0 = 0 ; (−3)² = −9 ; |−3| = −3 | M1 (machines), boss e1 |
| 2 | « le plus grand a le plus grand carré » | M2 step 2 (a = −3 < b = −2), boss e3 |
| 3 | « 1/x est décroissante sur ℝ* » | M3 step 3 (a < 0 < b), boss e5 |
| 4 | « x² est toujours au-dessus de |x| » | M4 step 2, boss e9 |
| 5 | « x² = 4 a une solution » | M5 step 1, boss e8 |
| 6 | doubler v divise t par 4 | M6 step 2, boss e10 |

## 3. Signature interaction — « Trois machines, une sonde » (`ThreeMachines`)
Entrée x (pastilles −4…4, saisie libre) dans trois machines x², 1/x, |x| ; trois sorties DOM (« refusé » pour 1/0), trois points sur un repère commun, courbes tracées après six entrées. Aha : x et −x (même carré, même |x|, inverses opposés) ; 0,1 fait exploser 1/x, 100 fait exploser x². Candidats rejetés : trois graphes statiques à comparer, un slider sur un seul graphe, un tableau à remplir.

## 4. Module architecture (8 · 80 min)
| # | Slug | Stage | LPs | min | Interaction |
|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | kit |
| 1 | trois-machines | trigger | P4 P5 P6 | 10 | `ThreeMachines` |
| 2 | la-parabole | discovery | P2 P7 | 9 | `TwoProbes` (miroir, a < b) |
| 3 | l-hyperbole | discovery | P3 P7 | 10 | `TwoProbes` (vers 0, miroir central, à cheval) |
| 4 | le-v | discovery | P1 P7 P8 | 8 | `TwoProbes` + parabole en pointillés |
| 5 | lire-sur-les-courbes | manipulation | P9 P10 P8 P6 | 11 | `FunctionProbe` mode y |
| 6 | atelier-modeliser | practice_lab | P11 P5 P6 P8 P4 | 13 | kit + `ValueTable` |
| 7 | mission-finale-les-trois-courbes | evaluation | — | 15 | `BossFinal` |

Knowledge Map: M1 4 · M2 3 · M3 3 · M4 3 · M5 3 · M6 1 = 17 items.

## 5. Mathematical model — `components/referenceUtils.js`
SQUARE / INVERSE (ℝ*) / ABS ; `imageOf` (null hors domaine), `antecedentsOf` exacts, `curvePieces` (deux branches), `symmetryOf` ('axe'/'centre'), `variationOn`, `compareImages`, `orderAt`, `squareBelowAbs`. Tests : 6.

## 6. Validation
`validate:lessons` 11/11 ; vitest 6/6 ; e2e `2nde-fonctions-reference.mjs` (vite :5241).
