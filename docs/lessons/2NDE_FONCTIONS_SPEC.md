# 2nde — Fonctions — Design & Implementation Spec

> Built 2026-09-06. Sections follow LESSON_DESIGN_PLAYBOOK §15.3.

## 1. Identity & curriculum contract

- Key `seconde_fonctions` · id `fonctions-2nde` · domain `fonctions` · ƒ · Difficile · free · **85 min** (= module sum).
- Route `/courses/lycee/seconde/fonctions/fonctions-2nde`.
- LPs `seconde_fonctions-2nde_P1…P12` (dépendance · variable · ensemble de définition · image · antécédent ·
  tableau · graphique · expression · registres · modéliser · intervalle · réunion d'intervalles).
- Prerequisites tested by the diagnostic only: image par f(x) = 2x + 1, lecture d'un tableau, point (2 ; −1),
  valeur de 3x² − 1, développer 2(x + 5).
- Curriculum specificity: ensemble de définition, images et antécédents, passage entre registres (expression,
  tableau, graphique), y compris sur des réunions d'intervalles.

## 2. Central idea & misconceptions

**Central idea:** une fonction est une dépendance — choisir la variable fixe une valeur et une seule ; quatre
registres décrivent la même dépendance ; image (unique) et antécédents (0, 1, 2…) ne sont pas symétriques ; la
fonction n'existe que sur son ensemble de définition, parfois en plusieurs morceaux.

| # | Misconception | Confronted | Consequence the student sees |
|---|---|---|---|
| 1 | « la plus grande boîte est pour x = 5 » | M1 step 2 | V(5) = 500 < V(3) = 588 ; la meilleure est 3,5 |
| 2 | « une fonction, c'est une formule » | M1 (aucune formule), M3 | la dépendance existe avant la formule ; trois formules candidates testées |
| 3 | image / antécédent symétriques | M2 steps 1–2, M3 step 4, boss e4/e6 | la sonde verticale touche une fois, l'horizontale deux fois ; f(11) = 25 ≠ antécédent |
| 4 | D_f = ℝ « parce que la formule calcule » | M2 steps 3–4, boss e2 | V(12) « existe » par la formule mais il n'y a pas de boîte |
| 5 | (3x)² pour 3x², x négatif sans parenthèses | M3 step 2 traps | 31 / −8 ciblés par explainFor |
| 6 | le tableau prouve l'absence d'antécédent / donne f(1,5) | M3 step 3 | « le tableau ne le dit pas » |
| 7 | (y ; x) pour (x ; y) | M4 steps 1 & 3, boss e7 | (6 ; 3) n'est pas sur la courbe, (3 ; 6) l'est |
| 8 | « dans le trou, l'image vaut 0 » | M6 step 1, boss e9 | la sonde ne rencontre rien à 13 h |

## 3. Signature interaction — « La boîte » (`BoxLab`)

Une feuille carrée de 20 cm ; un carré de côté x découpé à chaque coin ; pliage. Variable x (glissière 0 → 10 par
0,5, ± , clavier) ; état = x + liste des couples enregistrés ; volume CALCULÉ ; patron + boîte en perspective
(formes SVG sans texte), valeurs dans le DOM ; registres révélés progressivement (volume → tableau → points →
courbe). Aha : « la même découpe redonne le même volume », « ça monte puis ça redescend », « à 0 et 10 il n'y a
pas de boîte ». Prédiction sans verdict (« la moitié ? »). Le mot « fonction » attend le pied de module, la
formule le module 3. Candidats rejetés : la machine mystérieuse (3e), un tarif de parking (peu de courbe), un
tableau à remplir (pas de phénomène).

## 4. Module architecture (9 · 85 min)

| # | Slug | Stage | LPs | min | Responsibility | Interaction |
|---|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | fonctions du collège, repérage, calcul littéral | kit |
| 1 | la-boite | trigger | P1 P2 P10 | 10 | dépendance, variable, plus grande boîte, points sur un repère, domaine | `BoxLab` + `PredictionChips` |
| 2 | image-antecedent-ensemble-de-definition | discovery | P3 P4 P5 P7 | 9 | sonde x = 2 (image), V = 400 (deux antécédents), ]0 ; 10[ | `FunctionProbe` |
| 3 | le-tableau-de-valeurs | discovery | P6 P8 P4 P5 | 9 | trois formules testées, calcul d'image, limites d'un tableau, antécédent = équation | `ValueTable` (shared), `NumericQuestion` traps |
| 4 | du-tableau-a-la-courbe | manipulation | P7 P9 | 9 | placer six points, courbe, test y = f(x), (6 ; 3) | `PlotTable` |
| 5 | quatre-registres | manipulation | P9 P10 P8 | 10 | courbes ↔ expressions, situation → expression → antécédent, choisir le registre, deux expressions une fonction | mini `CoordPlane`s, `ValueTable` |
| 6 | une-fonction-en-morceaux | manipulation | P11 P12 P3 | 9 | la piscine : 13 h sans image, [8 ; 12] ∪ [14 ; 20], tarif par morceaux, 50 nageurs 4 fois | `FunctionProbe` (two pieces) |
| 7 | atelier-modeliser | practice_lab | P10 P4 P5 P7 P9 P11 P12 | 10 | feuille de 30 cm, forfait par paliers, lire une courbe | kit questions + static `CoordPlane` |
| 8 | mission-finale-la-boite | evaluation | — | 15 | 10 QCM, synthèse = carte complète | `BossFinal` |

Knowledge Map: M1 3 · M2 5 · M3 3 · M4 4 · M5 3 · M6 3 · M7 1 = 22 items.

## 5. Mathematical model — `components/fonctionsUtils.js`

Fonction = `{ name, fn, domain }` avec `domain` = réunion d'intervalles ; `imageOf` → nombre ou `null` ;
`antecedentsOf` → liste (échantillonnage + dichotomie) ; `curvePieces` → un morceau par intervalle (bornes
ouvertes retirées) ; `intervalText` / `domainText` (« ]0 ; 10[ », « [8 ; 12] ∪ [14 ; 20] »). Boîte :
`boxVolume`, `boxDomain`, `bestBoxOnGrid` (3,5 → 591,5). Piscine : polyligne en deux morceaux. Tests : 10.

## 6. Shared-component change (additive)

`CoordPlane.readGuides` lit désormais TOUS les morceaux de courbe (image sur celui qui porte x, antécédents
sur chacun) — indispensable pour une fonction sur une réunion d'intervalles ; une courbe unique se comporte
comme avant (tests 19/19).

## 7. Validation

`validate:lessons` 12/12 LPs, zero new errors ; vitest 10/10 ; e2e `2nde-fonctions.mjs` (vite :5241).
