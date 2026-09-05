# 3e — Multiples et diviseurs — Design & Implementation Spec (3e)

> Draft produced by the design pass on 2026-09-03. Sections follow LESSON_DESIGN_PLAYBOOK §15.3; the implementation record (§ Shipped state) is appended at the end of the build.

## A. `multiples-diviseurs` — 🔢 · Moyen · prereqs : Nombres entiers, Multiplication, Division

### A1. Central idea and misconception catalogue

**Central idea:** « 36 = 4 × 9 » is one fact read in two directions — 36 is a multiple of 4 and of 9, 4 and 9 are divisors of 36 — and it is *visible* as a 4 × 9 rectangle of tiles; a prime is a number whose only rectangle is the stick 1 × n, and every number is built from primes in exactly one way.

| # | Misconception (as the student says it) | Detection | Visible consequence | Hint | Recovery |
|---|---|---|---|---|---|
| 1 | « 4 est un multiple de 36 » (direction confusion) | M1 step 4 / M2 batch: picks the reversed sentence | The rectangle reading is re-shown: 36 tiles, 4 rows — the *big* number is the multiple | « Le multiple, c'est le nombre de carreaux ; le diviseur, c'est le nombre de rangées » | Batch reveal shows both sentences side by side with the rectangle |
| 2 | « Un diviseur, c'est quand ça se divise (même avec un reste) » | M1: student says 5 rows "works" for 36 | The 36th chair hangs alone in red under the 5 × 7 rectangle, badge « reste 1 » | « Un diviseur laisse un reste de 0 — regarde la chaise seule » | Try 6 rows → complete rectangle, no red tile |
| 3 | « 1 est un nombre premier » / « 2 n'est pas premier car il est pair » | M5 batch; M4 bâton test on 2 | Rectangle-Détecteur on 1: only *one* rectangle (1 × 1, the two sides coincide) → a prime needs *exactly two* divisors; on 2: stick 1 × 2 = exactly two | « Premier = exactement deux diviseurs, pas "un seul rectangle" » | Batch reveal with the divisor count of 1 (=1) and 2 (=2) |
| 4 | « 51 / 57 / 91 sont premiers » (odd, not obviously composite) | M5 batch, boss e6 | Sieve strikes 51 when tapping 3 (5+1 = 6); FactorTree opens 91 = 7 × 13 | « Additionne les chiffres » / « Essaie 7 » | Sieve animation replay |
| 5 | « Un multiple de 6 et de 8, c'est 6 + 8 = 14 » or « 6 × 8 = 48 forcément le plus petit » | M7 bus step, boss e5/e10 | Two hop-sets on the line: 24 lights up as the *first* common point, 48 later, 14 never | « Le premier point commun, pas la somme ni le produit » | NumberLine hop replay |
| 6 | « 2² × 9 × 5 est une décomposition en facteurs premiers » (a leaf is not prime) | M6 tree: leaf 9 left unopened | The leaf 9 keeps a dashed amber ring (not prime = not a leaf yet); the tree refuses to close | « 9 se découpe encore » | Tap 9 → 3 × 3 |
| 7 | « Deux arbres différents donnent deux décompositions différentes » | M6 step 2 prediction | The two trees' leaves sorted side by side are identical | « Trie les feuilles » | Sorted leaves animation |
| 8 | « Divisible par 3 ⇔ dernier chiffre 3, 6 ou 9 » | M3 step 3, boss e3 | On the 1–50 grid, multiples of 3 form *diagonals*, not columns — the last digit changes every time | « Regarde la somme des chiffres, pas le dernier » | Digit-sum readout on each tapped cell |

### A2. Signature interaction — **« Le Rectangle-Détecteur »** (`RectangleArray`)

