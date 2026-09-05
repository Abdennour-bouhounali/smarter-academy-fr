# 2nde — Positions relatives de deux droites — Design & Implementation Spec

> Built 2026-09-05. Sections follow LESSON_DESIGN_PLAYBOOK §15.3; shipped state at the end.

## 1. Identity & curriculum contract

- Key `seconde_positions_relatives_droites` · id `positions-relatives-droites-2nde` · domain `geometrie` ·
  ✖️ · Difficile · free · **70 min** (= module sum).
- Route `/courses/lycee/seconde/geometrie/positions-relatives-droites-2nde`.
- LPs (append-only, ids `seconde_positions-relatives-droites-2nde_P1…P8`): P1 reconnaître deux droites
  parallèles · P2 reconnaître deux droites sécantes · P3 comparer les pentes · P4 utiliser les équations
  pour le parallélisme · P5 déterminer le point d'intersection · P6 résoudre le système associé ·
  P7 interpréter graphiquement une intersection · P8 résoudre un problème géométrique avec deux droites.
- Prerequisites (curriculum): Équations de droites, Systèmes simples, Vecteurs. The diagnostic tests only
  those (read m and p, slope from two points, coordinates of a vector, collinearity by determinant, solve
  2x + 1 = −x + 4).
- Curriculum specificity: « on décide si deux droites sont parallèles ou sécantes à partir de leurs
  équations, et on détermine leur point d'intersection par la résolution d'un système ».

## 2. Central idea & misconceptions

**Central idea:** two lines have 0, 1 or infinitely many common points. Their *direction* (a vector, a
slope, the coefficients of the equation) decides between sécantes and parallèles; their *position* then
decides between strictement parallèles and confondues. The common point of two secant lines is the common
solution of their two equations.

