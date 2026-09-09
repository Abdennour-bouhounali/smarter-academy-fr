# 2nde — Tableaux croisés — Design & Implementation Spec

> Rétro-documenté depuis le code le 2026-09-09 (la leçon existait sans spec). Sections selon LESSON_DESIGN_PLAYBOOK §15.3.

## 1. Identity & curriculum contract
- Key `seconde_tableaux_croises` · id `tableaux-croises-2nde` · domain `statistiques_probabilites` · 🗂️ · Difficile · **75 min**.
- Route `/courses/lycee/seconde/statistiques_probabilites/tableaux-croises-2nde`. LPs `seconde_tableaux-croises-2nde_P1…P10`.
- Specificity : « En Seconde, deux variables qualitatives issues de données réelles sont croisées dans un tableau d'effectifs, avec filtrage d'une population à l'aide de ET, OU et NON. » (official object `tableaux_croises`, prerequisites déclarés « Effectifs, Fréquences, Pourcentages »).
- Neighbours NOT repeated : fréquences marginales et conditionnelles, division par un effectif de référence (leçon « Fréquences conditionnelles ») ; probabilités conditionnelles et notation P_A(B) (leçon « Probabilités conditionnelles ») ; variables quantitatives, moyennes et dispersions (leçon « Statistiques à une variable »).

## 2. Central idea & misconceptions
Croiser deux variables, c'est ranger chaque individu dans une case et une seule : un comptage exhaustif et sans recouvrement, où la somme des marges de lignes et celle des marges de colonnes tombent toutes deux sur l'effectif total.

| # | Misconception | Confronted |
|---|---|---|
| 1 | Additionner deux effectifs plutôt que lire la case d'intersection | M1 step 3 (`TapQuestion`, `explainWrong`), boss `tc-e5` |
| 2 | Une variable ordinale (niveau) traitée comme nominale, ordre non respecté | M2 (`TapQuestion`/`PredictionChips` sur nominale vs ordinale), boss `tc-e2`/`tc-e3` |
| 3 | Une marge de ligne/colonne confondue avec une case | M3 (mise en évidence via `CrossTableView`), boss `tc-e5`/`tc-e6` |
| 4 | Le OU additionné sans retirer l'intersection (compté deux fois) | M4 step 1 (`FilterLab`, calcul affiché n(A)+n(B)−n(A et B)), boss `tc-e8` |
| 5 | NON mal complémenté (oubli du total de référence) | M4 (`FilterLab`, chip NON), boss `tc-e9` |
| 6 | Comparer des effectifs bruts entre groupes de tailles différentes | M5 (atelier, `TapQuestion`, `explainWrong`), boss `tc-e10` |

## 3. Signature interaction — « Soixante fiches à ranger » (`FileSorter`)
`components/FileSorter.jsx` est le composant local qui porte l'interaction signature du module 1 (déclencheur). L'élève voit une fiche d'élève à la fois (prénom, classe, activité) et doit cliquer la case du tableau croisé où elle doit aller ; un clic correct incrémente la case et fait apparaître la fiche suivante, les marges de lignes/colonnes se recalculant en direct ; un clic incorrect fait clignoter la bonne case sans bloquer (pas d'évaluation, juste un geste corrigé sur place). Un bouton « Ranger automatiquement » permet de finir les 60 fiches sans corvée de clics une fois la mécanique comprise. Le tableau n'est donc pas montré puis expliqué : il est FABRIQUÉ un individu à la fois, jusqu'à ce que le total tombe sur 60. Les modules suivants (2 à 5) n'utilisent plus `FileSorter` mais deux exports de la bibliothèque partagée `apps/web/src/lessons/common/stats/` : `CrossTableView` (affichage/surbrillance du tableau déjà construit, modules 2/3/5) et `crossTable` (construction pure des cellules/marges à partir des observations). Le module 4 utilise le second composant local, `components/FilterLab.jsx` (voir §2).

## 4. Module architecture (7 · 75 min)
| # | Slug | Stage | LPs | min | Interaction |
|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | `PrerequisiteDiagnostic` (kit) |
| 1 | soixante-fiches-a-ranger | trigger | P4 P6 | 13 | `FileSorter` (local) |
| 2 | deux-variables-qualitatives | discovery | P1 P2 P3 | 12 | `crossTable` (nominale vs ordinale, mêmes individus) |
| 3 | les-marges-et-le-total | discovery | P8 P7 | 13 | `CrossTableView` (surbrillance ligne/colonne/total) |
| 4 | filtrer-avec-et-ou-non | manipulation | P5 P10 | 13 | `FilterLab` (local) |
| 5 | atelier-interpreter-un-tableau | practice_lab | P9 P7 | 10 | `CrossTableView` (deux tableaux réels) |
| 6 | mission-finale-le-club | evaluation | — | 10 | `BossFinal` (10 épreuves) |

Knowledge Map: M1 2 · M2 2 · M3 2 · M4 1 · M5 1 = 8 items.

## 5. Mathematical model — `data.js`
`data.js` exporte `CLASSES`, `ACTIVITES`, `NIVEAUX` (les trois modalités-listes) et `ELEVES` : 60 fiches générées par `buildEleves()` à partir d'une graine figée (`makeRng(20260907)` de `common/stats/randomUtils.js`) avec des poids volontairement inégaux, pour que les effectifs marginaux ne tombent pas ronds. Aucun calcul n'est exporté par `data.js` lui-même — la construction du tableau est déléguée à `crossTable`. `data.test.js` (9 tests) verrouille : les 60 fiches toutes renseignées, les prénoms uniques, les 12 cases toutes occupées, la cohérence des marges (somme des cases = 60, marges lignes = marges colonnes = 60), et les trois lois logiques du module 4 (ET = intersection = une case ; OU inclusif = a + j − intersection ; NON = complémentaire 60 − marge).

La leçon repose sur `apps/web/src/lessons/common/stats/statsUtils.js` pour : `crossTable(observations, rowsKey, colsKey, rowOrder, colOrder)` (construit `{ cells, rowTotals, colTotals, grandTotal, rowOrder, colOrder }` à partir des observations individuelles) et `sum`. Ces fonctions sont testées dans `statsUtils.test.js`, describe `tableaux croisés` (effectifs/marges/total, « la somme des marges vaut le total, des deux côtés », et les cas conditionnelle/marginale qui préparent la leçon suivante). Aucune fonction de fréquence (`marginalFrequency`, `conditionalFrequency`) n'est utilisée ici — c'est le périmètre explicitement exclu (voir §1), réservé à « Fréquences conditionnelles ».

## 6. Validation
`validate:lessons` 10/10 LP couverts ; vitest 9/9 (`data.test.js`, hors les tests partagés de `statsUtils.test.js`) ; e2e : aucune suite (aucun fichier `tableaux-croises*` dans `apps/web/e2e/lesson-kit/`).
