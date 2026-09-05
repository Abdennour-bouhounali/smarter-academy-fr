# 2nde — Équations de droites — Design & Implementation Spec

> Built 2026-09-05. Sections follow LESSON_DESIGN_PLAYBOOK §15.3; shipped state at the end.

## 1. Identity & curriculum contract

- Key `seconde_equations_de_droites` · id `equations-de-droites-2nde` · 📈 · Difficile · free · 85 min.
- Route `/courses/lycee/seconde/geometrie/equations-de-droites-2nde` (domain `geometrie` of the seconde JSON).
- LPs (append-only): P1 comprendre un vecteur directeur · P2 identifier un vecteur directeur · P3 comprendre la pente · P4 calculer la pente · P5 équation à partir de deux points · P6 à partir d'un point et d'un vecteur directeur · P7 à partir d'un point et de la pente · P8 comprendre l'équation réduite · P9 comprendre l'équation cartésienne · P10 tracer une droite à partir de son équation · P11 appartenance d'un point · P12 alignement de trois points.
- Prerequisites: Fonctions affines, Vecteurs, Repérage dans le plan. Sequence: Vecteurs → Colinéarité et alignement → **Équations de droites** → Positions relatives (intersections are NOT treated here).

## 2. Central idea & misconceptions

**Central idea:** a line is *a point plus a direction*. Every point M of the line is A + t·u, so its coordinates obey one relation — det(AM, u) = 0 — which, written out, is the equation. The equation is a compact description of the geometric object; a direction vector, a slope, a cartesian equation and a reduced equation are four readings of the same line, each convertible to the others.

| # | Misconception | Confronted | Consequence |
|---|---|---|---|
| 1 | « Un vecteur directeur est unique » / « 2u donne une autre droite » | M1 step 2 (prediction, no verdict) | the line does not move when u is doubled or reversed |
| 2 | « Déplacer A fait tourner la droite » | M1 step 3 | the line slides parallel, direction kept |
| 3 | pente = u_x / u_y or Δx / Δy | M2, boss e3 | staircase: +u_x right then +u_y up |
| 4 | « l'œil suffit pour voir si un point est sur la droite » | M5 (0,1-unit traps) | the eye says yes, the equation says no |
| 5 | y = mx + p covers every line | M4 step 3 | m can grow without limit, the line never becomes vertical; b = 0 in ax + by + c = 0 does |
| 6 | direction vector of ax + by + c = 0 is (a ; b) | M6, boss e9 | (−b ; a) satisfies the equation's increments; (a ; b) is normal |
| 7 | p read as the slope, m as the intercept | M4, boss e7 | changing p slides, changing m rotates around (0 ; p) |
| 8 | alignment tested by « ça a l'air droit » | M5 step 3, M7 | C is aligned iff it satisfies the equation of (AB) |

## 3. Signature interaction — « Le laboratoire des droites » (`LineLab`)

Controlled variables: the point A (drag / steppers) and the direction vector u (tip handle / steppers / ×2, ×½, ×(−1) chips). State: `{ A, u }` with u ≠ 0 and A + u inside the frame. Visual: the line through A of direction u, redrawn at once; the previous line kept as a dashed ghost so a change (or a non-change) is visible. Aha 1: doubling or reversing u leaves the line where it is. Aha 2: moving A slides the line without rotating it. Nothing is named « équation » here; the module ends on the question « comment décrire TOUS les points de cette droite avec des nombres ? ».

Rejected candidates: two draggable points defining the line (hides the direction; that reading is left to M2/M7), a slope slider with the line (introduces the symbol before the gesture), an animation of the line pivoting (the student must cause it).

## 4. Module architecture (9 · 85 min)

| # | Slug | Stage | LPs | min | Responsibility | Interaction |
|---|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | coordonnées de AB, lecture d'un point, image par une fonction affine, coefficient directeur, colinéarité | kit |
| 1 | le-laboratoire-des-droites | trigger | P1 P2 | 9 | point + direction ⇒ une droite ; ku ne change rien ; déplacer A translate | `LineLab`, `PredictionChips`, `Stepper` |
| 2 | des-points-sur-la-droite | discovery | P3 P4 P1 | 9 | M = A + t·u ; chaque pas ajoute u_x et u_y ; pente = u_y/u_x, pente entre deux points | `LineWalker` |
| 3 | de-la-droite-a-l-equation | discovery | P9 P8 P6 | 10 | det(AM, u) = 0 ⇔ M ∈ d ; l'équation cartésienne écrite ; l'équation réduite isolée | `DetTester`, kit |
| 4 | le-laboratoire-des-coefficients | manipulation | P8 P3 P10 P9 | 11 | m tourne autour de (0 ; p), p translate ; b = 0 donne la verticale ; tracer y = −2x + 3 | `CoefficientLab`, `LineBuilder` |
| 5 | ce-point-est-il-sur-la-droite | manipulation | P11 P12 | 8 | prédire puis tester par l'équation ; trois points alignés | `MembershipLab`, kit |
| 6 | a-retenir | formalization | P5 P6 P7 P8 P9 P2 | 7 | la carte des quatre lectures ; les trois façons d'obtenir une équation | kit |
| 7 | atelier-construire-et-resoudre | practice_lab | P5 P6 P7 P10 P11 P4 P12 | 12 | deux points, point + u, point + pente, lire u et m, tracer, problème géométrique | kit + `LineBuilder` |
| 8 | mission-finale-la-droite | evaluation | — | 15 | 10 QCM covering P1–P12 | kit `BossFinal` |

## 5. Model — `components/lineUtils.js`

State `{ A, u }`. Derived only: `cartesianOf`, `reducedOf`, `slopeOf`, `pointAt`, `det`, `residual`, `isOnLine`, `lineFromPoints`, `lineFromSlope`, `directionOfCartesian`, `areAligned`, `clipLine` (via `geometry2d.clipToBox`), `formatCartesian`, `formatReduced`, `formatVec`, `formatPoint`. Vertical lines are first-class: `reducedOf` returns `{ vertical: true, x0 }` and `formatReduced` prints `x = 3`. Integer inputs give integer, gcd-reduced cartesian coefficients with a positive leading coefficient, so the displayed equation is canonical. Equations live in DOM readouts, never in SVG text.

## 6. Layout safety

`CoordPlane` (shared, untouched) computes margins from its tick labels and flips point names near the right edge. Lesson-side rules: A and A + u both stay inside the frame (the tip is a handle, so it must be visible) — steppers and drags clamp; two named points can never share a node (the move is refused); no arrow or curve labels in SVG; equations, coordinates and determinants are DOM readouts. The e2e suite sweeps every slider to both ends and every stepper to its bounds with the CTM-aware `layoutAudit`, at 1280 px and 375 px.

## 7. Tests

`lineUtils.test.js` (vitest) — cartesian canonical form, vertical/horizontal cases, reduced ⇄ cartesian round trips, membership with decimals, alignment, clipping, formatting of long/negative/decimal coefficients. E2E `2nde-equations-droites.mjs` on :5231.
