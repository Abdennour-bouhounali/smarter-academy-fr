# 3e — Résolution de problèmes — Design & Implementation Spec (3e)

> Draft produced by the design pass on 2026-09-03. Sections follow LESSON_DESIGN_PLAYBOOK §15.3; the implementation record (§ Shipped state) is appended at the end of the build.

## C. `resolution-problemes-3e` — 🧠 · Difficile · prereqs : Calcul numérique, Calcul littéral, Équations, Proportionnalité

### C1. Central idea and misconception catalogue

**Central idea:** a problem is solved by choosing what x stands for, translating the story into an equality that says the same thing twice, solving it, then *returning to the story* to check and to answer in its words — the equation is a model of the situation, not the answer.

| # | Misconception | Detection | Visible consequence | Hint | Recovery |
|---|---|---|---|---|---|
| 1 | Keyword trap: « 3 ans de plus » → x − 3 or « 3 ans de plus que Tom » written on Tom | M3 `UnknownPicker`; boss e4 | `BarModel`: Léa's bar is *shorter* than Tom's although the text says she is older | « Qui est le plus âgé ? Regarde les barres » | Re-tap the relation card |
| 2 | « x, c'est la réponse » (x names the unknown asked, whatever it is) | M3: picks « la somme » as x, then cannot write the rest | The other quantities cannot be rewritten (cards greyed « impossible avec ce choix ») | « Choisis une quantité dont les autres dépendent » | Pick again — all valid choices lead somewhere |
| 3 | Number placed on the wrong side: 3x = 25 + 7 | M4 builder; boss e7 | Test probe x = 6: left 18, right 32 — not balanced; the source highlight shows « ajoute 7 » belongs to the left | « L'équation raconte l'histoire, pas sa résolution » | Rebuild |
| 4 | Assumes proportionality when there is a fixed part (« 2 fois plus de séances = 2 fois plus cher ») | M1 table; M5 strategy choice; boss e3 | The try-value table shows B: 2 séances 34 €, 4 séances 44 € — not doubled | « 24 € ne dépendent pas du nombre de séances » | Strategy chip reveal |
| 5 | Verifying in the last line (« 2x = 22, 2 × 11 = 22, c'est bon ») | M6 step 4; boss e9 | The check strip shows the story values (Tom 16, Léa 19 in 5 years → 35 ✓) vs a *wrong* x that still "checks" in a wrong last line | « Vérifier, c'est remettre x dans l'histoire » | Batch reveal |
| 6 | Answering only x when two quantities are asked / no unit / no sentence | M7 `AnswerBuilder` | The answer card stays incomplete (missing bricks visible) | « Quelle était la question ? » | Add the bricks |
| 7 | « 6,25 séances : le problème est faux » or « à partir de 6 » | M7 interpretation; boss e10 | The try table around 6 and 7 shows B becomes cheaper at 7 | « n est un nombre entier de séances » | Interpretation tap |
| 8 | Using every number in the statement (distractor data) | M2 `InfoSorter` | The sorter reveal lists the useful data and the trap | « Cette donnée ne répond pas à la question » | Formative reveal |

### C2. Signature interaction — **« Le Traducteur »** (`EquationBuilder`)

| Facet | Definition |
|---|---|
| Name | Le Traducteur (story on top, two equation slots, tap-cards of quantities and operations, a test probe) |
| Purpose | Make « traduire en équation » a construction whose every card points back to a fragment of the text |
| Concept | An equation models a situation: the left and right sides describe the *same quantity* in two ways; the solution is the x for which they coincide |
| Student action | Taps quantity cards (x, x + 3, 2x, 24, 5n, 9n…) and operation cards (+, ×, =) to fill the left and right slots; each card, when tapped, flashes the text fragment it came from; taps an x-chip on the test probe to see both sides evaluated |
| Visual behaviour | The statement's fragments highlight in the card's colour; the two slots render via `MathText`; the probe shows « pour x = 5 : gauche 23, droite 25 — pas encore égal »; when the student commits, equivalent forms (`isEquivalentEquation`) are accepted and normalised on reveal |
| Feedback | The probe *is* the feedback before commit (both sides are numbers, do they coincide?); on commit, a wrong equation is kept on screen, the story highlight shows where the mismatch is (e.g. « ajoute 7 » is on the wrong side), and the correct equation is revealed after the attempt cap |
| Discovery | Equations are sentences; the same story admits several correct equations; a number placed on the wrong side is *felt* through the probe |
| Mastery challenge | M4 step 3: the cinema forfait 9n = 24 + 5n built without highlighted fragments; M7: full run from text to answer |
| Why memorable | The student *speaks the equation*; the probe turns « est-ce que j'ai la bonne équation ? » into a test they can run themselves |

Returns in the boss Synthèse frozen with the forfait equation, its highlighted fragments and the ticked five-tab carnet.

**Candidate table:**

| Concept | Candidates | Verdict |
|---|---|---|
| Extracting information (P1, P2) | (a) read + MCQ · (b) **`InfoSorter` formative on a 3e statement + tap the question sentence in `ProblemText`** · (c) fill a blanks table | **(b)** — reuse of the shared sorter with `formative` + `onCheck={kit.react}`; the question-tap is the gesture that makes « la question » a distinct object |
| Choosing the unknown (P4, P7) | (a) « x est toujours ce qu'on cherche » rule · (b) **tap a quantity to name it x; the others rewrite themselves live** · (c) MCQ « que vaut x ? » | **(b)** — makes the *choice* visible and shows several valid entries; the keyword trap is caught by `BarModel` |
| Translating (P4, P6, P7) | (a) type the equation (MathLive) · (b) **tap-card assembly with fragment highlight and a test probe** · (c) choose among 4 equations | **(b)** signature; typing excluded; (c) survives as the boss format |
| Strategy (P3, P5) | (a) tell them « équation » · (b) **strategy chips + try-value table race that fails on 13,5** · (c) sort problems into strategy bins | **(b)** — the equation wins *because* the table fails, per « let the student experience the problem first »; proportionality keeps its own strategy |
| Organising the solving (P8) | (a) watch a worked solution · (b) **pick the next valid step from 3 cards; the `CalcChain` grows** · (c) free-form solving | **(b)** adapts `ProgramStrip`; distractor steps are the classic one-side operations |
| Verifying and interpreting (P9, P10) | (a) « vérifie ton résultat » text · (b) **check strip: plug x back into each story quantity** · (c) MCQ on plausibility | **(b)** + (c) for the non-integer and negative-age cases |
| Communicating (P11) | (a) free text · (b) **`AnswerBuilder` result + unit + sentence** · (c) MCQ best answer | **(b)** as in 6e — but the sentence options now include the *two* asked quantities |

### C3. Module architecture (9 modules · 85 min)

| # | Slug | Title | Stage | LPs taught | min | Unique responsibility | Aha | Main interaction |
|---|---|---|---|---|---|---|---|---|
| 0 | `mission-de-depart` | Mission de départ | prerequisite_check | — | 4 | 5 × 2 pts on prerequisites only: 2 + 3 × 4; value of 3x + 2 for x = 4; reduce 2x + 5 − x; solve 2x + 5 = 17; fourth proportional (3 → 12, 5 → ?) | — | kit diagnostic |
| 1 | `le-forfait-mystere` | Le forfait mystère | trigger | P1, P2, P4 | 8 | Create the need: two cinema plans (A 9 €/séance · B 24 € + 5 €/séance); trying values finds n = 6 slowly; one equation finds it in a line | « Essayer des valeurs marche… mais une équation trouve n en une ligne » | K (`TryValueTable`) |
| 2 | `lire-comme-un-detective` | Lire comme un détective | discovery | P1, P2 | 8 | Useful vs distractor data; the question as an object; the constraints (entier, positif) | « La question dit ce qu'on cherche ; les contraintes disent ce qu'on a le droit de trouver » | G (`InfoSorter` formative) + `ProblemText` tap |
| 3 | `choisir-linconnue` | Choisir l'inconnue | discovery | P4, P7 | 9 | Name x and rewrite the other quantities; keyword trap via bars; several valid choices | « Choisir x, c'est choisir par où on entre ; les autres quantités s'écrivent avec x » | I (`UnknownPicker` rewrite) + `BarModel` |
| 4 | `le-traducteur` | Le Traducteur | manipulation | P4, P6, P7 | 11 | Signature: build three equations (périmètre, programme de calcul, forfait) with fragment highlight and probe | « L'équation est une phrase : gauche et droite racontent la même quantité » | H/J (`EquationBuilder` + probe) |
| 5 | `deux-strategies-un-resultat` | Deux stratégies, un résultat | manipulation | P3, P5 | 9 | Choose the strategy per situation (proportionality, direct calculation, try-values, equation); the race where try-values miss 13,5 | « Toute situation n'a pas besoin d'une équation ; quand le résultat n'est pas rond, l'équation gagne » | G (`StrategyChips`) + K (`TryValueTable`) |
| 6 | `resoudre-et-verifier` | Résoudre et vérifier | formalization | P8, P9, P11 | 10 | Order the solving steps; verify *in the story*; the « À retenir » five-tab carnet | « Vérifier, c'est remettre la valeur dans l'histoire, pas dans la dernière ligne » | B (`SolutionStrip`) + `CheckStrip` |
| 7 | `le-labo-de-modelisation` | Le labo de modélisation | practice_lab | P10, P11, P9, P5 | 11 | Full runs; non-integer interpretation (n = 6,25 → dès 7 séances); plausibility (negative age rejected); complete argued answer | « Un résultat non entier n'est pas faux : il faut l'interpréter dans le contexte » | H (`EquationBuilder`) + `AnswerBuilder` |
| 8 | `mission-finale-le-carnet-complet` | 🏆 Mission finale | evaluation | — | 15 | 10 QCM, badges, Synthèse | — | kit `BossFinal` |

Sum 4+8+8+9+11+9+10+11+15 = **85** ✓.

**Steps and `done` predicates**

- **M1** (1) `TapQuestion` prediction « Pour 4 séances, lequel est moins cher ? » — `done: predicted`. (2) `TryValueTable` n chips 1–8: `done: testedValues.size ≥ 4 && testedValues.has(6)` (chip 6 pulses after 3 tests). (3) reveal card: the equation 9n = 24 + 5n and its one-line solve, `TapQuestion` « que représente n ? » — `done: answered`. (4) `TapQuestion` « Avec la carte à 25 €, la méthode "essais" trouve-t-elle une égalité ? » (non — sets up M7) — `done: answered`.
- **M2** (1) `InfoSorter` `formative` on the crêpes statement (7 items, 2 distractors) — `done: checked`. (2) `ProblemText`: « Touche la phrase qui pose la question » — `done: tappedFragment !== null` (wrong tap reveals). (3) `BatchChoiceQuestion` constraints (n entier ? n positif ? n peut dépasser 100 ?) — `done: answered`. (4) `TapQuestion` « Quelle information manque pour répondre ? » — `done: answered`.
- **M3** (1) `UnknownPicker` ages: tap « âge de Tom » → cards rewrite (Léa = x + 3, dans 5 ans x + 5 and x + 8) — `done: chosen !== null`. (2) `BarModel` prediction « Quelle barre est la plus longue ? » `TapQuestion` — `done: answered`. (3) `UnknownPicker` again with « âge de Léa » as x → Tom = x − 3 (both valid) — `done: chosen === 'lea'` (guided). (4) `BatchChoiceQuestion` translate 4 relations (« 3 de plus », « le double », « 5 de moins », « la moitié ») — `done: answered`.
- **M4** (1) `EquationBuilder` périmètre (width x, length x + 4, P = 40), highlighted fragments — `done: committed` (accepted if `isEquivalentEquation`; reveal after 3). (2) programme de calcul 3x + 7 = 25 — `done: committed`. (3) forfait 9n = 24 + 5n without highlights (EXPLORE) — `done: committed`. (4) probe: `TapQuestion` « pour quel n gauche = droite ? » after tapping ≥ 2 x-chips — `done: probed ≥ 2 && answered`.
- **M5** (1) `StrategyChips` on 3 mini-situations (crêpes → proportionnalité; prix de 3 articles → calcul direct; périmètre P = 62 → équation) — `done: choices.length === 3` (reveal each). (2) `NumericQuestion` crêpes 250 g pour 4 → 7 personnes (437,5, `parse=parseDec`, `explainFor(1750)`, `explainFor(375)`) — `done: answered`. (3) `TryValueTable` for 4x + 8 = 62 (misses 13,5; chip « 13,5 » unavailable) then `TapQuestion` « pourquoi le tableau échoue ? » — `done: testedValues.size ≥ 3 && answered`. (4) `NumericQuestion` x for P = 62 (13,5 with `parseDec`) — `done: answered`.
- **M6** (1) `SolutionStrip` for 2x + 13 = 35: pick the next step among 3 cards (distractors: « diviser 35 par 2 », « retirer 13 à gauche seulement ») × 3 rounds → `CalcChain` grows — `done: strip.length === 3 || revealed`. (2) `CheckStrip`: tap x = 11 → Tom 11, Léa 14, dans 5 ans 16 + 19 = 35 ✓ — `done: checked`. (3) `BatchChoiceQuestion` « quelle vérification est valable ? » — `done: answered`. (4) « À retenir » carnet (5 tabs ticked) — `done: true` after step 3.
- **M7** (1) forfait with card 25 €: `EquationBuilder` → `NumericQuestion` n (6,25 `parseDec`) → `TapQuestion` interpretation « dès 7 séances » — `done: committed && answered && interpreted`. (2) ages variant with an impossible datum (sum 15 → x = 1 then a negative variant) `TapQuestion` plausibility — `done: answered`. (3) rectangle P = 40: `AnswerBuilder` value 8, unit cm, sentence naming *both* dimensions — `done: built`. (4) `InfoSorter` formative on a new statement + `TapQuestion` strategy → `AnswerBuilder` — `done: checked && built`.

### C4. Mathematical model — `components/problemUtils.js`

State: a linear form `Lin = { a: number, b: number }` meaning `a·x + b`; a card `{ id, latex, value: Lin, fragmentId }`; an equation `{ left: Lin, right: Lin }` (sides built by folding cards with `+`, `×k`); a problem `{ id, text, fragments:[{id, text}], quantities:[{id, label, lin(x-choice)}], constraints:{ integer, min, max, unit } }`.

| Export | Signature | Invariant |
|---|---|---|
| `lin` / `addLin` / `scaleLin` / `subLin` | constructors and arithmetic on `Lin` | `evalLin(addLin(p,q),x) === evalLin(p,x)+evalLin(q,x)` |
| `evalLin` | `(l, x) → number` | — |
| `foldCards` | `(cards, ops) → Lin | null` (null on malformed sequence) | — |
| `solveLinear` | `({left,right}) → {kind:'unique', x} | {kind:'none'} | {kind:'all'}` | `evalLin(left,x) === evalLin(right,x)` when unique |
| `isEquivalentEquation` | `(eq1, eq2) → boolean` (same solution set) | symmetric; `2x + 2(x+4) = 40` ≡ `4x + 8 = 40` |
| `sameLin` | `(p, q) → boolean` | — |
| `tryTable` | `(eq, xs) → { x, left, right, equal, diff }[]` | `equal` ⇔ `diff === 0` (rounded via `roundTo`) |
| `planCost` | `(fixed, perUnit, n) → number` | — |
| `interpret` | `(x, constraints) → { ok, kind:'exact'|'ceil'|'floor'|'reject', value, reason }` (6,25 with integer → ceil 7 for a « à partir de » question; negative age → reject) | — |
| `storyValues` | `(problem, choiceId, x) → {id, label, value}[]` | consistent with `quantities` |
| `rewriteQuantities` | `(problem, choiceId) → {id, label, lin}[]` | for every valid choice the rewrite exists; invalid choices return null |
| `nextValidSteps` | `(eq) → { label, eq }[]` (subtract b both sides, divide by a both sides…) | each result is `isEquivalentEquation` to the input |
| `formatLin` / `formatEquation` | `→ LaTeX` | zero and one coefficients handled |
| `formatDec, parseDec, roundTo` | re-exports | — |

**Unit tests (≥ 6):** (1) `solveLinear(9n = 24 + 5n)` → 6; `(9n = 25 + 5n)` → 6,25; (2) `isEquivalentEquation(2x + 2(x+4) = 40, 4x + 8 = 40)` true, and false vs `3x = 25 + 7`; (3) `tryTable(4x + 8 = 62, [10,12,14])` never equal; `[13.5]` equal; (4) `interpret(6.25, {integer:true, min:0})` → ceil 7 reason « dès 7 séances »; `interpret(-2, {min:0})` → reject; (5) `rewriteQuantities(ages, 'tom')` → Léa `x + 3`, sum in 5 years `2x + 13`; with `'lea'` → Tom `x − 3`; with `'somme'` → null; (6) `storyValues(ages, 'tom', 11)` → 16 + 19 = 35; (7) `nextValidSteps(2x + 13 = 35)` contains « −13 des deux côtés » giving `2x = 22`, and all outputs equivalent; (8) `planCost(24, 5, 4) === 44` (not 68); (9) `formatEquation` of `{a:9,b:0}` = `{a:5,b:24}` → `9n = 5n + 24` with a chosen variable letter.

### C5. Components

| Component | Props | Used by | Extends / adapts | Interactive nodes |
|---|---|---|---|---|
| `EquationBuilder` (signature) | `problem, cards, left:Card[], right:Card[], onTap(card), onRemove(side,i), onCommit, expected:Eq, showHighlights, probeXs, probed:Set, onProbe, revealed, disabled` | M4, M7, Synthèse | Adapts `ProgramStrip` (tap-to-append, ✕ to remove, no drag) with two slots and a `MathText` rendering; probe reuses `tryTable` | ≤ 10 cards + 2 slot rows + ≤ 4 probe chips ≈ 18 |
| `ProblemText` | `fragments, highlighted:Set, tappable, onTapFragment, mode:'question'|'source'` | M2, M4, M7 | New; fragments as inline `<button>`s only in `question` mode | ≤ 8 |
| `TryValueTable` | `rows:{label, lin}[], xs, tested:Set, onTest, unit, settleMs` | M1, M5 | Sibling of lesson B's `ValueTester` (same shape; keep lesson-local copies per the périmètres precedent, or promote to `common/components/` if both ship — user decision) | ≤ 8 chips |
| `UnknownPicker` | `problem, chosen, onChoose, rewrites` | M3 | New; quantity rows as tap cards, rewrite via `rewriteQuantities` | ≤ 4 |
| `StrategyChips` | `situations, choices, onChoose, strategies:['proportionnalite','calcul-direct','essais','equation']` | M5 | New, trivial chip rows | ≤ 12 |
| `SolutionStrip` | `eq, steps:Step[], offered:Step[], onPick, revealed` | M6 | Adapts `ProgramStrip`; `CalcChain` (shared) renders the growing chain | ≤ 3 offered + strip |
| `CheckStrip` | `problem, choiceId, x, onCheck` | M6, M7 | New display + one button; values from `storyValues` | 1 |

Shared reused as-is: `InfoSorter` (`formative`, `onCheck={kit.react}`), `BarModel`, `CalcChain`, `AnswerBuilder`, `MathText`, kit questions.

### C6. Boss — « Le carnet complet »

ids `rp-e1…rp-e10`.

| Épreuve | Skill → module | LP ids | Correct | Classic-mistake distractor |
|---|---|---|---|---|
| rp-e1 « Quelle donnée est inutile ? » (crêpes statement) | `lire` → M2 | P1 | the distractor datum | a useful datum that "looks" decorative |
| rp-e2 « Que doit vérifier n (séances) ? » | `lire` → M2 | P2 | « entier et positif » | « n'importe quel nombre » |
| rp-e3 « 250 g pour 4 personnes, 7 personnes : quelle stratégie ? » | `strategie` → M5 | P3 | « proportionnalité » | « équation » · « essais » |
| rp-e4 « Léa a 3 ans de plus que Tom (x). Âge de Léa ? » | `inconnue` → M3 | P4, P7 | x + 3 | x − 3 · 3x |
| rp-e5 « 250 g pour 4 → 7 personnes » | `nombres` → M5 | P5 | 437,5 g | 1 750 g (×7) · 62,5 g (per person) · 375 g |
| rp-e6 « Périmètre du rectangle x et x + 4 » | `litteral` → M4 | P6 | 4x + 8 | 2x + 4 · x² + 4x · 4x + 4 |
| rp-e7 « Je choisis x, je multiplie par 3, j'ajoute 7, j'obtiens 25 » | `equation` → M4 | P7 | 3x + 7 = 25 | 3(x + 7) = 25 · 3x = 25 + 7 |
| rp-e8 « 4x + 8 = 40 : première étape valable ? » | `etapes` → M6 | P8 | « retirer 8 des deux côtés » | « diviser 40 par 4 » · « retirer 8 à gauche » |
| rp-e9 « x = 11 : comment vérifier ? » | `verifier` → M6 | P9 | « recalculer les deux âges dans 5 ans et additionner » | « remplacer dans 2x = 22 » |
| rp-e10 « 9n = 25 + 5n donne n = 6,25. Conclusion ? » | `interpreter` → M7 | P10, P11 | « Dès 7 séances, B est moins cher » | « 6,25 séances » · « jamais » · « dès 6 » |

Registre chips: « Cinéma 24 € + 5 € » · « Tom et Léa » · « Rectangle P = 40 » · « Crêpes 250 g ». Badges: 🏅 per skill (`lire`, `strategie`, `inconnue`, `nombres`, `litteral`, `equation`, `etapes`, `verifier`, `interpreter`) + 💎. Synthèse: frozen `EquationBuilder` (forfait, fragments highlighted) above the ticked five-tab carnet (Lire · Inconnue · Équation · Résoudre · Vérifier/Répondre) and a frozen `CheckStrip`.

### C7. Narrative thread / carried object

**Le Carnet de modélisation**: a five-tab notebook the student fills; each module owns one tab (M2 Lire, M3 Inconnue, M4 Équation, M5/M6 Résoudre, M6/M7 Vérifier-Répondre) and M7 runs the full carnet. Situations recur rather than multiply: the cinema forfait (M1, M4, M7 twist), Tom and Léa (M3, M6, M7), the rectangle (M4, M5, M7), the crêpes (M2, M5). Vocabulary once: *donnée utile/inutile* (M2), *inconnue* (M3), *modéliser/équation* (M4), *stratégie* (M5), *vérifier/interpréter* (M6–M7).

### C8. Risks

- **Text density on mobile**: 3e statements are long; `ProblemText` must wrap at ≤ 4 lines with fragments ≥ 44 px tall; keep statements ≤ 45 words.
- **Equivalent-equation acceptance**: the builder must accept any `isEquivalentEquation` form (2(x + x + 4) = 40 vs 4x + 8 = 40) — otherwise the module becomes a "guess my form" trap; but *not* accept the solved form (x = 8) as a translation — check `left`/`right` both come from story cards.
- **Decimal answers**: 437,5 · 13,5 · 6,25 — every `NumericQuestion` in M5/M7 uses `parse={parseDec}`; e2e must assert the decimal reveal.
- **Card explosion**: cap the palette at 10 cards per builder task; distractor cards (x − 3, 3x) count toward it.
- **Prerequisite drift**: solving is a *prerequisite*; if the diagnostic shows a gap, `requiresLearningPointIds` is not used (no gating) — the boss profile's « Revoir » points to M6, and copy links to the `equations-produit` lesson.
- **Overlap with 6e `resolution-problemes`**: no arithmetic bar-model problems; every task carries an x or a strategy decision. Do not copy its `_archive_original`.

---

## Shipped state (2026-09-04)

La leçon `resolution-problemes-3e` est complète : 9 modules, 85 min, 11/11 LPs
couverts, 93/93 e2e, zéro erreur de validation imputable à la leçon.

### Fichiers

`apps/web/src/lessons/college/3e/nombres_calculs/resolution-problemes-3e/`

| Fichier | État |
|---|---|
| `lesson.config.js`, `moduleContext.js`, `index.jsx`, `routes.jsx` | déjà livrés (passe précédente) |
| `components/problemUtils.js` + `.test.js` | déjà livrés — 170 tests verts sur le chapitre |
| `components/{EquationBuilder,ProblemText,UnknownPicker,StrategyChips,SolutionStrip,CheckStrip}.jsx`, `learningPoints.js` | déjà livrés |
| `components/problemsData.js` | **corrigé** : `RECTANGLE_62` redéclare ses `fragments` (voir « Écarts ») |
| `modules/Module01ForfaitMystere.jsx` … `Module04Traducteur.jsx` | déjà livrés |
| `modules/Module00Diagnostic.jsx` | **créé** |
| `modules/Module05DeuxStrategies.jsx` | **créé** |
| `modules/Module06ResoudreVerifier.jsx` | **créé** |
| `modules/Module07LaboModelisation.jsx` | **créé** |
| `modules/Module08MissionFinale.jsx` | **créé** (boss, écrit en dernier) |
| `apps/web/e2e/lesson-kit/3e-resolution-problemes.mjs` | **créé** — 93 assertions |

### Modules livrés

| # | Slug | Stage | LPs | min |
|---|---|---|---|---|
| 0 | `mission-de-depart` | prerequisite_check | — | 4 |
| 1 | `le-forfait-mystere` | trigger | P1, P2, P4 | 8 |
| 2 | `lire-comme-un-detective` | discovery | P1, P2 | 8 |
| 3 | `choisir-linconnue` | discovery | P4, P7 | 9 |
| 4 | `le-traducteur` | manipulation | P4, P6, P7 | 11 |
| 5 | `deux-strategies-un-resultat` | manipulation | P3, P5 | 9 |
| 6 | `resoudre-et-verifier` | formalization | P8, P9, P11 | 10 |
| 7 | `le-labo-de-modelisation` | practice_lab | P10, P11, P9, P5 | 11 |
| 8 | `mission-finale-le-carnet-complet` | evaluation | — | 15 |

Total **85 min** ✓. Couverture boss : P1 (e1), P2 (e2), P3 (e3), P4 (e4, e7),
P5 (e5), P6 (e6), P7 (e4, e7), P8 (e8), P9 (e9), P10 + P11 (e10) — 11/11.

### Écarts par rapport au spec (assumés)

1. **M6 étape 1 : deux tours au lieu de trois.** Le spec annonçait
   `done: strip.length === 3`. Or `nextValidSteps(2x + 13 = 35)` n'offre qu'UNE
   étape valable par tour, et la chaîne complète est
   `2x + 13 = 35 → 2x = 22 → x = 11`, soit **deux** transformations. Inventer un
   troisième tour aurait demandé une étape valable fabriquée à la main, donc un
   facteur magique hors modèle. La réduction `(x + 5) + (x + 8) → 2x + 13` est
   donc présentée en texte au-dessus de la bande, et la bande porte les deux
   vraies étapes. `done: picked.length === 2 || revealed`.
2. **`RECTANGLE_62.fragments` (correction de données).** L'objet était construit
   par spread de `RECTANGLE` sans redéclarer `fragments` : le module 5 affichait
   « Son périmètre mesure **40** cm. Quelles sont ses **dimensions** ? » au-dessus
   d'une question portant sur le périmètre 62 et la largeur. Les fragments
   corrects sont désormais déclarés explicitement, avec un commentaire expliquant
   le piège du spread, et l'e2e porte une assertion de non-régression.
3. **`Carnet` exporté depuis `Module06ResoudreVerifier.jsx`.** Le carnet à cinq
   onglets est l'objet porté par la leçon (spec C7) ; il est défini dans le module
   qui le formalise et réimporté figé (`ticked={5}`) par la synthèse du boss,
   plutôt que dupliqué.
4. **`PrerequisiteDiagnostic` ne rend pas `renderOption`.** Le moteur du kit
   affiche `q.options[i]` en texte brut (y compris dans la correction) : les
   questions 3 et 4 du module 0 utilisent donc des options texte
   (« x + 5 », « x = 6 ») et non des chaînes LaTeX.

### Portes (gates)

| Porte | Résultat |
|---|---|
| esbuild (5 modules + `problemsData.js`) | OK |
| `npx vitest run src/lessons/college/3e/nombres_calculs` | **170 tests verts** (7 fichiers) |
| `npm run validate:lessons` | `3e:resolution-problemes-3e: 11/11 learning points covered`, **zéro ligne d'erreur** imputable à la leçon (54 erreurs / 53 avertissements, toutes dans d'AUTRES leçons) |
| `npm run build` (racine) | ✓ built |
| Playwright `3e-resolution-problemes.mjs` (port 5203) | **93/93 passed**, zéro erreur console/page |
| Passe mobile 375×667 (M1, M4, M5, M6, M7, boss) | pas de scroll horizontal, cibles ≥ 40 px |

Réserve mobile connue, hors périmètre : l'interrupteur de minuterie du boss
(`LessonUI` `Toggle`, `h-7 w-12` = 28 px) est un composant PARTAGÉ, identique dans
toutes les leçons du kit ; le contrôle e2e des cibles tactiles l'exclut
explicitement plutôt que de modifier un composant commun.

