# 3e — Proportionnalité — Design & Implementation Spec

> Spec produite le 2026-09-04. Leçon `proportionnalite-3e` (clé `3e_proportionnalite`, 12 LPs, 84 min).

## 1. Identité et contrat curriculaire

| | |
|---|---|
| Id / clé | `proportionnalite-3e` / `3e_proportionnalite` — LPs `3e_proportionnalite-3e_P1…P12` (déjà en MySQL, 0 evidence) |
| Description | Mobiliser la proportionnalité dans des problèmes numériques, géométriques et scientifiques. |
| Prérequis (module 0) | Nombres relatifs, Fractions, Pourcentages, Tableaux |
| Périmètre officiel 3e | agrandissement / réduction (longueurs, aires, volumes), lien avec Thalès ; produit en croix et graphique autorisés (4e/5e) |
| Durée | 84 min |

## 2. Décision de conception

1. **Concept.** Deux grandeurs sont proportionnelles quand on passe de l'une à l'autre en multipliant TOUJOURS par le même nombre (le coefficient k) ; équivalents : rapports y/x constants, doubler l'une double l'autre, additivité, points alignés avec l'origine. En géométrie, un agrandissement de rapport k multiplie les longueurs par k, les aires par k², les volumes par k³.
2. **Misconceptions.** « qui augmente ensemble est proportionnel » (temps de cuisson, âge) · additif (+150 g par personne ≠ … si part fixe) · « pour 7 personnes je ne peux pas, 7 n'est pas un multiple de 2 » · « agrandir ×2 double l'aire » · « +20 % puis −20 % revient au départ » · « produit en croix partout, même sans proportionnalité » · unités mélangées (km/h et m/s).
3. **Situation.** La recette de crêpes pour 2 personnes qu'il faut adapter à 7 ; puis la voiture (consommation), l'agrandissement d'une photo/boîte, les soldes, la vitesse et la masse volumique.
4. **Manipulation.** Régler le nombre de personnes (stepper 1…12) et voir les ingrédients s'allonger ; taper un couple pour lire son rapport ; choisir un chemin de calcul vers une case vide ; régler le rapport k d'un agrandissement et lire longueurs/aire/volume ; régler un taux de pourcentage.
5. **Variable pilotée.** Le nombre de personnes ; le couple observé ; la stratégie ; k ; le taux.
6. **Invariants.** Les rapports ne bougent pas quand la quantité bouge ; 0 → 0 ; le temps de cuisson ne bouge PAS avec la quantité (contre-exemple) ; k² pour l'aire.
7–9. Tuiles d'ingrédients → tableau → colonne des rapports → graphique (points alignés par O) → y = k·x.
10. **Étayage.** Stepper libre → prédiction du double → prédiction de 7 (facteur non entier) → choix de chemin guidé → chemin libre → questions sans manipulation.
11. **Transfert.** Géométrie (k, k², k³, Thalès), sciences (vitesse, masse volumique, échelle), pourcentages.

### Candidats examinés

| Concept | Candidats | Verdict |
|---|---|---|
| Invariance multiplicative (M1) | (a) tableau à compléter · (b) balance (déjà utilisée par fonctions-lineaires-3e) · **(c) recette : stepper de personnes, tuiles d'ingrédients qui s'allongent, 7 personnes casse la méthode « double »** | **(c)** — imposé par la commande et distinct de la balance |
| Coefficient (M2) | (a) définition · **(b) toucher un couple → son rapport ; plusieurs couples → même rapport ; situation non proportionnelle → rapports différents** | **(b)** |
| Méthodes (M3) | (a) montrer les 4 méthodes · **(b) choisir un chemin vers la case vide, voir le calcul se dérouler, constater que tous convergent** | **(b)** |
| Agrandissement (M4) | (a) formule k² · **(b) régler k, voir la figure et ses mesures ; prédire l'aire ; grille de carreaux qui explique k²** | **(b)** — l'aha 3e |
| Pourcentages (M5) | (a) exercices · **(b) barre 100 % → taux ; « +20 % puis −20 % » à éprouver** | **(b)** |

## 3. Modèle mathématique — `components/propUtils.js`

