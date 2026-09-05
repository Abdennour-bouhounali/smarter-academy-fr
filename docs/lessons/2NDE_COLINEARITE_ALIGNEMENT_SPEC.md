# 2nde — Colinéarité et alignement — Design & Implementation Spec

> Built 2026-09-05. Sections follow LESSON_DESIGN_PLAYBOOK §15.3; shipped state at the end.

## 1. Identity & curriculum contract

- Key `seconde_colinearite_et_alignement` · id `colinearite-alignement-2nde` (kept from the provisional catalogue) · 📐 · Difficile · free · 70 min.
- Path `/courses/lycee/seconde/geometrie/colinearite-alignement-2nde` — first lesson of the Seconde « Géométrie » domain to be built (directory `apps/web/src/lessons/lycee/seconde/geometrie/`).
- LPs (append-only, `seconde_colinearite-alignement-2nde_P1…P9`): P1 comprendre la colinéarité · P2 reconnaître deux vecteurs colinéaires · P3 proportionnalité des coordonnées · P4 calculer un déterminant · P5 déterminant ⇒ colinéarité · P6 trois points alignés · P7 deux droites parallèles · P8 problème d'alignement · P9 problème de parallélisme.
- Prerequisites: « Vecteurs » (2nde, coming_soon) — coordinates of a vector, of AB, k·u, opposite vector. The diagnostic tests exactly those, never the lesson's own material.

## 2. Central idea & misconceptions

**Central idea:** « même direction » is a visual property (two arrows on the same rail, whatever their length and sense); it is EXACTLY detected by a number computed from the coordinates, det(u, v) = x y' − y x', which is zero when and only when the parallelogram built on u and v is flat. Alignment of three points and parallelism of two lines are the same property read on AB/AC and AB/CD.

Journey: **vecteur → direction → colinéarité → alignement / parallélisme → coordonnées proportionnelles → déterminant → test symbolique.**

| # | Misconception | Confronted | Consequence the student sees |
|---|---|---|---|
| 1 | « même direction » = même sens (a U-turn is « the other direction ») | M1 step 2, boss e1 | v reversed stays on the rail; the direction lamp stays on, the sense lamp flips |
| 2 | collinear vectors must have the same length | M1 step 1 (prediction), boss e2 | v twice as long stays on the rail |
| 3 | « les deux coordonnées ont grandi, donc colinéaires » ((2;1) → (4;3)) | M3 step 2, M4 step 2, boss e2/e7 | v leaves the rail; the cross products differ; det = 2 |
| 4 | det = x y' + y x' (added) or y x' − x y' (order swapped) | M4 step 3 `explainFor`, boss e4 | targeted feedback quoting the wrong operation |
| 5 | aligned ⇔ C between A and B / ⇔ AB = AC | M2 step 1 (C beyond B and beyond A), M2 step 3, boss e6 | C at (−5 ; −2) lights « alignés » with AC of opposite sense |
| 6 | « ça a l'air aligné » (near-collinear) | M2 step 2 (C = (5 ; 4)), M4 step 2, M6 step 2, boss e7 | the eye hesitates, det = ±1 / −3 decides |
| 7 | parallel lines need equal vectors | M6 step 3, boss e8 | CD = −2·AB, det = 0, (AB) ∥ (CD) |

## 3. Signature interaction — « Le rail » (`VectorPlane` + `DirectionLab`)

Two vectors from the same origin O: u (2 ; 1), fixed, violet, with its **rail** (the dashed support line through O); v, emerald, whose tip the student drags on the grid (or steps by components / arrows). State: v's coordinates (integers, v ≠ 0). Visual: v sits on the rail or leaves it; three DOM lamps (direction / sens / longueur) recompute from `compareDirections`. Aha: v can be longer, shorter or reversed and still ride the rail — « même direction » ignores length and sense; the word *colinéaires* arrives in step 3 as the name of « sur le même rail ». Left to later modules: alignment (M2), k and proportional coordinates (M3), the determinant (M4).

Rejected candidates: (a) two moving drones with animated trajectories — animates what the student should manipulate; (b) a k-slider producing v = k·u — hides the « leave the rail » case and gives away M3; (c) a « same direction ? » MCQ over static pairs — no manipulation.

Labels: vector names live in a DOM legend (never in SVG text, so overlapping arrows cannot produce overlapping labels); point names are placed by `labelLayout.placeLabels`, a pure collision-avoiding placer unit-tested on the whole grid of reachable positions.

## 4. Module architecture (8 · 70 min)

| # | Slug | Stage | LPs | min | Responsibility | Interaction |
|---|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | vecteur AB, lecture, k·u, opposé, égalité | kit (+ static `CoordPlane`) |
| 1 | le-rail | trigger | P1 P2 | 9 | same direction ≠ same length/sense; « colinéaires » named last | `DirectionLab`, `PredictionChips`, `Stepper` |
| 2 | trois-points-une-droite | discovery | P6 P1 | 9 | aligned ⇔ AB, AC collinear; C beyond A; the near miss (5 ; 4) | `AlignmentLab` |
| 3 | des-coordonnees-proportionnelles | discovery | P3 P2 | 9 | v = k·u, proportional columns, cross products, y for collinearity | `ScalarLab`, `ProportionTable` |
| 4 | le-detecteur | manipulation | P4 P5 | 10 | det live, parallelogram flattens, sign, |det| = 1 near miss, computing det | `DetLab` |
| 5 | a-retenir | formalization | P1 P3 P4 P5 P6 P7 | 7 | the card: three equivalences, two applications | kit |
| 6 | alignement-et-parallelisme | practice_lab | P6 P7 P8 P9 | 9 | aligned / not, (AB) ∥ (CD), parallelogram, missing coordinate | kit + static `VectorPlane` |
| 7 | mission-finale-le-detecteur | evaluation | — | 13 | 10 QCM | kit `BossFinal` |

## 5. Model — `components/colinUtils.js`

`vecFromPoints`, `addVec`, `scaleVec`, `isZeroVec`, `norm`, `dot`, `det`, `areCollinear`, `collinearityRatio` (k with v = k·u or null), `sameSense`, `compareDirections`, `pointsAligned`, `linesParallel`, `yForAlignment`, `detExpression`/`detText` (French writing with parenthesised negatives), `railEndpoints` (support line clipped to the frame), `fitRange`, `formatVec`, `fr`, `parseSigned`. `components/labelLayout.js`: `placeLabels` (candidate offsets, frame-clamped, collision-scored). Both unit-tested; `placeLabels` is swept over every reachable position of the alignment lab.

## 6. Tests

Unit: `colinUtils.test.js`, `labelLayout.test.js`. E2E `2nde-colinearite.mjs` (vite :5231 from `apps/web/`): index, non-blocking diagnostic, M1 drag/keyboard sweeps with the CTM-aware layout audit, M2 near-miss path, M3 batch wrong-on-purpose, M4 det = 0 goal + sign + `explainFor` traps, M5/M6 wrong-on-purpose, boss silent → score → profil → synthèse → storage → reload, mobile pass at 375 px.

## Shipped state (2026-09-05)

`available`, module sum 70 = catalogue duration (M5 6 min, M6 10 min), validator `9/9 learning points covered` with the repo total unchanged at its 6-error baseline, `vitest` 13/13 for the lesson (label sweeps, including points dropped on an axis), `npm run build` green, e2e `2nde-colinearite.mjs` 55/55 (desktop + mobile, zero console errors), `smarter:import-curriculum` run with no drift. M6 carries the parallelism manipulation (D pivots (CD) around C, det(AB, CD) live) and the five-level alignment ladder.
