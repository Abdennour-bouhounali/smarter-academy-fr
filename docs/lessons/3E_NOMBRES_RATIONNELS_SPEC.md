# 3e — Nombres rationnels (`nombres-rationnels`) — spec de reconstruction

Leçon **existante**, portée sur le lesson kit (playbook §9, integration guide §11).
Catalogue : clé `3e_nombres_rationnels`, id `nombres-rationnels`, 10 LPs,
`durationMinutes: 85`, emoji ➗, prérequis « Fractions », « Calcul numérique »,
« Nombres relatifs ». Les ids `nombres-rationnels` et
`LESSON_BASE_PATH = /courses/college/3e/nombres_calculs/nombres-rationnels`
sont **conservés** (continuité de progression : les anciennes complétions `L0N`
se normalisent en numéros).

## 1. Audit de l'existant (pré-kit, août 2026)

7 modules hand-rolled sur `ModuleLayout`, sans module 0, sans `BossFinal`,
sans `components/`, gates `useState` sans `isStepLocked`.

Défauts relevés — **explicitement non reconduits** :

| Défaut | Fichier | Conséquence |
|---|---|---|
| `assessment.totalQuestions: 6` mais 4 questions livrées | `lesson.config.js` + `Module07Bilan.jsx` | score plafonné, LP non couverts |
| `score` calculé depuis une closure périmée | `Module07Bilan.jsx` | la dernière réponse ne comptait jamais |
| complétion conditionnée à `score >= 3` | `Module07Bilan.jsx` | élève bloqué sur une évaluation |
| XP attribuée pendant le test | `Module07Bilan.jsx` | test non silencieux |
| LP mapping incomplet (P1…P6 seulement, 5 LPs orphelins) | `lesson.config.js` | couverture 6/10 |

## 2. Gardé / remplacé

**Gardé, extrait dans `components/`** (les seules vraies manipulations de
l'ancienne leçon) :

- `Simplifier.jsx` ← M02 « Transformer » : puces diviseurs, test
  `num % d === 0 && den % d === 0`, trace du trajet, message d'erreur donnant
  la **raison mathématique**, « Recommencer ». Ajouté : le raccourci « ÷ PGCD »,
  les contrôles ≥ 44 px, l'état contrôlé par le module.
- `CommonDenominatorPicker.jsx` ← M03 « AddSous » : candidats de dénominateur,
  les deux fractions ré-écrites **en direct** avec leur facteur. Ajouté :
  candidats-pièges (5, 7), raison du refus, mise en évidence du PPCM.
- Le scénario **budget du club de robotique** ← M06 « Mission » (1/3 moteurs,
  1/4 capteurs, le reste au tournoi) — rejoué en laboratoire (module 7).

**Remplacé intégralement** : M01 et M04 (texte + quiz), M05 (diaporama),
M06 (chaîne de QCM), M07 (quiz-bilan défectueux). Les 7 fichiers d'origine sont
**supprimés** — git est l'archive, aucun `modules/_archive_original/`.

## 3. Signature — « La barre élastique » (`RationalBar`)

Un seul état mathématique `{num, den}` avec l'invariant **`den > 0`** (le signe
est porté par le numérateur). L'élève tape « ×2 », « ×3 », « ÷k » : les traits
de coupe se multiplient ou disparaissent, mais **la longueur coloriée et le
marqueur sur la droite ne bougent pas**. L'équivalence n'est pas une règle de
calcul, c'est une **invariance de position**.

- Négatifs : `−3/4 = 3/(−4) = −(3/4)` normalisent vers le même objet, donc **un
  seul point** à gauche de 0.
- Addition : deux barres empilées (`second`) dont les morceaux ne s'emboîtent
  pas tant qu'elles n'ont pas la même découpe — `CommonDenominatorPicker` pilote
  la re-coupe.
- Figée (`frozen`) dans la synthèse du boss : 2/3 = 4/6 = 6/9.

Autres composants bespoke : `FractionAreaGrid.jsx` (2/3 des 3/4 → 6 cases
vertes sur 12), `StepPicker.jsx` (choisir la prochaine opération autorisée, les
étapes retenues alimentent `CalcChain`).

## 4. Table des modules (9 modules · 85 min)

| # | slug | stage | LPs | min | interaction |
|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | `PrerequisiteDiagnostic`, 5 × 2 pts sur fractions / calcul numérique / relatifs |
| 1 | deux-noms-un-nombre | trigger | P1, P2 | 8 | `RationalBar` : 3/4 = 6/8 = 12/16 = 0,75 ; « rationnel » nommé **après** le geste ; −3/4 = 3/(−4) |
| 2 | rendre-irreductible | discovery | P3 | 9 | `Simplifier` + `RationalBar` qui perd ses coupes ; PGCD en un coup |
| 3 | comparer | discovery | P4 | 9 | `NumberLine` mode `place` en douzièmes + stepper ; négatifs |
| 4 | la-meme-decoupe | manipulation | P5 | 11 | **signature** : 1/2 + 1/3 ne s'emboîtent qu'en sixièmes ; soustraction, résultat négatif |
| 5 | fraction-de-fraction | manipulation | P6, P7 | 10 | `FractionAreaGrid` ; « combien de 1/4 dans 3/2 » → × l'inverse |
| 6 | dans-quel-ordre | formalization | P8, P9 | 9 | `StepPicker` + `CalcChain` ; avec et sans parenthèses ; « À retenir » |
| 7 | le-budget-du-club | practice_lab | P10, P8 | 10 | `BarModel` + 4 étapes ; `NumericQuestion` avec `parse={parseDec}` |
| 8 | mission-finale | evaluation | — | 15 | `BossFinal`, `nr-e1…nr-e10`, synthèse = `RationalBar` figée 2/3 = 4/6 = 6/9 |

