# 3e — Modélisation — Design & Implementation Spec

> Spec produite le 2026-09-04. Leçon `modelisation-3e` (clé `3e_modelisation`, 12 LPs, 88 min).

## 1. Identité et contrat curriculaire

| | |
|---|---|
| Id / clé | `modelisation-3e` / `3e_modelisation` — LPs `3e_modelisation-3e_P1…P12` (déjà en MySQL, 0 evidence) |
| Description | Traduire une situation réelle ou mathématique en modèle numérique, algébrique, fonctionnel ou géométrique puis interpréter le résultat. |
| Prérequis (module 0) | Proportionnalité, Fonctions, Calcul littéral, Équations |
| Périmètre officiel | modéliser par une fonction, étude d'une dépendance entre grandeurs ; exclu : modélisation probabiliste continue |
| Durée | 88 min |

## 2. Décision de conception

1. **Concept.** Modéliser, c'est traduire une situation en mathématiques (grandeurs → variable → relation → représentation) pour raisonner dessus, puis revenir à la situation pour interpréter et vérifier. Les modèles du collège : numérique (calcul direct), proportionnel (y = kx), affine (y = ax + b), fonctionnel non affine (x², volume), géométrique (figure, Pythagore/Thalès). Un bon modèle dépend de la situation et a des limites.
2. **Misconceptions.** utiliser toutes les données de l'énoncé · supposer la proportionnalité quand il y a une part fixe · prendre x pour « la réponse » · lire un paramètre sans son sens (0,15 = « le prix ») · extrapoler sans limite (bactéries, plafond de tarif) · accepter un résultat absurde (durée négative, 6,25 séances) · un seul point valide un modèle.
3. **Situation.** La trottinette électrique en libre-service (déblocage 1 € + 0,15 €/min, plafond 8 €/h), fil rouge repris jusqu'au boss ; puis piscine, abonnement, jardin carré, forfait téléphone, essence, température, fête de fin d'année.
4. **Manipulation.** Trier les données ; choisir les grandeurs ; tester des modèles candidats sur les tickets enregistrés ; construire tableau → graphique → expression ; régler a et b pour coller aux points ; utiliser le modèle pour prévoir puis confronter au réel.
5. **Variable pilotée.** Le modèle candidat ; la durée ; les paramètres a et b ; la valeur de x testée.
6. **Invariants.** Un modèle doit être d'accord avec TOUTES les données ; un même modèle se lit dans le tableau, le graphique et l'expression ; le modèle prévoit — mais seulement là où il est valable.
7–9. Cartes de données → tableau → points → droite/courbe → expression avec paramètres nommés.
10. **Étayage.** Données mises en évidence → tri libre ; candidats fermés → paramètres à régler → modèle à choisir seul ; prédiction confrontée au réel.
11. **Transfert.** Fête de fin d'année (deux tarifs, seuil), lecture des limites.

### Candidats examinés

| Concept | Candidats | Verdict |
|---|---|---|
| Modéliser (M1) | (a) énoncé + QCM · (b) machine à fonctions (déjà fonctions-3e) · **(c) laboratoire : trier les données, choisir les grandeurs, tester quatre modèles sur trois tickets, dérouler tableau/graphique/expression, prévoir, confronter à l'application** | **(c)** — imposé par la commande |
| Choisir un modèle (M4) | (a) QCM famille · **(b) régler a, b (ou x²) pour coller aux points, écart total lu ; la température n'a pas de modèle simple** | **(b)** |
| Représenter (M3) | (a) tableau tout fait · **(b) tableau par puces, points posés un à un sur le repère (tap + « Poser »)** | **(b)** |
| Interpréter/limites (M6) | (a) texte · **(b) valeurs testées hors domaine, plafond visible sur le graphique (bande de validité)** | **(b)** |

## 3. Modèle mathématique — `components/modelUtils.js`

`Model = {kind: 'proportional'|'affine'|'square'|'custom'|'none', …}` ; `evaluate(model, x)`, `residual(model, points)` (somme des |écarts|), `bestModel(candidates, points)`, `agreesWithAll(model, points, tol)`, `tableOf`, `formatModel` (LaTeX, via `formatAffine`), `interpretResult(x, {integer, min, max})` → exact/ceil/floor/reject, `clampToDomain`, `capped(model, cap)`, `breakEven(f, g)` (via `intersectionOfAffine`), `magnitudeOk`, `sortData(items)`. Situations dans `situationsData.js` (données littérales, jamais calculées à la main).

## 4. Modules (88 min)

