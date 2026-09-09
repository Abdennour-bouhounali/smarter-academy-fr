# 2nde — Séries regroupées en classes — Design & Implementation Spec

> Rétro-documenté depuis le code le 2026-09-09 (la leçon existait sans spec). Sections selon LESSON_DESIGN_PLAYBOOK §15.3.

## 1. Identity & curriculum contract
- Key `seconde_series_regroupees_classes` · id `series-regroupees-classes-2nde` · domain `statistiques_probabilites` · 📊 · Difficile · **80 min**.
- Route `/courses/lycee/seconde/statistiques_probabilites/series-regroupees-classes-2nde`. LPs `seconde_series-regroupees-classes-2nde_P1…P10`.
- Specificity : en Seconde, les séries continues regroupées en classes sont représentées par un histogramme et un polygone des fréquences cumulées, avec estimation de la moyenne et de la médiane.
- Neighbours NOT repeated : indicateurs sur série discrète — définitions de la moyenne, médiane, quartiles, écart type (leçon « Statistiques à une variable ») ; boîte à moustaches (leçon « Boîtes à moustaches ») ; densité de probabilité et lois continues (programme de première et terminale). Dans la chaîne du chapitre (proportions → évolutions → stats 1 variable → séries en classes → boîtes → tableaux croisés → fréquences conditionnelles → LGN → probas conditionnelles → arbres → tests diagnostiques), elle prend le relais de « Statistiques à une variable » pour le cas continu regroupé, avant que « Boîtes à moustaches » ne resynthétise visuellement les indicateurs.

## 2. Central idea & misconceptions
Regrouper une série continue en classes la rend lisible mais rend ses indicateurs ESTIMÉS, pas exacts ; dans un histogramme c'est l'AIRE — pas la hauteur — qui porte l'effectif dès que les amplitudes diffèrent ; et tout ce qui descend sous la classe (valeur la plus fréquente, présence d'une valeur, médiane au centième) est perdu par le regroupement.

| # | Misconception | Confronted |
|---|---|---|
| 1 | Une variable continue mesurée finement pourrait garder un tableau d'effectifs classique | M1 step 2, boss sr-e1 |
| 2 | Le regroupement garde le détail individuel / le centre de classe est la vraie moyenne de la classe | M1 step 3, M4 step 1 |
| 3 | Hauteur de barre = effectif, quelle que soit l'amplitude (densité vs effectif) | M2 step 4, M6 step 2, boss sr-e3 |
| 4 | L'effectif d'une seule classe répond à une question de cumul (« en dessous de X ») | M2 step 2, M3 step 1, M6 step 1, boss sr-e4 |
| 5 | Une fréquence cumulée est lue comme un effectif, ou « en dessous de » est inversé en « au-dessus de » | M3 step 4, boss sr-e5 |
| 6 | Le polygone cumulé pourrait redescendre, ou sa hauteur en un point donnerait l'effectif d'une seule classe | M3 step 3 |
| 7 | Moyenne des centres de classe non pondérée par les effectifs | M4 step 2, boss sr-e6 |
| 8 | La moyenne/médiane estimée est toujours exacte ou toujours biaisée dans un sens | M4 step 3, M5 step 3, boss sr-e7 |
| 9 | La classe médiane est celle la plus proche de 50 %, pas la première qui FRANCHIT 50 % | M5 step 1, boss sr-e8 |
| 10 | La médiane interpolée est confondue avec le centre de sa classe | M5 step 2, boss sr-e9 |
| 11 | Affirmer une valeur exacte (mode, absence d'une valeur, médiane au centième) à partir de données seulement regroupées | M6 step 3, boss sr-e10 |

## 3. Signature interaction — « Deux cents recharges » (`ClassWidthLab`)
200 durées de recharge (toutes distinctes, générées par un RNG à graine fixe) tracées comme un nuage de points sous un histogramme. L'élève règle l'AMPLITUDE des classes via un curseur (`input range`) qui saute entre 5 valeurs prédéfinies [2, 5, 10, 20, 40] — pas un glissement continu ; c'est la largeur des tranches, seule vraie variable de décision du statisticien ici. À chaque changement, les barres se recomposent en direct (`groupIntoClasses`) : à 2 min, un peigne de 40 tranches presque vides ; à 40 min, deux barres et la forme a disparu ; vers 10 min, une distribution unimodale apparaît. Les 200 points bruts restent fixes sous les barres quelle que soit l'amplitude — preuve visuelle que le regroupement RANGE les données sans les changer. La validation de l'étape exige d'avoir vu au moins une amplitude ≤ 2 ET une amplitude ≥ 40 (les deux extrêmes explorés, pas seulement une bonne valeur), avant que les briques de connaissance n'apparaissent. Jamais figé après validation (le curseur reste actif, l'élève est explicitement invité à « continuer à le régler »).