> **Vectors describe direction, equations describe lines, and together they determine how two lines
> relate.** (the final synthesis, said by the boss's Synthèse only)

| # | Misconception | Confronted | Consequence the student sees |
|---|---|---|---|
| 1 | « deux droites qui ne se coupent pas sur le dessin sont parallèles » | M1 lab, M4 far intersection, boss e1 | the lines leave the frame secant; zooming out or the algebra finds I at (60 ; 31) |
| 2 | « pour rendre parallèle, il faut déplacer la droite » (position vs direction) | M1 step 2, M2 | moving B never changes the number of common points; only v does |
| 3 | « même pente ⇒ même droite » | M3 steps 1–2, boss e2/e4 | p₂ slides the line without breaking parallelism; confondues needs p equal too |
| 4 | « pentes différentes ⇒ peut-être parallèles quand même » / equality of p decides | M3 step 3, boss e2 | m₁ ≠ m₂ ⇒ sécantes whatever p |
| 5 | « une droite verticale a une pente » / slope comparison always works | M2 step 4 | v(0 ; 3): pente n'existe pas, det = 6 ≠ 0 tranche |
| 6 | 2x − 4y + 8 = 0 and y = 0,5x + 2 « sont différentes » (cartesian ≠ reduced) | M3 step 3, boss e4 | proportional coefficients ⇒ same line |
| 7 | solving m₁x + p₁ = m₂x + p₂ : forgetting to move the x term, or not dividing | M4 step 2 `explainFor`, boss e5/e6 | targeted hints on the trap values 4 and 6 |
| 8 | « le système n'a pas de solution ⇒ je me suis trompé » | M4 step 4, boss e7/e8 | no solution ⇔ strictement parallèles; infinity ⇔ confondues |

## 3. Signature interaction — « Le laboratoire des deux droites » (`TwoLinesPlane`, `HandlePad`)

Concrete: two drones fly straight at constant altitude; seen from above their paths are two lines on the
map grid — will the paths cross? Where? Can they cross twice?

- **Controlled variables** (the concept's own): line (d₁) = point A + direction u, line (d₂) = point B +
  direction v. Four handles (A, tip of u, B, tip of v): tap a chip, then drag on the plane, use the
  4-arrow pad, or the keyboard (arrows/Home/End/PageUp/PageDown on the plane's `role="slider"`).
- **State**: `{ A, u, B, v }` integers on the ±6 grid, u ≠ 0, v ≠ 0. Everything else is derived through
  `droitesUtils` (`lineFromPointVector` → canonical `{a, b, c}` → `relativePosition`, `intersection`).
- **Visual**: two full lines clipped to the frame, their direction arrows, the intersection point I (amber)
  when it exists inside the frame; DOM readouts: A, u, B, v, « points communs : 1 / 0 / une infinité », I's
  exact coordinates (fractions), « hors du cadre » when I exists but is not drawn.
- **Aha**: moving B alone never changes the number of common points; making v collinear to u makes I vanish
  everywhere at once; sliding B onto (d₁) makes *every* point common — three configurations, three counts.
- **Mathematical question left to M2**: without the drawing, with only the four couples of numbers, can we
  decide? Rejected candidates: two sliders on m and p (M3's job, hides direction vectors), dragging two
  points per line (four points, no direction object), an animation of a rotating line (nothing to
  manipulate).

The same plane returns in M2 (only v moves), M3/M4 (lines driven by m₂/p₂ with `ParamSlider`), M6 (frozen)
and the boss's Synthèse (frozen, three configurations).

## 4. Module architecture (8 · 70 min)

| # | Slug | Stage | LPs | min | Responsibility | Interaction |
|---|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | m and p, slope, vector coords, det, one equation | kit |
| 1 | le-laboratoire-des-deux-droites | trigger | P1 P2 | 9 | produce sécantes → parallèles → confondues; direction vs position | `TwoLinesPlane` + `HandlePad` + `PredictionChips` |
| 2 | la-direction | discovery | P3 P1 | 9 | det(u, v) = 0 ⇔ parallèles; pente = v_y / v_x; vertical trap | `TwoLinesPlane` (v only) |
| 3 | les-equations | discovery | P4 P1 P2 | 9 | m₁ = m₂ ⇔ parallèles; p decides confondues; cartesian ⇔ reduced | `ParamSlider` m₂/p₂ |
| 4 | le-point-dintersection | manipulation | P5 P6 P7 | 11 | I moves with (d₂); I leaves the frame; solve the system; interpret 0/1/∞ solutions | `ParamSlider` + zoom chips + `NumericQuestion` |
| 5 | a-retenir | formalization | P1–P7 | 7 | the decision procedure as one card, built from the gestures | kit |
| 6 | deux-trajectoires | practice_lab | P8 P5 P6 P7 | 8 | crossing paths, parallel roads, parallel through a point, (AB) ∥ (CD) — visual support removed step by step | frozen plane, then none |
| 7 | mission-finale-le-croisement | evaluation | — | 13 | 10 QCM | kit `BossFinal` |

Stages are non-decreasing; every LP is taught by a non-evaluation module and assessed by the boss.

## 5. Mathematical model — `components/droitesUtils.js`

- **Canonical line**: `{ a, b, c }` integers, ax + by + c = 0, reduced by gcd, sign-normalised (a > 0, or
  a = 0 and b > 0). Built from a point and an integer direction (`lineFromPointVector`), from a reduced
  equation with decimal m, p (`lineFromSlopeIntercept`), or from two points (`lineFromTwoPoints`).
- **Derived, never stored**: `directionOf` (−b ; a) reduced, `slopeOf` (rational or `null` for a vertical
  line), `reducedEquation`, `cartesianText/Tex`, `lineText/Tex`, `isOn`, `parallelThrough`, `yAt`, `xAt`.
- **Relations** (exact integer arithmetic, no eps): `det(u, v)` reuses `geometry2d.cross`;
  `relativePosition` → `'secantes' | 'paralleles' | 'confondues'`; `commonPointsCount` → 1 / 0 / ∞;
  `intersection` → exact rational `{ x: {n, d}, y: {n, d} }` via Cramer, `null` otherwise. Invariant tested:
  `intersection === null ⇔ relativePosition !== 'secantes'`, and I lies on both lines.
- **Rationals**: `frac(n, d)` reduced with d > 0; `fracText` (0,5 · 7/3 · −1/3) and `fracTex`; decimals are
  shown only when they terminate within two places (0,5, 0,25), fractions otherwise. The mathematics is never
  rounded; only the display is.
- **Frames**: `frameFor(halfSpan)` → `{ range, step, unit }` with a bounded tick count (±6 → 1, ±15 → 2,
  ±40 → 5); `clipLine(line, range)` → the visible chord (`geometry2d.clipToBox`).

## 6. Layout safety — `components/labelLayout.js`

SVG texts are limited to what identifies the objects: « (d₁) », « (d₂) », « A », « B », « I ». Every number
lives in the DOM (equations, coordinates, determinant), so digit count can never collide with the drawing.
`placeAlongLine` and `placeAroundPoint` choose among ranked candidates the first box that is inside the frame
and clear of: both line chords, the arrows, the handle discs, the tick-label strips of both axes, the axis
names and already-placed labels; a label with no free spot is dropped (the DOM legend still identifies the
line) — never overlapped. `labelLayout.test.js` sweeps the u × v × A × B grid and asserts every placed box
is free; the e2e suites sweep the handles and sliders with the CTM-aware `layoutAudit` at 375 px and desktop.

## 7. Tests

- `droitesUtils.test.js`: canonical forms, the three relations, Cramer intersections, verticals, equation
  text, frames.
- `labelLayout.test.js`: grid sweep of reachable configurations.
- E2E `2nde-positions-relatives.mjs` (vite :5231): index, non-blocking diagnostic, M1 handles + pad +
  prediction without verdict + escape hatch, M2 det, M3 sliders, M4 zoom + far intersection + trap values,
  M5/M6 wrong-on-purpose, boss silent → score → profil → synthèse → reload, mobile M1/M4 pass, zero errors.

## Shipped state

See the end of the file once the gate chain has run.