Règle unique : `Rule = proportional(k) | affine(k, b) | custom(fn, label)` avec `applyRule` (adapté de la 6e, jamais importé d'une autre leçon) ; `ratioAt`, `ratiosAllEqual`, `doublingHolds`, `additivityHolds`, `coefficient`, `rowsCoefficient`, `strategiesFor(xKnown, yKnown, xTarget)` (unité, ×facteur, ÷diviseur, coefficient vertical, produit en croix) avec garde `strategiesAgree`, `fourthProportional`, `percentMultiplier(rate)`, `applyPercent`, `chainPercents`, `scaleFigure(k)` → `{lengths: k, area: k², volume: k³}`, `thalesRatios`, `speed/distance/time`, `density`, `mapScale`, `magnitudeCheck`.

## 4. Modules (84 min)

| # | slug | Titre | stage | LPs | min | Responsabilité · aha |
|---|---|---|---|---|---|---|
| 0 | mission-de-depart | Mission de départ | prerequisite_check | — | 4 | relatifs, fractions, pourcentages, tableaux |
| 1 | la-recette | La recette pour 7 | trigger | P1, P2, P3 | 12 | stepper de personnes, tuiles, prédiction 4 puis 7, tableau, rapport constant, graphique, contre-exemple du temps de cuisson · « on multiplie toujours par le même nombre » |
| 2 | le-nombre-cache | Le nombre caché | discovery | P4, P3, P1 | 9 | rapport y/x sur chaque couple ; reconnaître une situation grâce aux rapports · « k est le prix d'UNE unité » |
| 3 | quatre-chemins | Quatre chemins vers la case vide | manipulation | P5, P6, P7 | 11 | unité, ×facteur, coefficient, produit en croix — tous convergent · « le meilleur chemin dépend des nombres » |
| 4 | agrandir-sans-se-tromper | Agrandir sans se tromper | manipulation | P9, P12 | 11 | k, k², k³ sur une figure ; Thalès · « ×2 sur les côtés, ×4 sur l'aire » |
| 5 | pourcentages-et-coefficient | Pourcentages et coefficient multiplicateur | formalization | P7, P8, P12 | 10 | ×1,2 / ×0,75, aller-retour +20 % −20 %, « À retenir » |
| 6 | le-labo-des-sciences | Le labo des sciences | practice_lab | P10, P11, P12 | 12 | vitesse (graphique ↔ tableau ↔ situation), masse volumique, échelle, cohérence |
| 7 | mission-finale-la-grande-tablee | 🏆 Mission finale : la grande tablée | evaluation | — | 15 | 10 QCM `pr-e1…e10` |

## 5. Composants

`RecipeLab` (stepper personnes, tuiles/barres d'ingrédients bornées, « noter », part fixe optionnelle = temps de cuisson), `RatioTable` (deux lignes, flèches ×k verticales/horizontales, cases à trouver, rapports), `StrategyPicker` (chips de chemins → `CalcChain` partagé), `ScaleBox` (rectangle sur grille + boîte, k slider 0,5…3, mesures dérivées), `PercentBar` (barre 100 % → taux, enchaînement), shared `CoordPlane`, `ValueTable`, `ParamSlider`.

## 6. Boss « La grande tablée » (`pr-e1…e10`)

e1 reconnaître (P1, P2) · e2 rapport constant (P3) · e3 coefficient d'un tableau (P4) · e4 compléter (P5, P7) · e5 passage à l'unité (P6) · e6 +30 % (P8) · e7 aire ×k² (P9) · e8 vitesse (P10) · e9 lecture graphique ↔ tableau (P11) · e10 cohérence (P12).

## 7. Fichiers

`…/donnees_probabilites/proportionnalite-3e/` (config, context, index, routes, `components/{propUtils.js,+test, learningPoints.js, RecipeLab.jsx, RatioTable.jsx, StrategyPicker.jsx, ScaleBox.jsx, PercentBar.jsx, situationsData.js}`, `modules/Module00…07`). E2E `3e-proportionnalite.mjs` (port 5220).

## Shipped state (2026-09-05)

- Catalogue : `status: 'available'`, `durationMinutes` = somme des modules ; exporté puis importé
  (`smarter:import-curriculum`), `smarter:validate-curriculum` : « No drift » ; 12 LP rows en MySQL.
- `npm run validate:lessons` : 12/12 learning points covered, zéro erreur pour la leçon (baseline du
  dépôt inchangée : 6 erreurs / 29 avertissements, toutes dans des leçons 6e pré-existantes).
- `npm run build` : OK. Tests unitaires : voir ci-dessous. Suite Playwright : voir ci-dessous.
- Unit tests `propUtils.test.js` : 11 (règles, recette, chemins concordants, pourcentages,
  agrandissement k/k²/k³, Thalès, sciences, cohérence, accord en nombre).
- E2E `3e-proportionnalite.mjs` (port 5220) : 67/67 — balayage 1 → 12 convives avec audit DOM à
  chaque cran, rapports révélés colonne par colonne, quatre chemins, k 0,5 → 3 avec audit SVG + DOM,
  aller-retour +20 % / −20 %, repères des sciences (aspect ≤ 3), boss, revisite, mobile M1 et M4.
- Correctif trouvé par la suite : `PercentBar` avec `maxRates = 1` verrouillait tous les autres taux
  après le premier choix — un chip touché REMPLACE désormais le taux courant.