## 4. Module architecture (8 · 80 min)
| # | Slug | Stage | LPs | min | Interaction |
|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | kit (diagnostic) |
| 1 | deux-cents-recharges | trigger | P1 P2 | 12 | `ClassWidthLab` |
| 2 | du-tableau-a-l-histogramme | discovery | P3 P4 | 12 | `ClassWidthLab` (table+histogramme, amplitudes fixées) + `Histogram` partagé |
| 3 | les-frequences-cumulees | discovery | P5 P10 | 13 | `Histogram` partagé (polygone cumulé) |
| 4 | estimer-la-moyenne | manipulation | P6 P7 | 12 | inline (table + `NumericQuestion`, sans visuel dédié) |
| 5 | la-classe-mediane | manipulation | P8 P9 | 12 | `Histogram` partagé (cumul, interpolation) |
| 6 | atelier-lire-une-distribution | practice_lab | P4 P10 P3 | 10 | `Histogram` partagé, situations (salaires, tailles, attente) |
| 7 | mission-finale-la-borne | evaluation | — | 5 | `BossFinal` |

Knowledge Map: M1 3 · M2 2 · M3 2 · M4 2 · M5 2 · M6 1 = 12 items.

Note composants : seul `ClassWidthLab.jsx` est propre à cette leçon (dossier `components/`), utilisé par M1 (manipulation signature) et M2 (table/histogramme à amplitudes fixes). Les modules 3, 5 et 6 s'appuient sur `Histogram`, un composant PARTAGÉ (`common/stats/Histogram.jsx`, affichage statique avec cumul/lecture), et sur des `TapQuestion`/`NumericQuestion`/`BatchChoiceQuestion` inline. Le module 4 n'a aucun visuel dédié : c'est un tableau et des `NumericQuestion` inline sur `groupIntoClasses`/`classMean`. Tous ces modules ont `manipulations: []` dans le référentiel — aucun n'a de composant manipulable en propre au-delà de M1/M2.

## 5. Mathematical model — `data.js` + shared `common/stats/statsUtils.js`
`data.js` (58 lignes) génère et expose : `RECHARGES` (200 valeurs, produites par `buildRecharges()` via un RNG à graine fixe `makeRng(20260906)`, combinant une cloche `(rng()+rng())/2` et une queue exponentielle à droite, rejetées hors [10;90[, dédupliquées à 2 décimales — reproductible, jamais aléatoire à l'exécution) ; `BORNES_10` (les 9 bornes à amplitude 10 min utilisées après M1) ; `AMPLITUDES` (les 5 presets `[2,5,10,20,40]` du laboratoire) ; `SALAIRES` (`{bornes, effectifs}`, classes d'amplitudes INÉGALES — la dernière 4× plus large — pour le piège densité/effectif de M2 step 4 et M6 step 2).

Le modèle mathématique vient du module partagé `common/stats/statsUtils.js` : `groupIntoClasses(values, bounds)` (construit les classes `[from,to[`, calcule `count`, `center`, `width`, `frequency`, `cumulativeCount`, `cumulativeFrequency` et `density = count/width` — garantit que c'est l'aire, pas la hauteur, qui porte l'effectif), `classMean(classes)` (moyenne estimée via les centres pondérés par les effectifs), `medianClass(classes)` (première classe dont la fréquence cumulée atteint 50 %), `interpolatedMedian(classes)` (interpolation linéaire dans la classe médiane), plus `mean`, `median`, `sum`, `formatNumber`, `formatClass`.

Tests : `data.test.js` — 18 cas, en 4 blocs `describe` : la série des 200 recharges (bornes, reproductibilité, quasi-toutes-distinctes, asymétrie à droite moyenne > médiane) ; le regroupement en classes d'amplitude 10 (effectifs exacts `[4,39,55,64,17,13,7,1]` et cumuls `[4,43,98,162,179,192,199,200]` cités dans les modules, moyenne/médiane/classMean/medianClass/interpolatedMedian exacts, ex. `classMean ≈ 41,15`, `interpolatedMedian ≈ 40,31`) ; l'amplitude du découpage (cas trop fin, trop large, total préservé) ; les salaires à amplitudes inégales (dernière classe 4× plus large, classe la plus peuplée ≠ classe la plus large, et en densité la dernière classe est la PLUS BASSE — le piège de l'atelier). Le fichier se présente lui-même comme un test de non-régression des valeurs citées dans les énoncés.

## 6. Validation
`validate:lessons` 10/10 LP couverts ; vitest `data.test.js` 18/18 ; e2e : aucune suite (aucun fichier dans `apps/web/e2e/lesson-kit/` ne mentionne `series-regroupees-classes-2nde`, vérifié par grep).
