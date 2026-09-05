# 2nde — Vecteurs — Design & Implementation Spec

> Built 2026-09-05. Sections follow LESSON_DESIGN_PLAYBOOK §15.3; shipped state at the end.

## 1. Identity & curriculum contract

- Key `seconde_vecteurs` · id `vecteurs-2nde` (pre-authored in the catalogue as `coming_soon`; kept) · ➡️ · Difficile · free · 90 min.
- Directory `apps/web/src/lessons/lycee/seconde/geometrie/vecteurs-2nde/`, route `/courses/lycee/seconde/geometrie/vecteurs-2nde`.
- 14 LPs (`seconde_vecteurs-2nde_P1…P14`, append-only): P1 égalité · P2 vecteur nul · P3 représentant · P4 addition · P5 produit par un réel · P6 colinéaires · P7 base orthonormée · P8 lire les coordonnées · P9 calculer les coordonnées · P10 norme · P11 coordonnées de AB · P12 distance · P13 milieu · P14 résoudre un problème.
- Prerequisites (catalogue): Repérage dans le plan, Translations, Coordonnées — the 3e lesson `translations-vecteurs-3e` is the natural predecessor; Pythagore is assumed for the norm.

## 2. Central idea & misconceptions

**Central idea:** a vector is a DISPLACEMENT — direction, sens, longueur — described independently of where it starts. Two numbers (its coordinates in an orthonormal basis) capture it completely, so chaining, reversing and stretching displacements become additions and multiplications, and geometric statements (parallélogramme, milieu, alignement) become calculations.

| # | Misconception | Confronted | Consequence the student sees |
|---|---|---|---|
| 1 | « Même déplacement = même arrivée » | M1 step 2 (prediction, no verdict) | same recipe from another start lands elsewhere |
| 2 | « Déplacer la flèche change le vecteur » | M2 step 1 | the components never move while the arrow travels |
| 3 | « Sens contraire = autre direction » | M2 step 3, boss e2 | opposé : même direction, même longueur, sens contraire |
| 4 | Coordonnées de AB : départ − arrivée, ou composantes échangées | M3 step 3 `explainFor`, boss e8 | the sign flips the arrow |
| 5 | « u + v est plus long que u et v » / la somme se lit bout à bout | M4 step 1–2 | tip-to-tail: the sum is the direct trip, coordinates add |
| 6 | k < 0 « change la direction » | M5 step 1 | k = −1 keeps the line, reverses the sens |
| 7 | ‖u‖ = x + y, or ‖2u‖ = 4‖u‖ | M6 step 1 `explainFor` | the hypotenuse of the staircase |
| 8 | Milieu = (xB − xA)/2 | M6 step 3 | I must satisfy AI = IB |
| 9 | Ordre des sommets du parallélogramme (ABCD ⇔ AB = DC) | M8 step 1 | the quadrilateral only closes when the equality holds |

## 3. Signature interaction — « Le robot du dépôt » (`DisplacementLab`)

Concrete situation: a warehouse robot on a tiled floor must reach a station. Controlled variable: the robot's position (drag on the plane, D-pad buttons, keyboard arrows). State: `start`, `pos` (and a second robot in reproduce mode). Derived: the trace arrow start→pos, the "recette" in words (« 3 à droite, 2 vers le haut »), `diagnose(model, mine)` (direction / sens / longueur). Aha: two robots given the same recipe from different starts arrive at different places yet moved « pareil »; the return recipe is the opposite of the outgoing one. The word « vecteur » is written only in the module footer, as the name of the recipe. Rejected candidates: a table of moves (no space), a maze (position, not displacement), a slider on a number line (one dimension).

The whole lesson reuses the plane: `VectorLab` (move / build), `SumLab`, `ScaleLab`, `NormLab`, each exposing exactly the concept's own variable. Every arrow label and point name is placed by `labelLayout.placeLabels` (collision-aware, frame-clamped) — never at a fixed offset.

