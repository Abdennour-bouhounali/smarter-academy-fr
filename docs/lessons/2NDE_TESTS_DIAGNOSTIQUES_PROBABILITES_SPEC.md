# 2nde — Tests diagnostiques — Design & Implementation Spec

> Rétro-documenté depuis le code le 2026-09-09 (la leçon existait sans spec). Sections selon LESSON_DESIGN_PLAYBOOK §15.3.

## 1. Identity & curriculum contract
- Key `seconde_tests_diagnostiques` · id `tests-diagnostiques-probabilites-2nde` · domain `statistiques_probabilites` · 🎲 · **81 min**.
- Route `/courses/lycee/seconde/statistiques_probabilites/tests-diagnostiques-probabilites-2nde`. LPs `seconde_tests-diagnostiques-probabilites-2nde_P1…P11`.
- Specificity : « En Seconde, faux positifs, faux négatifs, sensibilité et spécificité d'un test sont analysés avec les probabilités conditionnelles, comme application majeure du programme. » (`level_specificity`, objet officiel `tests_diagnostiques`).
- Neighbours NOT repeated : probabilités conditionnelles (P_A(B) générique, sans vocabulaire médical), arbres pondérés (chemins génériques) — cette leçon est l'application terminale : elle réutilise l'inversion du conditionnement sur un cas concret (test médical) mais introduit son propre vocabulaire (VPP, prévalence, sensibilité, spécificité) et n'y revient pas ailleurs.

## 2. Central idea & misconceptions
La fiabilité d'un test (sensibilité, spécificité) n'est pas la fiabilité d'un résultat (valeur prédictive) : P(test+ \| malade) et P(malade \| test+) sont deux quotients calculés dans deux univers différents, et quand la maladie est rare, même un test très sensible produit plus de faux positifs que de vrais positifs, donc une valeur prédictive positive basse.

