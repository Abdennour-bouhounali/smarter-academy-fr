# 2nde — Évolutions successives et réciproques — Design & Implementation Spec

> Rétro-documenté depuis le code le 2026-09-09 (la leçon existait sans spec). Sections selon LESSON_DESIGN_PLAYBOOK §15.3.

## 1. Identity & curriculum contract
- Key `seconde_evolutions_successives_reciproques` · id `evolutions-successives-reciproques-2nde` · domain `statistiques_probabilites` · 📈 · Difficile · **70 min**.
- Route `/courses/lycee/seconde/statistiques_probabilites/evolutions-successives-reciproques-2nde`. LPs `seconde_evolutions-successives-reciproques-2nde_P1…P8`.
- Specificity : en Seconde, les évolutions successives et réciproques sont traitées par composition de coefficients multiplicateurs, en insistant sur le fait que les pourcentages ne s'additionnent pas.
- Neighbours NOT repeated : définition de la proportion, points de pourcentage, coefficient d'une seule évolution (leçon « Proportions et pourcentages ») ; taux moyen d'évolution avec racine n-ième et suites géométriques (programme de première) ; indices base 100 et évolutions en chaîne sur de longues séries (hors programme de 2nde). Dans la chaîne du chapitre (proportions → évolutions → stats 1 variable → séries en classes → boîtes → tableaux croisés → fréquences conditionnelles → LGN → probas conditionnelles → arbres → tests diagnostiques), elle prend le relais immédiatement après « Proportions et pourcentages » pour composer et inverser les coefficients qu'elle a posés.

## 2. Central idea & misconceptions
Les taux ne s'ajoutent pas, les COEFFICIENTS se multiplient — deux évolutions opposées de même taux ne se compensent pas (×1,2 × 0,8 = 0,96 ≠ 1), et le coefficient réciproque qui annule une évolution est l'INVERSE (1/k), jamais l'opposé du taux.

| # | Misconception | Confronted |
|---|---|---|
| 1 | Deux pourcentages opposés (+20 % puis −20 %) se compensent et ramènent au point de départ | M1 step 1, boss ev-e2, ev-e10 |
| 2 | Les taux s'additionnent au lieu que les coefficients se multiplient | M2 step 2, M3 step 2, boss ev-e1 ev-e3 ev-e4 ev-e5 |
| 3 | Deux remises successives de même taux s'additionnent (−30 % puis −30 % = −60 %) | M3 step 4, M6 step 1 |
| 4 | Le coefficient réciproque d'une évolution de +x % est −x % (l'opposé, pas l'inverse) | M4 (`ReciprocalFinder`), boss ev-e6, ev-e7 |
| 5 | Pour retrouver la valeur initiale, on rajoute le même pourcentage retiré, au lieu de diviser par le coefficient | M5 step 1-2, boss ev-e8 |
| 6 | La base d'une évolution en chaîne reste fixe (le second pourcentage porte encore sur la valeur de départ) | M1 (`base-mouvante`), boss ev-e2 |
| 7 | Remonter une chaîne revient à multiplier par le coefficient au lieu de diviser | M5 step 3, M6 (situation c1), boss ev-e8 ev-e9 |

## 3. Signature interaction — « Le prix du vélo » (`EvolutionChain`)
Chaîne départ → étape(s) → arrivée en boîtes reliées par des flèches, chacune portant le coefficient (`×1,20`) ET le rappel de la base sur laquelle il s'applique (« s'applique à 120 € », pas à 100 €) — c'est le point pédagogique central. L'élève règle chaque taux via un curseur (`input range`, −50 % à +100 %, pas de 5 %) ; les deux curseurs restent actifs simultanément, sans gate un-à-un. Toute la chaîne (valeurs intermédiaires, coefficients, coefficient global `kGlobal`, taux global `tGlobal`) se recalcule en direct, et un encart affiche explicitement la somme naïve des taux annoncés à côté du vrai taux global, étiqueté « un nombre qui ne décrit pas cette chaîne ». Étape 1 exige d'atteindre exactement +20 % puis −20 % (tolérance flottante) ; étapes 2-3 réutilisent le même composant en lecture seule (`editable={false}`) avec des paires de taux préréglées et un choix d'ordre, pour généraliser au-delà du cas 20 %. Aucun `disabled` ne fige jamais les curseurs eux-mêmes après validation.

## 4. Module architecture (8 · 70 min)
| # | Slug | Stage | LPs | min | Interaction |
|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | kit (diagnostic) |
| 1 | le-prix-du-velo | trigger | P1 P4 | 11 | `EvolutionChain` |
| 2 | les-coefficients-se-multiplient | discovery | P2 P1 | 10 | `EvolutionChain` (jusqu'à 3 étapes) |
| 3 | le-taux-global | discovery | P3 P4 | 10 | `EvolutionChain` |
| 4 | revenir-au-depart | manipulation | P5 P6 | 11 | `ReciprocalFinder` |
| 5 | retrouver-la-valeur-initiale | manipulation | P8 P6 | 9 | atelier (remonter la chaîne) |
| 6 | atelier-lire-les-evolutions | practice_lab | P7 P8 P3 P5 | 10 | situations (soldes, population, salaire) |
| 7 | mission-finale-la-chaine | evaluation | — | 5 | `BossFinal` |

Knowledge Map: M1 3 · M2 2 · M3 2 · M4 3 · M5 2 · M6 1 = 13 items.

## 5. Mathematical model — shared `common/stats/percentUtils.js`
Cette leçon n'a pas de `data.js` local ; le modèle vient du module partagé `apps/web/src/lessons/common/stats/percentUtils.js`, documenté comme partagé avec « Proportions et pourcentages ». Fonctions utilisées : `coefficient(rate)`, `rateFromCoefficient(k)`, `applyRate`, `globalCoefficient(rates)` (produit `Π(1+rᵢ)` — le cœur de cette leçon, réduction d'un tableau de taux), `globalRate(rates)` (= `globalCoefficient − 1`), `reciprocalCoefficient(k)` (= 1/k, jamais −k ni 2−k, garde explicite dans le commentaire du code), `reciprocalRate(rate)` (= 1/(1+rate) − 1), `initialValue(final, k)` (= final/k, la formule « remonter la chaîne » du module 5). Formatage via `formatNumber`/`formatPercent` de `statsUtils.js`.

Aucun test unitaire dédié à la leçon — le modèle est inline dans les modules. Les fonctions partagées sont en revanche couvertes par `common/stats/percentUtils.test.js` (17 cas au total, dont 9 concernent directement les garanties de cette leçon : « +20 % puis −20 % ne revient PAS au départ », « les taux ne s'additionnent pas », « l'ordre des évolutions successives ne change pas le résultat global », « deux baisses successives ne peuvent pas dépasser −100 % », « le coefficient réciproque est l'INVERSE, pas l'opposé », « après +25 % il faut −20 % pour revenir au départ », « appliquer un taux puis son réciproque redonne exactement la valeur initiale », « retrouver la valeur initiale à partir de la finale et du coefficient » — les 8 autres cas couvrent `proportion`/`nestedProportion`/points-vs-pourcent, hors périmètre de cette leçon).

## 6. Validation
`validate:lessons` 8/8 LP couverts ; aucun test unitaire propre à la leçon (pas de `data.js` ni de fichier `*.test.js` dans le dossier, vérifié) — la logique partagée qu'elle consomme est testée côté `common/stats/percentUtils.test.js` (17/17) ; e2e : aucune suite (aucun fichier dans `apps/web/e2e/lesson-kit/` ne mentionne `evolutions-successives-reciproques-2nde`, vérifié par grep).
