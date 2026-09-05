# 3e — Calcul littéral et algébrique — Design & Implementation Spec (3e)

> Draft produced by the design pass on 2026-09-03. Sections follow LESSON_DESIGN_PLAYBOOK §15.3; the implementation record (§ Shipped state) is appended at the end of the build.

## B. `calcul-litteral-algebrique` — 𝑥 · Difficile · prereqs : Nombres relatifs, Calcul numérique, Distributivité

### B1. Central idea and misconception catalogue

**Central idea:** an expression is a machine that computes one number for each x; two writings are the *same* expression when they agree for every x — and the area of a rectangle whose sides are written with x shows why développer, réduire and factoriser only change the writing, never the quantity.

| # | Misconception | Detection | Visible consequence | Hint | Recovery |
|---|---|---|---|---|---|
| 1 | « 3x + 2 = 5x » (adding unlike terms) | M3 merge attempt; boss e4 | `TermCards` refuses the merge: the 3 x-tiles and 2 unit tiles cannot stack; `ValueTester` at x = 2 gives 8 vs 10 | « Des tuiles de formes différentes ne s'empilent pas » | Tester reveal with the differing column |
| 2 | « 3x + 2x = 5x² » | M2/M3 merge | Merge produces 5 x-tiles, not a square; the tester agrees | « Additionner des x donne des x » | Tile mirror |
| 3 | « (a + b)² = a² + b² » | M5 prediction; boss e7 | The square of side a + b shows *four* pieces; two ab rectangles are missing from the student's writing; tester 25 vs 13 | « Il manque deux rectangles » | Tap the two missing pieces |
| 4 | « 4(2x − 3) = 8x − 3 » (distributing to the first term only) | M4 step, boss e5 | The rectangle 4 × (2x − 3) has a *second* piece of area 12 that stays grey | « Chaque morceau du côté reçoit le facteur » | Tap the un-multiplied piece |
| 5 | « (x + 3)(x + 2) = x² + 6 » (first × first, last × last) | M4 double distributivity | The 2 × 2 grid shows 4 pieces; two x-strips remain un-counted | « Deux morceaux dorment encore » | Tap the two x-pieces |
| 6 | « Si ça marche pour x = 1, c'est égal » | M3 tester step (3x + 2 vs 5x agree at x = 1) | Tester: equal at 1, different at 2 | « Une valeur ne suffit pas » | Add a second value |
| 7 | « Factoriser 6x + 9 = 3(2x + 9) » (dividing one term only) | M6 factor step; boss e8 | Rebuilding the rectangle 3 × (2x + 9) gives an area of 6x + 27, the tester disagrees | « Chaque terme doit être divisé par 3 » | Re-tap the factor in the second term |
| 8 | « −(x − 4) = −x − 4 » (sign lost) | M3/M4 with negative factor; boss e3 | Tester at x = 0: −(0 − 4) = 4 vs −4 | « Le facteur −1 touche les deux termes » | Reveal |

### B2. Signature interaction — **« Le Rectangle d'aire »** (`AlgebraRect`)

| Facet | Definition |
|---|---|
| Name | Rectangle d'aire (sides written with x, pieces that light up, the sum that assembles itself) |
| Purpose | Make développer (product → sum of pieces) and factoriser (pieces → sides) *the same picture read in two directions* |
| Concept | Distributivity: area of a rectangle = product of its sides = sum of the areas of its pieces; (a + b)² is a square split into a², ab, ab, b² |
| Student action | Taps a side segment to *split* it into its terms (« x + 3 » becomes two segments); taps each piece to *count* it (its area term appears in the sum strip); taps two like pieces to merge them; in reverse mode, taps the factor common to all pieces to *rebuild* a side |
| Visual behaviour | The rectangle is one SVG derived from `sideA`, `sideB` (Term[]); pieces are static rects with widths proportional to a display value of x (x drawn as ≈ 3 units so tiles read distinctly); tapping a piece fills it and appends its term to the sum strip (KaTeX via `MathText`); merging animates the two x-strips sliding together (≤ 500 ms) |
| Feedback | Un-counted pieces stay grey — the incompleteness *is* the feedback; the `ValueTester` sits beneath and confirms product = sum for tapped x values |
| Discovery | Every piece is a product of one term from each side; the total is the sum; « il manque deux rectangles » for (a + b)² |
| Mastery challenge | M6: given the pieces 6x + 9 (and then x² + 6x + 9), rebuild the rectangle by choosing the common side |
| Why memorable | The classic errors (8x − 3, x² + 6, a² + b²) each leave a *visible grey piece* — the mistake has a shape |