| Facet | Definition |
|---|---|
| Name | Rectangle-Détecteur (N tiles, one row-count control, a divisor card that fills itself) |
| Purpose | Make « diviseur = reste 0 » and « les diviseurs vont par paires » physically visible |
| Concept | d divides n ⇔ n tiles form a complete d-row rectangle; the pair (d, n/d) is one product fact read two ways |
| Student action | Taps a row-count chip (1–10) or the −/+ stepper; taps « Garder cette paire » when the rectangle is complete |
| Visual behaviour | Tiles re-flow into r rows of ⌊n/r⌋; leftover tiles fall into a red « reste » tray under the rectangle. A complete rectangle gets an emerald outline; the pair « r × q » is stamped onto the *carte d'identité* of n (its divisor list, growing and auto-sorting). When r > q the stamped pair appears mirrored (« 9 × 4 — déjà trouvée ») |
| Feedback | Consequence-based: the remainder tray *is* the feedback (« il reste 1 chaise »). No verdict text before the student's own reading |
| Discovery | Divisors come in pairs; past the square root the pairs mirror; a prime yields only the stick 1 × n |
| Mastery challenge | M4: find all 9 divisors of 36 by stamping, and *stop on your own* when the pairs mirror; then 24; then classify 13, 21, 23 by trying rows |
| Why memorable | The student *causes* the leftover chair; the divisor list writes itself from their gestures; the prime "stick" is a shape they remember |

Returns in the boss Synthèse as a frozen 36-tile array with all five pairs stamped, next to the frozen factor tree of 60.

**Candidate table (≥ 3 per major concept):**

| Concept | Candidates | Verdict |
|---|---|---|
| Multiple/diviseur relation (P1, P2) | (a) definitions then MCQ · (b) **tile array with a row-count control, remainder tray** · (c) `EqualShareBoard` distribution with leftover · (d) number-line hops | **(b)** — one action (choose r) yields *either* a complete rectangle *or* a visible remainder; the pair is read off the shape. (c) is 6e-flavoured and hides the pairing; (d) shows multiples well but not divisors — kept as a secondary visual in M2 |
| Divisibility criteria (P3) | (a) criteria table then drill · (b) **paint multiples on a 10-wide 1–50 grid, read the column/diagonal pattern** · (c) a "criteria machine" that hides all digits but the last · (d) sort numbers into bins | **(b)** with the digit-sum readout on each cell — columns for 2/5/10 make « dernier chiffre » obvious; diagonals for 3/9 make « ce n'est pas le dernier chiffre » obvious, and the readout supplies the digit sum |
| Prime numbers (P6, P9) | (a) definition + check · (b) **sieve of Eratosthenes on the same 1–50 grid** · (c) **Rectangle-Détecteur: primes only make sticks** · (d) MCQ | **(c) for discovery (M4) then (b) for identification (M5)** — the stick gives meaning, the sieve gives a method up to 50 and the « pourquoi s'arrêter à 7 » reasoning |
| Prime factorisation (P7) | (a) **tap-first factor tree: tap a composite leaf, pick a pair from chips** · (b) division ladder (÷2, ÷2, ÷3…) · (c) recursive rectangle splitting | **(a)** — the tree makes "not yet prime" a *visible unfinished state*; the ladder is shown as the *written* form in the same module after the gesture. (c) collapses visually beyond 2 levels |
| Using the decomposition (P8, P10) | (a) list divisors and intersect · (b) **two decompositions side by side, tap common primes (→ simplification/tiling), union (→ coincidence)** · (c) bus timeline with two hop-sets | **(b)** as the tool, **(c)** as the trigger context of the bus problem — the timeline validates the union answer visually |

### A3. Module architecture (9 modules · 85 min)

