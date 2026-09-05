# 3e — Puissances (`puissances-3e`) — design spec

Catalogue key `3e_puissances` · lesson id `puissances-3e` · 8 modules · 77 min · emoji 🚀
Base path `/courses/college/3e/nombres_calculs/puissances-3e`.

**Idée centrale, jamais énoncée avant d'avoir été vécue :** l'exposant est un
**compte de facteurs**. La leçon n'ouvre donc pas sur « a^n se lit a puissance
n » mais sur une feuille qu'on plie — 2, 4, 8, 16, 32 épaisseurs — jusqu'à ce
que le besoin d'un nom court se fasse sentir. Les trois règles de calcul se
LISENT ensuite sur un compte de blocs, jamais avant.

## 1. Audit de l'existant (leçon pré-kit, août 2026)

| Fichier | Verdict |
|---|---|
| `modules/Module01Decouverte.jsx` (612 l.) | **partiellement gardé** — l'explorateur libre base/exposant (étape 8) est extrait en `components/PowerExplorer.jsx`. Le reste (MathInput typé, `useAdaptiveExercise`, `setTimeout` d'auto-avance) est remplacé. |
| `modules/Module02Puissances10.jsx` (153 l.) | **gardé** — le curseur d'exposant qui déplace la virgule, la meilleure manipulation du lot, devient `components/DecimalShifter.jsx` (contrôlé, tap-first, settle-then-number, virgule qui glisse visiblement). |
| `modules/Module03ReglesCalcul.jsx` (245 l.) | **remplacé** — drills tapés au clavier, règles énoncées avant le geste. |
| `modules/Module04EcritureScientifique.jsx` (202 l.) | **remplacé** — saisie coefficient/exposant, aucune manipulation. Remplacé par `SciNotationBuilder`. |
| `modules/Module05Mission.jsx` (243 l.) | **gardé** — le zoom cosmique avec son ensemble visité devient `components/UniverseScale.jsx` + `components/universeItems.js` (une seule donnée numérique par objet, l'écriture scientifique est calculée). |
| `modules/Module06Bilan.jsx` (688 l., non commité) | **converti en données** — précurseur hand-rolled du `BossFinal` du kit. Ses 7 épreuves, son registre, ses skills et ses badges sont repris dans `modules/Module07MissionFinale.jsx`, re-mappés sur les nouveaux LP ids et le nouveau numéro de module par compétence. |
| `lesson.config.js`, `moduleContext.js`, `routes.jsx`, `index.jsx` | **remplacés** — ancien bloc `assessment`, `TOTAL_MODULES`, `getModuleNav`, `LessonContext` inutilisé, ids `L0N`, pas de `lastModuleNumber`. |

Tous les anciens fichiers `modules/` ont été supprimés une fois l'e2e vert.
L'archive est git ; pas de `modules/_archive_original/`.

## 2. Table des modules

| # | slug | stage | LPs | min | responsabilité / interaction |
|---|---|---|---|---|---|
| 0 | `mission-de-depart` | prerequisite_check | — | 4 | `PrerequisiteDiagnostic` — 5 QCM × 2 pts sur les prérequis catalogue (Calcul numérique, Multiplication, Fractions) : ordre des opérations, 2×2×2, ×100, ÷10, 1/100. |
| 1 | `le-pliage` | trigger | P1, P2 | 8 | `PaperFold` — plier une feuille, les épaisseurs doublent (2, 4, 8, 16, 32) ; le produit écrit en entier devient illisible → le nom court `2^5` arrive à l'étape 2. |
| 2 | `la-tour-des-facteurs` | discovery | P3, P4 | 10 | `PowerExplorer` (repris) + `PowerTower` dépilée jusqu'à 0 puis en dessous → a⁰ = 1, a⁻ⁿ = 1/aⁿ. |
| 3 | `empiler-les-tours` | manipulation | P5 | 11 | **SIGNATURE** `PowerTower` : fusion, retranchement, répétition → les trois règles lues sur le compte de blocs. |
| 4 | `la-virgule-qui-glisse` | manipulation | P6, P7 | 10 | `DecimalShifter` (repris) + `MagnitudeStrip` — 3,45 × 10ⁿ, n de −4 à 6, ordres de grandeur. |
| 5 | `ecriture-scientifique` | formalization | P8, P9 | 9 | `SciNotationBuilder` — la virgule bouge, l'exposant suit, la valeur reste ; 1 ≤ a < 10. |
| 6 | `lechelle-de-lunivers` | practice_lab | P10, P11 | 10 | `UniverseScale` (repris) + comparaisons et rapports d'ordres de grandeur. |
| 7 | `mission-finale` | evaluation | — | 15 | `BossFinal` — 10 épreuves `pu-e1…pu-e10`, synthèse = tours figées + shifter figé. |

Total : **4 + 8 + 10 + 11 + 10 + 9 + 10 + 15 = 77 min**, égal à `durationMinutes` du catalogue.

## 3. Interaction signature — « La tour des facteurs » (`PowerTower`)

**Activity** — empiler des blocs « ×a » ; l'écriture compacte a^n s'écrit toute
seule à partir du nombre de blocs.
**Mathematical objective** — l'exposant est un COMPTE ; les trois règles se
lisent sur ce compte.
**Student action** — taper « × a » pour empiler, taper un bloc pour dépiler,
« Fusionner » / « Retrancher » / « Répéter ×2 ».
**Controlled variable** — n (et n₂ pour la seconde tour).
**Mathematical state** — `{ base, n }` ; valeur, écriture et hauteur dérivées
par `pow` / `mergeTowers` / `splitTowers` / `repeatTower`.
**Visual consequence** — à la fusion, les blocs de B viennent physiquement se
poser sur A en violet, B affiche « versée dans A » et l'exposant sous A passe
à m + n ; au retranchement, les blocs du sommet de A sont barrés et grisés.
**Expected observation** — les blocs s'ajoutent, donc les exposants s'ajoutent.
Les bases, elles, ne bougent jamais.
**Misconception targeted** — « 3² × 3³ = 9⁵ » et « 3² × 3³ = 3⁶ ».
**Feedback** — l'écart en nombre de blocs est chiffré tant que la cible n'est
pas atteinte ; après l'opération, le compte est relu explicitement.
**Formalization** — les trois règles écrites à l'étape 4, après les trois gestes.
**Scaffolding** — tap-first intégral, aucun glisser ; « Je ne trouve pas —
montre-moi » après 3 réglages infructueux ; cap de 12 blocs rendus par tour
avec badge « ×N de plus ».
**Transfer** — reprise figée dans la synthèse du boss.

## 4. Composants

| Composant | Props | Nœuds interactifs |
|---|---|---|
| `PowerTower.jsx` | `base, n, onChange, n2, onChange2, mode('single'\|'merge'\|'split'\|'repeat'), k, onCombine, combined, minN, maxN, frozen, label` | ≤ 12 blocs/tour + 5 boutons ≤ 29 |
| `PaperFold.jsx` | `folds, onChange, maxFolds, showCompact, frozen` | 2 boutons (bandes SVG décoratives, ≤ 32 rects) |
| `PowerExplorer.jsx` | `base, n, onBaseChange, onExpChange, bases, minN, maxN, frozen` | 5 puces + 2 boutons + 1 curseur = 8 |
| `DecimalShifter.jsx` | `mantissa, n, onChange, minN, maxN, frozen` | 2 boutons + 1 curseur = 3 |
| `MagnitudeStrip.jsx` | `value, picked, onPick, minExp, maxExp, revealed, label` | ≤ 13 boutons |
| `SciNotationBuilder.jsx` | `value, shift, onChange, maxShift, frozen` | 2 boutons |
| `UniverseScale.jsx` | `items, index, onChange, visited, frozen` | 6 puces + 2 boutons = 8 |

Utils `components/powerUtils.js` : `pow, expand, tower, towerValue, mergeTowers,
splitTowers, repeatTower, shiftDecimal, formatShift, commaMove, toScientific,
fromScientific, isValidMantissa, orderOfMagnitude, magnitudeRatio, formatPower,
formatExpanded, formatScientific, formatAsFraction` ; ré-export de `formatDec,
parseDec, roundTo`. 22 tests vitest.

`shiftDecimal` travaille sur la CHAÎNE des chiffres et non sur `mantissa *
10**n` : le produit flottant donne 0,000345000000004 pour 3,45 × 10⁻⁴.
`formatDec` émet le moins typographique français U+2212 (−), pas le tiret ASCII.

## 5. Misconceptions travaillées

| # | Erreur | Où elle est mise en scène | Correction |
|---|---|---|---|
| 1 | « 2⁵ = 2 × 5 = 10 » | M1 étape 3 (après avoir compté 32 bandes) ; boss e1, e2 | La feuille affiche 32 épaisseurs — l'exposant COMPTE les facteurs, il n'en est pas un. |
| 2 | « a⁰ = 0 » | M2 étape 3 (dépiler jusqu'au sol) ; boss e4 | Chaque cran divise par la base : 343, 49, 7, **1**. La tour vide vaut 1. |
| 3 | « 10⁻² = −100 » | M2 étape 4 ; M4 étape 2 ; boss e7 | Le « − » porte sur l'exposant : 1/100 = 0,01, petit et positif. |
| 4 | « 3² × 3³ = 9⁵ » (on multiplie aussi les bases) | M3 étape 4 ; boss e5 | À la fusion, aucun bloc ne change de base — seule la hauteur change. |
| 5 | « 3² × 3³ = 3⁶ » (on multiplie les exposants) | M3 étape 4 ; boss e5 | 2 + 3 = 5 blocs. Multiplier les exposants, c'est la règle de la RÉPÉTITION. |
| 6 | « 7⁶ ÷ 7⁴ = 7¹⁰ » | M3 étape 2 ; boss e6 | Retrancher, c'est enlever des blocs : 6 − 4. |
| 7 | Sens du décalage de la virgule inversé | M4 étape 1 ; M5 étape 4 ; boss e8, e9 | n > 0 → droite (le nombre grandit) ; n < 0 → gauche. |
| 8 | « 38 × 10⁻⁵ est une écriture scientifique » | M5 étape 3 ; boss e8 | 1 ≤ a < 10 : 38 trop grand, 0,38 trop petit — les valeurs sont justes, les écritures non. |
| 9 | Comparer les coefficients avant les exposants | M4 étape 4 ; M6 étape 2 ; boss e10 | L'exposant décide en premier : 2 × 10⁵ > 9 × 10³. |
| 10 | Rapport = somme des exposants | M6 étape 3 (`explainFor(28)`) ; boss e10 | Un rapport se lit en soustrayant : 21 − 7 = 14. |

## 6. Carte LP ↔ épreuves du boss

10 épreuves QCM, ids `pu-e1…pu-e10`, couvrant les 11 LPs :

| Épreuve | Skill (→ module) | LPs |
|---|---|---|
| `pu-e1` pliage → 2⁵ | notation (1) | P1 |
| `pu-e2` lire 4³ | notation (1) | P2 |
| `pu-e3` calculer 3⁴ | calculer (2) | P3 |
| `pu-e4` 7⁰ et pourquoi | calculer (2) | P4 |
| `pu-e5` 3² × 3³ | regles (3) | P5 |
| `pu-e6` 7⁶ ÷ 7⁴ | regles (3) | P5 |
| `pu-e7` 8 × 10⁻⁶ et la virgule | dix (4) | P6, P7 |
| `pu-e8` écriture scientifique de 0,00038 | scientifique (5) | P8 |
| `pu-e9` 12 700 000 → 1,27 × 10⁷ | scientifique (5) | P9 |
| `pu-e10` galaxie / Terre | problemes (6) | P10, P11 |

Trois épreuves sont NOUVELLES par rapport au bilan pré-kit : `pu-e1` (P1),
`pu-e4` (P4), `pu-e9` (P9). Registre de 4 puces, 6 badges 🏅 par compétence +
1 badge 💎 sans faute, timer 600 s, 10 XP par bonne réponse.

## 7. État livré

- Validateur : `3e:puissances-3e: 11/11 learning points covered`, zéro erreur
  mentionnant la leçon.
- Vitest : 22 tests verts (`components/powerUtils.test.js`).
- Playwright : `apps/web/e2e/lesson-kit/3e-puissances.mjs`, **79/79**, dont un
  passage mobile 375×667 sur M1, M3, M4 et M6, et zéro erreur console.
- `npm run build` vert.