Returns in the boss Synthèse as the frozen (a + b)² square with its four pieces labelled, next to the three identities.

**Candidate table:**

| Concept | Candidates | Verdict |
|---|---|---|
| Meaning of an expression (P1) | (a) definition + evaluation drill · (b) input/output machine with an x stepper · (c) **tile border around an n × n garden: three students' formulas, all correct** | **(c)** for the trigger (conflict: three different writings, same count for every n), (b) survives as the `ValueTester` in every later module |
| Terms and factors (P2) | (a) MCQ · (b) **tap the terms, then tap the factors of one term, on `TermCards`** · (c) expression tree | **(b)** — the tap *is* the identification; the tree is over-engineered for 3e |
| Réduire / regrouper (P3, P4) | (a) type the reduced form (MathLive) · (b) **tap two like cards to merge; unlike cards refuse** · (c) count tiles by kind | **(b)** with (c) as a mirror strip — refusal makes « termes semblables » a physical property; typing is excluded (syntax noise, playbook) |
| Développer (P5–P7) | (a) draw the arrows · (b) **split sides / count pieces on `AlgebraRect`** · (c) tester only | **(b)** signature; arrows appear in M6's « À retenir » as the written trace of the pieces |
| Factoriser (P8) | (a) reverse arrows · (b) **tap the common factor in each term card, then the rectangle rebuilds** · (c) guess-and-check by expanding options | **(b)** — reverse of the signature; expansion of the result is the built-in check |
| Equivalence (P9) | (a) assert rules · (b) **`ValueTester` table: tap x chips, compare columns** · (c) tile counting | **(b)** — one differing value kills an equivalence; becomes the verification ritual |
| Identités remarquables (P10) | (a) memorise · (b) **(a + b)² as a split square** · (c) tester for (a − b)² and (a + b)(a − b) with a two-state « découpe et glisse » toggle for a² − b² | **(b) + (c)** — subtraction tiles are unreadable on 375 px; the toggle is one button, static SVG |
| Choosing a transformation (P11) | (a) MCQ « développer ou factoriser ? » · (b) **goal-driven tasks (calculate fast / solve = 0 / read a frame area) with both forms available** · (c) sort tasks into bins | **(b)** — the goal decides, and the hand-off to `equations-produit` is explicit |

### B3. Module architecture (9 modules · 85 min)

