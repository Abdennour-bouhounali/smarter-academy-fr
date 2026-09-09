# 2nde — Statistiques à une variable — Design & Implementation Spec

> Rétro-documenté depuis le code le 2026-09-09 (la leçon existait sans spec). Sections selon LESSON_DESIGN_PLAYBOOK §15.3.

## 1. Identity & curriculum contract
- Key `seconde_statistiques_une_variable` · id `statistiques-une-variable-2nde` · domain `statistiques_probabilites` · 📊 · Difficile · **86 min**.
- Route `/courses/lycee/seconde/statistiques_probabilites/statistiques-une-variable-2nde`. LPs `seconde_statistiques-une-variable-2nde_P1…P12`.
- Specificity : en Seconde, les indicateurs de position (moyenne, médiane, quartiles) sont complétés par l'écart type comme indicateur de dispersion, et l'on étudie l'effet d'une modification de la série.
- Neighbours NOT repeated : regroupement en classes, histogramme, fréquences cumulées (leçon « Séries regroupées en classes ») ; tracé et lecture d'une boîte à moustaches (leçon « Boîtes à moustaches ») ; variables croisées et fréquences conditionnelles (leçons « Tableaux croisés » et « Fréquences conditionnelles »). Dans la chaîne du chapitre (proportions → évolutions → stats 1 variable → séries en classes → boîtes → tableaux croisés → fréquences conditionnelles → LGN → probas conditionnelles → arbres → tests diagnostiques), elle installe les indicateurs sur série discrète — classes, boîtes et croisements viennent après.

## 2. Central idea & misconceptions
Un seul nombre ne résume jamais complètement une série — deux séries de même moyenne peuvent avoir des allures opposées ; la médiane compte les individus quand la moyenne additionne les valeurs, et l'écart type mesure toujours la dispersion, jamais la position.

| # | Misconception | Confronted |
|---|---|---|
| 1 | Une valeur unique, même atypique, résume la classe | M1 step 2 |
| 2 | Une même moyenne implique une même distribution / la moyenne seule suffit | M1 step 4, boss st-e10, M6 step 1 |
| 3 | Calculer la moyenne des valeurs distinctes sans pondérer par les effectifs | M2 step 2, boss st-e2 |
| 4 | Un quartile est un effectif ou une fraction de la valeur maximale, pas un seuil de position | M3 step 1, boss st-e4 |
| 5 | Le rang d'un quartile s'arrondit à l'entier inférieur, ou reste non entier | M3 step 2 |
| 6 | L'écart type est confondu avec la variance (racine oubliée) | M4 step 3, boss st-e7 |
| 7 | Un écart type plus grand signifierait plus de précision/fiabilité | M4 step 4, boss st-e8 |
| 8 | Après retrait/ajout d'une valeur, la médiane bougerait autant que la moyenne, ou serait toujours supérieure à la moyenne | M5 step 3-4, boss st-e9, st-e10 |

## 3. Signature interaction — « Les temps de trajet » (`SeriesLab`)
Axe SVG où chaque élève est une pastille ; l'élève SAISIT une pastille et la fait glisser le long de l'axe (pointer capture, clavier ↔ flèches accessibles) — le geste est le changement de la donnée, jamais un +/− stepper. Étape 1 exige un aller-retour complet : pousser une valeur au-delà de 55 min PUIS la ramener sous 45 min (pas un simple déplacement dans un sens), pour montrer que la moyenne suit dans les deux sens. `mean(values)` et `median(values)` (du module partagé `common/stats`) se recalculent à chaque frame de glissement et s'affichent en repères SVG au-dessus du nuage de points, plus en texte (`formatNumber`, 2 décimales pour la moyenne, 1 pour la médiane). Le composant est réutilisé de module en module avec un prop `show` qui révèle progressivement plus d'indicateurs (M1 : moyenne+médiane ; M3 ajoute une bande de quartiles ; M4 ajoute une bande d'écart type qui se resserre visiblement quand on rapproche les points ; M5/M6 superposent une seconde série en lecture seule via `compareValues`). Jamais figé après validation de l'étape (règle générale du projet, énoncée dans le commentaire du composant).

## 4. Module architecture (8 · 86 min)
| # | Slug | Stage | LPs | min | Interaction |
|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 5 | kit (diagnostic) |
| 1 | les-temps-de-trajet | trigger | P1 P2 P4 | 12 | `SeriesLab` |
| 2 | moyenne-et-mediane | discovery | P2 P4 P6 | 12 | `SeriesLab` (lecture seule) |
| 3 | les-quartiles | discovery | P5 P9 | 12 | `SeriesLab` (bande quartiles) |
| 4 | l-ecart-type | discovery | P7 P8 | 12 | `SeriesLab` (bande écart type) |
| 5 | ajouter-ou-retirer-une-valeur | manipulation | P10 P11 P3 | 12 | `SeriesLab` (perturbation) |
| 6 | atelier-comparer-deux-series | practice_lab | P12 P6 P9 P1 | 11 | `SeriesLab` (comparaison) |
| 7 | mission-finale-resumer-une-serie | evaluation | — | 10 | `BossFinal` |

Knowledge Map: M1 2 · M2 3 · M3 2 · M4 2 · M5 2 · M6 1 = 12 items.

## 5. Mathematical model — shared `common/stats/statsUtils.js` + `data.js`
`data.js` (25 lignes) expose des JEUX DE DONNÉES fixes, pas de fonctions : `TRAJETS_A` (20 valeurs, série de référence), `TRAJETS_B` (même moyenne que A, dispersion resserrée), `ELEVE_LOINTAIN` (constante 120, l'outlier du module 5), `ATELIER_X`/`ATELIER_Y` (10 valeurs chacune, même médiane, dispersions opposées, module 6). Le modèle mathématique proprement dit vient du module partagé `common/stats/statsUtils.js` : `mean`, `median` (convention française : rang (n+1)/2 impair, demi-somme des deux rangs centraux si pair), `quartile`/`q1`/`q3` (rang ⌈kn/4⌉, valeur réelle de la série, jamais interpolée — convention du bac français, différente de la méthode « hinges » anglo-saxonne), `range`, `interquartileRange`, `variance` (diviseur n, PAS n−1 — convention du programme de 2nde), `standardDeviation`, `sorted`, `formatNumber`.

Tests : `data.test.js` — 11 cas. Il ne teste PAS `statsUtils.js` directement (couvert séparément par `common/stats/statsUtils.test.js`) mais vérifie que les jeux de données fixes de cette leçon produisent exactement les nombres cités dans les corrections des modules : effectifs et indicateurs de `TRAJETS_A`/`TRAJETS_B` (moyenne ≈19,15/19,10, médiane 18/19, Q1/Q3, IQR, étendue), effet de l'ajout de `ELEVE_LOINTAIN` (moyenne ≈23,95, médiane inchangée à 18), linéarité de la moyenne sous translation/homothétie, et les indicateurs de `ATELIER_X`/`ATELIER_Y` (même médiane 16,5, écarts type et IQR très différents).

## 6. Validation
`validate:lessons` 12/12 LP couverts ; vitest `data.test.js` 11/11 ; e2e : aucune suite (aucun fichier dans `apps/web/e2e/lesson-kit/` ne mentionne `statistiques-une-variable-2nde`, vérifié par grep).