| # | Slug | Title | Stage | LPs taught | min | Unique responsibility | Aha | Main interaction |
|---|---|---|---|---|---|---|---|---|
| 0 | `mission-de-depart` | Mission de départ | prerequisite_check | — | 4 | 5 closed questions × 2 pts on **declared prerequisites only**: place value/order of whole numbers, a multiplication table fact, a product estimate, a euclidean division with remainder (« 47 = 5 × 9 + 2 »), reading a remainder | — | kit `PrerequisiteDiagnostic` |
| 1 | `les-36-chaises` | Les 36 chaises | trigger | P1, P2 | 8 | Create the *need* for the words multiple/diviseur from the remainder | « Un reste nul, c'est ça un diviseur — et 36 = 4 × 9 se lit dans les deux sens » | F/K (row-count on `RectangleArray`, SHOW/TRY form) |
| 2 | `deux-lectures-du-meme-produit` | Deux lectures du même produit | discovery | P1, P2, P5 | 9 | Distinguish the *infinite list* of multiples from the *finite paired set* of divisors | « Les multiples de 4 ne s'arrêtent jamais ; les diviseurs de 36 sont une liste finie qui va par paires » | C (`NumberLine` read: tap successive multiples) + kit batch |
| 3 | `la-grille-des-multiples` | La grille des multiples | discovery | P3, P5 | 9 | Discover the criteria for 2, 5, 10 (last digit) and 3, 9 (digit sum) from grid patterns | « Pour 2, 5, 10 : regarde le dernier chiffre. Pour 3 et 9 : additionne les chiffres » | H (paint cells on `NumberGrid`) |
| 4 | `le-rectangle-detecteur` | Le Rectangle-Détecteur | manipulation | P4, P6 | 11 | Signature: all divisors by pairs, mirror at √n, the prime stick; introduces the word *nombre premier* after the gesture | « Un nombre premier n'a qu'un rectangle : le bâton 1 × n » | F/K (`RectangleArray`, full) |
| 5 | `le-crible` | Le crible | manipulation | P6, P9 | 9 | Method to *identify* primes to 50 + reasoning (1 is not prime, 2 is the only even prime, why stop at 7) | « Après 2, 3, 5, 7, tout ce qui reste jusqu'à 50 est premier » | H (strike multiples on `NumberGrid` via prime chips) |
| 6 | `larbre-des-facteurs` | L'arbre des facteurs | formalization | P7, P9 | 10 | Decompose until only primes remain; uniqueness (two trees, same leaves); the written form 60 = 2² × 3 × 5; « À retenir » | « Peu importe par où on coupe : les feuilles sont toujours les mêmes » | F (`FactorTree` tap-a-leaf, pick a pair) |
| 7 | `le-labo-des-decompositions` | Le labo des décompositions | practice_lab | P8, P10 | 10 | Use decompositions on authentic problems: simplify 84/126, tile 84 × 126 cm, buses every 12 and 18 min | « Les facteurs communs donnent le plus grand carreau ; tous les facteurs réunis donnent le prochain rendez-vous » | G (`PrimeVenn` compare two decompositions) |
| 8 | `mission-finale-la-fete-du-college` | 🏆 Mission finale | evaluation | — | 15 | 10 QCM, silent, badges, Synthèse | — | kit `BossFinal` |

Sum 4+8+9+9+11+9+10+10+15 = **85** ✓ · stages non-decreasing ✓ · every LP taught by ≥ 1 non-evaluation module ✓.

**Steps and `done` predicates**