| # | Slug | Title | Stage | LPs taught | min | Unique responsibility | Aha | Main interaction |
|---|---|---|---|---|---|---|---|---|
| 0 | `mission-de-depart` | Mission de départ | prerequisite_check | — | 4 | 5 × 2 pts on prerequisites only: sign of a product of relatives, −3 + 8, priorities 2 + 3 × 4, numeric distributivity 7 × 103 = 7 × 100 + 7 × 3, a sum of relatives | — | kit diagnostic |
| 1 | `trois-formules-pour-une-bordure` | Trois formules pour une bordure | trigger | P1, P9 | 8 | Create the need for « même expression » from a conflict: 4n + 4, 4(n + 1), (n + 2)² − n² all count the border | « Trois écritures, la même quantité pour chaque n : c'est la même expression » | K (n stepper on `BorderPattern`) + first `ValueTester` |
| 2 | `termes-et-facteurs` | Termes et facteurs | discovery | P1, P2, P4 | 8 | Vocabulary from gestures: terms are added, factors multiplied; like terms are same-shape tiles | « On additionne des termes, on multiplie des facteurs — et seules les tuiles de même forme s'empilent » | F (`TermCards` select/merge) + `TileBar` mirror |
| 3 | `reduire-sans-se-tromper` | Réduire sans se tromper | discovery | P3, P4, P9 | 9 | Reduction with relatives; the 3x + 2 ≠ 5x trap; one equal value is not a proof | « 3x + 2 n'est pas 5x : mets x = 2 et regarde » | F (`TermCards` merge) + `ValueTester` |
| 4 | `le-rectangle-daire` | Le rectangle d'aire | manipulation | P5, P6, P7 | 11 | Signature: simple then double distributivity as splitting and counting pieces | « Développer, c'est découper le rectangle : chaque morceau est un produit, l'aire totale est la somme » | A/B (`AlgebraRect` split + count) |
| 5 | `le-carre-de-cote-a-plus-b` | Le carré de côté a + b | manipulation | P10, P9 | 10 | The three identities: (a + b)² from the square, (a − b)² and (a + b)(a − b) verified by tester and the cut-and-slide toggle | « (a + b)² n'est pas a² + b² : il manque les deux rectangles ab » | A (`AlgebraRect` square) + `ValueTester` |
| 6 | `factoriser-le-chemin-inverse` | Factoriser, le chemin inverse | formalization | P8, P10, P9 | 10 | Reverse the picture: pieces → sides; recognise x² − 25 and x² + 6x + 9; « À retenir » built from the gestures | « Factoriser, c'est retrouver les côtés du rectangle à partir de ses morceaux » | H (`TermCards` common-factor + `AlgebraRect` rebuild) |
| 7 | `choisir-la-bonne-forme` | Choisir la bonne forme | practice_lab | P11, P9, P8, P5 | 10 | Goal-driven choice: compute (x + 3)² − 9 for x = 97 via x(x + 6); « = 0 » needs the factored form (hand-off to équations produit); frame area (x + 4)² − x² = 8x + 16 | « La bonne écriture dépend de la question : calculer → développée ; = 0 → factorisée » | G (compare forms) + `ValueTester` |
| 8 | `mission-finale-le-jardin-de-maya` | 🏆 Mission finale | evaluation | — | 15 | 10 QCM, badges, Synthèse | — | kit `BossFinal` |

Sum 4+8+8+9+11+10+10+10+15 = **85** ✓.

**Steps and `done` predicates**