| # | Misconception | Confronted |
|---|---|---|
| 1 | Croire qu'un test positif signifie une quasi-certitude d'être malade (99 %) | M1 step 1 (`PredictionChips`), boss `td-e1`/`td-e2` |
| 2 | Confondre faux positif et faux négatif | M2 step 1/2, boss `td-e3`/`td-e4` |
| 3 | Confondre sensibilité et spécificité (répondre le taux d'erreur au lieu du complément) | M3 step « La spécificité », boss `td-e5`/`td-e6` |
| 4 | Inversion du conditionnement : prendre la sensibilité (99 %) pour la valeur prédictive positive | M4 step 2, M5 affirmation `a1`, boss `td-e8` |
| 5 | Juger le test « mal conçu » alors que le taux de faux positifs vient de la prévalence, pas de la qualité du test | M5 affirmation `a2`, boss `td-e9` |
| 6 | Croire qu'un test négatif « ne prouve rien » à cause des faux négatifs | M5 affirmation `a3` |

## 3. Signature interaction — « Dix mille personnes, quatre groupes » (`TestPopulationLab`)
Le module 1 (trigger) commence par une prédiction a priori sans recalcul (`PredictionChips` : « Environ 99 % » / « Environ 50 % » / « Moins de 20 % » de risque d'être malade si le test est positif), puis un stepper à 4 clics (`population` → `sante` → `test` → `positifs`) piloté par `TestPopulationLab step={step} params={REFERENCE}`. Chaque clic change l'ensemble de groupes affichés dans la `PopulationBar` (largeurs proportionnelles aux effectifs) et la légende sous le graphique ; le dernier clic (`positifs`) révèle la disproportion visuelle entre 495 faux positifs (orange) et 99 vrais positifs (rouge), déclenche une animation de feedback et débloque le `KnowledgeBrick` « quatre-groupes ». Rien n'est glissé : c'est une navigation par étapes cliquables, à effectifs fixes (`REFERENCE`) — les curseurs (glisser la prévalence/sensibilité/spécificité) n'apparaissent que plus tard, dans `PpvExplorer` au module 4.

## 4. Module architecture (7 · 81 min)
| # | Slug | Stage | LPs | min | Interaction |
|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 5 | diag |
| 1 | dix-mille-personnes | trigger | P1 P2 | 15 | `TestPopulationLab` |
| 2 | les-quatre-cases | discovery | P3 P4 P5 | 13 | vocabulaire faux positif/négatif |
| 3 | sensibilite-et-specificite | discovery | P6 P7 | 13 | lecture sensibilité/spécificité |
| 4 | le-test-est-positif-et-alors | formalization | P8 P9 P10 | 15 | `PpvExplorer` (3 curseurs) |
| 5 | atelier-affirmations | practice_lab | P11 P9 | 10 | 4 affirmations générées par `.map()` (voir ci-dessous) |
| 6 | mission-finale-le-test | evaluation | — | 10 | `BossFinal` (10 épreuves) |

Le module 5 (`Module05AtelierAffirmations.jsx`) construit ses étapes par `AFFIRMATIONS.map((a, i) => ({...}))` sur les 4 affirmations de `data.js`, chaque `TapQuestion` traduisant `a.correct` (booléen) en index d'option (« Vrai »/« Faux »).

Le module 4 utilise `PpvExplorer` : trois curseurs (`<input type="range">`) pour prévalence, sensibilité, spécificité (bornes dans `SLIDERS`), avec recalcul en direct des effectifs VP/FP et de la VPP ; l'étape n'est validée qu'après avoir exploré une prévalence ≤ 2 % ET ≥ 20 %, pour faire toucher du doigt que la VPP dépend fortement de la prévalence.

Knowledge Map : M1 1 · M2 1 · M3 1 · M4 2 · M5 1 = 6 items.

## 5. Mathematical model — `data.js`
`POPULATION = 10000`, `REFERENCE = { prevalence: 0.01, sensitivity: 0.99, specificity: 0.95 }`, `counts(params)` (via `diagnosticCounts` du noyau partagé `common/stats`, calcule les 4 cases VP/FN/FP/VN), `scenario(params)` (fusionne `counts()` avec `diagnosticIndicators()` : `ill, healthy, positive, negative, total, prevalence, sensitivity, specificity, ppv, npv`), `populationGroups(params)` (4 groupes ordonnés atteints-d'abord pour `PopulationBar`), `SLIDERS` (bornes des 3 curseurs du module 4 : prévalence 0,001–0,4 pas 0,001 ; sensibilité et spécificité 0,8–1 pas 0,005), `AFFIRMATIONS` (4 affirmations `{id, claim, correct, verdict, explain, lp}` pour le module 5, dont une seule vraie — `a4` — pour que l'atelier ne soit pas « toujours faux »). Tests : 14, dont un bloc dédié au paradoxe central.

**Vérification numérique** — avec prévalence 1 %, sensibilité 99 %, spécificité 95 %, sur 10 000 personnes :
- Malades = 100, Sains = 9 900.
- Vrais positifs = 100 × 0,99 = **99**. Faux négatifs = 100 − 99 = 1.
- Vrais négatifs = 9 900 × 0,95 = **9 405**. Faux positifs = 9 900 − 9 405 = **495**.
- Total positifs = 99 + 495 = **594**.
- **VPP = 99 / 594 ≈ 0,1667, soit ≈ 16,7 %.**

Ce résultat est garanti par test, exact et strictement borné :
```js
it('donne une VPP d'environ 16,7 % — le cœur de la leçon', () => {
  const s = scenario();
  expect(s.positive).toBe(594);
  expect(s.ppv).toBeCloseTo(99 / 594, 10);
  expect(s.ppv * 100).toBeGreaterThan(16.5);
  expect(s.ppv * 100).toBeLessThan(17);
});

it('rend le PARADOXE net : la VPP est très inférieure à la sensibilité', () => {
  const s = scenario();
  expect(s.sensitivity - s.ppv).toBeGreaterThan(0.7);
});

it('produit plus de faux positifs que de vrais positifs', () => {
  const c = counts();
  expect(c.falsePositive).toBeGreaterThan(c.truePositive * 3);
});
```
Un test complémentaire (`counts()` → `toEqual({ truePositive: 99, falseNegative: 1, falsePositive: 495, trueNegative: 9405 })`) fige les 4 effectifs exacts. C'est la garantie exécutable que la pédagogie (un test à 99 % de sensibilité donne malgré tout une valeur prédictive positive de seulement ~17 % sur une maladie rare) ne peut pas être cassée silencieusement par un re-réglage de `REFERENCE`.

## 6. Validation
`validate:lessons` 11/11 LP couverts ; vitest 14/14 ; e2e `apps/web/e2e/lesson-kit/2nde-tests-diagnostiques.mjs` (vite :5254).
