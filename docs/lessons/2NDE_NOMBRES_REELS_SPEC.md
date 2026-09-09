# 2nde — Nombres réels — Design & Implementation Spec

> Built 2026-09-05. Sections follow LESSON_DESIGN_PLAYBOOK §15.3; the shipped state is recorded at the end.

## 1. Identity & curriculum contract

- Key `seconde_nombres_reels` · id `nombres-reels-2nde` · `/courses/lycee/seconde/nombres_calculs/nombres-reels-2nde` · ℝ · Difficile · free · 67 min (= module sum).
- LPs: P1 ensemble ℝ · P2 représenter sur une droite · P3 décimaux / rationnels / irrationnels · P4 écritures exactes et approchées · P5 comparer et encadrer.
- Prerequisites displayed: Fractions, Nombres relatifs, Puissances.

## 2. Central idea & misconceptions

**Central idea:** every real is a point of the line; zooming ×10 gives one more digit and a finer bracket; some numbers land on a graduation (décimaux), some loop (rationnels non décimaux), some do neither (irrationnels). The exact writing (√2, 1/3, π) is the only complete name; a decimal writing is a bracket.

| # | Misconception | Where confronted | Consequence shown |
|---|---|---|---|
| 1 | « en zoomant assez, tout nombre tombe sur une graduation » | M1 prediction (no verdict), zoom ×10⁶ | √2 stays between two ticks at every level; 1,5 lands at once |
| 2 | « √2 = 1,414 » | M1, M4 square panel, boss e3/e7 | (1,414)² = 1,999396 ≠ 2 |
| 3 | « 1/3 = 0,33 », « une fraction est décimale » | M3 division, M5 =/≈ batch | remainder 1 returns; period highlighted |
| 4 | « une racine est toujours irrationnelle » | M2 √9, M5 √25, boss e2 | √9 = 3 ∈ ℕ |
| 5 | troncature = arrondi | M4, boss e6 | next-digit rule on the lab |
| 6 | arrondir en cours de calcul | M5 | 39 vs 37,7 |
| 7 | √n = n/2 | M6, boss e8/e10 | squares bracket |

## 3. Signature interaction — « Le zoom infini » (`ZoomLine`)

Controlled variable: zoom level k (0..6) and the number. State `{spec, k}`; window, digits, bracket and « tombe pile » derived from exact digits (`longDivision`/`expandDigits` for rationals, digit strings for √2, π). Visual: window [lo ; lo+10⁻ᵏ] with ten subdivisions, the point recoloured green when it sits on a tick, one new digit highlighted, encadrement in DOM. Aha: 1,5 lands, √2 never, 1/3 repeats. Rejected candidates: a static decimal expansion (no cause/effect), a calculator display (hides the line), a slider on the digits (proxy variable).

Precedent for exactness: `roundTo(…, 10)` in `ticksBetween` — the default 6-dp rounding collapsed all ticks at step 10⁻⁷ (found by the e2e layout sweep, pinned by a unit test).

## 4. Module architecture (8 · 67 min)

| # | Slug | Stage | LPs | min | Responsibility | Interaction |
|---|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | fractions, relatifs, carrés | kit |
| 1 | le-zoom-infini | trigger | P1 P2 P5 | 9 | three behaviours, bracket reading, nothing named | `ZoomLine`, `PredictionChips` |
| 2 | les-familles-de-nombres | discovery | P1 P3 | 9 | ℕ⊂ℤ⊂𝔻⊂ℚ⊂ℝ from expansions | `FamilySorter` |
| 3 | decimal-ou-pas | discovery | P3 P4 | 9 | the remainder decides; finite or periodic, always; exact vs ≈ | `FractionExpander` |
| 4 | exact-ou-approche | manipulation | P4 P5 | 10 | bracket/troncature/arrondi at 10⁻ᵏ; (arrondi)² ≠ 2; 6π exact | `RoundingLab` |
| 5 | a-retenir | formalization | P1 P3 P4 | 8 | card, family batch, rounding-late reflex, =/≈ | kit |
| 6 | encadrer-et-comparer | practice_lab | P5 P2 | 11 | √10 by squares (integers, tenths), ordering, field diagonal | `SquareBracketer`, shared `OrderingGame formative` |
| 7 | mission-finale-la-diagonale | evaluation | — | 15 | 10 QCM | kit `BossFinal` |

## 5. Model — `components/realsUtils.js` (12 tests)

`reduce`, `isDecimalFraction` (only 2 and 5 in the reduced denominator), `longDivision` (remainder trace, period detection), `expandDigits`, `decimalText` (sign-aware), `classify`/`familiesOf`, `truncatedDigits`, `bracketAt`, `landsAt`, `roundedAt`, `sqrtIntegerBracket`, `sqrtTenthBracket`, `squareOfDecimal`.

## 6. Tests

E2E `2nde-nombres-reels.mjs` (48 checks): 14 zoom levels audited for label overlap, wrong-on-purpose paths everywhere, boss flow, mobile M1 at ×10⁶ (7-decimal ticks, no h-scroll, targets ≥ 40 px).

## Shipped state (2026-09-05)

`available`, validator 5/5, zero errors from this lesson, e2e 48/48, duration 75 = module sum.