- **M1** (1) `BorderPattern` n stepper 1–6, `NumericQuestion` « tuiles de bordure pour n = 2 » (12) — `done: answered`. (2) `TapQuestion` « Quelle formule est juste ? » options 4n + 4 · 4(n + 1) · (n + 2)² − n² · « les trois » (correct) — `done: answered`. (3) `ValueTester` SHOW: three columns, tap n chips — `done: testedValues.size ≥ 3`. (4) `TapQuestion` « 4n + 4 se lit… » (« 4 fois le nombre, plus 4 » correct) — `done: answered`.
- **M2** (1) `TermCards` select mode on 3x² + 5x − 2x + 7: « Touche chaque terme » — `done: selected.size === 4 || revealed`. (2) select mode « Touche les facteurs de 5x » (5, x) — `done: committed`. (3) merge mode: tap 5x then −2x → 3x, `TileBar` mirror — `done: expression.isReduced`. (4) `BatchChoiceQuestion` « termes semblables ? » 4 pairs — `done: answered`.
- **M3** (1) merge 5x − 8 − 2x + 3 → 3x − 5 — `done: isReduced || revealed` (a wrong merge is refused with the tile reason, counts an attempt; escape at 3). (2) merge 4x² − x − 3x² → x² − x — `done: isReduced || revealed`. (3) prediction `TapQuestion` « 3x + 2 = 5x ? » then `ValueTester` with x = 1 (trap equal) and x = 2 — `done: predicted && testedValues.has(2)`. (4) `TapQuestion` −(x − 4) = ? — `done: answered`.
- **M4** (1) `AlgebraRect` 3 × (x + 2): split side, count both pieces — `done: countedPieces === 2`. (2) 4 × (2x − 3): trap piece; sum strip must read 8x − 12 — `done: countedPieces === 2` (grey piece hint after 20 s). (3) (x + 3)(x + 2): split both sides, count four, merge the two x-strips — `done: countedPieces === 4 && merged`. (4) `TapQuestion` (x + 5)(x + 1) with KaTeX options — `done: answered`.
- **M5** (1) prediction `TapQuestion` « (a + b)² = ? » (a² + b² offered) — `done: predicted`. (2) `AlgebraRect` square (a + b)²: count 4 pieces, merge the two ab — `done: countedPieces === 4 && merged`. (3) `ValueTester` a = 3, b = 2 on (a + b)², a² + b², a² + 2ab + b² — `done: testedValues.size ≥ 2`. (4) (a + b)(a − b): the « découpe et glisse » toggle (2 states) then `TapQuestion` writing (a − b)² — `done: toggled && answered`.
- **M6** (1) `TermCards` common-factor mode on 6x + 9: tap the 3 in each term; `AlgebraRect` rebuilds 3 × (2x + 3) — `done: factorSelectedInAllTerms || revealed`. (2) `TapQuestion` recognise x² − 25 → (x + 5)(x − 5) — `done: answered`. (3) x² + 6x + 9: `TapQuestion` « quelle identité ? » then rect rebuild shows (x + 3)² — `done: answered`. (4) « À retenir » card — read-only, `done: true` once step 3 done (no fake interaction).
- **M7** (1) `TapQuestion` « (x + 3)² − 9 pour x = 97 : quelle forme est la plus rapide ? » then `NumericQuestion` (9 991) — `done: answered && computed`. (2) `TapQuestion` « (x + 3)(x − 5) = 0 : quelle forme ? » with hand-off note to Équations produit — `done: answered`. (3) frame area: `AlgebraRect` (x + 4)² minus x² → `TapQuestion` reduced 8x + 16 — `done: answered`. (4) `ValueTester` ritual: check 8x + 16 vs (x + 4)² − x² at two values — `done: testedValues.size ≥ 2`.

### B4. Mathematical model — `components/litteralUtils.js`

State: an expression is `Term[]` with `Term = { coef: number, deg: 0|1|2, id? }` (unreduced, order preserved so cards and pieces keep identity); a product is `{ a: Term[], b: Term[] }`. All display strings derive from these.

| Export | Signature | Invariant |
|---|---|---|
| `reduce` | `(terms) → Term[]` merged by degree, sorted deg desc, zero coefs dropped | `evaluate(reduce(t), x) === evaluate(t, x)` for all x |
| `evaluate` | `(terms, x) → number` | — |
| `areLike` | `(t1, t2) → boolean` | `deg` equality only |
| `mergeTerms` | `(terms, i, j) → Term[] | null` (null when not like) | length shrinks by exactly 1 |
| `expandProduct` | `({a, b}) → Term[]` pieces in grid order (a_i × b_j) | `evaluate(expand, x) === evaluate(a,x)*evaluate(b,x)` |
| `areaPieces` | `({a, b}) → { row, col, term, labelLatex }[]` | same terms as `expandProduct` |
| `commonFactor` | `(terms) → Term` (gcd of coefs, min degree; sign chosen so the leading rest is positive) | — |
| `factorOut` | `(terms) → { factor: Term, rest: Term[] }` | `reduce(expand({a:[factor], b:rest}))` deep-equals `reduce(terms)` |
| `matchSquare` | `(terms) → { a:Term, b:Term, sign:+1|-1 } | null` | expanding the match returns the input |
| `matchDiffSquares` | `(terms) → { a:Term, b:Term } | null` | idem |
| `sameExpression` | `(t1, t2) → boolean` via `reduce` | reflexive, symmetric |
| `testTable` | `(exprs: Term[][], xs) → { x, values:number[], allEqual:boolean }[]` | — |
| `formatTerms` | `(terms, {latex:true}) → string` (signs, 1x → x, −1x → −x, 0 dropped, `x^{2}`) | round-trips through a tiny `parseTerms` used only in tests |
| `formatProduct` | `({a,b}) → string` with parentheses rules | — |
| `evaluateBorder` | `(n) → number` = 4n + 4 | equals `(n+2)² − n²` |