| # | slug | Titre | stage | LPs | min | Responsabilité · aha |
|---|---|---|---|---|---|---|
| 0 | mission-de-depart | Mission de départ | prerequisite_check | — | 4 | proportionnalité, fonctions, calcul littéral, équations |
| 1 | le-laboratoire-de-modelisation | Le laboratoire de modélisation | trigger | P1, P2, P4, P10, P11 | 12 | trier, choisir les grandeurs, tester 4 modèles sur 3 tickets, tableau/graphique/expression, prévoir 35 min, confronter · « un modèle doit être d'accord avec toutes les données, et alors il prévoit » |
| 2 | grandeurs-et-representations | Grandeurs, variables, représentations | discovery | P1, P2, P3 | 9 | trois situations : quelle grandeur dépend de laquelle ; quelle représentation pour quelle question |
| 3 | du-tableau-au-graphique | Du tableau au graphique | discovery | P5, P6 | 9 | remplir le tableau par puces, poser les points, reconnaître la forme |
| 4 | quel-modele | Quel modèle ? | manipulation | P4, P7, P8, P9 | 11 | régler a et b, essayer x², lire l'écart ; la température n'a pas de modèle simple · « le modèle est choisi par les données » |
| 5 | modeliser-cest-traduire | Modéliser, c'est traduire | formalization | P4, P7, P8, P11 | 9 | construire l'expression par cartes, nommer les paramètres, « À retenir » : le cycle de modélisation |
| 6 | prevoir-interpreter-douter | Prévoir, interpréter, douter | practice_lab | P10, P11, P12 | 11 | prévisions, résultats non entiers / négatifs, plafond, extrapolation, ordre de grandeur |
| 7 | le-grand-projet | Le grand projet | practice_lab | P1, P3, P9, P10, P12 | 8 | fête de fin d'année : deux tarifs, seuil, décision argumentée |
| 8 | mission-finale-le-bureau-detudes | 🏆 Mission finale : le bureau d'études | evaluation | — | 15 | 10 QCM `mo-e1…e10` |

## 5. Composants

`ModelLab` (M1 : cartes de données, sélection de grandeurs, `ModelTester`, vues tableau/graphique/expression, prédiction), `ModelTester` (candidats rejoués sur les tickets — adapté de RuleTester, non importé), `ModelFitter` (M4 : chips de famille + `ParamSlider` a/b, écart total, points), `PointPlacer` (M3 : point déplaçable + « Poser »), `ExpressionBuilder` (M5 : cartes → expression), `DomainPlane` (M6 : `CoordPlane` + bande de validité). Shared : `InfoSorter` (formative), `ValueTable`, `CoordPlane`, `CalcChain`, `MathText`.

## 6. Boss « Le bureau d'études » (`mo-e1…e10`)

e1 donnée inutile (P1) · e2 grandeur qui dépend (P2) · e3 représentation adaptée (P3) · e4 relation (P4) · e5 tableau (P5) · e6 graphique : quelle forme (P6) · e7 expression (P7) · e8 fonction / modèle (P8, P9) · e9 prévision (P10) · e10 interprétation et limite (P11, P12).

## 7. Fichiers

`…/donnees_probabilites/modelisation-3e/` (config, context, index, routes, `components/{modelUtils.js,+test, situationsData.js, learningPoints.js, ModelLab.jsx, ModelTester.jsx, ModelFitter.jsx, PointPlacer.jsx, ExpressionBuilder.jsx}`, `modules/Module00…08`). E2E `3e-modelisation.mjs` (port 5221).

## Shipped state (2026-09-05)

- Catalogue : `status: 'available'`, `durationMinutes` = somme des modules ; exporté puis importé
  (`smarter:import-curriculum`), `smarter:validate-curriculum` : « No drift » ; 12 LP rows en MySQL.
- `npm run validate:lessons` : 12/12 learning points covered, zéro erreur pour la leçon (baseline du
  dépôt inchangée : 6 erreurs / 29 avertissements, toutes dans des leçons 6e pré-existantes).
- `npm run build` : OK. Tests unitaires : voir ci-dessous. Suite Playwright : voir ci-dessous.
- Unit tests `modelUtils.test.js` : 11 (évaluation, accord avec toutes les données, `bestModel` →
  « aucun modèle simple » pour la température, `fitAffine`, plafond, `interpretResult`, seuil de la
  fête à 30, `planeFor`, `parseTokens` avec priorité de ×).
- E2E `3e-modelisation.mjs` (port 5221) : 55/55 — trieur formatif avec erreur
  volontaire, deux grandeurs, quatre modèles rejoués, trois vues (aspect ≤ 3), prévision 35 min,
  plafond ; tableau par puces puis points posés au clavier ; ajustement a/b/c sur quatre jeux ;
  expression par cartes (ordre équivalent accepté) ; limites ; grand projet ; boss ; mobile.
- Correctif trouvé par la suite : `CoordPlane.onPointChange` ne passe que le point — `PointPlacer`
  attendait `(id, p)` et le curseur ne bougeait jamais.
