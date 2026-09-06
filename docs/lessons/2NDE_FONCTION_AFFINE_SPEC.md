# 2nde — Fonction affine — Design & Implementation Spec

> Built 2026-09-06. Sections follow LESSON_DESIGN_PLAYBOOK §15.3.

## 1. Identity & curriculum contract
- Key `seconde_fonction_affine` · id `fonction-affine-2nde` · domain `fonctions` · 📈 · Difficile · **75 min**.
- Route `/courses/lycee/seconde/fonctions/fonction-affine-2nde`. LPs `seconde_fonction-affine-2nde_P1…P11`.
- Specificity: coefficient directeur comme taux d'accroissement, signe de a / variations, signe de la fonction, lecture graphique complète.
- Neighbours NOT repeated: équations de droites (m tourne, p glisse, cartésienne), tableau de signes général, systèmes.

## 2. Central idea & misconceptions
a est un TAUX (ce que f gagne par unité de x, le même partout), b la valeur de départ f(0) ; le signe de a décide du sens de variation ; deux données donnent a puis b ; les inéquations retournent leur sens quand a < 0.

| # | Misconception | Confronted |
|---|---|---|
| 1 | a et b échangés | M1 step 4, boss e2 |
| 2 | taux inversé / différence seule | M2 step 4, M4 step 1, boss e3 |
| 3 | « b négatif ⇒ décroissante » | M3 step 2, boss e5 |
| 4 | b = f(1) | M4 step 2, boss e7 |
| 5 | sens de l'inéquation non retourné | M5 step 4, M6 step 3, boss e10 |

## 3. Signature interaction — « Le réservoir » (`TankLab`)
Cuve de 40 L, robinet de débit a (± ; négatif = on vide), volume initial b, horloge t. Cuve (formes SVG), expression via `formatAffine` (core), droite avec escalier +1 → +a et point (0 ; b), tableau minute par minute (+a). Un bouton à la fois : t, puis b (la droite glisse), puis a (elle pivote autour de (0 ; b), a < 0 vide, a = 0 stagne). Rejetés : le taxi (3e), `AffineExplorer` tel quel (pas de situation), deux points à relier.

## 4. Module architecture (8 · 75 min)
| # | Slug | Stage | LPs | min | Interaction |
|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | kit |
| 1 | le-reservoir | trigger | P1 P2 P3 | 10 | `TankLab` |
| 2 | le-taux-d-accroissement | discovery | P4 P1 P7 | 9 | `RateProbes` (affine puis non affine), tables |
| 3 | croissante-ou-decroissante | discovery | P5 P2 P8 | 8 | `TankLab` (a bascule) |
| 4 | retrouver-la-fonction | manipulation | P6 P7 P8 | 10 | deux points, escalier, axe |
| 5 | signe-equations-inequations | manipulation | P9 P10 P11 | 10 | réservoir qui se vide |
| 6 | atelier-modeliser | practice_lab | P6 P4 P5 P9 P10 P11 P1 | 9 | abonnement, téléphérique, bougie |
| 7 | mission-finale-le-robinet | evaluation | — | 15 | `BossFinal` |

Knowledge Map: M1 3 · M2 3 · M3 2 · M4 2 · M5 3 · M6 1 = 14 items.

## 5. Mathematical model — `components/affineUtils.js`
`affine(a, b)`, `imageOf`, `rate`, `fromTwoPoints`, `isAffineTable`, `zeroOf`, `variationOf`, `signTable`, `solveEq`, `solveIneq` (sens inversé si a < 0), `affineTex` via `formatAffine` (core). Tests : 5.

## 6. Validation
`validate:lessons` 11/11 ; vitest 5/5 ; e2e `2nde-fonction-affine.mjs` (vite :5241).