Uses `formatDec, roundTo` re-exports only for the display of the tester with x = 0,5 (M7 optional).

**Unit tests (≥ 6):** (1) `reduce([5x, −8, −2x, +3])` → `3x − 5`, and `reduce` idempotent; (2) `mergeTerms` returns `null` for 3x and 2 (unlike) and `5x` for 3x, 2x; (3) `expandProduct({a:[x,3], b:[x,2]})` → pieces `x², 2x, 3x, 6` and reduced `x² + 5x + 6`; property: evaluation equals product for x ∈ {−3..5}; (4) `expandProduct({a:[4], b:[2x, −3]})` → `8x − 12` (sign carried); (5) `factorOut([6x, 9])` → `{3, [2x, 3]}` and `factorOut([x², 6x])` → `{x, [x, 6]}`; round-trip invariant; (6) `matchSquare([x², 6x, 9])` → `{x, 3, +1}`, `matchSquare([x², −6x, 9])` → sign −1, `matchSquare([x², 5x, 9])` → null; `matchDiffSquares([x², −25])` → `{x, 5}`; (7) `formatTerms` covers `−x`, `x`, `+0`, `x^{2}`, leading minus; (8) `testTable([3x+2, 5x], [1, 2])` → allEqual true at 1, false at 2; (9) `evaluateBorder(n)` equals `(n+2)²−n²` for n 1..10.

### B5. Components

| Component | Props | Used by | Extends / adapts | Interactive nodes |
|---|---|---|---|---|
| `AlgebraRect` (signature) | `product:{a,b}, splitA, splitB, onSplit(side), counted:Set<pieceId>, onCount, merged, onMerge, mode:'expand'|'rebuild'|'square', xUnit=3, revealAll, disabled` | M4, M5, M6, M7, Synthèse | New SVG; decorative pieces `pointerEvents:'none'` under transparent hit rects (`role="button"`, French aria « morceau 3 × x, aire 3x »); merge via one button per like pair | ≤ 2 side buttons + ≤ 4 piece hits + ≤ 2 merge buttons ≈ 8 |
| `TermCards` | `terms:Term[], mode:'select-terms'|'select-factors'|'merge'|'common-factor', selected, onSelect, onMerge(i,j), onFactorTap(termIdx, factorPart), disabled, revealAll` | M2, M3, M6 | Adapts `6e/algorithmique/.../components/ProgramStrip.jsx` tap-card list (no drag); each card renders its term via `MathText`; in `merge` mode the two selected cards slide together (CSS transform, not `animate={{x}}`) | ≤ 6 cards + ≤ 4 sub-parts |
| `ValueTester` | `exprs:{label, terms}[], xs=[0,1,2,3,5,10,-1], tested:Set<number>, onTest, settleMs=350` | M1, M3, M5, M7 | New; table with x chips; values appear after settle (settle-then-number) | ≤ 7 chips |
| `TileBar` | `terms:Term[]` (display) | M2, M3 | Adapts the capped-tile idea of `6e/nombres_calculs/nombres-entiers/components/Base10Blocks.jsx`: x² square, x strip, unit square; ≤ 12 tiles then « ×N » | 0 |
| `BorderPattern` | `n, onChange, showFormulas` | M1 | New; static cells (AreaGrid-style rendering, non-interactive) + stepper | 2 |
| `SlideCutToggle` | `state:0|1, onToggle` | M5 | New, 2-state static SVG (a² − b² → (a + b)(a − b)) | 1 |

