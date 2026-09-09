# 2nde — Proportions et pourcentages — Design & Implementation Spec

> Rétro-documenté depuis le code le 2026-09-09 (la leçon existait sans spec). Sections selon LESSON_DESIGN_PLAYBOOK §15.3.

## 1. Identity & curriculum contract
- Key `seconde_proportions_et_pourcentages` · id `proportions-pourcentages-2nde` · domain `statistiques_probabilites` · % · Difficile · **70 min**.
- Route `/courses/lycee/seconde/statistiques_probabilites/proportions-pourcentages-2nde`. LPs `seconde_proportions-pourcentages-2nde_P1…P11`.
- Specificity : en Seconde, on distingue proportion et évolution, on calcule des proportions de proportions et on introduit le coefficient multiplicateur associé à un taux d'évolution.
- Neighbours NOT repeated : évolutions successives, coefficient global, évolution réciproque (leçon « Évolutions successives et réciproques ») ; indicateurs statistiques — moyenne, médiane, quartiles (leçon « Statistiques à une variable ») ; fréquences conditionnelles dans un tableau croisé (leçon « Fréquences conditionnelles »). En amont de la chaîne du chapitre (proportions → évolutions → stats 1 variable → séries en classes → boîtes → tableaux croisés → fréquences conditionnelles → LGN → probas conditionnelles → arbres → tests diagnostiques), elle pose UNE évolution et son coefficient k = 1 + t, sans les enchaîner ni les inverser.

## 2. Central idea & misconceptions
« 30 % » ne veut rien dire seul — il faut savoir DE QUOI (une proportion se rapporte à un TOUT, une évolution à la valeur de DÉPART) ; les proportions emboîtées se multiplient, jamais ne s'additionnent ; le coefficient multiplicateur k = 1 + t rend une évolution calculable et son signe (k > 1 ou k < 1) code la hausse ou la baisse.

| # | Misconception | Confronted |
|---|---|---|
| 1 | Un effectif identique (200) implique une proportion identique, indépendamment du tout de référence | M1 step 2, boss pp-e1 |
| 2 | Un pourcentage énoncé seul (« 30 % ») est vérifiable sans préciser son tout | M1 step 4 |
| 3 | Confondre le pourcentage (part) avec l'effectif, ou diviser au lieu de multiplier pour appliquer une proportion | M2 step 2, boss pp-e2 |
| 4 | Des proportions emboîtées s'additionnent ou se soustraient (60 % puis 25 % → 85 % ou 35 %) | M3 step 1, boss pp-e4 |
| 5 | Des remises successives s'additionnent (−30 % puis −20 % = −50 %) | M3 step 3, boss pp-e5 |
| 6 | Confondre un point de pourcentage avec un pourcentage (15 %→18 % lu comme « +3 % ») | M4 step 2, boss pp-e6 |
| 7 | Calculer un taux d'évolution en divisant par la valeur d'arrivée au lieu de la valeur initiale | M4 step 4, boss pp-e7 |
| 8 | Le coefficient d'une baisse de t % est pris égal à t (0,15 ou −0,15) au lieu de 1 − t | M5, boss pp-e8, pp-e10 |

## 3. Signature interaction — « Le lycée de 800 élèves » (`PopulationSplitter`)
Barre de population (800 élèves) que l'élève saisit par le TRAIT NOIR de séparation et fait glisser en continu (pas de paliers ; pas de +/−) : le geste EST le découpage. La variable contrôlée est l'effectif du sous-groupe — jamais la proportion, qui doit apparaître comme conséquence. Trois écritures (fraction `part/tout`, décimale à `formatNumber`, pourcentage à `formatPercent`) se recalculent en direct pendant le glissement, sans clic. Étape 3 ajoute une seconde barre imbriquée (les internes parmi les demi-pensionnaires), bornée pour ne jamais déborder du groupe qui la contient, avec un bouton de bascule de lecture (« parmi les demi-pensionnaires » / « parmi tout le lycée ») qui change le dénominateur à l'identique numérateur — pour montrer qu'un même effectif vaut deux pourcentages différents selon le tout choisi. La validation exige au moins 3 valeurs distinctes espacées d'au moins 10 points (étape 1) ou 2 valeurs distinctes espacées d'au moins 15 points ET les deux modes de lecture visités (étape 3) — jamais un simple « a bougé une fois ».

## 4. Module architecture (8 · 70 min)
| # | Slug | Stage | LPs | min | Interaction |
|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | kit (diagnostic) |
| 1 | le-lycee-de-800-eleves | trigger | P1 P2 P4 | 11 | `PopulationSplitter` |
| 2 | trois-ecritures-une-proportion | discovery | P2 P3 P4 P1 | 10 | `ThreeWritings` |
| 3 | un-pourcentage-de-pourcentage | discovery | P5 P6 | 11 | `NestedShares` |
| 4 | etat-ou-variation | manipulation | P7 P8 P9 | 11 | `StateVsChange` |
| 5 | le-coefficient-multiplicateur | manipulation | P10 P11 | 10 | `CoefficientDial` |
| 6 | atelier-lire-les-pourcentages | practice_lab | P1 P5 P7 P10 P3 | 8 | atelier (remise, sondage, hausse de loyer) |
| 7 | mission-finale-de-quoi-parle-t-on | evaluation | — | 5 | `BossFinal` |

Knowledge Map: M1 3 · M2 3 · M3 2 · M4 3 · M5 3 · M6 1 = 15 items.

## 5. Mathematical model — shared `common/stats/percentUtils.js`
Cette leçon n'a pas de `data.js` local ; toute la logique numérique vient du module partagé `apps/web/src/lessons/common/stats/percentUtils.js`, explicitement documenté comme partagé avec la leçon sœur « Évolutions successives et réciproques ». Fonctions effectivement utilisées par cette leçon : `proportion(part, whole)` (retourne `null` si `whole` est nul, jamais `Infinity`), `nestedProportion(outer, inner)` (produit des deux proportions), `evolutionRate(initial, final)`, `coefficient(rate)` (k = 1 + t), `applyRate(value, rate)`, `percentagePointDifference(from, to)` (différence en POINTS, jamais en pourcentage). Les fonctions `globalCoefficient`, `globalRate`, `reciprocalCoefficient`, `reciprocalRate`, `initialValue`, `relativeChange` sont exportées par le même module mais ne sont importées par aucun fichier de cette leçon — elles servent la leçon sœur. Formatage via `formatNumber`/`formatPercent` de `statsUtils.js`.

Aucun test unitaire — le modèle est inline dans les modules. `percentUtils.js` n'a pas de fichier `percentUtils.test.js` (seuls `statsUtils.test.js`, `randomUtils.test.js` et `PopulationBar.test.jsx` existent dans `common/stats/`) : même les fonctions partagées dont cette leçon dépend (`proportion`, `nestedProportion`, `evolutionRate`, `coefficient`…) ne sont testées nulle part dans le dépôt.

## 6. Validation
`validate:lessons` 11/11 LP couverts ; aucun test unitaire (aucun `data.js` ni fichier `*.test.js` dans le dossier de la leçon, vérifié) ; e2e : aucune suite (aucun fichier dans `apps/web/e2e/lesson-kit/` ne mentionne `proportions-pourcentages-2nde`, vérifié par grep).
