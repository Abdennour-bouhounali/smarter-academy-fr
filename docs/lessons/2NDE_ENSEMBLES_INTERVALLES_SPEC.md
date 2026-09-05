# 2nde — Ensembles et intervalles — Design & Implementation Spec

> Built 2026-09-05 (first of the seven 2nde « Nombres et calculs » lessons). Sections follow LESSON_DESIGN_PLAYBOOK §15.3; the shipped state is recorded at the end.

## 1. Identity & curriculum contract

- Catalogue key `seconde_ensembles_et_intervalles` · lesson id `ensembles-et-intervalles-2nde` · path `/courses/lycee/seconde/nombres_calculs/ensembles-et-intervalles-2nde` · 🔢 · Difficile · free · 70 min (= module sum).
- LPs (append-only, authored from the 2nde curriculum data supplied for this batch — they replace the 12 provisional `coming_soon` entries): P1 langage des ensembles · P2 lire/représenter un intervalle · P3 décrire un ensemble par un intervalle · P4 bornes et types · P5 résoudre une situation.
- Prerequisites displayed: Nombres relatifs, Inégalités, Repérage sur une droite (collège knowledge; the diagnostic tests only these).

## 2. Central idea & misconception catalogue

**Central idea:** an interval is the set of ALL real numbers between two bounds — not only the integers — and each bracket decides, independently, whether its bound belongs.

| # | Misconception | Detection | Consequence shown | Recovery |
|---|---|---|---|---|
| 1 | « la borne est toujours acceptée » (1,90 passe) | M1 prediction, M3/M6 batches, boss e4 | 1,90 lands as a hollow red point under « moins de 1,90 » | flip the bracket: the point turns green |
| 2 | « une plage contient une taille par centimètre » | M1 step 2 question | 1,899 accepted, 1,8999 accepted… | « une infinité » revealed with 1,895 / 1,8999 |
| 3 | crochet lu à l'envers (]2 ; 5] contient 2) | M3 step 1/4, boss e3 | notation vs drawing side by side | « tourné vers le nombre = inclus » |
| 4 | [3 ; +∞] (infinity closed) | M3 step 3, boss e5 | the +∞ chip never shows a bracket | « +∞ n'est pas un nombre » |
| 5 | x ≤ 3 → [3 ; +∞[ (direction) | M4 step 3, boss e5 | the revealed half-line points left | « plus petit → vers −∞ » |
| 6 | ≤ ↔ crochet ouvert | M4 steps 1–2, boss e6 | composer verdict + line | strict ↔ ouvert, large ↔ fermé |
| 7 | ∩ = the biggest range / ∪ = the overlap | M2 Venn, M5, boss e2/e8 | two stacked bands, the doubly-covered zone | build then reveal |
| 8 | −3 ∈ ℕ, 0 ∉ ℕ, ℤ ⊂ ℕ | M2 boxes, boss e1 | the number stays visible, crossed, with its right box named | nested boxes |

## 3. Signature interaction — « Le panneau du manège » (`IntervalFilter`)

| Facet | Definition |
|---|---|
| Purpose | make « la borne se décide au crochet » and « tous les nombres entre les bornes » physically visible |
| Student action | tap a height chip or type any height; flip each bound « inclus/exclu »; (M6) build the intersection of two rides |
| Controlled variable | the tested number; then `openLo`/`openHi`; then the bounds (handles) |
| State | `{lo, hi, openLo, openHi}` + `tests[]` in the module; every verdict derived by `contains` |
| Visual behaviour | each test lands on the `RealLine` as a filled green or hollow red point (labels staggered by rows); flipping a bracket recolours the bound's points at once; the verdict list is DOM |
| Aha | 1,899 passes, 1,90 does not; the same two bounds make two different panels |
| Candidates rejected | (a) a textual MCQ per height — no phenomenon; (b) dragging heights onto a line — drop position has no meaning; (c) sorting cards into « passe / refusé » bins — hides the line |

Returns frozen in the boss Synthèse.

## 4. Module architecture (8 modules · 70 min)

| # | Slug | Stage | LPs | min | Unique responsibility | Main interaction |
|---|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | relatifs, inégalités, lecture d'un point | kit diagnostic (+ inline `RealLine`) |
| 1 | le-manege | trigger | P2 P4 | 8 | the phenomenon; notation as conclusion, nothing named | `IntervalFilter`, `PredictionChips` |
| 2 | le-langage-des-ensembles | discovery | P1 | 7 | ∈ ∉ ⊂ ∩ ∪ ∅ from sorting gestures | `SetBoxes`, `VennSorter` |
| 3 | quatre-crochets | discovery | P2 P4 | 8 | name « intervalle », four types, ∞ open | `IntervalBuilder` + `BuildCheck` |
| 4 | inegalite-ou-intervalle | manipulation | P3 P4 | 10 | inequality ↔ interval both ways, direction trap, decimals | `IntervalBuilder`, `InequalityComposer` |
| 5 | croiser-deux-intervalles | formalization | P1 P4 P5 | 8 | À retenir; I ∩ J, I ∪ J, ∅ | two-band `RealLine` + builder |
| 6 | situations | practice_lab | P5 P3 | 10 | two rides, vaccine, plan, count integers | builder → numeric/tap only |
| 7 | mission-finale-la-fete-foraine | evaluation | — | 15 | 10 QCM, badges, Synthèse | kit `BossFinal` |

Done predicates: M1 (1) prediction chosen (no verdict) (2) ≥ 4 tests incl. 1,2 and 1,9 + infinity question (3) `openLo && !openHi` (4) notation read · M2 all numbers placed (formative, immediate correction) · M3/M4/M5/M6 builds: `BuildCheck` — right, or 2 attempts then reveal with ghost (always completes).

## 5. Mathematical model — `components/intervalUtils.js` (15 tests)

`interval` (normalised, infinite bound always open) · `contains` · `notation` / `texNotation` · `inequality` · `typeOf` · `sameInterval` · `intersect` · `union` (null when disjoint) · `integersIn` · `SETS`/`smallestSet` · `divisorsOf`/`vennRegion`.

## 6. Shared infrastructure added (additive)

- `common/components/RealLine.jsx` + `realLineLayout.js` (14 tests): bidirectional real line in CSS-pixel units (ResizeObserver), points (open/closed), intervals with brackets and infinite ends, several keyboard-operable handles, `onPick`, label rows without collisions, width-bounded tick labels, `inline` variant for `<p>` prompts.
- `ModuleLayout` (`levelId`/`gradeId` props) and `LessonIndex` (Lycée label) breadcrumb fixes, defaults unchanged for every collège lesson.

## 7. Layout safety & tests

- Unit: `realLineLayout.test.js` sweeps six ranges × five widths (300–1000 px): edge labels inside the frame, neighbours separated; `placeLabels` dense sweep.
- E2E `apps/web/e2e/lesson-kit/2nde-ensembles-intervalles.mjs` (port 5230, 62 checks): index, diagnostic, every module with wrong-on-purpose paths, keyboard slider sweeps with the CTM-aware `layoutAudit`, boss silent → submit → profil → synthèse → reload, mobile M1 pass (no h-scroll, targets ≥ 40 px, six stacked labels).

## Shipped state (2026-09-05)

`available`, validator 5/5 LPs, zero errors from this lesson, e2e 62/62, catalogue duration 70 = module sum.