- **M1** (1) `TapQuestion` prediction « 36 chaises en 5 rangées égales : ça tombe juste ? » — `done: predicted`. (2) `RectangleArray` n=36, chips 1–10: `done: stampedPairs.length ≥ 2` (any two complete rectangles kept). (3) n=37: `done: triedRows.size ≥ 4 || revealed` (escape hatch after 4 tries: « Aucun rectangle sauf le bâton »). (4) `BatchChoiceQuestion` 3 rows « vrai/faux » (36 multiple de 4 · 4 diviseur de 36 · 4 multiple de 36) — `done: answered`.
- **M2** (1) `NumberLine` 0–40 mode `read`: « Touche les multiples de 4 dans l'ordre » — `done: hits.length ≥ 6` (wrong taps stay marked grey, correct ones emerald; escape after 3 wrong). (2) `TapQuestion` « Le plus grand multiple de 4 ? » correct = « Il n'y en a pas » — `done: answered`. (3) `RectangleArray` n=12, read-only pairs pre-stamped: `TapQuestion` « combien de diviseurs a 12 ? » — `done: answered`. (4) `BatchChoiceQuestion` 4 rows (48 · 6 · 100 · 9) × (multiple de 12 / diviseur de 12 / ni l'un ni l'autre) — `done: answered`.
- **M3** (1) `NumberGrid` 1–50: « Colorie les 5 premiers multiples de 2 » then « Continuer le motif » auto-fills — `done: painted.size ≥ 5 && patternContinued`. (2) `TapQuestion` « Multiples de 5 et de 10 : quelle colonne ? » with the grid auto-showing both — `done: answered`. (3) grid reset, multiples of 3 with the digit-sum readout on each tap — `done: painted.size ≥ 5 && patternContinued`. (4) `BatchChoiceQuestion` 4 numbers (2 346 · 4 725 · 1 080 · 731) × divisible par (2 / 3 / 5 / 9 / 10) as multi-row batch — `done: answered`.
- **M4** (1) n=36: `done: stampedPairs.length === 5 || revealed` (escape after 6 attempts or 90 s: « Montre-moi les paires restantes »). (2) `TapQuestion` « À partir de combien de rangées les paires se répètent ? » correct 6 — `done: answered`. (3) n=24: `done: stampedPairs.length === 4 || revealed`. (4) n=13 then 21 then 23, « premier ou pas ? » decided by tapping « Bâton seulement » / « Autre rectangle » after trying rows — `done: verdicts.length === 3`.
- **M5** (1) `TapQuestion` prediction « Combien de nombres resteront après avoir barré les multiples de 2, 3, 5, 7 ? » (15) — `done: answered`. (2) prime chips 2·3·5·7 in any order; each strikes its multiples with a 400 ms stagger — `done: tappedPrimes.size === 4`. (3) `TapQuestion` « Pourquoi s'arrêter à 7 ? » correct « 11 × 11 dépasse 50 » — `done: answered`. (4) `BatchChoiceQuestion` reasoning: 1 premier ? · 2 premier ? · un pair > 2 premier ? · 51 premier ? — `done: answered`.
- **M6** (1) `FactorTree` 36 starting pair 4 × 9 — `done: tree.leaves.every(isPrime)`. (2) prediction `TapQuestion` « Avec 6 × 6 au départ, mêmes feuilles ? » then second tree — `done: predicted && tree2Complete` (sorted leaves shown side by side). (3) `FactorTree` 60 free pairs — `done: complete || revealed`. (4) `TapQuestion` written form of 60 with exponents (KaTeX options) — `done: answered`.
- **M7** (1) `PrimeVenn` 84 vs 126: tap the common primes → the fraction 84/126 divides by each tapped prime live → 2/3 — `done: commonSelected.size === 3 || revealed`. (2) `NumericQuestion` tile side for a 84 × 126 floor (42) with `explainFor(6)`, `explainFor(2)` — `done: answered`. (3) bus: `PrimeVenn` 12 vs 18 union → `NumericQuestion` minutes until next coincidence (36) with `explainFor(30)` (12+18), `explainFor(216)` — `done: answered`. (4) `TapQuestion` interpret « 7 h 36 » vs « 7 h 30 » vs « 8 h 12 » — `done: answered`.

### A4. Mathematical model — `components/divisibilityUtils.js`