## 4. Module architecture (10 · 90 min)

| # | Slug | Stage | LPs | min | Responsibility | Interaction |
|---|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | coordonnées, relatifs, translation du collège, Pythagore | kit |
| 1 | le-robot-du-depot | trigger | P3 | 10 | displacement = recipe; same recipe elsewhere; the return recipe | `DisplacementLab` |
| 2 | le-meme-vecteur | discovery | P1 P2 P3 | 8 | représentants, égalité, vecteur nul, opposé, notation | `VectorLab` move |
| 3 | deux-nombres-suffisent | discovery | P7 P8 P11 | 9 | base (i, j), coordinates read then computed (xB − xA ; yB − yA) | `VectorLab` build + escalier |
| 4 | enchainer-les-deplacements | manipulation | P4 P2 P9 | 10 | tip-to-tail sum, coordinates add, Chasles, u + (−u) = 0 | `SumLab` |
| 5 | etirer-inverser | manipulation | P5 P6 P9 | 9 | k·u : sens and length, k = 0, colinéarité | `ScaleLab` |
| 6 | mesurer-un-vecteur | manipulation | P10 P12 P13 P7 | 9 | norm from the staircase (Pythagore), distance AB, milieu | `NormLab` |
| 7 | a-retenir | formalization | P1 P2 P4 P5 P6 P8 P9 P10 P11 P12 P13 | 6 | the card + checks | kit |
| 8 | problemes-de-geometrie | practice_lab | P14 P3 P11 P13 P6 | 10 | parallélogramme, missing displacement, alignement | `VectorLab` + kit |
| 9 | mission-finale-le-depot | evaluation | — | 15 | 10 QCM covering P1–P14 | kit `BossFinal` |

## 5. Model — `components/vecteurUtils.js` (tested)

Points and vectors are `{x, y}` in student coordinates (y up). Re-exports `vec, add, scale, norm, dist, midpoint, cross` from `common/utils/geometry2d`; adds `sub, equal, isZero, opposite, attributesOf, diagnose, DIAGNOSIS_TEXT, areColinear, colinearFactor, isParallelogram, fourthVertex, formatNum, formatVec, describeMove, normText, inRange, clampToRange, RANGE, SCENES`.
`components/labelLayout.js` (tested over a grid sweep): `placeLabels(labels, obstacles, frame)` — candidate anchors around each anchor point / perpendicular to each arrow, greedy pick of the first collision-free candidate, frame clamp as a last resort.

## 6. Layout invariant

RANGE is −6…6 on both axes (13 ticks, every label drawn). Every control clamps so that every point and every arrow tip stays inside RANGE (a move that would leave the frame is refused, the readout says why). Numeric readouts (coordinates, norms, recipes) live in the DOM under the plane, never in SVG text. SVG text is limited to short names (A, B, u, k·u, +3, −2, 🤖); each is placed by `placeLabels`. The e2e suite sweeps every stepper/slider to both bounds (including the zero vector and the full 12-unit diagonal) at 1280 px and 375 px and runs `layoutAudit` + `domOverflow` at each stop.

## 7. Tests

- `vecteurUtils.test.js`, `labelLayout.test.js` (vitest, apps/web).
- E2E `apps/web/e2e/lesson-kit/2nde-vecteurs.mjs` (vite :5231): index, non-blocking diagnostic, every lab driven to its extremes, wrong-on-purpose paths that still progress, boss silent → submit → profil → synthèse → reload, mobile pass.

## Shipped state (2026-09-05)

`available`, module sum 90 = catalogue duration, validator `14/14 learning points covered` with the repo total unchanged at its 6-error baseline, `vitest` 27/27 for the lesson (label sweeps included), `npm run build` green, e2e `2nde-vecteurs.mjs` 72/72 (desktop + mobile, zero console errors), `smarter:import-curriculum` run (one lesson row updated, learning points already present).
