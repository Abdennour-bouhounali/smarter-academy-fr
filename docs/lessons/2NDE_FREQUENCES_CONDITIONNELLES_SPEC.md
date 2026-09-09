# 2nde — Fréquences conditionnelles — Design & Implementation Spec

> Rétro-documenté depuis le code le 2026-09-09 (la leçon existait sans spec). Sections selon LESSON_DESIGN_PLAYBOOK §15.3.

## 1. Identity & curriculum contract
- Key `seconde_frequences_conditionnelles` · id `frequences-conditionnelles-2nde` · domain `statistiques_probabilites` · 📊 · Difficile · **75 min**.
- Route `/courses/lycee/seconde/statistiques_probabilites/frequences-conditionnelles-2nde`. LPs `seconde_frequences-conditionnelles-2nde_P1…P10`.
- Specificity : « En Seconde, on calcule et interprète des fréquences marginales et conditionnelles dans un tableau croisé, en préparation des probabilités conditionnelles. » (official object `frequences_conditionnelles`, prerequisites déclarés « Tableaux croisés, Proportions, Pourcentages »).
- Neighbours NOT repeated : construction du tableau croisé d'effectifs, variables nominales/ordinales, filtres ET/OU/NON (leçon « Tableaux croisés ») ; notation P_A(B), arbre pondéré, probabilité (leçons « Probabilités conditionnelles » et « Arbres de probabilités ») ; indépendance de deux variables (programme de première).

## 2. Central idea & misconceptions
C'est le DÉNOMINATEUR qui change tout : le même effectif, rapporté au total, à sa ligne ou à sa colonne, donne trois nombres différents répondant à trois questions différentes — « parmi les X, la proportion de Y » ne se lit pas comme « parmi les Y, la proportion de X ».

| # | Misconception | Confronted |
|---|---|---|
| 1 | Diviser systématiquement par le total plutôt que par le groupe de référence | M1 (`ReferenceLab`, la case reste fixe, le dénominateur change), boss `fc-e2`/`fc-e6` |
| 2 | Confondre fréquence marginale et conditionnelle par leur dénominateur | M2 (`TapQuestion` sur les trois fréquences), boss `fc-e3` |
| 3 | Additionner des fréquences conditionnelles de références différentes | M2 step (`somme-conditionnelles`), boss `fc-e4`/`fc-e8` |
| 4 | Erreur d'inversion : « parmi les A, les B » traité comme équivalent à « parmi les B, les A » | M3 (`TapQuestion`, bascule de condition), boss `fc-e5`/`fc-e6`/`fc-e10` |
| 5 | Comparer des sous-populations par effectifs bruts plutôt que par fréquence conditionnelle | M3 step (`comparer-sous-populations`), boss `fc-e7` |
| 6 | Appliquer un pourcentage au mauvais effectif de référence en reconstruisant un tableau | M4 (`NumericQuestion`, `frequences-vers-effectifs`), boss `fc-e9` |

## 3. Signature interaction — « La même case, trois nombres » (`ReferenceLab`)
`components/ReferenceLab.jsx` est le composant local (un seul, avec `Module01LaMemeCaseTroisNombres.jsx` comme unique consommateur) qui porte l'interaction signature du module 1. L'élève clique d'abord une case du tableau croisé (le numérateur, fixé) puis choisit la population de RÉFÉRENCE parmi trois boutons — « Tout le monde », « Sa colonne », « Sa ligne » — et voit le groupe de référence s'illuminer dans le tableau (les cellules concernées passent en indigo clair, la case choisie en indigo plein) pendant que la division s'écrit en toutes lettres sous le tableau : `100 / 200 = 50 %`, avec la population nommée en français (« parmi les « 2de » »). Le numérateur ne bouge jamais ; seul le dénominateur varie selon le mode choisi — c'est exactement le phénomène central de la leçon (100 élèves valent 25 %, 50 % ou 62,5 % selon la référence). Les modules suivants réutilisent la bibliothèque partagée `apps/web/src/lessons/common/stats/` : `CrossTableView` (modules 3 et 5, affichage/lecture du tableau déjà construit) et les fonctions pures `crossTable`/`conditionalFrequency`/`marginalFrequency`/`jointFrequency` pour tous les calculs cités dans les corrections.

## 4. Module architecture (7 · 75 min)
| # | Slug | Stage | LPs | min | Interaction |
|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | `PrerequisiteDiagnostic` (kit) |
| 1 | la-meme-case-trois-nombres | trigger | P1 P3 | 13 | `ReferenceLab` (local) |
| 2 | marginale-conjointe-conditionnelle | discovery | P2 P4 P8 | 13 | `crossTable`/`conditionalFrequency`/`marginalFrequency`/`jointFrequency` (`common/stats`) |
| 3 | parmi-les-uns-parmi-les-autres | discovery | P6 P7 | 13 | bascule de condition (row/col), `conditionalFrequency` |
| 4 | des-frequences-aux-effectifs | manipulation | P5 P9 | 13 | reconstruction case par case (`NumericQuestion`) |
| 5 | atelier-donnees-reelles | practice_lab | P10 P6 P7 | 9 | `CrossTableView` (tableau « club sportif ») |
| 6 | mission-finale-le-denominateur | evaluation | — | 10 | `BossFinal` (10 épreuves) |

Knowledge Map: M1 1 · M2 2 · M3 3 · M4 2 · M5 1 = 9 items.

## 5. Mathematical model — `data.js`
`data.js` exporte `TRANSPORTS`, `NIVEAUX`, `ENQUETE` (effectifs `[transport][niveau]` sur 400 lycéens, écrits en clair, déséquilibre délibéré 200/120/80 entre niveaux) et la fonction `enqueteTable()` qui assemble ces effectifs au format `{ cells, rowTotals, colTotals, grandTotal, rowOrder, colOrder }` attendu par `crossTable`/`CrossTableView`. Un second jeu, `SPORT`/`sportTable()`, sert le module 5 (garçons/filles × club sportif, groupes très inégaux — 160 garçons contre 240 filles). `data.test.js` (9 tests) verrouille les marges et le total (400 ; 2de=200, 1re=120, terminale=80), les trois dénominateurs d'une même case (conjointe 25 %, conditionnelle-colonne 50 %, conditionnelle-ligne 62,5 %), la non-égalité des deux sens d'inversion, la somme à 1 des conditionnelles d'une même condition, la somme à 1 des marginales, et le piège central (plus d'usagers du bus en 2de en effectif, mais une part qui chute avec le niveau).

La leçon s'appuie sur `apps/web/src/lessons/common/stats/statsUtils.js` pour : `crossTable`, `marginalFrequency(table, axis, key)` (case rapportée au grand total), `conditionalFrequency(table, given, of)` (case rapportée à l'effectif de la population de référence désignée par `given`), `jointFrequency(table, row, col)` (case rapportée au grand total, à ne pas confondre avec la conditionnelle). Ces trois fonctions sont testées dans `statsUtils.test.js`, describe `tableaux croisés` — notamment « conditionnelle et marginale n'ont PAS le même dénominateur », « les conditionnelles selon une même condition somment à 1 » et « P_B(A) et P_A(B) diffèrent en général », qui couvrent exactement les propriétés que la leçon fait manipuler.

## 6. Validation
`validate:lessons` 10/10 LP couverts ; vitest 9/9 (`data.test.js`, hors les tests partagés de `statsUtils.test.js`) ; e2e : aucune suite (aucun fichier `frequences-conditionnelles*` dans `apps/web/e2e/lesson-kit/`).