### B6. Boss — « Le jardin de Maya »

ids `cl-e1…cl-e10`, KaTeX options via `renderOption` + `optionLabel` for review.

| Épreuve | Skill → module | LP ids | Correct | Classic-mistake distractor |
|---|---|---|---|---|
| cl-e1 « 4n + 4 pour n = 5 » | `sens` → M1 | P1 | 24 | 44 (4 then 4) · 20 (forgot + 4) · 9 |
| cl-e2 « 5x² − 3x + 7 : termes et facteurs » | `termes` → M2 | P2 | « 3 termes ; −3 et x sont les facteurs de −3x » | « 2 termes » · « 4 termes » |
| cl-e3 « Réduire 5x − 8 − 2x + 3 » | `reduire` → M3 | P3, P4 | 3x − 5 | 3x + 5 · 7x − 5 · −2 |
| cl-e4 « 3x + 2 = ? » | `reduire` → M3 | P4, P9 | « ne se réduit pas » | 5x · 5x² · 6x |
| cl-e5 « 4(2x − 3) » | `developper` → M4 | P5, P6 | 8x − 12 | 8x − 3 · 8x + 12 · 6x − 12 |
| cl-e6 « (x + 3)(x + 2) » | `developper` → M4 | P7 | x² + 5x + 6 | x² + 6 · x² + 5x + 5 · 2x + 6 |
| cl-e7 « (x + 4)² » | `identites` → M5 | P10 | x² + 8x + 16 | x² + 16 · x² + 4x + 16 · 2x + 8 |
| cl-e8 « Factoriser 6x + 9 » | `factoriser` → M6 | P8 | 3(2x + 3) | 3(2x + 9) · 6(x + 9) · 3(x + 3) |
| cl-e9 « Deux écritures donnent 7 pour x = 1. Conclusion ? » | `equivalence` → M3 | P9 | « On ne peut pas conclure : tester une autre valeur » | « Elles sont égales » |
| cl-e10 « Résoudre (x + 3)(x − 5) = 0 : quelle forme ? » | `choisir` → M7 | P11, P8 | « la forme factorisée » | « développer d'abord » · « réduire » |

Registre chips: « Bordure 4n + 4 » · « Tuiles x², x, 1 » · « Rectangle (x + 3)(x + 2) » · « Carré (a + b)² ». Badges: 🏅 per skill (`sens`, `termes`, `reduire`, `developper`, `identites`, `factoriser`, `equivalence`, `choisir`) + 💎. Synthèse: frozen `AlgebraRect` in `square` mode with the four labelled pieces, the three identities beneath, and a frozen `ValueTester` row (a = 3, b = 2).

### B7. Narrative thread / carried object

**Le jardin de Maya**: a square garden of side n, its tile border (M1), the tiles themselves become the algebra tiles (M2–M3), the flowerbed rectangle whose sides grow (M4), the square terrace (M5), the pieces to reassemble (M6), the path around the garden and the price to compute (M7). Carried object: **the tiles** (`TileBar` / `AlgebraRect` pieces). Vocabulary once: *expression* (M1), *terme/facteur/termes semblables* (M2), *réduire* (M3), *développer/distributivité* (M4), *identité remarquable* (M5), *factoriser* (M6).

### B8. Risks

- **KaTeX in options**: every `TapQuestion`/boss option is a `renderOption` with `MathText`; provide `correctionLabel`/`optionLabel` plain strings for reveals and review. Test on 375 px that 4 KaTeX options in `cols=2` don't overflow — use `cols=1` for double-distributivity items.
- **Negative pieces**: `AlgebraRect` renders (2x − 3) as a piece with a hatched « − » fill and label −12; do *not* try to draw subtracted area geometrically beyond M4 step 2; (a − b)² is tester-verified by design.
- **x scale**: x drawn as 3 units makes x + 3 look like 6 — label sides with symbols only, never tick marks, to avoid « x = 3 » readings; the tester shows x varies.
- **Merge animation on cards**: CSS transform on `motion.div` with keys, never keyed plain `<div>` in `AnimatePresence`.
- **Scope collision with `equations-produit`**: do not teach solving; M7 step 2 is a hand-off.

