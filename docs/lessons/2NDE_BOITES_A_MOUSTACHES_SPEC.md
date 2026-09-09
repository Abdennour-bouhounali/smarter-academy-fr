# 2nde — Boîtes à moustaches — Design & Implementation Spec

> Rétro-documenté depuis le code le 2026-09-09 (la leçon existait sans spec). Sections selon LESSON_DESIGN_PLAYBOOK §15.3.

## 1. Identity & curriculum contract
- Key `seconde_boites_a_moustaches` · id `boites-a-moustaches-2nde` · domain `statistiques_probabilites` · 📦 · Difficile · **65 min**.
- Route `/courses/lycee/seconde/statistiques_probabilites/boites-a-moustaches-2nde`. LPs `seconde_boites-a-moustaches-2nde_P1…P9`.
- Specificity : « En Seconde, la boîte à moustaches sert à comparer des distributions à partir de la médiane, des quartiles et de l'étendue, dans des contextes réels. » (official object `boites_a_moustaches`, prerequisites déclarés « Quartiles, Médiane, Statistiques »).
- Neighbours NOT repeated : calcul des quartiles et de la médiane, conventions de rang (leçon « Statistiques à une variable ») ; moustaches à 1,5 × écart interquartile et valeurs aberrantes (hors programme de 2nde) ; histogramme et fréquences cumulées (leçon « Séries regroupées en classes »).
- Prerequisite gap : « Quartiles » est déclaré en prérequis mais aucune leçon de collège ne l'enseigne (4e l'exclut « réservé à la 3e », la 3e ne le traite pas) — la leçon doit donc le construire elle-même ; vérifier que le module 0 ne le suppose pas acquis. Vérifié : le module 0 (`Module00Diagnostic.jsx`) SUPPOSE bien le quartile déjà acquis — les questions `bm-d2` (« Q1 est un seuil tel qu'au moins… de l'effectif lui est inférieur ou égal ») et `bm-d5` (calcul d'un écart interquartile à partir de Q1/Q3 donnés) diagnostiquent la notion sans jamais la construire ; le diagnostic n'est pas bloquant (passingScore n'empêche pas la suite), mais la leçon elle-même part du principe que Q1/Q3 sont déjà définis (`priorKnowledge: [..., 'quartile', ...]`, commentaire du lesson.config.js : « on les DESSINE, on ne les calcule plus »).

## 2. Central idea & misconceptions
Cinq nombres (min, Q1, médiane, Q3, max) suffisent à dessiner la silhouette d'une série et à la comparer d'un coup d'œil à d'autres ; chaque zone de la boîte contient environ un quart de l'effectif — une zone large signifie des valeurs étalées, jamais plus nombreuses.

| # | Misconception | Confronted |
|---|---|---|
| 1 | Le rectangle va du minimum au maximum (confondu avec les moustaches) | M1 step 2 (`TapQuestion`, `explainWrong`), boss `bm-e2` |
| 2 | Une zone large contient plus d'individus | M2 step 1 (`TapQuestion`, `explainWrong`), boss `bm-e4` |
| 3 | Étendue confondue avec écart interquartile | M2 step 2 (`NumericQuestion`, `explainFor`), boss `bm-e3`/`bm-e5` |
| 4 | Une médiane plus basse implique toutes les valeurs plus basses (le cas Embrun) | M3 step 3 (`TapQuestion`, `explainWrong`), boss `bm-e6`/`bm-e7` |
| 5 | Comparer des boîtes tracées à des échelles différentes | M3 step 1 (bascule axe commun / séparé), boss `bm-e8` |
| 6 | Choisir le même indicateur quelle que soit la question posée | M4 step 1 et 3 (`TapQuestion`, `explainWrong`), boss `bm-e9`/`bm-e10` |

## 3. Signature interaction — « Cinq nombres suffisent » (inline, module 1 — pas de composant local)
`boites-a-moustaches-2nde/components/` est VIDE : l'interaction signature n'a pas de composant dédié à la leçon. Elle est écrite inline dans `modules/Module01CinqNombresSuffisent.jsx`, qui orchestre deux composants de la bibliothèque partagée `apps/web/src/lessons/common/stats/` :
- `DotPlot` (`common/stats/DotPlot.jsx`) affiche le nuage des 30 relevés de température de Brest.
- `BoxPlot` (`common/stats/BoxPlot.jsx`) accepte une prop `reveal` (`'none' | 'min' | 'max' | 'median' | 'q1' | 'q3'`) qui contrôle jusqu'où la figure est dessinée.
Le module maintient un état local `step` (0 à 5) et un bouton « Révéler… » qui avance dans l'ordre `['min', 'max', 'median', 'q1', 'q3']` ; à chaque clic, `BoxPlot` reçoit `reveal={ORDER[step-1]}` et ajoute le repère correspondant à la figure. La boîte n'est donc jamais montrée déjà construite : elle est fabriquée sous les yeux de l'élève, un repère à la fois, avec le nuage de points affiché juste au-dessus pour montrer d'où sort chaque repère. Toutes les autres manipulations de la leçon (M2, M3, M4, M5) réutilisent `BoxPlot`/`DotPlot` de la même bibliothèque `common/stats`, jamais de composant propre à la leçon.

## 4. Module architecture (7 · 65 min)
| # | Slug | Stage | LPs | min | Interaction |
|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | `PrerequisiteDiagnostic` (kit) |
| 1 | cinq-nombres-suffisent | trigger | P1 P2 | 12 | `BoxPlot`+`DotPlot` (`common/stats`), révélation progressive |
| 2 | ce-que-chaque-zone-raconte | discovery | P3 P4 | 12 | `BoxPlot`+`DotPlot` (Embrun, `showQuartiles`) |
| 3 | trois-villes-un-axe | discovery | P5 P6 P7 | 13 | `BoxPlot` (bascule axe commun / séparé, 3 villes) |
| 4 | choisir-le-bon-indicateur | manipulation | P8 P9 | 12 | `BoxPlot` (3 villes) + sélection par question |
| 5 | atelier-lire-des-boites | practice_lab | P1 P9 P5 | 7 | `BoxPlot` (serveurs, classes — séries reconstruites via `fromFive`) |
| 6 | mission-finale-les-cinq-nombres | evaluation | — | 5 | `BossFinal` (10 épreuves) |

Knowledge Map: M1 2 · M2 2 · M3 2 · M4 2 · M5 1 = 9 items.

## 5. Mathematical model — `data.js`
`data.js` exporte trois séries écrites en clair (30 relevés de température chacune) : `BREST` (resserrée), `TOULOUSE` (médiane la plus haute), `EMBRUN` (le contre-exemple : médiane la plus basse ET maximum le plus haut) ; `VILLES` les regroupe avec id/label/couleur ; `ATELIER_BOITES` fournit les cinq nombres des deux « serveurs » utilisés au module 5. Aucune fonction exportée : les données sont statiques, garanties par `data.test.js` (7 tests) qui vérifient les cinq nombres cités dans chaque module, l'ordre Q1 ≤ médiane ≤ Q3, et le contre-exemple Embrun.

La leçon s'appuie entièrement sur `apps/web/src/lessons/common/stats/statsUtils.js` pour tout calcul : `fiveNumberSummary`, `median`, `q1`/`q3` (convention de rang ⌈kn/4⌉ du programme français, documentée en tête de fichier), `range`, `interquartileRange`. Ces fonctions sont testées dans `statsUtils.test.js` (describe `indicateurs de position`, notamment le test « quartiles au rang ⌈n/4⌉ et ⌈3n/4⌉ — une valeur de la série » et « résumé des cinq nombres »).

## 6. Validation
`validate:lessons` 9/9 LP couverts ; vitest 7/7 (`data.test.js`, hors les tests partagés de `statsUtils.test.js`) ; e2e : aucune suite (aucun fichier `boites*` dans `apps/web/e2e/lesson-kit/`).