Re-exports `formatDec, parseDec, roundTo` from `@smarter-academy/core` (for M7's fraction/time readouts). Canonical state per interaction: an integer `n` (1 ≤ n ≤ 999) plus the student's control (`rows`, `painted: Set<int>`, `tree`, `selectedPrimes: Set<int>`). Everything else is derived.

| Export | Signature | Invariant |
|---|---|---|
| `layoutRows` | `(n, rows) → { perRow, remainder, isRectangle }` | `perRow*rows + remainder === n`, `0 ≤ remainder < rows` |
| `isDivisor` / `isMultiple` | `(d, n) → boolean` / `(m, n) → boolean` | `isMultiple(m,n) === isDivisor(n,m)` |
| `divisors` | `(n) → number[]` sorted ascending | `divisors(n).length === divisorPairs(n)*2 − (isSquare?1:0)` |
| `divisorPairs` | `(n) → [a,b][]` with `a ≤ b`, ascending in a | `a*b === n`; last pair has `a ≥ √n` only once |
| `mirrorThreshold` | `(n) → number` = smallest r with r ≥ n/r | equals `Math.ceil(Math.sqrt(n))` behaviour tested against pairs |
| `isPrime` | `(n) → boolean` | `isPrime(1) === false`, `isPrime(2) === true` |
| `primesUpTo` | `(limit) → number[]` | matches sieve survivors |
| `sieveStrikes` | `(limit, p) → number[]` composites struck by p (multiples ≥ p²) | union over p ≤ √limit ∪ primes = 1..limit \ {1} |
| `primeFactors` | `(n) → number[]` multiset ascending | product equals n |
| `factorization` | `(n) → {p, e}[]` | derived from `primeFactors` only |
| `formatFactorization` | `(n, {latex}) → string` (« 2² × 3 × 5 » or `2^{2}\times 3\times 5`) | driven by `factorization`, never hand-typed |
| `factorPairOptions` | `(n) → [a,b][]` non-trivial (`1 < a ≤ b`) | subset of `divisorPairs` |
| `digitSum` | `(n) → number` | — |
| `criterion` | `(k) → { kind:'lastDigit'|'digitSum', digits?:number[], modulo?:number }` for k ∈ {2,3,5,9,10} | `divisibleByCriterion(n,k) === n % k === 0` for all n ≤ 10 000 |
| `divisibleByCriterion` | `(n, k) → boolean` | as above |
| `commonFactors` / `mergeMin` / `mergeMax` | `(fa, fb) → {p,e}[]` | `gcd(a,b) * lcm(a,b) === a*b` |
| `gcd` / `lcm` | `(a, b) → number` computed **from factorizations** (not Euclid) so the UI and the number agree | see above |
| `simplifyFraction` | `(num, den) → { num, den, dividedBy: number[] }` | `num/den` preserved |

**Unit tests (≥ 6):** (1) `layoutRows(36,5)` → `{7,1,false}`, `(36,6)` → `{6,0,true}`; (2) `divisors(36)` → `[1,2,3,4,6,9,12,18,36]`, `divisorPairs(36)` → 5 pairs, `mirrorThreshold(36) === 6`; (3) `isPrime` on 1, 2, 51, 57, 59, 91 → `false,true,false,false,true,false`; (4) `primesUpTo(50).length === 15` and equals sieve union survivors for p ∈ {2,3,5,7}; (5) `primeFactors(60)` → `[2,2,3,5]`, `formatFactorization(180)` → « 2² × 3² × 5 » and LaTeX variant; (6) `divisibleByCriterion` agrees with `%` for all n in 1..10000 for k ∈ {2,3,5,9,10}; (7) `gcd(84,126) === 42`, `lcm(12,18) === 36`, `gcd*lcm === a*b` on a property sample; (8) `simplifyFraction(84,126)` → `{2,3,[2,3,7]}`; (9) `factorPairOptions(36)` excludes `[1,36]` and includes `[6,6]` once.

### A5. Components (`components/`)

| Component | Props | Used by | Extends / adapts | Interactive nodes |
|---|---|---|---|---|
| `RectangleArray` (signature) | `n, rows, onRowsChange, stamped:[a,b][], onStamp, maxChip=10, revealAll, disabled, ariaLabel` | M1, M2 (read-only), M4, Synthèse (frozen) | New. Tiles are **static** SVG rects (`pointerEvents:'none'`, n ≤ 60 shown; n > 60 renders capped rows + « ×N » badge per playbook §10.5); controls are 10 chips + −/+ stepper + « Garder cette paire » | ≤ 13 |
| `NumberGrid` | `limit=50, cols=10, painted:Set, onToggle, struck:Set, highlightCols, readout:'digitSum'|null, disabled` | M3 (paint), M5 (strike via chips, cells non-interactive) | Adapts `6e/grandeurs_mesures/aires/components/AreaGrid.jsx` pattern (index set + `onToggle`) with number labels, strike state and readout | 50 (M3) / 4 chips (M5) |
| `PrimeChips` | `primes:[2,3,5,7], tapped:Set, onTap` | M5 | New, trivial | 4 |
| `FactorTree` | `root, tree:{value, children?}, onSplit(nodeId, pair), pairOptionsFor=factorPairOptions, revealAll` | M6, Synthèse (frozen) | New tap-first tree: composite leaves are `<button>`s with an amber dashed ring; tapping opens a chip row of `factorPairOptions`; primes lock emerald. Adapts the chip-picker idiom of `ProgramStrip` (tap card → append) | ≤ 8 leaf buttons + ≤ 6 chips |
| `PrimeVenn` | `a, b, selected:Set<prime>, onToggle, mode:'common'|'union', readout:'fraction'|'square'|'minutes'` | M7 | New; two chip rows from `factorization`, shared primes highlighted on tap; readout derived from `mergeMin`/`mergeMax` | ≤ 10 chips |
| `learningPoints.js` | literal LP mirror + `recommendedSlug` per LP | boss profile | house convention | — |

Shared reused as-is: `NumberLine` (mode `read`, M2), kit questions, `MathText` for exponent notation.

### A6. Boss — « La fête du collège »

`timerSeconds: 600`, `xpPerCorrect: 10`, ids `md-e1…md-e10`, QCM only.

| Épreuve | Skill → module | LP ids | Correct | Classic-mistake distractor |
|---|---|---|---|---|
| md-e1 « 36 = 4 × 9 : quelle phrase est vraie ? » | `relation` → M1 | P1 | « 36 est un multiple de 4 » | « 4 est un multiple de 36 » (direction) |
| md-e2 « 91 est-il un multiple de 7 ? » | `reconnaitre` → M2 | P2 | « Oui, 91 = 7 × 13 » | « Non, 91 est premier » |
| md-e3 « 4 725 est divisible par… » | `criteres` → M3 | P3 | « 3, 5 et 9 » | « 5 seulement » (last-digit only) · « 2 et 5 » |
| md-e4 « Combien de diviseurs a 28 ? » | `diviseurs` → M4 | P4 | 6 | 5 (forgot 1 or 28) · 3 (counted pairs) |
| md-e5 « Multiple commun de 6 et 8 ? » (14 · 36 · 48 · 68) | `multiples` → M2 | P5 | 48 | 14 (sum) · 36 (multiple of 6 only) |
| md-e6 « Lequel est premier ? 51 · 57 · 59 · 91 » | `premiers` → M5 | P6, P9 | 59 | 51, 57 (3-divisible), 91 (7×13) |
| md-e7 « Décomposition de 180 » (KaTeX options) | `decomposition` → M6 | P7 | 2² × 3² × 5 | 4 × 9 × 5 (non-prime leaves) · 2² × 45 |
| md-e8 « 84/126 simplifiée au maximum » | `utiliser` → M7 | P8 | 2/3 | 42/63 (partial) · 14/21 |
| md-e9 « n multiple de 12 ⇒ n multiple de… » (24 · 6 · 5 · 18) | `raisonner` → M5 | P9 | 6 | 24 (reversed inclusion) |
| md-e10 « Bus toutes les 12 et 18 min dès 7 h 00 : prochain départ commun ? » | `problemes` → M7 | P10, P8 | 7 h 36 | 7 h 30 (12+18) · 8 h 12 · 7 h 06 (gcd) |

Registre chips: « 36 chaises » · « Grille 1–50 » · « Arbre de 60 » · « Bus 12 / 18 ». Badges: 🏅 zero-miss per skill (`relation`, `reconnaitre`, `criteres`, `diviseurs`, `multiples`, `premiers`, `decomposition`, `utiliser`, `raisonner`, `problemes` — group into 7 badges by module) + 💎 « Sans faute ». Synthèse: frozen `RectangleArray` (36, five pairs stamped, mirror line at 6) + frozen `FactorTree` (60) + the three criteria lines, no new text.

### A7. Narrative thread / carried object

**La fête du collège**: the class prepares the fête — chairs to arrange (M1), tables of 4 (M2), raffle tickets numbered 1–50 (M3, M5), gift boxes to split (M4, M6), a floor to tile and two bus lines to catch (M7), the fête itself as the boss. Carried object: **the 36 chairs / the tile array**, which returns as the Synthèse. Vocabulary introduced exactly once: *diviseur/multiple* (M1), *critère* (M3), *nombre premier* (M4), *crible* (M5), *décomposition* (M6).

### A8. Risks

- **Grid density**: 1–50 at 10 columns on 375 px → cells ≈ 32 px; widen hit rects to 44 px with negative margins, or drop to 1–40 if collisions appear (primes to 40 still 12). M5 keeps cells non-interactive.
- **Exponent typography**: use `MathText` for `2^{2}\times 3\times 5` in options; unicode « 2² » only in prose. Keep `optionLabel` for boss review.
- **`RectangleArray` for n = 37 / 60**: static tiles fine; do not animate 60 nodes individually (single `motion` on the group, reduced-motion aware).
- **Stop-on-your-own (M4 step 1)**: the student may keep tapping rows 7–36 forever; the mirror hint appears after the first mirrored stamp, and the escape hatch at 6 non-new attempts.
- **Time readout in M7**: « 7 h 36 » must be formatted from minutes (36) by a util, never a string literal, to keep the `explainFor` traps consistent.

---