---

## Shipped state (2026-09-04)

Built in two passes: the scaffold, `litteralUtils`, the five bespoke components and modules 0, 1, 2, 4 in the first; modules 3, 5, 6, 7 and the boss 8 in the second. Nothing from the first pass was rewritten.

### Files

Created (second pass):
- `apps/web/src/lessons/college/3e/nombres_calculs/calcul-litteral-algebrique/modules/Module03Reduire.jsx`
- `.../modules/Module05CarreAPlusB.jsx`
- `.../modules/Module06Factoriser.jsx`
- `.../modules/Module07ChoisirLaForme.jsx`
- `.../modules/Module08MissionFinale.jsx` (boss)
- `apps/web/e2e/lesson-kit/3e-calcul-litteral.mjs`

Modified: `.../components/TermCards.jsx` — the factor sub-buttons were `min-h-[36px] min-w-[36px]`, below the 44 px floor (playbook §11); raised to 44 px and the wrapper widened from `max-w-[120px]` to `max-w-[150px]`. Caught by the mobile pass on M6; also fixes M2 step 2. No other shared file touched.

Existing and reused unchanged: `lesson.config.js`, `moduleContext.js`, `index.jsx`, `routes.jsx`, `components/{litteralUtils.js, litteralUtils.test.js, AlgebraRect.jsx, TermCards.jsx, TileBar.jsx, BorderPattern.jsx, SlideCutToggle.jsx, learningPoints.js}`, `modules/{Module00Diagnostic, Module01TroisFormules, Module02TermesFacteurs, Module04RectangleAire}.jsx`, and the shared `common/components/ValueTable.jsx` (used as-is for every « tester » step — never forked).

### Module table as built

| # | Slug | Stage | LPs | min |
|---|---|---|---|---|
| 0 | `mission-de-depart` | prerequisite_check | — | 4 |
| 1 | `trois-formules-pour-une-bordure` | trigger | P1, P9 | 8 |
| 2 | `termes-et-facteurs` | discovery | P1, P2, P4 | 8 |
| 3 | `reduire-sans-se-tromper` | discovery | P3, P4, P9 | 9 |
| 4 | `le-rectangle-daire` | manipulation | P5, P6, P7 | 11 |
| 5 | `le-carre-de-cote-a-plus-b` | manipulation | P10, P9 | 10 |
| 6 | `factoriser-le-chemin-inverse` | formalization | P8, P10, P9 | 10 |
| 7 | `choisir-la-bonne-forme` | practice_lab | P11, P9, P8, P5 | 10 |
| 8 | `mission-finale-le-jardin-de-maya` | evaluation | — | 15 |

Total **85 min**, matching `estimatedDurationMin` and the catalogue.

### Steps as built (deltas from B3)

Modules 3, 5, 6, 7 follow the spec's step tables and `done` predicates literally, with two clarifications:
- **M6 step 1** completes on `factorSelectedInAllTerms` implemented as « a `3` tapped in *each* term card » (`atomicFactors` yields `['2','3','x']` for 6x and `['3','3']` for 9, so either 3 of the second card counts). Tapping only one card names the `3(2x + 9)` misconception in the `Feedback` and leaves the rectangle un-rebuilt.
- **M6 step 4** is `done: squareDone` — the read-only « À retenir » card opens as soon as step 3 is answered, with no fake interaction, exactly as specified.
- **M7 step 1** adds a side-by-side « développée / factorisée » card above the choice so both forms are visible before choosing; the `NumericQuestion` uses `parse={parseDec}` + `display={formatDec(9991)}` and has targeted `explainFor` branches for 10 000 (forgot the −9) and 9 409 (squared x instead of x + 3).
- **M7 step 2** ends with a `<Link to="/courses/college/3e/nombres_calculs/equations-produit">` — the explicit hand-off. This lesson states the produit-nul principle but never resolves an equation.