Total : **85 min** = `estimatedDurationMin` = `durationMinutes` du catalogue.
Stages non décroissants, module 0 en `teal`/`diagnostic`, boss en `amber`.

## 5. Conceptions erronées visées

| Erreur | Où elle est provoquée | Comment elle tombe |
|---|---|---|
| « 1/4 > 1/2 car 4 > 2 » | M3 étape 2 | découpe commune : 1/4 contre 2/4 ; le quart est à gauche sur la droite |
| « 6/8 > 3/4 car 6 > 3 » | M1 étape 1 | le marqueur ne bouge pas pendant la re-découpe |
| « −3/4 et 3/(−4) sont deux nombres » | M1 étape 4 | l'invariant `den > 0` : un seul point |
| « 1/2 + 1/3 = 2/5 » | M4 étape 3 | 2/5 ≈ 0,4 et 5/6 ≈ 0,833 : deux points différents |
| « je simplifie le haut, j'oublie le bas » | M2 / boss e3 | 9/24 n'est pas 18/24 |
| « multiplier agrandit toujours » | M5 étape 1 | 1/2 est plus petit que 2/3 **et** que 3/4 |
| « diviser rend toujours plus petit » | M5 étape 3 | 3/2 ÷ 1/4 = 6, compté en paquets sur la barre |
| « on calcule de gauche à droite » | M6 étapes 1 et 3 | 1 contre 7/8 : l'ordre change le nombre |
| « la parenthèse se traite en dernier » | M6 étape 2 | la carte est refusée avec sa raison |
| « la part restante = somme des parts » | M7 étape 2 / boss e8 | le tout vaut 12/12 ; 12 − 7 = 5 |

## 6. Boss — carte des LPs

`BossFinal`, 10 épreuves QCM, silencieux jusqu'au submit unique, `timerSeconds:
600`, `xpPerCorrect: 10`, registre de 4 puces, 6 badges 🏅 + 1 💎.

| épreuve | skill | LP | piège encodé dans les distracteurs |
|---|---|---|---|
| nr-e1 | ecritures | P1 | numérateur < dénominateur obligatoire ; entiers positifs obligatoires |
| nr-e2 | ecritures | P2 | 8/6 : retourner ≠ écriture équivalente |
| nr-e3 | irreductible | P3 | 9/24 (haut sans le bas) ; 9/12 (simplification inachevée) |
| nr-e4 | comparer | P4 | inversion de l'ordre chez les négatifs |
| nr-e5 | operations | P5 | 2/5 (dénominateurs additionnés) ; 1/6 (produit au lieu de somme) |
| nr-e6 | operations | P6 | « multiplier agrandit » ; dénominateur conservé |
| nr-e7 | operations | P7 | 3/8 (multiplié sans retourner) ; 3/2 (division « neutre ») |
| nr-e8 | ordre | P8 | ré-additionner au lieu de retirer du tout |
| nr-e9 | ordre | P9 | 7/8 (gauche à droite) ; 7/6 (somme seule) |
| nr-e10 | problemes | P10 | 60 € (un douzième) ; 1 728 € (fraction retournée) |

Synthèse : `RationalBar` figée sur 2/3, 4/6, 6/9 + `FractionAreaGrid` figée sur
6 cases vertes sur 12, « À retenir » et les 4 pièges.

## 7. Utilitaires

`components/rationalUtils.js` — modèle `{num, den}`, invariant `den > 0` :
`gcd`, `lcm`, `normalize`, `rat`, `simplify`, `isIrreducible`, `equivalent`,
`compare`, `add`, `sub`, `mul`, `div`, `inverse`, `opposite`, `toDecimal`,
`isDecimal`, `expandTo`, `commonDivisors`, `commonDenominator`, `formatFrac`
(LaTeX, signe sorti de la fraction), `formatRaw`, `plainFrac`, `texDecimal`.
Ré-exporte `formatDec` / `parseDec` / `roundTo` depuis `@smarter-academy/core`.
`formatDec` émet le **moins typographique français U+2212 (−)**, pas l'ASCII.
`normalize` et `div` **lèvent** sur un dénominateur nul / une division par zéro.

`rationalUtils.test.js` : 22 tests (vitest), dont les trois pièges de la leçon
vérifiés numériquement.

## 8. État livré

- 21 fichiers `esbuild` OK ; `npm run build` OK.
- `npx vitest run …/nombres-rationnels` : **22/22**.
- `npm run validate:lessons` : `3e:nombres-rationnels: 10/10 learning points
  covered`, **zéro erreur et zéro avertissement** mentionnant la leçon (le socle
  du dépôt reste à 54 erreurs / 53 avertissements dans d'AUTRES leçons, dont le
  chantier géométrie 3e en cours).
- e2e : `apps/web/e2e/lesson-kit/3e-nombres-rationnels.mjs`, vite sur le port
  **5205**.
