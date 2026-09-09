# 2nde — Loi des grands nombres — Design & Implementation Spec

> Rétro-documenté depuis le code le 2026-09-09 (la leçon existait sans spec). Sections selon LESSON_DESIGN_PLAYBOOK §15.3.

## 1. Identity & curriculum contract
- Key `seconde_loi_des_grands_nombres` · id `loi-grands-nombres-2nde` · domain `statistiques_probabilites` · 🎲 · **72 min**.
- Route `/courses/lycee/seconde/statistiques_probabilites/loi-grands-nombres-2nde`. LPs `seconde_loi-grands-nombres-2nde_P1…P9`.
- Specificity : « En Seconde, la simulation (Python ou tableur) permet d'observer la fluctuation puis la stabilisation des fréquences et de distinguer modèle probabiliste et situation réelle. » (`level_specificity`, objet officiel `loi_des_grands_nombres`).
- Neighbours NOT repeated : probabilités conditionnelles (P_A(B), tableaux croisés — leçon voisine), arbres pondérés, tests diagnostiques — cette leçon reste sur une seule expérience répétée, jamais deux expériences successives.

## 2. Central idea & misconceptions
La probabilité est une constante du modèle ; la fréquence observée fluctue d'une série à l'autre et se rapproche de la probabilité seulement quand n grandit — en écart relatif (fréquence), jamais en écart absolu (effectif), et sans qu'aucune « mémoire » du hasard ne vienne compenser une série passée.

| # | Misconception | Confronted |
|---|---|---|
| 1 | Loi des séries (le hasard « compense » une série passée) | M3 step 2, boss `lgn-e5` |
| 2 | Écart en effectif confondu avec écart en fréquence (le second grandit, on croit qu'il rétrécit) | M3 step 1, boss `lgn-e6` |
| 3 | La loi promettrait une égalité exacte (5 000 Pile pile) plutôt qu'une proximité probable | M3 step 3, boss `lgn-e4` |
| 4 | L'équiprobabilité prise pour un théorème plutôt qu'une hypothèse réfutable | M4 step 2, boss `lgn-e8` |
| 5 | `succes` (effectif) confondu avec la fréquence dans la lecture d'un script | M5 step 1, boss `lgn-e9` |
| 6 | Conclusion prématurée de truquage sur une petite série (46 %/55 % sur 100, ou 13/20) | M2 step 2, boss `lgn-e7` |

## 3. Signature interaction — « Lance, et regarde la fréquence bouger » (`SimulationLab`)
Le module 1 (trigger) fait choisir une expérience (pièce, dé à 6, dé pair, urne — `EXPERIMENTS` dans `data.js`) puis un palier de répétitions parmi 10 / 100 / 1 000 / 10 000 (`TRIAL_STEPS`, ×10 à chaque palier). Chaque clic relance un tirage Bernoulli via `makeRng(seed)` + `frequencyTrajectory`, et recalcule en direct : la fréquence observée, l'effectif de succès, la courbe de trajectoire (`FrequencyChart`) et un historique des 6 derniers lancers. L'étape n'est validée qu'après au moins une petite série (n ≤ 100) et une grande (n ≥ 1000), pour forcer la comparaison des deux régimes ; un bouton « ↻ Relancer » retire un nouveau tirage à taille égale, avec une graine différente, pour montrer que le résultat change à chaque fois.

## 4. Module architecture (7 · 72 min)
| # | Slug | Stage | LPs | min | Interaction |
|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | diag |
| 1 | lance-et-regarde | trigger | P1 P3 | 13 | `SimulationLab` |
| 2 | deux-series-jamais-pareilles | discovery | P2 P4 | 12 | `SimulationLab` (comparaison deux séries) |
| 3 | ce-que-la-loi-dit-vraiment | formalization | P5 P6 | 13 | `FluctuationBoard` (deux colonnes, écart fréquence vs effectif) |
| 4 | le-modele-est-il-bon | practice_lab | P7 P8 | 12 | `DiceDetector` (dé pipé parmi trois) |
| 5 | simuler-en-python | practice_lab | P9 P1 | 8 | listing Python + formule tableur (lecture, pas d'exécution) |
| 6 | mission-finale-le-grand-nombre | evaluation | — | 10 | `BossFinal` (10 épreuves) |

Aucun module n'a `stage: 'manipulation'` — la progression va directement de `trigger`/`discovery` à `formalization` puis deux `practice_lab` consécutifs (M4 et M5). Le module 4 s'auto-décrit « MANIPULATION » dans son commentaire de fichier, mais sa valeur `stage` réelle dans `lesson.config.js` est `practice_lab`.

Knowledge Map : M1 2 · M2 1 · M3 3 · M4 2 · M5 1 = 9 items.

## 5. Mathematical model — `data.js`
`EXPERIMENTS` (4 expériences : pièce p=1/2, dé-six p=1/6, dé-pair p=1/2, urne p=0,3), `experimentById(id)`, `TRIAL_STEPS` = `[10, 100, 1000, 10000]` (paliers ×10), `DICE_CANDIDATES` (3 dés pour le module 4, dont un pipé — poids `[0.15,0.15,0.15,0.15,0.15,0.25]` favorisant le 6 à 25 % contre 1/6 ≈ 16,7 % pour les deux dés équilibrés), `PYTHON_SCRIPT` (listing Python de simulation, 7 lignes), `SPREADSHEET_FORMULA` (`=NB.SI(A1:A10000 ; 6) / 10000`). Le module 5 ne contient aucun bac à sable exécutable : le script est affiché en `<pre><code>` et lu, pas lancé. Tests : 10, dont un bloc dédié au « phénomène central » (`meanGap(10000) < meanGap(10) / 10`, trajectoire qui finit près de p, deux graines → deux séries différentes, même graine → même série) et un test qui rend le dé pipé « détectable en longue série et ambigu en série courte » (`detectionRate(30) < 0.85`, `detectionRate(3000) > 0.95`).

## 6. Validation
`validate:lessons` 9/9 LP couverts ; vitest 10/10 ; e2e `apps/web/e2e/lesson-kit/2nde-loi-grands-nombres.mjs` (vite :5251).