### Boss — « Le jardin de Maya »

10 épreuves `cl-e1…cl-e10`, one submit, silent until then. Registre of 4 chips (bordure 4n + 4 · tuiles x², x, 1 · rectangle (x + 3)(x + 2) · carré (a + b)²). 8 per-skill 🏅 badges (`sens`, `termes`, `reduire`, `developper`, `identites`, `factoriser`, `equivalence`, `choisir`) + 💎 « Jardinier algébriste ». Synthèse: frozen `AlgebraRect` in `square` mode with its four labelled pieces, the three identities, a frozen `ValueTable` row at a = 3 (25 vs 13 vs 25), the four-line « À retenir » and the six pièges.

LP coverage by épreuve — all 11 covered: P1→e1 · P2→e2 · P3→e3 · P4→e3, e4 · P5→e5 · P6→e5 · P7→e6 · P8→e8, e10 · P9→e4, e9 · P10→e7 · P11→e10. Every distractor encodes a misconception taught in the lesson: 44 / 20 (M1), « 2 termes » (M2), 3x + 5 and 7x − 5 (M3), 5x (M2/M3), 8x − 3 (M4 #4), x² + 6 (M4 #5), x² + 16 (M5 #3), 3(2x + 9) (M6 #7), « elles sont égales » after one value (M3 #6), « développer d'abord » (M7).

### Gates

| Gate | Result |
|---|---|
| esbuild (each new file + TermCards) | 6/6 clean |
| vitest `src/lessons/college/3e/nombres_calculs` | 170 passed / 7 files |
| `validate:lessons` | `3e:calcul-litteral-algebrique: 11/11 learning points covered`; zero error or warning lines mention this lesson. Repo totals at the time of the run: 54 errors / 53 warnings, all in other lessons (6e minute caps, 3e géométrie work in flight). |
| `npm run build` (repo root) | ✓ built |
| Playwright `apps/web/e2e/lesson-kit/3e-calcul-litteral.mjs` (:5202) | **110/110 passed**, three consecutive runs, zero console/page errors |
| Mobile 375 × 667 | M1, M2, M3, M4, M5, M6, M7 — no horizontal scroll, every enabled visible button ≥ 40 px |

The e2e covers: index (85 min, no NaN), non-blocking diagnostic, M1's three-formula conflict and value table, M3's refused merge + the x = 1 trap / x = 2 refutation, M4's signature `AlgebraRect` (pieces locked before the split → 2 hit rects → gap quantified at 1/2 → goal at 2/2, then the 8x − 3 trap), M5's square (4 pieces + merge, a² + b² named as two grey pieces), M6's common factor in both terms rebuilding the rectangle, M7's hand-off link, the boss silent → submit → profil → synthèse → reload → « Refaire le test », a seeded revisit with every step open, and wrong-on-purpose paths in M1, M3, M4, M5, M6, M7 that all still progress with the correction visible.

### Notes and remaining problems

- Playwright locator gotchas encountered and encoded in the script: `AlgebraRect`'s piece hit rects are transparent (never "visible") — they are counted and clicked with `{ force: true }`; `ValueTable` chips also carry `aria-pressed`, so option grids are selected with `:not(:has(button[aria-label^="Tester"]))`; KaTeX renders `3(2x+3)` and `8x−12` without spaces and with U+2212, so assertions use `\s*[−-]\s*`.
- Steps unlock sequentially, so the e2e walks each module in order rather than jumping to a step.
- Left alone deliberately: `AlgebraRect`'s sum strip prints `… = 0` when nothing is counted yet (visible in M4 step 3 before the split). `sumStrip` returns `'0'` for an empty sum; the caption beneath says « 4 morceaux encore gris », and M4 was already shipped in the first pass.
- One transient `AuthContext` page error appeared in a single M2-mobile run that overlapped a concurrent `npm run build` invalidating the dev server's module graph; it did not reproduce in three subsequent clean runs.
