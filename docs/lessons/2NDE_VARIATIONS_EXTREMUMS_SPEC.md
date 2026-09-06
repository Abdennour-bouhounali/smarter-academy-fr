# 2nde — Variations et extremums — Design & Implementation Spec

> Built 2026-09-06. Sections follow LESSON_DESIGN_PLAYBOOK §15.3.

## 1. Identity & curriculum contract
- Key `seconde_variations_et_extremums` · id `variations-extremums-2nde` · domain `fonctions` · 📊 · Difficile · **85 min**.
- Route `/courses/lycee/seconde/fonctions/variations-extremums-2nde`. LPs `seconde_variations-extremums-2nde_P1…P12`.
- Specificity: croissance, décroissance, monotonie, extremums définis par inégalités, tableau de variations, sans dérivée.

## 2. Central idea & misconceptions
Quand x augmente, f(x) monte ou descend — sur un intervalle ; a < b ⟹ f(a) ≤ f(b) ; le tableau résume la courbe ; un maximum est une valeur atteinte, distincte de l'endroit, dépendante de l'intervalle, parfois au bord.

| # | Misconception | Confronted |
|---|---|---|
| 1 | « le minimum est forcément dans un creux » | M1 step 3, M4 step 3, boss e8 |
| 2 | « décroissante » = « négative » | M1 step 4, boss e1 |
| 3 | conclure sur f(a), f(b) hors d'un intervalle de monotonie | M2 step 3, M5, boss e3 |
| 4 | valeur du maximum / abscisse où il est atteint | M4 step 2, boss e7/e10 |
| 5 | abscisses et images échangées dans un tableau | M3 step 3, boss e5/e6 |

## 3. Signature interaction — « Le randonneur » (`TrailLab`)
Un profil de sentier (altitude selon la distance, 4 tronçons) ; le randonneur avance (guide, ±, clavier) ; l'altimètre lit h(x) ; la piste se peint verte/rose sous ses pas ; sommets et vallées se marquent ; « plus haut / plus bas atteints » en DOM. Prédiction sans verdict (« où est le sommet ? »). Aha : le plus bas est au départ. Rejetés : deux points à comparer d'emblée (M2), une flèche à choisir sur un tableau (M3), un curseur sans trace.

## 4. Module architecture (8 · 85 min)
| # | Slug | Stage | LPs | min | Interaction |
|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | kit |
| 1 | le-randonneur | trigger | P1 P2 P4 | 10 | `TrailLab` |
| 2 | croissante-decroissante | discovery | P1 P2 P3 P11 | 11 | `TwoProbes` (montée, descente, à cheval) |
| 3 | le-tableau-de-variations | discovery | P5 P6 P10 | 10 | `VariationTable` éditable, mini-courbes |
| 4 | maximum-minimum | manipulation | P7 P8 P9 | 12 | `IntervalLab` |
| 5 | comparer-sans-calculer | manipulation | P11 P6 P3 | 10 | tableau seul |
| 6 | atelier-optimiser | practice_lab | P12 P7 P8 P5 P10 P4 | 13 | enclos, coût |
| 7 | mission-finale-le-sommet | evaluation | — | 15 | `BossFinal` |

Knowledge Map: M1 3 · M2 3 · M3 3 · M4 3 · M5 2 · M6 1 = 15 items.

## 5. Mathematical model — `components/variationsUtils.js`
Fonction = `{ fn, domain, turns (exacts) }` ; `variationOn`, `variationTable`, `monotonyIntervals`, `extremumOn` (abscisses triées, atteint plusieurs fois), `compareByTable` ('indetermine'), `compareImages`, `curvePieces`. Le sentier est un raccord de demi-cosinus entre nœuds ; h(4) = h(8,5) = 560 (maximum sur [4 ; 10] atteint deux fois — testé). Tests : 8.

## 6. Validation
`validate:lessons` 12/12 ; vitest 8/8 ; e2e `2nde-variations.mjs` (vite :5241).
